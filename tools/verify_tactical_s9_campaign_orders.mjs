import assert from "node:assert/strict";import{createServer}from"vite";import{readFileSync}from"node:fs";
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const {tacticalCampaignOrders:orders,tacticalCareerTruth:career}=await server.ssrLoadModule("/tactical-ops-src/ui/tacticalCampaignOrders.ts");
 assert.deepEqual(orders(null),[]);
 const p={completed:true,operations:{"dead-relay":{status:"active",missions:{"dead-relay-courier":"available"}}},fieldOps:{records:{},board:{cycleId:42,activeMissionIds:["field-relay-hold","field-rearguard","field-relay-recovery"]},commander:{unlockedDirectiveTiers:["standard"]},careerRecord:{missionSecures:8,challenges:2,advancedClears:1,frontsSecured:1}}};
 let o=orders(p);
 assert.equal(o[0].id,"story");assert.equal(o[0].missionId,"dead-relay-courier");
 assert.equal(o.find(x=>x.id==="front").missionId,"field-relay-hold");
 assert.equal(o.find(x=>x.id==="challenge").missionId,"field-relay-hold");
 assert.equal(o.find(x=>x.id==="advanced").status,"LOCKED");
 assert.deepEqual(career(p),{missions:8,challenges:2,advanced:1,fronts:1});
 p.fieldOps.records["field-relay-hold"]={lastClearCycle:42,lastChallengeCycle:42,lastAdvancedCycle:42};
 o=orders(p);assert.equal(o.find(x=>x.id==="front").missionId,"field-rearguard");assert.equal(o.find(x=>x.id==="challenge").missionId,"field-rearguard");
 p.fieldOps.activeMissionRun={missionId:"field-rearguard"};assert.equal(orders(p).find(x=>x.id==="resume").status,"IN_PROGRESS");
 p.fieldOps.activeMissionRun=null;p.fieldOps.commander.unlockedDirectiveTiers=["standard","advanced"];
 assert.equal(orders(p).find(x=>x.id==="advanced").missionId,"field-rearguard");
 p.fieldOps.board.cycleId=43;assert.equal(orders(p).find(x=>x.id==="front").missionId,"field-relay-hold");
 const app=readFileSync("tactical-ops-src/ui/App.tsx","utf8");assert(app.includes("tacticalCampaignOrders(progression)"));assert(app.includes("t-campaign-orders"));
 assert(!readFileSync("tactical-ops-src/ui/tacticalCampaignOrders.ts","utf8").includes("localStorage"));
 console.log("PASS S9: story, rotation, challenges, accepted run, advanced gating, career truth, no local fake progression");
}finally{await server.close()}
