import {getMissionDef} from "../data/operations";
export type DoctrineId="RECON"|"DEFENSE"|"INTERDICTION";
export type ChapterStatus="AVAILABLE"|"ACTIVE"|"COMPLETED";
export type ChapterSnapshot={version:1;chapterId:"edge-relay";status:ChapterStatus;doctrine:DoctrineId|null;revision:number;completedMissionIds:string[];activeRunId:string|null;intelEffect:"NONE"|"DELAY_REINFORCEMENT"|"SOUTH_APPROACH"|"COMMAND_DISRUPTION";intelConsumedByRunId:string|null;lastReceiptId:string|null};
export const DOCTRINES={
 RECON:{title:"GHOST SIGNAL",copy:"Recover the relay, then intercept the courier. Win with positioning and information.",missions:["field-relay-recovery","field-relay-intercept","dead-relay-courier"],effect:"DELAY_REINFORCEMENT"},
 DEFENSE:{title:"HOLD THE CHAIN",copy:"Secure two contested locations, then keep the full squad alive.",missions:["field-relay-hold","field-isolated-hold","field-squad-survival"],effect:"SOUTH_APPROACH"},
 INTERDICTION:{title:"BREAK THE COMMAND",copy:"Stop the courier, defend a flank, then defeat the relay Guardian.",missions:["field-relay-intercept","field-rearguard","dead-relay-guardian"],effect:"COMMAND_DISRUPTION"}
} as const;
const ids=new Set<string>(Object.values(DOCTRINES).flatMap(d=>[...d.missions]));
export function parseChapterSnapshot(raw:unknown):ChapterSnapshot|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const x=raw as Record<string,unknown>;
 if(x.version!==1||x.chapterId!=="edge-relay"||!["AVAILABLE","ACTIVE","COMPLETED"].includes(String(x.status)))return null;
 if(x.doctrine!==null&&!Object.hasOwn(DOCTRINES,String(x.doctrine)))return null;
 if(!Number.isSafeInteger(x.revision)||Number(x.revision)<0)return null;
 if(!Array.isArray(x.completedMissionIds)||x.completedMissionIds.some(y=>typeof y!=="string"||!ids.has(y))||new Set(x.completedMissionIds).size!==x.completedMissionIds.length)return null;
 if(x.activeRunId!==null&&(typeof x.activeRunId!=="string"||!x.activeRunId))return null;
 if(!["NONE","DELAY_REINFORCEMENT","SOUTH_APPROACH","COMMAND_DISRUPTION"].includes(String(x.intelEffect)))return null;
 if(x.intelConsumedByRunId!==null&&(typeof x.intelConsumedByRunId!=="string"||!x.intelConsumedByRunId))return null;
 if(x.lastReceiptId!==null&&(typeof x.lastReceiptId!=="string"||!x.lastReceiptId))return null;
 const doctrine=x.doctrine as DoctrineId|null,completed=x.completedMissionIds as string[];
 if(x.status==="AVAILABLE"&&(doctrine!==null||completed.length!==0||x.activeRunId!==null||x.intelEffect!=="NONE"))return null;
 if(x.status!=="AVAILABLE"&&!doctrine)return null;
 if(doctrine&&(completed.some(id=>!DOCTRINES[doctrine].missions.includes(id as never))||DOCTRINES[doctrine].missions.some((id,i)=>i<completed.length&&completed[i]!==id)))return null;
 if(x.status==="COMPLETED"&&(!doctrine||completed.length!==3||x.activeRunId!==null||x.intelEffect!==DOCTRINES[doctrine].effect))return null;
 if(x.status==="ACTIVE"&&completed.length>=3)return null;
 return {version:1,chapterId:"edge-relay",status:x.status as ChapterStatus,doctrine,revision:Number(x.revision),completedMissionIds:[...completed],activeRunId:x.activeRunId as string|null,intelEffect:x.intelEffect as ChapterSnapshot["intelEffect"],intelConsumedByRunId:x.intelConsumedByRunId as string|null,lastReceiptId:x.lastReceiptId as string|null};
}
export function chapterNextMission(s:ChapterSnapshot):string|null{
 if(s.status!=="ACTIVE"||!s.doctrine)return null;
 return DOCTRINES[s.doctrine].missions[s.completedMissionIds.length]||null;
}
export function chapterDisplay(s:ChapterSnapshot){
 const next=chapterNextMission(s);
 return {complete:s.status==="COMPLETED",stage:s.completedMissionIds.length,total:3,
  title:s.doctrine?DOCTRINES[s.doctrine].title:"CHOOSE YOUR DOCTRINE",
  nextMissionId:next,nextMissionName:next?getMissionDef(next)?.name||next:null,
  consequence:s.status==="COMPLETED"?"Server-recorded campaign Intel is available only under the accepted next-run contract.":s.doctrine?DOCTRINES[s.doctrine].copy:"Doctrine selection must be recorded by the server before deployment."};
}
/** Deterministic reference transition model for backend integration tests, NOT a client write. */
export function chapterTransition(s:ChapterSnapshot,event:
 {type:"SELECT";doctrine:DoctrineId;expectedRevision:number;receiptId:string}|
 {type:"ACCEPT_RUN";missionId:string;runId:string;expectedRevision:number;receiptId:string}|
 {type:"COMPLETE_RUN";missionId:string;runId:string;victory:boolean;serverVerified:boolean;expectedRevision:number;receiptId:string}):ChapterSnapshot{
 if(event.receiptId===s.lastReceiptId)return s;
 if(event.expectedRevision!==s.revision||!event.receiptId)throw Error("chapter_revision_conflict");
 if(event.type==="SELECT"){
  if(s.status!=="AVAILABLE"||s.activeRunId||!Object.hasOwn(DOCTRINES,event.doctrine))throw Error("chapter_selection_not_allowed");
  return {...s,status:"ACTIVE",doctrine:event.doctrine,revision:s.revision+1,lastReceiptId:event.receiptId};
 }
 if(s.status!=="ACTIVE"||!s.doctrine||chapterNextMission(s)!==event.missionId)throw Error("chapter_mission_not_allowed");
 if(event.type==="ACCEPT_RUN"){
  if(s.activeRunId&&s.activeRunId!==event.runId)throw Error("chapter_run_in_progress");
  if(!event.runId)throw Error("chapter_invalid_run");
  return {...s,activeRunId:event.runId,revision:s.revision+1,lastReceiptId:event.receiptId};
 }
 if(!event.serverVerified||!event.runId||event.runId!==s.activeRunId)throw Error("chapter_unverified_result");
 const done=event.victory?[...s.completedMissionIds,event.missionId]:s.completedMissionIds;
 const finished=done.length===3;
 return {...s,status:finished?"COMPLETED":"ACTIVE",completedMissionIds:done,activeRunId:null,
  intelEffect:finished?DOCTRINES[s.doctrine].effect:"NONE",revision:s.revision+1,lastReceiptId:event.receiptId};
}
