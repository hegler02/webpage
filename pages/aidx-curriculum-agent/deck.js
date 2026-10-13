// 학교의 시간, 세상의 시간 — 발표 진행과 장면 전환
// 진행 상태(현재 장)는 이 파일 하나가 소유한다. 장의 최종 상태(보임·숨김·주소·안내)는 먼저 확정하고,
// 애니메이션은 시각 보강만 한다. 새 입력이 오면 진행 중인 애니메이션과 복제 요소를 모두 정리한다.
const stage = document.getElementById("stage");
const slides = [...stage.querySelectorAll(".slide")];
const overlay = document.getElementById("overlay");
const status = document.getElementById("status");
const position = document.getElementById("position");
const bar = document.getElementById("progress-bar");
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SVG = "http://www.w3.org/2000/svg";
const total = slides.length;
let current = 0;
let running = [];

// 고정 시드 난수: 되돌아가도 같은 배치
function seeded(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const el = (tag, attrs = {}, parent = null) => { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (parent) parent.append(n); return n; };

// ---- 장면 재료 만들기 ----
// 1장: 빠른 시계의 촘촘한 눈금
{ const g = document.getElementById("fast-ticks"); for (let i = 0; i < 60; i += 1) { const a = (i / 60) * Math.PI * 2; el("line", { x1: 100 + Math.sin(a) * 84, y1: 100 - Math.cos(a) * 84, x2: 100 + Math.sin(a) * (i % 5 ? 78 : 70), y2: 100 - Math.cos(a) * (i % 5 ? 78 : 70) }, g); } }
// 2장: 학교의 해 눈금과 세상의 날 눈금
{ const years = document.getElementById("tl-years"); const yearsList = [2023, 2024, 2025, 2026];
  yearsList.forEach((y, i) => { const x = 160 + i * 440; el("line", { x1: x, y1: 74, x2: x, y2: 106, class: "tick" }, years); const t = el("text", { x, y: 140 }, years); t.textContent = `${y}`; });
  const days = document.getElementById("tl-days"); const rnd = seeded(7);
  for (let x = 70; x < 1550; x += 9 + Math.floor(rnd() * 6)) el("line", { x1: x, y1: 254, x2: x, y2: 286 - rnd() * 8, class: "tick" }, days); }
// 4장: 6축 × 역량 그물
const net = document.getElementById("net");
const AXES = ["정부·정책", "교육부", "지역·산업", "학교·학과", "기업·직무", "해외 표준"];
const COMPS = 8;
const netGeom = { x0: 230, x1: 960, y0: 70, y1: 560 };
{ const { x0, x1, y0, y1 } = netGeom; const dx = (x1 - x0) / (COMPS - 1); const dy = (y1 - y0) / (AXES.length - 1);
  const wefts = el("g", { class: "wefts" }, net); const warps = el("g", { class: "warps" }, net); const nodes = el("g", { class: "nodes" }, net);
  AXES.forEach((name, r) => { const y = y0 + r * dy; el("line", { x1: x0 - 30, y1: y, x2: x1 + 30, y2: y, class: "weft draw", pathLength: 1 }, wefts); const t = el("text", { x: x0 - 46, y: y + 8, class: "axis-label" }, wefts); t.textContent = name; });
  for (let c = 0; c < COMPS; c += 1) { const x = x0 + c * dx; el("line", { x1: x, y1: y0 - 30, x2: x, y2: y1 + 30, class: "warp draw", pathLength: 1 }, warps); const t = el("text", { x, y: y1 + 64, class: "comp-label" }, warps); t.textContent = `역량 ${c + 1}`; }
  // 교차점 무늬: 받쳐진 곳(흰 점)과 빈 곳(금빛 고리) — 개념 예시
  const pattern = ["110101110", "011110101", "101011011", "111001101", "010111110", "100110011"];
  AXES.forEach((_, r) => { for (let c = 0; c < COMPS; c += 1) { const x = x0 + c * dx; const y = y0 + r * dy; const filled = pattern[r][c] === "1";
    if (filled) el("circle", { cx: x, cy: y, r: 9, class: "node pop", "data-order": r * COMPS + c }, nodes);
    else { const g = el("g", { class: "pop", "data-order": r * COMPS + c }, nodes); el("circle", { cx: x, cy: y, r: 22, class: "empty-halo" }, g); const ring = el("circle", { cx: x, cy: y, r: 13, class: "empty" }, g); if (r === 2 && c === 3) ring.id = "gap-cell"; } } }); }
// 10장: 19개 회원대학 × 약 600개 학과 점
const swarm = document.getElementById("swarm");
const SCHOOLS = 19, DEPTS = 596;
const swarmDots = [];
const clusterCenters = [];
{ const rnd = seeded(19); const cx = 960, cy = 490, rx = 720, ry = 150;
  for (let s = 0; s < SCHOOLS; s += 1) { const a = (s / SCHOOLS) * Math.PI * 2 - Math.PI / 2; clusterCenters.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  const links = el("g", { class: "links" }, swarm);
  clusterCenters.forEach(([x, y], i) => { const [nx, ny] = clusterCenters[(i + 1) % SCHOOLS]; el("line", { x1: x, y1: y, x2: nx, y2: ny, class: "draw", pathLength: 1 }, links); if (i % 3 === 0) { const [ox, oy] = clusterCenters[(i + 7) % SCHOOLS]; el("line", { x1: x, y1: y, x2: ox, y2: oy, class: "draw", pathLength: 1 }, links); } });
  const dots = el("g", { class: "dots" }, swarm); const tones = ["", "blue", "teal"];
  for (let d = 0; d < DEPTS; d += 1) { const s = d % SCHOOLS; const k = Math.floor(d / SCHOOLS); const ang = k * 2.399963; const rad = 5.2 * Math.sqrt(k + .5);
    const [ccx, ccy] = clusterCenters[s]; const tx = ccx + Math.cos(ang) * rad; const ty = ccy + Math.sin(ang) * rad;
    const c = el("circle", { cx: tx, cy: ty, r: 3.2, class: tones[s % 3] }, dots); swarmDots.push({ c, sx: rnd() * 1920 - tx, sy: rnd() * 1080 - ty }); } }

// ---- 무대 크기 ----
function fit() { const vw = window.innerWidth, vh = window.innerHeight - 64; const s = Math.min(vw / 1920, vh / 1080); stage.style.transform = `translate(-50%, -50%) scale(${s})`; }
window.addEventListener("resize", fit); fit();

// ---- 애니메이션 도구 ----
const play = (node, frames, opts) => { if (!node?.animate) return null; const a = node.animate(frames, { fill: "backwards", easing: "cubic-bezier(.22, 1, .36, 1)", ...opts }); running.push(a); return a; };
function stopAll() { for (const a of running) { try { a.cancel(); } catch { /* already gone */ } } running = []; overlay.replaceChildren(); slides.forEach((s) => s.classList.remove("is-leaving")); }
const ENTER = {
  rise: [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  "slide-l": [{ opacity: 0, transform: "translateX(-60px)" }, { opacity: 1, transform: "none" }],
  "slide-r": [{ opacity: 0, transform: "translateX(60px)" }, { opacity: 1, transform: "none" }],
  pop: [{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "none" }],
  merge: [{ opacity: 0, transform: "translateY(-24px) scale(.96)" }, { opacity: 1, transform: "none" }],
  sweep: [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
  grow: [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }]
};
function enter(slide, base = 0) {
  if (reduced()) return;
  slide.querySelectorAll("[data-enter]").forEach((node) => {
    const kind = node.dataset.enter; const delay = base + Number(node.dataset.delay || 0);
    if (kind === "gap") { play(node, ENTER.fade, { duration: 500, delay }); play(node.querySelector(".gap-band"), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 900, delay }); return; }
    if (kind === "water") { play(node.querySelector("span"), [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1100, delay }); play(node, ENTER.fade, { duration: 600, delay }); return; }
    play(node, ENTER[kind] || ENTER.fade, { duration: kind === "pop" ? 650 : kind === "sweep" ? 1100 : 750, delay, easing: kind === "pop" ? "cubic-bezier(.34, 1.56, .64, 1)" : undefined });
  });
  // 선 긋기: 그려지는 순서대로
  [...slide.querySelectorAll(".draw")].forEach((line, i) => play(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: base + 200 + i * 70, easing: "cubic-bezier(.65, 0, .35, 1)" }));
  // 그물 교차점: 선이 다 그어진 뒤 차례로
  slide.querySelectorAll(".pop[data-order]").forEach((node) => play(node, [{ opacity: 0, transform: "scale(.2)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: base + 1250 + Number(node.dataset.order) * 9, easing: "cubic-bezier(.34, 1.56, .64, 1)" }));
  if (slide.classList.contains("s-vision")) swarmIn(base);
}
function swarmIn(base) {
  for (const { c, sx, sy } of swarmDots) play(c, [{ transform: `translate(${sx}px, ${sy}px)`, opacity: .35 }, { transform: "none", opacity: 1 }], { duration: 1500, delay: base + 200 + Math.random() * 300, easing: "cubic-bezier(.65, 0, .35, 1)" });
}
const rectIn = (node) => node.getBoundingClientRect();
function ghost(from, styles = {}) { const g = document.createElement("div"); Object.assign(g.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, transformOrigin: "0 0", ...styles }); overlay.append(g); return g; }

// ---- 장면 사이의 연결 (앞 장의 대상이 다음 장의 무엇이 되는가) ----
const LINKS = {
  // 1→2 두 시계가 시간 막대의 출발점이 된다 (매치컷)
  "1>2": (from, to) => {
    const pairs = [["#clock-slow svg", "#tl-school-start", "var(--slow)"], ["#clock-fast svg", "#tl-world-start", "var(--fast)"]];
    for (const [a, b, color] of pairs) { const r0 = rectIn(from.querySelector(a)); const r1 = rectIn(to.querySelector(b)); const g = ghost(r0, { borderRadius: "50%", border: `4px solid ${color}` });
      play(g, [{ transform: "none", opacity: 1 }, { transform: `translate(${r1.left - r0.left}px, ${r1.top - r0.top}px) scale(${r1.width / r0.width})`, opacity: 1, background: color }], { duration: 900, easing: "cubic-bezier(.65, 0, .35, 1)", fill: "forwards" })?.finished.then(() => g.remove()).catch(() => {}); }
    play(from, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
    enter(to, 500);
    return true;
  },
  // 2→3 두 막대 사이의 틈이 격차가 된다
  "2>3": (from, to) => { play(from, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scaleY(.6)" }], { duration: 500, fill: "forwards" }); enter(to, 200); return true; },
  // 4→5 그물의 빈칸 하나로 들어가면 규칙 사슬이 있다 (좌표 확대)
  "4>5": (from, to) => {
    const cell = from.querySelector("#gap-cell"); const chain = to.querySelector("#chain"); if (!cell || !chain) return false;
    const r0 = rectIn(cell); const r1 = rectIn(chain); const g = ghost(r0, { borderRadius: "50%", border: "3px solid var(--gold)", background: "rgba(240, 211, 140, .12)" });
    // 그물은 빈칸을 기준으로 커진다: 화면 가운데가 아니라 그 빈칸 안으로 들어간다
    const box = stage.getBoundingClientRect(); const k = box.width / 1920; const ox = (r0.left + r0.width / 2 - box.left) / k; const oy = (r0.top + r0.height / 2 - box.top) / k;
    play(from, [{ opacity: 1, transform: "none", transformOrigin: `${ox}px ${oy}px` }, { opacity: 0, transform: "scale(2.2)", transformOrigin: `${ox}px ${oy}px` }], { duration: 800, fill: "forwards", easing: "cubic-bezier(.65, 0, .35, 1)" });
    play(g, [{ left: `${r0.left}px`, top: `${r0.top}px`, width: `${r0.width}px`, height: `${r0.height}px`, borderRadius: "50%" }, { left: `${r1.left}px`, top: `${r1.top}px`, width: `${r1.width}px`, height: `${r1.height}px`, borderRadius: "18px", opacity: 1 }, { left: `${r1.left}px`, top: `${r1.top}px`, width: `${r1.width}px`, height: `${r1.height}px`, borderRadius: "18px", opacity: 0 }], { duration: 1300, easing: "cubic-bezier(.65, 0, .35, 1)", fill: "forwards" })?.finished.then(() => g.remove()).catch(() => {});
    enter(to, 700);
    return true;
  },
  // 6→7 수면 선이 화면을 가른다
  "6>7": (from, to) => { play(from, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-80px)" }], { duration: 600, fill: "forwards" }); enter(to, 150); return true; }
};

// ---- 이동 ----
function commit(index) {
  slides.forEach((s, i) => { const on = i === index; s.classList.toggle("is-active", on); s.setAttribute("aria-hidden", on ? "false" : "true"); s.inert = !on; });
  current = index;
  position.textContent = `${String(index + 1).padStart(2, "0")} / ${total}`;
  bar.style.width = `${((index + 1) / total) * 100}%`;
  status.textContent = slides[index].getAttribute("aria-label") || "";
  try { history.replaceState(null, "", `#${index + 1}`); } catch { /* 주소 갱신 차단: 진행은 계속 */ }
}
function go(index) {
  if (index < 0 || index >= total || index === current) return;
  const fromIndex = current; const from = slides[fromIndex]; const to = slides[index]; const forward = index > fromIndex;
  stopAll();
  commit(index);
  if (reduced()) return;
  from.classList.add("is-leaving");
  // 이웃한 다음 장으로 갈 때만 장면 연결을 쓴다; 되돌아가거나 건너뛸 때는 단순 이동
  const link = index === fromIndex + 1 ? LINKS[`${fromIndex + 1}>${index + 1}`] : null;
  if (!(link && link(from, to))) {
    play(from, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${forward ? -40 : 40}px)` }], { duration: 450, fill: "forwards" });
    play(to, [{ opacity: 0, transform: `translateX(${forward ? 40 : -40}px)` }, { opacity: 1, transform: "none" }], { duration: 550, delay: 120 });
    enter(to, 200);
  }
  const done = running.filter((a) => a.effect?.target === from);
  Promise.allSettled(done.map((a) => a.finished)).then(() => from.classList.remove("is-leaving"));
}
const next = () => go(current + 1);
const prev = () => go(current - 1);
document.getElementById("next").addEventListener("click", next);
document.getElementById("prev").addEventListener("click", prev);
document.getElementById("full").addEventListener("click", () => { const d = document.documentElement; (document.fullscreenElement ? document.exitFullscreen() : d.requestFullscreen?.())?.catch?.(() => {}); });
window.addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
  else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); prev(); }
  else if (e.key === "Home") { e.preventDefault(); go(0); }
  else if (e.key === "End") { e.preventDefault(); go(total - 1); }
  else if (e.key === "f" || e.key === "F") document.getElementById("full").click();
});
let downX = null;
stage.addEventListener("pointerdown", (e) => { downX = e.clientX; });
stage.addEventListener("pointerup", (e) => { if (downX == null) return; const dx = e.clientX - downX; downX = null; if (Math.abs(dx) > 50) (dx < 0 ? next : prev)(); });

// ---- 시작 ----
const start = Math.min(Math.max(parseInt(location.hash.slice(1), 10) || 1, 1), total) - 1;
commit(start);
document.fonts?.ready.then(() => enter(slides[start])).catch(() => enter(slides[start]));
window.__deck = { go, get current() { return current; } };
