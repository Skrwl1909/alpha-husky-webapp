(function (global) {
  "use strict";

  const S = { profile: null, state: null, saving: false, back: null };

  function profileFrom(raw) {
    if (!raw || typeof raw !== "object") return null;
    return raw.profile || raw?.data?.profile || raw?.data || raw;
  }

  function setupState(profile) {
    if (!profile || typeof profile !== "object") return null;
    const state = profile.identity_setup_v1 || profile.identitySetupV1;
    return state && typeof state === "object" ? state : null;
  }

  function isPending(state) {
    return !!(state && state.required === true && state.completed !== true);
  }

  function normalizeLocal(raw) {
    const source = String(raw ?? "");
    if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(source)) {
      return { ok: false, message: "Callsign cannot contain newlines or control characters." };
    }
    const nickname = source.trim().replace(/\s+/gu, " ");
    if (!nickname) return { ok: false, message: "Enter a callsign." };
    if (Array.from(nickname).length > 20) {
      return { ok: false, message: "Callsign must be 20 characters or fewer." };
    }
    return { ok: true, nickname };
  }

  function showError(message) {
    const el = S.back?.querySelector?.("[data-callsign-error]");
    if (!el) return;
    el.textContent = String(message || "");
    el.hidden = !message;
  }

  function setSaving(saving) {
    S.saving = !!saving;
    const button = S.back?.querySelector?.("[data-callsign-confirm]");
    const input = S.back?.querySelector?.("[data-callsign-input]");
    if (button) {
      button.disabled = S.saving;
      button.textContent = S.saving ? "SAVING…" : "CONFIRM CALLSIGN";
    }
    if (input) input.disabled = S.saving;
  }

  function close() {
    S.back?.remove?.();
    S.back = null;
    document.body?.classList?.remove("ah-callsign-open");
  }

  function ensureStyle() {
    if (document.getElementById("ah-callsign-style")) return;
    const style = document.createElement("style");
    style.id = "ah-callsign-style";
    style.textContent = `
      body.ah-callsign-open{overflow:hidden!important}
      #ahCallsignBack{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 50% 15%,rgba(32,216,255,.14),transparent 38%),rgba(2,5,10,.96);font-family:Inter,system-ui,sans-serif;color:#f5f8ff}
      #ahCallsignBack .ah-callsign-card{width:min(100%,430px);padding:26px 22px 22px;border:1px solid rgba(103,225,255,.3);border-radius:20px;background:linear-gradient(180deg,rgba(18,25,36,.98),rgba(7,10,17,.99));box-shadow:0 26px 90px rgba(0,0,0,.68),0 0 42px rgba(36,211,255,.08)}
      #ahCallsignBack .ah-callsign-kicker{margin:0 0 8px;color:#68ddff;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
      #ahCallsignBack h1{margin:0;font-size:clamp(27px,8vw,38px);line-height:1;letter-spacing:.03em;text-transform:uppercase}
      #ahCallsignBack p{margin:13px 0 20px;color:rgba(235,242,255,.7);font-size:14px;line-height:1.5}
      #ahCallsignBack label{display:block;margin:0 0 8px;color:rgba(235,242,255,.72);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
      #ahCallsignBack input{box-sizing:border-box;width:100%;height:52px;padding:0 14px;border:1px solid rgba(255,255,255,.2);border-radius:13px;outline:none;background:rgba(0,0,0,.36);color:#fff;font:700 18px/1.2 Inter,system-ui,sans-serif;letter-spacing:.02em}
      #ahCallsignBack input:focus{border-color:#68ddff;box-shadow:0 0 0 3px rgba(104,221,255,.12)}
      #ahCallsignBack .ah-callsign-error{margin:9px 2px 0;color:#ff8e8e;font-size:12px;line-height:1.4}
      #ahCallsignBack button{width:100%;height:52px;margin-top:17px;border:0;border-radius:13px;background:linear-gradient(135deg,#70e6ff,#25a9d2);color:#041018;font-size:13px;font-weight:950;letter-spacing:.11em;cursor:pointer}
      #ahCallsignBack button:disabled{cursor:wait;filter:saturate(.5);opacity:.7}
    `;
    document.head.appendChild(style);
  }

  function open() {
    if (!isPending(S.state)) return;
    try { global.Awakening?.close?.(); } catch (_) {}
    try { global.Oath?.close?.(); } catch (_) {}
    if (S.back?.isConnected) return;

    ensureStyle();
    const profile = S.profile || {};
    const current = String(profile.nickname || profile.name || profile.displayName || "").trim();
    const back = document.createElement("div");
    back.id = "ahCallsignBack";
    back.setAttribute("role", "dialog");
    back.setAttribute("aria-modal", "true");
    back.setAttribute("aria-labelledby", "ahCallsignTitle");
    back.innerHTML = `
      <section class="ah-callsign-card">
        <div class="ah-callsign-kicker">First identity</div>
        <h1 id="ahCallsignTitle">Choose your callsign</h1>
        <p>If you stay, this is the name the Pack will remember.</p>
        <label for="ahCallsignInput">Callsign</label>
        <input id="ahCallsignInput" data-callsign-input maxlength="20" autocomplete="nickname" autocapitalize="words" spellcheck="false">
        <div class="ah-callsign-error" data-callsign-error role="alert" hidden></div>
        <button type="button" data-callsign-confirm>CONFIRM CALLSIGN</button>
      </section>`;
    document.body.appendChild(back);
    document.body.classList.add("ah-callsign-open");
    S.back = back;

    const input = back.querySelector("[data-callsign-input]");
    input.value = current;
    back.querySelector("[data-callsign-confirm]").addEventListener("click", submit);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void submit();
      }
    });
    setTimeout(() => { input.focus(); input.select(); }, 0);
  }

  function hasMobileSession() {
    const token = global.__ahAlphaAccountSession?.sessionToken;
    const tgInit = global.Telegram?.WebApp?.initData;
    return !!(token && !tgInit);
  }

  function mobileBase() {
    const resolver = global.AlphaMobileEndpointResolver;
    if (resolver?.resolveLiveSyncEndpoint) return resolver.resolveLiveSyncEndpoint({});
    return String(global.API_BASE || "").replace(/\/+$/, "");
  }

  async function postMobile(path, body) {
    const token = global.__ahAlphaAccountSession?.sessionToken;
    if (!token) throw new Error("Your session is not ready. Reopen the app and try again.");
    const response = await fetch(mobileBase() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(body || {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.message || "Could not save callsign. Try again.");
      error.payload = data;
      throw error;
    }
    return data;
  }

  async function refreshProfile(mobile) {
    if (mobile) {
      const fresh = await postMobile("/mobile/profile/state", {});
      global.__ahRealProfileData = fresh;
      global.__ahLiveProfileState = fresh;
      try { global.dispatchEvent(new CustomEvent("ah:profile-data-changed")); } catch (_) {}
      return fresh;
    }
    if (typeof global.loadProfile === "function") {
      await global.loadProfile();
      return global.__ahLastProfilePayload || null;
    }
    if (typeof global.apiPost !== "function") throw new Error("Profile service is not ready.");
    return global.apiPost("/webapp/profile", {});
  }

  function paintNickname(nickname) {
    if (!nickname) return;
    try {
      global.PROFILE = global.PROFILE || {};
      global.PROFILE.nickname = nickname;
      global.setPlayerLabel?.(nickname);
    } catch (_) {}
  }

  async function submit() {
    if (S.saving || !S.back) return;
    const input = S.back.querySelector("[data-callsign-input]");
    const checked = normalizeLocal(input?.value);
    if (!checked.ok) {
      showError(checked.message);
      input?.focus?.();
      return;
    }

    showError("");
    setSaving(true);
    const mobile = hasMobileSession();
    try {
      const saved = mobile
        ? await postMobile("/mobile/profile/nickname", { nickname: checked.nickname })
        : await global.apiPost("/webapp/profile/nickname", { nickname: checked.nickname });
      if (!saved || saved.ok === false) throw new Error(saved?.message || "Could not save callsign. Try again.");

      let fresh = null;
      try { fresh = await refreshProfile(mobile); } catch (_) {}
      const authoritative = profileFrom(fresh) || saved;
      const authoritativeState = setupState(authoritative) || setupState(saved);
      if (isPending(authoritativeState)) throw new Error("Callsign is still pending. Try again.");

      paintNickname(String(authoritative.nickname || saved.nickname || checked.nickname));
      S.profile = authoritative;
      S.state = authoritativeState;
      close();
      setTimeout(() => { void global.Awakening?.checkState?.({ force: true }); }, 0);
    } catch (error) {
      showError(error?.message || "Could not save callsign. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function consumeProfile(raw) {
    const profile = profileFrom(raw);
    const state = setupState(profile);
    if (!profile || !state) return false;
    S.profile = profile;
    S.state = state;
    if (isPending(state)) open();
    else if (S.back) close();
    return isPending(state);
  }

  global.addEventListener("ah:profile-data-changed", () => {
    consumeProfile(global.__ahRealProfileData || global.__ahLiveProfileState);
  });

  global.Callsign = { consumeProfile, isPending: () => isPending(S.state) };
  consumeProfile(global.__ahLastProfilePayload || global.__ahRealProfileData || global.__ahLiveProfileState);
})(window);
