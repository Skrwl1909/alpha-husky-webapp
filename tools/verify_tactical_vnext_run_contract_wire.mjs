#!/usr/bin/env node
/** Frontend acceptance boundary: actual host parser with synthetic transport, no player writes. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createServer} from "vite";

const source=readFileSync("tactical-ops-src/host/foundationProgression.ts","utf8");
assert(source.includes("parseRunRulesContract(value.rulesContract)"),"mission start validates the server-issued rules");
assert(source.includes("parseRunRulesContract(activeValue.rulesContract)"),"resume validates saved run rules");
assert(source.includes("contract.missionId !== activeValue.missionId"),"resume rejects unrelated rules");
assert(source.includes("value.missionId !== missionId"),"mission start rejects a different mission");
assert(source.includes("rulesContract.missionId !== missionId"),"start contract must match requested mission");
assert(source.includes("...(contract ? { rulesContract: contract } : {})"),"accepted rules are carried into run state");

let acceptedRun=null;
let fieldBoard;
let requestMission="field-relay-hold";
let requestRevision;
const snapshot={version:1,foundationStage:"completed",completed:true,revision:5,activeRunId:null};
globalThis.window={
 location:{search:""},
 localStorage:{getItem:()=>null},
 apiPost:async(path,body)=>{
  if(path==="/webapp/tactical-foundation/state") {
   return {ok:true,data:{...snapshot,fieldOps:{records:{},activeMissionRun:structuredClone(acceptedRun),...fieldBoard}}};
  }
  assert.equal(path,"/webapp/tactical-foundation/mission/start");
  assert.equal(body.missionId,requestMission);
  assert.equal(body.missionRevision,requestRevision);
  return {ok:true,data:structuredClone(snapshot),run:structuredClone(acceptedRun)};
 }
};
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const [intent,types,foundation,ops,fieldWindow]=await Promise.all([
  vite.ssrLoadModule("/tactical-ops-src/combat/intentContract.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/types.ts"),
  vite.ssrLoadModule("/tactical-ops-src/host/foundationProgression.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/livingBattlefield.ts"),
 ]);
 const rules={rulesetVersion:"tactical-intent-vnext.0",missionId:"field-relay-hold",
  missionRevision:1,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1,
  source:"BACKEND_SNAPSHOT"};
 const profile={version:3,mode:"battle-v1",alpha:{hp:130,atk:33,def:15,spd:15},pet:null};
 assert(Object.isFrozen(intent.parseRunRulesContract(rules)));
 assert.equal(intent.parseRunRulesContract(null),null);
 assert.throws(()=>intent.parseRunRulesContract({...rules,source:"CLIENT"}),/unsupported/);
 assert.throws(()=>intent.parseRunRulesContract({...rules,extra:true}),/invalid/);
 for (const missionId of ["field-relay-intercept", "dead-relay-hold", "field-squad-survival", "field-rearguard"]) {
  for (const missionRevision of [1,2]) {
   assert.equal(intent.parseRunRulesContract({...rules,missionId,missionRevision}).missionRevision,missionRevision);
  }
  assert.throws(()=>intent.parseRunRulesContract({...rules,missionId,missionRevision:3}),/unsupported/);
 }
 assert.equal(intent.TACTICAL_VNEXT_ENABLED,false,"new run rules do not activate globally");
 const start=()=>foundation.startOperationMission("fixture-start",5,"field-relay-hold");
 // A valid VNext acceptance is carried through, but only the battle-start boundary enables it.
 acceptedRun={runId:"run-10x7",missionId:"field-relay-hold",squadIds:["alpha","ally-02","ally-03"],rulesContract:rules,combatProfileV3:profile};
 const vnext=await start();
 assert.equal(vnext.run.runId,"run-10x7");
 assert.equal(vnext.run.rulesContract.missionId,"field-relay-hold");
 assert(Object.isFrozen(vnext.run.rulesContract));
 assert.equal(types.GRID_COLS,8,"transport alone must not mutate the active battlefield");
 types.selectAcceptedBattleRules(vnext.run.rulesContract);
 intent.selectAcceptedIntentRules(vnext.run.rulesContract);
 assert.equal(types.GRID_COLS,10);
 assert.equal(types.GRID_ROWS,7);
 assert.equal(intent.TACTICAL_VNEXT_ENABLED,true);
 // Legacy accepted run in the same module/session must return to its frozen 8x5 rules.
 acceptedRun={runId:"run-legacy",missionId:"field-relay-hold",squadIds:["alpha","ally-02","ally-03"]};
 const legacy=await start();
 assert.equal(legacy.run.rulesContract,undefined);
 assert.equal(legacy.run.combatProfileV3,undefined);
 assert.equal((await foundation.loadFoundationProgression()).fieldOps.activeMissionRun.combatProfileV3,undefined);
 types.selectAcceptedBattleRules(legacy.run.rulesContract);
 intent.selectAcceptedIntentRules(legacy.run.rulesContract||null);
 assert.equal(types.GRID_COLS,8);
 assert.equal(types.GRID_ROWS,5);
 assert.equal(intent.TACTICAL_VNEXT_ENABLED,false);
 // Reject unrelated or inconsistent server acceptances, even with a valid ruleset.
 acceptedRun={...acceptedRun,runId:"",rulesContract:rules};
 await assert.rejects(start(),e=>e.code==="invalid_progression_response");
 acceptedRun={runId:"wrong-run",missionId:"dead-relay-hold",rulesContract:{...rules,missionId:"dead-relay-hold"}};
 await assert.rejects(start(),e=>e.code==="invalid_progression_response");
 acceptedRun={runId:"rules-mismatch",missionId:"field-relay-hold",rulesContract:{...rules,missionId:"dead-relay-hold"}};
 await assert.rejects(start(),e=>e.code==="invalid_run_rules_contract");
 for (const unsupported of [
  {missionRevision:2},
  {combatProfileVersion:2},
  {combatProfileVersion:4},
  {masterySnapshotVersion:2},
  {rewardPolicyVersion:2},
 ]) {
  acceptedRun={runId:"unsupported-run",missionId:rules.missionId,squadIds:legacy.run.squadIds,
   rulesContract:{...rules,...unsupported}};
  await assert.rejects(start(),/unsupported_run_rules_contract/,`start accepted ${JSON.stringify(unsupported)}`);
  await assert.rejects(foundation.loadFoundationProgression(),/unsupported_run_rules_contract/,`resume accepted ${JSON.stringify(unsupported)}`);
 }
 assert.equal(types.GRID_COLS,8,"rejected start must not switch the active grid");
 assert.equal(intent.TACTICAL_VNEXT_ENABLED,false,"rejected contracts must leave the scheduler unchanged");
 for (const combatProfileV3 of [undefined,null,{version:3}]) {
  acceptedRun={runId:"invalid-profile",missionId:rules.missionId,squadIds:legacy.run.squadIds,rulesContract:rules,
   ...(combatProfileV3===undefined?{}:{combatProfileV3})};
  await assert.rejects(start(),/invalid_combat_profile_v3/,"start must reject a missing or invalid VNext combat profile");
  await assert.rejects(foundation.loadFoundationProgression(),/invalid_combat_profile_v3/,"resume must reject a missing or invalid VNext combat profile");
 }
 // A subsequent accepted VNext run can still activate normally.
 acceptedRun={runId:"new-vnext",missionId:"field-relay-hold",squadIds:legacy.run.squadIds,rulesContract:rules,combatProfileV3:profile};
 const again=await start();
 const resumed=await foundation.loadFoundationProgression();
 assert.deepEqual(resumed.fieldOps.activeMissionRun.rulesContract,again.run.rulesContract);
 assert.deepEqual(again.run.combatProfileV3,profile);
 assert.deepEqual(resumed.fieldOps.activeMissionRun.combatProfileV3,profile);
 assert(Object.isFrozen(resumed.fieldOps.activeMissionRun.rulesContract));
 types.selectAcceptedBattleRules(again.run.rulesContract);
 intent.selectAcceptedIntentRules(again.run.rulesContract||null);
 assert.equal(types.GRID_COLS,10);
 assert.equal(types.GRID_ROWS,7);
 assert.equal(intent.TACTICAL_VNEXT_ENABLED,true);
 for (const missionId of ["field-squad-survival","field-rearguard"]) {
  const capability = {reportVersion:3,surviveRevisionAvailable:2,cycleId:1,
   nextRotationAt:2000000000,directiveSet:"pursuit",
   activeMissionIds:[missionId,"field-relay-hold","field-relay-recovery"]};
  const context = {cycleId:1,pressure:0,approach:"standard",reportVersion:3,directiveTier:"advanced",directiveSet:"pursuit"};
  const board = {board:capability,region:{pressure:0,cycleId:1},
   commander:{rank:3,progress:18,unlockedApproaches:["standard"],unlockedDirectiveTiers:["standard","advanced"]}};
  fieldBoard=board;
  const ruleset=intent.TACTICAL_VNEXT_RULESET;
  const base=ops.getMissionDef(missionId);
  assert.equal(ops.surviveRevisionForRequest(missionId,ruleset,undefined),undefined);
  assert.equal(ops.surviveRevisionForRequest(missionId,undefined,capability),undefined);
  assert.equal(ops.surviveRevisionForRequest(missionId,ruleset,capability,{}),undefined);
  assert.equal(ops.surviveRevisionForRequest(missionId,ruleset,capability,{rulesContract:{...rules,missionId}}),undefined);
  assert.equal(ops.missionForContext(base,context,1),base);
  assert.equal(ops.missionForContext(base,{...context,reportVersion:2},2),base);
  assert.equal(ops.surviveRevisionForRequest(missionId,ruleset,capability),2);
  requestMission=missionId;
  requestRevision=2;
  const revised=ops.missionForContext(base,context,2);
  const duration=missionId==="field-rearguard" ? 5 : 4;
  assert.equal(revised.objective.duration,duration);
  assert.deepEqual(revised.challenge,base.challenge);
  assert.equal(revised.objective.trackingMarksman,true);
  assert.equal(ops.missionForContext(base,{...context,directiveTier:"standard"},2).objective.trackingMarksman,undefined);
  assert.equal(ops.missionBattleRules(revised,false,context).reinforcement.triggerRound,duration);
  assert.equal(ops.missionBattleRules(revised,false,{...context,pressure:2}).reinforcement.triggerRound,duration-1);
  assert.equal(fieldWindow.currentFieldWindow(missionId,capability,board.region,0,"advanced",true).actualRound,duration);
  acceptedRun={runId:"field-survive",missionId,squadIds:legacy.run.squadIds,
   rulesContract:{...rules,missionId,missionRevision:2},fieldContext:context,combatProfileV3:profile};
  const startSurvive=()=>foundation.startOperationMission("survive-start",5,missionId,acceptedRun.squadIds,
   {cycleId:1,approach:"standard",reportVersion:3,directiveTier:"advanced"},ruleset,false,undefined,undefined,2);
  const started=await startSurvive();
  const reloaded=(await foundation.loadFoundationProgression()).fieldOps.activeMissionRun;
  assert.deepEqual(reloaded.rulesContract,started.run.rulesContract);
  assert.deepEqual(reloaded.fieldContext,context);
  assert.equal(ops.surviveRevisionForRequest(missionId,ruleset,undefined,reloaded),2);
  acceptedRun.fieldContext=undefined;
  await assert.rejects(startSurvive(),/invalid_run_rules_contract/);
  await assert.rejects(foundation.loadFoundationProgression(),/invalid_progression_response/);
 }
 assert.equal(ops.surviveRevisionForRequest("field-relay-hold",intent.TACTICAL_VNEXT_RULESET,{reportVersion:3,surviveRevisionAvailable:2}),undefined);
 console.log("PASS: start/resume preserve Legacy and frozen VNext profiles, reject invalid versions and missing/null/malformed V3, 10x7 -> 8x5 -> 10x7");
} finally {await vite.close();}
