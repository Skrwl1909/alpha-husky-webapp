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

  // ===========
  // Assets (Cloudinary mapping for /assets/*)
  // ===========
  const CLOUD_BASE = (window.CLOUDINARY_BASE || "https://res.cloudinary.com/dnjwvxinh/image/upload/");

  function assetUrl(p) {
    p = String(p || "");
    if (!p) return "";
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    if (p.startsWith("data:")) return p;
    if (p.startsWith("/assets/")) return CLOUD_BASE + p.slice("/assets/".length);
    return p;
  }

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _modal = null; // #missionsBack or #missionsModal
  let _root = null;  // #missionsRoot
  let _tick = null;
  let _state = null;

  // ✅ start sync guard (prevents "blink back to offers")
  let _pendingStart = null; // { tier, offerId, startedClientSec, durationSec, title, untilMs, rareDrop? }

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // === TELEGRAM ANALYTICS HELPER (bezpieczny) ===
  function track(eventName, data = {}) {
    if (typeof window.telegramAnalytics?.trackEvent === "function") {
      window.telegramAnalytics.trackEvent(eventName, data);
    }
    // else { quietly ignore - SDK jeszcze się ładuje }
  }

  // =========================
  // Styles (S&F vibe inside Missions content; + full-screen for #missionsBack)
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

      /* ✅ FULL SCREEN sheet — Missions feels like its own screen (not a popup) */
      #missionsBack{
        position:fixed !important;
        inset:0 !important;
        z-index: 99999999 !important;
        display:none; /* JS sets display:flex */
        align-items:stretch !important;
        justify-content:stretch !important;
        padding:0 !important;

        /* full-screen background */
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

      /* wipe ALL typical modal wrappers inside missionsBack */
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

      /* content scroll area */
      #missionsBack #missionsRoot{
        flex: 1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
        -webkit-overflow-scrolling:touch;
        padding: 14px 14px calc(18px + env(safe-area-inset-bottom)) 14px !important;
      }

      /* if you have a bottom button row from index, keep it sticky */
      #missionsBack .btn-row{
        position:sticky !important;
        bottom:0 !important;
        padding: 12px 14px calc(12px + env(safe-area-inset-bottom)) 14px !important;
        background: rgba(0,0,0,.22) !important;
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(255,255,255,.08) !important;
      }

      /* Base stage (offers screen) */
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

      /* WAITING mode = whole screen switches background */
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

      /* WAITING UI */
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

      /* ✅ Possible rare drop card */
      #missionsRoot .m-rare{
        width: min(520px, 92%);
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.24);
        backdrop-filter: blur(10px);
        box-shadow: 0 16px 34px rgba(0,0,0,.32);
        padding: 10px 10px;
        margin-top: 10px;
        text-align:left;
        position:relative;
        overflow:hidden;
      }
      #missionsRoot .m-rare::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        background:
          radial-gradient(circle at 22% 18%, rgba(255,255,255,.10), transparent 55%),
          radial-gradient(circle at 92% 88%, rgba(0,229,255,.10), transparent 58%);
        opacity:.55;
        mix-blend-mode: overlay;
      }
      #missionsRoot .m-rare > *{ position:relative; z-index:1; }

      #missionsRoot .m-rare-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom: 8px;
      }
      #missionsRoot .m-rare-tag{
        font-size: 11px;
        letter-spacing: .4px;
        text-transform: uppercase;
        opacity: .86;
      }
      #missionsRoot .m-rare-chance{
        font-size: 11px;
        opacity: .82;
        white-space:nowrap;
      }

      #missionsRoot .m-rare-row{
        display:flex;
        gap:10px;
        align-items:center;
        min-width:0;
      }
      #missionsRoot .m-rare-ico{
        width: 46px;
        height: 46px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.06);
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        flex: 0 0 auto;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
      }
      #missionsRoot .m-rare-ico img{
    width: 100%;
    height: 100%;
    object-fit: contain;
    transform: translateZ(0);
    filter: drop-shadow(0 10px 18px rgba(0,0,0,.35));
  }
  #missionsRoot .m-rare-ico .m-rare-fallback{
    font-weight: 950;
    opacity: .95;
    font-size: 20px;
    color: rgba(255,255,255,.92);
    text-shadow: 0 10px 22px rgba(0,0,0,.55);
  }
      #missionsRoot .m-rare-meta{
        min-width:0;
        display:flex;
        flex-direction:column;
        gap:2px;
      }
      #missionsRoot .m-rare-name{
        font-weight: 900;
        letter-spacing: .15px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #missionsRoot .m-rare-sub{
        font-size: 12px;
        opacity: .84;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      /* rarity accents (subtle) */
      #missionsRoot .m-rare[data-rarity="uncommon"]{ border-color: rgba(120,255,120,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(120,255,120,.06); }
      #missionsRoot .m-rare[data-rarity="rare"]{ border-color: rgba(80,180,255,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(80,180,255,.06); }
      #missionsRoot .m-rare[data-rarity="epic"]{ border-color: rgba(200,120,255,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(200,120,255,.06); }
      #missionsRoot .m-rare[data-rarity="legendary"]{ border-color: rgba(255,200,90,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,200,90,.06); }

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
      if (act === "back_to_offers") { _pendingStart = null; stopTick(); return void loadState(); }
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

  function open() {
    ensureModal();
    if (!_modal) return false;
    
    // ANALYTICS: gracz otworzył ekran misji
    track("missions_opened");

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
  // Rare Drop extraction (robust)
  // =========================
  function _normRarity(r) {
    r = String(r || "").toLowerCase().trim();
    if (!r) return "";
    if (r === "leg" || r === "legend") return "legendary";
    if (r === "epi") return "epic";
    return r;
  }

  function _chanceToPct(v) {
    if (v == null) return null;

    if (typeof v === "string") {
      const s = v.trim();

      const frac = s.match(/(\d+)\s*\/\s*(\d+)/);
      if (frac) {
        const a = Number(frac[1]), b = Number(frac[2]);
        if (Number.isFinite(a) && Number.isFinite(b) && b > 0) return (a * 100) / b;
      }

      const m = s.match(/([\d.]+)/);
      if (!m) return null;
      const n = Number(m[1]);
      if (!Number.isFinite(n)) return null;

      if (s.includes("%")) return n;
      if (n <= 1) return n * 100;
      return n;
    }

    if (typeof v === "number") {
      if (!Number.isFinite(v)) return null;
      if (v <= 1) return v * 100;
      return v;
    }

    return null;
  }

  function _fmtPct(pct) {
    if (pct == null || !Number.isFinite(pct)) return "";
    if (pct < 1) return `${pct.toFixed(2)}%`;
    if (pct < 10) return `${pct.toFixed(1)}%`;
    return `${Math.round(pct)}%`;
  }

  function _guessIconFromKey(key, slot) {
    key = String(key || "");
    slot = String(slot || "");
    if (!key) return "";

    if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("/")) return key;

    const ext = key.includes(".") ? "" : ".png";
    const base = key.replace(/^equip\//, "").replace(/^items\//, "");

    const isEquip =
      !!slot ||
      /weapon|armor|cloak|collar|helmet|ring|offhand|badge|pet|rune|gloves|fangs/i.test(base);

    const folder = isEquip ? "equip" : "items";
    return `/assets/${folder}/${base}${ext}`;
  }

  function _extractRareDrop(fromObj) {
  if (!fromObj || typeof fromObj !== "object") return null;

  // 1) Prefer nested object (ONLY if explicitly provided)
  const nested =
    fromObj.possibleRareDrop || fromObj.possible_rare_drop ||
    fromObj.rareDropPreview  || fromObj.rare_drop_preview ||
    fromObj.rareDrop         || fromObj.rare_drop ||
    fromObj.rareItem         || fromObj.rare_item ||
    fromObj.possibleDrop     || fromObj.possible_drop ||
    null;

  if (nested && typeof nested === "object") {
    return _normalizeRareDropObj(nested);
  }

  // 2) Allow FLAT fields, but ONLY if they look like real drop metadata
  const flatKey =
    fromObj.rare_item_key || fromObj.rareItemKey ||
    fromObj.rare_drop_key || fromObj.rareDropKey ||
    fromObj.rare_key      || fromObj.rareKey ||
    "";

  const flatIcon =
    fromObj.rare_icon_url || fromObj.rareIconUrl ||
    fromObj.rare_icon     || fromObj.rareIcon ||
    fromObj.rare_img      || fromObj.rareImg ||
    "";

  const flatChance =
    fromObj.rare_chance || fromObj.rareChance ||
    fromObj.rare_drop_chance || fromObj.rareDropChance ||
    fromObj.rare_pct || fromObj.rarePct ||
    fromObj.rare_percent || fromObj.rarePercent ||
    null;

  const flatRarity =
    fromObj.rare_rarity || fromObj.rareRarity ||
    fromObj.rare_quality || fromObj.rareQuality ||
    "";

  // ✅ IMPORTANT: if no key/icon/chance/rarity => DO NOT RENDER
  const hasAnySignal = !!(flatKey || flatIcon || flatChance != null || flatRarity);
  if (!hasAnySignal) return null;

  return _normalizeRareDropObj({
    item_key: flatKey,
    icon: flatIcon,
    chance: flatChance,
    rarity: flatRarity,
    name: fromObj.rare_name || fromObj.rareName || "",
    slot: fromObj.rare_slot || fromObj.rareSlot || "",
    note: fromObj.rare_note || fromObj.rareNote || "",
  });
}

// helper: requires real identity (key or icon). No more "title as item"
function _normalizeRareDropObj(obj) {
  if (!obj || typeof obj !== "object") return null;

  const key = String(obj.item_key || obj.itemKey || obj.key || obj.id || "");
  const iconRaw = String(obj.iconUrl || obj.icon_url || obj.icon || obj.img || obj.image || obj.url || "");

  // ✅ HARD GUARD: if neither key nor icon → not a real drop preview
  if (!key && !iconRaw) return null;

  const name = String(obj.name || obj.title || obj.label || obj.item_name || obj.itemName || key || "Rare Drop");
  const rarity = _normRarity(obj.rarity || obj.quality || obj.tier || obj.r || "");
  const chancePct = _chanceToPct(obj.chance ?? obj.chancePct ?? obj.pct ?? obj.percent ?? obj.odds ?? obj.prob ?? obj.probability);
  const slot = String(obj.slot || obj.item_slot || obj.itemSlot || "");
  const note = String(obj.note || obj.hint || obj.desc || obj.description || "");

  const icon = iconRaw || _guessIconFromKey(key, slot);

  return {
    name,
    rarity,
    chancePct,
    key,
    slot,
    note,
    iconUrl: assetUrl(icon),
    _raw: obj
  };
}

  function renderRareDropCard(rare) {
    if (!rare) return "";
    const rarity = _normRarity(rare.rarity);
    const chance = rare.chancePct != null ? _fmtPct(rare.chancePct) : "";
    const subParts = [];
    if (rarity) subParts.push(rarity.toUpperCase());
    if (rare.slot) subParts.push(String(rare.slot).toUpperCase());
    if (rare.note) subParts.push(rare.note);

    const sub = subParts.filter(Boolean).join(" · ");
    const img = rare.iconUrl ? `
      <img src="${esc(rare.iconUrl)}" alt="${esc(rare.name)}" loading="lazy" decoding="async"
        onerror="this.remove(); this.parentNode && this.parentNode.insertAdjacentHTML('beforeend','<div class=&quot;m-rare-fallback&quot;>★</div>');" />
    ` : `<div class="m-rare-fallback">★</div>`;

    return `
      <div class="m-rare" data-rarity="${esc(rarity || "")}">
        <div class="m-rare-top">
          <div class="m-rare-tag">Possible rare drop</div>
          <div class="m-rare-chance">${chance ? `Chance <b>${esc(chance)}</b>` : `<span style="opacity:.8">Rare</span>`}</div>
        </div>
        <div class="m-rare-row">
          <div class="m-rare-ico">${img}</div>
          <div class="m-rare-meta">
            <div class="m-rare-name">${esc(rare.name || "Rare Drop")}</div>
            <div class="m-rare-sub">${esc(sub || "Keep an eye on the loot…")}</div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================
  // Active parsing (improved)
  // =========================
  let _legacyAnchor = null;

  function _missionTimeInfo(m) {
    const started = Number(m?.started_ts || m?.start_ts || m?.start_time || m?.startTime || 0);
    const dur = Number(m?.duration_sec || m?.duration || m?.durationSec || 0);
    const ends =
      Number(m?.ends_ts || m?.ready_at_ts || m?.ready_at || m?.endsTs || 0) ||
      (started && dur ? (started + dur) : 0);

    const now = _nowSec();
    let remaining = 0;

    if (ends) remaining = ends - now;
    else {
      const rawLeft = (m?.leftSec ?? m?.left_sec);
      remaining = (typeof rawLeft === "number") ? rawLeft : Number(rawLeft || 0);
    }

    remaining = Number.isFinite(remaining) ? remaining : 0;

    const st = String(m?.state || m?.status || "").toLowerCase();
    const isRunning = (remaining > 1) || (st === "in_progress" || st === "running" || st === "active");
    const isReady = (remaining <= 1) && (st === "completed" || st === "ready" || st === "done" || st === "");

    return {
      started,
      dur,
      ends,
      remaining,
      isRunning,
      isReady,
      sortTs: ends || started || 0
    };
  }

  function _pickActiveFromList(list) {
    if (!Array.isArray(list) || !list.length) return null;

    let best = null;
    let bestScore = -1;
    let bestTs = -1;

    for (const m of list) {
      if (!m || typeof m !== "object") continue;
      const t = _missionTimeInfo(m);

      // score: RUNNING (30) > READY (10) > ignore (0)
      const score = t.isRunning ? 30 : (t.isReady ? 10 : 0);
      if (score <= 0) continue;

      if (score > bestScore || (score === bestScore && t.sortTs > bestTs)) {
        best = m;
        bestScore = score;
        bestTs = t.sortTs;
      }
    }
    return best || null;
  }

  function _primaryActive(payload) {
    return (
      payload?.active_mission ||
      payload?.activeMission ||
      payload?.active ||
      payload?.current_mission ||
      payload?.currentMission ||
      payload?.mission ||
      payload?.current ||
      null
    );
  }

  function getActive(payload) {
    const list =
      payload?.user_missions || payload?.userMissions || payload?.missions || null;

    const primary = _primaryActive(payload);
    const listPick = _pickActiveFromList(list);

    // if primary exists but looks READY while list has RUNNING → trust list
    let am = primary && typeof primary === "object" ? primary : null;
    if (!am && listPick) am = listPick;

    if (am && listPick && am !== listPick) {
      const pInfo = _missionTimeInfo(am);
      const lInfo = _missionTimeInfo(listPick);
      if (pInfo.isReady && lInfo.isRunning) am = listPick;
    }

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
        __raw: am
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
      return { status: remaining > 0 ? "RUNNING" : "READY", title, remaining, total, pct, readyAt: am.readyAt || "", __raw: am };
    }

    if (status === "READY") {
      return { status: "READY", title, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "", __raw: am };
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
      __raw: null
    };
  }

  function _pendingValid() {
    return !!(_pendingStart && Date.now() < Number(_pendingStart.untilMs || 0));
  }

  // =========================
  // Tick
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
      subEl.textContent = "Tap Resolve to claim rewards.";
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

    // ✅ rare drop can come from offer (recommended)
    const rareDrop = _extractRareDrop(o);

    _pendingStart = {
      tier,
      offerId,
      startedClientSec: started,
      durationSec: durSec,
      title,
      rareDrop,
      // ✅ keep optimistic timer until mission would be ready (+30s buffer)
      untilMs: Date.now() + (durSec * 1000) + 30000,
    };

    render(); // renders WAITING via pending
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

    const last = payload.lastResolve || payload.last_resolve || null;

    if (active.status && active.status !== "NONE") {
      // ✅ rare drop source order: pending.offer → active raw mission → payload (fallback)
      const rare =
        (active.__pending ? (_pendingStart?.rareDrop || null) : null) ||
        _extractRareDrop(active.__raw) ||
        _extractRareDrop(_primaryActive(payload)) ||
        null;

      _root.innerHTML = `
        <div class="m-stage m-stage-wait">
          <div class="m-wait-center">
            <div class="m-muted">${esc(active.title || "Mission")}</div>
            <div id="mClock" class="m-clock">—</div>
            <div id="mClockSub" class="m-clock-sub">—</div>

            <div class="m-bar"><div id="mFill" class="m-bar-fill" style="width:0%"></div></div>

            ${rare ? renderRareDropCard(rare) : ""}

            <div class="m-actions">
              <button type="button" class="btn" data-act="refresh">Refresh</button>
              <button id="mResolveBtn" type="button" class="btn primary" data-act="resolve" style="display:none">Resolve</button>
              ${active.__pending ? `<button type="button" class="btn" data-act="back_to_offers">Back</button>` : ``}
              <button type="button" class="btn" data-act="close">Close</button>
            </div>
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
              <div class="m-muted" style="margin-top:6px;">Pick a tier — Start → Wait → Resolve.</div>
            </div>
            <button type="button" class="btn" data-act="refresh">Refresh</button>
          </div>

          <div class="m-hr"></div>

          <div>
            ${
              offers.length
                ? offers.map(o => renderOffer(o, realActive)).join("")
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
  // Sync after start (poll state until backend confirms active)
  // =========================
  async function _syncAfterStart(maxMs = 6500, intervalMs = 450) {
    const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      try {
        const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
        _state = res;

        // debug snapshots
        try {
          window.__AH_MISSIONS_RAW = res;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
        } catch (_) {}

        const p = normalizePayload(res);
        const a = p ? getActive(p) : { status: "NONE" };
        if (a.status && a.status !== "NONE") {
          _pendingStart = null;
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
  async function loadState() {
    renderLoading("Loading missions…");
    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
      _state = res;

      // debug snapshots
      try {
        window.__AH_MISSIONS_RAW = res;
        window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
      } catch (_) {}

      const p = normalizePayload(_state);
      const a = p ? getActive(p) : { status: "NONE" };
      if (a.status && a.status !== "NONE") _pendingStart = null;

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
      
      // ANALYTICS: rozpoczęcie misji
      track("mission_started", {
        tier: tier,
        offerId: offerId,
        title: String(o?.title || tier || "Unknown Mission")
      });

      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      // optimistic wait immediately (prevents blink)
      _optimisticStart(tier, offerId);

      // if backend returned state with active, great — but still poll to confirm
      if (startRes && typeof startRes === "object") {
        _state = startRes;
        try {
          window.__AH_MISSIONS_RAW = startRes;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(startRes);
        } catch (_) {}
        render();
      }

      // poll state until backend confirms active (or timeout)
      const ok = await _syncAfterStart();
      if (!ok) {
        log("start: backend did not confirm active within window");
      }
      return;

    } catch (e) {
      const msg = String(e?.message || e || "");
      if (msg.toUpperCase() === "ACTIVE") {
        await loadState();
        return;
      }
      _pendingStart = null;
      renderError("Start failed", msg);
    }
  }

  async function doResolve() {
    try {
      await api("/webapp/missions/action", { action: "resolve", run_id: rid("m:resolve") });
      
      // ANALYTICS: ukończenie misji
      track("mission_resolved", {
        success: true,
        title: _state?.active_mission?.title || _pendingStart?.title || "Mission"
      });
      
      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      _pendingStart = null;
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
