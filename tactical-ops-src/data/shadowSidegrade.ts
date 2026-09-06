import { UNIT_DEFS, type SpawnSpec } from "./units";
import { withKodaSidegrade, type KodaSidegrade } from "./kodaSidegrade";

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
}): SpawnSpec[] {
  return withShadowSidegrade(withKodaSidegrade(spawns, choices.kodaSidegrade), choices.shadowSidegrade);
}
