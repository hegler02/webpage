// Shared pieces of the Farnsworth sheets: the model, its tones, the house plan every plan sheet starts from and a section seen looking east.
import {farnsworthModel} from './src/farnsworth-model.mjs';
import {ink,n1,box,target,text,tone} from './salk-plan-parts.mjs';
export {ink,n1,box,target,frame,text,tone,planView} from './salk-plan-parts.mjs';

export const model=farnsworthModel();
export const own=model.elements.filter(e=>!e.context),context=model.elements.filter(e=>e.context);
export const byId=id=>model.elements.find(e=>e.id===id);
export const wood='#d9b98a',stone='#e6dcc6';
// Steel is white in the house; cut steel is drawn dark so that it reads against the paper.
export const fillOf=e=>e.kind==='window-glass'?ink.glass:e.kind==='paving'?ink.paving:e.kind==='wall'?wood:e.kind==='furniture'?ink.other:e.kind==='finish'?e.color:e.kind==='floor'||e.kind==='roof'?ink.wall:ink.line;
export const lit=(d,id,fill)=>'fill="'+(d.id===id?ink.pick:fill)+'" stroke="'+(d.id===id?ink.pickLine:ink.line)+'" stroke-width="'+(d.id===id?2.5:1)+'"';
export const number=v=>v.toLocaleString('ko-KR',{maximumFractionDigits:1});

// The plan cut one metre above the travertine: what stands on the floor, the glass around it and the two decks below.
const CUT=2.7,crosses=e=>e.base>=1.2&&e.base<=CUT&&e.base+e.height>=CUT;
const decks=['terrace-travertine','floor-travertine'].map(byId),steps=own.filter(e=>e.kind==='paving'&&!decks.includes(e));
const standing=own.filter(e=>crosses(e)&&['wall','finish'].includes(e.kind)),posts=own.filter(e=>crosses(e)&&e.kind==='frame').concat(context.filter(crosses));
const furniture=own.filter(e=>e.kind==='furniture'&&e.id!=='kitchen-upper'),columns=own.filter(e=>/^col-[sn]/.test(e.id)),panes=own.filter(e=>e.kind==='window-glass'&&crosses(e));
export function housePlan(v,id,{furnished=true,pick=true}={}){
 const glass=e=>{const b=box(e),along=b.x1-b.x0>b.y1-b.y0,x=(b.x0+b.x1)/2,y=(b.y0+b.y1)/2,on=e.id===id;
  return '<path '+(pick?target(e.id,e.name)+' ':'')+'d="M'+v.px(along?b.x0:x)+' '+v.py(along?y:b.y0)+'L'+v.px(along?b.x1:x)+' '+v.py(along?y:b.y1)+'" stroke="'+(on?ink.pickLine:ink.glass)+'" stroke-width="'+(on?4.5:3)+'" pointer-events="stroke"/>';};
 // The two door leaves swing out onto the veranda.
 const swing=e=>{const b=box(e),south=e.leaf===1,hinge=south?b.y0:b.y1,free=south?b.y1:b.y0,r=n1((b.y1-b.y0)*v.scale);
  return '<path d="M'+v.px(b.x0)+' '+v.py(free)+'A'+r+' '+r+' 0 0 '+(south?0:1)+' '+v.px(b.x0-(b.y1-b.y0))+' '+v.py(hinge)+'L'+v.px(b.x0)+' '+v.py(hinge)+'" stroke="'+ink.edge+'" stroke-dasharray="3 3" fill="none"/>';};
 return decks.map(e=>v.shape(e,id,{fill:e.id==='floor-travertine'?ink.slab:ink.paving,pick})).join('')+steps.map(e=>v.shape(e,id,{fill:ink.paving,pick})).join('')+
  standing.map(e=>v.shape(e,id,{fill:fillOf(e),pick})).join('')+(furnished?furniture.map(e=>v.shape(e,id,{fill:ink.other,pick})).join(''):'')+
  panes.filter(e=>e.leaf).map(swing).join('')+panes.map(glass).join('')+posts.map(e=>v.shape(e,id,{fill:ink.line,pick:false})).join('')+columns.map(e=>v.shape(e,id,{fill:ink.line,pick})).join('');
}

// A section cut at x and seen looking east, the way the 3D section looks: north is on the left.
export function sectionEast(cutX,y1,scale,left,zero){
 const py=y=>n1(left+(y1-y)*scale),pz=z=>n1(zero-z*scale);
 const ring=points=>'M'+points.map(([y,z])=>py(y)+' '+pz(z)).join('L')+'Z';
 const cuts=list=>list.filter(e=>{const b=box(e);return b.x0<=cutX&&cutX<=b.x1;});
 const shape=(e,id,{fill=fillOf(e),pick=true,extra=''}={})=>{const b=box(e);return '<path '+(pick?target(e.id,e.name)+' ':'')+tone(e,id,fill)+extra+' d="'+ring(e.profile&&e.profile.axis!=='x'?e.profile.points:[[b.y0,b.z0],[b.y1,b.z0],[b.y1,b.z1],[b.y0,b.z1]])+'"/>';};
 const dim=(y,z0,z1,label)=>'<path d="M'+py(y)+' '+pz(z0)+'V'+pz(z1)+'M'+(py(y)-4)+' '+pz(z0)+'h8M'+(py(y)-4)+' '+pz(z1)+'h8" stroke="'+ink.pickLine+'" fill="none"/>'+text(py(y)+7,(pz(z0)+pz(z1))/2+4,label,{fill:ink.text});
 const person=(y,z)=>'<g fill="'+ink.soft+'"><circle cx="'+py(y)+'" cy="'+pz(z+1.58)+'" r="'+n1(.12*scale)+'"/><path d="'+ring([[y-.2,z+1.42],[y+.2,z+1.42],[y+.14,z],[y-.14,z]])+'"/></g>';
 return {py,pz,scale,ring,cuts,shape,dim,person};
}
