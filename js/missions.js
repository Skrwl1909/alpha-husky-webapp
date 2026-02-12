// js/missions.js — WebApp Missions UI (backend-first, icons later)
// Contract:
//   POST /webapp/missions/state  { run_id }
//   POST /webapp/missions/action { action:"refresh_offers"|"start"|"resolve", tier?, offerId?, run_id }
//
// Backend payload (yours):
// { ok:true, result:{...}, state:{ offers:[{offerId,id,tier,label,tierTime,title,desc,durationSec,lootRolls,reward:{xp,bones}}], active:{status}, lastResolve:{...} } }

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

  function ensureModal() {
    // Prefer your existing sheet from index.html:
    // <div id="missionsBack"> ... <div id="missionsRoot"> ... </div>
    _modal = el("missionsBack") || el("missionsModal");
    _root  = el("missionsRoot");

    if (_modal && !_root) console.warn("[Missions] missions backdrop exists but #missionsRoot missing");

    if (_modal && _root) {
      try {
        _modal.style.position = _modal.style.position || "fixed";
        _modal.style.inset = _modal.style.inset || "0";
        _modal.style.zIndex = _modal.style.zIndex || "999999";
      } catch (_) {}
      return;
    }

    // Fallback: create minimal modal
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

    _modal.addEventListener("click", (e) => { if (e.target === _modal) close(); });
    _modal.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "refresh") doRefresh();
      if (act === "start") doStart(btn.dataset.tier || "", btn.dataset.offer || "");
      if (act === "resolve") doResolve();
      if (act === "close") close();
    });
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
    if (!_modal) return true;

    if (_modal.id === "missionsBack") {
      try { window.navClose?.("missionsBack"); } catch (_) {}
      _modal.style.display = "none";
    } else {
      _modal.style.display = "none";
    }

    stopTick();
    return true;
  }

  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      const a = payload?.active;
      if (!a) return;

      // local countdown (only if backend gave leftSec)
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

    // If your server ever returns ok:false
    if (res && typeof res === "object" && res.ok === false) {
      const reason = res.reason || res.error || "NOT_OK";
      throw new Error(String(reason));
    }
    return res;
  }

  // ✅ IMPORTANT: your backend returns payload under `state`
  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;

    // your shape: { ok:true, result:{...}, state:{...} }
    if (res.state && typeof res.state === "object") return res.state;

    // common alternatives
    if (res.data && typeof res.data === "object") return res.data;
    if (res.payload && typeof res.payload === "object") return res.payload;

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
      const res = await api("/webapp/missions/action", {
        action: "start",
        tier,
        offerId, // backend expects offerId (your state uses offerId)
        run_id: rid("m:start"),
      });
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

  function fmtDur(sec) {
    sec = Math.max(0, Number(sec || 0));
    if (!sec) return "—";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
    if (m >= 2) return `${m}m`;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }

  function paintActive(a) {
    const box = el("missionsActiveBox");
    if (!box) return;

    const status = String(a.status || "NONE").toUpperCase();

    let title = a.title || a.name || "Mission";
    let line = "No active mission";

    if (status === "RUNNING") line = `Ready in <b>${fmtLeft(a.leftSec ?? a.left_sec ?? 0)}</b>`;
    if (status === "READY")   line = `<b>Ready</b> — resolve now`;
    if (status === "DONE")    line = `<b>Done</b>`;

    box.innerHTML = `
      <div class="ah-row" style="justify-content:space-between; gap:10px;">
        <div>
          <div class="ah-title">${esc(title)}</div>
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

  function render() {
    const payload = normalizePayload(_state);
    if (!payload || typeof payload !== "object") {
      renderError("Bad payload", JSON.stringify(_state).slice(0, 900));
      return;
    }

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const active = payload.active || { status: "NONE" };
    const last = payload.lastResolve || null;

    if (!_root) return;

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

  function renderOffer(o, active) {
    const tier = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const title = String(o?.title || "");
    const desc  = String(o?.desc || "");

    const dur = fmtDur(o?.durationSec);
    const tierTime = String(o?.tierTime || "");
    const durTxt = tierTime ? `${dur} (${tierTime})` : dur;

    const xp = o?.reward?.xp ?? "?";
    const bones = o?.reward?.bones ?? "?";
    const rolls = o?.lootRolls ?? o?.loot_rolls ?? "?";

    const offerId = String(o?.offerId || o?.id || "");
    const disabled = (active?.status && String(active.status).toUpperCase() !== "NONE") ? "disabled" : "";

    return `
      <div class="ah-item">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
          <div style="min-width:0;">
            <div class="ah-title">${esc(label)} <span class="ah-muted">(${esc(durTxt)})</span></div>
            ${title ? `<div class="ah-muted" style="margin-top:6px;"><b>${esc(title)}</b></div>` : ""}
            ${desc ? `<div class="ah-muted" style="margin-top:4px;">${esc(desc)}</div>` : ""}
            <div class="ah-muted" style="margin-top:6px;">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
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
    const res = String(last?.result || "").toLowerCase();
    const badge = (res === "victory") ? "✅ Victory" : (res ? "❌ Defeat" : "—");

    const name = last?.name ? ` · <b>${esc(last.name)}</b>` : "";
    const when = last?.ts ? ` · <span class="ah-muted">${esc(new Date(last.ts * 1000).toLocaleString())}</span>` : "";

    const rewardMsg = String(last?.rewardMsg || "");
    const lootMsg = String(last?.lootMsg || "");
    const tokenMsg = String(last?.tokenLootMsg || "");

    const summary = [rewardMsg, lootMsg, tokenMsg].filter(Boolean).join("");

    return `
      <div class="ah-card" style="margin-top:10px;">
        <div class="ah-title">Last Resolve</div>
        <div class="ah-muted" style="margin-top:6px;">
          ${badge}${name}${when}
        </div>
        ${summary ? `<div class="ah-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(summary)}</div>` : ""}
      </div>
    `;
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    log("init ok");
  }

  window.Missions = { init, open, close, reload: loadState };
})();
