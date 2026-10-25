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
 console.log("PASS S9B doctrine: 3 paths × 3 staged ops, revision CAS, idempotency, no forged results, frozen choice, strict canonical read");
}finally{await server.close()}
