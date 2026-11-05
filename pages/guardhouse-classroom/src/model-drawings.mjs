// Geometry-derived teaching details shared by authored samples. Dimensions stay in metres.
export function elementBox(e){
  if(e.footprint)return {left:Math.min(...e.footprint.map(p=>p[0])),right:Math.max(...e.footprint.map(p=>p[0])),front:Math.min(...e.footprint.map(p=>p[1])),back:Math.max(...e.footprint.map(p=>p[1])),bottom:e.base,top:e.base+e.height};
  const [x,y,z]=e.pos,[w,d,h]=e.size;return {left:x-w/2,right:x+w/2,front:y-d/2,back:y+d/2,bottom:z-h/2,top:z+h/2};
}
export function openingSchedule(model,finish=0){
  return model.openings.map(o=>{const e=model.elements.find(e=>e.id===o.id);if(!e)throw Error('Opening has no model: '+o.id);return {id:e.id,name:e.name,width:o.end-o.start,height:e.height,sill:e.base-finish,axis:o.axis,kind:e.kind};});
}
export function serviceSections(model){return model.elements.filter(e=>e.serviceOpening).map(e=>({id:e.id,name:e.name,host:elementBox(e),...e.serviceOpening}));}
const mm=n=>Math.round(n*1000).toLocaleString('ko-KR');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function detailDrawing({model,view,selected,finish=0,attribute='object'}){
  const group=(id,name,svg)=>`<g data-${attribute}="${id}" tabindex="0" role="button" aria-label="${esc(name)}">${svg}</g>`;
  if(view==='openings'){
    const rows=openingSchedule(model,finish),rowHeight=Math.min(58,620/rows.length);
    return `<text x="65" y="115" font-size="18">창호를 누르면 같은 문·창을 3D에서 선택합니다.</text><text x="65" y="155" font-size="14">부재 ID / 종류</text><text x="520" y="155" font-size="14">폭 × 높이 (mm)</text><text x="790" y="155" font-size="14">마감면 위 하단</text>`+rows.map((r,i)=>{const y=172+i*rowHeight;return group(r.id,r.name,`<rect x="55" y="${y}" width="890" height="${rowHeight-4}" rx="5" fill="${r.id===selected?'#ffe1a1':'#eaf1ef'}"/><text x="70" y="${y+rowHeight*.58}" font-size="15">${r.id} · ${r.kind==='door'?'문':'창'}</text><text x="520" y="${y+rowHeight*.58}" font-size="16">${mm(r.width)} × ${mm(r.height)}</text><text x="790" y="${y+rowHeight*.58}" font-size="16">${mm(r.sill)} mm</text>`);}).join('');
  }
  if(view==='services'){
    return serviceSections(model).map((s,i)=>{const x=60+(i%2)*460,y=130+Math.floor(i/2)*210,w=400,h=105,axis=s.axis??(s.id.includes('west')?'y':'x'),span=axis==='x'?s.host.right-s.host.left:s.host.back-s.host.front,scale=w/span,zScale=h/(s.host.top-s.host.bottom),u=axis==='x'?s.host.left:s.host.front;
      return group(s.id,s.name,`<text x="${x}" y="${y}" font-size="15">${s.id}</text><rect x="${x}" y="${y+18}" width="${w}" height="${h}" fill="${s.id===selected?'#efce9c':'#c5d0cd'}" stroke="#617d82"/><rect x="${x+(s.center-s.width/2-u)*scale}" y="${y+18+(s.host.top-s.elevation-s.height/2)*zScale}" width="${s.width*scale}" height="${s.height*zScale}" fill="white" stroke="#a36a24"/><text x="${x}" y="${y+150}" font-size="14">관통부 ${mm(s.width)} × ${mm(s.height)} mm · 중심 ${mm(s.elevation)} mm</text><text x="${x}" y="${y+175}" font-size="13">벽 상부 계획 개구부 · 실제 시공은 구조 상세와 조정</text>`);
    }).join('');
  }
  if(view==='elevation'){
    const wallParts=model.elements.filter(e=>['wall','partition','door','window-glass','frame'].includes(e.kind));
    const front=Math.min(...wallParts.map(e=>elementBox(e).front));
    const parts=wallParts.filter(e=>elementBox(e).front<front+.24).sort((a,b)=>elementBox(b).front-elementBox(a).front);
    const left=Math.min(...parts.map(e=>elementBox(e).left)),right=Math.max(...parts.map(e=>elementBox(e).right)),scale=850/(right-left),z=v=>590-v*scale;
    return parts.map(e=>{const b=elementBox(e);return group(e.id,e.name,`<rect x="${75+(b.left-left)*scale}" y="${z(b.top)}" width="${Math.max(1,(b.right-b.left)*scale)}" height="${(b.top-b.bottom)*scale}" fill="${selected===e.id?'#e9b35d':e.kind==='window-glass'?'#9fcbd0':e.kind==='door'?'#c9b89f':'#d7e0db'}" stroke="#799297"/>`);}).join('')+`<path d="M75 620H925" stroke="#799297"/><text x="500" y="654" text-anchor="middle" font-size="18">외곽 폭 ${mm(right-left)} mm</text><text x="75" y="705" font-size="16">전면에서 본 벽·문·창 · 같은 부재를 선택하여 치수와 재료를 읽습니다.</text>`;
  }
  throw Error('Unsupported detail view: '+view);
}
