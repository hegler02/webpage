// Shared pieces of the Fallingwater sheets: the model, its tones, one plan per storey and a section seen looking east.
import {fallingwaterModel,F1,F2,F3} from './src/fallingwater-model.mjs';
import {ink,n1,box,target,text,tone} from './salk-plan-parts.mjs';
export {ink,n1,box,target,frame,text,tone,planView} from './salk-plan-parts.mjs';

export const model=fallingwaterModel();
export const own=model.elements.filter(e=>!e.context),context=model.elements.filter(e=>e.context);
export const byId=id=>model.elements.find(e=>e.id===id);
export const stone='#bdb199',concrete='#e6d6b0',walnut='#cfb18c',earth='#e3e3d6';
// Sandstone reads grey, painted concrete ochre; the first bolster is the only one built of stone.
export const fillOf=e=>e.kind==='window-glass'?ink.glass:e.kind==='paving'||e.kind==='stair'?ink.paving:e.kind==='wall'||e.id==='bolster-1'?stone:e.kind==='furniture'?walnut:e.kind==='finish'?e.color:e.kind==='frame'?ink.line:concrete;
export const lit=(d,id,fill)=>'fill="'+(d.id===id?ink.pick:fill)+'" stroke="'+(d.id===id?ink.pickLine:ink.line)+'" stroke-width="'+(d.id===id?2.5:1)+'"';
export const number=v=>v.toLocaleString('ko-KR',{maximumFractionDigits:1});
export const LEVEL={1:F1,2:F2,3:F3};
// Which storey a height belongs to; a conduit cast in a floor counts with the room above it.
export const floorOf=z=>z>=F3-.2?3:z>=F2-.2?2:1;

// The stream, sampled from the land once so that the sheets never load the 3D scene: the pool above the falls, the falls line
// and the pool below in plan, and the ground under the section line.
export const land={
 upper:[[24,.8],[21,.2],[18,.3],[16.5,.5],[12,.5],[10.5,.4],[9,.7],[7.5,1.1],[6,1.5],[4.5,2.2],[3,2.4],[1.5,2.3],[0,1.8],[-1.5,.4],[-2.2,-.3],[8.4,-6.9],[9,-7.2],[10.5,-6.8],[12,-6.9],[16.5,-6.9],[18,-6.8],[21,-6.7],[24,-6.4]],
 lip:[[-2.2,-.3],[8.4,-6.9]],
 lower:[[-2.2,-.3],[-3,-2.1],[-4.5,-3.4],[-6,-4.7],[-7.5,-6.5],[-9,-10.1],[-9,-12],[5,-12],[6,-10.5],[7.5,-7.3],[8.4,-6.9]],
 drive:[[-9,12.2],[-9,8.3],[17.2,8.3],[17.2,.9],[23.6,.9],[23.6,12.2]],
 far:[[17.2,-7.6],[23.6,-7.6],[23.6,-12],[17.2,-12]],
 ground:[[14,6.11],[13.5,4.38],[13,2.97],[12.5,2.55],[7.5,2.54],[7,2.35],[6.5,1.49],[6,.56],[5.5,.24],[3,.24],[2.5,.22],[2,.07],[1.5,-.15],[1,-.32],[.5,-.47],[0,-.5],[-5,-.44],[-5.5,-3.82],[-6,-6.87],[-10,-6.89]],
 water:{edge:1.85,lip:-5.13,foot:-5.9,drop:-6.1}
};

// The drive, the far bank and the stream around the house, for any plan that shows the ground.
export const siteGround=v=>{const area=(points,fill,extra='')=>'<path d="'+v.ring(points)+'" fill="'+fill+'"'+extra+'/>';
 return area(land.drive,ink.paving)+area(land.far,ink.paving)+area(land.upper,ink.water)+area(land.lower,ink.water,' fill-opacity=".6"')+
  '<path d="M'+land.lip.map(p=>v.px(p[0])+' '+v.py(p[1])).join('L')+'" stroke="white" stroke-width="2" stroke-dasharray="2 3" fill="none"/>';};

// One storey cut 1.2 m above its floor: the plates underfoot, then what stands on them.
const storeys=Object.fromEntries([1,2,3].map(f=>{
 const up=own.filter(e=>e.base<LEVEL[f]+1.2&&e.base+e.height>LEVEL[f]+.05),of=(...kinds)=>up.filter(e=>kinds.includes(e.kind));
 const plates=own.filter(e=>(e.kind==='paving'&&Math.abs(e.base+e.height-LEVEL[f])<.5)||(f===1&&(e.id==='bridge-deck'||(e.id.startsWith('hatch-')&&e.kind!=='window-glass')))||(f===3&&e.id==='slab-3'));
 return [f,{plates:plates.sort((a,b)=>(b.kind==='floor')-(a.kind==='floor')),finishes:f===1?[byId('rug-1')]:[],stairs:of('stair'),furniture:of('furniture'),solid:of('wall','parapet'),panes:of('window-glass'),posts:of('frame')}];
}));
export function storeyPlan(v,id,f,{furnished=true,pick=true,below=false}={}){
 const s=storeys[f],shape=(e,fill,p=pick)=>v.shape(e,id,{fill,pick:p});
 const glass=e=>{const b=box(e),along=b.x1-b.x0>b.y1-b.y0,x=(b.x0+b.x1)/2,y=(b.y0+b.y1)/2,on=e.id===id;
  return '<path '+(pick?target(e.id,e.name)+' ':'')+'d="M'+v.px(along?b.x0:x)+' '+v.py(along?y:b.y0)+'L'+v.px(along?b.x1:x)+' '+v.py(along?y:b.y1)+'" stroke="'+(on?ink.pickLine:ink.glass)+'" stroke-width="'+(on?4:2.4)+'" pointer-events="stroke"/>';};
 const treads=e=>{const b=box(e),n=Math.round((b.x1-b.x0)/.26);let d='';for(let i=1;i<n;i++)d+='M'+v.px(b.x0+(b.x1-b.x0)*i/n)+' '+v.py(b.y0)+'V'+v.py(b.y1);
  return '<path d="'+d+'" stroke="'+ink.edge+'" stroke-width=".6" fill="none" pointer-events="none"/>';};
 // The storey below shows faintly where this one steps back from it.
 const under=below&&f>1?[...storeys[f-1].plates,...storeys[f-1].solid.filter(e=>e.kind==='parapet')].map(e=>shape(e,ink.far,false)).join(''):'';
 return under+s.plates.map(e=>shape(e,e.kind==='floor'?concrete:e.id==='boulder'?stone:ink.paving)).join('')+s.finishes.map(e=>shape(e,e.color)).join('')+s.stairs.map(e=>shape(e,ink.slab)+treads(e)).join('')+
  (furnished?s.furniture.map(e=>shape(e,walnut)).join(''):'')+s.solid.map(e=>shape(e,fillOf(e))).join('')+s.panes.map(glass).join('')+s.posts.map(e=>shape(e,ink.line,false)).join('');
}

// A section cut at x and seen looking east, the way the 3D section looks: north is on the left.
export function sectionEast(cutX,y1,scale,left,zero){
 const py=y=>n1(left+(y1-y)*scale),pz=z=>n1(zero-z*scale);
 const ring=points=>'M'+points.map(([y,z])=>py(y)+' '+pz(z)).join('L')+'Z';
 const cuts=list=>list.filter(e=>{const b=box(e);return b.x0<=cutX&&cutX<=b.x1;});
 // Openings in a slab show as gaps where the cut runs through them.
 const spans=e=>{const b=box(e),side=(h,i,pick)=>pick(...h.map(p=>p[i]));
  const gaps=(e.holes??[]).filter(h=>side(h,0,Math.min)<=cutX&&cutX<=side(h,0,Math.max)).map(h=>[side(h,1,Math.min),side(h,1,Math.max)]).sort((a,c)=>a[0]-c[0]);
  let from=b.y0;const out=[];for(const [a,c] of gaps){out.push([from,a]);from=c;}out.push([from,b.y1]);
  return out.map(([a,c])=>ring([[a,b.z0],[c,b.z0],[c,b.z1],[a,b.z1]])).join('');};
 const shape=(e,id,{fill=fillOf(e),pick=true,extra=''}={})=>'<path '+(pick?target(e.id,e.name)+' ':'')+tone(e,id,fill)+extra+' d="'+(e.profile&&e.profile.axis!=='x'?ring(e.profile.points):spans(e))+'"/>';
 const dim=(y,z0,z1,label)=>'<path d="M'+py(y)+' '+pz(z0)+'V'+pz(z1)+'M'+(py(y)-4)+' '+pz(z0)+'h8M'+(py(y)-4)+' '+pz(z1)+'h8" stroke="'+ink.pickLine+'" fill="none"/>'+text(py(y)+7,(pz(z0)+pz(z1))/2+4,label,{fill:ink.text});
 const span=(y0,y2,z,label)=>'<path d="M'+py(y0)+' '+pz(z)+'H'+py(y2)+'M'+py(y0)+' '+(pz(z)-4)+'v8M'+py(y2)+' '+(pz(z)-4)+'v8" stroke="'+ink.pickLine+'" fill="none"/>'+text((py(y0)+py(y2))/2,pz(z)-6,label,{fill:ink.text,anchor:'middle'});
 const person=(y,z)=>'<g fill="'+ink.soft+'"><circle cx="'+py(y)+'" cy="'+pz(z+1.58)+'" r="'+n1(.12*scale)+'"/><path d="'+ring([[y-.2,z+1.42],[y+.2,z+1.42],[y+.14,z],[y-.14,z]])+'"/></g>';
 // The rock under the cut, the pool above the falls, the falling sheet and the pool below.
 const ground=bottom=>'<path d="'+ring([...land.ground,[land.ground.at(-1)[0],bottom],[land.ground[0][0],bottom]])+'" fill="'+earth+'" stroke="'+ink.soft+'" stroke-width=".8"/>';
 const water=()=>{const w=land.water,bed=land.ground.filter(([y,z])=>y<w.edge&&y>w.lip&&z<0);
  return '<g fill="'+ink.water+'"><path d="'+ring([[w.edge,0],...bed,[w.lip,0]])+'"/><path d="'+ring([[w.lip+.15,0],[w.lip-.2,0],[w.foot-.25,w.drop],[w.foot+.2,w.drop]])+'" fill-opacity=".75"/><path d="'+ring([[w.foot+.15,w.drop],[land.ground.at(-1)[0],w.drop],[land.ground.at(-1)[0],w.drop-.78],[w.foot,w.drop-.78]])+'"/></g>';};
 return {py,pz,scale,ring,cuts,shape,dim,span,person,ground,water};
}
