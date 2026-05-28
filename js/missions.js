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

  function textOrEmpty(v) {
    if (v == null) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return "";
  }

  function titleizeWord(v) {
    const s = textOrEmpty(v).toLowerCase();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function normalizeModifierLabel(v) {
    return textOrEmpty(v);
  }

  function normalizeOutcomeTier(last) {
    const direct = textOrEmpty(last?.outcomeTier || last?.outcome_tier);
    if (direct) return direct;
    const result = textOrEmpty(last?.result);
    if (result === "victory") return "Success";
    if (result === "defeat" || result === "failure" || result === "failed") return "Failed";
    return "";
  }

  function normalizeOutcomeTone(outcomeTier) {
    const key = textOrEmpty(outcomeTier).toLowerCase();
    if (key === "critical success") return "critical";
    if (key === "partial success") return "partial";
    if (key === "failed") return "failed";
    return "success";
  }

  function normalizeStatsText(v) {
    if (Array.isArray(v)) {
      const parts = v.map((x) => textOrEmpty(x).toUpperCase()).filter(Boolean);
      return parts.join(" / ");
    }
    return textOrEmpty(v).toUpperCase();
  }

  function normalizePetMatchLabel(last) {
    const direct = textOrEmpty(last?.activePetMatchLabel || last?.petMatchLabel);
    if (direct) return direct;
    const assist = textOrEmpty(last?.activePetAssistLabel || last?.petAssistLabel);
    if (assist) return assist.replace(/\s+match$/i, "");
    const matchKey = textOrEmpty(last?.activePetMatch || last?.petMatch);
    return matchKey ? titleizeWord(matchKey) : "";
  }

  function normalizePercentNumber(v) {
    if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.min(100, Math.round(v)));
    const s = textOrEmpty(v);
    if (!s) return null;
    const m = s.match(/-?\d+/);
    if (!m) return null;
    const n = Number(m[0]);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function normalizeProgressLine(last) {
    const direct = textOrEmpty(last?.progressLine);
    if (direct) return direct;
    const pct = normalizePercentNumber(last?.progressPercent);
    if (pct == null) return "";
    if (pct >= 100 && normalizeOutcomeTone(normalizeOutcomeTier(last)) !== "partial" && normalizeOutcomeTone(normalizeOutcomeTier(last)) !== "failed") {
      return "";
    }
    return `Recovery secured: ${pct}%`;
  }

  function normalizeShortfallLine(last) {
    const direct = textOrEmpty(last?.shortfallLine);
    if (direct) return direct;
    const pct = normalizePercentNumber(last?.shortByPercent);
    return pct == null || pct <= 0 ? "" : `Short by: ${pct}%`;
  }

  function normalizeRareChanceLabel(v) {
    const raw = textOrEmpty(v).replace(/\s+/g, " ").trim();
    if (!raw) return "";
    let core = raw.replace(/\s+chance$/i, "").trim();
    if (core && !/cache/i.test(core) && /vault/i.test(core)) core = `${core} cache`;
    return core;
  }

  function normalizeRecommendedLine(last) {
    const stats = normalizeStatsText(last?.recommendedStatsText || last?.recommendedStatLabels || last?.recommendedStats);
    return stats ? `Recommended: ${stats}` : "";
  }

  function normalizePetFitEffect(last) {
    const direct = textOrEmpty(last?.petFitEffect);
    if (direct) return `Effect: ${direct}`;
    const matchKey = textOrEmpty(last?.activePetMatch || last?.petMatch).toLowerCase();
    if (matchKey === "strong") return "Effect: stronger pet assist";
    if (matchKey === "neutral") return "Effect: steady pet assist";
    if (matchKey === "weak") return "Effect: weaker pet assist";
    return "";
  }

  function normalizeBonusFoundChip(last) {
    if (!(last?.bonusFound || last?.rareHit)) return "";
    const label = textOrEmpty(last?.bonusFoundLabel) || "Rare Cache";
    const details = normalizeRewardList(last?.bonusFoundDetails);
    return details.length
      ? `Bonus found: ${label} (${details.join(", ")})`
      : `Bonus found: ${label}`;
  }

  function normalizeCacheSignalChip(last) {
    if (last?.bonusFound || last?.rareHit) return "";
    if (last?.cacheSignalDetected || textOrEmpty(last?.rareHint)) return "Vault trace detected";
    return "";
  }

  function normalizeRewardList(v) {
    if (Array.isArray(v)) {
      return v
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (typeof item === "number" && Number.isFinite(item)) return String(item);
          if (item && typeof item === "object") {
            const label = textOrEmpty(item.label || item.name || item.text || item.value);
            return label;
          }
          return "";
        })
        .filter(Boolean);
    }
    const text = textOrEmpty(v);
    return text ? [text] : [];
  }

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _modal = null; // #missionsBack or #missionsModal
  let _root = null;  // #missionsRoot
  let _tick = null;
  let _state = null;
  let _stateLoadedAt = 0;
  let _missionsHelpOpen = false;
  const MISSIONS_STATE_STALE_MS = 10 * 1000;

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
        padding: 10px 10px calc(12px + env(safe-area-inset-bottom)) 10px !important;
      }

      /* if you have a bottom button row from index, keep it sticky */
      #missionsBack .btn-row{
        display:none !important;
      }

      /* Base stage (offers screen) */
      #missionsRoot .m-stage{
        position:relative;
        border:1px solid rgba(36,50,68,.95);
        border-radius:16px;
        padding:10px;
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
        border-radius: 12px;
        padding: 10px;
        background: rgba(0,0,0,.20);
        color: rgba(255,255,255,.92);
        backdrop-filter: blur(10px);
        box-shadow: 0 12px 28px rgba(0,0,0,.28);
      }

      #missionsRoot .m-title{
        font-weight:900;
        letter-spacing:.2px;
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      #missionsRoot .m-muted{
        opacity:.78;
        font-size:12.5px;
        line-height:1.35;
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      #missionsRoot .m-kicker{
        font-size: 11px;
        letter-spacing: .45px;
        text-transform: uppercase;
        opacity: .72;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-tag-row{
        display:flex;
        flex-wrap:wrap;
        gap:5px;
        margin-top:6px;
      }
      #missionsRoot .m-tag{
        display:inline-flex;
        align-items:center;
        min-height:19px;
        padding:0 7px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.05);
        font-size:10.5px;
        line-height:1.2;
        opacity:.9;
        white-space:normal;
        max-width:100%;
        overflow-wrap:anywhere;
      }

      #missionsRoot .m-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:8px;
        min-width:0;
      }

      #missionsRoot .m-hr{
        height:1px;
        background: rgba(255,255,255,.08);
        margin:8px 0;
      }

      #missionsRoot .m-shell-head{
        display:flex;
        flex-direction:column;
        gap:3px;
        margin-bottom:8px;
      }
      #missionsRoot .m-shell-top{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }
      #missionsRoot .m-shell-sub{
        font-size:12px;
        opacity:.76;
        line-height:1.3;
      }
      #missionsRoot .m-inline-status{
        margin-top:2px;
        font-size:12px;
        opacity:.82;
        line-height:1.3;
      }
      #missionsRoot .m-head-btn{
        flex:0 0 auto;
      }
      #missionsRoot .m-compact-btn{
        min-height:34px;
        padding:7px 12px;
        font-size:12px;
      }
      #missionsRoot .m-help-btn{
        min-width:34px;
        padding:7px 10px;
        border-radius:999px;
        font-weight:900;
      }
      #missionsRoot .m-help{
        margin-top:8px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:12px;
        padding:10px;
        background:rgba(255,255,255,.04);
      }
      #missionsRoot .m-help-title{
        font-size:12px;
        font-weight:900;
        letter-spacing:.4px;
        text-transform:uppercase;
        opacity:.88;
      }
      #missionsRoot .m-help-copy{
        margin-top:7px;
        font-size:12px;
        line-height:1.38;
        opacity:.84;
      }

      /* Offers */
      #missionsRoot .m-offer{
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        border-radius:12px;
        padding:9px 10px;
        overflow:hidden;
      }
      #missionsRoot .m-offer + .m-offer{ margin-top:8px; }
      #missionsRoot .m-offer:hover{
        border-color: rgba(0,229,255,.18);
        box-shadow: 0 10px 22px rgba(0,0,0,.26);
      }
      #missionsRoot .m-offer-main{
        display:flex;
        align-items:flex-start;
        gap:10px;
        min-width:0;
      }
      #missionsRoot .m-offer-copy{
        flex:1 1 auto;
        min-width:0;
      }
      #missionsRoot .m-offer-top{
        display:flex;
        align-items:center;
        gap:6px;
        flex-wrap:wrap;
        margin-bottom:4px;
      }
      #missionsRoot .m-offer-title{
        font-size:15px;
        font-weight:900;
        line-height:1.18;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-offer-body{
        margin-top:4px;
        display:-webkit-box;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:2;
        overflow:hidden;
      }
      #missionsRoot .m-offer-helper{
        margin-top:5px;
        font-size:11.5px;
        opacity:.82;
        line-height:1.3;
      }
      #missionsRoot .m-offer-reward{
        margin-top:5px;
        font-size:11.5px;
        opacity:.8;
        line-height:1.3;
      }
      #missionsRoot .m-offer-cta{
        flex:0 0 auto;
        align-self:center;
      }
      #missionsRoot .m-offer-cta .btn{
        min-height:34px;
        padding:7px 12px;
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

      #missionsRoot .m-report{
        border:1px solid rgba(120,160,190,.16);
        background:
          linear-gradient(180deg, rgba(6,10,14,.42), rgba(6,10,14,.70)),
          radial-gradient(circle at top right, rgba(0,229,255,.08), transparent 42%);
      }
      #missionsRoot .m-outcome-badge{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:24px;
        padding:4px 10px;
        border-radius:999px;
        font-size:11px;
        font-weight:900;
        letter-spacing:.45px;
        text-transform:uppercase;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(255,255,255,.06);
        color:rgba(255,255,255,.95);
        max-width:100%;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-outcome-badge[data-tone="critical"]{
        border-color:rgba(255,208,96,.38);
        background:rgba(255,176,0,.12);
        color:rgba(255,232,188,.98);
      }
      #missionsRoot .m-outcome-badge[data-tone="success"]{
        border-color:rgba(92,222,180,.28);
        background:rgba(47,161,125,.14);
      }
      #missionsRoot .m-outcome-badge[data-tone="partial"]{
        border-color:rgba(120,188,255,.28);
        background:rgba(52,108,168,.16);
      }
      #missionsRoot .m-outcome-badge[data-tone="failed"]{
        border-color:rgba(255,128,128,.28);
        background:rgba(122,48,48,.18);
      }
      #missionsRoot .m-report-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        min-width:0;
      }
      #missionsRoot .m-report-title{
        font-size:15px;
        font-weight:900;
        letter-spacing:.15px;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-sub{
        margin-top:4px;
        font-size:12px;
        opacity:.78;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-line{
        margin-top:8px;
        font-size:12.5px;
        line-height:1.42;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-chipline{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:8px;
      }
      #missionsRoot .m-report-chip{
        display:inline-flex;
        align-items:center;
        min-height:22px;
        padding:0 8px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.05);
        font-size:11px;
        line-height:1.2;
        white-space:normal;
        max-width:100%;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-section{
        margin-top:10px;
        padding-top:10px;
        border-top:1px solid rgba(255,255,255,.08);
      }
      #missionsRoot .m-report-label{
        font-size:11px;
        font-weight:900;
        letter-spacing:.45px;
        text-transform:uppercase;
        opacity:.72;
      }
      #missionsRoot .m-report-values{
        margin-top:6px;
        font-size:12.5px;
        line-height:1.42;
        overflow-wrap:anywhere;
      }

      @media (max-width: 520px){
        #missionsRoot .m-row,
        #missionsRoot .m-report-head,
        #missionsRoot .m-shell-top{
          flex-direction:column;
        }
        #missionsRoot .m-offer-main{
          flex-direction:column;
        }
        #missionsRoot .m-offer button.btn.primary{
          width:100%;
        }
        #missionsRoot .m-offer-cta{
          width:100%;
        }
        #missionsRoot .m-clock{
          font-size:42px;
        }
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
      if (act === "claim_blue_signal_frame") return void doClaimBlueSignalFrame();
      if (act === "open_frames") return void openFrames();
      if (act === "close")   return void close();
      if (act === "toggle_help") { _missionsHelpOpen = !_missionsHelpOpen; return void render(); }
      if (act === "back_to_offers") { _pendingStart = null; stopTick(); return void loadState({ force: true, reason: "back_to_offers" }); }
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
    if (_modal.style.display !== "none" && _modal.classList.contains("is-open")) {
      return true;
    }
    
    // ANALYTICS: gracz otworzył ekran misji
    track("missions_opened");

    _modal.style.display = "flex";
    _modal.classList.add("is-open");
    document.body.classList.add("missions-open");

    try {
      window.navRegister?.(_modal.id, {
        close,
        isOpen: () => !!_modal && _modal.style.display !== "none",
      });
    } catch (_) {}
    try { window.navOpen?.(_modal.id); } catch (_) {}

    renderLoading("Loading missions…");
    loadState({ reason: "open" });
    return true;
  }

  function close() {
    if (!_modal) return;

    _modal.classList.remove("is-open");
    _modal.style.display = "none";
    document.body.classList.remove("missions-open");

    stopTick();
    try { window.navClose?.(_modal.id); } catch (_) {}
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
    const subtitle = String(am.subtitle || "");
    const lore = String(am.lore || am.desc || "");
    const modifierLabel = String(am.modifierLabel || "");
    const rareHint = String(am.rareHint || "");
    const rewardIntent = Array.isArray(am.rewardIntent) ? am.rewardIntent : [];

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
        subtitle,
        lore,
        modifierLabel,
        rareHint,
        rewardIntent,
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
      return { status: remaining > 0 ? "RUNNING" : "READY", title, subtitle, lore, modifierLabel, rareHint, rewardIntent, remaining, total, pct, readyAt: am.readyAt || "", __raw: am };
    }

    if (status === "READY") {
      return { status: "READY", title, subtitle, lore, modifierLabel, rareHint, rewardIntent, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "", __raw: am };
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
      subtitle: _pendingStart.subtitle || "",
      lore: _pendingStart.lore || "",
      modifierLabel: _pendingStart.modifierLabel || "",
      rareHint: _pendingStart.rareHint || "",
      rewardIntent: Array.isArray(_pendingStart.rewardIntent) ? _pendingStart.rewardIntent : [],
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
      const msg = res.message || res.reason || res.error || "NOT_OK";
      const err = new Error(String(msg));
      err.data = res;
      throw err;
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

  function renderTags(parts = []) {
    const tags = parts
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    if (!tags.length) return "";
    return `<div class="m-tag-row">${tags.map((tag) => `<span class="m-tag">${esc(tag)}</span>`).join("")}</div>`;
  }

  function blueSignalHuntProgress(payload) {
    const raw = payload?.blueSignalHunt || payload?.blue_signal_hunt || payload?.lastResolve?.blueSignalHunt || null;
    return raw && typeof raw === "object" ? raw : null;
  }

  function renderBlueSignalHuntCard(progress) {
    if (!progress || typeof progress !== "object") return "";
    const eventEnabled = !!progress.eventEnabled;
    const fragments = Number(progress.fragments || 0);
    const frameRequirement = Number(progress.frameRequirement || 10);
    const fragmentCap = Number(progress.fragmentCap || 20);
    const frameClaimed = !!progress.frameClaimed;
    const canClaimFrame = !!progress.canClaimFrame;
    const body = textOrEmpty(progress.body) || "Fragments of a broken transmission are surfacing through missions and the Blood-Moon Tower. Collect 10 before the signal fades.";
    const safetyLine = textOrEmpty(progress.safetyLine) || "Cosmetic only. No combat power.";
    const title = textOrEmpty(progress.eventName) || "Blue Signal Hunt";
    const shouldShow = eventEnabled || fragments > 0 || frameClaimed;
    if (!shouldShow) return "";

    let cta = "";
    if (frameClaimed) {
      cta = `<button type="button" class="btn primary" data-act="open_frames">Open Frames</button>`;
    } else if (canClaimFrame) {
      cta = `<button type="button" class="btn primary" data-act="claim_blue_signal_frame">Claim Frame</button>`;
    } else if (eventEnabled) {
      cta = `<button type="button" class="btn" disabled>Need ${frameRequirement} Fragments</button>`;
    } else {
      cta = `<button type="button" class="btn" disabled>Signal inactive</button>`;
    }

    const progressText = `${fragments} / ${frameRequirement} fragments`;
    const subline = frameClaimed
      ? "Blue Signal Frame unlocked."
      : `Cap: ${fragmentCap} max fragments`;

    return `
      <div class="m-card" style="margin-top:10px;">
        <div class="m-row" style="align-items:flex-start; gap:12px;">
          <div style="min-width:0; flex:1;">
            <div class="m-title">${esc(title)}</div>
            <div class="m-muted" style="margin-top:6px;">${esc(body)}</div>
            <div class="m-tag-row" style="margin-top:10px;">
              <span class="m-tag">${esc(progressText)}</span>
              <span class="m-tag">${frameClaimed ? "Frame claimed" : "Frame reward: Blue Signal Frame"}</span>
            </div>
            <div class="m-muted" style="margin-top:8px;">${esc(subline)}</div>
            <div class="m-muted" style="margin-top:4px;">${esc(safetyLine)}</div>
          </div>
          <div style="display:flex; align-items:center; justify-content:flex-end;">
            ${cta}
          </div>
        </div>
      </div>
    `;
  }

  function renderHelpPanel() {
    if (!_missionsHelpOpen) return "";
    return `
      <div class="m-help">
        <div class="m-help-title">How Missions Work</div>
        <div class="m-help-copy">Pick a route. Each mission has a difficulty, reward focus and sometimes a special condition.</div>
        <div class="m-help-copy">Recommended stats: Stats like AGI / DEF show what helps on that route. They are not required, but they can improve the result.</div>
        <div class="m-help-copy">Mission completed = mission finished and rewards were resolved.</div>
        <div class="m-help-copy">Pet fit = how well your active pet matched recommended mission traits.</div>
        <div class="m-help-copy">Rare chance = possible rare outcome, not guaranteed.</div>
        <div class="m-help-copy">Bonus found = extra result actually recovered during resolve.</div>
        <div class="m-help-copy">Cache signal = route contained a cache trace, but not necessarily a bonus reward.</div>
        <div class="m-help-copy">Outcomes: Critical Success = best result. Success = normal clear. Partial Success = you recovered something, but missed part of the reward. Failed = the route held. Return stronger.</div>
      </div>
    `;
  }

  // =========================
  // Rendering
  // =========================
  function renderLoading(msg) {
    if (!_root) return;
    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";
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
    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";
    const safeTitle = "Mission signal unavailable. Try again.";
    const safeDetail = _dbg ? textOrEmpty(detail) : "";
    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-card">
          <div class="m-title">${esc(safeTitle)}</div>
          ${safeDetail ? `<div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(safeDetail)}</div>` : ""}
          <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn m-compact-btn" data-act="refresh">Retry</button>
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
    const subtitle = String(o?.subtitle || o?.archetype || "");
    const title = String(o?.title || o?.name || "");
    const lore = String(o?.lore || "");
    const desc  = String(o?.desc || "");
    const modifierLabel = normalizeModifierLabel(o?.modifierLabel);
    const rewardIntent = Array.isArray(o?.rewardIntent) ? o.rewardIntent.map((x) => String(x || "").trim()).filter(Boolean) : [];
    const rareHint = textOrEmpty(o?.rareHint);
    const body = lore || desc;

    const durSec = Number(o?.durationSec || o?.duration_sec || 0);
    const dur =
      o?.durationLabel ||
      (durSec ? `${Math.max(1, Math.round(durSec / 60))}m` : "") ||
      (o?.tierTime ? `${o.tierTime}` : "—");

    const reward = o?.reward || o?.rewardPreview || {};
    const xp = (reward.xp ?? o?.xp ?? "?");
    const bones = (reward.bones ?? o?.bones ?? "?");
    const rolls = (o?.lootRolls ?? o?.loot_rolls ?? reward.rolls ?? reward.loot_rolls ?? "?");
    const petMatchLabel = normalizePetMatchLabel(o);
    const compactHint = textOrEmpty(o?.compactHint) ||
      (petMatchLabel ? `Pet fit: ${petMatchLabel}` : "") ||
      (normalizeStatsText(o?.recommendedStatsText || o?.recommendedStatLabels || o?.recommendedStats)
        ? `Recommended: ${normalizeStatsText(o?.recommendedStatsText || o?.recommendedStatLabels || o?.recommendedStats)}`
        : "");

    const offerId = String(o?.offerId || o?.id || o?.offer_id || "");

    const hasActive = !!(active?.status && active.status !== "NONE");
    const disabled = hasActive ? "disabled" : "";
    const flavorTags = [];
    if (modifierLabel) flavorTags.push(modifierLabel);
    if (rewardIntent.length) flavorTags.push(`Reward intent: ${rewardIntent.join(" · ")}`);
    if (rareHint) flavorTags.push(`Rare chance: ${normalizeRareChanceLabel(rareHint)}`);

    return `
      <div class="m-offer">
        <div class="m-offer-main">
          <div class="m-offer-copy">
            <div class="m-offer-top">
              <span class="m-tag">${esc(label)}</span>
              <span class="m-tag">${esc(dur)}</span>
            </div>
            ${title ? `<div class="m-offer-title">${esc(title)}</div>` : ""}
            ${subtitle ? `<div class="m-kicker" style="margin-top:4px;">${esc(subtitle)}</div>` : ""}
            ${body ? `<div class="m-muted m-offer-body">${esc(body)}</div>` : ""}
            ${renderTags(flavorTags)}
            ${compactHint ? `<div class="m-offer-helper">${esc(compactHint)}</div>` : ""}
            <div class="m-offer-reward">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
            </div>
          </div>

          <div class="m-offer-cta">
            <button type="button" class="btn primary"
              data-act="start"
              data-tier="${esc(tier)}"
              data-offer="${esc(offerId)}"
              ${disabled}
            >Start</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderLast(last) {
    const result = String(last?.result || "");
    const victory = (result === "victory" || last?.victory) ? "✅ Victory" : "❌ Defeat";
    const ts = last?.ts ? new Date(Number(last.ts) * 1000).toLocaleString() : "";
    const title = String(last?.title || last?.name || "");
    const subtitle = String(last?.subtitle || "");
    const report = String(last?.report || "");
    const outcomeTier = String(last?.outcomeTier || last?.outcome_tier || ((result === "victory" || last?.victory) ? "Success" : "Failed"));
    const modifierLabel = String(last?.modifierLabel || "");
    const progressLine = String(last?.progressLine || "");
    const shortfallLine = String(last?.shortfallLine || "");
    const petLine = String(last?.activePetContribution || last?.petAssistLine || "");
    const recoveredRewards = Array.isArray(last?.recoveredRewards) ? last.recoveredRewards.map((x) => String(x || "").trim()).filter(Boolean) : [];
    const missedRewards = Array.isArray(last?.missedRewards) ? last.missedRewards.map((x) => String(x || "").trim()).filter(Boolean) : [];

    const rewardMsg = String(last?.rewardMsg || last?.reward_msg || "");
    const lootMsg = String(last?.lootMsg || last?.loot_msg || "");
    const tokenLootMsg = String(last?.tokenLootMsg || last?.token_loot_msg || "");

    return `
      <div class="m-card" style="margin-top:10px;">
        <div class="m-title">Last Resolve</div>
        ${subtitle ? `<div class="m-kicker" style="margin-top:8px;">${esc(subtitle)}</div>` : ""}
        ${title ? `<div class="m-title" style="margin-top:4px;">${esc(title)}</div>` : ""}
        <div class="m-muted" style="margin-top:8px;">
          ${esc(victory)} ${ts ? `· <b>${esc(ts)}</b>` : ""}
        </div>
        ${report ? `<div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(report)}</div>` : ""}
        ${outcomeTier ? `<div class="m-muted" style="margin-top:6px;"><b>${esc(outcomeTier)}</b>${modifierLabel ? ` · ${esc(modifierLabel)}` : ""}</div>` : ""}
        ${progressLine ? `<div class="m-muted" style="margin-top:6px;">${esc(progressLine)}</div>` : ""}
        ${shortfallLine ? `<div class="m-muted" style="margin-top:4px;">${esc(shortfallLine)}</div>` : ""}
        ${petLine ? `<div class="m-muted" style="margin-top:6px;">${esc(petLine)}</div>` : ""}
        ${recoveredRewards.length ? `<div class="m-muted" style="margin-top:8px;">Recovered: ${esc(recoveredRewards.join(" · "))}</div>` : ""}
        ${missedRewards.length ? `<div class="m-muted" style="margin-top:4px;">Missed: ${esc(missedRewards.join(" · "))}</div>` : ""}
        ${rewardMsg ? `<div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(rewardMsg)}</div>` : ""}
        ${lootMsg ? `<div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(lootMsg)}</div>` : ""}
        ${tokenLootMsg ? `<div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(tokenLootMsg)}</div>` : ""}
      </div>
    `;
  }

  function renderLast(last) {
    const ts = last?.ts ? new Date(Number(last.ts) * 1000).toLocaleString() : "";
    const title = textOrEmpty(last?.title || last?.name) || "Mission";
    const subtitle = textOrEmpty(last?.subtitle);
    const narrative = textOrEmpty(last?.narrativeLine || last?.report);
    const outcomeTier = normalizeOutcomeTier(last);
    const outcomeTone = normalizeOutcomeTone(outcomeTier);
    const modifierLabel = normalizeModifierLabel(last?.modifierLabel);
    const progressLine = normalizeProgressLine(last);
    const shortfallLine = normalizeShortfallLine(last);
    const petMatchLabel = normalizePetMatchLabel(last);
    const recommendedLine = normalizeRecommendedLine(last);
    const petFitEffect = normalizePetFitEffect(last);
    const recoveredRewards = normalizeRewardList(last?.recoveredRewards);
    const missedRewards = normalizeRewardList(last?.missedRewards);
    const rewardMsg = textOrEmpty(last?.rewardMsg || last?.reward_msg);
    const lootMsg = textOrEmpty(last?.lootMsg || last?.loot_msg);
    const tokenLootMsg = textOrEmpty(last?.tokenLootMsg || last?.token_loot_msg);
    const bonusFoundChip = normalizeBonusFoundChip(last);
    const cacheSignalChip = normalizeCacheSignalChip(last);
    const petArchetype = "";
    const rareHint = "";
    const rareHit = false;

    const metaBits = [];
    if (modifierLabel) metaBits.push(modifierLabel);
    if (ts) metaBits.push(ts);

    const chipLines = [];
    if (progressLine) chipLines.push(progressLine);
    if (shortfallLine && shortfallLine !== progressLine) chipLines.push(shortfallLine);
    if (petMatchLabel) chipLines.push(`Pet Match: ${petMatchLabel}${petArchetype ? ` · ${petArchetype} assist` : ""}`);
    if (rareHit) chipLines.push("Rare cache recovered");
    else if (rareHint) chipLines.push(`Rare: ${rareHint}`);

    const petDetailLines = [];
    if (petMatchLabel && recommendedLine) petDetailLines.push(recommendedLine);
    if (petMatchLabel && petFitEffect) petDetailLines.push(petFitEffect);

    if (outcomeTone === "success" || outcomeTone === "critical") chipLines.unshift("Mission completed");
    for (let i = 0; i < chipLines.length; i += 1) {
      if (/^Pet Match:/i.test(chipLines[i])) chipLines[i] = `Pet fit: ${petMatchLabel}`;
    }
    if (bonusFoundChip) chipLines.push(bonusFoundChip);
    else if (cacheSignalChip) chipLines.push(cacheSignalChip);

    chipLines.length = 0;
    if (outcomeTone === "success" || outcomeTone === "critical") chipLines.push("Mission completed");
    if (progressLine) chipLines.push(progressLine);
    if (shortfallLine && shortfallLine !== progressLine) chipLines.push(shortfallLine);
    if (petMatchLabel) chipLines.push(`Pet fit: ${petMatchLabel}`);
    if (bonusFoundChip) chipLines.push(bonusFoundChip);
    else if (cacheSignalChip) chipLines.push(cacheSignalChip);

    const fallbackRecovered = [];
    if (!recoveredRewards.length) {
      if (rewardMsg) fallbackRecovered.push(rewardMsg);
      if (lootMsg) fallbackRecovered.push(lootMsg);
      if (tokenLootMsg) fallbackRecovered.push(tokenLootMsg);
    }

    const showRecovered = recoveredRewards.length ? recoveredRewards : fallbackRecovered;
    const showMissed = missedRewards.filter((x) => {
      if (!x) return false;
      if ((bonusFoundChip || cacheSignalChip) && /cache/i.test(x)) return false;
      return true;
    });

    return `
      <div class="m-card m-report" style="margin-top:10px;">
        <div class="m-report-head">
          <div style="min-width:0;">
            <div class="m-title">Last Resolve</div>
            <div class="m-report-title" style="margin-top:8px;">${esc(title)}</div>
            ${(subtitle || metaBits.length) ? `<div class="m-report-sub">${esc([subtitle, ...metaBits].filter(Boolean).join(" · "))}</div>` : ""}
          </div>
          ${outcomeTier ? `<div class="m-outcome-badge" data-tone="${esc(outcomeTone)}">${esc(outcomeTier)}</div>` : ""}
        </div>
        ${narrative ? `<div class="m-report-line">${esc(narrative)}</div>` : ""}
        ${chipLines.length ? `<div class="m-report-chipline">${chipLines.map((chip) => `<span class="m-report-chip">${esc(chip)}</span>`).join("")}</div>` : ""}
        ${petDetailLines.length ? petDetailLines.map((line) => `<div class="m-report-line">${esc(line)}</div>`).join("") : ""}
        ${showRecovered.length ? `<div class="m-report-section"><div class="m-report-label">Recovered</div><div class="m-report-values">${esc(showRecovered.join(" · "))}</div></div>` : ""}
        ${showMissed.length ? `<div class="m-report-section"><div class="m-report-label">Missed</div><div class="m-report-values">${esc(showMissed.join(" · "))}</div></div>` : ""}
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
      subtitle: String(o?.subtitle || o?.archetype || ""),
      lore: String(o?.lore || o?.desc || ""),
      modifierLabel: String(o?.modifierLabel || ""),
      rewardIntent: Array.isArray(o?.rewardIntent) ? o.rewardIntent : [],
      rareHint: String(o?.rareHint || ""),
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
    const blueSignalHunt = blueSignalHuntProgress(payload);

    if (active.status && active.status !== "NONE") {
      // ✅ rare drop source order: pending.offer → active raw mission → payload (fallback)
      const rare =
        (active.__pending ? (_pendingStart?.rareDrop || null) : null) ||
        _extractRareDrop(active.__raw) ||
        _extractRareDrop(_primaryActive(payload)) ||
        null;
      const activeTags = [];
      if (active.modifierLabel) activeTags.push(active.modifierLabel);
      if (Array.isArray(active.rewardIntent) && active.rewardIntent.length) {
        activeTags.push(`Reward intent: ${active.rewardIntent.join(" · ")}`);
      }
      if (active.rareHint) activeTags.push(`Rare chance: ${normalizeRareChanceLabel(active.rareHint)}`);
      const activeMatchLabel = normalizePetMatchLabel(active);
      const activeHint = textOrEmpty(active.compactHint) || (activeMatchLabel ? `Pet fit: ${activeMatchLabel}` : "");

      _root.innerHTML = `
        <div class="m-stage m-stage-wait">
          <div class="m-wait-center">
            ${active.subtitle ? `<div class="m-kicker">${esc(active.subtitle)}</div>` : ""}
            <div class="m-title">${esc(active.title || "Mission")}</div>
            ${active.lore ? `<div class="m-muted" style="max-width:min(520px, 92%); margin-top:4px;">${esc(active.lore)}</div>` : ""}
            ${renderTags(activeTags)}
            ${activeHint ? `<div class="m-muted" style="max-width:min(520px, 92%); margin-top:6px;">${esc(activeHint)}</div>` : ""}
            <div id="mClock" class="m-clock">—</div>
            <div id="mClockSub" class="m-clock-sub">—</div>

            <div class="m-bar"><div id="mFill" class="m-bar-fill" style="width:0%"></div></div>

            ${rare ? renderRareDropCard(rare) : ""}
            ${renderBlueSignalHuntCard(blueSignalHunt)}

            <div class="m-actions">
              <button id="mResolveBtn" type="button" class="btn primary" data-act="resolve" style="display:none">Resolve</button>
              ${active.__pending ? `<button type="button" class="btn" data-act="back_to_offers">Back</button>` : ``}
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
    if (row) row.style.display = "none";

    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-shell-head">
          <div class="m-shell-top">
            <div class="m-title">Missions</div>
            <button type="button" class="btn m-compact-btn m-help-btn" data-act="toggle_help">?</button>
          </div>
          <div class="m-shell-sub">Pick a route. Start → Wait → Resolve.</div>
          <div class="m-inline-status">No active mission. Pick an offer to start.</div>
          ${renderHelpPanel()}
        </div>

        <div class="m-card">
          <div class="m-row">
            <div style="min-width:0;">
              <div class="m-title">Offers</div>
              <div class="m-muted" style="margin-top:4px;">Routes rotate with modifier, reward intent, and rare cache signals.</div>
            </div>
            <button type="button" class="btn m-compact-btn m-head-btn" data-act="refresh">Refresh</button>
          </div>

          <div class="m-hr"></div>

          <div>
            ${
              offers.length
                ? offers.map(o => renderOffer(o, realActive)).join("")
                : `<div class="m-muted">No offers yet. Refresh to scan for routes.</div>`
            }
          </div>
        </div>

        ${renderBlueSignalHuntCard(blueSignalHunt)}
        ${last ? renderLast(last) : `<div class="m-muted" style="margin-top:8px;">No recent report.</div>`}
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
  async function loadStateBase(options = {}) {
    const { force = false, reason = "auto" } = options || {};
    if (!force && _state && _stateLoadedAt && (Date.now() - _stateLoadedAt) < MISSIONS_STATE_STALE_MS) {
      log("skip missions/state; fresh cache", { reason, ageMs: Math.max(0, Date.now() - _stateLoadedAt) });
      render();
      return _state;
    }
    renderLoading("Loading missions…");
    try {
      const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
      _state = res;
      _stateLoadedAt = Date.now();

      // debug snapshots
      try {
        window.__AH_MISSIONS_RAW = res;
        window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
      } catch (_) {}

      const p = normalizePayload(_state);
      const a = p ? getActive(p) : { status: "NONE" };
      if (a.status && a.status !== "NONE") _pendingStart = null;

      render();
      return _state;
    } catch (e) {
      renderError("Missions backend error", String(e?.message || e || ""));
      return null;
    }
  }

  async function loadState(options = {}) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const out = await loadStateBase(options);
    window.__ahPerf?.log?.("Missions.loadState", perfT0, { ok: !!out });
    return out;
  }

  async function doRefresh() {
    try {
      const res = await api("/webapp/missions/action", { action: "refresh_offers", run_id: rid("m:refresh") });
      if (res && typeof res === "object") {
        _state = res;
        _stateLoadedAt = Date.now();
        try {
          window.__AH_MISSIONS_RAW = res;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
        } catch (_) {}
        render();
        if (res.message) {
          try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
          try { _tg?.showAlert?.(String(res.message)); } catch (_) {}
        }
        return;
      }
      await loadState({ force: true, reason: "refresh_fallback" });
    } catch (e) {
      const msg = String(e?.data?.message || e?.message || e || "Refresh failed");
      try { _tg?.HapticFeedback?.notificationOccurred?.("error"); } catch (_) {}
      try { _tg?.showAlert?.(msg); } catch (_) {}
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
      
      // optimistic wait immediately (prevents blink)
_optimisticStart(tier, offerId);

// ANALYTICS: rozpoczęcie misji (nie może psuć startu)
try {
  track("mission_started", {
    tier,
    offerId,
    title: String(_pendingStart?.title || tier || "Unknown Mission")
  });
} catch (err) {
  console.warn("[missions] track mission_started failed", err);
}

try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      // if backend returned state with active, great — but still poll to confirm
      if (startRes && typeof startRes === "object") {
        _state = startRes;
        _stateLoadedAt = Date.now();
        try {
          window.__AH_MISSIONS_RAW = startRes;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(startRes);
        } catch (_) {}
        render();
        if (startRes.message) {
          try { _tg?.showAlert?.(String(startRes.message)); } catch (_) {}
        }
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
        await loadState({ force: true, reason: "start_active" });
        return;
      }
      _pendingStart = null;
      renderError("Start failed", msg);
    }
  }

  async function doResolve() {
    try {
      const res = await api("/webapp/missions/action", { action: "resolve", run_id: rid("m:resolve") });
      
      // ANALYTICS: ukończenie misji
      track("mission_resolved", {
        success: true,
        title: _state?.active_mission?.title || _pendingStart?.title || "Mission"
      });
      
      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      _pendingStart = null;
      if (res && typeof res === "object") {
        _state = res;
        _stateLoadedAt = Date.now();
        try {
          window.__AH_MISSIONS_RAW = res;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
        } catch (_) {}
        render();
        return;
      }
      await loadState({ force: true, reason: "resolve_fallback" });
    } catch (e) {
      renderError("Resolve failed", String(e?.message || e || ""));
    }
  }

  async function doClaimBlueSignalFrame() {
    try {
      const res = await api("/webapp/blue-signal-hunt/claim", { run_id: rid("m:blue-signal-claim") });
      const progress = (res && (res.progress || res.blueSignalHunt || res.blue_signal_hunt)) || null;
      _state = { ...(_state || {}) };
      if (progress && typeof progress === "object") {
        _state.blueSignalHunt = progress;
      }
      _stateLoadedAt = Date.now();
      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      render();
    } catch (e) {
      const progress = e?.data?.progress;
      if (progress && typeof progress === "object") {
        _state = { ...(_state || {}), blueSignalHunt: progress };
        _stateLoadedAt = Date.now();
        render();
        return;
      }
      renderError("Claim failed", String(e?.message || e || ""));
    }
  }

  function openFrames() {
    if (!window.Frames?.open) return;
    close();
    setTimeout(() => {
      try { window.Frames.open(); } catch (_) {}
    }, 30);
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
