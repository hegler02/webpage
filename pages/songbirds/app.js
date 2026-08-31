/* GENERATED_TRACKS_START */
const TRACKS = {
  "ko": {
    "eyebrow": "Korean",
    "title": "오랜만이야",
    "note": "가장 먼저 돌아온 목소리",
    "src": "./assets/audio/songbirds-female.mp3"
  },
  "en": {
    "eyebrow": "English",
    "title": "It’s Been a While",
    "note": "같은 아침, 다른 언어의 온기",
    "src": "./assets/audio/songbirds-en.mp3"
  },
  "male": {
    "eyebrow": "Male",
    "title": "오랜만이야",
    "note": "낮고 담담하게 건네는 안부",
    "src": "./assets/audio/songbirds-male.mp3"
  },
  "duet": {
    "eyebrow": "Duet",
    "title": "오랜만이야",
    "note": "두 목소리가 함께 알아보는 마음",
    "src": "./assets/audio/songbirds-duet.mp3"
  }
};
/* GENERATED_TRACKS_END */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const audio = $("#album-audio");
const dock = $(".now-playing");
const dockButton = $(".dock-play");
const dockTitle = $(".dock-title");
const seek = $(".dock-progress input");
const timeLabel = $(".dock-progress span");
const retryButton = $(".source-link");
const heroButton = $(".primary-play");
const menuButton = $(".menu-button");
const menuLayer = $(".menu-layer");
const menuLinks = $$(".mobile-menu nav a");
const focusableMenu = [...menuLinks, $(".menu-theme")];
const { transition } = window.SongbirdsPlayerState;
let activeId = "duet";
let playerStatus = "idle";

const statusLabels = {
  idle: "선택됨",
  loading: "불러오는 중",
  ready: "재생 준비",
  playing: "재생 중",
  paused: "일시정지",
  ended: "재생 완료",
  error: "재생할 수 없음"
};
const pad = (value) => String(Math.floor(value)).padStart(2, "0");
const formatTime = (value) => Number.isFinite(value) ? `${Math.floor(value / 60)}:${pad(value % 60)}` : "0:00";
const iconMarkup = (playing) => playing ? '<span class="pause-icon" aria-hidden="true"><i></i><i></i></span>' : '<span class="play-icon" aria-hidden="true"></span>';

function dispatchPlayer(event, flags = {}) {
  playerStatus = transition(playerStatus, event, flags);
  renderPlayer();
}

function renderPlayer() {
  const track = TRACKS[activeId];
  dock.className = `now-playing is-open status-${playerStatus}`;
  dockTitle.innerHTML = `<small>${track.eyebrow} · ${statusLabels[playerStatus]}</small><strong>${track.title}</strong>`;
  dockButton.innerHTML = iconMarkup(playerStatus === "playing");
  dockButton.setAttribute("aria-label", playerStatus === "playing" ? "일시정지" : "재생");
  heroButton.innerHTML = `${iconMarkup(playerStatus === "playing")}<span>${playerStatus === "playing" ? "잠시 멈추기" : "듀엣 버전 듣기"}</span>`;
  retryButton.hidden = playerStatus !== "error";
  $$(".track-card").forEach((card) => {
    const id = card.dataset.track;
    card.classList.toggle("is-active", id === activeId);
    const note = $(".track-meta small", card);
    const action = $(".track-action", card);
    note.textContent = id === activeId ? statusLabels[playerStatus] : TRACKS[id].note;
    action.innerHTML = iconMarkup(id === activeId && playerStatus === "playing");
  });
  $(".menu-track").textContent = `${track.eyebrow} · ${track.title}`;
}

function attachActiveSource() {
  if (audio.dataset.trackId === activeId && audio.getAttribute("src")) return;
  audio.src = TRACKS[activeId].src;
  audio.dataset.trackId = activeId;
  audio.load();
}

async function playActive() {
  attachActiveSource();
  dispatchPlayer("intent");
  try {
    await audio.play();
  } catch {
    dispatchPlayer("error");
  }
}

async function togglePlay() {
  if (audio.paused) await playActive();
  else audio.pause();
}

function chooseTrack(id) {
  if (id === activeId) return togglePlay();
  audio.pause();
  activeId = id;
  audio.removeAttribute("src");
  delete audio.dataset.trackId;
  audio.load();
  seek.value = "0";
  updateTime();
  return playActive();
}

audio.addEventListener("play", () => dispatchPlayer("play"));
audio.addEventListener("playing", () => dispatchPlayer("playing"));
audio.addEventListener("waiting", () => dispatchPlayer("waiting"));
audio.addEventListener("stalled", () => dispatchPlayer("stalled"));
audio.addEventListener("pause", () => dispatchPlayer("pause", { ended: audio.ended }));
audio.addEventListener("ended", () => dispatchPlayer("ended"));
audio.addEventListener("error", () => dispatchPlayer("error"));
audio.addEventListener("loadedmetadata", () => {
  seek.max = audio.duration || 0;
  dispatchPlayer("loadedmetadata");
  updateTime();
});
audio.addEventListener("timeupdate", updateTime);

function updateTime() {
  const duration = audio.duration || 0;
  seek.value = audio.currentTime || 0;
  seek.style.setProperty("--progress", `${duration ? (audio.currentTime / duration) * 100 : 0}%`);
  timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
}

seek.addEventListener("input", () => { audio.currentTime = Number(seek.value); updateTime(); });
dockButton.addEventListener("click", togglePlay);
retryButton.addEventListener("click", playActive);
heroButton.addEventListener("click", () => { if (activeId !== "duet") chooseTrack("duet"); else togglePlay(); });
$$(".track-card").forEach((card) => card.addEventListener("click", () => chooseTrack(card.dataset.track)));

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
