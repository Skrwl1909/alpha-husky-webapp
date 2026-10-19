#!/usr/bin/env node
/** Preview mode smoke: run with simulated browser URL before SSR module imports. */
import assert from "node:assert/strict";
globalThis.window={location:{search:"?tacticalBattlefieldVNext=1"}};
const {createServer}=await import("vite");
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{
 const [types,ops,battle,movement]=await Promise.all([
 vite.ssrLoadModule("/tactical-ops-src/combat/types.ts"),
 vite.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
 vite.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
 vite.ssrLoadModule("/tactical-ops-src/combat/movement.ts")]);
 assert.equal(types.GRID_COLS,10);assert.equal(types.GRID_ROWS,7);
 for(const m of Object.values(ops.MISSION_DEFS)){
  const rules=ops.missionBattleRules(m);
  const spawns=m.spawns??[];
  const state=battle.createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
  for(const u of state.units)assert(movement.inBounds(u.c,u.r),m.missionId+" unit out of bounds");
  const coords=state.units.map(u=>u.c+","+u.r);
  assert.equal(new Set(coords).size,coords.length,m.missionId+" collision");
  const o=state.objective;
  if(o?.type==="INTERCEPT")assert(movement.inBounds(o.exit.c,o.exit.r));
  if(o&&(o.type==="RECOVER"||o.type==="HOLD")&&o.terminal)assert(movement.inBounds(o.terminal.c,o.terminal.r));
 }
 console.log("TACTICAL_BATTLEFIELD_10X7_PREVIEW_SMOKE_PASS");
}finally{await vite.close();}
