(function (global) {
  "use strict";

  const state = {
    root: null,
    active: false,
    sectionId: null,
    selectedNodeId: null,
    runtimeUnsubscribe: null,
    ctaUnsubscribe: null,
  };

  function asText(value) {
    return String(value == null ? "" : value).trim();
  }

  function sectionLabel(sectionId) {
    return asText(sectionId).replaceAll("_", " ").toUpperCase();
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(className, text, onClick) {
    const node = element("button", className, text);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function getSections() {
    return global.MapSectionAssignments?.getSections?.() || [];
  }

  function getSection(sectionId) {
    return getSections().find((section) => section.sectionId === sectionId) || null;
  }

  function getCatalogNodes() {
    const catalog = global.MapRuntimeData?.getCatalog?.() || global.DATA || null;
    return Array.isArray(catalog?.nodes) ? catalog.nodes : [];
  }

  function getNode(nodeId) {
    return getCatalogNodes().find((node) => asText(node?.id) === nodeId) || null;
  }

  function runtimePresentation(nodeId, snapshot) {
    const runtime = snapshot === undefined
      ? global.AHMap?.getNodeRuntimeState?.(nodeId)
      : snapshot;
    if (!runtime) return { label: "Runtime status unavailable", detail: "" };

    const labels = [];
    if (runtime.hot) labels.push("HOT");
    if (runtime.contested) labels.push("CONTESTED");
    if (runtime.fortified) labels.push("FORTIFIED");
    const siegeStatus = asText(runtime.siege?.siegeStatus).toUpperCase();
    if (siegeStatus) labels.push(`SIEGE: ${siegeStatus}`);
    if (nodeId === "burned_archive") {
      const archiveLabel = asText(runtime.archive?.statusLabel);
      labels.push(`ARCHIVE: ${archiveLabel || (runtime.archive?.present ? "SIGNAL PRESENT" : "SIGNAL DORMANT")}`);
    }

    const details = [];
    const owner = asText(runtime.ownerFaction);
    if (owner) details.push(`OWNER: ${owner}`);
    const scores = runtime.scores && typeof runtime.scores === "object" ? runtime.scores : null;
    if (scores) {
      const scoreText = Object.entries(scores)
        .filter(([faction, score]) => asText(faction) && Number.isFinite(Number(score)))
        .map(([faction, score]) => `${asText(faction)} ${Number(score)}`)
        .join(" · ");
      if (scoreText) details.push(`SCORES: ${scoreText}`);
    }
    const attacker = asText(runtime.siege?.attackerFaction);
    const defender = asText(runtime.siege?.defenderFaction);
    if (attacker || defender) details.push(`SIEGE: ${[attacker, defender].filter(Boolean).join(" → ")}`);

    return {
      label: labels.join(" · ") || "No runtime signal",
      detail: details.join(" · "),
    };
  }

  function runtimeLabel(nodeId) {
    return runtimePresentation(nodeId).label;
  }

  function objectiveSummary(sectionId) {
    const resolved = global.MapObjectiveResolver?.getCurrent?.() || null;
    if (!resolved?.objective) return { tone: "neutral", text: "No mapped objective" };
    const title = asText(resolved.objective.title) || asText(resolved.target?.type) || "Current objective";
    if (!resolved.resolved) return { tone: "neutral", text: title };
    if (sectionId && resolved.sectionId === sectionId) return { tone: "current", text: title };
    if (sectionId) return { tone: "pointer", text: `Objective in ${sectionLabel(resolved.sectionId)}` };
    return { tone: "current", text: title };
  }

  function createObjectiveStrip(sectionId) {
    const summary = objectiveSummary(sectionId);
    const strip = element("div", `map-v2-objective is-${summary.tone}`);
    strip.dataset.mapV2ObjectiveSection = sectionId || "world";
    strip.append(
      element("span", "map-v2-objective-label", "OBJECTIVE"),
      element("span", "map-v2-objective-text", summary.text),
    );
    return strip;
  }

  function updateObjectiveStrip(strip) {
    const sectionId = asText(strip?.dataset?.mapV2ObjectiveSection);
    const summary = objectiveSummary(sectionId === "world" ? null : sectionId);
    strip.className = `map-v2-objective is-${summary.tone}`;
    const text = strip.querySelector?.(".map-v2-objective-text");
    if (text) text.textContent = summary.text;
  }

  function refreshObjectiveStrips() {
    if (!state.active || !state.root?.querySelectorAll) return;
    for (const strip of state.root.querySelectorAll("[data-map-v2-objective-section]")) {
      updateObjectiveStrip(strip);
    }
  }

  function stopCTAUpdates() {
    if (typeof state.ctaUnsubscribe === "function") state.ctaUnsubscribe();
    state.ctaUnsubscribe = null;
  }

  function startCTAUpdates() {
    stopCTAUpdates();
    if (typeof global.CTA?.subscribe !== "function") return;
    state.ctaUnsubscribe = global.CTA.subscribe(() => refreshObjectiveStrips(), { emitCurrent: true });
  }

  function updateRuntimeElement(elementNode, snapshot) {
    const nodeId = asText(elementNode?.dataset?.mapV2NodeId);
    const presentation = runtimePresentation(nodeId, snapshot);
    const status = elementNode.querySelector?.(".map-v2-runtime-status");
    const detail = elementNode.querySelector?.(".map-v2-runtime-detail");
    if (status) status.textContent = presentation.label;
    if (detail) {
      detail.textContent = presentation.detail;
      detail.hidden = !presentation.detail;
    }
  }

  function refreshRuntimeNodes(nodeIds, snapshots) {
    if (!state.active || !state.root?.querySelectorAll) return;
    const ids = new Set((Array.isArray(nodeIds) ? nodeIds : []).map(asText).filter(Boolean));
    if (!ids.size) return;
    for (const nodeElement of state.root.querySelectorAll("[data-map-v2-node-id]")) {
      const nodeId = asText(nodeElement.dataset?.mapV2NodeId);
      if (ids.has(nodeId)) updateRuntimeElement(nodeElement, snapshots?.[nodeId]);
    }
  }

  function stopRuntimeUpdates() {
    if (typeof state.runtimeUnsubscribe === "function") state.runtimeUnsubscribe();
    state.runtimeUnsubscribe = null;
  }

  function startRuntimeUpdates(nodeIds) {
    stopRuntimeUpdates();
    if (!Array.isArray(nodeIds) || !nodeIds.length || typeof global.AHMap?.subscribe !== "function") return;
    state.runtimeUnsubscribe = global.AHMap.subscribe((event) => {
      refreshRuntimeNodes(event?.nodeIds, event?.states);
    }, { nodeIds, emitCurrent: true });
  }

  function unmountWorldExplorationSurface() {
    global.WorldExploration?.unmountSurface?.();
  }

  function renderWorld() {
    if (!state.root || !state.active) return;
    stopRuntimeUpdates();
    unmountWorldExplorationSurface();
    state.sectionId = null;
    state.selectedNodeId = null;
    const view = element("section", "map-v2-view map-v2-world", null);
    const intro = element("header", "map-v2-intro");
    intro.append(
      element("p", "map-v2-kicker", "WORLD"),
      element("h3", "map-v2-title", "Alpha Husky"),
      element("p", "map-v2-copy", "Choose a section, then an activity."),
    );
    view.append(intro, createObjectiveStrip(null));

    const sections = element("div", "map-v2-section-list");
    for (const section of getSections()) {
      const count = Array.isArray(section.nodes) ? section.nodes.length : 0;
      const surfaceCount = Array.isArray(section.campaignSurfaces) ? section.campaignSurfaces.length : 0;
      const meta = count
        ? `${count} activit${count === 1 ? "y" : "ies"}${surfaceCount ? " · Campaign surface" : ""}`
        : "Presentation only";
      const card = element("article", "map-v2-section-card");
      card.append(
        element("p", "map-v2-section-order", `SECTION ${section.order}`),
        element("h4", "map-v2-section-name", sectionLabel(section.sectionId)),
        element("p", "map-v2-section-meta", meta),
        button("map-v2-section-action", count ? "View section" : "View horizons", () => renderSection(section.sectionId)),
      );
      sections.append(card);
    }
    view.append(sections);
    state.root.replaceChildren(view);
  }

  function createActivityCard(node) {
    const selected = state.selectedNodeId === node.id;
    const card = button(`map-v2-activity${selected ? " is-selected" : ""}`, "", () => {
      state.selectedNodeId = node.id;
      renderSection(state.sectionId);
    });
    card.setAttribute("aria-pressed", selected ? "true" : "false");
    card.dataset.mapV2NodeId = node.id;
    const asset = asText(node.icon || node.asset);
    if (asset) {
      const image = element("img", "map-v2-activity-image");
      image.src = asset;
      image.alt = "";
      card.append(image);
    }
    const text = element("span", "map-v2-activity-copy");
    const runtime = runtimePresentation(node.id);
    const runtimeStatus = element("span", "map-v2-activity-status map-v2-runtime-status", runtime.label);
    const runtimeDetail = element("span", "map-v2-activity-runtime-detail map-v2-runtime-detail", runtime.detail);
    runtimeDetail.hidden = !runtime.detail;
    text.append(
      element("strong", "map-v2-activity-name", asText(node.name) || node.id),
      runtimeStatus,
      runtimeDetail,
    );
    card.append(text);
    return card;
  }

  function createActivityDock(node) {
    const dock = element("aside", "map-v2-dock");
    dock.dataset.mapV2NodeId = node.id;
    const runtime = runtimePresentation(node.id);
    const runtimeDetail = element("p", "map-v2-dock-runtime-detail map-v2-runtime-detail", runtime.detail);
    runtimeDetail.hidden = !runtime.detail;
    dock.append(
      element("p", "map-v2-dock-kicker", "SELECTED ACTIVITY"),
      element("h4", "map-v2-dock-title", asText(node.name) || node.id),
      element("p", "map-v2-dock-desc", asText(node.desc) || "No production description available."),
      element("p", "map-v2-dock-status map-v2-runtime-status", runtime.label),
      runtimeDetail,
    );
    const action = button("map-v2-primary-action", "Open activity", async () => {
      if (typeof global.MapActivityRouter?.open !== "function") return;
      action.disabled = true;
      try { await global.MapActivityRouter.open(node.id); } finally { action.disabled = false; }
    });
    dock.append(action);
    return dock;
  }

  function createCampaignSurfaceSlots(section) {
    if (!Array.isArray(section.campaignSurfaces) || !section.campaignSurfaces.length) return null;
    const slots = element("div", "map-v2-surface-slots");
    let host = null;
    for (const surface of section.campaignSurfaces) {
      const slot = element("article", "map-v2-surface-slot");
      slot.append(
        element("p", "map-v2-dock-kicker", "CAMPAIGN SURFACE"),
        element("h4", "map-v2-surface-title", sectionLabel(surface.surfaceId)),
      );
      host = element("div", "map-v2-world-exploration-host");
      slot.append(host);
      slots.append(slot);
    }
    return { slots, host };
  }

  function renderLockedHorizons(view) {
    view.append(element("p", "map-v2-empty-copy", "Beyond the mapped network. No production activities are assigned here."));
    const horizons = element("ul", "map-v2-horizon-list");
    for (const name of ["Greyvault Basin", "Nullscar Expanse"]) {
      const item = element("li", "map-v2-horizon-item");
      item.append(element("strong", "", name), element("span", "", "Uncharted horizon"));
      horizons.append(item);
    }
    view.append(horizons);
  }

  function renderSection(sectionId) {
    if (!state.root || !state.active) return;
    stopRuntimeUpdates();
    unmountWorldExplorationSurface();
    const section = getSection(sectionId);
    if (!section) return renderWorld();
    state.sectionId = section.sectionId;
    const view = element("section", "map-v2-view map-v2-detail");
    const header = element("header", "map-v2-detail-head");
    header.append(
      button("map-v2-back", "All sections", renderWorld),
      element("p", "map-v2-kicker", `SECTION ${section.order}`),
      element("h3", "map-v2-title", sectionLabel(section.sectionId)),
    );
    view.append(header, createObjectiveStrip(section.sectionId));

    if (!section.nodes.length) {
      state.selectedNodeId = null;
      renderLockedHorizons(view);
      state.root.replaceChildren(view);
      return;
    }

    const activities = element("div", "map-v2-activity-list");
    const nodes = section.nodes.map((assignment) => getNode(assignment.nodeId)).filter(Boolean);
    if (!nodes.length) {
      state.selectedNodeId = null;
      view.append(element("p", "map-v2-empty-copy", "Production catalog unavailable. No action is shown."));
    } else {
      if (!nodes.some((node) => node.id === state.selectedNodeId)) state.selectedNodeId = null;
      for (const node of nodes) activities.append(createActivityCard(node));
      const campaignSurface = createCampaignSurfaceSlots(section);
      if (campaignSurface) view.append(campaignSurface.slots);
      view.append(activities);
      const selected = nodes.find((node) => node.id === state.selectedNodeId);
      if (selected) view.append(createActivityDock(selected));
      state.root.replaceChildren(view);
      if (campaignSurface?.host) global.WorldExploration?.mountSurface?.(campaignSurface.host);
      startRuntimeUpdates(nodes.map((node) => node.id));
      return;
    }
    state.root.replaceChildren(view);
  }

  function mount(root) {
    if (!root || typeof root.replaceChildren !== "function") return false;
    if (state.root && state.root !== root) {
      stopRuntimeUpdates();
      stopCTAUpdates();
    }
    state.root = root;
    return true;
  }

  function open() {
    if (!state.root) return false;
    state.active = true;
    state.root.hidden = false;
    renderWorld();
    startCTAUpdates();
    return true;
  }

  function close() {
    if (!state.root) return;
    stopRuntimeUpdates();
    stopCTAUpdates();
    unmountWorldExplorationSurface();
    state.active = false;
    state.sectionId = null;
    state.selectedNodeId = null;
    state.root.hidden = true;
    state.root.replaceChildren();
  }

  const API = Object.freeze({ mount, open, close });
  global.MapSectionsV2 = API;
})(window);
