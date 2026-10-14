// Run: node tools/verify_level_up_monitor_v2.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const monitor = readFileSync(new URL("../js/level_up_monitor_v2.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const nav = readFileSync(new URL("../js/home_nav.js", import.meta.url), "utf8");
const stats = readFileSync(new URL("../js/stats.js", import.meta.url), "utf8");
const stats3 = readFileSync(new URL("../js/stats_v3.js", import.meta.url), "utf8");

function createHarness(memory = new Map()) {
  const nodes = new Map(), timers = new Map();
  let timerId = 0, fresh = false, tactical = false, hidden = false, refreshCount = 0, openedBuild = 0, haptics = 0;
  const document = {
    head: { appendChild(node) { nodes.set(node.id, node); } },
    body: {
      appendChild(node) { nodes.set(node.id, node); },
      classList: { contains() { return false; } }
    },
    get visibilityState() { return hidden ? "hidden" : "visible"; },
    getElementById(id) { return nodes.get(id) ?? null; },
    querySelector(sel) { return tactical && sel === '#tacticalOpsRoot[data-open="1"]' ? { id: "battle" } : null; },
    createElement(tag) {
      const callbacks = new Map();
      const node = {
        tag, id: "", innerHTML: "", style: {},
        setAttribute() {},
        querySelector(sel) {
          return { addEventListener(name, callback) { callbacks.set(sel + ":" + name, callback); } };
        },
        remove() { nodes.delete(node.id); },
        tap(sel) { callbacks.get(sel + ":click")?.(); }
      };
      return node;
    },
    addEventListener() {}
  };
  const window = {
    document,
    localStorage: {
      getItem(key) { return memory.get(key) ?? null; },
      setItem(key, value) { memory.set(key, String(value)); }
    },
    DevFresh: { isActive: () => fresh },
    Telegram: { WebApp: { initDataUnsafe: { user: { id: 501 } }, HapticFeedback: { notificationOccurred() { haptics++; } } } },
    HomeNav: { openBuild() { openedBuild++; return true; } },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener() {},
    loadProfile() { refreshCount++; }
  };
  vm.runInNewContext(monitor, { window, console }, { filename: "level_up_monitor_v2.js" });
  const flush = () => { const list = [...timers.values()]; timers.clear(); for (const task of list) task.callback(); };
  return {
    window, nodes, memory, timers, flush,
    setFresh(v) { fresh = v; }, setTactical(v) { tactical = v; }, setHidden(v) { hidden = v; },
    refreshCount() { return refreshCount; }, openedBuild() { return openedBuild; }, haptics() { return haptics; }
  };
}

const tests = [];
function test(name, run) { run(); tests.push(name); }
const profile = level => ({ uid: 501, level });
test("initial baseline never invents an old level reward", () => {
  const h = createHarness();
  assert.equal(h.window.LevelUpMonitorV2.onProfile(profile(5)), false);
  h.flush();
  assert.equal(h.nodes.has("ahLevelUpReward"), false);
});
test("confirmed gain shows exactly one reward and build routes", () => {
  const h = createHarness();
  h.window.LevelUpMonitorV2.onProfile(profile(4));
  assert.equal(h.window.LevelUpMonitorV2.onProfile(profile(5)), true);
  h.flush();
  const panel = h.nodes.get("ahLevelUpReward");
  assert.match(panel.innerHTML, /LEVEL 4 → 5/);
  assert.match(panel.innerHTML, /\+1 STAT POINT EARNED/);
  assert.equal(h.haptics(), 1);
  panel.tap("[data-lu-build]");
  assert.equal(h.openedBuild(), 1);
  assert.equal(h.nodes.has("ahLevelUpReward"), false);
  assert.equal(h.window.LevelUpMonitorV2.onProfile(profile(5)), false);
});
test("multi-level gain and reload are deduplicated", () => {
  const stored = new Map(), a = createHarness(stored);
  a.window.LevelUpMonitorV2.onProfile(profile(3));
  a.window.LevelUpMonitorV2.onProfile(profile(6));
  a.flush();
  assert.match(a.nodes.get("ahLevelUpReward").innerHTML, /\+3 STAT POINTS EARNED/);
  const b = createHarness(stored);
  assert.equal(b.window.LevelUpMonitorV2.onProfile(profile(6)), false);
  b.flush();
  assert.equal(b.nodes.has("ahLevelUpReward"), false);
});
test("level reset and DEV FRESH have independent baselines", () => {
  const h = createHarness();
  h.window.LevelUpMonitorV2.onProfile(profile(8));
  h.setFresh(true);
  assert.equal(h.window.LevelUpMonitorV2.onProfile(profile(1)), false);
  assert.equal(h.memory.size, 2);
  h.setFresh(false);
  assert.equal(h.window.LevelUpMonitorV2.onProfile(profile(8)), false);
  assert.equal(h.window.LevelUpMonitorV2.onProfile(profile(1)), false);
});
test("combat and hidden client defer celebration until visible", () => {
  const h = createHarness();
  h.window.LevelUpMonitorV2.onProfile(profile(1));
  h.window.LevelUpMonitorV2.onProfile(profile(2));
  h.setTactical(true);
  h.flush();
  assert.equal(h.nodes.has("ahLevelUpReward"), false);
  h.setTactical(false);
  h.setHidden(true);
  h.flush();
  assert.equal(h.nodes.has("ahLevelUpReward"), false);
  h.setHidden(false);
  h.flush();
  assert.equal(h.nodes.has("ahLevelUpReward"), true);
});
test("read-only paths never cause a refresh, XP paths get bounded refresh", () => {
  const h = createHarness();
  h.window.LevelUpMonitorV2.onActionSuccess("/webapp/profile");
  h.window.LevelUpMonitorV2.onActionSuccess("/webapp/stats/state");
  assert.equal(h.timers.size, 0);
  h.window.LevelUpMonitorV2.onActionSuccess("/webapp/missions/resolve");
  assert.equal(h.timers.size, 2);
  h.flush();
  assert.equal(h.refreshCount(), 2);
});
test("integration keeps a single toast owner and BUILD entry", () => {
  assert.match(html, /level_up_monitor_v2\.js\?v=levelup-global-v2-20261014/);
  assert.match(html, /LevelUpMonitorV2\?\.onProfile/);
  assert.match(html, /LevelUpMonitorV2\?\.onActionSuccess/);
  assert.doesNotMatch(html, /syncLevelToastFromProfile/);
  assert.match(nav, /openBuild: \(\) =>/);
  assert.match(stats, /options\?\.tab === "build"/);
  assert.match(stats3, /openTab\(name\)/);
});
console.log("Level-Up Monitor V2: PASS (" + tests.length + " checks)");
for (const name of tests) console.log("PASS " + name);
