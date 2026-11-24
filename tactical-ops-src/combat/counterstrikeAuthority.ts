import {advanceToNext,deployHostiles,startBattle} from "./battle";
import {applyRunCombatProfile} from "./combatProfileV3";
import {workerProfile,type FrozenPower} from "./frozenPowerWorker";
import {emptyThreatCycle,interruptLockedThreatAfterControl,markAlliedReaction,pruneInvalidThreats,type ThreatCycle} from "./intentScheduler";
import {selectAcceptedBattleRules,type BattleState,type BattleEvent} from "./types";
import {selectAcceptedIntentRules} from "./intentContract";
import {getStatusSequence,resetStatusSeq} from "./effects";
import {enemyActivation,legalAlliedAction,type RecoverCommand,type RecoverFrame} from "./recoverAuthority";
import {commanderSpawnsForSquad} from "../data/operations";
import {withTeammateSidegrades} from "../data/shadowSidegrade";
import {COUNTERSTRIKE_ID,COUNTERSTRIKE_RULESET,COUNTERSTRIKE_MISSION,type CounterstrikeRun} from "../data/counterstrike";

interface Snapshot {battle:BattleState;cycle:ThreatCycle;statusSequence:number;entered:number;radio:string[]}
export function stepCounterstrike(run:CounterstrikeRun,saved?:Snapshot,command?:RecoverCommand,power?:FrozenPower) {
 const contract=run.counterstrikeContract;
 if(run.missionId!==COUNTERSTRIKE_ID || contract?.version!==1 || contract.rulesetVersion!==COUNTERSTRIKE_RULESET ||
   contract.missionRevision!==1 || ![0,1].includes(contract.reinforcementDelay) ||
   (contract.intelStatus==="APPLIED") !== (contract.reinforcementDelay===1) || !run.rulesContract || !run.combatProfileV3)
  throw Error("invalid_counterstrike_contract");
 selectAcceptedBattleRules(run.rulesContract);selectAcceptedIntentRules(run.rulesContract);
 const squad=commanderSpawnsForSquad(run.squadIds,run.combatProfileV2?.pet);
 if(!squad)throw Error("invalid_counterstrike_roster");
 const spawns=[...squad.slice(0,3).map((u,i)=>({...u,...[{c:2,r:2},{c:1,r:1},{c:1,r:3}][i]})),
  {defId:"hostile",id:"false-relay-patrol-north",c:5,r:1},
  {defId:"hostile",id:"false-relay-patrol-south",c:6,r:3}];
 const roster=applyRunCombatProfile(withTeammateSidegrades(spawns,run as Parameters<typeof withTeammateSidegrades>[1]),workerProfile(run.combatProfileV3,power),run.combatProfileV2);
 if(saved)resetStatusSeq(saved.statusSequence);
 const initial=saved?null:startBattle(null,roster,structuredClone(COUNTERSTRIKE_MISSION.objective!),null,null,structuredClone(COUNTERSTRIKE_MISSION.directive!),run.playerGrowth);
 let battle=saved?.battle??initial!.state, cycle=saved?.cycle??emptyThreatCycle(),entered=saved?.entered??0;
 const radio=[...(saved?.radio??[])],frames:RecoverFrame[]=[];
 const signal=(text:string)=>{radio.push(text);if(radio.length>2)radio.shift();};
 if(initial)signal(contract.intelStatus==="APPLIED"?"RECON timing confirmed. HOUND entries delayed to rounds 4 and 6.":"HOUND entries expected in rounds 3 and 5. Secure the exact relay tile.");
 const frame=(events:BattleEvent[],skillId?:string,interrupted?:boolean)=>frames.push({battle,threats:cycle.pending.map(t=>t.plan),events,skillId,interrupted});
 const entries=[
  [{defId:"hostile",id:"false-relay-wave-north",c:7,r:0},{defId:"hostile",id:"false-relay-wave-south",c:7,r:4}],
  [{defId:"leader",id:"false-relay-pressure-leader",c:7,r:2},{defId:"hostile",id:"false-relay-rearguard",c:6,r:4}],
 ];
 const arrive=()=>{
  if(entered<2 && battle.outcome==="ongoing" && battle.round >= [3,5][entered]+contract.reinforcementDelay){
   battle=deployHostiles(battle,entries[entered]);entered++;
   signal(`HOUND reinforcement ${entered} entered. Relay approach under pressure.`);
   frame([{type:"ticker",text:radio[radio.length-1]}]);
  }
 };
 const advance=()=>{
  const next=advanceToNext(battle);battle=next.state;cycle=markAlliedReaction(pruneInvalidThreats(cycle,battle),battle);
  frame(next.events);arrive();
 };
 if(command){
  if(!saved || command.type==="recover")return null;
  const action=legalAlliedAction(battle,command);if(!action)return null;
  const interrupt=command.type==="skill"&&command.targetId
   ?interruptLockedThreatAfterControl(cycle,battle,action.state,action.actor.id,command.targetId,command.skillId,action.events)
   :{cycle,interrupted:false};
  battle=action.state;cycle=pruneInvalidThreats(interrupt.cycle,battle);
  frame(action.events,command.type==="skill"?command.skillId:undefined,interrupt.interrupted);
  if(battle.outcome==="ongoing"&&command.type!=="move")advance();
 }else if(initial)frame(initial.events);
 for(let count=0;battle.outcome==="ongoing";count++){
  const actor=battle.units.find(u=>u.id===battle.activeId);if(actor?.team==="ally")break;
  if(!actor||count===64)throw Error("counterstrike_activation_limit");
  const step=enemyActivation(battle,cycle);battle=step.state;cycle=step.cycle;
  frame(step.events,"skillId" in step?step.skillId:undefined);
  if(battle.outcome==="ongoing")advance();
 }
 if(battle.outcome==="victory" && !radio.includes("Relay secured. The recovered transmission is preserved."))signal("Relay secured. The recovered transmission is preserved.");
 const snapshot={battle,cycle:{...cycle,ledger:[]},entered,radio,statusSequence:getStatusSequence()};
 return {snapshot,frames,battle,radio,terminal:battle.outcome!=="ongoing"};
}
