import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {P2_SCENARIOS} from './scenarios.js';
import {PreviewAuthority,resolveFromPython} from './preview-authority.mjs';
import {drive} from './driver.mjs';
import {Encounter,replay} from '../simulation.js';
const body=(entry,g)=>({encounterId:entry.encounterId,ticks:g.tick,trace:g.recording().trace});
function fixture(){
  let clock=1000;
  const raid={raidInstanceId:'synthetic-raid',faction:'rb',wave:1,hp:1000,hpMax:1000,revision:0};
  const a=new PreviewAuthority({resolveProfile:async id=>structuredClone(P2_SCENARIOS[id]),readRaid:()=>structuredClone(raid),now:()=>clock,seed:()=>1909});
  return {a,raid,advance:seconds=>{clock+=seconds;}};
}
test('actual Python source resolver -> server snapshots -> both deterministic playable encounters, no credit',async()=>{
  let clock=1000;const authority=new PreviewAuthority({now:()=>clock,seed:()=>1909});const report={mode:'LOCAL_VALIDATION_ONLY',productionParity:false,scenarios:{}};
  for(const profile of ['baseline','progressed']){
    const source=await resolveFromPython(profile);assert.deepEqual(source.parameters,P2_SCENARIOS[profile].parameters);
    const entry=await authority.issue('synthetic-'+profile,profile);assert(entry.ok);assert.equal(entry.parameters.enemy.maxHP,1000);
    const g=drive(entry.parameters,entry.seed);assert.equal(g.status,'won');assert(g.player.hp>0);assert(g.time>15);
    const again=replay(JSON.parse(JSON.stringify(g.recording())));assert.deepEqual(again.events,g.events);assert.deepEqual(again.player,g.player);
    const idle=new Encounter(entry.seed,{},entry.parameters);while(idle.status==='playing')idle.step();assert.equal(idle.status,'lost');
    clock+=g.time;const validated=await authority.submit('synthetic-'+profile,body(entry,g));assert(validated.ok);assert.equal(validated.receipt.status,g.status);
    assert.equal(validated.receipt.attemptsConsumed,0);assert.equal(validated.receipt.contribution,0);assert.deepEqual(validated.receipt.rewards,[]);
    report.scenarios[profile]={input:source.input,effective:source.effective,observedV3:source.observedV3,bridgedRoll:source.bridgedRoll,proposal:source.proposal,parameters:entry.parameters,
      outcome:g.status,time:g.time,hits:g.events.filter(e=>e.type==='boss-hit').length,remainingHP:g.player.hp,idleOutcome:idle.status,idleSurvival:idle.time,validation:validated.receipt,recording:g.recording()};
    console.log(`${profile}: ${g.status}, ${g.time.toFixed(2)}s, ${report.scenarios[profile].hits} hits, ${g.player.hp} HP, idle ${idle.status} at ${idle.time.toFixed(2)}s`);
  }
  assert(report.scenarios.progressed.time<report.scenarios.baseline.time-10);
  assert.equal(report.scenarios.baseline.parameters.enemy.maxHP,report.scenarios.progressed.parameters.enemy.maxHP);
  await mkdir(new URL('./evidence/',import.meta.url),{recursive:true});await writeFile(new URL('./evidence/progression-results.json',import.meta.url),JSON.stringify(report,null,2));
});
test('tampered public snapshots/claims cannot change server parameters, seed or result',async()=>{
  const f=fixture(),e=await f.a.issue('A','baseline'),parameters=structuredClone(e.parameters);e.parameters.player.damagePerHit=999999;e.seed=1;
  const g=drive(parameters,1909);f.advance(g.time);
  for(const patch of [{parameters:e.parameters},{seed:1},{outcome:'won'},{events:[]},{bossHP:0}]){
    const result=await f.a.submit('A',{...body(e,g),...patch});assert.equal(result.reason,'INVALID_SUBMISSION');
  }
  const result=await f.a.submit('A',body(e,g));assert(result.ok);assert.equal(result.receipt.time,g.time);
  assert.equal((await f.a.submit('B',body(e,g))).reason,'INVALID_ENCOUNTER');
  assert.equal((await f.a.submit('A',{...body(e,g),encounterId:'unknown'})).reason,'INVALID_ENCOUNTER');
});
test('invalid trace, impossible timing, incomplete and padded results fail without any awards',async()=>{
  const f=fixture(),e=await f.a.issue('A','baseline'),g=drive(e.parameters,e.seed);
  assert.equal((await f.a.submit('A',body(e,g))).reason,'IMPOSSIBLE_ELAPSED_TIME');f.advance(g.time);
  for(const trace of [[{tick:0,x:NaN,y:0}],[{tick:-1,x:0,y:0}],[{tick:0,x:2,y:0}],[{tick:2,x:0,y:0},{tick:1,x:0,y:0}],[{tick:0,x:0,y:0,hp:999}]])assert.equal((await f.a.submit('A',{encounterId:e.encounterId,ticks:g.tick,trace})).reason,'INVALID_TRACE');
  assert.equal((await f.a.submit('A',{encounterId:e.encounterId,ticks:1,trace:[]})).reason,'INCOMPLETE_ENCOUNTER');
  assert.equal((await f.a.submit('A',{...body(e,g),ticks:g.tick+1})).reason,'TICK_MISMATCH');
  assert.deepEqual(f.a.audit(),{encounters:1,completed:0,productionWrites:0,attemptsConsumed:0,contribution:0,rewards:0});
});
test('simultaneous identical submissions commit one validation receipt; conflicting duplicate is rejected',async()=>{
  const f=fixture(),raidBefore=structuredClone(f.raid),e=await f.a.issue('A','baseline'),g=drive(e.parameters,e.seed);f.advance(g.time);
  const results=await Promise.all(Array.from({length:5},()=>f.a.submit('A',body(e,g))));
  assert(results.every(r=>r.ok));assert.equal(results.filter(r=>!r.duplicate).length,1);assert.equal(f.a.audit().completed,1);
  results[0].receipt.rewards.push('tampered');f.advance(500);
  const duplicate=await f.a.submit('A',body(e,g));assert(duplicate.ok&&duplicate.duplicate);assert.deepEqual(duplicate.receipt.rewards,[]);
  const conflicting={...body(e,g),trace:structuredClone(g.trace)};conflicting.trace[0].x=.1;
  assert.equal((await f.a.submit('A',conflicting)).reason,'COMMAND_ID_CONFLICT');assert.deepEqual(f.raid,raidBefore);
});
test('disconnect expiry, concurrent issuance, stale raid and partial shared HP are handled without consuming attempts',async()=>{
  const f=fixture();const issued=await Promise.all([f.a.issue('A','baseline'),f.a.issue('A','progressed')]);assert.equal(issued.filter(e=>e.ok).length,1);assert(issued.some(e=>e.reason==='ENCOUNTER_ACTIVE'));
  const e=issued.find(e=>e.ok),g=drive(e.parameters,e.seed);f.advance(121);assert.equal((await f.a.submit('A',body(e,g))).reason,'EXPIRED');
  const fresh=await f.a.issue('A','baseline');assert(fresh.ok);const current=drive(fresh.parameters,fresh.seed);f.advance(current.time);
  f.raid.revision++;assert.equal((await f.a.submit('A',body(fresh,current))).reason,'STALE_RAID_SNAPSHOT');
  f.raid.hp=900;assert.equal((await f.a.issue('B','baseline')).reason,'UNSUPPORTED_RAID_SNAPSHOT');
  assert.equal(f.a.audit().productionWrites,0);assert.equal(f.a.audit().contribution,0);
});
test('two concurrent participants and mid-run profile changes cannot mutate shared raid HP or frozen snapshots',async()=>{
  const f=fixture(),raidBefore=structuredClone(f.raid),entries=await Promise.all([f.a.issue('A','baseline'),f.a.issue('B','progressed')]);
  const runs=entries.map(e=>drive(e.parameters,e.seed));f.a.resolveProfile=async()=>{throw Error('changed profile must not be re-resolved on submit');};f.advance(Math.max(...runs.map(g=>g.time)));
  const results=await Promise.all(entries.map((e,i)=>f.a.submit(['A','B'][i],body(e,runs[i]))));assert(results.every(r=>r.ok));assert.deepEqual(f.raid,raidBefore);assert.equal(f.a.audit().completed,2);assert.equal(f.a.audit().rewards,0);
});
test('valid defeat is recorded as defeat, never promoted to victory or rewarded',async()=>{
  const f=fixture(),e=await f.a.issue('A','baseline'),g=new Encounter(e.seed,{},e.parameters);
  while(g.status==='playing')g.step();f.advance(g.time);
  const result=await f.a.submit('A',body(e,g));assert(result.ok);assert.equal(result.receipt.status,'lost');assert(result.receipt.bossHP>0);assert.deepEqual(result.receipt.rewards,[]);assert.equal(result.receipt.contribution,0);
});
