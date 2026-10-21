/** ALPHA HUSKY Tactical Ops Action Icons P2 (14/14).
 * Artwork-only: maps existing canonical or executable skill ids to the PNG library.
 * This file does NOT alter combat mechanics or make persistence changes.
 * Place this module inside tactical-ops-src/ui/ or adapt the import path as desired.
 * Return null for unknown skill ids and render the existing fallback.
 */
const ACTION_IMAGES = {
  "action_alpha_strike": "/images/tactical_ops/actions/action_alpha_strike.png",
  "action_alpha_rend": "/images/tactical_ops/actions/action_alpha_rend.png",
  "action_alpha_howl": "/images/tactical_ops/actions/action_alpha_howl.png",
  "action_cnc_thrust": "/images/tactical_ops/actions/action_cnc_thrust.png",
  "action_cnc_lunge": "/images/tactical_ops/actions/action_cnc_lunge.png",
  "action_cnc_pressure": "/images/tactical_ops/actions/action_cnc_pressure.png",
  "action_shadow_sweep": "/images/tactical_ops/actions/action_shadow_sweep.png",
  "action_shadow_mend": "/images/tactical_ops/actions/action_shadow_mend.png",
  "action_shadow_pack_support": "/images/tactical_ops/actions/action_shadow_pack_support.png",
  "action_pet_bite": "/images/tactical_ops/actions/action_pet_bite.png",
  "action_pet_hamstring": "/images/tactical_ops/actions/action_pet_hamstring.png",
  "action_system_move": "/images/tactical_ops/actions/action_system_move.png",
  "action_system_recover": "/images/tactical_ops/actions/action_system_recover.png",
  "action_system_skip": "/images/tactical_ops/actions/action_system_skip.png"
} as const;

const SKILL_ASSET_ID: Record<string, keyof typeof ACTION_IMAGES> = {
  "alpha-strike": "action_alpha_strike",
  "alpha-rend": "action_alpha_rend",
  "alpha-howl": "action_alpha_howl",
  "u02-shot": "action_cnc_thrust",
  "u02-burst": "action_cnc_lunge",
  "u02-lunge-vanguard": "action_cnc_lunge",
  "u02-suppress": "action_cnc_pressure",
  "u02-pressure-disruptor": "action_cnc_pressure",
  "u03-tap": "action_shadow_sweep",
  "u03-mend": "action_shadow_mend",
  "u03-mend-restorer": "action_shadow_mend",
  "u03-pack": "action_shadow_pack_support",
  "u03-pack-warden": "action_shadow_pack_support",
  "pet-bite": "action_pet_bite",
  "pet-hamstring": "action_pet_hamstring"
} as Record<string, keyof typeof ACTION_IMAGES>;

export type TacticalActionImageId = keyof typeof ACTION_IMAGES;
export function tacticalActionImageForSkill(executableId: string): string | null {
  // Pack Mastery dynamically appends a suffix; use the stable base id.
  const stableId = executableId.split(':mastery:')[0];
  const assetId = SKILL_ASSET_ID[stableId];
  return assetId ? ACTION_IMAGES[assetId] : null;
}

export function tacticalActionImageForCommand(command: 'move'|'recover'|'skip'): string | null {
  if (command === 'move') return ACTION_IMAGES.action_system_move;
  if (command === 'recover') return ACTION_IMAGES.action_system_recover;
  return ACTION_IMAGES.action_system_skip;
}
