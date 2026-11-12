// Electrical and fire sheets for the Yumin Art Museum: the basement and the upper floor side by side, the panel's branch diagram and the fire plan with its way out.
import {feeder,panel,fireRule,sprinklerPlan} from './src/yumin-project.mjs';
import {ink,target,frame,text,planView,storeyPlan,lit,number,earth} from './yumin-plan-parts.mjs';
import {plan,halo,lampInk,routeInk,legendInk,lampNote} from './masters-power.mjs';

const floors=[-1,1],S=8,views={[-1]:planView(-18.6,18.6,S,46,62),1:planView(-18.6,18.6,S,357,62)},clips={[-1]:[46,62,297.6,297.6],1:[357,62,173,297.6]},title={[-1]:'지하 1층',1:'1층 · 서쪽 절반'};
// The tall east galleries belong to the basement right up to their roof; everything else above ground is the upper floor.
const storey=p=>p[2]>-.2&&p[0]<2.4?1:-1;
const tag=(x,y,value)=>'<text x="'+x+'" y="'+y+'" font-size="8" text-anchor="middle" fill="'+ink.text+'" stroke="white" stroke-width="2.5" stroke-opacity=".85" paint-order="stroke" pointer-events="none">'+value+'</text>';
// Both storeys, faded, each in its own window with whatever is drawn over it.
const storeysWith=(id,key,over)=>floors.map(f=>{const [x,y,w,h]=clips[f];
 return '<clipPath id="yumin-'+key+(f+1)+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath><g clip-path="url(#yumin-'+key+(f+1)+')"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+earth+'"/><g opacity=".55">'+storeyPlan(views[f],id,f,{furnished:false,pick:false})+'</g>'+over(f,views[f])+'</g>'+
  text(x,56,title[f],{size:11,fill:ink.text});}).join('');
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
// The stretches of a route that run on one storey; a sloping stretch belongs to both storeys it joins.
function runs(points,f){
 const out=[];let run=null;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];
  if(same(a,b)||(storey(a)!==f&&storey(b)!==f)){run=null;continue;}
  if(!run)out.push(run=[a]);run.push(b);
 }
 return out;
}
// Where a route climbs from the basement to the upper floor.
const risers=(points,f)=>points.slice(1).filter((b,i)=>same(points[i],b)&&storey(points[i])!==storey(b));

export function powerPlan(sheet,id,{electric,state}){
 const color=Object.fromEntries(electric.circuits.map(c=>[c.id,c.color])),shown=routeInk(electric,state,id,color,{thin:1.3,thick:3.2});
 const device=(d,v)=>{
  const cx=v.px(d.pos[0]),cy=v.py(d.pos[1]),lamp=d.kind==='light',plant=d.kind==='panel'||d.kind==='ahu'||d.kind==='pump';
  const fill=d.on===false||(d.kind==='panel'&&state?.power===false)?ink.off:d.kind==='switch'?plan.on:plant?'#dbe6e8':'white';
  const [w,h]={panel:[8,12],switch:[6,6]}[d.kind]??[Math.max(3.4,d.size[0]*v.scale),Math.max(3.4,d.size[1]*v.scale)];
  return '<g '+target(d.id,d.name)+'><circle cx="'+cx+'" cy="'+cy+'" r="6" fill="transparent"/>'+(lamp&&d.on!==false?halo(cx,cy,6.5):'')+
   (d.kind==='socket'?'<circle cx="'+cx+'" cy="'+cy+'" r="3" '+lit(d,id,fill)+'/>':'<rect x="'+(cx-w/2)+'" y="'+(cy-h/2)+'" width="'+w+'" height="'+h+'" rx="1.2" '+(lamp?lampInk(d,id,ink):lit(d,id,fill))+'/>')+'</g>'+(plant||d.id===id?tag(cx,cy-h/2-4,d.id):'');
 };
 const over=(f,v)=>(f===-1?v.line(feeder,ink.soft,{width:2,dash:'5 4'}):'')+
  shown.map(s=>runs(s.route.points,f).map(run=>v.line(run,s.color,{width:s.width,dash:s.dash})).join('')).join('')+
  shown.map(s=>risers(s.route.points,f).map(p=>'<circle cx="'+v.px(p[0])+'" cy="'+v.py(p[1])+'" r="3" fill="white" stroke="'+s.color+'" stroke-width="1.4" pointer-events="none"/>').join('')).join('')+
  [electric.panel,...electric.devices].filter(d=>storey(d.pos)===f).map(d=>device(d,v)).join('');
 const rows=electric.circuits.map((c,i)=>{
  const x=46+i%2*274,y=377+Math.floor(i/2)*15,k=legendInk(state,c,ink);
  return '<path d="M'+x+' '+(y-4)+'h20" '+k.stroke+' stroke-width="4"/>'+text(x+28,y,k.name+' · '+c.breaker+' A · '+number(c.watts)+' W',{size:10.5,fill:k.fill});
 }).join('');
 return frame(sheet,storeysWith(id,'p',over)+rows+text(46,440,lampNote(electric)+' · 흰 동그라미는 1층으로 오르는 자리',{fill:ink.text}));
}

export function circuitPlan(sheet,id,{electric,state}){
 const rows=electric.circuits.map((c,i)=>{
  const y=86+i*41,on=state?.breakers?.[c.id]!==false,line=on&&state?.power!==false?c.color:ink.off,members=electric.devices.filter(d=>d.circuit===c.id),lamps=members.filter(d=>d.kind==='light');
  // One small mark per fitting: lamps amber while lit, everything else white while fed.
  const marks=members.map((d,k)=>'<g '+target(d.id,d.name)+'><rect x="'+(250+k*10)+'" y="'+(y+6)+'" width="7.5" height="10" rx="2" '+(d.kind==='light'?lampInk(d,id,ink):lit(d,id,d.on===false?ink.off:d.kind==='switch'?plan.on:'white'))+'/></g>').join('');
  const count=lamps.length?'조명 '+lamps.filter(d=>d.on).length+' / '+lamps.length+'개 점등':'기구 '+members.filter(d=>d.on).length+' / '+members.length+'개 동작';
  return '<path d="M150 '+y+'H190'+(on?'h24':'l22 -11m2 11')+'H610" stroke="'+line+'" stroke-width="4" fill="none"/><circle cx="190" cy="'+y+'" r="4" fill="'+line+'"/><circle cx="214" cy="'+y+'" r="4" fill="'+line+'"/>'+
   text(250,y-8,c.id+' · '+c.name,{size:12,fill:ink.text})+
   text(610,y-8,c.area+' mm² · '+number(c.watts)+' W · '+number(c.current)+' A · 강하 '+c.percent.toFixed(2)+' %'+(c.pass?'':' · 다시 검토'),{size:10,anchor:'end',fill:c.pass?ink.soft:'#a03a2c'})+
   text(158,y+14,c.breaker+' A · '+(c.phase===3?'3상 ':'')+c.volts+' V',{size:10,fill:ink.text})+text(158,y+26,on?'켜짐':'꺼짐',{size:10,fill:on?'#08734d':'#a03a2c'})+marks+text(256+members.length*10,y+14.5,count,{size:10});
 }).join('');
 return frame(sheet,'<g '+target(panel.id,panel.name)+'><rect x="46" y="62" width="104" height="346" rx="4" '+lit(panel,id,state?.power===false?ink.off:'#dbe6e8')+'/><text x="98" y="92" font-size="15" text-anchor="middle" fill="'+ink.text+'">'+panel.id+'</text><text x="98" y="110" font-size="11" text-anchor="middle" fill="'+ink.soft+'">'+(state?.power===false?'전원 꺼짐':'분전반')+'</text></g>'+rows+
  text(46,434,'차단기 정격 ≥ 부하 전류, 전선 허용전류 ≥ 차단기 정격이면 통과입니다. 작은 칸 하나가 기구 하나입니다.'));
}

const mark={smoke:'white',sprinkler:'#5d9fc6',hydrant:'#d9705c',callpoint:'#f0b0a2',bell:'#f6d3a8',exit:ink.exit,emergency:ink.light,extinguisher:'#e8a08f',receiver:'#dbe6e8'};
const kinds=[['smoke','연기감지기'],['sprinkler','스프링클러 헤드'],['hydrant','옥내소화전'],['callpoint','발신기'],['bell','경종·시각경보기'],['exit','유도등'],['emergency','비상조명등'],['extinguisher','소화기'],['receiver','수신기']];
// One symbol per kind, shared by the plan and its legend.
function symbol(kind,x,y,ink0){
 if(kind==='sprinkler')return '<circle cx="'+x+'" cy="'+y+'" r="1.8" '+ink0+'/>';
 if(kind==='smoke'||kind==='callpoint')return '<circle cx="'+x+'" cy="'+y+'" r="'+(kind==='smoke'?4:3.4)+'" '+ink0+'/>';
 if(kind==='bell')return '<path d="M'+(x-4)+' '+(y+3.5)+'h8l-4 -7.5z" '+ink0+'/>';
 if(kind==='emergency')return '<path d="M'+x+' '+(y-4.5)+'l4.5 4.5l-4.5 4.5l-4.5 -4.5z" '+ink0+'/>';
 const [w,h]={hydrant:[7,7],exit:[9,5.5],extinguisher:[5,7.5],receiver:[8,11]}[kind];
 return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="1.2" '+ink0+'/>';
}
export function firePlan(sheet,id,{fire,paths}){
 const count=kind=>fire.devices.filter(d=>d.kind===kind).length,shift={bell:-8,hydrant:2};
 const device=(d,v)=>{
  const x=v.px(d.pos[0])+(shift[d.kind]??0),y=v.py(d.pos[1]),fill=d.alarm&&d.on?'#e2553f':d.kind==='emergency'&&d.on?plan.lit:mark[d.kind],small=d.kind==='sprinkler';
  return '<g '+target(d.id,d.name)+'><circle cx="'+x+'" cy="'+y+'" r="'+(small?3:6)+'" fill="transparent"/>'+symbol(d.kind,x,y,small&&d.id!==id?'fill="'+fill+'"':lit(d,id,fill))+'</g>'+(d.id===id||d.id===fire.signalId||d.kind==='receiver'?tag(x,y-9,d.id):'');
 };
 const order=d=>d.kind==='sprinkler'?0:1;
 const over=(f,v)=>fire.devices.filter(d=>storey(d.pos)===f&&!order(d)).map(d=>device(d,v)).join('')+
  paths.map(p=>runs(p.points,f).map(run=>v.line(run,p.color,{width:p.width??2.6,dash:p.dash??''})).join('')).join('')+fire.devices.filter(d=>storey(d.pos)===f&&order(d)).map(d=>device(d,v)).join('');
 const legend=[...kinds.map(([k,name])=>[k,name+' '+count(k)]),['#d19129','감지기에서 수신기, 경종까지'],['#08734d','피난 경로','6 4']].map(([k,name,dash],i)=>{
  const slot=i<10?i:11,x=52+slot%4*137,y=379+Math.floor(slot/4)*15;
  return (mark[k]?symbol(k,x,y-4,'fill="'+mark[k]+'" stroke="'+ink.line+'"'):'<path d="M'+(x-6)+' '+(y-4)+'h14" stroke="'+k+'" stroke-width="3"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>')+text(x+12,y,name,{size:10.5});
 }).join('');
 return frame(sheet,storeysWith(id,'f',over)+legend+
  text(46,424,'수용인원 '+fireRule.area.toLocaleString('ko-KR')+' m² ÷ '+fireRule.perPerson+' m² = '+fireRule.people+'명으로 100명을 넘어 모든 층에 헤드를 답니다. 헤드 사이는 '+sprinklerPlan.spacing.toFixed(2)+' m 이하입니다.',{size:10.5})+
  text(46,440,'불이 나면 지하 입구로 나와 하늘이 열린 경사로를 한 바퀴 올라 남쪽 돌의 문으로 나갑니다.'));
}
