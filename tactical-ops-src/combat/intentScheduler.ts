/** Shared, opt-in tactical reaction scheduler. No backend writes or live runtime changes. */
import { GRID_COLS, GRID_ROWS, type AiAction, type BattleEvent, type BattleState, type Cell } from "./types";
import { chooseAiAction, aiUsesLegalRules } from "./ai";
import { getSkill } from "../data/skills";
import { announceIntent, adjudicateIntent, confirmExecutedIntent, type IntentPlan, type TacticalLedgerEvent, type ThreatKind } from "./intentContract";
import { applyAi } from "./battle";
import { previewQueue } from "./initiative";

export interface QueuedThreat {
  plan: IntentPlan;
  action: AiAction;
}
export interface ThreatCycle {
  pending: ReadonlyArray<QueuedThreat>;
  ledger: ReadonlyArray<TacticalLedgerEvent>;
  sequence: number;
  /** At least one actual allied turn must occur before a threat can resolve. */
  reactionObserved: Readonly<Record<string, boolean>>;
}
export const emptyThreatCycle = (): ThreatCycle => ({ pending: [], ledger: [], sequence: 0, reactionObserved: {} });

function plannedSkill(action: AiAction): Extract<AiAction, {type:"skill"}> | null {
  return action.type === "skill" ? action : action.type === "move" && action.then?.type === "skill" ? action.then : null;
}
function tile(c: Cell): Cell { return { c: c.c, r: c.r }; }
/** Only announce if the meter-based queue offers a real allied reaction turn. */
export function hasAlliedReactionWindow(state: BattleState, enemyId: string): boolean {
  const next = previewQueue(state, 12);
  const first = next.indexOf(enemyId);
  if (first < 0) return false;
  const nextSame = next.indexOf(enemyId, first + 1);
  if (nextSame < 0) return false;
  return next.slice(first + 1, nextSame).some(id =>
    state.units.some(u => u.id === id && u.team === "ally" && !u.defeated));
}

export function markAlliedReaction(cycle: ThreatCycle, state: BattleState): ThreatCycle {
  const actor = state.units.find(u => u.id === state.activeId);
  if (!actor || actor.team !== "ally" || actor.defeated) return cycle;
  const next = { ...cycle.reactionObserved };
  for (const threat of cycle.pending) {
    if (state.unitTurn > threat.plan.warnsOnUnitTurn) next[threat.plan.id] = true;
  }
  return { ...cycle, reactionObserved: next };
}
function forecast(state: BattleState, enemyId: string, action: AiAction, sequence: number): QueuedThreat | null {
  if (action.type === "skip") return null;
  const enemy = state.units.find(u => u.id === enemyId);
  if (!enemy || enemy.defeated || enemy.team !== "enemy") return null;
  const skill = plannedSkill(action);
  const definition = skill ? getSkill(skill.skillId) : null;
  // Purely defensive enemy actions do not threaten allied tiles and resolve normally.
  if (definition && (definition.targetType === "SELF" || definition.targetType === "ALLY_AOE")) return null;
  const target = skill?.targetId ? state.units.find(u => u.id === skill.targetId) : null;
  const anchor = target ? tile(target) : skill?.cell ? tile(skill.cell) : action.type === "move" ? tile(action.to) : tile(enemy);
  const impactTiles: Cell[] = definition && ["AREA_RADIUS", "ENEMY_AOE"].includes(definition.targetType)
    ? Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => ({ c: i % GRID_COLS, r: Math.floor(i / GRID_COLS) }))
      .filter(c => Math.max(Math.abs(c.c-anchor.c),Math.abs(c.r-anchor.r)) <= definition.radius)
    : [anchor];
  const kind: ThreatKind = definition?.id.includes("interference") || definition?.id.includes("intimidate") ? "JAM" : action.type === "move" && !skill ? "CHARGE" :
    definition?.targetType === "AREA_RADIUS" || definition?.targetType === "ENEMY_AOE" ? "AREA" : "ATTACK";
  const { plan } = announceIntent({
    id: `threat:${state.unitTurn}:${enemyId}:${sequence}`, enemyId, kind,
    targetUnitId: target?.id ?? null, targetTile: anchor, impactTiles,
    predictedEffect: definition ? definition.name : "Enemy advances to a locked tile",
    warnsOnUnitTurn: state.unitTurn, resolvesOnUnitTurn: state.unitTurn + 1,
    responses: ["KILL", "DISRUPT", "REPOSITION", "BLOCK", "PROTECT", "TRADE"],
    fallbackPolicy: "CANCEL",
  }, state);
  return { plan, action };
}

/** Announce only; never execute an unannounced action in this module. */
export function queueEnemyThreat(cycle: ThreatCycle, state: BattleState): ThreatCycle {
  const enemy = state.units.find(u => u.id === state.activeId);
  if (!enemy || enemy.team !== "enemy" || enemy.defeated || cycle.pending.some(t => t.plan.enemyId === enemy.id)) return cycle;
  if (!hasAlliedReactionWindow(state, enemy.id)) return cycle;
  const action = chooseAiAction(state);
  const queued = forecast(state, enemy.id, action, cycle.sequence + 1);
  if (!queued) return cycle;
  return {
    ...cycle,
    sequence: cycle.sequence + 1,
    pending: [...cycle.pending, queued],
    ledger: [...cycle.ledger, { type: "threat_announced", intentId: queued.plan.id, enemyId: enemy.id, unitTurn: state.unitTurn }],
  };
}

/** Execute only when the locked enemy gets a legal turn again. No silent retarget. */
export function resolveEnemyThreat(cycle: ThreatCycle, state: BattleState): { cycle: ThreatCycle; state: BattleState; events?: BattleEvent[] } {
  const index = cycle.pending.findIndex(t => t.plan.enemyId === state.activeId);
  if (index < 0) return { cycle, state };
  const queued = cycle.pending[index];
  const decision = adjudicateIntent(queued.plan, state);
  if (decision.status === "COMMIT" && !cycle.reactionObserved[queued.plan.id]) return { cycle, state };
  if (decision.status === "WAIT") return { cycle, state };
  const pending = cycle.pending.filter((_, i) => i !== index);
  const reactionObserved = { ...cycle.reactionObserved };
  delete reactionObserved[queued.plan.id];
  if (decision.status === "CANCELED") return {
    state,
    cycle: { ...cycle, pending, reactionObserved, ledger: [...cycle.ledger, ...decision.events] },
  };
  // Never convert an invalidated locked action into an apparently successful skip.
  if (!aiUsesLegalRules(state, queued.action)) {
    return { state, cycle: { ...cycle, pending, reactionObserved, ledger: [...cycle.ledger, {
      type: "threat_countered", intentId: queued.plan.id, reason: "INVALIDATED", unitTurn: state.unitTurn,
    }] } };
  }
  const before = state;
  const applied = applyAi(state, queued.action);
  const executed = applied.state !== before && applied.events.some(e => e.type === "damage" || e.type === "status" || e.type === "move" || e.type === "heal");
  return {
    state: applied.state,
    events: applied.events,
    cycle: {
      ...cycle, pending, reactionObserved,
      ledger: [...cycle.ledger, ...(executed
          ? [...decision.events, ...confirmExecutedIntent(decision.plan, state.unitTurn, true)]
          : [{ type: "threat_countered" as const, intentId: queued.plan.id, reason: "INVALIDATED" as const, unitTurn: state.unitTurn }])],
    },
  };
}
