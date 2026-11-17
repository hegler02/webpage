/* 트랜지션 디렉터
 * 장 전환과 장 안의 단계(step)를 한 곳에서 지휘한다.
 *
 * 장 전환(page-wave): 새 장이 종이 한 장처럼 옆에서 들어와 이전 장을 덮는다.
 *   이전 장은 끝까지 화면에 남아 살짝 뒤로 밀리고 어두워진다. 그래서 빈 바탕이 드러나는 순간이 없다.
 *   새 장의 글과 틀은 장과 함께 한 덩어리로 들어온다(개별로 떠오르지 않는다).
 * 국면: prepare → veil(덮기) → reveal-structure(정착) → reveal-message(도장·형광펜·화살표) → settle
 * 완료 판정: Web Animations의 finished(명시적 상태 신호). 보조 타이머는 예정 시간이 모두 지난 뒤에만
 *   남은 애니메이션을 finish()시키고 그 finished를 다시 기다린다. 타이머가 완료를 먼저 확정하지 않는다.
 * 감소 모션: 같은 국면 순서로 상태만 바꾸고 이동·잔상을 쓰지 않는다.
 */
(() => {
  'use strict';
  const css = getComputedStyle(document.documentElement);
  const num = (name) => parseFloat(css.getPropertyValue(name)) || 0;
  const raw = (name) => css.getPropertyValue(name).trim();
  const T = {
    page: num('--m-page'), parallax: num('--m-page-parallax'), dim: num('--m-page-dim') || 1,
    message: num('--m-message'), stamp: num('--m-stamp'), mark: num('--m-mark'), structure: num('--m-structure'),
    stagger: num('--m-stagger'), pad: num('--m-fallback-pad'),
    out: raw('--m-ease-out'), page_ease: raw('--m-ease-page'), stampEase: raw('--m-ease-stamp'), tilt: raw('--seal-tilt'),
    shadow: raw('--shadow-page')
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = [];
  let generation = 0;

  function signal(slide, phase) {
    if (slide) slide.dataset.phase = phase;
    document.dispatchEvent(new CustomEvent('director:phase', { detail: { phase, slide: slide?.id } }));
  }
  function play(el, keyframes, options) {
    if (!el || typeof el.animate !== 'function') return null;
    const a = el.animate(keyframes, { fill: 'both', ...options });
    running.push(a);
    return a;
  }
  async function settleAll(list, plannedMs) {
    const live = list.filter(Boolean);
    if (!live.length) return;
    let timer;
    const fallback = new Promise((resolve) => { timer = setTimeout(() => { live.forEach((a) => { try { a.finish(); } catch (_) {} }); resolve(); }, plannedMs + T.pad); });
    await Promise.race([Promise.allSettled(live.map((a) => a.finished)), fallback]);
    clearTimeout(timer);
    await Promise.allSettled(live.map((a) => a.finished));
  }
  function cleanup(list) { list.forEach((a) => { try { a?.cancel(); } catch (_) {} }); }

  /* 의미가 있는 움직임만: 도장, 형광펜, 화살표 그리기, 줄 긋기, 메모 나타남 */
  function motionFor(el, kind, delay) {
    switch (kind) {
      case 'stamp':
        return [play(el, [
          { opacity: 0, transform: `rotate(${T.tilt}) scale(1.6)` },
          { opacity: 1, transform: `rotate(${T.tilt}) scale(.95)`, offset: .7 },
          { opacity: 1, transform: `rotate(${T.tilt}) scale(1)` }
        ], { duration: T.stamp, delay, easing: T.stampEase }), T.stamp + delay];
      case 'mark': {
        const ink = el.querySelector('.ink') || el;
        return [play(ink, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: T.mark, delay, easing: T.out }), T.mark + delay];
      }
      case 'draw': {
        const paths = [...el.querySelectorAll('[data-draw]')];
        return [paths.map((p, i) => play(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: T.message, delay: delay + i * T.stagger, easing: T.out })), T.message + delay + paths.length * T.stagger];
      }
      case 'check': {
        const path = el.querySelector('[data-draw]');
        return [play(path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: T.mark, delay, easing: T.out }), T.mark + delay];
      }
      case 'strike': {
        const line = el.querySelector('.strike-line');
        return [play(line, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: T.mark, delay, easing: T.out }), T.mark + delay];
      }
      case 'fade':
        return [play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: T.structure, delay, easing: T.out }), T.structure + delay];
      default: // 'rise', 'none' 등: 장과 함께 이미 들어와 있으므로 따로 움직이지 않는다
        return [null, 0];
    }
  }
  async function revealGroup(nodes) {
    const anims = []; let planned = 0; let k = 0;
    nodes.forEach((el) => {
      const [a, end] = motionFor(el, el.dataset.motion || 'rise', k * T.stagger * 2);
      if (a) { anims.push(...[].concat(a)); k += 1; }
      planned = Math.max(planned, end);
    });
    await settleAll(anims, planned);
    cleanup(anims);
  }

  /* ── 장 넘김 5종 ───────────────────────────────────────────
   * 디렉터는 장과 장의 관계를 보고 하나를 고른다(choose).
   *   부가 바뀜            → impact  : 인주색 띠가 왼→오로 가로지르며 새 부 이름을 보여 준다
   *   그림 장면 앞뒤       → gallery : 확대·흐림으로 녹아 사라지고 종이빛이 한 번 스친다
   *   새 사례가 시작됨     → wipe    : 사선 클립이 왼→오로 걷히며 장막과 빛줄기가 지나간다
   *   같은 사례가 이어짐   → story   : 빨간 실선이 왼→오로 지나가며 다음 장을 연다(머리는 그대로인 느낌)
   *   같은 부의 새 주제    → lift    : 종이 한 장이 오른쪽으로 들려 넘어간다
   * direction 1(다음)은 왼→오, -1(이전)은 오→왼. 나가는 장은 위, 들어오는 장은 처음부터 제자리 아래.
   */
  const fx = (name) => document.querySelector(`.fx .fx-${name}`);
  const W = () => num('--stage-w');
  const k = {
    wipe: num('--m-wipe'), lift: num('--m-lift'), story: num('--m-story'), gallery: num('--m-gallery'), impact: num('--m-impact'),
    shift: num('--m-fx-shift'), skew: num('--m-fx-skew'), scale: num('--m-fx-scale') || 1, blur: num('--m-fx-blur'), tilt: num('--m-fx-tilt'), depth: num('--m-fx-depth'),
    turn: raw('--m-ease-turn'), enter: raw('--m-ease-enter')
  };
  const settleIn = (to, duration, amount = 1) => play(to, [
    { transform: `scale(${1 + (k.scale - 1) * amount})`, filter: `blur(${k.blur * amount}px)` },
    { transform: 'scale(1)', filter: 'blur(0px)' }
  ], { duration, easing: k.enter });
  const TURNS = {
    wipe(from, to, d) {
      const w = W();
      return [[
        play(from, [
          { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', transform: 'translateX(0)' },
          { clipPath: d > 0 ? 'polygon(100% 0,100% 0,100% 100%,88% 100%)' : 'polygon(0 0,0 0,12% 100%,0 100%)', transform: `translateX(${d * k.shift}px)` }
        ], { duration: k.wipe, easing: k.turn }),
        play(fx('veil'), [
          { opacity: 0, transform: `translateX(${d > 0 ? -0.4 * w : 1.1 * w}px) skewX(${-k.skew}deg)` },
          { opacity: 0.95, offset: 0.38 },
          { opacity: 0, transform: `translateX(${d > 0 ? 1.1 * w : -0.4 * w}px) skewX(${-k.skew}deg)` }
        ], { duration: k.wipe, easing: k.turn }),
        play(fx('thread'), [
          { opacity: 0, transform: `translateX(${d > 0 ? -0.1 * w : 1.1 * w}px) skewX(${-k.skew}deg)` },
          { opacity: 1, offset: 0.44 },
          { opacity: 0, transform: `translateX(${d > 0 ? 1.1 * w : -0.1 * w}px) skewX(${-k.skew}deg)` }
        ], { duration: k.wipe, easing: k.turn }),
        settleIn(to, k.wipe, 0.6)
      ], k.wipe];
    },
    lift(from, to, d) {
      const w = W();
      const origin = d > 0 ? 'right center' : 'left center';
      return [[
        play(from, [
          { transformOrigin: origin, transform: `perspective(${k.depth}px) translateX(0) rotateY(0deg)`, boxShadow: T.shadow, opacity: 1 },
          { transformOrigin: origin, transform: `perspective(${k.depth}px) translateX(${d * w * 0.55}px) rotateY(${-d * k.tilt}deg)`, boxShadow: T.shadow, opacity: 1, offset: 0.78 },
          { transformOrigin: origin, transform: `perspective(${k.depth}px) translateX(${d * w * 0.8}px) rotateY(${-d * k.tilt * 1.4}deg)`, boxShadow: T.shadow, opacity: 0 }
        ], { duration: k.lift, easing: k.turn }),
        settleIn(to, k.lift, 0.35)
      ], k.lift];
    },
    story(from, to, d) {
      const w = W();
      return [[
        play(from, [
          { clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' },
          { clipPath: d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', transform: `translateX(${d * k.shift * 0.5}px)` }
        ], { duration: k.story, easing: k.turn }),
        play(fx('thread'), [
          { opacity: 0, transform: `translateX(${d > 0 ? 0 : w}px)` },
          { opacity: 1, offset: 0.08 },
          { opacity: 1, offset: 0.9 },
          { opacity: 0, transform: `translateX(${d > 0 ? w : 0}px)` }
        ], { duration: k.story, easing: k.turn })
      ], k.story];
    },
    gallery(from, to, d) {
      return [[
        play(from, [
          { opacity: 1, transform: 'scale(1) translateX(0)', filter: 'blur(0px)' },
          { opacity: 0, transform: `scale(${k.scale}) translateX(${d * k.shift}px)`, filter: `blur(${k.blur}px)` }
        ], { duration: k.gallery, easing: k.turn }),
        play(fx('paper'), [{ opacity: 0 }, { opacity: 0.85, offset: 0.46 }, { opacity: 0.85, offset: 0.54 }, { opacity: 0 }], { duration: k.gallery, easing: k.turn }),
        settleIn(to, k.gallery, 1)
      ], k.gallery];
    },
    impact(from, to, d) {
      const label = fx('label');
      label.textContent = to.dataset.label || '';
      const thin = 'inset(44% 100% 44% 0)', thinR = 'inset(44% 0 44% 100%)';
      const line = 'inset(44% 0 44% 0)', full = 'inset(0 0 0 0)', gone = d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
      return [[
        play(fx('band'), [
          { opacity: 1, clipPath: d > 0 ? thin : thinR },
          { opacity: 1, clipPath: line, offset: 0.26 },
          { opacity: 1, clipPath: full, offset: 0.42 },
          { opacity: 1, clipPath: full, offset: 0.68 },
          { opacity: 1, clipPath: gone }
        ], { duration: k.impact, easing: k.turn }),
        play(label, [
          { opacity: 0, transform: `translateX(${-d * k.shift}px)` },
          { opacity: 0, transform: `translateX(${-d * k.shift}px)`, offset: 0.36 },
          { opacity: 1, transform: 'translateX(0)', offset: 0.48 },
          { opacity: 1, transform: 'translateX(0)', offset: 0.64 },
          { opacity: 0, transform: `translateX(${d * k.shift}px)`, offset: 0.76 },
          { opacity: 0, transform: `translateX(${d * k.shift}px)` }
        ], { duration: k.impact, easing: k.turn }),
        play(from, [{ opacity: 1 }, { opacity: 1, offset: 0.42 }, { opacity: 0, offset: 0.43 }, { opacity: 0 }], { duration: k.impact, easing: 'linear' }),
        settleIn(to, k.impact, 0.4)
      ], k.impact];
    }
  };

  const Director = {
    /** 장과 장의 관계로 넘김 방식을 고른다. 장에 data-transition이 있으면 그것을 따른다. */
    choose(from, to) {
      const a = from.dataset, b = to.dataset;
      if (b.transition && TURNS[b.transition]) return b.transition;
      if (a.part === 'break' || b.part === 'break') return 'gallery';
      if (a.part !== b.part) return 'impact';
      if (a.kind === 'art' || b.kind === 'art') return 'gallery';
      if (b.case && b.case === a.case) return 'story';
      if (a.case !== b.case) return 'wipe';
      return 'lift';
    },
    /** 진행 중인 연출을 즉시 끝 상태로 정착시킨다. */
    finishNow() {
      generation += 1;
      running.forEach((a) => { try { a.finish(); a.cancel(); } catch (_) {} });
      running = [];
      document.querySelectorAll('.is-leaving, .is-entering').forEach((n) => { n.classList.remove('is-leaving', 'is-entering'); if (!n.matches('[data-a11y-active="true"]')) n.hidden = true; });
    },

    /** 장 전환. from은 덮일 장(없을 수 있음), to는 들어올 장. direction: 1 다음, -1 이전. */
    async enter(from, to, direction = 1) {
      this.finishNow();
      const token = generation;
      const alive = () => token === generation;
      const still = reduced() || !from || from === to;

      signal(to, 'prepare');
      to.querySelectorAll('[data-step]').forEach((n) => n.classList.remove('is-on'));
      to.hidden = false;

      signal(to, 'veil');
      if (!still) {
        const variant = this.choose(from, to);
        to.dataset.turn = variant;
        from.hidden = false;
        from.classList.add('is-leaving');
        to.classList.add('is-entering');
        const [anims, planned] = TURNS[variant](from, to, direction);
        await settleAll(anims, planned);
        if (!alive()) return false;
        from.hidden = true;
        from.classList.remove('is-leaving');
        to.classList.remove('is-entering');
        cleanup(anims);
      } else if (from && from !== to) {
        from.hidden = true;
      }
      running = running.filter((a) => a.playState === 'running');

      signal(to, 'reveal-structure');
      if (!alive()) return false;

      signal(to, 'reveal-message');
      if (!reduced()) await revealGroup([...to.querySelectorAll('[data-enter="message"]')]);
      if (!alive()) return false;

      running = [];
      signal(to, 'settle');
      return true;
    },

    /** 장 안의 n번째 단계를 켠다. 같은 번호의 요소는 함께 움직인다. */
    async step(slide, n) {
      const token = ++generation;
      const nodes = [...slide.querySelectorAll(`[data-step="${n}"]`)];
      nodes.forEach((el) => el.classList.add('is-on'));
      signal(slide, 'reveal-message');
      if (!reduced()) {
        const anims = []; let planned = 0;
        nodes.forEach((el, i) => { const [a, end] = motionFor(el, el.dataset.stepMotion || 'fade', i * T.stagger); if (a) anims.push(...[].concat(a)); planned = Math.max(planned, end); });
        await settleAll(anims, planned);
        cleanup(anims);
      }
      if (token !== generation) return false;
      running = [];
      signal(slide, 'settle');
      return true;
    },

    /** n번째 단계를 끈다(되돌리기는 연출 없이). */
    unstep(slide, n) { slide.querySelectorAll(`[data-step="${n}"]`).forEach((el) => el.classList.remove('is-on')); signal(slide, 'settle'); },

    /** 모든 단계를 켠 채로 정착(뒤로 돌아왔을 때). */
    showAll(slide) { slide.querySelectorAll('[data-step]').forEach((el) => el.classList.add('is-on')); }
  };
  window.TransitionDirector = Director;
})();
