/**
 * Global Tactical Ops mission inventory and future-rule coverage gate.
 * Read-only descriptors: VNext is NOT a new mission implementation.
 */
import { GRID_COLS, GRID_ROWS, type Cell } from "../combat/types";
import { FIELD_OP_IDS, MISSION_DEFS, missionForContext, missionBattleRules, type MissionObjectiveType } from "./operations";

export type MissionFamily = "BROKEN_SIGNAL" | "DEAD_RELAY" | "FIELD";
export type TopologyTileKind = "FLOOR" | "COVER" | "BLOCKER" | "RELAY" | "EXIT" | "HAZARD";
export interface TopologyTile { cell: Cell; kind: TopologyTileKind }
export interface ScenarioTopology { cols: 8; rows: 5; tiles: TopologyTile[] }
export interface MissionContractBaseline {
  family: MissionFamily;
  objectiveType: MissionObjectiveType;
  ruleset: "LEGACY";
  revision: 0;
  premiumReady: false;
}

/** Deliberately explicit: a new mission must get a contract row or CI fails. */
export const MISSION_CONTRACT_BASELINES: Record<string, MissionContractBaseline> = {
  "broken-signal-breach": { family: "BROKEN_SIGNAL", objectiveType: "ELIMINATE", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "broken-signal-recover": { family: "BROKEN_SIGNAL", objectiveType: "RECOVER", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "broken-signal-commander": { family: "BROKEN_SIGNAL", objectiveType: "BOSS", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "dead-relay-courier": { family: "DEAD_RELAY", objectiveType: "INTERCEPT", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "dead-relay-hold": { family: "DEAD_RELAY", objectiveType: "HOLD", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "dead-relay-guardian": { family: "DEAD_RELAY", objectiveType: "BOSS", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "field-relay-recovery": { family: "FIELD", objectiveType: "RECOVER", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "field-relay-hold": { family: "FIELD", objectiveType: "HOLD", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "field-squad-survival": { family: "FIELD", objectiveType: "SURVIVE", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "field-relay-intercept": { family: "FIELD", objectiveType: "INTERCEPT", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "field-isolated-hold": { family: "FIELD", objectiveType: "HOLD", ruleset: "LEGACY", revision: 0, premiumReady: false },
  "field-rearguard": { family: "FIELD", objectiveType: "SURVIVE", ruleset: "LEGACY", revision: 0, premiumReady: false },
};

export const FOUNDATION_STAGES = ["solo-1", "solo-2", "ally-koda", "full-broken-signal"] as const;

function inBounds(c: Cell): boolean {
  return Number.isInteger(c.c) && Number.isInteger(c.r) &&
    c.c >= 0 && c.c < GRID_COLS && c.r >= 0 && c.r < GRID_ROWS;
}

export function validateScenarioTopology(topology: ScenarioTopology): string[] {
  const problems: string[] = [];
  if (topology.cols !== GRID_COLS || topology.rows !== GRID_ROWS) problems.push("topology_wrong_grid");
  const found = new Set<string>();
  for (const tile of topology.tiles) {
    if (!inBounds(tile.cell)) problems.push("topology_out_of_bounds");
    const key = String(tile.cell.c) + "," + String(tile.cell.r);
    if (found.has(key)) problems.push("topology_duplicate_cell");
    found.add(key);
    if (!["FLOOR", "COVER", "BLOCKER", "RELAY", "EXIT", "HAZARD"].includes(tile.kind)) problems.push("topology_invalid_kind");
  }
  if (topology.tiles.length !== GRID_COLS * GRID_ROWS || found.size !== GRID_COLS * GRID_ROWS) {
    problems.push("topology_incomplete");
  }
  return problems;
}

/** Today's engine treats every tile as open; no cover/hazard rules exist here. */
export function legacyOpenTopology(): ScenarioTopology {
  return {
    cols: 8, rows: 5,
    tiles: Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => ({
      cell: { c: i % GRID_COLS, r: Math.floor(i / GRID_COLS) }, kind: "FLOOR" as const,
    })),
  };
}

/** Fail CI if either definitions OR the matrix drift. No soft coverage estimates. */
export function validateAllMissionBaselines(): string[] {
  const failures: string[] = [];
  const canonical = Object.keys(MISSION_DEFS).sort();
  const covered = Object.keys(MISSION_CONTRACT_BASELINES).sort();
  if (canonical.join("|") !== covered.join("|")) failures.push("mission_contract_inventory_drift");
  const fieldIds = Object.keys(MISSION_DEFS).filter((id) => MISSION_DEFS[id].activity === "FIELD_OP").sort();
  if (fieldIds.join("|") !== [...FIELD_OP_IDS].sort().join("|")) failures.push("field_operation_inventory_drift");
  if (canonical.length !== 12 || fieldIds.length !== 6) failures.push("expected_6_canon_6_field");
  for (const missionId of canonical) {
    const def = MISSION_DEFS[missionId];
    const contract = MISSION_CONTRACT_BASELINES[missionId];
    if (!contract) continue;
    if (!def.executable || def.missionId !== missionId || def.objectiveType !== contract.objectiveType) {
      failures.push("mission_baseline_mismatch:" + missionId);
    }
    if (contract.premiumReady || contract.ruleset !== "LEGACY" || contract.revision !== 0) {
      failures.push("unverified_premium_claim:" + missionId);
    }
    if ((def.activity === "FIELD_OP") !== (contract.family === "FIELD") ||
        (contract.family === "BROKEN_SIGNAL" && def.operationId !== "broken-signal") ||
        (contract.family === "DEAD_RELAY" && def.operationId !== "dead-relay")) {
      failures.push("mission_family_mismatch:" + missionId);
    }
    const rules = missionBattleRules(def);
    if ((def.objectiveType === "ELIMINATE") !== (rules.objective === null)) {
      failures.push("objective_compilation_mismatch:" + missionId);
    }
    if (def.objectiveType !== "ELIMINATE" && rules.objective?.type !== def.objectiveType) {
      failures.push("objective_type_mismatch:" + missionId);
    }
    for (const spawn of def.spawns || []) {
      if (!inBounds(spawn)) failures.push("spawn_out_of_bounds:" + missionId);
    }
  }
  // Accepted pre-v3 attempts must still use their old RECOVER objective.
  const legacy = missionForContext(MISSION_DEFS["field-relay-intercept"], { reportVersion: 2 });
  const active = missionForContext(MISSION_DEFS["field-relay-intercept"], { reportVersion: 3 });
  if (legacy.objectiveType !== "RECOVER" || active.objectiveType !== "INTERCEPT") {
    failures.push("legacy_field_intercept_contract_broken");
  }
  return failures;
}
