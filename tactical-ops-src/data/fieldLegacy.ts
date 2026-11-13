/** Confirmed Field Legacy settlement, separate from ordinary fieldResult. */
export type FieldLegacyMilestone =
  | {version:1;kind:"FIRST_RECOVERY_SUPPLY";status:"AWARDED";runId:string;award:{scrap:12}}
  | {version:1;kind:"FIRST_RECOVERY_SUPPLY";status:"ALREADY_AWARDED";runId:string;awardedRunId:string}
  | {version:1;kind:"VETERAN_SERVICE_DISTINCTION";status:"AWARDED"|"IMPROVED"|"ALREADY_AWARDED";runId:string;record:{
      version:1;utcWeek:string;runId:string;completedAt:number;bestRounds:number;squadStanding:number
    }}
  | {version:1;kind:"FIRST_RECOVERY_SUPPLY"|"VETERAN_SERVICE_DISTINCTION";status:"UNAVAILABLE";runId:string};

/** Fail closed; never infer rewards from the local battle result. */
export function parseFieldLegacyMilestone(raw:unknown, acceptedRunId:string, missionId:string, victory:boolean):FieldLegacyMilestone|null {
  if (!victory || missionId!=="field-relay-recovery" || !raw || typeof raw!=="object" || Array.isArray(raw)) return null;
  const x=raw as Record<string,unknown>;
  if (x.version!==1 || x.runId!==acceptedRunId || !acceptedRunId.startsWith("field_recover_v1_")) return null;
  if (x.kind!=="FIRST_RECOVERY_SUPPLY" && x.kind!=="VETERAN_SERVICE_DISTINCTION") return null;
  if (x.status==="UNAVAILABLE") return {version:1,kind:x.kind,runId:acceptedRunId,status:"UNAVAILABLE"};
  if (x.kind==="FIRST_RECOVERY_SUPPLY") {
    if (x.status==="AWARDED") {
      const a=x.award;
      return a && typeof a==="object" && !Array.isArray(a) && (a as Record<string,unknown>).scrap===12
        ? {version:1,kind:x.kind,runId:acceptedRunId,status:"AWARDED",award:{scrap:12}} : null;
    }
    return x.status==="ALREADY_AWARDED" && typeof x.awardedRunId==="string" && x.awardedRunId.startsWith("field_recover_v1_")
      ? {version:1,kind:x.kind,runId:acceptedRunId,status:"ALREADY_AWARDED",awardedRunId:x.awardedRunId} : null;
  }
  if (x.status!=="AWARDED" && x.status!=="IMPROVED" && x.status!=="ALREADY_AWARDED") return null;
  const record=x.record;
  if (!record || typeof record!=="object" || Array.isArray(record)) return null;
  const v=record as Record<string,unknown>;
  if (v.version!==1 || typeof v.utcWeek!=="string" || !/^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/.test(v.utcWeek)
      || typeof v.runId!=="string" || !v.runId.startsWith("field_recover_v1_")
      || !Number.isSafeInteger(v.completedAt) || Number(v.completedAt)<=0
      || !Number.isSafeInteger(v.bestRounds) || Number(v.bestRounds)<1
      || !Number.isSafeInteger(v.squadStanding) || Number(v.squadStanding)<1 || Number(v.squadStanding)>3
      || (x.status!=="ALREADY_AWARDED" && v.runId!==acceptedRunId)) return null;
  return {version:1,kind:x.kind,runId:acceptedRunId,status:x.status,
    record:{version:1,utcWeek:v.utcWeek,runId:v.runId,completedAt:Number(v.completedAt),
      bestRounds:Number(v.bestRounds),squadStanding:Number(v.squadStanding)}};
}
