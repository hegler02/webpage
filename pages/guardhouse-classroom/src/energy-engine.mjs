// Weather, sun and a teaching-sized energy balance shared by every sample.
// Steady state, hour by hour: no heat stored in walls, no humidity load. Results are estimates for learning, not compliance.
const R=Math.PI/180,MONTH_DAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
export const monthStart=MONTH_DAYS.map((_,m)=>MONTH_DAYS.slice(0,m).reduce((a,b)=>a+b,0));
export const dayOfYear=(month,day)=>monthStart[month-1]+day;
export const monthOfDay=day=>{let m=0;while(m<11&&day>monthStart[m+1])m++;return m;};

// Sun altitude and azimuth (degrees, azimuth clockwise from north) at a local clock time.
export function sunPosition(day,clock,{lat,lon,tz}){
 const g=2*Math.PI/365*(day-1+(clock-12)/24);
 const eot=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const dec=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
 const solar=clock*60+eot+4*lon-60*tz,ha=(solar/4-180)*R,phi=lat*R;
 const cz=Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(ha),zen=Math.acos(Math.max(-1,Math.min(1,cz)));
 let az=Math.acos(Math.max(-1,Math.min(1,(Math.sin(phi)*cz-Math.sin(dec))/(Math.cos(phi)*Math.sin(zen)||1e-9))))/R;
 az=ha>0?(az+180)%360:(540-az)%360;
 return {altitude:90-zen/R,azimuth:az};
}
// Unit vector toward the sun in plan axes: x east, y north, z up.
export function sunVector({altitude,azimuth}){const a=altitude*R,z=azimuth*R;return [Math.sin(z)*Math.cos(a),Math.cos(z)*Math.cos(a),Math.sin(a)];}

const FACING={S:180,E:90,N:0,W:270};
// Sunlight on a surface: direct beam by angle, sky light by how much sky it sees, light reflected from the ground.
export function surfaceSun(sun,tilt,facing,{dni,dhi,ghi},ground=.2){
 const s=sunVector(sun),t=tilt*R,f=facing*R,n=[Math.sin(t)*Math.sin(f),Math.sin(t)*Math.cos(f),Math.cos(t)];
 const cos=s[0]*n[0]+s[1]*n[1]+s[2]*n[2];
 return Math.max(0,sun.altitude>0?dni*cos:0)+dhi*(1+Math.cos(t))/2+ghi*ground*(1-Math.cos(t))/2;
}

// U-value of a layered wall, roof or floor: U = 1 / (Rsi + Σ d/λ + Rse).
export function uValue(layers,{rsi,rse}){const parts=layers.map(l=>({...l,r:l.r??l.thickness/1000/l.lambda}));const total=rsi+rse+parts.reduce((a,l)=>a+l.r,0);return {u:1/total,total,parts};}

// The hourly balance for one year.
export function simulate(weather,b){
 const hours=weather.t.length,H=b.surfaces.reduce((a,s)=>a+s.area*s.u*(s.b??1),0),Hv=.34*b.ach*b.volume,Htot=H+Hv;
 const glazing=b.surfaces.filter(s=>s.g);
 const months=Array.from({length:12},()=>({heat:0,cool:0,heatElec:0,coolElec:0,light:0,equip:0,pv:0,solar:0}));
 let peak={heat:0,cool:0,elec:0},peakAt={heat:0,cool:0,elec:0},pvYear=0,poaYear=0;const hourly=new Float32Array(hours);
 for(let i=0;i<hours;i++){
  const day=Math.floor(i/24)+1,clock=i%24+.5,m=monthOfDay(day),sun=sunPosition(day,clock,weather);
  const sky={dni:weather.dni[i],dhi:weather.dhi[i],ghi:weather.ghi[i]},tout=weather.t[i]/10;
  const solar=glazing.reduce((a,s)=>a+s.area*b.glassShare*s.g*surfaceSun(sun,90,FACING[s.facing],sky),0);
  const dark=sky.ghi<b.lightBelow,light=dark?b.lightWatts:0;
  const gains=solar+light+b.equipWatts+b.peopleWatts;
  let heat=Math.max(0,Htot*(b.heatSet-tout)-gains),cool=0;
  if(!heat){const free=tout+gains/Htot;cool=Math.max(0,Htot*(free-b.coolSet));}
  const poa=surfaceSun(sun,b.pv.tilt,FACING.S,sky),pv=b.pv.kwp*poa/1000*b.pv.ratio*1000;
  const heatElec=heat/b.heatCop,coolElec=cool/b.coolCop,elec=heatElec+coolElec+light+b.equipWatts;
  hourly[i]=elec;const o=months[m];o.heat+=heat;o.cool+=cool;o.heatElec+=heatElec;o.coolElec+=coolElec;o.light+=light;o.equip+=b.equipWatts;o.pv+=pv;o.solar+=solar;pvYear+=pv;poaYear+=poa;
  for(const [k,v] of [['heat',heat],['cool',cool],['elec',elec]])if(v>peak[k]){peak[k]=v;peakAt[k]=i;}
 }
 const kwh=w=>w/1000,year=Object.fromEntries(Object.keys(months[0]).map(k=>[k,kwh(months.reduce((a,o)=>a+o[k],0))]));
 return {H,Hv,Htot,hourly,months:months.map(o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,kwh(v)]))),year,peak,peakAt,pvYield:b.pv.kwp?year.pv/b.pv.kwp:0,poaYear:poaYear/1000};
}

// One readable hour: weather, sun and what each part of the building does at that moment.
export function hourAt(weather,b,day,hour){
 const i=Math.min(weather.t.length-1,(day-1)*24+Math.max(0,Math.min(23,Math.round(hour-.5)))),sun=sunPosition(day,hour,weather);
 const sky={dni:weather.dni[i],dhi:weather.dhi[i],ghi:weather.ghi[i]};
 return {i,sun,tout:weather.t[i]/10,rh:weather.rh[i],wind:weather.wind[i]/10,...sky,faces:Object.fromEntries(Object.entries(FACING).map(([k,f])=>[k,surfaceSun(sun,90,f,sky)])),roof:surfaceSun(sun,0,0,sky)};
}

// Design-day loads used to size equipment: coldest night with no sun or people, hottest afternoon with full sun.
export function designLoads(weather,b,result){
 const heat=(b.surfaces.reduce((a,s)=>a+s.area*s.u*(s.b??1),0)+.34*b.ach*b.volume)*(b.heatSet-weather.design.heating996);
 return {heat,cool:result.peak.cool,heatOut:weather.design.heating996,coolOut:weather.design.cooling04};
}
