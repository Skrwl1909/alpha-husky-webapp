import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createServer} from "vite";
const manifest=JSON.parse(readFileSync("images/tactical_ops/combat_fx/v1/tactical_fx_manifest.json","utf8"));
assert.equal(Object.keys(manifest.animations).length,17);
assert.deepEqual([manifest.geometry.columns,manifest.geometry.rows,manifest.geometry.frames],[4,3,12]);
for(const name of Object.keys(manifest.animations)){
  const entry=manifest.animations[name];
  assert(existsSync("images/tactical_ops/combat_fx/v1/"+entry.file),name+" missing atlas");
  assert.equal(entry.frameCount,12);
}
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
const mod=await vite.ssrLoadModule("/tactical-ops-src/ui/combatFxAtlas.ts");
const u=(defId,extra={})=>({id:defId,defId,c:0,r:0,role:"alpha",...extra});
const damage=[{type:"damage",unitId:"enemy",amount:4,text:"-4"}];
const s=(type,unitId="enemy")=>({type:"status",unitId,text:type,kind:type==="GUARD"?"guard":"status"});
assert.equal(mod.spriteEvents(u("alpha"),"alpha-strike",damage,1,false)[0].name,"alpha_strike");
assert.equal(mod.spriteEvents(u("alpha"),"alpha-rend",damage,1,false)[0].name,"alpha_rend");
assert.equal(mod.spriteEvents(u("alpha"),"alpha-howl",[s("ATK UP","alpha"),s("SPD UP","alpha")],1,false)[0].name,"alpha_howl");
assert.equal(mod.spriteEvents(u("alpha"),"alpha-howl",[s("GUARD","alpha")],1,false)[0].name,"alpha_guard");
assert.equal(mod.spriteEvents(u("ally-02"),"u02-shot",damage,1,false)[0].name,"cnc_thrust");
assert.equal(mod.spriteEvents(u("ally-02"),"u02-burst",damage,1,false)[0].name,"cnc_lunge");
assert.deepEqual(mod.spriteEvents(u("ally-02"),"u02-suppress",[s("ATK DOWN")],1,false).map(x=>x.name),["cnc_pressure"]);
assert.deepEqual(mod.spriteEvents(u("ally-02"),"u02-suppress",[s("ATK DOWN")],1,true).map(x=>x.name),["cnc_pressure","cnc_interrupt"]);
assert.equal(mod.spriteEvents(u("ally-03"),"u03-tap",damage,1,false)[0].name,"shadow_sweep");
assert.equal(mod.spriteEvents(u("ally-03"),"u03-mend",[{type:"heal",unitId:"ally",amount:12}],1,false)[0].name,"shadow_mend");
assert.deepEqual(mod.spriteEvents(u("ally-03"),"u03-pack",[{type:"heal",unitId:"ally",amount:5},s("DEF UP","ally")],1,false).map(x=>x.name),["shadow_pack_heal_def"]);
assert.deepEqual(mod.spriteEvents(u("ally-03"),"u03-pack",[s("DEF UP","ally")],1,false).map(x=>x.name),["shadow_pack_def_only"]);
assert.equal(mod.spriteEvents(u("ally-03"),"u03-pack",[s("GUARD","ally")],1,false)[0].name,"shadow_pack_guard");
assert.equal(mod.spriteEvents(u("pet:p1"),"pet-bite",damage,1,false)[0].name,"pet_bite");
assert.equal(mod.spriteEvents(u("pet:p1"),"pet-hamstring",[s("SPD DOWN")],1,false)[0].name,"pet_hamstring");
const pet=u("pet:p1",{role:"companion",combatMastery:{stage:3,selected:"B",progress:8}});
assert.equal(mod.pathfinderFx(pet,{...pet,c:5},1)[0].name,"pet_pathfinder");
assert.equal(mod.pathfinderFx(pet,{...pet,c:4},1).length,0);
assert.equal(mod.pathfinderFx(u("pet:p1"),{...pet,c:5},1).length,0);
assert.equal(mod.spriteEvents(u("ally-03"),"u03-mend",[],1,false).length,0);
assert.equal(mod.spriteEvents(u("ally-03"),"u03-pack",[s("DEF UP")],1,false).some(x=>x.name==="shadow_pack_heal_def"),false);
const store=readFileSync("tactical-ops-src/store/battleStore.ts","utf8");
const css=readFileSync("tactical-ops-src/tactical.css","utf8");
assert(store.includes('publishFx([fx("objective_recover"'),"recover only after tryRecover.ok");
assert(css.includes("@keyframes t-fx-atlas")&&css.includes("prefers-reduced-motion:reduce"));
console.log("PASS Tactical Combat FX: 17 atlases and actual event-gated bindings");
} finally {await vite.close();}
