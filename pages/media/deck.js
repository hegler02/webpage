"use strict";

const config = window.STORYBOARD_TEMPLATE || { hierarchy: [], slides: [] };
const hierarchy = config.hierarchy || [];
const slides = config.slides || [];

const deck = document.getElementById("deck");
const copyPane = document.getElementById("copyPane");
const mediaFrame = document.getElementById("mediaFrame");
const hierarchyRail = document.getElementById("hierarchyRail");
const timelineTrack = document.getElementById("timelineTrack");
const counter = document.getElementById("counter");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let current = 0;
let lock = false;

const timelineWindow = 9;
document.documentElement.style.setProperty("--slide-count", String(Math.min(Math.max(slides.length, 1), timelineWindow)));

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHierarchy(activeId) {
  hierarchyRail.innerHTML = hierarchy.map((item, index) => `
    <li class="${item.id === activeId ? "active" : ""}" style="--i:${index}">
      <b>${escapeHtml(item.title)}</b>
      <span>${escapeHtml(item.desc)}</span>
    </li>
  `).join("");
}

function renderTimeline() {
  const start = Math.min(
    Math.max(current - Math.floor(timelineWindow / 2), 0),
    Math.max(slides.length - timelineWindow, 0)
  );
  const visibleSlides = slides.slice(start, start + timelineWindow);
  document.documentElement.style.setProperty("--slide-count", String(Math.max(visibleSlides.length, 1)));
  timelineTrack.innerHTML = visibleSlides.map((slide, offset) => {
    const index = start + offset;
    return `
    <button class="timeline-item ${index === current ? "active" : ""}" type="button" data-index="${index}" style="--i:${offset}">
      ${escapeHtml(slide.timeline || slide.chapter)}
      <small>${String(index + 1).padStart(2, "0")}</small>
    </button>
  `;
  }).join("");
}

function renderCopy(slide) {
  const points = (slide.points || []).map(([key, value], index) => `
    <div class="point reveal" style="--i:${index + 3}"><b>${escapeHtml(key)}</b><span>${escapeHtml(value)}</span></div>
  `).join("");
  copyPane.innerHTML = `
    <div class="kicker reveal" style="--i:0">${escapeHtml(slide.chapter)}</div>
    <h1 class="reveal" style="--i:1">${escapeHtml(slide.title).replace(/\\n/g, "<br />")}</h1>
    <p class="lead reveal" style="--i:2">${escapeHtml(slide.lead)}</p>
    <div class="point-list">${points}</div>
  `;
}

function renderMedia(slide) {
  const media = slide.media || { mode: "map", title: "Media" };
  const panels = media.panels || [];
  let inner = "";

  if (media.mode === "map") {
    inner = `
      <div class="map-stack">
        ${hierarchy.map((item, index) => `
          <div class="map-row" style="--i:${index}"><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.desc)}</span></div>
        `).join("")}
      </div>
    `;
  } else if (media.mode === "appendix") {
    inner = `
      <figure class="appendix-visual">
        <img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || media.title)}" loading="lazy" />
      </figure>
    `;
  } else if (media.mode === "links") {
    inner = `
      <div class="agent-grid">
        ${(media.links || []).map((link, index) => `
          <a class="agent-card" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer" style="--i:${index}">
            <b>${escapeHtml(link.title)}</b>
            <span>${escapeHtml(link.desc)}</span>
          </a>
        `).join("")}
      </div>
    `;
  } else if (media.mode === "table") {
    inner = `
      <div class="matrix-visual">
        ${(media.rows || []).map((row, index) => `
          <div class="matrix-row" style="--i:${index}">
            <b>${escapeHtml(row[0])}</b>
            <span>${escapeHtml(row[1])}</span>
            <em>${escapeHtml(row[2])}</em>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    inner = `
      <div class="frame-grid ${escapeHtml(media.mode)}">
        ${panels.map((label, index) => `<div class="panel" data-label="${escapeHtml(label)}" style="--i:${index}"></div>`).join("")}
      </div>
    `;
  }

  mediaFrame.innerHTML = `
    <div class="media-title" style="--i:0">${escapeHtml(media.title)}</div>
    <div class="media-inner">${inner}</div>
  `;
}

function applySlide(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  const slide = slides[current];
  document.documentElement.style.setProperty("--accent", slide.accent || "#ffb85c");
  counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  deck.classList.remove("is-revealing");
  deck.classList.toggle("is-appendix", slide.media && slide.media.mode === "appendix");
  renderHierarchy(slide.step);
  renderCopy(slide);
  renderMedia(slide);
  renderTimeline();
  void deck.offsetWidth;
  deck.classList.add("is-revealing");
}

function goTo(index) {
  if (lock) return;
  const next = Math.max(0, Math.min(slides.length - 1, index));
  if (next === current) return;
  lock = true;
  deck.classList.add("is-changing");
  applySlide(next);
  window.setTimeout(() => {
    deck.classList.remove("is-changing");
    lock = false;
  }, 540);
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

timelineTrack.addEventListener("click", (event) => {
  const button = event.target.closest(".timeline-item");
  if (!button) return;
  goTo(Number(button.dataset.index));
});

window.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest("button, a, input, textarea, select")) return;
  if (["ArrowRight", "PageDown", " ", "Enter"].includes(event.key)) {
    event.preventDefault();
    next();
  }
  if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
    event.preventDefault();
    prev();
  }
});

let touchStartX = 0;
let touchStartY = 0;

deck.addEventListener("touchstart", (event) => {
  if (!event.touches.length) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

deck.addEventListener("touchend", (event) => {
  if (!event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
    dx < 0 ? next() : prev();
  }
}, { passive: true });

applySlide(0);