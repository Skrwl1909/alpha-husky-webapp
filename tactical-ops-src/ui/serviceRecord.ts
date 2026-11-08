import { FIELD_OP_IDS, getMissionDef } from "../data/operations";
import { OBJECTIVE_FAMILIES, VETERAN_TARGET, veteranRequirement } from "../data/veteran";
import type { FieldOpsProgression, FoundationProgressionState } from "../host/foundationProgression";
import { commandPurpose, nextFieldContract } from "./returnPurpose";

type CountKey = "clearCount" | "advancedClearCount" | "challengeCount";

function sumRecords(records: FieldOpsProgression["records"] | undefined, ids: string[], key: CountKey) {
  let total = 0;
  for (const id of ids) {
    const count = records?.[id]?.[key];
    if (count == null) return null;
    total += count;
  }
  return total;
}

export function serviceRecord(progression: FoundationProgressionState) {
  const field = progression.fieldOps;
  const records = field?.records;
  const contracts = field?.fieldContracts;
  const commander = field?.commander;
  const veteran = commander && commander.rank >= 3 ? field?.veteranCareer : undefined;
  const next = commandPurpose(progression).primary;
  const contract = nextFieldContract(field);
  const isContract = !next?.resume && next?.title === contract?.title && contract;

  return {
    fieldAvailable: !!field,
    total: sumRecords(records, FIELD_OP_IDS, "clearCount"),
    objectives: ["RECOVER", "HOLD", "SURVIVE", "INTERCEPT"].map(label => ({
      label,
      count: sumRecords(records, FIELD_OP_IDS.filter(id => OBJECTIVE_FAMILIES[id] === label), "clearCount"),
    })),
    advanced: sumRecords(records, FIELD_OP_IDS, "advancedClearCount"),
    challenges: sumRecords(records, FIELD_OP_IDS, "challengeCount"),
    commander: commander ? { rank: commander.rank, points: commander.progress, target: commander.nextRankAt } : null,
    veteran: veteran ? {
      credits: veteran.credits, target: VETERAN_TARGET,
      requirement: commander?.rank === 3 ? veteranRequirement(veteran) : null,
    } : null,
    contracts: contracts ? { completed: contracts.completed.length, honor: !!contracts.honor } : null,
    lockdown: !!field?.masteryPath?.firstLockdownClear,
    next: next ? {
      mission: getMissionDef(next.missionId)?.name ?? next.missionId,
      title: isContract ? `Field Contract · ${contract.title}` : next.title,
      reason: next.reason,
      action: next.resume ? "Resume operation" : next.tier === "advanced" ? "Review Advanced brief" : "View mission brief",
    } : null,
  };
}
