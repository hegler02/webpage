import {calculationGlossary,calculationTargets,lessonSources,electricalLesson,structuralLesson,trialLesson,memberLesson} from './src/calculation-lessons.mjs';
export {calculationGlossary,calculationTargets,electricalLesson,structuralLesson,trialLesson,memberLesson};
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const math=v=>esc(v).replace(/([A-Za-zℓγ])_([A-Za-z]+(?:,[a-z]+)?)/g,'$1<sub>$2</sub>');
const termNames=Object.fromEntries(calculationGlossary.map(t=>[t.id,t.term]));
Object.assign(termNames,{load:'전기 부하',conduit:'전선관',ground:'보호접지 PE',drop:'전압강하',breaker:'차단기',cover:'피복 두께',spacing:'철근 지름과 간격',parapet:'파라펫',foundation:'기초'});
export function formulaHTML(step,{staticBook=false,prefix=''}={}){
 const source=lessonSources[step.source];
 return `<article class="calc-formula" id="formula-${prefix}${step.id}" data-formula="${step.id}">
 <h3>${esc(step.title)}</h3><p class="calc-why">${esc(step.why)}</p>
 <div class="calc-equation" aria-label="공식">${math(step.equation)}</div>
 <div class="calc-substitution"><strong>현재 값 대입</strong><p>${esc(step.value)}</p></div>
 <div class="calc-explain-grid"><section><h4>기호와 단위</h4><dl class="calc-symbols">${step.symbols.map(s=>`<div><dt>${math(s.symbol)}</dt><dd>${esc(s.meaning)}<span>${esc(s.unit)}</span></dd></div>`).join('')}</dl></section>
 <section><h4>어떤 원리인가요?</h4><p>${esc(step.theory)}</p><h4>단위를 따라가 보세요</h4><p>${esc(step.unitNote)}</p><p class="calc-source"><a href="${source[1]}" target="_blank" rel="noopener">${source[0]}</a></p><p class="small">원리 참고 자료입니다. 화면의 수치와 단순화 조건은 이 샘플의 수업 모형입니다.</p></section></div>
 <div class="calc-terms ${staticBook?'book-enhanced-only':''}" ${staticBook?'hidden':''}><span>모르는 말 바로 보기</span>${step.terms.map(id=>`<button class="term-link" ${staticBook?'data-reader-term':'data-term'}="${id}">${esc(termNames[id]??id)}</button>`).join('')}</div></article>`;
}
export function lessonHTML(lesson,state,{staticBook=false}={}){
 const index=Math.max(0,lesson.steps.findIndex(s=>s.id===state.step)),step=lesson.steps[index];
 const target=lesson.target;
 return `<section class="calc-lesson" data-lesson="${lesson.id}" data-kind="${lesson.kind}" data-sheet="${target.sheet}" data-drawing="${target.drawing}" data-element="${target.element}" data-circuit="${lesson.circuit??''}">
 <article class="card calc-target"><p class="eyebrow">${lesson.kind==='electrical'?'전기 회로':'구조 부재'} · 계산할 대상</p><h2>${esc(lesson.title)}</h2><p>${esc(lesson.where)}</p>
 ${staticBook?`<p>연결 도면: ${target.sheet}, ${target.drawing} · 대상: ${target.element}</p>`:`<div class="button-row"><button data-calc-target="model">${lesson.kind==='electrical'?'기구·배선':'부재·철근'} 2D·3D 보기</button><button data-calc-target="drawing">${lesson.kind==='electrical'?'분전반 회로도':'건축도면'} 보기</button></div>`}
 <details class="calc-conditions" ${staticBook?'open':''}><summary>이 계산의 조건과 범위</summary><p>${esc(lesson.conditions)}</p></details>
 <p class="calc-outcome ${lesson.pass===false?'needs-work':''}">${esc(lesson.result)}</p>
 ${lesson.loads?`<details ${staticBook?'open':''}><summary>합산한 기구 ${lesson.loads.length}개 확인${staticBook?'':'·수정'}</summary><div class="calc-loads">${lesson.loads.map(d=>staticBook?`<p>${esc(d.name)} ${d.watts} W</p>`:`<button data-calc-device="${d.id}">${esc(d.name)} · ${d.watts} W</button>`).join('')}</div></details>`:''}</article>
 ${staticBook?lesson.steps.map(s=>formulaHTML(s,{staticBook:true,prefix:lesson.id+'-'})).join(''):`<div class="calc-reading"><label for="calc-step">계산 순서 <span>${index+1} / ${lesson.steps.length}</span></label><select id="calc-step">${lesson.steps.map((s,i)=>`<option value="${s.id}" ${i===index?'selected':''}>${i+1}. ${esc(s.title)}</option>`).join('')}</select></div>
 ${formulaHTML(step)}<div class="calc-pager"><button data-calc-index="${index-1}" ${index===0?'disabled':''}>이전 공식</button><span>${index+1} / ${lesson.steps.length}</span><button data-calc-index="${index+1}" ${index===lesson.steps.length-1?'disabled':''}>다음 공식</button></div>`}
 </section>`;
}
export function renderGuide({electric,structure,state}){
 const mode=state.mode??'electrical',trialMember=['roof','floor','pit','canopy'].includes(state.member)?state.member:'roof',lesson=mode==='electrical'?electricalLesson(electric,state.circuit):mode==='trial'?trialLesson(structure,state.live,trialMember):structuralLesson(structure,state.member);
 const controls=mode==='electrical'?`<label for="calc-context">회로 선택</label><select id="calc-context">${electric.circuits.map(c=>`<option value="${c.id}" ${c.id===lesson.id?'selected':''}>${c.id} · ${esc(c.name)}</option>`).join('')}</select>`:mode==='structure'?`<label for="calc-context">계산할 부재</label><select id="calc-context">${Object.entries(calculationTargets).map(([id,t])=>`<option value="${id}" ${id===lesson.id?'selected':''}>${t.name}</option>`).join('')}</select>`:`<label for="load-trial">${calculationTargets[trialMember].name} 활하중 (kN/m²)</label><input id="load-trial" type="number" min="0" max="20" step="0.5" value="${state.live}"><button id="trial-calculate">비교 계산</button><button id="trial-restore">기본 하중 ${structure[trialMember].live}로 복구</button><p id="trial-error" role="status"></p>`;
 return {lesson,html:`<div class="calc-guide"><div class="report-actions"><a class="button" id="open-calculation-book" href="/pages/guardhouse-classroom/education/calculation-book.html">전체 공식 해설서</a><button id="save-report">현재 계산 데이터 저장</button></div>
 <div class="calc-mode" aria-label="계산 학습 분야">${[['electrical','전기 계산'],['structure','구조 계산'],['trial','하중 비교 실험']].map(([id,label])=>`<button data-calc-mode="${id}" aria-pressed="${mode===id}">${label}</button>`).join('')}</div>
 <div class="calc-context">${controls}</div>
 ${mode==='trial'?'<p class="calc-trial-note">선택한 부재와 같은 형상·철근에 활하중만 바꾸는 실험입니다. 아래 모든 식과 결과가 실험값으로 바뀌며, 설치된 재료 수량은 유지됩니다.</p>':'<p class="calc-instruction">대상을 고른 뒤 공식을 하나씩 따라가세요. 도면·3D와 용어사전을 보고 나서 읽던 공식으로 돌아올 수 있습니다.</p>'}
 ${lessonHTML(lesson,state)}</div>`};
}
export function calculationBook(electric,structure){
 return `<header class="calc-book-intro"><p class="eyebrow">SAMPLE 01 · 공식 해설서</p><h1>경비실 계산의 이유와 원리</h1><p>기본 예제의 회로·구조 계산을 순서대로 읽습니다. 앱에서 바꾼 값은 ‘현재 계산 데이터 저장’에 반영됩니다. 각 부재는 대표 1 m 띠이며 전체 구조·법규 판정과 구분합니다.</p></header>${electric.circuits.map(c=>lessonHTML(electricalLesson(electric,c.id),{},{staticBook:true})).join('')}${Object.keys(calculationTargets).map(k=>lessonHTML(structuralLesson(structure,k),{},{staticBook:true})).join('')}<section class="calc-book-glossary"><h2>계산 용어사전</h2>${calculationGlossary.map(t=>`<article class="card"><h3>${t.term}</h3><p>${t.plain}</p><p>${t.definition}</p><p>${t.electrical}</p></article>`).join('')}</section>`;
}
