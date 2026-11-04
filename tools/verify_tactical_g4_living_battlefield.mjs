import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'vite';
// Synthetic server-shaped data; no user I/O or production request.
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 const {fieldWindow,currentFieldWindow}=await vite.ssrLoadModule('/tactical-ops-src/data/livingBattlefield.ts');
 const {confirmedConsequence}=await vite.ssrLoadModule('/tactical-ops-src/ui/s3AfterAction.ts');
 const {getMissionDef,missionBattleRules}=await vite.ssrLoadModule('/tactical-ops-src/data/operations.ts');
 const examples={ 'field-relay-hold':2,'field-relay-intercept':2,'field-rearguard':3 };
 for(const [id,base] of Object.entries(examples)){
   const mission=getMissionDef(id);
   const context={cycleId:13,pressure:3,approach:'standard',reportVersion:3,directiveTier:'standard',directiveSet:'pursuit'};
   const orig=structuredClone(mission);
   for(const pressure of [3,2,1,0]){
     const data=fieldWindow(mission,{...context,pressure});
     const actual=missionBattleRules(mission,false,{...context,pressure}).reinforcement?.triggerRound;
     assert.equal(data?.actualRound,actual,id+' must use combat resolver');
     assert.equal(data?.actualRound,base+(pressure<2?1:0),id+' threshold');
     assert.equal(data?.baseRound,base);
     assert.equal(data?.delayed,pressure<2);
     assert.match(data?.text||'',/HOUND round/);
   }
   assert.deepEqual(mission,orig,'preview must not mutate canonical mission');
   const board={cycleId:13,nextRotationAt:Math.floor(Date.now()/1000)+3600,
     reportVersion:3,directiveSet:'pursuit',activeMissionIds:[id]};
   assert.equal(currentFieldWindow(id,board,{cycleId:13,pressure:1})?.actualRound,base+1);
   assert.equal(currentFieldWindow(id,board,{cycleId:12,pressure:1}),null,'stale region cannot claim tactical benefit');
   assert.equal(currentFieldWindow(id,{...board,nextRotationAt:1},{cycleId:13,pressure:1}),null,'expired board cannot claim opportunity');
   assert.equal(currentFieldWindow(id,{...board,activeMissionIds:[]},{cycleId:13,pressure:1}),null,'mission must be active');
 }
 const advancedBoard={cycleId:13,nextRotationAt:Math.floor(Date.now()/1000)+3600,
   reportVersion:3,directiveSet:'pursuit',activeMissionIds:['field-isolated-hold','field-rearguard']};
 assert.equal(currentFieldWindow('field-isolated-hold',advancedBoard,{cycleId:13,pressure:1}),null,'Standard isolated hold has no HOUND');
 assert.equal(currentFieldWindow('field-isolated-hold',advancedBoard,{cycleId:13,pressure:1},Date.now(),'advanced')?.actualRound,3,'Advanced pursuit introduces HOUND with reduced-pressure delay');
 assert.equal(currentFieldWindow('field-rearguard',advancedBoard,{cycleId:13,pressure:1},Date.now(),'advanced')?.actualRound,3,'Advanced pursuit moves baseline from 3 to 2 before pressure delay');
 assert.equal(currentFieldWindow('field-rearguard',advancedBoard,{cycleId:13,pressure:2},Date.now(),'advanced')?.actualRound,2,'Advanced pursuit baseline must be truthful');
 assert.equal(fieldWindow(getMissionDef('field-isolated-hold'),{pressure:1}),null,'no fake reinforcement for other directives');
 assert.equal(fieldWindow(getMissionDef('dead-relay-hold'),{pressure:1}),null,'campaign consequence is separate from Field Ops');
 assert.equal(fieldWindow(getMissionDef('field-relay-hold'),undefined),null,'no unsupported prediction');
 assert.equal(fieldWindow(getMissionDef('field-relay-hold'),{pressure:1,masteryChallenge:'relay-lockdown-v1'}),null,'optional mastery is not base Field Op');
 const oldRun={cycleId:12,pressure:3,approach:'standard',reportVersion:3,directiveTier:'advanced',directiveSet:'pursuit'};
 const original=structuredClone(oldRun);
 assert.equal(fieldWindow(getMissionDef('field-relay-hold'),oldRun)?.actualRound,2,'accepted run keeps original timing');
 assert.deepEqual(oldRun,original,'no mutation of accepted context');
 const receipt={victory:true,regionalApplied:true,pressureBefore:2,pressureAfter:1};
 const consequence=confirmedConsequence(receipt,null,null);
 assert.equal(consequence?.label,'SIGNAL PRESSURE CHANGED');
 assert.match(consequence?.detail||'',/one-round reinforcement delay/,'existing Results already explains the true threshold');
 assert.equal(confirmedConsequence({...receipt,regionalApplied:false},null,null),null,'no false regional consequence');
 assert.match(confirmedConsequence({...receipt,pressureBefore:3,pressureAfter:2},null,null)?.detail||'',/remain on schedule/,'3 to 2 is not a delayed HOUND window');
 assert.equal(confirmedConsequence(null,null,null),null,'no receipt, no world change');
 const app=readFileSync('tactical-ops-src/ui/App.tsx','utf8');
 const results=readFileSync('tactical-ops-src/ui/FieldOpResults.tsx','utf8');
 for(const marker of ['data-g4-world-window','data-g4-command-window','data-g4-mission-window','data-g4-brief-window']){
   assert(app.includes(marker),'missing tactical window UI '+marker);
 }
 const impact=readFileSync('tactical-ops-src/ui/afterActionImpact.ts','utf8');
 assert(results.includes('recordedImpact(receipt, consequence)') && results.includes('{receipt && impact ?') &&
   impact.includes('consequence.label') && impact.includes('consequence.detail'),
   'S3 receipt-confirmed consequence must still reach Results through the receipt-only impact presenter');
 assert(!results.includes('data-g4-confirmed-window'),'do not add duplicate Results copy or push primary CTA below fold');
 console.log('PASS G4 living battlefield: actual combat timing 3 missions x 4 pressures, current/expired boards, accepted-run immutability, receipt-gated threshold, UI wiring');
} finally {await vite.close();}
