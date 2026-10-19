#!/usr/bin/env node
/** Genuine target-move counterplay through the existing engine and VNext scheduler. */
import assert from "node:assert/strict";
globalThis.window={location:{search:"?tacticalBattlefieldVNext=1"},localStorage:{getItem:()=>null}};
const {createServer}=await import("vite");
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{
 const [battle,ai,move,react]=await Promise.all([
  vite.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/ai.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/movement.ts"),
  vite.ssrLoadModule("/tactical-ops-src/combat/intentScheduler.ts"),
 ]);
 let state=battle.createBattle(null,[
  {defId:"alpha",id:"alpha",c:1,r:2},
  {defId:"ally-02",id:"ally-02",c:0,r:0},
  {defId:"ally-03",id:"ally-03",c:0,r:4},
  {defId:"hostile",id:"h2",c:5,r:2}
 ]);
 let cycle=react.emptyThreatCycle(),warned=false,moved=false,countered=false,trace=[];
 for(let turn=0;turn<100&&state.outcome==="ongoing"&&!countered;turn++){
  state=battle.advanceToNext(state).state;
  const actor=state.units.find(u=>u.id===state.activeId);
  if(!actor)break;
  if(actor.team==="enemy"&&!warned){
   const next=react.queueEnemyThreat(cycle,state);
   if(next.pending.length){
    cycle=next;warned=true;
    trace.push({event:"threat_announced",turn:state.unitTurn,target:cycle.pending[0].plan.targetUnitId});
    state=battle.trySkip(state).state;continue;
   }
  }
  if(actor.team==="ally"){
   if(warned)cycle=react.markAlliedReaction(cycle,state);
   if(warned&&!moved&&actor.id===cycle.pending[0]?.plan.targetUnitId){
    const dest=move.reachableCells(actor,state.units)[0];
    assert(dest,"target has no legal reposition");
    const result=battle.tryMove(state,dest.c,dest.r);
    assert(result.ok,"target could not move legally");
    state=result.state;moved=true;
    trace.push({event:"target_repositioned",turn:state.unitTurn,to:dest});
   }
   state=battle.trySkip(state).state;continue;
  }
  if(warned&&actor.id==="h2"){
   const targetId=cycle.pending[0]?.plan.targetUnitId;
   const hpBefore=state.units.find(u=>u.id===targetId)?.hp;
   const res=react.resolveEnemyThreat(cycle,state);
   cycle=res.cycle;state=res.state;
   const hpAfter=state.units.find(u=>u.id===targetId)?.hp;
   assert.equal(hpAfter,hpBefore,"countered attack caused damage");
   const events=cycle.ledger.filter(e=>e.type==="threat_countered");
   assert(events.some(e=>e.reason==="TARGET_MOVED"),"movement must explicitly counter a locked target attack");
   assert.equal(cycle.pending.length,0,"countered threat remains live");
   countered=true;trace.push({event:"threat_countered",turn:state.unitTurn});
   break;
  }
  state=battle.applyAi(state,ai.chooseAiAction(state)).state;
 }
 assert(warned,"no threat warning");
 assert(moved,"player was never allowed to reposition");
 assert(countered,"counterplay did not resolve");
 console.log(JSON.stringify({schema:"combat-counterplay-proof.v1",trace},null,2));
 console.log("TACTICAL_VNEXT_REAL_COUNTERPLAY_PASS");
}finally{await vite.close();}
