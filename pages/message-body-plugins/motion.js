'use strict';

// Navigation owns the final scene. This controller only owns temporary visuals.
window.GuideMotion = (() => {
  const stage = document.querySelector('.stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  const temporary = new Set();
  const ease = 'cubic-bezier(.22,1,.36,1)';

  function animate(element, frames, duration, delay = 0, scope = 'scene') {
    if (!element || reduced.matches || !element.animate) return;
    const animation = element.animate(frames, {duration, delay, easing:ease, fill:'both'});
    running.set(animation, scope);
    animation.finished.then(() => {
      running.delete(animation);
      animation.cancel();
    }, () => running.delete(animation));
    return animation;
  }

  function clear(scope) {
    for (const [animation, owner] of running) {
      if (!scope || owner === scope) {
        animation.cancel();
        running.delete(animation);
      }
    }
    if (!scope || scope === 'scene') {
      for (const element of temporary) element.remove();
      temporary.clear();
    }
  }

  function capture(scene, selected) {
    clear();
    if (reduced.matches || !scene || scene.hidden) return null;
    const clone = scene.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('aria-labelledby');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clone.setAttribute('aria-hidden','true');
    clone.inert = true;
    clone.classList.add('departing');
    clone.hidden = false;
    stage.append(clone);
    temporary.add(clone);
    return {clone,selected};
  }

  function reveal(element, delay, distance = 22, duration = 600, scope = 'scene') {
    return animate(element, [
      {opacity:0, transform:`translateY(${distance}px)`},
      {opacity:1, transform:'translateY(0)'}
    ], duration, delay, scope);
  }

  function enter(scene, index, previous, snapshot) {
    if (reduced.matches) { clear(); return; }
    const direction = index >= previous ? 1 : -1;
    const surfaceChange = previous >= 0 && ([0,6].includes(index) !== [0,6].includes(previous));
    if (snapshot) {
      const {clone} = snapshot;
      const exit = animate(clone, [
        {opacity:1,transform:'translateX(0)'},
        {opacity:surfaceChange?1:0,transform:`translateX(${-direction*48}px)`}
      ], surfaceChange?800:460);
      if (exit) exit.finished.then(() => {
        clone.remove(); temporary.delete(clone);
      }, () => {});
    }
    if (surfaceChange) {
      animate(scene, [
        {clipPath:direction>0?'inset(0 0 0 100%)':'inset(0 100% 0 0)'},
        {clipPath:'inset(0 0 0 0)'}
      ],800);
    } else if (snapshot) {
      animate(scene, [
        {opacity:0,transform:`translateX(${direction*58}px)`},
        {opacity:1,transform:'translateX(0)'}
      ],620);
    }

    const start = surfaceChange ? 200 : 60;
    reveal(scene.querySelector('.eyebrow'),start,10,420);
    reveal(scene.querySelector('h1,h2'),start+70,28,740);
    if (index === 0) {
      reveal(scene.querySelector('.intro'),start+230,16);
      reveal(scene.querySelector('.notice'),start+320,14);
      animate(scene.querySelector('.hero-media img'),[
        {opacity:.4,transform:'scale(1.035)'},
        {opacity:1,transform:'scale(1)'}
      ],1100,start+80);
    } else if (index === 2) {
      reveal(scene.querySelector('.flow-intro'),start+230,16);
      scene.querySelectorAll('.medium').forEach((el,i) => reveal(el,start+200+i*65,18,580));
      reveal(scene.querySelector('.flow-footer'),start+600,8,440);
    } else if (index === 3) {
      reveal(scene.querySelector('.download-heading>p:last-child'),start+200,14);
      reveal(scene.querySelector('.tool-list'),start+160,0,500);
      reveal(scene.querySelector('.package'),start+290,18,660);
    } else if (index === 4) {
      reveal(scene.querySelector('.platforms'),start+220,12);
      reveal(scene.querySelector('.steps'),start+190,0,540);
      reveal(scene.querySelector('.step-detail'),start+280,18,650);
    } else {
      scene.querySelectorAll('.route-comparison article,.continuity-message,.practice-layout>*,.closing-intro,.closing-order,.closing-bottom').forEach((el,i)=>reveal(el,start+220+i*90,18,650));
    }

    if (snapshot?.selected) {
      const target = scene.querySelector(`[data-select="${snapshot.selected.index}"] .tool-name`);
      reveal(target,300,0,420);
    }
  }

  function details(root) {
    clear('detail');
    root.querySelectorAll('h3, #package-purpose, .filename, #step-body, .example').forEach((el,i) => {
      reveal(el,i*35,10,360,'detail');
    });
  }

  reduced.addEventListener('change',() => { if(reduced.matches) clear(); });
  window.addEventListener('pagehide',() => clear());
  return {capture,enter,details,clear};
})();
