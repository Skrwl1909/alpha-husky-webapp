#!/usr/bin/env node
/**
 * First-session continuation smoke verification. READ-ONLY, no backend calls.
 * Simulates canonical snapshots AFTER First Signal to verify the player's route:
 * Rustfang equipped -> faction -> Blood Moon -> Tactical Drill 1/2 -> Explore Alpha.
 * Does not claim to verify rewards, missions persistence, or device gameplay.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = name => fs.readFileSync(path.join(root, "js", name), "utf8");
const scripts = ["story_delivery.js", "first_session_spine.js", "discovery_guide.js"];
let count = 0;
function check(label, fn) {
  fn();
  count++;
  console.log("PASS", label);
}

function environment({ store, initialSignal, campaign = null } = {}) {
  const cache = store || new Map();
  const storage = {
    getItem: key => cache.has(key) ? cache.get(key) : null,
    setItem: (key, val) => cache.set(key, String(val)),
    removeItem: key => cache.delete(key)
  };
  const player = {
    firstSignal: initialSignal || { eligible: true, faction_selected: false, state: "NOT_STARTED" },
    campaign
  };
  const nav = { bloodmoon: { reached: false }, tactical: { reached: false } };
  const requests = [];
  const browser = {
    localStorage: storage,
    addEventListener() {},
    GuidedNavigation: {
      state: () => nav,
      terminal: () => false,
      reached: id => nav[id]?.reached === true,
      start: (id, options) => { requests.push({ id, options }); return true; }
    }
  };
  const document = { readyState: "loading", addEventListener() {} };
  const context = vm.createContext({ window: browser, document, console, module: { exports: {} }, exports: {} });
  vm.runInContext(source(scripts[0]), context, { filename: scripts[0] });
  browser.StoryDelivery.gatherInputs = () => player;
  browser.StoryDelivery.refreshHub = () => {};
  vm.runInContext(source(scripts[1]), context, { filename: scripts[1] });
  vm.runInContext(source(scripts[2]), context, { filename: scripts[2] });
  return {
    browser, player, nav, requests, store: cache,
    frame: () => browser.StoryDelivery.resolve(player),
    spine: browser.FirstSessionSpine,
    discovery: browser.DiscoveryGuide
  };
}

const t = environment();
check("UNBOUND begins in First Signal, not faction selection", () => {
  assert.equal(t.frame().id, "S-FS-NOT-STARTED");
  assert.equal(t.frame().target.action, "first_signal");
  assert.equal(t.spine.view().active, true);
  assert.equal(t.discovery.view().available, false);
});

t.player.firstSignal = { eligible: true, faction_selected: false, state: "REWARD_RECEIVED" };
t.spine.sync();
check("Reward receipt alone never unlocks post-FTUE Explore Alpha", () => {
  assert.equal(t.frame().id, "S-FS-REWARD");
  assert.equal(t.discovery.view().available, false);
  assert.equal(t.spine.view().milestones.A, false);
});

t.player.firstSignal = {
  eligible: true, faction_selected: false, state: "COMPLETED",
  completion: { completed: true }, world_discovery: "pending"
};
t.spine.sync();
check("Equipped First Signal routes an UNBOUND player to faction oath", () => {
  assert.equal(t.frame().id, "S-FS-FACTION-HANDOFF");
  assert.equal(t.frame().target.action, "factions");
  assert.equal(t.spine.view().milestones.A, true);
  assert.equal(t.spine.view().milestones.B, true);
  assert.equal(t.spine.view().milestones.C, false);
  assert.equal(t.discovery.view().available, false);
});

t.player.firstSignal.faction_selected = true;
t.spine.sync();
check("Binding the faction points to Blood Moon, never Tactical Ops prematurely", () => {
  assert.equal(t.frame().id, "S-FS-WORLD");
  assert.equal(t.frame().nextAction, "FIND BLOOD MOON TOWER");
  assert.equal(t.discovery.view().available, false);
});

t.player.firstSignal.world_discovery = "done";
t.nav.bloodmoon.reached = true;
t.spine.sync(t.player, { foundationStage: "solo-1", activeRunId: null, lastCompletedRunId: null });
check("After Blood Moon, first Tactical drill is the next recorded objective", () => {
  assert.equal(t.spine.view().milestones.C, true);
  assert.equal(t.spine.view().milestones.D, false);
  const choice = t.spine.choice(t.player, { foundationStage: "solo-1" });
  assert.equal(choice?.destination, "tactical");
  assert.equal(choice?.action, "FIND TACTICAL OPS");
  assert.equal(t.discovery.view().available, false);
});

t.spine.sync(t.player, { foundationStage: "solo-2", lastCompletedRunId: "drill-1", activeRunId: null });
check("After Drill 1, keep Drill 2 available and do not graduate early", () => {
  assert.equal(t.spine.view().milestones.D, true);
  assert.equal(t.spine.view().milestones.E, false);
  assert.equal(t.spine.choice(t.player, { foundationStage: "solo-2" })?.action, "Continue Tactical Ops");
  assert.equal(t.discovery.view().available, false);
});

t.spine.sync(t.player, { foundationStage: "ally-koda", lastCompletedRunId: "drill-2", activeRunId: null });
check("After Drill 2, first-session graduation unlocks Explore Alpha", () => {
  assert.equal(t.spine.view().complete, true);
  assert.equal(t.spine.view().milestones.G, true);
  assert.equal(t.spine.choice(t.player, { foundationStage: "ally-koda" }), null);
  assert.equal(t.discovery.view().available, true);
  assert.equal(t.discovery.view().freshGraduate, undefined); // UI's view is intentionally compact
  assert.equal(t.discovery.view().intro, true);
});

check("Explore Alpha guides the player but cannot award anything", async () => {
  const ok = await t.discovery.go("character");
  assert.equal(ok, true);
  assert.equal(t.requests.length, 1);
  assert.equal(t.requests[0].id, "character");
  assert.equal(t.requests[0].options.source, "discovery_guide");
  assert.equal(t.discovery.view().intro, false);
});

const reloaded = environment({ store: t.store, initialSignal: { ...t.player.firstSignal } });
check("Returning after graduation retains progress and does not reopen onboarding", () => {
  assert.equal(reloaded.spine.view().complete, true);
  assert.equal(reloaded.discovery.view().available, true);
  assert.equal(reloaded.discovery.view().intro, false);
});

check("DEV FRESH local first-session storage stays separated from real player", () => {
  reloaded.spine.setProfile(true);
  assert.equal(reloaded.spine.view().complete, false);
  reloaded.spine.setProfile(false);
  assert.equal(reloaded.spine.view().complete, true);
});

const lateJoin = environment({
  initialSignal: { eligible: true, faction_selected: true, state: "COMPLETED", world_discovery: "done" }
});
check("Veteran/completed profiles never auto-enrol from completion flag alone", () => {
  assert.equal(lateJoin.spine.view().active, false);
  assert.equal(lateJoin.spine.view().complete, false);
  assert.equal(lateJoin.discovery.view().available, false);
});

console.log("verify_ftue_continuation_v1: PASS", count, "checks (mock only, no backend writes)");
