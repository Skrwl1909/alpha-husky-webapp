// js/combat.js
// Alpha Husky — wspólny silnik obrażeń (Fortress + Dojo) zgodny z missions.py/stats.py
// Użycie:
// Combat.init({ seed, feedHook: window.Dojo?.feed, container: '#combat-ui' });
// const hit = Combat.rollHit(playerTotals, enemyObj); // tylko policz
// const res = Combat.strike(playerTotals, enemyRef); // policz + odejmij HP + (opcjonalnie) nakarm Dojo + animacja
(function (global) {
  'use strict';
  // --- Stałe 1:1 z missions.py (SOFT_HP["COMBAT"]) ---
  const CFG_DEF = {
    MAX_ROUNDS: 12,
    CRIT_BASE: 0.08,
    CRIT_PER_LUCK: 0.0025,
    CRIT_CAP: 0.35,
    DODGE_BASE: 0.08,
    DODGE_PER_AGI: 0.0020,
    DODGE_CAP: 0.35,
    DMG_VARIANCE: 0.12,
    DEF_MITIGATION: 0.55,
    MIN_DMG: 1,
    CRIT_MULT: 1.6,
    PEN_PER_INT: 0.010,
    PEN_CAP: 0.50,
    DODGE_REDUCTION_PER_INT: 0.0015,
    // soft-HP (przydatne w Fortress, nie wymagane w Dojo):
    HP_PLAYER: { BASE: 35, PER_DEF: 4, PER_VIT: 6, PER_LVL: 2, MIN: 30, MAX: 400 },
    HP_ENEMY: { FALLBACK_BASE: 28, FALLBACK_PER_DEF: 5, FALLBACK_PER_LVL: 6 }
  };
  // --- prosty RNG z opcjonalnym seedem (sfc32) ---
  function makeRng(seedStr) {
    if (!seedStr) return Math.random.bind(Math);
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    let a = h >>> 0, b = (h + 0x9e3779b9) >>> 0, c = (h + 0x85ebca6b) >>> 0, d = (h + 0xc2b2ae35) >>> 0;
    return function sfc32() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      let t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      t = (t + d) | 0;
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  // --- stan modułu ---
  const S = {
    cfg: { ...CFG_DEF },
    rng: Math.random,
    feedHook: null, // np. window.Dojo.feed
    container: null // element root dla animacji (np. '#combat-ui')
  };
  // --- utils ---
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pick = (o, k, d=0) => (o && o[k] != null) ? +o[k] : d;
  // akceptuj long i short keys; zwróć long
  function normalizeAttacker(stats) {
    stats = stats || {};
    const s = (k, alt) => pick(stats, k, pick(stats, alt, 0));
    return {
      // long keys zgodnie ze stats.py
      strength: s('strength','str'),
      agility: s('agility','agi'),
      defense: s('defense','def'),
      luck: s('luck'),
      vitality: s('vitality','vit'),
      intelligence: s('intelligence','int'),
      level: s('level', 'lvl')
    };
  }
  // target: { hp?, defense, level?, dodge_base_override?, resist_pct? }
  function normalizeTarget(t) {
    t = t || {};
    return {
      hp: Math.max(0, +pick(t,'hp',0)),
      defense: Math.max(0, +pick(t,'defense','def',0)),
      level: +pick(t,'level',1),
      dodge_base_override: (t.dodge_base_override != null ? +t.dodge_base_override : null),
      resist_pct: clamp(+pick(t,'resist_pct',0), 0, 0.95)
    };
  }
  function withVariance(amount) {
    const v = +S.cfg.DMG_VARIANCE || 0;
    const r = S.rng() * 2 - 1; // [-1..1)
    return amount * (1 + r * v);
  }
  function critChance(luck) {
    return clamp(S.cfg.CRIT_BASE + luck * S.cfg.CRIT_PER_LUCK, 0, S.cfg.CRIT_CAP);
  }
  function dodgeChance(agi) {
    return clamp(S.cfg.DODGE_BASE + agi * S.cfg.DODGE_PER_AGI, 0, S.cfg.DODGE_CAP);
  }
  function enemyDodgeEffective(playerInt, baseOverride=null) {
    const base = (baseOverride != null) ? baseOverride : dodgeChance(0 /*wróg bez AGI*/);
    return clamp(base - playerInt * S.cfg.DODGE_REDUCTION_PER_INT, 0, 1);
  }
  function penetrationFromInt(intelligence) {
    return clamp(intelligence * S.cfg.PEN_PER_INT, 0, S.cfg.PEN_CAP);
  }
  // --- public helpers: soft-HP liczone jak w missions.py ---
  function computePlayerMaxHp(totals, level=1) {
    const t = normalizeAttacker(totals);
    const C = S.cfg.HP_PLAYER;
    const hp = C.BASE + t.defense * C.PER_DEF + t.vitality * C.PER_VIT + (level||t.level||1) * C.PER_LVL;
    return clamp(Math.floor(hp), C.MIN, C.MAX);
  }
  function computeEnemyMaxHp(enemy) {
    const e = normalizeTarget(enemy);
    if (enemy && typeof enemy.hp === 'number' && enemy.hp > 0) return Math.max(1, Math.floor(enemy.hp));
    const C = S.cfg.HP_ENEMY;
    const hp = C.FALLBACK_BASE + e.defense * C.FALLBACK_PER_DEF + (e.level||1) * C.FALLBACK_PER_LVL;
    return Math.max(1, Math.floor(hp));
  }
  // --- Animacje: Tworzenie latającego dmg number ---
  function createDamageNumber(x, y, damage, isCrit = false) {
    if (!S.container) return; // Brak container – pomiń animację
    const dmgEl = document.createElement('div');
    dmgEl.className = 'damage-number';
    if (isCrit) dmgEl.classList.add('crit-damage');
    dmgEl.textContent = isCrit ? `CRIT! ${damage}` : damage;
    dmgEl.style.left = x + 'px';
    dmgEl.style.top = y + 'px';
    
    S.container.appendChild(dmgEl);
    
    // Usuń po animacji
    setTimeout(() => dmgEl.remove(), 1000);
    
    // Haptic feedback dla Telegram
    try {
      const tg = window.Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(isCrit ? 'heavy' : 'light');
      }
    } catch {}
  }
  // --- Funkcja do animacji shake na target (wywołać z UI elementu) ---
  function animateTargetShake(targetEl) {
    if (!targetEl) return;
    targetEl.classList.add('attack-shake', 'hit-impact');
    setTimeout(() => targetEl.classList.remove('attack-shake', 'hit-impact'), 400);
  }
  // --- GŁÓWNE API: przepis na trafienie dokładnie jak missions.py (soft-HP) ---
  function rollHit(attackerTotals, targetStats, ctx={}) {
    const att = normalizeAttacker(attackerTotals);
    const tgt = normalizeTarget(targetStats);
    // 1) unik wroga po redukcji INT gracza
    const eDodgeEff = enemyDodgeEffective(att.intelligence, tgt.dodge_base_override);
    // 2) czy unik
    const dodged = (S.rng() < eDodgeEff);
    // 3) surowe obrażenia = strength ± wariancja
    const raw = withVariance(+att.strength);
    // 4) efektywna obrona po penetracji z INT
    const pen = penetrationFromInt(att.intelligence);
    const enemyDefEff = tgt.defense * (1 - pen);
    // 5) mitigacja przez DEF
    let mitigated = raw - enemyDefEff * S.cfg.DEF_MITIGATION;
    // 6) CRIT z LUCK
    let isCrit = false;
    if (!dodged && (S.rng() < critChance(att.luck))) {
      mitigated *= S.cfg.CRIT_MULT;
      isCrit = true;
    }
    // 7) clamp do MIN_DMG i floor
    let dmg = Math.max(S.cfg.MIN_DMG, Math.floor(mitigated));
    if (dodged) dmg = 0;
    // 8) opcjonalna rezystancja % (jeśli chcesz w Fortress)
    if (!dodged && tgt.resist_pct) {
      dmg = Math.max(S.cfg.MIN_DMG, Math.floor(dmg * (1 - tgt.resist_pct)));
    }
    return {
      dmg,
      isCrit,
      dodged,
      rolls: {
        raw,
        enemyDefEff,
        mitigated: Math.max(0, mitigated),
        pen,
        critChance: critChance(att.luck),
        enemyDodge: eDodgeEff
      },
      att, tgt, ctx
    };
  }
  // odejmij HP celu i (opcjonalnie) nakarm Dojo (feedHook)
  function applyHit(targetRef, hit, { feed=true, animate=true } = {}) {
    if (!targetRef) return 0;
    const before = Math.max(0, +targetRef.hp || 0);
    const dealt = Math.min(before, Math.max(0, hit.dmg|0));
    targetRef.hp = Math.max(0, before - dealt);
    if (feed && S.feedHook && dealt > 0) {
      try { S.feedHook(dealt, !!hit.isCrit); } catch {}
    }
    // Animacja dmg number (jeśli enabled i container)
    if (animate && dealt > 0 && S.container && hit.ctx?.targetEl) {
      const rect = hit.ctx.targetEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const containerRect = S.container.getBoundingClientRect();
      createDamageNumber(
        x - containerRect.left, 
        y - containerRect.top, 
        dealt, 
        hit.isCrit
      );
      // Shake na target
      animateTargetShake(hit.ctx.targetEl);
    }
    return dealt;
  }
  // policz + zastosuj
  function strike(attackerTotals, targetRef, ctx = {}) {
    const hit = rollHit(attackerTotals, targetRef, ctx);
    const dealt = applyHit(targetRef, hit, { feed: true, animate: true });
    return { ...hit, dealt, targetHp: targetRef.hp };
  }
  // init/konfiguracja
  function init(opts={}) {
    if (opts.cfg) S.cfg = { ...CFG_DEF, ...opts.cfg };
    if (opts.seed !== undefined) S.rng = makeRng(String(opts.seed));
    if (opts.feedHook) S.feedHook = opts.feedHook;
    if (opts.container) {
      S.container = typeof opts.container === 'string' 
        ? document.querySelector(opts.container) 
        : opts.container;
    }
    return Combat;
  }
  const Combat = {
    init, rollHit, applyHit, strike,
    computePlayerMaxHp, computeEnemyMaxHp,
    cfg: () => ({ ...S.cfg }),
    // Publiczne dla UI: createDamageNumber, animateTargetShake (jeśli potrzeba poza strike)
    createDamageNumber,
    animateTargetShake
  };
  global.Combat = Combat;
})(window);
