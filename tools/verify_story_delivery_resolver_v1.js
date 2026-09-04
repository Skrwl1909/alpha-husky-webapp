import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "js", "story_delivery.js"), "utf8");
const ctaSource = fs.readFileSync(path.join(root, "js", "cta.js"), "utf8");
const onboardingSource = fs.readFileSync(path.join(root, "js", "onboarding.js"), "utf8");
const oathSource = fs.readFileSync(path.join(root, "js", "oath.js"), "utf8");
const awakeningSource = fs.readFileSync(path.join(root, "js", "awakening.js"), "utf8");
const homeNavSource = fs.readFileSync(path.join(root, "js", "home_nav.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appTsx = fs.readFileSync(path.join(root, "tactical-ops-src", "ui", "App.tsx"), "utf8");

const context = { window: {}, console, module: { exports: {} }, exports: {} };
context.global = context.window;
context.globalThis = context.window;
vm.createContext(context);
vm.runInContext(source, context, { filename: "story_delivery.js" });

const StoryDelivery = context.window.StoryDelivery || context.module.exports;
assert.ok(StoryDelivery && typeof StoryDelivery.resolve === "function", "StoryDelivery.resolve must exist");
assert.ok(typeof StoryDelivery.subscribe === "function", "StoryDelivery.subscribe must exist");
assert.ok(typeof StoryDelivery.shouldReplaceOnboardingPrimary === "function", "shouldReplaceOnboardingPrimary must exist");
assert.ok(typeof StoryDelivery.campaignIncomingPrimary === "function", "campaignIncomingPrimary must exist");

function targetOf(scf) {
  return scf && scf.target ? scf.target : null;
}

function assertTarget(scf, expected, label) {
  const actual = targetOf(scf);
  assert.equal(
    JSON.stringify(actual),
    JSON.stringify(expected),
    label + " target mismatch: " + JSON.stringify(actual)
  );
}

const fsFaction = StoryDelivery.resolve({
  firstSignal: { eligible: true, faction_selected: false, state: "NOT_STARTED" }
});
assert.equal(fsFaction.id, "S-FS-FACTION");
assertTarget(fsFaction, { type: "open_action", action: "factions" }, "S-FS-FACTION");
assert.equal(fsFaction.lockedBrief, false);

const fsNotStarted = StoryDelivery.resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "NOT_STARTED" }
});
assert.equal(fsNotStarted.id, "S-FS-NOT-STARTED");
assertTarget(fsNotStarted, { type: "open_action", action: "first_signal" }, "S-FS-NOT-STARTED");

const fsReady = StoryDelivery.resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "MISSION_STARTED", status: "READY" }
});
assert.equal(fsReady.id, "S-FS-READY");
assertTarget(fsReady, { type: "open_action", action: "first_signal" }, "S-FS-READY");

const fsReward = StoryDelivery.resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "REWARD_RECEIVED" }
});
assert.equal(fsReward.id, "S-FS-REWARD");
assertTarget(fsReward, { type: "open_action", action: "first_signal" }, "S-FS-REWARD");

const fsCompletedCampaign = StoryDelivery.resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "COMPLETED" },
  campaign: { ok: true, eligible: true, show: true, campaign: {} }
});
assert.ok(
  fsCompletedCampaign.id === "S-FS-COMPLETED" || fsCompletedCampaign.id === "S-CAMPAIGN-INCOMING",
  "completed + campaign eligible should be S-FS-COMPLETED or S-CAMPAIGN-INCOMING, got " + fsCompletedCampaign.id
);
assertTarget(fsCompletedCampaign, { type: "open_action", action: "campaign" }, "S-FS-COMPLETED eligible");

const fsCompletedMap = StoryDelivery.resolve({
  firstSignal: { eligible: true, faction_selected: true, state: "COMPLETED" },
  campaign: { ok: true, eligible: false, show: false },
  cta: {
    primary: {
      kind: "first_map_action",
      title: "Take your first map action",
      target: { type: "map_node", nodeId: "phantom_nodes" }
    }
  }
});
assert.equal(fsCompletedMap.id, "S-FS-COMPLETED");
assertTarget(fsCompletedMap, { type: "map_node", nodeId: "phantom_nodes" }, "S-FS-COMPLETED fallback CTA");

const incoming = StoryDelivery.resolve({
  campaign: { ok: true, eligible: true, show: true, campaign: {} }
});
assert.equal(incoming.id, "S-CAMPAIGN-INCOMING");
assertTarget(incoming, { type: "open_action", action: "campaign" }, "S-CAMPAIGN-INCOMING");

const breach = StoryDelivery.resolve({
  firstSignal: { eligible: true, state: "COMPLETED", faction_selected: true },
  campaign: { ok: true, eligible: true, show: true, campaign: {} },
  tactical: { breach: "available", recover: "locked" }
});
assert.equal(breach.id, "S-TO-BREACH-AVAILABLE");
assertTarget(breach, { type: "tactical_breach" }, "S-TO-BREACH-AVAILABLE");
assert.equal(breach.lockedBrief, true);

const recover = StoryDelivery.resolve({
  firstSignal: { eligible: true, state: "COMPLETED", faction_selected: true },
  tactical: { breach: "cleared", recover: "cleared" }
});
assert.equal(recover.id, "S-TO-RECOVER-CLEARED");
assertTarget(recover, { type: "tactical_recover_replay" }, "S-TO-RECOVER-CLEARED");
assert.equal(recover.lockedBrief, true);

const siegeWins = StoryDelivery.resolve({
  firstSignal: { eligible: true, state: "COMPLETED", faction_selected: true },
  campaign: { ok: true, eligible: true, show: true, campaign: {} },
  cta: {
    primary: {
      kind: "siege_running_defense",
      title: "Defend the live siege",
      target: { type: "siege", nodeId: "edge_of_chain" }
    }
  }
});
assert.ok(String(siegeWins.id).includes("SIEGE") || siegeWins.ctaKind === "siege_running_defense", "live siege must outrank campaign");
assert.equal(siegeWins.target.type, "siege");

assert.equal(
  StoryDelivery.shouldReplaceOnboardingPrimary(incoming, "first_mission"),
  true,
  "onboarding first_mission may be replaced by campaign incoming"
);
assert.equal(
  StoryDelivery.shouldReplaceOnboardingPrimary(incoming, "siege_running_defense"),
  false,
  "live siege must not be replaced by campaign"
);
assert.equal(
  StoryDelivery.shouldReplaceOnboardingPrimary(breach, "first_mission"),
  false,
  "tactical locked brief must not be replaced"
);
assert.equal(
  StoryDelivery.shouldReplaceOnboardingPrimary(fsCompletedCampaign, "first_map_action"),
  true,
  "post-FIRST-SIGNAL campaign lead may replace onboarding CTA"
);

const campaignPrimary = StoryDelivery.campaignIncomingPrimary();
assert.equal(campaignPrimary.kind, "campaign_incoming");
assert.equal(JSON.stringify(campaignPrimary.target), JSON.stringify({ type: "open_action", action: "campaign" }));

assert.ok(indexSource.includes('id="hubStoryRoot"'), "index.html must contain #hubStoryRoot before Hub goal");
assert.ok(indexSource.indexOf("hubStoryRoot") < indexSource.indexOf('id="hubGoalRoot"'), "#hubStoryRoot must precede #hubGoalRoot");
assert.ok(indexSource.includes("js/story_delivery.js"), "index.html must load story_delivery.js");
assert.ok(indexSource.includes("cta-changed"), "collapsed/expanded CTA CSS must mention .cta-changed");
assert.ok(indexSource.includes("Awakening?.isOpen") || indexSource.includes("Awakening.isOpen"), "boot must skip onboarding while Awakening is open");

assert.ok(ctaSource.includes("campaign_incoming"), "cta playbook must include campaign_incoming");
assert.ok(ctaSource.includes("applyStoryPrimary"), "CTA must export applyStoryPrimary");
assert.ok(ctaSource.includes("getTacticalMissions"), "CTA must export getTacticalMissions");
assert.ok(ctaSource.includes('case "campaign":'), "openAction must handle campaign");
assert.ok(ctaSource.includes('case "first_signal":'), "openAction must handle first_signal");
assert.ok(ctaSource.includes('title: "Trusted route carried the wrong signal."'), "P0 tactical_breach title locked");
assert.ok(ctaSource.includes('go: "Respond to the breach"'), "P0 tactical_breach go locked");
assert.ok(ctaSource.includes('title: "RECOVER SIGNAL"'), "P0 recover title locked");
assert.ok(ctaSource.includes('go: "REPLAY"'), "P0 recover go locked");
assert.ok(
  ctaSource.indexOf('if (missions.breach === "available")') < ctaSource.indexOf("shouldReplaceOnboardingPrimary"),
  "applyCampaignOpening must keep tactical override before story replace"
);
assert.ok(!ctaSource.includes("BREACH CLEARED. RECOVER SIGNAL UNLOCKED."), "do not use stale P0-03 string in CTA");

assert.ok(onboardingSource.includes("Answer RELAY-7"), "FIRST SIGNAL COMPLETED must offer Answer RELAY-7");
assert.ok(onboardingSource.includes("Return to the Map"), "FIRST SIGNAL COMPLETED fallback is Return to the Map");
assert.ok(!onboardingSource.includes("Start Next Mission"), "FIRST SIGNAL must not force Start Next Mission");
assert.ok(!/action === "next"[\s\S]{0,400}openMissions\(/.test(onboardingSource), "COMPLETED next must not call openMissions()");
assert.ok(onboardingSource.includes("See what Alpha recorded"), "legacy tutorial profile copy rewritten");
assert.ok(onboardingSource.includes("Today’s pressure") || onboardingSource.includes("Today's pressure"), "legacy tutorial quests copy rewritten");
assert.ok(onboardingSource.includes("Trace a live route"), "legacy tutorial missions copy rewritten");
assert.ok(onboardingSource.includes("Leave a mark on the chain"), "legacy tutorial chain copy rewritten");
assert.ok(onboardingSource.includes("After the Betrayal Hash, the Alpha Network split into four war-paths. Choose the doctrine you fight under."), "faction tutorial line stays locked");
assert.ok(onboardingSource.includes("FIRST SIGNAL completed; skipping tutorial checklist"), "COMPLETED eligible accounts must not fall into checklist");
assert.ok(onboardingSource.includes("_laterDeferUntil"), "Later during RUNNING must defer auto-reopen");
assert.ok(onboardingSource.includes("identitySequenceOpen"), "do not auto-open onboarding over Awakening/Oath");

assert.ok(oathSource.includes("handoffOnClose"), "Oath close after success must hand off to FIRST SIGNAL");
assert.ok(oathSource.includes("isOpen:"), "Oath.isOpen required");
assert.ok(awakeningSource.includes("isOpen:"), "Awakening.isOpen required");
assert.ok(awakeningSource.includes("maybeOpenOnboarding"), "Awakening complete must open onboarding if Oath does not");
assert.ok(homeNavSource.includes("StoryDelivery"), "openHub must refresh StoryDelivery");

assert.ok(appTsx.includes("RECOVER AVAILABLE."), "authoritative P0-03 string remains in Tactical Ops results");
assert.ok(!source.includes("BREACH CLEARED. RECOVER SIGNAL UNLOCKED."), "story delivery must not use stale P0-03 string");

assert.ok(ctaSource.includes("cta-changed"), "CTA overlay class present");
assert.ok(ctaSource.includes("cta-open"), "CTA open-question class present");
assert.ok(ctaSource.includes("overlayStoryGuide"), "CTA merges SCF into guide");

console.log("verify_story_delivery_resolver_v1: OK");
