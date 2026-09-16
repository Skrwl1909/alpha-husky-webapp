#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const continuitySource = fs.readFileSync(path.join(root, "js", "ftue_continuity.js"), "utf8");
const storySource = fs.readFileSync(path.join(root, "js", "story_delivery.js"), "utf8");
const awakeningSource = fs.readFileSync(path.join(root, "js", "awakening.js"), "utf8");
const oathSource = fs.readFileSync(path.join(root, "js", "oath.js"), "utf8");
const onboardingSource = fs.readFileSync(path.join(root, "js", "onboarding.js"), "utf8");
const ctaSource = fs.readFileSync(path.join(root, "js", "cta.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");

function loadModules() {
  const context = { window: {}, console, module: { exports: {} }, exports: {}, setTimeout, clearTimeout, Date };
  context.global = context.window;
  context.globalThis = context.window;
  context.document = {
    body: { classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } } },
    documentElement: { classList: { add() {}, remove() {} } },
    getElementById() { return null; },
    createElement() { return { textContent: "", id: "" }; },
    head: { appendChild() {} },
    addEventListener() {},
    readyState: "complete"
  };
  vm.createContext(context);
  vm.runInContext(storySource, context, { filename: "story_delivery.js" });
  vm.runInContext(continuitySource, context, { filename: "ftue_continuity.js" });
  return {
    FtueContinuity: context.window.FtueContinuity || context.module.exports,
    StoryDelivery: context.window.StoryDelivery
  };
}

const { FtueContinuity, StoryDelivery } = loadModules();
assert.ok(FtueContinuity && typeof FtueContinuity.isAwakeningFreshEligible === "function");
assert.ok(StoryDelivery && typeof StoryDelivery.resolve === "function");

function eligible(awakening, tutorial) {
  return FtueContinuity.isAwakeningFreshEligible(awakening, tutorial);
}

// ---------- FRESH ELIGIBILITY MATRIX ----------
assert.equal(
  eligible({ ok: true, should_show: true }, { first_signal: { eligible: true, state: "NOT_STARTED" } }),
  true,
  "legitimate new Telegram/mobile account with FIRST SIGNAL enrollment must receive Awakening"
);

assert.equal(
  eligible({ ok: true, should_show: true, started: true, origin_mark: "stray" }, { first_signal: { eligible: true } }),
  true,
  "valid partial fresh account must recover Awakening"
);

assert.equal(
  eligible({ ok: true, should_show: true, started: true, origin_mark: "broken" }, null),
  true,
  "partial fresh recovery does not require tutorial payload if Awakening is already in progress"
);

assert.equal(
  eligible({ ok: true, should_show: false, completed: true }, { first_signal: { eligible: true, state: "NOT_STARTED" } }),
  false,
  "completed Awakening must not show again"
);

assert.equal(
  eligible({ ok: true, should_show: true }, { first_signal: { eligible: true, state: "COMPLETED" } }),
  false,
  "completed onboarding account must not receive Awakening"
);

assert.equal(
  eligible({ ok: true, should_show: true }, { first_signal: { eligible: false }, faction: "rb" }),
  false,
  "faction veteran missing Awakening must not receive fresh-player Awakening"
);

assert.equal(
  eligible({ ok: true, should_show: true }, {}),
  false,
  "legacy veteran missing FIRST SIGNAL enrollment must not receive Awakening"
);

assert.equal(
  eligible({ ok: true, should_show: true }, { first_signal: {} }),
  false,
  "missing FIRST SIGNAL eligible flag is not freshness"
);

assert.equal(
  eligible({ ok: true, should_show: true }, null),
  false,
  "missing Awakening record / should_show alone is not freshness"
);

// ---------- CURRENT OBJECTIVE STATE MAP ----------
function resolve(inputs) {
  return StoryDelivery.resolve(inputs);
}

const awakeningFrame = resolve({
  awakening: { should_show: true },
  tutorial: { first_signal: { eligible: true, state: "NOT_STARTED" } }
});
assert.equal(awakeningFrame.id, "S-AWAKENING");
assert.equal(awakeningFrame.target.action, "awakening");
assert.equal(awakeningFrame.firstSession, true);

const oathFrame = resolve({
  firstSignal: { eligible: true, faction_selected: false, state: "NOT_STARTED" }
});
assert.equal(oathFrame.id, "S-FS-FACTION");
assert.equal(oathFrame.target.action, "factions");

const notStarted = resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "NOT_STARTED" }
});
assert.equal(notStarted.id, "S-FS-NOT-STARTED");
assert.equal(notStarted.target.action, "first_signal");

const running = resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "MISSION_STARTED", status: "RUNNING", remainingSec: 41 }
});
assert.equal(running.id, "S-FS-RUNNING");
assert.equal(running.target.action, "first_signal");

const ready = resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "MISSION_STARTED", status: "READY" }
});
assert.equal(ready.id, "S-FS-READY");
assert.equal(ready.goLabel, "Resolve Mission");

const reward = resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "REWARD_RECEIVED" }
});
assert.equal(reward.id, "S-FS-REWARD");
assert.equal(reward.target.action, "first_signal");

const world = resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "COMPLETED", world_discovery: "pending" }
});
assert.equal(world.id, "S-FS-WORLD");
assert.equal(world.goLabel, "FIND BLOOD MOON TOWER");

assert.equal(FtueContinuity.shouldOwnHomeCta(running), true);
assert.equal(FtueContinuity.shouldOwnHomeCta(ready), true);
assert.equal(FtueContinuity.shouldOwnHomeCta(oathFrame), true);

const veteranLive = resolve({
  firstSignal: { eligible: false },
  cta: { primary: { kind: "bloodmoon_live", title: "Join the Blood-Moon push", target: { type: "bloodmoon" } } }
});
assert.equal(FtueContinuity.shouldOwnHomeCta(veteranLive), false, "protected current-objective treatment must disappear after FTUE");

// ---------- OATH / FIRST SIGNAL CLOSE RECOVERY ----------
assert.ok(oathSource.includes('aria-label="Close The Oath"'), "Oath X close exists");
assert.ok(oathSource.includes("if (event.target === back && !S.busy) close()"), "Oath backdrop close exists");
assert.ok(oathSource.includes('FtueContinuity?.onPresentationClosed?.("oath")'), "incomplete Oath close leaves recoverable objective");
assert.ok(oathSource.includes("S.checked && !options.force"), "Oath auto-open stays session-checked; resume uses force");
assert.ok(onboardingSource.includes('FtueContinuity?.onPresentationClosed?.("onboarding")'), "FIRST SIGNAL dismiss keeps continuity");
assert.ok(onboardingSource.includes("Oath.checkAndOpen"), "faction CTA prefers Oath, not a second faction picker");

// ---------- RUNNING → READY without full reload ----------
const now = Date.UTC(2026, 8, 14, 13, 0, 0);
assert.equal(
  FtueContinuity.readyBoundaryMs({ state: "MISSION_STARTED", status: "RUNNING", remainingSec: 12 }, now),
  12000,
  "remainingSec from server is presentation-only scheduling"
);
assert.equal(
  FtueContinuity.readyBoundaryMs({ state: "MISSION_STARTED", status: "RUNNING", endsAt: now + 3500 }, now),
  3500,
  "endsAt timestamp is authoritative for the READY wake-up"
);
assert.equal(
  FtueContinuity.readyBoundaryMs({ state: "MISSION_STARTED", status: "READY", remainingSec: 0 }, now),
  null,
  "READY does not keep a local timer authority"
);

const beforeReady = resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "MISSION_STARTED", status: "RUNNING", remainingSec: 1 }
});
const afterReady = resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "MISSION_STARTED", status: "READY", remainingSec: 0 }
});
assert.equal(beforeReady.id, "S-FS-RUNNING");
assert.equal(afterReady.id, "S-FS-READY");
assert.equal(afterReady.goLabel, "Resolve Mission");
assert.notEqual(beforeReady.id, afterReady.id, "objective updates when authoritative status crosses READY");

// ---------- AWAKENING SKIP FAILURE ----------
assert.ok(!/catch \(err\) \{[\s\S]{0,180}if \(skipped\) \{\s*close\(\);/.test(awakeningSource), "failed skip must not close Awakening");
assert.ok(awakeningSource.includes("Could not skip Awakening. Try again."), "failed skip shows retry, not false completion");
assert.ok(awakeningSource.includes("S.completeDone = false"), "failed complete does not mark Awakening done");
assert.ok(!awakeningSource.includes("maybeOpenOnboarding") || awakeningSource.indexOf("S.completeDone = true") < awakeningSource.indexOf("maybeOpenOnboarding"), "Oath is not opened unless complete succeeds");

// ---------- SHELL PRIORITY ----------
assert.equal(
  FtueContinuity.isProtectedFtue(
    { firstSignal: { eligible: true, state: "NOT_STARTED" } },
    null
  ),
  true
);
assert.equal(
  FtueContinuity.isProtectedFtue(
    { firstSignal: { eligible: true, state: "COMPLETED", world_discovery: "pending" } },
    null
  ),
  true
);
assert.equal(
  FtueContinuity.isProtectedFtue(
    { firstSignal: { eligible: true, state: "COMPLETED", world_discovery: "done" } },
    null
  ),
  false
);
assert.equal(
  FtueContinuity.isProtectedFtue({ firstSignal: { eligible: false } }, null),
  false,
  "veterans do not enter protected FTUE shell"
);
assert.ok(continuitySource.includes("body.ah-ftue-protected #supportTopWallet"), "Connect Wallet is de-emphasized during protected FTUE");
assert.ok(continuitySource.includes("body.ah-ftue-protected #ahCommunityBtn"), "CHAT is de-emphasized during protected FTUE");
assert.ok(continuitySource.includes("body.ah-ftue-protected #liveEventLine"), "Live Event chip is de-emphasized during protected FTUE");
assert.ok(!continuitySource.includes("AH_LIVE_EVENT"), "do not invent live-event state");

// ---------- IDEMPOTENCY ----------
const cta = FtueContinuity.storyPrimaryFromScf(notStarted);
assert.equal(cta.target.action, "first_signal");
assert.ok(ctaSource.includes('case "first_signal":'), "Home CTA opens the existing FIRST SIGNAL presentation");
assert.ok(ctaSource.includes("Onboarding.openGuided"), "CTA does not start/resolve FIRST SIGNAL itself");
assert.ok(!/openTarget[\s\S]{0,400}first_signal_start/.test(ctaSource), "repeated current-objective taps must not start a mission");
assert.ok(!ctaSource.includes("first_signal_start"), "CTA must not grant or start FIRST SIGNAL");
assert.ok(!continuitySource.includes("first_signal_start"), "continuity layer is presentation-only");
assert.ok(!continuitySource.includes("/webapp/missions/action"), "continuity layer must not mutate missions");

// ---------- WIRING ----------
assert.ok(indexSource.includes("js/ftue_continuity.js"), "index loads ftue_continuity.js");
assert.ok(indexSource.includes("ftue-p0-continuity"), "WEBAPP_VER cache-busts the P0 patch");
assert.ok(ctaSource.includes("shouldOwnHomeCta") || ctaSource.includes("S-AWAKENING"), "Home CTA overlays protected FTUE objective");
assert.ok(ctaSource.includes('case "awakening":'), "Home CTA can resume Awakening");
assert.ok(ctaSource.includes("Oath.checkAndOpen"), "Home faction CTA resumes Oath");
assert.ok(awakeningSource.includes("isFreshEligible"), "Awakening uses explicit fresh enrollment");
assert.ok(storySource.includes("S-AWAKENING"), "Story Delivery derives Awakening as current objective");
assert.ok(ctaSource.includes("refreshContinuity"), "CTA poll/focus refreshes FIRST SIGNAL from the server");

console.log("verify_ftue_p0_continuity: OK");
