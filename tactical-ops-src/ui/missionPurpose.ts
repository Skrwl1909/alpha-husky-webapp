import type { BattleState } from "../combat/types";
import { holdControlled, recoverSignalOpen } from "../combat/missionRules";
import { getMissionDef, missionForContext, missionBattleRules, type MissionDef } from "../data/operations";
import type { FieldContext } from "../data/fieldOps";
import type { FieldResult } from "../data/fieldOps";
import type { FieldOpsProgression } from "../host/foundationProgression";

/** Presentation of canonical rules, never a source of new rewards or saved progress. */
export function missionGoal(m: MissionDef): string {
  const o = m.objective;
  if (o?.type === "RECOVER" && o.squadExtractionRadius!=null) return "Bring all three allies within 2 orthogonal cells, then RECOVER on an even round by round 6.";
  if (o?.type === "HOLD" && o.relayRoute) return "Occupy north, east, then south at consecutive round changes. Moving between checkpoints is allowed; missing one resets to north. Finish by round 6.";
  if (o?.type === "HOLD") return o.holderRadius === 0 ? `Keep an ally ON the relay tile for ${o.duration} consecutive round changes by round 6. Enemies within 1 orthogonal cell reset control.` : `Control the relay for ${o.duration} consecutive round changes. Enemies inside the zone reset control.`;
  if (o?.type === "SURVIVE") return `Keep every deployed squad member alive through ${o.duration} rounds. Eliminating enemies does not end the timer.`;
  if (o?.type === "INTERCEPT") return "Defeat the courier before it reaches the marked exit. Other hostiles do not need to be eliminated.";
  if (m.objectiveType === "RECOVER") return "Move within RECOVER range (normally 1 cell), then use RECOVER before spending that ally\'s action."
  if (m.objectiveType === "BOSS") return "Defeat the marked commander. Other enemies are not the objective.";
  return "Eliminate every hostile.";
}
export function missionFailure(m: MissionDef): string {
  const failure = m.objectiveType === "INTERCEPT" ? "The courier reaches the exit or the entire squad falls."
    : m.objectiveType === "SURVIVE" ? "Any deployed squad member falls." : "The entire squad falls.";
  return failure + (m.directive?.maxRounds ? ` Complete by the end of round ${m.directive.maxRounds}; round ${m.directive.maxRounds + 1} starts with mission failure.` : "");
}
export interface MissionRewardTruth {
  clear: "AVAILABLE" | "SECURED" | "NOT_APPLICABLE" | "UNKNOWN";
  challenge: "AVAILABLE" | "SECURED" | "NOT_APPLICABLE" | "UNKNOWN";
  commander: "ACTIVE" | "CERTIFIED" | "UNKNOWN";
  copy: string;
}
export function missionRewardTruth(m: MissionDef, field: FieldOpsProgression | undefined): MissionRewardTruth {
  if (m.objective?.type === "RECOVER" && m.objective.squadExtractionRadius!=null) return {clear:"NOT_APPLICABLE",challenge:"NOT_APPLICABLE",commander:"CERTIFIED",copy:"Optional Veteran practice. No currency or progression rewards."};
  if (m.objective?.type === 'HOLD' && m.objective.holderRadius === 0) return { clear:'NOT_APPLICABLE', challenge:'NOT_APPLICABLE', commander:'CERTIFIED', copy:'Optional unlocked challenge. No currency, Commander points, growth points, Pack Mastery or regional rewards.' };
  if (m.activity !== "FIELD_OP") return { clear:"NOT_APPLICABLE", challenge:"NOT_APPLICABLE", commander:"UNKNOWN", copy:"Campaign progress is recorded by the server." };
  if (!field?.board || !field.commander) return { clear:"UNKNOWN", challenge:"UNKNOWN", commander:"UNKNOWN", copy:"Refresh to check this rotation's confirmed rewards." };
  const row = field.records?.[m.missionId];
  const clear = row?.lastClearCycle === field.board.cycleId ? "SECURED" : "AVAILABLE";
  const challenge = !m.challenge ? "NOT_APPLICABLE" : row?.lastChallengeCycle === field.board.cycleId ? "SECURED" : "AVAILABLE";
  const commander = field.commander.rank >= 3 || field.commander.certificationComplete ? "CERTIFIED" : "ACTIVE";
  const copy = commander === "CERTIFIED" ? (field.veteranProgressionAvailable ? (field.commander.rank >= 4 ? "Rank 4 Veteran earned. Base Commander points no longer raise your rank; eligible Advanced rotations can still advance companion Veteran mastery." : "Rank 3 certified. Rank 4 Veteran career advances through eligible Advanced Field Ops across rotations, not base Commander points.") : "Rank 3 certified. No further Commander rank is currently available.")
    : clear === "SECURED" && challenge !== "AVAILABLE" ? "Clear and challenge secured for this rotation."
    : clear === "SECURED" ? "Clear secured; the optional challenge may still award progress."
    : "A first clear and an unfinished challenge can award progress if confirmed by the server.";
  return { clear, challenge, commander, copy };
}
export function missionLiveProgress(b: BattleState): string {
  const o = b.objective;
  if (o?.type === "RECOVER" && o.squadExtractionRadius!=null) return "PACK EXTRACTION · REGROUP ALL 3";
  if (o?.type === "HOLD" && o.relayRoute) return `CROSSLINK ${o.progress}/${o.duration}`;
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
  if (o?.type === "RECOVER" && o.squadExtractionRadius!=null) return recoverGuidance(b);
  if (o?.type === "HOLD" && o.relayRoute) return { status: `RELAY ${Math.min(o.progress + 1, 3)} · ${["NORTH", "EAST", "SOUTH"][Math.min(o.progress, 2)]}`, action: `Occupy relay ${Math.min(o.progress + 1, 3)} at ${o.terminal!.c + 1},${o.terminal!.r + 1} and clear adjacent enemies before the next round change.`, progress:o.progress, total:o.duration };
  if (o?.type === "HOLD") {
    if (holdControlled(b)) return { status:"CONTROLLED", action:"Keep an ally in the relay zone through the next round change.", progress:o.progress, total:o.duration };
    const inZone = b.units.filter(u => !u.defeated && Math.abs(u.c-o.terminal.c)+Math.abs(u.r-o.terminal.r) <= (o.radius ?? 0));
    if (inZone.some(u => u.team === "enemy")) return { status:"CONTESTED", action:"Remove enemies from the marked relay zone.", progress:o.progress, total:o.duration };
    return { status:"OCCUPY RELAY", action:o.holderRadius === 0 ? "Move a living ally ON the relay tile; adjacent allies do not hold it." : "Move a living ally into the marked HOLD zone.", progress:o.progress, total:o.duration };
  }
  if (o?.type === "SURVIVE") return { status:"KEEP SQUAD ALIVE", action:`Hold formation until round ${o.duration + 1} begins.`, progress:o.progress, total:o.duration };
  if (o?.type === "INTERCEPT") return { status:"STOP COURIER", action:`Defeat the courier before exit column ${o.exit.c + 1}, row ${o.exit.r + 1}. Block its route or focus attacks; patrol kills are optional.`, progress:null, total:null };
  if (o?.type === "RECOVER") return recoverGuidance(b);
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
  if (field?.activeMissionRun && getMissionDef(field.activeMissionRun.missionId)) return { missionId:field.activeMissionRun.missionId, reason:"Resume your accepted mission under its original conditions; the battle restarts at round 1." };
  if (!board?.activeMissionIds?.length) return { missionId:null, reason:"Refresh the War Table to see the next mission." };
  const nextClear = board.activeMissionIds.find(id => field?.records?.[id]?.lastClearCycle !== board.cycleId);
  if (nextClear) return { missionId:nextClear, reason:"Secure another Field Op to advance the current front." };
  const nextChallenge = board.activeMissionIds.find(id => {
    const m = getMissionDef(id);
    return m?.challenge && field?.records?.[id]?.lastChallengeCycle !== board.cycleId;
  });
  if (nextChallenge) return { missionId:nextChallenge, reason:"All Field Ops secured. An optional challenge is still open." };
  return { missionId:currentMissionId && board.activeMissionIds.includes(currentMissionId) ? currentMissionId : board.activeMissionIds[0], reason:"Front secured. Replay to practice tactics or return after the next rotation; no new Commander reward is promised." };
}
export function deriveMissionPresentation(m: MissionDef, field?: FieldOpsProgression, acceptedRun?: { missionId: string; fieldContext?: Partial<FieldContext> & { reportVersion: number }; rulesContract?: {missionRevision:number} | null } | null, lastResult?: FieldResult | null, previewContext?: Partial<FieldContext>): MissionPurposeView {
  const accepted = acceptedRun?.missionId === m.missionId;
  const context = accepted ? acceptedRun?.fieldContext : previewContext || (field?.board ? { reportVersion:field.board.reportVersion || 2 } : undefined);
  const base = context ? missionForContext(m, context, accepted ? acceptedRun?.rulesContract?.missionRevision : undefined) : m;
  const resolved = { ...base, directive: missionBattleRules(base, false, context).directive || undefined };
  const oldCycle = accepted && acceptedRun?.fieldContext?.cycleId != null && field?.board && acceptedRun.fieldContext.cycleId !== field.board.cycleId;
  if (context?.veteranChallenge) return {
    missionId:m.missionId,objectiveText:missionGoal(resolved),failConditionText:missionFailure(resolved),
    tacticalThreat:'Move the whole squad. A lone runner cannot extract; protect slower allies until an even-round window.',
    nextConsequence:'The accepted optional practice result is recorded. No currency, Commander or Pack Mastery awards.',
    rewardEligibility:missionRewardTruth(resolved,field),rewardClearText:'OPTIONAL VETERAN PRACTICE',rewardChallengeText:'NO PROGRESSION REWARD',
    nextAction:{missionId:m.missionId,reason:'Return to an eligible Advanced Field Op for progression.'},source:accepted?'ACCEPTED_RUN_AND_BACKEND_STATE':'MISSION_DEFINITION_ONLY'};
  if (context?.masteryChallenge) return {
    missionId: m.missionId, objectiveText: missionGoal(resolved), failConditionText: missionFailure(resolved),
    tacticalThreat: context.lockdownPlan === 'crosslink' ? 'Clear the next relay and move or hand off the holder before each round change. Support recharges normally.' : 'One ally must anchor the exact tile. Clear adjacent contesters while support recharges slowly; evading off the relay resets control.',
    nextConsequence: 'Relay Mastery stays permanently unlocked. A confirmed challenge result is saved without base Field Op or progression rewards.',
    rewardEligibility: missionRewardTruth(resolved,field), rewardClearText:'OPTIONAL TACTICAL CHALLENGE', rewardChallengeText:'NO PROGRESSION REWARD',
    nextAction:{missionId:m.missionId,reason:'Try another holder or squad after recording the result.'},
    source:accepted?'ACCEPTED_RUN_AND_BACKEND_STATE':'MISSION_DEFINITION_ONLY' };
  const reward: MissionRewardTruth = oldCycle ? { clear:"UNKNOWN", challenge:"UNKNOWN", commander:(field?.commander?.rank || 0) >= 3 ? "CERTIFIED" : "UNKNOWN", copy:"Accepted run from an earlier rotation. Reward eligibility comes from its receipt; this run does not secure the current rotation." } : missionRewardTruth(resolved, field);
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
    objectiveText:missionGoal(resolved) + (resolved.objectiveType === "RECOVER" && resolved.directive?.recoverEveryRounds ? ` Signal opens on rounds divisible by ${resolved.directive.recoverEveryRounds} (${resolved.directive.recoverEveryRounds}, ${resolved.directive.recoverEveryRounds * 2}, …).` : ""),
    failConditionText:missionFailure(resolved),
    tacticalThreat:resolved.objective?.type==="INTERCEPT" && resolved.objective.screenedEscape ? "Screened courier. TARGET LOCK follows its marked ally (range 2–4). Break range, close in, interrupt or protect." : resolved.directive?.copy || resolved.squadHint || "Use positioning, skills and enemy ranges to control the encounter.",
    nextConsequence:consequence,
    rewardEligibility:reward,
    rewardClearText:clearText,
    rewardChallengeText:challengeText,
    nextAction:nextFieldMission(field, resolved.missionId),
    source:field?.board ? "ACCEPTED_RUN_AND_BACKEND_STATE" : "MISSION_DEFINITION_ONLY"
  };
}
export function recordedResultMeaning(result: FieldResult): string {
  if (result.masteryChallenge) return result.victory ? "RELAY LOCKDOWN RECORDED. RELAY MASTERY COMPLETE · 1/1." : "LOCKDOWN ATTEMPT RECORDED. YOUR PERMANENT ACCESS IS PRESERVED.";
  if (!result.victory) return "MISSION FAILED. No clear recorded. Regroup and retry.";
  if (result.veteranCareer) return result.veteranCareer.unlocked ? "RANK 4 · VETERAN. PACK EXTRACTION UNLOCKED." : `VETERAN CAREER ${result.veteranCareer.before} → ${result.veteranCareer.after}/12. ${result.veteranCareer.reason.replaceAll("_"," ")}.`;
  if (result.rankAfter >= 3) return `COMMANDER RANK ${result.rankAfter} · ${result.progressEarned} POINTS RECORDED. ${result.veteranCareer ? "VETERAN CAREER PROGRESS RECORDED." : "NO ADDITIONAL RANK CONFIRMED BY THIS RECEIPT."}`;
  if (result.progressEarned > 0) return "COMMANDER PROGRESS RECORDED. YOUR NEXT CERTIFICATION MILESTONE IS CLOSER.";
  return "NO NEW COMMANDER PROGRESS ON THIS CLEAR. CHECK UNFINISHED CHALLENGES OR REPLAY FOR PRACTICE.";
}

/** Same orthogonal distance, range and action requirements as canRecover. */
export function recoverGuidance(b: BattleState): { status: string; action: string; progress: null; total: null } {
  const o = b.objective;
  if (o?.type !== "RECOVER") return { status:"NO RELAY", action:"", progress:null, total:null };
  if (o.completed) return { status:"OBJECTIVE COMPLETE", action:"Signal recovered.", progress:null, total:null };
  const every = b.directive?.recoverEveryRounds || 1;
  const next = Math.ceil(b.round / every) * every;
  const open = recoverSignalOpen(b);
  const actor = b.units.find(u => u.id === b.activeId);
  const ally = actor?.team === "ally" && !actor.defeated;
  const range = ally ? actor.recoverRange || 1 : 1;
  const distance = ally ? Math.abs(actor.c-o.terminal.c)+Math.abs(actor.r-o.terminal.r) : null;
  const timing = open ? `Signal open for round ${b.round}.` : `Opens round ${next}; every ${every} rounds.`;
  const present = o.squadExtractionRadius==null ? null : b.units.filter(u=>u.team==="ally"&&!u.defeated&&Math.abs(u.c-o.terminal.c)+Math.abs(u.r-o.terminal.r)<=o.squadExtractionRadius!).length;
  if (present!=null && present<3) return {status:`PACK ${present}/3 AT RELAY`,action:`Move every living squad member within 2 orthogonal cells. ${timing}`,progress:null,total:null};
  const position = distance === null ? "Wait for a living ally's turn." : `Relay distance ${distance}; range ${range} (orthogonal). ${distance > range ? actor!.hasMoved ? "Move spent; use support or SKIP, then approach next turn." : "MOVE closer, then RECOVER." : actor!.hasActed ? "Action spent; wait for this ally's next turn." : "Use RECOVER before acting."}`;
  return { status:open ? "SIGNAL OPEN" : `OPENS ROUND ${next}`, action:`${timing} ${position}`, progress:null, total:null };
}
