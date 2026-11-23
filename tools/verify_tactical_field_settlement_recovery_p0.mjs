#!/usr/bin/env node
/** Result-settlement recovery against the actual Zustand store and wire parser. No live backend. */
import assert from "node:assert/strict";
import { createServer } from "vite";

globalThis.window = { location: { search: "" }, localStorage: { getItem: () => null, setItem: () => {} }, S: {} };
const vite = await createServer({
  configFile: false, resolve: { preserveSymlinks: true },
  ssr: { external: ["react", "react-dom", "zustand"] },
  server: { middlewareMode: true, hmr: false }, appType: "custom",
});

try {
  const { useBattleStore } = await vite.ssrLoadModule("/tactical-ops-src/store/battleStore.ts");
  // This isolated wire fixture starts at an existing online authority identity.
  // Real plain field_<uuid> initialization/resume is covered by HTTP/store E2E.
  const runId = "field_verified_v1_settlement_fixture";
  const missionId = "field-relay-intercept";
  const receipt = {
    runId, missionId, victory: true, cycleId: 7,
    challengeSuccess: false, challengeBonus: 0, progressEarned: 1,
    progressBefore: 0, progressAfter: 1, rankBefore: 1, rankAfter: 1,
    pressureBefore: 2, pressureAfter: 1, regionalApplied: true,
    unlockedApproaches: ["standard"], recordedAt: 1, xpGranted: 8, bonesGranted: 16,
  };
  const makeState = (result = null, finished = false, id = runId) => ({
    version: 1, foundationStage: "completed", completed: true,
    revision: finished ? 12 : 11, activeRunId: null, updatedAt: 1,
    operations: { "broken-signal": {status: "cleared", missions: {}, activeMissionRun: null, lastCompletedMissionRunId: null} },
    fieldOps: {
      records: { [missionId]: {missionId, clearCount: finished ? 1 : 0, lastClearedAt: 1,
        failCount: 0, lastClearCycle: null, lastChallengeCycle: null} },
      activeMissionRun: finished ? null : {runId: id, missionId, squadIds: ["alpha","ally-02","ally-03"]},
      lastCompletedMissionRunId: finished ? id : null,
      lastResult: result,
      board: {cycleId:7, nextRotationAt:2000000000, activeMissionIds:[missionId,"field-relay-hold","field-squad-survival"]},
      commander: {rank:1, progress:0, nextRankAt:3, unlockedApproaches:["standard"]},
      region: {regionId:"fracture", cycleId:7, pressure:2},
    },
  });
  const reset = () => useBattleStore.setState({
    screen: "results", selectedMissionId: missionId, currentRunKey: runId,
    progression: makeState(), progressionCommitPending: false, progressionError: null,
    continueRequestId: null, fieldResult: null, fieldMilestone: null, chapterMode: false,
    selectedTrialLevel: null, currentFieldContext: null, activeRulesetVersion: null,
    battle: { ...useBattleStore.getState().battle, outcome:"victory", results:{
      victory:true, objectiveComplete:true, turns:4, squadStanding:3, squadDeployed:3,
    } },
  });
  let postMode = "lost", stateMode = "saved", posts = [], reads = 0;
  window.apiPost = async (path, body) => {
    if (path.endsWith("/mission/continue")) {
      posts.push({path,body});
      if (postMode === "lost") throw {status: 503, data:{code:"upstream_timeout"}};
      if (postMode === "stale") throw {status: 409, data:{code:"stale_revision",details:{state:makeState()}}};
      return {ok:true, data:makeState(receipt,true), fieldResult:receipt};
    }
    assert.equal(path,"/webapp/tactical-foundation/state");
    reads++;
    if (stateMode === "offline") throw {status:503,data:{code:"temporarily_unavailable"}};
    if (stateMode === "saved") return {ok:true,data:makeState(receipt,true)};
    if (stateMode === "marker") return {ok:true,data:makeState(null,true)};
    if (stateMode === "foreign") return {ok:true,data:makeState({...receipt,runId:"another_run"},true,"another_run")};
    return {ok:true,data:makeState()};
  };
  const save = async () => { await useBattleStore.getState().saveFieldResult(); return useBattleStore.getState(); };

  reset(); posts=[]; reads=0; postMode="lost"; stateMode="saved";
  let result = await save();
  assert.equal(posts.length,1);
  assert.equal(reads,1,"state must be fetched after uncertain failure");
  assert.equal(result.fieldResult?.runId,runId,"only canonical matching receipt confirms result");
  assert.equal(result.progressionError,null);
  assert.equal(result.screen,"results");
  assert.equal(result.progressionCommitPending,false);

  reset(); posts=[]; reads=0; postMode="stale"; stateMode="saved";
  result=await save();
  assert.equal(result.fieldResult?.runId,runId,"stale error must reconcile against fresh receipt");
  assert.equal(reads,1);

  reset(); posts=[]; reads=0; postMode="lost"; stateMode="foreign";
  result=await save();
  assert.equal(result.fieldResult,null,"never claim another run's receipt");
  assert.match(result.progressionError,/upstream_timeout/);
  const retryId=posts[0].body.requestId;
  postMode="success";
  result=await save();
  assert.equal(posts[1].body.requestId,retryId,"retry must preserve idempotency key");
  assert.equal(result.fieldResult?.runId,runId);

  reset(); posts=[]; reads=0; postMode="lost"; stateMode="offline";
  result=await save();
  assert.equal(result.fieldResult,null);
  assert.match(result.progressionError,/upstream_timeout/);
  assert.equal(result.progressionCommitPending,false);

  reset(); posts=[]; reads=0; postMode="lost"; stateMode="marker";
  result=await save();
  assert.equal(result.fieldResult,null,"completed marker alone is not a payout receipt");
  assert.match(result.progressionError,/receipt could not be verified/);
  console.log("PASS: lost response recovery, stale revision, cross-run isolation, stable retry, offline uncertainty, marker without receipt");
} finally {
  await vite.close();
}
