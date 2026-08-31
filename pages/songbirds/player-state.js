(function exposePlayerState(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SongbirdsPlayerState = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPlayerState() {
  const STATES = new Set(["idle", "loading", "ready", "playing", "paused", "ended", "error"]);

  function transition(current, event, flags = {}) {
    const state = STATES.has(current) ? current : "idle";
    switch (event) {
      case "intent":
      case "play":
      case "retry":
        return "loading";
      case "playing":
        return "playing";
      case "waiting":
      case "stalled":
        return state === "error" ? "error" : "loading";
      case "loadedmetadata":
        return state === "idle" ? "ready" : state;
      case "pause":
        if (flags.ended || state === "ended") return "ended";
        return state === "error" ? "error" : "paused";
      case "ended":
        return "ended";
      case "error":
        return "error";
      case "reset":
        return "idle";
      default:
        return state;
    }
  }

  return { transition };
});
