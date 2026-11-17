/* 발표 엔진: 장·단계 상태, 조작, 화면 맞춤, 접근성 브리지(presentation-v1). 연출은 TransitionDirector가 맡는다. */
(() => {
  'use strict';
  const D = window.TransitionDirector;
  const root = document.querySelector('[data-a11y-presentation]');
  const stage = document.querySelector('.stage');
  const viewport = document.querySelector('.viewport');
  if (!root || !stage || !D) return;
  document.documentElement.classList.add('js');

  const data = JSON.parse(document.getElementById('deck-data').textContent);
  let slides = [...stage.querySelectorAll('[data-a11y-view]')];
  const templates = slides.map((s) => s.cloneNode(true));
  const $ = (id) => document.getElementById(id);
  const prev = $('btn-prev'), next = $('btn-next'), counter = $('counter'), stepDots = $('step-dots');
  const promptBtn = $('btn-prompt'), actionLink = $('btn-action'), live = $('live'), full = $('btn-full');
  const dialog = $('prompt-dialog'), promptText = $('prompt-text'), copyBtn = $('btn-copy'), copyStatus = $('copy-status');

  let current = 0, step = 0, settled = false;
  const maxStep = (i) => Number(slides[i].dataset.steps || 0);

  function parseHash() {
    const m = location.hash.match(/^#(\d+)(?:-(\d+))?$/);
    if (!m) return [0, 0];
    const i = Math.min(Math.max(Number(m[1]) - 1, 0), slides.length - 1);
    return [i, Math.min(Number(m[2] || 0), maxStep(i))];
  }

  function fit() {
    const css = getComputedStyle(document.documentElement);
    const w = parseFloat(css.getPropertyValue('--stage-w')), h = parseFloat(css.getPropertyValue('--stage-h'));
    const bar = document.querySelector('.controls').getBoundingClientRect().height;
    const availW = document.documentElement.clientWidth, availH = Math.max(160, innerHeight - bar);
    const scale = Math.min(availW / w, availH / h);
    viewport.style.width = `${w * scale}px`; viewport.style.height = `${h * scale}px`;
    stage.style.transform = `scale(${scale})`;
  }

  function paint() {
    slides.forEach((s, i) => {
      const on = i === current;
      s.hidden = !on && !s.classList.contains('is-leaving'); s.inert = !on;
      s.setAttribute('aria-hidden', String(!on));
      s.setAttribute('data-a11y-active', String(on));
    });
    const max = maxStep(current), info = data.slides[current];
    prev.disabled = current === 0 && step === 0;
    next.disabled = current === slides.length - 1 && step === max;
    counter.textContent = `${current + 1} / ${slides.length}`;
    stepDots.replaceChildren(...Array.from({ length: max }, (_, k) => { const d = document.createElement('span'); d.className = k < step ? 'dot on' : 'dot'; return d; }));
    stepDots.setAttribute('aria-label', max ? `강조 ${step} / ${max}` : '');
    stepDots.hidden = !max;
    promptBtn.hidden = !info.prompt;
    actionLink.hidden = !info.action;
    if (info.action) { actionLink.href = info.action.href; actionLink.textContent = info.action.label; }
    document.title = `${current + 1}. ${info.title} — AI를 활용한 감사업무 효율화`;
    try { history.replaceState(null, '', step ? `#${current + 1}-${step}` : `#${current + 1}`); } catch (_) { /* file: 출처 등 */ }
  }

  function busy(on) { settled = !on; root.setAttribute('aria-busy', String(on)); }

  async function go(index, { showAll = false } = {}) {
    const target = Math.min(Math.max(Number(index) || 0, 0), slides.length - 1);
    const from = slides[current];
    const direction = target >= current ? 1 : -1;
    current = target; step = showAll ? maxStep(target) : 0;
    busy(true);
    slides.forEach((s, i) => { if (i !== current && s !== from) s.hidden = true; });
    const to = slides[current];
    const p = D.enter(from === to ? null : from, to, direction);
    paint();
    if (showAll) D.showAll(to);
    live.textContent = `${current + 1}장. ${data.slides[current].title}`;
    const done = await p;
    if (done !== false && to === slides[current]) busy(false);
  }

  async function forward() {
    if (step < maxStep(current)) {
      step += 1; busy(true); paint();
      live.textContent = `강조 ${step}`;
      const s = slides[current];
      if (await D.step(s, step) !== false) busy(false);
    } else if (current < slides.length - 1) {
      await go(current + 1);
    }
  }

  function backward() {
    if (step > 0) { D.finishNow(); D.unstep(slides[current], step); step -= 1; busy(false); paint(); return; }
    if (current > 0) go(current - 1, { showAll: true });
  }

  prev.addEventListener('click', backward);
  next.addEventListener('click', forward);
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || dialog.open) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const onControl = e.target.closest('button, a');
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || (!onControl && (k === ' ' || k === 'Enter'))) { e.preventDefault(); forward(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); backward(); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(slides.length - 1); }
  });

  full.addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch (_) { live.textContent = '전체 화면을 쓸 수 없는 환경입니다. 브라우저의 전체 화면(F11)을 쓰세요.'; }
  });
  document.addEventListener('fullscreenchange', () => { full.textContent = document.fullscreenElement ? '전체 화면 끝' : '전체 화면'; fit(); });

  promptBtn.addEventListener('click', () => {
    promptText.value = data.slides[current].prompt || '';
    copyStatus.textContent = '가상 자료로 만든 질문입니다. 그대로 복사해 붙여 넣으세요.';
    dialog.showModal(); promptText.focus(); promptText.setSelectionRange(0, 0);
  });
  copyBtn.addEventListener('click', async () => {
    try { if (!navigator.clipboard) throw new Error('x'); await navigator.clipboard.writeText(promptText.value); copyStatus.textContent = '복사했습니다. AI 창에 붙여 넣으세요.'; }
    catch (_) { promptText.focus(); promptText.select(); copyStatus.textContent = '글자를 선택했습니다. Ctrl+C로 복사하세요.'; }
  });
  $('btn-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => promptBtn.focus());

  function recover() {
    D.finishNow();
    slides = slides.map((s, i) => (stage.contains(s) ? s : (() => {
      const fresh = templates[i].cloneNode(true);
      const after = slides.slice(i + 1).find((n) => stage.contains(n));
      stage.insertBefore(fresh, after || null);
      return fresh;
    })()));
    D.showAll(slides[current]); step = maxStep(current);
    busy(false); paint();
    const h = slides[current].querySelector('h1, h2'); h.tabIndex = -1; h.focus({ preventScroll: true });
    live.textContent = `${current + 1}장을 다시 불러왔습니다.`;
  }

  addEventListener('resize', fit);
  document.fonts?.ready.then(fit);
  window.__A11Y_PRESENTATION__ = {
    contractVersion: 'presentation-v1',
    getViewCount: () => slides.length,
    navigateTo: (i) => go(i),
    getCurrentIndex: () => current,
    isSettled: () => settled,
    recover
  };

  const [startIndex, startStep] = parseHash();
  current = startIndex;
  fit();
  go(startIndex).then(() => {
    if (!startStep) return;
    for (let k = 1; k <= startStep; k += 1) slides[current].querySelectorAll(`[data-step="${k}"]`).forEach((n) => n.classList.add('is-on'));
    step = startStep; paint();
  });
})();
