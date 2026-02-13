// js/missions.js — WebApp Missions (EXPEDITIONS) UI
// Contract:
//   POST /webapp/missions/state  { run_id }
//   POST /webapp/missions/action { action:"refresh_offers"|"start"|"resolve", tier?, offerId?, run_id }

(function () {
  const esc = (s) => String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  function rid(prefix = "missions") {
    try { return `${prefix}:${crypto.randomUUID()}`; } catch {
      return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
    }
  }

  function el(id) { return document.getElementById(id); }

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _modal = null; // #missionsBack or #missionsModal
  let _root = null;  // #missionsRoot
  let _tick = null;
  let _state = null;

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // =========================
  // Styles (ONLY inside missions content; do NOT override overlay)
  // =========================
  function ensureStyles() {
    if (document.getElementById("missions-ui-css")) return;
    const st = document.createElement("style");
    st.id = "missions-ui-css";
    st.textContent = `
      /* Keep missions content readable even if global styles change */
      #missionsRoot{ display:block !important; }

      #missionsRoot .m-stage{
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      #missionsRoot .m-card{
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 14px;
        padding: 12px;
        background: rgba(12,14,18,.78);
        color: rgba(255,255,255,.92);
        box-shadow: 0 14px 30px rgba(0,0,0,.35);
      }

      #missionsRoot .m-title{
        font-weight: 800;
        letter-spacing: .2px;
      }
      #missionsRoot .m-muted{
        opacity: .78;
        font-size: 12.5px;
        line-height: 1.35;
      }

      #missionsRoot .m-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }

      #missionsRoot .m-bar{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background: rgba(255,255,255,.10);
        border: 1px solid rgba(255,255,255,.10);
        margin-top:10px;
      }
      #missionsRoot .m-bar-fill{
        height:100%;
        width:0%;
        background: linear-gradient(90deg, rgba(0,229,255,.65), rgba(43,139,217,.92));
        transition: width .25s linear;
      }

      #missionsRoot .m-offer{
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.16);
        border-radius: 14px;
        padding: 12px;
      }
      #missionsRoot .m-offer + .m-offer{ margin-top: 10px; }
      #missionsRoot .m-offer:hover{
        border-color: rgba(0,229,255,.18);
        box-shadow: 0 12px 26px rgba(0,0,0,.30);
      }

      #missionsRoot .m-hr{
        height:1px;
        background: rgba(255,255,255,.08);
        margin:10px 0;
      }

      /* Make disabled Start look intentional */
      #missionsRoot button[disabled]{
        opacity:.55;
        cursor:not-allowed;
      }
    `;
    document.head.appendChild(st);
  }

  // =========================
  // Modal wiring
  // =========================
  function bindOnceModalClicks() {
    if (!_modal) return;
    if (_modal.__AH_MISSIONS_BOUND) return;
    _modal.__AH_MISSIONS_BOUND = 1;

    // Close on backdrop click
    _modal.addEventListener("click", (e) => {
      if (e.target === _modal) close();
    });

    // Delegation for dynamic buttons rendered into missionsRoot
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

    // Static buttons from index.html (if present)
    const closeBtn = el("closeMissions");
    if (closeBtn && !closeBtn.__AH_MISSIONS_BOUND) {
      closeBtn.__AH_MISSIONS_BOUND = 1;
      closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
    }

    const refreshBtn = el("missionsRefresh");
    if (refreshBtn && !refreshBtn.__AH_MISSIONS_BOUND) {
      refreshBtn.__AH_MISSIONS_BOUND = 1;
      refreshBtn.addEventListener("click", (e) => { e.preventDefault(); doRefresh(); });
    }

    const resolveBtn = el("missionsResolve");
    if (resolveBtn && !resolveBtn.__AH_MISSIONS_BOUND) {
      resolveBtn.__AH_MISSIONS_BOUND = 1;
      resolveBtn.addEventListener("click", (e) => { e.preventDefault(); doResolve(); });
    }

    // ESC to close (desktop)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (_modal && (_modal.style.display === "flex" || _modal.classList.contains("is-open"))) close();
      }
    });
  }

  function ensureModal() {
    ensureStyles();

    _modal = el("missionsBack") || el("missionsModal");
    _root  = el("missionsRoot");

    if (_modal && _root) {
      bindOnceModalClicks();
      return;
    }

    // Fallback modal if index doesn't have it
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="missionsModal" style="position:fixed; inset:0; display:none; align-items:center; justify-content:center; padding:12px; background:rgba(0,0,0,.72); z-index:999999;">
        <div style="width:min(560px, 100%); max-height:calc(100vh - 24px); overflow:hidden; background:rgba(14,16,18,.92); border:1px solid rgba(255,255,255,.10); border-radius:16px; box-shadow:0 18px 60px rgba(0,0,0,.65); display:flex; flex-direction:column; min-height:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 12px 0 12px;">
            <div style="font-weight:800;color:#fff;">Missions</div>
            <button type="button" class="btn" data-act="close">×</button>
          </div>
          <div id="missionsRoot" style="padding:12px; overflow:auto; min-height:0;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);

    _modal = el("missionsModal");
    _root  = el("missionsRoot");
    bindOnceModalClicks();
  }

  // =========================
  // Open/Close (adds required classes)
  // =========================
  function open() {
    ensureModal();
    log("open(): modal=", _modal?.id, "root=", !!_root);

    if (!_modal) return false;

    // Show modal
    _modal.style.display = "flex";
    _modal.classList.add("is-open");
    document.body.classList.add("missions-open");

    // Optional: integrate with your nav stack router
    try { window.navOpen?.(_modal.id); } catch (_) {}

    renderLoading("Loading missions…");
    loadState();
    startTick();
    return true;
  }

  function close() {
    if (!_modal) return;

    try { window.navClose?.(_modal.id); } catch (_) {}

    _modal.classList.remove("is-open");
    _modal.style.display = "none";
    document.body.classList.remove("missions-open");

    stopTick();
  }

  // =========================
  // Server clock sync
  // =========================
  let _serverOffsetSec = 0;

  function _syncServerClock(payload) {
    const nowTs = Number(payload?.now_ts || payload?.nowTs || 0);
    if (!nowTs) return;
    const clientNow = Date.now() / 1000;
    _serverOffsetSec = nowTs - clientNow;
  }

  function _nowSec() {
    return (Date.now() / 1000) + _serverOffsetSec;
  }

  function _fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function _fmtClock(ts) {
    try {
      const d = new Date(Number(ts) * 1000);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (_) { return ""; }
  }

  // =========================
  // Active parsing (robust)
  // =========================
  let _legacyAnchor = null;

  function getActive(payload) {
    const am = payload?.active_mission || payload?.activeMission || payload?.active || null;
    if (!am || typeof am !== "object") return { status: "NONE" };

    const title = am.title || am.name || am.label || "Mission";

    const started = Number(am.started_ts || am.start_ts || am.start_time || 0);
    const dur = Number(am.duration_sec || am.duration || 0);
    const ends =
      Number(am.ends_ts || am.ready_at_ts || am.ready_at || 0) ||
      (started && dur ? (started + dur) : 0);

    const stRaw = String(am.status || "").toUpperCase();

    // If backend provided ends_ts (best path)
    if (ends) {
      const now = _nowSec();
      const total = dur || Math.max(1, ends - (started || ends));
      const remaining = Math.max(0, Math.ceil(ends - now));
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
      return {
        status: remaining > 0 ? "RUNNING" : "READY",
        title,
        started_ts: started,
        duration_sec: dur || total,
        ends_ts: ends,
        remaining,
        total,
        pct,
        readyAt: am.readyAt || am.ready_at_label || _fmtClock(ends),
      };
    }

    // Legacy left-sec path
    const rawLeft = (am.leftSec ?? am.left_sec);
    const left = (typeof rawLeft === "number") ? rawLeft : Number(rawLeft || 0);

    let status = stRaw;
    if (!status) status = (left > 0 ? "RUNNING" : "READY");
    if (status === "ACTIVE") status = "RUNNING";
    if (status === "COMPLETED") status = "READY";

    if (status === "RUNNING") {
      const now = _nowSec();
      if (!_legacyAnchor || _legacyAnchor.left !== left || _legacyAnchor.title !== title) {
        _legacyAnchor = { left, at: now, title };
      }
      const elapsed = Math.max(0, now - _legacyAnchor.at);
      const remaining = Math.max(0, Math.ceil(_legacyAnchor.left - elapsed));
      const total = Math.max(1, Number(am.duration_sec || am.duration || _legacyAnchor.left || 1));
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
      return { status: remaining > 0 ? "RUNNING" : "READY", title, remaining, total, pct, readyAt: am.readyAt || "" };
    }

    if (status === "READY") {
      return { status: "READY", title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "" };
    }

    return { status: "NONE" };
  }

  // =========================
  // Tick
  // =========================
  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      if (!payload) return;
      paintActive(getActive(payload));
    }, 1000);
  }

  function stopTick() {
    if (_tick) clearInterval(_tick);
    _tick = null;
  }

  // =========================
  // API
  // =========================
  async function api(path, body) {
    if (!_apiPost) throw new Error("Missions: apiPost missing");
    const res = await _apiPost(path, body);

    // If apiPost returns {ok:false,...}
    if (res && typeof res === "object" && res.ok === false) {
      const reason = res.reason || res.error || "NOT_OK";
      throw new Error(String(reason));
    }

    return res;
  }

  // ✅ Always return the STATE object (not wrapper)
  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;

    // direct state
    if (res.state && typeof res.state === "object") return res.state;

    // nested data.state
    if (res.data && typeof res.data === "object") {
      if (res.data.state && typeof res.data.state === "object") return res.data.state;
      return res.data;
    }

    // payload.state
    if (res.payload && typeof res.payload === "object") {
      if (res.payload.state && typeof res.payload.state === "object") return res.payload.state;
      return res.payload;
    }

    // some servers return {result:{state}}
    if (res.result && typeof res.result === "object") {
      if (res.result.state && typeof res.result.state === "object") return res.result.state;
      return res.result;
    }

    // already state-shaped
    return res;
  }

  // =========================
  // Rendering
  // =========================
  function renderLoading(msg) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-card">
          <div class="m-muted">${esc(msg)}</div>
        </div>
      </div>
    `;
  }

  function renderError(title, detail) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-card">
          <div class="m-title">${esc(title)}</div>
          <div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(detail || "")}</div>
          <div style="margin-top:12px; display:flex; gap:8px;">
            <button type="button" class="btn" data-act="refresh">Retry</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  function paintActive(a) {
    const box = el("missionsActiveBox");
    if (!box) return;

    const status = a?.status || "NONE";
    const staticResolve = el("missionsResolve");

    // Default: hide static resolve
    if (staticResolve) staticResolve.style.display = "none";

    if (status === "NONE") {
      box.innerHTML = `
        <div class="m-row">
          <div style="min-width:0;">
            <div class="m-title">No active mission</div>
            <div class="m-muted" style="margin-top:6px;">Pick an offer below to start.</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; min-width:140px;">
            <button type="button" class="btn" data-act="refresh">Refresh</button>
          </div>
        </div>
      `;
      return;
    }

    const remaining = Number(a.remaining || 0);
    const pct = Math.round((Number(a.pct || 0)) * 100);

    if (status === "READY") {
      if (staticResolve) staticResolve.style.display = "";
    }

    box.innerHTML = `
      <div class="m-row">
        <div style="min-width:0;">
          <div class="m-title">${esc(a.title || "Mission")}</div>
          <div class="m-muted" style="margin-top:6px;">
            ${
              status === "RUNNING"
                ? `Ready in <b>${esc(_fmtTime(remaining))}</b>${a.readyAt ? ` · Ready at <b>${esc(a.readyAt)}</b>` : ""}`
                : `<b>Ready</b> — resolve now`
            }
          </div>

          <div class="m-bar">
            <div class="m-bar-fill" style="width:${pct}%"></div>
          </div>

          <div class="m-muted" style="margin-top:6px;">
            Progress: <b>${esc(pct)}%</b>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; min-width:140px;">
          <button type="button" class="btn" data-act="refresh">Refresh</button>
          <button type="button" class="btn primary" data-act="resolve" style="${status === "READY" ? "" : "display:none"}">Resolve</button>
        </div>
      </div>
    `;
  }

  function renderOffer(o, active) {
    const tier  = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const title = String(o?.title || "");
    const desc  = String(o?.desc || "");

    const durSec = Number(o?.durationSec || o?.duration_sec || 0);
    const dur =
      o?.durationLabel ||
      (durSec ? `${Math.max(1, Math.round(durSec / 60))}m` : "") ||
      (o?.tierTime ? `${o.tierTime}` : "—");

    const reward = o?.reward || o?.rewardPreview || {};
    const xp = (reward.xp ?? o?.xp ?? "?");
    const bones = (reward.bones ?? o?.bones ?? "?");
    const rolls = (o?.lootRolls ?? o?.loot_rolls ?? reward.rolls ?? reward.loot_rolls ?? "?");

    const offerId = String(o?.offerId || o?.id || o?.offer_id || "");

    const hasActive = !!(active?.status && active.status !== "NONE");
    const disabled = hasActive ? "disabled" : "";

    return `
      <div class="m-offer">
        <div class="m-row">
          <div style="min-width:0;">
            <div class="m-title">${esc(label)} <span class="m-muted">(${esc(dur)})</span></div>
            ${title ? `<div class="m-muted" style="margin-top:6px;"><b>${esc(title)}</b></div>` : ""}
            ${desc ? `<div class="m-muted" style="margin-top:4px;">${esc(desc)}</div>` : ""}
            <div class="m-muted" style="margin-top:8px;">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
              ${hasActive ? ` · Resolve active mission first` : ""}
            </div>
          </div>

          <button type="button" class="btn primary"
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

    const rewardMsg = String(last?.rewardMsg || last?.reward_msg || "");
    const lootMsg = String(last?.lootMsg || last?.loot_msg || "");
    const tokenLootMsg = String(last?.tokenLootMsg || last?.token_loot_msg || "");

    return `
      <div class="m-card">
        <div class="m-title">Last Resolve</div>
        <div class="m-muted" style="margin-top:8px;">
          ${esc(victory)} ${ts ? `· <b>${esc(ts)}</b>` : ""}
        </div>
        ${rewardMsg ? `<div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(rewardMsg)}</div>` : ""}
        ${lootMsg ? `<div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(lootMsg)}</div>` : ""}
        ${tokenLootMsg ? `<div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(tokenLootMsg)}</div>` : ""}
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

    _syncServerClock(payload);

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const active = getActive(payload);
    const last   = payload.lastResolve || payload.last_resolve || null;

    _root.innerHTML = `
      <div class="m-stage">

        <div class="m-card" id="missionsActiveBox"></div>

        <div class="m-card">
          <div class="m-row">
            <div style="min-width:0;">
              <div class="m-title">Offers</div>
              <div class="m-muted" style="margin-top:6px;">Pick a tier. Start → wait → resolve.</div>
            </div>
            <button type="button" class="btn" data-act="refresh">Refresh</button>
          </div>

          <div class="m-hr"></div>

          <div>
            ${
              offers.length
                ? offers.map(o => renderOffer(o, active)).join("")
                : `<div class="m-muted">No offers yet. Tap Refresh.</div>`
            }
          </div>
        </div>

        ${last ? renderLast(last) : ""}

        <div class="m-muted" style="text-align:center; opacity:.85;">
          Missions are backend-driven. If backend is offline you’ll see an error here.
        </div>

      </div>
    `;

    paintActive(active);
  }

  // =========================
  // State fetch + actions
  // =========================
  async function loadState() {
    renderLoading("Loading missions…");
    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
      _state = res;
      render();
    } catch (e) {
      renderError("Missions backend error", String(e?.message || e || ""));
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
      // tolerate backend expecting offerId / offer_id / id
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

      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
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

      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
    } catch (e) {
      renderError("Resolve failed", String(e?.message || e || ""));
    }
  }

  // =========================
  // Public API
  // =========================
  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    ensureStyles();
    ensureModal();
    log("init ok");
  }

  window.Missions = { init, open, close, reload: loadState };
})();
