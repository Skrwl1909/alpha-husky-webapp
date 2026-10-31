import { BATTLEFIELD_VNEXT_PREVIEW, type AiAction, type BattleState, type Cell, type CombatUnit, type SkillDef } from "./types";
import { availableSkills, skillReady } from "./skills";
import { chebyshev, reachableCells, inBounds } from "./movement";
import { inSkillRange, living, skillNeedsTargetPick, validTargetIds } from "./targeting";
import { getSkill } from "../data/skills";
import { effectiveAtk } from "./effects";

function foesOf(unit: CombatUnit, units: CombatUnit[]): CombatUnit[] {
  return living(units, unit.team === "ally" ? "enemy" : "ally");
}

function alliesOf(unit: CombatUnit, units: CombatUnit[]): CombatUnit[] {
  return living(units, unit.team);
}

function threatScore(t: CombatUnit): number {
  let s = 0;
  if (t.role === "alpha") s += 40;
  if (t.role === "support") s += 12;
  s += (1 - t.hp / t.maxHp) * 30;
  s += effectiveAtk(t) * 0.4;
  return s;
}

/** One objective-aware target policy shared by all six encounter families in VNext.
 * A tactical threat is meaningful only if its victim could change the mission outcome.
 * This changes target preference, never skill legality or damage math. */
export function objectiveTargetScore(state: BattleState, caster: CombatUnit, target: CombatUnit): number {
  const hpFraction = target.maxHp > 0 ? target.hp / target.maxHp : 1;
  const vulnerable = (1-hpFraction)*40;
  const support = target.role === "support" ? 14 : 0;
  const base = vulnerable + support + effectiveAtk(target)*0.25;
  const o = state.objective;
  if (!o) return base + (target.role === "alpha" ? 6 : 0); // ELIMINATE — coordinate on injured allies.
  if (o.type === "HOLD" && o.terminal) {
    const dist = Math.abs(target.c-o.terminal.c)+Math.abs(target.r-o.terminal.r);
    return base + (dist <= (o.radius ?? 0) ? 70 : 0) + Math.max(0, 17-dist*4);
  }
  if (o.type === "RECOVER") {
    const dist = Math.abs(target.c-o.terminal.c)+Math.abs(target.r-o.terminal.r);
    return base + Math.max(0, 50-dist*9);
  }
  if (o.type === "SURVIVE") return base + (1-hpFraction)*70 + support*0.5;
  if (o.type === "INTERCEPT") {
    const courier = state.units.find(u=>u.id===o.targetId&&!u.defeated);
    const dist = courier ? chebyshev(target,courier) : 9;
    const exitDist = Math.abs(target.c-o.exit.c)+Math.abs(target.r-o.exit.r);
    return base + Math.max(0, 50-dist*10) + Math.max(0, 12-exitDist*2);
  }
  if (o.type === "BOSS") {
    const leader = state.units.find(u=>u.id===o.targetId&&!u.defeated);
    const dist = leader ? chebyshev(target,leader) : 9;
    return base + Math.max(0, 45-dist*8) + (caster.role==="leader" && target.role==="support" ? 14 : 0);
  }
  return base;
}
function pickTarget(caster: CombatUnit, candidates: CombatUnit[], skill: SkillDef, state?: BattleState): CombatUnit | null {
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => {
    if (BATTLEFIELD_VNEXT_PREVIEW && state) {
      const aScore = objectiveTargetScore(state,caster,a) + (caster.archetype==="DISRUPTOR" && a.role==="support" ? 35 : 0);
      const bScore = objectiveTargetScore(state,caster,b) + (caster.archetype==="DISRUPTOR" && b.role==="support" ? 35 : 0);
      return bScore-aScore || chebyshev(caster,a)-chebyshev(caster,b) || a.id.localeCompare(b.id);
    }
    if (caster.archetype === "DISRUPTOR") return Number(b.role === "support") - Number(a.role === "support") || threatScore(b) - threatScore(a);
    if (caster.archetype === "MARKSMAN") return threatScore(b) - threatScore(a) || chebyshev(caster, b) - chebyshev(caster, a);
    if (caster.role === "leader") return threatScore(b) - threatScore(a) || a.hp - b.hp;
    return a.hp - b.hp || chebyshev(caster, a) - chebyshev(caster, b);
  });
  const inRange = sorted.filter((t) => inSkillRange(caster, t, skill));
  return (inRange[0] ?? sorted[0]) || null;
}

function bestMoveForSkill(caster: CombatUnit, units: CombatUnit[], skill: SkillDef, target: CombatUnit): Cell | null {
  if (inSkillRange(caster, target, skill)) return null;
  const cells = reachableCells(caster, units);
  let best: Cell | null = null;
  let bestScore = 1e9;
  for (const cell of cells) {
    const d = chebyshev(cell, target);
    const inR = d >= skill.minRange && d <= skill.maxRange;
    // Marksmen seek a viable firing lane but avoid closing into melee.
    const score = (inR ? 0 : 100) + (caster.archetype === "MARKSMAN" ? Math.abs(d - Math.max(2, skill.maxRange - 1)) : d);
    if (score < bestScore) {
      bestScore = score;
      best = cell;
    }
  }
  return best;
}

/** Shortest escape route through free cells; occupied exits can be blockaded.
 * The courier uses normal movement and initiative, so slows buy interception time. */
function interceptAction(state: BattleState, caster: CombatUnit): AiAction | null {
  const objective = state.objective;
  if (objective?.type !== "INTERCEPT" || objective.targetId !== caster.id) return null;
  const distance = new Map<string, number>();
  const key = (cell: Cell) => `${cell.c},${cell.r}`;
  const blocked = new Set(state.units.filter((u) => !u.defeated && u.id !== caster.id).map(key));
  const queue = [{ ...objective.exit, d: 0 }];
  distance.set(key(objective.exit), 0);
  for (let index = 0; index < queue.length; index++) {
    const cur = queue[index];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { c: cur.c + dc, r: cur.r + dr, d: cur.d + 1 };
      if (!inBounds(next.c, next.r) || blocked.has(key(next)) || distance.has(key(next))) continue;
      distance.set(key(next), next.d); queue.push(next);
    }
  }
  if (!caster.hasMoved) {
    const cells = reachableCells(caster, state.units).filter((cell) => (distance.get(key(cell)) ?? Infinity) < (distance.get(key(caster)) ?? Infinity));
    cells.sort((a, b) => (distance.get(key(a)) ?? Infinity) - (distance.get(key(b)) ?? Infinity));
    if (cells[0]) {
      const blocker = objective.screenedEscape && state.units.find(u=>!u.defeated&&u.team==="ally"&&u.c===objective.exit.c&&u.r===objective.exit.r);
      const strike = blocker && availableSkills(state,caster).find(s=>s.ready&&s.slot==="A1"&&inSkillRange({...caster,...cells[0]},blocker,s));
      return {type:"move",to:cells[0],...(strike&&blocker?{then:{type:"skill" as const,skillId:strike.id,targetId:blocker.id}}:{})};
    }
  }
  const attack = availableSkills(state, caster).find((s) => s.ready && s.slot === "A1");
  const legal = attack ? validTargetIds(state.units,caster,attack) : [];
  const blocker = objective.screenedEscape && state.units.find(u=>!u.defeated&&u.team==="ally"&&u.c===objective.exit.c&&u.r===objective.exit.r&&legal.includes(u.id));
  const target = blocker ? blocker.id : legal[0];
  return target ? { type: "skill", skillId: attack!.id, targetId: target } : { type: "skip" };
}

/** Objective-based enemy positioning in VNext. The existing combat engine validates all moves.
 * Legacy accepted runs retain their original AI; no reward, spawn or objective changes. */
export function objectiveAwareEnemyAction(state: BattleState): AiAction | null {
  const caster = state.units.find(u => u.id === state.activeId);
  if (!caster || caster.team !== "enemy" || caster.defeated || caster.hasMoved) return null;
  const objective = state.objective;
  if (objective?.type !== "HOLD") return null;
  if (caster.archetype === "MARKSMAN" || caster.archetype === "COURIER") return null;
  const d = (c: Cell) => Math.abs(c.c - objective.terminal.c) + Math.abs(c.r - objective.terminal.r);
  const current = d(caster);
  if (current <= objective.radius) return null;
  const candidates = reachableCells(caster, state.units).filter(cell => d(cell) < current);
  if (!candidates.length) return null;
  const allies = living(state.units, "ally");
  // Contesting the relay only matters when it can be reached, or an ally is already defending it.
  if (!allies.some(a => d(a) <= objective.radius) && current > caster.move + objective.radius + 1) return null;
  const ranked = candidates.map(cell => {
    const distance = d(cell);
    const exposure = allies.reduce((sum, ally) => sum + (chebyshev(cell, ally) <= 1 ? 1 : 0), 0);
    return { cell, score: distance * 100 + exposure * 5 + cell.c / 100 + cell.r / 1000 };
  }).sort((a,b)=>a.score-b.score);
  const dest = ranked[0]?.cell;
  return dest ? { type:"move", to:dest } : null;
}

/** Deny RECOVER at the relay without inventing new hazards, statuses or extra enemies.
 * Fast units may contest the approach; existing combat engine validates movement. */
export function relayDenialAction(state: BattleState): AiAction | null {
  const actor = state.units.find(u=>u.id===state.activeId);
  const o=state.objective;
  if(!actor||actor.team!=="enemy"||actor.defeated||actor.hasMoved||o?.type!=="RECOVER")return null;
  if(actor.archetype==="MARKSMAN"||actor.archetype==="COURIER")return null;
  const md=(p:Cell)=>Math.abs(p.c-o.terminal.c)+Math.abs(p.r-o.terminal.r);
  const allies=living(state.units,"ally");
  const nearest=Math.min(...allies.map(md));
  if(!allies.length||nearest>4)return null;
  const current=md(actor);
  if(current<=1||current>5)return null;
  const moves=reachableCells(actor,state.units).filter(p=>md(p)<current);
  const best=moves.sort((a,b)=>md(a)-md(b)||a.c-b.c||a.r-b.r)[0];
  return best?{type:"move",to:best}:null;
}

/** Context priorities are allowed to change *decisions*, not objective rules.
 * For SURVIVE/BOSS/INTERCEPT/ELIMINATE, target scores guide normal legal skill use.
 * HOLD/RECOVER may additionally force a contested route rather than a direct attack. */
export function encounterPressureAction(state:BattleState):AiAction|null {
  const actor=state.units.find(u=>u.id===state.activeId);
  if(!actor||actor.team!=="enemy"||actor.defeated)return null;
  if(state.objective?.type==="HOLD") {
    const objective=state.objective;
    const defending=living(state.units,"ally").some(a=>Math.abs(a.c-objective.terminal.c)+Math.abs(a.r-objective.terminal.r)<=objective.radius);
    // Attack a reachable holder rather than waste a move into an occupied contested tile.
    if(defending) {
      const ready=availableSkills(state,actor).filter(s=>s.ready&&s.targetType==="ENEMY_SINGLE");
      for(const skill of ready){
        const holder=living(state.units,"ally").filter(a=>Math.abs(a.c-objective.terminal.c)+Math.abs(a.r-objective.terminal.r)<=objective.radius);
        const victim=pickTarget(actor,holder,skill,state);
        if(victim&&inSkillRange(actor,victim,skill))return {type:"skill",skillId:skill.id,targetId:victim.id};
      }
    }
    return objectiveAwareEnemyAction(state);
  }
  if(state.objective?.type==="RECOVER")return relayDenialAction(state);
  return null;
}

export function chooseAiAction(state: BattleState): AiAction {
  const caster = state.units.find((u) => u.id === state.activeId);
  if (!caster || caster.defeated || caster.team !== "enemy") return { type: "skip" };
  const objectiveAction = interceptAction(state, caster);
  if (objectiveAction) return objectiveAction;
  // Only official VNext battles use the new objective-aware roles.
  if (BATTLEFIELD_VNEXT_PREVIEW) {
    const response = encounterPressureAction(state);
    if (response) return response;
  }

  const skills = availableSkills(state, caster).filter((s) => s.ready);
  // A threatened marksman first creates distance instead of firing illegally at adjacency.
  if (caster.archetype === "MARKSMAN" && !caster.hasMoved) {
    const near = foesOf(caster, state.units).some(u => chebyshev(caster, u) <= 1);
    if (near) {
      const cells = reachableCells(caster, state.units);
      const scored = cells.map(cell => ({cell, d: Math.min(...foesOf(caster,state.units).map(u=>chebyshev(cell,u)))})).sort((a,b)=>b.d-a.d || a.cell.c-b.cell.c || a.cell.r-b.cell.r);
      if (scored[0]?.d > 1) return { type: "move", to: scored[0].cell };
    }
  }
  const foes = foesOf(caster, state.units);
  if (!foes.length) return { type: "skip" };

  // Prefer specials when they have a reachable target this turn.
  const ranked = [...skills].sort((a, b) => {
    const slotRank = { A3: 0, A2: 1, A1: 2 }[a.slot] - { A3: 0, A2: 1, A1: 2 }[b.slot];
    if (caster.role === "leader" && a.id.includes("intimidate") && b.slot !== "A3") return -1;
    return slotRank;
  });

  // Leader occasionally uses control if a dangerous target is in range after a move.
  for (const skill of ranked) {
    if (skill.targetType === "SELF" || skill.targetType === "ALLY_AOE" || skill.targetType === "ENEMY_AOE") {
      if (skill.targetType === "ALLY_AOE") {
        const allies = alliesOf(caster, state.units);
        const hurt = allies.filter((a) => a.hp < a.maxHp * 0.85);
        if (hurt.length === 0 && skill.effects.every((e) => e.kind !== "damage")) {
          continue;
        }
      }
      if (!caster.hasMoved) {
        // stay put
      }
      return { type: "skill", skillId: skill.id };
    }

    const intended = pickTarget(caster, foes, skill, state);
    if (!intended) continue;

    if (inSkillRange(caster, intended, skill)) {
      return { type: "skill", skillId: skill.id, targetId: intended.id };
    }
    if (!caster.hasMoved) {
      const to = bestMoveForSkill(caster, state.units, skill, intended);
      if (to) {
        const after = { ...caster, c: to.c, r: to.r };
        if (inSkillRange(after, intended, skill)) {
          return { type: "move", to, then: { type: "skill", skillId: skill.id, targetId: intended.id } };
        }
        // Keep the move if it gets us closer even if we then fall back to A1
        const a1 = skills.find((s) => s.slot === "A1") ?? skill;
        if (inSkillRange(after, intended, a1)) {
          return { type: "move", to, then: { type: "skill", skillId: a1.id, targetId: intended.id } };
        }
        return { type: "move", to };
      }
    }
  }

  // Fallback: close on weakest / alpha
  if (!caster.hasMoved) {
    const focus = [...foes].sort((a, b) => BATTLEFIELD_VNEXT_PREVIEW ? objectiveTargetScore(state,caster,b)-objectiveTargetScore(state,caster,a) : threatScore(b)-threatScore(a))[0];
    const cells = reachableCells(caster, state.units);
    let best: Cell | null = null;
    let bestD = chebyshev(caster, focus);
    for (const cell of cells) {
      const d = chebyshev(cell, focus);
      if (d < bestD) {
        bestD = d;
        best = cell;
      }
    }
    if (best) {
      const after = { ...caster, c: best.c, r: best.r };
      const a1 = skills.find((s) => s.slot === "A1");
      if (a1) {
        const t = pickTarget(after, foes, a1, state);
        if (t && inSkillRange(after, t, a1)) {
          return { type: "move", to: best, then: { type: "skill", skillId: a1.id, targetId: t.id } };
        }
      }
      return { type: "move", to: best };
    }
  }

  return { type: "skip" };
}

export function aiUsesLegalRules(state: BattleState, action: AiAction): boolean {
  const caster = state.units.find((u) => u.id === state.activeId);
  if (!caster) return false;
  if (action.type === "skip") return true;
  if (action.type === "move") {
    const cells = reachableCells(caster, state.units);
    return cells.some((c) => c.c === action.to.c && c.r === action.to.r);
  }
  if (action.type === "skill") {
    const skill = getSkill(action.skillId);
    if (!caster.skillIds.includes(skill.id)) return false;
    if (!skillReady(caster, skill)) return false;
    if (!skillNeedsTargetPick(skill)) return true;
    return validTargetIds(state.units, caster, skill).includes(action.targetId ?? "");
  }
  return false;
}
