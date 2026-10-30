import assert from 'node:assert/strict';
import {createServer} from 'vite';
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 const [r,p,ops,battle,rules]=await Promise.all(['/tactical-ops-src/ui/returnPurpose.ts','/tactical-ops-src/ui/missionPurpose.ts','/tactical-ops-src/data/operations.ts','/tactical-ops-src/combat/battle.ts','/tactical-ops-src/combat/missionRules.ts'].map(x=>vite.ssrLoadModule(x)));
 const ids=['field-relay-recovery','field-relay-hold','field-squad-survival'];
 const account=(rank=1)=>({completed:true,operations:{},fieldOps:{board:{cycleId:7,activeMissionIds:ids,reportVersion:3,directiveSet:'pursuit'},commander:{rank,progress:0,unlockedApproaches:['standard'],unlockedDirectiveTiers:rank===3?['standard','advanced']:['standard']},records:{}}});
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
 assert.match(r.fieldResultPurpose(sample).exhausted,/already secured/);assert.match(r.fieldResultPurpose(sample).changed,/No regional change confirmed/);
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
 console.log('PASS purpose/return: 12 missions × 2 profiles × 4 contexts; canonical Advanced deadlines; resume across rotation; unique alternatives; rank cap/exhaustion/unavailable; 144 recovery boundaries');
}finally{await vite.close()}
