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
 assert.equal(readFileSync(app,'utf8'),expectedVoice,'unreviewed App change outside five scoped player-voice edits');
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
 assert.equal(sourceBlob(readFileSync(path,'utf8')),expected,'unreviewed actor presentation: '+path);
}
for(const path of git('diff','--name-only','--no-renames',alignmentMerge,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||Object.hasOwn(actorFacingBlobs,path),'unreviewed runtime mutation after visual alignment: '+path);
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
