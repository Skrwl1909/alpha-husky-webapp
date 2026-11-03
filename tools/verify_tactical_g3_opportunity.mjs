/** G3: authoritative opportunities, receipt truth and accepted-run compatibility. */
import assert from 'node:assert/strict';
import {createServer} from 'vite';
const vite = await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
  const [g3, purpose, presentation, after, host] = await Promise.all([
    'data/progressionOpportunity.ts','ui/returnPurpose.ts','ui/missionPurpose.ts','ui/s3AfterAction.ts','host/foundationProgression.ts'
  ].map(path => vite.ssrLoadModule('/tactical-ops-src/'+path)));
  const ids = ['field-relay-recovery','field-relay-hold','field-squad-survival'];
  const records = Object.fromEntries(ids.map(missionId => [missionId,{missionId,clearCount:1,lastClearCycle:7,lastChallengeCycle:7,lastAdvancedCycle:7}]));
  const field = {board:{cycleId:7,nextRotationAt:2000000000,activeMissionIds:ids,reportVersion:3,directiveSet:'pursuit'},commander:{rank:3,progress:12,nextRankAt:null,certificationComplete:true,unlockedApproaches:['standard'],unlockedDirectiveTiers:['standard','advanced']},records,region:{cycleId:7,pressure:0},activeMissionRun:null};
  const projection = {version:1,cycleId:7,status:'eligible',reason:'CREDIT_AVAILABLE',missionIds:[ids[1]],recommendedMissionId:ids[1]};
  const account = {version:1,foundationStage:'completed',completed:true,revision:1,activeRunId:null,operations:{},fieldOps:field};
  assert.equal(g3.veteranOpportunityView(field).status,'unknown','older server cannot imply Veteran eligibility');
  field.veteranOpportunity = projection;
  const original = structuredClone(account);
  const next = purpose.commandPurpose(account).primary;
  assert.equal(next.missionId,ids[1]);assert.equal(next.tier,'advanced');assert.equal(next.title,'VETERAN OPPORTUNITY');
  assert.deepEqual(account,original,'routing is read-only');
  assert.equal(g3.veteranOpportunityView(field,ids[1],{directiveTier:'advanced'}).status,'eligible');
  assert.equal(g3.veteranOpportunityView(field,ids[1],{directiveTier:'standard'}).status,'locked');
  assert.equal(g3.veteranOpportunityView(field,ids[0],{directiveTier:'advanced'}).status,'locked');
  for (const [status,reason] of [['claimed','ROTATION_CREDIT_USED'],['locked','COMMANDER_CERTIFICATION_REQUIRED'],['unknown','STATUS_UNAVAILABLE']]) {
    field.veteranOpportunity = {...projection,status,reason,missionIds:[],recommendedMissionId:null};
    assert.equal(g3.veteranOpportunityView(field).status,status);
    assert.notEqual(purpose.commandPurpose(account).primary.title,'VETERAN OPPORTUNITY');
  }
  field.veteranOpportunity = projection;
  for (const bad of [{...projection,cycleId:6},{...projection,version:2},{...projection,missionIds:['invented']},{...projection,recommendedMissionId:ids[0]},{...projection,status:'claimed'}]) {
    assert.equal(g3.parseVeteranOpportunity(bad,7),undefined);
  }
  field.veteranOpportunity = {...projection,reason:'DIVERSITY_AVAILABLE'};
  assert.match(purpose.commandPurpose(account).primary.reason,/No additional credit/);
  // An accepted earlier rotation/legacy run always wins over today's recommendation.
  field.activeMissionRun = {runId:'field_legacy',missionId:ids[2],squadIds:['alpha','ally-02','ally-03'],fieldContext:{cycleId:6,reportVersion:2,pressure:2,approach:'standard'}};
  const frozen = structuredClone(field.activeMissionRun);
  assert.equal(purpose.commandPurpose(account).primary.missionId,ids[2]);
  assert.equal(purpose.commandPurpose(account).primary.resume,true);
  assert.equal(purpose.commandPurpose(account).alternatives.length,0);
  assert.equal(g3.veteranOpportunityView(field,ids[2],field.activeMissionRun.fieldContext,true).status,'unknown');
  assert.deepEqual(field.activeMissionRun,frozen);
  field.activeMissionRun = null;
  const receipt = {runId:'field_result',missionId:ids[0],victory:true,cycleId:7,challengeSuccess:false,challengeBonus:0,progressEarned:2,firstCycleSecure:true,progressBefore:12,progressAfter:14,rankBefore:3,rankAfter:3,pressureBefore:2,pressureAfter:1,regionalApplied:true,unlockedApproaches:[],legacyReport:false,recordedAt:1,xpGranted:0,bonesGranted:0};
  assert.match(purpose.fieldResultPurpose(receipt).exhausted,/Optional challenge not completed/,'first clear cannot hide an unmet challenge');
  assert.match(purpose.fieldResultPurpose({...receipt,legacyReport:true}).exhausted,/unmeasured/);
  assert.match(g3.veteranReceiptReason('ROTATION_CREDIT_USED'),/cannot grant a second credit/);
  assert.match(g3.veteranReceiptReason('FOUNDATION_REQUIRED_AT_START'),/when this run was accepted/);
  assert.equal(after.confirmedReturnAction(null,null,account),null);
  assert.equal(after.matchingAfterActionReceipt(receipt,'wrong',receipt.missionId),null);
  assert.equal(after.confirmedReturnAction(receipt,null,account).missionId,ids[1],'Results routes to canonical next mission');
  // Real host parser accepts the optional projection, and drops malformed projections only.
  globalThis.window = {apiPost:async()=>({ok:true,data:account})};
  assert.equal((await host.loadFoundationProgression()).fieldOps.veteranOpportunity.status,'eligible');
  field.veteranOpportunity = {...projection,cycleId:6};
  assert.equal((await host.loadFoundationProgression()).fieldOps.veteranOpportunity,undefined);
  const missing = {...field,records:{}};
  const ops = await vite.ssrLoadModule('/tactical-ops-src/data/operations.ts');
  assert.equal(presentation.missionRewardTruth(ops.getMissionDef(ids[0]),missing).clear,'UNKNOWN');
  assert.equal(purpose.commandPurpose({...account,fieldOps:missing}).primary.title,'REVIEW FIELD CONDITIONS');
  const expired = {...field,board:{...field.board,nextRotationAt:1}};
  assert.equal(purpose.commandPurpose({...account,fieldOps:expired}).primary,null,'expired boards cannot recommend an opportunity');
  assert.equal(g3.veteranOpportunityView(expired).status,'unknown');
  console.log('PASS G3: eligible/claimed/locked/unknown; diversity; challenge unmet; host compatibility; matching receipts; correct next CTA; immutable accepted runs');
} finally { await vite.close(); }
