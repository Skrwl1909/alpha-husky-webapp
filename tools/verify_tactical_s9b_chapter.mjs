import assert from "node:assert/strict";import{createServer}from"vite";
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{
 const {DOCTRINES,parseChapterSnapshot:parse,chapterTransition:transition,chapterNextMission:next,chapterDisplay:display}=await server.ssrLoadModule("/tactical-ops-src/data/campaignChapter.ts");
 const empty={version:1,chapterId:"edge-relay",status:"AVAILABLE",doctrine:null,revision:0,completedMissionIds:[],activeRunId:null,intelEffect:"NONE",intelConsumedByRunId:null,lastReceiptId:null};
 assert.deepEqual(parse(empty),empty);assert.equal(parse({...empty,revision:-1}),null);
 for(const doctrine of Object.keys(DOCTRINES)){
  let s=transition(empty,{type:"SELECT",doctrine,expectedRevision:0,receiptId:"choice-"+doctrine});
  assert.equal(s.doctrine,doctrine);assert.equal(parse(s)?.revision,1);
  assert.throws(()=>transition(s,{type:"SELECT",doctrine:"RECON",expectedRevision:1,receiptId:"switch"}));
  assert.throws(()=>transition(s,{type:"ACCEPT_RUN",missionId:"field-relay-hold",runId:"x",expectedRevision:0,receiptId:"stale"}));
  for(let i=0;i<3;i++){
   const mission=DOCTRINES[doctrine].missions[i];assert.equal(next(s),mission);
   const accepted=transition(s,{type:"ACCEPT_RUN",missionId:mission,runId:"run-"+i,expectedRevision:s.revision,receiptId:"start-"+i});
   assert.equal(transition(s,{type:"ACCEPT_RUN",missionId:mission,runId:"run-"+i,expectedRevision:s.revision,receiptId:"start-"+i}).activeRunId,accepted.activeRunId);
   assert.throws(()=>transition(accepted,{type:"COMPLETE_RUN",missionId:mission,runId:"run-"+i,victory:true,serverVerified:false,expectedRevision:accepted.revision,receiptId:"cheat-"+i}));
   const failed=transition(accepted,{type:"COMPLETE_RUN",missionId:mission,runId:"run-"+i,victory:false,serverVerified:true,expectedRevision:accepted.revision,receiptId:"fail-"+i});
   assert.equal(failed.completedMissionIds.length,i);assert.equal(next(failed),mission);
   s=transition(accepted,{type:"COMPLETE_RUN",missionId:mission,runId:"run-"+i,victory:true,serverVerified:true,expectedRevision:accepted.revision,receiptId:"win-"+i});
  }
  assert.equal(s.status,"COMPLETED");assert.equal(s.intelEffect,DOCTRINES[doctrine].effect);assert.equal(display(s).stage,3);
  assert.deepEqual(parse(s),s);assert.equal(next(s),null);
 }
 assert.equal(parse({...empty,status:"COMPLETED",doctrine:"RECON"}),null);
 const {getMissionDef, missionBattleRules, missionSpawnsForSquad, applyChapterIntelToRules} =
   await server.ssrLoadModule("/tactical-ops-src/data/operations.ts");
 const {selectAcceptedBattleRules} = await server.ssrLoadModule("/tactical-ops-src/combat/types.ts");
 const {createBattle, advanceToNext} = await server.ssrLoadModule("/tactical-ops-src/combat/battle.ts");
 const squad = ["alpha", "ally-02", "ally-03"];
 const guardian = getMissionDef("dead-relay-guardian");
 const common = {sourceChapterId:"edge-relay", missionId:guardian.missionId};
 const delay = {...common, version:1, effect:"DELAY_REINFORCEMENT", baselineRound:3, effectiveRound:4};
 const south = {...common, version:2, effect:"SOUTH_APPROACH", approach:"south"};
 const disruption = {...common, version:2, effect:"COMMAND_DISRUPTION", entry:"north-east"};

 for (const doctrine of Object.values(DOCTRINES)) {
   for (const id of doctrine.missions) assert.equal(getMissionDef(id)?.executable, true, id);
 }
 const battleFor = (mission, intel) => {
   const rules = applyChapterIntelToRules(missionBattleRules(mission), mission.missionId, intel);
   return createBattle(null, missionSpawnsForSquad(mission, squad, null, "standard", intel),
     rules.objective, rules.reinforcement, null, rules.directive);
 };
 const arrival = (state, round) => {
   const advanced = advanceToNext({...state, round:round - 1, actionsLeftInRound:0}).state;
   assert.equal(advanced.round, round);
   return advanced.units.find(unit => unit.id === "guardian-reinforcement");
 };
 selectAcceptedBattleRules(null);
 const legacy = battleFor(guardian);
 selectAcceptedBattleRules({rulesetVersion:"tactical-intent-vnext.0"});
 const ordinary = battleFor(guardian);
 assert.notDeepEqual(legacy.reinforcement.spawn, ordinary.reinforcement.spawn);
 const delayed = battleFor(guardian, delay);
 assert.ok(arrival(ordinary, 3));
 assert.equal(arrival(delayed, 3), undefined);
 assert.ok(arrival(delayed, 4));
 const redirected = battleFor(guardian, disruption);
 const northEast = arrival(redirected, 3);
 assert.ok(northEast);
 assert.deepEqual([northEast.c, northEast.r], [redirected.reinforcement.spawn.c, redirected.reinforcement.spawn.r]);
 assert.equal(northEast.c, arrival(ordinary, 3).c);
 assert.ok(northEast.r < arrival(ordinary, 3).r);
 for (const missionId of ["dead-relay-courier", "dead-relay-hold", "dead-relay-guardian"]) {
   const mission = getMissionDef(missionId);
   const defaultUnits = battleFor(mission).units;
   const southUnits = battleFor(mission, {...south, missionId}).units;
   assert.notDeepEqual(southUnits.filter(unit => unit.team === "ally").map(({c,r}) => [c,r]),
     defaultUnits.filter(unit => unit.team === "ally").map(({c,r}) => [c,r]));
   assert.deepEqual(southUnits.filter(unit => unit.team === "enemy"), defaultUnits.filter(unit => unit.team === "enemy"));
   assert.equal(new Set(southUnits.map(({c,r}) => `${c},${r}`)).size, southUnits.length);
 }
 assert.throws(() => battleFor(getMissionDef("dead-relay-courier"), delay), /chapter_intel_rules_mismatch/);
 selectAcceptedBattleRules(null);
 console.log("PASS S9B doctrine: 3 paths × 3 staged ops, revision CAS, idempotency, no forged results, frozen choice, strict canonical read");
 console.log("PASS S9B Intel: VNext south spawn, delayed arrival, redirected telegraph and arrival; Legacy baseline");
}finally{await server.close()}
