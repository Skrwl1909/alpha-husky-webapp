import type { BattleEvent, BattleState, Cell, CombatUnit, SkillDef } from "./types";
import { applyStatus, effectiveAtk, incomingDamageMultiplier, STATUS_LABEL } from "./effects";
import { computeHeal, mitigatedDamage } from "./damage";
import { resolveSkillTargets, skillNeedsTargetPick, validTargetIds } from "./targeting";
import { getSkill } from "../data/skills";

export function unitSkills(unit: CombatUnit): SkillDef[] {
  return unit.skillIds.map(getSkill);
}

export function cooldownLeft(unit: CombatUnit, skillId: string): number {
  return Math.max(0, unit.cooldowns[skillId] ?? 0);
}

export function skillReady(unit: CombatUnit, skill: SkillDef): boolean {
  return cooldownLeft(unit, skill.id) <= 0;
}

function patch(units: CombatUnit[], id: string, fn: (u: CombatUnit) => CombatUnit): CombatUnit[] {
  return units.map((u) => (u.id === id ? fn(u) : u));
}

export function applySkill(
  state: BattleState,
  skillId: string,
  targetId?: string | null,
  cell?: Cell | null,
): { state: BattleState; events: BattleEvent[]; ok: boolean; reason?: string } {
  const caster = state.units.find((u) => u.id === state.activeId);
  if (!caster || caster.defeated || caster.hasActed) {
    return { state, events: [], ok: false, reason: "no-actor" };
  }
  if (!caster.skillIds.includes(skillId)) {
    return { state, events: [], ok: false, reason: "unknown-skill" };
  }
  const skill = getSkill(skillId);
  if (!skillReady(caster, skill)) {
    return { state, events: [], ok: false, reason: "cooldown" };
  }
  if (skillNeedsTargetPick(skill) && !targetId && !cell) {
    return { state, events: [], ok: false, reason: "need-target" };
  }
  const hits = resolveSkillTargets(state.units, caster, skill, targetId, cell);
  if (skillNeedsTargetPick(skill) && hits.length === 0) {
    return { state, events: [], ok: false, reason: "invalid-target" };
  }
  if (!skillNeedsTargetPick(skill) && skill.targetType !== "SELF" && hits.length === 0) {
    // AoE with no one in radius still spends the action (howl with only self is ok because self is ally)
  }

  const events: BattleEvent[] = [];
  let units = state.units.map((u) => ({
    ...u,
    statuses: u.statuses.map((s) => ({ ...s })),
    cooldowns: { ...u.cooldowns },
  }));
  let hostilesEliminated = state.hostilesEliminated;
  let damageTaken = state.damageTaken;

  const primary = targetId ? units.find((u) => u.id === targetId) : hits[0];
  const atk = effectiveAtk(caster);

  const nameFor = (id: string) => units.find((u) => u.id === id)?.name ?? id;
  const targetLabel = primary ? nameFor(primary.id) : skill.targetType === "SELF" ? caster.name : "squad";
  events.push({
    type: "ticker",
    text: `${caster.name}  ·  ${skill.name}${targetLabel && targetLabel !== caster.name ? `  →  ${targetLabel}` : ""}`,
  });

  const recipientsFor = (on: SkillDef["effects"][number]["on"]): CombatUnit[] => {
    if (on === "self") return [units.find((u) => u.id === caster.id)!];
    if (on === "primary") {
      const t = primary ? units.find((u) => u.id === primary.id) : units.find((u) => u.id === caster.id);
      return t ? [t] : [];
    }
    if (on === "aoe_allies") return hits.filter((h) => h.team === caster.team).map((h) => units.find((u) => u.id === h.id)!);
    if (on === "aoe_enemies") return hits.filter((h) => h.team !== caster.team).map((h) => units.find((u) => u.id === h.id)!);
    return hits.map((h) => units.find((u) => u.id === h.id)!).filter(Boolean);
  };

  for (const spec of skill.effects) {
    const rec = recipientsFor(spec.on ?? "hits").filter(Boolean);
    for (const raw of rec) {
      const current = units.find((u) => u.id === raw.id);
      if (!current || current.defeated) continue;
      if (spec.kind === "damage") {
        const mult = spec.multiplier ?? 1;
        let dmg = mitigatedDamage(atk, mult, current);
        dmg = Math.max(1, Math.round(dmg * incomingDamageMultiplier(current)));
        const hp = Math.max(0, current.hp - dmg);
        const defeated = hp <= 0;
        if (current.team === "ally") damageTaken += dmg;
        if (defeated && current.team === "enemy" && !current.defeated) hostilesEliminated += 1;
        units = patch(units, current.id, (u) => ({
          ...u,
          hp,
          defeated,
          statuses: defeated ? [] : u.statuses,
        }));
        events.push({ type: "damage", unitId: current.id, amount: dmg, text: `-${dmg}`, kind: "dmg" });
        if (defeated) events.push({ type: "defeat", unitId: current.id, text: "DOWN", kind: "info" });
      } else if (spec.kind === "heal") {
        const healed = computeHeal(spec.base ?? 0, spec.scale ?? 0, atk, current);
        if (healed > 0) {
          units = patch(units, current.id, (u) => ({ ...u, hp: Math.min(u.maxHp, u.hp + healed) }));
          events.push({ type: "heal", unitId: current.id, amount: healed, text: `+${healed}`, kind: "heal" });
        }
      } else if (spec.kind === "status" && spec.status) {
        const dur = spec.duration ?? 1;
        const val = spec.value ?? 0;
        const res = applyStatus(current, spec.status, skill.id, dur, val);
        units = patch(units, current.id, () => res.unit);
        events.push({
          type: "status",
          unitId: current.id,
          text: STATUS_LABEL[spec.status],
          kind: spec.status === "GUARD" ? "guard" : "status",
        });
      }
    }
  }

  units = patch(units, caster.id, (u) => ({
    ...u,
    hasActed: true,
    cooldowns: {
      ...u.cooldowns,
      [skill.id]: skill.cooldownMax,
    },
  }));
  if (skill.cooldownMax > 0) {
    events.push({ type: "cooldown", unitId: caster.id, text: skill.name });
  }

  return {
    state: {
      ...state,
      units,
      hostilesEliminated,
      damageTaken,
      actionSkillId: null,
      mode: "locked",
    },
    events,
    ok: true,
  };
}

export function availableSkills(state: BattleState, unit: CombatUnit): Array<SkillDef & { ready: boolean; cd: number; targets: string[] }> {
  return unitSkills(unit).map((skill) => {
    const cd = cooldownLeft(unit, skill.id);
    const ready = cd <= 0;
    return {
      ...skill,
      ready,
      cd,
      targets: ready ? validTargetIds(state.units, unit, skill) : [],
    };
  });
}
