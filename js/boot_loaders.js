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
          (readyName === "alpha_den.js" && !!global.AlphaDen?.open) ||
          (readyName === "pet_sprite.js" && !!global.PetSprite) ||
          (readyName === "elite_combat_stage.js" && !!global.EliteCombatStage) ||
          (readyName === "tactical_ops.js" && !!global.TacticalOps?.open) ||
          (readyName === "tactical_cells.js" && !!global.TacticalCells?.open) ||
          (readyName === "adopt.js" && !!global.Adopt) ||
          (readyName === "updates.js" && !!global.Updates) ||
          (readyName === "missions.js" && !!global.Missions) ||
          (readyName === "mypets.js" && !!global.MyPets) ||
          (readyName === "fortress.js" && !!global.Fortress) ||
          (readyName === "dojo.js" && !!global.Dojo) ||
          (readyName === "phaser.min.js" && !!global.Phaser) ||
          (readyName === "dojo_room.js" && !!global.AlphaDojoRoom) ||
          (readyName === "exploration_room.js" && !!global.AlphaExplorationRoom?.open) ||
          (readyName === "referrals.js" && !!global.Referrals) ||
          (readyName === "siege_pixi.js" && !!global.SiegePixi) ||
          (readyName === "siege.js" && !!global.Siege) ||
          (readyName === "oracle.js" && !!global.Oracle) ||
          (readyName === "bloodmoon.js" && !!global.BloodMoon) ||
          (readyName === "arena.js" && !!global.Arena) ||
          (readyName === "slots.js" && !!global.Slots);

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

  function relayLoaderError(stage, error) {
    const failure = error instanceof Error ? error : new Error(String(error || stage));
    failure.relayStage = stage;
    return failure;
  }

  function relayTrace(trace, stage) {
    try { (typeof trace === "function" ? trace : global.__AH_RELAY_STARTUP_TRACE)?.(stage); } catch (_) {}
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

  async function ensurePetSpriteLoaded() {
    if (global.PetSprite?.create) return true;
    const loadScript = getLoadScript();
    return await once("pet_sprite", async () => {
      await loadScript("js/pet_sprite.js");
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

  async function ensurePhaserLoaded() {
    if (global.Phaser) return true;
    const loadScript = getLoadScript();
    return await once("phaser_4_2_1", async () => {
      await loadScript("vendor/phaser/4.2.1/phaser.min.js");
      if (!global.Phaser) {
        throw new Error("Phaser 4.2.1 loaded but window.Phaser is missing");
      }
      return true;
    });
  }

  async function ensureEliteCombatStageLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.EliteCombatStage?.mount) {
      try { global.EliteCombatStage.init?.(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("elite_combat_stage", async () => {
      await ensurePixiCoreLoaded();
      try { await ensurePetSpriteLoaded(); } catch (_) {}
      await loadScript("js/elite_combat_stage.js");
      if (!global.EliteCombatStage?.mount) {
        throw new Error("elite_combat_stage.js loaded but window.EliteCombatStage is missing");
      }
      global.EliteCombatStage.init?.(deps);
      return true;
    });
  }

  async function ensureTacticalCellsLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.TacticalCells?.open) {
      try { global.TacticalCells.init?.(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("tactical_cells", async () => {
      await loadScript("js/tactical_cells.js");
      if (!global.TacticalCells?.open) {
        throw new Error("tactical_cells.js loaded but window.TacticalCells.open is missing");
      }
      global.TacticalCells.init?.(deps);
      return true;
    });
  }

  async function ensureTacticalOpsLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.TacticalOps?.open) {
      try { global.TacticalOps.init?.(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("tactical_ops", async () => {
      // Dedicated cache key so Telegram cannot keep the v2.2.1 IIFE
      // even when window.WEBAPP_VER is stale.
      const prev = global.WEBAPP_VER;
      global.WEBAPP_VER = "tops-2.2.6-foundation-persistence";
      try {
        await loadScript("js/tactical_ops.js");
      } finally {
        global.WEBAPP_VER = prev;
      }
      if (!global.TacticalOps?.open) {
        throw new Error("tactical_ops.js loaded but window.TacticalOps.open is missing");
      }
      global.TacticalOps.init?.(deps);
      return true;
    });
  }

  async function ensureAlphaDenLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.AlphaDen?.open) {
      if (deps.dbg) {
        try { console.debug("[AlphaDen] boot loader ready", { source: "existing" }); } catch (_) {}
      }
      return true;
    }
    const loadScript = getLoadScript();
    return await once("alpha_den", async () => {
      await loadScript("js/alpha_den.js");
      if (!global.AlphaDen?.open) {
        throw new Error("alpha_den.js loaded but window.AlphaDen.open is missing");
      }
      if (deps.dbg) {
        try { console.debug("[AlphaDen] boot loader ready", { source: "lazy" }); } catch (_) {}
      }
      return true;
    });
  }

  async function ensureAdoptLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    try { await ensurePetSpriteLoaded(); } catch (_) {}
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
    try { await ensurePetSpriteLoaded(); } catch (_) {}
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
    const loadScript = getLoadScript();
    return await once("dojo", async () => {
      await ensureCombatLoaded();

      if (!global.Dojo?.open || !global.Dojo?.init) {
        await loadScript("js/dojo.js");
      }

      try { global.Dojo?.init?.(deps); } catch (_) {}

      if (global.AH_FLAGS?.dojoPhaserRoom !== false) {
        try {
          await ensurePhaserLoaded();
          if (!global.AlphaSectorCombatConfig) await loadScript("js/sector_combat_config.js");
          if (!global.AlphaDojoRoom?.open) {
            await loadScript("js/dojo_room.js");
          }
          if (!global.AlphaDojoRoom?.open || !global.AlphaDojoRoom?.init) {
            throw new Error("dojo_room.js loaded but window.AlphaDojoRoom is missing");
          }
          global.AlphaDojoRoom.init({
            ...deps,
            openLegacy: global.Dojo?.openLegacy
          });
        } catch (err) {
          if (deps.dbg) {
            try { console.warn("[DojoRoom] lazy load failed; legacy Dojo remains available", err); } catch (_) {}
          }
        }
      }

      return true;
    });
  }

  async function ensureExplorationRoomLoaded(apiPost, tg, dbg, trace) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg), devPreview: global.__AH_RELAY_STARTUP_DEV_PREVIEW === true };
    relayTrace(trace, "PHASER_LOAD_START");
    try { await ensurePhaserLoaded(); }
    catch (error) { throw relayLoaderError("PHASER LOAD FAILED", error); }
    relayTrace(trace, "PHASER_READY");
    if (!global.AlphaSectorCombatConfig) {
      try { await getLoadScript()("js/sector_combat_config.js"); }
      catch (error) { throw relayLoaderError("SECTOR COMBAT CONFIG LOAD FAILED", error); }
    }
    await ensureActionSectorRuntimeLoaded();
    if (global.AlphaExplorationRoom?.open && global.AlphaExplorationRoom?.init) {
      if (!global.AlphaRf01ProductionHud) {
        try { await getLoadScript()("js/rf01_production_hud.js"); } catch (_) {}
      }
      relayTrace(trace, "ROOM_SCRIPT_LOAD_START");
      relayTrace(trace, "ROOM_SCRIPT_READY");
      relayTrace(trace, "ROOM_API_READY");
      try { global.AlphaExplorationRoom.init({ ...deps, trace }); }
      catch (error) { throw relayLoaderError("ROOM INIT FAILED", error); }
      relayTrace(trace, "ROOM_INIT_DONE");
      return true;
    }
    const loadScript = getLoadScript();
    return await once("exploration_room", async () => {
      relayTrace(trace, "ROOM_SCRIPT_LOAD_START");
      try {
        if (!global.AlphaRf01ProductionHud) {
          try { await loadScript("js/rf01_production_hud.js"); }
          catch (hudError) { try { console.warn("[RF01] production HUD failed to load", hudError); } catch (_) {} }
        }
        await loadScript("js/exploration_room.js");
      }
      catch (error) { throw relayLoaderError("EXPLORATION SCRIPT LOAD FAILED", error); }
      relayTrace(trace, "ROOM_SCRIPT_READY");
      if (!global.AlphaExplorationRoom?.open || !global.AlphaExplorationRoom?.init) {
        throw relayLoaderError("ROOM API MISSING", new Error("exploration_room.js loaded but window.AlphaExplorationRoom is missing"));
      }
      relayTrace(trace, "ROOM_API_READY");
      try { global.AlphaExplorationRoom.init({ ...deps, trace }); }
      catch (error) { throw relayLoaderError("ROOM INIT FAILED", error); }
      relayTrace(trace, "ROOM_INIT_DONE");
      return true;
    });
  }

  async function ensureActionSectorRuntimeLoaded() {
    if (global.AlphaActionSectorRuntime?.create) return true;
    return await once("action_sector_runtime", async () => { await getLoadScript()("js/action_sector_runtime.js"); return true; });
  }

  async function ensureRelayFringe02RoomLoaded(apiPost, tg, dbg, trace) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg), trace };
    await ensurePhaserLoaded(); await ensureActionSectorRuntimeLoaded();
    if (!global.AlphaSectorCombatConfig) await getLoadScript()("js/sector_combat_config.js");
    if (!global.AlphaActionSectorHud) await getLoadScript()("js/action_sector_hud.js");
    if (!global.AlphaRelayFringe02Room?.open) await once("relay_fringe_02_room", async () => { await getLoadScript()("js/relay_fringe_02_room.js"); return true; });
    if (!global.AlphaRelayFringe02Room?.open) throw new Error("Relay Fringe 02 room API missing");
    global.AlphaRelayFringe02Room.init(deps); return true;
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
    try { await ensurePetSpriteLoaded(); } catch (_) {}
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

  async function ensureSlotsLoaded(apiPost, tg, dbg) {
    const deps = { apiPost: pickApiPost(apiPost), tg: pickTg(tg), dbg: pickDbg(dbg) };
    if (global.Slots?.open && global.Slots?.init) {
      try { global.Slots.init(deps); } catch (_) {}
      return true;
    }
    const loadScript = getLoadScript();
    return await once("slots", async () => {
      await loadScript("js/slots.js");
      try { global.Slots?.init?.(deps); } catch (_) {}
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
    global.ensureAlphaDenLoaded = ensureAlphaDenLoaded;
    global.ensurePetSpriteLoaded = ensurePetSpriteLoaded;
    global.ensureEliteCombatStageLoaded = ensureEliteCombatStageLoaded;
    global.ensureTacticalOpsLoaded = ensureTacticalOpsLoaded;
    global.ensureTacticalCellsLoaded = ensureTacticalCellsLoaded;
    global.ensureAdoptLoaded = ensureAdoptLoaded;
    global.ensureUpdatesLoaded = ensureUpdatesLoaded;
    global.ensureMissionsLoaded = ensureMissionsLoaded;
    global.ensureMyPetsLoaded = ensureMyPetsLoaded;
    global.ensureFortressLoaded = ensureFortressLoaded;
    global.ensurePhaserLoaded = ensurePhaserLoaded;
    global.ensureDojoLoaded = ensureDojoLoaded;
    global.ensureExplorationRoomLoaded = ensureExplorationRoomLoaded;
    global.ensureActionSectorRuntimeLoaded = ensureActionSectorRuntimeLoaded;
    global.ensureRelayFringe02RoomLoaded = ensureRelayFringe02RoomLoaded;
    global.ensureReferralsLoaded = ensureReferralsLoaded;
    global.ensureSiegeLoaded = ensureSiegeLoaded;
    global.ensureOracleLoaded = ensureOracleLoaded;
    global.ensureBloodMoonLoaded = ensureBloodMoonLoaded;
    global.ensureArenaLoaded = ensureArenaLoaded;
    global.ensureSlotsLoaded = ensureSlotsLoaded;

    return API;
  }

  const API = {
    init,
    ensureSkinsLoaded,
    ensureFramesLoaded,
    ensureAlphaDenLoaded,
    ensurePetSpriteLoaded,
    ensureEliteCombatStageLoaded,
    ensureTacticalOpsLoaded,
    ensureTacticalCellsLoaded,
    ensureAdoptLoaded,
    ensureUpdatesLoaded,
    ensureMissionsLoaded,
    ensureMyPetsLoaded,
    ensureFortressLoaded,
    ensurePhaserLoaded,
    ensureDojoLoaded,
    ensureExplorationRoomLoaded,
    ensureActionSectorRuntimeLoaded,
    ensureRelayFringe02RoomLoaded,
    ensureReferralsLoaded,
    ensureSiegeLoaded,
    ensureOracleLoaded,
    ensureBloodMoonLoaded,
    ensureArenaLoaded,
    ensureSlotsLoaded
  };

  global.ensureAlphaDenLoaded = ensureAlphaDenLoaded;
    global.ensureEliteCombatStageLoaded = ensureEliteCombatStageLoaded;
    global.ensureTacticalOpsLoaded = ensureTacticalOpsLoaded;
    global.ensureTacticalCellsLoaded = ensureTacticalCellsLoaded;
    global.ensureExplorationRoomLoaded = ensureExplorationRoomLoaded;
    global.ensureActionSectorRuntimeLoaded = ensureActionSectorRuntimeLoaded;
    global.ensureRelayFringe02RoomLoaded = ensureRelayFringe02RoomLoaded;
  global.AHBootLoaders = API;
})(window);
