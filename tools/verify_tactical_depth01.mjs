/** Authoritative state is supplied by transport; client never creates the unlock. */
import assert from 'node:assert/strict';
import {createServer} from 'vite';
let response;
globalThis.window={location:{search:''},localStorage:{getItem:()=>null},apiPost:async()=>structuredClone(response)};
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
 const [host,purpose,ops]=await Promise.all(['/tactical-ops-src/host/foundationProgression.ts','/tactical-ops-src/ui/returnPurpose.ts','/tactical-ops-src/data/operations.ts'].map(p=>vite.ssrLoadModule(p)));
 const context={cycleId:0,pressure:2,approach:'standard',reportVersion:4,directiveTier:'advanced',directiveSet:'pursuit',masteryChallenge:'relay-lockdown-v1'};
 const ids=['field-relay-intercept','field-isolated-hold','field-rearguard'];
 const path={version:1,accomplishment:null,unlockedChallenge:null};
 const field={records:Object.fromEntries(ids.map(missionId=>[missionId,{missionId,clearCount:3,completed:true}])),activeMissionRun:null,lastCompletedMissionRunId:null,
   board:{cycleId:1,nextRotationAt:1800000000,activeMissionIds:ids,reportVersion:3,directiveSet:'pursuit'},commander:{rank:3,progress:12,nextRankAt:null,unlockedApproaches:['standard','south'],unlockedDirectiveTiers:['standard','advanced']},region:{regionId:'broken-signal',cycleId:1,pressure:2,label:'HIGH'},masteryPath:path};
 const state={version:1,foundationStage:'completed',completed:true,revision:5,activeRunId:null,fieldOps:field,operations:{'broken-signal':{status:'cleared',missions:{},activeMissionRun:null,lastCompletedMissionRunId:null}}};
 response={ok:true,data:state};
 let parsed=await host.loadFoundationProgression();
 assert.equal(purpose.commandPurpose(parsed).primary.missionId,'field-isolated-hold');
 assert.equal(purpose.commandPurpose(parsed).primary.tier,'advanced');
 assert.match(purpose.commandPurpose(parsed).primary.title,/0\/1/);
 // Aggregate career counters cannot create eligibility in the UI.
 state.fieldOps.careerRecord={version:1,advancedClears:999,missionSecures:999,challenges:999,frontsSecured:999,lastSecuredCycle:0};
 assert.equal((await host.loadFoundationProgression()).fieldOps.masteryPath.accomplishment,null);
 path.accomplishment={missionId:'field-relay-hold',evidence:'SERVER_ADVANCED_HOLD'};path.unlockedChallenge='relay-lockdown-v1';
 parsed=await host.loadFoundationProgression();
 const action=purpose.commandPurpose(parsed).primary;
 assert.equal(action.masteryChallenge,'relay-lockdown-v1');assert(!ids.includes(action.missionId),'unlock is playable outside rotation');
 assert.equal(parsed.fieldOps.masteryPath.firstLockdownClear,undefined,'old backend has no invented completion capability');
 assert(!/save its first completion/.test(purpose.commandPurpose(parsed).primary.reason));
 const firstClear={runId:'field_first',cycleId:0,recordedAt:100};
 response={ok:true,data:{...state,fieldOps:{...field,masteryPath:{...path,firstLockdownClear:firstClear}}}};
 const completed=await host.loadFoundationProgression();
 assert.deepEqual(completed.fieldOps.masteryPath.firstLockdownClear,firstClear);
 const completedPurpose=purpose.commandPurpose(completed);
 assert.match(completedPurpose.primary.title,/SECURE A FIELD OP/,'eligible rotation clear outranks recorded practice');
 assert(ids.includes(completedPurpose.primary.missionId),'next mission must come from the active rotation');
 const optionalPractice=completedPurpose.alternatives.find(a=>a.title==='RELAY LOCKDOWN · COMPLETED');
 assert(optionalPractice,'recorded Lockdown must remain accessible as an optional choice');
 assert.equal(optionalPractice.masteryChallenge,'relay-lockdown-v1');
 assert.match(optionalPractice.reason,/practice/);
 for(const bad of [{...firstClear,recordedAt:true},{...firstClear,runId:'other'}, {...firstClear,extra:1}]){
  response={ok:true,data:{...state,fieldOps:{...field,masteryPath:{...path,firstLockdownClear:bad}}}};
  await assert.rejects(()=>host.loadFoundationProgression(),'malformed permanent proof fails closed');
 }
 const run={runId:'field-accepted',missionId:'field-relay-hold',squadIds:['alpha','ally-02','ally-03'],fieldContext:context};
 response={ok:true,data:state,run};
 const accepted=await host.startOperationMission('test-start',5,'field-relay-hold',run.squadIds,{...context,cycleId:1});
 assert.deepEqual(accepted.run.fieldContext,context,'previous rotation accepted conditions retained');
 for(const broken of [{...context,reportVersion:3},{...context,pressure:1},{...context,masteryChallenge:'unknown'},undefined]){
  response={ok:true,data:state,run:{...run,fieldContext:broken}};
  await assert.rejects(()=>host.startOperationMission('test-invalid',5,'field-relay-hold',run.squadIds,{...context,cycleId:1}));
 }
 response={ok:true,data:{...state,fieldOps:{...field,masteryPath:{...path,unlockedChallenge:null}}}};
 await assert.rejects(()=>host.loadFoundationProgression(),'inconsistent saved unlock must fail closed');
 response={ok:true,data:{...state,fieldOps:{...field,masteryPath:undefined}}};
 assert.equal((await host.loadFoundationProgression()).fieldOps.masteryPath,undefined,'old backend has safe absent default');
 const base=ops.getMissionDef('field-relay-hold');
 assert.equal(ops.missionForContext(base,{reportVersion:3}).objective.holderRadius,undefined,'historical HOLD unchanged');
 const receipt={masteryChallenge:'relay-lockdown-v1',victory:true};
 assert.match(purpose.fieldResultPurpose(receipt).earned,/No currency/);
 assert.match(purpose.fieldResultPurpose(receipt).future,/different holder or squad/);
 assert.match(purpose.fieldResultPurpose(receipt).changed,/No permanent Lockdown completion confirmed/);
 const first={...receipt,lockdownFirstClear:true,firstLockdownClear:firstClear};
 assert.match(purpose.fieldResultPurpose(first).exhausted,/First recorded/);
 assert.match(purpose.fieldResultPurpose({...first,victory:false,lockdownFirstClear:false}).changed,/permanently recorded/);
 const wireReceipt={...receipt,runId:'field_first',missionId:'field-relay-hold',challengeSuccess:true,regionalApplied:false,
   cycleId:0,challengeBonus:0,progressEarned:0,progressBefore:12,progressAfter:12,rankBefore:3,rankAfter:3,
   pressureBefore:2,pressureAfter:2,recordedAt:100,unlockedApproaches:[],lockdownFirstClear:true,firstLockdownClear:firstClear};
 response={ok:true,data:state,fieldResult:wireReceipt};
 assert.deepEqual((await host.continueOperationMission('save',5,'field_first')).fieldResult.firstLockdownClear,firstClear);
 for(const broken of [{...wireReceipt,victory:false},{...wireReceipt,runId:'field_different'},
   {...wireReceipt,firstLockdownClear:{...firstClear,recordedAt:true}}]){
   response={ok:true,data:state,fieldResult:broken};
   assert.equal((await host.continueOperationMission('bad',5,'field_first')).fieldResult,null,'invalid receipt cannot confirm completion');
 }
 console.log('PASS DEPTH01: current goal, specific proof only, persistent unlock, previous rotation, downgrade/malformed rejection, legacy defaults and truthful results');
}finally{await vite.close();}
