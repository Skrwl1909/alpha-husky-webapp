import type { CombatUnit, StatusEffect, StatusType } from "./types";

let statusSeq = 1;

export function resetStatusSeq(): void {
  statusSeq = 1;
}

export function hasStatus(unit: CombatUnit, type: StatusType): StatusEffect | undefined {
  return unit.statuses.find((s) => s.type === type);
}

export function applyStatus(
  unit: CombatUnit,
  type: StatusType,
  source: string,
  duration: number,
  value: number,
): { unit: CombatUnit; applied: StatusEffect; refreshed: boolean } {
  const existing = unit.statuses.find((s) => s.type === type);
  if (existing) {
    const next: StatusEffect = {
      ...existing,
      source,
      duration: Math.max(existing.duration, duration),
      value,
    };
    return {
      unit: {
        ...unit,
        statuses: unit.statuses.map((s) => (s.id === existing.id ? next : s)),
      },
      applied: next,
      refreshed: true,
    };
  }
  const applied: StatusEffect = {
    id: `st-${statusSeq++}`,
    type,
    source,
    duration,
    value,
  };
  return { unit: { ...unit, statuses: [...unit.statuses, applied] }, applied, refreshed: false };
}

function modifier(unit: CombatUnit, up: StatusType, down: StatusType): number {
  const u = hasStatus(unit, up);
  const d = hasStatus(unit, down);
  let m = 1;
  if (u) m += u.value;
  if (d) m -= d.value;
  return Math.max(0.4, m);
}

export function effectiveAtk(unit: CombatUnit): number {
  return Math.max(1, Math.round(unit.atk * modifier(unit, "ATK_UP", "ATK_DOWN")));
}

export function effectiveDef(unit: CombatUnit): number {
  return Math.max(0, Math.round(unit.def * modifier(unit, "DEF_UP", "DEF_DOWN")));
}

export function effectiveSpd(unit: CombatUnit): number {
  return Math.max(1, Math.round(unit.spd * modifier(unit, "SPD_UP", "SPD_DOWN")));
}

export function incomingDamageMultiplier(unit: CombatUnit): number {
  return hasStatus(unit, "GUARD") ? 0.5 : 1;
}

export const STATUS_LABEL: Record<StatusType, string> = {
  ATK_UP: "ATK UP",
  DEF_UP: "DEF UP",
  SPD_UP: "SPD UP",
  GUARD: "GUARD",
  BLEED: "BLEED",
  ATK_DOWN: "ATK DOWN",
  DEF_DOWN: "DEF DOWN",
  SPD_DOWN: "SPD DOWN",
};

export const STATUS_SHORT: Record<StatusType, string> = {
  ATK_UP: "ATK+",
  DEF_UP: "DEF+",
  SPD_UP: "SPD+",
  GUARD: "GRD",
  BLEED: "BLD",
  ATK_DOWN: "ATK-",
  DEF_DOWN: "DEF-",
  SPD_DOWN: "SPD-",
};
