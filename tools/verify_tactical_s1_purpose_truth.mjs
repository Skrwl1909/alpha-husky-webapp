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
 assert.equal(p.recordedResultMeaning({victory:true,rankAfter:3,progressEarned:2}).includes("NO HIGHER COMMANDER RANK"),true);
 const nextBoard={...field,board:{...field.board,activeMissionIds:["field-relay-hold","field-squad-survival"]}};
 assert.equal(p.nextFieldMission(nextBoard).missionId,"field-squad-survival","unfinished mission next");
 const frontDone={...nextBoard,records:{"field-relay-hold":{lastClearCycle:7,lastChallengeCycle:7},"field-squad-survival":{lastClearCycle:7,lastChallengeCycle:7}}};
 assert(p.nextFieldMission(frontDone).reason.includes("Front secured"),"no fake new reward");

 console.log("PASS S1: 12 mission descriptions, real objective counters and honest Commander eligibility");
}finally{await vite.close();}
