// A verdict and its evidence travel together to drawings, meshes and explanations.
// These are the classroom's steady-state rules, not a breaker time-current simulation.
export function explainPower(device,{devices,circuits,state,panel,hasMain=true,overloadCutsPower=true}){
  const conditions=[];
  const add=(key,label,ok,detail,control=null,target=null)=>conditions.push({key,label,ok,detail,control,target});
  const circuit=circuits.find(c=>c.id===device.circuit);
  if(hasMain)add('main','주전원',state.power===true,state.power===true?'분전반에 전원을 공급합니다.':'주전원이 꺼져 있어 분전반에서 전기를 보낼 수 없습니다.','main',panel.id);
  add('circuit','회로 연결',circuit?true:null,circuit?`${panel.id}의 ${circuit.id} 회로에 연결되어 있습니다.`:`${device.circuit??'미지정'} 회로의 정보를 찾지 못했습니다.`,null,circuit?.id);
  if(circuit){
    const closed=state.breakers?.[circuit.id]!==false;
    add('breaker',`${circuit.id} 차단기`,closed,closed?'차단기가 켜져 전기가 지나는 길이 이어집니다.':'차단기가 꺼져 이 회로에 연결된 기구로 전기를 보내지 않습니다.','breaker',circuit.id);
    const valid=Number.isFinite(circuit.current)&&Number.isFinite(circuit.breaker)&&circuit.breaker>0;
    if(overloadCutsPower)add('capacity','수업의 모의 차단 조건',valid?circuit.current<=circuit.breaker:null,valid?`설계 전류 ${circuit.current.toFixed(2)} A / 차단기 ${circuit.breaker} A. ${circuit.current>circuit.breaker?'이 수업은 정격을 넘으면 공급을 차단하도록 단순화했습니다.':'이 수업의 비교 조건 안에 있습니다.'}`:'전류와 차단기 정격 정보가 부족합니다.');
  }
  if(device.switch){
    const linked=devices.find(d=>d.id===device.switch&&d.kind==='switch'&&d.circuit===device.circuit)||(device.socket&&device.switch===device.id?device:null);
    const closed=state.switches?.[device.switch]!==false;
    add('switch',linked===device?'기구의 스위치':'연결 스위치',linked?closed:null,linked?`${device.switch} ${closed?'켜짐. 이 기구로 향하는 길이 이어집니다.':'꺼짐. 회로에 전원이 있어도 이 기구는 꺼집니다.'}`:`스위치 ${device.switch}의 연결 정보가 없습니다.`,'switch',device.switch);
  }
  const blockers=conditions.filter(c=>c.ok!==true);
  const known=conditions.every(c=>c.ok!==null);
  const on=blockers.length===0&&Number.isFinite(device.watts)&&device.watts>0;
  if(!Number.isFinite(device.watts)||device.watts<=0){add('load','입력전력',null,'기구의 입력전력이 없어 동작 상태를 판단할 수 없습니다.');}
  return {on,status:!known||conditions.some(c=>c.ok===null)?'unknown':on?'on':'off',conditions,blockers:conditions.filter(c=>c.ok!==true),
    links:{panel:panel.id,circuit:circuit?.id??null,switch:device.switch??null,device:device.id},
    design:circuit?{watts:circuit.watts,current:circuit.current,breaker:circuit.breaker,pass:circuit.pass,overloadCutsPower}:null};
}

export function applyPowerState(devices,context){
  return devices.map(device=>{
    if(device.watts===undefined||device.kind==='switch')return {...device,on:device.kind==='switch'?context.state.switches?.[device.id]!==false:false};
    const power=explainPower(device,{...context,devices});
    return {...device,on:power.on,power};
  });
}
