(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const titles = slides.map(slide => slide.querySelector('h1'));
  const main = document.querySelector('main');
  const dialog = document.querySelector('#toc');
  const openToc = document.querySelector('#open-toc');
  const closeToc = document.querySelector('#close-toc');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const page = document.querySelector('#page-number');
  const previousLesson = document.querySelector('#previous-lesson');
  const nextLesson = document.querySelector('#next-lesson');
  const toc = document.querySelector('#toc-list');
  const overlay = document.querySelector('.transition-layer');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const styles = getComputedStyle(document.documentElement);
  const ms = name => Number.parseFloat(styles.getPropertyValue('--motion-' + name));
  const easeEnter = styles.getPropertyValue('--ease').trim();
  const easeMove = styles.getPropertyValue('--ease-move').trim();
  const number = index => String(index + 1).padStart(2, '0');
  const running = new Set();
  let current = -1;
  let restoreTocFocus = true;
  let focusAfterHash = -1;

  const tocLinks = slides.map((slide, index) => {
    const row = document.createElement('li');
    const link = document.createElement('a');
    const label = document.createElement('span');
    const currentLabel = document.createElement('small');
    label.textContent = number(index);
    currentLabel.textContent = '현재';
    currentLabel.hidden = true;
    link.href = '#' + slide.id;
    link.append(label, titles[index].textContent.trim(), currentLabel);
    link.addEventListener('click', event => {
      event.preventDefault();
      restoreTocFocus = false;
      dialog.close();
      if (index === current) titles[index].focus({preventScroll: true});
      else go(index, false);
    });
    row.append(link);
    toc.append(row);
    return {link, currentLabel};
  });

  function stopTransitions() {
    running.forEach(animation => animation.cancel());
    running.clear();
    overlay.replaceChildren();
  }

  function play(node, frames, duration, delay = 0, easing = easeMove, fill = 'backwards') {
    const animation = node.animate(frames, {duration, delay, easing, fill});
    running.add(animation);
    const forget = () => running.delete(animation);
    animation.finished.then(forget, forget);
    return animation;
  }

  /* 설명 그리기: 장면이 끝난 뒤 그 장의 핵심만 움직인다. */
  function reveal(node, delay = 0) {
    play(node, [{opacity: 0}, {opacity: 1}], ms('draw'), ms('scene') + delay, 'linear');
  }

  function trace(node, delay = 0, from = 'inset(0 100% 0 0)') {
    play(node, [{clipPath: from}, {clipPath: 'inset(0)'}], ms('draw'), ms('scene') + delay);
  }

  function box(rect) {
    return {left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px'};
  }

  /* 장면 넘김: 옛 장면은 복제본으로 잠깐 남아 사라지고 새 장면이 이동 방향에서 들어온다. */
  function leaveScene(outgoing, sharedSelector) {
    const shell = document.createElement('div');
    const copy = outgoing.cloneNode(true);
    shell.className = 'transition-ghost';
    Object.assign(shell.style, box(main.getBoundingClientRect()));
    copy.style.inlineSize = outgoing.getBoundingClientRect().width + 'px';
    copy.style.marginBlockStart = -main.scrollTop + 'px';
    const canvases = outgoing.querySelectorAll('canvas');
    copy.querySelectorAll('canvas').forEach((canvas, index) => {
      if (canvases[index].width && canvases[index].height) canvas.getContext('2d').drawImage(canvases[index], 0, 0);
    });
    if (sharedSelector) copy.querySelectorAll(sharedSelector).forEach(node => { node.style.visibility = 'hidden'; });
    for (const element of [copy, ...copy.querySelectorAll('[id]')]) element.removeAttribute('id');
    shell.append(copy);
    overlay.append(shell);
    const animation = play(shell, [{opacity: 1}, {opacity: 0}], ms('out'), 0, 'linear', 'both');
    animation.finished.then(() => shell.remove(), () => {});
  }

  function enterScene(slide, direction, still) {
    const shift = still ? 0 : direction * Number.parseFloat(styles.getPropertyValue('--motion-shift')) * Number.parseFloat(styles.fontSize);
    play(slide, [{opacity: 0, transform: `translateX(${shift}px)`}, {opacity: 1, transform: 'none'}], ms('scene'), ms('in-delay'), easeEnter);
  }

  /* 같은 물건 잇기: 끝 위치에 복제하고 시작 위치에서 옮겨 온다. */
  function morphNode(fromRect, target) {
    const toRect = target.getBoundingClientRect();
    const shell = document.createElement('div');
    const image = target.cloneNode(true);
    shell.className = 'transition-morph';
    Object.assign(shell.style, box(toRect));
    for (const element of [image, ...image.querySelectorAll('[id]')]) element.removeAttribute('id');
    shell.append(image);
    overlay.append(shell);
    const scaleX = fromRect.width / toRect.width, scaleY = fromRect.height / toRect.height;
    const start = `translate(${fromRect.left - toRect.left}px, ${fromRect.top - toRect.top}px) scale(${scaleX}, ${scaleY})`;
    const animation = play(shell, [{transform: start}, {transform: 'none'}], ms('scene'), 0, easeMove, 'both');
    animation.finished.then(() => shell.remove(), () => {});
    play(target, [{opacity: 0}, {opacity: 0}], ms('scene'), 0, 'linear');
  }

  /* 같은 사진 잇기: 크기와 잘림을 함께 옮겨 끝 화면과 맞춘다. */
  function picture(node) {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    const height = rect.height * 2;
    const size = style.backgroundSize.split(' ')[0];
    const width = size.endsWith('%') ? rect.width * Number.parseFloat(size) / 100 : height * 1.5;
    const crop = Number.parseFloat(style.backgroundPositionX) / 100;
    return {frame: rect, left: rect.left + (rect.width - width) * crop, top: rect.top, width, height};
  }

  function morphPhoto(from, target) {
    const to = picture(target);
    const layer = document.createElement('div');
    const image = document.createElement('div');
    const edge = rect => `inset(${rect.top}px ${innerWidth - rect.right}px ${innerHeight - rect.bottom}px ${rect.left}px)`;
    layer.className = 'transition-photo';
    Object.assign(image.style, box({left: to.left, top: to.top, width: to.width, height: to.height}));
    layer.append(image);
    overlay.append(layer);
    const animation = play(layer, [{clipPath: edge(from.frame)}, {clipPath: edge(to.frame)}], ms('scene'), 0, easeMove, 'both');
    play(image, [
      {transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`},
      {transform: 'none'},
    ], ms('scene'), 0, easeMove, 'both');
    animation.finished.then(() => layer.remove(), () => {});
    play(target, [{opacity: 0}, {opacity: 0}], ms('scene'), 0, 'linear');
  }

  const steps = {
    's05>s06': {still: true},
  };

  function render(index, focus, step = false) {
    if (index === current) return;
    stopTransitions();
    const slide = slides[index];
    const outgoing = slides[current];
    const direction = index > current ? 1 : -1;
    const animate = step && outgoing && !reduceMotion.matches && Element.prototype.animate;
    let spec = {};
    let measured = null;
    if (animate) {
      spec = steps[outgoing.id + '>' + slide.id] || {};
      const mirror = steps[slide.id + '>' + outgoing.id] || {};
      const shared = spec.shared || mirror.shared;
      const kind = spec.morph || mirror.morph;
      const usable = shared && !((spec.wideOnly || mirror.wideOnly) && styles.getPropertyValue('--phone-layout-active').trim() === '1');
      const source = usable ? outgoing.querySelector(shared) : null;
      if (source && slide.querySelector(shared)) measured = {shared, kind, from: kind === 'photo' ? picture(source) : source.getBoundingClientRect()};
      leaveScene(outgoing, measured?.shared);
      spec = {...spec, still: spec.still ?? mirror.still};
    }

    current = index;
    slides.forEach((item, position) => {
      const selected = position === current;
      item.hidden = !selected;
      const {link, currentLabel} = tocLinks[position];
      currentLabel.hidden = !selected;
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const first = current === 0, last = current === slides.length - 1;
    previous.disabled = first;
    next.disabled = last;
    if (previousLesson) { previous.hidden = first; previousLesson.hidden = !first; }
    if (nextLesson) { next.hidden = last; nextLesson.hidden = !last; }
    page.textContent = number(current) + ' / ' + number(slides.length - 1);
    page.setAttribute('aria-label', (current + 1) + '장, 전체 ' + slides.length + '장');
    main.scrollTop = 0;
    if (focus) titles[current].focus({preventScroll: true});
    if (!animate) return;
    const target = measured ? slide.querySelector(measured.shared) : null;
    if (target) (measured.kind === 'photo' ? morphPhoto : morphNode)(measured.from, target);
    enterScene(slide, direction, spec.still);
    if (direction > 0) spec.draw?.(slide);
  }

  function indexFromAddress() {
    const index = slides.findIndex(slide => '#' + slide.id === location.hash);
    return index < 0 ? 0 : index;
  }

  function go(index, step = true) {
    if (index < 0 || index >= slides.length || index === current) return;
    render(index, true, step);
    focusAfterHash = index;
    location.hash = slides[index].id;
  }

  openToc.addEventListener('click', () => {
    restoreTocFocus = true;
    dialog.showModal();
    tocLinks[current].link.focus();
  });
  closeToc.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (restoreTocFocus) openToc.focus();
  });
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  window.addEventListener('hashchange', () => {
    const index = indexFromAddress();
    render(index, false);
    if (focusAfterHash === index) titles[index].focus({preventScroll: true});
    focusAfterHash = -1;
    main.scrollTop = 0;
  });
  document.addEventListener('keydown', event => {
    if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target.closest('a, button, input, textarea, select, [contenteditable]')) return;
    const destinations = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1};
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    go(destinations[event.key], event.key.startsWith('Arrow'));
  });
  window.addEventListener('resize', stopTransitions);
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) stopTransitions();
  });
  render(indexFromAddress(), false);
  document.documentElement.classList.add('ready');
  document.querySelector('#navigation').hidden = false;
  openToc.hidden = false;
  main.scrollTop = 0;
})();
/* 페이지 공유: canonical과 제목만 전달한다. 취소는 정상 취소로 두고 복사하지 않는다. */
(() => {
  const button = document.querySelector('#share');
  const status = document.querySelector('#share-status');
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  if (!button || !status) return;
  if (!canonical) return;
  button.hidden = false;
  let timer = 0;

  function say(text, showAddress = false) {
    clearTimeout(timer);
    status.replaceChildren(text);
    status.hidden = false;
    if (showAddress) {
      const address = document.createElement('input');
      address.readOnly = true;
      address.value = canonical;
      address.setAttribute('aria-label', '페이지 주소');
      address.addEventListener('blur', () => { status.hidden = true; });
      status.append(address);
      address.focus();
      address.select();
    } else {
      timer = setTimeout(() => { status.hidden = true; }, 2400);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(canonical);
      say('링크를 복사했습니다.');
    } catch (error) {
      say('복사하지 못했습니다. 주소를 직접 복사해 주세요.', true);
    }
  }

  button.addEventListener('click', async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({title: document.title, url: canonical});
    } catch (error) {
      if (error.name !== 'AbortError') copy();
    }
  });
})();
