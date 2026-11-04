/* Alpha Husky — opt-in browser guest entry V1.
 * Android/Telegram are intentionally untouched. Never auto-create accounts.
 * Browser guest tokens live only in sessionStorage (no persistent bearer in localStorage).
 */
(function browserGuestEntryV1(global) {
  "use strict";
  if (global.AlphaBrowserGuestV1) return;

  var STORAGE_KEY = "ah.browser.guest.v1";
  var ROOT_ID = "ah-browser-guest-v1";
  var originHost = String(global.location && global.location.hostname || "").toLowerCase();
  var params = new URLSearchParams(global.location && global.location.search || "");
  var requested = params.get("browser_guest") === "1";
  var approvedHost = originHost === "app.alphahusky.win" || originHost.endsWith(".vercel.app");
  var nativeRuntime = Boolean(
    global.Capacitor && (
      (typeof global.Capacitor.isNativePlatform === "function" && global.Capacitor.isNativePlatform()) ||
      global.Capacitor.platform === "android" || global.Capacitor.platform === "ios"
    )
  ) || Boolean(global.AlphaHuskyCapp && global.AlphaHuskyCapp.isPackagedRuntime && global.AlphaHuskyCapp.isPackagedRuntime());
  var tgInitData = String(global.Telegram && global.Telegram.WebApp && global.Telegram.WebApp.initData || "");
  var active = requested && approvedHost && !nativeRuntime && !tgInitData;
  var token = "";
  var expiresAt = 0;
  var persisted = false;
  var busy = false;
  var pendingRecovery = "";

  function stored() {
    try {
      return JSON.parse(global.sessionStorage.getItem(STORAGE_KEY) || "null");
    } catch (_) { return null; }
  }

  function clear() {
    try { global.sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
    token = "";
    expiresAt = 0;
    persisted = false;
    if (active) global.__ahAlphaAccountSession = null;
  }

  function hydrate() {
    if (!active) return;
    var state = stored();
    if (!state || !state.token || !Number.isFinite(Number(state.expiresAt)) || Date.now() >= Number(state.expiresAt) - 30000) {
      clear();
      return;
    }
    token = String(state.token);
    expiresAt = Number(state.expiresAt);
    persisted = true;
    global.__ahAlphaAccountSession = { sessionToken: token };
  }

  function holdBoot() {
    return active && !persisted;
  }

  function el(tag, attrs, text) {
    var n = global.document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) { n.setAttribute(key, attrs[key]); });
    if (text != null) n.textContent = text;
    return n;
  }

  function render() {
    if (!active || !global.document || !global.document.body) return;
    var old = global.document.getElementById(ROOT_ID);
    if (old) old.remove();
    if (token && !pendingRecovery) return;

    var overlay = el("div", { id: ROOT_ID, role: "dialog", "aria-modal": "true", "aria-label": "Alpha Husky browser guest entry" });
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:18px;background:rgba(2,6,12,.97);color:#ecf4ff;font:15px/1.5 system-ui,sans-serif";
    var panel = el("div", {});
    panel.style.cssText = "width:min(100%,430px);border:1px solid #38516e;border-radius:18px;padding:24px;background:#0b1522;box-shadow:0 24px 60px #000a";
    var title = el("h1", {}, "ALPHA HUSKY");
    title.style.cssText = "margin:0 0 10px;font-size:25px;letter-spacing:.08em";
    panel.appendChild(title);
    panel.appendChild(el("p", {}, pendingRecovery
      ? "Your guest has been created. Save this one-time recovery code before continuing. Anyone holding this code may be able to recover your account."
      : "Play in your browser without Telegram or a wallet. Guest access is currently an opt-in test."));
    var status = el("p", { role: "status", "aria-live": "polite" }, "");
    status.style.cssText = "min-height:22px;color:#b8cbe0;font-size:13px";
    var action = el("button", { type: "button" }, pendingRecovery ? "Copy recovery code" : "Play as Guest");
    action.style.cssText = "width:100%;border:1px solid #6ca8c8;border-radius:10px;background:#164764;color:white;padding:13px;cursor:pointer;font-size:15px;font-weight:700";
    if (pendingRecovery) {
      var code = el("code", {}, pendingRecovery);
      code.style.cssText = "display:block;word-break:break-all;padding:10px;background:#06101c;border-radius:8px;user-select:all";
      panel.appendChild(code);
      action.addEventListener("click", function () {
        if (!global.navigator || !global.navigator.clipboard || !global.navigator.clipboard.writeText) {
          status.textContent = "Select and copy the code above manually.";
          return;
        }
        global.navigator.clipboard.writeText(pendingRecovery).then(function () {
          status.textContent = "Recovery code copied.";
        }).catch(function () {
          status.textContent = "Select and copy the code above manually.";
        });
      });
      var continueButton = el("button", { type: "button" }, "I saved the code — enter game");
      continueButton.style.cssText = "width:100%;margin-top:10px;border:1px solid #718299;border-radius:10px;background:#203046;color:white;padding:12px;cursor:pointer";
      continueButton.disabled = !persisted;
      if (!persisted) {
        status.textContent = "Browser storage is blocked. Save the recovery code and enable storage to keep your account.";
        var retry = el("button", { type: "button" }, "Retry saving session");
        retry.style.cssText = continueButton.style.cssText;
        retry.addEventListener("click", function () {
          try {
            global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token, expiresAt: expiresAt }));
            persisted = true;
            render();
          } catch (_) { status.textContent = "Storage still blocked. Keep your recovery code safe."; }
        });
        panel.appendChild(retry);
      }
      continueButton.addEventListener("click", function () {
        if (!persisted) return;
        pendingRecovery = "";
        render();
        global.dispatchEvent(new Event("ah:browser-guest-ready"));
      });
      panel.appendChild(action);
      panel.appendChild(continueButton);
    } else {
      action.addEventListener("click", async function () {
        if (busy) return;
        busy = true;
        action.disabled = true;
        status.textContent = "Creating your guest account…";
        try {
          var base = String(global.API_BASE || "https://api.alphahusky.win").replace(/\/$/, "");
          var response = await global.fetch(base + "/mobile/auth/start-new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
            credentials: "omit",
            cache: "no-store"
          });
          var body = await response.json();
          if (!response.ok || body.ok !== true || !body.session_token || !body.guest_recovery_token || !Number.isFinite(Number(body.expires_in)) || Number(body.expires_in) <= 0) {
            throw new Error(String(body.reason || "Guest entry could not be completed."));
          }
          token = String(body.session_token);
          expiresAt = Date.now() + Number(body.expires_in) * 1000;
          global.__ahAlphaAccountSession = { sessionToken: token };
          pendingRecovery = String(body.guest_recovery_token);
          try {
            global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token, expiresAt: expiresAt }));
            persisted = true;
          } catch (_) {
            persisted = false;
          }
          render();
        } catch (err) {
          status.textContent = "Could not start: " + String(err && err.message || "connection error");
        } finally {
          busy = false;
          action.disabled = false;
        }
      });
      panel.appendChild(action);
    }
    panel.appendChild(status);
    overlay.appendChild(panel);
    global.document.body.appendChild(overlay);
  }

  hydrate();
  global.AlphaBrowserGuestV1 = Object.freeze({
    active: active,
    shouldHoldBoot: holdBoot,
    render: render,
    hasSession: function () { return Boolean(token && persisted); },
    clear: clear
  });
  if (active) {
    if (global.document.readyState === "loading") {
      global.document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }
})(window);
