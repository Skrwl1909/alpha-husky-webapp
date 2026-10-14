// Level-Up Reward Moment V2: display only. XP/level/stat allocation remain server-owned.
(function (global) {
  "use strict";
  const PREFIX = "ah.levelup.reward.v2:";
  const NODE_ID = "ahLevelUpReward";
  const STYLE_ID = "ahLevelUpRewardStyle";
  const state = { scope: "", known: null, pending: null, presentTimer: 0, refreshTimer: 0, retryTimer: 0 };

  const levelOf = (profile) => {
    const raw = profile?.level ?? profile?.stats?.level;
    const n = Number(raw);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  };
  function scopeOf(profile) {
    const uid = [profile?.uid, profile?.user_id, profile?.id, profile?.player_id,
      global.__PROFILE__?.uid, global.Telegram?.WebApp?.initDataUnsafe?.user?.id]
      .map(v => String(v ?? "").trim()).find(v => v && v !== "0");
    if (!uid) return "";
    // The identifier is a local dedupe namespace, not an authorization check.
    const fresh = global.DevFresh?.isActive?.() === true ? "fresh" : "player";
    return PREFIX + fresh + ":" + encodeURIComponent(uid);
  }
  function read(scope) {
    try {
      const raw = global.localStorage?.getItem(scope);
      if (raw == null) return null;
      return levelOf({ level: Number(raw) });
    } catch (_) { return null; }
  }
  function write(scope, level) {
    try { global.localStorage?.setItem(scope, String(level)); } catch (_) {}
  }
  function removeMoment() {
    const el = global.document?.getElementById(NODE_ID);
    el?.remove?.();
  }
  function safeToPresent() {
    const doc = global.document;
    if (!doc?.body || doc.visibilityState === "hidden") return false;
    if (doc.querySelector('#tacticalOpsRoot[data-open="1"]')) return false;
    if (doc.getElementById("fieldRecordActivationBack")) return false;
    if (doc.body.classList?.contains("ah-awakening-open")
        || doc.body.classList?.contains("ah-oath-open")) return false;
    return true;
  }
  function ensureStyle() {
    const doc = global.document;
    if (!doc?.head || doc.getElementById(STYLE_ID)) return;
    const css = doc.createElement("style");
    css.id = STYLE_ID;
    css.textContent = [
      "#"+NODE_ID+"{position:fixed;left:50%;bottom:calc(78px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483645;width:min(420px,calc(100vw - 28px));padding:19px 18px 15px;box-sizing:border-box;text-align:center;color:#eff8ff;border:1px solid rgba(164,222,255,.42);border-radius:18px;background:radial-gradient(ellipse at 50% -20%,rgba(80,180,230,.32),transparent 66%),linear-gradient(180deg,#142234,#080f1c);box-shadow:0 24px 70px #000a,0 0 28px #75c9ff25;font-family:system-ui,sans-serif}",
      "#"+NODE_ID+" .ah-lu-kicker{font:900 11px/1.4 system-ui;letter-spacing:.18em;color:#a5ddff}",
      "#"+NODE_ID+" .ah-lu-title{margin:5px 0;font:950 clamp(25px,6vw,36px)/1.1 system-ui;letter-spacing:.06em}",
      "#"+NODE_ID+" .ah-lu-reward{margin:8px 0 3px;color:#b8f0d9;font-size:19px;font-weight:900}",
      "#"+NODE_ID+" .ah-lu-note{font-size:12px;color:#c1d0e0;line-height:1.5}",
      "#"+NODE_ID+" .ah-lu-actions{display:flex;gap:9px;margin-top:15px}",
      "#"+NODE_ID+" .ah-lu-actions button{flex:1;min-height:45px;padding:8px 12px;border-radius:10px;border:1px solid #8ad5ff55;color:#f0f8ff;background:#285878;font:850 12px system-ui;cursor:pointer}",
      "#"+NODE_ID+" .ah-lu-actions button[data-lu-later]{background:#172637;border-color:#ffffff25}",
      "@media(prefers-reduced-motion:reduce){#"+NODE_ID+"{scroll-behavior:auto}}"
    ].join("");
    doc.head.appendChild(css);
  }
  function present() {
    state.presentTimer = 0;
    const pending = state.pending;
    if (!pending) return;
    if (!safeToPresent()) {
      schedulePresent(1200);
      return;
    }
    const doc = global.document;
    ensureStyle();
    removeMoment();
    const el = doc.createElement("aside");
    el.id = NODE_ID;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    const earned = pending.to - pending.from;
    el.innerHTML = '<div class="ah-lu-kicker">YOUR PROGRESS IS RECORDED</div>'
      + '<div class="ah-lu-title">LEVEL UP!</div>'
      + '<div class="ah-lu-note">LEVEL ' + pending.from + ' → ' + pending.to + '</div>'
      + '<div class="ah-lu-reward">+' + earned + ' STAT POINT' + (earned === 1 ? '' : 'S') + ' EARNED</div>'
      + '<div class="ah-lu-note">Where you invest them is your choice.</div>'
      + '<div class="ah-lu-actions"><button type="button" data-lu-build>OPEN BUILD</button>'
      + '<button type="button" data-lu-later>CONTINUE</button></div>';
    el.querySelector("[data-lu-build]")?.addEventListener("click", function () {
      if (global.HomeNav?.openBuild?.() !== true) return;
      removeMoment();
    });
    el.querySelector("[data-lu-later]")?.addEventListener("click", removeMoment);
    doc.body.appendChild(el);
    // A displayed event is consumed. A later real level increase can create a new event.
    write(pending.scope, pending.to);
    state.known = pending.to;
    state.pending = null;
    try { global.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
  }
  function schedulePresent(delay = 350) {
    if (state.presentTimer || !state.pending) return;
    state.presentTimer = global.setTimeout(present, delay);
  }
  function onProfile(profile) {
    const next = levelOf(profile);
    const scope = scopeOf(profile);
    if (!next || !scope) return false;
    if (state.scope !== scope) {
      state.scope = scope;
      state.known = read(scope);
      state.pending = null;
      removeMoment();
    }
    if (state.known == null || next < state.known) {
      // First sight and isolated profile resets are baselines, not rewards.
      state.known = next;
      write(scope, next);
      return false;
    }
    if (next <= state.known) return false;
    const from = state.pending?.scope === scope ? state.pending.from : state.known;
    state.pending = { scope, from, to: next };
    schedulePresent();
    return true;
  }
  function refreshProfile() {
    if (typeof global.loadProfile === "function") {
      try { Promise.resolve(global.loadProfile()).catch(() => {}); } catch (_) {}
    }
  }
  function onActionSuccess(path) {
    const p = String(path || "").split("?")[0];
    if (!p.startsWith("/webapp/") || /\/(?:state|status|profile|inspect|preview|list)$/.test(p)
      || /^\/webapp\/(?:share|echo|support|wallet|mobile|dev|auth)\//.test(p)) return;
    if (state.refreshTimer) global.clearTimeout(state.refreshTimer);
    if (state.retryTimer) global.clearTimeout(state.retryTimer);
    state.refreshTimer = global.setTimeout(() => { state.refreshTimer = 0; refreshProfile(); }, 800);
    // Bounded consistency recheck for progression sources only; no continuous polling.
    if (/^\/webapp\/(?:missions|quests|daily|tactical|moonlab|bloodmoon|arena|teamup|siege|campaign|combat|tower|field-ops)\//.test(p)) {
      state.retryTimer = global.setTimeout(() => { state.retryTimer = 0; refreshProfile(); }, 2900);
    }
  }
  try {
    global.document?.addEventListener("visibilitychange", () => { if (state.pending) schedulePresent(0); });
    global.addEventListener?.("pageshow", () => { if (state.pending) schedulePresent(0); });
  } catch (_) {}
  global.LevelUpMonitorV2 = { onProfile, onActionSuccess };
})(window);
