import type { MissionDirective } from "../combat/types";
import type { MissionDef } from "./operations";
import type { FieldContext } from "./fieldOps";

export const ADVANCED_DEADLINES: Record<string, number> = {
  "field-relay-recovery": 6, "field-relay-hold": 6,
  "field-relay-intercept": 7, "field-isolated-hold": 5,
};

/** Validated packages, rather than arbitrary random stacks. No stat multipliers. */
export function missionDirectives(mission: MissionDef, context?: Partial<FieldContext>): MissionDirective[] {
  const conditions = mission.directive ? [structuredClone(mission.directive)] : [];
  if (mission.activity !== "FIELD_OP" || context?.reportVersion !== 3 || context.directiveTier !== "advanced") return conditions;
  const pursuit = context.directiveSet === "pursuit";
  if (pursuit && mission.objectiveType === "SURVIVE") {
    const inbound = conditions.find((d) => d.reinforcement);
    if (inbound?.reinforcement) {
      inbound.reinforcement.triggerRound = 2;
      inbound.reinforcement.spawn.r = 0;
      inbound.copy = "A HOUND enters from the north-east in round 2, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.";
    }
  }
  const deadline = ADVANCED_DEADLINES[mission.missionId];
  if (pursuit && deadline) {
    conditions.push({ type: "NO_SAFE_EXTRACTION", name: "NO SAFE EXTRACTION", maxRounds: deadline,
      copy: `Complete by the end of round ${deadline}. At round ${deadline + 1}, the operation fails even if your squad is standing.` });
  } else if (!conditions.some((d) => d.supportCooldownExtra)) {
    conditions.push({ type: "DISRUPTED_SUPPORT", name: "DISRUPTED SUPPORT", supportCooldownExtra: 1,
      copy: "Healing and allied support skills take 1 extra personal turn to recharge. SILENT SHELTER bypasses this penalty for PACK SUPPORT." });
  }
  if (!conditions.some((d) => d.reinforcement)) {
    const triggerRound = pursuit ? 2 : 3;
    conditions.push({ type: "REINFORCEMENTS", name: "REINFORCEMENTS",
      copy: `A HOUND enters from the ${pursuit ? "north" : "south"}-east in round ${triggerRound}, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.`,
      reinforcement: { spawn: { defId: "hostile", id: "field-reinforcement", c: 7, r: pursuit ? 0 : 4 }, triggerRound, telegraphed: true, spawned: false } });
  }
  return conditions;
}
