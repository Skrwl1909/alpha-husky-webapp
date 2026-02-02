// public/js/arena_pixi.js
(function (global) {
  const state = {
    apiPost: null,
    tg: null,
    dbg: false,
    overlay: null,
    pixiApp: null,
    lastBattleId: null,
  };

  const $ = (sel, root = document) => root.querySelector(sel);

  function log(...a) { if (state.dbg) console.log("[Arena]", ...a); }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function destroyPixi() {
    try { state.pixiApp?.destroy?.(true, { children: true, texture: true, baseTexture: true }); } catch (_) {}
    state.pixiApp = null;
  }

  function close() {
    destroyPixi();
    try { state.overlay?.remove?.(); } catch (_) {}
    state.overlay = null;

    // przywróć scroll
    try { document.documentElement.style.overflow = ""; } catch (_) {}
    try { document.body.style.overflow = ""; } catch (_) {}
  }

  function ensureOverlay() {
    // singleton
    if (state.overlay && document.body.contains(state.overlay)) return state.overlay;

    const ov = document.createElement("div");
    ov.id = "arenaOverlay";
    ov.style.cssText = [
      "position:fixed", "inset:0", "z-index:9999",
      "background:rgba(0,0,0,.78)",
      "backdrop-filter:blur(8px)",
      "display:flex", "flex-direction:column",
      "padding:14px", "gap:10px",
      "font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial"
    ].join(";");

    ov.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <div style="flex:1">
          <div style="font-weight:800;font-size:16px;letter-spacing:.3px">Pet Arena Replay</div>
          <div id="arenaMeta" style="opacity:.8;font-size:12px;margin-top:2px">Loading…</div>
        </div>
        <button id="arenaClose"
          type="button"
          style="border:0;border-radius:12px;padding:10px 12px;background:rgba(255,255,255,.12);color:#fff;font-weight:700">
          Close
        </button>
      </div>

      <div id="arenaStageWrap"
        style="flex:1;min-height:280px;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.06);position:relative">
        <div id="arenaFallback"
          style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.85);font-weight:700">
          Loading replay…
        </div>
      </div>

      <div style="display:flex;gap:10px;justify-content:space-between;align-items:center">
        <button id="arenaReplay"
          type="button"
          style="flex:1;border:0;border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.14);color:#fff;font-weight:800">
          Replay
        </button>
        <button id="arenaClose2"
          type="button"
          style="border:0;border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.10);color:#fff;font-weight:700">
          Back
        </button>
      </div>
    `;

    ov.addEventListener("click", (e) => {
      const id = e.target?.id;
      if (id === "arenaClose" || id === "arenaClose2") close();
    });

    // blokuj scroll pod spodem
    try { document.documentElement.style.overflow = "hidden"; } catch (_) {}
    try { document.body.style.overflow = "hidden"; } catch (_) {}

    document.body.appendChild(ov);
    state.overlay = ov;
    return ov;
  }

  function hasPixi() {
    return !!global.PIXI && !!global.PIXI.Application;
  }

  function petAssetUrl(p) {
    const key = String(p?.pet_key || p?.petKey || p?.pet_id || p?.petId || "").trim();
    if (!key) return "";
    // (fallbacki) — dostosuj jak będziesz miał canonical path
    return `/assets/pets/${encodeURIComponent(key)}.webp`;
  }

  async function loadTextureSafe(url) {
    if (!url || !hasPixi()) return null;
    try {
      // Pixi v7
      if (global.PIXI.Assets?.load) {
        return await global.PIXI.Assets.load(url);
      }
      // Pixi v6 fallback
      return global.PIXI.Texture.from(url);
    } catch (e) {
      return null;
    }
  }

  function hpBar(app, x, y, w, h) {
    const gBack = new global.PIXI.Graphics();
    gBack.beginFill(0x000000, 0.35).drawRoundedRect(x, y, w, h, 6).endFill();

    const gFill = new global.PIXI.Graphics();
    gFill.beginFill(0xffffff, 0.65).drawRoundedRect(x + 2, y + 2, w - 4, h - 4, 5).endFill();

    app.stage.addChild(gBack);
    app.stage.addChild(gFill);

    return {
      set(ratio) {
        const rr = Math.max(0, Math.min(1, ratio));
        const fillW = (w - 4) * rr;
        gFill.clear().beginFill(0xffffff, 0.65).drawRoundedRect(x + 2, y + 2, fillW, h - 4, 5).endFill();
      }
    };
  }

  async function renderReplayPixi(stub) {
    const wrap = $("#arenaStageWrap", state.overlay);
    const fallback = $("#arenaFallback", state.overlay);
    if (fallback) fallback.style.display = "none";

    // Create pixi app
    const app = new global.PIXI.Application({
      resizeTo: wrap,
      antialias: true,
      backgroundAlpha: 0,
      resolution: Math.min(2, global.devicePixelRatio || 1),
    });
    state.pixiApp = app;
    wrap.appendChild(app.view);

    // background
    const bg = new global.PIXI.Graphics();
    bg.beginFill(0x000000, 0.25).drawRect(0, 0, wrap.clientWidth, wrap.clientHeight).endFill();
    app.stage.addChild(bg);

    // data
    const youAreP1 = !!stub.you_are_p1;
    const p1 = stub.p1 || {};
    const p2 = stub.p2 || {};
    const left = youAreP1 ? p1 : p2;
    const right = youAreP1 ? p2 : p1;

    const leftName = String(left.name || "YOU");
    const rightName = String(right.name || "ENEMY");

    const leftMax = Math.max(1, parseInt(left.hpMax || 100, 10));
    const rightMax = Math.max(1, parseInt(right.hpMax || 100, 10));

    let leftHp = leftMax;
    let rightHp = rightMax;

    // names
    const nameStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: "800" });
    const subStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 12, fontWeight: "700", alpha: 0.8 });

    const tLeft = new global.PIXI.Text(leftName, nameStyle);
    const tRight = new global.PIXI.Text(rightName, nameStyle);
    tLeft.x = 14; tLeft.y = 10;
    tRight.x = 14; tRight.y = 10;
    app.stage.addChild(tLeft);
    app.stage.addChild(tRight);

    // layout
    function relayout() {
      const W = wrap.clientWidth || 360;
      const H = wrap.clientHeight || 420;

      // bg
      bg.clear().beginFill(0x000000, 0.22).drawRect(0, 0, W, H).endFill();

      // names
      tLeft.x = 14; tLeft.y = 10;
      tRight.x = W - 14 - tRight.width; tRight.y = 10;
    }
    relayout();
    app.renderer.on("resize", relayout);

    // hp bars
    const W = wrap.clientWidth || 360;
    const leftHpBar = hpBar(app, 14, 34, Math.max(120, Math.floor(W * 0.38)), 14);
    const rightHpBar = hpBar(app, W - 14 - Math.max(120, Math.floor(W * 0.38)), 34, Math.max(120, Math.floor(W * 0.38)), 14);

    leftHpBar.set(1);
    rightHpBar.set(1);

    // sprites / fallback emoji
    async function makeFighter(p, isRight) {
      const c = new global.PIXI.Container();
      app.stage.addChild(c);

      const url = petAssetUrl(p);
      const tex = await loadTextureSafe(url);

      let obj;
      if (tex) {
        const sp = new global.PIXI.Sprite(tex);
        sp.anchor.set(0.5);
        sp.scale.set(0.55);
        obj = sp;
      } else {
        const emoji = new global.PIXI.Text("🐾", new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 56 }));
        emoji.anchor.set?.(0.5);
        obj = emoji;
      }

      c.addChild(obj);

      const badge = new global.PIXI.Text(String(p.pet_name || p.pet_type || ""), subStyle);
      badge.x = -badge.width / 2;
      badge.y = 52;
      c.addChild(badge);

      // mirror right
      if (isRight) c.scale.x = -1;

      return c;
    }

    const leftF = await makeFighter(left, false);
    const rightF = await makeFighter(right, true);

    function placeFighters() {
      const W2 = wrap.clientWidth || 360;
      const H2 = wrap.clientHeight || 420;
      leftF.x = Math.floor(W2 * 0.28);
      rightF.x = Math.floor(W2 * 0.72);
      leftF.y = Math.floor(H2 * 0.58);
      rightF.y = Math.floor(H2 * 0.58);
    }
    placeFighters();
    app.renderer.on("resize", placeFighters);

    async function punch(node, dx) {
      const start = node.x;
      node.x = start + dx;
      await sleep(90);
      node.x = start;
    }
    async function hitFlash(node) {
      const sy = node.scale.y;
      node.scale.y = sy * 0.92;
      await sleep(70);
      node.scale.y = sy;
    }
    function dmgFloat(x, y, text) {
      const t = new global.PIXI.Text(text, new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 18, fontWeight: "900" }));
      t.x = x; t.y = y; t.alpha = 0.95;
      app.stage.addChild(t);

      let life = 0;
      const dur = 420;
      const tick = (dt) => {
        life += (dt * 16.6);
        t.y -= 0.35 * dt * 2;
        t.alpha = Math.max(0, 1 - (life / dur));
        if (life >= dur) {
          app.ticker.remove(tick);
          try { t.destroy(); } catch (_) {}
        }
      };
      app.ticker.add(tick);
    }

    // step playback
    const steps = Array.isArray(stub.steps) ? stub.steps : [];
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i] || {};
      const who = String(s.who || "");
      const dmg = Math.max(0, parseInt(s.dmg || 0, 10));
      const glitch = Math.max(0, parseInt(s.glitch || 0, 10));
      const dotSelf = Math.max(0, parseInt(s.dotSelf || 0, 10));
      const dodged = !!s.dodged;
      const crit = !!s.crit;

      // map: w krokach "player" = p1, "enemy" = p2 (w większości Twoich symulatorów)
      const attackerIsP1 = (who === "player");
      const attackerLeft = (attackerIsP1 === youAreP1); // jeśli ty jesteś p1 to p1=left

      const attacker = attackerLeft ? leftF : rightF;
      const target = attackerLeft ? rightF : leftF;

      // anim
      await punch(attacker, attackerLeft ? +26 : -26);

      if (dodged) {
        dmgFloat(target.x - 10, target.y - 90, "DODGE");
        await sleep(260);
        continue;
      }

      const hit = dmg + glitch;
      if (hit > 0) {
        await hitFlash(target);
        dmgFloat(target.x - 10, target.y - 90, (crit ? "CRIT " : "") + "-" + hit);
      }

      // update HP from step if present (prefer)
      // w Twoim code są różne aliasy, więc bierzemy kilka
      const pHp = parseInt(s.pHp ?? s.p_hp ?? s.playerHp ?? s.youHp ?? leftHp, 10);
      const eHp = parseInt(s.eHp ?? s.e_hp ?? s.enemyHp ?? s.oppHp ?? rightHp, 10);

      // Map left/right back
      if (youAreP1) {
        leftHp = isFinite(pHp) ? pHp : leftHp;
        rightHp = isFinite(eHp) ? eHp : rightHp;
      } else {
        // jeśli jesteś p2, to "player" (p1) jest po PRAWEJ w naszej mapie
        // left = p2 => leftHp to eHp, right = p1 => rightHp to pHp
        leftHp = isFinite(eHp) ? eHp : leftHp;
        rightHp = isFinite(pHp) ? pHp : rightHp;
      }

      // apply dotSelf (tick na aktorze) jeśli step nie podał hp
      if (!isFinite(pHp) || !isFinite(eHp)) {
        if (dotSelf > 0) {
          if (attackerLeft) leftHp -= dotSelf; else rightHp -= dotSelf;
        }
        if (hit > 0) {
          if (attackerLeft) rightHp -= hit; else leftHp -= hit;
        }
      }

      leftHp = Math.max(0, leftHp);
      rightHp = Math.max(0, rightHp);

      leftHpBar.set(leftHp / leftMax);
      rightHpBar.set(rightHp / rightMax);

      await sleep(260);
    }
  }

  async function renderReplayDom(stub) {
    // ultra-fallback bez Pixi
    const meta = $("#arenaMeta", state.overlay);
    const wrap = $("#arenaStageWrap", state.overlay);
    const fallback = $("#arenaFallback", state.overlay);

    const youAreP1 = !!stub.you_are_p1;
    const p1 = stub.p1 || {};
    const p2 = stub.p2 || {};
    const left = youAreP1 ? p1 : p2;
    const right = youAreP1 ? p2 : p1;

    if (fallback) fallback.style.display = "none";

    const box = document.createElement("div");
    box.style.cssText = "padding:14px;color:#fff";
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px">
        <div><b>${left.name || "YOU"}</b><div style="opacity:.75;font-size:12px">${left.pet_name || left.pet_type || ""}</div></div>
        <div style="text-align:right"><b>${right.name || "ENEMY"}</b><div style="opacity:.75;font-size:12px">${right.pet_name || right.pet_type || ""}</div></div>
      </div>
      <div style="margin-top:12px;opacity:.85;font-size:12px">Replay loaded (DOM fallback).</div>
    `;
    wrap.appendChild(box);

    if (meta) meta.textContent = "Replay (fallback)";
  }

  async function open(battleId) {
    if (!state.apiPost) throw new Error("Arena.init({apiPost,...}) missing");

    const ov = ensureOverlay();
    const meta = $("#arenaMeta", ov);
    const btnReplay = $("#arenaReplay", ov);

    state.lastBattleId = String(battleId || state.lastBattleId || "").trim() || null;

    const doLoad = async () => {
      if (!state.lastBattleId) throw new Error("No battle_id");

      if (meta) meta.textContent = "Fetching replay…";

      // clear stage
      destroyPixi();
      const wrap = $("#arenaStageWrap", ov);
      if (wrap) wrap.innerHTML = `<div id="arenaFallback" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.85);font-weight:700">Loading replay…</div>`;

      const res = await state.apiPost("/webapp/arena/replay", { battle_id: state.lastBattleId });
      const stub = res?.data || res?.stub || res;
      if (!stub || !Array.isArray(stub.steps)) throw new Error("Bad replay payload");

      if (meta) meta.textContent = `Battle #${state.lastBattleId} • ${stub?.winner_reason || ""}`.trim();

      // render
      if (hasPixi()) await renderReplayPixi(stub);
      else await renderReplayDom(stub);
    };

    // replay button
    if (btnReplay && !btnReplay.__bound) {
      btnReplay.__bound = true;
      btnReplay.addEventListener("click", async () => {
        try { state.tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
        try { await doLoad(); } catch (e) { console.error(e); }
      });
    }

    await doLoad();
  }

  function init({ apiPost, tg, dbg } = {}) {
    if (apiPost) state.apiPost = apiPost;
    if (tg) state.tg = tg;
    state.dbg = !!dbg;
    log("init ok", { hasPixi: hasPixi() });
  }

  global.Arena = { init, open, close };
})(window);
