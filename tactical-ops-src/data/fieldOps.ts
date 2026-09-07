import type { BattleState, Cell } from "../combat/types";
import type { MasteryChange } from "./packMastery";

export type DeploymentApproach = "standard" | "south";
export interface FieldContext {
  cycleId: number;
  pressure: number;
  approach: DeploymentApproach;
  reportVersion: number;
}
export interface MissionChallenge {
  type: "TURN_LIMIT" | "NO_HEALING" | "SQUAD";
  label: string;
  limit?: number;
  required?: string[];
}
export interface FieldReport {
  victory: boolean;
  objectiveComplete: boolean;
  turns: number;
  healingActions: number;
  squadStanding: number;
  squadDeployed: number;
}
export interface FieldResult {
  masteryChanges?: MasteryChange[];
  runId: string;
  missionId: string;
  victory: boolean;
  cycleId: number;
  challengeSuccess: boolean;
  challengeBonus: number;
  progressEarned: number;
  progressBefore: number;
  progressAfter: number;
  rankBefore: number;
  rankAfter: number;
  pressureBefore: number;
  pressureAfter: number;
  regionalApplied: boolean;
  unlockedApproaches: DeploymentApproach[];
  legacyReport: boolean;
  recordedAt: number;
}

export const DEPLOYMENT_APPROACHES: Record<DeploymentApproach, { name: string; copy: string; cells: Cell[] }> = {
  standard: { name: "STANDARD APPROACH", copy: "Spread across the west edge. Cover the north and center.", cells: [{ c: 1, r: 2 }, { c: 1, r: 0 }, { c: 0, r: 3 }] },
  south: { name: "SOUTH APPROACH", copy: "Group along the south edge. A different route; the north starts exposed. Same squad and stats.", cells: [{ c: 0, r: 4 }, { c: 2, r: 4 }, { c: 0, r: 2 }] },
};

export function pressureLabel(value: number): string {
  return value >= 2 ? "HIGH" : value === 1 ? "REDUCED" : "CLEAR";
}
export function pressureEffect(value: number): string {
  return value >= 2 ? "Reinforcements arrive on their scheduled round." : "Reinforcements arrive 1 round later in relevant Field Ops.";
}
export function fieldReport(battle: BattleState): FieldReport | null {
  if (!battle.results || battle.outcome === "ongoing") return null;
  const { victory, turns, squadStanding, squadDeployed } = battle.results;
  return { victory, turns, squadStanding, squadDeployed, objectiveComplete: battle.results.objectiveComplete === true, healingActions: battle.healingActions || 0 };
}

/** Preview only; the server resolves and awards challenges from the run's report. */
export function challengePassed(challenge: MissionChallenge, report: FieldReport, squadIds: string[]): boolean {
  if (!report.victory) return false;
  if (challenge.type === "TURN_LIMIT") return report.turns <= (challenge.limit || 0);
  if (challenge.type === "NO_HEALING") return report.healingActions === 0;
  return (challenge.required || []).every((id) => id === "PET" ? squadIds.some((unit) => unit.startsWith("pet:")) : squadIds.includes(id));
}

export function rotationTime(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}
