(function initAHStartLinks(global) {
  "use strict";

  if (global.__ahStartLinksLoaded) return;
  global.__ahStartLinksLoaded = true;

  var STARTAPP_LINK_CONFIG = Object.freeze({
    botUsername: "Alpha_husky_bot",
    miniAppShortName: "AlphaHuskyHub"
  });
  var STARTAPP_ROUTES = Object.freeze({
    map: "map",
    bloodmoon: "bloodmoon",
    support: "support",
    mailbox: "mailbox",
    profile: "profile",
    referral: "referral"
  });

  var state = {
    bound: false
  };

  function normalizeBotUsername(raw) {
    var text = String(raw || "").trim();
    if (!text) return "";
    if (text.charAt(0) === "@") text = text.slice(1);
    text = text.replace(/[^a-zA-Z0-9_]/g, "");
    return text;
  }

  function getTelegramBotUsername() {
    var fromGlobal =
      global.AH_TELEGRAM_BOT_USERNAME ||
      global.AH_BOT_USERNAME ||
      global.AH_STARTAPP_CONFIG?.botUsername ||
      global.BOT_USERNAME ||
      "";

    var normalized = normalizeBotUsername(fromGlobal || STARTAPP_LINK_CONFIG.botUsername);
    return normalized || "";
  }

  function normalizeMiniAppShortName(raw) {
    var text = String(raw || "").trim();
    if (!text) return "";
    text = text.replace(/[^a-zA-Z0-9_]/g, "");
    return text;
  }

  function getTelegramMiniAppShortName() {
    var fromGlobal =
      global.AH_TELEGRAM_MINI_APP_SHORT_NAME ||
      global.AH_MINI_APP_SHORT_NAME ||
      global.AH_STARTAPP_CONFIG?.miniAppShortName ||
      "";

    var normalized = normalizeMiniAppShortName(fromGlobal || STARTAPP_LINK_CONFIG.miniAppShortName);
    return normalized || "";
  }

  function resolveStartRoute(route) {
    var key = String(route || "").trim().toLowerCase();
    if (!key) return "";
    if (STARTAPP_ROUTES[key]) return STARTAPP_ROUTES[key];
    if (key === "referrals") return STARTAPP_ROUTES.referral;

    var keys = Object.keys(STARTAPP_ROUTES);
    for (var i = 0; i < keys.length; i += 1) {
      var value = STARTAPP_ROUTES[keys[i]];
      if (value === key) return value;
    }
    return "";
  }

  function normalizeMode(raw) {
    var mode = String(raw || "").trim().toLowerCase();
    if (mode === "compact" || mode === "fullscreen") return mode;
    return "";
  }

  function buildTelegramStartAppLink(route, options) {
    var routeValue = resolveStartRoute(route);
    if (!routeValue) return "";

    var botUsername = normalizeBotUsername(options?.botUsername || getTelegramBotUsername());
    var miniAppShortName = normalizeMiniAppShortName(options?.miniAppShortName || getTelegramMiniAppShortName());
    if (!botUsername || !miniAppShortName) return "";

    var link = "https://t.me/" + botUsername + "/" + miniAppShortName + "?startapp=" + encodeURIComponent(routeValue);
    var mode = normalizeMode(options?.mode);
    if (mode) link += "&mode=" + encodeURIComponent(mode);
    return link;
  }

  function buildTelegramBotStartLink(startValue, options) {
    var botUsername = normalizeBotUsername(options?.botUsername || getTelegramBotUsername());
    var start = String(startValue || "").trim();
    if (!botUsername || !start) return "";
    return "https://t.me/" + botUsername + "?start=" + encodeURIComponent(start);
  }

  async function copyText(text) {
    var value = String(text || "");
    if (!value) return false;

    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {}

    try {
      var ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (_) {
      return false;
    }
  }

  async function copyTelegramStartAppLink(route, options) {
    var link = buildTelegramStartAppLink(route, options || {});
    if (!link) return false;
    return copyText(link);
  }

  function openTelegramStartAppLink(route, options) {
    var link = buildTelegramStartAppLink(route, options || {});
    if (!link) return false;

    var tg = global.Telegram?.WebApp || global.tg || null;
    try {
      if (typeof tg?.openTelegramLink === "function") {
        tg.openTelegramLink(link);
        return true;
      }
    } catch (_) {}
    try {
      if (typeof tg?.openLink === "function") {
        tg.openLink(link);
        return true;
      }
    } catch (_) {}
    try {
      global.open(link, "_blank", "noopener");
      return true;
    } catch (_) {
      return false;
    }
  }

  function notify(message) {
    var text = String(message || "");
    var tg = global.Telegram?.WebApp || global.tg || null;
    try {
      if (tg?.showAlert) {
        tg.showAlert(text);
        return;
      }
    } catch (_) {}
    try {
      if (typeof global.toast === "function") {
        global.toast(text);
        return;
      }
    } catch (_) {}
    try { console.log("[start-links]", text); } catch (_) {}
  }

  function prettyRoute(route) {
    var key = resolveStartRoute(route);
    if (key === STARTAPP_ROUTES.bloodmoon) return "Blood-Moon";
    if (key === STARTAPP_ROUTES.map) return "Map";
    if (key === STARTAPP_ROUTES.support) return "Support";
    if (key === STARTAPP_ROUTES.mailbox) return "Mailbox";
    if (key === STARTAPP_ROUTES.profile) return "Profile";
    if (key === STARTAPP_ROUTES.referral) return "Referral";
    return key || "StartApp";
  }

  function bindStartLinkButtons() {
    if (state.bound) return;
    state.bound = true;

    document.addEventListener("click", function onDeepLinkClick(event) {
      var button = event.target?.closest?.("[data-start-link-route]");
      if (!button) return;

      event.preventDefault();

      var route = button.getAttribute("data-start-link-route") || "";
      var mode = button.getAttribute("data-start-link-mode") || "";
      var action = String(button.getAttribute("data-start-link-action") || "copy").toLowerCase();
      var opts = mode ? { mode: mode } : {};

      if (action === "open") {
        var opened = openTelegramStartAppLink(route, opts);
        if (!opened) notify("Unable to open deep link.");
        return;
      }

      copyTelegramStartAppLink(route, opts).then(function onCopied(ok) {
        if (ok) notify(prettyRoute(route) + " deep link copied.");
        else notify("Unable to copy deep link.");
      });
    });
  }

  function AHDebugStartLinks() {
    var output = {
      map: buildTelegramStartAppLink(STARTAPP_ROUTES.map),
      bloodmoon: buildTelegramStartAppLink(STARTAPP_ROUTES.bloodmoon),
      support: buildTelegramStartAppLink(STARTAPP_ROUTES.support)
    };
    try { console.table(output); } catch (_) {
      try { console.log("[AHDebugStartLinks]", output); } catch (_) {}
    }
    return output;
  }

  global.AH_STARTAPP_ROUTES = STARTAPP_ROUTES;
  global.AH_STARTAPP_CONFIG = STARTAPP_LINK_CONFIG;
  global.AH_TELEGRAM_BOT_USERNAME = getTelegramBotUsername();
  global.AH_TELEGRAM_MINI_APP_SHORT_NAME = getTelegramMiniAppShortName();
  global.getTelegramBotUsername = getTelegramBotUsername;
  global.getTelegramMiniAppShortName = getTelegramMiniAppShortName;
  global.buildTelegramStartAppLink = buildTelegramStartAppLink;
  global.buildTelegramBotStartLink = buildTelegramBotStartLink;
  global.copyTelegramStartAppLink = copyTelegramStartAppLink;
  global.openTelegramStartAppLink = openTelegramStartAppLink;
  global.AHDebugStartLinks = AHDebugStartLinks;
  global.AHStartLinks = {
    config: STARTAPP_LINK_CONFIG,
    routes: STARTAPP_ROUTES,
    getBotUsername: getTelegramBotUsername,
    getMiniAppShortName: getTelegramMiniAppShortName,
    build: buildTelegramStartAppLink,
    buildBotStart: buildTelegramBotStartLink,
    copy: copyTelegramStartAppLink,
    open: openTelegramStartAppLink,
    debug: AHDebugStartLinks
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindStartLinkButtons, { once: true });
  } else {
    bindStartLinkButtons();
  }
})(window);
