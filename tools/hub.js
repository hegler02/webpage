(() => {
  const cards = [...document.querySelectorAll('[data-tool]')];
  const search = document.querySelector('#search');
  const kind = document.querySelector('#kind');
  const count = document.querySelector('#count');
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    for (const card of cards) card.hidden = !(card.textContent.toLocaleLowerCase().includes(query) && (!kind.value || kind.value === card.dataset.kind));
    const visible = cards.filter(card => !card.hidden).length;
    count.textContent = `${visible}개 항목`;
    document.querySelector('#empty').hidden = visible !== 0;
  }
  if (search) {
    search.form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', filter);
    kind.addEventListener('change', filter);
    filter();
  }
  const toggle = document.querySelector('[data-theme]');
  toggle?.addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    toggle.textContent = light ? '어두운 화면' : '밝은 화면';
    toggle.setAttribute('aria-label', `${toggle.textContent}으로 전환`);
  });
})();
