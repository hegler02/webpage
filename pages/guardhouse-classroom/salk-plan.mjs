// Salk sheets drawn from the model: site plan, cross section, truss section, pipe-floor plan and materials.
import {colors,trussX} from './src/salk-model.mjs';
import {sheets,rooms,materials,equipment,moduleBay} from './src/salk-project.mjs';
import {own,context,ink,hex,box,target,frame,text,tone,cutFill,planView,sectionView} from './salk-plan-parts.mjs';
import {powerPlan,circuitPlan,firePlan} from './salk-plan-systems.mjs';

const byId=id=>own.find(e=>e.id===id);
const at=(level,list)=>list.filter(e=>e.base<=level&&e.base+e.height>=level-.35&&!['truss','frame','roof'].includes(e.kind));
const order=['paving','water','floor','furniture','finish','wall','column','parapet','window-glass'];
const sorted=list=>[...list].sort((a,b)=>order.indexOf(a.kind)-order.indexOf(b.kind));

function sitePlan(sheet,id){
 const v=planView(-22,28,3.6,30,52),cut=sheets.find(s=>s.view==='section').cutX;
 const pits=['pit-s','pit-n'].map(k=>v.shape(byId(k),id,{fill:ink.pit})).join('');
 const far=sorted(at(.3,context)).map(e=>v.shape(e,id,{fill:e.kind==='water'?ink.water:e.kind==='paving'?ink.paving:ink.far,pick:false})).join('');
 const near=sorted(at(.3,own)).filter(e=>e.group!=='module').map(e=>v.shape(e,id)).join('');
 const chips=rooms.map((r,i)=>'<g '+target(r.id,r.name+' 위치')+'><rect x="446" y="'+(96+i*40)+'" width="160" height="30" rx="4" fill="'+(r.id===id?ink.pick:'white')+'" stroke="'+(r.id===id?ink.pickLine:ink.edge)+'"/><text x="458" y="'+(116+i*40)+'" font-size="14" fill="'+ink.text+'">'+r.name+'</text></g>').join('');
 const mark=rooms.filter(r=>r.id===id).map(r=>'<rect x="'+v.px(r.bounds[0])+'" y="'+v.py(r.bounds[3])+'" width="'+(r.bounds[2]-r.bounds[0])*v.scale+'" height="'+(r.bounds[3]-r.bounds[1])*v.scale+'" fill="none" stroke="'+ink.pickLine+'" stroke-width="2.5"/>').join('');
 return frame(sheet,far+pits+near+mark+
  '<path d="M'+v.px(cut)+' '+v.py(27)+'V'+v.py(-15)+'" stroke="#9f5824" stroke-dasharray="7 5"/>'+text(v.px(cut)+5,v.py(26),'A',{size:13,fill:'#9f5824'})+
  text(v.px(-21),v.py(-8),'← 태평양')+text(v.px(27),v.py(-33),'중정',{size:14,fill:ink.text})+text(v.px(8),v.py(9),'북쪽 동',{size:14,fill:ink.text})+text(v.px(8),v.py(-62),'남쪽 동',{size:14})+
  '<path d="M600 64v-22l-6 10m6-10l6 10" stroke="'+ink.text+'" fill="none"/>'+text(600,78,'N',{anchor:'middle',fill:ink.text})+text(446,84,'자리 찾기',{size:13,fill:ink.text})+chips+
  text(446,318,'중정 폭 27.4 m · 동 길이 74.7 m')+text(446,338,'색이 옅은 곳은 주변 맥락입니다.'));
}

const levels=[[-6.1,'하층 실험실'],[-2.55,'하층 설비층'],[0,'중정층 실험실'],[3.55,'중정층 설비층'],[6.1,'상층 실험실'],[9.65,'상층 설비층']];
function crossSection(sheet,id){
 const v=sectionView(sheet.cutX,-16,13,34,330);
 const beyond=own.filter(e=>e.kind==='truss'&&Math.abs(box(e).x0+.15-trussX(5))<.01).map(e=>v.shape(e,id,{fill:ink.far})).join('');
 const cut=v.cuts(own).filter(e=>e.kind!=='frame'&&e.group!=='module'&&box(e).y1>-16).map(e=>v.shape(e,id,{fill:cutFill(e)})).join('');
 const names=levels.map(([z,name])=>text(v.py(21.4),v.pz(z+1.2),name,{size:12,fill:ink.text})).join('');
 return frame(sheet,'<path d="M'+v.py(-16)+' '+v.pz(0)+'H'+v.py(-12.19)+'" stroke="'+ink.line+'" stroke-width="2"/>'+beyond+cut+names+
  v.dim(-15.6,0,12.2,'12.2 m')+v.person(-5.5,0)+v.person(9,0)+v.person(12,3.55)+
  text(v.py(-12),v.pz(14.3),'연구실 탑',{fill:ink.text})+text(v.py(5),v.pz(13),'실험실 세 층과 설비층 세 층',{fill:ink.text})+text(46,438,'서쪽을 보고 자른 단면입니다. 옅은 면은 건너편 트러스입니다.',{size:13}));
}

function trussSection(sheet,id){
 const v=sectionView(sheet.cutX,-2.4,23.5,34,350),inside=e=>{const b=box(e);return b.z1>-.4&&b.z0<6.4&&b.y1>-2.4&&b.y0<22.2&&e.group!=='tower'&&e.group!=='module';};
 const clip='<clipPath id="truss-window"><rect x="20" y="'+v.pz(6.5)+'" width="600" height="'+(6.9*v.scale)+'"/></clipPath>';
 const cut=v.cuts(own).filter(inside).map(e=>v.shape(e,id,{fill:cutFill(e)})).join('');
 return frame(sheet,clip+'<g clip-path="url(#truss-window)">'+cut+'</g>'+v.person(8.2,0)+v.person(11.5,3.55)+
  v.dim(20.6,0,3.35,'3.35 m')+v.dim(20.6,3.36,6.09,'2.74 m')+
  '<path d="M'+v.py(.22)+' '+v.pz(-.75)+'H'+v.py(19.59)+'m0 -5v10M'+v.py(.22)+' '+(v.pz(-.75)-5)+'v10" stroke="'+ink.pickLine+'" fill="none"/>'+text(v.py(9.9),v.pz(-.75)+18,'경간 19.8 m · 가운데 기둥 없음',{anchor:'middle',fill:ink.text})+
  text(v.py(1),v.pz(1.9),'실험실',{size:14,fill:ink.text})+text(v.py(1.2),v.pz(6.9),'설비층 · 사람이 서서 지나는 트러스 구멍 여섯 칸',{fill:ink.text}));
}

function pipePlan(sheet,id){
 const x0=23.5,x1=45.5,v=planView(x0,21,15.5,40,64),floor=byId('pipe2-floor'),b=moduleBay;
 const clip='<clipPath id="pipe-window"><rect x="40" y="64" width="'+(x1-x0)*15.5+'" height="'+23*15.5+'"/></clipPath>';
 const slab='<path '+target(floor.id,floor.name)+' d="'+v.ring(floor.footprint)+'" '+tone(floor,id,ink.slab)+'/>';
 const slots=floor.holes.filter(h=>h[0][0]<x1&&h[2][0]>x0).map(h=>'<path d="'+v.ring(h)+'" fill="#f8fbfa" stroke="'+ink.edge+'" stroke-width=".5"/>').join('');
 const trusses=own.filter(e=>e.kind==='truss'&&e.id.startsWith('truss2-')).map(e=>{
  const c=box(e),open=(e.profileHoles??[]).map(h=>{const ys=h.map(p=>p[0]);return '<rect x="'+v.px(c.x0)+'" y="'+v.py(Math.max(...ys))+'" width="'+.3*v.scale+'" height="'+(Math.max(...ys)-Math.min(...ys))*v.scale+'" fill="#dfe6e3"/>';}).join('');
  return v.shape(e,id)+open;
 }).join('');
 const rest=own.filter(e=>e.kind!=='truss'&&e.kind!=='floor'&&e.base<=4.5&&e.base+e.height>=4.5&&box(e).y1>-2&&box(e).y0<21).map(e=>v.shape(e,id)).join('');
 const gear=equipment.filter(d=>d.pos[2]>3.5).map(d=>'<rect '+target(d.id,d.name)+' x="'+v.px(d.pos[0]-d.size[0]/2)+'" y="'+v.py(d.pos[1]+d.size[1]/2)+'" width="'+d.size[0]*v.scale+'" height="'+Math.max(6,d.size[1]*v.scale)+'" fill="'+(d.id===id?ink.pick:'#dbe6e8')+'" stroke="'+(d.id===id?ink.pickLine:ink.line)+'"/>'+text(v.px(d.pos[0]),v.py(d.pos[1]-d.size[1]/2)+13,d.id,{size:11,anchor:'middle',fill:ink.text})).join('');
 const bay='<rect x="'+v.px(b.x0)+'" y="'+v.py(b.y1)+'" width="'+(b.x1-b.x0)*v.scale+'" height="'+(b.y1-b.y0)*v.scale+'" fill="none" stroke="#9f5824" stroke-dasharray="6 4"/>';
 const notes=['트러스 13개 · 6.10 m 간격','슬롯 폭 254 mm · 1.52 m 간격','슬롯으로 배관과 전선이 내려갑니다.','점선은 전기 설계를 하는 한 칸입니다.'].map((t,i)=>text(400,112+i*24,t,{fill:i<2?ink.text:ink.soft})).join('');
 return frame(sheet,clip+'<g clip-path="url(#pipe-window)">'+slab+slots+rest+trusses+gear+bay+'</g>'+text(400,84,'설비층 읽기',{size:13,fill:ink.text})+notes+'<path d="M600 300v-22l-6 10m6-10l6 10" stroke="'+ink.text+'" fill="none"/>'+text(600,314,'N',{anchor:'middle',fill:ink.text}));
}

const swatch={concrete:colors.concrete,teak:colors.teak,travertine:colors.travertine,glass:colors.glass};
function materialSheet(sheet,id){
 const rows=materials.map((m,i)=>{
  const y=70+i*92,on=m.target===id;
  return '<g '+target(m.target,m.name)+'><rect x="46" y="'+y+'" width="150" height="70" fill="'+hex(swatch[m.id])+'" stroke="'+(on?ink.pickLine:'#7f9295')+'" stroke-width="'+(on?4:1)+'"/><text x="222" y="'+(y+30)+'" font-size="19" fill="'+ink.text+'">'+m.name+'</text><text x="222" y="'+(y+56)+'" font-size="13" fill="'+ink.soft+'">'+byId(m.target).name+'</text></g>';
 }).join('');
 return frame(sheet,rows+text(46,438,'재료를 누르면 모형에서 그 자리를 보여 줍니다.',{size:13}));
}

const draw={site:sitePlan,section:crossSection,truss:trussSection,pipe:pipePlan,materials:materialSheet,power:powerPlan,circuit:circuitPlan,fire:firePlan};
export function salkPlan({sheet='A-501',id=null,electric,fire,state,paths=[]}={}){
 const record=sheets.find(s=>s.id===sheet)??sheets[0];
 return draw[record.view](record,id,{electric,fire,state,paths});
}
