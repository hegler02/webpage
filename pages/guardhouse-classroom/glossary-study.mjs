import {withStudyConcepts,studyCategories,questionsFor} from './src/study-content.mjs';
import {loadStudy,saveStudy,selectDeck,answerQuestion,quizScore,studyKey} from './study-state.mjs';
import {escapeStudy as e,dictionaryView,filtersView,cardView,quizView} from './study-view.mjs';

let volatileStates=new Map();
function browserStorage(){try{return localStorage;}catch{return null;}}
function ensureStyle(){if(document.querySelector('[data-study-style]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./glossary-study.css',import.meta.url);link.dataset.studyStyle='';document.head.append(link);}
export function mountStudyReturn(sample,onReturn){
 ensureStyle();const heading=document.querySelector('#page-heading');if(!heading)return;
 let bar=document.querySelector('#study-return');if(!bar){bar=document.createElement('div');bar.id='study-return';bar.className='study-return';bar.hidden=true;bar.innerHTML='<span>용어 학습의 읽던 위치가 저장되어 있습니다.</span><button type="button">학습 이어가기</button>';heading.after(bar);}
 bar.querySelector('button').onclick=()=>{bar.hidden=true;onReturn();};
 const show=mode=>{bar.hidden=!['cards','quiz'].includes(mode);bar.querySelector('button').textContent=mode==='quiz'?'OX 퀴즈 이어풀기':'학습카드 이어보기';};
 try{show(JSON.parse(browserStorage()?.getItem(studyKey(sample))??'null')?.returnMode);}catch{show(null);}
 window.addEventListener('classroom-study-return',event=>{if(event.detail.sample===sample)show(event.detail.mode);});
}
export function mountGlossary(host,inputTerms,{sample,action,detailsAction}={}){
 ensureStyle();sample??=location.pathname.includes('apartment')?2:location.pathname.includes('cleanroom')?3:1;
 const terms=withStudyConcepts(inputTerms),questions=questionsFor(terms),options={action,detailsAction},storage=browserStorage();
 const loaded=loadStudy(storage,sample,terms,questions,studyCategories);let s=loaded.state,persistent=loaded.persistent;
 if(!persistent&&volatileStates.has(sample))s=volatileStates.get(sample);
 if(s.returnMode){s.mode=s.returnMode;s.returnMode=null;s.query='';}
 const notify=mode=>window.dispatchEvent(new CustomEvent('classroom-study-return',{detail:{sample,mode}}));
 notify(null);
 const save=()=>{volatileStates.set(sample,s);persistent=saveStudy(storage,sample,s);};
 const shell=document.createElement('div');shell.className='study-shell';host.replaceChildren(shell);
 shell.innerHTML='<nav class="study-tabs" aria-label="용어 학습 방식"></nav><p class="study-muted" data-study-storage></p><div data-study-controls></div><div data-study-dictionary><div class="glossary-search"><input id="term-search" type="search" placeholder="예: 배근도, BIM, 외벽 마감" aria-label="용어 검색"><span id="term-count" role="status"></span></div><div id="term-list" class="glossary-grid"></div></div><div class="study-stage" data-study-stage></div><p role="status" data-study-status></p>';
 const $=selector=>shell.querySelector(selector),input=$('#term-search');
 const update=()=>{s.mode='dictionary';s.query=input.value;s.term=null;save();render(false);};
 input.oninput=update;
 function render(focus=false){
  const position=window.scrollY;
  $('.study-tabs').innerHTML=[['dictionary','사전 보기'],['cards','학습카드'],['quiz','OX 퀴즈']].map(([id,label])=>`<button type="button" data-study-mode="${id}" aria-pressed="${s.mode===id}" ${s.mode===id?'class="primary"':''}>${label}</button>`).join('');
  $('[data-study-storage]').textContent=persistent?'카드 표시와 퀴즈 진행은 이 브라우저에 저장됩니다.':'저장 공간을 사용할 수 없어 현재 페이지를 여는 동안만 기록됩니다.';
  $('[data-study-controls]').innerHTML=(s.mode!=='dictionary'?filtersView(s):'')+(s.mode==='dictionary'&&s.returnMode?`<div class="study-return"><span>뜻을 확인한 뒤 읽던 곳으로 돌아가세요.</span><button data-study-resume>${s.returnMode==='quiz'?'OX 퀴즈 이어풀기':'학습카드 이어보기'}</button></div>`:'');
  $('[data-study-dictionary]').hidden=s.mode!=='dictionary';
  $('[data-study-stage]').hidden=s.mode==='dictionary';
  if(s.mode==='dictionary'){input.value=s.query;const result=dictionaryView(terms,s.query,options);$('#term-list').innerHTML=result.html;$('#term-count').textContent=result.count+'개 용어';}
  else $('[data-study-stage]').innerHTML=s.mode==='cards'?cardView(s,terms,options):quizView(s,terms,questions,options);
  if(focus){const element=shell.querySelector('[data-study-question]')??shell.querySelector('.study-flip-button:not([inert])')??shell.querySelector('.study-result h2')??shell.querySelector('.study-card h2');if(element){if(!element.matches('button'))element.tabIndex=-1;element.focus({preventScroll:true});element.scrollIntoView({block:'nearest'});}}
  else window.scrollTo({top:position,behavior:'instant'});
 }
 function deck(difficult=false){s.deck=selectDeck(terms,s,{difficult});s.index=0;s.flipped=false;s.mode='cards';s.returnMode=null;}
 function quiz(ids){s.quiz=ids;s.answers={};s.quizIndex=0;s.result=false;s.mode='quiz';s.returnMode=null;}
 shell.onchange=event=>{if(!event.target.matches('[data-study-category]'))return;s.category=event.target.value;if(s.mode==='cards')deck();else quiz(questions.filter(q=>s.category==='all'||q.category===s.category).map(q=>q.id));save();render();};
 shell.onclick=event=>{
  const b=event.target.closest('button');if(!b||!shell.contains(b)||b.disabled)return;
  if(b.hasAttribute('data-study-leave')){const from=s.returnMode??(['cards','quiz'].includes(s.mode)?s.mode:null);if(from){s.returnMode=from;save();notify(from);}return;}
  const d=b.dataset;let focus=false,status='';
  if('studyMode'in d){s.mode=d.studyMode;s.returnMode=null;if(s.mode==='cards'&&!s.deck.length)deck();}
  else if('studyDeck'in d)deck();
  else if('studyDifficult'in d)deck(true);
  else if('studyTermCard'in d){s.mode='cards';s.deck=[d.studyTermCard];s.category=terms.find(t=>t.id===d.studyTermCard).category;s.index=0;s.flipped=false;s.returnMode=null;focus=true;}
  else if('studyFlip'in d){
   s.flipped=!s.flipped;save();
   const card=$('.study-flip');card.dataset.flipped=String(s.flipped);
   for(const face of card.querySelectorAll('[data-face]')){
    const active=s.flipped===(face.dataset.face==='back');
    face.inert=!active;face.setAttribute('aria-hidden',String(!active));face.tabIndex=active?0:-1;
   }
   $('[data-study-reflection]').hidden=!s.flipped;
   card.querySelector('[aria-hidden=false]').focus({preventScroll:true});
   $('[data-study-status]').textContent='';
   return;
  }
  else if('studyRate'in d){s.ratings[s.deck[s.index]]=d.studyRate;status='학습 표시를 저장했습니다. 다음 카드로 직접 넘어가세요.';}
  else if('studyCardPrev'in d||'studyCardNext'in d){s.index+=('studyCardNext'in d?1:-1);s.flipped=false;focus=true;}
  else if('studyQuizDeck'in d){quiz(questions.filter(q=>s.deck.includes(q.term)).map(q=>q.id));focus=true;}
  else if('studyQuizCategory'in d){quiz(questions.filter(q=>s.category==='all'||q.category===s.category).map(q=>q.id));if(!s.quiz.length)status='이 분야에는 아직 OX 문제가 없습니다. 다른 분야를 골라주세요.';focus=true;}
  else if('studyAnswer'in d){const q=questions.find(q=>q.id===s.quiz[s.quizIndex]);if(!q||!answerQuestion(s,q,d.studyAnswer==='true'))return;}
  else if('studyQuizPrev'in d){s.quizIndex--;focus=true;}
  else if('studyQuizNext'in d){if(s.quizIndex===s.quiz.length-1){const missing=s.quiz.findIndex(id=>!s.answers[id]);if(missing<0)s.result=true;else s.quizIndex=missing;}else s.quizIndex++;focus=true;}
  else if('studyRead'in d){s.returnMode=s.mode;s.mode='dictionary';s.query=terms.find(t=>t.id===d.studyRead)?.term??'';s.term=d.studyRead;}
  else if('studyResume'in d){s.mode=s.returnMode??'cards';s.returnMode=null;focus=true;}
  else if('studyRetryWrong'in d)quiz(quizScore(s,questions).wrong);
  else if('studyRetry'in d)quiz([...s.quiz]);
  else if('studyWrongCards'in d){s.deck=[...new Set(quizScore(s,questions).wrong.map(id=>questions.find(q=>q.id===id).term))];s.category='all';s.index=0;s.flipped=false;s.mode='cards';s.returnMode=null;}
  else return;
  save();render(focus);$('[data-study-status]').textContent=status;
 };
 save();render();return {input,update};
}
