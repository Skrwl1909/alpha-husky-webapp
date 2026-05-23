(function (global) {
  const MODAL_ID = "brokenContractsBack";
  const ROOT_ID = "bcRoot";
  const STATUS_ID = "bcStatus";
  const META_ID = "bcMeta";
  const CLOSE_ID = "bcClose";
  const REFRESH_ID = "bcRefresh";

  const ORDER_SORT = {
    faction_patrol_donate: 0,
    missions_medium_plus: 1,
    bones_real_sinks: 2
  };

  const ORDER_BRIEF = {
    faction_patrol_donate: {
      tier: "primary",
      kicker: "Primary Faction Order",
      directive: "Hold Frontline Nodes",
      why: "Patrol and Donate actions on Phantom Nodes are the direct frontline input for this order.",
      impact: "If your faction completes this before reset, qualifying contributors can claim cycle rewards.",
      links: [
        "Map / Phantom Nodes: Patrol and Donate feed this order directly.",
        "CTA + Mailbox: reward-ready prompts route players back here.",
        "Oracle escalation remains a follow-up phase."
      ]
    },
    missions_medium_plus: {
      tier: "secondary",
      kicker: "Secondary Order",
      directive: "Sustain Mission Pressure",
      why: "Mission throughput keeps faction activity active across the whole cycle.",
      impact: "Completion unlocks contributor rewards for eligible faction members."
    },
    bones_real_sinks: {
      tier: "secondary",
      kicker: "Secondary Order",
      directive: "Fuel War Economy",
      why: "Real resource spending proves active commitment, not passive holding.",
      impact: "Completion unlocks contributor rewards for eligible faction members."
    }
  };

  const FACTION_ACCENT_RGB = {
    rogue_byte: "109,116,255",
    echo_wardens: "98,225,188",
    pack_burners: "255,132,84",
    inner_howl: "212,150,255"
  };

  const S = {
    apiPost: null,
    tg: null,
    dbg: null,
    state: null,
    hideObserver: null
  };

  function el(id) {
    return document.getElementById(id);
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rid(prefix, key) {
    if (typeof global.AH_makeRunId === "function") return global.AH_makeRunId(prefix, key);
    const uid = String(global.Telegram?.WebApp?.initDataUnsafe?.user?.id || "0");
    return `${prefix}:${uid}:${String(key || "").slice(0, 48)}:${Date.now()}`;
  }

  function fmtReset(sec) {
    const total = Math.max(0, Number(sec || 0) | 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function assetLabel(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function rewardChips(reward) {
    const personal = reward?.personal && typeof reward.personal === "object" ? reward.personal : {};
    return Object.entries(personal)
      .filter(([, value]) => Number(value || 0) > 0)
      .map(([key, value]) => ({
        key,
        label: assetLabel(key),
        value: Number(value || 0)
      }));
  }

  function normalizeFaction(v) {
    const raw = String(v || "").trim().toLowerCase();
    const map = {
      rb: "rogue_byte",
      rogue_byte: "rogue_byte",
      ew: "echo_wardens",
      echo_wardens: "echo_wardens",
      pb: "pack_burners",
      pack_burners: "pack_burners",
      ih: "inner_howl",
      inner_howl: "inner_howl"
    };
    return map[raw] || raw;
  }

  function factionCode(v) {
    const fk = normalizeFaction(v);
    const map = {
      rogue_byte: "RB",
      echo_wardens: "EW",
      pack_burners: "PB",
      inner_howl: "IH"
    };
    return map[fk] || String(v || "").slice(0, 4).toUpperCase() || "----";
  }

  function factionAccentRgb(v) {
    const fk = normalizeFaction(v);
    return FACTION_ACCENT_RGB[fk] || "126,231,135";
  }

  function factionToneClass(v) {
    const fk = normalizeFaction(v);
    if (fk === "rogue_byte") return "is-rb";
    if (fk === "echo_wardens") return "is-ew";
    if (fk === "pack_burners") return "is-pb";
    if (fk === "inner_howl") return "is-ih";
    return "";
  }

  function ensureRivalryVisualStyles() {
    if (typeof global.AH_ensureRivalryVisualStyles === "function") {
      global.AH_ensureRivalryVisualStyles();
      return;
    }

    global.AH_ensureRivalryVisualStyles = function AH_ensureRivalryVisualStyles() {
      if (document.getElementById("ah-rivalry-visual-mvp-css")) return;

      const style = document.createElement("style");
      style.id = "ah-rivalry-visual-mvp-css";
      style.textContent = `
        .ah-rivalry-layer{
          --rv-accent-rgb:126,231,135;
          --rv-accent:rgb(var(--rv-accent-rgb));
          --rv-surface-border:rgba(255,255,255,.12);
          --rv-chip-bg:rgba(255,255,255,.055);
          --rv-chip-border:rgba(255,255,255,.14);
          --rv-chip-color:#dce8f7;
        }
        .ah-rivalry-layer .rv-kicker{
          font-size:10px;
          letter-spacing:.11em;
          text-transform:uppercase;
          font-weight:800;
          color:rgba(226,239,255,.74);
        }
        .ah-rivalry-layer .rv-surface{
          border-radius:14px;
          border:1px solid var(--rv-surface-border);
          background:
            linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.028));
          box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
        }
        .ah-rivalry-layer .rv-surface-hero{
          border-color:rgba(var(--rv-accent-rgb), .36);
          background:
            radial-gradient(circle at 90% 8%, rgba(var(--rv-accent-rgb), .16), transparent 45%),
            linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
        }
        .ah-rivalry-layer .rv-chip-row{
          display:flex;
          flex-wrap:wrap;
          gap:6px;
        }
        .ah-rivalry-layer .rv-chip{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          min-height:24px;
          padding:4px 9px;
          border-radius:999px;
          font-size:10px;
          line-height:1;
          letter-spacing:.05em;
          font-weight:800;
          text-transform:uppercase;
          color:var(--rv-chip-color);
          background:var(--rv-chip-bg);
          border:1px solid var(--rv-chip-border);
          white-space:nowrap;
        }
        .ah-rivalry-layer .rv-chip.is-live{
          color:#d8ffe8;
          border-color:rgba(105,255,173,.4);
          background:rgba(105,255,173,.12);
        }
        .ah-rivalry-layer .rv-chip.is-hot{
          color:#ffe3d3;
          border-color:rgba(255,129,88,.38);
          background:rgba(255,129,88,.13);
        }
        .ah-rivalry-layer .rv-chip.is-safe{
          color:#d6ecff;
          border-color:rgba(122,188,255,.36);
          background:rgba(122,188,255,.12);
        }
        .ah-rivalry-layer .rv-chip.is-muted{
          opacity:.86;
        }
        .ah-rivalry-layer .rv-track{
          position:relative;
          height:7px;
          border-radius:999px;
          overflow:hidden;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(0,0,0,.36);
        }
        .ah-rivalry-layer .rv-track-fill{
          display:block;
          height:100%;
          border-radius:999px;
          background:linear-gradient(90deg, rgba(var(--rv-accent-rgb), .95), rgba(255,255,255,.72));
          box-shadow:0 0 14px rgba(var(--rv-accent-rgb), .24);
        }
        .ah-rivalry-layer .rv-race-board{
          border-radius:12px;
          border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.03);
          padding:10px;
        }
        .ah-rivalry-layer .rv-race-title{
          font-size:11px;
          font-weight:800;
          text-transform:uppercase;
          letter-spacing:.05em;
          color:#dbe7f7;
        }
        .ah-rivalry-layer .rv-race-lanes{
          margin-top:8px;
          display:grid;
          gap:7px;
        }
        .ah-rivalry-layer .rv-race-lane{
          border-radius:10px;
          border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.03);
          padding:7px 8px;
        }
        .ah-rivalry-layer .rv-race-lane.is-leader{
          border-color:rgba(255,211,127,.38);
          box-shadow:0 0 0 1px rgba(255,211,127,.16) inset;
        }
        .ah-rivalry-layer .rv-race-lane.is-viewer{
          box-shadow:0 0 0 1px rgba(var(--rv-accent-rgb), .24) inset;
        }
        .ah-rivalry-layer .rv-race-lane.is-rb{ --rv-accent-rgb:109,116,255; }
        .ah-rivalry-layer .rv-race-lane.is-ew{ --rv-accent-rgb:98,225,188; }
        .ah-rivalry-layer .rv-race-lane.is-pb{ --rv-accent-rgb:255,132,84; }
        .ah-rivalry-layer .rv-race-lane.is-ih{ --rv-accent-rgb:212,150,255; }
        .ah-rivalry-layer .rv-race-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          font-size:12px;
          font-weight:800;
          color:#ebf4ff;
        }
        .ah-rivalry-layer .rv-race-sub{
          margin-top:4px;
          font-size:10px;
          color:#bed0e7;
          line-height:1.3;
        }
        .ah-rivalry-layer .rv-check-grid{
          margin-top:8px;
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:6px;
        }
        .ah-rivalry-layer .rv-check{
          border-radius:10px;
          border:1px solid rgba(255,255,255,.11);
          background:rgba(255,255,255,.04);
          padding:7px 8px;
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:.05em;
          color:#b8cae1;
        }
        .ah-rivalry-layer .rv-check strong{
          display:block;
          font-size:11px;
          color:#ebf4ff;
          margin-bottom:2px;
        }
        .ah-rivalry-layer .rv-check.is-ready{
          border-color:rgba(105,255,173,.36);
          background:rgba(105,255,173,.1);
          color:#cbf6df;
        }

        #brokenContractsBack .bc-sheet.ah-rivalry-layer{
          border-color:rgba(var(--rv-accent-rgb), .24);
          box-shadow:
            0 22px 50px rgba(0,0,0,.44),
            inset 0 1px 0 rgba(255,255,255,.05),
            0 0 0 1px rgba(var(--rv-accent-rgb), .08);
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-head{
          padding:2px 0 0;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-title{
          font-size:20px;
          letter-spacing:.02em;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-meta{
          font-size:11px;
          color:#c5d7ec;
          opacity:.8;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-statusline{
          font-size:11px;
          letter-spacing:.04em;
          text-transform:uppercase;
          color:#d3e2f4;
          border-color:rgba(var(--rv-accent-rgb), .24);
          background:rgba(var(--rv-accent-rgb), .08);
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-board{
          display:grid;
          gap:14px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-order-hero{
          display:grid;
          gap:8px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-order-kicker{
          padding:0 2px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-card{
          padding:14px;
          gap:10px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-card-head-hero{
          align-items:center;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-card-title{
          font-size:17px;
          line-height:1.18;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-card-desc{
          white-space:normal;
          font-size:12px;
          opacity:.8;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-action-zone{
          display:grid;
          grid-template-columns:minmax(0, 1fr) auto;
          gap:10px;
          padding:9px 10px;
          border-radius:12px;
          border:1px solid rgba(var(--rv-accent-rgb), .26);
          background:rgba(var(--rv-accent-rgb), .08);
          align-items:center;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-action-title{
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:.07em;
          color:#c4d6ec;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-action-note{
          margin-top:4px;
          font-size:12px;
          color:#e7f0fb;
          line-height:1.32;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-action-hint{
          margin-top:6px;
          font-size:11px;
          line-height:1.34;
          color:#c7def6;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-callout,
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-impact{
          border-radius:12px;
          border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.03);
          padding:9px 10px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-callout-title,
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-impact-title{
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:.07em;
          color:#bdd0e8;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-callout-text,
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-impact-text{
          margin-top:5px;
          font-size:12px;
          line-height:1.4;
          color:#deebfb;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-race-context{
          margin-top:8px;
          font-size:11px;
          color:#c4d6ec;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-race-mini{
          margin-top:6px;
          font-size:11px;
          color:#ccddf2;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-reward-tracker{
          padding:10px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-reward-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          flex-wrap:wrap;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-reward-title{
          font-size:11px;
          text-transform:uppercase;
          letter-spacing:.07em;
          font-weight:800;
          color:#c4d7ec;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-row{
          font-size:11px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-row-percent{
          font-size:10px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-bar{
          height:8px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-fill{
          box-shadow:0 0 14px rgba(var(--rv-accent-rgb), .2);
          background:linear-gradient(90deg, rgba(var(--rv-accent-rgb), .95), rgba(255,255,255,.76));
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-fill.is-contrib{
          background:linear-gradient(90deg, rgba(255,255,255,.24), rgba(var(--rv-accent-rgb), .95));
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-rewards{
          margin-top:7px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-chip{
          border-color:rgba(var(--rv-accent-rgb), .26);
          background:rgba(var(--rv-accent-rgb), .08);
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-badge{
          min-height:30px;
          padding:0 12px;
          font-size:10px;
          letter-spacing:.06em;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-claim{
          min-width:118px;
          min-height:34px;
          border-radius:12px;
          border:1px solid rgba(var(--rv-accent-rgb), .52);
          background:linear-gradient(180deg, rgba(var(--rv-accent-rgb), .32), rgba(var(--rv-accent-rgb), .18));
          color:#f7fbff;
          font-weight:900;
          letter-spacing:.03em;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-links{
          display:grid;
          gap:6px;
          margin-top:2px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-link-line{
          border-radius:10px;
          border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.03);
          padding:7px 8px;
          font-size:11px;
          color:#cad9ed;
          line-height:1.35;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-secondary-head{
          font-size:11px;
          text-transform:uppercase;
          letter-spacing:.08em;
          color:#bbcee4;
          opacity:.9;
          padding:0 2px;
        }
        #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-secondary-grid{
          display:grid;
          gap:10px;
        }

        @media (max-width: 640px){
          #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-action-zone{
            grid-template-columns:minmax(0, 1fr);
          }
          #brokenContractsBack .bc-sheet.ah-rivalry-layer .bc-action-note{
            font-size:11px;
          }
          #brokenContractsBack .bc-sheet.ah-rivalry-layer .rv-check-grid{
            grid-template-columns:1fr;
          }
        }
      `;
      document.head.appendChild(style);
    };

    global.AH_ensureRivalryVisualStyles();
  }

  function applyRivalrySkin(data) {
    const back = el(MODAL_ID);
    const sheet = back ? back.querySelector(".bc-sheet") : null;
    if (!sheet) return;

    const accentRgb = factionAccentRgb(data?.myFaction || data?.myFactionCode);
    sheet.classList.add("ah-rivalry-layer", "rv-orders-board");
    sheet.style.setProperty("--rv-accent-rgb", accentRgb);
  }

  function pct(value, goal) {
    const g = Math.max(1, Number(goal || 0));
    const v = Math.max(0, Number(value || 0));
    return Math.max(0, Math.min(100, Math.round((v / g) * 100)));
  }

  function metrics(contract) {
    const factionProgress = Number(contract?.myFactionProgress || 0);
    const goal = Math.max(1, Number(contract?.goal || 0));
    const myContribution = Number(contract?.myContribution || 0);
    const minContribution = Math.max(1, Number(contract?.minPersonalContribution || 0));
    return {
      factionProgress,
      goal,
      myContribution,
      minContribution,
      factionPct: pct(factionProgress, goal),
      contributionPct: pct(myContribution, minContribution)
    };
  }

  function statusUi(contract) {
    const claimable = !!contract?.claimable;
    const claimed = Number(contract?.myClaimedAt || 0) > 0;
    const pending = !!contract?.claimPending;

    const m = metrics(contract);
    const hasAnyProgress = m.factionProgress > 0 || m.myContribution > 0;
    const factionDone = m.factionProgress >= m.goal;
    const myDone = m.myContribution >= m.minContribution;

    if (claimable) {
      return {
        mode: "button",
        label: "Claim",
        cls: "primary bc-claim",
        disabled: false
      };
    }
    if (claimed) return { mode: "badge", label: "Claimed", cls: "is-claimed" };
    if (pending) return { mode: "badge", label: "Pending", cls: "is-pending" };
    if (factionDone && myDone) return { mode: "badge", label: "Ready", cls: "is-ready" };
    if (hasAnyProgress) return { mode: "badge", label: "In Progress", cls: "is-progress" };
    return { mode: "badge", label: "Locked", cls: "is-locked" };
  }

  function statusToneClass(ui) {
    const cls = String(ui?.cls || "");
    if (cls.includes("is-claimed")) return "is-safe";
    if (cls.includes("is-ready")) return "is-live";
    if (cls.includes("is-progress")) return "is-live";
    if (cls.includes("is-pending")) return "is-hot";
    if (cls.includes("is-locked")) return "is-muted";
    return "is-muted";
  }

  function raceStateLabel(race) {
    if (!race) return "Observer";
    if (race.status === "leading") return "Leading";
    if (race.status === "tied") return "Tied";
    if (race.status === "behind") return "Chasing";
    return "Observer";
  }

  function raceStateTone(race) {
    if (!race) return "is-muted";
    if (race.status === "leading") return "is-live";
    if (race.status === "tied") return "is-hot";
    if (race.status === "behind") return "is-muted";
    return "is-muted";
  }

  function renderBadgeOrButton(contract, opts = {}) {
    const badgeOnly = !!opts.badgeOnly;
    const ui = statusUi(contract);
    if (ui.mode === "button" && !badgeOnly) {
      return `
        <button
          class="btn ${esc(ui.cls || "")}"
          type="button"
          data-bc-claim="${esc(contract?.id || "")}"
          ${ui.disabled ? "disabled" : ""}
        >${esc(ui.label)}</button>
      `;
    }
    const badgeLabel = (badgeOnly && ui.mode === "button") ? "Ready" : ui.label;
    return `<span class="bc-badge ${esc(ui.cls || "")} rv-chip ${esc(statusToneClass(ui))}">${esc(badgeLabel)}</span>`;
  }

  function setStatus(text) {
    const node = el(STATUS_ID);
    if (node) node.textContent = text || "";
  }

  function setMeta(data) {
    const node = el(META_ID);
    if (!node) return;
    const faction = data?.myFactionCode || factionCode(data?.myFaction) || "----";
    const dayKey = data?.dayKey || "-";
    node.textContent = `Faction ${faction} orders | reset in ${fmtReset(data?.secondsToReset)} | cycle ${dayKey}`;
  }

  function renderLoading(msg) {
    setStatus(msg || "Loading faction war orders...");
    setMeta(null);
    const root = el(ROOT_ID);
    if (root) root.innerHTML = `<div class="bc-empty">${esc(msg || "Loading faction war orders...")}</div>`;
  }

  function renderError(msg) {
    setStatus("Error");
    const root = el(ROOT_ID);
    if (root) {
      root.innerHTML = `<div class="bc-empty" style="color:#ffb4b4;">${esc(msg || "Failed to load faction war orders")}</div>`;
    }
  }

  function syncShellState(open) {
    document.body.classList.toggle("bc-open", !!open);
  }

  function isVisible(node) {
    if (!node) return false;
    if (node.style.display === "none") return false;
    try {
      return window.getComputedStyle(node).display !== "none";
    } catch (_) {
      return true;
    }
  }

  function orderBrief(contract) {
    const id = String(contract?.id || "");
    const base = ORDER_BRIEF[id] || {};
    const tier = base.tier || "secondary";
    return {
      tier,
      kicker: base.kicker || (tier === "primary" ? "Primary Faction Order" : "Secondary Order"),
      directive: base.directive || "Faction Directive",
      why: base.why || "Push faction progress before reset and secure your claim eligibility.",
      impact: base.impact || "Completion unlocks contributor claims for eligible faction members.",
      links: Array.isArray(base.links) ? base.links : []
    };
  }

  function orderPriority(contract) {
    const id = String(contract?.id || "");
    const brief = orderBrief(contract);
    const base = Number.isFinite(ORDER_SORT[id]) ? ORDER_SORT[id] : 999;
    return brief.tier === "primary" ? base - 1000 : base;
  }

  function sortContracts(contracts) {
    return [...contracts].sort((a, b) => {
      const pa = orderPriority(a);
      const pb = orderPriority(b);
      if (pa !== pb) return pa - pb;
      const ga = Number(a?.goal || 0);
      const gb = Number(b?.goal || 0);
      return gb - ga;
    });
  }

  function raceSnapshot(contract, myFaction, myFactionCode) {
    const progressByFaction = contract?.progressByFaction && typeof contract.progressByFaction === "object"
      ? contract.progressByFaction
      : null;
    if (!progressByFaction) return null;

    const table = Object.entries(progressByFaction)
      .map(([faction, value]) => ({
        faction: normalizeFaction(faction),
        value: Math.max(0, Number(value || 0)),
        code: factionCode(faction)
      }))
      .sort((a, b) => b.value - a.value);
    if (!table.length) return null;

    const leader = table[0];
    const topValue = leader.value;
    const topCount = table.filter((row) => row.value === topValue).length;
    const myKey = normalizeFaction(myFaction);
    const myRow = myKey ? table.find((row) => row.faction === myKey) : null;
    const myCode = myFactionCode || (myRow ? myRow.code : "");
    const myValue = myRow ? myRow.value : 0;

    let status = "observer";
    if (myRow) {
      if (myValue === topValue && topCount === 1) status = "leading";
      else if (myValue === topValue) status = "tied";
      else status = "behind";
    }

    return {
      leaderCode: leader.code,
      leaderValue: leader.value,
      myCode: myCode || "",
      myValue,
      gapToLeader: myRow ? Math.max(0, topValue - myValue) : topValue,
      status,
      rows: table.slice(0, 4),
      topValue
    };
  }

  function renderProgress(label, value, goal, fillClass) {
    const percent = pct(value, goal);
    const fill = percent > 0 ? `${fillClass} has-progress` : fillClass;
    return `
      <div class="bc-section">
        <div class="bc-row">
          <span class="bc-row-label">${esc(label)}</span>
          <span class="bc-row-value">${esc(value)}/${esc(goal)}<span class="bc-row-percent">${esc(percent)}%</span></span>
        </div>
        <div class="bc-bar rv-track">
          <div class="${esc(fill)} rv-track-fill" style="width:${esc(percent)}%;"></div>
        </div>
      </div>
    `;
  }

  function renderRewards(contract) {
    const rewards = rewardChips(contract?.reward);
    if (!rewards.length) {
      return `<span class="bc-chip rv-chip is-muted"><span class="bc-chip-key">Reward</span><span class="bc-chip-val">None</span></span>`;
    }
    return rewards.map((reward) => `
      <span class="bc-chip rv-chip is-safe">
        <span class="bc-chip-key">${esc(reward.label)}</span>
        <span class="bc-chip-val">+${esc(reward.value)}</span>
      </span>
    `).join("");
  }

  function renderOrderSignalChips(contract, m, race) {
    const ui = statusUi(contract);
    const brief = orderBrief(contract);
    const factionReady = m.factionProgress >= m.goal;
    const myReady = m.myContribution >= m.minContribution;
    const chips = [
      `<span class="rv-chip ${esc(statusToneClass(ui))}">${esc(ui.label)}</span>`,
      `<span class="rv-chip is-muted">${brief.tier === "primary" ? "Primary order" : "Support order"}</span>`,
      `<span class="rv-chip ${esc(raceStateTone(race))}">${esc(raceStateLabel(race))}</span>`,
      `<span class="rv-chip ${myReady ? "is-live" : "is-muted"}">${myReady ? "Qualified" : "Qualifying"}</span>`,
      `<span class="rv-chip ${factionReady ? "is-live" : "is-hot"}">${factionReady ? "Objective live" : "Pressure rising"}</span>`
    ];
    return chips.join("");
  }

  function renderRewardTracker(contract, m) {
    const ui = statusUi(contract);
    const factionReady = m.factionProgress >= m.goal;
    const myReady = m.myContribution >= m.minContribution;
    const unlocked = ui.mode === "button" || (factionReady && myReady);
    return `
      <div class="bc-reward-tracker rv-surface">
        <div class="bc-reward-head">
          <div class="bc-reward-title">War Rewards</div>
          <span class="rv-chip ${unlocked ? "is-live" : "is-muted"}">${unlocked ? "Ready to claim" : "In progress"}</span>
        </div>
        ${renderProgress("Faction objective", m.factionProgress, m.goal, "bc-fill")}
        ${renderProgress("Contract Contribution", m.myContribution, m.minContribution, "bc-fill is-contrib")}
        <div class="rv-check-grid">
          <div class="rv-check ${factionReady ? "is-ready" : ""}">
            <strong>${factionReady ? "Done" : "Pending"}</strong>
            Faction objective
          </div>
          <div class="rv-check ${myReady ? "is-ready" : ""}">
            <strong>${myReady ? "Done" : "Pending"}</strong>
            Contract contribution
          </div>
        </div>
        <div class="bc-rewards">${renderRewards(contract)}</div>
      </div>
    `;
  }

  function renderRace(contract, data, compact, snap = null) {
    const race = snap || raceSnapshot(contract, data?.myFaction, data?.myFactionCode);
    const goal = Math.max(1, Number(contract?.goal || 0));
    if (!race) return `<div class="bc-race-line">Race data unavailable.</div>`;

    let context = "Join the race.";
    if (race.status === "leading") context = `${race.myCode} is leading this order.`;
    if (race.status === "tied") context = `${race.myCode} is tied for lead.`;
    if (race.status === "behind") context = `${race.myCode} is behind by ${race.gapToLeader}.`;

    if (compact) {
      return `
        <div class="bc-race-line">
          Leader ${esc(race.leaderCode)} ${esc(race.leaderValue)}/${esc(goal)} | ${esc(context)}
        </div>
      `;
    }

    const rows = Array.isArray(race.rows) ? race.rows : [];
    const laneMax = Math.max(goal, race.topValue || 0, 1);
    const lanes = rows.map((row, idx) => {
      const lanePct = pct(row.value, laneMax);
      const isLeader = idx === 0;
      const isViewer = race.myCode && row.code === race.myCode;
      const classes = [factionToneClass(row.faction)];
      if (isLeader) classes.push("is-leader");
      if (isViewer) classes.push("is-viewer");
      return `
        <div class="rv-race-lane ${classes.filter(Boolean).join(" ")}">
          <div class="rv-race-head">
            <span>${esc(row.code)} ${isViewer ? "(YOU)" : ""}</span>
            <span>${esc(row.value)}/${esc(goal)}</span>
          </div>
          <div class="rv-track" style="margin-top:6px;">
            <i class="rv-track-fill" style="width:${esc(lanePct)}%;"></i>
          </div>
          <div class="rv-race-sub">${esc(isLeader ? "Current lead lane" : "Faction pressure lane")}</div>
        </div>
      `;
    }).join("");

    return `
      <div class="bc-race rv-race-board">
        <div class="rv-race-title">Faction Race Board</div>
        <div class="rv-race-lanes">${lanes}</div>
        <div class="bc-race-context">${esc(context)}</div>
      </div>
    `;
  }

  function renderPrimary(contract, data) {
    const type = String(contract?.type || "generic").toLowerCase();
    const m = metrics(contract);
    const brief = orderBrief(contract);
    const race = raceSnapshot(contract, data?.myFaction, data?.myFactionCode);
    const links = brief.links.length
      ? `<div class="bc-links">${brief.links.map((line) => `<div class="bc-link-line">${esc(line)}</div>`).join("")}</div>`
      : "";

    return `
      <section class="bc-order-hero">
        <div class="bc-order-kicker rv-kicker">${esc(brief.kicker)} | reset in ${esc(fmtReset(data?.secondsToReset))}</div>
        <div class="bc-card bc-card-primary type-${esc(type)} rv-surface rv-surface-hero">
          <div class="bc-card-head bc-card-head-hero">
            <div class="bc-card-copy">
              <div class="bc-card-title">${esc(contract?.title || contract?.id || "Order")}</div>
              <div class="bc-card-desc">${esc(contract?.desc || "")}</div>
            </div>
            ${renderBadgeOrButton(contract, { badgeOnly: true })}
          </div>

          <div class="rv-chip-row">
            ${renderOrderSignalChips(contract, m, race)}
          </div>

          <div class="bc-action-zone">
            <div class="bc-action-copy">
              <div class="bc-action-title">War Directive</div>
              <div class="bc-action-note">${esc(brief.directive)}</div>
              <div class="bc-action-hint">Adds Contract Contribution only for active contract goals.</div>
            </div>
            <div class="bc-action-slot">
              ${renderBadgeOrButton(contract)}
            </div>
          </div>

          ${renderRace(contract, data, false, race)}

          <div class="bc-callout">
            <div class="bc-callout-title">Intel</div>
            <div class="bc-callout-text">${esc(brief.why)}</div>
          </div>

          ${renderRewardTracker(contract, m)}

          <div class="bc-impact">
            <div class="bc-impact-title">Cycle impact</div>
            <div class="bc-impact-text">${esc(brief.impact)}</div>
          </div>

          ${links}
        </div>
      </section>
    `;
  }

  function renderSecondary(contract, data) {
    const type = String(contract?.type || "generic").toLowerCase();
    const m = metrics(contract);
    const brief = orderBrief(contract);
    const race = raceSnapshot(contract, data?.myFaction, data?.myFactionCode);
    return `
      <article class="bc-card bc-card-secondary type-${esc(type)} rv-surface">
        <div class="bc-card-head">
          <div class="bc-card-copy">
            <div class="bc-card-overline rv-kicker">${esc(brief.kicker)}</div>
            <div class="bc-card-title">${esc(contract?.title || contract?.id || "Order")}</div>
            <div class="bc-card-desc">${esc(contract?.desc || "")}</div>
          </div>
          ${renderBadgeOrButton(contract, { badgeOnly: true })}
        </div>

        <div class="rv-chip-row">
          ${renderOrderSignalChips(contract, m, race)}
        </div>

        <div class="bc-action-zone">
          <div class="bc-action-copy">
            <div class="bc-action-title">Directive</div>
            <div class="bc-action-note">${esc(brief.directive)}</div>
            <div class="bc-action-hint">Adds Contract Contribution only for active contract goals.</div>
          </div>
          <div class="bc-action-slot">
            ${renderBadgeOrButton(contract)}
          </div>
        </div>

        ${renderProgress("Faction", m.factionProgress, m.goal, "bc-fill")}
        ${renderProgress("You", m.myContribution, m.minContribution, "bc-fill is-contrib")}

        <div class="bc-race-mini">${renderRace(contract, data, true, race)}</div>

        <div class="bc-impact">
          <div class="bc-impact-title">Intel</div>
          <div class="bc-impact-text">${esc(brief.why)}</div>
        </div>

        <div class="bc-rewards">${renderRewards(contract)}</div>
      </article>
    `;
  }

  function bindClaimButtons(root) {
    root.querySelectorAll("[data-bc-claim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const contractId = btn.getAttribute("data-bc-claim");
        if (contractId) claim(contractId);
      });
    });
  }

  function renderState(data) {
    S.state = data || {};
    setMeta(data);
    setStatus(`Orders active | ${fmtReset(data?.secondsToReset)} to reset`);
    applyRivalrySkin(data);

    const contracts = Array.isArray(data?.contracts) ? data.contracts : [];
    const root = el(ROOT_ID);
    if (!root) return;

    if (!contracts.length) {
      root.innerHTML = `<div class="bc-empty">No faction orders available.</div>`;
      return;
    }

    const ordered = sortContracts(contracts);
    const primary = ordered[0];
    const secondary = ordered.slice(1);

    const secondaryHtml = secondary.length
      ? `
        <section class="bc-secondary-wrap">
          <div class="bc-secondary-head">Supporting Orders</div>
          <div class="bc-secondary-grid">
            ${secondary.map((contract) => renderSecondary(contract, data)).join("")}
          </div>
        </section>
      `
      : "";

    root.innerHTML = `
      <div class="bc-board">
        ${renderPrimary(primary, data)}
        ${secondaryHtml}
      </div>
    `;

    bindClaimButtons(root);
  }

  async function api(path, payload) {
    let out;
    if (typeof S.apiPost === "function") {
      out = await S.apiPost(path, payload || {});
    } else {
      const init_data = S.tg?.initData || global.Telegram?.WebApp?.initData || "";
      const res = await fetch((global.API_BASE || "") + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(init_data ? { Authorization: `Bearer ${init_data}` } : {})
        },
        body: JSON.stringify({ init_data, ...(payload || {}) })
      });
      out = await res.json();
    }

    if (out && out.ok === false) {
      throw new Error(String(out.reason || out.message || "Request failed"));
    }
    return out;
  }

  async function loadState() {
    renderLoading("Loading faction war orders...");
    try {
      const out = await api("/webapp/brokencontracts/state", { includeStandings: true });
      const data = out?.data || out;
      renderState(data);
      return data;
    } catch (err) {
      renderError(String(err?.message || err || "Failed to load faction war orders"));
      throw err;
    }
  }

  async function claim(contractId) {
    if (!contractId) return false;
    setStatus(`Claiming ${contractId}...`);
    try {
      const out = await api("/webapp/brokencontracts/claim", {
        contractId,
        run_id: rid("bc:claim", contractId)
      });
      const data = out?.state || out?.data || S.state;
      renderState(data);
      try {
        S.tg?.HapticFeedback?.notificationOccurred?.("success");
      } catch (_) {}
      return true;
    } catch (err) {
      setStatus("Claim failed");
      try {
        S.tg?.showAlert?.(String(err?.message || err || "Claim failed"));
      } catch (_) {}
      return false;
    }
  }

  function close() {
    const back = el(MODAL_ID);
    syncShellState(false);
    if (back) back.style.display = "none";
    try {
      global.navClose?.(MODAL_ID);
    } catch (_) {}
  }

  async function open() {
    BrokenContracts.init({
      apiPost: global.S?.apiPost,
      tg: global.Telegram?.WebApp,
      dbg: global.dbg || console.debug
    });

    const back = el(MODAL_ID);
    syncShellState(true);
    if (back) back.style.display = "flex";
    const root = el(ROOT_ID);
    if (root) root.scrollTop = 0;

    try {
      global.navOpen?.(MODAL_ID);
    } catch (_) {}

    try {
      await loadState();
      try {
        el(CLOSE_ID)?.focus?.({ preventScroll: true });
      } catch (_) {}
      return true;
    } catch (err) {
      close();
      throw err;
    }
  }

  function wire() {
    ensureRivalryVisualStyles();
    const back = el(MODAL_ID);
    const closeBtn = el(CLOSE_ID);
    const refreshBtn = el(REFRESH_ID);
    applyRivalrySkin(S.state);

    if (closeBtn && !closeBtn.dataset.bcBound) {
      closeBtn.dataset.bcBound = "1";
      closeBtn.addEventListener("click", close);
    }
    if (refreshBtn && !refreshBtn.dataset.bcBound) {
      refreshBtn.dataset.bcBound = "1";
      refreshBtn.addEventListener("click", () => loadState());
    }
    if (back && !back.dataset.bcBound) {
      back.dataset.bcBound = "1";
      back.addEventListener("click", (ev) => {
        if (ev.target === back) close();
      });
    }
    if (back && !back.dataset.bcObserved) {
      back.dataset.bcObserved = "1";
      S.hideObserver = new MutationObserver(() => {
        if (!isVisible(back)) syncShellState(false);
      });
      S.hideObserver.observe(back, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden"]
      });
    }
    if (!document.body.dataset.bcEscBound) {
      document.body.dataset.bcEscBound = "1";
      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && isVisible(el(MODAL_ID))) close();
      });
    }
  }

  const BrokenContracts = {
    init(opts) {
      const o = opts && typeof opts === "object" ? opts : {};
      if (typeof o.apiPost === "function") S.apiPost = o.apiPost;
      if (o.tg) S.tg = o.tg;
      if (o.dbg) S.dbg = o.dbg;
      wire();
    },
    open,
    close,
    reload: loadState,
    claim
  };

  global.BrokenContracts = BrokenContracts;
  global.openBrokenContracts = () => BrokenContracts.open();
})(window);

