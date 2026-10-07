(function (global) {
  const BloodMoonPixi = {};

  let _host = null;
  let _app = null;
  let _opts = {};
  let _resizeHandler = null;
  let _tick = null;
  let _scene = null;

  const VER = "bloodmoon_pixi.js v3-p11-restage-skin-arena-2026-10-08";
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
      "/images/Ah.png",
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
    const baseTurn = perfLite ? 0.56 : 0.70;
    const total = Math.min(perfLite ? 3.1 : 4.8, Math.max(perfLite ? 2.25 : 2.55, 0.62 + turns.length * baseTurn + (hasCrit ? 0.18 : 0) + (waveBreak ? 0.45 : 0)));
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
      impactAt: Math.min(total * 0.42, 1.45),
      settleAt: total * 0.80,
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
    _scene.impactRing.alpha = 0;
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
    const impactRing = new P.Graphics();
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
      impactRing,
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
      impactRing,
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
      playerY: Math.round(h * 0.73),
      enemyX: Math.round(w * 0.77),
      enemyY: Math.round(h * 0.71),
      impactX: Math.round(w * 0.54),
      impactY: Math.round(h * 0.43),
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
    try {
      _scene.playerAura.beginFill(0x8ac6ff, 0.10);
      _scene.playerAura.drawEllipse(0, -150, 86, 128);
      _scene.playerAura.endFill();
    } catch (_) {}

    roundRect(_scene.playerPlate, -64, -186, 128, 214, 24, 0x09121d, 0.22, 0xb8d8ff, 0.14, 1);
    roundRect(_scene.playerFallback, -42, -150, 84, 150, 20, 0x8a2032, 0.78, 0xffa2b3, 0.16, 2);

    clearDraw(_scene.enemyShadow);
    try {
      _scene.enemyShadow.beginFill(0x000000, 0.30);
      _scene.enemyShadow.drawEllipse(0, 0, 76, 22);
      _scene.enemyShadow.endFill();
    } catch (_) {}

    clearDraw(_scene.enemyAura);
    try {
      _scene.enemyAura.beginFill(0xff5e70, 0.12);
      _scene.enemyAura.drawEllipse(0, -174, 108, 158);
      _scene.enemyAura.endFill();
    } catch (_) {}

    roundRect(_scene.enemyPlate, -86, -218, 172, 248, 28, 0x12070d, 0.28, 0xff91a1, 0.14, 1);
    roundRect(_scene.enemyFallback, -58, -174, 116, 174, 24, 0x4a1018, 0.88, 0xff98a7, 0.18, 2);

    const playerMaxW = Math.max(120, Math.round(w * 0.28));
    const playerMaxH = Math.max(170, Math.round(h * 0.72));
    const enemyMaxW = Math.max(160, Math.round(w * 0.34));
    const enemyMaxH = Math.max(190, Math.round(h * 0.80));

    if (_scene.playerTexture) {
      _scene.playerSprite.texture = _scene.playerTexture;
      fitSprite(_scene.playerSprite, playerMaxW, playerMaxH, "bottom");
      _scene.playerSprite.visible = true;
      _scene.playerFallback.alpha = 0.14;
    } else {
      _scene.playerSprite.visible = false;
      _scene.playerFallback.alpha = 0.82;
    }

    if (_scene.enemyTexture) {
      _scene.enemySprite.texture = _scene.enemyTexture;
      fitSprite(_scene.enemySprite, enemyMaxW, enemyMaxH, "bottom");
      _scene.enemySprite.visible = true;
      _scene.enemyFallback.alpha = 0.12;
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
    const idleP = Math.sin(now * 1.8) * 4;
    const idleFactor = plan?.personality === "heavy_brutal" ? 2.2 : plan?.personality === "calm_precise" ? 1.8 : 4.2;
    const idleE = Math.sin(now * (plan?.personality === "controlled_displaced" ? 2.3 : 1.45) + 1.3) * idleFactor;
    const idleMoon = Math.sin(now * 0.8) * 2;

    let playerLunge = 0, playerLift = 0, playerTilt = 0;
    let enemyShakeX = 0, enemyShakeY = 0, enemySlam = 0, enemyDrift = 0;
    let slashAlpha = 0, slashScale = 0.3, ringAlpha = 0, ringScale = 0.2;
    let flashAlpha = 0, damageAlpha = 0, damageLift = 0, critAlpha = 0, critLift = 0, hpTween = 1;
    let cameraX = 0, cameraY = 0;
    let pose = "idle";

    if (_scene.animating && plan) {
      const dt = Math.min(0.05, _app.ticker.deltaMS / 1000);
      _scene.playTime += dt;
      const t = _scene.playTime;
      const eventStart = Math.max(0.42, plan.impactAt * 0.72);
      const eventEnd = Math.max(eventStart + 0.35, plan.settleAt);
      if (plan.turns.length) {
        const eventP = clamp((t - eventStart) / Math.max(0.01, eventEnd - eventStart), 0, 0.999999);
        const scaled = eventP * plan.turns.length;
        currentTurnIndex = Math.min(plan.turns.length - 1, Math.floor(scaled));
        currentTurnPhase = scaled - Math.floor(scaled);
        currentTurn = plan.turns[currentTurnIndex] || null;
      }
      const impactAt = plan.impactAt;
      const family = plan.family;

      const anticipation = clamp(t / Math.max(0.24, impactAt * 0.58), 0, 1);
      const strike = clamp((t - impactAt * 0.56) / Math.max(0.22, impactAt * 0.44), 0, 1);
      let impact = clamp((t - impactAt) / (plan.perfLite ? 0.30 : 0.44), 0, 1);
      if (plan.turns.length > 1 && t >= eventStart && t <= eventEnd) {
        impact = clamp(currentTurnPhase, 0, 1);
      }
      const settle = clamp((t - plan.settleAt) / Math.max(0.18, plan.total - plan.settleAt), 0, 1);

      const familyMult = family === "lunar_crash" ? 1.16 : family === "breach_strike" ? 1.08 : family === "phantom_feint" ? 0.92 : 1;
      const tierMult = plan.damageTier === "heavy" ? 1.28 : plan.damageTier === "medium" ? 1.08 : 0.92;
      const critMult = plan.hasCrit ? 1.20 : 1;
      const amp = familyMult * tierMult * critMult;

      if (family === "phantom_feint") {
        playerLunge = Math.sin(strike * Math.PI) * 62 * amp;
        playerLift = -Math.sin(strike * Math.PI) * 12;
        playerTilt = -Math.sin(strike * Math.PI) * 0.05 * amp;
      } else if (family === "lunar_crash") {
        playerLunge = Math.sin(strike * Math.PI) * 44 * amp;
        playerLift = -Math.sin(strike * Math.PI) * 24;
        playerTilt = -Math.sin(strike * Math.PI) * 0.03 * amp;
      } else if (family === "double_impact") {
        playerLunge = Math.sin(strike * Math.PI) * 52 * amp + (impact > 0.48 && impact < 0.82 ? 10 : 0);
        playerTilt = -Math.sin(strike * Math.PI) * 0.08 * amp;
      } else if (family === "crescent_rush") {
        playerLunge = Math.sin(strike * Math.PI) * 58 * amp;
        playerLift = -Math.sin(strike * Math.PI) * 7;
        playerTilt = -Math.sin(strike * Math.PI) * 0.13 * amp;
      } else if (family === "pursuit_cut") {
        playerLunge = Math.sin(strike * Math.PI) * 48 * amp + (strike > 0.62 ? 16 * (1 - strike) : 0);
        playerLift = -Math.sin(strike * Math.PI) * 4;
        playerTilt = Math.sin(strike * Math.PI) * 0.07 * amp;
      } else {
        playerLunge = Math.sin(strike * Math.PI) * 46 * amp;
        playerTilt = -Math.sin(strike * Math.PI) * 0.035 * amp;
      }

      const recoilWindow = Math.sin(clamp(impact, 0, 1) * Math.PI);
      const personalityMass = plan.personality === "heavy_brutal" ? 0.58 : plan.personality === "calm_precise" ? 0.42 : 1;
      enemyShakeX = Math.sin(impact * (plan.personality === "heavy_brutal" ? 18 : 34)) * (1 - impact) * 16 * amp * personalityMass;
      enemyShakeY = Math.cos(impact * 22) * (1 - impact) * 4 * amp * personalityMass;
      enemySlam = recoilWindow * 0.055 * amp * personalityMass;

      if (plan.personality === "controlled_displaced") {
        enemyDrift = Math.sin(t * 17) * (impact < 0.05 ? 3 : 1);
      } else if (plan.personality === "fast_unstable") {
        enemyDrift = Math.sin(t * 10) * 2.5;
      }

      const pulse = Math.sin(impact * Math.PI);
      if (!plan.perfLite) {
        const cameraAmp = plan.damageTier === "heavy" ? 7 : plan.damageTier === "medium" ? 4.5 : 2.5;
        cameraX = Math.sin(impact * 42) * (1 - impact) * cameraAmp;
        cameraY = Math.cos(impact * 31) * (1 - impact) * cameraAmp * 0.42;
      }
      if (!_scene.hapticImpactDone && t >= impactAt) {
        _scene.hapticImpactDone = true;
        try {
          _opts?.tg?.HapticFeedback?.impactOccurred?.(plan.hasCrit || plan.damageTier === "heavy" ? "heavy" : "medium");
        } catch (_) {}
      }
      if (plan.waveBreak && !_scene.hapticFinishDone && t >= plan.settleAt) {
        _scene.hapticFinishDone = true;
        try { _opts?.tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      }
      slashAlpha = pulse * (plan.perfLite ? 0.72 : 0.98);
      slashScale = 0.32 + easeOutCubic(impact) * (plan.damageTier === "heavy" ? 1.55 : 1.18);
      ringAlpha = pulse * (plan.perfLite ? 0.22 : (plan.hasCrit ? 0.66 : 0.42));
      ringScale = 0.2 + impact * (plan.hasCrit ? 2.2 : 1.7);
      flashAlpha = pulse * (plan.perfLite ? 0.08 : (plan.hasCrit ? 0.34 : 0.19));

      const damageIn = clamp((t - impactAt + 0.03) / 0.78, 0, 1);
      damageAlpha = Math.sin(damageIn * Math.PI);
      damageLift = easeOutCubic(damageIn) * 40;
      if (plan.hasCrit) {
        const c = clamp((t - impactAt + 0.08) / 0.92, 0, 1);
        critAlpha = Math.sin(c * Math.PI);
        critLift = easeOutCubic(c) * 28;
      }

      hpTween = easeInOutQuad(clamp((t - impactAt) / Math.max(0.66, plan.total * 0.36), 0, 1));
      pose = enemyPoseForTime(plan, t);
      if (currentTurn?.actor === "right" && ["hit","crit","tick","finish"].includes(currentTurn.kind) && t < plan.settleAt) pose = "attack";
      if (currentTurn?.target === "right" && ["hit","crit","finish"].includes(currentTurn.kind) && t < plan.settleAt) pose = currentTurn.defeat ? "defeat" : "hit";

      if ([4,7,10].includes(plan.wave) && t < 0.42) {
        const intro = easeOutCubic(clamp(t / 0.42, 0, 1));
        if (plan.wave === 4) {
          _scene.enemy.alpha = 0.10 + intro * 0.90;
          enemyDrift += (1 - intro) * 12;
        } else if (plan.wave === 7) {
          _scene.enemy.alpha = 0.30 + intro * 0.70;
          _scene.enemy.scale?.set?.(1.08 - intro * 0.08);
          enemyShakeY += (1 - intro) * -10;
        } else {
          const phaseFlicker = plan.perfLite ? 1 : (0.72 + Math.sin(t * 48) * 0.18);
          _scene.enemy.alpha = clamp((0.12 + intro * 0.88) * phaseFlicker, 0.08, 1);
          _scene.enemy.scale?.set?.(0.96 + intro * 0.04);
        }
      }

      if (plan.waveBreak && t > plan.settleAt) {        _scene.enemy.alpha = 1 - settle * 0.82;
        _scene.enemy.rotation = settle * 0.08;
      } else {
        _scene.enemy.alpha = 1;
      }

      if (t >= plan.total) {
        _scene.animating = false;
        _scene.playTime = 0;
        pose = plan.waveBreak ? "defeat" : "idle";
      }
    } else {
      _scene.enemy.alpha = 1;
      pose = plan?.waveBreak ? "defeat" : "idle";
    }

    if (_scene.enemyPose !== pose) {
      _scene.enemyPose = pose;
      const tex = _scene.enemyTextures?.[pose] || _scene.enemyTextures?.idle || _scene.enemyTexture;
      if (tex) {
        _scene.enemySprite.texture = tex;
        _scene.enemySprite.visible = true;
        const w = _scene.layout.width || 320, h = _scene.layout.height || 220;
        fitSprite(_scene.enemySprite, Math.max(160, Math.round(w * 0.34)), Math.max(190, Math.round(h * 0.80)), "bottom");
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

    _scene.player.x = _scene.layout.playerX + playerLunge;
    _scene.player.y = _scene.layout.playerY + idleP + playerLift;
    _scene.player.rotation = playerTilt;

    _scene.enemy.x = _scene.layout.enemyX + enemyShakeX + enemyDrift;
    _scene.enemy.y = _scene.layout.enemyY + idleE + enemyShakeY;
    _scene.enemy.scale?.set?.(1 + enemySlam);
    _scene.moon.y = idleMoon;
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
      _scene.stageFlash.beginFill(_scene.crit ? 0xffdf84 : 0xff8ea1, flashAlpha);
      _scene.stageFlash.drawRoundedRect(0, 0, _scene.layout.width, _scene.layout.height, 24);
      _scene.stageFlash.endFill();
    } catch (_) {}

    clearDraw(_scene.impactSlash);
    try {
      _scene.impactSlash.beginFill(_scene.crit ? 0xffd774 : 0xff9bad, slashAlpha);
      _scene.impactSlash.drawRoundedRect(-58, -8, 116, 16, 999);
      _scene.impactSlash.endFill();
      const slashFamily = _scene.plan?.family;
      _scene.impactSlash.rotation =
        slashFamily === "lunar_crash" ? -0.75 :
        slashFamily === "crescent_rush" ? -0.56 :
        slashFamily === "pursuit_cut" ? 0.24 :
        slashFamily === "breach_strike" ? -0.20 :
        slashFamily === "double_impact" ? -0.42 :
        -0.34;
    } catch (_) {}
    _scene.impactSlash.x = _scene.layout.impactX;
    _scene.impactSlash.y = _scene.layout.impactY;
    _scene.impactSlash.scale?.set?.(slashScale, 1);

    clearDraw(_scene.impactRing);
    try {
      _scene.impactRing.lineStyle(_scene.plan?.hasCrit ? 5 : 4, _scene.crit ? 0xffd774 : 0xff8fa0, ringAlpha);
      _scene.impactRing.drawCircle(0, 0, 26 + 26 * ringScale);
    } catch (_) {}
    _scene.impactRing.x = _scene.layout.impactX;
    _scene.impactRing.y = _scene.layout.impactY;

    const eventValue = currentTurn ? Math.max(0, Math.round(currentTurn.value || 0)) : Math.max(0, Math.round(_scene.damage));
    const eventKind = currentTurn?.kind || (_scene.crit ? "crit" : "hit");
    _scene.damageText.text = eventKind === "miss" ? "MISS" : eventKind === "block" ? "BLOCK" : eventKind === "heal" ? `+${eventValue}` : `-${eventValue}`;
    _scene.damageText.style.fill = eventKind === "crit" ? 0xffe083 : eventKind === "heal" ? 0xa7ffd0 : 0xffffff;
    _scene.damageText.alpha = damageAlpha;
    _scene.damageText.x = _scene.layout.impactX + 8;
    _scene.damageText.y = _scene.layout.impactY - 22 - damageLift;

    _scene.critText.text = _scene.plan?.waveBreak && _scene.playTime > _scene.plan.settleAt ? "WAVE BROKEN" : (currentTurn?.kind === "crit" ? "CRITICAL" : "");
    _scene.critText.alpha = critAlpha || (_scene.plan?.waveBreak && _scene.animating && _scene.playTime > _scene.plan.settleAt ? 0.94 : 0);
    _scene.critText.x = _scene.layout.impactX;
    _scene.critText.y = _scene.layout.impactY - 68 - critLift;
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

    if (animate) {
      try {
        const kind = _scene.plan?.hasCrit || _scene.plan?.waveBreak ? "medium" : "light";
        _opts?.tg?.HapticFeedback?.impactOccurred?.(kind);
      } catch (_) {}
    }
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
