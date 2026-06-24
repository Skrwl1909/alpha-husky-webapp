// js/influence.js - Influence MVP (Patrol + Donate) for map nodes

// - truth-first faction (backend -> cache -> TG picker)

// - robust UX: inline status + cooldown countdown + clear error messages

// - applies leadersMap when returned

// - exports setFaction/ensureFaction for HQ integration

// - weekly war section: standings + active temp rewards + last winners

(function () {

  const Influence = {};

  let _apiPost = null, _tg = null, _dbg = false;

  let _leadersMap = null;

  let _leadersRefreshPromise = null;

  let _leadersLastFetchMs = 0;

  let _nodeStateRefreshPromise = null;

  let _nodeStateRefreshNodeId = "";

  let _nodeStateLastFetchMs = 0;

  let _nodeStateLastNodeId = "";

  let _nodeStateCache = null;

  let _openNodeId = "";

  let _openLoadPromise = null;

  let _openLoadNodeId = "";

  let _pollTimer = null;

  let _inited = false;

  const LEADERS_MIN_REFRESH_MS = 2500;

  const LEADERS_AUTO_STALE_MS = 15000;

  const NODE_STATE_AUTO_STALE_MS = 10000;

  const INFLUENCE_POLL_MS = 30000;



  // -------------------------

  // Faction memory (cache only)

  // -------------------------

  const VALID_FACTIONS = new Set(["rogue_byte", "echo_wardens", "pack_burners", "inner_howl"]);



  const FACTION_LABELS = {

    rogue_byte: "Rogue Byte",

    echo_wardens: "Echo Wardens",

    pack_burners: "Pack Burners",

    inner_howl: "Inner Howl",

  };

  const FACTION_CODES = {

    rogue_byte: "RB",

    echo_wardens: "EW",

    pack_burners: "PB",

    inner_howl: "IH",

  };

  const FACTION_SIGILS = {

    rogue_byte: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777729147/factions/sigil_rb.webp",

    echo_wardens: "https://res.cloudinary.com/dnjwvxinh/image/upload/factions/sigil_ew.webp",

    inner_howl: "https://res.cloudinary.com/dnjwvxinh/image/upload/factions/sigil_ih.webp",

    pack_burners: "https://res.cloudinary.com/dnjwvxinh/image/upload/factions/sigil_pb.webp",

  };

  const FACTION_ACCENTS = {

    rogue_byte: "255,118,102",

    echo_wardens: "134,194,255",

    pack_burners: "255,168,95",

    inner_howl: "189,146,255",

  };

  const PHANTOM_NODE_ASSETS = {

    hero: "images/map/phantom_node/phantom_node.webp",

    signalOverlay: "images/map/phantom_node/phantom_signal_overlay.png",

    frameDesktop: "images/map/phantom_node/phantom_ui_frame.png",

    frameMobile: "images/map/phantom_node/phantom_ui_frame_mobile.png",

    pressureBar: "images/map/phantom_node/phantom_pressure_bar.png",

    patrolAction: "images/map/phantom_node/phantom_patrol_action.png",

    donateAction: "images/map/phantom_node/phantom_donate_action.png",

    sigils: {

      rogue_byte: "images/map/phantom_node/sigil_rogue_byte.png",

      echo_wardens: "images/map/phantom_node/sigil_ew.png",

      pack_burners: "images/map/phantom_node/sigil_pack_burners.png",

      inner_howl: "images/map/phantom_node/sigil_inner_howl.png",

    },

  };

  const STATIC_MAW_ASSET_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1782297967/bosses/the_static_maw.png";

  const NODE_ID_ALIASES = {

    edge_of_the_chain: "edge_of_chain",

    broken_contracts_hub: "broken_contracts",

    alpha_network_hq_shop: "alpha_network_hq",

    faction_hq: "alpha_network_hq",

    moonlab_fortress: "moon_lab",

  };



  let _weekly = null;

  let _nodeInfoById = Object.create(null);



  let _faction = "";

  try { _faction = normalizeFaction(localStorage.getItem("ah_faction") || ""); } catch (_) {}



  function normalizeFaction(raw) {

    const key = String(raw || "").toLowerCase().trim();

    if (!key) return "";

    if (VALID_FACTIONS.has(key)) return key;

    if (key === "rb" || key.includes("rogue")) return "rogue_byte";

    if (key === "ew" || key.includes("echo")) return "echo_wardens";

    if (key === "pb" || key.includes("pack") || key.includes("burn")) return "pack_burners";

    if (key === "ih" || key.includes("inner") || key.includes("howl")) return "inner_howl";

    return "";

  }



  function getFactionStore() {

    const existing = window.__AHFactionStore;

    if (

      existing &&

      typeof existing.get === "function" &&

      typeof existing.set === "function" &&

      typeof existing.clear === "function"

    ) {

      return existing;

    }



    const store = {

      get() {

        let cachedFaction = "";

        try { cachedFaction = localStorage.getItem("ah_faction") || ""; } catch (_) {}

        return normalizeFaction(

          window.currentUserFaction ||

          window.PLAYER_STATE?.profile?.faction ||

          window.PLAYER_STATE?.profile?.factionKey ||

          window.PLAYER_STATE?.faction ||

          cachedFaction ||

          _faction

        );

      },

      set(raw) {

        const next = normalizeFaction(raw);

        try {

          if (next) localStorage.setItem("ah_faction", next);

          else localStorage.removeItem("ah_faction");

        } catch (_) {}

        try { window.currentUserFaction = next; } catch (_) {}

        try { window.AHMap?.reapplyLastLeaders?.(); } catch (_) {}

        return next;

      },

      clear() {

        try { localStorage.removeItem("ah_faction"); } catch (_) {}

        try { window.currentUserFaction = ""; } catch (_) {}

        try { window.AHMap?.reapplyLastLeaders?.(); } catch (_) {}

        return "";

      }

    };



    window.__AHFactionStore = store;

    return store;

  }



  function getCanonicalFaction() {

    return normalizeFaction(getFactionStore().get());

  }



  try { _faction = getCanonicalFaction() || _faction; } catch (_) {}



  function setFaction(f) {

    const next = normalizeFaction(f);

    const changed = next !== _faction;

    _faction = normalizeFaction(getFactionStore().set(next) || next);

    if (changed) _nodeInfoById = Object.create(null);

  }



  function clearFactionCache() {

    _faction = "";

    _nodeInfoById = Object.create(null);

    try { getFactionStore().clear(); } catch (_) {}

  }



  function fmtSec(sec) {

    sec = Math.max(0, parseInt(sec || 0, 10) || 0);

    const m = Math.floor(sec / 60);

    const s = sec % 60;

    return `${m}:${String(s).padStart(2, "0")}`;

  }



  function esc(v) {

    return String(v ?? "").replace(/[&<>"']/g, (m) => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;",

      "'": "&#39;",

    }[m]));

  }



  function fmtFaction(f) {

    const key = String(f || "").toLowerCase();

    return FACTION_LABELS[key] || key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "-";

  }



  function factionCode(f) {

    const key = normalizeFaction(f);

    if (!key) return "--";

    return FACTION_CODES[key] || key.slice(0, 2).toUpperCase();

  }



  function factionAccentRgb(f) {

    const key = normalizeFaction(f);

    return FACTION_ACCENTS[key] || "165,184,214";

  }

  function factionSigilUrl(f) {

    const key = normalizeFaction(f);

    return FACTION_SIGILS[key] || "";

  }

  function phantomFactionSigilUrl(f) {

    const key = normalizeFaction(f);

    return PHANTOM_NODE_ASSETS.sigils[key] || "";

  }

  function phantomNodeSignalId(info) {

    const candidates = [

      info?.signalId,

      info?.signal_id,

      info?.nodeSignalId,

      info?.node_signal_id,

      info?.uid,

      info?.nodeUid,

      info?.node_uid,

    ];

    for (const raw of candidates) {

      const value = String(raw || "").trim();

      if (value) return shortUid(value);

    }

    return "";

  }



  function normalizeNodeId(raw) {

    const key = String(raw || "").trim().toLowerCase();

    if (!key) return "";

    return NODE_ID_ALIASES[key] || key;

  }



  function findMapNode(nodeId, info) {

    const nodes = (window.DATA && Array.isArray(window.DATA.nodes)) ? window.DATA.nodes : [];

    if (!nodes.length) return null;



    const keyCandidates = new Set();

    const addKey = (v) => {

      const key = normalizeNodeId(v);

      if (key) keyCandidates.add(key);

    };



    addKey(nodeId);

    addKey(info?.nodeId);

    addKey(info?.buildingId);

    addKey(info?.id);



    if (!keyCandidates.size) return null;



    for (const node of nodes) {

      if (!node || typeof node !== "object") continue;

      const nid = normalizeNodeId(node.id);

      const bid = normalizeNodeId(node.buildingId);

      for (const key of keyCandidates) {

        if (key && (nid === key || bid === key)) return node;

      }

    }

    return null;

  }



  function resolveNodeLoreLines(nodeId, info) {

    const inlineLore = (info?.nodeLore && typeof info.nodeLore === "object") ? info.nodeLore : null;

    const mapNode = findMapNode(nodeId, info);

    const lore = inlineLore || ((mapNode && typeof mapNode.lore === "object") ? mapNode.lore : null);

    if (!lore) return [];



    const out = [];

    const identity = String(lore.identity || lore.history || "").replace(/\s+/g, " ").trim();

    const stakes = String(lore.stakes || lore.whyNow || "").replace(/\s+/g, " ").trim();

    if (identity) out.push(identity);

    if (stakes) out.push(stakes);



    const factionKey = normalizeFaction(_faction || getCanonicalFaction() || "");

    if (factionKey && lore.factionAngles && typeof lore.factionAngles === "object") {

      const factionLine = String(lore.factionAngles[factionKey] || "").replace(/\s+/g, " ").trim();

      if (factionLine) out.push(factionLine);

    }



    return out.slice(0, 3);

  }



  function shortUid(uid) {

    const s = String(uid || "");

    if (!s) return "-";

    if (s.length <= 10) return s;

    return `${s.slice(0, 4)}...${s.slice(-4)}`;

  }



  function fmtRemain(sec) {

    sec = Math.max(0, parseInt(sec || 0, 10) || 0);



    const d = Math.floor(sec / 86400);

    sec %= 86400;

    const h = Math.floor(sec / 3600);

    sec %= 3600;

    const m = Math.floor(sec / 60);



    if (d > 0) return `${d}d ${h}h`;

    if (h > 0) return `${h}h ${m}m`;

    return `${m}m`;

  }



  function rewardTypeLabel(t) {

    const x = String(t || "").toLowerCase();

    if (x === "skin") return "Skin";

    if (x === "frame") return "Frame";

    if (x === "aura") return "Aura";

    return x || "Reward";

  }



  function extractWeekly(r) {

    return r?.weekly || r?.data?.weekly || null;

  }



  function renderWeekly() {

    const host = _qs("infWeekly");

    const previewHost = _qs("infWeeklyPreview");

    if (!host || !previewHost) return;



    const rewardStateChipEl = _qs("infRewardStateChip");

    const rewardStateTextEl = _qs("infRewardStateText");

    const rewardScoreValueEl = _qs("infRewardScoreValue");

    const rewardScoreBarEl = _qs("infRewardScoreBar");

    const rewardDaysValueEl = _qs("infRewardDaysValue");

    const rewardDaysBarEl = _qs("infRewardDaysBar");

    const rewardHintEl = _qs("infRewardHint");

    const impactSupportValueEl = _qs("infImpactSupportValue");

    const impactSupportHintEl = _qs("infImpactSupportHint");

    const impactRewardValueEl = _qs("infImpactRewardValue");

    const impactRewardHintEl = _qs("infImpactRewardHint");



    const applyRewardDefaults = () => {

      if (rewardStateChipEl) {

        rewardStateChipEl.textContent = "Not qualified";

        rewardStateChipEl.style.background = "rgba(255,190,90,.16)";

        rewardStateChipEl.style.border = "1px solid rgba(255,190,90,.26)";

        rewardStateChipEl.style.color = "#ffe0ab";

      }

      if (rewardStateTextEl) rewardStateTextEl.textContent = "Your Faction Support is your personal weekly activity from Patrol, Donate, and some Siege actions.";

      if (rewardScoreValueEl) rewardScoreValueEl.textContent = "0/60";

      if (rewardScoreBarEl) rewardScoreBarEl.style.width = "0%";

      if (rewardDaysValueEl) rewardDaysValueEl.textContent = "0/2";

      if (rewardDaysBarEl) rewardDaysBarEl.style.width = "0%";

      if (rewardHintEl) rewardHintEl.textContent = "War Rewards may include aura, frame, skin, or raffle entry.";

      if (impactSupportValueEl) impactSupportValueEl.textContent = "0/60";

      if (impactSupportHintEl) impactSupportHintEl.textContent = "Build faction support through patrols and supplies.";

      if (impactRewardValueEl) impactRewardValueEl.textContent = "Not yet";

      if (impactRewardHintEl) impactRewardHintEl.textContent = "War reward progress will appear here.";

    };



    const w = _weekly || null;

    if (!w || !w.weekId) {

      applyRewardDefaults();

      syncPhantomImpact(_openNodeId);

      previewHost.style.display = "block";

      previewHost.innerHTML = `

        <section class="inf-weekly-preview">

          <div style="min-width:0;">

            <div class="inf-panel-kicker">Your Faction Support</div>

            <div class="inf-weekly-title">Rivalry feed syncing</div>

            <div class="inf-weekly-sub">Faction standings will update here once the relay cache responds.</div>

          </div>

        </section>

      `;

      host.style.display = "none";

      host.innerHTML = "";

      return;

    }



    const my = (w.my && typeof w.my === "object") ? w.my : null;

    const factions = Array.isArray(w.factions) ? w.factions : [];

    const topFaction = factions[0] || null;

    const qualify = (w.qualifyThreshold && typeof w.qualifyThreshold === "object") ? w.qualifyThreshold : {};

    const requirements = (w.requirements && typeof w.requirements === "object") ? w.requirements : {};

    const reqScore = Number(qualify.score || requirements.minScore || 60);

    const reqDays = Number(qualify.activeDays || requirements.minActiveDays || 2);

    const myScore = Number(my?.score || 0);

    const myDays = Number(my?.activeDays || 0);

    const myQualified = !!my?.qualified;

    const scorePct = Math.max(0, Math.min(100, Math.round((myScore / Math.max(1, reqScore)) * 100)));

    const daysPct = Math.max(0, Math.min(100, Math.round((myDays / Math.max(1, reqDays)) * 100)));

    const viewerFaction = normalizeFaction(my?.faction || _faction || getCanonicalFaction() || "");

    const viewerRank = viewerFaction

      ? (factions.findIndex((row) => normalizeFaction(row?.faction) === viewerFaction) + 1)

      : 0;

    const scoreMissing = Math.max(0, reqScore - myScore);

    const daysMissing = Math.max(0, reqDays - myDays);

    const rewardLabel = myQualified ? "Qualified" : "Not qualified";

    let rewardCopy = "War Rewards may include aura, frame, skin, or raffle entry.";

    if (myQualified) {

      rewardCopy = "You qualify this cycle. More War Contribution helps your faction hold rank.";

    } else if (scoreMissing > 0 || daysMissing > 0) {

      rewardCopy = `Need ${scoreMissing > 0 ? `${scoreMissing} score` : "score ready"}${scoreMissing > 0 && daysMissing > 0 ? " and " : ""}${daysMissing > 0 ? `${daysMissing} active day${daysMissing === 1 ? "" : "s"}` : ""} to qualify.`;

    }



    if (rewardStateChipEl) {

      rewardStateChipEl.textContent = rewardLabel;

      rewardStateChipEl.style.background = myQualified ? "rgba(110,255,170,.16)" : "rgba(255,190,90,.16)";

      rewardStateChipEl.style.border = myQualified ? "1px solid rgba(110,255,170,.26)" : "1px solid rgba(255,190,90,.26)";

      rewardStateChipEl.style.color = myQualified ? "#b7ffd0" : "#ffe0ab";

    }

    if (rewardStateTextEl) rewardStateTextEl.textContent = myQualified

      ? "Reward progress reached. Keep helping to improve your faction’s standing."

      : "Your Faction Support and active days determine weekly reward progress.";

    if (rewardScoreValueEl) rewardScoreValueEl.textContent = `${myScore}/${reqScore}`;

    if (rewardScoreBarEl) rewardScoreBarEl.style.width = `${scorePct}%`;

    if (rewardDaysValueEl) rewardDaysValueEl.textContent = `${myDays}/${reqDays}`;

    if (rewardDaysBarEl) rewardDaysBarEl.style.width = `${daysPct}%`;

    if (rewardHintEl) rewardHintEl.textContent = rewardCopy;

    if (impactSupportValueEl) impactSupportValueEl.textContent = `${myScore}/${reqScore}`;

    if (impactSupportHintEl) {

      impactSupportHintEl.textContent = myQualified

        ? "Faction support threshold reached."

        : (scoreMissing > 0 ? `${scoreMissing} more support to hit reward pace.` : "Support threshold is nearly there.");

    }

    if (impactRewardValueEl) impactRewardValueEl.textContent = myQualified ? "Qualified" : "Not yet";

    if (impactRewardHintEl) {

      impactRewardHintEl.textContent = myQualified

        ? "You are inside the weekly reward window."

        : rewardCopy;

    }



    const leadFactionText = topFaction ? fmtFaction(topFaction.faction) : "No leader yet";

    const rankText = viewerRank > 0 ? `#${viewerRank} ${fmtFaction(viewerFaction)}` : "Rank pending";

    previewHost.style.display = "block";

    const phantomWeekly = isPhantomNode(_openNodeId);

    previewHost.innerHTML = phantomWeekly

      ? `

      <section class="inf-weekly-preview">

        <div style="min-width:0;">

          <div class="inf-panel-kicker">Your Support</div>

          <div class="inf-weekly-title">Hold the Line</div>

          <div class="inf-weekly-sub">Patrol and supplies reduce Wasteland pressure and build your personal support.</div>

        </div>

        <div class="inf-weekly-mini-grid">

          <article class="inf-weekly-mini-card">

            <div class="inf-weekly-mini-label">Your Support</div>

            <div class="inf-weekly-mini-value">${esc(`${myScore}/${reqScore}`)}</div>

          </article>

          <article class="inf-weekly-mini-card">

            <div class="inf-weekly-mini-label">Active days</div>

            <div class="inf-weekly-mini-value">${esc(`${myDays}/${reqDays}`)}</div>

          </article>

          <article class="inf-weekly-mini-card">

            <div class="inf-weekly-mini-label">Reward window</div>

            <div class="inf-weekly-mini-value">${esc(myQualified ? "Qualified" : "Not yet")}</div>

          </article>

        </div>

        <div class="inf-weekly-sub">Week ${esc(String(w.weekId || ""))} · ${esc(fmtRemain(w.endsInSec))} left</div>

      </section>

    `

      : `

      <section class="inf-weekly-preview">

        <div style="min-width:0;">

          <div class="inf-panel-kicker">War Contribution</div>

          <div class="inf-weekly-title">${esc(leadFactionText)} leads the rivalry</div>

          <div class="inf-weekly-sub">Patrol and Donate shape Faction Control here and add to your faction support.</div>

        </div>

        <div class="inf-weekly-mini-grid">

          <article class="inf-weekly-mini-card">

            <div class="inf-weekly-mini-label">Leading faction</div>

            <div class="inf-weekly-mini-value">${esc(topFaction ? `${fmtFaction(topFaction.faction)} · ${Number(topFaction.score || 0)}` : "Syncing")}</div>

          </article>

          <article class="inf-weekly-mini-card">

            <div class="inf-weekly-mini-label">Your faction rank</div>

            <div class="inf-weekly-mini-value">${esc(rankText)}</div>

          </article>

          <article class="inf-weekly-mini-card">

            <div class="inf-weekly-mini-label">Your Effort</div>

            <div class="inf-weekly-mini-value">${esc(`${myScore}/${reqScore}`)}</div>

          </article>

        </div>

        <div class="inf-weekly-sub">Week ${esc(String(w.weekId || ""))} · ${esc(fmtRemain(w.endsInSec))} left</div>

      </section>

    `;



    host.style.display = "none";

    host.innerHTML = "";

    syncPhantomImpact(_openNodeId);

  }



  function syncPhantomImpact(nodeId) {

    const safeNodeId = normalizeNodeId(nodeId);

    if (!safeNodeId || !isPhantomNode(safeNodeId)) return;



    const patrolValueEl = _qs("infImpactPatrolValue");

    const patrolHintEl = _qs("infImpactPatrolHint");

    const suppliesValueEl = _qs("infImpactSuppliesValue");

    const suppliesHintEl = _qs("infImpactSuppliesHint");

    const supportValueEl = _qs("infImpactSupportValue");

    const supportHintEl = _qs("infImpactSupportHint");

    const rewardValueEl = _qs("infImpactRewardValue");

    const rewardHintEl = _qs("infImpactRewardHint");

    const impactCopyEl = _qs("infImpactCopy");

    if (!patrolValueEl || !patrolHintEl || !suppliesValueEl || !suppliesHintEl || !supportValueEl || !supportHintEl || !rewardValueEl || !rewardHintEl || !impactCopyEl) return;



    const recent = getRecentNodeActionState(safeNodeId);

    const patrolReady = _cdUntilMs <= Date.now();

    const cooldownLeftSec = patrolReady ? 0 : Math.max(0, Math.ceil((_cdUntilMs - Date.now()) / 1000));

    const w = _weekly || null;

    const my = (w && w.my && typeof w.my === "object") ? w.my : null;

    const qualify = (w && w.qualifyThreshold && typeof w.qualifyThreshold === "object") ? w.qualifyThreshold : {};

    const requirements = (w && w.requirements && typeof w.requirements === "object") ? w.requirements : {};

    const reqScore = Number(qualify.score || requirements.minScore || 60);

    const reqDays = Number(qualify.activeDays || requirements.minActiveDays || 2);

    const myScore = Number(my?.score || 0);

    const myDays = Number(my?.activeDays || 0);

    const myQualified = !!my?.qualified;

    const scoreMissing = Math.max(0, reqScore - myScore);

    const daysMissing = Math.max(0, reqDays - myDays);



    patrolValueEl.textContent = patrolReady ? "Available" : "Done";

    patrolHintEl.textContent = patrolReady

      ? "Patrol is ready now."

      : `Patrol returns in ${fmtCooldownHint(cooldownLeftSec)}.`;



    suppliesValueEl.textContent = recent.donateAt > 0 ? "Sent" : "Available";

    suppliesHintEl.textContent = recent.donateAt > 0

      ? "Your supplies were added to the war effort."

      : "Send supplies to reinforce the relay.";



    const nodeInfo = mergedNodeInfo(safeNodeId);

    const flTarget = (nodeInfo && typeof nodeInfo.frontlineTarget === "object") ? nodeInfo.frontlineTarget : null;

    const packSupport = Number(flTarget?.packSupportToday ?? flTarget?.current ?? 0);

    const packGoal = Number(flTarget?.target || 900);

    const personalSupport = Number(flTarget?.playerSupportToday ?? nodeInfo?.playerSupportToday ?? myScore);

    const packPct = Math.max(0, Math.min(100, Number(flTarget?.progressPct || (packGoal > 0 ? Math.round((packSupport / packGoal) * 100) : 0))));

    const packOver = Math.max(0, Number(flTarget?.overTarget || Math.max(0, packSupport - packGoal)));

    supportValueEl.textContent = `${personalSupport} you · ${packSupport}/${packGoal} Pack`;

    supportHintEl.textContent = packOver > 0

      ? `Target secured · Over target: +${packOver}`

      : (packPct >= 100

        ? "Target secured. The Static Maw is pushing back."

        : `${packGoal - packSupport} Pack support to daily target (${packPct}%).`);



    rewardValueEl.textContent = myQualified ? "Qualified" : "Not yet";

    rewardHintEl.textContent = myQualified

      ? "You are inside the weekly reward window."

      : `Need ${scoreMissing > 0 ? `${scoreMissing} score` : "score ready"}${scoreMissing > 0 && daysMissing > 0 ? " and " : ""}${daysMissing > 0 ? `${daysMissing} active day${daysMissing === 1 ? "" : "s"}` : ""}.`;



    const bestMove = String(flTarget?.bestMove || "").trim();

    if (bestMove) {

      impactCopyEl.textContent = `Best next move: ${bestMove}`;

    } else if (recent.patrolAt > 0 || recent.donateAt > 0) {

      impactCopyEl.textContent = "Your action moved the line. Return tomorrow to see if the Pack held overnight.";

    } else if (!patrolReady) {

      impactCopyEl.textContent = "Patrol is on cooldown. Send supplies or return when patrol is ready.";

    } else {

      impactCopyEl.textContent = "Patrol the relay. The Static Maw is pushing back.";

    }

  }

  // -------------------------

  // Run id

  // -------------------------

  function rid(prefix = "inf") {

    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  }



  // -------------------------

  // Toast helper

  // -------------------------

  function toast(msg) {

    const m = String(msg || "");

    try { window.toast?.(m); return; } catch (_) {}

    try { (_tg || window.Telegram?.WebApp)?.showPopup?.({ title: "Influence", message: m, buttons: [{ type: "ok" }] }); return; } catch (_) {}

    console.log("[toast]", m);

  }



  // -------------------------

  // UI state (cooldown + status)

  // -------------------------

  let _cdUntilMs = 0;

  let _cdTick = null;

  let _lastFactionCdSec = 0;

  let _signalCoreOpen = false;

  let _tooltipKey = "";

  const _recentNodeActions = Object.create(null);



  const PATROL_ACTION_HINT = "Scout the relay and reinforce control.";

  const DONATE_ACTION_HINT = "Spend supplies to strengthen your faction’s hold.";

  const LOCAL_TOOLTIP_COPY = {

    pressure: "Pressure shows where conflict is rising. It does not directly decide capture.",

    hot: "HOT means active enemy movement. Actions here matter more.",

    contested: "CONTESTED means control is unstable.",

    fortified: "FORTIFIED means one faction has strong pressure here.",

    defend: "Defend means your faction has something to protect.",

    push: "Push means another faction controls the node. Your actions help contest it.",

    patrol: PATROL_ACTION_HINT,

    donate: DONATE_ACTION_HINT,

    weekly_score: "Your Faction Support is your personal weekly activity from Patrol, Donate, and some Siege actions.",

    eligibility: "Your Faction Support and active days determine weekly reward progress.",

  };



  function _qs(id) { return document.getElementById(id); }

  function _logDbg(...args) {

    if (_dbg) console.debug("[Influence]", ...args);

  }

  function isPhantomNode(nodeId = _openNodeId) {

    return normalizeNodeId(nodeId) === "phantom_nodes";

  }

  function phantomWastelandPressure(info) {

    const raw = Number(info?.wastelandPressure);

    if (Number.isFinite(raw)) return Math.max(0, Math.min(100, Math.round(raw)));

    return 65;

  }

  function phantomPackDefenseStatus(info) {

    return String(info?.packDefenseStatus || "").trim() || phantomStatusFromPressure(phantomWastelandPressure(info));

  }

  function phantomStatusFromPressure(p) {

    const n = Math.max(0, Math.min(100, Number(p || 0)));

    if (n <= 29) return "Secured";

    if (n <= 59) return "Unstable";

    if (n <= 79) return "Dangerous";

    return "Critical";

  }

  function phantomFrontlineBadge(info) {

    return phantomPackDefenseStatus(info).toUpperCase();

  }

  function phantomFrontlineLine(info) {

    const wp = phantomWastelandPressure(info);

    const status = phantomPackDefenseStatus(info);

    if (status === "Secured") return "The relay is holding. Keep the Wasteland back.";

    if (status === "Unstable") return "Phantom Node is under Wasteland pressure.";

    if (status === "Dangerous") return "The Wasteland is pushing hard. Hold the line.";

    return "Critical Wasteland pressure. Every action counts.";

  }

  function phantomFrontlineBrief(info, patrolReady, cooldownLeftSec) {

    if (!patrolReady && cooldownLeftSec > 0) return `Patrol reopens in ${fmtCooldownHint(cooldownLeftSec)}.`;

    const status = phantomPackDefenseStatus(info);

    if (status === "Critical" || status === "Dangerous") return "Hold the line now.";

    if (status === "Unstable") return "Patrol or send supplies.";

    return "The Pack holds the relay.";

  }

  function phantomFrontlineCtaLabel() {

    return "HOLD THE LINE";

  }

  function phantomThreatStatusClass(info) {

    const status = phantomPackDefenseStatus(info);

    const map = {

      Secured: "is-status-secured",

      Unstable: "is-status-unstable",

      Dangerous: "is-status-dangerous",

      Critical: "is-status-critical",

    };

    return map[status] || "is-status-unstable";

  }

  function renderPhantomThreatCard(info) {

    const el = _qs("infThreatCard");

    if (!el) return;

    const threat = (info && typeof info.frontlineThreat === "object") ? info.frontlineThreat : null;

    if (!threat) { el.style.display = "none"; el.innerHTML = ""; el.className = "inf-threat-card"; return; }

    const weakness = Array.isArray(threat.weakness) ? threat.weakness.join(" / ") : "Patrol / Supplies";

    const statusClass = phantomThreatStatusClass(info);

    el.className = `inf-threat-card ${statusClass}`;

    el.style.display = "block";

    el.innerHTML = `

      <div class="inf-threat-inner">

        <div class="inf-threat-bg-accent" aria-hidden="true" style="background-image:url('${STATIC_MAW_ASSET_URL}')"></div>

        <div class="inf-threat-head">

          <div class="inf-threat-boss-portrait">

            <img

              class="inf-threat-boss-art"

              src="${STATIC_MAW_ASSET_URL}"

              alt=""

              aria-hidden="true"

              loading="lazy"

              decoding="async"

              onerror="this.style.display='none'; if (this.parentElement) this.parentElement.classList.add('is-art-missing');"

            />

          </div>

          <div class="inf-threat-copy">

            <div class="inf-threat-kicker">Threat Detected</div>

            <div class="inf-threat-name">${esc(String(threat.name || "The Static Maw"))}</div>

            <div class="inf-threat-meta">${esc(String(threat.type || "Wasteland Threat"))} · ${esc(String(threat.status || ""))}</div>

            <div class="inf-threat-meta">Pressure: ${esc(String(threat.pressure ?? phantomWastelandPressure(info)))}% · Weakness: ${esc(weakness)}</div>

            <div class="inf-threat-note">“${esc(String(threat.note || ""))}”</div>

          </div>

        </div>

      </div>

    `;

  }

  function renderPhantomThreatPulse(info) {

    const el = _qs("infThreatPulse");

    if (!el) return;

    const pulse = (info && typeof info.threatPulse === "object") ? info.threatPulse : null;

    if (!pulse || pulse.applied !== true) { el.style.display = "none"; el.innerHTML = ""; return; }

    const before = Number(pulse.pressureBeforePulse);

    const after = Number(pulse.pressureAfterPulse);

    const line = Number.isFinite(before) && Number.isFinite(after)

      ? `Pressure: ${before}% → ${after}%`

      : "";

    el.style.display = "block";

    el.innerHTML = `

      <div class="inf-threat-kicker">While The Pack Was Away</div>

      ${line ? `<div class="inf-threat-meta">${esc(line)}</div>` : ""}

      <div class="inf-threat-pulse-copy">${esc(String(pulse.pulseNote || "The Static Maw pressed deeper into the relay."))}</div>

    `;

  }

  function renderPhantomFrontlineTarget(info) {

    const el = _qs("infFrontlineTarget");

    if (!el) return;

    const target = (info && typeof info.frontlineTarget === "object") ? info.frontlineTarget : null;

    if (!target) { el.style.display = "none"; el.innerHTML = ""; return; }

    const unit = String(target.unit || "support");

    const current = Number(target.current || 0);

    const goal = Number(target.target || 900);

    const progressPct = Math.max(0, Math.min(100, Number(target.progressPct || (goal > 0 ? Math.round((current / goal) * 100) : 0))));

    const over = Math.max(0, Number(target.overTarget || Math.max(0, current - goal)));

    const secured = target.targetSecured === true || current >= goal;

    const statusCopy = String(target.statusCopy || (secured ? (over > 0 ? "The Pack overheld the line today." : "Target secured") : "Hold the daily support line."));

    const progressCopy = String(target.progressCopy || `${current} / ${goal}`);

    const personal = Number(target.playerSupportToday || info?.playerSupportToday || 0);

    el.style.display = "block";

    el.innerHTML = `

      <div class="inf-target-kicker">${esc(String(target.label || "Daily Pack Support Target"))}</div>

      <div class="inf-target-progress">${esc(progressCopy)} · ${esc(`${progressPct}%`)}</div>

      <div class="inf-target-bar" aria-hidden="true"><span style="width:${progressPct}%"></span></div>

      <div class="inf-target-copy">${esc(statusCopy)}${over > 0 ? ` · Over target: +${esc(String(over))}` : ""}</div>

      <div class="inf-target-copy">Your support today: ${esc(String(personal))} · Pack total: ${esc(String(current))}</div>

      <div class="inf-target-copy">Best Move: ${esc(String(target.bestMove || "Patrol the node or send supplies."))}</div>

      <div class="inf-target-copy">${esc(String(target.tomorrowHook || "Return tomorrow to see if the Pack held overnight."))}</div>

    `;

  }

  function renderPhantomDailyOutcome(info) {

    const el = _qs("infDailyOutcome");

    if (!el) return;

    const outcome = (info && typeof info.dailyOutcome === "object") ? info.dailyOutcome : null;

    if (!outcome) { el.style.display = "none"; el.innerHTML = ""; return; }

    const hasOutcome = outcome.hasOutcome === true;

    el.classList.toggle("is-recovery", !!outcome.recoveryMode);

    el.style.display = "block";

    if (!hasOutcome) {

      el.innerHTML = `

        <div class="inf-daily-kicker">Yesterday's Frontline Report</div>

        <div class="inf-daily-title">First report begins after today's cycle.</div>

        <div class="inf-daily-note">${esc(String(outcome.note || outcome.body || "First frontline report begins after today's cycle."))}</div>

        <div class="inf-daily-note">${esc(String(outcome.fallbackCopy || "Patrol or send supplies to help shape tomorrow's outcome."))}</div>

      `;

      return;

    }

    const pStart = Number(outcome.pressureStart);

    const pEnd = Number(outcome.pressureEnd);

    const pressureLine = Number.isFinite(pStart) && Number.isFinite(pEnd)

      ? `Pressure: ${pStart}% → ${pEnd}%`

      : "";

    const packImpact = Number(outcome.packImpact || 0);

    const actions = Number(outcome.actions || 0);

    const recoveryChip = outcome.recoveryMode

      ? '<span class="inf-recovery-chip">Recovery Effort Active</span>'

      : (String(outcome.result || "").toLowerCase() === "secured"

        ? '<span class="inf-momentum-chip">The Pack starts today with momentum.</span>'

        : "");

    el.innerHTML = `

      <div class="inf-daily-kicker">Yesterday's Frontline Report</div>

      <div class="inf-daily-title">${esc(String(outcome.title || ""))}</div>

      ${recoveryChip}

      ${pressureLine ? `<div class="inf-daily-meta">${esc(pressureLine)}</div>` : ""}

      ${packImpact > 0 ? `<div class="inf-daily-meta">Pack Impact: -${esc(String(packImpact))} pressure</div>` : ""}

      ${actions > 0 ? `<div class="inf-daily-meta">Actions: ${esc(String(actions))}</div>` : ""}

      <div class="inf-daily-note">“${esc(String(outcome.body || ""))}”</div>

    `;

  }

  function renderPhantomFrontlineToday(info) {

    const el = _qs("infFrontlineToday");

    if (!el) return;

    const today = (info && typeof info.frontlineToday === "object") ? info.frontlineToday : null;

    if (!today || !String(today.date || "").trim()) { el.style.display = "none"; el.innerHTML = ""; return; }

    const impact = Number(today.packImpactToday || 0);

    const actions = Number(today.actionsToday || 0);

    el.style.display = "block";

    el.innerHTML = `

      <div class="inf-today-kicker">Today's Pack Impact</div>

      <div class="inf-today-line">Impact: -${esc(String(impact))} pressure</div>

      <div class="inf-today-line">Actions: ${esc(String(actions))}</div>

    `;

  }



  function renderPhantomFrontlineConfront(info) {

    const el = _qs("infFrontlineConfront");

    if (!el) return;

    const confront = (info && typeof info.frontlineConfront === "object") ? info.frontlineConfront : null;

    if (!confront) { el.style.display = "none"; el.innerHTML = ""; return; }

    const available = confront.available === true;

    const pressure = Number(confront.currentPressure);

    const unlockAt = Number(confront.unlockedAtPressure || 60);

    const usesToday = Number(confront.usesToday || 0);

    const maxUses = Number(confront.maxUsesPerDay || 1);

    const reason = String(confront.reason || "").trim();

    el.style.display = "block";

    el.classList.toggle("is-available", available);

    el.classList.toggle("is-locked", !available);

    if (available) {

      el.innerHTML = `

        <div class="inf-confront-kicker">Confrontation Window</div>

        <div class="inf-confront-title">CONFRONT THE MAW</div>

        <div class="inf-confront-copy">The Pack created an opening.</div>

        <div class="inf-confront-copy">Challenge the Static Maw directly.</div>

        <div class="inf-confront-meta">Pressure: ${esc(String(Number.isFinite(pressure) ? pressure : "?"))}% · ${esc(`${usesToday}/${maxUses}`)} today</div>

        <button id="infConfrontBtn" type="button" class="inf-confront-btn">Drive Back The Static Maw</button>

      `;

      const btn = _qs("infConfrontBtn");

      if (btn) btn.onclick = () => doConfront(_openNodeId || "");

      return;

    }

    el.innerHTML = `

      <div class="inf-confront-kicker">Confrontation Window</div>

      <div class="inf-confront-title is-locked">CONFRONT THE MAW</div>

      <div class="inf-confront-copy">Available when pressure drops to ${esc(String(unlockAt))} or lower.</div>

      <div class="inf-confront-meta">Pressure: ${esc(String(Number.isFinite(pressure) ? pressure : "?"))}%${reason ? ` · ${esc(reason)}` : ""}</div>

      <button type="button" class="inf-confront-btn is-locked" disabled>Locked</button>

    `;

  }



  function setConfrontActionResult(payload = {}) {

    const el = _qs("infStatus");

    if (!el) return;

    const result = (payload?.frontlineConfrontResult && typeof payload.frontlineConfrontResult === "object")

      ? payload.frontlineConfrontResult

      : null;

    const wpBefore = Number(result?.pressureBefore ?? payload?.wastelandPressureBefore);

    const wpAfter = Number(result?.pressureAfter ?? payload?.wastelandPressureAfter);

    const pressureDelta = Number(result?.pressureDelta ?? payload?.pressureDelta ?? (wpBefore - wpAfter));

    const supportGained = Number(result?.supportGained ?? payload?.weeklyPoints ?? 0);

    const statusBefore = String(result?.statusBefore || payload?.statusBefore || "").trim();

    const statusAfter = String(result?.statusAfter || payload?.statusAfter || "").trim();

    const npcNote = String(result?.npcNote || payload?.frontlineCopy || "").trim();

    const tier = String(result?.confrontationTier || "").trim();

    const pressureLine = Number.isFinite(wpBefore) && Number.isFinite(wpAfter)

      ? `Pressure: ${wpBefore}% → ${wpAfter}%`

      : "";

    const lines = [

      pressureLine,

      pressureDelta > 0 ? `Pack Impact: -${pressureDelta} pressure` : "",

      supportGained > 0 ? `Your Support: +${supportGained}` : "",

      statusBefore && statusAfter

        ? (statusBefore !== statusAfter ? `Status: ${statusBefore} → ${statusAfter}` : `Status: ${statusAfter}`)

        : "",

      npcNote,

      tier ? `Tier: ${tier}` : "",

    ].filter(Boolean);

    el.className = "inf-status inf-status-result inf-status-confront";

    el.style.display = "block";

    el.style.border = "1px solid rgba(255,132,112,.34)";

    el.style.background = "linear-gradient(180deg, rgba(255,116,76,.18), rgba(70,164,214,.10))";

    el.innerHTML = `

      <div class="inf-result-kicker">Confrontation Complete</div>

      <div class="inf-result-title">YOU DROVE BACK THE STATIC MAW</div>

      <div class="inf-result-gain">${esc(pressureLine || "The Static Maw recoiled from the relay.")}</div>

      <div class="inf-result-lines">

        ${lines.slice(1, 5).map((line) => `<div class="inf-result-line">${esc(line)}</div>`).join("")}

      </div>

    `;

  }



  function renderPhantomThreatLayers(nodeId, info) {

    if (!isPhantomNode(nodeId)) {

      renderPhantomThreatCard(null);

      renderPhantomThreatPulse(null);

      renderPhantomFrontlineTarget(null);

      renderPhantomDailyOutcome(null);

      renderPhantomFrontlineToday(null);

      renderPhantomFrontlineConfront(null);

      return;

    }

    renderPhantomThreatCard(info);

    renderPhantomThreatPulse(info);

    renderPhantomFrontlineTarget(info);

    renderPhantomDailyOutcome(info);

    renderPhantomFrontlineToday(info);

    renderPhantomFrontlineConfront(info);

  }



  function phantomFrontlineOrderLabel(info) {

    const status = phantomPackDefenseStatus(info);

    if (status === "Critical" || status === "Dangerous") return "HOLD";

    if (status === "Unstable") return "STABILIZE";

    return "PATROL";

  }



  function fmtCooldownHint(sec) {

    sec = Math.max(0, parseInt(sec || 0, 10) || 0);

    const m = Math.floor(sec / 60);

    const s = sec % 60;

    return `${m}m ${s}s`;

  }

  function canonicalNodeCondition(info, ux) {

    const explicit = String(ux?.displayStatus || info?.pressureDerivedStatus || "").trim().toUpperCase();

    if (info?.isContested || explicit === "CONTESTED" || explicit === "SIEGE_LIVE" || explicit === "SIEGE_FORMING") return "CONTESTED";

    if (info?.isHot || explicit === "HOT" || explicit === "HEATING") return "HOT";

    if (info?.isFortified || explicit === "FORTIFIED" || explicit === "OWNED" || explicit === "SECURED" || explicit === "SIEGE_COOLDOWN") return "FORTIFIED";

    return "CALM";

  }

  function recommendedOrderLabel(owner, viewerFaction, condition) {

    if (owner && viewerFaction && owner === viewerFaction) {

      return (condition === "CONTESTED" || condition === "HOT") ? "DEFEND" : "STABILIZE";

    }

    if (owner && viewerFaction && owner !== viewerFaction) return "PUSH";

    if (!owner && (condition === "CONTESTED" || condition === "HOT")) return "PUSH";

    return "STABILIZE";

  }

  function statusNarrative(condition) {

    if (condition === "CONTESTED") return "Control is unstable and action windows are live.";

    if (condition === "HOT") return "Enemy movement is active. Fast actions carry more weight.";

    if (condition === "FORTIFIED") return "One side has built strong pressure on the relay.";

    return "The relay is quiet for now, but pressure can swing it fast.";

  }



  function deriveControlStatus(viewerP, oppP, yourName) {

    const v = Math.max(0, Number(viewerP || 0));

    const o = Math.max(0, Number(oppP || 0));

    const yName = yourName || "Your faction";

    const eName = "Enemy";

    if (v === 0 && o === 0) {

      return { headline: "This node is active. Choose an action to support your faction.", detail: "", advice: "" };

    }

    if (v === o && v > 0) {

      return { headline: "CONTROL IS TIED", detail: `${yName}: ${v} • ${eName}: ${o}`, advice: "Defend now to push your faction ahead." };

    }

    if (v > o) {

      return { headline: "YOUR FACTION IS HOLDING", detail: `${yName}: ${v} • ${eName}: ${o}`, advice: "Keep defending to secure the node." };

    }

    return { headline: "ENEMY PRESSURE IS AHEAD", detail: `${yName}: ${v} • ${eName}: ${o}`, advice: "Push back to protect this node." };

  }



  function markRecentNodeAction(nodeId, kind) {

    const safeNodeId = normalizeNodeId(nodeId);

    if (!safeNodeId) return;

    if (!_recentNodeActions[safeNodeId]) {

      _recentNodeActions[safeNodeId] = { patrolAt: 0, donateAt: 0 };

    }

    if (kind === "patrol") _recentNodeActions[safeNodeId].patrolAt = Date.now();

    if (kind === "donate") _recentNodeActions[safeNodeId].donateAt = Date.now();

  }



  function getRecentNodeActionState(nodeId) {

    const safeNodeId = normalizeNodeId(nodeId);

    return _recentNodeActions[safeNodeId] || { patrolAt: 0, donateAt: 0 };

  }



  function phantomEncounterBadge({ condition, owner, viewerFaction, viewerPressure, enemyPressure }) {

    if (condition === "CONTESTED") return "CONTESTED";

    if (owner && viewerFaction && owner === viewerFaction && Number(viewerPressure || 0) >= Number(enemyPressure || 0)) return "HOLDING";

    if (condition === "HOT") return "HOT";

    return "UNDER PRESSURE";

  }



  function phantomEncounterLine({ badge, owner, ownerLabel, viewerFaction, yourFactionName, viewerPressure, enemyPressure }) {

    if (badge === "HOLDING") return `${yourFactionName} is holding this relay.`;

    if (badge === "CONTESTED" && owner && viewerFaction && owner === viewerFaction) return `${yourFactionName} is fighting to hold this relay.`;

    if (badge === "CONTESTED" && ownerLabel) return `${ownerLabel} is being challenged at this relay.`;

    if (badge === "HOT") return "Enemy pressure is rising.";

    if (owner && viewerFaction && owner !== viewerFaction && Number(enemyPressure || 0) >= Number(viewerPressure || 0)) return "This node needs support.";

    if (ownerLabel) return `${ownerLabel} is holding this relay.`;

    return "This node needs support.";

  }



  function phantomEncounterBrief({ badge, recommendedAction, patrolReady, cooldownLeftSec }) {

    if (!patrolReady && cooldownLeftSec > 0) return `Patrol reopens in ${fmtCooldownHint(cooldownLeftSec)}.`;

    if (badge === "HOLDING") return "Hold the relay.";

    if (badge === "CONTESTED") return "Defend the node.";

    if (recommendedAction === "PUSH") return "Patrol the node.";

    return "Support your faction.";

  }



  function phantomPrimaryCtaLabel({ owner, viewerFaction, badge }) {

    if (badge === "HOLDING" || badge === "CONTESTED" || (owner && viewerFaction && owner === viewerFaction)) return "DEFEND NODE";

    return "PATROL NODE";

  }



  function explainNodeCondition(condition) {

    const c = String(condition || "").toUpperCase();

    if (c === "HOT") return "Enemy activity is high. Fast actions matter more.";

    if (c === "CONTESTED") return "Both sides are fighting for control.";

    if (c === "FORTIFIED") return "Your faction has a stronger hold here.";

    return "";

  }

  function setOrdersCooldownText(text = "", tone = "idle") {

    const el = _qs("infOrdersCooldown");

    if (!el) return;

    const msg = String(text || "").trim();

    el.textContent = msg;

    el.style.display = msg ? "block" : "none";

    el.dataset.tone = tone;

  }

  function closeTooltip() {

    _tooltipKey = "";

    const tip = _qs("infTooltip");

    if (!tip) return;

    tip.style.display = "none";

    tip.setAttribute("aria-hidden", "true");

    tip.innerHTML = "";

  }

  function positionTooltip(anchorEl) {

    const tip = _qs("infTooltip");

    const card = _qs("influenceCard");

    if (!tip || !card || !anchorEl) return;

    const cardRect = card.getBoundingClientRect();

    const anchorRect = anchorEl.getBoundingClientRect();

    const width = Math.min(240, Math.max(168, card.clientWidth - 28));

    const left = Math.max(12, Math.min(card.clientWidth - width - 12, (anchorRect.left - cardRect.left) - 14));

    const top = (anchorRect.bottom - cardRect.top) + card.scrollTop + 8;

    tip.style.width = `${width}px`;

    tip.style.left = `${left}px`;

    tip.style.top = `${top}px`;

  }

  function openTooltip(key, anchorEl) {

    const copy = LOCAL_TOOLTIP_COPY[String(key || "").trim().toLowerCase()];

    const tip = _qs("infTooltip");

    if (!copy || !tip || !anchorEl) return;

    _tooltipKey = String(key || "").trim().toLowerCase();

    tip.innerHTML = `<div class="inf-tooltip-title">Intel</div><div class="inf-tooltip-copy">${esc(copy)}</div>`;

    tip.style.display = "block";

    tip.setAttribute("aria-hidden", "false");

    positionTooltip(anchorEl);

  }

  function toggleTooltip(key, anchorEl) {

    const next = String(key || "").trim().toLowerCase();

    if (!next || !anchorEl) return;

    if (_tooltipKey === next) {

      closeTooltip();

      return;

    }

    openTooltip(next, anchorEl);

  }

  function setSignalCoreSigil(owner, url) {

    const sigilEl = _qs("infSignalSigil");

    const fallbackEl = _qs("infSignalSigilFallback");

    const coreEl = _qs(".inf-signal-sigil-core");

    if (!sigilEl || !fallbackEl || !coreEl) return;



    const ownerCode = owner ? factionCode(owner) : "--";

    const nextUrl = String(url || "").trim();

    fallbackEl.textContent = ownerCode;

    fallbackEl.style.display = "flex";

    coreEl.dataset.sigilMode = "fallback";



    sigilEl.style.display = "none";

    sigilEl.style.opacity = "0";

    sigilEl.removeAttribute("aria-hidden");



    if (!nextUrl) {

      sigilEl.removeAttribute("src");

      sigilEl.dataset.sigilUrl = "";

      return;

    }



    sigilEl.dataset.sigilUrl = nextUrl;

    sigilEl.onload = () => {

      if (sigilEl.dataset.sigilUrl !== nextUrl) return;

      if (!(sigilEl.naturalWidth > 0 && sigilEl.naturalHeight > 0)) return;

      fallbackEl.style.display = "none";

      sigilEl.style.display = "block";

      sigilEl.style.opacity = "0.92";

      coreEl.dataset.sigilMode = "image";

    };

    sigilEl.onerror = () => {

      if (sigilEl.dataset.sigilUrl !== nextUrl) return;

      sigilEl.style.display = "none";

      sigilEl.style.opacity = "0";

      fallbackEl.style.display = "flex";

      coreEl.dataset.sigilMode = "fallback";

    };



    if (sigilEl.getAttribute("src") !== nextUrl) {

      sigilEl.src = nextUrl;

      return;

    }

    if (sigilEl.complete && sigilEl.naturalWidth > 0) {

      fallbackEl.style.display = "none";

      sigilEl.style.display = "block";

      sigilEl.style.opacity = "0.92";

      coreEl.dataset.sigilMode = "image";

    }

  }

  function _isModalOpen() {

    const m = document.getElementById("influenceModal");

    return !!m && m.style.display !== "none";

  }

  function _parseRefreshLeadersArgs(applyToMapOrOptions, maybeOptions) {

    if (applyToMapOrOptions && typeof applyToMapOrOptions === "object") {

      return {

        applyToMap: applyToMapOrOptions.applyToMap !== false,

        force: !!applyToMapOrOptions.force,

        reason: String(applyToMapOrOptions.reason || "auto"),

      };

    }

    return {

      applyToMap: applyToMapOrOptions !== false,

      force: !!maybeOptions?.force,

      reason: String(maybeOptions?.reason || "auto"),

    };

  }

  function _startPoll() {

    if (!_isModalOpen() || !_openNodeId) return;

    if (_pollTimer) {

      _logDbg("duplicate interval blocked", { nodeId: _openNodeId });

      return;

    }

    _logDbg("poll start", { nodeId: _openNodeId, intervalMs: INFLUENCE_POLL_MS });

    _pollTimer = window.setInterval(() => {

      if (!_isModalOpen() || !_openNodeId) {

        _stopPoll("hidden");

        return;

      }

      void refreshLeaders({ applyToMap: false, reason: "poll" });

      void refreshWeekly(_openNodeId, { reason: "poll" });

    }, INFLUENCE_POLL_MS);

  }

  function _stopPoll(reason = "close") {

    if (_pollTimer) {

      clearInterval(_pollTimer);

      _pollTimer = null;

      _logDbg("poll stop", { reason, nodeId: _openNodeId || "" });

    }

  }



  function setStatus(msg, kind = "info") {

    const el = _qs("infStatus");

    if (!el) return;

    const m = String(msg || "").trim();

    el.className = "inf-status";

    if (!m) { el.style.display = "none"; el.textContent = ""; el.innerHTML = ""; return; }

    el.textContent = m;

    el.style.display = "block";



    if (kind === "err") {

      el.style.border = "1px solid rgba(255,120,120,.22)";

      el.style.background = "rgba(255,120,120,.10)";

    } else if (kind === "ok") {

      el.style.border = "1px solid rgba(120,255,180,.20)";

      el.style.background = "rgba(120,255,180,.08)";

    } else {

      el.style.border = "1px solid rgba(255,255,255,.10)";

      el.style.background = "rgba(255,255,255,.06)";

    }

  }



  function clearStatus() { setStatus(""); }

  const ARCHIVE_KEY_ICON_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1779282500/burned_archive/archive_key_icon.webp";

  function isArchiveKeyEligibleAction(payload = {}) {

    return payload && payload.archiveKeyEligible === true;

  }

  function archiveKeyFeedback(payload = {}) {

    if (!isArchiveKeyEligibleAction(payload)) return null;

    const gained = payload.archiveKeyGained === true || payload.archiveKeyGranted === true;

    const capReached = payload.archiveKeyCapReached === true;

    const msg = String(payload.archiveKeyMessage || "").trim();

    let count = null;

    const nested = payload && payload.archiveKeys;

    if (nested && typeof nested === "object") {

      if (nested.left != null) count = nested.left;

      else if (nested.earnedToday != null) count = nested.earnedToday;

      else if (nested.spentToday != null) count = nested.spentToday;

    }

    if (count == null && payload.archiveKeysLeft != null) count = payload.archiveKeysLeft;

    if (count == null && payload.archiveKeysEarnedToday != null) count = payload.archiveKeysEarnedToday;

    if (count == null && payload.archiveKeysSpentToday != null) count = payload.archiveKeysSpentToday;

    const parts = [];

    if (gained) {

      parts.push(msg || "Archive Key gained. Use it in Campaign → Burned Archive");

      if (count != null) parts.push(`Archive Keys: ${Number(count)}`);

    } else if (capReached) {

      parts.push(msg || "Archive Key cap reached");

    } else {

      return null;

    }

    if (!parts.length) return null;

    const iconHtml = gained ? `<img class="inf-result-keyicon" src="${ARCHIVE_KEY_ICON_URL}" alt="" aria-hidden="true" loading="lazy" onerror="this.remove();">` : "";

    return {

      html: `<span class="inf-result-keyline">${iconHtml}<span class="inf-result-keycopy">${parts.map((part) => `<span>${esc(part)}</span>`).join("")}</span></span>`

    };

  }

  function warContributionFeedback(payload = {}) {

    const points = Number(payload?.weeklyPoints);

    if (!Number.isFinite(points) || points <= 0) return "";

    return `Your Faction Support +${points}`;

  }

  function contractContributionFeedback(payload = {}) {

    if (payload?.contractContributionChanged !== true) return "";

    const delta = Number(payload?.contractContributionDelta);

    if (Number.isFinite(delta) && delta > 0) return `Contract Contribution +${delta}`;

    return "Contract Contribution updated.";

  }

  function setActionResult(kind, payload = {}) {

    const el = _qs("infStatus");

    if (!el) return;

    const currentNodeId = normalizeNodeId(_qs("influenceModal")?.dataset?.nodeId || _openNodeId || "");

    const phantomMode = isPhantomNode(currentNodeId);

    const gain = Number(payload?.gain || 0) || 0;

    const spent = Number(payload?.spent || 0) || 0;

    const refunded = Number(payload?.refunded || 0) || 0;

    const asset = String(payload?.asset || "").trim();

    const archiveKeyLine = archiveKeyFeedback(payload);

    const warContributionLine = warContributionFeedback(payload);

    const contractContributionLine = contractContributionFeedback(payload);

    const spendRefundLine = spent > 0 && asset

      ? `Spent ${spent} ${asset}${refunded > 0 ? `; refunded ${refunded}` : ""}.`

      : (refunded > 0 ? `Overflow refunded: ${refunded}` : "");

    const isPatrol = kind === "patrol";

    const report = (payload?.afterActionReport && typeof payload.afterActionReport === "object") ? payload.afterActionReport : null;

    const wpBefore = Number(report?.pressureBefore ?? payload?.wastelandPressureBefore);

    const wpAfter = Number(report?.pressureAfter ?? payload?.wastelandPressureAfter);

    const hasPressureReport = phantomMode && Number.isFinite(wpBefore) && Number.isFinite(wpAfter);

    const pressureDelta = Number(payload?.pressureDelta || (hasPressureReport ? (wpBefore - wpAfter) : 0) || 0);

    const playerImpact = Number(payload?.playerImpact || payload?.frontlineImpact || pressureDelta || 0);

    const statusBefore = String(report?.statusBefore || payload?.packDefenseStatusBefore || payload?.statusBefore || "").trim();

    const statusAfter = String(report?.statusAfter || payload?.packDefenseStatusAfter || payload?.statusAfter || "").trim();

    const weeklyPts = Number(report?.reward ?? payload?.weeklyPoints ?? 0);

    const contributionGained = Number(report?.contributionGained ?? payload?.contributionGained ?? payload?.gain ?? 0);

    const packSupportToday = Number(report?.packSupportToday ?? payload?.packSupportToday ?? 0);

    const playerSupportToday = Number(report?.playerSupportToday ?? payload?.playerSupportToday ?? 0);

    const tomorrowHook = String(report?.tomorrowHook || payload?.tomorrowHook || "Return tomorrow to see if the Pack held overnight.").trim();

    const reaction = (payload?.frontlineReaction && typeof payload.frontlineReaction === "object")

      ? payload.frontlineReaction

      : null;

    const title = phantomMode

      ? (isPatrol ? "PATROL COMPLETE" : "SUPPLIES DELIVERED")

      : (isPatrol ? "PATROL COMPLETE" : "SUPPLIES DELIVERED");

    const lead = phantomMode

      ? (hasPressureReport

        ? (reaction?.pressureLine || `Pressure: ${wpBefore}% → ${wpAfter}%`)

        : (gain > 0 ? `Pack impact +${gain}` : "Frontline updated"))

      : (gain > 0 ? `+${gain} influence` : "Influence updated");

    const baseLine = phantomMode

      ? (hasPressureReport

        ? `Pack Impact: -${Math.max(0, pressureDelta)} pressure`

        : (isPatrol ? "Your patrol helped hold the line." : "Your supplies helped hold the line."))

      : (isPatrol

        ? "You helped defend this node. Control updates with faction pressure over the cycle."

        : "Your faction’s hold is stronger. Control updates with faction pressure over the cycle.");

    const phantomLeadLine = phantomMode

      ? (weeklyPts > 0 ? `Your Support: +${weeklyPts}` : "")

      : "";

    const phantomStatusLine = phantomMode && statusBefore && statusAfter && statusBefore !== statusAfter

      ? `Status: ${statusBefore} → ${statusAfter}`

      : (phantomMode && statusAfter ? `Status: ${statusAfter}` : "");

    const phantomContributionLine = phantomMode && contributionGained > 0

      ? `Contribution: +${contributionGained}`

      : "";

    const phantomPackLine = phantomMode && packSupportToday > 0

      ? `Pack support today: ${packSupportToday}`

      : "";

    const phantomPlayerLine = phantomMode && playerSupportToday > 0

      ? `Your support today: ${playerSupportToday}`

      : "";

    const phantomTomorrowLine = phantomMode ? tomorrowHook : "";

    const phantomReactionHeadline = phantomMode && reaction?.headline

      ? String(reaction.headline)

      : "";

    const phantomReactionBody = phantomMode && reaction?.body

      ? String(reaction.body)

      : "";

    const phantomNoteLine = phantomMode

      ? (phantomReactionBody || (isPatrol

        ? String(payload?.frontlineCopy || "The line is holding, but not by much.")

        : String(payload?.frontlineCopy || "Supplies received. The relay holds longer now.")))

      : "";

    const phantomReactionLine = phantomReactionHeadline

      ? phantomReactionHeadline.charAt(0) + phantomReactionHeadline.slice(1).toLowerCase()

      : "";

    const lines = isPatrol

      ? [

          phantomReactionLine,

          baseLine,

          phantomLeadLine,

          phantomContributionLine,

          phantomPackLine,

          phantomPlayerLine,

          phantomStatusLine,

          phantomNoteLine,

          phantomTomorrowLine,

          warContributionLine,

          contractContributionLine,

          archiveKeyLine,

        ]

      : [

          phantomReactionLine,

          baseLine,

          phantomLeadLine,

          phantomContributionLine,

          phantomPackLine,

          phantomPlayerLine,

          phantomStatusLine,

          phantomNoteLine,

          phantomTomorrowLine,

          warContributionLine,

          contractContributionLine,

          spendRefundLine,

          archiveKeyLine,

        ];

    const visibleLines = lines.filter(Boolean).slice(0, 4);



    el.className = "inf-status inf-status-result";

    el.style.display = "block";

    el.style.border = "1px solid rgba(117,240,201,.22)";

    el.style.background = "linear-gradient(180deg, rgba(108,255,213,.14), rgba(70,164,214,.10))";

    el.innerHTML = `

      <div class="inf-result-kicker">Action Confirmed</div>

      <div class="inf-result-title">${title}</div>

      <div class="inf-result-gain">${esc(lead)}</div>

      <div class="inf-result-lines">

        ${visibleLines.map((line) => {

          if (line && typeof line === "object" && typeof line.html === "string") {

            return `<div class="inf-result-line is-archive-key">${line.html}</div>`;

          }

          return `<div class="inf-result-line">${esc(line)}</div>`;

        }).join("")}

      </div>

    `;

  }



  function patrolLabelForAction(actionHint) {

    const action = String(actionHint || "").trim();

    if (!action) return "Patrol";

    if (/^patrol$/i.test(action)) return "Patrol";

    if (/^low priority$/i.test(action)) return "Patrol";

    if (/^join now$/i.test(action) || /^join siege$/i.test(action)) return "Patrol to Join";

    return `Patrol to ${action}`;

  }



  function currentPatrolLabel() {

    const btn = _qs("infPatrolBtn");

    return String(btn?.dataset?.baseLabel || "Patrol");

  }



  function setPatrolButtonLabel(label) {

    const btn = _qs("infPatrolBtn");

    if (!btn) return;

    const labelEl = _qs("infPatrolLabel");

    const timerEl = _qs("infPatrolTimer");

    const next = String(label || "Patrol").trim() || "Patrol";

    btn.dataset.baseLabel = next;

    if (_cdUntilMs > Date.now()) {

      const leftSec = Math.max(0, Math.ceil((_cdUntilMs - Date.now()) / 1000));

      if (labelEl) labelEl.textContent = next;

      if (timerEl) {

        timerEl.style.display = "inline-flex";

        timerEl.textContent = fmtSec(leftSec);

      } else {

        btn.textContent = `${next} (${fmtSec(leftSec)})`;

      }

      btn.disabled = true;

      return;

    }

    if (labelEl) labelEl.textContent = next;

    if (timerEl) {

      timerEl.style.display = "none";

      timerEl.textContent = "";

    } else {

      btn.textContent = next;

    }

    btn.disabled = false;

  }



  function setSignalCorePanelOpen(open) {

    const next = !!open;

    _signalCoreOpen = next;



    const sheet = _qs("infSignalSheet");

    const backdrop = _qs("infSignalBackdrop");

    const coreBtn = _qs("infSignalCoreBtn");



    if (coreBtn) coreBtn.setAttribute("aria-expanded", next ? "true" : "false");

    if (sheet) sheet.setAttribute("aria-hidden", next ? "false" : "true");



    if (!sheet || !backdrop) return;



    if (next) {

      backdrop.style.display = "block";

      sheet.style.display = "block";

      try {

        window.navRegister?.("infSignalSheet", {

          close: () => setSignalCorePanelOpen(false),

          isOpen: () => !!_signalCoreOpen && !!sheet && sheet.style.display !== "none",

        });

        window.navOpen?.("infSignalSheet");

      } catch (_) {}

      if (_dbg) console.debug("[Influence] signal-core open");

      requestAnimationFrame(() => {

        if (!_signalCoreOpen) return;

        backdrop.classList.add("is-open");

        sheet.classList.add("is-open");

      });

      return;

    }



    backdrop.classList.remove("is-open");

    sheet.classList.remove("is-open");

    try { window.navClose?.("infSignalSheet"); } catch (_) {}

    if (_dbg) console.debug("[Influence] signal-core close");

    window.setTimeout(() => {

      if (_signalCoreOpen) return;

      backdrop.style.display = "none";

      sheet.style.display = "none";

    }, 220);

  }



  function renderSignalReadout(lines) {

    const host = _qs("infSignalReadout");

    if (!host) return;

    const safeLines = Array.isArray(lines)

      ? lines.map((line) => String(line || "").trim()).filter(Boolean).slice(0, 3)

      : [];

    const out = safeLines.length ? safeLines : ["Signal feed syncing."];

    host.innerHTML = out.map((line, idx) => `<div class="inf-signal-line${idx === 0 ? " is-primary" : ""}">${esc(line)}</div>`).join("");

  }



  function paintSignalCorePanel({

    nodeId = "",

    owner = "",

    displayStatus = "CALM",

    displayLabel = "",

    valueLabel = "",

    watchUsed = 0,

    watchMax = 0,

    watchText = "No watch roster",

    viewerPressure = 0,

    leaderPressure = 0,

    controlText = "",

  } = {}) {

    const sheetEl = _qs("infSignalSheet");

    const subtitleEl = _qs("infSignalSubtitle");

    const ownerSummaryEl = _qs("infSignalOwner");

    const statusSummaryEl = _qs("infSignalStatus");

    const pressureSummaryEl = _qs("infSignalPressureSummary");

    const valueSummaryEl = _qs("infSignalValueSummary");

    const ownerMiniEl = _qs("infSignalOwnerMini");

    const pressureMiniEl = _qs("infSignalPressureMini");

    const ownerChipEl = _qs("infSignalOwnerChip");

    const valueChipEl = _qs("infSignalValueChip");

    const statusChipEl = _qs("infSignalStatusChip");

    const readoutBadgeEl = _qs("infSignalReadoutBadge");

    const visualStateEl = _qs("infSignalVisualState");

    const visualHintEl = _qs("infSignalVisualHint");

    const tileControlEl = _qs("infSignalControlState");

    const tilePressureEl = _qs("infSignalPressure");

    const watchTileEl = _qs("infSignalWatchTile");

    const tileWatchEl = _qs("infSignalWatch");

    const tileValueEl = _qs("infSignalValue");

    const pulseEl = _qs("infSignalPulseValue");



    const statusKey = String(displayStatus || "CALM").trim().toUpperCase() || "CALM";

    const primaryStatus = uxPrimaryStatusLabel(statusKey, displayLabel);

    const chamberState = primaryStatus === "UNDER WATCH"

      ? "FORTIFIED"

      : (primaryStatus === "SECURED" ? "CALM" : primaryStatus);

    const mood = uxMoodTokens(statusKey);

    const ownerLabel = owner ? fmtFaction(owner) : "Neutral";

    const sigilUrl = factionSigilUrl(owner);

    const watchSlots = watchMax > 0

      ? `${Math.max(0, Number(watchUsed || 0))}/${Math.max(0, Number(watchMax || 0))}`

      : (watchUsed > 0 ? `${watchUsed} active` : "Open");

    const pressureText = viewerPressure > 0 && leaderPressure > 0

      ? `${viewerPressure} / ${leaderPressure}`

      : (viewerPressure > 0 ? `${viewerPressure} yours` : (leaderPressure > 0 ? `Enemy ${leaderPressure}` : "Quiet"));

    const valueText = String(valueLabel || "").trim() || "Support";

    const subtitle = owner ? `${ownerLabel} signature active` : "Unclaimed relay signature";

    const visualHintParts = [valueText];

    if (watchMax > 0 || watchUsed > 0) visualHintParts.push(`Watch ${watchSlots}`);

    const visualHint = visualHintParts.join(" • ");

    let pulseText = "Signal stable. Patrol from Orders to build local pressure.";

    if (statusKey === "CONTESTED") pulseText = "Another faction holds control. Push now to contest the relay.";

    else if (statusKey === "HOT" || statusKey === "SIEGE_LIVE") pulseText = "Enemy movement is active. Fast actions carry more weight.";

    else if (statusKey === "FORTIFIED" || statusKey === "SIEGE_COOLDOWN") pulseText = "One faction has built strong pressure. Stronger support is needed to break it.";

    else if (viewerPressure > 0) pulseText = "Your faction has pressure here. Hold tempo to keep the relay steady.";



    if (sheetEl) {

      sheetEl.style.setProperty("--inf-signal-glow", mood.border);

      sheetEl.style.setProperty("--inf-signal-soft", mood.panel);

      sheetEl.dataset.signalState = chamberState;

      sheetEl.dataset.signalOwner = owner ? String(owner).toLowerCase() : "neutral";

    }

    if (subtitleEl) subtitleEl.textContent = subtitle;

    if (ownerSummaryEl) ownerSummaryEl.textContent = ownerLabel;

    if (statusSummaryEl) statusSummaryEl.textContent = primaryStatus;

    if (pressureSummaryEl) pressureSummaryEl.textContent = pressureText;

    if (valueSummaryEl) valueSummaryEl.textContent = valueText;

    if (ownerMiniEl) ownerMiniEl.textContent = ownerLabel;

    if (pressureMiniEl) pressureMiniEl.textContent = pressureText;

    if (ownerChipEl) ownerChipEl.textContent = ownerLabel;

    if (valueChipEl) valueChipEl.textContent = valueText;

    if (statusChipEl) statusChipEl.textContent = primaryStatus;

    if (readoutBadgeEl) readoutBadgeEl.textContent = primaryStatus;

    if (visualStateEl) visualStateEl.textContent = primaryStatus;

    if (visualHintEl) visualHintEl.textContent = visualHint;

    setSignalCoreSigil(owner, sigilUrl);

    if (tileControlEl) tileControlEl.textContent = `${primaryStatus} • ${ownerLabel}`;

    if (tilePressureEl) tilePressureEl.textContent = pressureText;

    if (watchTileEl) watchTileEl.style.display = (watchMax > 0 || watchUsed > 0) ? "flex" : "none";

    if (tileWatchEl) tileWatchEl.textContent = watchSlots;

    if (tileValueEl) tileValueEl.textContent = valueText;

    if (pulseEl) pulseEl.textContent = pulseText;



    if (statusChipEl) {

      statusChipEl.style.background = mood.panel;

      statusChipEl.style.border = `1px solid ${mood.border}`;

      statusChipEl.style.color = mood.text;

    }

    if (readoutBadgeEl) {

      readoutBadgeEl.style.background = mood.panel;

      readoutBadgeEl.style.border = `1px solid ${mood.border}`;

      readoutBadgeEl.style.color = mood.text;

    }



    const lines = [];

    if (controlText) lines.push(controlText);

    else lines.push(pulseText);

    lines.push(`Pressure: ${pressureText}`);

    if (watchMax > 0 || watchUsed > 0) lines.push(`Watch slots: ${watchSlots}`);

    else lines.push(`Node value: ${valueText}`);

    renderSignalReadout(lines);

  }



  function triggerActionMicroReaction() {

    const react = (id, cls, ttl = 460) => {

      const el = _qs(id);

      if (!el) return;

      el.classList.remove(cls);

      void el.offsetWidth;

      el.classList.add(cls);

      window.setTimeout(() => {

        el.classList.remove(cls);

      }, ttl);

    };



    react("infHero", "is-action-react", 460);

    react("infSignalCoreBtn", "is-action-react", 520);

    react("infUxStatus", "is-action-react", 360);

  }



  function _stopCooldownTick() {

    if (_cdTick) { clearInterval(_cdTick); _cdTick = null; }

  }



  function _renderCooldown() {

    const btn = _qs("infPatrolBtn");

    const labelEl = _qs("infPatrolLabel");

    const timerEl = _qs("infPatrolTimer");

    const now = Date.now();

    const leftSec = Math.max(0, Math.ceil((_cdUntilMs - now) / 1000));

    const baseLabel = currentPatrolLabel();



    if (leftSec <= 0) {

      _cdUntilMs = 0;

      _stopCooldownTick();

      if (btn) {

        btn.disabled = false;

        if (labelEl) labelEl.textContent = baseLabel;

        if (timerEl) {

          timerEl.style.display = "none";

          timerEl.textContent = "";

        } else {

          btn.textContent = baseLabel;

        }

      }

      setOrdersCooldownText("Patrol ready now. Free action is back online.", "ready");

      syncPhantomImpact(_openNodeId);

      return;

    }



    if (btn) {

      btn.disabled = true;

      if (labelEl) labelEl.textContent = baseLabel;

      if (timerEl) {

        timerEl.style.display = "inline-flex";

        timerEl.textContent = fmtSec(leftSec);

      } else {

        btn.textContent = `${baseLabel} (${fmtSec(leftSec)})`;

      }

    }

    setOrdersCooldownText(`Patrol ready in ${fmtCooldownHint(leftSec)}.`, "cooldown");

    syncPhantomImpact(_openNodeId);

  }



  function startCooldown(sec) {

    sec = Math.max(0, parseInt(sec || 0, 10) || 0);

    if (sec <= 0) return;

    _cdUntilMs = Date.now() + (sec * 1000);

    _renderCooldown();

    _stopCooldownTick();

    _cdTick = setInterval(_renderCooldown, 1000);

  }



  // -------------------------

  // TG picker (max 3 buttons)

  // returns FULL faction keys

  // -------------------------

  function tgPickFaction() {

    return new Promise((resolve) => {

      const tg = _tg || window.Telegram?.WebApp || null;



      // fallback: if TG popup is unavailable, return cached faction or empty

      if (!tg?.showPopup) return resolve(_faction || "");



      const pick = (key) => { setFaction(key); resolve(key); };



      const popup1 = () => tg.showPopup({

        title: "Choose faction",

        message: "Pick your side.",

        buttons: [

          { id: "rb", type: "default", text: "Rogue Byte" },

          { id: "ew", type: "default", text: "Echo Wardens" },

          { id: "more", type: "default", text: "More..." },

        ]

      }, (btnId) => {

        if (btnId === "rb") return pick("rogue_byte");

        if (btnId === "ew") return pick("echo_wardens");

        if (btnId === "more") return popup2();

        return resolve(_faction || ""); // close

      });



      const popup2 = () => tg.showPopup({

        title: "Choose faction",

        message: "More factions:",

        buttons: [

          { id: "pb", type: "default", text: "Pack Burners" },

          { id: "ih", type: "default", text: "Inner Howl" },

          { id: "back", type: "default", text: "<- Back" },

        ]

      }, (btnId) => {

        if (btnId === "pb") return pick("pack_burners");

        if (btnId === "ih") return pick("inner_howl");

        if (btnId === "back") return popup1();

        return resolve(_faction || "");

      });



      popup1();

    });

  }



  // -------------------------

  // Frontend truth -> cache

  // -------------------------

  function syncFactionFromFrontendState() {

    const st = window.PLAYER_STATE || window.STATE || {};

    const p = st.profile || st.player || {};



    const key = normalizeFaction(

      p.faction ||

      p.faction_key ||

      p.factionKey ||

      st.faction ||

      st.faction_key ||

      window.PROFILE?.faction ||

      window.currentUserFaction ||

      _faction

    );



    _lastFactionCdSec = 0;



    if (VALID_FACTIONS.has(key)) {

      setFaction(key);

      window.currentUserFaction = key;

      return key;

    }



    return "";

  }



  // -------------------------

  // Ensure faction (truth first)

  // -------------------------

  async function ensureFaction() {

    // 1) current frontend state first (profile/state/local cache)

    const fromState = syncFactionFromFrontendState();

    if (VALID_FACTIONS.has(fromState)) return fromState;



    // 2) fallback: cached value

    if (VALID_FACTIONS.has(_faction)) return _faction;



    // 3) ask user

    const picked = await tgPickFaction();

    if (!VALID_FACTIONS.has(picked)) return "";



    setFaction(picked);

    window.currentUserFaction = picked;



    return picked;

  }



  // -------------------------

  // Error decode

  // -------------------------

  function explainFail(r, ctx = {}) {

    const reason = String(r?.reason || "FAILED");



    if (reason === "COOLDOWN") return `Cooldown: ${fmtSec(r.cooldownLeftSec)} left`;

    if (reason === "HTTP_401" || reason === "NO_UID") return "Auth missing. Close & reopen WebApp from Telegram.";

    if (reason === "NO_FACTION") { clearFactionCache(); return "Pick faction again."; }



    if (reason === "NOT_ENOUGH") {

      const have = (r?.have ?? "?");

      const need = (r?.need ?? "?");

      const a = ctx.asset ? ` ${ctx.asset}` : "";

      return `Not enough${a} (have ${have} need ${need})`;

    }

    if (reason === "TOO_SMALL") return "Amount too small.";

    if (reason === "DONATE_CAP_HIT") return `Donate capped. Refunded ${r?.refunded ?? 0}.`;

    if (reason === "BAD_NODE") return "This node isn't active yet.";

    if (reason === "BAD_ASSET") return "Bad asset type.";

    if (reason === "BAD_ACTION") return "Bad action.";

    if (reason === "CONFRONT_LOCKED") return "The Static Maw is still too strong. Lower pressure first.";

    if (reason === "CONFRONT_USED_TODAY") return "You already confronted The Static Maw today.";



    return reason;

  }



  function applyLeadersFromResponse(r, nodeId) {

    const responseFaction = normalizeFaction(

      r?.youFaction ||

      r?.you?.faction ||

      r?.data?.youFaction ||

      r?.data?.you?.faction ||

      ""

    );

    if (responseFaction) setFaction(responseFaction);



    const leaders =

      r?.leadersMap ||

      r?.leaders_map ||

      r?.data?.leadersMap ||

      r?.data?.leaders_map ||

      null;



    if (!leaders) return;

    _leadersMap = leaders;



    const info = r?.info || r?.data?.info || null;

    const safeNodeId = normalizeNodeId(nodeId || r?.nodeId || "");

    if (safeNodeId && info && typeof info === "object") {

      _nodeInfoById[safeNodeId] = {

        ...(_nodeInfoById[safeNodeId] || {}),

        ...info,

      };

    }



    try { window.AHMap?.applyLeaders?.(_leadersMap); } catch (_) {}

    try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}

    try { if (nodeId) paintLeader(nodeId); } catch (_) {}

  }



  function _modalHost() {

    let h = document.getElementById("ahModalHost");

    if (h) return h;



    h = document.createElement("div");

    h.id = "ahModalHost";

    h.style.cssText = `

      position: fixed;

      inset: 0;

      z-index: 2147483647;

      display: none; /* pokazujemy tylko gdy modal otwarty */

    `;

    (document.documentElement || document.body).appendChild(h);

    return h;

  }



  // -------------------------

  // Modal UI

  // -------------------------

  function ensureModalStyles() {

    if (document.getElementById("influenceModalStyles")) return;

    const style = document.createElement("style");

    style.id = "influenceModalStyles";

    style.textContent = `

      #influenceModal .inf-modal-card{

        --inf-accent: rgba(168, 202, 246, .28);

        --inf-accent-soft: rgba(122, 172, 238, .14);

        --inf-chip-bg: rgba(255,255,255,.05);

        --inf-chip-border: rgba(255,255,255,.16);

        position:relative;

        width:min(96vw,560px);

        background:rgba(11,15,23,.96);

        border:1px solid rgba(208,224,245,.18);

        border-radius:18px;

        box-shadow:0 24px 72px rgba(0,0,0,.56), inset 0 1px 0 rgba(255,255,255,.05);

        padding:14px 14px 13px;

        max-height:calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px);

        overflow:auto;

        -webkit-overflow-scrolling:touch;

      }

      #influenceModal .inf-head{

        display:flex;

        align-items:flex-start;

        justify-content:space-between;

        gap:12px;

      }

      #influenceModal .inf-title{

        font-weight:900;

        font-size:17px;

        line-height:1.12;

        color:#eff6ff;

      }

      #influenceModal .inf-sub{

        margin-top:3px;

        font-size:11px;

        color:#b9cbdf;

        opacity:.92;

      }

      #influenceModal .inf-hero-flavor{

        margin-top:8px;

        font-size:11px;

        line-height:1.42;

        color:#d5e3f5;

        opacity:.92;

      }

      #influenceModal .inf-label-row{

        display:inline-flex;

        align-items:center;

        gap:6px;

      }

      #influenceModal .inf-help{

        appearance:none;

        border:1px solid rgba(255,255,255,.18);

        background:rgba(255,255,255,.05);

        color:#ecf5ff;

        width:17px;

        height:17px;

        border-radius:999px;

        padding:0;

        display:inline-flex;

        align-items:center;

        justify-content:center;

        font-size:10px;

        font-weight:900;

        cursor:pointer;

        flex:0 0 auto;

      }

      #influenceModal .inf-help:active{

        transform:translateY(1px);

      }

      #influenceModal .inf-tooltip{

        position:absolute;

        z-index:6;

        display:none;

        padding:10px 11px;

        border-radius:12px;

        border:1px solid rgba(188,214,247,.22);

        background:rgba(8,13,21,.98);

        box-shadow:0 16px 30px rgba(0,0,0,.38);

      }

      #influenceModal .inf-tooltip-title{

        font-size:10px;

        letter-spacing:.11em;

        text-transform:uppercase;

        color:#b8cee7;

        opacity:.84;

      }

      #influenceModal .inf-tooltip-copy{

        margin-top:5px;

        font-size:11px;

        line-height:1.42;

        color:#e6f0fb;

      }

      #influenceModal .inf-close-btn{

        border:1px solid rgba(220,233,250,.16);

        background:rgba(14,20,30,.42);

        color:#f4f8ff;

        border-radius:10px;

        padding:8px 10px;

        cursor:pointer;

        font-weight:800;

        font-size:12px;

      }

      #influenceModal .inf-panel,

      #influenceModal .inf-hero{

        margin-top:10px;

        padding:11px 11px 12px;

        border-radius:13px;

        border:1px solid rgba(255,255,255,.12);

        background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.028));

        box-shadow:inset 0 1px 0 rgba(255,255,255,.05);

      }

      #influenceModal .inf-hero{

        background:

          radial-gradient(circle at 88% 12%, var(--inf-accent-soft), transparent 46%),

          radial-gradient(circle at 6% 94%, rgba(102,154,238,.12), transparent 45%),

          linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035));

        border-color:var(--inf-accent);

      }

      #influenceModal .inf-hero-grid{

        display:grid;

        grid-template-columns:minmax(0,1fr) 112px;

        gap:10px;

        align-items:center;

      }

      #influenceModal .inf-panel-kicker{

        font-size:10px;

        letter-spacing:.08em;

        text-transform:uppercase;

        color:#a8bdd6;

        opacity:.78;

      }

      #influenceModal .inf-leader{

        margin-top:4px;

        font-size:22px;

        line-height:1.1;

        font-weight:900;

        color:#f0f6ff;

      }

      #influenceModal .inf-control-line{

        margin-top:4px;

        font-size:11px;

        color:#c6d8ee;

        line-height:1.3;

      }

      #influenceModal .inf-node-core{

        position:relative;

        width:112px;

        height:112px;

        border-radius:15px;

        border:1px solid rgba(255,255,255,.16);

        background:

          radial-gradient(circle at 50% 50%, rgba(255,255,255,.18) 0 16%, rgba(255,255,255,.04) 38%, transparent 62%),

          linear-gradient(160deg, rgba(255,255,255,.07), rgba(255,255,255,.03));

        box-shadow:inset 0 0 0 1px rgba(0,0,0,.34), 0 10px 18px rgba(0,0,0,.24);

        display:flex;

        flex-direction:column;

        justify-content:flex-end;

        padding:8px;

        overflow:hidden;

        transition:transform .18s ease, border-color .2s ease, box-shadow .2s ease;

      }

      #influenceModal .inf-node-core-btn{

        appearance:none;

        cursor:pointer;

        text-align:left;

        color:inherit;

      }

      #influenceModal .inf-node-core-btn:hover{

        border-color:rgba(255,214,170,.34);

        box-shadow:inset 0 0 0 1px rgba(255,214,170,.14), 0 12px 22px rgba(0,0,0,.28);

      }

      #influenceModal .inf-node-core-btn:active{

        transform:translateY(1px);

      }

      #influenceModal .inf-node-core-btn:focus-visible{

        outline:1px solid rgba(255,206,156,.64);

        outline-offset:1px;

      }

      #influenceModal .inf-node-core::before{

        content:"";

        position:absolute;

        inset:10px;

        border-radius:50%;

        border:1px solid rgba(255,255,255,.18);

      }

      #influenceModal .inf-node-core::after{

        content:"";

        position:absolute;

        inset:20px;

        border-radius:50%;

        border:1px dashed rgba(255,255,255,.22);

        opacity:.75;

      }

      #influenceModal .inf-node-core-label{

        position:relative;

        font-size:9px;

        letter-spacing:.07em;

        text-transform:uppercase;

        color:#b7cbe4;

        opacity:.85;

      }

      #influenceModal .inf-node-core-state{

        position:relative;

        margin-top:3px;

        font-size:10px;

        font-weight:900;

        color:#f5fbff;

        text-transform:uppercase;

        letter-spacing:.04em;

      }

      #influenceModal .inf-node-core-hint{

        position:relative;

        margin-top:4px;

        font-size:9px;

        letter-spacing:.08em;

        text-transform:uppercase;

        color:#ffdbb3;

        opacity:.9;

      }

      #influenceModal .inf-signal-backdrop{

        position:absolute;

        inset:0;

        border:0;

        margin:0;

        padding:0;

        background:linear-gradient(180deg, rgba(4,8,14,.18), rgba(4,8,14,.68));

        opacity:0;

        pointer-events:none;

        transition:opacity .2s ease;

      }

      #influenceModal .inf-signal-backdrop.is-open{

        opacity:1;

        pointer-events:auto;

      }

      #influenceModal .inf-signal-sheet{

        --inf-signal-glow: rgba(255,196,132,.32);

        --inf-signal-soft: rgba(255,172,112,.12);

        --inf-signal-ring-speed: 14s;

        --inf-signal-ring-opacity: .42;

        --inf-signal-flicker: 0;

        --inf-signal-interference: 0;

        position:absolute;

        left:50%;

        right:auto;

        width:min(92vw, 430px);

        bottom:8px;

        z-index:2;

        border-radius:14px;

        border:1px solid rgba(255,214,172,.22);

        background:

          radial-gradient(circle at 18% 0%, var(--inf-signal-soft), transparent 42%),

          radial-gradient(circle at 50% 18%, rgba(255,255,255,.05), transparent 40%),

          linear-gradient(180deg, rgba(18,24,34,.98), rgba(10,15,24,.98));

        box-shadow:0 14px 34px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06);

        padding:10px 10px 11px;

        max-height:min(68dvh, 470px);

        overflow:auto;

        -webkit-overflow-scrolling:touch;

        overscroll-behavior:contain;

        transform:translate(-50%, 14px);

        opacity:0;

        pointer-events:none;

        transition:transform .2s ease, opacity .2s ease;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="HOT"]{

        --inf-signal-ring-speed: 7.5s;

        --inf-signal-ring-opacity: .68;

        --inf-signal-flicker: 1;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="CONTESTED"]{

        --inf-signal-ring-speed: 9.2s;

        --inf-signal-ring-opacity: .54;

        --inf-signal-interference: 1;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="FORTIFIED"]{

        --inf-signal-ring-speed: 18s;

        --inf-signal-ring-opacity: .78;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="CALM"]{

        --inf-signal-ring-speed: 16s;

        --inf-signal-ring-opacity: .34;

      }

      #influenceModal .inf-signal-sheet.is-open{

        transform:translate(-50%, 0);

        opacity:1;

        pointer-events:auto;

      }

      #influenceModal .inf-signal-head{

        display:flex;

        align-items:flex-start;

        justify-content:space-between;

        gap:10px;

        position:sticky;

        top:-12px;

        z-index:6;

        margin:-12px -12px 0;

        padding:12px 12px 10px;

        background:linear-gradient(180deg, rgba(13,20,31,.98), rgba(13,20,31,.92) 72%, rgba(13,20,31,0));

      }

      #influenceModal .inf-signal-title{

        font-size:14px;

        font-weight:900;

        line-height:1.12;

        color:#f2f8ff;

        letter-spacing:.08em;

        text-transform:uppercase;

      }

      #influenceModal .inf-signal-sub{

        margin-top:2px;

        font-size:10px;

        letter-spacing:.08em;

        color:#bdcfe6;

        opacity:.9;

      }

      #influenceModal .inf-signal-close{

        border:1px solid rgba(255,255,255,.16);

        border-radius:10px;

        background:rgba(255,255,255,.05);

        color:#edf5ff;

        padding:6px 8px;

        font-size:10px;

        font-weight:800;

        cursor:pointer;

      }

      #influenceModal .inf-signal-visual{

        position:relative;

        margin-top:7px;

        min-height:178px;

        border-radius:12px;

        border:1px solid rgba(173,201,236,.14);

        background:

          radial-gradient(circle at 50% 44%, rgba(10,18,30,.92) 0 18%, rgba(8,14,24,.74) 40%, transparent 68%),

          linear-gradient(180deg, rgba(17,26,38,.92), rgba(8,13,22,.98));

        box-shadow:inset 0 1px 0 rgba(255,255,255,.04), inset 0 -10px 24px rgba(0,0,0,.34);

        overflow:hidden;

        display:flex;

        align-items:center;

        justify-content:center;

        text-align:center;

      }

      #influenceModal .inf-signal-visual::before{

        content:"";

        position:absolute;

        inset:0;

        background:

          repeating-linear-gradient(180deg, rgba(142,196,255,.035) 0 1px, transparent 1px 6px);

        opacity:.2;

        mix-blend-mode:plus-lighter;

        pointer-events:none;

      }

      #influenceModal .inf-signal-visual::after{

        content:"";

        position:absolute;

        inset:0;

        background:

          linear-gradient(120deg, transparent 0 34%, rgba(126,194,255,.08) 50%, transparent 66% 100%);

        transform:translateX(-90%);

        animation:infSignalSweep 5.8s linear infinite;

        opacity:.24;

        pointer-events:none;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="HOT"] .inf-signal-visual::after{

        animation-duration:3.8s;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="CONTESTED"] .inf-signal-visual::after{

        opacity:.28;

        animation-duration:4.5s;

      }

      #influenceModal .inf-signal-chamber{

        position:relative;

        width:100%;

        min-height:178px;

        display:flex;

        align-items:center;

        justify-content:center;

        overflow:hidden;

      }

      #influenceModal .inf-signal-sigil-core{

        position:relative;

        z-index:2;

        width:136px;

        height:136px;

        border-radius:50%;

        display:flex;

        align-items:center;

        justify-content:center;

        background:

          radial-gradient(circle at 50% 50%, rgba(18,28,44,.96) 0 34%, rgba(10,16,26,.88) 58%, rgba(5,10,18,.26) 76%, transparent 100%);

        box-shadow:0 0 34px rgba(0,0,0,.42), 0 0 28px color-mix(in srgb, var(--inf-signal-glow) 34%, transparent);

        overflow:hidden;

      }

      #influenceModal .inf-signal-sigil-core::before{

        content:"";

        position:absolute;

        inset:-10px;

        border-radius:50%;

        border:1px solid rgba(188,220,255,.16);

        box-shadow:0 0 0 1px rgba(255,255,255,.03) inset, 0 0 20px color-mix(in srgb, var(--inf-signal-glow) 24%, transparent);

      }

      #influenceModal .inf-signal-sigil-core::after{

        content:"";

        position:absolute;

        inset:20px;

        border-radius:24px;

        border:1px solid rgba(157,196,240,.08);

        background:

          radial-gradient(circle at 50% 22%, rgba(174,216,255,.08), transparent 56%),

          linear-gradient(180deg, rgba(11,16,26,.28), rgba(5,8,14,.08));

        pointer-events:none;

      }

      #influenceModal .inf-signal-sigil-lens{

        position:relative;

        z-index:2;

        width:74%;

        height:74%;

        border-radius:24px;

        display:flex;

        align-items:center;

        justify-content:center;

        overflow:hidden;

        background:

          radial-gradient(circle at 50% 28%, rgba(34,48,68,.92), rgba(11,16,25,.98) 68%),

          linear-gradient(180deg, rgba(11,16,26,.96), rgba(6,9,14,.98));

        border:1px solid rgba(145,185,236,.14);

        box-shadow:

          inset 0 1px 0 rgba(255,255,255,.05),

          inset 0 -10px 18px rgba(0,0,0,.34);

        isolation:isolate;

      }

      #influenceModal .inf-signal-sigil-lens::before{

        content:"";

        position:absolute;

        inset:0;

        background:

          radial-gradient(circle at 50% 18%, rgba(174,216,255,.12), transparent 40%),

          radial-gradient(circle at 50% 100%, rgba(0,0,0,.34), transparent 54%);

        pointer-events:none;

      }

      #influenceModal .inf-signal-sigil{

        position:relative;

        z-index:2;

        width:100%;

        height:100%;

        object-fit:contain;

        padding:14px;

        border-radius:20px;

        background:transparent !important;

        filter:

          grayscale(1)

          contrast(1.18)

          brightness(1.26)

          drop-shadow(0 0 8px rgba(0,0,0,.26))

          drop-shadow(0 0 12px color-mix(in srgb, var(--inf-signal-glow) 24%, transparent));

        opacity:.92;

        mix-blend-mode:multiply;

        image-rendering:auto;

      }

      #influenceModal .inf-signal-sigil-core[data-sigil-mode="image"] .inf-signal-sigil-lens{

        background:

          radial-gradient(circle at 50% 28%, rgba(40,54,76,.94), rgba(10,15,24,.99) 70%),

          linear-gradient(180deg, rgba(11,16,26,.97), rgba(6,9,14,.99));

      }

      #influenceModal .inf-signal-sigil-fallback{

        position:relative;

        z-index:2;

        width:100%;

        height:100%;

        display:flex;

        align-items:center;

        justify-content:center;

        font-size:30px;

        font-weight:900;

        letter-spacing:.2em;

        color:#dcecff;

        text-transform:uppercase;

        text-shadow:0 0 10px rgba(0,0,0,.32), 0 0 18px color-mix(in srgb, var(--inf-signal-glow) 28%, transparent);

        background:

          radial-gradient(circle at 50% 34%, rgba(132,210,255,.14), transparent 44%),

          linear-gradient(180deg, rgba(7,12,20,.18), rgba(7,12,20,0));

      }

      #influenceModal .inf-signal-energy{

        position:absolute;

        width:154px;

        height:154px;

        border-radius:50%;

        background:

          radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--inf-signal-glow) 22%, transparent) 0 24%, rgba(10,16,28,.12) 44%, transparent 72%);

        filter:blur(10px);

        opacity:.62;

        animation:infSignalHalo 2.8s ease-in-out infinite;

      }

      #influenceModal .inf-signal-reticle{

        position:absolute;

        border-radius:50%;

        pointer-events:none;

      }

      #influenceModal .inf-signal-reticle.is-outer{

        width:154px;

        height:154px;

        border:1px dashed color-mix(in srgb, var(--inf-signal-glow) 66%, rgba(188,220,255,var(--inf-signal-ring-opacity)));

        animation:infSignalSpin var(--inf-signal-ring-speed) linear infinite;

      }

      #influenceModal .inf-signal-reticle.is-inner{

        width:118px;

        height:118px;

        border:1px solid rgba(188,220,255,.2);

        box-shadow:0 0 0 14px rgba(124,182,255,.025), 0 0 0 28px rgba(124,182,255,.015);

      }

      #influenceModal .inf-signal-reticle.is-crosshair{

        width:168px;

        height:168px;

      }

      #influenceModal .inf-signal-reticle.is-crosshair::before,

      #influenceModal .inf-signal-reticle.is-crosshair::after{

        content:"";

        position:absolute;

        left:50%;

        top:50%;

        background:rgba(151,201,255,.09);

        transform:translate(-50%, -50%);

      }

      #influenceModal .inf-signal-reticle.is-crosshair::before{

        width:1px;

        height:168px;

      }

      #influenceModal .inf-signal-reticle.is-crosshair::after{

        width:168px;

        height:1px;

      }

      #influenceModal .inf-signal-interference{

        position:absolute;

        inset:0;

        background:

          repeating-linear-gradient(135deg, rgba(135,192,255,.06) 0 2px, transparent 2px 8px);

        opacity:0;

        mix-blend-mode:screen;

        pointer-events:none;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="CONTESTED"] .inf-signal-interference{

        opacity:.16;

        animation:infSignalNoise 1.1s steps(2, end) infinite;

      }

      #influenceModal .inf-signal-pulse-ring{

        position:absolute;

        width:98px;

        height:98px;

        border-radius:50%;

        border:1px solid var(--inf-signal-glow);

        box-shadow:0 0 20px rgba(255,196,124,.18);

        animation:infSignalPulse 2.2s ease-out infinite;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="HOT"] .inf-signal-pulse-ring{

        animation-duration:1.45s;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="FORTIFIED"] .inf-signal-pulse-ring{

        animation-duration:3.1s;

      }

      #influenceModal .inf-signal-sheet[data-signal-state="CALM"] .inf-signal-pulse-ring{

        animation-duration:3.6s;

      }

      #influenceModal .inf-signal-visual-copy{

        position:relative;

        z-index:1;

        margin-top:116px;

        padding-bottom:10px;

      }

      #influenceModal .inf-signal-visual-state{

        font-size:13px;

        font-weight:900;

        color:#f8fbff;

        letter-spacing:.06em;

        text-transform:uppercase;

      }

      #influenceModal .inf-signal-visual-hint{

        margin-top:3px;

        font-size:10px;

        color:#d7e7fc;

        opacity:.9;

      }

      #influenceModal .inf-signal-grid{

        margin-top:7px;

        display:grid;

        grid-template-columns:minmax(0,1fr);

        gap:6px;

      }

      #influenceModal .inf-signal-tile{

        border-radius:10px;

        border:1px solid rgba(255,255,255,.1);

        background:rgba(255,255,255,.03);

        padding:7px 9px 8px;

        display:flex;

        align-items:flex-start;

        justify-content:space-between;

        gap:10px;

      }

      #influenceModal .inf-signal-tile-label{

        font-size:9px;

        text-transform:uppercase;

        letter-spacing:.08em;

        color:#aec3de;

        opacity:.82;

        flex:0 0 auto;

      }

      #influenceModal .inf-signal-tile-value{

        font-size:11px;

        font-weight:800;

        color:#eaf3ff;

        line-height:1.25;

        text-align:right;

      }

      #influenceModal .inf-signal-readout{

        margin-top:7px;

        border-radius:11px;

        border:1px solid rgba(255,255,255,.12);

        background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));

        padding:8px 9px;

      }

      #influenceModal .inf-signal-readout-title{

        font-size:9px;

        letter-spacing:.1em;

        text-transform:uppercase;

        color:#b4c8e1;

        opacity:.84;

      }

      #influenceModal .inf-signal-lines{

        margin-top:4px;

        display:grid;

        gap:3px;

      }

      #influenceModal .inf-signal-line{

        font-size:11px;

        line-height:1.34;

        color:#e5f0fd;

      }

      #influenceModal .inf-signal-pulse{

        margin-top:7px;

        border-radius:10px;

        border:1px solid rgba(255,211,156,.22);

        background:rgba(255,199,138,.09);

        padding:6px 8px;

        font-size:10px;

        color:#ffe4c1;

      }

      #influenceModal .inf-signal-foot{

        margin-top:8px;

        display:flex;

        justify-content:flex-end;

      }

      #influenceModal .inf-signal-return{

        margin-top:5px;

        font-size:9px;

        color:#afc3dc;

        opacity:.8;

      }

      #influenceModal .inf-signal-return-btn{

        min-width:160px;

        border:1px solid rgba(255,255,255,.16);

        border-radius:11px;

        background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));

        color:#edf7ff;

        padding:9px 12px;

        font-size:11px;

        font-weight:900;

        letter-spacing:.08em;

        text-transform:uppercase;

        cursor:pointer;

      }

      #influenceModal .inf-signal-sheet{

        width:min(94vw, 448px);

        border-radius:18px;

        border:1px solid rgba(130,185,245,.18);

        background:

          radial-gradient(circle at 18% 0%, rgba(92,164,255,.14), transparent 28%),

          radial-gradient(circle at 82% 12%, rgba(255,172,112,.10), transparent 24%),

          linear-gradient(180deg, rgba(15,22,34,.99), rgba(7,12,20,.99));

        box-shadow:

          0 18px 42px rgba(0,0,0,.56),

          inset 0 1px 0 rgba(255,255,255,.05);

        padding:12px 12px 13px;

        max-height:min(72dvh, 560px);

        overflow:auto;

      }

      #influenceModal .inf-signal-head{

        align-items:center;

        gap:12px;

      }

      #influenceModal .inf-signal-head-copy{

        min-width:0;

        flex:1 1 auto;

      }

      #influenceModal .inf-signal-overline{

        font-size:9px;

        letter-spacing:.18em;

        text-transform:uppercase;

        color:#91b8e7;

        opacity:.78;

      }

      #influenceModal .inf-signal-title-row{

        margin-top:4px;

        display:flex;

        align-items:center;

        gap:8px;

        flex-wrap:wrap;

      }

      #influenceModal .inf-signal-title{

        font-size:15px;

        letter-spacing:.12em;

      }

      #influenceModal .inf-signal-sub{

        margin-top:4px;

        font-size:10px;

        line-height:1.35;

        color:#d5e4f7;

      }

      #influenceModal .inf-signal-state-chip,

      #influenceModal .inf-signal-chip,

      #influenceModal .inf-signal-readout-badge{

        display:inline-flex;

        align-items:center;

        justify-content:center;

        min-height:22px;

        padding:0 9px;

        border-radius:999px;

        font-size:10px;

        font-weight:900;

        letter-spacing:.08em;

        text-transform:uppercase;

        border:1px solid rgba(255,255,255,.14);

        background:rgba(255,255,255,.06);

        color:#eef6ff;

      }

      #influenceModal .inf-signal-summary{

        margin-top:10px;

        display:grid;

        grid-template-columns:repeat(2, minmax(0,1fr));

        gap:8px;

      }

      #influenceModal .inf-signal-summary-item{

        border-radius:12px;

        border:1px solid rgba(255,255,255,.09);

        background:

          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02)),

          rgba(8,12,20,.72);

        padding:8px 9px 9px;

        min-width:0;

      }

      #influenceModal .inf-signal-summary-label{

        font-size:9px;

        letter-spacing:.12em;

        text-transform:uppercase;

        color:#90add0;

        opacity:.84;

      }

      #influenceModal .inf-signal-summary-value{

        margin-top:4px;

        font-size:12px;

        font-weight:900;

        color:#f1f7ff;

        line-height:1.28;

        overflow-wrap:anywhere;

      }

      #influenceModal .inf-signal-visual{

        margin-top:10px;

        min-height:240px;

        border-radius:16px;

        border:1px solid rgba(149,197,255,.12);

        background:

          radial-gradient(circle at 50% 44%, rgba(16,29,45,.96) 0 18%, rgba(8,14,24,.86) 38%, rgba(7,12,20,.96) 100%),

          linear-gradient(180deg, rgba(17,26,38,.96), rgba(8,13,22,.98));

        box-shadow:

          inset 0 1px 0 rgba(255,255,255,.04),

          inset 0 -18px 28px rgba(0,0,0,.34);

        padding:14px 12px 18px;

      }

      #influenceModal .inf-signal-gridlines{

        position:absolute;

        left:14px;

        right:14px;

        top:14px;

        height:52px;

        border-top:1px solid rgba(155,201,255,.12);

        border-bottom:1px solid rgba(155,201,255,.06);

        background:

          repeating-linear-gradient(90deg, rgba(132,184,248,.08) 0 1px, transparent 1px 28px);

        opacity:.58;

        pointer-events:none;

      }

      #influenceModal .inf-signal-visual::before{

        opacity:.24;

      }

      #influenceModal .inf-signal-visual::after{

        opacity:.18;

      }

      #influenceModal .inf-signal-visual-top{

        position:absolute;

        top:14px;

        left:14px;

        right:14px;

        z-index:2;

        display:flex;

        justify-content:space-between;

        gap:10px;

      }

      #influenceModal .inf-signal-visual-topline{

        min-width:0;

        display:flex;

        flex-direction:column;

        gap:3px;

        padding:6px 8px;

        border-radius:11px;

        border:1px solid rgba(255,255,255,.08);

        background:rgba(7,13,22,.54);

      }

      #influenceModal .inf-signal-mini-label{

        font-size:8px;

        letter-spacing:.14em;

        text-transform:uppercase;

        color:#89a9cf;

      }

      #influenceModal .inf-signal-mini-value{

        font-size:10px;

        font-weight:800;

        color:#edf5ff;

        overflow-wrap:anywhere;

      }

      #influenceModal .inf-signal-chamber{

        min-height:240px;

        padding-top:40px;

        padding-bottom:56px;

      }

      #influenceModal .inf-signal-dais{

        position:absolute;

        left:50%;

        bottom:34px;

        width:min(82%, 280px);

        height:46px;

        transform:translateX(-50%);

        border-radius:50%;

        background:

          radial-gradient(circle at 50% 50%, rgba(92,164,255,.12) 0 20%, rgba(10,16,28,.92) 54%, rgba(6,10,18,.26) 76%, transparent 100%);

        box-shadow:

          0 16px 24px rgba(0,0,0,.36),

          0 0 0 1px rgba(151,201,255,.08);

      }

      #influenceModal .inf-signal-sigil-core{

        width:148px;

        height:148px;

        background:

          radial-gradient(circle at 50% 50%, rgba(18,30,47,.98) 0 30%, rgba(10,17,28,.94) 56%, rgba(6,10,18,.26) 78%, transparent 100%);

        box-shadow:

          0 18px 34px rgba(0,0,0,.42),

          0 0 28px color-mix(in srgb, var(--inf-signal-glow) 26%, transparent);

      }

      #influenceModal .inf-signal-sigil-core::before{

        inset:-12px;

        border-color:rgba(188,220,255,.14);

      }

      #influenceModal .inf-signal-sigil-core::after{

        inset:22px;

      }

      #influenceModal .inf-signal-energy{

        width:172px;

        height:172px;

        opacity:.54;

      }

      #influenceModal .inf-signal-reticle.is-outer{

        width:170px;

        height:170px;

      }

      #influenceModal .inf-signal-reticle.is-inner{

        width:128px;

        height:128px;

      }

      #influenceModal .inf-signal-reticle.is-crosshair{

        width:188px;

        height:188px;

      }

      #influenceModal .inf-signal-reticle.is-crosshair::before{

        height:188px;

      }

      #influenceModal .inf-signal-reticle.is-crosshair::after{

        width:188px;

      }

      #influenceModal .inf-signal-pulse-ring{

        width:108px;

        height:108px;

      }

      #influenceModal .inf-signal-visual-copy{

        position:absolute;

        left:50%;

        bottom:78px;

        width:min(82%, 280px);

        transform:translateX(-50%);

        margin-top:0;

        padding-bottom:0;

        display:flex;

        flex-direction:column;

        align-items:center;

        text-align:center;

      }

      #influenceModal .inf-signal-visual-state{

        font-size:15px;

        letter-spacing:.12em;

      }

      #influenceModal .inf-signal-visual-hint{

        margin-top:5px;

        font-size:10px;

        line-height:1.35;

        max-width:100%;

      }

      #influenceModal .inf-signal-chamber-status{

        position:absolute;

        left:14px;

        right:14px;

        bottom:14px;

        z-index:2;

        display:flex;

        justify-content:center;

        gap:8px;

        flex-wrap:wrap;

      }

      #influenceModal .inf-signal-chip{

        background:rgba(9,14,24,.74);

      }

      #influenceModal .inf-signal-chip.is-value{

        border-color:rgba(255,214,142,.20);

        color:#ffe8ba;

      }

      #influenceModal .inf-signal-grid{

        margin-top:10px;

        grid-template-columns:repeat(2, minmax(0,1fr));

        gap:8px;

      }

      #influenceModal .inf-signal-tile{

        min-height:72px;

        display:flex;

        flex-direction:column;

        justify-content:space-between;

        padding:9px 10px 10px;

        border-radius:12px;

        border:1px solid rgba(255,255,255,.08);

        background:

          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02)),

          rgba(8,12,20,.68);

      }

      #influenceModal .inf-signal-tile-label{

        font-size:9px;

        letter-spacing:.12em;

        color:#91add0;

      }

      #influenceModal .inf-signal-tile-value{

        margin-top:8px;

        font-size:12px;

        line-height:1.35;

        text-align:left;

        overflow-wrap:anywhere;

      }

      #influenceModal .inf-signal-readout{

        margin-top:10px;

        padding:10px 10px 11px 13px;

        border-radius:13px;

        border:1px solid rgba(255,255,255,.10);

        background:

          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02)),

          rgba(9,13,22,.74);

        position:relative;

        overflow:hidden;

      }

      #influenceModal .inf-signal-readout::before{

        content:"";

        position:absolute;

        left:0;

        top:10px;

        bottom:10px;

        width:3px;

        border-radius:999px;

        background:linear-gradient(180deg, rgba(115,220,255,.95), rgba(255,160,102,.88));

      }

      #influenceModal .inf-signal-readout-head{

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:8px;

      }

      #influenceModal .inf-signal-readout-title{

        font-size:9px;

        letter-spacing:.14em;

      }

      #influenceModal .inf-signal-lines{

        margin-top:6px;

        gap:5px;

      }

      #influenceModal .inf-signal-line{

        font-size:11px;

        color:#dce8f7;

      }

      #influenceModal .inf-signal-line.is-primary{

        font-size:12px;

        font-weight:800;

        color:#f3f8ff;

      }

      #influenceModal .inf-signal-pulse{

        margin-top:9px;

        border-radius:12px;

        border:1px solid rgba(255,214,156,.16);

        background:

          linear-gradient(180deg, rgba(255,206,148,.10), rgba(255,168,108,.06)),

          rgba(16,12,12,.52);

        padding:8px 10px;

        font-size:10px;

        line-height:1.4;

      }

      #influenceModal .inf-signal-return{

        margin-top:7px;

        font-size:10px;

        line-height:1.35;

      }

      #influenceModal .inf-signal-foot{

        margin-top:10px;

      }

      #influenceModal .inf-signal-return-btn{

        width:100%;

        min-width:0;

        border-radius:12px;

        padding:10px 12px;

      }

      @media (max-width: 520px){

        #influenceModal .inf-signal-sheet{

          width:min(96vw,430px);

          padding:10px 10px 11px;

          max-height:min(78dvh, calc(100dvh - 20px));

        }

        #influenceModal .inf-signal-summary{

          gap:6px;

        }

        #influenceModal .inf-signal-visual{

          min-height:224px;

          padding:12px 10px 16px;

        }

        #influenceModal .inf-signal-chamber{

          min-height:224px;

          padding-top:42px;

          padding-bottom:52px;

        }

        #influenceModal .inf-signal-grid{

          grid-template-columns:minmax(0,1fr);

        }

        #influenceModal .inf-signal-visual-top{

          gap:6px;

        }

        #influenceModal .inf-signal-visual-topline{

          padding:5px 7px;

        }

      }

      #influenceModal .inf-hero.is-action-react{

        animation:infHeroActionPulse .44s ease;

      }

      #influenceModal .inf-node-core.is-action-react::before{

        animation:infCoreActionPulse .5s ease;

      }

      #influenceModal .inf-chip.is-action-react{

        animation:infChipSnap .36s ease;

      }

      @keyframes infSignalSpin{

        from{ transform:rotate(0deg); }

        to{ transform:rotate(360deg); }

      }

      @keyframes infSignalSweep{

        0%{ transform:translateX(-90%); }

        100%{ transform:translateX(120%); }

      }

      @keyframes infSignalPulse{

        0%{ transform:scale(.85); opacity:.7; }

        70%{ transform:scale(1.22); opacity:0; }

        100%{ transform:scale(1.22); opacity:0; }

      }

      @keyframes infSignalHalo{

        0%,100%{ transform:scale(.96); opacity:.68; }

        50%{ transform:scale(1.08); opacity:.94; }

      }

      @keyframes infSignalNoise{

        0%,100%{ transform:translate3d(0,0,0); opacity:.08; }

        25%{ transform:translate3d(-3px, 1px, 0); opacity:.14; }

        50%{ transform:translate3d(2px, -2px, 0); opacity:.2; }

        75%{ transform:translate3d(1px, 3px, 0); opacity:.12; }

      }

      @keyframes infHeroActionPulse{

        0%{ box-shadow:inset 0 1px 0 rgba(255,255,255,.05); }

        45%{ box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(255,214,146,.24); }

        100%{ box-shadow:inset 0 1px 0 rgba(255,255,255,.05); }

      }

      @keyframes infCoreActionPulse{

        0%{ transform:scale(.98); opacity:.72; }

        55%{ transform:scale(1.12); opacity:.3; }

        100%{ transform:scale(1.16); opacity:.08; }

      }

      @keyframes infChipSnap{

        0%{ transform:scale(1); }

        45%{ transform:scale(1.06); }

        100%{ transform:scale(1); }

      }

      @keyframes infHotPulse{

        0%{ box-shadow:0 0 0 0 rgba(255,184,96,.24); }

        60%{ box-shadow:0 0 0 7px rgba(255,184,96,0); }

        100%{ box-shadow:0 0 0 0 rgba(255,184,96,0); }

      }

      #influenceModal .inf-chip-row{

        margin-top:8px;

        display:flex;

        flex-wrap:wrap;

        gap:6px;

      }

      #influenceModal .inf-chip{

        display:inline-flex;

        align-items:center;

        justify-content:center;

        min-height:22px;

        padding:4px 8px;

        border-radius:999px;

        background:var(--inf-chip-bg);

        border:1px solid var(--inf-chip-border);

        color:#e2eefc;

        font-size:10px;

        font-weight:800;

        letter-spacing:.04em;

        text-transform:uppercase;

        line-height:1;

      }

      #influenceModal .inf-chip-muted{

        background:rgba(255,255,255,.04);

        border-color:rgba(255,255,255,.12);

        color:#c7d8ee;

      }

      #influenceModal .inf-hero-status{

        margin-top:8px;

        font-size:13px;

        line-height:1.34;

        color:#dfecff;

      }

      #influenceModal .inf-hero.is-hot{

        box-shadow:0 0 0 1px rgba(255,196,120,.16), inset 0 1px 0 rgba(255,255,255,.06);

      }

      #influenceModal .inf-chip.is-hot{

        animation:infHotPulse 1.8s ease-in-out infinite;

      }

      #influenceModal .inf-panel-head{

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:8px;

        flex-wrap:wrap;

      }

      #influenceModal .inf-panel-title{

        font-size:10px;

        letter-spacing:.09em;

        text-transform:uppercase;

        color:#afc3dd;

        opacity:.84;

      }

      #influenceModal .inf-action-grid{

        margin-top:8px;

        display:grid;

        grid-template-columns:repeat(2,minmax(0,1fr));

        gap:8px;

      }

      #influenceModal .inf-action-card{

        border:1px solid rgba(255,255,255,.15);

        border-radius:12px;

        padding:11px 10px 10px;

        text-align:left;

        background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));

        box-shadow:inset 0 1px 0 rgba(255,255,255,.08);

        cursor:pointer;

        color:#e8f3ff;

        display:grid;

        gap:6px;

        transition:transform .14s ease, border-color .18s ease, box-shadow .18s ease;

      }

      #influenceModal .inf-action-card:not(:disabled):hover{

        box-shadow:inset 0 1px 0 rgba(255,255,255,.11), 0 6px 12px rgba(0,0,0,.2);

      }

      #influenceModal .inf-action-card:not(:disabled):active{

        transform:translateY(1px);

      }

      #influenceModal .inf-action-card:disabled{

        opacity:.66;

        cursor:not-allowed;

      }

      #influenceModal .inf-action-card-primary{

        border-color:rgba(120,255,220,.28);

        background:linear-gradient(180deg, rgba(120,255,220,.16), rgba(120,255,220,.07));

      }

      #influenceModal .inf-action-card-support{

        border-color:rgba(170,140,255,.30);

        background:linear-gradient(180deg, rgba(170,140,255,.16), rgba(170,140,255,.07));

      }

      #influenceModal .inf-action-line{

        display:flex;

        align-items:center;

        gap:6px;

        min-width:0;

      }

      #influenceModal .inf-action-icon{

        display:inline-flex;

        align-items:center;

        justify-content:center;

        min-width:28px;

        height:20px;

        border-radius:999px;

        border:1px solid rgba(255,255,255,.2);

        background:rgba(0,0,0,.22);

        font-size:10px;

        font-weight:900;

        letter-spacing:.04em;

      }

      #influenceModal .inf-action-title{

        font-size:14px;

        font-weight:900;

        white-space:nowrap;

        overflow:hidden;

        text-overflow:ellipsis;

      }

      #influenceModal .inf-action-tag{

        margin-left:auto;

        min-width:46px;

        justify-content:center;

      }

      #influenceModal .inf-action-effect{

        font-size:11px;

        line-height:1.34;

        color:#cfe1f7;

        opacity:.94;

      }

      #influenceModal .inf-action-chip{

        display:inline-flex;

        align-items:center;

        width:max-content;

        padding:2px 7px;

        border-radius:999px;

        border:1px solid rgba(255,255,255,.18);

        background:rgba(0,0,0,.24);

        font-size:9px;

        font-weight:800;

        letter-spacing:.06em;

        text-transform:uppercase;

      }

      #influenceModal .inf-watch-line{

        margin-top:8px;

        padding:7px 8px;

        border-radius:10px;

        border:1px solid rgba(255,186,116,.20);

        background:rgba(255,186,116,.08);

        font-size:11px;

        line-height:1.35;

        color:#e6d1b0;

      }

      #influenceModal .inf-orders-cooldown{

        margin-top:7px;

        font-size:11px;

        line-height:1.35;

        color:#c9dbef;

      }

      #influenceModal .inf-orders-cooldown[data-tone="cooldown"]{

        color:#ffd8a6;

      }

      #influenceModal .inf-orders-cooldown[data-tone="ready"]{

        color:#aaf4c8;

      }

      #influenceModal .inf-local-grid,

      #influenceModal .inf-status-grid{

        margin-top:8px;

        display:grid;

        grid-template-columns:repeat(2,minmax(0,1fr));

        gap:7px;

      }

      #influenceModal .inf-tile{

        border-radius:10px;

        border:1px solid rgba(255,255,255,.1);

        background:rgba(255,255,255,.03);

        padding:8px 8px 9px;

      }

      #influenceModal .inf-tile-label{

        font-size:10px;

        text-transform:uppercase;

        letter-spacing:.05em;

        color:#b5c8de;

        opacity:.78;

      }

      #influenceModal .inf-tile-value{

        margin-top:4px;

        font-size:12px;

        font-weight:800;

        color:#e2efff;

        line-height:1.3;

      }

      #influenceModal .inf-meter{

        margin-top:6px;

        height:5px;

        border-radius:999px;

        overflow:hidden;

        background:rgba(255,255,255,.08);

      }

      #influenceModal .inf-meter > i{

        display:block;

        width:0%;

        height:100%;

        background:linear-gradient(90deg, rgba(120,198,255,.92), rgba(255,150,110,.9));

      }

      #influenceModal .inf-hint{

        margin-top:4px;

        font-size:10px;

        color:#b9cde6;

        opacity:.84;

        line-height:1.3;

      }

      #influenceModal .inf-intel-block{

        margin-top:8px;

        border-radius:11px;

        border:1px solid rgba(255,255,255,.11);

        background:rgba(255,255,255,.03);

        padding:8px 9px;

      }

      #influenceModal .inf-intel-label{

        font-size:10px;

        text-transform:uppercase;

        letter-spacing:.05em;

        color:#b8cce6;

        opacity:.78;

      }

      #influenceModal .inf-intel-copy{

        margin-top:4px;

        font-size:12px;

        line-height:1.35;

        color:#deebfd;

      }

      #influenceModal .inf-intel-lore{

        margin-top:8px;

        border-radius:11px;

        border:1px solid rgba(255,255,255,.12);

        background:rgba(255,255,255,.035);

        padding:8px 9px;

        display:grid;

        gap:5px;

      }

      #influenceModal .inf-intel-line{

        font-size:11px;

        color:#d4e4fa;

        line-height:1.34;

      }

      #influenceModal .inf-donate-box{

        margin-top:10px;

        padding:10px;

        border-radius:12px;

        background:linear-gradient(180deg,rgba(170,140,255,.11),rgba(170,140,255,.05));

        border:1px solid rgba(170,140,255,.24);

      }

      #influenceModal .inf-donate-shell{

        padding:7px 8px;

        border-radius:10px;

        background:rgba(170,140,255,.12);

        border:1px solid rgba(170,140,255,.24);

        font-size:11px;

        color:#e6dcff;

      }

      #influenceModal .inf-donate-inputs{

        display:flex;

        gap:8px;

        align-items:center;

        margin-top:8px;

      }

      #influenceModal .inf-donate-select,

      #influenceModal .inf-donate-amount{

        border-radius:11px;

        border:1px solid rgba(255,255,255,.20);

        background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.08));

        color:#f5f8ff;

        padding:9px 10px;

      }

      #influenceModal .inf-donate-select{ flex:1; }

      #influenceModal .inf-donate-amount{ width:118px; }

      #influenceModal .inf-donate-quick{

        margin-top:8px;

        display:grid;

        grid-template-columns:repeat(3,minmax(0,1fr));

        gap:8px;

      }

      #influenceModal .inf-donate-quick button{

        border:1px solid rgba(255,255,255,.18);

        border-radius:10px;

        padding:9px 6px;

        background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.07));

        color:#f4f8ff;

        font-weight:800;

        cursor:pointer;

      }

      #influenceModal .inf-donate-note{

        margin-top:6px;

        font-size:10px;

        color:#c8d6ea;

        opacity:.84;

      }

      #influenceModal .inf-donate-confirm{

        width:100%;

        margin-top:10px;

        border:1px solid rgba(255,210,120,.26);

        border-radius:12px;

        padding:11px 12px;

        background:linear-gradient(180deg, rgba(255,210,120,.18), rgba(255,210,120,.10));

        color:#fff6e8;

        font-weight:900;

        cursor:pointer;

      }

      #influenceModal .inf-status{

        margin-top:10px;

        padding:10px 12px;

        border-radius:12px;

        font-size:12px;

        line-height:1.35;

        opacity:.95;

      }

      #influenceModal .inf-status-result{

        padding:12px 12px 13px;

        box-shadow:inset 0 1px 0 rgba(255,255,255,.08);

      }

      #influenceModal .inf-result-kicker{

        font-size:10px;

        letter-spacing:.11em;

        text-transform:uppercase;

        color:#bce9ff;

        opacity:.82;

      }

      #influenceModal .inf-result-title{

        margin-top:4px;

        font-size:16px;

        line-height:1.1;

        font-weight:900;

        color:#f2fbff;

      }

      #influenceModal .inf-result-gain{

        margin-top:4px;

        font-size:13px;

        font-weight:800;

        color:#aef6d0;

      }

      #influenceModal .inf-result-lines{

        margin-top:7px;

        display:grid;

        gap:3px;

      }

      #influenceModal .inf-result-line{

        font-size:11px;

        color:#d7e8f7;

      }

      #influenceModal .inf-result-keyline{

        display:inline-flex;

        align-items:center;

        gap:7px;

      }

      #influenceModal .inf-result-keycopy{

        display:grid;

        gap:2px;

      }

      #influenceModal .inf-result-keycopy span{

        display:block;

      }

      #influenceModal .inf-result-keyicon{

        width:16px;

        height:16px;

        display:block;

        object-fit:contain;

        filter:drop-shadow(0 0 9px rgba(124,208,255,.32));

      }

      #influenceModal .inf-foot{

        margin-top:10px;

        font-size:10px;

        color:#c5d4e9;

        opacity:.84;

      }

      #influenceModal .inf-weekly-preview,

      #influenceModal .inf-weekly-shell{

        margin-top:10px;

        padding:10px 11px 11px;

        border-radius:13px;

        border:1px solid rgba(255,255,255,.12);

        background:

          radial-gradient(circle at 90% 10%, rgba(126,190,255,.12), transparent 44%),

          linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.03));

      }

      #influenceModal .inf-weekly-preview{

        display:flex;

        align-items:flex-start;

        justify-content:space-between;

        gap:10px;

        flex-wrap:wrap;

      }

      #influenceModal .inf-weekly-mini-grid{

        width:100%;

        display:grid;

        grid-template-columns:repeat(3,minmax(0,1fr));

        gap:7px;

      }

      #influenceModal .inf-weekly-mini-card{

        border-radius:10px;

        border:1px solid rgba(255,255,255,.1);

        background:rgba(255,255,255,.035);

        padding:8px 9px;

      }

      #influenceModal .inf-weekly-mini-label{

        font-size:9px;

        letter-spacing:.08em;

        text-transform:uppercase;

        color:#aac1da;

        opacity:.82;

      }

      #influenceModal .inf-weekly-mini-value{

        margin-top:4px;

        font-size:12px;

        line-height:1.32;

        font-weight:800;

        color:#edf5ff;

      }

      #influenceModal .inf-weekly-head{

        display:flex;

        align-items:flex-start;

        justify-content:space-between;

        gap:10px;

        flex-wrap:wrap;

      }

      #influenceModal .inf-weekly-title{

        margin-top:4px;

        font-size:14px;

        line-height:1.2;

        font-weight:900;

        color:#eef6ff;

      }

      #influenceModal .inf-weekly-sub{

        margin-top:4px;

        font-size:11px;

        color:#c4d7ee;

        line-height:1.35;

      }

      #influenceModal .inf-weekly-grid{

        margin-top:8px;

        display:grid;

        grid-template-columns:repeat(2,minmax(0,1fr));

        gap:8px;

      }

      #influenceModal .inf-weekly-board{

        border-radius:11px;

        border:1px solid rgba(255,255,255,.10);

        background:rgba(255,255,255,.03);

        padding:8px 9px;

      }

      #influenceModal .inf-race-lanes{

        margin-top:6px;

        display:grid;

        gap:6px;

      }

      #influenceModal .inf-race-lane{

        border-radius:10px;

        border:1px solid rgba(var(--lane-rgb), .30);

        background:rgba(var(--lane-rgb), .09);

        padding:7px 8px;

      }

      #influenceModal .inf-race-lane.is-leader{

        box-shadow:0 0 0 1px rgba(255,221,148,.36) inset;

      }

      #influenceModal .inf-race-lane.is-viewer{

        box-shadow:0 0 0 1px rgba(120,255,220,.34) inset;

      }

      #influenceModal .inf-race-lane-head{

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:8px;

      }

      #influenceModal .inf-race-rank{

        display:inline-flex;

        align-items:center;

        justify-content:center;

        width:24px;

        height:20px;

        border-radius:999px;

        background:rgba(0,0,0,.24);

        border:1px solid rgba(255,255,255,.18);

        font-size:10px;

        font-weight:900;

      }

      #influenceModal .inf-race-name{

        flex:1;

        min-width:0;

        display:flex;

        align-items:center;

        gap:6px;

        font-size:12px;

        font-weight:800;

        white-space:nowrap;

        overflow:hidden;

        text-overflow:ellipsis;

      }

      #influenceModal .inf-race-badge{

        display:inline-flex;

        align-items:center;

        justify-content:center;

        min-width:24px;

        height:18px;

        border-radius:999px;

        border:1px solid rgba(255,255,255,.2);

        background:rgba(0,0,0,.22);

        font-size:9px;

        letter-spacing:.05em;

      }

      #influenceModal .inf-race-you{

        margin-left:2px;

        font-size:9px;

        letter-spacing:.05em;

        color:#98f0c7;

      }

      #influenceModal .inf-race-score{

        font-size:14px;

        font-weight:900;

        color:#ebf4ff;

      }

      #influenceModal .inf-race-bar{

        margin-top:6px;

        height:5px;

        border-radius:999px;

        overflow:hidden;

        background:rgba(255,255,255,.1);

      }

      #influenceModal .inf-race-bar i{

        display:block;

        height:100%;

        background:linear-gradient(90deg, rgba(var(--lane-rgb), .96), rgba(255,255,255,.7));

      }

      #influenceModal .inf-race-meta{

        margin-top:4px;

        font-size:10px;

        color:#c2d6ee;

        opacity:.9;

      }

      #influenceModal .inf-reward-state{

        margin-top:6px;

        display:flex;

        align-items:center;

        gap:6px;

        flex-wrap:wrap;

        font-size:12px;

        font-weight:800;

      }

      #influenceModal .inf-reward-metric{

        margin-top:7px;

      }

      #influenceModal .inf-reward-metric-head{

        display:flex;

        justify-content:space-between;

        gap:8px;

        font-size:11px;

        font-weight:700;

        color:#dbe9fb;

      }

      #influenceModal .inf-reward-track{

        margin-top:5px;

        height:6px;

        border-radius:999px;

        overflow:hidden;

        background:rgba(255,255,255,.1);

      }

      #influenceModal .inf-reward-track i{

        display:block;

        height:100%;

        background:linear-gradient(90deg, rgba(121,232,255,.9), rgba(104,148,255,.82));

      }

      #influenceModal .inf-reward-track-days i{

        background:linear-gradient(90deg, rgba(255,211,111,.9), rgba(255,165,116,.82));

      }

      #influenceModal .inf-reward-checklist{

        margin-top:8px;

        display:grid;

        grid-template-columns:repeat(3,minmax(0,1fr));

        gap:6px;

      }

      #influenceModal .inf-reward-check{

        border-radius:9px;

        border:1px solid rgba(255,255,255,.14);

        background:rgba(255,255,255,.04);

        padding:6px;

        display:grid;

        gap:2px;

        font-size:9px;

        text-transform:uppercase;

        letter-spacing:.05em;

        color:#bed0e8;

      }

      #influenceModal .inf-reward-check span:first-child{

        font-size:10px;

        font-weight:900;

        color:#ffe0b1;

      }

      #influenceModal .inf-reward-check.is-ready{

        border-color:rgba(110,255,170,.28);

        background:rgba(110,255,170,.1);

      }

      #influenceModal .inf-reward-check.is-ready span:first-child{

        color:#a4f3c4;

      }

      #influenceModal .inf-reward-check.is-meta span:first-child{

        color:#dceafe;

      }

      #influenceModal .inf-weekly-details{

        margin-top:8px;

      }

      #influenceModal .inf-weekly-details summary{

        cursor:pointer;

        font-size:11px;

        font-weight:800;

        color:#d9e7fa;

      }

      #influenceModal .inf-weekly-cache{

        margin-top:7px;

        display:grid;

        gap:7px;

      }

      #influenceModal .inf-cache-line{

        border-radius:9px;

        border:1px solid rgba(255,255,255,.1);

        background:rgba(255,255,255,.03);

        padding:7px 8px;

        font-size:11px;

        line-height:1.35;

        color:#c8daee;

      }

      #influenceModal .inf-cache-grid{

        margin-top:6px;

        display:grid;

        gap:6px;

      }

      #influenceModal .inf-compact-card{

        border-radius:10px;

        border:1px solid rgba(255,255,255,.1);

        background:rgba(255,255,255,.035);

        padding:8px 9px;

        display:flex;

        justify-content:space-between;

        gap:8px;

      }

      #influenceModal .inf-compact-head{

        display:flex;

        justify-content:space-between;

        align-items:flex-start;

        gap:8px;

        width:100%;

      }

      #influenceModal .inf-compact-title{

        font-size:12px;

        font-weight:900;

        color:#eef6ff;

        white-space:nowrap;

        overflow:hidden;

        text-overflow:ellipsis;

      }

      #influenceModal .inf-compact-copy{

        margin-top:2px;

        font-size:10px;

        line-height:1.35;

        color:#c2d4ea;

      }

      #influenceModal .inf-empty-card{

        border-radius:10px;

        border:1px solid rgba(255,255,255,.1);

        background:rgba(255,255,255,.03);

        padding:9px;

        font-size:11px;

        color:#c4d3e7;

      }

      @media (prefers-reduced-motion: reduce){

        #influenceModal .inf-node-core,

        #influenceModal .inf-action-card,

        #influenceModal .inf-signal-backdrop,

        #influenceModal .inf-signal-sheet{

          transition:none !important;

        }

        #influenceModal .inf-hero.is-action-react,

        #influenceModal .inf-node-core.is-action-react::before,

        #influenceModal .inf-chip.is-action-react{

          animation:none !important;

        }

        #influenceModal .inf-chip.is-hot{

          animation:none !important;

        }

        #influenceModal .inf-signal-visual::after,

        #influenceModal .inf-signal-pulse-ring,

        #influenceModal .inf-signal-energy,

        #influenceModal .inf-signal-reticle.is-outer,

        #influenceModal .inf-signal-interference{

          animation:none !important;

        }

      }

      /* Phantom Nodes Control Clash meter (compact, game-like, code-only) */

      #influenceModal .inf-clash-meter{

        border:1px solid rgba(255,255,255,.12);

        border-radius:10px;

        background:rgba(255,255,255,.025);

        padding:6px 8px;

        font-size:11px;

        line-height:1.25;

      }

      #influenceModal .inf-clash-head{

        font-weight:800;

        font-size:12px;

        color:#f0f6ff;

        margin-bottom:4px;

        text-transform:uppercase;

        letter-spacing:.04em;

      }

      #influenceModal .inf-clash-sides{

        display:flex;

        justify-content:space-between;

        font-size:10px;

        margin-bottom:3px;

        color:#c6d8ee;

      }

      #influenceModal .inf-clash-side.your .name{ color:#7af0c8; }

      #influenceModal .inf-clash-side.enemy .name{ color:#ff9a8a; }

      #influenceModal .inf-clash-bar{

        height:6px;

        background:rgba(255,255,255,.08);

        border-radius:999px;

        overflow:hidden;

        display:flex;

      }

      #influenceModal .inf-clash-bar > div.your{

        background:linear-gradient(90deg, #7af0c8, #4fd1a8);

        min-height:100%;

      }

      #influenceModal .inf-clash-bar > div.enemy{

        background:linear-gradient(90deg, #ff9a8a, #ff6b6b);

        min-height:100%;

      }



      /* De-emphasize dense Intel/Faction Control tiles for Phantom Nodes (make feel like details) */

      #influenceCard.is-phantom-node .inf-local-grid{

        opacity:.82;

        gap:3px;

      }

      #influenceCard.is-phantom-node .inf-tile{

        padding:5px 6px 6px;

        background:rgba(255,255,255,.02);

        border-color:rgba(255,255,255,.08);

      }

      #influenceCard.is-phantom-node .inf-tile-label{

        font-size:9px;

        opacity:.7;

      }

      #influenceCard.is-phantom-node .inf-tile-value{

        font-size:11px;

      }

      #influenceCard.is-phantom-node .inf-hint{

        font-size:9px;

      }

      #influenceCard.is-phantom-node .inf-head{

        align-items:flex-start;

      }

      #influenceCard.is-phantom-node .inf-title{

        font-size:28px;

        line-height:1;

        letter-spacing:.06em;

        text-transform:uppercase;

      }



      #influenceCard.is-phantom-node{

        width:min(96vw, 760px);

        padding:18px 20px 20px;

        border:none;

        border-radius:28px;

        background:

          linear-gradient(180deg, rgba(5,8,12,.98), rgba(9,12,18,.98)),

          url("${PHANTOM_NODE_ASSETS.frameDesktop}") center/100% 100% no-repeat;

        box-shadow:0 34px 88px rgba(0,0,0,.68), inset 0 1px 0 rgba(255,255,255,.04);

        overflow:auto;

      }

      #influenceCard.is-phantom-node::before{

        content:"";

        position:absolute;

        inset:0;

        border-radius:inherit;

        background:

          radial-gradient(circle at 50% 0%, rgba(255,196,120,.09), transparent 34%),

          radial-gradient(circle at 50% 100%, rgba(74,207,188,.08), transparent 30%),

          linear-gradient(180deg, rgba(255,255,255,.03), transparent 22%, transparent 78%, rgba(255,255,255,.02));

        pointer-events:none;

      }

      #influenceCard.is-phantom-node::after{

        content:"";

        position:absolute;

        inset:0;

        border-radius:inherit;

        background:url("${PHANTOM_NODE_ASSETS.signalOverlay}") center top/cover no-repeat;

        opacity:.045;

        mix-blend-mode:screen;

        pointer-events:none;

        z-index:0;

      }

      #influenceCard.is-phantom-node > *{

        position:relative;

        z-index:1;

      }

      #influenceCard.is-phantom-node .inf-head{

        position:relative;

        justify-content:center;

        min-height:54px;

        padding:4px 96px 10px;

      }

      #influenceCard.is-phantom-node .inf-title{

        font-family:Georgia, "Times New Roman", serif;

        font-size:clamp(34px, 5.6vw, 58px);

        line-height:1;

        letter-spacing:.08em;

        text-transform:uppercase;

        text-align:center;

        color:#f8f3e7;

        text-shadow:0 2px 18px rgba(0,0,0,.38);

      }

      #influenceCard.is-phantom-node .inf-sub{

        margin-top:7px;

        font-size:11px;

        letter-spacing:.22em;

        text-transform:uppercase;

        text-align:center;

        color:#c5b086;

      }

      #influenceCard.is-phantom-node .inf-close-btn{

        position:absolute;

        right:0;

        top:4px;

        min-width:84px;

        padding:10px 14px;

        border-radius:999px;

        border:1px solid rgba(224,201,156,.24);

        background:rgba(10,12,16,.72);

        color:#f2ead8;

        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);

      }

      #influenceCard.is-phantom-node .inf-hero{

        padding:0;

        border-radius:22px;

        border:1px solid rgba(218,198,154,.16);

        background:rgba(9,12,18,.9);

        overflow:hidden;

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-media{

        position:relative;

        isolation:isolate;

        min-height:360px;

        background:

          radial-gradient(circle at 50% 18%, rgba(255,188,114,.12), transparent 22%),

          linear-gradient(180deg, rgba(10,12,18,.12), rgba(5,7,12,.9));

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-signal{

        position:absolute;

        inset:0;

        background:url("${PHANTOM_NODE_ASSETS.signalOverlay}") center 18%/cover no-repeat;

        opacity:.11;

        mix-blend-mode:screen;

        pointer-events:none;

        transform:scale(1.03);

        transform-origin:center center;

        z-index:1;

      }



      #influenceCard.is-phantom-node .inf-phantom-hero-media::before{

        content:"";

        position:absolute;

        inset:0;

        background:

          linear-gradient(180deg, rgba(6,8,12,.44) 0%, rgba(6,8,12,.08) 24%, rgba(6,8,12,.28) 58%, rgba(4,6,10,.94) 100%),

          radial-gradient(circle at 50% 64%, rgba(255,121,70,.18), transparent 16%),

          radial-gradient(circle at 82% 68%, rgba(94,226,206,.12), transparent 24%);

        pointer-events:none;

        z-index:2;

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-media::after{

        content:"";

        position:absolute;

        inset:auto 0 0;

        height:40%;

        background:linear-gradient(180deg, rgba(6,8,12,0), rgba(6,8,12,.72) 38%, rgba(6,8,12,.96));

        pointer-events:none;

        z-index:3;

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-media.is-art-missing{

        background:

          radial-gradient(circle at 50% 34%, rgba(255,188,114,.22), transparent 20%),

          radial-gradient(circle at 50% 72%, rgba(255,104,68,.12), transparent 26%),

          linear-gradient(180deg, rgba(18,22,30,.98), rgba(9,12,18,.98));

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-art{

        position:absolute;

        inset:0;

        width:100%;

        height:100%;

        object-fit:cover;

        object-position:center center;

        opacity:.96;

        z-index:0;

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-top,

      #influenceCard.is-phantom-node .inf-phantom-hero-bottom{

        position:relative;

        z-index:4;

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-top{

        display:grid;

        grid-template-columns:156px minmax(0,1fr) 194px;

        gap:14px;

        align-items:start;

        padding:18px 18px 0;

      }

      #influenceCard.is-phantom-node .inf-phantom-center-copy{

        text-align:center;

        padding-top:14px;

      }

      #influenceCard.is-phantom-node .inf-panel-kicker{

        font-size:10px;

        letter-spacing:.18em;

        text-transform:uppercase;

        color:#c5b086;

      }

      #influenceCard.is-phantom-node .inf-leader{

        margin-top:10px;

        font-family:Georgia, "Times New Roman", serif;

        font-size:clamp(24px, 4vw, 38px);

        line-height:1.06;

        letter-spacing:.04em;

        text-transform:uppercase;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-control-line{

        margin-top:8px;

        font-size:12px;

        line-height:1.5;

        color:#d8d2c5;

      }

      #influenceCard.is-phantom-node .inf-encounter-line{

        margin-top:6px;

        font-size:18px;

        line-height:1.18;

        font-weight:900;

        color:#ffffff;

      }

      #influenceCard.is-phantom-node .inf-phantom-status-badge{

        position:absolute;

        top:18px;

        left:50%;

        transform:translateX(-50%);

        display:inline-flex;

        align-items:center;

        justify-content:center;

        padding:7px 14px;

        border-radius:999px;

        border:1px solid rgba(255,192,124,.36);

        background:rgba(12,14,18,.72);

        color:#ffd8a6;

        font-size:11px;

        font-weight:900;

        letter-spacing:.12em;

        text-transform:uppercase;

        box-shadow:0 12px 28px rgba(0,0,0,.3);

        z-index:4;

      }

      #influenceCard.is-phantom-node .inf-phantom-status-badge[data-state="CONTESTED"]{

        color:#ffd79f;

        border-color:rgba(255,178,96,.42);

      }

      #influenceCard.is-phantom-node .inf-phantom-status-badge[data-state="HOT"]{

        color:#ffb48e;

        border-color:rgba(255,118,82,.48);

      }

      #influenceCard.is-phantom-node .inf-phantom-status-badge[data-state="FORTIFIED"],

      #influenceCard.is-phantom-node .inf-phantom-status-badge[data-state="CALM"]{

        color:#d6fff4;

        border-color:rgba(94,226,206,.34);

      }

      #influenceCard.is-phantom-node .inf-phantom-sidecard{

        min-height:132px;

        padding:14px 14px 12px;

        border-radius:18px;

        border:1px solid rgba(222,200,156,.16);

        background:linear-gradient(180deg, rgba(10,12,16,.86), rgba(8,10,14,.64));

        box-shadow:inset 0 1px 0 rgba(255,255,255,.04), 0 16px 34px rgba(0,0,0,.18);

      }

      #influenceCard.is-phantom-node .inf-node-core{

        width:auto;

        height:auto;

        align-items:flex-start;

        justify-content:flex-start;

        text-align:left;

        gap:8px;

        padding:14px 14px 12px;

        border-radius:18px;

        background:linear-gradient(180deg, rgba(10,12,16,.92), rgba(8,10,14,.72));

        box-shadow:inset 0 1px 0 rgba(255,255,255,.04), 0 16px 34px rgba(0,0,0,.18);

      }

      #influenceCard.is-phantom-node .inf-node-core::before,

      #influenceCard.is-phantom-node .inf-node-core::after{

        display:none;

      }

      #influenceCard.is-phantom-node .inf-node-core-btn:hover{

        border-color:rgba(255,192,124,.34);

      }

      #influenceCard.is-phantom-node .inf-node-core-mark{

        font-family:Georgia, "Times New Roman", serif;

        font-size:20px;

        line-height:1.04;

        letter-spacing:.04em;

        text-transform:uppercase;

        color:#f6efe1;

      }

      #influenceCard.is-phantom-node .inf-node-core-code{

        display:none;

        font-size:10px;

        letter-spacing:.14em;

        text-transform:uppercase;

        color:#ad9e7d;

      }

      #influenceCard.is-phantom-node .inf-node-core-hint{

        margin-top:auto;

        color:#b8f4e6;

      }

      #influenceCard.is-phantom-node .inf-phantom-faction-card{

        display:flex;

        flex-direction:column;

        gap:10px;

      }

      #influenceCard.is-phantom-node .inf-phantom-sidecard-label{

        font-size:10px;

        letter-spacing:.18em;

        text-transform:uppercase;

        color:#c5b086;

      }

      #influenceCard.is-phantom-node .inf-phantom-faction-row{

        display:flex;

        gap:10px;

        align-items:center;

      }

      #influenceCard.is-phantom-node .inf-phantom-faction-sigil-wrap{

        position:relative;

        width:48px;

        height:48px;

        flex:0 0 48px;

        border-radius:14px;

        border:1px solid rgba(222,200,156,.16);

        background:rgba(255,255,255,.03);

        display:grid;

        place-items:center;

        overflow:hidden;

      }

      #influenceCard.is-phantom-node .inf-phantom-faction-sigil{

        width:82%;

        height:82%;

        object-fit:contain;

        filter:drop-shadow(0 8px 18px rgba(0,0,0,.34));

      }

      #influenceCard.is-phantom-node .inf-phantom-faction-fallback{

        font-size:16px;

        font-weight:900;

        letter-spacing:.12em;

        color:#e8dfcf;

      }

      #influenceCard.is-phantom-node .inf-phantom-faction-name{

        font-family:Georgia, "Times New Roman", serif;

        font-size:18px;

        line-height:1.1;

        letter-spacing:.04em;

        text-transform:uppercase;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-phantom-faction-lead,

      #influenceCard.is-phantom-node .inf-phantom-faction-status{

        font-size:11px;

        line-height:1.45;

        color:#d7d0c2;

      }

      #influenceCard.is-phantom-node .inf-phantom-hero-bottom{

        padding:126px 22px 22px;

        display:flex;

        flex-direction:column;

        gap:8px;

      }

      #influenceCard.is-phantom-node .inf-chip-row,

      #influenceCard.is-phantom-node #infUxControlChip,

      #influenceCard.is-phantom-node #infUxAction,

      #influenceCard.is-phantom-node #infUxValue,

      #influenceCard.is-phantom-node #infUxWatchChip{

        display:none !important;

      }

      #influenceCard.is-phantom-node .inf-hero-flavor{

        margin-top:0;

        font-size:13px;

        line-height:1.55;

        color:#e8e0d2;

      }

      #influenceCard.is-phantom-node .inf-hero-status{

        font-size:12px;

        line-height:1.55;

        color:#cfc9bc;

      }

      #influenceCard.is-phantom-node .inf-clash-meter{

        margin-top:0 !important;

        padding:16px 18px 18px;

        border-top:1px solid rgba(222,200,156,.12);

        background:linear-gradient(180deg, rgba(11,13,18,.84), rgba(7,9,13,.94));

      }

      #influenceCard.is-phantom-node .inf-pressure-head{

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:12px;

        margin-bottom:12px;

        font-family:Georgia, "Times New Roman", serif;

        font-size:14px;

        letter-spacing:.08em;

        text-transform:uppercase;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-pressure-state{

        font-size:10px;

        font-weight:900;

        letter-spacing:.16em;

        color:#c5b086;

      }

      #influenceCard.is-phantom-node .inf-pressure-sides{

        display:grid;

        grid-template-columns:repeat(2,minmax(0,1fr));

        gap:12px;

        margin-bottom:10px;

      }

      #influenceCard.is-phantom-node .inf-pressure-side{

        display:flex;

        align-items:baseline;

        justify-content:space-between;

        gap:10px;

        font-size:12px;

        color:#d5cec1;

      }

      #influenceCard.is-phantom-node .inf-pressure-side .label{

        font-weight:800;

        letter-spacing:.06em;

        text-transform:uppercase;

      }

      #influenceCard.is-phantom-node .inf-pressure-side .value{

        font-size:30px;

        font-weight:900;

        line-height:1;

        color:#f9f2e5;

      }

      #influenceCard.is-phantom-node .inf-pressure-side.is-enemy .label,

      #influenceCard.is-phantom-node .inf-pressure-side.is-enemy .value{

        color:#ff8e72;

      }

      #influenceCard.is-phantom-node .inf-pressure-side.is-friendly{

        text-align:right;

      }

      #influenceCard.is-phantom-node .inf-pressure-side.is-friendly .label,

      #influenceCard.is-phantom-node .inf-pressure-side.is-friendly .value{

        color:#82f2d4;

      }

      #influenceCard.is-phantom-node .inf-pressure-track{

        position:relative;

        height:74px;

        border-radius:20px;

        overflow:hidden;

        background:rgba(255,255,255,.03);

        border:1px solid rgba(222,200,156,.12);

      }

      #influenceCard.is-phantom-node .inf-pressure-track::before{

        content:"";

        position:absolute;

        inset:0;

        background:

          linear-gradient(180deg, rgba(5,8,12,.28), rgba(5,8,12,.14)),

          url("${PHANTOM_NODE_ASSETS.pressureBar}") center/cover no-repeat;

        opacity:.95;

      }

      #influenceCard.is-phantom-node .inf-pressure-fill{

        position:absolute;

        top:24px;

        bottom:24px;

        z-index:1;

        border-radius:999px;

        filter:drop-shadow(0 0 10px rgba(0,0,0,.24));

      }

      #influenceCard.is-phantom-node .inf-pressure-fill.is-enemy{

        left:18px;

        min-width:12px;

        background:linear-gradient(90deg, rgba(255,94,68,.78), rgba(255,165,102,.84));

        box-shadow:0 0 14px rgba(255,116,76,.34);

      }

      #influenceCard.is-phantom-node .inf-pressure-fill.is-friendly{

        right:18px;

        min-width:12px;

        background:linear-gradient(90deg, rgba(86,222,191,.84), rgba(108,255,244,.86));

        box-shadow:0 0 14px rgba(84,222,190,.3);

      }

      #influenceCard.is-phantom-node .inf-pressure-track.is-idle .inf-pressure-fill{

        display:none;

      }

      #influenceCard.is-phantom-node .inf-pressure-track.is-idle .inf-pressure-fill.is-enemy{

        display:block;

        width:12%;

        opacity:.28;

      }

      #influenceCard.is-phantom-node .inf-pressure-core{

        position:absolute;

        top:50%;

        left:50%;

        z-index:2;

        transform:translate(-50%, -50%);

        display:grid;

        place-items:center;

        width:68px;

        height:68px;

        border-radius:999px;

        border:1px solid rgba(255,214,152,.34);

        background:radial-gradient(circle at 50% 50%, rgba(255,214,152,.18), rgba(12,14,18,.9) 66%);

        box-shadow:0 0 24px rgba(255,184,96,.16);

      }

      #influenceCard.is-phantom-node .inf-pressure-core span{

        font-size:11px;

        font-weight:900;

        letter-spacing:.14em;

        text-transform:uppercase;

        color:#f3ead8;

      }

      #influenceCard.is-phantom-node .inf-threat-card,

      #influenceCard.is-phantom-node .inf-threat-pulse,

      #influenceCard.is-phantom-node .inf-daily-outcome,



      #influenceCard.is-phantom-node .inf-frontline-confront{

        margin-top:10px;

        padding:14px 16px;

        border-radius:16px;

        border:1px solid rgba(255,116,76,.24);

        background:linear-gradient(180deg, rgba(255,94,68,.12), rgba(12,14,18,.78));

      }

      #influenceCard.is-phantom-node .inf-frontline-confront.is-available{

        border-color:rgba(255,148,92,.42);

        box-shadow:0 0 24px rgba(255,116,76,.14);

      }

      #influenceCard.is-phantom-node .inf-confront-kicker{

        font-size:10px;

        font-weight:800;

        letter-spacing:.16em;

        text-transform:uppercase;

        color:#ffb074;

      }

      #influenceCard.is-phantom-node .inf-confront-title{

        margin-top:4px;

        font-size:17px;

        font-weight:900;

        letter-spacing:.08em;

        color:#f7efe2;

      }

      #influenceCard.is-phantom-node .inf-confront-title.is-locked{

        opacity:.72;

      }

      #influenceCard.is-phantom-node .inf-confront-copy,

      #influenceCard.is-phantom-node .inf-confront-meta{

        margin-top:6px;

        font-size:11px;

        line-height:1.45;

        color:#d5cec1;

      }

      #influenceCard.is-phantom-node .inf-confront-btn{

        margin-top:10px;

        width:100%;

        padding:12px 14px;

        border-radius:12px;

        border:1px solid rgba(255,148,92,.42);

        background:linear-gradient(180deg, rgba(255,132,92,.28), rgba(255,84,52,.22));

        color:#fff4e8;

        font-size:12px;

        font-weight:900;

        letter-spacing:.12em;

        text-transform:uppercase;

        cursor:pointer;

      }

      #influenceCard.is-phantom-node .inf-confront-btn.is-locked{

        opacity:.45;

        cursor:not-allowed;

      }

      #influenceCard.is-phantom-node .inf-status-confront .inf-result-title{

        color:#ffe2c8;

      }

      #influenceCard.is-phantom-node .inf-frontline-today{

        margin-top:10px;

        padding:12px 14px;

        border-radius:16px;

        border:1px solid rgba(145,206,255,.20);

        background:linear-gradient(180deg, rgba(145,206,255,.10), rgba(12,14,18,.72));

      }

      #influenceCard.is-phantom-node .inf-daily-outcome.is-recovery{

        border-color:rgba(255,116,76,.28);

        background:linear-gradient(180deg, rgba(255,94,68,.12), rgba(12,14,18,.72));

      }

      #influenceCard.is-phantom-node .inf-daily-kicker,

      #influenceCard.is-phantom-node .inf-today-kicker{

        font-size:10px;

        font-weight:800;

        letter-spacing:.16em;

        text-transform:uppercase;

        color:#9fd0ff;

      }

      #influenceCard.is-phantom-node .inf-daily-title{

        margin-top:4px;

        font-size:15px;

        font-weight:900;

        color:#f7efe2;

        line-height:1.25;

      }

      #influenceCard.is-phantom-node .inf-daily-meta,

      #influenceCard.is-phantom-node .inf-daily-note,

      #influenceCard.is-phantom-node .inf-today-line{

        margin-top:6px;

        font-size:11px;

        line-height:1.45;

        color:#d5cec1;

      }

      #influenceCard.is-phantom-node .inf-recovery-chip{

        display:inline-flex;

        margin-top:6px;

        padding:3px 8px;

        border-radius:999px;

        font-size:9px;

        font-weight:800;

        letter-spacing:.12em;

        text-transform:uppercase;

        color:#ffd2b0;

        border:1px solid rgba(255,116,76,.34);

        background:rgba(255,94,68,.14);

      }

      #influenceCard.is-phantom-node .inf-momentum-chip{

        display:inline-flex;

        margin-top:6px;

        padding:3px 8px;

        border-radius:999px;

        font-size:9px;

        font-weight:800;

        letter-spacing:.12em;

        text-transform:uppercase;

        color:#b8ffe8;

        border:1px solid rgba(108,255,244,.28);

        background:rgba(86,222,191,.12);

      }

      #influenceCard.is-phantom-node .inf-frontline-target{

        margin-top:10px;

        padding:12px 14px;

        border-radius:16px;

        border:1px solid rgba(255,116,76,.22);

        background:linear-gradient(180deg, rgba(255,94,68,.10), rgba(12,14,18,.72));

      }

      #influenceCard.is-phantom-node .inf-threat-pulse{

        border-color:rgba(255,182,116,.24);

        background:linear-gradient(180deg, rgba(255,182,116,.12), rgba(12,14,18,.68));

      }

      #influenceCard.is-phantom-node .inf-frontline-target{

        border-color:rgba(108,255,244,.22);

        background:linear-gradient(180deg, rgba(86,222,191,.10), rgba(12,14,18,.72));

      }

      #influenceCard.is-phantom-node .inf-target-bar{

        height:6px;

        margin:8px 0 4px;

        border-radius:999px;

        background:rgba(255,255,255,.10);

        overflow:hidden;

      }

      #influenceCard.is-phantom-node .inf-target-bar span{

        display:block;

        height:100%;

        max-width:100%;

        border-radius:999px;

        background:linear-gradient(90deg,rgba(117,240,201,.92),rgba(70,164,214,.86));

      }

      #influenceCard.is-phantom-node .inf-threat-kicker,

      #influenceCard.is-phantom-node .inf-target-kicker{

        font-size:10px;

        font-weight:800;

        letter-spacing:.16em;

        text-transform:uppercase;

        color:#ffb074;

      }

      #influenceCard.is-phantom-node .inf-target-kicker{ color:#82f2d4; }

      #influenceCard.is-phantom-node .inf-threat-name{

        margin-top:4px;

        font-size:18px;

        font-weight:900;

        color:#f7efe2;

      }

      #influenceCard.is-phantom-node .inf-threat-meta,

      #influenceCard.is-phantom-node .inf-threat-note,

      #influenceCard.is-phantom-node .inf-threat-pulse-copy,

      #influenceCard.is-phantom-node .inf-target-copy{

        margin-top:6px;

        font-size:11px;

        line-height:1.45;

        color:#d5cec1;

      }

      #influenceCard.is-phantom-node .inf-threat-card{

        position:relative;

        overflow:hidden;

      }

      #influenceCard.is-phantom-node .inf-threat-inner{

        position:relative;

      }

      #influenceCard.is-phantom-node .inf-threat-bg-accent{

        position:absolute;

        top:0;

        right:-6%;

        bottom:0;

        width:50%;

        background-repeat:no-repeat;

        background-position:right center;

        background-size:contain;

        opacity:.10;

        pointer-events:none;

        z-index:0;

      }

      #influenceCard.is-phantom-node .inf-threat-head{

        position:relative;

        z-index:1;

        display:flex;

        gap:12px;

        align-items:flex-start;

      }

      #influenceCard.is-phantom-node .inf-threat-copy{

        min-width:0;

        flex:1;

      }

      #influenceCard.is-phantom-node .inf-threat-boss-portrait{

        flex:0 0 84px;

        width:84px;

        height:84px;

        display:grid;

        place-items:center;

        border-radius:14px;

        border:1px solid rgba(86,222,191,.32);

        background:transparent;

        box-shadow:

          0 0 12px rgba(86,222,191,.12),

          inset 0 0 0 1px rgba(255,116,76,.14);

        overflow:visible;

      }

      #influenceCard.is-phantom-node .inf-threat-boss-art{

        width:100%;

        height:100%;

        object-fit:contain;

        object-position:center;

        display:block;

        background:transparent;

        filter:none;

      }

      #influenceCard.is-phantom-node .inf-threat-boss-portrait.is-art-missing{

        background:linear-gradient(180deg, rgba(255,94,68,.16), rgba(12,14,18,.42));

        border-color:rgba(255,116,76,.28);

        box-shadow:0 0 10px rgba(255,116,76,.12);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-secured{

        border-color:rgba(86,222,191,.28);

        box-shadow:0 0 16px rgba(86,222,191,.08);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-secured .inf-threat-boss-portrait{

        border-color:rgba(86,222,191,.38);

        box-shadow:0 0 10px rgba(86,222,191,.14);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-unstable{

        border-color:rgba(108,255,244,.32);

        box-shadow:0 0 18px rgba(86,222,191,.12);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-unstable .inf-threat-boss-portrait{

        border-color:rgba(108,255,244,.42);

        box-shadow:0 0 14px rgba(86,222,191,.18);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-dangerous{

        border-color:rgba(255,148,92,.38);

        box-shadow:0 0 20px rgba(255,116,76,.14);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-dangerous .inf-threat-boss-portrait{

        border-color:rgba(255,148,92,.46);

        box-shadow:

          0 0 12px rgba(86,222,191,.10),

          0 0 16px rgba(255,116,76,.16);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-critical{

        border-color:rgba(255,116,76,.48);

        box-shadow:0 0 24px rgba(255,94,68,.22);

      }

      #influenceCard.is-phantom-node .inf-threat-card.is-status-critical .inf-threat-boss-portrait{

        border-color:rgba(255,116,76,.52);

        box-shadow:

          0 0 14px rgba(255,116,76,.22),

          0 0 8px rgba(86,222,191,.12);

      }

      #influenceCard.is-phantom-node .inf-target-progress{

        margin-top:6px;

        font-size:16px;

        font-weight:800;

        color:#e8fff8;

      }

      #influenceCard.is-phantom-node .inf-pressure-foot{

        margin-top:10px;

        font-size:11px;

        line-height:1.5;

        color:#d5cec1;

      }

      #influenceCard.is-phantom-node .inf-panel{

        margin-top:12px;

        padding:14px;

        border-radius:18px;

        border:1px solid rgba(222,200,156,.12);

        background:linear-gradient(180deg, rgba(16,18,24,.9), rgba(8,10,14,.88));

      }

      #influenceCard.is-phantom-node .inf-panel-title{

        font-family:Georgia, "Times New Roman", serif;

        font-size:14px;

        letter-spacing:.08em;

        text-transform:uppercase;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-ops-panel .inf-chip-row{

        display:none;

      }

      #influenceCard.is-phantom-node #infOrdersLead{

        margin-top:8px;

        color:#d8d2c5;

      }

      #influenceCard.is-phantom-node .inf-action-grid{

        margin-top:12px;

        grid-template-columns:repeat(2,minmax(0,1fr));

        gap:14px;

      }

      #influenceCard.is-phantom-node .inf-action-card{

        min-height:262px;

        padding:0;

        border-radius:18px;

        overflow:hidden;

        border:1px solid rgba(222,200,156,.14);

        background:linear-gradient(180deg, rgba(12,14,20,.96), rgba(7,9,13,.98));

        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);

      }

      #influenceCard.is-phantom-node .inf-action-card:disabled{

        opacity:.74;

      }

      #influenceCard.is-phantom-node .inf-action-art{

        position:relative;

        display:block;

        height:138px;

        overflow:hidden;

        background:rgba(255,255,255,.03);

      }

      #influenceCard.is-phantom-node .inf-action-art img{

        width:100%;

        height:100%;

        object-fit:cover;

        object-position:center;

        opacity:.94;

      }

      #influenceCard.is-phantom-node .inf-action-copy{

        display:flex;

        flex-direction:column;

        gap:8px;

        padding:14px 14px 15px;

        text-align:left;

      }

      #influenceCard.is-phantom-node .inf-action-line{

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:10px;

      }

      #influenceCard.is-phantom-node .inf-action-eyebrow{

        font-size:10px;

        letter-spacing:.18em;

        text-transform:uppercase;

        color:#c5b086;

      }

      #influenceCard.is-phantom-node .inf-action-title{

        font-family:Georgia, "Times New Roman", serif;

        font-size:28px;

        line-height:1.02;

        letter-spacing:.04em;

        text-transform:uppercase;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-action-effect{

        font-size:12px;

        line-height:1.55;

        color:#d6d0c3;

      }

      #influenceCard.is-phantom-node .inf-action-chip{

        margin-top:auto;

        display:inline-flex;

        align-items:center;

        justify-content:center;

        min-height:40px;

        border-radius:12px;

        font-size:12px;

        font-weight:900;

        letter-spacing:.08em;

        text-transform:uppercase;

      }

      #influenceCard.is-phantom-node .inf-action-card-primary .inf-action-chip{

        background:linear-gradient(90deg, rgba(43,160,140,.24), rgba(60,221,192,.18));

        border:1px solid rgba(82,228,199,.28);

        color:#90f3db;

      }

      #influenceCard.is-phantom-node .inf-action-card-support .inf-action-chip{

        background:linear-gradient(90deg, rgba(190,112,48,.24), rgba(255,160,74,.18));

        border:1px solid rgba(255,176,96,.28);

        color:#ffca86;

      }

      #influenceCard.is-phantom-node .inf-action-card-primary{

        border-color:rgba(76,214,188,.18);

      }

      #influenceCard.is-phantom-node .inf-action-card-support{

        border-color:rgba(255,178,96,.18);

      }

      #influenceCard.is-phantom-node .inf-watch-line,

      #influenceCard.is-phantom-node .inf-orders-cooldown{

        margin-top:12px;

        color:#cfc9bc;

      }

      #influenceCard.is-phantom-node .inf-donate-box{

        margin-top:12px;

        border-radius:18px;

        border:1px solid rgba(222,200,156,.12);

        background:linear-gradient(180deg, rgba(13,16,22,.9), rgba(8,10,14,.94));

      }

      #influenceCard.is-phantom-node .inf-donate-shell{

        font-family:Georgia, "Times New Roman", serif;

        font-size:18px;

        letter-spacing:.06em;

        text-transform:uppercase;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-impact-grid{

        margin-top:12px;

        grid-template-columns:repeat(4,minmax(0,1fr));

        gap:10px;

      }

      #influenceCard.is-phantom-node .inf-impact-card{

        min-height:108px;

        border-radius:14px;

        border:1px solid rgba(222,200,156,.12);

        background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));

        padding:12px;

      }

      #influenceCard.is-phantom-node .inf-impact-label{

        font-size:10px;

        letter-spacing:.16em;

        text-transform:uppercase;

        color:#a99778;

      }

      #influenceCard.is-phantom-node .inf-impact-value{

        margin-top:8px;

        font-size:24px;

        font-weight:900;

        line-height:1.04;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-impact-hint{

        margin-top:8px;

        font-size:11px;

        line-height:1.45;

        color:#cfc9bc;

      }

      #influenceCard.is-phantom-node .inf-impact-copy{

        margin-top:12px;

        border-radius:14px;

        border:1px solid rgba(222,200,156,.1);

        background:rgba(255,255,255,.02);

        color:#d6d0c3;

      }

      #influenceCard.is-phantom-node .inf-war-intel{

        margin-top:12px;

        border-radius:18px;

        border:1px solid rgba(222,200,156,.12);

        background:linear-gradient(180deg, rgba(13,16,22,.82), rgba(8,10,14,.9));

      }

      #influenceCard.is-phantom-node .inf-war-intel summary{

        position:relative;

        padding:14px 46px 14px 16px;

        font-family:Georgia, "Times New Roman", serif;

        font-size:16px;

        letter-spacing:.06em;

        text-transform:uppercase;

        color:#f5efe1;

      }

      #influenceCard.is-phantom-node .inf-war-intel summary::after{

        content:"⌄";

        position:absolute;

        right:16px;

        top:50%;

        transform:translateY(-56%);

        font-size:18px;

        color:#c5b086;

        transition:transform .18s ease;

      }

      #influenceCard.is-phantom-node .inf-war-intel[open] summary::after{

        transform:translateY(-56%) rotate(180deg);

      }

      #influenceCard.is-phantom-node .inf-war-intel-summary-copy{

        display:block;

        margin-top:4px;

        font-size:11px;

        letter-spacing:.04em;

        color:#a99778;

      }

      #influenceCard.is-phantom-node .inf-war-intel-body{

        padding:0 12px 12px;

      }

      #influenceCard.is-phantom-node #infIntelShell,

      #influenceCard.is-phantom-node #infLoreShell{

        margin-top:10px;

      }

      #influenceCard.is-phantom-node #infWeeklyPreview{

        margin-top:10px;

      }



      @media (max-width: 720px){

        #influenceCard.is-phantom-node{

          width:min(100vw - 10px, 460px);

          padding:12px 12px 14px;

          border-radius:24px;

          background:

            linear-gradient(180deg, rgba(5,8,12,.98), rgba(9,12,18,.98)),

            url("${PHANTOM_NODE_ASSETS.frameMobile}") center/100% 100% no-repeat;

        }

        #influenceCard.is-phantom-node::after{

          opacity:.025;

          background-position:center 10%;

        }

        #influenceCard.is-phantom-node .inf-head{

          min-height:40px;

          padding:0 70px 6px;

          gap:8px;

        }

        #influenceCard.is-phantom-node .inf-title{

          font-size:clamp(21px, 6vw, 30px);

          letter-spacing:.1em;

          white-space:nowrap;

        }

        #influenceCard.is-phantom-node .inf-sub{

          margin-top:3px;

          font-size:9px;

          letter-spacing:.14em;

        }

        #influenceCard.is-phantom-node .inf-close-btn{

          top:0;

          min-width:68px;

          padding:8px 11px;

          font-size:11px;

        }

        #influenceCard.is-phantom-node .inf-hero{

          margin-top:8px;

        }

        #influenceCard.is-phantom-node .inf-phantom-hero-media{

          min-height:228px;

        }

        #influenceCard.is-phantom-node .inf-threat-boss-portrait{

          flex:0 0 64px;

          width:64px;

          height:64px;

        }

        #influenceCard.is-phantom-node .inf-threat-bg-accent{

          opacity:.06;

          width:42%;

        }



        #influenceCard.is-phantom-node .inf-phantom-hero-signal{

          opacity:.06;

          background-position:center 26%;

        }

        #influenceCard.is-phantom-node .inf-phantom-hero-art{

          object-position:center 34%;

        }

        #influenceCard.is-phantom-node .inf-phantom-status-badge{

          top:8px;

          padding:5px 10px;

          font-size:9px;

        }

        #influenceCard.is-phantom-node .inf-phantom-hero-top{

          grid-template-columns:repeat(2,minmax(0,1fr));

          gap:8px;

          padding:40px 10px 0;

          align-items:start;

        }

        #influenceCard.is-phantom-node .inf-phantom-center-copy{

          grid-column:1 / -1;

          padding-top:2px;

          text-align:left;

        }

        #influenceCard.is-phantom-node .inf-panel-kicker{

          font-size:8px;

          letter-spacing:.14em;

        }

        #influenceCard.is-phantom-node .inf-leader{

          margin-top:4px;

          font-size:18px;

        }

        #influenceCard.is-phantom-node .inf-control-line,

        #influenceCard.is-phantom-node .inf-hero-flavor,

        #influenceCard.is-phantom-node .inf-node-core-hint,

        #influenceCard.is-phantom-node .inf-phantom-sidecard-label,

        #influenceCard.is-phantom-node .inf-phantom-faction-lead{

          display:none;

        }

        #influenceCard.is-phantom-node .inf-encounter-line{

          margin-top:4px;

          font-size:14px;

          line-height:1.12;

        }

        #influenceCard.is-phantom-node .inf-node-core,

        #influenceCard.is-phantom-node .inf-phantom-faction-card{

          min-height:0;

          gap:6px;

          padding:9px 10px 8px;

          border-radius:14px;

          background:linear-gradient(180deg, rgba(10,12,16,.92), rgba(8,10,14,.82));

        }

        #influenceCard.is-phantom-node .inf-node-core-label{

          font-size:8px;

        }

        #influenceCard.is-phantom-node .inf-node-core-mark{

          font-size:13px;

        }

        #influenceCard.is-phantom-node .inf-node-core-state{

          margin-top:1px;

          font-size:9px;

        }

        #influenceCard.is-phantom-node .inf-node-core-code{

          display:none !important;

        }

        #influenceCard.is-phantom-node .inf-phantom-faction-row{

          gap:8px;

        }

        #influenceCard.is-phantom-node .inf-phantom-faction-sigil-wrap{

          width:34px;

          height:34px;

          flex:0 0 34px;

          border-radius:10px;

        }

        #influenceCard.is-phantom-node .inf-phantom-faction-name{

          font-size:13px;

        }

        #influenceCard.is-phantom-node .inf-phantom-faction-status{

          font-size:10px;

          line-height:1.3;

        }

        #influenceCard.is-phantom-node .inf-phantom-hero-bottom{

          padding:10px 10px 12px;

          gap:4px;

        }

        #influenceCard.is-phantom-node .inf-hero-status{

          font-size:11px;

          line-height:1.35;

        }

        #influenceCard.is-phantom-node .inf-clash-meter{

          padding:10px 12px 12px;

        }

        #influenceCard.is-phantom-node .inf-pressure-head{

          margin-bottom:8px;

          font-size:12px;

        }

        #influenceCard.is-phantom-node .inf-pressure-state{

          font-size:9px;

        }

        #influenceCard.is-phantom-node .inf-pressure-sides{

          margin-bottom:8px;

          gap:10px;

        }

        #influenceCard.is-phantom-node .inf-pressure-side .label{

          font-size:10px;

        }

        #influenceCard.is-phantom-node .inf-pressure-side .value{

          font-size:20px;

        }

        #influenceCard.is-phantom-node .inf-pressure-track{

          height:56px;

          border-radius:14px;

        }

        #influenceCard.is-phantom-node .inf-pressure-fill{

          top:18px;

          bottom:18px;

        }

        #influenceCard.is-phantom-node .inf-pressure-core{

          width:52px;

          height:52px;

        }

        #influenceCard.is-phantom-node .inf-pressure-core span{

          font-size:9px;

        }

        #influenceCard.is-phantom-node .inf-pressure-foot{

          margin-top:8px;

          font-size:10px;

          line-height:1.35;

        }

        #influenceCard.is-phantom-node .inf-panel{

          margin-top:8px;

          padding:12px;

          border-radius:16px;

        }

        #influenceCard.is-phantom-node #infOrdersLead{

          margin-top:4px;

          font-size:11px;

          line-height:1.35;

        }

        #influenceCard.is-phantom-node .inf-action-grid{

          margin-top:8px;

          grid-template-columns:repeat(2,minmax(0,1fr));

          gap:8px;

        }

        #influenceCard.is-phantom-node .inf-action-card{

          min-height:148px;

          border-radius:14px;

        }

        #influenceCard.is-phantom-node .inf-action-art{

          height:54px;

        }

        #influenceCard.is-phantom-node .inf-action-copy{

          gap:6px;

          padding:9px 9px 10px;

        }

        #influenceCard.is-phantom-node .inf-action-line{

          align-items:flex-start;

          gap:6px;

        }

        #influenceCard.is-phantom-node .inf-action-eyebrow{

          font-size:9px;

          letter-spacing:.14em;

        }

        #influenceCard.is-phantom-node .inf-action-title{

          font-size:16px;

          line-height:1.08;

        }

        #influenceCard.is-phantom-node .inf-action-effect{

          font-size:10px;

          line-height:1.35;

          display:-webkit-box;

          -webkit-line-clamp:2;

          -webkit-box-orient:vertical;

          overflow:hidden;

        }

        #influenceCard.is-phantom-node .inf-action-chip{

          width:100%;

          min-height:44px;

          padding:0 8px;

          font-size:11px;

        }

        #influenceCard.is-phantom-node .inf-watch-line,

        #influenceCard.is-phantom-node .inf-orders-cooldown{

          margin-top:8px;

          font-size:10px;

          line-height:1.35;

        }

        #influenceCard.is-phantom-node .inf-donate-box{

          margin-top:8px;

        }

        #influenceCard.is-phantom-node .inf-impact-grid{

          grid-template-columns:repeat(2,minmax(0,1fr));

          gap:8px;

        }

        #influenceCard.is-phantom-node .inf-impact-card{

          min-height:96px;

          padding:10px;

        }

        #influenceCard.is-phantom-node .inf-impact-value{

          font-size:20px;

        }

        #influenceCard.is-phantom-node .inf-impact-hint,

        #influenceCard.is-phantom-node .inf-impact-copy{

          font-size:10px;

          line-height:1.35;

        }

        #influenceCard.is-phantom-node .inf-impact-copy,

        #influenceCard.is-phantom-node .inf-war-intel{

          margin-top:8px;

        }

        #influenceCard.is-phantom-node .inf-war-intel summary{

          padding:12px 38px 12px 14px;

          font-size:14px;

        }

        #influenceCard.is-phantom-node .inf-war-intel-summary-copy{

          font-size:10px;

        }

        #influenceCard.is-phantom-node .inf-war-intel-body{

          padding:0 10px 10px;

        }

        #influenceCard.is-phantom-node #infIntelShell,

        #influenceCard.is-phantom-node #infLoreShell,

        #influenceCard.is-phantom-node #infWeeklyPreview{

          margin-top:8px;

        }

      }



      @media (max-width: 430px){

        #influenceModal .inf-modal-card{ padding:12px 10px 11px; }

        #influenceModal .inf-hero-grid{ grid-template-columns:minmax(0,1fr); }

        #influenceModal .inf-node-core{ width:100%; height:84px; }

        #influenceModal .inf-local-grid,

        #influenceModal .inf-status-grid{ grid-template-columns:minmax(0,1fr); }

        #influenceModal .inf-signal-sheet{ width:min(96vw,430px); left:50%; right:auto; bottom:6px; padding:9px 9px 10px; }

        #influenceModal .inf-signal-grid{ grid-template-columns:minmax(0,1fr); }

        #influenceModal .inf-weekly-grid{ grid-template-columns:minmax(0,1fr); }

        #influenceModal .inf-reward-checklist{ grid-template-columns:repeat(2,minmax(0,1fr)); }

        #influenceModal .inf-weekly-mini-grid{ grid-template-columns:minmax(0,1fr); }

        #influenceCard.is-phantom-node{

          width:min(100vw - 8px, 420px);

          padding:10px 10px 12px;

          border-radius:20px;

        }

        #influenceCard.is-phantom-node .inf-head{

          min-height:34px;

          padding:0 58px 4px;

        }

        #influenceCard.is-phantom-node .inf-title{

          font-size:clamp(18px, 5.8vw, 24px);

        }

        #influenceCard.is-phantom-node .inf-sub{

          font-size:8.5px;

          letter-spacing:.11em;

        }

        #influenceCard.is-phantom-node .inf-close-btn{

          min-width:60px;

          padding:8px 10px;

        }

        #influenceCard.is-phantom-node .inf-phantom-hero-media{

          min-height:212px;

        }

        #influenceCard.is-phantom-node .inf-threat-boss-portrait{

          flex:0 0 56px;

          width:56px;

          height:56px;

        }

        #influenceCard.is-phantom-node .inf-threat-bg-accent{

          display:none;

        }

        #influenceCard.is-phantom-node .inf-threat-name{

          font-size:16px;

        }



        #influenceCard.is-phantom-node .inf-phantom-hero-top{

          gap:7px;

          padding:36px 8px 0;

        }

        #influenceCard.is-phantom-node .inf-node-core,

        #influenceCard.is-phantom-node .inf-phantom-faction-card{

          padding:8px 9px;

        }

        #influenceCard.is-phantom-node .inf-leader{

          font-size:16px;

        }

        #influenceCard.is-phantom-node .inf-encounter-line{

          font-size:13px;

        }

        #influenceCard.is-phantom-node .inf-hero-status{

          font-size:10.5px;

        }

        #influenceCard.is-phantom-node .inf-pressure-head{

          font-size:11px;

        }

        #influenceCard.is-phantom-node .inf-pressure-side .value{

          font-size:18px;

        }

        #influenceCard.is-phantom-node .inf-pressure-track{

          height:52px;

        }

        #influenceCard.is-phantom-node .inf-pressure-fill{

          top:17px;

          bottom:17px;

        }

        #influenceCard.is-phantom-node .inf-pressure-core{

          width:48px;

          height:48px;

        }

        #influenceCard.is-phantom-node .inf-action-grid{

          grid-template-columns:repeat(2,minmax(0,1fr));

          gap:7px;

        }

        #influenceCard.is-phantom-node .inf-action-card{

          min-height:136px;

        }

        #influenceCard.is-phantom-node .inf-action-art{

          height:48px;

        }

        #influenceCard.is-phantom-node .inf-action-copy{

          padding:8px 8px 9px;

        }

        #influenceCard.is-phantom-node .inf-action-title{

          font-size:14px;

        }

        #influenceCard.is-phantom-node .inf-action-effect{

          font-size:9.5px;

        }

        #influenceCard.is-phantom-node .inf-action-chip{

          font-size:10.5px;

        }

        #influenceCard.is-phantom-node .inf-impact-grid{

          grid-template-columns:repeat(2,minmax(0,1fr));

        }

      }



      @media (max-width: 360px){

        #influenceCard.is-phantom-node .inf-phantom-hero-top,

        #influenceCard.is-phantom-node .inf-action-grid,

        #influenceCard.is-phantom-node .inf-impact-grid{

          grid-template-columns:minmax(0,1fr);

        }

      }

    `;

    document.head.appendChild(style);

  }



  function ensureModal() {

    if (document.getElementById("influenceModal")) return;

    ensureModalStyles();

    try { window.AH_ensureRivalryVisualStyles?.(); } catch (_) {}



    const wrap = document.createElement("div");

    wrap.id = "influenceModal";

    wrap.style.cssText = `

      position: fixed;

      inset: 0;

      display: none;

      align-items: center;

      justify-content: center;

      padding:

        calc(env(safe-area-inset-top, 0px) + 12px)

        6px

        calc(env(safe-area-inset-bottom, 0px) + 16px)

        6px;

      box-sizing: border-box;

      overflow: hidden;

      background: rgba(0,0,0,.48);

      z-index: 2147483647;

      transform: none;

    `;



    wrap.innerHTML = `

      <div id="influenceCard" class="inf-modal-card ah-rivalry-layer rv-node-frontline">

        <div class="inf-head">

          <div>

            <div id="infTitle" class="inf-title">Influence Frontline</div>

            <div id="infSub" class="inf-sub"></div>

          </div>

          <button data-close type="button" class="inf-close-btn">Close</button>

        </div>



        <section id="infHero" class="inf-hero rv-surface rv-surface-hero">

          <div class="inf-phantom-hero-media">

            <img class="inf-phantom-hero-art" src="${PHANTOM_NODE_ASSETS.hero}" alt="Phantom Node relay banner" loading="eager" decoding="async" onerror="this.style.display='none'; if (this.parentElement) this.parentElement.classList.add('is-art-missing');" />

            <span class="inf-phantom-hero-signal" aria-hidden="true"></span>

            <span id="infPhantomHeroBadge" class="inf-phantom-status-badge" data-state="CALM">Stable</span>

            <div class="inf-phantom-hero-top">

              <button

                id="infSignalCoreBtn"

                type="button"

                class="inf-node-core inf-node-core-btn inf-phantom-sidecard inf-phantom-id-card"

                data-signal-open

                aria-haspopup="dialog"

                aria-controls="infSignalSheet"

                aria-expanded="false"

              >

                <div class="inf-node-core-label">Alpha Husky</div>

                <div class="inf-node-core-mark">Signal Core</div>

                <div id="infCoreState" class="inf-node-core-state">Stable</div>

                <div id="infNodeIdentityCode" class="inf-node-core-code"></div>

                <div class="inf-node-core-hint">Inspect</div>

              </button>

              <div class="inf-phantom-center-copy">

                <div id="infHeroKicker" class="inf-panel-kicker">Faction war control point</div>

                <div id="infLeader" class="inf-leader">-</div>

                <div id="infControlLine" class="inf-control-line"></div>

                <div id="infEncounterLine" class="inf-encounter-line">This node needs support.</div>

              </div>

              <div class="inf-phantom-sidecard inf-phantom-faction-card">

                <div class="inf-phantom-sidecard-label">Current Lead</div>

                <div class="inf-phantom-faction-row">

                  <div class="inf-phantom-faction-sigil-wrap">

                    <img id="infHeroFactionSigil" class="inf-phantom-faction-sigil" alt="" loading="eager" decoding="async" style="display:none;" onerror="this.style.display='none'; var fb=document.getElementById('infHeroFactionFallback'); if (fb) fb.style.display='grid';" />

                    <div id="infHeroFactionFallback" class="inf-phantom-faction-fallback">--</div>

                  </div>

                  <div>

                    <div id="infHeroFactionName" class="inf-phantom-faction-name">Neutral</div>

                    <div id="infHeroFactionLead" class="inf-phantom-faction-lead">No lead recorded.</div>

                  </div>

                </div>

                <div id="infHeroFactionStatus" class="inf-phantom-faction-status">Pressure is building.</div>

              </div>

            </div>

            <div class="inf-phantom-hero-bottom">

              <div class="inf-chip-row">

                <span id="infUxStatus" class="inf-chip rv-chip">Secured</span>

                <span id="infUxControlChip" class="inf-chip inf-chip-muted rv-chip is-muted">Controlled</span>

                <span id="infUxAction" class="inf-chip inf-chip-muted rv-chip is-muted">Pressure stable</span>

                <span id="infUxValue" class="inf-chip rv-chip" style="display:none;"></span>

                <span id="infUxWatchChip" class="inf-chip inf-chip-muted rv-chip is-muted" style="display:none;"></span>

              </div>

              <div id="infHeroFlavor" class="inf-hero-flavor">Old relay spines control signal routes, patrol response, and faction pressure.</div>

              <div id="infUxStatusText" class="inf-hero-status">This frontline is stable right now.</div>

            </div>

          </div>

          <div id="infClashMeter" class="inf-clash-meter" style="display:none;"></div>

          <div id="infThreatCard" class="inf-threat-card" style="display:none;"></div>

          <div id="infThreatPulse" class="inf-threat-pulse" style="display:none;"></div>

          <div id="infFrontlineTarget" class="inf-frontline-target" style="display:none;"></div>

          <div id="infDailyOutcome" class="inf-daily-outcome" style="display:none;"></div>

          <div id="infFrontlineToday" class="inf-frontline-today" style="display:none;"></div>

          <div id="infFrontlineConfront" class="inf-frontline-confront" style="display:none;"></div>

          <div id="infContested" style="display:none;"></div>

        </section>



        <section id="infOpsPanel" class="inf-panel inf-ops-panel rv-surface">

          <div class="inf-panel-head">

            <div id="infOrdersTitle" class="inf-panel-title">Operations</div>

            <span id="infOpsState" class="inf-chip">Stand by</span>

          </div>

          <div id="infOrdersLead" class="inf-hero-status">Hold the relay.</div>

          <div class="inf-action-grid">

            <button id="infPatrolBtn" type="button" class="inf-action-card inf-action-card-primary">

              <span class="inf-action-art">

                <img src="${PHANTOM_NODE_ASSETS.patrolAction}" alt="Patrol Node tactical art" loading="eager" decoding="async" onerror="if (this.parentElement) this.parentElement.style.display='none';" />

              </span>

              <span class="inf-action-copy">

                <span class="inf-action-line">

                  <span class="inf-action-eyebrow">Patrol Node</span>

                  <span id="infPatrolTimer" class="inf-chip inf-action-tag" style="display:none;"></span>

                </span>

                <span id="infPatrolLabel" class="inf-action-title">Defend Node</span>

                <span id="infPatrolHelp" class="inf-action-effect">${PATROL_ACTION_HINT}</span>

                <span class="inf-action-chip">Deploy Patrol</span>

              </span>

            </button>



            <button id="infDonateToggle" type="button" class="inf-action-card inf-action-card-support">

              <span class="inf-action-art">

                <img src="${PHANTOM_NODE_ASSETS.donateAction}" alt="Donate Supplies logistics art" loading="eager" decoding="async" onerror="if (this.parentElement) this.parentElement.style.display='none';" />

              </span>

              <span class="inf-action-copy">

                <span class="inf-action-line">

                  <span class="inf-action-eyebrow">Donate Supplies</span>

                </span>

                <span class="inf-action-title">Support Flow</span>

                <span id="infDonateHelp" class="inf-action-effect">${DONATE_ACTION_HINT}</span>

                <span class="inf-action-chip">Deliver Supplies</span>

              </span>

            </button>

          </div>

          <div id="infWatchHelp" class="inf-watch-line">Patrol is live. Move now to support your faction.</div>

          <div id="infOrdersCooldown" class="inf-orders-cooldown">Patrol ready now. Free action is back online.</div>

        </section>



        <div id="infDonateBox" class="inf-donate-box" style="display:none;">

          <div id="infDonateShell" class="inf-donate-shell">Resource Reinforcement</div>

          <div class="inf-donate-inputs">

            <select id="infAsset" class="inf-donate-select">

              <option value="scrap">scrap</option>

              <option value="rune_dust">rune_dust</option>

              <option value="bones">bones</option>

            </select>

            <input id="infAmount" class="inf-donate-amount" type="number" min="1" step="1" value="10" />

          </div>

          <div class="inf-donate-quick">

            <button class="infAmt" type="button" data-v="10">+10</button>

            <button class="infAmt" type="button" data-v="50">+50</button>

            <button class="infAmt" type="button" data-v="100">+100</button>

          </div>

          <div class="inf-donate-note">${DONATE_ACTION_HINT}</div>

          <button id="infDonateBtn" type="button" class="inf-donate-confirm">Confirm donate</button>

        </div>



        <section id="infPresenceShell" class="inf-panel rv-surface">

          <div class="inf-panel-head">

            <div id="infRewardTitle" class="inf-panel-title">Your Impact Today</div>

            <span id="infRewardStateChip" class="inf-chip inf-chip-muted">Not yet</span>

          </div>

          <div id="infRewardStateText" class="inf-hero-status">Your frontline actions strengthen faction support and weekly reward progress.</div>

          <div class="inf-impact-grid">

            <article class="inf-impact-card">

              <div class="inf-impact-label">Patrol Status</div>

              <div id="infImpactPatrolValue" class="inf-impact-value">Available</div>

              <div id="infImpactPatrolHint" class="inf-impact-hint">Patrol is ready now.</div>

            </article>

            <article class="inf-impact-card">

              <div class="inf-impact-label">Supplies Status</div>

              <div id="infImpactSuppliesValue" class="inf-impact-value">Available</div>

              <div id="infImpactSuppliesHint" class="inf-impact-hint">Send supplies to reinforce the relay.</div>

            </article>

            <article class="inf-impact-card">

              <div class="inf-impact-label">Faction Support</div>

              <div id="infImpactSupportValue" class="inf-impact-value">0/60</div>

              <div id="infImpactSupportHint" class="inf-impact-hint">Build faction support through patrols and supplies.</div>

            </article>

            <article class="inf-impact-card">

              <div class="inf-impact-label">Reward Status</div>

              <div id="infImpactRewardValue" class="inf-impact-value">Not yet</div>

              <div id="infImpactRewardHint" class="inf-impact-hint">War reward progress will appear here.</div>

            </article>

          </div>

          <div id="infImpactCopy" class="inf-impact-copy">One action strengthens your faction presence.</div>

          <div class="inf-reward-metric" style="display:none;">

            <div class="inf-reward-metric-head">

              <span class="inf-label-row">Your Faction Support <button type="button" class="inf-help" data-tip-key="weekly_score" aria-label="Your Faction Support help">?</button></span>

              <span id="infRewardScoreValue">0/60</span>

            </div>

            <div class="inf-reward-track"><i id="infRewardScoreBar" style="width:0%;"></i></div>

          </div>

          <div class="inf-reward-metric" style="display:none;">

            <div class="inf-reward-metric-head">

              <span class="inf-label-row">Active Days <button type="button" class="inf-help" data-tip-key="eligibility" aria-label="Eligibility help">?</button></span>

              <span id="infRewardDaysValue">0/2</span>

            </div>

            <div class="inf-reward-track inf-reward-track-days"><i id="infRewardDaysBar" style="width:0%;"></i></div>

          </div>

          <div id="infRewardHint" class="inf-hint" style="display:none;">War Rewards may include aura, frame, skin, or raffle entry.</div>

          <div id="infLocalYou" style="display:none;"></div>

          <div id="infLocalProgress" style="display:none;"></div>

          <div id="infPresenceHint" style="display:none;"></div>

          <div id="infIntelPresence" style="display:none;"></div>

        </section>



        <div id="infStatus" class="inf-status" style="display:none;"></div>

        <details id="infWarIntel" class="inf-war-intel">

          <summary>

            <span>War Intel</span>

            <span class="inf-war-intel-summary-copy">Pressure, support, reward details</span>

          </summary>

          <div class="inf-war-intel-body">

            <section id="infIntelShell" class="inf-panel rv-surface">

              <div class="inf-panel-head">

                <div id="infWarTitle" class="inf-panel-title">Faction Control</div>

                <span id="infWarChip" class="inf-chip inf-chip-muted">Live feed</span>

              </div>

              <div id="infWarSummary" class="inf-hero-status">Faction Control data is syncing.</div>

              <div class="inf-local-grid">

                <article class="inf-tile">

                  <div class="inf-tile-label">Owner</div>

                  <div id="infIntelOwner" class="inf-tile-value">-</div>

                </article>

                <article class="inf-tile">

                  <div class="inf-tile-label">

                    <span class="inf-label-row">Pressure <button type="button" class="inf-help" data-tip-key="pressure" aria-label="Pressure help">?</button></span>

                  </div>

                  <div id="infIntelWatch" class="inf-tile-value">No pressure trace</div>

                  <div class="inf-meter"><i id="infIntelWatchBar"></i></div>

                </article>

                <article class="inf-tile">

                  <div class="inf-tile-label">

                    <span class="inf-label-row">Node Condition <button id="infConditionHelp" type="button" class="inf-help" data-tip-key="hot" aria-label="Node condition help">?</button></span>

                  </div>

                  <div id="infIntelPressure" class="inf-tile-value">CALM</div>

                  <div class="inf-meter"><i id="infIntelPressureBar"></i></div>

                  <div id="infIntelPressureHint" class="inf-hint">Waiting for frontline pressure.</div>

                </article>

                <article class="inf-tile">

                  <div class="inf-tile-label">

                    <span class="inf-label-row">Recommended Action <button id="infActionHelp" type="button" class="inf-help" data-tip-key="defend" aria-label="Recommended action help">?</button></span>

                  </div>

                  <div id="infLocalOps" class="inf-tile-value">STABILIZE</div>

                  <div id="infNodeStateHint" class="inf-hint">Recommended order will update from local pressure.</div>

                </article>

              </div>

            </section>



            <section id="infLoreShell" class="inf-panel rv-surface">

              <div class="inf-panel-head">

                <div id="infIntelTitle" class="inf-panel-title">Intel</div>

                <span class="inf-chip inf-chip-muted">Relay brief</span>

              </div>

              <article class="inf-intel-block">

                <div class="inf-intel-label">Relay Brief</div>

                <div id="infUxReason" class="inf-intel-copy"></div>

              </article>

              <article class="inf-intel-block">

                <div class="inf-intel-label">Rivalry Link</div>

                <div id="infUxReward" class="inf-intel-copy"></div>

              </article>

              <div id="infUxLore" class="inf-intel-lore" style="display:none;"></div>

            </section>



            <div id="infWeeklyPreview" style="display:none;"></div>

            <div id="infWeekly" style="display:none;"></div>

            <div id="infFoot" class="inf-foot"></div>

          </div>

        </details>

        <div id="infTooltip" class="inf-tooltip" style="display:none;" aria-hidden="true"></div>

      </div>

      <button id="infSignalBackdrop" type="button" class="inf-signal-backdrop" style="display:none;" data-signal-close aria-label="Close Signal Core panel"></button>

      <section id="infSignalSheet" class="inf-signal-sheet" style="display:none;" aria-hidden="true" role="dialog" aria-label="Signal Core Inspect Panel">

        <div class="inf-signal-head">

          <div class="inf-signal-head-copy">

            <div class="inf-signal-overline">Signal Core Chamber</div>

            <div class="inf-signal-title-row">

              <div class="inf-signal-title">SIGNAL CORE</div>

              <span id="infSignalStatusChip" class="inf-signal-state-chip">CALM</span>

            </div>

            <div id="infSignalSubtitle" class="inf-signal-sub">Node signal unstable</div>

          </div>

          <button type="button" class="inf-signal-close" data-signal-close>Close</button>

        </div>

        <div class="inf-signal-summary">

          <article class="inf-signal-summary-item">

            <div class="inf-signal-summary-label">Owner</div>

            <div id="infSignalOwner" class="inf-signal-summary-value">Neutral</div>

          </article>

          <article class="inf-signal-summary-item">

            <div class="inf-signal-summary-label">Status</div>

            <div id="infSignalStatus" class="inf-signal-summary-value">CALM</div>

          </article>

          <article class="inf-signal-summary-item">

            <div class="inf-signal-summary-label">Pressure</div>

            <div id="infSignalPressureSummary" class="inf-signal-summary-value">Quiet</div>

          </article>

          <article class="inf-signal-summary-item">

            <div class="inf-signal-summary-label">Node Value</div>

            <div id="infSignalValueSummary" class="inf-signal-summary-value">Support</div>

          </article>

        </div>

        <div class="inf-signal-visual">

          <div class="inf-signal-gridlines" aria-hidden="true"></div>

          <div class="inf-signal-visual-top">

            <div class="inf-signal-visual-topline">

              <span class="inf-signal-mini-label">Owner Signature</span>

              <span id="infSignalOwnerMini" class="inf-signal-mini-value">Neutral</span>

            </div>

            <div class="inf-signal-visual-topline">

              <span class="inf-signal-mini-label">Pressure Band</span>

              <span id="infSignalPressureMini" class="inf-signal-mini-value">Quiet</span>

            </div>

          </div>

          <div class="inf-signal-chamber">

            <div class="inf-signal-dais" aria-hidden="true"></div>

            <div class="inf-signal-energy"></div>

            <div class="inf-signal-reticle is-crosshair"></div>

            <div class="inf-signal-reticle is-outer"></div>

            <div class="inf-signal-reticle is-inner"></div>

            <div class="inf-signal-pulse-ring"></div>

            <div class="inf-signal-sigil-core" data-sigil-mode="fallback">

              <div class="inf-signal-sigil-lens">

                <img id="infSignalSigil" class="inf-signal-sigil" alt="" loading="eager" decoding="async" style="display:none;" onerror="this.style.display='none'; if (this.closest('.inf-signal-sigil-core')) this.closest('.inf-signal-sigil-core').dataset.sigilMode='fallback'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';" />

                <div id="infSignalSigilFallback" class="inf-signal-sigil-fallback">--</div>

              </div>

            </div>

            <div class="inf-signal-interference"></div>

            <div class="inf-signal-visual-copy">

              <div id="infSignalVisualState" class="inf-signal-visual-state">CALM</div>

              <div id="infSignalVisualHint" class="inf-signal-visual-hint">Node signal unstable</div>

            </div>

          </div>

          <div class="inf-signal-chamber-status">

            <span id="infSignalOwnerChip" class="inf-signal-chip">Neutral</span>

            <span id="infSignalValueChip" class="inf-signal-chip is-value">Support</span>

          </div>

        </div>

        <div class="inf-signal-grid">

          <article class="inf-signal-tile">

            <div class="inf-signal-tile-label">Control State</div>

            <div id="infSignalControlState" class="inf-signal-tile-value">CALM | Neutral</div>

          </article>

          <article class="inf-signal-tile">

            <div class="inf-signal-tile-label">Pressure</div>

            <div id="infSignalPressure" class="inf-signal-tile-value">Quiet</div>

          </article>

          <article id="infSignalWatchTile" class="inf-signal-tile">

            <div class="inf-signal-tile-label">Watch Slots</div>

            <div id="infSignalWatch" class="inf-signal-tile-value">Open</div>

          </article>

          <article class="inf-signal-tile">

            <div class="inf-signal-tile-label">Node Value</div>

            <div id="infSignalValue" class="inf-signal-tile-value">Support</div>

          </article>

        </div>

        <div class="inf-signal-readout">

          <div class="inf-signal-readout-head">

            <div class="inf-signal-readout-title">Tactical Readout</div>

            <div id="infSignalReadoutBadge" class="inf-signal-readout-badge">Live</div>

          </div>

          <div id="infSignalReadout" class="inf-signal-lines">

            <div class="inf-signal-line">Signal feed syncing.</div>

          </div>

        </div>

        <div class="inf-signal-pulse">

          <span id="infSignalPulseValue">Recent pulse: low traffic.</span>

        </div>

        <div class="inf-signal-return">Return to orders to patrol or donate.</div>

        <div class="inf-signal-foot">

          <button type="button" class="inf-signal-return-btn" data-signal-close>RETURN TO ORDERS</button>

        </div>

      </section>

    `;



    // direct bind close

    const _closeBtn = wrap.querySelector("[data-close]");

    if (_closeBtn) {

      _closeBtn.addEventListener("click", (e) => {

        e.preventDefault();

        e.stopPropagation();

        close();

      });

    }

    const _signalBtn = wrap.querySelector("#infSignalCoreBtn");

    if (_signalBtn) {

      _signalBtn.addEventListener("click", (e) => {

        e.preventDefault();

        e.stopPropagation();

        setSignalCorePanelOpen(true);

      });

    }



    // click handling

    wrap.addEventListener("click", (e) => {

      const t = e.target;

      const el = (t && typeof t.closest === "function") ? t : null;

      const tipTrigger = el ? el.closest("[data-tip-key]") : null;

      const insideTooltip = el ? el.closest("#infTooltip") : null;



      if (tipTrigger) {

        e.preventDefault();

        e.stopPropagation();

        toggleTooltip(tipTrigger.getAttribute("data-tip-key"), tipTrigger);

        return;

      }

      if (!insideTooltip && _tooltipKey) {

        closeTooltip();

      }



      if (el && el.closest("[data-signal-close]")) {

        e.preventDefault();

        e.stopPropagation();

        setSignalCorePanelOpen(false);

        return;

      }

      if (el && el.closest("#infSignalSheet")) return;



      if (el && el.matches("[data-close]")) { e.preventDefault(); e.stopPropagation(); close(); return; }

      if (t === wrap) {

        e.preventDefault();

        e.stopPropagation();

        if (_tooltipKey) closeTooltip();

        else if (_signalCoreOpen) setSignalCorePanelOpen(false);

        else close();

        return;

      }



      if (el && el.classList && el.classList.contains("infAmt")) {

        e.preventDefault(); e.stopPropagation();

        const v = parseInt(el.getAttribute("data-v") || "0", 10);

        const inp = document.getElementById("infAmount");

        if (inp) inp.value = String(v);

        return;

      }

    });



    const card = wrap.querySelector("#influenceCard");

    if (card) card.addEventListener("scroll", () => closeTooltip(), { passive: true });



    _modalHost().appendChild(wrap);



    document.getElementById("infDonateToggle")?.addEventListener("click", () => {

      const box = document.getElementById("infDonateBox");

      if (!box) return;

      box.style.display = (box.style.display === "none" || !box.style.display) ? "block" : "none";

    });

  }



  async function refreshLeaders(applyToMapOrOptions = true, maybeOptions = null) {

    if (!_apiPost) return null;

    const { applyToMap, force, reason } = _parseRefreshLeadersArgs(applyToMapOrOptions, maybeOptions);

    const perfT0 = window.__ahPerf?.now?.() || Date.now();

    const now = Date.now();

    let cacheHit = false;

    let deduped = false;



    function applyCurrentLeaders(leaders) {

      if (!applyToMap || !leaders) return;

      try { window.AHMap?.applyLeaders?.(leaders); } catch (_) {}

      try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}

    }



    if (_leadersRefreshPromise) {

      deduped = true;

      try {

        const leaders = await _leadersRefreshPromise;

        applyCurrentLeaders(leaders);

        return leaders;

      } finally {

        window.__ahPerf?.log?.("Influence.refreshLeaders", perfT0, { applyToMap, cacheHit, deduped });

      }

    }



    if (!force && _leadersMap && (now - _leadersLastFetchMs) < LEADERS_AUTO_STALE_MS) {

      cacheHit = true;

      _logDbg("load leaders skipped", { reason, ageMs: now - _leadersLastFetchMs });

      applyCurrentLeaders(_leadersMap);

      window.__ahPerf?.log?.("Influence.refreshLeaders", perfT0, { applyToMap, cacheHit, deduped });

      return _leadersMap;

    }



    _logDbg(_leadersMap ? "load leaders fresh" : "load leaders initial", { reason, force });

    const run = (async () => {

      const r = await _apiPost("/webapp/map/leaders", { run_id: rid("lead") });

      const ok = r?.ok !== false;

      const leaders =

        r?.leadersMap ||

        r?.leaders_map ||

        r?.data?.leadersMap ||

        r?.data?.leaders_map ||

        null;



      if (ok && leaders) {

        _leadersMap = leaders;

        _leadersLastFetchMs = Date.now();

        return leaders;

      }

      return _leadersMap;

    })();



    _leadersRefreshPromise = run;

    try {

      const leaders = await run;

      applyCurrentLeaders(leaders);

      return leaders;

    } catch (e) {

      if (_dbg) console.warn("refreshLeaders failed", e);

      return _leadersMap;

    } finally {

      if (_leadersRefreshPromise === run) _leadersRefreshPromise = null;

      window.__ahPerf?.log?.("Influence.refreshLeaders", perfT0, { applyToMap, cacheHit, deduped });

    }

  }



  async function refreshWeekly(nodeId, options = {}) {

    if (!_apiPost) return;

    const safeNodeId = normalizeNodeId(nodeId) || String(nodeId || "");

    const { force = false, reason = "auto" } = options || {};

    const now = Date.now();



    if (

      force &&

      _nodeStateRefreshPromise &&

      _nodeStateRefreshNodeId === safeNodeId

    ) {

      try { await _nodeStateRefreshPromise; } catch (_) {}

    } else if (

      _nodeStateRefreshPromise &&

      _nodeStateRefreshNodeId === safeNodeId

    ) {

      return _nodeStateRefreshPromise;

    }



    if (

      !force &&

      _nodeStateCache &&

      _nodeStateLastNodeId === safeNodeId &&

      (now - _nodeStateLastFetchMs) < NODE_STATE_AUTO_STALE_MS

    ) {

      _logDbg("skipped fresh state", { nodeId: safeNodeId, reason, ageMs: now - _nodeStateLastFetchMs });

      const cached = _nodeStateCache;

      const info = cached?.info || cached?.data?.info || null;

      if (info && typeof info === "object") {

        const youFaction = normalizeFaction(

          info?.youFaction ||

          cached?.youFaction ||

          cached?.you?.faction ||

          getCanonicalFaction()

        );

        if (youFaction) setFaction(youFaction);

        _nodeInfoById[safeNodeId] = {

          ...(_nodeInfoById[safeNodeId] || {}),

          ...info,

          youFaction,

          threatPulse: r?.threatPulse || info?.threatPulse || null,

          frontlineTarget: r?.frontlineTarget || info?.frontlineTarget || null,

          dailyOutcome: r?.dailyOutcome || info?.dailyOutcome || null,

          frontlineToday: r?.frontlineToday || info?.frontlineToday || null,

          frontlineConfront: r?.frontlineConfront || info?.frontlineConfront || null,

        };

        paintLeader(safeNodeId);

      }

      _weekly = extractWeekly(cached);

      renderWeekly();

      return cached;

    }



    const run = (async () => {

      const r = await _apiPost("/webapp/influence/state", {

        nodeId: safeNodeId,

        run_id: rid("infstate"),

      });

      _nodeStateCache = r;

      _nodeStateLastNodeId = safeNodeId;

      _nodeStateLastFetchMs = Date.now();



      const responseFaction = normalizeFaction(

        r?.youFaction ||

        r?.you?.faction ||

        r?.data?.youFaction ||

        r?.data?.you?.faction ||

        ""

      );

      if (responseFaction) setFaction(responseFaction);



      const info = r?.info || r?.data?.info || null;

      if (info && typeof info === "object") {

        const youFaction = normalizeFaction(

          info?.youFaction ||

          r?.youFaction ||

          r?.you?.faction ||

          getCanonicalFaction()

        );



        if (youFaction) setFaction(youFaction);



        _nodeInfoById[safeNodeId] = {

          ...(_nodeInfoById[safeNodeId] || {}),

          ...info,

          youFaction,

        };

        paintLeader(safeNodeId);

      }



      _weekly = extractWeekly(r);

      renderWeekly();

      return r;

    })();



    _nodeStateRefreshPromise = run;

    _nodeStateRefreshNodeId = safeNodeId;

    try {

      return await run;

    } catch (e) {

      if (_dbg) console.warn("refreshWeekly failed", e);

      return _nodeStateCache;

    } finally {

      if (_nodeStateRefreshPromise === run) {

        _nodeStateRefreshPromise = null;

        _nodeStateRefreshNodeId = "";

      }

    }

  }



  function open(nodeId, title = "") {

    ensureModal();

    const m = document.getElementById("influenceModal");

    if (!m) return;

    const safeNodeId = normalizeNodeId(nodeId) || String(nodeId || "");

    const phantomMode = isPhantomNode(safeNodeId);



    clearStatus();

    setSignalCorePanelOpen(false);

    closeTooltip();



    // show host (escape transforms)

    _modalHost().style.display = "block";



    try { (_tg || window.Telegram?.WebApp)?.expand?.(); } catch (_) {}



    m.dataset.nodeId = safeNodeId;

    _openNodeId = safeNodeId;



    const titleEl = document.getElementById("infTitle");

    const subEl = document.getElementById("infSub");

    const heroKickerEl = document.getElementById("infHeroKicker");

    const heroFlavorEl = document.getElementById("infHeroFlavor");

    const cardEl = document.getElementById("influenceCard");

    const rewardTitleEl = document.getElementById("infRewardTitle");

    const ordersTitleEl = document.getElementById("infOrdersTitle");

    const warIntelEl = document.getElementById("infWarIntel");

    if (cardEl) cardEl.classList.toggle("is-phantom-node", phantomMode);

    if (titleEl) titleEl.textContent = phantomMode ? "PHANTOM NODE" : (title || nodeId);

    if (subEl) {

      const prettyNodeId = String(safeNodeId || "").trim().replaceAll("_", " ");

      subEl.textContent = phantomMode

        ? "PACK vs WASTELAND · HOLD THE LINE"

        : (prettyNodeId ? `Frontline objective - ${prettyNodeId}` : "Frontline objective");

    }

    if (heroKickerEl) heroKickerEl.textContent = phantomMode ? "Pack vs Wasteland" : "Live Node Operations";

    if (rewardTitleEl) rewardTitleEl.textContent = phantomMode ? "Your Impact Today" : "Your Faction Support";

    if (ordersTitleEl) ordersTitleEl.textContent = phantomMode ? "Operations" : "Your Orders";

    if (warIntelEl) warIntelEl.open = !phantomMode;

    if (heroFlavorEl && !phantomMode) heroFlavorEl.textContent = "Frontline conditions update from live faction pressure.";



    // close donate box at start

    const donateBox = document.getElementById("infDonateBox");

    if (donateBox) donateBox.style.display = "none";



    _weekly = null;

    renderWeekly();



    if (_openLoadPromise && _openLoadNodeId === safeNodeId) {

      _logDbg("open node", { nodeId: safeNodeId, reused: true, inFlight: true });

    } else {

      _openLoadNodeId = safeNodeId;

      const run = (async () => {

        await refreshLeaders({ applyToMap: false, reason: "open" });

        paintLeader(safeNodeId);

        await refreshWeekly(safeNodeId, { reason: "open" });

      })();

      _openLoadPromise = run;

      run.finally(() => {

        if (_openLoadNodeId === safeNodeId) _openLoadNodeId = "";

        if (_openLoadPromise === run) _openLoadPromise = null;

      });

      _logDbg("open node", { nodeId: safeNodeId, reused: false, inFlight: false });

    }



    const patrolBtn = document.getElementById("infPatrolBtn");

    const donateBtn = document.getElementById("infDonateBtn");

    if (patrolBtn) patrolBtn.onclick = () => doPatrol(safeNodeId);

    if (donateBtn) donateBtn.onclick = () => doDonate(safeNodeId);



    m.style.display = "flex";

    document.body.classList.add("ah-modal-open");

    try {

      window.navRegister?.("influenceModal", {

        close,

        isOpen: () => {

          const modal = document.getElementById("influenceModal");

          return !!modal && modal.style.display !== "none";

        },

      });

      window.navOpen?.("influenceModal");

    } catch (_) {}

    _startPoll();



    // if cooldown running, render it immediately

    if (_cdUntilMs > Date.now()) {

      startCooldown(Math.ceil((_cdUntilMs - Date.now()) / 1000));

    } else if (_lastFactionCdSec > 0) {

      startCooldown(_lastFactionCdSec);

    } else {

      // ensure button is not stuck disabled

      setPatrolButtonLabel(currentPatrolLabel());

    }



    // reset scroll on card

    requestAnimationFrame(() => {

      try {

        const card = document.getElementById("influenceCard");

        if (card) card.scrollTop = 0;

      } catch (_) {}

    });

  }



  function close() {

    const m = document.getElementById("influenceModal");

    if (!m) return;



    setSignalCorePanelOpen(false);

    closeTooltip();

    _stopPoll("close");

    m.style.display = "none";

    document.body.classList.remove("ah-modal-open");

    try { window.navClose?.("influenceModal"); } catch (_) {}

    if (_dbg) console.debug("[Influence] close");



    try {

      const card = document.getElementById("influenceCard");

      if (card) card.scrollTop = 0;

    } catch (_) {}



    _modalHost().style.display = "none";

    _openNodeId = "";

  }



  function mergedNodeInfo(nodeId) {

    const leaderInfo = (_leadersMap && typeof _leadersMap[nodeId] === "object" && _leadersMap[nodeId]) || {};

    const nodeInfo = (_nodeInfoById && typeof _nodeInfoById[nodeId] === "object" && _nodeInfoById[nodeId]) || {};

    return { ...leaderInfo, ...nodeInfo };

  }



  function uxStatusText(displayStatus) {

    const key = String(displayStatus || "").trim().toUpperCase();

    if (key === "SIEGE_LIVE") return "Live assault in progress. This node can swing right now.";

    if (key === "SIEGE_FORMING") return "Pressure spike detected. A clash can start soon.";

    if (key === "SIEGE_COOLDOWN") return "Frontline reset window. Rebuild pressure to contest again.";

    if (key === "CONTESTED") return "Both sides are fighting for control right now.";

    if (key === "HOT") return "Pressure is rising. Push now to shape the fight.";

    if (key === "FORTIFIED") return "Control is locked down. Breaking it takes coordinated pressure.";

    return "Node secured for now. Keep pressure to prevent a swing.";

  }



  function uxPrimaryStatusLabel(displayStatus, displayLabel) {

    const key = String(displayStatus || "").trim().toUpperCase();

    if (key === "SIEGE_LIVE") return "HOT";

    if (key === "SIEGE_FORMING" || key === "SIEGE_COOLDOWN") return "UNDER WATCH";

    if (key === "CONTESTED") return "CONTESTED";

    if (key === "HOT") return "HOT";

    if (key === "FORTIFIED") return "FORTIFIED";

    if (key === "CALM" || key === "SECURED") return "SECURED";

    const fallback = String(displayLabel || "").trim().toUpperCase();

    return fallback || "SECURED";

  }



  function uxValueLabel(valueTier, valueMultiplier) {

    const key = String(valueTier || "").trim().toUpperCase();

    const multNum = Number(valueMultiplier || 0);

    const mult = multNum > 0 ? ` x${multNum.toFixed(1)}` : "";

    if (key === "STRATEGIC") return `Strategic${mult}`;

    if (key === "HIGH_VALUE") return `High value${mult}`;

    if (key === "LOW_VALUE" && mult) return `Support${mult}`;

    return "";

  }



  function uxToneStyles(displayStatus) {

    const key = String(displayStatus || "").trim().toUpperCase();

    if (key === "SIEGE_LIVE") return { background: "rgba(255,96,96,.16)", border: "1px solid rgba(255,96,96,.34)", color: "#ffd4d4" };

    if (key === "SIEGE_FORMING") return { background: "rgba(255,184,77,.16)", border: "1px solid rgba(255,184,77,.30)", color: "#ffd89b" };

    if (key === "SIEGE_COOLDOWN") return { background: "rgba(150,220,255,.12)", border: "1px solid rgba(150,220,255,.24)", color: "#d3f4ff" };

    if (key === "CONTESTED") return { background: "rgba(255,154,76,.16)", border: "1px solid rgba(255,154,76,.30)", color: "#ffd0a3" };

    if (key === "HOT") return { background: "rgba(255,210,120,.16)", border: "1px solid rgba(255,210,120,.26)", color: "#ffe5a8" };

    if (key === "FORTIFIED") return { background: "rgba(110,220,255,.14)", border: "1px solid rgba(110,220,255,.28)", color: "#d8f7ff" };

    return { background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "#f4f4f4" };

  }



  function uxMoodTokens(displayStatus) {

    const key = String(displayStatus || "").trim().toUpperCase();

    if (key === "SIEGE_LIVE") {

      return {

        burst: "rgba(255,106,96,.26)",

        base: "rgba(255,120,104,.14)",

        border: "rgba(255,132,112,.36)",

        panel: "rgba(255,116,100,.10)",

        chipBg: "rgba(255,110,96,.18)",

        chipBorder: "rgba(255,110,96,.32)",

        chipFg: "#ffd7d2",

        chipLabel: "Live Contest",

        pressureBar: "linear-gradient(90deg,rgba(255,148,116,.95),rgba(255,96,96,.9))",

      };

    }

    if (key === "SIEGE_FORMING" || key === "CONTESTED") {

      return {

        burst: "rgba(255,172,98,.22)",

        base: "rgba(255,182,116,.12)",

        border: "rgba(255,184,116,.32)",

        panel: "rgba(255,174,112,.09)",

        chipBg: "rgba(255,182,116,.16)",

        chipBorder: "rgba(255,182,116,.30)",

        chipFg: "#ffe0b6",

        chipLabel: "Contested",

        pressureBar: "linear-gradient(90deg,rgba(255,214,126,.92),rgba(255,148,92,.86))",

      };

    }

    if (key === "HOT") {

      return {

        burst: "rgba(255,206,122,.20)",

        base: "rgba(255,208,132,.10)",

        border: "rgba(255,212,136,.30)",

        panel: "rgba(255,206,130,.09)",

        chipBg: "rgba(255,210,130,.15)",

        chipBorder: "rgba(255,210,130,.28)",

        chipFg: "#ffe5b2",

        chipLabel: "High Alert",

        pressureBar: "linear-gradient(90deg,rgba(255,230,140,.90),rgba(255,170,108,.84))",

      };

    }

    if (key === "FORTIFIED" || key === "SIEGE_COOLDOWN") {

      return {

        burst: "rgba(124,208,255,.20)",

        base: "rgba(126,198,255,.10)",

        border: "rgba(138,210,255,.30)",

        panel: "rgba(120,190,255,.09)",

        chipBg: "rgba(132,210,255,.15)",

        chipBorder: "rgba(132,210,255,.28)",

        chipFg: "#d8f4ff",

        chipLabel: "Fortified",

        pressureBar: "linear-gradient(90deg,rgba(138,228,255,.88),rgba(126,178,255,.82))",

      };

    }

    return {

      burst: "rgba(160,188,230,.15)",

      base: "rgba(136,176,230,.08)",

      border: "rgba(180,206,240,.24)",

      panel: "rgba(130,170,224,.07)",

      chipBg: "rgba(155,188,228,.12)",

      chipBorder: "rgba(155,188,228,.22)",

      chipFg: "#d9e8ff",

      chipLabel: "Stable",

      pressureBar: "linear-gradient(90deg,rgba(121,232,255,.88),rgba(104,148,255,.82))",

    };

  }



  function paintUxPill(el, text, styles, visible = true) {

    if (!el) return;

    const show = !!visible && !!String(text || "").trim();

    el.style.display = show ? "inline-flex" : "none";

    if (!show) return;

    el.textContent = String(text || "").trim();

    el.style.background = styles?.background || "rgba(255,255,255,.08)";

    el.style.border = styles?.border || "1px solid rgba(255,255,255,.12)";

    el.style.color = styles?.color || "#fff";

  }



  function resolveNodeUx(nodeId, info) {

    const fallbackStatus = String(info?.displayStatus || "CALM").trim().toUpperCase() || "CALM";

    const fallbackValueTier = String(info?.valueTier || "LOW_VALUE").trim().toUpperCase() || "LOW_VALUE";

    const fallback = {

      displayStatus: fallbackStatus,

      displayLabel: String(info?.displayLabel || fallbackStatus.replaceAll("_", " ")).trim(),

      actionHint: String(info?.actionHint || "Patrol").trim() || "Patrol",

      valueTier: fallbackValueTier,

      valueMultiplier: Number(info?.valueMultiplier || 0) || 1,

      valueText: String(info?.valueText || "Helps with steady faction support.").trim(),

      reasonText: String(info?.reasonText || "This node is stable right now.").trim(),

      rewardText: String(info?.rewardText || "Helping here supports weekly faction progress.").trim(),

    };



    try {

      const ux = window.AHMap?.getNodeUx?.(nodeId, info);

      if (ux && typeof ux === "object") {

        return {

          ...fallback,

          ...ux,

          displayStatus: String(ux.displayStatus || fallback.displayStatus).trim().toUpperCase() || "CALM",

          displayLabel: String(ux.displayLabel || fallback.displayLabel).trim() || fallback.displayLabel,

          actionHint: String(ux.actionHint || fallback.actionHint).trim() || "Patrol",

          valueTier: String(ux.valueTier || fallback.valueTier).trim().toUpperCase() || "LOW_VALUE",

          valueMultiplier: Number(ux.valueMultiplier || 0) || fallback.valueMultiplier,

          valueText: String(ux.valueText || fallback.valueText).trim() || fallback.valueText,

          reasonText: String(ux.reasonText || fallback.reasonText).trim() || fallback.reasonText,

          rewardText: String(ux.rewardText || fallback.rewardText).trim() || fallback.rewardText,

        };

      }

    } catch (_) {}



    return fallback;

  }



  function paintLeader(nodeId) {

    const info = mergedNodeInfo(nodeId);

    const cardEl = document.getElementById("influenceCard");

    const heroEl = document.getElementById("infHero");

    const intelShellEl = document.getElementById("infIntelShell");

    const opsPanelEl = document.getElementById("infOpsPanel");

    const loreShellEl = document.getElementById("infLoreShell");

    const signalSheetEl = document.getElementById("infSignalSheet");

    const opsStateEl = document.getElementById("infOpsState");

    const leaderEl = document.getElementById("infLeader");

    const contEl = document.getElementById("infContested");

    const controlLineEl = document.getElementById("infControlLine");

    const encounterLineEl = document.getElementById("infEncounterLine");

    const heroFlavorEl = document.getElementById("infHeroFlavor");

    const foot = document.getElementById("infFoot");

    const statusEl = document.getElementById("infUxStatus");

    const controlChipEl = document.getElementById("infUxControlChip");

    const actionEl = document.getElementById("infUxAction");

    const valueEl = document.getElementById("infUxValue");

    const watchChipEl = document.getElementById("infUxWatchChip");

    const statusTextEl = document.getElementById("infUxStatusText");

    const warChipEl = document.getElementById("infWarChip");

    const warSummaryEl = document.getElementById("infWarSummary");

    const ordersLeadEl = document.getElementById("infOrdersLead");

    const coreStateEl = document.getElementById("infCoreState");

    const reasonEl = document.getElementById("infUxReason");

    const rewardEl = document.getElementById("infUxReward");

    const loreEl = document.getElementById("infUxLore");

    const intelOwnerEl = document.getElementById("infIntelOwner");

    const intelWatchEl = document.getElementById("infIntelWatch");

    const intelWatchBarEl = document.getElementById("infIntelWatchBar");

    const intelPresenceEl = document.getElementById("infIntelPresence");

    const intelPressureEl = document.getElementById("infIntelPressure");

    const intelPressureBarEl = document.getElementById("infIntelPressureBar");

    const intelPressureHintEl = document.getElementById("infIntelPressureHint");

    const conditionHelpEl = document.getElementById("infConditionHelp");

    const actionHelpEl = document.getElementById("infActionHelp");

    const localYouEl = document.getElementById("infLocalYou");

    const localOpsEl = document.getElementById("infLocalOps");

    const localProgressEl = document.getElementById("infLocalProgress");

    const presenceHintEl = document.getElementById("infPresenceHint");

    const nodeStateHintEl = document.getElementById("infNodeStateHint");

    const donateShellEl = document.getElementById("infDonateShell");

    const patrolHelpEl = document.getElementById("infPatrolHelp");

    const watchHelpEl = document.getElementById("infWatchHelp");

    const donateHelpEl = document.getElementById("infDonateHelp");

    const subEl = document.getElementById("infSub");

    const phantomBadgeEl = document.getElementById("infPhantomHeroBadge");

    const heroFactionNameEl = document.getElementById("infHeroFactionName");

    const heroFactionLeadEl = document.getElementById("infHeroFactionLead");

    const heroFactionStatusEl = document.getElementById("infHeroFactionStatus");

    const heroFactionSigilEl = document.getElementById("infHeroFactionSigil");

    const heroFactionFallbackEl = document.getElementById("infHeroFactionFallback");

    const nodeIdentityCodeEl = document.getElementById("infNodeIdentityCode");



    if (!leaderEl || !contEl || !controlLineEl || !foot || !statusEl || !actionEl || !valueEl || !statusTextEl || !reasonEl || !rewardEl || !loreEl) return;

    const phantomMode = isPhantomNode(nodeId);



    const applyVisualMood = (displayStatus) => {

      const mood = uxMoodTokens(displayStatus);

      if (cardEl) {

        cardEl.style.setProperty("--inf-accent", mood.border);

        cardEl.style.setProperty("--inf-accent-soft", mood.panel);

        cardEl.style.setProperty("--inf-chip-bg", mood.chipBg);

        cardEl.style.setProperty("--inf-chip-border", mood.chipBorder);

        cardEl.dataset.phantomState = String(displayStatus || "CALM").trim().toUpperCase() || "CALM";

      }

      if (heroEl) {

        heroEl.style.background = `radial-gradient(circle at 88% 12%, ${mood.burst}, transparent 44%), radial-gradient(circle at 8% 94%, ${mood.base}, transparent 46%), linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.04))`;

        heroEl.style.border = `1px solid ${mood.border}`;

      }

      if (intelShellEl) {

        intelShellEl.style.background = `linear-gradient(180deg, rgba(255,255,255,.052), ${mood.panel})`;

        intelShellEl.style.border = `1px solid ${mood.border}`;

      }

      if (opsPanelEl) {

        opsPanelEl.style.background = `linear-gradient(180deg, rgba(255,255,255,.062), ${mood.panel})`;

        opsPanelEl.style.border = `1px solid ${mood.border}`;

      }

      if (loreShellEl) {

        loreShellEl.style.background = `linear-gradient(180deg, rgba(255,255,255,.055), ${mood.panel})`;

        loreShellEl.style.border = `1px solid ${mood.border}`;

      }

      if (signalSheetEl) {

        signalSheetEl.style.setProperty("--inf-signal-glow", mood.border);

        signalSheetEl.style.setProperty("--inf-signal-soft", mood.panel);

      }

      if (opsStateEl) {

        opsStateEl.textContent = mood.chipLabel;

        opsStateEl.style.background = mood.chipBg;

        opsStateEl.style.border = `1px solid ${mood.chipBorder}`;

        opsStateEl.style.color = mood.chipFg;

      }

      if (donateShellEl) {

        donateShellEl.style.border = `1px solid ${mood.chipBorder}`;

      }

      if (intelPressureBarEl) intelPressureBarEl.style.background = mood.pressureBar;

      if (heroEl) heroEl.classList.toggle("is-hot", String(displayStatus || "").trim().toUpperCase() === "HOT");

    };



    const setLocalDefaults = () => {

      if (coreStateEl) coreStateEl.textContent = "Stable";

      if (intelOwnerEl) intelOwnerEl.textContent = "-";

      if (intelWatchEl) intelWatchEl.textContent = "No pressure trace";

      if (intelPresenceEl) intelPresenceEl.textContent = "No local pressure yet.";

      if (intelPressureEl) intelPressureEl.textContent = "CALM";

      if (intelWatchBarEl) intelWatchBarEl.style.width = "0%";

      if (intelPressureBarEl) intelPressureBarEl.style.width = "0%";

      if (intelPressureHintEl) intelPressureHintEl.textContent = "Waiting for frontline pressure.";

      if (localYouEl) localYouEl.textContent = "No rank recorded yet.";

      if (localOpsEl) localOpsEl.textContent = "STABILIZE";

      if (localProgressEl) localProgressEl.textContent = "Progress syncing.";

      if (presenceHintEl) presenceHintEl.textContent = "Patrol once to start local trace.";

      if (nodeStateHintEl) nodeStateHintEl.textContent = "Recommended order will update from local pressure.";

      if (patrolHelpEl) patrolHelpEl.textContent = PATROL_ACTION_HINT;

      if (watchHelpEl) watchHelpEl.textContent = "Patrol is live. Move now to support Faction Control here.";

      if (donateHelpEl) donateHelpEl.textContent = DONATE_ACTION_HINT;

      if (ordersLeadEl) ordersLeadEl.textContent = "Recommended order: STABILIZE the relay.";

      if (warSummaryEl) warSummaryEl.textContent = "Faction Control data is syncing.";

      if (warChipEl) warChipEl.textContent = "Live feed";

      if (encounterLineEl) encounterLineEl.textContent = "This node needs support.";

      if (conditionHelpEl) {

        conditionHelpEl.dataset.tipKey = "pressure";

        conditionHelpEl.style.display = "inline-flex";

      }

      if (actionHelpEl) actionHelpEl.style.display = "none";

      if (heroFlavorEl && !phantomMode) heroFlavorEl.textContent = "Frontline conditions update from live faction pressure.";

      if (subEl && phantomMode) subEl.textContent = "PACK vs WASTELAND · HOLD THE LINE";

      if (phantomBadgeEl) {

        phantomBadgeEl.textContent = "STABLE";

        phantomBadgeEl.dataset.state = "CALM";

      }

      if (heroFactionNameEl) heroFactionNameEl.textContent = "Neutral";

      if (heroFactionLeadEl) heroFactionLeadEl.textContent = "No lead recorded.";

      if (heroFactionStatusEl) heroFactionStatusEl.textContent = "Pressure is building.";

      if (heroFactionSigilEl) {

        heroFactionSigilEl.style.display = "none";

        heroFactionSigilEl.removeAttribute("src");

      }

      if (heroFactionFallbackEl) {

        heroFactionFallbackEl.textContent = "--";

        heroFactionFallbackEl.style.display = "grid";

      }

      if (nodeIdentityCodeEl) {

        nodeIdentityCodeEl.style.display = "none";

        nodeIdentityCodeEl.textContent = "";

      }

      paintUxPill(controlChipEl, "Neutral", {

        background: "rgba(255,255,255,.05)",

        border: "1px solid rgba(255,255,255,.12)",

        color: "#d6e7fb",

      }, true);

      paintUxPill(watchChipEl, "", {}, false);

      paintUxPill(valueEl, "", {}, false);

      paintSignalCorePanel({

        nodeId,

        owner: "",

        displayStatus: "CALM",

        displayLabel: "CALM",

        valueLabel: "",

        watchUsed: 0,

        watchMax: 0,

        watchText: "No watch roster",

        viewerPressure: 0,

        leaderPressure: 0,

        controlText: "Faction Control data is syncing.",

      });

      setOrdersCooldownText("Patrol ready now. Free action is back online.", "ready");

      syncPhantomImpact(nodeId);

    };



    if (!info || !Object.keys(info).length) {

      leaderEl.textContent = phantomMode ? "Unknown Control" : "-";

      contEl.style.display = "none";

      contEl.textContent = "";

      controlLineEl.textContent = phantomMode ? "Relay under pressure" : "Faction Control data is syncing.";

      foot.textContent = "";



      paintUxPill(statusEl, phantomMode ? "CALM" : "Secured", uxToneStyles("CALM"));

      statusEl.classList.remove("is-hot");

      applyVisualMood("CALM");

      if (coreStateEl) coreStateEl.textContent = phantomMode ? "CALM" : "Secured";

      paintUxPill(actionEl, "Pressure stable", {

        background: "rgba(255,255,255,.06)",

        border: "1px solid rgba(255,255,255,.12)",

        color: "#e6f0ff",

      });

      statusTextEl.textContent = phantomMode

        ? "The relay is quiet for now, but pressure can swing it fast."

        : "Node secured for now. Keep pressure to prevent a swing.";

      reasonEl.textContent = phantomMode

        ? "Phantom Node is an old relay spine of the Alpha Network."

        : "Control here sets the local frontline tempo.";

      rewardEl.textContent = phantomMode

        ? "Your actions reduce Wasteland pressure and build personal support."

        : "Your actions here feed faction war progress.";

      loreEl.style.display = "none";

      loreEl.textContent = "";

      renderPhantomThreatLayers(nodeId, null);

      setLocalDefaults();

      setPatrolButtonLabel(phantomMode ? "PATROL NODE" : "Patrol");

      return;

    }



    const s = info.scores || {};

    const ux = resolveNodeUx(nodeId, info);

    const owner = normalizeFaction(info?.effectiveOwnerFaction || info?.ownerFaction || info?.owner || "");

    const leaderFaction = normalizeFaction(info?.leader || "");

    const leaderName = leaderFaction ? fmtFaction(leaderFaction) : String(info?.leader || "").trim();

    const leaderValue = Number(info?.leaderValue || 0);

    const controlText = owner ? `${fmtFaction(owner)} controls this node.` : "Neutral node.";

    const valueLabel = uxValueLabel(ux.valueTier, ux.valueMultiplier);

    const displayStatus = String(ux.displayStatus || "").trim().toUpperCase();

    const condition = canonicalNodeCondition(info, ux);

    const paintStatus = phantomMode ? condition : displayStatus;

    applyVisualMood(paintStatus);

    contEl.style.display = "none";

    contEl.textContent = "";



    const viewerFaction = normalizeFaction(_faction || getCanonicalFaction() || info?.youFaction || "");

    const viewerPressure = viewerFaction ? Number(s?.[viewerFaction] || 0) : 0;

    const leaderPressure = Number(info?.leaderValue || 0);



    // Phantom Nodes only: compute opposing pressure from other factions' scores.

    // Do not mirror the current leader score here, or the viewer can appear to fight an equal copy of themself.

    let enemyPressure = 0;

    let isRealEnemyFromScores = false;

    if (phantomMode) {

      try {

        const scoreObj = s || {};

        let maxOther = 0;

        for (const [fkey, val] of Object.entries(scoreObj)) {

          const norm = normalizeFaction ? normalizeFaction(fkey) : null;

          if (norm && norm !== viewerFaction) {

            const n = Number(val || 0);

            if (Number.isFinite(n) && n > maxOther) {

              maxOther = n;

            }

          }

        }

        if (maxOther > 0) {

          enemyPressure = maxOther;

          isRealEnemyFromScores = true;

        }

      } catch (_) {}

    }



    const watchUsed = Number(info?.guardSlotsUsed || info?.watchCount || 0);

    const watchMax = Number(info?.guardSlotsMax || info?.maxDefenders || 0);

    const watchText = watchMax > 0

      ? `${watchUsed}/${watchMax} occupied`

      : (watchUsed > 0 ? `${watchUsed} active` : "No watch roster");

    const watchPct = watchMax > 0 ? Math.max(0, Math.min(100, Math.round((watchUsed / watchMax) * 100))) : 0;

    const ownerLabel = owner ? fmtFaction(owner) : "Neutral";

    const primaryStatus = phantomMode ? phantomFrontlineBadge(info) : uxPrimaryStatusLabel(ux.displayStatus, ux.displayLabel);

    const pressureChipLabel = phantomMode ? phantomFrontlineOrderLabel(info) : recommendedOrderLabel(owner, viewerFaction, condition);

    const pressureNarrative = phantomMode ? phantomFrontlineLine(info) : statusNarrative(condition);

    const yourFactionName = fmtFaction ? fmtFaction(viewerFaction) : (viewerFaction || "Your Pack banner");

    const controlStatus = null;

    const patrolReady = _cdUntilMs <= Date.now();

    const cooldownLeftSec = patrolReady ? 0 : Math.max(0, Math.ceil((_cdUntilMs - Date.now()) / 1000));

    const encounterBadge = phantomMode ? phantomFrontlineBadge(info) : primaryStatus;

    const encounterLine = phantomMode ? phantomFrontlineLine(info) : "";

    const dailyOutcome = (info && typeof info.dailyOutcome === "object") ? info.dailyOutcome : null;

    let encounterBrief = phantomMode ? phantomFrontlineBrief(info, patrolReady, cooldownLeftSec) : "";

    if (phantomMode && dailyOutcome?.recoveryMode) {

      encounterBrief = "Recovery effort active today. The relay needs support.";

    } else if (phantomMode && dailyOutcome?.hasOutcome && String(dailyOutcome.result || "").toLowerCase() === "secured") {

      encounterBrief = "The Pack starts today with momentum.";

    }

    const primaryCtaLabel = phantomMode ? phantomFrontlineCtaLabel() : patrolLabelForAction(ux.actionHint);

    const recommendedAction = phantomMode ? phantomFrontlineOrderLabel(info) : recommendedOrderLabel(owner, viewerFaction, condition);

    const captureTier = Math.max(0, Number(info?.captureTier || 0) || 0);

    const maxPressure = Math.max(

      1,

      Number(s?.rogue_byte || 0),

      Number(s?.echo_wardens || 0),

      Number(s?.pack_burners || 0),

      Number(s?.inner_howl || 0),

      Number(info?.pressureTopValue || 0),

      leaderPressure,

      viewerPressure

    );

    const pressureSignal = Math.max(viewerPressure, leaderPressure, Number(info?.pressureTopValue || 0), Number(info?.heat || 0));

    const pressurePct = pressureSignal > 0 ? Math.max(10, Math.min(100, Math.round((pressureSignal / maxPressure) * 100))) : 0;

    const panelFaction = owner || leaderFaction || viewerFaction;

    const panelFactionLabel = panelFaction ? fmtFaction(panelFaction) : "Neutral";

    const panelSigilUrl = phantomMode ? phantomFactionSigilUrl(panelFaction) : factionSigilUrl(panelFaction);

    const signalId = phantomMode ? phantomNodeSignalId(info) : "";



    leaderEl.textContent = phantomMode

      ? `Pressure ${phantomWastelandPressure(info)}% — ${phantomPackDefenseStatus(info)}`

      : (leaderName ? `${leaderName}${leaderValue > 0 ? ` (${leaderValue})` : ""}` : ownerLabel);

    if (phantomMode) {

      controlLineEl.textContent = encounterLine || encounterBrief;

      if (subEl) subEl.textContent = "PACK vs WASTELAND · HOLD THE LINE";

      if (heroFlavorEl) {

        heroFlavorEl.textContent = "Your faction is your banner. The enemy is the Wasteland. Every action helps hold the line.";

      }

    } else {

      controlLineEl.textContent = controlText;

      if (heroFlavorEl) {

        heroFlavorEl.textContent = (ux.valueText || "This node supports steady faction pressure.");

      }

    }

    if (encounterLineEl) encounterLineEl.textContent = phantomMode ? encounterLine : "";

    if (coreStateEl) coreStateEl.textContent = primaryStatus;

    if (phantomBadgeEl) {

      phantomBadgeEl.textContent = phantomMode ? encounterBadge : primaryStatus;

      phantomBadgeEl.dataset.state = paintStatus;

    }

    if (heroFactionNameEl) heroFactionNameEl.textContent = panelFactionLabel;

    if (heroFactionLeadEl) {

      heroFactionLeadEl.textContent = phantomMode

        ? (yourFactionName + " banner on the line.")

        : (owner

        ? (ownerLabel + " controls the relay.")

        : (leaderName ? (leaderName + " has the strongest pressure.") : "No lead recorded."));

    }

    if (heroFactionStatusEl) heroFactionStatusEl.textContent = uxStatusText(ux.displayStatus);

    if (heroFactionSigilEl) {

      if (panelSigilUrl) {

        heroFactionSigilEl.src = panelSigilUrl;

        heroFactionSigilEl.style.display = "block";

      } else {

        heroFactionSigilEl.style.display = "none";

        heroFactionSigilEl.removeAttribute("src");

      }

    }

    if (heroFactionFallbackEl) {

      heroFactionFallbackEl.textContent = panelFaction ? factionCode(panelFaction) : "--";

      heroFactionFallbackEl.style.display = panelSigilUrl ? "none" : "grid";

    }

    if (nodeIdentityCodeEl) {

      if (signalId) {

        nodeIdentityCodeEl.textContent = "Signal " + signalId;

        nodeIdentityCodeEl.style.display = "block";

      } else {

        nodeIdentityCodeEl.textContent = "";

        nodeIdentityCodeEl.style.display = "none";

      }

    }



    const clashEl = document.getElementById("infClashMeter");

    if (clashEl) {

      if (phantomMode) {

        const wp = phantomWastelandPressure(info);

        const packPct = Math.max(0, Math.min(100, 100 - wp));

        const packStatus = phantomPackDefenseStatus(info);

        const packBadge = phantomFrontlineBadge(info);

        const packLine = phantomFrontlineLine(info);

        clashEl.style.display = "block";

        clashEl.innerHTML = `

          <div class="inf-pressure-head">

            <span>Wasteland Pressure</span>

            <span class="inf-pressure-state">${esc(packBadge)}</span>

          </div>

          <div class="inf-pressure-sides">

            <div class="inf-pressure-side is-enemy"><span class="label">Wasteland</span><span class="value">${wp}%</span></div>

            <div class="inf-pressure-side is-friendly"><span class="label">Pack Defense</span><span class="value">${packPct}%</span></div>

          </div>

          <div class="inf-pressure-track">

            <div class="inf-pressure-fill is-enemy" style="width:${wp}%;"></div>

            <div class="inf-pressure-fill is-friendly" style="width:${packPct}%;"></div>

            <div class="inf-pressure-core"><span>${esc(packStatus)}</span></div>

          </div>

          <div class="inf-pressure-foot">Pressure: ${wp}% — ${esc(packStatus)}. ${esc(packLine)}</div>

        `;

      } else {

        clashEl.style.display = "none";

        clashEl.innerHTML = "";

      }

    }

    paintUxPill(statusEl, phantomMode ? encounterBadge : primaryStatus, uxToneStyles(paintStatus));

    statusEl.classList.toggle("is-hot", (phantomMode ? encounterBadge : primaryStatus) === "HOT");

    paintUxPill(controlChipEl, owner ? ownerLabel : "Neutral", {

      background: owner ? "rgba(120,255,220,.12)" : "rgba(255,255,255,.05)",

      border: owner ? "1px solid rgba(120,255,220,.24)" : "1px solid rgba(255,255,255,.12)",

      color: owner ? "#d9fff2" : "#d6e7fb",

    }, true);

    paintUxPill(actionEl, pressureChipLabel, {

      background: "rgba(255,255,255,.06)",

      border: "1px solid rgba(255,255,255,.12)",

      color: "#e6f0ff",

    });

    paintUxPill(valueEl, captureTier > 0 ? `Tier ${captureTier}` : "", {

      background: "rgba(255,210,120,.12)",

      border: "1px solid rgba(255,210,120,.18)",

      color: "#ffe9b8",

    }, captureTier > 0);

    paintUxPill(watchChipEl, "", {}, false);



    statusTextEl.textContent = pressureNarrative;

    if (heroFlavorEl && !phantomMode) {

      heroFlavorEl.textContent = (ux.valueText || "This node supports steady faction pressure.");

    }

    if (warChipEl) {

      warChipEl.textContent = primaryStatus;

      warChipEl.style.background = uxToneStyles(paintStatus).background;

      warChipEl.style.border = uxToneStyles(paintStatus).border;

      warChipEl.style.color = uxToneStyles(paintStatus).color;

    }

    if (conditionHelpEl) {

      conditionHelpEl.dataset.tipKey = condition === "CALM" ? "pressure" : String(condition || "pressure").toLowerCase();

      conditionHelpEl.style.display = "inline-flex";

    }

    if (actionHelpEl) {

      if (recommendedAction === "PUSH") {

        actionHelpEl.dataset.tipKey = "push";

        actionHelpEl.style.display = "inline-flex";

      } else if (recommendedAction === "DEFEND") {

        actionHelpEl.dataset.tipKey = "defend";

        actionHelpEl.style.display = "inline-flex";

      } else {

        actionHelpEl.style.display = "none";

      }

    }

    if (ordersLeadEl) {

      ordersLeadEl.textContent = phantomMode

        ? encounterBrief

        : `Recommended order: ${recommendedAction} the relay.`;

    }

    if (warSummaryEl) {

      warSummaryEl.textContent = owner

        ? `${ownerLabel} holds the node. ${pressureNarrative} ${recommendedAction === "DEFEND" ? "Protect control now." : recommendedAction === "PUSH" ? "Push now to contest control." : "Stabilize the line and keep tempo."}`

        : `No faction owns the node. ${pressureNarrative} ${recommendedAction === "PUSH" ? "Push first to establish pressure." : "Stabilize the line before it swings."}`;

    }

    reasonEl.textContent = phantomMode

      ? "Phantom Node is under Wasteland pressure. Patrol and supplies help the Pack keep the relay alive."

      : (ux.reasonText || "Control here shapes the local rivalry line.");

    rewardEl.textContent = phantomMode

      ? "Your actions reduce Wasteland pressure and build personal support."

      : (ux.rewardText || "Contribution here converts into faction war progress.");



    const loreLines = resolveNodeLoreLines(nodeId, info);

    if (loreLines.length && !phantomMode) {

      loreEl.style.display = "block";

      loreEl.innerHTML = loreLines.map((line) => `<div class="inf-intel-line">${esc(line)}</div>`).join("");

    } else if (loreLines.length && phantomMode) {

      loreEl.style.display = "block";

      loreEl.innerHTML = loreLines.slice(0, 1).map((line) => `<div class="inf-intel-line">${esc(line)}</div>`).join("");

    } else {

      loreEl.style.display = "none";

      loreEl.textContent = "";

    }



    if (intelOwnerEl) intelOwnerEl.textContent = owner ? fmtFaction(owner) : "Neutral";

    if (intelWatchEl) {

      if (phantomMode) {

        const wpIntel = phantomWastelandPressure(info);

        intelWatchEl.textContent = `Wasteland pressure ${wpIntel}% — ${phantomPackDefenseStatus(info)}`;

      } else {

        // non-Phantom: original behavior unchanged

        if (viewerPressure > 0 && leaderPressure > 0) intelWatchEl.textContent = `Faction pressure — ${viewerPressure} vs ${leaderPressure}`;

        else if (leaderPressure > 0) intelWatchEl.textContent = `Enemy pressure ${leaderPressure}`;

        else if (viewerPressure > 0) intelWatchEl.textContent = `Your pressure ${viewerPressure}`;

        else intelWatchEl.textContent = "Quiet pressure band";

      }

    }

    if (intelWatchBarEl) {

      intelWatchBarEl.style.width = phantomMode ? `${phantomWastelandPressure(info)}%` : `${pressurePct}%`;

      if (condition === "CONTESTED") {

        intelWatchBarEl.style.background = "repeating-linear-gradient(90deg,rgba(255,138,120,.95) 0 8px, rgba(255,92,92,.86) 8px 12px)";

      } else if (condition === "HOT") {

        intelWatchBarEl.style.background = "repeating-linear-gradient(90deg,rgba(255,206,148,.92) 0 8px, rgba(255,140,112,.82) 8px 12px)";

      } else if (condition === "FORTIFIED") {

        intelWatchBarEl.style.background = "repeating-linear-gradient(90deg,rgba(146,222,255,.92) 0 8px, rgba(88,164,255,.82) 8px 12px)";

      } else {

        intelWatchBarEl.style.background = "repeating-linear-gradient(90deg,rgba(170,214,255,.9) 0 8px, rgba(120,178,255,.8) 8px 12px)";

      }

    }



    const my = (_weekly && typeof _weekly.my === "object") ? _weekly.my : null;

    if (localYouEl) {

      if (phantomMode && my) {

        localYouEl.textContent = `Your Support ${Number(my.score || 0)}`;

      } else if (my) {

        const rankTxt = my.factionRank ? `Faction #${my.factionRank}` : (my.overallRank ? `Global #${my.overallRank}` : "Rank pending");

        localYouEl.textContent = `${rankTxt} | Score ${Number(my.score || 0)}`;

      } else if (phantomMode) {

        localYouEl.textContent = "Patrol or donate to register your support.";

      } else if (viewerPressure > 0) {

        localYouEl.textContent = "Position recording. Keep pressure active.";

      } else {

        localYouEl.textContent = "No rank recorded yet.";

      }

    }

    if (intelPresenceEl) {

      if (viewerPressure > 0) intelPresenceEl.textContent = `Local pressure ${viewerPressure}`;

      else intelPresenceEl.textContent = "No local pressure yet.";

    }

    if (localProgressEl) {

      const req = (_weekly && typeof _weekly.requirements === "object") ? _weekly.requirements : null;

      if (my && req) {

        const scoreNow = Number(my.score || 0);

        const daysNow = Number(my.activeDays || 0);

        const scoreReq = Math.max(0, Number(req.minScore || 0));

        const daysReq = Math.max(0, Number(req.minActiveDays || 0));

        const scoreOk = scoreReq <= 0 || scoreNow >= scoreReq;

        const daysOk = daysReq <= 0 || daysNow >= daysReq;

        const state = (scoreOk && daysOk) ? "Ready" : "Building";

        const scoreTxt = scoreReq > 0 ? `${scoreNow}/${scoreReq}` : `${scoreNow}`;

        const daysTxt = daysReq > 0 ? `${daysNow}/${daysReq}` : `${daysNow}`;

        localProgressEl.textContent = `${state} | Days ${daysTxt} | Score ${scoreTxt}`;

      } else if (my) {

        localProgressEl.textContent = `Days ${Number(my.activeDays || 0)} active this cycle`;

      } else {

        localProgressEl.textContent = "Progress syncing.";

      }

    }

    if (presenceHintEl) {

      if (viewerPressure > 0) presenceHintEl.textContent = "You are on-grid. Keep patrol or donate to hold tempo.";

      else presenceHintEl.textContent = "Patrol or donate to register local participation.";

    }

    if (intelPressureEl) {

      intelPressureEl.textContent = condition;

      if (intelPressureBarEl) {

        intelPressureBarEl.style.width = `${pressurePct}%`;

      }

      if (intelPressureHintEl) {

        const extra = phantomMode ? explainNodeCondition(condition) : "";

        intelPressureHintEl.textContent = extra ? `${pressureNarrative} ${extra}` : pressureNarrative;

      }

    }

    if (localOpsEl) {

      // Recommended Action — direct player language

      if (phantomMode && controlStatus) {

        localOpsEl.textContent = controlStatus.headline.includes("HOLDING") ? "DEFEND" : (controlStatus.headline.includes("TIED") ? "DEFEND" : "PUSH");

      } else {

        localOpsEl.textContent = recommendedAction;

      }

    }

    if (nodeStateHintEl) {

      nodeStateHintEl.textContent = recommendedAction === "DEFEND"

        ? "Your faction has something to protect here."

        : recommendedAction === "PUSH"

          ? "Another faction holds control. Your actions help contest it."

          : "Keep the relay stable and prevent a fast swing.";

    }

    paintSignalCorePanel({

      nodeId,

      owner,

      displayStatus: paintStatus,

      displayLabel: primaryStatus,

      valueLabel,

      watchUsed,

      watchMax,

      watchText,

      viewerPressure,

      leaderPressure,

      controlText: warSummaryEl?.textContent || controlText,

    });



    if (patrolHelpEl) patrolHelpEl.textContent = PATROL_ACTION_HINT;

    if (watchHelpEl) {

      watchHelpEl.textContent = phantomMode

        ? `${encounterBrief} Patrol and supplies both reinforce the war effort.`

        : `${recommendedAction} now. Patrol supports Faction Control and your faction support.`;

    }

    if (donateHelpEl) donateHelpEl.textContent = DONATE_ACTION_HINT;



    if (_cdUntilMs > Date.now()) {

      setOrdersCooldownText(`Patrol ready in ${fmtCooldownHint(Math.ceil((_cdUntilMs - Date.now()) / 1000))}.`, "cooldown");

    } else {

      setOrdersCooldownText("Patrol ready now. Free action is back online.", "ready");

    }



    if (opsStateEl) {

      opsStateEl.textContent = recommendedAction;

      opsStateEl.style.background = recommendedAction === "DEFEND"

        ? "rgba(110,255,170,.16)"

        : recommendedAction === "PUSH"

          ? "rgba(255,182,116,.16)"

          : "rgba(145,206,255,.14)";

      opsStateEl.style.border = recommendedAction === "DEFEND"

        ? "1px solid rgba(110,255,170,.28)"

        : recommendedAction === "PUSH"

          ? "1px solid rgba(255,182,116,.28)"

          : "1px solid rgba(145,206,255,.26)";

      opsStateEl.style.color = recommendedAction === "DEFEND"

        ? "#c7ffd9"

        : recommendedAction === "PUSH"

          ? "#ffe0b6"

          : "#d9eeff";

    }



    setPatrolButtonLabel(phantomMode ? primaryCtaLabel : patrolLabelForAction(ux.actionHint));

    foot.textContent = phantomMode

      ? `Wasteland pressure ${phantomWastelandPressure(info)}% — ${phantomPackDefenseStatus(info)}. Hold the line.`

      : `Hourly pressure - RB ${s.rogue_byte || 0} | EW ${s.echo_wardens || 0} | PB ${s.pack_burners || 0} | IH ${s.inner_howl || 0}`;

    renderPhantomThreatLayers(nodeId, info);

    syncPhantomImpact(nodeId);

  }



  async function doConfront(nodeId) {

    if (!_apiPost) return;

    const safeNodeId = normalizeNodeId(nodeId) || String(nodeId || "");

    if (!isPhantomNode(safeNodeId)) return;



    const btn = _qs("infConfrontBtn");

    if (btn) btn.disabled = true;



    try {

      const faction = await ensureFaction();

      if (!faction) { setStatus("Faction required.", "err"); return toast("Faction required."); }



      const r = await _apiPost("/webapp/influence/action", {

        nodeId: safeNodeId,

        action: "confront_maw",

        faction,

        run_id: rid("confront"),

      });



      if (!r?.ok) {

        const msg = explainFail(r);

        setStatus(msg, "err");

        toast(msg);

        applyLeadersFromResponse(r, safeNodeId);

        return;

      }



      clearStatus();

      toast(`Confrontation complete · Pressure ${r.wastelandPressureBefore}% → ${r.wastelandPressureAfter}%`);

      setConfrontActionResult(r);

      triggerActionMicroReaction();

      applyLeadersFromResponse(r, safeNodeId);

      window.setTimeout(() => { void refreshWeekly(safeNodeId, { force: true, reason: "action_followup" }); }, 120);

    } finally {

      if (btn && btn.isConnected) btn.disabled = false;

    }

  }





  async function doPatrol(nodeId) {

    if (!_apiPost) return;



    const btn = document.getElementById("infPatrolBtn");

    if (btn) btn.disabled = true;



    try {

      const faction = await ensureFaction();

      if (!faction) { setStatus("Faction required.", "err"); return toast("Faction required."); }



      const r = await _apiPost("/webapp/influence/action", {

        nodeId,

        action: "patrol",

        faction,

        run_id: rid("patrol"),

      });



      if (!r?.ok) {

        const msg = explainFail(r);

        setStatus(msg, "err");

        toast(msg);

        if (String(r?.reason || "") === "COOLDOWN") startCooldown(r.cooldownLeftSec);

        applyLeadersFromResponse(r, nodeId);

        return;

      }



      clearStatus();

      const hq = (r?.hqMult != null) ? ` (HQ x${Number(r.hqMult).toFixed(2)})` : "";

      toast(isPhantomNode(nodeId) ? `Pack impact +${r.gain}${hq}` : `+${r.gain} influence${hq}`);

      markRecentNodeAction(nodeId, "patrol");

      setActionResult("patrol", {

        gain: r.gain,

        wastelandPressureBefore: r.wastelandPressureBefore,

        wastelandPressureAfter: r.wastelandPressureAfter,

        pressureDelta: r.pressureDelta,

        playerImpact: r.playerImpact,

        frontlineImpact: r.frontlineImpact,

        packDefenseStatusBefore: r.packDefenseStatusBefore,

        packDefenseStatusAfter: r.packDefenseStatusAfter,

        frontlineCopy: r.frontlineCopy,

        frontlineReaction: r.frontlineReaction,

        statusBefore: r.statusBefore,

        statusAfter: r.statusAfter,

        statusChanged: r.statusChanged,

        weeklyPoints: r.weeklyPoints,

        contractContributionChanged: r.contractContributionChanged,

        contractContributionDelta: r.contractContributionDelta,

        archiveKeyEligible: normalizeNodeId(nodeId) === "phantom_nodes",

        archiveKeyGained: r.archiveKeyGained,

        archiveKeyGranted: r.archiveKeyGranted,

        archiveKeyMessage: r.archiveKeyMessage,

        archiveKeys: r.archiveKeys,

        archiveKeysLeft: r.archiveKeysLeft,

        archiveKeysEarnedToday: r.archiveKeysEarnedToday,

        archiveKeysSpentToday: r.archiveKeysSpentToday,

        archiveKeyCapReached: r.archiveKeyCapReached,

        archiveKeyReason: r.archiveKeyReason,

      });

      if (Number(r?.cooldownLeftSec || 0) > 0) startCooldown(r.cooldownLeftSec);

      triggerActionMicroReaction();



      applyLeadersFromResponse(r, nodeId);

      window.setTimeout(() => { void refreshWeekly(nodeId, { force: true, reason: "action_followup" }); }, 120);

    } finally {

      // if cooldown active, keep disabled

      if (btn) {

        if (_cdUntilMs > Date.now()) {

          // will be re-rendered by cooldown tick

        } else {

          btn.disabled = false;

          setPatrolButtonLabel(currentPatrolLabel());

        }

      }

    }

  }



  async function doDonate(nodeId) {

    if (!_apiPost) return;



    const asset = (document.getElementById("infAsset")?.value || "scrap").trim();

    const amount = parseInt(document.getElementById("infAmount")?.value || "0", 10) || 0;

    if (amount <= 0) { setStatus("Bad amount", "err"); return toast("Bad amount"); }



    const btn = document.getElementById("infDonateBtn");

    if (btn) btn.disabled = true;



    try {

      const faction = await ensureFaction();

      if (!faction) { setStatus("Faction required.", "err"); return toast("Faction required."); }



      const r = await _apiPost("/webapp/influence/action", {

        nodeId,

        action: "donate",

        faction,

        asset,

        amount,

        run_id: rid("donate"),

      });



      if (!r?.ok) {

        const msg = explainFail(r, { asset, amount });

        setStatus(msg, "err");

        toast(msg);

        if (String(r?.reason || "") === "COOLDOWN") startCooldown(r.cooldownLeftSec);

        applyLeadersFromResponse(r, nodeId);

        return;

      }



      clearStatus();

      const hq = (r?.hqMult != null) ? ` (HQ x${Number(r.hqMult).toFixed(2)})` : "";

      const phantomDonateToast = isPhantomNode(nodeId);

      toast(phantomDonateToast && Number.isFinite(Number(r?.wastelandPressureAfter))

        ? `Supplies sent · Pressure ${r.wastelandPressureBefore}% → ${r.wastelandPressureAfter}%`

        : `Donated ${amount} ${asset} -> +${r.gain} influence${hq}`);

      markRecentNodeAction(nodeId, "donate");

      setActionResult("donate", {

        gain: r.gain,

        wastelandPressureBefore: r.wastelandPressureBefore,

        wastelandPressureAfter: r.wastelandPressureAfter,

        pressureDelta: r.pressureDelta,

        playerImpact: r.playerImpact,

        frontlineImpact: r.frontlineImpact,

        packDefenseStatusBefore: r.packDefenseStatusBefore,

        packDefenseStatusAfter: r.packDefenseStatusAfter,

        frontlineCopy: r.frontlineCopy,

        frontlineReaction: r.frontlineReaction,

        statusBefore: r.statusBefore,

        statusAfter: r.statusAfter,

        statusChanged: r.statusChanged,

        spent: r.spent,

        asset: r.asset || asset,

        refunded: r.refunded,

        weeklyPoints: r.weeklyPoints,

        contractContributionChanged: r.contractContributionChanged,

        contractContributionDelta: r.contractContributionDelta,

        archiveKeyEligible: normalizeNodeId(nodeId) === "phantom_nodes",

        archiveKeyGained: r.archiveKeyGained,

        archiveKeyGranted: r.archiveKeyGranted,

        archiveKeyMessage: r.archiveKeyMessage,

        archiveKeys: r.archiveKeys,

        archiveKeysLeft: r.archiveKeysLeft,

        archiveKeysEarnedToday: r.archiveKeysEarnedToday,

        archiveKeysSpentToday: r.archiveKeysSpentToday,

        archiveKeyCapReached: r.archiveKeyCapReached,

        archiveKeyReason: r.archiveKeyReason,

      });

      triggerActionMicroReaction();



      applyLeadersFromResponse(r, nodeId);

      window.setTimeout(() => { void refreshWeekly(nodeId, { force: true, reason: "action_followup" }); }, 120);

    } finally {

      if (btn) btn.disabled = false;

    }

  }



  // -------------------------

  // Public API

  // -------------------------

  Influence.init = function ({ apiPost, tg, dbg }) {

    _apiPost = apiPost;

    _tg = tg || window.Telegram?.WebApp || null;

    _dbg = !!dbg;



    if (_dbg) console.log("[INFLUENCE] loaded v=", window.WEBAPP_VER, new Date().toISOString());



    if (_inited) {

      syncFactionFromFrontendState();

      return;

    }

    _inited = true;



    ensureModal();

    refreshLeaders({ applyToMap: true, reason: "init" });

    syncFactionFromFrontendState();

  };



  Influence.open = open;

  Influence.close = close;

  Influence.refreshLeaders = refreshLeaders;



  // for HQ / other modules

  Influence.setFaction = setFaction;

  Influence.clearFactionCache = clearFactionCache;

  Influence.ensureFaction = ensureFaction;

  Influence.getFaction = () => getCanonicalFaction() || _faction;



  window.Influence = Influence;

})();











