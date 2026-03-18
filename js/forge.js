// js/forge.js — Vault Forge Hub (Upgrade + Shards Craft) for Alpha Husky WebApp (v3.0 visual-only rework)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  function init({ apiPost, tg, dbg }) {
    _apiPost = apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
    _dbg = !!dbg;
  }

  async function post(path, payload) {
    if (_apiPost) return await _apiPost(path, payload || {});
    const API_BASE = window.API_BASE || "";
    const initData = (_tg && _tg.initData) || window.__INIT_DATA__ || "";
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData, ...(payload || {}) }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error((json && (json.reason || json.error)) || `HTTP_${res.status}`);
    if (json && json.ok === false) throw new Error(json.reason || "ERROR");
    return json;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));
  }

  function rid(prefix = "forge") {
    try { return `${prefix}:${crypto.randomUUID()}`; }
    catch { return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e9)}`; }
  }

  function pick(obj, path, fallback = undefined) {
    try {
      const parts = String(path).split(".");
      let cur = obj;
      for (const p of parts) {
        if (!cur) return fallback;
        cur = cur[p];
      }
      return (cur === undefined ? fallback : cur);
    } catch {
      return fallback;
    }
  }

  function _num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function _pct01(v, fallback01) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback01;
    if (n > 1.000001) return n / 100;
    return n;
  }

  function rarityKey(v) {
    const s = String(v || "").trim().toLowerCase();
    if (s === "legendary") return "legendary";
    if (s === "epic") return "epic";
    if (s === "uncommon") return "uncommon";
    return "common";
  }

  function rarityClass(v) {
    return `is-${rarityKey(v)}`;
  }

  function cap(s) {
    const v = String(s || "");
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : "";
  }

  function starsHtml(cur, max) {
    const c = Math.max(0, Number(cur || 0));
    const m = Math.max(c, Number(max || 0));
    let out = `<span class="ah-stars">`;
    for (let i = 0; i < m; i++) {
      out += `<span class="ah-star ${i < c ? "filled" : ""}">★</span>`;
    }
    out += `</span>`;
    return out;
  }

  function ensureStyles() {
    if (document.getElementById("ah-forge-styles")) return;
    const s = el("style");
    s.id = "ah-forge-styles";
    s.textContent = `
      :root{
        --ah-fg:#f4f6ff;
        --ah-dim:rgba(244,246,255,.72);
        --ah-soft:rgba(255,255,255,.08);
        --ah-soft-2:rgba(255,255,255,.12);
        --ah-panel:rgba(17,19,24,.92);
        --ah-panel-2:rgba(22,25,31,.92);
        --ah-amber:rgba(255,181,72,.95);
        --ah-cyan:rgba(74,199,255,.92);
        --ah-red:rgba(255,94,94,.95);
      }
      /* =========================
   PATCH 2 — VAULT FORGE OVERRIDES
   doklej na KONIEC ensureStyles()
   ========================= */

.ah-forge{
  background:
    radial-gradient(circle at 14% 0%, rgba(255,128,34,.16), transparent 23%),
    radial-gradient(circle at 86% 10%, rgba(83,199,255,.11), transparent 20%),
    linear-gradient(180deg, #0d0a08 0%, #16110d 48%, #0b0f14 100%);
  border:1px solid rgba(191,137,78,.42);
  box-shadow:
    0 -22px 60px rgba(0,0,0,.62),
    0 0 0 1px rgba(255,166,71,.05),
    inset 0 1px 0 rgba(255,255,255,.04),
    inset 0 0 90px rgba(255,132,0,.04);
}

.ah-forge::after{
  content:"";
  position:absolute; inset:0;
  pointer-events:none;
  background:
    linear-gradient(180deg, rgba(255,255,255,.02), transparent 22%),
    repeating-linear-gradient(
      90deg,
      transparent 0 72px,
      rgba(255,255,255,.012) 72px 73px
    );
  opacity:.42;
}

.ah-forge-head{
  background:
    linear-gradient(180deg, rgba(255,174,79,.06), rgba(255,255,255,0)),
    linear-gradient(90deg, rgba(38,27,20,.96), rgba(19,16,14,.96));
  border-bottom:1px solid rgba(212,175,55,.18);
}

.ah-forge-title{
  color:#ffd8a3;
  text-shadow:
    0 0 18px rgba(255,135,44,.18),
    0 0 34px rgba(0,0,0,.22);
}

.ah-forge-sub{ color:rgba(230,214,193,.76); }

.ah-forge-tab{
  border-color:rgba(138,96,55,.30);
  background:
    linear-gradient(180deg, rgba(49,36,27,.92), rgba(27,22,18,.94));
  color:#edd2af;
}

.ah-forge-tab.active{
  border-color:rgba(255,200,102,.42);
  background:
    linear-gradient(180deg, rgba(255,137,41,.28), rgba(114,63,24,.18)),
    rgba(31,24,20,.96);
  color:#fff5e2;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    0 0 0 1px rgba(255,171,72,.10),
    0 10px 28px rgba(255,122,24,.12);
}

.ah-note,
.ah-panel,
.ah-card,
.ah-result,
.ah-preview-card,
.ah-statbox{
  background:
    linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.018)),
    linear-gradient(180deg, rgba(42,30,22,.50), rgba(13,16,20,.45));
  border-color:rgba(138,103,67,.24);
}

.ah-card:hover{
  border-color:rgba(212,175,55,.26);
  box-shadow:
    0 8px 24px rgba(0,0,0,.20),
    0 0 22px rgba(255,140,33,.07);
}

.ah-card.selected{
  border-color:rgba(255,191,94,.40);
  background:
    linear-gradient(180deg, rgba(255,174,79,.10), rgba(255,255,255,.02)),
    linear-gradient(180deg, rgba(45,31,21,.62), rgba(13,16,20,.50));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.06),
    0 0 0 1px rgba(255,184,73,.10),
    0 12px 28px rgba(255,126,31,.13);
}

.ah-btn{
  border-color:rgba(185,152,117,.26);
  background:
    linear-gradient(180deg, rgba(58,42,30,.95), rgba(26,20,16,.95));
  color:#f6d3a6;
}

.ah-btn:hover:not(:disabled){
  border-color:rgba(255,209,126,.42);
}

.ah-btn.primary{
  background:
    linear-gradient(180deg, rgba(255,132,33,.95), rgba(177,74,18,.95));
  border-color:rgba(255,211,127,.40);
  color:#fff7eb;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.10),
    0 12px 26px rgba(255,98,0,.18);
}

.ah-btn.primary:hover:not(:disabled){
  filter:brightness(1.05);
  transform:translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.12),
    0 0 28px rgba(255,110,16,.26);
}

.ah-control{
  background:
    linear-gradient(180deg, rgba(31,25,20,.96), rgba(17,19,24,.96));
  border-color:rgba(166,125,83,.26);
  color:#f8e7cd;
}

.ah-control:focus{
  border-color:rgba(255,194,95,.36);
  box-shadow:0 0 0 3px rgba(255,184,73,.09), 0 0 22px rgba(255,124,19,.08);
}

.ah-preview-label,
.ah-statbox .k,
.ah-section-kicker{
  color:#ffcf90;
}

.ah-meter{
  background:rgba(255,255,255,.05);
  border-color:rgba(255,255,255,.06);
}

.ah-meter-fill{
  background:linear-gradient(90deg, rgba(255,121,20,.98), rgba(255,211,124,.98));
  box-shadow:0 0 16px rgba(255,160,52,.28);
}

.ah-tag{
  background:rgba(12,12,12,.30);
}

.ah-tag.is-uncommon{ border-color:rgba(104,255,173,.24); color:#c9ffe1; }
.ah-tag.is-epic{ border-color:rgba(197,133,255,.30); color:#ecd7ff; }
.ah-tag.is-legendary{
  border-color:rgba(255,192,86,.38);
  color:#ffe5b6;
  box-shadow:0 0 18px rgba(255,192,86,.10);
}

.ah-forge-hero{
  position:relative;
  overflow:hidden;
  padding:16px;
  border:1px solid rgba(255,184,73,.14);
  border-radius:20px;
  background:
    radial-gradient(circle at 18% 18%, rgba(255,139,42,.10), transparent 24%),
    radial-gradient(circle at 84% 14%, rgba(83,199,255,.08), transparent 20%),
    linear-gradient(180deg, rgba(39,29,22,.72), rgba(13,16,20,.52));
}

.ah-forge-hero::before{
  content:"";
  position:absolute; inset:0;
  pointer-events:none;
  background:
    linear-gradient(135deg, rgba(255,255,255,.03), transparent 35%),
    radial-gradient(circle at 78% 22%, rgba(255,255,255,.035), transparent 18%);
}

.ah-forge-halo{
  position:absolute;
  right:-20px; top:-20px;
  width:150px; height:150px; border-radius:999px;
  background:radial-gradient(circle, rgba(255,150,54,.16), transparent 60%);
  filter:blur(2px);
  pointer-events:none;
}

.ah-forge-rune{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:34px; height:34px;
  border-radius:999px;
  border:1px solid rgba(255,199,101,.24);
  background:rgba(255,134,34,.10);
  color:#ffd59b;
  font-weight:1000;
  font-size:15px;
  box-shadow:0 0 16px rgba(255,134,34,.10);
}

.ah-forge-hero-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  margin-bottom:14px;
}

.ah-forge-hero-copy{
  min-width:0;
  flex:1;
}

.ah-outcome-strip{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin-top:10px;
}

.ah-outcome-pill{
  padding:7px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.09);
  background:rgba(255,255,255,.04);
  font-size:11px;
  font-weight:1000;
  letter-spacing:.04em;
  text-transform:uppercase;
}

.ah-result-cine{
  position:relative;
  overflow:hidden;
  min-height:82px;
  border-radius:18px;
}

.ah-result-cine::before{
  content:"";
  position:absolute; inset:0;
  pointer-events:none;
  background:
    linear-gradient(135deg, rgba(255,255,255,.04), transparent 38%),
    radial-gradient(circle at 82% 18%, rgba(255,196,102,.06), transparent 18%);
}

.ah-result-ribbon{
  position:absolute;
  top:10px; right:10px;
  padding:4px 8px;
  border-radius:999px;
  font-size:10px;
  font-weight:1000;
  letter-spacing:.08em;
  text-transform:uppercase;
  border:1px solid rgba(255,255,255,.10);
  background:rgba(0,0,0,.25);
  color:#ffd8a3;
}

.ah-result-cine.is-uncommon .ah-result-ribbon{
  border-color:rgba(104,255,173,.24);
  color:#c9ffe1;
}
.ah-result-cine.is-epic .ah-result-ribbon{
  border-color:rgba(197,133,255,.28);
  color:#ecd7ff;
}
.ah-result-cine.is-legendary .ah-result-ribbon{
  border-color:rgba(255,192,86,.35);
  color:#ffe5b6;
  box-shadow:0 0 16px rgba(255,192,86,.12);
}

.ah-detail-ico{
  position:relative;
}

.ah-detail-ico.is-legendary::after{
  content:"";
  position:absolute; inset:-8px;
  border-radius:24px;
  border:1px solid rgba(255,201,104,.14);
  pointer-events:none;
}

.ah-loreline{
  color:rgba(233,214,190,.72);
}

      .ah-forge-backdrop{
        position:fixed; inset:0; z-index:2147483640;
        display:flex; align-items:flex-end; justify-content:center;
        background:
          radial-gradient(circle at 50% 100%, rgba(255,160,40,.07), transparent 30%),
          radial-gradient(circle at 50% 0%, rgba(60,160,255,.06), transparent 26%),
          rgba(0,0,0,.72);
        backdrop-filter: blur(4px);
      }

      .ah-forge{
        position:relative;
        width:min(1120px,100%);
        max-height:92vh;
        color:var(--ah-fg);
        background:
          linear-gradient(180deg, rgba(36,40,47,.98), rgba(13,15,18,.985)),
          rgba(14,16,18,.98);
        border:1px solid rgba(255,255,255,.10);
        border-radius:22px 22px 0 0;
        overflow:hidden;
        box-shadow:
          0 -14px 44px rgba(0,0,0,.58),
          inset 0 1px 0 rgba(255,255,255,.05);
      }

      .ah-forge::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        background:
          radial-gradient(circle at 15% 0%, rgba(255,181,72,.10), transparent 20%),
          radial-gradient(circle at 85% 10%, rgba(74,199,255,.08), transparent 18%);
        opacity:.95;
      }

      .ah-forge *{color:inherit; box-sizing:border-box;}

      .ah-forge-head{
        position:relative;
        display:flex; align-items:center; justify-content:space-between; gap:12px;
        padding:16px 16px 14px;
        border-bottom:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
      }

      .ah-head-left{display:flex; flex-direction:column; gap:4px; min-width:0}
      .ah-forge-eyebrow{
        display:flex; align-items:center; gap:8px; flex-wrap:wrap;
        font-size:11px; font-weight:900; letter-spacing:.12em; text-transform:uppercase;
        color:rgba(255,214,145,.94);
      }
      .ah-forge-eyebrow .dot{
        width:6px; height:6px; border-radius:999px; background:var(--ah-amber);
        box-shadow:0 0 12px rgba(255,181,72,.75);
      }

      .ah-forge-title{
        font-size:clamp(26px, 4.3vw, 34px);
        font-weight:1000;
        letter-spacing:.2px;
        line-height:1.02;
        text-shadow:0 0 24px rgba(0,0,0,.35);
      }

      .ah-forge-sub{
        opacity:.82;
        font-size:12px;
        line-height:1.35;
      }

      .ah-forge-close{
        appearance:none; border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.05);
        min-width:42px; height:42px; border-radius:14px;
        font-size:20px; font-weight:900; cursor:pointer;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
      }

      .ah-forge-tabs{
        display:flex; gap:10px; padding:12px 16px;
        border-bottom:1px solid rgba(255,255,255,.06);
        background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
      }

      .ah-forge-tab{
        appearance:none; cursor:pointer;
        padding:10px 14px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
        font-weight:1000; letter-spacing:.03em;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
      }

      .ah-forge-tab.active{
        border-color:rgba(255,196,92,.35);
        background:
          linear-gradient(180deg, rgba(255,188,84,.20), rgba(255,146,39,.08)),
          rgba(255,255,255,.08);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.08),
          0 0 0 1px rgba(255,181,72,.08),
          0 8px 24px rgba(255,125,24,.10);
      }

      .ah-forge-body{
        position:relative;
        padding:14px 14px 18px;
        overflow:auto;
        max-height:calc(92vh - 146px);
      }

      .ah-forge-bal{
        display:grid;
        grid-template-columns:repeat(3, minmax(0, 1fr));
        gap:10px;
        margin-bottom:14px;
      }

      @media(max-width:760px){
        .ah-forge-bal{grid-template-columns:1fr 1fr 1fr}
      }

      @media(max-width:560px){
        .ah-forge-bal{grid-template-columns:1fr}
      }

      .ah-pill{
        padding:10px 12px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.10);
        background:
          linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)),
          rgba(255,255,255,.04);
        font-weight:900;
        font-size:13px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      }

      .ah-note,
      .ah-panel{
        border:1px solid rgba(255,255,255,.11);
        border-radius:18px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.02)),
          rgba(255,255,255,.03);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.04),
          0 10px 26px rgba(0,0,0,.16);
      }

      .ah-note{padding:14px}
      .ah-panel{padding:14px}

      .ah-panel + .ah-panel,
      .ah-note + .ah-note{margin-top:12px}

      .ah-section-kicker{
        font-size:11px;
        text-transform:uppercase;
        letter-spacing:.12em;
        font-weight:1000;
        color:rgba(255,211,135,.93);
        margin-bottom:6px;
      }

      .ah-section-title{
        font-size:22px;
        line-height:1.1;
        font-weight:1000;
        margin-bottom:6px;
      }

      .ah-section-copy{
        font-size:13px;
        color:var(--ah-dim);
        line-height:1.45;
      }

      .ah-small{opacity:.88; font-size:12px; line-height:1.4}
      .ah-muted{opacity:.68}
      .ah-divider{height:1px; background:rgba(255,255,255,.10); margin:12px 0}

      .ah-split{
        display:grid;
        grid-template-columns:1fr;
        gap:12px;
      }
      @media(min-width:920px){
        .ah-split{grid-template-columns:1.02fr .98fr}
      }

      .ah-list{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }

      .ah-card{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:12px;
        border:1px solid rgba(255,255,255,.12);
        background:
          linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.025)),
          rgba(255,255,255,.03);
        border-radius:18px;
        cursor:pointer;
        transition:transform .14s ease, border-color .14s ease, background .14s ease, box-shadow .14s ease;
      }

      .ah-card:hover{
        transform:translateY(-1px);
        border-color:rgba(255,255,255,.18);
        background:
          linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.03)),
          rgba(255,255,255,.04);
      }

      .ah-card.selected{
        border-color:rgba(255,191,88,.34);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.05),
          0 0 0 1px rgba(255,181,72,.08),
          0 8px 22px rgba(255,143,32,.10);
      }

      .ah-left{
        display:flex; align-items:center; gap:12px; min-width:0;
      }

      .ah-ico{
        position:relative;
        width:54px; height:54px; border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(0,0,0,.28);
        overflow:hidden; flex:0 0 auto;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.03);
      }

      .ah-ico img{
        width:100%; height:100%; object-fit:cover; display:block;
      }

      .ah-meta{display:flex; flex-direction:column; gap:4px; min-width:0}
      .ah-meta b,.ah-line{
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      }

      .ah-slotline{
        display:flex; align-items:center; gap:8px; min-width:0;
        font-size:18px; font-weight:900;
      }

      .ah-subline{
        display:flex; align-items:center; gap:8px; flex-wrap:wrap;
        font-size:12px; color:var(--ah-dim);
      }

      .ah-tag{
        display:inline-flex; align-items:center; justify-content:center;
        min-height:24px;
        padding:3px 9px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(0,0,0,.25);
        font-size:11px; font-weight:1000;
        text-transform:uppercase;
        letter-spacing:.06em;
      }

      .ah-tag.is-common{border-color:rgba(255,255,255,.11)}
      .ah-tag.is-uncommon{border-color:rgba(104,255,173,.24); color:#c9ffe1}
      .ah-tag.is-epic{border-color:rgba(197,133,255,.28); color:#ecd7ff}
      .ah-tag.is-legendary{border-color:rgba(255,192,86,.35); color:#ffe5b6}

      .ah-btn{
        appearance:none; cursor:pointer;
        padding:10px 12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.12);
        background:
          linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)),
          rgba(255,255,255,.04);
        font-weight:1000;
        letter-spacing:.02em;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
      }

      .ah-btn.primary{
        border-color:rgba(255,190,86,.34);
        background:
          linear-gradient(180deg, rgba(255,189,84,.26), rgba(255,117,24,.08)),
          rgba(255,255,255,.06);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.07),
          0 10px 24px rgba(255,126,31,.12);
      }

      .ah-btn.subtle{
        background:rgba(255,255,255,.035);
      }

      .ah-btn:disabled{
        opacity:.45;
        cursor:default;
        filter:saturate(.75);
      }

      .ah-btnrow{
        display:flex; gap:8px; flex-wrap:wrap;
      }

      .ah-field{
        display:grid;
        grid-template-columns:120px minmax(0,1fr);
        gap:12px;
        align-items:center;
        padding:12px;
        border:1px solid rgba(255,255,255,.11);
        background:
          linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.02)),
          rgba(255,255,255,.025);
        border-radius:18px;
      }

      @media(max-width:560px){
        .ah-field{grid-template-columns:1fr}
      }

      .ah-field label{
        font-weight:1000;
        font-size:14px;
        letter-spacing:.01em;
      }

      .ah-field .ah-field-copy{
        font-size:11px;
        color:var(--ah-dim);
        margin-top:3px;
      }

      .ah-control{
        width:100%;
        min-width:0;
        padding:12px 12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.14);
        background:
          linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.03)),
          rgba(255,255,255,.05);
        font-weight:900;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      }

      .ah-control:focus{
        outline:none;
        border-color:rgba(255,190,86,.32);
        box-shadow:0 0 0 3px rgba(255,184,73,.08);
      }

      .ah-stepper{
        display:grid;
        grid-template-columns:auto 1fr auto;
        gap:8px;
        align-items:center;
      }

      .ah-stepper .ah-btn{
        min-width:42px;
        height:42px;
        padding:0;
      }

      .ah-quick{
        display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;
      }

      .ah-preview-grid{
        display:grid; grid-template-columns:1fr; gap:10px;
      }

      @media(min-width:620px){
        .ah-preview-grid{grid-template-columns:1fr 1fr}
      }

      .ah-preview-card{
        padding:12px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:16px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.02)),
          rgba(255,255,255,.025);
      }

      .ah-preview-label{
        font-size:11px;
        text-transform:uppercase;
        letter-spacing:.10em;
        font-weight:1000;
        color:rgba(255,214,145,.94);
        margin-bottom:6px;
      }

      .ah-preview-value{
        font-size:16px;
        line-height:1.25;
        font-weight:1000;
      }

      .ah-preview-sub{
        font-size:12px;
        color:var(--ah-dim);
        line-height:1.45;
        margin-top:4px;
      }

      .ah-meter-wrap{margin-top:10px}
      .ah-meter-top{
        display:flex; align-items:center; justify-content:space-between; gap:8px;
        font-size:12px; margin-bottom:6px;
      }

      .ah-meter{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.08);
      }

      .ah-meter-fill{
        height:100%;
        width:0%;
        border-radius:999px;
        background:linear-gradient(90deg, rgba(255,163,55,.95), rgba(255,211,130,.95));
        box-shadow:0 0 16px rgba(255,181,72,.30);
      }

      .ah-results{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }

      @media(min-width:560px){
        .ah-results{grid-template-columns:1fr 1fr}
      }

      .ah-result{
        display:flex;
        align-items:center;
        gap:10px;
        padding:12px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.10);
        background:
          linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.02)),
          rgba(255,255,255,.025);
      }

      .ah-results-empty{
        padding:12px;
        border-radius:16px;
        border:1px dashed rgba(255,255,255,.12);
        color:var(--ah-dim);
        font-size:13px;
      }

      .ah-detail-hero{
        display:flex; align-items:center; gap:12px; min-width:0;
      }

      .ah-detail-ico{
        width:72px; height:72px; border-radius:18px;
        border:1px solid rgba(255,255,255,.10);
        overflow:hidden; flex:0 0 auto;
        background:rgba(0,0,0,.25);
      }

      .ah-detail-ico img{width:100%; height:100%; object-fit:cover; display:block;}
      .ah-detail-meta{min-width:0}
      .ah-detail-name{
        font-size:22px; font-weight:1000; line-height:1.08;
      }
      .ah-detail-slot{
        margin-top:4px;
        display:flex; gap:8px; flex-wrap:wrap; align-items:center;
        font-size:12px; color:var(--ah-dim);
      }

      .ah-detail-grid{
        display:grid; grid-template-columns:1fr; gap:10px; margin-top:12px;
      }
      @media(min-width:620px){
        .ah-detail-grid{grid-template-columns:1fr 1fr}
      }

      .ah-statbox{
        padding:12px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.10);
        background:
          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02)),
          rgba(255,255,255,.02);
      }

      .ah-statbox .k{
        font-size:11px;
        text-transform:uppercase;
        letter-spacing:.10em;
        font-weight:1000;
        color:rgba(255,214,145,.94);
        margin-bottom:6px;
      }

      .ah-statbox .v{
        font-size:16px;
        font-weight:1000;
        line-height:1.3;
      }

      .ah-missing{
        margin-top:8px;
        padding:10px 12px;
        border-radius:14px;
        border:1px solid rgba(255,120,120,.18);
        background:rgba(255,75,75,.08);
        color:#ffd4d4;
        font-size:12px;
      }

      .ah-stars{
        display:inline-flex; gap:2px; flex-wrap:wrap;
      }

      .ah-star{
        font-size:13px;
        opacity:.28;
      }

      .ah-star.filled{
        opacity:1;
        color:#ffd47f;
        text-shadow:0 0 10px rgba(255,192,76,.25);
      }

      .ah-toast{
        position:fixed; left:50%; transform:translateX(-50%);
        bottom:16px; z-index:2147483641;
        max-width:min(560px,92vw);
        padding:10px 12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.82);
        box-shadow:0 10px 28px rgba(0,0,0,.28);
      }

      .ah-loreline{
        margin-top:8px;
        padding-top:8px;
        border-top:1px solid rgba(255,255,255,.08);
        font-size:12px;
        color:var(--ah-dim);
      }

      .ah-card.is-common .ah-ico,
      .ah-result.is-common .ah-ico,
      .ah-detail-ico.is-common{
        box-shadow:0 0 0 1px rgba(255,255,255,.04);
      }

      .ah-card.is-uncommon .ah-ico,
      .ah-result.is-uncommon .ah-ico,
      .ah-detail-ico.is-uncommon{
        box-shadow:0 0 0 1px rgba(104,255,173,.10), 0 0 18px rgba(104,255,173,.07);
      }

      .ah-card.is-epic .ah-ico,
      .ah-result.is-epic .ah-ico,
      .ah-detail-ico.is-epic{
        box-shadow:0 0 0 1px rgba(197,133,255,.12), 0 0 18px rgba(197,133,255,.08);
      }

      .ah-card.is-legendary .ah-ico,
      .ah-result.is-legendary .ah-ico,
      .ah-detail-ico.is-legendary{
        box-shadow:0 0 0 1px rgba(255,193,86,.14), 0 0 20px rgba(255,193,86,.10);
      }

      #forge-error{
        margin-top:12px;
      }
    `;
    document.head.appendChild(s);
  }

  function toast(msg) {
    const t = el("div", "ah-toast", msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
    document.body.style.touchAction = lock ? "none" : "";
  }

  let _root = null;
  let _tab = "upgrade";
  let _state = null;
  let _busy = false;
  let _ctx = { buildingId: null, name: "Forgotten Tokens’ Vault" };

  let _pityOverride = {};
  let _lastCraft = { slot: null, made: [], spent: null, echo: null };
  let _selectedUpgradeKey = null;

  function getCfg() {
    const cfg = (_state && _state.craftCfg) || {};
    const weights = cfg.weights || {};

    const baseCost = _num(cfg.baseCost ?? cfg.baseShardCost, 5);
    const refineCost = _num(cfg.refineCost ?? cfg.refineAdd, 2);
    const pityTrigger = _num(cfg.pityTrigger ?? cfg.pity ?? cfg.pityN, 5);

    let uncommonBase = cfg.uncommonBase ?? cfg.baseUncommon;
    if (uncommonBase == null) {
      const wc = _num(weights.common, 80);
      const wu = _num(weights.uncommon, 20);
      const total = wc + wu;
      uncommonBase = total > 0 ? (wu / total) : 0.20;
    }
    uncommonBase = _pct01(uncommonBase, 0.20);

    let uncommonRefineAdd = cfg.uncommonRefineAdd ?? cfg.refineUncommonAdd;
    if (uncommonRefineAdd == null) uncommonRefineAdd = 0.05;
    uncommonRefineAdd = _pct01(uncommonRefineAdd, 0.05);

    let uncommonCap = cfg.uncommonCap;
    uncommonCap = _pct01(uncommonCap, 0.55);

    const pEpic = _pct01(cfg.pEpic ?? cfg.epicBase ?? 0, 0);
    const pLegendary = _pct01(cfg.pLegendary ?? cfg.legendaryBase ?? 0, 0);

    return {
      baseCost,
      refineCost,
      pity: pityTrigger,
      uncommonBase,
      uncommonRefineAdd,
      uncommonCap,
      pEpic,
      pLegendary,
    };
  }

  function shardsHave(slot) {
    const map = (_state && _state.shards) || {};
    return map[`${slot}_shards`] ?? 0;
  }

  function mats() {
    return (_state && _state.balances) || {};
  }

  function fmtCost(cost) {
    const c = cost || {};
    return `Bones ${c.bones || 0} · Scrap ${c.scrap || 0} · Dust ${c.rune_dust || 0}`;
  }

  function missingForCost(cost) {
    const b = mats();
    const c = cost || {};
    const miss = {
      bones: Math.max(0, (c.bones || 0) - (b.bones || 0)),
      scrap: Math.max(0, (c.scrap || 0) - (b.scrap || 0)),
      rune_dust: Math.max(0, (c.rune_dust || 0) - (b.rune_dust || 0)),
    };
    const parts = [];
    if (miss.bones) parts.push(`${miss.bones} Bones`);
    if (miss.scrap) parts.push(`${miss.scrap} Scrap`);
    if (miss.rune_dust) parts.push(`${miss.rune_dust} Dust`);
    return parts;
  }

  function renderBalances(container) {
    const b = mats();
    const wrap = el("div", "ah-forge-bal");
    [
      ["Bones", b.bones],
      ["Scrap", b.scrap],
      ["Rune Dust", b.rune_dust],
    ].forEach(([k, v]) => {
      if (v == null) return;
      wrap.appendChild(el("div", "ah-pill", `<span class="ah-muted">${esc(k)}:</span> ${esc(v)}`));
    });
    container.appendChild(wrap);
  }

  function renderUpgrade(body) {
    const eq = (_state && _state.equipped) || [];
    if (!eq.length) {
      body.appendChild(el("div", "ah-note",
        `<div class="ah-section-kicker">Forge Bench</div>
         <div class="ah-section-title">No equipped items found</div>
         <div class="ah-section-copy">Equip a piece of gear first, then return to the vault forge to inspect upgrade costs and push its next star.</div>`
      ));
      return;
    }

    if (!_selectedUpgradeKey || !eq.some((x) => x.key === _selectedUpgradeKey)) {
      _selectedUpgradeKey = eq[0].key;
    }

    body.appendChild(el("div", "ah-note",
      `<div class="ah-section-kicker">Forgotten Tokens’ Vault</div>
       <div class="ah-section-title">Upgrade Bench</div>
       <div class="ah-section-copy">Inspect one equipped item at a time, review the exact material cost, then push its next star without touching the Telegram-side core logic.</div>
       <div class="ah-loreline">This station is for focused forging — one item, one decision, one clean upgrade.</div>`
    ));

    const split = el("div", "ah-split");
    const listPanel = el("div", "ah-panel");
    const detailPanel = el("div", "ah-panel");

    listPanel.appendChild(el("div", "", `
      <div class="ah-section-kicker">Equipped Loadout</div>
      <div class="ah-section-title">Choose a piece to forge</div>
      <div class="ah-section-copy">Each row below uses the same upgrade rules as Telegram. This pass changes only presentation, not math.</div>
    `));

    const list = el("div", "ah-list");

    async function doUpgrade(it) {
      if (!it || _busy || !it.canUpgrade) return;
      _busy = true;
      draw();

      try {
        await post("/webapp/forge/upgrade", {
          buildingId: _ctx.buildingId,
          slot: it.slot,
          run_id: rid("web_upg"),
        });
        await loadState();
        toast(`Upgraded ${it.slotLabel}.`);
      } catch (e) {
        toast(`Upgrade failed: ${e.message}`);
      } finally {
        _busy = false;
        draw();
      }
    }

    function drawDetail(it) {
      if (!it) {
        detailPanel.innerHTML = `
          <div class="ah-section-kicker">Inspection</div>
          <div class="ah-section-title">Select an item</div>
          <div class="ah-section-copy">Tap any equipped piece on the left to open its forge preview.</div>
        `;
        return;
      }

      const cost = it.costNext || null;
      const miss = cost ? missingForCost(cost) : [];
      const isMaxed = Number(it.stars || 0) >= Number(it.maxStars || 0);
      const rKey = rarityKey(it.rarity);

      detailPanel.className = `ah-panel ${rarityClass(rKey)}`;
      detailPanel.innerHTML = `
        <div class="ah-section-kicker">Inspection</div>
        <div class="ah-detail-hero">
          <div class="ah-detail-ico ${rarityClass(rKey)}" id="ah-detail-ico"></div>
          <div class="ah-detail-meta">
            <div class="ah-detail-name">${esc(it.name || it.slotLabel || "Item")}</div>
            <div class="ah-detail-slot">
              <span>${esc(it.slotLabel || it.slot || "slot")}</span>
              <span class="ah-tag ${rarityClass(rKey)}">${esc(it.rarity || "common")}</span>
            </div>
          </div>
        </div>

        <div class="ah-detail-grid">
          <div class="ah-statbox">
            <div class="k">Current Rank</div>
            <div class="v">${starsHtml(it.stars, it.maxStars)}<div class="ah-small" style="margin-top:6px">★${Number(it.stars || 0)} / ★${Number(it.maxStars || 0)}</div></div>
          </div>
          <div class="ah-statbox">
            <div class="k">Forge Cost</div>
            <div class="v">${cost ? esc(fmtCost(cost)) : "No further upgrades"}</div>
          </div>
        </div>

        ${miss.length ? `<div class="ah-missing"><b>Missing:</b> ${esc(miss.join(", "))}</div>` : ``}

        <div class="ah-divider"></div>

        <div class="ah-btnrow" id="ah-upg-actions"></div>

        <div class="ah-loreline">
          Upgrade cost scales with ★. Mechanically this still uses the same core as Telegram — only the vault presentation changed.
        </div>
      `;

      const icoMount = detailPanel.querySelector("#ah-detail-ico");
      if (icoMount) {
        const img = document.createElement("img");
        img.alt = it.name || it.key || "item";
        img.src = it.icon || "";
        img.onerror = () => {
          img.remove();
          icoMount.textContent = "✦";
          icoMount.style.display = "grid";
          icoMount.style.placeItems = "center";
          icoMount.style.fontWeight = "1000";
          icoMount.style.fontSize = "24px";
        };
        icoMount.appendChild(img);
      }

      const actions = detailPanel.querySelector("#ah-upg-actions");
      const btn = el("button", `ah-btn primary ${isMaxed ? "" : ""}`,
        isMaxed ? "Item Maxed" : (it.canUpgrade ? "Forge Upgrade" : "Missing Materials")
      );
      btn.type = "button";
      btn.disabled = _busy || isMaxed || !it.canUpgrade;
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        doUpgrade(it);
      });

      const secondary = el("button", "ah-btn subtle", "Refresh State");
      secondary.type = "button";
      secondary.disabled = _busy;
      secondary.addEventListener("click", async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (_busy) return;
        _busy = true;
        draw();
        try {
          await loadState();
          toast("Forge state refreshed.");
        } catch (e) {
          toast(`Refresh failed: ${e.message}`);
        } finally {
          _busy = false;
          draw();
        }
      });

      actions.appendChild(btn);
      actions.appendChild(secondary);
    }

    eq.forEach((it) => {
      const rKey = rarityKey(it.rarity);
      const row = el("div", `ah-card ${rarityClass(rKey)} ${_selectedUpgradeKey === it.key ? "selected" : ""}`);
      const left = el("div", "ah-left");

      const ico = el("div", `ah-ico ${rarityClass(rKey)}`);
      const img = document.createElement("img");
      img.alt = it.name || it.key || "item";
      img.src = it.icon || "";
      img.onerror = () => { img.remove(); ico.textContent = "✦"; };
      ico.appendChild(img);

      const meta = el("div", "ah-meta");
      meta.appendChild(el("div", "ah-slotline", `<span>${esc(it.slotLabel || cap(it.slot) || "Item")}</span>`));
      meta.appendChild(el("div", "ah-line", `${esc(it.name || "—")}`));
      meta.appendChild(el("div", "ah-subline",
        `${starsHtml(it.stars, it.maxStars)}
         <span class="ah-tag ${rarityClass(rKey)}">${esc(it.rarity || "common")}</span>`
      ));
      if (it.costNext) {
        meta.appendChild(el("div", "ah-small", `Next: ${esc(fmtCost(it.costNext))}`));
      }

      left.appendChild(ico);
      left.appendChild(meta);
      row.appendChild(left);

      const btn = el("button", `ah-btn ${it.canUpgrade ? "primary" : "subtle"}`, it.canUpgrade ? "Upgrade" : "Maxed");
      btn.type = "button";
      btn.disabled = _busy || !it.canUpgrade;

      row.addEventListener("click", () => {
        _selectedUpgradeKey = it.key;
        draw();
        if (window.innerWidth < 920) {
          const target = _root && _root.querySelector(".ah-split");
          const detail = target && target.lastElementChild;
          if (detail) detail.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        _selectedUpgradeKey = it.key;
        doUpgrade(it);
      });

      row.appendChild(btn);
      list.appendChild(row);
    });

    listPanel.appendChild(el("div", "ah-divider", ""));
    listPanel.appendChild(list);

    const selected = eq.find((x) => x.key === _selectedUpgradeKey) || eq[0];
    drawDetail(selected);

    if (window.innerWidth < 920) {
      split.appendChild(detailPanel);
      split.appendChild(listPanel);
    } else {
      split.appendChild(listPanel);
      split.appendChild(detailPanel);
    }

    body.appendChild(split);
  }

  function renderCraft(body) {
    const cfg = getCfg();
    const shardSlots = (_state && _state.shardSlots) || [
      "weapon", "armor", "fangs", "cloak", "collar", "helmet", "ring", "offhand", "gloves"
    ];

    const pools = pick(_state, "rollCfg.pools", null);
    const poolsLine = pools
      ? `Pools: C ${pools.common || 0} / U ${pools.uncommon || 0} / E ${pools.epic || 0} / L ${pools.legendary || 0}`
      : "Slot pool data not exposed.";

    const basePlus = Math.min(1, (cfg.uncommonBase || 0) + (cfg.pEpic || 0) + (cfg.pLegendary || 0));

    body.appendChild(el("div", "ah-note",
      `<div class="ah-section-kicker">Shard Forge</div>
       <div class="ah-section-title">Token-infused crafting</div>
       <div class="ah-section-copy">
         Spend slot shards to roll gear from that slot’s pool. Refine increases shard cost per pull and can improve your uncommon+ odds. Epic and Legendary only roll if that slot actually has items in those rarities.
       </div>
       <div class="ah-loreline">
         Base cost <b>${cfg.baseCost}</b> · Refine adds <b>${cfg.refineCost}</b>/lvl · Uncommon+ base <b>${Math.round(basePlus * 100)}%</b> · Pity <b>${cfg.pity}</b> · ${esc(poolsLine)}
       </div>`
    ));

    const form = el("div", "ah-split");
    const controls = el("div", "ah-panel");
    const results = el("div", "ah-panel");

    controls.appendChild(el("div", "", `
      <div class="ah-section-kicker">Forge Controls</div>
      <div class="ah-section-title">Shape the pull</div>
      <div class="ah-section-copy">Choose the slot, how many pulls to consume, and how much refine pressure to add before the vault spends shards.</div>
    `));

    function currentPity(slot) {
      const fromState = _state && _state.pityMap && _state.pityMap[slot];
      if (fromState != null) return fromState;
      const fromOverride = _pityOverride && _pityOverride[slot];
      return (fromOverride != null ? fromOverride : null);
    }

    function makeField(label, copy) {
      const wrap = el("div", "ah-field");
      const left = el("div", "", `<label>${esc(label)}</label>${copy ? `<div class="ah-field-copy">${copy}</div>` : ""}`);
      const right = el("div", "");
      wrap.appendChild(left);
      wrap.appendChild(right);
      return { wrap, right };
    }

    const slotField = makeField("Slot", "Craft consumes <b>{slot}_shards</b> from the chosen category.");
    const sel = document.createElement("select");
    sel.className = "ah-control";

    function refreshSlotLabels() {
      Array.from(sel.options).forEach((opt) => {
        const s = opt.value;
        opt.textContent = `${cap(s)} (${shardsHave(s)})`;
      });
    }

    shardSlots.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = `${cap(s)} (${shardsHave(s)})`;
      sel.appendChild(opt);
    });
    slotField.right.appendChild(sel);

    const countField = makeField("Count", "How many pulls to execute in one batch.");
    const countWrap = el("div", "ah-stepper");
    const countMinus = el("button", "ah-btn subtle", "−");
    countMinus.type = "button";
    const inpCount = document.createElement("input");
    inpCount.type = "number";
    inpCount.min = "1";
    inpCount.max = "50";
    inpCount.value = "1";
    inpCount.className = "ah-control";
    const countPlus = el("button", "ah-btn subtle", "+");
    countPlus.type = "button";
    countWrap.appendChild(countMinus);
    countWrap.appendChild(inpCount);
    countWrap.appendChild(countPlus);
    countField.right.appendChild(countWrap);

    const quick = el("div", "ah-quick");
    [1, 5, 10].forEach((n) => {
      const b = el("button", "ah-btn", String(n));
      b.type = "button";
      b.disabled = _busy;
      b.addEventListener("click", () => {
        inpCount.value = String(n);
        updateCost();
      });
      quick.appendChild(b);
    });
    countField.right.appendChild(quick);

    const refineField = makeField("Refine", "Extra pressure increases shard cost per pull and may improve uncommon+ odds.");
    const refWrap = el("div", "ah-stepper");
    const refMinus = el("button", "ah-btn subtle", "−");
    refMinus.type = "button";
    const inpRef = document.createElement("input");
    inpRef.type = "number";
    inpRef.min = "0";
    inpRef.max = "5";
    inpRef.value = "0";
    inpRef.className = "ah-control";
    const refPlus = el("button", "ah-btn subtle", "+");
    refPlus.type = "button";
    refWrap.appendChild(refMinus);
    refWrap.appendChild(inpRef);
    refWrap.appendChild(refPlus);
    refineField.right.appendChild(refWrap);

    const previewPanel = el("div", "ah-panel");
    const fDbg = el("div", "ah-small", "");

    function clampField(input, min, max) {
      const n = Math.max(min, Math.min(max, parseInt(input.value || String(min), 10) || min));
      input.value = String(n);
      return n;
    }

    countMinus.addEventListener("click", () => {
      const n = clampField(inpCount, 1, 50);
      inpCount.value = String(Math.max(1, n - 1));
      updateCost();
    });
    countPlus.addEventListener("click", () => {
      const n = clampField(inpCount, 1, 50);
      inpCount.value = String(Math.min(50, n + 1));
      updateCost();
    });

    refMinus.addEventListener("click", () => {
      const n = clampField(inpRef, 0, 5);
      inpRef.value = String(Math.max(0, n - 1));
      updateCost();
    });
    refPlus.addEventListener("click", () => {
      const n = clampField(inpRef, 0, 5);
      inpRef.value = String(Math.min(5, n + 1));
      updateCost();
    });

    function updateCost() {
      const slot = sel.value;
      const n = clampField(inpCount, 1, 50);
      const r = clampField(inpRef, 0, 5);

      const per = (cfg.baseCost || 5) + r * (cfg.refineCost || 2);
      const total = per * n;

      const have = shardsHave(slot);
      const left = have - total;

      const pU = Math.min((cfg.uncommonBase || 0) + (cfg.uncommonRefineAdd || 0) * r, (cfg.uncommonCap || 1));
      const pity = currentPity(slot);
      const pityRatio = pity != null && cfg.pity ? Math.max(0, Math.min(1, Number(pity) / Number(cfg.pity))) : 0;

      previewPanel.innerHTML = `
        <div class="ah-section-kicker">Forge Preview</div>
        <div class="ah-section-title">${esc(cap(slot))} slot roll</div>
        <div class="ah-section-copy">Preview only. Real spending still comes from the backend craft endpoint.</div>

        <div class="ah-preview-grid" style="margin-top:12px">
          <div class="ah-preview-card">
            <div class="ah-preview-label">Shard Spend</div>
            <div class="ah-preview-value">${total} total</div>
            <div class="ah-preview-sub">Have ${have} · Per pull ${per} · After ${left}</div>
          </div>
          <div class="ah-preview-card">
            <div class="ah-preview-label">Odds Snapshot</div>
            <div class="ah-preview-value">${Math.round(pU * 100)}% uncommon+</div>
            <div class="ah-preview-sub">
              ${cfg.pEpic ? `Epic ${(cfg.pEpic * 100).toFixed(2)}% · ` : ``}
              ${cfg.pLegendary ? `Legendary ${(cfg.pLegendary * 100).toFixed(2)}% · ` : ``}
              Base uncommon ${Math.round((cfg.uncommonBase || 0) * 100)}%
            </div>
          </div>
        </div>

        ${pity != null ? `
          <div class="ah-meter-wrap">
            <div class="ah-meter-top">
              <span>Pity progress</span>
              <b>${Number(pity)} / ${Number(cfg.pity)}</b>
            </div>
            <div class="ah-meter">
              <div class="ah-meter-fill" style="width:${Math.round(pityRatio * 100)}%"></div>
            </div>
          </div>
        ` : ``}
      `;

      fDbg.textContent = `preview(per=${per}, total=${total}, count=${n}, refine=${r})`;
    }

    inpCount.addEventListener("input", updateCost);
    inpRef.addEventListener("input", updateCost);
    sel.addEventListener("change", updateCost);

    const btnRow = el("div", "ah-btnrow");
    const btn = el("button", "ah-btn primary", "Forge Pull");
    btn.type = "button";
    btn.disabled = _busy;

    const refreshBtn = el("button", "ah-btn subtle", "Refresh");
    refreshBtn.type = "button";
    refreshBtn.disabled = _busy;
    refreshBtn.addEventListener("click", async () => {
      if (_busy) return;
      _busy = true;
      draw();
      try {
        await loadState();
        toast("Forge state refreshed.");
      } catch (e) {
        toast(`Refresh failed: ${e.message}`);
      } finally {
        _busy = false;
        draw();
      }
    });

    btnRow.appendChild(btn);
    btnRow.appendChild(refreshBtn);

    btn.addEventListener("click", async () => {
      if (_busy) return;

      const slot = sel.value;
      const count = clampField(inpCount, 1, 50);
      const refine = clampField(inpRef, 0, 5);

      const per = (cfg.baseCost || 5) + refine * (cfg.refineCost || 2);
      const total = per * count;

      const have = shardsHave(slot);
      if (have < total) {
        toast(`Not enough ${slot}_shards (need ${total}, have ${have}).`);
        return;
      }

      _busy = true;
      draw();

      try {
        const run_id = rid("web_craft");
        const res = await post("/webapp/forge/craft", {
          buildingId: _ctx.buildingId,
          slot,
          count,
          refine,
          run_id,
          client_preview: { per, total, have, slot, count, refine },
        });

        const data = pick(res, "data", null) || pick(res, "result.data", null) || null;

        const made = pick(res, "made", null) || pick(res, "result.made", null) || [];
        const pityMap = pick(res, "pityMap", null) || pick(res, "result.pityMap", null) || pick(data, "pityMap", null);
        const pity = pick(res, "pity", null) ?? pick(res, "result.pity", null) ?? pick(data, "pity", null);

        const spent = pick(res, "spent", null) ?? pick(res, "need", null) ?? pick(res, "result.spent", null);
        const echo = pick(res, "echo", null) || pick(res, "result.echo", null) || null;
        const have_after = pick(res, "have_after", null) ?? pick(res, "result.have_after", null) ?? pick(data, `shards.${slot}_shards`, null);

        _lastCraft = { slot, made, spent: spent != null ? Number(spent) : null, echo };

        if (data) {
          _state = data;
        } else {
          _state = _state || {};
          _state.shards = _state.shards || {};
          if (have_after != null) _state.shards[`${slot}_shards`] = Number(have_after);

          if (pityMap) _state.pityMap = pityMap;
          else if (pity != null) {
            _state.pityMap = _state.pityMap || {};
            _state.pityMap[slot] = Number(pity);
          }
        }

        if (pityMap && pityMap[slot] != null) _pityOverride[slot] = Number(pityMap[slot]);
        else if (pity != null) _pityOverride[slot] = Number(pity);

        if (spent != null && Number(spent) !== Number(total)) {
          const eCnt = echo && echo.count != null ? `count=${echo.count}` : `count=${count}`;
          const eRef = echo && echo.refine != null ? `refine=${echo.refine}` : `refine=${refine}`;
          toast(`Server spent ${spent} (preview ${total}) · ${eCnt} ${eRef}`);
        } else {
          toast(made.length ? `Crafted ${made.length} item(s).` : "Craft complete.");
        }

        try { refreshSlotLabels(); } catch (_) {}
        try { updateCost(); } catch (_) {}

        const uiErrorEl = document.getElementById("forge-error");
        if (uiErrorEl) uiErrorEl.textContent = "";
      } catch (e) {
        let uiErrorEl = document.getElementById("forge-error");
        if (!uiErrorEl) {
          uiErrorEl = document.createElement("pre");
          uiErrorEl.id = "forge-error";
          uiErrorEl.style.whiteSpace = "pre-wrap";
          uiErrorEl.style.wordBreak = "break-word";
          uiErrorEl.style.margin = "12px 0 0";
          uiErrorEl.style.padding = "12px 14px";
          uiErrorEl.style.border = "1px solid rgba(255,255,255,.16)";
          uiErrorEl.style.borderRadius = "16px";
          uiErrorEl.style.background = "rgba(0,0,0,.35)";
          uiErrorEl.style.fontSize = "12px";
          uiErrorEl.style.lineHeight = "1.4";

          const mount =
            document.querySelector("#forge-modal .modal-body") ||
            document.querySelector("#forge-modal") ||
            document.querySelector("#forge") ||
            (_root && _root.querySelector(".ah-forge-body")) ||
            document.body;

          mount.appendChild(uiErrorEl);
        }

        console.error("CRAFT ERROR:", e);

        const status = e?.status ?? e?.data?.status ?? "";
        const payload = e?.data?.data || e?.data || {};
        const rawMsg = (e && typeof e === "object" && e.message) ? e.message : String(e);
        const reason = payload?.reason || rawMsg || "unknown";

        let payloadPretty = "";
        try { payloadPretty = JSON.stringify(payload, null, 2); }
        catch { payloadPretty = String(payload); }

        const dbgPretty = payload?.dbg ? (() => {
          try { return JSON.stringify(payload.dbg, null, 2); } catch { return String(payload.dbg); }
        })() : "";

        uiErrorEl.textContent =
          `Craft failed${status ? " [" + status + "]" : ""}: ${reason}\n\n` +
          `raw: ${String(e)}\n\n` +
          (dbgPretty ? `DBG:\n${dbgPretty}\n\n` : "") +
          (payload?.trace ? `TRACE:\n${payload.trace}\n\n` : "") +
          `PAYLOAD:\n${payloadPretty}`;

        toast(`Craft failed${status ? " [" + status + "]" : ""}: ${reason}`);
      } finally {
        _busy = false;
        draw();
      }
    });

    controls.appendChild(el("div", "ah-divider", ""));
    controls.appendChild(slotField.wrap);
    controls.appendChild(countField.wrap);
    controls.appendChild(refineField.wrap);
    controls.appendChild(previewPanel);
    controls.appendChild(fDbg);
    controls.appendChild(el("div", "ah-divider", ""));
    controls.appendChild(btnRow);

    results.appendChild(el("div", "", `
      <div class="ah-section-kicker">Craft Results</div>
      <div class="ah-section-title">Latest forge output</div>
      <div class="ah-section-copy">The last crafted batch appears here. This panel is visual only and reads whatever the craft call returned.</div>
    `));

    const out = el("div", "ah-results");

    function drawResults() {
      out.innerHTML = "";

      const made = (_lastCraft && _lastCraft.made) || [];
      if (!made.length) {
        out.appendChild(el("div", "ah-results-empty", "No craft results yet. Run a shard pull to populate this panel."));
      } else {
        made.forEach((it) => {
          const obj = (typeof it === "string") ? { key: it } : (it || {});
          const rKey = rarityKey(obj.rarity);
          const card = el("div", `ah-result ${rarityClass(rKey)}`);
          const ico = el("div", `ah-ico ${rarityClass(rKey)}`);

          const img = document.createElement("img");
          img.alt = obj.name || obj.key || "item";
          img.src = obj.icon || "";
          img.onerror = () => { img.remove(); ico.textContent = "✦"; };
          ico.appendChild(img);

          const meta = el("div", "ah-meta");
          meta.appendChild(el("div", "ah-line", `<b>${esc(obj.name || obj.key || "Item")}</b>`));
          meta.appendChild(el("div", "ah-subline", `<span class="ah-tag ${rarityClass(rKey)}">${esc(obj.rarity || "common")}</span><span>${esc(cap(_lastCraft.slot || ""))}</span>`));

          card.appendChild(ico);
          card.appendChild(meta);
          out.appendChild(card);
        });
      }

      const spent = _lastCraft && _lastCraft.spent;
      const echo = _lastCraft && _lastCraft.echo;
      if (spent != null || echo) {
        const txt = [
          (spent != null ? `spent=${spent}` : null),
          (echo && echo.count != null ? `count=${echo.count}` : null),
          (echo && echo.refine != null ? `refine=${echo.refine}` : null),
        ].filter(Boolean).join(" · ");

        out.appendChild(el("div", "ah-results-empty", txt || "Last craft debug metadata unavailable."));
      }
    }

    drawResults();
    results.appendChild(el("div", "ah-divider", ""));
    results.appendChild(out);

    form.appendChild(controls);
    form.appendChild(results);
    body.appendChild(form);

    refreshSlotLabels();
    updateCost();
  }

  function draw() {
    if (!_root) return;

    const title = _root.querySelector(".ah-forge-title");
    const sub = _root.querySelector(".ah-forge-sub");
    const eyebrow = _root.querySelector(".ah-forge-eyebrow");

    title.textContent = _ctx.name || "Forgotten Tokens’ Vault";
    if (eyebrow) {
      eyebrow.innerHTML = `<span class="dot"></span><span>Vault Forge Station</span>`;
    }

    sub.textContent = _ctx.buildingId
      ? `Building: ${_ctx.buildingId} · ${_tab === "upgrade" ? "Upgrade Bench" : "Shard Forge"}`
      : (_tab === "upgrade" ? "Upgrade Bench" : "Shard Forge");

    const tabs = _root.querySelectorAll(".ah-forge-tab");
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === _tab));

    const body = _root.querySelector(".ah-forge-body");
    body.innerHTML = "";

    if (!_state) {
      body.appendChild(el("div", "ah-note",
        `<div class="ah-section-kicker">Loading</div>
         <div class="ah-section-title">Connecting to the vault</div>
         <div class="ah-section-copy">Pulling forge state, balances, shard pools and upgrade data…</div>`
      ));
      return;
    }

    renderBalances(body);
    if (_tab === "upgrade") renderUpgrade(body);
    else renderCraft(body);
  }

  async function loadState() {
    const res = await post("/webapp/forge/state", {
      buildingId: _ctx.buildingId,
      run_id: rid("forge_state")
    });
    _state = (res && (res.data || res)) || null;
  }

  function mount() {
    ensureStyles();
    lockScroll(true);

    const backdrop = el("div", "ah-forge-backdrop");
    const modal = el("div", "ah-forge");

    const head = el("div", "ah-forge-head");
    const left = el("div", "ah-head-left");
    left.appendChild(el("div", "ah-forge-eyebrow", `<span class="dot"></span><span>Vault Forge Station</span>`));
    left.appendChild(el("div", "ah-forge-title", _ctx.name || "Forgotten Tokens’ Vault"));
    left.appendChild(el("div", "ah-forge-sub", ""));
    head.appendChild(left);

    const close = el("button", "ah-forge-close", "✕");
    close.type = "button";
    close.addEventListener("click", unmount);
    head.appendChild(close);

    const tabs = el("div", "ah-forge-tabs");
    [
      ["upgrade", "UPGRADE"],
      ["craft", "CRAFT"],
    ].forEach(([k, label]) => {
      const t = el("button", "ah-forge-tab", label);
      t.type = "button";
      t.dataset.tab = k;
      t.addEventListener("click", () => {
        _tab = k;
        draw();
      });
      tabs.appendChild(t);
    });

    const body = el("div", "ah-forge-body", "");
    modal.appendChild(head);
    modal.appendChild(tabs);
    modal.appendChild(body);
    backdrop.appendChild(modal);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) unmount();
    });

    _root = backdrop;
    document.body.appendChild(backdrop);
  }

  function unmount() {
    lockScroll(false);
    if (_root) _root.remove();
    _root = null;
    _state = null;
    _busy = false;
    _tab = "upgrade";
  }

  async function open(ctx) {
    _ctx = {
      buildingId: ctx && ctx.buildingId ? ctx.buildingId : null,
      name: (ctx && ctx.name) || "Forgotten Tokens’ Vault",
    };

    mount();
    try {
      await loadState();
    } catch (e) {
      toast(`Forge load failed: ${e.message}`);
    } finally {
      draw();
    }
  }

  window.Forge = { init, open, close: unmount };
})();
