// js/missions.js — WebApp Missions (EXPEDITIONS) UI (AAA vibe)
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

  let _busy = false;

  // ✅ start sync guard (prevents "blink back to offers")
  let _pendingStart = null; // { tier, offerId, startedClientSec, durationSec, title, untilMs }

  // ✅ Rewards screen after resolve (AAA)
  let _reveal = null; // { title, text, ts }

  // ✅ lifecycle handler guard
  let _lifeBound = false;

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // =========================
  // Time normalization helpers (sec vs ms resilience)
  // =========================
  function _sec(x) {
    const n = Number(x || 0);
    if (!n) return 0;
    if (n > 2e10) return Math.floor(n / 1000);
    return n;
  }
  function _nowRealSec() { return Date.now() / 1000; }

  // =========================
  // Pending persistence (fix: timer missing after reopen / focus)
  // =========================
  const _PKEY = "ah_missions_pending_v1";

  function _savePending() {
    try {
      if (!_pendingStart) { sessionStorage.removeItem(_PKEY); return; }
      sessionStorage.setItem(_PKEY, JSON.stringify(_pendingStart));
    } catch (_) {}
  }

  function _loadPending() {
    try {
      const raw = sessionStorage.getItem(_PKEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return;

      const untilMs = Number(obj.untilMs || 0);
      if (!untilMs || Date.now() > untilMs) {
        sessionStorage.removeItem(_PKEY);
        return;
      }
      _pendingStart = obj;
    } catch (_) {}
  }

  function _clearPending() {
    _pendingStart = null;
    try { sessionStorage.removeItem(_PKEY); } catch (_) {}
  }

  function _pendingValid() {
    return !!(_pendingStart && Date.now() < Number(_pendingStart.untilMs || 0));
  }

  // =========================
  // Styles (FULL SCREEN + AAA mission cards + reward screen + drop preview)
  // =========================
  function ensureStyles() {
    if (document.getElementById("missions-ui-css")) return;

    const st = document.createElement("style");
    st.id = "missions-ui-css";
    st.textContent = `
      :root{
        /* ✅ ZMIEŃ jeśli pliki są w innym folderze względem index.html */
        --missions-bg: url("mission_bg.webp");
        --missions-wait-bg: url("mission_waiting_bg.webp");
        --missions-dust: url("dust.png");
      }

      #missionsRoot{ display:block !important; }

      /* ✅ FULL SCREEN sheet */
      #missionsBack{
        position:fixed !important;
        inset:0 !important;
        z-index: 99999999 !important;
        display:none;
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

      /* wipe common wrappers so background shows through */
      #missionsBack > *,
      #missionsBack .modal,
      #missionsBack .panel,
      #missionsBack .sheet,
      #missionsBack .modal-panel,
      #missionsBack #missionsModal,
      #missionsBack [class*="modal"],
      #missionsBack [class*="panel"],
      #missionsBack [class*="sheet"]{
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

      /* content scroll area */
      #missionsBack #missionsRoot{
        flex: 1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
        -webkit-overflow-scrolling:touch;
        padding: 12px 12px calc(18px + env(safe-area-inset-bottom)) 12px !important;
      }

      /* optional sticky bottom row from index */
      #missionsBack .btn-row{
        position:sticky !important;
        bottom:0 !important;
        padding: 12px 12px calc(12px + env(safe-area-inset-bottom)) 12px !important;
        background: rgba(0,0,0,.22) !important;
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(255,255,255,.08) !important;
      }

      /* =========================
         AAA topbar
         ========================= */
      #missionsRoot .m-topbar{
        position: sticky;
        top: 0;
        z-index: 6;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding: 10px 10px;
        margin-bottom: 10px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.22);
        backdrop-filter: blur(12px);
        box-shadow: 0 12px 28px rgba(0,0,0,.30);
      }
      #missionsRoot .m-topbar-title{
        font-weight: 950;
        letter-spacing: .8px;
        text-transform: uppercase;
        font-size: 13px;
        opacity: .92;
      }
      #missionsRoot .m-topbar-sub{
        margin-top: 2px;
        font-size: 12px;
        opacity: .72;
      }
      #missionsRoot .m-topbar-actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      /* Base stage */
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

      #missionsRoot .m-card{
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 14px;
        padding: 12px;
        background: rgba(0,0,0,.20);
        color: rgba(255,255,255,.92);
        backdrop-filter: blur(10px);
        box-shadow: 0 16px 34px rgba(0,0,0,.32);
      }

      #missionsRoot .m-title{ font-weight:900; letter-spacing:.2px; }
      #missionsRoot .m-muted{ opacity:.78; font-size:12.5px; line-height:1.35; }

      #missionsRoot .m-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }

      #missionsRoot .m-hr{
        height:1px;
        background: rgba(255,255,255,.08);
        margin:10px 0;
      }

      /* =========================
         AAA Mission Cards (Offers)
         ========================= */
      #missionsRoot .m-offers{
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      #missionsRoot .m-mcard{
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        border-radius: 16px;
        padding: 12px;
        box-shadow: 0 16px 34px rgba(0,0,0,.22);
        overflow:hidden;
        position:relative;
      }
      #missionsRoot .m-mcard:hover{
        border-color: rgba(0,229,255,.18);
        box-shadow: 0 18px 42px rgba(0,0,0,.28);
      }
      #missionsRoot .m-mcard::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        opacity:.14;
        background:
          radial-gradient(circle at 20% 15%, rgba(0,229,255,.24), transparent 50%),
          radial-gradient(circle at 85% 90%, rgba(255,176,0,.18), transparent 55%);
      }

      #missionsRoot .m-mcard > *{ position:relative; z-index:1; }

      #missionsRoot .m-mhead{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }

      #missionsRoot .m-badge{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding: 6px 10px;
        border-radius: 999px;
        border:1px solid rgba(255,255,255,.12);
        background: rgba(0,0,0,.22);
        font-weight: 950;
        letter-spacing: .6px;
        text-transform: uppercase;
        font-size: 11px;
        opacity: .92;
      }
      #missionsRoot .m-pill{
        display:inline-flex;
        align-items:center;
        padding: 6px 10px;
        border-radius: 999px;
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        font-size: 11.5px;
        opacity: .86;
      }

      #missionsRoot .m-mtitle{
        margin-top: 10px;
        font-weight: 950;
        letter-spacing: .2px;
        font-size: 14px;
      }

      #missionsRoot .m-mdesc{
        margin-top: 6px;
        opacity: .80;
        font-size: 12.5px;
        line-height: 1.35;
      }

      #missionsRoot .m-chips{
        margin-top: 10px;
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }
      #missionsRoot .m-chip{
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding: 7px 10px;
        border-radius: 999px;
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        font-size: 12px;
        opacity: .92;
        white-space:nowrap;
      }
      #missionsRoot .m-chip b{ font-weight: 950; }

      #missionsRoot .m-foot{
        margin-top: 12px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }

      /* Drop preview (future S&F style) */
      #missionsRoot .m-drop{
        display:flex;
        align-items:center;
        gap:10px;
        padding: 10px;
        border-radius: 14px;
        border: 1px dashed rgba(255,255,255,.16);
        background: rgba(0,0,0,.16);
        margin-top: 10px;
      }
      #missionsRoot .m-drop-thumb{
        width:44px;
        height:44px;
        border-radius: 12px;
        border:1px solid rgba(255,255,255,.12);
        background: rgba(0,0,0,.22);
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        flex: 0 0 auto;
      }
      #missionsRoot .m-drop-thumb img{
        width:100%;
        height:100%;
        object-fit:contain;
        display:block;
      }
      #missionsRoot .m-drop-meta{
        min-width:0;
        flex:1 1 auto;
      }
      #missionsRoot .m-drop-name{
        font-weight: 950;
        font-size: 12.5px;
        letter-spacing:.2px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #missionsRoot .m-drop-sub{
        margin-top:2px;
        opacity:.78;
        font-size: 12px;
      }

      /* rarity glow hooks (safe even if not used yet) */
      #missionsRoot .m-drop-thumb[data-rarity="common"]{ box-shadow: 0 0 0 1px rgba(255,255,255,.10), 0 0 14px rgba(255,255,255,.06); }
      #missionsRoot .m-drop-thumb[data-rarity="uncommon"]{ box-shadow: 0 0 0 1px rgba(120,255,120,.18), 0 0 16px rgba(120,255,120,.12); }
      #missionsRoot .m-drop-thumb[data-rarity="rare"]{ box-shadow: 0 0 0 1px rgba(0,229,255,.18), 0 0 18px rgba(0,229,255,.12); }
      #missionsRoot .m-drop-thumb[data-rarity="epic"]{ box-shadow: 0 0 0 1px rgba(200,120,255,.18), 0 0 18px rgba(200,120,255,.12); }
      #missionsRoot .m-drop-thumb[data-rarity="legendary"]{ box-shadow: 0 0 0 1px rgba(255,176,0,.22), 0 0 20px rgba(255,176,0,.14); }

      /* =========================
         WAITING UI
         ========================= */
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
        font-size: 52px;
        font-weight: 950;
        letter-spacing: 1px;
        text-shadow: 0 10px 26px rgba(0,0,0,.60);
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
        width: min(520px, 92%);
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
        margin-top: 10px;
      }

      #missionsRoot .m-claim{
        font-weight: 950 !important;
        letter-spacing: .3px;
        padding: 12px 16px !important;
        transform: translateZ(0);
      }

      /* =========================
         Rewards Reveal Screen
         ========================= */
      #missionsRoot .m-reveal{
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      #missionsRoot .m-reveal-title{
        font-weight: 950;
        letter-spacing: .5px;
        text-transform: uppercase;
        font-size: 13px;
        opacity: .92;
      }
      #missionsRoot .m-reveal-hero{
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.22);
        padding: 14px;
        box-shadow: 0 18px 48px rgba(0,0,0,.28);
        backdrop-filter: blur(10px);
      }
      #missionsRoot .m-reveal-hero h3{
        margin:0;
        font-size: 18px;
        letter-spacing: .2px;
      }
      #missionsRoot .m-reveal-hero p{
        margin:8px 0 0 0;
        opacity:.80;
        white-space:pre-wrap;
        font-size: 12.8px;
        line-height: 1.35;
      }

      @media (max-width: 420px){
        #missionsRoot .m-row{ flex-direction:column; align-items:stretch; }
        #missionsRoot .m-mcard .btn.primary{ width:100%; }
        #missionsRoot .m-actions .btn{ flex: 1 1 auto; }
      }

      #missionsRoot button[disabled]{ opacity:.55; cursor:not-allowed; }
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

      if (act === "refresh") return void doRefresh();
      if (act === "start")   return void doStart(btn.dataset.tier || "", btn.dataset.offer || "");
      if (act === "resolve") return void doResolve();
      if (act === "close")   return void close();
      if (act === "back_to_offers") { _clearPending(); stopTick(); _reveal = null; return void loadState(); }
      if (act === "reveal_continue") { _reveal = null; return void render(); }
      if (act === "reveal_runagain") { _reveal = null; return void doRefresh(); }
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
            <div style="font-weight:900;color:#fff;">Missions</div>
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

  function _setBusy(on) {
    _busy = !!on;
    try {
      if (_root) _root.style.pointerEvents = on ? "none" : "";
      if (_root) _root.style.opacity = on ? "0.92" : "";
    } catch (_) {}
  }

  function open() {
    ensureModal();
    if (!_modal) return false;

    _loadPending();

    _modal.style.display = "flex";
    _modal.classList.add("is-open");
    document.body.classList.add("missions-open");

    try { window.navOpen?.(_modal.id); } catch (_) {}

    if (_pendingValid()) {
      _state = _state || { offers: [], now_ts: Math.floor(_nowRealSec()) };
      render();
    } else {
      renderLoading("Loading missions…");
    }

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
    const nowTsRaw = payload?.now_ts ?? payload?.nowTs ?? 0;
    const nowTs = _sec(nowTsRaw);
    if (!nowTs) return;
    const clientNow = _nowRealSec();
    _serverOffsetSec = nowTs - clientNow;
  }

  function _nowSec() { return _nowRealSec() + _serverOffsetSec; }

  function _fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function _fmtClock(tsSec) {
    try {
      const d = new Date(Number(tsSec) * 1000);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (_) { return ""; }
  }

  // =========================
  // Active parsing (robust)
  // =========================
  let _legacyAnchor = null;

  function _normStatus(st) {
    const s = String(st || "").trim().toLowerCase();
    if (!s) return "";
    if (s === "active") return "running";
    if (s === "in_progress") return "running";
    if (s === "started") return "running";
    if (s === "waiting") return "running";
    if (s === "complete") return "ready";
    if (s === "completed") return "ready";
    if (s === "done") return "ready";
    if (s === "ready") return "ready";
    if (s === "running") return "running";
    return s;
  }

  function _pickActiveFromList(list) {
    if (!Array.isArray(list)) return null;
    return list.find(m => {
      const st = _normStatus(m?.state || m?.status);
      return st === "running" || st === "ready";
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

    const started = _sec(am.started_ts || am.start_ts || am.start_time || am.startTime || am.startedAt || am.started_at || 0);
    const dur = Number(am.duration_sec || am.duration || am.durationSec || am.duration_s || 0);

    let ends = _sec(
      am.ends_ts || am.endsTs ||
      am.ready_at_ts || am.readyAtTs ||
      am.ready_at || am.readyAt ||
      am.finish_ts || am.finishTs ||
      0
    );

    if (!ends && started && dur) ends = started + dur;

    const stRaw = _normStatus(am.status || am.state);

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
        readyAt: am.ready_at_label || am.readyAtLabel || _fmtClock(ends),
      };
    }

    const rawLeft =
      (am.leftSec ?? am.left_sec ?? am.remaining ?? am.remaining_sec ?? am.time_left ?? am.timeLeft ?? 0);
    const left = Number(rawLeft || 0);

    let status = stRaw;
    if (!status) status = (left > 0 ? "running" : "ready");

    if (status === "running") status = "RUNNING";
    else if (status === "ready") status = "READY";
    else status = String(status || "").toUpperCase();

    if (status === "RUNNING") {
      const now = _nowSec();
      if (!_legacyAnchor || _legacyAnchor.left !== left || _legacyAnchor.title !== title) {
        _legacyAnchor = { left, at: now, title };
      }
      const elapsed = Math.max(0, now - _legacyAnchor.at);
      const remaining = Math.max(0, Math.ceil(_legacyAnchor.left - elapsed));
      const total = Math.max(1, dur || _legacyAnchor.left || 1);
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
      return { status: remaining > 0 ? "RUNNING" : "READY", title, remaining, total, pct, readyAt: "" };
    }

    if (status === "READY") {
      return { status: "READY", title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: "" };
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

  // =========================
  // Tick + lifecycle resync
  // =========================
  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      const real = payload ? getActive(payload) : { status: "NONE" };
      const a = (real.status === "NONE" && _pendingValid()) ? _activeFromPending() : real;
      if (a.status === "NONE") return;
      paintWaiting(a);
    }, 1000);
  }

  function stopTick() {
    if (_tick) clearInterval(_tick);
    _tick = null;
  }

  function _bindLifecycle() {
    if (_lifeBound) return;
    _lifeBound = true;

    const resync = async () => {
      try {
        if (!_modal || !_modal.classList.contains("is-open")) return;
        // don't kill reveal screen, just keep state fresh behind
        await loadState({ silent: true });
        if (!_reveal) render();
      } catch (_) {}
    };

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) resync();
    });

    window.addEventListener("focus", () => { resync(); });
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
  // Rendering helpers
  // =========================
  function _topbar(sub) {
    return `
      <div class="m-topbar">
        <div>
          <div class="m-topbar-title">EXPEDITIONS</div>
          <div class="m-topbar-sub">${esc(sub || "")}</div>
        </div>
        <div class="m-topbar-actions">
          <button type="button" class="btn" data-act="refresh">Sync</button>
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
      ${_topbar("Backend issue")}
      <div class="m-stage">
        <div class="m-card">
          <div class="m-title">${esc(title)}</div>
          <div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(detail || "")}</div>
          <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn" data-act="refresh">Retry</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
      </div>
    `;
    stopTick();
  }

  function _pickDropPreview(o) {
    // Allow multiple backend shapes
    const dp =
      o?.drop ||
      o?.dropPreview ||
      o?.rareDrop ||
      o?.rare_drop ||
      o?.preview_item ||
      o?.previewItem ||
      null;

    if (dp && typeof dp === "object") {
      const icon = dp.icon || dp.icon_url || dp.url || dp.img || dp.image || "";
      const name = dp.name || dp.title || dp.label || "";
      const rarity = String(dp.rarity || dp.r || "").toLowerCase();
      const chance = dp.chance || dp.odds || dp.p || "";
      if (icon) return { icon, name, rarity, chance };
    }

    // Try flat fields
    const icon =
      o?.dropIcon || o?.drop_icon || o?.itemIcon || o?.item_icon || o?.previewIcon || o?.preview_icon || "";
    if (icon) {
      return {
        icon,
        name: o?.dropName || o?.drop_name || o?.itemName || o?.item_name || "Rare drop",
        rarity: String(o?.dropRarity || o?.drop_rarity || "").toLowerCase(),
        chance: o?.dropChance || o?.drop_chance || "",
      };
    }
    return null;
  }

  function renderOffer(o, active) {
    const tier  = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const title = String(o?.title || label || "Expedition");
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
    const disabled = (hasActive || _busy) ? "disabled" : "";

    const drop = _pickDropPreview(o);

    return `
      <div class="m-mcard">
        <div class="m-mhead">
          <span class="m-badge">${esc(label)}</span>
          <span class="m-pill">${esc(dur)}</span>
        </div>

        <div class="m-mtitle">${esc(title)}</div>
        ${desc ? `<div class="m-mdesc">${esc(desc)}</div>` : ``}

        <div class="m-chips">
          <span class="m-chip">XP <b>${esc(xp)}</b></span>
          <span class="m-chip">Bones <b>${esc(bones)}</b></span>
          <span class="m-chip">Rolls <b>${esc(rolls)}</b></span>
        </div>

        ${
          drop ? `
          <div class="m-drop">
            <div class="m-drop-thumb" data-rarity="${esc(drop.rarity || "")}">
              <img src="${esc(drop.icon)}" alt="" loading="lazy"
                onerror="this.style.display='none'; this.parentNode.style.opacity='.55';"
              />
            </div>
            <div class="m-drop-meta">
              <div class="m-drop-name">${esc(drop.name || "Rare drop")}</div>
              <div class="m-drop-sub">${esc(drop.chance ? `Chance: ${drop.chance}` : "Rare drop preview")}</div>
            </div>
          </div>
          ` : ``
        }

        <div class="m-foot">
          <div class="m-muted">${esc(hasActive ? "Finish current run to start next." : "Start → Wait → Claim")}</div>

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
    const ts = last?.ts ? new Date(_sec(last.ts) * 1000).toLocaleString() : "";

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
      const syncing = a.__pending ? ` · <span style="opacity:.9">Syncing…</span>` : "";
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
      // keep optimistic timer until mission would be ready (+90s buffer)
      untilMs: Date.now() + (durSec * 1000) + 90000,
    };

    _savePending();
    render();
  }

  function _renderReveal(payload) {
    const last = payload?.lastResolve || payload?.last_resolve || null;
    const msg = String(_reveal?.text || "").trim();
    const fallback = last ? _extractResolveText({ state: payload }) : "";

    const shown = msg || fallback || "Rewards logged. (No reward message returned yet — backend can enrich this later.)";

    return `
      ${_topbar("Rewards secured")}
      <div class="m-stage">
        <div class="m-reveal">
          <div class="m-reveal-title">Claim result</div>

          <div class="m-reveal-hero">
            <h3>${esc(_reveal?.title || "Rewards")}</h3>
            <p>${esc(shown)}</p>
          </div>

          ${last ? renderLast(last) : ""}

          <div class="m-actions" style="margin-top:6px;">
            <button type="button" class="btn primary m-claim" data-act="reveal_continue">Continue</button>
            <button type="button" class="btn" data-act="reveal_runagain">Run again</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
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
    const realActive = getActive(payload);
    const active = (realActive.status === "NONE" && _pendingValid()) ? _activeFromPending() : realActive;

    // If backend confirms active/ready, clear pending
    if (realActive.status !== "NONE") _clearPending();

    // ✅ REVEAL SCREEN OVERRIDE
    if (_reveal) {
      stopTick();
      _root.innerHTML = _renderReveal(payload);
      return;
    }

    const last = payload.lastResolve || payload.last_resolve || null;

    // ACTIVE/WAITING
    if (active.status && active.status !== "NONE") {
      _root.innerHTML = `
        ${_topbar(active.status === "READY" ? "Ready to claim" : "In progress")}
        <div class="m-stage m-stage-wait">
          <div class="m-wait-center">
            <div class="m-muted">${esc(active.title || "Mission")}</div>
            <div id="mClock" class="m-clock">—</div>
            <div id="mClockSub" class="m-clock-sub">—</div>

            <div class="m-bar"><div id="mFill" class="m-bar-fill" style="width:0%"></div></div>

            <div class="m-actions">
              <button type="button" class="btn" data-act="refresh">Sync</button>
              <button id="mResolveBtn" type="button" class="btn primary m-claim" data-act="resolve" style="display:none">CLAIM REWARDS</button>
              ${active.__pending ? `<button type="button" class="btn" data-act="back_to_offers">Back</button>` : ``}
              <button type="button" class="btn" data-act="close">Close</button>
            </div>

            ${last ? `<div style="width: min(640px, 100%); margin-top: 12px;">${renderLast(last)}</div>` : ``}
          </div>
        </div>
      `;

      paintWaiting(active);
      startTick();
      return;
    }

    // OFFERS
    stopTick();

    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "";

    _root.innerHTML = `
      ${_topbar("Pick a run")}
      <div class="m-stage">
        <div class="m-card">
          <div class="m-row">
            <div style="min-width:0;">
              <div class="m-title">No active expedition</div>
              <div class="m-muted" style="margin-top:6px;">Choose a mission card to deploy.</div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn" data-act="refresh">Refresh</button>
              <button type="button" class="btn" data-act="close">Close</button>
            </div>
          </div>
        </div>

        <div class="m-card" style="margin-top:10px;">
          <div class="m-row">
            <div style="min-width:0;">
              <div class="m-title">Mission Cards</div>
              <div class="m-muted" style="margin-top:6px;">Start → Wait → Claim. Simple loop.</div>
            </div>
            <button type="button" class="btn" data-act="refresh">Refresh</button>
          </div>

          <div class="m-hr"></div>

          <div class="m-offers">
            ${
              offers.length
                ? offers.map(o => renderOffer(o, realActive)).join("")
                : `<div class="m-muted">No offers yet. Tap Refresh.</div>`
            }
          </div>
        </div>

        ${last ? renderLast(last) : ""}

        <div class="m-muted" style="text-align:center; opacity:.85; margin-top:10px;">
          Expeditions are backend-driven. If backend is offline you’ll see an error here.
        </div>
      </div>
    `;
  }

  // =========================
  // Sync after start (poll state until backend confirms active)
  // =========================
  async function _syncAfterStart(maxMs = 6500, intervalMs = 450) {
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
        if (a.status && a.status !== "NONE") {
          _clearPending();
          render();
          return true;
        }
      } catch (_) {}
      await sleep(intervalMs);
    }
    return false;
  }

  // =========================
  // Actions
  // =========================
  async function loadState(opts = {}) {
    const silent = !!opts.silent;
    if (!silent) renderLoading("Loading missions…");

    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
      _state = res;

      try {
        window.__AH_MISSIONS_RAW = res;
        window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
      } catch (_) {}

      const p = normalizePayload(_state);
      const a = p ? getActive(p) : { status: "NONE" };
      if (a.status && a.status !== "NONE") _clearPending();

      if (!silent) render();
      return true;
    } catch (e) {
      if (!silent) renderError("Missions backend error", String(e?.message || e || ""));
      return false;
    }
  }

  async function doRefresh() {
    // If we’re waiting/pending, refresh = sync state (not rotate offers)
    try {
      const p = normalizePayload(_state);
      const real = p ? getActive(p) : { status: "NONE" };
      if (real.status !== "NONE" || _pendingValid()) {
        await loadState();
        return;
      }

      await api("/webapp/missions/action", { action: "refresh_offers", run_id: rid("m:refresh") });
      await loadState();
    } catch (e) {
      renderError("Refresh failed", String(e?.message || e || ""));
    }
  }

  async function doStart(tier, offerId) {
    if (_busy) return;
    if (!offerId) {
      renderError("Start failed", "Missing offerId (UI dataset).");
      return;
    }

    _setBusy(true);
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

      // optimistic wait immediately
      _optimisticStart(tier, offerId);

      if (startRes && typeof startRes === "object") {
        _state = startRes;
        try {
          window.__AH_MISSIONS_RAW = startRes;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(startRes);
        } catch (_) {}
        render();
      }

      await _syncAfterStart();
      return;

    } catch (e) {
      const msg = String(e?.message || e || "");
      if (msg.toUpperCase() === "ACTIVE") {
        await loadState();
        return;
      }
      _clearPending();
      renderError("Start failed", msg);
    } finally {
      _setBusy(false);
    }
  }

  function _extractResolveText(res) {
    try {
      if (!res || typeof res !== "object") return "";
      const p = normalizePayload(res) || res;

      const direct =
        res.rewardMsg || res.reward_msg ||
        res.lootMsg || res.loot_msg ||
        res.tokenLootMsg || res.token_loot_msg ||
        "";

      const last = p.lastResolve || p.last_resolve || null;
      const parts = [];
      if (last) {
        const r = String(last.rewardMsg || last.reward_msg || "");
        const l = String(last.lootMsg || last.loot_msg || "");
        const t = String(last.tokenLootMsg || last.token_loot_msg || "");
        if (r) parts.push(r);
        if (l) parts.push(l);
        if (t) parts.push(t);
      }

      const joined = parts.filter(Boolean).join("\n");
      return joined || String(direct || "");
    } catch (_) { return ""; }
  }

  async function doResolve() {
    if (_busy) return;

    _setBusy(true);
    try {
      const res = await api("/webapp/missions/action", { action: "resolve", run_id: rid("m:resolve") });

      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}

      const txt = _extractResolveText(res);

      // ✅ show AAA rewards screen
      _reveal = {
        title: "REWARDS SECURED",
        text: txt || "Rewards recorded. (Backend message missing — we’ll enrich this next.)",
        ts: Date.now(),
      };

      _clearPending();

      // refresh state behind (silent), but keep reveal on screen
      await loadState({ silent: true });
      render();
      return;

    } catch (e) {
      const msg = String(e?.message || e || "");
      const up = msg.toUpperCase();
      if (up.includes("TOO_EARLY") || up.includes("NOT_READY") || up.includes("EARLY")) {
        await loadState();
        return;
      }
      renderError("Resolve failed", msg);
    } finally {
      _setBusy(false);
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

    // ✅ point C: lifecycle resync + load pending
    _loadPending();
    _bindLifecycle();

    log("init ok");
  }

  window.Missions = { init, open, close, reload: loadState };
})();
