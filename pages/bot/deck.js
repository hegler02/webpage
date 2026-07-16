"use strict";

const slides = window.KNOWLEDGE_BLOCK_SLIDES || [];
document.documentElement.style.setProperty("--slide-count", String(Math.max(slides.length, 1)));

const deck = document.getElementById("deck");
const copy = document.getElementById("copy");
const bricks = document.getElementById("bricks");
const pageNumber = document.getElementById("pageNumber");
const chapterLabel = document.getElementById("chapterLabel");
const sideTitle = document.getElementById("sideTitle");
const progress = document.getElementById("progress");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const brickEls = new Map();
let current = 0;
let locked = false;
let queuedIndex = null;
let transitionTimer = null;
let flashTimer = null;
let touchStartX = 0;
let touchStartY = 0;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function multiline(value) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function readCssTime(token) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);
  if (!raw || !Number.isFinite(value)) {
    throw new Error("Required motion token is missing: " + token);
  }
  return raw.endsWith("s") && !raw.endsWith("ms") ? value * 1000 : value;
}

function readCssNumber(token) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);
  if (!raw || !Number.isFinite(value)) {
    throw new Error("Required numeric token is missing: " + token);
  }
  return value;
}

function brickTone(tone, layer) {
  return `var(--kb-brick-${tone}-${layer})`;
}

function accentValue(accent) {
  return String(accent).startsWith("#") ? accent : brickTone(accent, "top");
}

function normalizeBrickSpec(spec) {
  if (!Array.isArray(spec)) return spec;
  const [x, y, z, width, label, tone, rotation] = spec;
  return { x, y, z, width, label, tone, rotation };
}

function makeCopy(slide, index) {
  const rows = (slide.rows || []).map(([key, value]) => `
    <div class="mini-row"><b>${escapeHtml(key)}</b><span>${escapeHtml(value)}</span></div>
  `).join("");
  const links = (slide.links || []).map((link) => `
    <a class="slide-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener">
      <span>${escapeHtml(link.label)}</span>
      <small>${escapeHtml(link.note || "새 창으로 열기")}</small>
    </a>
  `).join("");
  const article = document.createElement("article");
  article.className = `slide-copy${slide.linkLayout === "grid" ? " has-link-grid" : ""}`;
  article.style.setProperty("--accent", accentValue(slide.accent));
  article.innerHTML = `
    <div class="label">${escapeHtml(slide.label)}</div>
    <h${index === 0 ? "1" : "2"}>${multiline(slide.title)}</h${index === 0 ? "1" : "2"}>
    <p class="lead">${escapeHtml(slide.lead)}</p>
    ${links ? `<div class="slide-links">${links}</div>` : ""}
    <div class="mini">${rows}</div>
  `;
  return article;
}

function ensureBricks() {
  if (!slides.length) return;
  Object.keys(slides[0].layout).forEach((id) => {
    if (brickEls.has(id)) return;
    const el = document.createElement("div");
    el.className = "brick";
    el.dataset.id = id;
    el.style.setProperty("--order", String(brickEls.size));
    bricks.appendChild(el);
    brickEls.set(id, el);
  });
}

function applyBrickLayout(slide) {
  const coordinateScale = readCssNumber("--kb-scene-coordinate-scale");
  const widthScale = readCssNumber("--kb-scene-width-scale");
  Object.entries(slide.layout).forEach(([id, rawSpec], order) => {
    const { x, y, z, width, label, tone, rotation } = normalizeBrickSpec(rawSpec);
    const el = brickEls.get(id);
    if (!el) return;
    el.dataset.label = label;
    el.style.setProperty("--x", `${x * coordinateScale}px`);
    el.style.setProperty("--y", `${y * coordinateScale}px`);
    el.style.setProperty("--z", `${z * coordinateScale}px`);
    el.style.setProperty("--w", `${width * widthScale}px`);
    el.style.setProperty("--rot", `${rotation}deg`);
    el.style.setProperty("--c1", brickTone(tone, "top"));
    el.style.setProperty("--c2", brickTone(tone, "mid"));
    el.style.setProperty("--side", brickTone(tone, "side"));
    el.style.setProperty("--order", String(order));
    el.classList.remove("ghost");
  });
}

function applySlideMeta(slide, index) {
  const accent = accentValue(slide.accent);
  document.documentElement.style.setProperty("--accent", accent);
  deck.classList.toggle("hide-bricks", slide.hideBricks === true);
  chapterLabel.textContent = slide.chapter;
  sideTitle.textContent = slide.side;
  pageNumber.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  progress.style.transform = `scaleX(${index + 1})`;
  progress.style.backgroundColor = accent;
}

function renderInitial() {
  if (!slides.length) {
    pageNumber.textContent = "00 / 00";
    return;
  }
  ensureBricks();
  slides.forEach((slide, index) => copy.appendChild(makeCopy(slide, index)));
  copy.children[0].classList.add("active");
  applySlideMeta(slides[0], 0);
  applyBrickLayout(slides[0]);
}

function flash(direction) {
  deck.classList.remove("flash-next", "flash-prev");
  void deck.offsetWidth;
  deck.classList.add(direction === "prev" ? "flash-prev" : "flash-next");
  window.clearTimeout(flashTimer);
  const duration = readCssTime("--kb-motion-flash-class");
  flashTimer = window.setTimeout(() => deck.classList.remove("flash-next", "flash-prev"), duration);
}

function clampIndex(index) {
  return Math.max(0, Math.min(slides.length - 1, index));
}

function goTo(requestedIndex) {
  const direction = requestedIndex < current ? "prev" : "next";
  const nextIndex = clampIndex(requestedIndex);
  if (nextIndex === current) {
    flash(direction);
    return;
  }
  if (locked) {
    queuedIndex = nextIndex;
    flash(direction);
    return;
  }

  locked = true;
  const previous = current;
  current = nextIndex;
  flash(direction);
  deck.classList.add("is-changing");

  const prevCopy = copy.children[previous];
  const nextCopy = copy.children[nextIndex];
  prevCopy.classList.remove("active");
  prevCopy.classList.add("exiting");
  nextCopy.classList.add("active");

  applySlideMeta(slides[nextIndex], nextIndex);
  applyBrickLayout(slides[nextIndex]);

  const settle = () => {
    prevCopy.classList.remove("exiting");
    deck.classList.remove("is-changing");
    locked = false;
    if (queuedIndex !== null && queuedIndex !== current) {
      const target = queuedIndex;
      queuedIndex = null;
      goTo(target);
      return;
    }
    queuedIndex = null;
  };

  window.clearTimeout(transitionTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    settle();
    return;
  }
  transitionTimer = window.setTimeout(settle, readCssTime("--kb-motion-scene-lock"));
}

function next() {
  goTo(current + 1);
}

function prev() {
  goTo(current - 1);
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

window.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest("a, button, input, textarea, select")) return;
  if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(event.key)) {
    event.preventDefault();
    next();
  }
  if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(event.key)) {
    event.preventDefault();
    prev();
  }
});

window.addEventListener("resize", () => {
  if (slides[current]) applyBrickLayout(slides[current]);
});

window.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

window.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  const threshold = readCssNumber("--kb-interaction-swipe-threshold");
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return;
  dx < 0 ? next() : prev();
}, { passive: true });

renderInitial();