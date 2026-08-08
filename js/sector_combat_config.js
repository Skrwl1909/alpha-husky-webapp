// Small shared contract for direct-control sector prototypes.
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
  const HOWL_BURST = Object.freeze({
    radius: 125,
    damage: 45,
    cooldownMs: 6000,
    knockbackSpeed: 320,
    knockbackDurationMs: 180,
    vfxDurationMs: 280
  });
  function makeCombatConfig(overrides) { return Object.freeze({ ...DEFAULT_COMBAT, ...(overrides || {}) }); }
  function makeRunId(prefix, key) { return typeof global.AH_makeRunId === "function" ? global.AH_makeRunId(prefix, key) : String(prefix || "run") + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8); }
  function getEnemyChildren(scene) {
    const enemies = scene?.ahEnemies;
    if (!enemies) return [];
    if (typeof enemies.getChildren !== "function") return [];
    const children = enemies.getChildren();
    return Array.isArray(children) ? children : [];
  }
  function getHowlCooldownRemaining(scene, time) { return Math.max(0, (scene?.ahNextHowlAt || 0) - (time || 0)); }
  function updateHowlKnockback(enemy, time) {
    if (!enemy?.active || enemy.ahCombat?.dead || !enemy.ahHowlKnockback) return false;
    if (time >= enemy.ahHowlKnockback.until) {
      delete enemy.ahHowlKnockback;
      return false;
    }
    enemy.setVelocity(enemy.ahHowlKnockback.x, enemy.ahHowlKnockback.y);
    return true;
  }
  function clearHowlBurstState(scene, resetCooldown = true) {
    if (!scene) return;
    if (resetCooldown) scene.ahNextHowlAt = 0;
    for (const enemy of getEnemyChildren(scene)) {
      if (!enemy?.ahHowlKnockback) continue;
      delete enemy.ahHowlKnockback;
      if (enemy.active && !enemy.ahCombat?.dead) enemy.setVelocity?.(0, 0);
    }
    for (const effect of scene.ahHowlVfx || []) {
      scene.tweens?.killTweensOf?.(effect);
      effect?.destroy?.();
    }
    scene.ahHowlVfx?.clear?.();
  }
  function showHowlBurstVfx(scene, player) {
    if (!scene?.add || !player?.active) return;
    scene.ahHowlVfx ||= new Set();
    const ring = scene.add.circle(player.x, player.y, 30, 0x8cefff, 0.08).setStrokeStyle(4, 0xc9fbff, 0.98).setDepth(49);
    const core = scene.add.circle(player.x, player.y, 20, 0xe8fdff, 0.18).setStrokeStyle(2, 0x65e8ff, 0.78).setDepth(48);
    scene.ahHowlVfx.add(ring); scene.ahHowlVfx.add(core);
    const remove = effect => { scene.ahHowlVfx?.delete?.(effect); effect?.destroy?.(); };
    scene.tweens.add({ targets: ring, scaleX: HOWL_BURST.radius / 30, scaleY: HOWL_BURST.radius / 30, alpha: 0, duration: HOWL_BURST.vfxDurationMs, ease: "Quad.Out", onComplete: () => remove(ring) });
    scene.tweens.add({ targets: core, scaleX: 2.2, scaleY: 2.2, alpha: 0, duration: HOWL_BURST.vfxDurationMs, ease: "Quad.Out", onComplete: () => remove(core) });
  }
  function triggerHowlBurst(scene, time, damageEnemy) {
    const player = scene?.ahPlayer;
    if (!player?.active || typeof damageEnemy !== "function" || getHowlCooldownRemaining(scene, time) > 0) return { activated: false, affected: 0, killed: 0 };
    scene.ahNextHowlAt = time + HOWL_BURST.cooldownMs;
    showHowlBurstVfx(scene, player);
    const radiusSq = HOWL_BURST.radius * HOWL_BURST.radius;
    let affected = 0, killed = 0;
    for (const enemy of getEnemyChildren(scene)) {
      if (!enemy?.active || enemy.ahCombat?.dead) continue;
      const dx = enemy.x - player.x, dy = enemy.y - player.y;
      if (dx * dx + dy * dy > radiusSq) continue;
      affected += 1;
      damageEnemy(scene, enemy, HOWL_BURST.damage);
      if (!enemy.active || enemy.ahCombat?.dead) { killed += 1; continue; }
      const distance = Math.hypot(dx, dy), nx = distance ? dx / distance : 1, ny = distance ? dy / distance : 0;
      enemy.ahHowlKnockback = { x: nx * HOWL_BURST.knockbackSpeed, y: ny * HOWL_BURST.knockbackSpeed, until: time + HOWL_BURST.knockbackDurationMs };
      enemy.setVelocity(enemy.ahHowlKnockback.x, enemy.ahHowlKnockback.y);
    }
    return { activated: true, affected, killed };
  }
  global.AlphaSectorCombatConfig = Object.freeze({ DEFAULT_COMBAT, HOWL_BURST, makeCombatConfig, makeRunId, getEnemyChildren, getHowlCooldownRemaining, updateHowlKnockback, clearHowlBurstState, triggerHowlBurst });
})(window);
