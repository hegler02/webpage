import {byId,sheets,stations,LAYOUT,ioNames} from './src/capsule-project.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The cabinet is the default location, so its devices drop the +MC prefix as on the original sheets.
const tag=id=>id.replace(/^\+MC-/,'');
const SHORT={'+MC-Q1':'주 차단 1','+MC-Q2':'주 차단 2','+MC-Q6':'주 구동','+MC-Q7':'브레이크','+MC-Q8':'분말 구동','+MC-Q9':'진공 펌프','+MC-F1':'1차 퓨즈','+MC-F2':'2차 퓨즈','+MC-T1':'제어 변압기','+MC-G1':'직류 전원',
 '+MC-Q3':'직류 전원','+MC-Q4':'+24 VRE','+MC-Q5':'+24 VDC','+MC-Q10':'함 팬','+MC-Q11':'콘센트','+MC-Q12':'레벨 계전기','+MC-Q13':'통신','+MC-Q14':'PLC','+MC-Q15':'안전 계전기',
 '+MC-K1':'주 구동 조그','+MC-K2':'브레이크','+MC-K3':'안전 출력 1','+MC-K4':'안전 출력 2','+MC-K5':'아래 문 닫힘','+MC-K6':'조그 모드 1','+MC-K7':'조그 모드 2','+MC-K8':'원격 조그','+MC-K9':'진공 밸브','+MC-K10':'주 구동 안전','+MC-K11':'주 구동','+MC-K12':'분말 공급','+MC-K13':'출력 K13','+MC-K14':'진공 펌프','+MC-K15':'분말 안전',
 '+MC-PLC1':'전원부','+MC-PLC2':'CPU','+MC-PLC3':'출력 1','+MC-PLC4':'출력 2','+MC-PLC5':'입력 3','+MC-PLC6':'입력 4','+MC-PLC7':'아날로그 출력','+MC-PLC8':'아날로그 입력',
 '+MC-U1':'주 구동 인버터','+MC-U2':'분말 인버터','+MC-U3':'분말 레벨','+MC-U4':'비상정지 계전기','+MC-U5':'문 안전 계전기','+MC-X4':'전원·현장','+MC-X1':'원격 플러그','+MC-X3':'제어 단자대','+MC-RECPT1':'콘센트',
 '+M-M1':'주 구동 모터','+M-M2':'분말 모터','+M-M3':'진공 펌프','+M-DV2':'브레이크','+M-F1':'과부하 보호','+M-S1':'함 팬','+M-X2':'기계 단자대','+M-Y1':'호퍼 공기','+M-Y2':'배출','+M-Y3':'불량 배출','+M-Y4':'청소',
 '+M-S2':'앞 왼쪽 문','+M-S3':'앞 오른쪽 문','+M-S4':'뒤 왼쪽 문','+M-S5':'뒤 오른쪽 문','+OS-S1':'시작','+OS-S2':'정지','+OS-S3':'비상정지 1','+OS-S4':'비상정지 2','+OS-S12':'조그 모드','+OS-S13':'원격 조그','+OS-S14':'진공 선택',
 '+OS-H1':'경보 혼','+OS-H2':'빨강','+OS-H3':'노랑','+OS-H4':'초록','-S1':'레벨 감지기','-D1':'통신 장치 1','-D2':'통신 장치 2','-22KA3':'K7 접점'};
const brief=id=>SHORT[id]??byId.get(id).name.replace(/\s*\(.*\)/,'').replace(/^위 문 스위치/,'위 문').replace(/^예비 밸브/,'예비');
const SWITCH=['disconnect','breaker','button','estop','guard','limit','selector','plug'];
function glyph(kind,on){
 if(['relay','contactor'].includes(kind))return '<rect x="-22" y="-16" width="44" height="32" fill="none" stroke="currentColor" stroke-width="3"/><path d="M-38 0h16M22 0h16" stroke="currentColor" stroke-width="3"/>';
 if(['motor','fan'].includes(kind))return '<circle r="22" fill="none" stroke="currentColor" stroke-width="3"/><text y="8" text-anchor="middle" font-size="24" fill="currentColor">M</text>';
 if(kind==='fuse')return '<path d="M-38 0h76" stroke="currentColor" stroke-width="3"/><rect x="-20" y="-10" width="40" height="20" fill="none" stroke="currentColor" stroke-width="3"/>';
 if(SWITCH.includes(kind))return `<path d="M-38 8h20m36 0h20M-18 8l36 ${on?'0':'-24'}" fill="none" stroke="currentColor" stroke-width="4"/>`;
 if(['lamp','horn'].includes(kind))return '<circle r="20" fill="none" stroke="currentColor" stroke-width="3"/><path d="m-14-14 28 28m0-28-28 28" stroke="currentColor" stroke-width="3"/>';
 if(['sensor','level'].includes(kind))return '<rect x="-24" y="-18" width="48" height="36" fill="none" stroke="currentColor" stroke-width="3"/><path d="m-12 8 24-16m-8 0h8v8" fill="none" stroke="currentColor" stroke-width="3"/>';
 if(['terminal','port','outlet'].includes(kind))return '<circle cx="-16" r="8" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="16" r="8" fill="none" stroke="currentColor" stroke-width="3"/><path d="M-8 0H8" stroke="currentColor" stroke-width="3"/>';
 if(kind==='transformer')return '<path d="M-6-22v44m12-44v44M-11-20c-24 0-24 40 0 40M11-20c24 0 24 40 0 40" fill="none" stroke="currentColor" stroke-width="3"/>';
 if(kind==='valve')return '<path d="M-24-14 0 0-24 14zM24-14 0 0 24 14z" fill="none" stroke="currentColor" stroke-width="3"/>';
 if(kind==='brake')return '<path d="M-26-16v32M26-16v32M-14 0h28" fill="none" stroke="currentColor" stroke-width="4"/>';
 return '<rect x="-30" y="-18" width="60" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M-20-6h40M-20 6h24" stroke="currentColor" stroke-width="3"/>';
}
function interactive(id,selected,label=byId.get(id).name+' '+id){return `class="cv-plan-target" data-device="${esc(id)}" aria-pressed="${selected===id}" tabindex="0" role="button" aria-label="${esc(label)}"`;}
const group=(id,selected,on,x,y)=>`<g ${interactive(id,selected).replace('cv-plan-target','cv-plan-target cv-plan-node')} data-active="${!!on}" transform="translate(${x} ${y})"><title>${esc(byId.get(id).name)}</title>`;
// Full node: symbol, device tag and a short name.
function node(id,x,y,p,selected,o={}){
 const d=byId.get(id),on=p.active[id],w=o.w??92,h=72;
 return `${group(id,selected,on,x,y)}<rect class="node-body" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="7"/><g transform="translate(0 -18) scale(.5)">${glyph(d.kind,on)}</g><text class="tg" text-anchor="middle" y="14">${esc(o.tag??tag(id))}</text><text class="nm" text-anchor="middle" y="29">${esc(o.label??brief(id))}</text></g>`;
}
// Plain node: tag and name without a symbol.
function plain(id,x,y,p,selected,o={}){
 const w=o.w??92,h=o.h??48;
 return `${group(id,selected,p.active[id],x,y)}<rect class="node-body" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="7"/><text class="tg" text-anchor="middle" y="-3">${esc(o.tag??tag(id))}</text><text class="nm" text-anchor="middle" y="14">${esc(o.label??brief(id))}</text></g>`;
}
// Bare node: tag only, for rows with many devices.
function bare(id,x,y,p,selected,o={}){
 const w=o.w??58,h=o.h??32;
 return `${group(id,selected,p.active[id],x,y)}<rect class="node-body" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="6"/><text class="${o.small?'pl':'tg'}" text-anchor="middle" y="${o.small?4:5}">${esc(o.tag??tag(id))}</text></g>`;
}
const pill=(id,x,y,p,selected,o={})=>bare(id,x,y,p,selected,{w:o.w??Math.max(44,tag(id).length*8+12),h:22,small:true,...o});
// Wide node for rows: tag on the left, name beside it.
function bar(id,x,y,w,p,selected,label=brief(id)){
 return `${group(id,selected,p.active[id],x,y)}<rect class="node-body" x="0" y="-16" width="${w}" height="32" rx="6"/><text class="tg" x="10" y="5">${esc(tag(id))}</text><text class="nm" x="${Math.max(62,tag(id).length*9+22)}" y="5">${esc(label)}</text></g>`;
}
function chip(module,address,x,y,on,selected,w=86,text=address){
 return `<g ${interactive(module,selected,byId.get(module).name+' '+address+' '+(ioNames[address]?.name??''))} data-chip="${!!on}" data-address="${esc(address)}"><rect class="target-outline chip" x="${x}" y="${y-14}" width="${w}" height="28" rx="5"/><text class="ch" x="${x+w/2}" y="${y+5}" text-anchor="middle">${esc(text)}</text></g>`;
}
const line=(points,on,role='power')=>`<polyline class="cv-wire" data-on="${!!on}" data-role="${role}" points="${points}"/>`;
const note=(x,y,text,anchor='start')=>`<text class="cv-plan-note" x="${x}" y="${y}" text-anchor="${anchor}">${esc(text)}</text>`;
const rail=(x1,x2,y,on,text)=>`<line class="cv-rail" data-on="${!!on}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>${note(x1,y-10,text)}`;
const row=(ids,x,y,step,p,selected,make=bare,o={})=>ids.map((id,i)=>make(id,x+i*step,y,p,selected,typeof o==='function'?o(id,i):o)).join('');

function layout(p,selected,s){
 const X=x=>480+(x+.4)*140,Z=z=>330+(z+.5)*140,m=LAYOUT.machine,c=LAYOUT.cabinet,o=LAYOUT.operator,d=LAYOUT.dial;
 const cx=X(d.centre[0]),cz=Z(d.centre[2]),r=d.radius*140,A=i=>Math.atan2(stations[i].pos[2]-d.centre[2],stations[i].pos[0]-d.centre[0]);
 const stepAngle=Math.atan2(Math.sin(A(1)-A(0)),Math.cos(A(1)-A(0))),t=Math.min(1,(s?.phase??1)/.4);
 const seats=stations.map((st,i)=>{const a=A(i)-stepAngle*(1-t),v=s?.slots?.[i]??-1;return `<circle data-segment="${i}" data-load="${v<0?'empty':v>0?'short':'full'}" cx="${cx+Math.cos(a)*r*.78}" cy="${cz+Math.sin(a)*r*.78}" r="11"/>`;}).join('');
 const names=stations.map((st,i)=>{const a=A(i),x=cx+Math.cos(a)*(r+16),y=cz+Math.sin(a)*(r+16)+4;return `<text class="st" x="${x}" y="${y}" text-anchor="${Math.cos(a)>.3?'start':Math.cos(a)<-.3?'end':'middle'}">${i+1} ${esc(st.name)}</text>`;}).join('');
 const mx=X(m.centre[0]-m.size[0]/2),mz=Z(m.centre[2]-m.size[2]/2),mw=m.size[0]*140,mh=m.size[2]*140;
 const kx=X(c.centre[0]-c.size[0]/2),kz=Z(c.centre[2]-c.size[2]/2),ox=X(o.centre[0]-o.size[0]/2),oz=Z(o.centre[2]-o.size[2]/2);
 const gate=id=>{const g=byId.get(id).pos;return bare(id,X(g[0]),Z(g[2])+(g[2]>0?26:-26),p,selected,{w:64,h:26,small:true});};
 return `${line(`${kx+c.size[0]*70},${kz+c.size[2]*140} ${kx+c.size[0]*70},${Z(LAYOUT.duct.z)} ${cx},${Z(LAYOUT.duct.z)} ${cx},${mz}`,p.rails.bus,'control')}${note(kx+c.size[0]*70+12,Z(LAYOUT.duct.z)-10,'바닥 전선 덕트')}
 <g ${interactive('+MC-ENCLOSURE',selected)}><rect class="target-outline" x="${kx}" y="${kz}" width="${c.size[0]*140}" height="${c.size[2]*140}" rx="4" fill="#e9edef" stroke="#6c858e" stroke-width="3"/><text class="tg" x="${kx+c.size[0]*70}" y="${kz+c.size[2]*70+5}" text-anchor="middle">주 제어반 +MC</text></g>
 <g ${interactive('MCH1',selected)} data-active="${!!p.active.MCH1}"><rect class="target-outline" x="${mx}" y="${mz}" width="${mw}" height="${mh}" rx="8" fill="#d5dedd" stroke="#74918e" stroke-width="3"/><circle class="dial" cx="${cx}" cy="${cz}" r="${r}"/><circle class="dial" cx="${cx}" cy="${cz}" r="${r*.5}"/><g class="seats">${seats}</g>${names}<text class="tg" x="${mx+12}" y="${mz+22}">기계 +M</text></g>
 <g ${interactive('OS1',selected)}><rect class="target-outline" x="${ox}" y="${oz}" width="${o.size[0]*140}" height="${Math.max(24,o.size[2]*140)}" rx="4" fill="#e1e7e9" stroke="#6c858e" stroke-width="3"/><text class="tg" x="${ox+o.size[0]*70}" y="${oz+17}" text-anchor="middle">조작반 +OS</text></g>
 ${['+M-S2','+M-S3','+M-S4','+M-S5'].map(gate).join('')}${note(mx+mw+14,mz+16,'네 모서리: 아래 문 리밋 스위치')}
 ${note(45,558,'제어반 옆 감지기 연결구 · 콘센트')}${row(['+MC-SQ1','+MC-SQ2','+MC-SQ3','+MC-SQ4','+MC-SQ5','+MC-SQ6','+MC-SQ7','+MC-SQ8','+MC-RECPT1'],75,585,72,p,selected,bare,{w:66})}
 ${note(700,558,'조작반 위 혼 · 경광등')}${row(['+OS-H1','+OS-H2','+OS-H3','+OS-H4'],733,585,68,p,selected,bare,{w:62})}
 ${note(45,628,'기계 안 모터 · 팬 · 공기 밸브')}${row(['+M-M1','+M-M2','+M-S1','+M-Y1','+M-Y2','+M-Y3','+M-Y4','+M-Y5','+M-Y6','+M-Y7','+M-Y8'],80,655,82,p,selected,bare,{w:74})}
 ${note(45,698,'검사 자리 광전 스위치 16개 · 캡슐이 있으면 켜짐')}${row(Array.from({length:16},(_,i)=>'+M-B'+(i+1)),72,725,57,p,selected,bare,(id,i)=>({w:52,tag:'B'+(i+1)}))}`;
}

function supply(p,selected){
 const a=p.active,r=p.rails,g1=a['+MC-G1'];
 return `${note(45,112,'전원 인입 460 V 3상')}${line('136,170 184,170',true)}${line('276,170 324,170',a['+MC-Q1'])}${line('416,170 450,170',r.bus)}${rail(450,950,170,r.bus,'460 V 모선 → E-902 구동 회로')}
 ${line('500,170 500,264',r.bus)}${line('546,300 594,300',a['+MC-T1'])}${line('686,300 734,300',a['+MC-T1'])}${line('826,300 850,300',r.v110)}${rail(850,950,300,r.v110,'110 V')}
 ${line('900,300 900,372 90,372 90,404',r.v110)}${line('640,372 640,404',r.v110,'control')}${line('780,372 780,404',r.v110,'control')}
 ${line('136,440 184,440',g1)}${line('276,440 330,440 330,660 384,660',g1)}${line('330,550 384,550',g1)}
 ${line('476,550 524,550',g1&&a['+MC-Q4'])}${line('616,550 664,550',g1&&a['+MC-Q4']&&a['+MC-K3'])}${line('756,550 790,550',r.vre)}${rail(790,950,550,r.vre,'+24 VRE · 출력 카드 1')}
 ${line('476,660 520,660',r.vdc)}${rail(520,950,660,r.vdc,'+24 VDC · 제어 · 출력 카드 2')}
 ${node('+MC-X4',90,170,p,selected)}${node('+MC-Q1',230,170,p,selected)}${node('+MC-Q2',370,170,p,selected)}
 ${node('+MC-F1',500,300,p,selected)}${node('+MC-T1',640,300,p,selected)}${node('+MC-F2',780,300,p,selected)}
 ${node('+MC-Q3',90,440,p,selected)}${node('+MC-G1',230,440,p,selected)}${node('+MC-X1',640,440,p,selected)}${node('+MC-X3',780,440,p,selected)}
 ${node('+MC-Q4',430,550,p,selected)}${node('+MC-K3',570,550,p,selected,{label:'13-14 ∥ 33-34'})}${node('+MC-K4',710,550,p,selected,{label:'13-14 ∥ 33-34'})}${node('+MC-Q5',430,660,p,selected)}
 ${note(45,250,'모선에서 갈라져 변압기로')}${note(690,500,'현장으로 나가는 플러그 · 단자대','middle')}${note(45,725,'K3·K4는 비상정지 계전기 U4가 붙입니다. 떨어지면 +24 VRE만 꺼지고 +24 VDC는 남습니다.')}`;
}

function drives(p,selected){
 const a=p.active,r=p.rails,x=[62,156,250,344,438,532,626,720,814,908],Q=200,K=305,U=410,T=515,L=620;
 const drop=(i,on)=>line(`${x[i]},128 ${x[i]},${Q-36}`,on),v=(i,y1,y2,on,role)=>line(`${x[i]},${y1+36} ${x[i]},${y2-36}`,on,role);
 return `${rail(30,572,128,r.bus,'460 V 모선')}${rail(596,850,128,r.v110,'110 V')}${rail(868,960,128,r.vdc,'+24 VDC')}
 ${[0,2,3,5].map(i=>drop(i,r.bus)).join('')}${[6,7,8].map(i=>drop(i,r.v110)).join('')}${drop(9,r.vdc)}
 ${v(0,Q,K,r.bus&&a['+MC-Q6'])}${v(0,K,U,a['+MC-U1'])}${v(0,U,T,a['+M-M1'])}${v(0,T,L,a['+M-M1'])}${line(`${x[1]-46},${U} ${x[0]+42},${U}`,a['+MC-K1'],'control')}${line(`${x[1]-46},${L} ${x[0]+46},${L}`,a['+M-M1'],'control')}
 ${v(2,Q,K,r.bus&&a['+MC-Q7'])}${v(2,K,L,a['+M-DV2'])}
 ${v(3,Q,K,r.bus&&a['+MC-Q8'])}${v(3,K,U,a['+MC-U2'])}${v(3,U,L,a['+M-M2'])}${line(`${x[4]-46},${U} ${x[3]+42},${U}`,a['+MC-K12'],'control')}
 ${v(5,Q,K,r.bus&&a['+MC-Q9'])}${v(5,K,T,a['+M-M3'])}${v(5,T,L,a['+M-M3'])}
 ${v(6,Q,L,a['+M-S1'])}${v(7,Q,L,a['+MC-RECPT1'])}${v(8,Q,U,a['+MC-U3'])}${v(8,U,L,a['-S1'])}${v(9,Q,U,a['-D1'])}${v(9,U,L,a['-D2'])}
 ${node('+MC-Q6',x[0],Q,p,selected,{w:84})}${node('+MC-K10',x[0],K,p,selected,{w:84})}${node('+MC-U1',x[0],U,p,selected,{w:84,label:'인버터'})}${node('+MC-X3',x[0],T,p,selected,{w:84})}${node('+M-M1',x[0],L,p,selected,{w:84,label:'0.33 HP'})}
 ${node('+MC-K1',x[1],U,p,selected,{w:84,label:'운전 허가'})}${pill('+MC-R2',x[1],U+50,p,selected)}${pill('+MC-W5',x[1],T+50,p,selected)}${node('+M-F1',x[1],L,p,selected,{w:84})}
 ${node('+MC-Q7',x[2],Q,p,selected,{w:84})}${node('+MC-K2',x[2],K,p,selected,{w:84})}${node('+M-DV2',x[2],L,p,selected,{w:84})}${note(x[2]-8,T+4,'+M-X2 BRK1·2','end')}
 ${node('+MC-Q8',x[3],Q,p,selected,{w:84})}${node('+MC-K15',x[3],K,p,selected,{w:84})}${node('+MC-U2',x[3],U,p,selected,{w:84,label:'인버터'})}${node('+M-M2',x[3],L,p,selected,{w:84,label:'0.33 HP'})}${note(x[3]+8,T+4,'X3 504–506')}
 ${node('+MC-K12',x[4],U,p,selected,{w:84,label:'분말 지령'})}${pill('+MC-W6',x[4],T+50,p,selected)}
 ${node('+MC-Q9',x[5],Q,p,selected,{w:84})}${node('+MC-K14',x[5],K,p,selected,{w:84})}${node('+M-X2',x[5],T,p,selected,{w:84})}${node('+M-M3',x[5],L,p,selected,{w:84,label:'1 HP'})}
 ${node('+MC-Q10',x[6],Q,p,selected,{w:84})}${node('+M-S1',x[6],L,p,selected,{w:84})}${node('+MC-Q11',x[7],Q,p,selected,{w:84})}${node('+MC-RECPT1',x[7],L,p,selected,{w:84})}
 ${node('+MC-Q12',x[8],Q,p,selected,{w:84})}${node('+MC-U3',x[8],U,p,selected,{w:84})}${pill('-C1',x[8],U+50,p,selected)}${node('-S1',x[8],L,p,selected,{w:84})}
 ${node('+MC-Q13',x[9],Q,p,selected,{w:84})}${node('-D1',x[9],U,p,selected,{w:84})}${pill('-CBL1',x[9],T,p,selected)}${node('-D2',x[9],L,p,selected,{w:84})}
 ${note(45,695,'주 구동 U1의 운전 허가는 K1(O:11/09)과 Q7 보조접점으로 들어갑니다. K10·K15는 비상정지 계전기 U4가 붙입니다.')}${note(45,722,'K2가 붙으면 브레이크 DV2에 전기가 들어갑니다. 인버터 속도 지령은 E-904의 아날로그 출력입니다.')}`;
}

const OUT1=[['O:11/00','+MC-K11','+MC-D22','초록 경광등 H4를 켭니다'],['O:11/02','+MC-K12','+MC-D23','분말 구동 U2에 운전 지령'],['O:11/03','+MC-K13','+MC-D24','원본에 쓰임 표기 없음'],['O:11/04','+MC-K14','+MC-D25','진공 펌프 M3을 돌립니다'],['O:11/09','+MC-K1','+MC-D3','주 구동 U1에 운전 허가']];
const OUT2=[['O:12/00','+M-Y1','+M-D4'],['O:12/01','+M-Y2','+M-D5'],['O:12/02','+M-Y3','+M-D6'],['O:12/03','+M-Y4','+M-D7'],['O:12/04','+M-Y5','+M-D8'],['O:12/05','+M-Y6','+M-D9'],['O:12/06','+M-Y7','+M-D10'],['O:12/07','+M-Y8','+M-D11'],['O:12/08','+OS-H1'],['O:12/09','+MC-K2','+MC-D12'],['O:12/10','+OS-H2'],['O:12/11','+OS-H3']];
function outputs(p,selected){
 const a=p.active,cards=['+MC-PLC3','+MC-PLC4','+MC-PLC5','+MC-PLC6','+MC-PLC7','+MC-PLC8'];
 return `${line('102,150 108,150',p.rails.v110)}${line('192,150 198,150',p.plc)}${line('282,150 288,150',p.plc)}${note(288,104,'PLC 랙 · 슬롯 1–6')}${note(835,104,'지나는 단자대')}
 ${node('+MC-Q14',60,150,p,selected,{w:84})}${node('+MC-PLC1',150,150,p,selected,{w:84})}${node('+MC-PLC2',240,150,p,selected,{w:84})}${row(cards,330,150,90,p,selected,node,{w:84})}${node('+MC-X4',870,150,p,selected,{w:70})}${node('+MC-X3',950,150,p,selected,{w:70})}
 <circle class="cv-lamp" data-on="${!!p.rails.vre}" cx="42" cy="221" r="7"/>${note(56,226,'출력 카드 1 (PLC3) · 전원 +24 VRE · 비상정지 때 꺼짐')}
 ${OUT1.map(([io,id,diode,text],i)=>{const y=275+i*82;return `${line(`126,${y} 160,${y}`,a[id])}${chip('+MC-PLC3',io,40,y,p.outputs[io],selected)}${bar(id,160,y,230,p,selected,byId.get(id).name)}${pill(diode,426,y,p,selected)}${note(170,y+34,text)}`;}).join('')}
 <circle class="cv-lamp" data-on="${!!p.rails.vdc}" cx="512" cy="221" r="7"/>${note(526,226,'출력 카드 2 (PLC4) · 전원 +24 VDC · 비상정지 때도 남음')}
 ${OUT2.map(([io,id,diode],i)=>{const y=262+i*41;return `${line(`596,${y} 626,${y}`,a[id])}${chip('+MC-PLC4',io,510,y,p.outputs[io],selected)}${bar(id,626,y,250,p,selected,byId.get(id).name)}${diode?pill(diode,925,y,p,selected,{w:64}):''}`;}).join('')}
 ${note(45,712,'코일마다 붙은 D는 역기전력 다이오드입니다.')}${note(45,738,'원본에 PLC 프로그램은 없습니다. 출력이 켜지는 순서는 수업 모형입니다.')}`;
}

const IN3=[['00',['+MC-Q6','+MC-Q7','+MC-Q8']],['01',['+MC-U1','+MC-U2']],['02',['+MC-Q9']],['03',['+MC-K6','+MC-K7']],['04',['+MC-SQ1']],['05',['+MC-SQ2']],['06',['+MC-SQ3']],['07',['+MC-SQ4']],['08',['+OS-S1','+MC-K8']],['09',['+OS-S2']],['10',['+MC-U5']],['11',['+MC-K5']],['12',['+MC-U4']],['13',['+MC-SQ5']],['14',['+MC-SQ6']],['15',['+MC-U3']]];
function inputs(p,selected){
 const a=p.active,mA=v=>Number.isFinite(v)?' '+Math.round(v*10)/10+' mA':'';
 const analog=[['IOUT0','+MC-PLC7','+MC-CBL2','+MC-U1','주 구동 속도 지령'],['IOUT1','+MC-PLC7','+MC-CBL3','+MC-U2','분말 구동 속도 지령'],['IN0','+MC-PLC8','+MC-CBL4','+MC-U1','주 구동 속도 되읽기'],['IN1','+MC-PLC8','+MC-CBL5','+MC-U2','분말 구동 속도 되읽기']];
 return `${note(45,118,'입력 카드 3 (PLC5) · 왼쪽 기기가 닫히면 입력이 켜집니다')}${note(555,118,'입력 카드 4 (PLC6)')}${note(800,118,'아날로그 (PLC7 · PLC8)')}
 ${IN3.map(([n,ids],i)=>{const y=150+i*36,io='I:13/'+n,on=p.inputs[io];return `${line(`${230-(ids.length-1)*68-31},${y} 250,${y}`,on,'control')}${ids.map((id,k)=>bare(id,230-31-(ids.length-1-k)*68,y,p,selected,{w:62,h:28,small:true})).join('')}${chip('+MC-PLC5',io,250,y,on,selected)}${note(346,y+5,(ioNames[io]?.name??'').replace(/\s*\(.*\)/,''))}`;}).join('')}
 ${Array.from({length:16},(_,i)=>{const y=150+i*36,io='I:14/'+String(i).padStart(2,'0'),on=p.inputs[io];return `${line(`615,${y} 625,${y}`,on,'control')}${bare('+M-B'+(i+1),585,y,p,selected,{w:60,h:28,small:true})}${chip('+MC-PLC6',io,625,y,on,selected)}${note(720,y+5,'캡슐 '+(i+1)+'번')}`;}).join('')}
 ${analog.map(([io,module,cable,drive,text],i)=>{const y=160+i*78;return `${line(`904,${y} 922,${y}`,a[drive],'control')}${chip(module,io,800,y,a[drive],selected,104,io+mA(p.analog?.[io]))}${bare(drive,950,y,p,selected,{w:56,h:28,small:true})}${pill(cable,852,y+26,p,selected)}${note(800,y+52,text)}`;}).join('')}
 ${note(800,500,'4–20 mA 신호입니다.')}${note(45,742,'지나는 단자대 · 예비 연결구')}${row(['+MC-X3','+M-X2','+OS-X2','+MC-SQ7','+MC-SQ8'],330,738,84,p,selected,bare,{w:76,h:28,small:true})}`;
}

const GUARDS=['+OS-S5','+OS-S6','+OS-S7','+OS-S8','+OS-S9','+OS-S10','+OS-S11'],GATES=['+M-S2','+M-S3','+M-S4','+M-S5'];
function safety(p,selected){
 const a=p.active,r=p.rails,A=150,B=285,C=420,D=530,E=650;
 const chain=(ids,x0,step,y,feed,w)=>{let on=feed,out='';ids.forEach((id,i)=>{out+=line(`${x0+(i-1)*step+w/2},${y} ${x0+i*step-w/2},${y}`,on,'control');on=on&&a[id];});return [out,on];};
 const e1=p.safe&&a['+OS-S3'],e2=e1&&a['+OS-S4'],[guardLines,guardsOn]=chain(GUARDS,70,86,C,p.safe,80),[gateLines,gatesOn]=chain(GATES,70,86,D,r.vdc,80);
 return `${note(30,104,'비상정지 고리 · 두 채널 (W1·W2)')}${line('20,150 38,150',r.vdc,'control')}${line('122,150 143,150',p.safe,'control')}${line('227,150 248,150',e1,'control')}${line('332,150 353,150',e2,'control')}${line('437,150 458,150',e2&&a['+MC-K6'],'control')}${line('542,150 598,150',e2&&a['+MC-K6']&&a['+MC-K7'],'control')}
 ${line('342,150 342,212 570,212 570,150',e2&&p.u5,'control')}${note(456,206,'U5 13-14 · 위 문 닫힘','middle')}
 ${node('+MC-Q15',80,A,p,selected,{w:84})}${node('+OS-S3',185,A,p,selected,{w:84})}${node('+OS-S4',290,A,p,selected,{w:84})}${node('+MC-K6',395,A,p,selected,{w:84,label:'33-34'})}${node('-22KA3',500,A,p,selected,{w:84,label:'K7 33-34'})}${node('+MC-U4',640,A,p,selected,{w:96})}
 ${pill('+MC-W1',700,104,p,selected)}${pill('+MC-W2',752,104,p,selected)}${note(700,150,'문이 열려도 K6과 K7이 함께 붙으면')}${note(700,168,'조그를 위해 이 길이 이어집니다.')}
 ${line(`640,186 640,236`,p.u4,'control')}${line('430,236 865,236',p.u4,'control')}${[430,535,640,745].map(x=>line(`${x},236 ${x},249`,p.u4,'control')).join('')}${line('865,236 865,271',p.u4,'control')}
 ${node('+MC-K3',430,B,p,selected,{w:84,label:'→ +24 VRE'})}${node('+MC-K4',535,B,p,selected,{w:84,label:'→ +24 VRE'})}${node('+MC-K10',640,B,p,selected,{w:84,label:'주 구동 460 V'})}${node('+MC-K15',745,B,p,selected,{w:84,label:'늦게 열림'})}${chip('+MC-PLC5','I:13/12',820,B,p.inputs['I:13/12'],selected)}
 ${pill('+MC-D13',430,B+50,p,selected)}${pill('+MC-D14',535,B+50,p,selected)}${pill('+MC-D19',640,B+50,p,selected)}${pill('+MC-D20',745,B+50,p,selected)}${note(30,280,'비상정지 계전기 U4의 출력')}${note(30,300,'57-58 → K10, 67-68 → K15 (늦게 열림)')}
 ${note(30,372,'위 문 스위치 7개 · 두 채널 (W3·W4)')}${guardLines}${line('626,420 692,420',guardsOn,'control')}${row(GUARDS,70,C,86,p,selected,node,{w:80})}${pill('+MC-W3',659,C-18,p,selected)}${pill('+MC-W4',659,C+18,p,selected)}${node('+MC-U5',740,C,p,selected,{w:96})}${line('788,420 820,420',a['+MC-U5'],'control')}${chip('+MC-PLC5','I:13/10',820,C,p.inputs['I:13/10'],selected)}
 ${note(30,482,'아래 문 리밋 스위치 직렬 고리')}${gateLines}${line('368,530 398,530',gatesOn,'control')}${row(GATES,70,D,86,p,selected,node,{w:80})}${node('+MC-K5',440,D,p,selected,{w:84})}${pill('+MC-D15',440,D+50,p,selected)}${line('482,530 510,530',a['+MC-K5'],'control')}${chip('+MC-PLC5','I:13/11',510,D,p.inputs['I:13/11'],selected)}
 ${line('742,530 758,530',a['+OS-H4'],'control')}${node('+MC-K11',700,D,p,selected,{w:84})}${node('+OS-H4',800,D,p,selected,{w:84})}${note(660,482,'K11 접점 → 초록 경광등')}
 ${note(30,602,'조그 · 원격 조작')}${line('112,650 118,650',a['+MC-K6'],'control')}${line('332,650 338,650',a['+MC-K7'],'control')}${line('290,614 290,600 710,600 710,614',a['+MC-K7'],'control')}${line('500,600 500,614',a['+MC-K7'],'control')}${line('542,650 548,650',a['+MC-K8'],'control')}${line('752,650 758,650',a['+MC-K9'],'control')}
 ${node('+OS-S12',70,E,p,selected,{w:84})}${node('+MC-K6',160,E,p,selected,{w:84})}${node('+MC-X1',290,E,p,selected,{w:84})}${node('+MC-K7',380,E,p,selected,{w:84})}${node('+OS-S13',500,E,p,selected,{w:84})}${node('+MC-K8',590,E,p,selected,{w:84})}${node('+OS-S14',710,E,p,selected,{w:84})}${node('+MC-K9',800,E,p,selected,{w:84})}
 ${pill('+MC-D16',160,E+50,p,selected)}${pill('+MC-D17',380,E+50,p,selected)}${pill('+MC-D21',590,E+50,p,selected)}${pill('+MC-D18',800,E+50,p,selected)}
 ${note(30,744,'지나는 단자대')}${row(['+MC-X4','+MC-X3','+OS-X2'],170,740,90,p,selected,bare,{w:78,h:26,small:true})}`;
}

const ROWS=[['+MC-Q1','+MC-Q7','+MC-Q8','+MC-Q9','+MC-Q2','+MC-Q6'],['+MC-Q3','+MC-Q4','+MC-Q5','+MC-Q13','+MC-Q14','+MC-Q15','+MC-Q12','+MC-Q10','+MC-Q11','+MC-F1','+MC-F2'],['+MC-PLC1','+MC-PLC2','+MC-PLC3','+MC-PLC4','+MC-PLC5','+MC-PLC6','+MC-PLC7','+MC-PLC8'],['+MC-K1','+MC-K5','+MC-K8','+MC-K7','+MC-K3','+MC-K4','+MC-K6','+MC-K11','+MC-K12','+MC-K13','+MC-K2','+MC-K9'],['+MC-K10','+MC-K15','+MC-K14'],['+MC-U2','+MC-U1','+MC-U3','+MC-U4','+MC-U5']];
function cabinet(p,selected){
 const strip=(id,y,x1=150,x2=850)=>`<g ${interactive(id,selected)}><rect class="target-outline din" x="${x1}" y="${y-5}" width="${x2-x1}" height="10" rx="2"/></g>`;
 return `<g ${interactive('+MC-ENCLOSURE',selected)}><rect class="target-outline" x="110" y="98" width="780" height="650" rx="6" fill="#e9edef" stroke="#6c858e" stroke-width="6"/></g>
 ${note(128,122,'DR4 · 수동 개폐기')}${strip('+MC-DR4',150,290)}${plain('+MC-T1',190,160,p,selected,{w:110})}${row(ROWS[0],340,150,92,p,selected,plain,{w:86})}
 ${note(128,222,'DR3 · 차단기 · 퓨즈')}${strip('+MC-DR3',250)}${row(ROWS[1],180,250,64,p,selected,bare,{w:58,h:38})}
 ${note(128,312,'직류 전원 · PLC 랙')}${plain('+MC-G1',190,350,p,selected,{w:100})}<g ${interactive('+MC-RACK1',selected)} data-active="${!!p.active['+MC-RACK1']}"><rect class="target-outline" x="268" y="316" width="584" height="68" rx="5" fill="#dfe6e8" stroke="#8ba2ab" stroke-width="2"/></g>${row(ROWS[2].slice(0,6),300,350,64,p,selected,plain,{w:58,h:44})}${row(ROWS[2].slice(6),698,350,90,p,selected,plain,{w:84,h:44})}
 ${note(128,428,'DR5 · 릴레이')}${strip('+MC-DR5',460)}${row(ROWS[3],175,460,60,p,selected,bare,{w:54,h:38})}
 ${note(128,518,'접촉기')}${row(ROWS[4],420,550,120,p,selected,plain,{w:104})}
 ${note(128,606,'인버터 · 계전기')}${row(ROWS[5],200,640,140,p,selected,plain,{w:126})}
 ${strip('+MC-DR2',715)}${pill('+MC-DR1',200,715,p,selected)}${note(250,738,'DR2 · 단자 레일 (X4 · X1 · X3)')}`;
}

function operator(p,selected){
 const o=LAYOUT.operator,X=x=>95+(x-(o.centre[0]-o.size[0]/2))*900,Y=y=>610-(y-1.1)*900;
 const ids=['+OS-S1','+OS-S2','+OS-S3','+OS-S4','+OS-S5','+OS-S6','+OS-S7','+OS-S8','+OS-S9','+OS-S10','+OS-S11','+OS-S12','+OS-S13','+OS-S14'];
 return `<g ${interactive('OS1',selected)}><rect class="target-outline" x="${X(o.centre[0]-o.size[0]/2)}" y="${Y(o.centre[1]+o.size[1]/2)}" width="${o.size[0]*900}" height="${o.size[1]*900}" rx="10" fill="#e1e7e9" stroke="#6c858e" stroke-width="5"/></g>
 ${ids.map(id=>{const d=byId.get(id);return plain(id,X(d.pos[0]),Y(d.pos[1]),p,selected,{w:104,h:50});}).join('')}
 ${note(95,130,'조작반 앞면 · 원본 23번의 버튼 자리 그대로')}${note(95,156,'S5–S11은 위 문 스위치가 들어오는 자리입니다. 경광등과 혼은 A-901에 있습니다.')}`;
}

export function drawing(sheetId,status,selected,state){
 const sh=sheets.find(s=>s.id===sheetId)??sheets[0];
 const body={'A-901':()=>layout(status,selected,state),'E-901':()=>supply(status,selected),'E-902':()=>drives(status,selected),'E-903':()=>outputs(status,selected),'E-904':()=>inputs(status,selected),'E-905':()=>safety(status,selected),'P-901':()=>cabinet(status,selected),'P-902':()=>operator(status,selected)}[sh.id]();
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 760" role="group" aria-label="${esc(sh.id+' '+sh.name)}"><style>.cv-plan-target{cursor:pointer;outline:none}.cv-plan-target[aria-pressed=true] .target-outline,.cv-plan-target:focus .target-outline,.cv-plan-target:hover .target-outline{stroke:#c47a15;stroke-width:4}.cv-plan-target:focus .node-body,.cv-plan-target:hover .node-body{stroke:#c47a15;stroke-width:3}.node-body{fill:white;stroke:#8ba2ab;stroke-width:2}.cv-plan-node{color:#506670}.cv-plan-node[data-active=true]{color:#167e79}.cv-plan-node[data-active=true] .node-body{fill:#e4f3ea;stroke:#167e79}.cv-plan-node[aria-pressed=true] .node-body{stroke:#c47a15;stroke-width:4}.tg{fill:#183540;font-size:14px;font-weight:700}.nm{fill:#506670;font-size:11.5px}.pl{fill:#183540;font-size:11.5px;font-weight:600}.st{fill:#365660;font-size:11.5px}.ch{fill:#19313e;font-size:13px;font-weight:600}.chip{fill:#edf1f2;stroke:#9caeb5;stroke-width:2}[data-chip=true] .chip{fill:#d7efe5;stroke:#167e79}.din{fill:#c9d3d7;stroke:#8ba2ab;stroke-width:1}.dial{fill:#eef2f2;stroke:#74918e;stroke-width:2}.seats circle{stroke:#74918e;stroke-width:2;fill:white}.seats circle[data-load=full]{fill:#8fd0c0}.seats circle[data-load=short]{fill:#f0c27a}.cv-lamp{fill:#c9d3d7}.cv-lamp[data-on=true]{fill:#167e79}.cv-plan-note{font-size:14px;fill:#657b86}.cv-wire{fill:none;stroke:#8ba2ab;stroke-width:3}.cv-wire[data-on=true]{stroke:#167e79;stroke-width:4}.cv-wire[data-role=control]{stroke-dasharray:7 4}.cv-rail{stroke:#8ba2ab;stroke-width:7;stroke-linecap:round}.cv-rail[data-on=true]{stroke:#167e79}</style><rect width="1000" height="760" fill="#f8fafb"/><text x="45" y="48" font-size="26" font-weight="700" fill="#19313e">${sh.id} · ${sh.name}</text><text x="45" y="80" class="cv-plan-note">샘플 9 · 원본 ${sh.source}번 도면의 기기를 연결한 교육용 도면</text>${body}</svg>`;
}
