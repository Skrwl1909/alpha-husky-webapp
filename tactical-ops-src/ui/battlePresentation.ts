import type { BattleState, CombatUnit } from "../combat/types";
import type { IntentPlan } from "../combat/intentContract";
import { TACTICAL_VNEXT_RULESET } from "../combat/intentContract";
import { availableSkills } from "../combat/skills";
import { reachableCells, cellKey } from "../combat/movement";
import { skillNeedsTargetPick } from "../combat/targeting";
import { foundationBattleGuidance, playerBattleGuidance } from "./playerGuidance";
import { missionLiveProgress, objectiveDirective } from "./missionPurpose";
import type { MissionDef } from "../data/operations";
import type { CombatMoment } from "./combatIdentity";
import type { CombatFx } from "./combatFxAtlas";
import type { CombatConsequence } from "./combatConsequences";

export type DecisionMode = "READ" | "TARGET" | "REACT" | "RESOLVE" | "WAIT";
export interface BattlePresentationInput {
  battle: BattleState;
  busy: boolean;
  activeRulesetVersion: string | null;
  threats: readonly IntentPlan[];
  combatMoment: CombatMoment | null;
  combatFx: readonly CombatFx[];
  consequences: readonly CombatConsequence[];
  floats: readonly { unitId: string; text: string; kind: string }[];
  banner: string | null;
  mission: MissionDef | null;
  onboardingStageId?: string | null;
}

/** Read-only capability, matching intentScheduler's existing control predicate.
 * It predicts only legal availability, never a successful interrupt. Engine events
 * remain the sole authority for cancellation. No simulated casts/status IDs here. */
function interruptTargets(battle: BattleState, actor: CombatUnit | undefined, threats: readonly IntentPlan[]): string[] {
  if (!actor || actor.defId !== "ally-02" || actor.growth?.discipline !== "disruptor") return [];
  const ids = new Set(threats.map(t => t.enemyId));
  return [...new Set(availableSkills(battle, actor).filter(s => s.ready &&
    (s.id === "u02-suppress" || s.id === "u02-pressure-disruptor" || s.id.startsWith("u02-pressure-disruptor:mastery:") || s.id.startsWith("u02-suppress:mastery:")) &&
    s.effects.some(e => e.kind === "status")
  ).flatMap(s => s.targets.filter(id => ids.has(id))))];
}

/** Pure derived UI director. Does not own combat, advance clocks, prune threats,
 * schedule a timeout or read live account progression. Layer arbitration keeps
 * legal targeting visible even when persistent danger wins the headline. */
export function deriveBattlePresentation(input: BattlePresentationInput) {
  const { battle, busy } = input;
  const actor = battle.units.find(u => u.id === battle.activeId);
  const interactive = !!actor && actor.team === "ally" && !actor.defeated && !actor.hasActed && !busy && battle.outcome === "ongoing";
  const threats = battle.outcome === "ongoing" && input.activeRulesetVersion === TACTICAL_VNEXT_RULESET
    ? input.threats.filter(t => t.rulesetVersion === TACTICAL_VNEXT_RULESET) : [];
  const danger = new Set(threats.flatMap(t => t.impactTiles.map(c => cellKey(c.c, c.r))));
  const targeting = interactive && battle.mode === "targeting" && !!battle.actionSkillId;
  const skills = actor ? availableSkills(battle, actor) : [];
  const skill = skills.find(s => s.id === battle.actionSkillId);
  const targetIds = targeting && skill?.ready ? skill.targets : [];
  const interruptTargetIds = interactive ? interruptTargets(battle, actor, threats) : [];
  const moves = interactive && !actor.hasMoved && !targeting ? reachableCells(actor, battle.units) : [];
  const canReposition = moves.some(c => !danger.has(cellKey(c.c, c.r)));
  const foundationGuidance = foundationBattleGuidance(battle, input.onboardingStageId);
  const guidance = foundationGuidance || playerBattleGuidance(battle, input.mission);
  const objective = missionLiveProgress(battle);
  const directive = objectiveDirective(battle);
  const sources = threats.map((t, i) => ({ id: t.enemyId, label: `${i + 1}`, name: battle.units.find(u => u.id === t.enemyId)?.name || "Enemy", effect: t.predictedEffect }));
  const targetPrompt = targeting ? targetIds.length ? `${skill?.name} · ${targetIds.length} legal target${targetIds.length === 1 ? "" : "s"}` : actor?.hasMoved ? "No target · cancel, use support or Skip" : "No target in range · cancel to reposition" : null;
  // Store floats/consequences/moments are published only from accepted engine
  // events at contact. Atlas travel alone must never report a resolved hit.
  const counter = input.consequences.find(c => c.kind === "counter");
  const float = input.floats.find(f => f.kind === "heal" || f.kind === "dmg");
  const moment = input.combatMoment;
  const result = counter ? "INTERRUPTED · enemy intent canceled" : float
    ? `${float.kind === "heal" ? "HEAL" : "HIT"} ${float.text} · ${battle.units.find(u => u.id === float.unitId)?.name || "unit"}`
    : moment ? `${moment.title} · ${moment.consequence}` : null;
  const mode: DecisionMode = threats.length ? "REACT" : targeting ? "TARGET" : busy && result ? "RESOLVE" : !interactive ? "WAIT" : "READ";
  let title: string, detail: string;
  if (mode === "REACT") {
    title = `INCOMING ${threats.length}`;
    detail = targetPrompt || (interruptTargetIds.length ? "Interrupt available · target a marked source" : canReposition ? "Move off striped cells · attack remains locked" : "Striped cells mark the announced attack");
  } else if (mode === "TARGET") {
    title = targetIds.length ? "CHOOSE TARGET" : "NO TARGET";
    detail = targetPrompt!;
  } else if (mode === "RESOLVE") {
    title = "RESOLVED"; detail = result!;
  } else if (mode === "WAIT") {
    title = battle.outcome === "victory" ? "SECTOR SECURED" : battle.outcome === "defeat" ? "OPERATION FAILED" : actor?.team === "enemy" ? "ENEMY ACTION" : "RESOLVING";
    detail = result || (actor ? actor.name : "Preparing next activation");
  } else {
    title = foundationGuidance?.title || (guidance?.title === "THE PACK FIGHTS ON" ? guidance.title : actor?.hasMoved ? "CHOOSE ACTION" : "READ THE FIELD");
    detail = guidance?.copy || directive.action;
  }
  if (!threats.length && !targeting && battle.reinforcement?.telegraphed && !battle.reinforcement.spawned && mode === "READ") {
    title = "REINFORCEMENT INBOUND"; detail = "Marked entry · not spawned yet";
  }
  return { mode, actor, interactive, targeting, targetIds, interruptTargetIds, threats, danger, sources, objective, title, detail, result,
    actions: skills.map(s => ({ id: s.id, reason: !interactive ? "WAIT" : !s.ready ? `CD ${s.cd}` : skillNeedsTargetPick(s) && !s.targets.length ? "NO TARGET" : battle.actionSkillId === s.id && targeting ? "CANCEL" : "READY" })),
    // An existing atlas owns the primary impact. Other layers retain numbers and
    // genuine consequences, without replaying a second burst for the same action.
    showFallbackImpact: input.combatFx.length === 0,
    showFallbackMasterFx: false,
    // When interrupt replaces pressure, retain the already scheduled contact budget.
    primaryFx: input.combatFx.some(fx => fx.name === "cnc_interrupt") ? input.combatFx.filter(fx => fx.name !== "cnc_pressure").map(fx => fx.name === "cnc_interrupt" ? { ...fx, durationMs: input.combatFx.find(f => f.name === "cnc_pressure")?.durationMs ?? fx.durationMs } : fx) : input.combatFx,
  };
}

/** Percentage footprint inside adjacent projected cell centers. At narrow widths
 * this is intentionally <44px; never extend invisible targets over neighbors. */
export function cellTouchStyle(row: number, columns: number, rows: number) {
  const n = row / Math.max(1, rows - 1);
  return { "--cell-touch-w": `${((68 + n * 16) / Math.max(1, columns - 1)) * .88}cqw`,
    "--cell-touch-h": `${(52 / Math.max(1, rows - 1)) * .88}cqh` };
}
