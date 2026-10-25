import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Presentation,PLAYER_VISUAL,combatVisuals,combatCue} from './presentation.js';
import {Encounter,replay} from './simulation.js';
import {P3_PROFILES} from './p3/balance.js';
import {drive} from './p3/driver.mjs';

function renderer(){
  const calls=[];
  const canvas=()=>({getContext:()=>new Proxy({},{get:(_,key)=>(...args)=>calls.push({key,args}),set:()=>true})});
  const previous=globalThis.document;globalThis.document={createElement:canvas};
  let p;try{p=new Presentation(canvas(),{player:{},idle:{},hit:{},attack:{},defeat:{}});}finally{globalThis.document=previous;}
  calls.length=0;return {p,calls};
}

test('Howler uses original feet-origin metadata at readable scale; exact collision ring never scales with art',async()=>{
  const meta=JSON.parse(await readFile(new URL('../../assets/dojo/v1/processed/alpha_husky_player_sheet_v1_meta.json',import.meta.url)));
  assert.equal(PLAYER_VISUAL.originY,meta.suggestedOrigin.y);assert.equal(PLAYER_VISUAL.originX,meta.suggestedOrigin.x);
  assert(PLAYER_VISUAL.size>48&&PLAYER_VISUAL.size<90);
  const {p,calls}=renderer(),g=new Encounter();p.draw(g,null,false);
  const sprite=calls.findLast(x=>x.key==='drawImage'&&x.args.length===9);assert(sprite);
  assert.equal(sprite.args[5],g.player.x-PLAYER_VISUAL.size/2);assert.equal(sprite.args[6]+PLAYER_VISUAL.size*PLAYER_VISUAL.originY,g.player.y);
  const ring=calls.filter(x=>x.key==='arc'&&x.args[0]===g.player.x&&x.args[1]===g.player.y);
  assert.equal(ring.length,1);assert.equal(ring[0].args[2],g.t.playerRadius);
});

test('hit connection/number/hurt windows are readable, use actual capped damage and obey simulation time',()=>{
  const g=new Encounter();g.step();g.events.push({tick:g.tick,type:'boss-hit',damage:.25},{tick:g.tick,type:'player-hit',damage:1,kind:'CONE'});
  const v=combatVisuals(g);assert(v.connection&&v.number&&v.hurtVisible);assert.equal(v.shot.damage,.25);assert.equal(v.hurt.damage,1);
  const {p,calls}=renderer();p.draw(g,null,false);
  assert(calls.some(c=>c.key==='fillText'&&c.args[0]==='−0.25'));assert(calls.some(c=>c.key==='fillText'&&c.args[0]==='−1'));
  g.time+=.3;assert(!combatVisuals(g).connection);assert(combatVisuals(g).number);
  g.time+=.31;assert(!combatVisuals(g).number&&!combatVisuals(g).hurtVisible);
});

test('warning/imminent/impact/recovery cues follow existing phases without duplicate canvas HUD',()=>{
  const g=new Encounter();g.beginAttack();assert(combatCue(g).label.startsWith('WARNING'));
  g.phaseTime=.25;assert(combatVisuals(g).imminent);assert(combatCue(g).label.startsWith('IMMINENT'));
  g.phase='impact';assert(combatCue(g).label.includes('IMPACT'));g.phase='recovery';assert.equal(combatCue(g).label,'COUNTER WINDOW');
  const {p,calls}=renderer();p.draw(g,null,false);assert(!calls.some(x=>x.key==='fillText'&&/HOWLER|HUSK|STOP TO COUNTER|\/75/.test(x.args[0])));
});

test('LINE/CIRCLE/CONE boundary paths use actual attack coordinates at every visual warning stage',()=>{
  for(const kind of ['LINE','CIRCLE','CONE']){
    const g=new Encounter();g.attackNumber=['LINE','CIRCLE','CONE'].indexOf(kind);g.beginAttack();
    const {p,calls}=renderer();p.shape(g.attack);
    if(kind==='CIRCLE')assert(calls.some(x=>x.key==='arc'&&x.args[0]===g.attack.center.x&&x.args[2]===g.attack.radius));
    else if(kind==='CONE')assert(calls.some(x=>x.key==='arc'&&x.args[2]===g.attack.radius&&x.args[3]===g.attack.angle-g.attack.halfAngle));
    else assert(calls.filter(x=>['moveTo','lineTo'].includes(x.key)).length===4);
    const original=structuredClone(g.attack);for(const phase of ['telegraph','impact','recovery']){g.phase=phase;p.draw(g,null,false);assert.deepEqual(g.attack,original);}
  }
});

test('rendering every tick in full/reduced modes leaves P3 input, damage, HP, timing and replay exactly identical',()=>{
  for(const [id,profile] of Object.entries(P3_PROFILES))for(const options of [{reaction:.45,misses:[4,13]},{idle:true}]){
    const source=drive(profile.parameters,1909,options).game,record=source.recording();
    for(const lite of [false,true]){
      const {p,calls}=renderer(),g=new Encounter(record.seed,record.tuning,record.parameters);let i=0;
      while(g.tick<record.ticks&&g.status==='playing'){
        while(record.trace[i]?.tick===g.tick){const x=record.trace[i++];g.setInput(x.x,x.y);}g.step();
        const before=JSON.stringify(g);p.draw(g,null,lite);assert.equal(JSON.stringify(g),before);calls.length=0;
      }
      assert.deepEqual(g.events,source.events,id);assert.deepEqual(g.player,source.player);assert.deepEqual(g.boss,source.boss);assert.equal(g.status,source.status);assert.equal(g.tick,source.tick);
      assert.deepEqual(replay(g.recording()).events,source.events);
    }
  }
});

test('reduced motion keeps static hit/danger feedback but suppresses travel, pulse and flinch',()=>{
  const g=new Encounter();g.step();g.events.push({tick:g.tick,type:'boss-hit',damage:1});g.time+=.1;
  const a=renderer(),b=renderer();a.p.draw(g,null,true);b.p.draw(g,null,true);
  assert.equal(combatVisuals(g,true).motion,false);assert(combatVisuals(g,true).number);
  assert.deepEqual(a.calls.filter(c=>c.key!=='drawImage'),b.calls.filter(c=>c.key!=='drawImage'));
  assert(!a.calls.some(c=>c.key==='arc'&&c.args[0]===g.boss.x&&c.args[1]===g.boss.y+8));
});
