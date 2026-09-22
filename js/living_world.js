// Alpha Husky - Living World P0: ambient, read-only Hub presence.
(function (global) {
  "use strict";

  const ROOT_ID = "hubLivingWorldRoot";
  const STYLE_ID = "ah-living-world-p0-css";
  const CACHE_TTL_MS = 30000;
  const MAX_ROWS = 3;
  const MAX_EVENT_AGE_SEC = 7 * 24 * 60 * 60;
  const PLAYER_EVENT_TYPES = new Set([
    "fortress_cleared",
    "rare_drop",
    "mission_completed",
    "bloodmoon_wave_cleared",
    "legendary_path_step",
    "legendary_path_step_completed",
    "burned_archive_breach_confirmed",
  ]);
  const WORLD_EVENT_TYPES = new Set([
    "node_captured",
    "siege_won",
    "bloodmoon_tower_finished",
    "faction_hq_upgrade",
  ]);
  const RARE_RARITIES = new Set(["rare", "epic", "legendary", "mythic", "apex"]);
  const MAJOR_MISSION_TIERS = new Set(["hard", "very_hard", "veteran", "elite", "epic", "mythic", "apex"]);
  const FACTION_LABELS = Object.freeze({
    rogue_byte: "ROGUE BYTE",
    echo_wardens: "ECHO WARDENS",
    pack_burners: "PACK BURNERS",
    inner_howl: "INNER HOWL",
  });

  let cache = null;
  let cacheAt = 0;
  let inFlight = null;

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function escapeHtml(value) {
    return text(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function integer(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
  }

  function validCallsign(value) {
    const name = text(value);
    if (!name || /^(unknown|someone|howler)$/i.test(name)) return "";
    if (/^player\s+[a-z0-9_-]{4}$/i.test(name)) return "";
    return name.slice(0, 40);
  }

  function safeProfileUid(value) {
    const uid = text(value);
    return /^\d{1,32}$/.test(uid) && uid !== "0" ? uid : "";
  }

  function factionLabel(row) {
    const key = text(row?.faction).toLowerCase().replace(/[\s-]+/g, "_");
    return text(row?.factionCode).toUpperCase().slice(0, 4) || FACTION_LABELS[key] || "";
  }

  function isHighSignal(row) {
    const type = text(row?.type).toLowerCase();
    if (WORLD_EVENT_TYPES.has(type)) return true;
    if (!PLAYER_EVENT_TYPES.has(type) || !validCallsign(row?.name)) return false;
    if (type === "rare_drop") return RARE_RARITIES.has(text(row?.rarity).toLowerCase());
    if (type === "mission_completed") {
      const tier = text(row?.tier || row?.difficulty).toLowerCase().replace(/[\s-]+/g, "_");
      const mission = text(row?.missionName).toLowerCase();
      return MAJOR_MISSION_TIERS.has(tier) || /broken signal|moon lab|fortress|blood.?moon/.test(mission);
    }
    return true;
  }

  function compactAge(ts, nowSec = Math.floor(Date.now() / 1000)) {
    const stamp = integer(ts, 0);
    if (stamp <= 0) return "";
    const age = Math.max(0, integer(nowSec, 0) - stamp);
    if (age < 60) return "Just now";
    if (age < 3600) return `${Math.max(1, Math.floor(age / 60))}m ago`;
    if (age < 86400) return `${Math.floor(age / 3600)}h ago`;
    if (age < 172800) return "Yesterday";
    if (age <= MAX_EVENT_AGE_SEC) return "This week";
    return "";
  }

  function actionText(row, callsign) {
    let action = text(row?.text);
    if (!action) return "";
    if (callsign && action.toLowerCase().startsWith(callsign.toLowerCase() + " ")) {
      action = action.slice(callsign.length).trim();
      if (action) action = action.charAt(0).toUpperCase() + action.slice(1);
    }
    return action.slice(0, 180);
  }

  function normalizeEvent(row, nowSec) {
    if (!row || typeof row !== "object" || !isHighSignal(row)) return null;
    const ts = integer(row.ts, 0);
    const age = compactAge(ts, nowSec);
    if (!ts || !age || ts > nowSec + 300) return null;
    const callsign = validCallsign(row.name);
    const type = text(row.type).toLowerCase();
    if (PLAYER_EVENT_TYPES.has(type) && !callsign) return null;
    const action = actionText(row, callsign);
    if (!action) return null;
    return {
      type,
      callsign,
      faction: factionLabel(row),
      action,
      age,
      ts,
      profileUid: callsign ? safeProfileUid(row.uid) : "",
    };
  }

  function normalizePayload(raw, nowSec = Math.floor(Date.now() / 1000)) {
    const data = raw?.data?.liveEchoes ? raw.data : raw;
    if (!data || typeof data !== "object" || !Array.isArray(data.liveEchoes)) return null;
    const rows = [];
    const seen = new Set();
    for (const rawRow of data.liveEchoes) {
      const row = normalizeEvent(rawRow, nowSec);
      if (!row) continue;
      const fingerprint = `${row.type}|${row.callsign.toLowerCase()}|${row.action.toLowerCase()}`;
      const actorType = `${row.type}|${row.callsign.toLowerCase() || row.faction.toLowerCase()}`;
      if (seen.has(fingerprint) || seen.has(actorType)) continue;
      seen.add(fingerprint);
      seen.add(actorType);
      rows.push(row);
      if (rows.length >= MAX_ROWS) break;
    }
    const summary = data.factionPulse?.summary;
    return {
      rows,
      worldStatus: summary && typeof summary === "object" ? {
        hotNodes: Math.max(0, integer(summary.hotNodes, 0)),
        activeSieges: Math.max(0, integer(summary.activeSieges, 0)),
        controlledNodes: Math.max(0, integer(summary.controlledNodes, 0)),
      } : null,
    };
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    const goal = document.getElementById("hubGoalRoot");
    if (!goal?.parentNode) return null;
    root = document.createElement("div");
    root.id = ROOT_ID;
    goal.insertAdjacentElement("afterend", root);
    return root;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{padding:10px 14px 0;min-width:0}
      .lw-card{overflow:hidden;border:1px solid rgba(125,211,252,.2);border-radius:16px;background:linear-gradient(145deg,rgba(13,23,34,.88),rgba(8,13,21,.72));box-shadow:inset 0 1px rgba(255,255,255,.04);color:#f3f8ff}
      .lw-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 13px 9px}
      .lw-kicker{min-width:0;font:900 10px/1.2 ui-sans-serif,system-ui,sans-serif;letter-spacing:.17em;color:rgba(125,211,252,.88)}
      .lw-state{font:750 9px/1.2 ui-sans-serif,system-ui,sans-serif;letter-spacing:.1em;color:rgba(210,225,241,.5)}
      .lw-list{border-top:1px solid rgba(255,255,255,.055)}
      .lw-row{width:100%;min-width:0;min-height:58px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 10px;align-items:center;padding:10px 13px;border:0;border-bottom:1px solid rgba(255,255,255,.055);background:transparent;color:inherit;text-align:left;font:inherit}
      button.lw-row{cursor:pointer;-webkit-tap-highlight-color:transparent}
      button.lw-row:active{background:rgba(125,211,252,.07)}
      button.lw-row:focus-visible,.lw-oracle:focus-visible{outline:2px solid rgba(125,211,252,.78);outline-offset:-2px}
      .lw-main{min-width:0}
      .lw-identity{display:flex;align-items:center;gap:7px;min-width:0;margin-bottom:3px}
      .lw-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:850 11px/1.2 ui-sans-serif,system-ui,sans-serif;letter-spacing:.045em;color:#f4f8fd}
      .lw-faction{flex:0 0 auto;max-width:92px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:2px 5px;border:1px solid rgba(125,211,252,.16);border-radius:999px;font:800 8px/1.1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;color:rgba(151,218,248,.78)}
      .lw-action{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:550 11px/1.35 ui-sans-serif,system-ui,sans-serif;color:rgba(226,235,246,.73)}
      .lw-age{align-self:center;white-space:nowrap;font:750 9px/1.2 ui-sans-serif,system-ui,sans-serif;color:rgba(207,221,238,.48)}
      .lw-chevron{margin-left:4px;color:rgba(125,211,252,.62)}
      .lw-status{padding:8px 13px;border-bottom:1px solid rgba(255,255,255,.055);font:700 10px/1.35 ui-sans-serif,system-ui,sans-serif;color:rgba(189,214,232,.68)}
      .lw-empty{padding:12px 13px 13px;border-top:1px solid rgba(255,255,255,.055)}
      .lw-empty-title{font:800 11px/1.3 ui-sans-serif,system-ui,sans-serif;color:rgba(240,246,252,.84)}
      .lw-empty-copy{margin-top:4px;font:500 10px/1.45 ui-sans-serif,system-ui,sans-serif;color:rgba(198,211,226,.55)}
      .lw-foot{display:flex;justify-content:flex-end;padding:8px 10px}
      .lw-oracle{min-height:38px;padding:0 11px;border:1px solid rgba(125,211,252,.22);border-radius:10px;background:rgba(46,115,155,.16);color:rgba(190,231,251,.9);font:850 9px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.12em;cursor:pointer}
      @media (max-width:360px){.lw-row{padding-left:11px;padding-right:11px}.lw-faction{max-width:68px}.lw-action{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}}
    `;
    document.head.appendChild(style);
  }

  function statusLine(status) {
    if (!status) return "";
    const parts = [];
    if (status.hotNodes > 0) parts.push(`${status.hotNodes} hot sector${status.hotNodes === 1 ? "" : "s"}`);
    if (status.activeSieges > 0) parts.push(`${status.activeSieges} active siege${status.activeSieges === 1 ? "" : "s"}`);
    if (status.controlledNodes > 0) parts.push(`${status.controlledNodes} faction-held node${status.controlledNodes === 1 ? "" : "s"}`);
    return parts.slice(0, 3).join(" · ");
  }

  function shell(body, stateLabel = "CONFIRMED") {
    return `<section class="lw-card" aria-label="Network activity"><div class="lw-head"><div class="lw-kicker">NETWORK ACTIVITY</div><div class="lw-state">${escapeHtml(stateLabel)}</div></div>${body}<div class="lw-foot"><button class="lw-oracle" type="button" data-lw-oracle>OPEN ORACLE</button></div></section>`;
  }

  function renderLoading() {
    const root = ensureRoot();
    if (!root) return;
    root.innerHTML = shell('<div class="lw-empty"><div class="lw-empty-title">Reading confirmed signals...</div></div>', "SYNCING");
    bindActions(root, []);
  }

  function renderUnavailable() {
    const root = ensureRoot();
    if (!root) return;
    root.innerHTML = shell('<div class="lw-empty"><div class="lw-empty-title">Network signal unavailable.</div><div class="lw-empty-copy">Open Oracle for the latest confirmed record.</div></div>', "UNAVAILABLE");
    bindActions(root, []);
  }

  function renderState(state) {
    const root = ensureRoot();
    if (!root) return;
    const rows = Array.isArray(state?.rows) ? state.rows.slice(0, MAX_ROWS) : [];
    const list = rows.length ? `<div class="lw-list">${rows.map((row, index) => {
      const tag = row.profileUid ? "button" : "article";
      const attrs = row.profileUid ? `type="button" data-lw-row="${index}" aria-label="Open ${escapeHtml(row.callsign)} public profile"` : "";
      const identity = row.callsign || "WORLD SIGNAL";
      return `<${tag} class="lw-row" ${attrs}><div class="lw-main"><div class="lw-identity"><span class="lw-name">${escapeHtml(identity)}</span>${row.faction ? `<span class="lw-faction">${escapeHtml(row.faction)}</span>` : ""}</div><div class="lw-action">${escapeHtml(row.action)}</div></div><div class="lw-age">${escapeHtml(row.age)}${row.profileUid ? '<span class="lw-chevron" aria-hidden="true">›</span>' : ""}</div></${tag}>`;
    }).join("")}</div>` : '<div class="lw-empty"><div class="lw-empty-title">No new Pack signals yet.</div><div class="lw-empty-copy">The Oracle retains the latest confirmed record of the world.</div></div>';
    const status = statusLine(state?.worldStatus);
    root.innerHTML = shell(`${list}${status ? `<div class="lw-status">WORLD STATUS · ${escapeHtml(status)}</div>` : ""}`);
    bindActions(root, rows);
  }

  function bindActions(root, rows) {
    root.querySelector("[data-lw-oracle]")?.addEventListener("click", () => { void openOracle(); });
    root.querySelectorAll("[data-lw-row]").forEach((button) => {
      button.addEventListener("click", () => {
        const row = rows[integer(button.getAttribute("data-lw-row"), -1)];
        if (row?.profileUid) void openProfile(row.profileUid);
      });
    });
  }

  async function openProfile(uid) {
    const target = safeProfileUid(uid);
    if (!target || typeof global.PlayerProfile?.open !== "function") return false;
    try {
      const opened = !!(await global.PlayerProfile.open(target, { source: "living_world" }));
      if (opened) global.HomeNav?.closeAll?.();
      return opened;
    } catch (_) {
      return false;
    }
  }

  async function openOracle() {
    try {
      if (typeof global.ensureOracleLoaded === "function") {
        await global.ensureOracleLoaded(global.apiPost || global.S?.apiPost, undefined, !!global.DBG);
      }
      if (typeof global.Oracle?.open !== "function") return false;
      global.HomeNav?.closeAll?.();
      global.Oracle.open();
      return true;
    } catch (_) {
      return false;
    }
  }

  function getApiPost() {
    const apiPost = global.apiPost || global.S?.apiPost || global.AH?.apiPost;
    return typeof apiPost === "function" ? apiPost : null;
  }

  async function refresh(options = {}) {
    ensureStyles();
    ensureRoot();
    const now = Date.now();
    if (!options.force && cache && now - cacheAt < CACHE_TTL_MS) {
      renderState(cache);
      return cache;
    }
    if (inFlight) return inFlight;
    const apiPost = getApiPost();
    if (!apiPost) {
      renderUnavailable();
      return null;
    }
    renderLoading();
    inFlight = (async () => {
      try {
        const raw = await apiPost("/webapp/oracle/state", {});
        const normalized = normalizePayload(raw);
        if (!normalized) {
          renderUnavailable();
          return null;
        }
        cache = normalized;
        cacheAt = Date.now();
        renderState(normalized);
        return normalized;
      } catch (_) {
        renderUnavailable();
        return null;
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  function activate() {
    return refresh({ force: false });
  }

  function init() {
    ensureStyles();
    ensureRoot();
  }

  global.LivingWorld = {
    init,
    activate,
    refresh,
    openOracle,
    openProfile,
    __test: { compactAge, isHighSignal, normalizeEvent, normalizePayload, safeProfileUid, statusLine },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
