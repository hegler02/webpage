import {studyCategories,studySources} from './src/study-content.mjs';
import {quizScore} from './study-state.mjs';

export const escapeStudy=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const e=escapeStudy;
const button=(label,action,value='',attrs='')=>`<button type="button" data-study-${action}="${e(value)}" ${attrs}>${label}</button>`;
export function termSources(t){
 const sources=(t.sources??[]).map(key=>studySources[key]??key).filter(s=>s?.url&&s?.title);
 return sources.length?`<div class="study-sources">${sources.map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.title)} (새 창)</a>`).join('')}<span>확인: 2026년 11월 6일 · 적용 조건은 해당 자료에서 확인합니다.</span></div>`:'';
}
function target(t,options){return (t.target||t.element)&&options.action?`<button type="button" data-${options.action}="${e(t.id)}" data-study-leave="">${e(t.locationLabel??'도면·3D에서 찾기')}</button>`:`<p class="study-muted">${e(t.locationNote??'이 용어는 개념 설명입니다.')}</p>`;}
const detail=(t,options)=>`<details><summary>설명·적용 예와 근거 더 읽기</summary><div>${t.definition?`<p>${e(t.definition)}</p>`:''}${t.electrical?`<p><strong>전기설계와 연결</strong> · ${e(t.electrical)}</p>`:''}${target(t,options)}${termSources(t)}</div></details>`;
export function dictionaryView(terms,query,options){
 const items=terms.filter(t=>[t.term,t.plain,t.definition,t.electrical].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 return {count:items.length,html:items.length?items.map(t=>`<article class="term-card" id="term-${e(t.id)}"><p class="study-muted">${e(studyCategories[t.category])}</p><h2>${e(t.term)}</h2><h3>${e(t.plain)}</h3>${t.definition?`<p>${e(t.definition)}</p>`:''}${t.electrical?`<div class="electrical-note">전기설계에서는: ${e(t.electrical)}</div>`:''}<div class="button-row">${button('학습카드로 익히기','term-card',t.id)}${options.detailsAction?`<button data-${options.detailsAction}="${e(t.id)}">뜻 자세히</button>`:''}${target(t,options)}</div>${termSources(t)}</article>`).join(''):'<p>검색 결과가 없습니다. 쉬운 말이나 약어로 다시 찾아보세요.</p>'};
}
export function filtersView(state,categories=studyCategories){return `<div class="study-filters"><label>학습 분야 <select data-study-category aria-label="학습 분야"><option value="all" ${state.category==='all'?'selected':''}>전체 분야</option>${Object.entries(categories).map(([id,name])=>`<option value="${id}" ${state.category===id?'selected':''}>${name}</option>`).join('')}</select></label>${button('오늘 5장 시작','deck')}${button('헷갈린 카드 복습','difficult')}</div>`;}
export function cardView(s,terms,options){
 const t=terms.find(t=>t.id===s.deck[s.index]);
 if(!t)return `<div class="study-card"><h2>배울 카드를 골라보세요.</h2><p>분야를 고르고 ‘오늘 5장 시작’을 누르세요. 복습에는 ‘다시 보기’ 또는 ‘아직 헷갈려요’로 표시한 카드가 나옵니다.</p></div>`;
 const face=(name,content)=>`<button type="button" class="study-flip-button" data-face="${name}" data-study-flip aria-hidden="${s.flipped!==(name==='back')}" ${s.flipped!==(name==='back')?'tabindex="-1" inert':''}>${content}</button>`;
 return `<div class="study-pager"><span>${s.index+1} / ${s.deck.length} · ${e(studyCategories[t.category])}</span><span class="study-muted">카드를 누르거나 Enter로 뒤집기</span></div><div class="study-flip" data-flipped="${s.flipped}">${face('front',`<span>이 말, 설명할 수 있나요?</span><strong>${e(t.term)}</strong><span>누르면 쉬운 뜻을 확인합니다.</span>`)}${face('back',`<span>${e(t.term)}</span><strong>${e(t.plain)}</strong>${t.electrical?`<span>${e(t.electrical)}</span>`:''}<span>다시 누르면 앞면으로 돌아갑니다.</span>`)}</div><div class="study-card" data-study-reflection ${s.flipped?'':'hidden'}><p>지금 얼마나 이해했나요? 표시만으로 퀴즈 정답을 받은 것은 아닙니다.</p><div class="study-actions">${[['again','다시 보기'],['unsure','아직 헷갈려요'],['known','설명할 수 있어요']].map(([value,label])=>button(label,'rate',value,`aria-pressed="${s.ratings[t.id]===value}"`)).join('')}</div>${detail(t,options)}</div><div class="study-pager">${button('이전 카드','card-prev','',s.index===0?'disabled':'')}${s.index<s.deck.length-1?button('다음 카드','card-next'):button('마지막 OX 퀴즈','quiz-deck','','class="primary"')}</div>`;
}
const answerIcon=value=>`<svg viewBox="0 0 32 32" aria-hidden="true">${value?'<circle cx="16" cy="16" r="11"/>':'<path d="m7 7 18 18M25 7 7 25"/>'}</svg>`;
export function quizView(s,terms,questions,options){
 const map=new Map(questions.map(q=>[q.id,q])),score=quizScore(s,questions);
 if(s.result)return `<div class="study-result"><p class="study-muted">이번 OX 퀴즈 결과</p><h2>${score.total}문제 중 ${score.correct}문제를 맞혔어요.</h2><p>이 점수는 이번 개념 확인 결과입니다. 틀린 이유를 읽고 같은 개념을 다시 설명해 보세요.</p>${score.wrong.length?`<ul>${score.wrong.map(id=>`<li>${e(map.get(id).statement)} ${button('용어 다시 읽기','read',map.get(id).term)}</li>`).join('')}</ul><div class="study-actions">${button('틀린 문제만 다시 풀기','retry-wrong')}${button('틀린 개념 카드로 복습','wrong-cards')}</div>`:'<p>이번 문제를 모두 맞혔습니다. 다른 분야도 이어서 배워보세요.</p>'}<div class="study-actions">${button('이번 문제 다시 풀기','retry')}${button('학습카드로 돌아가기','mode','cards')}</div></div>`;
 const q=map.get(s.quiz[s.quizIndex]);
 if(!q)return `<div class="study-card"><h2>OX 퀴즈로 확인해 보세요.</h2><p>선택한 분야의 개념을 한 문제씩 확인합니다. 카드에 연결된 문제가 없는 경우에는 다른 분야를 고를 수 있습니다.</p>${button('이 분야 퀴즈 시작','quiz-category','','class="primary"')}</div>`;
 const a=s.answers[q.id],t=terms.find(t=>t.id===q.term),done=Boolean(a);
 return `<div class="study-card"><p class="study-muted">OX 퀴즈 · ${s.quizIndex+1} / ${s.quiz.length}</p><h2 tabindex="-1" data-study-question>${e(q.statement)}</h2><div class="study-answer">${[true,false].map(value=>button(answerIcon(value)+`<span>${value?'맞아요':'아니에요'}</span>`,'answer',String(value),`${done?'disabled':''} ${done?`aria-pressed="${a.value===value}"`:''}`)).join('')}</div>${done?`<div class="study-feedback" role="status"><strong>${a.value===q.answer?'맞혔어요.':'다시 짚어볼까요?'} 정답은 ${q.answer?'O · 맞아요':'X · 아니에요'}입니다.</strong><p>${e(q.explanation)}</p>${button(e(t.term)+' 뜻 다시 보기','read',t.id)}${target(t,options)}${termSources(t)}</div>`:'<p class="study-muted">문장이 맞는지 고르세요. 답을 고르면 이유가 나타납니다.</p>'}</div><div class="study-pager">${button('이전 문제','quiz-prev','',s.quizIndex===0?'disabled':'')}${button(s.quizIndex===s.quiz.length-1?'결과 보기':'다음 문제','quiz-next','',done?'':'disabled')}</div>`;
}
