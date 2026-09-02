import type {
  BattleEvent,
  BattleResults,
  BattleState,
  Cell,
  CombatUnit,
  RecoverObjective,
} from "./types";
import { BROKEN_SIGNAL_SPAWNS, UNIT_DEFS, type SpawnSpec } from "../data/units";
import { resetStatusSeq, STATUS_LABEL } from "./effects";
import { consumeMeter, pickReadyId, tickUntilReady } from "./initiative";
import { canOccupy, reachableCells } from "./movement";
import { living } from "./targeting";
import { applySkill } from "./skills";
import { chooseAiAction, aiUsesLegalRules } from "./ai";
import type { AiAction } from "./types";
import { getSkill } from "../data/skills";
import { applyIdentityToAlpha, type PlayerIdentity } from "../host/identity";

function cloneUnit(u: CombatUnit): CombatUnit {
  return {
    ...u,
    statuses: u.statuses.map((s) => ({ ...s })),
    cooldowns: { ...u.cooldowns },
  };
}

function spawnUnit(
  defId: string,
  id: string,
  c: number,
  r: number,
  identity?: PlayerIdentity | null,
): CombatUnit {
  const def = UNIT_DEFS[defId];
  if (!def) throw new Error(`Unknown unit def ${defId}`);
  const cds: Record<string, number> = {};
  for (const sid of def.skillIds) cds[sid] = 0;
  const base: CombatUnit = {
    id,
    defId: def.defId,
    name: def.name,
    team: def.team,
    role: def.role,
    hp: def.hp,
    maxHp: def.hp,
    atk: def.atk,
    def: def.def,
    spd: def.spd,
    move: def.move,
    c,
    r,
    statuses: [],
    cooldowns: cds,
    meter: 0,
    hasMoved: false,
    hasActed: false,
    defeated: false,
    sprite: def.sprite,
    attackSprite: def.attackSprite,
    portrait: def.portrait,
    skillIds: [...def.skillIds],
  };
  if (def.defId === "alpha" && identity) {
    const stamped = applyIdentityToAlpha(base, identity);
    return {
      ...stamped,
      weaponIcon: identity.weapon?.icon || "",
      identitySource: identity.source,
    };
  }
  return base;
}

export function createBattle(
  identity?: PlayerIdentity | null,
  spawns: SpawnSpec[] = BROKEN_SIGNAL_SPAWNS,
  objective: RecoverObjective | null = null,
): BattleState {
  resetStatusSeq();
  const units = spawns.map((s) => spawnUnit(s.defId, s.id, s.c, s.r, identity));
  return {
    units,
    activeId: null,
    inspectId: null,
    actionSkillId: null,
    mode: "idle",
    round: 1,
    unitTurn: 0,
    actionsLeftInRound: living(units).length,
    outcome: "ongoing",
    damageTaken: 0,
    hostilesEliminated: 0,
    results: null,
    objective: objective ? { ...objective, terminal: { ...objective.terminal } } : null,
    seed: 1,
  };
}

function squadDeployedCount(units: CombatUnit[]): number {
  return units.filter((u) => u.team === "ally").length;
}

export function evaluateOutcome(state: BattleState): BattleState {
  if (state.outcome !== "ongoing") return state;
  const allies = living(state.units, "ally");
  const enemies = living(state.units, "enemy");
  const squadDeployed = squadDeployedCount(state.units);
  if (state.objective?.type === "RECOVER" && state.objective.completed) {
    const results: BattleResults = {
      victory: true,
      turns: state.round,
      hostilesEliminated: state.hostilesEliminated,
      squadStanding: allies.length,
      squadDeployed,
      damageTaken: state.damageTaken,
      bonesRecovered: 0,
      objectiveComplete: true,
    };
    return { ...state, outcome: "victory", results, mode: "locked", activeId: null, actionSkillId: null };
  }
  // RECOVER has no eliminate shortcut: an empty field only makes the terminal
  // safer to reach. The interaction itself is the win condition.
  if (enemies.length === 0 && state.objective?.type !== "RECOVER") {
    const results: BattleResults = {
      victory: true,
      turns: state.round,
      hostilesEliminated: state.hostilesEliminated,
      squadStanding: allies.length,
      squadDeployed,
      damageTaken: state.damageTaken,
      bonesRecovered: 18 + state.hostilesEliminated * 6,
    };
    return { ...state, outcome: "victory", results, mode: "locked", activeId: null, actionSkillId: null };
  }
  if (allies.length === 0) {
    const results: BattleResults = {
      victory: false,
      turns: state.round,
      hostilesEliminated: state.hostilesEliminated,
      squadStanding: 0,
      squadDeployed,
      damageTaken: state.damageTaken,
      bonesRecovered: 0,
    };
    return { ...state, outcome: "defeat", results, mode: "locked", activeId: null, actionSkillId: null };
  }
  return state;
}

function tickCooldowns(unit: CombatUnit): CombatUnit {
  const next: Record<string, number> = {};
  for (const [k, v] of Object.entries(unit.cooldowns)) {
    next[k] = Math.max(0, (v ?? 0) - 1);
  }
  return { ...unit, cooldowns: next };
}

/** Start-of-turn: CD tick, bleed, duration--, then unit is active. */
export function beginUnitTurn(state: BattleState, unitId: string): { state: BattleState; events: BattleEvent[] } {
  const events: BattleEvent[] = [];
  let units = state.units.map(cloneUnit);
  let hostilesEliminated = state.hostilesEliminated;
  let damageTaken = state.damageTaken;

  units = units.map((u) => {
    if (u.id !== unitId || u.defeated) return u;
    let cur = tickCooldowns(u);
    const nextStatuses = [];
    for (const st of cur.statuses) {
      if (st.type === "BLEED") {
        const dmg = Math.max(1, Math.round(st.value));
        const hp = Math.max(0, cur.hp - dmg);
        const defeated = hp <= 0;
        if (cur.team === "ally") damageTaken += dmg;
        if (defeated && cur.team === "enemy" && !cur.defeated) hostilesEliminated += 1;
        events.push({ type: "damage", unitId: cur.id, amount: dmg, text: `-${dmg}`, kind: "dmg" });
        events.push({ type: "ticker", text: `${cur.name}  ·  BLEED` });
        if (defeated) {
          events.push({ type: "defeat", unitId: cur.id, text: "DOWN", kind: "info" });
          return { ...cur, hp, defeated: true, statuses: [] };
        }
        cur = { ...cur, hp };
      }
      const duration = st.duration - 1;
      if (duration <= 0) {
        events.push({ type: "expire", unitId: cur.id, text: `${STATUS_LABEL[st.type]} ended`, kind: "info" });
      } else {
        nextStatuses.push({ ...st, duration });
      }
    }
    return { ...cur, statuses: nextStatuses, hasMoved: false, hasActed: false };
  });

  let next: BattleState = {
    ...state,
    units,
    hostilesEliminated,
    damageTaken,
    activeId: unitId,
    inspectId: null,
    actionSkillId: null,
    mode: "selected",
  };
  next = evaluateOutcome(next);
  const actor = next.units.find((u) => u.id === unitId);
  if (next.outcome !== "ongoing" || !actor || actor.defeated) {
    next = { ...next, activeId: actor && !actor.defeated ? next.activeId : null, mode: "locked" };
  }
  return { state: next, events };
}

export function advanceToNext(state: BattleState): { state: BattleState; events: BattleEvent[] } {
  if (state.outcome !== "ongoing") return { state, events: [] };
  let units = tickUntilReady(state.units.map(cloneUnit));
  const id = pickReadyId(units);
  if (!id) return { state, events: [] };
  units = units.map((u) => (u.id === id ? consumeMeter(u) : u));
  let actionsLeft = state.actionsLeftInRound;
  let round = state.round;
  if (actionsLeft <= 0) {
    round += 1;
    actionsLeft = Math.max(1, living(units).length);
  }
  actionsLeft -= 1;
  const started = beginUnitTurn(
    {
      ...state,
      units,
      unitTurn: state.unitTurn + 1,
      round,
      actionsLeftInRound: actionsLeft,
      mode: "locked",
    },
    id,
  );
  const actor = started.state.units.find((u) => u.id === id);
  const events: BattleEvent[] = [...started.events];
  if (started.state.outcome !== "ongoing") return { state: started.state, events };
  if (!actor || actor.defeated) {
    return advanceToNext({ ...started.state, activeId: null });
  }
  return { state: started.state, events };
}

export function startBattle(
  identity?: PlayerIdentity | null,
  spawns: SpawnSpec[] = BROKEN_SIGNAL_SPAWNS,
  objective: RecoverObjective | null = null,
): { state: BattleState; events: BattleEvent[] } {
  const fresh = createBattle(identity, spawns, objective);
  return advanceToNext(fresh);
}

export function canRecover(state: BattleState): boolean {
  const actor = state.units.find((u) => u.id === state.activeId);
  const objective = state.objective;
  if (!objective || objective.type !== "RECOVER" || objective.completed || !actor || actor.team !== "ally" || actor.defeated || actor.hasActed) return false;
  return Math.abs(actor.c - objective.terminal.c) + Math.abs(actor.r - objective.terminal.r) <= 1;
}

export function tryRecover(state: BattleState): { state: BattleState; events: BattleEvent[]; ok: boolean } {
  if (!canRecover(state)) return { state, events: [], ok: false };
  const actor = state.units.find((u) => u.id === state.activeId)!;
  const units = state.units.map((u) => u.id === actor.id ? { ...u, hasActed: true } : u);
  const completed: BattleState = {
    ...state,
    units,
    objective: { ...state.objective!, completed: true },
    actionSkillId: null,
    mode: "locked",
  };
  const next = evaluateOutcome(completed);
  return {
    state: next,
    ok: true,
    events: [
      { type: "status", unitId: actor.id, text: "SIGNAL RECOVERED", kind: "info" },
      { type: "ticker", text: "OBJECTIVE COMPLETE · SIGNAL RECOVERED" },
    ],
  };
}

export function tryMove(state: BattleState, c: number, r: number): { state: BattleState; events: BattleEvent[]; ok: boolean } {
  const actor = state.units.find((u) => u.id === state.activeId);
  if (!actor || actor.defeated || actor.hasMoved || actor.hasActed) {
    return { state, events: [], ok: false };
  }
  if (!canOccupy(state.units, c, r, actor.id)) return { state, events: [], ok: false };
  const cells = reachableCells(actor, state.units);
  if (!cells.some((cell) => cell.c === c && cell.r === r)) return { state, events: [], ok: false };
  const units = state.units.map((u) => (u.id === actor.id ? { ...u, c, r, hasMoved: true } : u));
  return {
    state: { ...state, units, inspectId: null },
    events: [
      { type: "move", unitId: actor.id, text: `${actor.name}  ·  repositions` },
      { type: "ticker", text: `${actor.name}  ·  repositions` },
    ],
    ok: true,
  };
}

export function trySkip(state: BattleState): { state: BattleState; events: BattleEvent[]; ok: boolean } {
  const actor = state.units.find((u) => u.id === state.activeId);
  if (!actor || actor.defeated || actor.hasActed) return { state, events: [], ok: false };
  const units = state.units.map((u) => (u.id === actor.id ? { ...u, hasActed: true } : u));
  return {
    state: { ...state, units, actionSkillId: null, mode: "locked" },
    events: [{ type: "ticker", text: `${actor.name}  ·  holds` }],
    ok: true,
  };
}

export function trySkill(
  state: BattleState,
  skillId: string,
  targetId?: string | null,
  cell?: Cell | null,
): { state: BattleState; events: BattleEvent[]; ok: boolean; reason?: string } {
  const res = applySkill(state, skillId, targetId, cell);
  if (!res.ok) return res;
  return { ...res, state: evaluateOutcome(res.state) };
}

export function applyAi(state: BattleState, action: AiAction): { state: BattleState; events: BattleEvent[] } {
  if (!aiUsesLegalRules(state, action) && action.type !== "skip") {
    const skip = trySkip(state);
    return { state: skip.state, events: skip.events };
  }
  const events: BattleEvent[] = [];
  let cur = state;
  if (action.type === "skip") {
    const s = trySkip(cur);
    return { state: s.state, events: s.events };
  }
  if (action.type === "move") {
    const m = tryMove(cur, action.to.c, action.to.r);
    if (m.ok) {
      cur = m.state;
      events.push(...m.events);
    }
    if (action.then) {
      const nested = applyAi(cur, action.then);
      return { state: nested.state, events: [...events, ...nested.events] };
    }
    const s = trySkip(cur);
    return { state: s.state, events: [...events, ...s.events] };
  }
  if (action.type === "skill") {
    const s = trySkill(cur, action.skillId, action.targetId, action.cell);
    if (s.ok) return { state: s.state, events: [...events, ...s.events] };
    const skip = trySkip(cur);
    return { state: skip.state, events: [...events, ...skip.events] };
  }
  return { state: cur, events };
}

export function planAi(state: BattleState): AiAction {
  return chooseAiAction(state);
}

export function a1Range(unit: CombatUnit): number {
  const first = unit.skillIds[0];
  if (!first) return 1;
  return getSkill(first).maxRange;
}
