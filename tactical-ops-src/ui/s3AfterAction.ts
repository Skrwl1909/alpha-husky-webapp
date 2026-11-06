import type { FieldResult } from "../data/fieldOps";
import type { FoundationProgressionState, CampaignResult } from "../host/foundationProgression";
import { getMissionDef } from "../data/operations";
import { commandPurpose } from "./returnPurpose";
import { nextFieldMission } from "./missionPurpose";

/** Read-only S3 consequence proof. Server receipt, never player-side reward calculation. */
export type AfterActionProof = { label: string; detail: string; source: "SERVER_RECEIPT" };

/** A missing receipt must never be interpreted as a confirmed world change. */
export function confirmedConsequence(field: FieldResult | null, campaign: CampaignResult | null, progression: FoundationProgressionState | null): AfterActionProof | null {
  if (field) {
    if (field.regionalApplied && field.pressureBefore !== field.pressureAfter) {
      const delay = field.pressureAfter < 2 ? "New relevant Field Ops use a one-round reinforcement delay; already accepted runs keep their original timing." : "Reinforcements remain on schedule.";
      return { label: "SIGNAL PRESSURE CHANGED", detail: `Pressure ${field.pressureBefore} → ${field.pressureAfter}. ${delay}`, source: "SERVER_RECEIPT" };
    }
    if (field.advancedUnlocked) return { label: "ADVANCED DIRECTIVES UNLOCKED", detail: "A new tactical challenge is available at the War Table.", source: "SERVER_RECEIPT" };
    if (field.frontJustSecured) return { label: "FRONT SECURED", detail: "The current rotation's front is recorded as secured.", source: "SERVER_RECEIPT" };
    if (field.rankAfter > field.rankBefore) return { label: "COMMANDER RANK ADVANCED", detail: `Rank ${field.rankBefore} → ${field.rankAfter}; check new deployment options at the War Table.`, source: "SERVER_RECEIPT" };
    if (field.masteryChanges?.some(x => x.beforeStage < x.stage)) {
      const x = field.masteryChanges.find(x => x.beforeStage < x.stage)!;
      return { label: "PACK MASTERY UNLOCKED", detail: `${x.unitId}: stage ${x.beforeStage} → ${x.stage}. Check the saved specialization.`, source: "SERVER_RECEIPT" };
    }
    return null;
  }
  if (campaign?.victory && campaign.missionId === "dead-relay-courier" && progression?.campaignIntel?.["dead-relay"]?.courierTraceAcquired && campaign.intelEarned) {
    return { label: "COURIER TRACE RECORDED", detail: progression.vnextStartAvailable && progression.deadRelayHoldRevisionAvailable === 2
      ? "Next Hold: HOUND round 3. South-east entry."
      : "Next Hold: HOUND delayed by one round.", source: "SERVER_RECEIPT" };
  }
  return null;
}
export type ReturnAction = { title: string; reason: string; missionId: string | null };
export function confirmedReturnAction(field: FieldResult | null, campaign: CampaignResult | null, progression: FoundationProgressionState | null): ReturnAction | null {
  if (!progression || (!field && !campaign)) return null;
  const run = field || campaign;
  if (run && !run.victory) return { title: "TRY A DIFFERENT TACTIC", reason: "Review the mission objective and change your squad or route. No clear reward was recorded.", missionId: run.missionId };
  if (field) {
    const next = commandPurpose(progression).primary || nextFieldMission(progression.fieldOps, field.missionId);
    const mission = getMissionDef(next.missionId);
    return { title: mission?.name || "WAR TABLE", reason: next.reason, missionId: mission?.missionId || null };
  }
  if (campaign) {
    const op = progression.operations?.["dead-relay"];
    const nextId = ["dead-relay-courier","dead-relay-hold","dead-relay-guardian"].find(id => op?.missions[id] === "available");
    return nextId ? { title: getMissionDef(nextId)?.name || "NEXT CAMPAIGN MISSION",
      reason: nextId === "dead-relay-hold" ? "Defend the relay to open the route to its Guardian."
        : nextId === "dead-relay-guardian" ? "Defeat the Guardian to secure the Dead Relay."
        : "Intercept the courier to open the relay route.", missionId: nextId }
      : { title: "WAR TABLE", reason: "Campaign progress is recorded. Explore available Field Ops or replay to practice; no additional reward is promised.", missionId: null };
  }
  return null;
}

/** A receipt belongs to a battle only when both stable identifiers match. */
export function matchingAfterActionReceipt<T extends { runId: string; missionId: string }>(receipt: T | null, runId: string | null, missionId: string | null): T | null {
  return receipt && runId && missionId && receipt.runId === runId && receipt.missionId === missionId ? receipt : null;
}
