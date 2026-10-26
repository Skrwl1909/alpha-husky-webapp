/** Signal Atlas P3 — integrated art-only references; no gameplay, ownership or rank semantics. */
const ROOT = "/images/tactical_ops/signal_atlas/v1";
export const SIGNAL_ATLAS_ASSETS = {
  atlasBackground: ROOT + "/environments/atlas_relay_chamber.webp",
  sectorBackground: ROOT + "/environments/sector_signal_bay.webp",
  coreBezel: ROOT + "/core/relay_core_bezel.webp",
  sectorFrame: ROOT + "/frames/sector_plate.svg",
  nodeFrame: ROOT + "/frames/skill_node_bezel.svg",
  inspectorFrame: ROOT + "/frames/skill_inspector_frame.svg",
  contact: ROOT + "/trim/signal_contact.svg",
} as const;
export const SIGNAL_ATLAS_SECTOR_EMBLEMS = {
  assault: ROOT + "/sectors/emblem_assault.webp",
  command: ROOT + "/sectors/emblem_command.webp",
  pursuit: ROOT + "/sectors/emblem_pursuit.webp",
  control: ROOT + "/sectors/emblem_control.webp",
  line: ROOT + "/sectors/emblem_front_line.webp",
  support: ROOT + "/sectors/emblem_support.webp",
} as const;
