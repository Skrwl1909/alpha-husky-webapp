#!/usr/bin/env node
/** Read-only global VNext coverage and intent invariant gate. NEVER contacts player API. */
import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom",
});
try {
  const [contracts, intent, battle] = await Promise.all([
    "/tactical-ops-src/data/missionContracts.ts",
    "/tactical-ops-src/combat/intentContract.ts",
    "/tactical-ops-src/combat/battle.ts",
  ].map((p) => server.ssrLoadModule(p)));

  assert.deepEqual(contracts.validateAllMissionBaselines(), [], "every canon and Field mission must match the live legacy contract");
  assert.equal(Object.keys(contracts.MISSION_CONTRACT_BASELINES).length, 12);
  assert.deepEqual(contracts.FOUNDATION_STAGES, ["solo-1", "solo-2", "ally-koda", "full-broken-signal"]);
  const terrain = contracts.legacyOpenTopology();
  assert.deepEqual(contracts.validateScenarioTopology(terrain), []);
  assert.equal(terrain.tiles.length, 40);
  assert(terrain.tiles.every((t) => t.kind === "FLOOR"), "do not claim terrain exists in legacy");
  assert(contracts.validateScenarioTopology({ ...terrain, tiles: terrain.tiles.slice(1) }).includes("topology_incomplete"));
  assert(contracts.validateScenarioTopology({ ...terrain, tiles: [...terrain.tiles.slice(1), terrain.tiles[1]] }).includes("topology_duplicate_cell"));

  const existing = battle.createBattle();
  const state = { ...existing, unitTurn: 4 };
  const alpha = state.units.find((u) => u.id === "alpha");
  const hostile = state.units.find((u) => u.id === "h1");
  assert(alpha && hostile);
  const draft = {
    id: "fixture:threat:1", enemyId: hostile.id, kind: "ATTACK",
    targetUnitId: alpha.id, targetTile: { c: alpha.c, r: alpha.r },
    impactTiles: [{ c: alpha.c, r: alpha.r }], predictedEffect: "One locked strike",
    warnsOnUnitTurn: 4, resolvesOnUnitTurn: 5, responses: ["KILL", "REPOSITION", "PROTECT"],
    fallbackPolicy: "CANCEL",
  };
  const original = structuredClone(draft);
  const announced = intent.announceIntent(draft, state);
  assert.equal(announced.plan.phase, "WINDUP");
  assert.equal(announced.event.type, "threat_announced");
  assert(Object.isFrozen(announced.plan) && Object.isFrozen(announced.plan.responses) &&
    Object.isFrozen(announced.plan.impactTiles) && Object.isFrozen(announced.plan.impactTiles[0]) &&
    Object.isFrozen(announced.plan.targetTile), "forecast snapshot must be deeply immutable");
  assert.deepEqual(draft, original, "must not mutate caller's intent");
  draft.impactTiles[0].c = 7;
  assert.equal(announced.plan.impactTiles[0].c, alpha.c, "plan snapshots target cells");
  assert.equal(intent.adjudicateIntent(announced.plan, state).status, "WAIT");
  const due = { ...state, unitTurn: 5 };
  const committed = intent.adjudicateIntent(announced.plan, due);
  assert.equal(committed.status, "COMMIT");
  assert(Object.isFrozen(committed.plan), "committed plan must stay immutable");
  assert.deepEqual(intent.confirmExecutedIntent(committed.plan, 5, true).map((e) => e.type), ["threat_resolved"]);
  assert.throws(() => intent.confirmExecutedIntent(committed.plan, 5, false), /unconfirmed/);
  assert.throws(() => intent.confirmExecutedIntent(announced.plan, 5, true), /unconfirmed/);
  assert.throws(() => intent.adjudicateIntent(committed.plan, due), /already_committed/);

  const moved = { ...due, units: due.units.map((u) => u.id === alpha.id ? { ...u, c: u.c + 1 } : u) };
  assert.equal(intent.adjudicateIntent(announced.plan, moved).reason, "TARGET_MOVED", "no silent retarget after movement");
  assert.equal(intent.adjudicateIntent(announced.plan, due, true).reason, "COUNTERED");
  const killed = { ...due, units: due.units.map((u) => u.id === hostile.id ? { ...u, hp: 0, defeated: true } : u) };
  assert.equal(intent.adjudicateIntent(announced.plan, killed).reason, "SOURCE_DEFEATED");
  assert.throws(() => intent.announceIntent({ ...original, resolvesOnUnitTurn: 4 }, state), /invalid_tactical_intent/);
  assert.throws(() => intent.announceIntent({ ...original, targetUnitId: "missing" }, state), /invalid_tactical_intent_target/);
  assert.throws(() => intent.announceIntent({ ...original, impactTiles: [{ c: 8, r: 2 }] }, state), /invalid_tactical_intent/);
  assert.throws(() => intent.announceIntent({ ...original, targetTile: { c: 0, r: 0 } }, state), /intent_target_tile_mismatch/);

  assert.equal(intent.TACTICAL_VNEXT_ENABLED, false, "do not deploy unfinished mode to players");
  assert.equal(intent.parseRunRulesContract(undefined), null, "legacy run stays legacy");
  const run = intent.parseRunRulesContract({
    rulesetVersion: intent.TACTICAL_VNEXT_RULESET, missionId: "dead-relay-hold",
    missionRevision: 1, combatProfileVersion: 3, masterySnapshotVersion: 1,
    rewardPolicyVersion: 1, source: "BACKEND_SNAPSHOT",
  });
  assert(Object.isFrozen(run), "server snapshot contract must not be mutable");
  assert.equal(intent.canStartVNextRun(run), false, "flag remains off without backend migration");
  assert.throws(() => intent.parseRunRulesContract({ ...run, rulesetVersion: "legacy" }), /unsupported/);
  assert.throws(() => intent.parseRunRulesContract({ ...run, extra: 1 }), /invalid/);

  console.log("VNEXT_CONTRACT_PASS: 12 missions + Foundation stages; legacy variants; 40-cell topology; intent timing, cancellation, locked targeting, factual ledger, disabled rollout, strict snapshots.");
} finally {
  await server.close();
}
