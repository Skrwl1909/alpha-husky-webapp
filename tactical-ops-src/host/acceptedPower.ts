/** Display-only, server-frozen P2 binding. Never used to authorize commands. */
export type AcceptedPower = {
  version: "commander-power-staging.v1" | "tactical-power-projection-p2.v1";
  projectionId: string;
  alpha: {hp:number;atk:number;def:number;spd:number};
};
const BOUNDS = {hp:[120,225],atk:[28,60],def:[12,36],spd:[14,19]} as const;
function readAlpha(raw: unknown): AcceptedPower["alpha"] | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const alpha = {} as AcceptedPower["alpha"];
  for (const k of Object.keys(BOUNDS) as Array<keyof typeof BOUNDS>) {
    const n = a[k], [lo, hi] = BOUNDS[k];
    if (typeof n !== "number" || !Number.isInteger(n) || n < lo || n > hi) return null;
    alpha[k] = n;
  }
  return alpha;
}
export function parseAcceptedPowerDisplay(raw: unknown): AcceptedPower | null {
  if (raw === null || raw === undefined) return null;
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (value.version !== "tactical-power-projection-p2.v1" || typeof value.projectionId !== "string"
      || !/^[0-9a-f]{64}$/.test(value.projectionId)) return null;
  const alpha = readAlpha(value.alpha);
  return alpha ? {version: "tactical-power-projection-p2.v1", projectionId: value.projectionId, alpha} : null;
}
export function parseAcceptedPower(raw: unknown, runId: unknown, missionId: unknown, squadIds: unknown): AcceptedPower | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  if (b.version !== "commander-power-staging.v1" || b.runId !== runId ||
      missionId !== "broken-signal-commander" || typeof runId !== "string" ||
      !/^mission_verified_v1_[0-9a-f]{32}$/.test(runId) ||
      !Array.isArray(squadIds) || squadIds.join("|") !== "alpha|ally-02|ally-03" ||
      !b.projection || typeof b.projection !== "object") return null;
  const p = b.projection as Record<string, unknown>;
  if (p.version !== "tactical-power-projection-p2.v1" || p.activation !== "LAB_ONLY" ||
      typeof p.projectionId !== "string" || !/^[0-9a-f]{64}$/.test(p.projectionId)) return null;
  const alpha = readAlpha(p.alpha);
  return alpha ? {version:"commander-power-staging.v1",projectionId:p.projectionId,alpha} : null;
}
