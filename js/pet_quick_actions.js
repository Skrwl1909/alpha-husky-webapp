(function () {
  let _apiPost = null;
  let _tg = null;
  let _state = null;
  let _tick = null;
  let _busy = "";
  let _statusTimer = null;

  function nowSec() {
    return Math.floor(Date.now() / 1000);
  }

  function ensureStyles() {
    if (document.getElementById("pet-quick-actions-style")) return;
    const style = document.createElement("style");
    style.id = "pet-quick-actions-style";
    style.textContent = `
      #petQuickActions{
        position:fixed;
        right:14px;
        bottom:calc(78px + env(safe-area-inset-bottom));
        z-index:7000;
        display:none;
        flex-direction:column;
        align-items:flex-end;
        gap:8px;
        pointer-events:none;
      }
      #petQuickActions .pqa-panel,
      #petQuickActions .pqa-toggle,
      #petQuickActions .pqa-action{
        pointer-events:auto;
      }
      #petQuickActions .pqa-toggle,
      #petQuickActions .pqa-action{
        border:1px solid rgba(255,255,255,.14);
        background:rgba(9,15,22,.92);
        color:#f3f8ff;
        box-shadow:0 14px 30px rgba(0,0,0,.28);
      }
      #petQuickActions .pqa-toggle{
        min-width:56px;
        height:56px;
        border-radius:999px;
        padding:0 14px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        font:800 12px/1 system-ui,sans-serif;
      }
      #petQuickActions .pqa-toggle[data-open="1"]{
        background:rgba(14,22,31,.96);
      }
      #petQuickActions .pqa-pulse{
        width:10px;
        height:10px;
        border-radius:999px;
        background:#7cf3ae;
        box-shadow:0 0 0 6px rgba(124,243,174,.14);
      }
      #petQuickActions .pqa-panel{
        display:none;
        width:min(190px,calc(100vw - 28px));
        padding:10px;
        border-radius:16px;
        background:rgba(7,11,17,.94);
        border:1px solid rgba(255,255,255,.10);
        box-shadow:0 18px 36px rgba(0,0,0,.30);
        backdrop-filter:blur(12px);
      }
      #petQuickActions[data-open="1"] .pqa-panel{
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      #petQuickActions .pqa-action{
        width:100%;
        min-height:40px;
        border-radius:12px;
        padding:9px 12px;
        font:800 13px/1.1 system-ui,sans-serif;
        text-align:left;
      }
      #petQuickActions .pqa-action[disabled]{
        opacity:.62;
      }
      #petQuickActions .pqa-status{
        min-height:14px;
        color:rgba(226,236,248,.72);
        font:700 11px/1.2 system-ui,sans-serif;
        padding:0 2px;
      }
      @media (max-width: 640px){
        #petQuickActions{
          right:12px;
          bottom:calc(84px + env(safe-area-inset-bottom));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    let el = document.getElementById("petQuickActions");
    if (el) return el;

    el = document.createElement("div");
    el.id = "petQuickActions";
    el.innerHTML = `
      <div class="pqa-panel">
        <button type="button" class="pqa-action" data-action="feed">Feed Pet</button>
        <button type="button" class="pqa-action" data-action="pet">Pet Pet</button>
        <div class="pqa-status" id="petQuickActionsStatus"></div>
      </div>
      <button type="button" class="pqa-toggle" data-open="0" aria-label="Pet actions">
        <span class="pqa-pulse"></span>
        <span>Pet</span>
      </button>
    `;
    document.body.appendChild(el);

    const toggle = el.querySelector(".pqa-toggle");
    toggle?.addEventListener("click", () => {
      const next = el.dataset.open === "1" ? "0" : "1";
      el.dataset.open = next;
      toggle.setAttribute("data-open", next);
    });

    el.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const action = btn.getAttribute("data-action") || "";
        if (!action) return;
        await runAction(action);
      });
    });

    return el;
  }

  function setStatus(message) {
    const el = document.getElementById("petQuickActionsStatus");
    if (!el) return;
    el.textContent = String(message || "");
    if (_statusTimer) clearTimeout(_statusTimer);
    if (message) {
      _statusTimer = setTimeout(() => {
        const status = document.getElementById("petQuickActionsStatus");
        if (status) status.textContent = "";
      }, 2800);
    }
  }

  function cooldownFor(action) {
    const map = _state?.actionCooldowns || {};
    const info = map?.[action];
    if (!info || typeof info !== "object") {
      return { remainingSec: 0, nextAvailableAt: nowSec(), cooldownSec: 30 };
    }
    const nextAt = Number(info.nextAvailableAt || 0) || 0;
    const remaining = Math.max(0, nextAt ? nextAt - nowSec() : Number(info.remainingSec || 0) || 0);
    return {
      cooldownSec: Number(info.cooldownSec || 30) || 30,
      remainingSec: remaining,
      nextAvailableAt: nextAt || nowSec(),
    };
  }

  function applyPetsState(petsPayload) {
    if (!petsPayload || typeof petsPayload !== "object") return;
    _state = petsPayload;
    render();
  }

  function render() {
    const el = ensureRoot();
    const activePet = _state?.activePet || null;
    const feedBtn = el.querySelector('[data-action="feed"]');
    const petBtn = el.querySelector('[data-action="pet"]');
    const toggle = el.querySelector(".pqa-toggle");

    if (!activePet) {
      el.style.display = "none";
      return;
    }

    el.style.display = "flex";
    if (toggle) {
      toggle.title = activePet?.name ? `${activePet.name}` : "Pet actions";
    }

    const feedCd = cooldownFor("feed");
    const petCd = cooldownFor("pet");

    if (feedBtn) {
      feedBtn.disabled = _busy === "feed" || feedCd.remainingSec > 0;
      feedBtn.textContent = feedCd.remainingSec > 0 ? `Feed ${feedCd.remainingSec}s` : (_busy === "feed" ? "Feeding..." : "Feed Pet");
    }
    if (petBtn) {
      petBtn.disabled = _busy === "pet" || petCd.remainingSec > 0;
      petBtn.textContent = petCd.remainingSec > 0 ? `Pet ${petCd.remainingSec}s` : (_busy === "pet" ? "Petting..." : "Pet Pet");
    }
  }

  async function loadState() {
    if (typeof _apiPost !== "function") return null;
    const res = await _apiPost("/webapp/pets/state", {});
    if (res && res.ok && res.pets) {
      applyPetsState(res.pets);
      return res.pets;
    }
    return null;
  }

  async function runAction(action) {
    if (_busy || typeof _apiPost !== "function") return;
    _busy = action;
    render();

    const path = action === "feed" ? "/webapp/pet/feed" : "/webapp/pet/pet";
    try {
      const res = await _apiPost(path, {});
      if (res?.pets) applyPetsState(res.pets);
      else await loadState();

      if (!res || res.ok === false) {
        setStatus(String(res?.message || res?.reason || "Action failed."));
        try { _tg?.HapticFeedback?.notificationOccurred?.("error"); } catch (_) {}
        return;
      }

      setStatus(String(res.message || "Pet updated."));
      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
      try { window.loadProfile?.(); } catch (_) {}
      try { window.loadPlayerState?.(); } catch (_) {}
    } catch (_) {
      setStatus("Action failed.");
      try { _tg?.HapticFeedback?.notificationOccurred?.("error"); } catch (_) {}
    } finally {
      _busy = "";
      render();
    }
  }

  function startTick() {
    if (_tick) clearInterval(_tick);
    _tick = setInterval(() => {
      if (_state?.actionCooldowns) render();
    }, 1000);
  }

  function init(opts = {}) {
    _apiPost = opts.apiPost || _apiPost || window.apiPost || window.S?.apiPost || null;
    _tg = opts.tg || _tg || window.Telegram?.WebApp || window.tg || null;
    ensureStyles();
    ensureRoot();
    render();
    startTick();
    loadState().catch(() => {});
  }

  window.PetQuickActions = {
    init,
    refresh: loadState,
  };

  if (typeof window.apiPost === "function") {
    init({ apiPost: window.apiPost });
  } else {
    window.waitForApiPostReady?.(6000)
      .then((apiPost) => init({ apiPost }))
      .catch(() => {});
  }
})();
