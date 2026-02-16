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

  const el = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _modal = null; // #missionsBack or #missionsModal
  let _root = null;  // #missionsRoot
  let _tick = null;
  let _state = null;

  // ✅ start sync guard (prevents "blink back to offers")
  let _pendingStart = null; // { tier, offerId, startedClientSec, durationSec, title, untilMs }

  // ✅ claim flash: show rewards screen right after resolve
  let _claimFlash = null; // { atMs, last }
  let _justResolvedAt = 0;

  // ✅ cache: helps timer come back after leaving Missions
  const _CACHE_KEY = "ah_missions_active_v1";

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // =========================
  // Styles — FULL SCREEN + AAA vibe
  // =========================
  function ensureStyles() {
    if (document.getElementById("missions-ui-css")) return;

    const st = document.createElement("style");
    st.id = "missions-ui-css";
    st.textContent = `
      :root{
        /* ✅ adjust if your assets are elsewhere */
        --missions-bg: url("mission_bg.webp");
        --missions-wait-bg: url("mission_waiting_bg.webp");
        --missions-dust: url("dust.png");
      }

      #missionsRoot{ display:block !important; }

      /* ✅ FULL SCREEN sheet — Missions feels like its own screen (not a popup) */
      #missionsBack{
        position:fixed !important;
        inset:0 !important;
        z-index: 99999999 !important;
        display:none; /* JS sets display:flex */
        align-items:stretch !important;
        justify-content:stretch !important;
        padding:0 !important;

        background:
          radial-gradient(circle at 18% 10%, rgba(0,229,255,.10), transparent 55%),
          radial-gradient(circle at 82% 92%, rgba(255,176,0,.10), transparent 58%),
          linear-gradient(to bottom, rgba(6,10,14,.88), rgba(6,10,14,.94)),
          var(--missions-bg);
        background-position:center;
        background-size:cover;
        background-repeat:no-repeat;
      }
      #missionsBack.is-open{ display:flex !important; }

      /* wipe wrappers */
      #missionsBack > *,
      #missionsBack .modal,
      #missionsBack .panel,
      #missionsBack .sheet,
      #missionsBack .modal-panel,
      #missionsBack #missionsModal{
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        max-height:none !important;
        margin:0 !important;
        border-radius:0 !important;
        box-shadow:none !important;
        background: transparent !important;
        border:0 !important;

        display:flex !important;
        flex-direction:column !important;
        min-height:0 !important;
      }

      /* content scroll */
      #missionsBack #missionsRoot{
        flex: 1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
        -webkit-overflow-scrolling:touch;
        padding: 14px 14px calc(22px + env(safe-area-inset-bottom)) 14px !important;
      }

      /* sticky bottom row if exists in index */
      #missionsBack .btn-row{
        position:sticky !important;
        bottom:0 !important;
        padding: 12px 14px calc(12px + env(safe-area-inset-bottom)) 14px !important;
        background: rgba(0,0,0,.22) !important;
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(255,255,255,.08) !important;
        z-index: 50;
      }

      /* Topbar */
      #missionsRoot .m-topbar{
        position: sticky;
        top: 0;
        z-index: 60;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding: 10px 10px;
        border-radius: 14px;
        background: rgba(0,0,0,.22);
        border: 1px solid rgba(255,255,255,.10);
        backdrop-filter: blur(12px);
        box-shadow: 0 14px 38px rgba(0,0,0,.35);
        margin-bottom: 10px;
      }
      #missionsRoot .m-topbar .m-top-left{ min-width:0; }
      #missionsRoot .m-topbar .m-top-title{
        font-weight: 950;
        letter-spacing: .8px;
        text-transform: uppercase;
        font-size: 12px;
        opacity: .92;
      }
      #missionsRoot .m-topbar .m-top-sub{
        font-size: 12.5px;
        opacity: .78;
        margin-top: 2px;
      }
      #missionsRoot .m-topbar .m-top-actions{ display:flex; gap:8px; flex-wrap:wrap; }

      /* Stage wrapper */
      #missionsRoot .m-stage{
        position:relative;
        border:1px solid rgba(36,50,68,.95);
        border-radius:16px;
        padding:14px;
        background:
          radial-gradient(circle at 18% 10%, rgba(0,229,255,.10), transparent 55%),
          radial-gradient(circle at 82% 92%, rgba(255,176,0,.10), transparent 58%),
          linear-gradient(to bottom, rgba(6,10,14,.55), rgba(6,10,14,.86)),
          var(--missions-bg);
        background-position:center;
        background-size:cover;
        background-repeat:no-repeat;
        box-shadow:
          0 18px 48px rgba(0,0,0,.62),
          inset 0 1px 0 rgba(255,255,255,.08),
          inset 0 0 0 1px rgba(0,229,255,.06);
        outline:1px solid rgba(0,229,255,.08);
        overflow:hidden;
      }

      /* WAITING background */
      #missionsRoot .m-stage.m-stage-wait{
        background:
          radial-gradient(circle at 18% 10%, rgba(0,229,255,.10), transparent 55%),
          radial-gradient(circle at 82% 92%, rgba(255,176,0,.10), transparent 58%),
          linear-gradient(to bottom, rgba(6,10,14,.55), rgba(6,10,14,.86)),
          var(--missions-wait-bg);
        background-position:center;
        background-size:cover;
        background-repeat:no-repeat;
      }

      #missionsRoot .m-stage::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        z-index:0;
        background:
          radial-gradient(circle at 50% 40%, rgba(0,0,0,.06), rgba(0,0,0,.56) 78%, rgba(0,0,0,.74) 100%),
          repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,.030),
            rgba(255,255,255,.030) 1px,
            rgba(0,0,0,0) 3px,
            rgba(0,0,0,0) 6px
          );
        opacity:.28;
        mix-blend-mode: overlay;
      }
      #missionsRoot .m-stage::after{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        z-index:0;
        background: var(--missions-dust);
        background-size: cover;
        background-position: center;
        opacity: .18;
        mix-blend-mode: screen;
      }
      #missionsRoot .m-stage > *{ position:relative; z-index:1; }

      /* Cards */
      #missionsRoot .m-card{
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 14px;
        padding: 12px;
        background: rgba(0,0,0,.20);
        color: rgba(255,255,255,.92);
        backdrop-filter: blur(10px);
        box-shadow: 0 16px 34px rgba(0,0,0,.32);
      }
      #missionsRoot .m-title{ font-weight:950; letter-spacing:.2px; }
      #missionsRoot .m-muted{ opacity:.78; font-size:12.5px; line-height:1.35; }

      #missionsRoot .m-hr{
        height:1px;
        background: rgba(255,255,255,.08);
        margin:10px 0;
      }

      /* Offer cards (AAA) */
      #missionsRoot .m-offers{
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      #missionsRoot .m-offer{
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        border-radius:14px;
        padding:12px;
        display:flex;
        gap:12px;
        align-items:stretch;
      }
      #missionsRoot .m-offer:hover{
        border-color: rgba(0,229,255,.18);
        box-shadow: 0 12px 26px rgba(0,0,0,.30);
      }
      #missionsRoot .m-offer-left{ flex: 1 1 auto; min-width:0; }
      #missionsRoot .m-offer-right{ flex: 0 0 auto; display:flex; align-items:center; }
      #missionsRoot .m-tag{
        display:inline-flex;
        gap:6px;
        align-items:center;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(0,0,0,.20);
        font-size: 11.5px;
        opacity: .92;
      }
      #missionsRoot .m-chips{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      #missionsRoot .m-chip{
        display:inline-flex;
        gap:6px;
        align-items:center;
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(0,0,0,.22);
        font-size: 12px;
        opacity: .92;
      }
      #missionsRoot .m-chip b{ opacity: 1; }

      #missionsRoot button[disabled]{ opacity:.55; cursor:not-allowed; }

      /* WAITING center */
      #missionsRoot .m-wait-center{
        min-height: 360px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        text-align:center;
        gap:10px;
        padding:18px;
      }
      #missionsRoot .m-clock{
        font-size: 56px;
        font-weight: 1000;
        letter-spacing: 1px;
        text-shadow: 0 10px 26px rgba(0,0,0,.60);
        margin-top: 2px;
      }
      #missionsRoot .m-clock-sub{
        font-size: 12.5px;
        opacity: .86;
      }

      #missionsRoot .m-bar{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background: rgba(255,255,255,.10);
        border: 1px solid rgba(255,255,255,.10);
        width: min(560px, 94%);
        margin-top: 10px;
      }
      #missionsRoot .m-bar-fill{
        height:100%;
        width:0%;
        background: linear-gradient(90deg, rgba(0,229,255,.65), rgba(43,139,217,.92));
        transition: width .25s linear;
      }

      #missionsRoot .m-actions{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        justify-content:center;
        margin-top: 12px;
      }

      /* Rare drop card under progress bar */
      #missionsRoot .m-drop{
        display:flex;
        gap:12px;
        align-items:center;
        border-radius: 14px;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(0,0,0,.22);
        backdrop-filter: blur(10px);
        box-shadow: 0 16px 34px rgba(0,0,0,.22);
      }
      #missionsRoot .m-drop-thumb{
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(0,0,0,.18);
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        flex: 0 0 auto;
      }
      #missionsRoot .m-drop-thumb img{
        width: 38px;
        height: 38px;
        object-fit: contain;
        image-rendering: auto;
      }
      #missionsRoot .m-drop-meta{ min-width:0; text-align:left; }
      #missionsRoot .m-drop-name{ font-weight: 950; font-size: 12px; letter-spacing:.6px; text-transform: uppercase; opacity:.92; }
      #missionsRoot .m-drop-sub{ font-size: 12.5px; opacity:.82; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

      /* Claim screen */
      #missionsRoot .m-claim-title{
        font-weight: 1000;
        font-size: 18px;
        letter-spacing: .2px;
      }
      #missionsRoot .m-claim-lines{
        margin-top: 10px;
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      #missionsRoot .m-line{
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        text-align:left;
        white-space:pre-wrap;
        font-size: 12.8px;
        opacity: .92;
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

    _modal.addEventListener("click", (e) => {
      if (e.target === _modal) close();
    });

    _modal.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button[data-act], [data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (!act) return;

      if (act === "sync")    return void loadState();
      if (act === "refresh") return void doRefresh();
      if (act === "start")   return void doStart(btn.dataset.tier || "", btn.dataset.offer || "");
      if (act === "resolve") return void doResolve();
      if (act === "close")   return void close();
      if (act === "back_to_offers") { _pendingStart = null; stopTick(); _claimFlash = null; return void loadState(); }
      if (act === "to_offers") { _claimFlash = null; _pendingStart = null; stopTick(); return void loadState(); }
    });

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
  }

  function ensureModal() {
    ensureStyles();

    _modal = el("missionsBack") || el("missionsModal");
    _root  = el("missionsRoot");

    if (_modal && _root) {
      bindOnceModalClicks();
      return;
    }

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="missionsModal" style="position:fixed; inset:0; display:none; align-items:center; justify-content:center; padding:12px; background:rgba(0,0,0,.72); z-index:999999;">
        <div style="width:min(560px, 100%); max-height:calc(100vh - 24px); overflow:hidden; background:rgba(14,16,18,.92); border:1px solid rgba(255,255,255,.10); border-radius:16px; box-shadow:0 18px 60px rgba(0,0,0,.65); display:flex; flex-direction:column; min-height:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 12px 0 12px;">
            <div style="font-weight:900;color:#fff;">EXPEDITIONS</div>
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

  function open() {
    ensureModal();
    if (!_modal) return false;

    _modal.style.display = "flex";
    _modal.classList.add("is-open");
    document.body.classList.add("missions-open");

    try { window.navOpen?.(_modal.id); } catch (_) {}

    renderLoading("Loading expeditions…");
    loadState();
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
  // Server clock + helpers
  // =========================
  let _serverOffsetSec = 0;

  function _syncServerClock(payload) {
    const nowTs = Number(payload?.now_ts || payload?.nowTs || 0);
    if (!nowTs) return;
    const clientNow = Date.now() / 1000;
    _serverOffsetSec = nowTs - clientNow;
  }

  function _nowSec() { return (Date.now() / 1000) + _serverOffsetSec; }

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
  // Cache helpers (timer comes back after leaving missions)
  // =========================
  function _cacheSaveActive(a) {
    try {
      if (!a || !a.status || a.status === "NONE") return;
      const payload = {
        title: a.title || "Mission",
        started_ts: Number(a.started_ts || 0),
        ends_ts: Number(a.ends_ts || 0),
        duration_sec: Number(a.duration_sec || a.total || 0),
        saved_at: Date.now()
      };
      if (!payload.ends_ts) return;
      sessionStorage.setItem(_CACHE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function _cacheClearActive() {
    try { sessionStorage.removeItem(_CACHE_KEY); } catch (_) {}
  }

  function _cacheLoadActive() {
    try {
      const raw = sessionStorage.getItem(_CACHE_KEY);
      if (!raw) return null;
      const j = JSON.parse(raw);
      const ends = Number(j?.ends_ts || 0);
      if (!ends) return null;
      const now = _nowSec();
      const remaining = Math.max(0, Math.ceil(ends - now));
      const dur = Math.max(1, Number(j?.duration_sec || 1));
      const pct = Math.min(1, Math.max(0, 1 - (remaining / dur)));
      if (remaining <= 0) return { status: "READY", title: j.title || "Mission", remaining: 0, total: dur, pct: 1, readyAt: _fmtClock(ends), ends_ts: ends, duration_sec: dur, started_ts: Number(j?.started_ts || 0), __cached: true };
      return { status: "RUNNING", title: j.title || "Mission", remaining, total: dur, pct, readyAt: _fmtClock(ends), ends_ts: ends, duration_sec: dur, started_ts: Number(j?.started_ts || 0), __cached: true };
    } catch (_) { return null; }
  }

  // =========================
  // Active parsing
  // =========================
  let _legacyAnchor = null;

  function _pickActiveFromList(list) {
    if (!Array.isArray(list)) return null;
    return list.find(m => {
      const st = String(m?.state || m?.status || "").toLowerCase();
      return st === "in_progress" || st === "running" || st === "active" || st === "completed" || st === "ready";
    }) || null;
  }

  function getActive(payload) {
    const am =
      payload?.active_mission ||
      payload?.activeMission ||
      payload?.active ||
      payload?.current_mission ||
      payload?.currentMission ||
      payload?.mission ||
      payload?.current ||
      _pickActiveFromList(payload?.user_missions || payload?.userMissions || payload?.missions) ||
      null;

    if (!am || typeof am !== "object") return { status: "NONE" };

    const title = am.title || am.name || am.label || "Mission";

    const started = Number(am.started_ts || am.start_ts || am.start_time || am.startTime || 0);
    const dur = Number(am.duration_sec || am.duration || am.durationSec || 0);
    const ends =
      Number(am.ends_ts || am.ready_at_ts || am.ready_at || am.endsTs || 0) ||
      (started && dur ? (started + dur) : 0);

    const stRaw = String(am.status || am.state || "").toUpperCase();

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

  function _activeFromPending() {
    if (!_pendingStart) return { status: "NONE" };
    const now = _nowSec();
    const started = Number(_pendingStart.startedClientSec || now);
    const dur = Math.max(1, Number(_pendingStart.durationSec || 60));
    const ends = started + dur;
    const remaining = Math.max(0, Math.ceil(ends - now));
    const pct = Math.min(1, Math.max(0, 1 - (remaining / dur)));
    return {
      status: remaining > 0 ? "RUNNING" : "READY",
      title: _pendingStart.title || "Mission",
      started_ts: started,
      duration_sec: dur,
      ends_ts: ends,
      remaining,
      total: dur,
      pct,
      readyAt: _fmtClock(ends),
      __pending: true,
    };
  }

  function _pendingValid() {
    return !!(_pendingStart && Date.now() < Number(_pendingStart.untilMs || 0));
  }

  // ✅ key fix: if backend still returns old READY, don't kill pending timer
  function _preferPendingOverReal(realActive) {
    if (!_pendingValid()) return false;
    if (!realActive || realActive.status === "NONE") return true;
    if (realActive.status === "RUNNING") return false;

    // if stale READY is still around (common right after resolve/start), prefer pending
    if (realActive.status === "READY") {
      const pendStarted = Number(_pendingStart?.startedClientSec || 0);
      const realEnds = Number(realActive?.ends_ts || 0);
      if (!realEnds) return true;
      if (pendStarted && realEnds <= (pendStarted + 2)) return true;
      // also: right after resolve, backend may briefly still say READY
      if (Date.now() - _justResolvedAt < 3500) return true;
    }
    return false;
  }

  // =========================
  // Tick
  // =========================
  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      const real = payload ? getActive(payload) : { status: "NONE" };
      const a = _preferPendingOverReal(real) ? _activeFromPending() : real;
      if (a.status === "NONE") return;
      paintWaiting(a);
    }, 1000);
  }

  function stopTick() {
    if (_tick) clearInterval(_tick);
    _tick = null;
  }

  // =========================
  // API + normalize (keeps extras)
  // =========================
  async function api(path, body) {
    if (!_apiPost) throw new Error("Missions: apiPost missing");
    const res = await _apiPost(path, body);

    if (res && typeof res === "object" && res.ok === false) {
      const reason = res.reason || res.error || "NOT_OK";
      throw new Error(String(reason));
    }
    return res;
  }

  function _mergeExtras(base, src, skipSet) {
    if (!src || typeof src !== "object") return base;
    for (const k of Object.keys(src)) {
      if (skipSet && skipSet.has(k)) continue;
      if (base[k] === undefined) base[k] = src[k];
    }
    return base;
  }

  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;

    if (res.state && typeof res.state === "object") {
      const base = { ...res.state };
      _mergeExtras(base, res, new Set(["state", "ok"]));
      return base;
    }

    if (res.data && typeof res.data === "object") {
      const d = res.data;
      if (d.state && typeof d.state === "object") {
        const base = { ...d.state };
        _mergeExtras(base, d, new Set(["state", "ok"]));
        _mergeExtras(base, res, new Set(["data", "ok"]));
        return base;
      }
      const base = { ...d };
      _mergeExtras(base, res, new Set(["data", "ok"]));
      return base;
    }

    if (res.payload && typeof res.payload === "object") {
      const p = res.payload;
      if (p.state && typeof p.state === "object") {
        const base = { ...p.state };
        _mergeExtras(base, p, new Set(["state", "ok"]));
        _mergeExtras(base, res, new Set(["payload", "ok"]));
        return base;
      }
      const base = { ...p };
      _mergeExtras(base, res, new Set(["payload", "ok"]));
      return base;
    }

    if (res.result && typeof res.result === "object") {
      const r = res.result;
      if (r.state && typeof r.state === "object") {
        const base = { ...r.state };
        _mergeExtras(base, r, new Set(["state", "ok"]));
        _mergeExtras(base, res, new Set(["result", "ok"]));
        return base;
      }
      const base = { ...r };
      _mergeExtras(base, res, new Set(["result", "ok"]));
      return base;
    }

    return res;
  }

  // =========================
  // Drop preview (rare drop)
  // =========================
  function _pickDropPreview(o) {
    if (!o || typeof o !== "object") return null;

    const d =
      o.dropPreview || o.drop_preview ||
      o.rareDrop || o.rare_drop ||
      o.drop || o.item_drop || null;

    const icon =
      (d && (d.icon || d.img || d.image || d.url)) ||
      o.dropIcon || o.drop_icon ||
      o.itemIcon || o.item_icon || "";

    const name =
      (d && (d.name || d.title || d.label)) ||
      o.dropName || o.drop_name ||
      o.itemName || o.item_name || "";

    const rarity =
      (d && (d.rarity || d.tier)) ||
      o.dropRarity || o.drop_rarity || "";

    const chance =
      (d && (d.chance || d.rate)) ||
      o.dropChance || o.drop_chance || "";

    if (!icon && !name) return null;

    let iconUrl = String(icon || "");
    if (iconUrl && !iconUrl.startsWith("http") && !iconUrl.startsWith("/")) {
      // best-effort fallback — you can later swap to /assets/equip if needed
      iconUrl = `/assets/items/${iconUrl}`;
    }

    return { icon: iconUrl, name, rarity, chance };
  }

  function _getWaitDrop(active, payload) {
    if (active?.__pending && _pendingStart?.offerId) {
      const offers = Array.isArray(payload?.offers) ? payload.offers : [];
      const o = offers.find(x => String(x?.offerId || x?.id || x?.offer_id || "") === String(_pendingStart.offerId));
      const d = _pickDropPreview(o);
      if (d) return d;
    }

    const am =
      payload?.active_mission || payload?.activeMission || payload?.active ||
      payload?.current_mission || payload?.currentMission || payload?.mission || payload?.current ||
      null;

    const d2 = _pickDropPreview(am);
    if (d2) return d2;

    const ao = payload?.active_offer || payload?.activeOffer || payload?.current_offer || payload?.currentOffer || null;
    const d3 = _pickDropPreview(ao);
    if (d3) return d3;

    return null;
  }

  function _renderWaitDrop(drop) {
    if (!drop) return "";
    const name = drop.name || "Rare drop";
    const chance = drop.chance ? ` · ${drop.chance}` : "";
    return `
      <div class="m-drop" style="width:min(640px,100%); margin-top:12px;">
        <div class="m-drop-thumb" data-rarity="${esc(drop.rarity || "")}">
          ${drop.icon ? `
            <img src="${esc(drop.icon)}" alt="" loading="lazy"
              onerror="this.style.display='none'; this.parentNode.style.opacity='.55';"
            />
          ` : ``}
        </div>
        <div class="m-drop-meta">
          <div class="m-drop-name">Possible rare drop</div>
          <div class="m-drop-sub">${esc(name)}${esc(chance)}</div>
        </div>
      </div>
    `;
  }

  // =========================
  // Rendering helpers
  // =========================
  function _topbar(sub) {
    return `
      <div class="m-topbar">
        <div class="m-top-left" style="min-width:0;">
          <div class="m-top-title">EXPEDITIONS</div>
          <div class="m-top-sub">${esc(sub || "")}</div>
        </div>
        <div class="m-top-actions">
          <button type="button" class="btn" data-act="sync">Sync</button>
          <button type="button" class="btn" data-act="close">Close</button>
        </div>
      </div>
    `;
  }

  function renderLoading(msg) {
    if (!_root) return;
    _root.innerHTML = `
      ${_topbar("Loading…")}
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
      ${_topbar("Error")}
      <div class="m-stage">
        <div class="m-card">
          <div class="m-title">${esc(title)}</div>
          <div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(detail || "")}</div>
          <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn" data-act="sync">Sync</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
      </div>
    `;
    stopTick();
  }

  function renderOffer(o, realActive) {
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

    const hasActive = !!(realActive?.status && realActive.status !== "NONE");
    const disabled = hasActive ? "disabled" : "";

    const drop = _pickDropPreview(o);
    const dropMini = drop ? `
      <div class="m-tag" title="Possible rare drop" style="margin-top:8px;">
        <span style="opacity:.9;">✦</span>
        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:240px;">
          ${esc(drop.name || "Rare drop")}
        </span>
      </div>
    ` : ``;

    return `
      <div class="m-offer">
        <div class="m-offer-left">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span class="m-tag"><b>${esc(label)}</b></span>
            <span class="m-tag">⏱ ${esc(dur)}</span>
          </div>

          ${title ? `<div class="m-title" style="margin-top:8px;">${esc(title)}</div>` : ""}
          ${desc ? `<div class="m-muted" style="margin-top:6px;">${esc(desc)}</div>` : ""}

          <div class="m-chips">
            <span class="m-chip">XP <b>${esc(xp)}</b></span>
            <span class="m-chip">Bones <b>${esc(bones)}</b></span>
            <span class="m-chip">Rolls <b>${esc(rolls)}</b></span>
          </div>

          ${dropMini}
        </div>

        <div class="m-offer-right">
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
      <div class="m-card" style="margin-top:10px;">
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

  function _renderClaim(last) {
    const lines = [];
    const rewardMsg = String(last?.rewardMsg || last?.reward_msg || "");
    const lootMsg = String(last?.lootMsg || last?.loot_msg || "");
    const tokenLootMsg = String(last?.tokenLootMsg || last?.token_loot_msg || "");

    if (rewardMsg) lines.push(rewardMsg);
    if (lootMsg) lines.push(lootMsg);
    if (tokenLootMsg) lines.push(tokenLootMsg);

    const safeLines = lines.length ? lines : ["Rewards synced."];

    return `
      ${_topbar("Rewards claimed")}
      <div class="m-stage">
        <div class="m-card">
          <div class="m-claim-title">CLAIMED ✅</div>
          <div class="m-muted" style="margin-top:6px;">Run completed. Your loot:</div>

          <div class="m-claim-lines">
            ${safeLines.map(t => `<div class="m-line">${esc(t)}</div>`).join("")}
          </div>

          <div class="m-actions" style="margin-top:14px;">
            <button type="button" class="btn primary" data-act="to_offers">New run</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  function paintWaiting(a) {
    const clockEl = el("mClock");
    const subEl = el("mClockSub");
    const fillEl = el("mFill");
    const resolveBtn = el("mResolveBtn");

    if (!clockEl || !subEl || !fillEl) return;

    const status = a?.status || "NONE";
    const remaining = Number(a.remaining || 0);
    const pct = Math.round((Number(a.pct || 0)) * 100);

    fillEl.style.width = `${pct}%`;

    if (status === "RUNNING") {
      clockEl.textContent = _fmtTime(remaining);
      const syncing = (a.__pending || a.__cached) ? ` · <span style="opacity:.9">Syncing…</span>` : "";
      subEl.innerHTML = `Progress <b>${esc(pct)}%</b>${a.readyAt ? ` · Ready at <b>${esc(a.readyAt)}</b>` : ""}${syncing}`;
      if (resolveBtn) resolveBtn.style.display = "none";
    } else {
      clockEl.textContent = "READY";
      subEl.textContent = "Claim rewards to complete the run.";
      if (resolveBtn) resolveBtn.style.display = "";
    }

    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";
  }

  function _optimisticStart(tier, offerId) {
    const payload = normalizePayload(_state) || {};
    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const o = offers.find(x => String(x?.offerId || x?.id || x?.offer_id || "") === String(offerId));

    const durSec = Number(o?.durationSec || o?.duration_sec || 0) || 60;
    const started = Math.floor(_nowSec());
    const title = String(o?.title || o?.label || tier || "Mission");

    _pendingStart = {
      tier,
      offerId,
      startedClientSec: started,
      durationSec: durSec,
      title,
      // ✅ keep optimistic timer until mission would be ready (+30s buffer)
      untilMs: Date.now() + (durSec * 1000) + 30000,
    };

    render();
  }

  function render() {
    if (!_root) return;

    // claim screen has priority
    if (_claimFlash && (Date.now() - _claimFlash.atMs < 25000) && _claimFlash.last) {
      _root.innerHTML = _renderClaim(_claimFlash.last);
      stopTick();
      return;
    }

    const payload = normalizePayload(_state);
    if (!payload || typeof payload !== "object") {
      renderError("Bad payload", JSON.stringify(_state).slice(0, 900));
      return;
    }

    _syncServerClock(payload);

    const offers = Array.isArray(payload.offers) ? payload.offers : [];

    const realActive = getActive(payload);

    // prefer pending over stale READY
    let active = _preferPendingOverReal(realActive) ? _activeFromPending() : realActive;

    // if backend says NONE but we have cache, keep timer alive
    if (active.status === "NONE" && !_pendingValid()) {
      const cached = _cacheLoadActive();
      if (cached && cached.status !== "NONE") active = cached;
    }

    // save cache when we have ends_ts
    if (active && active.status !== "NONE") _cacheSaveActive(active);
    else _cacheClearActive();

    const last = payload.lastResolve || payload.last_resolve || null;

    // WAITING view
    if (active.status && active.status !== "NONE") {
      const waitDropHtml = _renderWaitDrop(_getWaitDrop(active, payload));

      _root.innerHTML = `
        ${_topbar(active.status === "READY" ? "Ready to claim" : "In progress")}
        <div class="m-stage m-stage-wait">
          <div class="m-wait-center">
            <div class="m-muted">${esc(active.title || "Mission")}</div>
            <div id="mClock" class="m-clock">—</div>
            <div id="mClockSub" class="m-clock-sub">—</div>

            <div class="m-bar"><div id="mFill" class="m-bar-fill" style="width:0%"></div></div>

            ${waitDropHtml}

            <div class="m-actions">
              <button type="button" class="btn" data-act="sync">Sync</button>
              <button id="mResolveBtn" type="button" class="btn primary" data-act="resolve" style="display:none">CLAIM REWARDS</button>
              ${active.__pending ? `<button type="button" class="btn" data-act="back_to_offers">Back</button>` : ``}
              <button type="button" class="btn" data-act="close">Close</button>
            </div>

            ${last ? `<div style="width:min(640px,100%); margin-top:14px;">${renderLast(last)}</div>` : ``}
          </div>
        </div>
      `;

      paintWaiting(active);
      startTick();
      return;
    }

    stopTick();

    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "";

    _root.innerHTML = `
      ${_topbar("Pick a run")}
      <div class="m-stage">
        <div class="m-card">
          <div class="m-title">No active expedition</div>
          <div class="m-muted" style="margin-top:6px;">Pick a tier — Start → Wait → Claim.</div>
          <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn" data-act="refresh">Refresh offers</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>

        <div class="m-card" style="margin-top:10px;">
          <div class="m-title">Offers</div>
          <div class="m-muted" style="margin-top:6px;">Choose your run.</div>

          <div class="m-hr"></div>

          <div class="m-offers">
            ${
              offers.length
                ? offers.map(o => renderOffer(o, realActive)).join("")
                : `<div class="m-muted">No offers yet. Tap “Refresh offers”.</div>`
            }
          </div>
        </div>

        ${last ? renderLast(last) : ""}

        <div class="m-muted" style="text-align:center; opacity:.85; margin-top:10px;">
          Missions are backend-driven. If backend is offline you’ll see an error here.
        </div>
      </div>
    `;
  }

  // =========================
  // Sync after start — confirm RUNNING (not just READY)
  // =========================
  async function _syncAfterStart(maxMs = 7500, intervalMs = 450) {
    const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      try {
        const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
        _state = res;

        try {
          window.__AH_MISSIONS_RAW = res;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
        } catch (_) {}

        const p = normalizePayload(res);
        const a = p ? getActive(p) : { status: "NONE" };

        // ✅ only accept RUNNING as "start confirmed"
        if (a.status === "RUNNING") {
          _pendingStart = null;
          render();
          return true;
        }

        // if backend still says READY/NONE during this window, keep pending alive
      } catch (_) {}
      await sleep(intervalMs);
    }
    return false;
  }

  // =========================
  // Actions
  // =========================
  async function loadState() {
    renderLoading("Loading expeditions…");
    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
      _state = res;

      try {
        window.__AH_MISSIONS_RAW = res;
        window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
      } catch (_) {}

      // hydrate claim flash last from payload
      const p = normalizePayload(_state);
      const last = p?.lastResolve || p?.last_resolve || null;
      if (_claimFlash && !_claimFlash.last && last) _claimFlash.last = last;

      render();
    } catch (e) {
      renderError("Missions backend error", String(e?.message || e || ""));
    }
  }

  async function doRefresh() {
    try {
      await api("/webapp/missions/action", { action: "refresh_offers", run_id: rid("m:refresh") });
      await loadState();
    } catch (e) {
      renderError("Refresh failed", String(e?.message || e || ""));
    }
  }

  async function doStart(tier, offerId) {
    try {
      const startRes = await api("/webapp/missions/action", {
        action: "start",
        tier,
        offerId,
        id: offerId,
        offer_id: offerId,
        run_id: rid("m:start"),
      });

      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      // optimistic wait immediately (prevents blink)
      _optimisticStart(tier, offerId);

      // accept returned object but do NOT let stale READY kill pending
      if (startRes && typeof startRes === "object") {
        _state = startRes;
        try {
          window.__AH_MISSIONS_RAW = startRes;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(startRes);
        } catch (_) {}
        render();
      }

      const ok = await _syncAfterStart();
      if (!ok) log("start: backend did not confirm RUNNING within window");
      return;

    } catch (e) {
      const msg = String(e?.message || e || "");
      if (msg.toUpperCase() === "ACTIVE") {
        // user still has an active/ready run
        await loadState();
        return;
      }
      _pendingStart = null;
      renderError("Start failed", msg);
    }
  }

  async function doResolve() {
    try {
      // show claim syncing immediately
      _claimFlash = { atMs: Date.now(), last: null };
      _justResolvedAt = Date.now();

      const res = await api("/webapp/missions/action", { action: "resolve", run_id: rid("m:resolve") });
      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}

      _pendingStart = null;
      _cacheClearActive();

      // if backend returned payload with lastResolve, show instantly
      if (res && typeof res === "object") {
        _state = res;
        const p = normalizePayload(res);
        const last = p?.lastResolve || p?.last_resolve || null;
        if (last) _claimFlash.last = last;
      }

      // refresh state to ensure offers + lastResolve are synced
      await loadState();

      // if still stuck on READY after resolve, keep claim screen but user can Sync
      return;
    } catch (e) {
      _claimFlash = null;
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

    // ✅ Point C: if Missions modal already open (hot reload), rebind + resync
    try {
      if (_modal?.classList?.contains("is-open")) {
        loadState();
      }
    } catch (_) {}

    log("init ok");
  }

  window.Missions = { init, open, close, reload: loadState };
})();
