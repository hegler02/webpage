// Shared drawing helpers for the Salk sheets: one frame, one palette and projections taken straight from the model.
import {salkModel} from './src/salk-model.mjs';

export const model=salkModel();
export const own=model.elements.filter(e=>!e.context),context=model.elements.filter(e=>e.context);
export const ink={wall:'#9caeae',line:'#607f83',slab:'#f4f6f1',other:'#cdd8d6',edge:'#a5b5b4',pick:'#e8b572',pickLine:'#a25722',text:'#24434b',soft:'#61797b',glass:'#7fb2c9',water:'#9fc9d6',pit:'#dfe5df',paving:'#efe9dc',far:'#e5ece9',light:'#ffe7ab',exit:'#a4dbbb',fire:'#f3d9c9',off:'#d4d9da'};
export const hex=n=>'#'+n.toString(16).padStart(6,'0');
export const n1=v=>Math.round(v*10)/10;
export const box=e=>{const xs=e.footprint.map(p=>p[0]),ys=e.footprint.map(p=>p[1]);return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys),z0:e.base,z1:e.base+e.height};};
export const target=(id,name)=>'data-device="'+id+'" role="button" tabindex="0" aria-label="'+name+'"';
export const frame=(sheet,body)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 452" aria-label="'+sheet.title+'"><rect width="640" height="452" fill="#f8fbfa"/><text x="46" y="38" font-size="18">'+sheet.id+' · '+sheet.title+'</text>'+body+'</svg>';
export const text=(x,y,value,{size=12,fill=ink.soft,anchor='start'}={})=>'<text x="'+n1(x)+'" y="'+n1(y)+'" font-size="'+size+'" fill="'+fill+'" text-anchor="'+anchor+'">'+value+'</text>';
// Fill and outline of one element; the selected one always wears the same highlight.
export const tone=(e,id,fill)=>'fill="'+(e.id===id?ink.pick:fill)+'" stroke="'+(e.id===id?ink.pickLine:ink.edge)+'" stroke-width="'+(e.id===id?2:.6)+'"';
// What a cut plane shows: concrete reads dark whatever the element is.
export const cutFill=e=>e.kind==='window-glass'?ink.glass:e.kind==='furniture'?ink.other:e.kind==='finish'?'#c9a57e':e.kind==='water'?ink.water:ink.wall;
export const fills={wall:ink.wall,column:ink.wall,truss:ink.wall,parapet:ink.wall,floor:ink.slab,roof:ink.slab,paving:ink.paving,water:ink.water,'window-glass':ink.glass,frame:ink.line,furniture:ink.other,finish:'#c9a57e'};

// A plan projection: px/py turn metres into sheet pixels with north up.
export function planView(x0,y1,scale,left,top){
 const px=x=>n1(left+(x-x0)*scale),py=y=>n1(top+(y1-y)*scale);
 const ring=points=>'M'+points.map(([x,y])=>px(x)+' '+py(y)).join('L')+'Z';
 const shape=(e,id,{fill=fills[e.kind]??ink.other,pick=true}={})=>'<path '+(pick?target(e.id,e.name)+' ':'')+'d="'+ring(e.footprint)+(e.holes?.length&&e.holes.length<8?e.holes.map(ring).join(''):'')+'" fill-rule="evenodd" '+tone(e,id,fill)+'/>';
 const line=(points,color,{width=3,dash=''}={})=>'<polyline points="'+points.map(p=>px(p[0])+','+py(p[1])).join(' ')+'" stroke="'+color+'" stroke-width="'+width+'" fill="none" stroke-linejoin="round" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
 return {px,py,scale,ring,shape,line};
}

// A section cut at x: what the plane passes through, drawn against y (north to the right) and height.
export function sectionView(cutX,y0,scale,left,zero){
 const py=y=>n1(left+(y-y0)*scale),pz=z=>n1(zero-z*scale);
 const ring=points=>'M'+points.map(([y,z])=>py(y)+' '+pz(z)).join('L')+'Z';
 const cuts=elements=>elements.filter(e=>{const b=box(e);return b.x0<=cutX&&cutX<=b.x1;});
 function shape(e,id,{fill=fills[e.kind]??ink.other,pick=true}={}){
  const b=box(e),attrs=(pick?target(e.id,e.name)+' ':'')+tone(e,id,fill);
  if(e.profile&&e.profile.axis!=='x')return '<path '+attrs+' fill-rule="evenodd" d="'+ring(e.profile.points)+(e.profileHoles??[]).map(ring).join('')+'"/>';
  // Slots in a slab show as gaps where the cut runs through them.
  const gaps=(e.holes??[]).map(h=>({x0:Math.min(...h.map(p=>p[0])),x1:Math.max(...h.map(p=>p[0])),y0:Math.min(...h.map(p=>p[1])),y1:Math.max(...h.map(p=>p[1]))})).filter(h=>h.x0<=cutX&&cutX<=h.x1).sort((a,c)=>a.y0-c.y0);
  let from=b.y0;const spans=[];for(const g of gaps){spans.push([from,g.y0]);from=g.y1;}spans.push([from,b.y1]);
  return '<path '+attrs+' d="'+spans.map(([a,c])=>ring([[a,b.z0],[c,b.z0],[c,b.z1],[a,b.z1]])).join('')+'"/>';
 }
 const dim=(y,z0,z1,label)=>'<path d="M'+py(y)+' '+pz(z0)+'V'+pz(z1)+'M'+(py(y)-4)+' '+pz(z0)+'h8M'+(py(y)-4)+' '+pz(z1)+'h8" stroke="'+ink.pickLine+'" fill="none"/>'+text(py(y)+7,(pz(z0)+pz(z1))/2+4,label,{fill:ink.text});
 // A standing figure for scale, 1.7 m tall.
 const person=(y,z)=>'<g fill="'+ink.soft+'"><circle cx="'+py(y)+'" cy="'+pz(z+1.58)+'" r="'+n1(.12*scale)+'"/><path d="'+ring([[y-.2,z+1.42],[y+.2,z+1.42],[y+.14,z],[y-.14,z]])+'"/></g>';
 return {py,pz,scale,ring,cuts,shape,dim,person};
}
