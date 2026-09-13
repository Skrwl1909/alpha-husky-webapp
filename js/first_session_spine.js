(function (global) {
  "use strict";
  const KEY = "ah.ftue.firstSessionSpine.v1";
  const PROFILE_KEY = KEY + ".profile";
  let profile = "", saved = {}, foundation = null;
  try { profile = global.localStorage.getItem(PROFILE_KEY) === "devFresh" ? "devFresh" : ""; } catch (_) {}
  const storageKey = () => KEY + (profile ? ".devFresh" : "");
  const listeners = new Set();
  try { saved = JSON.parse(global.localStorage.getItem(storageKey()) || "{}"); } catch (_) {}
  function persist() { try { global.localStorage.setItem(storageKey(), JSON.stringify(saved)); } catch (_) {} }
  function inputs() { return global.StoryDelivery?.gatherInputs?.() || {}; }
  function signal(input) { return input?.firstSignal || input?.tutorial?.first_signal || {}; }
  function notify() { listeners.forEach(fn => fn()); global.StoryDelivery?.refreshHub?.("first_session_spine"); }
  function milestones(input = inputs()) {
    const fs = signal(input), nav = global.GuidedNavigation?.state?.() || {};
    // COMPLETED is owned by the successful manual reward-equip transaction.
    const a = fs.state === "COMPLETED", b = a && fs.completion?.completed !== false;
    const c = fs.world_discovery === "done" || !!nav.bloodmoon?.reached;
    const d = !!nav.tactical?.reached;
    const e = !!saved.result?.confirmed, f = e && saved.ackRunId === saved.result.runId;
    return { A: a, B: b, C: c, D: d, E: e, F: f, G: a && b && c && d && e && f };
  }
  function sync(input = inputs(), canonical) {
    if (canonical) foundation = canonical;
    const fs = signal(input);
    if (!fs.eligible) return;
    // Enrollment requires an unfinished fresh FTUE, never completion alone.
    if (!saved.enrolled && (["NOT_STARTED", "MISSION_STARTED", "REWARD_RECEIVED"].includes(fs.state)
      || (fs.state === "COMPLETED" && fs.world_discovery === "pending" && foundation?.foundationStage === "solo-1"
        && !foundation.activeRunId && !foundation.lastCompletedRunId && !foundation.completed))) {
      saved.enrolled = true; persist();
    }
    if (!saved.enrolled || saved.complete) return;
    const result = saved.result;
    if (result && !result.confirmed && foundation) {
      const field = foundation.fieldOps?.lastResult;
      const completed = foundation.lastCompletedRunId === result.runId
        || Object.values(foundation.operations || {}).some(op => op.lastCompletedMissionRunId === result.runId)
        || field?.runId === result.runId;
      if (completed) {
        result.confirmed = true;
        result.fieldResult = field?.runId === result.runId ? field : null;
        result.consequence = !result.victory ? "Attempt ended. No mission clear recorded."
          : result.stage === "full-broken-signal" && foundation.completed ? "Foundation completed. Operations are available in the War Table."
          : "Mission clear recorded in Tactical Ops.";
        result.growth = result.fieldResult ? null : "Tactical mission progression saved. Pack Mastery and Tactical Rank gains apply to Field Ops.";
        persist();
      }
    }
    if (milestones(input).G) { saved.complete = true; persist(); }
  }
  function view(input = inputs()) {
    const m = milestones(input), eligible = signal(input).eligible === true;
    return { active: eligible && !!saved.enrolled && !saved.complete, complete: eligible && !!saved.complete,
      milestones: m, current: Object.keys(m).find(key => !m[key]) || "G",
      result: eligible && saved.enrolled && saved.ackRunId !== saved.result?.runId ? saved.result || null : null };
  }
  function choice(input, canonical) {
    sync(input, canonical);
    const state = view(input), m = state.milestones;
    if (!state.active || !m.A || !m.B || !m.C) return null;
    if (state.result) return { key: "first-session-result:" + state.result.runId, action: state.result.confirmed ? "Review Tactical result" : "Finish saving Tactical result",
      reason: "See the outcome and the progression recorded by your attempt.", destination: "tactical", spine: true };
    if (!m.D) {
      if (global.GuidedNavigation?.terminal("tactical")) return null;
      return { key: "tactical-first-attempt", action: "FIND TACTICAL OPS", reason: "Lead your squad in turn-based combat.", destination: "tactical", spine: true };
    }
    if (!canonical) return null;
    return { key: "first-session-tactical-run", action: "Continue Tactical Ops",
      reason: "Follow the current Mission Brief toward the full Broken Signal run.", destination: "tactical", spine: true };
  }
  function observeTactical(state, mission, capture = false) {
    const before = JSON.stringify(saved);
    sync(inputs(), state.progression);
    if (!view().active) return;
    const meaningful = state.onboardingStageId === "full-broken-signal" || !!mission;
    if (capture && !saved.result && meaningful && state.currentRunKey && state.progression
      && ["results", "defeat"].includes(state.screen) && state.battle?.results
      && ["victory", "defeat"].includes(state.battle.outcome)) {
      const victory = state.battle.outcome === "victory";
      // One display receipt; it grants nothing and never substitutes for a run snapshot.
      saved.result = { runId: state.currentRunKey, stage: state.onboardingStageId,
        missionId: mission?.missionId || null, name: mission?.name || "Broken Signal",
        victory, results: state.battle.results, routingTraceAcquired: !!state.battle.routingTraceAcquired,
        confirmed: !victory && mission?.activity !== "FIELD_OP",
        consequence: victory ? "Result awaits the existing Continue/save action." : "Attempt ended. No mission clear recorded.",
        growth: victory ? "Progression has not been saved yet." : "No clear, Pack Mastery or Tactical Rank gain recorded." };
      persist(); sync(inputs(), state.progression);
    }
    if (before !== JSON.stringify(saved)) notify();
  }
  function acknowledge(runId) {
    if (!view().active || !saved.result?.confirmed || saved.result.runId !== runId) return false;
    saved.ackRunId = runId; persist(); sync(); notify();
    void global.StoryDelivery?.refreshReturn?.();
    return true;
  }
  function setProfile(devFresh) {
    const next = devFresh ? "devFresh" : "";
    if (profile === next) return;
    profile = next; foundation = null; saved = {};
    try { global.localStorage.setItem(PROFILE_KEY, profile); saved = JSON.parse(global.localStorage.getItem(storageKey()) || "{}"); } catch (_) {}
    listeners.forEach(fn => fn());
  }
  function reset(devFresh = profile === "devFresh") {
    try { global.localStorage.removeItem(KEY + (devFresh ? ".devFresh" : "")); } catch (_) {}
    if (devFresh === (profile === "devFresh")) { saved = {}; foundation = null; listeners.forEach(fn => fn()); }
  }
  global.FirstSessionSpine = { sync, view, choice, observeTactical, acknowledge, reset, setProfile,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  sync();
})(window);
