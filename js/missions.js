// js/missions.js — WebApp Missions UI (EXPEDITIONS)
// Source of truth: POST /webapp/missions/state
// Actions: POST /webapp/missions/action { action:"refresh_offers"|"start"|"resolve", tier?, offerId?, run_id }

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

  let _modal = null; // #missionsBack or fallback #missionsModal
  let _root = null;  // #missionsRoot
  let _tick = null;
  let _state = null;

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // =========================
  // Styles (self-contained)
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

      /* modal stacking */
      #missionsBack, #missionsModal{
        position: fixed !important;
        inset: 0 !important;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 12px;
        box-sizing: border-box;
        background: rgba(0,0,0,.72);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 2147483000 !important;
        pointer-events: auto;
      }
      #missionsBack.is-open, #missionsModal.is-open{ display:flex !important; }

      /* IMPORTANT: make the card a flex column so root can scroll */
      #missionsBack .sheet-card,
      #missionsModal > *{
        width: min(560px, calc(100vw - 24px)) !important;
        max-height: calc(100vh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
        overflow: hidden !important;
        border-radius: 16px;
      }

      /* scroll container */
      #missionsRoot{
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        touch-action: pan-y;
        display: block !important; /* override inline grid if needed */
        padding: 12px 14px calc(14px + 110px + env(safe-area-inset-bottom)) !important;
      }

      body.missions-open{
        overflow: hidden !important;
        touch-action: none;
      }

      /* Stage */
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
          inset 0 1px 0 rgba(255,255,255,.08);
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
        opacity:.28;
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
        opacity: .18;
        mix-blend-mode: screen;
      }
      #missionsRoot .m-stage > *{ position: relative; z-index: 1; }

      /* Waiting window */
      #missionsRoot .m-wait{
        position: relative;
        border-radius: 16px;
        padding: 12px;
        border: 1px solid rgba(255,255,255,.10);
        background:
          radial-gradient(circle at 18% 12%, rgba(0,229,255,.08), transparent 55%),
          radial-gradient(circle at 85% 88%, rgba(255,176,0,.07), transparent 60%),
          linear-gradient(to bottom, rgba(0,0,0,.20), rgba(0,0,0,.68)),
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
        opacity:.26;
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

      /* Progress bar */
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

      /* Offer rows */
      #missionsRoot .m-offer{
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        border-radius: 14px;
        padding: 12px;
      }
      #missionsRoot .m-offer + .m-offer{ margin-top: 10px; }
    `;
    document.head.appendChild(st);
  }

  // =========================
  // Modal / bindings
  // =========================
  function bindOnceModalClicks() {
    if (!_modal || !_root) return;
    if (_modal.__AH_MISSIONS_BOUND) return;
    _modal.__AH_MISSIONS_BOUND = 1;

    // click outside card closes (only if click hits backdrop itself)
    _modal.addEventListener("click", (e) => {
      if (e.target === _modal) close();
    });

    // event delegation for buttons inside missionsRoot
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

    // top close
    const closeBtn = el("closeMissions");
    if (closeBtn && !closeBtn.__AH_MISSIONS_BOUND) {
      closeBtn.__AH_MISSIONS_BOUND = 1;
      closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
    }

    // bottom buttons from index.html (if present)
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

    // fallback modal if index fragment is missing
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="missionsModal" role="dialog" aria-modal="true" aria-label="Missions">
        <div style="
          width:min(560px, calc(100vw - 24px));
          max-height:calc(100vh - 24px - env(safe-area-inset-bottom));
          overflow:hidden;
          background:rgba(20,20,24,.96);
          border:1px solid rgba(255,255,255,.10);
          border-radius:16px;
          box-shadow:0 20px 70px rgba(0,0,0,.55);
          padding:14px;
          display:flex;
          flex-direction:column;
          min-height:0;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <div style="font-weight:700;">Missions</div>
            <button type="button" data-act="close" style="border:0;background:transparent;color:#fff;font-size:18px;cursor:pointer;">✕</button>
          </div>
          <div id="missionsRoot" style="margin-top:12px;"></div>
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
    if (!_modal || !_root) return false;

    document.body.classList.add("missions-open");

    if (_modal.id === "missionsBack") {
      _modal.classList.add("is-open");
      try { window.navOpen?.("missionsBack"); } catch (_) {}
    } else {
      _modal.classList.add("is-open");
    }

    renderLoading("Loading missions…");
    loadState();
    startTick();
    return true;
  }

  function close() {
    if (!_modal) return;

    document.body.classList.remove("missions-open");

    if (_modal.id === "missionsBack") {
      _modal.classList.remove("is-open");
      try { window.navClose?.("missionsBack"); } catch (_) {}
    } else {
      _modal.classList.remove("is-open");
    }

    stopTick();
  }

  // =========================
  // Time helpers (server clock)
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
    if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function _fmtClock(tsSec) {
    try {
      const d = new Date(Number(tsSec) * 1000);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (_) { return ""; }
  }

  function _numTsSec(v) {
    if (v == null) return 0;
    if (typeof v === "number" && isFinite(v)) return v > 1e12 ? Math.floor(v / 1000) : v; // ms or sec
    const s = String(v).trim();
    if (!s) return 0;
    if (/^\d+(\.\d+)?$/.test(s)) {
      const n = Number(s);
      return n > 1e12 ? Math.floor(n / 1000) : n;
    }
    const ms = Date.parse(s);
    if (isFinite(ms)) return Math.floor(ms / 1000);
    return 0;
  }

  // =========================
  // API + payload normalization
  // =========================
  async function api(path, body) {
    if (!_apiPost) throw new Error("Missions: apiPost missing");
    return await _apiPost(path, body);
  }

  // supports: {ok:true, state:{...}} and {ok:true, data:{...}} and plain {...}
  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;
    const obj = res.state && typeof res.state === "object" ? res.state
      : res.data && typeof res.data === "object" ? res.data
      : res.payload && typeof res.payload === "object" ? res.payload
      : res;
    return obj;
  }

  // =========================
  // Active mission extraction (THIS is the key)
  // =========================
  let _legacyAnchor = null;

  function getActive(payload) {
    // ✅ main expected key from your backend: state.active
    let am =
      payload?.active ??
      payload?.active_mission ??
      payload?.activeMission ??
      payload?.active_mission_state ??
      payload?.activeMissionState ??
      null;

    // unwrap common nesting
    if (am && typeof am === "object" && am.mission && typeof am.mission === "object") am = am.mission;

    if (!am || typeof am !== "object") return { status: "NONE" };

    const title = am.title || am.name || am.label || "Mission";

    // state/status mapping
    const stRaw = String(am.status || am.state || "").toUpperCase();
    let status = stRaw;

    // common backend values
    // in_progress / running / active -> RUNNING
    if (status === "IN_PROGRESS" || status === "RUNNING" || status === "ACTIVE") status = "RUNNING";
    // completed / ready -> READY
    if (status === "COMPLETED" || status === "READY" || status === "DONE") status = "READY";

    // timestamps
    const started = _numTsSec(am.started_ts ?? am.start_ts ?? am.start_time ?? am.startedAt ?? am.started_at);
    const dur = Number(am.duration_sec ?? am.duration ?? am.durationSec ?? 0);

    // ready/ends timestamp might exist directly
    const ends =
      _numTsSec(am.ends_ts ?? am.ready_at_ts ?? am.ready_at ?? am.readyAtTs ?? am.readyAt ?? am.ready_at_time) ||
      (started && dur ? (started + dur) : 0);

    // if we can compute ends -> authoritative
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
        readyAt: _fmtClock(ends),
      };
    }

    // fallback: left seconds
    const rawLeft = am.leftSec ?? am.left_sec ?? am.cooldownLeftSec ?? am.cooldown_left_sec ?? 0;
    const left = Number(rawLeft || 0);

    if (!status) status = (left > 0 ? "RUNNING" : "READY");

    if (status === "RUNNING") {
      const now = _nowSec();
      if (!_legacyAnchor || _legacyAnchor.left !== left || _legacyAnchor.title !== title) {
        _legacyAnchor = { left, at: now, title };
      }
      const elapsed = Math.max(0, now - _legacyAnchor.at);
      const remaining = Math.max(0, Math.ceil(_legacyAnchor.left - elapsed));
      const total = Math.max(1, Number(dur || _legacyAnchor.left || 1));
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
      return { status: remaining > 0 ? "RUNNING" : "READY", title, remaining, total, pct, readyAt: "" };
    }

    if (status === "READY") {
      return { status: "READY", title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: "" };
    }

    // if backend sends something unexpected but active exists -> treat as RUNNING
    return { status: "RUNNING", title, remaining: Math.max(0, left), total: Math.max(1, dur || left || 1), pct: 0, readyAt: "" };
  }

  // =========================
  // Tick (timer/progressbar)
  // =========================
  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      if (!payload) return;
      const a = getActive(payload);
      paintActive(a);
      syncBottomResolve(a);
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
        <div style="opacity:.85">${esc(msg)}</div>
      </div>
    `;
  }

  function renderError(title, detail) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage">
        <div style="font-weight:800">${esc(title)}</div>
        <div style="opacity:.8; margin-top:6px; white-space:pre-wrap;">${esc(detail || "")}</div>
        <div style="margin-top:12px; display:flex; gap:8px;">
          <button type="button" class="btn" data-act="refresh">Retry</button>
          <button type="button" class="btn" data-act="close">Close</button>
        </div>
      </div>
    `;
  }

  function syncBottomResolve(active) {
    const r = el("missionsResolve");
    if (!r) return;
    r.style.display = (active?.status === "READY") ? "" : "none";
  }

  // waiting box + progressbar
  function paintActive(a) {
    const box = el("missionsActiveBox");
    if (!box) return;

    const status = a?.status || "NONE";

    if (status === "NONE") {
      box.innerHTML = `
        <div class="m-wait" style="background:rgba(0,0,0,.35);">
          <div class="m-wait-top">
            <div style="min-width:0;">
              <div style="font-weight:800;">No active mission</div>
              <div style="opacity:.78;margin-top:4px;">Pick an offer to start.</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;min-width:140px;">
              <button type="button" class="btn" data-act="refresh">Refresh</button>
              <button type="button" class="btn" data-act="close">Close</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (!el("mWaitEta") || !el("mBarFill")) {
      box.innerHTML = `
        <div class="m-wait">
          <div class="m-wait-top">
            <div style="min-width:0;">
              <div style="font-weight:900;">${esc(a.title || "Mission")}</div>
              <div id="mWaitEta" class="m-wait-eta">—</div>
              <div id="mWaitMeta" class="m-wait-meta"></div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px; align-items:stretch; min-width:140px;">
              <button type="button" class="btn" data-act="refresh">Refresh</button>
              <button id="mResolveBtn" type="button" class="btn primary" data-act="resolve" style="display:none">Resolve</button>
            </div>
          </div>

          <div class="m-bar">
            <div id="mBarFill" class="m-bar-fill" style="width:0%"></div>
          </div>
        </div>
      `;
    }

    const etaEl = el("mWaitEta");
    const fillEl = el("mBarFill");
    const metaEl = el("mWaitMeta");
    const resolveBtn = el("mResolveBtn");

    const remaining = Number(a.remaining || 0);
    const pct = Math.round((Number(a.pct || 0)) * 100);

    if (fillEl) fillEl.style.width = `${pct}%`;

    if (etaEl) {
      etaEl.innerHTML =
        status === "RUNNING"
          ? `Ready in <b>${_fmtTime(remaining)}</b>`
          : `<b>Ready</b> — resolve now`;
    }

    if (metaEl) {
      metaEl.textContent =
        status === "RUNNING"
          ? `Progress: ${pct}% · Ready at: ${a.readyAt || "—"}`
          : `Tap Resolve to claim rewards.`;
    }

    if (resolveBtn) resolveBtn.style.display = (status === "READY") ? "" : "none";
  }

  function renderOffer(o, active) {
    const tier  = String(o?.tier || o?.difficulty || "");
    const label = String(o?.label || tier || "Tier");
    const title = String(o?.title || "");
    const desc  = String(o?.desc || o?.description || "");

    const durSec = Number(o?.durationSec || o?.duration_sec || o?.duration || 0);
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
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
          <div style="min-width:0;">
            <div style="font-weight:900;">${esc(label)} <span style="opacity:.75">(${esc(dur)})</span></div>
            ${title ? `<div style="opacity:.85;margin-top:4px;"><b>${esc(title)}</b></div>` : ""}
            ${desc ? `<div style="opacity:.75;margin-top:2px;">${esc(desc)}</div>` : ""}
            <div style="opacity:.75; margin-top:6px;">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
              ${hasActive ? ` · <span style="opacity:.8">Resolve active mission first</span>` : ""}
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
    const ts = last?.ts ? new Date(_numTsSec(last.ts) * 1000).toLocaleString() : "";

    const rewardMsg = String(last?.rewardMsg || last?.reward_msg || "");
    const lootMsg = String(last?.lootMsg || last?.loot_msg || "");
    const tokenLootMsg = String(last?.tokenLootMsg || last?.token_loot_msg || "");

    return `
      <div style="margin-top:10px; padding:12px; border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(0,0,0,.18);">
        <div style="font-weight:900;">Last Resolve</div>
        <div style="opacity:.8; margin-top:6px;">
          ${esc(victory)} ${ts ? `· <b>${esc(ts)}</b>` : ""}
        </div>
        ${rewardMsg ? `<div style="opacity:.8;margin-top:6px; white-space:pre-wrap;">${esc(rewardMsg)}</div>` : ""}
        ${lootMsg ? `<div style="opacity:.8;margin-top:4px; white-space:pre-wrap;">${esc(lootMsg)}</div>` : ""}
        ${tokenLootMsg ? `<div style="opacity:.8;margin-top:4px; white-space:pre-wrap;">${esc(tokenLootMsg)}</div>` : ""}
      </div>
    `;
  }

  function render() {
    if (!_root) return;

    const payload = normalizePayload(_state);
    if (!payload || typeof payload !== "object") {
      renderError("Bad payload", JSON.stringify(_state).slice(0, 1200));
      return;
    }

    _syncServerClock(payload);

    const offers = Array.isArray(payload.offers) ? payload.offers : Array.isArray(payload?.state?.offers) ? payload.state.offers : [];
    const last   = payload.lastResolve || payload.last_resolve || null;

    const active = getActive(payload);

    _root.innerHTML = `
      <div class="m-stage">
        <div id="missionsActiveBox"></div>

        <div style="margin-top:10px; padding:12px; border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(0,0,0,.18);">
          <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
            <div>
              <div style="font-weight:900;">Offers</div>
              <div style="opacity:.78; margin-top:4px;">Pick a tier — Start → Wait → Resolve.</div>
            </div>
            <button type="button" class="btn" data-act="refresh">Refresh</button>
          </div>

          <div style="margin-top:10px;">
            ${
              offers.length
                ? offers.map(o => renderOffer(o, active)).join("")
                : `<div style="opacity:.78;">No offers yet. Tap Refresh.</div>`
            }
          </div>
        </div>

        ${last ? renderLast(last) : ""}

        <div style="opacity:.7; font-size:12px; margin-top:10px; text-align:center;">
          Missions are backend-driven. If backend is offline you'll see an error here.
        </div>
      </div>
    `;

    paintActive(active);
    syncBottomResolve(active);
  }

  // =========================
  // State: ALWAYS from /webapp/missions/state
  // =========================
  async function loadState() {
    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });

      // if backend uses ok:false pattern
      if (res && typeof res === "object" && res.ok === false) {
        throw new Error(String(res.reason || res.error || "STATE_NOT_OK"));
      }

      _state = res;
      render();
    } catch (e) {
      renderError("Missions state failed", String(e?.message || e || ""));
    }
  }

  async function doAction(body, label = "Action") {
    renderLoading(`${label}…`);
    try {
      const res = await api("/webapp/missions/action", body);

      // if backend says ACTIVE / IN_PROGRESS -> just refresh state and show waiting (not an error)
      if (res && typeof res === "object" && res.ok === false) {
        const reason = String(res.reason || res.error || "").toUpperCase();
        if (reason === "ACTIVE" || reason === "IN_PROGRESS" || reason === "RUNNING") {
          await loadState();
          return;
        }
        // other errors still show
        renderError(`${label} failed`, String(res.reason || res.error || "NOT_OK"));
        return;
      }

      // some backends return full state in action response — if so, use it
      const p = normalizePayload(res);
      const looksLikeState =
        p && typeof p === "object" && (
          Array.isArray(p.offers) ||
          p.active || p.active_mission || p.activeMission ||
          p.lastResolve || p.last_resolve ||
          p.now_ts || p.nowTs
        );

      if (looksLikeState) {
        _state = res;
        render();
        return;
      }

      // otherwise: always pull canonical state
      await loadState();
    } catch (e) {
      renderError(`${label} failed`, String(e?.message || e || ""));
    }
  }

  async function doRefresh() {
    await doAction({ action: "refresh_offers", run_id: rid("m:refresh") }, "Refresh");
  }

  async function doStart(tier, offerId) {
    await doAction({
      action: "start",
      tier,
      offerId,
      id: offerId,
      offer_id: offerId,
      run_id: rid("m:start"),
    }, "Start");
  }

  async function doResolve() {
    await doAction({ action: "resolve", run_id: rid("m:resolve") }, "Resolve");
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    ensureStyles();
    log("init ok");
  }

  // Debug helper (if you need to inspect the payload quickly)
  function debugState() { return _state; }

  window.Missions = { init, open, close, reload: loadState, debugState };
})();
