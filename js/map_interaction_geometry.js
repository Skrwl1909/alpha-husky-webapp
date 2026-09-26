(function (global) {
  "use strict";

  const MASTER_ASSET = "images/map/v2/world_map_master_v1.webp";

  const REGIONS = Object.freeze({
    citadel: Object.freeze({
      polygon: "0,0 544,0 579,104 602,182 567,260 521,339 463,404 382,449 278,443 174,404 81,352 0,326",
      label: Object.freeze({ x: 24, y: 18 }),
      camera: Object.freeze({ x: 0.285, y: 0.245, scale: 2.0 }),
      poi: Object.freeze({
        alpha_network_hq: Object.freeze({ x: 0.245, y: 0.145 }),
        alpha_den: Object.freeze({ x: 0.355, y: 0.235 }),
        testnet_wastes_dojo: Object.freeze({ x: 0.445, y: 0.185 }),
        abandoned_wallets: Object.freeze({ x: 0.105, y: 0.275 }),
        howl_treasury: Object.freeze({ x: 0.285, y: 0.335 }),
        chain_gate: Object.freeze({ x: 0.455, y: 0.355 }),
        vault_forge: Object.freeze({ x: 0.155, y: 0.405 })
      })
    }),
    blackglass_reach: Object.freeze({
      polygon: "544,0 1000,0 1000,495 915,508 822,482 741,449 660,423 579,391 521,339 567,260 602,182 579,104",
      label: Object.freeze({ x: 73, y: 22 }),
      camera: Object.freeze({ x: 0.79, y: 0.265, scale: 2.05 }),
      poi: Object.freeze({
        broken_contracts: Object.freeze({ x: 0.675, y: 0.285 }),
        burned_archive: Object.freeze({ x: 0.825, y: 0.405 }),
        dead_relay_exchange: Object.freeze({ x: 0.605, y: 0.455 })
      }),
      surfaces: Object.freeze({
        world_exploration: Object.freeze({ x: 0.755, y: 0.515 })
      })
    }),
    iron_march: Object.freeze({
      polygon: "0,326 81,352 174,404 278,443 382,449 463,404 521,339 579,391 561,469 590,560 567,638 521,723 463,801 382,859 255,879 116,833 0,781",
      label: Object.freeze({ x: 20, y: 58 }),
      camera: Object.freeze({ x: 0.31, y: 0.61, scale: 1.88 }),
      poi: Object.freeze({
        phantom_nodes: Object.freeze({ x: 0.175, y: 0.555 }),
        edge_of_chain: Object.freeze({ x: 0.455, y: 0.585 }),
        blood_moon_tower: Object.freeze({ x: 0.315, y: 0.635 }),
        moon_lab: Object.freeze({ x: 0.145, y: 0.735 }),
        oracle_void_doorway: Object.freeze({ x: 0.435, y: 0.755 })
      })
    }),
    locked_horizons: Object.freeze({
      polygon: "1000,495 1000,1000 463,1000 463,964 486,911 463,801 521,723 567,638 590,560 561,469 579,391 660,423 741,449 822,482 915,508",
      label: Object.freeze({ x: 69, y: 73 }),
      camera: Object.freeze({ x: 0.79, y: 0.72, scale: 2.05 }),
      poi: Object.freeze({})
    })
  });

  function getRegion(sectionId) {
    return REGIONS[String(sectionId || "").trim()] || null;
  }

  function getPoi(sectionId, nodeId) {
    return getRegion(sectionId)?.poi?.[String(nodeId || "").trim()] || null;
  }

  function getSurface(sectionId, surfaceId) {
    return getRegion(sectionId)?.surfaces?.[String(surfaceId || "").trim()] || null;
  }

  global.MapInteractionGeometry = Object.freeze({
    MASTER_ASSET,
    REGIONS,
    getRegion,
    getPoi,
    getSurface
  });
})(window);
