import assert from 'node:assert/strict';
import {createServer} from 'vite';
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 const [r,p,ops,battle,rules]=await Promise.all(['/tactical-ops-src/ui/returnPurpose.ts','/tactical-ops-src/ui/missionPurpose.ts','/tactical-ops-src/data/operations.ts','/tactical-ops-src/combat/battle.ts','/tactical-ops-src/combat/missionRules.ts'].map(x=>vite.ssrLoadModule(x)));
 const ids=['field-relay-recovery','field-relay-hold','field-squad-survival'];
 const account=(rank=1)=>({completed:true,operations:{},fieldOps:{board:{cycleId:7,activeMissionIds:ids,reportVersion:3,directiveSet:'pursuit'},commander:{rank,progress:0,unlockedApproaches:['standard'],unlockedDirectiveTiers:rank===3?['standard','advanced']:['standard']},records:Object.fromEntries(ids.map(missionId=>[missionId,{missionId,clearCount:0,lastClearCycle:null,lastChallengeCycle:null,lastAdvancedCycle:null}]))}});
 for(const rank of [1,3]) {
  const a=account(rank),route=r.commandPurpose(a);
  assert.equal(route.primary.missionId,ids[0]);assert.equal(route.primary.title,'SECURE A FIELD OP');
  const targets=[route.primary,...route.alternatives].map(x=>x.missionId);assert.equal(new Set(targets).size,targets.length);
  if(rank===3)assert(route.alternatives.some(a=>a.tier==='advanced'),'Advanced distinct alternative');
  for(const m of Object.values(ops.MISSION_DEFS))for(const reportVersion of [2,3])for(const directiveTier of ['standard','advanced']){
   const context={reportVersion,directiveTier,directiveSet:'pursuit',pressure:2};
   const view=p.deriveMissionPresentation(m,a.fieldOps,null,null,context),resolved=ops.missionForContext(m,context),contract=ops.missionBattleRules(resolved,false,context);
   assert(view.objectiveText&&view.failConditionText&&view.tacticalThreat&&view.nextConsequence,m.missionId);
   if(contract.directive?.maxRounds)assert(view.failConditionText.includes(String(contract.directive.maxRounds)),'Advanced deadline visible '+m.missionId);
   if(resolved.objectiveType==='RECOVER'&&contract.directive?.recoverEveryRounds)assert.match(view.objectiveText,/rounds divisible by 2/);
   if(m.missionId==='field-relay-intercept')assert.equal(view.objectiveText.includes('courier'),reportVersion===3,'Legacy objective kept');
  }
 }
 const veteran=account(3);veteran.fieldOps.records=Object.fromEntries(ids.map(id=>[id,{lastClearCycle:7,lastChallengeCycle:7,lastAdvancedCycle:7}]));
 assert.equal(r.commandPurpose(veteran).primary.title,'PRACTICE WITH YOUR SQUAD');assert.match(r.commandPurpose(veteran).primary.reason,/no new rotation bonus/);
 veteran.fieldOps.records[ids[1]].lastAdvancedCycle=null;assert.equal(r.commandPurpose(veteran).primary.tier,'advanced');
 veteran.fieldOps.activeMissionRun={missionId:'field-rearguard',fieldContext:{cycleId:6,reportVersion:2},squadIds:['alpha','ally-02','ally-03']};
 assert.equal(r.commandPurpose(veteran).primary.missionId,'field-rearguard');assert.equal(r.commandPurpose(veteran).alternatives.length,0);
 assert.equal(p.nextFieldMission(veteran.fieldOps).missionId,'field-rearguard','Prior rotation accepted run takes priority');
 const frozen=p.deriveMissionPresentation(ops.MISSION_DEFS['field-rearguard'],veteran.fieldOps,veteran.fieldOps.activeMissionRun);
 assert.equal(frozen.rewardEligibility.clear,'UNKNOWN','Old accepted cycle cannot promise current rotation bonus');
 const chapter=account(3);chapter.tacticalChapter={status:'ACTIVE',doctrine:'RECON',completedMissionIds:['field-relay-recovery'],activeRunId:null};
 assert.equal(r.commandPurpose(chapter).primary.missionId,'field-relay-intercept');assert(r.commandPurpose(chapter).primary.chapter,'Chapter uses existing chapter start path');
 const story=account();story.operations={'dead-relay':{missions:{'dead-relay-courier':'available'}}};assert.equal(r.commandPurpose(story).primary.missionId,'dead-relay-courier');
 assert.equal(r.commandPurpose({completed:true}).primary,null,'Unavailable is not a new reward');
 const sample={victory:true,firstCycleSecure:false,challengeSuccess:true,challengeBonus:0,xpGranted:0,bonesGranted:0,progressEarned:0,regionalApplied:false,pressureBefore:2,pressureAfter:1};
 assert.match(r.fieldResultPurpose(sample).exhausted,/No current-rotation clear bonus/);assert.match(r.fieldResultPurpose({...sample,regionalApplied:true}).exhausted,/already secured/);assert.match(r.fieldResultPurpose(sample).changed,/No regional change confirmed/);
 assert.match(r.fieldResultPurpose({...sample,rewardAmountsAvailable:false}).earned,/unavailable/);
 assert.match(r.fieldResultPurpose({...sample,regionalApplied:true}).future,/Already accepted runs keep/);
 assert(!r.fieldResultPurpose({...sample,regionalApplied:true,pressureBefore:1,pressureAfter:0}).future.includes('delay'),'No new delay when threshold was already active');
 for(const every of [2,3])for(const round of [1,2,3,4,5,6])for(const distance of [1,2,3])for(const range of [1,2])for(const spent of [true,false]){
  const b={objective:{type:'RECOVER',terminal:{c:0,r:0},completed:false},round,directive:{recoverEveryRounds:every},activeId:'alpha',units:[{id:'alpha',team:'ally',c:distance,r:0,defeated:false,hasActed:spent,recoverRange:range}]};
  const guidance=p.recoverGuidance(b),open=round%every===0;
  assert.equal(battle.canRecover(b),open&&distance<=range&&!spent);
  assert.equal(guidance.status,open?'SIGNAL OPEN':`OPENS ROUND ${Math.ceil(round/every)*every}`);
  assert(guidance.action.includes(`distance ${distance}`)&&guidance.action.includes(`range ${range}`));
 }
 const host=await vite.ssrLoadModule('/tactical-ops-src/host/foundationProgression.ts');
 const rawReceipt={...sample,runId:'recorded',missionId:ids[0],cycleId:7,progressBefore:12,progressAfter:12,rankBefore:3,rankAfter:3,recordedAt:1,unlockedApproaches:[],legacyReport:false};
 delete rawReceipt.xpGranted;delete rawReceipt.bonesGranted;
 const canonical={version:1,foundationStage:'completed',completed:true,revision:1,activeRunId:null,fieldOps:{...account(3).fieldOps,activeMissionRun:null,board:{...account(3).fieldOps.board,nextRotationAt:1793318400},region:{pressure:2,cycleId:7},lastResult:rawReceipt}};
 globalThis.window={apiPost:async()=>({ok:true,data:canonical})};
 assert.equal((await host.loadFoundationProgression()).fieldOps.lastResult.rewardAmountsAvailable,false,'Omitted amounts stay unavailable through real host parser');
 Object.assign(rawReceipt,{xpGranted:0,bonesGranted:0});
 assert.equal((await host.loadFoundationProgression()).fieldOps.lastResult.rewardAmountsAvailable,true,'Confirmed zero distinguished from missing amount');
 const {battleDecision,objectiveDefeat}=await vite.ssrLoadModule('/tactical-ops-src/ui/battleDecision.ts');
 const ready=account(3);
 ready.vnextStartAvailable=true;
 ready.fieldOps.board.nextRotationAt=Math.floor(Date.now()/1000)+3600;
 const won={...rawReceipt,missionId:ids[0]};
 const lost={...won,victory:false,directiveTier:'advanced'};
 assert.equal(battleDecision(ready,lost).label,'RETRY MISSION');
 assert.equal(battleDecision(ready,lost).reviewAction.tier,'advanced');
 assert.match(battleDecision(ready,lost).detail,/round 6/);
 assert.equal(objectiveDefeat(undefined,'HOLD',3,3),'The objective was not secured.');
 assert.match(objectiveDefeat('DEADLINE','HOLD',3,3),/window closed/);
 assert.match(objectiveDefeat('TARGET_ESCAPED','INTERCEPT',3,3),/courier/);
 assert.match(objectiveDefeat(undefined,'SURVIVE',2,3),/member fell/);
 ready.fieldOps.fieldContracts={enabled:true,completed:['rapid-recovery'],eligibleMissionIds:[ids[0],ids[1]]};
 assert.equal(battleDecision(ready,won).action.missionId,ids[1],'completed stale contract never recommended');
 assert.match(battleDecision(ready,won).detail,/three allies standing/);
 ready.fieldOps.fieldContracts.completed=['rapid-recovery','hold-together','cut-the-line'];
 for(const id of ids)Object.assign(ready.fieldOps.records[id],{lastClearCycle:7,lastChallengeCycle:7,lastAdvancedCycle:7});
 assert.match(battleDecision(ready,won).label,/PRACTICE/);
 assert.match(battleDecision(ready,won).detail,/No new rotation progress/);
 assert.deepEqual(battleDecision(ready,won),battleDecision(structuredClone(ready),won),'same canonical reload yields same options');
 ready.fieldOps.board.nextRotationAt=Math.floor(Date.now()/1000)-1;
 assert.equal(battleDecision(ready,lost).action,null);
 assert.equal(battleDecision(ready,lost).refresh,true);
 ready.fieldOps.activeMissionRun={missionId:ids[2],runId:'frozen',squadIds:['alpha','ally-02','ally-03'],fieldContext:{cycleId:6,reportVersion:3}};
 assert(battleDecision(ready,lost).action.resume,'accepted run wins across an expired rotation');
 assert.equal(battleDecision(ready,lost).reviewAction,undefined,'frozen squads have no edit route');
 assert.equal(battleDecision({completed:true,operations:{}},won).action,null);
 const storyReady=account(3);
 storyReady.operations={'dead-relay':{missions:{'dead-relay-hold':'available'}}};
 const courier={missionId:'dead-relay-courier',runId:'courier',victory:true,intelEarned:false};
 assert.equal(battleDecision(storyReady,courier).action.missionId,'dead-relay-hold');
 console.log('PASS purpose/return: 12 missions × 2 profiles × 4 contexts; canonical Advanced deadlines; resume across rotation; unique alternatives; rank cap/exhaustion/unavailable; 144 recovery boundaries');
}finally{await vite.close()}
