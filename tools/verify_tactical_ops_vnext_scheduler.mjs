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
  const state = { ...initial, activeId:enemy.id, unitTurn:2 };
  const cycle = scheduler.queueEnemyThreat(scheduler.emptyThreatCycle(),state);
  assert.equal(cycle.sequence, 1);
  assert.equal(cycle.pending.length, 1);
  assert.equal(cycle.ledger[0].type,"threat_announced");
  assert.equal(cycle.pending[0].plan.enemyId,enemy.id);
  assert.equal(cycle.pending[0].plan.resolvesOnUnitTurn,3);
  assert.equal(scheduler.resolveEnemyThreat(cycle,state).cycle.pending.length,1,"cannot resolve before reaction window");
  const defeated = { ...state,unitTurn:3,units:state.units.map(u=>u.id===enemy.id?{...u,defeated:true,hp:0}:u) };
  const canceled=scheduler.resolveEnemyThreat(cycle,defeated);
  assert.equal(canceled.cycle.pending.length,0);
  assert.equal(canceled.cycle.ledger.at(-1).reason,"SOURCE_DEFEATED");
  assert.equal(canceled.state,defeated);
  console.log("VNEXT_SCHEDULER_CONTRACT_PASS: announcement, locked enemy, reaction delay, defeat counter, no live enable");
} finally { await server.close(); }
