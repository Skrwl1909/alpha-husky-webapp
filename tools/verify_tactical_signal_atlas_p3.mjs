/** Art integration and presentation safety gates; canonical model gates live in V2 suite. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8');
const assets=read('tactical-ops-src/ui/signalAtlas/signalAtlasAssets.ts');
const ui=read('tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx');
const css=read('tactical-ops-src/ui/signalAtlas/signalAtlas.css');
assert(!assets.includes('Candidate'),'No unresolved asset roles');
for(const [,suffix] of assets.matchAll(/ROOT \+ "([^"]+)"/g))assert(existsSync('images/tactical_ops/signal_atlas/v1'+suffix),suffix);
for(const key of ['sectorBackground','sectorFrame','nodeFrame','inspectorFrame','contact'])assert(css.includes(`var(--tsa-${key})`),key+' visibly integrated');
const premiumDir='images/tactical_ops/signal_atlas/v1/premium/';
const premium=JSON.parse(read(premiumDir+'manifest.json')).assets;
const expected=new Set([...assets.matchAll(/ROOT \+ "\/premium\/([^"]+)"/g)].map(([,file])=>file));
assert.deepEqual(new Set(premium.map(({file})=>file)),expected,'all six assigned Art Kit files are covered by the manifest');
assert.equal(premium.length,6);
for (const asset of premium) {
 const bytes=readFileSync(premiumDir+asset.file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF',asset.file);
 assert.equal(bytes.toString('ascii',8,12),'WEBP',asset.file);
 assert.equal(bytes.length,asset.size_bytes,asset.file);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);
}
assert(ui.includes('SIGNAL_ATLAS_ASSETS.coreBezel'));
assert(ui.includes('Object.entries(SIGNAL_ATLAS_ASSETS)'),'Asset mapping reaches live CSS');
for(const guard of ['current.progression.revision>captured.revision','saved?.ranks[captured.skillId]','!current.progressionError','await respec(','await upgrade('])assert(ui.includes(guard),guard);
assert(ui.includes('createPortal(') && ui.includes('inert={Boolean(confirm)}') && ui.includes('event.key==="Escape"') && ui.includes('event.key!=="Tab"'),'Dialog escapes host clipping, traps focus, disables background');
assert(css.includes('100dvh') && css.includes('--tg-content-safe-area-inset-bottom') && css.includes('overflow-y:auto'),'Reachable dialog safe-area controls');
assert(ui.includes('SAVED RANK') && ui.includes('tsa-node-status') && ui.includes('Choose live sector'),'Ownership, color-independent states, direct sector navigation');
assert(ui.includes('atlasPortraitFallback') && ui.includes('onError={hideArt}') && ui.includes('data-art-failed'),'Missing art preserves controls');
console.log('PASS Signal Atlas P3: 13 integrated runtime references; asset existence, Premium WebP integrity, receipt guards, dialog containment, state labels, fallbacks');
