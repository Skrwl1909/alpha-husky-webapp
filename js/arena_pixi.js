// /js/arena_pixi.js — Renderer-only for arena.js (Pixi v8 safe)
// Exports: window.ArenaPixi (does NOT touch window.Arena)
(function (global) {
  const S = {
    app: null,
    mount: null,
    ro: null,
    dbg: false,
    you: null,
    foe: null,
    youSp: null,
    foeSp: null,
    fx: null,
  };

  const log = (...a) => { if (S.dbg) console.log("[ArenaPixi]", ...a); };

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const looksLikeUUID = (x) => UUID_RE.test(String(x || "").trim());

  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  const TX = "f_png,q_auto,w_256,c_fit";

  function _getPetVer() {
    // ustawiasz to globalnie albo w index: window.__PET_CLOUD_VER__ = "v176..."
    return String(global.__PET_CLOUD_VER__ || "").trim();
  }

  function _slugifyName(raw) {
    return String(raw || "")
      .toLowerCase()
      .replace(/\.(png|webp|jpg|jpeg)$/i, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }

  function _cloudUrlFromSlug(slug) {
    if (!slug) return "";
    const ver = _getPetVer();
    const mid = ver ? (ver.replace(/^\/?/, "").replace(/\/?$/, "") + "/") : "";
    return `${CLOUD_BASE}/${TX}/${mid}pets/${encodeURIComponent(slug)}.png`;
  }

  function normalizeFighter(f) {
    return f?.pet || f?.active_pet || f?.pet_state || f || {};
  }

  function pickPetUrl(fighter) {
    const p = normalizeFighter(fighter);

    // 1) prefer backend-provided URLs
    const cands = [
      p.pet_img, p.pet_icon, p.petImg, p.petIcon,
      fighter?.pet_img, fighter?.pet_icon, fighter?.petImg, fighter?.petIcon
    ].filter(Boolean);

    for (const u of cands) {
      const s = String(u || "").trim();
      if (s.startsWith("http")) return s;
      // tolerate cloudinary paths like "v176.../pets/x.png"
      if (s.includes("/") || s.includes(".")) return `${CLOUD_BASE}/${TX}/${s.replace(/^\/+/, "").replace(/^image\/upload\//, "")}`;
    }

    // 2) NEVER build from UUID key
    const rawKey = String(p.pet_key || p.petKey || "").trim();
    if (rawKey && looksLikeUUID(rawKey)) {
      const nm = p.pet_name || p.petName || p.name || "";
      const slug = _slugifyName(nm);
      return _cloudUrlFromSlug(slug);
    }

    // 3) fallback from name
    const nm = p.pet_name || p.petName || p.name || "";
    const slug = _slugifyName(nm);
    return _cloudUrlFromSlug(slug);
  }

  async function _loadTexture(url) {
    const PIXI = global.PIXI;
    if (!PIXI || !url) return null;
    try {
      if (PIXI.Assets?.load) {
        const r = await PIXI.Assets.load(url);
        return r?.texture || r || null;
      }
      return PIXI.Texture.from(url);
    } catch (e) {
      log("texture load failed", url, e?.message || e);
      return null;
    }
  }

  async function _makeSprite(fighter) {
    const PIXI = global.PIXI;
    const url = pickPetUrl(fighter);
    log("pick url", url);

    const tex = await _loadTexture(url);
    if (!tex) {
      // fallback placeholder
      const t = new PIXI.Text("🐺", { fill: 0xffffff, fontSize: 64, fontWeight: "900" });
      t.anchor?.set?.(0.5);
      return t;
    }

    const sp = new PIXI.Sprite(tex);
    sp.anchor?.set?.(0.5);
    return sp;
  }

  function _size(el) {
    const r = el.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width || 0));
    const h = Math.max(1, Math.floor(r.height || 0));
    return { w, h };
  }

  function _layout() {
    if (!S.app || !S.mount) return;
    const { w, h } = _size(S.mount);
    if (!w || !h) return;

    try { S.app.renderer?.resize?.(w, h); } catch (_) {}

    const max = Math.min(w, h) * 0.40;
    const y = h * 0.58;

    if (S.youSp) {
      S.youSp._baseX = w * 0.28;
      S.youSp._baseY = y;
      S.youSp.x = S.youSp._baseX;
      S.youSp.y = S.youSp._baseY;
      _fit(S.youSp, max);
    }

    if (S.foeSp) {
      S.foeSp._baseX = w * 0.72;
      S.foeSp._baseY = y;
      S.foeSp.x = S.foeSp._baseX;
      S.foeSp.y = S.foeSp._baseY;
      _fit(S.foeSp, max);
    }
  }

  function _fit(node, maxSize) {
    if (!node?.getBounds) return;
    const b = node.getBounds();
    const bw = Math.max(1, b.width);
    const bh = Math.max(1, b.height);
    const s = Math.min(maxSize / bw, maxSize / bh);
    node.scale?.set?.(s);
  }

  async function init(arg) {
    const PIXI = global.PIXI;
    if (!PIXI) throw new Error("PIXI not loaded");

    // accept init(stageEl) OR init({mount,dbg})
    let mount = arg;
    let dbg = false;
    if (arg && typeof arg === "object" && !(arg instanceof Element)) {
      mount = arg.mount || arg.el || arg.stage || null;
      dbg = !!arg.dbg;
    }
    if (typeof mount === "string") mount = document.querySelector(mount);

    if (!mount) throw new Error("ArenaPixi.init: mount missing");

    S.dbg = dbg || S.dbg;

    // destroy old
    destroy();

    S.mount = mount;

    // Pixi v8 init
    const app = new PIXI.Application();
    const { w, h } = _size(mount);
    const initW = Math.max(64, w);
    const initH = Math.max(64, h);

    if (typeof app.init === "function") {
      await app.init({
        width: initW,
        height: initH,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(2, global.devicePixelRatio || 1),
        autoDensity: true,
      });
    } else {
      // v7 fallback
      app.renderer = app.renderer || {};
    }

    const view = app.canvas || app.view;
    if (!view) throw new Error("ArenaPixi: app has no canvas/view");

    view.style.width = "100%";
    view.style.height = "100%";
    view.style.display = "block";

    mount.innerHTML = "";
    mount.appendChild(view);

    S.app = app;

    S.fx = new PIXI.Container();
    app.stage.addChild(S.fx);

    S.ro = new ResizeObserver(() => _layout());
    S.ro.observe(mount);
    requestAnimationFrame(() => _layout());

    log("init ok");
  }

  async function setActors({ you, foe, flipFoe = true } = {}) {
    const PIXI = global.PIXI;
    if (!S.app) throw new Error("ArenaPixi not inited");

    S.you = you || {};
    S.foe = foe || {};

    // clear stage
    S.app.stage.removeChildren();
    S.fx = new PIXI.Container();
    S.app.stage.addChild(S.fx);

    // make sprites
    S.youSp = await _makeSprite(S.you);
    S.foeSp = await _makeSprite(S.foe);

    // mirror foe
    if (flipFoe && S.foeSp?.scale) {
      S.foeSp.scale.x = -Math.abs(S.foeSp.scale.x || 1);
    }

    S.app.stage.addChild(S.youSp, S.foeSp, S.fx);

    _layout();
    log("actors set");
  }

  function _floatText(x, y, txt, isCrit) {
    const PIXI = global.PIXI;
    if (!S.fx) return;
    const t = new PIXI.Text(txt, {
      fill: 0xffffff,
      fontSize: isCrit ? 22 : 18,
      fontWeight: "900"
    });
    t.x = x;
    t.y = y;
    t.alpha = 1;
    S.fx.addChild(t);

    let life = 0;
    const dur = 420;
    const tick = (dt) => {
      life += dt * 16.6;
      t.y -= 0.35 * dt * 2;
      t.alpha = Math.max(0, 1 - (life / dur));
      if (life >= dur) {
        S.app.ticker.remove(tick);
        try { t.destroy(); } catch (_) {}
      }
    };
    S.app.ticker.add(tick);
  }

  function _shakeCrit() {
    if (!S.app) return;
    const st = S.app.stage;
    const baseX = st.x, baseY = st.y;
    let i = 0;
    const tick = () => {
      i++;
      st.x = baseX + (i % 2 ? 2 : -2);
      st.y = baseY + (i % 2 ? -2 : 2);
      if (i > 10) {
        st.x = baseX; st.y = baseY;
        S.app.ticker.remove(tick);
      }
    };
    S.app.ticker.add(tick);
  }

  function attack(youAttacked, dmg, crit) {
    if (!S.app || !S.youSp || !S.foeSp) return;

    const a = youAttacked ? S.youSp : S.foeSp;
    const t = youAttacked ? S.foeSp : S.youSp;

    const dir = youAttacked ? +1 : -1;
    const ax0 = a._baseX ?? a.x;
    const tx0 = t._baseX ?? t.x;

    // quick punch
    a.x = ax0 + dir * 26;
    setTimeout(() => { try { a.x = ax0; } catch(_){} }, 90);

    // hit flash
    const oldA = t.alpha;
    t.alpha = 0.65;
    setTimeout(() => { try { t.alpha = oldA; } catch(_){} }, 80);

    // dmg float
    const hit = Math.max(0, Number(dmg || 0));
    if (hit > 0) _floatText(tx0 - 10, (t._baseY ?? t.y) - 90, (crit ? "CRIT " : "") + "-" + hit, !!crit);

    if (crit) _shakeCrit();
  }

  function destroy() {
    try { if (S.ro && S.mount) S.ro.unobserve(S.mount); } catch (_) {}
    S.ro = null;

    if (S.app) {
      try { S.app.destroy(true); } catch (_) {}
    }
    S.app = null;
    S.mount = null;
    S.youSp = null;
    S.foeSp = null;
    S.fx = null;
  }

  global.ArenaPixi = { init, setActors, attack, destroy, _pickPetUrl: pickPetUrl };
})(window);
