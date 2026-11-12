// Fallingwater sheets: three storeys in plan, a section over the falls, the materials and the cantilever, all projected from the model.
import {rooms,sheets,materials} from './src/fallingwater-project.mjs';
import {BX,BAY,CANT,PAR,ROOF} from './src/fallingwater-model.mjs';
import {ink,n1,box,target,frame,text,tone,planView,own,context,byId,fillOf,stone,concrete,walnut,earth,LEVEL,land,siteGround,storeyPlan,sectionEast} from './fallingwater-plan-parts.mjs';
import {powerPlan,circuitPlan,firePlan} from './fallingwater-plan-systems.mjs';

const m=v=>v.toFixed(2)+' m',cutX=sheets.find(s=>s.view==='section').cutX,brown='#9f5824';
const label=(x,y,value,{size=10,anchor='middle',fill=ink.soft}={})=>'<text x="'+n1(x)+'" y="'+n1(y)+'" font-size="'+size+'" text-anchor="'+anchor+'" fill="'+fill+'" pointer-events="none">'+value+'</text>';
const across=(v,x0,x1,y,value)=>'<path d="M'+v.px(x0)+' '+v.py(y)+'H'+v.px(x1)+'M'+v.px(x0)+' '+(v.py(y)-4)+'v8M'+v.px(x1)+' '+(v.py(y)-4)+'v8" stroke="'+ink.pickLine+'" fill="none"/>'+label((v.px(x0)+v.px(x1))/2,v.py(y)-6,value,{size:11,fill:ink.text});
const down=(v,x,y0,y1,value)=>'<path d="M'+v.px(x)+' '+v.py(y0)+'V'+v.py(y1)+'M'+(v.px(x)-4)+' '+v.py(y0)+'h8M'+(v.px(x)-4)+' '+v.py(y1)+'h8" stroke="'+ink.pickLine+'" fill="none"/>'+label(v.px(x)+7,(v.py(y0)+v.py(y1))/2+4,value,{size:11,anchor:'start',fill:ink.text});
const chip=(e,id,x,y,width,value,size=14)=>'<g '+target(e.id,e.name)+'><rect x="'+x+'" y="'+y+'" width="'+width+'" height="30" rx="4" '+tone(e,id,'white')+'/><text x="'+(x+12)+'" y="'+(y+20)+'" font-size="'+size+'" fill="'+ink.text+'">'+value+'</text></g>';
const clip=(key,x,y,w,h,body)=>'<clipPath id="fall-'+key+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath><g clip-path="url(#fall-'+key+')">'+body+'</g>';
const spot=(v,room)=>room?'<rect x="'+v.px(room.bounds[0])+'" y="'+v.py(room.bounds[3])+'" width="'+n1((room.bounds[2]-room.bounds[0])*v.scale)+'" height="'+n1((room.bounds[3]-room.bounds[1])*v.scale)+'" fill="'+ink.pick+'" opacity=".4" pointer-events="none"/>':'';
const north='<path d="M600 64v-22l-6 10m6-10l6 10" stroke="'+ink.text+'" fill="none"/>'+text(600,78,'N',{anchor:'middle'});

function sitePlan(sheet,id){
 const v=planView(-9,13.4,11.6,46,56),list=rooms.filter(r=>r.floor===1);
 const ground='<rect x="46" y="56" width="383" height="266" fill="'+earth+'"/>'+siteGround(v);
 const over=own.filter(e=>e.kind==='beam'&&e.id.includes('trellis')).map(e=>'<path d="'+v.ring(e.footprint)+'" fill="none" stroke="'+ink.edge+'" stroke-dasharray="3 2"/>').join('');
 const line='<path d="M'+v.px(cutX)+' '+v.py(12.6)+'V'+v.py(-8.6)+'" stroke="'+brown+'" stroke-dasharray="8 4 2 4" fill="none"/>'+label(v.px(cutX)+9,v.py(12.6)+10,'A',{size:12,fill:brown})+label(v.px(cutX)+9,v.py(-8.6),'A',{size:12,fill:brown});
 const names=label(v.px(-5.6),v.py(-8),'폭포 아래 못')+label(v.px(14.2),v.py(-6),'베어 런')+label(v.px(-5.4),v.py(9.9),'진입로')+label(v.px(20.4),v.py(-8.6),'다리');
 return frame(sheet,clip('site',46,56,383,266,ground+storeyPlan(v,id,1)+over+spot(v,list.find(r=>r.id===id))+line+names)+north+text(446,84,'자리 찾기',{size:13})+
  list.map((r,i)=>chip(r,id,446,96+i*40,160,r.name)).join('')+text(46,348,'물은 동쪽에서 흘러와 집 아래를 지나 서남쪽으로 떨어집니다.')+text(46,368,'점선 A는 '+sheets.find(s=>s.view==='section').id+' 종단면도를 자른 자리입니다.'));
}

function upperPlan(sheet,id){
 const panel=(f,left)=>{const v=planView(-7,8.6,11.5,left,74),list=rooms.filter(r=>r.floor===f);
  return clip('up'+f,left,70,276,184,storeyPlan(v,id,f,{below:true})+spot(v,list.find(r=>r.id===id)))+text(left,64,f+'층 · 물 위 '+m(LEVEL[f]),{size:13,fill:ink.text})+
   list.map((r,i)=>chip(r,id,left+i%2*142,268+Math.floor(i/2)*36,136,r.name,12)).join('');};
 return frame(sheet,panel(2,46)+panel(3,342)+text(46,438,'옅게 그린 판은 한 층 아래의 테라스입니다.'));
}

function crossSection(sheet,id){
 const v=sectionEast(sheet.cutX,14,16,46,250),beyond=e=>box(e).x0>sheet.cutX&&!e.id.startsWith('bridge');
 const far=own.filter(e=>beyond(e)&&(['wall','parapet','column'].includes(e.kind)||e.id.startsWith('hatch-tread')||e.id==='hatch-landing'||e.id==='beam-3'||e.id==='trellis-5')).map(e=>v.shape(e,id,{fill:ink.far,pick:false})).join('');
 const cut=[...v.cuts(own).filter(e=>!['frame','column'].includes(e.kind)),...v.cuts(context).filter(e=>e.kind==='ceiling'||e.id==='rug-1')];
 const parts=cut.map(e=>v.shape(e,id,e.kind==='window-glass'?{extra:' fill-opacity=".45"'}:e.kind==='stair'?{fill:ink.far}:{})).join('');
 const names=label(v.py(2.4),v.pz(4.3),'거실')+label(v.py(3),v.pz(7.2),'안방')+label(v.py(6),v.pz(9.4),'복도')+label(v.py(-.7),v.pz(.5),'베어 런',{fill:ink.text});
 const levels=[['flag-1','1층 바닥 +'+m(LEVEL[1])],['flag-2','2층 바닥 +'+m(LEVEL[2])],['flag-3','3층 바닥 +'+m(LEVEL[3])],['roof-top','지붕 +'+m(ROOF)]];
 return frame(sheet,clip('cut',46,56,384,322,far+v.ground(-7.8)+v.water()+parts+v.person(-1.6,LEVEL[1])+v.person(-5.5,LEVEL[2])+v.person(2.2,LEVEL[3])+names+
  v.span(0,-CANT,-1.7,'내민 길이 '+m(CANT)))+v.dim(-7.3,land.water.drop,0,'폭포 '+m(-land.water.drop))+text(446,84,'물 위 높이',{size:13})+
  levels.map(([k,value],i)=>chip(byId(k),id,446,96+i*40,160,value)).join('')+text(46,404,'세 판이 층마다 다른 쪽으로 내밀어 폭포 위에 겹쳐 있습니다.'));
}

const stroke=(d,color,width=1,opacity=.6)=>'<path d="'+d+'" stroke="'+color+'" stroke-width="'+width+'" stroke-opacity="'+opacity+'" fill="none" pointer-events="none"/>';
const motif={
 sandstone:(x,y)=>stroke([9,16,27,34,45].map((d,i)=>'M'+x+' '+(y+d)+'h150M'+(x+28+i*23)+' '+(y+d)+'v'+(i%2?7:9)+'M'+(x+96-i*17)+' '+(y+d)+'v'+(i%2?9:7)).join(''),'#5f5646'),
 concrete:(x,y)=>stroke('M'+(x+8)+' '+(y+56)+'V'+(y+20)+'q0 -12 12 -12H'+(x+150),'#a08a5c',1.4),
 flagstone:(x,y)=>stroke('M'+x+' '+(y+20)+'l34 -6l22 14l40 -10l54 8M'+(x+34)+' '+(y+14)+'l-6 -14M'+(x+56)+' '+(y+28)+'l-10 28M'+(x+96)+' '+(y+18)+'l8 -18M'+(x+96)+' '+(y+18)+'l14 38M'+x+' '+(y+40)+'l46 2','#d9d2c4',1.2,.8),
 sash:(x,y)=>stroke('M'+x+' '+(y+19)+'h150M'+x+' '+(y+38)+'h150M'+(x+50)+' '+y+'v56M'+(x+100)+' '+y+'v56','#7d2b1d',2.4,1),
 walnut:(x,y)=>stroke([10,22,33,46].map(d=>'M'+x+' '+(y+d)+'q37 -7 75 0t75 0').join(''),'#3f2a1b')
};
function materialSheet(sheet,id){
 const rows=materials.map((mat,i)=>{const e=byId(mat.target),y=62+i*72;
  return '<g '+target(e.id,e.name)+'><rect x="46" y="'+y+'" width="150" height="56" rx="4" '+tone(e,id,e.color)+'/>'+motif[mat.id](46,y)+'</g>'+text(222,y+25,mat.name,{size:18,fill:ink.text})+text(222,y+47,e.name,{size:13});}).join('');
 return frame(sheet,rows+text(46,438,'무늬를 누르면 그 재료가 쓰인 자리가 모형에 표시됩니다.'));
}

function framePlan(sheet,id){
 const v=planView(-7,8.6,15.2,46,62),slab=byId('slab-1'),of=key=>own.filter(e=>e.id.startsWith(key+'-')&&!e.id.includes('trellis'));
 const beams=of('beam'),joists=of('joist'),bolsters=of('bolster');
 const wide=e=>{const b=box(e),y=v.py((b.y0+b.y1)/2);return '<path '+target(e.id,e.name)+' d="M'+v.px(b.x0)+' '+y+'H'+v.px(b.x1)+'" stroke="transparent" stroke-width="8" fill="none" pointer-events="stroke"/>';};
 const under=e=>'<path '+target(e.id,e.name)+' d="'+v.ring(e.footprint)+'" '+tone(e,id,e.id==='bolster-1'?stone:'#cdb785')+' stroke-dasharray="4 2"/>';
 const marks=BX.map((x,i)=>'<circle cx="'+v.px(x)+'" cy="'+v.py(-5.25)+'" r="8" fill="white" stroke="'+ink.line+'"/>'+label(v.px(x),v.py(-5.25)+3.5,'ABCD'[i],{fill:ink.text})).join('');
 const spans=BX.slice(1).map((x,i)=>across(v,BX[i],x,7.6,m(BAY))).join('');
 const picks=[['bolster-1','받침벽 '+bolsters.length+'개'],['beam-1','내민 주보 '+beams.length+'개'],['joist-1','뒤집힌 장선 '+joists.length+'개'],['slab-1','바닥 판']];
 return frame(sheet,v.shape(slab,id,{fill:ink.slab})+beams.map(e=>v.shape(e,id,{fill:concrete})).join('')+joists.map(e=>v.shape(e,id,{fill:concrete})+wide(e)).join('')+bolsters.map(under).join('')+marks+spans+
  down(v,12.4,0,-CANT,'내민 길이 '+m(CANT))+text(446,84,'부재 찾기',{size:13})+picks.map(([k,value],i)=>chip(byId(k),id,446,96+i*40,160,value)).join('')+
  text(46,438,'점선으로 그린 받침벽 네 개가 주보를 받치고, 주보는 남쪽으로 '+m(CANT)+'를 내밉니다.'));
}

function jointDetail(sheet,id){
 const v=sectionEast(sheet.cutX,6.8,46,46,266),ids=new Set(['slab-1','flag-1','parapet-1-s','glass-s','bench-s']);
 const far=['bolster-3','beam-3'].map(k=>v.shape(byId(k),id,{fill:k==='beam-3'?'#f1e7cd':'#ddd0b2'})).join('');
 const cut=[...v.cuts(own).filter(e=>ids.has(e.id)||e.id.startsWith('joist-')),byId('rug-1')].map(e=>v.shape(e,id,e.kind==='window-glass'?{extra:' fill-opacity=".45"'}:{})).join('');
 const notes=[['bolster-3','받침벽 · 너비 0.60 m',[2.6,1.3],[2.6,1.3]],['beam-3','내민 주보 · 춤 0.50 m',[-3.14,2.65],[-3.14,1.7]],['joist-4','뒤집힌 장선 · 1.22 m 간격',[-.04,2.65],[-.04,3.75]],
  ['slab-1','바닥 판 · 두께 0.10 m',[-1.9,2.35],[-1.9,1.7]],['flag-1','판석 바닥 · 장선 위',[1.6,2.95],[1.6,3.75]],['parapet-1-s','난간벽 · 바닥 위 '+m(PAR),[-4.46,3.4],[-3.5,3.95]]];
 const dot=(e,x,y,i)=>'<circle cx="'+x+'" cy="'+y+'" r="8" '+tone(e,id,'white')+'/>'+label(x,y+3.5,i+1,{fill:ink.text});
 const calls=notes.map(([k,,at,to],i)=>'<path d="M'+v.py(at[0])+' '+v.pz(at[1])+'L'+v.py(to[0])+' '+v.pz(to[1])+'" stroke="'+ink.pickLine+'" fill="none"/><g '+target(k,byId(k).name)+'>'+dot(byId(k),v.py(to[0]),v.pz(to[1]),i)+'</g>').join('');
 const legend=notes.map(([k,value],i)=>{const x=46+i%2*290,y=336+Math.floor(i/2)*24;return '<g '+target(k,byId(k).name)+'>'+dot(byId(k),x+8,y-4,i)+'<text x="'+(x+24)+'" y="'+y+'" font-size="13" fill="'+ink.text+'">'+value+'</text></g>';}).join('');
 return frame(sheet,clip('joint',46,56,544,258,v.ground(-1.4)+v.water()+far+cut+v.person(.9,LEVEL[1])+calls+v.span(0,-CANT,.75,'내민 길이 '+m(CANT)))+legend+
  text(46,416,'바닥 판이 아래에 있고 장선이 위로 솟아, 밑에서 올려다보면 매끈한 한 장입니다.')+text(46,438,'끝이 처져 2002년에 보 옆으로 강선을 넣고 당겨 처짐을 멈췄습니다.'));
}

const draw={site:sitePlan,upper:upperPlan,section:crossSection,materials:materialSheet,frame:framePlan,joint:jointDetail,power:powerPlan,circuit:circuitPlan,fire:firePlan};
export function fallingwaterPlan({sheet='A-701',id=null,electric,fire,state,paths=[]}={}){
 const record=sheets.find(s=>s.id===sheet)??sheets[0];
 return draw[record.view](record,id,{electric,fire,state,paths});
}
