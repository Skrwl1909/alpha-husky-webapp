import { UNIT_DEFS, type SpawnSpec } from "./units";
import { withKodaSidegrade, type KodaSidegrade } from "./kodaSidegrade";
import { withPackMastery, type PackMastery } from "./packMastery";

export type ShadowSidegrade = "A" | "B";

export function withShadowSidegrade(spawns: SpawnSpec[], choice?: ShadowSidegrade | null): SpawnSpec[] {
  if (!choice) return spawns;
  return spawns.map((spawn) => spawn.defId !== "ally-03" ? spawn : {
    ...spawn,
    unitDef: {
      ...UNIT_DEFS["ally-03"],
      skillIds: choice === "A"
        ? ["u03-tap", "u03-mend-restorer", "u03-pack"]
        : ["u03-tap", "u03-mend", "u03-pack-warden"],
    },
  });
}

export function withTeammateSidegrades(spawns: SpawnSpec[], choices: {
  kodaSidegrade?: KodaSidegrade | null;
  shadowSidegrade?: ShadowSidegrade | null;
  packMastery?: PackMastery;
}): SpawnSpec[] {
  return withPackMastery(withShadowSidegrade(withKodaSidegrade(spawns, choices.kodaSidegrade), choices.shadowSidegrade), choices.packMastery);
}
