// js/faction_hq.js — Faction HQ (Alpha Husky WebApp) — Premium HQ mockup version
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _back = null;   // #factionHQBack
  let _modal = null;  // #factionHQModal
  let _root = null;   // #factionHQRoot

  let _feedExpanded = false;

  function log(...a) { if (_dbg) console.log("[FactionHQ]", ...a); }

  // ---------------------------
  // Helpers
  // ---------------------------
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function num(v) {
    const n = Number(v || 0);
    try { return n.toLocaleString(); } catch (_) { return String(n); }
  }

  function pct(have, need) {
    const h = Number(have || 0);
    const n = Number(need || 0);
    if (n <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((h / n) * 100)));
  }

  function fmtTs(t) {
    try { return new Date((t || 0) * 1000).toLocaleString(); }
    catch (_) { return ""; }
  }

  function _uid() {
    try { return String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || ""); }
    catch (_) { return ""; }
  }

  function _uidTail() {
    const u = _uid();
    return u ? u.slice(-5) : "?????";
  }

  function _rid(prefix = "hq") {
    try {
      const uid = _uid() || "0";
      const r = (crypto?.randomUUID
        ? crypto.randomUUID()
        : (String(Date.now()) + Math.random().toString(16).slice(2)));
      return `${prefix}:${uid}:${r}`;
    } catch (_) {
      return `${prefix}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    }
  }

  function _clampLvl(v) {
  const n = parseInt(v || 1, 10) || 1;
  return Math.max(1, Math.min(6, n));
}

const HQ_HOLO_BY_LEVEL = {
  1: { name: "Raw Core", asset: "/images/hq/hq_lv1.png" },
  2: { name: "First Expansion", asset: "/images/hq/hq_lv2.png" },
  3: { name: "Network Expansion", asset: "/images/hq/hq_lv3.png" },
  4: { name: "Data Fortress", asset: "/images/hq/hq_lv4.png" },
  5: { name: "Energy Core", asset: "/images/hq/hq_lv5.png" },
  6: { name: "Ghost Layer", asset: "/images/hq/hq_lv6.png" },
};

function _hqAsset(level) {
  return HQ_HOLO_BY_LEVEL[_clampLvl(level)] || HQ_HOLO_BY_LEVEL[1];
}

function _hqStageHTML(level, faction) {
  const lv = _clampLvl(level);
  const cfg = _hqAsset(lv);

  return `
    <div class="hq-mockup hq-holo-stage" data-level="${lv}" data-faction="${esc(faction)}">
      <div class="hq-holo-grid"></div>
      <div class="hq-holo-ring hq-holo-ring-a"></div>
      <div class="hq-holo-ring hq-holo-ring-b"></div>

      <img
        class="hq-holo-model"
        src="${esc(cfg.asset)}"
        alt="Faction HQ Level ${lv}"
        loading="eager"
        decoding="async"
        onerror="this.style.display='none';"
      />

      <div class="hq-holo-scan"></div>
      <div class="hq-badge-mini">${esc(factionShort(faction))}</div>

      <div class="hq-label">
        Faction Headquarters • Level ${num(level)}
      </div>
    </div>
  `;
}

  function _recentContributors(feed, limit = 6) {
  const src = Array.isArray(feed) ? feed : [];
  const byUid = new Map();

  for (const x of src) {
    const uid = x && x.uid ? String(x.uid) : "";
    if (!uid) continue;

    const t = Number(x.t || 0);
    const amount = Number(x.amount || 0);

    if (!byUid.has(uid)) {
      byUid.set(uid, {
        uid,
        tail: uid.slice(-4),
        lastTs: t,
        actions: 0,
        upgrades: 0,
        bones: 0,
        scrap: 0,
      });
    }

    const row = byUid.get(uid);
    row.actions += 1;
    row.lastTs = Math.max(row.lastTs, t);

    if (x.type === "upgrade") row.upgrades += 1;
    if (x.asset === "bones") row.bones += amount;
    if (x.asset === "scrap") row.scrap += amount;
  }

  return Array.from(byUid.values())
    .sort((a, b) => (b.lastTs - a.lastTs) || (b.actions - a.actions))
    .slice(0, limit);
}

function _contribSummary(c) {
  if (!c) return "";
  if (c.upgrades > 0) return `Upgrades ${c.upgrades}`;
  if (c.bones > 0 && c.scrap > 0) return `${num(c.bones)}🦴 • ${num(c.scrap)}🔩`;
  if (c.bones > 0) return `${num(c.bones)}🦴`;
  if (c.scrap > 0) return `${num(c.scrap)}🔩`;
  return `${num(c.actions)} actions`;
}
  
  // ---------------------------
  // Faction normalization
  // ---------------------------
  function _normFactionKey(f) {
    f = String(f || "").toLowerCase().trim();
    if (!f) return "";
    if (f === "rb" || f === "ew" || f === "pb" || f === "ih") return f;

    if (f === "rogue_byte" || f === "roguebyte" || f.includes("rogue")) return "rb";
    if (f === "echo_wardens" || f === "echowardens" || f.includes("echo")) return "ew";
    if (f === "pack_burners" || f === "packburners" || f.includes("pack") || f.includes("burn")) return "pb";
    if (f === "inner_howl" || f === "inner howlers" || f === "iron_howlers" || f.includes("inner") || f.includes("iron") || f.includes("howl")) return "ih";

    return f;
  }

  function _canonFaction(f) {
    const k = _normFactionKey(f);
    if (k === "rb") return "rogue_byte";
    if (k === "ew") return "echo_wardens";
    if (k === "pb") return "pack_burners";
    if (k === "ih") return "inner_howl";
    return "";
  }

  function niceFactionName(key) {
    const m = {
      rogue_byte: "Rogue Byte",
      echo_wardens: "Echo Wardens",
      pack_burners: "Pack Burners",
      inner_howl: "Iron Howlers",
      iron_howlers: "Iron Howlers",
    };
    return m[key] || key || "—";
  }

  function factionShort(key) {
    const canon = _canonFaction(key) || key;
    const m = {
      rogue_byte: "RB",
      echo_wardens: "EW",
      pack_burners: "PB",
      inner_howl: "IH",
    };
    return m[canon] || "HQ";
  }

  // ---------------------------
  // Theme / backgrounds
  // ---------------------------
  function _hqBgUrlForFaction(faction) {
    const k = _normFactionKey(faction);
    const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
    const map = {
      rb: `/hq_warroom_rb.webp${v}`,
      ew: `/hq_warroom_ew.webp${v}`,
      pb: `/hq_warroom_pb.webp${v}`,
      ih: `/hq_warroom_ih.webp${v}`,
    };
    return map[k] || map.rb;
  }

  function _factionColorFor(faction) {
    const canon = _canonFaction(faction);
    const map = {
      rogue_byte: "#00eaff",
      echo_wardens: "#5bff9a",
      pack_burners: "#ff7a2f",
      inner_howl: "#c45cff",
    };
    return map[canon] || "#00eaff";
  }

  function applyHqBg(faction) {
    const url = _hqBgUrlForFaction(faction);
    const cssUrl = `url("${url}")`;

    const back = document.getElementById("factionHQBack");
    if (!back) return;

    back.style.setProperty("--hq-bg-url", cssUrl);

    let bg = back.querySelector(".hq-bg");
    if (!bg) {
      bg = document.createElement("div");
      bg.className = "hq-bg";
      back.insertBefore(bg, back.firstChild);
    }

    bg.style.setProperty("position", "absolute", "important");
    bg.style.setProperty("inset", "0", "important");
    bg.style.setProperty("display", "block", "important");
    bg.style.setProperty("visibility", "visible", "important");
    bg.style.setProperty("opacity", "1", "important");
    bg.style.setProperty("z-index", "0", "important");
    bg.style.setProperty("background-color", "#07080c", "important");
    bg.style.setProperty("background-image", cssUrl, "important");
    bg.style.setProperty("background-size", "cover", "important");
    bg.style.setProperty("background-position", "center center", "important");
    bg.style.setProperty("background-repeat", "no-repeat", "important");
    bg.style.setProperty("filter", "none", "important");
    bg.style.setProperty("transform", "none", "important");

    back.style.setProperty("position", "fixed", "important");
    back.style.setProperty("inset", "0", "important");
    back.style.setProperty("overflow", "hidden", "important");
    back.style.setProperty("background", "transparent", "important");

    const modal = document.getElementById("factionHQModal");
    if (modal) {
      modal.style.setProperty("position", "absolute", "important");
      modal.style.setProperty("inset", "0", "important");
      modal.style.setProperty("z-index", "2", "important");
      modal.style.setProperty("background", "transparent", "important");
    }

    if (_dbg) {
      const cs = getComputedStyle(bg);
      const rect = bg.getBoundingClientRect();
      console.log("[FactionHQ][BG_FORCE]", {
        faction,
        norm: _normFactionKey(faction),
        url,
        bgExists: !!bg,
        bgImage: cs.backgroundImage,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        rect: { w: rect.width, h: rect.height, x: rect.x, y: rect.y }
      });
    }
  }

  function applyHQTheme(faction) {
    const canon = _canonFaction(faction);
    const color = _factionColorFor(faction);

    try {
      if (_back) {
        _back.style.setProperty("--faction-color", color);
        _back.setAttribute("data-faction", canon || "");
      }
      if (_root) {
        _root.style.setProperty("--faction-color", color);
        _root.setAttribute("data-faction", canon || "");
      }
      if (_modal) {
        _modal.style.setProperty("--faction-color", color);
        _modal.setAttribute("data-faction", canon || "");
      }
    } catch (_) { }
  }

  function _prefetchBgs() {
    try {
      const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
      ["rb", "ew", "pb", "ih"].forEach(k => {
        const i = new Image();
        i.src = `/hq_warroom_${k}.webp${v}`;
      });
    } catch (_) { }
  }

  // ---------------------------
  // Styles
  // ---------------------------
  function ensureStyles() {
    if (document.getElementById("factionhq-premium-css")) return;

    const st = document.createElement("style");
    st.id = "factionhq-premium-css";
    st.textContent = `
      #factionHQBack{
        --faction-color:#00eaff;
        position:fixed !important;
        inset:0 !important;
        z-index:999990 !important;
        display:none;
        pointer-events:auto;
      }
      #factionHQBack.is-open{ display:block !important; }

      #factionHQBack .hq-bg{
        position:absolute !important;
        inset:0 !important;
        background:#07080c;
        background-image:var(--hq-bg-url);
        background-size:cover !important;
        background-position:center !important;
        background-repeat:no-repeat !important;
      }
      #factionHQBack .hq-bg::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:
          radial-gradient(120% 70% at 50% 28%, rgba(0,0,0,.10), rgba(0,0,0,.76)),
          linear-gradient(to bottom, rgba(0,0,0,.14), rgba(0,0,0,.88));
      }
      #factionHQBack .hq-vignette{
        position:absolute;
        inset:0;
        pointer-events:none;
        z-index:1;
        background:
          radial-gradient(ellipse at center, rgba(0,0,0,.04) 0%, rgba(0,0,0,.34) 60%, rgba(0,0,0,.82) 100%);
      }
      #factionHQBack .hq-noise{
        position:absolute;
        inset:0;
        z-index:1;
        pointer-events:none;
        opacity:.10;
        mix-blend-mode:screen;
        background-image:
          linear-gradient(to bottom, rgba(255,255,255,.06), rgba(255,255,255,0)),
          repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,.035) 0px,
            rgba(255,255,255,.035) 1px,
            transparent 2px,
            transparent 4px
          );
      }

      #factionHQModal{
        position:absolute !important;
        inset:0 !important;
        z-index:2 !important;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:12px;
      }

      #factionHQRoot{
  --faction-color:#00eaff;
  width:min(620px, 100%);
  max-height:calc(100vh - 14px);
  overflow:auto;
  -webkit-overflow-scrolling:touch;
  padding:14px;
  border-radius:24px;
  color:rgba(255,255,255,.96);
  background:
    linear-gradient(180deg, rgba(11,13,21,.88), rgba(8,10,16,.94));
  border:1px solid rgba(255,255,255,.12);
  box-shadow:
    0 20px 70px rgba(0,0,0,.55),
    inset 0 1px 0 rgba(255,255,255,.08),
    0 0 0 1px rgba(255,255,255,.03),
    0 0 26px color-mix(in srgb, var(--faction-color) 28%, transparent);
  backdrop-filter:blur(14px);
}
#factionHQRoot .hq-head{
  position:relative;
  overflow:hidden;
  border-radius:22px;
  padding:16px 14px 14px;
  margin-bottom:12px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02)),
    radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--faction-color) 30%, transparent), transparent 42%);
  border:1px solid rgba(255,255,255,.12);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    0 12px 28px rgba(0,0,0,.18);
}
      #factionHQRoot .hq-head::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:
          linear-gradient(115deg, transparent 0%, rgba(255,255,255,.09) 48%, transparent 62%);
        transform:translateX(-120%);
        animation:hqScan 6.5s linear infinite;
        opacity:.22;
      }

      #factionHQRoot .hq-topline{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        flex-wrap:wrap;
      }

      #factionHQRoot .hq-pill{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:5px 12px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.5px;
        background:rgba(255,255,255,.07);
        border:1px solid color-mix(in srgb, var(--faction-color) 42%, rgba(255,255,255,.12));
        box-shadow:0 0 18px color-mix(in srgb, var(--faction-color) 18%, transparent);
      }

      #factionHQRoot .hq-status-chip{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:5px 11px;
        border-radius:999px;
        font-size:11px;
        font-weight:900;
        letter-spacing:.45px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.12);
      }
      #factionHQRoot .hq-status-chip.ready{
        color:#c8ffde;
        border-color:rgba(91,255,154,.38);
        box-shadow:0 0 18px rgba(91,255,154,.12);
      }

      #factionHQRoot .hq-title{
        margin:10px 0 6px;
        font-size:28px;
        line-height:1.05;
        font-weight:900;
        letter-spacing:.2px;
      }

      #factionHQRoot .hq-sub{
        opacity:.86;
        font-size:14px;
        line-height:1.4;
      }

      /* === HQ MOCKUP — wizualna siedziba (progresja leveli) === */
      #factionHQRoot .hq-mockup{
  height:300px;
  border-radius:18px;
  background:#0a0c14;
  position:relative;
  overflow:hidden;
  border:2px solid var(--faction-color);
  box-shadow:
    0 0 35px color-mix(in srgb, var(--faction-color) 55%, transparent),
    inset 0 0 0 1px rgba(255,255,255,.05);
  margin:14px 0 4px;
}
      #factionHQRoot .hq-mockup .layer{
        position:absolute;
        inset:0;
        background-size:cover;
        background-position:center;
        transition:opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1), transform 1.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #factionHQRoot .hq-mockup .layer-base{
        background:
          radial-gradient(circle at 50% 88%, rgba(255,255,255,.06), transparent 30%),
          linear-gradient(180deg, #121726 0%, #0a0c14 100%);
      }

      #factionHQRoot .hq-mockup .layer-grid{
        opacity:.22;
        background-image:
          linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size:22px 22px;
        mask-image:linear-gradient(to bottom, rgba(0,0,0,.88), rgba(0,0,0,.18));
      }

      #factionHQRoot .hq-mockup .layer-core{
        opacity:.78;
        background:
          radial-gradient(circle at 50% 58%, color-mix(in srgb, var(--faction-color) 32%, transparent), transparent 18%),
          radial-gradient(circle at 50% 76%, rgba(255,255,255,.07), transparent 18%);
      }

      #factionHQRoot .hq-mockup .layer-1{
        opacity:0;
        background:
          linear-gradient(transparent 40%, color-mix(in srgb, var(--faction-color) 18%, transparent) 100%);
      }

      #factionHQRoot .hq-mockup .layer-towers{
        opacity:0;
        background:
          linear-gradient(transparent 52%, rgba(0,0,0,.0) 52%),
          radial-gradient(circle at 20% 72%, color-mix(in srgb, var(--faction-color) 18%, transparent), transparent 10%),
          radial-gradient(circle at 80% 72%, color-mix(in srgb, var(--faction-color) 18%, transparent), transparent 10%);
      }

      #factionHQRoot .hq-mockup .tower{
        position:absolute;
        bottom:54px;
        width:34px;
        border-radius:10px 10px 4px 4px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.04)),
          linear-gradient(180deg, color-mix(in srgb, var(--faction-color) 30%, #151a26), #0a0c14 88%);
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 0 18px color-mix(in srgb, var(--faction-color) 20%, transparent);
        opacity:0;
        transform:translateY(14px);
        transition:opacity 1.2s ease, transform 1.2s ease;
      }
      #factionHQRoot .hq-mockup .tower.left{ left:22%; height:74px; }
      #factionHQRoot .hq-mockup .tower.center{ left:calc(50% - 22px); width:44px; height:102px; border-radius:12px 12px 6px 6px; }
      #factionHQRoot .hq-mockup .tower.right{ right:22%; height:74px; }

      #factionHQRoot .hq-mockup .tower::before{
        content:"";
        position:absolute;
        left:50%;
        top:10px;
        transform:translateX(-50%);
        width:52%;
        height:6px;
        border-radius:999px;
        background:color-mix(in srgb, var(--faction-color) 85%, white);
        box-shadow:0 0 12px color-mix(in srgb, var(--faction-color) 55%, transparent);
      }

      #factionHQRoot .hq-mockup .layer-neon{
        opacity:0;
        background:
          radial-gradient(circle at 50% 63%, color-mix(in srgb, var(--faction-color) 26%, transparent), transparent 26%),
          linear-gradient(transparent 30%, rgba(255,255,255,.03) 100%);
      }

      #factionHQRoot .hq-mockup .layer-sat{
        opacity:0;
        background:
          conic-gradient(
            from 0deg at 50% 44%,
            transparent 0% 18%,
            color-mix(in srgb, var(--faction-color) 72%, white) 22% 28%,
            transparent 33% 62%,
            color-mix(in srgb, var(--faction-color) 52%, white) 68% 74%,
            transparent 78% 100%
          );
        animation:satRotate 25s linear infinite;
        transform-origin:50% 44%;
        filter:blur(1px);
      }

      #factionHQRoot .hq-mockup .scan-ring{
        position:absolute;
        left:50%;
        top:46%;
        width:124px;
        height:124px;
        transform:translate(-50%,-50%);
        border-radius:50%;
        border:1px solid color-mix(in srgb, var(--faction-color) 45%, transparent);
        box-shadow:0 0 22px color-mix(in srgb, var(--faction-color) 18%, transparent);
        opacity:.58;
      }
      #factionHQRoot .hq-mockup .scan-ring.r2{
        width:162px;
        height:162px;
        opacity:.28;
        border-style:dashed;
        animation:satRotate 18s linear infinite reverse;
      }

      #factionHQRoot .hq-mockup .hq-glow-line{
        position:absolute;
        left:10%;
        right:10%;
        bottom:48px;
        height:2px;
        border-radius:999px;
        background:linear-gradient(90deg, transparent, color-mix(in srgb, var(--faction-color) 80%, white), transparent);
        box-shadow:0 0 16px color-mix(in srgb, var(--faction-color) 35%, transparent);
        opacity:.85;
      }

      #factionHQRoot .hq-mockup .hq-badge-mini{
        position:absolute;
        top:12px;
        left:12px;
        min-width:34px;
        height:34px;
        padding:0 10px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.5px;
        color:#fff;
        background:rgba(0,0,0,.42);
        border:1px solid rgba(255,255,255,.10);
        box-shadow:0 0 18px color-mix(in srgb, var(--faction-color) 18%, transparent);
        backdrop-filter:blur(6px);
      }

      #factionHQRoot .hq-mockup .hq-label{
  position:absolute;
  bottom:10px;
  left:12px;
  right:12px;
  background:rgba(0,0,0,.75);
  padding:7px 12px;
  border-radius:12px;
  font-size:12px;
  text-align:center;
  color:#fff;
  border:1px solid color-mix(in srgb, var(--faction-color) 55%, rgba(255,255,255,.12));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
}

      #factionHQRoot .hq-mockup[data-level="1"] .layer-1{ opacity:.65; }
      #factionHQRoot .hq-mockup[data-level="2"] .layer-1{ opacity:.90; }
      #factionHQRoot .hq-mockup[data-level="3"] .layer-towers,
      #factionHQRoot .hq-mockup[data-level="4"] .layer-towers{ opacity:1; }
      #factionHQRoot .hq-mockup[data-level="3"] .tower,
      #factionHQRoot .hq-mockup[data-level="4"] .tower,
      #factionHQRoot .hq-mockup[data-level="5"] .tower,
      #factionHQRoot .hq-mockup[data-level="6"] .tower,
      #factionHQRoot .hq-mockup[data-level="7"] .tower{
        opacity:1;
        transform:translateY(0);
      }
      #factionHQRoot .hq-mockup[data-level="5"] .layer-neon,
      #factionHQRoot .hq-mockup[data-level="6"] .layer-neon{ opacity:1; }
      #factionHQRoot .hq-mockup[data-level="7"] .layer-sat{ opacity:.92; }

      #factionHQRoot .hq-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:14px;
      }
      @media (min-width: 700px){
        #factionHQRoot .hq-grid.two{
          grid-template-columns:1fr 1fr;
        }
      }

      #factionHQRoot .hq-card{
        position:relative;
        overflow:hidden;
        border-radius:18px;
        padding:16px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.035));
        border:1px solid rgba(255,255,255,.10);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.06),
          0 10px 24px rgba(0,0,0,.18);
      }
      #factionHQRoot .hq-card::before{
        content:"";
        position:absolute;
        inset:auto -30% 100% -30%;
        height:60%;
        background:radial-gradient(circle, color-mix(in srgb, var(--faction-color) 18%, transparent), transparent 60%);
        opacity:.55;
        pointer-events:none;
      }

      #factionHQRoot .hq-card-title{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:12px;
      }
      #factionHQRoot .hq-card-title b{
        font-size:15px;
        letter-spacing:.2px;
      }

      #factionHQRoot .hq-row{
        display:flex;
        gap:10px;
        align-items:center;
        justify-content:space-between;
      }

      #factionHQRoot .hq-stat-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      }

      #factionHQRoot .hq-stat{
        border-radius:16px;
        padding:14px 12px;
        text-align:center;
        background:rgba(0,0,0,.20);
        border:1px solid rgba(255,255,255,.08);
      }
      #factionHQRoot .hq-stat-icon{
        font-size:24px;
        margin-bottom:8px;
      }
      #factionHQRoot .hq-stat-value{
        font-size:22px;
        font-weight:900;
        line-height:1.05;
      }
      #factionHQRoot .hq-stat-label{
        font-size:12px;
        opacity:.78;
        margin-top:4px;
      }

      #factionHQRoot .hq-mini{
        opacity:.84;
        font-size:13px;
        line-height:1.4;
      }

      #factionHQRoot .hq-progress{
        margin-top:12px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      #factionHQRoot .hq-progress-line{
        display:flex;
        flex-direction:column;
        gap:6px;
      }
      #factionHQRoot .hq-progress-head{
        display:flex;
        justify-content:space-between;
        gap:8px;
        font-size:12px;
        opacity:.86;
      }
      #factionHQRoot .hq-bar{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.06);
      }
      #factionHQRoot .hq-bar > span{
        display:block;
        height:100%;
        width:0%;
        border-radius:999px;
        background:
          linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 62%, white), var(--faction-color));
        box-shadow:0 0 16px color-mix(in srgb, var(--faction-color) 35%, transparent);
      }

      #factionHQRoot .hq-actions{
        display:grid;
        grid-template-columns:repeat(2, minmax(0, 1fr));
        gap:10px;
      }

      #factionHQRoot .hq-btn{
        width:100%;
        padding:14px 14px;
        border-radius:14px;
        font-weight:800;
        font-size:15px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.09);
        color:#fff;
        transition:transform .15s ease, box-shadow .15s ease, opacity .15s ease, filter .15s ease;
        box-shadow:0 8px 20px rgba(0,0,0,.18);
      }
      #factionHQRoot .hq-btn:active{ transform:translateY(1px) scale(.995); }
      #factionHQRoot .hq-btn.primary{
        background:
          linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 88%, white), var(--faction-color));
        color:#081018;
        border-color:transparent;
      }
      #factionHQRoot .hq-btn.ghost{
        background:rgba(255,255,255,.05);
      }
      #factionHQRoot .hq-btn.pulse{
        animation:hqPulseBtn 1.8s ease-in-out infinite;
      }
      #factionHQRoot .hq-btn[disabled]{
        opacity:.45;
        filter:saturate(.6);
        box-shadow:none;
      }

      #factionHQRoot .hq-input{
        width:100%;
        padding:13px 14px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.24);
        color:#fff;
        outline:none;
        font-weight:700;
        box-sizing:border-box;
      }
      #factionHQRoot .hq-input::placeholder{
        color:rgba(255,255,255,.45);
      }

      #factionHQRoot .hq-feed{
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-top:8px;
}

#factionHQRoot .hq-feed-item{
  padding:10px 12px;
  border-radius:12px;
  background:rgba(255,255,255,.055);
  border:1px solid rgba(255,255,255,.08);
  font-size:13px;
  line-height:1.45;
}
      #factionHQRoot .hq-feed-item.upgrade{
        border-color:color-mix(in srgb, var(--faction-color) 30%, rgba(255,255,255,.08));
        box-shadow:0 0 0 1px color-mix(in srgb, var(--faction-color) 8%, transparent) inset;
      }
            #factionHQRoot .hq-contrib-strip{
        display:flex;
        gap:10px;
        overflow-x:auto;
        padding-bottom:4px;
        -webkit-overflow-scrolling:touch;
        scrollbar-width:none;
      }
      #factionHQRoot .hq-contrib-strip::-webkit-scrollbar{
        display:none;
      }

      #factionHQRoot .hq-contrib{
  min-width:84px;
  flex:0 0 auto;
  border-radius:16px;
  padding:9px 9px 8px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.035));
  border:1px solid rgba(255,255,255,.08);
  text-align:center;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.05),
    0 8px 18px rgba(0,0,0,.16);
}

#factionHQRoot .hq-contrib-badge{
  width:38px;
  height:38px;
  margin:0 auto 7px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:900;
  letter-spacing:.5px;
  color:#fff;
  background:
    radial-gradient(circle at 35% 30%, rgba(255,255,255,.14), transparent 35%),
    linear-gradient(180deg, color-mix(in srgb, var(--faction-color) 36%, #1a2030), #0d111b 88%);
  border:1px solid color-mix(in srgb, var(--faction-color) 36%, rgba(255,255,255,.12));
  box-shadow:
    0 0 18px color-mix(in srgb, var(--faction-color) 18%, transparent),
    inset 0 1px 0 rgba(255,255,255,.08);
}
      #factionHQRoot .hq-contrib-name{
        font-size:12px;
        font-weight:900;
        line-height:1.1;
        margin-bottom:4px;
      }

      #factionHQRoot .hq-contrib-meta{
        font-size:11px;
        opacity:.78;
        line-height:1.2;
        white-space:nowrap;
      }

      #factionHQRoot .hq-contrib-empty{
        border-radius:14px;
        padding:12px;
        background:rgba(255,255,255,.04);
        border:1px dashed rgba(255,255,255,.10);
        font-size:13px;
        opacity:.8;
      }

      body.hq-open{
        overflow:hidden !important;
        touch-action:none;
      }
      /* === HQ HOLOGRAM ASSET STAGE === */
      #factionHQRoot .hq-holo-stage{
        background:
          radial-gradient(circle at 50% 58%, rgba(0,255,255,.14), transparent 28%),
          linear-gradient(180deg, #101522 0%, #090c14 100%);
      }

      #factionHQRoot .hq-holo-grid{
        position:absolute;
        inset:0;
        opacity:.34;
        pointer-events:none;
        background-image:
          linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size:22px 22px;
        mask-image:linear-gradient(to bottom, rgba(0,0,0,.92), rgba(0,0,0,.18));
      }

      #factionHQRoot .hq-holo-ring{
        position:absolute;
        left:50%;
        top:46%;
        transform:translate(-50%,-50%);
        border-radius:50%;
        border:1px solid color-mix(in srgb, var(--faction-color) 55%, transparent);
        box-shadow:0 0 22px color-mix(in srgb, var(--faction-color) 18%, transparent);
        opacity:.58;
        pointer-events:none;
        z-index:1;
      }

      #factionHQRoot .hq-holo-ring-a{
        width:132px;
        height:132px;
        animation:satRotate 18s linear infinite;
      }

      #factionHQRoot .hq-holo-ring-b{
        width:176px;
        height:176px;
        opacity:.26;
        border-style:dashed;
        animation:satRotate 24s linear infinite reverse;
      }

      #factionHQRoot .hq-holo-model{
  position:absolute;
  left:50%;
  top:52%;
  width:100%;
  max-width:none;
  max-height:none;
  height:auto;
  object-fit:contain;
  z-index:2;
  user-select:none;
  -webkit-user-drag:none;
  transform:translate(-50%,-50%) scale(1.55);
  transform-origin:center center;
  filter:
    drop-shadow(0 0 8px color-mix(in srgb, var(--faction-color) 18%, transparent))
    drop-shadow(0 0 24px color-mix(in srgb, var(--faction-color) 22%, transparent));
  animation:hqModelFloat 5s ease-in-out infinite;
}
      #factionHQRoot .hq-holo-scan{
        position:absolute;
        inset:0;
        z-index:3;
        pointer-events:none;
        background:linear-gradient(
          180deg,
          transparent 0%,
          rgba(255,255,255,.02) 28%,
          color-mix(in srgb, var(--faction-color) 20%, transparent) 50%,
          rgba(255,255,255,.02) 72%,
          transparent 100%
        );
        transform:translateY(-100%);
        animation:hqVerticalScan 4.6s linear infinite;
        mix-blend-mode:screen;
      }

      #factionHQRoot .hq-holo-stage .hq-badge-mini{
        z-index:4;
      }

      #factionHQRoot .hq-holo-stage .hq-label{
        z-index:4;
      }

      @keyframes hqModelFloat{
        0%,100%{ transform:translate(-50%,-50%) translateY(0px); }
        50%{ transform:translate(-50%,-50%) translateY(-6px); }
      }

      @keyframes hqVerticalScan{
        0%{ transform:translateY(-100%); opacity:0; }
        12%{ opacity:.9; }
        100%{ transform:translateY(100%); opacity:0; }
      }

      @keyframes satRotate {
        from { transform:rotate(0deg); }
        to   { transform:rotate(360deg); }
      }
      @keyframes hqScan{
        0%{ transform:translateX(-120%); }
        100%{ transform:translateX(150%); }
      }
      @keyframes hqPulseBtn{
        0%,100%{
          box-shadow:
            0 8px 20px rgba(0,0,0,.18),
            0 0 0 0 color-mix(in srgb, var(--faction-color) 0%, transparent);
        }
        50%{
          box-shadow:
            0 8px 20px rgba(0,0,0,.18),
            0 0 0 10px color-mix(in srgb, var(--faction-color) 14%, transparent);
        }
      }
    `;
    document.head.appendChild(st);
  }

  // ---------------------------
  // Vignette / noise
  // ---------------------------
  function ensureHQVignette() {
    if (!_back) return;
    const bg = _back.querySelector(".hq-bg");
    if (!bg) return;

    if (!_back.querySelector(".hq-vignette")) {
      const v = document.createElement("div");
      v.className = "hq-vignette";
      bg.insertAdjacentElement("afterend", v);
    }

    if (!_back.querySelector(".hq-noise")) {
      const n = document.createElement("div");
      n.className = "hq-noise";
      const v = _back.querySelector(".hq-vignette");
      if (v) v.insertAdjacentElement("afterend", n);
      else bg.insertAdjacentElement("afterend", n);
    }
  }

  // ---------------------------
  // DOM
  // ---------------------------
  function ensureModal() {
    ensureStyles();

    _back = document.getElementById("factionHQBack");
    _modal = document.getElementById("factionHQModal");

    if (!_back) {
      _back = document.createElement("div");
      _back.id = "factionHQBack";
      _back.style.display = "none";
      _back.innerHTML = `<div class="hq-bg"></div><div class="hq-vignette"></div><div class="hq-noise"></div><div id="factionHQModal"></div>`;
      document.body.appendChild(_back);
      _modal = document.getElementById("factionHQModal");
    } else {
      if (!_back.querySelector(".hq-bg")) {
        const bg = document.createElement("div");
        bg.className = "hq-bg";
        _back.insertBefore(bg, _back.firstChild);
      }
      if (!_modal) {
        const m = document.createElement("div");
        m.id = "factionHQModal";
        _back.appendChild(m);
        _modal = m;
      }
    }

    _root = document.getElementById("factionHQRoot");
    if (!_root) {
      _root = document.createElement("div");
      _root.id = "factionHQRoot";
      _modal.appendChild(_root);
    }

    ensureHQVignette();

    if (!_back.__hq_click) {
      _back.__hq_click = true;
      _back.addEventListener("click", (e) => {
        if (e.target === _back) return close();
        if (e.target?.classList?.contains("hq-bg")) return close();
        if (e.target?.classList?.contains("hq-vignette")) return close();
        if (e.target?.classList?.contains("hq-noise")) return close();
      });
    }
  }

  // ---------------------------
  // Open / close
  // ---------------------------
  async function open() {
  ensureModal();
  _feedExpanded = false;

    _back.classList.add("is-open");
    document.body.classList.add("hq-open");

    let cached =
      window.PROFILE?.faction ||
      window.PLAYER_STATE?.profile?.faction ||
      (() => { try { return localStorage.getItem("ah_faction") || ""; } catch (_) { return ""; } })();

    cached = _canonFaction(cached) || cached;

    applyHqBg(cached);
    applyHQTheme(cached);

    await render();
  }

  function close() {
    if (_back) _back.classList.remove("is-open");
    document.body.classList.remove("hq-open");
  }

  // ---------------------------
  // State normalization
  // ---------------------------
  function _normStatePayload(res) {
    if (!res || typeof res !== "object") return { ok: false, reason: "NO_RESPONSE" };
    if (res.data && typeof res.data === "object") {
      return { ok: !!res.ok, reason: res.reason, data: res.data, _raw: res };
    }
    return { ok: !!res.ok, reason: res.reason, data: res, _raw: res };
  }

  // ---------------------------
  // Render
  // ---------------------------
  async function render() {
    if (!_apiPost) {
      _root.innerHTML = `
        <div class="hq-card">API not ready.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    _root.innerHTML = `<div class="hq-card" style="text-align:center;">Loading HQ…</div>`;

    let raw;
    try {
      raw = await _apiPost("/webapp/faction/hq/state", _dbg ? { dbg: true } : {});
      log("state raw:", raw);
    } catch (e) {
      _root.innerHTML = `
        <div class="hq-card">HQ load failed.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    const res = _normStatePayload(raw);
    const d = res.data || {};

    if (!res.ok) {
      const reason = res.reason || "NO_FACTION";

      if (reason === "NO_FACTION") {
        _root.innerHTML = `
          <div class="hq-head" style="text-align:center;">
            <div class="hq-pill">HQ</div>
            <h2 class="hq-title">Faction HQ</h2>
            <div class="hq-sub">Join a faction to access headquarters.</div>
          </div>
          <div class="hq-grid">
            <div class="hq-card">
              <button class="hq-btn primary" onclick="window.Factions?.open?.()">Choose Faction</button>
              <div style="height:10px"></div>
              <button class="hq-btn ghost" onclick="FactionHQ.close()">Close</button>
            </div>
          </div>
        `;
        return;
      }

      _root.innerHTML = `
        <div class="hq-card">HQ error: <b>${esc(reason)}</b></div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    const fkRaw = d.faction || res._raw?.faction || "";
    const fk = _canonFaction(fkRaw) || String(fkRaw || "").toLowerCase();

    applyHqBg(fk);
    applyHQTheme(fk);

    try {
      if (fk) localStorage.setItem("ah_faction", fk);
      window.Influence?.setFaction?.(fk);
      window.renderFactionBadge?.();
    } catch (_) { }

    const tre = d.treasury || {};
    const bones = Number(tre.bones || 0);
    const scrap = Number(tre.scrap || 0);
    const feed = Array.isArray(d.feed) ? d.feed : [];
    const contributors = _recentContributors(feed, 6);

    const curLevel = parseInt(d.level || 1, 10) || 1;
    const nextLevel = curLevel + 1;

    const nextCost = d.nextUpgradeCost || {};
    const needBones = parseInt(nextCost.bones || 0, 10) || 0;
    const needScrap = parseInt(nextCost.scrap || 0, 10) || 0;
    const canUpgrade = (bones >= needBones) && (scrap >= needScrap);

    const bonesPct = pct(bones, needBones);
    const scrapPct = pct(scrap, needScrap);
    const bonesLeft = Math.max(0, needBones - bones);
    const scrapLeft = Math.max(0, needScrap - scrap);

    const dbgLine = _dbg ? `
      <div class="hq-sub" style="margin-top:8px;opacity:.72;">
        uid …${_uidTail()} • faction <b>${esc(String(fk || ""))}</b>
      </div>
    ` : "";

    _root.innerHTML = `
      <div class="hq-head">
        <div class="hq-topline">
          <div class="hq-pill">HQ • ${esc(factionShort(fk))}</div>
          <div class="hq-status-chip ${canUpgrade ? "ready" : ""}">
            ${canUpgrade ? "UPGRADE READY" : "FUNDING"}
          </div>
        </div>

        <div class="hq-title">${esc(niceFactionName(fk))}</div>
        <div class="hq-sub">
          Level <b>${num(curLevel)}</b> • Members <b>${num(d.membersCount ?? "—")}</b>
        </div>
        ${dbgLine}

        ${_hqStageHTML(curLevel, fk)}
      </div>

      <div class="hq-grid two">
        <div class="hq-card">
          <div class="hq-card-title">
            <b>Treasury</b>
            <span class="hq-mini">shared vault</span>
          </div>

          <div class="hq-stat-grid">
            <div class="hq-stat">
              <div class="hq-stat-icon">🦴</div>
              <div class="hq-stat-value">${num(bones)}</div>
              <div class="hq-stat-label">Bones</div>
            </div>
            <div class="hq-stat">
              <div class="hq-stat-icon">🔩</div>
              <div class="hq-stat-value">${num(scrap)}</div>
              <div class="hq-stat-label">Scrap</div>
            </div>
          </div>

          <div class="hq-progress">
            <div class="hq-progress-line">
              <div class="hq-progress-head">
                <span>Bones toward Lv ${num(nextLevel)}</span>
                <span>${num(bones)} / ${num(needBones)}</span>
              </div>
              <div class="hq-bar"><span style="width:${bonesPct}%"></span></div>
            </div>

            <div class="hq-progress-line">
              <div class="hq-progress-head">
                <span>Scrap toward Lv ${num(nextLevel)}</span>
                <span>${num(scrap)} / ${num(needScrap)}</span>
              </div>
              <div class="hq-bar"><span style="width:${scrapPct}%"></span></div>
            </div>
          </div>

          <div class="hq-mini" style="margin-top:12px;">
            Remaining: <b>${num(bonesLeft)}</b> 🦴 + <b>${num(scrapLeft)}</b> 🔩
          </div>
        </div>

        <div class="hq-card">
          <div class="hq-card-title">
            <b>Upgrade HQ</b>
            <span class="hq-mini">community build</span>
          </div>

          <div class="hq-mini">
            Next level: <b>${num(nextLevel)}</b><br/>
            Cost: <b>${num(needBones)}</b> 🦴 + <b>${num(needScrap)}</b> 🔩<br/>
            <span style="opacity:.86;">
              Bonus: +5% influence multiplier per level
              (and daily scrap bonus grows).
            </span>
          </div>

          <div style="margin-top:14px;">
            <button class="hq-btn primary ${canUpgrade ? "pulse" : ""}" onclick="FactionHQ._upgrade()" ${canUpgrade ? "" : "disabled"}>
              Upgrade to Level ${num(nextLevel)}
            </button>
            ${canUpgrade ? `
              <div class="hq-mini" style="margin-top:10px;opacity:.85;">
                Treasury threshold reached — HQ can be upgraded now.
              </div>
            ` : `
              <div class="hq-mini" style="margin-top:10px;opacity:.8;">
                Not enough in treasury yet — donate to push it over the line.
              </div>
            `}
          </div>
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-card-title">
          <b>Donate</b>
          <span class="hq-mini">fuel the HQ</span>
        </div>

        <div class="hq-mini" style="margin-bottom:12px;">
          Donate to the shared faction treasury and help unlock the next level.
        </div>

        <div class="hq-actions">
          <button class="hq-btn" onclick="FactionHQ._donate('bones', 25)">Donate 25 🦴</button>
          <button class="hq-btn" onclick="FactionHQ._donate('bones', 100)">Donate 100 🦴</button>
          <button class="hq-btn" onclick="FactionHQ._donate('scrap', 10)">Donate 10 🔩</button>
          <button class="hq-btn" onclick="FactionHQ._donate('scrap', 50)">Donate 50 🔩</button>
        </div>

        <div style="margin-top:12px;">
          <input id="hqCustomAmt" class="hq-input" inputmode="numeric" placeholder="Custom amount (numbers only)" />
          <div class="hq-actions" style="margin-top:10px;">
            <button class="hq-btn ghost" onclick="FactionHQ._donateCustom('bones')">Custom 🦴</button>
            <button class="hq-btn ghost" onclick="FactionHQ._donateCustom('scrap')">Custom 🔩</button>
          </div>
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-card-title">
          <b>Recent activity</b>
          <button class="hq-btn ghost" style="width:auto;padding:10px 14px;" onclick="FactionHQ.open()">Refresh</button>
        </div>

        <div class="hq-mini" style="margin-bottom:10px;">
          Latest members who helped build the headquarters.
        </div>

        ${
          contributors.length
            ? `
              <div class="hq-contrib-strip">
                ${contributors.map((c) => `
                  <div class="hq-contrib">
                    <div class="hq-contrib-badge">…${esc(c.tail)}</div>
                    <div class="hq-contrib-name">Member</div>
                    <div class="hq-contrib-meta">${esc(_contribSummary(c))}</div>
                  </div>
                `).join("")}
              </div>
            `
            : `
              <div class="hq-contrib-empty">
                No contributors yet — first donations will appear here.
              </div>
            `
        }

        <div class="hq-feed">
          ${feed.length ? feed.map((x) => {
            const who = x.uid ? String(x.uid).slice(-4) : "????";
            const t = fmtTs(x.t);

            if (x.type === "upgrade") {
              const lvl = x.level || "?";
              return `
                <div class="hq-feed-item upgrade">
                  <b>⬆️ HQ upgraded</b> <span class="hq-mini">(Lv ${esc(lvl)})</span><br/>
                  <span class="hq-mini">by …${esc(who)} • ${esc(t)}</span>
                </div>
              `;
            }

            const amt = Number(x.amount || 0);
            const asset = String(x.asset || "");
            const icon = asset === "bones" ? "🦴" : (asset === "scrap" ? "🔩" : "•");

            return `
              <div class="hq-feed-item">
                <b>${icon} ${num(amt)}</b> to treasury <span class="hq-mini">(${esc(asset)})</span><br/>
                <span class="hq-mini">from …${esc(who)} • ${esc(t)}</span>
              </div>
            `;
          }).join("") : `
            <div class="hq-feed-item hq-mini">No activity yet.</div>
          `}
        </div>
      </div>

      <button class="hq-btn ghost" onclick="FactionHQ.close()">Close</button>
    `;
  }

  // ---------------------------
  // Actions
  // ---------------------------
  async function _donate(asset, amount) {
    if (!_apiPost) return;
    const run_id = _rid("hq:donate");

    try {
      const r = await _apiPost("/webapp/faction/hq/donate", { asset, amount, run_id });
      if (r && r.ok) {
        try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) { }
        await render();
        return;
      }
      alert((r && r.reason) ? `Donate failed: ${r.reason}` : "Donate failed.");
    } catch (e) {
      alert("Donate failed.");
    }
  }

  async function _donateCustom(asset) {
    const el = document.getElementById("hqCustomAmt");
    const n = parseInt((el && el.value) || "0", 10) || 0;
    if (n <= 0) return alert("Enter amount.");
    return _donate(asset, n);
  }
  function _toggleFeed() {
  _feedExpanded = !_feedExpanded;
  render();
  }

  async function _upgrade() {
    if (!_apiPost) return;
    const run_id = _rid("hq:upgrade");

    try {
      const r = await _apiPost("/webapp/faction/hq/upgrade", { run_id });

      if (r && r.ok) {
        try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) { }
        await render();
        return;
      }

      if (r && r.reason === "INSUFFICIENT") {
        const c = r.cost || {};
        alert(`Not enough in treasury.\nNeed: ${c.bones || 0} bones + ${c.scrap || 0} scrap`);
        return;
      }

      alert((r && r.reason) ? `Upgrade failed: ${r.reason}` : "Upgrade failed.");
    } catch (e) {
      alert("Upgrade failed.");
    }
  }

  // ---------------------------
  // Init
  // ---------------------------
  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    log("init ok");
    _prefetchBgs();
  }

  window.FactionHQ = {
    init,
    open,
    close,
    _donate,
    _donateCustom,
    _upgrade,
    _toggleFeed,
    applyHqBg
  };
})();
