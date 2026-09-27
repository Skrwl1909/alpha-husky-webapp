(function (global) {
  "use strict";

  const state = {
    root: null,
    active: false,
    sectionId: null,
    selectedNodeId: null,
    selectedSurfaceId: null,
    runtimeUnsubscribe: null,
    ctaUnsubscribe: null,
  };

  function asText(value) {
    return String(value == null ? "" : value).trim();
  }

  function sectionLabel(sectionId) {
    return asText(sectionId).replaceAll("_", " ").toUpperCase();
  }

  const SECTION_PRESENTATION = Object.freeze({
    citadel: Object.freeze({ code: "CTL", summary: "Command, treasury and pack infrastructure." }),
    blackglass_reach: Object.freeze({ code: "BGR", summary: "Fractured contracts, archive signals and campaign routes." }),
    iron_march: Object.freeze({ code: "IRM", summary: "Frontline pressure, siege and high-risk operations." }),
    locked_horizons: Object.freeze({ code: "LKH", summary: "Uncharted regions beyond the active network." }),
  });

  function sectionPresentation(sectionId) {
    return SECTION_PRESENTATION[sectionId] || Object.freeze({ code: "SEC", summary: "Operational sector." });
  }

  function interactionRegion(sectionId) {
    return global.MapInteractionGeometry?.getRegion?.(sectionId) || null;
  }

  function masterMapAsset() {
    return global.MapInteractionGeometry?.MASTER_ASSET || "images/map/v2/map-v2-world.webp";
  }

  function cameraTransform(camera) {
    const scale = Number(camera?.scale) || 1;
    const x = Number(camera?.x);
    const y = Number(camera?.y);
    const cx = Number.isFinite(x) ? x : 0.5;
    const cy = Number.isFinite(y) ? y : 0.5;
    return {
      scale,
      tx: (0.5 - (scale * cx)) * 100,
      ty: (0.5 - (scale * cy)) * 100,
    };
  }

  function setCamera(canvas, sectionId) {
    const camera = sectionId ? interactionRegion(sectionId)?.camera : null;
    const transform = cameraTransform(camera);
    canvas.style.setProperty("--map-v2-camera-scale", String(transform.scale));
    canvas.style.setProperty("--map-v2-camera-inverse", String(1 / transform.scale));
    canvas.style.setProperty("--map-v2-camera-tx", `${transform.tx}%`);
    canvas.style.setProperty("--map-v2-camera-ty", `${transform.ty}%`);
    canvas.dataset.mapV2Camera = sectionId || "world";
  }

  function createMapStage(sectionId, nodes = [], section = null) {
    const stage = element("div", "map-v2-map-stage");
    const frame = element("div", "map-v2-map-frame");
    const canvas = element("div", "map-v2-map-canvas");
    setCamera(canvas, sectionId);

    const image = element("img", "map-v2-map-master");
    image.src = masterMapAsset();
    image.alt = "";
    image.draggable = false;
    image.addEventListener("error", () => {
      const fallback = global.MapInteractionGeometry?.FALLBACK_ASSET;
      if (fallback && image.getAttribute("src") !== fallback) image.src = fallback;
    }, { once: false });
    canvas.append(image);

    if (!sectionId) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "map-v2-region-hit-layer");
      svg.setAttribute("viewBox", "0 0 1000 1000");
      svg.setAttribute("preserveAspectRatio", "none");
      const labels = element("div", "map-v2-region-label-layer");
      const objectiveSectionId = global.MapObjectiveResolver?.getCurrent?.()?.sectionId || "";

      for (const currentSection of getSections()) {
        const region = interactionRegion(currentSection.sectionId);
        if (!region?.polygon) continue;
        const hit = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        hit.setAttribute("points", region.polygon);
        hit.setAttribute("class", "map-v2-region-hit");
        hit.setAttribute("data-region", currentSection.sectionId);
        hit.setAttribute("data-map-v2-objective", objectiveSectionId === currentSection.sectionId ? "true" : "false");
        hit.setAttribute("tabindex", "-1");
        hit.addEventListener("click", () => renderSection(currentSection.sectionId));
        svg.append(hit);

        const presentation = sectionPresentation(currentSection.sectionId);
        const label = button("map-v2-region-label", "", () => renderSection(currentSection.sectionId));
        label.dataset.mapV2SectionId = currentSection.sectionId;
        label.dataset.mapV2Region = currentSection.sectionId;
        label.dataset.mapV2Objective = objectiveSectionId === currentSection.sectionId ? "true" : "false";
        label.dataset.mapV2Locked = currentSection.nodes?.length ? "false" : "true";
        label.style.left = `${region.label?.x ?? 50}%`;
        label.style.top = `${region.label?.y ?? 50}%`;
        label.setAttribute("aria-label", `Enter ${sectionLabel(currentSection.sectionId)}`);
        label.append(
          element("span", "map-v2-region-code", presentation.code),
          element("strong", "map-v2-region-name", sectionLabel(currentSection.sectionId)),
          element("span", "map-v2-region-state", currentSection.nodes?.length ? "ACTIVE" : "UNCHARTED"),
        );
        labels.append(label);
      }
      canvas.append(svg, labels);
    } else {
      const poiLayer = element("div", "map-v2-poi-layer");
      for (const node of nodes) {
        const point = global.MapInteractionGeometry?.getPoi?.(sectionId, node.id);
        if (!point) continue;
        const access = activityAccessState(node);
        const poi = button("map-v2-poi", "", async (event) => {
          event?.preventDefault?.();
          event?.stopPropagation?.();
          state.selectedSurfaceId = null;
          state.selectedNodeId = node.id;

          if (typeof global.MapActivityRouter?.open !== "function") {
            console.error("[MapV2] MapActivityRouter unavailable", { nodeId: node.id });
            renderSection(sectionId);
            return;
          }

          poi.disabled = true;
          poi.dataset.mapV2Opening = "true";
          try {
            const opened = await global.MapActivityRouter.open(node.id, { node });
            if (opened === false && state.active && state.sectionId === sectionId) {
              renderSection(sectionId);
            }
          } catch (error) {
            console.warn("[MapV2] POI open failed", { nodeId: node.id, error });
            if (state.active && state.sectionId === sectionId) renderSection(sectionId);
          } finally {
            poi.disabled = false;
            delete poi.dataset.mapV2Opening;
          }
        });
        poi.dataset.mapV2NodeId = node.id;
        poi.dataset.mapV2Access = access.kind;
        poi.dataset.mapV2RuntimeTone = runtimePresentation(node.id).tone;

        const objectiveNodeId = global.MapObjectiveResolver?.getCurrent?.()?.nodeId || "";
        if (objectiveNodeId === node.id) poi.dataset.mapV2Objective = "true";

        const landmarkIds = new Set([
          "alpha_network_hq",
          "vault_forge",
          "edge_of_chain",
          "blood_moon_tower",
          "moon_lab",
          "broken_contracts",
        ]);
        if (landmarkIds.has(node.id)) poi.dataset.mapV2Landmark = "true";

        if (state.selectedNodeId === node.id) poi.classList.add("is-selected");
        poi.style.left = `${Number(point.x) * 100}%`;
        poi.style.top = `${Number(point.y) * 100}%`;
        const iconPath = asText(node.icon || node.asset);
        if (iconPath) {
          const icon = element("img", "map-v2-poi-icon");
          icon.src = iconPath;
          icon.alt = "";
          poi.append(icon);
        } else {
          poi.append(element("span", "map-v2-poi-dot"));
        }
        const copy = element("span", "map-v2-poi-copy");
        copy.append(
          element("strong", "map-v2-poi-name", asText(node.name) || node.id),
          element("span", "map-v2-poi-state", access.label),
          element("span", "map-v2-runtime-status", runtimePresentation(node.id).label),
        );
        poi.append(copy);
        poiLayer.append(poi);
      }

      for (const surface of (section?.campaignSurfaces || [])) {
        const point = global.MapInteractionGeometry?.getSurface?.(sectionId, surface.surfaceId);
        if (!point) continue;
        const poi = button("map-v2-poi map-v2-poi-surface", "", () => {
          state.selectedNodeId = null;
          state.selectedSurfaceId = surface.surfaceId;
          renderSection(sectionId);
        });
        poi.dataset.mapV2SurfaceId = surface.surfaceId;
        if (state.selectedSurfaceId === surface.surfaceId) poi.classList.add("is-selected");
        poi.style.left = `${Number(point.x) * 100}%`;
        poi.style.top = `${Number(point.y) * 100}%`;
        poi.append(
          element("span", "map-v2-poi-dot"),
          element("span", "map-v2-poi-copy", "WORLD EXPLORATION"),
        );
        poiLayer.append(poi);
      }
      canvas.append(poiLayer);
    }

    frame.append(canvas);
    stage.append(frame);
    return stage;
  }

  function createMapHud(sectionId) {
    const hud = element("div", "map-v2-map-hud");
    const presentation = sectionId ? sectionPresentation(sectionId) : null;
    if (sectionId) {
      hud.append(
        button("map-v2-back map-v2-map-back", "Return to World", renderWorld),
        element("p", "map-v2-kicker", `${presentation.code} // REGION`),
        element("h3", "map-v2-title", sectionLabel(sectionId)),
      );
    } else {
      hud.append(
        element("p", "map-v2-kicker", "ALPHA HUSKY // WORLD"),
        element("h3", "map-v2-title", "World"),
        element("p", "map-v2-copy", "Tap a territory to move deeper into the Network."),
      );
    }
    return hud;
  }

  function createCampaignDock(section) {
    if (!state.selectedSurfaceId) return null;
    const surface = (section?.campaignSurfaces || []).find((item) => item.surfaceId === state.selectedSurfaceId);
    if (!surface) return null;
    const dock = element("aside", "map-v2-campaign-dock");
    const head = element("div", "map-v2-campaign-dock-head");
    head.append(
      element("p", "map-v2-dock-kicker", "CAMPAIGN SURFACE"),
      element("h4", "map-v2-dock-title", "World Exploration"),
      button("map-v2-campaign-close", "Close", () => {
        state.selectedSurfaceId = null;
        renderSection(state.sectionId);
      }),
    );
    const host = element("div", "map-v2-world-exploration-host");
    dock.append(head, host);
    return { dock, host };
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
    if (!runtime) return { label: "Live status unavailable", detail: "", tone: "quiet" };

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
      label: labels.join(" · ") || "No live signal",
      detail: details.join(" · "),
      tone: runtime.hot || runtime.contested ? "alert" : runtime.fortified ? "fortified" : labels.length ? "active" : "quiet",
    };
  }

  function activityAccessState(node) {
    const resolved = global.MapObjectiveResolver?.getCurrent?.() || null;
    if (resolved?.resolved && asText(resolved.nodeId) === asText(node?.id)) {
      return { kind: "objective", label: "OBJECTIVE" };
    }
    if (asText(node?.action).toLowerCase() === "coming_soon") {
      return { kind: "sealed", label: "SEALED" };
    }
    if (
      asText(node?.id) === "dead_relay_exchange" &&
      typeof global.WorldExploration?.canOpenDeadRelay === "function" &&
      !global.WorldExploration.canOpenDeadRelay()
    ) {
      return { kind: "locked", label: "LOCKED" };
    }
    return { kind: "ready", label: "READY" };
  }

  function nodeKindLabel(node) {
    const action = asText(node?.action);
    if (!action) return "Activity";
    return action.replace(/^open_/, "").replaceAll("_", " ");
  }

  function objectiveRouteText() {
    const resolved = global.MapObjectiveResolver?.getCurrent?.() || null;
    if (!resolved?.resolved) return "";
    const section = sectionLabel(resolved.sectionId);
    const name = asText(getNode(resolved.nodeId)?.name);
    return name ? `${section} → ${name}` : section;
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
    const route = !sectionId ? objectiveRouteText() : "";
    const routeNode = element("span", "map-v2-objective-route", route);
    routeNode.hidden = !route;
    strip.append(routeNode);
    return strip;
  }

  function updateObjectiveStrip(strip) {
    const sectionId = asText(strip?.dataset?.mapV2ObjectiveSection);
    const summary = objectiveSummary(sectionId === "world" ? null : sectionId);
    strip.className = `map-v2-objective is-${summary.tone}`;
    const text = strip.querySelector?.(".map-v2-objective-text");
    if (text) text.textContent = summary.text;
    const routeNode = strip.querySelector?.(".map-v2-objective-route");
    if (routeNode) {
      const route = sectionId === "world" ? objectiveRouteText() : "";
      routeNode.textContent = route;
      routeNode.hidden = !route;
    }
  }

  function refreshObjectiveStrips() {
    if (!state.active || !state.root?.querySelectorAll) return;
    for (const strip of state.root.querySelectorAll("[data-map-v2-objective-section]")) {
      updateObjectiveStrip(strip);
    }
    const objectiveSectionId = global.MapObjectiveResolver?.getCurrent?.()?.sectionId || "";
    for (const card of state.root.querySelectorAll("[data-map-v2-section-id]")) {
      card.dataset.mapV2Objective = card.dataset.mapV2SectionId === objectiveSectionId ? "true" : "false";
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
    elementNode.dataset.mapV2RuntimeTone = presentation.tone;
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
    state.selectedSurfaceId = null;
    state.root.dataset.mapV2Surface = "world";

    const view = element("section", "map-v2-view map-v2-world map-v2-map-mode");
    view.append(createMapStage(null), createMapHud(null), createObjectiveStrip(null));
    state.root.replaceChildren(view);
  }

  function createActivityCard(node, poiIndex = 0) {
    const selected = state.selectedNodeId === node.id;
    const access = activityAccessState(node);
    const card = button(`map-v2-activity${selected ? " is-selected" : ""}`, "", () => {
      state.selectedNodeId = node.id;
      renderSection(state.sectionId);
    });
    card.setAttribute("aria-pressed", selected ? "true" : "false");
    card.dataset.mapV2NodeId = node.id;
    card.dataset.mapV2PoiIndex = String(Math.max(0, Number(poiIndex) || 0));
    card.dataset.mapV2Access = access.kind;
    const asset = asText(node.icon || node.asset);
    if (asset) {
      const art = element("span", "map-v2-activity-art");
      const image = element("img", "map-v2-activity-image");
      image.src = asset;
      image.alt = "";
      art.append(image);
      card.append(art);
    }
    const text = element("span", "map-v2-activity-copy");
    const runtime = runtimePresentation(node.id);
    card.dataset.mapV2RuntimeTone = runtime.tone;
    const runtimeStatus = element("span", "map-v2-activity-status map-v2-runtime-status", runtime.label);
    const runtimeDetail = element("span", "map-v2-activity-runtime-detail map-v2-runtime-detail", runtime.detail);
    runtimeDetail.hidden = !runtime.detail;
    const chip = element("span", `map-v2-access-chip is-${access.kind}`, access.label);
    text.append(
      element("strong", "map-v2-activity-name", asText(node.name) || node.id),
      element("span", "map-v2-activity-kind", nodeKindLabel(node)),
      chip,
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
    const access = activityAccessState(node);
    dock.dataset.mapV2RuntimeTone = runtime.tone;
    dock.dataset.mapV2Access = access.kind;
    const runtimeDetail = element("p", "map-v2-dock-runtime-detail map-v2-runtime-detail", runtime.detail);
    runtimeDetail.hidden = !runtime.detail;
    const asset = asText(node.icon || node.asset);
    if (asset) {
      const hero = element("div", "map-v2-dock-hero");
      const image = element("img", "map-v2-dock-hero-image");
      image.src = asset;
      image.alt = "";
      hero.append(image);
      dock.append(hero);
    }
    const facts = element("div", "map-v2-dock-facts");
    const addFact = (label, value) => {
      const row = element("div", "map-v2-dock-fact");
      row.append(element("span", "map-v2-dock-fact-label", label), element("span", "map-v2-dock-fact-value", value));
      facts.append(row);
    };
    addFact("Region", sectionLabel(state.sectionId));
    addFact("Category", nodeKindLabel(node));
    addFact("Status", access.label);
    const briefing = asText(node.desc) || asText(node.lore?.identity) || "No production description available.";
    dock.append(
      element("p", "map-v2-dock-kicker", "SELECTED ACTIVITY"),
      element("h4", "map-v2-dock-title", asText(node.name) || node.id),
      element("p", "map-v2-dock-desc", briefing),
      facts,
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
      slot.dataset.mapV2SurfaceId = surface.surfaceId;
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
    state.root.dataset.mapV2Surface = section.sectionId;
    const nodes = section.nodes.map((assignment) => getNode(assignment.nodeId)).filter(Boolean);

    if (!nodes.some((node) => node.id === state.selectedNodeId)) state.selectedNodeId = null;
    if (!(section.campaignSurfaces || []).some((surface) => surface.surfaceId === state.selectedSurfaceId)) {
      state.selectedSurfaceId = null;
    }

    const view = element("section", "map-v2-view map-v2-detail map-v2-map-mode");
    view.append(createMapStage(section.sectionId, nodes, section), createMapHud(section.sectionId), createObjectiveStrip(section.sectionId));

    if (!section.nodes.length) {
      state.selectedNodeId = null;
      state.selectedSurfaceId = null;
      const sealed = element("aside", "map-v2-sealed-plate");
      sealed.append(
        element("p", "map-v2-dock-kicker", "SEALED FRONTIER"),
        element("h4", "map-v2-dock-title", "Locked Horizons"),
        element("p", "map-v2-dock-desc", "Beyond the mapped network. No production activities are assigned here yet."),
      );
      view.append(sealed);
      state.root.replaceChildren(view);
      return;
    }

    const selected = nodes.find((node) => node.id === state.selectedNodeId);
    if (selected) view.append(createActivityDock(selected));

    const campaignDock = createCampaignDock(section);
    if (campaignDock) view.append(campaignDock.dock);

    state.root.replaceChildren(view);

    if (campaignDock?.host) global.WorldExploration?.mountSurface?.(campaignDock.host);
    startRuntimeUpdates(nodes.map((node) => node.id));
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
    state.selectedSurfaceId = null;
    delete state.root.dataset.mapV2Surface;
    state.root.hidden = true;
    state.root.replaceChildren();
  }

  function back() {
    if (!state.active) return false;
    if (state.selectedNodeId || state.selectedSurfaceId) {
      state.selectedNodeId = null;
      state.selectedSurfaceId = null;
      renderSection(state.sectionId);
      return true;
    }
    if (state.sectionId) {
      renderWorld();
      return true;
    }
    return false;
  }

  const API = Object.freeze({ mount, open, close, back });
  global.MapSectionsV2 = API;
})(window);
