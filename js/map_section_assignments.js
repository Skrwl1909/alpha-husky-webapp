(function (global) {
  "use strict";

  const SECTION_DEFINITIONS = Object.freeze([
    Object.freeze({
      sectionId: "citadel",
      order: 1,
      nodes: Object.freeze([
        Object.freeze({ nodeId: "alpha_network_hq", sectionId: "citadel", order: 1 }),
        Object.freeze({ nodeId: "alpha_den", sectionId: "citadel", order: 2 }),
        Object.freeze({ nodeId: "vault_forge", sectionId: "citadel", order: 3 }),
        Object.freeze({ nodeId: "howl_treasury", sectionId: "citadel", order: 4 }),
        Object.freeze({ nodeId: "chain_gate", sectionId: "citadel", order: 5 }),
        Object.freeze({ nodeId: "abandoned_wallets", sectionId: "citadel", order: 6 }),
        Object.freeze({ nodeId: "testnet_wastes_dojo", sectionId: "citadel", order: 7 }),
      ]),
      campaignSurfaces: Object.freeze([]),
    }),
    Object.freeze({
      sectionId: "blackglass_reach",
      order: 2,
      nodes: Object.freeze([
        Object.freeze({ nodeId: "broken_contracts", sectionId: "blackglass_reach", order: 1 }),
        Object.freeze({ nodeId: "burned_archive", sectionId: "blackglass_reach", order: 2 }),
        Object.freeze({ nodeId: "dead_relay_exchange", sectionId: "blackglass_reach", order: 3 }),
      ]),
      campaignSurfaces: Object.freeze([
        Object.freeze({ surfaceId: "world_exploration", role: "campaign_surface" }),
      ]),
    }),
    Object.freeze({
      sectionId: "iron_march",
      order: 3,
      nodes: Object.freeze([
        Object.freeze({ nodeId: "edge_of_chain", sectionId: "iron_march", order: 1 }),
        Object.freeze({ nodeId: "phantom_nodes", sectionId: "iron_march", order: 2 }),
        Object.freeze({ nodeId: "blood_moon_tower", sectionId: "iron_march", order: 3 }),
        Object.freeze({ nodeId: "moon_lab", sectionId: "iron_march", order: 4 }),
        Object.freeze({ nodeId: "oracle_void_doorway", sectionId: "iron_march", order: 5 }),
      ]),
      campaignSurfaces: Object.freeze([]),
    }),
    Object.freeze({
      sectionId: "locked_horizons",
      order: 4,
      nodes: Object.freeze([]),
      campaignSurfaces: Object.freeze([]),
    }),
  ]);

  const ASSIGNMENTS_BY_NODE = new Map();
  const SECTIONS_BY_ID = new Map();
  for (const section of SECTION_DEFINITIONS) {
    SECTIONS_BY_ID.set(section.sectionId, section);
    for (const assignment of section.nodes) ASSIGNMENTS_BY_NODE.set(assignment.nodeId, assignment);
  }

  function getSections() {
    return SECTION_DEFINITIONS;
  }

  function getSectionForNode(nodeId) {
    return ASSIGNMENTS_BY_NODE.get(String(nodeId || "").trim()) || null;
  }

  function getNodesForSection(sectionId) {
    return SECTIONS_BY_ID.get(String(sectionId || "").trim())?.nodes || Object.freeze([]);
  }

  global.MapSectionAssignments = Object.freeze({
    getSections,
    getSectionForNode,
    getNodesForSection,
  });
})(window);
