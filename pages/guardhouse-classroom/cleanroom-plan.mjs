import {bay, bayModel,panel,equipment,fireDevices,rooms,sheets} from './src/cleanroom-project.mjs';

import {assemblies,stripBars,strip} from './src/cleanroom-construction.mjs';
import {detailDrawing} from './src/model-drawings.mjs';
import {sectionProjection} from './src/section-projection.mjs';

function sectionPlan(assembly,index){
  const a=assemblies[assembly],rows=a.layers.map(([name,mm,color],i)=>{
    const y=94+i*98;
    return '<g data-layer="'+i+'" tabindex="0" role="button" aria-label="'+name+'"><rect x="46" y="'+y+'" width="159" height="58" fill="'+color+'" stroke="'+(i===index?'#9f5824':'#7f9295')+'" stroke-width="'+(i===index?4:1)+'"/><text x="239" y="'+(y+22)+'" font-size="19">'+name+'</text><text x="239" y="'+(y+48)+'" fill="#536f74">'+mm+' mm</text></g>';
  }).join('');
  return '<svg viewBox="0 0 600 448" aria-label="재료 단면도"><text x="46" y="49" font-size="20">'+a.sheet+' · '+a.name+'</text>'+rows+'<text x="46" y="408" font-size="14">각 층을 펼쳐 표시했습니다. 두께는 기입한 치수로 읽으세요.</text></svg>';
}
const sx=x=>56+x*72,sy=y=>405-y*72;
const coords=points=>points.map(([x,y])=>sx(x)+','+sy(y)).join(' ');
const model=bayModel();
const elements=model.elements.filter(e=>!e.id.startsWith('tile-')&&e.base<1.55&&!['south-cut','south-wall'].includes(e.id));
function roomLabels(){
  return rooms.map(r=>'<g role="button" tabindex="0" data-device="'+r.id+'" aria-label="'+r.name+' 위치"><rect x="'+sx(r.bounds[0]+.15)+'" y="'+sy(1.9)+'" width="96" height="36" rx="4" fill="white"/><text x="'+sx(r.bounds[0]+.27)+'" y="'+(sy(1.9)+23)+'" font-size="15">'+r.name+'</text></g>').join('')+
    '<path d="M40 '+sy(sheets.find(s=>s.view==='section').cutY)+'H590" stroke="#9f5824" stroke-dasharray="7 5"/><text x="35" y="'+(sy(sheets.find(s=>s.view==='section').cutY)-8)+'" font-size="13">A</text><text x="590" y="'+(sy(sheets.find(s=>s.view==='section').cutY)-8)+'" font-size="13">A</text>';
}
function buildingSection(sheet,id){
  const y=sheet.cutY,scale=70,z=height=>330-height*scale;
  const cut=sectionProjection([...model.elements,panel,...equipment],y);
  const shapes=cut.map(e=>{
    return '<rect data-device="'+e.id+'" data-section-cut="'+e.cut+'" role="button" tabindex="0" aria-label="'+e.name+'" x="'+(56+e.left*scale)+'" y="'+z(e.top)+'" width="'+Math.max(1,(e.right-e.left)*scale)+'" height="'+Math.max(1,(e.top-e.bottom)*scale)+'" fill="'+(e.id===id?'#e8b572':e.cut?'#9caeae':'#e5ece9')+'" stroke="'+(e.cut?'#607f83':'#adbcbd')+'"/>';
  }).join('');
  return '<svg viewBox="0 0 640 452" aria-label="'+sheet.title+'"><rect width="640" height="452" fill="#f8fbfa"/><text x="46" y="38" font-size="18">'+sheet.id+' · '+sheet.title+'</text><text x="46" y="64" font-size="13">평면 A-A 절단선 · Y = '+y.toFixed(2)+' m</text>'+shapes+'<path d="M40 '+z(bay.ceiling)+'H590" stroke="#247c86" stroke-dasharray="6 4"/><text x="290" y="'+(z(bay.ceiling)-10)+'" font-size="14">설비 기준 높이 '+(bay.ceiling*1000)+' mm</text><text x="56" y="390" font-size="14">바닥 기준 0 mm · 아래 구조 바닥판 '+Math.round(model.elements.find(e=>e.id==='slab').height*1000)+' mm</text></svg>';
}
export function bayPlan({tab,electric,id,path=[],color='#177e88',alarm,assembly,layer=0,sheet='A-301',fire:fireState}){
  const drawing=sheets.find(s=>s.id===sheet);
  if(tab==='building'&&['openings','elevation'].includes(drawing?.view))return '<svg viewBox="0 0 1000 820" aria-label="'+drawing.title+'"><rect width="1000" height="820" fill="#f8fbfa"/><g fill="#2c4e59"><text x="55" y="42" font-size="20">'+drawing.id+' · '+drawing.title+'</text>'+detailDrawing({model,view:drawing.view,selected:id,attribute:'device'})+'</g></svg>';
  if(tab==='electrical'&&drawing?.view==='circuit')return '<svg viewBox="0 0 640 452" aria-label="분전반 분기 회로도"><text x="35" y="45" font-size="18">E-302 · DB3 분전반 분기 회로도</text><g data-device="DB3" role="button" tabindex="0"><rect x="35" y="100" width="100" height="235" rx="8" fill="#c9dbda"/><text x="55" y="215">DB3</text><text x="48" y="244">220 V</text></g>'+electric.circuits.map((c,i)=>{const y=140+i*150;return '<path d="M135 '+y+'H245" stroke="'+c.color+'" stroke-width="4"/><text x="150" y="'+(y-18)+'" font-size="14">'+c.id+' · '+c.breaker+' A</text><text x="150" y="'+(y+24)+'" font-size="12">'+c.area+' mm²</text>'+c.loads.map((d,j)=>'<g role="button" tabindex="0" data-device="'+d.id+'"><path d="M245 '+y+'H280V'+(y-35+j*70)+'H320" stroke="'+c.color+'" fill="none"/><rect x="320" y="'+(y-56+j*70)+'" width="260" height="42" rx="5" fill="'+(id===d.id?'#ffe1a1':'#ecf2ef')+'"/><text x="335" y="'+(y-30+j*70)+'" font-size="14">'+d.id+' · '+d.watts+' W · '+c.name+'</text></g>').join('');}).join('')+'<text x="35" y="410" font-size="13">차단기와 전선은 수업 비교값 · 기구를 눌러 같은 3D 위치 확인</text></svg>';
  if(tab==='building'&&drawing?.view==='section')return buildingSection(drawing,id);
  if(tab==='materials')return sectionPlan(assembly,layer);
  const fire=['test','fire-signal','fire'].includes(tab);
  const architectural=tab==='building',ceiling=architectural&&drawing?.view==='ceiling';
  const objects=tab==='structure'||architectural&&!ceiling?[]:fire?(fireState?.devices??fireDevices):[...(ceiling?[]:[panel]),...electric.devices];
  const ceilingGrid=ceiling?model.elements.filter(e=>e.id.startsWith('ceiling-panel-')).map(e=>'<polygon data-device="'+e.id+'" role="button" tabindex="0" aria-label="'+e.name+'" points="'+coords(e.footprint)+'" fill="'+(id===e.id?'#edbd78':'#eef3f0')+'" stroke="#a5b5b4" stroke-width=".7"/>').join(''):'';
  const outlines=elements.map(e=>'<polygon '+(architectural?'data-device="'+e.id+'" role="button" tabindex="0" aria-label="'+e.name+'" ':'')+'points="'+coords(e.footprint)+'" fill="'+(e.id==='slab'?'#f4f6f1':e.kind==='wall'?'#9caeae':'#cdd8d6')+'" stroke="#a5b5b4" stroke-width=".7"/>').join('');
  const labels=[[.78,.32,'전실'],[4.52,.43,'작업구역'],[4.62,4.54,'작업대']].map(([x,y,t])=>'<text x="'+sx(x)+'" y="'+sy(y)+'" text-anchor="middle" fill="#61797b" font-size="13">'+t+'</text>').join('');
  const cut=tab==='building'&&model.elements.find(e=>e.id===id);
  const room=rooms.find(r=>r.id===id),roomMark=architectural&&room?'<rect x="'+sx(room.bounds[0])+'" y="'+sy(room.bounds[3])+'" width="'+(room.bounds[2]-room.bounds[0])*72+'" height="'+(room.bounds[3]-room.bounds[1])*72+'" fill="#e8b572" opacity=".35" pointer-events="none"/>':'';
  let steel=cut?'<polygon points="'+coords(cut.footprint)+'" fill="#e8b572" stroke="#a25722" stroke-width="4"/>':'';
  if(tab==='structure'){
    const [x,y,r,b]=strip.bounds;
    steel='<rect x="'+sx(x)+'" y="'+sy(b)+'" width="'+(r-x)*72+'" height="'+(b-y)*72+'" fill="#fae4c7" stroke="#a66436"/>'+stripBars().map(line=>'<polyline points="'+coords(line)+'" stroke="#9e593b" stroke-width="1.5"/>').join('');
    steel+='<text x="'+(sx(r)+8)+'" y="'+(sy(b)+14)+'" fill="#794628" font-size="13">대표 폭 1 m</text>';
  }
  const symbols=objects.map(d=>{
    const selected=id===d.id;
    const fill=d.kind==='exit'?'#a4dbbb':d.kind==='alarm'&&alarm?'#f38c6d':fire?'#f3d9c9':d.on===false?'#d4d9da':d.kind==='ffu'?'#abd5d6':d.kind==='light'?'#ffe7ab':'#c1d1d6';
    const shape=d.kind==='ffu'?'<rect x="-24" y="-14" width="48" height="28" rx="3"/><circle r="9" fill="none"/>':d.kind==='light'?'<rect x="-30" y="-6" width="60" height="12" rx="2"/>':d.kind==='smoke'?'<circle r="10"/>':'<rect x="-9" y="-9" width="18" height="18" rx="3"/>';
    const interaction=['test','fire-signal'].includes(tab)?'role="img"':'role="button" tabindex="0" data-device="'+d.id+'"';
    return '<g '+interaction+' aria-label="'+d.id+' '+d.name+'" transform="translate('+sx(d.pos[0])+' '+sy(d.pos[1])+')"><rect x="-26" y="-17" width="52" height="35" fill="transparent"/><g fill="'+fill+'" stroke="'+(selected?'#aa5919':'#375e64')+'" stroke-width="'+(selected?3:1.5)+'">'+shape+'</g><text y="-20" font-size="13" fill="#24434b" text-anchor="middle">'+d.id+'</text></g>';
  }).join('');
  const route=path.length>1?'<polyline points="'+coords(path)+'" stroke="'+color+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="'+sx(path.at(-1)[0])+'" cy="'+sy(path.at(-1)[1])+'" r="6" fill="'+color+'"/>':'';
  return '<svg viewBox="0 0 640 452" aria-label="클린룸 '+(fire?'소방':architectural?'건축':'설비')+' 평면도"><rect width="640" height="452" fill="#f8fbfa"/>'+outlines+ceilingGrid+roomMark+labels+steel+route+symbols+(architectural&&!ceiling?roomLabels():'')+'<path d="M56 426h'+bay.width*72+'" stroke="#98aaac"/><text x="315" y="445" fill="#557477" font-size="12" text-anchor="middle">내부 '+(bay.width*1000).toLocaleString('ko-KR')+' × '+(bay.depth*1000).toLocaleString('ko-KR')+' mm</text></svg>';
}
