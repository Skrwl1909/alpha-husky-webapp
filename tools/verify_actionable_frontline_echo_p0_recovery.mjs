import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../js/living_world.js", import.meta.url), "utf8");
const window = {};
const document = {
  readyState: "loading",
  addEventListener() {},
};

vm.runInNewContext(source, {
  window,
  document,
  console,
  Date,
  Math,
  Number,
  String,
  Set,
  Object,
  Array,
  RegExp,
});

const t = window.LivingWorld?.__test;
assert.ok(t, "LivingWorld test helpers missing");

const now = 2_000_000_000;


const noContinuation = t.normalizeContinuation(null, now);
assert.equal(noContinuation, null);

const oneResponder = t.normalizeContinuation({
  responderCount: 1,
  latestName: "Pillion",
  latestTs: now - 240,
}, now);
assert.equal(oneResponder?.responderCount, 1);
assert.equal(oneResponder?.latestName, "Pillion");
assert.equal(oneResponder?.latestAge, "4m ago");
assert.equal(t.continuationText(oneResponder), "Pillion continued this front");

const manyResponders = t.normalizeContinuation({
  responderCount: 3,
  latestName: "Pillion",
  latestTs: now - 240,
}, now);
assert.equal(t.continuationText(manyResponders), "Pillion +2 more continued this front");

const anonymousResponder = t.normalizeContinuation({
  responderCount: 1,
  latestName: "Unknown",
  latestTs: now - 240,
}, now);
assert.equal(
  t.continuationText(anonymousResponder),
  "Another Pack member continued this front"
);

const actionable = t.normalizeFrontlineEcho({
  kind: "phantom_frontline",
  nodeId: "phantom_nodes",
  cycleId: "2033-05-18",
  ts: now - 60,
  actor: { uid: "123", name: "HowlerOne", faction: "rogue_byte" },
  statusBefore: "Critical",
  statusAfter: "Dangerous",
  consequence: "moved Phantom Nodes from CRITICAL to DANGEROUS",
  currentStatus: "Dangerous",
  currentNeed: "DANGEROUS — FRONTLINE STILL NEEDS SUPPORT",
  continuation: {
    responderCount: 1,
    latestUid: "456",
    latestName: "Pillion",
    latestTs: now - 240,
  },
  cta: { label: "HOLD THE LINE", nodeId: "phantom_nodes", actionable: true },
}, now);

assert.ok(actionable, "Backend-derived Frontline Echo should normalize");
assert.equal(actionable.frontline.nodeId, "phantom_nodes");
assert.equal(actionable.frontline.cta, "HOLD THE LINE");
assert.equal(actionable.frontline.actionable, true);
assert.equal(actionable.profileUid, "123");
assert.equal(actionable.frontline.continuation?.responderCount, 1);
assert.equal(actionable.frontline.continuation?.latestName, "Pillion");
assert.equal(actionable.frontline.continuation?.latestAge, "4m ago");
assert.equal(
  t.continuationText(actionable.frontline.continuation),
  "Pillion continued this front"
);

const viewOnly = t.normalizeFrontlineEcho({
  kind: "phantom_frontline",
  nodeId: "phantom_nodes",
  ts: now - 60,
  actor: { uid: "124", name: "HowlerTwo" },
  statusBefore: "Critical",
  statusAfter: "Dangerous",
  consequence: "moved Phantom Nodes from CRITICAL to DANGEROUS",
  currentStatus: "",
  currentNeed: "CURRENT FRONTLINE STATE UNCONFIRMED",
  cta: { label: "VIEW FRONT", nodeId: "phantom_nodes", actionable: false },
}, now);

assert.equal(viewOnly?.frontline?.cta, "VIEW FRONT");
assert.equal(viewOnly?.frontline?.actionable, false);

const invalidSameBand = t.normalizeFrontlineEcho({
  kind: "phantom_frontline",
  nodeId: "phantom_nodes",
  ts: now - 60,
  actor: { uid: "125", name: "HowlerThree" },
  statusBefore: "Dangerous",
  statusAfter: "Dangerous",
  cta: { label: "HOLD THE LINE", nodeId: "phantom_nodes", actionable: true },
}, now);
assert.equal(invalidSameBand, null, "Same-band evidence must not render as actionable echo");

const invalidRoute = t.normalizeFrontlineEcho({
  kind: "phantom_frontline",
  nodeId: "phantom_nodes",
  ts: now - 60,
  actor: { uid: "126", name: "HowlerFour" },
  statusBefore: "Critical",
  statusAfter: "Dangerous",
  cta: { label: "HOLD THE LINE", nodeId: "wrong_node", actionable: true },
}, now);
assert.equal(invalidRoute?.frontline?.cta, "", "Unexpected CTA route must be suppressed");

const payload = t.normalizePayload({
  liveEchoes: [{
    type: "rare_drop",
    name: "LootHowler",
    uid: "222",
    rarity: "legendary",
    text: "LootHowler found a relic.",
    ts: now - 120,
  }],
  frontlineEcho: {
    kind: "phantom_frontline",
    nodeId: "phantom_nodes",
    ts: now - 60,
    actor: { uid: "123", name: "HowlerOne" },
    statusBefore: "Critical",
    statusAfter: "Dangerous",
    consequence: "moved Phantom Nodes from CRITICAL to DANGEROUS",
    currentNeed: "DANGEROUS — FRONTLINE STILL NEEDS SUPPORT",
    cta: { label: "HOLD THE LINE", nodeId: "phantom_nodes", actionable: true },
  },
  factionPulse: { summary: {} },
}, now);

assert.equal(payload.rows.length, 2);
assert.equal(payload.rows[0].type, "phantom_frontline", "Frontline Echo should take priority in compact World Pulse");
assert.equal(payload.rows[0].frontline.cta, "HOLD THE LINE");

console.log("PASS actionable-frontline-echo-p0 + pack-response-p0 frontend contract");
