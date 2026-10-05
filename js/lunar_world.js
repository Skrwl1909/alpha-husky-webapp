// Alpha Husky — Lunar World Director P0-B.
// Read-only presentation bridge for the canonical backend worldLunarState contract.
(function (global) {
  "use strict";

  const PHASES = Object.freeze(["dormant", "rising", "convergence", "full_blood_moon", "fading"]);
  const PHASE_LABELS = Object.freeze({
    dormant: "DORMANT",
    rising: "RISING",
    convergence: "CONVERGENCE",
    full_blood_moon: "FULL BLOOD MOON",
    fading: "FADING",
  });
  const NEXT_LABELS = Object.freeze({
    dormant: "RISING",
    rising: "CONVERGENCE",
    convergence: "FULL BLOOD MOON",
    full_blood_moon: "FADING",
    fading: "DORMANT",
  });
  const ASSET_BASE = "/assets/lunar_world/v1";
  const ASSETS = Object.freeze({
    dormant: `${ASSET_BASE}/moon_dormant.webp`,
    rising: `${ASSET_BASE}/moon_rising.webp`,
    convergence: `${ASSET_BASE}/moon_convergence.webp`,
    full_blood_moon: `${ASSET_BASE}/moon_full_blood.webp`,
    fading: `${ASSET_BASE}/moon_fading.webp`,
    haze: `${ASSET_BASE}/lunar_haze.webp`,
    interference: `${ASSET_BASE}/lunar_interference.webp`,
    rimGlow: `${ASSET_BASE}/lunar_rim_glow.webp`,
    aftermathDust: `${ASSET_BASE}/lunar_aftermath_dust.webp`,
  });
  const PHASE_OPACITY = Object.freeze({
    dormant: Object.freeze({ haze: .16, interference: 0, rimGlow: .07, aftermathDust: 0 }),
    rising: Object.freeze({ haze: .20, interference: .05, rimGlow: .14, aftermathDust: 0 }),
    convergence: Object.freeze({ haze: .26, interference: .16, rimGlow: .25, aftermathDust: .03 }),
    full_blood_moon: Object.freeze({ haze: .30, interference: .23, rimGlow: .34, aftermathDust: .07 }),
    fading: Object.freeze({ haze: .21, interference: .05, rimGlow: .11, aftermathDust: .19 }),
  });

  const CACHE_TTL_MS = 30000;
  let liveState = null;
  let previewPhase = "";
  let inFlight = null;
  let fetchedAt = 0;
  const subscribers = new Set();

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function phaseKey(value) {
    const key = text(value).toLowerCase();
    return PHASES.includes(key) ? key : "";
  }

  function parseEpoch(value) {
    if (value == null || value === "") return 0;
    if (typeof value === "number" && Number.isFinite(value)) {
      return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
    }
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric > 1e12 ? Math.floor(numeric / 1000) : Math.floor(numeric);
    }
    const ms = Date.parse(String(value));
    return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
  }

  function normalizeFocus(raw) {
    if (!raw || typeof raw !== "object") return null;
    const nodeId = text(raw.nodeId || raw.node_id).toLowerCase();
    const metric = raw.metric && typeof raw.metric === "object" ? raw.metric : null;
    const cta = raw.cta && typeof raw.cta === "object" ? raw.cta : null;
    return Object.freeze({
      kind: text(raw.kind).toLowerCase() || "world",
      nodeId,
      label: text(raw.label) || "World Signal",
      state: text(raw.state).toUpperCase(),
      urgency: text(raw.urgency).toLowerCase() || "low",
      priority: Number.isFinite(Number(raw.priority)) ? Number(raw.priority) : 0,
      reason: text(raw.reason),
      metric: metric ? Object.freeze({
        name: text(metric.name),
        value: Number.isFinite(Number(metric.value)) ? Number(metric.value) : metric.value,
        unit: text(metric.unit),
      }) : null,
      cta: cta ? Object.freeze({
        action: text(cta.action),
        nodeId: text(cta.nodeId || cta.node_id).toLowerCase(),
        label: text(cta.label).toUpperCase(),
      }) : null,
    });
  }

  function normalize(raw) {
    if (!raw || typeof raw !== "object") return null;
    const phase = phaseKey(raw.phase);
    if (!phase) return null;
    const secondary = Array.isArray(raw.secondarySignals)
      ? raw.secondarySignals.map(normalizeFocus).filter(Boolean).slice(0, 2)
      : [];
    return Object.freeze({
      schemaVersion: Number(raw.schemaVersion) || 1,
      source: text(raw.source),
      phase,
      phaseLabel: text(raw.phaseLabel).toUpperCase() || PHASE_LABELS[phase],
      nextPhase: phaseKey(raw.nextPhase),
      nextTransitionAt: parseEpoch(raw.nextTransitionAt),
      nextFullMoonAt: parseEpoch(raw.nextFullMoonAt),
      eventWindowStatus: text(raw.eventWindowStatus).toLowerCase(),
      syncStatus: text(raw.syncStatus).toLowerCase(),
      syncMode: text(raw.syncMode).toLowerCase(),
      intensity: Math.max(0, Math.min(100, Number(raw.intensity) || 0)),
      moonProgress: Number(raw.moonProgress) || 0,
      moonIllumination: Number(raw.moonIllumination) || 0,
      primaryFocus: normalizeFocus(raw.primaryFocus),
      secondarySignals: Object.freeze(secondary),
    });
  }

  function presentation(state) {
    const base = state || liveState;
    if (!base) return null;
    const phase = previewPhase || base.phase;
    if (!PHASES.includes(phase)) return base;
    if (!previewPhase) return base;
    return Object.freeze({
      ...base,
      phase,
      phaseLabel: PHASE_LABELS[phase],
      nextPhase: PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length],
      intensity: ({ dormant:15, rising:42, convergence:72, full_blood_moon:100, fading:36 })[phase],
      visualOnly: true,
    });
  }

  function getState() {
    return presentation(liveState);
  }

  function getLiveState() {
    return liveState;
  }

  function getVisuals(state = getState()) {
    const phase = phaseKey(state?.phase) || "dormant";
    const opacity = PHASE_OPACITY[phase] || PHASE_OPACITY.dormant;
    return Object.freeze({
      phase,
      moon: ASSETS[phase],
      haze: ASSETS.haze,
      interference: ASSETS.interference,
      rimGlow: ASSETS.rimGlow,
      aftermathDust: ASSETS.aftermathDust,
      opacity,
    });
  }

  function emit() {
    const current = getState();
    subscribers.forEach((callback) => {
      try { callback(current); } catch (_) {}
    });
    try {
      global.dispatchEvent(new CustomEvent("ah:lunar-state-changed", { detail: current }));
    } catch (_) {}
  }

  function ingest(raw) {
    const data = raw?.data && typeof raw.data === "object" ? raw.data : raw;
    const normalized = normalize(data?.worldLunarState);
    if (!normalized) return null;
    liveState = normalized;
    fetchedAt = Date.now();
    emit();
    return getState();
  }

  function getApiPost() {
    const apiPost = global.apiPost || global.S?.apiPost || global.AH?.apiPost;
    return typeof apiPost === "function" ? apiPost : null;
  }

  async function refresh(options = {}) {
    const force = options.force === true;
    if (!force && liveState && Date.now() - fetchedAt < CACHE_TTL_MS) return getState();
    if (inFlight) return inFlight;
    const apiPost = getApiPost();
    if (!apiPost) return getState();
    inFlight = (async () => {
      try {
        const raw = await apiPost("/webapp/oracle/state", {});
        return ingest(raw) || getState();
      } catch (_) {
        return getState();
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  function subscribe(callback, options = {}) {
    if (typeof callback !== "function") return () => {};
    subscribers.add(callback);
    if (options.emitCurrent !== false && getState()) {
      try { callback(getState()); } catch (_) {}
    }
    return () => subscribers.delete(callback);
  }

  function setPreviewPhase(value) {
    const phase = phaseKey(value);
    if (!phase) return false;
    previewPhase = phase;
    emit();
    return true;
  }

  function clearPreview() {
    if (!previewPhase) return;
    previewPhase = "";
    emit();
  }

  function isPreview() {
    return !!previewPhase;
  }

  function countdownSeconds(state = getState(), nowSec = Math.floor(Date.now() / 1000)) {
    const at = Number(state?.nextTransitionAt) || 0;
    return at > 0 ? Math.max(0, at - nowSec) : 0;
  }

  function compactDuration(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (days > 0) return `${days}D ${hours}H`;
    if (hours > 0) return `${hours}H ${String(minutes).padStart(2, "0")}M`;
    return `${Math.max(1, minutes)}M`;
  }

  function countdownLabel(state = getState()) {
    if (!state) return "";
    const next = PHASE_LABELS[state.nextPhase] || NEXT_LABELS[state.phase] || "NEXT PHASE";
    if (!state.nextTransitionAt) return next;
    return `${next} IN ${compactDuration(countdownSeconds(state))}`;
  }

  function focusMetricLabel(focus) {
    const metric = focus?.metric;
    if (!metric || metric.value == null || metric.value === "") return "";
    if (text(metric.unit).toLowerCase() === "percent") return `${metric.value}%`;
    return [metric.value, metric.unit].filter(Boolean).join(" ");
  }

  function openFocus(state = getState()) {
    const focus = state?.primaryFocus;
    const nodeId = text(focus?.cta?.nodeId || focus?.nodeId).toLowerCase();
    if (!nodeId) return false;
    if (typeof global.MapActivityRouter?.open === "function") {
      Promise.resolve(global.MapActivityRouter.open(nodeId, { source: "lunar_world" })).catch(() => {});
      return true;
    }
    return false;
  }

  global.LunarWorld = Object.freeze({
    PHASES,
    PHASE_LABELS,
    ASSETS,
    normalize,
    ingest,
    refresh,
    subscribe,
    getState,
    getLiveState,
    getVisuals,
    setPreviewPhase,
    clearPreview,
    isPreview,
    countdownSeconds,
    countdownLabel,
    compactDuration,
    focusMetricLabel,
    openFocus,
    __test: Object.freeze({ phaseKey, parseEpoch, normalizeFocus }),
  });
})(window);
