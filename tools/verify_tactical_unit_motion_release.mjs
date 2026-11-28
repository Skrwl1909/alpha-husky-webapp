/** Exact presentation-only extension of merged PR335. Original gates execute unchanged. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const BASE='8b6e12ab37c9bed0d95205cd6b05253da7222e51';
const TREE='bad9c9d2cf6ab58e428a1788f2d0208a907baabe';
const PILOT='165651f7a75b373e318e21529421f83ec5b57790';
const own='tools/verify_tactical_premium_integration.mjs',helper='tools/verify_tactical_unit_motion_release.mjs';
const approved={
  ".github/workflows/tactical-unit-motion-v1.yml": "38829aa62dd69a454518f1d6e4eb8ae83e79146a",
  "assets/tactical_motion_sources/README.md": "d3cc01258daa5545ddb4cf711dec95cfda8f1316",
  "assets/tactical_motion_sources/alpha-strike-source.png": "e3579e26534c6cbd200fc0e4936076edfac06f56",
  "assets/tactical_motion_sources/skirmisher-strike-source.png": "1f3a9de13fa144d046ca2d59f645feaf965379d1",
  "docs/TACTICAL_UNIT_MOTION_V1.md": "570b5d224867f0a31333e304011575574c6703ca",
  "docs/qa/unit-motion-v1/alpha-contact.png": "e52803361d3a8a122a09fa927913237776dde504",
  "docs/qa/unit-motion-v1/alpha-strike-preview.gif": "839f218e6d347a2c740ad3996f1b16c75fdd8fee",
  "docs/qa/unit-motion-v1/results.json": "ee165786333a8cabd6ecc74e5b613dd2d84bf868",
  "docs/qa/unit-motion-v1/skirmisher-contact.png": "1bac75488459d5a4c4b9a3c1db5962bef06d94f7",
  "images/tactical_ops/unit_motion/v1/alpha-strike.webp": "8a15139178163186e6733d6e37f8187d1f66c3cd",
  "images/tactical_ops/unit_motion/v1/manifest.json": "a791052abdf345f9eaba8726372027e0c5a18291",
  "images/tactical_ops/unit_motion/v1/skirmisher-strike.webp": "c544b0a784109850224fbc2560ef992cacdf3f6e",
  "js/boot_loaders.js": "7f04140a7ca451f505b44b3bcd242ee08ec4c1b6",
  "js/tactical_ops.js": "7a0b964543c34b5e13593b67a3729282a6e7a042",
  "package-lock.json": "c98c9b5cf36c790facaf260a6ea62765fd9334bc",
  "package.json": "6ba368a53551d7d05ff6a5d46dfb854f37938494",
  "tactical-ops-src/styles.ts": "32ab83cae487c48b3977dea5975fec3e3e591a53",
  "tactical-ops-src/ui/Battle.tsx": "3291d9d72f4004987776609bbf0324b9826fc57b",
  "tactical-ops-src/ui/MotionActor.tsx": "6c6bc0626a0d57faff6ad088539c1ad817a3d531",
  "tactical-ops-src/ui/unitMotion.css": "fa6ee0209e868f96c7dfce250e7fefd68cd4c889",
  "tactical-ops-src/ui/unitVisual.ts": "a7dbf0183566f138939158808271cfb0471fe585",
  "tactical-ops-src/version.ts": "135ff9a0b4724800f85cfe40579ea20fb1d9dc10",
  "tools/build_tactical_unit_motion.mjs": "e78e49a07b385e57b9516ded4a3e793bba3b3729",
  "tools/final_rc_css_profile.mjs": "0e1f94f7516b8a7525e1e0a1b3745f7634ee476e",
  "tools/verify_tactical_alpha_directional_browser.mjs": "7f13b1f6019210b9ad800cc565c5169d33653a24",
  "tools/verify_tactical_unit_motion_browser.mjs": "a2026b07df3876038af9e50d69c1255461981a33"
};
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
export function motionReleaseBlock(sha){return `
/** Unit Motion V1: exact reconciled presentation delta; PR335 provenance executes unchanged. */
if (git('ls-tree','HEAD','${helper}').trim()) {
 const expected='${sha}';
 assert.equal(git('rev-parse','HEAD:${helper}').trim(),expected,'unit motion helper commit mismatch');
 assert.equal(git('hash-object','--path=${helper}','${helper}').trim(),expected,'unit motion helper working mismatch');
 const {verifyUnitMotionRelease}=await import('./verify_tactical_unit_motion_release.mjs');
 verifyUnitMotionRelease(expected);
 process.exit(0);
}
`;}
export function verifyUnitMotionRelease(expectedHelper){
 assert.equal(git('rev-parse',BASE+'^{tree}'),TREE,'protected public release tree');
 for(const parent of [BASE,PILOT])git('merge-base','--is-ancestor',parent,'HEAD');
 const anchor="const changed=head=>git('diff','--name-only',base,head).trim().split('\\n');";
 const original=git('show',BASE+':'+own);
 const expected=original.replace(anchor,anchor+'\n'+motionReleaseBlock(expectedHelper));
 assert.notEqual(original,expected,'missing original insertion point');
 assert.equal(git('show','HEAD:'+own),expected,'mandatory gate changed beyond exact dispatch');
 assert.equal(readFileSync(own,'utf8').replaceAll('\r\n','\n').trim(),expected,'working mandatory gate mismatch');
 const reviewed={...approved,[helper]:expectedHelper,[own]:git('rev-parse','HEAD:'+own)};
 assert.deepEqual(git('diff','--name-only','--no-renames',BASE,'HEAD').split('\n').filter(Boolean).sort(),Object.keys(reviewed).sort(),'unreviewed motion extension');
 for(const [path,hash] of Object.entries(reviewed)){
  assert.equal(git('rev-parse','HEAD:'+path),hash,'unreviewed committed blob '+path);
  assert.equal(git('hash-object','--path='+path,path),hash,'unreviewed working blob '+path);
 }
 for(const path of ['tactical-ops-src/combat','tactical-ops-src/data','tactical-ops-src/host','tactical-ops-src/store','images/tactical_ops/presentation/war_table_v2','tools/verify_tactical_ci_closure_335.mjs','tools/verify_tactical_production_reconciliation.mjs','tools/verify_tactical_final_provenance.mjs','tools/verify_tactical_p32_provenance.mjs','tools/verify_reconciliation_negative.mjs']){
  git('diff','--exit-code',BASE,'HEAD','--',path);
 }
 git('diff','--exit-code','HEAD','--');
 assert.equal(git('ls-files','--others','--exclude-standard','--','tactical-ops-src','js','tools','images/tactical_ops','assets','.github/workflows'),'','untracked release input');
 const temp=mkdtempSync(join(tmpdir(),'alpha-motion-historical-')),checkout=join(temp,'accepted');
 try{
  git('-c','core.autocrlf=false','worktree','add','--detach',checkout,BASE);
  execFileSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{cwd:checkout,stdio:'inherit'});
 }finally{git('worktree','remove',checkout);rmdirSync(temp);}
 console.log('PASS unit motion: exact reviewed presentation, protected public gameplay and workers, original PR335 provenance executed');
}
