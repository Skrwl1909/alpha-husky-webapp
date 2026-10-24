import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stat,readFile} from 'node:fs/promises';
import {ASSETS,loadAssets,bossImage,bossState,playerFrame} from './assets.js';
import {combatParameters,combatTuning,LOCAL_PROFILES} from './combat-parameters.js';
import {Encounter,replay} from './simulation.js';
test('every referenced art file exists in the original repository; all four Husk states are included',async()=>{
  for(const path of Object.values(ASSETS)){assert(path.startsWith('/assets/'));assert((await stat(new URL('../..'+path,import.meta.url))).size>1000);}
  for(const state of ['idle','attack','hit','defeat'])assert(ASSETS[state].endsWith(`/tower_husk/${state}.webp`));
});
class FakeImage {
  constructor(){this.naturalWidth=768;this.naturalHeight=768;}
  set src(value){queueMicrotask(()=>value==='fail'?this.onerror?.():value==='hang'?null:this.onload?.());}
}
test('asset loader succeeds, optional state falls back to original idle, essential failure blocks play and timeout terminates',async()=>{
  const complete=await loadAssets(ASSETS,FakeImage);assert(complete.ready);assert.equal(complete.failures.length,0);
  const optional=await loadAssets({...ASSETS,hit:'fail'},FakeImage);assert(optional.ready);assert.deepEqual(optional.failures,['hit']);assert.equal(bossImage(optional.images,'hit'),optional.images.idle);
  const essential=await loadAssets({...ASSETS,player:'fail'},FakeImage);assert(!essential.ready);assert.deepEqual(essential.failures,['player']);
  const timeout=await loadAssets({...ASSETS,arena:'hang'},FakeImage,2);assert(!timeout.ready);assert.deepEqual(timeout.failures,['arena']);
});
test('actual combat states drive boss art; directional frame selection follows the existing sprite metadata',()=>{
  const g=new Encounter();assert.equal(bossState(g),'idle');g.shotAt=g.time;assert.equal(bossState(g),'hit');g.phase='impact';assert.equal(bossState(g),'attack');g.boss.hp=0;assert.equal(bossState(g),'defeat');
  assert.deepEqual(playerFrame({x:1,y:0},true,.15),{direction:'right',x:512,y:512});
  assert.equal(playerFrame({x:0,y:-1},true,0).y,256);assert.equal(playerFrame({x:-1,y:0},true,0).y,768);
  assert.equal(playerFrame({x:0,y:1},true,0).y,0);assert.equal(playerFrame({x:1,y:0},true,.15,'up',true).x,0);
  assert.equal(playerFrame({x:0,y:0},false,1,'left').direction,'left');
});
test('resolved combat contract validates finite positive values, isolates fixtures, and fixes enemy HP independently of damage',()=>{
  assert.equal(LOCAL_PROFILES.standard.enemy.maxHP,96);assert.equal(LOCAL_PROFILES.stronger.enemy.maxHP,96);
  assert.equal(LOCAL_PROFILES.stronger.player.damagePerHit,1.2);assert(Object.isFrozen(LOCAL_PROFILES.standard.player));
  for(const value of [0,-1,NaN,Infinity,'3',undefined]){
    assert.throws(()=>combatParameters({...LOCAL_PROFILES.standard,player:{maxHP:3,damagePerHit:value}}),TypeError);
  }
  assert.throws(()=>combatParameters({...LOCAL_PROFILES.standard,enemy:{id:'other',maxHP:96,damagePerHit:1}}));
  const raw=structuredClone(LOCAL_PROFILES.standard),g=new Encounter(1909,{},raw);raw.player.damagePerHit=900;
  assert.equal(g.t.damage,1);assert.deepEqual(combatTuning(LOCAL_PROFILES.stronger),{playerHP:3,damage:1.2,bossHP:96,incomingDamage:1});
  const incoming=new Encounter(1909,{},combatParameters({...LOCAL_PROFILES.standard,enemy:{id:'tower_husk',maxHP:96,damagePerHit:2}}));
  incoming.beginAttack();while(incoming.phase!=='recovery')incoming.step();assert.equal(incoming.player.hp,1);
});
test('same real input trace gives meaningful damage progression, fixed 96 HP, and deterministic parameterized replay',async()=>{
  const data=JSON.parse(await readFile(new URL('./evidence/touch-victory.json',import.meta.url),'utf8'));
  const results=[];
  for(const [name,profile] of Object.entries(LOCAL_PROFILES)){
    const g=new Encounter(data.recording.seed,{},profile);let i=0;
    while(g.status==='playing'&&g.tick<data.recording.ticks){
      while(data.recording.trace[i]?.tick===g.tick){const p=data.recording.trace[i++];g.setInput(p.x,p.y);}g.step();
    }
    assert.equal(g.status,'won',name);assert.equal(g.t.bossHP,96);assert(g.time>=45&&g.time<=75);assert(g.player.hp>0);
    const copy=replay(JSON.parse(JSON.stringify(g.recording())));assert.deepEqual(copy.events,g.events);assert.deepEqual(copy.player,g.player);
    assert.deepEqual(copy.parameters,profile);results.push(g);
    console.log(`${name}: ${g.time.toFixed(2)}s, ${g.events.filter(e=>e.type==='boss-hit').length} hits, damage ${g.t.damage}, fixed boss ${g.t.bossHP} HP`);
  }
  assert(results[1].time<results[0].time-5);assert(results[1].events.filter(e=>e.type==='boss-hit').length<results[0].events.filter(e=>e.type==='boss-hit').length);
});
