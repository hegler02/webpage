// Projection along CAD +Y. Retain rear objects and distinguish the cut surface.
export function sectionProjection(elements, cutY) {
  if (!Number.isFinite(cutY)) throw new TypeError('A section needs a finite cut coordinate');
  return elements.map(e=>{
      if(e.footprint)return e;
      if(!e.pos?.every(Number.isFinite)||!e.size?.every(n=>Number.isFinite(n)&&n>0))return e;
      const [x,y,z]=e.pos,[w,d,h]=e.size;
      return {...e,footprint:[[x-w/2,y-d/2],[x+w/2,y+d/2]],base:z-h/2,height:h};
    }).filter(e=>e.footprint?.length && e.footprint.every(p=>p.every(Number.isFinite)) && Number.isFinite(e.base) && Number.isFinite(e.height) && e.height>0)
    .map(e=>{
      const xs=e.footprint.map(p=>p[0]),ys=e.footprint.map(p=>p[1]);
      return {id:e.id,name:e.name,kind:e.kind,left:Math.min(...xs),right:Math.max(...xs),
        bottom:e.base,top:e.base+e.height,front:Math.min(...ys),back:Math.max(...ys)};
    }).filter(e=>e.back>=cutY)
    .map(e=>({...e,cut:e.front<=cutY}))
    .sort((a,b)=>b.front-a.front);
}
