export const samples=Object.freeze([
 {id:1,name:'경비실',path:'index.html'},
 {id:2,name:'아파트',path:'apartment.html'},
 {id:3,name:'클린룸',path:'cleanroom.html'}
]);
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function mountSamples(current,onCurrent){
 const host=document.querySelector('[data-sample-navigation]');if(!host)return;
 host.setAttribute('aria-label','교육용 샘플 선택');
 host.innerHTML='<div class="sample-links">'+samples.map(s=>'<a href="'+new URL(s.path+'#home',import.meta.url).href+'" data-sample="'+s.id+'" '+(s.id===current?'aria-current="page"':'')+'>샘플 '+s.id+' · '+s.name+'</a>').join('')+'</div><label class="sample-select"><select aria-label="교육용 샘플">'+samples.map(s=>'<option value="'+s.id+'" '+(s.id===current?'selected':'')+'>샘플 '+s.id+' · '+s.name+'</option>').join('')+'</select></label>';
 const navigate=id=>{if(id===current)return onCurrent();const sample=samples.find(s=>s.id===id);if(sample)location.assign(new URL(sample.path+'#home',import.meta.url));};
 host.onclick=e=>{const a=e.target.closest('[data-sample]');if(a&&Number(a.dataset.sample)===current){e.preventDefault();onCurrent();}};
 host.querySelector('select').onchange=e=>navigate(Number(e.target.value));
}
export function mountGlossary(host,terms,{action,detailsAction}={}){
 host.innerHTML='<div class="glossary-search"><input id="term-search" type="search" placeholder="예: 천장, 분전반, 전압강하" aria-label="용어 검색"><span id="term-count" class="small" role="status"></span></div><div id="term-list" class="glossary-grid"></div>';
 const input=host.querySelector('#term-search'),list=host.querySelector('#term-list'),count=host.querySelector('#term-count');
 const update=()=>{const q=input.value.trim().toLowerCase(),items=terms.filter(t=>[t.term,t.plain,t.definition,t.electrical].join(' ').toLowerCase().includes(q));count.textContent=items.length+'개 용어';list.innerHTML=items.length?items.map(t=>'<article class="term-card" id="term-'+escape(t.id)+'"><h2>'+escape(t.term)+'</h2><h3>'+escape(t.plain)+'</h3>'+(t.definition?'<p>'+escape(t.definition)+'</p>':'')+(t.electrical?'<div class="electrical-note">전기설계에서는: '+escape(t.electrical)+'</div>':'')+'<div class="button-row">'+(detailsAction?'<button data-'+detailsAction+'="'+escape(t.id)+'">뜻 자세히</button>':'')+((t.target||t.element)?'<button data-'+action+'="'+escape(t.id)+'">'+escape(t.locationLabel??'도면·3D에서 찾기')+'</button>':'<span class="small">'+escape(t.locationNote??'뜻 알아보기')+'</span>')+'</div></article>').join(''):'<p>검색 결과가 없습니다. 쉬운 말이나 약어로 다시 찾아보세요.</p>';};
 input.oninput=update;update();return {input,update};
}
