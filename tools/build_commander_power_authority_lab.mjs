// The transform is scoped to this offline bundle. The shipped source stays untouched.
import { build } from "vite";
import { fileURLToPath } from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const replacement=`function configure(run: Encounter) {
  const contract = run.rulesContract;
  if (run.missionId !== "broken-signal-commander" || contract?.missionId !== run.missionId ||
      contract.rulesetVersion !== TACTICAL_VNEXT_RULESET || contract.missionRevision !== 1 ||
      !run.combatProfileV3) throw Error("invalid_commander_encounter");
  selectAcceptedBattleRules(contract);
  selectAcceptedIntentRules(contract as RunRulesContract);
  const mission = missionForContext(getMissionDef(run.missionId)!, run.fieldContext, contract.missionRevision);
  const pet = run.combatProfileV2?.pet;
  const spawns = missionSpawnsForSquad(mission, run.squadIds, pet, run.fieldContext?.approach);
  if (!spawns || (run.squadIds.some(id => id.startsWith("pet:")) && !pet)) throw Error("invalid_commander_roster");
  const profile = (run as any).powerProjection;
  const v3 = run.combatProfileV3;
  // Apply the existing authored companion/pet/mastery mapping exactly once.
  // Never route these wider values through the V3 wire parser.
  const selected = profile === null ? v3 : {version:3,mode:"battle-v1",alpha:profile.alpha,pet:v3.pet};
  return {
    spawns: applyRunCombatProfile(withTeammateSidegrades(withFieldRend(spawns, run.fieldContext?.fieldRend), run),
      selected as typeof v3, run.combatProfileV2),
    rules: missionBattleRules(mission, (run as any).routingTrace === true, run.fieldContext),
  };
}`;
let transformed=0;
await build({root,configFile:false,logLevel:"warn",plugins:[{
  name:"commander-lab-configure-only",enforce:"pre",transform(code,id){
    if(!id.replaceAll("\\","/").endsWith("/tactical-ops-src/combat/recoverAuthority.ts"))return;
    const start=code.indexOf("function configure(run: Encounter) {");
    const end=code.indexOf("\nexport function enemyActivation",start);
    if(start<0||end<0||!code.slice(start,end).includes('run.missionId !== "field-relay-recovery"'))throw Error("authority source drift");
    transformed++;
    return {code:code.slice(0,start)+replacement+"\n"+code.slice(end),map:null};
  }
}],build:{emptyOutDir:false,outDir:fileURLToPath(new URL("../artifacts/commander-power-authority/",import.meta.url)),target:"node22",minify:true,lib:{entry:fileURLToPath(new URL("./commander_power_authority_lab.ts",import.meta.url)),formats:["cjs"],fileName:()=>"commander_power_authority_lab.cjs"}}});
if(transformed!==1)throw Error("expected one lab configuration transform");
console.log("COMMANDER LAB WORKER BUILT (not production)");
