import { DEF_CURVE, type CombatUnit } from "./types";
import { effectiveDef } from "./effects";

/** RAW = ATK × multiplier; MITIGATED = RAW × (1 - DEF/(DEF+50)). */
export function mitigatedDamage(rawAtk: number, skillMultiplier: number, defender: CombatUnit): number {
  const raw = rawAtk * skillMultiplier;
  const def = effectiveDef(defender);
  const mitigation = def / (def + DEF_CURVE);
  return Math.max(1, Math.round(raw * (1 - mitigation)));
}

export function computeHeal(base: number, scale: number, atk: number, target: CombatUnit): number {
  const raw = Math.round(base + atk * scale);
  return Math.max(0, Math.min(raw, target.maxHp - target.hp));
}
