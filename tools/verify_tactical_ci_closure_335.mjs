/** Exact PR335 presentation/test closure. All gameplay bytes remain protected. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const BASE='ddadf5699b557556f45042831dc1490a7c7752ff',TREE='08d104ac105950bd16d53f2bb48b35db53f3138a';
const own='tools/verify_tactical_premium_integration.mjs',helper='tools/verify_tactical_ci_closure_335.mjs';
const approved={
  "js/boot_loaders.js": "0667028b9ac63359e350cc92f6007b5d7b7673b2",
  "js/tactical_ops.js": "b9e38755507a1f965eaaa5e6b4e9e08e6d78c9bb",
  "tactical-ops-src/ui/warTableVisual.css": "e5b8381382e9d393c8e42ac969501104c19d782c",
  "tactical-ops-src/version.ts": "8981a728e6772cad93d2c923de0900c8a009785e",
  "tools/final_rc_css_profile.mjs": "395a82800e5fd456a642c11f2671707687313994",
  "tools/verify_tactical_confirmed_power_v1.mjs": "711d944d4018dd62b6b480d6671156c593073676",
  "tools/verify_tactical_counterstrike_browser.mjs": "822387dd8813d319b2d11935455cebbbab176427",
  "tools/verify_tactical_field_contracts_browser.mjs": "f80b79641d0e3bd00b292c2a94ed44e13dd092e5",
  "tools/verify_wartable_visual_v2.mjs": "22c646932d09999162db034d18de7e5c4bc4dfc2"
};
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
export function closureBlock(sha){return `
/** PR335 exact mobile presentation/test closure; original provenance executes unchanged. */
if (git('ls-tree','HEAD','${helper}').trim()) {
 const expected='${sha}';
 assert.equal(git('rev-parse','HEAD:${helper}').trim(),expected,'closure helper commit mismatch');
 assert.equal(git('hash-object','--path=${helper}','${helper}').trim(),expected,'closure helper working mismatch');
 const {verifyCiClosure335}=await import('./verify_tactical_ci_closure_335.mjs');
 verifyCiClosure335(expected);
 process.exit(0);
}
`;}
export function verifyCiClosure335(expectedHelper){
 assert.equal(git('rev-parse',BASE+'^{tree}'),TREE,'protected release tree');
 git('merge-base','--is-ancestor',BASE,'HEAD');
 const anchor="const changed=head=>git('diff','--name-only',base,head).trim().split('\\n');";
 const original=git('show',BASE+':'+own);
 const expected=original.replace(anchor,anchor+'\n'+closureBlock(expectedHelper));
 assert.notEqual(original,expected,'original insertion point missing');
 assert.equal(git('show','HEAD:'+own),expected,'mandatory gate changed beyond exact dispatch');
 assert.equal(readFileSync(own,'utf8').replaceAll('\r\n','\n').trim(),expected,'working mandatory gate');
 const reviewed={...approved,[helper]:expectedHelper,[own]:git('rev-parse','HEAD:'+own)};
 assert.deepEqual(git('diff','--name-only','--no-renames',BASE,'HEAD').split('\n').filter(Boolean).sort(),Object.keys(reviewed).sort(),'unreviewed release closure');
 for(const [p,sha] of Object.entries(reviewed)){
  assert.equal(git('rev-parse','HEAD:'+p),sha,'unreviewed committed blob '+p);
  assert.equal(git('hash-object','--path='+p,p),sha,'unreviewed working blob '+p);
 }
 const css='tactical-ops-src/ui/warTableVisual.css';
 const beforeCss=execFileSync('git',['show',BASE+':'+css],{encoding:'utf8'});
 const old=execFileSync('git',['show',BASE+':js/tactical_ops.js'],{encoding:'utf8',maxBuffer:32*1024*1024});
 const newCss=readFileSync(css,'utf8').replaceAll('\r\n','\n');
 assert.equal(old.split(beforeCss).length,2,'unique original CSS literal');
 const bundle=old.replaceAll('v3.6.107-final-release-closure','v3.6.108-production-acceptance-p0').replaceAll('tops-3.6.107-final-release-closure','tops-3.6.108-production-acceptance-p0').replace(beforeCss,newCss);
 assert.equal(readFileSync('js/tactical_ops.js','utf8'),bundle,'compiled gameplay changed: only version and one CSS literal may differ');
 git('diff','--exit-code','HEAD','--');
 assert.equal(git('ls-files','--others','--exclude-standard','--','tactical-ops-src','js','tools','images/tactical_ops','.github/workflows'),'','untracked release input');
 const temp=mkdtempSync(join(tmpdir(),'alpha-pr335-historical-')),checkout=join(temp,'accepted');
 try{
  git('-c','core.autocrlf=false','worktree','add','--detach',checkout,BASE);
  execFileSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{cwd:checkout,stdio:'inherit'});
 }finally{git('worktree','remove',checkout);rmdirSync(temp);}
 console.log('PASS PR335 closure: exact presentation/test delta, compiled gameplay byte-preserved, complete original provenance executed');
}
