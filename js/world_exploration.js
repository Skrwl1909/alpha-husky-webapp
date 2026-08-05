(function () {
  "use strict";

  const ROOT_ID = "worldExplorationOverlay";
  const PANEL_ID = "worldExplorationPanel";
  const CANONICAL_FRAGMENT_ID = "map_key_fragment";
  const FRAGMENT_ICON_PATH = "/images/ui/map_key_fragment.webp";
  const REGION_ASSET_PATH = "/images/map/exploration/map_region.webp";
  const LOCK_ASSET_PATH = "/images/map/exploration/lock_region.webp";
  // Keep this aligned with the map pan threshold: a sector tap must never win after map panning begins.
  const TAP_MOVE_PX = 10;
  const TAP_MAX_DURATION_MS = 700;
  const state = {
    initialized: false,
    valid: false,
    projection: null,
    serverOffsetMs: 0,
    selectedSectorId: null,
    refreshing: null,
    requestBusy: false,
    pendingLabel: "",
    requestIds: Object.create(null),
    lastMessage: "",
    renderGeneration: 0,
    overlayFingerprint: "",
    actionGeneration: 0,
    refreshGeneration: 0,
    mapActive: false,
    timerId: null,
    timerRefreshPending: false,
    mapObserver: null,
    keyHandler: null,
    visibilityHandler: null,
    lastSectorTap: { sectorId: "", until: 0 },
  };

  function byId(id) { return document.getElementById(id); }
  function apiPost() { return window.S?.apiPost || window.apiPost || window.AH?.apiPost || null; }
  function mapStage() { return byId("mapStage"); }
  function inputNow() { return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now(); }
  function mapIsOpen() {
    const mapBack = byId("mapBack");
    return !!mapBack && (mapBack.style.display === "flex" || getComputedStyle(mapBack).display !== "none");
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function asObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : null; }
  function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }
  function plural(value, noun) { return `${value} ${noun}${value === 1 ? "" : "s"}`; }
  function makeRequestId(kind, id) {
    const key = `${kind}:${id}`;
    if (!state.requestIds[key]) {
      const random = (window.crypto?.getRandomValues ? Array.from(window.crypto.getRandomValues(new Uint32Array(1)))[0].toString(36) : Math.random().toString(36).slice(2));
      state.requestIds[key] = `we_${kind}_${Date.now()}_${random}`.slice(0, 128);
    }
    return state.requestIds[key];
  }
  function clearRequestId(kind, id) { delete state.requestIds[`${kind}:${id}`]; }

  function worldBounds(raw) {
    const bounds = asObject(raw?.worldBounds);
    const width = number(bounds?.width);
    const height = number(bounds?.height);
    if (!(width > 0 && height > 0)) return null;
    return { width, height };
  }

  function validProjection(raw) {
    const payload = asObject(raw?.state) || asObject(raw?.data?.state) || asObject(raw?.data) || asObject(raw);
    const bounds = worldBounds(payload);
    const sectorCatalog = Array.isArray(payload?.sectorCatalog) ? payload.sectorCatalog : null;
    const serverNow = number(payload?.serverNow);
    if (!payload || payload.ok === false || !bounds || !sectorCatalog || !(serverNow > 0)) return null;
    const sectors = sectorCatalog.filter((sector) => {
      const geometry = asObject(sector?.geometry);
      const values = ["x", "y", "width", "height"].map((key) => number(geometry?.[key]));
      return !!String(sector?.id || "").trim() && values.every((value) => value != null) && values[2] > 0 && values[3] > 0
        && values[0] >= 0 && values[1] >= 0 && values[0] + values[2] <= bounds.width && values[1] + values[3] <= bounds.height;
    });
    if (!sectors.length) return null;
    return { ...payload, worldBounds: bounds, sectorCatalog: sectors };
  }

  function formatSectorName(sector) {
    const supplied = String(sector?.name || "").trim();
    if (supplied) return supplied;
    return String(sector?.id || "Unknown sector").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  function formatDuration(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (hours) return `${hours}h${minutes ? ` ${minutes}m` : ""}`;
    return `${minutes}m`;
  }
  function formatRemaining(seconds) {
    const total = Math.max(0, Math.ceil(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return hours ? `${hours}h ${String(minutes).padStart(2, "0")}m` : `${minutes}m ${String(secs).padStart(2, "0")}s`;
  }
  function sectorFor(id) { return state.projection?.sectorCatalog?.find((sector) => String(sector.id) === String(id)) || null; }
  function sectorFromProjection(projection, id) {
    return projection?.sectorCatalog?.find?.((sector) => String(sector?.id || "") === String(id || "")) || null;
  }
  function pathModule() { return window.WorldExplorationPath || null; }
  function pathVersion(sector) { return Math.max(0, Number(sector?.pathOfProof?.version) || 0); }
  function activeScanFor(sector) {
    const active = asObject(state.projection?.activeScan);
    return active && String(active.sector_id || active.sectorId || "") === String(sector?.id || "") ? active : null;
  }
  function remainingFor(sector) {
    const scan = activeScanFor(sector);
    const endsAt = number(scan?.ends_at ?? scan?.endsAt);
    if (!(endsAt > 0)) return Math.max(0, Number(state.projection?.secondsRemaining) || 0);
    return Math.max(0, Math.ceil((endsAt * 1000 - (Date.now() + state.serverOffsetMs)) / 1000));
  }
  function humanReason(reason) {
    const text = String(reason || "").replace(/_/g, " ").trim();
    return text ? text.replace(/^./, (letter) => letter.toUpperCase()) : "Requirements are not met.";
  }

  function ensureOverlay() {
    const stage = mapStage();
    if (!stage) return null;
    let overlay = byId(ROOT_ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = ROOT_ID;
      overlay.className = "world-exploration-overlay";
      overlay.setAttribute("aria-label", "World exploration sectors");
      const pins = byId("pins");
      stage.insertBefore(overlay, pins || null);
    } else if (overlay.parentElement !== stage) {
      const pins = byId("pins");
      stage.insertBefore(overlay, pins || null);
    }
    return overlay;
  }

  function ensurePanel() {
    let panel = byId(PANEL_ID);
    if (panel || !document.body) return panel;
    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.className = "world-exploration-panel-shell";
    panel.hidden = true;
    panel.innerHTML = '<div class="world-exploration-backdrop" data-we-close="1"></div><section class="world-exploration-panel" role="dialog" aria-modal="true" aria-labelledby="worldExplorationTitle"><button class="world-exploration-close" type="button" data-we-close="1" aria-label="Close sector details">&times;</button><div id="worldExplorationPanelContent"></div></section>';
    panel.addEventListener("click", (event) => {
      if (event.target?.closest?.("[data-we-close]")) closePanel();
      if (event.target?.closest?.("[data-we-action='enter']")) {
        event.preventDefault();
        void enterSelected();
        return;
      }
      const pathButton = event.target?.closest?.("[data-we-path-action]");
      if (pathButton) {
        event.preventDefault();
        void submitPathAction(pathButton);
        return;
      }
      const recoveryButton = event.target?.closest?.("[data-we-recovery-source]");
      if (recoveryButton) {
        event.preventDefault();
        void openFragmentRecovery(recoveryButton);
        return;
      }
      if (event.target?.closest?.("[data-we-action='start']")) void startSelected();
      if (event.target?.closest?.("[data-we-action='claim']")) void claimSelected();
    });
    document.body.appendChild(panel);
    return panel;
  }

  function sectorVisualHtml(sector) {
    const status = String(sector?.status || "locked");
    const phase = String(sector?.pathOfProof?.phase || "");
    const pathCopy = {
      LOCKED: ["Unknown signal", "Locked"],
      ELIGIBLE: ["Signal detected", "Trace ready"],
      SCOUT_SELECTION: ["Path of Proof", "Select scout"],
      TRACE_CHOICE: ["Path of Proof", "Scout assigned"],
      ENCOUNTER_READY: ["Path of Proof", "Route traced"],
      ENCOUNTER_ACTIVE: ["Hostile contact", "Survive"],
      ANCHOR_CHOICE: ["Dead Relay", "Anchor ready"],
      UNLOCKED: ["Route proven", "Pack network"],
    }[phase];
    const copy = pathCopy || {
      locked: ["Unknown signal", "Locked"],
      available: ["Scan available", "Ready"],
      scanning: ["Signal scan", "Scanning"],
      claimable: ["Signal claim", "Claimable"],
      unlocked: ["Sector clear", "Unlocked"],
    }[status] || [formatSectorName(sector), status.toUpperCase()];
    const echoes = [1, 2, 3].map((index) => (
      `<span class="world-exploration-sector-echo world-exploration-sector-echo--${index}" aria-hidden="true"><span class="world-exploration-sector-echo-core"></span><span class="world-exploration-sector-interference"></span></span>`
    )).join("");
    return `<span class="world-exploration-sector-visual" aria-hidden="true"><img class="world-exploration-region-asset" src="${REGION_ASSET_PATH}" alt="" draggable="false" decoding="async" aria-hidden="true"><span class="world-exploration-sector-shade"></span>${echoes}<img class="world-exploration-lock-asset" src="${LOCK_ASSET_PATH}" alt="" draggable="false" decoding="async" aria-hidden="true"></span><span class="world-exploration-sector-label"><strong>${escapeHtml(formatSectorName(sector))}</strong><em>${escapeHtml(`${copy[0]} · ${copy[1]}`)}</em></span>`;
  }

  function canonicalSectorState(sector) {
    const phase = String(sector?.pathOfProof?.phase || "").toUpperCase();
    if (phase === "LOCKED") return "LOCKED";
    if (phase === "ELIGIBLE") return "SIGNAL DETECTED";
    if (["SCOUT_SELECTION", "TRACE_CHOICE", "ENCOUNTER_READY", "ENCOUNTER_ACTIVE", "ANCHOR_CHOICE"].includes(phase)) return "PATH ACTIVE";
    if (phase === "UNLOCKED") return "ROUTE PROVEN";
    return ({ locked: "LOCKED", available: "SIGNAL DETECTED", scanning: "PATH ACTIVE", claimable: "PATH ACTIVE", unlocked: "ROUTE PROVEN" })[String(sector?.status || "").toLowerCase()] || "LOCKED";
  }

  function sectorMarkerHtml(sector) {
    const canonicalState = canonicalSectorState(sector);
    const requirement = Math.max(0, Number(asObject(sector?.itemRequirements)?.[CANONICAL_FRAGMENT_ID]) || 0);
    const balance = Math.max(0, Number(state.projection?.currentFragmentBalance) || 0);
    const progress = canonicalState === "LOCKED" && requirement ? `<small>${escapeHtml(`${balance} / ${requirement} FRAGMENTS`)}</small>` : "";
    return `<span class="world-exploration-sector-marker-icon" aria-hidden="true"><img src="${LOCK_ASSET_PATH}" alt="" draggable="false" decoding="async"></span><span class="world-exploration-sector-marker-copy"><strong>${escapeHtml(formatSectorName(sector))}</strong><em>${escapeHtml(canonicalState)}</em>${progress}</span>`;
  }

  function bindSectorMarkerInput(marker, sectorId) {
    let tap = null;
    const clearTap = () => { tap = null; };
    marker.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      tap = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startedAt: inputNow(), moved: false, panned: false, cancelled: false };
    });
    marker.addEventListener("pointermove", (event) => {
      if (!tap || tap.pointerId !== event.pointerId) return;
      tap.moved ||= Math.hypot(event.clientX - tap.startX, event.clientY - tap.startY) >= TAP_MOVE_PX;
      // The parent map uses this same threshold before it captures a pan, so a drag is disqualified first.
      tap.panned ||= tap.moved || !!mapStage()?.classList?.contains("is-panning");
    });
    marker.addEventListener("pointerup", (event) => {
      if (!tap || tap.pointerId !== event.pointerId) return;
      const completed = tap;
      clearTap();
      if (completed.cancelled || completed.moved || completed.panned || inputNow() - completed.startedAt > TAP_MAX_DURATION_MS) return;
      state.lastSectorTap = { sectorId, until: inputNow() + 700 };
      openSector(sectorId);
    });
    marker.addEventListener("pointercancel", clearTap);
    marker.addEventListener("lostpointercapture", clearTap);
    marker.addEventListener("click", (event) => {
      if (state.lastSectorTap.sectorId === sectorId && state.lastSectorTap.until > inputNow()) {
        event.preventDefault();
        return;
      }
      openSector(sectorId);
    });
  }

  function renderOverlay({ previousProjection = null, animate = false } = {}) {
    const overlay = ensureOverlay();
    if (!overlay) return;
    state.renderGeneration += 1;
    if (!state.valid || !state.projection) {
      state.overlayFingerprint = "";
      overlay.replaceChildren();
      overlay.hidden = true;
      pathModule()?.destroyRoute?.();
      syncDeadRelayMarker();
      syncLockedSectorNodePresentation();
      syncNetworkBridge();
      return;
    }
    overlay.hidden = false;
    const bounds = state.projection.worldBounds;
    const fingerprint = JSON.stringify({
      currentFragmentBalance: state.projection.currentFragmentBalance,
      relay7LifetimeCredits: state.projection.relay7LifetimeCredits,
      sectorCatalog: state.projection.sectorCatalog,
    });
    if (state.overlayFingerprint !== fingerprint || !overlay.querySelector(".world-exploration-sector")) {
      state.overlayFingerprint = fingerprint;
      overlay.replaceChildren();
      state.projection.sectorCatalog.forEach((sector) => {
        if (!sector.visible) return;
        const geometry = sector.geometry;
        const sectorShell = document.createElement("div");
        sectorShell.className = "world-exploration-sector";
        sectorShell.dataset.sectorId = sector.id;
        sectorShell.dataset.status = String(sector.status || "locked");
        sectorShell.style.left = `${(geometry.x / bounds.width) * 100}%`;
        sectorShell.style.top = `${(geometry.y / bounds.height) * 100}%`;
        sectorShell.style.width = `${(geometry.width / bounds.width) * 100}%`;
        sectorShell.style.height = `${(geometry.height / bounds.height) * 100}%`;
        sectorShell.innerHTML = sectorVisualHtml(sector);
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "world-exploration-sector-marker";
        marker.dataset.sectorId = sector.id;
        marker.dataset.markerState = canonicalSectorState(sector).toLowerCase().replace(/\s+/g, "-");
        marker.setAttribute("aria-label", `Open ${formatSectorName(sector)}: ${canonicalSectorState(sector)}`);
        marker.innerHTML = sectorMarkerHtml(sector);
        bindSectorMarkerInput(marker, sector.id);
        sectorShell.appendChild(marker);
        overlay.appendChild(sectorShell);
      });
    }
    const panelOpen = !byId(PANEL_ID)?.hidden;
    const selected = panelOpen ? sectorFor(state.selectedSectorId) : null;
    const routeSector = selected || state.projection.sectorCatalog.find((sector) => {
      const path = sector?.pathOfProof;
      return pathModule()?.isPathSector?.(sector) && path?.pathId && !["LOCKED", "ELIGIBLE"].includes(String(path.phase || ""));
    });
    if (routeSector && pathModule()?.isPathSector?.(routeSector) && routeSector?.pathOfProof?.pathId) {
      pathModule().renderRoute({
        host: overlay,
        sector: routeSector,
        previousSector: sectorFromProjection(previousProjection, routeSector.id),
        projection: state.projection,
        animate,
      });
    } else {
      pathModule()?.destroyRoute?.();
    }
    syncDeadRelayMarker();
    syncLockedSectorNodePresentation();
    syncNetworkBridge();
  }

  function requirementsHtml(sector) {
    const itemRequirements = asObject(sector?.itemRequirements) || {};
    const requirement = Number(itemRequirements[CANONICAL_FRAGMENT_ID] || 0);
    const fragmentBalance = Math.max(0, Number(state.projection?.currentFragmentBalance) || 0);
    const creditsNeeded = Math.max(0, Number(asObject(sector?.progressionCreditRequirements)?.relay7) || 0);
    const credits = Math.max(0, Number(state.projection?.relay7LifetimeCredits) || 0);
    const rows = [];
    if (requirement) {
      const recovery = asObject(state.projection?.fragmentRecovery);
      const name = String(recovery?.itemId || "") === CANONICAL_FRAGMENT_ID
        ? String(recovery?.itemName || "Map Key Fragments")
        : "Map Key Fragments";
      rows.push(`<li><img src="${FRAGMENT_ICON_PATH}" alt="" onerror="this.hidden=true"><span>${escapeHtml(name)}</span><b>${fragmentBalance} / ${requirement}</b></li>`);
    }
    if (creditsNeeded) rows.push(`<li><span>Relay-7 credits</span><b>${credits} / ${creditsNeeded}</b></li>`);
    if (sector?.prerequisiteSectorId) rows.push(`<li><span>Prerequisite</span><b>${escapeHtml(formatSectorName({ id: sector.prerequisiteSectorId }))}</b></li>`);
    return rows.length ? `<ul class="world-exploration-requirements">${rows.join("")}</ul>` : '<p class="world-exploration-no-requirements">No item requirements.</p>';
  }

  function fragmentRecoveryHtml(sector) {
    const required = Math.max(0, Number(asObject(sector?.itemRequirements)?.[CANONICAL_FRAGMENT_ID]) || 0);
    if (!required) return "";
    const recovery = asObject(state.projection?.fragmentRecovery);
    if (String(recovery?.itemId || "") !== CANONICAL_FRAGMENT_ID) return "";
    const sources = Array.isArray(recovery.sources) ? recovery.sources.filter(asObject) : [];
    const source = sources.find((entry) => String(entry.id || "") === "standard_missions") || sources[0];
    if (!source) {
      return `<section class="world-exploration-recovery"><h3>HOW TO RECOVER</h3><p>${escapeHtml(String(recovery.fallbackMessage || "No active recovery source is currently available."))}</p></section>`;
    }
    const cta = asObject(source.cta);
    const sourceOrder = ["standard_missions", "chain_abandoned_wallets_expedition", "chain_broken_contracts_expedition"];
    const ordered = sourceOrder.map((id) => sources.find((entry) => String(entry.id || "") === id)).filter(Boolean);
    const sourceList = ordered.length ? ordered : sources;
    const button = cta?.target && cta?.label
      ? `<button class="world-exploration-action world-exploration-recovery-action" type="button" data-we-recovery-source="${escapeHtml(String(source.id || ""))}" data-we-recovery-target="${escapeHtml(String(cta.target))}" data-we-recovery-building-id="${escapeHtml(String(cta.buildingId || ""))}">${escapeHtml(String(cta.label))}</button>`
      : "";
    return `<section class="world-exploration-recovery"><h3>MAP KEY FRAGMENTS</h3><p class="world-exploration-recovery-balance">${escapeHtml(`${Math.max(0, Number(state.projection?.currentFragmentBalance) || 0)} / ${required}`)}</p><p>Recovered through:</p><ul>${sourceList.map((entry) => `<li>${escapeHtml(String(entry.title || "Recovery route"))}</li>`).join("")}</ul>${button}</section>`;
  }

  async function openFragmentRecovery(button) {
    const target = String(button?.dataset?.weRecoveryTarget || "");
    const buildingId = String(button?.dataset?.weRecoveryBuildingId || "");
    try {
      if (target === "chain_building") {
        const open = window.openMapKeyFragmentRecovery;
        if (typeof open !== "function") throw new Error("Recovery expeditions are unavailable.");
        closePanel();
        await Promise.resolve(open({ buildingId }));
        return;
      }
      if (target !== "missions") return;
      closePanel();
      const mapBack = byId("mapBack");
      if (mapBack && getComputedStyle(mapBack).display !== "none") {
        if (typeof window.closeMapCanonical === "function") {
          await window.closeMapCanonical({ source: "world-exploration-missions" });
        } else {
          mapBack.style.display = "none";
          try { window.navClose?.("mapBack"); } catch (_) {}
          await new Promise((resolve) => window.requestAnimationFrame ? window.requestAnimationFrame(resolve) : window.setTimeout(resolve, 0));
        }
      }
      const ensure = window.ensureMissionsLoaded;
      if (typeof ensure === "function") await ensure(apiPost(), window.Telegram?.WebApp || window.tg, !!window.DBG);
      if (typeof window.Missions?.open === "function") {
        window.Missions.open();
        return;
      }
      if (typeof window.openMissions === "function") {
        window.openMissions();
        return;
      }
      throw new Error("Missions are unavailable.");
    } catch (error) {
      state.lastMessage = "Missions could not be opened. Please try again.";
      try { window.toast?.(state.lastMessage); } catch (_) {}
      if (!byId(PANEL_ID)?.hidden) renderPanel();
    }
  }

  function panelActionHtml(sector) {
    if (state.requestBusy) return '<button class="world-exploration-action" type="button" disabled>Processing…</button>';
    const status = String(sector?.status || "locked");
    const activeScan = activeScanFor(sector);
    const remaining = remainingFor(sector);
    if (status === "available" && sector?.canStartScan) return '<button class="world-exploration-action" type="button" data-we-action="start">Start scan</button>';
    if (status === "scanning" || (activeScan && remaining > 0)) return `<button class="world-exploration-action" type="button" disabled>Scanning · ${escapeHtml(formatRemaining(remaining))}</button>`;
    if (status === "claimable" && state.projection?.canClaimScan && activeScan) return '<button class="world-exploration-action is-claim" type="button" data-we-action="claim">Claim sector</button>';
    if (canEnterSector("relay_fringe_01")) return relayEntryActionHtml(sector);
    if (status === "unlocked") return '<div class="world-exploration-complete">Sector unlocked</div>';
    const reason = (sector?.blockingReasons || [])[0] || "Requirements are not met.";
    return `<button class="world-exploration-action" type="button" disabled>${escapeHtml(humanReason(reason))}</button>`;
  }

  function relayEntryActionHtml(sector) {
    const preview = hasRelayFringeDeveloperPreview(sector);
    const label = preview ? "ENTER SECTOR · DEV PREVIEW" : "ENTER SECTOR";
    return `<button class="world-exploration-action is-claim" type="button" data-we-action="enter">${label}</button>`;
  }

  function renderPanel() {
    const panel = ensurePanel();
    const content = byId("worldExplorationPanelContent");
    const sector = sectorFor(state.selectedSectorId);
    if (!panel || !content || !sector) return;
    const path = pathModule();
    if (path?.isPathSector?.(sector)) {
      content.innerHTML = path.renderPanel({
        sector,
        projection: state.projection,
        busy: state.requestBusy,
        busyLabel: state.pendingLabel,
        message: state.lastMessage,
        requirementsHtml,
        fragmentRecoveryHtml,
      });
      if (canEnterSector("relay_fringe_01")) {
        content.insertAdjacentHTML("beforeend", `<div class="world-exploration-panel-body">${relayEntryActionHtml(sector)}</div>`);
      }
      void path.afterPanelRender({
        sector,
        projection: state.projection,
        panel: content,
        panelOpen: !panel.hidden,
      });
      return;
    }
    path?.destroyTacticalStage?.("legacy_panel");
    const status = String(sector.status || "locked");
    const description = typeof sector.description === "string" && sector.description.trim()
      ? sector.description.trim()
      : "No sector description is supplied by the current backend catalog.";
    const duration = formatDuration(sector.scanDurationSeconds);
    const scanning = status === "scanning" ? `<p class="world-exploration-timer">${escapeHtml(formatRemaining(remainingFor(sector)))} remaining</p>` : "";
    content.innerHTML = `<header class="world-exploration-panel-head"><span>WORLD EXPLORATION</span><h2 id="worldExplorationTitle">${escapeHtml(formatSectorName(sector))}</h2><p class="world-exploration-status" data-status="${escapeHtml(status)}">${escapeHtml(status.toUpperCase())}</p></header><div class="world-exploration-panel-body"><p class="world-exploration-description">${escapeHtml(description)}</p><dl class="world-exploration-details"><div><dt>Scan duration</dt><dd>${escapeHtml(duration)}</dd></div><div><dt>Current status</dt><dd>${escapeHtml(status)}</dd></div></dl>${scanning}<h3>Requirements</h3>${requirementsHtml(sector)}<p class="world-exploration-confirmation">Starting a scan spends its listed fragments. That cost is not refunded.</p>${panelActionHtml(sector)}<p class="world-exploration-message" aria-live="polite">${escapeHtml(state.lastMessage)}</p></div>`;
  }

  function openSector(id) {
    const sector = sectorFor(id);
    if (!sector) return;
    const panel = ensurePanel();
    if (!panel) return;
    const wasOpen = !panel.hidden;
    state.selectedSectorId = sector.id;
    state.lastMessage = "";
    panel.hidden = false;
    renderOverlay();
    renderPanel();
    if (!wasOpen) {
      try {
        const meta = { isOpen: () => !panel.hidden, close: closePanelView, fallback: false };
        if (window.AlphaNav?.push) window.AlphaNav.push(PANEL_ID, meta);
        else { window.navRegister?.(PANEL_ID, meta); window.navOpen?.(PANEL_ID); }
      } catch (_) {}
    }
  }
  function closePanelView() {
    const panel = byId(PANEL_ID);
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    pathModule()?.destroyTacticalStage?.("panel_closed");
    renderOverlay();
  }
  function closePanel() {
    const panel = byId(PANEL_ID);
    if (!panel || panel.hidden) return;
    try {
      if (window.AlphaNav?.close?.(PANEL_ID, { source: "world-exploration-close" })) return;
      window.navClose?.(PANEL_ID);
    } catch (_) {}
    closePanelView();
  }
  function showMessage(message) {
    const target = byId("worldExplorationPanelContent")?.querySelector(".world-exploration-message");
    state.lastMessage = String(message || "");
    if (target) target.textContent = state.lastMessage;
  }
  function confirmStart(sector) {
    const amount = Number((asObject(sector.itemRequirements) || {})[CANONICAL_FRAGMENT_ID] || 0);
    const message = `Start ${formatSectorName(sector)}? Scan duration: ${formatDuration(sector.scanDurationSeconds)}. ${amount ? `${amount} map key fragments will be spent and are not refunded.` : ""}`;
    return new Promise((resolve) => {
      const tg = window.Telegram?.WebApp || window.tg;
      if (typeof tg?.showConfirm === "function") { tg.showConfirm(message, (ok) => resolve(!!ok)); return; }
      resolve(window.confirm(message));
    });
  }
  async function submit(path, body) {
    const post = apiPost();
    if (typeof post !== "function") throw new Error("Connection is not ready.");
    const response = await post(path, body);
    if (!response || response.ok === false) {
      const error = new Error(response?.reason || response?.code || "Request failed.");
      error.response = response;
      throw error;
    }
    return response;
  }
  function pathBusyLabel(action) {
    return {
      BEGIN: "Tracing…",
      SELECT_SCOUT: "Assigning…",
      CHOOSE_TRACE: "Tracing…",
      START_ENCOUNTER: "Resolving contact…",
      RETRY_ENCOUNTER: "Resolving contact…",
      TACTICAL_ACTION: "Resolving contact…",
      SELECT_ANCHOR_PROTOCOL: "Anchoring…",
    }[String(action || "").toUpperCase()] || "Processing…";
  }
  async function confirmPathBegin(sector) {
    const amount = Number((asObject(sector?.itemRequirements) || {})[CANONICAL_FRAGMENT_ID] || 0);
    const message = `Begin the Path of Proof for ${formatSectorName(sector)}? ${amount} map key fragment${amount === 1 ? "" : "s"} will be consumed once. No timer or claim step follows.`;
    return new Promise((resolve) => {
      const tg = window.Telegram?.WebApp || window.tg;
      if (typeof tg?.showConfirm === "function") { tg.showConfirm(message, (ok) => resolve(!!ok)); return; }
      resolve(window.confirm(message));
    });
  }
  async function submitPathAction(button) {
    const sector = sectorFor(state.selectedSectorId);
    const path = pathModule();
    if (!sector || !path?.isPathSector?.(sector) || state.requestBusy) return;
    const content = byId("worldExplorationPanelContent");
    const spec = path.buildAction(button, content);
    if (!spec) return;
    if (spec.error) {
      showMessage(spec.error);
      return;
    }
    if (spec.action === "BEGIN" && !(await confirmPathBegin(sector))) return;

    const previousProjection = state.projection;
    const previousSector = sectorFromProjection(previousProjection, sector.id);
    const expectedVersion = pathVersion(previousSector);
    const requestKey = `${sector.id}:${spec.action}:${expectedVersion}`;
    const generation = ++state.actionGeneration;
    state.requestBusy = true;
    state.pendingLabel = pathBusyLabel(spec.action);
    state.lastMessage = "";
    renderPanel();
    try {
      const raw = await submit("/webapp/world-exploration/path/action", {
        sectorId: sector.id,
        action: spec.action,
        payload: spec.payload || {},
        requestId: makeRequestId("path", requestKey),
        expectedVersion,
      });
      const projection = validProjection(raw);
      if (!projection) throw new Error("The returned Path state is invalid.");
      const incomingSector = sectorFromProjection(projection, sector.id);
      const currentSector = sectorFor(sector.id);
      const incomingPathId = String(incomingSector?.pathOfProof?.pathId || "");
      const currentPathId = String(currentSector?.pathOfProof?.pathId || "");
      const stale = (
        incomingPathId
        && currentPathId
        && (
          incomingPathId !== currentPathId
          || pathVersion(incomingSector) < pathVersion(currentSector)
        )
      );
      if (!stale) {
        state.valid = true;
        state.projection = projection;
        state.serverOffsetMs = projection.serverNow * 1000 - Date.now();
      }
      clearRequestId("path", requestKey);
      if (generation !== state.actionGeneration) return;
      renderOverlay({ previousProjection, animate: true });
      renderPanel();
      const canonicalSector = sectorFor(sector.id);
      await path.playCanonicalRound(previousSector, canonicalSector);
    } catch (error) {
      state.projection = previousProjection;
      state.valid = !!previousProjection;
      state.lastMessage = humanReason(error?.response?.code || error?.message || "Unable to continue the Path.");
      renderOverlay();
      renderPanel();
      try { await refreshState({ force: true }); } catch (_) {}
    } finally {
      if (generation === state.actionGeneration) {
        state.requestBusy = false;
        state.pendingLabel = "";
        renderPanel();
      }
    }
  }
  async function startSelected() {
    const sector = sectorFor(state.selectedSectorId);
    if (!sector || state.requestBusy || !sector.canStartScan) return;
    if (!(await confirmStart(sector))) return;
    state.requestBusy = true; renderPanel();
    try {
      await submit("/webapp/world-exploration/scan/start", { sectorId: sector.id, requestId: makeRequestId("start", sector.id) });
      clearRequestId("start", sector.id);
      state.lastMessage = "";
      await refreshState({ force: true });
    } catch (error) {
      showMessage(error?.message || "Unable to start scan.");
    } finally {
      state.requestBusy = false; renderPanel();
    }
  }
  async function claimSelected() {
    const sector = sectorFor(state.selectedSectorId);
    const scan = activeScanFor(sector);
    const scanId = String(scan?.scan_id || scan?.scanId || "");
    if (!sector || !scanId || state.requestBusy || !state.projection?.canClaimScan) return;
    state.requestBusy = true; renderPanel();
    try {
      await submit("/webapp/world-exploration/scan/claim", { scanId, requestId: makeRequestId("claim", scanId) });
      clearRequestId("claim", scanId);
      state.lastMessage = "";
      await refreshState({ force: true });
    } catch (error) {
      showMessage(error?.message || "Unable to claim this sector.");
    } finally {
      state.requestBusy = false; renderPanel();
    }
  }

  function hasProductionRelayAccess(sector) {
    if (!sector || sector.canEnterSector !== true) return false;
    const phase = String(sector?.pathOfProof?.phase || "").toUpperCase();
    const status = String(sector.status || "").toLowerCase();
    return status === "unlocked" && (!phase || phase === "UNLOCKED");
  }

  function hasRelayFringeDeveloperPreview(sector) {
    return String(sector?.id || "") === "relay_fringe_01" && sector?.relayFringeDevPreview === true;
  }

  function canEnterSector(sectorId) {
    if (String(sectorId || "") !== "relay_fringe_01" || !state.valid || !state.projection) return false;
    const sector = sectorFor(sectorId);
    return hasProductionRelayAccess(sector) || hasRelayFringeDeveloperPreview(sector);
  }

  function relayEntryFailureMessage(sector, error) {
    const stage = String(error?.relayStage || "ROOM OPEN FAILED").trim() || "ROOM OPEN FAILED";
    if (hasRelayFringeDeveloperPreview(sector)) {
      try { console.error("[WorldExploration] Relay developer preview failed", error); } catch (_) {}
      return `DEV PREVIEW · ${stage}`;
    }
    return humanReason(error?.message || "Unable to enter this sector.");
  }

  async function enterSelected() {
    const selected = String(state.selectedSectorId || "");
    if (selected !== "relay_fringe_01" || state.requestBusy) return;
    state.requestBusy = true;
    state.pendingLabel = "Validating routeâ€¦";
    renderPanel();
    try {
      await refreshState({ force: true });
      if (!canEnterSector(selected)) throw new Error("This sector is not currently authorized for entry.");
      const ensure = window.ensureExplorationRoomLoaded || window.AHBootLoaders?.ensureExplorationRoomLoaded;
      if (typeof ensure !== "function") throw new Error("Sector room loader is unavailable.");
      await ensure(apiPost(), window.Telegram?.WebApp || window.tg, window.DBG);
      if (!canEnterSector(selected)) throw new Error("This sector authorization is no longer current.");
      const opened = await window.AlphaExplorationRoom.open({
        sectorId: selected,
        onClose: async () => { try { await refreshState({ force: true }); } catch (_) {} },
      });
      if (!opened) throw new Error("Sector room could not be opened.");
    } catch (error) {
      state.lastMessage = relayEntryFailureMessage(sectorFor(selected), error);
      renderPanel();
    } finally {
      state.requestBusy = false;
      state.pendingLabel = "";
      if (!window.AlphaExplorationRoom?.isOpen?.()) renderPanel();
    }
  }

  function syncDeadRelayMarker() {
    const locked = !canOpenDeadRelay();
    document.querySelectorAll('[data-node-id="dead_relay_exchange"], [data-building-id="dead_relay_exchange"]').forEach((element) => {
      element.classList.toggle("is-world-exploration-locked", locked);
      element.classList.toggle("map-state-locked", locked);
      if (locked) element.classList.remove("map-state-known");
      else element.classList.add("map-state-known");
      element.setAttribute("aria-disabled", locked ? "true" : "false");
      if (locked) element.title = "Dead Relay Exchange locked — prove and anchor Relay Fringe 01 first.";
    });
  }
  function syncLockedSectorNodePresentation() {
    const bounds = state.projection?.worldBounds;
    const lockedSectors = (state.projection?.sectorCatalog || []).filter((sector) => (
      sector?.visible && String(sector?.status || "locked") === "locked" && asObject(sector?.geometry)
    ));
    document.querySelectorAll("#pins .map-pin").forEach((element) => {
      const x = Number.parseFloat(element.style.left);
      const y = Number.parseFloat(element.style.top);
      const obscured = !!bounds && Number.isFinite(x) && Number.isFinite(y) && lockedSectors.some((sector) => {
        const geometry = sector.geometry;
        const worldX = (x / 100) * bounds.width;
        const worldY = (y / 100) * bounds.height;
        return worldX >= geometry.x && worldX <= geometry.x + geometry.width
          && worldY >= geometry.y && worldY <= geometry.y + geometry.height;
      });
      element.classList.toggle("is-world-exploration-obscured", obscured);
    });
  }
  function syncNetworkBridge() {
    const svg = byId("pathsSVG");
    if (!svg) return;
    svg.querySelectorAll(".map-signal-bridge").forEach((element) => element.remove());
    const bounds = state.projection?.worldBounds;
    const sector = (state.projection?.sectorCatalog || []).find((entry) => (
      entry?.visible && String(entry?.status || "locked") !== "unlocked" && asObject(entry?.geometry)
    ));
    const archive = document.querySelector('[data-node-id="burned_archive"]');
    const relay = document.querySelector('[data-node-id="dead_relay_exchange"]');
    if (!bounds || !sector || !archive || !relay) return;
    const pointFor = (element) => ({
      x: (Number.parseFloat(element.style.left) / 100) * bounds.width,
      y: (Number.parseFloat(element.style.top) / 100) * bounds.height,
    });
    const archivePoint = pointFor(archive);
    const relayPoint = pointFor(relay);
    if (![archivePoint.x, archivePoint.y, relayPoint.x, relayPoint.y].every(Number.isFinite)) return;
    const geometry = sector.geometry;
    const boundary = {
      x: geometry.x,
      y: Math.max(geometry.y, Math.min(relayPoint.y, geometry.y + geometry.height)),
    };
    const makePath = (points, stateClass) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      path.setAttribute("points", points.map(({ x, y }) => `${Math.round(x)},${Math.round(y)}`).join(" "));
      path.setAttribute("class", `path map-signal-bridge ${stateClass}`);
      path.setAttribute("aria-hidden", "true");
      svg.appendChild(path);
    };
    makePath([archivePoint, relayPoint], "map-signal-dormant");
    makePath([relayPoint, { x: (relayPoint.x + boundary.x) / 2, y: relayPoint.y }, boundary], "map-signal-broken");
  }
  function canOpenDeadRelay() { return !!(state.valid && state.projection?.canOpenRelay7 === true && state.projection?.relay7Available === true); }
  function showDeadRelayLocked() {
    openSector("relay_fringe_01");
  }

  function stopTimer() { if (state.timerId) clearInterval(state.timerId); state.timerId = null; }
  function tick() {
    if (!state.valid || !mapIsOpen()) return;
    const active = asObject(state.projection?.activeScan);
    if (active) {
      renderOverlay();
      if (!byId(PANEL_ID)?.hidden) renderPanel();
    }
    const endsAt = number(active?.ends_at ?? active?.endsAt);
    if (endsAt > 0 && endsAt * 1000 <= Date.now() + state.serverOffsetMs && !state.timerRefreshPending) {
      state.timerRefreshPending = true;
      void refreshState({ force: true }).finally(() => { state.timerRefreshPending = false; });
    }
  }
  async function refreshState({ force = false } = {}) {
    if (state.refreshing) return state.refreshing;
    const post = apiPost();
    if (typeof post !== "function") { state.valid = false; syncDeadRelayMarker(); return null; }
    const generation = state.refreshGeneration;
    const task = (async () => {
      const previousProjection = state.projection;
      try {
        const raw = await post("/webapp/world-exploration/state", {});
        if (generation !== state.refreshGeneration) return state.projection;
        const projection = validProjection(raw);
        state.valid = !!projection;
        state.projection = projection;
        if (projection) state.serverOffsetMs = projection.serverNow * 1000 - Date.now();
      } catch (_) {
        if (generation !== state.refreshGeneration) return state.projection;
        // Keep the last good projection mounted: a transient refresh failure
        // must not turn an already-open world into an empty or unstable shell.
        state.valid = !!previousProjection;
        state.projection = previousProjection;
      }
      renderOverlay({ previousProjection, animate: false });
      if (!byId(PANEL_ID)?.hidden && !state.valid) closePanel();
      else if (!byId(PANEL_ID)?.hidden) renderPanel();
      return state.projection;
    })();
    state.refreshing = task;
    try { return await task; } finally { if (state.refreshing === task) state.refreshing = null; }
  }
  function onMapOpened() {
    if (state.mapActive) return state.refreshing || Promise.resolve(state.projection);
    state.mapActive = true;
    pathModule()?.setMapVisible?.(true);
    ensureOverlay();
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    return refreshState().finally(() => {
      if (window.DBG) {
        try { console.debug("[map:timing]", "world-exploration-state-complete", { at: startedAt }); } catch (_) {}
      }
    });
  }
  function onMapClosed() {
    if (!state.mapActive && !mapIsOpen()) return;
    state.mapActive = false;
    state.refreshGeneration += 1;
    state.refreshing = null;
    state.timerRefreshPending = false;
    closePanel();
    pathModule()?.setMapVisible?.(false);
  }
  function onMapVisibilityChanged() {
    const open = mapIsOpen();
    if (open) void onMapOpened();
    else onMapClosed();
  }
  function init() {
    if (state.initialized) return;
    state.initialized = true;
    pathModule()?.init?.({
      apiPost: apiPost(),
      tg: window.Telegram?.WebApp || window.tg,
      dbg: !!window.DBG,
      getSelectedSector: () => sectorFor(state.selectedSectorId),
      log: (...args) => { if (window.DBG) console.debug("[WorldExplorationPath]", ...args); },
    });
    ensurePanel();
    state.keyHandler = (event) => { if (event.key === "Escape" && !byId(PANEL_ID)?.hidden) closePanel(); };
    state.visibilityHandler = () => {
      pathModule()?.setMapVisible?.(!document.hidden && mapIsOpen());
      if (!document.hidden && mapIsOpen()) void refreshState();
    };
    document.addEventListener("keydown", state.keyHandler);
    document.addEventListener("visibilitychange", state.visibilityHandler);
    state.mapObserver = new MutationObserver(onMapVisibilityChanged);
    state.mapObserver.observe(byId("mapBack") || document.body, { attributes: true, attributeFilter: ["style"] });
    stopTimer(); state.timerId = window.setInterval(tick, 1000);
    if (mapIsOpen()) onMapOpened();
    else pathModule()?.setMapVisible?.(false);
  }

  function destroy() {
    stopTimer();
    state.actionGeneration += 1;
    state.refreshGeneration += 1;
    state.mapActive = false;
    state.refreshing = null;
    try { state.mapObserver?.disconnect?.(); } catch (_) {}
    state.mapObserver = null;
    if (state.keyHandler) document.removeEventListener("keydown", state.keyHandler);
    if (state.visibilityHandler) document.removeEventListener("visibilitychange", state.visibilityHandler);
    state.keyHandler = null;
    state.visibilityHandler = null;
    pathModule()?.destroy?.();
    byId(ROOT_ID)?.remove?.();
    byId(PANEL_ID)?.remove?.();
    state.initialized = false;
    state.requestBusy = false;
    state.pendingLabel = "";
  }

  window.WorldExploration = { init, destroy, onMapOpened, onMapClosed, refreshState, canOpenDeadRelay, canEnterSector, showDeadRelayLocked, syncLockedSectorNodePresentation, syncNetworkBridge, openSector, closePanel };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
