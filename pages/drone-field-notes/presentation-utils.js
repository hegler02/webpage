"use strict";
window.DRONE_UTILS = (() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const token = (name, element = document.documentElement) => getComputedStyle(element).getPropertyValue('--' + name).trim();
  const num = (name, element) => Number.parseFloat(token(name, element));
  const img = (name, className = '', alt = '') => `<img class="${className}" src="assets/drone/${esc(name)}.webp" alt="${esc(alt)}">`;
  const stageExplanation = level => `<div class="stage-explanation"><p><strong>${esc(level.label)}</strong></p><p>${esc(level.detail)}</p></div>`;
  const stageKeys = (s, data) => s.layout === 'glossary' ? [] : s.status.stages || (data.stageScale.some(x => x.key === s.status.key) ? [s.status.key] : []);
  return {esc, token, num, img, stageExplanation, stageKeys};
})();
