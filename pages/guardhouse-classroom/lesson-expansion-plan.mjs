import {fireModel,finishes,materialLayers,pitInfo} from './src/lesson-expansion.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const text=(x,y,s,size=16,color='#294654')=>`<text x="${x}" y="${y}" font-family="Malgun Gothic, sans-serif" font-size="${size}" fill="${color}">${esc(s)}</text>`;
const line=(a,b,color='#c56451',width=2)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${width}"/>`;
const attrs=d=>`data-element="${d.id}" role="button" tabindex="0" aria-label="${d.name} 도면에서 선택"`;
const box=(d,x,y,w,h,selected,color='#fff')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${color}" stroke="${selected===d.id?'#ec861d':'#718b95'}" stroke-width="${selected===d.id?4:1.5}" ${attrs(d)}/>`;
const frame=(sheet,body)=>`<svg xmlns="http://www.w3.org/2000/svg" id="learning-plan" viewBox="0 0 1000 710" role="group" aria-label="${sheet.id} ${sheet.title} 연결 도면"><rect width="1000" height="710" fill="#f8fafb"/>${body}<line x1="40" y1="675" x2="960" y2="675" stroke="#c8d7de"/>${text(45,699,sheet.id+' · '+sheet.title+' · 경비실 교육용 샘플 1',13)}</svg>`;
export function expansionSVG({sheet,selected,fire=fireModel(),finish='plaster',basePlan}){
 let out='';
 if(sheet.view==='fire-plan'){
  const p=a=>[100+a[0]*94,485-a[1]*94];
  // This line is a teaching evacuation route, never a cable or pipe claim.
  const path=[[3.2,3],[4,2.35],[4.65,2.35],[5.05,1.3],[5.05,-.5]].map(p);
  for(let i=1;i<path.length;i++)out+=line(path[i-1],path[i],'#2b9a81',4);
  out+=text(585,545,'피난 동선 예시 · 녹색',14,'#258675');
  for(const d of fire.devices){const [x,y]=p(d.pos);out+='<g>';
   if(['smoke','heat'].includes(d.kind))out+=`<circle cx="${x}" cy="${y}" r="10" fill="${d.on?'#f7a384':'#fff'}" stroke="${selected===d.id?'#ef861d':'#a44d3d'}" stroke-width="${selected===d.id?4:2}" ${attrs(d)}/>`;
   else out+=box(d,x-9,y-9,18,18,selected,['exit-light','emergency'].includes(d.kind)?'#b7e4cd':d.on?'#f3a28f':'#eed8d1');
   // Stagger labels at the doorway to keep closely spaced devices legible.
   const offsets={FA01:[48,78],MC01:[-95,95],AL01:[48,46],EX01:[-100,64],FE01:[55,9],EM01:[-75,35]};const [dx,dy]=offsets[d.id]??[15,-12];out+=line([x,y],[x+dx,y+dy-5],'#9aaeb4',.8)+text(x+dx,y+dy,d.id,13);out+='</g>';
  }
  out+=text(100,590,'SD 연기감지 · HD 열감지 · MC 발신기 · FA 수신기 · AL 경보',14);
  out+=text(100,617,'EX 유도등 · EM 비상조명 · FE 소화기',14);
  out+=text(100,644,'소방전기는 별도 회로로 학습 · 이 도면은 기구 배치와 피난 동선을 표시합니다.',13);
  return basePlan.replace('</svg>',out+'</svg>');
 }
 if(sheet.view==='fire-signal'){
  out+=text(65,65,'입력 → 수신 → 경보 · 전원은 별도로 공급',23);
  const find=id=>fire.devices.find(d=>d.id===id);
  for(const [j,id]of ['SD01','SD02','HD01','MC01'].entries()){const d=find(id),y=140+j*92;out+=box(d,65,y,220,65,selected,d.on?'#ffd0bf':'white')+text(80,y+27,d.id+' '+d.name,14)+text(80,y+50,d.on?'화재신호 입력 중':'입력 대기',12);out+=line([285,y+32],[365,y+32]);out+=line([365,y+32],[365,290]);}
  const panel=find('FA01'),alarm=find('AL01');out+=line([365,290],[410,290])+box(panel,410,230,210,125,selected,fire.alarm?'#ffc4ae':'#e3edef')+text(435,265,'FA01 화재 수신기',17)+text(435,295,fire.alarm?'화재 표시 · 경보 출력':fire.supplied?'감시 중':'전원 없음',15)+text(435,328,'교육 모형 DC 24 V',13);
  out+=line([620,290],[715,290])+box(alarm,715,250,220,85,selected,alarm.on?'#ffa886':'#eee')+text(730,278,'AL01 음향·시각 경보',15)+text(730,310,alarm.on?'경보 작동 중':'경보 대기',14);
  out+=text(425,405,'독립된 소방 전원 계통',17)+text(425,435,'상용 전원 → 전원부 → 수신기',14)+text(425,461,'정전 시 수신기 예비전원으로 전환',14)+line([515,435],[515,355],'#4b8aa5');
  for(const [id,x]of [['EX01',65],['EM01',490]]){const d=find(id);out+=box(d,x,515,390,100,selected,d.on?'#d0eddd':'#eee')+text(x+18,545,d.id+' '+d.name,17)+text(x+18,572,id==='EX01'?'상용 전원 또는 자체 예비전원':'정전 시 자체 예비전원',14)+text(x+18,598,d.on?'점등 중':'소등',13);}
  out+=text(65,651,'신호 원리도 · 실제 단자·종단저항·배선 규격·배터리 용량 산정은 후속 학습 범위입니다.',13);
 }
 if(sheet.view==='materials'){
  out+=text(65,70,'벽은 한 가지 재료로 이루어지지 않습니다.',23)+text(65,110,'외부 → 외장·바탕·단열 → 콘크리트 → 실내',17);
  const widths=[60,45,140,280,45];let x=120;
  materialLayers.forEach((d,i)=>{out+=box(d,x,180,widths[i],260,selected,'#'+d.color.toString(16));out+=line([x+widths[i]/2,440],[120+i*170,490+i%2*65],'#718b95',1)+text(73+i*170,515+i%2*65,d.name,14)+text(73+i*170,539+i%2*65,d.thickness+' mm',14);x+=widths[i];});
  out+=text(120,157,'바깥쪽',15)+text(720,157,'실내쪽',15)+text(65,625,'선택 외관: '+finishes.find(f=>f.id===finish).name+' · 전체 315 mm',15)+text(65,650,'층을 읽기 위한 개념도 (가로 비례 일부 확대) · 외장 영역 100 = 20 + 10 + 70 mm',13);
 }
 return frame(sheet,out);
}
export function pitAnnotations(model){const p=pitInfo(model),x=100+.2*94,y=485-3.8*94,w=p.width*94,h=p.depth*94;return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4cafa926" stroke="#218f86" stroke-width="2" stroke-dasharray="7 4" data-element="pit-base"/>${text(x+20,y+55,'PIT · 바닥 아래 빈 공간',20,'#197d75')}${text(x+20,y+83,Math.round(p.width*1000)+' × '+Math.round(p.depth*1000)+' mm · 내부 높이 '+Math.round(p.clearHeight*1000)+' mm',15)}<rect x="${100+.23*94}" y="${485-2.58*94}" width="56.4" height="56.4" fill="#e7b35b55" stroke="#bd842a" stroke-width="2" data-element="pit-access-cover" role="button" tabindex="0" aria-label="PIT 점검구 도면에서 선택"/>${text(200,340,'점검구 600 × 600 mm',14,'#9d681f')}${text(100,595,'기초는 건물을 받치는 구조 · PIT는 그 안의 빈 공간입니다.',16)}${text(100,625,'화장실·탕비실 아래 · 3D에서 기초·PIT 또는 PIT 단면을 눌러보세요.',14)}`;}
