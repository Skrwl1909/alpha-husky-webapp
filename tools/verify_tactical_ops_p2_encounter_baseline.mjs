#!/usr/bin/env node
/** Read-only P2 baseline on the real engine. Synthetic profiles only. No production API. */
import assert from "node:assert/strict";
import { createServer } from "vite";
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const [ops,battle,ai,movement,v2mod,v3mod]=await Promise.all([
  "/tactical-ops-src/data/operations.ts","/tactical-ops-src/combat/battle.ts",
  "/tactical-ops-src/combat/ai.ts","/tactical-ops-src/combat/movement.ts",
  "/tactical-ops-src/combat/combatProfile.ts","/tactical-ops-src/combat/combatProfileV3.ts",
 ].map(x=>server.ssrLoadModule(x)));
 const pet={id:"synthetic",name:"Fixture Pet",img:"https://example.invalid/pet.png"};
 const z={strength:0,agility:0,defense:0,vitality:0,intelligence:0,luck:0};
 const profiles={fresh:[120,28,12,14],mid:[128,33,15,15],high:[138,39,21,16]};
 const rows=[];
 const d=(a,b)=>Math.abs(a.c-b.c)+Math.abs(a.r-b.r);
 const ch=(a,b)=>Math.max(Math.abs(a.c-b.c),Math.abs(a.r-b.r));
 function start(missionId,profile,withPet,intel=false){
  const m=ops.MISSION_DEFS[missionId];assert(m);
  const ids=withPet?["alpha","ally-02","pet:synthetic"]:["alpha","ally-02","ally-03"];
  const spawns=ops.missionSpawnsForSquad(m,ids,withPet?pet:null);assert(spawns);
  const a=profiles[profile],v2=v2mod.parseCombatProfileV2({version:2,mode:"inputs-only",alpha:{level:profile==="fresh"?1:profile==="mid"?45:184,base:z,gear:z},pet:withPet?{...pet,level:5,effective:z}:null});
  const v3=v3mod.parseCombatProfileV3({version:3,mode:"battle-v1",alpha:{hp:a[0],atk:a[1],def:a[2],spd:a[3]},pet:withPet?{...pet,hp:85,atk:22,def:8,spd:14}:null});
  const rules=ops.missionBattleRules(m,false,undefined,{version:1,courierTraceAcquired:intel});
  return {state:batch(battle.startBattle(null,v3mod.applyRunCombatProfile(spawns,v3,v2),rules.objective,rules.reinforcement,null,rules.directive)),reinforcement:rules.reinforcement?.triggerRound??null};
 }
 function batch(out){return out.state}
 function turn(state,mode){
  const u=state.units.find(x=>x.id===state.activeId);assert(u);
  if(u.team==="enemy"){const choice=ai.chooseAiAction(state);assert(ai.aiUsesLegalRules(state,choice)||choice.type==="skip");return {state:batch(battle.applyAi(state,choice)),desc:choice.type+":"+(choice.skillId||""),control:false};}
  const enemies=state.units.filter(x=>x.team==="enemy"&&!x.defeated);const goal=state.objective?.type==="INTERCEPT"?enemies.find(x=>x.id===state.objective.targetId):null;
  let target=goal||enemies.sort((a,b)=>a.hp-b.hp)[0];
  const block=mode==="control"&&u.id==="ally-02"&&state.objective?.type==="INTERCEPT";
  const dest=block?state.objective.exit:(state.objective?.type==="HOLD"&&u.id==="alpha"?state.objective.terminal:target);
  let moved=false;
  if(dest&&!u.hasMoved){
   const candidates=movement.reachableCells(u,state.units).sort((a,b)=>d(a,dest)-d(b,dest)||a.r-b.r||a.c-b.c);
   if(candidates.length&&d(candidates[0],dest)<d(u,dest)){const res=battle.tryMove(state,candidates[0].c,candidates[0].r);if(res.ok){state=res.state;moved=true;}}
  }
  const actor=state.units.find(x=>x.id===u.id);
  target=state.units.find(x=>x.id===target?.id);
  const skills=actor.skillIds.map(id=>({id,cd:actor.cooldowns[id]||0})).filter(x=>x.cd<=0);
  const ordered=skills.sort((a,b)=>mode==="control"?(Number(/hamstring|suppress|disrupt/.test(b.id))-Number(/hamstring|suppress|disrupt/.test(a.id))):0);
  const living=state.units.filter(x=>x.team==="enemy"&&!x.defeated);
  for(const skill of ordered){
   for(const target of [goal,...living].filter(Boolean)){
    const s=battle.trySkill(state,skill.id,target.id);if(s.ok)return {state:s.state,desc:"skill:"+skill.id+":"+target.id,control:/hamstring|suppress|disrupt/.test(skill.id)};
   }
  }
  const skip=battle.trySkip(state);assert(skip.ok);return {state:skip.state,desc:moved?"move":"skip",control:false};
 }
 function run(missionId,profile,petEnabled,mode,intel=false){
  const prepared=start(missionId,profile,petEnabled,intel);let state=prepared.state,acts=0,enemies=0,controls=0,reinforcement=null;
  const history=[];
  while(state.outcome==="ongoing"&&acts<160&&state.round<=18){
   const actor=state.units.find(x=>x.id===state.activeId);assert(actor);
   const t=turn(state,mode);state=battle.evaluateOutcome(t.state);
   if(actor.team==="enemy")enemies++;if(t.control)controls++;
   history.push({round:state.round,actor:actor.id,action:t.desc});
   acts++;
   if(state.reinforcement?.spawned&&reinforcement===null)reinforcement=state.round;
   if(state.outcome!=="ongoing")break;
   state=batch(battle.advanceToNext(state));
   if(state.reinforcement?.spawned&&reinforcement===null)reinforcement=state.round;
  }
  const row={missionId,profile,petEnabled,mode,intel,outcome:state.outcome,round:state.round,actions:acts,enemyActions:enemies,controlActions:controls,damageTaken:state.damageTaken,reinforcementPlanned:prepared.reinforcement,reinforcementSeen:reinforcement,capped:state.outcome==="ongoing",history};
  rows.push(row);return row;
 }
 for(const profile of Object.keys(profiles))for(const petEnabled of [false,true])for(const mode of ["focus","control"])run("dead-relay-courier",profile,petEnabled,mode);
 for(const intel of [false,true])for(const mode of ["focus","control"])run("dead-relay-hold","mid",false,mode,intel);
 assert.equal(rows.length,16);
 assert(rows.filter(x=>x.missionId==="dead-relay-hold"&&!x.intel).every(x=>x.reinforcementPlanned===2));
 assert(rows.filter(x=>x.missionId==="dead-relay-hold"&&x.intel).every(x=>x.reinforcementPlanned===3));
 console.log("P2_ENGINE_BASELINE_SYNTHETIC "+rows.length+" scenarios");
 for(const r of rows)console.log(JSON.stringify({...r,history:undefined}));
 console.log("P2_ENGINE_TRACES_BEGIN");for(const r of rows)console.log(JSON.stringify(r));console.log("P2_ENGINE_TRACES_END");
}finally{await server.close();}
