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
  var approvedHost = originHost === "app.alphahusky.win" || originHost.endsWith(".vercel.app") || global.location.origin === "http://localhost:3000";
  var nativeRuntime = Boolean(
    global.Capacitor && (
      (typeof global.Capacitor.isNativePlatform === "function" && global.Capacitor.isNativePlatform()) ||
      global.Capacitor.platform === "android" || global.Capacitor.platform === "ios"
    )
  ) || Boolean(global.AlphaHuskyCapp && global.AlphaHuskyCapp.isPackagedRuntime && global.AlphaHuskyCapp.isPackagedRuntime());
  var tgInitData = String(global.Telegram && global.Telegram.WebApp && global.Telegram.WebApp.initData || "");
  // Preserve an opted-in browser guest across navigation to the clean home URL.
  // A stored token must still pass hydrate() expiry checks; this never creates an account.
  function hasStoredGuest() {
    try { return Boolean(global.sessionStorage.getItem(STORAGE_KEY)); } catch (_) { return false; }
  }
  var active = (requested || hasStoredGuest()) && approvedHost && !nativeRuntime && !tgInitData;
  var token = "";
  var expiresAt = 0;
  var persisted = false;
  var busy = false;
  var pendingRecovery = "";
  var recovering = false;
  var syncing = false;
  var authMode = "guest";

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
    authMode = "guest";
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
    authMode = state.authMode === "telegram-sync-code" ? "telegram-sync-code" : "guest";
    global.__ahAlphaAccountSession = { sessionToken: token };
  }

  // The original game may check FTUE before a browser guest authenticates.
  // Recheck canonical FTUE states after the guest's player profile is ready.
  async function resumeBrowserIdentity() {
    if (!active || !persisted || !token || typeof global.loadPlayerState !== "function") return;
    try {
      await global.loadPlayerState();
      if (!global.__ahLastProfilePayload) return;
      if (typeof global.Awakening?.checkState === "function") {
        await global.Awakening.checkState({ force: true });
        if (global.Awakening.isOpen?.()) return;
      }
      if (typeof global.Oath?.checkAndOpen === "function") {
        await global.Oath.checkAndOpen({ force: true });
        if (global.Oath.isOpen?.() || !global.Oath.getState?.()) return;
      }
      await global.Onboarding?.open?.(false);
    } catch (_) { /* Never fall back to creating a new account. */ }
  }

  function signalReady() {
    global.dispatchEvent(new Event("ah:browser-guest-ready"));
    void resumeBrowserIdentity();
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
    if (token && !pendingRecovery && !recovering && !syncing) return;

    var overlay = el("div", { id: ROOT_ID, role: "dialog", "aria-modal": "true", "aria-label": "Alpha Husky browser entry" });
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:18px;background:rgba(2,6,12,.97);color:#ecf4ff;font:15px/1.5 system-ui,sans-serif";
    var panel = el("div", {});
    panel.style.cssText = "width:min(100%,430px);border:1px solid #38516e;border-radius:18px;padding:24px;background:#0b1522;box-shadow:0 24px 60px #000a";
    var title = el("h1", {}, "ALPHA HUSKY");
    title.style.cssText = "margin:0 0 10px;font-size:25px;letter-spacing:.08em";
    panel.appendChild(title);
    panel.appendChild(el("p", {}, syncing
      ? "Already play on Telegram? Open your Alpha Husky Field Record in Telegram, tap Generate Browser Sync Code, and enter the one-time code here. This opens your existing character, not a new account."
      : recovering
      ? "Recover your existing guest account using the code you saved. Never share it. Recovery does not create a new account."
      : pendingRecovery
      ? "Your guest has been created. Save this one-time recovery code before continuing. Anyone holding this code may be able to recover your account."
      : "Play in your browser without Telegram or a wallet. Guest access is currently an opt-in test."));
    var status = el("p", { role: "status", "aria-live": "polite" }, "");
    status.style.cssText = "min-height:22px;color:#b8cbe0;font-size:13px";
    var action = el("button", { type: "button" }, pendingRecovery ? "Copy recovery code" : "Play as Guest");
    action.style.cssText = "width:100%;border:1px solid #6ca8c8;border-radius:10px;background:#164764;color:white;padding:13px;cursor:pointer;font-size:15px;font-weight:700";
    if (syncing) {
      var syncInput = el("input", { type: "text", autocomplete: "one-time-code", autocapitalize: "characters", spellcheck: "false", "aria-label": "Telegram Browser Sync Code", placeholder: "ABCD-EFGH", maxlength: "20" });
      syncInput.style.cssText = "width:100%;box-sizing:border-box;border:1px solid #38516e;border-radius:10px;background:#06101c;color:white;padding:13px;text-transform:uppercase";
      panel.appendChild(syncInput);
      var syncButton = el("button", { type: "button" }, "Continue Existing Player");
      syncButton.style.cssText = action.style.cssText;
      syncButton.addEventListener("click", async function () {
        if (busy) return;
        var compact = String(syncInput.value || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
        if (!/^[A-Z0-9]{8}$/.test(compact)) {
          status.textContent = "Enter the 8-character code shown in Telegram.";
          return;
        }
        busy = true;
        syncButton.disabled = true;
        status.textContent = "Checking your one-time Sync Code…";
        try {
          var base = String(global.API_BASE || "https://api.alphahusky.win").replace(/\/$/, "");
          var response = await global.fetch(base + "/mobile/auth/sync-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: compact.slice(0, 4) + "-" + compact.slice(4) }),
            credentials: "omit",
            cache: "no-store"
          });
          var body = await response.json();
          if (!response.ok || body.ok !== true || body.linkedTelegram !== true || body.authMode !== "telegram-sync-code" || !body.game_user_id || !body.session_token || !Number.isFinite(Number(body.expires_in)) || Number(body.expires_in) <= 0) {
            throw new Error(String(body.reason || "Existing player sign-in was not confirmed."));
          }
          var nextToken = String(body.session_token);
          var nextExpiry = Date.now() + Number(body.expires_in) * 1000;
          // Never expose a session or change accounts if browser persistence is blocked.
          global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, expiresAt: nextExpiry, authMode: "telegram-sync-code" }));
          token = nextToken;
          expiresAt = nextExpiry;
          persisted = true;
          authMode = "telegram-sync-code";
          syncing = false;
          syncInput.value = "";
          global.__ahAlphaAccountSession = { sessionToken: token };
          render();
          signalReady();
        } catch (err) {
          status.textContent = "Unable to sign in: " + String(err && err.message || "connection error");
        } finally {
          busy = false;
          syncButton.disabled = false;
        }
      });
      panel.appendChild(syncButton);
      var syncBack = el("button", { type: "button" }, "Back to browser entry");
      syncBack.style.cssText = "width:100%;margin-top:10px;border:1px solid #718299;border-radius:10px;background:#203046;color:white;padding:12px;cursor:pointer";
      syncBack.addEventListener("click", function () { if (!busy) { syncing = false; syncInput.value = ""; render(); } });
      panel.appendChild(syncBack);
    } else if (recovering) {
      var input = el("input", { type: "password", autocomplete: "off", autocapitalize: "none", spellcheck: "false", "aria-label": "Guest recovery code", placeholder: "Paste your saved recovery code" });
      input.style.cssText = "width:100%;box-sizing:border-box;border:1px solid #38516e;border-radius:10px;background:#06101c;color:white;padding:13px";
      panel.appendChild(input);
      var recoverButton = el("button", { type: "button" }, "Recover existing account");
      recoverButton.style.cssText = "width:100%;margin-top:10px;border:1px solid #6ca8c8;border-radius:10px;background:#164764;color:white;padding:13px;cursor:pointer";
      recoverButton.addEventListener("click", async function () {
        if (busy) return;
        var secret = String(input.value || "").trim();
        if (secret.length < 40 || secret.length > 256) {
          status.textContent = "Enter your valid recovery code (40-256 characters).";
          return;
        }
        busy = true;
        recoverButton.disabled = true;
        status.textContent = "Recovering your existing guest account…";
        try {
          var base = String(global.API_BASE || "https://api.alphahusky.win").replace(/\/$/, "");
          var response = await global.fetch(base + "/mobile/auth/recover-guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guest_recovery_token: secret }),
            credentials: "omit",
            cache: "no-store"
          });
          var body = await response.json();
          if (!response.ok || body.ok !== true || !body.session_token || !Number.isFinite(Number(body.expires_in)) || Number(body.expires_in) <= 0) {
            throw new Error(String(body.reason || "Guest recovery failed."));
          }
          var nextToken = String(body.session_token);
          var nextExpiry = Date.now() + Number(body.expires_in) * 1000;
          // Do not expose access token to gameplay until persistence succeeds.
          try {
            global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, expiresAt: nextExpiry }));
          } catch (_) {
            throw new Error("Browser storage is blocked. Keep your recovery code and enable storage before retrying.");
          }
          token = nextToken;
          expiresAt = nextExpiry;
          persisted = true;
          recovering = false;
          authMode = "guest";
          input.value = "";
          global.__ahAlphaAccountSession = { sessionToken: token };
          render();
          signalReady();
        } catch (err) {
          status.textContent = "Unable to recover: " + String(err && err.message || "connection error");
        } finally {
          busy = false;
          recoverButton.disabled = false;
        }
      });
      panel.appendChild(recoverButton);
      var back = el("button", { type: "button" }, "Back to guest entry");
      back.style.cssText = "width:100%;margin-top:10px;border:1px solid #718299;border-radius:10px;background:#203046;color:white;padding:12px;cursor:pointer";
      back.addEventListener("click", function () {
        if (busy) return;
        recovering = false;
        input.value = "";
        render();
      });
      panel.appendChild(back);
    } else if (pendingRecovery) {
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
        global.__ahAlphaAccountSession = { sessionToken: token };
        render();
        signalReady();
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
      var recoverExistingButton = el("button", { type: "button" }, "I already have a recovery code");
      recoverExistingButton.style.cssText = "width:100%;margin-top:10px;border:1px solid #718299;border-radius:10px;background:#203046;color:white;padding:12px;cursor:pointer";
      recoverExistingButton.addEventListener("click", function () {
        if (busy) return;
        recovering = true;
        render();
      });
      panel.appendChild(recoverExistingButton);
      var syncExistingButton = el("button", { type: "button" }, "I already play on Telegram");
      syncExistingButton.style.cssText = recoverExistingButton.style.cssText;
      syncExistingButton.addEventListener("click", function () { if (!busy) { syncing = true; render(); } });
      panel.appendChild(syncExistingButton);
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
    authMode: function () { return authMode; },
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
