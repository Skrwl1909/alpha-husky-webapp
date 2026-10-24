// Developer-only adapter protocol. No private implementation is included here.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {DEMO_SCENARIOS} from './demo-profiles.js';
import {PreviewAuthority} from './preview-authority.mjs';
import {drive} from './driver.mjs';
const adapterPath=process.env.BLOODMOON_PRIVATE_ADAPTER?resolve(process.env.BLOODMOON_PRIVATE_ADAPTER):fileURLToPath(new URL('./.private/adapter.mjs',import.meta.url));
try{await access(adapterPath);}catch{console.error('NOT AVAILABLE: owner-provided local private adapter is required; no integration tests ran.');process.exit(2);}
const adapter=await import(pathToFileURL(adapterPath).href);
test('private developer source checks pass, independently of public fixture tests',async()=>{
  const result=await adapter.verifySources();assert.equal(result.ok,true);assert(result.tests>0);
});
test('locally resolved profile values match unchanged public demo tuning and validate without credit',async()=>{
  const numeric=p=>({player:p.player,enemy:p.enemy});let now=1000;
  const authority=new PreviewAuthority({resolveProfile:adapter.resolveProfile,now:()=>now,seed:()=>1909});
  for(const profile of ['baseline','progressed']){
    const resolved=await adapter.resolveProfile(profile);assert.deepEqual(numeric(resolved.parameters),numeric(DEMO_SCENARIOS[profile].parameters));
    const e=await authority.issue('private-test-'+profile,profile);assert(e.ok);const g=drive(e.parameters,e.seed);assert.equal(g.status,'won');now+=g.time;
    const result=await authority.submit('private-test-'+profile,{encounterId:e.encounterId,ticks:g.tick,trace:g.recording().trace});assert(result.ok);assert.equal(result.receipt.contribution,0);assert.deepEqual(result.receipt.rewards,[]);
  }
});
test('private fresh zero-VIT resolution confirms the 50 HP versus 60 hazard risk',async()=>{
  const fresh=await adapter.resolveFreshProfile();assert.equal(fresh.parameters.player.maxHP,50);assert.equal(fresh.parameters.enemy.damagePerHit,60);
  assert(fresh.parameters.player.maxHP<fresh.parameters.enemy.damagePerHit);
  console.log(`Fresh private fixture: ${fresh.parameters.player.maxHP} HP, ${fresh.parameters.player.damagePerHit} damage/hit; hazard remains ${fresh.parameters.enemy.damagePerHit}.`);
});
