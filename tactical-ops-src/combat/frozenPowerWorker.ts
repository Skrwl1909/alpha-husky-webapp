/** Private worker-only projection. The Python authority must validate the full
 * frozen canonical binding and worker digest before sending this contract.
 * No caller-supplied stat request and no modification of the legacy V3 parser.
 */
import type { TacticalCombatProfileV3 } from "./combatProfileV3";
export type FrozenPower = {
  version:"tactical-power-projection-p2.v1";activation:"LAB_ONLY";
  canonicalSnapshotId:string;initiativeSource:"tactical-combat-profile-v3";
  legacyProfileId:string;alpha:{hp:number;atk:number;def:number;spd:number};
  gearImpactPolicy:"included-in-canonical-attributes-no-v31-carry";projectionId:string;
};
function exact(value:unknown, keys:string[]): value is Record<string,unknown> {
  return !!value && typeof value==="object" && !Array.isArray(value) &&
    Object.keys(value).length===keys.length && keys.every(k=>Object.hasOwn(value,k));
}
const digest=(x:unknown)=>typeof x==="string" && /^[a-f0-9]{64}$/.test(x);
export function parseFrozenPower(raw:unknown, legacy:TacticalCombatProfileV3):FrozenPower {
  if(!exact(raw,["version","activation","canonicalSnapshotId","initiativeSource","legacyProfileId","alpha","gearImpactPolicy","projectionId"]) ||
     raw.version!=="tactical-power-projection-p2.v1" || raw.activation!=="LAB_ONLY" ||
     raw.initiativeSource!=="tactical-combat-profile-v3" ||
     raw.gearImpactPolicy!=="included-in-canonical-attributes-no-v31-carry" ||
     ![raw.canonicalSnapshotId,raw.legacyProfileId,raw.projectionId].every(digest) ||
     !exact(raw.alpha,["hp","atk","def","spd"])) throw Error("invalid_frozen_power");
  const a=raw.alpha;
  for(const [k,[lo,hi]] of Object.entries({hp:[120,225],atk:[28,60],def:[12,36],spd:[14,19]})) {
    const v=a[k];if(typeof v!=="number"||!Number.isInteger(v)||v<lo||v>hi)throw Error("invalid_frozen_power");
  }
  if(a.spd!==legacy.alpha.spd)throw Error("invalid_power_initiative");
  return raw as unknown as FrozenPower;
}
export function workerProfile(legacy:TacticalCombatProfileV3,power?:FrozenPower):TacticalCombatProfileV3 {
  if(!power)return legacy;
  const p=parseFrozenPower(power,legacy);
  return {version:3,mode:"battle-v1",alpha:{...p.alpha},pet:legacy.pet};
}
export function checkPowerBattle(battle:unknown,power:FrozenPower):void {
  const units=(battle as {units?:Array<Record<string,unknown>>})?.units;
  const alpha=Array.isArray(units)?units.filter(u=>u.id==="alpha"&&u.defId==="alpha"):[];
  if(alpha.length!==1||alpha[0].maxHp!==power.alpha.hp||alpha[0].atk!==power.alpha.atk||
     alpha[0].def!==power.alpha.def||alpha[0].spd!==power.alpha.spd||
     alpha[0].gearImpactV31!=null)throw Error("power_snapshot_mismatch");
}
