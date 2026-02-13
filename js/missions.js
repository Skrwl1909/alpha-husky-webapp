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

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _modal = null; // #missionsBack (index) or fallback #missionsModal
  let _root = null;  // #missionsRoot
  let _tick = null;
  let _state = null;

  // optimistic waiting after clicking Start
  let _optimisticUntil = 0;
  let _optimisticTitle = "Starting…";

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // =========================
  // Styles (only inside Missions content)
  // =========================
  function ensureStyles() {
    if (document.getElementById("missions-ui-css")) return;

    const st = document.createElement("style");
    st.id = "missions-ui-css";
    st.textContent = `
      :root{
        /* change if assets are elsewhere relative to index.html */
        --missions-bg: url("mission_bg.webp");
        --missions-wait-bg: url("mission_waiting_bg.webp");
        --missions-dust: url("dust.png");
      }

      #missionsRoot{ display:block !important; }

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

      /* WAITING mode */
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

      /* Offers */
      #missionsRoot .m-offer{
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        border-radius:14px;
        padding:12px;
      }
      #missionsRoot .m-offer + .m-offer{ margin-top:10px; }
      #missionsRoot .m-offer:hover{
        border-color: rgba(0,229,255,.18);
        box-shadow: 0 12px 26px rgba(0,0,0,.30);
      }
      #missionsRoot button[disabled]{ opacity:.55; cursor:not-allowed; }

      /* Shakes & Fidget WAITING */
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
    `;
    document.head.appendChild(st);
  }

  // =========================
  // Modal wiring (index-first)
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

    // fallback (shouldn't happen in your setup)
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

  function open() {
    ensureModal();
    if (!_modal) return false;

    _modal.style.display = "flex";
    _modal.classList.add("is-open");
    document.body.classList.add("missions-open");

    try { window.navOpen?.(_modal.id); } catch (_) {}

    renderLoading("Loading missions…");
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
    const nowTs = Number(payload?.now_ts || payload?.nowTs || payload?.serverNowTs || 0);
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

  function _parseDurationSec(v) {
    if (typeof v === "number" && isFinite(v)) return Math.max(0, Math.floor(v));
    const s = String(v ?? "").trim().toLowerCase();
    if (!s) return 0;

    // "hh:mm:ss" or "mm:ss"
    if (s.includes(":")) {
      const parts = s.split(":").map(x => Number(x));
      if (parts.some(n => !isFinite(n))) return 0;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return 0;
    }

    // "28m", "1h", "1h 20m", "90s"
    let total = 0;
    const re = /(\d+)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)/g;
    let m;
    while ((m = re.exec(s))) {
      const num = Number(m[1]);
      const u = m[2];
      if (!isFinite(num)) continue;
      if (u.startsWith("h")) total += num * 3600;
      else if (u.startsWith("m")) total += num * 60;
      else total += num;
    }
    if (total > 0) return total;

    // "28" -> treat as seconds (safe)
    if (/^\d+$/.test(s)) return Number(s);
    return 0;
  }

  function _upper(x) { return String(x ?? "").trim().toUpperCase(); }

  function _asObjOrFirst(x) {
    if (!x) return null;
    if (Array.isArray(x)) {
      const first = x.find(v => v && typeof v === "object");
      return first || null;
    }
    return (typeof x === "object") ? x : null;
  }

  // =========================
  // Active mission parsing (robust)
  // =========================
  let _legacyAnchor = null;

  function getActive(payload) {
    const raw =
      payload?.active_mission ||
      payload?.activeMission ||
      payload?.active ||
      payload?.missionActive ||
      null;

    const am = _asObjOrFirst(raw);
    if (!am) return { status: "NONE" };

    const title = am.title || am.name || am.label || am.missionName || "Mission";

    // status can be in: status/state/phase
    const stRaw = _upper(am.status || am.state || am.phase || am.stage || "");

    // map to RUNNING/READY when possible
    let status = "";
    if (["IN_PROGRESS","INPROGRESS","RUNNING","ACTIVE","STARTED","IN_PROGRESS_MISSION"].includes(stRaw)) status = "RUNNING";
    if (["DONE","COMPLETED","READY","FINISHED","RESOLVABLE"].includes(stRaw)) status = "READY";

    // timestamps / duration (duration may be "28m" string)
    const started = Number(
      am.started_ts ?? am.start_ts ?? am.start_time ?? am.startTime ?? am.startedAt ?? 0
    ) || 0;

    const dur = _parseDurationSec(am.duration_sec ?? am.durationSec ?? am.duration ?? am.duration_label ?? 0);

    const ends =
      Number(am.ends_ts ?? am.endsTs ?? am.ready_at_ts ?? am.readyAtTs ?? am.ready_at ?? am.readyAt ?? am.end_time ?? 0) ||
      (started && dur ? (started + dur) : 0);

    // remaining can be in many keys
    const remKey =
      am.leftSec ?? am.left_sec ??
      am.remainingSec ?? am.remaining_sec ??
      am.etaSec ?? am.eta_sec ??
      am.cooldownLeftSec ?? am.cooldown_left_sec ??
      am.time_left ?? am.timeLeft ?? null;

    const remFromKey = (remKey === null || remKey === undefined) ? null : Number(remKey);

    // if we have ends -> compute remaining + pct
    if (ends) {
      const now = _nowSec();
      const total = dur || Math.max(1, ends - (started || ends));
      const remaining = Math.max(0, Math.ceil(ends - now));
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));

      const st = remaining > 0 ? "RUNNING" : "READY";
      return {
        status: st,
        title,
        started_ts: started,
        duration_sec: total,
        ends_ts: ends,
        remaining,
        total,
        pct,
        readyAt: am.readyAtLabel || am.ready_at_label || am.readyAt || _fmtClock(ends),
        _raw: am,
      };
    }

    // if we have remaining seconds from key -> compute running/ready + pct using legacy anchor
    if (isFinite(remFromKey) && remFromKey !== null) {
      if (!status) status = (remFromKey > 0 ? "RUNNING" : "READY");

      if (status === "RUNNING") {
        const now = _nowSec();
        if (!_legacyAnchor || _legacyAnchor.left !== remFromKey || _legacyAnchor.title !== title) {
          _legacyAnchor = { left: remFromKey, at: now, title };
        }
        const elapsed = Math.max(0, now - _legacyAnchor.at);
        const remaining = Math.max(0, Math.ceil(_legacyAnchor.left - elapsed));
        const total = Math.max(1, dur || _legacyAnchor.left || 1);
        const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
        return { status: remaining > 0 ? "RUNNING" : "READY", title, remaining, total, pct, readyAt: am.readyAt || "", _raw: am };
      }

      return { status: "READY", title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "", _raw: am };
    }

    // last resort: if active object exists, treat as running even if fields are weird
    if (!status) {
      if (started || stRaw) status = (stRaw === "COMPLETED" ? "READY" : "RUNNING");
      else status = "RUNNING";
    }

    // we can't compute remaining -> mark unknown
    return {
      status,
      title,
      remaining: null,
      total: dur || null,
      pct: 0,
      readyAt: am.readyAt || "",
      _raw: am,
    };
  }

  // =========================
  // Tick (updates waiting)
  // =========================
  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      if (!payload) return;

      const a = getActive(payload);
      if (a.status === "NONE") {
        // optimistic still active?
        if (Date.now() / 1000 < _optimisticUntil) {
          paintWaiting({
            status: "RUNNING",
            title: _optimisticTitle,
            remaining: null,
            total: null,
            pct: 0,
            readyAt: "",
          });
        } else {
          stopTick();
        }
        return;
      }
      paintWaiting(a);
    }, 1000);
  }

  function stopTick() {
    if (_tick) clearInterval(_tick);
    _tick = null;
  }

  // =========================
  // API + normalize
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

  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;
    if (res.state && typeof res.state === "object") return res.state;
    if (res.data && typeof res.data === "object") return (res.data.state && typeof res.data.state === "object") ? res.data.state : res.data;
    if (res.payload && typeof res.payload === "object") return (res.payload.state && typeof res.payload.state === "object") ? res.payload.state : res.payload;
    if (res.result && typeof res.result === "object") return (res.result.state && typeof res.result.state === "object") ? res.result.state : res.result;
    return res;
  }

  // =========================
  // UI primitives
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
          <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn" data-act="refresh">Retry</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
      </div>
    `;
    stopTick();
  }

  function renderOffer(o, active) {
    const tier  = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const title = String(o?.title || "");
    const desc  = String(o?.desc || "");

    const durSec = Number(o?.durationSec || o?.duration_sec || 0);
    const durLabel =
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
            <div class="m-title">${esc(label)} <span class="m-muted">(${esc(durLabel)})</span></div>
            ${title ? `<div class="m-muted" style="margin-top:6px;"><b>${esc(title)}</b></div>` : ""}
            ${desc ? `<div class="m-muted" style="margin-top:4px;">${esc(desc)}</div>` : ""}
            <div class="m-muted" style="margin-top:8px;">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
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

  function renderWaitingStage(title) {
    if (!_root) return;
    _root.innerHTML = `
      <div class="m-stage m-stage-wait">
        <div class="m-wait-center">
          <div class="m-muted">${esc(title || "Mission")}</div>
          <div id="mClock" class="m-clock">—</div>
          <div id="mClockSub" class="m-clock-sub">Syncing…</div>

          <div class="m-bar"><div id="mFill" class="m-bar-fill" style="width:0%"></div></div>

          <div class="m-actions">
            <button type="button" class="btn" data-act="refresh">Refresh</button>
            <button id="mResolveBtn" type="button" class="btn primary" data-act="resolve" style="display:none">Resolve</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
      </div>
    `;

    // hide bottom btn-row from index (S&F feel)
    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";
  }

  function paintWaiting(a) {
    const clockEl = el("mClock");
    const subEl = el("mClockSub");
    const fillEl = el("mFill");
    const resolveBtn = el("mResolveBtn");
    if (!clockEl || !subEl || !fillEl) return;

    const status = a?.status || "NONE";
    const remaining = (a.remaining === null || a.remaining === undefined) ? null : Number(a.remaining);
    const pct = Math.round((Number(a.pct || 0)) * 100);

    fillEl.style.width = `${Math.max(0, Math.min(100, pct))}%`;

    if (status === "RUNNING") {
      clockEl.textContent = (remaining === null) ? "—" : _fmtTime(remaining);
      subEl.innerHTML =
        (remaining === null)
          ? `Syncing timer… ${a.readyAt ? `· Ready at <b>${esc(a.readyAt)}</b>` : ""}`
          : `Progress <b>${esc(pct)}%</b>${a.readyAt ? ` · Ready at <b>${esc(a.readyAt)}</b>` : ""}`;
      if (resolveBtn) resolveBtn.style.display = "none";
    } else {
      clockEl.textContent = "READY";
      subEl.textContent = "Tap Resolve to claim rewards.";
      if (resolveBtn) resolveBtn.style.display = "";
    }
  }

  // =========================
  // Main render (2 modes)
  // =========================
  function render() {
    if (!_root) return;

    const payload = normalizePayload(_state);
    if (!payload || typeof payload !== "object") {
      renderError("Bad payload", JSON.stringify(_state).slice(0, 900));
      return;
    }

    _syncServerClock(payload);

    const active = getActive(payload);

    // If backend has active object but we still got NONE, force waiting anyway
    const rawActiveExists = !!(
      payload.active_mission || payload.activeMission || payload.active || payload.missionActive
    );

    // MODE: WAITING
    if ((active.status && active.status !== "NONE") || rawActiveExists) {
      renderWaitingStage(active.title || _optimisticTitle || "Mission");
      paintWaiting(active.status === "NONE"
        ? { status: "RUNNING", title: active.title || _optimisticTitle, remaining: null, total: null, pct: 0, readyAt: "" }
        : active
      );
      startTick();
      return;
    }

    // MODE: OFFERS
    stopTick();

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const last = payload.lastResolve || payload.last_resolve || null;

    // show bottom btn-row again
    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "";

    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-card">
          <div class="m-row">
            <div style="min-width:0;">
              <div class="m-title">No active mission</div>
              <div class="m-muted" style="margin-top:6px;">Pick an offer to start.</div>
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
              <div class="m-title">Offers</div>
              <div class="m-muted" style="margin-top:6px;">Start → Wait → Resolve (Shakes & Fidget style).</div>
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

        <div class="m-muted" style="text-align:center; opacity:.85; margin-top:10px;">
          Missions are backend-driven. If backend is offline you’ll see an error here.
        </div>
      </div>
    `;
  }

  // =========================
  // Actions
  // =========================
  async function loadState() {
    renderLoading("Loading missions…");
    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
      _state = res;
      _optimisticUntil = 0;
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
    // ✅ instant switch to waiting (S&F feel)
    _optimisticTitle = "Starting…";
    _optimisticUntil = (Date.now() / 1000) + 12; // 12s window
    renderWaitingStage(_optimisticTitle);
    paintWaiting({ status: "RUNNING", title: _optimisticTitle, remaining: null, total: null, pct: 0, readyAt: "" });
    startTick();

    try {
      await api("/webapp/missions/action", {
        action: "start",
        tier,
        offerId,
        id: offerId,
        offer_id: offerId,
        run_id: rid("m:start"),
      });

      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
      await loadState();
    } catch (e) {
      const msg = String(e?.message || e || "");

      // ✅ If backend says ACTIVE => don't show error, just reload & show waiting
      if (msg.toUpperCase() === "ACTIVE") {
        await loadState();
        return;
      }

      renderError("Start failed", msg);
    }
  }

  async function doResolve() {
    try {
      await api("/webapp/missions/action", { action: "resolve", run_id: rid("m:resolve") });
      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      await loadState();
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
