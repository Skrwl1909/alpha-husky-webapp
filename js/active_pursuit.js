(function (global) {
  "use strict";

  const STATE = {
    data: null,
    loading: false,
    lastProgressKey: "",
    lastRefreshAt: 0,
    subscribers: new Set(),
    timer: 0,
  };

  const URGENT_STORY_RE = /(?:mission_(?:ready|running|active)|siege_running|bloodmoon_live|handoff|first_signal|campaign_incoming)/i;

  function apiPost() {
    return global.apiPost || global.S?.apiPost || null;
  }

  function payload(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.data && typeof raw.data === "object") return raw.data;
    return raw;
  }

  function active() {
    return STATE.data?.available && STATE.data?.active ? STATE.data.active : null;
  }

  function mandatoryFtueActive() {
    try {
      if (global.FirstSessionSpine && typeof global.FirstSessionSpine.graduated === "function") {
        return !global.FirstSessionSpine.graduated();
      }
    } catch (_) {}
    return false;
  }

  function urgentStoryOwnsNextMove() {
    try {
      const scf = global.StoryDelivery?.getState?.();
      if (!scf) return false;
      if (scf.firstSession || scf.lockedBrief || scf.hideHubGoal || scf.nextMove) return true;
      return URGENT_STORY_RE.test(String(scf.ctaKind || ""));
    } catch (_) {
      return false;
    }
  }

  function shouldPresent() {
    const item = active();
    if (!item) return false;
    if (mandatoryFtueActive()) return false;
    if (urgentStoryOwnsNextMove()) return false;
    return true;
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = String(text);
    return node;
  }

  function objectiveRow(objective) {
    const row = el("div", `ah-pursuit-objective${objective?.complete ? " is-complete" : ""}`);
    const mark = el("span", "ah-pursuit-objective-mark", objective?.complete ? "✓" : "○");
    const copy = el("div", "ah-pursuit-objective-copy");
    copy.append(
      el("strong", "ah-pursuit-objective-label", objective?.label || "Objective"),
      el("span", "ah-pursuit-objective-detail", objective?.detail || "")
    );
    row.append(mark, copy);
    return row;
  }

  function progressPips(item) {
    const wrap = el("div", "ah-pursuit-pips");
    const total = Math.max(1, Number(item?.totalObjectives || 0));
    const done = Math.max(0, Number(item?.completedObjectives || 0));
    for (let i = 0; i < total; i += 1) {
      wrap.append(el("span", `ah-pursuit-pip${i < done ? " is-done" : ""}`));
    }
    return wrap;
  }

  async function openNext() {
    if (STATE.loading) return false;
    const item = active();
    const action = item?.nextAction?.type;
    if (!action) return false;

    if (action === "advance") {
      const post = apiPost();
      if (typeof post !== "function") return false;
      try {
        STATE.loading = true;
        const raw = await post("/webapp/pursuit/advance", {});
        accept(payload(raw), "advance");
        return true;
      } catch (err) {
        console.warn("[ActivePursuit] advance failed", err);
        return false;
      } finally {
        STATE.loading = false;
      }
    }

    try { global.HomeNav?.closeAll?.(); } catch (_) {}
    if (action === "elite_missions") {
      if (typeof global.Missions?.openElite === "function") {
        global.Missions.openElite();
        return true;
      }
      global.HomeNav?.openMissions?.();
      return true;
    }
    if (action === "missions") {
      global.HomeNav?.openMissions?.();
      return true;
    }
    if (action === "moonlab") {
      await global.HomeNav?.openMoonLab?.();
      return true;
    }
    if (action === "map") {
      global.HomeNav?.openMap?.();
      return true;
    }
    return false;
  }

  function renderHub() {
    const root = document.getElementById("hubPursuitRoot");
    const hub = document.getElementById("hubBack");
    if (!root || !hub) return;

    const item = active();
    const visible = !!item && shouldPresent();
    hub.classList.toggle("has-active-pursuit", visible);
    root.hidden = !visible;
    if (!visible) {
      root.replaceChildren();
      return;
    }

    const card = el("section", `ah-pursuit-card${item.complete ? " is-complete" : ""}`);
    card.dataset.pursuitId = String(item.id || "");
    const head = el("div", "ah-pursuit-head");
    const headCopy = el("div", "ah-pursuit-head-copy");
    headCopy.append(
      el("span", "ah-pursuit-kicker", item.complete ? "FIELD OBJECTIVE COMPLETE" : "ACTIVE PURSUIT"),
      el("strong", "ah-pursuit-title", item.title || "Field Objective")
    );
    const count = el("span", "ah-pursuit-count", `${Number(item.completedObjectives || 0)} / ${Number(item.totalObjectives || 0)}`);
    head.append(headCopy, count);

    const status = el("div", "ah-pursuit-progress-line");
    status.append(progressPips(item));
    if (item.oneStepRemains && !item.complete) status.append(el("span", "ah-pursuit-close-copy", "ONE STEP REMAINS"));
    else if (item.complete) status.append(el("span", "ah-pursuit-close-copy", "WALL BROKEN"));
    else status.append(el("span", "ah-pursuit-close-copy", "FIELD PROGRESS"));

    const objectives = el("div", "ah-pursuit-objectives");
    (Array.isArray(item.objectives) ? item.objectives : []).forEach((obj) => objectives.append(objectiveRow(obj)));

    const next = item.nextAction || {};
    const action = el("button", "ah-pursuit-action", next.label || "Continue Pursuit");
    action.type = "button";
    action.addEventListener("click", openNext);

    card.append(
      head,
      el("p", "ah-pursuit-desc", item.description || ""),
      status,
      objectives,
      el("p", "ah-pursuit-next-reason", next.reason || ""),
      action
    );
    root.replaceChildren(card);
  }

  function cue(text, subtext) {
    let node = document.getElementById("ahPursuitCue");
    if (!node) {
      node = el("div", "ah-pursuit-cue");
      node.id = "ahPursuitCue";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.replaceChildren(el("strong", "", text), el("span", "", subtext || ""));
    node.classList.remove("is-on");
    void node.offsetWidth;
    node.classList.add("is-on");
    clearTimeout(node.__hideTimer);
    node.__hideTimer = setTimeout(() => node.classList.remove("is-on"), 2600);
  }

  function progressKey(data) {
    const item = data?.active;
    if (!item?.id) return "";
    return `${item.id}|${Number(item.completedObjectives || 0)}|${item.complete ? 1 : 0}`;
  }

  function maybeCue(previous, next, reason) {
    if (!previous?.active || !next?.active) return;
    if (previous.active.id !== next.active.id) return;
    if (reason === "init" || reason === "hub_open") return;
    const before = Number(previous.active.completedObjectives || 0);
    const after = Number(next.active.completedObjectives || 0);
    if (after <= before) return;
    if (next.active.complete && !previous.active.complete) {
      cue("PURSUIT COMPLETE", next.active.title || "Field objective complete");
    } else {
      cue("PURSUIT ADVANCED", `${after} / ${Number(next.active.totalObjectives || 0)} · ${next.active.title || "Field objective"}`);
    }
  }

  function notify(reason) {
    const event = Object.freeze({ reason: String(reason || "update"), state: STATE.data });
    STATE.subscribers.forEach((fn) => {
      try { fn(event); } catch (_) {}
    });
    try {
      global.dispatchEvent(new CustomEvent("ah:pursuit-state-changed", { detail: event }));
    } catch (_) {}
  }

  function accept(next, reason) {
    if (!next || typeof next !== "object") return null;
    const previous = STATE.data;
    STATE.data = next;
    STATE.lastProgressKey = progressKey(next);
    maybeCue(previous, next, reason);
    renderHub();
    notify(reason);
    return next;
  }

  async function refresh(reason = "refresh") {
    const post = apiPost();
    if (typeof post !== "function" || STATE.loading) return STATE.data;
    STATE.loading = true;
    try {
      const raw = await post("/webapp/pursuit/state", {});
      STATE.lastRefreshAt = Date.now();
      return accept(payload(raw), reason);
    } catch (err) {
      console.warn("[ActivePursuit] state unavailable", err);
      const hub = document.getElementById("hubBack");
      const root = document.getElementById("hubPursuitRoot");
      hub?.classList.remove("has-active-pursuit");
      if (root) { root.hidden = true; root.replaceChildren(); }
      return STATE.data;
    } finally {
      STATE.loading = false;
    }
  }

  function scheduleRefresh(reason) {
    clearTimeout(STATE.timer);
    STATE.timer = setTimeout(() => refresh(reason), 120);
  }

  function refreshHub(reason = "hub_open") {
    renderHub();
    return refresh(reason);
  }

  function subscribe(listener, options = {}) {
    if (typeof listener !== "function") return () => {};
    STATE.subscribers.add(listener);
    if (options.emitCurrent && STATE.data) {
      try { listener(Object.freeze({ reason: "current", state: STATE.data })); } catch (_) {}
    }
    return () => STATE.subscribers.delete(listener);
  }

  function init() {
    global.addEventListener("ah:session-state-changed", () => scheduleRefresh("session_state_changed"));
    try { global.StoryDelivery?.subscribe?.(() => renderHub()); } catch (_) {}
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setTimeout(() => refresh("init"), 180), { once: true });
    } else {
      setTimeout(() => refresh("init"), 180);
    }
  }

  global.ActivePursuit = Object.freeze({
    refresh,
    refreshHub,
    renderHub,
    getState: () => STATE.data,
    getActive: active,
    openNext,
    subscribe,
  });

  init();
})(window);
