/** New candidate workers; never imported by browser bundles. */
import { parseFrozenPower,checkPowerBattle } from "../tactical-ops-src/combat/frozenPowerWorker";
import { stepRecover } from "../tactical-ops-src/combat/recoverAuthority";
import { stepCounterstrike } from "../tactical-ops-src/combat/counterstrikeAuthority";
import { stepLastHowl } from "../tactical-ops-src/combat/lastHowlAuthority";
declare const POWER_WORKER_FAMILY: "operation" | "counterstrike" | "last-howl";
async function main(){
 let input="";process.stdin.setEncoding("utf8");
 for await(const chunk of process.stdin){input+=chunk;if(input.length>512000)throw Error("power_input_too_large");}
 const {encounter,snapshot,command}=JSON.parse(input);
 if(!encounter||!encounter.powerProjection||(!snapshot&&command!=null))throw Error("invalid_power_encounter");
 const legacy=POWER_WORKER_FAMILY==="last-howl"?encounter.activeCombatProfileV3:encounter.combatProfileV3;
 const p=parseFrozenPower(encounter.powerProjection,legacy);
 let old=snapshot;
 if(snapshot){
  if(snapshot.projectionId!==p.projectionId)throw Error("power_snapshot_binding_mismatch");
  checkPowerBattle(snapshot.battle,p);
  const {projectionId: _id,...rest}=snapshot;old=rest;
 }
 const result:any=POWER_WORKER_FAMILY==="operation"?stepRecover(encounter,old??undefined,command??undefined,p):
   POWER_WORKER_FAMILY==="counterstrike"?stepCounterstrike(encounter,old??undefined,command??undefined,p):
   stepLastHowl(encounter,old??undefined,command??undefined,p);
 if(result===null){process.stdout.write("null");return;}
 if(POWER_WORKER_FAMILY==="operation"){
  checkPowerBattle(result.battle,p);result.projectionId=p.projectionId;
 }else{
  checkPowerBattle(result.snapshot.battle,p);result.snapshot.projectionId=p.projectionId;
 }
 process.stdout.write(JSON.stringify(result));
}
void main().catch(error=>{console.error(error.message);process.exitCode=1;});
