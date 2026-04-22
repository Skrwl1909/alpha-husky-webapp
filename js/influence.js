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
  let _inited = false;
  const LEADERS_MIN_REFRESH_MS = 2500;

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
    if (!host) return;

    const w = _weekly || null;
    if (!w || !w.weekId) {
      host.style.display = "none";
      host.innerHTML = "";
      if (previewHost) {
        previewHost.style.display = "none";
        previewHost.innerHTML = "";
      }
      return;
    }

    const my = (w.my && typeof w.my === "object") ? w.my : null;
    const factions = Array.isArray(w.factions) ? w.factions : [];
    const topFaction = factions[0] || null;

    const rewardPool = Array.isArray(w.rewardPool) && w.rewardPool.length
      ? w.rewardPool
      : [
          {
            id: "weekly_faction_victory_aura",
            type: "aura",
            shortLabel: "Faction Victory Aura",
            label: "Winning Faction Aura",
            eligibility: "Qualified players in the winning faction",
          },
          {
            id: "weekly_skin_dominion_alpha",
            type: "skin",
            shortLabel: "Dominion Alpha",
            label: "Dominion Alpha (Weekly Skin)",
            eligibility: "Top scorer in the winning faction",
          },
          {
            id: "weekly_faction_victory_frame",
            type: "frame",
            shortLabel: "Faction Victory Frame",
            label: "Winning Faction Signature Frame",
            eligibility: "Rank #1 in the winning faction",
          },
          {
            id: "warpath_frame_weekly",
            type: "frame",
            shortLabel: "Warpath Frame",
            label: "Warpath Frame",
            eligibility: "Ranks #2 to #10 in the winning faction",
          },
          {
            id: "oracle_chosen_skin",
            type: "skin",
            shortLabel: "Oracle's Chosen",
            label: "Oracle's Chosen (Weekly Skin)",
            eligibility: "Raffle draw from qualified players",
          },
        ];

    const activeEffectsRaw = Array.isArray(w.activeEffects)
      ? w.activeEffects
      : (Array.isArray(w.activeTempRewards) ? w.activeTempRewards : []);
    const activeByKey = new Map();
    for (const raw of activeEffectsRaw) {
      if (!raw || typeof raw !== "object") continue;
      const labelKey = String(raw.shortLabel || raw.label || raw.id || "").trim().toLowerCase();
      const typeKey = String(raw.type || "").trim().toLowerCase();
      const factionKey = String(raw?.meta?.faction || raw?.presentation?.faction || "").trim().toLowerCase();
      const key = `${labelKey}:${typeKey}:${factionKey}`;
      if (!labelKey) continue;

      const prev = activeByKey.get(key);
      const nextExpiresAt = Number(raw.expiresAt || 0);
      if (!prev) {
        activeByKey.set(key, { ...raw, _dupeCount: 1 });
        continue;
      }
      const prevExpiresAt = Number(prev.expiresAt || 0);
      if (nextExpiresAt >= prevExpiresAt) {
        activeByKey.set(key, { ...raw, _dupeCount: Number(prev._dupeCount || 1) + 1 });
      } else {
        prev._dupeCount = Number(prev._dupeCount || 1) + 1;
      }
    }
    const activeEffects = Array.from(activeByKey.values()).sort((a, b) => Number(b.expiresAt || 0) - Number(a.expiresAt || 0));

    const reqScore = Number(w?.qualifyThreshold?.score || 60);
    const reqDays = Number(w?.qualifyThreshold?.activeDays || 2);
    const myScore = Number(my?.score || 0);
    const myDays = Number(my?.activeDays || 0);
    const myQualified = !!my?.qualified;
    const missingScore = Math.max(0, reqScore - myScore);
    const missingDays = Math.max(0, reqDays - myDays);

    const scorePct = Math.max(0, Math.min(100, Math.round((myScore / Math.max(1, reqScore)) * 100)));
    const daysPct = Math.max(0, Math.min(100, Math.round((myDays / Math.max(1, reqDays)) * 100)));

    const viewerFaction = normalizeFaction(my?.faction || _faction || getCanonicalFaction() || "");
    const viewerRank = (() => {
      if (!viewerFaction) return 0;
      const idx = factions.findIndex((row) => normalizeFaction(row?.faction) === viewerFaction);
      return idx >= 0 ? idx + 1 : 0;
    })();

    let rewardStatus = "Not eligible yet";
    let requirementHint = `Need ${reqScore} score and ${reqDays} active days.`;
    if (myQualified) {
      rewardStatus = "Score requirement reached";
      requirementHint = "You are eligible this cycle. Keep fighting to improve your position.";
    } else if (my) {
      if (missingScore > 0 && missingDays > 0) {
        rewardStatus = `${missingScore} score and ${missingDays} active day${missingDays === 1 ? "" : "s"} needed`;
      } else if (missingScore > 0) {
        rewardStatus = `${missingScore} score needed`;
      } else if (missingDays === 1) {
        rewardStatus = "1 more active day needed";
      } else if (missingDays > 1) {
        rewardStatus = `${missingDays} active days needed`;
      } else {
        rewardStatus = "Progress syncing";
      }
    }

    const statusTone = myQualified
      ? {
          bg: "rgba(110,255,170,.12)",
          border: "1px solid rgba(110,255,170,.30)",
          color: "#9cf7bc",
        }
      : {
          bg: "rgba(255,190,90,.12)",
          border: "1px solid rgba(255,190,90,.26)",
          color: "#ffd392",
        };

    const priorCycleEffects = activeEffects.filter((item) => {
      const cycle = String(item?.weekId || "").trim();
      return !!cycle && cycle !== String(w.weekId || "").trim();
    });

    if (previewHost) {
      const previewRankText = viewerRank > 0
        ? `#${viewerRank} ${fmtFaction(viewerFaction)}`
        : "No faction rank yet";
      previewHost.style.display = "block";
      previewHost.innerHTML = `
        <section style="
          margin-top:12px;
          padding:10px 11px;
          border-radius:12px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.11);
        ">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div>
              <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#b4c6dd;opacity:.74;">Faction War Link</div>
              <div style="margin-top:4px;font-size:13px;font-weight:800;line-height:1.2;">${esc(topFaction ? `${fmtFaction(topFaction.faction)} leading` : "War cycle active")}</div>
              <div style="margin-top:3px;font-size:11px;color:#d0ddef;opacity:.86;">${esc(previewRankText)} · ${esc(rewardStatus)}</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span style="display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-size:10px;font-weight:700;letter-spacing:.04em;">${esc(String(w.weekId || ""))}</span>
              <span style="display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:4px 8px;border-radius:999px;background:rgba(120,180,255,.14);border:1px solid rgba(120,180,255,.28);color:#cae8ff;font-size:10px;font-weight:700;">${esc(fmtRemain(w.endsInSec))} left</span>
            </div>
          </div>
        </section>
      `;
    }

    const progressCards = `
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
        <article style="padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.12);">
          <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#b6c7de;opacity:.84;">Your War Score</div>
          <div style="margin-top:6px;font-size:19px;font-weight:900;color:#79e8ff;">${esc(my ? myScore : 0)}</div>
          <div style="margin-top:7px;height:5px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:${scorePct}%;height:100%;background:linear-gradient(90deg,rgba(121,232,255,.88),rgba(104,148,255,.82));"></div></div>
        </article>
        <article style="padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.12);">
          <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#b6c7de;opacity:.84;">Your Position</div>
          <div style="margin-top:6px;font-size:19px;font-weight:900;color:#c6a6ff;">${esc(my ? ("#" + (my.factionRank || my.overallRank || "-")) : "-")}</div>
          <div style="margin-top:7px;font-size:10px;color:#bdcde2;opacity:.84;">Faction race placement</div>
        </article>
        <article style="padding:11px 12px;border-radius:12px;background:${statusTone.bg};border:${statusTone.border};">
          <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#b6c7de;opacity:.84;">Reward Access</div>
          <div style="margin-top:6px;font-size:15px;font-weight:900;color:${statusTone.color};line-height:1.2;">${esc(rewardStatus)}</div>
          <div style="margin-top:7px;font-size:10px;color:#bdcde2;opacity:.84;">Cycle qualification state</div>
        </article>
        <article style="padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.12);">
          <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#b6c7de;opacity:.84;">Active Days</div>
          <div style="margin-top:6px;font-size:15px;font-weight:900;color:#ffd392;line-height:1.2;">${esc(my ? `${myDays}/${reqDays}` : `0/${reqDays}`)}</div>
          <div style="margin-top:7px;height:5px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:${daysPct}%;height:100%;background:linear-gradient(90deg,rgba(255,211,111,.86),rgba(255,165,116,.8));"></div></div>
        </article>
      </div>
      <div style="margin-top:8px;font-size:11px;color:#c4d3e7;opacity:.9;">${esc(requirementHint)}</div>
    `;

    const raceRows = factions.slice(0, 5);
    const podiumRows = raceRows.slice(0, 3);
    const chaseRows = raceRows.slice(3);
    const maxScore = Math.max(1, ...raceRows.map((row) => Number(row?.score || 0)));

    const podiumHtml = podiumRows.length
      ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;">${podiumRows.map((row, idx) => {
          const factionKey = normalizeFaction(row?.faction);
          const isViewer = !!viewerFaction && viewerFaction === factionKey;
          const score = Number(row?.score || 0);
          const width = Math.max(8, Math.round((score / maxScore) * 100));
          const rank = idx + 1;
          const tone = rank === 1
            ? { bg: "rgba(255,214,126,.14)", bd: "rgba(255,214,126,.30)", fg: "#ffe9bf", bar: "linear-gradient(90deg,rgba(255,214,126,.9),rgba(255,164,94,.82))" }
            : rank === 2
              ? { bg: "rgba(174,212,255,.12)", bd: "rgba(174,212,255,.26)", fg: "#d9ebff", bar: "linear-gradient(90deg,rgba(174,212,255,.84),rgba(117,171,255,.76))" }
              : { bg: "rgba(195,170,255,.12)", bd: "rgba(195,170,255,.26)", fg: "#eadfff", bar: "linear-gradient(90deg,rgba(195,170,255,.84),rgba(151,118,232,.76))" };
          return `
            <article style="padding:10px 10px;border-radius:12px;background:${tone.bg};border:1px solid ${tone.bd};${isViewer ? "box-shadow:0 0 0 1px rgba(120,255,220,.28) inset;" : ""}">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <span style="display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;border-radius:999px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.16);font-size:10px;font-weight:900;">${rank}</span>
                <span style="font-size:16px;font-weight:900;color:${tone.fg};">${esc(score)}</span>
              </div>
              <div style="margin-top:6px;font-size:12px;font-weight:800;color:${tone.fg};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(fmtFaction(row?.faction || ""))}${isViewer ? " (You)" : ""}</div>
              <div style="margin-top:3px;font-size:10px;color:#c4d2e4;opacity:.86;">${esc(row?.qualifiedCount || 0)} qualified</div>
              <div style="margin-top:8px;height:5px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:${width}%;height:100%;background:${tone.bar};"></div></div>
            </article>
          `;
        }).join("")}</div>`
      : "";

    const chaseHtml = chaseRows.length
      ? `<div style="display:grid;gap:6px;margin-top:8px;">${chaseRows.map((row, idx) => {
          const rank = idx + 4;
          const factionKey = normalizeFaction(row?.faction);
          const isViewer = !!viewerFaction && viewerFaction === factionKey;
          const score = Number(row?.score || 0);
          return `
            <article style="padding:8px 9px;border-radius:11px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:space-between;gap:8px;${isViewer ? "box-shadow:0 0 0 1px rgba(120,255,220,.24) inset;" : ""}">
              <div style="min-width:0;display:flex;align-items:center;gap:8px;">
                <span style="font-size:11px;font-weight:800;color:#c1d1e6;opacity:.9;">#${rank}</span>
                <span style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(fmtFaction(row?.faction || ""))}${isViewer ? " (You)" : ""}</span>
              </div>
              <span style="font-size:13px;font-weight:800;">${esc(score)}</span>
            </article>
          `;
        }).join("")}</div>`
      : "";

    const rewardPoolHtml = rewardPool.map((reward) => `
      <article style="padding:12px 12px;border-radius:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.10);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
          <div style="min-width:0;">
            <div style="font-size:13px;font-weight:900;color:#f5f7ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(reward.shortLabel || reward.label || reward.id || "Weekly Reward")}</div>
            <div style="margin-top:4px;font-size:10px;color:#c4d3e7;opacity:.84;line-height:1.35;">${esc(reward.eligibility || "Earned from weekly war progress")}</div>
          </div>
          <span style="display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);font-size:10px;font-weight:800;">${esc(rewardTypeLabel(reward.type))}</span>
        </div>
      </article>
    `).join("");

    const activeEffectsHtml = activeEffects.length
      ? activeEffects.map((effect) => {
          const effectWeek = String(effect?.weekId || "").trim();
          const fromPrior = !!effectWeek && effectWeek !== String(w.weekId || "").trim();
          const duplicateCount = Number(effect?._dupeCount || 1);
          return `
            <article style="padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.11);display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
              <div style="min-width:0;">
                <div style="font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(effect.shortLabel || effect.label || effect.id || "Active Effect")}${duplicateCount > 1 ? ` x${duplicateCount}` : ""}</div>
                <div style="margin-top:2px;font-size:10px;color:#bfd0e5;opacity:.84;">${esc(effectWeek ? `Cycle ${effectWeek}` : "Cycle not tagged")}${fromPrior ? " | Previous cycle" : ""}</div>
              </div>
              <div style="text-align:right;flex:0 0 auto;">
                <div style="font-size:10px;font-weight:700;color:${fromPrior ? "#ffd7aa" : "#bce8ff"};">${esc(fmtRemain(effect.expiresInSec))}</div>
                <div style="margin-top:2px;font-size:9px;color:#bfd0e5;opacity:.8;">${esc(rewardTypeLabel(effect.type))}</div>
              </div>
            </article>
          `;
        }).join("")
      : `
        <div style="padding:10px 11px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.11);font-size:11px;color:#c4d3e7;opacity:.9;">
          No active effects yet.
        </div>
      `;

    const topThreeHtml = raceRows.length
      ? raceRows.slice(0, 3).map((row, idx) => {
          const rank = idx + 1;
          const factionLabel = fmtFaction(row?.faction || "");
          const score = Number(row?.score || 0);
          return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);">
            <span style="font-size:11px;font-weight:700;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">#${rank} ${esc(factionLabel)}</span>
            <span style="font-size:12px;font-weight:900;color:#e9f3ff;">${esc(score)}</span>
          </div>`;
        }).join("")
      : `<div style="padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);font-size:11px;opacity:.86;">No standings yet.</div>`;

    const rewardSummary = rewardPool.slice(0, 2).map((reward) => reward.shortLabel || reward.label || reward.id || "Reward");
    const rewardSummaryText = rewardSummary.length
      ? rewardSummary.join(" · ")
      : "Weekly rewards active";

    host.style.display = "block";
    host.innerHTML = `
      <section style="
        margin-top:10px;
        padding:10px 11px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.10);
      ">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div>
            <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#b4c6dd;opacity:.72;">Weekly War Link</div>
            <div style="margin-top:4px;font-size:13px;font-weight:800;line-height:1.2;">${esc(topFaction ? `${fmtFaction(topFaction.faction)} leads this cycle` : "Cycle in progress")}</div>
            <div style="margin-top:3px;font-size:11px;color:#c4d3e7;opacity:.86;">${esc(viewerRank > 0 ? `Your faction rank #${viewerRank}` : "No faction rank yet")} · ${esc(rewardStatus)}</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span style="display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-size:10px;font-weight:700;">${esc(String(w.weekId || ""))}</span>
            <span style="display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:4px 8px;border-radius:999px;background:rgba(120,180,255,.14);border:1px solid rgba(120,180,255,.28);color:#cae8ff;font-size:10px;font-weight:700;">${esc(fmtRemain(w.endsInSec))} left</span>
          </div>
        </div>

        <div style="margin-top:9px;font-size:11px;color:#c9d8eb;opacity:.9;">Score ${esc(my ? myScore : 0)} · Active days ${esc(my ? `${myDays}/${reqDays}` : `0/${reqDays}`)} · ${esc(requirementHint)}</div>
        <div style="margin-top:9px;display:grid;gap:6px;">${topThreeHtml}</div>

        <details style="margin-top:8px;">
          <summary style="cursor:pointer;font-size:11px;font-weight:700;color:#d7e4f7;opacity:.9;">Weekly details</summary>
          <div style="margin-top:7px;display:grid;gap:7px;">
            <div style="padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);font-size:11px;line-height:1.35;">Rewards: ${esc(rewardSummaryText)}</div>
            <div style="padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);font-size:11px;line-height:1.35;">Active effects: ${esc(activeEffects.length)}${priorCycleEffects.length ? ` (including ${priorCycleEffects.length} from previous cycles)` : ""}</div>
          </div>
        </details>
      </section>
    `;
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

  function _qs(id) { return document.getElementById(id); }

  function setStatus(msg, kind = "info") {
    const el = _qs("infStatus");
    if (!el) return;
    const m = String(msg || "").trim();
    if (!m) { el.style.display = "none"; el.textContent = ""; return; }
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
    const next = String(label || "Patrol").trim() || "Patrol";
    btn.dataset.baseLabel = next;
    if (_cdUntilMs > Date.now()) {
      const leftSec = Math.max(0, Math.ceil((_cdUntilMs - Date.now()) / 1000));
      btn.textContent = `${next} (${fmtSec(leftSec)})`;
      btn.disabled = true;
      return;
    }
    btn.textContent = next;
    btn.disabled = false;
  }

  function _stopCooldownTick() {
    if (_cdTick) { clearInterval(_cdTick); _cdTick = null; }
  }

  function _renderCooldown() {
    const btn = _qs("infPatrolBtn");
    const now = Date.now();
    const leftSec = Math.max(0, Math.ceil((_cdUntilMs - now) / 1000));
    const baseLabel = currentPatrolLabel();

    if (leftSec <= 0) {
      _cdUntilMs = 0;
      _stopCooldownTick();
      if (btn) { btn.disabled = false; btn.textContent = baseLabel; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = `${baseLabel} (${fmtSec(leftSec)})`; }
    setStatus(`Cooldown: ${fmtSec(leftSec)} left`, "info");
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

      // fallback: jeĹ›li brak TG popup, zwrĂłÄ‡ zapisane / pusty
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
  function ensureModal() {
    if (document.getElementById("influenceModal")) return;

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
      <div id="influenceCard" style="
        width: min(96vw, 560px);
        background: rgba(14,18,26,.95);
        border: 1px solid rgba(222,234,250,.16);
        border-radius: 18px;
        box-shadow: 0 24px 72px rgba(0,0,0,.54), inset 0 1px 0 rgba(255,255,255,.06);
        padding: 16px 16px 14px;
        max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px);
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      ">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
          <div>
            <div id="infTitle" style="font-weight:900;font-size:17px;line-height:1.15;color:#f2f6ff;">Influence Frontline</div>
            <div id="infSub" style="opacity:.9;font-size:12px;color:#c2d0e4;margin-top:3px;"></div>
          </div>
          <button data-close type="button" style="
            border:1px solid rgba(220,233,250,.16);background:rgba(14,20,30,.42);color:#f4f8ff;
            border-radius:10px;padding:8px 10px;cursor:pointer;font-weight:700;
          ">Close</button>
        </div>

        <section id="infHero" style="
          margin-top:11px;
          padding:12px;
          border-radius:14px;
          background:
            radial-gradient(circle at 92% 8%, rgba(255,136,104,.12), transparent 35%),
            radial-gradient(circle at 4% 100%, rgba(120,180,255,.12), transparent 40%),
            rgba(255,255,255,.055);
          border:1px solid rgba(255,255,255,.16);
        ">
          <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#aec0d8;opacity:.84;">Node State</div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px;">
            <div id="infLeader" style="font-size:20px;font-weight:900;line-height:1.15;">-</div>
            <span id="infUxStatus" style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              min-height:24px;
              padding:4px 10px;
              border-radius:999px;
              font-size:11px;
              font-weight:900;
              letter-spacing:.06em;
              text-transform:uppercase;
              background:rgba(255,255,255,.08);
              border:1px solid rgba(255,255,255,.12);
            ">Secured</span>
            <div id="infContested" style="display:none;"></div>
          </div>
          <div id="infUxStatusText" style="margin-top:7px;font-size:13px;color:#dfeafe;opacity:.97;line-height:1.35;">This frontline is stable right now.</div>
          <div id="infControlLine" style="margin-top:5px;font-size:11px;color:#c7d8ee;opacity:.9;line-height:1.35;"></div>
          <div style="margin-top:8px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
            <span id="infUxValue" style="
              display:none;
              align-items:center;
              justify-content:center;
              min-height:20px;
              padding:3px 8px;
              border-radius:999px;
              font-size:10px;
              font-weight:800;
              background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.10);
            "></span>
          </div>
        </section>

        <section style="
          margin-top:10px;
          padding:11px 12px;
          border-radius:13px;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.14);
        ">
          <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#aec0d8;opacity:.84;">Immediate Action</div>
          <button id="infPatrolBtn" type="button" style="
            width:100%; margin-top:8px; border:0; cursor:pointer;
            border-radius:12px; padding:13px 12px;
            background: linear-gradient(180deg, rgba(120,255,220,.2), rgba(120,255,220,.11));
            border: 1px solid rgba(120,255,220,.30);
            color:#eafff8; font-weight:900; text-shadow:0 1px 0 rgba(0,0,0,.35);
          ">Patrol</button>
          <div id="infPatrolHelp" style="margin-top:7px;padding:7px 9px;border-radius:10px;background:rgba(120,255,220,.08);border:1px solid rgba(120,255,220,.18);font-size:11px;opacity:.9;">Patrol to defend. Build pressure and protect this node.</div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap;">
            <button id="infDonateToggle" type="button" style="
              border:0; cursor:pointer; min-width:140px;
              border-radius:11px; padding:10px 12px;
              background: linear-gradient(180deg, rgba(170,140,255,.18), rgba(170,140,255,.10));
              border: 1px solid rgba(170,140,255,.26);
              color:#f5f0ff; font-weight:800; text-shadow:0 1px 0 rgba(0,0,0,.35);
            ">Donate</button>
            <span id="infUxAction" style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              min-height:22px;
              padding:3px 9px;
              border-radius:999px;
              font-size:10px;
              font-weight:800;
              background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.12);
              color:#e6f0ff;
            ">Patrol</span>
          </div>
          <div id="infWatchHelp" style="margin-top:7px;padding:7px 9px;border-radius:10px;background:rgba(255,186,116,.08);border:1px solid rgba(255,186,116,.18);font-size:11px;opacity:.86;">Join watch when pressure rises to help hold the frontline.</div>
          <div id="infDonateHelp" style="margin-top:6px;padding:7px 9px;border-radius:10px;background:rgba(170,140,255,.08);border:1px solid rgba(170,140,255,.18);font-size:11px;opacity:.86;">Donate to reinforce your faction's weekly push.</div>
        </section>

        <section style="
          margin-top:10px;
          padding:10px 11px;
          border-radius:12px;
          background:rgba(255,255,255,.045);
          border:1px solid rgba(255,255,255,.12);
        ">
          <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#aec0d8;opacity:.84;">Why It Matters</div>
          <div id="infUxReason" style="margin-top:7px;font-size:12px;line-height:1.35;color:#deebfd;opacity:.96;"></div>
          <div id="infUxReward" style="margin-top:6px;font-size:11px;line-height:1.35;color:#d8e7fb;opacity:.92;"></div>
          <div id="infUxLore" style="display:none;margin-top:8px;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.14);font-size:11px;line-height:1.35;color:#d7e5f8;opacity:.9;"></div>
        </section>

        <section style="
          margin-top:10px;
          padding:10px 11px;
          border-radius:12px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.10);
        ">
          <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#aec0d8;opacity:.72;">Supporting Node Intel</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:7px;">
            <article style="padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);">
              <div style="font-size:10px;color:#b5c6dd;opacity:.75;">Owner</div>
              <div id="infLocalOwner" style="margin-top:3px;font-size:12px;font-weight:800;">-</div>
            </article>
            <article style="padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);">
              <div style="font-size:10px;color:#b5c6dd;opacity:.75;">Watch Slots</div>
              <div id="infLocalWatch" style="margin-top:3px;font-size:12px;font-weight:800;">-</div>
            </article>
          </div>
          <article style="padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);margin-top:8px;">
            <div style="font-size:10px;color:#b5c6dd;opacity:.75;">Your Participation Here</div>
            <div id="infLocalYou" style="margin-top:3px;font-size:11px;font-weight:700;opacity:.9;">No local actions recorded yet.</div>
          </article>
        </section>

        <div id="infDonateBox" style="display:none; margin-top:10px;">
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="infAsset" style="
              flex:1; padding:10px 10px; border-radius:12px;
              background:rgba(255,255,255,.10); color:#f5f8ff; border:1px solid rgba(255,255,255,.16);
            ">
              <option value="scrap">scrap</option>
              <option value="rune_dust">rune_dust</option>
              <option value="bones">bones</option>
            </select>
            <input id="infAmount" type="number" min="1" step="1" value="10" style="
              width:120px; padding:10px 10px; border-radius:12px;
              background:rgba(255,255,255,.10); color:#f5f8ff; border:1px solid rgba(255,255,255,.16);
            "/>
          </div>

          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="infAmt" type="button" data-v="10" style="flex:1;border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:10px;background:rgba(255,255,255,.10);color:#f4f8ff;font-weight:700;cursor:pointer;">+10</button>
            <button class="infAmt" type="button" data-v="50" style="flex:1;border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:10px;background:rgba(255,255,255,.10);color:#f4f8ff;font-weight:700;cursor:pointer;">+50</button>
            <button class="infAmt" type="button" data-v="100" style="flex:1;border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:10px;background:rgba(255,255,255,.10);color:#f4f8ff;font-weight:700;cursor:pointer;">+100</button>
          </div>

          <button id="infDonateBtn" type="button" style="
            width:100%; margin-top:10px; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: linear-gradient(180deg, rgba(255,210,120,.18), rgba(255,210,120,.10));
            border: 1px solid rgba(255,210,120,.26);
            color:#fff6e8; font-weight:900; text-shadow:0 1px 0 rgba(0,0,0,.35);
          ">Confirm donate</button>
        </div>

        <div id="infStatus" style="
          display:none;
          margin-top:10px;
          padding:10px 12px;
          border-radius:12px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.10);
          font-size:12px;
          line-height:1.35;
          opacity:.95;
        "></div>

        <div id="infWeeklyPreview" style="display:none;"></div>
        <div id="infWeekly" style="display:none;"></div>

        <div id="infFoot" style="margin-top:10px; font-size:11px; color:#c5d4e9; opacity:.84;"></div>
      </div>
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

    // click handling
    wrap.addEventListener("click", (e) => {
      const t = e.target;

      if (t && t.matches("[data-close]")) { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (t === wrap) { e.preventDefault(); e.stopPropagation(); close(); return; }

      if (t && t.classList && t.classList.contains("infAmt")) {
        e.preventDefault(); e.stopPropagation();
        const v = parseInt(t.getAttribute("data-v") || "0", 10);
        const inp = document.getElementById("infAmount");
        if (inp) inp.value = String(v);
        return;
      }
    });

    // stop bubbling from card
    const card = wrap.querySelector("#influenceCard");
    if (card) card.addEventListener("click", (e) => e.stopPropagation());

    _modalHost().appendChild(wrap);

    document.getElementById("infDonateToggle")?.addEventListener("click", () => {
      const box = document.getElementById("infDonateBox");
      if (!box) return;
      box.style.display = (box.style.display === "none" || !box.style.display) ? "block" : "none";
    });
  }

  async function refreshLeaders(applyToMap = true) {
    if (!_apiPost) return null;
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

    if (_leadersMap && (now - _leadersLastFetchMs) < LEADERS_MIN_REFRESH_MS) {
      cacheHit = true;
      applyCurrentLeaders(_leadersMap);
      window.__ahPerf?.log?.("Influence.refreshLeaders", perfT0, { applyToMap, cacheHit, deduped });
      return _leadersMap;
    }

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

  async function refreshWeekly(nodeId) {
    if (!_apiPost) return;

    try {
      const r = await _apiPost("/webapp/influence/state", {
        nodeId,
        run_id: rid("infstate"),
      });

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

        _nodeInfoById[nodeId] = {
          ...(_nodeInfoById[nodeId] || {}),
          ...info,
          youFaction,
        };
        paintLeader(nodeId);
      }

      _weekly = extractWeekly(r);
      renderWeekly();
    } catch (e) {
      if (_dbg) console.warn("refreshWeekly failed", e);
    }
  }

  function open(nodeId, title = "") {
    ensureModal();
    const m = document.getElementById("influenceModal");
    if (!m) return;

    clearStatus();

    // show host (escape transforms)
    _modalHost().style.display = "block";

    try { (_tg || window.Telegram?.WebApp)?.expand?.(); } catch (_) {}

    m.dataset.nodeId = nodeId;

    const titleEl = document.getElementById("infTitle");
    const subEl = document.getElementById("infSub");
    if (titleEl) titleEl.textContent = title || nodeId;
    if (subEl) {
      const prettyNodeId = String(nodeId || "").trim().replaceAll("_", " ");
      subEl.textContent = prettyNodeId ? `Frontline objective - ${prettyNodeId}` : "Frontline objective";
    }

    // close donate box at start
    const donateBox = document.getElementById("infDonateBox");
    if (donateBox) donateBox.style.display = "none";

    _weekly = null;
    renderWeekly();

    (async () => {
      await refreshLeaders(false);
      paintLeader(nodeId);
      await refreshWeekly(nodeId);
    })();

    const patrolBtn = document.getElementById("infPatrolBtn");
    const donateBtn = document.getElementById("infDonateBtn");
    if (patrolBtn) patrolBtn.onclick = () => doPatrol(nodeId);
    if (donateBtn) donateBtn.onclick = () => doDonate(nodeId);

    m.style.display = "flex";
    document.body.classList.add("ah-modal-open");

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

    m.style.display = "none";
    document.body.classList.remove("ah-modal-open");

    try {
      const card = document.getElementById("influenceCard");
      if (card) card.scrollTop = 0;
    } catch (_) {}

    _modalHost().style.display = "none";
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
    const leaderEl = document.getElementById("infLeader");
    const contEl = document.getElementById("infContested");
    const controlLineEl = document.getElementById("infControlLine");
    const foot = document.getElementById("infFoot");
    const statusEl = document.getElementById("infUxStatus");
    const actionEl = document.getElementById("infUxAction");
    const valueEl = document.getElementById("infUxValue");
    const statusTextEl = document.getElementById("infUxStatusText");
    const reasonEl = document.getElementById("infUxReason");
    const rewardEl = document.getElementById("infUxReward");
    const loreEl = document.getElementById("infUxLore");
    const localOwnerEl = document.getElementById("infLocalOwner");
    const localWatchEl = document.getElementById("infLocalWatch");
    const localYouEl = document.getElementById("infLocalYou");
    const patrolHelpEl = document.getElementById("infPatrolHelp");
    const watchHelpEl = document.getElementById("infWatchHelp");
    const donateHelpEl = document.getElementById("infDonateHelp");

    if (!leaderEl || !contEl || !controlLineEl || !foot || !statusEl || !actionEl || !valueEl || !statusTextEl || !reasonEl || !rewardEl || !loreEl) return;

    const setLocalDefaults = () => {
      if (localOwnerEl) localOwnerEl.textContent = "-";
      if (localWatchEl) localWatchEl.textContent = "No watch roster";
      if (localYouEl) localYouEl.textContent = "No local actions recorded yet.";
      if (patrolHelpEl) patrolHelpEl.textContent = "Patrol now to build pressure on this frontline.";
      if (watchHelpEl) watchHelpEl.textContent = "Watch opens when siege pressure spikes.";
      if (donateHelpEl) donateHelpEl.textContent = "Donate to reinforce your faction's weekly momentum.";
    };

    if (!info || !Object.keys(info).length) {
      leaderEl.textContent = "-";
      contEl.style.display = "none";
      contEl.textContent = "";
      controlLineEl.textContent = "Frontline data is syncing.";
      foot.textContent = "";

      paintUxPill(statusEl, "Secured", uxToneStyles("CALM"));
      paintUxPill(actionEl, "Next: Patrol", {
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.12)",
        color: "#e6f0ff",
      });
      paintUxPill(valueEl, "", {}, false);
      statusTextEl.textContent = "Node secured for now. Keep pressure to prevent a swing.";
      reasonEl.textContent = "Control here sets the local frontline tempo.";
      rewardEl.textContent = "Your actions here feed faction war progress.";
      loreEl.style.display = "none";
      loreEl.textContent = "";
      setLocalDefaults();
      setPatrolButtonLabel("Patrol");
      return;
    }

    const s = info.scores || {};
    const ux = resolveNodeUx(nodeId, info);
    const owner = normalizeFaction(info?.effectiveOwnerFaction || info?.ownerFaction || info?.owner || "");
    const leaderFaction = normalizeFaction(info?.leader || "");
    const leaderName = leaderFaction ? fmtFaction(leaderFaction) : String(info?.leader || "").trim();
    const leaderValue = Number(info?.leaderValue || 0);
    const leaderSuffix = leaderName && leaderValue > 0 ? ` (${leaderValue})` : "";
    const controlText = owner ? `${fmtFaction(owner)} currently controls this node.` : "This node is currently neutral.";
    const valueLabel = uxValueLabel(ux.valueTier, ux.valueMultiplier);

    const displayStatus = String(ux.displayStatus || "").trim().toUpperCase();
    contEl.style.display = "none";
    contEl.textContent = "";

    leaderEl.textContent = leaderName ? `${leaderName}${leaderSuffix}` : (owner ? fmtFaction(owner) : "No leader yet");
    controlLineEl.textContent = controlText;

    paintUxPill(statusEl, uxPrimaryStatusLabel(ux.displayStatus, ux.displayLabel), uxToneStyles(ux.displayStatus));
    paintUxPill(actionEl, `Next: ${ux.actionHint || "Patrol"}`, {
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.12)",
      color: "#e6f0ff",
    });
    paintUxPill(valueEl, valueLabel, {
      background: "rgba(255,210,120,.12)",
      border: "1px solid rgba(255,210,120,.18)",
      color: "#ffe9b8",
    }, !!valueLabel);

    statusTextEl.textContent = uxStatusText(ux.displayStatus);
    reasonEl.textContent = ux.reasonText || "Control here shapes the local rivalry line.";
    rewardEl.textContent = ux.rewardText || "Contribution here converts into faction war progress.";

    const loreLines = resolveNodeLoreLines(nodeId, info);
    if (loreLines.length) {
      loreEl.style.display = "block";
      loreEl.innerHTML = `<div style="opacity:.66;font-size:10px;letter-spacing:.06em;text-transform:uppercase;">Node context</div>${loreLines.map((line) => `<div style="margin-top:4px;">${esc(line)}</div>`).join("")}`;
    } else {
      loreEl.style.display = "none";
      loreEl.textContent = "";
    }

    const viewerFaction = normalizeFaction(_faction || getCanonicalFaction() || info?.youFaction || "");
    const viewerPressure = viewerFaction ? Number(s?.[viewerFaction] || 0) : 0;
    const watchUsed = Number(info?.guardSlotsUsed || info?.watchCount || 0);
    const watchMax = Number(info?.guardSlotsMax || info?.maxDefenders || 0);
    const watchText = watchMax > 0
      ? `${watchUsed}/${watchMax} occupied`
      : (watchUsed > 0 ? `${watchUsed} active` : "No watch roster");

    if (localOwnerEl) localOwnerEl.textContent = owner ? fmtFaction(owner) : "Neutral";
    if (localWatchEl) localWatchEl.textContent = watchText;

    if (localYouEl) {
      const my = (_weekly && typeof _weekly.my === "object") ? _weekly.my : null;
      if (my) {
        const rankTxt = my.factionRank ? `#${my.factionRank}` : (my.overallRank ? `#${my.overallRank}` : "-");
        localYouEl.textContent = `Weekly score ${Number(my.score || 0)} · rank ${rankTxt} · ${Number(my.activeDays || 0)} active days${viewerPressure > 0 ? ` · local pressure ${viewerPressure}` : ""}`;
      } else if (viewerPressure > 0) {
        localYouEl.textContent = `Your faction pressure here this hour: ${viewerPressure}.`;
      } else {
        localYouEl.textContent = "Start with patrol to record local war contribution.";
      }
    }

    const patrolHint = /defend|hold/i.test(String(ux.actionHint || ""))
      ? "Patrol now to defend this node and hold pressure."
      : "Patrol now to build pressure on this frontline.";
    const watchHint = (displayStatus === "SIEGE_LIVE" || displayStatus === "SIEGE_FORMING")
      ? `Watch is active: hold this line while pressure rises (${watchText}).`
      : "Watch opens when siege pressure spikes.";
    const donateHint = owner && viewerFaction && owner === viewerFaction
      ? "Donate to reinforce current control and weekly momentum."
      : "Donate to reinforce your faction's weekly momentum.";

    if (patrolHelpEl) patrolHelpEl.textContent = patrolHint;
    if (watchHelpEl) watchHelpEl.textContent = watchHint;
    if (donateHelpEl) donateHelpEl.textContent = donateHint;

    setPatrolButtonLabel(patrolLabelForAction(ux.actionHint));
    foot.textContent = `Hourly pressure · RB ${s.rogue_byte || 0} | EW ${s.echo_wardens || 0} | PB ${s.pack_burners || 0} | IH ${s.inner_howl || 0}`;
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
      toast(`+${r.gain} influence${hq}`);
      setStatus(`+${r.gain} influence${hq}`, "ok");

      applyLeadersFromResponse(r, nodeId);
      await refreshWeekly(nodeId);
    } finally {
      // if cooldown active, keep disabled
      if (btn) {
        if (_cdUntilMs > Date.now()) {
          // will be re-rendered by cooldown tick
        } else {
          btn.disabled = false;
          btn.textContent = currentPatrolLabel();
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
      toast(`Donated ${amount} ${asset} -> +${r.gain} influence${hq}`);
      setStatus(`Donated ${amount} ${asset} -> +${r.gain} influence${hq}`, "ok");

      applyLeadersFromResponse(r, nodeId);
      await refreshWeekly(nodeId);
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
    refreshLeaders(true);
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


