import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readLegacyState,issuePreview,validatePreview} from './raid-contract.mjs';
import {P3_PROFILES} from './balance.js';
import {drive} from './driver.mjs';
const fixture=()=>({state:{raidInstanceId:'synthetic-raid',myFaction:'rb',myFactionRun:{currentWave:1,waves:{'1':{hp:7300,hpMax:10000}}},myContribution:{attemptsLeft:3,dailyCap:5,cooldownLeftSec:0,totalDamage:120},waveHp:999999},trusted:{owner:'synthetic-owner',faction:'rb',revision:7}});
function session(profile='fresh',options={}){
  const f=fixture(),before=structuredClone(f),result=issuePreview({...f,resolved:P3_PROFILES[profile].resolved,seed:1909,run_id:'synthetic-command',now:1000});assert(result.ok);
  const g=drive(result.issued.parameters,result.issued.seed,options).game;
  return {...f,before,g,issued:result.issued,submission:{run_id:result.issued.run_id,ticks:g.tick,trace:g.recording().trace},now:1000+g.time};
}

test('observed legacy contract fields remain present in the existing public consumer; no production source is changed',async()=>{
  const source=await readFile(new URL('../../../js/bloodmoon.js',import.meta.url),'utf8');
  for(const field of ['myFactionRun','myFaction','myContribution','raidInstanceId','currentWave','attemptsLeft','dailyCap','cooldownLeftSec','totalDamage','hpMax'])assert(source.includes(field),field);
  assert(source.includes('run_id: commandId'));
  const f=fixture(),r=readLegacyState(f.state,f.trusted);assert.equal(r.hp,7300);assert.equal(r.hpMax,10000);assert.equal(r.wave,1);
  assert.equal(r.totalDamage,120);assert.equal(r.revision,7);
});

test('all three profiles replay against frozen solo snapshots with partial raid HP and zero economic writes',()=>{
  for(const profile of Object.keys(P3_PROFILES)){
    const f=session(profile,{reaction:.45,misses:[4,13]}),r=validatePreview(f.issued,f);assert(r.ok,JSON.stringify(r));
    assert.equal(r.receipt.status,'won');assert.equal(r.receipt.normalizedEncounterDamage,1000);
    assert.equal(r.receipt.sharedHpDelta,0);assert.equal(r.receipt.attemptsConsumed,0);assert.equal(r.receipt.cooldownWritten,false);
    assert.equal(r.receipt.contribution,0);assert.deepEqual(r.receipt.rewards,[]);assert.equal(r.receipt.productionReady,false);
    assert.deepEqual(f.state,f.before.state);assert.deepEqual(f.trusted,f.before.trusted);
    const again=validatePreview(f.issued,f);assert.deepEqual(again,r); // deterministic, NOT a transaction/idempotency implementation
  }
});

test('attempt, cooldown, faction, missing/cleared wave and unsupported later waves fail closed',()=>{
  const mutations=[
    [f=>f.state.myContribution.attemptsLeft=0,'NO_ATTEMPTS'],[f=>f.state.myContribution.cooldownLeftSec=1,'COOLDOWN'],
    [f=>f.state.myFaction='other','INVALID_CONTEXT'],[f=>delete f.state.myFactionRun,'INVALID_FACTION_WAVE'],
    [f=>f.state.myFactionRun.waves['1'].hp=0,'WAVE_CLEARED'],[f=>f.trusted.revision=-1,'INVALID_CONTEXT'],
    [f=>f.state.myContribution.attemptsLeft=6,'INVALID_PARTICIPATION'],[f=>f.state.myContribution.cooldownLeftSec=NaN,'INVALID_PARTICIPATION'],
    [f=>{f.state.myFactionRun.currentWave=2;f.state.myFactionRun.waves['2']={hp:200,hpMax:200};},'UNSUPPORTED_ENCOUNTER']
  ];
  for(const [mutate,reason] of mutations){const f=fixture();mutate(f);assert.equal(issuePreview({...f,resolved:P3_PROFILES.fresh.resolved,seed:1,run_id:'x',now:1000}).reason,reason);}
});

test('mid-run raid/participant changes invalidate the snapshot rather than accepting stale faction credit',()=>{
  const f=session();
  for(const mutate of [
    x=>x.state.raidInstanceId='new-raid',x=>x.state.myFactionRun.waves['1'].hp--,x=>x.state.myFactionRun.waves['1'].hpMax++,
    x=>x.trusted.revision++,x=>x.state.myContribution.attemptsLeft--,x=>x.state.myContribution.cooldownLeftSec=60,x=>x.state.myContribution.totalDamage++
  ]){const live=structuredClone(f);mutate(live);assert.equal(validatePreview(f.issued,live).reason,'STALE_SNAPSHOT');}
  assert.equal(validatePreview(f.issued,{...f,trusted:{...f.trusted,owner:'other'}}).reason,'INVALID_OWNER');
});

test('result/parameter injection, fabricated timing, trace tampering, padding and replay suffixes cannot produce credit',()=>{
  const f=session();
  for(const extra of [{damage:999},{parameters:f.issued.parameters},{status:'won'},{attemptsConsumed:0},{seed:1}])assert.equal(validatePreview(f.issued,{...f,submission:{...f.submission,...extra}}).reason,'INVALID_SUBMISSION');
  assert.equal(validatePreview(f.issued,{...f,now:1000}).reason,'IMPOSSIBLE_ELAPSED_TIME');
  assert.equal(validatePreview(f.issued,{...f,now:1121}).reason,'EXPIRED');
  for(const p of [{tick:0,x:NaN,y:0},{tick:0,x:2,y:0},{tick:-1,x:0,y:0},{tick:0,x:0,y:0,damage:999}])assert.equal(validatePreview(f.issued,{...f,submission:{...f.submission,trace:[p]}}).reason,'INVALID_TRACE');
  assert.equal(validatePreview(f.issued,{...f,submission:{...f.submission,ticks:f.g.tick+1}}).reason,'INCOMPLETE_OR_PADDED_RESULT');
  const suffix=[...f.submission.trace,{tick:f.g.tick,x:1,y:0}];assert.equal(validatePreview(f.issued,{...f,submission:{...f.submission,trace:suffix}}).reason,'NONCANONICAL_TRACE');
  const tampered=structuredClone(f.submission);tampered.trace=[];assert(!validatePreview(f.issued,{...f,submission:tampered}).ok);
});

test('valid defeats are retained, never promoted or awarded; concurrent preview calls cannot mutate supplied state',async()=>{
  const f=session('fresh',{idle:true});
  const results=await Promise.all(Array.from({length:4},async()=>validatePreview(f.issued,f)));
  assert(results.every(r=>r.ok&&r.receipt.status==='lost'&&r.receipt.sharedHpDelta===0&&r.receipt.contribution===0));
  assert.deepEqual(f.state,f.before.state);
});
