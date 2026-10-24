import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import {DEMO_SCENARIOS} from './demo-profiles.js';
import {Encounter} from '../simulation.js';
const publicFiles=['.gitignore','README.md','demo-profiles.js','driver.mjs','preview-authority.mjs','authority.test.mjs','compatibility-fixtures.json','compatibility.test.mjs','private-integration.test.mjs','public-safety.test.mjs','browser-p2.test.mjs'].sort();
test('public P2 inventory contains only approved code and compact fixtures, no private copies or bulk evidence',async()=>{
  const entries=await readdir(new URL('./',import.meta.url),{withFileTypes:true});
  if(process.argv.includes('--public-export'))assert(!entries.some(e=>e.name==='.private'),'Private directory included in public export');
  const published=entries.filter(e=>!['.private','evidence-local'].includes(e.name));
  assert.deepEqual(published.map(e=>e.name).sort(),publicFiles);assert(published.every(e=>e.isFile()));
  let total=0;for(const e of published){const size=(await stat(new URL(e.name,import.meta.url))).size;assert(size<60_000,`Unexpected large public file ${e.name}`);total+=size;}
  assert(total<150_000);console.log(`Approved public P2 inventory: ${published.length} files, ${total} bytes`);
});
test('public fixture schema exposes only labelled synthetic resolved values; numeric tuning is unchanged',()=>{
  assert.deepEqual(Object.keys(DEMO_SCENARIOS),['baseline','progressed']);
  for(const [id,values] of Object.entries({baseline:[170,10.5],progressed:[278,16.875]})){
    const s=DEMO_SCENARIOS[id];assert.deepEqual(Object.keys(s).sort(),['label','parameters']);assert(s.label.includes('synthetic demo'));
    assert.equal(s.parameters.provenance,'local-fixture');assert.equal(s.parameters.player.maxHP,values[0]);assert.equal(s.parameters.player.damagePerHit,values[1]);assert.deepEqual(s.parameters.enemy,{id:'tower_husk',maxHP:1000,damagePerHit:60});
  }
});
test('50 HP fresh-player boundary loses to the unchanged 60-damage hazard in one actual collision',()=>{
  // HP-only safety fixture, not a claim to reproduce private fresh-account offense.
  const p=structuredClone(DEMO_SCENARIOS.baseline.parameters);p.player.maxHP=50;
  const g=new Encounter(1909,{},p);while(g.status==='playing')g.step();
  assert.equal(g.status,'lost');assert.equal(g.player.hp,0);assert.equal(g.events.filter(e=>e.type==='player-hit').length,1);assert.equal(g.t.incomingDamage,60);
  console.log(`50 HP boundary: first hazard is lethal at ${g.time.toFixed(2)}s; tuning unchanged`);
});
test('demo server refuses local private files, tests and traversal while serving required runtime assets',{skip:!process.env.DEMO_URL},async()=>{
  const root=process.env.DEMO_URL;
  for(const path of ['p2/.private/adapter.mjs','p2/%2eprivate/resolver.py','p2/private-integration.test.mjs','p2/backend-review.patch','p2/verified_source/stats.py','%2e%2e/package.json']){
    const r=await fetch(new URL(path,root));assert.equal(r.status,404,path);
  }
  for(const path of ['index.html','last-stand.js','p2/demo-profiles.js','assets/bloodmoon/v3/enemies/tower_husk/idle.webp'])assert.equal((await fetch(new URL(path,root))).status,200,path);
});
