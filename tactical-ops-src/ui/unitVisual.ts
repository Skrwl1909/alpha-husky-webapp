import type { CSSProperties } from "react";
import { GRID_ROWS, BATTLEFIELD_VNEXT_PREVIEW, type CombatUnit } from "../combat/types";
import { fieldPercent } from "../combat/movement";

/** One render contract for the resting token and its temporary attack actor.
 * Values preserve the accepted field footprint; never use these for input.
 */
export const UNIT_VISUAL = {
  legacy: {
    default: "min(10cqw, 49px, 10cqh)",
    alpha: "min(10.2cqw, 52px, 9.6cqh)",
    leader: "min(10.2cqw, 54px, 12cqh)",
    hound: "min(10.1cqw, 50px, 13cqh)",
  },
  vnext: {
    default: "min(7.6cqw, 39px, 6.7cqh)",
    alpha: "min(8cqw, 41px, 6.7cqh)",
    leader: "min(7.9cqw, 44px, 8.8cqh)",
    hound: "min(7.85cqw, 41px, 8.8cqh)",
  },
  depth: [.92, .95, .98, 1.01, 1.04],
  // Measured source-canvas ratios, not gameplay dimensions.
  poseWidth: { skirmisher: (279 / 288) / (203 / 512), bulwark: (266 / 288) / (343 / 512) },
} as const;

export function unitVisualStyle(unit: Pick<CombatUnit, "role" | "r">, poseScale = 1): CSSProperties {
  const sizes = BATTLEFIELD_VNEXT_PREVIEW ? UNIT_VISUAL.vnext : UNIT_VISUAL.legacy;
  const role = unit.role === "alpha" ? "alpha" : unit.role === "leader" ? "leader" : unit.role === "hostile" ? "hound" : "default";
  const depth = Math.max(0, Math.min(4, Math.floor(unit.r * 4 / Math.max(1, GRID_ROWS - 1))));
  return {
    width: poseScale === 1 ? sizes[role] : `calc(${sizes[role]} * ${poseScale})`,
    "--motion-depth": UNIT_VISUAL.depth[depth],
  } as CSSProperties;
}

/** Hands/claws reach the victim; the attacker's feet stop short of its body.
 * This changes only the temporary picture, never the unit's legal destination.
 */
export function meleeContactPosition(unit: Pick<CombatUnit, "role" | "r">,
  from: {c:number;r:number}, to: {c:number;r:number}) {
  const point=fieldPercent(to.c,to.r);
  const dx=to.c-from.c,dy=to.r-from.r,length=Math.hypot(dx,dy)||1;
  const width=unitVisualStyle(unit).width;
  return {
    x:`calc(${point.x}% - ${dx/length} * ${width} * 0.7)`,
    y:`calc(${point.y}% - ${dy/length} * ${width} * 0.7)`,
  };
}
