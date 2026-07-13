"use strict";

const data = window.EDITORIAL_RUBRIC || { slides: [] };
const presentation = data.presentation || {};
const slides = data.slides || [];
const deck = document.getElementById("deck");
const deckViewport = document.getElementById("deckViewport");
const spread = document.getElementById("spread");
const folio = document.getElementById("folio");
const toc = document.getElementById("toc");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const brand = document.getElementById("brand");
const issue = document.getElementById("issue");
const navigation = document.getElementById("navigation");
let current = 0;
let locked = false;
let stepRows = [];
let stepCursor = 0;

const transitionItemSelector = [
  ".cover-map-core",
  ".cover-map-stage",
  ".cover-map-owner",
  ".question-card",
  ".editorial-card",
  ".chain-chip",
  ".framework-node",
  ".step-row.is-visible",
  ".toolkit-card",
  ".contrast-grid section",
  ".axis-table tr",
  ".checklist-items > div",
  ".depth-level",
  ".assignment-row",
  ".flow-node",
  ".gate-card",
  ".gate-signals > div",
  ".gate-outcomes article",
  ".status-table article",
  ".judge-card",
  ".aggregation-line span",
  ".blueprint-figure",
  ".resource-link",
  ".level-card",
  ".resource-steps span",
  ".manual-list div",
  ".cycle-node",
  ".closing-stage",
  ".closing-owner",
  ".closing-manifesto"
].join(",");

function applyPresentation() {
  document.title = presentation.documentTitle || "Editorial Magazine Deck";
  deck.setAttribute("aria-label", presentation.deckLabel || presentation.documentTitle || document.title);
  brand.textContent = presentation.brand || "";
  issue.textContent = presentation.issue || "";
  toc.setAttribute("aria-label", presentation.tocLabel || "Slide index");
  navigation.setAttribute("aria-label", presentation.navigationLabel || "Slide navigation");
  prevBtn.setAttribute("aria-label", presentation.previousLabel || "Previous slide");
  nextBtn.setAttribute("aria-label", presentation.nextLabel || "Next slide");
}

function readCssValue(token) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (!raw) throw new Error("Required motion token is missing: " + token);
  return raw;
}

function readCssTime(token) {
  const raw = readCssValue(token);
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) throw new Error("Invalid motion time token: " + token);
  return raw.endsWith("s") && !raw.endsWith("ms") ? value * 1000 : value;
}

function readCssNumber(token) {
  const value = Number.parseFloat(readCssValue(token));
  if (!Number.isFinite(value)) throw new Error("Invalid motion number token: " + token);
  return value;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function removeTurnLayer() {
  deck.querySelectorAll(".page-turn-layer").forEach(layer => layer.remove());
}

function markRevealTargets(incoming) {
  const firstStep = incoming.querySelector(".step-row");
  if (firstStep) firstStep.classList.add("is-visible");

  const mark = (elements, kind) => {
    Array.from(elements).forEach((element, order) => {
      if (element.hasAttribute("data-reveal-target")) return;
      element.dataset.revealTarget = "";
      element.dataset.revealKind = kind;
      element.dataset.revealOrder = String(order);
    });
  };

  mark(incoming.querySelectorAll(".page-copy > *"), "copy");
  mark(incoming.querySelectorAll(".page-visual > *"), "visual");
  mark(incoming.querySelectorAll(transitionItemSelector), "item");
}

function createTurnLayer(direction, targetIndex) {
  removeTurnLayer();
  const layer = document.createElement("div");
  const incoming = document.createElement("div");
  const outgoing = document.createElement("div");
  const veil = document.createElement("div");
  const sweep = document.createElement("div");
  const ghost = document.createElement("div");
  layer.className = `page-turn-layer film-wipe ${direction === "next" ? "film-next" : "film-prev"}`;
  layer.setAttribute("aria-hidden", "true");
  incoming.className = "film-incoming is-transition-preview";
  outgoing.className = "film-outgoing";
  veil.className = "film-veil";
  sweep.className = "film-sweep";
  ghost.className = "film-ghost-lines";
  incoming.innerHTML = buildSlideMarkup(targetIndex);
  outgoing.innerHTML = spread.innerHTML;
  ghost.innerHTML = "<span></span><span></span><span></span>";
  markRevealTargets(incoming);
  layer.append(incoming, outgoing, veil, sweep, ghost);
  deck.append(layer);
  return layer;
}

function runRevealTimeline(incoming, direction, turnDuration) {
  const copyStart = readCssTime("--motion-reveal-copy-start");
  const visualStart = readCssTime("--motion-reveal-visual-start");
  const itemStart = readCssTime("--motion-reveal-item-start");
  const revealDuration = readCssTime("--motion-reveal-duration");
  const travel = readCssTime("--motion-reveal-travel");
  const stagger = readCssTime("--motion-reveal-item-stagger");
  const settleGuard = readCssTime("--motion-reveal-settle-guard");
  const offset = readCssNumber("--motion-reveal-offset");
  const easing = readCssValue("--motion-reveal-ease");
  const hostRect = incoming.getBoundingClientRect();
  const maximumDelay = Math.max(0, turnDuration - revealDuration - settleGuard);
  const starts = { copy: copyStart, visual: visualStart, item: itemStart };
  const xOffset = direction === "next" ? offset : offset * -1;

  return Array.from(incoming.querySelectorAll("[data-reveal-target]")).map(element => {
    const rect = element.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const progress = hostRect.width ? clamp((center - hostRect.left) / hostRect.width, 0, 1) : 0.5;
    const directionalProgress = direction === "next" ? progress : 1 - progress;
    const kind = element.dataset.revealKind || "item";
    const order = Number.parseInt(element.dataset.revealOrder || "0", 10);
    const delay = Math.min((starts[kind] ?? itemStart) + travel * directionalProgress + stagger * order, maximumDelay);

    return element.animate([
      { opacity: 0, transform: `translate3d(${xOffset}px, var(--motion-reveal-offset-y), 0) scale(var(--motion-reveal-scale-start))` },
      { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
    ], {
      duration: revealDuration,
      delay,
      easing,
      fill: "both"
    });
  });
}

function finishRevealTimeline(animations) {
  animations.forEach(animation => {
    try { animation.finish(); } catch (error) { /* Animation may already be finished. */ }
    animation.cancel();
  });
}

function commitIncomingSlide(target, incoming, animations) {
  spread.classList.add("transition-committed");
  finishRevealTimeline(animations);
  const pages = Array.from(incoming.children);
  spread.replaceChildren(...pages);
  spread.querySelectorAll("[data-reveal-target]").forEach(element => {
    delete element.dataset.revealTarget;
    delete element.dataset.revealKind;
    delete element.dataset.revealOrder;
  });

  current = Math.max(0, Math.min(slides.length - 1, target));
  const slide = slides[current];
  deck.dataset.layout = slide.layout;
  folio.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  renderToc();
  initializeStepReveal();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function multiline(value) {
  return escapeHtml(value).split("\n").join("<br>");
}

function sentenceLines(value) {
  return escapeHtml(value).replace(/([.!?][’'”"]?)\s+(?=\S)/g, "$1<br>");
}

function renderAnchor(href, label, index = 0) {
  return `<a class="resource-link" style="--i:${index}" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
}



const imageLightbox = document.createElement("div");
imageLightbox.className = "image-lightbox";
imageLightbox.hidden = true;
imageLightbox.setAttribute("role", "dialog");
imageLightbox.setAttribute("aria-modal", "true");
imageLightbox.setAttribute("aria-label", presentation.lightboxLabel || "이미지 크게 보기");
imageLightbox.innerHTML = `
  <button type="button" class="lightbox-close" aria-label="${escapeHtml(presentation.lightboxCloseLabel || "닫기")}">×</button>
  <figure class="lightbox-panel">
    <img alt="">
    <figcaption></figcaption>
  </figure>
`;
document.body.append(imageLightbox);

function openImageLightbox(trigger) {
  const image = imageLightbox.querySelector("img");
  const caption = imageLightbox.querySelector("figcaption");
  image.src = trigger.dataset.lightboxSrc;
  image.alt = trigger.dataset.lightboxAlt || "";
  caption.textContent = trigger.dataset.lightboxCaption || "";
  imageLightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  imageLightbox.querySelector(".lightbox-close").focus();
}

function closeImageLightbox() {
  if (imageLightbox.hidden) return;
  imageLightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
}

function readCssNumber(token) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);
  if (!raw || !Number.isFinite(value)) {
    throw new Error("Required numeric token is missing: " + token);
  }
  return value;
}

let deckFitFrame = 0;

function fitDeckToViewport() {
  const canvasWidth = readCssNumber("--deck-canvas-width");
  const canvasHeight = readCssNumber("--deck-canvas-height");
  const mobileBreakpoint = readCssNumber("--mobile-breakpoint");
  const isMobile = window.innerWidth <= mobileBreakpoint;

  if (isMobile) {
    deckViewport.style.width = "";
    deckViewport.style.height = "";
    deck.style.removeProperty("--deck-scale");
    deckViewport.dataset.fit = "mobile";
    return;
  }

  const root = document.documentElement;
  const availableWidth = root.clientWidth || window.innerWidth;
  const availableHeight = root.clientHeight || window.innerHeight;
  const scale = Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight);

  deck.style.setProperty("--deck-scale", String(scale));
  deckViewport.style.width = (canvasWidth * scale) + "px";
  deckViewport.style.height = (canvasHeight * scale) + "px";
  deckViewport.dataset.fit = "desktop";
}

function scheduleDeckFit() {
  window.cancelAnimationFrame(deckFitFrame);
  deckFitFrame = window.requestAnimationFrame(fitDeckToViewport);
}

function renderToc() {
  const windowSize = Math.min(slides.length, Math.max(1, Math.round(readCssNumber("--toc-window-size"))));
  const start = Math.max(0, Math.min(current - Math.floor(windowSize / 2), slides.length - windowSize));
  toc.innerHTML = slides.slice(start, start + windowSize).map((slide, offset) => {
    const index = start + offset;
    return `<button class="toc-item ${index === current ? "active" : ""}" data-index="${index}" type="button"><span>${escapeHtml(slide.marker)}</span>${escapeHtml(slide.section)}</button>`;
  }).join("");
  deck.style.setProperty("--toc-count", String(windowSize));
}

const visualRenderers = Object.freeze({
threeQuestions(slide) {
    return `<div class="question-stack">${(slide.items || []).map((item, index) => `
      <article class="question-card" style="--i:${index}"><em>${String(index + 1).padStart(2, "0")}</em><h3>${escapeHtml(item[0])}</h3><p>${escapeHtml(item[1])}</p></article>
    `).join("")}</div>`;
  },
cards(slide) {
    const items = slide.items || [];
    return `<div class="card-grid" style="--card-columns:${items.length === 3 ? 3 : 2}">${items.map((item, index) => `
      <article class="editorial-card" style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>
    `).join("")}</div>`;
  },
chain(slide) {
    return `<div class="chain-layout"><div class="chain-items">${(slide.items || []).map((item, index) => `
      <span class="chain-chip" style="--i:${index}">${escapeHtml(item)}</span>
    `).join("")}</div>${slide.note ? `<p class="visual-note">${escapeHtml(slide.note)}</p>` : ""}</div>`;
  },
framework(slide) {
    return `<div class="framework-layout">
      <div class="framework-map">
        <div class="framework-core"><small>${escapeHtml(slide.frameCaption || "6 AXES")}</small><strong>${escapeHtml(slide.frameLabel || "GESTALT")}</strong><span>WHAT · HOW · WHERE<br>DEPTH · TIME · EVIDENCE</span></div>
        <div class="framework-nodes">${(slide.items || []).map((item, index) => `
          <article class="framework-node" data-axis="${escapeHtml(String(item[0]).toLowerCase())}" style="--i:${index}"><span>${escapeHtml(item[0])}</span><div><b>${escapeHtml(item[1])}</b><p>${escapeHtml(item[2])}</p></div></article>
        `).join("")}</div>
      </div>
      ${slide.note ? `<p class="framework-note">${escapeHtml(slide.note)}</p>` : ""}
    </div>`;
  },
steps(slide) {
    const columns = slide.columns === 2 ? " two-columns" : "";
    return `<div class="steps-layout${columns}">${(slide.items || []).map((item, index) => `
      <div class="step-row" style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(item)}</b></div>
    `).join("")}</div><div class="step-hint">Space / Enter — 단계 공개</div>`;
  },
toolkit(slide) {
    return `<div class="toolkit-grid">${(slide.items || []).map((item, index) => `
      <article class="toolkit-card" style="--i:${index}"><span>${escapeHtml(item.label)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>
    `).join("")}</div>`;
  },
contrast(slide) {
    return `<div class="contrast-grid">
      <section><h3>${escapeHtml(slide.leftTitle)}</h3>${(slide.left || []).map(item => `<p>${escapeHtml(item)}</p>`).join("")}</section>
      <section class="positive"><h3>${escapeHtml(slide.rightTitle)}</h3>${(slide.right || []).map(item => `<p>${escapeHtml(item)}</p>`).join("")}</section>
    </div>`;
  },
axis(slide) {
    return `<table class="axis-table"><tbody>${(slide.axes || []).map(axis => `
      <tr><th>${escapeHtml(axis[0])}</th><td>${escapeHtml(axis[1])}</td><td>${escapeHtml(axis[2])}</td></tr>
    `).join("")}</tbody></table>`;
  },
checklist(slide) {
    return `<div class="checklist-layout">
      <div class="checklist-title">${escapeHtml(slide.label || "")}</div>
      <div class="checklist-items">${(slide.items || []).map((item, index) => `<div style="--i:${index}"><span>✓</span><b>${escapeHtml(item)}</b></div>`).join("")}</div>
      ${slide.warning ? `<p class="callout warning">${escapeHtml(slide.warning)}</p>` : ""}
      ${slide.success ? `<p class="callout success">${escapeHtml(slide.success)}</p>` : ""}
    </div>`;
  },
depth(slide) {
    return `<div class="depth-stack">${(slide.levels || []).map((level, index) => `
      <div class="depth-level ${escapeHtml(level.tone || "normal")}" style="--i:${index}"><span>${escapeHtml(level.label)}</span><b>${escapeHtml(level.body)}</b></div>
    `).join("")}</div>`;
  },
assignment(slide) {
    return `<div class="assignment-grid">${(slide.requirements || []).map((item, index) => `
      <div class="assignment-row" style="--i:${index}"><b>${escapeHtml(item[0])}</b><span>${escapeHtml(item[1])}</span></div>
    `).join("")}</div>`;
  },
flow(slide) {
    return `<div class="flow-line">${(slide.items || []).map((item, index) => `
      <div class="flow-node" style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(item)}</b></div>
    `).join("")}</div>`;
  },
gates(slide) {
    return `<div class="gate-spread">${(slide.gates || []).map((gate, index) => `
      <article class="gate-card" style="--i:${index}"><b>${escapeHtml(gate[0])}</b><h3>${escapeHtml(gate[1])}</h3><p>${escapeHtml(gate[2])}</p></article>
    `).join("")}</div>`;
  },
gateDetail(slide) {
    return `<div class="gate-detail">
      <div class="gate-signals">${(slide.items || []).map((item, index) => `<div style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(item)}</b></div>`).join("")}</div>
      <div class="gate-outcomes">${(slide.outcomes || []).map((item, index) => `<article class="${escapeHtml(item[2])}" style="--i:${index}"><b>${escapeHtml(item[0])}</b><span>${escapeHtml(item[1])}</span></article>`).join("")}</div>
    </div>`;
  },
status(slide) {
    return `<div class="status-table">${(slide.rows || []).map((row, index) => `
      <article style="--i:${index}"><h3>${escapeHtml(row[0])}</h3><p>${escapeHtml(row[1])}</p><p>${escapeHtml(row[2])}</p><b>${escapeHtml(row[3])}</b></article>
    `).join("")}</div>`;
  },
judges(slide) {
    const judges = slide.judges || [];
    return `<div class="judges-layout"><div class="judge-grid" style="--item-count:${Math.max(1, judges.length)}">${judges.map((judge, index) => `
      <article class="judge-card" style="--i:${index}"><span>${escapeHtml(judge[0])}</span><b>${escapeHtml(judge[1])}</b><p>${escapeHtml(judge[2])}</p></article>
    `).join("")}</div>${slide.aggregation ? `<div class="aggregation-line">${slide.aggregation.map((item, index) => `<span style="--i:${index}">${escapeHtml(item)}</span>`).join("")}</div>` : ""}</div>`;
  },
blueprint(slide) {
    const alt = slide.alt || presentation.blueprintAlt || "";
    return `<figure class="blueprint-figure"><button type="button" class="blueprint-zoom" data-lightbox-src="${escapeHtml(slide.image)}" data-lightbox-alt="${escapeHtml(alt)}" data-lightbox-caption="${escapeHtml(slide.caption)}" aria-label="${escapeHtml(presentation.blueprintExpandLabel || "이미지 크게 보기")}"><img src="${escapeHtml(slide.image)}" alt="${escapeHtml(alt)}"><span class="blueprint-zoom-hint" aria-hidden="true">＋ 확대</span></button><figcaption>${escapeHtml(slide.caption)}</figcaption>${slide.link ? renderAnchor(slide.link, slide.linkLabel || "Open") : ""}</figure>`;
  },
resources(slide) {
    return `<div class="resources-layout">
      <div class="resource-links">${(slide.links || []).map((link, index) => renderAnchor(link.href, link.label, index)).join("")}</div>
      <div class="level-card"><span>${escapeHtml(slide.level)}</span><h3>${escapeHtml(slide.levelBody)}</h3></div>
      <div class="resource-steps">${(slide.items || []).map((item, index) => `<span style="--i:${index}">${escapeHtml(item)}</span>`).join("")}</div>
    </div>`;
  },
closing(slide) {
    const stages = slide.stages || [];
    return `<div class="closing-system">
      <div class="closing-cycle">
        <svg class="closing-cycle-path" viewBox="0 0 100 100" aria-hidden="true">
          <defs><marker id="closing-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path class="closing-arrowhead" d="M0 0L8 4L0 8Z"/></marker></defs>
          <path d="M32 18H67"/>
          <path d="M82 32V67"/>
          <path d="M68 82H33"/>
          <path d="M32 75L40 61"/>
          <path d="M40 39L32 25"/>
        </svg>
        ${stages.map((stage, index) => `<article class="closing-stage closing-stage-${index + 1}" style="--i:${index}"><span>${escapeHtml(stage[0])}</span><strong>${escapeHtml(stage[1])}</strong><small>${escapeHtml(stage[2])}</small></article>`).join('')}
        <div class="closing-owner"><span>${escapeHtml(slide.ownerLabel || '')}</span><strong>${escapeHtml(slide.owner || '')}</strong></div>
        <div class="closing-return"><span>↺</span>${escapeHtml(slide.returnLabel || '')}</div>
      </div>
      <p class="closing-manifesto">${escapeHtml(slide.manifesto || '')}</p>
    </div>`;
  },
cover(slide) {
    const visual = slide.coverVisual || {};
    const stages = visual.stages || [];
    return `<div class="cover-map">
      <div class="cover-map-core"><span>${escapeHtml(visual.eyebrow || "")}</span><strong>${escapeHtml(visual.core || "")}</strong><small>${escapeHtml(visual.subtitle || "")}</small></div>
      <div class="cover-map-stages">${stages.map((item, index) => `<div class="cover-map-stage" style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(item)}</strong></div>`).join("")}</div>
      <div class="cover-map-owner"><span>FINAL OWNER</span><strong>${escapeHtml(visual.owner || "")}</strong></div>
    </div>`;
  },
default() {
    return '<div class="cover-lines"><span></span><span></span><span></span></div>';
  }
});

function renderVisual(slide) {
  return (visualRenderers[slide.layout] || visualRenderers.default)(slide);
}
function buildSlideMarkup(index) {
  const safeIndex = Math.max(0, Math.min(slides.length - 1, index));
  const slide = slides[safeIndex];
  return `
    <article class="page page-copy">
      <div class="section-label">${escapeHtml(slide.section)}</div>
      <div class="kicker">${escapeHtml(slide.kicker)}</div>
      <h1>${multiline(slide.title)}</h1>
      <p class="deckline">${sentenceLines(slide.deck)}</p>
      ${slide.quote ? `<blockquote>${escapeHtml(slide.quote)}</blockquote>` : ""}
      ${slide.meta ? `<div class="meta-line">${slide.meta.map(escapeHtml).join(" · ")}</div>` : ""}
    </article>
    <article class="page page-visual">
      ${renderVisual(slide)}
    </article>
  `;
}

function initializeStepReveal() {
  stepRows = Array.from(spread.querySelectorAll(".step-row"));
  stepCursor = 0;
  stepRows.forEach(row => row.classList.remove("is-visible"));
  if (stepRows.length) revealNextStep();
}

function revealNextStep() {
  if (stepCursor >= stepRows.length) return false;
  stepRows[stepCursor].classList.add("is-visible");
  stepCursor += 1;
  return true;
}

function renderSlide(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  const slide = slides[current];
  deck.dataset.layout = slide.layout;
  folio.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  spread.classList.remove("transition-committed");
  spread.innerHTML = buildSlideMarkup(current);
  renderToc();
  initializeStepReveal();
}

function goTo(index) {
  const target = Math.max(0, Math.min(slides.length - 1, index));
  if (locked || target === current) return;

  locked = true;
  const direction = target > current ? "next" : "prev";
  const layer = createTurnLayer(direction, target);
  const incoming = layer.querySelector(".film-incoming");
  const outgoing = layer.querySelector(".film-outgoing");
  const duration = readCssTime("--motion-turn-duration");
  const fallbackBuffer = readCssTime("--motion-turn-fallback-buffer");
  const revealAnimations = [];
  let settled = false;
  let fallbackId;

  const settle = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(fallbackId);
    outgoing.removeEventListener("animationend", handleAnimationEnd);
    commitIncomingSlide(target, incoming, revealAnimations);
    window.requestAnimationFrame(() => {
      removeTurnLayer();
      locked = false;
    });
  };

  const handleAnimationEnd = (event) => {
    if (event.target === outgoing) settle();
  };

  outgoing.addEventListener("animationend", handleAnimationEnd);
  fallbackId = window.setTimeout(settle, duration + fallbackBuffer);
  window.requestAnimationFrame(() => {
    layer.classList.add("turn-active");
    revealAnimations.push(...runRevealTimeline(incoming, direction, duration));
  });
}
function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
toc.addEventListener("click", (event) => {
  const button = event.target.closest(".toc-item");
  if (button) goTo(Number(button.dataset.index));
});
deck.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-lightbox-src]");
  if (trigger) { event.preventDefault(); openImageLightbox(trigger); }
});
imageLightbox.addEventListener("click", (event) => {
  if (event.target === imageLightbox || event.target.closest(".lightbox-close")) closeImageLightbox();
});
window.addEventListener("resize", scheduleDeckFit);
if (window.visualViewport) window.visualViewport.addEventListener("resize", scheduleDeckFit);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !imageLightbox.hidden) { event.preventDefault(); closeImageLightbox(); return; }
  if (!imageLightbox.hidden) return;
  if (["ArrowRight", "PageDown"].includes(event.key)) { event.preventDefault(); next(); }
  if ([" ", "Enter"].includes(event.key)) { event.preventDefault(); if (!revealNextStep()) next(); }
  if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) { event.preventDefault(); prev(); }
});

fitDeckToViewport();
applyPresentation();
renderSlide(0);