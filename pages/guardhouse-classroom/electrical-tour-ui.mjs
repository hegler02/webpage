import {lightingTour} from '/pages/guardhouse-classroom/src/electrical-installation.mjs';
export function tourControls(electric,state,{drawing='E-103'}={}){
 const t=lightingTour(electric,state.id);if(!t)return '';
 const step=t.steps[state.step],on=t.light.on;
 return `<div class="tour-heading"><div><span class="eyebrow">전기가 연결되는 길 · ${state.step+1} / 5</span><h2>${step.title}</h2></div><label>살펴볼 조명 <select id="tour-target">${electric.devices.filter(d=>d.kind==='light').map(d=>`<option value="${d.id}" ${d.id===state.id?'selected':''}>${d.name} · ${d.id}</option>`).join('')}</select></label><button id="tour-close">안내 닫기</button></div>
 <div class="tour-steps" role="group" aria-label="전기 경로 학습 단계">${t.steps.map((s,i)=>`<button data-tour-step="${i}" aria-pressed="${i===state.step}">${i+1}. ${['분전반','배관','벽 속 스위치','조명','N·PE'][i]}</button>`).join('')}</div>
 <p class="tour-explanation">${step.text}</p>
 <div class="tour-controls"><button id="tour-play" class="primary">${state.playing?'따라가기 일시정지':'배관 따라가기'}</button><label><input id="tour-follow" type="checkbox" ${state.follow?'checked':''}> 카메라도 따라가기</label><label><input id="tour-ghost" type="checkbox" ${state.ghost?'checked':''}> 벽 투명하게</label><button data-switch="${t.device.id}">${t.device.name} ${t.device.on?'끄기':'켜기'}</button><span class="tour-power ${on?'is-on':''}" role="status">${t.light.name} ${on?'점등':'소등'}</span></div>
 <div class="tour-links"><button data-ref="${drawing}">분전반 회로도</button><button id="tour-calculation">이 회로 계산</button><button data-term="${step.term}">지금 나온 용어</button><span>관은 식별하기 쉽게 굵게 강조합니다. 매입 위치는 교육용 설계에 지정한 구간입니다.</span></div>`;
}
