(function (global) {
  const STATE = {
    deps: {
      apiPost: null,
      tg: null,
      dbg: false,
      loadScript: null
    },
    pending: Object.create(null)
  };

  function normalizeSrc(src) {
    return String(src || "")
      .replace(/^\//, "")
      .split("?")[0]
      .trim();
  }

  function fallbackLoadScript(src) {
    return new Promise((resolve, reject) => {
      const clean = normalizeSrc(src);
      if (!clean) return reject(new Error("Invalid script src"));

      const hasScript = Array.from(document.scripts || []).find((script) => {
        const scriptSrc = String(script.src || "");
        return scriptSrc.includes("/" + clean) || scriptSrc.includes(clean);
      });

      if (hasScript) {
        const readyName = clean.split("/").pop() || "";
        const isReady =
          (readyName === "pixi.min.js" && !!global.PIXI) ||
          (readyName === "combat.js" && !!global.Combat) ||
          (readyName === "skins.js" && !!global.Skins) ||
          (readyName === "frames.js" && !!global.Frames) ||
          (readyName === "adopt.js" && !!global.Adopt) ||
          (readyName === "updates.js" && !!global.Updates) ||
          (readyName === "missions.js" && !!global.Missions) ||
          (readyName === "mypets.js" && !!global.MyPets) ||
          (readyName === "fortress.js" && !!global.Fortress) ||
          (readyName === "dojo.js" && !!global.Dojo) ||
          (readyName === "referrals.js" && !!global.Referrals) ||
          (readyName === "siege_pixi.js" && !!global.SiegePixi) ||
          (readyName === "siege.js" && !!global.Siege) ||
          (readyName === "oracle.js" && !!global.Oracle) ||
          (readyName === "bloodmoon.js" && !!global.BloodMoon) ||
          (readyName === "arena.js" && !!global.Arena);

        if (isReady) return resolve(true);

        hasScript.addEventListener("load", () => resolve(true), { once: true });
        hasScript.addEventListener("error", () => reject(new Error("Failed to load: " + clean)), { once: true });
        return;
      }

      const v = encodeURIComponent(String(global.WEBAPP_VER || Date.now()));
      const full = clean + (clean.includes("?") ? "&" : "?") + "v=" + v;
      const script = document.createElement("script");
      script.src = full;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load: " + clean));
      document.head.appendChild(script);
    });
  }

  function getLoadScript() {
    if (typeof STATE.deps.loadScript === "function") return STATE.deps.loadScript;
    return fallbackLoadScript;
  }

  function pickApiPost(apiPost) {
    if (typeof apiPost === "function") return apiPost;
    if (typeof STATE.deps.apiPost === "function") return STATE.deps.apiPost;
    if (typeof global.apiPost === "function") return global.apiPost;
    if (typeof global.S?.apiPost === "function") return global.S.apiPost;
    return null;
  }

  function pickTg(tg) {
    if (tg) return tg;
    if (STATE.deps.tg) return STATE.deps.tg;
    return global.Telegram?.WebApp || global.tg || null;
  }

  function pickDbg(dbg) {
    if (typeof dbg === "boolean") return dbg;
    if (typeof STATE.deps.dbg === "boolean") return STATE.deps.dbg;
    return !!global.DBG;
  }

  async function once(key, fn) {
    if (STATE.pending[key]) return await STATE.pending[key];
    STATE.pending[key] = (async () => await fn())();
    try {
      return await STATE.pending[key];
    } finally {
      STATE.pending[key] = null;
    }
  }

  async function ensurePixiCoreLoaded() {
    if (global.PIXI) return true;
    const loadScript = getLoadScript();
    return await once("pixi", async () => {
      await loadScript("js/pixi.min.js");
      return true;
    });
  }

  async function ensureCombatLoaded() {
    if (global.Combat?.rollHit || global.Combat?.resolve) return true;
    const loadScript = getLoadScript();
    return await once("combat", async () => {
      await loadScript("js/combat.js");
      return true;
    });
  }

  async function ensureSkinsLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Skins?.open && global.Skins?.init) {
      try { global.Skins.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("skins", async () => {
      await loadScript("js/skins.js");
      try { global.Skins?.init?.(deps); } catch (_) {}
      return true;
    });
  }

  async function ensureFramesLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Frames?.open && global.Frames?.init) {
      try { global.Frames.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("frames", async () => {
      await loadScript("js/frames.js");
      try { global.Frames?.init?.(deps); } catch (_) {}
      return true;
    });
  }

  async function ensureAdoptLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Adopt?.open && global.Adopt?.init) {
      try { global.Adopt.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("adopt", async () => {
      await loadScript("js/adopt.js");
      try { global.Adopt?.init?.(deps); } catch (_) {}
      return true;
    });
  }

  async function ensureUpdatesLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    const initPayload = {
      ...deps,
      btnEl: document.getElementById("btnWhatsNew"),
      dotEl: document.getElementById("whatsNewDot")
    };

    if (global.Updates?.open && global.Updates?.init) {
      try { global.Updates.init(initPayload); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("updates", async () => {
      await loadScript("js/updates.js");
      try { global.Updates?.init?.(initPayload); } catch (_) {}
      return true;
    });
  }

  async function ensureMissionsLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };

    if (global.Missions?.open) {
      global.Missions?.init?.(deps);
      return true;
    }

    const loadScript = getLoadScript();
    await once("missions", async () => {
      await loadScript("js/missions.js");
      global.Missions?.init?.(deps);
      if (!global.Missions?.open) {
        throw new Error("missions.js loaded but window.Missions.open is missing");
      }
      return true;
    });

    return true;
  }

  async function ensureMyPetsLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.MyPets?.open && global.MyPets?.init) {
      try { global.MyPets.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("mypets", async () => {
      await loadScript("js/mypets.js");
      try { global.MyPets?.init?.(deps); } catch (_) {}
      return true;
    });
  }

  async function ensureFortressLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Fortress?.open && global.Fortress?.init) {
      try { global.Fortress.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("fortress", async () => {
      await ensurePixiCoreLoaded();
      await ensureCombatLoaded();
      await loadScript("js/fortress.js");
      try { global.Fortress?.init?.(deps); } catch (_) {}
      return true;
    });
  }

  async function ensureDojoLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Dojo?.open && global.Dojo?.init) {
      try { global.Dojo.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("dojo", async () => {
      await ensureCombatLoaded();
      await loadScript("js/dojo.js");
      try { global.Dojo?.init?.(deps); } catch (_) {}
      return true;
    });
  }

  async function ensureReferralsLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Referrals?.open && global.Referrals?.init) {
      try { global.Referrals.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("referrals", async () => {
      await loadScript("js/referrals.js");
      try { global.Referrals?.init?.(deps); } catch (_) {}
      return true;
    });
  }

  async function ensureSiegeLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Siege?.open && global.Siege?.init) {
      try { global.Siege.init(deps); } catch (_) {}
      global.__siegeInited = true;
      return true;
    }
    const loadScript = getLoadScript();
    return await once("siege", async () => {
      await ensurePixiCoreLoaded();
      await loadScript("js/siege_pixi.js");
      await loadScript("js/siege.js");
      try { global.Siege?.init?.(deps); } catch (_) {}
      global.__siegeInited = true;
      return true;
    });
  }

  async function ensureOracleLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Oracle?.open && global.Oracle?.init) {
      try { global.Oracle.init(deps); } catch (_) {}
      global.__oracleInited = true;
      return true;
    }
    const loadScript = getLoadScript();
    return await once("oracle", async () => {
      await loadScript("js/oracle.js");
      try { global.Oracle?.init?.(deps); } catch (_) {}
      global.__oracleInited = true;
      return true;
    });
  }

  async function ensureBloodMoonLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.BloodMoon?.open && global.BloodMoon?.init) {
      try { global.BloodMoon.init(deps); } catch (_) {}
      global.__bloodMoonInited = true;
      return true;
    }
    const loadScript = getLoadScript();
    return await once("bloodmoon", async () => {
      await loadScript("js/bloodmoon.js");
      try { global.BloodMoon?.init?.(deps); } catch (_) {}
      global.__bloodMoonInited = true;
      return true;
    });
  }

  async function ensureArenaLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Arena?.open) {
      global.Arena?.init?.(deps);
      return true;
    }
    const loadScript = getLoadScript();
    return await once("arena", async () => {
      await loadScript("js/arena.js");
      global.Arena?.init?.(deps);
      return true;
    });
  }

  function init(deps = {}) {
    STATE.deps = {
      apiPost: deps.apiPost || STATE.deps.apiPost || null,
      tg: deps.tg || STATE.deps.tg || null,
      dbg: typeof deps.dbg === "boolean" ? deps.dbg : STATE.deps.dbg,
      loadScript: typeof deps.loadScript === "function" ? deps.loadScript : STATE.deps.loadScript
    };

    global.ensureSkinsLoaded = ensureSkinsLoaded;
    global.ensureFramesLoaded = ensureFramesLoaded;
    global.ensureAdoptLoaded = ensureAdoptLoaded;
    global.ensureUpdatesLoaded = ensureUpdatesLoaded;
    global.ensureMissionsLoaded = ensureMissionsLoaded;
    global.ensureMyPetsLoaded = ensureMyPetsLoaded;
    global.ensureFortressLoaded = ensureFortressLoaded;
    global.ensureDojoLoaded = ensureDojoLoaded;
    global.ensureReferralsLoaded = ensureReferralsLoaded;
    global.ensureSiegeLoaded = ensureSiegeLoaded;
    global.ensureOracleLoaded = ensureOracleLoaded;
    global.ensureBloodMoonLoaded = ensureBloodMoonLoaded;
    global.ensureArenaLoaded = ensureArenaLoaded;

    return API;
  }

  const API = {
    init,
    ensureSkinsLoaded,
    ensureFramesLoaded,
    ensureAdoptLoaded,
    ensureUpdatesLoaded,
    ensureMissionsLoaded,
    ensureMyPetsLoaded,
    ensureFortressLoaded,
    ensureDojoLoaded,
    ensureReferralsLoaded,
    ensureSiegeLoaded,
    ensureOracleLoaded,
    ensureBloodMoonLoaded,
    ensureArenaLoaded
  };

  global.AHBootLoaders = API;
})(window);
