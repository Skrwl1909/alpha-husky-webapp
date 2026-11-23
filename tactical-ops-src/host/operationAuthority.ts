/** Server transport and settlement contracts; a local victory is never proof. */
export interface RunAuthority {
  version: 1; runId: string; missionId: string; transport: "recover";
  objectiveType: "RECOVER" | "INTERCEPT" | "BOSS" | "HOLD" | "SURVIVE";
  rewardMode: "base" | "loot-honors-v1" | "practice";
}
export const ONLINE_OBJECTIVE: Record<string, RunAuthority["objectiveType"]> = {
  "field-relay-recovery":"RECOVER", "field-relay-intercept":"INTERCEPT", "broken-signal-commander":"BOSS",
  "field-relay-hold":"HOLD", "field-isolated-hold":"HOLD", "field-squad-survival":"SURVIVE", "field-rearguard":"SURVIVE",
};
export function parseAuthority(raw: unknown, runId: string, missionId: string): RunAuthority | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value=raw as RunAuthority;
  return value.version===1 && value.transport==="recover" && value.runId===runId && value.missionId===missionId &&
    value.objectiveType===ONLINE_OBJECTIVE[missionId] && ["base","loot-honors-v1","practice"].includes(value.rewardMode) ? {...value}:undefined;
}
export function confirmedFieldReceipt(state: any, runId: string, missionId: string) {
  const field=state?.fieldOps, result=field?.lastResult;
  if (field?.activeMissionRun?.runId===runId || field?.lastCompletedMissionRunId!==runId || result?.runId!==runId || result?.missionId!==missionId ||
      result.rewardAmountsAvailable===false || !Number.isSafeInteger(result.xpGranted) || result.xpGranted<0 || !Number.isSafeInteger(result.bonesGranted) || result.bonesGranted<0) return null;
  const receipt=result.settlementReceipt;
  if (receipt && (receipt.version!==1 || receipt.status!=="CONFIRMED" || receipt.runId!==runId || receipt.missionId!==missionId || typeof receipt.receiptId!=="string")) return null;
  // New generic Field Ops require a durable server receipt. Preserve genuine
  // historical Recovery/Intercept results from before the generic receipt.
  if (!receipt && !["field-relay-recovery","field-relay-intercept"].includes(missionId)) return null;
  return result;
}
export function unresolvedOperation(state: any, requestedMission?: string) {
  const runs=[state?.fieldOps?.activeMissionRun,...Object.values(state?.operations||{}).map((op:any)=>op.activeMissionRun),state?.chapterActiveMission,state?.signalTrials?.activeRun,
    state?.counterstrike?.activeRunId ? {runId:state.counterstrike.activeRunId,missionId:"counterstrike-false-relay"}:null,
    state?.lastHowl?.status==="ACTIVE" ? {runId:state.lastHowl.runId,missionId:"last-howl"}:null];
  const requested=runs.find(run=>run?.missionId===requestedMission);
  return requested || runs.find(run=>run?.runId) || null;
}
export function authoritySupported(state: any, missionId: string) {
  return state?.operationAuthority?.version===1 && state.operationAuthority.missionIds.includes(missionId) ||
    !!state?.vnextStartAvailable && ["field-relay-recovery","field-relay-intercept","broken-signal-commander"].includes(missionId);
}
export function settlementGuidance(code: string) {
  if (["mission_run_active","trial_run_active","tactical_ruleset_mismatch"].includes(code)) return "An accepted operation is unresolved. Resume it and record its server result before deploying another mission.";
  if (["tactical_authority_unavailable","victory_authority_required","tactical_client_upgrade_required"].includes(code)) return "This run needs supported online combat. Refresh and resume its accepted server encounter; local victories cannot be rewarded.";
  if (["run_not_active","run_already_committed"].includes(code)) return "Reload canonical operation state and its recorded receipt. Start a fresh deployment after the prior result is confirmed.";
  const safeCode=/^[a-z][a-z0-9_]{0,63}$/.test(code)?code:"request_failed";
  return `Result not confirmed (${safeCode}). Refresh state or retry the same accepted run before deploying again.`;
}
