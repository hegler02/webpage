(() => {
  const mount = document.querySelector('site-navigation[data-page]');
  const ownScript = document.currentScript;
  if (!mount || !ownScript?.src || mount.dataset.initialized) return;
  mount.dataset.initialized = "true";

  // Hand-written pages may name the older sections; they belong under the new menu.
  const owner = { archive: 'work', notes: 'work', constellation: 'galaxy', books: 'research', profile: 'about' };
  const page = owner[mount.dataset.page] || mount.dataset.page;
  const assetRoot = new URL('.', ownScript.src);
  const declaredHome = document.querySelector('meta[name="site-home"]')?.content;
  const home = location.protocol === 'file:'
    ? new URL('index.html', assetRoot)
    : location.hostname === 'mirinaeman.com' ? new URL(declaredHome || '/', location.href) : new URL('/', location.href);
  const routeRoot = location.protocol === 'file:' ? assetRoot : home;

  const routes = /* GENERATED_ROUTES_START */[{"key":"home","path":"","ko":"홈","en":"Home"},{"key":"work","path":"work/","ko":"작업","en":"Work"},{"key":"galaxy","path":"galaxy/","ko":"은하수","en":"Galaxy"},{"key":"research","path":"research/","ko":"연구","en":"Research"},{"key":"mirinae","path":"mirinae/","ko":"미리내","en":"Mirinae"},{"key":"about","path":"about/","ko":"소개","en":"About"}]/* GENERATED_ROUTES_END */;
  const icon = (body, attrs = '') => `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" focusable="false" ${attrs}>${body}</svg>`;
  const href = (key, path) => key === 'home' ? home.href : new URL(location.protocol === 'file:' ? `${path}index.html` : path, routeRoot).href;
  const links = routes.map(({ key, path, ko, en }, i) =>
    `<a href="${href(key, path)}" data-key="${key}" style="--i:${i}"${key === page ? ' aria-current="page"' : ''}><span data-ko>${ko}</span><span data-en lang="en">${en}</span></a>`
  ).join('');

  mount.innerHTML = `<header class="site-header"><nav class="nav" aria-label="주요 메뉴"><a class="brand" href="${home.href}"><span data-ko>김준호</span><span data-en lang="en">JOONHO KIM</span></a><div class="nav-main" data-drawer><div class="nav-list">${links}</div></div><div class="nav-tools"><button type="button" data-language-toggle aria-label="영어로 전환" aria-pressed="false">${icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>','data-icon="globe"')}<span class="language-name" data-language-name>EN</span></button><button type="button" data-theme-toggle aria-label="다크 모드로 전환" aria-pressed="false">${icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>','data-icon="sun" data-sun')}${icon('<path d="M20.5 15.5A9 9 0 0 1 8.5 3.5a9 9 0 1 0 12 12z"/>','data-icon="moon" data-moon hidden')}</button><button class="menu-button" type="button" data-menu-toggle aria-label="메뉴 열기" aria-expanded="false"><i></i><i></i><i></i></button></div></nav></header>`;
  document.querySelectorAll('[data-route-key]').forEach((anchor) => {
    const route = routes.find((item) => item.key === anchor.dataset.routeKey);
    if (route) anchor.href = href(route.key, route.path);
  });
  window.dispatchEvent(new CustomEvent('navigation:ready', { detail: { page, assetRoot: assetRoot.href, home: home.href } }));

  // Introductions are written by hand; what surrounds them comes from the graph.
  if (!document.body.dataset.page && location.protocol !== 'file:') {
    fetch('/site/editorial-context.json').then((r) => r.ok ? r.json() : {}).then((blocks) => {
      const block = blocks[location.pathname];
      if (block) document.querySelector('main')?.insertAdjacentHTML('beforeend', block);
    }).catch(() => {});
  }

  // On a preview or local copy, links written with the public address stay on this copy.
  if (location.protocol !== 'file:' && location.hostname !== 'mirinaeman.com') {
    const PUBLIC = 'https://mirinaeman.com/';
    const keepHere = (root) => root.querySelectorAll?.(`a[href^="${PUBLIC}"]`).forEach((a) => {
      a.href = location.origin + '/' + a.getAttribute('href').slice(PUBLIC.length);
    });
    keepHere(document);
    new MutationObserver((changes) => changes.forEach((c) => c.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches?.(`a[href^="${PUBLIC}"]`)) keepHere(n.parentNode);
      else keepHere(n);
    }))).observe(document.body, { childList: true, subtree: true });
  }
})();
