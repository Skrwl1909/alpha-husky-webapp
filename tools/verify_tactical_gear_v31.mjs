import assert from "node:assert/strict";
import { createServer } from "vite";
globalThis.window={ location:{search:""}, localStorage:{getItem:()=>null,setItem:()=>{}}};
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{
 const [{parseCombatProfileV3,applyRunCombatProfile},{applyGearOffense,applyGearGuard},{recoverSpawnsForSquad},{createBattle}] = await Promise.all([
  server.ssrLoadModule("/tactical-ops-src/combat/combatProfileV3.ts"),
  server.ssrLoadModule("/tactical-ops-src/combat/gearImpactV31.ts"),
  server.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
  server.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
 ]);
 const alpha={hp:120,atk:29,def:12,spd:14};
 const v2={version:2,mode:"inputs-only",alpha:{level:1,base:{strength:0,agility:0,defense:0,vitality:0,intelligence:0,luck:0},gear:{strength:2,agility:0,defense:0,vitality:0,intelligence:0,luck:0}},pet:null};
 const legacy=parseCombatProfileV3({version:3,mode:"battle-v1",alpha,pet:null});
 assert(!("gearImpactV31" in legacy));
 const newer=parseCombatProfileV3({version:3,mode:"battle-v1",alpha,pet:null,gearImpactV31:{offense:2,guard:0}});
 assert.equal(newer.gearImpactV31.offense,2);
 for(const bad of [{offense:2,guard:Infinity},{offense:-1,guard:0},{offense:20001,guard:0},{offense:"2",guard:0},{offense:2,guard:0,extra:1}]){
  assert.throws(()=>parseCombatProfileV3({version:3,mode:"battle-v1",alpha,pet:null,gearImpactV31:bad}),/invalid_combat_profile_v3/);
 }
 const spawns=recoverSpawnsForSquad(["alpha","ally-02"]);
 const battle=createBattle(null,applyRunCombatProfile(spawns,newer,v2));
 const actor=battle.units.find(u=>u.defId==="alpha");
 assert.deepEqual(actor.gearImpactV31,{offense:2,guard:0});
 const older=createBattle(null,applyRunCombatProfile(spawns,legacy,v2)).units.find(u=>u.defId==="alpha");
 assert.equal(older.gearImpactV31,undefined);
 let low=0,high=0;
 for(const score of [2,3,40,150,4000]){
  let accumulated=0,carry=0;const unit={...actor,gearImpactV31:{offense:score,guard:0}};
  for(let hit=0;hit<1000;hit++){
   const r=applyGearOffense(26,{...unit,gearOffenseCarryV31:carry});
   accumulated+=r.bonus;carry=r.carry;
   assert(r.damage>=26&&r.damage<=31);
  }
  assert(accumulated>=low);low=accumulated;
  if(score===2)high=accumulated;
  if(score===3)assert(accumulated>high,"Forge +1 must change actual 1000-hit damage");
 }
 const guard={...actor,gearImpactV31:{offense:0,guard:50}};
 let totalSaved=0,carry=0;
 for(let h=0;h<300;h++){
  const r=applyGearGuard(30,{...guard,gearGuardCarryV31:carry});
  totalSaved+=r.saved;carry=r.carry;
  assert(r.damage>=1&&r.damage<=30);
 }
 assert(totalSaved>0,"Guard gear changes incoming real damage");
 assert.equal(applyGearOffense(26,older).damage,26);
 assert.equal(applyGearGuard(30,older).damage,30);
 console.log("PASS Gear Impact V3.1: strict server profile, legacy and pet neutrality, actual accumulated hits, caps, defense");
}finally{await server.close()}