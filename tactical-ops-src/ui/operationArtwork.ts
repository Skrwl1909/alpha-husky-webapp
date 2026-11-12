/** Pure presentation mapping. Never derives mission access, eligibility, rewards or combat rules. */
import type { MissionDef } from "../data/operations";

const ROOT = "/images/tactical_ops/presentation/command_deck";
export const OPERATION_ENVIRONMENTS = Object.freeze({
  "broken-signal": ROOT + "/operations/alpha_wartable_broken_signal_v1.webp",
  "dead-relay": ROOT + "/operations/alpha_wartable_dead_relay_v1.webp",
  "field-ops": ROOT + "/operations/alpha_wartable_fracture_front_v1.webp",
});
export const MISSION_INSIGNIA = Object.freeze({
  RECOVER: ROOT + "/mission_emblems/alpha_emblem_recover_v1_256.webp",
  HOLD: ROOT + "/mission_emblems/alpha_emblem_hold_v1_256.webp",
  SURVIVE: ROOT + "/mission_emblems/alpha_emblem_survive_v1_256.webp",
  INTERCEPT: ROOT + "/mission_emblems/alpha_emblem_intercept_v1_256.webp",
  BOSS: ROOT + "/mission_emblems/alpha_emblem_boss_v1_256.webp",
});
export type ArtMission = Pick<MissionDef, "operationId" | "objectiveType" | "activity" | "battlefield">;
/** Unknown operation falls back to the established Broken Signal environment.
 * ELIMINATE has no approved emblem in the five-asset kit: never mislabel it BOSS.
 * A name like "RELAY INTERCEPT" does not override authoritative objectiveType=RECOVER.
 */
export function operationArtwork(mission: ArtMission | null | undefined) {
  const location =
    mission?.operationId === "dead-relay" || mission?.battlefield === "dead-relay" ? "dead-relay"
    : mission?.operationId === "field-ops" || mission?.activity === "FIELD_OP" || mission?.battlefield === "field-ops" ? "field-ops"
    : "broken-signal";
  const objective = mission?.objectiveType;
  const insignia = objective && Object.prototype.hasOwnProperty.call(MISSION_INSIGNIA, objective)
    ? MISSION_INSIGNIA[objective as keyof typeof MISSION_INSIGNIA]
    : null;
  return { location, scene: OPERATION_ENVIRONMENTS[location], insignia, objective: objective || null };
}
