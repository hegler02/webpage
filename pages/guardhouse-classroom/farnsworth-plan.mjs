// The Farnsworth sheets: plan, section, materials, steel frame and the column joint. The electrical and fire sheets are in farnsworth-plan-systems.mjs.
import {rooms,materials,sheets} from './src/farnsworth-project.mjs';
import {CX,L,W,FLOOR,CLEAR,TZ} from './src/farnsworth-model.mjs';
import {ink,n1,box,target,frame,text,tone,planView,own,context,byId,housePlan,sectionEast} from './farnsworth-plan-parts.mjs';
import {powerPlan,circuitPlan,firePlan} from './farnsworth-plan-systems.mjs';

const m=v=>v.toFixed(2)+' m',cutX=sheets.find(s=>s.view==='section').cutX,brown='#9f5824';
const label=(x,y,value,{size=10,anchor='middle',fill=ink.soft}={})=>'<text x="'+n1(x)+'" y="'+n1(y)+'" font-size="'+size+'" text-anchor="'+anchor+'" fill="'+fill+'" pointer-events="none">'+value+'</text>';
// A dimension between two x positions, drawn at plan height y.
const across=(v,x0,x1,y,value)=>'<path d="M'+v.px(x0)+' '+v.py(y)+'H'+v.px(x1)+'M'+v.px(x0)+' '+(v.py(y)-4)+'v8M'+v.px(x1)+' '+(v.py(y)-4)+'v8" stroke="'+ink.pickLine+'" fill="none"/>'+label((v.px(x0)+v.px(x1))/2,v.py(y)-6,value,{size:11,fill:ink.text});
const chip=(e,id,x,y,width,value)=>'<g '+target(e.id,e.name)+'><rect x="'+x+'" y="'+y+'" width="'+width+'" height="30" rx="4" '+tone(e,id,'white')+'/><text x="'+(x+12)+'" y="'+(y+20)+'" font-size="14" fill="'+ink.text+'">'+value+'</text></g>';

function sitePlan(sheet,id){
 const v=planView(-6.9,10.2,12.6,46,56),room=rooms.find(r=>r.id===id);
 const mark=room?'<rect x="'+v.px(room.bounds[0])+'" y="'+v.py(room.bounds[3])+'" width="'+n1((room.bounds[2]-room.bounds[0])*v.scale)+'" height="'+n1((room.bounds[3]-room.bounds[1])*v.scale)+'" fill="'+ink.pick+'" fill-opacity=".4" stroke="'+ink.pickLine+'" stroke-width="2" pointer-events="none"/>':'';
 const chips=rooms.map((r,i)=>chip(r,id,446,96+i*40,160,r.name)).join('');
 const cut='<path d="M'+v.px(cutX)+' '+v.py(9.5)+'V'+v.py(-9.3)+'" stroke="'+brown+'" stroke-dasharray="7 5" fill="none"/>'+label(v.px(cutX)-9,v.py(9.5)+10,'A',{size:12,fill:brown})+label(v.px(cutX)-9,v.py(-9.3),'A',{size:12,fill:brown});
 return frame(sheet,housePlan(v,id)+mark+cut+across(v,0,L,9.75,m(L))+label(v.px(16.8),v.py(-6.4),'폭스 강 ↓',{size:12})+label(v.px(1.9),v.py(7.2),'베란다')+label(v.px(-1.6),v.py(-5.2),'아래 테라스')+
  '<path d="M600 64v-22l-6 10m6-10l6 10" stroke="'+ink.text+'" fill="none"/>'+text(600,78,'N',{anchor:'middle'})+text(446,84,'자리 찾기',{size:13})+chips+
  text(46,322,'풀밭 위 1.60 m에 뜬 집과 0.73 m에 뜬 테라스를 계단 두 벌이 잇습니다.')+text(46,342,'A 선은 A-602 횡단면도가 자른 자리입니다.'));
}

function crossSection(sheet,id){
 const v=sectionEast(sheet.cutX,11.6,26,46,262),ground=v.pz(0);
 const glass=['glass-w1','glass-w2','door-1','door-2'].map(k=>v.shape(byId(k),id,{fill:ink.glass,extra:' fill-opacity=".35"'})).join('');
 const beyond=['mullion-w1','mullion-w2','girder-f3','girder-r3','girder-t7','stair-up-stringer2','stair-low-stringer2','col-n2','col-s2','col-t3'].map(k=>v.shape(byId(k),id,{fill:ink.far})).join('');
 const levels=[['roof-slab','지붕 판 · 천장 '+m(FLOOR+CLEAR)],['floor-travertine','집 바닥 · '+m(FLOOR)],['terrace-travertine','아래 테라스 · '+m(TZ)]].map(([k,value],i)=>chip(byId(k),id,46+i*186,318,176,value)).join('');
 return frame(sheet,glass+beyond+v.cuts(own).map(e=>v.shape(e,id)).join('')+
  '<rect x="46" y="'+ground+'" width="548" height="16" fill="#eef2ec"/><path d="M46 '+ground+'H594" stroke="'+ink.line+'" stroke-width="1.5"/>'+
  v.person(1.9,FLOOR)+v.person(-3.2,TZ)+v.dim(10.9,0,FLOOR,m(FLOOR))+v.dim(10.9,FLOOR,FLOOR+CLEAR,m(CLEAR))+v.dim(-9,0,TZ,m(TZ))+
  label(v.py(4.4),v.pz(5.1),'베란다',{size:12})+label(v.py(-3.6),v.pz(2.9),'아래 테라스',{size:12})+label(52,ground+12,'북',{anchor:'start'})+label(588,ground+12,'남 · 강 쪽',{anchor:'end'})+
  text(46,306,'세 판의 높이',{size:13})+levels+text(46,378,'기둥은 판을 뚫지 않고 판의 옆면에 붙습니다. S-602에서 크게 봅니다.')+
  text(46,438,'바닥을 1.6 m 들어 올린 것은 강이 넘칠 때를 대비한 것입니다.',{size:13}));
}

// A hint of each material drawn on its sample: the steel section, the stone joints, a glint on the glass and the grain of the plywood.
const motif={
 steel:(x,y)=>'M'+(x+57)+' '+(y+17)+'h36M'+(x+57)+' '+(y+53)+'h36M'+(x+75)+' '+(y+17)+'v36',
 travertine:(x,y)=>'M'+x+' '+(y+35)+'h150M'+(x+50)+' '+y+'v35M'+(x+100)+' '+y+'v35M'+(x+25)+' '+(y+35)+'v35M'+(x+75)+' '+(y+35)+'v35M'+(x+125)+' '+(y+35)+'v35',
 glass:(x,y)=>'M'+(x+96)+' '+(y+56)+'l34 -40M'+(x+112)+' '+(y+58)+'l22 -26',
 primavera:(x,y)=>[14,28,42,56].map(d=>'M'+x+' '+(y+d)+'q38 -7 75 0t75 0').join('')
};
function materialSheet(sheet,id){
 const rows=materials.map((mat,i)=>{
  const e=byId(mat.target),y=70+i*92,line=mat.id==='glass'?'white':mat.id==='steel'?ink.line:'#b7a98c';
  return '<g '+target(e.id,e.name)+'><rect x="46" y="'+y+'" width="150" height="70" rx="4" '+tone(e,id,e.color)+'/><path d="'+motif[mat.id](46,y)+'" stroke="'+line+'" stroke-width="'+(mat.id==='steel'?5:1)+'" fill="none"/></g>'+text(222,y+30,mat.name,{size:19,fill:ink.text})+text(222,y+56,e.name,{size:13});
 }).join('');
 return frame(sheet,rows+text(46,438,'견본을 누르면 그 재료가 쓰인 자리를 모형에서 보여 줍니다.',{size:13}));
}

// The floor frame from above: girders cross between the two channels and the columns stand outside them.
const steel=own.filter(e=>/^(girder-[ft]|floor-fascia|terrace-fascia|stair-\w+-stringer)/.test(e.id)),columns=own.filter(e=>/^col-/.test(e.id)),treads=own.filter(e=>/^stair-\w+-tread/.test(e.id));
function framePlan(sheet,id){
 const v=planView(-6.9,10.4,18,46,74),rowY=[W+.108,-.108],dash=' stroke="'+ink.edge+'" stroke-dasharray="10 3 2 3" fill="none"/>';
 const bubble=(x,y,value)=>'<circle cx="'+x+'" cy="'+y+'" r="8" fill="white" stroke="'+ink.line+'"/>'+label(x,y+4,value,{size:11,fill:ink.text});
 const grid=CX.map((x,i)=>'<path d="M'+v.px(x)+' 70V'+v.py(-.9)+'"'+dash+bubble(v.px(x),62,i+1)).join('')+rowY.map((y,i)=>'<path d="M'+v.px(-.7)+' '+v.py(y)+'H603"'+dash+bubble(611,v.py(y),'AB'[i])).join('');
 const spans=[0,...CX,L].slice(1).map((x,i,list)=>across(v,i?list[i-1]:0,x,9.85,(x-(i?list[i-1]:0)).toFixed(2))).join('');
 const side=v.px(-1.3),depth='<path d="M'+side+' '+v.py(W)+'V'+v.py(0)+'M'+(side-4)+' '+v.py(W)+'h8M'+(side-4)+' '+v.py(0)+'h8" stroke="'+ink.pickLine+'" fill="none"/>'+label(side-8,(v.py(W)+v.py(0))/2+4,m(W),{size:11,anchor:'end',fill:ink.text});
 const slabs=treads.map(e=>v.shape(e,id,{fill:ink.paving,pick:false})).join('')+['floor-slab','terrace-slab'].map(k=>v.shape(byId(k),id,{fill:ink.slab})).join(''),stack=box(byId('service-stack'));
 const members=steel.map(e=>v.shape(e,id,{fill:/^girder/.test(e.id)?ink.other:ink.line})).join('')+v.shape(byId('service-stack'),id,{fill:ink.wall})+label(v.px(stack.x1)+5,v.py(stack.y0)+2,'설비 기둥',{anchor:'start'});
 // Columns are drawn larger than life so that they can be found on the sheet.
 const posts=columns.map(e=>{const b=box(e),x=v.px((b.x0+b.x1)/2),y=v.py((b.y0+b.y1)/2);return '<rect x="'+(x-4)+'" y="'+(y-4)+'" width="8" height="8" fill="'+(e.id===id?ink.pickLine:ink.text)+'"/><circle '+target(e.id,e.name)+' cx="'+x+'" cy="'+y+'" r="10" fill="transparent" stroke="'+(e.id===id?ink.pickLine:'none')+'" stroke-width="2"/>';}).join('');
 const notes=['기둥 8개 · 간격 6.71 m','양 끝 내민 길이 1.68 m','바닥 가로보 13개 · 1.68 m 간격','테라스 가로보 9개 · 받침 6곳'].map((value,i)=>text(v.px(11.2),v.py(-2.2)+i*22,value,{fill:ink.text})).join('');
 return frame(sheet,slabs+members+grid+posts+spans+depth+notes+text(46,438,'기둥은 판 밖에 서고, 가로보가 두 테두리보 사이를 건너 판을 받칩니다.',{size:13}));
}

// The joint of one column cut on its centre line, at the roof and at the floor.
const jointX=CX[1],shade=e=>/^col/.test(e.id)?'#a3b8ba':/fascia/.test(e.id)?'#2f4f56':/^girder/.test(e.id)?'#cbd6d5':/^(mullion|rail)/.test(e.id)?'#a9bbbb':e.kind==='paving'?ink.paving:e.id==='roofing'?'#8f8e86':e.kind==='finish'?e.color:ink.pit;
const cutParts=[...own,...context].filter(e=>{const b=box(e);return b.x0<=jointX&&jointX<=b.x1&&b.y0<1.15&&b.y1>-.45&&e.kind!=='furniture';});
const callouts={
 roof:[['col-s2','기둥 H형강',[-.108,4.36],[-.33,4.36]],['roof-fascia-s','지붕 테두리 ㄷ형강',[.045,4.874],[-.2,4.95]],['girder-r5','지붕 가로보',[.5,4.56],[.5,4.36]],['roof-slab','지붕 판',[.92,4.7],[.92,4.94]],['roofing','방수층',[.62,4.815],[.62,4.94]],['ceiling','미장 천장',[.85,4.512],[.85,4.36]],['mullion-s1','멀리언',[.1,4.3],[.3,4.26]]],
 floor:[['col-s2','기둥 H형강',[-.108,1.76],[-.33,1.76]],['floor-fascia-s','바닥 테두리 ㄷ형강',[.045,1.226],[.2,1.15]],['girder-f5','바닥 가로보',[.6,1.3],[.6,1.15]],['floor-slab','바닥 판',[.95,1.43],[.95,1.76]],['floor-travertine','트래버틴 45 mm',[.62,1.578],[.62,1.76]],['mullion-s1','멀리언과 아래틀',[.1,1.68],[.32,1.83]]]
};
function jointDetail(sheet,id){
 const part=(key,title,top,zTop)=>{
  const v=sectionEast(jointX,1.15,190,46,top+zTop*190),list=callouts[key];
  const marks=list.map(([k,,a,b],i)=>'<path d="M'+v.py(a[0])+' '+v.pz(a[1])+'L'+v.py(b[0])+' '+v.pz(b[1])+'" stroke="'+ink.text+'"/><g '+target(k,byId(k).name)+'><circle cx="'+v.py(b[0])+'" cy="'+v.pz(b[1])+'" r="8" '+tone(byId(k),id,'white')+'/>'+label(v.py(b[0]),v.pz(b[1])+4,i+1,{size:11,fill:ink.text})+'</g>').join('');
  const rows=list.map(([k,value],i)=>'<g '+target(k,byId(k).name)+'><circle cx="380" cy="'+(top+34+i*20)+'" r="8" '+tone(byId(k),id,'white')+'/>'+label(380,top+38+i*20,i+1,{size:11,fill:ink.text})+'<text x="396" y="'+(top+39+i*20)+'" font-size="13" fill="'+ink.text+'">'+value+'</text></g>').join('');
  return '<clipPath id="fw-'+key+'"><rect x="46" y="'+top+'" width="304" height="152"/></clipPath><rect x="46" y="'+top+'" width="304" height="152" fill="white" stroke="'+ink.edge+'"/><g clip-path="url(#fw-'+key+')">'+
   cutParts.map(e=>v.shape(e,id,{fill:shade(e),extra:/^girder/.test(e.id)?' fill-opacity=".7"':''})).join('')+marks+'</g>'+text(372,top+14,title,{size:13})+rows;
 };
 return frame(sheet,part('roof','지붕 접합',62,5)+part('floor','바닥 접합',244,1.9)+label(52,412,'실내',{anchor:'start'})+label(344,412,'바깥 · 남',{anchor:'end'})+
  text(46,438,'기둥은 판을 뚫지 않고 두 테두리보의 바깥면에 용접으로 붙습니다.',{size:13}));
}

const draw={site:sitePlan,section:crossSection,materials:materialSheet,frame:framePlan,joint:jointDetail,power:powerPlan,circuit:circuitPlan,fire:firePlan};
export function farnsworthPlan({sheet='A-601',id=null,electric,fire,state,paths=[]}={}){
 const record=sheets.find(s=>s.id===sheet)??sheets[0];
 return draw[record.view](record,id,{electric,fire,state,paths});
}
