import assert from "node:assert/strict";
import { createServer } from "vite";

globalThis.window = { location: { search: "" }, localStorage: { getItem: () => null, setItem: () => {} }, S: {} };
const server = await createServer({
  configFile: false, resolve: { preserveSymlinks: true }, ssr: { external: ["react", "react-dom", "zustand"] },
  server: { middlewareMode: true, hmr: false }, appType: "custom",
});

async function until(predicate) {
  const deadline = Date.now() + 8_000;
  while (!predicate()) {
    assert(Date.now() < deadline, "Tactical client did not reach the expected state");
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

try {
  const { useBattleStore: store } = await server.ssrLoadModule("/tactical-ops-src/store/battleStore.ts");
  const host = await server.ssrLoadModule("/tactical-ops-src/host/foundationProgression.ts");
  const { stepRecover } = await server.ssrLoadModule("/tactical-ops-src/combat/recoverAuthority.ts");
  const missionId = "field-relay-recovery";
  const runId = "field_recover_v1_fixture";
  const stats = { strength: 0, agility: 0, defense: 0, vitality: 0, intelligence: 0, luck: 0 };
  const run = {
    runId, missionId, squadIds: ["alpha", "ally-02", "ally-03"], packMastery: {},
    fieldContext: { cycleId: 7, pressure: 1, approach: "standard", reportVersion: 3, directiveTier: "standard", directiveSet: "pursuit" },
    rulesContract: { source: "BACKEND_SNAPSHOT", rulesetVersion: "tactical-intent-vnext.0", missionId, missionRevision: 1,
      combatProfileVersion: 3, masterySnapshotVersion: 1, rewardPolicyVersion: 1 },
    combatProfileV2: { version: 2, mode: "inputs-only", alpha: { level: 1, base: stats, gear: stats }, pet: null },
    combatProfileV3: { version: 3, mode: "battle-v1", alpha: { hp: 120, atk: 28, def: 12, spd: 14 }, pet: null },
  };
  const canonical = {
    version: 1, revision: 5, completed: true, foundationStage: "completed", vnextStartAvailable: true,
    operations: { "broken-signal": { status: "cleared", missions: {} } },
    fieldOps: {
      records: { [missionId]: { missionId, clearCount: 0 } },
      board: { cycleId: 7, nextRotationAt: Math.floor(Date.now() / 1000) + 3600,
        activeMissionIds: [missionId, "field-relay-hold", "field-squad-survival"], reportVersion: 3, directiveSet: "pursuit" },
      region: { pressure: 1, cycleId: 7 },
      commander: { rank: 1, progress: 0, unlockedApproaches: ["standard"], unlockedDirectiveTiers: ["standard"] },
      activeMissionRun: null,
    },
  };
  let result = stepRecover(run), revision = 0, loseReply = true;
  const calls = [];
  const view = () => ({ runId, revision, token: `token-${revision}`, battle: result.battle,
    threats: result.cycle.pending.map(t => t.plan) });
  window.apiPost = async (path, body) => {
    calls.push({ path, body });
    if (path.endsWith("/recover/state")) return { ok: true, recover: structuredClone(view()) };
    if (path.endsWith("/recover/command")) {
      assert.deepEqual(body, { runId, expectedRevision: revision, token: `token-${revision}`, command: { type: "skip" } });
      result = stepRecover(run, result, body.command);
      revision++;
      if (loseReply) { loseReply = false; throw Error("response lost"); }
      return { ok: true, recover: structuredClone({ ...view(), frames: result.frames }) };
    }
    if (path.endsWith("/mission/start")) {
      assert.equal(body.recoverAuthorityVersion, 1);
      const started = canonical.fieldOps.activeMissionRun == null;
      if (started) canonical.revision++;
      canonical.fieldOps.activeMissionRun = run;
      return { ok: true, data: canonical, run: { ...run, started } };
    }
    if (path.endsWith("/mission/continue")) {
      assert.deepEqual(Object.keys(body).sort(), ["expectedRevision", "requestId", "rulesetVersion", "runId"]);
      return { ok: false, code: "recover_not_terminal" };
    }
    return { ok: true, data: canonical };
  };
  store.setState({ screen: "war-table", busy: false, foundationCompleted: true, onboardingEnabled: true,
    progression: await host.loadFoundationProgression(), progressionStatus: "ready" });
  const deploy = async () => {
    store.getState().openOperationBrief(missionId);
    store.getState().deploy();
    await until(() => store.getState().screen === "battle" && !store.getState().busy);
  };
  await deploy();
  assert.equal(store.getState().currentRunKey, runId, JSON.stringify(calls));
  const firstActor = store.getState().battle.units.find(u => u.id === store.getState().battle.activeId);
  assert(firstActor?.team === "ally" && !firstActor.hasActed, JSON.stringify(firstActor));
  const originalTurn = store.getState().battle.unitTurn;
  store.getState().skipTurn();
  store.getState().skipTurn();
  await until(() => !store.getState().busy);
  assert.equal(calls.filter(call => call.path.endsWith("/recover/command")).length, 1);
  assert.equal(calls.filter(call => call.path.endsWith("/recover/state")).length, 2);
  assert(store.getState().battle.unitTurn > originalTurn);
  const resumedTurn = store.getState().battle.unitTurn;
  store.getState().backToHub();
  await deploy();
  assert.equal(store.getState().battle.unitTurn, resumedTurn, "Resume uses the server position");
  store.getState().skipTurn();
  await until(() => !store.getState().busy);
  assert.equal(revision, 2);
  assert.equal(store.getState().battle.unitTurn, result.battle.unitTurn);
  await assert.rejects(host.continueOperationMission("fixture", canonical.revision, runId, false,
    { victory: true }, undefined, run.rulesContract.rulesetVersion), /recover_not_terminal/);
  console.log("PASS RECOVER client: ordered command, double tap, lost reply, saved resume and report-free settlement");
} finally {
  await server.close();
}
