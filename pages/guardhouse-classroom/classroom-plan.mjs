import {project,boundsOf} from './src/classroom-project.mjs';
import {expansionSVG,pitAnnotations} from './lesson-expansion-plan.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const n=v=>Number(v.toFixed(2));
export function sheetSVG({sheet,model,projections,electric,rebar,selected=null,fire,finish}){
 if(['fire-plan','fire-signal','materials'].includes(sheet.view))return expansionSVG({sheet,selected,fire,finish,basePlan:sheet.view==='fire-plan'?sheetSVG({sheet:{...sheet,view:'plan'},model,projections,electric,rebar,selected}):null});
 const view=sheet.view;let out=[];
 const line=(a,b,color='#66828b',width=1,id='',dash='')=>out.push(`<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''} ${id?`data-element="${esc(id)}"`:''}/>`);
 const text=(x,y,s,size=13,color='#294654',anchor='start')=>out.push(`<text x="${n(x)}" y="${n(y)}" font-family="Malgun Gothic, sans-serif" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`);
 const deviceAttrs=d=>`data-element="${d.id}" role="button" tabindex="0" aria-label="${esc(d.name)} 도면에서 선택"`;
 if(view==='circuit'){
  text(54,60,'단상 220 V · 60 Hz',20);text(54,88,'L 전원선 · N 중성선 · PE 보호접지 · 선 색은 회로 구분 표시이며 실제 전선 색상이 아닙니다',13);
  out.push(`<rect x="50" y="115" width="140" height="480" rx="12" fill="#e7edf2" stroke="#33566a" ${deviceAttrs(project.panel)}/>`);
  text(120,580,'DB1',17,'#24404f','middle');line([80,130],[80,510],'#ba8741',3);line([160,130],[160,570],'#3f8eab',3);text(80,125,'L',13);text(160,125,'N',13);
  project.circuits.forEach((c,i)=>{
   const y=155+i*115,calc=electric.circuits.find(e=>e.id===c.id),on=electric.devices.some(d=>d.circuit===c.id&&d.on);
   line([80,y],[940,y],c.color,2,c.id);out.push(`<rect x="215" y="${y-13}" width="80" height="26" rx="5" fill="white" stroke="${c.color}" data-circuit="${c.id}" role="button" tabindex="0" aria-label="${c.id} 회로 선택"/>`);text(255,y+5,c.breaker+' A',13,'#25414e','middle');
   text(320,y-14,`${c.id} · ${c.name} · ${calc.watts} W · ${calc.current.toFixed(2)} A · ${c.area} mm²`,15);
   text(210,y+35,'누전보호 30 mA',11);text(210,y+51,on?'전원 공급 중':'전원 꺼짐',11,on?'#258570':'#74828b');
   const loads=electric.devices.filter(d=>d.circuit===c.id&&d.watts),xs=loads.map((d,j)=>c.id==='L1'?[440,510,610,680,800,900][j]:450+j*130);
   line([160,y+67],[940,y+67],'#3f8eab',2);text(950,y+71,'N',12);
   if(c.id==='L1')for(const sw of electric.devices.filter(d=>d.kind==='switch')){const group=loads.map((d,j)=>d.switch===sw.id?xs[j]:null).filter(x=>x!==null),mid=(group[0]+group.at(-1))/2;line([mid,y],[mid,y+8],c.color,2,sw.id);line([mid,y+8],[mid+(sw.on?0:8),y+21],c.color,2,sw.id);line([mid,y+21],[mid,y+27],c.color,2,sw.id);line([group[0],y+27],[group.at(-1),y+27],c.color,2,sw.id);text(mid+10,y+18,sw.id,10);}
   loads.forEach((d,j)=>{const x=xs[j];line([x,y+(c.id==='L1'?27:0)],[x,y+34],c.color,2,d.id);line([x,y+54],[x,y+67],'#3f8eab',2,d.id);out.push(`<circle cx="${x}" cy="${y+44}" r="10" fill="${d.on?'#fff0b2':'#edf0f2'}" stroke="${selected===d.id?'#ef7425':c.color}" stroke-width="${selected===d.id?3:1.5}" ${deviceAttrs(d)}/>`);text(x,y+88,d.id,11,'#294654','middle');});
  });
  line([75,611],[350,611],'#3a9c61',3,'','8 4');text(370,616,'PE 보호접지 → 금속 외함 (별도 연결)',14);
  text(55,643,'L → 차단기 → 스위치 → 조명 → N · 부하는 병렬 연결',15);
  text(55,663,'회로의 연결 원리도 · 실제 전선관 위치는 배치도와 3D에서 확인합니다.',12);
 }else{
  const elevation=['front','back','right','left','section'].includes(view);
  const side=['right','left'].includes(view);
  const scale=elevation?side?108:92:94;
  const projectPoint=p=>elevation?[100+(side?(view==='right'?p[1]:4-p[1]):view==='back'?8.2-p[0]:p[0])*scale,490-p[2]*scale]:[100+p[0]*scale,485-p[1]*scale];
  const sourceKey=['lighting','power','rebar-slab','rebar-wall'].includes(view)?'plan':view==='details'?'plan':view;
  for(const l of projections[sourceKey]??[]){const selectedLine=l.id===selected;const a=projectPoint(l.a),b=projectPoint(l.b);line(a,b,selectedLine?'#ed8d35':l.kind==='wall'?'#33566a':'#7d969f',selectedLine?4:l.kind==='wall'?1.7:.8,l.id);}
  if(!elevation){
   const room=project.rooms.find(r=>'room-'+r.id===selected);
   if(room&&['plan','lighting','power'].includes(view)){const [x,y,X,Y]=room.bounds,a=projectPoint([x,Y,0]);out.push(`<rect data-room-highlight="${room.id}" x="${n(a[0])}" y="${n(a[1])}" width="${n((X-x)*scale)}" height="${n((Y-y)*scale)}" fill="#e9b44b44" stroke="#b97719" stroke-width="3" pointer-events="none"/>`);}
   // Invisible hit regions are on the real footprint, limited to relevant solids.
   const hitKinds=['wall','partition','window','door','furniture','fixture','foundation','ceiling','roof'];
   for(const e of model.elements.filter(e=>!e.linePoints&&hitKinds.includes(e.kind))){
    if(view==='foundation'?e.group!=='foundation':view==='roof'?e.group!=='roof':view==='ceiling'?e.group!=='ceiling':['foundation','roof','ceiling'].includes(e.group))continue;
    if(['plan','lighting','power','details','rebar-slab','rebar-wall'].includes(view)&&['wall','partition'].includes(e.kind)&&(e.base>=1.5||e.base+e.height<=1.5))continue;
    let footprint=e.footprint;if(['window','door'].includes(e.kind)){const [x,y,X,Y]=boundsOf(e);footprint=X-x>Y-y?[[x,(y+Y)/2-.06],[X,(y+Y)/2-.06],[X,(y+Y)/2+.06],[x,(y+Y)/2+.06]]:[[(x+X)/2-.06,y],[(x+X)/2+.06,y],[(x+X)/2+.06,Y],[(x+X)/2-.06,Y]];}
    const p=footprint.map(([x,y])=>projectPoint([x,y,0]).map(n).join(',')).join(' ');
    out.push(`<polygon points="${p}" fill="${e.id===selected?'#edaa482c':'transparent'}" stroke="${e.id===selected?'#ef9438':e.educationAdded?'#6e8b98':'none'}" stroke-width="${e.id===selected?3:1}" data-element="${esc(e.id)}" role="button" tabindex="0" aria-label="${esc(e.name)} ${esc(e.id)} 도면에서 선택"/>`);
   }
   if(['plan','lighting','power'].includes(view))for(const r of project.rooms){const p=projectPoint([(r.bounds[0]+r.bounds[2])/2,(r.bounds[1]+r.bounds[3])/2,0]);text(p[0],p[1]+38,r.name,14,'#5a727e','middle');}
   const a=projectPoint([0,-.65,0]),b=projectPoint([8.2,-.65,0]);line(a,b,'#587d8c');line([a[0],a[1]-7],[a[0],a[1]+7]);line([b[0],b[1]-7],[b[0],b[1]+7]);text((a[0]+b[0])/2,a[1]-9,'8,200 mm',14,'#315568','middle');
   const c=projectPoint([-.65,0,0]),d=projectPoint([-.65,4,0]);line(c,d);text(c[0]-3,(c[1]+d[1])/2,'4,000',12,'#315568','middle');
  }else{ text(100,530,view==='section'?'절단 위치: 평면 Y = 3,000 mm · 마감 바닥 +45 · 지붕 구조 상단 +3,200':'도면 방향과 3D 카메라가 함께 바뀝니다.',14); }
  if(view.startsWith('rebar')){
   const slab=view==='rebar-slab',parents=slab?[['roof','floor','entrance-canopy'].includes(selected)?selected:'roof']:rebar.members.filter(m=>m.type==='wall'||m.id.startsWith('footing')||m.id==='pit-base').map(m=>m.id);
   for(const b of rebar.bars.filter(b=>parents.includes(b.parent))){line(projectPoint(b.a),projectPoint(b.b),b.parent===selected?'#ed8d35':'#bc6b52',1,b.parent);}
   text(100,595,slab?`${parents[0]==='floor'?'바닥판':parents[0]==='entrance-canopy'?'출입구 차양':'지붕판'} · D10 @${rebar.members.find(m=>m.id===parents[0]).spacing} · 상·하부 양방향 · 피복 25 mm`:'벽 D10 @200 양면 · 기초 D13 @200 상·하부 · 피복 벽 40 / 기초 50 mm',15);
   text(100,623,'철근을 누르면 부재 정보·배근 수량·계산서를 함께 확인합니다.',14);
  }
  if(['lighting','power'].includes(view)){
   const allowed=d=>view==='lighting'?['light','switch','panel'].includes(d.kind):['socket','ac','panel','task-light'].includes(d.kind);
   for(const r of electric.routes.filter(r=>allowed(electric.devices.find(d=>d.id===r.target)))){for(let i=1;i<r.points.length;i++)line(projectPoint(r.points[i-1]),projectPoint(r.points[i]),project.circuits.find(c=>c.id===r.circuit).color,r.target===selected?3:1.8,r.target,'5 3');}
   if(view==='power')for(const d of electric.devices.filter(d=>d.cord))d.cord.slice(1).forEach((p,i)=>line(projectPoint(d.cord[i]),projectPoint(p),'#455c66',2,d.id));
   for(const d of electric.devices.filter(allowed)){const [x,y]=projectPoint(d.pos);out.push(`<g ${deviceAttrs(d)}>`);if(d.kind==='light'||d.kind==='task-light'){out.push(`<rect x="${n(x-13)}" y="${n(y-13)}" width="26" height="26" rx="3" fill="${d.on?'#ffefb5':'#edf0f2'}" stroke="${selected===d.id?'#ef7425':'#a7792b'}" stroke-width="${selected===d.id?4:2}"/>`);line([x-9,y-9],[x+9,y+9],'#a7792b',1,d.id);line([x+9,y-9],[x-9,y+9],'#a7792b',1,d.id);}else if(d.kind==='switch'){out.push(`<circle cx="${n(x)}" cy="${n(y)}" r="10" fill="#fff" stroke="#b68836" stroke-width="2"/>`);line([x,y],[x+13,y-13],'#b68836',2,d.id);}else{out.push(`<rect x="${n(x-12)}" y="${n(y-10)}" width="24" height="20" rx="3" fill="#e2f0f5" stroke="#3982b5" stroke-width="2"/>`);}text(x+16,y-12,d.id,12);out.push('</g>');}
   text(100,600,view==='lighting'?'조명 사각형 · 스위치 원형 · 점선은 실제 전선관 경로':'콘센트·냉방기 위치와 전원 경로',15);
   text(100,628,view==='lighting'?'스위치 설치 높이 1,200 mm · 기준: 마감 바닥':'콘센트 R01·R02 300 / R03 1,100 · 냉방기 2,200 mm · 기준: 마감 바닥',13);
  }
  if(view==='foundation')out.push(pitAnnotations(model));
  if(view==='details'){text(100,600,'창 AW01: 1,800 × 1,500 · AW02: 2,400 × 1,500 · AW03: 900 × 1,200 mm',14);text(100,628,'대상을 선택하면 3D에서 같은 창문·가구를 강조합니다.',14);}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" id="learning-plan" viewBox="0 0 1000 710" aria-label="${esc(sheet.id+' '+sheet.title+' 연결 도면')}" role="group"><rect width="1000" height="710" fill="#f8fafb"/><g stroke-linejoin="round" stroke-linecap="round">${out.join('')}</g><line x1="40" y1="675" x2="960" y2="675" stroke="#c8d7de"/><text x="45" y="699" font-family="Malgun Gothic, sans-serif" font-size="13" fill="#496677">${sheet.id} · ${esc(sheet.title)} · 경비실 교육용 샘플 1</text><text x="950" y="699" font-family="Malgun Gothic, sans-serif" font-size="12" text-anchor="end" fill="#496677">치수 mm · 형상 m</text></svg>`;
}
