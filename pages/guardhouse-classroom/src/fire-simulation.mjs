export function freshFireSimulation(){return {phase:'idle',elapsed:0,paused:false,detected:false,pin:false,aimed:false,spraying:false,aim:0,powder:1,zones:[1,1,1],escape:0,notified:false,exitChecked:false};}
export function fireAction(state,action,value){const s={...state,zones:[...state.zones]};
 if(action==='start')return {...freshFireSimulation(),phase:'smoke'};
 if(action==='reset')return freshFireSimulation();
 if(action==='pause'){s.paused=!s.paused;s.spraying=false;}
 if(action==='notify')s.notified=true;
 if(action==='exit')s.exitChecked=true;
 if(action==='escape'&&s.phase!=='idle'){s.phase='escape';s.escape=0;s.spraying=false;s.paused=false;}
 if(action==='extinguisher'&&['alarm'].includes(s.phase)&&s.notified&&s.exitChecked){s.phase='extinguish';s.spraying=false;s.paused=false;}
 if(s.phase==='extinguish'){
  if(action==='pin')s.pin=true;
  if(action==='aim'&&s.pin)s.aimed=true;
  if(action==='direction'&&s.aimed)s.aim=Math.max(-1,Math.min(1,Number(value)||0));
  if(action==='spray'&&s.pin&&s.aimed&&s.powder>0&&!s.paused)s.spraying=!s.spraying;
 }
 return s;
}
export function advanceFireSimulation(state,dt){const s={...state,zones:[...state.zones]};if(s.paused||!Number.isFinite(dt)||dt<=0)return s;dt=Math.min(dt,.1);
 if(['smoke','detected','alarm'].includes(s.phase)){s.elapsed+=dt;if(s.elapsed>=4){s.detected=true;s.phase=s.elapsed>=7?'alarm':'detected';}}
 if(s.phase==='escape'){s.escape=Math.min(1,s.escape+dt/10);if(s.escape>=1)s.phase='evacuated';}
 if(s.phase==='extinguish'&&s.spraying){const used=Math.min(s.powder,dt*.065);s.powder-=used;const zone=s.aim<-.35?0:s.aim>.35?2:1;s.zones[zone]=Math.max(0,s.zones[zone]-dt*.65);if(s.zones.every(z=>z<=.001)){s.phase='extinguished';s.spraying=false;}if(s.powder<=0)s.spraying=false;}
 return s;
}
export const simulationSources=[
 {title:'OSHA · 소화기 조작과 대피 판단',url:'https://www.osha.gov/etools/evacuation-plans-procedures/emergency-standards/portable-extinguishers/use'},
 {title:'Washington State Patrol · 소화기 사용 전 확인',url:'https://wsp.wa.gov/2019/09/03/fire-extinguishers-and-you/'}
];

export function fireSimulationResult(projectId){let r;try{r=JSON.parse(localStorage.getItem('fire-sim-result-'+projectId));}catch{}if(r?.version!==1||!['evacuated','extinguished'].includes(r.outcome))return '';return '<article class="sim-record"><h2>소방 체험에서 확인한 내용</h2><p>'+String(r.detector??'').replace(/[^A-Z0-9]/g,'')+' · '+(r.outcome==='evacuated'?'출입구까지의 피난 경로를 따라갔습니다.':'안전핀을 빼고 조준한 뒤 좌우로 분사해 모형의 불꽃을 껐습니다.')+' 아래 체크 항목은 직접 살펴본 뒤 표시하세요.</p><p>체험 기록은 현장 점검의 합격 판정이 아닙니다.</p></article>';}

export class FirePracticePower {
 constructor(){this.baseline=null;}
 transition(next,current){const previous=this.baseline;this.baseline=null;const power=previous||{power:current.power,battery:current.battery};if(['fire-test','fire-signal'].includes(next))this.baseline={...power};return previous;}
}
