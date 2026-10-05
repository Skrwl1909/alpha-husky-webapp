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
    lunarUnsubscribe: null,
  };

  function asText(value) {
    return String(value == null ? "" : value).trim();
  }

  function activePursuit() {
    try {
      const pursuitState = global.ActivePursuit?.getState?.();
      return pursuitState?.available && pursuitState?.active ? pursuitState.active : null;
    } catch (_) {
      return null;
    }
  }

  function pursuitMatchesRegion(sectionId) {
    const pursuit = activePursuit();
    return !!(pursuit && asText(pursuit.regionId) === asText(sectionId));
  }

  function pursuitMatchesNode(nodeId) {
    const pursuit = activePursuit();
    return !!(pursuit && asText(pursuit.nodeId) === asText(nodeId));
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

  function sectionNodes(sectionId) {
    const section = getSections().find((item) => asText(item?.sectionId) === asText(sectionId));
    return Array.isArray(section?.nodes) ? section.nodes.map((assignment) => asText(assignment?.nodeId)).filter(Boolean) : [];
  }

  function nodeRuntimeSignal(nodeId, snapshot) {
    const runtime = snapshot === undefined ? global.AHMap?.getNodeRuntimeState?.(nodeId) : snapshot;
    if (!runtime) return { score: 0, state: "STABLE", tone: "quiet", nodeId: asText(nodeId) };

    const displayStatus = asText(runtime.display?.displayStatus).toUpperCase();
    const urgency = asText(runtime.display?.urgency).toLowerCase();
    const siegeStatus = asText(runtime.siege?.siegeStatus).toLowerCase();

    let score = 0;
    let state = "ACTIVE";
    let tone = "active";

    if (displayStatus === "SIEGE_LIVE" || siegeStatus === "running" || urgency === "critical") {
      score = 100; state = "CRITICAL"; tone = "critical";
    } else if (displayStatus === "SIEGE_FORMING" || siegeStatus === "forming" || runtime.contested || urgency === "high") {
      score = 80; state = "FRONTLINE PRESSURE"; tone = "alert";
    } else if (runtime.hot || displayStatus === "HOT" || urgency === "medium") {
      score = 60; state = "PRESSURE"; tone = "hot";
    } else if (runtime.fortified || displayStatus === "FORTIFIED") {
      score = 30; state = "FORTIFIED"; tone = "fortified";
    } else if (displayStatus === "CALM" || displayStatus === "") {
      score = 10; state = "STABLE"; tone = "quiet";
    } else {
      score = 20; state = displayStatus || "ACTIVE"; tone = "active";
    }

    return { score, state, tone, nodeId: asText(nodeId) };
  }

  function regionRuntimePresentation(sectionId, snapshots) {
    const nodeIds = sectionNodes(sectionId);
    if (!nodeIds.length) return { state: "UNCHARTED", tone: "locked", score: -1, hotNodeId: "" };

    let best = { state: "STABLE", tone: "quiet", score: 0, hotNodeId: "" };
    for (const nodeId of nodeIds) {
      const signal = nodeRuntimeSignal(nodeId, snapshots?.[nodeId]);
      if (signal.score > best.score) best = { ...signal, hotNodeId: nodeId };
    }
    return best;
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

  function currentLunarState() {
    return global.LunarWorld?.getState?.() || null;
  }

  function lunarFocusNodeId(lunar = currentLunarState()) {
    return asText(lunar?.primaryFocus?.nodeId || lunar?.primaryFocus?.cta?.nodeId).toLowerCase();
  }

  function setLunarLayerState(layer, lunar) {
    if (!layer) return;
    if (!lunar) {
      layer.hidden = true;
      return;
    }
    layer.hidden = false;
    const visuals = global.LunarWorld?.getVisuals?.(lunar);
    if (!visuals) return;

    const moon = layer.querySelector?.("[data-lunar-moon]");
    if (moon && moon.getAttribute("src") !== visuals.moon) moon.setAttribute("src", visuals.moon);

    const phase = layer.querySelector?.("[data-lunar-phase-label]");
    if (phase) phase.textContent = lunar.visualOnly ? `${lunar.phaseLabel} · VISUAL ONLY` : lunar.phaseLabel;

    const next = layer.querySelector?.("[data-lunar-next-label]");
    if (next) next.textContent = global.LunarWorld?.countdownLabel?.(lunar) || "";

    const lab = layer.querySelector?.(".map-v2-lunar-lab");
    lab?.querySelectorAll?.("[data-lunar-preview]").forEach((buttonNode) => {
      const value = asText(buttonNode.dataset?.lunarPreview);
      const active = value === "live"
        ? !global.LunarWorld?.isPreview?.()
        : value === lunar.phase && !!global.LunarWorld?.isPreview?.();
      buttonNode.dataset.active = active ? "true" : "false";
    });
  }

  function createLunarLayer() {
    const layer = element("div", "map-v2-lunar-layer");
    layer.hidden = true;

    const addOverlay = (className, assetKey) => {
      const image = element("img", `map-v2-lunar-overlay ${className}`);
      image.src = global.LunarWorld?.ASSETS?.[assetKey] || "";
      image.alt = "";
      image.draggable = false;
      layer.append(image);
    };

    addOverlay("map-v2-lunar-haze", "haze");
    addOverlay("map-v2-lunar-rim", "rimGlow");
    addOverlay("map-v2-lunar-interference", "interference");
    addOverlay("map-v2-lunar-dust", "aftermathDust");

    const moonButton = button("map-v2-lunar-moon-button", "", () => {});
    moonButton.type = "button";
    moonButton.setAttribute("aria-label", "Current lunar phase");
    const moon = element("img", "map-v2-lunar-moon");
    moon.dataset.lunarMoon = "true";
    moon.alt = "";
    moon.draggable = false;
    moonButton.append(moon);
    layer.append(moonButton);

    const badge = element("div", "map-v2-lunar-badge");
    const phaseLabel = element("span", "map-v2-lunar-badge-phase");
    phaseLabel.dataset.lunarPhaseLabel = "true";
    const nextLabel = element("span", "map-v2-lunar-badge-next");
    nextLabel.dataset.lunarNextLabel = "true";
    badge.append(phaseLabel, nextLabel);
    layer.append(badge);

    const lab = element("div", "map-v2-lunar-lab");
    lab.hidden = true;
    lab.append(element("p", "map-v2-lunar-lab-title", "LUNAR VISUAL LAB · PRESENTATION ONLY"));
    for (const [value, label] of [
      ["dormant", "Dormant"],
      ["rising", "Rising"],
      ["convergence", "Convergence"],
      ["full_blood_moon", "Full"],
      ["fading", "Fading"],
      ["live", "Live"],
    ]) {
      const control = button("", label, () => {
        if (value === "live") global.LunarWorld?.clearPreview?.();
        else global.LunarWorld?.setPreviewPhase?.(value);
      });
      control.dataset.lunarPreview = value;
      lab.append(control);
    }
    layer.append(lab);

    let taps = 0;
    let firstTapAt = 0;
    moonButton.addEventListener("click", () => {
      const now = Date.now();
      if (!firstTapAt || now - firstTapAt > 2600) {
        firstTapAt = now;
        taps = 0;
      }
      taps += 1;
      if (taps >= 5) {
        taps = 0;
        firstTapAt = 0;
        lab.hidden = !lab.hidden;
      }
    });

    setLunarLayerState(layer, currentLunarState());
    return layer;
  }

  function applyLunarPresentation(lunar = currentLunarState()) {
    if (!state.root) return;
    const layer = state.root.querySelector?.(".map-v2-lunar-layer");
    if (!lunar) {
      delete state.root.dataset.lunarPhase;
      delete state.root.dataset.lunarFocus;
      state.root.style.removeProperty("--lunar-haze-opacity");
      state.root.style.removeProperty("--lunar-interference-opacity");
      state.root.style.removeProperty("--lunar-rim-opacity");
      state.root.style.removeProperty("--lunar-dust-opacity");
      if (layer) layer.hidden = true;
      return;
    }

    const visuals = global.LunarWorld?.getVisuals?.(lunar);
    state.root.dataset.lunarPhase = asText(lunar.phase);
    state.root.dataset.lunarFocus = lunarFocusNodeId(lunar);
    state.root.dataset.lunarPreview = lunar.visualOnly ? "true" : "false";
    if (visuals?.opacity) {
      state.root.style.setProperty("--lunar-haze-opacity", String(visuals.opacity.haze || 0));
      state.root.style.setProperty("--lunar-interference-opacity", String(visuals.opacity.interference || 0));
      state.root.style.setProperty("--lunar-rim-opacity", String(visuals.opacity.rimGlow || 0));
      state.root.style.setProperty("--lunar-dust-opacity", String(visuals.opacity.aftermathDust || 0));
    }
    setLunarLayerState(layer, lunar);

    state.root.querySelectorAll?.("[data-map-v2-lunar-focus]").forEach((node) => {
      delete node.dataset.mapV2LunarFocus;
    });

    const focusNodeId = lunarFocusNodeId(lunar);
    if (!focusNodeId) return;
    if (state.sectionId) {
      state.root.querySelectorAll?.("[data-map-v2-node-id]").forEach((node) => {
        if (asText(node.dataset?.mapV2NodeId).toLowerCase() === focusNodeId) node.dataset.mapV2LunarFocus = "true";
      });
      return;
    }

    const assignment = global.MapSectionAssignments?.getSectionForNode?.(focusNodeId);
    const sectionId = asText(assignment?.sectionId);
    if (!sectionId) return;
    state.root.querySelectorAll?.("[data-map-v2-section-id]").forEach((node) => {
      if (asText(node.dataset?.mapV2SectionId) === sectionId) node.dataset.mapV2LunarFocus = "true";
    });
  }

  function stopLunarUpdates() {
    if (typeof state.lunarUnsubscribe === "function") state.lunarUnsubscribe();
    state.lunarUnsubscribe = null;
  }

  function startLunarUpdates() {
    stopLunarUpdates();
    if (typeof global.LunarWorld?.subscribe === "function") {
      state.lunarUnsubscribe = global.LunarWorld.subscribe((lunar) => {
        if (state.active) applyLunarPresentation(lunar);
      }, { emitCurrent: true });
    }
    void global.LunarWorld?.refresh?.({ force: false });
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
        const runtimeRegion = regionRuntimePresentation(currentSection.sectionId);
        const hit = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        hit.setAttribute("points", region.polygon);
        hit.setAttribute("class", "map-v2-region-hit");
        hit.setAttribute("data-region", currentSection.sectionId);
        hit.setAttribute("data-map-v2-section-id", currentSection.sectionId);
        hit.setAttribute("data-map-v2-runtime-tone", runtimeRegion.tone);
        hit.setAttribute("data-map-v2-objective", objectiveSectionId === currentSection.sectionId ? "true" : "false");
        hit.setAttribute("tabindex", "-1");
        hit.addEventListener("click", () => renderSection(currentSection.sectionId));
        svg.append(hit);

        const presentation = sectionPresentation(currentSection.sectionId);
        const label = button("map-v2-region-label", "", () => renderSection(currentSection.sectionId));
        label.dataset.mapV2SectionId = currentSection.sectionId;
        label.dataset.mapV2Region = currentSection.sectionId;
        label.dataset.mapV2Objective = objectiveSectionId === currentSection.sectionId ? "true" : "false";
        label.dataset.mapV2Pursuit = pursuitMatchesRegion(currentSection.sectionId) ? "true" : "false";
        label.dataset.mapV2Locked = currentSection.nodes?.length ? "false" : "true";
        label.dataset.mapV2RuntimeTone = runtimeRegion.tone;
        label.dataset.mapV2HotNodeId = runtimeRegion.hotNodeId || "";
        label.style.left = `${region.label?.x ?? 50}%`;
        label.style.top = `${region.label?.y ?? 50}%`;
        label.setAttribute("aria-label", `Enter ${sectionLabel(currentSection.sectionId)}`);
        label.append(
          element("span", "map-v2-region-code", presentation.code),
          element("strong", "map-v2-region-name", sectionLabel(currentSection.sectionId)),
          element("span", "map-v2-region-state", runtimeRegion.state),
        );
        if (label.dataset.mapV2Pursuit === "true") {
          label.append(element("span", "map-v2-pursuit-chip", "ACTIVE PURSUIT"));
        }
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
        poi.dataset.mapV2Pursuit = pursuitMatchesNode(node.id) ? "true" : "false";

        const objectiveNodeId = global.MapObjectiveResolver?.getCurrent?.()?.nodeId || "";
        if (objectiveNodeId === node.id) poi.dataset.mapV2Objective = "true";

        const landmarkIds = new Set([
          "alpha_network_hq",
          "vault_forge",
          "edge_of_chain",
          "blood_moon_tower",
          "phantom_nodes",
          "moon_lab",
          "broken_contracts",
        ]);
        if (landmarkIds.has(node.id)) poi.dataset.mapV2Landmark = "true";
        if (node.id === "phantom_nodes") poi.dataset.mapV2Strategic = "frontline";

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
        const runtimeNow = runtimePresentation(node.id);
        const runtimeStatus = element("span", "map-v2-runtime-status", runtimeNow.label);
        runtimeStatus.hidden = runtimeNow.tone === "quiet" || !runtimeNow.label || runtimeNow.label === "No live signal";
        copy.append(
          element("strong", "map-v2-poi-name", asText(node.name) || node.id),
          element("span", "map-v2-poi-state", access.label),
          runtimeStatus,
        );
        poi.append(copy);
        if (poi.dataset.mapV2Pursuit === "true") {
          poi.append(element("span", "map-v2-pursuit-chip map-v2-pursuit-node-chip", "PURSUIT"));
        }
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
    stage.append(frame, createLunarLayer());
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

  function updateRegionRuntimeElement(elementNode, sectionId, snapshots) {
    if (!elementNode) return;
    const presentation = regionRuntimePresentation(sectionId, snapshots);
    elementNode.dataset.mapV2RuntimeTone = presentation.tone;
    elementNode.dataset.mapV2HotNodeId = presentation.hotNodeId || "";
    const stateNode = elementNode.querySelector?.(".map-v2-region-state");
    if (stateNode) stateNode.textContent = presentation.state;
  }

  function refreshRuntimeRegions(nodeIds, snapshots) {
    if (!state.active || state.sectionId || !state.root?.querySelectorAll) return;
    const changed = new Set((Array.isArray(nodeIds) ? nodeIds : []).map(asText).filter(Boolean));
    if (!changed.size) return;
    for (const regionElement of state.root.querySelectorAll("[data-map-v2-section-id]")) {
      const sectionId = asText(regionElement.dataset?.mapV2SectionId);
      const nodes = sectionNodes(sectionId);
      if (nodes.some((id) => changed.has(id))) updateRegionRuntimeElement(regionElement, sectionId, snapshots);
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
      if (state.sectionId) refreshRuntimeNodes(event?.nodeIds, event?.states);
      else refreshRuntimeRegions(event?.nodeIds, event?.states);
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
    applyLunarPresentation();
    startRuntimeUpdates(getSections().flatMap((section) => sectionNodes(section.sectionId)));
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
    card.dataset.mapV2Pursuit = pursuitMatchesNode(node.id) ? "true" : "false";
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
    if (pursuitMatchesNode(node.id)) addFact("Pursuit", "Active objective");
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
      applyLunarPresentation();
      return;
    }

    const selected = nodes.find((node) => node.id === state.selectedNodeId);
    if (selected) view.append(createActivityDock(selected));

    const campaignDock = createCampaignDock(section);
    if (campaignDock) view.append(campaignDock.dock);

    state.root.replaceChildren(view);
    applyLunarPresentation();

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
    startLunarUpdates();
    return true;
  }

  function close() {
    if (!state.root) return;
    stopRuntimeUpdates();
    stopCTAUpdates();
    stopLunarUpdates();
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

  global.addEventListener("ah:pursuit-state-changed", () => {
    if (!state.active) return;
    if (state.sectionId) renderSection(state.sectionId);
    else renderWorld();
  });

  const API = Object.freeze({
    mount,
    open,
    close,
    back,
    __test: Object.freeze({ nodeRuntimeSignal, regionRuntimePresentation, runtimePresentation, lunarFocusNodeId }),
  });
  global.MapSectionsV2 = API;
})(window);
