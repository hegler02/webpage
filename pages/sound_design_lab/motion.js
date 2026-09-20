/* One GSAP context owns all transient transforms; DOM navigation belongs to the host. */
export const MOTION = Object.freeze({
  exit: 0.42, camera: 0.9, type: 1.12, glyph: 0.72, module: 0.88,
  wire: 0.95, stagger: 0.09, glyphStagger: 0.055, entry: 0.18,
  typeStart: 0.16, bodyStart: 0.54, displayStart: 0.32, wireStart: 0.78,
  travel: 160, splitTravel: 320, typeScale: 2.3, cameraScale: 0.92,
  ease: 'power3.out', typeEase: 'expo.out',
});
export function createMotion(stage) {
  let context = null;
  let serial = 0;
  const gsap = window.gsap;
  function stop() {
    serial += 1;
    if (context) { context.revert(); context = null; }
    stage.querySelector('.motion-layer').replaceChildren();
  }
  function play(from, to, direction, reduced, onDone) {
    stop();
    if (!gsap || reduced) { onDone(); return; }
    const generation = serial;
    const kind = to.dataset.kind;
    const m = MOTION;
    const modules = [...to.querySelectorAll('[data-assemble]')];
    const keyword = to.querySelector('[data-keyword]');
    const glyphs = [...keyword.querySelectorAll('.glyph')];
    const stageBox = stage.getBoundingClientRect();
    const scale = stageBox.width / stage.offsetWidth;
    const keyBox = keyword.getBoundingClientRect();
    const typeX = (stageBox.left + stageBox.width / 2 - (keyBox.left + keyBox.width / 2)) / scale;
    const typeY = stage.offsetHeight * 0.36 - (keyBox.top - stageBox.top + keyBox.height / 2) / scale;
    const finish = () => {
      if (generation !== serial) return;
      const active = context;
      context = null;
      active?.revert();
      onDone();
    };
    context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: m.ease }, onComplete: finish });
      if (from && from !== to) timeline.to(from, {
        opacity: 0, x: -direction * m.travel, scale: 1.04, duration: m.exit,
      }, 0);
      timeline.fromTo(to, { opacity: 0 }, { opacity: 1, duration: m.entry }, 0);
      timeline.fromTo(to.querySelector('.scene-body'), {
        scale: ['statement', 'hero', 'system'].includes(kind) ? m.cameraScale : 1,
        transformOrigin: '50% 50%',
      }, { scale: 1, duration: m.camera }, m.entry);
      timeline.fromTo(to.querySelector('.scene-meta'), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: m.exit }, m.entry);
      timeline.fromTo(keyword, {
        scale: m.typeScale, x: typeX, y: typeY, fontWeight: 280,
      }, { scale: 1, x: 0, y: 0, fontWeight: 820, duration: m.type, ease: m.typeEase }, m.typeStart);
      timeline.fromTo(glyphs, {
        yPercent: 95, rotateX: -75, opacity: 0, transformPerspective: 900,
      }, { yPercent: 0, rotateX: 0, opacity: 1, stagger: m.glyphStagger, duration: m.glyph }, m.typeStart);
      timeline.fromTo(to.querySelector('.scene-note'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: m.exit }, m.bodyStart + m.module);

      if (kind === 'signals') {
        const row = to.querySelector('.signal-row');
        timeline.fromTo(row.children, {
          x: i => (1.5 - i) * m.splitTravel, y: -110, scale: 0.55, opacity: 0,
        }, { x: 0, y: 0, scale: 1, opacity: 1, stagger: m.stagger, duration: m.module }, m.bodyStart);
        timeline.fromTo(to.querySelector('.request-label'), { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: m.module }, m.entry);
      } else if (kind === 'system') {
        timeline.fromTo(to.querySelector('.circuit-core'), { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: m.module }, m.bodyStart);
        timeline.fromTo(to.querySelectorAll('.circuit-node.input'), { x: -m.splitTravel, opacity: 0 }, { x: 0, opacity: 1, stagger: m.stagger, duration: m.module }, m.bodyStart);
        timeline.fromTo(to.querySelectorAll('.circuit-node.output'), { x: m.splitTravel, opacity: 0 }, { x: 0, opacity: 1, stagger: m.stagger, duration: m.module }, m.wireStart);
      } else if (kind === 'core') {
        timeline.fromTo(modules, { scale: i => i ? 0.7 : 1.5, x: i => i ? m.travel : -m.travel, opacity: 0 },
          { scale: 1, x: 0, opacity: 1, stagger: m.stagger, duration: m.module }, m.bodyStart);
      } else if (kind === 'final') {
        timeline.fromTo(modules, { x: i => (i % 3 - 1) * m.splitTravel, y: i => (Math.floor(i / 3) - 1) * m.travel, scale: 0.75, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, stagger: m.stagger / 2, duration: m.module }, m.bodyStart);
      } else if (kind === 'workshop') {
        timeline.fromTo(modules, { x: i => i ? m.travel : -m.travel, opacity: 0 }, { x: 0, opacity: 1, duration: m.module, stagger: m.stagger }, m.bodyStart);
        timeline.fromTo(to.querySelectorAll('.field'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: m.stagger, duration: m.exit }, m.wireStart);
      } else {
        timeline.fromTo(modules, {
          y: ['brief', 'qa', 'rubric'].includes(kind) ? 42 : m.travel,
          x: i => ['compare', 'decode', 'lenses'].includes(kind) ? (i % 2 ? m.travel : -m.travel) : 0,
          rotation: ['contract', 'minimum', 'transfer'].includes(kind) ? -5 : 0,
          opacity: 0,
        }, { y: 0, x: 0, rotation: 0, opacity: 1, stagger: m.stagger, duration: m.module }, m.bodyStart);
      }
      const displayGlyphs = to.querySelectorAll('.display-glyph');
      if (displayGlyphs.length) timeline.fromTo(displayGlyphs, {
        yPercent: 125, scale: 0.35, rotation: 12, opacity: 0,
      }, { yPercent: 0, scale: 1, rotation: 0, opacity: 1, stagger: m.glyphStagger, duration: m.type, ease: m.typeEase }, m.displayStart);
      const wires = to.querySelectorAll('.wire');
      if (wires.length) timeline.fromTo(wires, { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, stagger: m.glyphStagger, duration: m.wire }, m.wireStart);
    }, stage);
  }
  return { play, stop, available: Boolean(gsap) };
}
