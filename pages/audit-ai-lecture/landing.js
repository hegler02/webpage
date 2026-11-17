"use strict";
/* 스크롤텔링: 고정 무대의 진행도(--p)와 단계(data-step)를 스크롤 위치에서만 계산한다.
   마우스 위치는 쓰지 않는다. 스크립트가 없거나 움직임 줄이기를 켜면 모든 내용이 그대로 보인다. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const scenes = [...document.querySelectorAll("[data-scene]")].map((el) => ({
    el,
    steps: [...el.querySelectorAll("[data-step]")].sort((a, b) => a.dataset.step - b.dataset.step),
  }));
  const STEP_SPAN = 0.85; // 단계는 진행도의 앞 85% 안에서 모두 켜진다

  function paint() {
    const vh = innerHeight;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      const room = Math.max(1, r.height - vh);
      const p = reduce.matches ? 1 : Math.min(1, Math.max(0, -r.top / room));
      s.el.style.setProperty("--p", p.toFixed(3));
      // 늦게 출발해 천천히 빠져나가는 진행도: 앞 15%는 머물고, 그 뒤는 제곱으로 가속
      const q = Math.min(1, Math.max(0, (p - 0.15) / 0.8));
      s.el.style.setProperty("--q", (q * q).toFixed(3));
      const n = s.steps.length;
      s.steps.forEach((el, i) => el.classList.toggle("is-on", reduce.matches || p >= (i / n) * STEP_SPAN));
    }
  }
  let queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; paint(); });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  reduce.addEventListener?.("change", paint);
  paint();

  // 띠 구간: 화면에 들어오면 왼쪽에서 오른쪽으로 하나씩 켠다
  const groups = document.querySelectorAll("[data-reveal], .motto");
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const items = e.target.matches(".motto") ? e.target.querySelectorAll("[data-reveal-line]") : e.target.children;
      [...items].forEach((el, i) => setTimeout(() => el.classList.add("is-on"), reduce.matches ? 0 : i * 160));
    }
  }, { threshold: 0.25 });
  groups.forEach((g) => io.observe(g));
})();
