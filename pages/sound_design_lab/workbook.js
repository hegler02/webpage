/* Worksheet state belongs here. Animation never reads or writes saved answers. */
const STORAGE_KEY = 'mirinaeman.sound-lab.canvas.v1';
const SAVE_DELAY = 240;
const ANSWER_LIMIT = 600;
export function createWorkbook(settings, notify) {
  const fields = settings.groups.flatMap(group => group.fields);
  const known = new Set(fields.map(([id]) => id));
  const answers = Object.create(null);
  let timer = null;
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved?.version === 1 && saved.answers && typeof saved.answers === 'object') {
      for (const id of known) if (typeof saved.answers[id] === 'string') answers[id] = saved.answers[id].slice(0, ANSWER_LIMIT);
    }
  } catch { storageAvailable = false; }
  const complete = group => group.fields.every(([id]) => Boolean(answers[id]?.trim()));
  const count = () => settings.groups.filter(complete).length;
  function render() {
    for (const group of settings.groups) {
      document.querySelectorAll(`[data-group-dot="${group.id}"]`).forEach(dot => dot.classList.toggle('filled', complete(group)));
      const summary = document.querySelector(`[data-summary="${group.id}"]`);
      const values = group.fields.map(([id]) => answers[id]?.trim()).filter(Boolean);
      summary.textContent = values.length ? values.join(' · ') : '아직 작성하지 않았어요.';
      summary.closest('.summary-cell').classList.toggle('has-value', values.length > 0);
    }
    document.querySelectorAll('[data-completed-count]').forEach(el => { el.textContent = count(); });
  }
  function saveStatus(ok) {
    document.querySelectorAll('[data-save-status]').forEach(el => {
      el.textContent = ok ? '이 브라우저에 저장됐어요.' : '브라우저 저장이 안 됩니다. 내 설계안에서 복사해 보관하세요.';
      el.classList.toggle('failed', !ok);
    });
  }
  function flush() {
    clearTimeout(timer);
    timer = null;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, answers }));
      storageAvailable = true;
    } catch { storageAvailable = false; }
    saveStatus(storageAvailable);
  }
  document.querySelectorAll('[data-field]').forEach(input => {
    input.value = answers[input.dataset.field] || '';
    input.addEventListener('input', () => {
      answers[input.dataset.field] = input.value.slice(0, ANSWER_LIMIT);
      render();
      clearTimeout(timer);
      timer = setTimeout(flush, SAVE_DELAY);
    });
  });
  document.querySelectorAll('.worksheet').forEach(form => form.addEventListener('submit', event => event.preventDefault()));
  window.addEventListener('pagehide', () => { if (timer) flush(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && timer) flush(); });
  const text = () => ['MY GPT HARNESS CANVAS', 'Sound Design Lab V2 · 나의 설계안', '',
    ...settings.groups.flatMap(group => [`${String(group.step).padStart(2, '0')}. ${group.label}`,
      ...group.fields.map(([id, label]) => `${label}\n${answers[id]?.trim() || '(미작성)'}`), ''])].join('\n');
  const dialog = document.getElementById('canvas-dialog');
  const output = document.getElementById('canvas-export');
  function open() {
    if (timer) flush();
    output.value = text();
    document.getElementById('canvas-count').textContent = `${count()} / ${settings.groups.length} 단계의 모든 항목을 작성했어요.`;
    document.querySelectorAll('dialog[open]').forEach(el => el.close());
    dialog.showModal();
  }
  document.querySelectorAll('[data-open-canvas]').forEach(button => button.addEventListener('click', open));
  document.getElementById('copy-canvas').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      notify('설계안을 복사했어요.');
    } catch {
      output.focus();
      output.select();
      notify('전체 내용을 선택했어요. 복사해서 보관하세요.');
    }
  });
  if (!storageAvailable) saveStatus(false);
  render();
  return { flush, render, open };
}
