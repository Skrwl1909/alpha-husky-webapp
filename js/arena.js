// js/arena.js — loader/wrapper for ArenaPixi overlay (no reload, hub stays alive)
(function () {
  function loadScriptOnce(url, testFn) {
    return new Promise((resolve, reject) => {
      try { if (testFn && testFn()) return resolve(true); } catch(_) {}

      const bare = url.split("?")[0];
      const already = Array.from(document.scripts || []).some(s => String(s.src || "").includes(bare));
      if (already) return resolve(true);

      const s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Failed to load: " + url));
      document.head.appendChild(s);
    });
  }

  async function ensureArenaPixi() {
    const v = (window.WEBAPP_VER || Date.now());

    // Pixi is optional (ArenaPixi has DOM fallback), but gives the “wow”
    if (!window.PIXI) {
      try {
        await loadScriptOnce(
          "https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.js",
          () => !!window.PIXI
        );
      } catch (_) {
        // ok — overlay will render DOM fallback
      }
    }

    if (!window.ArenaPixi?.open) {
      await loadScriptOnce(
        `/js/arena_pixi.js?v=${encodeURIComponent(v)}`,
        () => !!window.ArenaPixi?.open
      );
    }

    return true;
  }

  window.Arena = {
    _apiPost: null,
    _tg: null,
    _dbg: false,

    init({ apiPost, tg, dbg }) {
      this._apiPost = apiPost || null;
      this._tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
      this._dbg = !!dbg;
    },

    async open(battleId) {
      if (!this._apiPost) throw new Error("Arena.init({apiPost,...}) missing");

      await ensureArenaPixi();

      // hand off to overlay module
      window.ArenaPixi?.init?.({ apiPost: this._apiPost, tg: this._tg, dbg: this._dbg });
      return window.ArenaPixi?.open?.(battleId);
    },

    close() {
      try { window.ArenaPixi?.close?.(); } catch (_) {}
    }
  };
})();
