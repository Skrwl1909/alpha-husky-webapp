/** PR1A: dormant canonical input snapshot (not calculated combat stats). */
export const KEYS=["strength","agility","defense","vitality","intelligence","luck"] as const;
export type Stats=Record<typeof KEYS[number],number>;
export interface TacticalCombatProfileV2 { version:2;mode:"inputs-only";alpha:{level:number;base:Stats;gear:Stats};pet:{id:string;name:string;img:string;level:number;effective:Stats}|null }
function obj(x:unknown):Record<string,unknown>{if(!x||typeof x!=="object"||Array.isArray(x))throw Error("invalid_combat_profile_v2");return x as Record<string,unknown>}
function exact(x:Record<string,unknown>,ks:string[]){if(Object.keys(x).length!==ks.length||!ks.every(k=>Object.prototype.hasOwnProperty.call(x,k)))throw Error("invalid_combat_profile_v2")}
function integer(x:unknown,lo:number,hi:number){if(typeof x!=="number"||!Number.isInteger(x)||x<lo||x>hi)throw Error("invalid_combat_profile_v2");return x}
function stat(x:unknown,signed=false):Stats{const o=obj(x);exact(o,[...KEYS]);const r={} as Stats;for(const k of KEYS)r[k]=integer(o[k],signed?-1000:0,10000);return r}
function str(x:unknown,max:number){if(typeof x!=="string"||x.length<1||x.length>max)throw Error("invalid_combat_profile_v2");return x}
/** Only absent v2 is legacy; corrupted present v2 fails closed. */
export function parseCombatProfileV2(raw:unknown):TacticalCombatProfileV2|null{if(raw===undefined)return null;const v=obj(raw);exact(v,["version","mode","alpha","pet"]);if(v.version!==2||v.mode!=="inputs-only")throw Error("invalid_combat_profile_v2");const a=obj(v.alpha);exact(a,["level","base","gear"]);const alpha={level:integer(a.level,1,10000),base:stat(a.base),gear:stat(a.gear,true)};let pet:TacticalCombatProfileV2["pet"]=null;if(v.pet!==null){const p=obj(v.pet);exact(p,["id","name","img","level","effective"]);const img=str(p.img,2048);if(!img.startsWith("https://"))throw Error("invalid_combat_profile_v2");pet={id:str(p.id,128),name:str(p.name,128),img,level:integer(p.level,1,10000),effective:stat(p.effective)}}return{version:2,mode:"inputs-only",alpha,pet}}
