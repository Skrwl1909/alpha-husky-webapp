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
 console.log("PASS S1: 12 mission descriptions, real objective counters and honest Commander eligibility");
}finally{await vite.close();}
