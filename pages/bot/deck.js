"use strict";

const slides = window.KNOWLEDGE_BLOCK_SLIDES || [];
const palette = window.KNOWLEDGE_BLOCK_PALETTE || {};
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
    let touchStartX = 0;
    let touchStartY = 0;

    function makeCopy(slide, index) {
      const rows = slide.rows.map(([key, value]) => `
        <div class="mini-row"><b>${key}</b><span>${value}</span></div>
      `).join("");
      const links = (slide.links || []).map((link) => `
        <a class="slide-link" href="${link.href}" target="_blank" rel="noopener">
          <span>${link.label}</span>
          <small>${link.note || "새 창으로 열기"}</small>
        </a>
      `).join("");
      const article = document.createElement("article");
      article.className = "slide-copy";
      article.style.setProperty("--accent", slide.accent);
      article.innerHTML = `
        <div class="label">${slide.label}</div>
        <h${index === 0 ? "1" : "2"}>${slide.title.replace("\\n", "<br />")}</h${index === 0 ? "1" : "2"}>
        <p class="lead">${slide.lead}</p>
        ${links ? `<div class="slide-links">${links}</div>` : ""}
        <div class="mini">${rows}</div>
      `;
      return article;
    }

    function ensureBricks() {
      Object.keys(slides[0].layout).forEach((id) => {
        if (brickEls.has(id)) return;
        const el = document.createElement("div");
        el.className = "brick";
        el.dataset.id = id;
        el.style.setProperty("--delay", `${brickEls.size * 34}ms`);
        bricks.appendChild(el);
        brickEls.set(id, el);
      });
    }

    function applyBrickLayout(slide) {
      Object.entries(slide.layout).forEach(([id, spec], order) => {
        const [x, y, z, width, label, color, rot] = spec;
        const [c1, c2, side] = palette[color];
        const el = brickEls.get(id);
        el.dataset.label = label;
        el.style.setProperty("--x", `${x}px`);
        el.style.setProperty("--y", `${y}px`);
        el.style.setProperty("--z", `${z}px`);
        el.style.setProperty("--w", `${width}px`);
        el.style.setProperty("--h", "58px");
        el.style.setProperty("--rot", `${rot}deg`);
        el.style.setProperty("--c1", c1);
        el.style.setProperty("--c2", c2);
        el.style.setProperty("--side", side);
        el.style.setProperty("--delay", `${order * 42}ms`);
        el.classList.remove("ghost");
      });
    }

    function renderInitial() {
      ensureBricks();
      slides.forEach((slide, index) => copy.appendChild(makeCopy(slide, index)));
      copy.children[0].classList.add("active");
      applySlideMeta(slides[0], 0);
      applyBrickLayout(slides[0]);
    }

    function applySlideMeta(slide, index) {
      document.documentElement.style.setProperty("--accent", slide.accent);
      chapterLabel.textContent = slide.chapter;
      sideTitle.textContent = slide.side;
      pageNumber.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      progress.style.transform = `scaleX(${index + 1})`;
      progress.style.backgroundColor = slide.accent;
    }

    function flash(direction) {
      deck.classList.remove("flash-next", "flash-prev");
      void deck.offsetWidth;
      deck.classList.add(direction === "prev" ? "flash-prev" : "flash-next");
      window.setTimeout(() => deck.classList.remove("flash-next", "flash-prev"), 520);
    }

    function clampIndex(index) {
      return Math.max(0, Math.min(slides.length - 1, index));
    }

    function goTo(nextIndex) {
      nextIndex = clampIndex(nextIndex);
      if (nextIndex === current) {
        flash("next");
        return;
      }
      if (locked) {
        queuedIndex = nextIndex;
        flash(nextIndex > current ? "next" : "prev");
        return;
      }
      locked = true;
      const previous = current;
      const direction = nextIndex > current ? "next" : "prev";
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

      if (transitionTimer) window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
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
      }, 880);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

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

    window.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy)) return;
      dx < 0 ? next() : prev();
    }, { passive: true });

    renderInitial();
