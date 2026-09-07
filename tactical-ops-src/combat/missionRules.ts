import type { BattleState, MissionDirective, SkillDef, CombatUnit } from "./types";

/** Mission conditions wrap existing actions; they never change unit definitions. */
export function recoverSignalOpen(state: BattleState): boolean {
  const every = state.directive?.recoverEveryRounds;
  return !every || state.round % every === 0;
}

export function supportCooldownExtra(directive: MissionDirective | null | undefined, unit: CombatUnit, skill: SkillDef): number {
  if (skill.ignoreDisruption) return 0;
  return unit.team === "ally" && skill.effects.some((e) => e.kind === "heal" || (e.kind === "status" && ["SELF", "ALLY_SINGLE", "ALLY_AOE"].includes(skill.targetType)))
    ? directive?.supportCooldownExtra || 0 : 0;
}

export function holdControlled(state: BattleState): boolean {
  const objective = state.objective;
  if (objective?.type !== "HOLD" || !objective.terminal) return false;
  const inArea = state.units.filter((u) => !u.defeated && Math.abs(u.c - objective.terminal!.c) + Math.abs(u.r - objective.terminal!.r) <= (objective.radius ?? 0));
  return inArea.some((u) => u.team === "ally") && !inArea.some((u) => u.team === "enemy");
}

/** Round-boundary progress, with HOLD reset immediately when control is lost. */
export function resolveTimedObjective(state: BattleState): { state: BattleState; result: "victory" | "defeat" | null } {
  const objective = state.objective;
  if (objective?.type !== "HOLD" && objective?.type !== "SURVIVE") return { state, result: null };
  const allies = state.units.filter((u) => u.team === "ally");
  if (!allies.some((u) => !u.defeated) || (objective.type === "SURVIVE" && allies.some((u) => u.defeated))) return { state, result: "defeat" };
  const boundary = state.round > objective.checkedRound;
  const progress = objective.type === "SURVIVE" ? state.round - 1
    : !holdControlled(state) ? 0 : objective.progress + (boundary ? 1 : 0);
  const next = { ...state, objective: { ...objective, progress, checkedRound: state.round } };
  return { state: next, result: progress >= objective.duration ? "victory" : null };
}

export function missionHud(state: BattleState): string {
  const objective = state.objective;
  const rule = state.directive;
  const progress = objective?.type === "HOLD" ? `HOLD ${objective.progress}/${objective.duration} · ${holdControlled(state) ? "CONTROLLED" : "OCCUPY / CLEAR AREA"}`
    : objective?.type === "SURVIVE" ? `SURVIVE ${objective.progress}/${objective.duration} · ALL SQUAD MUST STAND`
    : rule?.recoverEveryRounds ? `RECOVER · SIGNAL ${recoverSignalOpen(state) ? "OPEN" : "JAMMED — EVEN ROUNDS ONLY"}` : "";
  const condition = rule?.type === "REINFORCEMENTS" ? `HOUND · ${state.reinforcement?.spawned ? "ARRIVED" : `ROUND ${state.reinforcement?.triggerRound}`}`
    : rule?.type === "DISRUPTED_SUPPORT" ? `SUPPORT COOLDOWNS +${rule.supportCooldownExtra}` : "";
  return [progress, condition].filter(Boolean).join(" · ");
}
