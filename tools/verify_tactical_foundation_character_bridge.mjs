import assert from "node:assert/strict";
import {createServer} from "vite";

const vite=await createServer({configFile:false,server:{middlewareMode:true}});
const previousWindow=globalThis.window;
try {
 const {loadFoundationProgression}=await vite.ssrLoadModule("/tactical-ops-src/host/foundationProgression.ts");
 const {applyFoundationCombatProfile}=await vite.ssrLoadModule("/tactical-ops-src/combat/combatProfileV3.ts");
 const stats={strength:0,agility:0,defense:0,vitality:0,intelligence:0,luck:0};
 const v2={version:2,mode:"inputs-only",alpha:{level:187,base:{...stats,vitality:100},gear:{...stats}},pet:null};
 const v3={version:3,mode:"battle-v1",alpha:{hp:128,atk:28,def:12,spd:14},pet:null};
 const contract={rulesetVersion:"tactical-intent-vnext.0",missionId:"foundation-solo-1",
   missionRevision:1,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1,source:"BACKEND_SNAPSHOT"};
 const original={version:1,foundationStage:"solo-1",completed:false,revision:9,
   activeRunId:"foundation-frozen",lastCompletedRunId:null,updatedAt:1000,
   foundationRunRules:{runId:"foundation-frozen",rulesContract:contract},
   activeCombatProfileV2:v2,activeCombatProfileV3:v3};
 const spawns=[{id:"alpha",defId:"alpha",c:2,r:2},{id:"enemy-1",defId:"enemy_grunt",c:6,r:2}];
 async function load(data){globalThis.window={apiPost:async()=>({ok:true,data})};return loadFoundationProgression();}
 const frozen=await load(original);
 assert.deepEqual(frozen.activeCombatProfileV3,v3);
 const deployed=applyFoundationCombatProfile(spawns,frozen);
 assert.equal(deployed[0].unitDef.hp,128,"frozen V3 applied at Foundation spawn");
 assert.equal(deployed[0].unitDef.atk,28);
 assert.deepEqual(deployed[1],spawns[1],"enemy unchanged");
 assert.deepEqual(spawns[0],{id:"alpha",defId:"alpha",c:2,r:2},"authored spawn unchanged");
 const {activeCombatProfileV3: _absentV3, ...olderVnext} = original;
 assert.deepEqual(applyFoundationCombatProfile(spawns,await load(olderVnext)),spawns,"older VNext Foundation lacks V3 and stays authored");
 const {foundationRunRules: _absentContract, ...old} = olderVnext;
 assert.deepEqual(applyFoundationCombatProfile(spawns,await load(old)),spawns,"legacy Foundation untouched");
 await assert.rejects(load({...original,activeCombatProfileV2:undefined}),/invalid_progression_response/);
 await assert.rejects(load({...original,foundationRunRules:{runId:"different-run",rulesContract:contract}}),/invalid_progression_response/);
 await assert.rejects(load({...original,activeCombatProfileV3:{...v3,alpha:{...v3.alpha,hp:900}}}),/invalid_progression_response/);
 const afterReload=await load(structuredClone(original));
 assert.equal(applyFoundationCombatProfile(spawns,afterReload)[0].unitDef.hp,128,"resume uses frozen HP");
 console.log("PASS Foundation character bridge: accepted V3, legacy compatibility, exact run binding, malformed rejection, reload");
} finally {if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;await vite.close();}
