// js/missions.js — WebApp Missions UI (backend-first, icons later)
// Contract:
//   POST /webapp/missions/state  { run_id }
//   POST /webapp/missions/action { action:"refresh_offers"|"start"|"resolve", tier?, offerId?, run_id }
//
// UI degrades gracefully if endpoint returns 404 (shows "backend offline").

(function () {
  const esc = (s) => String(s ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  function rid(prefix = "missions") {
    try { return `${prefix}:${crypto.randomUUID()}`; } catch {
      return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
    }
  }

  function el(id) { return document.getElementById(id); }

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _modal = null;
  let _root = null;
  let _tick = null;
  let _state = null;

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  function bindOnceModalClicks() {
    if (!_modal) return;
    if (_modal.__AH_MISSIONS_BOUND) return;
    _modal.__AH_MISSIONS_BOUND = 1;

    _modal.addEventListener("click", (e) => {
      // close by overlay click (jeśli ktoś kliknie w tło)
      if (e.target === _modal && (_modal.id === "missionsModal")) close();
    });

    _modal.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button[data-act], [data-act]");
      if (!btn) return;

      const act = btn.dataset.act;
      if (!act) return;

      if (act === "refresh") return void doRefresh();
      if (act === "start")   return void doStart(btn.dataset.tier || "", btn.dataset.offer || "");
      if (act === "resolve") return void doResolve();
      if (act === "close")   return void close();
    });

    // jeśli masz w index.html osobny przycisk zamknięcia:
    const closeBtn = el("closeMissions");
    if (closeBtn && !closeBtn.__AH_MISSIONS_BOUND) {
      closeBtn.__AH_MISSIONS_BOUND = 1;
      closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
    }
  }

  function ensureModal() {
    // Preferuj istniejący sheet z index.html:
    _modal = el("missionsBack") || el("missionsModal");
    _root  = el("missionsRoot");

    if (_modal && _root) {
      try {
        _modal.style.position = _modal.style.position || "fixed";
        _modal.style.inset = _modal.style.inset || "0";
        _modal.style.zIndex = _modal.style.zIndex || "999999";
      } catch (_) {}
      bindOnceModalClicks();
      return;
    }

    // Fallback: jeśli nie masz sheeta w index.html, tworzymy minimalny modal
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="missionsModal" style="
        display:none; position:fixed; inset:0; z-index:999999;
        background:rgba(0,0,0,.65); align-items:center; justify-content:center;
      ">
        <div style="
          width:min(560px, calc(100vw - 24px));
          max-height:calc(100vh - 24px);
          overflow:auto;
          background:rgba(20,20,24,.96);
          border:1px solid rgba(255,255,255,.10);
          border-radius:16px;
          box-shadow:0 20px 70px rgba(0,0,0,.55);
          padding:14px;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <div style="font-weight:700;">Missions</div>
            <button type="button" data-act="close" style="
              border:0; background:transparent; color:#fff; font-size:18px; cursor:pointer;
            ">✕</button>
          </div>
          <div style="margin-top:12px;" id="missionsRoot"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);

    _modal = el("missionsModal");
    _root  = el("missionsRoot");
    bindOnceModalClicks();
  }

  function open() {
    ensureModal();
    log("open(): modal=", _modal?.id, "root=", !!_root);

    if (_modal && _modal.id === "missionsBack") {
      _modal.style.display = "flex";
      try { window.navOpen?.("missionsBack"); } catch (_) {}
    } else if (_modal) {
      _modal.style.display = "flex";
    }

    renderLoading("Loading missions…");
    loadState();
    startTick();
    return true;
  }

  function close() {
    if (!_modal) return;

    if (_modal.id === "missionsBack") {
      try { window.navClose?.("missionsBack"); } catch (_) {}
      _modal.style.display = "none";
    } else {
      _modal.style.display = "none";
    }

    stopTick();
  }

  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      const a = payload?.active;
      if (!a) return;

      if (a.status === "RUNNING" && typeof a.leftSec === "number") {
        a.leftSec = Math.max(0, a.leftSec - 1);
        if (a.leftSec === 0) a.status = "READY";
        paintActive(a);
      }
    }, 1000);
  }

  function stopTick() {
    if (_tick) clearInterval(_tick);
    _tick = null;
  }

  function renderLoading(msg) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="ah-card">
        <div class="ah-muted">${esc(msg)}</div>
      </div>
    `;
  }

  function renderError(title, detail) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="ah-card">
        <div class="ah-title">${esc(title)}</div>
        <div class="ah-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(detail || "")}</div>
        <div style="margin-top:12px; display:flex; gap:8px;">
          <button type="button" class="ah-btn" data-act="refresh">Retry</button>
          <button type="button" class="ah-btn ghost" data-act="close">Close</button>
        </div>
      </div>
    `;
  }

  async function api(path, body) {
    if (!_apiPost) throw new Error("Missions: apiPost missing");
    const res = await _apiPost(path, body);
    if (res && typeof res === "object" && res.ok === false) {
      const reason = res.reason || res.error || "NOT_OK";
      throw new Error(String(reason));
    }
    return res;
  }

  // ✅ Klucz u Ciebie: response ma { ok:true, state:{...} }
  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;

    if (res.state && typeof res.state === "object") return res.state;                 // <— najważniejsze
    if (res.data && typeof res.data === "object") return res.data;
    if (res.payload && typeof res.payload === "object") return res.payload;

    // czasem: { ok:true, result:{...}, state:{...} } — state łapiemy wyżej
    return res;
  }

  async function loadState() {
    renderLoading("Loading missions…");
    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
      _state = res;
      render();
    } catch (e) {
      renderError("Missions backend offline (404?)", String(e?.message || e || ""));
    }
  }

  async function doRefresh() {
    try {
      const res = await api("/webapp/missions/action", {
        action: "refresh_offers",
        run_id: rid("m:refresh"),
      });
      _state = res;
      render();
    } catch (e) {
      renderError("Refresh failed", String(e?.message || e || ""));
    }
  }

  async function doStart(tier, offerId) {
    try {
      // ✅ wysyłamy aliasy, żeby backend nie miał wymówki
      const body = {
        action: "start",
        tier,
        offerId,
        id: offerId,
        offer_id: offerId,
        run_id: rid("m:start"),
      };
      const res = await api("/webapp/missions/action", body);
      _state = res;
      render();
    } catch (e) {
      renderError("Start failed", String(e?.message || e || ""));
    }
  }

  async function doResolve() {
    try {
      const res = await api("/webapp/missions/action", {
        action: "resolve",
        run_id: rid("m:resolve"),
      });
      _state = res;
      render();
    } catch (e) {
      renderError("Resolve failed", String(e?.message || e || ""));
    }
  }

  function fmtLeft(sec) {
    sec = Math.max(0, Number(sec || 0));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }

  function paintActive(a) {
    const box = el("missionsActiveBox");
    if (!box) return;

    const status = a.status || "NONE";
    let line = "";
    if (status === "RUNNING") line = `Ready in <b>${fmtLeft(a.leftSec)}</b>`;
    if (status === "READY")   line = `<b>Ready</b> — resolve now`;
    if (status === "DONE")    line = `<b>Done</b>`;
    if (status === "NONE")    line = `No active mission`;

    box.innerHTML = `
      <div class="ah-row" style="justify-content:space-between; gap:10px;">
        <div>
          <div class="ah-title">${esc(a.title || a.name || "Mission")}</div>
          <div class="ah-muted" style="margin-top:4px;">${line}</div>
          ${a.readyAt ? `<div class="ah-muted" style="margin-top:2px;">Ready at: ${esc(a.readyAt)}</div>` : ""}
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; align-items:stretch; min-width:140px;">
          <button type="button" class="ah-btn ghost" data-act="refresh">Refresh</button>
          ${status === "READY" ? `<button type="button" class="ah-btn" data-act="resolve">Resolve</button>` : ""}
        </div>
      </div>
    `;
  }

  function renderOffer(o, active) {
    const tier  = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const title = String(o?.title || "");
    const desc  = String(o?.desc || "");

    const durSec = Number(o?.durationSec || 0);
    const dur = o?.durationLabel
      || (durSec ? `${Math.max(1, Math.round(durSec / 60))}m` : "")
      || (o?.tierTime ? `${o.tierTime}` : "—");

    const reward = o?.reward || o?.rewardPreview || {};
    const xp = (reward.xp ?? "?");
    const bones = (reward.bones ?? "?");
    const rolls = (o?.lootRolls ?? o?.loot_rolls ?? o?.lootRolls ?? "?");

    const offerId = String(o?.offerId || o?.id || "");

    const hasActive = !!(active?.status && active.status !== "NONE");
    const disabled = hasActive ? "disabled" : "";

    return `
      <div class="ah-item">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
          <div style="min-width:0;">
            <div class="ah-title">${esc(label)} <span class="ah-muted">(${esc(dur)})</span></div>
            ${title ? `<div class="ah-muted" style="margin-top:4px;"><b>${esc(title)}</b></div>` : ""}
            ${desc ? `<div class="ah-muted" style="margin-top:2px;">${esc(desc)}</div>` : ""}
            <div class="ah-muted" style="margin-top:6px;">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
              ${hasActive ? ` · <span class="ah-muted">Resolve active mission first</span>` : ""}
            </div>
          </div>
          <button type="button" class="ah-btn"
            data-act="start"
            data-tier="${esc(tier)}"
            data-offer="${esc(offerId)}"
            ${disabled}
          >Start</button>
        </div>
      </div>
    `;
  }

  function renderLast(last) {
    const result = String(last?.result || "");
    const victory = (result === "victory" || last?.victory) ? "✅ Victory" : "❌ Defeat";
    const ts = last?.ts ? new Date(Number(last.ts) * 1000).toLocaleString() : "";

    const rewardMsg = String(last?.rewardMsg || "");
    const lootMsg = String(last?.lootMsg || "");
    const tokenLootMsg = String(last?.tokenLootMsg || "");

    return `
      <div class="ah-card" style="margin-top:10px;">
        <div class="ah-title">Last Resolve</div>
        <div class="ah-muted" style="margin-top:6px;">
          ${esc(victory)} ${ts ? `· <b>${esc(ts)}</b>` : ""}
        </div>
        ${rewardMsg ? `<div class="ah-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(rewardMsg)}</div>` : ""}
        ${lootMsg ? `<div class="ah-muted" style="margin-top:4px; white-space:pre-wrap;">${esc(lootMsg)}</div>` : ""}
        ${tokenLootMsg ? `<div class="ah-muted" style="margin-top:4px; white-space:pre-wrap;">${esc(tokenLootMsg)}</div>` : ""}
      </div>
    `;
  }

  function render() {
    if (!_root) return;
    const payload = normalizePayload(_state);

    if (!payload || typeof payload !== "object") {
      renderError("Bad payload", JSON.stringify(_state).slice(0, 900));
      return;
    }

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const active = payload.active || { status: "NONE" };
    const last   = payload.lastResolve || null;

    _root.innerHTML = `
      <div class="ah-card" id="missionsActiveBox"></div>

      <div class="ah-card" style="margin-top:10px;">
        <div class="ah-row" style="justify-content:space-between; gap:10px;">
          <div>
            <div class="ah-title">Offers</div>
            <div class="ah-muted" style="margin-top:4px;">Pick a tier — icons later, stability now.</div>
          </div>
          <button type="button" class="ah-btn ghost" data-act="refresh">Refresh</button>
        </div>

        <div class="ah-list" style="margin-top:10px;">
          ${offers.length ? offers.map(o => renderOffer(o, active)).join("") : `<div class="ah-muted">No offers yet. Tap Refresh.</div>`}
        </div>
      </div>

      ${last ? renderLast(last) : ""}

      <div class="ah-muted" style="margin-top:10px; text-align:center;">
        Missions are backend-driven. If backend is offline you'll see an error here.
      </div>
    `;

    paintActive(active);
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    log("init ok");
  }

  window.Missions = { init, open, close, reload: loadState };
})();
