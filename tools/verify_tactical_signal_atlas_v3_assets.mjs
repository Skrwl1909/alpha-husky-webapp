/** Original runtime art integrity and truthful visual state mapping. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createServer} from 'vite';
const root='images/tactical_ops/signal_atlas/v3/';
const read=p=>readFileSync(root+p);
const manifest=JSON.parse(read('manifest.json'));
const identity=JSON.parse(read('identity_manifest.json'));
for(const {path,file,bytes,sha256} of [...manifest.files,...identity.assets]){
 const asset=read(path||file);
 assert.equal(asset.length,bytes,path||file);
 assert.equal(createHash('sha256').update(asset).digest('hex'),sha256,path||file);
}
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {nodeStateArt,sectorArt,atlasV3,atlasV3Variables}=await server.ssrLoadModule('/tactical-ops-src/ui/signalAtlas/signalAtlasV3Art.ts');
 for(const state of ['base','recorded','maxed','available','needs-rank-one','no-points','different-discipline','no-effect','unavailable','active-run']){
  const own=['base','recorded','maxed'].includes(state);
  for(const pending of [false,true])for(const acquired of [false,true]){
   const desired=pending?'locked':own?(acquired?'acquired':'owned'):state==='available'?'available':'locked';
   assert.match(nodeStateArt(state,pending,acquired)['--tsa-v3-node-state'],new RegExp('atlas_state_'+desired+'_v1.svg'));
  }
 }
 for(const id of ['assault','command','pursuit','control','line','support'])assert(sectorArt(id)['--tsa-v3-plate']);
 assert.deepEqual(sectorArt('unconfirmed'),{});
 const files=[atlasV3.core,...Object.values(atlasV3.variant),...Object.values(atlasV3Variables).map(v=>v.slice(5,-2))];
 for(const path of files)assert(readFileSync(path.slice(1)).length>0,path);
 assert.equal(new Set(Object.values(atlasV3.variant)).size,4);
 const ui=readFileSync('tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx','utf8');
 assert(!ui.includes('/capstones/'),'no unconfirmed capstone binding');
 console.log('PASS Signal Atlas V3: original manifest SHA256, distinct visual variants, real state mapping, unconfirmed capstones not bound');
}finally{await server.close();}
