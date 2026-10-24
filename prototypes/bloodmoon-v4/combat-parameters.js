// Resolved values only. This is NOT the production stats/equipment damage formula.
export function combatParameters(raw) {
  if (raw?.version !== 1 || !['local-fixture','resolved-input'].includes(raw.provenance) || raw.enemy?.id !== 'tower_husk') throw new TypeError('Unsupported combat parameter contract');
  const positive = (value,name) => {if(typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 1e6) throw new TypeError(`Invalid ${name}`);return value;};
  return Object.freeze({version:1,provenance:raw.provenance,
    player:Object.freeze({maxHP:positive(raw.player?.maxHP,'player HP'),damagePerHit:positive(raw.player?.damagePerHit,'player damage')}),
    enemy:Object.freeze({id:'tower_husk',maxHP:positive(raw.enemy.maxHP,'enemy HP'),damagePerHit:positive(raw.enemy.damagePerHit,'enemy damage')})});
}
export const LOCAL_PROFILES = Object.freeze({
  standard:combatParameters({version:1,provenance:'local-fixture',player:{maxHP:3,damagePerHit:1},enemy:{id:'tower_husk',maxHP:96,damagePerHit:1}}),
  stronger:combatParameters({version:1,provenance:'local-fixture',player:{maxHP:3,damagePerHit:1.2},enemy:{id:'tower_husk',maxHP:96,damagePerHit:1}})
});
export function combatTuning(parameters) {
  const p = combatParameters(parameters);
  return {playerHP:p.player.maxHP,damage:p.player.damagePerHit,bossHP:p.enemy.maxHP,incomingDamage:p.enemy.damagePerHit};
}
