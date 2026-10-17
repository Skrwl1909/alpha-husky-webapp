/** Server-sourced, frozen run-specific battle stats. No client computation of RPG power. */
import type { SpawnSpec } from "../data/units";
import type { TacticalCombatProfileV2 } from "./combatProfile";

export interface TacticalCombatProfileV3 {
  version: 3;
  mode: "battle-v1";
  alpha: { hp:number; atk:number; def:number; spd:number };
  pet: ({id:string;name:string;img:string;hp:number;atk:number;def:number;spd:number}) | null;
}
const keys=["hp","atk","def","spd"] as const;
function object(x:unknown):Record<string,unknown> {if(!x||typeof x!=="object"||Array.isArray(x))throw Error("invalid_combat_profile_v3");return x as Record<string,unknown>}
function exact(o:Record<string,unknown>,ks:string[]):void {if(Object.keys(o).length!==ks.length||!ks.every(k=>Object.prototype.hasOwnProperty.call(o,k)))throw Error("invalid_combat_profile_v3")}
function bounded(x:unknown,min:number,max:number):number {if(typeof x!=="number"||!Number.isInteger(x)||x<min||x>max)throw Error("invalid_combat_profile_v3");return x}
function stats(x:Record<string,unknown>,base:[number,number,number,number],bonus:[number,number,number,number]):{hp:number;atk:number;def:number;spd:number} {const s={} as {hp:number;atk:number;def:number;spd:number};keys.forEach((k,i)=>{s[k]=bounded(x[k],base[i],base[i]+bonus[i])});return s}
export function parseCombatProfileV3(raw:unknown):TacticalCombatProfileV3|null {
 if(raw===undefined)return null;const v=object(raw);exact(v,["version","mode","alpha","pet"]);if(v.version!==3||v.mode!=="battle-v1")throw Error("invalid_combat_profile_v3");const a=object(v.alpha);exact(a,[...keys]);const alpha=stats(a,[120,28,12,14],[18,11,9,2]);let pet:TacticalCombatProfileV3["pet"]=null;
 if(v.pet!==null){const p=object(v.pet);exact(p,["id","name","img",...keys]);for(const k of ["id","name","img"]){if(typeof p[k]!=="string"||!(p[k] as string).length||(p[k] as string).length>(k==="img"?2048:128))throw Error("invalid_combat_profile_v3")};if(!(p.img as string).startsWith("https://"))throw Error("invalid_combat_profile_v3");pet={id:p.id as string,name:p.name as string,img:p.img as string,...stats(p,[78,18,6,13],[13,7,5,2])}}
 return {version:3,mode:"battle-v1",alpha,pet};
}
/** Changes only deployed Alpha/equipped-pet UnitDefs. Enemies and allies untouched. */
export function applyRunCombatProfile(spawns:SpawnSpec[],v3:TacticalCombatProfileV3|null,v2:TacticalCombatProfileV2|null|undefined):SpawnSpec[] {
 if(!v3)return spawns;
 if(!v2||v2.pet?.id!==v3.pet?.id||(v2.pet===null)!==(v3.pet===null))throw Error("combat_profile_version_mismatch");
 let alphaCount=0,petCount=0;
 const result=spawns.map(s=>{
   if(s.defId==="alpha"){alphaCount++;if(!s.unitDef)throw Error("alpha_unit_def_missing");return {...s,unitDef:{...s.unitDef,...v3.alpha}};}
   if(s.defId.startsWith("pet:")||s.id.startsWith("pet:")){petCount++;if(!v3.pet||s.id!==`pet:${v3.pet.id}`||!s.unitDef)throw Error("combat_pet_mismatch");const {hp,atk,def:armor,spd}=v3.pet;return {...s,unitDef:{...s.unitDef,hp,atk,def:armor,spd}};}
   return s;
 });
 if(alphaCount!==1||petCount!==(v3.pet?1:0))throw Error("combat_squad_mismatch");return result;
}
