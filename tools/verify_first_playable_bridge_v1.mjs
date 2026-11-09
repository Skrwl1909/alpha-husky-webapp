import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const missions = read("js/missions.js");
const story = read("js/story_delivery.js");
const onboarding = read("js/onboarding.js");
const cta = read("js/cta.js");

const eligibilitySource = missions.match(/async function firstPlayableBridgeEligible\(\) \{[\s\S]*?\n  \}/)?.[0];
assert.ok(eligibilitySource, "Production eligibility function must exist");
const makeCheck = new Function("window", "_apiPost", eligibilitySource + ";return firstPlayableBridgeEligible");
const eligible = { eligible: true, state: "COMPLETED", world_discovery: "pending", completion: { completed: true } };
const started = { completed: false, foundationStage: "solo-1", activeRunId: null };
const cases = [
  ["fresh CONTACT", eligible, started, true],
  ["next drill", eligible, { ...started, foundationStage: "solo-2" }, true],
  ["CNC stage", eligible, { ...started, foundationStage: "ally-koda", activeRunId: "accepted" }, true],
  ["first signal unfinished", { ...eligible, state: "REWARD_RECEIVED" }, started, false],
  ["equip unconfirmed", { ...eligible, completion: {} }, started, false],
  ["no world pending", { ...eligible, world_discovery: "done" }, started, false],
  ["veteran", { ...eligible, eligible: false }, started, false],
  ["completed foundation", eligible, { ...started, completed: true, foundationStage: "completed" }, false],
  ["invalid run id", eligible, { ...started, activeRunId: 41 }, false],
  ["unknown server state", eligible, null, false],
];
for (const [name, fs, foundation, expected] of cases) {
  const window = {
    StoryDelivery: { gatherInputs: () => ({ firstSignal: fs }) },
    apiPost: async () => foundation ? { ok: true, data: foundation } : { ok: false },
  };
  assert.equal(await makeCheck(window, null)(), expected, name);
}
assert.match(missions, /options\.firstPlayableBridge === true && await firstPlayableBridgeEligible\(\)/);
assert.match(missions, /openFirstPlayableBridge: \(\) => openTacticalOps\(\{ firstPlayableBridge: true \}\)/);
assert.match(onboarding, /current\.completion\?\.completed === true/);
assert.match(onboarding, /window\.Missions\.openFirstPlayableBridge\(\)/);
assert.match(cta, /case "first_playable_bridge":/);

const window = {
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  Onboarding: {
    getFirstSignal: () => eligible,
    getTutorial: () => ({ first_signal: eligible }),
  },
  Missions: { refreshGuided() {}, openFirstPlayableBridge: async () => true },
};
vm.runInNewContext(story, { window, globalThis: window }, { filename: "story_delivery.js" });
const sd = window.StoryDelivery;
sd.observeNextMove("/webapp/tactical-foundation/state", { ok: true, data: started });
assert.equal(sd.resolve(sd.gatherInputs()).id, "S-FS-PLAYABLE-BRIDGE");
sd.observeNextMove("/webapp/tactical-foundation/state", { ok: true, data: { ...started, foundationStage: "solo-2" } });
assert.match(sd.resolve(sd.gatherInputs()).goLabel, /SPLIT CONTACT/);
sd.observeNextMove("/webapp/tactical-foundation/state", { ok: true, data: { ...started, completed: true, foundationStage: "completed" } });
assert.equal(sd.resolve(sd.gatherInputs()).id, "S-FS-FACTION-HANDOFF");
console.log("First Playable Bridge: 10 guard cases + route/Hub regressions PASS");
