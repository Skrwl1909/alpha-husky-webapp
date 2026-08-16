// Alpha Husky - small shared action-sector lifecycle kernel.
(function (global) {
  "use strict";
  const ROOT_ID = "alphaExplorationRoom";
  function create(definition) {
    // RF01 remains a compatibility API while its proven combat implementation
    // is incrementally consumed through the same runtime boundary.
    if (definition?.legacyApi) return definition.legacyApi;
    const S = { deps: {}, combatProfile: null, resolveCombatProfile: null, threatTier: "standard", root: null, canvas: null, game: null, scene: null, opening: null, closing: false, generation: 0, onClose: null };
    const id = String(definition?.sectorId || "");
    const ensureRoot = () => {
      let root = document.getElementById(ROOT_ID); if (root) root.remove();
      global.AlphaActionSectorHud?.inject?.();
      root = document.createElement("section"); root.id = ROOT_ID; root.className = "ah-exploration-room";
      root.style.cssText = "position:fixed;inset:0;z-index:12060;display:grid;grid-template-rows:auto minmax(0,1fr);height:100dvh;overflow:hidden;background:#071019;color:#e8f3ff";
      const title = String(definition?.displayName || definition?.sectorId || "RELAY FRINGE");
      const kicker = String(definition?.kicker || "RELAY FRINGE 02");
      root.innerHTML = `<header class="ah-exploration-room__header"><button type="button" class="ah-exploration-room__back" data-action-sector="back">Back</button><div class="ah-exploration-room__heading"><span data-action-sector-kicker>${kicker}</span><strong data-action-sector-title>${title}</strong></div><span class="ah-exploration-room__seal" data-action-sector-seal>LOCAL</span></header><div class="ah-exploration-room__stage"><div id="alphaActionSectorCanvas" class="ah-exploration-room__canvas"></div>${global.AlphaActionSectorHud?.markup?.({ code: definition?.hudCode || "RF-02", seal: "STANDARD", objective: "ENTER THE DEEP CARRIER", detail: "Follow the carrier signal" }) || ""}</div>`;
      document.body.appendChild(root);
      root.addEventListener("click", event => {
        const action = event.target.closest?.("[data-action-sector]")?.getAttribute("data-action-sector");
        if (action === "back" || action === "map") void close();
      });
      S.root = root;
      S.canvas = root.querySelector("#alphaActionSectorCanvas") || root.lastElementChild;
      S.hud = global.AlphaActionSectorHud?.bind?.(root) || null;
      return root;
    };
    const cleanup = async (options) => {
      const scene = S.scene; try { definition.cleanupSector?.(scene); } catch (_) {}
      if (S.game) try { S.game.destroy(true); } catch (_) {}
      S.game = S.scene = null; S.root?.remove(); S.root = S.canvas = null;
      const onClose = S.onClose; S.onClose = null; await Promise.resolve(onClose?.(options));
    };
    const init = deps => { S.deps = { ...S.deps, ...(deps || {}) }; return API; };
    const open = options => {
      if (String(options?.sectorId || "") !== id) return Promise.resolve(false);
      if (S.opening) return S.opening; if (S.root && !S.closing) return Promise.resolve(true);
      const combatProfile = global.AlphaSectorCombatConfig?.normalizeCombatProfile?.(options?.combatProfile), threat = global.AlphaSectorCombatConfig?.normalizeThreatTier?.(options?.threatTier);
      if (!combatProfile || !threat) return Promise.reject(new Error("Unable to load combat profile."));
      S.closing = false; S.combatProfile = combatProfile; S.threatTier = threat.id; S.resolveCombatProfile = typeof options?.resolveCombatProfile === "function" ? options.resolveCombatProfile : null; S.onClose = typeof options?.onClose === "function" ? options.onClose : null;
      const generation = ++S.generation;
      S.opening = new Promise((resolve, reject) => {
        try {
          ensureRoot(); if (!global.Phaser?.Game) throw new Error("Phaser unavailable");
          const width = Math.max(2, S.canvas?.clientWidth || innerWidth || 2), height = Math.max(2, S.canvas?.clientHeight || innerHeight || 2);
          const config = { type: global.Phaser.AUTO, parent: S.canvas, width, height, backgroundColor: "#071019", audio: { noAudio: true }, input: { activePointers: 4, touch: { capture: true } }, physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: !!global.DBG } }, scale: { mode: global.Phaser.Scale.RESIZE }, scene: {
            preload() { definition.preloadScene?.(this); },
            create() { S.scene = this; try { this.ahHudDom = S.hud; definition.createScene(this, { deps: S.deps, combatProfile: S.combatProfile, threatTier: S.threatTier, resolveCombatProfile: S.resolveCombatProfile, close, definition, hud: S.hud }); this.events.once("shutdown", () => definition.cleanupSector?.(this)); resolve(true); } catch (error) { error.relayStage = error.relayStage || "RF02_CREATE_SCENE"; reject(error); } },
            update(time, delta) { if (!S.closing && generation === S.generation) definition.updateScene?.(this, time, delta); },
          } };
          S.game = new global.Phaser.Game(config);
        } catch (error) { reject(error); }
      }).catch(async error => { await cleanup(); throw error; }).finally(() => { S.opening = null; });
      return S.opening;
    };
    async function close(options) { if (S.closing || (!S.root && !S.game)) return false; S.closing = true; ++S.generation; try { await cleanup(options); return true; } finally { S.closing = false; } }
    const isOpen = () => !!(S.root && document.documentElement.contains(S.root) && !S.closing);
    const API = { init, open, close, isOpen, sectorConfig: { sectorId: id }, definition };
    return API;
  }
  global.AlphaActionSectorRuntime = { create };
})(window);
