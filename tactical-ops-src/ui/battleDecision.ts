import { chapterNextMission } from "../data/campaignChapter";
import type { FieldContext, FieldResult } from "../data/fieldOps";
import { missionContract } from "../data/fieldContracts";
import { DEAD_RELAY, getMissionDef, g2HoldRevisionForRequest, missionBattleRules, missionForContext, surviveRevisionForRequest } from "../data/operations";
import { TACTICAL_VNEXT_RULESET } from "../combat/intentContract";
import { isRecoverAuthorityRun, type CampaignResult, type ChapterResult, type FoundationProgressionState } from "../host/foundationProgression";
import { missionGoal } from "./missionPurpose";
import { commandPurpose, fieldResultNext, reachRendLoadoutMission, type PurposeAction } from "./returnPurpose";

type Receipt = FieldResult | CampaignResult | ChapterResult;
export type BattleDecision = {
  action: PurposeAction | null;
  label: string;
  detail: string;
  retry?: boolean;
  equipMission?: string;
  reviewAction?: PurposeAction;
  refresh?: boolean;
};

const actionFor = (missionId: string, options: Partial<PurposeAction> = {}): PurposeAction =>
  ({ missionId, title: "", reason: "", tier: "standard", resume: false, ...options });

export function battleDecision(p: FoundationProgressionState | null, receipt: Receipt, pending = false): BattleDecision {
  const field = p?.fieldOps;
  const board = field?.board;
  const live = Boolean(board && board.nextRotationAt * 1000 > Date.now());
  const fallback: BattleDecision = { action: null, label: live ? "WAR TABLE" : "REFRESH WAR TABLE",
    detail: live ? "No eligible next operation confirmed." : "Refresh to check current operations.", refresh: !live };
  if (pending || !p?.completed) return fallback;
  const command = commandPurpose(p).primary;
  const saved = p.chapterActiveMission || field?.activeMissionRun || Object.values(p.operations || {}).find(op => op.activeMissionRun)?.activeMissionRun;
  if (saved || p.tacticalChapter?.activeRunId) {
    if (!command?.resume || command.missionId !== saved?.missionId) return fallback;
    return { action: command, label: getMissionDef(command.missionId)?.activity === "FIELD_OP" && !command.chapter ? "RESUME FIELD OP" : "RESUME ACCEPTED RUN",
      detail: isRecoverAuthorityRun(saved.runId) ? "Resume from your last confirmed action." : "Resume from round 1 with your locked squad and mission setup." };
  }

  const chapter = "chapterId" in receipt;
  const mission = getMissionDef(receipt.missionId);
  const regular = mission?.activity === "FIELD_OP";
  const mastery = "masteryChallenge" in receipt && receipt.masteryChallenge;
  const extraction = "veteranChallenge" in receipt && receipt.veteranChallenge;
  const chapterMission = p.tacticalChapter?.status === "ACTIVE" && p.tacticalChapter.doctrine === "RECON" && chapterNextMission(p.tacticalChapter);
  const campaignMission = DEAD_RELAY.orderedMissionIds.find(id => p.operations?.[DEAD_RELAY.operationId]?.missions[id] === "available");
  const regularRetry = live && board?.activeMissionIds.includes(receipt.missionId);
  const retry = !receipt.victory && (chapter ? chapterMission === receipt.missionId
    : mastery ? field?.masteryPath?.unlockedChallenge === mastery
    : extraction ? field?.veteranProgressionAvailable === true && (field.commander?.rank || 0) >= 4
    : regular ? regularRetry
    : p.operations?.[mission?.operationId || ""]?.missions[receipt.missionId] === "available"
      || p.operations?.[mission?.operationId || ""]?.missions[receipt.missionId] === "cleared");
  const next = retry ? actionFor(receipt.missionId, {
    chapter, masteryChallenge: mastery || undefined,
    veteranChallenge: extraction || undefined,
    lockdownPlan: "lockdownPlan" in receipt ? receipt.lockdownPlan : undefined,
    tier: "directiveTier" in receipt && receipt.directiveTier === "advanced" ? "advanced" : "standard",
  }) : chapter && chapterMission ? actionFor(chapterMission, { chapter: true })
    : !regular && campaignMission ? actionFor(campaignMission) : fieldResultNext(p);
  const target = getMissionDef(next?.missionId);
  if (!next || !target?.executable) return !receipt.victory && regular && !retry
    ? { ...fallback, detail: "This Field Op is unavailable for retry. " + fallback.detail } : fallback;
  if (target.activity === "FIELD_OP" && !next.chapter && !next.masteryChallenge && !next.veteranChallenge &&
      (!live || !board?.activeMissionIds.includes(target.missionId))) return fallback;
  if (next.tier === "advanced" && !next.masteryChallenge && !next.veteranChallenge &&
      (!field?.commander?.unlockedDirectiveTiers?.includes("advanced") || board?.reportVersion !== 3)) return fallback;

  const context: Partial<FieldContext> | undefined = next.veteranChallenge ? {reportVersion:6, veteranChallenge:next.veteranChallenge}
    : next.masteryChallenge ? {reportVersion:next.lockdownPlan ? 5 : 4, masteryChallenge:next.masteryChallenge, lockdownPlan:next.lockdownPlan}
    : target.activity === "FIELD_OP" ? { reportVersion:next.chapter ? 3 : board?.reportVersion || 2,
      directiveTier:next.tier, directiveSet:board?.directiveSet, pressure:field?.region?.pressure ?? 2 } : undefined;
  const ruleset = p.vnextStartAvailable ? TACTICAL_VNEXT_RULESET : undefined;
  const revision = target.missionId === "field-relay-intercept" && ruleset && field?.interceptRevisionAvailable === 2 ? 2
    : g2HoldRevisionForRequest(target.missionId, ruleset, p.deadRelayHoldRevisionAvailable)
    ?? surviveRevisionForRequest(target.missionId, ruleset, board);
  const intel = p.campaignIntel?.["dead-relay"];
  const resolved = missionForContext(target, context, revision, intel && { version: 1, ...intel });
  const rules = missionBattleRules(resolved, false, context);
  const objective = missionGoal(resolved);
  const condition = rules.directive?.maxRounds && !next.masteryChallenge && !next.veteranChallenge ? ` Finish by round ${rules.directive.maxRounds}.`
    : rules.directive?.recoverEveryRounds && !next.veteranChallenge ? ` Signal opens every ${rules.directive.recoverEveryRounds} rounds.` : "";
  const practice = next.title === "PRACTICE WITH YOUR SQUAD" || next.title === "REVIEW FIELD CONDITIONS" ||
    next.title === "RELAY LOCKDOWN · COMPLETED" || next.veteranChallenge || Boolean(next.masteryChallenge && field?.masteryPath?.firstLockdownClear);
  const contract = next.missionId && missionContract(next.missionId);
  const isContract = Boolean(contract && next.title === contract.name);
  const detail = `${isContract ? contract!.objective : objective + condition}${practice ? next.masteryChallenge || next.veteranChallenge ? " Optional practice. No progression reward." : " Optional practice. No new rotation progress confirmed." : ""}`;
  const equipMission = receipt.victory && "contractAward" in receipt ? reachRendLoadoutMission(p, receipt) : undefined;
  const reviewAction = receipt.victory && mastery && field?.masteryPath?.unlockedChallenge === mastery
    ? actionFor(receipt.missionId, { tier: "advanced", masteryChallenge: mastery, lockdownPlan: "lockdownPlan" in receipt ? receipt.lockdownPlan : undefined })
    : receipt.victory && extraction && field?.veteranProgressionAvailable && (field.commander?.rank || 0) >= 4
      ? actionFor(receipt.missionId, { tier: "advanced", veteranChallenge: extraction })
      : target.squadCap > 1 ? next : undefined;
  return {
    action: next, retry, equipMission, reviewAction,
    label: retry ? "RETRY MISSION" : practice ? `PRACTICE · ${target.name}` : isContract ? `NEXT: ${contract!.name}`
      : `${next.tier === "advanced" ? "ADVANCED" : "NEXT"}: ${target.name}`,
    detail: !receipt.victory && !retry ? `This attempt is unavailable for retry. ${detail}`
      : reviewAction && reviewAction !== next ? `${detail} Or change your squad for ${mastery ? "Lockdown" : "Pack Extraction"} practice.` : detail,
  };
}

export function objectiveDefeat(reason: string | undefined, objective: string, squadStanding: number, squadDeployed: number): string {
  if (reason === "TARGET_ESCAPED") return "The signal courier reached its exit.";
  if (reason === "DEADLINE") return "The completion window closed before you secured the objective.";
  if (objective === "SURVIVE" && squadStanding < squadDeployed) return "A squad member fell. The full squad had to survive.";
  if (squadStanding === 0) return "All allies fell before the objective was secured.";
  return "The objective was not secured.";
}
