import type { MissionDef } from "./operations";
import type { OperationMissionRun } from "../host/foundationProgression";
export const COUNTERSTRIKE_ID = "counterstrike-false-relay";
export const COUNTERSTRIKE_PREFIX = "counterstrike_v1_";
export const COUNTERSTRIKE_RULESET = "counterstrike-false-relay.1";
export const COUNTERSTRIKE_MISSION: MissionDef = {
 missionId: COUNTERSTRIKE_ID, operationId: "counterstrike", name: "COUNTERSTRIKE — THE FALSE RELAY",
 activity: "CANON", battlefield: "dead-relay", objectiveType: "HOLD", squadCap: 3, executable: true,
 briefCopy: "A recovered SIGNAL COURIER transmission points to a false relay near the Dead Relay. HOUND patrols are moving on the site. Secure the relay before the transmission window closes. The source of the signal remains unconfirmed.",
 resultsCopy: "The accepted operation record determines the aftermath.",
 objective: {type:"HOLD",terminal:{c:4,r:2},holderRadius:0,radius:1,duration:5,progress:0,checkedRound:1,relayPressure:{}},
 directive: {type:"NO_SAFE_EXTRACTION",name:"Transmission window",copy:"Hold the exact relay tile for five consecutive round changes. Adjacent HOUND units contest control. Loss of control resets the hold. Complete by round 12.",maxRounds:12},
};
export interface CounterstrikeResult {
 runId: string; missionId: typeof COUNTERSTRIKE_ID; victory: boolean; firstClear: boolean;
 rounds: number; control: number; intelStatus: "APPLIED" | "PREVIOUSLY_CONSUMED" | "NONE";
 intelConsumedByRunId: string | null; verification: "SERVER_COMMAND_WORKER";
}
export interface CounterstrikeSummary {
 version: 1; available: boolean; blocked: boolean; status: "active" | "cleared";
 squadIds:string[]; activeRunId: string | null; intelStatus: CounterstrikeResult["intelStatus"];
 intelConsumedByRunId: string | null; firstClear: CounterstrikeResult | null; lastResult: CounterstrikeResult | null;
 nextMissionId: string | null;
}
export type CounterstrikeRun = OperationMissionRun & {
 counterstrikeContract: {version:1;rulesetVersion:typeof COUNTERSTRIKE_RULESET;missionRevision:1;reinforcementDelay:0|1;
  intelStatus:CounterstrikeResult["intelStatus"];intelConsumedByRunId:string|null};
 kodaSidegrade?: unknown; shadowSidegrade?: unknown;
};
export function parseCounterstrike(raw:unknown):CounterstrikeSummary | undefined {
 if (!raw || typeof raw !== "object") return;
 const x=raw as CounterstrikeSummary;
 if(!Array.isArray(x.squadIds) || x.squadIds.some(id=>typeof id!=="string") || x.version!==1 || typeof x.available!=="boolean" || typeof x.blocked!=="boolean" ||
   !["active","cleared"].includes(x.status) || !["APPLIED","PREVIOUSLY_CONSUMED","NONE"].includes(x.intelStatus) ||
   x.activeRunId!==null && (typeof x.activeRunId!=="string" || !x.activeRunId.startsWith(COUNTERSTRIKE_PREFIX))) return;
 for (const r of [x.firstClear,x.lastResult]) if(r!==null && (!r || r.missionId!==COUNTERSTRIKE_ID ||
   r.verification!=="SERVER_COMMAND_WORKER" || typeof r.victory!=="boolean" || !Number.isSafeInteger(r.rounds))) return;
 return x;
}
