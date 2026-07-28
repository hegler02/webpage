(function () {
  "use strict";

  function initArchiveFilter() {
    const controls = document.querySelector(".archive-controls");
    const status = document.querySelector(".archive-status");
    const grid = document.querySelector(".archive-grid");
    if (!controls || !status || !grid) return;

    const buttons = Array.from(controls.querySelectorAll("button"));
    const items = Array.from(grid.querySelectorAll(".archive-item"));
    const filters = ["all", "live", "toon"];

    function applyFilter(filter) {
      let visibleCount = 0;

      items.forEach((item) => {
        const visible = filter === "all" || item.classList.contains(filter);
        item.hidden = !visible;
        item.style.display = visible ? "" : "none";
        if (visible) visibleCount += 1;
      });

      buttons.forEach((button, index) => {
        const active = filters[index] === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      status.textContent = `${visibleCount}개의 장면을 보고 있습니다.`;
      grid.dataset.activeFilter = filter;
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => applyFilter(filters[index]));
    });

    applyFilter("all");
  }

  function initLightbox() {
    const images = Array.from(
      document.querySelectorAll(
        ".story-section figure img, .two-bodies figure img, .ending figure img",
      ),
    );
    if (!images.length) return;

    const dialog = document.createElement("dialog");
    dialog.className = "local-lightbox";
    dialog.setAttribute("aria-label", "이미지 크게 보기");
    dialog.innerHTML = [
      '<button class="local-lightbox-close" type="button" aria-label="닫기">×</button>',
      '<figure>',
      '<img alt="">',
      '<figcaption></figcaption>',
      "</figure>",
    ].join("");
    document.body.appendChild(dialog);

    const lightboxImage = dialog.querySelector("img");
    const lightboxCaption = dialog.querySelector("figcaption");
    const closeButton = dialog.querySelector(".local-lightbox-close");

    function openLightbox(sourceImage) {
      lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
      lightboxImage.alt = sourceImage.alt || "";
      const figure = sourceImage.closest("figure");
      const caption = figure?.querySelector("figcaption");
      lightboxCaption.textContent = caption?.textContent?.trim() || sourceImage.alt || "";
      dialog.showModal();
      closeButton.focus();
    }

    images.forEach((image) => {
      image.classList.add("is-lightbox-target");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `${image.alt || "이미지"} 크게 보기`);
      image.addEventListener("click", () => openLightbox(image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function installStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .archive-item[hidden] { display: none !important; }
      .is-lightbox-target { cursor: zoom-in; }
      .is-lightbox-target:focus-visible {
        outline: 3px solid #d6aa5a;
        outline-offset: 4px;
      }
      .local-lightbox {
        width: min(94vw, 1200px);
        max-width: none;
        height: min(92vh, 1000px);
        max-height: none;
        padding: 0;
        border: 1px solid rgba(214, 170, 90, .45);
        background: #090909;
        color: #f5f0e7;
        box-shadow: 0 24px 80px rgba(0, 0, 0, .75);
        overflow: hidden;
      }
      .local-lightbox::backdrop {
        background: rgba(0, 0, 0, .88);
        backdrop-filter: blur(8px);
      }
      .local-lightbox figure {
        width: 100%;
        height: 100%;
        margin: 0;
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
      }
      .local-lightbox img {
        width: 100%;
        height: 100%;
        min-height: 0;
        object-fit: contain;
      }
      .local-lightbox figcaption {
        padding: 14px 56px 16px 18px;
        color: #d8cbb6;
        background: #111;
        font-size: 14px;
      }
      .local-lightbox-close {
        position: absolute;
        z-index: 2;
        top: 10px;
        right: 12px;
        width: 42px;
        height: 42px;
        border: 1px solid rgba(255, 255, 255, .35);
        border-radius: 999px;
        background: rgba(0, 0, 0, .72);
        color: white;
        font: 28px/1 sans-serif;
        cursor: pointer;
      }
      @media (max-width: 640px) {
        .local-lightbox {
          width: 100vw;
          height: 100vh;
          border: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector("#chapter-menu");
    const header = document.querySelector(".story-nav");
    if (!toggle || !menu || !header) return;

    function setOpen(open, returnFocus) {
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "닫기" : "목차";
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true", false);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        const target = href?.startsWith("#") ? document.querySelector(href) : null;
        if (!target) {
          setOpen(false, false);
          return;
        }

        event.preventDefault();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setOpen(false, false);
        target.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
        try {
          window.history.replaceState(null, "", href);
        } catch {
          window.location.hash = href;
        }
        window.setTimeout(
          () => target.focus({ preventScroll: true }),
          reduced ? 0 : 800,
        );
      });
    });

    document.addEventListener("click", (event) => {
      if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) {
        setOpen(false, false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, false);
      }
    });

    setOpen(false, false);
  }
  function init() {
    installStyles();
    initMobileMenu();
    initArchiveFilter();
    initLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
