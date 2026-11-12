// Electrical and fire sheets for Fallingwater: three storeys side by side, the panel's branch diagram and the fire plan with its way out.
import {feeder,panel,requiredDetectors,requiredExtinguishers} from './src/fallingwater-project.mjs';
import {ink,target,frame,text,planView,storeyPlan,siteGround,lit,number,floorOf,earth} from './fallingwater-plan-parts.mjs';
import {plan,halo,lampInk,routeInk,legendInk,lampNote} from './masters-power.mjs';

const floors=[1,2,3],views={1:planView(-6.8,12.6,10.5,46,70),2:planView(-5.8,7.9,10.5,392,70),3:planView(-5.8,7.6,10.5,392,246)};
const clips={1:[46,66,330,256],2:[388,66,206,160],3:[388,244,206,84]};
const tag=(x,y,value)=>'<text x="'+x+'" y="'+y+'" font-size="8" text-anchor="middle" fill="'+ink.text+'" pointer-events="none">'+value+'</text>';
// The three storeys, faded, each in its own window with whatever is drawn over it.
const storeysWith=(id,key,over)=>floors.map(f=>{const [x,y,w,h]=clips[f];
 return '<clipPath id="fall-'+key+f+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath><g clip-path="url(#fall-'+key+f+')"><g opacity=".6">'+(f===1?'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+earth+'"/>'+siteGround(views[f]):'')+storeyPlan(views[f],id,f,{pick:false})+'</g>'+over(f,views[f])+'</g>'+
  text(f===1?46:392,f===3?240:62,f+'층',{size:12,fill:ink.text});}).join('');
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
// The stretches of a route that run on one storey; a sloping stretch belongs to both storeys it joins.
function runs(points,f){
 const out=[];let run=null;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];
  if(same(a,b)||(floorOf(a[2])!==f&&floorOf(b[2])!==f)){run=null;continue;}
  if(!run)out.push(run=[a]);run.push(b);
 }
 return out;
}
// Where a route climbs from one storey to another.
const risers=(points,f)=>points.slice(1).filter((b,i)=>{const a=points[i],lo=floorOf(Math.min(a[2],b[2])),hi=floorOf(Math.max(a[2],b[2]));return same(a,b)&&lo!==hi&&lo<=f&&f<=hi;});

export function powerPlan(sheet,id,{electric,state}){
 const color=Object.fromEntries(electric.circuits.map(c=>[c.id,c.color])),shown=routeInk(electric,state,id,color,{thin:1.6,thick:3.5});
 const device=(d,v)=>{
  const cx=v.px(d.pos[0]),cy=v.py(d.pos[1]),lamp=d.kind==='light',fill=d.on===false||(d.kind==='panel'&&state?.power===false)?ink.off:d.kind==='switch'?plan.on:d.kind==='panel'||d.kind==='heatpump'?'#dbe6e8':'white';
  const [w,h]={panel:[12,8],switch:[7,7],cooktop:[8,8],heatpump:[12,8]}[d.kind]??[Math.max(5,d.size[0]*v.scale),Math.max(5,d.size[1]*v.scale)];
  return '<g '+target(d.id,d.name)+'><circle cx="'+cx+'" cy="'+cy+'" r="8" fill="transparent"/>'+(lamp&&d.on!==false?halo(cx,cy,9):'')+
   (d.kind==='socket'?'<circle cx="'+cx+'" cy="'+cy+'" r="4.5" '+lit(d,id,fill)+'/>':'<rect x="'+(cx-w/2)+'" y="'+(cy-h/2)+'" width="'+w+'" height="'+h+'" rx="1.5" '+(lamp?lampInk(d,id,ink):lit(d,id,fill))+'/>')+'</g>'+(d.kind==='panel'?tag(cx+16,cy-8,d.id):d.id===id?tag(cx,cy-9,d.id):'');
 };
 const over=(f,v)=>(f===1?v.line(feeder,ink.soft,{width:2,dash:'5 4'}):'')+
  shown.map(s=>runs(s.route.points,f).map(run=>v.line(run,s.color,{width:s.width,dash:s.dash})).join('')).join('')+
  shown.map(s=>risers(s.route.points,f).map(p=>'<circle cx="'+v.px(p[0])+'" cy="'+v.py(p[1])+'" r="3.5" fill="white" stroke="'+s.color+'" stroke-width="1.5" pointer-events="none"/>').join('')).join('')+
  [electric.panel,...electric.devices].filter(d=>floorOf(d.pos[2])===f).map(d=>device(d,v)).join('');
 const rows=electric.circuits.map((c,i)=>{
  const x=46+i%3*196,y=362+Math.floor(i/3)*36,k=legendInk(state,c,ink);
  return '<path d="M'+x+' '+y+'h22" '+k.stroke+' stroke-width="5"/>'+text(x+30,y+4,k.name,{size:12,fill:k.fill})+text(x+30,y+18,c.breaker+' A · '+c.area+' mm² · '+number(c.watts)+' W',{size:10.5});
 }).join('');
 return frame(sheet,storeysWith(id,'p',over)+text(46,344,'분기 회로',{size:13,fill:ink.text})+rows+text(46,438,lampNote(electric)+' · 흰 동그라미는 위층으로 오르는 자리',{fill:ink.text}));
}

export function circuitPlan(sheet,id,{electric,state}){
 const rows=electric.circuits.map((c,i)=>{
  const y=90+i*56,on=state?.breakers?.[c.id]!==false,line=on&&state?.power!==false?c.color:ink.off,members=electric.devices.filter(d=>d.circuit===c.id);
  const chips=members.map((d,k)=>'<g '+target(d.id,d.name)+'><rect x="'+(250+k*38)+'" y="'+(y+7)+'" width="34" height="18" rx="3" '+lit(d,id,d.on===false?ink.off:'white')+'/><text x="'+(267+k*38)+'" y="'+(y+20)+'" font-size="9" text-anchor="middle" fill="'+ink.text+'">'+d.id+'</text></g>').join('');
  return '<path d="M150 '+y+'H190'+(on?'h24':'l22 -11m2 11')+'H610" stroke="'+line+'" stroke-width="4" fill="none"/><circle cx="190" cy="'+y+'" r="4" fill="'+line+'"/><circle cx="214" cy="'+y+'" r="4" fill="'+line+'"/>'+
   text(250,y-9,c.id+' · '+c.name,{size:12.5,fill:ink.text})+
   text(610,y-9,c.volts+' V '+(c.phase===3?'3상':'단상')+' · '+c.area+' mm² · '+number(c.watts)+' W · '+number(c.current)+' A · 강하 '+c.percent.toFixed(2)+' %'+(c.pass?'':' · 다시 검토'),{size:10,anchor:'end',fill:c.pass?ink.soft:'#a03a2c'})+
   text(158,y+16,c.breaker+' A',{size:11,fill:ink.text})+text(158,y+29,on?'켜짐':'꺼짐',{size:11,fill:on?'#08734d':'#a03a2c'})+chips;
 }).join('');
 return frame(sheet,'<g '+target(panel.id,panel.name)+'><rect x="46" y="62" width="104" height="346" rx="4" '+lit(panel,id,state?.power===false?ink.off:'#dbe6e8')+'/><text x="98" y="92" font-size="15" text-anchor="middle" fill="'+ink.text+'">'+panel.id+'</text><text x="98" y="110" font-size="11" text-anchor="middle" fill="'+ink.soft+'">'+(state?.power===false?'전원 꺼짐':'분전반')+'</text></g>'+rows+
  text(46,432,'차단기 정격 ≥ 부하 전류, 전선 허용전류 ≥ 차단기 정격이면 통과입니다.'));
}

const mark={smoke:'white',heat:'#f6d3a8',extinguisher:'#e8a08f'};
export function firePlan(sheet,id,{fire,paths}){
 const count=kind=>fire.devices.filter(d=>d.kind===kind).length;
 const device=(d,v)=>{
  const x=v.px(d.pos[0]),y=v.py(d.pos[1]),live=d.alarm&&d.on?'#e2553f':mark[d.kind];
  return '<g '+target(d.id,d.name)+'><circle cx="'+x+'" cy="'+y+'" r="8" fill="transparent"/>'+
   (d.kind==='extinguisher'?'<rect x="'+(x-4.5)+'" y="'+(y-5.5)+'" width="9" height="11" rx="1.5" '+lit(d,id,live)+'/>':'<circle cx="'+x+'" cy="'+y+'" r="'+(d.id===id?6.5:5)+'" '+lit(d,id,live)+'/>')+'</g>'+(d.id===id||d.alarm?tag(x,y-10,d.id):'');
 };
 const over=(f,v)=>paths.map(p=>runs(p.points,f).map(run=>v.line(run,p.color,{width:p.width??3,dash:p.dash??''})).join('')).join('')+fire.devices.filter(d=>floorOf(d.pos[2])===f).map(d=>device(d,v)).join('');
 const legend=[['smoke','연기 감지기'],['heat','열 감지기'],['extinguisher','소화기'],['#d19129','경보음이 닿는 길'],['#c8452f','소화기까지'],['#08734d','피난 경로','6 4']].map(([k,name,dash],i)=>{
  const x=52+i%3*196,y=362+Math.floor(i/3)*20;
  return (i>2?'<path d="M'+(x-6)+' '+(y-4)+'h18" stroke="'+k+'" stroke-width="3"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>'+text(x+18,y,name):k==='extinguisher'?'<rect x="'+(x-4)+'" y="'+(y-9)+'" width="8" height="10" rx="1.5" fill="'+mark[k]+'" stroke="'+ink.line+'"/>'+text(x+12,y,name):'<circle cx="'+x+'" cy="'+(y-4)+'" r="5" fill="'+mark[k]+'" stroke="'+ink.line+'"/>'+text(x+12,y,name));
 }).join('');
 return frame(sheet,storeysWith(id,'f',over)+legend+
  text(46,416,'감지기는 법이 요구하는 '+requiredDetectors()+'개를 방마다 하나씩 '+(count('smoke')+count('heat'))+'개, 소화기는 층마다 '+requiredExtinguishers()+'개에 부엌 하나를 더해 '+count('extinguisher')+'개입니다.')+
  text(46,438,'불이 나면 2층 안방에서 계단을 내려와 현관으로 나가 다리를 건넙니다.',{size:13}));
}
