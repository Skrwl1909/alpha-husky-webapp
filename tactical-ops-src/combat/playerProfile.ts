/** Progression payload contract. Combat application of these stats is owned by existing unit/identity code, not this parser. */
export interface TacticalProfile {
  version: 1;
  attack: number;
  defense: number;
  hp: number;
  initiative: number;
}

const LIMITS = {
  attack: 3,
  defense: 3,
  hp: 12,
  initiative: 1,
} as const;

function clampStat(raw: Record<string, unknown>, key: keyof typeof LIMITS): number {
  if (raw.version !== 1) return 0;
  const n = Number(raw[key]);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(LIMITS[key], Math.floor(n)));
}

export function parseTacticalProfile(value: unknown): TacticalProfile {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    version: 1,
    attack: clampStat(raw, "attack"),
    defense: clampStat(raw, "defense"),
    hp: clampStat(raw, "hp"),
    initiative: clampStat(raw, "initiative"),
  };
}
