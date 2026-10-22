import assert from "node:assert/strict";
import { createServer } from "vite";
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const ops=await vite.ssrLoadModule("/tactical-ops-src/data/operations.ts");
 const hold=ops.getMissionDef("dead-relay-hold");
 assert(hold);
 const noIntel={version:1,courierTraceAcquired:false};
 const intel={version:1,courierTraceAcquired:true};
 assert.equal(ops.missionBattleRules(hold,false,undefined,noIntel).reinforcement.triggerRound,2);
 assert.equal(ops.missionBattleRules(hold,false,undefined,intel).reinforcement.triggerRound,3);
 const acceptedRun={missionId:hold.missionId,campaignContext:noIntel,runId:"old-run"};
 // Resuming an already accepted run must be evaluated against its frozen campaignContext.
 assert.equal(ops.missionBattleRules(hold,false,undefined,acceptedRun.campaignContext).reinforcement.triggerRound,2);
 const field=ops.getMissionDef("field-rearguard");
 assert(field);
 const base={cycleId:17,pressure:3,approach:"standard",reportVersion:3,directiveTier:"standard",directiveSet:"pursuit"};
 const early=ops.missionBattleRules(field,false,base).reinforcement.triggerRound;
 assert.equal(ops.missionBattleRules(field,false,{...base,pressure:1}).reinforcement.triggerRound,early+1);
 assert.equal(ops.missionBattleRules(field,false,base).reinforcement.triggerRound,early,
   "already-accepted pressure context remains frozen even when global region pressure falls");
 for(const id of ["field-rearguard","field-isolated-hold","field-relay-intercept","dead-relay-courier"]) {
   const mission=ops.getMissionDef(id); assert(mission,"mission "+id+" must exist");
 }
 const aa=await vite.ssrLoadModule("/tactical-ops-src/ui/s3AfterAction.ts");
 assert.equal(aa.confirmedConsequence(null,null,{campaignIntel:{"dead-relay":{courierTraceAcquired:true}}}),null);
 console.log("PASS S3: Courier Intel, pressure→reinforcement, frozen accepted context, no phantom server change");
} finally {await vite.close();}
