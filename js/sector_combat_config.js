// Small shared contract for direct-control sector prototypes. It deliberately owns no Phaser state.
(function (global) {
  "use strict";
  const DEFAULT_COMBAT = Object.freeze({
    playerMaxHp: 100,
    playerDamage: 30,
    playerSpeed: 230,
    playerAttackRange: 86,
    playerAttackCooldownMs: 360,
    enemyMaxHp: 78,
    enemyDamage: 6,
    enemySpeed: 92,
    enemyAggroRange: 260,
    enemyAttackRange: 48,
    enemyAttackCooldownMs: 920
  });
  function makeCombatConfig(overrides) { return Object.freeze({ ...DEFAULT_COMBAT, ...(overrides || {}) }); }
  function makeRunId(prefix, key) { return typeof global.AH_makeRunId === "function" ? global.AH_makeRunId(prefix, key) : String(prefix || "run") + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8); }
  global.AlphaSectorCombatConfig = Object.freeze({ DEFAULT_COMBAT, makeCombatConfig, makeRunId });
})(window);
