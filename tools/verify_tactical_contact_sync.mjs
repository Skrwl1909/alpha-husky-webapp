import assert from "node:assert/strict";
import { createServer } from "vite";
import { readFileSync } from "node:fs";
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{
 const mod=await vite.ssrLoadModule("/tactical-ops-src/ui/combatFxAtlas.ts");
 const fx=(name)=>({name,durationMs:({alpha_strike:540,alpha_rend:680,cnc_thrust:500,pet_bite:500,alpha_howl:820,shadow_mend:760})[name]});
 assert.equal(mod.combatFxContactMs([fx("alpha_strike")]),200);
 assert.equal(mod.combatFxContactMs([fx("alpha_rend")]),252);
 assert.equal(mod.combatFxContactMs([fx("cnc_thrust")]),230);
 assert.equal(mod.combatFxContactMs([fx("pet_bite")]),185);
 assert.equal(mod.combatFxContactMs([fx("alpha_howl")]),0);
 assert.equal(mod.combatFxContactMs([fx("shadow_mend")]),0);
 assert.equal(mod.combatFxContactMs([]),0);
 const s=readFileSync("tactical-ops-src/store/battleStore.ts","utf8");
 assert.equal((s.match(/if \(!\(await waitForContact\(effects,g\)\)\) return;/g)||[]).length,2);
 assert(s.includes("g === runGen"),"generation cancellation required");
 assert(s.includes("publishFx(effects,g)"),"travel starts before contact");
 console.log("PASS: S4 physical contact aligned; support immediate; cancelled generations ignored");
}finally{await vite.close()}
