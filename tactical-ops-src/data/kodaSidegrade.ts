import { UNIT_DEFS, type SpawnSpec } from "./units";

export type KodaSidegrade = "A" | "B";

export function withKodaSidegrade(spawns: SpawnSpec[], choice?: KodaSidegrade | null): SpawnSpec[] {
  if (!choice) return spawns;
  return spawns.map((spawn) => spawn.defId !== "ally-02" ? spawn : {
    ...spawn,
    unitDef: {
      ...UNIT_DEFS["ally-02"],
      move: choice === "A" ? 3 : 2,
      skillIds: choice === "A"
        ? ["u02-shot", "u02-lunge-vanguard", "u02-suppress"]
        : ["u02-shot", "u02-burst", "u02-pressure-disruptor"],
    },
  });
}
