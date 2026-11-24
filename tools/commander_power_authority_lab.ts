// Offline Commander-only worker. Never imported by the client bundle.
import { stepRecover } from "../tactical-ops-src/combat/recoverAuthority";

function exact(v: any, keys: string[]) {
  return v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === keys.length && keys.every(k=>Object.hasOwn(v,k));
}
function digest(v: any) { return typeof v === "string" && /^[a-f0-9]{64}$/.test(v); }
function validCommand(c: any) {
  if(c==null)return true;
  if(c.type==="skip")return exact(c,["type"]);
  if(c.type==="move")return exact(c,["type","c","r"])&&Number.isInteger(c.c)&&c.c>=0&&c.c<10&&Number.isInteger(c.r)&&c.r>=0&&c.r<7;
  if(c.type==="skill")return (exact(c,["type","skillId"])||exact(c,["type","skillId","targetId"]))&&Object.values(c).every(v=>typeof v==="string"&&v.length>0&&v.length<=128);
  return false;
}
async function main() {
  process.stdin.setEncoding("utf8");
  let text="";
  for await(const chunk of process.stdin){text+=chunk;if(text.length>256000)throw Error("input_too_large");}
  const input=JSON.parse(text);
  if(!exact(input,["encounter","snapshot","command"]))throw Error("invalid_lab_input");
  const {encounter:e,snapshot:s,command:c}=input;
  const p=e?.powerProjection;
  if(e?.missionId!=="broken-signal-commander"||!/^mission_verified_v1_[0-9a-f]{32}$/.test(e.runId)||!validCommand(c)||(!s&&c!=null))throw Error("invalid_lab_encounter");
  // Null projection is explicit V3 control for parity only.
  if(p!==null){
    if(!exact(p,["version","activation","canonicalSnapshotId","initiativeSource","legacyProfileId","alpha","gearImpactPolicy","projectionId"])||
        p.version!=="tactical-power-projection-p2.v1"||p.activation!=="LAB_ONLY"||
        p.initiativeSource!=="tactical-combat-profile-v3"||p.gearImpactPolicy!=="included-in-canonical-attributes-no-v31-carry"||
        ![p.canonicalSnapshotId,p.legacyProfileId,p.projectionId].every(digest)||
        !exact(p.alpha,["hp","atk","def","spd"])||
        !Object.entries({hp:[120,225],atk:[28,60],def:[12,36],spd:[14,19]}).every(([k,[lo,hi]])=>Number.isInteger(p.alpha[k])&&p.alpha[k]>=lo&&p.alpha[k]<=hi)||
        p.alpha.spd!==e.combatProfileV3?.alpha?.spd)throw Error("invalid_lab_projection");
  }
  const id=p?.projectionId??null;
  if(s){
    if(!exact(s,["battle","cycle","statusSequence","projectionId"])||s.projectionId!==id)throw Error("lab_snapshot_binding_mismatch");
    if(p){
      const a=s.battle?.units?.find((u:any)=>u.id==="alpha"&&u.defId==="alpha");
      if(!a||a.maxHp!==p.alpha.hp||a.atk!==p.alpha.atk||a.def!==p.alpha.def||a.spd!==p.alpha.spd||a.gearImpactV31!=null)throw Error("lab_snapshot_profile_mismatch");
    }
  }
  const result=stepRecover(e,s??undefined,c??undefined);
  process.stdout.write(JSON.stringify(result===null?null:{...result,projectionId:id}));
}
void main().catch(error=>{console.error(error.message);process.exitCode=1;});
