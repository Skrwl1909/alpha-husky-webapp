import type {BattleEvent,CombatUnit} from "../combat/types";
export interface EnemyScene {id:number;actorId:string;style:"melee"|"heavy"|"ranged"|"jam";from:{c:number;r:number};to:{c:number;r:number};durationMs:number;contactMs:number;}
export function enemyScene(actor:CombatUnit,skillId:string,events:readonly BattleEvent[],units:readonly CombatUnit[],id:number):EnemyScene|null {
 if(actor.team!=="enemy"||actor.defeated)return null;
 const result=events.find(e=>(e.type==="damage"||e.type==="status")&&e.unitId&&e.unitId!==actor.id);
 const target=units.find(u=>u.id===result?.unitId);
 if(!target)return null;
 const style=/jam|intimidate|interference/.test(skillId)?"jam":/pulse|aim|shot/.test(skillId)||actor.archetype==="MARKSMAN"?"ranged":/crush|maul/.test(skillId)||actor.role==="leader"?"heavy":"melee";
 const durationMs=style==="heavy"?680:style==="jam"?620:550;
 // Match damage reveal to the visible actor arrival / beam strike in tactical.css.
 // No combat resolution or AI cadence changes; this is playback-only.
 const contactPhase=style==="heavy"?.49:style==="melee"?.42:.44;
 return {id,actorId:actor.id,style,from:{c:actor.c,r:actor.r},to:{c:target.c,r:target.r},durationMs,contactMs:Math.round(durationMs*contactPhase)};
}
