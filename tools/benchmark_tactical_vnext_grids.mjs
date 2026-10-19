#!/usr/bin/env node
/** Comparable geometric benchmark, NOT a VNext battle outcome or duration claim. */
import assert from "node:assert/strict";
import {createServer} from "vite";
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{
 const [geo,ops,units]=await Promise.all([
 vite.ssrLoadModule("/tactical-ops-src/combat/battlefieldTopology.ts"),
 vite.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
 vite.ssrLoadModule("/tactical-ops-src/data/units.ts")]);
 const baseline={cols:8,rows:5},records=[];
 const missions=Object.values(ops.MISSION_DEFS);
 assert.equal(missions.length,12);
 for(const mission of missions){
  const enemies=(mission.spawns??[]).filter(s=>(s.unitDef?.team??units.UNIT_DEFS[s.defId]?.team)==="enemy");
  const allies=(mission.spawns??[]).filter(s=>(s.unitDef?.team??units.UNIT_DEFS[s.defId]?.team)==="ally");
  const anchor=allies[0]??{c:0,r:2};
  const objective=ops.missionBattleRules(mission).objective;
  for(const grid of geo.CANDIDATE_GRIDS){
   const start=geo.scaleCell(anchor,baseline,grid);
   const targets=enemies.map(s=>geo.scaleCell(s,baseline,grid));
   const exits=objective?.type==="INTERCEPT"?[geo.scaleCell(objective.exit,baseline,grid)]:[];
   const steps=targets.map(t=>geo.shortestPath(grid,start,t));
   const contact=targets.map(t=>geo.earliestAttackAction(grid,start,t,2,1));
   const exitSteps=exits.map(t=>geo.shortestPath(grid,start,t));
   const rec={mission:mission.missionId,grid:grid.cols+"x"+grid.rows,enemyCount:targets.length,
    closestEnemySteps:steps.length?Math.min(...steps.filter(x=>x!==null)):null,
    firstContactActions:contact.length?Math.min(...contact.filter(x=>x!==null)):null,
    exitDistance:exitSteps[0]??null,
    boardCells:grid.cols*grid.rows};
   records.push(rec);
  }
 }
 assert.equal(records.length,36);
 for(const g of geo.CANDIDATE_GRIDS){
  assert.equal(geo.reachable(g,{c:0,r:0},1).length,2);
  assert.equal(geo.shortestPath(g,{c:0,r:0},{c:g.cols-1,r:g.rows-1}),g.cols+g.rows-2);
  assert.equal(geo.shortestPath(g,{c:0,r:0},{c:1,r:0},[{c:1,r:0}]),null);
 }
 for(const m of missions){
  const r=records.filter(x=>x.mission===m.missionId);
  assert.equal(r.length,3);
  assert(r.every(x=>x.firstContactActions===null||x.firstContactActions>=0));
 }
 console.log(JSON.stringify({schema:"tactical-grid-benchmark.v1",method:"spawn anchors scaled proportionally; first allied unit vs enemy spawn; move 2, attack 1; geometry only",records},null,2));
 console.log("TACTICAL_VNEXT_GRID_BENCHMARK_PASS");
}finally{await vite.close();}
