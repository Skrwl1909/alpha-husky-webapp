/** Exact RC build portability: reproduce authored Windows raw-CSS strings in
 * memory. Working-tree files, original RC, workers and runtime contracts stay
 * untouched. Every input is pinned; unknown inputs fail closed.
 */
import {readFileSync} from 'node:fs';
import {relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const PROFILE={
  "tactical-ops-src/tactical.css": {
    "sha256": "661ab4d0c5261686bf2e2c143ced37e9107ee2fb55c8771db016dcf497a939b6",
    "eol": "PRESERVE"
  },
  "tactical-ops-src/ui/signalAtlas/signalAtlas.css": {
    "sha256": "689f80b5de0bee0b78c002461f103c98c215caeebb3d43d31d6741f9f206abf5",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css": {
    "sha256": "9161e3c90dad9b8706eb6d41141f49c4b5ee99cd2cb5c882f9884a435e2ac9e0",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/combatCohesion.css": {
    "sha256": "ab31e3b9d813c2ef939fdd4fe46023cef862ddc4840549cfc73781a4b03a75fe",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/tacticalCampaignOrders.css": {
    "sha256": "5275ceffbd9d2a61aa4d3812bf32538670d1fa8c43ccfe451dad9520b9f03175",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/campaignChapter.css": {
    "sha256": "441465fc7492b15576f3040c46bd5cd7dbdad157484e1c6ce7d55b3dc183c8c1",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/missionClarity.css": {
    "sha256": "2d5515b036ac231929db898dbc320c3f1a56885bebbc9d26c370018c64e07abb",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/realDevicePremium.css": {
    "sha256": "75ab84057ba8f9971cfc9f05e05139628537c5c8932b5d34b24593ec45402986",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/fieldOpResults.css": {
    "sha256": "cb3dc138047a7fd562b7b7fca98dddc7a5c32271e4eb040886a9a91d9e7c578b",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/commandDeck.css": {
    "sha256": "6a764fbf580bf95012915a347d28a4acd237e0383dff8a46e56fe3d71c2985f9",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/overheadProjection.css": {
    "sha256": "7abf745bb01b636382cc310a93db89fcaecacbe4fdcde10acf440b18dc08402c",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/houndDirectional.css": {
    "sha256": "5b722e4dc2d1204bd8bde92deb15cbb784ac78831934d0265f40714a5aa6ed06",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/lastHowl.css": {
    "sha256": "bed1bc6f4d2066609997305d2bd76a6d591268855160fe9d090b285c8f81e58d",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/counterstrikeStory.css": {
    "sha256": "5b416118e74a88d77e9e3b8ed2429ebf9d7621c3512b1b3076d7c6c17378da0e",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/storyResult.css": {
    "sha256": "84410068fdfaba9e9e480d3d1caf84abe165740df542ba119c854705b9170813",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/tacticalLootHonors.css": {
    "sha256": "a1945896ec4b2ffabb3f34d8c7fcc94e5c46b93b171ce4f2522c387c991d48a1",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/battlefieldClarityP2.css": {
    "sha256": "28259d6610ddbc64d30b0e4f359c7894e06b642a564b1118f10ed4d0fee9ee67",
    "eol": "CRLF"
  },
  "tactical-ops-src/ui/warTableVisual.css": {
    "sha256": "62c7854211d33ac2c7c3211cc51bae72da1b74f4c7b678936a30414f37024deb",
    "eol": "LF"
  }
};
export function finalRcCssPlugin(root){
 return {name:'alpha-final-rc-exact-raw-css',enforce:'pre',load(id){
  if(!id.endsWith('.css?raw'))return null;
  const absolute=id.slice(0,-4),path=relative(root,absolute).replaceAll('\\','/');
  const row=PROFILE[path];if(!row)throw Error('STOP: unreviewed raw CSS input '+path);
  const raw=readFileSync(resolve(root,path));
  const canonical=row.eol!=='PRESERVE'?Buffer.from(raw.toString('utf8').replaceAll('\r\n','\n')):raw;
  if(sha(canonical)!==row.sha256)throw Error('STOP: changed raw CSS input '+path);
  const exported=row.eol==='CRLF'?canonical.toString('utf8').replaceAll('\n','\r\n'):canonical.toString('utf8');
  return {code:'export default '+JSON.stringify(exported)+';',map:null};
 }};
}
export function verifyFinalRcRuntime(root){
 for(const [path,hash] of Object.entries({
  'js/tactical_ops.js':'7b22a997dd2d23f9665d93c6340e9e3771158012df5da90b3f46085d6847fdde',
  'js/boot_loaders.js':'fbe843f5fb333fa72f524b9c81ffeb07e5267b966b1f151321f123b2ee7e2dd9'
 }))if(sha(readFileSync(resolve(root,path)))!==hash)throw Error('STOP: runtime differs from protected FINAL '+path);
}
