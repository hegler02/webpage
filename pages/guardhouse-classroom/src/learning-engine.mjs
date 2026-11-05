import {circuitDemand, fitsSupport, attachCords, restoreOutletAllowance} from './teaching-equipment.mjs';
import {embeddedEntry} from './electrical-installation.mjs';
import {project,boundsOf,insideElement} from './classroom-project.mjs';

export const freshExercise=()=>({version:1,equipmentVersion:1,power:true,switches:{SW1:true,SW2:true,SW3:true,SW4:true,TL1:true},breakers:Object.fromEntries(project.circuits.map(c=>[c.id,true])),watts:{},positions:{},completed:[]});
export function restoreExercise(raw){
 const s=freshExercise();if(raw?.version!==1)return s;
 if(typeof raw.power==='boolean')s.power=raw.power;
 for(const id of Object.keys(s.switches))if(typeof raw.switches?.[id]==='boolean')s.switches[id]=raw.switches[id];
 for(const id of Object.keys(s.breakers))if(typeof raw.breakers?.[id]==='boolean')s.breakers[id]=raw.breakers[id];
 for(const d of project.devices){const w=raw.watts?.[d.id];if(d.watts&&Number.isFinite(w)&&w>=(d.id==='R01'?0:1)&&w<=3000)s.watts[d.id]=w;const p=raw.positions?.[d.id];if((d.kind==='light'||d.support)&&Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&validLightPosition(d,p))s.positions[d.id]=p;}
 restoreOutletAllowance(s,raw,project.devices.find(d=>d.socket));
 s.completed=[...new Set((Array.isArray(raw.completed)?raw.completed:[]).filter(id=>project.steps.some(t=>t.id===id)))];return s;
}
export function validLightPosition(d,p){if(d.support)return fitsSupport(d,p);const b=project.rooms.find(r=>r.id===d.room)?.bounds;return !!b&&p[0]>b[0]+d.size[0]/2&&p[0]<b[2]-d.size[0]/2&&p[1]>b[1]+d.size[1]/2&&p[1]<b[3]-d.size[1]/2;}
export function devicesFor(s){return [project.panel,...project.devices].map(d=>({...d,pos:s.positions[d.id]?[...s.positions[d.id],d.pos[2]]:[...d.pos],watts:s.watts[d.id]??d.watts,...(d.kind==='light'?{lumens:(s.watts[d.id]??d.watts)*100}:{})}));}
export const routeLength=points=>points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(...p.map((v,j)=>v-points[i][j])),0);
function clean(points){return points.filter((p,i)=>!i||Math.hypot(...p.map((v,j)=>v-points[i-1][j]))>1e-6);}
export function routeTo(d){
 const a=project.panel.pos, [x,y,z]=d.pos, common=[...embeddedEntry(project.panel,2.48),[a[0],1.3,2.48]];
 const via=d.room==='storage'?[[4.6,1.3,2.48],[4.2,1.3,2.48],[x,1.3,2.48]]:
 d.room==='pantry'?[[4.65,1.3,2.48],[4.65,2.35,2.48],[3.7,2.35,2.48],[x,2.35,2.48]]:
 d.room==='toilet'?[[4.65,1.3,2.48],[4.65,2.35,2.48],[3.7,2.35,2.48],[3.7,2.35,2.05],[2.3,2.35,2.05],[1.3,2.35,2.05],[1.3,2.35,2.38],[x,2.35,2.38]]:
 [[x,1.3,2.48]];
 const h=d.room==='toilet'?2.38:2.48;
 const entry=embeddedEntry(d,h);
 return clean([...common,...via,...(entry?[...entry].reverse():[[x,y,h],[x,y,z]])]);
}
export function electricalModel(s){
 const devices=attachCords(devicesFor(s));
 const routes=devices.filter(d=>d.circuit&&!d.socket).map(d=>({id:'route-'+d.id,name:d.name+' 전선관',kind:'conduit',circuit:d.circuit,target:d.id,points:routeTo(d),conductors:d.kind==='switch'?['L','L′']:['L','N','PE'],diameter:.016}));
 const circuits=project.circuits.map(c=>{
  const {loads,watts,current}=circuitDemand(devices,c,project.voltage);
  const longest=Math.max(0,...routes.filter(r=>r.circuit===c.id).map(r=>routeLength(r.points)));
  // Conservative common-current bound: the total circuit current is applied to the longest route.
  // Resistive educational model, copper rho at 20 C, reactance omitted; not a cable-table compliance claim.
  const drop=2*.0175*longest*current/c.area,checks={current:current<=c.breaker,coordination:c.breaker<=c.ampacity,drop:drop/project.voltage*100<=3};
  return {...c,watts,current,length:longest,drop,percent:drop/project.voltage*100,checks,pass:Object.values(checks).every(Boolean),loads:loads.map(d=>d.id)};
 });
 const active=d=>s.power&&s.breakers[d.circuit]!==false&&circuits.find(c=>c.id===d.circuit)?.checks.current&&(!d.switch||s.switches[d.switch]!==false);
 return {devices:devices.map(d=>({...d,on:d.watts?active(d):d.kind==='switch'?s.switches[d.id]:false})),routes,circuits,watts:circuits.reduce((n,c)=>n+c.watts,0),activeWatts:devices.filter(d=>d.watts&&active(d)).reduce((n,d)=>n+d.watts,0)};
}

// Educational gravity-load model: 1 m strip, simply supported slab; no global frame analysis.
// Reinforcement section is circular nominal diameter. Constants are explicit lesson conditions.
export const structuralConditions={fc:24,fy:400,steelDesign:400/1.15,concreteWeight:24,coverSlab:25,coverWall:30,coverFoundation:50,soilPressure:100,deadFactor:1.35,liveFactor:1.5,liveRoof:1,liveFloor:3,finishRoof:1.5,finishFloor:1,elasticModulus:27000};
export function slabCalculation({span=3.8,thickness=150,cover=25,diameter=10,spacing=150,live=1,finish=1.5,cantilever=false}={}){
 for(const n of [span,thickness,cover,diameter,spacing,live,finish])if(!Number.isFinite(n)||n<0)throw new Error('계산 조건은 유효한 양수여야 합니다.');
 if(spacing===0||span===0||thickness<=cover+diameter/2)throw new Error('철근 간격과 유효 깊이를 확인해 주세요.');
 const c=structuralConditions,dead=thickness/1000*c.concreteWeight+finish,w=c.deadFactor*dead+c.liveFactor*live,M=w*span**2/(cantilever?2:8),V=w*span/(cantilever?1:2);
 const d=thickness-cover-diameter/2,z=.9*d,As=Math.PI*diameter**2/4*1000/spacing,required=M*1e6/(c.steelDesign*z),resistance=As*c.steelDesign*z/1e6;
 const deflection=(cantilever?1/8:5/384)*(dead+live)*(span*1000)**4/(c.elasticModulus*(1000*thickness**3/12));
 return {span,thickness,cover,diameter,spacing,live,finish,dead,w,M,V,d,z,As,required,resistance,deflection,utilization:M/resistance,pass:resistance>=M,model:cantilever?'한쪽 고정 캔틸레버':'양 끝 지지 1 m 폭 띠'};
}
export function structuralCalculation(model){
 const roof=slabCalculation(),floor=slabCalculation({live:3,finish:1}),pit=slabCalculation({span:2.05,thickness:200,cover:50,diameter:13,spacing:200,live:1,finish:0}),canopy=slabCalculation({span:.8,thickness:120,cover:25,diameter:10,spacing:150,live:1,finish:.5,cantilever:true});
 const roofService=(roof.dead+roof.live)*3.8/2,wallWeight=.2*3.05*24,parapet=.25*.7*24,floorReaction=(floor.dead+floor.live)*3.8/2;
 const axial=roofService+wallWeight+parapet,wallStress=axial/200,footingLoad=axial+floorReaction+.8*.3*24+.2*.35*24,pressure=footingLoad/.8;
 return {roof,floor,pit,canopy,wall:{axial,stress:wallStress,area:.2,model:'개구부가 없는 외벽 1 m 폭의 평균 압축 응력'},foundation:{load:footingLoad,pressure,allowable:100,pass:pressure<=100,cantilever:.3,moment:pressure*.3**2/2},conditions:structuralConditions,
 scope:'수직하중의 전달과 대표 부재의 휨·평균 응력·지반 압력을 배우는 단순화 계산입니다. 처짐은 균열 전 탄성 계산입니다. 개구부 주변 응력, 장기 처짐, 내진·풍하중과 정착·이음 상세는 이 계산의 범위에 포함하지 않습니다.'};
}

export function reinforcementFor(model){
 const bars=[],members=[];let index=0;
 function bar(parent,a,b,diameter,sheet,role){if(routeLength([a,b])<.06)return;bars.push({id:`RB-${++index}`,parent,name:parent+' '+role,kind:'rebar',a,b,diameter,sheet,role});}
 function mesh(e,diameter,spacing,cover,sheet,top=true){
  const [x,y,X,Y]=boundsOf(e),r=diameter/2000,off=cover/1000+r,s=spacing/1000;
  const layers=top?[e.base+off,e.base+e.height-off]:[e.base+off];
  // Split bars at floor openings; midpoint segments stay inside the actual parent footprint.
  function clipped(a,b,role){let start=null;const length=routeLength([a,b]),n=Math.ceil(length/.025);for(let i=0;i<=n;i++){const t=Math.min(i/n,1),p=a.map((v,k)=>v+(b[k]-v)*t),ok=insideElement(p,e)&&!(e.holes??[]).some(h=>{const q={footprint:h};const B=boundsOf(q);return p[0]>B[0]-off&&p[0]<B[2]+off&&p[1]>B[1]-off&&p[1]<B[3]+off;});if(ok&&start===null)start=p;if(start&&(!ok||i===n)){const end=ok?p:a.map((v,k)=>v+(b[k]-v)*(i-1)/n);bar(e.id,start,end,diameter,sheet,role);start=null;}}}
  for(const [li,z]of layers.entries()){
   for(let a=x+off;a<=X-off+1e-8;a+=s)clipped([a,y+off,z],[a,Y-off,z],`${li?'상부':'하부'} 주근`);
   for(let b=y+off;b<=Y-off+1e-8;b+=s)clipped([x+off,b,z+(li?-1:1)*diameter/1000],[X-off,b,z+(li?-1:1)*diameter/1000],`${li?'상부':'하부'} 배력근`);
  }
  members.push({id:e.id,name:e.name,diameter,spacing,cover,sheet,type:'mesh',layers:layers.length});
 }
 for(const e of model.elements){
  if(['floor','roof'].includes(e.id))mesh(e,10,150,25,'S-101');
  else if(e.id==='entrance-canopy')mesh(e,10,150,25,'S-101');
  else if(e.id==='pit-base'||e.id.startsWith('footing-'))mesh(e,13,200,50,'S-102');
  else if(e.kind==='wall'||e.id.match(/^(pit-(west|east|south|north)|stem-)/)){
   const [x,y,X,Y]=boundsOf(e),alongX=X-x>Y-y,diameter=10,cover=30,off=.035,spacing=.2;
   const a=alongX?x:y,A=alongX?X:Y,b=alongX?y:x,B=alongX?Y:X;
   if(A-a<2*off||e.height<2*off)continue;
   for(const v of [b+off,B-off]){
    for(let u=a+off;u<=A-off+1e-8;u+=spacing)bar(e.id,alongX?[u,v,e.base+off]:[v,u,e.base+off],alongX?[u,v,e.base+e.height-off]:[v,u,e.base+e.height-off],diameter,'S-102','수직근');
    const inward=v===b+off?.01:-.01;
    for(let z=e.base+off;z<=e.base+e.height-off;z+=spacing)bar(e.id,alongX?[a+off,v+inward,z]:[v+inward,a+off,z],alongX?[A-off,v+inward,z]:[v+inward,A-off,z],diameter,'S-102','수평근');
   }members.push({id:e.id,name:e.name,diameter,spacing:200,cover,sheet:'S-102',type:'wall',layers:2});
  }
 }
 for(const m of members){const own=bars.filter(b=>b.parent===m.id);m.count=own.length;m.length=own.reduce((n,b)=>n+routeLength([b.a,b.b]),0);m.weight=m.length*Math.PI*(m.diameter/1000)**2/4*7850;}
 return {bars,members};
}

export function visibleElement(e,mode,filter='all'){
 if(filter!=='all'){if(filter==='walls')return ['wall','partition'].includes(e.kind);if(filter==='windows')return ['window','window-glass','frame'].includes(e.kind);if(filter==='furniture')return e.group==='fixtures';if(filter==='rebar')return e.kind==='rebar';if(filter==='electrical')return !!e.circuit||e.kind==='panel';}
 if(e.kind==='rebar')return mode==='rebar';
 if(e.circuit||e.kind==='panel')return ['electrical','interior','experience','exterior'].includes(mode)&&e.kind!=='conduit';
 if(mode==='foundation')return e.group==='foundation';
 if(mode==='roof')return e.group==='roof'||['pipe','canopy'].includes(e.kind)&&e.group!=='fixtures';
 if(mode==='ceiling')return e.group==='ceiling';
 if(mode==='fixtures')return e.group==='fixtures'||['window','frame','door','window-glass'].includes(e.kind);
 if(mode==='rebar')return ['wall','roof','floor'].includes(e.kind)||e.group==='foundation';
 if(mode==='section')return e.kind!=='paving';
 if(['interior','electrical'].includes(mode))return !['roof','ceiling','foundation'].includes(e.group)&&e.kind!=='paving';
 return e.group!=='foundation';
}
export function canWalk(x,y,model,{openDoors=true}={}){
 if(x<.38||x>7.82||y<.38||y>3.62)return false;
 const obstacles=model.elements.filter(e=>!e.linePoints&&(['wall','partition','furniture','fixture'].includes(e.kind)||(!openDoors&&e.kind==='door'))&&e.base<1.8&&e.base+e.height>.35);
 const r=.13;
 return !obstacles.some(e=>[[x,y],[x+r,y],[x-r,y],[x,y+r],[x,y-r]].some(p=>insideElement(p,e)));
}
