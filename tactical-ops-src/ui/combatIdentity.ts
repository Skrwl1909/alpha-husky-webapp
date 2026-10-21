import type { BattleEvent, CombatUnit } from "../combat/types";
import { canonicalGrowthSkillId, resolveGrowthSkill, type Discipline, type HeroGrowth } from "../data/playerGrowth";
import { getSkill } from "../data/skills";

/** Presentation-only, based exclusively on the accepted run and confirmed battle events. */
export type CombatAffinity = "alpha" | "cnc" | "shadow" | "pet";
export type CombatTier = "base" | "rank1" | "rank2" | "trained" | "signature";
export interface CombatMoment {
  id: number;
  actorId: string;
  targetId: string;
  affinity: CombatAffinity;
  tier: CombatTier;
  title: string;
  consequence: string;
  mode: "damage" | "heal" | "control" | "guard" | "movement" | "support";
  interrupted: boolean;
}
export function affinityFor(unit: Pick<CombatUnit, "defId" | "role">): CombatAffinity {
  if (unit.defId === "alpha" || unit.role === "alpha") return "alpha";
  if (unit.defId === "ally-02") return "cnc";
  if (unit.defId === "ally-03") return "shadow";
  return "pet";
}
export function trueSkillRank(unit: CombatUnit, skillId: string): 0 | 1 | 2 {
  return unit.growth?.ranks[canonicalGrowthSkillId(skillId)] || 0;
}
export function skillMasteryActive(unit: CombatUnit, skillId: string): "trained" | "signature" | null {
  const mastery = unit.combatMastery;
  if (!mastery || mastery.stage < 2) return null;
  const canonical = canonicalGrowthSkillId(skillId);
  const identity = affinityFor(unit);
  if (identity === "cnc" && canonical === "u02-suppress") return mastery.stage >= 3 ? "signature" : "trained";
  if (identity === "shadow") {
    if (canonical === "u03-pack") return mastery.stage >= 3 && mastery.selected === "B" ? "signature" : "trained";
    if (canonical === "u03-mend" && mastery.stage >= 3 && mastery.selected === "A") return "signature";
  }
  if (identity === "pet" && canonical === "pet-hamstring" && mastery.stage >= 3 && mastery.selected === "A") return "signature";
  return null;
}
export function combatTier(unit: CombatUnit, skillId: string): CombatTier {
  const mastery = skillMasteryActive(unit, skillId);
  if (mastery) return mastery;
  const rank = trueSkillRank(unit, skillId);
  return rank === 2 ? "rank2" : rank === 1 ? "rank1" : "base";
}
export function skillRankLabel(unit: CombatUnit, skillId: string): string | null {
  const tier = combatTier(unit, skillId);
  return tier === "signature" ? "SIGNATURE" : tier === "trained" ? "TRAINED" : tier === "rank2" ? "R2" : tier === "rank1" ? "R1" : null;
}
export function combatIdentityLabel(unit: CombatUnit): string | null {
  if (unit.defId === "alpha") return unit.growth?.discipline?.toUpperCase() || null;
  const mastery = unit.combatMastery;
  if (!mastery || mastery.stage < 2) return null;
  return mastery.stage >= 3 && mastery.selected ? `MASTERED · ${mastery.selected}` : "TRAINED · 3/8";
}
export function skillChangePreview(baseId: string, hero: HeroGrowth, nextRank: 1 | 2, chosenPath: Discipline): string[] {
  const skill = getSkill(baseId);
  const growth = { ...hero, discipline: hero.discipline || chosenPath };
  const before = resolveGrowthSkill(skill, growth);
  const after = resolveGrowthSkill(skill, { ...growth, ranks: { ...growth.ranks, [baseId]: nextRank } });
  const diff: string[] = [];
  if (after.maxRange !== before.maxRange) diff.push(`RANGE ${before.maxRange} → ${after.maxRange}`);
  if (after.cooldownMax !== before.cooldownMax) diff.push(`COOLDOWN ${before.cooldownMax} → ${after.cooldownMax}`);
  const durationBefore = before.effects.find(e => e.kind === "status")?.duration || 0;
  const durationAfter = after.effects.find(e => e.kind === "status")?.duration || 0;
  if (durationAfter !== durationBefore) diff.push(`STATUS ${durationBefore} → ${durationAfter} TURNS`);
  return diff;
}
export function confirmedSkillMoment(actor: CombatUnit, skillId: string, events: readonly BattleEvent[], sequence: number, interrupted: boolean): CombatMoment | null {
  const outcomes = events.filter(ev => (ev.type === "damage" || ev.type === "heal" || ev.type === "status") && !!ev.unitId);
  if (!outcomes.length && !interrupted) return null;
  const skill = resolveGrowthSkill(getSkill(skillId), actor.growth);
  const damage = outcomes.filter(ev => ev.type === "damage").reduce((sum, ev) => sum + (ev.amount || 0), 0);
  const heal = outcomes.filter(ev => ev.type === "heal").reduce((sum, ev) => sum + (ev.amount || 0), 0);
  const status = outcomes.filter(ev => ev.type === "status");
  const guard = status.some(ev => ev.kind === "guard");
  const mode: CombatMoment["mode"] = interrupted ? "control" : damage ? "damage" : heal ? "heal" : guard ? "guard" : status.length ? "control" : "support";
  const consequence = interrupted ? "ENEMY INTENT CANCELED" : damage ? `−${damage} HP` : heal ? `+${heal} HP` : status.length ? (status[0].text || "STATUS APPLIED") : "EFFECT RESOLVED";
  const tier = combatTier(actor, skillId);
  const rank = skillRankLabel(actor, skillId);
  const targetId = skill.targetType === "ALLY_AOE" || skill.targetType === "SELF" ? actor.id : outcomes[0]?.unitId || actor.id;
  return { id: sequence, actorId: actor.id, targetId, affinity: affinityFor(actor), tier, title: `${skill.name}${rank ? " · " + rank : ""}`, consequence, mode, interrupted };
}
export function confirmedPathfinderMove(actor: CombatUnit, moved: CombatUnit, sequence: number): CombatMoment | null {
  if (affinityFor(actor) !== "pet" || actor.combatMastery?.stage !== 3 || actor.combatMastery.selected !== "B") return null;
  if (actor.c === moved.c && actor.r === moved.r) return null;
  return { id: sequence, actorId: actor.id, targetId: moved.id, affinity: "pet", tier: "signature", title: "PATHFINDER · SIGNATURE", consequence: "POSITION SECURED", mode: "movement", interrupted: false };
}
