(function (global) {
  "use strict";

  let configuredAdapter = Object.create(null);

  function configure(adapter = {}) {
    if (!adapter || typeof adapter !== "object") return API;
    configuredAdapter = Object.assign({}, configuredAdapter, adapter);
    return API;
  }

  function resolveNode(nodeId, context) {
    const wantedId = String(nodeId || "").trim();
    const suppliedNode = context.node;
    if (suppliedNode && String(suppliedNode.id || "").trim() === wantedId) return suppliedNode;

    if (typeof context.getNode === "function") {
      const resolved = context.getNode(wantedId);
      if (resolved) return resolved;
    }

    const nodes = Array.isArray(global.DATA?.nodes) ? global.DATA.nodes : [];
    return nodes.find((node) => String(node?.id || "").trim() === wantedId) || null;
  }

  function warn(message, error) {
    try {
      if (error) console.warn(message, error);
      else console.warn(message);
    } catch (_) {}
  }

  function call(context, name, ...args) {
    const fn = context[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function openBuilding(context, node, buildingId) {
    return call(context, "openBuilding", buildingId, node.name, node.desc);
  }

  async function ensureRuntime(context, adapterName, globalName) {
    const adapterEnsure = context[adapterName];
    if (typeof adapterEnsure === "function") return await adapterEnsure();
    const globalEnsure = global[globalName];
    if (typeof globalEnsure === "function") return await globalEnsure();
    return false;
  }

  function requestFullscreen(context) {
    try {
      if (typeof context.requestFullscreen === "function") context.requestFullscreen();
      else global.requestTelegramFullscreen?.();
    } catch (_) {}
  }

  async function openAlphaDen(context, node, buildingId) {
    if (typeof context.openAlphaDen === "function") {
      const opened = await context.openAlphaDen(node);
      if (opened !== false) return opened;
    } else {
      try {
        await ensureRuntime(context, "ensureAlphaDen", "ensureAlphaDenLoaded");
        if (typeof global.AlphaDen?.open === "function") {
          global.AlphaDen.open();
          return true;
        }
      } catch (error) {
        warn("[AlphaDen] load/open failed", error);
      }
    }

    if (typeof context.onAlphaDenUnavailable === "function") {
      context.onAlphaDenUnavailable(node);
      return false;
    }
    return openBuilding(context, node, buildingId);
  }

  async function open(nodeId, options = {}) {
    const context = Object.assign({}, configuredAdapter, options || {});
    const id = String(nodeId || "").trim();
    const node = resolveNode(id, context);
    if (!node) {
      warn(`[MapActivityRouter] Unknown map node: ${id || "(empty)"}`);
      return false;
    }

    const buildingId = String(node.buildingId || node.id || "");
    const unlocked = typeof context.unlocked === "boolean"
      ? context.unlocked
      : (typeof context.isNodeUnlocked === "function" ? !!context.isNodeUnlocked(node) : true);

    if (context.closeMap !== false && typeof context.closeMap === "function") {
      await context.closeMap({ source: `building:${buildingId}` });
    }

    // These runtime overrides intentionally precede metadata and region-lock handling.
    if (id === "phantom_nodes" || buildingId === "phantom_nodes") {
      const title = String(node.name || buildingId).replaceAll("_", " ");
      if (typeof global.Influence?.open === "function") return global.Influence.open(buildingId, title);
      warn("[Influence] module not ready");
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "blood_moon_tower" ||
      buildingId === "blood_moon_tower" ||
      node.action === "open_bloodmoon"
    ) {
      try {
        await ensureRuntime(context, "ensureBloodMoon", "ensureBloodMoonLoaded");
        if (typeof global.BloodMoon?.open === "function") {
          requestFullscreen(context);
          return global.BloodMoon.open();
        }
      } catch (error) {
        warn("[BloodMoon] load/open failed", error);
      }
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "oracle_void_doorway" ||
      buildingId === "oracle_void_doorway" ||
      node.action === "open_oracle"
    ) {
      try {
        await ensureRuntime(context, "ensureOracle", "ensureOracleLoaded");
        if (typeof global.Oracle?.open === "function") return global.Oracle.open();
      } catch (error) {
        warn("[Oracle] load/open failed", error);
      }
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "howl_treasury" ||
      buildingId === "howl_treasury" ||
      node.action === "open_howl_treasury"
    ) {
      if (typeof global.HowlTreasury?.open === "function") return global.HowlTreasury.open();
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "burned_archive" ||
      buildingId === "burned_archive" ||
      node.action === "open_burned_archive"
    ) {
      if (typeof context.openArchiveNodeSheet === "function") return context.openArchiveNodeSheet(node);
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "alpha_den" ||
      buildingId === "alpha_den" ||
      node.action === "open_alpha_den"
    ) {
      return await openAlphaDen(context, node, buildingId);
    }

    if (
      id === "dead_relay_exchange" ||
      buildingId === "dead_relay_exchange" ||
      node.action === "open_signal_broker"
    ) {
      if (!global.WorldExploration?.canOpenDeadRelay?.()) {
        global.WorldExploration?.showDeadRelayLocked?.();
        return false;
      }
      if (typeof global.SignalBroker?.open === "function") return global.SignalBroker.open();
      return openBuilding(context, node, buildingId);
    }

    if (!unlocked) {
      if (
        id === "edge_of_chain" ||
        buildingId === "edge_of_chain" ||
        node.action === "open_siege"
      ) {
        try {
          await ensureRuntime(context, "ensureSiege", "ensureSiegeLoaded");
          if (typeof global.Siege?.open === "function") {
            requestFullscreen(context);
            return global.Siege.open();
          }
        } catch (error) {
          warn("[Siege] load/open failed", error);
        }
      }
      return await call(context, "openLocked", node);
    }

    if (
      id === "abandoned_wallets" ||
      (
        node.action === "building_enter" &&
        (buildingId === "abandoned_wallets_vault" || node.buildingId === "abandoned_wallets_vault")
      )
    ) {
      try {
        await ensureRuntime(context, "ensureSlots", "ensureSlotsLoaded");
        if (typeof global.Slots?.open === "function") {
          return global.Slots.open({ buildingId: node.buildingId || buildingId, name: node.name, desc: node.desc });
        }
      } catch (error) {
        warn("[RecoveryTerminal] load/open failed", error);
      }
      return openBuilding(context, node, buildingId);
    }

    if (node.action === "coming_soon") return openBuilding(context, node, buildingId);

    if (
      id === "broken_contracts" ||
      node.action === "open_broken_contracts" ||
      node.buildingId === "broken_contracts_hub"
    ) {
      if (typeof global.BrokenContracts?.open === "function") {
        return global.BrokenContracts.open({ buildingId: node.buildingId || node.id, name: node.name, desc: node.desc });
      }
      return openBuilding(context, node, node.buildingId || buildingId);
    }

    if (id === "moon_lab" || (node.action === "building_enter" && node.buildingId === "moonlab_fortress")) {
      try {
        await ensureRuntime(context, "ensureFortress", "ensureFortressLoaded");
        if (typeof global.Fortress?.open === "function") return global.Fortress.open();
      } catch (error) {
        warn("[Fortress] load/open failed", error);
      }
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "testnet_wastes_dojo" ||
      id === "testnet_wastes" ||
      (node.action === "building_enter" && node.buildingId === "testnet_wastes_dojo")
    ) {
      try {
        await ensureRuntime(context, "ensureDojo", "ensureDojoLoaded");
        if (typeof global.Dojo?.open === "function") return global.Dojo.open();
      } catch (error) {
        warn("[Dojo] load/open failed", error);
      }
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "alpha_network_hq" ||
      node.buildingId === "faction_hq" ||
      node.action === "open_faction_hq" ||
      node.buildingId === "alpha_network_hq_shop"
    ) {
      if (typeof global.FactionHQ?.open === "function") return global.FactionHQ.open();
      if (typeof global.Shop?.open === "function") return global.Shop.open();
      return openBuilding(context, node, buildingId);
    }

    if (
      id === "vault_forge" ||
      node.action === "open_forge" ||
      node.gameplay?.type === "forge"
    ) {
      const forgeBuildingId = node.buildingId || node.id || "forge";
      return global.Forge?.open?.({ buildingId: forgeBuildingId, name: node.name, desc: node.desc });
    }

    if (node.action === "building_enter" && node.buildingId) {
      return call(context, "openBuilding", node.buildingId, node.name, node.desc);
    }

    const region = typeof context.getRegion === "function" ? context.getRegion(node.region) : null;
    if (region && (region.desc || node.desc) && typeof context.openRegionSheet === "function") {
      return context.openRegionSheet(node, region);
    }
    return call(context, "openRegion", node.region);
  }

  const API = Object.freeze({ configure, open });
  global.MapActivityRouter = API;
})(window);
