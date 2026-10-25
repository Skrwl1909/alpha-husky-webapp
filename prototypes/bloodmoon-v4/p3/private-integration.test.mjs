// Optional owner adapter only. No backend source/formula is shipped in this tree.
import {access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {combatParameters} from '../combat-parameters.js';
import {P3_PROFILES,lastStandParameters} from './balance.js';
import {drive} from './driver.mjs';
const path=process.env.BLOODMOON_PRIVATE_ADAPTER?resolve(process.env.BLOODMOON_PRIVATE_ADAPTER):fileURLToPath(new URL('./.private/adapter.mjs',import.meta.url));
try{await access(path);}catch{console.error('NOT AVAILABLE: owner-provisioned ignored adapter required; zero private integration tests ran.');process.exit(2);}
const adapter=await import(pathToFileURL(path).href);
test('owner adapter verifies source resolution before the separate Last Stand policy is applied',async()=>{
  const verification=await adapter.verifySources();assert.equal(verification.ok,true);assert(verification.tests>0);
  for(const id of Object.keys(P3_PROFILES)){
    const result=id==='fresh'?await adapter.resolveFreshProfile():await adapter.resolveProfile(id);
    const resolved=combatParameters(result.parameters);
    assert.deepEqual(resolved.player,P3_PROFILES[id].resolved.player);assert.deepEqual(resolved.enemy,P3_PROFILES[id].resolved.enemy);
    const g=drive(lastStandParameters(resolved),1909,{reaction:.45,margin:44,misses:[4,13]}).game;
    assert.equal(g.status,'won');assert(g.time>=45&&g.time<=75);assert(g.player.hp>0);
    console.log(`PASS privately resolved ${id}: bounded Last Stand victory; no account or economic writes`);
  }
});
