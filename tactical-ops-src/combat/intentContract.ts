/**
 * Tactical VNext system contract — opt-in, not yet connected to the live battle loop.
 * Never synthesize a combat outcome or reward from an announced intent.
 * The legacy meter/SPD engine, mission rules and backend receipts remain authoritative.
 */
import { GRID_COLS, GRID_ROWS, type BattleState, type Cell } from "./types";

export const TACTICAL_VNEXT_RULESET = "tactical-intent-vnext.0" as const;
export const TACTICAL_VNEXT_ENABLED = false as const;

export type ThreatKind = "ATTACK" | "AREA" | "JAM" | "ESCAPE" | "REINFORCEMENT" | "CHARGE";
export type IntentPhase = "WINDUP" | "COMMIT";
export type IntentStopReason = "SOURCE_DEFEATED" | "TARGET_GONE" | "TARGET_MOVED" | "INVALIDATED" | "COUNTERED";
export type CounterCategory = "KILL" | "DISRUPT" | "REPOSITION" | "BLOCK" | "PROTECT" | "TRADE";
export type FallbackPolicy = "CANCEL" | "REANNOUNCE";

export interface IntentPlan {
  id: string;
  rulesetVersion: typeof TACTICAL_VNEXT_RULESET;
  enemyId: string;
  kind: ThreatKind;
  phase: IntentPhase;
  targetUnitId: string | null;
  targetTile: Cell | null;
  impactTiles: Cell[];
  predictedEffect: string;
  warnsOnUnitTurn: number;
  resolvesOnUnitTurn: number;
  responses: CounterCategory[];
  fallbackPolicy: FallbackPolicy;
}

export type TacticalLedgerEvent =
  | { type: "threat_announced"; intentId: string; enemyId: string; unitTurn: number }
  | { type: "threat_countered"; intentId: string; reason: IntentStopReason; unitTurn: number }
  | { type: "threat_committed"; intentId: string; unitTurn: number }
  | { type: "threat_resolved"; intentId: string; unitTurn: number; confirmedByEngine: true }
  | { type: "objective_damaged"; intentId: string; amount: number; unitTurn: number; confirmedByEngine: true }
  | { type: "guard_prevented"; intentId: string; amount: number; unitTurn: number; confirmedByEngine: true }
  | { type: "intel_secured"; intentId: string; unitTurn: number; confirmedByBackend: true }
  | { type: "mastery_triggered"; intentId: string; unitId: string; unitTurn: number; confirmedByBackend: true };

export interface RunRulesContract {
  rulesetVersion: string;
  missionId: string;
  missionRevision: number;
  combatProfileVersion: number;
  masterySnapshotVersion: number;
  rewardPolicyVersion: number;
  source: "BACKEND_SNAPSHOT";
}

const validKinds: ReadonlyArray<ThreatKind> = ["ATTACK", "AREA", "JAM", "ESCAPE", "REINFORCEMENT", "CHARGE"];
const validCounters: ReadonlyArray<CounterCategory> = ["KILL", "DISRUPT", "REPOSITION", "BLOCK", "PROTECT", "TRADE"];
function inBounds(cell: Cell): boolean {
  return Number.isInteger(cell.c) && Number.isInteger(cell.r) &&
    cell.c >= 0 && cell.c < GRID_COLS && cell.r >= 0 && cell.r < GRID_ROWS;
}
function sameTile(a: Cell, b: Cell): boolean { return a.c === b.c && a.r === b.r; }

/** Fail closed: only return an immutable, fully specified telegraph. */
export function announceIntent(
  draft: Omit<IntentPlan, "phase" | "rulesetVersion">,
  state: BattleState,
): { plan: IntentPlan; event: TacticalLedgerEvent } {
  if (!draft.id || !draft.enemyId || !validKinds.includes(draft.kind) ||
      !draft.predictedEffect.trim() || draft.warnsOnUnitTurn !== state.unitTurn ||
      !Number.isInteger(draft.resolvesOnUnitTurn) ||
      draft.resolvesOnUnitTurn <= draft.warnsOnUnitTurn ||
      !["CANCEL", "REANNOUNCE"].includes(draft.fallbackPolicy) ||
      !draft.responses.length || !draft.responses.every((v) => validCounters.includes(v)) ||
      draft.responses.length !== new Set(draft.responses).size ||
      !draft.impactTiles.length || !draft.impactTiles.every(inBounds) ||
      (draft.targetTile !== null && !inBounds(draft.targetTile)) ||
      (!draft.targetUnitId && !draft.targetTile)) {
    throw new Error("invalid_tactical_intent");
  }
  const source = state.units.find((u) => u.id === draft.enemyId);
  if (!source || source.team !== "enemy" || source.defeated) throw new Error("invalid_tactical_intent_source");
  if (draft.targetUnitId) {
    const target = state.units.find((u) => u.id === draft.targetUnitId);
    if (!target || target.defeated) throw new Error("invalid_tactical_intent_target");
    // Locked unit and tile together: no silent target change or post-hoc location change.
    if (draft.targetTile && !sameTile(target, draft.targetTile)) throw new Error("intent_target_tile_mismatch");
  }
  const plan: IntentPlan = {
    ...draft,
    targetTile: draft.targetTile ? { ...draft.targetTile } : null,
    impactTiles: draft.impactTiles.map((cell) => ({ ...cell })),
    responses: [...draft.responses],
    phase: "WINDUP",
    rulesetVersion: TACTICAL_VNEXT_RULESET,
  };
  return { plan, event: { type: "threat_announced", intentId: plan.id, enemyId: plan.enemyId, unitTurn: state.unitTurn } };
}

export type IntentDecision =
  | { status: "WAIT"; plan: IntentPlan; events: TacticalLedgerEvent[] }
  | { status: "CANCELED"; reason: IntentStopReason; events: TacticalLedgerEvent[] }
  | { status: "COMMIT"; plan: IntentPlan; events: TacticalLedgerEvent[] };

/**
 * Evaluate a previously announced action; NEVER invoke chooseAiAction here.
 * A rejected action cannot silently choose a new target. REANNOUNCE requires
 * a brand new intent id and another reaction window in the calling engine.
 */
export function adjudicateIntent(
  plan: IntentPlan,
  state: BattleState,
  interrupted = false,
): IntentDecision {
  if (plan.rulesetVersion !== TACTICAL_VNEXT_RULESET || state.unitTurn < plan.warnsOnUnitTurn) {
    throw new Error("intent_ruleset_or_clock_mismatch");
  }
  const source = state.units.find((u) => u.id === plan.enemyId);
  const target = plan.targetUnitId ? state.units.find((u) => u.id === plan.targetUnitId) : null;
  const reason: IntentStopReason | null = !source || source.defeated ? "SOURCE_DEFEATED"
    : interrupted ? "COUNTERED"
    : plan.targetUnitId && (!target || target.defeated) ? "TARGET_GONE"
    : target && plan.targetTile && !sameTile(target, plan.targetTile) ? "TARGET_MOVED"
    : null;
  if (reason) {
    return { status: "CANCELED", reason, events: [
      { type: "threat_countered", intentId: plan.id, reason, unitTurn: state.unitTurn },
    ] };
  }
  if (state.unitTurn < plan.resolvesOnUnitTurn) return { status: "WAIT", plan, events: [] };
  if (plan.phase === "COMMIT") throw new Error("intent_already_committed");
  const committed = { ...plan, phase: "COMMIT" as const };
  return { status: "COMMIT", plan: committed, events: [
    { type: "threat_committed", intentId: plan.id, unitTurn: state.unitTurn },
  ] };
}

/** Only call after the actual engine has legally executed the committed action. */
export function confirmExecutedIntent(plan: IntentPlan, unitTurn: number, actualExecutionSucceeded: boolean): TacticalLedgerEvent[] {
  if (plan.phase !== "COMMIT" || !Number.isInteger(unitTurn) || unitTurn < plan.resolvesOnUnitTurn ||
      actualExecutionSucceeded !== true) throw new Error("unconfirmed_tactical_resolution");
  return [{ type: "threat_resolved", intentId: plan.id, unitTurn, confirmedByEngine: true }];
}

/** Legacy snapshots have no rulesetVersion. They MUST remain legacy. */
export function parseRunRulesContract(raw: unknown): RunRulesContract | null {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) throw new Error("invalid_run_rules_contract");
  const x = raw as Record<string, unknown>;
  const keys = ["rulesetVersion", "missionId", "missionRevision", "combatProfileVersion", "masterySnapshotVersion", "rewardPolicyVersion", "source"];
  if (Object.keys(x).length !== keys.length || !keys.every((k) => Object.prototype.hasOwnProperty.call(x, k))) {
    throw new Error("invalid_run_rules_contract");
  }
  if (x.rulesetVersion !== TACTICAL_VNEXT_RULESET || x.source !== "BACKEND_SNAPSHOT" ||
      typeof x.missionId !== "string" || !x.missionId ||
      !["missionRevision", "combatProfileVersion", "masterySnapshotVersion", "rewardPolicyVersion"]
        .every((k) => Number.isSafeInteger(x[k]) && (x[k] as number) >= 1)) {
    throw new Error("unsupported_run_rules_contract");
  }
  return x as unknown as RunRulesContract;
}

/** Read-only flag. A future rollout must check server capability and bundle version as well. */
export function canStartVNextRun(contract: RunRulesContract | null): boolean {
  return TACTICAL_VNEXT_ENABLED && contract?.rulesetVersion === TACTICAL_VNEXT_RULESET;
}
