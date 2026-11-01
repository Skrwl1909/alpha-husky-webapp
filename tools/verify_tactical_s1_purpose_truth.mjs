import assert from "node:assert/strict";
import {createServer} from "vite";
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const [p,ops,battle]=await Promise.all(["/tactical-ops-src/ui/missionPurpose.ts","/tactical-ops-src/data/operations.ts","/tactical-ops-src/combat/battle.ts"].map(s=>vite.ssrLoadModule(s)));
 for(const m of Object.values(ops.MISSION_DEFS)){
  assert(p.missionGoal(m).length>15,`goal missing ${m.missionId}`);
  assert(p.missionFailure(m).length>10,`fail missing ${m.missionId}`);
  assert.equal(p.missionRewardTruth(m,undefined).clear,m.activity==="FIELD_OP"?"UNKNOWN":"NOT_APPLICABLE");
  const rules=ops.missionBattleRules(m);
  let spawns=m.spawns??[];
  const st=battle.createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
  assert(p.missionLiveProgress(st).length>5,`live status missing ${m.missionId}`);
 }
 assert.equal(Object.keys(ops.MISSION_DEFS).length,12,"twelve authored missions");
 const m=ops.MISSION_DEFS["field-relay-hold"];
 const field={board:{cycleId:7,activeMissionIds:["field-relay-hold"],nextRotationAt:1},commander:{rank:2,progress:9,unlockedApproaches:[]},records:{"field-relay-hold":{lastClearCycle:7,lastChallengeCycle:null}}};
 assert.equal(p.missionRewardTruth(m,field).clear,"SECURED");
 assert.equal(p.missionRewardTruth(m,field).challenge,"AVAILABLE");
 assert(!p.missionRewardTruth(m,field).copy.includes("First clear may"),"no false first clear");
 field.commander.rank=3;
 assert.equal(p.missionRewardTruth(m,field).commander,"CERTIFIED");
 const objective={type:"HOLD",duration:3,progress:1,terminal:{c:3,r:2},radius:1,checkedRound:1};
 assert.equal(p.missionLiveProgress({objective,units:[]}),"HOLD 1/3");
 assert.equal(p.missionLiveProgress({objective:{type:"SURVIVE",duration:4,progress:2},units:[]}),"SURVIVE 2/4");
 const held = {objective,units:[{team:"ally",c:3,r:2,defeated:false}]};
 assert.equal(p.objectiveDirective(held).status,"CONTROLLED");
 assert.equal(p.objectiveDirective({...held,units:[]}).status,"OCCUPY RELAY");
 assert.equal(p.objectiveDirective({...held,units:[{team:"enemy",c:3,r:2,defeated:false}]}).status,"CONTESTED");
 assert.equal(p.objectiveDirective(held).progress,1,"HOLD progress comes from the engine");
 const source = p.deriveMissionPresentation(m,field);
 assert.equal(source.rewardEligibility.clear,"SECURED");
 assert(source.nextAction.missionId==="field-relay-hold");
 // Capabilities expose the Veteran path; ordinary points never promise it.
 for(const capability of [undefined,false,true]) {
  field.veteranProgressionAvailable=capability;
  const truth=p.missionRewardTruth(m,field);
  assert.equal(truth.commander,"CERTIFIED");
  assert.equal(truth.copy.includes("Rank 4 Veteran career"),capability===true);
  assert.equal(truth.copy.includes("No further Commander rank"),capability!==true);
  if(capability===true)assert.match(truth.copy,/not base Commander points/);
 }
 field.commander.rank=4;
 assert.match(p.missionRewardTruth(m,field).copy,/Rank 4 Veteran earned/);
 const previous=p.deriveMissionPresentation(m,field,{missionId:m.missionId,fieldContext:{cycleId:6}});
 assert.equal(previous.rewardEligibility.commander,"CERTIFIED");
 assert.equal(previous.rewardEligibility.clear,"UNKNOWN","old rotation cannot promise current rewards");
 const receipt={victory:true,rankBefore:3,rankAfter:3,progressEarned:2};
 assert.match(p.recordedResultMeaning(receipt),/COMMANDER RANK 3.*2 POINTS RECORDED.*NO ADDITIONAL RANK CONFIRMED/);
 assert.match(p.recordedResultMeaning({...receipt,rankBefore:4,rankAfter:4,progressEarned:0}),/COMMANDER RANK 4.*0 POINTS RECORDED/);
 assert.match(p.recordedResultMeaning({...receipt,rankAfter:4}),/RANK ADVANCE CONFIRMED/);
 const career={before:7,after:8,unlocked:false,reason:"eligible_advanced"};
 assert.match(p.recordedResultMeaning({...receipt,veteranCareer:career}),/VETERAN CAREER 7 → 8\/12/);
 assert(!p.recordedResultMeaning({...receipt,veteranCareer:career}).includes("UNLOCKED"));
 assert.match(p.recordedResultMeaning({...receipt,rankAfter:4,veteranCareer:{...career,after:12,unlocked:true}}),/RANK 4.*PACK EXTRACTION UNLOCKED/);
 assert.match(p.recordedResultMeaning({...receipt,victory:false,veteranCareer:{...career,unlocked:true}}),/MISSION FAILED/);
 assert.match(p.missionGoal(ops.MISSION_DEFS["field-relay-recovery"]),/relay.*orthogonal cell/);
 const nextBoard={...field,board:{...field.board,activeMissionIds:["field-relay-hold","field-squad-survival"]}};
 assert.equal(p.nextFieldMission(nextBoard).missionId,"field-squad-survival","unfinished mission next");
 const frontDone={...nextBoard,records:{"field-relay-hold":{lastClearCycle:7,lastChallengeCycle:7},"field-squad-survival":{lastClearCycle:7,lastChallengeCycle:7}}};
 assert(p.nextFieldMission(frontDone).reason.includes("Front secured"),"no fake new reward");

 console.log("PASS S1: 12 mission descriptions, real objective counters and honest Commander eligibility");
}finally{await vite.close();}
