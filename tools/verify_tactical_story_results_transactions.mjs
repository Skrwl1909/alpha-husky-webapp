#!/usr/bin/env node
/** Operation 01 save contract. Calls the real Zustand store and host parser with an isolated mock transport. */
import assert from "node:assert/strict";
import { createServer } from "vite";

globalThis.window = { location: { search: "" }, localStorage: { getItem: () => null, setItem: () => {} }, S: {} };
const server = await createServer({
  configFile: false, resolve: { preserveSymlinks: true },
  ssr: { external: ["react", "react-dom", "zustand"] },
  server: { middlewareMode: true, hmr: false }, appType: "custom",
});
try {
  const { useBattleStore: store } = await server.ssrLoadModule("/tactical-ops-src/store/battleStore.ts");
  const { storyResultTruth } = await server.ssrLoadModule("/tactical-ops-src/ui/storyResultTruth.ts");
  const runId = "fixture-broken-signal-01";
  const missionId = "broken-signal-commander";
  const seed = () => ({
    version: 1, foundationStage: "completed", completed: true, revision: 12,
    activeRunId: null, lastCompletedRunId: null, updatedAt: Date.now(),
    operations: {
      "broken-signal": {
        status: "active",
        missions: { "broken-signal-breach": "cleared", "broken-signal-recover": "cleared", [missionId]: "available" },
        activeMissionRun: { runId, missionId, squadIds: ["alpha", "ally-02", "ally-03"] },
        lastCompletedMissionRunId: null,
      },
    },
  });
  let mode = "success", release;
  let requests = [];
  window.apiPost = async (path, body) => {
    assert(path.endsWith("/mission/continue"), "Only story mission continue is allowed");
    requests.push({ path, body });
    if (mode === "pending") await new Promise(resolve => { release = resolve; });
    if (mode === "network") throw new Error("offline");
    const state = structuredClone(seed());
    state.revision++;
    const accepted = mode !== "mismatched";
    state.operations["broken-signal"].lastCompletedMissionRunId = accepted ? runId : "different-run";
    state.operations["broken-signal"].missions[missionId] = accepted ? "cleared" : "available";
    if (accepted) {
      state.operations["broken-signal"].status = "cleared";
      state.operations["dead-relay"] = {
        status: "active", missions: { "dead-relay-courier": "available", "dead-relay-hold": "locked", "dead-relay-guardian": "locked" },
        activeMissionRun: null, lastCompletedMissionRunId: null,
      };
    }
    return { ok: true, data: state, firstClear: true };
  };
  const flush = () => new Promise(resolve => setTimeout(resolve, 0));
  const reset = () => {
    requests = []; mode = "success";
    store.setState({
      screen: "results", foundationCompleted: true, progression: seed(),
      currentRunKey: runId, selectedMissionId: missionId,
      battle: { ...store.getState().battle, outcome: "victory" },
      storySave: null, progressionCommitPending: false, progressionError: null, continueRequestId: null,
    });
  };
  reset();
  let truth = storyResultTruth(store.getState().progression, store.getState().storySave, runId, missionId, false, null);
  assert.equal(truth.phase, "unsaved");
  assert.equal(truth.op02Ready, false);
  mode = "pending";
  store.getState().continueOnboarding();
  store.getState().continueOnboarding();
  assert.equal(requests.length, 1, "Double tap must not double-save");
  assert.equal(store.getState().screen, "results", "No navigation while saving");
  assert.equal(store.getState().progressionCommitPending, true);
  mode = "success"; release(); await flush();
  assert.equal(store.getState().screen, "results", "Stay on Results until save is acknowledged");
  assert.equal(store.getState().storySave?.runId, runId);
  truth = storyResultTruth(store.getState().progression, store.getState().storySave, runId, missionId, false, null);
  assert.equal(truth.phase, "saved"); assert.equal(truth.op02Ready, true);
  assert.equal(storyResultTruth(store.getState().progression, store.getState().storySave, "wrong-run", missionId, false, null).phase, "unsaved");
  store.getState().continueOnboarding();
  assert.equal(store.getState().screen, "war-table", "Second tap navigates only after proof");
  assert.equal(requests.length, 1, "No second request after confirmed save");

  reset(); mode = "network";
  store.getState().continueOnboarding(); await flush();
  assert.equal(store.getState().screen, "results");
  assert.equal(store.getState().storySave, null);
  assert.match(store.getState().progressionError, /Save failed/);
  const firstRequestId = requests[0].body.requestId;
  mode = "success"; store.getState().continueOnboarding(); await flush();
  assert.equal(requests[1].body.requestId, firstRequestId, "Retry must be idempotent");
  assert.equal(store.getState().storySave?.runId, runId);

  reset(); mode = "mismatched";
  store.getState().continueOnboarding(); await flush();
  assert.equal(store.getState().storySave, null, "Another run cannot confirm this victory");
  assert.equal(store.getState().screen, "results");
  assert.equal(store.getState().progressionCommitPending, false);
  const locked = storyResultTruth({ ...seed(), operations: {
    ...seed().operations, "dead-relay": { status: "active", missions: { "dead-relay-courier": "locked" } },
  } }, { runId, missionId, firstClear: true }, runId, missionId, false, null);
  assert.equal(locked.op02Ready, false, "No Operation 02 claim when courier is locked");
  console.log("PASS: saving/pending, double tap, server proof, retry, run identity, OP 02 truth, next-step gate");
} finally {
  await server.close();
}
