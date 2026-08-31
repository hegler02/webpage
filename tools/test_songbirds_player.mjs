import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { transition } = require("../pages/songbirds/player-state.js");

assert.equal(transition("idle", "intent"), "loading");
assert.equal(transition("loading", "play"), "loading", "play must not claim audible playback");
assert.equal(transition("loading", "playing"), "playing");
assert.equal(transition("playing", "waiting"), "loading");
assert.equal(transition("loading", "playing"), "playing");
assert.equal(transition("playing", "pause"), "paused");
assert.equal(transition("playing", "ended"), "ended");
assert.equal(transition("ended", "pause", { ended: true }), "ended");
assert.equal(transition("loading", "error"), "error");
assert.equal(transition("error", "pause"), "error");
assert.equal(transition("error", "retry"), "loading");

console.log("Songbirds player state: PASS");
