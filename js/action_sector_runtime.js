// Alpha Husky - small shared action-sector lifecycle kernel.
(function (global) {
  "use strict";
  const ROOT_ID = "alphaExplorationRoom";
  function create(definition) {
    // RF01 remains a compatibility API while its proven combat implementation
    // is incrementally consumed through the same runtime boundary.
    if (definition?.legacyApi) return definition.legacyApi;
    const S = { deps: {}, combatProfile: null, resolveCombatProfile: null, root: null, canvas: null, game: null, scene: null, opening: null, closing: false, generation: 0, onClose: null };
    const id = String(definition?.sectorId || "");
    const ensureRoot = () => {
      let root = document.getElementById(ROOT_ID); if (root) root.remove();
      root = document.createElement("section"); root.id = ROOT_ID;
      root.style.cssText = "position:fixed;inset:0;z-index:12060;background:#071019;color:#dff8ff;display:grid;overflow:hidden";
      root.innerHTML = `<div id="alphaActionSectorCanvas" style="min-width:1px;min-height:1px"></div>`;
      document.body.appendChild(root); S.root = root; S.canvas = root.firstElementChild; return root;
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
      const combatProfile = global.AlphaSectorCombatConfig?.normalizeCombatProfile?.(options?.combatProfile);
      if (!combatProfile) return Promise.reject(new Error("Unable to load combat profile."));
      S.closing = false; S.combatProfile = combatProfile; S.resolveCombatProfile = typeof options?.resolveCombatProfile === "function" ? options.resolveCombatProfile : null; S.onClose = typeof options?.onClose === "function" ? options.onClose : null;
      const generation = ++S.generation;
      S.opening = new Promise((resolve, reject) => {
        try {
          ensureRoot(); if (!global.Phaser?.Game) throw new Error("Phaser unavailable");
          const config = { type: global.Phaser.AUTO, parent: S.canvas, width: S.canvas.clientWidth || innerWidth, height: S.canvas.clientHeight || innerHeight, backgroundColor: "#071019", audio: { noAudio: true }, input: { activePointers: 4, touch: { capture: true } }, physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: !!global.DBG } }, scale: { mode: global.Phaser.Scale.RESIZE }, scene: {
            create() { S.scene = this; try { definition.createScene(this, { deps: S.deps, combatProfile: S.combatProfile, resolveCombatProfile: S.resolveCombatProfile, close, definition }); this.events.once("shutdown", () => definition.cleanupSector?.(this)); resolve(true); } catch (error) { reject(error); } },
            update(time, delta) { if (!S.closing && generation === S.generation) definition.updateScene?.(this, time, delta); },
          } };
          S.game = new global.Phaser.Game(config);
        } catch (error) { reject(error); }
      }).catch(async error => { await cleanup(); throw error; }).finally(() => { S.opening = null; });
      return S.opening;
    };
    async function close(options) { if (S.closing || (!S.root && !S.game)) return false; S.closing = true; ++S.generation; try { await cleanup(options); return true; } finally { S.closing = false; } }
    const isOpen = () => !!(S.root && document.documentElement.contains(S.root) && !S.closing);
    const API = { init, open, close, isOpen, sectorConfig: { sectorId: id } };
    return API;
  }
  global.AlphaActionSectorRuntime = { create };
})(window);
