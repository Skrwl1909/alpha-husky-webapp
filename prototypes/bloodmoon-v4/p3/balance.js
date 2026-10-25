import {combatParameters} from '../combat-parameters.js';
import {DEMO_SCENARIOS} from '../p2/demo-profiles.js';

// Proposed Last Stand encounter modifiers, NOT an account/equipment formula.
// Resolve account stats privately first; never derive them in this module.
export const POLICY = Object.freeze({id:'last-stand-p3-v1',supportDamage:8,damageScale:.28,damageCeiling:13,hazardHPCap:.4});
export function lastStandParameters(resolved) {
  const p=combatParameters(resolved);
  return combatParameters({...p,player:{...p.player,
    damagePerHit:Math.round(Math.min(POLICY.damageCeiling,POLICY.supportDamage+p.player.damagePerHit*POLICY.damageScale)*1e9)/1e9},
    enemy:{...p.enemy,damagePerHit:Math.min(p.enemy.damagePerHit,p.player.maxHP*POLICY.hazardHPCap)}});
}
const fresh=combatParameters({version:1,provenance:'local-fixture',player:{maxHP:50,damagePerHit:5.125},enemy:{id:'tower_husk',maxHP:1000,damagePerHit:60}});
export const P3_PROFILES=Object.freeze(Object.fromEntries(Object.entries({fresh,baseline:DEMO_SCENARIOS.baseline.parameters,progressed:DEMO_SCENARIOS.progressed.parameters}).map(([id,resolved])=>[id,Object.freeze({label:`${id[0].toUpperCase()+id.slice(1)} · Last Stand synthetic fixture`,resolved,parameters:lastStandParameters(resolved)})])));
