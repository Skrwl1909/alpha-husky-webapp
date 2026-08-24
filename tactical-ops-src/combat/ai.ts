import type { AiAction, BattleState, Cell, CombatUnit, SkillDef } from "./types";
import { availableSkills, skillReady } from "./skills";
import { chebyshev, reachableCells } from "./movement";
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

function pickTarget(caster: CombatUnit, candidates: CombatUnit[], skill: SkillDef): CombatUnit | null {
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => {
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
    const score = (inR ? 0 : 100) + d;
    if (score < bestScore) {
      bestScore = score;
      best = cell;
    }
  }
  return best;
}

export function chooseAiAction(state: BattleState): AiAction {
  const caster = state.units.find((u) => u.id === state.activeId);
  if (!caster || caster.defeated || caster.team !== "enemy") return { type: "skip" };

  const skills = availableSkills(state, caster).filter((s) => s.ready);
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

    const intended = pickTarget(caster, foes, skill);
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
    const focus = [...foes].sort((a, b) => threatScore(b) - threatScore(a))[0];
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
        const t = pickTarget(after, foes, a1);
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
