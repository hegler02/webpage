import {traceSteps,traceReading,diagnosisCases,diagnosisAnswers,observationText,recoveryReady} from './src/conveyor-investigation.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function investigationView(mode,index,trial,state){
 const tabs=`<div class="button-row"><button data-study="trace" aria-pressed="${mode==='trace'}">정상 동작 따라가기</button><button data-study="diagnosis" aria-pressed="${mode==='diagnosis'}">고장 원인 찾아보기</button>${mode?'<button data-study="close">안내 닫기</button>':''}</div>`;
 if(!mode)return tabs;
 if(mode==='trace'){
  const r=traceReading(traceSteps[index].id,state);
  return `${tabs}<nav class="cv-trace-steps" aria-label="동작을 읽는 순서">${traceSteps.map((x,i)=>`<button data-study-step="${i}" aria-current="${i===index?'step':'false'}">${i+1}. ${x.name}</button>`).join('')}</nav><div class="cv-study-reading"><h2>${index+1}. ${r.name}</h2><p class="cv-study-state" data-trace-state>${esc(r.state)}</p><p data-trace-why>${esc(r.why)}</p><div class="button-row"><button data-study="locate">이 단계 도면·3D</button><button data-term="${r.term}">쉬운 용어 설명</button><button data-study-step="${index-1}" ${index===0?'disabled':''}>이전 단계</button><button data-study-step="${index+1}" ${index===traceSteps.length-1?'disabled':''}>다음 단계</button></div><p class="small">단계는 설명 순서입니다. 위 조작 버튼으로 실제 상태를 바꿔 비교하세요. 단계 이동은 전원을 조작하지 않습니다.</p></div>`;
 }
 const c=diagnosisCases.find(x=>x.id===trial?.id);
 return `${tabs}<div class="cv-diagnosis-choice"><label for="cv-case">진단 문제</label><select id="cv-case">${diagnosisCases.map(x=>`<option value="${x.id}" ${x.id===c?.id?'selected':''}>${x.title}</option>`).join('')}</select><button data-study="start">${c?'문제 다시 시작':'문제 시작'}</button></div>${c?`<div class="cv-study-reading"><h2>${c.title}</h2><p>${c.question}</p><p class="cv-study-state" data-diagnosis-live></p><div class="cv-observations">${c.checks.map(([k,label])=>`<div><button data-study-observe="${k}">${label}</button><p class="small" data-observation="${k}">${esc(trial.observations[k]??'아직 관찰하지 않았습니다.')}</p></div>`).join('')}</div><fieldset class="cv-diagnosis-answers"><legend>관찰한 증거로 원인을 선택하세요.</legend>${diagnosisAnswers.map(([id,name])=>`<label><input type="radio" name="cv-answer" value="${id}" ${trial.answer===id?'checked':''}>${name}</label>`).join('')}</fieldset><button data-study="answer">판단 확인</button><p class="cv-study-feedback" role="status" data-diagnosis-feedback>${esc(trial.feedback)}</p><section data-recovery ${trial.correct?'':'hidden'}><h3>같은 설비에서 복구 확인</h3><p>${c.recovery}</p><p class="small">아래 조작은 가상 설비의 수업 절차입니다.</p><div class="button-row"><button data-action="run">운전 ON·OFF</button>${c.id==='isolator'?'<button data-action="isolator">현장 개폐기 열기·닫기</button>':''}${['wire','sensor-off'].includes(c.id)?'<button data-study="repair">모의 고장 해제</button>':''}${c.id==='sensor-off'?'<button data-action="position" data-value="1.5">감지기 앞에 놓기</button><button data-action="position" data-value="2.15">감지기 밖에 놓기</button>':'<button data-action="reset">허가 복구</button>'}<button data-study="confirm">복구 결과 확인</button></div><p data-recovery-state></p></section><div class="button-row"><button data-go="safety">안전점검으로 연결</button><button data-term="${c.id==='sensor-off'?'sensor':c.id==='isolator'?'feedback':c.id==='wire'?'wire':'reset'}">관련 용어 설명</button></div></div>`:'<p class="small">문제를 시작하면 현재 운전 상태를 문제 상황으로 바꿉니다. 정격·수량·학습 기록은 유지됩니다.</p>'}`;
}
export function refreshInvestigation(host,mode,index,trial,state){
 const put=(selector,text)=>{const n=host.querySelector(selector);if(n&&n.textContent!==text)n.textContent=text;};
 if(mode==='trace'){const r=traceReading(traceSteps[index].id,state);put('[data-trace-state]',r.state);put('[data-trace-why]',r.why);}
 if(mode==='diagnosis'&&trial){
  put('[data-diagnosis-live]',trial.id==='sensor-off'?observationText('physical',state)+' · '+observationText('input',state):observationText('coil',state)+' · '+observationText('motor',state));
  put('[data-diagnosis-feedback]',trial.feedback);
  for(const [k,v]of Object.entries(trial.observations))put(`[data-observation="${k}"]`,v);
  host.querySelector('[data-recovery]').hidden=!trial.correct;
  const ready=recoveryReady(trial,state);
  put('[data-recovery-state]',trial.complete&&ready?'복구 확인 완료':trial.id==='sensor-off'?`고장 해제 후 확인: 감지기 앞 ${trial.sensorChecks.includes('inside')?'확인':'미확인'} · 감지기 밖 ${trial.sensorChecks.includes('outside')?'확인':'미확인'}`:ready?'현재 모터가 동작합니다. 복구 결과 확인을 눌러 마무리하세요.':'현재 설비 상태로 복구를 확인해야 합니다.');
 }
}
