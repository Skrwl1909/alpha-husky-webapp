/** Exact production reconciliation. Original FINAL and historical gates remain executable. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const RC='cbeb6bc3f9f3a07ea1aa66ad08de0f6d53a4b039';
const RC_TREE='c480cc61edfb11cd198da00443c449ed5d635f35';
const MAIN='1d4e3f8c800f999f69e4a199051e6c22be7175c9';
const MAIN_TREE='a622ec41df2d169fe29adc0e059548b180ef0268';
const own='tools/verify_tactical_premium_integration.mjs';
const helper='tools/verify_tactical_production_reconciliation.mjs';
const allowed={
  "assets/icons/navigation_v1/hub.svg": "a2dc2148f3a108fe4aba1c6bb37d2e2706e349e0",
  "assets/icons/navigation_v1/map.svg": "1d5068998602e232b0c1a47bbeaca93a685797f9",
  "assets/icons/navigation_v1/missions.svg": "169c52bb6a5ccdddb0a3068435f3fdd3b5238a27",
  "assets/icons/navigation_v1/quests.svg": "8bc79dad035175be0a65e80358af05c41e145994",
  "assets/icons/navigation_v1/tactical.svg": "86fcd35ed124c08bed084afad44ab1239f47793d",
  "index.html": "6ad52770362317ce7fbcb97a494ee6d60eec9ce6",
  "tools/build_tactical_ops.mjs": "f5bee32cc88bae5bdaef845b82ffb0e70169f5dd",
  "tools/final_rc_css_profile.mjs": "28cf8159aa8bca104b2d7e816f80565e11e46e30",
  "tools/verify_reconciliation_negative.mjs": "b75a02c9716bd61f7b5c1d498c365fc2aa0ea658",
  ".github/workflows/tactical-production-rc-p0.yml": "9b46b7784fafd42c848aa202a2e4b6dde075a23a"
};
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
export function reconciliationBlock(sha){
 return `\n/** Production RC P0: exact main + protected FINAL, with unchanged historical verification. */\nif (git('ls-tree','HEAD','${helper}').trim()) {\n const expected='${sha}';\n assert.equal(git('rev-parse','HEAD:${helper}').trim(),expected,'reconciliation helper commit mismatch');\n assert.equal(git('hash-object','--path=${helper}','${helper}').trim(),expected,'reconciliation helper working mismatch');\n const {verifyProductionReconciliation}=await import('./verify_tactical_production_reconciliation.mjs');\n verifyProductionReconciliation(expected);\n process.exit(0);\n}\n`;
}
export function verifyProductionReconciliation(expectedHelper){
 assert.equal(git('rev-parse',RC+'^{tree}'),RC_TREE,'protected FINAL tree');
 assert.equal(git('rev-parse',MAIN+'^{tree}'),MAIN_TREE,'protected current main tree');
 for(const parent of [RC,MAIN])git('merge-base','--is-ancestor',parent,'HEAD');
 const original=git('show',RC+':'+own);
 const anchor="const changed=head=>git('diff','--name-only',base,head).trim().split('\\n');";
 assert(original.includes(anchor),'missing original insertion point');
 const expected=original.replace(anchor,anchor+'\n'+reconciliationBlock(expectedHelper));
 assert.equal(git('show','HEAD:'+own),expected,'historical gate changed beyond exact dispatch');
 assert.equal(readFileSync(own,'utf8').replaceAll('\r\n','\n').trim(),expected,'working mandatory gate mismatch');
 const reviewed={...allowed,[helper]:expectedHelper,[own]:git('rev-parse','HEAD:'+own)};
 assert.deepEqual(git('diff','--name-only','--no-renames',RC,'HEAD').split('\n').filter(Boolean).sort(),Object.keys(reviewed).sort(),'unreviewed FINAL extension');
 for(const [path,sha] of Object.entries(reviewed)){
  assert.equal(git('rev-parse','HEAD:'+path),sha,'unreviewed committed blob '+path);
  assert.equal(git('hash-object','--path='+path,path),sha,'unreviewed working blob '+path);
 }
 git('diff','--exit-code','HEAD','--');
 assert.equal(git('ls-files','--others','--exclude-standard','--','tactical-ops-src','js','tools','images/tactical_ops','.github/workflows'),'','untracked release input');
 const temp=mkdtempSync(join(tmpdir(),'alpha-protected-final-')),checkout=join(temp,'rc');
 try{
  git('-c','core.autocrlf=false','worktree','add','--detach',checkout,RC);
  execFileSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{cwd:checkout,stdio:'inherit'});
 }finally{git('worktree','remove',checkout);rmdirSync(temp);}
 console.log('PASS production reconciliation: protected FINAL/current main ancestry, exact adapters, runtime unchanged, original FINAL and historical gates executed');
}
