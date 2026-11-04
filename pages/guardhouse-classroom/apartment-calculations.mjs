import {apartmentLesson} from '/pages/guardhouse-classroom/src/apartment-lessons.mjs';
import {lessonHTML,formulaHTML} from './calculation-guide.mjs';

export function apartmentCalculationHTML(electric,state){
 const lesson=apartmentLesson(electric,state),index=Math.max(0,lesson.steps.findIndex(s=>s.id===state.step));
 state.step=lesson.steps[index].id;
 const controls=state.mode==='electrical'?`<label for="apt-calc-circuit">회로 선택</label><select id="apt-calc-circuit">${electric.circuits.map(c=>`<option value="${c.id}" ${c.id===state.circuit?'selected':''}>${c.id} · ${c.name}</option>`).join('')}</select>`:state.mode==='structure'?'<strong>계산할 부재</strong><span>세대 바닥판 · 대표 1 m 폭</span>':`<label for="apt-live">바닥 활하중 (kN/m²)</label><input id="apt-live" type="number" min="0" max="20" step="0.5" value="${state.live}"><button id="apt-trial-calculate">비교 계산</button><button id="apt-trial-restore">기본 하중 2로 복구</button><p id="apt-trial-error" role="status"></p>`;
 let html=lessonHTML(lesson,state);
 if(state.view==='all')html=html.slice(0,html.indexOf('<div class="calc-reading">'))+lesson.steps.map(s=>formulaHTML(s)).join('')+'</section>';
 return `<div class="calc-guide"><div class="report-actions"><button data-reading="${state.view==='all'?'one':'all'}">${state.view==='all'?'한 공식씩 읽기':'전체 공식 해설 보기'}</button><button id="apt-save-calculation">현재 계산 데이터 저장</button></div>
 <div class="calc-mode" aria-label="계산 학습 분야">${[['electrical','전기 계산'],['structure','구조 계산'],['trial','하중 비교 실험']].map(([id,label])=>`<button data-calc-mode="${id}" aria-pressed="${state.mode===id}">${label}</button>`).join('')}</div><div class="calc-context">${controls}</div>
 <p class="calc-instruction">대상을 고른 뒤 공식을 하나씩 따라가세요. 도면·3D와 용어사전을 보고 나서 읽던 공식으로 돌아올 수 있습니다.</p>
 ${state.mode==='trial'?'<p class="calc-trial-note">같은 바닥판의 형상·철근에 활하중만 바꾸는 실험입니다. 아래 공식과 결과가 실험값으로 바뀝니다.</p>':''}
 ${state.view==='all'?`<nav class="apt-calculation-toc" aria-label="공식 목차"><label for="apt-formula-jump">공식 바로가기</label><select id="apt-formula-jump">${lesson.steps.map((s,i)=>`<option value="${s.id}" ${s.id===state.step?'selected':''}>${i+1}. ${s.title}</option>`).join('')}</select><button data-reading="one">한 공식씩 읽기</button></nav>`:''}${html}</div>`;
}
