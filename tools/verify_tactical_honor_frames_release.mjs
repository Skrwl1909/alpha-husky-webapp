/** Exact Tactical Honors UI delta. All historical release gates run unchanged. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const BASE='1c3df5de2f082c310a545c87501afbe48c8344c4';
const TREE='84a3ea508e1ac792f2ef30d850c7e12041680138';
const own='tools/verify_tactical_premium_integration.mjs',helper='tools/verify_tactical_honor_frames_release.mjs';
const approved={
  "js/boot_loaders.js": "b8d8c1957d923544547373db54ea0dd80659d8fc",
  "js/tactical_ops.js": "f439a72bd73dec67ae5bd790c2298af5461d8295",
  "tactical-ops-src/data/tacticalHonors.ts": "b746d30ac0916864ef8f13b2218dd72446e08c1b",
  "tactical-ops-src/host/bootstrap.ts": "c6cac823baa174dc9cf3122e15fb512cc19b7d59",
  "tactical-ops-src/host/bridge.ts": "7b8339677878469a0dfe2266ad13af7cd25e95a6",
  "tactical-ops-src/ui/TacticalLootHonors.tsx": "8e17f421c945a0d56d479e793d76e1fe4f06b195",
  "tactical-ops-src/version.ts": "5354ebac1dde5904c4962443aa8e8d136c28ddf9",
  "tools/final_rc_css_profile.mjs": "bf7aae612746d5b2c4fc53b5dc96a508a11baf1d",
  "tools/verify_tactical_loot_honors.mjs": "9acaef27eb1f1b752a1cc75368758cbad5febb7e",
  ".github/workflows/tactical-honors-frames-v1.yml": "ceef5987ae8cac042a4d4e1a03d6b2e613c2b913",
  "docs/TACTICAL_HONORS_FRAMES_V1.md": "8fbbb7a1b14e3af16bcc9305eba40366b0568237"
};
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
export function honorFramesReleaseBlock(sha){return `
/** Tactical Honors frames: exact UI delta; Atlas V3 and prior provenance execute unchanged. */
if (git('ls-tree','HEAD','${helper}').trim()) {
 const expected='${sha}';
 assert.equal(git('rev-parse','HEAD:${helper}').trim(),expected,'Honor Frames helper commit mismatch');
 assert.equal(git('hash-object','--path=${helper}','${helper}').trim(),expected,'Honor Frames helper working mismatch');
 const {verifyHonorFramesRelease}=await import('./verify_tactical_honor_frames_release.mjs');
 verifyHonorFramesRelease(expected);
 process.exit(0);
}
`;}
export function verifyHonorFramesRelease(expectedHelper){
 assert.equal(git('rev-parse',BASE+'^{tree}'),TREE,'protected public release tree');
 git('merge-base','--is-ancestor',BASE,'HEAD');
 const anchor="const changed=head=>git('diff','--name-only',base,head).trim().split('\\n');";
 const original=git('show',BASE+':'+own);
 const expected=original.replace(anchor,anchor+'\n'+honorFramesReleaseBlock(expectedHelper));
 assert.notEqual(original,expected,'missing original insertion point');
 assert.equal(git('show','HEAD:'+own),expected,'mandatory gate changed beyond exact dispatch');
 assert.equal(readFileSync(own,'utf8').replaceAll('\r\n','\n').trim(),expected,'working mandatory gate mismatch');
 const reviewed={...approved,[helper]:expectedHelper,[own]:git('rev-parse','HEAD:'+own)};
 assert.deepEqual(git('diff','--name-only','--no-renames',BASE,'HEAD').split('\n').filter(Boolean).sort(),Object.keys(reviewed).sort(),'unreviewed Honor Frames extension');
 for(const [path,hash] of Object.entries(reviewed)){
  assert.equal(git('rev-parse','HEAD:'+path),hash,'unreviewed committed blob '+path);
  assert.equal(git('hash-object','--path='+path,path),hash,'unreviewed working blob '+path);
 }
 for(const path of ['tactical-ops-src/combat','tactical-ops-src/store','images/tactical_ops/presentation/war_table_v2','tools/verify_tactical_ci_closure_335.mjs','tools/verify_tactical_unit_motion_release.mjs','tools/verify_tactical_signal_atlas_v3_release.mjs','.github/workflows/tactical-player-voice-v1.yml','package-lock.json','package.json','tactical-ops-src/ui/Battle.tsx','images/tactical_ops/unit_motion/v1','tools/verify_tactical_production_reconciliation.mjs','tools/verify_tactical_final_provenance.mjs','tools/verify_tactical_p32_provenance.mjs','tools/verify_reconciliation_negative.mjs']){
  git('diff','--exit-code',BASE,'HEAD','--',path);
 }
 git('diff','--exit-code','HEAD','--');
 assert.equal(git('ls-files','--others','--exclude-standard','--','tactical-ops-src','js','tools','images/tactical_ops','assets','.github/workflows'),'','untracked release input');
 const temp=mkdtempSync(join(tmpdir(),'alpha-frames-historical-')),checkout=join(temp,'accepted');
 try{
  git('-c','core.autocrlf=false','worktree','add','--detach',checkout,BASE);
  execFileSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{cwd:checkout,stdio:'inherit'});
 }finally{git('worktree','remove',checkout);rmdirSync(temp);}
 console.log('PASS Tactical Honors frames: exact reviewed delta, protected gameplay and history');
}
