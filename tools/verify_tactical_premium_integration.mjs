/** Pin source provenance and protect every production source/contract during integration. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync as readLocalFile,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const base='040831f33c34c1a1b02b282215097b0f8f4c0e1d';
const heads=['02908d0c2e9d65c16efc406cff3fae3f6316cade','de5a506d1142b2c61eb8fd8e6b112d0eedfa9a0c'];
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:8*1024*1024});
const changed=head=>git('diff','--name-only',base,head).trim().split('\n');
const generated=new Set(['js/tactical_ops.js','js/boot_loaders.js','tactical-ops-src/version.ts']);
// Preserve the historical assertions at the reviewed main commit. Verify exact
// Last Howl leaves independently before using their historical source below.
const lastHowlBase = '0378efb6817bd2b023d7d9b445197967d26a8668';
const lastHowlBlobs = Object.freeze({
 'index.html': 'b993f459678bf92f6c48c7564babc16d79dbbb16',
 'js/boot_loaders.js': '990dbe309513f62a43bdef5e0812189de22e7d03',
 'js/tactical_ops.js': '5cb2d0140431ecab3c32ff990022cdfb3df313af',
 'tactical-ops-src/combat/battle.ts': '565c755a1b633a45c6467e7bd9ed087f8fc13ab4',
 'tactical-ops-src/combat/intentContract.ts': '97f3afc04170d4134b7fc47b9510da4a2331e47b',
 'tactical-ops-src/combat/lastHowlAuthority.ts': 'ebc8d7c3a50119f6395ab88e2e376343e4995131',
 'tactical-ops-src/combat/recoverAuthority.ts': 'c6793f4a21a4a7592ec00035d9debae0b07080f7',
 'tactical-ops-src/host/bootstrap.ts': 'f4ad315535814f1bbbfd81393f888a80a85d7ca5',
 'tactical-ops-src/host/bridge.ts': 'bd5345b87177af7320b540e2c39d083ac242141d',
 'tactical-ops-src/host/foundationProgression.ts': 'efd373fef4a362916d1e4c75d7c1db275947fe4d',
 'tactical-ops-src/store/battleStore.ts': '60c1cc70e3f73f922536cfdfbd925516c8f94d46',
 'tactical-ops-src/styles.ts': '0f8d81d41f854ce542b71ebdb387180a318476f0',
 'tactical-ops-src/ui/App.tsx': '191e4043199da75c1b7bb4e414337655b3c2ed8d',
 'tactical-ops-src/ui/Battle.tsx': '8edf6ec8cc68b0fc5ea9bbf1be01a6e61f2047bb',
 'tactical-ops-src/ui/LastHowl.tsx': '232a14edea17504cb73f9ad1a8da7b29f386f696',
 'tactical-ops-src/ui/lastHowl.css': '8e049944066c91e77c5644eeaaa2c5e38c61f2a5',
 'tactical-ops-src/version.ts': '5ea902fd0fb4a174f573a44877bee23c774fd6d8',
 'tools/verify_tactical_defeated_tile_hitbox.mjs': 'bc2cf45bb968257a4e867e7dd342a5c904a84a48',
 'tools/build_tactical_last_howl_engine_v1.mjs': '5b123122984f679558105025bf32effd6995773f',
 'tools/tactical_last_howl_engine_v1.ts': '189220902c80420e81858ab7d20b10e5ff7a6a55',
 'tools/verify_tactical_last_howl.mjs': '712d3f51471496d78cc7165e087184a5a5ddd052',
 'tools/verify_tactical_last_howl_browser.mjs': '95e6c61b5b6561da84ce0fe35bdf57709f957b37',
});
const provenanceVerifier = 'tools/verify_tactical_premium_integration.mjs';
const lastHowlV1Release = '5e0f5218d44d1552e052dede538cf2a8a7916b60';
const retiredV1WorkerSources = new Set([
 'tools/build_tactical_last_howl_engine_v1.mjs',
 'tools/tactical_last_howl_engine_v1.ts',
]);
const lastHowlPressureBlobs = Object.freeze({
 'tactical-ops-src/combat/lastHowlAuthority.ts': '8e9e3705ade61fbd844e54bac88b57d81bae3c17',
 'tools/verify_tactical_last_howl.mjs': '18ba5f4dfcc3d1d9d98b2888153c05752940439c',
 'tools/build_tactical_last_howl_engine_v11.mjs': '809c66d0dfa42595ca082be67da6f5a3c4be8bd9',
 'tools/tactical_last_howl_engine_v11.ts': '189220902c80420e81858ab7d20b10e5ff7a6a55',
});
// Combat Motion Foundation V1 (#296): exact reviewed render-only source and
// cache delivery. Historical V1/V1.1 hashes above remain unchanged.
const approvedCombatMotionBlobs = Object.freeze({
 'index.html': '9d8bacb8e6b2d937d20b1c51c2da055cca9846db',
 'js/boot_loaders.js': '5972da2cd5f120e5dd6e630f4d958737e922852b',
 'js/tactical_ops.js': 'baeaa3a38605c72a8f7a0f15dfa9ffa6fab39ffa',
 'tactical-ops-src/tactical.css': 'd9950b9e10a1cdaa8b82ec47ee53201caf5568cc',
 'tactical-ops-src/ui/Battle.tsx': '1b3a9b1afb5082db0b4ad06abddb041e3151ee5d',
 'tactical-ops-src/ui/combatCohesion.css': '298ea0d05788206f6bba74fc0f53258fefca9d4c',
 'tactical-ops-src/version.ts': 'c9b540bc8c3be27717f3f9f4a7851cd0180ef9a1',
 'tools/verify_tactical_combat_motion_v1.mjs': '3c215f35c85f3488569ea4dace12949e77efa624',
});
// Enemy Combat Motion V1: approved presentation-only bindings for #297 poses.
// Preserve historical combat-authority and reward pins without widening scope.
const approvedEnemyMotionV1Blobs = Object.freeze({
 'index.html': '49fd863a599a75e821eec0feda0f70717ab354ae',
 'js/boot_loaders.js': 'e216560c5497dbebd216f9baac8fb4282f469f44',
 'js/tactical_ops.js': 'de33fb2d333309977c62bb2adf12890cae3aeb99',
 'tactical-ops-src/ui/Battle.tsx': '6f9cccd7f1c602f60a8aaec797002a9306ac0a7b',
 'tactical-ops-src/ui/combatCohesion.css': 'ba865b5625a6d5c6a8b0c80c08bc608036ff7022',
 'tactical-ops-src/ui/houndDirectional.ts': 'ecf5d808e29064d59e9ab84a00e48a2259873aae',
 'tactical-ops-src/version.ts': 'ab467190d3d303439b1061bff992428a2594fc29',
 'tools/verify_tactical_enemy_combat_motion_v1.mjs': 'b5cfffa2bd1803338577236d98d538894d45484a',
 'tools/verify_tactical_hound_directional.mjs': '8340b41b16560f20fb54634b9bd6ec10766c123e',
});
// Skill & Mastery Motion V1: event-confirmed cast origin and post-contact
// growth cues. The previous motion/authority approvals remain intact.
const approvedSkillMasteryMotionV1Blobs = Object.freeze({
 'index.html': '753cec55e369f40539c0ffa0e8a234356f992876',
 'js/boot_loaders.js': '98f02ac53aa5ee8e7a0f13facaf5a0c6e141a9e2',
 'js/tactical_ops.js': '04aca6dd28817db0826102ba95c292af5327dea6',
 'tactical-ops-src/ui/Battle.tsx': '89f6dbf9df62639618dfb2c896ea8e956e51533c',
 'tactical-ops-src/ui/combatCohesion.css': '8133e189cdf04d022e7c6f73cf9f863caabc0f18',
 'tactical-ops-src/version.ts': '7f3e294ffea9695fce86ae77ae06744644de4f49',
 'tools/verify_tactical_skill_mastery_motion_v1.mjs': '9ace068ba4f86ed9f3792dcdcee1ee881ef974d0',
});
const masteryEffectBase = 'bdc545d9fe140e7a79581452ad4309588af3e7b1';
const approvedMasteryEffectBlobs = Object.freeze({
 // PR #301 CI follow-up: precisely reviewed fixture and legacy contract checks.
 '.github/workflows/tactical-cinematic-results.yml': '200decc48c1c7e794f44def110cecabf2c3622f6',
 'index.html': '21c752ecc6362185b41c7afb8471625c3f4b9f32',
 'js/boot_loaders.js': '20ac0088ac7840f3bd004bf489fedcca7b71341e',
 'js/tactical_ops.js': 'e57986c501d536f241f5d381c6853c4afbb34c48',
 'tactical-ops-src/ui/App.tsx': '951f8f41b03fd3ec62dd69cc3f7db055a7de6a9d',
 'tactical-ops-src/ui/Battle.tsx': 'b94d2f5ba6050af8c1a62ffddbe5b02679e5dc3c',
 'tactical-ops-src/ui/LastHowl.tsx': 'a8df931c0ee5e9b13bf8fc7a39b2ecad85c44c6f',
 'tactical-ops-src/ui/PackMastery.tsx': '9cdcb19ff9915f467544c2259ed7fe644edf9c32',
 'tactical-ops-src/ui/Skillbook.tsx': '9bcea2551b46d98fc7f3e9768001a338df7aa804',
 'tactical-ops-src/ui/fieldcraft.ts': '44d90dbc35ce96804d397ac2d2c210443871a834',
 'tactical-ops-src/ui/s3CombatProof.ts': 'eb7d32ab19ea2bd8c5535b7a468182f0219bf309',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': 'd650ca0a718e9eb94ae6a8a23b0dbe4a4d87170b',
 'tactical-ops-src/ui/signalAtlas/model.ts': '3a2bef9d5b848ecc1e8bf715f06fd1f73a846f05',
 'tactical-ops-src/ui/skillEffectView.ts': 'ae3fec10c6b6f58e4b1d6021c459a842d20679f3',
 'tactical-ops-src/version.ts': '8e2df04014f30393ae8a002c588a5b411b12e5cf',
 'tools/verify_tactical_mastery_effect_truth.mjs': '7b0dd5d7ae33a0c59b865f474eb7313a101e2355',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': 'f9a4c97a85b2f6ebe325d34253f2d0bae5f8341e',
 'tools/verify_tactical_mission_clarity.mjs': '0140481466f7631c96b88891f175f830916873f9',
 'tools/verify_tactical_command_deck.mjs': 'd5fb05b1cde1d7064522bfe6b3a5d734d16c1ad5',
 'tools/verify_tactical_g1_browser.mjs': 'b525a21a33a615fe03a39a4d7e681182c16a8271',
});
const m2Base = '2fdb990846840a997f36a49a176b6f848463a46d';
const approvedM2Blobs = Object.freeze({
 '.github/workflows/tactical-purpose-return.yml': 'a5df4935b1579bc9e7f63a5c441ab7a9182e985f',
 'index.html': '1617e41333b2cb5f496df9618c52c1369dd7afe5',
 'js/boot_loaders.js': 'ab0d020260155c0597a0fff641303c3c28d885dd',
 'js/tactical_ops.js': 'c7a613e986aca4f17460968554476131296de8b7',
 'tactical-ops-src/combat/skills.ts': '189e84a07ee9e4fec938881a22a90bd64e615966',
 'tactical-ops-src/data/playerGrowth.ts': '7b0c70704d4c3a4ffe7a3daa02a62dd31eb3e344',
 'tactical-ops-src/host/foundationProgression.ts': 'ffd775b1f607b2b29a1ee33472c330c09da70190',
 'tactical-ops-src/store/battleStore.ts': 'dd1a8ffc9bba74b25365d961ace01a7164512c17',
 'tactical-ops-src/ui/Battle.tsx': 'a7cafc9629cf9993ea842d47c1a8cc86bd41af33',
 'tactical-ops-src/ui/s3CombatProof.ts': 'ecc2d3168249281a15d998e09436b4f68c59792f',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '60a43d9d2b22b6f5f1520dd8544372ee0a641c09',
 'tactical-ops-src/ui/signalAtlas/signalAtlas.css': 'b076dffea8143e76620da40e94aa5b061394887b',
 'tactical-ops-src/version.ts': 'ab9e9c074ddc54dd66ce346a32e08061ac1dcbf2',
 'tools/build_tactical_m2_workers.mjs': '6ce45bb07ad457733d382e8a69d8dccc33434fc5',
 'tools/verify_tactical_last_howl_browser.mjs': '2098f1ea6c2e352889abd81e0330d2eb6d10b32b',
 'tools/verify_tactical_m2_wide_lunge.mjs': '1ce797384a6ba6d0f896e310fedccd3f9e8e5d4c',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': '8cbe38cd4b5e080a6fe8b29eceafc896cdf01e92',
});
// Signal Atlas Premium V1 is a visual-only descendant of merged #302.
// Keep all historical M2 approvals immutable; pin the seven current leaves
// separately so CI can reject unrelated changes without freezing the UI.
const signalAtlasPremiumBase = 'fec9422a265ac455a05b8318e426100c89f32097';
const approvedSignalAtlasPremiumBlobs = Object.freeze({
 'js/boot_loaders.js': 'fcb1ec3009b9501f08496f7239b0c2b19527c36c',
 'js/tactical_ops.js': 'b6a5d6d03cbadd8b6943c926e14949bcb82cb1c7',
 'tactical-ops-src/styles.ts': 'aa3f6791a7a84cdb3ce3313d4113383474849dd6',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '607aa011d27398766618939fff59e6a5c7802fed',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': 'f60c9047cc03a3222e3900cc0ef80dffac3571b7',
 'tactical-ops-src/version.ts': 'a652b7adc7707af494e64d4e3ea3f7763ef5120d',
 'tools/verify_tactical_signal_atlas_premium.mjs': 'de669670c22d5161c017f0bd72832d4023fb89f8',
});
// Signal Atlas entry correction: make real skill ranks the first view after #303.
// Exact UI/test/bundle leaves are pinned independently from the prior premium release.
const signalAtlasEntryBase = '6cb0a0d5599986a03ba27acf58aa966b7ba0e407';
const approvedSignalAtlasEntryBlobs = Object.freeze({
 'js/boot_loaders.js': '1af002d47cf76cbd06aa5ec8264f207cd75aeb10',
 'js/tactical_ops.js': 'daf85ab357c3e2539a2494c7d12ee69652387afe',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '56cf08da56320f52210fded85db5223dc683dcb4',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': '2a9e446506b78fd56f74ca15b3076b9e8e53fe13',
 'tactical-ops-src/version.ts': 'de242d8684f3150b59eb325b757b19f24d2ad6fb',
 'tools/verify_tactical_signal_atlas_p3_browser.mjs': 'e046a1cf2cd83412e1c11041a871f503b42e6dfe',
 'tools/verify_tactical_signal_atlas_premium.mjs': '6442b2f679e9477fe4dc294cc61ac097260b776f',
 'tools/verify_tactical_signal_atlas_v2.mjs': '183d44f586e93b3c6620b18ff75d1dcaa7778e53',
});
// Signal Atlas concepts 02/03 (PR #305): reviewed visual source and one
// canonical 3.6.76 production rebuild. Prior M2/Premium/Entry pins stay frozen.
const signalAtlasFidelityBase = 'b30ad79db0ae30fd86cd6823078287150bba0246';
const approvedSignalAtlasFidelityBlobs = Object.freeze({
 'js/boot_loaders.js': 'c8fe99057bf8c93af2ac3e1f43067ec32835d305',
 'js/tactical_ops.js': '05c42733b46dd1b3fa5c50c2be565312437576c3',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': 'c23f7a760eedcb4865bfc3763630424ff04f1137',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': 'bb9909a0f37adcbf6ae413f55d875577445b03c1',
 'tactical-ops-src/version.ts': '15eda88276fa838fe4af824622a0668e5cc5e3cb',
 'tools/verify_tactical_signal_atlas_p3_browser.mjs': 'e4cf01b1a6bb43975bf323cbb42dba0055cb6931',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': 'e2e96a699313205576adc424c6481a9da88c6fba',
 'tools/verify_tactical_signal_atlas_premium.mjs': '6487f6b0466173a2252adf81a481a0df9f3e6e5c',
});
// Alpha Skill Tree V1 is scoped to the Atlas, its delivery files and its QA.
// Historical checks resolve against their original bases; the release checks
// below pin the exact working bytes that replace the #305 presentation.
const alphaSkillTreeBase = '0373ccaf3849d4c46e8c3a09670dd5207822337b';
const alphaSkillTreeBlobs = Object.freeze({
 'index.html': '4a41400500ab7824b38ab8f3529036fa79d3a521',
 'js/boot_loaders.js': '0d50933245968926d5798c5a6e29f5f77566c433',
 'js/tactical_ops.js': '691f3d6978f3e9e93cb52ef1f8e328dce3d6602c',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '338403029d01984c12ba2914cc763272dfed7b87',
 'tactical-ops-src/ui/signalAtlas/model.ts': 'bf766e60bbe9178a3b1efbf6c853502b58a64507',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': '19a0be0c7dbcb2d27c64d503f86cfde359f45290',
 'tactical-ops-src/version.ts': 'c8f9bd4358e010b8b362ef774f057ee3845c4dd6',
 'tools/verify_tactical_g1_browser.mjs': 'f76573b0d73d696b5aa193f70b140680969c8691',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': 'bc7e9a8e7644c2a12c8d0891eceb01bbf883787a',
 'tools/verify_tactical_signal_atlas_p3_browser.mjs': '8ab99fdbc86f24179fc8a041aa2912fa92423a4b',
 'tools/verify_tactical_signal_atlas_premium.mjs': '5c315c9b5c3efc2c32e8519f3b322b1929b19ba1',
 'tools/verify_tactical_signal_atlas_v2.mjs': '8fdfce6c92d4f4828773b8250aa527f415759aab',
});
// Art Kit follow-up to draft #306. Keep the original P0 release pinned and
// verify the exact presentation, WebP, QA and delivery changes independently.
const alphaArtKitBase = 'a91dfc99ebb1e55366db9164b684c87ad5de4c07';
const alphaArtKitBlobs = Object.freeze({
 'index.html': '7a61dc40381b37b4e084781af219fda12831e1c3',
 'js/boot_loaders.js': '1b019103cce684437f8332a76187534813dd14c8',
 'js/tactical_ops.js': '6d00c5f5568035124ea7c876d833b9721714eff6',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '96eb6ad834db5542def58f449ef236818c538f10',
 'tactical-ops-src/ui/signalAtlas/signalAtlasAssets.ts': '4676fface71e8a2e1e3027e245e74e60aaa8b7f5',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': 'cd1e729d14e150af6e5b4a7d3bcbbe08d7b65529',
 'tactical-ops-src/version.ts': '26a8d0b9967d4d332ad39362e0a912ded304659a',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': 'efb09995110249fc08b71ae14c4a66be9d8e370f',
 'tools/verify_tactical_signal_atlas_p3.mjs': '3abd9b9e488c9f68643caf53e53d45f241dbccbd',
 'tools/verify_tactical_signal_atlas_p3_browser.mjs': '187a89403281ffae0b46b3c0b82e518ba64e90b3',
 'images/tactical_ops/signal_atlas/v1/premium/atlas_alpha_portrait_closeup_v1.webp': 'e2cca9c00846a71b59a2e5d90b91976a6b8dc5d1',
 'images/tactical_ops/signal_atlas/v1/premium/atlas_alpha_portrait_full_v1.webp': '350d3f8d5deccab4c8510a6eeceffa52f7f9abd4',
 'images/tactical_ops/signal_atlas/v1/premium/atlas_environment_v1.webp': '4083dbf40d62148886cb2edad718fb68c81a8af5',
 'images/tactical_ops/signal_atlas/v1/premium/atlas_path_fang_v1.webp': '78140b7d043805f1eb262a37d65d4041d5873ffe',
 'images/tactical_ops/signal_atlas/v1/premium/atlas_path_howl_v1.webp': '04ebf70169f9e2a5b3c2dcebdbac98f033b9924e',
 'images/tactical_ops/signal_atlas/v1/premium/atlas_path_instinct_v1.webp': '48c95a7e75b3f454607612d57cdfc5dd4e17e04b',
 'images/tactical_ops/signal_atlas/v1/premium/manifest.json': '6979dc4fe849668b2e3c076ed63ed65d59d7c3a8',
});
// Signal Atlas immersive V1.1 (#307): exact reviewed full-screen presentation,
// accessibility, compiled delivery, and focused regression checks. Do not widen
// the historical Art Kit allowlist beyond these explicitly pinned files.
const alphaImmersiveV11Blobs = Object.freeze({
 'js/boot_loaders.js': 'c7fc6b8c70f293a2789d6cd851770499227aae4e',
 'js/tactical_ops.js': 'a9cf1a72ec429997e3796022880da404e0c973bf',
 'tactical-ops-src/ui/App.tsx': '7e4c7cb1e57c5c44f95701bc5e3a321935c1ff60',
 'tactical-ops-src/ui/Skillbook.tsx': 'b08f17af290a8b66ec184276c6a4c81286d5ddf0',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '62c1334c2ab347be4e7e2418a9a44b3b0f14fad2',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': '5b85bbc7e0444cd39eb5f66c6cc4662a3a544ced',
 'tactical-ops-src/version.ts': '18276688e7a9c73ce298fc2887a35218a09b5bd1',
 'tools/verify_tactical_command_deck.mjs': 'ed85de854014baf71cb8e7a5c7c477e385875547',
 'tools/verify_tactical_ops_action_icons.mjs': '8cba122bc7d54cd50d49d4d533138853494dfb66',
 'tools/verify_tactical_signal_atlas_assets_p2.mjs': '9de93fc7f9b941b5bedf5a3d6d3f95446b160025',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': '4267ebe5973fe78aea52c7712de6686f6734cf8b',
 'tools/verify_tactical_signal_atlas_v2.mjs': 'e11785caaeed331a9ff9a2c22f1de96c86805d64',
 'tools/verify_tactical_vnext_skillbook_integration.mjs': '0b824c5040ccf20a7720b8c6b5c65215f5e80577',
});
// Telegram physical-device follow-up: five exact frontend/cache/test changes.
// The V1.1 source pins above still describe the already merged #307 baseline.
const alphaTelegramSafeBlobs = Object.freeze({
 'js/boot_loaders.js': '39c07352c2777de3708424b0b1856d8e5e58e37c',
 'js/tactical_ops.js': '46b1e4f1d20c1fd81e471d32154d188d92361b6e',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': '4880596e02b168e172d8b31f7594601b69b7b92a',
 'tactical-ops-src/version.ts': '2a2c6bbed17508a9100fb65aaf89af2a12da364e',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': '3161a74f6410a1abc68ef2170b3ea4eb77db35d9',
});
// Last Howl 44px HUD clipping fix: exact changed paths, including the rebuilt
// bundle and an end-to-end abandon interaction regression on touch layouts.
const alphaLastHowlHudBlobs = Object.freeze({
 '.github/workflows/tactical-premium-integration.yml': 'd0f23dba358600f4f60b10baf71aab4fedbf4711',
 'js/boot_loaders.js': '544edd048bb870b38af2745a202f0a3c327cc5b3',
 'js/tactical_ops.js': '3dd15ccf150247965f768cfa14c6997342bd5791',
 'tactical-ops-src/ui/Battle.tsx': '92f3e36561655251c3aaf3c5203754cd6798b184',
 'tactical-ops-src/ui/LastHowl.tsx': '72d4b8b543ce1b11ebde2b5b9c294af71169be69',
 'tactical-ops-src/ui/lastHowl.css': '1ce83f2b33693b8d2178256e573f8376bdf188e5',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '2de5527bd6c2f39be81585c808aeb36714a851fc',
 'tactical-ops-src/version.ts': '77003a02dd6dbfe6b92d8198fa661ccf821b8a9d',
 'tools/verify_tactical_last_howl_browser.mjs': '13e4cabd466bef00bf4566d3c6f33e531ac8de59',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': '9753bdaf60f3ea328a7ee8404a2335b4b6ebe592',
});
// Review Upgrade modal layer regression, including real topmost hit-testing
// on 320/390/430px. Keep merged HUD and previous Art Kit pins immutable.
const alphaAtlasModalBlobs = Object.freeze({
 'js/boot_loaders.js': 'cb2d07ef6e7812b58ef79bfec632a662fed733c6',
 'js/tactical_ops.js': 'd2b8b72ceef267976ed30dae4a5f1b5bd0eecf46',
 'tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css': '57b681a9b048756874345d57ab34224ec91415e1',
 'tactical-ops-src/version.ts': 'a91405e666570265516fc4d8e6a82703db61795b',
 'tools/verify_tactical_signal_atlas_p3_browser.mjs': '350f5c8c23e7c0ff0a849a31132724ba94545aa7',
});
// COMMAND V2: full-size operational art, mobile decision hierarchy and
// 320/390/430px touch evidence. All previously merged provenance pins remain.
const alphaCommandDeckV2Blobs = Object.freeze({
 '.github/workflows/tactical-premium-integration.yml': '0ebbc2df79bb282f0b852a936c9a9a7a5795d11d',
 'js/boot_loaders.js': '4fab53d3471f36df707a83663dec22efae50f92b',
 'js/tactical_ops.js': '269c1aef215d724158b6e80d910c603e480c0713',
 'tactical-ops-src/ui/App.tsx': '328ad8c6a3589333025780620c9c524d28702c1c',
 'tactical-ops-src/ui/LastHowl.tsx': 'ebeeb4c4730e0dd7d8f8638213b1b1d38cb8dd97',
 'tactical-ops-src/ui/commandDeck.css': '35314e37c360f0801f0cf9e04158cb99589921be',
 'tactical-ops-src/version.ts': '7daa9fdfa33ca8d5289c6c61c83b7eb884fb3b90',
 'tools/verify_tactical_last_howl_browser.mjs': 'e1a276990748774a0ef4d8500552dced2a67e9cf',
});
const bloodScentBase = "5818ea1bcc45f6f36e32ac937bf9589d560211bb";
const bloodScentBlobs = Object.freeze({
 'tools/verify_tactical_last_howl_browser.mjs': '811b1868f5b03de7ad38d02fd9cfecb30873edb0',
 '.github/workflows/tactical-purpose-return.yml': 'f7e1f65d30b2b0b379515983742ee52f54a71087',
 '.github/workflows/tactical-premium-integration.yml': '25d71fef492259ae205b8083eb2f33edb37a7e2f',
 'js/boot_loaders.js': 'b1c1ca423a4823040115f9ab58317a6c0cb6c2bc',
 'js/tactical_ops.js': '5d5379f33271558e5752864b9509028ed1f0a2fd',
 'tactical-ops-src/combat/skills.ts': '9d3aa498f691b8362d33dfee1b668027445b8d93',
 'tactical-ops-src/combat/types.ts': 'd6f10bb2cb5bf364612bed80d049251b9aa795b1',
 'tactical-ops-src/data/playerGrowth.ts': '1f6287816484fa042baf5c1479d7a76d8e207c10',
 'tactical-ops-src/host/foundationProgression.ts': 'c86f3176d88cff1e951d23625d85ccfccdbec530',
 'tactical-ops-src/store/battleStore.ts': 'abbb8c602e8c2dabb7c5d04f5a1786317d3ad04a',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '05f31fa6c321a850e20831e68d8fd2d3b656ab8d',
 'tactical-ops-src/version.ts': '6236716547124cc1be01e6d21b0632217125b075',
 'tools/build_tactical_m2_workers.mjs': '968d29432c9c56a4201e97de718c7f08f774cb95',
 'tools/verify_tactical_blood_scent.mjs': 'eba46f2c6f18c68dac67beefa28888f53fdf6be0',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': '5bc51898815d07d525529fdfc29fd69a17efb3fb',
});
const packLinkBlobs = Object.freeze({
 '.github/workflows/tactical-premium-integration.yml': '77312228a2b8194538fd319d6b6b8c588ac04277',
 'docs/TACTICAL_PACK_LINK.md': 'c7f193d4eaedcdd7713935941121094b4410af6a',
 'js/boot_loaders.js': '512caadf0aaad1e4edb6475442be504aaf0f31b9',
 'js/tactical_ops.js': 'af6ec819c2001ec993b2d2f2e435f9b85e949b25',
 'tactical-ops-src/combat/skills.ts': '0376e24f9ddecf0769bdb3ed37ee92217a076b32',
 'tactical-ops-src/combat/types.ts': 'aa6cccdd7764fd90372a4aecd80cd933328926e3',
 'tactical-ops-src/data/playerGrowth.ts': '01ae35d805e743bb6d6806022fc2abc93af0a0b4',
 'tactical-ops-src/host/foundationProgression.ts': 'db4cefd6bea9890b79dcc9322c1d8cd778755b0c',
 'tactical-ops-src/store/battleStore.ts': '033b56ed6e412b2f623072b98cf96545bee0288b',
 'tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx': '9ab9b9322b07f93217416f8df1c0b362a7b6c8d0',
 'tactical-ops-src/version.ts': '42f39a5938af05012ed2b9191607e522bc7678bf',
 'tools/build_tactical_m2_workers.mjs': 'c6109671e2b207bd6b5d4b06fd3e4bdab245e723',
 'tools/verify_tactical_last_howl_browser.mjs': 'd9bc32a4dd6c423bdbed91751441c8f9ef614b9d',
 'tools/verify_tactical_pack_link.mjs': 'de07c9c0894ee54cbe39df38e337435a7eb5fc89',
 'tools/verify_tactical_signal_atlas_default_browser.mjs': '32dd8175334abccad5f74597801a8a14b27be629',
});
const counterstrikeBlobs = Object.freeze({
 '.github/workflows/tactical-counterstrike.yml': 'd794d805e5ad5579303296efb36f7c909e172535',
 'docs/TACTICAL_COUNTERSTRIKE.md': 'b950f20088ad46bc82cdf4633fcb42600cb2a1fb',
 'js/boot_loaders.js': '8100017b8f6adb5c864cfce8c9653e7fd8e1cb43',
 'js/tactical_ops.js': '416e821560c5886bec739d7f11585b694b40eec4',
 'tactical-ops-src/combat/counterstrikeAuthority.ts': '05ad8009a0350c1be178a8decdf8c158ae4e9e82',
 'tactical-ops-src/combat/recoverAuthority.ts': '0eb34ff153180bd5bdab83367ecbe09c1aee4e54',
 'tactical-ops-src/data/counterstrike.ts': 'cec27d7bf8326481bde6741af62eae8bfc503cb6',
 'tactical-ops-src/data/operations.ts': '18b88d5881ec4b1fb360bd8c6feadcd4ee5bb748',
 'tactical-ops-src/data/packMastery.ts': '3a7c6bc938f2d6802e13130b85103d3900a7423f',
 'tactical-ops-src/host/foundationProgression.ts': 'ddc2392618518c513727f7ff226c23c72060b9a5',
 'tactical-ops-src/store/battleStore.ts': '9ab22cfc3bf39cd6dcab3a3db7d87e53ee4faece',
 'tactical-ops-src/ui/App.tsx': 'b6038994cf6018096cd38636655e16b556627fce',
 'tactical-ops-src/ui/Battle.tsx': 'c8c51edf4591085d9ccfda598b55835167ea4c29',
 'tactical-ops-src/ui/Counterstrike.tsx': '81b1adbf88106edbb4ded92e5f21d0f82f643938',
 'tactical-ops-src/ui/signalAtlas/model.ts': 'cc4d37df270179b79de2131203afc0ac0ec5115b',
 'tactical-ops-src/version.ts': '990fa95de9b0e17c76cbdaf78a58c8a679e1e356',
 'tools/build_tactical_counterstrike.mjs': 'c96959922c693466f2fd8b7dbe588bf5cb1cc633',
 'tools/counterstrike_browser_fixture.mjs': '68586d375c4058ceeb1c947dd3563fe804420d6b',
 'tools/tactical_counterstrike_engine_v1.ts': 'd515b2fabbb448099b307e9feb7967c25f63775d',
 'tools/verify_tactical_counterstrike.mjs': '2ea10e05f07c346ba13e305c1ac7727544932f4e',
 'tools/verify_tactical_counterstrike_browser.mjs': '1fd9f322f89ccf1808c7ffb685a00282682bfd54',
 'tools/verify_tactical_counterstrike_workers.mjs': '9f32b3423836421e6adb28eb1ebea6727f898c9b',
});
// Counterstrike Story Lite V1 (#315): exact reviewed presentation-only delta.
// Preserve the historical Counterstrike source pins above unchanged. Any
// further edits to these files require a new review and fresh blob approval.
const counterstrikeStoryLiteBlobs = Object.freeze({
 '.github/workflows/tactical-counterstrike.yml': 'a1a7efb1ef9b6a47595e6f8a50ca8ecbdf1d5ce5',
 'docs/TACTICAL_COUNTERSTRIKE_STORY_LITE_V1.md': '3dfe5b38ab02e35564ccc8a7c85ab563662ac71c',
 'images/tactical_ops/presentation/false_relay_mission_keyart_v1.webp': '51a2c1a60593787af1e994e5f9c7c187ca59083c',
 'js/boot_loaders.js': 'b6cdb7408946b38bed28793029950d4b510b41cd',
 'js/tactical_ops.js': '7742f0b9609862cd3d699e43c7dc773bd991994e',
 'tactical-ops-src/styles.ts': '128365051d8e3fb02ffd350e1aa482b0514c94cf',
 'tactical-ops-src/ui/Counterstrike.tsx': 'fe73e4214675ce5cbfeb2a3d0f9d055a8b9cb535',
 'tactical-ops-src/ui/CounterstrikeStory.tsx': '2e02cba8ce252b04815537419751754934897ea6',
 'tactical-ops-src/ui/counterstrikeStory.css': '5bdcfd46406eb675709401b69a2257fe753564db',
 'tactical-ops-src/ui/counterstrikeStoryModel.ts': '6996f148d4e3b626a1bcb7d8d3955e7a22f4a537',
 'tactical-ops-src/version.ts': '39f82c3f7fe543cdc23c0c4c19fe6f20287ca76a',
 'tools/verify_tactical_counterstrike_browser.mjs': 'c1f62789b1e80880bd6a55af1d870c3b90bfdcc1',
 'tools/verify_tactical_counterstrike_story_lite.mjs': 'f86533c88267580d13d9eb15584252c9e8255d7d',
});
// Story Lite activation + compact Telegram viewport correction. Review these
// exact source blobs separately; historical Counterstrike/Story pins stay intact.
const counterstrikeStoryActivationBlobs = Object.freeze({
 'docs/TACTICAL_COUNTERSTRIKE_STORY_LITE_V1.md': '406c99628cd5f134322904dd38fce8513b0dd77f',
 'js/boot_loaders.js': '86bb1e9215c9704478ee6a8b0e8c05d205271ab4',
 'js/tactical_ops.js': '4cdc3856b886199a19b9df65eea389c7382ded52',
 'tactical-ops-src/ui/Counterstrike.tsx': '94819fd249c4138afa824203ea6d1f509db79728',
 'tactical-ops-src/ui/counterstrikeStory.css': '7832c66d3f5b244c5b57d24e2b35952ad72aea2a',
 'tactical-ops-src/version.ts': '92227111e3cc215394d1a061952a480db10b7567',
 'tools/verify_tactical_counterstrike_browser.mjs': 'cda76357945f5b8c28dc96112ee05e0fb371433d',
 'tools/verify_tactical_counterstrike_story_lite.mjs': '80bddf998b49c30ca0422f7f87969a73365db540',
});
// False Relay Briefing V2: compact player decision and optional full Intel.
// No combat, progression or server authority sources are part of this delta.
const counterstrikeBriefV2Blobs = Object.freeze({
 'docs/TACTICAL_COUNTERSTRIKE_STORY_LITE_V1.md': 'edd92c333f5aa4cad414ad57123037e1f6817957',
 'js/boot_loaders.js': 'e05be73cfd92ab08d0234cf0f949a80affdd0bfc',
 'js/tactical_ops.js': 'b8a29d1e8c93448c80fd4354b62a067bfc668ef1',
 'tactical-ops-src/ui/Counterstrike.tsx': 'df6b0d3ba3704ddd67849e77c051fdab6d804448',
 'tactical-ops-src/ui/counterstrikeStory.css': '1458898b08d758287b384efb4cb9655d0b007b8a',
 'tactical-ops-src/version.ts': 'c739cd6ca1c27772e473ef1fa81424db6ac591bd',
 'tools/verify_tactical_counterstrike_browser.mjs': '19319b3094304b692ba8319e470733e4b5296374',
 'tools/verify_tactical_counterstrike_story_lite.mjs': 'b50c05c08cab54d3ff7a0c8a23ac7027d73a7b93',
});
const carrierJamBlobs = Object.freeze({
 '.github/workflows/tactical-premium-integration.yml': 'cc20f067af613e8778940dc56414352657141c25',
 'js/boot_loaders.js': 'fc9b5c3e28acc39912539eb82c92d4e5d11ce90c',
 'js/tactical_ops.js': '7d880527e925bd60ba0845e48018167e1d3cbc6a',
 'tactical-ops-src/combat/battle.ts': '689451cffec7a3f03a8658499e7b7412c9b2edd6',
 'tactical-ops-src/combat/missionRules.ts': 'cc07009c65e3fb5152982a63d253af6936c1e83b',
 'tactical-ops-src/combat/recoverAuthority.ts': 'd12a72a93ed771f6a3734dd8953a997a37a1b577',
 'tactical-ops-src/combat/types.ts': '50496d46ab66ab2c0b3ea8de654dfa6b271cfa6d',
 'tactical-ops-src/data/fieldOps.ts': '98531b6f265cbcd17af91eb28fac5a8d6340e209',
 'tactical-ops-src/data/operations.ts': 'c2159cbf71cc6bf6ade759a312f99b3d8d052d4b',
 'tactical-ops-src/host/foundationProgression.ts': '2744806b2e928c0880f6e5e92c39441a94a80e4c',
 'tactical-ops-src/store/battleStore.ts': '77711f8b5f1ae270b26c5e21ce31f5150f45e524',
 'tactical-ops-src/ui/App.tsx': '0f120f8dfabfebe3c3a34ec90a9df84bfa1c0f34',
 'tactical-ops-src/ui/Battle.tsx': '6f958e9cece6b829a2bfb9fb66aefacfbba6f7e1',
 'tactical-ops-src/ui/missionPurpose.ts': '1664aab6fe0f9aa1657593eb12b3d0ea30aafbe1',
 'tactical-ops-src/version.ts': 'e1c578b68aa8ab5fec70dc17e850d9d39c92e4c9',
 'tools/build_tactical_m2_workers.mjs': '9dc126e606b8244d1c88403cf519361362cadf42',
 'tools/verify_tactical_carrier_jam.mjs': '1767b7df821fd568332f6d50f18f7c6da062a150',
 'tools/verify_tactical_player_voice_v1.mjs': '5615d349d2f8a5cc2b620122ff93cce88e7549da',
});
// Operation 01 Results Truth: exact reviewed Git blob identities, never a wildcard.
const reviewedStoryResultsBlobs = Object.freeze({
  ".github/workflows/tactical-story-results-truth.yml": "c850d5c06065664bce9ba5f7b37b930f1fb80d72",
  "js/boot_loaders.js": "3cc58834930cb4998c140c677463d35cc64ddf7c",
  "js/tactical_ops.js": "a99392d4878d3f795272f327bc0b3c674df1df1a",
  "package.json": "6867a505997a3a4065c65c3aafe5b261a97f6893",
  "tactical-ops-src/data/operations.ts": "f4246ad23fa9bc359463159145d8f885dfddaa68",
  "tactical-ops-src/store/battleStore.ts": "cfeed36c2a6b35673d55d80d6f5fbc695ea16a39",
  "tactical-ops-src/styles.ts": "bc5098a49a42e4437b682028e1f337950a9520e9",
  "tactical-ops-src/ui/App.tsx": "1cfb86a086213cfcab0153e3297f6c4c8c732111",
  "tactical-ops-src/ui/storyResult.css": "f81c001e6916a61df6ca972016a7c3e489a135a5",
  "tactical-ops-src/ui/storyResultTruth.ts": "e125b2c2c0f837de30d92ec5aa7997c90c5339ad",
  "tactical-ops-src/ui/StoryResultView.tsx": "9f1ddf6216fec944427bc99d72c69e272ef4dbe8",
  "tactical-ops-src/version.ts": "d52c079a91c7da7ebc3b051ecfb1e1471ac4dc94",
  "tools/verify_tactical_story_results_transactions.mjs": "1ac052e87e61f61a40a372e2e4c523482ff10f5c",
  "tools/verify_tactical_story_results_visual.mjs": "acefd76aa16f2c06889cad0a0b059559e93886b0",
});
const counterstrikeHistoricalPaths = new Set(["js/boot_loaders.js", "js/tactical_ops.js", "tactical-ops-src/combat/recoverAuthority.ts", "tactical-ops-src/data/operations.ts", "tactical-ops-src/data/packMastery.ts", "tactical-ops-src/host/foundationProgression.ts", "tactical-ops-src/store/battleStore.ts", "tactical-ops-src/ui/App.tsx", "tactical-ops-src/ui/Battle.tsx", "tactical-ops-src/ui/signalAtlas/model.ts", "tactical-ops-src/version.ts"]);
const currentAlphaSkillTreeBlobs = { ...alphaSkillTreeBlobs, ...alphaArtKitBlobs, ...alphaImmersiveV11Blobs, ...alphaTelegramSafeBlobs, ...alphaLastHowlHudBlobs, ...alphaAtlasModalBlobs, ...alphaCommandDeckV2Blobs, ...bloodScentBlobs, ...packLinkBlobs, ...counterstrikeBlobs, ...counterstrikeStoryLiteBlobs, ...counterstrikeStoryActivationBlobs, ...counterstrikeBriefV2Blobs, ...carrierJamBlobs, ...reviewedStoryResultsBlobs };
const alphaSkillTreePath = path => Object.hasOwn(currentAlphaSkillTreeBlobs, path);
git('merge-base', '--is-ancestor', alphaArtKitBase, 'HEAD');
for (const [path, expected] of Object.entries(alphaSkillTreeBlobs)) {
 assert.equal(git('rev-parse', `${alphaArtKitBase}:${path}`).trim(), expected, 'unreviewed pre-kit Alpha Skill Tree source: ' + path);
}
for (const path of git('diff', '--name-only', '--no-renames', alphaArtKitBase).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || Object.hasOwn(alphaArtKitBlobs, path) || Object.hasOwn(alphaImmersiveV11Blobs, path) || Object.hasOwn(alphaTelegramSafeBlobs, path) || Object.hasOwn(alphaLastHowlHudBlobs, path) || Object.hasOwn(alphaAtlasModalBlobs, path) || Object.hasOwn(alphaCommandDeckV2Blobs, path) || Object.hasOwn(bloodScentBlobs, path) || Object.hasOwn(packLinkBlobs, path) || Object.hasOwn(counterstrikeBlobs, path) || Object.hasOwn(counterstrikeStoryLiteBlobs, path) || Object.hasOwn(counterstrikeStoryActivationBlobs, path) || Object.hasOwn(counterstrikeBriefV2Blobs, path) || Object.hasOwn(carrierJamBlobs, path) || Object.hasOwn(reviewedStoryResultsBlobs, path), 'unreviewed Alpha Art Kit path: ' + path);
}
// types.ts has mixed line endings in Git. The platform clean filter changes its blob.
const workingBlob = path => path === 'tactical-ops-src/combat/types.ts'
 ? git('hash-object', '--no-filters', path).trim()
 : git('-c', 'core.safecrlf=false', 'hash-object', '--path='+path, path).trim();
git('merge-base', '--is-ancestor', alphaSkillTreeBase, 'HEAD');
for (const path of git('diff', '--name-only', '--no-renames', alphaSkillTreeBase).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || alphaSkillTreePath(path), 'unreviewed Alpha Skill Tree path: ' + path);
}
for (const [path, expected] of Object.entries(currentAlphaSkillTreeBlobs)) {
 assert.equal(workingBlob(path), expected, 'unreviewed working Alpha Skill Tree source: ' + path);
}
git('merge-base', '--is-ancestor', m2Base, 'HEAD');
git('merge-base', '--is-ancestor', signalAtlasPremiumBase, 'HEAD');
git('merge-base', '--is-ancestor', signalAtlasEntryBase, 'HEAD');
git('merge-base', '--is-ancestor', signalAtlasFidelityBase, 'HEAD');
for (const path of git('diff', '--name-only', '--no-renames', m2Base).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || alphaSkillTreePath(path) || Object.hasOwn(approvedM2Blobs, path) || Object.hasOwn(approvedSignalAtlasPremiumBlobs, path) || Object.hasOwn(approvedSignalAtlasEntryBlobs, path) || Object.hasOwn(approvedSignalAtlasFidelityBlobs, path), 'unreviewed M2 descendant path: ' + path);
}
for (const [path, expected] of Object.entries(approvedM2Blobs)) {
 const baseline = Object.hasOwn(approvedSignalAtlasPremiumBlobs, path) ? signalAtlasPremiumBase : Object.hasOwn(approvedSignalAtlasFidelityBlobs, path) ? signalAtlasFidelityBase : alphaSkillTreePath(path) ? alphaSkillTreeBase : 'HEAD';
 assert.equal(git('rev-parse', `${baseline}:${path}`).trim(), expected, 'unreviewed historical M2 source: ' + path);
 const current = currentAlphaSkillTreeBlobs[path] ?? approvedSignalAtlasFidelityBlobs[path] ?? approvedSignalAtlasEntryBlobs[path] ?? approvedSignalAtlasPremiumBlobs[path] ?? expected;
 assert.equal(git('-c', 'core.safecrlf=false', 'hash-object', `--path=${path}`, path).trim(), current, 'unreviewed working M2 descendant: ' + path);
}
for (const path of git('diff', '--name-only', '--no-renames', signalAtlasPremiumBase).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || alphaSkillTreePath(path) || Object.hasOwn(approvedSignalAtlasPremiumBlobs, path) || Object.hasOwn(approvedSignalAtlasEntryBlobs, path) || Object.hasOwn(approvedSignalAtlasFidelityBlobs, path), 'unreviewed Signal Atlas Premium path: ' + path);
}
for (const [path, expected] of Object.entries(approvedSignalAtlasPremiumBlobs)) {
 const baseline = Object.hasOwn(approvedSignalAtlasEntryBlobs, path) ? signalAtlasEntryBase : alphaSkillTreePath(path) ? alphaSkillTreeBase : 'HEAD';
 assert.equal(git('rev-parse', `${baseline}:${path}`).trim(), expected, 'unreviewed historical Signal Atlas Premium source: ' + path);
 assert.equal(git('-c', 'core.safecrlf=false', 'hash-object', `--path=${path}`, path).trim(), currentAlphaSkillTreeBlobs[path] ?? approvedSignalAtlasFidelityBlobs[path] ?? approvedSignalAtlasEntryBlobs[path] ?? expected, 'unreviewed working Signal Atlas Premium source: ' + path);
}
for (const path of git('diff', '--name-only', '--no-renames', signalAtlasEntryBase).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || alphaSkillTreePath(path) || Object.hasOwn(approvedSignalAtlasEntryBlobs, path) || Object.hasOwn(approvedSignalAtlasFidelityBlobs, path), 'unreviewed Signal Atlas Entry path: ' + path);
}
for (const [path, expected] of Object.entries(approvedSignalAtlasEntryBlobs)) {
 const historicRef = Object.hasOwn(approvedSignalAtlasFidelityBlobs, path) ? signalAtlasFidelityBase : alphaSkillTreePath(path) ? alphaSkillTreeBase : 'HEAD';
 assert.equal(git('rev-parse', `${historicRef}:${path}`).trim(), expected, 'unreviewed committed Signal Atlas Entry source: ' + path);
 assert.equal(git('-c', 'core.safecrlf=false', 'hash-object', `--path=${path}`, path).trim(), currentAlphaSkillTreeBlobs[path] ?? approvedSignalAtlasFidelityBlobs[path] ?? expected, 'unreviewed working Signal Atlas Entry source: ' + path);
}
for (const path of git('diff', '--name-only', '--no-renames', signalAtlasFidelityBase).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || alphaSkillTreePath(path) || Object.hasOwn(approvedSignalAtlasFidelityBlobs, path), 'unreviewed Signal Atlas Fidelity path: ' + path);
}
for (const [path, sha] of Object.entries(approvedSignalAtlasFidelityBlobs)) {
 const previous = approvedSignalAtlasEntryBlobs[path] ?? approvedSignalAtlasPremiumBlobs[path] ?? approvedM2Blobs[path];
 assert(previous, 'Fidelity path has no historically approved predecessor: ' + path);
 assert.equal(git('rev-parse', `${signalAtlasFidelityBase}:${path}`).trim(), previous, 'unreviewed historical Fidelity source: ' + path);
 assert.equal(git('rev-parse', `${alphaSkillTreeBase}:${path}`).trim(), sha, 'unreviewed committed Fidelity source: ' + path);
 assert.equal(git('-c', 'core.safecrlf=false', 'hash-object', `--path=${path}`, path).trim(), currentAlphaSkillTreeBlobs[path] ?? sha, 'unreviewed working Fidelity source: ' + path);
}
for (const [path, expected] of Object.entries(approvedSkillMasteryMotionV1Blobs)) {
 assert.equal(git('rev-parse', `${masteryEffectBase}:${path}`).trim(), expected, 'unreviewed Skill & Mastery Motion V1 source: ' + path);
}
for (const path of git('diff','--name-only','--no-renames',masteryEffectBase,m2Base).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || Object.hasOwn(approvedMasteryEffectBlobs, path), 'unreviewed Mastery Effect path: ' + path);
}
// Enemy Combat Identity Art Kit V1: exact binary asset approvals. New poses are
// additive and do not replace any of the original four-direction hound sprites.
const approvedEnemyPoseAssets = Object.freeze({
 'images/tactical_ops/hounds/motion/skirmisher_lunge.webp': 'ed5f71bc0ecaf70293347fda90707b27ef043e96',
 'images/tactical_ops/hounds/motion/bulwark_heavy_impact.webp': '3b54719371ce3689557227fe1dfa37ef0571de4e',
 'images/tactical_ops/hounds/motion/marksman_firing.webp': '6041353ed173b0aa41b9d1a20a90d21e88032cef',
});
for (const [path, expected] of Object.entries(approvedEnemyPoseAssets)) {
 assert(existsSync(path), 'missing reviewed enemy pose asset: ' + path);
 assert.equal(git('rev-parse', `HEAD:${path}`).trim(), expected, 'unreviewed committed enemy pose: ' + path);
 assert.equal(git('hash-object', path).trim(), expected, 'unreviewed working enemy pose: ' + path);
}
for (const [path, expected] of Object.entries(lastHowlBlobs)) {
 assert.equal(git('rev-parse', `${lastHowlV1Release}:${path}`).trim(), expected, 'unreviewed V1 source: ' + path);
}
for (const [path, expected] of Object.entries({ ...lastHowlBlobs, ...lastHowlPressureBlobs, ...approvedCombatMotionBlobs, ...approvedEnemyMotionV1Blobs, ...approvedSkillMasteryMotionV1Blobs, ...approvedMasteryEffectBlobs })) {
 if (retiredV1WorkerSources.has(path)) {
  assert(!existsSync(path), 'V1 worker must be built from the V1 release: ' + path);
  continue;
 }
 // New reviewed blobs pin Git bytes exactly; the historical V1 pins retain
 // their original LF-normalization policy (notably tactical.css is CRLF).
 const rawSource = Object.hasOwn(approvedM2Blobs, path) ? git('show', `${m2Base}:${path}`) :
  Object.hasOwn(approvedSignalAtlasPremiumBlobs, path) ? git('show', `${signalAtlasPremiumBase}:${path}`) :
  alphaSkillTreePath(path) ? git('show', `${alphaSkillTreeBase}:${path}`) : readLocalFile(path, 'utf8');
 const source = Object.hasOwn(approvedCombatMotionBlobs, path) || Object.hasOwn(approvedEnemyMotionV1Blobs, path) ||
  Object.hasOwn(approvedSkillMasteryMotionV1Blobs, path) || Object.hasOwn(approvedMasteryEffectBlobs, path) ? rawSource : rawSource.replaceAll('\r\n', '\n');
 assert.equal(sourceBlob(source), expected, 'unreviewed Last Howl source: ' + path);
}
for (const path of git('diff','--name-only','--no-renames',lastHowlBase,m2Base).trim().split('\n').filter(Boolean)) {
 assert(path === provenanceVerifier || Object.hasOwn(lastHowlBlobs, path) ||
  Object.hasOwn(lastHowlPressureBlobs, path) || Object.hasOwn(approvedCombatMotionBlobs, path) ||
  Object.hasOwn(approvedEnemyMotionV1Blobs, path) ||
  Object.hasOwn(approvedSkillMasteryMotionV1Blobs, path) ||
  Object.hasOwn(approvedMasteryEffectBlobs, path) ||
  Object.hasOwn(approvedEnemyPoseAssets, path), 'unreviewed Last Howl path: ' + path);
}
function readFileSync(path, encoding) {
 const baseline = Object.hasOwn(lastHowlBlobs, path) ? lastHowlBase : Object.hasOwn(approvedM2Blobs, path) ? m2Base :
  Object.hasOwn(approvedSignalAtlasPremiumBlobs, path) ? signalAtlasPremiumBase :
  Object.hasOwn(bloodScentBlobs, path) ? bloodScentBase :
  Object.hasOwn(packLinkBlobs, path) ? "9f0d2a34" :
  counterstrikeHistoricalPaths.has(path) ? "3b2eb7c8" :
  Object.hasOwn(carrierJamBlobs, path) ? "393cd70f" : null;
 if (!baseline) return readLocalFile(path, encoding);
 const historical = git('show', `${baseline}:${path}`);
 return encoding ? historical : Buffer.from(historical);
}
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

// Forge Item Preview V1 (PR #282): six exact reviewed authored blobs.
// Historical pins above/below remain intact; this layer accepts no future arbitrary source.
const approvedForgePreviewBlobs=Object.freeze({
  "js/forge.js": "60573b1839ac9924b602373eb62da4c14f7aff04",
  "tactical-ops-src/host/bridge.ts": "23dabb3cebedf72d045388f24dfdfb5a94e9b159",
  "tactical-ops-src/ui/FieldOpResults.tsx": "18292cf657fd094d4fde7ccd29f4ca42fb2c8504",
  "tactical-ops-src/ui/fieldOpResults.css": "bb682aa122cd9cbd59d37af63e96b4a88b2110af",
  "tactical-ops-src/version.ts": "3b3833059e764617d20c0f04a10b8764c52eff1c",
  "tools/verify_field_op_results_premium.mjs": "fdabfd097f9dbe406c82a52002032304196fc7ff",
});
// PR #283 Field Legacy Reward Reveal: independently reviewed exact source blobs.
// Preserve earlier PR approvals; newer authored sources supersede them only at HEAD.
const approvedFieldLegacyV1Blobs=Object.freeze({
  "tactical-ops-src/data/fieldLegacy.ts": "a2a3cd25b8df5c5dc4938476bb6aabcfcf02a3b7",
  "tactical-ops-src/host/foundationProgression.ts": "b851c3cf089062f8c4fd3d46909e54760730a266",
  "tactical-ops-src/store/battleStore.ts": "af467b68677f9d55d1345887b1c0edc051adacdf",
  "tactical-ops-src/ui/App.tsx": "a46a8781bd4c7660cc0b05b5f33fc622aeaed691",
  "tactical-ops-src/ui/FieldOpResults.tsx": "8556e8a66a2911f2b07a49bbd11939ce8016e6fd",
  "tactical-ops-src/ui/fieldOpResults.css": "1c2242a4579a9b4f8f35485b42618338da2d45e2",
  "tactical-ops-src/version.ts": "adad270d7bd82e5af1a1f7677e691d5d8725bbc0",
});
// Foundation Character Bridge V1 (#271): exact reviewed additions on top of
// Field Legacy #283 and Gear Impact #279. Historical pins above remain intact.
const approvedFoundationBridgeV1Blobs=Object.freeze({
  "tactical-ops-src/combat/combatProfileV3.ts": "19abaf438e8b1fed04058648f69929ab288ad1a8",
  "tactical-ops-src/host/foundationProgression.ts": "a46fbfe6c6220dcd7373b75bfafaf287c7c5989a",
  "tactical-ops-src/store/battleStore.ts": "6616b1ff185f395041f3cb4d357239e3a0c17c27",
  "tools/verify_tactical_foundation_character_bridge.mjs": "9a474c9c6e49e647b7f9c6e2036fdcf4315f0812",
});
// #284 Real Player Stats release delivery: reviewed cache-only change.
// Historical Field Legacy / Foundation approvals above remain immutable.
const approvedRealPlayerStatsDeliveryBlobs=Object.freeze({
  "tactical-ops-src/version.ts": "f69c4af0dc7f77700344a5b6b9bee637ab1a17df",
  "js/boot_loaders.js": "78d29da1d84acd78a7d79ab813b757936d836fa8",
  "index.html": "5a02871874cd2ffa690cd6cd424f16ae2c9d25f2",
});
// #277 Forge -> Field Test: exact Forge behavior and versioned script URL.
const approvedForgeFieldTestV1Blobs=Object.freeze({
  "js/forge.js": "e8528a4110b204fb1f1cbbad54d05ecbd7ad7963",
  "index.html": "0df23e7c67087ce40b58d5105dc0d07a0388069f",
  "tools/verify_forge_field_test_v1.mjs": "30e0282c9e62750b812e9f0dc6730d10f1dc0444",
});
// #278 Reward Loop P2: approved merged delivery after #277.
const approvedMaterialRouteV1Blobs=Object.freeze({
  "tactical-ops-src/host/bootstrap.ts": "cf8a62411b284e2949b1d966d76be916f414c24d",
  "tactical-ops-src/host/bridge.ts": "bc4eb09d3c1734545a4c63bc69d9d324830feaeb",
  "tactical-ops-src/ui/FieldOpResults.tsx": "7def2a86aa93c532a30961122af552903af36136",
  "tactical-ops-src/version.ts": "0c9ecbed60cbdd4ad113748bea38961cfa044474",
  "js/boot_loaders.js": "aba13c7924f9d169728517eeec9170cb2baaa0d6",
  "js/tactical_ops.js": "3ec759b6d194bdd14360951d1901e65c11c66693",
  "tools/verify_reward_loop_p2_material_route.mjs": "852b6830c24c9637b97db489248a40306369247f",
  "index.html": "b5ebc0e9624a9a5cc75b331b6c40be039d9f17c4",
});
// First Upgrade Supply release.
const approvedFirstUpgradeSupplyBlobs=Object.freeze({
  "tactical-ops-src/host/foundationProgression.ts": "feea1bc059cb3f9dc2a1623d60a14299e5e3b8c9",
  "tactical-ops-src/data/fieldOps.ts": "1cd39e6334876425bfdf94ca6cb663ee766869ef",
  "tactical-ops-src/ui/returnPurpose.ts": "1e14c7fad29a3d0a63c39a36145f423b4ee61d73",
  "tactical-ops-src/ui/battleDecision.ts": "b6fd94046ada1f234125ce401be003123289ae2b",
  "tactical-ops-src/ui/FieldOpResults.tsx": "8a314914a49ee19290268254534ee3486929004d",
  "tactical-ops-src/store/battleStore.ts": "e1cbc1f790a7f821e128500505fbece7e1c0d6e4",
  "tactical-ops-src/version.ts": "cba92e7acf2c84fdff6e29b1826763430221e4ee",
  "js/boot_loaders.js": "fe40f4dcf438e7533feae9d6ef81cefff6f1e8a3",
  "js/tactical_ops.js": "a037c65e04b22aa0411c7d78bca51fdfebb92102",
  "tools/verify_reward_loop_p2_material_route.mjs": "ab07e5e27bfca41b9763bc97318d31dc1a0b51ef",
  "tools/verify_field_op_results_premium.mjs": "b76fd002ff736192791a2539b73f89e57ddb67b0",
  "index.html": "cb692b6d5f5d92902d68f52a6439f8bbe3ef3cbe"
});
// Tactical Power V1: accepted-run V3 presentation only. Historical approvals stay immutable.
const approvedTacticalPowerV1Blobs=Object.freeze({
  "tactical-ops-src/ui/App.tsx": "bec086c9f85b117bd2c7d5a8cd83b7521f923f88",
  "tactical-ops-src/ui/Battle.tsx": "7d61d2a1b517a0decd1a3a93be92b0fc6f5f350a",
  "tactical-ops-src/ui/runCombatPower.ts": "dc70622457e6ea6f946d81959e397193e8997c14",
  "tactical-ops-src/tactical.css": "e934c4f3db1e3bbd422957ce9831a9d884fccc9a",
  "tactical-ops-src/version.ts": "df7f1581f569cf500aee61ca69bfc75220ba6ab6",
  "js/boot_loaders.js": "212c2f726c2ac7485d777e4b203bc55f29910168",
  "js/tactical_ops.js": "5287952fdb81f69e5ef713899e98d0f870b0a31c",
  "index.html": "38596b3fc0ea55393511c261d6b07612a0a44fdc",
  "tools/verify_tactical_confirmed_power_v1.mjs": "3497c11581acff0ad4ed5dd546507283c1879f49",
  ".github/workflows/tactical-confirmed-power-v1.yml": "f11a13dcb30dc915e2ff76705f979ad98ba7ac74"
});
// Forge Upgrade Impact V1: one-shot confirmation after accepted server upgrade and fresh Forge state.
// No gameplay/reward/economy authority granted to the client; historical pins remain intact.
const approvedForgeUpgradeImpactV1Blobs=Object.freeze({
  "js/forge.js": "189b182a483b25a369eb132d3d364c0761357248",
  "index.html": "b1c8669b88231d1b8eeeea9da5ddfc0b0d4c3997",
  "tools/verify_forge_upgrade_impact_v1.mjs": "e4afd243fdc596ed08e8807f2f38accdd994169e",
  ".github/workflows/forge-upgrade-impact-v1.yml": "04bb3b95813c215e8cd468cef56a12bcce78b1fd"
});
// Hub concentric core: scoped visual alignment of the stationary artwork to
// the existing rotating mechanical ring. No navigation or game-state changes.
const approvedHubConcentricCoreV1Blobs=Object.freeze({
  "css/hub_premium.css": "ff7a951a01fd69ae4e149025f16834e8923ffb7a",
  "index.html": "6f1cf6ae8fc8c6f7d9317a9183198983e26ffe8c",
  "tools/verify_hub_concentric_core_v1.mjs": "1d9c29c6a5f79ac813f2a3d0db85ce61d984bef9",
  ".github/workflows/hub-concentric-core-v1.yml": "207eb6e3c0a40f371d099133062115a54ea40a42"
});
// Alpha soft-cap V1: newly reviewed parser, compiled client and Telegram cache key.
// Preserve historical approvals and require exact current blobs.
const approvedAlphaSoftCapV1Blobs=Object.freeze({
  "tactical-ops-src/combat/combatProfileV3.ts": "31f0235672f6399d88491b340dd4480a1027425d",
  "tactical-ops-src/version.ts": "62cf3c6138ee2dbe4082c0c57153eb802e9585b4",
  "js/boot_loaders.js": "681a9a6678828461350cfeacf067c4381a7ccb8d",
  "js/tactical_ops.js": "832b6aa6a6333065bd8e69604b074ef343fb29cb",
  "index.html": "490c5defb4092e4fbd93151f48de98d5e414443f", // unchanged main baseline
  "js/home_nav.js": "c2c6a9516c229af06ff3113b9b241c2440331f2b" // existing tactical_ops navigation case
});
// Veteran Relay Pressure: exact encounter, revision transport and release assets.
const approvedVeteranRelayPressureBlobs=Object.freeze({
  "tactical-ops-src/data/relayPressure.ts": "9731f06b18c8f1f68d7bee106b75de655626b23b",
  "tactical-ops-src/data/signalTrials.ts": "5a4c20e40a243593776b8e33ec5c2b30c703ea67",
  "tactical-ops-src/host/foundationProgression.ts": "5bb583c806511ae1c7810d3f7c19927555379e02",
  "tactical-ops-src/store/battleStore.ts": "f7135aae2bb239dd8d3c076478e26562dcdcdb15",
  "tactical-ops-src/ui/App.tsx": "1f8879364955fd61d11b8342d360b852fa465891",
  "tactical-ops-src/ui/Battle.tsx": "e5554c8d133828798149b4eb4c8bb88b7faf6c91",
  "tactical-ops-src/version.ts": "3d41014a33265af2db84c24144d60b738c61caa4",
  "js/boot_loaders.js": "81702c36d5846994f67e2f60260d8fe29c74102d",
  "js/tactical_ops.js": "65d85c1727e5d37c393ef1e40cd099070f4f36e6",
  "index.html": "70b03bd17002b5899ce34eea8946fa3d1c7ccbd5"
});
// #291 Alpha progression ranges: exact approved parser, bundle and release cache.
// The historical soft-cap pins above remain unchanged for prior revisions.
const approvedCombatProgressionV1Blobs=Object.freeze({
  "tactical-ops-src/combat/combatProfileV3.ts": "aa2b8488fe0e0c282222cbd14b0a4c2f692a0987",
  "tactical-ops-src/version.ts": "44dc97dc5969b880bd34b17f6f4a8618de19aa08",
  "js/boot_loaders.js": "5926f4f41740468ff4cdc09a93ed12db6fdb1016",
  "js/tactical_ops.js": "8f039c78cf7019aad472a81fdb936d4aea8ca8cc",
  "index.html": "254d63877bd445c87c4d0a11eafd1609c99fce09",
});
// Both changes shipped together. Historical PR pins above remain immutable.
const approvedVeteranProgressionCombinedBlobs=Object.freeze({
  "tactical-ops-src/version.ts": "f9e5633b2d4f3b7f0e84d67d6570ba0828ad7e90",
  "js/boot_loaders.js": "57c8c69fbe6bfc1cff305716bafbfe75bd8ede43",
  "js/tactical_ops.js": "2cb78c2e5ea79dcbacad4129f7d414ef6601abd6",
  "index.html": "052e0f13609fbf0be51a08d979b68f5278bf6932",
});
// Defeated-unit interaction fix: preserve the fading sprite while removing its
// invisible hitbox. Pin only the reviewed source, shipped runtime and regression.
const approvedDefeatedTileHitboxBlobs=Object.freeze({
  "tactical-ops-src/ui/Battle.tsx": "c1cad1daa986aa501a63fc4b392435ab3679f670",
  "tactical-ops-src/version.ts": "36771448252ee296f48d068f6b98a15be7dcef53",
  "js/boot_loaders.js": "ddcb7fb5355b7a5d8ecc89fbc9d059b5d480c07c",
  "js/tactical_ops.js": "7d830ed7e5cc4c5d8e2612883c5d3ef392285c4c",
  "index.html": "5101ba7e7b0d99d659110bdf34fc193f9b0b2816",
  "tools/verify_tactical_defeated_tile_hitbox.mjs": "bc2cf45bb968257a4e867e7dd342a5c904a84a48",
});
// The #293 mainline fix landed after the Last Howl branch diverged. Verify its
// approved source at the merged main commit, then pin the combined HEAD above.
const defeatedTileMain = '4ca501bd0d191a9d8fec0632446a5e3b7a00e61c';
for (const [path, expected] of Object.entries(approvedDefeatedTileHitboxBlobs)) {
 assert.equal(sourceBlob(git('show', `${defeatedTileMain}:${path}`)), expected,
  'unreviewed defeated-tile mainline source: ' + path);
}
const approvedCurrentBlobs=Object.freeze({
  ...approvedForgePreviewBlobs,
  ...approvedFieldLegacyV1Blobs,
  ...approvedFoundationBridgeV1Blobs,
  ...approvedRealPlayerStatsDeliveryBlobs,
  ...approvedForgeFieldTestV1Blobs,
  ...approvedMaterialRouteV1Blobs,
  ...approvedFirstUpgradeSupplyBlobs,
  ...approvedTacticalPowerV1Blobs,
  ...approvedForgeUpgradeImpactV1Blobs,
  ...approvedHubConcentricCoreV1Blobs,
  ...approvedAlphaSoftCapV1Blobs,
  ...approvedCombatProgressionV1Blobs,
  ...approvedVeteranRelayPressureBlobs,
  ...approvedVeteranProgressionCombinedBlobs,
  // Only live render-only leaves: historical Last Howl reads are intentionally
  // substituted by readFileSync() and must retain their original approvals.
  ...Object.fromEntries(Object.entries(approvedCombatMotionBlobs).filter(([path]) => !Object.hasOwn(lastHowlBlobs,path))),
  ...Object.fromEntries(Object.entries(approvedEnemyMotionV1Blobs).filter(([path]) => !Object.hasOwn(lastHowlBlobs,path))),
  ...Object.fromEntries(Object.entries(approvedSkillMasteryMotionV1Blobs).filter(([path]) => !Object.hasOwn(lastHowlBlobs,path))),
  // The reviewed #301 CI workflow is also a historical Player Identity V2 leaf.
  // Override this single hash without changing older production approvals.
  '.github/workflows/tactical-cinematic-results.yml': approvedMasteryEffectBlobs['.github/workflows/tactical-cinematic-results.yml'],
  // Legacy audits read some files from frozen historical commits. Update only
  // the current-file subset; all new live leaves are pinned above.
  ...Object.fromEntries(Object.entries(alphaCommandDeckV2Blobs).filter(([path]) =>
    !Object.hasOwn(lastHowlBlobs, path) && !Object.hasOwn(approvedM2Blobs, path) &&
    !Object.hasOwn(approvedSignalAtlasPremiumBlobs, path))),
  ...reviewedStoryResultsBlobs,
});
for (const [path,expected] of Object.entries(approvedFieldLegacyV1Blobs)) {
 const source=readFileSync(path,'utf8');
 const current=approvedCurrentBlobs[path] ?? expected;
 assert.equal(sourceBlob(source),current,'unreviewed Field Legacy V1 source: '+path);
 assert.notEqual(sourceBlob(source+'\n/* unreviewed Field Legacy mutation */'),current,
  'Field Legacy V1 negative integrity guard: '+path);
}
for(const [path,sha] of Object.entries(approvedCurrentBlobs)){
 const content=readFileSync(path,'utf8');
 assert.equal(sourceBlob(content),sha,'unreviewed Forge Item Preview source: '+path);
 assert.notEqual(sourceBlob(content+'\n/* unreviewed Forge mutation */'),sha,'Forge preview negative integrity guard: '+path);
}

// Tactical Player Identity V2: exact approved source blobs, not wildcard permissions.
const approvedIdentityV2Blobs=Object.freeze({
  "tactical-ops-src/host/identity.ts": "796a09c2848f464dd436c9cdfe3d6244c2ae26e8",
  "tactical-ops-src/ui/PlayerIdentity.tsx": "d0b5ab68addb982ef81aadbc6d17319748443128",
  "tactical-ops-src/ui/App.tsx": "1cdfc24a7f978404b5336c594cc1378aab803c88",
  "tactical-ops-src/ui/Battle.tsx": "8114907414ae45975fa0a536f94710c1306a563b",
  "tactical-ops-src/ui/FieldOpResults.tsx": "088e4386839a45a65daa0aec55fe14579adcfb46",
  "tactical-ops-src/tactical.css": "2583b76c6ab93569edc39ec6d0dc832782c408c3",
  "tactical-ops-src/host/bootstrap.ts": "450551d5ba53d852afe3f0b691ee66e2354643e2",
  "tactical-ops-src/store/battleStore.ts": "2579ed6dc9f30b971b5fe8602723469410b19ac6",
  "index.html": "c19319a576ddb15a135bd3806bf426704ef87e99",
  "tactical-ops-src/version.ts": "c7a0e7832297089902d4353f468cce7489ad7d9c",
  "tools/verify_tactical_player_identity_v2.mjs": "f4daf0beede9ef3c2f0a129e7f919edf08b058da",
  ".github/workflows/tactical-player-identity-v2.yml": "fc9b06bdfc5f2988a5a46938e10c8439a45b35f8",
  ".github/workflows/tactical-cinematic-results.yml": "a30085c6340f42f6f3e73ab402f8987372ad2b50"
});
// War Table Visual Identity V2: exact new authored sources; historical Identity V2 pins remain frozen.
const approvedWarTableV2Blobs=Object.freeze({
  "tactical-ops-src/ui/App.tsx": "7fd6036dcacc1f5254f0b8e7ee006315d8c163b3",
  "tactical-ops-src/ui/commandDeck.css": "eb54bda248de3bf83e6be31a5828d70a865ea8ee",
  "tactical-ops-src/ui/operationArtwork.ts": "9d4b682fc9b5030d74e5b676f04eccb18ce3b970",
  "tactical-ops-src/version.ts": "471f1b7eedad889f4cb1719db405b30e0920da5c",
  "tools/verify_wartable_visual_v2.mjs": "c08b22662a8186546c9e3632095515453fd00d98",
  ".github/workflows/war-table-visual-v2.yml": "b5d2135c487d65b8ac57a1307165c27692e4c347"
});
for(const [path,sha] of Object.entries(approvedWarTableV2Blobs)) {
 const source=readFileSync(path,"utf8");
 assert.equal(sourceBlob(source),approvedCurrentBlobs[path] ?? sha,"unreviewed War Table Visual V2 source: "+path);
 assert.notEqual(sourceBlob(source+"\\n/* unreviewed War Table mutation */"),sha,
  "War Table Visual V2 negative integrity guard: "+path);
}
for(const [path,sha] of Object.entries(approvedIdentityV2Blobs)) {
 assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??sha,'unreviewed Player Identity V2 source: '+path);
 assert.notEqual(sourceBlob(readFileSync(path,'utf8')+'\n/* unreviewed Identity V2 mutation */'),sha,'Identity V2 negative integrity guard: '+path);
}
// Eight individually reviewed WebP blobs were committed to main before this PR.
// They must still match their exact approved Git object bytes; no directory wildcard.
const approvedWarTableAssetBlobs=Object.freeze({
  "images/tactical_ops/presentation/command_deck/operations/alpha_wartable_broken_signal_v1.webp": "3a7d093e769a217a902d2e7df6f7db03c63f0dd5",
  "images/tactical_ops/presentation/command_deck/operations/alpha_wartable_dead_relay_v1.webp": "e02988bf605b8ca1843967b06b0ae9924c5b2cfe",
  "images/tactical_ops/presentation/command_deck/operations/alpha_wartable_fracture_front_v1.webp": "a7db00d189f7572543e3ab6d53817d832668630f",
  "images/tactical_ops/presentation/command_deck/mission_emblems/alpha_emblem_recover_v1_256.webp": "71a51e1f6a3623fee60cce0000941b0f48204c62",
  "images/tactical_ops/presentation/command_deck/mission_emblems/alpha_emblem_hold_v1_256.webp": "89a4ce5767c10258f357616417de080c832a4a22",
  "images/tactical_ops/presentation/command_deck/mission_emblems/alpha_emblem_survive_v1_256.webp": "9a8c941eefaeb051e178ba9dfacf9ce321cf3450",
  "images/tactical_ops/presentation/command_deck/mission_emblems/alpha_emblem_intercept_v1_256.webp": "577aae06ded7771f9445e0d6fc9d306728f381a3",
  "images/tactical_ops/presentation/command_deck/mission_emblems/alpha_emblem_boss_v1_256.webp": "429f1cb1b0aafa74de3ba1a5cee8f0887324856f",
  "images/tactical_ops/presentation/command_deck/mission_emblems/gitkeep": "8b137891791fe96927ad78e64b0aad7bded08bdc",
  "images/tactical_ops/presentation/command_deck/operations/gitkeep": "8b137891791fe96927ad78e64b0aad7bded08bdc"
});
for(const [path,sha] of Object.entries(approvedWarTableAssetBlobs)){
 const bytes=readFileSync(path);
 assert.equal(sourceBlob(bytes),sha,"unreviewed War Table asset: "+path);
 assert.notEqual(sourceBlob(Buffer.concat([bytes,Buffer.from("unreviewed asset mutation")])),sha,
  "War Table asset negative integrity guard: "+path);
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
  ".github/workflows/tactical-purpose-return.yml": "4de15ba9ba3767475bca365c88e769a7d2f8d7f1",
  "tactical-ops-src/combat/battle.ts": "4a907b65beb6f4495a8cf93cb24e662269fd4cbf",
  "tactical-ops-src/combat/combatProfileV3.ts": "5cd344871e359c47ff36d8ef705a1da4e28e23f0",
  "tactical-ops-src/combat/gearImpactV31.ts": "70240860d651771971498e42d0d9188f79355cbe",
  "tactical-ops-src/combat/skills.ts": "f0d6792e7d585317aa1c15eae2029e9271f5a823",
  "tactical-ops-src/combat/types.ts": "bed007a67c533497127d8b87b8181a399ebff642",
  "tactical-ops-src/version.ts": "242266640d31bfac70afe8fcd036f7f7123082c0",
  "tools/verify_tactical_gear_v31.mjs": "c326575679f69a6a063ecc827de94cbd72bde16a"
});
for(const [p,sha] of Object.entries(approvedGearV31Blobs)){
 assert.equal(sourceBlob(readFileSync(p)), approvedCurrentBlobs[p] ?? approvedWarTableV2Blobs[p] ?? approvedIdentityV2Blobs[p] ??sha,'unreviewed Gear V3.1 source: '+p);
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
 assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??approvedGearV31Blobs[path] ?? expected,'unreviewed Victory V2 source: '+path);
 assert.notEqual(sourceBlob(readFileSync(path,'utf8')+'\n/* unreviewed V2 mutation */'),expected,
  'Victory V2 negative guard: '+path);
}
for(const changedPath of git('diff','--name-only','--no-renames',victoryV2Base,lastHowlBase,'--',
 '.github/workflows','index.html','package.json','js','tactical-ops-src','images/tactical_ops','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||(Object.hasOwn(approvedGearV31Blobs,changedPath)||Object.hasOwn(approvedCurrentBlobs,changedPath))||((Object.hasOwn(approvedWarTableV2Blobs,changedPath)||Object.hasOwn(approvedWarTableAssetBlobs,changedPath))||Object.hasOwn(approvedIdentityV2Blobs,changedPath))||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs','unreviewed Victory V2 path: '+changedPath);
}
git('merge-base','--is-ancestor',recoverAuthorityBase,'HEAD');
for(const changedPath of git('diff','--name-only','--no-renames',recoverAuthorityBase,lastHowlBase,'--',
 '.github/workflows','index.html','package.json','js','tactical-ops-src','images/tactical_ops','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(approvedRecoverAuthorityBlobs,changedPath)||Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||(Object.hasOwn(approvedGearV31Blobs,changedPath)||Object.hasOwn(approvedCurrentBlobs,changedPath))||((Object.hasOwn(approvedWarTableV2Blobs,changedPath)||Object.hasOwn(approvedWarTableAssetBlobs,changedPath))||Object.hasOwn(approvedIdentityV2Blobs,changedPath))||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs',
  'unreviewed RECOVER Authority path: '+changedPath);
}
for(const [path,expected] of Object.entries(approvedRecoverAuthorityBlobs))
 assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??approvedGearV31Blobs[path] ?? approvedVictoryV2Blobs[path] ?? expected,'unreviewed RECOVER Authority source: '+path);
git('merge-base','--is-ancestor',firstPlayableBridgeMerge,'HEAD');
for(const [path,expected] of Object.entries(approvedFirstPlayableBridgeBlobs)){
 assert.equal(git('rev-parse',`${firstPlayableBridgeMerge}:${path}`).trim(),expected,'unreviewed merged First Playable Bridge blob: '+path);
 assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??expected,'unreviewed First Playable Bridge source: '+path);
}
for(const changedPath of git('diff','--name-only','--no-renames',rewardExperienceBase,lastHowlBase,'--',
 '.github/workflows','index.html','js','tactical-ops-src','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(approvedRewardExperienceBlobs,changedPath)||Object.hasOwn(approvedRecoverAuthorityBlobs,changedPath)||Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||(Object.hasOwn(approvedGearV31Blobs,changedPath)||Object.hasOwn(approvedCurrentBlobs,changedPath))||((Object.hasOwn(approvedWarTableV2Blobs,changedPath)||Object.hasOwn(approvedWarTableAssetBlobs,changedPath))||Object.hasOwn(approvedIdentityV2Blobs,changedPath))||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs',
  'unreviewed Reward Experience path: '+changedPath);
}
for(const [path,expected] of Object.entries(approvedRewardExperienceBlobs)){
 assert.equal(git('rev-parse',`${recoverAuthorityBase}:${path}`).trim(),expected,'unreviewed merged Reward Experience blob: '+path);
 const liveExpected=approvedCurrentBlobs[path] ?? approvedGearV31Blobs[path] ?? approvedVictoryArtKitV1Blobs[path] ?? approvedVictoryV2Blobs[path] ?? approvedRecoverAuthorityBlobs[path] ?? expected;
 assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??liveExpected,'unreviewed Reward Experience source: '+path);
 // An unapproved edit must never match the exact reviewed Git blob.
 assert.notEqual(sourceBlob(readFileSync(path,'utf8')+'\n/* unreviewed provenance mutation */'),liveExpected,
  'Reward Experience negative integrity guard: '+path);
}
const nextDecisionHistoricSource=path=>git('show',`${nextDecisionBase}:${path}`);
git('merge-base','--is-ancestor',nextDecisionBase,'HEAD');
for(const changedPath of git('diff','--name-only','--no-renames',nextDecisionBase,lastHowlBase,'--',
  '.github/workflows','index.html','js','tactical-ops-src','tools').trim().split('\n').filter(Boolean)){
 assert(Object.hasOwn(nextDecisionApproved,changedPath)||Object.hasOwn(approvedSignalTrialsBlobs,changedPath)||Object.hasOwn(approvedBrowserEntryMainBlobs,changedPath)||Object.hasOwn(approvedFirstPlayableBridgeBlobs,changedPath)||Object.hasOwn(approvedRewardExperienceBlobs,changedPath)||Object.hasOwn(approvedRecoverAuthorityBlobs,changedPath)||Object.hasOwn(approvedVictoryV2Blobs,changedPath)||Object.hasOwn(approvedVictoryArtKitV1Blobs,changedPath)||(Object.hasOwn(approvedGearV31Blobs,changedPath)||Object.hasOwn(approvedCurrentBlobs,changedPath))||((Object.hasOwn(approvedWarTableV2Blobs,changedPath)||Object.hasOwn(approvedWarTableAssetBlobs,changedPath))||Object.hasOwn(approvedIdentityV2Blobs,changedPath))||generated.has(changedPath)||
  changedPath==='tools/verify_tactical_premium_integration.mjs',
  'unreviewed Next Decision path: '+changedPath);
}
for(const [path,sha] of Object.entries(approvedBrowserEntryMainBlobs)){
 // #273 changes only index.html's loader revision; its old main blob is
 // still frozen at the exact First Playable Bridge merge baseline.
 if(path==='index.html'){
  assert.equal(git('rev-parse',`${rewardExperienceBase}:${path}`).trim(),sha,
   'unreviewed Browser Public Entry historical index blob');
  assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??approvedVictoryArtKitV1Blobs[path],
   'unreviewed Victory Art Kit index blob');
 }else{
  assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??sha,'unreviewed Browser Public Entry main blob: '+path);
 }
}
for(const [path,sha] of Object.entries(approvedSignalTrialsBlobs)){
 assert.equal(git('rev-parse',`${signalTrialsMerge}:${path}`).trim(),sha,'unreviewed merged Signal Trials blob: '+path);
 assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??approvedGearV31Blobs[path] ?? approvedRecoverAuthorityBlobs[path] ?? sha,'unreviewed Signal Trials source: '+path);
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
 // HOUND's reviewed historical merge stays pinned above; only the action-pose
 // mapper is extended in Enemy Combat Motion V1.
 const expected = path === 'tactical-ops-src/ui/houndDirectional.ts'
  ? approvedEnemyMotionV1Blobs[path] : approvedHoundBlobs[path];
 assert.equal(sourceBlob(source),expected,`unreviewed HOUND source: ${path}`);
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
 if(path==='tools/verify_tactical_g1_browser.mjs'){
  // M1 updates only this fixture's truthful cost/proof assertions. Keep both
  // historical phases pinned and require the exact reviewed new test blob.
  const historicSha = head===heads[0]
   ? '06659241dbcac1dea536f546d54fe51eac019c14'
   : 'd46a9c8b59958af921303269b2776cc44ffc9e5d';
  assert.equal(git('rev-parse',`${head}:${path}`).trim(),historicSha,'unreviewed historical G1 browser');
  assert.equal(git('rev-parse', `${alphaSkillTreeBase}:${path}`).trim(),approvedMasteryEffectBlobs[path],'unreviewed M1 G1 browser at #305');
  assert.equal(sourceBlob(source),currentAlphaSkillTreeBlobs[path],'unreviewed Alpha Skill Tree G1 browser');
  preserved++;continue;
 }
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
 assert(((Object.hasOwn(approvedWarTableV2Blobs,path)||Object.hasOwn(approvedWarTableAssetBlobs,path))||Object.hasOwn(approvedIdentityV2Blobs,path))||generated.has(path)||Object.hasOwn(actorFacingBlobs,path),'unreviewed runtime mutation after visual alignment: '+path);
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
 assert(((Object.hasOwn(approvedWarTableV2Blobs,path)||Object.hasOwn(approvedWarTableAssetBlobs,path))||Object.hasOwn(approvedIdentityV2Blobs,path))||generated.has(path)||Object.hasOwn(combatExperienceBlobs,path),'unreviewed runtime mutation after combat experience base: '+path);
}
const courierTraceLeaves=new Set([app,'tactical-ops-src/ui/s3AfterAction.ts']);
const courierTraceHead='53dcf529ba3a7a3c0299bbf97a4fa903e36a8768';
const finalPlayerBase='a19311fdcb91c69c66779f6f9e50536e17ad4fb5';
git('merge-base','--is-ancestor',courierTraceHead,finalPlayerBase);
git('merge-base','--is-ancestor',finalPlayerBase,'HEAD');
for(const path of git('diff','--name-only','--no-renames',courierTraceBase,courierTraceHead,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(((Object.hasOwn(approvedWarTableV2Blobs,path)||Object.hasOwn(approvedWarTableAssetBlobs,path))||Object.hasOwn(approvedIdentityV2Blobs,path))||generated.has(path)||courierTraceLeaves.has(path),'unreviewed runtime mutation in Courier Trace: '+path);
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
 assert(((Object.hasOwn(approvedWarTableV2Blobs,path)||Object.hasOwn(approvedWarTableAssetBlobs,path))||Object.hasOwn(approvedIdentityV2Blobs,path))||generated.has(path)||Object.hasOwn(loadoutBlobs,path)||path===cooldownRules,'unreviewed runtime mutation in Loadout V1: '+path);
}
assert.equal(git('show',`${loadoutHead}:${cooldownRules}`).replace('unit: Pick<CombatUnit, "team">','unit: CombatUnit'),
 git('show',`${loadoutBase}:${cooldownRules}`),'Loadout may only narrow the cooldown helper input type');
for(const path of git('diff','--name-only','--no-renames',finalPlayerBase,loadoutBase,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(((Object.hasOwn(approvedWarTableV2Blobs,path)||Object.hasOwn(approvedWarTableAssetBlobs,path))||Object.hasOwn(approvedIdentityV2Blobs,path))||generated.has(path)||Object.hasOwn(finalPlayerBlobs,path),'unreviewed runtime mutation in V1 player presentation: '+path);
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
 assert.equal(sourceBlob(readFileSync(path)), approvedCurrentBlobs[path] ?? approvedWarTableV2Blobs[path] ?? approvedIdentityV2Blobs[path] ??approvedBrowserEntryMainBlobs[path] ?? expected,'unreviewed browser sync or FTUE source: '+path);
}
for(const path of git('diff','--name-only','--no-renames',loadoutHead,lastHowlBase,'--','index.html','js','tactical-ops-src','images/tactical_ops').trim().split('\n').filter(Boolean)){
 assert(((Object.hasOwn(approvedWarTableV2Blobs,path)||Object.hasOwn(approvedWarTableAssetBlobs,path))||Object.hasOwn(approvedIdentityV2Blobs,path))||generated.has(path)||Object.hasOwn(nextDecisionApproved,path)||Object.hasOwn(approvedSignalTrialsBlobs,path)||Object.hasOwn(approvedBrowserEntryMainBlobs,path)||Object.hasOwn(approvedFirstPlayableBridgeBlobs,path)||Object.hasOwn(approvedRewardExperienceBlobs,path)||Object.hasOwn(approvedRecoverAuthorityBlobs,path)||Object.hasOwn(fieldContractBlobs,path)||Object.hasOwn(browserExitApproved,path)||Object.hasOwn(surviveTensionBlobs,path)||Object.hasOwn(serviceRecordBlobs,path)||Object.hasOwn(reviewedBrowserMain,path)||Object.hasOwn(approvedVictoryV2Blobs,path)||Object.hasOwn(approvedVictoryArtKitV1Blobs,path)||(Object.hasOwn(approvedGearV31Blobs,path)||Object.hasOwn(approvedCurrentBlobs,path)),'unreviewed runtime mutation in Field Contracts V1: '+path);
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
 ...Object.keys(reviewedStoryResultsBlobs),
]);
for(const path of git('diff','--name-only','--no-renames',mergedBaseline,overheadMerge,'--','index.html','js','tactical-ops-src').trim().split('\n').filter(Boolean)){
 assert(rcContractPaths.has(path),`unreviewed production change since merged baseline: ${path}`);
}

// Victory Art Kit V1: exact local assets, no wildcard permissions.
for (const [assetPath,approvedSha] of Object.entries(approvedVictoryArtKitV1Blobs)) {
  assert.equal(sourceBlob(readFileSync(assetPath)),approvedCurrentBlobs[assetPath] ?? approvedWarTableV2Blobs[assetPath] ?? approvedIdentityV2Blobs[assetPath] ?? approvedSha,
    'unreviewed Victory Art Kit V1 asset: '+assetPath);
}
assert(readFileSync('index.html','utf8').includes(
  '<link rel="stylesheet" href="/css/tactical_victory_art_v1.css?v=v1-20261111">'),
  'Victory Art Kit stylesheet must be loaded');

const version=readLocalFile('tactical-ops-src/version.ts','utf8');
const bundle=readLocalFile('js/tactical_ops.js','utf8'),loader=readLocalFile('js/boot_loaders.js','utf8');
assert(bundle.includes(version.match(/VERSION = "([^"]+)"/)[1]));
assert(loader.includes(version.match(/CACHE_KEY = "([^"]+)"/)[1]));
assert(readLocalFile('index.html','utf8').includes("WEBAPP_VER + '-alpha-skill-tree-art-v1'"), 'stale boot loader URL');
for(const feature of ['WIN CONDITION · RECOVER THE SIGNAL','TACTICAL THREATS','NO ADDITIONAL RANK CONFIRMED BY THIS RECEIPT.','t-field-results','RECORDING FAILED','RECORDED THIS RUN','New option unlocked'])assert(bundle.toLowerCase().includes(feature.toLowerCase()),`missing compiled feature: ${feature}`);
assert(readFileSync('js/pet_quick_actions.js','utf8').includes('body:has(#tacticalOpsRoot[data-open="1"]) #petQuickActions'));
execFileSync(process.execPath,['--test','tools/verify_tactical_defeated_tile_hitbox.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['tools/verify_tactical_mastery_effect_truth.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['tools/verify_tactical_skill_mastery_motion_v1.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['tools/verify_tactical_m2_wide_lunge.mjs'],{stdio:'inherit'});
console.log(`PASS integration provenance: ${preserved} unchanged source/test files, exact App union, no unrelated runtime changes, both feature sets and coherent version/cache in production`);
