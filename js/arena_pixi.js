// public/js/arena_pixi.js
// ArenaPixi — lightweight Pixi stage helper for arena.js
// Exposes: window.ArenaPixi.init(stageEl), setActors({you,foe,flipFoe}), attack(youAttacked,dmg,crit), destroy()
(function (global) {
  const CLOUD_UPLOAD = "https://res.cloudinary.com/dnjwvxinh/image/upload";
  const CLOUD_TX = "f_png,q_auto,w_256,c_fit";

  const state = {
    dbg: false,
    stageEl: null,
    app: null,
    root: null,
    camera: null,
    bg: null,

    left: null,
    right: null,
    leftNode: null,
    rightNode: null,
    leftIsYou: true,
  };

  function log(...a) { if (state.dbg) console.log("[ArenaPixi]", ...a); }

  function hasPixi() { return !!global.PIXI && !!global.PIXI.Application; }

  function destroy() {
    try {
      if (state.app) {
        try { state.app.ticker.stop(); } catch (_) {}
        try { state.app.destroy(true, { children: true, texture: true, baseTexture: true }); } catch (_) {}
      }
    } catch (_) {}
    state.app = null;
    state.root = null;
    state.camera = null;
    state.bg = null;
    state.leftNode = null;
    state.rightNode = null;

    if (state.stageEl) {
      try { state.stageEl.innerHTML = ""; } catch (_) {}
    }
  }

  function _isLikelyId(raw) {
    const x = String(raw || "").trim().toLowerCase();
    if (/^[a-f0-9]{32}$/.test(x)) return true;
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x)) return true;
    return false;
  }

  function _slugifyBase(raw) {
    let s = String(raw || "").trim();
    if (!s) return "";
    s = s.replace(/^pets\//i, "");
    s = s.replace(/\.(png|webp|jpg|jpeg)$/i, "");
    s = s.toLowerCase();
    s = s.replace(/[^a-z0-9 _-]/g, "");
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }

  function _cloudUrlFromPath(pathOrUrl) {
    const s = String(pathOrUrl || "").trim();
    if (!s) return "";
    if (s.includes("res.cloudinary.com")) return s; // already full
    let p = s.replace(/^\/+/, "");
    // allow people to pass "v123/pets/name.png" OR "pets/name.png"
    // if they pass "image/upload/..." strip that
    p = p.replace(/^image\/upload\//, "");
    // if already starts with transform, keep it
    if (p.startsWith(CLOUD_TX + "/")) return `${CLOUD_UPLOAD}/${p}`;
    return `${CLOUD_UPLOAD}/${CLOUD_TX}/${p}`;
  }

  function petUrlCandidatesFromPlayer(p) {
    // Prefer direct fields if you have them (best reliability)
    const direct =
      p?.pet_asset || p?.petAsset ||
      p?.pet_sprite || p?.petSprite ||
      p?.pet_icon || p?.petIcon ||
      p?.icon || p?.icon_file ||
      "";

    const directUrl = _cloudUrlFromPath(direct);
    if (directUrl) return [directUrl];

    // Otherwise build from readable keys (NOT pet_id)
    const raw =
      p?.pet_key || p?.petKey ||
      p?.pet_type || p?.petType ||
      p?.pet_name || p?.petName ||
      "";

    const base = _slugifyBase(raw);
    if (!base) return [];
    if (_isLikelyId(base)) return []; // avoid 404 spam on ids

    const noSpace = base.replace(/\s+/g, "");
    const under = base.replace(/\s+/g, "_");
    const dash = base.replace(/\s+/g, "-");

    const keys = Array.from(new Set([noSpace, under, dash].filter(Boolean)));
    return keys.map(k => _cloudUrlFromPath(`pets/${k}.png`));
  }

  async function loadTextureFromUrls(urls) {
    if (!urls || !urls.length || !hasPixi()) return null;
    const PIXI = global.PIXI;

    for (const u of urls) {
      try {
        if (PIXI.Assets?.load) {
          const tex = await PIXI.Assets.load(u);
          if (tex) return tex;
        } else {
          const tex = PIXI.Texture.from(u);
          if (tex) return tex;
        }
      } catch (e) {
        // try next
      }
    }
    return null;
  }

  function makeFighterNode(labelText) {
    const PIXI = global.PIXI;
    const c = new PIXI.Container();

    // placeholder
    const t = new PIXI.Text("🐺", { fill: 0xffffff, fontSize: 72, fontWeight: "900" });
    if (t.anchor?.set) t.anchor.set(0.5);
    t.x = 0; t.y = 0;
    c.addChild(t);

    const label = new PIXI.Text(String(labelText || ""), { fill: 0xffffff, fontSize: 12, fontWeight: "800", alpha: 0.85 });
    if (label.anchor?.set) label.anchor.set(0.5, 0);
    label.x = 0; label.y = 52;
    c.addChild(label);

    c.__body = t;     // sprite/text
    c.__label = label;

    return c;
  }

  function layout() {
    if (!state.app || !state.stageEl) return;
    const W = state.stageEl.clientWidth || 360;
    const H = state.stageEl.clientHeight || 420;

    // bg
    if (state.bg) {
      state.bg.clear();
      state.bg.beginFill(0x000000, 0.22).drawRect(0, 0, W, H).endFill();
    }

    // positions
    if (state.leftNode) {
      state.leftNode.x = Math.floor(W * 0.28);
      state.leftNode.y = Math.floor(H * 0.62);
    }
    if (state.rightNode) {
      state.rightNode.x = Math.floor(W * 0.72);
      state.rightNode.y = Math.floor(H * 0.62);
    }
  }

  function init(stageEl, opts = {}) {
    state.dbg = !!opts.dbg;
    if (!hasPixi()) throw new Error("PIXI missing");
    if (!stageEl) throw new Error("stageEl missing");

    // idempotent
    destroy();
    state.stageEl = stageEl;

    const PIXI = global.PIXI;

    const app = new PIXI.Application({
      resizeTo: stageEl,
      antialias: true,
      backgroundAlpha: 0,
      resolution: Math.min(2, global.devicePixelRatio || 1),
    });
    state.app = app;

    stageEl.innerHTML = "";
    stageEl.appendChild(app.canvas || app.view);

    state.root = new PIXI.Container();
    state.camera = new PIXI.Container();
    app.stage.addChild(state.root);
    state.root.addChild(state.camera);

    state.bg = new PIXI.Graphics();
    state.root.addChild(state.bg);

    // default fighters
    state.leftNode = makeFighterNode("");
    state.rightNode = makeFighterNode("");
    state.camera.addChild(state.leftNode);
    state.camera.addChild(state.rightNode);

    // mirror right by default (so it faces left)
    state.rightNode.scale.x = -1;

    layout();

    // Resize observer (more reliable than relying on pixi resize only)
    try {
      const ro = new ResizeObserver(() => layout());
      ro.observe(stageEl);
      app.__ro = ro;
    } catch (_) {}

    log("init ok");
  }

  async function setActors({ you, foe, flipFoe } = {}) {
    if (!state.app) throw new Error("ArenaPixi.init(stageEl) first");
    const PIXI = global.PIXI;

    // decide mirroring
    state.rightNode.scale.x = (flipFoe ? -1 : 1);

    // labels
    const youLabel = String(you?.pet_name || you?.pet_type || you?.pet_key || "");
    const foeLabel = String(foe?.pet_name || foe?.pet_type || foe?.pet_key || "");

    // left = you, right = foe (arena.js does that)
    if (state.leftNode?.__label) state.leftNode.__label.text = youLabel;
    if (state.rightNode?.__label) state.rightNode.__label.text = foeLabel;

    // load textures
    const youUrls = petUrlCandidatesFromPlayer(you);
    const foeUrls = petUrlCandidatesFromPlayer(foe);

    const youTex = await loadTextureFromUrls(youUrls);
    const foeTex = await loadTextureFromUrls(foeUrls);

    // helper to swap body
    function swapBody(node, tex) {
      if (!node) return;
      try { if (node.__body) node.removeChild(node.__body); } catch (_) {}

      let body;
      if (tex) {
        body = new PIXI.Sprite(tex);
        if (body.anchor?.set) body.anchor.set(0.5);
        body.scale.set(0.60);
      } else {
        body = new PIXI.Text("🐺", { fill: 0xffffff, fontSize: 72, fontWeight: "900" });
        if (body.anchor?.set) body.anchor.set(0.5);
      }
      node.__body = body;
      node.addChildAt(body, 0);
    }

    swapBody(state.leftNode, youTex);
    swapBody(state.rightNode, foeTex);

    // keep label centered
    try { if (state.leftNode.__label?.anchor?.set) state.leftNode.__label.anchor.set(0.5, 0); } catch(_) {}
    try { if (state.rightNode.__label?.anchor?.set) state.rightNode.__label.anchor.set(0.5, 0); } catch(_) {}

    layout();
    log("setActors", { youUrls, foeUrls, youTex: !!youTex, foeTex: !!foeTex });
  }

  function _shake(intensity = 6, ms = 180) {
    if (!state.camera) return;
    const start = performance.now();
    const baseX = state.camera.x || 0;
    const baseY = state.camera.y || 0;

    return new Promise((resolve) => {
      const tick = (t) => {
        const k = Math.min(1, (t - start) / ms);
        const damp = (1 - k);
        state.camera.x = baseX + (Math.random() * 2 - 1) * intensity * damp;
        state.camera.y = baseY + (Math.random() * 2 - 1) * intensity * damp;

        if (k < 1) requestAnimationFrame(tick);
        else {
          state.camera.x = baseX;
          state.camera.y = baseY;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  function _floatText(x, y, text, isCrit) {
    const PIXI = global.PIXI;
    const t = new PIXI.Text(String(text), {
      fill: 0xffffff,
      fontSize: isCrit ? 22 : 18,
      fontWeight: "900",
      alpha: 0.98,
    });
    t.x = x;
    t.y = y;
    state.camera.addChild(t);

    const start = performance.now();
    const dur = 420;

    return new Promise((resolve) => {
      const tick = (now) => {
        const k = Math.min(1, (now - start) / dur);
        t.y = y - (k * 54);
        t.alpha = Math.max(0, 1 - k);
        if (k < 1) requestAnimationFrame(tick);
        else {
          try { t.destroy(); } catch (_) {}
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  function _lunge(node, dir, ms = 180, dist = 26) {
    if (!node) return Promise.resolve();
    const startX = node.x;
    const targetX = startX + dir * dist;
    const start = performance.now();

    return new Promise((resolve) => {
      const tick = (now) => {
        const k = Math.min(1, (now - start) / ms);
        // ease in-out
        const e = k < 0.5 ? (2 * k * k) : (1 - Math.pow(-2 * k + 2, 2) / 2);
        node.x = startX + (targetX - startX) * e;
        if (k < 1) requestAnimationFrame(tick);
        else {
          // snap back quickly
          node.x = startX;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  async function attack(youAttacked, dmg, crit) {
    if (!state.app || !state.leftNode || !state.rightNode) return;

    const attacker = youAttacked ? state.leftNode : state.rightNode;
    const target = youAttacked ? state.rightNode : state.leftNode;

    // lunge direction: left -> +, right -> -
    const dir = youAttacked ? +1 : -1;

    await _lunge(attacker, dir);

    if (dmg > 0) {
      // small “hit” flash
      const oldAlpha = target.alpha;
      target.alpha = 0.75;
      setTimeout(() => { try { target.alpha = oldAlpha; } catch(_) {} }, 80);

      // floating dmg
      await _floatText(target.x - 10, target.y - 95, (crit ? "CRIT " : "") + "-" + dmg, !!crit);
    } else {
      await _floatText(target.x - 10, target.y - 95, "MISS", false);
    }

    if (crit) {
      // camera shake
      await _shake(7, 180);
    }
  }

  global.ArenaPixi = { init, setActors, attack, destroy };
})(window);
