// js/dev_fresh.js — owner-only DEV FRESH PROFILE indicator + On/Reset/Off
(function (global) {
  "use strict";

  var ROOT_ID = "ahDevFreshRoot";
  var STYLE_ID = "ah-dev-fresh-css";
  var LS_KEYS = ["ah_onboarding_v", "ah_origin_mark", "ah_faction"];

  var S = {
    apiPost: null,
    eligible: false,
    active: false,
    busy: false,
    loaded: false
  };

  function apiPost() {
    return S.apiPost || global.apiPost || global.apiPostRaw || null;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#ahDevFreshRoot{position:fixed;left:8px;right:8px;top:max(8px,var(--ah-inset-top,env(safe-area-inset-top,0px)));z-index:46;pointer-events:none;display:none;}",
      "#ahDevFreshRoot[data-show='1']{display:block;}",
      ".ah-devfresh{pointer-events:auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 8px;border:1px solid rgba(255,196,72,.55);background:rgba(18,12,4,.92);color:#ffe7b0;border-radius:8px;font:600 11px/1.2 ui-sans-serif,system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 8px 24px rgba(0,0,0,.45);}",
      ".ah-devfresh[data-active='1']{border-color:#ffb020;background:rgba(48,24,0,.94);color:#fff3d0;}",
      ".ah-devfresh-mark{display:inline-flex;align-items:center;gap:6px;text-transform:uppercase;}",
      ".ah-devfresh-dot{width:8px;height:8px;border-radius:50%;background:#8a7a55;box-shadow:0 0 0 2px rgba(255,176,32,.15);}",
      ".ah-devfresh[data-active='1'] .ah-devfresh-dot{background:#ffb020;box-shadow:0 0 10px #ffb020;}",
      ".ah-devfresh-actions{margin-left:auto;display:flex;gap:6px;}",
      ".ah-devfresh button{appearance:none;border:1px solid rgba(255,196,72,.45);background:rgba(255,255,255,.06);color:inherit;font:700 10px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:6px 8px;border-radius:6px;cursor:pointer;}",
      ".ah-devfresh button[disabled]{opacity:.45;cursor:default;}",
      ".ah-devfresh button[data-kind='off']{border-color:rgba(255,255,255,.2);}",
      ".ah-devfresh-note{flex-basis:100%;font:500 10px/1.3 ui-sans-serif,system-ui,sans-serif;color:#d7c39a;letter-spacing:0;text-transform:none;}"
    ].join("");
    document.head.appendChild(style);
  }

  function clearFirstSessionLocal() {
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
    try {
      if (S.active) document.body.setAttribute("data-dev-fresh", "1");
      else document.body.removeAttribute("data-dev-fresh");
    } catch (_) {}
    var note = S.active
      ? "Isolated fresh test profile. Real Telegram account is untouched. Economy writes are blocked."
      : "Owner-only. Turns gameplay onto an isolated fresh profile without resetting the real account.";
    el.innerHTML =
      '<div class="ah-devfresh" data-active="' + (S.active ? "1" : "0") + '">' +
        '<span class="ah-devfresh-mark"><span class="ah-devfresh-dot"></span>DEV FRESH PROFILE</span>' +
        '<span>' + (S.active ? "ON — isolated test player" : "OFF — real player") + "</span>" +
        '<span class="ah-devfresh-actions">' +
          '<button type="button" data-kind="on"' + (S.active || S.busy ? " disabled" : "") + ">On</button>" +
          '<button type="button" data-kind="reset"' + (S.busy ? " disabled" : "") + ">Reset</button>" +
          '<button type="button" data-kind="off"' + (!S.active || S.busy ? " disabled" : "") + ">Off</button>" +
        "</span>" +
        '<span class="ah-devfresh-note">' + note + "</span>" +
      "</div>";
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
      if (kind === "on" || kind === "reset") clearFirstSessionLocal();
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
      run(btn.getAttribute("data-kind"));
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
