(function initAHTelegramShell(global) {
  "use strict";

  if (global.__ahTelegramShellLoaded) return;
  global.__ahTelegramShellLoaded = true;

  var HOME_BTN_ID = "ahAddToHomeTile";
  var STORE_ADDED_KEY = "ah_home_screen_added";
  var STORE_DISMISSED_KEY = "ah_home_screen_dismissed";

  var state = {
    initialized: false,
    eventsBound: false,
    homeButtonBound: false,
    homeStatus: ""
  };

  function debug(msg, extra) {
    if (!global.DBG) return;
    try { console.debug("[tg-shell]", msg, extra || ""); } catch (_) {}
  }

  function getWebApp() {
    return global.Telegram && global.Telegram.WebApp ? global.Telegram.WebApp : null;
  }

  function toPx(value) {
    var n = Number(value);
    if (!isFinite(n) || n < 0) n = 0;
    return n + "px";
  }

  function insetsFrom(source) {
    var src = source && typeof source === "object" ? source : {};
    return {
      top: toPx(src.top),
      bottom: toPx(src.bottom),
      left: toPx(src.left),
      right: toPx(src.right)
    };
  }

  function readInsets() {
    var tg = getWebApp();
    if (!tg) return insetsFrom(null);

    var contentInset = (tg.contentSafeAreaInset && typeof tg.contentSafeAreaInset === "object")
      ? tg.contentSafeAreaInset
      : null;
    var shellInset = (tg.safeAreaInset && typeof tg.safeAreaInset === "object")
      ? tg.safeAreaInset
      : null;

    return insetsFrom(contentInset || shellInset);
  }

  function applyRootSafeAreaVars(insets) {
    var root = document.documentElement;
    if (!root) return;
    root.style.setProperty("--ah-safe-top", insets.top);
    root.style.setProperty("--ah-safe-bottom", insets.bottom);
    root.style.setProperty("--ah-safe-left", insets.left);
    root.style.setProperty("--ah-safe-right", insets.right);
  }

  function applyTelegramSafeArea() {
    var insets = readInsets();
    applyRootSafeAreaVars(insets);
    return insets;
  }

  function getLocal(key) {
    try { return global.localStorage ? global.localStorage.getItem(key) : null; } catch (_) { return null; }
  }

  function setLocal(key, value) {
    try { if (global.localStorage) global.localStorage.setItem(key, value); } catch (_) {}
  }

  function homeBtn() {
    return document.getElementById(HOME_BTN_ID);
  }

  function setHomeButtonVisible(visible) {
    var btn = homeBtn();
    if (!btn) return;
    btn.hidden = !visible;
  }

  function setHomeButtonBusy(busy) {
    var btn = homeBtn();
    if (!btn) return;
    btn.disabled = !!busy;
    btn.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase();
  }

  function extractStatus(payload) {
    if (!payload) return "";
    if (typeof payload === "string") return payload;
    if (typeof payload.status === "string") return payload.status;
    if (typeof payload.home_screen_status === "string") return payload.home_screen_status;
    if (typeof payload.isAdded === "boolean") return payload.isAdded ? "added" : "unknown";
    return "";
  }

  function isAddedStatus(status) {
    return status === "added" || status === "already_added" || status === "already";
  }

  function isUnsupportedStatus(status) {
    return status === "unsupported" || status === "unavailable" || status === "not_supported";
  }

  function isDismissedStatus(status) {
    return status === "declined" || status === "cancelled" || status === "dismissed";
  }

  function supportsHomeScreen(tg) {
    if (!tg) return false;
    return typeof tg.checkHomeScreenStatus === "function" && typeof tg.addToHomeScreen === "function";
  }

  function shouldOfferHomeScreen(tg) {
    if (!supportsHomeScreen(tg)) return false;
    if (getLocal(STORE_ADDED_KEY) === "1") return false;
    if (getLocal(STORE_DISMISSED_KEY) === "1") return false;
    return true;
  }

  function applyHomeStatus(status) {
    var normalized = normalizeStatus(status);
    if (!normalized) return;

    state.homeStatus = normalized;

    if (isAddedStatus(normalized)) {
      setLocal(STORE_ADDED_KEY, "1");
      setHomeButtonVisible(false);
      setHomeButtonBusy(false);
      return;
    }

    if (isUnsupportedStatus(normalized)) {
      setHomeButtonVisible(false);
      setHomeButtonBusy(false);
      return;
    }

    if (isDismissedStatus(normalized)) {
      setLocal(STORE_DISMISSED_KEY, "1");
      setHomeButtonVisible(false);
      setHomeButtonBusy(false);
      return;
    }

    setHomeButtonVisible(shouldOfferHomeScreen(getWebApp()));
    setHomeButtonBusy(false);
  }

  function bindHomeButton() {
    var btn = homeBtn();
    if (!btn || state.homeButtonBound) return;

    btn.addEventListener("click", function onAddHomeClick() {
      var tg = getWebApp();
      if (!tg || typeof tg.addToHomeScreen !== "function") return;

      setHomeButtonBusy(true);
      try {
        var maybePromise = tg.addToHomeScreen(function onAddStatus(status) {
          if (status) applyHomeStatus(status);
        });
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise
            .then(function resolveStatus(status) { applyHomeStatus(status); })
            .catch(function ignoreError() {})
            .finally(function finish() { setHomeButtonBusy(false); });
        } else {
          setHomeButtonBusy(false);
        }
      } catch (_) {
        setHomeButtonBusy(false);
      }
    });

    state.homeButtonBound = true;
  }

  function maybeOfferHomeScreen() {
    var tg = getWebApp();
    bindHomeButton();

    if (!shouldOfferHomeScreen(tg)) {
      setHomeButtonVisible(false);
      return false;
    }

    setHomeButtonVisible(true);
    try {
      var maybeStatus = tg.checkHomeScreenStatus(function onCheckedStatus(status) {
        if (status) applyHomeStatus(status);
      });
      if (maybeStatus && typeof maybeStatus.then === "function") {
        maybeStatus.then(function onStatus(status) { applyHomeStatus(status); }).catch(function ignoreError() {});
      } else {
        applyHomeStatus(maybeStatus);
      }
    } catch (_) {}

    return true;
  }

  function requestTelegramFullscreen() {
    var tg = getWebApp();
    if (!tg || typeof tg.requestFullscreen !== "function") return false;

    try { tg.expand && tg.expand(); } catch (_) {}
    try {
      var maybePromise = tg.requestFullscreen();
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(function ignoreError() {});
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function exitTelegramFullscreen() {
    var tg = getWebApp();
    if (!tg || typeof tg.exitFullscreen !== "function") return false;
    try {
      var maybePromise = tg.exitFullscreen();
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(function ignoreError() {});
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function bindEvents() {
    var tg = getWebApp();
    if (!tg || state.eventsBound || typeof tg.onEvent !== "function") return;

    var refreshSafeArea = function refreshSafeArea() {
      applyTelegramSafeArea();
    };

    tg.onEvent("safeAreaChanged", refreshSafeArea);
    tg.onEvent("contentSafeAreaChanged", refreshSafeArea);
    tg.onEvent("fullscreenChanged", function onFullscreenChanged() {
      refreshSafeArea();
    });
    tg.onEvent("fullscreenFailed", function onFullscreenFailed(payload) {
      debug("fullscreenFailed", payload);
      refreshSafeArea();
    });
    tg.onEvent("homeScreenChecked", function onHomeScreenChecked(payload) {
      applyHomeStatus(extractStatus(payload));
    });
    tg.onEvent("homeScreenAdded", function onHomeScreenAdded(payload) {
      applyHomeStatus(extractStatus(payload) || "added");
    });

    state.eventsBound = true;
  }

  function initTelegramShell() {
    if (state.initialized) return state;
    state.initialized = true;

    applyTelegramSafeArea();

    var tg = getWebApp();
    if (!tg) return state;

    try { tg.ready && tg.ready(); } catch (_) {}
    try { tg.expand && tg.expand(); } catch (_) {}

    bindEvents();
    maybeOfferHomeScreen();
    return state;
  }

  global.initTelegramShell = initTelegramShell;
  global.applyTelegramSafeArea = applyTelegramSafeArea;
  global.maybeOfferHomeScreen = maybeOfferHomeScreen;
  global.requestTelegramFullscreen = requestTelegramFullscreen;
  global.exitTelegramFullscreen = exitTelegramFullscreen;
  global.AHTelegramShell = {
    init: initTelegramShell,
    applySafeArea: applyTelegramSafeArea,
    maybeOfferHomeScreen: maybeOfferHomeScreen,
    requestFullscreen: requestTelegramFullscreen,
    exitFullscreen: exitTelegramFullscreen
  };

  applyTelegramSafeArea();
})(window);
