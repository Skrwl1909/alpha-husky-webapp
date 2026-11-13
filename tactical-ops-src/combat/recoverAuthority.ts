import { advanceToNext, applyAi, planAi, startBattle, tryMove, tryRecover, trySkill, trySkip } from "./battle";
import { applyRunCombatProfile } from "./combatProfileV3";
import { getStatusSequence, resetStatusSeq } from "./effects";
import { selectAcceptedIntentRules, TACTICAL_VNEXT_RULESET, type IntentPlan, type RunRulesContract } from "./intentContract";
import { emptyThreatCycle, interruptLockedThreatAfterControl, markAlliedReaction, pruneInvalidThreats, queueEnemyThreat, resolveEnemyThreat, type ThreatCycle } from "./intentScheduler";
import { skillNeedsTargetPick, validTargetIds } from "./targeting";
import { selectAcceptedBattleRules, type BattleEvent, type BattleState } from "./types";
import { withFieldRend } from "../data/fieldContracts";
import { fieldReport } from "../data/fieldOps";
import { getMissionDef, missionBattleRules, missionForContext, missionSpawnsForSquad } from "../data/operations";
import { resolveGrowthSkill } from "../data/playerGrowth";
import { withTeammateSidegrades } from "../data/shadowSidegrade";
import { getSkill } from "../data/skills";
import type { OperationMissionRun } from "../host/foundationProgression";

export type RecoverCommand =
  | { type: "move"; c: number; r: number }
  | { type: "skill"; skillId: string; targetId?: string }
  | { type: "recover" | "skip" };

export interface RecoverFrame {
  battle: BattleState;
  threats: IntentPlan[];
  events: BattleEvent[];
  skillId?: string;
  interrupted?: boolean;
}

export interface RecoverView {
  runId: string;
  revision: number;
  token: string;
  battle: BattleState;
  threats: IntentPlan[];
  frames?: RecoverFrame[];
}

type Encounter = OperationMissionRun & Pick<Parameters<typeof withTeammateSidegrades>[1], "kodaSidegrade" | "shadowSidegrade">;
interface Snapshot {
  battle: BattleState;
  cycle: ThreatCycle;
  statusSequence: number;
}

function configure(run: Encounter) {
  const contract = run.rulesContract;
  if (run.missionId !== "field-relay-recovery" || contract?.missionId !== run.missionId ||
      contract.rulesetVersion !== TACTICAL_VNEXT_RULESET || contract.missionRevision !== 1 ||
      !run.combatProfileV3 || !run.fieldContext) throw Error("invalid_recover_encounter");
  selectAcceptedBattleRules(contract);
  selectAcceptedIntentRules(contract as RunRulesContract);
  const mission = missionForContext(getMissionDef(run.missionId)!, run.fieldContext, contract.missionRevision);
  const pet = run.combatProfileV2?.pet;
  const spawns = missionSpawnsForSquad(mission, run.squadIds, pet, run.fieldContext.approach);
  if (!spawns || (run.squadIds.some(id => id.startsWith("pet:")) && !pet)) throw Error("invalid_recover_roster");
  // Re-register the frozen mastery skill definitions in a fresh worker before stepping.
  return {
    spawns: applyRunCombatProfile(withTeammateSidegrades(withFieldRend(spawns, run.fieldContext.fieldRend), run),
      run.combatProfileV3, run.combatProfileV2),
    rules: missionBattleRules(mission, false, run.fieldContext),
  };
}

function enemyActivation(battle: BattleState, cycle: ThreatCycle) {
  const actor = battle.activeId!;
  const skip = () => ({ ...trySkip(battle), cycle });
  if (cycle.interruptedEnemyIds?.includes(actor)) {
    cycle = { ...cycle, interruptedEnemyIds: cycle.interruptedEnemyIds.filter(id => id !== actor) };
    return skip();
  }
  const locked = cycle.pending.find(t => t.plan.enemyId === actor);
  if (locked) {
    const resolved = resolveEnemyThreat(cycle, battle);
    cycle = resolved.cycle;
    if (resolved.state === battle) return skip();
    const action = locked.action.type === "move" ? locked.action.then : locked.action;
    return { ...resolved, events: resolved.events ?? [], skillId: action?.type === "skill" ? action.skillId : undefined };
  }
  const announced = queueEnemyThreat(cycle, battle);
  if (announced !== cycle) {
    cycle = announced;
    return skip();
  }
  const action = planAi(battle);
  const skill = action.type === "move" ? action.then : action;
  return { ...applyAi(battle, action), cycle, skillId: skill?.type === "skill" ? skill.skillId : undefined };
}

export function stepRecover(run: Encounter, saved?: Snapshot, command?: RecoverCommand) {
  const { spawns, rules } = configure(run);
  const initial = saved ? null : startBattle(null, spawns, rules.objective, rules.reinforcement, null, rules.directive, run.playerGrowth);
  if (saved) resetStatusSeq(saved.statusSequence);
  let battle = saved?.battle ?? initial!.state;
  let cycle = saved?.cycle ?? emptyThreatCycle();
  const frames: RecoverFrame[] = [];
  const frame = (events: BattleEvent[], skillId?: string, interrupted?: boolean) => {
    frames.push({ battle, threats: cycle.pending.map(t => t.plan), events, skillId, interrupted });
  };
  const advance = () => {
    const next = advanceToNext(battle);
    battle = next.state;
    cycle = pruneInvalidThreats(cycle, battle);
    cycle = markAlliedReaction(cycle, battle);
    frame(next.events);
  };

  if (command) {
    const actor = battle.units.find(unit => unit.id === battle.activeId);
    if (battle.outcome !== "ongoing" || actor?.team !== "ally" || actor.defeated || actor.hasActed) return null;
    if (command.type === "skill") {
      if (!actor.skillIds.includes(command.skillId)) return null;
      const skill = resolveGrowthSkill(getSkill(command.skillId), actor.growth);
      if (skillNeedsTargetPick(skill)
        ? !command.targetId || !validTargetIds(battle.units, actor, skill).includes(command.targetId)
        : command.targetId !== undefined) return null;
    }
    const action = command.type === "move" ? tryMove(battle, command.c, command.r)
      : command.type === "skill" ? trySkill(battle, command.skillId, command.targetId)
      : command.type === "recover" ? tryRecover(battle) : trySkip(battle);
    if (!action.ok) return null;
    const interrupt = command.type === "skill" && command.targetId
      ? interruptLockedThreatAfterControl(cycle, battle, action.state, actor.id, command.targetId, command.skillId, action.events)
      : { cycle, interrupted: false };
    battle = action.state;
    // Movement keeps the current activation. Other actions advance the initiative queue.
    cycle = command.type === "move" ? interrupt.cycle : pruneInvalidThreats(interrupt.cycle, battle);
    frame(action.events, command.type === "skill" ? command.skillId : undefined, interrupt.interrupted);
    if (battle.outcome === "ongoing" && command.type !== "move") advance();
  } else if (initial) {
    frame(initial.events);
  }

  for (let count = 0; battle.outcome === "ongoing"; count++) {
    const actor = battle.units.find(unit => unit.id === battle.activeId);
    if (actor?.team === "ally") break;
    if (!actor || count === 64) throw Error("recover_activation_limit");
    const step = enemyActivation(battle, cycle);
    battle = step.state;
    cycle = step.cycle;
    frame(step.events, "skillId" in step ? step.skillId : undefined);
    if (battle.outcome === "ongoing") advance();
  }
  const report = fieldReport(battle);
  if (report && run.fieldContext?.fieldContractsVersion) report.fieldContractsVersion = run.fieldContext.fieldContractsVersion;
  if (report && run.fieldContext?.veteranChallenge) report.veteranChallenge = run.fieldContext.veteranChallenge;
  // The scheduler's historical ledger is presentation evidence and isn't read by any transition.
  return { battle, cycle: { ...cycle, ledger: [] }, statusSequence: getStatusSequence(), report, frames };
}
