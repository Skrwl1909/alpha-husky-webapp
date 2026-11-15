import { advanceToNext, createBattle, deployHostiles } from "./battle";
import { scaleCell } from "./battlefieldTopology";
import { applyRunCombatProfile, type TacticalCombatProfileV3 } from "./combatProfileV3";
import type { TacticalCombatProfileV2 } from "./combatProfile";
import { getStatusSequence, resetStatusSeq } from "./effects";
import { selectAcceptedIntentRules, TACTICAL_VNEXT_RULESET } from "./intentContract";
import { emptyThreatCycle, interruptLockedThreatAfterControl, markAlliedReaction, pruneInvalidThreats, type ThreatCycle } from "./intentScheduler";
import { canOccupy } from "./movement";
import { enemyActivation, legalAlliedAction, type RecoverCommand, type RecoverFrame, type RecoverView } from "./recoverAuthority";
import { selectAcceptedBattleRules, type BattleEvent, type BattleState, type Cell } from "./types";
import { getMissionDef, missionSpawnsForSquad } from "../data/operations";
import type { GrowthSnapshot } from "../data/playerGrowth";
import { withTeammateSidegrades } from "../data/shadowSidegrade";
import type { PackMastery } from "../data/packMastery";
import { UNIT_DEFS, type SpawnSpec } from "../data/units";

export type LastHowlScore = {
  runId: string;
  status: "DEFEATED" | "ABANDONED";
  completedWaves: number;
  kills: number;
  eliteKills: number;
};

export type LastHowlView = Omit<RecoverView, "token"> & {
  mode: "last_howl";
  token: string | null;
  status: "ACTIVE" | LastHowlScore["status"];
  wave: number;
  completedWaves: number;
  kills: number;
  eliteKills: number;
  best: LastHowlScore | null;
  newRecord: boolean;
  activeCombatProfileV3: TacticalCombatProfileV3;
  nextElite: number;
  eliteEntries: Cell[];
  reserveEntry: Cell | null;
  roster: Roster;
};

export type LastHowlSummary = {
  status: LastHowlView["status"] | null;
  runId: string | null;
  best: LastHowlScore | null;
};

type Roster = Pick<Parameters<typeof withTeammateSidegrades>[1], "kodaSidegrade" | "shadowSidegrade"> & {
  squadIds: string[];
  packMastery: PackMastery;
  combatProfileV2: TacticalCombatProfileV2;
};

type Encounter = Roster & {
  seed: number;
  playerGrowth: GrowthSnapshot;
  activeCombatProfileV3: TacticalCombatProfileV3;
};

export function prepareLastHowlRoster(roster: Roster): SpawnSpec[] {
  const formation = missionSpawnsForSquad(getMissionDef("field-relay-recovery")!, roster.squadIds, roster.combatProfileV2.pet);
  if (!formation) throw Error("invalid_last_howl_roster");
  return withTeammateSidegrades(formation.slice(0, 3), roster);
}

type Snapshot = {
  battle: BattleState;
  cycle: ThreatCycle;
  statusSequence: number;
  wave: number;
  completedWaves: number;
  eliteKills: number;
  entryRound: number;
  reserveRound: number;
  reserveNumber: number;
  reserveCell: Cell | null;
};

const LIVE_CAP = 6;
const RESERVE_INTERVAL = 3;
const east: Cell[] = [{ c: 4, r: 2 }, { c: 6, r: 1 }, { c: 6, r: 3 }, { c: 7, r: 2 }];
const flanks: Cell[][] = [
  [{ c: 3, r: 0 }, { c: 5, r: 0 }, { c: 5, r: 4 }, { c: 3, r: 4 }],
  [{ c: 3, r: 4 }, { c: 5, r: 4 }, { c: 5, r: 0 }, { c: 3, r: 0 }],
];
const reserveFlanks: Cell[][] = [
  [{ c: 3, r: 1 }, { c: 3, r: 3 }],
  [{ c: 3, r: 3 }, { c: 3, r: 1 }],
];
const elite = (wave: number) => wave % 5 === 0;
const wing = (seed: number, wave: number) => flanks[(seed + wave) % 2];
const gridCell = (cell: Cell) => scaleCell(cell, { cols: 8, rows: 5 }, { cols: 10, rows: 7 });
const canEnter = (battle: BattleState, cell: Cell) => {
  const { c, r } = gridCell(cell);
  return canOccupy(battle.units, c, r);
};

export function waveRoster(seed: number, wave: number): SpawnSpec[] {
  const flank = wing(seed, wave);
  const roles = wave === 1 ? [4, 1] : wave === 2 ? [2, 4, 4] : wave === 3 ? [2, 4, 1, 3]
    : wave === 4 ? [3, 2, 1, 4, 4] : elite(wave) ? [0, 4, 2, 3, ...(wave >= 10 ? [1] : [])]
    : [4, 2, wave % 2 ? 1 : 3, 3, ...(wave >= 8 ? [4] : []), ...(wave >= 12 ? [2] : [])];
  const cells = wave === 1 ? east : wave === 2 ? flank
    : elite(wave) ? [east[0], flank[0], flank[3], east[1], east[2]]
    : [flank[0], flank[3], east[0], flank[1], flank[2], east[3]];
  const attack = Math.min(36, Math.floor((wave - 1) / 4) * 2);
  return roles.map((role, i) => {
    const defId = role === 0 ? "leader" : "hostile";
    return {
      ...cells[i], defId,
      id: role === 0 ? `lh-${wave}-elite` : `lh-${wave}-${i}-h${role}`,
      unitDef: { ...UNIT_DEFS[defId], atk: UNIT_DEFS[defId].atk + attack },
    };
  });
}

function reserveSpawn(cell: Cell, wave: number, number: number): SpawnSpec {
  return {
    ...cell, defId: "hostile", id: `lh-${wave}-reinforcement-${number}`,
    unitDef: { ...UNIT_DEFS.hostile, atk: UNIT_DEFS.hostile.atk + Math.min(12, wave) },
  };
}

export function stepLastHowl(run: Encounter, saved?: Snapshot, command?: RecoverCommand) {
  const rules = { rulesetVersion: TACTICAL_VNEXT_RULESET };
  selectAcceptedBattleRules(rules);
  selectAcceptedIntentRules(rules);
  // Re-register frozen mastery skills in every short-lived command worker.
  const roster = prepareLastHowlRoster(run);
  let battle: BattleState;
  if (saved) {
    resetStatusSeq(saved.statusSequence);
    battle = saved.battle;
  } else {
    if (!run.activeCombatProfileV3) throw Error("invalid_last_howl_profile");
    const allies = applyRunCombatProfile(roster, run.activeCombatProfileV3, run.combatProfileV2);
    battle = createBattle(null, [...allies, ...waveRoster(run.seed, 1)], null, null, null, null, run.playerGrowth);
  }
  let cycle = saved?.cycle ?? emptyThreatCycle();
  let wave = saved?.wave ?? 1;
  let completedWaves = saved?.completedWaves ?? 0;
  let eliteKills = saved?.eliteKills ?? 0;
  let entryRound = saved?.entryRound ?? 1;
  let reserveRound = saved?.reserveRound ?? 1 + RESERVE_INTERVAL;
  let reserveNumber = saved?.reserveNumber ?? 0;
  let reserveCell = saved?.reserveCell ?? null;
  const hasReserveRoom = () => battle.units.filter(unit => unit.team === "enemy" && !unit.defeated).length < LIVE_CAP;
  const frames: RecoverFrame[] = [];
  const frame = (events: BattleEvent[], skillId?: string, interrupted?: boolean) => {
    eliteKills += events.filter(event => event.type === "defeat" && event.unitId?.endsWith("-elite")).length;
    frames.push({ battle, threats: cycle.pending.map(t => t.plan), events, skillId, interrupted });
  };
  const deployNextWave = () => {
    if (battle.outcome !== "victory") return;
    if (battle.units.every(unit => unit.team === "enemy" || unit.defeated)) {
      battle = { ...battle, outcome: "defeat", results: null };
      return;
    }
    completedWaves = wave++;
    entryRound = battle.round;
    cycle = emptyThreatCycle();
    battle = deployHostiles({ ...battle, outcome: "ongoing", results: null }, waveRoster(run.seed, wave));
    frame([]);
  };
  const advance = () => {
    const next = advanceToNext(battle);
    battle = next.state;
    cycle = markAlliedReaction(pruneInvalidThreats(cycle, battle), battle);
    frame(next.events);
    deployNextWave();
    if (battle.outcome === "ongoing" && reserveCell && battle.round >= reserveRound) {
      if (hasReserveRoom() && canEnter(battle, reserveCell)) {
        battle = deployHostiles(battle, [reserveSpawn(reserveCell, wave, reserveNumber++)]);
        reserveRound = battle.round + RESERVE_INTERVAL;
        frame([{ type: "ticker", text: "HOUND REINFORCEMENT ARRIVED" }]);
      }
      reserveCell = null;
    }
  };

  if (command) {
    if (!saved || command.type === "recover") return null;
    const action = legalAlliedAction(battle, command);
    if (!action) return null;
    const interrupt = command.type === "skill" && command.targetId
      ? interruptLockedThreatAfterControl(cycle, battle, action.state, action.actor.id, command.targetId, command.skillId, action.events)
      : { cycle, interrupted: false };
    battle = action.state;
    cycle = pruneInvalidThreats(interrupt.cycle, battle);
    frame(action.events, command.type === "skill" ? command.skillId : undefined, interrupt.interrupted);
    deployNextWave();
    if (battle.outcome === "ongoing" && command.type !== "move") advance();
  } else if (!saved) advance();

  for (let count = 0; battle.outcome === "ongoing"; count++) {
    const actor = battle.units.find(unit => unit.id === battle.activeId);
    if (actor?.team === "ally" && !actor.defeated) break;
    if (count === 64) throw Error("last_howl_activation_limit");
    if (actor && !actor.defeated) {
      const step = enemyActivation(battle, cycle);
      battle = step.state;
      cycle = step.cycle;
      frame(step.events, "skillId" in step ? step.skillId : undefined);
      deployNextWave();
    }
    if (battle.outcome === "ongoing") advance();
  }

  const nextElite = (Math.floor(wave / 5) + 1) * 5;
  const announcedElite = elite(wave) && battle.round <= entryRound + 1 ? wave : wave + 1 === nextElite ? nextElite : null;
  const eliteEntries = announcedElite === wave
    ? battle.units.filter(unit => unit.team === "enemy" && !unit.defeated).map(({ c, r }) => ({ c, r }))
    : announcedElite ? deployHostiles({ ...battle, units: battle.units.filter(unit => unit.team === "ally") },
      waveRoster(run.seed, announcedElite)).units.filter(unit => unit.team === "enemy").map(({ c, r }) => ({ c, r })) : [];
  // Only announce from an allied decision point. A blocked entry must be
  // announced again before it can deploy, even when the clock is overdue.
  if (!reserveCell && battle.outcome === "ongoing" && wave >= 2 &&
      battle.round + 1 >= reserveRound && hasReserveRoom()) {
    reserveCell = reserveFlanks[(run.seed + reserveNumber) % 2].find(cell => canEnter(battle, cell)) ?? null;
  }
  const reserveEntry = battle.outcome === "ongoing" && reserveCell ? gridCell(reserveCell) : null;
  return {
    snapshot: { battle, cycle: { ...cycle, ledger: [] }, statusSequence: getStatusSequence(), wave,
      completedWaves, eliteKills, entryRound, reserveRound, reserveNumber, reserveCell },
    view: { battle, threats: cycle.pending.map(t => t.plan), wave, completedWaves,
      kills: battle.hostilesEliminated, eliteKills, nextElite, eliteEntries, reserveEntry },
    frames,
  };
}
