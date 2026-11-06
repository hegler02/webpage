const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const button=a=>`<button type="button" data-reason-action="${esc(a.id)}" data-value="${esc(a.value??'')}">${esc(a.label)}</button>`;
// One event boundary and one bookmark for all three domains and all samples.
export function createDomainExplanation({before,change,navigate,onError=console.error}){
  const host=document.createElement('section');host.className='power-explanation domain-explanation';host.hidden=true;host.setAttribute('aria-label','설계의 이유');before.before(host);
  let current=null,bookmark=null,pending=false,busy=false;
  const local=new Set(['signal','reset','mains','battery','live','restore','choose']);
  function update(context){
    current=context;
    if(!context){host.hidden=!pending;if(pending)host.innerHTML=button({id:'return',label:'읽던 설계의 이유로 돌아가기'});return;}
    pending=false;bookmark=context;host.hidden=false;const d=context.data;
    const focus=host.contains(document.activeElement)?{action:document.activeElement.dataset.reasonAction,value:document.activeElement.dataset.value,select:document.activeElement.dataset.reasonSelect!==undefined}:null;
    host.dataset.domain=d.domain;host.dataset.target=d.target;host.dataset.power=d.status;
    host.innerHTML=`<header class="power-heading"><div><p class="eyebrow">WHY · ${esc({fire:'소방의 연결',structure:'힘의 전달',materials:'재료의 역할'}[d.domain])}</p><h2>${esc(d.title)}</h2></div>${d.options?`<label>살펴볼 대상<select data-reason-select>${d.options.map(o=>`<option value="${esc(o.id)}" ${o.id===d.target?'selected':''}>${esc(o.name)}</option>`).join('')}</select></label>`:''}</header>
      <div class="power-verdict" role="status" aria-live="polite"><strong>${esc(d.result)}</strong><p>${esc(d.reason)}</p></div>
      ${d.live?`<form class="reason-load"><label>활하중 (kN/m²)<input aria-label="이유 설명 활하중" name="live" type="number" required min="0" max="${d.live.max}" step="0.5" value="${d.live.value}"></label><button type="submit">하중 적용</button>${button({id:'restore',label:'기본 하중으로'})}<p>${esc(d.comparison)}</p></form>`:''}
      <ol class="power-chain">${d.cards.map(c=>`<li><h3>${esc(c.title)}</h3>${c.equation?`<p class="reason-equation">${esc(c.equation)}</p>`:''}<strong>${esc(c.value)}</strong><p>${esc(c.text)}</p>${c.actions?`<div class="power-links">${c.actions.map(button).join('')}</div>`:''}</li>`).join('')}</ol>
      <div class="power-links">${d.links.map(button).join('')}</div><div class="power-links"><span>모르는 말 바로 보기</span>${d.terms.map(([id,label])=>button({id:'term',value:id,label})).join('')}</div><p class="reason-note">${esc(d.note)}</p>`;
    if(focus){const item=focus.select?host.querySelector('select'):[...host.querySelectorAll('button')].find(b=>b.dataset.reasonAction===focus.action&&b.dataset.value===focus.value);item?.focus({preventScroll:true});}
  }
  async function dispatch(kind,value){
    if(busy)return;busy=true;
    try{
      const c=current??bookmark;if(!c)return;
      if(local.has(kind))await change(kind,value,c);
      else {pending=true;await navigate(kind,value,c);if(kind==='return')host.scrollIntoView({block:'start',behavior:'instant'});}
    }catch(error){onError(error);}finally{busy=false;}
  }
  host.addEventListener('click',e=>{const b=e.target.closest('[data-reason-action]');if(!b)return;e.stopPropagation();void dispatch(b.dataset.reasonAction,b.dataset.value);});
  host.addEventListener('change',e=>{if(e.target.matches('[data-reason-select]')){e.stopPropagation();void dispatch('choose',e.target.value);}});
  host.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();if(e.target.reportValidity())void dispatch('live',e.target.elements.live.valueAsNumber);});
  return {update,element:host};
}
