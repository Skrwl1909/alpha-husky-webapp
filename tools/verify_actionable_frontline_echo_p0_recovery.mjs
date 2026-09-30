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
const meaningful = t.normalizeEvent({
  type: "node_patrol",
  name: "HowlerOne",
  uid: "123",
  nodeId: "phantom_nodes",
  statusBefore: "Critical",
  statusAfter: "Dangerous",
  text: "HowlerOne pushed the Static Maw back.",
  ts: now - 60,
}, now);

assert.equal(meaningful?.frontline?.nodeId, "phantom_nodes");
assert.equal(meaningful?.frontline?.statusBefore, "critical");
assert.equal(meaningful?.frontline?.statusAfter, "dangerous");

const routine = t.normalizeEvent({
  type: "node_patrol",
  name: "HowlerOne",
  uid: "123",
  nodeId: "phantom_nodes",
  statusBefore: "Dangerous",
  statusAfter: "Dangerous",
  text: "HowlerOne patrolled the front.",
  ts: now - 60,
}, now);
assert.equal(routine, null, "Routine same-band patrol must not become a Frontline Echo");

const actionable = { rows: [structuredClone(meaningful)] };
t.applyFrontlineCurrentState(actionable, {
  info: { packDefenseStatus: "Dangerous", wastelandPressure: 70 },
});
assert.equal(actionable.rows[0].frontline.cta, "HOLD THE LINE");

const resolved = { rows: [structuredClone(meaningful)] };
t.applyFrontlineCurrentState(resolved, {
  info: { packDefenseStatus: "Secured", wastelandPressure: 20 },
});
assert.equal(resolved.rows[0].frontline.cta, "");

const guarded = t.normalizeEvent({
  type: "node_patrol",
  name: "HowlerOne",
  uid: "123",
  nodeId: "phantom_nodes",
  statusBefore: "Critical",
  statusAfter: "Dangerous",
  cycleId: "cycle-a",
  text: "HowlerOne pushed the Static Maw back.",
  ts: now - 60,
}, now);
const mismatch = { rows: [guarded] };
t.applyFrontlineCurrentState(mismatch, {
  info: { packDefenseStatus: "Dangerous", cycleId: "cycle-b" },
});
assert.equal(mismatch.rows[0].frontline.cta, "");

const unknown = { rows: [structuredClone(meaningful)] };
t.applyFrontlineCurrentState(unknown, { info: {} });
assert.equal(unknown.rows[0].frontline.cta, "VIEW FRONT");

console.log("PASS actionable-frontline-echo-p0-recovery");
