// js/missions.js — WebApp Missions (EXPEDITIONS) UI (backend-first)
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

  let _serverOffsetSec = 0; // now_ts sync

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // =========================
  // Styles (ONLY content-level; overlay sizing handled by index hotfix)
  // =========================
  function ensureStyles() {
    if (document.getElementById("missions-ui-css")) return;
    const st = document.createElement("style");
    st.id = "missions-ui-css";
    st.textContent = `
      :root{
        --missions-bg: url("mission_bg.webp");
        --missions-wait-bg: url("mission_waiting_bg.webp");
        --missions-dust: url("dust.png");
      }

      /* scroll container (critical) */
      #missionsRoot{
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        min-height: 0 !important;
        touch-action: pan-y;
        padding: 12px 14px calc(14px + 84px + env(safe-area-inset-bottom)) !important;
      }

      /* Main stage wrapper */
      #missionsRoot .m-stage{
        position: relative;
        border: 1px solid rgba(36,50,68,.95);
        border-radius: 16px;
        padding: 14px;
        background:
          radial-gradient(circle at 18% 10%, rgba(0,229,255,.10), transparent 55%),
          radial-gradient(circle at 82% 92%, rgba(255,176,0,.10), transparent 58%),
          linear-gradient(to bottom, rgba(6,10,14,.55), rgba(6,10,14,.86)),
          var(--missions-bg);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        box-shadow:
          0 18px 48px rgba(0,0,0,.62),
          inset 0 1px 0 rgba(255,255,255,.08),
          inset 0 0 0 1px rgba(0,229,255,.06);
        outline: 1px solid rgba(0,229,255,.08);
        overflow: hidden;
      }

      #missionsRoot .m-stage::before{
        content:"";
        position:absolute;
        inset:0;
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
        opacity:.26;
        mix-blend-mode: overlay;
      }

      #missionsRoot .m-stage::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        z-index:0;
        background: var(--missions-dust);
        background-size: cover;
        background-position: center;
        opacity: .16;
        mix-blend-mode: screen;
      }

      #missionsRoot .m-stage > *{ position: relative; z-index: 1; }

      /* Waiting window (Shakes&Fidget vibe) */
      #missionsRoot .m-wait{
        position: relative;
        border-radius: 16px;
        padding: 12px;
        border: 1px solid rgba(255,255,255,.10);
        background:
          radial-gradient(circle at 18% 12%, rgba(0,229,255,.08), transparent 55%),
          radial-gradient(circle at 85% 88%, rgba(255,176,0,.07), transparent 60%),
          linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,.68)),
          var(--missions-wait-bg);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        box-shadow:
          0 16px 34px rgba(0,0,0,.42),
          inset 0 1px 0 rgba(255,255,255,.07);
        overflow: hidden;
      }

      #missionsRoot .m-wait::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        background:
          radial-gradient(circle at 50% 35%, rgba(0,0,0,.02), rgba(0,0,0,.55) 78%, rgba(0,0,0,.78) 100%),
          repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,.028),
            rgba(255,255,255,.028) 1px,
            rgba(0,0,0,0) 3px,
            rgba(0,0,0,0) 6px
          );
        opacity:.24;
        mix-blend-mode: overlay;
      }
      #missionsRoot .m-wait > *{ position: relative; z-index: 1; }

      #missionsRoot .m-wait-top{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:10px;
      }
      #missionsRoot .m-wait-eta{ font-weight:800; opacity:.92; margin-top:4px; }
      #missionsRoot .m-wait-meta{ font-size:12px; opacity:.78; margin-top:6px; }

      #missionsRoot .m-bar{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.10);
        position:relative;
        margin:10px 0 8px;
      }
      #missionsRoot .m-bar-fill{
        height:100%;
        width:0%;
        background: linear-gradient(90deg, rgba(0,229,255,.65), rgba(43,139,217,.92));
        position:relative;
        transition: width .25s linear;
      }
      #missionsRoot .m-bar-fill::after{
        content:"";
        position:absolute; inset:0;
        background: linear-gradient(110deg, rgba(255,255,255,0) 35%, rgba(255,255,255,.22) 50%, rgba(255,255,255,0) 65%);
        transform: translateX(-55%);
        opacity:.55;
        animation: mSheen 1.8s ease-in-out infinite;
        pointer-events:none;
      }
      @keyframes mSheen{ 0%{transform:translateX(-55%)} 100%{transform:translateX(55%)} }
      @media (prefers-reduced-motion: reduce){
        #missionsRoot .m-bar-fill::after{ animation:none; }
      }

      #missionsRoot .m-offer{
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        border-radius: 14px;
        padding: 12px;
      }
      #missionsRoot .m-offer + .m-offer{ margin-top: 10px; }
      #missionsRoot .m-offer:hover{
        border-color: rgba(0,229,255,.18);
        box-shadow: 0 12px 26px rgba(0,0,0,.32);
      }

      /* small text helpers (fallback if you don't have ah-classes) */
      #missionsRoot .m-title{ font-weight:700; }
      #missionsRoot .m-muted{ opacity:.78; font-size:12px; }
      #missionsRoot .m-row{ display:flex; gap:10px; align-items:flex-start; justify-content:space-between; }
    `;
    document.head.appendChild(st);
  }

  // =========================
  // Modal binding (works with your existing index modal)
  // =========================
  function bindOnceModalClicks() {
    if (!_modal) return;
    if (_modal.__AH_MISSIONS_BOUND) return;
    _modal.__AH_MISSIONS_BOUND = 1;

    // Click backdrop closes
    _modal.addEventListener("click", (e) => {
      if (e.target === _modal) close();
    });

    // Delegation for data-act buttons inside missionsRoot content
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

    // Wire your existing header X
    const closeBtn = el("closeMissions");
    if (closeBtn && !closeBtn.__AH_MISSIONS_BOUND) {
      closeBtn.__AH_MISSIONS_BOUND = 1;
      closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
    }

    // Wire your existing bottom buttons
    const br = el("missionsRefresh");
    if (br && !br.__AH_MISSIONS_BOUND) {
      br.__AH_MISSIONS_BOUND = 1;
      br.addEventListener("click", (e) => { e.preventDefault(); doRefresh(); });
    }
    const bres = el("missionsResolve");
    if (bres && !bres.__AH_MISSIONS_BOUND) {
      bres.__AH_MISSIONS_BOUND = 1;
      bres.addEventListener("click", (e) => { e.preventDefault(); doResolve(); });
    }
  }

  function ensureModal() {
    ensureStyles();

    _modal = el("missionsBack") || el("missionsModal");
    _root  = el("missionsRoot");
    if (_modal && _root) {
      bindOnceModalClicks();
      return true;
    }

    // fallback: create minimal modal if index doesn't have it
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="missionsModal" style="position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);z-index:2147483000;">
        <div style="width:min(560px, calc(100vw - 24px));max-height:calc(100vh - 24px - env(safe-area-inset-bottom));
          overflow:hidden;background:rgba(20,20,24,.96);border:1px solid rgba(255,255,255,.10);
          border-radius:16px;box-shadow:0 20px 70px rgba(0,0,0,.55);padding:14px;display:flex;flex-direction:column;min-height:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div style="font-weight:700;">Missions</div>
            <button type="button" data-act="close" class="btn" style="padding:8px 10px;border-radius:12px;">×</button>
          </div>
          <div id="missionsRoot" style="margin-top:12px;min-height:0;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);
    _modal = el("missionsModal");
    _root  = el("missionsRoot");
    bindOnceModalClicks();
    return true;
  }

  function open() {
    ensureModal();
    log("open(): modal=", _modal?.id, "root=", !!_root);

    if (_modal) {
      // prefer your nav router if present
      try { window.navOpen?.("missionsBack"); } catch (_) {}

      // support your CSS hotfix (#missionsBack.is-open)
      _modal.classList.add("is-open");
      _modal.style.display = "flex";
      document.body.classList.add("missions-open");
    }

    renderLoading("Loading missions…");
    loadState();
    startTick();
    return true;
  }

  function close() {
    if (!_modal) return;

    try { window.navClose?.("missionsBack"); } catch (_) {}

    _modal.classList.remove("is-open");
    _modal.style.display = "none";
    document.body.classList.remove("missions-open");

    stopTick();
  }

  // =========================
  // API + payload normalize
  // =========================
  async function api(path, body) {
    if (!_apiPost) throw new Error("Missions: apiPost missing");
    const res = await _apiPost(path, body);

    if (res && typeof res === "object" && res.ok === false) {
      const reason = res.reason || res.error || "NOT_OK";
      const err = new Error(String(reason));
      err._res = res;
      throw err;
    }
    return res;
  }

  // support: {ok:true, state:{...}} and {ok:true, data:{...}} and raw state
  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;
    if (res.state && typeof res.state === "object") return res.state;
    if (res.data && typeof res.data === "object") return res.data;
    if (res.payload && typeof res.payload === "object") return res.payload;
    return res;
  }

  // =========================
  // Time helpers
  // =========================
  function _syncServerClock(payload) {
    const nowTs = Number(payload?.now_ts || payload?.nowTs || payload?.now || 0);
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
    if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function _fmtClock(ts) {
    try {
      const d = new Date(Number(ts) * 1000);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (_) { return ""; }
  }

  function _parseTs(v) {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    const s = String(v).trim();
    if (!s) return 0;
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return Math.floor(t / 1000);
    return 0;
  }

  function _normalizeDurToSec(d) {
    let n = Number(d || 0);
    if (!n) return 0;
    // if backend sends minutes (e.g. 28) convert to sec
    if (n > 0 && n <= 240) return n * 60;
    return n;
  }

  // =========================
  // Active mission parser (robust aliases)
  // =========================
  let _legacyAnchor = null;

  function getActive(payload) {
    const am = payload?.active_mission || payload?.activeMission || payload?.active || null;
    if (!am || typeof am !== "object") return { status: "NONE" };

    const title = am.title || am.name || am.label || "Mission";

    const started = _parseTs(
      am.started_ts ?? am.start_ts ?? am.start_time ?? am.startTime ?? am.started ?? am.start ?? 0
    );

    const dur = _normalizeDurToSec(
      am.duration_sec ?? am.durationSec ?? am.duration_seconds ?? am.duration ?? am.duration_min ?? am.durationMin ?? 0
    );

    // ends/ready_at (number or ISO string)
    let ends = _parseTs(
      am.ends_ts ?? am.ready_at_ts ?? am.ready_at ?? am.readyAt ?? am.readyAtTs ?? am.ends ?? 0
    );

    // if no explicit ends, compute from started+dur
    if (!ends && started && dur) ends = started + dur;

    // left/remaining (aliases)
    const leftRaw =
      am.leftSec ?? am.left_sec ??
      am.remainingSec ?? am.remaining_sec ??
      am.cooldownLeftSec ?? am.cooldown_left_sec ??
      am.timeLeftSec ?? am.time_left_sec ??
      0;
    const left = Number(leftRaw || 0);

    // normalize status strings
    const stRaw = String(am.status || am.state || "").toUpperCase();
    const st =
      stRaw === "ACTIVE" ? "RUNNING" :
      (stRaw === "IN_PROGRESS" || stRaw === "INPROGRESS") ? "RUNNING" :
      (stRaw === "COMPLETED" || stRaw === "READY") ? "READY" :
      stRaw;

    // best path: ends exists
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
        readyAt: am.readyAt || _fmtClock(ends),
      };
    }

    // second best: explicit left seconds
    if (left > 0 || st === "RUNNING") {
      const now = _nowSec();
      if (!_legacyAnchor || _legacyAnchor.left !== left || _legacyAnchor.title !== title) {
        _legacyAnchor = { left, at: now, title };
      }
      const elapsed = Math.max(0, now - _legacyAnchor.at);
      const remaining = Math.max(0, Math.ceil(_legacyAnchor.left - elapsed));
      const total = Math.max(1, dur || _legacyAnchor.left || 1);
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
      return {
        status: remaining > 0 ? "RUNNING" : "READY",
        title,
        remaining,
        total,
        pct,
        readyAt: am.readyAt || "",
      };
    }

    // READY explicit
    if (st === "READY") {
      return { status: "READY", title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "" };
    }

    // fallback: treat as READY if we can't compute but no time left
    return { status: "READY", title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "" };
  }

  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      if (!payload) return;
      const a = getActive(payload);
      paintActive(a);
    }, 1000);
  }

  function stopTick() {
    if (_tick) clearInterval(_tick);
    _tick = null;
  }

  // =========================
  // Render helpers
  // =========================
  function renderLoading(msg) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-muted">${esc(msg)}</div>
      </div>
    `;
  }

  function renderError(title, detail) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-title">${esc(title)}</div>
        <div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(detail || "")}</div>
        <div style="margin-top:12px; display:flex; gap:8px;">
          <button type="button" class="btn" data-act="refresh">Retry</button>
          <button type="button" class="btn" data-act="close">Close</button>
        </div>
      </div>
    `;
  }

  // =========================
  // State loading + actions
  // =========================
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
      // some backends return ack only -> re-fetch canonical state
      await loadState();
    } catch (e) {
      renderError("Refresh failed", String(e?.message || e || ""));
    }
  }

  async function doStart(tier, offerId) {
    // optimistic UI: show waiting immediately
    renderLoading("Starting mission…");
    try {
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
      // always re-fetch canonical state so waiting window appears
      await loadState();
    } catch (e) {
      const msg = String(e?.message || e || "");
      // If already active, don't show error; just load the state (fixes "Start failed ACTIVE")
      if (msg.includes("ACTIVE") || msg.includes("ALREADY_ACTIVE")) {
        await loadState();
        return;
      }
      renderError("Start failed", msg);
    }
  }

  async function doResolve() {
    renderLoading("Resolving…");
    try {
      const res = await api("/webapp/missions/action", {
        action: "resolve",
        run_id: rid("m:resolve"),
      });
      _state = res;
      // fetch canonical state again so offers/active are correct
      await loadState();
    } catch (e) {
      renderError("Resolve failed", String(e?.message || e || ""));
    }
  }

  // =========================
  // Active panel (waiting window + bar + resolve)
  // =========================
  function paintActive(a) {
    const box = el("missionsActiveBox");
    if (!box) return;

    const rawStatus = a?.status || "NONE";
    const remaining = Number(a?.remaining || 0);
    const total = Math.max(1, Number(a?.total || a?.duration_sec || 1));

    // ✅ critical: if remaining <= 0, treat as READY (fixes "Ready in 0:00" but no resolve)
    const isReady = (rawStatus === "READY") || (remaining <= 0);

    let pct = Math.round((Number(a?.pct || 0)) * 100);
    if (!pct && remaining > 0 && total > 0) pct = Math.round((1 - (remaining / total)) * 100);
    if (isReady) pct = 100;
    pct = Math.max(0, Math.min(100, pct));

    // show/hide your bottom resolve button
    const bottomResolve = el("missionsResolve");
    if (bottomResolve) bottomResolve.style.display = isReady ? "" : "none";

    if (rawStatus === "NONE") {
      box.innerHTML = `
        <div class="m-row">
          <div>
            <div class="m-title">No active mission</div>
            <div class="m-muted" style="margin-top:4px;">Pick an offer to start.</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; min-width:140px;">
            <button type="button" class="btn" data-act="refresh" style="padding:10px 12px;">Refresh</button>
          </div>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div class="m-wait">
        <div class="m-wait-top">
          <div style="min-width:0;">
            <div class="m-title">${esc(a.title || "Mission")}</div>
            <div class="m-wait-eta">
              ${isReady ? `<b>Ready</b>` : `Ready in <b>${_fmtTime(remaining)}</b>`}
            </div>
            <div class="m-wait-meta" id="mWaitMeta">
              ${isReady ? `Tap <b>Resolve</b> to claim rewards.` : `Progress: ${pct}% · Ready at: ${esc(a.readyAt || "—")}`}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; align-items:stretch; min-width:140px;">
            <button type="button" class="btn" data-act="refresh" style="padding:10px 12px;">Refresh</button>
            <button type="button" class="btn primary" data-act="resolve" style="padding:10px 12px; display:${isReady ? "" : "none"};">Resolve</button>
          </div>
        </div>

        <div class="m-bar">
          <div class="m-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }

  function renderOffer(o, active) {
    const tier  = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const title = String(o?.title || "");
    const desc  = String(o?.desc || "");

    const durSec = Number(o?.durationSec || o?.duration_sec || o?.duration || 0);
    const durMin = durSec ? Math.max(1, Math.round(durSec / 60)) : 0;
    const dur = o?.durationLabel || (durMin ? `${durMin}m` : (o?.tierTime ? `${o.tierTime}` : "—"));

    const reward = o?.reward || o?.rewardPreview || {};
    const xp = (reward.xp ?? "?");
    const bones = (reward.bones ?? "?");
    const rolls = (o?.lootRolls ?? o?.loot_rolls ?? reward.rolls ?? reward.loot_rolls ?? "?");

    const offerId = String(o?.offerId || o?.id || o?.offer_id || "");

    const hasActive = !!(active?.status && active.status !== "NONE");
    const disabled = hasActive ? "disabled" : "";

    return `
      <div class="m-offer">
        <div class="m-row">
          <div style="min-width:0;">
            <div class="m-title">${esc(label)} <span class="m-muted">(${esc(dur)})</span></div>
            ${title ? `<div class="m-muted" style="margin-top:4px;"><b>${esc(title)}</b></div>` : ""}
            ${desc ? `<div class="m-muted" style="margin-top:2px;">${esc(desc)}</div>` : ""}
            <div class="m-muted" style="margin-top:6px;">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
              ${hasActive ? ` · <span class="m-muted">Resolve active mission first</span>` : ""}
            </div>
          </div>
          <button type="button" class="btn primary"
            data-act="start"
            data-tier="${esc(tier)}"
            data-offer="${esc(offerId)}"
            ${disabled}
            style="padding:10px 14px; align-self:center;"
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
      <div style="margin-top:10px; border:1px solid rgba(255,255,255,.10); border-radius:14px; padding:12px; background:rgba(0,0,0,.18);">
        <div class="m-title">Last Resolve</div>
        <div class="m-muted" style="margin-top:6px;">
          ${esc(victory)} ${ts ? `· <b>${esc(ts)}</b>` : ""}
        </div>
        ${rewardMsg ? `<div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(rewardMsg)}</div>` : ""}
        ${lootMsg ? `<div class="m-muted" style="margin-top:4px; white-space:pre-wrap;">${esc(lootMsg)}</div>` : ""}
        ${tokenLootMsg ? `<div class="m-muted" style="margin-top:4px; white-space:pre-wrap;">${esc(tokenLootMsg)}</div>` : ""}
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
        <div id="missionsActiveBox"></div>

        <div style="margin-top:10px; border:1px solid rgba(255,255,255,.10); border-radius:14px; padding:12px; background:rgba(0,0,0,.18);">
          <div class="m-row">
            <div>
              <div class="m-title">Offers</div>
              <div class="m-muted" style="margin-top:4px;">Pick a tier — Start → Wait → Resolve.</div>
            </div>
            <button type="button" class="btn" data-act="refresh" style="padding:10px 12px;">Refresh</button>
          </div>

          <div style="margin-top:10px;">
            ${
              offers.length
                ? offers.map(o => renderOffer(o, active)).join("")
                : `<div class="m-muted">No offers yet. Tap Refresh.</div>`
            }
          </div>
        </div>

        ${last ? renderLast(last) : ""}

        <div class="m-muted" style="margin-top:10px; text-align:center; opacity:.85;">
          Missions are backend-driven. If backend is offline you'll see an error here.
        </div>
      </div>
    `;

    paintActive(active);
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    ensureStyles();
    log("init ok");
  }

  // debug helper
  function debugDump() {
    const payload = normalizePayload(_state);
    console.log("[Missions] raw state:", _state);
    console.log("[Missions] normalized payload:", payload);
    if (payload) console.log("[Missions] active parsed:", getActive(payload));
    return payload;
  }

  window.Missions = { init, open, close, reload: loadState, debugDump };
})();