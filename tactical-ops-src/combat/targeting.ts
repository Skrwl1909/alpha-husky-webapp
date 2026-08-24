import type { Cell, CombatUnit, SkillDef, TargetType } from "./types";
import { chebyshev, inBounds } from "./movement";

export function inSkillRange(caster: CombatUnit, target: { c: number; r: number }, skill: SkillDef): boolean {
  const d = chebyshev(caster, target);
  return d >= skill.minRange && d <= skill.maxRange;
}

export function living(units: CombatUnit[], team?: CombatUnit["team"]): CombatUnit[] {
  return units.filter((u) => !u.defeated && (team ? u.team === team : true));
}

export function unitsInRadius(units: CombatUnit[], center: Cell, radius: number, team?: CombatUnit["team"]): CombatUnit[] {
  return living(units, team).filter((u) => chebyshev(u, center) <= radius);
}

export function resolveSkillTargets(
  units: CombatUnit[],
  caster: CombatUnit,
  skill: SkillDef,
  targetId?: string | null,
  cell?: Cell | null,
): CombatUnit[] {
  switch (skill.targetType) {
    case "SELF":
      return caster.defeated ? [] : [caster];
    case "ALLY_SINGLE": {
      const t = units.find((u) => u.id === targetId);
      if (!t || t.defeated || t.team !== caster.team) return [];
      if (!inSkillRange(caster, t, skill)) return [];
      return [t];
    }
    case "ENEMY_SINGLE": {
      const t = units.find((u) => u.id === targetId);
      if (!t || t.defeated || t.team === caster.team) return [];
      if (!inSkillRange(caster, t, skill)) return [];
      return [t];
    }
    case "ALLY_AOE":
      return unitsInRadius(units, { c: caster.c, r: caster.r }, skill.radius, caster.team);
    case "ENEMY_AOE":
      return unitsInRadius(
        units,
        { c: caster.c, r: caster.r },
        skill.radius,
        caster.team === "ally" ? "enemy" : "ally",
      );
    case "AREA_RADIUS": {
      let center: Cell | null = null;
      if (cell && inBounds(cell.c, cell.r)) center = cell;
      else if (targetId) {
        const t = units.find((u) => u.id === targetId);
        if (t) center = { c: t.c, r: t.r };
      }
      if (!center) return [];
      if (!inSkillRange(caster, center, skill)) return [];
      const foe = caster.team === "ally" ? "enemy" : "ally";
      return unitsInRadius(units, center, skill.radius, foe);
    }
    default:
      return [];
  }
}

export function validTargetIds(units: CombatUnit[], caster: CombatUnit, skill: SkillDef): string[] {
  switch (skill.targetType) {
    case "SELF":
    case "ALLY_AOE":
    case "ENEMY_AOE":
      return [caster.id];
    case "ALLY_SINGLE":
      return living(units, caster.team)
        .filter((u) => inSkillRange(caster, u, skill))
        .map((u) => u.id);
    case "ENEMY_SINGLE":
      return living(units, caster.team === "ally" ? "enemy" : "ally")
        .filter((u) => inSkillRange(caster, u, skill))
        .map((u) => u.id);
    case "AREA_RADIUS":
      return living(units, caster.team === "ally" ? "enemy" : "ally")
        .filter((u) => inSkillRange(caster, u, skill))
        .map((u) => u.id);
    default:
      return [];
  }
}

export function skillNeedsTargetPick(skill: SkillDef): boolean {
  return (
    skill.targetType === "ALLY_SINGLE" ||
    skill.targetType === "ENEMY_SINGLE" ||
    skill.targetType === "AREA_RADIUS"
  );
}

export function isLegalTargetType(type: TargetType): boolean {
  return (
    type === "SELF" ||
    type === "ALLY_SINGLE" ||
    type === "ENEMY_SINGLE" ||
    type === "ALLY_AOE" ||
    type === "ENEMY_AOE" ||
    type === "AREA_RADIUS"
  );
}
