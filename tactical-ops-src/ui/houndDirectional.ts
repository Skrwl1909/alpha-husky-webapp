/** Render-only HOUND sprite selection.
 * Uses the archetype already assigned by the accepted combat rules.
 * No new enemy definitions, actions, spawns or identity overrides.
 */
import type { CombatUnit } from "../combat/types";

export type HoundFacing = "front" | "back" | "left" | "right";
export const HOUND_VISUAL_ARCHETYPES = [
  "BULWARK", "MARKSMAN", "DISRUPTOR", "SKIRMISHER", "COURIER",
] as const;
type VisualHound = (typeof HOUND_VISUAL_ARCHETYPES)[number];
const known = new Set<string>(HOUND_VISUAL_ARCHETYPES);

/** null preserves the existing original art for legacy, commander and allies. */
export function houndView(
  unit: Pick<CombatUnit, "team" | "role" | "archetype">,
  facing: HoundFacing,
): string | null {
  const role = unit.role;
  const archetype = unit.archetype;
  if (unit.team !== "enemy" || role !== "hostile" || !archetype || !known.has(archetype)) return null;
  if (!["front", "back", "left", "right"].includes(facing)) return null;
  return `/images/tactical_ops/hounds/hound_${(archetype as VisualHound).toLowerCase()}_${facing}.webp`;
}

/** Optional attack key poses. The source hound art remains the fallback for
 * vertical facings, unsupported actions, and every archetype without a pose.
 * These choices are presentation-only and never infer an unconfirmed action.
 */
export function houndAttackPose(
  unit: Pick<CombatUnit, "team" | "role" | "archetype">,
  style: "melee" | "heavy" | "ranged" | "jam",
  facing: HoundFacing,
): string | null {
  if ((facing !== "left" && facing !== "right") || !houndView(unit, facing)) return null;
  if (unit.archetype === "SKIRMISHER" && (style === "melee" || style === "heavy"))
    return "/images/tactical_ops/hounds/motion/skirmisher_lunge.webp";
  if (unit.archetype === "BULWARK" && (style === "melee" || style === "heavy"))
    return "/images/tactical_ops/hounds/motion/bulwark_heavy_impact.webp";
  if (unit.archetype === "MARKSMAN" && style === "ranged")
    return "/images/tactical_ops/hounds/motion/marksman_firing.webp";
  return null;
}
