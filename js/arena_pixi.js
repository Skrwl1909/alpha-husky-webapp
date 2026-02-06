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
  const VER = "arena_pixi.js vG-2026-02-06-final";
  try { global.__ARENA_PIXI_VER__ = VER; } catch(_){}

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
        <button id="arenaClose" type="button"
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
        <button id="arenaReplay" type="button"
          style="flex:1;border:0;border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.14);color:#fff;font-weight:800">
          Replay
        </button>
        <button id="arenaClose2" type="button"
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

  // ===================== Cloudinary Pet Sprites (Adopt-style) =====================
  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  const CLOUD_TX = "f_png,q_auto,w_256,c_fit";
  const PET_VER = String(global.__PET_CLOUD_VER__ || "v1767699377").trim().replace(/^\/+|\/+$/g, "");
  const PET_FOLDERS = ["pets", "pets/icons"]; // jakbyś miał kiedyś icons

  function _stripLevelSuffix(raw) {
    let s = String(raw || "").trim();
    if (!s) return s;
    s = s.replace(/\s*\(\s*(?:lv|lvl|level)\s*\d+\s*\)\s*$/i, "");
    s = s.replace(/\s*(?:lv|lvl|level)\s*\d+\s*$/i, "");
    s = s.replace(/\s*\[\s*(?:lv|lvl|level)\s*\d+\s*\]\s*$/i, "");
    return s.trim();
  }

  function _slugAdoptStyle(raw) {
    let s = String(raw || "").trim().toLowerCase();
    if (!s) return "";
    s = s.replace(/[^a-z0-9]+/g, ""); // DARK HUSKY PUP -> darkhuskypup
    return s;
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

  function normalizePetObj(fighter) {
    return fighter?.pet || fighter?.active_pet || fighter?.pet_state || fighter;
  }

  function petAssetUrls(fighter) {
    const p = normalizePetObj(fighter);

    // 1) DIRECT z backendu (jak Adopt: gotowy url)
    const direct =
      p?.pet_icon || p?.petIcon ||
      p?.pet_asset || p?.petAsset ||
      p?.pet_sprite || p?.petSprite ||
      p?.icon || p?.icon_file || p?.iconFile ||
      "";
    const directUrl = _cloudUrlFromMaybe(direct);

    // 2) Adopt-style fallback z pet_name -> slug
    const nm = _stripLevelSuffix(p?.pet_name || p?.petName || fighter?.pet_name || fighter?.name || "");
    const slug = _slugAdoptStyle(nm);

    const out = [];
    if (directUrl) out.push(directUrl);

    if (slug) {
      for (const folder of PET_FOLDERS) {
        // versioned
        out.push(`${CLOUD_BASE}/${CLOUD_TX}/${PET_VER}/${folder}/${encodeURIComponent(slug)}.png`);
        // non-version (czasem też działa, zostawiamy jako fallback)
        out.push(`${CLOUD_BASE}/${CLOUD_TX}/${folder}/${encodeURIComponent(slug)}.png`);
      }
    }

    // 3) last resort: pet_type jako nazwa pliku (jeśli kiedyś takie dodasz)
    const tp = _slugAdoptStyle(p?.pet_type || p?.petType || "");
    if (tp && tp !== slug) {
      for (const folder of PET_FOLDERS) {
        out.push(`${CLOUD_BASE}/${CLOUD_TX}/${PET_VER}/${folder}/${encodeURIComponent(tp)}.png`);
        out.push(`${CLOUD_BASE}/${CLOUD_TX}/${folder}/${encodeURIComponent(tp)}.png`);
      }
    }

    return Array.from(new Set(out));
  }

  // ---- SUPER PEWNY loader (jak DOM): new Image() -> Texture.from(img)
  function loadTextureViaImage(url) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const tex = global.PIXI.Texture.from(img);
            resolve(tex);
          } catch (e) { reject(e); }
        };
        img.onerror = (e) => reject(e || new Error("IMG_ERROR"));
        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  }

  async function loadTextureSafeMany(urls) {
    if (!urls || !urls.length || !hasPixi()) return null;

    for (const url of urls) {
      try {
        const tex = await loadTextureViaImage(url);
        if (tex) return tex;
      } catch (e) {
        if (state.dbg) console.warn("[Arena] texture load failed", url, e?.message || e);
      }
    }
    return null;
  }

  // ===================== HP bar =====================
  function hpBar(app) {
    const c = new global.PIXI.Container();
    const gBack = new global.PIXI.Graphics();
    const gFill = new global.PIXI.Graphics();
    c.addChild(gBack, gFill);
    app.stage.addChild(c);

    let _x=0,_y=0,_w=120,_h=14;
    function draw(ratio) {
      const rr = Math.max(0, Math.min(1, ratio));
      gBack.clear().beginFill(0x000000, 0.35).drawRoundedRect(_x, _y, _w, _h, 6).endFill();
      const fillW = Math.max(0, (_w - 4) * rr);
      gFill.clear().beginFill(0xffffff, 0.65).drawRoundedRect(_x + 2, _y + 2, fillW, _h - 4, 5).endFill();
    }

    return {
      place(x,y,w,h){ _x=x; _y=y; _w=w; _h=h; draw(1); },
      set(r){ draw(r); },
      container: c,
    };
  }

  async function renderReplayPixi(stub) {
    const wrap = $("#arenaStageWrap", state.overlay);
    const fallback = $("#arenaFallback", state.overlay);
    if (fallback) fallback.style.display = "none";

    const app = new global.PIXI.Application({
      resizeTo: wrap,
      antialias: true,
      backgroundAlpha: 0,
      resolution: Math.min(2, global.devicePixelRatio || 1),
    });
    state.pixiApp = app;
    wrap.appendChild(app.canvas || app.view);

    const bg = new global.PIXI.Graphics();
    app.stage.addChild(bg);

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
    const subStyle  = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 12, fontWeight: "700", alpha: 0.8 });

    const tLeft = new global.PIXI.Text(leftName, nameStyle);
    const tRight = new global.PIXI.Text(rightName, nameStyle);
    app.stage.addChild(tLeft, tRight);

    const leftHpBar = hpBar(app);
    const rightHpBar = hpBar(app);

    function relayout() {
      const W = wrap.clientWidth || 360;
      const H = wrap.clientHeight || 420;

      bg.clear().beginFill(0x000000, 0.22).drawRect(0, 0, W, H).endFill();

      tLeft.x = 14; tLeft.y = 10;
      tRight.x = W - 14 - tRight.width; tRight.y = 10;

      const barW = Math.max(120, Math.floor(W * 0.38));
      leftHpBar.place(14, 34, barW, 14);
      rightHpBar.place(W - 14 - barW, 34, barW, 14);

      leftHpBar.set(leftHp / leftMax);
      rightHpBar.set(rightHp / rightMax);
    }
    relayout();
    app.renderer.on("resize", relayout);

    async function makeFighter(p, isRight) {
      const c = new global.PIXI.Container();
      app.stage.addChild(c);

      const urls = petAssetUrls(p);
      const tex = await loadTextureSafeMany(urls);

      if (state.dbg) log("pet urls", {
        name: p?.pet_name || p?.pet_type || p?.pet_key,
        direct: p?.pet_icon,
        urls: urls.slice(0, 6),
        ok: !!tex
      });

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

      const badge = new global.PIXI.Text(String(p.pet_name || p.pet_type || ""), subStyle);
      badge.x = -badge.width / 2;
      badge.y = 52;
      c.addChild(badge);

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

  async function renderReplayDom(stub) {
    const wrap = $("#arenaStageWrap", state.overlay);
    const fallback = $("#arenaFallback", state.overlay);
    if (fallback) fallback.style.display = "none";

    const box = document.createElement("div");
    box.style.cssText = "padding:14px;color:#fff";
    box.innerHTML = `<div style="opacity:.85;font-size:12px">Replay loaded (DOM fallback).</div>`;
    wrap.appendChild(box);
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

      const res = await state.apiPost("/webapp/arena/replay", { battle_id: state.lastBattleId, dbg: !!state.dbg });
      const stub = res?.data || res?.stub || res;
      if (!stub || !Array.isArray(stub.steps)) throw new Error("Bad replay payload");

      try {
        global.__ARENA_LAST_STUB__ = stub;
        global.__ARENA_LAST_BATTLE_ID__ = state.lastBattleId;
      } catch (_) {}

      if (state.dbg && stub?._dbg_pet) console.log("[Arena][dbg_pet]", stub._dbg_pet);

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
    log("init ok", { VER, hasPixi: hasPixi(), PET_VER, PET_FOLDERS });
  }

  global.Arena = { init, open, close };
})(window);
