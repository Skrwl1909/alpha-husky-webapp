(function (global) {
  const BloodMoonPixi = {};

  let _host = null;
  let _app = null;
  let _opts = {};
  let _resizeHandler = null;
  let _tick = null;
  let _scene = null;

  const VER = "bloodmoon_pixi.js v3-p11-4-combat-impact-2026-10-08";
  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  const CLOUD_TX_512 = "f_auto,q_auto,w_512,c_fit";
  const CLOUD_TX_768 = "f_auto,q_auto,w_768,c_fit";
  const BOSS_CLOUD_BASE = `${CLOUD_BASE}/${CLOUD_TX_768}/v1771238762/bosses`;

  const BLOODMOON_ENEMY_REGISTRY = Object.freeze({
    tower_husk: Object.freeze({
      id: "tower_husk", displayName: "Tower Husk", waveMin: 1, waveMax: 3, personality: "fast_unstable",
      anchor: Object.freeze({ x: 0.5, y: 0.916667 }),
      states: Object.freeze({
        idle: "/assets/bloodmoon/v3/enemies/tower_husk/idle.webp",
        attack: "/assets/bloodmoon/v3/enemies/tower_husk/attack.webp",
        hit: "/assets/bloodmoon/v3/enemies/tower_husk/hit.webp",
        defeat: "/assets/bloodmoon/v3/enemies/tower_husk/defeat.webp",
      }),
    }),
    echo_revenant: Object.freeze({
      id: "echo_revenant", displayName: "Echo Revenant", waveMin: 4, waveMax: 6, personality: "controlled_displaced",
      anchor: Object.freeze({ x: 0.5, y: 0.916667 }),
      states: Object.freeze({
        idle: "/assets/bloodmoon/v3/enemies/echo_revenant/idle.webp",
        attack: "/assets/bloodmoon/v3/enemies/echo_revenant/attack.webp",
        hit: "/assets/bloodmoon/v3/enemies/echo_revenant/hit.webp",
        defeat: "/assets/bloodmoon/v3/enemies/echo_revenant/defeat.webp",
      }),
    }),
    lunar_myrmidon: Object.freeze({
      id: "lunar_myrmidon", displayName: "Lunar Myrmidon", waveMin: 7, waveMax: 9, personality: "heavy_brutal",
      anchor: Object.freeze({ x: 0.5, y: 0.916667 }),
      states: Object.freeze({
        idle: "/assets/bloodmoon/v3/enemies/lunar_myrmidon/idle.webp",
        attack: "/assets/bloodmoon/v3/enemies/lunar_myrmidon/attack.webp",
        hit: "/assets/bloodmoon/v3/enemies/lunar_myrmidon/hit.webp",
        defeat: "/assets/bloodmoon/v3/enemies/lunar_myrmidon/defeat.webp",
      }),
    }),
    phase_knight: Object.freeze({
      id: "phase_knight", displayName: "The Phase Knight", waveMin: 10, waveMax: 10, personality: "calm_precise",
      anchor: Object.freeze({ x: 0.5, y: 0.953 }),
      states: Object.freeze({
        idle: "/assets/bloodmoon/v3/enemies/phase_knight/idle.webp",
        attack: "/assets/bloodmoon/v3/enemies/phase_knight/attack.webp",
        hit: "/assets/bloodmoon/v3/enemies/phase_knight/hit.webp",
        phase_shift: "/assets/bloodmoon/v3/enemies/phase_knight/phase_shift.webp",
        defeat: "/assets/bloodmoon/v3/enemies/phase_knight/defeat.webp",
      }),
    }),
  });

  try { global.__BLOODMOON_PIXI_VER__ = VER; } catch (_) {}

  function dbg(...args) {
    if (_opts.dbg) console.log("[BloodMoonPixi]", ...args);
  }

  function num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function pct(v, max) {
    const m = Math.max(1, num(max, 1));
    return clamp((num(v, 0) / m) * 100, 0, 100);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    const x = clamp(t, 0, 1);
    return 1 - Math.pow(1 - x, 3);
  }

  function easeInOutQuad(t) {
    const x = clamp(t, 0, 1);
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  function easeInCubic(t) {
    const x = clamp(t, 0, 1);
    return x * x * x;
  }

  function easeOutBack(t, overshoot = 1.15) {
    const x = clamp(t, 0, 1);
    const c1 = overshoot;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function resolveHitStopSec(plan, turn = null) {
    const kind = String(turn?.kind || "").toLowerCase();
    let sec =
      plan?.waveBreak || turn?.defeat ? 0.112 :
      plan?.hasCrit || kind === "crit" ? 0.096 :
      plan?.damageTier === "heavy" ? 0.082 :
      plan?.damageTier === "medium" ? 0.074 :
      0.060;
    if (plan?.perfLite) sec *= 0.68;
    return sec;
  }

  function resolveContactPoint(layout) {
    const width = Math.max(320, num(layout?.width, 320));
    const height = Math.max(220, num(layout?.height, 220));
    const playerX = num(layout?.playerX, width * 0.26);
    const enemyX = num(layout?.enemyX, width * 0.77);
    const playerY = num(layout?.playerY, height * 0.54);
    const enemyY = num(layout?.enemyY, height * 0.52);
    return {
      x: Math.round(clamp(lerp(playerX, enemyX, 0.64), width * 0.38, width * 0.72)),
      y: Math.round(clamp(lerp(playerY, enemyY, 0.55) - height * 0.18, height * 0.27, height * 0.44)),
    };
  }

  function resolveImpactIntensity(plan, turn = null) {
    const kind = String(turn?.kind || "").toLowerCase();
    const crit = plan?.hasCrit || kind === "crit";
    const finisher = plan?.waveBreak || !!turn?.defeat;
    const tier =
      finisher ? 1.32 :
      crit ? 1.22 :
      plan?.damageTier === "heavy" ? 1.13 :
      plan?.damageTier === "medium" ? 1.02 :
      0.90;
    return { crit, finisher, tier };
  }

  function uniqueStrings(rows) {
    return Array.from(new Set((Array.isArray(rows) ? rows : []).map(imageSourceValue).map((x) => String(x || "").trim()).filter(Boolean)));
  }

  function imageSourceValue(raw) {
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    if (typeof raw === "object") {
      return (
        raw.url ||
        raw.img ||
        raw.src ||
        raw.assetUrl ||
        raw.image ||
        raw.path ||
        raw.key ||
        ""
      );
    }
    return "";
  }

  function hasPixi() {
    const P = global.PIXI;
    return !!(P && P.Application && P.Graphics && P.Container && P.Sprite);
  }

  function viewOf(app) {
    return app?.canvas || app?.view || null;
  }

  function makeText(text, style) {
    const P = global.PIXI;
    try {
      return new P.Text(text, style);
    } catch (_) {
      return new P.Text({ text, style });
    }
  }

  function setAnchor(node, x = 0.5, y = x) {
    try { node.anchor?.set?.(x, y); } catch (_) {}
  }

  function clearDraw(g) {
    try { g.clear(); } catch (_) {}
  }

  function roundRect(g, x, y, w, h, r, color, alpha = 1, lineColor = null, lineAlpha = alpha, lineWidth = 0) {
    clearDraw(g);
    if (lineWidth > 0) {
      try { g.lineStyle(lineWidth, lineColor == null ? color : lineColor, lineAlpha); } catch (_) {}
    }
    try {
      g.beginFill(color, alpha);
      g.drawRoundedRect(x, y, w, h, r);
      g.endFill();
    } catch (_) {}
  }

  function circle(g, x, y, r, color, alpha = 1, lineColor = null, lineAlpha = alpha, lineWidth = 0) {
    clearDraw(g);
    if (lineWidth > 0) {
      try { g.lineStyle(lineWidth, lineColor == null ? color : lineColor, lineAlpha); } catch (_) {}
    }
    try {
      g.beginFill(color, alpha);
      g.drawCircle(x, y, r);
      g.endFill();
    } catch (_) {}
  }

  function resolveSize(host) {
    const rect = host?.getBoundingClientRect?.() || {};
    return {
      width: Math.max(320, Math.round(rect.width || host?.clientWidth || 320)),
      height: Math.max(220, Math.round(rect.height || host?.clientHeight || 220)),
    };
  }

  async function createApp(host) {
    const P = global.PIXI;
    const size = resolveSize(host);
    const opts = {
      width: size.width,
      height: size.height,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(global.devicePixelRatio || 1, 2),
    };

    if (P.Application?.prototype?.init) {
      const app = new P.Application();
      await app.init(opts);
      return app;
    }

    return new P.Application(opts);
  }

  function normalizeUrl(raw) {
    const s = String(imageSourceValue(raw) || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("//")) return `https:${s}`;
    if (s.startsWith("/")) return s;
    return `/${s.replace(/^\.?\//, "")}`;
  }

  function cloudThumb(url, size = 512) {
    const src = normalizeUrl(url);
    if (!src) return "";
    if (!src.includes("/image/upload/")) return src;
    const tx = `f_auto,q_auto,w_${Math.max(128, Math.round(size))},c_fit`;
    if (src.includes(`/image/upload/${tx}/`)) return src;
    return src.replace("/image/upload/", `/image/upload/${tx}/`);
  }

  function avatarCloudUrlFromMaybe(raw) {
    const s = String(imageSourceValue(raw) || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return cloudThumb(s, 512);

    let filename = s.replace(/\\/g, "/");
    if (filename.includes("/")) filename = filename.split("/").pop() || "";
    filename = filename.trim();
    if (!filename) return "";

    if (!/\.[a-z0-9]+$/i.test(filename)) filename = `${filename}.png`;

    const dot = filename.lastIndexOf(".");
    const stem = dot >= 0 ? filename.slice(0, dot) : filename;
    const ext = dot >= 0 ? filename.slice(dot) : ".png";
    const normalized = stem.startsWith("avatar_") ? `${stem}${ext}` : `avatar_${stem}${ext}`;
    return `${CLOUD_BASE}/${CLOUD_TX_512}/avatars/${encodeURIComponent(normalized)}`;
  }

  function profileSnapshot() {
    const p =
      global.__PROFILE__ ||
      global.lastProfile ||
      global.profileState ||
      global._profile ||
      global.PROFILE ||
      null;
    return p && typeof p === "object" ? p : {};
  }

  function resolveBloodMoonPlayerAsset(battle) {
    const p = profileSnapshot();
    const skinEl = global.document?.getElementById?.("player-skin");
    const activeSkinDom = String(skinEl?.currentSrc || skinEl?.src || "").trim();

    const normalizeCandidate = (x) => {
      const src = String(x || "").trim();
      if (!src) return "";
      if (src.includes("res.cloudinary.com")) return cloudThumb(src, 512);
      return normalizeUrl(src);
    };

    // Blood Moon is a combat scene: always prefer the actual equipped character
    // skin. Profile/Telegram avatars are emergency-only fallbacks.
    const skinCandidates = uniqueStrings([
      activeSkinDom,
      imageSourceValue(battle?.player?.skin),
      battle?.player?.skinUrl,
      typeof p?.skin === "string" ? p.skin : p?.skin?.img,
      typeof p?.activeSkin === "string" ? p.activeSkin : p?.activeSkin?.img,
    ]).map(normalizeCandidate);

    const characterCandidates = uniqueStrings([
      battle?.player?.sprite,
      battle?.player?.assetUrl,
      battle?.player?.image,
      battle?.player?.img,
      p?.heroImg,
      p?.heroPng,
      p?.character,
      p?.characterPng,
      "/assets/skins/lunarhowl_skin.webp",
    ]).map(normalizeCandidate);

    const avatarCandidates = uniqueStrings([
      imageSourceValue(battle?.player?.avatar),
      battle?.player?.avatarUrl,
      battle?.player?.avatar_key,
      battle?.player?.avatarKey,
      p?.avatarUrl,
      p?.avatarPng,
      p?.profileAvatar,
      p?.avatarImg,
      p?.avatarKey,
      p?.avatar?.img,
      p?.avatar?.key,
    ]).map(avatarCloudUrlFromMaybe);

    const tgPhoto = String(global.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || "").trim();
    if (tgPhoto) avatarCandidates.push(tgPhoto);

    return uniqueStrings([...skinCandidates, ...characterCandidates, ...avatarCandidates]);
  }

  function resolveBloodMoonEnemyKey(battle) {
    const wave = Math.max(1, num(battle?.wave || battle?.enemy?.wave, 1));
    if (wave >= 10) return "phase_knight";
    if (wave >= 7) return "lunar_myrmidon";
    if (wave >= 4) return "echo_revenant";
    return "tower_husk";
  }

  function resolveBloodMoonEnemyDefinition(battle) {
    const key = resolveBloodMoonEnemyKey(battle);
    return BLOODMOON_ENEMY_REGISTRY[key] || BLOODMOON_ENEMY_REGISTRY.tower_husk;
  }

  function resolveBloodMoonEnemyStateAsset(battle, state = "idle") {
    const def = resolveBloodMoonEnemyDefinition(battle);
    const wanted = String(state || "idle").trim().toLowerCase();
    return def?.states?.[wanted] || def?.states?.idle || "";
  }

  function resolveBloodMoonEnemyAsset(battle, state = "idle") {
    const key = resolveBloodMoonEnemyKey(battle);
    const dedicated = resolveBloodMoonEnemyStateAsset(battle, state);
    const directFallbacks = uniqueStrings([
      battle?.enemy?.sprite,
      battle?.enemy?.assetUrl,
      battle?.enemy?.image,
      battle?.enemy?.img,
      battle?.enemySprite,
    ]).map((x) => {
      const src = String(x || "").trim();
      if (!src) return "";
      if (src.includes("res.cloudinary.com")) return cloudThumb(src, 768);
      return normalizeUrl(src);
    });
    return uniqueStrings([
      dedicated,
      ...directFallbacks,
      BOSS_CLOUD_BASE + "/" + key + ".png",
      BOSS_CLOUD_BASE + "/phase_knight.png",
      BOSS_CLOUD_BASE + "/lunar_myrmidon.png",
      BOSS_CLOUD_BASE + "/echo_revenant.png",
      "/assets/skins/raider_warlord.webp",
      "/assets/skins/lunarhowl_skin.webp",
    ]);
  }

  function hashString32(input) {
    const text = String(input || "");
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function rand() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function normalizedBattleTurns(battle) {
    const raw = Array.isArray(battle?.turns) ? battle.turns : (Array.isArray(battle?.events) ? battle.events : []);
    const leftHpStart = Math.max(0, num(battle?.left?.hpStart ?? battle?.player?.hpStart ?? battle?.player?.hpMax, 0));
    const rightHpStart = Math.max(0, num(battle?.right?.hpStart ?? battle?.enemy?.hpBefore ?? battle?.enemy?.hpMax, 0));
    let leftHp = leftHpStart;
    let rightHp = rightHpStart;

    if (raw.length) {
      return raw.filter(Boolean).map((row, idx) => {
        let kind = String(row?.kind || row?.type || "hit").trim().toLowerCase();
        if (kind === "evade") kind = "miss";
        if (!["hit","crit","block","heal","miss","tick","finish"].includes(kind)) kind = "hit";

        const actor = row?.actor === "right" ? "right" : "left";
        const target = row?.target === "left" ? "left" : "right";
        const value = Math.max(0, num(row?.value ?? row?.amount ?? row?.damage ?? 0, 0));

        const leftRaw = row?.leftHpAfter ?? row?.left_hp_after;
        const rightRaw = row?.rightHpAfter ?? row?.right_hp_after;
        const targetRaw = row?.targetHpAfter ?? row?.target_hp_after;
        const selfRaw = row?.selfHpAfter ?? row?.self_hp_after;

        let nextLeft = Number.isFinite(Number(leftRaw)) ? Math.max(0, Number(leftRaw)) : null;
        let nextRight = Number.isFinite(Number(rightRaw)) ? Math.max(0, Number(rightRaw)) : null;

        if (Number.isFinite(Number(targetRaw))) {
          if (target === "left" && nextLeft == null) nextLeft = Math.max(0, Number(targetRaw));
          if (target === "right" && nextRight == null) nextRight = Math.max(0, Number(targetRaw));
        }
        if (Number.isFinite(Number(selfRaw))) {
          if (actor === "left" && nextLeft == null) nextLeft = Math.max(0, Number(selfRaw));
          if (actor === "right" && nextRight == null) nextRight = Math.max(0, Number(selfRaw));
        }

        if (nextLeft != null) leftHp = nextLeft;
        if (nextRight != null) rightHp = nextRight;

        const defeat = !!row?.defeat || (target === "right" && nextRight != null && nextRight <= 0) || (target === "left" && nextLeft != null && nextLeft <= 0);
        return {
          turn: Math.max(1, num(row?.turn ?? row?.t ?? (idx + 1), idx + 1)),
          actor,
          target,
          kind,
          value,
          defeat,
          leftHpAfter: nextLeft,
          rightHpAfter: nextRight,
          leftHpKnown: nextLeft != null,
          rightHpKnown: nextRight != null,
        };
      });
    }

    return [{
      turn: 1,
      actor: "left",
      target: "right",
      kind: battle?.attack?.crit ? "crit" : "hit",
      value: Math.max(0, num(battle?.attack?.damage, 0)),
      defeat: Math.max(0, num(battle?.enemy?.hpAfter, 1)) <= 0,
      leftHpAfter: null,
      rightHpAfter: Math.max(0, num(battle?.enemy?.hpAfter, 0)),
      leftHpKnown: false,
      rightHpKnown: Number.isFinite(Number(battle?.enemy?.hpAfter)),
    }];
  }

  const CHOREOGRAPHIES = Object.freeze([
    "crescent_rush",
    "breach_strike",
    "double_impact",
    "phantom_feint",
    "lunar_crash",
    "pursuit_cut",
  ]);

  function planBattlePresentation(battle) {
    const battleId = String(battle?.battleId || battle?.id || battle?.commandId || [battle?.wave, battle?.ts, battle?.attack?.damage].join(":"));
    const seed = hashString32(battleId);
    const rand = mulberry32(seed);
    const turns = normalizedBattleTurns(battle);
    const wave = Math.max(1, num(battle?.wave || battle?.enemy?.wave, 1));
    const enemyDef = resolveBloodMoonEnemyDefinition(battle);
    const damage = Math.max(0, num(battle?.attack?.damage, turns.reduce((sum,row)=>sum + (row.actor === "left" ? row.value : 0), 0)));
    const hpMax = Math.max(1, num(battle?.enemy?.hpMax, battle?.enemy?.hpBefore || 1));
    const damageTier = damage / hpMax >= 0.24 ? "heavy" : damage / hpMax >= 0.10 ? "medium" : "light";
    const hasCrit = !!battle?.attack?.crit || turns.some(row => row.kind === "crit");
    const waveBreak = Math.max(0, num(battle?.enemy?.hpAfter, 1)) <= 0 || turns.some(row => row.defeat && row.target === "right");
    const family = CHOREOGRAPHIES[Math.floor(rand() * CHOREOGRAPHIES.length)] || CHOREOGRAPHIES[0];
    const perfLite = !!global.document?.documentElement?.classList?.contains("ah-perf-lite") ||
      !!global.document?.body?.classList?.contains("ah-perf-lite") ||
      !!global.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const compactTurns = Math.max(0, turns.length - 1);
    const baseTotal = Math.min(
      perfLite ? 3.0 : 4.4,
      Math.max(
        perfLite ? 1.95 : 2.15,
        1.92 + compactTurns * (perfLite ? 0.38 : 0.46) + (hasCrit ? 0.12 : 0) + (waveBreak ? 0.30 : 0)
      )
    );
    const primaryHitStop = resolveHitStopSec({ perfLite, hasCrit, waveBreak, damageTier });
    const total = baseTotal + primaryHitStop;
    const impactAt = Math.max(0.82, Math.min(baseTotal * 0.40, 1.10));
    const settleAt = Math.max(impactAt + primaryHitStop + 0.62, baseTotal * 0.80 + primaryHitStop);
    return {
      battleId,
      seed,
      family,
      turns,
      wave,
      enemyDef,
      personality: enemyDef?.personality || "fast_unstable",
      damage,
      damageTier,
      hasCrit,
      waveBreak,
      finalBoss: wave >= 10,
      perfLite,
      total,
      impactAt,
      settleAt,
      primaryHitStop,
    };
  }

  function enemyPoseForTime(plan, t) {
    if (!plan) return "idle";
    if (plan.waveBreak && t >= plan.settleAt) return "defeat";
    if (plan.finalBoss && plan.family === "phantom_feint" && t > plan.impactAt * 0.45 && t < plan.impactAt * 0.9) return "phase_shift";
    if (t > plan.impactAt - 0.08 && t < plan.impactAt + 0.34) return "hit";
    const counter = plan.turns.find(row => row.actor === "right" && row.kind !== "miss");
    if (counter && t > plan.impactAt + 0.45 && t < plan.impactAt + 0.95) return "attack";
    return "idle";
  }

  async function loadTextureSafeMany(urls) {
    if (!hasPixi()) return null;
    const P = global.PIXI;
    const list = uniqueStrings(urls);

    for (const url of list) {
      try {
        let tex = null;
        if (P.Assets?.load) {
          const out = await P.Assets.load(url);
          tex = out?.texture || out || null;
        }

        if (!tex && P.Texture?.from) {
          tex = P.Texture.from(url);
        }

        if (tex?.baseTexture || tex?.source || tex?.width != null) return tex;
      } catch (err) {
        dbg("texture load failed", url, err);
      }
    }

    return null;
  }

  function fitSprite(sprite, maxW, maxH, align = "bottom") {
    if (!sprite || !sprite.texture) return;
    const texW = num(sprite.texture.width || sprite.texture.orig?.width, 0);
    const texH = num(sprite.texture.height || sprite.texture.orig?.height, 0);
    if (texW <= 0 || texH <= 0) return;

    const scale = Math.min(maxW / texW, maxH / texH);
    const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    sprite.scale?.set?.(safeScale);
    if (align === "center") {
      setAnchor(sprite, 0.5, 0.5);
    } else {
      setAnchor(sprite, 0.5, 1);
    }
  }

  function resetSceneState() {
    if (!_scene) return;
    _scene.animating = false;
    _scene.playTime = 0;
    _scene.hpDisplay = _scene.afterHp;
    _scene.damageText.alpha = 0;
    _scene.critText.alpha = 0;
    _scene.hapticImpactDone = false;
    _scene.hapticFinishDone = false;
    _scene.plan = null;
    _scene.enemyPose = "idle";
    if (_scene.enemyTextures?.idle) _scene.enemySprite.texture = _scene.enemyTextures.idle;
    _scene.enemy.alpha = 1;
    _scene.enemy.rotation = 0;
    if (_app?.stage) { _app.stage.x = 0; _app.stage.y = 0; }
    _scene.impactSlash.alpha = 0;
    _scene.impactBurst.alpha = 0;
    _scene.impactRing.alpha = 0;
    _scene.secondaryRing.alpha = 0;
    _scene.stageFlash.alpha = 0;
  }

  function destroy() {
    try {
      if (_resizeHandler) global.removeEventListener("resize", _resizeHandler);
    } catch (_) {}
    _resizeHandler = null;

    try {
      if (_app && _tick) _app.ticker?.remove?.(_tick);
    } catch (_) {}
    _tick = null;

    const view = viewOf(_app);
    try { view?.remove?.(); } catch (_) {}
    try { _app?.destroy?.(true, { children: true, texture: false, baseTexture: false }); } catch (_) {}

    _host = null;
    _app = null;
    _scene = null;
  }

  function stop() {
    resetSceneState();
    renderDynamic();
  }

  function buildScene() {
    const P = global.PIXI;
    const stage = _app.stage;
    stage.removeChildren();

    const bg = new P.Graphics();
    const haze = new P.Graphics();
    const moon = new P.Graphics();
    const stars = new P.Graphics();
    const floor = new P.Graphics();
    const stageFlash = new P.Graphics();

    const hpBack = new P.Graphics();
    const hpGhost = new P.Graphics();
    const hpFill = new P.Graphics();
    const hpText = makeText("", { fontFamily: "system-ui", fontSize: 11, fill: 0xf7dfe6, fontWeight: "800" });
    setAnchor(hpText, 0.5, 0.5);

    const player = new P.Container();
    const playerShadow = new P.Graphics();
    const playerAura = new P.Graphics();
    const playerPlate = new P.Graphics();
    const playerFallback = new P.Graphics();
    const playerSprite = new P.Sprite(P.Texture.WHITE);
    playerSprite.visible = false;
    playerSprite.tint = 0xffffff;
    setAnchor(playerSprite, 0.5, 1);
    player.addChild(playerShadow, playerAura, playerPlate, playerFallback, playerSprite);

    const enemy = new P.Container();
    const enemyShadow = new P.Graphics();
    const enemyAura = new P.Graphics();
    const enemyPlate = new P.Graphics();
    const enemyFallback = new P.Graphics();
    const enemySprite = new P.Sprite(P.Texture.WHITE);
    enemySprite.visible = false;
    enemySprite.tint = 0xffffff;
    setAnchor(enemySprite, 0.5, 1);
    enemy.addChild(enemyShadow, enemyAura, enemyPlate, enemyFallback, enemySprite);

    const waveBadge = makeText("W1", { fontFamily: "system-ui", fontSize: 12, fill: 0xffffff, fontWeight: "900" });
    setAnchor(waveBadge, 0.5, 0.5);
    const enemyLabel = makeText("Blood-Moon", { fontFamily: "system-ui", fontSize: 13, fill: 0xffd2da, fontWeight: "800" });
    setAnchor(enemyLabel, 0.5, 0.5);

    const impactSlash = new P.Graphics();
    const impactBurst = new P.Graphics();
    const impactRing = new P.Graphics();
    const secondaryRing = new P.Graphics();
    const damageText = makeText("-0", { fontFamily: "system-ui", fontSize: 30, fill: 0xffffff, fontWeight: "950" });
    const critText = makeText("CRIT", { fontFamily: "system-ui", fontSize: 15, fill: 0xffe38d, fontWeight: "900" });
    setAnchor(damageText, 0.5, 0.5);
    setAnchor(critText, 0.5, 0.5);
    damageText.alpha = 0;
    critText.alpha = 0;

    stage.addChild(
      bg,
      stars,
      moon,
      haze,
      floor,
      player,
      enemy,
      hpBack,
      hpGhost,
      hpFill,
      hpText,
      waveBadge,
      enemyLabel,
      stageFlash,
      impactSlash,
      impactBurst,
      impactRing,
      secondaryRing,
      damageText,
      critText,
    );

    _scene = {
      bg,
      haze,
      moon,
      stars,
      floor,
      stageFlash,
      hpBack,
      hpGhost,
      hpFill,
      hpText,
      player,
      playerShadow,
      playerAura,
      playerPlate,
      playerFallback,
      playerSprite,
      enemy,
      enemyShadow,
      enemyAura,
      enemyPlate,
      enemyFallback,
      enemySprite,
      waveBadge,
      enemyLabel,
      impactSlash,
      impactBurst,
      impactRing,
      secondaryRing,
      damageText,
      critText,
      battle: null,
      playerTexture: null,
      enemyTexture: null,
      enemyTextures: {},
      plan: null,
      enemyPose: "idle",
      hapticImpactDone: false,
      hapticFinishDone: false,
      beforeHp: 1,
      afterHp: 1,
      hpMax: 1,
      hpDisplay: 1,
      damage: 0,
      crit: false,
      animating: false,
      playTime: 0,
      layout: {
        width: 0,
        height: 0,
        hpX: 0,
        hpY: 0,
        hpW: 0,
        hpH: 0,
        playerX: 0,
        playerY: 0,
        enemyX: 0,
        enemyY: 0,
        impactX: 0,
        impactY: 0,
      },
    };
  }

  function renderStatic() {
    if (!_scene || !_app || !_host) return;

    const size = resolveSize(_host);
    const w = size.width;
    const h = size.height;
    const hpW = Math.round(Math.min(w * 0.44, 280));
    const hpH = 12;

    _scene.layout = {
      width: w,
      height: h,
      hpX: Math.round((w - hpW) / 2),
      hpY: 22,
      hpW,
      hpH,
      playerX: Math.round(w * 0.26),
      playerY: Math.round(h * 0.54),
      enemyX: Math.round(w * 0.77),
      enemyY: Math.round(h * 0.52),
      impactX: Math.round(w * 0.54),
      impactY: Math.round(h * 0.33),
    };

    // Arena V3 DOM owns the environment. Pixi remains a transparent combat/VFX
    // layer so replay never replaces the approved raid background.
    clearDraw(_scene.bg);
    clearDraw(_scene.moon);
    clearDraw(_scene.haze);
    clearDraw(_scene.stars);
    clearDraw(_scene.floor);

    roundRect(_scene.hpBack, _scene.layout.hpX, _scene.layout.hpY, hpW, hpH, 999, 0x0f1522, 0.78, 0xffffff, 0.08, 1);
    _scene.hpText.x = Math.round(w / 2);
    _scene.hpText.y = _scene.layout.hpY - 9;

    clearDraw(_scene.playerShadow);
    try {
      _scene.playerShadow.beginFill(0x000000, 0.28);
      _scene.playerShadow.drawEllipse(0, 0, 54, 18);
      _scene.playerShadow.endFill();
    } catch (_) {}
    _scene.playerShadow.y = 0;

    clearDraw(_scene.playerAura);

    clearDraw(_scene.playerPlate); // no portrait/card plate behind combat skin
    roundRect(_scene.playerFallback, -42, -150, 84, 150, 20, 0x8a2032, 0.78, 0xffa2b3, 0.16, 2);

    clearDraw(_scene.enemyShadow);
    try {
      _scene.enemyShadow.beginFill(0x000000, 0.30);
      _scene.enemyShadow.drawEllipse(0, 0, 76, 22);
      _scene.enemyShadow.endFill();
    } catch (_) {}

    clearDraw(_scene.enemyAura);
    clearDraw(_scene.enemyPlate);
    roundRect(_scene.enemyFallback, -58, -174, 116, 174, 24, 0x4a1018, 0.88, 0xff98a7, 0.18, 2);

    const playerMaxW = Math.max(168, Math.round(w * 0.42));
    const playerMaxH = Math.max(220, Math.round(h * 0.86));
    const enemyMaxW = Math.max(215, Math.round(w * 0.48));
    const enemyMaxH = Math.max(238, Math.round(h * 0.90));

    if (_scene.playerTexture) {
      _scene.playerSprite.texture = _scene.playerTexture;
      fitSprite(_scene.playerSprite, playerMaxW, playerMaxH, "bottom");
      _scene.playerSprite.visible = true;
      _scene.playerFallback.alpha = 0;
    } else {
      _scene.playerSprite.visible = false;
      _scene.playerFallback.alpha = 0.82;
    }

    if (_scene.enemyTexture) {
      _scene.enemySprite.texture = _scene.enemyTexture;
      fitSprite(_scene.enemySprite, enemyMaxW, enemyMaxH, "bottom");
      _scene.enemySprite.visible = true;
      _scene.enemyFallback.alpha = 0;
    } else {
      _scene.enemySprite.visible = false;
      _scene.enemyFallback.alpha = 0.90;
    }

    _scene.waveBadge.text = `W${Math.max(1, num(_scene.battle?.wave || 1, 1))}`;
    _scene.waveBadge.x = _scene.layout.enemyX;
    _scene.waveBadge.y = Math.round(h * 0.17);

    _scene.enemyLabel.text = String(_scene.plan?.enemyDef?.displayName || _scene.battle?.enemy?.name || "Blood-Moon Wave");
    _scene.enemyLabel.x = _scene.layout.enemyX;
    _scene.enemyLabel.y = Math.round(h * 0.24);

    // Arena V3 owns wave/name/HP presentation. Keep legacy Pixi HUD hidden
    // so the cinematic layer does not duplicate the authoritative Arena HUD.
    _scene.hpBack.alpha = 0;
    _scene.hpGhost.alpha = 0;
    _scene.hpFill.alpha = 0;
    _scene.hpText.alpha = 0;
    _scene.waveBadge.alpha = 0;
    _scene.enemyLabel.alpha = 0;
  }


  function renderDynamic() {
    if (!_scene || !_app) return;

    const now = performance.now() * 0.001;
    const plan = _scene.plan;
    let currentTurn = null;
    let currentTurnIndex = -1;
    let currentTurnPhase = 0;

    const idleP = Math.sin(now * 1.8) * 3;
    const idleFactor = plan?.personality === "heavy_brutal" ? 1.8 : plan?.personality === "calm_precise" ? 1.5 : 3.0;
    const idleE = Math.sin(now * (plan?.personality === "controlled_displaced" ? 2.0 : 1.35) + 1.3) * idleFactor;

    let playerLunge = 0, playerLift = 0, playerTilt = 0, playerHitKick = 0;
    let enemyShakeX = 0, enemyShakeY = 0, enemySlam = 0, enemyDrift = 0;
    let slashAlpha = 0, slashScale = 0.3, burstAlpha = 0, burstScale = 0.5;
    let ringAlpha = 0, ringScale = 0.2, secondaryAlpha = 0, secondaryScale = 0.3;
    let flashAlpha = 0, damageAlpha = 0, damageLift = 0, damageScale = 1;
    let critAlpha = 0, critLift = 0, hpTween = 1;
    let cameraX = 0, cameraY = 0;
    let pose = "idle";

    const contact = resolveContactPoint(_scene.layout);
    _scene.layout.impactX = contact.x;
    _scene.layout.impactY = contact.y;

    if (_scene.animating && plan) {
      const dt = Math.min(0.05, _app.ticker.deltaMS / 1000);
      _scene.playTime += dt;
      const t = _scene.playTime;
      const primaryTurn = plan.turns[0] || null;
      const primaryHitStop = num(plan.primaryHitStop, resolveHitStopSec(plan, primaryTurn));
      const impactAt = plan.impactAt;
      const holdEnd = impactAt + primaryHitStop;
      const primaryResolveEnd = holdEnd + 0.60;
      const compactStart = Math.max(primaryResolveEnd + 0.08, 1.38);
      const compactEnd = Math.max(compactStart + 0.35, plan.settleAt - 0.06);

      if (t < compactStart || plan.turns.length <= 1) {
        currentTurnIndex = plan.turns.length ? 0 : -1;
        currentTurn = primaryTurn;
        currentTurnPhase = clamp((t - Math.max(0, impactAt - 0.10)) / Math.max(0.01, primaryResolveEnd - impactAt + 0.10), 0, 1);
      } else {
        const remaining = Math.max(1, plan.turns.length - 1);
        const p = clamp((t - compactStart) / Math.max(0.01, compactEnd - compactStart), 0, 0.999999);
        const scaled = p * remaining;
        currentTurnIndex = Math.min(plan.turns.length - 1, 1 + Math.floor(scaled));
        currentTurnPhase = scaled - Math.floor(scaled);
        currentTurn = plan.turns[currentTurnIndex] || primaryTurn;
      }

      const family = plan.family;
      const intensity = resolveImpactIntensity(plan, currentTurn);
      const primaryIsEnemy = primaryTurn?.actor === "right";
      const isDamaging = !["miss","heal"].includes(String(currentTurn?.kind || ""));
      const gap = Math.max(90, _scene.layout.enemyX - _scene.layout.playerX);
      const familyTravel =
        family === "crescent_rush" ? 1.05 :
        family === "phantom_feint" ? 1.00 :
        family === "lunar_crash" ? 0.88 :
        family === "breach_strike" ? 0.92 :
        family === "pursuit_cut" ? 0.98 :
        family === "double_impact" ? 0.96 :
        0.92;
      const maxTravel = clamp(gap * 0.48 * familyTravel, 58, 108);

      const anticipationStart = 0.12;
      const commitStart = Math.max(0.34, impactAt - 0.48);
      const anticipationP = clamp((t - anticipationStart) / Math.max(0.01, commitStart - anticipationStart), 0, 1);
      const commitP = clamp((t - commitStart) / Math.max(0.01, impactAt - commitStart), 0, 1);
      const recoveryP = clamp((t - holdEnd) / 0.56, 0, 1);

      let primaryTravel = 0;
      if (t < commitStart) {
        primaryTravel = -6 * easeInOutQuad(anticipationP);
        playerLift = 3 * easeInOutQuad(anticipationP);
      } else if (t <= impactAt) {
        primaryTravel = lerp(-6, maxTravel, easeInCubic(commitP));
      } else if (t <= holdEnd) {
        primaryTravel = maxTravel;
      } else {
        primaryTravel = maxTravel * (1 - easeOutCubic(recoveryP));
      }

      if (family === "phantom_feint" && t < commitStart) {
        primaryTravel += Math.sin(anticipationP * Math.PI) * -10;
      }
      if (family === "lunar_crash") {
        const liftP = t <= impactAt ? commitP : (1 - recoveryP);
        playerLift += -Math.sin(clamp(liftP, 0, 1) * Math.PI) * 22;
      } else if (family === "crescent_rush") {
        playerLift += -Math.sin(commitP * Math.PI) * 6;
      } else if (family === "pursuit_cut") {
        playerLift += -Math.sin(commitP * Math.PI) * 4;
      }

      const tiltBase =
        family === "crescent_rush" ? -0.11 :
        family === "double_impact" ? -0.07 :
        family === "pursuit_cut" ? 0.055 :
        family === "phantom_feint" ? -0.045 :
        family === "lunar_crash" ? -0.03 :
        -0.035;
      const contactWeight = t <= impactAt ? easeInCubic(commitP) : Math.max(0, 1 - recoveryP);
      playerTilt = tiltBase * contactWeight * intensity.tier;

      if (!primaryIsEnemy) {
        playerLunge = primaryTravel;
      } else {
        enemyDrift -= primaryTravel * 0.78;
        playerHitKick = t >= impactAt && t <= holdEnd + 0.24 ? -8 * Math.sin(clamp((t - impactAt) / (primaryHitStop + 0.24), 0, 1) * Math.PI) : 0;
        pose = t >= commitStart && t <= holdEnd + 0.18 ? "attack" : "idle";
      }

      const impactElapsed = t - impactAt;
      const primaryDamaging = !["miss","heal"].includes(String(primaryTurn?.kind || ""));
      const inHold = t >= impactAt && t <= holdEnd;
      const recoilP = clamp((t - holdEnd) / 0.30, 0, 1);
      const recoilPulse = Math.sin(recoilP * Math.PI);

      if (!primaryIsEnemy && primaryDamaging && t >= impactAt) {
        const personalityMass =
          plan.personality === "heavy_brutal" ? 0.62 :
          plan.personality === "calm_precise" ? 0.78 :
          1;
        const baseRecoil =
          intensity.finisher ? 24 :
          intensity.crit ? 21 :
          plan.damageTier === "heavy" ? 19 :
          plan.damageTier === "medium" ? 16 :
          13;
        enemyShakeX += recoilPulse * baseRecoil * personalityMass;
        enemyShakeY += -recoilPulse * (intensity.finisher ? 5 : intensity.crit ? 4 : 2.5) * personalityMass;
        const squash = inHold ? 0.035 * intensity.tier : recoilPulse * 0.025 * intensity.tier;
        enemySlam = -squash;
      }

      if (plan.personality === "controlled_displaced" && t < commitStart) {
        enemyDrift += Math.sin(t * 9) * 1.8;
      } else if (plan.personality === "fast_unstable" && t < commitStart) {
        enemyDrift += Math.sin(t * 8) * 1.4;
      }

      if (primaryDamaging && impactElapsed >= 0) {
        const slashP = clamp(impactElapsed / (plan.perfLite ? 0.18 : 0.24), 0, 1);
        slashAlpha = (1 - easeOutCubic(slashP)) * (plan.perfLite ? 0.78 : 1);
        slashScale = 0.72 + easeOutCubic(slashP) * (0.95 * intensity.tier);

        const burstP = clamp(impactElapsed / (plan.perfLite ? 0.16 : 0.22), 0, 1);
        burstAlpha = (1 - easeOutCubic(burstP)) * (plan.perfLite ? 0.56 : 0.94);
        burstScale = 0.58 + easeOutCubic(burstP) * (0.72 * intensity.tier);

        const ringP = clamp(impactElapsed / (intensity.crit ? 0.40 : 0.32), 0, 1);
        ringAlpha = (1 - ringP) * (plan.perfLite ? 0.24 : intensity.crit ? 0.68 : plan.damageTier === "heavy" ? 0.52 : 0.38);
        ringScale = 0.32 + easeOutCubic(ringP) * (intensity.crit ? 2.05 : plan.damageTier === "heavy" ? 1.72 : 1.48);

        const flashP = clamp(impactElapsed / (intensity.crit ? 0.105 : 0.075), 0, 1);
        flashAlpha = (1 - flashP) * (plan.perfLite ? 0.05 : intensity.crit ? 0.26 : plan.damageTier === "heavy" ? 0.17 : 0.11);
      }

      if (!plan.perfLite && primaryDamaging && t >= impactAt) {
        const cameraAmp = intensity.finisher ? 10 : intensity.crit ? 9 : plan.damageTier === "heavy" ? 7 : plan.damageTier === "medium" ? 5 : 3.5;
        if (inHold) {
          cameraX = primaryIsEnemy ? -cameraAmp : cameraAmp;
          cameraY = -cameraAmp * 0.18;
        } else {
          const camP = clamp((t - holdEnd) / 0.22, 0, 1);
          const settle = 1 - easeOutCubic(camP);
          const micro = Math.sin(camP * Math.PI * 5) * settle * cameraAmp * 0.22;
          cameraX = (primaryIsEnemy ? -1 : 1) * (cameraAmp * settle + micro);
          cameraY = Math.cos(camP * Math.PI * 4) * settle * cameraAmp * 0.14;
        }
      }

      if (!_scene.hapticImpactDone && t >= impactAt) {
        _scene.hapticImpactDone = true;
        try {
          _opts?.tg?.HapticFeedback?.impactOccurred?.(intensity.crit || plan.damageTier === "heavy" || intensity.finisher ? "heavy" : "medium");
        } catch (_) {}
      }

      const damageStart = impactAt + 0.04;
      const damageP = clamp((t - damageStart) / (intensity.crit ? 0.78 : 0.68), 0, 1);
      if (t >= damageStart && damageP < 1) {
        damageAlpha = Math.sin(damageP * Math.PI);
        damageLift = easeOutCubic(damageP) * 42;
        const pop = damageP < 0.28
          ? lerp(intensity.crit ? 0.80 : 0.85, intensity.crit ? 1.23 : 1.06, easeOutBack(damageP / 0.28, 1.05))
          : lerp(intensity.crit ? 1.23 : 1.06, 1.0, easeOutCubic((damageP - 0.28) / 0.72));
        damageScale = pop;
      }

      if (intensity.crit && t >= impactAt + 0.02) {
        const critP = clamp((t - impactAt - 0.02) / 0.78, 0, 1);
        critAlpha = Math.sin(critP * Math.PI);
        critLift = easeOutCubic(critP) * 26;
        const secondaryP = clamp((t - impactAt - 0.12) / 0.24, 0, 1);
        if (secondaryP > 0 && secondaryP < 1) {
          secondaryAlpha = (1 - secondaryP) * (plan.perfLite ? 0.18 : 0.58);
          secondaryScale = 0.45 + easeOutCubic(secondaryP) * 1.25;
        }
      }

      const finisherAt = holdEnd + 0.20;
      if (plan.waveBreak && t >= finisherAt) {
        const finisherP = clamp((t - finisherAt) / 0.46, 0, 1);
        secondaryAlpha = Math.max(secondaryAlpha, (1 - finisherP) * (plan.perfLite ? 0.24 : 0.72));
        secondaryScale = Math.max(secondaryScale, 0.55 + easeOutCubic(finisherP) * 2.15);
        if (!_scene.hapticFinishDone) {
          _scene.hapticFinishDone = true;
          try { _opts?.tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
        }
      }

      if (currentTurnIndex > 0 && currentTurn) {
        const compactCommit = Math.sin(clamp(currentTurnPhase, 0, 1) * Math.PI);
        const compactImpactP = clamp((currentTurnPhase - 0.42) / 0.34, 0, 1);
        const compactPulse = Math.sin(compactImpactP * Math.PI);
        const actorRight = currentTurn.actor === "right";
        const compactDamage = !["miss","heal"].includes(String(currentTurn.kind || ""));

        if (actorRight) {
          enemyDrift -= compactCommit * 24;
          if (compactDamage) playerHitKick -= compactPulse * 7;
          pose = currentTurnPhase > 0.18 && currentTurnPhase < 0.72 ? "attack" : pose;
        } else {
          playerLunge += compactCommit * 24;
          if (compactDamage) {
            enemyShakeX += compactPulse * 8;
            if (currentTurnPhase > 0.40 && currentTurnPhase < 0.78) pose = currentTurn.defeat ? "defeat" : "hit";
          }
        }

        if (compactDamage) {
          slashAlpha = Math.max(slashAlpha, compactPulse * (plan.perfLite ? 0.45 : 0.72));
          slashScale = Math.max(slashScale, 0.56 + compactImpactP * 0.70);
          ringAlpha = Math.max(ringAlpha, compactPulse * (plan.perfLite ? 0.16 : 0.30));
          ringScale = Math.max(ringScale, 0.38 + compactImpactP * 1.05);
          if (!plan.perfLite) {
            cameraX += (actorRight ? -1 : 1) * compactPulse * 2.5;
          }
        }
      }

      hpTween = easeInOutQuad(clamp((t - impactAt) / Math.max(0.62, plan.total * 0.34), 0, 1));

      if (!primaryIsEnemy) {
        if (t >= impactAt - 0.03 && t <= holdEnd + 0.24 && primaryDamaging) pose = primaryTurn?.defeat ? "defeat" : "hit";
      }

      if ([4,7,10].includes(plan.wave) && t < 0.36) {
        const intro = easeOutCubic(clamp(t / 0.36, 0, 1));
        if (plan.wave === 4) {
          _scene.enemy.alpha = 0.18 + intro * 0.82;
          enemyDrift += (1 - intro) * 8;
        } else if (plan.wave === 7) {
          _scene.enemy.alpha = 0.36 + intro * 0.64;
          enemyShakeY += (1 - intro) * -8;
        } else {
          const phaseFlicker = plan.perfLite ? 1 : (0.80 + Math.sin(t * 42) * 0.12);
          _scene.enemy.alpha = clamp((0.22 + intro * 0.78) * phaseFlicker, 0.12, 1);
        }
      } else {
        _scene.enemy.alpha = 1;
      }

      const settle = clamp((t - plan.settleAt) / Math.max(0.18, plan.total - plan.settleAt), 0, 1);
      if (plan.waveBreak && t >= finisherAt) {
        pose = "defeat";
        if (t > plan.settleAt) {
          _scene.enemy.alpha = 1 - settle * 0.78;
          _scene.enemy.rotation = settle * 0.065;
        }
      } else {
        _scene.enemy.rotation = 0;
      }

      if (t >= plan.total) {
        _scene.animating = false;
        _scene.playTime = 0;
        pose = plan.waveBreak ? "defeat" : "idle";
        if (_app?.stage) { _app.stage.x = 0; _app.stage.y = 0; }
      }
    } else {
      _scene.enemy.alpha = 1;
      _scene.enemy.rotation = 0;
      pose = plan?.waveBreak ? "defeat" : "idle";
      if (_app?.stage) { _app.stage.x = 0; _app.stage.y = 0; }
    }

    if (_scene.enemyPose !== pose) {
      _scene.enemyPose = pose;
      const tex = _scene.enemyTextures?.[pose] || _scene.enemyTextures?.idle || _scene.enemyTexture;
      if (tex) {
        _scene.enemySprite.texture = tex;
        _scene.enemySprite.visible = true;
        const w = _scene.layout.width || 320, h = _scene.layout.height || 220;
        fitSprite(_scene.enemySprite, Math.max(215, Math.round(w * 0.48)), Math.max(238, Math.round(h * 0.90)), "bottom");
      }
    }

    if (_scene.animating && currentTurn?.rightHpKnown && Number.isFinite(Number(currentTurn.rightHpAfter))) {
      let priorRightHp = _scene.beforeHp;
      for (let i = currentTurnIndex - 1; i >= 0; i--) {
        const prior = plan?.turns?.[i];
        if (prior?.rightHpKnown && Number.isFinite(Number(prior.rightHpAfter))) {
          priorRightHp = Number(prior.rightHpAfter);
          break;
        }
      }
      _scene.hpDisplay = lerp(priorRightHp, Number(currentTurn.rightHpAfter), easeInOutQuad(currentTurnPhase));
    } else {
      _scene.hpDisplay = _scene.animating ? lerp(_scene.beforeHp, _scene.afterHp, hpTween) : _scene.afterHp;
    }

    _scene.player.x = _scene.layout.playerX + playerLunge + playerHitKick;
    _scene.player.y = _scene.layout.playerY + idleP + playerLift;
    _scene.player.rotation = playerTilt;

    _scene.enemy.x = _scene.layout.enemyX + enemyShakeX + enemyDrift;
    _scene.enemy.y = _scene.layout.enemyY + idleE + enemyShakeY;
    _scene.enemy.scale?.set?.(Math.max(0.92, 1 + enemySlam));

    if (_app?.stage) {
      _app.stage.x = cameraX;
      _app.stage.y = cameraY;
    }

    clearDraw(_scene.hpGhost);
    clearDraw(_scene.hpFill);
    const hpBeforePct = pct(_scene.beforeHp, _scene.hpMax);
    const hpNowPct = pct(_scene.hpDisplay, _scene.hpMax);
    const ghostW = Math.max(10, (_scene.layout.hpW * hpBeforePct) / 100);
    const fillW = Math.max(8, (_scene.layout.hpW * hpNowPct) / 100);
    roundRect(_scene.hpGhost, _scene.layout.hpX, _scene.layout.hpY, ghostW, _scene.layout.hpH, 999, 0x6f1321, 0.34);
    roundRect(_scene.hpFill, _scene.layout.hpX, _scene.layout.hpY, fillW, _scene.layout.hpH, 999, _scene.crit ? 0xffcf61 : 0xff5e70, 0.95);
    _scene.hpText.text = `${Math.round(_scene.hpDisplay)} / ${Math.round(_scene.hpMax)} HP`;

    clearDraw(_scene.stageFlash);
    try {
      _scene.stageFlash.beginFill(_scene.crit ? 0xfff0c2 : 0xffd7dd, flashAlpha);
      _scene.stageFlash.drawRoundedRect(0, 0, _scene.layout.width, _scene.layout.height, 24);
      _scene.stageFlash.endFill();
    } catch (_) {}

    clearDraw(_scene.impactSlash);
    try {
      const coreColor = _scene.crit ? 0xfff1bc : 0xfff3f5;
      const edgeColor = _scene.crit ? 0xffc35d : 0xff6f86;
      _scene.impactSlash.lineStyle(10, edgeColor, slashAlpha * 0.42);
      _scene.impactSlash.moveTo(-62, 0);
      _scene.impactSlash.lineTo(62, 0);
      _scene.impactSlash.lineStyle(4, coreColor, slashAlpha);
      _scene.impactSlash.moveTo(-58, 0);
      _scene.impactSlash.lineTo(58, 0);
      const slashFamily = _scene.plan?.family;
      _scene.impactSlash.rotation =
        slashFamily === "lunar_crash" ? -0.78 :
        slashFamily === "crescent_rush" ? -0.58 :
        slashFamily === "pursuit_cut" ? 0.24 :
        slashFamily === "breach_strike" ? -0.18 :
        slashFamily === "double_impact" ? -0.40 :
        -0.34;
    } catch (_) {}
    _scene.impactSlash.x = contact.x;
    _scene.impactSlash.y = contact.y;
    _scene.impactSlash.alpha = slashAlpha;
    _scene.impactSlash.scale?.set?.(slashScale, 1);

    clearDraw(_scene.impactBurst);
    try {
      const coreColor = _scene.crit ? 0xfff2b5 : 0xffffff;
      const edgeColor = _scene.crit ? 0xffbf55 : 0xff718a;
      _scene.impactBurst.lineStyle(3, edgeColor, burstAlpha * 0.72);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const inner = 10 * burstScale;
        const outer = (24 + (i % 2) * 8) * burstScale;
        _scene.impactBurst.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
        _scene.impactBurst.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      }
      _scene.impactBurst.beginFill(coreColor, burstAlpha * 0.92);
      _scene.impactBurst.drawCircle(0, 0, 7 * burstScale);
      _scene.impactBurst.endFill();
    } catch (_) {}
    _scene.impactBurst.x = contact.x;
    _scene.impactBurst.y = contact.y;
    _scene.impactBurst.alpha = burstAlpha;

    clearDraw(_scene.impactRing);
    try {
      _scene.impactRing.lineStyle(_scene.plan?.hasCrit ? 4 : 3, _scene.crit ? 0xffdc7b : 0xff93a4, ringAlpha);
      _scene.impactRing.drawCircle(0, 0, 20 + 24 * ringScale);
    } catch (_) {}
    _scene.impactRing.x = contact.x;
    _scene.impactRing.y = contact.y;
    _scene.impactRing.alpha = ringAlpha;

    clearDraw(_scene.secondaryRing);
    try {
      _scene.secondaryRing.lineStyle(_scene.plan?.waveBreak ? 5 : 3, _scene.plan?.waveBreak ? 0xffd5dc : 0xffd776, secondaryAlpha);
      _scene.secondaryRing.drawCircle(0, 0, 18 + 28 * secondaryScale);
    } catch (_) {}
    _scene.secondaryRing.x = contact.x;
    _scene.secondaryRing.y = contact.y;
    _scene.secondaryRing.alpha = secondaryAlpha;

    const eventValue = currentTurn ? Math.max(0, Math.round(currentTurn.value || 0)) : Math.max(0, Math.round(_scene.damage));
    const eventKind = currentTurn?.kind || (_scene.crit ? "crit" : "hit");
    _scene.damageText.text = eventKind === "miss" ? "MISS" : eventKind === "block" ? "BLOCK" : eventKind === "heal" ? `+${eventValue}` : `-${eventValue}`;
    _scene.damageText.style.fill = eventKind === "crit" ? 0xffe083 : eventKind === "heal" ? 0xa7ffd0 : eventKind === "block" ? 0xc8d3e6 : 0xffffff;
    _scene.damageText.alpha = damageAlpha;
    _scene.damageText.x = contact.x + 8;
    _scene.damageText.y = contact.y - 18 - damageLift;
    _scene.damageText.scale?.set?.(damageScale);

    const finisherVisible = !!(_scene.plan?.waveBreak && _scene.animating && _scene.playTime >= (_scene.plan.impactAt + num(_scene.plan.primaryHitStop, 0) + 0.20));
    _scene.critText.text = finisherVisible ? "WAVE BROKEN" : (eventKind === "crit" ? "CRITICAL" : "");
    _scene.critText.alpha = finisherVisible ? Math.max(0.72, secondaryAlpha) : critAlpha;
    _scene.critText.x = contact.x;
    _scene.critText.y = contact.y - 66 - critLift;
  }

  function attachTicker() {
    if (!_app || !_scene || _tick) return;
    _tick = () => renderDynamic();
    _app.ticker?.add?.(_tick);
  }

  function resize() {
    if (!_app || !_host) return;
    const size = resolveSize(_host);
    try { _app.renderer?.resize?.(size.width, size.height); } catch (_) {}
    renderStatic();
    renderDynamic();
  }


  async function hydrateAssets(battle) {
    if (!_scene) return;
    const def = resolveBloodMoonEnemyDefinition(battle);
    const states = Object.keys(def?.states || {});
    const enemyLoads = await Promise.all(states.map(async (state) => {
      const tex = await loadTextureSafeMany(resolveBloodMoonEnemyAsset(battle, state));
      return [state, tex || null];
    }));
    const [playerTexture] = await Promise.all([
      loadTextureSafeMany(resolveBloodMoonPlayerAsset(battle)),
    ]);
    _scene.playerTexture = playerTexture || null;
    _scene.enemyTextures = Object.fromEntries(enemyLoads);
    _scene.enemyTexture = _scene.enemyTextures.idle || null;
    _scene.enemyPose = "idle";
  }

  async function applyBattle(battle, animate) {
    if (!_scene) return;
    _scene.battle = battle || {};
    _scene.plan = planBattlePresentation(battle || {});
    _scene.beforeHp = Math.max(0, num(battle?.enemy?.hpBefore, battle?.enemy?.hpMax || 0));
    _scene.afterHp = Math.max(0, num(battle?.enemy?.hpAfter, 0));
    _scene.hpMax = Math.max(1, num(battle?.enemy?.hpMax, _scene.beforeHp || 1));
    _scene.damage = Math.max(0, num(battle?.attack?.damage, _scene.plan?.damage || 0));
    _scene.crit = !!_scene.plan?.hasCrit;
    _scene.hpDisplay = animate ? _scene.beforeHp : _scene.afterHp;
    _scene.playTime = 0;
    _scene.animating = !!animate;
    _scene.hapticImpactDone = false;
    _scene.hapticFinishDone = false;

    await hydrateAssets(battle);
    renderStatic();
    renderDynamic();

  }

  async function init(host, opts = {}) {
    _opts = opts || {};

    if (!hasPixi()) throw new Error("PIXI missing");
    if (!host) throw new Error("BloodMoon Pixi host missing");

    if (_host !== host) destroy();
    if (_app && _host === host) {
      resize();
      return BloodMoonPixi;
    }

    _host = host;
    _host.innerHTML = "";

    _app = await createApp(host);
    const view = viewOf(_app);
    if (!view) throw new Error("PIXI view missing");
    view.style.cssText = "width:100%;height:100%;display:block;pointer-events:none";
    _host.appendChild(view);

    buildScene();
    attachTicker();
    resize();

    _resizeHandler = () => resize();
    global.addEventListener("resize", _resizeHandler);
    return BloodMoonPixi;
  }

  async function play(battle, opts = {}) {
    if (!battle || typeof battle !== "object") throw new Error("BloodMoon battle missing");
    if (!_app || !_scene) throw new Error("BloodMoon Pixi not initialized");

    _opts = { ..._opts, ...opts };
    await applyBattle(battle, opts.animate !== false);
    return true;
  }

  BloodMoonPixi.init = init;
  BloodMoonPixi.play = play;
  BloodMoonPixi.stop = stop;
  BloodMoonPixi.destroy = destroy;
  BloodMoonPixi.resolveBloodMoonPlayerAsset = resolveBloodMoonPlayerAsset;
  BloodMoonPixi.ENEMY_REGISTRY = BLOODMOON_ENEMY_REGISTRY;
  BloodMoonPixi.resolveBloodMoonEnemyKey = resolveBloodMoonEnemyKey;
  BloodMoonPixi.resolveBloodMoonEnemyDefinition = resolveBloodMoonEnemyDefinition;
  BloodMoonPixi.resolveBloodMoonEnemyStateAsset = resolveBloodMoonEnemyStateAsset;
  BloodMoonPixi.resolveBloodMoonEnemyAsset = resolveBloodMoonEnemyAsset;
  BloodMoonPixi.planBattlePresentation = planBattlePresentation;

  global.BloodMoonPixi = BloodMoonPixi;
})(window);
