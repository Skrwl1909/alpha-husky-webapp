import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Encounter,replay} from '../simulation.js';
import {P3_PROFILES,lastStandParameters,POLICY} from './balance.js';
import {drive,safeTarget} from './driver.mjs';
const seeds=[1,7,19,42,77,99,123,256,512,777,1024,1909,2026,4096,8192,10001];
const digest=g=>createHash('sha256').update(JSON.stringify(g.events)).digest('hex');
const summary=({game:g,metrics})=>({status:g.status,seconds:+g.time.toFixed(3),playerHP:g.player.hp,bossHP:g.boss.hp,hits:g.events.filter(e=>e.type==='boss-hit').length,eventDigest:digest(g),...metrics});

test('P3 encounter support and ward preserve resolved data, fixed enemy HP and bounded meaningful progression',()=>{
  const values=Object.values(P3_PROFILES);
  assert.deepEqual(values.map(p=>p.parameters.player.damagePerHit),[9.435,10.94,12.725]);
  assert.deepEqual(values.map(p=>p.parameters.enemy.damagePerHit),[20,60,60]);
  assert.deepEqual(values.map(p=>p.parameters.player.maxHP),[50,170,278]);
  for(const p of values){assert.equal(p.parameters.enemy.maxHP,1000);assert(Object.isFrozen(p.parameters.player));}
  assert.equal(P3_PROFILES.fresh.resolved.player.damagePerHit,5.125);
  const extreme=structuredClone(P3_PROFILES.progressed.resolved);extreme.player.damagePerHit=1e6;
  assert.equal(lastStandParameters(extreme).player.damagePerHit,POLICY.damageCeiling);
  assert.throws(()=>lastStandParameters({...extreme,player:{maxHP:NaN,damagePerHit:1}}));
});

test('before/after matrix: varied seeds, delayed reactions, two mistakes, defeats, timeout and exact replay',async()=>{
  const report={policy:POLICY,kind:'SYNTHETIC_DRIVER_NOT_HUMAN_WIN_RATE',seeds,profiles:{}};
  for(const [id,p] of Object.entries(P3_PROFILES)){
    const rows=[];
    for(const seed of seeds){
      const before=drive(p.resolved,seed);
      const after=drive(p.parameters,seed);
      const imperfect=drive(p.parameters,seed,{reaction:.45,margin:44,misses:[4,13]});
      const repeatedErrors=drive(p.parameters,seed,{reaction:.9,missEvery:3});
      const idle=drive(p.parameters,seed,{idle:true});
      const moving=drive(p.parameters,seed,{alwaysMove:true});
      // Isolate the timeout path: continuous movement cannot attack, with a harmless
      // synthetic hazard to ensure survival rather than an early damage defeat.
      const lowHazard=structuredClone(p.parameters);lowHazard.enemy.damagePerHit=.001;
      const timeout=drive(lowHazard,seed,{alwaysMove:true});
      for(const run of [after,imperfect]){
        const {game:g,metrics:m}=run;assert.equal(g.status,'won',`${id}/${seed}`);
        assert(g.time>=45&&g.time<=75);assert(g.player.hp>0);assert.equal(g.boss.hp,0);
        assert.equal(m.unreachable,0);assert(m.movingTicks>0&&m.stationaryTicks>0);assert(m.recoveryShots>10);
        assert.equal(new Set(g.events.filter(e=>e.type==='telegraph').map(e=>e.kind)).size,3);
      }
      assert.equal(imperfect.game.events.filter(e=>e.type==='player-hit').length,2);
      assert.equal(repeatedErrors.game.status,'lost');assert.equal(idle.game.status,'lost');
      assert.equal(moving.game.events.filter(e=>e.type==='boss-hit').length,0);
      assert.equal(timeout.game.status,'timeout');assert.equal(timeout.game.time,75);
      for(const run of [before,after,imperfect,repeatedErrors,idle,moving,timeout]){
        const g=run.game,copy=replay(JSON.parse(JSON.stringify(g.recording())));
        assert.deepEqual(copy.events,g.events);assert.deepEqual(copy.player,g.player);assert.deepEqual(copy.boss,g.boss);
        assert.equal(copy.status,g.status);assert.equal(copy.tick,g.tick);
      }
      rows.push({seed,before:summary(before),after:summary(after),imperfect:summary(imperfect),repeatedErrors:summary(repeatedErrors),idle:summary(idle),alwaysMoving:summary(moving),timeout:summary(timeout)});
    }
    if(id==='fresh')assert(rows.every(r=>r.before.status==='timeout'));
    const times=rows.map(r=>r.after.seconds),imperfectTimes=rows.map(r=>r.imperfect.seconds);
    report.profiles[id]={resolved:p.resolved,effective:p.parameters,rows,range:[Math.min(...times),Math.max(...times)],imperfectRange:[Math.min(...imperfectTimes),Math.max(...imperfectTimes)]};
    console.log(`${id}: before ${rows[0].before.status} ${rows[0].before.seconds}s; P3 ${report.profiles[id].range.join('–')}s; 450ms + 2 misses ${report.profiles[id].imperfectRange.join('–')}s`);
  }
  for(let i=0;i<seeds.length;i++){
    const f=report.profiles.fresh.rows[i].after,b=report.profiles.baseline.rows[i].after,p=report.profiles.progressed.rows[i].after;
    assert(b.seconds<f.seconds-5);assert(p.seconds<b.seconds-5);assert(p.seconds>=45);
    assert(report.profiles.progressed.rows[i].idle.seconds>report.profiles.fresh.rows[i].idle.seconds+3);
  }
  report.encounters=seeds.length*3*7;report.replayComparisons=report.encounters;
  const published=JSON.parse(await readFile(new URL('./balance-summary.json',import.meta.url),'utf8'));
  assert.deepEqual(published.policy,report.policy);assert.deepEqual(published.seeds,seeds);
  assert.equal(published.encounters,report.encounters);assert.equal(published.replayComparisons,report.replayComparisons);
  for(const [id,p] of Object.entries(report.profiles)){
    const expected=published.profiles[id];assert.deepEqual(expected.resolved,p.resolved);assert.deepEqual(expected.effective,p.effective);
    assert.deepEqual(expected.after.seconds,p.range);assert.deepEqual(expected.imperfect.seconds,p.imperfectRange);
    assert.equal(expected.after.wins,p.rows.filter(r=>r.after.status==='won').length);
    assert.deepEqual(expected.before.seconds,[Math.min(...p.rows.map(r=>r.before.seconds)),Math.max(...p.rows.map(r=>r.before.seconds))]);
    assert.deepEqual(expected.before.remainingBossHP,[Math.min(...p.rows.map(r=>r.before.bossHP)),Math.max(...p.rows.map(r=>r.before.bossHP))]);
  }
  await mkdir(new URL('./evidence-local/',import.meta.url),{recursive:true});
  await writeFile(new URL('./evidence-local/balance-results.json',import.meta.url),JSON.stringify(report,null,2));
});

test('all three locked hazards remain avoidable at every pressure tier with 450ms reactions; movement never attacks',()=>{
  for(const p of Object.values(P3_PROFILES))for(const pressure of [0,1,2])for(const kind of ['LINE','CIRCLE','CONE']){
    const g=new Encounter(1909,{},p.parameters);g.tick=pressure===2?3000:pressure===1?1800:0;g.time=g.tick/60;g.pressure=pressure;
    if(pressure)g.attackQueue=[kind];else g.attackNumber=['LINE','CIRCLE','CONE'].indexOf(kind);
    g.beginAttack();const shape=structuredClone(g.attack),safe=safeTarget(g,44);assert(safe);assert(safe.d/g.t.speed+.45<g.phaseTime);
    const start=g.time;
    while(g.phase!=='recovery'){
      if(g.time-start>=.45){const dx=safe.x-g.player.x,dy=safe.y-g.player.y,d=Math.hypot(dx,dy);g.setInput(d>4?dx/d:0,d>4?dy/d:0);}
      const hp=g.boss.hp,wasMoving=Math.hypot(g.input.x,g.input.y)>.04;g.step();if(wasMoving)assert.equal(g.boss.hp,hp);
      assert.deepEqual(g.attack,shape);
    }
    assert.equal(g.player.hp,g.t.playerHP);g.setInput();const hp=g.boss.hp;
    for(let n=0;n<Math.floor((g.recoveryDuration()-.02)*60);n++)g.step();assert(g.boss.hp<hp);
  }
});

test('server keeps P3 modules available and local adapters/test artifacts inaccessible',{skip:!process.env.DEMO_URL},async()=>{
  for(const path of ['p3/.private/adapter.mjs','p3/%2eprivate/source.py','p3/raid-contract.mjs','p3/balance.test.mjs','p3/evidence-local/balance-results.json'])assert.equal((await fetch(new URL(path,process.env.DEMO_URL))).status,404,path);
  assert.equal((await fetch(new URL('p3/balance.js',process.env.DEMO_URL))).status,200);
});
