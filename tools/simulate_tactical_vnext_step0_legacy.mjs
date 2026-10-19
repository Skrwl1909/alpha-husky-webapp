#!/usr/bin/env node
/** Deterministic real-engine legacy simulations. No backend writes, no VNext toggle. */
import assert from "node:assert/strict";
import { createServer } from "vite";
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{
 const [ops,battle,ai,move,skills,defs]=await Promise.all([
 vite.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
 vite.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
 vite.ssrLoadModule("/tactical-ops-src/combat/ai.ts"),
 vite.ssrLoadModule("/tactical-ops-src/combat/movement.ts"),
 vite.ssrLoadModule("/tactical-ops-src/combat/skills.ts"),
 vite.ssrLoadModule("/tactical-ops-src/data/units.ts")]);
 const report={schema:"tactical-legacy-autoplay.v1",policy:"greedy A1 / nearest objective; NOT human playtest",turnCap:240,results:[]};
 for(const mission of Object.values(ops.MISSION_DEFS)){
  const rules=ops.missionBattleRules(mission);
  let spawns=mission.spawns;
  if(!spawns||!spawns.some(x=>(x.unitDef?.team??defs.UNIT_DEFS[x.defId]?.team)==="ally")){
    const allies=[{defId:"alpha",id:"alpha",c:0,r:2},{defId:"ally-02",id:"ally-02",c:1,r:0},{defId:"ally-03",id:"ally-03",c:1,r:4}].slice(0,mission.squadCap);
    spawns=[...allies,...(spawns||ops.BROKEN_SIGNAL_RECOVER_SPAWNS.filter(s=>s.defId==="hostile"))];
  }
  let state=battle.createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
  let turns=0,moves=0,skillsUsed=0,enemyMoves=0,enemySkills=0,recoveries=0,skips=0,firstContact=null;
  while(state.outcome==="ongoing"&&turns<240){
   const next=battle.advanceToNext(state);state=next.state;
   if(state.outcome!=="ongoing")break;
   const actor=state.units.find(u=>u.id===state.activeId);
   if(!actor||actor.defeated)break;
   turns++;
   if(actor.team==="enemy"){
    const action=ai.chooseAiAction(state);
    if(action.type==="move"){enemyMoves++;if(action.then)enemySkills++;}
    if(action.type==="skill")enemySkills++;
    state=battle.applyAi(state,action).state;
   }else{
    if(battle.canRecover(state)){const x=battle.tryRecover(state);state=x.state;recoveries++;continue;}
    const foes=state.units.filter(u=>u.team==="enemy"&&!u.defeated);
    const objective=state.objective;
    const goal=objective?.type==="RECOVER"?objective.terminal:objective?.type==="HOLD"?objective.terminal:null;
    let used=false;
    const available=skills.availableSkills(state,actor).filter(s=>s.ready&&s.targetType==="ENEMY_SINGLE").sort((a,b)=>b.slot.localeCompare(a.slot));
    for(const sk of available){const target=foes.find(u=>skills.skillReady(actor,sk)&&Math.max(Math.abs(actor.c-u.c),Math.abs(actor.r-u.r))>=sk.minRange&&Math.max(Math.abs(actor.c-u.c),Math.abs(actor.r-u.r))<=sk.maxRange);if(target){const x=battle.trySkill(state,sk.id,target.id);if(x.ok){state=x.state;skillsUsed++;if(firstContact===null)firstContact=turns;used=true;break;}}}
    if(!used&&!actor.hasMoved){
     const cells=move.reachableCells(actor,state.units);
     const targets=goal?[goal]:foes;
     const dist=c=>Math.min(...targets.map(t=>Math.abs(t.c-c.c)+Math.abs(t.r-c.r)));
     const best=cells.sort((a,b)=>dist(a)-dist(b))[0];
     if(best&&(!targets.length||dist(best)<dist(actor))){const x=battle.tryMove(state,best.c,best.r);if(x.ok){state=x.state;moves++;}}
    }
    if(battle.canRecover(state)){const x=battle.tryRecover(state);state=x.state;recoveries++;continue;}
    const current=state.units.find(u=>u.id===actor.id);
    if(current&&!current.hasActed){
     const targets=state.units.filter(u=>u.team==="enemy"&&!u.defeated);
     const attack=skills.availableSkills(state,current).filter(s=>s.ready&&s.targetType==="ENEMY_SINGLE");
     for(const sk of attack){const target=targets.find(u=>{const d=Math.max(Math.abs(current.c-u.c),Math.abs(current.r-u.r));return d>=sk.minRange&&d<=sk.maxRange;});if(target){const x=battle.trySkill(state,sk.id,target.id);if(x.ok){state=x.state;skillsUsed++;if(firstContact===null)firstContact=turns;break;}}}
    }
    const remaining=state.units.find(u=>u.id===actor.id);
    if(state.outcome==="ongoing"&&remaining&&!remaining.hasActed){state=battle.trySkip(state).state;skips++;}
   }
  }
  const item={missionId:mission.missionId,objective:mission.objectiveType,outcome:state.outcome,round:state.round,unitTurns:turns,firstAlliedHitTurn:firstContact,alliedMoves:moves,alliedSkills:skillsUsed,enemyMoves,enemySkills,recoveries,alliedSkips:skips,capReached:turns>=240};
  assert(turns<=240);
  report.results.push(item);
 }
 assert.equal(report.results.length,12);
 console.log(JSON.stringify(report,null,2));
 console.log("TACTICAL_VNEXT_STEP0_REAL_ENGINE_SIMULATION_PASS");
}finally{await vite.close();}
