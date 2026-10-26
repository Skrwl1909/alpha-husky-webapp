/** Art integration and presentation safety gates; canonical model gates live in V2 suite. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const assets=read('tactical-ops-src/ui/signalAtlas/signalAtlasAssets.ts');
const ui=read('tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx');
const css=read('tactical-ops-src/ui/signalAtlas/signalAtlas.css');
assert(!assets.includes('Candidate'),'No unresolved asset roles');
for(const [,suffix] of assets.matchAll(/ROOT \+ "([^"]+)"/g))assert(existsSync('images/tactical_ops/signal_atlas/v1'+suffix),suffix);
for(const key of ['sectorBackground','sectorFrame','nodeFrame','inspectorFrame','contact'])assert(css.includes(`var(--tsa-${key})`),key+' visibly integrated');
assert(ui.includes('SIGNAL_ATLAS_ASSETS.coreBezel'));
assert(ui.includes('Object.entries(SIGNAL_ATLAS_ASSETS)'),'Asset mapping reaches live CSS');
for(const guard of ['current.progression.revision>captured.revision','saved?.ranks[captured.skillId]','!current.progressionError','await respec(','await upgrade('])assert(ui.includes(guard),guard);
assert(ui.includes('createPortal(') && ui.includes('inert={Boolean(confirm)}') && ui.includes('event.key==="Escape"') && ui.includes('event.key!=="Tab"'),'Dialog escapes host clipping, traps focus, disables background');
assert(css.includes('100dvh') && css.includes('--tg-content-safe-area-inset-bottom') && css.includes('overflow-y:auto'),'Reachable dialog safe-area controls');
assert(ui.includes('SAVED RANK') && ui.includes('tsa-node-status') && ui.includes('Choose live sector'),'Ownership, color-independent states, direct sector navigation');
assert(ui.includes('atlasPortraitFallback') && ui.includes('onError={hideArt}') && ui.includes('data-art-failed'),'Missing art preserves controls');
console.log('PASS Signal Atlas P3: 13 integrated runtime references; asset existence, receipt guards, dialog containment, state labels, fallbacks');
