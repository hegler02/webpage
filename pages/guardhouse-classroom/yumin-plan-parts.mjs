// Shared pieces of the Yumin sheets: the model, its tones, one plan per storey and a section seen looking east.
import {yuminModel,colors,B1,OUT} from './src/yumin-model.mjs';
import {ink,n1,box,target,text,tone,planView} from './salk-plan-parts.mjs';
export {ink,n1,box,target,frame,text,tone,planView} from './salk-plan-parts.mjs';

export const model=yuminModel();
export const own=model.elements.filter(e=>!e.context),context=model.elements.filter(e=>e.context);
export const byId=id=>model.elements.find(e=>e.id===id);
export const concrete='#b9c0be',basalt='#74777a',paving='#d9d3c4',plinth='#efe9dc',earth='#e3e6dc',green='#cddcc0';
// Cut concrete reads grey, basalt nearly black; glass, water and stone paving keep their own tones.
export const fillOf=e=>e.kind==='window-glass'?ink.glass:e.kind==='water'?ink.water:e.kind==='paving'?paving:e.kind==='stone'?basalt:e.kind==='finish'?green:e.kind==='furniture'?plinth:
 e.kind==='partition'?ink.other:e.kind==='frame'?ink.line:e.kind==='floor'||e.kind==='stair'||e.kind==='roof'||e.kind==='ceiling'?ink.slab:e.color===colors.basalt?basalt:concrete;
export const lit=(d,id,fill)=>'fill="'+(d.id===id?ink.pick:fill)+'" stroke="'+(d.id===id?ink.pickLine:ink.line)+'" stroke-width="'+(d.id===id?2.5:1)+'"';
export const number=v=>v.toLocaleString('ko-KR',{maximumFractionDigits:1});
// Floor heights of the two storeys and the height each plan is cut at: 1.5 m on the ground floor, to catch the slot in the screen wall.
export const LEVEL={[-1]:B1,1:0},CUT={[-1]:B1+1.2,1:1.5};

// The square the two floor plans share, and the drafting marks every sheet uses.
export const mainView=planView(-19.2,19.2,9.2,46,62),plot='<rect x="46" y="62" width="353.3" height="353.3" fill="'+earth+'"/>';
export const label=(x,y,value,{size=10,anchor='middle',fill=ink.soft}={})=>'<text x="'+n1(x)+'" y="'+n1(y)+'" font-size="'+size+'" text-anchor="'+anchor+'" fill="'+fill+'" pointer-events="none">'+value+'</text>';
export const across=(v,x0,x1,y,value)=>'<path d="M'+v.px(x0)+' '+v.py(y)+'H'+v.px(x1)+'M'+v.px(x0)+' '+(v.py(y)-4)+'v8M'+v.px(x1)+' '+(v.py(y)-4)+'v8" stroke="'+ink.pickLine+'" fill="none"/>'+label((v.px(x0)+v.px(x1))/2,v.py(y)-6,value,{size:11,fill:ink.text});
export const down=(v,x,y0,y1,value)=>'<path d="M'+v.px(x)+' '+v.py(y0)+'V'+v.py(y1)+'M'+(v.px(x)-4)+' '+v.py(y0)+'h8M'+(v.px(x)-4)+' '+v.py(y1)+'h8" stroke="'+ink.pickLine+'" fill="none"/>'+label(v.px(x)+7,(v.py(y0)+v.py(y1))/2+4,value,{size:11,anchor:'start',fill:ink.text});
export const north='<g transform="rotate(-15 600 60)"><path d="M600 64v-22l-6 10m6-10l6 10" stroke="'+ink.text+'" fill="none"/>'+text(600,78,'N',{anchor:'middle'})+'</g>';
export const clip=(key,x,y,w,h,body)=>'<clipPath id="yumin-'+key+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath><g clip-path="url(#yumin-'+key+')">'+body+'</g>';
export const chip=(e,id,x,y,width,value,size=12.5,height=28)=>'<g '+target(e.id,e.name)+'><rect x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" rx="4" '+tone(e,id,'white')+'/><text x="'+(x+10)+'" y="'+n1(y+height/2+size*.36)+'" font-size="'+size+'" fill="'+ink.text+'">'+value+'</text></g>';

// A wall drawn in plan stops where a door or a slot crosses the cut height.
function pieces(e,cut){
 const gaps=(e.profileHoles??[]).filter(h=>Math.min(...h.map(p=>p[1]))<cut&&cut<Math.max(...h.map(p=>p[1]))).map(h=>[Math.min(...h.map(p=>p[0])),Math.max(...h.map(p=>p[0]))]).sort((a,c)=>a[0]-c[0]);
 if(!gaps.length)return [e.footprint];
 const b=box(e),along=e.profile.axis==='x',out=[];let from=along?b.x0:b.y0;
 for(const [a,c] of [...gaps,[along?b.x1:b.y1,0]]){if(a>from)out.push(along?[[from,b.y0],[a,b.y0],[a,b.y1],[from,b.y1]]:[[b.x0,from],[b.x1,from],[b.x1,a],[b.x0,a]]);from=c;}
 return out;
}
const storeys=Object.fromEntries([-1,1].map(f=>{
 const cut=CUT[f],up=own.filter(e=>e.base<cut&&e.base+e.height>LEVEL[f]+.05),of=(...kinds)=>up.filter(e=>kinds.includes(e.kind));
 const ramps=own.filter(e=>e.id.startsWith('ramp-'));
 const plates=f===-1?[byId('slab-b1')]:own.filter(e=>(e.kind==='floor'||e.kind==='water')&&!e.id.startsWith('ramp-')&&e.base+e.height>-.4&&e.base+e.height<.2&&e.id!=='pool-east');
 return [f,{cut,ramps,plates,stairs:own.filter(e=>e.kind==='stair'),furniture:of('furniture'),solid:of('wall','parapet','partition'),panes:of('window-glass'),
  high:own.filter(e=>e.kind==='window-glass'&&(f===-1?e.id.startsWith('glass-slit'):e.id==='glass-lamp'))}];
}));
export function storeyPlan(v,id,f,{furnished=true,pick=true}={}){
 const s=storeys[f],shape=(e,fill,p=pick)=>v.shape(e,id,{fill,pick:p});
 const wall=e=>'<path '+(pick?target(e.id,e.name)+' ':'')+'d="'+pieces(e,s.cut).map(v.ring).join('')+'" '+tone(e,id,fillOf(e))+'/>';
 const glass=(e,dash='')=>{const b=box(e),along=b.x1-b.x0>b.y1-b.y0,x=(b.x0+b.x1)/2,y=(b.y0+b.y1)/2,on=e.id===id;
  return '<path '+(pick?target(e.id,e.name)+' ':'')+'d="M'+v.px(along?b.x0:x)+' '+v.py(along?y:b.y0)+'L'+v.px(along?b.x1:x)+' '+v.py(along?y:b.y1)+'" stroke="'+(on?ink.pickLine:ink.glass)+'" stroke-width="'+(on?4:2.4)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' pointer-events="stroke"/>';};
 const treads=e=>{const b=box(e),n=Math.round((b.y1-b.y0)/.28);let d='';for(let i=1;i<n;i++)d+='M'+v.px(b.x0)+' '+v.py(b.y0+(b.y1-b.y0)*i/n)+'H'+v.px(b.x1);
  return '<path d="'+d+'" stroke="'+ink.edge+'" stroke-width=".6" fill="none" pointer-events="none"/>';};
 // On the ground floor the basement shows through the two tall rooms and the stair opening.
 const under=f===1?shape(byId('slab-b1'),ink.far,false):'';
 return under+s.ramps.map(e=>shape(e,paving)).join('')+s.plates.map(e=>shape(e,e.kind==='water'?ink.water:e.color===colors.paving?paving:ink.slab)).join('')+
  s.stairs.map(e=>shape(e,ink.slab)+(e.id==='stair-landing'?'':treads(e))).join('')+(furnished?s.furniture.map(e=>shape(e,plinth)).join(''):'')+
  s.solid.map(wall).join('')+s.panes.map(e=>glass(e)).join('')+s.high.map(e=>glass(e,'5 3')).join('');
}

// The ground around the museum: gardens, paths, the car park, the ticket pavilion and the three glass annexes.
export function sitePieces(v,id,{pick=false}={}){
 const pads=own.filter(e=>e.id.endsWith('-pad')),glass=own.filter(e=>e.kind==='window-glass'&&/^(annex|ticket)/.test(e.id));
 return context.filter(e=>e.group==='site'&&e.kind!=='frame').sort((a,b)=>(a.kind==='stone')-(b.kind==='stone')).map(e=>v.shape(e,id,{fill:fillOf(e),pick:false})).join('')+
  pads.map(e=>v.shape(e,id,{fill:'white',pick})).join('')+glass.map(e=>'<path d="'+v.ring(e.footprint)+'" stroke="'+ink.glass+'" stroke-width="1.6" fill="none" pointer-events="none"/>').join('');
}
// The square of basalt walls alone, for a key plan too small to carry the rooms.
export const outline=v=>'<path d="'+v.ring([[-OUT,-OUT],[OUT,-OUT],[OUT,OUT],[-OUT,OUT]])+'" fill="'+concrete+'" stroke="'+basalt+'" stroke-width="1.6"/>';

// A section cut at x and seen looking east, the way the 3D section looks: north is on the left.
export function sectionEast(cutX,y1,scale,left,zero){
 const py=y=>n1(left+(y1-y)*scale),pz=z=>n1(zero-z*scale);
 const ring=points=>'M'+points.map(([y,z])=>py(y)+' '+pz(z)).join('L')+'Z';
 const cuts=list=>list.filter(e=>{const b=box(e);return b.x0<=cutX&&cutX<=b.x1;});
 // A ramp is cut along its slope: the top follows the two edges the plane crosses.
 const slope=e=>{const f=e.footprint,top=[];
  f.forEach((p,i)=>{const q=f[(i+1)%f.length];if((p[0]-cutX)*(q[0]-cutX)<=0&&p[0]!==q[0]){const t=(cutX-p[0])/(q[0]-p[0]);top.push([p[1]+t*(q[1]-p[1]),e.topHeights[i]+t*(e.topHeights[(i+1)%f.length]-e.topHeights[i])]);}});
  top.sort((a,c)=>a[0]-c[0]);return ring([[top[0][0],e.base],top[0],top.at(-1),[top.at(-1)[0],e.base]]);};
 const flat=e=>{const b=box(e),side=(h,i,pick)=>pick(...h.map(p=>p[i]));
  const gaps=(e.holes??[]).filter(h=>side(h,0,Math.min)<=cutX&&cutX<=side(h,0,Math.max)).map(h=>[side(h,1,Math.min),side(h,1,Math.max)]).sort((a,c)=>a[0]-c[0]);
  let from=b.y0;const out=[];for(const [a,c] of gaps){out.push([from,a]);from=c;}out.push([from,b.y1]);
  return out.map(([a,c])=>ring([[a,b.z0],[c,b.z0],[c,b.z1],[a,b.z1]])).join('');};
 // A wall that runs east to west is sliced through its thickness, and stops where the plane passes through a door.
 const upright=e=>{const b=box(e),gaps=(e.profileHoles??[]).filter(h=>Math.min(...h.map(p=>p[0]))<cutX&&cutX<Math.max(...h.map(p=>p[0]))).map(h=>[Math.min(...h.map(p=>p[1])),Math.max(...h.map(p=>p[1]))]).sort((a,c)=>a[0]-c[0]);
  let from=b.z0;const out=[];for(const [a,c] of gaps){if(a>from)out.push([from,a]);from=c;}out.push([from,b.z1]);
  return out.map(([a,c])=>ring([[b.y0,a],[b.y1,a],[b.y1,c],[b.y0,c]])).join('');};
 // A wall that runs north to south shows its whole face with its openings; every other piece shows the slice the plane takes.
 const path=e=>e.profile?.axis==='x'?upright(e):e.profile?ring(e.profile.points)+(e.profileHoles??[]).map(ring).join(''):e.topHeights?slope(e):flat(e);
 const shape=(e,id,{fill=fillOf(e),pick=true,extra=''}={})=>'<path '+(pick?target(e.id,e.name)+' ':'')+tone(e,id,fill)+extra+' fill-rule="evenodd" d="'+path(e)+'"/>';
 const dim=(y,z0,z1,label,side=1)=>'<path d="M'+py(y)+' '+pz(z0)+'V'+pz(z1)+'M'+(py(y)-4)+' '+pz(z0)+'h8M'+(py(y)-4)+' '+pz(z1)+'h8" stroke="'+ink.pickLine+'" fill="none"/>'+text(py(y)+7*side,(pz(z0)+pz(z1))/2+4,label,{fill:ink.text,anchor:side>0?'start':'end'});
 const span=(y0,y2,z,label)=>'<path d="M'+py(y0)+' '+pz(z)+'H'+py(y2)+'M'+py(y0)+' '+(pz(z)-4)+'v8M'+py(y2)+' '+(pz(z)-4)+'v8" stroke="'+ink.pickLine+'" fill="none"/>'+text((py(y0)+py(y2))/2,pz(z)-6,label,{fill:ink.text,anchor:'middle'});
 const person=(y,z)=>'<g fill="'+ink.soft+'"><circle cx="'+py(y)+'" cy="'+pz(z+1.58)+'" r="'+n1(.12*scale)+'"/><path d="'+ring([[y-.2,z+1.42],[y+.2,z+1.42],[y+.14,z],[y-.14,z]])+'"/></g>';
 // The earth the museum is sunk into: level outside the basalt walls, dug out to the underside of the basement slab between them.
 const ground=(edge,bottom)=>'<path d="'+ring([[edge,0],[OUT,0],[OUT,B1-.3],[-OUT,B1-.3],[-OUT,0],[-edge,0],[-edge,bottom],[edge,bottom]])+'" fill="'+earth+'" stroke="'+ink.soft+'" stroke-width=".8"/>';
 return {py,pz,scale,ring,cuts,shape,dim,span,person,ground};
}
