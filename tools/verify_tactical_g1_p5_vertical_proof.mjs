#!/usr/bin/env node
/** Combined current-main release boundary for meaningful builds + battlefield decisions.
 * Existing dedicated suites remain authorities; this gate guarantees both run together.
 * It does not activate server Growth V2 nor replace private auth/device testing. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const growth=read('tactical-ops-src/data/playerGrowth.ts');
const battle=read('tactical-ops-src/ui/Battle.tsx');
const p5=read('tactical-ops-src/ui/battlePresentation.ts');
const host=read('tactical-ops-src/host/foundationProgression.ts');
assert(growth.includes('rulesVersion'),'V1/V2 growth separation must survive');
assert(growth.includes('u03-mend'),'meaningful rescue repair remains present');
assert(battle.includes('deriveBattlePresentation'),'canonical Battle must use the P5 decision director');
assert(p5.includes('deriveBattlePresentation'),'P5 decision director is missing');
assert(host.includes('parseGrowthProgression'),'canonical backend Growth V2 must be parsed');
const run=(name,script)=>{
  const result=spawnSync(process.execPath,[script],{encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});
  if(result.stdout)process.stdout.write(result.stdout);
  if(result.stderr)process.stderr.write(result.stderr);
  assert.equal(result.status,0,name+' must PASS against the same current source and accepted-run semantics');
};
run('G1 meaningful combat deltas','tools/verify_tactical_g1_fieldcraft.mjs');
run('P5 battlefield decision and targeting','tools/verify_tactical_battlefield_p5.mjs');
run('G1 transaction truth','tools/verify_tactical_g1_transactions.mjs');
run('VNext accepted-run wire','tools/verify_tactical_vnext_run_contract_wire.mjs');
console.log('PASS: combined G1+P5 current-main gameplay gate, no global V2 flip');
