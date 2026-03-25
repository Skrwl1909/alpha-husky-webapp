(function (global) {
  const BloodMoonPixi = {};

  let _host = null;
  let _app = null;
  let _opts = {};
  let _resizeHandler = null;
  let _tick = null;
  let _scene = null;

  const VER = "bloodmoon_pixi.js v2-2026-03-25";
  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  const CLOUD_TX_512 = "f_auto,q_auto,w_512,c_fit";
  const CLOUD_TX_768 = "f_auto,q_auto,w_768,c_fit";
  const BOSS_CLOUD_BASE = `${CLOUD_BASE}/${CLOUD_TX_768}/v1771238762/bosses`;

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
    const domHero =
      skinEl?.currentSrc ||
      skinEl?.src ||
      global.document?.querySelector?.("#heroFrame img, #hero-frame img, img#hero-img, img#profile-avatar, #avatarMain img")?.src ||
      "";

    const direct = uniqueStrings([
      battle?.player?.sprite,
      battle?.player?.assetUrl,
      battle?.player?.image,
      battle?.player?.img,
      imageSourceValue(battle?.player?.skin),
      battle?.player?.skinUrl,
      typeof p?.skin === "string" ? p.skin : p?.skin?.img,
      typeof p?.activeSkin === "string" ? p.activeSkin : p?.activeSkin?.img,
      p?.heroImg,
      p?.heroPng,
      p?.character,
      p?.characterPng,
      domHero,
    ]).map((x) => {
      const src = String(x || "").trim();
      if (!src) return "";
      if (src.includes("res.cloudinary.com")) return cloudThumb(src, 512);
      return normalizeUrl(src);
    });

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

    return uniqueStrings([...avatarCandidates, ...direct]);
  }

  function resolveBloodMoonEnemyKey(battle) {
    const wave = Math.max(1, num(battle?.wave || battle?.enemy?.wave, 1));
    if (wave >= 10) return "phase_knight";
    if (wave >= 7) return "lunar_myrmidon";
    if (wave >= 4) return "echo_revenant";
    return "shatter_hound";
  }

  function resolveBloodMoonEnemyAsset(battle) {
    const direct = uniqueStrings([
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

    const key = resolveBloodMoonEnemyKey(battle);
    return uniqueStrings([
      ...direct,
      `${BOSS_CLOUD_BASE}/${key}.png`,
      `${BOSS_CLOUD_BASE}/phase_knight.png`,
      `${BOSS_CLOUD_BASE}/lunar_myrmidon.png`,
      `${BOSS_CLOUD_BASE}/echo_revenant.png`,
      "/assets/skins/raider_warlord.webp",
      "/assets/skins/lunarhowl_skin.webp",
    ]);
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
    try { _app?.destroy?.(true, { children: true, texture: true, baseTexture: true }); } catch (_) {}

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
      playerY: Math.round(h * 0.90),
      enemyX: Math.round(w * 0.77),
      enemyY: Math.round(h * 0.88),
      impactX: Math.round(w * 0.54),
      impactY: Math.round(h * 0.50),
    };

    roundRect(_scene.bg, 0, 0, w, h, 24, 0x04070e, 0.26);

    clearDraw(_scene.moon);
    try {
      _scene.moon.beginFill(0xff6678, 0.10);
      _scene.moon.drawCircle(w * 0.74, h * 0.18, Math.min(w, h) * 0.18);
      _scene.moon.endFill();
      _scene.moon.beginFill(0xffd6de, 0.05);
      _scene.moon.drawCircle(w * 0.74, h * 0.18, Math.min(w, h) * 0.11);
      _scene.moon.endFill();
    } catch (_) {}

    clearDraw(_scene.haze);
    try {
      _scene.haze.beginFill(0xa81a2f, 0.12);
      _scene.haze.drawEllipse(w * 0.20, h * 0.76, w * 0.24, h * 0.18);
      _scene.haze.endFill();
      _scene.haze.beginFill(0xff5e70, 0.10);
      _scene.haze.drawEllipse(w * 0.74, h * 0.54, w * 0.22, h * 0.22);
      _scene.haze.endFill();
    } catch (_) {}

    clearDraw(_scene.stars);
    try {
      const dots = [[0.14, 0.12], [0.22, 0.18], [0.40, 0.11], [0.58, 0.16], [0.86, 0.14], [0.76, 0.30]];
      for (const dot of dots) {
        _scene.stars.beginFill(0xffffff, 0.12);
        _scene.stars.drawCircle(w * dot[0], h * dot[1], 1.4);
        _scene.stars.endFill();
      }
    } catch (_) {}

    clearDraw(_scene.floor);
    try {
      _scene.floor.beginFill(0x0e121f, 0.48);
      _scene.floor.drawEllipse(w * 0.54, h * 0.88, w * 0.46, h * 0.09);
      _scene.floor.endFill();
    } catch (_) {}

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

    _scene.enemyLabel.text = String(_scene.battle?.enemy?.name || "Blood-Moon Wave");
    _scene.enemyLabel.x = _scene.layout.enemyX;
    _scene.enemyLabel.y = Math.round(h * 0.24);
  }

  function renderDynamic() {
    if (!_scene || !_app) return;

    const now = performance.now() * 0.001;
    const idleP = Math.sin(now * 1.8) * 4;
    const idleE = Math.sin(now * 1.6 + 1.3) * 6;
    const idleMoon = Math.sin(now * 0.8) * 2;

    let playerLunge = 0;
    let playerTilt = 0;
    let enemyShakeX = 0;
    let enemyShakeY = 0;
    let enemySlam = 0;
    let slashAlpha = 0;
    let slashScale = 0.3;
    let ringAlpha = 0;
    let ringScale = 0.2;
    let flashAlpha = 0;
    let damageAlpha = 0;
    let damageLift = 0;
    let critAlpha = 0;
    let critLift = 0;
    let hpTween = 1;

    if (_scene.animating) {
      const dt = Math.min(0.05, _app.ticker.deltaMS / 1000);
      _scene.playTime += dt;
      const t = _scene.playTime;

      if (t < 0.28) {
        const s = Math.sin((t / 0.28) * Math.PI);
        playerLunge = s * 30;
        playerTilt = -s * 0.08;
      }

      if (t > 0.20 && t < 0.64) {
        const s = clamp((t - 0.20) / 0.44, 0, 1);
        const amp = (1 - s) * 14;
        enemyShakeX = Math.sin(s * 32) * amp;
        enemyShakeY = Math.cos(s * 20) * amp * 0.18;
        enemySlam = Math.sin(s * Math.PI) * 0.06;
      }

      const impactIn = clamp((t - 0.18) / 0.16, 0, 1);
      slashAlpha = Math.sin(impactIn * Math.PI) * 0.96;
      slashScale = 0.36 + easeOutCubic(impactIn) * 1.08;
      ringAlpha = Math.sin(clamp((t - 0.18) / 0.46, 0, 1) * Math.PI) * 0.44;
      ringScale = 0.2 + clamp((t - 0.18) / 0.46, 0, 1) * 1.8;
      flashAlpha = Math.sin(clamp((t - 0.16) / 0.26, 0, 1) * Math.PI) * 0.22;

      const damageIn = clamp((t - 0.20) / 0.58, 0, 1);
      damageAlpha = Math.sin(damageIn * Math.PI);
      damageLift = easeOutCubic(damageIn) * 34;

      if (_scene.crit) {
        const critIn = clamp((t - 0.14) / 0.66, 0, 1);
        critAlpha = Math.sin(critIn * Math.PI) * 1.0;
        critLift = easeOutCubic(critIn) * 22;
      }

      hpTween = easeInOutQuad(clamp((t - 0.24) / 0.74, 0, 1));
      if (t >= 1.36) {
        _scene.animating = false;
        _scene.playTime = 0;
      }
    }

    _scene.hpDisplay = _scene.animating ? lerp(_scene.beforeHp, _scene.afterHp, hpTween) : _scene.afterHp;

    _scene.player.x = _scene.layout.playerX + playerLunge;
    _scene.player.y = _scene.layout.playerY + idleP;
    _scene.player.rotation = playerTilt;

    _scene.enemy.x = _scene.layout.enemyX + enemyShakeX;
    _scene.enemy.y = _scene.layout.enemyY + idleE + enemyShakeY;
    _scene.enemy.scale?.set?.(1 + enemySlam);

    _scene.moon.y = idleMoon;

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
      _scene.impactSlash.rotation = -0.38;
    } catch (_) {}
    _scene.impactSlash.x = _scene.layout.impactX;
    _scene.impactSlash.y = _scene.layout.impactY;
    _scene.impactSlash.scale?.set?.(slashScale, 1);

    clearDraw(_scene.impactRing);
    try {
      _scene.impactRing.lineStyle(4, _scene.crit ? 0xffd774 : 0xff8fa0, ringAlpha);
      _scene.impactRing.drawCircle(0, 0, 26 + 26 * ringScale);
    } catch (_) {}
    _scene.impactRing.x = _scene.layout.impactX;
    _scene.impactRing.y = _scene.layout.impactY;

    _scene.damageText.text = `-${Math.max(0, Math.round(_scene.damage))}`;
    _scene.damageText.style.fill = _scene.crit ? 0xffe083 : 0xffffff;
    _scene.damageText.alpha = damageAlpha;
    _scene.damageText.x = _scene.layout.impactX + 8;
    _scene.damageText.y = _scene.layout.impactY - 22 - damageLift;

    _scene.critText.alpha = critAlpha;
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
    const [playerTexture, enemyTexture] = await Promise.all([
      loadTextureSafeMany(resolveBloodMoonPlayerAsset(battle)),
      loadTextureSafeMany(resolveBloodMoonEnemyAsset(battle)),
    ]);
    _scene.playerTexture = playerTexture || null;
    _scene.enemyTexture = enemyTexture || null;
  }

  async function applyBattle(battle, animate) {
    if (!_scene) return;

    _scene.battle = battle || {};
    _scene.beforeHp = Math.max(0, num(battle?.enemy?.hpBefore, battle?.enemy?.hpMax || 0));
    _scene.afterHp = Math.max(0, num(battle?.enemy?.hpAfter, 0));
    _scene.hpMax = Math.max(1, num(battle?.enemy?.hpMax, _scene.beforeHp || 1));
    _scene.damage = Math.max(0, num(battle?.attack?.damage, 0));
    _scene.crit = !!battle?.attack?.crit;
    _scene.hpDisplay = animate ? _scene.beforeHp : _scene.afterHp;
    _scene.playTime = 0;
    _scene.animating = !!animate;

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
  BloodMoonPixi.resolveBloodMoonEnemyAsset = resolveBloodMoonEnemyAsset;

  global.BloodMoonPixi = BloodMoonPixi;
})(window);
