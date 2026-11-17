/* 학습 모드 / 강사 모드 전환, 확인 문제, 복사, 진도 기록(이 브라우저에만 저장) */
(() => {
  'use strict';
  const KEY = 'audit-ai-study-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) { /* 저장이 막혀도 화면은 동작 */ } };
  const state = load();
  const status = document.getElementById('study-status');
  const say = (t) => { status.textContent = t; };

  // 모드 전환
  const views = { learn: document.getElementById('mode-learn'), teach: document.getElementById('mode-teach') };
  const tabs = [...document.querySelectorAll('[data-mode]')];
  function setMode(mode, announce) {
    if (!views[mode]) mode = 'learn';
    Object.entries(views).forEach(([k, v]) => { v.hidden = k !== mode; });
    tabs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    state.mode = mode; save(state);
    if (announce) say(mode === 'learn' ? '학습 모드입니다.' : '강사 모드입니다.');
  }
  tabs.forEach((b) => b.addEventListener('click', () => { setMode(b.dataset.mode, true); history.replaceState(null, '', '#' + b.dataset.mode); }));
  const fromHash = location.hash.replace('#', '');
  setMode(views[fromHash] ? fromHash : (state.mode || 'learn'), false);

  // 진도
  const boxes = [...document.querySelectorAll('input[data-done]')];
  const bar = document.getElementById('progress-bar'), label = document.getElementById('progress-label');
  state.done = state.done || {};
  function paint() {
    const n = boxes.filter((b) => b.checked).length;
    label.textContent = `${n} / ${boxes.length} 단원 마침`;
    bar.value = n; bar.max = boxes.length;
    document.querySelectorAll('.toc a[data-lesson]').forEach((a) => { a.classList.toggle('done', !!state.done[a.dataset.lesson]); });
  }
  boxes.forEach((b) => {
    b.checked = !!state.done[b.dataset.done];
    b.addEventListener('change', () => { state.done[b.dataset.done] = b.checked; save(state); paint(); say(b.checked ? '단원을 마쳤습니다.' : '단원 완료를 취소했습니다.'); });
  });
  paint();

  // 확인 문제: 고르면 바로 맞고 틀림과 이유를 보여 준다
  document.querySelectorAll('fieldset.quiz').forEach((q) => {
    const answer = Number(q.dataset.answer);
    const out = q.querySelector('.feedback');
    q.querySelectorAll('input[type=radio]').forEach((r) => r.addEventListener('change', () => {
      const ok = Number(r.value) === answer;
      out.hidden = false;
      out.className = 'feedback ' + (ok ? 'right' : 'wrong');
      out.querySelector('.verdict').textContent = ok ? '맞습니다.' : '다시 생각해 보세요.';
      out.querySelector('.why').hidden = !ok;
    }));
  });

  // 복사
  document.querySelectorAll('.prompt .copy').forEach((btn) => btn.addEventListener('click', async () => {
    const pre = btn.closest('.prompt').querySelector('pre');
    try { if (!navigator.clipboard) throw new Error('x'); await navigator.clipboard.writeText(pre.textContent); say('복사했습니다. AI 창에 붙여 넣으세요.'); }
    catch (_) { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); say('글자를 선택했습니다. Ctrl+C로 복사하세요.'); }
  }));
})();
