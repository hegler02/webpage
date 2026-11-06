import {electricalPowerRoute} from './src/electrical-tags.mjs';
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const action=(name,label,value='')=>`<button type="button" data-why-action="${name}" data-value="${esc(value)}">${esc(label)}</button>`;

// A single component owns these events; sample adapters only navigate or commit state.
export function createPowerExplanation({before,change,navigate,onError=console.error}){
  const host=document.createElement('section');
  host.id='power-explanation';host.className='power-explanation';host.hidden=true;
  host.setAttribute('aria-label','전기가 연결되는 이유');before.before(host);
  let current,deviceId,lastSelected,origin='electrical',returnPending=false,busy=false;
  function choose(electric,selected){
    const loads=electric.devices.filter(d=>d.power);
    if(selected!==lastSelected){
      const linked=loads.find(d=>d.id===selected)||loads.find(d=>d.switch===selected);
      if(linked)deviceId=linked.id;
      lastSelected=selected;
    }
    return loads.find(d=>d.id===deviceId)??loads[0];
  }
  function update({electric,page,selected}){
    current={electric,page,selected};
    const inLesson=['electrical','experience'].includes(page);
    host.hidden=!inLesson&&!returnPending;
    if(host.hidden)return;
    if(!inLesson){host.innerHTML=action('return','전기가 연결되는 이유로 돌아가기',deviceId);return;}
    const device=choose(electric,selected);if(!device){host.hidden=true;return;}
    deviceId=device.id;origin=page;returnPending=false;
    const {power}=device,loads=electric.devices.filter(d=>d.power),circuit=electric.circuits.find(c=>c.id===device.circuit);
    const focus=host.contains(document.activeElement)?{action:document.activeElement.dataset.whyAction,value:document.activeElement.dataset.value,id:document.activeElement.id}:null;
    const detailsOpen=host.querySelector('details')?.open??false;
    const result=power.status==='unknown'?'연결 정보 확인 필요':device.on?(device.kind==='ffu'?'팬 작동':device.kind==='light'||device.kind==='task-light'?'조명 점등':'전원 공급'):'전원 공급 중단';
    const explanation=power.blockers.length?power.blockers.map(c=>c.detail).join(' '):'이 기구에 필요한 공급 조건이 모두 이어져 있습니다. 아래에서 한 조건을 바꾸고 도면·3D의 변화를 비교하세요.';
    host.dataset.target=device.id;host.dataset.power=power.status;
    host.innerHTML=`<header class="power-heading"><div><p class="eyebrow">WHY · 전기의 연결</p><h2>왜 이렇게 될까요?</h2></div><label for="why-target">살펴볼 기구<select id="why-target">${loads.map(d=>`<option value="${esc(d.id)}" ${device.id===d.id?'selected':''}>${esc(d.name)} · ${esc(d.id)}</option>`).join('')}</select></label></header>
      <div class="power-verdict" role="status" aria-live="polite"><strong>${esc(device.name)} · ${result}</strong><p>${esc(explanation)}</p></div>
      <div class="power-route"><p>이 기구에 전기가 연결되는 순서 · 이름표를 누르면 뜻과 도면 위치를 확인합니다.</p><ol aria-label="전기 연결 순서">${electricalPowerRoute(electric,device).map((item,i)=>`<li>${action('tag',(i+1)+'. '+item.name+' ('+item.id+')',item.term)}</li>`).join('')}</ol><p>괄호 안 글자·번호는 이 샘플의 식별표입니다. 회로 번호와 개별 기구 번호를 구별해 읽습니다.</p></div>
      <ol class="power-chain">${power.conditions.filter(c=>c.control||c.ok!==true).map(c=>`<li data-condition="${c.key}" data-state="${c.ok===null?'unknown':c.ok?'on':'off'}"><div class="power-condition-title"><h3>${esc(c.label)}</h3><span>${c.ok===null?'확인 필요':c.ok?'연결됨':'중단됨'}</span></div><p>${esc(c.detail)}</p>${c.control&&c.ok!==null?action('change',c.label+' '+(c.ok?'끄기':'켜기'),c.key):''}</li>`).join('')}</ol>
      <div class="power-links">${action('drawing','같은 기구 도면·3D 보기')}${circuit?action('calculation','이 회로 계산 보기'):''}${action('term','회로 용어 보기')}${action('quantities','설치 수량 확인')}</div>
      <details class="power-design" ${detailsOpen?'open':''}><summary>불을 꺼도 계산과 수량은 왜 그대로일까요?</summary><p>스위치는 사용 상태를 바꿉니다. 설치한 기구와 설계에 입력한 소비전력은 그대로입니다. 따라서 불을 꺼도 재료·수량에서 기구가 사라지지 않습니다.</p>${circuit?`<p>${esc(circuit.id)} 회로의 설계 입력전력은 <strong>${circuit.watts.toFixed(0)} W</strong>, 설계 전류는 <strong>${circuit.current.toFixed(2)} A</strong>입니다. 현재 켜진 기구만 더한 입력전력은 <strong>${electric.devices.filter(d=>d.circuit===circuit.id&&d.on&&d.watts).reduce((n,d)=>n+d.watts,0).toFixed(0)} W</strong>입니다. 두 수치는 목적이 다릅니다.</p><p>${power.design.overloadCutsPower?'모의 차단은 설계 전류와 차단기 정격을 비교하는 수업 규칙입니다. 실제 차단기의 동작 시간·특성은 모의하지 않습니다.':'이 샘플은 차단기를 직접 켜고 끄는 모형입니다. 설계 전류가 정격을 넘는지는 계산에서 확인하며 자동 차단을 모의하지 않습니다.'}</p>`:''}</details>`;
    if(focus){const candidates=[...host.querySelectorAll('button,select')];candidates.find(e=>focus.id?e.id===focus.id:e.dataset.whyAction===focus.action&&e.dataset.value===focus.value)?.focus({preventScroll:true});}
  }
  host.addEventListener('change',event=>{
    if(event.target.id!=='why-target')return;
    deviceId=event.target.value;update(current);
  });
  host.addEventListener('click',async event=>{
    const button=event.target.closest('[data-why-action]');if(!button||busy)return;
    event.stopPropagation();busy=true;
    try{
      const d=current.electric.devices.find(d=>d.id===deviceId),kind=button.dataset.whyAction;
      if(kind==='change'){
        const condition=d.power.conditions.find(c=>c.key===button.dataset.value);
        if(condition?.control&&condition.ok!==null)await change(condition.control,condition.target,condition.ok===true);
      }else{
        if(['calculation','quantities','term','tag'].includes(kind))returnPending=true;
        await navigate(kind,d,origin,button.dataset.value);
        if(kind==='return')host.scrollIntoView({block:'start',behavior:'instant'});
      }
    }catch(error){onError(error);}finally{busy=false;}
  });
  return {update,element:host};
}
