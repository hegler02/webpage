// The guardhouse toolbar is the shared interaction contract for every sample.
export function mountExperienceTools(host,{night=false,wiring,render,enter,outside,setNight,route,preview}){
  host.innerHTML='<button type="button" data-experience="render" class="primary">실감 렌더링</button><button type="button" data-experience="enter">실내 둘러보기</button><button type="button" data-experience="outside">밖에서 보기</button><label><input type="checkbox" data-experience="night"> 야간 조명</label><button type="button" data-experience="route">벽 속 전기 길 보기</button><button type="button" data-experience="preview">장면 미리보기</button>';
  const actions={render,enter,outside,route,preview};
  for(const button of host.querySelectorAll('button[data-experience]'))button.onclick=actions[button.dataset.experience];
  // Samples that overlay the routes in place pass wiring so the button reads as a toggle.
  if(typeof wiring==='boolean')host.querySelector('[data-experience=route]').setAttribute('aria-pressed',String(wiring));
  const toggle=host.querySelector('input');toggle.checked=night;toggle.onchange=()=>setNight(toggle.checked);
}

export function lightingStatus(electric,state,id){
  const device=electric.devices.find(d=>d.id===id);
  const lights=electric.devices.filter(d=>d.kind==='light'&&d.switch===id);
  const enabled=device?.on??state.switches[id]!==false;
  const lit=lights.filter(d=>d.on).length;
  const blockers=[...new Set(lights.flatMap(d=>d.power?.blockers.map(c=>c.ok===null?c.label+' 확인 필요':c.key==='capacity'?d.circuit+' 회로 과부하':(c.key==='switch'?'스위치':c.label)+' 꺼짐')??[]))];
  const reason=blockers.length?blockers.join(' · '):lit?'조명 점등':'조명 소등';
  return {lights,enabled,lit,reason};
}
export function lightingSwitchButtons(electric,state){
  return electric.devices.filter(d=>d.kind==='switch').map(d=>{
    const s=lightingStatus(electric,state,d.id);
    return '<button type="button" data-switch="'+d.id+'" data-lit="'+Boolean(s.lit)+'" aria-pressed="'+s.enabled+'"><span>'+d.name+' '+(s.enabled?'켜짐':'꺼짐')+'</span><small>'+s.reason+'</small></button>';
  }).join('');
}
export function lightingSummary(electric,state){
  const lights=electric.devices.filter(d=>d.kind==='light'),count=lights.filter(d=>d.on).length;
  return '<p class="lighting-summary" role="status">조명 '+count+' / '+lights.length+'개 점등 · '+(!state.power?'주전원이 꺼져 있어 모든 방이 소등됩니다. 아래 주전원을 켜세요.':count===0?'해당 회로의 차단기와 스위치를 확인하세요.':'각 방의 스위치를 바꾸면 도면과 3D 조명이 함께 바뀝니다.')+'</p>';
}

export function showScenePreview(source,label){
  let dialog=document.getElementById('workspace-preview');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='workspace-preview';dialog.className='render-dialog';dialog.innerHTML='<h2>현재 장면</h2><p>지금 보이는 시점과 조명 상태를 이미지로 담았습니다.</p><img alt=""><button type="button" data-dialog-close data-dialog-footer>돌아가기</button>';document.body.append(dialog);}
  const img=dialog.querySelector('img');img.src=source;img.alt=label;dialog.showModal();
}

export function selectionDimensions(d,{finishLevel=0,routeLength=null}={}){
  const mm=value=>Math.round(value*1000).toLocaleString('ko-KR')+' mm';
  const rows=[];
  if(d.bounds){rows.push(['안쪽 가로',mm(d.bounds[2]-d.bounds[0])],['안쪽 세로',mm(d.bounds[3]-d.bounds[1])]);}
  else if(d.size){rows.push(['기구 폭',mm(d.size[0])],['기구 깊이',mm(d.size[1])],['기구 높이',mm(d.size[2])]);}
  else if(d.footprint){const xs=d.footprint.map(p=>p[0]),ys=d.footprint.map(p=>p[1]);rows.push(['가로',mm(Math.max(...xs)-Math.min(...xs))],['깊이',mm(Math.max(...ys)-Math.min(...ys))]);}
  if(Number.isFinite(d.height))rows.push(['높이',mm(d.height)]);
  if(d.pos)rows.push(['설치 중심 높이',mm(d.pos[2]-finishLevel)]);
  else if(Number.isFinite(d.base))rows.push(['하단 기준 높이',mm(d.base)]);
  if(d.circuit)rows.push(['연결 회로',d.circuit]);
  if(d.switch)rows.push(['연결 스위치',d.switch]);
  if(Number.isFinite(d.watts))rows.push(['입력전력',d.watts+' W']);
  if(d.stateLabel)rows.push(['작동 상태',d.stateLabel]);
  else if(typeof d.on==='boolean')rows.push(['전원 상태',d.on?'켜짐':'꺼짐']);
  if(Number.isFinite(routeLength))rows.push(['전선관 경로 길이',routeLength.toFixed(2)+' m']);
  if(d.serviceOpening)rows.push(['관통부 폭',mm(d.serviceOpening.width)],['관통부 높이',mm(d.serviceOpening.height)],['관통부 중심',mm(d.serviceOpening.elevation)]);
  return '<dl>'+rows.map(([name,value])=>'<dt>'+name+'</dt><dd>'+value+'</dd>').join('')+'</dl>';
}
