// js/missions.js — WebApp Missions UI (backend-first, icons later)
// Contract:
//   POST /webapp/missions/state  { run_id }
//   POST /webapp/missions/action { action:"refresh_offers"|"start"|"resolve", tier?, offerId?, run_id }

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

  // =========================
  // UI styles + backgrounds (self-contained)
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
        --m-cyan: rgba(0,229,255,.85);
        --m-amber: rgba(255,176,0,.75);
        --m-edge: rgba(255,255,255,.12);
        --m-panel: rgba(8, 12, 18, .55);
      }

      /* Stage wrapper inside missionsRoot */
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
        outline-offset: 0px;
        overflow: hidden;
      }

      /* Scanlines + vignette */
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
          ),
          repeating-linear-gradient(
            90deg,
            rgba(255,255,255,.012),
            rgba(255,255,255,.012) 2px,
            rgba(0,0,0,0) 5px,
            rgba(0,0,0,0) 9px
          );
        opacity:.28;
        mix-blend-mode: overlay;
      }

      /* Dust overlay (optional) */
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

      /* Content above overlays */
      #missionsRoot .m-stage > *{
        position: relative;
        z-index: 1;
      }

      /* Make cards feel like "game glass" */
      #missionsRoot .m-card{
        background: rgba(0,0,0,.20);
        border: 1px solid rgba(255,255,255,.10);
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 40px rgba(0,0,0,.32);
      }

      /* Active waiting window (uses mission_waiting_bg.png) */
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
      #missionsRoot .m-wait-title{ font-weight:900; letter-spacing:.3px; }
      #missionsRoot .m-wait-eta{ font-weight:800; opacity:.92; margin-top:4px; }
      #missionsRoot .m-wait-meta{ font-size:12px; opacity:.78; margin-top:6px; }

      /* Progress bar (S&F vibe) */
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

      /* Small polish for offer rows */
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
    `;
    document.head.appendChild(st);
  }

  // =========================
  // Click binding
  // =========================
  function bindOnceModalClicks() {
    if (!_modal) return;
    if (_modal.__AH_MISSIONS_BOUND) return;
    _modal.__AH_MISSIONS_BOUND = 1;

    // close by overlay click
    _modal.addEventListener("click", (e) => {
      if (e.target === _modal && (_modal.id === "missionsModal" || _modal.id === "missionsBack")) close();
    });

    // event delegation
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

    const closeBtn = el("closeMissions");
    if (closeBtn && !closeBtn.__AH_MISSIONS_BOUND) {
      closeBtn.__AH_MISSIONS_BOUND = 1;
      closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
    }
  }

  function ensureModal() {
    ensureStyles();

    // Prefer existing sheet from index.html:
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

    // Fallback minimal modal
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

  // =========================
  // Server-clock sync (anti-drift) + active mission parsing
  // =========================
  let _serverOffsetSec = 0;

  function _syncServerClock(payload) {
    const nowTs = Number(payload?.now_ts || 0);
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

  // Legacy fallback cache (if backend returns only leftSec without timestamps)
  let _legacyAnchor = null;

  function getActive(payload) {
    // prefer canonical from backend
    const am = payload?.active_mission || payload?.activeMission || payload?.active || null;
    if (!am || typeof am !== "object") return { status: "NONE" };

    const title = am.title || am.name || am.label || "Mission";

    const started = Number(am.started_ts || am.start_ts || am.start_time || 0);
    const dur = Number(am.duration_sec || am.duration || 0);
    const ends =
      Number(am.ends_ts || am.ready_at_ts || am.ready_at || 0) ||
      (started && dur ? (started + dur) : 0);

    // Best: timestamp mode
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

    // Fallback: leftSec/status
    const rawLeft = (am.leftSec ?? am.left_sec);
    const left = (typeof rawLeft === "number") ? rawLeft : Number(rawLeft || 0);
    const status = String(am.status || (left > 0 ? "RUNNING" : "READY")).toUpperCase();

    // Anchor to count down locally without mutating state
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

    return { status: (status === "READY" ? "READY" : "NONE"), title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "" };
  }

  // =========================
  // Ticker (repaints; does NOT mutate state)
  // =========================
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

  function renderLoading(msg) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage">
        <div class="ah-card m-card">
          <div class="ah-muted">${esc(msg)}</div>
        </div>
      </div>
    `;
  }

  function renderError(title, detail) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage">
        <div class="ah-card m-card">
          <div class="ah-title">${esc(title)}</div>
          <div class="ah-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(detail || "")}</div>
          <div style="margin-top:12px; display:flex; gap:8px;">
            <button type="button" class="ah-btn" data-act="refresh">Retry</button>
            <button type="button" class="ah-btn ghost" data-act="close">Close</button>
          </div>
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

  // ✅ support: {ok:true, data:{...}} and {ok:true, state:{...}}
  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;
    if (res.state && typeof res.state === "object") return res.state;
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
      // ✅ send aliases to avoid backend mismatch
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

  // =========================
  // Active panel (waiting window + bar)
  // =========================
  function paintActive(a) {
    const box = el("missionsActiveBox");
    if (!box) return;

    const status = a?.status || "NONE";

    if (status === "NONE") {
      box.innerHTML = `
        <div class="ah-row" style="justify-content:space-between; gap:10px;">
          <div>
            <div class="ah-title">No active mission</div>
            <div class="ah-muted" style="margin-top:4px;">Pick an offer to start.</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; min-width:140px;">
            <button type="button" class="ah-btn ghost" data-act="refresh">Refresh</button>
          </div>
        </div>
      `;
      return;
    }

    // Create waiting DOM once (then only update text/width)
    if (!el("mWaitEta") || !el("mBarFill")) {
      box.innerHTML = `
        <div class="m-wait">
          <div class="m-wait-top">
            <div style="min-width:0;">
              <div class="ah-title">${esc(a.title || "Mission")}</div>
              <div id="mWaitEta" class="m-wait-eta">—</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px; align-items:stretch; min-width:140px;">
              <button type="button" class="ah-btn ghost" data-act="refresh">Refresh</button>
              <button id="mResolveBtn" type="button" class="ah-btn" data-act="resolve" style="display:none">Resolve</button>
            </div>
          </div>

          <div class="m-bar">
            <div id="mBarFill" class="m-bar-fill" style="width:0%"></div>
          </div>

          <div id="mWaitMeta" class="m-wait-meta"></div>
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

    if (resolveBtn) {
      resolveBtn.style.display = (status === "READY") ? "" : "none";

      if (status === "READY" && !resolveBtn.__pinged) {
        resolveBtn.__pinged = true;
        try { Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success"); } catch(_) {}
      }
      if (status !== "READY") resolveBtn.__pinged = false;
    }
  }

  // =========================
  // Offers + Last Resolve
  // =========================
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
    const rolls = (o?.lootRolls ?? o?.loot_rolls ?? o?.lootRolls ?? reward.rolls ?? reward.loot_rolls ?? "?");

    const offerId = String(o?.offerId || o?.id || "");

    const hasActive = !!(active?.status && active.status !== "NONE");
    const disabled = hasActive ? "disabled" : "";

    return `
      <div class="m-offer">
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
      <div class="ah-card m-card" style="margin-top:10px;">
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

    // ✅ sync clock once per fresh state (avoid drift)
    _syncServerClock(payload);

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const active = getActive(payload);
    const last   = payload.lastResolve || null;

    _root.innerHTML = `
      <div class="m-stage">
        <div class="ah-card m-card" id="missionsActiveBox"></div>

        <div class="ah-card m-card" style="margin-top:10px;">
          <div class="ah-row" style="justify-content:space-between; gap:10px;">
            <div>
              <div class="ah-title">Offers</div>
              <div class="ah-muted" style="margin-top:4px;">Pick a tier — stability first, icons next.</div>
            </div>
            <button type="button" class="ah-btn ghost" data-act="refresh">Refresh</button>
          </div>

          <div style="margin-top:10px;">
            ${
              offers.length
                ? offers.map(o => renderOffer(o, active)).join("")
                : `<div class="ah-muted">No offers yet. Tap Refresh.</div>`
            }
          </div>
        </div>

        ${last ? renderLast(last) : ""}

        <div class="ah-muted" style="margin-top:10px; text-align:center; opacity:.85;">
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

  window.Missions = { init, open, close, reload: loadState };
})();
