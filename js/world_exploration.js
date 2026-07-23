(function () {
  "use strict";

  const ROOT_ID = "worldExplorationOverlay";
  const PANEL_ID = "worldExplorationPanel";
  const CANONICAL_FRAGMENT_ID = "map_key_fragment";
  const FRAGMENT_ICON_PATH = "/images/ui/map_key_fragment.webp";
  const SECTOR_IDS = new Set(["relay_fringe_01", "relay_fringe_02"]);
  const TAP_MOVE_PX = 12;
  const state = {
    initialized: false,
    valid: false,
    projection: null,
    serverOffsetMs: 0,
    selectedSectorId: null,
    refreshing: null,
    requestBusy: false,
    requestIds: Object.create(null),
    lastMessage: "",
    timerId: null,
    timerRefreshPending: false,
  };

  function byId(id) { return document.getElementById(id); }
  function apiPost() { return window.S?.apiPost || window.apiPost || window.AH?.apiPost || null; }
  function mapStage() { return byId("mapStage"); }
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
      return SECTOR_IDS.has(String(sector?.id || "")) && values.every((value) => value != null) && values[2] > 0 && values[3] > 0
        && values[0] >= 0 && values[1] >= 0 && values[0] + values[2] <= bounds.width && values[1] + values[3] <= bounds.height;
    });
    if (!sectors.length) return null;
    return { ...payload, worldBounds: bounds, sectorCatalog: sectors };
  }

  function formatSectorName(sector) {
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
      if (event.target?.closest?.("[data-we-action='start']")) void startSelected();
      if (event.target?.closest?.("[data-we-action='claim']")) void claimSelected();
    });
    document.body.appendChild(panel);
    return panel;
  }

  function renderOverlay() {
    const overlay = ensureOverlay();
    if (!overlay) return;
    overlay.replaceChildren();
    if (!state.valid || !state.projection) {
      overlay.hidden = true;
      syncDeadRelayMarker();
      return;
    }
    overlay.hidden = false;
    const bounds = state.projection.worldBounds;
    state.projection.sectorCatalog.forEach((sector) => {
      if (!sector.visible) return;
      const geometry = sector.geometry;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "world-exploration-sector";
      button.dataset.sectorId = sector.id;
      button.dataset.status = String(sector.status || "locked");
      button.style.left = `${(geometry.x / bounds.width) * 100}%`;
      button.style.top = `${(geometry.y / bounds.height) * 100}%`;
      button.style.width = `${(geometry.width / bounds.width) * 100}%`;
      button.style.height = `${(geometry.height / bounds.height) * 100}%`;
      button.setAttribute("aria-label", `${formatSectorName(sector)}: ${sector.status || "locked"}`);
      button.innerHTML = `<span class="world-exploration-sector-shade"></span><span class="world-exploration-sector-label"><strong>${escapeHtml(formatSectorName(sector))}</strong><em>${escapeHtml(String(sector.status || "locked").toUpperCase())}</em></span>`;
      let origin = null;
      let moved = false;
      button.addEventListener("pointerdown", (event) => { origin = { x: event.clientX, y: event.clientY }; moved = false; });
      button.addEventListener("pointermove", (event) => {
        if (!origin) return;
        moved ||= Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > TAP_MOVE_PX;
      });
      button.addEventListener("pointerup", () => { if (moved) button.dataset.draggedUntil = String(performance.now() + 260); origin = null; });
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (moved || Number(button.dataset.draggedUntil || 0) > performance.now()) return;
        openSector(sector.id);
      });
      overlay.appendChild(button);
    });
    syncDeadRelayMarker();
  }

  function requirementsHtml(sector) {
    const itemRequirements = asObject(sector?.itemRequirements) || {};
    const requirement = Number(itemRequirements[CANONICAL_FRAGMENT_ID] || 0);
    const fragmentBalance = Math.max(0, Number(state.projection?.currentFragmentBalance) || 0);
    const creditsNeeded = Math.max(0, Number(asObject(sector?.progressionCreditRequirements)?.relay7) || 0);
    const credits = Math.max(0, Number(state.projection?.relay7LifetimeCredits) || 0);
    const rows = [];
    if (requirement) {
      rows.push(`<li><img src="${FRAGMENT_ICON_PATH}" alt="" onerror="this.hidden=true"><span>${escapeHtml(CANONICAL_FRAGMENT_ID.replace(/_/g, " "))}</span><b>${fragmentBalance} / ${requirement}</b></li>`);
    }
    if (creditsNeeded) rows.push(`<li><span>Relay-7 credits</span><b>${credits} / ${creditsNeeded}</b></li>`);
    if (sector?.prerequisiteSectorId) rows.push(`<li><span>Prerequisite</span><b>${escapeHtml(formatSectorName({ id: sector.prerequisiteSectorId }))}</b></li>`);
    return rows.length ? `<ul class="world-exploration-requirements">${rows.join("")}</ul>` : '<p class="world-exploration-no-requirements">No item requirements.</p>';
  }

  function panelActionHtml(sector) {
    if (state.requestBusy) return '<button class="world-exploration-action" type="button" disabled>Processing…</button>';
    const status = String(sector?.status || "locked");
    const activeScan = activeScanFor(sector);
    const remaining = remainingFor(sector);
    if (status === "available" && sector?.canStartScan) return '<button class="world-exploration-action" type="button" data-we-action="start">Start scan</button>';
    if (status === "scanning" || (activeScan && remaining > 0)) return `<button class="world-exploration-action" type="button" disabled>Scanning · ${escapeHtml(formatRemaining(remaining))}</button>`;
    if (status === "claimable" && state.projection?.canClaimScan && activeScan) return '<button class="world-exploration-action is-claim" type="button" data-we-action="claim">Claim sector</button>';
    if (status === "unlocked") return '<div class="world-exploration-complete">Sector unlocked</div>';
    const reason = (sector?.blockingReasons || [])[0] || "Requirements are not met.";
    return `<button class="world-exploration-action" type="button" disabled>${escapeHtml(humanReason(reason))}</button>`;
  }

  function renderPanel() {
    const panel = ensurePanel();
    const content = byId("worldExplorationPanelContent");
    const sector = sectorFor(state.selectedSectorId);
    if (!panel || !content || !sector) return;
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
    state.selectedSectorId = sector.id;
    state.lastMessage = "";
    const panel = ensurePanel();
    if (!panel) return;
    panel.hidden = false;
    renderPanel();
    try {
      const meta = { isOpen: () => !panel.hidden, close: closePanelView, fallback: false };
      if (window.AlphaNav?.push) window.AlphaNav.push(PANEL_ID, meta);
      else { window.navRegister?.(PANEL_ID, meta); window.navOpen?.(PANEL_ID); }
    } catch (_) {}
  }
  function closePanelView() {
    const panel = byId(PANEL_ID);
    if (!panel || panel.hidden) return;
    panel.hidden = true;
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

  function syncDeadRelayMarker() {
    const locked = !canOpenDeadRelay();
    document.querySelectorAll('[data-node-id="dead_relay_exchange"], [data-building-id="dead_relay_exchange"]').forEach((element) => {
      element.classList.toggle("is-world-exploration-locked", locked);
      element.setAttribute("aria-disabled", locked ? "true" : "false");
      if (locked) element.title = "Dead Relay Exchange locked — claim Relay Fringe 01 first.";
    });
  }
  function canOpenDeadRelay() { return !!(state.valid && state.projection?.canOpenRelay7 === true && state.projection?.relay7Available === true); }
  function showDeadRelayLocked() {
    const message = "Dead Relay Exchange is locked. Complete and claim Relay Fringe 01 first.";
    const tg = window.Telegram?.WebApp || window.tg;
    if (typeof tg?.showAlert === "function") tg.showAlert(message);
    else window.alert(message);
  }

  function stopTimer() { if (state.timerId) clearInterval(state.timerId); state.timerId = null; }
  function tick() {
    if (!state.valid || !mapIsOpen()) return;
    renderOverlay();
    if (!byId(PANEL_ID)?.hidden) renderPanel();
    const active = asObject(state.projection?.activeScan);
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
    const task = (async () => {
      try {
        const raw = await post("/webapp/world-exploration/state", {});
        const projection = validProjection(raw);
        state.valid = !!projection;
        state.projection = projection;
        if (projection) state.serverOffsetMs = projection.serverNow * 1000 - Date.now();
      } catch (_) {
        state.valid = false;
        state.projection = null;
      }
      renderOverlay();
      if (!byId(PANEL_ID)?.hidden && !state.valid) closePanel();
      else if (!byId(PANEL_ID)?.hidden) renderPanel();
      return state.projection;
    })();
    state.refreshing = task;
    try { return await task; } finally { if (state.refreshing === task) state.refreshing = null; }
  }
  function onMapOpened() { ensureOverlay(); void refreshState(); }
  function init() {
    if (state.initialized) return;
    state.initialized = true;
    ensurePanel();
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !byId(PANEL_ID)?.hidden) closePanel(); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && mapIsOpen()) void refreshState(); });
    new MutationObserver(() => { if (mapIsOpen()) onMapOpened(); }).observe(byId("mapBack") || document.body, { attributes: true, attributeFilter: ["style", "class"] });
    stopTimer(); state.timerId = window.setInterval(tick, 1000);
    if (mapIsOpen()) onMapOpened();
  }

  window.WorldExploration = { init, onMapOpened, refreshState, canOpenDeadRelay, showDeadRelayLocked, openSector, closePanel };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
