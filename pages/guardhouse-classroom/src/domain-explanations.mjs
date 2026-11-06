const n=(v,d=2)=>Number(v).toLocaleString('ko-KR',{maximumFractionDigits:d});
const action=(id,label,value='')=>({id,label,value});
export function fireExplanation(fire,target){
  const input=fire.devices.find(d=>d.id===target&&['smoke','heat','callpoint'].includes(d.kind))??fire.devices.find(d=>['smoke','heat','callpoint'].includes(d.kind));
  const receivers=fire.devices.filter(d=>['receiver','fire-panel'].includes(d.kind));
  const outputs=fire.devices.filter(d=>['alarm','bell'].includes(d.kind));
  if(!input)throw new Error('시험할 감지기·발신기가 등록되어 있지 않습니다.');
  return {domain:'fire',title:'왜 경보가 울리거나 멈출까요?',target:input.id,status:fire.proof.status,
    result:fire.proof.status==='unknown'?'연결 정보 확인 필요':fire.alarm?'시험 신호 → 경보 작동':!fire.powered?'전원 없음 → 경보 작동 불가':'감시 중 → 경보 대기',reason:fire.proof.reason,
    options:fire.devices.filter(d=>['smoke','heat','callpoint'].includes(d.kind)).map(d=>({id:d.id,name:d.name})),
    cards:[{title:'1. 감지·발신 입력',value:fire.source?fire.devices.find(d=>d.id===fire.source).name:'입력 없음',text:'시험 입력은 선택한 장치의 반응을 대신합니다. 연기 발생 체험은 별도 화면에서 진행합니다.',actions:[action('signal',input.name+' 시험 입력',input.id),action('reset','입력 복구')]},
      {title:'2. 공급 전원',value:fire.proof.supply,text:'상용전원 또는 예비전원 중 하나가 있어야 신호를 전달합니다. 예비전원은 소방용이며 일반 조명 회로를 켜지 않습니다.',actions:[action('mains','상용전원 '+(fire.mains?'끄기':'켜기')),action('battery','예비전원 '+(fire.battery?'끄기':'켜기'))]},
      {title:'3. 연결된 경보',value:outputs.map(d=>d.name+' · '+(d.stateLabel??(d.on?'경보 작동':'경보 대기'))).join(' / ')||'등록된 경보 장치 없음',text:receivers.length?receivers.map(d=>d.name).join(' · ')+'는 전원이 있으면 감시합니다. 감시 중과 화재 경보 중은 다른 상태입니다.':'이 세대 모형은 감지기와 경보의 기능 연결을 보여줍니다. 동 전체의 공용 수신기를 추가로 가정하지 않습니다.'}],
    terms:[['detector','감지기'],['fire-alarm','경보장치'],['extinguisher','소화기']],
    links:[action('drawing','같은 기구 도면·3D'),action('safety','안전점검 연결'),action('quantities','설치 수량 확인')],
    note:'불이 꺼진 장치도 설치 수량에는 남습니다. 이 모형은 소방 장치의 예비전원을 하나의 수업 조건으로 묶으며, 개별 축전지 용량이나 감지·연기 확산 시간을 계산하지 않습니다.'};
}
export function structureExplanation(lesson,base,current=base){
  const bending=Number.isFinite(current?.M);
  const ids=bending?['design-load','moment','resistance']:lesson.steps.map(s=>s.id);
  return {domain:'structure',title:bending?'왜 이 부재에 철근이 필요할까요?':'이 부재는 하중을 어디로 전달할까요?',target:lesson.target.element,status:lesson.pass===false?'off':'on',result:lesson.result,reason:lesson.where,
    live:bending?{value:current.live,base:base.live,max:20}:null,
    cards:lesson.steps.filter(s=>ids.includes(s.id)).map(s=>({title:s.title,value:s.value,text:s.why+' '+s.theory,equation:s.equation})),
    terms:bending?[['live-load','활하중'],['moment','휨모멘트'],['steel-area','철근 단면적'],['deflection','처짐']]:[['reaction','하중 전달'],['stress','응력'],['bearing','지지압']],
    links:[action('drawing','같은 부재 도면·3D'),action('calculation','이 조건의 공식과 단위'),action('quantities','이 부재의 수량 확인')],
    comparison:bending?`기본 활하중 ${n(base.live)} → 현재 ${n(current.live)} kN/m² · 휨 요구 ${n(base.M)} → ${n(current.M)} kN·m · 균열 전 처짐 ${n(base.deflection,3)} → ${n(current.deflection,3)} mm`:'',
    note:bending?'하중 비교에서는 같은 형상과 배근을 유지합니다. 하중을 늘리면 요구 휨과 처짐이 커지지만 철근이 자동으로 추가되지는 않습니다. 3D 화살표는 하중의 방향과 상대 크기이며 실제 변형 형상이 아닙니다.':lesson.conditions};
}
export function materialExplanation(assembly,index=0){
  const layer=assembly.layers[index]??assembly.layers[0],total=assembly.layers.reduce((s,l)=>s+l.mm,0);
  if(!assembly.layers.every(l=>Number.isFinite(l.mm)&&l.mm>0))throw new Error('재료층 두께가 올바르지 않습니다.');
  return {domain:'materials',title:'왜 재료를 여러 겹으로 구성할까요?',target:layer.id,assembly:assembly.id,status:'on',result:layer.name+' · '+n(layer.mm,2)+' mm',reason:layer.role,
    options:assembly.layers.map(l=>({id:l.id,name:l.name})),
    cards:[{title:assembly.name+'의 구성',value:assembly.layers.map(l=>n(l.mm,2)).join(' + ')+' = '+n(total,2)+' mm',text:'각 층의 두께를 더한 단면입니다. 3D에서 층 사이를 벌린 간격은 설명을 위한 표시이며 시공 두께에 더하지 않습니다.'},
      {title:'면적에서 재료 부피로',equation:'V = A × (t / 1,000)',value:'1 m² × '+n(layer.mm/1000,4)+' m = '+n(layer.mm/1000,4)+' m³',text:'A는 면적(m²), t는 두께(mm), V는 부피(m³)입니다. 1 m² 기준 단위 환산 예시이며 건물 전체 물량은 아래 재료·수량에서 실제 형상과 개구부를 읽어 확인합니다.'},
      {title:'마감·단열·구조의 역할',value:'색상 변경과 성능 변경을 구분합니다.',text:'구조층은 힘을 전달하고, 단열층은 열의 이동을 줄이며, 마감층은 표면을 보호합니다. 재료의 이름이나 색만으로 화재 등급·열 성능을 판정할 수 없습니다. 제품 성적과 전체 구성 조건이 필요합니다.'}],
    terms:assembly.terms??[['insulation','단열재'],['finish','마감재']],
    links:[action('drawing','선택한 층 도면·3D'),action('location','건물의 해당 위치'),action('quantities','해당 부재의 수량')],
    quantityTarget:assembly.target,
    note:'재료층 견본을 건물 전체 물량으로 중복 집계하지 않습니다. 열전도율·밀도·성능 자료가 없는 층에 수치를 임의로 채우지 않습니다.'};
}
