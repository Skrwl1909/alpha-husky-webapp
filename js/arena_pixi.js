// public/js/arena_pixi.js — FINAL vB-2026-02-05 (pet normalize + cloud url variants + better texture load + mirror fix + HP text)
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
  const VER = "arena_pixi.js vB-2026-02-05";
  try { global.__ARENA_PIXI_VER__ = VER; } catch (_) {}

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

  // ===================== Cloudinary Pet Sprites (Pixi) =====================
  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  const CLOUD_TX = "f_png,q_auto,w_256,c_fit";

  function _looksLikeId(s) {
    const x = String(s || "").trim().toLowerCase();
    if (!x) return false;
    if (/^[a-f0-9]{32}$/.test(x)) return true; // md5-ish
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x)) return true; // uuid
    return false;
  }

  function _slugify(raw) {
    let k = String(raw || "").trim();
    if (!k) return "";
    k = k.replace(/^pets\//i, "");
    k = k.replace(/\.(png|webp|jpg|jpeg)$/i, "");
    k = k.toLowerCase();
    k = k.replace(/[^a-z0-9 _-]/g, "");
    k = k.replace(/\s+/g, " ").trim();
    return k;
  }

  function _cloudUrlFromMaybe(x) {
    const s = String(x || "").trim();
    if (!s) return "";
    if (s.includes("res.cloudinary.com")) return s; // full URL already
    const p = s.replace(/^\/+/, "").replace(/^image\/upload\//, "");
    // if user passed already-transformed path, keep it
    if (p.startsWith(CLOUD_TX + "/")) return `${CLOUD_BASE}/${p}`;
    return `${CLOUD_BASE}/${CLOUD_TX}/${p}`;
  }

  // normalize pet object from fighter payloads
  function normalizePetObj(fighter) {
    return (
      fighter?.pet ||
      fighter?.active_pet ||
      fighter?.activePet ||
      fighter?.pet_state ||
      fighter?.petState ||
      fighter?.pet_info ||
      fighter?.petInfo ||
      fighter // fallback
    );
  }

  function pickPetLabel(p) {
    return String(
      p?.pet_name || p?.petName ||
      p?.pet_type || p?.petType ||
      p?.pet_key  || p?.petKey  ||
      p?.name || ""
    );
  }

  function petAssetUrls(fighter) {
    const p = normalizePetObj(fighter);

    // 1) Prefer direct / canonical fields if present (check both pet + fighter)
    const direct =
      p?.pet_asset || p?.petAsset ||
      p?.pet_icon  || p?.petIcon  ||
      p?.pet_sprite || p?.petSprite ||
      p?.sprite || p?.img || p?.image ||
      p?.icon || p?.icon_file || p?.iconFile ||
      p?.pet_img || p?.petImg ||
      fighter?.pet_asset || fighter?.petAsset ||
      fighter?.pet_icon  || fighter?.petIcon  ||
      fighter?.pet_sprite || fighter?.petSprite ||
      "";

    const directUrl = _cloudUrlFromMaybe(direct);
    if (directUrl) return [directUrl];

    // 2) Otherwise infer from stable names/keys (NOT pet_id)
    const raw =
      p?.pet_key || p?.petKey ||
      p?.pet_type || p?.petType ||
      p?.pet_name || p?.petName ||
      p?.name ||
      "";

    const base = _slugify(raw);
    if (!base) return [];
    if (_looksLikeId(base)) return []; // don't spam 404s

    const noSpace = base.replace(/\s+/g, "");
    const under   = base.replace(/\s+/g, "_");
    const dash    = base.replace(/\s+/g, "-");

    const keys = Array.from(new Set([noSpace, under, dash].filter(Boolean)));

    // IMPORTANT:
    // - Cloudinary public_id often works without extension
    // - Some uploads may be webp; we try both
    const out = [];
    for (const k of keys) {
      const ek = encodeURIComponent(k);
      out.push(`${CLOUD_BASE}/${CLOUD_TX}/pets/${ek}`);       // no extension
      out.push(`${CLOUD_BASE}/${CLOUD_TX}/pets/${ek}.png`);
      out.push(`${CLOUD_BASE}/${CLOUD_TX}/pets/${ek}.webp`);
    }
    return out;
  }

  async function loadTextureSafeMany(urls) {
    if (!urls || !urls.length || !hasPixi()) return null;

    for (const url of urls) {
      try {
        let tex = null;

        if (global.PIXI.Assets?.load) {
          const r = await global.PIXI.Assets.load(url);
          tex = r?.texture || r; // Pixi loaders sometimes return { texture }
        } else {
          tex = global.PIXI.Texture.from(url);
        }

        if (tex) return tex;
      } catch (e) {
        if (state.dbg) console.warn("[Arena] texture load failed", url, e?.message || e);
      }
    }
    return null;
  }

  // HP bar (returns refs so we can reposition on resize)
  function hpBar(app, x, y, w, h) {
    const gBack = new global.PIXI.Graphics();
    const gFill = new global.PIXI.Graphics();

    app.stage.addChild(gBack);
    app.stage.addChild(gFill);

    function draw(rr, X, Y, W, H) {
      gBack.clear();
      gBack.beginFill(0x000000, 0.35).drawRoundedRect(X, Y, W, H, 6).endFill();

      const fillW = (W - 4) * rr;
      gFill.clear();
      gFill.beginFill(0xffffff, 0.65).drawRoundedRect(X + 2, Y + 2, Math.max(0, fillW), H - 4, 5).endFill();
    }

    let _ratio = 1;
    let _x = x, _y = y, _w = w, _h = h;

    draw(_ratio, _x, _y, _w, _h);

    return {
      set(ratio) {
        _ratio = Math.max(0, Math.min(1, ratio));
        draw(_ratio, _x, _y, _w, _h);
      },
      setPos(x2, y2, w2, h2) {
        _x = x2; _y = y2; _w = w2; _h = h2;
        draw(_ratio, _x, _y, _w, _h);
      },
      destroy() {
        try { gBack.destroy(); } catch (_) {}
        try { gFill.destroy(); } catch (_) {}
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

    // Pixi v8 uses app.canvas; older uses app.view
    wrap.appendChild(app.canvas || app.view);

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

    const leftMax = Math.max(1, parseInt(left.hpMax || left.hp_max || left.hp || 100, 10));
    const rightMax = Math.max(1, parseInt(right.hpMax || right.hp_max || right.hp || 100, 10));

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

    // HP text
    const hpStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 11, fontWeight: "800", alpha: 0.9 });
    const tHpL = new global.PIXI.Text("", hpStyle);
    const tHpR = new global.PIXI.Text("", hpStyle);
    app.stage.addChild(tHpL);
    app.stage.addChild(tHpR);

    function updateHpText() {
      tHpL.text = `${leftHp}/${leftMax}`;
      tHpR.text = `${rightHp}/${rightMax}`;
      const W0 = wrap.clientWidth || 360;
      tHpL.x = 14;
      tHpL.y = 52;
      tHpR.x = W0 - 14 - tHpR.width;
      tHpR.y = 52;
    }

    // hp bars
    let W = wrap.clientWidth || 360;
    let barW = Math.max(120, Math.floor(W * 0.38));
    const leftHpBar = hpBar(app, 14, 34, barW, 14);
    const rightHpBar = hpBar(app, W - 14 - barW, 34, barW, 14);

    leftHpBar.set(1);
    rightHpBar.set(1);
    updateHpText();

    // layout
    function relayout() {
      const W1 = wrap.clientWidth || 360;
      const H1 = wrap.clientHeight || 420;

      bg.clear().beginFill(0x000000, 0.22).drawRect(0, 0, W1, H1).endFill();

      tLeft.x = 14; tLeft.y = 10;
      tRight.x = W1 - 14 - tRight.width; tRight.y = 10;

      // reposition hp bars on resize
      const bw = Math.max(120, Math.floor(W1 * 0.38));
      leftHpBar.setPos(14, 34, bw, 14);
      rightHpBar.setPos(W1 - 14 - bw, 34, bw, 14);

      updateHpText();
      placeFighters();
    }

    app.renderer.on("resize", relayout);

    // sprites / fallback emoji
    async function makeFighter(fighter, isRight) {
      const c = new global.PIXI.Container();
      app.stage.addChild(c);

      const pObj = normalizePetObj(fighter);
      const urls = petAssetUrls(fighter);
      const tex = await loadTextureSafeMany(urls);

      if (state.dbg) {
        log("pet urls", {
          fighterKeys: Object.keys(fighter || {}).slice(0, 25),
          petKeys: Object.keys(pObj || {}).slice(0, 25),
          name: pickPetLabel(pObj),
          urls,
          ok: !!tex
        });
      }

      let obj;
      if (tex) {
        const sp = new global.PIXI.Sprite(tex);
        sp.anchor?.set?.(0.5);
        sp.scale.set(0.60);
        obj = sp;
      } else {
        const emoji = new global.PIXI.Text("🐾", new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 56, fontWeight: "900" }));
        emoji.anchor?.set?.(0.5);
        obj = emoji;
      }

      c.addChild(obj);

      const badge = new global.PIXI.Text(pickPetLabel(pObj), subStyle);
      badge.x = -badge.width / 2;
      badge.y = 52;
      c.addChild(badge);

      // mirror ONLY sprite/emoji (avoid mirrored text)
      if (isRight && obj?.scale) {
        obj.scale.x = -Math.abs(obj.scale.x);
      }

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
      updateHpText();

      await sleep(260);
    }

    // final relayout (in case first append changed size)
    try { relayout(); } catch (_) {}
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

      destroyPixi();
      const wrap = $("#arenaStageWrap", ov);
      if (wrap) wrap.innerHTML =
        `<div id="arenaFallback" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.85);font-weight:700">Loading replay…</div>`;

      const res = await state.apiPost("/webapp/arena/replay", { battle_id: state.lastBattleId });
      const stub = res?.data || res?.stub || res;
      if (!stub || !Array.isArray(stub.steps)) throw new Error("Bad replay payload");

      try {
        global.__ARENA_LAST_STUB__ = stub;
        global.__ARENA_LAST_BATTLE_ID__ = state.lastBattleId;
      } catch (_) {}

      // debug helper (duplicate ok)
      try { global.__ARENA_LAST_STUB__ = stub; } catch (_) {}

      if (meta) meta.textContent = `Battle #${state.lastBattleId} • ${stub?.winner_reason || ""}`.trim();

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
    log("init ok", { VER, hasPixi: hasPixi() });
  }

  global.Arena = { init, open, close };
})(window);
