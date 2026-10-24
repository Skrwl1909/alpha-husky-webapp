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
export function safeTarget(g, margin = 22) {
  const p=g.player,a=g.attack;let best=null;
  for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){
    const q={x,y};if(hits(q,a,margin)||Math.hypot(x-g.boss.x,y-g.boss.y)>250)continue;
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
test('escalates exactly at 30/50s without truncating active phases; recovery is 650/550/480ms',()=>{
  const g=new Encounter();
  for(const [tick,stage,recovery] of [[1799,1,.55],[2999,2,.48]]){
    g.tick=tick-1;g.phase='telegraph';g.phaseTime=.8;g.step();
    assert.equal(g.pressure,stage-1);const remaining=g.phaseTime;g.step();
    assert.equal(g.pressure,stage);assert.equal(g.phase,'telegraph');
    assert(Math.abs(g.phaseTime-(remaining-g.t.step))<1e-9);
    const event=g.events.findLast(e=>e.type==='escalation');assert.equal(event.tick,tick+1);assert.equal(event.recovery,recovery);
    g.beginAttack();g.phase='impact';g.phaseTime=g.t.step;g.step();assert.equal(g.phase,'recovery');assert.equal(g.phaseTime,recovery);
  }
  const fresh=new Encounter();fresh.beginAttack();fresh.phase='impact';fresh.phaseTime=fresh.t.step;fresh.step();assert.equal(fresh.phaseTime,.65);
  assert.equal(g.events.filter(e=>e.type==='escalation').length,2);
  assert.equal(new Encounter().pressure,0);assert.equal(new Encounter().attackQueue.length,0);
});
test('opening rotation and warning durations stay intact; seeded bags vary order without repeats or missing hazards',()=>{
  const g=new Encounter(),baseline=new Encounter(1909,{escalationAt:null,finalEscalationAt:null});
  const varied=[];
  for(let i=0;i<36;i++){
    if(i===15)g.pressure=1;if(i===25)g.pressure=2;
    g.beginAttack();baseline.beginAttack();
    assert.equal(g.phaseTime,baseline.phaseTime);assert(g.phaseTime>=1.1&&g.phaseTime<=1.18);
    if(i<15)assert.equal(g.attack.kind,baseline.attack.kind);else varied.push(g.attack.kind);
  }
  for(let i=1;i<varied.length;i++)assert.notEqual(varied[i],varied[i-1]);
  const bags=[];for(let i=0;i+3<=varied.length;i+=3){const bag=varied.slice(i,i+3);assert.equal(new Set(bag).size,3);bags.push(bag.join(','));}
  for(let i=1;i<bags.length;i++)assert.notEqual(bags[i],bags[i-1]);
  assert.notEqual(bags[0],'LINE,CIRCLE,CONE');
  const other=new Encounter(42);other.pressure=1;const sequence=[];for(let i=0;i<21;i++){other.beginAttack();sequence.push(other.attack.kind);}
  assert.notDeepEqual(sequence,varied);
});
test('all three hazards retain reachable safe zones, locked hitboxes and single impact damage at every pressure tier',()=>{
  for(const pressure of [0,1,2])for(const kind of ['LINE','CIRCLE','CONE']){
    const make=()=>{
      const g=new Encounter();g.tick=pressure===2?3000:pressure===1?1800:0;g.time=g.tick*g.t.step;g.pressure=pressure;
      if(pressure)g.attackQueue=[kind];else g.attackNumber=['LINE','CIRCLE','CONE'].indexOf(kind);
      g.beginAttack();return g;
    };
    const g=make(),safe=safeTarget(g,34);assert(safe);assert(safe.d/g.t.speed+.25<g.phaseTime);
    const geometry=structuredClone(g.attack);advance(g,1);assert.deepEqual(g.attack,geometry);assert.equal(g.player.hp,3);
    advance(g,.4);assert.equal(g.player.hp,2);assert.equal(g.events.filter(e=>e.type==='player-hit').length,1);
    const dodge=make();let reacting=.25;
    while(dodge.phase!=='recovery'){
      if(reacting>0)reacting-=dodge.t.step;
      else{const dx=safe.x-dodge.player.x,dy=safe.y-dodge.player.y,d=Math.hypot(dx,dy);dodge.setInput(d>4?dx/d:0,d>4?dy/d:0);}
      dodge.step();
    }
    assert.equal(dodge.player.hp,3,`${pressure}/${kind} dodge`);
    // Even a player who stops only at recovery can deliver a real strike.
    dodge.setInput();const hp=dodge.boss.hp;advance(dodge,dodge.recoveryDuration()-.02);assert(dodge.boss.hp<hp);
  }
});
function delayedDriver(seed,{reaction=.25,margin=34,mistakes=0,tuning={}}={}){
  const g=new Encounter(seed,tuning);let target=null,lastAttack=0,reactAt=0;
  while(g.status==='playing'){
    if(g.attackNumber!==lastAttack){lastAttack=g.attackNumber;target=lastAttack<=mistakes?null:safeTarget(g,margin);reactAt=g.time+reaction;g.setInput();}
    if(target&&g.time>=reactAt){const dx=target.x-g.player.x,dy=target.y-g.player.y,d=Math.hypot(dx,dy);if(d>4)g.setInput(dx/d,dy/d);else{g.setInput();target=null;}}
    g.step();
  }
  return g;
}
test('delayed reaction and wider dodges retain survival and enough damage; two early mistakes remain recoverable',()=>{
  for(const seed of [1909,1,42,2026]){
    const baseline=delayedDriver(seed,{tuning:{escalationAt:null,finalEscalationAt:null}});
    for(const mistakes of [0,2]){
      const g=delayedDriver(seed,{mistakes});assert.equal(g.status,'won',`seed ${seed}, mistakes ${mistakes}, boss ${g.boss.hp}, time ${g.time}`);
      assert(g.time>=45&&g.time<=75);assert.equal(g.player.hp,3-mistakes);assert.equal(g.boss.hp,0);
      assert(g.events.some(e=>e.type==='escalation'&&e.pressure===2));
      const copy=replay(JSON.parse(JSON.stringify(g.recording())));assert.deepEqual(copy.events,g.events);assert.deepEqual(copy.player,g.player);
      console.log(`250ms reaction, margin 34, seed ${seed}, mistakes ${mistakes}: ${g.time.toFixed(2)}s, ${g.player.hp} HP; baseline ${baseline.time.toFixed(2)}s`);
    }
  }
});
test('version 1 recordings retain their original pacing and serialized replays remain deterministic',()=>{
  const g=delayedDriver(1909,{tuning:{escalationAt:null,finalEscalationAt:null}}),record=g.recording();
  record.version=1;delete record.tuning.escalationAt;delete record.tuning.finalEscalationAt;
  const copy=replay(JSON.parse(JSON.stringify(record)));assert.deepEqual(copy.events,g.events);assert.equal(copy.pressure,0);
  assert.deepEqual(replay(JSON.parse(JSON.stringify(copy.recording()))).events,copy.events);
});
