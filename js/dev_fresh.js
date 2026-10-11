// js/dev_fresh.js — owner-only DEV FRESH PROFILE indicator + On/Reset/Off
(function (global) {
  "use strict";

  var ROOT_ID = "ahDevFreshRoot";
  var STYLE_ID = "ah-dev-fresh-css";
  var DOCK_KEY = "ah.devFreshDock.v1";
  var LS_KEYS = ["ah_onboarding_v", "ah_origin_mark", "ah_faction", "ah.sd.markHandoffConsumed.v1", "ah.sd.tacticalDiscovery.v1", "ah.ftue.discoveryGuideSeen.v1", "ah.sd.returnContinuity.v1", "ah.ftue.scoutGuide.v1", "ah.ftue.forgeDiscovery.v1", "ah.ftue.coreSystemDiscovery.v1", "ah.discovery.postFtue.v1", "ah.fieldRecord.activationSeen.v1", "ah.fieldRecord.activationSeen.v1.devFresh"];

  var S = {
    apiPost: null,
    eligible: false,
    active: false,
    busy: false,
    loaded: false,
    expanded: false,
    dock: "bottom"
  };
  try { S.dock = global.localStorage.getItem(DOCK_KEY) === "top" ? "top" : "bottom"; } catch (_) {}

  function apiPost() {
    return S.apiPost || global.apiPost || global.apiPostRaw || null;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#ahDevFreshRoot{position:fixed;right:10px;left:auto;top:auto;bottom:max(76px,calc(env(safe-area-inset-bottom,0px) + 70px));z-index:46;pointer-events:none;display:none;max-width:calc(100vw - 20px);}",
      "#ahDevFreshRoot[data-dock='top']{top:max(8px,var(--ah-inset-top,env(safe-area-inset-top,0px)));bottom:auto;}",
      "#ahDevFreshRoot[data-show='1']{display:flex;justify-content:flex-end;}",
      ".ah-devfresh{pointer-events:auto;display:flex;flex-direction:column;align-items:flex-end;gap:6px;max-width:calc(100vw - 20px);font:600 11px/1.35 system-ui,sans-serif;color:#ffe7b0;}",
      ".ah-devfresh-toggle{appearance:none;display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:9px 12px;border:1px solid rgba(255,196,72,.65);border-radius:12px;background:rgba(20,15,8,.96);box-shadow:0 7px 22px rgba(0,0,0,.5);color:#ffe7b0;font:700 11px system-ui,sans-serif;cursor:pointer;white-space:nowrap;}",
      ".ah-devfresh[data-active='1'] .ah-devfresh-toggle{border-color:#ffb020;background:rgba(49,26,4,.97);color:#fff3d0;}",
      ".ah-devfresh-dot{width:8px;height:8px;border-radius:50%;background:#887a62;display:inline-block;}",
      ".ah-devfresh[data-active='1'] .ah-devfresh-dot{background:#ffb020;box-shadow:0 0 9px #ffb020;}",
      ".ah-devfresh-panel{box-sizing:border-box;width:min(288px,calc(100vw - 20px));padding:12px;border:1px solid rgba(255,196,72,.55);border-radius:12px;background:rgba(18,12,4,.97);box-shadow:0 12px 30px rgba(0,0,0,.5);}",
      ".ah-devfresh-panel[hidden]{display:none!important;}",
      ".ah-devfresh-panel-title{font:700 12px system-ui,sans-serif;letter-spacing:.04em;}",
      ".ah-devfresh-note{margin:6px 0 10px;font:500 11px/1.4 system-ui,sans-serif;color:#d7c39a;}",
      ".ah-devfresh-actions{display:flex;gap:6px;}",
      ".ah-devfresh-panel button{appearance:none;min-height:40px;border:1px solid rgba(255,196,72,.4);background:rgba(255,255,255,.07);color:inherit;font:700 11px system-ui,sans-serif;padding:8px 10px;border-radius:7px;cursor:pointer;}",
      ".ah-devfresh-actions button{flex:1;}",
      ".ah-devfresh-panel button[disabled]{opacity:.45;cursor:default;}",
      ".ah-devfresh-panel button[data-kind='dock']{width:100%;margin-top:8px;}",
      ".ah-devfresh button:focus-visible{outline:2px solid #fff3d0;outline-offset:2px;}",
      "#ahDevFreshRoot[data-dock='top'] .ah-devfresh-toggle{order:0;}",
      "#ahDevFreshRoot[data-dock='top'] .ah-devfresh-panel{order:1;}",
      "#ahDevFreshRoot[data-dock='bottom'] .ah-devfresh-toggle{order:1;}",
      "#ahDevFreshRoot[data-dock='bottom'] .ah-devfresh-panel{order:0;}"
    ].join("");
    document.head.appendChild(style);
  }

  function clearFirstSessionLocal() {
    global.ContextualDiscovery?.reset();
    global.DiscoveryGuide?.reset?.();
    global.GuidedNavigation?.reset();
    global.FirstSessionSpine?.reset(true);
    global.FieldRecord?.resetPresentation?.();
    try { localStorage.removeItem("ah.contextualDiscovery.v1"); } catch (_) {}
    try { localStorage.removeItem("ah.sd.nextMoveDismissed.v1"); } catch (_) {}
    for (var i = 0; i < LS_KEYS.length; i++) {
      try { localStorage.removeItem(LS_KEYS[i]); } catch (_) {}
    }
  }

  function rootEl() {
    var el = document.getElementById(ROOT_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = ROOT_ID;
    el.setAttribute("aria-live", "polite");
    (document.body || document.documentElement).appendChild(el);
    return el;
  }

  // Read-only first-session diagnosis. Owner-only UI; never sends player data anywhere.
  async function diagnoseFirstSignal() {
    if (!S.eligible || !S.active || S.busy) return;
    S.busy = true;
    render();
    var result = { source: "DEV FRESH (read-only)", checkedAt: new Date().toISOString() };
    function brief(data) {
      if (!data || typeof data !== "object") return { missing: true };
      var root = (data.data && typeof data.data === "object") ? data.data : (data.state && typeof data.state === "object" ? data.state : data);
      var fs = root.firstSignal || root.first_signal || (root.tutorial && root.tutorial.first_signal) || {};
      var faction = root.currentFaction || root.faction || root.faction_id || null;
      return {
        ok: data.ok !== false,
        error: data.reason || data.error || null,
        first_signal: {
          present: !!(fs && Object.keys(fs).length),
          eligible: fs.eligible === true,
          faction_selected: fs.faction_selected === true,
          state: fs.state || null,
          status: fs.status || null,
          version: fs.version || null
        },
        faction_present: !!faction,
        offers: Array.isArray(root.offers) ? root.offers.length : null
      };
    }
    try {
      var fn = apiPost();
      if (typeof fn !== "function") throw Error("apiPost not ready");
      var settled = await Promise.allSettled([
        fn("/webapp/tutorial/state", {run_id:"diag_tut_"+Date.now()}),
        fn("/webapp/missions/state", {run_id:"diag_mis_"+Date.now()}),
        fn("/webapp/oath/state", {})
      ]);
      ["tutorial", "missions", "oath"].forEach(function(key,i){
        result[key] = settled[i].status === "fulfilled" ? brief(settled[i].value) : { error: String(settled[i].reason?.message || "unavailable") };
      });
      var cached = global.Onboarding?.getFirstSignal?.() || {};
      result.frontend = {
        eligible: cached.eligible === true,
        faction_selected: cached.faction_selected === true,
        state: cached.state || null,
        missions_card_present: !!document.getElementById("mFirstSignalOffer"),
        webapp_version: String(global.WEBAPP_VER || "")
      };
      var report = JSON.stringify(result, null, 2);
      try { console.log("[FTUE DIAG]", result); } catch (_) {}
      global.alert("FTUE READ-ONLY DIAGNOSTIC\\n" + report.slice(0,2800));
    } catch (err) {
      global.alert("FTUE diagnosis failed: " + String(err?.message || err));
    } finally {
      S.busy = false;
      render();
    }
  }

  function render() {
    ensureStyles();
    var el = rootEl();
    if (!S.eligible) {
      el.removeAttribute("data-show");
      try { document.body.removeAttribute("data-dev-fresh"); } catch (_) {}
      el.innerHTML = "";
      return;
    }
    el.setAttribute("data-show", "1");
    el.setAttribute("data-dock", S.dock);
    try {
      if (S.active) document.body.setAttribute("data-dev-fresh", "1");
      else document.body.removeAttribute("data-dev-fresh");
    } catch (_) {}
    var note = S.active
      ? "Isolated test profile. Your real account is untouched. Economy writes are blocked."
      : "Real player is active. Use On to switch to a separate test player.";
    var stateLabel = S.active ? "ON" : "OFF";
    el.innerHTML =
      '<div class="ah-devfresh" data-active="' + (S.active ? "1" : "0") + '">' +
        '<button type="button" class="ah-devfresh-toggle" data-kind="toggle" aria-controls="ahDevFreshControls" aria-expanded="' + (S.expanded ? "true" : "false") + '" aria-label="Fresh profile ' + stateLabel + '. Toggle controls">' +
          '<span class="ah-devfresh-dot" aria-hidden="true"></span><span>FRESH ' + stateLabel + '</span><span aria-hidden="true">' + (S.expanded ? "×" : "☰") + '</span>' +
        '</button>' +
        '<section class="ah-devfresh-panel" id="ahDevFreshControls"' + (S.expanded ? "" : " hidden") + '>' +
          '<div class="ah-devfresh-panel-title">DEV FRESH PROFILE — ' + stateLabel + '</div>' +
          '<p class="ah-devfresh-note">' + note + '</p>' +
          '<div class="ah-devfresh-actions">' +
            '<button type="button" data-kind="on"' + (S.active || S.busy ? " disabled" : "") + '>On</button>' +
            '<button type="button" data-kind="reset"' + (S.busy ? " disabled" : "") + '>Reset</button>' +
            '<button type="button" data-kind="off"' + (!S.active || S.busy ? " disabled" : "") + '>Off</button>' +
          '</div>' +
          (S.active ? '<button type="button" data-kind="diagnose">Diagnose First Signal (read only)</button>' : '') +
          '<button type="button" data-kind="dock">Move to ' + (S.dock === "top" ? "bottom" : "top") + ' corner</button>' +
        '</section>' +
      '</div>';
  }

  async function call(path) {
    var fn = apiPost();
    if (typeof fn !== "function") throw new Error("apiPost not ready");
    return await fn(path, {});
  }

  async function refresh() {
    try {
      var out = await call("/dev/fresh/status");
      S.eligible = !!(out && out.ok && out.eligible);
      S.active = !!(out && out.active);
      if (out?.ok) global.FirstSessionSpine?.setProfile(S.active);
      S.loaded = true;
    } catch (err) {
      var status = err && err.status;
      S.eligible = false;
      S.active = false;
      S.loaded = true;
      if (status && status !== 401 && status !== 403 && status !== 404) {
        try { console.warn("[DEV-FRESH] status failed", err); } catch (_) {}
      }
    }
    render();
    return S;
  }

  async function run(kind) {
    if (S.busy) return;
    var path = kind === "on" ? "/dev/fresh/on" : kind === "off" ? "/dev/fresh/off" : "/dev/fresh/reset";
    if (kind === "on" && !global.confirm("Switch gameplay to an isolated DEV FRESH profile? Your real player record will not be changed.")) return;
    if (kind === "reset" && !global.confirm("Reset ONLY the isolated DEV FRESH profile? Your real player record will not be changed.")) return;
    S.busy = true;
    render();
    try {
      var out = await call(path);
      if (!out || out.ok === false) throw Object.assign(new Error((out && out.reason) || "DEV_FRESH_FAIL"), { data: out });
      global.FirstSessionSpine?.setProfile(kind !== "off");
      if (kind === "reset") clearFirstSessionLocal();
      try { global.location.reload(); } catch (_) { S.active = kind !== "off"; S.busy = false; render(); }
    } catch (err) {
      S.busy = false;
      render();
      try { global.alert((err && err.data && err.data.reason) || err.message || "DEV FRESH failed"); } catch (_) {}
    }
  }

  function bind() {
    var el = rootEl();
    if (el.__ahDevFreshBound) return;
    el.__ahDevFreshBound = true;
    el.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button[data-kind]") : null;
      if (!btn || btn.disabled) return;
      var kind = btn.getAttribute("data-kind");
      if (kind === "toggle") {
        S.expanded = !S.expanded;
        render();
        return;
      }
      if (kind === "diagnose") { void diagnoseFirstSignal(); return; }
      if (kind === "dock") {
        S.dock = S.dock === "top" ? "bottom" : "top";
        S.expanded = false;
        try { global.localStorage.setItem(DOCK_KEY, S.dock); } catch (_) {}
        render();
        return;
      }
      run(kind);
    });
  }

  function init(deps) {
    deps = deps || {};
    if (typeof deps.apiPost === "function") S.apiPost = deps.apiPost;
    ensureStyles();
    bind();
    render();
    refresh();
    return API;
  }

  var API = {
    init: init,
    refresh: refresh,
    isActive: function () { return !!S.active; },
    isEligible: function () { return !!S.eligible; }
  };

  global.DevFresh = API;

  function boot() {
    if (global.__devFreshInited) return;
    function start(fn) {
      if (global.__devFreshInited) return;
      global.__devFreshInited = true;
      init({ apiPost: fn || global.apiPost });
    }
    if (typeof global.apiPost === "function") {
      start(global.apiPost);
      return;
    }
    if (typeof global.waitForApiPostReady === "function") {
      global.waitForApiPostReady(6000).then(start).catch(function () { start(global.apiPost); });
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { start(global.apiPost); }, { once: true });
    } else {
      setTimeout(function () { start(global.apiPost); }, 0);
    }
  }

  boot();
})(window);
