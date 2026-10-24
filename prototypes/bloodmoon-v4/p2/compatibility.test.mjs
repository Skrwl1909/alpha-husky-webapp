import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {replay} from '../simulation.js';
test('compact historical V1/V2/V3 traces preserve original event digests, HP, timing and outcome',async()=>{
  const fixtures=JSON.parse(await readFile(new URL('./compatibility-fixtures.json',import.meta.url),'utf8'));
  assert.deepEqual(fixtures.map(f=>f.version),[1,2,3]);
  for(const f of fixtures){
    const record={version:f.version,seed:f.seed,tuning:f.tuning,parameters:f.parameters,ticks:f.ticks,trace:f.trace.map(([tick,x,y])=>({tick,x,y}))},g=replay(record);
    assert.equal(g.status,f.expected.status);assert.equal(g.tick,f.ticks);assert.equal(g.player.hp,f.expected.playerHP);assert.equal(g.boss.hp,f.expected.bossHP);assert.equal(g.events.length,f.expected.eventCount);
    const canonical=JSON.stringify(g.events.map(e=>Object.fromEntries(f.expected.eventKeys.filter(k=>k in e).map(k=>[k,e[k]]))));
    assert.equal(createHash('sha256').update(canonical).digest('hex'),f.expected.eventSha256);
    assert.deepEqual(replay(JSON.parse(JSON.stringify(g.recording()))).events,g.events);
    console.log(`V${f.version}: ${g.time.toFixed(2)}s, ${g.events.length} original events matched`);
  }
});
