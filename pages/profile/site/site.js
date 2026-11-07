/* Moves between pages without reloading, so the galaxy keeps flying and the menu can stay smooth.
   Every page still exists as plain HTML; without this script links simply load it. */
(() => {
  if (window.Site) return;
  const root = document.documentElement;
  const main = document.getElementById('main');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const ROUTED = /^\/(?:$|work\/|research\/|galaxy\/|mirinae\/|about\/)/;
  const ms = (name) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
  const cache = new Map();
  let galaxy = null;
  let generation = 0;
  let shown = location.pathname;
  root.classList.add('js');
  main.tabIndex = -1;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const fetchPage = (href) => {
    if (!cache.has(href)) {
      const request = fetch(href, { headers: { accept: 'text/html' } }).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))));
      request.catch(() => cache.delete(href));
      cache.set(href, request);
      if (cache.size > 12) cache.delete(cache.keys().next().value);
    }
    return cache.get(href);
  };

  function headSwap(doc) {
    document.title = doc.title;
    const selector = 'meta[name="description"],link[rel="canonical"],meta[property^="og:"],meta[name="twitter:card"],script[type="application/ld+json"]';
    document.head.querySelectorAll(selector).forEach((el) => el.remove());
    doc.head.querySelectorAll(selector).forEach((el) => document.head.append(el.cloneNode(true)));
  }

  function markMenu(page) {
    document.querySelectorAll('[data-drawer] a').forEach((a) => {
      if (a.dataset.key === page) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function scrollToHash(hash) {
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth' });
  }

  async function go(href, { push = true, scroll = 0 } = {}) {
    const url = new URL(href, location.href);
    // Compare with the page on screen: on Back the address has already changed.
    const samePage = url.pathname === shown;
    if (samePage && (!push || url.search === location.search)) {
      if (push && url.hash !== location.hash) history.pushState(history.state, '', url);
      if (url.hash) scrollToHash(url.hash);
      else if (push) window.scrollTo({ top: 0, behavior: calm.matches ? 'auto' : 'smooth' });
      return;
    }
    if (push) history.replaceState({ y: scrollY }, '');
    const mine = ++generation;
    const key = url.pathname + url.search;
    let text;
    main.classList.remove('enter');
    if (!calm.matches && !samePage) main.classList.add('swap');
    try {
      [text] = await Promise.all([fetchPage(key), new Promise((done) => setTimeout(done, calm.matches || samePage ? 0 : ms('--dur-fast')))]);
    } catch {
      location.assign(url);
      return;
    }
    if (mine !== generation) return;
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const next = doc.getElementById('main');
    // Hand-written introductions have their own stylesheet and load as ordinary pages.
    if (!next || !doc.body.dataset.page) {
      location.assign(url);
      return;
    }
    if (push) history.pushState({}, '', url);
    shown = url.pathname;
    {
      galaxy?.unmount();
      main.innerHTML = next.innerHTML;
      main.dataset.page = next.dataset.page;
      if (next.dataset.theme) main.dataset.theme = next.dataset.theme;
      else delete main.dataset.theme;
      document.body.dataset.page = doc.body.dataset.page;
      delete document.body.dataset.open;
      headSwap(doc);
      markMenu(doc.body.dataset.page);
      window.scrollTo({ top: scroll, behavior: 'instant' });
      main.classList.remove('swap');
      if (!calm.matches) {
        main.classList.add('enter');
        setTimeout(() => main.classList.remove('enter'), ms('--dur-slow'));
      }
      main.focus({ preventScroll: true });
      setUp();
      if (url.hash) scrollToHash(url.hash);
    }
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = event.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin && url.origin !== 'https://mirinaeman.com') return;
    if (!ROUTED.test(url.pathname)) return;
    event.preventDefault();
    go(url.pathname + url.search + url.hash);
  });
  // Pages are small; fetching on intent makes the tap feel instant.
  document.addEventListener('pointerover', (event) => {
    const a = event.target.closest?.('a[href]');
    if (!a || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin === location.origin && ROUTED.test(url.pathname) && url.pathname !== location.pathname) fetchPage(url.pathname + url.search);
  }, { passive: true });
  addEventListener('popstate', () => go(location.pathname + location.search + location.hash, { push: false, scroll: history.state?.y || 0 }));

  function setUpWork() {
    const grid = document.getElementById('wg');
    if (!grid) return;
    const cards = [...grid.children];
    const notes = document.getElementById('notes');
    const star = document.getElementById('star');
    const query = document.getElementById('wq');
    const count = document.getElementById('wc');
    const chips = [...document.querySelectorAll('.chips [data-kind]')];
    const legacy = { SONGBODY: 'song', SLIDEBODY: 'slide', SCREENBODY: 'screen', STORYBODY: 'story', KNOWLEDGEBODY: 'knowledge' };
    const params = new URLSearchParams(location.search);
    let kind = params.get('kind') || legacy[params.get('body')] || '';
    if (!chips.some((c) => c.dataset.kind === kind)) kind = '';
    star.value = params.get('star') || '';
    const apply = (remember = true) => {
      const text = query.value.trim().toLowerCase();
      const onlyNotes = kind === 'notes';
      let shown = 0;
      if (onlyNotes) shown = notes.querySelectorAll('.card').length;
      else {
        cards.forEach((card) => {
          const on = (!kind || card.dataset.kind === kind) && (!star.value || card.dataset.stars.split(' ').includes(star.value)) && (!text || card.dataset.text.includes(text));
          card.hidden = !on;
          if (on) shown += 1;
        });
      }
      grid.hidden = onlyNotes;
      notes.hidden = !onlyNotes;
      star.parentElement.hidden = onlyNotes;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.kind === kind)));
      count.textContent = root.dataset.lang === 'en' ? `${shown} records` : `${shown}개`;
      if (!remember) return;
      const url = new URL(location.href);
      url.search = '';
      if (kind) url.searchParams.set('kind', kind);
      if (star.value) url.searchParams.set('star', star.value);
      history.replaceState(history.state, '', url);
    };
    chips.forEach((c) => c.addEventListener('click', () => { kind = c.dataset.kind; apply(); }));
    star.addEventListener('change', () => apply());
    query.addEventListener('input', () => apply(false));
    apply(false);
  }

  function setUpResearch() {
    const tabs = [...document.querySelectorAll('#research-tabs [data-tab]')];
    if (!tabs.length) return;
    const panels = [...document.querySelectorAll('[data-panel]')];
    const legacy = { 'degree-theses-title': 'papers', 'journal-articles-title': 'papers' };
    const show = (name, remember) => {
      if (!tabs.some((t) => t.dataset.tab === name)) name = 'books';
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.tab === name)));
      panels.forEach((p) => p.classList.toggle('on', p.dataset.panel === name));
      if (remember) history.replaceState(history.state, '', `#${name}`);
    };
    tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.tab, true)));
    const hash = location.hash.slice(1);
    show(legacy[hash] || hash, false);
    if (hash) requestAnimationFrame(() => scrollToHash(location.hash));
  }

  function setUpStage() {
    const slot = document.getElementById('stage-slot');
    if (!slot) return;
    const page = document.body.dataset.page;
    const start = () => import('/site/galaxy.js').then((m) => { galaxy = m; if (document.getElementById('stage-slot')) m.mount(document.body.dataset.page); }).catch(() => root.classList.add('gl-off'));
    if (galaxy) galaxy.mount(page);
    else if (page === 'galaxy' || !window.requestIdleCallback) start();
    else requestIdleCallback(start, { timeout: 1500 });
  }

  function setUpLanguage() {
    document.querySelectorAll('[data-copy-email]').forEach((button) => {
      const label = root.dataset.lang === 'en' ? 'Copy email address' : '이메일 주소 복사';
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  }

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-email]');
    if (!button) return;
    const status = document.getElementById('creator-copy-status');
    const english = root.dataset.lang === 'en';
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(document.getElementById('creator-email-address').textContent.trim());
      status.textContent = english ? 'Email address copied.' : '이메일 주소를 복사했습니다.';
    } catch {
      status.textContent = english ? 'Copy failed. Select the address to copy it manually.' : '복사하지 못했습니다. 주소를 선택해 복사해주세요.';
    } finally {
      button.disabled = false;
    }
  });

  function setUp() {
    setUpWork();
    setUpResearch();
    setUpStage();
    setUpLanguage();
  }

  new MutationObserver(() => { setUpLanguage(); galaxy?.relabel?.(); }).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  window.Site = { go };
  setUp();
})();
