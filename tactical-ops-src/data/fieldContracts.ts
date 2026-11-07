import type { SpawnSpec } from "./units";
import { UNIT_DEFS } from "./units";

const CONTRACTS = {
  "rapid-recovery": { name: "Rapid Recovery", objective: "Recover the signal and win by round 4.", missions: ["field-relay-recovery"] },
  "hold-together": { name: "Hold Together", objective: "Hold the relay and win with all three allies standing.", missions: ["field-relay-hold", "field-isolated-hold"] },
  "cut-the-line": { name: "Cut the Line", objective: "Stop the courier and win without using a healing ability.", missions: ["field-relay-intercept"] },
};
export type FieldContractId = keyof typeof CONTRACTS;
export type FieldRend = "rend" | "reach-rend";
export interface FieldContracts {
  enabled: boolean;
  completed: FieldContractId[];
  eligibleMissionIds: string[];
  sidegrade: "reach-rend" | null;
  selection: FieldRend;
  honor: "field-tested" | null;
}
export interface FieldContractAward {
  id: FieldContractId;
  count: 1 | 2 | 3;
  reward: "reach-rend" | "field-tested" | null;
}
export const FIELD_HONOR = "Field Tested";
export const REACH_REND_TRADEOFF = "Range 1 → 2 · Direct hit 145% → 105% · Same Bleed";
export const contractName = (id: FieldContractId) => CONTRACTS[id].name;

export function missionContract(missionId: string) {
  for (const id of Object.keys(CONTRACTS) as FieldContractId[]) {
    const contract = CONTRACTS[id];
    if (contract.missions.includes(missionId)) return { id, ...contract };
  }
  return null;
}

function validContract(id: unknown): id is FieldContractId {
  return typeof id === "string" && Object.hasOwn(CONTRACTS, id);
}

export function parseFieldContracts(raw: unknown, board: { cycleId: number; activeMissionIds: string[] }): FieldContracts | undefined {
  if (!raw || typeof raw !== "object") return;
  const value = raw as FieldContracts & { version: unknown; cycleId: unknown };
  if (value.version !== 1 || value.cycleId !== board.cycleId || typeof value.enabled !== "boolean"
      || !Array.isArray(value.completed) || !value.completed.every(validContract)
      || new Set(value.completed).size !== value.completed.length
      || !Array.isArray(value.eligibleMissionIds) || new Set(value.eligibleMissionIds).size !== value.eligibleMissionIds.length
      || !value.eligibleMissionIds.every(missionId => {
        const contract = missionContract(missionId);
        return value.enabled && board.activeMissionIds.includes(missionId) && contract && !value.completed.includes(contract.id);
      })) return;
  if (value.sidegrade !== (value.completed.length >= 2 ? "reach-rend" : null)
      || value.honor !== (value.completed.length === 3 ? "field-tested" : null)
      || (value.selection !== "rend" && (value.selection !== "reach-rend" || !value.sidegrade))) return;
  return value;
}

export function parseContractAward(raw: unknown, missionId: string): FieldContractAward | undefined {
  if (!raw || typeof raw !== "object") return;
  const value = raw as FieldContractAward;
  if (validContract(value.id) && missionContract(missionId)?.id === value.id
      && [1, 2, 3].includes(value.count)
      && value.reward === (value.count === 2 ? "reach-rend" : value.count === 3 ? "field-tested" : null)) return value;
}

export function withFieldRend(spawns: SpawnSpec[], choice?: FieldRend): SpawnSpec[] {
  if (choice !== "reach-rend") return spawns;
  return spawns.map(spawn => {
    if (spawn.defId !== "alpha") return spawn;
    const def = spawn.unitDef || UNIT_DEFS.alpha;
    return { ...spawn, unitDef: { ...def, skillIds: def.skillIds.map(id => id === "alpha-rend" ? "alpha-reach-rend" : id) } };
  });
}
