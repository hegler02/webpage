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
  const initial = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'morning');
  const apply = (theme) => {
    root.dataset.theme = theme;
    button?.setAttribute('aria-pressed', String(theme === 'night'));
    button?.setAttribute('aria-label', theme === 'night' ? '라이트 모드로 전환' : '다크 모드로 전환');
    button?.querySelector('[data-sun]')?.toggleAttribute('hidden', theme === 'night');
    button?.querySelector('[data-moon]')?.toggleAttribute('hidden', theme !== 'night');
  };
  apply(initial);
  button?.addEventListener('click', () => {
    const next = root.dataset.theme === 'night' ? 'morning' : 'night';
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
  const setIcon = (opened) => { button.querySelector('[data-menu-open]')?.toggleAttribute('hidden', opened); button.querySelector('[data-menu-close]')?.toggleAttribute('hidden', !opened); button.querySelector('[data-menu-label]')?.toggleAttribute('hidden', opened); };
  const close = () => { drawer.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', '메뉴 열기'); setIcon(false); document.body.classList.remove('drawer-open'); };
  const open = () => { drawer.classList.add('is-open'); button.setAttribute('aria-expanded', 'true'); button.setAttribute('aria-label', '메뉴 닫기'); setIcon(true); document.body.classList.add('drawer-open'); drawer.querySelector('a')?.focus(); };
  button.addEventListener('click', () => drawer.classList.contains('is-open') ? close() : open());
  drawer.addEventListener('click', (event) => { if (event.target.closest('a')) close(); });
  document.addEventListener('pointerdown', (event) => { if (drawer.classList.contains('is-open') && !drawer.contains(event.target) && !button.contains(event.target)) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) { close(); button.focus(); } });
  const wide = matchMedia('(min-width: 56.001rem)');
  const resize = (event) => { if (event.matches) close(); };
  if (wide.addEventListener) wide.addEventListener('change', resize); else wide.addListener(resize);
})();

(() => {
  const player = document.querySelector('[data-player]');
  const audio = player?.querySelector('audio');
  const title = player?.querySelector('[data-player-title]');
  const close = player?.querySelector('[data-player-close]');

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
    try { await audio.play(); } catch (_) { audio.controls = true; }
    ProfileBus.emit('media:loaded', { provider: 'audio', title: audioButton.dataset.title });
  });
  close?.addEventListener('click', () => {
    audio.pause(); audio.removeAttribute('src'); audio.load(); delete audio.dataset.current;
    player.classList.remove('is-open'); player.setAttribute('aria-hidden', 'true');
  });
})();

(() => {
  document.querySelectorAll('[data-rail]').forEach((rail) => {
    const track = rail.querySelector('[data-rail-track]');
    const prev = rail.querySelector('[data-rail-prev]');
    const next = rail.querySelector('[data-rail-next]');
    if (!track || !prev || !next) return;
    const update = () => {
      const end = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= end - 2;
    };
    const move = (direction) => {
      const card = track.querySelector('.book');
      const distance = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * .8;
      track.scrollBy({ left: direction * distance, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  });
})();

document.documentElement.classList.add('js');
window.ProfileBus?.emit('app:ready');
