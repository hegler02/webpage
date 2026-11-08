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
(() => {
  const RADIUS = 5;
  const UPPER = 6;
  const LOWER = -8;
  const START_Z = -9;
  const HEIGHT = 1.12;
  const NEAR = .19;
  const GATES = [
    {id: 1, x: -RADIUS, z: -4},
    {id: 2, x: -RADIUS, z: 4},
    {id: 3, x: RADIUS, z: 0},
  ];
  const TIME = {lift:1.6, gate1:4, gate2:8, upper:9, upperExit:14, gate3:17, lower:21, lowerExit:26, finish:28, end:29};
  const TURN_START = 7.35;
  const SHOTS = {
    opening:{from:2.1,to:6.3},
    takeoff:{from:0,to:3.45},
    align:{from:2.0,to:TURN_START,variant:'align'},
    turn:{from:TURN_START,to:15.9},
    lap:{from:3.35,to:TIME.end},
    miss:{from:2.1,to:4.45,poster:2.9,variant:'miss'},
    fix:{from:2.1,to:4.45,poster:2.9,variant:'fix'},
  };
  const GROUPS = {compare:['miss','fix']};
  const BUTTONS = new Map();
  const PREVIEWS = new Map();
  const faces = [];
  const signs = [];
  const stateLabels = ['다음 01', '다음 02', '다음 03', '복귀 01', '완주'];
  const palette = {
    sky:'#c2c9c4', floor:'#a1a6a0', floorDark:'#959c95', grid:'#8b938b',
    wall:['#747f77','#879188'], bay:'#adb7aa', steel:['#4a514b','#5b635a','#717b71'],
    orange:['#e96822','#b44818','#ff9048'], bases:['#242b27','#383e38','#525951'],
    white:'#e4e8e2', ink:'#171715', signal:'#a84018',
  };
  const clamp = (value, low, high) => Math.max(low, Math.min(value, high));
  const lerp = (start, end, fraction) => start + (end - start) * fraction;
  const progress = (time, start, end) => clamp((time - start) / (end - start), 0, 1);
  const smooth = value => value * value * (3 - 2 * value);
  const pulse = (time, start, end) => Math.sin(Math.PI * progress(time, start, end));
  const point = (x, y, z) => ({x,y,z});

  function stateAt(time, variant) {
    let x = -RADIUS, y = HEIGHT, z = START_Z, yaw = 0, bank = 0;
    let sticks = [0, .04, 0, 0];
    if (time <= TIME.lift) {
      y = lerp(.27, HEIGHT, smooth(progress(time, 0, TIME.lift)));
      sticks = [0, .62 * pulse(time, 0, TIME.lift), 0, 0];
    } else if (time <= TIME.upper) {
      z = time <= TIME.gate1
        ? lerp(START_Z, GATES[0].z, progress(time, TIME.lift, TIME.gate1))
        : lerp(GATES[0].z, UPPER, progress(time, TIME.gate1, TIME.upper));
      sticks = [0, .12, 0, .35 * pulse(time, TIME.lift, TIME.lift + .85)];
    } else if (time <= TIME.upperExit) {
      const f = progress(time, TIME.upper, TIME.upperExit);
      yaw = Math.PI * f;
      x = -RADIUS * Math.cos(yaw);
      z = UPPER + RADIUS * Math.sin(yaw);
      bank = .24 * Math.sin(Math.PI * f);
      sticks = [.33 * pulse(f, 0, 1), .22, .58 * Math.cos(Math.PI * f), 0];
    } else if (time <= TIME.lower) {
      x = RADIUS;
      yaw = Math.PI;
      z = lerp(UPPER, LOWER, progress(time, TIME.upperExit, TIME.lower));
    } else if (time <= TIME.lowerExit) {
      const f = progress(time, TIME.lower, TIME.lowerExit);
      yaw = Math.PI * (1 + f);
      x = -RADIUS * Math.cos(yaw);
      z = LOWER + RADIUS * Math.sin(yaw);
      bank = .24 * Math.sin(Math.PI * f);
      sticks = [.33 * pulse(f, 0, 1), .22, .58 * Math.cos(Math.PI * f), 0];
    } else {
      z = LOWER + (time - TIME.lowerExit) * 2;
    }
    if (variant && time <= TIME.upper) {
      const late = variant === 'miss';
      const align = variant === 'align';
      const offset = align ? .9 : 2.12;
      const f = progress(time, late ? 3.6 : 2.16, late ? 4.85 : 3.3);
      const shifted = late ? 1 - .22 * smooth(f) : 1 - smooth(f);
      x += offset * shifted;
      bank -= .09 * pulse(f, 0, 1);
      sticks[2] = -.53 * Math.sin(2 * Math.PI * f);
    }
    const gate = time < TIME.gate1 ? 0 : time < TIME.gate2 ? 1 : time < TIME.gate3 ? 2 : time < TIME.finish ? 3 : 4;
    return {x,y,z,yaw,bank,sticks,gate};
  }

  function face(points, color, stroke) {
    faces.push({points,color,stroke});
  }
  function box(x1,y1,z1,x2,y2,z2, colors) {
    const a=point(x1,y1,z1), b=point(x2,y1,z1), c=point(x2,y2,z1), d=point(x1,y2,z1);
    const e=point(x1,y1,z2), f=point(x2,y1,z2), g=point(x2,y2,z2), h=point(x1,y2,z2);
    face([a,b,c,d],colors[0]); face([e,f,g,h],colors[0]);
    face([a,e,h,d],colors[1]); face([b,f,g,c],colors[1]);
    face([d,c,g,h],colors[2]);
  }
  function buildRoom() {
    const floorExtent = 18, floorStep = 3, roomHeight = 7.2;
    for (let x = -floorExtent; x < floorExtent; x += floorStep) {
      for (let z = -floorExtent; z < floorExtent; z += floorStep) {
        const color = (x/floorStep + z/floorStep) % 2 === 0 ? palette.floor : palette.floorDark;
        face([point(x,0,z),point(x+floorStep,0,z),point(x+floorStep,0,z+floorStep),point(x,0,z+floorStep)],color,palette.grid);
      }
    }
    for (const side of [-1,1]) {
      const edge = side * floorExtent;
      const trim = side * (floorExtent-.08);
      for (let p = -floorExtent; p < floorExtent; p += 6) {
        face([point(edge,0,p),point(edge,0,p+6),point(edge,roomHeight,p+6),point(edge,roomHeight,p)],palette.wall[0],palette.steel[0]);
        face([point(trim,2.8,p+.4),point(trim,2.8,p+5.6),point(trim,5.5,p+5.6),point(trim,5.5,p+.4)],palette.bay,palette.steel[1]);
        face([point(p,0,edge),point(p+6,0,edge),point(p+6,roomHeight,edge),point(p,roomHeight,edge)],palette.wall[1],palette.steel[0]);
        face([point(p+.4,3,trim),point(p+5.6,3,trim),point(p+5.6,5.55,trim),point(p+.4,5.55,trim)],palette.bay,palette.steel[1]);
        for (const q of [1.8,3.2,4.5]) {
          face([point(trim,2.8,p+q),point(trim,5.5,p+q)],null,palette.steel[1]);
          face([point(p+q,3,trim),point(p+q,5.55,trim)],null,palette.steel[1]);
        }
      }
    }
    for (let z = -17.7; z < 18; z += 5.9) {
      box(-17.8,6.15,z,17.8,6.45,z+.18,palette.steel);
      box(-17.76,0,z,-17.53,6.2,z+.28,palette.steel);
      box(17.52,0,z,17.76,6.2,z+.28,palette.steel);
      face([point(-6,6.13,z),point(6,6.13,z)],null,palette.white);
    }
    GATES.forEach(gate => {
      const gateHalf = 1.39, frame = .16, depth = .14;
      for (const side of [-1,1]) {
        const x = gate.x + side * gateHalf;
        box(x-frame,0,gate.z-depth,x+frame,2.53,gate.z+depth,palette.orange);
        box(x-.28,0,gate.z-.46,x+.28,.09,gate.z+.46,palette.bases);
      }
      box(gate.x-gateHalf-frame,2.39,gate.z-depth,gate.x+gateHalf+frame,2.61,gate.z+depth,palette.orange);
      for (let x = gate.x - 1.5; x < gate.x + 1.45; x += .28) {
        face([point(x,.018,gate.z-.1),point(x+.13,.018,gate.z-.1),point(x+.13,.018,gate.z+.1),point(x,.018,gate.z+.1)],palette.white);
      }
      signs.push({p:point(gate.x,2.88,gate.z),label:String(gate.id)});
    });
  }

  function camera(state) {
    const tilt = .05;
    const a = Math.cos(state.yaw), b = Math.sin(state.yaw);
    const c = Math.cos(tilt), d = Math.sin(tilt);
    const e = Math.cos(state.bank), f = Math.sin(state.bank);
    return p => {
      const x = p.x-state.x, y=p.y-state.y, z=p.z-state.z;
      const right = a*x-b*z, forward=b*x+a*z;
      const up=c*y-d*forward;
      return point(e*right-f*up, f*right+e*up, d*y+c*forward);
    };
  }
  function clipNear(points) {
    const result = [];
    for (let i=0; i<points.length; i++) {
      const p = points[i], q = points[(i+1) % points.length];
      if (p.z >= NEAR) result.push(p);
      if ((p.z >= NEAR) !== (q.z >= NEAR)) {
        const f = (NEAR-p.z)/(q.z-p.z);
        result.push(point(lerp(p.x,q.x,f),lerp(p.y,q.y,f),NEAR));
      }
    }
    return result;
  }

  function surface(canvas) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(bounds.width*dpr);
    const height = Math.round(bounds.height*dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width/dpr,height/dpr);
    return {ctx, width:bounds.width, height:bounds.height};
  }
  function renderWorld(canvas,state) {
    const panel = surface(canvas);
    if (!panel) return;
    const {ctx,width:w,height:h} = panel;
    const toCamera = camera(state);
    const fov = Math.min(w * .51,h * 1.04);
    const project = p => [w*.5 + p.x*fov/p.z, h*.49 - p.y*fov/p.z];
    const ambience = ctx.createLinearGradient(0,0,0,h);
    ambience.addColorStop(0,'#747d75');
    ambience.addColorStop(.46,palette.sky);
    ambience.addColorStop(.47,palette.floor);
    ambience.addColorStop(1,'#878e85');
    ctx.fillStyle = ambience;
    ctx.fillRect(0,0,w,h);

    const draw = [];
    faces.forEach(({points,color,stroke}) => {
      const view = points.map(toCamera);
      if (!view.some(p => p.z >= NEAR)) return;
      const clipped = view.some(p => p.z < NEAR) ? clipNear(view) : view;
      if (clipped.length < (color ? 3 : 2)) return;
      const depth = view.reduce((sum,p)=>sum+p.z,0)/view.length;
      const ground = points.every(p => p.y < .025);
      draw.push({points:clipped.map(project),color,stroke,depth,ground});
    });
    signs.forEach(({p,label})=>{
      const view = toCamera(p);
      if (view.z > .8) draw.push({label,points:[project(view)],depth:view.z});
    });
    draw.sort((a,b)=>Number(!!b.ground)-Number(!!a.ground) || b.depth-a.depth);
    draw.forEach(item=>{
      const [[x,y],...other] = item.points;
      if (item.label) {
        const size = clamp(w*.35/item.depth, 11, w*.1);
        ctx.fillStyle = '#252a25';
        ctx.fillRect(x-size*.65,y-size*.62,size*1.3,size*1.24);
        ctx.fillStyle = '#fff3e9';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font = '750 '+size+'px "Pretendard Variable", Pretendard, sans-serif';
        ctx.fillText(item.label,x,y+size*.02);
        return;
      }
      ctx.beginPath(); ctx.moveTo(x,y);
      other.forEach(([px,py])=>ctx.lineTo(px,py));
      if (item.color) {
        ctx.closePath();
        ctx.fillStyle=item.color; ctx.fill();
      }
      if (item.stroke) {
        ctx.lineWidth = .65; ctx.strokeStyle=item.stroke; ctx.stroke();
      }
    });
    const shade = ctx.createRadialGradient(w*.52,h*.41,h*.18,w*.52,h*.41,w*.62);
    shade.addColorStop(0,'#0b170b00');
    shade.addColorStop(1,'#151f1840');
    ctx.fillStyle=shade; ctx.fillRect(0,0,w,h);
  }

  function renderMap(canvas) {
    const panel = surface(canvas);
    if (!panel) return;
    const {ctx,width:w,height:h} = panel;
    const scale = Math.min(w/22,h/28);
    const project = (x,z) => [w*.5+x*scale,h*.47-z*scale];
    ctx.fillStyle='#e8eae5';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#d3d8d0';ctx.lineWidth=1;
    ctx.beginPath();
    for (let x=0;x<w;x+=scale*2) { ctx.moveTo(x,0);ctx.lineTo(x,h); }
    for (let y=0;y<h;y+=scale*2) { ctx.moveTo(0,y);ctx.lineTo(w,y); }
    ctx.stroke();

    ctx.beginPath();
    for (let t=TIME.gate1;t<=TIME.finish+.02;t+=.07) {
      const s=stateAt(t), p=project(s.x,s.z);
      if (t===TIME.gate1) ctx.moveTo(...p); else ctx.lineTo(...p);
    }
    ctx.lineWidth=clamp(w*.021,4,8);
    ctx.strokeStyle=palette.signal;ctx.lineCap='round';ctx.stroke();

    function arrow(x,z,turn) {
      const [cx,cy]=project(x,z), u=clamp(w*.021,5,9);
      ctx.save();ctx.translate(cx,cy);ctx.rotate(turn);
      ctx.beginPath();ctx.moveTo(0,-u);ctx.lineTo(u,u*.72);ctx.lineTo(-u,u*.72);ctx.closePath();
      ctx.fillStyle='#f9ece3';ctx.fill();ctx.restore();
    }
    arrow(-RADIUS,0,0); arrow(0,UPPER+RADIUS,Math.PI/2);
    arrow(RADIUS,-4,Math.PI); arrow(0,LOWER-RADIUS,-Math.PI/2);
    ctx.font='750 '+clamp(w*.047,15,21)+'px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textBaseline='middle';
    GATES.forEach(({x,z,id})=>{
      const [cx,cy]=project(x,z);
      ctx.fillStyle=palette.orange[0];
      ctx.fillRect(cx-scale*1.42,cy-3,scale*2.84,6);
      ctx.fillStyle=palette.ink;
      ctx.textAlign=x<0?'right':'left';
      ctx.fillText(String(id),cx+scale*(x<0?-1.8:1.8),cy);
    });
    const [startX,startY]=project(-RADIUS,START_Z);
    ctx.fillStyle=palette.ink;
    ctx.beginPath();ctx.arc(startX,startY,4,0,Math.PI*2);ctx.fill();
    ctx.textAlign='right';
    ctx.font='650 '+clamp(w*.038,12,16)+'px "Pretendard Variable", Pretendard, sans-serif';
    ctx.fillText('시작',startX-scale*.88,startY);
  }

  function renderShot(name,time) {
    const preview = PREVIEWS.get(name);
    const state = stateAt(time,SHOTS[name].variant);
    renderWorld(preview.canvas,state);
    if (preview.progress && preview.progress.textContent !== stateLabels[state.gate]) {
      preview.progress.textContent = stateLabels[state.gate];
    }
    preview.dots.forEach((dot,index) => {
      dot.style.setProperty('--stick-x',state.sticks[index*2]);
      dot.style.setProperty('--stick-y',-state.sticks[index*2+1]);
    });
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = null;
  let animation = 0;
  function refreshControls(control) {
    const running = active === control;
    const label = running ? '일시정지' : control.label;
    if (control.button.textContent !== label) control.button.textContent = label;
    if (control.seek) {
      const {from,to} = SHOTS[control.names[0]];
      const elapsed = Math.floor(control.time-from);
      control.seek.value = Math.round(progress(control.time,from,to)*Number(control.seek.max));
      control.clock.textContent = Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0');
      control.seek.setAttribute('aria-valuetext',control.clock.textContent);
    }
  }
  function pause() {
    cancelAnimationFrame(animation);
    const old = active;
    active = null;
    if (old) refreshControls(old);
  }
  function paint(control) {
    control.names.forEach(name=>renderShot(name,control.time));
    refreshControls(control);
  }
  function step(now) {
    const control = active;
    if (!control || control.button.closest('[hidden]')) { pause(); return; }
    const {to} = SHOTS[control.names[0]];
    control.started ??= now;
    const seconds = (now-control.started)/1000;
    control.time = Math.min(to,control.resume+seconds);
    paint(control);
    if (control.time < to) animation=requestAnimationFrame(step);
    else pause();
  }

  buildRoom();
  const modePreview = document.querySelector('[data-mode-course]');
  if (modePreview) {
    modePreview.course = Object.freeze({renderWorld, renderMap, stateAt, times: Object.freeze(TIME)});
    return;
  }
  document.querySelectorAll('[data-shot]').forEach(window=>{
    const name = window.dataset.shot;
    PREVIEWS.set(name,{
      canvas:window.querySelector('canvas'),
      progress:window.querySelector('[data-gate-progress]'),
      dots:[...window.closest('figure').querySelectorAll('[data-sticks] .stick-axis > i')],
    });
  });
  document.querySelectorAll('[data-play]').forEach(button=>{
    const name = button.dataset.play;
    const names = GROUPS[name] || [name];
    const shot = SHOTS[names[0]];
    const holder = button.closest('figure');
    const control = {button,names,label:button.textContent,time:shot.poster ?? shot.from,
      seek:holder.querySelector('.lap-timeline'),clock:holder.querySelector('.lap-time'),
      started:null,resume:0,played:false};
    BUTTONS.set(name,control);
    button.addEventListener('click',()=>{
      if (active===control) { pause(); return; }
      pause();
      if (!control.played || control.time >= shot.to) control.time=shot.from;
      control.played=true;
      control.resume=control.time;
      control.started=null;
      active=control;
      paint(control);
      animation=requestAnimationFrame(step);
    });
    control.seek?.addEventListener('input',()=>{
      pause();
      control.time=lerp(shot.from,shot.to,Number(control.seek.value)/Number(control.seek.max));
      control.played=true;
      paint(control);
    });
  });
  const map=document.querySelector('[data-course-map]');
  const gateGap=Math.abs(GATES[1].z-GATES[0].z);
  const laneGap=Math.abs(GATES[2].x-GATES[0].x);
  document.querySelector('[data-course-measures]').textContent =
    '코스 배치 · 1번–2번 간격 '+gateGap+'m · 직선 간격 '+laneGap+'m · 3번은 반대편에서 1·2번 사이';
  const repaint=()=>{
    BUTTONS.forEach(control=>{
      if (!control.button.closest('[hidden]')) paint(control);
    });
    if (!map.closest('[hidden]')) renderMap(map);
  };
  const observer=new ResizeObserver(repaint);
  PREVIEWS.forEach(preview=>observer.observe(preview.canvas));
  observer.observe(map);
  const slideObserver = new MutationObserver(() => {
    if (active?.button.closest('[hidden]')) pause();
    repaint();
  });
  document.querySelectorAll('.slide').forEach(slide => {
    slideObserver.observe(slide,{attributes:true,attributeFilter:['hidden']});
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden) pause();});
  reduced.addEventListener('change',()=>{if(reduced.matches) pause();});
  document.fonts.ready.then(repaint);
  repaint();
})();
