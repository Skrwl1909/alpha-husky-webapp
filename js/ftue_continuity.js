// js/ftue_continuity.js — FTUE P0 presentation continuity (derived; server remains authoritative)
(function (global) {
  "use strict";

  var STYLE_ID = "ftue-continuity-css";
  var readyTimer = 0;
  var readyFollowUps = 0;
  var lastObjectiveId = "";
  var visBound = false;

  function asText(value) {
    return String(value == null ? "" : value).trim();
  }

  function asUpper(value) {
    return asText(value).toUpperCase();
  }

  function tutorialFirstSignal(tutorial) {
    if (!tutorial || typeof tutorial !== "object") return {};
    return tutorial.first_signal && typeof tutorial.first_signal === "object" ? tutorial.first_signal : {};
  }

  function isAwakeningCompleted(awakening) {
    if (!awakening || typeof awakening !== "object") return false;
    if (awakening.completed === true || awakening.done === true) return true;
    var status = asUpper(awakening.status || awakening.state);
    return status === "COMPLETED" || status === "DONE";
  }

  function isAwakeningInProgress(awakening) {
    if (!awakening || typeof awakening !== "object") return false;
    if (isAwakeningCompleted(awakening)) return false;
    if (awakening.started === true || awakening.in_progress === true) return true;
    if (asText(awakening.origin_mark) || asText(awakening.originMark) || asText(awakening.origin)) return true;
    var status = asUpper(awakening.status || awakening.state);
    return status === "STARTED" || status === "IN_PROGRESS" || status === "ORIGIN";
  }

  function isExplicitlyFreshEnrolled(awakening, tutorial) {
    if (awakening && typeof awakening === "object") {
      if (awakening.fresh_enrolled === true || awakening.enrolled === true) return true;
      if (awakening.first_signal_eligible === true || awakening.fresh === true) return true;
    }
    return tutorialFirstSignal(tutorial).eligible === true;
  }

  function firstSignalProgressBlocksAwakening(tutorial) {
    var state = asUpper(tutorialFirstSignal(tutorial).state);
    return state === "MISSION_STARTED" || state === "REWARD_RECEIVED" || state === "COMPLETED";
  }

  // Missing Awakening record / missing faction / missing optional fields are NOT freshness.
  function isAwakeningFreshEligible(awakening, tutorial) {
    if (isAwakeningCompleted(awakening)) return false;
    if (firstSignalProgressBlocksAwakening(tutorial)) return false;
    if (isAwakeningInProgress(awakening)) return true;
    if (!isExplicitlyFreshEnrolled(awakening, tutorial)) return false;
    if (!awakening || typeof awakening !== "object") return false;
    return awakening.should_show === true || awakening.show === true;
  }

  function isAwakeningIncomplete(awakening, tutorial) {
    return isAwakeningFreshEligible(awakening, tutorial);
  }

  function firstSignalOf(inputs) {
    inputs = inputs && typeof inputs === "object" ? inputs : {};
    var nested = tutorialFirstSignal(inputs.tutorial);
    var fs = inputs.firstSignal && typeof inputs.firstSignal === "object" ? inputs.firstSignal : {};
    return {
      eligible: fs.eligible === true || nested.eligible === true,
      faction_selected: fs.faction_selected === true || nested.faction_selected === true,
      state: asUpper(fs.state || nested.state),
      status: asUpper(fs.status || nested.status),
      world_discovery: asText(fs.world_discovery || fs.worldDiscovery || nested.world_discovery).toLowerCase(),
      remainingSec: fs.remainingSec != null ? fs.remainingSec : nested.remainingSec,
      endsAt: fs.endsAt || fs.ends_at || fs.readyAt || fs.ready_at || nested.endsAt || nested.readyAt,
      startedAt: fs.startedAt || fs.started_at || nested.startedAt
    };
  }

  function isProtectedFtue(inputs, awakening) {
    if (isAwakeningFreshEligible(awakening, inputs && inputs.tutorial)) return true;
    var fs = firstSignalOf(inputs);
    if (!fs.eligible) return false;
    if (fs.state !== "COMPLETED") return true;
    return fs.world_discovery === "pending";
  }

  function readyBoundaryMs(fs, nowMs) {
    nowMs = typeof nowMs === "number" ? nowMs : Date.now();
    if (!fs || asUpper(fs.state) !== "MISSION_STARTED" || asUpper(fs.status) !== "RUNNING") return null;
    var ends = Number(fs.endsAt || fs.ends_at || fs.readyAt || fs.ready_at);
    if (Number.isFinite(ends) && ends > 0) {
      if (ends < 1e12) ends = ends * 1000;
      return Math.max(0, ends - nowMs);
    }
    var remaining = Number(fs.remainingSec);
    if (Number.isFinite(remaining) && remaining >= 0) return Math.max(0, remaining * 1000);
    return null;
  }

  function storyPrimaryFromScf(scf) {
    if (!scf || !scf.target) return null;
    return {
      kind: asText(scf.ctaKind) || "first_signal",
      title: asText(scf.goLabel) || asText(scf.nextAction) || "Continue",
      subtitle: asText(scf.why),
      badge: asText(scf.nextLead) || "SIGNAL",
      target: scf.target,
      meta: {},
      priority: 98,
      expiresInSec: 0
    };
  }

  function shouldOwnHomeCta(scf) {
    if (!scf || !scf.target || scf.lockedBrief) return false;
    if (scf.firstSession || scf.hideHubGoal) return true;
    var id = asText(scf.id);
    return id === "S-AWAKENING" || id.indexOf("S-FS-") === 0;
  }

  function ensureStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ""
      + "body.ah-ftue-protected #ton-connect,"
      + "body.ah-ftue-protected #supportTopWallet,"
      + "body.ah-ftue-protected #ton-wallet-status{"
      + "  visibility:hidden !important; pointer-events:none !important;"
      + "}"
      + "body.ah-ftue-protected #ahCommunityBtn{"
      + "  opacity:.18 !important; pointer-events:none !important;"
      + "  transform:scale(.84); filter:grayscale(.7);"
      + "}"
      + "body.ah-ftue-protected #liveEventLine,"
      + "body.ah-ftue-protected .ah-live-event-chip{"
      + "  display:none !important;"
      + "}";
    document.head.appendChild(style);
  }

  function applyProtectedShell(active) {
    if (typeof document === "undefined" || !document.body) return !!active;
    ensureStyles();
    document.body.classList.toggle("ah-ftue-protected", !!active);
    return !!active;
  }

  function currentObjective(inputs, awakening) {
    var SD = global.StoryDelivery;
    var merged = Object.assign({}, inputs || {}, { awakening: awakening || (inputs && inputs.awakening) || null });
    if (SD && typeof SD.resolve === "function") return SD.resolve(merged);
    return null;
  }

  function gather() {
    var inputs = {};
    try { inputs = global.StoryDelivery && global.StoryDelivery.gatherInputs ? global.StoryDelivery.gatherInputs() : {}; }
    catch (_) { inputs = {}; }
    var awakening = null;
    try { awakening = global.Awakening && typeof global.Awakening.getState === "function" ? global.Awakening.getState() : null; }
    catch (_) {}
    return { inputs: inputs, awakening: awakening };
  }

  function clearReadyTimer() {
    if (readyTimer) {
      try { clearTimeout(readyTimer); } catch (_) {}
      readyTimer = 0;
    }
  }

  function refreshAuthoritative(reason) {
    var chain = Promise.resolve();
    try {
      if (global.Onboarding && typeof global.Onboarding.refreshContinuity === "function") {
        chain = chain.then(function () { return global.Onboarding.refreshContinuity(); });
      }
    } catch (_) {}
    chain = chain.then(function () {
      try { if (global.StoryDelivery && global.StoryDelivery.refreshHub) global.StoryDelivery.refreshHub(reason || "ftue_continuity"); } catch (_) {}
      try { if (global.CTA && global.CTA.refresh) return global.CTA.refresh(); } catch (_) {}
      return null;
    }).then(function () {
      sync({ reason: reason || "refresh" });
    }).catch(function () {
      // Offline / failed refresh: keep last derived presentation; do not route from stale assumptions.
    });
    return chain;
  }

  function scheduleReadyRefresh(fs) {
    clearReadyTimer();
    var ms = readyBoundaryMs(fs);
    if (ms == null) {
      readyFollowUps = 0;
      return;
    }
    readyTimer = setTimeout(function () {
      readyTimer = 0;
      readyFollowUps += 1;
      refreshAuthoritative("fs_ready_boundary").then(function () {
        var next = firstSignalOf(gather().inputs);
        if (asUpper(next.status) === "READY" || asUpper(next.state) !== "MISSION_STARTED") {
          readyFollowUps = 0;
          return;
        }
        if (readyFollowUps < 2) scheduleReadyRefresh({ state: "MISSION_STARTED", status: "RUNNING", remainingSec: 2 });
      });
    }, Math.min(ms + 450, 120000));
  }

  function bindLifecycle() {
    if (visBound || typeof document === "undefined") return;
    visBound = true;
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") refreshAuthoritative("visibility");
    });
    try {
      global.addEventListener("pageshow", function () { refreshAuthoritative("pageshow"); });
      global.addEventListener("focus", function () { refreshAuthoritative("focus"); });
    } catch (_) {}
  }

  function sync(options) {
    options = options || {};
    var snap = gather();
    var protectedNow = isProtectedFtue(snap.inputs, snap.awakening);
    applyProtectedShell(protectedNow);
    var fs = firstSignalOf(snap.inputs);
    if (protectedNow) scheduleReadyRefresh(fs);
    else {
      clearReadyTimer();
      readyFollowUps = 0;
    }
    var scf = null;
    try { scf = currentObjective(snap.inputs, snap.awakening); } catch (_) {}
    lastObjectiveId = scf && scf.id ? String(scf.id) : "";
    return {
      protected: protectedNow,
      objective: scf,
      firstSignal: fs
    };
  }

  function onPresentationClosed(source) {
    return refreshAuthoritative("closed:" + asText(source || "presentation"));
  }

  function openCurrentObjective() {
    var snap = gather();
    var scf = currentObjective(snap.inputs, snap.awakening);
    if (!scf || !scf.target) return Promise.resolve(false);
    try {
      if (global.CTA && typeof global.CTA.openTarget === "function") {
        return Promise.resolve(global.CTA.openTarget(scf.target));
      }
    } catch (_) {}
    return Promise.resolve(false);
  }

  var API = {
    isAwakeningCompleted: isAwakeningCompleted,
    isAwakeningInProgress: isAwakeningInProgress,
    isExplicitlyFreshEnrolled: isExplicitlyFreshEnrolled,
    isAwakeningFreshEligible: isAwakeningFreshEligible,
    isAwakeningIncomplete: isAwakeningIncomplete,
    isProtectedFtue: isProtectedFtue,
    firstSignalOf: firstSignalOf,
    readyBoundaryMs: readyBoundaryMs,
    storyPrimaryFromScf: storyPrimaryFromScf,
    shouldOwnHomeCta: shouldOwnHomeCta,
    currentObjective: currentObjective,
    applyProtectedShell: applyProtectedShell,
    onPresentationClosed: onPresentationClosed,
    openCurrentObjective: openCurrentObjective,
    refreshAuthoritative: refreshAuthoritative,
    sync: sync,
    lastObjectiveId: function () { return lastObjectiveId; }
  };

  if (global) global.FtueContinuity = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;

  if (typeof document !== "undefined") {
    function boot() {
      bindLifecycle();
      sync({ reason: "init" });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
