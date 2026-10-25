import { canonicalGrowthSkillId } from "../data/playerGrowth";
import type { BattleEvent, CombatUnit } from "../combat/types";
export const FX_ROOT = "/images/tactical_ops/combat_fx/v1/";
const DURATIONS: Record<string, number> = {
 alpha_strike:540,alpha_rend:680,alpha_howl:820,alpha_guard:640,
 cnc_thrust:500,cnc_lunge:580,cnc_pressure:720,cnc_interrupt:760,
 shadow_sweep:520,shadow_mend:760,shadow_pack_heal_def:820,shadow_pack_def_only:820,shadow_pack_guard:820,
 pet_bite:500,pet_hamstring:740,pet_pathfinder:660,objective_recover:880,
};
export type CombatFxName = keyof typeof DURATIONS;
export const COMBAT_FX_VISUAL_CLASSES: Readonly<Record<string,string>> = {
    "alpha_strike": "fx-alpha fx-hit fx-strike",
    "alpha_rend": "fx-alpha fx-hit fx-rend",
    "alpha_howl": "fx-alpha fx-howl",
    "alpha_guard": "fx-alpha fx-guard",
    "cnc_thrust": "fx-cnc fx-hit fx-thrust",
    "cnc_lunge": "fx-cnc fx-hit fx-lunge",
    "cnc_pressure": "fx-cnc fx-control",
    "cnc_interrupt": "fx-cnc fx-interrupt",
    "shadow_sweep": "fx-shadow fx-hit fx-sweep",
    "shadow_mend": "fx-shadow fx-mend",
    "shadow_pack_heal_def": "fx-shadow fx-pack",
    "shadow_pack_def_only": "fx-shadow fx-pack",
    "shadow_pack_guard": "fx-shadow fx-pack",
    "pet_bite": "fx-pet fx-hit fx-bite",
    "pet_hamstring": "fx-pet fx-hit fx-hamstring",
    "pet_pathfinder": "fx-pet fx-pathfinder",
    "objective_recover": "fx-objective fx-recover"
};

/** Rendering identity only. Never schedules a combat effect or changes its gameplay outcome. */
export function combatFxVisualClasses(name: string): string { return COMBAT_FX_VISUAL_CLASSES[name] ?? ""; }

export interface CombatFx { id:number; name:string; targetId?:string; terminal?:{c:number;r:number}; durationMs:number; actorId?:string; from?:{c:number;r:number}; }
export function fx(name:string,id:number,targetId?:string,terminal?:{c:number;r:number}): CombatFx {
 if (!(name in DURATIONS)) throw Error("Unknown combat FX "+name);
 return {id,name,targetId,terminal,durationMs:DURATIONS[name]};
}
export function spriteEvents(actor:CombatUnit,skillId:string,events:readonly BattleEvent[],id:number,interrupted:boolean):CombatFx[] {
 const canonical=canonicalGrowthSkillId(skillId);
 const has=(type:string)=>events.some(e=>e.type===type);
 const status=(label:string)=>events.some(e=>e.type==="status" && (e.text||"").toUpperCase()===label);
 const recipients=(type:string)=>[...new Set(events.filter(e=>e.type===type && e.unitId).map(e=>e.unitId!))];
 const target=recipients("damage")[0]||recipients("status")[0]||recipients("heal")[0];
 const list:CombatFx[]=[];
 const add=(name:string,recipient?:string)=>list.push({ ...fx(name,id+list.length,recipient||actor.id), actorId:actor.id, from:{c:actor.c,r:actor.r} });
 const damage=has("damage"), heal=events.some(e=>e.type==="heal"&&(e.amount||0)>0);
 switch(canonical){
 case "alpha-strike":if(damage)add("alpha_strike",target);break;
 case "alpha-rend":if(damage)add("alpha_rend",target);break;
 case "alpha-howl":
   if(status("ATK UP")||status("SPD UP"))add("alpha_howl");
   if(status("GUARD")){for(const r of recipients("status").filter(uid=>events.some(e=>e.type==="status"&&e.unitId===uid&&e.kind==="guard")))add("alpha_guard",r);}
   break;
 case "u02-shot":if(damage)add("cnc_thrust",target);break;
 case "u02-burst":if(damage)add("cnc_lunge",target);break;
 case "u02-suppress":
   if(status("ATK DOWN"))add("cnc_pressure",target);
   if(interrupted)add("cnc_interrupt",target);break;
 case "u03-tap":if(damage)add("shadow_sweep",target);break;
 case "u03-mend":if(heal){for(const recipient of recipients("heal"))add("shadow_mend",recipient);}break;
 case "u03-pack":
   if(heal && status("DEF UP"))add("shadow_pack_heal_def");
   else if(status("DEF UP"))add("shadow_pack_def_only");
   if(status("GUARD"))add("shadow_pack_guard");break;
 case "pet-bite":if(damage)add("pet_bite",target);break;
 case "pet-hamstring":if(status("SPD DOWN"))add("pet_hamstring",target);break;
 }
 return list;
}
export function pathfinderFx(actor:CombatUnit,moved:CombatUnit,id:number):CombatFx[] {
 if(!actor.defId.startsWith("pet:")||actor.combatMastery?.stage!==3||actor.combatMastery.selected!=="B")return [];
 if(actor.c===moved.c&&actor.r===moved.r)return [];
 // A signature trail appears only if extra movement was actually used.
 const length=Math.abs(actor.c-moved.c)+Math.abs(actor.r-moved.r);
 return length>4?[fx("pet_pathfinder",id,actor.id)]:[];
}
