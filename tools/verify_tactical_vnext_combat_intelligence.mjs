#!/usr/bin/env node
/** Actual 10x7 real-engine enemy-class + reaction smoke, no server writes.
 * CI proves deterministic legality, not human balance or mobile duration. */
import assert from "node:assert/strict";
globalThis.window = { location:{search:"?tacticalBattlefieldVNext=1"}, localStorage:{getItem:()=>null} };
const {createServer} = await import("vite");
const vite = await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const [types, ops, battle, ai, move, defs, archetypes, skills, intent, scheduler] = await Promise.all([
  vite.ssrLoadModule("/tactical-ops-src/combat/types.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/ai.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/movement.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/units.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/enemyArchetypes.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/skills.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/intentContract.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/intentScheduler.ts"),
 ]);
 assert.equal(types.GRID_COLS,10); assert.equal(types.GRID_ROWS,7);
 assert.equal(intent.TACTICAL_VNEXT_ENABLED,true);
 const seen = new Set(), report = [];
 for (const mission of Object.values(ops.MISSION_DEFS)) {
  const rules=ops.missionBattleRules(mission);
  let spawns=mission.spawns||[];
  if(!spawns.some(x=>(x.unitDef?.team??defs.UNIT_DEFS[x.defId]?.team)==="ally")){
   const allies=[{defId:"alpha",id:"alpha",c:0,r:2},{defId:"ally-02",id:"ally-02",c:1,r:0},{defId:"ally-03",id:"ally-03",c:1,r:4}].slice(0,mission.squadCap);
   spawns=[...allies,...spawns];
  }
  let state=battle.createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
  for(const u of state.units){
   assert(move.inBounds(u.c,u.r),mission.missionId+": out of bounds");
   if(u.team==="enemy"){
    assert(u.archetype,mission.missionId+": unclassified enemy");
    seen.add(u.archetype);
    for(const sid of u.skillIds)assert(skills.SKILLS[sid],mission.missionId+": missing "+sid);
   }
  }
  for(let t=0;t<18&&state.outcome==="ongoing";t++){
   state=battle.advanceToNext(state).state;
   const actor=state.units.find(u=>u.id===state.activeId);
   if(!actor)break;
   if(actor.team==="ally"){state=battle.trySkip(state).state;continue;}
   const action=ai.chooseAiAction(state);
   assert(ai.aiUsesLegalRules(state,action),mission.missionId+": illegal "+JSON.stringify(action));
   state=battle.applyAi(state,action).state;
   assert(state.units.every(u=>move.inBounds(u.c,u.r)),mission.missionId+": move off grid");
  }
  report.push({mission:mission.missionId,enemyTypes:[...new Set(state.units.filter(u=>u.team==="enemy").map(u=>u.archetype))].sort()});
 }
 assert.equal(report.length,12);
 // Reinforcement shares precisely the same archetype assignment logic.
 seen.add(archetypes.identifyEnemyArchetype({id:"field-reinforcement",defId:"hostile",role:"hostile",team:"enemy"}));
 assert.deepEqual([...seen].sort(),["BULWARK","COMMANDER","COURIER","DISRUPTOR","MARKSMAN","SKIRMISHER"]);
 for(const id of ["hound-fortify","hound-pulse","hound-aim","hound-interference"])assert(skills.SKILLS[id]);
 const squad=[
  {defId:"alpha",id:"alpha",c:0,r:2},{defId:"ally-02",id:"ally-02",c:1,r:0},{defId:"ally-03",id:"ally-03",c:1,r:4},
  {defId:"hostile",id:"h2",c:5,r:2},
 ];
 let combat=battle.createBattle(null,squad);
 let announced=0;
 for(let t=0;t<35&&combat.outcome==="ongoing";t++){
  combat=battle.advanceToNext(combat).state;
  const actor=combat.units.find(u=>u.id===combat.activeId);
  if(!actor)break;
  if(actor.team==="ally"){combat=battle.trySkip(combat).state;continue;}
  const cycle=scheduler.queueEnemyThreat(scheduler.emptyThreatCycle(),combat);
  if(cycle.pending.length){
   const plan=cycle.pending[0].plan;
   assert(plan.impactTiles.length>=1);
   assert(plan.warnsOnUnitTurn===combat.unitTurn);
   assert(plan.resolvesOnUnitTurn>plan.warnsOnUnitTurn);
   announced++;break;
  }
  combat=battle.applyAi(combat,ai.chooseAiAction(combat)).state;
 }
 assert(announced>0,"at least one genuine allied reaction window must produce a warning");
 console.log(JSON.stringify({schema:"tactical-combat-intelligence.v1",missions:report,archetypes:[...seen].sort(),announced},null,2));
 console.log("TACTICAL_VNEXT_COMBAT_INTELLIGENCE_LAB_PASS");
} finally { await vite.close(); }
