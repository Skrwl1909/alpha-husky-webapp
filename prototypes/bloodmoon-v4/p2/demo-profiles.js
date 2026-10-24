import {combatParameters} from '../combat-parameters.js';
// Public synthetic demo snapshots, not account data or a backend stat formula.
// Numeric combat values retain the accepted P2 demonstration unchanged.
export const DEMO_SCENARIOS=Object.freeze({
  baseline:Object.freeze({label:'Baseline Howler · synthetic demo',parameters:combatParameters({version:1,provenance:'local-fixture',player:{maxHP:170,damagePerHit:10.5},enemy:{id:'tower_husk',maxHP:1000,damagePerHit:60}})}),
  progressed:Object.freeze({label:'Progressed Howler · synthetic demo',parameters:combatParameters({version:1,provenance:'local-fixture',player:{maxHP:278,damagePerHit:16.875},enemy:{id:'tower_husk',maxHP:1000,damagePerHit:60}})})
});
export async function resolveDemoProfile(profile){
  const scenario=DEMO_SCENARIOS[profile];if(!scenario)throw Error('INVALID_PROFILE');
  return {parameters:structuredClone(scenario.parameters),kind:'public-synthetic-demo'};
}
