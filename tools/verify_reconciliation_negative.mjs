import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for(const path of ['tactical-ops-src/host/operationAuthority.ts','js/tactical_ops.js']){
 const held=readFileSync(path);
 try{
  writeFileSync(path,Buffer.concat([held,Buffer.from('\n/* synthetic negative provenance check */\n')]));
  const r=spawnSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{encoding:'utf8'});
  assert.notEqual(r.status,0,'unreviewed mutation accepted: '+path);
 }finally{writeFileSync(path,held);}
}
const path='tools/reconciliation-untracked-negative.tmp';
try{
 writeFileSync(path,'synthetic');
 const r=spawnSync(process.execPath,['tools/verify_tactical_premium_integration.mjs'],{encoding:'utf8'});
 assert.notEqual(r.status,0,'untracked release input accepted');
}finally{unlinkSync(path);}
console.log('PASS reconciliation rejects changed runtime, changed authority source and untracked release input');
