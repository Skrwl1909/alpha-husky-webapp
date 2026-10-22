import type { BattleState } from "../combat/types";
import type { MissionDef } from "../data/operations";
import type { FieldOpsProgression } from "../host/foundationProgression";

/** Truthful mission-facing copy; this module never awards anything. */
export function missionGoal(m: MissionDef): string {
  const o=m.objective;
  if(o?.type==="HOLD")return `Control the relay for ${o.duration} consecutive round changes. Enemies inside the zone reset control.`;
  if(o?.type==="SURVIVE")return `Keep the entire squad alive through ${o.duration} rounds. Killing enemies early does not end the mission.`;
  if(o?.type==="INTERCEPT")return "Stop the courier before it reaches the exit.";
  if(m.objectiveType==="RECOVER")return "Reach the relay and activate RECOVER when the signal is open.";
  if(m.objectiveType==="BOSS")return "Defeat the marked commander. Other enemies are not the objective.";
  return "Eliminate every hostile.";
}
export function missionFailure(m:MissionDef):string {
  if(m.objectiveType==="INTERCEPT")return "The courier escapes or the squad is defeated.";
  if(m.objectiveType==="SURVIVE")return "Any squad member falls.";
  if(m.directive?.maxRounds)return `The deadline (round ${m.directive.maxRounds}) expires, or the squad is defeated.`;
  return "The whole squad is defeated; special mission deadlines may also apply.";
}
export interface MissionRewardTruth {
  clear: "AVAILABLE"|"SECURED"|"NOT_APPLICABLE"|"UNKNOWN";
  challenge: "AVAILABLE"|"SECURED"|"NOT_APPLICABLE"|"UNKNOWN";
  commander: "ACTIVE"|"CERTIFIED"|"UNKNOWN";
  copy:string;
}
export function missionRewardTruth(m:MissionDef,field:FieldOpsProgression|undefined):MissionRewardTruth {
  if(m.activity!=="FIELD_OP")return {clear:"NOT_APPLICABLE",challenge:"NOT_APPLICABLE",commander:"UNKNOWN",copy:"Campaign rewards are recorded by the server after completion."};
  if(!field?.board||!field.commander)return {clear:"UNKNOWN",challenge:"UNKNOWN",commander:"UNKNOWN",copy:"Refresh the War Table to check this rotation's rewards."};
  const record=field.records?.[m.missionId];
  const clear=record?.lastClearCycle===field.board.cycleId?"SECURED":"AVAILABLE";
  const challenge=!m.challenge?"NOT_APPLICABLE":record?.lastChallengeCycle===field.board.cycleId?"SECURED":"AVAILABLE";
  const commander=field.commander.rank>=3||field.commander.certificationComplete===true?"CERTIFIED":"ACTIVE";
  const copy=commander==="CERTIFIED"
    ? "Commander certification complete. Play for other eligible rewards and tactical challenges; no additional Commander rank is promised."
    : clear==="SECURED"&&challenge!=="AVAILABLE"
    ? "Commander clear and challenge already secured this rotation."
    : clear==="SECURED" ? "Clear already secured; the optional challenge may still award Commander progress." : "First clear may award Commander progress. Optional challenge progress is separate.";
  return {clear,challenge,commander,copy};
}
export function missionLiveProgress(b:BattleState):string {
 const o=b.objective;
 if(o?.type==="HOLD")return `HOLD ${o.progress}/${o.duration}`;
 if(o?.type==="SURVIVE")return `SURVIVE ${o.progress}/${o.duration}`;
 if(o?.type==="INTERCEPT"){const courier=b.units.find(u=>u.id===o.targetId);return courier&&!courier.defeated ? `COURIER AT ${courier.c+1},${courier.r+1} · STOP BEFORE EXIT`:"COURIER STOPPED";}
 if(o?.type==="RECOVER")return o.completed?"SIGNAL RECOVERED":"RECOVER THE SIGNAL";
 if(o?.type==="BOSS")return b.units.some(u=>u.id===o.targetId&&!u.defeated)?"DEFEAT COMMANDER":"COMMANDER DEFEATED";
 return `${b.units.filter(u=>u.team==="enemy"&&!u.defeated).length} HOSTILES REMAIN`;
}
