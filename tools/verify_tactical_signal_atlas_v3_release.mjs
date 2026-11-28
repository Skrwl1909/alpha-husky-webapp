/** Exact presentation-only extension of Unit Motion V1. The complete prior gates execute unchanged. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const BASE='be9a635b6629be94256fbe384a5bc4257c17676c';
const TREE='e7d45bfdc338e48fabb00490944eb1b984c73378';
const own='tools/verify_tactical_premium_integration.mjs',helper='tools/verify_tactical_signal_atlas_v3_release.mjs';
const approved={
  "docs/TACTICAL_SIGNAL_ATLAS_V3_PREVIEW.md": "fa1984cf66b5cc2faad34f439490c73277109c62",
  "images/tactical_ops/signal_atlas/v3/IDENTITY_README.md": "f873c1a6d00708b0fad2bc7d93db38224b4e9c4e",
  "images/tactical_ops/signal_atlas/v3/README.md": "96c4ce2e910f439fc740f19b665471d98ceb2b88",
  "images/tactical_ops/signal_atlas/v3/identity_manifest.json": "a5d215944d669728491f644d4bbcb0fc63781132",
  "images/tactical_ops/signal_atlas/v3/manifest.json": "40baeff1712ca0d218c32b9639ef3b359a0aef47",
  "images/tactical_ops/signal_atlas/v3/runtime/backgrounds/atlas_relay_chamber_v3.webp": "82b656b9221117062be64320c7f5eecb0ed1b0cd",
  "images/tactical_ops/signal_atlas/v3/runtime/backgrounds/atlas_sector_signal_bay_v3.webp": "0e5b7bef9fe35ddcd238b82e172debadcecb8537",
  "images/tactical_ops/signal_atlas/v3/runtime/capstones/atlas_capstone_disruptor_v1.webp": "ba0a3e618cc9df55cc36fc4e1a4e71804d31072d",
  "images/tactical_ops/signal_atlas/v3/runtime/capstones/atlas_capstone_howlkeeper_v1.webp": "d0538cf67154830a9328c8179694ca85b3b1c479",
  "images/tactical_ops/signal_atlas/v3/runtime/capstones/atlas_capstone_medic_v1.webp": "c1fab61738250d0799b16f130d9a20c05257067f",
  "images/tactical_ops/signal_atlas/v3/runtime/capstones/atlas_capstone_pursuer_v1.webp": "cad8891be638bfabf56740360b1de3a5a96ebd97",
  "images/tactical_ops/signal_atlas/v3/runtime/capstones/atlas_capstone_sentinel_v1.webp": "d5c77b053afdfc99f1e79049666cb218da79ad5e",
  "images/tactical_ops/signal_atlas/v3/runtime/capstones/atlas_capstone_vanguard_v1.webp": "423b18ece4c9e340bec0140b4cbdcd805604eb31",
  "images/tactical_ops/signal_atlas/v3/runtime/frames/atlas_combat_core_bezel_v2.webp": "2d975886eb1b61a2d9c101f56da595aac5b43257",
  "images/tactical_ops/signal_atlas/v3/runtime/frames/atlas_node_active_skill_v1.webp": "ae9b24ea727170455a1e84fd883450ca555f404e",
  "images/tactical_ops/signal_atlas/v3/runtime/frames/atlas_node_capstone_v1.webp": "af9d680b431c68e6f8f12231d8bfc88fd121d7f6",
  "images/tactical_ops/signal_atlas/v3/runtime/frames/atlas_node_doctrine_v1.webp": "2e5ddabc2e9865c0545624fece3069978a64d4cf",
  "images/tactical_ops/signal_atlas/v3/runtime/frames/atlas_node_passive_talent_v1.webp": "bc7798596ac63c48b155ec720227c42a1d188d7b",
  "images/tactical_ops/signal_atlas/v3/runtime/frames/atlas_node_skill_mutation_v1.webp": "37893aeb283c3f1564929ab9e90cf2aa22110953",
  "images/tactical_ops/signal_atlas/v3/runtime/frames/atlas_node_synergy_v1.webp": "b9a61b8725e07acf7b43573ff65ba0b9ac0697b5",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/README.md": "a9438c83349936aabe4890653f47abcdb108a69b",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_inspector_frame_v2.svg": "bb4c85c96fceb7ce3e42b769603a32ff5fb595f8",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_junction_contact_v1.svg": "726b8c33f8570667a43daa4082b388473473614a",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_junction_cross_v1.svg": "b566eae1d3243220550d80bb359e99ec6f9eef18",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_junction_elbow_v1.svg": "379ad9401757ff89b7a31abbdad2a0ea1ae9cc20",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_junction_endpoint_v1.svg": "bb19e149c3359ec4b5fbd981452fb0e78ba3537d",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_junction_splitter_v1.svg": "c91d0ecd9ee33f080223c14e52436a4ba534e932",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_junction_straight_v1.svg": "52182f2310f311a0545f19f0164e367077bc1473",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/atlas_ui.css": "0f0669277952fab04f59dd05af1d96be487666cd",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_identity_v1.css": "7c9ad705bebd386c04dbb1b9b8aed5572576223c",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_reserved_standard_v1.svg": "99d42fc3309d3ca12a92c39d872fdd6d57f14e24",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_reserved_terminal_v1.svg": "1e7b9a992dcda52dde7704a64aac7b8238043a9b",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_sector_plate_control_v1.svg": "54bd129c55c9352ef8ed8174041d9dc5eb8e6486",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_sector_plate_fang_v1.svg": "ffb64aa8de12aa5f83db2dee246c4a148e5fb038",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_sector_plate_front_line_v1.svg": "737c021854351e7f91e7e55eca3933dd31141a34",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_sector_plate_howl_v1.svg": "11239716df84706227e0407ccbca2b0291744489",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_sector_plate_pursuit_v1.svg": "2e1f2d8c5b1d6ef404586bbee4b1da9397be8691",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_sector_plate_support_v1.svg": "fb64c0537a1333d273e78dac2b12c4622eb26979",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_state_acquired_v1.svg": "65072296a8c038d3049518d49b4436149ee4229d",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_state_available_v1.svg": "df04676e59642aadeefcc43fb6cc213e7a887f30",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_state_locked_v1.svg": "8da0b73b57d875eff52142472c87e2b4ac808b38",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_state_owned_v1.svg": "af7f80a749a2d8f5ee6264a09f6caef24eaac233",
  "images/tactical_ops/signal_atlas/v3/runtime/ui/identity/atlas_state_preview_v1.svg": "6575fd0b72f3bd251afeaec51723f1054bc02455",
  "images/tactical_ops/signal_atlas/v3/runtime/variants/atlas_variant_blood_scent_v1.webp": "adfeee739c99a35f4da5501cb5999723fdadaf7f",
  "images/tactical_ops/signal_atlas/v3/runtime/variants/atlas_variant_heavy_lunge_v1.webp": "be29c48170974ecc01ed64f146bb430b19675e7f",
  "images/tactical_ops/signal_atlas/v3/runtime/variants/atlas_variant_pack_link_v1.webp": "1c3ea4f08f5b0963aec002d7febd50c787144076",
  "images/tactical_ops/signal_atlas/v3/runtime/variants/atlas_variant_wide_lunge_v1.webp": "df1f6e4463d7b20d4aee4d60b9fa4b5031ca407b",
  "js/boot_loaders.js": "b1961f089d9b897e0e371360ae800608980d6c26",
  "js/tactical_ops.js": "dc9171278fb13442c7c6354f1be129a4159224b8",
  "tactical-ops-src/styles.ts": "bcb33b6ec64e9a9283ff113f2f8702e49f8548c5",
  "tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx": "4f8ecfa800e0fbbb1c70cd94e3bb44ea816b922b",
  "tactical-ops-src/ui/signalAtlas/signalAtlasV3.css": "7db513b8319eceef6b4cad6f22f935e9fff9d548",
  "tactical-ops-src/ui/signalAtlas/signalAtlasV3Art.ts": "7f224c1b76de85a983a8f3229ff4c2ef7a3edf04",
  "tactical-ops-src/version.ts": "122fcadfe5320976477e27f6447685c30809a8ee",
  "tools/final_rc_css_profile.mjs": "444f3037516735ce80add17f85cc6caea9c5992c",
  "tools/verify_tactical_signal_atlas_default_browser.mjs": "0d2809f6e647d861b477ed9af4f9ab06a84fd0da",
  "tools/verify_tactical_signal_atlas_v3_assets.mjs": "00c59c70f7844ee3da70b908788426105c70ec4d"
};
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
export function atlasV3ReleaseBlock(sha){return `
/** Signal Atlas V3: exact presentation delta; Unit Motion V1 and historical provenance execute unchanged. */
if (git('ls-tree','HEAD','${helper}').trim()) {
 const expected='${sha}';
 assert.equal(git('rev-parse','HEAD:${helper}').trim(),expected,'Atlas V3 helper commit mismatch');
 assert.equal(git('hash-object','--path=${helper}','${helper}').trim(),expected,'Atlas V3 helper working mismatch');
 const {verifyAtlasV3Release}=await import('./verify_tactical_signal_atlas_v3_release.mjs');
 verifyAtlasV3Release(expected);
 process.exit(0);
}
`;}
export function verifyAtlasV3Release(expectedHelper){
 assert.equal(git('rev-parse',BASE+'^{tree}'),TREE,'protected public release tree');
 git('merge-base','--is-ancestor',BASE,'HEAD');
 const anchor="const changed=head=>git('diff','--name-only',base,head).trim().split('\\n');";
 const original=git('show',BASE+':'+own);
 const expected=original.replace(anchor,anchor+'\n'+atlasV3ReleaseBlock(expectedHelper));
 assert.notEqual(original,expected,'missing original insertion point');
 assert.equal(git('show','HEAD:'+own),expected,'mandatory gate changed beyond exact dispatch');
 assert.equal(readFileSync(own,'utf8').replaceAll('\r\n','\n').trim(),expected,'working mandatory gate mismatch');
 const reviewed={...approved,[helper]:expectedHelper,[own]:git('rev-parse','HEAD:'+own)};
 assert.deepEqual(git('diff','--name-only','--no-renames',BASE,'HEAD').split('\n').filter(Boolean).sort(),Object.keys(reviewed).sort(),'unreviewed Atlas V3 extension');
 for(const [path,hash] of Object.entries(reviewed)){
  assert.equal(git('rev-parse','HEAD:'+path),hash,'unreviewed committed blob '+path);
  assert.equal(git('hash-object','--path='+path,path),hash,'unreviewed working blob '+path);
 }
 for(const path of ['tactical-ops-src/combat','tactical-ops-src/data','tactical-ops-src/host','tactical-ops-src/store','images/tactical_ops/presentation/war_table_v2','tools/verify_tactical_ci_closure_335.mjs','tools/verify_tactical_unit_motion_release.mjs','tactical-ops-src/ui/Battle.tsx','images/tactical_ops/unit_motion/v1','tools/verify_tactical_production_reconciliation.mjs','tools/verify_tactical_final_provenance.mjs','tools/verify_tactical_p32_provenance.mjs','tools/verify_reconciliation_negative.mjs']){
  git('diff','--exit-code',BASE,'HEAD','--',path);
 }
 git('diff','--exit-code','HEAD','--');
 assert.equal(git('ls-files','--others','--exclude-standard','--','tactical-ops-src','js','tools','images/tactical_ops','assets','.github/workflows'),'','untracked release input');
 const temp=mkdtempSync(join(tmpdir(),'alpha-atlas-v3-historical-')),checkout=join(temp,'accepted');
 try{
  git('-c','core.autocrlf=false','worktree','add','--detach',checkout,BASE);
  execFileSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{cwd:checkout,stdio:'inherit'});
 }finally{git('worktree','remove',checkout);rmdirSync(temp);}
 console.log('PASS Atlas V3: exact reviewed presentation, protected gameplay and motion, prior provenance executed');
}
