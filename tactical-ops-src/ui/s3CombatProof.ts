import type { BattleEvent, BattleState, CombatUnit } from "../combat/types";
import type { MissionDef } from "../data/operations";

export type S3Action = "CNC_INTERRUPT" | "CNC_CONTROL" | "SHADOW_COVER" | "SHADOW_HOLD" | "PET_COURIER_SLOW" | "PET_SLOW";
export interface S3Moment { kind: S3Action; unitTurn: number; detail: string }
export interface S3CombatProof { fieldcraft?: readonly string[]; runId: string; missionId: string; moments: readonly S3Moment[] }
export interface S3TrainingGoal { id: string; title: string; instruction: string; requirement: string }
export interface S3TrainingResult { id: string; title: string; evidence: string }
const MAX_MOMENTS = 24; // Bounded ephemeral journal, never a server reward ledger.

export function newS3Proof(runId: string, missionId: string): S3CombatProof {
  return { runId, missionId, moments: [] };
}
const isPet = (actor: CombatUnit) => actor.defId.startsWith("pet:");
const contains = (skillId: string, token: string) => skillId === token || skillId.startsWith(token + ":mastery:");
function add(current: S3CombatProof, moment: S3Moment): S3CombatProof {
  if (current.moments.some(m => m.kind === moment.kind && m.unitTurn === moment.unitTurn)) return current;
  return { ...current, moments: [...current.moments.slice(-(MAX_MOMENTS - 1)), moment] };
}

/** Only called after a successful engine action with actual emitted result events. */
export function recordS3Skill(
  current: S3CombatProof | null, actor: CombatUnit, skillId: string,
  targetId: string | undefined, events: readonly BattleEvent[],
  interrupted: boolean, before: BattleState,
): S3CombatProof | null {
  if (!current || before.outcome !== "ongoing" || actor.defeated || actor.team !== "ally" || !events.length) return current;
  const appliedEnemyStatus = Boolean(targetId && before.units.some(u => u.id === targetId && u.team === "enemy") &&
    events.some(e => e.type === "status" && e.unitId === targetId));
  const coveredAlly = actor.defId === "ally-03" && contains(skillId, "u03-pack") ||
    actor.defId === "ally-03" && contains(skillId, "u03-pack-warden");
  const alliedStatus = events.some(e => e.type === "status" && before.units.some(u => u.id === e.unitId && u.team === "ally"));
  let next = current;
  if (actor.defId === "ally-02" &&
    (contains(skillId, "u02-suppress") || contains(skillId, "u02-pressure-disruptor")) && appliedEnemyStatus) {
    next = add(next, { kind: "CNC_CONTROL", unitTurn: before.unitTurn, detail: "CNC applied a control status to an enemy." });
    if (interrupted) next = add(next, { kind: "CNC_INTERRUPT", unitTurn: before.unitTurn, detail: "CNC canceled a locked enemy intent with confirmed control." });
  }
  if (coveredAlly && alliedStatus) next = add(next, { kind: "SHADOW_COVER", unitTurn: before.unitTurn, detail: "SHADOW applied protection to an ally." });
  if (isPet(actor) && contains(skillId, "pet-hamstring") && appliedEnemyStatus) {
    next = add(next, { kind: "PET_SLOW", unitTurn: before.unitTurn, detail: "PET applied HAMSTRING to an enemy." });
    if (targetId === "courier" && before.objective?.type === "INTERCEPT") next = add(next, { kind: "PET_COURIER_SLOW", unitTurn: before.unitTurn, detail: "PET slowed the mission courier with HAMSTRING." });
  }
  return next;
}

/** A HOLD round counts only if control actually advanced while a SHADOW-sourced protection status covered the holder. */
export function recordS3Hold(current: S3CombatProof | null, before: BattleState, after: BattleState): S3CombatProof | null {
  if (!current || before.objective?.type !== "HOLD" || after.objective?.type !== "HOLD" ||
    after.objective.progress <= before.objective.progress || !after.objective.terminal) return current;
  const zone = after.objective;
  const guarded = after.units.some(u => u.team === "ally" && !u.defeated &&
    Math.max(Math.abs(u.c-zone.terminal!.c), Math.abs(u.r-zone.terminal!.r)) <= (zone.radius ?? 0) &&
    u.statuses.some(s => (s.source === "ally-03" || s.source.startsWith("u03-pack")) && (s.type === "GUARD" || s.type === "DEF_UP") && s.duration > 0));
  return guarded ? add(current, { kind: "SHADOW_HOLD", unitTurn: after.unitTurn,
    detail: `Relay control advanced to ${zone.progress}/${zone.duration} while SHADOW's protection covered the holder.` }) : current;
}

export function s3TrainingGoals(mission: MissionDef | null | undefined, squad: readonly string[], hasIntentContract: boolean): S3TrainingGoal[] {
  if (!mission) return [];
  const goals: S3TrainingGoal[] = [];
  if (squad.includes("ally-02") && hasIntentContract) goals.push({
    id: "cnc", title: "CNC · COUNTER SPECIALIST",
    instruction: "Use Disruptor PRESSURE on an announced, locked threat before it resolves.",
    requirement: "Requires CNC Disruptor and a real VNext enemy intent. No bonus currency.",
  });
  if (squad.includes("ally-03") && mission.objectiveType === "HOLD") goals.push({
    id: "shadow", title: "SHADOW · RELAY GUARDIAN",
    instruction: "Advance HOLD while an ally controlling the relay has SHADOW's active protection.",
    requirement: "Enemy contesting resets progress. No bonus currency.",
  });
  if (squad.some(x => x.startsWith("pet:")) && mission.objectiveType === "INTERCEPT") goals.push({
    id: "pet", title: "PET · COURIER HUNTER",
    instruction: "Apply HAMSTRING to the courier, then win the intercept objective.",
    requirement: "PET is one possible approach; CNC or positioning can also stop the courier.",
  });
  if (squad.includes("ally-03") && (squad.includes("ally-02") || squad.some(x => x.startsWith("pet:")))) goals.push({
    id: "synergy", title: "PACK · CHAIN REACTION",
    instruction: "Win after CNC control → SHADOW cover, OR PET HAMSTRING → SHADOW cover.",
    requirement: "Two legal routes. PET is optional; ability use must be confirmed by the engine.",
  });
  return goals;
}

function ordered(a: readonly S3Moment[], first: S3Action, second: S3Action): boolean {
  return a.some(x => x.kind === first && a.some(y => y.kind === second && y.unitTurn > x.unitTurn));
}
export function s3TrainingResults(
  current: S3CombatProof | null, receiptRunId: string | null, victory: boolean,
  allowed: readonly S3TrainingGoal[],
): S3TrainingResult[] {
  if (!current || current.runId !== receiptRunId || !victory) return [];
  const found = new Set(current.moments.map(m => m.kind));
  const approved = new Set(allowed.map(g => g.id));
  const results: S3TrainingResult[] = [];
  if (approved.has("cnc") && found.has("CNC_INTERRUPT")) results.push({id:"cnc", title:"COUNTER SPECIALIST",
    evidence:"An enemy's locked attack was genuinely canceled by CNC."});
  if (approved.has("shadow") && found.has("SHADOW_HOLD")) results.push({id:"shadow", title:"RELAY GUARDIAN",
    evidence:"HOLD progress advanced while SHADOW's protection covered the relay holder."});
  if (approved.has("pet") && found.has("PET_COURIER_SLOW")) results.push({id:"pet", title:"COURIER HUNTER",
    evidence:"PET HAMSTRING affected the courier during the won intercept."});
  if (approved.has("synergy")) {
    const a = ordered(current.moments, "CNC_CONTROL", "SHADOW_COVER");
    const b = ordered(current.moments, "PET_SLOW", "SHADOW_COVER");
    if (a || b) results.push({id:"synergy", title:"CHAIN REACTION",
      evidence:a ? "CNC control → SHADOW protection → objective won." : "PET HAMSTRING → SHADOW protection → objective won."});
  }
  return results;
}

/** One event, not a fabricated saved archive story; the receipt proves result, not an event-log upload. */
export function s3RunMemory(current: S3CombatProof | null, receiptRunId: string | null): S3Moment | null {
  if (!current || current.runId !== receiptRunId) return null;
  for (const type of ["CNC_INTERRUPT","SHADOW_HOLD","PET_COURIER_SLOW","SHADOW_COVER","CNC_CONTROL","PET_SLOW"] as const) {
    const found = current.moments.find(x => x.kind === type);
    if (found) return found;
  }
  return null;
}
