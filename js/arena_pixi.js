// public/js/arena_pixi.js — FINAL (ArenaPixi API for arena.js)
// Pixi v8-safe, prefers pet_img/pet_icon, ignores UUID, app.canvas/view safe
(function (global) {
  const VER = "arena_pixi.js v2-2026-02-07-arenapixi-api";
  try { global.__ARENA_PIXI_VER__ = VER; } catch (_) {}

  let _dbg = false;
  let _app = null;
  let _mount = null;
  let _ro = null;

  let _youNode = null;
  let _foeNode = null;

  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  const CLOUD_TX = "f_png,q_auto,w_256,c_fit";

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const looksLikeUUID = (s) => UUID_RE.test(String(s || "").trim());

  const log = (...a) => { if (_dbg) console.log("[ArenaPixi]", ...a); };

  function petVer() {
    return String(global.__PET_CLOUD_VER__ || global.PETS_VER || "").trim(); // "v176..." albo ""
  }

  function stripLevelSuffix(raw) {
    let s = String(raw || "").trim();
    if (!s) return "";
    s = s.replace(/\s*\(\s*(?:lv|lvl|level)\s*\d+\s*\)\s*$/i, "");
    s = s.replace(/\s*(?:lv|lvl|level)\s*\d+\s*$/i, "");
    s = s.replace(/\s*\[\s*(?:lv|lvl|level)\s*\d+\s*\]\s*$/i, "");
    return s.trim();
  }

  // "Dark Husky Pup" -> "darkhuskypup"
  function slugifyPublicId(name) {
    const base = String(name || "")
      .toLowerCase()
      .replace(/\.(png|webp|jpg|jpeg)$/i, "")
      .replace(/[^a-z0-9 _-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!base) return "";
    return base.replace(/[\s_-]+/g, "");
  }

  function cloudUrlFromPublicId(pid) {
    if (!pid) return "";
    const ver = petVer();
    const path = (ver ? `${ver}/` : "") + `pets/${encodeURIComponent(pid)}.png`;
    return `${CLOUD_BASE}/${CLOUD_TX}/${path}`;
  }

  function cloudUrlFromMaybePathOrUrl(x) {
    const s = String(x || "").trim();
    if (!s) return "";
    if (s.includes("res.cloudinary.com")) return s;

    // allow passing "v176.../pets/xx.png" or "pets/xx.png"
    const p = s.replace(/^\/+/, "").replace(/^image\/upload\//, "");
    if (!p) return "";
    if (p.startsWith(CLOUD_TX + "/")) return `${CLOUD_BASE}/${p}`;
    return `${CLOUD_BASE}/${CLOUD_TX}/${p}`;
  }

  function pickUrlFromFighter(f) {
    if (!f || typeof f !== "object") return "";

    // 1) BEST: backend-enriched
    const best = [
      f.pet_img, f.pet_icon,
      f.petImg, f.petIcon,
      f.img, f.icon, f.image, f.avatar
    ];
    for (const u of best) {
      if (typeof u === "string" && u.trim()) return u.trim();
    }

    // 2) NEVER build from UUID pet_key
    const rawKey = String(f.pet_key || f.petKey || "").trim();
    if (rawKey) {
      if (!looksLikeUUID(rawKey)) {
        // if someone stored "v.../pets/x.png" or "pets/x.png"
        const fromPath = cloudUrlFromMaybePathOrUrl(rawKey);
        if (fromPath) return fromPath;
      }
      // uuid -> ignore
    }

    // 3) fallback: from pet_name only
    const nm = stripLevelSuffix(f.pet_name || f.petName || f.name || "");
    const pid = slugifyPublicId(nm);
    return cloudUrlFromPublicId(pid);
  }

  async function loadTexture(url) {
    const PIXI = global.PIXI;
    if (!PIXI || !url) return null;

    // try Pixi Assets
    try {
      if (PIXI.Assets && typeof PIXI.Assets.load === "function") {
        const r = await PIXI.Assets.load(url);
        return r?.texture || r || null;
      }
      return PIXI.Texture.from(url);
    } catch (e) {
      log("Assets.load failed:", url, e);
    }

    // manual Image fallback (CORS edge cases)
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      await new Promise((res, rej) => {
        img.onload = () => res(true);
        img.onerror = () => rej(new Error("IMG_LOAD_FAIL"));
        img.src = url;
      });
      const bt = PIXI.BaseTexture.from(img);
      return new PIXI.Texture(bt);
    } catch (e2) {
      log("Image fallback failed:", url, e2);
      return null;
    }
  }

  function getSize(el) {
    const r = el.getBoundingClientRect();
    const w = Math.max(64, Math.floor(r.width || 0));
    const h = Math.max(64, Math.floor(r.height || 0));
    return { w, h };
  }

  async function ensureApp(mountEl) {
    const PIXI = global.PIXI;
    if (!PIXI) throw new Error("PIXI missing on window");

    _mount = mountEl;
    if (_app) return _app;

    let app = new PIXI.Application();
    const { w, h } = getSize(mountEl);

    if (typeof app.init === "function") {
      await app.init({
        width: w,
        height: h,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(2, global.devicePixelRatio || 1),
        autoDensity: true,
      });
    } else {
      app = new PIXI.Application({
        width: w,
        height: h,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(2, global.devicePixelRatio || 1),
        autoDensity: true,
      });
    }

    const view = app.canvas || app.view;
    if (!view) throw new Error("Pixi has no canvas/view (init not done?)");

    view.style.width = "100%";
    view.style.height = "100%";
    view.style.display = "block";

    mountEl.innerHTML = "";
    mountEl.appendChild(view);

    _app = app;

    // keep renderer synced with modal/layout
    try {
      _ro = new ResizeObserver(() => {
        try { resizeToMount(); } catch (_) {}
      });
      _ro.observe(mountEl);
    } catch (_) {}

    requestAnimationFrame(() => {
      try { resizeToMount(); } catch (_) {}
    });

    return app;
  }

  function resizeToMount() {
    if (!_app || !_mount) return;
    const { w, h } = getSize(_mount);
    try { _app.renderer?.resize?.(w, h); } catch (_) {}
  }

  function clearStage() {
    if (!_app) return;
    try { _app.stage.removeChildren(); } catch (_) {}
    _youNode = null;
    _foeNode = null;
  }

  function fit(node, maxSize) {
    if (!node) return;
    const b = node.getBounds();
    const bw = Math.max(1, b.width);
    const bh = Math.max(1, b.height);
    const s = Math.min(maxSize / bw, maxSize / bh);
    node.scale.set(s);
  }

  async function setActors({ you, foe, flipFoe } = {}) {
    if (!_mount) throw new Error("ArenaPixi.init(mountEl) not called");

    const app = await ensureApp(_mount);
    clearStage();

    const PIXI = global.PIXI;

    const urlYou = pickUrlFromFighter(you || {});
    const urlFoe = pickUrlFromFighter(foe || {});
    log("actors urls", { urlYou, urlFoe });

    const texYou = await loadTexture(urlYou);
    const texFoe = await loadTexture(urlFoe);

    const makeNode = (tex, label) => {
      if (tex) {
        const sp = new PIXI.Sprite(tex);
        sp.anchor?.set?.(0.5);
        return sp;
      }
      const t = new PIXI.Text(label || "🐾", { fill: 0xffffff, fontSize: 54, fontWeight: "900" });
      t.anchor?.set?.(0.5);
      return t;
    };

    _youNode = makeNode(texYou, "YOU");
    _foeNode = makeNode(texFoe, "FOE");

    const W = app.renderer.width;
    const H = app.renderer.height;
    const max = Math.min(W, H) * 0.55;

    fit(_youNode, max);
    fit(_foeNode, max);

    _youNode.x = W * 0.25; _youNode.y = H * 0.62;
    _foeNode.x = W * 0.75; _foeNode.y = H * 0.62;

    if (flipFoe && _foeNode.scale) _foeNode.scale.x = -Math.abs(_foeNode.scale.x);

    app.stage.addChild(_youNode, _foeNode);
  }

  function attack(youAttacked, dmg, crit) {
    if (!_app || !_youNode || !_foeNode) return;

    const attacker = youAttacked ? _youNode : _foeNode;
    const target = youAttacked ? _foeNode : _youNode;

    const dir = youAttacked ? +1 : -1;

    const startX = attacker.x;
    attacker.x = startX + dir * 20;
    setTimeout(() => { attacker.x = startX; }, 90);

    const sy = target.scale.y;
    target.scale.y = sy * 0.92;
    setTimeout(() => { target.scale.y = sy; }, 80);

    // floating dmg
    try {
      const PIXI = global.PIXI;
      const t = new PIXI.Text((crit ? "CRIT " : "") + "-" + (dmg || 0), {
        fill: 0xffffff,
        fontSize: 18,
        fontWeight: "900",
      });
      t.anchor?.set?.(0.5);
      t.x = target.x;
      t.y = target.y - 90;
      t.alpha = 0.95;
      _app.stage.addChild(t);

      let life = 0;
      const dur = 420;
      const tick = (dt) => {
        life += dt * 16.6;
        t.y -= 0.6 * dt * 2;
        t.alpha = Math.max(0, 1 - (life / dur));
        if (life >= dur) {
          _app.ticker.remove(tick);
          try { t.destroy(); } catch (_) {}
        }
      };
      _app.ticker.add(tick);
    } catch (_) {}
  }

  function init(mountOrOpts) {
    // supports init(mountEl) OR init({mount, dbg})
    if (mountOrOpts && mountOrOpts.nodeType === 1) {
      _mount = mountOrOpts;
      return;
    }
    const o = mountOrOpts || {};
    _mount = o.mount || _mount;
    _dbg = !!o.dbg;
  }

  function destroy() {
    try { if (_ro && _mount) _ro.unobserve(_mount); } catch (_) {}
    _ro = null;
    _mount = null;

    if (_app) {
      try { _app.destroy(true); } catch (_) {}
    }
    _app = null;
    _youNode = null;
    _foeNode = null;
  }

  global.ArenaPixi = { init, setActors, attack, destroy, _ver: VER, _pickUrl: pickUrlFromFighter };
})(window);
