import type { SpawnSpec } from "./units";
import type { Cell } from "../combat/types";

export type MissionObjectiveType = "ELIMINATE" | "RECOVER" | "BOSS";
export type MissionStatus = "locked" | "available" | "cleared";

export interface MissionDef {
  missionId: string;
  operationId: string;
  name: string;
  objectiveType: MissionObjectiveType;
  squadCap: number;
  briefCopy: string;
  resultsCopy: string;
  executable: boolean;
  spawns?: SpawnSpec[];
  terminal?: Cell;
}

export interface TacticalOperationDef {
  operationId: string;
  name: string;
  orderedMissionIds: string[];
}

export const BROKEN_SIGNAL_BREACH_SPAWNS: SpawnSpec[] = [
  { defId: "alpha", id: "alpha", c: 0, r: 2 },
  { defId: "ally-02", id: "ally-02", c: 1, r: 0 },
  { defId: "ally-03", id: "ally-03", c: 1, r: 4 },
  { defId: "hostile", id: "h1", c: 5, r: 1 },
  { defId: "hostile", id: "h2", c: 6, r: 3 },
  { defId: "hostile", id: "h3", c: 7, r: 0 },
];

export const BROKEN_SIGNAL_RECOVER_SPAWNS: SpawnSpec[] = [
  { defId: "alpha", id: "alpha", c: 0, r: 2 },
  { defId: "hostile", id: "h1", c: 5, r: 1 },
  { defId: "hostile", id: "h2", c: 6, r: 3 },
];

export const RECOVER_TERMINAL: Cell = { c: 6, r: 2 };

export function recoverSpawnsForSquad(squadIds: string[]): SpawnSpec[] | null {
  if (squadIds.length !== 2 || squadIds[0] !== "alpha" || !["ally-02", "ally-03"].includes(squadIds[1])) return null;
  return [
    { defId: "alpha", id: "alpha", c: 0, r: 2 },
    { defId: squadIds[1], id: squadIds[1], c: 1, r: squadIds[1] === "ally-02" ? 0 : 4 },
    ...BROKEN_SIGNAL_RECOVER_SPAWNS.filter((spawn) => spawn.defId === "hostile"),
  ];
}

export const BROKEN_SIGNAL: TacticalOperationDef = {
  operationId: "broken-signal",
  name: "BROKEN SIGNAL",
  orderedMissionIds: ["broken-signal-breach", "broken-signal-recover", "broken-signal-commander"],
};

export const MISSION_DEFS: Record<string, MissionDef> = {
  "broken-signal-breach": {
    missionId: "broken-signal-breach",
    operationId: BROKEN_SIGNAL.operationId,
    name: "BREACH",
    objectiveType: "ELIMINATE",
    squadCap: 3,
    briefCopy: "Break the perimeter before the signal disappears. Eliminate the HOUND MK-2 patrol.",
    resultsCopy: "BREACH CLEARED. RECOVER SIGNAL UNLOCKED.",
    executable: true,
    spawns: BROKEN_SIGNAL_BREACH_SPAWNS,
  },
  "broken-signal-recover": {
    missionId: "broken-signal-recover",
    operationId: BROKEN_SIGNAL.operationId,
    name: "RECOVER SIGNAL",
    objectiveType: "RECOVER",
    squadCap: 2,
    briefCopy: "Reach the relay terminal and recover the signal before the HOUND MK-2 patrol can stop you.",
    resultsCopy: "OBJECTIVE COMPLETE · SIGNAL RECOVERED.",
    executable: true,
    terminal: RECOVER_TERMINAL,
  },
  "broken-signal-commander": {
    missionId: "broken-signal-commander",
    operationId: BROKEN_SIGNAL.operationId,
    name: "SIGNAL COMMANDER",
    objectiveType: "BOSS",
    squadCap: 3,
    briefCopy: "Locate and break the commander signal.",
    resultsCopy: "Commander engagement pending.",
    executable: false,
  },
};

export function getMissionDef(missionId: string | null | undefined): MissionDef | null {
  return missionId ? MISSION_DEFS[missionId] || null : null;
}
