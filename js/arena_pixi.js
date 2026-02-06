// public/js/arena_pixi.js
(function (global) {
  const state = {
    apiPost: null,
    tg: null,
    dbg: false,
    overlay: null,
    pixiApp: null,
    lastBattleId: null,
    _ro: null,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const VER = "arena_pixi.js vI-2026-02-06-pixi8fix";
  try { global.__ARENA_PIXI_VER__ = VER; } catch (_) {}

  function log(...a) { if (state.dbg) console.log("[Arena]", ...a); }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function destroyPixi() {
    try { state._ro?.disconnect?.(); } catch (_) {}
    state._ro = null;

    try { state.pixiApp?.destroy?.(true, { children: true, texture: true, baseTexture: true }); } catch (_) {}
    state.pixiApp = null;
  }

  function close() {
    destroyPixi();
    try { state.overlay?.remove?.(); } catch (_) {}
    state.overlay = null;

    try { document.documentElement.style.overflow = ""; } catch (_) {}
    try { document.body.style.overflow = ""; } catch (_) {}
  }

  function ensureOverlay() {
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
  const PET_FOLDERS = ["pets", "pets/icons"];
  const PET_VER = String(global.__PET_CLOUD_VER__ || global.__PET_CLOUD_VER__ || "").trim(); // np "v1767699377"

  function _looksLikeId(s) {
    const x = String(s || "").trim().toLowerCase();
    if (!x) return false;
    if (/^[a-f0-9]{32}$/.test(x)) return true;
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x)) return true;
    return false;
  }

  function _stripLevelSuffix(raw) {
    let s = String(raw || "").trim();
    if (!s) return s;
    s = s.replace(/\s*\(\s*(?:lv|lvl|level)\s*\d+\s*\)\s*$/i, "");
    s = s.replace(/\s*(?:lv|lvl|level)\s*\d+\s*$/i, "");
    s = s.replace(/\s*\[\s*(?:lv|lvl|level)\s*\d+\s*\]\s*$/i, "");
    return s.trim();
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

  function _looksLikePathOrUrl(s) {
    const x = String(s || "").trim();
    if (!x) return false;
    if (x.includes("res.cloudinary.com")) return true;
    if (x.includes("/") || x.includes(".")) return true;
    if (/^v\d+\/.+/.test(x)) return true;
    return false;
  }

  function _cloudUrlFromMaybe(x) {
    const s = String(x || "").trim();
    if (!s) return "";
    if (!_looksLikePathOrUrl(s)) return "";
    if (s.includes("res.cloudinary.com")) return s;

    const p = s.replace(/^\/+/, "").replace(/^image\/upload\//, "");
    if (p.startsWith(CLOUD_TX + "/")) return `${CLOUD_BASE}/${p}`;
    return `${CLOUD_BASE}/${CLOUD_TX}/${p}`;
  }

  function _uniq(arr) {
    const out = [];
    const seen = new Set();
    for (const x of arr || []) {
      const k = String(x || "").trim();
      if (!k) continue;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(k);
    }
    return out;
  }

  function petAssetUrls(fighter) {
    const p = fighter || {};
    const out = [];

    // 1) direct fields (ale NIE kończymy tutaj — dodajemy też fallbacki!)
    const direct =
      p?.pet_icon || p?.petIcon ||
      p?.pet_asset || p?.petAsset ||
      p?.pet_sprite || p?.petSprite ||
      p?.icon_file || p?.iconFile ||
      p?.icon ||
      "";

    const directUrl = _cloudUrlFromMaybe(direct);
    if (directUrl) out.push(directUrl);

    // 2) fallbacky: key / name / type
    const rawKey = String(p?.pet_key || p?.petKey || "").trim();
    const rawName = _stripLevelSuffix(p?.pet_name || p?.petName || p?.name || "");
    const rawType = String(p?.pet_type || p?.petType || "").trim();

    const candidates = [rawKey, rawName, rawType].filter(Boolean);

    for (const raw of candidates) {
      const base = _slugify(raw);
      if (!base) continue;
      if (_looksLikeId(base)) continue;

      const noSpace = base.replace(/\s+/g, "");
      const under = base.replace(/\s+/g, "_");
      const dash = base.replace(/\s+/g, "-");
      const keys = Array.from(new Set([noSpace, under, dash].filter(Boolean)));

      for (const folder of PET_FOLDERS) {
        for (const k of keys) {
          const ek = encodeURIComponent(k);

          // z wersją
          if (PET_VER) {
            out.push(`${CLOUD_BASE}/${CLOUD_TX}/${PET_VER}/${folder}/${ek}.png`);
            out.push(`${CLOUD_BASE}/${CLOUD_TX}/${PET_VER}/${folder}/${ek}`);
          }

          // bez wersji (czasem Cloudinary mapuje też bez v..)
          out.push(`${CLOUD_BASE}/${CLOUD_TX}/${folder}/${ek}.png`);
          out.push(`${CLOUD_BASE}/${CLOUD_TX}/${folder}/${ek}`);
        }
      }
    }

    return _uniq(out);
  }

  async function loadTextureViaImage(url) {
    if (!hasPixi()) return null;

    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => {
          try {
            const tex = global.PIXI.Texture.from(img);
            resolve(tex || null);
          } catch (_) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function loadTextureSafeMany(urls) {
    if (!urls || !urls.length || !hasPixi()) return null;

    for (const url of urls) {
      try {
        // 1) spróbuj przez Image (crossOrigin) — najpewniejsze pod WebGL
        const tex1 = await loadTextureViaImage(url);
        if (tex1) return tex1;

        // 2) fallback: Assets.load (jeśli ktoś ma inny build pixi)
        if (global.PIXI.Assets?.load) {
          const r = await global.PIXI.Assets.load(url);
          const tex2 = r?.texture || r;
          if (tex2) return tex2;
        }
      } catch (e) {
        if (state.dbg) console.warn("[Arena] texture load failed", url, e?.message || e);
      }
    }
    return null;
  }

  // ===================== HP Bars =====================
  function hpBar(app) {
    const c = new global.PIXI.Container();
    const back = new global.PIXI.Graphics();
    const fill = new global.PIXI.Graphics();
    c.addChild(back);
    c.addChild(fill);
    app.stage.addChild(c);

    let _x = 0, _y = 0, _w = 120, _h = 14, _r = 1;

    function redraw() {
      back.clear().beginFill(0x000000, 0.35).drawRoundedRect(_x, _y, _w, _h, 6).endFill();
      const rr = Math.max(0, Math.min(1, _r));
      const fw = Math.max(0, (_w - 4) * rr);
      fill.clear().beginFill(0xffffff, 0.65).drawRoundedRect(_x + 2, _y + 2, fw, _h - 4, 5).endFill();
    }

    return {
      layout(x, y, w, h) { _x = x; _y = y; _w = w; _h = h; redraw(); },
      set(ratio) { _r = ratio; redraw(); },
      destroy() { try { c.destroy({ children: true }); } catch (_) {} }
    };
  }

  // ===================== Pixi App creation (v8 + v7) =====================
  async function createPixiApp(wrap) {
    const dpi = Math.min(2, global.devicePixelRatio || 1);

    // Pixi v8: new Application(); await app.init(opts)
    try {
      const a = new global.PIXI.Application();
      if (typeof a.init === "function") {
        await a.init({
          resizeTo: wrap,
          antialias: true,
          backgroundAlpha: 0,
          resolution: dpi,
        });
        return a;
      }
    } catch (e) {
      if (state.dbg) console.warn("[Arena] Pixi v8 init failed", e);
    }

    // Pixi v7/older: constructor with options
    try {
      return new global.PIXI.Application({
        resizeTo: wrap,
        antialias: true,
        backgroundAlpha: 0,
        resolution: dpi,
      });
    } catch (e) {
      if (state.dbg) console.warn("[Arena] Pixi v7 ctor failed", e);
      throw e;
    }
  }

  function getCanvasEl(app) {
    // v8
    try {
      if (app?.canvas) return app.canvas;
    } catch (_) {}
    // v7
    if (app?.view) return app.view;
    // renderer fallback
    if (app?.renderer?.view) return app.renderer.view;
    if (app?.renderer?.canvas) return app.renderer.canvas;
    return null;
  }

  async function renderReplayPixi(stub) {
    const wrap = $("#arenaStageWrap", state.overlay);
    const fallback = $("#arenaFallback", state.overlay);
    if (fallback) fallback.style.display = "none";

    // Create Pixi app safely (v8 compatible)
    const app = await createPixiApp(wrap);
    state.pixiApp = app;

    const canvas = getCanvasEl(app);
    if (!canvas) throw new Error("PIXI_NO_CANVAS");

    wrap.appendChild(canvas);

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

    // names
    const nameStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 14, fontWeight: "800" });
    const subStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 12, fontWeight: "700", alpha: 0.8 });

    const tLeft = new global.PIXI.Text(leftName, nameStyle);
    const tRight = new global.PIXI.Text(rightName, nameStyle);
    app.stage.addChild(tLeft);
    app.stage.addChild(tRight);

    // hp bars
    const leftHpBar = hpBar(app);
    const rightHpBar = hpBar(app);
    leftHpBar.set(1);
    rightHpBar.set(1);

    // fighters
    async function makeFighter(p, isRight) {
      const c = new global.PIXI.Container();
      app.stage.addChild(c);

      const urls = petAssetUrls(p);
      const tex = await loadTextureSafeMany(urls);

      if (state.dbg) log("pet urls", { label: String(p?.pet_name || p?.pet_type || ""), urls: urls.slice(0, 10), ok: !!tex });

      let obj;
      if (tex) {
        const sp = new global.PIXI.Sprite(tex);
        sp.anchor?.set?.(0.5);
        sp.scale.set(0.60);
        if (isRight) sp.scale.x = -Math.abs(sp.scale.x); // mirror sprite only
        obj = sp;
      } else {
        const emoji = new global.PIXI.Text("🐾", new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 56, fontWeight: "900" }));
        emoji.anchor?.set?.(0.5);
        obj = emoji;
      }

      c.addChild(obj);

      const badgeTxt = String(p.pet_name || p.pet_type || "");
      const badge = new global.PIXI.Text(badgeTxt, subStyle);
      badge.anchor?.set?.(0.5);
      badge.y = 60;
      c.addChild(badge);

      return c;
    }

    const leftF = await makeFighter(left, false);
    const rightF = await makeFighter(right, true);

    function relayout() {
      const W = wrap.clientWidth || 360;
      const H = wrap.clientHeight || 420;

      bg.clear().beginFill(0x000000, 0.22).drawRect(0, 0, W, H).endFill();

      tLeft.x = 14; tLeft.y = 10;
      tRight.x = W - 14 - tRight.width; tRight.y = 10;

      const barW = Math.max(120, Math.floor(W * 0.38));
      leftHpBar.layout(14, 34, barW, 14);
      rightHpBar.layout(W - 14 - barW, 34, barW, 14);

      leftF.x = Math.floor(W * 0.28);
      rightF.x = Math.floor(W * 0.72);
      leftF.y = Math.floor(H * 0.58);
      rightF.y = Math.floor(H * 0.58);
    }

    // Observe wrap size (bardziej stabilne niż renderer.on('resize') dla różnych buildów)
    try {
      state._ro = new ResizeObserver(() => relayout());
      state._ro.observe(wrap);
    } catch (_) {}

    relayout();

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

    // playback steps
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

      await sleep(260);
    }
  }

  async function renderReplayDom(stub, reason) {
    const meta = $("#arenaMeta", state.overlay);
    const wrap = $("#arenaStageWrap", state.overlay);
    const fallback = $("#arenaFallback", state.overlay);

    if (fallback) fallback.style.display = "none";

    const youAreP1 = !!stub.you_are_p1;
    const p1 = stub.p1 || {};
    const p2 = stub.p2 || {};
    const left = youAreP1 ? p1 : p2;
    const right = youAreP1 ? p2 : p1;

    const box = document.createElement("div");
    box.style.cssText = "padding:14px;color:#fff";
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px">
        <div><b>${left.name || "YOU"}</b><div style="opacity:.75;font-size:12px">${left.pet_name || left.pet_type || ""}</div></div>
        <div style="text-align:right"><b>${right.name || "ENEMY"}</b><div style="opacity:.75;font-size:12px">${right.pet_name || right.pet_type || ""}</div></div>
      </div>
      <div style="margin-top:12px;opacity:.85;font-size:12px">
        Replay loaded (DOM fallback).
        ${reason ? `<div style="margin-top:6px;opacity:.75">Pixi reason: ${String(reason)}</div>` : ``}
      </div>
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

      if (meta) meta.textContent = `Battle #${state.lastBattleId} • ${stub?.winner_reason || ""}`.trim();

      if (hasPixi()) {
        try {
          await renderReplayPixi(stub);
        } catch (e) {
          console.error("[Arena] Pixi render failed:", e);
          await renderReplayDom(stub, e?.message || e);
        }
      } else {
        await renderReplayDom(stub, "NO_PIXI");
      }
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
    log("init ok", { VER, hasPixi: hasPixi(), PET_VER, PET_FOLDERS });
  }

  global.Arena = { init, open, close };
})(window);
