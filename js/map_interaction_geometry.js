(function (global) {
  "use strict";

  const MASTER_ASSET = "images/map/v2/world_map_master_v1.webp";
  const FALLBACK_ASSET = "images/map/v2/map-v2-world.webp";

  const REGIONS = Object.freeze({
    citadel: Object.freeze({
      polygon: "0,0 540,0 590,160 610,280 570,450 400,480 260,460 120,420 0,360",
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
      polygon: "540,0 1000,0 1000,530 900,550 820,520 700,470 570,450 610,280 590,160",
      label: Object.freeze({ x: 73, y: 22 }),
      camera: Object.freeze({ x: 0.79, y: 0.265, scale: 2.05 }),
      poi: Object.freeze({
        broken_contracts: Object.freeze({ x: 0.675, y: 0.285 }),
        burned_archive: Object.freeze({ x: 0.825, y: 0.405 }),
        dead_relay_exchange: Object.freeze({ x: 0.625, y: 0.415 })
      }),
      surfaces: Object.freeze({
        world_exploration: Object.freeze({ x: 0.74, y: 0.44 })
      })
    }),
    iron_march: Object.freeze({
      polygon: "0,360 120,420 260,460 400,480 570,450 590,580 575,700 550,820 500,1000 0,1000",
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
      polygon: "570,450 700,470 820,520 900,550 1000,530 1000,1000 500,1000 550,820 575,700 590,580",
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
    FALLBACK_ASSET,
    REGIONS,
    getRegion,
    getPoi,
    getSurface
  });
})(window);
