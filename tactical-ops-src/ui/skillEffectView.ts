import type { CombatUnit, SkillDef, TargetType } from "../combat/types";
import { STATUS_LABEL } from "../combat/effects";
import { masteryDef } from "../data/packMastery";
import { canonicalGrowthSkillId, type HeroGrowth } from "../data/playerGrowth";

const targetLabels: Record<TargetType, string> = {
  SELF: "Self",
  ENEMY_SINGLE: "One enemy",
  ALLY_SINGLE: "One ally",
  ALLY_AOE: "Allies around caster",
  AREA_RADIUS: "Enemies around target cell",
  ENEMY_AOE: "Enemies around caster",
};

type UnitBuild = Pick<CombatUnit, "defId" | "move" | "recoverRange" | "combatMastery" | "skillIds">;

/** Read resolved skill data and the matching build. This does not resolve combat. */
export function skillEffectView(skill: SkillDef, growth?: HeroGrowth, cooldown = skill.cooldownMax) {
  const rank = growth?.ranks[canonicalGrowthSkillId(skill.id)] ?? 0;
  const reach = skill.targetType === "SELF" ? null
    : skill.targetType === "ALLY_AOE" || skill.targetType === "ENEMY_AOE" ? `Radius ${skill.radius}`
    : skill.targetType === "AREA_RADIUS" ? `Range ${skill.maxRange} · Radius ${skill.radius}`
    : `Range ${skill.minRange < skill.maxRange ? `${skill.minRange}–` : ""}${skill.maxRange}`;
  const effects = skill.effects.flatMap(effect => {
    if (effect.kind === "heal") return ["Restores missing HP"];
    if (effect.kind !== "status" || !effect.status) return [];
    const turns = effect.duration ?? 1;
    const condition = effect.maxHpRatio ? ` at ≤${effect.maxHpRatio * 100}% HP before healing` : "";
    return [`${STATUS_LABEL[effect.status]} ${turns}T${condition}`];
  });
  return {
    rank,
    discipline: growth?.discipline ?? null,
    version: growth?.rulesVersion ?? null,
    geometry: [targetLabels[skill.targetType], reach, `Cooldown ${cooldown}T`].filter(Boolean).join(" · "),
    effects,
  };
}

export function buildIdentity(unit: UnitBuild, growth: HeroGrowth | undefined, recovery: boolean): string {
  const mastery = unit.combatMastery;
  const def = masteryDef(unit.defId);
  const signature = mastery?.stage && mastery.stage >= 3 && mastery.selected ? def?.options[mastery.selected] : null;
  const isPet = unit.defId.startsWith("pet:");
  // Veteran PET always adds RECOVER reach, even on its mobility signature.
  const veteran = unit.skillIds.some(id => id.endsWith(":veteran"));
  return [
    growth?.discipline?.toUpperCase(),
    mastery && mastery.stage >= 2 ? `TRAINED · ${def?.trained.name}` : null,
    signature ? `SIGNATURE ${mastery?.selected} · ${signature.name}` : null,
    veteran ? "VETERAN ACTIVE" : null,
    isPet ? `Move ${unit.move} cells` : null,
    isPet && (unit.recoverRange ?? 1) > 1
      ? recovery ? `RECOVER from ${unit.recoverRange} cells during a signal window` : "RECOVER bonus not applicable"
      : null,
  ].filter(Boolean).join(" · ");
}
