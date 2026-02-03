// public/js/arena_pixi.js
(function (global) {
  const state = {
    apiPost: null,
    tg: null,
    dbg: false,
    overlay: null,
    pixiApp: null,
    lastBattleId: null,
    _bbHandler: null,
  };

  const $ = (sel, root = document) => root.querySelector(sel);

  function log(...a) { if (state.dbg) console.log("[ArenaPixi]", ...a); }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ==== Cloudinary pets ====
  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  function _normPetKey(raw) {
    let k = String(raw || "").trim();
    if (!k) return "";
    k = k.replace(/^pets\//i, "");
    k = k.replace(/\.(png|webp|jpg|jpeg)$/i, "");
    return k;
  }
  function petAssetUrl(p) {
    const key = _normPetKey(p?.pet_key || p?.petKey || p?.pet_id || p?.petId || p?.pet_type || p?.petType || "");
    if (!key) return "";
    // PNG jest najbezpieczniejszy dla Pixi (i zawsze da się ztransformować z webp/jpg)
    const w = 256;
    return `${CLOUD_BASE}/f_png,q_auto,w_${w},c_fit/pets/${encodeURIComponent(key)}.png`;
  }

  function hasPixi() {
    return !!global.PIXI && !!global.PIXI.Application;
  }

  async function loadTextureSafe(url) {
    if (!url || !hasPixi()) return null;
    try {
      // Pixi v7+ (Assets)
      if (global.PIXI.Assets?.load) {
        return await global.PIXI.Assets.load(url);
      }
      // Pixi v6 fallback
      return global.PIXI.Texture.from(url);
    } catch (e) {
      return null;
    }
  }

  function destroyPixi() {
    try { state.pixiApp?.destroy?.(true, { children: true, texture: true, baseTexture: true }); } catch (_) {}
    state.pixiApp = null;
  }

  function _bindBackButton() {
    const bb = state.tg?.BackButton;
    if (!bb) return;

    if (state._bbHandler) return;
    state._bbHandler = () => close(true);

    try { bb.show(); } catch (_) {}
    try { bb.onClick(state._bbHandler); } catch (_) {}
  }

  function _unbindBackButton() {
    const bb = state.tg?.BackButton;
    if (!bb) { state._bbHandler = null; return; }

    try {
      if (state._bbHandler && bb.offClick) bb.offClick(state._bbHandler);
    } catch (_) {}
    try { bb.hide(); } catch (_) {}

    state._bbHandler = null;
  }

  function close() {
    _unbindBackButton();
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
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="font-weight:900;font-size:16px;letter-spacing:.3px">Pet Arena Replay</div>
            <div id="arenaResultBadge"
              style="display:none;padding:6px 10px;border-radius:999px;
                     background:rgba(10,10,12,.55);
                     border:1px solid rgba(255,255,255,.14);
                     box-shadow:0 0 18px rgba(255,255,255,.10);
                     font-weight:900;font-size:12px;letter-spacing:.7px;color:#fff;">
            </div>
          </div>
          <div id="arenaMeta" style="opacity:.85;font-size:12px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Loading…</div>
        </div>
        <button id="arenaClose"
          type="button"
          style="border:0;border-radius:12px;padding:10px 12px;background:rgba(255,255,255,.12);color:#fff;font-weight:800">
          Close
        </button>
      </div>

      <div id="arenaStageWrap"
        style="flex:1;min-height:280px;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.06);position:relative">
        <div id="arenaFallback"
          style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.85);font-weight:800">
          Loading replay…
        </div>
      </div>

      <div style="display:flex;gap:10px;justify-content:space-between;align-items:center">
        <button id="arenaReplay"
          type="button"
          style="flex:1;border:0;border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.14);color:#fff;font-weight:900">
          Replay
        </button>
        <button id="arenaClose2"
          type="button"
          style="border:0;border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.10);color:#fff;font-weight:800">
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

  function cameraShake(app, intensity = 7, durationMs = 140) {
    if (!app?.ticker || !app?.stage) return;
    const stage = app.stage;
    const ox = stage.x, oy = stage.y;

    let life = 0;
    const tick = (dt) => {
      life += (dt * 16.6);
      const k = Math.max(0, 1 - (life / durationMs));
      stage.x = ox + (Math.random() * 2 - 1) * intensity * k;
      stage.y = oy + (Math.random() * 2 - 1) * intensity * k;

      if (life >= durationMs) {
        app.ticker.remove(tick);
        stage.x = ox; stage.y = oy;
      }
    };
    app.ticker.add(tick);
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

    const nameStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: "800" });
    const subStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 12, fontWeight: "700", alpha: 0.82 });

    const tLeft = new global.PIXI.Text(leftName, nameStyle);
    const tRight = new global.PIXI.Text(rightName, nameStyle);
    app.stage.addChild(tLeft);
    app.stage.addChild(tRight);

    function relayout() {
      const W = wrap.clientWidth || 360;
      const H = wrap.clientHeight || 420;

      bg.clear().beginFill(0x000000, 0.22).drawRect(0, 0, W, H).endFill();
      tLeft.x = 14; tLeft.y = 10;
      tRight.x = W - 14 - tRight.width; tRight.y = 10;
    }
    relayout();
    app.renderer.on("resize", relayout);

    // hp bars
    const W = wrap.clientWidth || 360;
    const barW = Math.max(120, Math.floor(W * 0.38));
    const leftHpBar = hpBar(app, 14, 34, barW, 14);
    const rightHpBar = hpBar(app, W - 14 - barW, 34, barW, 14);
    leftHpBar.set(1);
    rightHpBar.set(1);

    async function makeFighter(p, flipSprite) {
      const c = new global.PIXI.Container();
      app.stage.addChild(c);

      const url = petAssetUrl(p);
      const tex = await loadTextureSafe(url);

      let obj;
      if (tex) {
        const sp = new global.PIXI.Sprite(tex);
        sp.anchor.set(0.5);
        // skalowanie “na oko”, ale bezpieczne
        sp.scale.set(0.55);
        if (flipSprite) sp.scale.x = -Math.abs(sp.scale.x);
        obj = sp;
      } else {
        const emoji = new global.PIXI.Text("🐺", new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 56, fontWeight: "800" }));
        // nie każdy Pixi.Text ma anchor, więc defensywnie:
        try { emoji.anchor?.set?.(0.5); } catch (_) {}
        if (flipSprite) emoji.scale.x = -1;
        obj = emoji;
      }

      c.addChild(obj);

      const badgeText = String(p.pet_name || p.pet_type || p.petKey || p.pet_key || "");
      const badge = new global.PIXI.Text(badgeText, subStyle);
      badge.x = -badge.width / 2;
      badge.y = 56;
      c.addChild(badge);

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

    const steps = Array.isArray(stub.steps) ? stub.steps : [];
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i] || {};
      const who = String(s.who || "");
      const dmg = Math.max(0, parseInt(s.dmg || 0, 10));
      const glitch = Math.max(0, parseInt(s.glitch || 0, 10));
      const dotSelf = Math.max(0, parseInt(s.dotSelf || 0, 10));
      const dodged = !!s.dodged;
      const crit = !!s.crit;

      const attackerIsP1 = (who === "player");
      const attackerLeft = (attackerIsP1 === youAreP1);

      const attacker = attackerLeft ? leftF : rightF;
      const target = attackerLeft ? rightF : leftF;

      await punch(attacker, attackerLeft ? +26 : -26);

      if (dodged) {
        dmgFloat(target.x - 10, target.y - 90, "DODGE");
        await sleep(260);
        continue;
      }

      const hit = dmg + glitch;
      if (hit > 0) {
        await hitFlash(target);
        if (crit) cameraShake(app, 8, 150);
        dmgFloat(target.x - 10, target.y - 90, (crit ? "CRIT " : "") + "-" + hit);
      }

      const pHp = parseInt(s.pHp ?? s.p_hp ?? s.playerHp ?? s.youHp ?? leftHp, 10);
      const eHp = parseInt(s.eHp ?? s.e_hp ?? s.enemyHp ?? s.oppHp ?? rightHp, 10);

      if (youAreP1) {
        leftHp = isFinite(pHp) ? pHp : leftHp;
        rightHp = isFinite(eHp) ? eHp : rightHp;
      } else {
        leftHp = isFinite(eHp) ? eHp : leftHp;
        rightHp = isFinite(pHp) ? pHp : rightHp;
      }

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
        <div><b>${String(left.name || "YOU")}</b><div style="opacity:.75;font-size:12px">${String(left.pet_name || left.pet_type || "")}</div></div>
        <div style="text-align:right"><b>${String(right.name || "ENEMY")}</b><div style="opacity:.75;font-size:12px">${String(right.pet_name || right.pet_type || "")}</div></div>
      </div>
      <div style="margin-top:12px;opacity:.85;font-size:12px">Replay loaded (DOM fallback).</div>
    `;
    wrap.appendChild(box);

    if (meta) meta.textContent = "Replay (fallback)";
  }

  function _setResultBadge(stub) {
    const badge = $("#arenaResultBadge", state.overlay);
    if (!badge) return;

    const youAreP1 = !!stub.you_are_p1;

    let youWon = null;

    // 1) winner = "player"/"enemy" (jeśli kiedyś to dodasz)
    if (stub.winner === "player") youWon = youAreP1;
    else if (stub.winner === "enemy") youWon = !youAreP1;

    // 2) winner_uid + p1_uid/p2_uid
    if (youWon === null) {
      const w = String(stub.winner_uid || "");
      const p1 = String(stub.p1_uid || "");
      const p2 = String(stub.p2_uid || "");
      if (w && (p1 || p2)) {
        const youUid = youAreP1 ? p1 : p2;
        youWon = (w && youUid) ? (w === youUid) : null;
      }
    }

    if (youWon === null) {
      badge.style.display = "none";
      badge.textContent = "";
      return;
    }

    badge.style.display = "inline-flex";
    badge.textContent = youWon ? "VICTORY" : "DEFEAT";
  }

  async function open(battleId) {
    if (!state.apiPost) throw new Error("ArenaPixi.init({apiPost,...}) missing");

    const ov = ensureOverlay();
    _bindBackButton();

    const meta = $("#arenaMeta", ov);
    const btnReplay = $("#arenaReplay", ov);

    state.lastBattleId = String(battleId || state.lastBattleId || "").trim() || null;

    const doLoad = async () => {
      if (!state.lastBattleId) throw new Error("No battle_id");

      if (meta) meta.textContent = "Fetching replay…";

      destroyPixi();
      const wrap = $("#arenaStageWrap", ov);
      if (wrap) wrap.innerHTML = `<div id="arenaFallback" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.85);font-weight:800">Loading replay…</div>`;

      const res = await state.apiPost("/webapp/arena/replay", { battle_id: state.lastBattleId });
      const stub = res?.data || res?.stub || res;
      if (!stub || !Array.isArray(stub.steps)) throw new Error("Bad replay payload");

      if (meta) meta.textContent = `Battle #${state.lastBattleId}${stub?.winner_reason ? " • " + stub.winner_reason : ""}`.trim();
      _setResultBadge(stub);

      if (hasPixi()) await renderReplayPixi(stub);
      else await renderReplayDom(stub);
    };

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

  // ✅ ważne: NIE nadpisujemy global.Arena
  global.ArenaPixi = { init, open, close };
})(window);
