import { GRID_COLS, GRID_ROWS, type Cell, type CombatUnit } from "./types";

export function inBounds(c: number, r: number): boolean {
  return c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS;
}

export function chebyshev(a: { c: number; r: number }, b: { c: number; r: number }): number {
  return Math.max(Math.abs(a.c - b.c), Math.abs(a.r - b.r));
}

export function cellKey(c: number, r: number): string {
  return `${c},${r}`;
}

export function occupiedKeys(units: CombatUnit[], ignoreId?: string): Set<string> {
  const set = new Set<string>();
  for (const u of units) {
    if (u.defeated) continue;
    if (ignoreId && u.id === ignoreId) continue;
    set.add(cellKey(u.c, u.r));
  }
  return set;
}

export function unitAt(units: CombatUnit[], c: number, r: number): CombatUnit | undefined {
  return units.find((u) => !u.defeated && u.c === c && u.r === r);
}

function orthogonalNeighbors(c: number, r: number): Cell[] {
  const out: Cell[] = [];
  for (const [dc, dr] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const) {
    const nc = c + dc;
    const nr = r + dr;
    if (inBounds(nc, nr)) out.push({ c: nc, r: nr });
  }
  return out;
}

/** Orthogonal BFS movement. Occupied cells are blocked. */
export function reachableCells(unit: CombatUnit, units: CombatUnit[], moveRange = unit.move): Cell[] {
  if (moveRange <= 0) return [];
  const blocked = occupiedKeys(units, unit.id);
  const seen = new Set<string>([cellKey(unit.c, unit.r)]);
  const out: Cell[] = [];
  const q: Array<Cell & { d: number }> = [{ c: unit.c, r: unit.r, d: 0 }];
  while (q.length) {
    const cur = q.shift()!;
    if (cur.d === moveRange) continue;
    for (const n of orthogonalNeighbors(cur.c, cur.r)) {
      const k = cellKey(n.c, n.r);
      if (seen.has(k) || blocked.has(k)) continue;
      seen.add(k);
      out.push(n);
      q.push({ ...n, d: cur.d + 1 });
    }
  }
  return out;
}

export function canOccupy(units: CombatUnit[], c: number, r: number, ignoreId?: string): boolean {
  return inBounds(c, r) && !occupiedKeys(units, ignoreId).has(cellKey(c, r));
}

/**
 * Render-only overhead projection. Logical grid coordinates and combat rules
 * remain unchanged. Shared anchors are used by units, grid, hazards, targets,
 * movement affordances, mission objectives and combat FX.
 */
export const FIELD_PROJECTION = Object.freeze({
  left: 12,
  right: 88,
  top: 24,
  bottom: 82,
  touchFill: 0.82,
});

export function fieldPercentForGrid(
  c: number, r: number, columns: number, rows: number,
): { x: number; y: number } {
  const across = c / Math.max(1, columns - 1);
  const down = r / Math.max(1, rows - 1);
  return {
    x: FIELD_PROJECTION.left + (FIELD_PROJECTION.right - FIELD_PROJECTION.left) * across,
    y: FIELD_PROJECTION.top + (FIELD_PROJECTION.bottom - FIELD_PROJECTION.top) * down,
  };
}

export function fieldPercent(c: number, r: number): { x: number; y: number } {
  return fieldPercentForGrid(c, r, GRID_COLS, GRID_ROWS);
}

export function fieldTouchFootprint(columns: number, rows: number): { widthPct: number; heightPct: number } {
  return {
    widthPct: ((FIELD_PROJECTION.right - FIELD_PROJECTION.left) / Math.max(1, columns - 1)) * FIELD_PROJECTION.touchFill,
    heightPct: ((FIELD_PROJECTION.bottom - FIELD_PROJECTION.top) / Math.max(1, rows - 1)) * FIELD_PROJECTION.touchFill,
  };
}
