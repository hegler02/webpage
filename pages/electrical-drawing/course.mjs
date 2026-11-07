// One frame for every screen: the course map on the left, the reading column beside it, a side panel on the right.
const STAGES=[
 {title:'프로젝트 시작',lessons:[1,2,3,4,5]},
 {title:'회로 그리기',lessons:[6,7,8]},
 {title:'식별과 번호',lessons:[9,10,11]},
 {title:'단자·커넥터·케이블',lessons:[12,13,14]},
 {title:'PLC와 패널',lessons:[15,16,17]},
 {title:'설비에서 도면 읽기',lessons:[18,19,20,21,22,23]},
 {title:'부록',lessons:[24,25]},
];
const TABS=[{id:'learn',label:'이해'},{id:'demo',label:'공식 자료'},{id:'practice',label:'실습'},{id:'check',label:'확인'},{id:'field',label:'설비'}];
const CONVEYOR='https://mirinaeman.com/pages/guardhouse-classroom/conveyor/';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const mark=l=>l.n>23?'부록':`${l.n}강`;
const narrow=()=>matchMedia('(max-width:1099px)').matches;

const {lessons,terms}=await fetch('data/course.json').then(r=>r.json());
const byN=new Map(lessons.map(l=>[l.n,l]));
const tabsOf=l=>TABS.filter(t=>l.tabs[t.id]?.length);
let termQuery='',termGroup='',moved=false;
const LAST='electrical-course-last';
const remember=hash=>{try{localStorage.setItem(LAST,hash);}catch{}};
const recall=()=>{try{return localStorage.getItem(LAST);}catch{return null;}};

function route(){
 const [head,tab,step]=location.hash.slice(1).split('/');
 if(head==='start')return {page:'start'};
 if(head==='terms')return {page:'terms',term:tab};
 const n=Number(/^w(\d+)$/.exec(head||'')?.[1]);
 if(!byN.has(n))return {page:'home'};
 const l=byN.get(n),open=tabsOf(l),current=open.find(t=>t.id===tab)??open[0],list=l.tabs[current.id];
 return {l,tab:current,tabs:open,list,step:Math.min(Math.max(0,Number(step)||0),list.length-1)};
}
const hrefFor=(n,tab,step=0)=>`#w${n}/${tab}/${step}`;

// Every screen is this one frame, so nothing moves when you go from one to another.
const frameHtml=({eyebrow,title,tabs='',body,pager='',side='',sideKind='note',label='본문'})=>`<div class="bench" data-side="${sideKind}">
 <div class="copy">
  <header class="lesson-head"><span>${esc(eyebrow)}</span><h1>${esc(title)}</h1></header>
  <nav class="tabs" aria-label="${esc(label)} 구분">${tabs}</nav>
  <article class="frame" tabindex="-1">${body}</article>
  ${pager}
 </div>
 <aside class="side ${sideKind==='figure'?'figures':''}">${side}</aside>
</div>`;
const pagerHtml=(prev,next,nextLabel,select='')=>`<footer class="pager">${prev?`<a class="button" href="${prev}">이전</a>`:'<span class="button is-off">이전</span>'}${next?`<a class="button primary" href="${next}">${esc(nextLabel)}</a>`:'<span class="button is-off">끝</span>'}${select}</footer>`;

function renderRail(r){
 const refs=[['#start','먼저 읽기',r.page==='start'],['#terms','용어집',r.page==='terms']];
 $('rail').innerHTML=`<section class="rail-refs"><ol>${refs.map(([h,t,on])=>`<li><a href="${h}" ${on?'aria-current="page"':''}>${t}</a></li>`).join('')}<li><a href="${CONVEYOR}" target="_blank" rel="noopener">컨베이어 3D ↗</a></li></ol></section>`+STAGES.map(s=>`<section><h2>${esc(s.title)}</h2><ol>${s.lessons.map(n=>`<li><a href="#w${n}" ${r.l?.n===n?'aria-current="page"':''}><b>${n>23?'+':pad(n)}</b><span>${esc(byN.get(n).title)}</span></a></li>`).join('')}</ol></section>`).join('');
 $('rail').querySelector('[aria-current]')?.scrollIntoView({block:'nearest'});
}
function renderSelect(r){
 $('lesson-select').innerHTML='<option value="home">처음 화면</option><option value="start">먼저 읽기</option>'+lessons.map(l=>`<option value="${l.n}" ${r.l?.n===l.n?'selected':''}>${esc(mark(l))} ${esc(l.title)}</option>`).join('')+'<option value="terms">용어집</option>';
 if(r.page)$('lesson-select').value=r.page;
}
function continueLink(){
 const last=recall(),n=Number(/^#w(\d+)/.exec(last||'')?.[1]);
 if(!byN.has(n))return '<a class="button primary" href="#start">먼저 읽기부터 시작</a>';
 return `<a class="button primary" href="${esc(last)}">이어서 보기 · ${esc(mark(byN.get(n)))} ${esc(byN.get(n).title)}</a><a class="button" href="#start">먼저 읽기</a>`;
}
function renderHome(){
 document.title='전기도면 종합설계';
 $('stage').innerHTML=frameHtml({eyebrow:'AutoCAD Electrical 2027',title:'전기도면 종합설계',label:'처음 화면',
  body:`<h2>회로를 그리고, 도면에 담긴 정보를 읽습니다.</h2><div class="body"><p>프로젝트부터 PLC·패널까지 직접 그리고, 실제 컨베이어 도면을 읽습니다.</p><div class="links">${continueLink()}</div>
  <div class="only-narrow">${STAGES.map(s=>`<section><h3>${esc(s.title)}</h3><ol class="plain-list">${s.lessons.map(n=>`<li><a href="#w${n}"><b>${n>23?'+':pad(n)}</b><span>${esc(byN.get(n).title)}</span></a></li>`).join('')}</ol></section>`).join('')}</div></div>`,
  side:'<div class="paper-card"><img src="assets/field/assets/sheet-02.svg" alt="컨베이어 전력 회로 도면"></div>'});
}
const SHEETS=[['01','01','전체 배치'],['02–03','02–03','전력 회로'],['04–08','04–08','보조 회로'],['09–16','09–16','PLC 입력'],['17–18','17–18','PLC 출력'],['19','23','3상 전력 회로'],['20','23','단선도'],['21','19','3번 작업자 조작반'],['22','20','주 제어반'],['23','21','1번 작업자 조작반']];
const sheetTable=`<table class="fit"><thead><tr><th>파일</th><th>시트</th><th>내용</th></tr></thead><tbody>${SHEETS.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function renderStart(){
 document.title='먼저 읽기 · 전기도면 종합설계';
 $('stage').innerHTML=frameHtml({eyebrow:'시작',title:'먼저 읽기',label:'먼저 읽기',pager:pagerHtml('#home','#w1','1강으로'),
  body:`<h2>실습 파일을 받고, 도면 읽는 약속 다섯 가지를 확인합니다.</h2><div class="body read">
  <section><h3>1. 실습 파일 받기</h3><p>AutoCAD Electrical 2027용으로 라이브러리 경로를 맞춘 프로젝트입니다. 절판 교재와 유튜브에 공개된 도면을 제작자가 수정해 사용했습니다.</p>
  <div class="links"><a class="button" href="assets/lab/project2027/IEC-Training-2027.zip" download>IEC-Training 2027 ZIP ↓</a><a class="button" href="assets/lab/project2027/IEC-Training-2027-IEC60617.zip" download>IEC-60617 설치 PC용 ZIP ↓</a></div>
  <ol><li>ZIP을 개인 폴더에 모두 풉니다.</li><li>프로젝트를 닫은 상태에서 <code>START-HERE.cmd</code>를 두 번 눌러 실행합니다.</li><li>프로젝트 관리자에서 <code>IEC-Training-2027.wdp</code>를 열고 활성화합니다.</li><li>도면 01~20이 열리는지 확인합니다. 패널 21~23과 템플릿은 별도 폴더에 있습니다.</li></ol></section>
  <section><h3>2. 파일 번호와 시트 번호</h3><p>이 강의에서 "21번"은 파일 번호입니다. 19번부터는 도면 안의 시트 값과 다릅니다.</p><div class="only-narrow">${sheetTable}</div></section>
  <section><h3>3. 태그 읽기</h3><p><code>-07K1</code>은 시트 07의 K 계열 1번입니다. 형식은 <code>-%S%F%N</code>입니다.</p>
  <p><b>K</b> 릴레이·접촉기 · <b>S</b> 스위치·버튼 · <b>H</b> 표시등 · <b>Q</b> 차단기·개폐기 · <b>F</b> 퓨즈 · <b>M</b> 모터 · <b>T</b> 변압기 · <b>X</b> 단자대 · <b>B</b> 센서</p></section>
  <section><h3>4. 와이어 번호와 위치</h3><p>와이어 번호 형식은 <code>%S.%N</code>입니다. 05.4는 시트 05의 4번째 번호입니다.</p><p>위치 값은 <code>=MCAB5</code>(주 제어반), <code>=OPSTA3</code>(조작반 3번)처럼 = 로 시작합니다.</p></section>
  <section><h3>5. PLC 주소</h3><p>기준 도면은 8진법을 씁니다. I:001/07 다음이 I:001/10입니다.</p></section>
  <section><h3>설비는 3D로</h3><p>움직이는 설비는 공간과 전기의 컨베이어에서 직접 조작합니다.</p><div class="links"><a class="button" href="${CONVEYOR}#home" target="_blank" rel="noopener">컨베이어 3D 열기 ↗</a></div></section></div>`,
  side:`<section class="side-note"><h2>파일과 시트 대응표</h2>${sheetTable}</section>`});
}
function termDetail(t){
 return `<a class="side-back only-narrow" href="#terms">← 용어 목록</a><section class="side-note term-detail"><span class="side-eyebrow">${esc(t.group)}</span><h2>${esc(t.term)}</h2>${t.aliases?`<p class="aliases">${esc(t.aliases)}</p>`:''}<dl>${t.items.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${b}</dd>`).join('')}</dl>${t.figures.map(f=>`<figure><a href="${esc(f.src)}" target="_blank" rel="noopener"><img src="${esc(f.src)}" alt="${esc(f.alt)}"></a>${f.caption?`<figcaption>${esc(f.caption)}</figcaption>`:''}</figure>`).join('')}</section>`;
}
function renderTerms(r){
 document.title='용어집 · 전기도면 종합설계';
 const scroll=document.querySelector('.frame')?.scrollTop??0,keepScroll=document.querySelector('.term-list')!==null;
 const groups=[...new Set(terms.map(t=>t.group))];
 const q=termQuery.trim().toLowerCase();
 const shown=terms.filter(t=>(!termGroup||t.group===termGroup)&&(!q||(t.term+' '+t.aliases).toLowerCase().includes(q)));
 const had=document.activeElement?.id==='term-search';
 const picked=terms.find(t=>t.id===r.term)??(narrow()?null:shown[0]);
 const listed=groups.filter(g=>shown.some(t=>t.group===g));
 $('stage').innerHTML=frameHtml({eyebrow:'참고',title:'용어집',label:'용어 분류',sideKind:r.term&&picked?'detail':'note',
  tabs:[['','전체'],...groups.map(g=>[g,g])].map(([g,t])=>`<button type="button" data-group="${esc(g)}" aria-pressed="${termGroup===g}">${esc(t)}</button>`).join(''),
  body:`<div class="body"><input id="term-search" type="search" placeholder="용어 검색" aria-label="용어 검색" value="${esc(termQuery)}"><p class="count">${shown.length}개</p>
  <div class="term-list">${listed.map(g=>`<section><h3>${esc(g)}</h3><ol class="plain-list">${shown.filter(t=>t.group===g).map(t=>`<li><a class="term-row" href="#terms/${esc(t.id)}" ${picked?.id===t.id?'aria-current="true"':''}>${esc(t.term)}</a></li>`).join('')}</ol></section>`).join('')}</div></div>`,
  side:picked?termDetail(picked):''});
 if(keepScroll)document.querySelector('.frame').scrollTop=scroll;
 const input=$('term-search');input.addEventListener('input',e=>{termQuery=e.target.value;renderTerms(route());});
 if(had){input.focus();input.setSelectionRange(termQuery.length,termQuery.length);}
 document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{termGroup=b.dataset.group;if(route().term)location.hash='#terms';else renderTerms(route());}));
 document.querySelectorAll('.term-detail figure a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openViewer(a);}));
}
function outlineHtml(r){
 const {l,tabs,tab,step}=r;
 return `<section class="side-note outline"><h2>이 강의 순서</h2>${tabs.map(x=>`<h3>${esc(x.label)}</h3><ol class="plain-list">${l.tabs[x.id].map((f,i)=>`<li><a href="${hrefFor(l.n,x.id,i)}" ${x===tab&&i===step?'aria-current="step"':''}>${esc(f.title)}</a></li>`).join('')}</ol>`).join('')}</section>`;
}
function renderLesson(r){
 const {l,tab,tabs,list,step}=r,frame=list[step],t=tabs.indexOf(tab);
 document.title=`${mark(l)} ${l.title} · 전기도면 종합설계`;
 const prevTab=tabs[t-1],nextTab=tabs[t+1],nextLesson=byN.get(l.n+1),prevLesson=byN.get(l.n-1);
 const prev=step>0?hrefFor(l.n,tab.id,step-1):prevTab?hrefFor(l.n,prevTab.id,l.tabs[prevTab.id].length-1):prevLesson?`#w${prevLesson.n}`:'#start';
 const next=step<list.length-1?hrefFor(l.n,tab.id,step+1):nextTab?hrefFor(l.n,nextTab.id):nextLesson?`#w${nextLesson.n}`:null;
 const nextLabel=step<list.length-1?'다음':nextTab?`${nextTab.label}로`:nextLesson?`${mark(nextLesson)}으로`:'';
 const figures=frame.figures??[];
 const quiz=frame.quiz?`<div class="quiz">${frame.quiz.choices.map((c,i)=>`<button type="button" data-choice="${i}">${esc(c)}</button>`).join('')}<p class="quiz-result" role="status" hidden></p></div>`:'';
 const select=list.length>1?`<label><span class="sr">이 단계 목록</span><select id="step-select">${list.map((f,i)=>`<option value="${i}" ${i===step?'selected':''}>${i+1}/${list.length} ${esc(f.title)}</option>`).join('')}</select></label>`:`<span class="count">1 / 1</span>`;
 $('stage').innerHTML=frameHtml({eyebrow:mark(l),title:l.title,label:'이 강의 단계',sideKind:figures.length?'figure':'note',
  tabs:tabs.map(x=>`<a href="${hrefFor(l.n,x.id)}" ${x===tab?'aria-current="step"':''}>${esc(x.label)}${l.tabs[x.id].length>1?`<small>${l.tabs[x.id].length}</small>`:''}</a>`).join(''),
  body:`<p class="phase">${esc(frame.phase)}</p><h2>${esc(frame.title)}</h2><div class="body">${frame.html}${quiz}</div>`,
  pager:pagerHtml(prev,next,nextLabel,select),
  side:figures.length?figures.map(f=>`<figure><a href="${esc(f.src)}" target="_blank" rel="noopener"><img src="${esc(f.src)}" alt="${esc(f.alt)}"></a>${f.caption||f.note?`<figcaption>${f.caption?`<b>${esc(f.caption)}</b>`:''}${f.note?`<span>${esc(f.note)}</span>`:''}</figcaption>`:''}</figure>`).join(''):outlineHtml(r)});
 remember(hrefFor(l.n,tab.id,step));
 $('step-select')?.addEventListener('change',e=>{location.hash=hrefFor(l.n,tab.id,Number(e.target.value));});
 document.querySelectorAll('.figures a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openViewer(a);}));
 if(moved)document.querySelector('.frame')?.focus({preventScroll:true});
 if(frame.quiz)document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
  const right=Number(b.dataset.choice)===frame.quiz.answer,res=document.querySelector('.quiz-result');
  document.querySelectorAll('[data-choice]').forEach(x=>x.removeAttribute('data-result'));b.dataset.result=right?'right':'wrong';
  res.hidden=false;res.innerHTML=right?`맞습니다. ${frame.quiz.why}`:'다시 생각해 보세요. 도면에서 근거를 찾아보면 도움이 됩니다.';
 }));
 wireLabs();
}
// A screen capture has to be readable, so a figure opens over the page and can go to its real size.
function openViewer(link){
 const img=link.querySelector('img');
 $('viewer-img').src=img.src;$('viewer-img').alt=img.alt;
 $('viewer-title').textContent=link.closest('figure')?.querySelector('figcaption b')?.textContent||img.alt||'';
 $('viewer-stage').removeAttribute('data-zoom');
 $('viewer').showModal();
}
$('viewer-close').addEventListener('click',()=>$('viewer').close());
$('viewer-img').addEventListener('click',()=>$('viewer-stage').toggleAttribute('data-zoom'));
$('viewer').addEventListener('click',e=>{if(e.target===$('viewer'))$('viewer').close();});
// Small practice tools inside lessons. Each one sits in a frame's markup and is wired when that frame opens.
const CATALOG=[
 ['CR','AB','700S-P310DA1','','TYPE P 120VAC 3NO 1NC'],
 ['CR','EDU','EDU-CR-02','','TYPE P 24VDC 3NO 1NC'],
 ['PB','EDU','EDU-PB-01','A1','RED ILLUMINATED PUSHBUTTON'],
 ['PB','EDU','EDU-PB-02','A2','RED ROUND ILLUMINATED PUSHBUTTON'],
 ['PB','EDU','EDU-PB-03','A3','GREEN PUSHBUTTON'],
 ['LT','EDU','EDU-LT-01','B1','RED ILLUMINATED LAMP'],
 ['LT','EDU','EDU-LT-02','B2','GREEN LAMP'],
];
const catalogMatch=(text,q)=>q.toUpperCase().trim().split(/\s+OR\s+/).some(part=>(part.match(/"[^"]*"|\S+/g)||[]).every(token=>text.includes(token.replace(/^"|"$/g,''))));
function wireLabs(){
 const job=$('job');
 if(job){
  job.addEventListener('input',()=>{$('title-status').textContent='새 작업번호를 두 도면에 반영하려면 갱신을 누르세요.';});
  $('title-update').addEventListener('click',()=>{
   document.querySelectorAll('[data-job-output]').forEach(cell=>{cell.textContent=job.value.trim()||'비어 있음';});
   $('title-status').textContent='01·02번 표제란을 갱신했습니다.';
  });
 }
 if($('pin')){
  $('pin').addEventListener('input',()=>{$('endpoint').textContent='';});
  $('trace').addEventListener('click',()=>{const n=Number($('pin').value);$('endpoint').textContent=n<=5?`상단 ${n} → 왼쪽 ${n}`:`상단 ${n} → 오른쪽 ${n-3}`;});
 }
 if($('results')){
  const search=()=>{
   const global=$('mode').value==='global',show=$('description').checked;
   $('family').disabled=global;
   const rows=CATALOG.filter(r=>(global||r[0]===$('family').value)&&catalogMatch(r.slice(1,global||!show?4:5).join(' '),$('query').value));
   const coil=rows.some(r=>r[0]==='CR');
   $('results').innerHTML=`<p>검색 결과 ${rows.length}건</p>`+(rows.length?`<div class="scroll"><table><thead><tr>${['범주','제조업체','품번','조립품 코드',...(show?['설명']:[]),...(coil?['연습 코일']:[])].map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.slice(0,show?5:4).map(c=>`<td>${esc(c)}</td>`).join('')}${coil?`<td>${r[0]==='CR'?`<button type="button" data-assign="${esc(r[2])}" data-maker="${esc(r[1])}">K1에 지정</button>`:''}</td>`:''}</tr>`).join('')}</tbody></table></div>`:'');
   $('results').querySelectorAll('[data-assign]').forEach(b=>b.addEventListener('click',()=>{$('assigned').textContent=`K1 · 제조업체 ${b.dataset.maker} · 카탈로그 ${b.dataset.assign}`;}));
  };
  ['mode','family','query','description'].forEach(id=>$(id).addEventListener('input',search));
  search();
 }
 if($('trms-result')){
  const search=()=>{
   const global=$('trms-mode').value==='global',type=$('trms-type'),rating=$('trms-rating');
   type.disabled=rating.disabled=global;
   const fields=['SIEMENS','8WA1 011-3JF16',...(!global&&type.checked?['MULTI-LEVEL']:[]),...(!global&&rating.checked?['20AMPS']:[])];
   const q=$('trms-query').value.trim().toUpperCase();
   const ok=q.split(/\s+OR\s+/).some(group=>(group.match(/"[^"]*"|\S+/g)||[]).every(t=>fields.some(f=>f.includes(t.replace(/^"|"$/g,'')))));
   $('trms-result').innerHTML=`<p>${ok?'검색 결과 1건 · SIEMENS · 8WA1 011-3JF16':'검색 결과 0건 · 검색 위치, 조건, 표시 열을 확인하세요.'}</p>${ok?'<button type="button" id="trms-apply">단자에 지정하고 특성 확인</button>':''}`;
   $('trms-apply')?.addEventListener('click',e=>{$('trms-result').querySelector('p').textContent='특성/연관 · SIEMENS · 8WA1 011-3JF16 · 레벨 3 (교안 예제)';e.target.disabled=true;});
  };
  ['trms-mode','trms-query','trms-type','trms-rating'].forEach(id=>$(id).addEventListener('input',search));
  search();
 }
}
function render(){
 const r=route();renderRail(r);renderSelect(r);
 if(r.page==='home')renderHome();else if(r.page==='start')renderStart();else if(r.page==='terms')renderTerms(r);else renderLesson(r);
}
$('lesson-select').addEventListener('change',e=>{const v=e.target.value;location.hash=/^\d+$/.test(v)?`#w${v}`:`#${v}`;});
addEventListener('hashchange',()=>{moved=true;render();moved=false;});
addEventListener('keydown',e=>{
 if($('viewer').open||e.target.closest?.('input,select,textarea,summary,button,a'))return;
 if(e.key==='ArrowRight')document.querySelector('.pager .primary')?.click();
 if(e.key==='ArrowLeft')document.querySelector('.pager a:not(.primary)')?.click();
});
render();
// Fetch the rest of the typeface while idle, so moving to another screen never waits for letters.
if(!navigator.connection?.saveData)setTimeout(()=>{document.fonts.forEach(f=>{f.load().catch(()=>{});});},1500);
