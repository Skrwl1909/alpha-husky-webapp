#!/usr/bin/env node
/** Read-only baseline. No gameplay, reward, or backend writes. */
import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({ configFile:false, server:{middlewareMode:true,hmr:false},appType:"custom" });
try {
 const [operations,types,contracts,units] = await Promise.all([
  server.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
  server.ssrLoadModule("/tactical-ops-src/combat/types.ts"),
  server.ssrLoadModule("/tactical-ops-src/data/missionContracts.ts"),
  server.ssrLoadModule("/tactical-ops-src/data/units.ts")
 ]);
 const ids=Object.keys(operations.MISSION_DEFS).sort();
 assert.equal(ids.length,12,"exactly 12 canonical missions");
 assert.equal(types.GRID_COLS,8);assert.equal(types.GRID_ROWS,5);
 const report={schema:"tactical-baseline.v1",grid:{cols:types.GRID_COLS,rows:types.GRID_ROWS,cells:types.GRID_COLS*types.GRID_ROWS},missions:[]};
 const inside=(p)=>Number.isInteger(p.c)&&Number.isInteger(p.r)&&p.c>=0&&p.c<types.GRID_COLS&&p.r>=0&&p.r<types.GRID_ROWS;
 for(const id of ids){
  const m=operations.MISSION_DEFS[id],rules=operations.missionBattleRules(m);
  assert.equal(m.executable,true,id);
  assert(m.squadCap>=1&&m.squadCap<=3,"squad cap: "+id);
  const raw=m.spawns??[];
  for(const s of raw){assert(inside(s),"out-of-bounds spawn "+id+":"+s.id);assert(units.UNIT_DEFS[s.defId]||s.unitDef,"unknown unit "+id+":"+s.defId);}
  const target=rules.objective?.type==="RECOVER"||rules.objective?.type==="HOLD"?rules.objective.terminal:null;
  if(target)assert(inside(target),"objective out of bounds "+id);
  if(rules.objective?.type==="INTERCEPT")assert(inside(rules.objective.exit),"exit out of bounds "+id);
  const enemies=raw.filter(s=>s.unitDef?.team==="enemy"||units.UNIT_DEFS[s.defId]?.team==="enemy");
  report.missions.push({id,family:m.operationId,objectiveType:m.objectiveType,squadCap:m.squadCap,enemyCountDefined:enemies.length,spawnCountDefined:raw.length,objective:rules.objective?.type??"ELIMINATE",reinforcement:!!rules.reinforcement,challenge:m.challenge?.type??null});
 }
 const field=report.missions.filter(m=>m.family==="field-ops");
 assert.equal(field.length,6);assert.equal(report.missions.filter(m=>m.family==="broken-signal").length,3);assert.equal(report.missions.filter(m=>m.family==="dead-relay").length,3);
 assert.equal(contracts.MISSION_CONTRACT_BASELINES&&Object.keys(contracts.MISSION_CONTRACT_BASELINES).length,12);
 console.log(JSON.stringify(report,null,2));
 console.log("TACTICAL_VNEXT_STEP0_STATIC_BASELINE_PASS");
}finally{await server.close();}
