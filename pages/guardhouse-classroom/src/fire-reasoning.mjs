// A teaching circuit: input, available supply and installed outputs share one verdict.
const inputs=new Set(['smoke','heat','callpoint']);
const receivers=new Set(['receiver','fire-panel']);
const alarms=new Set(['alarm','bell']);
export function resolveFire(devices,{mains=true,battery=true,signal=null}={}){
  const source=devices.find(d=>d.id===signal&&inputs.has(d.kind));
  const powered=mains===true||battery===true,validInput=Boolean(source);
  const hasOutput=devices.some(d=>alarms.has(d.kind));
  const alarm=powered&&validInput&&hasOutput;
  const fault=signal!=null&&!validInput?'등록된 감지기·발신기의 신호가 아닙니다.':!hasOutput?'연결된 경보 장치가 없습니다.':null;
  const supply=mains===true?'상용전원':battery===true?'예비전원':'전원 없음';
  const reason=fault??(!powered?'상용전원과 예비전원이 모두 꺼져 신호를 전달할 수 없습니다.':!validInput?`${supply}으로 감시 중입니다. 시험 입력이 없어 경보는 대기합니다.`:`${source.name}의 입력과 ${supply}이 이어져 경보 장치가 작동합니다.`);
  return {mains:mains===true,battery:battery===true,powered,supplied:powered,alarm,signalId:signal,signal,source:source?.id??null,
    proof:{status:fault?'unknown':alarm?'on':'off',supply,reason,validInput,hasOutput},
    devices:devices.map(d=>({...d,powered:d.kind==='extinguisher'?null:powered,
      stateLabel:d.kind==='extinguisher'?'수동 기구 · 위치 확인':!powered?'전원 없음':receivers.has(d.kind)?(alarm?'화재 입력 수신 · 경보 지시':'전원 공급 · 감시 중'):alarms.has(d.kind)?(alarm?'경보 작동':'전원 공급 · 경보 대기'):inputs.has(d.kind)?(d.id===source?.id?'시험 입력 전달':'전원 공급 · 감시 중'):d.kind==='emergency'?(!mains&&battery?'예비전원으로 점등':'상용전원 · 비상 점등 대기'):'점등',
      on:receivers.has(d.kind)?powered:alarms.has(d.kind)?alarm:['exit','exit-light'].includes(d.kind)?powered:d.kind==='emergency'?!mains&&battery===true:inputs.has(d.kind)?powered&&d.id===source?.id:false,
      alarm,source:source?.id??null}))};
}
