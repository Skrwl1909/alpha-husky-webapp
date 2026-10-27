import type { SkillDef } from "../combat/types";
import { HERO_SKILLS, canonicalGrowthSkillId, growthHero, resolveGrowthSkill, type Discipline, type GrowthSnapshot, type HeroGrowth } from "./playerGrowth";
import { getSkill } from "./skills";
import { withTeammateSidegrades } from "./shadowSidegrade";
import { UNIT_DEFS } from "./units";
import type { PackMastery } from "./packMastery";

type Choices = { kodaSidegrade?: "A" | "B" | null; shadowSidegrade?: "A" | "B" | null; packMastery?: PackMastery };
/** The same composition order as battle creation. Preview never writes progression. */
export function growthPreviewBase(skillId: string, choices?: Choices | null): SkillDef {
  const heroId = Object.keys(HERO_SKILLS).find(id => HERO_SKILLS[id as keyof typeof HERO_SKILLS].includes(skillId));
  if (!heroId) return getSkill(skillId);
  const spawn = withTeammateSidegrades([{ id: heroId, defId: heroId, c: 0, r: 0 }], choices || {})[0];
  const def = spawn.unitDef || UNIT_DEFS[heroId];
  return getSkill(def.skillIds.find(id => canonicalGrowthSkillId(id) === skillId) || skillId);
}
export function skillDeltas(before: SkillDef, after: SkillDef): string[] {
  const rows: string[] = [];
  const delta = (label: string, a: number, b: number) => { if (a !== b) rows.push(`${label} ${a} → ${b}`); };
  if (after.targetType === "ALLY_AOE") delta("RADIUS", before.radius, after.radius);
  else delta("RANGE", before.maxRange, after.maxRange);
  delta("COOLDOWN", before.cooldownMax, after.cooldownMax);
  for (const effect of after.effects) {
    const previous = before.effects.find(e => e.kind === effect.kind && e.status === effect.status && e.on === effect.on);
    if (effect.kind === "status" && JSON.stringify(previous) !== JSON.stringify(effect)) rows.push(
      `${effect.status} ${previous?.duration ?? 0} → ${effect.duration} TURNS${effect.maxHpRatio ? ` · ≤${effect.maxHpRatio * 100}% HP before healing` : ""}`);
    if (effect.kind === "heal") delta("HEAL BASE", previous?.base ?? 0, effect.base ?? 0);
  }
  return rows;
}
export function rankChanges(base: SkillDef, hero: HeroGrowth, rank: 1 | 2, path: Discipline): string[] {
  const selected = { ...hero, discipline: hero.discipline || path };
  return skillDeltas(resolveGrowthSkill(base, selected), resolveGrowthSkill(base, { ...selected, ranks: { ...selected.ranks, [canonicalGrowthSkillId(base.id)]: rank } }));
}
export function savedGrowthHero(snapshot: GrowthSnapshot | null | undefined, id: string) { return growthHero(snapshot, id); }

export const DOCTRINE_TRADEOFF: Record<Discipline, string> = {
  vanguard: "HOLD / SURVIVE: keep the holder inside HOWL. Gives up HOWLKEEPER's extra aura cell.",
  howlkeeper: "INTERCEPT: buff a spread-out pursuit squad. Gives up VANGUARD's added GUARD.",
  pursuer: "INTERCEPT: THRUST a courier from one extra cell. Gives up DISRUPTOR's longer control.",
  disruptor: "BOSS / HOLD: keep PRESSURE debuffs active. Locked-intent cancellation requires this doctrine and an announced interruptible threat. Gives up PURSUER's THRUST reach.",
  sentinel: "HOLD / SURVIVE: protect the relay holder with PACK SUPPORT. Gives up MEDIC's faster MEND.",
  medic: "RECOVER / BOSS: heal a hurt ally before the next hit. Gives up SENTINEL's PACK GUARD benefit.",
};
