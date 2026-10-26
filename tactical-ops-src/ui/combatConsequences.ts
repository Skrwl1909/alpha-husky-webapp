import type {BattleEvent,CombatUnit} from "../combat/types";
export type ConsequenceKind = "finisher"|"guarded"|"counter";
export type CombatConsequence = {id:number;unitId:string;kind:ConsequenceKind;label:string};
export function confirmedHitConsequence(event:BattleEvent, units:readonly CombatUnit[], displayedHp:Record<string,number>):Omit<CombatConsequence,"id">|null {
 if(event.type!=="damage"||!event.unitId||!event.amount||event.amount<=0)return null;
 const target=units.find(u=>u.id===event.unitId);
 if(!target)return null;
 const before=displayedHp[event.unitId]??target.hp;
 // The event has already been accepted by the engine. Never infer a kill from intensity alone.
 if(before>0 && before-event.amount<=0 && target.defeated)
   return {unitId:event.unitId,kind:"finisher",label:"TARGET DOWN"};
 // GUARD is a confirmed active defensive state; do not invent a blocked-damage amount.
 if(target.statuses.some(s=>s.type==="GUARD"))
   return {unitId:event.unitId,kind:"guarded",label:"GUARD ACTIVE"};
 return null;
}
export function confirmedCounterConsequence(interrupted:boolean,targetId:string,events:readonly BattleEvent[]):Omit<CombatConsequence,"id">|null {
 if(!interrupted||!targetId||!events.some(e=>e.type==="status"&&e.unitId===targetId))return null;
 return {unitId:targetId,kind:"counter",label:"SIGNAL BROKEN"};
}
