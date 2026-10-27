import type { BattleState } from "../combat/types";
import type { MissionDef } from "../data/operations";
import { getSkill } from "../data/skills";
import { resolveGrowthSkill } from "../data/playerGrowth";
import { validTargetIds } from "../combat/targeting";
import { reachableCells } from "../combat/movement";

export interface PlayerGuidance { title: string; copy: string }

/** First contact: offer the next legal action, not raw distance notation.
 * Read-only guidance; combat, targeting and saved progression are untouched. */
export function foundationBattleGuidance(battle: BattleState, stageId: string | null | undefined): PlayerGuidance | null {
  if (stageId !== "solo-1" || battle.outcome !== "ongoing") return null;
  const actor = battle.units.find(u => u.id === battle.activeId);
  const scout = battle.units.find(u => u.team === "enemy" && !u.defeated);
  if (!actor || actor.defId !== "alpha" || actor.defeated || actor.hasActed || !scout || battle.mode === "targeting") return null;
  const strike = resolveGrowthSkill(getSkill("alpha-strike"), actor.growth);
  if ((actor.cooldowns[strike.id] ?? 0) === 0 && validTargetIds(battle.units, actor, strike).includes(scout.id)) {
    return { title: "STRIKE IS READY", copy: "Tap STRIKE (A1), then tap the highlighted scout." };
  }
  if (actor.hasMoved) {
    return { title: "NEXT TURN", copy: "Still too far away. Tap SKIP, then move closer on Alpha's next turn." };
  }
  if (reachableCells(actor, battle.units).length > 0) {
    return { title: "MOVE TOWARD SCOUT", copy: "Tap a highlighted tile. Get 1 tile away from the scout to use STRIKE." };
  }
  return { title: "NO MOVE AVAILABLE", copy: "Choose an available action or SKIP to advance the turn." };
}
/** A contextual, non-blocking explanation. Never alters legal turns, AI or rewards. */
export function playerBattleGuidance(battle: BattleState, mission: MissionDef | null): PlayerGuidance | null {
  if (battle.outcome !== "ongoing") return null;
  const actor = battle.units.find(u => u.id === battle.activeId);
  if (!actor || actor.team !== "ally" || actor.defeated || actor.hasActed) return null;
  const alive = battle.units.filter(u => !u.defeated && u.team === "ally");
  const alphaDown = battle.units.some(u => u.defId === "alpha" && u.defeated);
  if (battle.mode === "targeting" && battle.actionSkillId) {
    const skill = resolveGrowthSkill(getSkill(battle.actionSkillId), actor.growth);
    const count = validTargetIds(battle.units, actor, skill).length;
    if (count === 0) return {
      title: "NO TARGET IN RANGE",
      copy: actor.hasMoved ? "This skill cannot hit from here. Tap the skill again to cancel, then choose another ability or SKIP." : "Tap the skill again to cancel. Move closer, then try again."
    };
    return { title: "TARGET READY", copy: `Tap one of the ${count} highlighted legal targets to use ${skill.name}.` };
  }
  const available = actor.skillIds.map(id => resolveGrowthSkill(getSkill(id),actor.growth)).filter(skill => (actor.cooldowns[skill.id] ?? 0) === 0);
  const attackReady = available.some(skill => (skill.targetType === "ENEMY_SINGLE" || skill.targetType === "AREA_RADIUS") && validTargetIds(battle.units,actor,skill).length > 0);
  if (alphaDown && alive.length > 0) {
    return {title:"THE PACK FIGHTS ON",copy:attackReady ? `${actor.name} can still attack. Select a skill and a highlighted target.` : actor.hasMoved ? `${actor.name} has no enemy in range. Use a support skill or SKIP to pass the turn.` : `${actor.name} is still active. Move into range, use support, or SKIP.`};
  }
  if (mission?.objectiveType === "HOLD" && battle.objective?.type === "HOLD" && !battle.units.some(u => u.team === "enemy" && !u.defeated)) return {title:"SECURE THE RELAY",copy:"No hostiles remain. Move a living ally into the marked HOLD zone and maintain control through the required round changes."};
  if (mission?.objectiveType === "SURVIVE" && battle.objective?.type === "SURVIVE" && !battle.units.some(u => u.team === "enemy" && !u.defeated)) return {title:"HOLD FORMATION",copy:"Enemies cleared. Keep every squad member alive until the survival timer completes. Use SKIP to advance turns."};
  if (!attackReady && !actor.hasMoved && reachableCells(actor,battle.units).length > 0) return {title:"POSITION FIRST",copy:"No enemy in attack range. Move into range or use an available support skill."};
  if (!attackReady && actor.hasMoved) return {title:"NO ATTACK IN RANGE",copy:"Use an available support skill or SKIP. Your next turn will come."};
  if (mission?.objectiveType === "HOLD") return {title:"HOLD THE RELAY",copy:"Keep a living ally inside the marked zone. Clear enemies contesting it."};
  if (mission?.objectiveType === "SURVIVE") return {title:"SURVIVE THE WAVES",copy:"Keep your squad standing until the required round. Eliminating enemies early does not end the timer."};
  if (mission?.objectiveType === "RECOVER") return {title:"REACH THE RELAY",copy:"Approach the terminal and activate RECOVER when the signal is open."};
  return null;
}
