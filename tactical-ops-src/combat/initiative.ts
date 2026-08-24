import { METER_MAX, type BattleState, type CombatUnit } from "./types";
import { effectiveSpd } from "./effects";
import { living } from "./targeting";

function cmpReady(a: CombatUnit, b: CombatUnit): number {
  if (b.meter !== a.meter) return b.meter - a.meter;
  const ds = effectiveSpd(b) - effectiveSpd(a);
  if (ds) return ds;
  return a.id.localeCompare(b.id);
}

export function tickUntilReady(units: CombatUnit[]): CombatUnit[] {
  const next = units.map((u) => ({ ...u }));
  for (let guard = 0; guard < 400; guard++) {
    const ready = living(next).filter((u) => u.meter >= METER_MAX);
    if (ready.length) return next;
    for (const u of next) {
      if (u.defeated) continue;
      u.meter += effectiveSpd(u);
    }
  }
  return next;
}

export function pickReadyId(units: CombatUnit[]): string | null {
  const ready = living(units).filter((u) => u.meter >= METER_MAX);
  if (!ready.length) return null;
  ready.sort(cmpReady);
  return ready[0].id;
}

export function consumeMeter(unit: CombatUnit): CombatUnit {
  return { ...unit, meter: Math.max(0, unit.meter - METER_MAX), hasMoved: false, hasActed: false };
}

/** Upcoming actor ids. Active unit is first if present. */
export function previewQueue(state: BattleState, count = 6): string[] {
  const ids: string[] = [];
  let units = state.units.map((u) => ({
    ...u,
    statuses: u.statuses.map((s) => ({ ...s })),
    cooldowns: { ...u.cooldowns },
  }));
  if (state.activeId) {
    const active = units.find((u) => u.id === state.activeId && !u.defeated);
    if (active) ids.push(active.id);
  }
  while (ids.length < count) {
    units = tickUntilReady(units);
    const id = pickReadyId(units);
    if (!id) break;
    ids.push(id);
    units = units.map((u) => (u.id === id ? consumeMeter(u) : u));
  }
  return ids.slice(0, count);
}
