// js/faction_hq.js — Faction HQ (Alpha Husky WebApp) — Premium HQ mockup version
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _back = null;   // #factionHQBack
  let _modal = null;  // #factionHQModal
  let _root = null;   // #factionHQRoot

  let _feedExpanded = false;
  let _supportCustomExpanded = false;

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

  function timeAgo(t) {
    const ts = Number(t || 0);
    if (!ts) return "";
    const sec = Math.max(0, Math.floor(Date.now() / 1000) - ts);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function rankLabel(rank) {
    const n = Number(rank || 0);
    return n > 0 ? `#${num(n)}` : "Unranked";
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

function _contribSummaryLegacy(c) {
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

  function _contribSummary(c) {
    if (!c) return "";
    if (c.upgrades > 0) return `Upgrades ${c.upgrades}`;
    if (c.bones > 0 && c.scrap > 0) return `${num(c.bones)} bones / ${num(c.scrap)} scrap`;
    if (c.bones > 0) return `${num(c.bones)} bones`;
    if (c.scrap > 0) return `${num(c.scrap)} scrap`;
    return `${num(c.actions)} actions`;
  }

  const FACTION_HOME_META = {
    rogue_byte: {
      motto: "Break the line. Own the static.",
      summary: "Fast-hit operators built around sabotage, tempo, and sudden openings.",
      belonging: "Best for players who like striking first, breaking rhythm, and keeping enemy plans unstable.",
      tags: ["Sabotage", "Tempo", "Disruption", "Shock"],
    },
    echo_wardens: {
      motto: "Hold the signal. Hold the line.",
      summary: "Route keepers who turn support play, control, and patience into durable faction ground.",
      belonging: "Best for players who like anchoring lanes, reinforcing allies, and winning through control.",
      tags: ["Control", "Defense", "Guard", "Stability"],
    },
    pack_burners: {
      motto: "Light it. Spread it. Keep it moving.",
      summary: "Momentum faction for players who stack pressure, donate hard, and turn noise into presence.",
      belonging: "Best for players who like swarm energy, shared pushes, and feeding the wider faction wave.",
      tags: ["Swarm", "Pressure", "Momentum", "Chaos"],
    },
    inner_howl: {
      motto: "Strike clean. Stay cold.",
      summary: "Precision operators built for disciplined pressure, clean timing, and steady takeover.",
      belonging: "Best for players who like measured play, exact execution, and long-game dominance.",
      tags: ["Precision", "Discipline", "Control", "Relentless"],
    },
  };

  function factionHomeMeta(key) {
    return FACTION_HOME_META[_canonFaction(key)] || {
      motto: "Stand together.",
      summary: "Your faction is the home layer behind the wider conflict.",
      belonging: "Belonging here means your actions build alongside everyone else under the same banner.",
      tags: ["Faction", "Identity"],
    };
  }

  function renderMetricRow(label, value, note = "") {
    return `
      <div class="hq-metric-row">
        <div class="hq-metric-copy">
          <div class="hq-metric-label">${esc(label)}</div>
          ${note ? `<div class="hq-metric-note">${esc(note)}</div>` : ``}
        </div>
        <div class="hq-metric-value">${esc(value)}</div>
      </div>
    `;
  }

  function renderTags(tags) {
    const rows = Array.isArray(tags) ? tags.filter(Boolean).slice(0, 4) : [];
    if (!rows.length) return "";
    return `
      <div class="hq-tag-row">
        ${rows.map((tag) => `<span class="hq-tag">${esc(tag)}</span>`).join("")}
      </div>
    `;
  }

  function renderSpotlightRows(social) {
    const top = Array.isArray(social?.topContributors) ? social.topContributors : [];
    const notable = Array.isArray(social?.notableMembers) ? social.notableMembers : [];

    if (top.length) {
      return {
        kicker: "Most active this week",
        rows: top.map((row, idx) => `
          <div class="hq-spotlight-item">
            <div class="hq-rank-badge">#${idx + 1}</div>
            <div class="hq-spotlight-main">
              <div class="hq-spotlight-name">${esc(row.name || "Member")}${row.isYou ? ` <span class="hq-you-pill">YOU</span>` : ``}</div>
              <div class="hq-spotlight-sub">Score ${num(row.score || 0)}${row.rank ? ` | faction ${rankLabel(row.rank)}` : ``}</div>
            </div>
          </div>
        `).join(""),
      };
    }

    if (notable.length) {
      return {
        kicker: "Known names inside the faction",
        rows: notable.map((row, idx) => `
          <div class="hq-spotlight-item">
            <div class="hq-rank-badge">${idx + 1}</div>
            <div class="hq-spotlight-main">
              <div class="hq-spotlight-name">${esc(row.name || "Member")}</div>
              <div class="hq-spotlight-sub">Level ${num(row.level || 1)}</div>
            </div>
          </div>
        `).join(""),
      };
    }

    return {
      kicker: "Faction circle",
      rows: `<div class="hq-contrib-empty">More member activity will surface here as the faction fills out.</div>`,
    };
  }

  function renderFactionCircle(social, myPlace, myContribution) {
    const top = Array.isArray(social?.topContributors) ? social.topContributors.slice(0, 3) : [];
    const notable = Array.isArray(social?.notableMembers) ? social.notableMembers.slice(0, 3) : [];
    const topHasYou = top.some((row) => !!row?.isYou);
    const myScore = Number(myContribution?.weeklyScore || myPlace?.weeklyScore || 0);
    const myRank = Number(myPlace?.factionRank || 0);
    const myName = myPlace?.name || "You";

    if (top.length) {
      const topHtml = top.map((row, idx) => `
        <div class="hq-circle-rank-card ${row.isYou ? "is-you" : ""}" data-rank="${idx + 1}">
          <div class="hq-circle-rank-head">
            <span class="hq-circle-rank-pill">#${idx + 1}</span>
            ${row.isYou ? `<span class="hq-you-pill">YOU</span>` : ``}
          </div>
          <div class="hq-circle-rank-name">${esc(row.name || "Member")}</div>
          <div class="hq-circle-rank-score">${num(row.score || 0)}</div>
          <div class="hq-circle-rank-meta">${row.rank ? `Faction ${rankLabel(row.rank)}` : "Faction contributor"}</div>
        </div>
      `).join("");

      const currentPlayerHtml = topHasYou
        ? `<div class="hq-circle-you-band is-top3">You are visible inside this week's Top 3.</div>`
        : ((myRank > 0 || myScore > 0) ? `
          <div class="hq-circle-you-band">
            <div class="hq-circle-you-copy">
              <div class="hq-circle-you-label">Your line in the faction</div>
              <div class="hq-circle-you-name">${esc(myName)}</div>
            </div>
            <div class="hq-circle-you-stats">
              <div class="hq-circle-you-rank">${esc(rankLabel(myRank))}</div>
              <div class="hq-circle-you-score">${num(myScore)}</div>
            </div>
          </div>
        ` : ``);

      return `
        <div class="hq-circle-topline">Top 3 this week</div>
        <div class="hq-circle-grid">${topHtml}</div>
        ${currentPlayerHtml}
      `;
    }

    if (notable.length) {
      return `
        <div class="hq-circle-topline">Known names inside the faction</div>
        <div class="hq-spotlight">
          ${notable.map((row, idx) => `
            <div class="hq-spotlight-item">
              <div class="hq-rank-badge">${idx + 1}</div>
              <div class="hq-spotlight-main">
                <div class="hq-spotlight-name">${esc(row.name || "Member")}</div>
                <div class="hq-spotlight-sub">Level ${num(row.level || 1)}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    return `<div class="hq-contrib-empty">Faction names will surface here as weekly activity starts to build.</div>`;
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

      #factionHQRoot .hq-motto{
        margin-top:6px;
        font-size:15px;
        font-weight:900;
        letter-spacing:.2px;
        color:color-mix(in srgb, var(--faction-color) 55%, white);
      }

      #factionHQRoot .hq-identity{
        margin-top:8px;
        opacity:.88;
        font-size:13px;
        line-height:1.45;
        max-width:44ch;
      }

      #factionHQRoot .hq-tag-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:12px;
      }

      #factionHQRoot .hq-tag{
        display:inline-flex;
        align-items:center;
        min-height:28px;
        padding:0 11px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        letter-spacing:.2px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.12);
      }

      #factionHQRoot .hq-head-strip{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:12px;
      }

      #factionHQRoot .hq-chip{
        display:inline-flex;
        align-items:center;
        gap:6px;
        min-height:30px;
        padding:0 11px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.10);
      }

      #factionHQRoot .hq-chip strong{
        font-weight:900;
        color:#fff;
      }

      #factionHQRoot .hq-role-pill{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:42px;
        padding:0 16px;
        border-radius:999px;
        font-size:16px;
        font-weight:900;
        letter-spacing:.2px;
        color:#081018;
        background:linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 82%, white), var(--faction-color));
        box-shadow:0 12px 24px color-mix(in srgb, var(--faction-color) 22%, transparent);
      }

      #factionHQRoot .hq-tone-pill{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:30px;
        padding:0 11px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.3px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.12);
      }
      #factionHQRoot .hq-tone-pill[data-tone="hot"]{
        color:#ffe7cc;
        border-color:rgba(255,122,47,.35);
      }
      #factionHQRoot .hq-tone-pill[data-tone="contested"]{
        color:#ffd7e2;
        border-color:rgba(255,42,109,.35);
      }
      #factionHQRoot .hq-tone-pill[data-tone="fortified"]{
        color:#d4ffe7;
        border-color:rgba(91,255,154,.35);
      }

      #factionHQRoot .hq-kpi-grid{
        display:grid;
        grid-template-columns:repeat(2, minmax(0, 1fr));
        gap:10px;
      }

      #factionHQRoot .hq-kpi{
        border-radius:14px;
        padding:12px;
        background:rgba(0,0,0,.18);
        border:1px solid rgba(255,255,255,.08);
      }

      #factionHQRoot .hq-kpi-label{
        font-size:11px;
        font-weight:800;
        opacity:.7;
        text-transform:uppercase;
        letter-spacing:.45px;
      }

      #factionHQRoot .hq-kpi-value{
        margin-top:6px;
        font-size:20px;
        line-height:1.05;
        font-weight:900;
      }

      #factionHQRoot .hq-note{
        margin-top:12px;
        padding:11px 12px;
        border-radius:14px;
        background:rgba(255,255,255,.045);
        border:1px solid rgba(255,255,255,.08);
        font-size:13px;
        line-height:1.45;
      }

      #factionHQRoot .hq-divider{
        height:1px;
        margin:14px 0;
        background:linear-gradient(90deg, transparent, rgba(255,255,255,.10), transparent);
      }

      #factionHQRoot .hq-metric-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        padding:10px 0;
        border-bottom:1px solid rgba(255,255,255,.08);
      }
      #factionHQRoot .hq-metric-row:last-child{
        border-bottom:0;
        padding-bottom:0;
      }

      #factionHQRoot .hq-metric-copy{
        min-width:0;
        flex:1;
      }

      #factionHQRoot .hq-metric-label{
        font-size:13px;
        font-weight:800;
      }

      #factionHQRoot .hq-metric-note{
        margin-top:3px;
        font-size:12px;
        opacity:.7;
        line-height:1.35;
      }

      #factionHQRoot .hq-metric-value{
        font-size:14px;
        font-weight:900;
        text-align:right;
        white-space:nowrap;
      }

      #factionHQRoot .hq-spotlight{
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      #factionHQRoot .hq-spotlight-item{
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 12px;
        border-radius:14px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.08);
      }

      #factionHQRoot .hq-rank-badge{
        width:34px;
        height:34px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:12px;
        font-weight:900;
        background:linear-gradient(180deg, color-mix(in srgb, var(--faction-color) 36%, #1a2030), #0d111b 88%);
        border:1px solid color-mix(in srgb, var(--faction-color) 36%, rgba(255,255,255,.12));
      }

      #factionHQRoot .hq-spotlight-main{
        min-width:0;
        flex:1;
      }

      #factionHQRoot .hq-spotlight-name{
        font-size:13px;
        font-weight:900;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      #factionHQRoot .hq-spotlight-sub{
        margin-top:3px;
        font-size:12px;
        opacity:.72;
        line-height:1.35;
      }

      #factionHQRoot .hq-you-pill{
        display:inline-flex;
        align-items:center;
        padding:1px 6px;
        border-radius:999px;
        font-size:10px;
        font-weight:900;
        letter-spacing:.4px;
        color:#081018;
        background:linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 82%, white), var(--faction-color));
        vertical-align:middle;
      }

      #factionHQRoot .hq-circle-topline{
        margin-bottom:10px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.45px;
        text-transform:uppercase;
        opacity:.72;
      }

      #factionHQRoot .hq-circle-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:9px;
      }

      #factionHQRoot .hq-circle-rank-card{
        padding:12px;
        border-radius:16px;
        background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.035));
        border:1px solid rgba(255,255,255,.10);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 8px 18px rgba(0,0,0,.14);
      }

      #factionHQRoot .hq-circle-rank-card.is-you{
        border-color:color-mix(in srgb, var(--faction-color) 48%, rgba(255,255,255,.12));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.06),
          0 0 0 1px color-mix(in srgb, var(--faction-color) 14%, transparent),
          0 12px 22px rgba(0,0,0,.16);
      }

      #factionHQRoot .hq-circle-rank-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
      }

      #factionHQRoot .hq-circle-rank-pill{
        display:inline-flex;
        align-items:center;
        min-height:28px;
        padding:0 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.12);
      }

      #factionHQRoot .hq-circle-rank-name{
        margin-top:10px;
        font-size:14px;
        font-weight:900;
      }

      #factionHQRoot .hq-circle-rank-score{
        margin-top:6px;
        font-size:24px;
        line-height:1;
        font-weight:950;
      }

      #factionHQRoot .hq-circle-rank-meta{
        margin-top:5px;
        font-size:12px;
        opacity:.72;
      }

      #factionHQRoot .hq-circle-you-band{
        margin-top:12px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:11px 12px;
        border-radius:14px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.08);
      }

      #factionHQRoot .hq-circle-you-band.is-top3{
        justify-content:center;
        font-size:13px;
        font-weight:800;
      }

      #factionHQRoot .hq-circle-you-copy{
        min-width:0;
        flex:1;
      }

      #factionHQRoot .hq-circle-you-label{
        font-size:11px;
        font-weight:900;
        letter-spacing:.38px;
        text-transform:uppercase;
        opacity:.7;
      }

      #factionHQRoot .hq-circle-you-name{
        margin-top:4px;
        font-size:13px;
        font-weight:900;
      }

      #factionHQRoot .hq-circle-you-stats{
        text-align:right;
        white-space:nowrap;
      }

      #factionHQRoot .hq-circle-you-rank{
        font-size:13px;
        font-weight:900;
      }

      #factionHQRoot .hq-circle-you-score{
        margin-top:3px;
        font-size:12px;
        opacity:.72;
      }

      @media (min-width: 560px){
        #factionHQRoot .hq-circle-grid{
          grid-template-columns:repeat(3, minmax(0, 1fr));
        }
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

      #factionHQRoot .hq-actions.compact{
        gap:8px;
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
      #factionHQRoot .hq-btn.mini{
        padding:10px 10px;
        border-radius:12px;
        font-size:13px;
        font-weight:800;
        box-shadow:none;
      }
      #factionHQRoot .hq-btn.subtle{
        background:rgba(255,255,255,.04);
        border-color:rgba(255,255,255,.08);
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

      #factionHQRoot .hq-support-shell{
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      #factionHQRoot .hq-support-blurb{
        font-size:13px;
        line-height:1.45;
        opacity:.84;
      }

      #factionHQRoot .hq-support-need{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }

      #factionHQRoot .hq-support-toggle{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:34px;
        padding:0 12px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.3px;
        color:#fff;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.10);
        cursor:pointer;
      }

      #factionHQRoot .hq-support-inline{
        display:flex;
        flex-direction:column;
        gap:8px;
        padding-top:2px;
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
  _supportCustomExpanded = false;

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
  async function _legacyRender_unused() {
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
const contributors = _recentContributors(feed, 4);
const visibleFeed = _feedExpanded ? feed : feed.slice(0, 3);

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

      <div class="hq-card">
        <div class="hq-card-title">
          <b>HQ Status</b>
          <span class="hq-mini">Lv ${num(curLevel)} → ${num(nextLevel)}</span>
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
          Next level: <b>${num(nextLevel)}</b><br/>
          Cost: <b>${num(needBones)}</b> 🦴 + <b>${num(needScrap)}</b> 🔩<br/>
          Remaining: <b>${num(bonesLeft)}</b> 🦴 + <b>${num(scrapLeft)}</b> 🔩<br/>
          <span style="opacity:.86;">
            Bonus: +5% influence multiplier per level (and daily scrap bonus grows).
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
  ${visibleFeed.length ? visibleFeed.map((x) => {
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

        ${feed.length > 3 ? `
          <div style="margin-top:10px;">
            <button
              class="hq-btn ghost"
              style="width:100%;"
              onclick="FactionHQ._toggleFeed()"
            >
              ${_feedExpanded ? "Show less" : `Show ${feed.length - 3} more`}
            </button>
          </div>
        ` : ``}
      </div>

      <button class="hq-btn ghost" onclick="FactionHQ.close()">Close</button>
    `;
  }

  async function render() {
    if (!_apiPost) {
      _root.innerHTML = `
        <div class="hq-card">API not ready.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    _root.innerHTML = `<div class="hq-card" style="text-align:center;">Loading HQ...</div>`;

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
    const visibleFeed = _feedExpanded ? feed : feed.slice(0, 3);

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

    const membersCount = Number(d.membersCount ?? d.members_count ?? 0);
    const myPlace = d.myPlace || {};
    const myContribution = d.myContribution || {};
    const snapshot = d.snapshot || {};
    const social = d.social || {};
    const meta = factionHomeMeta(fk);
    const factionCircleHTML = renderFactionCircle(social, myPlace, myContribution);
    const highlight = snapshot.recentHighlight || {};
    const contributionSupportNote = Number(myContribution.hqDonationCount || 0) > 0
      ? `HQ support sent: ${num(myContribution.hqBonesDonated || 0)} bones and ${num(myContribution.hqScrapDonated || 0)} scrap across ${num(myContribution.hqDonationCount || 0)} drops.`
      : "HQ support has not started from your side yet. Treasury donations show up here as soon as you send them.";
    const supportNeedBones = Math.max(0, needBones - bones);
    const supportNeedScrap = Math.max(0, needScrap - scrap);
    const highlightHTML = highlight.text
      ? `<div class="hq-note"><b>Latest:</b> ${esc(highlight.text)}${highlight.ts ? ` <span class="hq-mini">(${esc(timeAgo(highlight.ts))})</span>` : ``}</div>`
      : `<div class="hq-note">${esc(snapshot.momentumSummary || "Faction movement will surface here when the world state picks up.")}</div>`;

    const dbgLine = _dbg ? `
      <div class="hq-sub" style="margin-top:8px;opacity:.72;">
        uid ...${_uidTail()} | faction <b>${esc(String(fk || ""))}</b>
      </div>
    ` : "";

    _root.innerHTML = `
      <div class="hq-head">
        <div class="hq-topline">
          <div class="hq-pill">HQ | ${esc(factionShort(fk))}</div>
          <div class="hq-status-chip ${canUpgrade ? "ready" : ""}">
            ${canUpgrade ? "UPGRADE READY" : "TREASURY BUILD"}
          </div>
        </div>

        <div class="hq-title">${esc(niceFactionName(fk))}</div>
        <div class="hq-motto">${esc(meta.motto)}</div>
        <div class="hq-identity">${esc(meta.summary)}</div>
        <div class="hq-identity">${esc(meta.belonging)}</div>
        ${renderTags(meta.tags)}
        <div class="hq-head-strip">
          <div class="hq-chip">Role <strong>${esc(myPlace.role || "Scout")}</strong></div>
          <div class="hq-chip">Standing <strong>${esc(myPlace.rankBand || "Faction member")}</strong></div>
          <div class="hq-chip">Members <strong>${num(membersCount)}</strong></div>
        </div>
        ${dbgLine}

        ${_hqStageHTML(curLevel, fk)}
      </div>

      <div class="hq-grid two">
        <div class="hq-card">
          <div class="hq-card-title">
            <b>Faction Circle</b>
            <span class="hq-mini">Top 3 this week</span>
          </div>

          <div class="hq-note" style="margin-top:0;">
            Faces carrying the faction right now, with your own line kept in view.
          </div>
          <div style="margin-top:12px;">
            ${factionCircleHTML}
          </div>
        </div>

        <div class="hq-card">
          <div class="hq-card-title">
            <b>My Place</b>
            <span class="hq-mini">${esc(myPlace.rankBand || "Faction member")}</span>
          </div>

          <div class="hq-role-pill">${esc(myPlace.role || "Scout")}</div>
          <div class="hq-note">${esc(myPlace.status || "You are part of the faction network.")}</div>

          <div class="hq-kpi-grid" style="margin-top:12px;">
            <div class="hq-kpi">
              <div class="hq-kpi-label">Weekly score</div>
              <div class="hq-kpi-value">${num(myPlace.weeklyScore || 0)}</div>
            </div>
            <div class="hq-kpi">
              <div class="hq-kpi-label">Faction rank</div>
              <div class="hq-kpi-value">${esc(rankLabel(myPlace.factionRank))}</div>
            </div>
            <div class="hq-kpi">
              <div class="hq-kpi-label">Overall rank</div>
              <div class="hq-kpi-value">${esc(rankLabel(myPlace.overallRank))}</div>
            </div>
            <div class="hq-kpi">
              <div class="hq-kpi-label">Player level</div>
              <div class="hq-kpi-value">${num(myPlace.level || 1)}</div>
            </div>
          </div>

          <div class="hq-note">${myPlace.qualified ? "Weekly reward threshold is active for you right now." : "Current standing is built from live faction activity and HQ support."}</div>
        </div>

        <div class="hq-card">
          <div class="hq-card-title">
            <b>My Contribution</b>
            <span class="hq-mini">${num(myContribution.activeDays || 0)} active days</span>
          </div>

          ${renderMetricRow("Weekly influence", num(myContribution.weeklyScore || 0), "Live score from patrols, donations, and siege play.")}
          ${renderMetricRow("Patrol impact", num(myContribution.patrolScore || 0))}
          ${renderMetricRow("Donation impact", num(myContribution.donateScore || 0))}
          ${renderMetricRow("Siege impact", num(myContribution.siegeScore || 0))}
          ${renderMetricRow("HQ support", `${num(myContribution.hqDonationCount || 0)} drops`, myContribution.lastDonationAt ? `Last support ${timeAgo(myContribution.lastDonationAt)}` : "")}

          <div class="hq-note">${esc(contributionSupportNote)}</div>
        </div>

        <div class="hq-card">
          <div class="hq-card-title">
            <b>Faction Snapshot</b>
            <span class="hq-tone-pill" data-tone="${esc(snapshot.momentumTone || "calm")}">${esc(snapshot.momentumLabel || "Building presence")}</span>
          </div>

          <div class="hq-kpi-grid">
            <div class="hq-kpi">
              <div class="hq-kpi-label">Controlled</div>
              <div class="hq-kpi-value">${num(snapshot.controlledNodes || 0)}</div>
            </div>
            <div class="hq-kpi">
              <div class="hq-kpi-label">Pressure</div>
              <div class="hq-kpi-value">${num(snapshot.pressureNodes || 0)}</div>
            </div>
            <div class="hq-kpi">
              <div class="hq-kpi-label">Contested</div>
              <div class="hq-kpi-value">${num(snapshot.contestedPresence || 0)}</div>
            </div>
            <div class="hq-kpi">
              <div class="hq-kpi-label">Live sieges</div>
              <div class="hq-kpi-value">${num(snapshot.activeSieges || 0)}</div>
            </div>
          </div>

          ${highlightHTML}
        </div>
      </div>

      <div class="hq-grid two">
        <div class="hq-card">
        <div class="hq-card-title">
          <b>HQ Status</b>
          <span class="hq-mini">Lv ${num(curLevel)} -> ${num(nextLevel)}</span>
        </div>

        <div class="hq-stat-grid">
          <div class="hq-stat">
            <div class="hq-stat-value">${num(bones)}</div>
            <div class="hq-stat-label">Bones</div>
          </div>
          <div class="hq-stat">
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
          Next level: <b>${num(nextLevel)}</b><br/>
          Cost: <b>${num(needBones)}</b> bones + <b>${num(needScrap)}</b> scrap<br/>
          Remaining: <b>${num(bonesLeft)}</b> bones + <b>${num(scrapLeft)}</b> scrap<br/>
          <span style="opacity:.86;">
            Bonus: +5% influence multiplier per level (and daily scrap bonus grows).
          </span>
        </div>

        <div style="margin-top:14px;">
          <button class="hq-btn primary ${canUpgrade ? "pulse" : ""}" onclick="FactionHQ._upgrade()" ${canUpgrade ? "" : "disabled"}>
            Upgrade to Level ${num(nextLevel)}
          </button>

          ${canUpgrade ? `
            <div class="hq-mini" style="margin-top:10px;opacity:.85;">
              Treasury threshold reached. HQ can be upgraded now.
            </div>
          ` : `
            <div class="hq-mini" style="margin-top:10px;opacity:.8;">
              Treasury is still building. Donations push it over the line.
            </div>
          `}
        </div>
        </div>

        <div class="hq-card">
          <div class="hq-card-title">
            <b>Support HQ</b>
            <span class="hq-mini">calm, shared boosts</span>
          </div>

          <div class="hq-support-shell">
            <div class="hq-support-blurb">
              Small treasury support for HQ progression. Mission objectives stay in Broken Contracts.
            </div>

            <div class="hq-support-need">
              <div class="hq-chip">Need <strong>${num(supportNeedBones)}</strong> bones</div>
              <div class="hq-chip">Need <strong>${num(supportNeedScrap)}</strong> scrap</div>
            </div>

            <div class="hq-actions compact">
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('bones', 25)">+25 Bones</button>
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('bones', 100)">+100 Bones</button>
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('scrap', 10)">+10 Scrap</button>
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('scrap', 50)">+50 Scrap</button>
            </div>

            <div>
              <button class="hq-support-toggle" onclick="FactionHQ._toggleSupportCustom()">
                ${_supportCustomExpanded ? "Hide custom support" : "Custom support"}
              </button>
            </div>

            ${_supportCustomExpanded ? `
              <div class="hq-support-inline">
                <input id="hqCustomAmt" class="hq-input" inputmode="numeric" placeholder="Custom amount" />
                <div class="hq-actions compact">
                  <button class="hq-btn mini ghost" onclick="FactionHQ._donateCustom('bones')">Send Bones</button>
                  <button class="hq-btn mini ghost" onclick="FactionHQ._donateCustom('scrap')">Send Scrap</button>
                </div>
              </div>
            ` : ``}
          </div>
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-card-title">
          <b>HQ Build Log</b>
          <button class="hq-btn ghost" style="width:auto;padding:10px 14px;" onclick="FactionHQ.open()">Refresh</button>
        </div>

        <div class="hq-mini" style="margin-bottom:10px;">
          Recent HQ support and upgrade moments.
        </div>

        <div class="hq-feed">
          ${visibleFeed.length ? visibleFeed.map((x) => {
            const who = x.uid ? String(x.uid).slice(-4) : "????";
            const t = fmtTs(x.t);

            if (x.type === "upgrade") {
              const lvl = x.level || "?";
              return `
                <div class="hq-feed-item upgrade">
                  <b>HQ upgraded</b> <span class="hq-mini">(Lv ${esc(lvl)})</span><br/>
                  <span class="hq-mini">by ...${esc(who)} | ${esc(t)}</span>
                </div>
              `;
            }

            const amt = Number(x.amount || 0);
            const asset = String(x.asset || "");
            const assetLabel = asset === "bones" ? "bones" : (asset === "scrap" ? "scrap" : asset || "support");

            return `
              <div class="hq-feed-item">
                <b>${num(amt)} ${esc(assetLabel)}</b> to treasury<br/>
                <span class="hq-mini">from ...${esc(who)} | ${esc(t)}</span>
              </div>
            `;
          }).join("") : `
            <div class="hq-feed-item hq-mini">No activity yet.</div>
          `}
        </div>

        ${feed.length > 3 ? `
          <div style="margin-top:10px;">
            <button
              class="hq-btn ghost"
              style="width:100%;"
              onclick="FactionHQ._toggleFeed()"
            >
              ${_feedExpanded ? "Show less" : `Show ${feed.length - 3} more`}
            </button>
          </div>
        ` : ``}
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
        _supportCustomExpanded = false;
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
  function _toggleSupportCustom() {
    _supportCustomExpanded = !_supportCustomExpanded;
    render();
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
    _toggleSupportCustom,
    _upgrade,
    _toggleFeed,
    applyHqBg
  };
})();
