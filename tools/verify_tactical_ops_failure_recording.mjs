import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Execute the actual TS handler in isolation; no backend or UI mocking framework.
const source = readFileSync(new URL("../tactical-ops-src/store/battleStore.ts", import.meta.url), "utf8");
const bundle = readFileSync(new URL("../js/tactical_ops.js", import.meta.url), "utf8");
function extractHandler() {
  const marker = "const finishIfNeeded = async (g: number) => {";
  const start = source.indexOf(marker);
  assert.ok(start >= 0, "finishIfNeeded handler missing");
  let pos = start + marker.length, depth = 1;
  for (; pos < source.length && depth; pos++) {
    if (source[pos] === "{") depth++;
    else if (source[pos] === "}") depth--;
  }
  assert.equal(depth, 0, "Unbalanced handler");
  return source.slice(start + marker.indexOf("async"), pos).replace("async (g: number) =>", "async (g) =>");
}
const factory = new Function("get", "set", "getMissionDef", "DEAD_RELAY", "sfx", "wait", "runGen", "return " + extractHandler() + ";");
async function finish(missionId, outcome = "defeat", generation = 1, invoked = generation) {
  let saves = 0;
  const state = { screen: "battle", busy: false, selectedMissionId: missionId, battle: { outcome },
    saveFieldResult: () => { saves++; return Promise.resolve(); } };
  const defs = {
    "field-relay-hold": { activity: "FIELD_OP", operationId: "field-ops" },
    "dead-relay-courier": { activity: "CANON", operationId: "dead-relay" },
    "broken-signal-breach": { activity: "CANON", operationId: "broken-signal" },
  };
  const handler = factory(() => state, value => Object.assign(state, value),
    id => defs[id] || null, { operationId: "dead-relay" }, () => {}, async () => {}, generation);
  const completed = await handler(invoked);
  return { screen: state.screen, saves, completed };
}
test("Field Op defeat records the result once", async () => {
  assert.deepEqual(await finish("field-relay-hold"), { screen: "results", saves: 1, completed: true });
});
test("Dead Relay failure must not record a Field Op", async () => {
  assert.deepEqual(await finish("dead-relay-courier"), { screen: "results", saves: 0, completed: true });
});
test("ordinary mission defeat remains on defeat screen", async () => {
  assert.deepEqual(await finish("broken-signal-breach"), { screen: "defeat", saves: 0, completed: true });
});
test("victory is unaffected", async () => {
  assert.deepEqual(await finish("field-relay-hold", "victory"), { screen: "sector", saves: 0, completed: true });
});
test("stale generation cannot auto-record", async () => {
  assert.deepEqual(await finish("field-relay-hold", "defeat", 2, 1), { screen: "battle", saves: 0, completed: true });
});
test("production bundle has the guard and valid JavaScript", () => {
  assert.ok(!bundle.includes("fieldOp&&t().saveFieldResult()"));
  assert.ok(bundle.includes("r?.activity===`FIELD_OP`&&t().saveFieldResult()"));
  assert.doesNotThrow(() => new Function(bundle));
});
