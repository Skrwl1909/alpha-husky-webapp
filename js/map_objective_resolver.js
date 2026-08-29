(function (global) {
  "use strict";

  function asText(value) {
    return String(value == null ? "" : value).trim();
  }

  function cloneReadonly(value, seen = new WeakMap()) {
    if (value == null || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);
    const copy = Array.isArray(value) ? [] : {};
    seen.set(value, copy);
    for (const key of Object.keys(value)) copy[key] = cloneReadonly(value[key], seen);
    return Object.freeze(copy);
  }

  function getCatalogNodes() {
    const catalog = global.MapRuntimeData?.getCatalog?.() || global.DATA || null;
    return Array.isArray(catalog?.nodes) ? catalog.nodes : [];
  }

  function getOwnedNode(nodeId) {
    const id = asText(nodeId);
    if (!id) return null;
    const assignment = global.MapSectionAssignments?.getSectionForNode?.(id);
    if (!assignment) return null;
    return getCatalogNodes().find((node) => asText(node?.id) === id) || null;
  }

  function result(resolved, reason, target, nodeId, sectionId, objective) {
    return Object.freeze({
      resolved: !!resolved,
      ...(resolved ? {} : { reason: String(reason || "unresolved") }),
      target: cloneReadonly(target),
      nodeId: nodeId || null,
      sectionId: sectionId || null,
      objective: cloneReadonly(objective),
    });
  }

  function resolveNode(target, objective, nodeId) {
    const node = getOwnedNode(nodeId);
    if (!node) return result(false, "unknown_node", target, null, null, objective);
    const assignment = global.MapSectionAssignments.getSectionForNode(node.id);
    return result(true, null, target, node.id, assignment.sectionId, objective);
  }

  function resolveFortress(target, objective) {
    const buildingId = asText(target.buildingId);
    if (!buildingId) return result(false, "missing_building_id", target, null, null, objective);
    const matches = getCatalogNodes().filter((node) => {
      return asText(node?.buildingId) === buildingId && !!global.MapSectionAssignments?.getSectionForNode?.(node?.id);
    });
    if (matches.length !== 1) return result(false, matches.length ? "ambiguous_building_id" : "unknown_building_id", target, null, null, objective);
    return resolveNode(target, objective, matches[0].id);
  }

  function resolveOpenAction(target, objective) {
    const action = asText(target.action);
    if (!action) return result(false, "missing_action", target, null, null, objective);
    const matches = getCatalogNodes().filter((node) => {
      return asText(node?.action) === action && !!global.MapSectionAssignments?.getSectionForNode?.(node?.id);
    });
    if (matches.length !== 1) return result(false, matches.length ? "ambiguous_action" : "unknown_action", target, null, null, objective);
    return resolveNode(target, objective, matches[0].id);
  }

  function resolve(ctaState) {
    const state = arguments.length ? ctaState : global.CTA?.getState?.();
    if (!state || typeof state !== "object") return result(false, "no_cta", null, null, null, null);
    const objective = state.primary;
    if (!objective || typeof objective !== "object") return result(false, "no_objective", null, null, null, null);
    const target = objective.target;
    if (!target || typeof target !== "object") return result(false, "invalid_target", null, null, null, objective);

    switch (asText(target.type).toLowerCase()) {
      case "siege":
      case "map_node":
        return resolveNode(target, objective, target.nodeId);
      case "fortress":
        return resolveFortress(target, objective);
      case "bloodmoon":
        return resolveNode(target, objective, "blood_moon_tower");
      case "missions":
        return result(false, "ownership_not_applicable", target, null, null, objective);
      case "open_action":
        return resolveOpenAction(target, objective);
      default:
        return result(false, "unsupported_target", target, null, null, objective);
    }
  }

  function getCurrent() {
    return resolve();
  }

  global.MapObjectiveResolver = Object.freeze({ resolve, getCurrent });
})(window);
