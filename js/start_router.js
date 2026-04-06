(function initAHStartRouter(global) {
  "use strict";

  if (global.__ahStartRouterLoaded) return;
  global.__ahStartRouterLoaded = true;

  var state = {
    consumed: false,
    pendingParam: "",
    running: false,
    timerId: 0
  };
  var STARTAPP_ROUTES = global.AH_STARTAPP_ROUTES || {
    map: "map",
    bloodmoon: "bloodmoon",
    support: "support",
    mailbox: "mailbox",
    profile: "profile",
    referral: "referral"
  };

  function dbgWarn(msg, extra) {
    if (!global.DBG) return;
    try { console.warn("[start-router]", msg, extra || ""); } catch (_) {}
  }

  function normalizeStartParam(raw) {
    var text = String(raw == null ? "" : raw);
    try { text = decodeURIComponent(text); } catch (_) {}
    text = text.trim().toLowerCase();
    if (!text) return "";

    var match = text.match(/[a-z0-9_-]+/);
    return match ? match[0] : "";
  }

  function readQueryParam(name) {
    try {
      return new URLSearchParams(global.location.search || "").get(name) || "";
    } catch (_) {
      return "";
    }
  }

  function readHashParam(name) {
    try {
      var hash = String(global.location.hash || "");
      if (!hash) return "";

      var searchLike = hash;
      var qIndex = hash.indexOf("?");
      if (qIndex >= 0) searchLike = hash.slice(qIndex + 1);
      else if (searchLike.charAt(0) === "#") searchLike = searchLike.slice(1);

      return new URLSearchParams(searchLike).get(name) || "";
    } catch (_) {
      return "";
    }
  }

  function getTelegramStartParam() {
    var fromInit = "";
    try {
      fromInit = global.Telegram?.WebApp?.initDataUnsafe?.start_param || "";
    } catch (_) {}

    var p1 = normalizeStartParam(fromInit);
    if (p1) return p1;

    var p2 = normalizeStartParam(readQueryParam("tgWebAppStartParam"));
    if (p2) return p2;

    var p3 = normalizeStartParam(readQueryParam("startapp"));
    if (p3) return p3;

    var p4 = normalizeStartParam(readHashParam("tgWebAppStartParam"));
    if (p4) return p4;

    return "";
  }

  function consumeTelegramStartRoute() {
    if (global.__AH_STARTAPP_ROUTED__) return "";
    if (!state.consumed) {
      state.pendingParam = getTelegramStartParam();
      state.consumed = true;
    }
    return state.pendingParam || "";
  }

  function isVisible(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    try {
      var disp = el.style.display || global.getComputedStyle?.(el)?.display || "";
      return disp !== "none";
    } catch (_) {
      return false;
    }
  }

  function clickSel(selector) {
    try {
      var el = document.querySelector(selector);
      if (!el) return false;
      el.click();
      return true;
    } catch (_) {
      return false;
    }
  }

  async function callMaybeOpen(target, fnName) {
    var fn = target && typeof target[fnName] === "function" ? target[fnName] : null;
    if (!fn) return false;
    try {
      var out = await Promise.resolve(fn.call(target));
      return out !== false;
    } catch (_) {
      return false;
    }
  }

  function getApiPost() {
    return global.apiPost || global.S?.apiPost || global.AH?.apiPost || null;
  }

  async function openMapRoute() {
    try { global.requestTelegramFullscreen?.(); } catch (_) {}
    if (!clickSel(".btn.map")) return false;
    return isVisible("mapBack");
  }

  async function openBloodMoonRoute() {
    try { global.requestTelegramFullscreen?.(); } catch (_) {}

    if (await callMaybeOpen(global.BloodMoon, "open")) {
      if (isVisible("bloodMoonBack")) return true;
      return true;
    }

    var ensure = global.ensureBloodMoonLoaded;
    var apiPost = getApiPost();
    var tg = global.Telegram?.WebApp || global.tg || null;
    if (typeof ensure === "function" && typeof apiPost === "function") {
      try { await Promise.resolve(ensure(apiPost, tg, !!global.DBG)); } catch (_) {}
      if (await callMaybeOpen(global.BloodMoon, "open")) return true;
    }
    return false;
  }

  async function openSupportRoute() {
    if (await callMaybeOpen(global.Support, "open")) {
      if (isVisible("supportBack")) return true;
      return true;
    }
    if (clickSel('.ah-tile[data-action="support"]')) return isVisible("supportBack");
    return false;
  }

  async function openMailboxRoute() {
    if (await callMaybeOpen(global.Mailbox, "open")) {
      if (isVisible("mailboxBack")) return true;
      return true;
    }
    if (clickSel('.ah-tile[data-action="mailbox"]')) return isVisible("mailboxBack");
    return false;
  }

  async function openProfileRoute() {
    if (await callMaybeOpen(global.Equipped, "open")) {
      if (document.getElementById("equipped-root")) return true;
      return true;
    }
    if (clickSel("#heroProfileBtn")) {
      return !!document.getElementById("equipped-root");
    }
    if (clickSel(".btn.equipped")) {
      return !!document.getElementById("equipped-root");
    }
    return false;
  }

  async function openReferralRoute() {
    if (await callMaybeOpen(global.Referrals, "open")) {
      if (document.querySelector(".ah-ref-backdrop")) return true;
      return true;
    }

    var ensure = global.ensureReferralsLoaded;
    var apiPost = getApiPost();
    var tg = global.Telegram?.WebApp || global.tg || null;
    if (typeof ensure === "function" && typeof apiPost === "function") {
      try { await Promise.resolve(ensure(apiPost, tg, !!global.DBG)); } catch (_) {}
      if (await callMaybeOpen(global.Referrals, "open")) return true;
    }

    if (clickSel('.ah-tile[data-action="referrals"]')) {
      return !!document.querySelector(".ah-ref-backdrop");
    }
    if (clickSel(".btn.referral")) {
      return !!document.querySelector(".ah-ref-backdrop");
    }
    return false;
  }

  var ROUTE_HANDLERS = {};
  ROUTE_HANDLERS[String(STARTAPP_ROUTES.map || "map")] = openMapRoute;
  ROUTE_HANDLERS[String(STARTAPP_ROUTES.bloodmoon || "bloodmoon")] = openBloodMoonRoute;
  ROUTE_HANDLERS[String(STARTAPP_ROUTES.support || "support")] = openSupportRoute;
  ROUTE_HANDLERS[String(STARTAPP_ROUTES.mailbox || "mailbox")] = openMailboxRoute;
  ROUTE_HANDLERS[String(STARTAPP_ROUTES.profile || "profile")] = openProfileRoute;
  ROUTE_HANDLERS[String(STARTAPP_ROUTES.referral || "referral")] = openReferralRoute;
  ROUTE_HANDLERS.referrals = openReferralRoute;

  function clearTimer() {
    if (!state.timerId) return;
    try { clearTimeout(state.timerId); } catch (_) {}
    state.timerId = 0;
  }

  function routeTelegramStartParam(options) {
    if (global.__AH_STARTAPP_ROUTED__ || state.running) return false;

    var param = consumeTelegramStartRoute();
    if (!param) return false;

    var handler = ROUTE_HANDLERS[param];
    if (typeof handler !== "function") {
      global.__AH_STARTAPP_ROUTED__ = true;
      dbgWarn("Unsupported startapp param", param);
      return false;
    }

    var maxAttempts = Number(options?.maxAttempts);
    if (!Number.isFinite(maxAttempts) || maxAttempts < 1) maxAttempts = 24;
    maxAttempts = Math.min(Math.max(1, maxAttempts), 40);

    var delayMs = Number(options?.delayMs);
    if (!Number.isFinite(delayMs) || delayMs < 80) delayMs = 180;
    delayMs = Math.min(Math.max(80, delayMs), 800);

    var initialDelayMs = Number(options?.initialDelayMs);
    if (!Number.isFinite(initialDelayMs) || initialDelayMs < 0) initialDelayMs = 120;
    initialDelayMs = Math.min(Math.max(0, initialDelayMs), 2000);

    state.running = true;
    var attempt = 0;

    var runAttempt = function runAttempt() {
      if (global.__AH_STARTAPP_ROUTED__) {
        state.running = false;
        clearTimer();
        return;
      }

      attempt += 1;
      Promise.resolve(handler())
        .then(function onResult(ok) {
          if (ok) {
            global.__AH_STARTAPP_ROUTED__ = true;
            state.running = false;
            clearTimer();
            return;
          }

          if (attempt >= maxAttempts) {
            global.__AH_STARTAPP_ROUTED__ = true;
            state.running = false;
            clearTimer();
            dbgWarn("Startapp route not opened in retry window", { param: param, attempts: attempt });
            return;
          }

          state.timerId = setTimeout(runAttempt, delayMs);
        })
        .catch(function onError(err) {
          if (attempt >= maxAttempts) {
            global.__AH_STARTAPP_ROUTED__ = true;
            state.running = false;
            clearTimer();
            dbgWarn("Startapp route failed", err);
            return;
          }
          state.timerId = setTimeout(runAttempt, delayMs);
        });
    };

    clearTimer();
    state.timerId = setTimeout(runAttempt, initialDelayMs);
    return true;
  }

  global.normalizeStartParam = normalizeStartParam;
  global.getTelegramStartParam = getTelegramStartParam;
  global.consumeTelegramStartRoute = consumeTelegramStartRoute;
  global.routeTelegramStartParam = routeTelegramStartParam;
})(window);
