// js/fortress_pixi.js
// Minimal Pixi battle stage for Fortress (Pixi v7/v8 compatible)
// API:
//   FortressPixi.init({ dbg })
//   FortressPixi.mount(stageEl, { bossSprite, bossName, playerName, pMax, eMax }) -> Promise<ctl>
// ctl.setHp(pCur,pMax,eCur,eMax)
// ctl.hit({actor:'you'|'boss', dmg, crit, dodge})
// ctl.destroy()

(function (global) {
  const S = {
    dbg: () => {},
    mounted: new WeakMap(),
  };

  function init(opts) {
    if (opts?.dbg) S.dbg = opts.dbg;
  }

  function _isUrl(u) {
    return /^https?:\/\//i.test(u) || /^\//.test(u);
  }

  function _withVer(url) {
    const v = global.WEBAPP_VER || "dev";
    if (!url) return url;
    if (url.includes("?")) return url + "&v=" + encodeURIComponent(v);
    return url + "?v=" + encodeURIComponent(v);
  }

  function _resolveSprite(u) {
    if (!u) return "images/bosses/core_custodian.png";
    // backend może zwrócić "/images/..." albo pełny URL — oba OK
    if (_isUrl(u)) return u;
    // relative:
    return u;
  }

  function _hasPixiV8(PIXI) {
    return !!(PIXI && PIXI.Application && PIXI.Application.prototype && PIXI.Application.prototype.init);
  }

  async function _ensurePixi() {
    if (global.PIXI) return global.PIXI;
    // awaryjnie spróbuj doładować pixi.min.js
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "js/pixi.min.js?v=" + encodeURIComponent(global.WEBAPP_VER || "dev");
      s.async = true;
      s.onload = () => res();
      s.onerror = () => rej(new Error("PIXI load fail"));
      document.head.appendChild(s);
    }).catch(() => {});
    return global.PIXI;
  }

  async function _loadTexture(PIXI, url) {
    url = _withVer(_resolveSprite(url));
    try {
      if (PIXI.Assets?.load) {
        return await PIXI.Assets.load(url);
      }
    } catch (e) {}
    try {
      return PIXI.Texture.from(url);
    } catch (e) {
      return null;
    }
  }

  function _mkText(PIXI, str, size, alpha) {
    const t = new PIXI.Text({
      text: String(str ?? ""),
      style: new PIXI.TextStyle({
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        fontSize: size || 14,
        fill: 0xffffff,
        fontWeight: "700",
        dropShadow: true,
        dropShadowAlpha: 0.6,
        dropShadowBlur: 4,
        dropShadowDistance: 2,
      }),
    });
    t.alpha = alpha == null ? 1 : alpha;
    return t;
  }

  function _mkBar(PIXI, w, h) {
    const g = new PIXI.Graphics();
    g.roundRect(0, 0, w, h, h / 2);
    g.fill({ color: 0xffffff, alpha: 0.12 });
    const fill = new PIXI.Graphics();
    fill.roundRect(0, 0, w, h, h / 2);
    fill.fill({ color: 0xffffff, alpha: 0.55 });
    g.addChild(fill);
    return { g, fill, w, h };
  }

  function _setBarPct(bar, pct) {
    pct = Math.max(0, Math.min(1, pct || 0));
    bar.fill.scale.x = pct;
  }

  function _mkPlayerGlyph(PIXI) {
    // prosta “głowa + uszy” jako placeholder (bez assetów)
    const g = new PIXI.Graphics();
    g.circle(0, 0, 42).fill({ color: 0xffffff, alpha: 0.10 });
    g.circle(0, 0, 36).fill({ color: 0xffffff, alpha: 0.12 });
    // uszy
    g.poly([-30, -28, -12, -58, -2, -24]).fill({ color: 0xffffff, alpha: 0.10 });
    g.poly([30, -28, 12, -58, 2, -24]).fill({ color: 0xffffff, alpha: 0.10 });
    return g;
  }

  async function mount(stageEl, opts) {
    const PIXI = await _ensurePixi();
    if (!PIXI) throw new Error("PIXI missing");

    // jeśli już mountowane w tym samym elemencie — zniszcz
    try {
      const prev = S.mounted.get(stageEl);
      if (prev?.destroy) prev.destroy();
    } catch (_) {}

    const isV8 = _hasPixiV8(PIXI);
    let app = null;
    let resizeHandler = null;

    stageEl.innerHTML = "";
    stageEl.style.position = "relative";

    if (isV8) {
      app = new PIXI.Application();
      await app.init({
        backgroundAlpha: 0,
        antialias: true,
        resizeTo: stageEl,
        autoDensity: true,
        resolution: Math.min(2, global.devicePixelRatio || 1),
      });
      stageEl.appendChild(app.canvas);
    } else {
      const w = stageEl.clientWidth || 320;
      const h = stageEl.clientHeight || 260;
      app = new PIXI.Application({
        width: w,
        height: h,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(2, global.devicePixelRatio || 1),
      });
      stageEl.appendChild(app.view);
      resizeHandler = () => {
        const nw = stageEl.clientWidth || 320;
        const nh = stageEl.clientHeight || 260;
        try { app.renderer.resize(nw, nh); } catch (_) {}
        layout();
      };
      global.addEventListener("resize", resizeHandler);
    }

    const stage = app.stage;

    // BG
    const bg = new PIXI.Graphics();
    stage.addChild(bg);

    // HUD
    const hud = new PIXI.Container();
    stage.addChild(hud);

    const barW = 220, barH = 12;
    const youBar = _mkBar(PIXI, barW, barH);
    const bossBar = _mkBar(PIXI, barW, barH);
    const youLbl = _mkText(PIXI, opts?.playerName || "YOU", 12, 0.85);
    const bossLbl = _mkText(PIXI, opts?.bossName || "BOSS", 12, 0.85);
    const youHpTxt = _mkText(PIXI, "", 12, 0.85);
    const bossHpTxt = _mkText(PIXI, "", 12, 0.85);

    hud.addChild(youLbl, youBar.g, youHpTxt, bossLbl, bossBar.g, bossHpTxt);

    // Actors
    const actors = new PIXI.Container();
    stage.addChild(actors);

    const player = _mkPlayerGlyph(PIXI);
    actors.addChild(player);

    let boss = null;
    const bossTex = await _loadTexture(PIXI, opts?.bossSprite);
    if (bossTex) {
      boss = new PIXI.Sprite(bossTex);
      boss.anchor?.set?.(0.5, 0.5);
      boss.scale.set(0.6);
    } else {
      boss = new PIXI.Graphics();
      boss.circle(0, 0, 52).fill({ color: 0xffffff, alpha: 0.08 });
    }
    actors.addChild(boss);

    // FX layer
    const fx = new PIXI.Container();
    stage.addChild(fx);

    let shakeT = 0;
    let flashBoss = 0;
    let flashYou = 0;

    function layout() {
      const W = isV8 ? stageEl.clientWidth : app.renderer.width;
      const H = isV8 ? stageEl.clientHeight : app.renderer.height;

      // bg redraw
      bg.clear();
      bg.rect(0, 0, W, H).fill({ color: 0x0c0e12, alpha: 0.70 });
      // subtle “arena light”
      bg.circle(W * 0.5, H * 0.62, Math.max(W, H) * 0.48).fill({ color: 0xffffff, alpha: 0.04 });
      // floor line
      bg.rect(0, H * 0.78, W, 2).fill({ color: 0xffffff, alpha: 0.06 });

      // hud
      youLbl.position.set(14, 10);
      youBar.g.position.set(14, 28);
      youHpTxt.position.set(14, 44);

      bossLbl.position.set(W - 14 - barW, 10);
      bossBar.g.position.set(W - 14 - barW, 28);
      bossHpTxt.position.set(W - 14 - barW, 44);

      // actors
      player.position.set(W * 0.24, H * 0.72);
      boss.position.set(W * 0.76, H * 0.70);

      // scale boss to fit
      if (boss && boss.width && boss.height) {
        const maxH = H * 0.55;
        const maxW = W * 0.44;
        const s = Math.min(maxW / boss.width, maxH / boss.height, 1.0);
        if (boss.scale?.set) boss.scale.set(s);
      }
    }

    layout();

    function setHp(pCur, pMax, eCur, eMax) {
      pMax = Math.max(1, pMax || 1);
      eMax = Math.max(1, eMax || 1);
      pCur = Math.max(0, pCur || 0);
      eCur = Math.max(0, eCur || 0);
      _setBarPct(youBar, pCur / pMax);
      _setBarPct(bossBar, eCur / eMax);
      youHpTxt.text = `${pCur}/${pMax}`;
      bossHpTxt.text = `${eCur}/${eMax}`;
    }

    function _floatText(x, y, text, crit) {
      const t = _mkText(PIXI, text, crit ? 22 : 18, 1);
      t.anchor?.set?.(0.5, 0.5);
      t.position.set(x, y);
      t.alpha = 1;
      fx.addChild(t);

      let life = 0;
      const dur = crit ? 0.95 : 0.75;

      const tick = (dt) => {
        life += dt / 60;
        t.y -= (crit ? 1.4 : 1.1) * (dt || 1);
        t.alpha = Math.max(0, 1 - life / dur);
        t.scale.set(1 + (crit ? 0.08 : 0.04) * (life * 2));
        if (life >= dur) {
          app.ticker.remove(tick);
          t.destroy?.();
        }
      };
      app.ticker.add(tick);
    }

    function hit(ev) {
      const actor = ev?.actor || "you";
      const dmg = Math.max(0, ev?.dmg || 0);
      const crit = !!ev?.crit;
      const dodge = !!ev?.dodge;

      shakeT = Math.max(shakeT, crit ? 10 : 6);

      const tgt = actor === "you" ? boss : player;
      const src = actor === "you" ? player : boss;

      // simple lunge
      const dx = actor === "you" ? 18 : -18;
      src.x += dx;
      setTimeout(() => { try { src.x -= dx; } catch(_){} }, 120);

      if (actor === "you") flashBoss = crit ? 14 : 10;
      else flashYou = crit ? 14 : 10;

      const pos = tgt.getGlobalPosition ? tgt.getGlobalPosition() : { x: tgt.x, y: tgt.y };
      if (dodge) _floatText(pos.x, pos.y - 60, "DODGE", false);
      else if (dmg > 0) _floatText(pos.x, pos.y - 60, String(dmg) + (crit ? " CRIT" : ""), crit);
    }

    // main ticker fx
    app.ticker.add((dt) => {
      // shake
      if (shakeT > 0) {
        shakeT -= dt;
        stage.pivot.x = (Math.random() - 0.5) * 6;
        stage.pivot.y = (Math.random() - 0.5) * 6;
      } else {
        stage.pivot.set(0, 0);
      }

      // flash effect
      if (flashBoss > 0) {
        flashBoss -= dt;
        boss.alpha = 0.75 + 0.25 * Math.sin((flashBoss / 2) * 3);
      } else boss.alpha = 1;

      if (flashYou > 0) {
        flashYou -= dt;
        player.alpha = 0.75 + 0.25 * Math.sin((flashYou / 2) * 3);
      } else player.alpha = 1;
    });

    const ctl = {
      setHp,
      hit,
      destroy() {
        try {
          if (resizeHandler) global.removeEventListener("resize", resizeHandler);
        } catch (_) {}
        try {
          S.mounted.delete(stageEl);
        } catch (_) {}
        try {
          if (isV8) app.destroy(true);
          else app.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (_) {}
        try { stageEl.innerHTML = ""; } catch (_) {}
      },
    };

    S.mounted.set(stageEl, ctl);
    setHp(opts?.pMax || 1, opts?.pMax || 1, opts?.eMax || 1, opts?.eMax || 1);
    return ctl;
  }

  global.FortressPixi = { init, mount };
})(window);
