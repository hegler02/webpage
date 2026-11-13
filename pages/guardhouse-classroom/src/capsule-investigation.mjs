import {act,actionLabel,evaluate,resetOperation,settle,ESTOPS,GUARDS} from './capsule-engine.mjs';
import {regionKey,ioKey} from './capsule-original-map.mjs';

const K1_COIL=regionKey('+MC-K1','11'),K1_CONTACT=regionKey('+MC-K1','04','child','13'),U4=regionKey('+MC-U4','20'),Q4='+MC-Q4';
// The order follows the drawings: safety loop, switched 24 V, PLC command, drive enable, product check.
export const traceSteps=[
 {id:'safety',name:'안전 고리',region:U4,term:'safety-relay',routes:['R08','R09']},
 {id:'rail',name:'+24 VRE 전원',region:regionKey('+MC-K3','03','child','13'),term:'rail',routes:[]},
 {id:'plc',name:'PLC 시작 명령',region:ioKey('I:13/08'),term:'input',routes:['R11']},
 {id:'enable',name:'인버터 운전 허가',region:K1_CONTACT,term:'drive',routes:['R13','R14','R02','R03']},
 {id:'feedback',name:'캡슐 확인 신호',region:ioKey('I:14/00'),term:'photo',routes:['R07','R06']}
];
const any=(values,prefix)=>Object.entries(values).some(([k,v])=>k.startsWith(prefix)&&v);
const valves=p=>['O:12/00','O:12/01','O:12/02','O:12/03'].some(a=>p.outputs[a]);
const onOff=v=>v?'켜짐':'꺼짐';
export function routeOn(id,s,p=evaluate(s)){
 return !!({R01:s.power,R02:p.active['+MC-U1'],R03:p.motor,R04:p.powder,R05:p.vacuum,R06:valves(p),R07:any(p.inputs,'I:14/'),
  R08:p.safe&&ESTOPS.every(e=>!s.off[e]),R09:p.u5,R10:p.active['+MC-K5'],R11:p.inputs['I:13/08'],R12:p.outputs['O:12/10'],R13:p.active['+MC-K1'],R14:p.active['+MC-K10']})[id];
}
export function traceReading(id,s){
 const step=traceSteps.find(x=>x.id===id),p=evaluate(s),a=p.active;if(!step)throw new Error('Unknown trace step');
 const pressed=ESTOPS.some(e=>s.off[e]),open=GUARDS.some(g=>s.off[g]);
 if(id==='safety')return {...step,value:`U5 ${a['+MC-U5']?'붙음':'떨어짐'} · U4 ${p.u4?'붙음':'떨어짐'}`,state:p.u4,
  why:!p.safe?'+24 VDC나 차단기 Q15가 없어 안전 계전기에 전원이 없습니다.':pressed?'비상정지 버튼이 눌려 두 채널이 함께 끊겼습니다. U4가 떨어지고 K3·K4도 떨어집니다.':open&&p.bypass?'위 문이 열렸지만 조그 릴레이 K6·K7의 접점이 U5 접점 대신 고리를 이어 U4가 살아 있습니다.':open?'위 문 스위치가 열려 U5가 떨어졌습니다. U5의 13-14 접점이 빠져 U4도 떨어집니다.':'비상정지 두 채널과 위 문 스위치가 모두 닫혀 U5와 U4가 붙어 있습니다.'};
 if(id==='rail')return {...step,value:`+24 VDC ${p.rails.vdc?'있음':'없음'} · +24 VRE ${p.rails.vre?'있음':'없음'}`,state:p.rails.vre,
  why:p.rails.vre?'K3과 K4의 접점이 닫혀 +24 VRE가 살아 있습니다. 출력 카드 1의 코일이 이 전원을 씁니다.':!p.rails.vdc&&!a['+MC-G1']?'직류 전원 장치 G1이 꺼져 24 V가 모두 없습니다.':s.off[Q4]?'차단기 Q4가 열려 +24 VRE가 없습니다. PLC가 출력을 켜도 카드 1의 코일은 붙지 못합니다.':'U4가 떨어져 K3·K4가 떨어졌고 +24 VRE가 끊겼습니다. +24 VDC는 그대로여서 입력과 경광등은 살아 있습니다.'};
 if(id==='plc')return {...step,value:`I:13/08 ${onOff(p.inputs['I:13/08'])} · O:11/09 ${onOff(p.outputs['O:11/09'])}`,state:p.outputs['O:11/09'],
  why:p.run?'PLC가 시작 명령을 기억해 O:11/09(K1)와 O:11/00(K11)을 켜 둡니다. 시작 입력은 누르는 동안만 켜집니다. 원본에 프로그램이 없어 이 기억 순서는 수업 모형입니다.':p.reason};
 if(id==='enable')return {...step,value:`K10 ${a['+MC-K10']?'붙음':'떨어짐'} · K1 ${a['+MC-K1']?'붙음':'떨어짐'} · 모터 ${p.motor?'회전':'정지'}`,state:p.motor,
  why:p.motor?'K10 주접점이 460 V를 인버터 U1로 보내고, K1의 13-14 접점이 U1의 운전 단자를 잇습니다. K10은 PLC가 아니라 U4의 지연 접점이 붙입니다.':!a['+MC-K10']?'K10이 떨어져 인버터에 460 V가 없습니다. K10은 안전 계전기 U4가 붙입니다.':!a['+MC-U1']?'K10은 붙었지만 모터 개폐기 Q6이 열려 인버터 U1에 460 V가 없습니다.':a['+MC-K1']?'K1은 붙었지만 인버터 고장이나 브레이크 회로 때문에 모터가 돌지 못합니다.':p.outputs['O:11/09']?'PLC는 O:11/09를 켰지만 +24 VRE가 없어 K1이 붙지 못합니다.':'인버터에 전원은 있지만 PLC가 O:11/09를 켜지 않아 K1의 운전 허가가 없습니다.'};
 const count=Object.entries(p.inputs).filter(([k,v])=>k.startsWith('I:14/')&&v).length;
 return {...step,value:`광전 스위치 ${count}/16 켜짐`,state:count>0,
  why:count?'검사 자리에 온 캡슐이 빛을 가려 입력 카드 4의 점이 켜졌습니다. 빈 자리가 있으면 PLC가 O:12/02(Y3)로 그 묶음을 내보냅니다. 어느 묶음이 비었는지 기억하는 순서는 수업 모형입니다.':'검사 자리에 캡슐 묶음이 없거나 원판이 도는 중이어서 광전 스위치가 모두 꺼져 있습니다.'};
}

export const diagnosisCases=[
 {id:'guard',title:'갑자기 멈춘 기계',question:'돌던 기계가 멈췄습니다. 비상정지 버튼은 아무도 누르지 않았습니다.',answer:'guard',
  checks:[['u5','위 문 안전 계전기 U5',regionKey('+MC-U5','21')],['u4','비상정지 안전 계전기 U4',U4],['k3','릴레이 K3과 +24 VRE',regionKey('+MC-K3','03','child','13')]],
  explanation:'위 보호문 스위치가 열리면 U5가 떨어집니다. U5의 13-14 접점은 U4의 고리 안에 있어 U4와 K3·K4가 차례로 떨어지고 +24 VRE가 끊깁니다.',
  recovery:'위 보호문을 닫아 U5와 U4를 되살린 뒤 시작 버튼을 새로 누릅니다.',actions:[['toggle','+OS-S7'],['start']]},
 {id:'overload',title:'켜지지 않는 준비 신호',question:'운전 중에 기계가 서고 빨간 경광등이 켜졌습니다. 문과 비상정지는 그대로입니다.',answer:'overload',
  checks:[['aux','입력 I:13/00 (구동 개폐기 준비)',ioKey('I:13/00')],['q6','모터 개폐기 Q6',regionKey('+MC-Q6','04')],['u4','비상정지 안전 계전기 U4',U4]],
  explanation:'Q6이 과부하로 떨어지면 주접점이 인버터 전원을 끊고, 함께 움직이는 보조 접점이 Q6·Q7·Q8 직렬 고리를 끊어 I:13/00이 꺼집니다. 안전 계전기는 그대로입니다.',
  recovery:'과부하 원인을 없앴다고 보고 Q6을 다시 닫은 뒤 시작 버튼을 누릅니다.',actions:[['toggle','+MC-Q6'],['start']]},
 {id:'air',title:'전기는 멀쩡한 정지',question:'기계가 서고 노란 경광등이 켜졌습니다. 개폐기와 안전 계전기는 모두 붙어 있습니다.',answer:'air',
  checks:[['air','입력 I:13/05 (공기 압력)',ioKey('I:13/05')],['ready','입력 I:13/01 (인버터 준비)',ioKey('I:13/01')],['u4','비상정지 안전 계전기 U4',U4]],
  explanation:'압력 스위치 SQ2가 열리면 I:13/05가 꺼지고 PLC가 운전을 세웁니다. 전기 회로가 아니라 공기 쪽 조건이어서 개폐기와 안전 계전기에는 변화가 없습니다.',
  recovery:'공기 압력을 되살린 뒤 시작 버튼을 누릅니다.',actions:[['fault','none','공기 압력 되살리기'],['start']]},
 {id:'vre',title:'출력은 켜졌는데 돌지 않는 모터',question:'시작 버튼을 눌렀고 PLC 출력 표시도 켜졌는데 모터가 돌지 않습니다.',answer:'vre',
  checks:[['output','출력 O:11/09 (주 구동 운전)',ioKey('O:11/09')],['coil','릴레이 K1 코일',K1_COIL],['q4','차단기 Q4 (+24 VRE)',regionKey(Q4,'03')]],
  explanation:'출력 카드 1의 코일은 +24 VRE로 붙습니다. Q4가 열려 있으면 PLC가 O:11/09를 켜도 K1 코일에 전압이 없어 인버터가 운전 허가를 받지 못합니다.',
  recovery:'먼저 정지 버튼으로 PLC의 운전 기억을 지우고, Q4를 닫은 뒤 시작 버튼을 누릅니다. 운전 기억이 남은 채 Q4를 닫으면 닫는 순간 기계가 돕니다.',actions:[['stop'],['toggle',Q4],['start']]},
 {id:'restart',title:'풀었는데 돌지 않는 기계',question:'비상정지 버튼을 눌렀다가 다시 풀었습니다. 기계는 계속 서 있습니다.',answer:'restart',
  checks:[['estop','비상정지 버튼 S3·S4',regionKey('+OS-S4','20')],['u4','비상정지 안전 계전기 U4',U4],['start','입력 I:13/08 (시작)',ioKey('I:13/08')]],
  explanation:'비상정지를 풀면 U4는 다시 붙지만 PLC는 운전 기억을 지운 상태입니다. 풀기만 해서는 기계가 돌지 않아야 하고, 사람이 시작 버튼을 새로 눌러야 합니다.',
  recovery:'주변을 확인하고 시작 버튼을 새로 누릅니다.',actions:[['start']]}
];
export const diagnosisAnswers=[['guard','위 보호문이 열려 있음'],['overload','모터 개폐기 Q6 과부하 트립'],['air','공기 압력 부족'],['vre','차단기 Q4가 열려 +24 VRE 없음'],['restart','비상정지 뒤 시작 버튼을 새로 누르지 않음']];
export function faultPresent(id,s,p=evaluate(s)){
 if(!s.power)return false;
 if(id==='guard')return GUARDS.some(g=>s.off[g])&&!p.u5&&!p.motor;
 if(id==='overload')return s.fault==='overload'&&!p.inputs['I:13/00']&&!p.motor;
 if(id==='air')return s.fault==='air'&&!p.inputs['I:13/05']&&!p.motor;
 if(id==='vre')return !!s.off[Q4]&&p.run&&p.outputs['O:11/09']&&!p.active['+MC-K1'];
 if(id==='restart')return !Object.keys(s.off).length&&s.fault==='none'&&!p.run&&p.u4&&!p.motor;
 return false;
}
const release=s=>act(s,'release');
export function startDiagnosis(s,id){
 const item=diagnosisCases.find(x=>x.id===id);if(!item)throw new Error('Unknown diagnosis case');
 // Preparing a problem is not the learner's own safety work, so it must not earn evidence.
 const evidence=structuredClone(s.evidence);resetOperation(s);act(s,'power');
 if(id==='vre')act(s,'toggle',Q4);
 act(s,'start');release(s);
 if(id==='guard')act(s,'toggle','+OS-S7');
 else if(id==='overload'||id==='air')act(s,'fault',id);
 else if(id==='restart'){act(s,'toggle','+OS-S4');act(s,'toggle','+OS-S4');}
 s.hold=0;s.horn=0;settle(s);s.evidence=evidence;
 return {id,observations:{},answer:null,correct:false,feedback:'문제 상태를 준비했습니다. 관찰 버튼으로 도면과 실제 장치를 확인하세요.',step:0,complete:false};
}
export function observationText(key,s){
 const p=evaluate(s),a=p.active,input=(address,name)=>`${address} ${onOff(p.inputs[address])} — ${name}`;
 return {
  u5:`U5 ${a['+MC-U5']?'붙음':'떨어짐'} · 위 문 스위치 ${GUARDS.every(g=>!s.off[g])?'모두 닫힘':'열린 곳 있음'}`,
  u4:`U4 ${p.u4?'붙음':'떨어짐'} · K10 ${a['+MC-K10']?'붙음':'떨어짐'}`,
  k3:`K3 ${a['+MC-K3']?'붙음':'떨어짐'} · +24 VRE ${p.rails.vre?'있음':'없음'} · +24 VDC ${p.rails.vdc?'있음':'없음'}`,
  aux:input('I:13/00','Q6·Q7·Q8 보조 접점 직렬'),
  q6:`Q6 ${a['+MC-Q6']?'닫힘':'떨어짐'} · 인버터 U1 전원 ${a['+MC-U1']?'있음':'없음'}`,
  air:input('I:13/05','공기 압력 스위치 SQ2'),
  ready:input('I:13/01','인버터 U1·U2 준비'),
  output:`O:11/09 ${onOff(p.outputs['O:11/09'])} · PLC 운전 기억 ${p.run?'있음':'없음'}`,
  coil:`K1 코일 ${a['+MC-K1']?'붙음':'떨어짐'} · 모터 ${p.motor?'회전':'정지'}`,
  q4:`Q4 ${a[Q4]?'닫힘':'열림'} · +24 VRE ${p.rails.vre?'있음':'없음'}`,
  estop:`비상정지 버튼 ${ESTOPS.every(e=>!s.off[e])?'모두 풀림':'눌림'}`,
  start:`${input('I:13/08','시작 버튼 S1')} · PLC 운전 기억 ${p.run?'있음':'없음'}`
 }[key]??'';
}
export function observeDiagnosis(t,s,key){
 const item=diagnosisCases.find(x=>x.id===t.id);if(!item.checks.some(x=>x[0]===key))return false;
 if(!faultPresent(t.id,s)){t.feedback='문제 상태가 바뀌었습니다. 문제를 다시 시작한 뒤 관찰하거나, 원인을 맞혔다면 복구를 확인하세요.';return false;}
 t.observations[key]=observationText(key,s);t.feedback='관찰 내용을 기록했습니다. 다른 증거와 비교해 원인을 선택하세요.';return true;
}
export function answerDiagnosis(t,s,answer){
 const item=diagnosisCases.find(x=>x.id===t.id);
 if(item.checks.some(x=>!t.observations[x[0]])){t.feedback='먼저 관찰 버튼을 모두 눌러 실제 상태를 확인하세요.';return false;}
 if(!faultPresent(t.id,s)){t.feedback='관찰 뒤 설비 상태가 바뀌었습니다. 문제를 다시 시작해 현재 증거로 판단하세요.';return false;}
 t.answer=answer;t.correct=answer===item.answer;t.step=0;
 t.feedback=t.correct?item.explanation+' 이제 복구해 보세요. '+item.recovery:'관찰한 증거와 맞지 않습니다. 세 가지 관찰 가운데 평소와 다른 것이 무엇인지 다시 보세요.';
 return t.correct;
}
// Live labels for the recovery buttons of a case.
export function recoveryButtons(id,s){
 const item=diagnosisCases.find(x=>x.id===id);
 return item.actions.map(([type,value,label])=>({type,value,label:label??actionLabel(type==='toggle'?value:type==='start'?'+OS-S1':'+OS-S2',s)}));
}
// Called after every operation: the order matters only where closing a breaker would start the machine at once.
export function trackRecovery(t,s,type,value){
 if(!t?.correct||t.id!=='vre')return;
 const p=evaluate(s);
 if(type==='stop')t.step=p.run?0:1;
 else if(type==='toggle'&&value===Q4){
  if(s.off[Q4])t.step=0;
  else if(t.step===1&&!p.motor)t.step=2;
  else{t.step=0;if(p.motor)t.feedback='운전 기억이 남은 채 Q4를 닫아 닫는 순간 기계가 돌았습니다. 정지 버튼을 먼저 눌러야 합니다. 문제를 다시 시작해 순서대로 복구해 보세요.';}
 }else if(type==='start')t.step=t.step===2&&p.run?3:t.step;
}
export function recoveryReady(t,s){
 const p=evaluate(s);
 return !!t?.correct&&s.fault==='none'&&!Object.keys(s.off).length&&p.motor&&!s.paused&&(t.id!=='vre'||t.step===3);
}
export function confirmRecovery(t,s){
 if(recoveryReady(t,s)){t.complete=true;t.feedback='복구 후 실제 상태까지 확인했습니다. 관찰 → 원인 판단 → 복구 과정을 마쳤습니다.';return true;}
 t.feedback='아직 복구 확인 조건이 충족되지 않았습니다. 아래 순서와 현재 상태를 다시 확인하세요.';return false;
}
