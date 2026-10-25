import {DEAD_RELAY, getMissionDef} from "../data/operations";
import type {FoundationProgressionState} from "../host/foundationProgression";

export type TacticalOrder = {
  id:string; category:"STORY"|"FRONT"|"CHALLENGE"|"ADVANCED"|"RETURN";
  missionId:string|null; title:string; goal:string; consequence:string;
  status:"READY"|"IN_PROGRESS"|"COMPLETE"|"LOCKED"|"PENDING";
};
/** Read-only campaign orders from backend-confirmed state. Never simulates a reward. */
export function tacticalCampaignOrders(p:FoundationProgressionState|null|undefined):TacticalOrder[] {
  const result:TacticalOrder[]=[];
  if(!p?.completed)return result;
  const dead=p.operations?.[DEAD_RELAY.operationId];
  if(dead && dead.status!=="cleared"){
    const run=dead.activeMissionRun;
    const id=run?.missionId || DEAD_RELAY.orderedMissionIds.find(id=>dead.missions[id]==="available") || null;
    if(id)result.push({
      id:"story",category:"STORY",missionId:id,title:"CONTINUE THE DEAD RELAY",
      goal:`${getMissionDef(id)?.name||"Next mission"} · ${getMissionDef(id)?.objectiveType||"OBJECTIVE"}`,
      consequence: id==="dead-relay-courier"?"Intercept the courier; early first-clear Intel changes the next Hold battle.":id==="dead-relay-hold"?"Control the relay to unlock the Guardian.":"Defeat the Guardian to record Operation 02 completion.",
      status:run?"IN_PROGRESS":"READY"
    });
  }
  const f=p.fieldOps,b=f?.board,active=b?.activeMissionIds||[];
  if(!b || !f?.records){
    result.push({id:"refresh",category:"RETURN",missionId:null,title:"SYNC THE FRONT",goal:"Load current server rotation",consequence:"No progress or eligibility is inferred until the War Table refreshes.",status:"PENDING"});
    return result;
  }
  const secured=new Set(f.rotationProgress?.cycleId===b.cycleId?f.rotationProgress.clearedMissionIds:[]);
  const remaining=active.filter(id=>!secured.has(id) && f.records[id]?.lastClearCycle!==b.cycleId);
  const run=f.activeMissionRun;
  const pendingRun=run && getMissionDef(run.missionId)?run:null;
  if(pendingRun){
    result.push({id:"resume",category:"FRONT",missionId:pendingRun.missionId,title:"FINISH ACCEPTED OPERATION",goal:getMissionDef(pendingRun.missionId)?.name||pendingRun.missionId,consequence:"Resume the server-accepted run using its frozen conditions; the battle restarts at round 1.",status:"IN_PROGRESS"});
  }else if(remaining.length){
    const id=remaining[0];
    result.push({id:"front",category:"FRONT",missionId:id,title:"SECURE THE CURRENT FRONT",goal:`${remaining.length} of ${active.length} operations left · next: ${getMissionDef(id)?.name||id}`,consequence:"A server-confirmed first clear advances the rotation and can affect regional Signal Pressure.",status:"READY"});
  }else if(active.length){
    result.push({id:"front",category:"FRONT",missionId:null,title:"CURRENT FRONT SECURED",goal:`${active.length}/${active.length} operations completed`,consequence:"Wait for the next server rotation or attempt a still-open optional challenge.",status:"COMPLETE"});
  }
  const bonus=active.find(id=>getMissionDef(id)?.challenge && f.records[id]?.lastChallengeCycle!==b.cycleId);
  if(bonus)result.push({id:"challenge",category:"CHALLENGE",missionId:bonus,title:"COMPLETE A TACTICAL CHALLENGE",goal:`${getMissionDef(bonus)?.name}: ${getMissionDef(bonus)?.challenge?.label}`,consequence:"Optional challenge progress is only awarded when the backend accepts the report; previous clears do not grant it again.",status:"READY"});
  else if(active.length)result.push({id:"challenge",category:"CHALLENGE",missionId:null,title:"ROTATION CHALLENGES COMPLETE",goal:"All current eligible challenges recorded",consequence:"No unearned challenge bonus is promised.",status:"COMPLETE"});
  const tiers=f.commander?.unlockedDirectiveTiers||[];
  const advanced=active.find(id=>f.records[id]?.lastAdvancedCycle!==b.cycleId);
  if(tiers.includes("advanced") && advanced)result.push({id:"advanced",category:"ADVANCED",missionId:advanced,title:"TAKE THE ADVANCED DIRECTIVE",goal:`${getMissionDef(advanced)?.name||advanced} · ADVANCED`,consequence:"Choose Advanced in the briefing; only server-confirmed advanced clears enter the career record.",status:"READY"});
  else if(tiers.includes("advanced"))result.push({id:"advanced",category:"ADVANCED",missionId:null,title:"ADVANCED FRONT COMPLETE",goal:"Advanced objectives recorded this rotation",consequence:"Replays remain available for practice.",status:"COMPLETE"});
  else result.push({id:"advanced",category:"ADVANCED",missionId:null,title:"UNLOCK ADVANCED DIRECTIVES",goal:"Progress the backend Commander certification path",consequence:"Higher difficulty is not selectable until unlocked by the server.",status:"LOCKED"});
  return result;
}
export function tacticalCareerTruth(p:FoundationProgressionState|null|undefined){
 const c=p?.fieldOps?.careerRecord;
 if(!c)return null;
 return {missions:c.missionSecures,challenges:c.challenges,advanced:c.advancedClears,fronts:c.frontsSecured};
}
