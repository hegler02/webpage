// Yumin Art Museum sheets: the sunken square in plan, a section through the tall rooms, the materials and the roof beams, all projected from the model.
import {rooms,sheets,materials} from './src/yumin-project.mjs';
import {B1,TOP,CEIL,STONE,SPAN,BAY,DEPTH,SLAB,OUT} from './src/yumin-model.mjs';
import {ink,n1,box,target,frame,text,tone,planView,own,byId,concrete,basalt,earth,fillOf,mainView,plot,label,across,down,north,clip,chip,storeyPlan,sitePieces,outline,sectionEast} from './yumin-plan-parts.mjs';
import {powerPlan,circuitPlan,firePlan} from './yumin-plan-systems.mjs';

const m=v=>v.toFixed(2)+' m',cutX=sheets.find(s=>s.view==='section').cutX,brown='#9f5824';
const spot=(v,room)=>room?'<rect x="'+v.px(room.bounds[0])+'" y="'+v.py(room.bounds[3])+'" width="'+n1((room.bounds[2]-room.bounds[0])*v.scale)+'" height="'+n1((room.bounds[3]-room.bounds[1])*v.scale)+'" fill="'+ink.pick+'" opacity=".4" pointer-events="none"/>':'';
// A name written over the drawing, with a pale edge so the lines under it do not cut the letters.
const tag=(x,y,value,{size=10,fill=ink.text,anchor='middle'}={})=>'<text x="'+n1(x)+'" y="'+n1(y)+'" font-size="'+size+'" text-anchor="'+anchor+'" fill="'+fill+'" stroke="white" stroke-width="3" stroke-opacity=".85" paint-order="stroke" pointer-events="none">'+value+'</text>';
const names=(v,list)=>list.map(([x,y,value])=>tag(v.px(x),v.py(y)+3.5,value)).join('');

function sitePlan(sheet,id){
 const v=mainView,list=rooms.filter(r=>r.floor===-1),k=planView(-40,24,1.45,414,62),kw=92.8,kh=139.2;
 const line='<path d="M'+v.px(cutX)+' '+v.py(18.9)+'V'+v.py(-18.9)+'" stroke="'+brown+'" stroke-dasharray="8 4 2 4" fill="none"/>'+tag(v.px(cutX)+9,v.py(18.9)+13,'A',{size:12,fill:brown})+tag(v.px(cutX)+9,v.py(-18.9)-5,'A',{size:12,fill:brown});
 const key='<rect x="414" y="62" width="'+kw+'" height="'+kh+'" fill="'+earth+'"/>'+clip('key',414,62,kw,kh,sitePieces(k,id)+outline(k))+
  [['미술관',0],['여인·바람의 정원',-27.5],['돌의 정원',-43.5],['티켓 센터',-56.5],['주차장',-68]].map(([n,y])=>label(514,k.py(y)+3.5,n,{anchor:'start'})).join('');
 const rooms1=names(v,[[8.4,8.4,'제1전시실'],[0,0,'제2전시실'],[8.4,-8.4,'제3전시실'],[8.4,15.9,'지하 입구 앞마당'],[-15.9,0,'경사로']]);
 return frame(sheet,plot+clip('b1',46,62,353.3,353.3,storeyPlan(v,id,-1)+spot(v,list.find(r=>r.id===id))+line+rooms1)+north+key+text(414,222,'자리 찾기',{size:13})+
  list.map((r,i)=>chip(r,id,414,230+i*19,192,r.name,10.5,17)).join('')+text(46,438,'점선 A는 '+sheets.find(s=>s.view==='section').id+' 종단면도를 자른 자리입니다.'));
}

function upperPlan(sheet,id){
 const v=mainView,list=rooms.filter(r=>r.floor===1),R=15.9;
 // The way in: through the stone gate, along the water, then once round the square down the ramp.
 const route=v.line([[0,-19],[0,R],[-R,R],[-R,-R],[R,-R],[R,R],[3.4,R]],brown,{width:1.6,dash:'6 4'})+'<path d="M'+v.px(3.4)+' '+v.py(R)+'l7 -4v8z" fill="'+brown+'"/>';
 const levels=[[-R,R,'0 m'],[-R,-R,'−2.0 m'],[R,-R,'−3.3 m'],[R,R,'−4.6 m']].map(([x,y,value])=>tag(v.px(x),v.py(y)+3.5,value,{fill:brown})).join('');
 const voids=names(v,[[8.4,8.4,'제1전시실 상부'],[8.4,-8.4,'제3전시실 상부'],[3.3,-12.6,'물의 통로'],[-8.4,-8.4,'램프의 방'],[-8.4,8.6,'휴게 라운지']]);
 const tones=[[concrete,'콘크리트 벽'],[basalt,'현무암 벽'],[ink.water,'물'],[ink.glass,'유리']].map(([fill,value],i)=>'<rect x="'+(414+i%2*98)+'" y="'+(292+Math.floor(i/2)*24)+'" width="20" height="12" fill="'+fill+'" stroke="'+ink.line+'"/>'+text(440+i%2*98,303+Math.floor(i/2)*24,value)).join('');
 return frame(sheet,plot+clip('f1',46,62,353.3,353.3,storeyPlan(v,id,1)+spot(v,list.find(r=>r.id===id))+route+levels+voids)+north+text(414,84,'자리 찾기',{size:13})+
  list.map((r,i)=>chip(r,id,414,96+i*34,192,r.name)).join('')+text(414,280,'그린 색',{size:13})+tones+
  text(414,366,'점선은 들어가는 길입니다.')+text(414,386,'돌의 문, 물의 통로, 전망 마당,')+text(414,406,'경사로, 지하 입구 순서입니다.')+text(46,438,'동쪽 두 전시실은 지붕까지 트여 있어 1층에는 바닥이 없습니다.'));
}

function crossSection(sheet,id){
 const v=sectionEast(sheet.cutX,19.6,14,46,172),slope=-2-1.3*(sheet.cutX+14.4)/28.8;
 const far=['basalt-e','core-e'].map(k=>v.shape(byId(k),id,{fill:ink.far,pick:false})).join('')+['glass-slit-n','glass-slit-s'].map(k=>v.shape(byId(k),id)).join('');
 const parts=v.cuts(own).filter(e=>!['frame','furniture'].includes(e.kind)).map(e=>v.shape(e,id)).join('');
 const marks=tag(v.py(8.4),v.pz(1.7),'제1전시실 영감의 방')+tag(v.py(-8.4),v.pz(1.7),'제3전시실 아르누보 전성기의 방')+tag(v.py(0),v.pz(-2.9),'지하 전실')+tag(v.py(0),v.pz(.6),'물')+tag(v.py(15.9),v.pz(-2.2),'앞마당')+tag(v.py(-15.9),v.pz(-1),'경사로');
 const levels=[['roof-ne','지붕 +'+m(TOP)],['glass-slit-n','띠 창 · 바닥 위 8.50 m'],['slab-b1','지하 바닥 −'+m(-B1)],['basalt-n-e','현무암 벽 +'+m(STONE)]];
 return frame(sheet,clip('cut',46,56,549,206,v.ground(19.6,-5.6)+far+parts+v.person(6,B1)+v.person(-6.5,B1)+v.person(16.2,B1)+v.person(-16,slope)+marks+
  v.dim(11.6,B1,CEIL,'높이 '+m(CEIL-B1))+v.span(-OUT,OUT,5.5,'현무암 벽 사이 '+m(OUT*2)))+levels.map(([k,value],i)=>chip(byId(k),id,46+i*139,274,133,value,11)).join('')+
  text(46,332,'두 전시실은 지하 바닥에서 지붕 밑까지 '+m(CEIL-B1)+'를 통으로 비웠습니다.')+text(46,354,'빛은 동쪽 벽 꼭대기의 띠 창 하나로만 들어와 벽을 타고 내려옵니다.')+
  text(46,376,'현무암 벽과 콘크리트 벽 사이 경사로는 땅보다 낮아 바깥 풍경이 보이지 않습니다.')+text(46,438,'북쪽이 왼쪽입니다. 옅게 그린 벽은 자른 자리 너머로 보이는 동쪽 벽입니다.'));
}

const stroke=(d,color,width=1,opacity=.6)=>'<path d="'+d+'" stroke="'+color+'" stroke-width="'+width+'" stroke-opacity="'+opacity+'" fill="none" pointer-events="none"/>';
const dots=(points,color,r=1.7)=>points.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+color+'" pointer-events="none"/>').join('');
const motif={
 // Formwork panels twice as long as they are tall, six tie holes in each.
 concrete:(x,y)=>stroke('M'+x+' '+(y+28)+'h150M'+(x+56)+' '+y+'v56M'+(x+112)+' '+y+'v56','#8b8a84',1,.8)+dots([0,1,2].flatMap(i=>[0,1].flatMap(j=>[14,28,42].map(d=>[x+i*56+d,y+j*28+(i<2||d<42?9:9)]).concat([14,28,42].map(d=>[x+i*56+d,y+j*28+19])))).filter(p=>p[0]<x+148),'#77766f'),
 basalt:(x,y)=>stroke([10,21,31,43].map((d,i)=>'M'+x+' '+(y+d)+'q19 '+(i%2?-4:4)+' 38 0t38 0t38 0t36 0M'+(x+22+i*27)+' '+(y+d)+'v'+(i%2?10:11)+'M'+(x+118-i*24)+' '+(y+d)+'v'+(i%2?12:10)).join(''),'#8f9295',1.2,.8),
 water:(x,y)=>stroke([12,30,48,66,84,102,120,138].map((d,i)=>'M'+(x+d)+' '+(y+4+i%3*5)+'v'+(18+i%2*8)+'m0 5v'+(4+i%3*2)).join(''),'white',1.4,.75),
 slit:(x,y)=>'<path d="M'+(x+4)+' '+y+'h142a4 4 0 0 1 4 4v20h-150v-20a4 4 0 0 1 4 -4zM'+x+' '+(y+30)+'h150v22a4 4 0 0 1 -4 4h-142a4 4 0 0 1 -4 -4z" fill="'+concrete+'" pointer-events="none"/>'+stroke('M'+(x+50)+' '+(y+30)+'v26M'+(x+100)+' '+(y+30)+'v26M'+(x+50)+' '+y+'v24M'+(x+100)+' '+y+'v24','#8b8a84',1,.7),
 frosted:(x,y)=>stroke('M'+(x+38)+' '+y+'v56M'+(x+75)+' '+y+'v56M'+(x+112)+' '+y+'v56M'+x+' '+(y+28)+'h150','#9db3b8',1.4,.9)
};
function materialSheet(sheet,id){
 const rows=materials.map((mat,i)=>{const e=byId(mat.target),y=62+i*72;
  return '<g '+target(e.id,e.name)+'><rect x="46" y="'+y+'" width="150" height="56" rx="4" '+tone(e,id,e.color)+'/>'+motif[mat.id](46,y)+'</g>'+text(222,y+25,mat.name,{size:18,fill:ink.text})+text(222,y+47,e.name,{size:13});}).join('');
 return frame(sheet,rows+text(46,438,'무늬를 누르면 그 재료가 쓰인 자리가 모형에 표시됩니다.'));
}

function framePlan(sheet,id){
 const v=planView(1.2,16.2,10.8,46,62),beams=own.filter(e=>e.kind==='beam'),roofs=['roof-ne','roof-se'].map(byId),mid=e=>(box(e).x0+box(e).x1)/2;
 const base='<rect x="46" y="62" width="198" height="350" fill="'+earth+'"/><g opacity=".55">'+storeyPlan(v,id,-1,{furnished:false,pick:false})+'</g>';
 const over=roofs.map(e=>'<path '+target(e.id,e.name)+' d="'+v.ring(e.footprint)+'" fill="'+(e.id===id?ink.pick:'none')+'" fill-opacity=".35" stroke="'+brown+'" stroke-dasharray="6 3" pointer-events="stroke"/>').join('');
 const marks=beams.slice(0,3).map((e,i)=>'<circle cx="'+v.px(mid(e))+'" cy="'+v.py(15.3)+'" r="7" fill="white" stroke="'+ink.line+'"/>'+label(v.px(mid(e)),v.py(15.3)+3.5,i+1,{fill:ink.text})).join('');
 const picks=[['beam-ne-1','지붕 보 '+beams.length+'개 · 춤 '+m(DEPTH)],['roof-ne','지붕 판 · 두께 '+m(SLAB)],['part-ne-x','칸막이 벽 · 두께 0.30 m'],['core-e','바깥 벽 · 두께 0.40 m']];
 return frame(sheet,clip('frame',46,62,198,350,base+over+beams.map(e=>v.shape(e,id,{fill:concrete})).join('')+marks+across(v,mid(beams[0]),mid(beams[1]),-.6,BAY.toFixed(2))+across(v,mid(beams[1]),mid(beams[2]),-.6,BAY.toFixed(2)))+
  down(v,19.9,2.6,2.6+SPAN,'경간 '+m(SPAN))+text(340,84,'부재 찾기',{size:13})+picks.map(([k,value],i)=>chip(byId(k),id,340,96+i*36,250,value)).join('')+
  text(340,268,'기둥 없이 벽이 지붕을 받칩니다.')+text(340,290,'보는 칸막이 벽과 바깥 벽에 걸쳐')+text(340,312,m(SPAN)+'를 건너고, '+m(BAY)+'마다 놓입니다.')+text(340,346,'갈색 점선은 지붕 판의 테두리입니다.')+
  text(46,438,'지하 1층 평면 위에 지붕 보를 겹쳐 그렸습니다. 동쪽 절반만 보입니다.'));
}

function jointDetail(sheet,id){
 const v=sectionEast(sheet.cutX,15.4,38,46,272),ids=new Set(['roof-ne','beam-ne-2','part-ne-x','core-n-e','ceiling-e','pool-east','water-east']);
 const far=v.shape(byId('core-e'),id,{fill:ink.far,pick:false});
 const cut=v.cuts(own).filter(e=>ids.has(e.id)).map(e=>v.shape(e,id,e.id==='beam-ne-2'?{fill:'#d6dbd8'}:{})).join('');
 const notes=[['roof-ne','지붕 판 · 두께 '+m(SLAB),[9.6,4.48],[9.6,5.05]],['beam-ne-2','지붕 보 · 춤 '+m(DEPTH)+' (판 포함)',[7,3.9],[7,2.75]],['part-ne-x','칸막이 벽 · 보를 받치는 남쪽 끝',[2.65,3],[3.7,2.2]],
  ['core-n-e','바깥 벽 · 보를 받치는 북쪽 끝',[14.2,3],[13.1,2.2]]];
 const dot=(e,x,y,i)=>'<circle cx="'+x+'" cy="'+y+'" r="8" '+tone(e,id,'white')+'/>'+label(x,y+3.5,i+1,{fill:ink.text});
 const calls=notes.map(([k,,at,to],i)=>'<path d="M'+v.py(at[0])+' '+v.pz(at[1])+'L'+v.py(to[0])+' '+v.pz(to[1])+'" stroke="'+ink.pickLine+'" fill="none"/><g '+target(k,byId(k).name)+'>'+dot(byId(k),v.py(to[0]),v.pz(to[1]),i)+'</g>').join('');
 const legend=notes.map(([k,value],i)=>{const x=46+i%2*290,y=286+Math.floor(i/2)*26;return '<g '+target(k,byId(k).name)+'>'+dot(byId(k),x+8,y-4,i)+'<text x="'+(x+24)+'" y="'+y+'" font-size="13" fill="'+ink.text+'">'+value+'</text></g>';}).join('');
 return frame(sheet,clip('joint',46,56,544,196,far+cut+calls+v.span(2.6,2.6+SPAN,1.75,'경간 '+m(SPAN))+v.dim(11.4,CEIL-DEPTH+SLAB,TOP,m(DEPTH)))+legend+
  text(46,360,'보는 지붕 판과 한 몸으로 부어 판 두께까지 합쳐 '+m(DEPTH)+' 높이로 버팁니다.')+text(46,382,'경간의 10분의 1쯤 되는 춤입니다. 계산은 계산과 확인 메뉴에서 이어집니다.')+
  text(46,438,'전시실 꼭대기만 크게 그렸습니다. 북쪽이 왼쪽입니다.'));
}

const draw={site:sitePlan,upper:upperPlan,section:crossSection,materials:materialSheet,frame:framePlan,joint:jointDetail,power:powerPlan,circuit:circuitPlan,fire:firePlan};
export function yuminPlan({sheet='A-801',id=null,electric,fire,state,paths=[]}={}){
 const record=sheets.find(s=>s.id===sheet)??sheets[0];
 return draw[record.view](record,id,{electric,fire,state,paths});
}
