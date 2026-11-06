import {defaults,act,evaluate} from './conveyor-engine.mjs';

// Teaching actions use the same operating state as the drawings and equipment.
export const introSteps=[
 {id:'motion',short:'움직임',title:'물건을 옮기는 설비를 먼저 봅니다.',camera:'whole',target:'CV1',term:'conveyor',
  explain:'컨베이어는 물건을 옮기는 설비입니다. 모터가 롤러를 돌리면 검은 벨트와 그 위의 물건이 함께 움직입니다.',
  look:'검은 벨트의 가로줄과 상자의 위치를 보세요. 움직인 뒤 멈춰 보세요.',
  actions:[['start','움직여 보기'],['stop','멈춰 보기']],required:['moving','stopped'],labels:['벨트 이동 관찰','이동 후 정지 관찰']},
 {id:'wiring',short:'전선',title:'모터의 전선을 거꾸로 따라갑니다.',camera:'whole',target:'-02M1',term:'wire',
  explain:'전선은 전기가 지나가는 길입니다. 전선 끝을 고정하는 곳은 단자대, 분리해서 연결하는 부품은 커넥터입니다.',
  look:'모터에서 시작해 제어반 안으로 들어가 보세요. 선택한 부품과 연결 경로가 강조됩니다. 이 단계는 전원을 끈 상태입니다.',
  actions:[['-02M1','1. 모터'],['-02Q2','2. 현장 개폐기'],['-02X1','3. 커넥터'],['X1','4. 단자대'],['-07K1','5. 접촉기'],['-02Q1','6. 차단기']],
  required:['-02M1','-02Q2','-02X1','X1','-07K1','-02Q1'],labels:['모터','현장 개폐기','커넥터','단자대','접촉기','차단기']},
 {id:'contacts',short:'접점',title:'붙으면 연결되고, 떨어지면 끊깁니다.',camera:'contacts',target:'-07K1',term:'contact',
  explain:'두 금속이 만나 전류의 길을 만드는 부분을 접점이라고 합니다. 세 쌍의 금속이 함께 움직이는 모습을 확대했습니다.',
  look:'위쪽 움직이는 금속과 아래쪽 고정된 금속 사이의 틈을 보세요. 아래 조작은 실제로 접촉기의 코일 회로를 켜고 끕니다.',
  actions:[['energize','접점 닫아 보기'],['release','접점 열어 보기']],required:['closed','opened'],labels:['금속 접촉 관찰','접점 틈 관찰']},
 {id:'coil',short:'코일',title:'누가 접점을 움직일까요?',camera:'coil',target:'-07K1',term:'coil',
  explain:'구리 전선을 여러 번 감은 부분이 코일입니다. 전류가 흐르면 자기장이 생겨 철심을 끌어당기고, 연결된 접점이 움직입니다.',
  look:'구리색 코일, 파란 자기장 표시, 움직이는 철심을 차례로 보세요. 끄면 자기장이 사라지고 복귀합니다. 자기장 선과 느린 움직임은 원리 설명용입니다.',
  actions:[['energize','코일에 전류 보내기'],['release','코일 전류 끊기']],required:['closed','opened'],labels:['자기장과 흡인 관찰','전류 차단과 복귀 관찰']},
 {id:'sensor',short:'감지기',title:'닿지 않아도 금속을 알아챕니다.',camera:'sensor',target:'-09B1',term:'sensor',
  explain:'작은 원통이 유도형 근접 감지기입니다. 물건 아래에 붙인 금속 표적이 가까워지면 감지기의 표시등이 켜집니다.',
  look:'금속 표적을 감지기 앞에 놓았다가 치워 보세요. 종이 상자 자체를 감지하는 수업은 아닙니다. 비교하기 위해 벨트는 멈춰 둡니다.',
  actions:[['inside','금속을 앞에 놓기'],['outside','금속을 밖으로 옮기기']],required:['inside','outside'],labels:['금속 접근과 감지','금속 이탈과 해제']},
 {id:'plc',short:'PLC 입력',title:'감지한 사실은 어디로 갈까요?',camera:'PLC1',target:'PLC1',term:'plc',
  explain:'PLC는 입력을 읽고 프로그램의 조건에 따라 출력을 결정하는 제어기입니다. 지금 보는 부품은 센서 신호를 받는 입력 모듈입니다.',
  look:'금속을 옮기며 00 표시등을 보세요. I:001/00은 진입 감지 신호가 들어오는 입력 주소입니다. 이 교재에는 PLC 프로그램이 없어 출력 동작을 만들지 않았습니다.',
  actions:[['inside','금속을 앞에 놓기'],['outside','금속을 밖으로 옮기기']],required:['inside','outside'],labels:['입력 00 켜짐','입력 00 꺼짐']},
 {id:'symbols',short:'도면 기호',title:'방금 본 실물을 도면에서 찾습니다.',camera:'coil',target:'-07K1',term:'tag',
  explain:'도면은 부품의 사진 대신 약속된 기호를 씁니다. 같은 기기 번호가 붙은 코일과 접점은 서로 다른 도면에 있어도 한 장치의 부분입니다.',
  look:'아래 이름을 눌러 원본 기호와 실물을 나란히 보세요. -07K1은 이 도면에서 접촉기 한 대를 가리키는 이름표입니다.',
  actions:[['run-coil','코일 기호'],['power-main','같은 접촉기의 접점'],['input-sensor-entry','감지기 기호'],['input-plc-00','PLC 입력 기호']],
  required:['run-coil','power-main','input-sensor-entry','input-plc-00'],labels:['코일','같은 장치의 접점','감지기','PLC 입력']}
];
export const wiringStops={
 '-02M1':{routes:['W06'],text:'모터로 들어오는 동력선입니다. 세 상 U·V·W와 보호접지 PE를 구분합니다.'},
 '-02Q2':{routes:['W05','W06'],text:'현장 개폐기는 모터 가까이에서 동력의 길을 여닫습니다.'},
 '-02X1':{routes:['W04','W05'],text:'커넥터는 플러그와 소켓으로 케이블을 연결하는 부품입니다.'},
 X1:{routes:['W03','W04'],text:'단자대에서는 전선 끝을 고정합니다. 여기서 현장 케이블이 제어반 배선과 이어집니다.'},
 '-07K1':{routes:['W02','W03'],text:'접촉기는 코일의 힘으로 모터 전력용 접점을 여닫습니다.'},
 '-02Q1':{routes:['W01','W02'],text:'차단기에서 나온 전원은 분기 퓨즈를 거쳐 접촉기로 갑니다. 실제 전력 공급 방향은 지금 따라온 방향의 반대입니다.'}
};
export function restoreIntro(value){
 const step=introSteps.some(x=>x.id===value?.step)?value.step:introSteps[0].id;
 const completed=Array.isArray(value?.completed)?value.completed:[];
 return {version:1,step,completed:introSteps.filter(x=>completed.includes(x.id)).map(x=>x.id)};
}
export function prepareIntro(state,id){
 const step=introSteps.find(x=>x.id===id);if(!step)throw new Error('Unknown introduction step');
 const evidence=structuredClone(state.evidence),fresh=defaults();for(const k of ['power','permit','run','estop','isolator','fault','pallet','loaded','paused'])state[k]=fresh[k];
 if(['contacts','coil','sensor','plc'].includes(id)){act(state,'power');act(state,'reset');}
 if(['contacts','coil'].includes(id))act(state,'isolator');
 state.evidence=evidence;
 return {id,seen:[],lastAction:'',movingFrom:null,feedback:'',focus:step.target,region:'run-coil'};
}
function mark(session,id){if(!session.seen.includes(id))session.seen.push(id);}
export function introAction(session,state,action){
 const step=introSteps.find(x=>x.id===session.id);if(!step.actions.some(x=>x[0]===action))return false;
 session.lastAction=action;session.feedback='';
 if(action==='start'){
  if(!state.power)act(state,'power');if(state.run)act(state,'run');act(state,'reset');act(state,'load');act(state,'run');session.movingFrom=state.pallet;
 }else if(action==='stop'){if(state.run)act(state,'run');if(!evaluate(state).motor&&session.seen.includes('moving'))mark(session,'stopped');
 }else if(['energize','release'].includes(action)){
  if(state.run!==(action==='energize'))act(state,'run');
 }else if(['inside','outside'].includes(action)){
  act(state,'position',action==='inside'?1.5:2.15);const p=evaluate(state);
  if(p.inputs['I:001/00']===(action==='inside')&&!p.motor&&state.fault==='none')mark(session,action);
 }else if(session.id==='wiring'){session.focus=action;mark(session,action);
 }else if(session.id==='symbols'){session.region=action;mark(session,action);}
 return true;
}
export function observeIntro(session,state,rendered){
 if(!session)return false;const before=session.seen.length,p=evaluate(state);
 if(session.id==='motion'&&session.lastAction==='start'&&p.motor&&state.pallet<session.movingFrom-.03)mark(session,'moving');
 // Wait for the animated metals, not merely the requested electrical state.
 if(['contacts','coil'].includes(session.id)&&rendered){
  if(session.lastAction==='energize'&&p.coil&&rendered.contactTravel>.97)mark(session,'closed');
  if(session.lastAction==='release'&&!p.coil&&rendered.contactTravel<.03&&session.seen.includes('closed'))mark(session,'opened');
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
 const p=evaluate(state),input=p.inputs['I:001/00'];
 if(session.id==='motion')return p.motor?'모터가 회전하고 벨트가 물건을 옮깁니다.':'모터와 벨트가 멈췄습니다.';
 if(session.id==='wiring')return wiringStops[session.focus].text;
 if(['contacts','coil'].includes(session.id))return p.coil?'코일에 전류가 흐릅니다. 철심이 끌려가며 접점이 닫힙니다.':'코일 전류가 끊겼습니다. 가동부가 돌아오며 접점이 열립니다.';
 if(session.id==='sensor')return input?'금속이 앞에 있습니다. 감지 표시등이 켜졌습니다.':'금속이 감지 범위 밖에 있습니다. 표시등이 꺼졌습니다.';
 if(session.id==='plc')return (input?'입력 00 켜짐':'입력 00 꺼짐')+' · 모터는 정지 상태입니다. 센서 입력만으로 모터에 운전 명령을 내리지 않습니다.';
 return '원본 기호와 실제 부품의 기기 번호를 비교하세요. 기호의 개수와 부품의 대수는 다릅니다.';
}
