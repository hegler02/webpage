import {byId,sheets,devices} from './src/conveyor-project.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function symbol(d,on,context){
 if(d.kind==='contactor'&&context==='power')return [0,1,2].map(i=>`<path d="M${-26+i*26} -25v12m0 26v12m0-38 ${on?0:12} ${on?26:18}" fill="none" stroke="currentColor" stroke-width="2"/>`).join('');
 if(d.kind==='contactor'&&context==='signal')return `<path d="M-38 8h20m36 0h20M-18 8l36 ${on?'0':'-24'}" fill="none" stroke="currentColor" stroke-width="3"/>`;
 if(['relay','contactor'].includes(d.kind))return `<rect x="-22" y="-16" width="44" height="32" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-36 0h14M22 0h14" stroke="currentColor"/><text x="0" y="6" text-anchor="middle" font-size="14">K</text>`;
 if(d.kind==='motor')return '<circle r="23" fill="none" stroke="currentColor" stroke-width="2"/><text x="0" y="7" text-anchor="middle">M</text>';
 if(d.kind==='fuse')return '<path d="M-36 0h72" stroke="currentColor"/><rect x="-20" y="-10" width="40" height="20" fill="none" stroke="currentColor" stroke-width="2"/>';
 if(['selector','estop','reset','isolator','breaker'].includes(d.kind)){const closed=d.kind==='estop'?!on:on;return `<path d="M-38 8h20m36 0h20M-18 8l36 ${closed?'0':'-24'}" fill="none" stroke="currentColor" stroke-width="3"/>`;}
 if(d.kind==='lamp')return '<circle r="22" fill="none" stroke="currentColor" stroke-width="2"/><path d="m-15-15 30 30m0-30-30 30" stroke="currentColor"/>';
 if(d.kind==='sensor')return '<rect x="-24" y="-18" width="48" height="36" fill="none" stroke="currentColor" stroke-width="2"/><path d="m-12 8 24-16m-8 0h8v8" fill="none" stroke="currentColor" stroke-width="2"/>';
 if(d.kind==='terminal'||d.kind==='connector')return '<circle cx="-16" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-9 0H9" stroke="currentColor"/>';
 if(d.kind==='transformer')return '<path d="M-8-24v48m16-48v48M-13-22c-25 0-25 44 0 44M13-22c25 0 25 44 0 44" fill="none" stroke="currentColor" stroke-width="3"/>';
 return '<rect x="-32" y="-22" width="64" height="44" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-22-10h44M-22 0h44M-22 10h22" stroke="currentColor"/>';
}
function interactive(id,selected,label=byId.get(id).name+' '+id){return `class="cv-plan-target" data-device="${esc(id)}" aria-pressed="${selected===id}" tabindex="0" role="button" aria-label="${esc(label)}"`; }
const shortNames={'-06K1':'허가 릴레이','-06S1':'허가 복구 버튼','-07S1':'운전 선택 스위치','-09B1':'진입 감지기','-09B2':'정위치 감지기','-02Q2':'현장 개폐기','-03T2':'제어 변압기'};
function node(id,x,y,state,selected,w=170,context=''){const d=byId.get(id),on=state.active[id];return `<g ${interactive(id,selected).replace('cv-plan-target','cv-plan-target cv-plan-node')} data-active="${!!on}" transform="translate(${x} ${y})"><rect class="node-body" x="${-w/2}" y="${context==='panel'?-54:-63}" width="${w}" height="${context==='panel'?108:126}" rx="8"/><g transform="translate(0 -22)">${symbol(d,on,context)}</g><text text-anchor="middle" y="24">${esc(shortNames[id]??d.name.replace('컨베이어 ','').replace('모터 분기 ',''))}</text><text class="tag" text-anchor="middle" y="48">${esc(id)}</text></g>`;}
const line=(points,on,role='power')=>`<polyline class="cv-wire" data-on="${!!on}" data-role="${role}" points="${points}"/>`;
export function drawing(sheetId,state,selected,simulation){
 const sh=sheets.find(s=>s.id===sheetId)??sheets[0];let body='';
 if(sheetId==='E-401'){
  const ids=sh.ids,positions=ids.map((_,i)=>{const row=Math.floor(i/3);return [160+(row%2?2-i%3:i%3)*330,190+row*220];});
  ids.forEach((id,i)=>{const [x,y]=positions[i];if(i<ids.length-1){const [nx,ny]=positions[i+1],direction=Math.sign(nx-x);const points=y===ny?`${x+120*direction},${y} ${nx-120*direction},${ny}`:`${x},${y+63} ${nx},${ny-63}`;body+=line(points,i<2?simulation.power:i<5?state.coil:state.motor);}});
  ids.forEach((id,i)=>{const [x,y]=positions[i];body+=node(id,x,y,state,selected,240,'power');});
  body+='<text class="cv-plan-note" x="360" y="685">3상 동력 U·V·W / PE 보호접지는 별도 도체</text>';
 }else if(sheetId==='E-402'){
  body+=line('90,190 90,490',simulation.power,'control')+line('910,190 910,490',simulation.power,'control');
  const ids=['-03T2','-06S2','-06K1','-07S1','-07K1'];ids.forEach((id,i)=>{const x=110+i*190;body+=node(id,x,270,state,selected,165);if(i<4)body+=line(`${x+82},270 ${x+108},270`,simulation.power&&(i<1||!simulation.estop)&&(i<2||simulation.permit)&&(i<3||simulation.run),'control');});
  body+=node('-06S1',400,520,state,selected,240)+node('-07H5',780,520,state,selected,240);
  body+='<text class="cv-plan-note" x="70" y="650">운전 허가: 운전 OFF + 비상정지 해제 후 복구 → 허가 릴레이 유지</text><text class="cv-plan-note" x="70" y="682">코일 120 V · 교육용 기능 연결도 / PLC 래더 프로그램과 구분합니다.</text>';
 }else if(sheetId==='E-403'){
  const ids=['-09B1','-09B2','-07K1'];ids.forEach((id,i)=>{const y=210+i*200;body+=node(id,175,y,state,selected,245,'signal')+line(`298,${y} 425,${y} 650,${y}`,Object.values(state.inputs)[i],'signal')+`<g ${interactive('X1-1',selected,'입력 단자 '+[11,12,17][i])}><rect class="target-outline" x="320" y="${y-45}" width="170" height="70" fill="transparent"/><text class="cv-plan-note" x="330" y="${y-20}">X1-1:${[11,12,17][i]}</text></g><g ${interactive('PLC1',selected,'PLC 입력 '+Object.keys(state.inputs)[i])}><rect class="target-outline" x="650" y="${y-50}" width="260" height="100" rx="6" fill="${Object.values(state.inputs)[i]?'#d7efe5':'#edf1f2'}" stroke="#9caeb5"/><text x="675" y="${y-10}" fill="#19313e" font-size="23">${Object.keys(state.inputs)[i]}</text><text x="675" y="${y+25}" fill="#19313e" font-size="19">${Object.values(state.inputs)[i]?'ON · 입력 있음':'OFF · 입력 없음'}</text></g>`;});
  body+=`<g ${interactive('PLC1',selected)}><rect class="target-outline" x="650" y="91" width="300" height="45" fill="transparent"/><text x="660" y="120" font-size="22" fill="#19313e">PLC1 · 120 V 입력 모듈</text></g>`;
 }else if(sheetId==='P-401'){
  body+=`<g ${interactive('CAB1',selected,'제어반 외함')}><rect class="target-outline" x="150" y="115" width="700" height="550" rx="6" fill="#e9edef" stroke="#6c858e" stroke-width="6"/><text class="cv-plan-note" x="610" y="160">CAB1 · 제어반 외함</text></g>`;
  sh.ids.filter(id=>id!=='CAB1').forEach(id=>{const d=byId.get(id),x=190+(d.pos[0]+2.8)*470,y=630-(d.pos[1]-.3)*270;body+=node(id,x,y,state,selected,id==='PLC1'?280:150,'panel');});
  body+='<text class="cv-plan-note" x="160" y="708">제어반 내부 · 같은 기기 번호는 회로도에서도 같은 부품입니다.</text>';
 }else if(sheetId==='P-402'){
  body+=`<g ${interactive('OP1',selected,'조작반 외함')}><rect class="target-outline" x="90" y="170" width="820" height="370" rx="10" fill="#e1e7e9" stroke="#6c858e" stroke-width="4"/></g>`;
  ['-07S1','-06S1','-06S2'].forEach((id,i)=>body+=node(id,245+i*255,285,state,selected,225));body+=node('-07H5',755,465,state,selected,225);
  body+='<text class="cv-plan-note" x="110" y="610">운전 선택 스위치 / 허가 복구 / 비상정지 / 운전 표시등</text>';
 }else{
  body+=`<g ${interactive('CV1',selected)}><rect class="target-outline" x="100" y="355" width="800" height="180" rx="75" fill="#d5dedd" stroke="#74918e" stroke-width="5"/>`;
  for(let i=0;i<20;i++)body+=`<path d="M${130+i*38} 375v140" stroke="#a2b5b1"/>`;
  body+='</g>';
  body+=node('CAB1',220,160,state,selected,240)+node('-02X1',530,160,state,selected,220)+node('-02Q2',815,160,state,selected,240)+node('OP1',470,650,state,selected,240)+node('-02M1',815,650,state,selected,245)+node('-09B1',740,300,state,selected,220)+node('-09B2',260,300,state,selected,220);
  body+=`<g ${interactive('CV1',selected,'팔레트 · 컨베이어 본체')} data-pallet visibility="${simulation.loaded?'visible':'hidden'}" transform="translate(${480+simulation.pallet*140} 0)"><rect class="target-outline" x="0" y="392" width="100" height="90" fill="#bb9158" stroke="#785a37" stroke-width="3"/><text x="50" y="444" text-anchor="middle" fill="#fff" font-size="18">팔레트</text></g>`;
  body+='<text class="cv-plan-note" x="190" y="565">오른쪽 → 왼쪽 이송 · 벨트 길이 5,000 mm · 폭 1,100 mm</text>';
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 760" role="group" aria-label="${esc(sh.id+' '+sh.name)}"><style>.cv-plan-target{cursor:pointer;outline:none}.cv-plan-target[aria-pressed=true] .target-outline,.cv-plan-target:focus .target-outline,.cv-plan-target:hover .target-outline{stroke:#c47a15;stroke-width:5}.cv-plan-target:focus .node-body,.cv-plan-target:hover .node-body{stroke:#c47a15;stroke-width:4}.node-body{fill:white;stroke:#8ba2ab;stroke-width:2}.cv-plan-node[data-active=true] .node-body{fill:#e4f3ea;stroke:#167e79}.cv-plan-node[aria-pressed=true] .node-body{stroke:#c47a15;stroke-width:4}.cv-plan-node text{fill:#183540;font-size:17px}.cv-plan-node .tag,.cv-plan-note{font-size:16px;fill:#657b86}.cv-wire{fill:none;stroke:#8ba2ab;stroke-width:3}.cv-wire[data-on=true]{stroke:#167e79;stroke-width:4}.cv-wire[data-role=control]{stroke-dasharray:7 4}</style><rect width="1000" height="760" fill="#f8fafb"/><text x="45" y="48" font-size="26" font-weight="700" fill="#19313e">${sh.id} · ${sh.name}</text><text x="45" y="80" class="cv-plan-note">샘플 4 · 원본 ${sh.source}번 도면의 기기를 연결한 교육용 도면</text>${body}</svg>`;
}
