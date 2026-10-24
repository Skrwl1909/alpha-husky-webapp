import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {replay} from '../simulation.js';
test('historical real V1/V2/V3 recordings retain exact timing, damage, movement and outcome',async()=>{
  for(const version of [1,2,3]){
    const old=JSON.parse(await readFile(new URL(`./recordings/v${version}.json`,import.meta.url),'utf8'));
    assert.equal(old.recording.version,version);const g=replay(old.recording);
    assert.equal(g.status,'won');assert.equal(g.tick,old.recording.ticks);assert.equal(g.boss.hp,0);
    // Later versions added descriptive damage/pressure metadata. Compare every
    // original event field, including the original timing and resolved HP.
    assert.equal(g.events.length,old.events.length);
    for(let i=0;i<old.events.length;i++)for(const [key,value] of Object.entries(old.events[i]))assert.deepEqual(g.events[i][key],value,`version ${version}, event ${i}, ${key}`);
    const again=replay(JSON.parse(JSON.stringify(g.recording())));assert.deepEqual(again.events,g.events);assert.deepEqual(again.player,g.player);
    console.log(`V${version}: ${g.time.toFixed(2)}s, ${g.player.hp} HP, ${g.events.length} events preserved`);
  }
});
