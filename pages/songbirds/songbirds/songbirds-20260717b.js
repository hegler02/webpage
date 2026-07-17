const TRACKS = {
  ko: { eyebrow: "Korean", title: "오랜만이야", note: "가장 먼저 돌아온 목소리", src: "https://cdn1.suno.ai/0b6bcbcd-a15c-4beb-9c83-e7845f60950e.mp3" },
  en: { eyebrow: "English", title: "It’s Been a While", note: "같은 아침, 다른 언어의 온기", src: "https://cdn1.suno.ai/722b2182-f45c-4be7-95c3-de65ef3f74ba.mp3" },
  male: { eyebrow: "Male", title: "오랜만이야", note: "낮고 담담하게 건네는 안부", src: "https://cdn1.suno.ai/be64f540-d402-44d6-9008-c46dc2f4401f.mp3" },
  duet: { eyebrow: "Duet", title: "오랜만이야", note: "두 목소리가 함께 알아보는 마음", src: "https://cdn1.suno.ai/680d166d-2956-4144-800b-d3508470890b.mp3" }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const audio = $("#album-audio");
const dock = $(".now-playing");
const dockButton = $(".dock-play");
const dockTitle = $(".dock-title");
const seek = $(".dock-progress input");
const timeLabel = $(".dock-progress span");
const sourceLink = $(".source-link");
const heroButton = $(".primary-play");
const menuButton = $(".menu-button");
const menuLayer = $(".menu-layer");
const menuLinks = $$(".mobile-menu nav a");
const focusableMenu = [...menuLinks, $(".menu-theme")];
let activeId = "duet";
let playerStatus = "idle";

const statusLabels = { idle: "선택됨", loading: "불러오는 중", playing: "재생 중", paused: "일시정지", error: "재생할 수 없음" };
const pad = (value) => String(Math.floor(value)).padStart(2, "0");
const formatTime = (value) => Number.isFinite(value) ? `${Math.floor(value / 60)}:${pad(value % 60)}` : "0:00";
const iconMarkup = (playing) => playing ? '<span class="pause-icon" aria-hidden="true"><i></i><i></i></span>' : '<span class="play-icon" aria-hidden="true"></span>';

function setStatus(status) {
  playerStatus = status;
  const track = TRACKS[activeId];
  dock.className = `now-playing is-open status-${status}`;
  dockTitle.innerHTML = `<small>${track.eyebrow} · ${statusLabels[status]}</small><strong>${track.title}</strong>`;
  dockButton.innerHTML = iconMarkup(status === "playing");
  dockButton.setAttribute("aria-label", status === "playing" ? "일시정지" : "재생");
  heroButton.innerHTML = `${iconMarkup(status === "playing")}<span>${status === "playing" ? "잠시 멈추기" : "듀엣 버전 듣기"}</span>`;
  sourceLink.hidden = status !== "error";
  sourceLink.href = track.src;
  $$(".track-card").forEach((card) => {
    const id = card.dataset.track;
    card.classList.toggle("is-active", id === activeId);
    const note = $(".track-meta small", card);
    const action = $(".track-action", card);
    note.textContent = id === activeId ? statusLabels[status] : TRACKS[id].note;
    action.innerHTML = iconMarkup(id === activeId && status === "playing");
  });
  $(".menu-track").textContent = `${track.eyebrow} · ${track.title}`;
}

async function playActive() {
  setStatus("loading");
  try { await audio.play(); } catch { setStatus("error"); }
}

async function togglePlay() {
  if (!audio.src) { audio.src = TRACKS[activeId].src; audio.load(); }
  if (audio.paused) await playActive(); else audio.pause();
}

function chooseTrack(id) {
  if (id === activeId) return togglePlay();
  activeId = id;
  audio.pause();
  audio.src = TRACKS[id].src;
  audio.load();
  seek.value = "0";
  setStatus("loading");
  playActive();
}

audio.addEventListener("play", () => setStatus("playing"));
audio.addEventListener("playing", () => setStatus("playing"));
audio.addEventListener("waiting", () => setStatus("loading"));
audio.addEventListener("pause", () => { if (playerStatus !== "error") setStatus("paused"); });
audio.addEventListener("ended", () => setStatus("paused"));
audio.addEventListener("error", () => setStatus("error"));
audio.addEventListener("loadedmetadata", () => { seek.max = audio.duration || 0; updateTime(); });
audio.addEventListener("timeupdate", updateTime);

function updateTime() {
  const duration = audio.duration || 0;
  seek.value = audio.currentTime || 0;
  seek.style.setProperty("--progress", `${duration ? (audio.currentTime / duration) * 100 : 0}%`);
  timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
}

seek.addEventListener("input", () => { audio.currentTime = Number(seek.value); updateTime(); });
dockButton.addEventListener("click", togglePlay);
heroButton.addEventListener("click", () => { if (activeId !== "duet") chooseTrack("duet"); else togglePlay(); });
$$('.track-card').forEach((card) => card.addEventListener("click", () => chooseTrack(card.dataset.track)));

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const morning = theme === "morning";
  $$(".theme-switch, .menu-theme").forEach((button) => {
    $("span", button).textContent = morning ? "◐" : "○";
    $("b", button).textContent = morning ? "Before dawn" : "Open morning";
    button.setAttribute("aria-label", morning ? "밤의 방으로 전환" : "아침의 창으로 전환");
  });
}

function toggleTheme() { applyTheme(document.documentElement.dataset.theme === "morning" ? "night" : "morning"); }
$(".theme-switch").addEventListener("click", toggleTheme);
$(".menu-theme").addEventListener("click", toggleTheme);

function setMenu(open) {
  menuLayer.classList.toggle("is-open", open);
  menuButton.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  menuLayer.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  focusableMenu.forEach((item) => item.tabIndex = open ? 0 : -1);
  $(".menu-scrim").tabIndex = open ? 0 : -1;
  if (open) requestAnimationFrame(() => menuLinks[0].focus());
}

menuButton.addEventListener("click", () => setMenu(!menuLayer.classList.contains("is-open")));
$(".menu-scrim").addEventListener("click", () => setMenu(false));
menuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && menuLayer.classList.contains("is-open")) { setMenu(false); menuButton.focus(); } });

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  menuLinks.forEach((link) => link.classList.toggle("is-current", link.dataset.section === visible.target.id));
}, { rootMargin: "-28% 0px -52%", threshold: [0, 0.2, 0.5] });
["story", "voices", "note"].forEach((id) => sectionObserver.observe(document.getElementById(id)));

$(".back-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
const wave = $(".sound-wave");
wave.innerHTML = Array.from({ length: 18 }, (_, index) => `<i style="--bar:${22 + ((index * 37) % 74)}%"></i>`).join("");
