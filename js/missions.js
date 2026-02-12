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

  function ensureModal() {
    _modal = el("missionsModal");
    _root = el("missionsRoot");
    if (_modal && _root) return;

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="missionsModal" class="ah-modal-backdrop" style="display:none;">
        <div class="ah-modal">
          <div class="ah-modal-head">
            <div class="ah-modal-title">Missions</div>
            <button type="button" class="ah-icon-btn" data-act="close" aria-label="Close">✕</button>
          </div>
          <div class="ah-modal-body">
            <div id="missionsRoot"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);
    _modal = el("missionsModal");
    _root = el("missionsRoot");

    _modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t?.dataset?.act === "close") close();
      if (t === _modal) close(); // click outside

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
    _modal.style.display = "block";
    renderLoading("Loading missions…");
    loadState();
    startTick();
  }

  function close() {
    if (!_modal) return;
    _modal.style.display = "none";
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
    _root.innerHTML = `
      <div class="ah-card">
        <div class="ah-muted">${esc(msg)}</div>
      </div>
    `;
  }

  function renderError(title, detail) {
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
    // jeśli backend zwraca ok:false, pokaż to jako błąd UI (czytelne w testach)
    if (res && typeof res === "object" && res.ok === false) {
      const reason = res.reason || res.error || "NOT_OK";
      throw new Error(String(reason));
    }
    return res;
  }

  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;
    // najczęstsze: { ok:true, data:{...} }
    if (res.data && typeof res.data === "object") return res.data;
    // czasem: { ok:true, payload:{...} }
    if (res.payload && typeof res.payload === "object") return res.payload;
    // fallback: sam obiekt
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
        offerId,
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

  function paintActive(a) {
    const box = el("missionsActiveBox");
    if (!box) return;

    const status = a.status || "NONE";
    let line = "";
    if (status === "RUNNING") line = `Ready in <b>${fmtLeft(a.leftSec)}</b>`;
    if (status === "READY") line = `<b>Ready</b> — resolve now`;
    if (status === "DONE") line = `<b>Done</b>`;
    if (status === "NONE") line = `No active mission`;

    box.innerHTML = `
      <div class="ah-row" style="justify-content:space-between; gap:10px;">
        <div>
          <div class="ah-title">${esc(a.title || "Mission")}</div>
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
      renderError("Bad payload", JSON.stringify(_state).slice(0, 800));
      return;
    }

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const active = payload.active || { status: "NONE" };
    const last = payload.lastResolve || null;

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
        Missions UI ready. Backend routes must be live (no 404) for actions to work.
      </div>
    `;

    paintActive(active);
  }

  function renderOffer(o, active) {
    const tier = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const dur = o?.durationLabel || (o?.durationSec ? `${Math.round(o.durationSec / 60)}m` : "—");

    const rp = o?.rewardPreview || {};
    const xp = rp.xp ?? "?";
    const bones = rp.bones ?? "?";
    const rolls = (rp.rolls ?? rp.loot_rolls ?? "?");

    const disabled = (active?.status && active.status !== "NONE") ? "disabled" : "";

    return `
      <div class="ah-item">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
          <div>
            <div class="ah-title">${esc(label)} <span class="ah-muted">(${esc(dur)})</span></div>
            <div class="ah-muted" style="margin-top:4px;">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
            </div>
          </div>
          <button type="button" class="ah-btn" data-act="start" data-tier="${esc(tier)}" data-offer="${esc(o?.id || "")}" ${disabled}>Start</button>
        </div>
      </div>
    `;
  }

  function renderLast(last) {
    const victory = last.victory ? "✅ Victory" : "❌ Defeat";
    const moon = last.moonstone ? " · 🌙 Moonstone Orb" : "";
    const drops = Array.isArray(last.fullDrops) ? last.fullDrops : [];
    return `
      <div class="ah-card" style="margin-top:10px;">
        <div class="ah-title">Last Resolve</div>
        <div class="ah-muted" style="margin-top:6px;">
          ${esc(victory)} · Tier: <b>${esc(last.tier || "?")}</b> · XP: <b>${esc(last.xp ?? 0)}</b> · Bones: <b>${esc(last.bones ?? 0)}</b>${moon}
        </div>
        ${last.summary ? `<div class="ah-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(last.summary)}</div>` : ""}
        ${drops.length ? `
          <div class="ah-muted" style="margin-top:8px;">
            Full drops: ${drops.map(d => `<b>${esc(d.name || d.key || "item")}</b>`).join(", ")}
          </div>` : ""
        }
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
