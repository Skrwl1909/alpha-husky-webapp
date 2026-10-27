import { supportCooldownExtra } from "./missionRules";
import type { BattleEvent, BattleState, Cell, CombatUnit, SkillDef } from "./types";
import { applyStatus, effectiveAtk, incomingDamageMultiplier, STATUS_LABEL } from "./effects";
import { computeHeal, mitigatedDamage } from "./damage";
import { resolveSkillTargets, skillNeedsTargetPick, validTargetIds } from "./targeting";
import { getSkill } from "../data/skills";
import { resolveGrowthSkill } from "../data/playerGrowth";

export function unitSkills(unit: CombatUnit): SkillDef[] {
  return unit.skillIds.map((id) => resolveGrowthSkill(getSkill(id), unit.growth));
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
  const skill = resolveGrowthSkill(getSkill(skillId), caster.growth);
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
  // Targetability proof compares the same accepted sidegrade/mastery without invested ranks.
  const unranked = resolveGrowthSkill(getSkill(skillId), caster.growth ? { ...caster.growth, ranks: {} } : undefined);
  const baselineTargets = resolveSkillTargets(state.units, caster, unranked, targetId, cell);
  const addedReach = hits.filter(h => !baselineTargets.some(b => b.id === h.id));
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
      const original = state.units.find(u => u.id === current.id)!;
      if (spec.maxHpRatio !== undefined && original.hp / original.maxHp > spec.maxHpRatio) continue;
      if (spec.kind === "damage") {
        const mult = spec.multiplier ?? 1;
        let dmg = mitigatedDamage(atk, mult, current);
        const withoutGuard = dmg;
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
        events.push({ type: "damage", unitId: current.id, amount: dmg, text: `-${dmg}`, kind: "dmg",
          ...(current.team === "ally" && withoutGuard > dmg ? { buildEvidence: `${current.name}: GUARD prevented ${withoutGuard - dmg} damage${withoutGuard >= current.hp && hp > 0 ? "; survived the blow" : ""}.` } : {}) });
        if (defeated) events.push({ type: "defeat", unitId: current.id, text: "DOWN", kind: "info" });
      } else if (spec.kind === "heal") {
        const healed = computeHeal(spec.base ?? 0, spec.scale ?? 0, atk, current);
        if (healed > 0) {
          units = patch(units, current.id, (u) => ({ ...u, hp: Math.min(u.maxHp, u.hp + healed) }));
          events.push({ type: "heal", unitId: current.id, amount: healed, text: `+${healed}`, kind: "heal",
            ...(caster.team === "ally" ? { buildEvidence: `${caster.name} ${skill.name}: restored ${healed} HP to ${current.name}.` } : {}) });
        }
      } else if (spec.kind === "status" && spec.status) {
        const dur = spec.duration ?? 1;
        const val = spec.value ?? 0;
        const res = applyStatus(current, spec.status, skill.id, dur, val);
        if (spec.status === "GUARD" && caster.growth?.rulesVersion === 2) {
          const existing = current.statuses.find(s => s.type === "GUARD");
          const reduction = Math.max(existing ? existing.guardReduction ?? 0.5 : 0, Math.min(0.5, Math.max(0, val)));
          res.unit = { ...res.unit, statuses: res.unit.statuses.map(s => s.type === "GUARD" ? { ...s, guardReduction: reduction } : s) };
        }
        units = patch(units, current.id, () => res.unit);
        events.push({
          type: "status",
          unitId: current.id,
          text: STATUS_LABEL[spec.status],
          kind: spec.status === "GUARD" ? "guard" : "status",
          ...(caster.team === "ally" && res.unit.statuses.some(s => s.source === skill.id && s.type === spec.status)
            ? { buildEvidence: `${caster.name} ${skill.name}: ${STATUS_LABEL[spec.status]} applied to ${current.name} (${dur} personal turns).` } : {}),
        });
      }
    }
  }

  if (caster.team === "ally") for (const target of addedReach) {
    if (events.some(e => e.unitId === target.id && ["damage", "heal", "status"].includes(e.type))) {
      events.push({ type: "info", buildEvidence: `${caster.name} ${skill.name}: reached ${target.name} beyond the unranked ${skill.targetType === "ALLY_AOE" ? "radius" : "range"} (${Math.max(Math.abs(caster.c-target.c), Math.abs(caster.r-target.r))} cells).` });
    }
  }
  units = patch(units, caster.id, (u) => ({
    ...u,
    hasActed: true,
    cooldowns: {
      ...u.cooldowns,
      [skill.id]: skill.cooldownMax + supportCooldownExtra(state.directive, caster, skill),
    },
  }));
  if (skill.cooldownMax > 0) {
    events.push({ type: "cooldown", unitId: caster.id, text: skill.name });
  }

  return {
    state: {
      ...state,
      healingActions: (state.healingActions || 0) + (caster.team === "ally" && skill.effects.some((effect) => effect.kind === "heal") ? 1 : 0),
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
      desc: supportCooldownExtra(state.directive, unit, skill) ? `${skill.desc} Disrupted Support: cooldown +${supportCooldownExtra(state.directive, unit, skill)}.` : skill.desc,
      ready,
      cd,
      targets: ready ? validTargetIds(state.units, unit, skill) : [],
    };
  });
}
