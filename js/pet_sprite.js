// js/pet_sprite.js
// Lightweight animated pet spritesheet renderer with static image fallback.
(function (global) {
  const STATES = ["idle", "walk", "attack", "hurt", "victory", "sleep"];

  function toNum(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function spriteMeta(pet) {
    if (!pet || typeof pet !== "object") return null;
    const meta = pet.sprite || pet.spriteMeta || pet.sprite_meta || pet.animatedSprite || null;
    return meta && typeof meta === "object" ? meta : null;
  }

  function spriteUrl(pet) {
    return String(
      pet?.spriteSheetUrl ||
      pet?.sprite_sheet_url ||
      pet?.spritesheetUrl ||
      pet?.spriteSheet ||
      ""
    ).trim();
  }

  function staticUrl(pet, opts) {
    return String(
      opts?.fallbackUrl ||
      pet?.img ||
      pet?.icon ||
      pet?.pet_img ||
      pet?.pet_icon ||
      pet?.image ||
      ""
    ).trim();
  }

  function hasSprite(pet) {
    const url = spriteUrl(pet);
    const meta = spriteMeta(pet);
    const rows = meta?.rows || {};
    return !!(
      url &&
      meta &&
      toNum(meta.frameW, 0) &&
      toNum(meta.frameH, 0) &&
      toNum(meta.cols, 0) &&
      typeof rows === "object" &&
      Object.prototype.hasOwnProperty.call(rows, "idle")
    );
  }

  function setCrisp(el) {
    if (!el || !el.style) return;
    el.style.imageRendering = "pixelated";
  }

  function makeFallback(pet, opts) {
    const url = staticUrl(pet, opts);
    const fallback = document.createElement(url ? "img" : "div");
    fallback.className = "petSpriteFallback";
    if (url) {
      fallback.alt = opts?.alt || pet?.name || "pet";
      fallback.decoding = "async";
      fallback.loading = opts?.loading || "lazy";
      fallback.referrerPolicy = "no-referrer";
      fallback.src = url;
      fallback.onerror = () => {
        fallback.removeAttribute("src");
        fallback.style.display = "none";
      };
    }
    return fallback;
  }

  function create(pet, opts = {}) {
    const meta = spriteMeta(pet) || {};
    const rows = meta.rows || {};
    const frameW = toNum(meta.frameW, 0);
    const frameH = toNum(meta.frameH, 0);
    const cols = Math.max(1, Math.floor(toNum(meta.cols, 1)));
    const fps = Math.max(1, toNum(opts.fps ?? meta.fps, 8));
    const url = spriteUrl(pet);
    const initialState = STATES.includes(opts.state) ? opts.state : "idle";

    const wrap = document.createElement("div");
    wrap.className = opts.className || "petSprite";
    wrap.dataset.petSprite = "1";
    wrap.style.position = wrap.style.position || "relative";
    wrap.style.display = wrap.style.display || "inline-flex";
    wrap.style.alignItems = wrap.style.alignItems || "center";
    wrap.style.justifyContent = wrap.style.justifyContent || "center";
    wrap.style.overflow = wrap.style.overflow || "hidden";
    if (opts.mirror) wrap.style.transform = "scaleX(-1)";

    const canvas = document.createElement("canvas");
    canvas.className = "petSpriteCanvas";
    canvas.width = frameW || 1;
    canvas.height = frameH || 1;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "contain";
    canvas.style.display = "none";
    setCrisp(canvas);

    const fallback = makeFallback(pet, opts);
    fallback.style.width = "100%";
    fallback.style.height = "100%";
    fallback.style.objectFit = "contain";
    setCrisp(fallback);

    wrap.appendChild(canvas);
    wrap.appendChild(fallback);

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.imageSmoothingEnabled = false;

    const image = new Image();
    image.crossOrigin = opts.crossOrigin || "anonymous";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";

    let raf = 0;
    let frame = 0;
    let state = initialState;
    let ready = false;
    let failed = false;
    let last = 0;

    function rowFor(nextState) {
      const key = STATES.includes(nextState) ? nextState : "idle";
      const row = rows[key];
      return Number.isFinite(Number(row)) ? Number(row) : Number(rows.idle || 0);
    }

    function showFallback() {
      canvas.style.display = "none";
      fallback.style.display = "";
    }

    function showCanvas() {
      fallback.style.display = "none";
      canvas.style.display = "block";
    }

    function draw() {
      if (!ready || failed || !ctx || !frameW || !frameH) return;
      const row = rowFor(state);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, frameW, frameH);
      ctx.drawImage(
        image,
        frame * frameW,
        row * frameH,
        frameW,
        frameH,
        0,
        0,
        frameW,
        frameH
      );
    }

    function tick(ts) {
      if (!ready || failed) return;
      const delay = 1000 / fps;
      if (!last || (ts - last) >= delay) {
        frame = (frame + 1) % cols;
        draw();
        last = ts;
      }
      raf = global.requestAnimationFrame(tick);
    }

    function start() {
      if (raf || failed || !ready) return;
      draw();
      raf = global.requestAnimationFrame(tick);
    }

    function stop() {
      if (!raf) return;
      global.cancelAnimationFrame(raf);
      raf = 0;
    }

    function play(nextState) {
      state = STATES.includes(nextState) ? nextState : "idle";
      frame = 0;
      last = 0;
      draw();
      start();
      return api;
    }

    function destroy() {
      stop();
      image.onload = null;
      image.onerror = null;
      try { wrap.remove(); } catch (_) {}
    }

    const api = {
      el: wrap,
      canvas,
      fallback,
      play,
      destroy,
      get state() { return state; },
      get ready() { return ready; },
      get failed() { return failed; }
    };

    wrap.__petSprite = api;

    if (!ctx) {
      failed = true;
      showFallback();
      return api;
    }

    if (!url || !hasSprite(pet)) {
      failed = true;
      showFallback();
      return api;
    }

    image.onload = () => {
      ready = true;
      failed = false;
      showCanvas();
      play(state);
    };
    image.onerror = () => {
      failed = true;
      ready = false;
      stop();
      showFallback();
    };
    image.src = url;

    return api;
  }

  function mount(container, pet, opts = {}) {
    if (!container) return null;
    const api = create(pet, opts);
    try {
      if (opts.clear !== false) container.textContent = "";
      container.appendChild(api.el);
    } catch (_) {
      return null;
    }
    return api;
  }

  function replace(target, pet, opts = {}) {
    if (!target || !hasSprite(pet)) return null;
    const api = create(pet, opts);
    try {
      target.replaceWith(api.el);
    } catch (_) {
      return null;
    }
    return api;
  }

  global.PetSprite = {
    STATES: STATES.slice(),
    hasSprite,
    create,
    mount,
    replace
  };
})(window);
