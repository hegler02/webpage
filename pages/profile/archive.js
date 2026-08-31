(() => {
  const controls = [...document.querySelectorAll('[data-body-filter]')];
  const cards = [...document.querySelectorAll('[data-body-type]')];
  const count = document.querySelector('[data-visible-count]');
  if (!controls.length || !cards.length) return;

  const allowed = new Set(['ALL', ...controls.map((control) => control.dataset.bodyFilter)]);
  const apply = (requested, updateHistory = true) => {
    const filter = allowed.has(requested) ? requested : 'ALL';
    let visible = 0;
    cards.forEach((card) => {
      const matches = filter === 'ALL' || card.dataset.bodyType === filter;
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    controls.forEach((control) => control.setAttribute('aria-pressed', String(control.dataset.bodyFilter === filter)));
    if (count) count.textContent = String(visible);
    if (updateHistory && location.protocol !== 'file:') {
      const url = new URL(location.href);
      if (filter === 'ALL') url.searchParams.delete('body');
      else url.searchParams.set('body', filter);
      history.replaceState({}, '', url);
    }
  };

  controls.forEach((control) => control.addEventListener('click', () => apply(control.dataset.bodyFilter)));
  const initial = location.protocol === 'file:' ? 'ALL' : new URL(location.href).searchParams.get('body') || 'ALL';
  apply(initial, false);
})();
