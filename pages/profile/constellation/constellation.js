const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset = '/pages/profile/constellation/assets/';
const kinds = {work:'작품',essay:'마음의 기록',judgment:'제작의 판단',concept:'창작 노트',paper:'논문',topic:'연구 주제',creator:'작가'};
const state = {selected:null,view:'map',scope:'autumn',query:'',ids:[],focused:false};
let graph, byId;
const mobile = matchMedia('(max-width:760px)');
const neighbors = id => graph.edges.filter(e => e.source===id || e.target===id).map(e=>({edge:e,node:byId.get(e.source===id?e.target:e.source)}));
const column = n => ['work','paper'].includes(n.kind)?0:['essay','topic','creator'].includes(n.kind)||n.id==='concept:felt-time'?1:2;
function nodeLink(n,extra='') {return `<a class="node ${n.kind}${state.selected===n.id?' selected':''} ${extra}" data-id="${esc(n.id)}" href="?node=${encodeURIComponent(n.id)}" aria-label="${esc(n.title)} · 기록 열기"${state.selected===n.id?' aria-current="true"':''}>${n.kind==='work'?`<img class="image" src="${esc(n.image)}" alt="${esc(n.alt)}" width="960" height="540">`:''}${n.kind==='paper'||n.kind==='topic'?`<span class="node-type">${kinds[n.kind]} ${esc(n.year||'')}</span>`:''}<h3>${esc(n.title)}</h3><p class="caption">${esc(n.kind==='judgment'?n.summary:n.kind==='work'?'노래 · 이미지 · 이야기':n.kind==='essay'?'미리내벌스':n.sourceLabel||kinds[n.kind])}</p>${n.kind==='concept'?`<img class="image" src="${esc(n.image)}" alt="" loading="lazy">`:''}</a>`;}
function updateURL(replace=false){
 const u=new URL(location.href); u.search='';
 if(state.selected)u.searchParams.set('node',state.selected);
 if(state.scope!=='autumn')u.searchParams.set('scope',state.scope);
 if(state.view!=='map')u.searchParams.set('view',state.view);
 if(state.query)u.searchParams.set('q',state.query);
 if(!state.selected)u.searchParams.set('reader','closed');
 history[replace?'replaceState':'pushState']({},'',u);
}
function readURL(){const p=new URLSearchParams(location.search);state.selected=byId.has(p.get('node'))?p.get('node'):graph.defaultNode;state.scope=['all','papers'].includes(p.get('scope'))?p.get('scope'):'autumn';state.view=p.get('view')==='list'?'list':'map';state.query=p.get('q')||'';state.focused=!graph.featured.includes(state.selected);if(p.get('reader')==='closed')state.selected=null;}
function select(id,{push=true,focus=false}={}){
 if(!byId.has(id))return; state.selected=id;
 if(!state.ids.includes(id))state.focused=true;
 render(); if(push)updateURL();
 if(focus && mobile.matches){$('#reader-title').focus({preventScroll:true});$('#reader').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
}
function mapIDs(){
 if(!state.focused && state.scope==='autumn')return graph.featured;
 const center=state.selected||graph.defaultNode;
 const near=neighbors(center).filter(x=>x.node.kind!=='creator').map(x=>x.node.id);
 return [...new Set([center,...near])].slice(0,9);
}
function renderMap(){
 state.ids=mapIDs();const rows=[0,0,0];
 let small;
 if(!state.focused&&state.scope==='autumn')small=['work:already-autumn','concept:image-cinema','judgment:autumn-subtitles'];
 else small=[state.selected||graph.defaultNode,...neighbors(state.selected||graph.defaultNode).filter(x=>x.node.kind!=='creator').map(x=>x.node.id)].slice(0,3);
 if(state.selected && !small.includes(state.selected))small=[small[0],state.selected,small[1]];
 $('#nodes').innerHTML=state.ids.map(id=>{const n=byId.get(id),col=column(n),row=rows[col]++;return nodeLink(n,small.includes(id)?'':'mobile-hidden').replace('data-id=',`style="grid-column:${col+1};grid-row:${row+1};--mobile-order:${small.indexOf(id)}" data-id=`);}).join('');
 $('.column-heads').hidden=state.scope!=='autumn'||state.focused;
 $('#map-note').textContent=state.focused?'이어진 기록을 따라 읽습니다.':'기록을 선택하면 이야기가 열립니다.';
 requestAnimationFrame(draw);
}
function matching(){const q=state.query.trim().toLocaleLowerCase();return graph.nodes.filter(n=>(state.scope!=='papers'||['paper','topic'].includes(n.kind))&&(!q||(n.title+' '+n.summary+' '+(n.tags||[]).join(' ')).toLocaleLowerCase().includes(q)));}
function renderList(){
 const ns=matching();$('#result-count').textContent=`${state.query?'검색 결과 · ':''}${ns.length}개 기록`;
 $('#record-list').innerHTML=ns.map(n=>`<button class="list-record ${n.image?'':'no-image'} ${state.selected===n.id?'selected':''}" data-id="${esc(n.id)}" aria-label="${esc(n.title)} · 기록 열기">${n.image?`<img src="${esc(n.image)}" alt="" loading="lazy" width="960" height="540">`:''}<span><small>${kinds[n.kind]} ${esc(n.year||'')}</small><h3>${esc(n.title)}</h3></span></button>`).join('')||'<div class="empty"><h3>아직 찾은 기록이 없습니다.</h3><p>다른 작품명이나 주제로 찾아보세요.</p></div>';
}
function renderReader(){
 const n=byId.get(state.selected);$('#reader').hidden=!n;if(!n)return;
 const sections=n.sections||[{title:n.sourceLabel||'기록',text:n.summary}];
 const related=neighbors(n.id).sort((a,b)=>(a.node.kind==='creator')-(b.node.kind==='creator'));
 $('#reader-content').innerHTML=`<p class="reader-eyebrow">${esc(n.sourceLabel||kinds[n.kind])}${n.year?' · '+esc(n.year):''}</p><h2 id="reader-title" class="reader-title" tabindex="-1">${esc(n.title)}</h2><p class="reader-summary">${esc(n.summary)}</p>${n.kind==='work'?`<figure class="reader-image"><img src="${esc(n.image)}" alt="${esc(n.alt)}" width="960" height="540"></figure>`:''}${sections.map(s=>`<section class="reader-section"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></section>`).join('')}<a class="original" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">${n.kind==='work'?'작품 감상하기':n.kind==='paper'?'논문 출처에서 읽기':'기록 원문에서 읽기'}<img src="${asset}arrow-up-right.svg" alt="새 탭"></a>${related.length?`<div class="related"><h3>이 기록에서 이어지는 이야기</h3>${related.map(({edge:e,node:r})=>`<button class="relation" data-id="${esc(r.id)}"><small>${esc(e.label)}</small><strong>${esc(r.title)}</strong></button><p class="relation-reason">${esc(e.reason)}</p>`).join('')}</div>`:''}<p class="reader-caption">${n.kind==='essay'?'미리내벌스에 공개된 글의 본문을 이어 읽습니다. 최신 원문과 이미지는 출처에서 확인할 수 있습니다.':n.kind==='topic'?'제목에 따른 탐색 분류입니다. 논문 간 인용 관계를 뜻하지 않습니다.':'공개 기록의 내용과 연결 이유를 함께 남깁니다.'}</p>`;
 $('#reader').scrollTop=0;
}
function render(){
 const list=state.view==='list'||!!state.query||state.scope==='all'||state.scope==='papers';
 $('#scope').value=state.scope;$('#search').value=state.query;
 $('#map').hidden=list;$('#record-list').hidden=!list;
 $('#map-view').setAttribute('aria-pressed',String(!list));$('#list-view').setAttribute('aria-pressed',String(list));
 $('#result-count').textContent='';
 if(list)renderList();else renderMap();renderReader();
}
function draw(){
 const canvas=$('#connections'),map=$('#map');if(map.hidden)return;
 const box=map.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.round(box.width*ratio);canvas.height=Math.round(box.height*ratio);
 const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.lineWidth=.85;
 const rects=new Map([...$('#nodes').querySelectorAll('.node')].filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();return [el.dataset.id,{x:r.x-box.x,y:r.y-box.y,w:r.width,h:r.height}]}));
 const firstRow=[...rects.values()].filter(r=>r.y<180);const under=Math.max(...firstRow.map(r=>r.y+r.h),0)+22;
 for(const e of graph.edges){const a=rects.get(e.source),b=rects.get(e.target);if(!a||!b)continue;
  const active=e.source===state.selected||e.target===state.selected;ctx.strokeStyle=active?'#d1d0c2':'#727267';ctx.fillStyle=ctx.strokeStyle;
  let points;
  if(Math.abs(a.x-b.x)<15){const down=a.y<b.y;const x=a.x+a.w*.52;const outside=a.x+a.w+12;points=[[x,down?a.y+a.h:a.y],[outside,down?a.y+a.h+12:a.y-12],[outside,down?b.y-12:b.y+b.h+12],[b.x+b.w*.52,down?b.y:b.y+b.h]];}
  else if(Math.abs(a.y-b.y)>120 && Math.abs(a.x-b.x)<a.w+80){const ax=a.x+a.w*.5,by=b.y+b.h*.5;points=[[ax,a.y+a.h],[ax,a.y+a.h+16],[b.x-16,a.y+a.h+16],[b.x-16,by],[b.x,by]];}
  else if(Math.abs(a.x-b.x)>a.w*2){const ax=a.x+a.w*.65,bx=b.x+b.w*.5;points=[[ax,a.y+a.h],[ax,under],[bx,under],[bx,b.y+b.h]];}
  else {const right=b.x>a.x,ax=right?a.x+a.w:a.x,bx=right?b.x:b.x+b.w,ay=a.y+a.h*.5,by=b.y+b.h*.5,mid=(ax+bx)/2;points=[[ax,ay],[mid,ay],[mid,by],[bx,by]];}
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  const end=points.at(-1),prev=points.at(-2),angle=Math.atan2(end[1]-prev[1],end[0]-prev[0]);ctx.beginPath();ctx.moveTo(...end);ctx.lineTo(end[0]-5*Math.cos(angle-.4),end[1]-5*Math.sin(angle-.4));ctx.lineTo(end[0]-5*Math.cos(angle+.4),end[1]-5*Math.sin(angle+.4));ctx.closePath();ctx.fill();
 }
}
function reset(){Object.assign(state,{selected:graph.defaultNode,view:'map',scope:'autumn',query:'',focused:false});render();updateURL();}
try {
 const response=await fetch('/pages/profile/constellation/graph.json');if(!response.ok)throw new Error('graph unavailable');graph=await response.json();byId=new Map(graph.nodes.map(n=>[n.id,n]));readURL();render();
 document.addEventListener('click',e=>{const el=e.target.closest('[data-id]');if(el){e.preventDefault();select(el.dataset.id,{focus:el.classList.contains('list-record')});}});
 $('#search').addEventListener('input',e=>{state.query=e.target.value;state.view='list';renderList();$('#map').hidden=true;$('#record-list').hidden=false;$('#map-view').setAttribute('aria-pressed','false');$('#list-view').setAttribute('aria-pressed','true');updateURL(true);});
 $('#scope').addEventListener('change',e=>{state.scope=e.target.value;state.query='';state.focused=false;state.view=state.scope==='autumn'?'map':'list';if(state.scope==='autumn')state.selected=graph.defaultNode;render();updateURL();});
 $('#list-view').addEventListener('click',()=>{state.view='list';render();updateURL();});
 $('#map-view').addEventListener('click',()=>{state.query='';state.view='map';if(state.scope!=='autumn'){state.scope='autumn';state.focused=true;}render();updateURL();});
 $('#reset').addEventListener('click',reset);
 $('#close-reader').addEventListener('click',()=>{const last=state.selected;state.selected=null;render();updateURL();document.querySelector(`[data-id="${CSS.escape(last)}"]`)?.focus();});
 $('#share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('#notice').textContent='현재 연결 링크를 복사했습니다.';$('#map-note').textContent='링크를 복사했습니다.';}catch{$('#notice').textContent='주소창의 링크를 복사해 공유할 수 있습니다.';$('#map-note').textContent='주소창의 링크를 복사해 주세요.'}});
 $('.menu').addEventListener('click',e=>{const open=$('#main-nav').classList.toggle('open');$('.menu').setAttribute('aria-expanded',String(open));$('.menu').setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
 $('.mobile-search').addEventListener('click',()=>{const open=$('.search').classList.toggle('open');$('.mobile-search').setAttribute('aria-expanded',String(open));$('.mobile-search').setAttribute('aria-label',open?'검색 닫기':'검색 열기');if(open)$('#search').focus();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#main-nav').classList.contains('open'))$('.menu').click();else if($('.search').classList.contains('open'))$('.mobile-search').click();else if(!$('#reader').hidden)$('#close-reader').click();}});
 addEventListener('popstate',()=>{readURL();render();});new ResizeObserver(()=>requestAnimationFrame(draw)).observe($('#map'));$('#nodes').addEventListener('load',draw,true);mobile.addEventListener('change',()=>{if(!$('#map').hidden)renderMap();});
} catch(error){$('#result-count').textContent='연결 지도를 불러오지 못했습니다. 아래 전체 기록과 연결에서 읽을 수 있습니다.';$('.reading-index').open=true;console.error(error);}
