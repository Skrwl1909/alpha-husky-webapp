import type { BattleState } from "../combat/types";
import { holdControlled, recoverSignalOpen } from "../combat/missionRules";
import { getMissionDef, missionForContext, type MissionDef } from "../data/operations";
import type { FieldResult } from "../data/fieldOps";
import type { FieldOpsProgression } from "../host/foundationProgression";

/** Presentation of canonical rules, never a source of new rewards or saved progress. */
export function missionGoal(m: MissionDef): string {
  const o = m.objective;
  if (o?.type === "HOLD") return `Control the relay for ${o.duration} consecutive round changes. Enemies inside the zone reset control.`;
  if (o?.type === "SURVIVE") return `Keep every deployed squad member alive through ${o.duration} rounds. Eliminating enemies does not end the timer.`;
  if (o?.type === "INTERCEPT") return "Stop the courier before it reaches the exit.";
  if (m.objectiveType === "RECOVER") return "Reach the relay and activate RECOVER when the signal is open.";
  if (m.objectiveType === "BOSS") return "Defeat the marked commander. Other enemies are not the objective.";
  return "Eliminate every hostile.";
}
export function missionFailure(m: MissionDef): string {
  if (m.objectiveType === "INTERCEPT") return "The courier escapes or the entire squad falls.";
  if (m.objectiveType === "SURVIVE") return "Any deployed squad member falls.";
  if (m.directive?.maxRounds) return `The mission deadline (round ${m.directive.maxRounds}) expires or the squad falls.`;
  return "The entire squad falls; mission-specific deadlines also apply where shown.";
}
export interface MissionRewardTruth {
  clear: "AVAILABLE" | "SECURED" | "NOT_APPLICABLE" | "UNKNOWN";
  challenge: "AVAILABLE" | "SECURED" | "NOT_APPLICABLE" | "UNKNOWN";
  commander: "ACTIVE" | "CERTIFIED" | "UNKNOWN";
  copy: string;
}
export function missionRewardTruth(m: MissionDef, field: FieldOpsProgression | undefined): MissionRewardTruth {
  if (m.activity !== "FIELD_OP") return { clear:"NOT_APPLICABLE", challenge:"NOT_APPLICABLE", commander:"UNKNOWN", copy:"Campaign progress is recorded by the server." };
  if (!field?.board || !field.commander) return { clear:"UNKNOWN", challenge:"UNKNOWN", commander:"UNKNOWN", copy:"Refresh to check this rotation's confirmed rewards." };
  const row = field.records?.[m.missionId];
  const clear = row?.lastClearCycle === field.board.cycleId ? "SECURED" : "AVAILABLE";
  const challenge = !m.challenge ? "NOT_APPLICABLE" : row?.lastChallengeCycle === field.board.cycleId ? "SECURED" : "AVAILABLE";
  const commander = field.commander.rank >= 3 || field.commander.certificationComplete ? "CERTIFIED" : "ACTIVE";
  const copy = commander === "CERTIFIED" ? "Rank 3 complete. Commander points can still be recorded, but there is no next Commander rank."
    : clear === "SECURED" && challenge !== "AVAILABLE" ? "Clear and challenge secured for this rotation."
    : clear === "SECURED" ? "Clear secured; the optional challenge may still award progress."
    : "A first clear and an unfinished challenge can award progress if confirmed by the server.";
  return { clear, challenge, commander, copy };
}
export function missionLiveProgress(b: BattleState): string {
  const o = b.objective;
  if (o?.type === "HOLD") return `HOLD ${o.progress}/${o.duration}`;
  if (o?.type === "SURVIVE") return `SURVIVE ${o.progress}/${o.duration}`;
  if (o?.type === "INTERCEPT") {
    const courier = b.units.find(u => u.id === o.targetId);
    return courier && !courier.defeated ? "STOP COURIER BEFORE EXIT" : "COURIER STOPPED";
  }
  if (o?.type === "RECOVER") return o.completed ? "SIGNAL RECOVERED" : recoverSignalOpen(b) ? "SIGNAL OPEN" : "SIGNAL JAMMED";
  if (o?.type === "BOSS") return b.units.some(u => u.id === o.targetId && !u.defeated) ? "DEFEAT COMMANDER" : "COMMANDER DEFEATED";
  return `${b.units.filter(u => u.team === "enemy" && !u.defeated).length} HOSTILES REMAIN`;
}
export function objectiveDirective(b: BattleState): { status: string; action: string; progress: number | null; total: number | null } {
  const o = b.objective;
  if (o?.type === "HOLD") {
    if (holdControlled(b)) return { status:"CONTROLLED", action:"Keep an ally in the relay zone through the next round change.", progress:o.progress, total:o.duration };
    const inZone = b.units.filter(u => !u.defeated && Math.abs(u.c-o.terminal.c)+Math.abs(u.r-o.terminal.r) <= (o.radius ?? 0));
    if (inZone.some(u => u.team === "enemy")) return { status:"CONTESTED", action:"Remove enemies from the marked relay zone.", progress:o.progress, total:o.duration };
    return { status:"OCCUPY RELAY", action:"Move a living ally into the marked HOLD zone.", progress:o.progress, total:o.duration };
  }
  if (o?.type === "SURVIVE") return { status:"KEEP SQUAD ALIVE", action:`Hold formation until round ${o.duration + 1} begins.`, progress:o.progress, total:o.duration };
  if (o?.type === "INTERCEPT") return { status:"STOP COURIER", action:"Block, slow or eliminate the courier before the exit.", progress:null, total:null };
  if (o?.type === "RECOVER") return { status:recoverSignalOpen(b) ? "SIGNAL OPEN" : "SIGNAL JAMMED", action:recoverSignalOpen(b) ? "Get within range and use RECOVER." : "Prepare position; wait for the signal window.", progress:null, total:null };
  if (o?.type === "BOSS") return { status:"DEFEAT COMMANDER", action:"Defeat the marked commander. Ignore remaining patrol if safe.", progress:null, total:null };
  return { status:"CLEAR HOSTILES", action:"Eliminate the hostile squad.", progress:null, total:null };
}
export type MissionPurposeView = {
  missionId: string;
  objectiveText: string;
  failConditionText: string;
  tacticalThreat: string;
  nextConsequence: string;
  rewardEligibility: MissionRewardTruth;
  rewardClearText: string;
  rewardChallengeText: string;
  nextAction: { missionId: string | null; reason: string };
  source: "ACCEPTED_RUN_AND_BACKEND_STATE" | "MISSION_DEFINITION_ONLY";
};
export function nextFieldMission(field: FieldOpsProgression | undefined, currentMissionId?: string): { missionId: string | null; reason: string } {
  const board = field?.board;
  if (!board?.activeMissionIds?.length) return { missionId:null, reason:"Refresh the War Table to see the next mission." };
  const pending = field?.activeMissionRun;
  if (pending && board.activeMissionIds.includes(pending.missionId)) return { missionId:pending.missionId, reason:"Resume your accepted mission under its original conditions." };
  const nextClear = board.activeMissionIds.find(id => field?.records?.[id]?.lastClearCycle !== board.cycleId);
  if (nextClear) return { missionId:nextClear, reason:"Secure another Field Op to advance the current front." };
  const nextChallenge = board.activeMissionIds.find(id => {
    const m = getMissionDef(id);
    return m?.challenge && field?.records?.[id]?.lastChallengeCycle !== board.cycleId;
  });
  if (nextChallenge) return { missionId:nextChallenge, reason:"All Field Ops secured. An optional challenge is still open." };
  return { missionId:currentMissionId && board.activeMissionIds.includes(currentMissionId) ? currentMissionId : board.activeMissionIds[0], reason:"Front secured. Replay to practice tactics or return after the next rotation; no new Commander reward is promised." };
}
export function deriveMissionPresentation(m: MissionDef, field?: FieldOpsProgression, acceptedRun?: { missionId: string; fieldContext?: { reportVersion: number } } | null, lastResult?: FieldResult | null): MissionPurposeView {
  const accepted = acceptedRun?.missionId === m.missionId;
  const reportVersion = accepted ? acceptedRun?.fieldContext?.reportVersion : field?.board?.reportVersion;
  const resolved = reportVersion ? missionForContext(m, { reportVersion }) : m;
  const reward = missionRewardTruth(resolved, field);
  const clearText = reward.clear === "SECURED" ? "CLEAR SECURED" : reward.clear === "UNKNOWN" ? "STATUS UNAVAILABLE" :
    reward.clear === "NOT_APPLICABLE" ? "CAMPAIGN RECORD" : reward.commander === "CERTIFIED" ? "FIRST CLEAR AVAILABLE" : "+2 COMMANDER IF ELIGIBLE";
  const challengeText = reward.challenge === "SECURED" ? "CHALLENGE SECURED" : reward.challenge === "UNKNOWN" ? "STATUS UNAVAILABLE" :
    reward.challenge === "NOT_APPLICABLE" ? "NO FIELD CHALLENGE" : reward.commander === "CERTIFIED" ? "CHALLENGE OPEN" : "+1 COMMANDER IF ELIGIBLE";
  const consequence = resolved.activity === "FIELD_OP"
    ? lastResult?.missionId === resolved.missionId && lastResult.regionalApplied
      ? "Latest recorded result changed Signal Pressure. Relevant reinforcements use the server-confirmed new pressure."
      : "A first clear can secure this operation in the current rotation. Signal Pressure changes only if recorded by the server."
    : resolved.resultsCopy;
  return {
    missionId:resolved.missionId,
    objectiveText:missionGoal(resolved),
    failConditionText:missionFailure(resolved),
    tacticalThreat:resolved.directive?.copy || resolved.squadHint || "Use positioning, skills and enemy ranges to control the encounter.",
    nextConsequence:consequence,
    rewardEligibility:reward,
    rewardClearText:clearText,
    rewardChallengeText:challengeText,
    nextAction:nextFieldMission(field, resolved.missionId),
    source:field?.board ? "ACCEPTED_RUN_AND_BACKEND_STATE" : "MISSION_DEFINITION_ONLY"
  };
}
export function recordedResultMeaning(result: FieldResult): string {
  if (!result.victory) return "MISSION FAILED. No clear recorded. Regroup and retry.";
  if (result.rankAfter >= 3) return `COMMANDER CERTIFIED · ${result.progressEarned} POINTS RECORDED IN HISTORY. NO HIGHER COMMANDER RANK.`;
  if (result.progressEarned > 0) return "COMMANDER PROGRESS RECORDED. YOUR NEXT CERTIFICATION MILESTONE IS CLOSER.";
  return "NO NEW COMMANDER PROGRESS ON THIS CLEAR. CHECK UNFINISHED CHALLENGES OR REPLAY FOR PRACTICE.";
}
