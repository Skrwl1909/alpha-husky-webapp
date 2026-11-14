/** Backend-authoritative Relay Pressure V1 contract. Never derive clears from local combat. */
export const SIGNAL_TRIAL_RULESET = "tactical-intent-vnext.0";
export const SIGNAL_TRIAL_REVISION = 1;
export type SignalTrialRevision = 1 | 2 | 3;

export function signalTrialRevision(level: number, progress?: SignalTrialProgress | null): SignalTrialRevision {
  if (progress?.activeRun?.level === level) return progress.activeRun.trialRevision;
  if (level === 5 && progress?.trialRevision === 3) return 3;
  return level >= 4 && (progress?.trialRevision ?? 1) >= 2 ? 2 : SIGNAL_TRIAL_REVISION;
}
export interface SignalTrialResult {
  runId: string; trialId: string; level: number; trialRevision: SignalTrialRevision;
  victory: boolean; objectiveComplete: boolean; turns: number;
  squadStanding: number; squadDeployed: 3;
  failureReason: "DEADLINE" | null; recordedAt: number;
  evidenceSource: "ACCEPTED_CLIENT_REPORT";
}
export interface SignalTrialRun {
  runId: string; trialId: string; level: number; trialRevision: SignalTrialRevision;
  squadIds: string[];
  trialContext: { encounter: Record<string, unknown>; encounterHash: string };
  rulesContract: import("../combat/intentContract").RunRulesContract;
  combatProfileV2: import("../combat/combatProfile").TacticalCombatProfileV2 | null;
  combatProfileV3: import("../combat/combatProfileV3").TacticalCombatProfileV3 | null;
  packMastery: import("./packMastery").PackMastery;
  playerGrowth: import("./playerGrowth").GrowthSnapshot;
  fieldRend: "rend" | "reach-rend";
}
export interface SignalTrialProgress {
  version: 1; enabled: boolean; trialRevision: SignalTrialRevision; maxLevel: 6;
  highestCleared: number; clears: { level: number; trialRevision: SignalTrialRevision; trialId: string; runId: string; recordedAt: number }[];
  activeRun: SignalTrialRun | null; lastResult: SignalTrialResult | null;
  rewardPolicy: "NO_REWARDS"; evidenceSource: "ACCEPTED_CLIENT_REPORT";
}
const obj = (x: unknown): Record<string, unknown> | null => x && typeof x === "object" && !Array.isArray(x) ? x as Record<string, unknown> : null;
const levelOk = (x: unknown) => Number.isInteger(x) && Number(x) >= 1 && Number(x) <= 6;
const revisionOk = (level: unknown, revision: unknown) =>
  revision === 1 || (revision === 2 && Number(level) >= 4) || (revision === 3 && level === 5);
const maxResultTurns = (level: unknown, revision: unknown) => revision === 1 ? 8 : level === 4 ? 7 : level === 5 ? 8 : 10;
const runIdOk = (x: unknown) => typeof x === "string" && /^trial_[a-z0-9]{6,}$/i.test(x);
export function parseSignalTrialResult(raw: unknown): SignalTrialResult | null {
  const v = obj(raw); if (!v || !runIdOk(v.runId) || !levelOk(v.level) || !revisionOk(v.level, v.trialRevision) ||
    v.trialId !== `relay-pressure-v${v.trialRevision}-l${v.level}` || typeof v.victory !== "boolean" ||
    v.objectiveComplete !== v.victory || !Number.isInteger(v.turns) || Number(v.turns) < 1 || Number(v.turns) > maxResultTurns(v.level, v.trialRevision) ||
    !Number.isInteger(v.squadStanding) || Number(v.squadStanding) < 0 || Number(v.squadStanding) > 3 ||
    v.squadDeployed !== 3 || (v.failureReason !== null && v.failureReason !== "DEADLINE") ||
    !Number.isInteger(v.recordedAt) || Number(v.recordedAt) < 0 || v.evidenceSource !== "ACCEPTED_CLIENT_REPORT") return null;
  return v as unknown as SignalTrialResult;
}
export function parseSignalTrialRun(raw: unknown): SignalTrialRun | null {
  const v = obj(raw); if (!v || !runIdOk(v.runId) || !levelOk(v.level) ||
    !revisionOk(v.level, v.trialRevision) || v.trialId !== `relay-pressure-v${v.trialRevision}-l${v.level}` ||
    !Array.isArray(v.squadIds) || v.squadIds.length !== 3 || v.squadIds[0] !== "alpha" ||
    !v.squadIds.every(x => typeof x === "string") || new Set(v.squadIds).size !== 3 ||
    !obj(v.trialContext) || typeof (v.trialContext as Record<string, unknown>).encounterHash !== "string" ||
    !obj((v.trialContext as Record<string, unknown>).encounter) ||
    !obj(v.rulesContract) || !obj(v.combatProfileV3) || !obj(v.combatProfileV2) ||
    !obj(v.playerGrowth) || !obj(v.packMastery) || !["rend","reach-rend"].includes(String(v.fieldRend))) return null;
  return v as unknown as SignalTrialRun;
}
export function parseSignalTrials(raw: unknown): SignalTrialProgress | null {
  const v = obj(raw); if (!v || v.version !== 1 || typeof v.enabled !== "boolean" ||
    (v.trialRevision !== 1 && v.trialRevision !== 2 && v.trialRevision !== 3) || v.maxLevel !== 6 || !Number.isInteger(v.highestCleared) ||
    Number(v.highestCleared) < 0 || Number(v.highestCleared) > 6 ||
    v.rewardPolicy !== "NO_REWARDS" || v.evidenceSource !== "ACCEPTED_CLIENT_REPORT" ||
    !Array.isArray(v.clears) || v.clears.length !== v.highestCleared) return null;
  for (let i = 0; i < v.clears.length; i++) {
    const c = obj(v.clears[i]);
    if (!c || c.level !== i + 1 || !revisionOk(c.level, c.trialRevision) ||
      c.trialId !== `relay-pressure-v${c.trialRevision}-l${i+1}` || !runIdOk(c.runId) ||
      !Number.isInteger(c.recordedAt)) return null;
  }
  const activeRun = v.activeRun == null ? null : parseSignalTrialRun(v.activeRun);
  const lastResult = v.lastResult == null ? null : parseSignalTrialResult(v.lastResult);
  if ((v.activeRun != null && !activeRun) || (v.lastResult != null && !lastResult)) return null;
  return { ...v, activeRun, lastResult } as SignalTrialProgress;
}
