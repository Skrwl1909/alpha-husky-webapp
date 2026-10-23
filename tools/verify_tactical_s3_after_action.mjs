import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({ configFile:false, server:{middlewareMode:true,hmr:false}, appType:"custom" });
try {
  const { confirmedConsequence, confirmedReturnAction, matchingAfterActionReceipt } = await server.ssrLoadModule("/tactical-ops-src/ui/s3AfterAction.ts");
  const state = { campaignIntel:{"dead-relay":{courierTraceAcquired:true}}, operations:{"dead-relay":{missions:{"dead-relay-hold":"available"}}}, fieldOps:{board:{cycleId:7,activeMissionIds:["field-relay-hold"]},records:{"field-relay-hold":{lastClearCycle:7,lastChallengeCycle:7}}} };
  const receipt = {runId:"run-1",missionId:"field-relay-hold",victory:true,regionalApplied:true,pressureBefore:3,pressureAfter:1,rankBefore:1,rankAfter:1};
  assert.equal(matchingAfterActionReceipt(receipt, "old-run", receipt.missionId),null,"stale run must not claim a result");
  assert.equal(matchingAfterActionReceipt(receipt, receipt.runId, "dead-relay-hold"),null,"wrong mission must not claim a result");
  assert.equal(matchingAfterActionReceipt(receipt, receipt.runId, receipt.missionId),receipt,"matching receipt remains available");
  assert.equal(confirmedConsequence(null,null,state),null,"no receipt means no world claim");
  assert.equal(confirmedConsequence({...receipt,regionalApplied:false},null,state),null,"unapplied pressure is not a world change");
  assert.match(confirmedConsequence(receipt,null,state).detail,/3 → 1/);
  assert.equal(confirmedConsequence(null,{missionId:"dead-relay-courier",victory:true,intelEarned:false},state),null);
  assert.match(confirmedConsequence(null,{missionId:"dead-relay-courier",victory:true,intelEarned:true},state).label,/COURIER TRACE/);
  assert.equal(confirmedReturnAction(null,null,state),null);
  assert.match(confirmedReturnAction({...receipt,regionalApplied:false},null,state).reason,/Replay to practice|Front secured/);
  assert.equal(confirmedReturnAction({...receipt,victory:false},null,state).title,"TRY A DIFFERENT TACTIC");
  assert.equal(confirmedReturnAction(null,{missionId:"dead-relay-courier",victory:true},state).missionId,"dead-relay-hold");
  console.log("PASS: S3 after-action receipt boundaries and return recommendations");
} finally { await server.close(); }
