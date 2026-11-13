import {introSteps,introReady,introReading,introSignals} from './src/capsule-intro.mjs';

const onOff=v=>v?'켜짐':'꺼짐';
export function introNavigation(progress){return `<label class="cv-intro-picker">읽을 단계<select data-intro-picker>${introSteps.map((s,i)=>`<option value="${s.id}" ${progress.step===s.id?'selected':''}>${i+1} / ${introSteps.length} · ${s.short}${progress.completed.includes(s.id)?' · 관찰함':''}</option>`).join('')}</select></label><nav class="cv-intro-nav" aria-label="처음 만나는 설비 7단계">${introSteps.map((s,i)=>`<button data-intro-step="${s.id}" aria-current="${progress.step===s.id?'step':'false'}"><span>${i+1}. ${s.short}</span><small>${progress.completed.includes(s.id)?'관찰 기록 있음':'직접 살펴보기'}</small></button>`).join('')}</nav>`;}
export function introView(progress,session){
 const s=introSteps.find(x=>x.id===session.id),i=introSteps.indexOf(s);
 return `<div class="cv-intro-copy"><p class="eyebrow">처음 만나는 설비 · ${i+1} / ${introSteps.length}</p><h2 tabindex="-1" id="cv-intro-step-title">${s.title}</h2><p>${s.explain}</p><p class="cv-intro-look">${s.look}</p></div>
 <div class="cv-intro-actions">${s.actions.map(([id,label])=>`<button data-intro-action="${id}">${label}</button>`).join('')}</div>
 <p class="cv-intro-result" data-intro-result role="status" aria-live="polite"></p>
 ${['contacts','coil'].includes(s.id)?'<p class="small">릴레이 K1만 확대했습니다. 조작은 실제 시작·정지 버튼을 누릅니다. 움직임을 느리게 보여줍니다.</p>':''}
 ${s.id==='motion'?'<p class="small">이 버튼은 가상 설비에서 전원 켜기와 시작 버튼을 차례로 실행합니다. 이후 수업에서 각각의 스위치를 배웁니다.</p>':''}
 ${s.id==='plc'?'<div class="cv-intro-io"><div><strong>1. 입력</strong><span data-intro-input></span></div><div><strong>2. 프로그램의 조건</strong><span>원본에 프로그램 없음 · 수업 모형</span></div><div><strong>3. 출력</strong><span data-intro-output></span></div></div>':''}
 <details class="cv-intro-observations"><summary>직접 살펴본 내용 <span data-intro-count></span></summary><ul>${s.required.map((k,i)=>`<li data-intro-proof="${k}">${s.labels[i]} <span></span></li>`).join('')}</ul></details>
 <div class="button-row"><button data-term="${s.term}">이름과 뜻 알아보기</button><button data-intro-refocus>같은 위치 다시 보기</button></div>
 <div class="cv-intro-bottom"><button data-intro-step="${introSteps[i-1]?.id??s.id}" ${i===0?'disabled':''}>이전 단계</button><button data-intro-complete class="primary">관찰했어요</button><button ${i===introSteps.length-1?'data-intro-finish':'data-intro-step="'+introSteps[i+1].id+'"'}>${i===introSteps.length-1?'다음 학습 안내':'다음 단계'}</button></div>
 <p class="small" data-intro-feedback role="status"></p><p class="small">진도는 이 브라우저에 저장됩니다. 다시 접속하면 해당 단계의 시작 상태에서 비교합니다.</p>`;
}
export function refreshIntro(container,session,state,ready){
 const s=introSteps.find(x=>x.id===session.id),r=container.querySelector('[data-intro-result]');if(!r)return;
 const put=(n,text)=>{if(n&&n.textContent!==text)n.textContent=text;};
 put(r,introReading(session,state));
 for(const b of container.querySelectorAll('[data-intro-action]')){b.disabled=!ready;b.setAttribute('aria-pressed',String(session.lastAction===b.dataset.introAction));}
 container.querySelector('[data-intro-complete]').disabled=!ready||!introReady(session);
 put(container.querySelector('[data-intro-count]'),`${s.required.filter(x=>session.seen.includes(x)).length} / ${s.required.length}`);
 for(const n of container.querySelectorAll('[data-intro-proof]'))put(n.querySelector('span'),session.seen.includes(n.dataset.introProof)?'관찰함':'아직');
 put(container.querySelector('[data-intro-feedback]'),session.feedback);
 const input=container.querySelector('[data-intro-input]');
 if(input){const v=introSignals(state);put(input,'I:13/08 · '+onOff(v.start));put(container.querySelector('[data-intro-output]'),'O:11/09 → K1 · '+onOff(v.output));}
}
