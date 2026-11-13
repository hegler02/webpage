import {act,evaluate,resetOperation} from './capsule-engine.mjs';
import {regionKey,ioKey} from './capsule-original-map.mjs';

// Teaching actions use the same operating state as the drawings and equipment.
const SYMBOLS=[[regionKey('+MC-K1','11'),'코일 기호'],[regionKey('+MC-K1','04','child','13'),'같은 릴레이의 접점'],[regionKey('+M-B1','16'),'광전 스위치 기호'],[ioKey('I:14/00'),'PLC 입력 기호']];
export const introSteps=[
 {id:'motion',short:'움직임',title:'돌고 멈추기를 되풀이하는 기계를 먼저 봅니다.',camera:'whole',target:'MCH1',term:'index',
  explain:'캡슐 충전·선별기는 원판이 한 칸 돌고 멈출 때마다 캡슐을 채우고 검사합니다. 주 구동 모터가 원판을 돌립니다.',
  look:'원판의 캡슐 받침이 한 칸씩 옮겨 가는 것을 보세요. 움직인 뒤 멈춰 보세요.',
  actions:[['start','움직여 보기'],['stop','멈춰 보기']],required:['moving','stopped'],labels:['원판 이동 관찰','이동 후 정지 관찰']},
 {id:'wiring',short:'전선',title:'모터의 전선을 거꾸로 따라갑니다.',camera:'whole',target:'+M-M1',term:'cable',
  explain:'전선은 전기가 지나가는 길입니다. 모터에서 시작해 제어반 안의 장치를 하나씩 거슬러 올라가면 전원이 들어오는 자리에 닿습니다.',
  look:'선택한 부품과 연결 경로가 강조됩니다. 이 단계는 전원을 끈 상태입니다.',
  actions:[['+M-M1','1. 모터'],['+MC-U1','2. 인버터'],['+MC-K10','3. 접촉기'],['+MC-Q6','4. 모터 개폐기'],['+MC-Q2','5. 차단 스위치'],['+MC-Q1','6. 주 차단 스위치']],
  required:['+M-M1','+MC-U1','+MC-K10','+MC-Q6','+MC-Q2','+MC-Q1'],labels:['모터','인버터','접촉기','모터 개폐기','차단 스위치','주 차단 스위치']},
 {id:'contacts',short:'접점',title:'붙으면 연결되고, 떨어지면 끊깁니다.',camera:'contacts',target:'+MC-K1',term:'contact',
  explain:'두 금속이 만나 전류의 길을 만드는 부분을 접점이라고 합니다. 릴레이 K1 안에서 함께 움직이는 금속을 확대했습니다.',
  look:'움직이는 금속과 고정된 금속 사이의 틈을 보세요. 아래 조작은 실제로 시작·정지 버튼을 눌러 PLC가 K1을 켜고 끄게 합니다.',
  actions:[['energize','접점 닫아 보기'],['release','접점 열어 보기']],required:['closed','opened'],labels:['금속 접촉 관찰','접점 틈 관찰']},
 {id:'coil',short:'코일',title:'누가 접점을 움직일까요?',camera:'coil',target:'+MC-K1',term:'coil',
  explain:'구리 전선을 여러 번 감은 부분이 코일입니다. 전류가 흐르면 자기장이 생겨 철편을 끌어당기고, 연결된 접점이 움직입니다.',
  look:'구리색 코일, 파란 자기장 표시, 움직이는 철편을 차례로 보세요. 끄면 자기장이 사라지고 스프링이 되돌립니다. 자기장 선과 느린 움직임은 원리 설명용입니다.',
  actions:[['energize','코일에 전류 보내기'],['release','코일 전류 끊기']],required:['closed','opened'],labels:['자기장과 흡인 관찰','전류 차단과 복귀 관찰']},
 {id:'sensor',short:'감지기',title:'빛으로 캡슐이 있는지 봅니다.',camera:'sensor',target:'+M-B1',term:'photo',
  explain:'검사 자리 위의 작은 통이 광전 스위치입니다. 캡슐이 빛을 가리면 그 자리의 표시등이 켜집니다. 캡슐 자리마다 하나씩 16개가 있습니다.',
  look:'첫째 자리의 캡슐을 넣었다 빼며 첫째 광전 스위치를 보세요. 비교하기 위해 원판은 멈춰 둡니다.',
  actions:[['inside','캡슐 넣기'],['outside','캡슐 빼기']],required:['inside','outside'],labels:['캡슐 있음과 감지','캡슐 없음과 해제']},
 {id:'plc',short:'PLC',title:'버튼을 누르면 PLC가 무엇을 켤까요?',camera:'+MC-PLC2',target:'+MC-PLC2',term:'plc',
  explain:'PLC는 입력을 읽고 프로그램의 조건에 따라 출력을 정하는 제어기입니다. 시작 버튼은 입력 I:13/08로 들어오고, PLC는 출력 O:11/09로 릴레이 K1을 붙입니다.',
  look:'버튼을 누르며 입력과 출력 표시를 보세요. 입력은 누르는 동안만 켜지고 출력은 PLC가 기억해 계속 켜 둡니다. 원본에는 프로그램이 없어 이 순서는 수업 모형입니다.',
  actions:[['press','시작 버튼 누르기'],['halt','정지 버튼 누르기']],required:['on','off'],labels:['입력과 출력 켜짐','출력 꺼짐']},
 {id:'symbols',short:'도면 기호',title:'방금 본 실물을 도면에서 찾습니다.',camera:'coil',target:'+MC-K1',term:'tag',
  explain:'도면은 부품의 사진 대신 약속된 기호를 씁니다. 같은 기기 번호가 붙은 코일과 접점은 서로 다른 도면에 있어도 한 장치의 부분입니다.',
  look:'아래 이름을 눌러 원본 기호와 실물을 나란히 보세요. K1의 코일은 원본 11번에, 접점은 04번에 있습니다.',
  actions:SYMBOLS,required:SYMBOLS.map(x=>x[0]),labels:['코일','같은 장치의 접점','광전 스위치','PLC 입력']}
];
export const wiringStops={
 '+M-M1':{routes:['R03'],text:'모터로 들어오는 동력선입니다. 세 상 U·V·W와 보호접지 PE를 구분합니다.'},
 '+MC-U1':{routes:['R03','R02'],text:'인버터 U1이 주파수를 바꿔 모터 속도를 정합니다. 모터선은 여기서 나갑니다.'},
 '+MC-K10':{routes:['R02'],text:'접촉기 K10의 주접점 세 개를 지난 460 V가 인버터로 갑니다. K10은 안전 계전기 U4가 붙입니다.'},
 '+MC-Q6':{routes:['R02'],text:'모터 개폐기 Q6은 주 구동 한 대만 맡습니다. 과부하가 걸리면 스스로 떨어집니다.'},
 '+MC-Q2':{routes:['R01'],text:'차단 스위치 Q2 뒤에서 460 V 모선이 여러 갈래로 나뉩니다.'},
 '+MC-Q1':{routes:['R01'],text:'주 차단 스위치 Q1로 설비 전원이 들어옵니다. 실제 전력 공급 방향은 지금 따라온 방향의 반대입니다.'}
};
export function restoreIntro(value){
 const step=introSteps.some(x=>x.id===value?.step)?value.step:introSteps[0].id;
 const completed=Array.isArray(value?.completed)?value.completed:[];
 return {version:1,step,completed:introSteps.filter(x=>completed.includes(x.id)).map(x=>x.id)};
}
export function prepareIntro(state,id){
 const step=introSteps.find(x=>x.id===id);if(!step)throw new Error('Unknown introduction step');
 const evidence=structuredClone(state.evidence);resetOperation(state);
 if(['contacts','coil','sensor','plc'].includes(id))act(state,'power');
 if(id==='sensor')act(state,'place',1);
 state.evidence=evidence;
 return {id,seen:[],lastAction:'',movingFrom:null,feedback:'',focus:step.target,region:SYMBOLS[0][0]};
}
function mark(session,id){if(!session.seen.includes(id))session.seen.push(id);}
const travelled=state=>state.count+state.phase;
function start(state){if(!state.power)act(state,'power');act(state,'normal');act(state,'start');}
export function introAction(session,state,action){
 const step=introSteps.find(x=>x.id===session.id);if(!step.actions.some(x=>x[0]===action))return false;
 session.lastAction=action;session.feedback='';
 if(action==='start'){start(state);session.movingFrom=travelled(state);
 }else if(action==='stop'){act(state,'stop');if(!evaluate(state).motor&&session.seen.includes('moving'))mark(session,'stopped');
 }else if(['energize','press'].includes(action))start(state);
 else if(['release','halt'].includes(action))act(state,'stop');
 else if(['inside','outside'].includes(action)){
  act(state,'place',action==='inside'?0:1);const p=evaluate(state);
  if(p.inputs['I:14/00']===(action==='inside')&&!p.motor)mark(session,action);
 }else if(session.id==='wiring'){session.focus=action;mark(session,action);
 }else if(session.id==='symbols'){session.region=action;mark(session,action);}
 return true;
}
export function introSignals(state){const p=evaluate(state);return {coil:p.active['+MC-K1'],start:p.inputs['I:13/08'],output:p.outputs['O:11/09'],photo:p.inputs['I:14/00'],motor:p.motor};}
export function observeIntro(session,state,rendered){
 if(!session)return false;const before=session.seen.length,p=evaluate(state),coil=p.active['+MC-K1'];
 if(session.id==='motion'&&session.lastAction==='start'&&p.motor&&travelled(state)>session.movingFrom+.2)mark(session,'moving');
 if(session.id==='plc'){
  if(session.lastAction==='press'&&p.outputs['O:11/09']&&coil)mark(session,'on');
  if(session.lastAction==='halt'&&!p.outputs['O:11/09']&&session.seen.includes('on'))mark(session,'off');
 }
 // Wait for the animated metals, not merely the requested electrical state.
 if(['contacts','coil'].includes(session.id)&&rendered){
  if(session.lastAction==='energize'&&coil&&rendered.contactTravel>.97)mark(session,'closed');
  if(session.lastAction==='release'&&!coil&&rendered.contactTravel<.03&&session.seen.includes('closed'))mark(session,'opened');
 }
 return before!==session.seen.length;
}
export function introReady(session){return introSteps.find(x=>x.id===session.id)?.required.every(x=>session.seen.includes(x))??false;}
export function completeIntro(progress,session){
 if(!introReady(session)){session.feedback='먼저 위 조작으로 두 상태 또는 연결 위치를 직접 비교해 보세요.';return false;}
 if(!progress.completed.includes(session.id))progress.completed.push(session.id);
 session.feedback='관찰한 단계를 기록했습니다. 언제든 다시 비교할 수 있습니다.';return true;
}
export function introReading(session,state){
 const p=evaluate(state),v=introSignals(state);
 if(session.id==='motion')return p.motor?'주 구동 모터가 원판을 한 칸씩 돌립니다.':'모터와 원판이 멈췄습니다.';
 if(session.id==='wiring')return wiringStops[session.focus].text;
 if(['contacts','coil'].includes(session.id))return v.coil?'K1 코일에 전류가 흐릅니다. 철편이 끌려가며 접점이 닫힙니다.':'K1 코일 전류가 끊겼습니다. 스프링이 되돌리며 접점이 열립니다.';
 if(session.id==='sensor')return v.photo?'캡슐이 빛을 가렸습니다. 첫째 광전 스위치와 입력 I:14/00이 켜졌습니다.':'첫째 자리에 캡슐이 없습니다. 광전 스위치와 입력 I:14/00이 꺼졌습니다.';
 if(session.id==='plc')return `입력 I:13/08 ${v.start?'켜짐':'꺼짐'} · 출력 O:11/09 ${v.output?'켜짐':'꺼짐'} · 릴레이 K1 ${v.coil?'붙음':'떨어짐'}`;
 return '원본 기호와 실제 부품의 기기 번호를 비교하세요. 기호의 개수와 부품의 대수는 다릅니다.';
}
