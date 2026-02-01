// js/arena_pixi.js — Minimal Pixi layer for Arena (works with arena.js dynamic loader)
// Features (MVP):
// - renders 2 actors (uses sprite URL if present, otherwise emoji fallback)
// - simple dash attack + hit squash + floating dmg text
// - safe destroy() to avoid leaks on mobile

(function (global) {
  const S = {
    app: null,
    root: null,
    you: null,
    foe: null,
    bg: null,
    inited: false,
    _idleTick: null,
  };

  function pickSpriteUrl(obj) {
    // Tries common fields. You can later standardize by adding `sprite_url` to p1/p2.
    return (
      obj?.sprite_url ||
      obj?.spriteUrl ||
      obj?.sprite ||
      obj?.img ||
      obj?.image ||
      obj?.icon_url ||
      obj?.iconUrl ||
      obj?.icon ||
      obj?.avatar_url ||
      obj?.avatarUrl ||
      ""
    );
  }

  function clamp(n, a, b) { n = Number(n || 0); return Math.max(a, Math.min(b, n)); }

  function init(rootEl) {
    if (!global.PIXI) throw new Error("PIXI missing");
    if (!rootEl) throw new Error("rootEl missing");

    // If already attached to the same root, keep it.
    if (S.inited && S.app && S.root === rootEl) return;

    // Otherwise full reset and re-init.
    destroy();

    S.root = rootEl;
    S.inited = true;

    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    const app = new global.PIXI.Application({
      resizeTo: rootEl,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: dpr,
    });

    rootEl.innerHTML = "";
    rootEl.appendChild(app.view);
    app.view.style.display = "block";
    app.view.style.width = "100%";
    app.view.style.height = "100%";
    // IMPORTANT: do not steal taps; UI is above
    app.view.style.pointerEvents = "none";

    S.app = app;

    // background layer
    const bg = new global.PIXI.Graphics();
    bg.alpha = 0.55;
    app.stage.addChild(bg);
    S.bg = bg;

    // soft vignette overlay (optional but cheap)
    const vignette = new global.PIXI.Graphics();
    vignette.alpha = 0.25;
    app.stage.addChild(vignette);
    S.vignette = vignette;

    const redraw = () => {
      const w = app.screen.width, h = app.screen.height;

      bg.clear();
      bg.roundRect(0, 0, w, h, 16).fill(0x070b12);

      vignette.clear();
      // draw simple edges
      vignette.rect(0, 0, w, h).fill(0x000000);
      vignette.alpha = 0.18;
    };

    const layout = () => {
      if (!S.app) return;
      const w = S.app.screen.width, h = S.app.screen.height;

      // place actors near bottom, like your DOM layout
      if (S.you) { S.you.x = w * 0.28; S.you.y = h * 0.86; }
      if (S.foe) { S.foe.x = w * 0.72; S.foe.y = h * 0.86; }
    };

    S._redraw = redraw;
    S._layout = layout;

    redraw();
    layout();

    app.renderer.on("resize", () => {
      redraw();
      layout();
    });

    // tiny idle bob so it doesn't feel dead
    let t = 0;
    S._idleTick = (delta) => {
      t += delta;
      if (S.you) S.you.y += Math.sin(t * 0.06) * 0.12;
      if (S.foe) S.foe.y += Math.sin((t + 20) * 0.06) * 0.12;
    };
    app.ticker.add(S._idleTick);
  }

  async function setActors({ you, foe, flipFoe }) {
    if (!S.app) return;

    // cleanup old
    if (S.you) { safeDestroyDisplayObject(S.you); S.you = null; }
    if (S.foe) { safeDestroyDisplayObject(S.foe); S.foe = null; }

    const youUrl = pickSpriteUrl(you);
    const foeUrl = pickSpriteUrl(foe);

    S.you = await makeActor(youUrl, "🐺");
    S.foe = await makeActor(foeUrl, "🐺");

    // ensure consistent anchor bottom-center
    S.you.anchor?.set?.(0.5, 1.0);
    S.foe.anchor?.set?.(0.5, 1.0);

    // flip foe
    if (flipFoe) {
      S.foe.scale.x = -Math.abs(S.foe.scale.x || 1);
    }

    // base scale for sprites/text
    const baseScale = 0.9;
    S.you.scale.set(Math.sign(S.you.scale.x || 1) * baseScale, baseScale);
    S.foe.scale.set(Math.sign(S.foe.scale.x || 1) * baseScale, baseScale);

    // shadow-like filter via alpha + y-offset (cheap)
    S.you.alpha = 0.98;
    S.foe.alpha = 0.98;

    S.app.stage.addChild(S.you);
    S.app.stage.addChild(S.foe);

    S._layout && S._layout();
  }

  async function makeActor(url, fallbackEmoji) {
    const PIXI = global.PIXI;

    if (!url) {
      const t = new PIXI.Text({
        text: fallbackEmoji,
        style: {
          fontFamily: "Arial, system-ui",
          fontSize: 92,
          fill: 0xffffff,
          fontWeight: "800",
          dropShadow: true,
          dropShadowDistance: 8,
          dropShadowBlur: 10,
          dropShadowAlpha: 0.35,
        },
      });
      t.anchor.set(0.5, 1.0);
      return t;
    }

    const spr = PIXI.Sprite.from(url);
    spr.anchor.set(0.5, 1.0);

    // Scale to fit nicely in the stage (rough heuristic)
    // If texture not loaded yet, it will update automatically later; ok for MVP.
    spr.scale.set(0.9);

    return spr;
  }

  function popDmg(text, x, y, crit) {
    if (!S.app) return;

    const PIXI = global.PIXI;

    const t = new PIXI.Text({
      text,
      style: {
        fontFamily: "Arial, system-ui",
        fontSize: crit ? 30 : 24,
        fill: crit ? 0xffd166 : 0xff5d5d,
        fontWeight: "900",
        dropShadow: true,
        dropShadowDistance: 6,
        dropShadowBlur: 10,
        dropShadowAlpha: 0.35,
      },
    });

    t.anchor.set(0.5);
    t.x = x;
    t.y = y;

    S.app.stage.addChild(t);

    let life = 0;
    const tick = (delta) => {
      life += delta;
      t.y -= 0.9 * delta;
      t.alpha = Math.max(0, 1 - life / 42);
      // slight scale up
      const s = 1 + (life / 120);
      t.scale.set(s);
      if (life > 42) {
        S.app.ticker.remove(tick);
        safeDestroyDisplayObject(t);
      }
    };

    S.app.ticker.add(tick);
  }

  // Called by arena.js during each step
  function attack(youAttacked, dmg, crit) {
    if (!S.app || !S.you || !S.foe) return;

    const from = youAttacked ? S.you : S.foe;
    const to = youAttacked ? S.foe : S.you;

    const dir = youAttacked ? 1 : -1;
    const ox = from.x;
    const oy = from.y;

    // dash forward
    from.x = ox + 26 * dir;

    // return quickly
    setTimeout(() => {
      if (from) { from.x = ox; from.y = oy; }
    }, 140);

    // hit squash
    const osx = to.scale.x || 1;
    const osy = to.scale.y || 1;

    // quick "impact" (squash + tiny tilt)
    to.scale.y = osy * 0.95;
    to.rotation = (youAttacked ? -1 : 1) * 0.03;

    setTimeout(() => {
      if (!to) return;
      to.scale.y = osy;
      to.rotation = 0;
    }, 180);

    // dmg popup near target head
    const label = `-${Number(dmg || 0)}${crit ? " CRIT!" : ""}`;
    popDmg(label, to.x, to.y - 140, !!crit);
  }

  function safeDestroyDisplayObject(obj) {
    try {
      if (!obj) return;
      // PIXI.DisplayObject doesn't always support destroy opts, but many do.
      if (typeof obj.destroy === "function") obj.destroy({ children: true, texture: false, baseTexture: false });
    } catch (_) {}
  }

  function destroy() {
    try {
      if (S.app && S._idleTick) {
        try { S.app.ticker.remove(S._idleTick); } catch(_) {}
      }
    } catch (_) {}

    try { if (S.you) safeDestroyDisplayObject(S.you); } catch(_) {}
    try { if (S.foe) safeDestroyDisplayObject(S.foe); } catch(_) {}

    S.you = null;
    S.foe = null;

    try {
      if (S.app) {
        // full destroy, but keep textures (we didn't load custom ones explicitly)
        S.app.destroy(true, { children: true, texture: false, baseTexture: false });
      }
    } catch (_) {}

    S.app = null;
    S.root = null;
    S.bg = null;
    S.vignette = null;
    S._idleTick = null;
    S._redraw = null;
    S._layout = null;
    S.inited = false;
  }

  global.ArenaPixi = { init, setActors, attack, destroy };
})(window);
