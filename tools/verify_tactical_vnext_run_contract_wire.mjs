import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createServer} from "vite";
const foundation=readFileSync("tactical-ops-src/host/foundationProgression.ts","utf8");
assert(foundation.includes("parseRunRulesContract(value.runRulesContract)"),"mission-start response must parse backend rules");
assert(foundation.includes("parseRunRulesContract(activeValue.runRulesContract)"),"persisted active run must parse backend rules");
assert(foundation.includes("contract.missionId !== activeValue.missionId"),"persisted run mismatch rejected");
assert(foundation.includes('rulesContract.missionId !== value.missionId'),"mission start mismatch rejected");
assert(foundation.includes('...(contract ? { runRulesContract: contract } : {})'),"accepted snapshot frozen");
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const intent=await vite.ssrLoadModule("/tactical-ops-src/combat/intentContract.ts");
 const run={rulesetVersion:"tactical-intent-vnext.0",missionId:"field-relay-hold",missionRevision:1,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1,source:"BACKEND_SNAPSHOT"};
 assert(Object.isFrozen(intent.parseRunRulesContract(run)));
 assert.equal(intent.parseRunRulesContract(null),null,"legacy run stays legacy");
 assert.throws(()=>intent.parseRunRulesContract({...run,source:"CLIENT"}),/unsupported/);
 assert.throws(()=>intent.parseRunRulesContract({...run,extra:true}),/invalid/);
 assert.equal(intent.TACTICAL_VNEXT_ENABLED,false,"official mode must not be enabled without backend gate");
 console.log("PASS: VNext run contract wire strict, legacy preserved, no unsafe live flip");
} finally {await vite.close();}
