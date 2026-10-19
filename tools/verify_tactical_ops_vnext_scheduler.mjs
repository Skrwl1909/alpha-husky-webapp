#!/usr/bin/env node
/** Experimental scheduler contract: no production toggle or backend writes. */
import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({ configFile:false, server:{middlewareMode:true,hmr:false},appType:"custom" });
try {
  const [scheduler, battle] = await Promise.all([
    server.ssrLoadModule("/tactical-ops-src/combat/intentScheduler.ts"),
    server.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
  ]);
  const initial = battle.createBattle();
  assert.deepEqual(scheduler.emptyThreatCycle(), { pending:[], ledger:[], sequence:0, reactionObserved:{} });
  const enemy = initial.units.find(u => u.team === "enemy");
  assert(enemy);
  // The scheduler now deliberately ignores move-only AI turns. Place one ally
  // in legal attack range so this fixture tests an actual incoming strike.
  const allyForThreat = initial.units.find(u => u.team === "ally");
  assert(allyForThreat);
  const state = { ...initial, activeId:enemy.id, unitTurn:2,
    units: initial.units.map(u => u.id === allyForThreat.id
      ? { ...u, c: enemy.c, r: enemy.r + (enemy.r < 6 ? 1 : -1) }
      : u),
  };
  const cycle = scheduler.queueEnemyThreat(scheduler.emptyThreatCycle(),state);
  assert.equal(cycle.sequence, 1);
  assert.equal(cycle.pending.length, 1);
  assert.equal(cycle.ledger[0].type,"threat_announced");
  assert.equal(cycle.pending[0].plan.enemyId,enemy.id);
  assert.equal(cycle.pending[0].plan.resolvesOnUnitTurn,3);
  assert.equal(scheduler.resolveEnemyThreat(cycle,state).cycle.pending.length,1,"cannot resolve before reaction window");
  const nextTurn = { ...state, unitTurn:3 };
  const pendingWithoutReaction = scheduler.resolveEnemyThreat(cycle,nextTurn);
  assert.equal(pendingWithoutReaction.cycle.pending.length,1,"no enemy resolution without a real allied turn");
  assert.equal(pendingWithoutReaction.state,nextTurn);
  const ally = state.units.find(u=>u.team==="ally");
  assert(ally);
  const marked = scheduler.markAlliedReaction(cycle,{...state,activeId:ally.id,unitTurn:3});
  assert.equal(marked.reactionObserved[cycle.pending[0].plan.id],true);
  assert.equal(scheduler.markAlliedReaction(cycle,state).reactionObserved[cycle.pending[0].plan.id],undefined);
  const defeated = { ...state,unitTurn:3,units:state.units.map(u=>u.id===enemy.id?{...u,defeated:true,hp:0}:u) };
  const canceled=scheduler.resolveEnemyThreat(cycle,defeated);
  assert.equal(canceled.cycle.pending.length,0);
  assert.equal(canceled.cycle.ledger.at(-1).reason,"SOURCE_DEFEATED");
  assert.equal(canceled.state,defeated);
  const plan = cycle.pending[0].plan;
  if (plan.targetUnitId) {
    const gone = { ...state, unitTurn:3, units:state.units.map(u=>u.id===plan.targetUnitId?{...u,defeated:true,hp:0}:u) };
    const goneResult = scheduler.resolveEnemyThreat(cycle,gone);
    assert.equal(goneResult.cycle.pending.length,0,"eliminated target cancels intent");
    assert.equal(goneResult.cycle.ledger.at(-1).reason,"TARGET_GONE");
    const target = state.units.find(u=>u.id===plan.targetUnitId);
    const movedCell = {c:target.c===0?1:0,r:target.r};
    const moved = {...state,unitTurn:3,units:state.units.map(u=>u.id===target.id?{...u,...movedCell}:u)};
    const movedResult = scheduler.resolveEnemyThreat(cycle,moved);
    assert.equal(movedResult.cycle.pending.length,0,"moved target cancels locked intent");
    assert.equal(movedResult.cycle.ledger.at(-1).reason,"TARGET_MOVED");
  }
  assert.equal(scheduler.emptyThreatCycle().pending.length,0,"new battle starts without stale intents");
  console.log("VNEXT_SCHEDULER_CONTRACT_PASS: announcement, locked enemy, reaction delay, defeat counter, no live enable");
} finally { await server.close(); }
