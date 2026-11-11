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

// PR #268: preserve historical approvals against reviewed main
// and pin new changes separately.
const nextDecisionBase='b32f4594d43cf6ceec105e8371ba29627645716a';
const nextDecisionApproved=Object.freeze({
 '.github/workflows/tactical-purpose-return.yml':'dc08b5361545e91c347251028c911dd52af7d8b2',
 'tactical-ops-src/store/battleStore.ts':'645ec8d94759f71487233929eddd696455de86c7',
 'tactical-ops-src/ui/App.tsx':'d5d115a1c24f2ccfaef2a73004b6b39932cba67a',
 'tactical-ops-src/ui/FieldOpResults.tsx':'e2b84b44a1b23e8cbe2437945a9044e4f2b967fb',
 'tactical-ops-src/ui/battleDecision.ts':'981c29ba30f1ccc1b5c446d019a994cc423832cf',
 'tactical-ops-src/ui/fieldOpResults.css':'a0d3242be9bbd12b4755ffc8873a6668e356db4f',
 'tactical-ops-src/ui/returnPurpose.ts':'c29ead1a306b20ffb9b5f5397843f1ca58ba5fda',
 'tactical-ops-src/version.ts':'9413c136d11e4ffea8d66a488e947926ea7b4d6d',
 'tools/verify_field_op_results_premium.mjs':'74f9fb7c1c30d1f8499459e6abdfdad214bed212',
 'tools/verify_tactical_brief_closure_browser.mjs':'176787f6603b54c988250e207e785bac5f9119c7',
 'tools/verify_tactical_depth01_browser.mjs':'1b45fed9d8146e8119a93ff38b33d11ebd3f8819',
 'tools/verify_tactical_field_contracts_browser.mjs':'62326bd65c639150d5e0d729ca4bef39cb78707b',
 'tools/verify_tactical_purpose_return.mjs':'9624a6f893339c86e10b3cff2ecf01efe9e09e73',
 'tools/verify_tactical_purpose_return_browser.mjs':'b2b5ce44b53d2cc796090a1ef76be126f41d7a4c',
});
const approvedBrowserEntryMainBlobs=Object.freeze({
 'index.html':'7714f383bce8b96811aaa21ccbc13b6a4bb98921',
 'js/browser_guest_entry_v1.js':'d7edb7742a0b44e03deede83700737debf2634c3',
 'tools/verify_browser_guest_entry_v1.mjs':'1f5d2d378ba2486245eb556643b4c408465d2f4b',
});
const approvedSignalTrialsBlobs=Object.freeze({
 '.github/workflows/tactical-depth02.yml':'9ccb70cd3736c6024a99bc9ebe5b2a57fbb107fa',
 'tactical-ops-src/combat/ai.ts':'b5660c3a96b7deda0bde28ed9ecaab2403714cf6',
 'tactical-ops-src/combat/battle.ts':'f7b9a3503c1ba19193bf9c4a2232d25a5f07656b',
 'tactical-ops-src/combat/missionRules.ts':'9c1cf4b8a0752e622b6bb8d111d7198af84ad765',
 'tactical-ops-src/combat/types.ts':'2c2318fa00e1e3e7829be71f876b5cb2e0ac44c3',
 'tactical-ops-src/data/relayPressure.ts':'b646e72fe26b429a5cdc7085b61c9c8c053b3ccd',
 'tactical-ops-src/data/signalTrials.ts':'f8c537c10db58945ff429bbb6f23047cbd605c23',
 'tactical-ops-src/host/foundationProgression.ts':'34fdb245bed3523d0ac92104fea7b43f3872e758',
 'tactical-ops-src/store/battleStore.ts':'3ad5d97e0558925f35c0994e13e794c1ffde4439',
 'tactical-ops-src/ui/App.tsx':'5580f3cc80883e47baf50894e88c29cdaf01e9ab',
 'tactical-ops-src/ui/Battle.tsx':'4adeb2b7f7fd439bedc90f8a2dbe9c8b1a89d184',
 'tactical-ops-src/ui/missionPurpose.ts':'28ccc4b3edc773103532490900794b9472c3e5c5',
 'tools/verify_tactical_depth01_combat.mjs':'8d033e062766d08cf73befdc23b8f723d5307a81',
 'tools/verify_tactical_depth02_browser.mjs':'f01a7c16490876f078d79ed9fdb2f58e5eadb507',
});

// PR #272 was merged on main before #273 forked. These are the six exact
// First Playable Bridge paths; none is a new permission for PR #273.
const firstPlayableBridgeMerge='feff1a21f563db532b8c313c88ba502d587a187c';
const approvedFirstPlayableBridgeBlobs=Object.freeze({
 '.github/workflows/first-playable-bridge.yml':'3d36c4426e7f267766670c28581dd9e856cf69ff',
 'js/cta.js':'22a529ab26125db3e1fc324c93cb41d5cda742f9',
 'js/missions.js':'32c9a3d9ed2bbeb9774e74adbfae2d6fc18e5d8d',
 'js/onboarding.js':'025dfb58574d93935b1f11c3e8724b6d5ff5b57c',
 'js/story_delivery.js':'c0875e83dd101b806156fb3261e8433e3ebc379c',
 'tools/verify_first_playable_bridge_v1.mjs':'ac833abdd0193274897dc6319e409f0a1ba27104',
});
// PR #273 advances only the following authored sources. Compiled output is
// still constrained by the existing version/cache and integration checks.
const rewardExperienceBase=firstPlayableBridgeMerge;
const approvedRewardExperienceBlobs=Object.freeze({
 'index.html':'d938f772dcc10e5673f477ce8271ac764328f2e8',
 'js/forge.js':'d2ad8bf83b645f9fb7d76641df7a127985308490',
 'tactical-ops-src/host/bootstrap.ts':'01d3fd08fb568a84936f807506767cb85bed1c6c',
 'tactical-ops-src/host/bridge.ts':'6ef5d76c3467f8bd6b66494f2cb93d65194054f2',
 'tactical-ops-src/ui/FieldOpResults.tsx':'9c8a76f1a4ab2476bea36fe71dd2ed12c1c895ac',
 'tactical-ops-src/ui/fieldOpResults.css':'bff06b494b0820b5ae325487ccd0cd222ec6d7f0',
 'tactical-ops-src/version.ts':'c28cc421f3bbff792c7544a3500cba15de191800',
 'tools/verify_field_op_results_premium.mjs':'40457102f6a0fbf8172337f8dd83e4f05ce0ed54',
});
// PR #274 pins its exact source delta over merged Reward Experience. The
// historical release pins still apply at their respective merge commits.
const recoverAuthorityBase='982cb2e93306fc85e22fc2af196e9ef1325dc3c9';
const signalTrialsMerge='a4e37998a5756dddad16e2cb97104a5263551601';
const approvedRecoverAuthorityBlobs=Object.freeze({
 '.github/workflows/tactical-purpose-return.yml':'71e073ad33b959994c92d3bcb020243c73c92c10',
 'package.json':'4cdafac1b9dc056df35a197086d258c50cdb6042',
 'tactical-ops-src/combat/effects.ts':'457df1933dfdbfe8e060d0db0019285a31e01afd',
 'tactical-ops-src/combat/recoverAuthority.ts':'4aef5670c1e25d869e2d71cea9ef06667938eaf1',
 'tactical-ops-src/host/foundationProgression.ts':'d42b87ae3d841dc52c36171835076d044f689108',
 'tactical-ops-src/store/battleStore.ts':'f6b0297d9b4f763556043135ded93d05568018e6',
 'tactical-ops-src/ui/App.tsx':'bec81cbdaef5748c4ff7464495291955fc14b709',
 'tactical-ops-src/ui/battleDecision.ts':'8d343ee9d05263587d0782258c1c7ea7e594a02c',
 'tactical-ops-src/ui/missionPurpose.ts':'1ba4253c1b410a1aa9800499284767432e950d5d',
 'tactical-ops-src/ui/returnPurpose.ts':'9bd52fb0610b869df6ec5741ec4fee5802e99006',
 'tactical-ops-src/ui/tacticalCampaignOrders.ts':'b6b048aca64e04f4d1f2cca802ee62d30a795437',
 'tactical-ops-src/version.ts':'4ebfa89fa01d23d46d60c770d94a640cdb783513',
 'tools/build_tactical_recover_engine_v1.mjs':'84de109532c99882b161c56de4e4cbfb1bec054f',
 'tools/tactical_recover_engine_v1.ts':'95741ee60d802f81c37a47b14a16e6c648023327',
 'tools/verify_tactical_recover_authority_client.mjs':'34855860e01aa12e171e881aef9b0beb02611f75',
});
// Gear V3.1: narrowly reviewed source blobs for this focused PR. No wildcard approval.
const approvedGearV31Blobs=Object.freeze({
  ".github/workflows/tactical-gear-v31.yml": "15571fc76bac72fb2771b14a93969ba11f5df3e5",
  ".github/workflows/tactical-purpose-return.yml": "277a338dbc82ec6212f5d00a43d0bd883e5c2433",
  "tactical-ops-src/combat/battle.ts": "4a907b65beb6f4495a8cf93cb24e662269fd4cbf",
  "tactical-ops-src/combat/combatProfileV3.ts": "5cd344871e359c47ff36d8ef705a1da4e28e23f0",
  "tactical-ops-src/combat/gearImpactV31.ts": "70240860d651771971498e42d0d9188f79355cbe",
  "tactical-ops-src/combat/skills.ts": "f0d6792e7d585317aa1c15eae2029e9271f5a823",
  "tactical-ops-src/combat/types.ts": "bed007a67c533497127d8b87b8181a399ebff642",
  "tactical-ops-src/version.ts": "242266640d31bfac70afe8fcd036f7f7123082c0",
  "tools/verify_tactical_gear_v31.mjs": "c326575679f69a6a063ecc827de94cbd72bde16a"
});
for(const [p,sha] of Object.entries(approvedGearV31Blobs)){
 assert.equal(sourceBlob(readFileSync(p)),sha,'unreviewed Gear V3.1 source: '+p);
 assert.notEqual(sourceBlob(readFileSync(p,'utf8')+'\n/* unreviewed gear mutation */'),sha,'Gear V3.1 negative integrity guard: '+p);
}
// V2 authoring is pinned separately from all historical merge approvals.
const victoryV2Base='83139a060bf1db35719020d4ce5fc533e3e856a7';
const approvedVictoryV2Blobs=Object.freeze({
 'tactical-ops-src/ui/FieldOpResults.tsx':'bedcf3dc1adb30907e562d1c26cde66c5e5082cf',
 'tactical-ops-src/ui/fieldOpResults.css':'ca853364819c0b163762654d401f64ea1c3135d7',
 'tactical-ops-src/version.ts':'5b20d07e3d8dc5d7ed1727dcb2fbe1c9ad3675b9',
 'tools/verify_field_op_results_premium.mjs':'bf58113fb167cb82cb2f7e219bfed308dcee77e3',
});
const approvedVictoryArtKitV1Blobs=Object.freeze({
  "index.html": "f6a6680f08dfb3716c595cf4438b9ee9ef884bce",
  "css/tactical_victory_art_v1.css": "24a2d8b88cb7d3ccdf69566ffd0c8a9e3c31a116",
  "images/tactical_ops/presentation/victory_triumph_overlay.png": "854d671a4ef93a459b3cf79fd087c82db6792487",
  "images/tactical_ops/presentation/reward_exp_plate.png": "5755164c00b8eb2903e76aa276842b33045f837a",
  "images/tactical_ops/presentation/reward_bones_plate.png": "8535b18b75d4a54aeb98450f2ddee8c3b48dd522",
  "images/tactical_ops/presentation/forge_item_frame.png": "27f4a86b367ce12c276ccc57b5c22a6072ff97aa"
});
const victoryV2BaseBlobs=Object.freeze({
 'tactical-ops-src/ui/FieldOpResults.tsx':'9c8a76f1a4ab2476bea36fe71dd2ed12c1c895ac',
 'tactical-ops-src/ui/fieldOpResults.css':'bff06b494b0820b5ae325487ccd0cd222ec6d7f0',
 'tactical-ops-src/version.ts':'4ebfa89fa01d23d46d60c770d94a640cdb783513',
 'tools/verify_field_op_results_premium.mjs':'40457102f6a0fbf8172337f8dd83e4f05ce0ed54',
});
git('merge-base','--is-ancestor',victoryV2Base,'HEAD');
for(const [path,expected] of Object.entries(victoryV2BaseBlobs))
 assert.equal(git('rev-parse',`${victoryV2Base}:${path}`).trim(),expected,'unreviewed V2 base: '+path);
for(const [path,expected] of Object.entries(approvedVictoryV2Blobs)){
 assert.equal(sourceBlob(readFileSync(path)),approvedGearV31Blobs[path] ?? expected,'unreviewed Victory V2 source: '+path);
 assert.notEqual(sourceBlob(readFileSync(path,'utf8')+'\n/* unreviewed V2 mutation */'),expected,
  'Victory V2 negative guard: '+path);
}
for(const changedPath of git('diff','--name-only','--no-renames',victoryV2Base,'HEAD','--',
 '.github/workflows','index.html','package.json','js','tactical-ops-src','images/tactical_ops','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||Object.hasOwn(approvedGearV31Blobs,changedPath)||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs','unreviewed Victory V2 path: '+changedPath);
}
git('merge-base','--is-ancestor',recoverAuthorityBase,'HEAD');
for(const changedPath of git('diff','--name-only','--no-renames',recoverAuthorityBase,'HEAD','--',
 '.github/workflows','index.html','package.json','js','tactical-ops-src','images/tactical_ops','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(approvedRecoverAuthorityBlobs,changedPath)||Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||Object.hasOwn(approvedGearV31Blobs,changedPath)||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs',
  'unreviewed RECOVER Authority path: '+changedPath);
}
for(const [path,expected] of Object.entries(approvedRecoverAuthorityBlobs))
 assert.equal(sourceBlob(readFileSync(path)),approvedGearV31Blobs[path] ?? approvedVictoryV2Blobs[path] ?? expected,'unreviewed RECOVER Authority source: '+path);
git('merge-base','--is-ancestor',firstPlayableBridgeMerge,'HEAD');
for(const [path,expected] of Object.entries(approvedFirstPlayableBridgeBlobs)){
 assert.equal(git('rev-parse',`${firstPlayableBridgeMerge}:${path}`).trim(),expected,'unreviewed merged First Playable Bridge blob: '+path);
 assert.equal(sourceBlob(readFileSync(path)),expected,'unreviewed First Playable Bridge source: '+path);
}
for(const changedPath of git('diff','--name-only','--no-renames',rewardExperienceBase,'HEAD','--',
 '.github/workflows','index.html','js','tactical-ops-src','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(approvedRewardExperienceBlobs,changedPath)||Object.hasOwn(approvedRecoverAuthorityBlobs,changedPath)||Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||Object.hasOwn(approvedGearV31Blobs,changedPath)||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs',
  'unreviewed Reward Experience path: '+changedPath);
}
for(const [path,expected] of Object.entries(approvedRewardExperienceBlobs)){
 assert.equal(git('rev-parse',`${recoverAuthorityBase}:${path}`).trim(),expected,'unreviewed merged Reward Experience blob: '+path);
 const liveExpected=approvedVictoryArtKitV1Blobs[path] ?? approvedVictoryV2Blobs[path] ?? approvedRecoverAuthorityBlobs[path] ?? expected;
 assert.equal(sourceBlob(readFileSync(path)),liveExpected,'unreviewed Reward Experience source: '+path);
 // An unapproved edit must never match the exact reviewed Git blob.
 assert.notEqual(sourceBlob(readFileSync(path,'utf8')+'\n/* unreviewed provenance mutation */'),liveExpected,
  'Reward Experience negative integrity guard: '+path);
}
const nextDecisionHistoricSource=path=>git('show',`${nextDecisionBase}:${path}`);
git('merge-base','--is-ancestor',nextDecisionBase,'HEAD');
for(const changedPath of git('diff','--name-only','--no-renames',nextDecisionBase,'HEAD','--',
  '.github/workflows','index.html','js','tactical-ops-src','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(nextDecisionApproved,changedPath)||Object.hasOwn(approvedSignalTrialsBlobs,changedPath)||Object.hasOwn(approvedBrowserEntryMainBlobs,changedPath)||Object.hasOwn(approvedFirstPlayableBridgeBlobs,changedPath)||Object.hasOwn(approvedRewardExperienceBlobs,changedPath)||Object.hasOwn(approvedRecoverAuthorityBlobs,changedPath)||Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||Object.hasOwn(approvedGearV31Blobs,changedPath)||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs',
  'unreviewed Next Decision path: '+changedPath);
}
for(const [path,sha] of Object.entries(approvedBrowserEntryMainBlobs)){
 // #273 changes only index.html's loader revision; its old main blob is
 // still frozen at the exact First Playable Bridge merge baseline.
 if(path==='index.html'){
  assert.equal(git('rev-parse',`${rewardExperienceBase}:${path}`).trim(),sha,
   'unreviewed Browser Public Entry historical index blob');
  assert.equal(sourceBlob(readFileSync(path)),approvedVictoryArtKitV1Blobs[path],
   'unreviewed Victory Art Kit index blob');
 }else{
  assert.equal(sourceBlob(readFileSync(path)),sha,'unreviewed Browser Public Entry main blob: '+path);
 }
}
for(const [path,sha] of Object.entries(approvedSignalTrialsBlobs)){
 assert.equal(git('rev-parse',`${signalTrialsMerge}:${path}`).trim(),sha,'unreviewed merged Signal Trials blob: '+path);
 assert.equal(sourceBlob(readFileSync(path)),approvedGearV31Blobs[path] ?? approvedRecoverAuthorityBlobs[path] ?? sha,'unreviewed Signal Trials source: '+path);
}
for(const [path,sha] of Object.entries(nextDecisionApproved))
 assert.equal(sourceBlob(git('show',`182778165eab8ddde44cb3bfe4fe5d25d44145ee:${path}`)),sha,'unreviewed merged Next Decision blob: '+path);
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
// Only the revision-scoped SURVIVE runtime may advance these existing leaves.
const surviveTensionBlobs=Object.freeze({
 'tactical-ops-src/combat/battle.ts':'b147fc30fd7551e57365f61f7ccdb53e897c2f84',
 'tactical-ops-src/combat/intentContract.ts':'022cf719c857902bb899f077b2bd40a376d70a7e',
 'tactical-ops-src/combat/intentScheduler.ts':'006e749d8b2300a6d57381c37e609d5443edd7ff',
 'tactical-ops-src/combat/types.ts':'fe07ae38aa5844f60152314e005fecb93125fc7b',
 'tactical-ops-src/data/directives.ts':'88a8d2df15b7551c33d80cb6998e3b73d055386b',
 'tactical-ops-src/data/livingBattlefield.ts':'a063d227baa3ba222e1a62cadc126c6999efcdff',
 'tactical-ops-src/data/operations.ts':'3d47fd63763e21d66a5744b1aea56a08488a37c4',
 'tactical-ops-src/host/foundationProgression.ts':'9c692d864a714ed29162592c184a99dd4fdd10e7',
 'tactical-ops-src/store/battleStore.ts':'6a698a526bb8939c321d011fb27460b3e3e55075',
 'tactical-ops-src/ui/App.tsx':'90a1bc114a60a3dd353d4058968930c776b7eece',
 'tactical-ops-src/version.ts':'e99121a31dcbc9b2922cb7b8c5d63797e486a1f4',
});
// Commander Service Record may advance only these presentation and read-model leaves.
const surviveTensionMerge='b9e837361d8b1f67edd57375eccc36d4c9c21141';
const serviceRecordBlobs=Object.freeze({
 'index.html':'3487ac8c4d454599b9e6d859cc995fa1065e3884',
 'js/badges.js':'f50f3d0c2fcf1d1c71ddd0ef858d548c1384d146',
 'js/field_record.js':'d74da15d195dec78f74e98b1643369b3642740c2',
 'js/player_profile.js':'0059b92622bde72b365f4a245da11c2358e66d23',
 'tactical-ops-src/host/bootstrap.ts':'a028d30bffd3b74e6537f3343a4b33e4924e062d',
 'tactical-ops-src/host/bridge.ts':'e0898b35229f09e77ec7a563278681d298081a6b',
 'tactical-ops-src/host/foundationProgression.ts':'a82c57698c3863b09ac75c62e2935645dad14ef3',
 'tactical-ops-src/ui/App.tsx':'5bfba5b748a9da6ddf65b8b4de6fe5379f772ffd',
 'tactical-ops-src/ui/serviceRecord.ts':'296f0372793d65ec7a4cf4498425ad08ab543c5d',
 'tactical-ops-src/version.ts':'fa57cf997d77121b2fc500d3d27a5ab1885a6cc2',
 'assets/badges/field-tested.svg':'3e41fcbd5e71b7f5d4ec6d42c6ce6dd21b462a6b',
});
git('merge-base','--is-ancestor',surviveTensionMerge,'HEAD');
for(const [path,expected] of Object.entries(serviceRecordBlobs)){
 assert.equal(sourceBlob(nextDecisionHistoricSource(path)),expected,'unreviewed Commander Service Record source: '+path);
}
for(const [path,expected] of Object.entries(surviveTensionBlobs)){
 assert.equal(git('rev-parse',`${surviveTensionMerge}:${path}`).trim(),expected,'unreviewed merged SURVIVE source: '+path);
 assert.equal(sourceBlob(nextDecisionHistoricSource(path)),serviceRecordBlobs[path] ?? expected,'unreviewed SURVIVE source: '+path);
}
const fieldContractsMerge='1a9e41436c364e2bf0c557f74b1e11e57a47084f';
const legacyFieldBriefFix='8634d6e5150b31476c2a1c05e8b8e6573baaf8be';
git('merge-base','--is-ancestor',fieldContractsMerge,'HEAD');
for(const [path,expected] of Object.entries(fieldContractBlobs)){
 assert.equal(git('rev-parse',`${fieldContractsMerge}:${path}`).trim(),expected,'unreviewed merged Field Contracts source: '+path);
 const fieldContractsBaseline=path===app ? legacyFieldBriefFix : expected;
 assert.equal(sourceBlob(nextDecisionHistoricSource(path)),serviceRecordBlobs[path] ?? surviveTensionBlobs[path] ?? rewardCommandBlobs[path] ?? reachRendUxBlobs[path] ?? fieldContractsBaseline,'unreviewed Field Contracts source: '+path);
}
// Browser Guest Exit V1: approve only these exact, separately reviewed host/version blobs.
// Keep the merged exit source pinned and allow the Reach Rend release to advance the version.
const browserExitApproved=Object.freeze({
 'tactical-ops-src/host/bootstrap.ts':'ca52e1165f7e9c9f523eb36f9de9506558280960',
 'tactical-ops-src/version.ts':'5796d8fc6abef65e7ecc86eeb30120c5ef8237d8',
});
// Browser Sync and Browser FTUE fixes were merged on main after this verifier's original baseline.
// Pin their exact approved source blobs to the 8 Nov 2026 main integration commit.
const reviewedBrowserMain=Object.freeze({
 'js/browser_guest_entry_v1.js':'61da4d7d8b749641ca55e7a293472f8e6cf25611',
 'js/faction_chamber.js':'dd44874d8738de7f88b23e2319d634a1451ba32d',
 'js/ftue_continuity.js':'8c6d67be8bdc8a950b1a8905a3e0a1607b8843a2',
});
git('merge-base','--is-ancestor','0cb25488080cd16494d57ceb231fa9a4495e15f7','HEAD');
git('merge-base','--is-ancestor','e1a11d12a4cbc3bc4d1ade3fd277a92f7ca368d3','HEAD');
for(const [path,expected] of Object.entries(reviewedBrowserMain)){
 assert.equal(git('rev-parse',`d4da1a3f7ecc894e6295bd2b7ccd0f3d31107979:${path}`).trim(),expected,'unreviewed merged browser baseline: '+path);
 assert.equal(sourceBlob(readFileSync(path)),approvedBrowserEntryMainBlobs[path] ?? expected,'unreviewed browser sync or FTUE source: '+path);
}
for(const path of git('diff','--name-only','--no-renames',loadoutHead,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(generated.has(path)||Object.hasOwn(nextDecisionApproved,path)||Object.hasOwn(approvedSignalTrialsBlobs,path)||Object.hasOwn(approvedBrowserEntryMainBlobs,path)||Object.hasOwn(approvedFirstPlayableBridgeBlobs,path)||Object.hasOwn(approvedRewardExperienceBlobs,path)||Object.hasOwn(approvedRecoverAuthorityBlobs,path)||Object.hasOwn(fieldContractBlobs,path)||Object.hasOwn(browserExitApproved,path)||Object.hasOwn(surviveTensionBlobs,path)||Object.hasOwn(serviceRecordBlobs,path)||Object.hasOwn(reviewedBrowserMain,path)||Object.hasOwn(approvedVictoryV2Blobs,path)||Object.hasOwn(approvedVictoryArtKitV1Blobs,path),'unreviewed runtime mutation in Field Contracts V1: '+path);
 if(Object.hasOwn(browserExitApproved,path)){
  assert.equal(git('rev-parse',`f36f97231be5671a4045aaf60f8fd1e7d8b1329e:${path}`).trim(),browserExitApproved[path],'unreviewed merged Browser Guest exit source: '+path);
  assert.equal(sourceBlob(nextDecisionHistoricSource(path)),serviceRecordBlobs[path] ?? surviveTensionBlobs[path] ?? rewardCommandBlobs[path] ?? reachRendUxBlobs[path] ?? browserExitApproved[path],'unreviewed Browser Guest exit or release source: '+path);
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

// Victory Art Kit V1: exact local assets, no wildcard permissions.
for (const [assetPath,approvedSha] of Object.entries(approvedVictoryArtKitV1Blobs)) {
  assert.equal(sourceBlob(readFileSync(assetPath)),approvedSha,
    'unreviewed Victory Art Kit V1 asset: '+assetPath);
}
assert(readFileSync('index.html','utf8').includes(
  '<link rel="stylesheet" href="/css/tactical_victory_art_v1.css?v=v1-20261111">'),
  'Victory Art Kit stylesheet must be loaded');

const version=readFileSync('tactical-ops-src/version.ts','utf8');
const bundle=readFileSync('js/tactical_ops.js','utf8'),loader=readFileSync('js/boot_loaders.js','utf8');
assert(bundle.includes(version.match(/VERSION = "([^"]+)"/)[1]));
assert(loader.includes(version.match(/CACHE_KEY = "([^"]+)"/)[1]));
for(const feature of ['WIN CONDITION · RECOVER THE SIGNAL','TACTICAL THREATS','NO ADDITIONAL RANK CONFIRMED BY THIS RECEIPT.','t-field-results','RECORDING FAILED','RECORDED THIS RUN','New option unlocked'])assert(bundle.toLowerCase().includes(feature.toLowerCase()),`missing compiled feature: ${feature}`);
assert(readFileSync('js/pet_quick_actions.js','utf8').includes('body:has(#tacticalOpsRoot[data-open="1"]) #petQuickActions'));
console.log(`PASS integration provenance: ${preserved} unchanged source/test files, exact App union, no unrelated runtime changes, both feature sets and coherent version/cache in production`);
