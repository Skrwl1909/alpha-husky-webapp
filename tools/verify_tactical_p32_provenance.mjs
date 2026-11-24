/** P3.2 exact release provenance; historic verifier approvals remain unchanged. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

// Each merged tree equals its PR head tree, as independently checked via GitHub.
// The first parent of every merge is the preceding accepted release.
const accepted = Object.freeze([
  [323,'ba689c33f6bedad0d5494650ba9f663b77a81485','27a1ec04825d506d10b305afa238b31ffaf6dd5e'],
  [325,'f07aa4414b4079d280cd6f23213bd9d2cf6148ad','422734f382d5979fb0356461500159dc0933c42e'],
  [326,'e5f779c60c53d6961adc59c5ab42dd086dda07d4','b13e37031b61e9344e4a70735426f4fa1720d952'],
  [324,'ada1c0891707aa5767e7d161acd152e8c77a73e2','f6e71b1331a8a428814ec0abc1c708e71870a6a3'],
  [327,'4925a8250a03d57353ed8986486a7b5024e111be','4741df2932cb3707ed741db725aebdec3aae981d'],
  [328,'ef551b991fb2a9f31f6592fc066168dbe2d3445f','5dfbcb47d5f89a96c562a7ae6dda322b7d921e88'],
  [329,'026eee33d51a296a2d2f876551ced092d7c01320','86ec92ff563db193b3255420658809c2c93a5a43'],
  [330,'baae5912740d74cc8746744f44379bbe7e8bbc3f','b0f27f0a3a6295dbbdc64b8940cfab3af6cad18c'],
  [331,'a330e12bdb0cc0145dc65e8d9e3f4793143ade3f','fe7f8d24389360f1605dc126ad69411dd955114a'],
]);
const candidate = Object.freeze({
  source:'d7177908b7e9bcd2190be69cc6ae7dc19e7a435d',
  sourceTree:'199bb02f7e8a6fdeae59a825b83374daac69a597',
  commit:'8653d66e2bb079f3c16d57235473da7771532eb8',
  tree:'a24a992d99d983cd635b5b374c097c80e93e136f',
  sourcePaths:Object.freeze({
    'tactical-ops-src/ui/fieldOpResults.css':'100644 blob 1e66ada543153f3bfbe72d82db0d8139583a17c0',
    'tactical-ops-src/version.ts':'100644 blob eaa618ad1120cee313a6a397b4bbcb9d08558445',
    'tools/verify_field_op_results_premium.mjs':'100644 blob a3a68f7c4e48d6b300cd38ae69773e8530df6d7c',
  }),
  generatedPaths:Object.freeze({
    'js/boot_loaders.js':'100644 blob 429a77a563a66711d104ef2484408d9d74866c84',
    'js/tactical_ops.js':'100644 blob 9d77fbff48b1da2c6ba9e4e9f28c32b7ce210ffc',
  }),
});
const own='tools/verify_tactical_premium_integration.mjs';
const helper='tools/verify_tactical_p32_provenance.mjs';
const version='tactical_ops.js v3.6.104-consequence-frame-fit-p32';
const cache='tops-3.6.104-consequence-frame-fit-p32';
const anchor="const changed=head=>git('diff','--name-only',base,head).trim().split('\\n');\n";

function gitAt(cwd,...args) {
  return execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024});
}
function treeEntries(git,ref) {
  return new Map(git('ls-tree','-r','-z',ref).split('\0').filter(Boolean).map(row=>{
    const tab=row.indexOf('\t');
    assert(tab>0,'malformed Git tree record');
    return [row.slice(tab+1),row.slice(0,tab)];
  }));
}
function exactDelta(git,before,after,expected) {
  const a=treeEntries(git,before),b=treeEntries(git,after);
  const actual=[...new Set([...a.keys(),...b.keys()])].filter(p=>a.get(p)!==b.get(p)).sort();
  assert.deepEqual(actual,Object.keys(expected).sort(),'unexpected release path(s)');
  for(const [path,entry] of Object.entries(expected))assert.equal(b.get(path),entry,'unreviewed release blob/mode: '+path);
}

// Reusable core for independent negative tests; production wrapper below pins all inputs.
export function verifyReleaseChain({accepted,candidate,extensionPaths},cwd=process.cwd()) {
  const git=(...args)=>gitAt(cwd,...args);
  assert(accepted.length>1,'missing accepted release chain');
  for(let i=0;i<accepted.length;i++) {
    const [pr,commit,tree]=accepted[i];
    assert.equal(git('rev-parse',commit+'^{tree}').trim(),tree,'accepted PR tree mismatch: #'+pr);
    if(i>0)assert.equal(git('rev-parse',commit+'^1').trim(),accepted[i-1][1],'accepted first-parent mismatch: #'+pr);
  }
  const baseline=accepted.at(-1)[1];
  assert.equal(git('rev-parse',candidate.source+'^1').trim(),baseline,'unexpected hotfix parent');
  assert.equal(git('rev-parse',candidate.source+'^{tree}').trim(),candidate.sourceTree,'hotfix source tree mismatch');
  assert.equal(git('rev-parse',candidate.commit+'^1').trim(),candidate.source,'unexpected generated bundle parent');
  assert.equal(git('rev-parse',candidate.commit+'^{tree}').trim(),candidate.tree,'generated bundle tree mismatch');
  exactDelta(git,baseline,candidate.source,candidate.sourcePaths);
  exactDelta(git,candidate.source,candidate.commit,candidate.generatedPaths);
  git('merge-base','--is-ancestor',candidate.commit,'HEAD');
  exactDelta(git,candidate.commit,'HEAD',extensionPaths);
  exactDelta(git,baseline,'HEAD',{...candidate.sourcePaths,...candidate.generatedPaths,...extensionPaths});
  // Reject staged/unstaged tracked changes anywhere, including file modes.
  git('diff','--exit-code','--no-ext-diff','--ignore-submodules=none','HEAD','--');
  const untracked=git('ls-files','--others','--exclude-standard','-z','--','tactical-ops-src','js','tools','images/tactical_ops','.github/workflows');
  assert.equal(untracked,'','untracked source/asset/workflow');
}

// The legacy file may only acquire this exact block; all previous checks stay byte-identical.
export function integrationBlock(sha) {
  assert.match(sha,/^[a-f0-9]{40}$/);
  return `\n/** P3.2: exact descendant of the accepted release chain, with pinned generated artifacts. */\nif (readLocalFile("tactical-ops-src/version.ts","utf8").includes("v3.6.104-consequence-frame-fit-p32")) {\n const verifier="${helper}";\n const expected="${sha}";\n assert.equal(git("rev-parse","HEAD:"+verifier).trim(),expected,"P3.2 provenance module commit mismatch");\n assert.equal(git("hash-object","--path="+verifier,verifier).trim(),expected,"P3.2 provenance module working copy mismatch");\n const {verifyP32Provenance}=await import("./verify_tactical_p32_provenance.mjs");\n verifyP32Provenance(expected);\n process.exit(0);\n}\n`;
}
export function verifyP32Provenance(expectedHelper,cwd=process.cwd()) {
  const git=(...args)=>gitAt(cwd,...args);
  const original=git('show',accepted.at(-1)[1]+':'+own);
  assert.equal(original.split(anchor).length,2,'historical integration anchor changed');
  const expected=original.replace(anchor,anchor+integrationBlock(expectedHelper));
  const committed=git('show','HEAD:'+own);
  assert.equal(committed,expected,'historical verifier changed outside approved insertion');
  assert.equal(readFileSync(join(cwd,own),'utf8'),expected,'working historical verifier changed');
  assert.equal(git('rev-parse','HEAD:'+helper).trim(),expectedHelper,'unexpected helper blob');
  const ownBlob=git('rev-parse','HEAD:'+own).trim();
  verifyReleaseChain({accepted,candidate,extensionPaths:{
    [own]:'100644 blob '+ownBlob,
    [helper]:'100644 blob '+expectedHelper,
  }},cwd);
  const read=p=>readFileSync(join(cwd,p),'utf8');
  assert(read('tactical-ops-src/version.ts').includes('VERSION = "'+version+'"'),'incorrect release version');
  assert(read('js/tactical_ops.js').includes(version),'incorrect production bundle version');
  assert(read('js/boot_loaders.js').includes(cache),'incorrect cache key');
  console.log('PASS P3.2: exact accepted PR ancestry/trees, authorized source and generated blobs, strict extension and clean tracked checkout.');
}
