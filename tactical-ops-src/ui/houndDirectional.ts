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
