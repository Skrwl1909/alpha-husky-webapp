import type { Cell, MissionDirective } from "../combat/types";
import type { MissionDef } from "./operations";
import { getMissionDef } from "./operations";
import type { SpawnSpec } from "./units";

export const RELAY_PRESSURE_REVISION = 1;
type Threat = "contest" | "flank" | "crosslink";

interface TrialLevel {
  threat: Threat;
  deadline: number;
  patrol: [Cell, Cell, Cell];
  reserve: Cell;
  arrival: number;
  route?: Cell[];
  flank?: Cell;
}

const center = { c: 3, r: 2 };
const north = { c: 3, r: 1 };
const east = { c: 4, r: 2 };
const south = { c: 3, r: 3 };
const flank = { c: 1, r: 4 };

const levels: readonly TrialLevel[] = [
  { threat: "contest", deadline: 7, patrol: [{ c: 4, r: 1 }, { c: 6, r: 2 }, { c: 5, r: 3 }], reserve: { c: 7, r: 2 }, arrival: 3 },
  { threat: "flank", deadline: 7, patrol: [{ c: 5, r: 1 }, { c: 5, r: 2 }, { c: 5, r: 3 }], reserve: { c: 5, r: 4 }, arrival: 3, flank },
  { threat: "crosslink", deadline: 7, patrol: [{ c: 4, r: 1 }, { c: 6, r: 2 }, { c: 5, r: 3 }], reserve: { c: 5, r: 4 }, arrival: 3, route: [north, east, south, center] },
  { threat: "contest", deadline: 6, patrol: [{ c: 4, r: 2 }, { c: 5, r: 1 }, { c: 4, r: 3 }], reserve: { c: 6, r: 2 }, arrival: 2 },
  { threat: "flank", deadline: 6, patrol: [{ c: 5, r: 1 }, { c: 5, r: 2 }, { c: 4, r: 3 }], reserve: { c: 4, r: 4 }, arrival: 2, flank },
  { threat: "crosslink", deadline: 6, patrol: [{ c: 4, r: 1 }, { c: 6, r: 2 }, { c: 4, r: 3 }], reserve: { c: 5, r: 4 }, arrival: 2, route: [north, south, { c: 5, r: 2 }, center] },
];

const veteranLevels: Readonly<Partial<Record<number, TrialLevel>>> = {
  4: { threat: "contest", deadline: 6, patrol: [{ c: 4, r: 1 }, { c: 6, r: 2 }, { c: 5, r: 3 }], reserve: { c: 3, r: 3 }, arrival: 4 },
  5: { threat: "flank", deadline: 7, patrol: [{ c: 5, r: 1 }, { c: 5, r: 2 }, { c: 5, r: 3 }], reserve: { c: 2, r: 4 }, arrival: 3, flank },
  6: { threat: "crosslink", deadline: 9, patrol: [{ c: 4, r: 1 }, { c: 7, r: 3 }, { c: 5, r: 3 }], reserve: { c: 5, r: 3 }, arrival: 4, route: [north, east, south, center] },
};

const threatName: Record<Threat, string> = {
  contest: "RELAY CONTEST",
  flank: "FLANK PRESSURE",
  crosslink: "FORCED REPOSITION",
};

const reserveId = "field-reinforcement";

/** Encounter definitions for the engine review. A server-accepted trial contract must
 * select this revision before the activity can be exposed on the War Table. */
export function relayPressureMission(level: number, revision: number): MissionDef {
  const veteran = veteranLevels[level];
  const config = revision === 3 && level === 5 && veteran ? { ...veteran, arrival: 4 }
    : revision === 2 ? veteran : revision === RELAY_PRESSURE_REVISION ? levels[level - 1] : undefined;
  if (!Number.isInteger(level) || !config) throw new Error("unsupported_relay_pressure_level");
  const base = getMissionDef("field-relay-hold")!;
  const terminal = config.route?.[0] ?? center;
  const spawns: SpawnSpec[] = config.patrol.map((tile, index) => ({
    ...tile, defId: "hostile", id: `h${index + 1}`,
  }));
  const duration = config.flank ? 3 : 4;
  const deadline = `Secure ${duration} consecutive checkpoints by the end of round ${config.deadline}. A missed checkpoint resets progress.`;
  const objective = config.threat === "flank"
    ? `Hold the main relay. From round ${config.arrival}, also hold the marked flank relay.`
    : config.threat === "crosslink"
      ? "Occupy the active relay at each checkpoint. The next relay activates after a successful check."
      : "Occupy the relay and clear adjacent enemies before each checkpoint.";
  const squadHint = config.threat === "flank"
    ? "Send a second holder to the flank before the marked HOUND arrives. Keep support in reach of both holders."
    : config.threat === "crosslink"
      ? "Stage the next holder before the current checkpoint. Any living ally can make the handoff."
      : "Keep one ally on the relay and use control or focus fire on enemies approaching the contest area.";
  const directive: MissionDirective = {
    type: "REINFORCEMENTS", name: "HOUND RESERVE",
    copy: `A HOUND enters at the marked approach in round ${config.arrival}.`,
    maxRounds: config.deadline,
    reinforcement: { spawn: { ...config.reserve, defId: "hostile", id: reserveId },
      triggerRound: config.arrival, telegraphed: true, spawned: false },
  };
  return {
    ...base, name: `RELAY PRESSURE ${level} · ${threatName[config.threat]}`, challenge: undefined,
    briefCopy: `${objective} ${deadline}`, resultsCopy: "", squadHint, spawns, directive,
    objective: {
      type: "HOLD", terminal, radius: 1, holderRadius: 0, duration, progress: 0, checkedRound: 1,
      relayRoute: config.route,
      relayPressure: { flank: config.flank && { tile: config.flank, activeRound: config.arrival, enemyId: reserveId } },
    },
  };
}
