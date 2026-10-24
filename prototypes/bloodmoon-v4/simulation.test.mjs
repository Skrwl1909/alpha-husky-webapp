import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Encounter,TUNING,hits,replay} from './simulation.js';
const advance=(g,seconds)=>{for(let n=0;n<Math.ceil(seconds/g.t.step);n++)g.step();};
test('movement clamps bounds and input intent prevents attacks; release respects delay, range and cooldown',()=>{
  const g=new Encounter();g.setInput(1,0);advance(g,1);assert.equal(g.boss.hp,96);assert.equal(g.player.x,349);
  g.setInput();advance(g,.24);assert.equal(g.boss.hp,96);advance(g,.02);assert.equal(g.boss.hp,95);
  advance(g,.3);assert.equal(g.boss.hp,95);advance(g,.2);assert.equal(g.boss.hp,94);
  const far=new Encounter();far.player.y=529;advance(far,.6);assert.equal(far.boss.hp,96);
  const edge=new Encounter();edge.player.y=170;edge.setInput(0,-1);advance(edge,.6);assert.equal(edge.player.y,170);assert.equal(edge.boss.hp,96);
});
test('line, circle and cone include player radius and exclude safe positions',()=>{
  const line={kind:'LINE',origin:{x:0,y:0},end:{x:0,y:500},width:40};
  assert(hits({x:30,y:100},line));assert(!hits({x:32,y:100},line));
  const circle={kind:'CIRCLE',center:{x:100,y:100},radius:60};
  assert(hits({x:170,y:100},circle));assert(!hits({x:172,y:100},circle));
  const cone={kind:'CONE',origin:{x:180,y:100},angle:Math.PI/2,halfAngle:.3,radius:250};
  assert(hits({x:180,y:250},cone));assert(!hits({x:20,y:250},cone));assert(!hits({x:180,y:370},cone));
  assert(hits({x:180+Math.sin(.3)*150+5,y:100+Math.cos(.3)*150},cone));
});
test('all hazards lock at telegraph; damage occurs only during impact, once per attack',()=>{
  for(const kind of ['LINE','CIRCLE','CONE']) {
    const g=new Encounter(1909,{bossHP:999});g.attackNumber=['LINE','CIRCLE','CONE'].indexOf(kind);g.beginAttack();
    const locked=structuredClone(g.attack);advance(g,1);assert.equal(g.player.hp,3);assert.deepEqual(g.attack,locked);
    advance(g,.3);assert.equal(g.player.hp,2);assert.equal(g.events.filter(e=>e.type==='player-hit').length,1);
    const safe=new Encounter();safe.attackNumber=['LINE','CIRCLE','CONE'].indexOf(kind);safe.beginAttack();safe.player.x=20;advance(safe,1.4);assert.equal(safe.player.hp,3);
  }
});
test('stationary loses, timeout loses, fresh restart resets all state',()=>{
  const g=new Encounter();advance(g,15);assert.equal(g.status,'lost');assert(g.boss.hp>0);
  const timeout=new Encounter(1,{limit:1});timeout.player.y=520;advance(timeout,2);assert.equal(timeout.status,'timeout');
  const reset=new Encounter();assert.equal(reset.tick,0);assert.equal(reset.events.length,0);assert.equal(reset.player.hp,3);assert.equal(reset.boss.hp,96);assert.deepEqual(reset.input,{x:0,y:0});
});
// Test driver chooses a reachable safe point, then releases to counterattack.
export function safeTarget(g) {
  const p=g.player,a=g.attack;let best=null;
  for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){
    const q={x,y};if(hits(q,a,22)||Math.hypot(x-g.boss.x,y-g.boss.y)>250)continue;
    const d=Math.hypot(x-p.x,y-p.y);if(!best||d<best.d)best={...q,d};
  }
  return best;
}
test('each telegraph has a reachable safe point; dodge-and-counter wins in 45–75s; trace replays identically',()=>{
  const g=new Encounter();let target=null,lastAttack=0;
  while(g.status==='playing'){
    if(g.attackNumber!==lastAttack){lastAttack=g.attackNumber;target=safeTarget(g);assert(target);assert(target.d/TUNING.speed<g.phaseTime-.1);}
    if(target){const dx=target.x-g.player.x,dy=target.y-g.player.y,d=Math.hypot(dx,dy);if(d>4)g.setInput(dx/d,dy/d);else {g.setInput();target=null;}}
    g.step();
  }
  assert.equal(g.status,'won');assert(g.time>=45&&g.time<=75,`duration ${g.time}`);
  assert.equal(g.events.filter(e=>e.type==='boss-hit').length,96);assert.equal(g.player.hp,3);
  const copy=replay(g.recording());assert.deepEqual(copy.events,g.events);assert.deepEqual(copy.player,g.player);assert.equal(copy.status,g.status);
  console.log(`Dodge/counter: ${g.time.toFixed(2)}s, ${g.player.hp} HP, ${g.attackNumber} attacks, ${g.tick} ticks; replay identical`);
});
