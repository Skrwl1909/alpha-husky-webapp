/** Visual mapping only. Keep server state, skill IDs, ranks and entitlement semantics unchanged. */
import type { CSSProperties } from "react";
import type { NodeState } from "./model";

// Preserve the approved V1 assets as fallbacks. The new kit is versioned independently.
const root = "/images/tactical_ops/signal_atlas/v3/runtime/";
const file = (name: string) => root + name;
const url = (name: string) => `url("${file(name)}")`;

export const atlasV3 = {
  core: file("frames/atlas_combat_core_bezel_v2.webp"),
  variant: {
    heavy: file("variants/atlas_variant_heavy_lunge_v1.webp"),
    wide: file("variants/atlas_variant_wide_lunge_v1.webp"),
    scent: file("variants/atlas_variant_blood_scent_v1.webp"),
    link: file("variants/atlas_variant_pack_link_v1.webp"),
  },
} as const;

export const atlasV3Variables = {
  "--tsa-v3-overview": url("backgrounds/atlas_relay_chamber_v3.webp"),
  "--tsa-v3-sector": url("backgrounds/atlas_sector_signal_bay_v3.webp"),
  "--tsa-v3-active": url("frames/atlas_node_active_skill_v1.webp"),
  "--tsa-v3-doctrine": url("frames/atlas_node_doctrine_v1.webp"),
  "--tsa-v3-mutation": url("frames/atlas_node_skill_mutation_v1.webp"),
  "--tsa-v3-synergy": url("frames/atlas_node_synergy_v1.webp"),
  "--tsa-v3-inspector": url("ui/atlas_inspector_frame_v2.svg"),
  "--tsa-v3-contact": url("ui/atlas_junction_contact_v1.svg"),
  "--tsa-v3-endpoint": url("ui/atlas_junction_endpoint_v1.svg"),
  "--tsa-v3-reserve": url("ui/identity/atlas_reserved_standard_v1.svg"),
  "--tsa-v3-terminal": url("ui/identity/atlas_reserved_terminal_v1.svg"),
} as CSSProperties;

const sectors: Record<string, string> = {
  assault: "fang", command: "howl", pursuit: "pursuit", control: "control",
  line: "front_line", support: "support",
};
export function sectorArt(id: string): CSSProperties {
  return sectors[id] ? {"--tsa-v3-plate": url(`ui/identity/atlas_sector_plate_${sectors[id]}_v1.svg`)} as CSSProperties : {};
}
export function nodeStateArt(state: NodeState, pending: boolean, acquired: boolean): CSSProperties {
  // Pending, offline, active run and ineligible nodes are never represented as purchasable.
  const own = state === "base" || state === "recorded" || state === "maxed";
  const visual = pending ? "locked" : acquired && own ? "acquired" : own ? "owned" :
    state === "available" ? "available" : "locked";
  return {"--tsa-v3-node-state": url(`ui/identity/atlas_state_${visual}_v1.svg`)} as CSSProperties;
}
