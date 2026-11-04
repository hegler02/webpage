import {apartmentFireLesson} from './src/apartment-fire-lesson.mjs';
import {apartment,apartmentArea} from './src/apartment-project.mjs';
import {apartmentAssemblies} from './src/apartment-materials.mjs';
const X=x=>150+x*78,Y=y=>730-y*78;
const rect=b=>`x="${X(b[0])}" y="${Y(b[3])}" width="${(b[2]-b[0])*78}" height="${(b[3]-b[1])*78}"`;
const pts=points=>points.map(p=>`${X(p[0])},${Y(p[1])}`).join(' ');
export function apartmentPlan({model,electric,rebar,fire,sheet='A-201',selected=null}){
 const title=apartment.sheets.find(s=>s.id===sheet)?.title??'세대 평면도';
 let body='';const selectable=(id,name,content)=>`<g data-object="${id}" tabindex="0" role="button" aria-label="${name} 도면에서 선택">${content}</g>`;
 if(sheet.startsWith('M-')){
  const assemblies=apartmentAssemblies.filter(a=>a.sheet===sheet);
  for(const [j,a]of assemblies.entries()){
   const y=140+j*290;body+=`<text x="75" y="${y-25}" font-size="22" font-weight="700">${a.name}</text>`;
   let x=80;for(const l of a.layers){const width=Math.max(24,l.mm*.9);body+=selectable('assembly-'+a.id+'-'+l.id,l.name,`<rect x="${x}" y="${y}" width="${width}" height="180" fill="${selected==='assembly-'+a.id+'-'+l.id?'#efc575':l.color}" stroke="#6e8586"/pages/guardhouse-classroom/>`);x+=width+16;}
   a.layers.forEach((l,i)=>{body+=`<text x="540" y="${y+20+i*35}" font-size="17">${i+1}. ${l.name} · ${l.mm} mm</text>`;});
  }
  body+='<text x="75" y="760" font-size="14">층을 눌러 역할을 확인하세요. 얇은 층은 선택하기 쉽도록 확대 표시했습니다.</text>';
 }else if(sheet==='E-203'){
  body=selectable('ADB','세대 분전반','<rect x="50" y="80" width="150" height="560" rx="12" fill="#e4edea" stroke="#3c6d71"/pages/guardhouse-classroom/><text x="125" y="350" text-anchor="middle">ADB · 220 V</text>');
  for(const [i,c]of electric.circuits.entries()){const y=125+i*108;body+=`<path d="M200 ${y}H270" fill="none" stroke="${c.color}" stroke-width="4"/pages/guardhouse-classroom/><rect x="270" y="${y-28}" width="160" height="56" rx="8" fill="#fff" stroke="${c.color}"/pages/guardhouse-classroom/><text x="350" y="${y-5}" text-anchor="middle">${c.id} ${c.breaker} A</text><text x="350" y="${y+17}" text-anchor="middle" font-size="13">${c.name}</text>`;const loads=electric.devices.filter(d=>d.circuit===c.id&&d.watts);for(const [j,d]of loads.entries()){const xx=480+(j%4)*116,yy=y-25+Math.floor(j/4)*35;body+=selectable(d.id,d.name,`<path d="M430 ${y}H${xx}" stroke="${c.color}" fill="none"/pages/guardhouse-classroom/><rect x="${xx}" y="${yy}" width="104" height="30" rx="5" fill="${selected===d.id?'#ffe2a2':'#f3f7f7'}" stroke="${c.color}"/pages/guardhouse-classroom/><text x="${xx+52}" y="${yy+20}" text-anchor="middle" font-size="13">${d.id} · ${d.watts} W</text>`);}}
 }else if(sheet==='A-202'){
  body=`<text x="90" y="120">거실 단면 · 구조바닥 SFL = 0</text>`;
  for(const [id,name,x,y,w,h,fill]of [['apartment-floor','세대 바닥판',90,600,756,27,'#b1b9b8'],['apartment-upper','윗층 바닥판',90,168,756,27,'#b1b9b8'],['ceiling-living','천장',90,220.2,756,1.8,'#d8cda8']])body+=selectable(id,name,`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${selected===id?'#e7ae4a':fill}"/pages/guardhouse-classroom/><text x="${x+10}" y="${y-15}">${name}</text>`);
  body+='<rect x="90" y="582" width="756" height="18" fill="#c9b48e"/pages/guardhouse-classroom/><path d="M880 582V222M865 582H895M865 222H895" stroke="#6f8f96"/pages/guardhouse-classroom/><text x="740" y="415">천장고 2,400 mm</text><text x="100" y="680">바닥 구성 120 mm · 천장 아래 2,520 mm · 윗층 구조판 하단 2,700 mm</text>';
 }else{
  for(const r of apartment.rooms)body+=selectable('room-'+r.id,r.name,`<rect ${rect(r.bounds)} fill="${selected==='room-'+r.id?'#ffe1a1':r.id==='bath'?'#e0edf0':r.id==='entry'?'#e5e8df':'#f3eee3'}"/pages/guardhouse-classroom/>`);
  for(const e of model.elements.filter(e=>!['floor','ceiling','roof'].includes(e.kind)&&e.base<1.4&&e.height>.025)){const p=e.footprint,b=[Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1])),Math.max(...p.map(v=>v[0])),Math.max(...p.map(v=>v[1]))],color=selected===e.id?'#e5ae4b':['wall','partition'].includes(e.kind)?'#879899':['window-glass','frame'].includes(e.kind)?'#67b3be':e.kind==='door'?'#baa17e':'#d5d4cb';body+=selectable(e.id,e.name,`<rect ${rect(b)} fill="${color}" stroke="#83989d" stroke-width=".6"/pages/guardhouse-classroom/>`);}
  if(sheet==='A-201'){
   for(const o of model.openings.filter(o=>o.sill===0)){const e=model.elements.find(e=>e.id===o.id),p=e.footprint,ax=X(p[0][0]),ay=Y(p[0][1]),size=(o.end-o.start)*78,along=o.axis==='x';body+=selectable(o.id,'문 여닫는 범위',along?`<path d="M${ax} ${ay}v-${size}a${size} ${size} 0 0 1 ${size} ${size}" fill="none" stroke="#ac9471" stroke-width="1.1"/pages/guardhouse-classroom/>`:`<path d="M${ax} ${ay}h${size}a${size} ${size} 0 0 0 -${size} -${size}" fill="none" stroke="#ac9471" stroke-width="1.1"/pages/guardhouse-classroom/>`);}
   for(const r of apartment.rooms.slice(0,3)){body+=`<path d="M${X(r.bounds[0])} 122H${X(r.bounds[2])}M${X(r.bounds[0])} 118V136M${X(r.bounds[2])} 118V136" stroke="#6e8991" fill="none"/pages/guardhouse-classroom/><text x="${X((r.bounds[0]+r.bounds[2])/2)}" y="112" text-anchor="middle" font-size="12">내부 폭 ${Math.round((r.bounds[2]-r.bounds[0])*1000)} mm</text>`;}
  }
  for(const r of apartment.rooms){const x=X(r.id==='living'?6.4:r.id.startsWith('bed')?r.bounds[2]-.60:(r.bounds[0]+r.bounds[2])/2),y=Y(r.id==='living'?2.6:r.id.startsWith('bed')?5.05:r.bounds[1]+.4);body+=`<g aria-hidden="true" pointer-events="none"><rect x="${x-53}" y="${y-15}" width="106" height="40" rx="5" fill="#ffffffdf"/pages/guardhouse-classroom/><text x="${x}" y="${y}" text-anchor="middle" font-size="14">${r.name}</text><text x="${x}" y="${y+17}" text-anchor="middle" font-size="11">${((r.bounds[2]-r.bounds[0])*(r.bounds[3]-r.bounds[1])).toFixed(2)} ㎡</text></g>`;}
  if(sheet==='S-201')for(const b of rebar.bars)body+=`<polyline points="${pts([b.a,b.b])}" fill="none" stroke="#ab6345" stroke-width=".75" opacity=".6"/pages/guardhouse-classroom/>`;
  if(sheet.startsWith('E-')){
   const devices=electric.devices.filter(d=>d.kind==='panel'||(sheet==='E-201'?['light','switch'].includes(d.kind):!['light','switch'].includes(d.kind)));
   for(const r of electric.routes.filter(r=>devices.some(d=>d.id===r.target)))body+=`<polyline points="${pts(r.points)}" fill="none" stroke="${selected===r.target?'#e3a32b':electric.circuits.find(c=>c.id===r.circuit).color}" stroke-width="${selected===r.target?3:1.2}" stroke-dasharray="5 4" opacity=".8"/pages/guardhouse-classroom/>`;
   for(const d of devices){const x=X(d.pos[0]),y=Y(d.pos[1]),color=selected===d.id?'#f4bd53':d.on?'#fff0b7':'#e6eeeb';body+=selectable(d.id,d.name,`<rect x="${x-14}" y="${y-14}" width="28" height="28" rx="${d.kind==='switch'?14:3}" fill="${color}" stroke="#637c7f"/pages/guardhouse-classroom/><text x="${x+18}" y="${y+4}" font-size="11">${d.id}</text>`);}
  }
  if(sheet==='F-201'){
   const lesson=apartmentFireLesson(fire,fire.signalId??selected??'AD1');
   body+=`<polyline points="${pts(lesson.signal)}" fill="none" stroke="#d36c4c" stroke-width="2" stroke-dasharray="6 4"/pages/guardhouse-classroom/><polyline points="${pts(lesson.escape)}" fill="none" stroke="#248976" stroke-width="4" marker-end="url(#exit-arrow)"/pages/guardhouse-classroom/>`;
   for(const d of fire.devices){const x=X(d.pos[0]),y=Y(d.pos[1]);body+=selectable(d.id,d.name,`<circle cx="${x}" cy="${y}" r="14" fill="${d.on?'#f3906d':'#fae7de'}" stroke="${selected===d.id?'#e6a126':'#b4573b'}" stroke-width="${selected===d.id?4:1}"/pages/guardhouse-classroom/><text x="${x+18}" y="${y+4}" font-size="11">${d.id}</text>`);}
   body+='<text x="70" y="85" font-size="12">주황 점선: 감지 신호 · 초록선: 현관까지 피난 경로</text>';
  }
  body+=`<path d="M150 768H805.2M150 760V776M805.2 760V776" stroke="#668990"/pages/guardhouse-classroom/><text x="478" y="799" text-anchor="middle">실내 가로 8,400 mm · 세로 7,300 mm</text>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 820" role="group" aria-label="${sheet} ${title}"><defs><marker id="exit-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#248976"/pages/guardhouse-classroom/></marker></defs><rect width="1000" height="820" fill="#f9fbfb"/pages/guardhouse-classroom/><g font-family="Malgun Gothic, sans-serif" fill="#2c4e59"><text x="55" y="42" font-size="20" font-weight="700">${sheet} · ${title}</text><text x="55" y="67" font-size="12">교육용 샘플 2 · 자체 제작 평면 · 방별 내부면적 합계 ${apartmentArea().toFixed(1)} ㎡</text>${body}</g></svg>`;
}
