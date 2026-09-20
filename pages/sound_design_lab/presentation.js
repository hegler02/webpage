import { createMotion } from './motion.js';
import { createWorkbook } from './workbook.js';

const settings = JSON.parse(document.getElementById('lab-settings').textContent);
const scenes = [...document.querySelectorAll('.scene')];
const stage = document.getElementById('stage');
const viewport = document.querySelector('.viewport');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const reducedInput = document.getElementById('reduce-motion');
const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
const LIMITS = Object.freeze({ swipe: 55, notice: 3500 });
const motion = createMotion(stage);
let current = -1;
let generation = 0;
let busy = false;
let noticeTimer = null;
let touchOrigin = null;

function notify(message) {
  clearTimeout(noticeTimer);
  const notice = document.getElementById('notice');
  notice.textContent = message;
  notice.classList.add('visible');
  noticeTimer = setTimeout(() => notice.classList.remove('visible'), LIMITS.notice);
}
const workbook = createWorkbook(settings, notify);
const reduced = () => reducedInput.checked || mediaQuery.matches;
const title = scene => scene.querySelector('.scene-title').textContent.replace(/\s+/g, ' ').trim();
const parseHash = () => {
  const match = location.hash.match(/^#slide-(\d{1,2})$/);
  return match ? Math.max(0, Math.min(scenes.length - 1, Number(match[1]) - 1)) : 0;
};
function fit() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  document.documentElement.style.setProperty('--stage-scale', Math.min(width / stage.offsetWidth, height / stage.offsetHeight));
}
function controls() {
  previous.disabled = current === 0;
  next.disabled = current === scenes.length - 1;
  document.getElementById('position').textContent = String(current + 1).padStart(2, '0');
  document.getElementById('progress').style.width = `${((current + 1) / scenes.length) * 100}%`;
  document.querySelectorAll('.phase-nav [data-go]').forEach((button, i) => button.setAttribute('aria-current', String(Number(scenes[current].dataset.phase) === i + 1)));
  document.querySelectorAll('.outline-section a').forEach(a => a.setAttribute('aria-current', a.hash === `#${scenes[current].id}` ? 'page' : 'false'));
  document.getElementById('replay').disabled = reduced() || !motion.available;
  document.getElementById('notes-copy').textContent = scenes[current].querySelector('.speaker-note').content.textContent;
}
function go(index, { animate = true, historyMode = 'replace', replay = false } = {}) {
  const destination = Math.max(0, Math.min(scenes.length - 1, index));
  if (destination === current && !replay) return;
  const old = scenes[current];
  const direction = destination >= current ? 1 : -1;
  const ownGeneration = ++generation;
  motion.stop();
  scenes.forEach(scene => {
    scene.classList.remove('is-active', 'is-leaving');
    scene.inert = true;
    scene.setAttribute('aria-hidden', 'true');
  });
  current = destination;
  const active = scenes[current];
  active.classList.add('is-active');
  active.inert = false;
  active.removeAttribute('aria-hidden');
  if (old && old !== active && animate && !reduced()) old.classList.add('is-leaving');
  if (old?.contains(document.activeElement)) active.focus({ preventScroll: true });
  controls();
  if (historyMode === 'replace') history.replaceState(null, '', `#${active.id}`);
  document.getElementById('announcement').textContent = `${current + 1} / ${scenes.length}. ${title(active)}`;
  busy = true;
  stage.dataset.animating = 'true';
  motion.play(old, active, direction, !animate || reduced(), () => {
    if (ownGeneration !== generation) return;
    scenes.forEach(scene => scene.classList.remove('is-leaving'));
    busy = false;
    stage.dataset.animating = 'false';
  });
}
function openDialog(id) {
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  document.getElementById(id).showModal();
}
previous.addEventListener('click', () => go(current - 1));
next.addEventListener('click', () => go(current + 1));
document.getElementById('replay').addEventListener('click', () => go(current, { replay: true }));
document.getElementById('menu').addEventListener('click', () => openDialog('outline'));
document.getElementById('notes-button').addEventListener('click', () => openDialog('notes-dialog'));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('a[href^="#slide-"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  go(Number(link.hash.replace('#slide-', '')) - 1);
}));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.go) - 1)));
function motionPreferenceChanged() {
  if (reduced() && busy) go(current, { animate: false, replay: true });
  controls();
}
reducedInput.addEventListener('change', motionPreferenceChanged);
mediaQuery.addEventListener('change', motionPreferenceChanged);
document.getElementById('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { notify('이 환경에서는 전체화면을 열 수 없어요. 브라우저의 전체화면 기능을 사용하세요.'); }
});
document.addEventListener('fullscreenchange', () => {
  document.getElementById('fullscreen').setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
  fit();
});
document.getElementById('share').addEventListener('click', async () => {
  const url = settings.canonical + `#${scenes[current].id}`;
  try { await navigator.clipboard.writeText(url); notify('현재 슬라이드 링크를 복사했어요.'); }
  catch {
    document.getElementById('share-url').value = url;
    openDialog('share-dialog');
    document.getElementById('share-url').select();
  }
});
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]')) return;
  if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  if (event.target.closest('button,a') && [' ', 'Enter'].includes(event.key)) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); go(current + 1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); go(current - 1); }
  if (event.key === 'Home') { event.preventDefault(); go(0); }
  if (event.key === 'End') { event.preventDefault(); go(scenes.length - 1); }
});
viewport.addEventListener('touchstart', event => {
  if (event.target.closest('input,textarea,select,button,a') || event.touches.length !== 1) { touchOrigin = null; return; }
  touchOrigin = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
viewport.addEventListener('touchend', event => {
  if (!touchOrigin || !event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - touchOrigin.x;
  const dy = event.changedTouches[0].clientY - touchOrigin.y;
  touchOrigin = null;
  if (Math.abs(dx) > LIMITS.swipe && Math.abs(dx) > Math.abs(dy) * 1.3) go(current + (dx < 0 ? 1 : -1));
}, { passive: true });
viewport.addEventListener('touchcancel', () => { touchOrigin = null; }, { passive: true });
document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => {
  const route = button.dataset.route;
  document.querySelectorAll('[data-route]').forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.route === route)));
  document.querySelectorAll('[data-route-page]').forEach(page => {
    const selected = page.dataset.routePage === route;
    page.classList.toggle('selected', selected);
    page.inert = !selected;
    page.setAttribute('aria-hidden', String(!selected));
  });
}));
document.querySelectorAll('[data-route-page]').forEach((page, i) => {
  page.classList.toggle('selected', i === 0);
  page.inert = i !== 0;
  page.setAttribute('aria-hidden', String(i !== 0));
});
document.querySelectorAll('[data-display]').forEach(display => {
  const text = display.textContent;
  display.replaceChildren(...[...text].map(char => {
    const span = document.createElement('span');
    span.className = 'display-glyph';
    span.textContent = char === ' ' ? '\u00a0' : char;
    return span;
  }));
});
document.documentElement.classList.add('enhanced');
new ResizeObserver(fit).observe(viewport);
fit();
go(parseHash(), { animate: false, historyMode: 'none' });
window.addEventListener('hashchange', () => go(parseHash(), { historyMode: 'none' }));
document.fonts.ready.then(() => { fit(); if (current === 0) go(current, { replay: true, historyMode: 'none' }); });
