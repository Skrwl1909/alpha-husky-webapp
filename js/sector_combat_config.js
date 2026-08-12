// Small shared contract for direct-control sector prototypes.
(function (global) {
  "use strict";
  const DEFAULT_COMBAT = Object.freeze({
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
    cooldownMs: 6000,
    knockbackSpeed: 320,
    knockbackDurationMs: 180,
    vfxDurationMs: 280
  });
  function normalizeCombatProfile(value) {
    const raw = value && typeof value === "object" ? value : null;
    const positiveInt = candidate => Number.isSafeInteger(candidate) && candidate > 0 ? candidate : null;
    const maxHp = positiveInt(raw?.maxHp), meleeDamage = positiveInt(raw?.meleeDamage), howlDamage = positiveInt(raw?.howlDamage);
    const mitigation = Number(raw?.damageMitigation);
    if (!raw || raw.version !== 1 || !maxHp || !meleeDamage || !howlDamage || !Number.isFinite(mitigation) || mitigation < 0 || mitigation >= 1) return null;
    return Object.freeze({ version: 1, maxHp, meleeDamage, howlDamage, damageMitigation: mitigation, source: Object.freeze({ level: Math.max(1, Number(raw?.source?.level) || 1), equipmentApplied: raw?.source?.equipmentApplied === true }) });
  }
  function makeRunCombatSnapshot(profile) {
    const normalized = normalizeCombatProfile(profile);
    return normalized ? Object.freeze({ ...normalized, source: Object.freeze({ ...normalized.source }) }) : null;
  }
  function logActionCombatProfile(sectorId, profile, snapshot) {
    if (!global.DBG || !profile || !snapshot) return;
    try {
      console.debug("[ACTION_COMBAT_PROFILE]", {
        buildVersion: String(global.WEBAPP_VER || "unknown"),
        sectorId: String(sectorId || ""),
        backendResolvedProfile: {
          version: profile.version, maxHp: profile.maxHp, meleeDamage: profile.meleeDamage,
          howlDamage: profile.howlDamage, damageMitigation: profile.damageMitigation,
          sourceLevel: profile.source?.level, equipmentApplied: profile.source?.equipmentApplied === true,
        },
        runSnapshot: {
          version: snapshot.version, maxHp: snapshot.maxHp, meleeDamage: snapshot.meleeDamage,
          howlDamage: snapshot.howlDamage, damageMitigation: snapshot.damageMitigation,
        },
        snapshotCreated: true,
      });
    } catch (_) {}
  }
  function incomingPlayerDamage(rawDamage, snapshot) {
    const raw = Number(rawDamage);
    const mitigation = Number(snapshot?.damageMitigation);
    if (!Number.isFinite(raw) || raw <= 0 || !Number.isFinite(mitigation) || mitigation < 0 || mitigation >= 1) return null;
    return Math.max(1, Math.round(raw * (1 - mitigation)));
  }
  function makeCombatConfig(overrides) { return Object.freeze({ ...DEFAULT_COMBAT, ...(overrides || {}) }); }
  function makeRunId(prefix, key) { return typeof global.AH_makeRunId === "function" ? global.AH_makeRunId(prefix, key) : String(prefix || "run") + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8); }
  // Completion profiles validate the mandatory encounter composition. Optional
  // encounters still count for their own telemetry, but must never inflate the
  // type totals submitted as the mandatory composition.
  function recordEnemyKill(run, type, required) {
    if (!run || typeof run !== "object") return false;
    const counter = ({ chaser: "chasersKilled", shooter: "shootersKilled", sentinel: "sentinelKilled" })[String(type || "")];
    if (!counter) return false;
    if (required === true) {
      run[counter] = (Number(run[counter]) || 0) + 1;
      run.mandatoryEnemiesKilled = (Number(run.mandatoryEnemiesKilled) || 0) + 1;
    } else {
      run.optionalEnemiesKilled = (Number(run.optionalEnemiesKilled) || 0) + 1;
    }
    return true;
  }
  function getEnemyChildren(scene) {
    const enemies = scene?.ahEnemies;
    if (!enemies) return [];
    if (typeof enemies.getChildren !== "function") return [];
    const children = enemies.getChildren();
    return Array.isArray(children) ? children : [];
  }
  function getHowlCooldownRemaining(scene, time) { return Math.max(0, (scene?.ahNextHowlAt || 0) - (time || 0)); }
  // Action sectors may mix Arcade factory objects with ordinary GameObjects that own an attached Arcade Body.
  function setArcadeVelocity(target, x, y) {
    if (typeof target?.setVelocity === "function") { target.setVelocity(x, y); return true; }
    if (typeof target?.body?.setVelocity === "function") { target.body.setVelocity(x, y); return true; }
    return false;
  }
  function updateHowlKnockback(enemy, time) {
    if (!enemy?.active || enemy.ahCombat?.dead || !enemy.ahHowlKnockback) return false;
    if (time >= enemy.ahHowlKnockback.until) {
      delete enemy.ahHowlKnockback;
      return false;
    }
    return setArcadeVelocity(enemy, enemy.ahHowlKnockback.x, enemy.ahHowlKnockback.y);
  }
  function clearHowlBurstState(scene, resetCooldown = true) {
    if (!scene) return;
    if (resetCooldown) scene.ahNextHowlAt = 0;
    for (const enemy of getEnemyChildren(scene)) {
      if (!enemy?.ahHowlKnockback) continue;
      delete enemy.ahHowlKnockback;
      if (enemy.active && !enemy.ahCombat?.dead) setArcadeVelocity(enemy, 0, 0);
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
    const howlDamage = Number(scene?.ahRun?.combatSnapshot?.howlDamage);
    if (!Number.isSafeInteger(howlDamage) || howlDamage <= 0) return { activated: false, affected: 0, killed: 0 };
    scene.ahNextHowlAt = time + HOWL_BURST.cooldownMs;
    showHowlBurstVfx(scene, player);
    const radiusSq = HOWL_BURST.radius * HOWL_BURST.radius;
    let affected = 0, killed = 0;
    for (const enemy of getEnemyChildren(scene)) {
      if (!enemy?.active || enemy.ahCombat?.dead) continue;
      const dx = enemy.x - player.x, dy = enemy.y - player.y;
      if (dx * dx + dy * dy > radiusSq) continue;
      affected += 1;
      damageEnemy(scene, enemy, howlDamage);
      if (!enemy.active || enemy.ahCombat?.dead) { killed += 1; continue; }
      if (enemy.ahCombat?.howlKnockbackImmune === true) continue;
      const distance = Math.hypot(dx, dy), nx = distance ? dx / distance : 1, ny = distance ? dy / distance : 0;
      enemy.ahHowlKnockback = { x: nx * HOWL_BURST.knockbackSpeed, y: ny * HOWL_BURST.knockbackSpeed, until: time + HOWL_BURST.knockbackDurationMs };
      setArcadeVelocity(enemy, enemy.ahHowlKnockback.x, enemy.ahHowlKnockback.y);
    }
    return { activated: true, affected, killed };
  }
  global.AlphaSectorCombatConfig = Object.freeze({ DEFAULT_COMBAT, HOWL_BURST, makeCombatConfig, makeRunId, normalizeCombatProfile, makeRunCombatSnapshot, logActionCombatProfile, incomingPlayerDamage, recordEnemyKill, getEnemyChildren, getHowlCooldownRemaining, setArcadeVelocity, updateHowlKnockback, clearHowlBurstState, triggerHowlBurst });
})(window);
