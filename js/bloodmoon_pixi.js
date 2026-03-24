(function (global) {
  const BloodMoonPixi = {};

  let _host = null;
  let _app = null;
  let _opts = {};
  let _resizeHandler = null;
  let _tick = null;
  let _scene = null;

  const VER = "bloodmoon_pixi.js v1-2026-03-24";
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

  function initials(name, fallback = "?") {
    const raw = String(name || fallback || "?").replace(/^@/, "").trim();
    if (!raw) return String(fallback || "?").slice(0, 2).toUpperCase();
    const parts = raw.split(/\s+/).filter(Boolean).slice(0, 2);
    const out = parts.map((part) => part.charAt(0)).join("").toUpperCase();
    return out || raw.slice(0, 2).toUpperCase();
  }

  function hasPixi() {
    const P = global.PIXI;
    return !!(P && P.Application && P.Graphics && P.Container);
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
    const baseOpts = {
      width: size.width,
      height: size.height,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(global.devicePixelRatio || 1, 2),
    };

    if (P.Application?.prototype?.init) {
      const app = new P.Application();
      await app.init(baseOpts);
      return app;
    }

    return new P.Application(baseOpts);
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
  }

  function buildScene() {
    const P = global.PIXI;
    const stage = _app.stage;
    stage.removeChildren();

    const bg = new P.Graphics();
    const haze = new P.Graphics();
    const floor = new P.Graphics();
    const moon = new P.Graphics();
    const stars = new P.Graphics();

    const hpBack = new P.Graphics();
    const hpGhost = new P.Graphics();
    const hpFill = new P.Graphics();
    const hpText = makeText("", { fontFamily: "system-ui", fontSize: 11, fill: 0xffd5db, fontWeight: "800" });
    setAnchor(hpText, 0.5, 0.5);

    const player = new P.Container();
    const playerRing = new P.Graphics();
    const playerBody = new P.Graphics();
    const playerCore = new P.Graphics();
    const playerInitial = makeText("Y", { fontFamily: "system-ui", fontSize: 20, fill: 0xffffff, fontWeight: "900" });
    const playerName = makeText("YOU", { fontFamily: "system-ui", fontSize: 13, fill: 0xffffff, fontWeight: "800" });
    const playerSub = makeText("", { fontFamily: "system-ui", fontSize: 10, fill: 0xffa0af, fontWeight: "700" });
    setAnchor(playerInitial, 0.5, 0.5);
    setAnchor(playerName, 0.5, 0.5);
    setAnchor(playerSub, 0.5, 0.5);
    player.addChild(playerRing, playerBody, playerCore, playerInitial, playerName, playerSub);

    const enemy = new P.Container();
    const enemyRing = new P.Graphics();
    const enemyBody = new P.Graphics();
    const enemyCore = new P.Graphics();
    const enemyInitial = makeText("W1", { fontFamily: "system-ui", fontSize: 22, fill: 0xffffff, fontWeight: "900" });
    const enemyName = makeText("WAVE", { fontFamily: "system-ui", fontSize: 13, fill: 0xffffff, fontWeight: "800" });
    const enemySub = makeText("", { fontFamily: "system-ui", fontSize: 10, fill: 0xff9cab, fontWeight: "700" });
    setAnchor(enemyInitial, 0.5, 0.5);
    setAnchor(enemyName, 0.5, 0.5);
    setAnchor(enemySub, 0.5, 0.5);
    enemy.addChild(enemyRing, enemyBody, enemyCore, enemyInitial, enemyName, enemySub);

    const impactSlash = new P.Graphics();
    const impactRing = new P.Graphics();
    const damageText = makeText("-0", { fontFamily: "system-ui", fontSize: 24, fill: 0xffffff, fontWeight: "900" });
    const critText = makeText("CRIT", { fontFamily: "system-ui", fontSize: 14, fill: 0xffdf84, fontWeight: "900" });
    setAnchor(damageText, 0.5, 0.5);
    setAnchor(critText, 0.5, 0.5);
    damageText.alpha = 0;
    critText.alpha = 0;

    stage.addChild(bg, stars, moon, haze, floor, hpBack, hpGhost, hpFill, hpText, player, enemy, impactSlash, impactRing, damageText, critText);

    _scene = {
      bg,
      haze,
      floor,
      moon,
      stars,
      hpBack,
      hpGhost,
      hpFill,
      hpText,
      player,
      playerRing,
      playerBody,
      playerCore,
      playerInitial,
      playerName,
      playerSub,
      enemy,
      enemyRing,
      enemyBody,
      enemyCore,
      enemyInitial,
      enemyName,
      enemySub,
      impactSlash,
      impactRing,
      damageText,
      critText,
      battle: null,
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
    const actorScale = clamp(h / 260, 0.82, 1.08);
    const hpW = Math.round(w * 0.46);
    const hpH = 12;

    _scene.layout = {
      width: w,
      height: h,
      hpX: Math.round((w - hpW) / 2),
      hpY: 22,
      hpW,
      hpH,
      playerX: Math.round(w * 0.22),
      playerY: Math.round(h * 0.60),
      enemyX: Math.round(w * 0.78),
      enemyY: Math.round(h * 0.48),
      impactX: Math.round(w * 0.53),
      impactY: Math.round(h * 0.40),
    };

    roundRect(_scene.bg, 0, 0, w, h, 22, 0x070911, 0.22);

    clearDraw(_scene.moon);
    try {
      _scene.moon.beginFill(0xff5e70, 0.09);
      _scene.moon.drawCircle(w * 0.74, h * 0.18, Math.min(w, h) * 0.16);
      _scene.moon.endFill();
      _scene.moon.beginFill(0xffc8cf, 0.05);
      _scene.moon.drawCircle(w * 0.74, h * 0.18, Math.min(w, h) * 0.10);
      _scene.moon.endFill();
    } catch (_) {}

    clearDraw(_scene.haze);
    try {
      _scene.haze.beginFill(0xb81e2e, 0.10);
      _scene.haze.drawEllipse(w * 0.24, h * 0.68, w * 0.18, h * 0.22);
      _scene.haze.endFill();
      _scene.haze.beginFill(0xff5e70, 0.08);
      _scene.haze.drawEllipse(w * 0.78, h * 0.52, w * 0.16, h * 0.20);
      _scene.haze.endFill();
    } catch (_) {}

    clearDraw(_scene.stars);
    try {
      const dots = [
        [0.18, 0.15], [0.26, 0.11], [0.41, 0.18], [0.58, 0.12],
        [0.64, 0.24], [0.81, 0.10], [0.88, 0.18], [0.74, 0.30],
      ];
      for (const dot of dots) {
        _scene.stars.beginFill(0xffffff, 0.15);
        _scene.stars.drawCircle(w * dot[0], h * dot[1], 1.4);
        _scene.stars.endFill();
      }
    } catch (_) {}

    clearDraw(_scene.floor);
    try {
      _scene.floor.beginFill(0x0e121f, 0.42);
      _scene.floor.drawEllipse(w * 0.50, h * 0.84, w * 0.38, h * 0.10);
      _scene.floor.endFill();
    } catch (_) {}

    circle(_scene.playerRing, 0, 0, 44, 0x39a9ff, 0.10, 0x8ec7ff, 0.22, 2);
    circle(_scene.playerBody, 0, 0, 30, 0x8c1b2d, 0.82);
    circle(_scene.playerCore, 0, 0, 18, 0xff8aa2, 0.40);
    _scene.playerInitial.text = initials(_scene.battle?.player?.name || "You", "Y");
    _scene.playerName.text = String(_scene.battle?.player?.name || "YOU");
    _scene.playerSub.text = String(_scene.battle?.player?.faction || "").toUpperCase() || "FACTION";
    _scene.playerInitial.y = -2;
    _scene.playerName.y = 56;
    _scene.playerSub.y = 72;
    _scene.player.scale?.set?.(actorScale);

    circle(_scene.enemyRing, 0, 0, 52, 0xff9cab, 0.08, 0xff9cab, 0.18, 2);
    circle(_scene.enemyBody, 0, 0, 34, 0x3e0d16, 0.92);
    circle(_scene.enemyCore, 0, 0, 20, 0xff5e70, 0.32);
    _scene.enemyInitial.text = `W${Math.max(1, num(_scene.battle?.wave || 1, 1))}`;
    _scene.enemyName.text = String(_scene.battle?.enemy?.name || "BLOOD-MOON");
    _scene.enemySub.text = _scene.crit ? "CRITICAL THREAT" : "WAVE TARGET";
    _scene.enemyInitial.y = -2;
    _scene.enemyName.y = 64;
    _scene.enemySub.y = 80;
    _scene.enemy.scale?.set?.(actorScale * 1.05);

    roundRect(_scene.hpBack, _scene.layout.hpX, _scene.layout.hpY, hpW, hpH, 999, 0x121824, 0.80, 0xffffff, 0.08, 1);
    _scene.hpText.x = Math.round(w / 2);
    _scene.hpText.y = _scene.layout.hpY - 8;
  }

  function renderDynamic() {
    if (!_scene || !_app) return;

    const now = performance.now() * 0.001;
    const idleP = Math.sin(now * 2.2) * 4;
    const idleE = Math.sin(now * 1.9 + 1.2) * 5;

    let playerLunge = 0;
    let enemyShakeX = 0;
    let enemyShakeY = 0;
    let slashAlpha = 0;
    let slashScale = 0.3;
    let ringAlpha = 0;
    let ringScale = 0.2;
    let damageAlpha = 0;
    let damageLift = 0;
    let critAlpha = 0;
    let critLift = 0;
    let hpTween = 1;

    if (_scene.animating) {
      const dt = Math.min(0.05, _app.ticker.deltaMS / 1000);
      _scene.playTime += dt;
      const t = _scene.playTime;

      if (t < 0.26) playerLunge = Math.sin((t / 0.26) * Math.PI) * 28;

      if (t > 0.20 && t < 0.58) {
        const s = clamp((t - 0.20) / 0.38, 0, 1);
        const amp = (1 - s) * 12;
        enemyShakeX = Math.sin(s * 28) * amp;
        enemyShakeY = Math.cos(s * 22) * amp * 0.22;
      }

      const impactIn = clamp((t - 0.18) / 0.16, 0, 1);
      slashAlpha = Math.sin(impactIn * Math.PI) * 0.95;
      slashScale = 0.4 + easeOutCubic(impactIn) * 0.9;
      ringAlpha = Math.sin(clamp((t - 0.18) / 0.42, 0, 1) * Math.PI) * 0.42;
      ringScale = 0.25 + clamp((t - 0.18) / 0.42, 0, 1) * 1.6;

      const damageIn = clamp((t - 0.20) / 0.54, 0, 1);
      damageAlpha = Math.sin(damageIn * Math.PI);
      damageLift = easeOutCubic(damageIn) * 28;

      if (_scene.crit) {
        const critIn = clamp((t - 0.16) / 0.62, 0, 1);
        critAlpha = Math.sin(critIn * Math.PI) * 0.98;
        critLift = easeOutCubic(critIn) * 18;
      }

      hpTween = easeInOutQuad(clamp((t - 0.22) / 0.68, 0, 1));
      if (t >= 1.26) {
        _scene.animating = false;
        _scene.playTime = 0;
      }
    }

    _scene.hpDisplay = _scene.animating
      ? lerp(_scene.beforeHp, _scene.afterHp, hpTween)
      : _scene.afterHp;

    _scene.player.x = _scene.layout.playerX + playerLunge;
    _scene.player.y = _scene.layout.playerY + idleP;
    _scene.enemy.x = _scene.layout.enemyX + enemyShakeX;
    _scene.enemy.y = _scene.layout.enemyY + idleE + enemyShakeY;

    clearDraw(_scene.hpGhost);
    clearDraw(_scene.hpFill);
    const hpBeforePct = pct(_scene.beforeHp, _scene.hpMax);
    const hpNowPct = pct(_scene.hpDisplay, _scene.hpMax);
    const ghostW = Math.max(8, (_scene.layout.hpW * hpBeforePct) / 100);
    const fillW = Math.max(6, (_scene.layout.hpW * hpNowPct) / 100);
    roundRect(_scene.hpGhost, _scene.layout.hpX, _scene.layout.hpY, ghostW, _scene.layout.hpH, 999, 0x7f1022, 0.34);
    roundRect(_scene.hpFill, _scene.layout.hpX, _scene.layout.hpY, fillW, _scene.layout.hpH, 999, _scene.crit ? 0xffc94f : 0xff5e70, 0.94);
    _scene.hpText.text = `${Math.round(_scene.hpDisplay)} / ${Math.round(_scene.hpMax)} HP`;

    clearDraw(_scene.impactSlash);
    try {
      _scene.impactSlash.beginFill(_scene.crit ? 0xffd36f : 0xff8fa0, slashAlpha);
      _scene.impactSlash.drawRoundedRect(-44, -6, 88, 12, 999);
      _scene.impactSlash.endFill();
      _scene.impactSlash.rotation = -0.36;
    } catch (_) {}
    _scene.impactSlash.x = _scene.layout.impactX;
    _scene.impactSlash.y = _scene.layout.impactY;
    _scene.impactSlash.scale?.set?.(slashScale, 1);

    clearDraw(_scene.impactRing);
    try {
      _scene.impactRing.lineStyle(4, _scene.crit ? 0xffd36f : 0xff8fa0, ringAlpha);
      _scene.impactRing.drawCircle(0, 0, 24 + 20 * ringScale);
    } catch (_) {}
    _scene.impactRing.x = _scene.layout.impactX;
    _scene.impactRing.y = _scene.layout.impactY;

    _scene.damageText.text = `-${Math.max(0, Math.round(_scene.damage))}`;
    _scene.damageText.style.fill = _scene.crit ? 0xffe083 : 0xffffff;
    _scene.damageText.alpha = damageAlpha;
    _scene.damageText.x = _scene.layout.impactX + 6;
    _scene.damageText.y = _scene.layout.impactY - 14 - damageLift;

    _scene.critText.alpha = critAlpha;
    _scene.critText.x = _scene.layout.impactX;
    _scene.critText.y = _scene.layout.impactY - 54 - critLift;
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

  function applyBattle(battle, animate) {
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
    applyBattle(battle, opts.animate !== false);
    return true;
  }

  BloodMoonPixi.init = init;
  BloodMoonPixi.play = play;
  BloodMoonPixi.stop = stop;
  BloodMoonPixi.destroy = destroy;

  global.BloodMoonPixi = BloodMoonPixi;
})(window);
