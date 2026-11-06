import {act,evaluate} from './conveyor-engine.mjs';

// Observations are derived from the same state that drives the equipment.
export const traceSteps=[
 {id:'permit',name:'운전 조건',region:'permit-coil',term:'relay',routes:['W07']},
 {id:'coil',name:'접촉기 코일',region:'run-coil',term:'coil',routes:['W08']},
 {id:'contacts',name:'동력 접점',region:'power-main',term:'contact',routes:['W02','W03']},
 {id:'motor',name:'모터 동력',region:'power-motor',term:'motor',routes:['W04','W05','W06']},
 {id:'feedback',name:'동작 확인 신호',region:'input-plc-07',term:'feedback',routes:['W12']}
];
export function routeOn(id,s,p=evaluate(s)){
 if(['W01','W02','W07'].includes(id))return s.power;
 if(['W03','W04','W05','W08','W12'].includes(id))return p.coil;
 if(id==='W06')return p.motor;
 if(id==='W09')return p.inputs['I:001/00'];
 if(id==='W10')return p.inputs['I:001/01'];
 if(id==='W11')return Object.values(p.inputs).some(Boolean);
 return false;
}
export function traceReading(id,s){
 const p=evaluate(s),on=v=>v?'ON':'OFF';
 const readings={
  permit:{value:p.active['-06K1'],state:`주전원 ${on(s.power)} · 비상정지 ${s.estop?'눌림':'해제'} · 운전 허가 ${on(p.active['-06K1'])}`,
   why:!s.power?'제어 전원이 없어 허가 릴레이가 동작하지 않습니다. 주 차단기를 켜세요.':s.estop?'비상정지의 닫힘 접점이 열려 허가가 해제됐습니다. 버튼을 해제한 뒤 운전 OFF 상태에서 허가 복구가 필요합니다.':!s.permit?'이 수업에서는 운전 OFF, 비상정지 해제, 제어 배선 정상일 때 복구 버튼으로 운전 허가를 준비합니다.':'허가 릴레이가 유지되어 운전 명령을 받을 수 있습니다. 허가만으로 모터가 출발하지는 않습니다.'},
  coil:{value:p.coil,state:`운전 요구 ${on(s.run)} · 접촉기 코일 ${on(p.coil)}`,
   why:p.coil?'전원·허가·운전 요구가 연결되어 코일이 여자됩니다. 자기장이 가동 철심을 끌어당깁니다.':s.fault==='wire'?'운전 요구가 있어도 코일로 가는 제어 배선이 끊겼습니다. 이 모형은 허가도 해제합니다.':p.reason},
  contacts:{value:p.coil,state:`동력 접점 ${p.coil?'닫힘':'열림'} · 모터 ${on(p.motor)}`,
   why:p.coil?'07번 도면의 -07K1 코일이 02번의 같은 번호 동력 접점 세 개를 닫습니다. 뒤쪽 개폐기까지 연결되어야 모터에 동력이 도착합니다.':'코일이 여자되지 않아 동력 접점이 열려 있습니다. 도면에 떨어져 그려져도 코일과 접점은 같은 접촉기에 속합니다.'},
  motor:{value:p.motor,state:`접촉기 ${on(p.coil)} · 현장 개폐기 ${s.isolator?'닫힘':'열림'} · 모터 ${on(p.motor)}`,
   why:!s.isolator?'현장 개폐기에서 동력 경로가 끊겼습니다. 접촉기와 표시등이 켜져도 모터는 정지할 수 있습니다.':p.motor?(s.paused?'동력 연결은 정상입니다. 현재는 관찰을 위해 시간만 멈춘 상태입니다.':'동력 경로가 이어져 모터·감속기·벨트가 움직입니다. 배선도와 실제 설치 경로는 모양이 달라도 같은 연결입니다.'):p.reason},
  feedback:{value:p.feedback,state:`접촉기 피드백 ${on(p.feedback)} · 모터 ${on(p.motor)}`,
   why:p.feedback?'보조접점 → 입력 단자 17 → PLC 입력 I:001/07로 접촉기 상태를 읽습니다. 이 신호는 축의 회전을 측정하지 않습니다.':'보조접점의 동작 확인 신호가 없습니다. 이 입력은 모터를 켜는 출력 명령이 아니며, 실제 회전 확인과도 구분합니다.'}
 };
 return {...traceSteps.find(x=>x.id===id),...readings[id]};
}
export const diagnosisCases=[
 {id:'isolator',title:'표시는 켜졌는데 벨트가 멈췄다',question:'코일과 피드백은 ON입니다. 모터가 멈춘 원인은 무엇일까요?',answer:'isolator',
  checks:[['coil','코일과 접점 확인','run-coil'],['feedback','PLC 피드백 확인','input-plc-07'],['motor','모터 쪽 동력 확인','power-isolator']],
  explanation:'현장 개폐기가 열려 동력만 끊겼습니다. 접촉기 피드백 ON은 실제 모터 회전의 증거가 아닙니다.',
  recovery:'가상 설비의 운전을 OFF로 놓고 현장 개폐기를 닫은 뒤 운전을 ON으로 바꾸세요.'},
 {id:'wire',title:'운전을 켜도 코일이 붙지 않는다',question:'전원과 운전 요구를 확인했습니다. 코일까지 전달되지 않는 원인은 무엇일까요?',answer:'wire',
  checks:[['permit','운전 허가 확인','permit-coil'],['coil','코일 제어 연결 확인','run-coil']],
  explanation:'코일 제어 배선 단선으로 코일과 허가가 해제됐습니다. 운전 요구와 실제 코일 상태를 따로 확인해야 합니다.',
  recovery:'운전 OFF → 모의 고장 해제 → 허가 복구 → 운전 ON 순서로 확인하세요.'},
 {id:'sensor-off',title:'물체가 있는데 입력은 꺼져 있다',question:'금속 표적이 감지기 앞에 있습니다. 실제 위치와 입력이 다른 원인은 무엇일까요?',answer:'sensor-off',
  checks:[['physical','감지기와 금속 표적 확인','input-sensor-entry'],['input','단자와 PLC 입력 확인','input-plc-00']],
  explanation:'물체는 감지 위치에 있지만 진입 입력이 OFF로 고정된 모의 고장입니다. 입력 상태와 물체 위치는 별도의 증거입니다.',
  recovery:'모의 고장을 해제하고 표적을 감지기 앞과 밖에 각각 놓아 입력 ON·OFF가 따라오는지 확인하세요.'},
 {id:'emergency',title:'비상정지를 풀어도 출발하지 않는다',question:'비상정지는 해제됐습니다. 운전 요구가 있어도 움직이지 않는 이유는 무엇일까요?',answer:'permit',
  checks:[['estop','비상정지 접점 확인','permit-estop'],['permit','허가 릴레이 확인','permit-coil'],['coil','운전 요구와 코일 비교','run-coil']],
  explanation:'비상정지 해제만으로 운전 허가가 복구되지 않습니다. 별도 복구와 새로운 운전 조작이 필요합니다.',
  recovery:'운전을 OFF로 놓고 허가 복구를 누른 뒤 운전을 ON으로 바꾸세요.'}
];
export const diagnosisAnswers=[['isolator','모터 쪽 현장 개폐기가 열림'],['wire','코일 제어 배선 단선'],['sensor-off','진입 센서 입력 OFF 고정'],['permit','비상정지 후 운전 허가 미복구']];
const caseFor=t=>diagnosisCases.find(x=>x.id===t?.id);
const faultPresent=(id,s,p)=>({isolator:s.power&&s.permit&&s.run&&!s.estop&&s.fault==='none'&&!s.isolator&&p.coil&&!p.motor,wire:s.power&&s.run&&!s.estop&&s.fault==='wire'&&!p.coil,'sensor-off':s.power&&s.fault==='sensor-off'&&p.physical&&!p.inputs['I:001/00'],emergency:s.power&&!s.estop&&s.run&&!s.permit&&s.fault==='none'&&!p.coil})[id]===true;
export function startDiagnosis(s,id){
 if(!diagnosisCases.some(x=>x.id===id))throw new Error('Unknown diagnosis');
 const evidence={...s.evidence};
 // Only operating state is reset. Ratings, quantities and learning records survive.
 Object.assign(s,{power:false,permit:false,run:false,estop:false,isolator:true,fault:'none',paused:false});
 act(s,'load');act(s,'power');act(s,'reset');
 if(id==='sensor-off'){act(s,'position',1.5);act(s,'fault','sensor-off');}
 else {act(s,'run');if(id==='isolator')act(s,'isolator');if(id==='wire')act(s,'fault','wire');if(id==='emergency'){act(s,'estop');act(s,'estop');}}
 s.evidence=evidence;
 return {id,observations:{},answer:null,correct:false,feedback:'문제 상태를 준비했습니다. 관찰 버튼으로 도면과 실제 장치를 확인하세요.',sensorChecks:[],isolatorStep:0,complete:false};
}
export function observationText(key,s){const p=evaluate(s),on=v=>v?'ON':'OFF';return {
 coil:`운전 요구 ${on(s.run)} · 코일 ${on(p.coil)} · 제어 배선 ${s.fault==='wire'?'단선':'정상'}`,
 feedback:`PLC I:001/07 ${on(p.feedback)} · 실제 모터 ${on(p.motor)}`,
 motor:`현장 개폐기 ${s.isolator?'닫힘':'열림'} · 모터 ${on(p.motor)}`,
 permit:`주전원 ${on(s.power)} · 운전 허가 ${on(p.active['-06K1'])}`,
 estop:`비상정지 ${s.estop?'눌림':'해제'} · 운전 허가 ${on(p.active['-06K1'])}`,
 physical:`금속 표적 ${p.physical?'진입 감지기 앞':'진입 감지기 밖'}`,
 input:`주전원 ${on(s.power)} · PLC I:001/00 ${on(p.inputs['I:001/00'])}`
 }[key];}
export function observeDiagnosis(t,s,key){const c=caseFor(t);if(!c?.checks.some(x=>x[0]===key))return false;if(!faultPresent(c.id,s,evaluate(s))){t.feedback='문제 상태가 바뀌었습니다. 문제를 다시 시작한 뒤 관찰하거나, 원인을 맞혔다면 복구를 확인하세요.';return false;}t.observations[key]=observationText(key,s);t.feedback='관찰 내용을 기록했습니다. 다른 증거와 비교해 원인을 선택하세요.';return true;}
export function answerDiagnosis(t,s,answer){const c=caseFor(t);if(!c)return false;t.complete=false;t.correct=false;t.sensorChecks=[];t.isolatorStep=0;t.answer=answer;
 if(!c.checks.every(([k])=>t.observations[k])){t.feedback='먼저 관찰 버튼을 모두 눌러 실제 상태를 확인하세요.';return false;}
 if(!faultPresent(c.id,s,evaluate(s))){t.feedback='관찰 뒤 설비 상태가 바뀌었습니다. 문제를 다시 시작해 현재 증거로 판단하세요.';return false;}
 t.correct=answer===c.answer;t.feedback=t.correct?c.explanation:'현재 기록된 코일·동력·입력 상태와 맞지 않습니다. 관찰 내용을 비교하고 다시 선택하세요.';return t.correct;}
export function trackRecovery(t,s,action){
 if(!t?.correct)return;
 if(t.id==='isolator'){
  if(!s.power||s.estop||s.fault!=='none'){t.isolatorStep=0;return;}
  if(action==='run'&&!s.run)t.isolatorStep=1;
  if(action==='isolator'){
   if(s.isolator&&!s.run&&t.isolatorStep===1)t.isolatorStep=2;
   else {t.isolatorStep=s.run?0:1;if(s.run)t.feedback='운전 요구가 켜진 채 개폐기를 바꿨습니다. 운전 OFF 후 개폐기를 열었다 닫고, 새로 운전을 켜서 확인하세요.';}
  }
  if(action==='run'&&s.run)t.isolatorStep=t.isolatorStep===2&&s.isolator?3:0;
 }
 if(t.id==='sensor-off'){const p=evaluate(s);if(s.power&&s.fault==='none'&&p.physical===p.inputs['I:001/00']){const key=p.physical?'inside':'outside';if(!t.sensorChecks.includes(key))t.sensorChecks.push(key);}else t.sensorChecks=[];}
}
export function recoveryReady(t,s){if(!t?.correct)return false;const p=evaluate(s);return s.fault==='none'&&s.power&&!s.estop&&s.isolator&&(t.id==='sensor-off'?t.sensorChecks.includes('inside')&&t.sensorChecks.includes('outside')&&p.physical===p.inputs['I:001/00']:p.motor&&!s.paused&&(t.id!=='isolator'||t.isolatorStep===3));}
export function confirmRecovery(t,s){if(!t)return false;trackRecovery(t,s);t.complete=recoveryReady(t,s);t.feedback=t.complete?'복구 후 실제 상태까지 확인했습니다. 관찰 → 원인 판단 → 복구 과정을 마쳤습니다.':'아직 복구 확인 조건이 충족되지 않았습니다. 아래 순서와 현재 상태를 다시 확인하세요.';return t.complete;}
