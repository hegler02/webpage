export function initLesson(){
 const deck=document.querySelector('.deck'),slides=[...deck.querySelectorAll('.slide')],tabs=[...deck.querySelectorAll('[data-go]')];
 const frame=deck.querySelector('[data-media-src]'),counter=deck.querySelector('[data-counter]'),bars=[...deck.querySelectorAll('.progress span')];
 const prev=deck.querySelector('[data-prev]'),next=deck.querySelector('[data-next]'),caseId=counter.textContent.split(' ')[0];
 const aliases={analysis:'view-analysis',video:'view-video',notes:'view-notes',prompt:'view-prompt'};
 let current=-1;
 function stopMedia(){if(!frame)return;if(frame.tagName==='VIDEO')frame.pause();else frame.removeAttribute('src');}
 function loadMedia(){if(frame&&!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.mediaSrc);}
 function go(index,focus=false){
  index=Math.max(0,Math.min(slides.length-1,index));
  if(index===current)return;
  const leaving=slides[current];
  if(leaving&&leaving.dataset.kind==='video')stopMedia();
  current=index;
  slides.forEach((slide,i)=>{slide.classList.toggle('on',i===index);slide.toggleAttribute('inert',i!==index&&getComputedStyle(deck).position==='absolute');});
  deck.dataset.kind=slides[index].dataset.kind;
  tabs.forEach((tab,i)=>{if(i===index)tab.setAttribute('aria-current','step');else tab.removeAttribute('aria-current');});
  counter.textContent=`${caseId} · ${index+1} / ${slides.length}`;
  bars.forEach((bar,i)=>bar.classList.toggle('done',i<=index));
  prev.disabled=index===0;next.disabled=index===slides.length-1;
  if(slides[index].dataset.kind==='video')loadMedia();
  try{history.replaceState(null,'','#'+(index+1));}catch{}
  if(focus)tabs[index].focus();
 }
 function fromHash(){
  const hash=location.hash.slice(1),byId=slides.findIndex(s=>s.id===aliases[hash]);
  go(byId>=0?byId:(Number(hash)||1)-1);
 }
 tabs.forEach(tab=>tab.addEventListener('click',()=>go(Number(tab.dataset.go))));
 prev.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
 addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  if(['ArrowRight','PageDown'].includes(event.key)||(event.key===' '&&!event.target.closest('button,a')))go(current+1);
  else if(['ArrowLeft','PageUp'].includes(event.key))go(current-1);
  else if(event.key==='Home')go(0);else if(event.key==='End')go(slides.length-1);
  else return;
  event.preventDefault();
 });
 const sheet=deck.querySelector('.s-prompt');
 if(sheet){
  const sets=[...sheet.querySelectorAll('[data-chain-set]')],setButtons=[...sheet.querySelectorAll('[data-set]')];
  const toggle=sheet.querySelector('[data-lang-toggle]')||document.createElement('button'),copies=[...sheet.querySelectorAll('[data-copy]')];
  let english=false;
  const showLists=()=>{sets.forEach(set=>{const hasEnglish=Boolean(set.querySelector('[data-chain="en"]'));set.querySelectorAll('[data-chain]').forEach(list=>{list.hidden=list.dataset.chain!==(english&&hasEnglish?'en':'ko');});});const current=sets.find(set=>!set.hidden);toggle.disabled=!current.querySelector('[data-chain="en"]');toggle.textContent=english&&!toggle.disabled?'한국어':'EN';};
  setButtons.forEach(button=>button.addEventListener('click',()=>{setButtons.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));sets.forEach(set=>{set.hidden=set.dataset.chainSet!==button.dataset.set;});showLists();}));
  toggle.addEventListener('click',()=>{english=!english;showLists();});
  const lines=(pair,part)=>part==='prompt'?[...pair.querySelectorAll('.chain .yes')].map(item=>item.textContent):[...pair.querySelectorAll('.neg li')].map(item=>item.textContent.trim());
  copies.forEach(copy=>{
   const label=copy.textContent;
   copy.addEventListener('click',async()=>{
    const pair=sheet.querySelector('[data-chain-set]:not([hidden]) [data-chain]:not([hidden])'),title=pair.querySelector('.neg-title').textContent;
    const parts={prompt:lines(pair,'prompt').join('\n'),neg:lines(pair,'neg').join('\n')};
    const text=copy.dataset.copy==='both'?parts.prompt+'\n\n'+title+'\n'+parts.neg:parts[copy.dataset.copy];
    try{await navigator.clipboard.writeText(text);copy.textContent='복사됨';}catch{copy.textContent='복사 실패';}
    setTimeout(()=>{copy.textContent=label;},1600);
   });
  });
 }
 const reload=deck.querySelector('[data-reload-video]');
 reload?.addEventListener('click',()=>{if(frame){stopMedia();loadMedia();deck.querySelector('.status').textContent='플레이어를 다시 불러왔습니다. 재생 버튼을 눌러 확인하세요.';}});
 addEventListener('pagehide',stopMedia);addEventListener('hashchange',fromHash);
 fromHash();
}
