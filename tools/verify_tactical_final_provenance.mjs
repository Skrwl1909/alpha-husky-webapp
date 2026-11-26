/** Exact owner-hold release extension. Historical provenance remains executable.
 * Every new path is pinned; runtime and all nine artworks equal the protected RC.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const BASE='b9e8c868dbff7245c7fb705e1c0e47d2804e463a';
const BASE_TREE='053136168895d445ee47488b087e561b49d9ceb3';
const HISTORIC='a3161f8e8ef7f2f4dd06191718170b814f2093b3';
const own='tools/verify_tactical_premium_integration.mjs';
const helper='tools/verify_tactical_final_provenance.mjs';
const reviewed={
  "tools/verify_final_power_gameplay.mjs": "3e11f47fea11d68952ad432def37b5f60a80c441",
  "tools/verify_final_release_contracts.mjs": "961f23321f81391b8330c17157e0e0954c47f42a"
};
const chain=[
  [
    "ce348e25b1637d2c1569d997ecf4abf480e81799",
    "868891a0c9d2f262ecb5c8f397a14a1f5d92e49c"
  ],
  [
    "c0266ab8910c8917ca03d9ce4866fada46f47486",
    "27ac7d817e565912253108b3e65d9c048ebb1eb6"
  ],
  [
    "ba7aa891d964fd7e14df1b2c81ba28a02031b805",
    "1c9ce5641aaecc4b44fb759cd0377f06c132472f"
  ],
  [
    "845daaf7676c8e75b472147a23967fff821aa165",
    "4688c555dffb7d82cdbd04ef02a91bb05e6d7afe"
  ],
  [
    "6defe3e7ab02611d0af282b611e8bdec29074af0",
    "9ec36ef25e483bab0d516c3c6518ed2f0db0509a"
  ],
  [
    "b9e8c868dbff7245c7fb705e1c0e47d2804e463a",
    "053136168895d445ee47488b087e561b49d9ceb3"
  ]
];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
export function finalBlock(sha){
 assert.match(sha,/^[a-f0-9]{40}$/);
 return `\n/** Final owner-hold RC: exact reviewed tree extension; historical gates stay pinned. */\nif (readLocalFile("tactical-ops-src/version.ts","utf8").includes('v3.6.106-war-table-v2-rc')) {\n const expected='${sha}';\n assert.equal(git('rev-parse','HEAD:${helper}').trim(),expected,'final helper commit mismatch');\n assert.equal(git('hash-object','--path=${helper}','${helper}').trim(),expected,'final helper working mismatch');\n const {verifyFinalProvenance}=await import('./verify_tactical_final_provenance.mjs');\n verifyFinalProvenance(expected);\n process.exit(0);\n}\n`;
}
export function verifyFinalProvenance(expectedHelper){
 assert.equal(git('rev-parse',BASE+'^{tree}'),BASE_TREE,'protected candidate tree');
 assert.equal(git('rev-parse',HISTORIC+'^{tree}'),'400ccb8841cf4146e6485298a35ef2e5fc7f289d','historical release tree');
 for(const [commit,tree] of chain){
  assert.equal(git('rev-parse',commit+'^{tree}'),tree,'intermediate candidate tree');
  git('merge-base','--is-ancestor',commit,BASE);
 }
 git('merge-base','--is-ancestor',BASE,'HEAD');
 const expected=git('show',BASE+':'+own).replace("const changed=head=>git('diff','--name-only',base,head).trim().split('\\n');",m=>m+'\n'+finalBlock(expectedHelper)).trim();
 assert.equal(readFileSync(own,'utf8').replaceAll('\r\n','\n').trim(),expected,'historical gate changed beyond exact dispatch');
 assert.equal(git('show','HEAD:'+own),expected,'committed provenance gate');
 const allowed={...reviewed,[helper]:expectedHelper,[own]:git('rev-parse','HEAD:'+own)};
 const changed=git('diff','--name-only','--no-renames',BASE,'HEAD').split('\n').filter(Boolean).sort();
 assert.deepEqual(changed,Object.keys(allowed).sort(),'unreviewed candidate extension');
 for(const [path,blob] of Object.entries(allowed)){
  assert.equal(git('rev-parse','HEAD:'+path),blob,'unreviewed committed blob '+path);
  assert.equal(git('hash-object','--path='+path,path),blob,'unreviewed working blob '+path);
 }
 git('diff','--exit-code','HEAD','--');
 assert.equal(git('ls-files','--others','--exclude-standard','--','tactical-ops-src','js','tools','images/tactical_ops','.github/workflows'),'','untracked release input');
 // Execute the unchanged historical mandatory gate against its accepted release.
 const parent=mkdtempSync(join(tmpdir(),'alpha-historic-provenance-'));
 const checkout=resolve(parent,'accepted');
 assert(checkout.startsWith(resolve(parent)+requireSeparator()),'worktree target escaped temporary root');
 try{
  git('-c','core.autocrlf=false','worktree','add','--detach',checkout,HISTORIC);
  execFileSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{cwd:checkout,stdio:'inherit'});
 }finally{
  git('worktree','remove',checkout);
  rmdirSync(parent);
 }
 console.log('PASS final provenance: protected and intermediate trees, exact extension, unchanged runtime/art/cache, historical mandatory gate');
}
function requireSeparator(){return process.platform==='win32'?'\\':'/';}
