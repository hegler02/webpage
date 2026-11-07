(function initializeProfile() {
if (window.__profileAppInitialized) return;
if (!document.querySelector('[data-menu-toggle]') || !document.querySelector('[data-drawer]')) {
  if (!window.__profileAppWaitingForNavigation) {
    window.__profileAppWaitingForNavigation = true;
    window.addEventListener('navigation:ready', () => {
      window.__profileAppWaitingForNavigation = false;
      initializeProfile();
    }, { once: true });
  }
  return;
}
window.__profileAppInitialized = true;
window.ProfileBus = (() => {
  const target = new EventTarget();
  return {
    on: (name, listener) => target.addEventListener(name, listener),
    emit: (name, detail = {}) => target.dispatchEvent(new CustomEvent(name, { detail }))
  };
})();

(() => {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  let saved = null;
  try { saved = localStorage.getItem('profile-theme'); } catch (_) {}
  const normalizeTheme = (theme) => theme === 'night' ? 'dark' : theme === 'morning' ? 'light' : theme;
  const initial = normalizeTheme(saved) || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const apply = (theme) => {
    root.dataset.theme = theme;
    button?.setAttribute('aria-pressed', String(theme === 'dark'));
    button?.setAttribute('aria-label', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
    button?.querySelector('[data-sun]')?.toggleAttribute('hidden', theme === 'dark');
    button?.querySelector('[data-moon]')?.toggleAttribute('hidden', theme !== 'dark');
  };
  apply(initial);
  button?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next); try { localStorage.setItem('profile-theme', next); } catch (_) {}
    ProfileBus.emit('theme:changed', { theme: next });
  });
})();

(() => {
  const root = document.documentElement;
  const button = document.querySelector('[data-language-toggle]');
  const apply = (lang) => {
    root.dataset.lang = lang; root.lang = lang;
    button?.setAttribute('aria-pressed', String(lang === 'en'));
    button?.querySelector('[data-language-name]')?.replaceChildren(lang === 'ko' ? 'EN' : 'KO');
    button?.setAttribute('aria-label', lang === 'ko' ? '영어로 전환' : '한국어로 전환');
  };
  let saved = null;
  try { saved = localStorage.getItem('profile-language'); } catch (_) {}
  apply(saved || 'ko');
  button?.addEventListener('click', () => {
    const next = root.dataset.lang === 'ko' ? 'en' : 'ko';
    apply(next); try { localStorage.setItem('profile-language', next); } catch (_) {}
    ProfileBus.emit('language:changed', { lang: next });
  });
})();

(() => {
  const button = document.querySelector('[data-menu-toggle]');
  const drawer = document.querySelector('[data-drawer]');
  if (!button || !drawer) return;
  const wide = matchMedia('(min-width: 1101px)');
  const background = [...document.querySelectorAll('main, body > footer')];
  const priorInert = new Map();
  let opened = false;
  const set = (next, restore = false) => {
    next = next && !wide.matches;
    const changed = opened !== next;
    opened = next;
    drawer.classList.toggle('is-open', next);
    drawer.inert = !next && !wide.matches;
    button.setAttribute('aria-expanded', String(next));
    button.setAttribute('aria-label', next ? '메뉴 닫기' : '메뉴 열기');
    for (const [selector, hidden] of [['[data-menu-open]',next],['[data-menu-close]',!next],['[data-menu-label]',next]]) button.querySelector(selector)?.toggleAttribute('hidden',hidden);
    document.body.classList.toggle('drawer-open', next);
    background.forEach(el => {
      if (next) { if (!priorInert.has(el)) priorInert.set(el,el.inert); el.inert=true; }
      else if(priorInert.has(el)) { el.inert=priorInert.get(el); priorInert.delete(el); }
    });
    if (changed) ProfileBus.emit('menu:changed', { open: next });
    if (next) drawer.querySelector('a')?.focus();
    else if (restore) button.focus();
  };
  button.addEventListener('click',()=>set(!opened,true));
  drawer.addEventListener('click',e=>{if(e.target.closest('a'))set(false);});
  document.addEventListener('pointerdown',e=>{if(opened&&!drawer.contains(e.target)&&!button.contains(e.target))set(false,true);});
  document.addEventListener('keydown',e=>{
    if(!opened)return;
    if(e.key==='Escape'){e.preventDefault();set(false,true);return;}
    if(e.key==='Tab'){
      const items=[...drawer.querySelectorAll('a[href]'),button];
      const i=items.indexOf(document.activeElement);
      if(e.shiftKey && i<=0){e.preventDefault();items.at(-1).focus();}
      else if(!e.shiftKey&&(i===items.length-1||i<0)){e.preventDefault();items[0].focus();}
    }
  });
  wide.addEventListener('change',()=>{
    const inDrawer = drawer.contains(document.activeElement);
    const onButton = document.activeElement === button;
    set(false);
    if (!wide.matches && inDrawer) button.focus();
    else if (wide.matches && onButton) drawer.querySelector('a')?.focus();
  });
  addEventListener('pagehide',()=>set(false));
  addEventListener('pageshow',()=>set(false));
  set(false);
})();

(() => {
  const player = document.querySelector('[data-player]');
  const audio = player?.querySelector('audio');
  const title = player?.querySelector('[data-player-title]');
  const close = player?.querySelector('[data-player-close]');
  let playVersion = 0;

  document.addEventListener('click', async (event) => {
    const soundcloudButton = event.target.closest('[data-soundcloud-url]');
    if (soundcloudButton) {
      const shell = document.querySelector('[data-soundcloud-shell]');
      if (!shell) return;
      if (!shell.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.title = soundcloudButton.dataset.title;
        iframe.allow = 'autoplay';
        iframe.loading = 'eager';
        iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudButton.dataset.soundcloudUrl)}&color=%23254f43&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;
        shell.replaceChildren(iframe);
      }
      shell.hidden = false;
      soundcloudButton.setAttribute('aria-expanded', 'true');
      ProfileBus.emit('media:loaded', { provider: 'soundcloud', url: soundcloudButton.dataset.soundcloudUrl });
      return;
    }
    const videoButton = event.target.closest('[data-video-id]');
    if (videoButton) {
      const shell = videoButton.closest('.video-shell');
      const iframe = document.createElement('iframe');
      iframe.title = videoButton.dataset.title;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoButton.dataset.videoId}?autoplay=1`;
      shell.replaceChildren(iframe);
      ProfileBus.emit('media:loaded', { provider: 'youtube', id: videoButton.dataset.videoId });
      return;
    }
    const audioButton = event.target.closest('[data-audio-src]');
    if (!audioButton || !audio || !player) return;
    const version = ++playVersion;
    const avatar = player.querySelector('.player-avatar img[data-src]');
    if (avatar && !avatar.src) avatar.src = avatar.dataset.src;
    if (audio.dataset.current !== audioButton.dataset.audioSrc) {
      audio.pause(); audio.removeAttribute('src');
      audio.src = audioButton.dataset.audioSrc;
      audio.dataset.current = audioButton.dataset.audioSrc;
      audio.load();
    }
    title.replaceChildren(audioButton.dataset.title);
    player.classList.add('is-open'); player.removeAttribute('aria-hidden');
    try { await audio.play(); } catch (_) {
      if (version === playVersion) audio.controls = true;
      return;
    }
    if (version !== playVersion) return;
    ProfileBus.emit('media:loaded', { provider: 'audio', title: audioButton.dataset.title });
  });
  close?.addEventListener('click', () => {
    ++playVersion;
    audio.pause(); audio.removeAttribute('src'); audio.load(); delete audio.dataset.current;
    player.classList.remove('is-open'); player.setAttribute('aria-hidden', 'true');
  });
})();

document.documentElement.classList.add('js');
window.ProfileBus?.emit('app:ready');

})();
