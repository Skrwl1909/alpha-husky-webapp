/** Display-only, server-frozen P2 binding. Never used to authorize commands. */
export type AcceptedPower = { version: "commander-power-staging.v1"; projectionId: string; alpha: {hp:number;atk:number;def:number;spd:number} };
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
      typeof p.projectionId !== "string" || !/^[0-9a-f]{64}$/.test(p.projectionId) ||
      !p.alpha || typeof p.alpha !== "object") return null;
  const a = p.alpha as Record<string, unknown>;
  const bounds = {hp:[120,225],atk:[28,60],def:[12,36],spd:[14,19]} as const;
  for (const k of Object.keys(bounds) as Array<keyof typeof bounds>) {
    const n=a[k], [lo,hi]=bounds[k];
    if (typeof n !== "number" || !Number.isInteger(n) || n<lo || n>hi) return null;
  }
  return {version:"commander-power-staging.v1",projectionId:p.projectionId,alpha:{hp:Number(a.hp),atk:Number(a.atk),def:Number(a.def),spd:Number(a.spd)}};
}
