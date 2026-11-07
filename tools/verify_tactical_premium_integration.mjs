/** Pin source provenance and protect every production source/contract during integration. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const base='040831f33c34c1a1b02b282215097b0f8f4c0e1d';
const heads=['02908d0c2e9d65c16efc406cff3fae3f6316cade','de5a506d1142b2c61eb8fd8e6b112d0eedfa9a0c'];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:8*1024*1024});
const changed=head=>git('diff','--name-only',base,head).trim().split('\n');
const generated=new Set(['js/tactical_ops.js','js/boot_loaders.js','tactical-ops-src/version.ts']);
const extended='tools/verify_tactical_brief_closure_browser.mjs';
const reviewedMain='50fb6a2e9de7f3c3a905dcb5427f4f97e9701a09';
const g2Baseline='24ac8223966ea60552e4e655f9d9d2e252a71b71';
const overheadMerge='6b78f7812d0a4eae480f13b5ecdf07acf5b78453';
const houndMerge='98b41d5a1b8112c09787a2eca6185df79145d6ca';
const alignmentMerge='71870735afca184e1e7b32d95aca6059a5937d07';
const actorFacingHead='e0978282f812223a1dba9749e7626aa25fdab664';
const actorFacingMerge='887f037bc65bc2f819d13bb0f5a7155b93e4f829';
const combatExperienceBase='f05059c576290ea0b8fcffaca2d7f44d5c405f5d';
const actorFacingBlobs=Object.freeze({
 'tactical-ops-src/ui/Battle.tsx':'158b697d505d96dc65c40fa0ff9b571f94c37291',
 'tactical-ops-src/ui/houndDirectional.css':'6aff7c91ddac17534450ba1e6585cf94b044e5b2',
 'tactical-ops-src/ui/overheadProjection.css':'7b12b872489c5af3a8da4a7efcd890b015430a10',
});
function sourceBlob(source) {
 return execFileSync('git',['hash-object','--stdin'],{input:source,encoding:'utf8'}).trim();
}
const approvedHoundBlobs=Object.freeze({
 'tactical-ops-src/styles.ts':'b1b7e0729b289ee646695257ffcb0e76b84722c2',
 'tactical-ops-src/ui/Battle.tsx':'18edd840fb2ff963ca99e96d7499f61a72cdef96',
 'tactical-ops-src/ui/houndDirectional.css':'b4d1c644c5f8594e3b3ac34355af091d4d4a5e4e',
 'tactical-ops-src/ui/houndDirectional.ts':'eb3bde279ebed29cfe5fbfd9094e888db96a0364',
});
function assertHoundBlob(path, source) {
 assert.equal(sourceBlob(source),approvedHoundBlobs[path],`unreviewed HOUND source: ${path}`);
}
for(const path of Object.keys(approvedHoundBlobs)){
 assert.equal(git('rev-parse',`${houndMerge}:${path}`).trim(),approvedHoundBlobs[path]);
 const source=Object.hasOwn(actorFacingBlobs,path) ? git('show',`${alignmentMerge}:${path}`)
  : readFileSync(path,'utf8').replaceAll('\r\n','\n');
 assertHoundBlob(path,source);
 assert.throws(()=>assertHoundBlob(path,source+'\n/* unreviewed edit */\n'),/unreviewed HOUND source/);
}
function normalizeHoundStyles(source) {
 const imported='import HOUND_DIRECTIONAL_CSS from "./ui/houndDirectional.css?raw";\n';
 const composition=' + OVERHEAD_PROJECTION_CSS + "\\n" + HOUND_DIRECTIONAL_CSS;';
 assert.equal(source.split(imported).length,2,'missing or repeated HOUND CSS import');
 assert.equal(source.split(composition).length,2,'missing or repeated HOUND CSS composition');
 const normalized=source.replace(imported,'').replace(composition,' + OVERHEAD_PROJECTION_CSS;');
 assert.equal(normalized,git('show',`${overheadMerge}:tactical-ops-src/styles.ts`),'unexpected styles after HOUND normalization');
 return normalized;
}
const approvedG2Sources=new Set([
 'tactical-ops-src/data/operations.ts',
 'tactical-ops-src/host/foundationProgression.ts',
 'tactical-ops-src/store/battleStore.ts',
 'tactical-ops-src/ui/App.tsx',
]);
const approvedG3Sources=new Set([
 'tactical-ops-src/data/progressionOpportunity.ts',
 'tactical-ops-src/host/foundationProgression.ts',
 'tactical-ops-src/ui/App.tsx',
 'tactical-ops-src/ui/FieldOpResults.tsx',
 'tactical-ops-src/ui/missionPurpose.ts',
 'tactical-ops-src/ui/returnPurpose.ts',
 'tools/verify_tactical_s1_purpose_truth.mjs',
 'tools/verify_tactical_purpose_return.mjs',
 'tactical-ops-src/version.ts',
 'js/tactical_ops.js',
 'js/boot_loaders.js',
]);

// Phase 04 deliberately restyles these two ordinary Results leaves. The caller,
// receipt ownership, every other source and all legacy paths stay pinned.
const presentationLeaves=new Set(['tactical-ops-src/ui/FieldOpResults.tsx','tactical-ops-src/ui/fieldOpResults.css']);
const updatedBrowserTests=new Set(['tools/verify_field_op_results_premium.mjs','tools/verify_progression_v2_browser.mjs','tools/verify_tactical_depth01_browser.mjs','tools/verify_tactical_depth02_browser.mjs']);
const app='tactical-ops-src/ui/App.tsx';
let preserved=0;
for(const head of heads)for(const path of changed(head)){
 if(generated.has(path)||path===app||path===extended||presentationLeaves.has(path)||updatedBrowserTests.has(path))continue;
 let source=approvedG3Sources.has(path) ? git('show',`${reviewedMain}:${path}`) : approvedG2Sources.has(path) ? git('show',`${g2Baseline}:${path}`) : readFileSync(path,'utf8');
 if(path==='tactical-ops-src/styles.ts'){
  source=normalizeHoundStyles(source);
  // The only allowed new style wiring is our isolated, presentational Command Deck leaf.
  const imported='import COMMAND_DECK_CSS from "./ui/commandDeck.css?raw";\n';
  assert(source.includes(imported),'missing Command Deck CSS import');
  // Strip only the exact approved overhead CSS wiring, then retain the
  // original historical Command Deck provenance comparison unchanged.
  const overheadImport='import OVERHEAD_PROJECTION_CSS from "./ui/overheadProjection.css?raw";\n';
  const overheadComposition=' + FIELD_OP_RESULTS_CSS + "\\n" + COMMAND_DECK_CSS + "\\n" + OVERHEAD_PROJECTION_CSS;';
  const commandComposition=' + FIELD_OP_RESULTS_CSS + "\\n" + COMMAND_DECK_CSS;';
  assert(source.includes(overheadImport),'missing reviewed overhead CSS import');
  assert(source.includes(overheadComposition),'missing reviewed overhead CSS composition');
  assert.equal(source.split(overheadImport).length,2,'overhead CSS import repeated');
  assert.equal(source.split(overheadComposition).length,2,'overhead CSS composition repeated');
  source=source.replace(overheadImport,'').replace(overheadComposition,commandComposition);
  assert(source.includes(commandComposition),'missing canonical style composition');
  source=source.replace(imported,'').replace(commandComposition,' + FIELD_OP_RESULTS_CSS;');
 }
 if(path==='tools/verify_field_op_results_premium.mjs'){
  // Only additive, opt-in visual acceptance is permitted. Prove that removing
  // this block restores every original receipt/interaction assertion verbatim.
  source=source.replace("const cinematic=process.env.RESULTS_CINEMATIC==='1';\n",'')
   .replace("const out=`artifacts/${cinematic?'cinematic-results':'field-results'}/${phase}${production?'-production':''}`;","const out=`artifacts/field-results/${phase}${production?'-production':''}`;")
   .replace(/   if\(cinematic\)\{[\s\S]*?\n   }\n(?=   for\(const b)/,'');
  const defeatCheck="assert.equal(await page.locator('h2').innerText(),'DEFEAT');";
  assert.equal(source.split(defeatCheck).length,2,'the visible defeat heading remains tested exactly once');
  source=source.replace(defeatCheck,"assert.match(await page.locator('h2').innerText(),/MISSION LOST/);");
 }
 if(path==='.github/workflows/tactical-brief-closure.yml'){
  const additions=[
   "      - 'tools/verify_tactical_loadout_browser.mjs'\n",
   "          node tools/verify_tactical_loadout_browser.mjs\n",
   "      - 'tools/verify_tactical_field_contracts_browser.mjs'\n",
   "          node tools/verify_tactical_field_contracts_browser.mjs\n",
  ];
  for(const addition of additions){
   assert.equal(source.split(addition).length,2,'missing or repeated mobile browser coverage');
   source=source.replace(addition,'');
  }
 }
 assert.equal(source,git('show',`${head}:${path}`),`source implementation lost: ${path}`);preserved++;
}
// Updated special-mode assertions must still exercise the original receipt/CTA matrix.
const specialTest=readFileSync('tools/verify_field_op_results_premium.mjs','utf8');
for(const check of ['data-special-result','data-recording','evidence must not auto-open','special primary CTA blocked'])
 assert(specialTest.includes(check),'missing special result QA: '+check);
for(const [file,markers] of [
 ['tools/verify_progression_v2_browser.mjs',['PACK EXTRACTION RUN RECORDED','Recorded Veteran challenge']],
 ['tools/verify_tactical_depth01_browser.mjs',['data-special-result','data-lockdown-completion']],
 ['tools/verify_tactical_depth02_browser.mjs',['data-special-result','data-recorded-plan']]
]){const code=readFileSync(file,'utf8');for(const marker of markers)assert(code.includes(marker),'missing retained browser contract '+file+' '+marker);}
const temp=mkdtempSync(join(tmpdir(),'alpha-integration-'));
try{
 for(const [name,ref] of [['ours',heads[0]],['base',base],['theirs',heads[1]]])writeFileSync(join(temp,name),git('show',`${ref}:${app}`));
 const union=git('merge-file','-p',join(temp,'ours'),join(temp,'base'),join(temp,'theirs'));
 // Special Field Op presentation is an additive results-only branch. Reversing it
 // must restore the exact original integrated App union, including all handlers.
 const current=git('show',`${reviewedMain}:${app}`);
 const voiceBase='411c1a118f5afbb600f3480edada2ec9406e589f';
 const actual=git('show',voiceBase+':'+app);
 let expectedVoice=actual;
 const voiceHunks=[["              <div className=\"t-kicker t-cd-operation-label\">COMMAND PRIORITY / {primaryPurpose?.title || \"NEXT OP\"}</div>","              <div className=\"t-kicker t-cd-operation-label\">NEXT UP / {primaryPurpose?.title || \"NEXT OP\"}</div>"],["              <p className=\"t-player-next-reason\">{primaryPurpose?.resume ? \"Accepted squad and conditions preserved · battle restarts at round 1.\" : primaryPurpose?.reason}</p>","              <p className=\"t-player-next-reason\">{primaryPurpose?.resume ? \"Your squad is saved. Restart from round 1.\" : primaryPurpose?.reason}</p>"],["  const recoverBrief = mission?.objectiveType === \"RECOVER\";","  const recoverBrief = mission?.objectiveType === \"RECOVER\";\n  const quickRecover = recoverBrief && !(mission?.objective?.type === \"RECOVER\" && mission.objective.squadExtractionRadius != null);"],["            <strong>{fieldContext.lockdownPlan ? mission?.briefCopy : fieldContext.masteryChallenge ? \"Hold the exact relay tile · 3 consecutive round changes · finish by round 6.\" : purpose?.objectiveText || (primaryObjective ? primaryObjective.replace(\"PRIMARY OBJECTIVE: \", \"\") : objective)}</strong>","            <strong>{fieldContext.lockdownPlan ? mission?.briefCopy : fieldContext.masteryChallenge ? \"Hold the exact relay tile · 3 consecutive round changes · finish by round 6.\" : quickRecover ? \"GET TO THE RELAY. USE RECOVER.\" : purpose?.objectiveText || (primaryObjective ? primaryObjective.replace(\"PRIMARY OBJECTIVE: \", \"\") : objective)}</strong>\n            {quickRecover ? <p className=\"t-brief-purpose-meta\">Get within RECOVER range (normally 1 tile). {mission?.directive?.recoverEveryRounds ? `Signal opens on rounds ${mission.directive.recoverEveryRounds}, ${mission.directive.recoverEveryRounds * 2}, …` : \"Use RECOVER when the signal opens.\"} Use RECOVER before acting.</p> : null}\n            {quickRecover && purpose ? <details className=\"t-mission-extra\" aria-label=\"Recover rules\"><summary>FULL RECOVER RULES <span>DETAILS +</span></summary><p>{purpose.objectiveText}</p></details> : null}"],["            {fieldOp ? <p className=\"t-brief-purpose-meta\" data-opportunity-status={veteranBrief.status} role=\"status\"><b>VETERAN · {veteranBrief.status.toUpperCase()}:</b> {veteranBrief.copy}</p> : null}","            {fieldOp ? <p className=\"t-brief-purpose-meta\" data-opportunity-status={veteranBrief.status} role=\"status\"><b>{veteranBrief.status === \"claimed\" ? \"VETERAN CREDIT SAVED\" : veteranBrief.status === \"eligible\" ? \"VETERAN CHANCE!\" : veteranBrief.status === \"locked\" ? \"VETERAN NOT READY\" : \"VETERAN STATUS UNKNOWN\"}:</b> {veteranBrief.copy}</p> : null}"],["                <span className=\"t-kicker\">{fieldContext.masteryChallenge ? 'Completion' : 'Clear reward'}</span>","                <span className=\"t-kicker\">{fieldContext.masteryChallenge ? 'Completion' : 'First win'}</span>"]];
 for(const [before,after] of voiceHunks){assert(expectedVoice.includes(before),'missing reviewed player-voice insertion');expectedVoice=expectedVoice.replace(before,after);}
 assert.equal(git('show',`${combatExperienceBase}:${app}`),expectedVoice,'unreviewed App change outside five scoped player-voice edits');
 let expectedBattle=git('show',voiceBase+':tactical-ops-src/ui/Battle.tsx');
 const battleHunks=[["import { missionLiveProgress, objectiveDirective, recoverGuidance } from \"./missionPurpose\";","import { missionLiveProgress, objectiveDirective, recoverGuidance } from \"./missionPurpose\";\nimport { fieldWindow } from \"../data/livingBattlefield\";"],["  const mission = getMissionDef(useBattleStore((s) => s.selectedMissionId));\n  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);","  const mission = getMissionDef(useBattleStore((s) => s.selectedMissionId));\n  const acceptedContext = useBattleStore((s) => s.currentFieldContext);\n  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);"],["  const objective = battle.objective;\n  if (!rulesText && !mission?.challenge && !objective && !training) return null;","  const objective = battle.objective;\n  const activeHound = battle.reinforcement;\n  const acceptedWindow = mission ? fieldWindow(mission, acceptedContext) : null;\n  const packBoughtTime = Boolean(acceptedWindow?.delayed && activeHound &&\n    !activeHound.spawned && acceptedWindow.actualRound === activeHound.triggerRound);\n  if (!rulesText && !mission?.challenge && !objective && !training) return null;"],["      <small className=\"t-objective-action\">{directive.action}</small>","      <small className=\"t-objective-action\">{directive.action}</small>\n      {packBoughtTime ? <small data-player-voice-hound=\"true\">HOUND HELD BACK! · ARRIVES ROUND {activeHound!.triggerRound}</small> : null}"],["<span>INBOUND</span><small>HOUND</small>","<span>HOUND INCOMING!</span><small>ROUND {reinforcement.triggerRound}</small>"]];
 for(const [before,after] of battleHunks){assert(expectedBattle.includes(before),'missing reviewed combat message insertion');expectedBattle=expectedBattle.replace(before,after);}
 // Normalize only the approved passive camera marker; the original
 // byte-for-byte Battle provenance comparison remains authoritative.
 const overheadBattle=git('show',`${overheadMerge}:tactical-ops-src/ui/Battle.tsx`);
 const overheadMarker='      data-projection="relay-overhead-v1"\n';
 assert.equal(overheadBattle.split(overheadMarker).length,2,'missing or repeated overhead camera marker');
 assert.equal(overheadBattle.replace(overheadMarker,''),expectedBattle,
  'unreviewed Battle change outside scoped combat UI');
 // Remove only the eight exact reviewed G4 UI additions; every other App byte is pinned.
 let normalizedG4=actual;
 for(const snippet of [
 "\nimport { currentFieldWindow, fieldWindow } from \"../data/livingBattlefield\";",
 "\n  const highlightedFieldWindow = activeMissionIds.map(id => ({ id, window: currentFieldWindow(id, field?.board, field?.region) })).find(item => item.window) || null;",
 "\n              {primaryPurpose && !primaryPurpose.resume && recommendedMission?.activity === \"FIELD_OP\" && currentFieldWindow(recommendedMission.missionId, field?.board, field?.region, Date.now(), primaryPurpose.tier) ? <p className=\"t-brief-purpose-meta\" data-g4-command-window=\"true\">{currentFieldWindow(recommendedMission.missionId, field?.board, field?.region, Date.now(), primaryPurpose.tier)?.text}</p> : null}",
 "\n            {highlightedFieldWindow ? <small data-g4-world-window=\"true\">{getMissionDef(highlightedFieldWindow.id)?.name} · {highlightedFieldWindow.window?.text}</small> : null}",
 "\n              const tacticalWindow = currentFieldWindow(mission.missionId, field?.board, field?.region);",
 "\n                    {tacticalWindow ? <p className=\"t-brief-purpose-meta\" data-g4-mission-window=\"true\">{tacticalWindow.text}</p> : null}",
 "\n  const deploymentWindow = fieldOp && mission ? resuming ? fieldWindow(mission, savedRun?.fieldContext) : currentFieldWindow(mission.missionId, field?.board, field?.region, Date.now(), selectedDirectiveTier) : null;",
 "\n                {deploymentWindow ? <small data-g4-brief-window=\"true\">{resuming ? \"ACCEPTED TIMING · \" : \"NEXT DEPLOYMENT · \"}{deploymentWindow.text}</small> : null}"
]) {
  assert(normalizedG4.includes(snippet),'missing audited G4 App insertion: '+snippet.slice(0,65));
  normalizedG4=normalizedG4.replace(snippet,'');
 }
 const baselineActual=git('show',`${g2Baseline}:${app}`);
 // G2 may change only the frozen run's Brief mission selector.
 const oldHoldSelector='missionForContext(baseMission, fieldContext, resuming ? savedRun?.rulesContract?.missionRevision : undefined)';
 const newHoldSelector='missionForContext(baseMission, fieldContext, resuming ? savedRun?.rulesContract?.missionRevision : undefined, resuming ? campaignContext : null)';
 assert.equal(normalizedG4.replace(newHoldSelector,oldHoldSelector),baselineActual,
  'G2 changed App outside the frozen Hold mission selector');
 const beforeG3=baselineActual.slice(0,baselineActual.indexOf('function WarTable()'))
  .replace('import { veteranOpportunityView } from "../data/progressionOpportunity";\n','')
  .replace('import { currentFieldWindow, fieldWindow } from "../data/livingBattlefield";\n','');
 assert.equal(beforeG3, current.slice(0,current.indexOf('function WarTable()')),
  'G3 changed unrelated App declarations or imports');
 const fromSector=x=>x.slice(x.indexOf('function Sector()'));
 assert.equal(fromSector(baselineActual),fromSector(current),
  'G3 changed unrelated battle, results or app entry points');
 for(const marker of ['veteranOpportunityView(field)',
     'data-opportunity-status={veteranView.status}',
     'data-opportunity-status={veteranBrief.status}'])
  assert(actual.includes(marker),'missing G3 integration: '+marker);
 const commandBaseline=git('show','281335d26b5fbdc83977de869edab74c222fe1ab:'+app);
 const cutBefore=x=>x.slice(0,x.indexOf('function WarTable()'));
 const cutAfter=x=>x.slice(x.indexOf('function Brief()'));
 assert.equal(cutBefore(current),cutBefore(commandBaseline),'code before War Table changed');
 assert.equal(cutAfter(current),cutAfter(commandBaseline),'Brief, Battle, Results or actions changed outside War Table');
 for(const marker of ['t-command-deck-v3','t-cd-records','t-cd-status','t-cd-selected-operation']) assert(current.includes(marker),'missing Command Deck '+marker);
 const normalized=commandBaseline.replace('import { FieldOpResults, SpecialFieldOpResults } from "./FieldOpResults";',
   'import { FieldOpResults } from "./FieldOpResults";')
   .replace(/  const specialKind = !chapterMode[\s\S]*?(?=  return \(\n    <div className="t-fill">\n      <Background dim=\{0\.6\} \/>\n      <div className="t-overlay t-results-overlay">)/,'');
 assert.equal(normalized,union,'App must retain original three-way union outside special Results branch');
}finally{rmSync(temp,{recursive:true,force:true});}
// Keep the historical UI comparisons above. Protect the working tree against
// the exact merged production baseline, including Browser Guest from PR #237.
const mergedBaseline='7ffa44997b71cb4c7c3fa230abaf88c9f72444dc';
git('merge-base','--is-ancestor',mergedBaseline,'HEAD');
// Approved immutable Git blob hashes were independently reviewed before
// this change (not generated from the working tree at test time).
// Any edit, including to camera, touch geometry or scene mapping, must fail.
const approvedOverheadBlobs=Object.freeze({
 'tactical-ops-src/combat/movement.ts': 'da860cee9b335eadffd6c0cff8d11232d23df6f6',
 'tactical-ops-src/ui/battlePresentation.ts': 'ca8715fa5940f337f6f51d8e248d04ef16aa26d5',
 'tactical-ops-src/data/operations.ts': '3bd74f6bfe3b97b6d4767291ef74b72d20ff17ae',
 'tactical-ops-src/ui/overheadProjection.css': '27f2ff02637931c38e599f2f1815ccabb5493e3c',
 'tactical-ops-src/ui/Battle.tsx': '857360586ff25668c6e2a2b1b39de2bcf7d0ad83',
 'tactical-ops-src/styles.ts': 'c25ef822860a41017c6e4d3c2faa4ceeec878b5b',
});
for(const [path,approvedBlob] of Object.entries(approvedOverheadBlobs)){
 const actualBlob=git('rev-parse',`${overheadMerge}:${path}`).trim();
 assert.equal(actualBlob,approvedBlob,'unauthorized overhead source change: '+path);
}
const cameraCss=readFileSync('tactical-ops-src/ui/overheadProjection.css','utf8');
const cameraBaseline=git('show','df00ab5d473186ccc4ff7a583ea49a1a48e8a075:tactical-ops-src/ui/overheadProjection.css');
assert(cameraCss.startsWith(cameraBaseline),'approved overhead CSS baseline was modified');
const visualAppendix=cameraCss.slice(cameraBaseline.length);
assert(visualAppendix.startsWith('\n\n/* Battlefield Visual Alignment V1'),'missing scoped visual alignment appendix');
assert(!/pointer-events\s*:|left\s*:|top\s*:|z-index\s*:/i.test(visualAppendix),'visual alignment must not reposition input or gameplay anchors');
const approvedAlignmentRuntime=new Set(['tactical-ops-src/ui/overheadProjection.css','tactical-ops-src/version.ts','js/tactical_ops.js','js/boot_loaders.js']);
for(const changedFile of git('diff','--name-only','--no-renames','df00ab5d473186ccc4ff7a583ea49a1a48e8a075',alignmentMerge,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(approvedAlignmentRuntime.has(changedFile),'unreviewed runtime mutation in visual alignment PR: '+changedFile);
}
// Preserve the previous approval boundaries above and pin the three exact
// render leaves for Actor Readability. Combat and asset diffs still fail.
git('merge-base','--is-ancestor',alignmentMerge,'HEAD');
for(const [path,expected] of Object.entries(actorFacingBlobs)){
 assert.equal(git('rev-parse',`${actorFacingMerge}:${path}`).trim(),expected,'unreviewed actor presentation: '+path);
}
for(const path of git('diff','--name-only','--no-renames',alignmentMerge,actorFacingHead,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||Object.hasOwn(actorFacingBlobs,path),'unreviewed runtime mutation after visual alignment: '+path);
}
// The old approved phases above stay exact. Pin this pass separately against
// its actual main base, including the small cosmetic cleanup in the store.
const combatExperienceBlobs=Object.freeze({
 'tactical-ops-src/store/battleStore.ts':'c64efc444512237e27645becf29a3c7fb5fc3bab',
 'tactical-ops-src/tactical.css':'6186f590aab733410b69fab74a6ccd7cca7a8329',
 'tactical-ops-src/ui/App.tsx':'fec9b2910fd82c89236549dc062fb881e8e2afda',
 'tactical-ops-src/ui/Battle.tsx':'4a64164c9e15af90e5f750964f17d5a7cd3a7f7e',
 'tactical-ops-src/ui/FieldOpResults.tsx':'406ac21b3a04a8708304b4d076737058b633ac52',
 'tactical-ops-src/ui/battlePresentation.ts':'3d266016b5b62aa9baf092142477dc87f4e5bdfa',
 'tactical-ops-src/ui/combatCohesion.css':'961f8373db8301feabddfb4dd89179ac5f571ebb',
 'tactical-ops-src/ui/fieldOpResults.css':'76679d2ad04387f0b3bb35508e3d8d01a7e4fe82',
 'tactical-ops-src/ui/houndDirectional.css':'c6dc11e0caacd676a74d0f8f072415cdd118975f',
 'tactical-ops-src/ui/overheadProjection.css':'34411434328b1460795bca9f85923864115dd406',
});
git('merge-base','--is-ancestor',actorFacingMerge,combatExperienceBase);
const combatExperienceMerge='5569beb7bc76f7c6b24f677b75fc7d8e13df5ebf';
const courierTraceBase='dbc930295c37393b7cd6ef21a02e476eff3a03c5';
git('merge-base','--is-ancestor',combatExperienceBase,combatExperienceMerge);
git('merge-base','--is-ancestor',courierTraceBase,'HEAD');
for(const [path,expected] of Object.entries(combatExperienceBlobs)){
 assert.equal(git('rev-parse',`${combatExperienceMerge}:${path}`).trim(),expected,'unreviewed combat presentation: '+path);
}
for(const path of git('diff','--name-only','--no-renames',combatExperienceBase,combatExperienceMerge,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||Object.hasOwn(combatExperienceBlobs,path),'unreviewed runtime mutation after combat experience base: '+path);
}
const courierTraceLeaves=new Set([app,'tactical-ops-src/ui/s3AfterAction.ts']);
const courierTraceHead='53dcf529ba3a7a3c0299bbf97a4fa903e36a8768';
const finalPlayerBase='a19311fdcb91c69c66779f6f9e50536e17ad4fb5';
git('merge-base','--is-ancestor',courierTraceHead,finalPlayerBase);
git('merge-base','--is-ancestor',finalPlayerBase,'HEAD');
for(const path of git('diff','--name-only','--no-renames',courierTraceBase,courierTraceHead,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||courierTraceLeaves.has(path),'unreviewed runtime mutation in Courier Trace: '+path);
}
// #255 was merged independently of Courier Trace. Verify it separately so it
// does not expand either pass's allowed paths.
assert.equal(git('rev-parse',`${finalPlayerBase}:js/frames.js`).trim(),'7defe7bf1eeee7bbd8c0b3ddb83cfe8d316dc713');
const finalPlayerBlobs=Object.freeze({
 'tactical-ops-src/tactical.css':'12623fae96bea7645206730d8bb2a2b37413b7ce',
 'tactical-ops-src/ui/App.tsx':'b2bf9acec6bd2bfb206c9dd2e7762d6205fff9c0',
 'tactical-ops-src/ui/Battle.tsx':'046caa38669a638f653940ed4cdc87735b103b94',
 'tactical-ops-src/ui/FieldOpResults.tsx':'53ef57f4e13269066e7f6e06e7463e12ca94bc27',
 'tactical-ops-src/ui/battlePresentation.ts':'1a34368be8631a393b708816b7f8641ba7455c27',
 'tactical-ops-src/ui/fieldOpResults.css':'3db037fa829f15fabe19ed834c233614e1892df6',
});
const loadoutBase='7df407abb9f3224f11488e98f7815c84f62c7fe2';
git('merge-base','--is-ancestor',loadoutBase,'HEAD');
const loadoutBlobs=Object.freeze({
 [app]:'5471fbdcd94f8d85fde692a1c7060d7797ecab5d',
 'tactical-ops-src/tactical.css':'9a6688d0e234519ac9a83ea7ad3d8aae16e8fe23',
});
const loadoutHead='faff4e740061b213a0960d5ed737eecd46a48d90';
git('merge-base','--is-ancestor',loadoutHead,'HEAD');
const cooldownRules='tactical-ops-src/combat/missionRules.ts';
for(const [path,expected] of Object.entries(loadoutBlobs)){
 assert.equal(git('rev-parse',`${loadoutHead}:${path}`).trim(),expected,'unreviewed Loadout presentation: '+path);
}
for(const [path,expected] of Object.entries(finalPlayerBlobs)){
 assert.equal(git('rev-parse',`${loadoutBase}:${path}`).trim(),expected,'unreviewed V1 player presentation: '+path);
 if(!Object.hasOwn(loadoutBlobs,path)) assert.equal(git('rev-parse',`${loadoutHead}:${path}`).trim(),expected,'unreviewed post-V1 change: '+path);
}
for(const path of git('diff','--name-only','--no-renames',loadoutBase,loadoutHead,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||Object.hasOwn(loadoutBlobs,path)||path===cooldownRules,'unreviewed runtime mutation in Loadout V1: '+path);
}
assert.equal(git('show',`${loadoutHead}:${cooldownRules}`).replace('unit: Pick<CombatUnit, "team">','unit: CombatUnit'),
 git('show',`${loadoutBase}:${cooldownRules}`),'Loadout may only narrow the cooldown helper input type');
for(const path of git('diff','--name-only','--no-renames',finalPlayerBase,loadoutBase,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||Object.hasOwn(finalPlayerBlobs,path),'unreviewed runtime mutation in V1 player presentation: '+path);
}
const fieldContractBlobs=Object.freeze({
 'tactical-ops-src/data/fieldContracts.ts':'542ac9214f879dcda09d9261e3c1ae352452c2f7',
 'tactical-ops-src/data/fieldOps.ts':'372a87e197721142d8798144c868febb736683be',
 'tactical-ops-src/data/playerGrowth.ts':'a5813cccf5def1f2702b195a4e8266ca1547442f',
 'tactical-ops-src/data/skills.ts':'44c4066fd052cd8e60939c20817d210d43f55f6c',
 'tactical-ops-src/host/foundationProgression.ts':'e0d40d7ba1e7abda509334f88d09d36c1d84d2c5',
 'tactical-ops-src/store/battleStore.ts':'fcac9e21866b210e7a880672d78dfdfb722e805f',
 'tactical-ops-src/tactical.css':'d6d687f4382cfc247c9c6c9836b14311ed837019',
 'tactical-ops-src/ui/App.tsx':'d3109ccecb3780a67858a9d0dec0d48a37665483',
 'tactical-ops-src/ui/FieldOpResults.tsx':'2f38645a391b9cbde582f351d8ebbda5c9823534',
 'tactical-ops-src/ui/PlayerIdentity.tsx':'5b896ceba522a2ea23886ceafe3b923ca75e57b3',
 'tactical-ops-src/ui/returnPurpose.ts':'d457a609abbdb23cfee8a9294cb48c45a9c69793',
 'tactical-ops-src/ui/tacticalActionIcons.ts':'707d2c922443ae148039fdae3bcd8429c34c2766',
});
// Pin the scoped Reach Rend UI and save feedback while retaining the original Field Contracts baseline.
const reachRendUxBlobs=Object.freeze({
 'tactical-ops-src/store/battleStore.ts':'3a1fcc3bf0fc4a3cf501bca4f3ed4a5f0bd9f157',
 'tactical-ops-src/tactical.css':'78a7d30b49701f3ca22b17fdf9c2c0016b9357b9',
 'tactical-ops-src/ui/App.tsx':'efaeebaf040f97337a622d810043a72909e20381',
 'tactical-ops-src/ui/FieldOpResults.tsx':'ac30691e28cd337724040a11407d021ced7e75bf',
 'tactical-ops-src/ui/returnPurpose.ts':'794ca9210a81fc31585ae12a5e43be22b123fee7',
 'tactical-ops-src/version.ts':'2d63b34176e49b8b7962d30e64227abc6fbd9983',
});
// Pin the presentation-only changes on top of the Reach Rend handoff.
const rewardCommandBlobs=Object.freeze({
 'tactical-ops-src/tactical.css':'8450c47a6d52bcc5cc1c4ebba8b7b46cbb2e9718',
 'tactical-ops-src/ui/App.tsx':'467b8c0590c336addbf06686a7fc1d7ffc46452f',
 'tactical-ops-src/ui/FieldOpResults.tsx':'0fc39edc4065338ba8afbd412da53f9c2eb70ea4',
 'tactical-ops-src/version.ts':'940f6446d625faff824ad839102f01e989c6e446',
});
const fieldContractsMerge='1a9e41436c364e2bf0c557f74b1e11e57a47084f';
const legacyFieldBriefFix='8634d6e5150b31476c2a1c05e8b8e6573baaf8be';
git('merge-base','--is-ancestor',fieldContractsMerge,'HEAD');
for(const [path,expected] of Object.entries(fieldContractBlobs)){
 assert.equal(git('rev-parse',`${fieldContractsMerge}:${path}`).trim(),expected,'unreviewed merged Field Contracts source: '+path);
 const fieldContractsBaseline=path===app ? legacyFieldBriefFix : expected;
 assert.equal(sourceBlob(readFileSync(path)),rewardCommandBlobs[path] ?? reachRendUxBlobs[path] ?? fieldContractsBaseline,'unreviewed Field Contracts source: '+path);
}
// Browser Guest Exit V1: approve only these exact, separately reviewed host/version blobs.
// Keep the merged exit source pinned and allow the Reach Rend release to advance the version.
const browserExitApproved=Object.freeze({
 'tactical-ops-src/host/bootstrap.ts':'ca52e1165f7e9c9f523eb36f9de9506558280960',
 'tactical-ops-src/version.ts':'5796d8fc6abef65e7ecc86eeb30120c5ef8237d8',
});
for(const path of git('diff','--name-only','--no-renames',loadoutHead,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||Object.hasOwn(fieldContractBlobs,path)||Object.hasOwn(browserExitApproved,path),'unreviewed runtime mutation in Field Contracts V1: '+path);
 if(Object.hasOwn(browserExitApproved,path)){
  assert.equal(git('rev-parse',`f36f97231be5671a4045aaf60f8fd1e7d8b1329e:${path}`).trim(),browserExitApproved[path],'unreviewed merged Browser Guest exit source: '+path);
  assert.equal(sourceBlob(readFileSync(path)),rewardCommandBlobs[path] ?? reachRendUxBlobs[path] ?? browserExitApproved[path],'unreviewed Browser Guest exit or release source: '+path);
 }
}
assert(cameraCss.includes('relay-overhead-v1'),'missing reviewed camera selector');
assert(!/pointer-events:\s*auto/.test(cameraCss),'overhead layer may not intercept touch');
const rcContractPaths=new Set([
 ...generated,
 'tactical-ops-src/combat/intentContract.ts',
 'tactical-ops-src/host/foundationProgression.ts',
 ...Object.keys(approvedOverheadBlobs),
]);
for(const path of git('diff','--name-only','--no-renames',mergedBaseline,overheadMerge,'--','index.html','js','tactical-ops-src').trim().split('\n').filter(Boolean)){
 assert(rcContractPaths.has(path),`unreviewed production change since merged baseline: ${path}`);
}
const version=readFileSync('tactical-ops-src/version.ts','utf8');
const bundle=readFileSync('js/tactical_ops.js','utf8'),loader=readFileSync('js/boot_loaders.js','utf8');
assert(bundle.includes(version.match(/VERSION = "([^"]+)"/)[1]));
assert(loader.includes(version.match(/CACHE_KEY = "([^"]+)"/)[1]));
for(const feature of ['WIN CONDITION · RECOVER THE SIGNAL','TACTICAL THREATS','NO ADDITIONAL RANK CONFIRMED BY THIS RECEIPT.','t-field-results','RECORDING FAILED','RECORDED THIS RUN','New option unlocked'])assert(bundle.toLowerCase().includes(feature.toLowerCase()),`missing compiled feature: ${feature}`);
assert(readFileSync('js/pet_quick_actions.js','utf8').includes('body:has(#tacticalOpsRoot[data-open="1"]) #petQuickActions'));
console.log(`PASS integration provenance: ${preserved} unchanged source/test files, exact App union, no unrelated runtime changes, both feature sets and coherent version/cache in production`);
