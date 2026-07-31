(function (global) {
  "use strict";

  const VERSION = "elite_combat_stage.js v1.0.0";
  const MAX_METER = 3;
  const AMBIENT_PARTICLES = 28;
  const state = {
    tg: null,
    dbg: false,
    app: null,
    host: null,
    operationId: "",
    generation: 0,
    model: null,
    scene: null,
    cleanup: [],
    animations: new Set(),
    reducedMotion: false,
    hidden: !!document.hidden,
  };

  try { global.__AH_ELITE_COMBAT_STAGE_VER__ = VERSION; } catch (_) {}

  function log(...args) {
    if (state.dbg) console.debug("[EliteCombatStage]", ...args);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function text(value, fallback = "") {
    const out = String(value == null ? "" : value).trim();
    return out || fallback;
  }

  function stageLabel(value, fallback) {
    const label = text(value, fallback).toUpperCase();
    return label.length > 30 ? `${label.slice(0, 29)}…` : label;
  }

  function addCleanup(fn) {
    if (typeof fn === "function") state.cleanup.push(fn);
  }

  function runCleanup() {
    const callbacks = state.cleanup.splice(0);
    callbacks.forEach((fn) => {
      try { fn(); } catch (_) {}
    });
  }

  function ensureStyles() {
    if (document.getElementById("ah-elite-stage-css")) return;
    const style = document.createElement("style");
    style.id = "ah-elite-stage-css";
    style.textContent = `
      .ah-elite-stage-host{
        position:relative;
        width:100%;
        height:clamp(250px, 68vw, 370px);
        min-height:250px;
        margin:12px 0 9px;
        overflow:hidden;
        border:1px solid rgba(123,183,206,.20);
        border-radius:14px;
        background:
          radial-gradient(circle at 78% 34%, rgba(76,121,139,.15), transparent 31%),
          linear-gradient(180deg, #0a1119 0%, #070b10 62%, #030507 100%);
        contain:layout paint;
      }
      .ah-elite-stage-canvas{
        position:absolute;
        inset:0;
        z-index:2;
        width:100%;
        height:100%;
        opacity:0;
        transition:opacity .18s ease;
      }
      .ah-elite-stage-canvas canvas{
        display:block;
        width:100% !important;
        height:100% !important;
        max-width:100%;
        touch-action:none;
      }
      .ah-elite-stage-host.ah-elite-stage-ready .ah-elite-stage-canvas{ opacity:1; }
      .ah-elite-stage-host .m-elite-static-fallback{
        position:absolute;
        inset:0;
        z-index:1;
        padding:8px;
        transition:opacity .16s ease, visibility .16s ease;
      }
      .ah-elite-stage-host.ah-elite-stage-ready .m-elite-static-fallback{
        opacity:0;
        visibility:hidden;
        pointer-events:none;
      }
      @media (max-width:360px){
        .ah-elite-stage-host{
          height:244px;
          min-height:244px;
          border-radius:12px;
        }
      }
      @media (min-width:720px){
        .ah-elite-stage-host{ height:350px; }
      }
      @media (prefers-reduced-motion:reduce){
        .ah-elite-stage-canvas,
        .ah-elite-stage-host .m-elite-static-fallback{ transition:none; }
      }
    `;
    document.head.appendChild(style);
  }

  function cancelAnimations() {
    const pending = Array.from(state.animations);
    state.animations.clear();
    pending.forEach((record) => {
      try { global.cancelAnimationFrame(record.raf); } catch (_) {}
      try { record.resolve(false); } catch (_) {}
    });
  }

  function destroy() {
    state.generation += 1;
    cancelAnimations();
    runCleanup();
    const host = state.host;
    try { host?.classList?.remove("ah-elite-stage-ready"); } catch (_) {}
    try {
      state.app?.destroy?.({ removeView: true }, {
        children: true,
        texture: false,
        textureSource: false,
        baseTexture: false,
      });
    } catch (_) {
      try {
        state.app?.destroy?.(true, { children: true, texture: false, baseTexture: false });
      } catch (_) {}
    }
    try { host?.querySelector?.(".ah-elite-stage-canvas")?.remove?.(); } catch (_) {}
    state.app = null;
    state.host = null;
    state.operationId = "";
    state.model = null;
    state.scene = null;
    state.hidden = !!document.hidden;
  }

  function init({ tg, dbg } = {}) {
    state.tg = tg || state.tg || global.Telegram?.WebApp || null;
    state.dbg = typeof dbg === "boolean" ? dbg : state.dbg;
    ensureStyles();
    return API;
  }

  async function createApplication(host) {
    if (!global.PIXI?.Application) throw new Error("Pixi core is unavailable");
    const options = {
      resizeTo: host,
      antialias: true,
      autoDensity: true,
      backgroundAlpha: 0,
      powerPreference: "low-power",
      resolution: Math.min(1.75, global.devicePixelRatio || 1),
    };

    let app = new global.PIXI.Application();
    if (typeof app.init === "function") {
      await app.init(options);
      return app;
    }
    try { app.destroy?.(); } catch (_) {}
    return new global.PIXI.Application(options);
  }

  async function loadTexture(url, generation) {
    if (!url) return null;
    let texture = null;
    if (global.PIXI.Assets?.load) {
      const loaded = await global.PIXI.Assets.load(url);
      texture = loaded?.texture || loaded;
    } else {
      texture = global.PIXI.Texture?.from?.(url) || null;
      const source = texture?.baseTexture || texture?.source;
      if (source?.valid === false && typeof source.once === "function") {
        await new Promise((resolve, reject) => {
          source.once("loaded", resolve);
          source.once("error", reject);
        });
      }
    }
    if (generation !== state.generation) return null;
    return texture;
  }

  function makeText(value, style) {
    return new global.PIXI.Text(text(value), new global.PIXI.TextStyle(style));
  }

  function makeProceduralActor(tone) {
    const g = new global.PIXI.Graphics();
    const fill = tone === "enemy" ? 0x8b4b42 : 0x3e8da6;
    g.beginFill(0x071019, 0.98).drawEllipse(0, -82, 34, 40).endFill();
    g.beginFill(fill, 0.82).drawPolygon([-43, -56, -27, -105, 0, -122, 27, -105, 43, -56, 31, 4, -31, 4]).endFill();
    g.beginFill(0xd9f6ff, 0.72).drawCircle(tone === "enemy" ? -10 : 10, -83, 3).endFill();
    g.lineStyle(2, tone === "enemy" ? 0xd98269 : 0x70cbe6, 0.65).moveTo(-31, -5).lineTo(-42, 32).moveTo(31, -5).lineTo(42, 32);
    return g;
  }

  function makeActor(texture, side) {
    const container = new global.PIXI.Container();
    const shadow = new global.PIXI.Graphics();
    shadow.beginFill(0x000000, 0.56).drawEllipse(0, 4, 58, 13).endFill();
    container.addChild(shadow);

    let visual;
    if (texture) {
      visual = new global.PIXI.Sprite(texture);
      visual.anchor?.set?.(0.5, 1);
    } else {
      visual = makeProceduralActor(side);
      visual.y = 0;
    }
    container.addChild(visual);
    return {
      container,
      visual,
      shadow,
      side,
      sourceWidth: Math.abs(Number(texture?.width || visual.width || 100)) || 100,
      sourceHeight: Math.abs(Number(texture?.height || visual.height || 150)) || 150,
      baseX: 0,
      baseY: 0,
      fitScale: 1,
      fxX: 0,
      fxY: 0,
      fxRotation: 0,
      fxScaleX: 1,
      fxScaleY: 1,
      tint: 0xffffff,
    };
  }

  function drawEnvironment(scene, width, height) {
    const bg = scene.background;
    bg.clear();
    bg.beginFill(0x09121b, 1).drawRect(0, 0, width, height).endFill();
    bg.beginFill(0x101d27, 0.92).drawRect(0, height * 0.38, width, height * 0.62).endFill();
    bg.beginFill(0x06090d, 0.84).drawPolygon([
      0, height * 0.53,
      width * 0.12, height * 0.35,
      width * 0.22, height * 0.47,
      width * 0.34, height * 0.29,
      width * 0.46, height * 0.52,
      width * 0.62, height * 0.32,
      width * 0.78, height * 0.48,
      width * 0.91, height * 0.31,
      width, height * 0.44,
      width, height,
      0, height,
    ]).endFill();
    bg.beginFill(0x020405, 0.92).drawPolygon([
      0, height * 0.76,
      width * 0.18, height * 0.69,
      width * 0.39, height * 0.78,
      width * 0.58, height * 0.68,
      width * 0.8, height * 0.75,
      width, height * 0.66,
      width, height,
      0, height,
    ]).endFill();
    bg.lineStyle(1, 0x73b9cc, 0.08);
    for (let y = height * 0.52; y < height; y += 22) {
      bg.moveTo(0, y).lineTo(width, y + 5);
    }
  }

  function drawMeter(meter, value, width) {
    const ratio = clamp(value, 0, MAX_METER) / MAX_METER;
    meter.track.clear().beginFill(0x020508, 0.78).drawRoundedRect(0, 0, width, 8, 4).endFill();
    meter.fill.clear();
    if (ratio > 0) {
      meter.fill.beginFill(meter.color, 0.92).drawRoundedRect(1, 1, Math.max(3, (width - 2) * ratio), 6, 3).endFill();
    }
    meter.value.text = `${Math.round(clamp(value, 0, MAX_METER))}/${MAX_METER}`;
    meter.value.x = width - meter.value.width;
  }

  function createMeter(label, color) {
    const container = new global.PIXI.Container();
    const title = makeText(label, {
      fill: 0xc5d8e2,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1,
    });
    const value = makeText("3/3", { fill: 0xffffff, fontSize: 9, fontWeight: "800" });
    const track = new global.PIXI.Graphics();
    const fill = new global.PIXI.Graphics();
    track.y = fill.y = 14;
    container.addChild(title, value, track, fill);
    return { container, title, value, track, fill, color };
  }

  function updateIntent(scene, intent) {
    const key = text(intent, "SIGNAL_SHIFT").toUpperCase();
    const palette = {
      HEAVY_ASSAULT: 0xd97a66,
      FORTIFY: 0x78b9d6,
      EXPOSED: 0xe2b45e,
      SIGNAL_SHIFT: 0xa5b4c2,
    };
    scene.intentText.text = key.replaceAll("_", " ");
    scene.intentText.style.fill = palette[key] || palette.SIGNAL_SHIFT;
    scene.intentGlyph.clear();
    const color = palette[key] || palette.SIGNAL_SHIFT;
    if (key === "FORTIFY") {
      scene.intentGlyph.lineStyle(2, color, 0.8).drawCircle(0, 0, 13).drawCircle(0, 0, 8);
    } else if (key === "EXPOSED") {
      scene.intentGlyph.lineStyle(2, color, 0.85).drawCircle(0, 0, 10).moveTo(-16, 0).lineTo(-7, 0).moveTo(7, 0).lineTo(16, 0).moveTo(0, -16).lineTo(0, -7).moveTo(0, 7).lineTo(0, 16);
    } else {
      scene.intentGlyph.lineStyle(2, color, 0.85).moveTo(-13, -8).lineTo(0, 0).lineTo(-13, 8).moveTo(-5, -8).lineTo(8, 0).lineTo(-5, 8);
    }
  }

  function layout() {
    const { host, scene, model } = state;
    if (!host || !scene || !model) return;
    const width = Math.max(280, host.clientWidth || 360);
    const height = Math.max(230, host.clientHeight || 280);
    drawEnvironment(scene, width, height);

    scene.hud.x = 12;
    scene.hud.y = 9;
    scene.roundText.text = `ROUND ${clamp(model.round || 1, 1, model.roundCount || 3)} / ${Math.max(1, Number(model.roundCount) || 3)}`;
    scene.planText.text = text(model.planLabel, "STANDARD PLAN").toUpperCase();
    scene.planText.x = Math.max(105, width - scene.planText.width - 12);

    const meterWidth = Math.max(88, Math.min(150, width * 0.33));
    scene.stability.container.x = 12;
    scene.stability.container.y = 35;
    scene.control.container.x = width - meterWidth - 12;
    scene.control.container.y = 35;
    drawMeter(scene.stability, model.enemyStability, meterWidth);
    drawMeter(scene.control, model.operationControl, meterWidth);

    const baseline = height * 0.87;
    const maxActorHeight = Math.max(112, height * 0.56);
    const maxActorWidth = Math.max(78, width * 0.26);
    [scene.player, scene.enemy].forEach((actor, index) => {
      const visual = actor.visual;
      const sourceWidth = actor.sourceWidth;
      const sourceHeight = actor.sourceHeight;
      actor.fitScale = Math.min(maxActorWidth / sourceWidth, maxActorHeight / sourceHeight);
      if (!actor.visual.texture) actor.fitScale = Math.min(1.08, maxActorHeight / 150);
      visual.scale?.set?.(actor.fitScale * (index === 1 ? -1 : 1), actor.fitScale);
      actor.baseX = width * (index === 0 ? 0.27 : 0.73);
      actor.baseY = baseline;
    });

    scene.intent.x = Math.min(width - 55, scene.enemy.baseX + 2);
    scene.intent.y = Math.max(76, baseline - maxActorHeight - 2);
    scene.intentText.x = -scene.intentText.width / 2;
    scene.intentText.y = 18;
    scene.playerName.x = Math.max(8, scene.player.baseX - scene.playerName.width / 2);
    scene.enemyName.x = Math.min(width - scene.enemyName.width - 8, Math.max(8, scene.enemy.baseX - scene.enemyName.width / 2));
    scene.playerName.y = scene.enemyName.y = height - 21;
  }

  function buildScene(app, config, playerTexture, enemyTexture) {
    const stage = app.stage;
    const background = new global.PIXI.Graphics();
    const particles = new global.PIXI.Container();
    const actors = new global.PIXI.Container();
    const effects = new global.PIXI.Container();
    const hud = new global.PIXI.Container();
    stage.addChild(background, particles, actors, effects, hud);

    const player = makeActor(playerTexture, "player");
    const enemy = makeActor(enemyTexture, "enemy");
    actors.addChild(player.container, enemy.container);

    const roundText = makeText("", { fill: 0xe9f4f7, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 });
    const planText = makeText("", { fill: 0xd7a956, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 });
    hud.addChild(roundText, planText);

    const stability = createMeter("ENEMY STABILITY", 0xd69b54);
    const control = createMeter("OPERATION CONTROL", 0x5fc1d8);
    hud.addChild(stability.container, control.container);

    const intent = new global.PIXI.Container();
    const intentGlyph = new global.PIXI.Graphics();
    const intentText = makeText("", { fill: 0xd9e2e8, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 });
    intent.addChild(intentGlyph, intentText);
    hud.addChild(intent);

    const playerName = makeText(stageLabel(config.player?.displayName, "ALPHA PACK"), {
      fill: 0xa6d9e7, fontSize: 9, fontWeight: "800", letterSpacing: 0.7,
    });
    const enemyName = makeText(stageLabel(config.enemy?.displayName, "ELITE TARGET"), {
      fill: 0xe0c3a6, fontSize: 9, fontWeight: "800", letterSpacing: 0.7,
    });
    hud.addChild(playerName, enemyName);

    for (let i = 0; i < AMBIENT_PARTICLES; i += 1) {
      const particle = new global.PIXI.Graphics();
      const warm = i % 5 === 0;
      particle.beginFill(warm ? 0xd7a457 : 0x83b9c8, warm ? 0.34 : 0.2).drawCircle(0, 0, warm ? 1.4 : 1).endFill();
      particle.__seedX = (i * 37 % 101) / 100;
      particle.__seedY = (i * 61 % 97) / 100;
      particle.__speed = 0.08 + (i % 7) * 0.025;
      particles.addChild(particle);
    }

    const scene = {
      background,
      particles,
      actors,
      effects,
      hud,
      player,
      enemy,
      roundText,
      planText,
      stability,
      control,
      intent,
      intentGlyph,
      intentText,
      playerName,
      enemyName,
      elapsed: 0,
    };
    updateIntent(scene, config.enemyIntent);
    return scene;
  }

  function resetActor(actor) {
    if (!actor) return;
    actor.fxX = 0;
    actor.fxY = 0;
    actor.fxRotation = 0;
    actor.fxScaleX = 1;
    actor.fxScaleY = 1;
    try {
      actor.visual.tint = 0xffffff;
      actor.visual.alpha = 1;
    } catch (_) {}
  }

  function renderActor(actor, elapsed) {
    if (!actor) return;
    const idle = state.reducedMotion || state.hidden ? 0 : Math.sin(elapsed * 0.0022 + (actor.side === "enemy" ? 1.4 : 0));
    const sway = state.reducedMotion || state.hidden ? 0 : Math.sin(elapsed * 0.0013 + (actor.side === "enemy" ? 0.8 : 0)) * 0.008;
    actor.container.x = actor.baseX + actor.fxX;
    actor.container.y = actor.baseY + actor.fxY + idle * 2.2;
    actor.container.rotation = actor.fxRotation + sway;
    actor.container.scale.set(actor.fxScaleX, actor.fxScaleY);
    actor.shadow.scale.x = 1 - idle * 0.025;
    actor.shadow.alpha = 0.48 - idle * 0.025;
  }

  function installTicker(app, scene, generation) {
    const tick = (ticker) => {
      if (generation !== state.generation || state.hidden) return;
      const deltaMs = Number(ticker?.deltaMS) || (Number(ticker) || 1) * 16.667;
      scene.elapsed += Math.min(50, deltaMs);
      renderActor(scene.player, scene.elapsed);
      renderActor(scene.enemy, scene.elapsed);
      const intentKey = text(state.model?.enemyIntent).toUpperCase();
      const intentPulse = 1 + Math.sin(scene.elapsed * (intentKey === "HEAVY_ASSAULT" ? 0.006 : 0.0035)) * 0.045;
      scene.intentGlyph.scale.set(intentPulse);
      scene.intentGlyph.alpha = 0.72 + Math.sin(scene.elapsed * 0.004) * 0.16;
      const width = state.host?.clientWidth || 360;
      const height = state.host?.clientHeight || 280;
      scene.particles.children.forEach((particle, index) => {
        const t = scene.elapsed * particle.__speed * 0.012;
        particle.x = (particle.__seedX * width + t * 9) % (width + 20) - 10;
        particle.y = height - ((particle.__seedY * height * 0.75 + t * 5) % (height * 0.72));
        particle.alpha = 0.12 + ((index % 4) * 0.045);
      });
    };
    app.ticker.add(tick);
    addCleanup(() => {
      try { app.ticker.remove(tick); } catch (_) {}
    });
  }

  function installLifecycle(app, generation) {
    const onResize = () => {
      if (generation !== state.generation) return;
      try { layout(); } catch (error) { log("layout failed", error); }
    };
    global.addEventListener("resize", onResize, { passive: true });
    addCleanup(() => global.removeEventListener("resize", onResize));

    let resizeObserver = null;
    if (global.ResizeObserver) {
      resizeObserver = new global.ResizeObserver(onResize);
      resizeObserver.observe(state.host);
      addCleanup(() => resizeObserver?.disconnect?.());
    }

    const onVisibility = () => {
      if (generation !== state.generation) return;
      state.hidden = !!document.hidden;
      try {
        if (state.hidden) app.ticker.stop();
        else app.ticker.start();
      } catch (_) {}
    };
    document.addEventListener("visibilitychange", onVisibility);
    addCleanup(() => document.removeEventListener("visibilitychange", onVisibility));

    if (global.MutationObserver) {
      const observer = new global.MutationObserver(() => {
        if (generation === state.generation && state.host && !state.host.isConnected) destroy();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      addCleanup(() => observer.disconnect());
    }
  }

  async function mount(container, config = {}) {
    if (!container || !container.isConnected) throw new Error("Elite stage host is missing");
    const operationId = text(config.operationId);
    if (!operationId) throw new Error("Elite stage operationId is missing");
    ensureStyles();

    if (state.app && state.host === container && state.operationId === operationId) {
      sync(config);
      return true;
    }

    destroy();
    const generation = state.generation;
    state.host = container;
    state.operationId = operationId;
    state.reducedMotion = !!config.reducedMotion;
    state.model = {
      ...config,
      operationId,
      roundCount: Math.max(1, Number(config.roundCount) || 3),
      enemyStability: clamp(config.enemyStability, 0, MAX_METER),
      operationControl: clamp(config.operationControl, 0, MAX_METER),
    };
    container.classList.add("ah-elite-stage-host");
    container.classList.remove("ah-elite-stage-ready");
    container.setAttribute("aria-label", text(container.getAttribute("aria-label"), "Elite tactical combat scene"));

    try {
      const app = await createApplication(container);
      if (generation !== state.generation || !container.isConnected) {
        try { app.destroy?.(true); } catch (_) {}
        return false;
      }
      state.app = app;

      const [playerTexture, enemyTexture] = await Promise.all([
        loadTexture(text(config.player?.src), generation),
        loadTexture(text(config.enemy?.src), generation),
      ]);
      if (generation !== state.generation || !container.isConnected) return false;
      if (config.player?.src && !playerTexture) throw new Error("Player texture failed to load");
      if (config.enemy?.src && !enemyTexture) throw new Error("Enemy texture failed to load");

      const canvasWrap = document.createElement("div");
      canvasWrap.className = "ah-elite-stage-canvas";
      canvasWrap.setAttribute("aria-hidden", "true");
      const canvas = app.canvas || app.view;
      if (!canvas) throw new Error("Pixi canvas is unavailable");
      canvasWrap.appendChild(canvas);
      container.appendChild(canvasWrap);

      state.scene = buildScene(app, state.model, playerTexture, enemyTexture);
      installTicker(app, state.scene, generation);
      installLifecycle(app, generation);
      layout();
      container.classList.add("ah-elite-stage-ready");
      log("mounted", { operationId, reducedMotion: state.reducedMotion });
      return true;
    } catch (error) {
      log("mount failed; static fallback retained", error?.message || error);
      if (generation === state.generation) destroy();
      throw error;
    }
  }

  function sync(config = {}) {
    if (!state.scene || !state.model) return false;
    if (config.operationId && text(config.operationId) !== state.operationId) return false;
    state.model = {
      ...state.model,
      ...config,
      enemyStability: config.enemyStability == null ? state.model.enemyStability : clamp(config.enemyStability, 0, MAX_METER),
      operationControl: config.operationControl == null ? state.model.operationControl : clamp(config.operationControl, 0, MAX_METER),
    };
    state.reducedMotion = config.reducedMotion == null ? state.reducedMotion : !!config.reducedMotion;
    updateIntent(state.scene, state.model.enemyIntent);
    layout();
    return true;
  }

  function tween(duration, update) {
    const generation = state.generation;
    if (state.reducedMotion || state.hidden || duration <= 0) {
      try { update(1); } catch (_) {}
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const record = { raf: 0, resolve };
      const start = performance.now();
      const step = (now) => {
        if (generation !== state.generation || !state.app) {
          state.animations.delete(record);
          resolve(false);
          return;
        }
        const progress = clamp((now - start) / duration, 0, 1);
        try { update(progress); } catch (_) {}
        if (progress >= 1) {
          state.animations.delete(record);
          resolve(true);
          return;
        }
        record.raf = global.requestAnimationFrame(step);
      };
      state.animations.add(record);
      record.raf = global.requestAnimationFrame(step);
    });
  }

  function easeOut(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function clearEffects() {
    try {
      const removed = state.scene?.effects?.removeChildren?.() || [];
      removed.forEach((child) => {
        try { child.destroy?.({ children: true }); } catch (_) {}
      });
    } catch (_) {}
  }

  function makeFeedback(label, color) {
    const scene = state.scene;
    const node = makeText(label, {
      fill: color,
      fontSize: 14,
      fontWeight: "900",
      letterSpacing: 1.2,
      stroke: { color: 0x020406, width: 4 },
    });
    node.anchor?.set?.(0.5);
    node.x = (state.host?.clientWidth || 360) * 0.5;
    node.y = (state.host?.clientHeight || 280) * 0.42;
    scene.effects.addChild(node);
    return node;
  }

  async function animateMeters(args) {
    const scene = state.scene;
    const meterWidth = Math.max(88, Math.min(150, (state.host?.clientWidth || 360) * 0.33));
    const fromStability = clamp(args.previousEnemyStability, 0, MAX_METER);
    const toStability = clamp(args.enemyStability, 0, MAX_METER);
    const fromControl = clamp(args.previousOperationControl, 0, MAX_METER);
    const toControl = clamp(args.operationControl, 0, MAX_METER);
    await tween(280, (p) => {
      const eased = easeOut(p);
      drawMeter(scene.stability, fromStability + ((toStability - fromStability) * eased), meterWidth);
      drawMeter(scene.control, fromControl + ((toControl - fromControl) * eased), meterWidth);
    });
  }

  function canonicalFeedback(args) {
    if (text(args.resultText)) return text(args.resultText).toUpperCase();
    if (args.correct) {
      if (args.action === "GUARD") return "GUARDED";
      if (args.action === "EXPLOIT") return "BREACH";
      return "CLEAN COUNTER";
    }
    if (args.action === "GUARD") return "BYPASSED";
    if (args.action === "EXPLOIT") return "INTERFERENCE";
    return "RESISTED";
  }

  async function playStrike(args) {
    const { player, enemy, effects, actors } = state.scene;
    const direction = Math.max(36, (enemy.baseX - player.baseX) * 0.34);
    await tween(155, (p) => {
      player.fxX = easeOut(p) * direction;
      player.fxRotation = p * 0.045;
      player.fxScaleX = 1 + p * 0.035;
      player.fxScaleY = 1 - p * 0.025;
    });

    const slash = new global.PIXI.Graphics();
    slash.lineStyle(4, args.correct ? 0xd9b56b : 0x84a9b5, 0.9)
      .moveTo(player.baseX + direction - 8, player.baseY - 112)
      .lineTo(enemy.baseX - 18, enemy.baseY - 32);
    effects.addChild(slash);

    await tween(220, (p) => {
      slash.alpha = 1 - p;
      if (args.correct) {
        enemy.fxX = Math.sin(p * Math.PI * 3) * 7 - easeOut(p) * 7;
        enemy.fxRotation = -Math.sin(p * Math.PI) * 0.06;
        enemy.visual.tint = p < 0.45 ? 0xffd7bb : 0xffffff;
        actors.x = Math.sin(p * Math.PI * 4) * 1.8;
      } else {
        player.fxX = direction * (1 - p) - Math.sin(p * Math.PI) * 14;
        player.visual.tint = p < 0.55 ? 0x7ec7d6 : 0xffffff;
      }
    });
    await animateMeters(args);
    await tween(160, (p) => {
      player.fxX *= (1 - p);
      enemy.fxX *= (1 - p);
      player.fxRotation *= (1 - p);
      enemy.fxRotation *= (1 - p);
      slash.alpha = 0;
      actors.x = 0;
    });
  }

  async function playGuard(args) {
    const { player, enemy, effects } = state.scene;
    const barrier = new global.PIXI.Graphics();
    effects.addChild(barrier);
    await tween(190, (p) => {
      const radius = 26 + easeOut(p) * 45;
      barrier.clear().lineStyle(3, args.correct ? 0x75c9e1 : 0x7695a2, 0.9 * (1 - p * 0.2))
        .drawCircle(player.baseX, player.baseY - 65, radius);
      player.fxScaleX = 1 - p * 0.035;
      player.fxScaleY = 1 + p * 0.025;
      player.fxX = -p * 5;
    });
    await tween(230, (p) => {
      enemy.fxX = -Math.sin(p * Math.PI) * 12;
      barrier.alpha = args.correct ? 1 - p * 0.45 : 1 - p;
      if (!args.correct) {
        player.fxX = Math.sin(p * Math.PI * 4) * 5;
        player.visual.tint = p < 0.5 ? 0x9ab9c3 : 0xffffff;
      }
    });
    await animateMeters(args);
    await tween(150, (p) => {
      barrier.alpha = 1 - p;
      player.fxX *= 1 - p;
      enemy.fxX *= 1 - p;
      player.fxScaleX = 1 - 0.035 * (1 - p);
      player.fxScaleY = 1 + 0.025 * (1 - p);
    });
  }

  async function playExploit(args) {
    const { player, enemy, effects } = state.scene;
    const scan = new global.PIXI.Graphics();
    effects.addChild(scan);
    await tween(240, (p) => {
      const radius = 52 - easeOut(p) * 24;
      scan.clear().lineStyle(2, args.correct ? 0xe2b45e : 0x699aaa, 0.85)
        .drawCircle(enemy.baseX, enemy.baseY - 70, radius)
        .moveTo(enemy.baseX - radius - 8, enemy.baseY - 70)
        .lineTo(enemy.baseX - radius + 8, enemy.baseY - 70)
        .moveTo(enemy.baseX + radius - 8, enemy.baseY - 70)
        .lineTo(enemy.baseX + radius + 8, enemy.baseY - 70);
      enemy.fxScaleX = 1 + Math.sin(p * Math.PI * 5) * 0.008;
    });
    await tween(args.correct ? 110 : 190, (p) => {
      scan.alpha = 0.9 - p * 0.25;
      if (!args.correct) {
        player.fxX = Math.sin(p * Math.PI * 6) * 4;
        player.visual.tint = p < 0.7 ? 0x6fb6c9 : 0xffffff;
      }
    });
    if (args.correct) {
      const beam = new global.PIXI.Graphics();
      beam.lineStyle(3, 0xe8c574, 0.95)
        .moveTo(player.baseX + 24, player.baseY - 72)
        .lineTo(enemy.baseX, enemy.baseY - 70);
      effects.addChild(beam);
      await tween(190, (p) => {
        player.fxX = Math.sin(p * Math.PI) * 16;
        enemy.fxX = Math.sin(p * Math.PI * 4) * 4 - easeOut(p) * 6;
        enemy.visual.tint = p < 0.5 ? 0xffe0a1 : 0xffffff;
        beam.alpha = 1 - p;
      });
    }
    await animateMeters(args);
    await tween(140, (p) => {
      scan.alpha = 1 - p;
      player.fxX *= 1 - p;
      enemy.fxX *= 1 - p;
      enemy.fxScaleX = 1;
    });
  }

  async function playFinish(args) {
    const { player, enemy } = state.scene;
    const result = text(args.operationResult).toUpperCase();
    const won = result && result !== "FAILED_OPERATION";
    if (!args.completed) return;
    await tween(220, (p) => {
      if (won) {
        enemy.visual.alpha = 1 - p * 0.72;
        enemy.fxY = easeOut(p) * 12;
        enemy.fxRotation = p * 0.08;
        player.fxY = -Math.sin(p * Math.PI) * 3;
      } else {
        player.visual.alpha = 1 - p * 0.34;
        player.fxX = -easeOut(p) * 16;
        player.fxY = easeOut(p) * 7;
      }
    });
  }

  async function playRound(args = {}) {
    if (!state.scene || !state.app) return false;
    if (args.operationId && text(args.operationId) !== state.operationId) return false;
    const generation = state.generation;
    cancelAnimations();
    clearEffects();
    resetActor(state.scene.player);
    resetActor(state.scene.enemy);

    const action = text(args.action).toUpperCase();
    const payload = {
      ...args,
      action,
      correct: !!args.correct,
      previousEnemyStability: clamp(args.previousEnemyStability, 0, MAX_METER),
      enemyStability: clamp(args.enemyStability, 0, MAX_METER),
      previousOperationControl: clamp(args.previousOperationControl, 0, MAX_METER),
      operationControl: clamp(args.operationControl, 0, MAX_METER),
    };
    state.model = {
      ...state.model,
      round: Number(args.round || state.model.round || 1),
      enemyIntent: text(args.enemyIntent, state.model.enemyIntent),
      enemyStability: payload.previousEnemyStability,
      operationControl: payload.previousOperationControl,
    };
    updateIntent(state.scene, state.model.enemyIntent);
    layout();
    const deltas = [];
    if (Number(payload.stabilityDelta) < 0) deltas.push(`STABILITY ${Number(payload.stabilityDelta)}`);
    if (Number(payload.controlDelta) < 0) deltas.push(`CONTROL ${Number(payload.controlDelta)}`);
    const label = [canonicalFeedback(payload), ...deltas].join("  /  ");
    const feedback = makeFeedback(label, payload.correct ? 0xf0d08a : 0x9ec3ce);
    feedback.alpha = 0;
    await tween(100, (p) => { feedback.alpha = p; feedback.y -= 0.025; });

    try {
      if (action === "GUARD") await playGuard(payload);
      else if (action === "EXPLOIT") await playExploit(payload);
      else await playStrike(payload);
      await playFinish(payload);
      if (generation !== state.generation) return false;
      state.model = {
        ...state.model,
        round: args.nextRound == null ? state.model.round : args.nextRound,
        enemyIntent: text(args.nextEnemyIntent, state.model.enemyIntent),
        enemyStability: payload.enemyStability,
        operationControl: payload.operationControl,
      };
      updateIntent(state.scene, state.model.enemyIntent);
      layout();
      await tween(100, (p) => { feedback.alpha = 1 - p; });
      try {
        state.tg?.HapticFeedback?.impactOccurred?.(payload.correct ? "medium" : "light");
      } catch (_) {}
      return true;
    } finally {
      if (generation === state.generation) {
        resetActor(state.scene?.player);
        resetActor(state.scene?.enemy);
        clearEffects();
      }
    }
  }

  // Presentation-only lifecycle. Missions owns requests and passes canonical state here.
  const API = { init, mount, sync, playRound, destroy };
  global.EliteCombatStage = API;
})(window);
