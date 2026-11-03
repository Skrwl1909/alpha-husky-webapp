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
const approvedG3Sources=new Set([
 'tactical-ops-src/data/progressionOpportunity.ts',
 'tactical-ops-src/host/foundationProgression.ts',
 'tactical-ops-src/ui/App.tsx',
 'tactical-ops-src/ui/FieldOpResults.tsx',
 'tactical-ops-src/ui/missionPurpose.ts',
 'tactical-ops-src/ui/returnPurpose.ts',
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
 let source=approvedG3Sources.has(path) ? git('show',`${reviewedMain}:${path}`) : readFileSync(path,'utf8');
 if(path==='tactical-ops-src/styles.ts'){
  // The only allowed new style wiring is our isolated, presentational Command Deck leaf.
  const imported='import COMMAND_DECK_CSS from "./ui/commandDeck.css?raw";\n';
  assert(source.includes(imported),'missing Command Deck CSS import');
  assert(source.includes(' + FIELD_OP_RESULTS_CSS + "\\n" + COMMAND_DECK_CSS;'),'missing canonical style composition');
  source=source.replace(imported,'').replace(' + FIELD_OP_RESULTS_CSS + "\\n" + COMMAND_DECK_CSS;',' + FIELD_OP_RESULTS_CSS;');
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
 const actual=readFileSync(app,'utf8');
 const beforeG3=actual.slice(0,actual.indexOf('function WarTable()'))
  .replace('import { veteranOpportunityView } from "../data/progressionOpportunity";\n','');
 assert.equal(beforeG3, current.slice(0,current.indexOf('function WarTable()')),
  'G3 changed unrelated App declarations or imports');
 const fromSector=x=>x.slice(x.indexOf('function Sector()'));
 assert.equal(fromSector(actual),fromSector(current),
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
const expected=new Set(heads.flatMap(changed));
const uxRuntime=approvedG3Sources;
const upstreamChanges=new Set(git('diff','--name-only',base,reviewedMain).trim().split('\n'));
for(const path of git('diff','--name-only',reviewedMain,'HEAD').trim().split('\n')){
 if(path.startsWith('tactical-ops-src/')||path.startsWith('js/'))assert(uxRuntime.has(path),`unreviewed UX production change: ${path}`);
}
for(const path of git('diff','--name-only',base).trim().split('\n')){
 if(!(path.startsWith('tactical-ops-src/')||path.startsWith('js/')))continue;
 if(expected.has(path)||path==='tactical-ops-src/ui/returnPurpose.ts'||uxRuntime.has(path))continue;
 assert(upstreamChanges.has(path),`unrelated production change: ${path}`);
 assert.equal(readFileSync(path,'utf8'),git('show',`${reviewedMain}:${path}`),`pre-existing main source changed by UX: ${path}`);
}
const version=readFileSync('tactical-ops-src/version.ts','utf8');
const bundle=readFileSync('js/tactical_ops.js','utf8'),loader=readFileSync('js/boot_loaders.js','utf8');
assert(bundle.includes(version.match(/VERSION = "([^"]+)"/)[1]));
assert(loader.includes(version.match(/CACHE_KEY = "([^"]+)"/)[1]));
for(const feature of ['WIN CONDITION · RECOVER THE SIGNAL','TACTICAL THREATS','NO ADDITIONAL RANK CONFIRMED BY THIS RECEIPT.','t-field-results','RECORDING FAILED','RECORDED THIS RUN','New option unlocked'])assert(bundle.toLowerCase().includes(feature.toLowerCase()),`missing compiled feature: ${feature}`);
assert(readFileSync('js/pet_quick_actions.js','utf8').includes('body:has(#tacticalOpsRoot[data-open="1"]) #petQuickActions'));
console.log(`PASS integration provenance: ${preserved} unchanged source/test files, exact App union, no unrelated runtime changes, both feature sets and coherent version/cache in production`);
