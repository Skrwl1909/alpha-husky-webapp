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
  const VER = "arena_pixi.js vE-2026-02-06a";
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

  // Twoje pety realnie siedzą pod /v1767699377/pets/<slug>.png
  // Spróbujemy: najpierw versioned, potem versionless (działa też gdy zmienisz wersję w przyszłości).
  const DEFAULT_PET_VER = "v1767699377";
  function _normVer(v) {
    const s = String(v || "").trim();
    if (!s) return "";
    if (s.startsWith("v")) return s;
    if (/^\d+$/.test(s)) return "v" + s;
    return s.replace(/^\/+/, "").split("/")[0];
  }
  const PET_VER = _normVer(global.CLOUD_PETS_VER || global.PETS_VER || DEFAULT_PET_VER);
  const PET_VER_PREFIXES = Array.from(new Set([PET_VER, ""].filter(Boolean)));

  const PET_FOLDERS = ["pets", "pets/icons"]; // dopisz jeśli masz inny folder

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

  // wykryj "zły direct URL" typu .../pets/<uuid>.png (u Ciebie 404)
  function _isBadUuidPetUrl(url) {
    const u = String(url || "").trim();
    if (!u) return false;
    const m = u.match(/\/pets\/([^/?#]+)\.?/i);
    if (!m) return false;
    const tail = (m[1] || "").split(".")[0];
    return _looksLikeId(tail);
  }

  function normalizePetObj(fighter) {
    return fighter?.pet || fighter?.active_pet || fighter?.pet_state || fighter;
  }

  function pickPetLabel(p) {
    return String(
      p?.pet_name || p?.petName ||
      p?.pet_key  || p?.petKey  ||
      p?.pet_type || p?.petType ||
      p?.name || ""
    );
  }

  function petAssetUrls(fighter) {
    const p = normalizePetObj(fighter);

    // 1) direct z backendu (ale ignoruj jeśli wygląda na UUID pod /pets/)
    const direct =
      p?.pet_icon || p?.petIcon ||
      p?.pet_asset || p?.petAsset ||
      p?.pet_sprite || p?.petSprite ||
      p?.icon_file || p?.iconFile ||
      fighter?.pet_icon || fighter?.petIcon ||
      "";

    const directUrl = _cloudUrlFromMaybe(direct);
    if (directUrl && !_isBadUuidPetUrl(directUrl)) {
      return [directUrl];
    }

    // 2) stabilny klucz (jeśli to nie UUID)
    const rawKey = String(p?.pet_key || p?.petKey || fighter?.pet_key || fighter?.petKey || "").trim();
    const keyOk = rawKey && !_looksLikeId(rawKey);

    // 3) nazwa bez "(Lv X)" — to jest u Ciebie kluczowe
    const rawName = _stripLevelSuffix(
      p?.pet_name || p?.petName || fighter?.pet_name || fighter?.petName || p?.name || ""
    );

    // 4) archetyp (mystic/feral) — last resort
    const rawType = String(p?.pet_type || p?.petType || fighter?.pet_type || fighter?.petType || "").trim();

    const raw = (keyOk ? rawKey : "") || rawName || rawType;
    const base = _slugify(raw);
    if (!base) return [];

    // Twoje pliki są typu: darkhuskypup.png => potrzebujemy noSpace przede wszystkim
    const noSpace = base.replace(/\s+/g, "");
    const under = base.replace(/\s+/g, "_");
    const dash = base.replace(/\s+/g, "-");
    const keys = Array.from(new Set([noSpace, under, dash].filter(Boolean))).filter(k => !_looksLikeId(k));

    const out = [];
    for (const ver of PET_VER_PREFIXES) {
      const verPart = ver ? (ver + "/") : "";
      for (const folder of PET_FOLDERS) {
        for (const k of keys) {
          const ek = encodeURIComponent(k);
          // transform + version + folder + file
          out.push(`${CLOUD_BASE}/${CLOUD_TX}/${verPart}${folder}/${ek}.png`);
          out.push(`${CLOUD_BASE}/${CLOUD_TX}/${verPart}${folder}/${ek}`);
          // no-transform też jako fallback (czasem transform może nie być whitelisted)
          out.push(`${CLOUD_BASE}/${verPart}${folder}/${ek}.png`);
        }
      }
    }

    // de-dupe
    const seen = new Set();
    return out.filter(u => (seen.has(u) ? false : (seen.add(u), true)));
  }

  async function _loadTextureOne(url) {
    const PIXI = global.PIXI;
    if (!PIXI) throw new Error("NO_PIXI");

    // Pixi Assets (v7/v8)
    if (PIXI.Assets?.load) {
      const r = await PIXI.Assets.load(url);
      return r?.texture || r;
    }

    // Texture.fromURL (często dostępne)
    if (PIXI.Texture?.fromURL) {
      return await PIXI.Texture.fromURL(url);
    }

    // Manual Image loader (pewniak)
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("IMG_LOAD_FAIL"));
      im.src = url;
    });

    // Texture.from(image)
    return PIXI.Texture.from(img);
  }

  async function loadTextureSafeMany(urls) {
    if (!urls || !urls.length || !hasPixi()) return null;

    for (const url of urls) {
      try {
        const tex = await _loadTextureOne(url);
        if (tex) return tex;
      } catch (e) {
        if (state.dbg) console.warn("[Arena] texture load failed", url, e?.message || e);
      }
    }
    return null;
  }

  function hpBar(app, x, y, w, h) {
    const cont = new global.PIXI.Container();
    app.stage.addChild(cont);

    const gBack = new global.PIXI.Graphics();
    const gFill = new global.PIXI.Graphics();
    cont.addChild(gBack);
    cont.addChild(gFill);

    function redraw(xx, yy, ww, hh, ratio) {
      gBack.clear().beginFill(0x000000, 0.35).drawRoundedRect(xx, yy, ww, hh, 6).endFill();
      const rr = Math.max(0, Math.min(1, ratio));
      const fillW = Math.max(0, (ww - 4) * rr);
      gFill.clear().beginFill(0xffffff, 0.65).drawRoundedRect(xx + 2, yy + 2, fillW, hh - 4, 5).endFill();
    }

    let _x = x, _y = y, _w = w, _h = h, _r = 1;
    redraw(_x, _y, _w, _h, _r);

    return {
      set(ratio) {
        _r = ratio;
        redraw(_x, _y, _w, _h, _r);
      },
      setPos(xx, yy, ww, hh) {
        _x = xx; _y = yy; _w = ww; _h = hh;
        redraw(_x, _y, _w, _h, _r);
      }
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
    const subStyle = new global.PIXI.TextStyle({ fill: 0xffffff, fontSize: 12, fontWeight: "700", alpha: 0.8 });

    const tLeft = new global.PIXI.Text(leftName, nameStyle);
    const tRight = new global.PIXI.Text(rightName, nameStyle);
    app.stage.addChild(tLeft);
    app.stage.addChild(tRight);

    // hp bars (will be positioned in relayout)
    const leftHpBar = hpBar(app, 14, 34, 160, 14);
    const rightHpBar = hpBar(app, 14, 34, 160, 14);
    leftHpBar.set(1);
    rightHpBar.set(1);

    function relayout() {
      const W = wrap.clientWidth || 360;
      const H = wrap.clientHeight || 420;

      bg.clear().beginFill(0x000000, 0.22).drawRect(0, 0, W, H).endFill();

      tLeft.x = 14; tLeft.y = 10;
      tRight.x = W - 14 - tRight.width; tRight.y = 10;

      const barW = Math.max(120, Math.floor(W * 0.38));
      leftHpBar.setPos(14, 34, barW, 14);
      rightHpBar.setPos(W - 14 - barW, 34, barW, 14);
    }
    relayout();
    app.renderer.on("resize", relayout);

    async function makeFighter(p, isRight) {
      const c = new global.PIXI.Container();
      app.stage.addChild(c);

      const urls = petAssetUrls(p);
      const tex = await loadTextureSafeMany(urls);

      if (state.dbg) {
        log("pet urls", {
          label: pickPetLabel(p),
          urls: urls.slice(0, 8),
          total: urls.length,
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

      const badgeText = _stripLevelSuffix(String(p.pet_name || p.pet_type || p.pet_key || ""));
      const badge = new global.PIXI.Text(badgeText, subStyle);
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
