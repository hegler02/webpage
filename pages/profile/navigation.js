(() => {
  const mount = document.querySelector('site-navigation[data-page]');
  const ownScript = document.currentScript;
  if (!mount || !ownScript?.src) return;

  const page = mount.dataset.page;
  const assetRoot = new URL('.', ownScript.src);
  const declaredHome = document.querySelector('meta[name="site-home"]')?.content;
  const home = location.protocol === 'file:'
    ? new URL('index.html', assetRoot)
    : new URL(declaredHome || '/', location.href);

  const routes = [{"key": "home", "path": "", "ko": "홈", "en": "Home"}, {"key": "work", "path": "work/", "ko": "작업", "en": "Work"}, {"key": "books", "path": "books/", "ko": "저서·연구", "en": "Books & research"}, {"key": "mirinae", "path": "mirinae/", "ko": "미리내", "en": "Mirinae"}, {"key": "profile", "path": "profile/", "ko": "프로필", "en": "Profile"}];
  const shapes = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/>',
    work: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m3 10 4-4m2 4 4-4m2 4 4-4M7 3h14l-2 3H5z"/>',
    books: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v18H7.5A3.5 3.5 0 0 0 4 23zM20 5.5A3.5 3.5 0 0 0 16.5 2H13v18h3.5A3.5 3.5 0 0 1 20 23z"/>',
    mirinae: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>'
  };
  const icon = (body, attrs = '') => `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" focusable="false" ${attrs}>${body}</svg>`;
  const href = (key, path) => key === 'home' ? home.href : new URL(`${path}index.html`, assetRoot).href;
  const links = routes.map(({ key, path, ko, en }) =>
    `<a href="${href(key, path)}"${key === page ? ' aria-current="page"' : ''}>${icon(shapes[key], `data-icon="${key}"`)}<span data-ko>${ko}</span><span data-en lang="en">${en}</span></a>`
  ).join('');

  const nameKo = "김준호";
  const nameEn = "JOONHO KIM";
  mount.innerHTML = `<header class="site-header"><nav class="nav wrap" aria-label="주요 메뉴"><a class="brand" href="${home.href}"><span class="brand-row"><span data-ko>${nameKo}</span><span data-en lang="en">${nameEn}</span><span class="brand-proposition"><span data-ko>미디어는 메시지의 몸</span><span data-en lang="en">Media is the body of the message</span></span></span><small>MEDIA · JUDGMENT · BODY</small></a><div class="nav-main" data-drawer>${links}</div><div class="nav-tools"><button type="button" data-language-toggle aria-label="영어로 전환" aria-pressed="false">${icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>','data-icon="globe"')}<span class="language-name" data-language-name>EN</span></button><button type="button" data-theme-toggle aria-label="다크 모드로 전환" aria-pressed="false">${icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>','data-icon="sun" data-sun')}${icon('<path d="M20.5 15.5A9 9 0 0 1 8.5 3.5a9 9 0 1 0 12 12z"/>','data-icon="moon" data-moon hidden')}</button><button class="menu-button" type="button" data-menu-toggle aria-label="메뉴 열기" aria-expanded="false">${icon('<path d="M4 7h16M4 12h16M4 17h16"/>','data-icon="menu" data-menu-open')}${icon('<path d="m6 6 12 12M18 6 6 18"/>','data-icon="close" data-menu-close hidden')}<span data-menu-label><span data-ko>메뉴</span><span data-en lang="en">Menu</span></span></button></div></nav></header>`;
  window.dispatchEvent(new CustomEvent('navigation:ready', { detail: { page, assetRoot: assetRoot.href, home: home.href } }));
})();
