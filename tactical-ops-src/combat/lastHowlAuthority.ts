import { advanceToNext, createBattle, deployHostiles } from "./battle";
import { scaleCell } from "./battlefieldTopology";
import { applyRunCombatProfile, type TacticalCombatProfileV3 } from "./combatProfileV3";
import type { TacticalCombatProfileV2 } from "./combatProfile";
import { getStatusSequence, resetStatusSeq } from "./effects";
import { selectAcceptedIntentRules, TACTICAL_VNEXT_RULESET } from "./intentContract";
import { emptyThreatCycle, interruptLockedThreatAfterControl, markAlliedReaction, pruneInvalidThreats, type ThreatCycle } from "./intentScheduler";
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
};

const LIVE_CAP = 6;
const east: Cell[] = [{ c: 4, r: 2 }, { c: 6, r: 1 }, { c: 6, r: 3 }, { c: 7, r: 2 }];
const flanks: Cell[][] = [
  [{ c: 3, r: 0 }, { c: 5, r: 0 }, { c: 5, r: 4 }, { c: 3, r: 4 }],
  [{ c: 3, r: 4 }, { c: 5, r: 4 }, { c: 5, r: 0 }, { c: 3, r: 0 }],
];
const elite = (wave: number) => wave % 5 === 0;
const wing = (seed: number, wave: number) => flanks[(seed + wave) % 2];
const gridCell = (cell: Cell) => scaleCell(cell, { cols: 8, rows: 5 }, { cols: 10, rows: 7 });

export function waveRoster(seed: number, wave: number): SpawnSpec[] {
  const flank = wing(seed, wave);
  const roles = wave === 1 ? [4, 1] : wave === 2 ? [2, 4, 4] : wave === 3 ? [1, 2, 4]
    : wave === 4 ? [3, 2, 1, 4] : elite(wave) ? [0, 4, 2, 3, ...(wave >= 10 ? [1] : [])]
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

function reserveSpawn(seed: number, wave: number, number: number): SpawnSpec {
  return {
    ...wing(seed + number, wave)[0], defId: "hostile", id: `lh-${wave}-reinforcement-${number}`,
    unitDef: { ...UNIT_DEFS.hostile, atk: UNIT_DEFS.hostile.atk + Math.min(60, wave + number * 4) },
  };
}

function reserveDelay(wave: number) {
  return Math.max(2, 5 - Math.floor(wave / 3));
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
  let reserveRound = saved?.reserveRound ?? 1 + reserveDelay(wave);
  let reserveNumber = saved?.reserveNumber ?? 0;
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
    reserveRound = battle.round + reserveDelay(wave);
    reserveNumber = 0;
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
    if (battle.outcome === "ongoing" && battle.round >= reserveRound &&
        battle.units.filter(unit => unit.team === "enemy" && !unit.defeated).length < LIVE_CAP) {
      battle = deployHostiles(battle, [reserveSpawn(run.seed, wave, reserveNumber++)]);
      reserveRound = battle.round + reserveDelay(wave);
      frame([{ type: "ticker", text: "HOUND REINFORCEMENT ARRIVED" }]);
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
  const reserveEntry = battle.round + 1 >= reserveRound &&
    battle.units.filter(unit => unit.team === "enemy" && !unit.defeated).length < LIVE_CAP
    ? gridCell(reserveSpawn(run.seed, wave, reserveNumber)) : null;
  return {
    snapshot: { battle, cycle: { ...cycle, ledger: [] }, statusSequence: getStatusSequence(), wave,
      completedWaves, eliteKills, entryRound, reserveRound, reserveNumber },
    view: { battle, threats: cycle.pending.map(t => t.plan), wave, completedWaves,
      kills: battle.hostilesEliminated, eliteKills, nextElite, eliteEntries, reserveEntry },
    frames,
  };
}
