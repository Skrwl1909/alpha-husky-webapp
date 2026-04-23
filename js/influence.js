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
  const FACTION_CODES = {
    rogue_byte: "RB",
    echo_wardens: "EW",
    pack_burners: "PB",
    inner_howl: "IH",
  };
  const FACTION_ACCENTS = {
    rogue_byte: "255,118,102",
    echo_wardens: "134,194,255",
    pack_burners: "255,168,95",
    inner_howl: "189,146,255",
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

  function factionCode(f) {
    const key = normalizeFaction(f);
    if (!key) return "--";
    return FACTION_CODES[key] || key.slice(0, 2).toUpperCase();
  }

  function factionAccentRgb(f) {
    const key = normalizeFaction(f);
    return FACTION_ACCENTS[key] || "165,184,214";
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
      ? { color: "#97f0ba", chip: "rgba(110,255,170,.22)" }
      : { color: "#ffd8a0", chip: "rgba(255,190,90,.22)" };

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
        <section class="inf-weekly-preview">
          <div style="min-width:0;">
            <div class="inf-panel-kicker">War Link</div>
            <div class="inf-weekly-title">${esc(topFaction ? `${fmtFaction(topFaction.faction)} holds lead` : "Weekly race in progress")}</div>
            <div class="inf-weekly-sub">${esc(previewRankText)} | ${esc(rewardStatus)}</div>
          </div>
          <div class="inf-chip-row">
            <span class="inf-chip inf-chip-muted">Week ${esc(String(w.weekId || ""))}</span>
            <span class="inf-chip" style="background:rgba(126,200,255,.16);border:1px solid rgba(126,200,255,.32);color:#d7eeff;">${esc(fmtRemain(w.endsInSec))} left</span>
          </div>
        </section>
      `;
    }

    const raceRows = factions.slice(0, 5);
    const maxScore = Math.max(1, ...raceRows.map((row) => Number(row?.score || 0)));
    const raceLanesHtml = raceRows.length
      ? raceRows.map((row, idx) => {
          const rank = idx + 1;
          const factionKey = normalizeFaction(row?.faction);
          const isViewer = !!viewerFaction && viewerFaction === factionKey;
          const isLeader = rank === 1;
          const score = Number(row?.score || 0);
          const width = score > 0 ? Math.max(9, Math.round((score / maxScore) * 100)) : 0;
          const rgb = factionAccentRgb(factionKey);
          return `
            <article class="inf-race-lane ${isLeader ? "is-leader" : ""} ${isViewer ? "is-viewer" : ""}" style="--lane-rgb:${rgb};">
              <div class="inf-race-lane-head">
                <span class="inf-race-rank">#${rank}</span>
                <span class="inf-race-name">
                  <span class="inf-race-badge">${esc(factionCode(factionKey))}</span>
                  ${esc(fmtFaction(row?.faction || ""))}${isViewer ? `<span class="inf-race-you">YOU</span>` : ""}
                </span>
                <span class="inf-race-score">${esc(score)}</span>
              </div>
              <div class="inf-race-bar"><i style="width:${width}%;"></i></div>
              <div class="inf-race-meta">${esc(row?.qualifiedCount || 0)} qualified</div>
            </article>
          `;
        }).join("")
      : `<div class="inf-empty-card">Race data syncing.</div>`;

    const rewardPoolHtml = rewardPool.map((reward) => `
      <article class="inf-compact-card">
        <div class="inf-compact-head">
          <div style="min-width:0;">
            <div class="inf-compact-title">${esc(reward.shortLabel || reward.label || reward.id || "Weekly Reward")}</div>
            <div class="inf-compact-copy">${esc(reward.eligibility || "Earned from weekly war progress")}</div>
          </div>
          <span class="inf-chip inf-chip-muted">${esc(rewardTypeLabel(reward.type))}</span>
        </div>
      </article>
    `).join("");

    const activeEffectsHtml = activeEffects.length
      ? activeEffects.map((effect) => {
          const effectWeek = String(effect?.weekId || "").trim();
          const fromPrior = !!effectWeek && effectWeek !== String(w.weekId || "").trim();
          const duplicateCount = Number(effect?._dupeCount || 1);
          return `
            <article class="inf-compact-card">
              <div style="min-width:0;">
                <div class="inf-compact-title">${esc(effect.shortLabel || effect.label || effect.id || "Active Effect")}${duplicateCount > 1 ? ` x${duplicateCount}` : ""}</div>
                <div class="inf-compact-copy">${esc(effectWeek ? `Cycle ${effectWeek}` : "Cycle not tagged")}${fromPrior ? " | Previous cycle" : ""}</div>
              </div>
              <div style="text-align:right;flex:0 0 auto;display:grid;gap:3px;">
                <span style="font-size:10px;font-weight:700;color:${fromPrior ? "#ffd7aa" : "#bce8ff"};">${esc(fmtRemain(effect.expiresInSec))}</span>
                <span style="font-size:9px;color:#bfd0e5;opacity:.8;">${esc(rewardTypeLabel(effect.type))}</span>
              </div>
            </article>
          `;
        }).join("")
      : `
        <div class="inf-empty-card">No active effects yet.</div>
      `;

    const rewardSummary = rewardPool.slice(0, 2).map((reward) => reward.shortLabel || reward.label || reward.id || "Reward");
    const rewardSummaryText = rewardSummary.length
      ? rewardSummary.join(" / ")
      : "Weekly rewards active";
    const myRank = my ? ("#" + (my.factionRank || my.overallRank || "-")) : "-";
    const scoreReady = myScore >= reqScore;
    const daysReady = myDays >= reqDays;
    const trackerState = myQualified ? "UNLOCKED" : ((scoreReady || daysReady) ? "IN PROGRESS" : "LOCKED");

    host.style.display = "block";
    host.innerHTML = `
      <section class="inf-weekly-shell">
        <div class="inf-weekly-head">
          <div style="min-width:0;">
            <div class="inf-panel-kicker">Weekly War Race</div>
            <div class="inf-weekly-title">${esc(topFaction ? `${fmtFaction(topFaction.faction)} in front` : "Faction race active")}</div>
            <div class="inf-weekly-sub">${esc(viewerRank > 0 ? `Your faction rank #${viewerRank}` : "No faction rank yet")}</div>
          </div>
          <div class="inf-chip-row">
            <span class="inf-chip inf-chip-muted">Week ${esc(String(w.weekId || ""))}</span>
            <span class="inf-chip" style="background:rgba(126,200,255,.16);border:1px solid rgba(126,200,255,.32);color:#d7eeff;">${esc(fmtRemain(w.endsInSec))} left</span>
          </div>
        </div>

        <div class="inf-weekly-grid">
          <article class="inf-weekly-board">
            <div class="inf-panel-kicker">Faction Lanes</div>
            <div class="inf-race-lanes">${raceLanesHtml}</div>
          </article>

          <article class="inf-weekly-board inf-reward-board">
            <div class="inf-panel-kicker">Reward Tracker</div>
            <div class="inf-reward-state" style="color:${statusTone.color};">
              <span class="inf-chip" style="background:${statusTone.chip};border:1px solid ${statusTone.chip};color:${statusTone.color};">${trackerState}</span>
              <span>${esc(rewardStatus)}</span>
            </div>
            <div class="inf-reward-metric">
              <div class="inf-reward-metric-head">
                <span>Score</span>
                <span>${esc(myScore)}/${esc(reqScore)}</span>
              </div>
              <div class="inf-reward-track"><i style="width:${scorePct}%;"></i></div>
            </div>
            <div class="inf-reward-metric">
              <div class="inf-reward-metric-head">
                <span>Active days</span>
                <span>${esc(myDays)}/${esc(reqDays)}</span>
              </div>
              <div class="inf-reward-track inf-reward-track-days"><i style="width:${daysPct}%;"></i></div>
            </div>
            <div class="inf-reward-checklist">
              <div class="inf-reward-check ${scoreReady ? "is-ready" : ""}">
                <span>${scoreReady ? "READY" : "LOCKED"}</span>
                <span>Score gate</span>
              </div>
              <div class="inf-reward-check ${daysReady ? "is-ready" : ""}">
                <span>${daysReady ? "READY" : "LOCKED"}</span>
                <span>Activity gate</span>
              </div>
              <div class="inf-reward-check is-meta">
                <span>${esc(myRank)}</span>
                <span>Your position</span>
              </div>
            </div>
            <div class="inf-weekly-sub">${esc(requirementHint)}</div>
          </article>
        </div>

        <details class="inf-weekly-details">
          <summary>War cache</summary>
          <div class="inf-weekly-cache">
            <div class="inf-cache-line">Cycle rewards: ${esc(rewardSummaryText)}</div>
            <div class="inf-cache-line">Active effects: ${esc(activeEffects.length)}${priorCycleEffects.length ? ` (including ${priorCycleEffects.length} from previous cycles)` : ""}</div>
            <div>
              <div class="inf-panel-kicker">Reward Pool</div>
              <div class="inf-cache-grid">${rewardPoolHtml || `<div class="inf-empty-card">Reward pool syncing.</div>`}</div>
            </div>
            <div>
              <div class="inf-panel-kicker">Active Effects</div>
              <div class="inf-cache-grid">${activeEffectsHtml}</div>
            </div>
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
  let _signalCoreOpen = false;

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
      requestAnimationFrame(() => {
        if (!_signalCoreOpen) return;
        backdrop.classList.add("is-open");
        sheet.classList.add("is-open");
      });
      return;
    }

    backdrop.classList.remove("is-open");
    sheet.classList.remove("is-open");
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
      ? lines.map((line) => String(line || "").trim()).filter(Boolean).slice(0, 4)
      : [];
    const out = safeLines.length ? safeLines : ["Signal feed syncing."];
    host.innerHTML = out.map((line) => `<div class="inf-signal-line">${esc(line)}</div>`).join("");
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
    const visualStateEl = _qs("infSignalVisualState");
    const visualHintEl = _qs("infSignalVisualHint");
    const tileControlEl = _qs("infSignalControlState");
    const tilePressureEl = _qs("infSignalPressure");
    const tileWatchEl = _qs("infSignalWatch");
    const tileValueEl = _qs("infSignalValue");
    const pulseEl = _qs("infSignalPulseValue");

    const statusKey = String(displayStatus || "CALM").trim().toUpperCase() || "CALM";
    const primaryStatus = uxPrimaryStatusLabel(statusKey, displayLabel);
    const mood = uxMoodTokens(statusKey);
    const ownerLabel = owner ? fmtFaction(owner) : "Neutral";
    const watchSlots = watchMax > 0
      ? `${Math.max(0, Number(watchUsed || 0))}/${Math.max(0, Number(watchMax || 0))}`
      : (watchUsed > 0 ? `${watchUsed} active` : "Open");
    const pressureText = viewerPressure > 0 && leaderPressure > 0
      ? `${viewerPressure} vs ${leaderPressure}`
      : (viewerPressure > 0 ? `${viewerPressure} allied` : (leaderPressure > 0 ? `Lead ${leaderPressure}` : "Quiet"));
    const valueText = String(valueLabel || "").trim() || "Support";
    const subtitleRaw = String(nodeId || "").trim().replaceAll("_", " ") || "Frontline node core";
    const subtitle = subtitleRaw.replace(/\b\w/g, (ch) => ch.toUpperCase());
    const statusCopy = uxStatusText(statusKey);

    let pulseText = "Recent pulse: low traffic.";
    if (statusKey === "SIEGE_LIVE" || statusKey === "CONTESTED") pulseText = "Recent pulse: hostile spikes detected.";
    else if (viewerPressure > 0) pulseText = "Recent pulse: allied signal packets rising.";
    else if (watchUsed > 0) pulseText = "Recent pulse: watch deck pings holding.";

    if (sheetEl) {
      sheetEl.style.setProperty("--inf-signal-glow", mood.border);
      sheetEl.style.setProperty("--inf-signal-soft", mood.panel);
    }
    if (subtitleEl) subtitleEl.textContent = subtitle;
    if (visualStateEl) visualStateEl.textContent = primaryStatus;
    if (visualHintEl) visualHintEl.textContent = owner ? `${ownerLabel} signature active` : "Neutral spectrum";
    if (tileControlEl) tileControlEl.textContent = `${primaryStatus} | ${ownerLabel}`;
    if (tilePressureEl) tilePressureEl.textContent = pressureText;
    if (tileWatchEl) tileWatchEl.textContent = watchSlots;
    if (tileValueEl) tileValueEl.textContent = valueText;
    if (pulseEl) pulseEl.textContent = pulseText;

    const lines = [];
    if (controlText) lines.push(controlText);
    lines.push(statusCopy);
    if (viewerPressure > 0 && leaderPressure > 0) {
      lines.push(`Your faction pressure is ${viewerPressure} against lead ${leaderPressure}.`);
    } else if (viewerPressure > 0) {
      lines.push(`Your faction pressure is active at ${viewerPressure}.`);
    } else if (leaderPressure > 0) {
      lines.push(`Enemy pressure signal is ${leaderPressure}. Counter-pressure advised.`);
    } else {
      lines.push("No active pressure packets in this cycle.");
    }
    lines.push(watchMax > 0 ? `Watch slots ${watchText}.` : "Watch grid awaiting defenders.");
    renderSignalReadout(lines);
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
        position:absolute;
        left:8px;
        right:8px;
        bottom:8px;
        z-index:2;
        border-radius:16px;
        border:1px solid rgba(255,214,172,.22);
        background:
          radial-gradient(circle at 18% 0%, var(--inf-signal-soft), transparent 42%),
          linear-gradient(180deg, rgba(18,24,34,.98), rgba(10,15,24,.98));
        box-shadow:0 18px 40px rgba(0,0,0,.52), inset 0 1px 0 rgba(255,255,255,.06);
        padding:11px 11px 12px;
        max-height:min(72dvh, 520px);
        overflow:auto;
        -webkit-overflow-scrolling:touch;
        transform:translateY(14px);
        opacity:0;
        pointer-events:none;
        transition:transform .2s ease, opacity .2s ease;
      }
      #influenceModal .inf-signal-sheet.is-open{
        transform:translateY(0);
        opacity:1;
        pointer-events:auto;
      }
      #influenceModal .inf-signal-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }
      #influenceModal .inf-signal-title{
        font-size:14px;
        font-weight:900;
        line-height:1.12;
        color:#f2f8ff;
      }
      #influenceModal .inf-signal-sub{
        margin-top:2px;
        font-size:10px;
        text-transform:uppercase;
        letter-spacing:.08em;
        color:#bdcfe6;
        opacity:.9;
      }
      #influenceModal .inf-signal-close{
        border:1px solid rgba(255,255,255,.16);
        border-radius:10px;
        background:rgba(255,255,255,.05);
        color:#edf5ff;
        padding:7px 9px;
        font-size:11px;
        font-weight:800;
        cursor:pointer;
      }
      #influenceModal .inf-signal-visual{
        position:relative;
        margin-top:8px;
        min-height:136px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.13);
        background:
          radial-gradient(circle at 50% 50%, rgba(255,255,255,.19) 0 12%, rgba(255,255,255,.04) 34%, transparent 58%),
          linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02));
        overflow:hidden;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
      }
      #influenceModal .inf-signal-visual::before{
        content:"";
        position:absolute;
        width:132px;
        height:132px;
        border-radius:50%;
        border:1px solid rgba(255,240,214,.33);
        box-shadow:0 0 0 14px rgba(255,228,186,.055), 0 0 0 28px rgba(255,228,186,.028);
      }
      #influenceModal .inf-signal-visual::after{
        content:"";
        position:absolute;
        width:178px;
        height:178px;
        border-radius:50%;
        border:1px dashed rgba(255,231,196,.26);
        animation:infSignalSpin 14s linear infinite;
      }
      #influenceModal .inf-signal-pulse-ring{
        position:absolute;
        width:78px;
        height:78px;
        border-radius:50%;
        border:1px solid var(--inf-signal-glow);
        box-shadow:0 0 18px rgba(255,196,124,.18);
        animation:infSignalPulse 2.2s ease-out infinite;
      }
      #influenceModal .inf-signal-visual-copy{
        position:relative;
        z-index:1;
      }
      #influenceModal .inf-signal-visual-state{
        font-size:16px;
        font-weight:900;
        color:#f8fbff;
        letter-spacing:.06em;
        text-transform:uppercase;
      }
      #influenceModal .inf-signal-visual-hint{
        margin-top:4px;
        font-size:11px;
        color:#d7e7fc;
        opacity:.9;
      }
      #influenceModal .inf-signal-grid{
        margin-top:8px;
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:7px;
      }
      #influenceModal .inf-signal-tile{
        border-radius:10px;
        border:1px solid rgba(255,255,255,.1);
        background:rgba(255,255,255,.03);
        padding:7px 8px 8px;
      }
      #influenceModal .inf-signal-tile-label{
        font-size:9px;
        text-transform:uppercase;
        letter-spacing:.08em;
        color:#aec3de;
        opacity:.82;
      }
      #influenceModal .inf-signal-tile-value{
        margin-top:4px;
        font-size:12px;
        font-weight:800;
        color:#eaf3ff;
        line-height:1.3;
      }
      #influenceModal .inf-signal-readout{
        margin-top:9px;
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
        margin-top:5px;
        display:grid;
        gap:4px;
      }
      #influenceModal .inf-signal-line{
        font-size:11px;
        line-height:1.32;
        color:#ddeafb;
      }
      #influenceModal .inf-signal-pulse{
        margin-top:8px;
        border-radius:10px;
        border:1px solid rgba(255,211,156,.22);
        background:rgba(255,199,138,.09);
        padding:7px 8px;
        font-size:11px;
        color:#ffe4c1;
      }
      #influenceModal .inf-signal-foot{
        margin-top:10px;
        display:flex;
        justify-content:flex-end;
      }
      #influenceModal .inf-signal-return{
        margin-top:6px;
        font-size:10px;
        color:#afc3dc;
        opacity:.8;
      }
      @keyframes infSignalSpin{
        from{ transform:rotate(0deg); }
        to{ transform:rotate(360deg); }
      }
      @keyframes infSignalPulse{
        0%{ transform:scale(.85); opacity:.7; }
        70%{ transform:scale(1.22); opacity:0; }
        100%{ transform:scale(1.22); opacity:0; }
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
        #influenceModal .inf-signal-visual::after,
        #influenceModal .inf-signal-pulse-ring{
          animation:none !important;
        }
      }
      @media (max-width: 520px){
        #influenceModal .inf-modal-card{ padding:12px 10px 11px; }
        #influenceModal .inf-hero-grid{ grid-template-columns:minmax(0,1fr); }
        #influenceModal .inf-node-core{ width:100%; height:84px; }
        #influenceModal .inf-action-grid{ grid-template-columns:minmax(0,1fr); }
        #influenceModal .inf-local-grid,
        #influenceModal .inf-status-grid{ grid-template-columns:minmax(0,1fr); }
        #influenceModal .inf-signal-sheet{ left:6px; right:6px; bottom:6px; padding:10px 10px 11px; }
        #influenceModal .inf-signal-grid{ grid-template-columns:minmax(0,1fr); }
        #influenceModal .inf-weekly-grid{ grid-template-columns:minmax(0,1fr); }
        #influenceModal .inf-reward-checklist{ grid-template-columns:repeat(2,minmax(0,1fr)); }
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
          <div class="inf-hero-grid">
            <div>
              <div class="inf-panel-kicker">Live Node Operations</div>
              <div id="infLeader" class="inf-leader">-</div>
              <div id="infControlLine" class="inf-control-line"></div>
            </div>
            <button
              id="infSignalCoreBtn"
              type="button"
              class="inf-node-core inf-node-core-btn"
              data-signal-open
              aria-haspopup="dialog"
              aria-controls="infSignalSheet"
              aria-expanded="false"
            >
              <div class="inf-node-core-label">Signal Core</div>
              <div id="infCoreState" class="inf-node-core-state">Stable</div>
              <div class="inf-node-core-hint">Inspect</div>
            </button>
          </div>
          <div class="inf-chip-row">
            <span id="infUxStatus" class="inf-chip rv-chip">Secured</span>
            <span id="infUxControlChip" class="inf-chip inf-chip-muted rv-chip is-muted">Controlled</span>
            <span id="infUxAction" class="inf-chip inf-chip-muted rv-chip is-muted">Pressure stable</span>
            <span id="infUxValue" class="inf-chip rv-chip" style="display:none;"></span>
            <span id="infUxWatchChip" class="inf-chip inf-chip-muted rv-chip is-muted" style="display:none;"></span>
          </div>
          <div id="infUxStatusText" class="inf-hero-status">This frontline is stable right now.</div>
          <div id="infContested" style="display:none;"></div>
        </section>

        <section id="infOpsPanel" class="inf-panel inf-ops-panel rv-surface">
          <div class="inf-panel-head">
            <div class="inf-panel-title">Action Zone</div>
            <span id="infOpsState" class="inf-chip">Actions available</span>
          </div>
          <div class="inf-action-grid">
            <button id="infPatrolBtn" type="button" class="inf-action-card inf-action-card-primary">
              <span class="inf-action-line">
                <span class="inf-action-icon">[P]</span>
                <span id="infPatrolLabel" class="inf-action-title">Patrol</span>
                <span id="infPatrolTimer" class="inf-chip inf-action-tag" style="display:none;"></span>
              </span>
              <span id="infPatrolHelp" class="inf-action-effect">Patrol now to defend and build pressure.</span>
              <span class="inf-action-chip">Control</span>
            </button>

            <button id="infDonateToggle" type="button" class="inf-action-card inf-action-card-support">
              <span class="inf-action-line">
                <span class="inf-action-icon">[D]</span>
                <span class="inf-action-title">Donate</span>
              </span>
              <span id="infDonateHelp" class="inf-action-effect">Donate to reinforce your faction push.</span>
              <span class="inf-action-chip">Support</span>
            </button>
          </div>
          <div id="infWatchHelp" class="inf-watch-line">Join watch when pressure rises to hold this frontline.</div>
        </section>

        <section id="infIntelShell" class="inf-panel rv-surface">
          <div class="inf-panel-head">
            <div class="inf-panel-title">Local Operations</div>
            <span class="inf-chip inf-chip-muted">Live feed</span>
          </div>
          <div class="inf-local-grid">
            <article class="inf-tile">
              <div class="inf-tile-label">Owner Signal</div>
              <div id="infIntelOwner" class="inf-tile-value">-</div>
            </article>
            <article class="inf-tile">
              <div class="inf-tile-label">Watch Deck</div>
              <div id="infIntelWatch" class="inf-tile-value">No watch roster</div>
              <div class="inf-meter"><i id="infIntelWatchBar"></i></div>
            </article>
            <article class="inf-tile">
              <div class="inf-tile-label">Your Presence</div>
              <div id="infIntelPresence" class="inf-tile-value">No local actions recorded yet.</div>
            </article>
            <article class="inf-tile">
              <div class="inf-tile-label">Threat Meter</div>
              <div id="infIntelPressure" class="inf-tile-value">0</div>
              <div class="inf-meter"><i id="infIntelPressureBar"></i></div>
              <div id="infIntelPressureHint" class="inf-hint">Waiting for frontline pressure.</div>
            </article>
          </div>
        </section>

        <section class="inf-panel rv-surface">
          <div class="inf-panel-title">Operator Status</div>
          <div class="inf-status-grid">
            <article class="inf-tile">
              <div class="inf-tile-label">Owner</div>
              <div id="infLocalOwner" class="inf-tile-value">-</div>
            </article>
            <article class="inf-tile">
              <div class="inf-tile-label">Watch</div>
              <div id="infLocalWatch" class="inf-tile-value">-</div>
            </article>
            <article class="inf-tile">
              <div class="inf-tile-label">Node State</div>
              <div id="infLocalOps" class="inf-tile-value">Awaiting frontline sync.</div>
            </article>
            <article class="inf-tile">
              <div class="inf-tile-label">Your Position</div>
              <div id="infLocalYou" class="inf-tile-value">No local actions recorded yet.</div>
            </article>
          </div>
        </section>

        <section id="infLoreShell" class="inf-panel rv-surface">
          <div class="inf-panel-head">
            <div class="inf-panel-title">Intel Card</div>
            <span class="inf-chip inf-chip-muted">Tactical</span>
          </div>
          <article class="inf-intel-block">
            <div class="inf-intel-label">Control Impact</div>
            <div id="infUxReason" class="inf-intel-copy"></div>
          </article>
          <article class="inf-intel-block">
            <div class="inf-intel-label">War Momentum</div>
            <div id="infUxReward" class="inf-intel-copy"></div>
          </article>
          <div id="infUxLore" class="inf-intel-lore" style="display:none;"></div>
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
          <div class="inf-donate-note">Donation contributes to node pressure and weekly faction race.</div>
          <button id="infDonateBtn" type="button" class="inf-donate-confirm">Confirm donate</button>
        </div>

        <div id="infStatus" class="inf-status" style="display:none;"></div>
        <div id="infWeeklyPreview" style="display:none;"></div>
        <div id="infWeekly" style="display:none;"></div>
        <div id="infFoot" class="inf-foot"></div>
      </div>
      <button id="infSignalBackdrop" type="button" class="inf-signal-backdrop" style="display:none;" data-signal-close aria-label="Close Signal Core panel"></button>
      <section id="infSignalSheet" class="inf-signal-sheet" style="display:none;" aria-hidden="true" role="dialog" aria-label="Signal Core Inspect Panel">
        <div class="inf-signal-head">
          <div>
            <div class="inf-signal-title">Signal Core</div>
            <div id="infSignalSubtitle" class="inf-signal-sub">Phantom Nodes</div>
          </div>
          <button type="button" class="inf-signal-close" data-signal-close>Close</button>
        </div>
        <div class="inf-signal-visual">
          <div class="inf-signal-pulse-ring"></div>
          <div class="inf-signal-visual-copy">
            <div id="infSignalVisualState" class="inf-signal-visual-state">Secured</div>
            <div id="infSignalVisualHint" class="inf-signal-visual-hint">Neutral spectrum</div>
          </div>
        </div>
        <div class="inf-signal-grid">
          <article class="inf-signal-tile">
            <div class="inf-signal-tile-label">Control State</div>
            <div id="infSignalControlState" class="inf-signal-tile-value">SECURED | Neutral</div>
          </article>
          <article class="inf-signal-tile">
            <div class="inf-signal-tile-label">Pressure</div>
            <div id="infSignalPressure" class="inf-signal-tile-value">Quiet</div>
          </article>
          <article class="inf-signal-tile">
            <div class="inf-signal-tile-label">Watch Slots</div>
            <div id="infSignalWatch" class="inf-signal-tile-value">Open</div>
          </article>
          <article class="inf-signal-tile">
            <div class="inf-signal-tile-label">Node Value</div>
            <div id="infSignalValue" class="inf-signal-tile-value">Support</div>
          </article>
        </div>
        <div class="inf-signal-readout">
          <div class="inf-signal-readout-title">Tactical Readout</div>
          <div id="infSignalReadout" class="inf-signal-lines">
            <div class="inf-signal-line">Signal feed syncing.</div>
          </div>
        </div>
        <div class="inf-signal-pulse">
          <span id="infSignalPulseValue">Recent pulse: low traffic.</span>
        </div>
        <div class="inf-signal-return">Return to Actions to patrol or donate.</div>
        <div class="inf-signal-foot">
          <button type="button" class="inf-signal-close" data-signal-close>Close</button>
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
        if (_signalCoreOpen) setSignalCorePanelOpen(false);
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
    setSignalCorePanelOpen(false);

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

    setSignalCorePanelOpen(false);
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
    const foot = document.getElementById("infFoot");
    const statusEl = document.getElementById("infUxStatus");
    const controlChipEl = document.getElementById("infUxControlChip");
    const actionEl = document.getElementById("infUxAction");
    const valueEl = document.getElementById("infUxValue");
    const watchChipEl = document.getElementById("infUxWatchChip");
    const statusTextEl = document.getElementById("infUxStatusText");
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
    const localOwnerEl = document.getElementById("infLocalOwner");
    const localWatchEl = document.getElementById("infLocalWatch");
    const localYouEl = document.getElementById("infLocalYou");
    const localOpsEl = document.getElementById("infLocalOps");
    const donateShellEl = document.getElementById("infDonateShell");
    const patrolHelpEl = document.getElementById("infPatrolHelp");
    const watchHelpEl = document.getElementById("infWatchHelp");
    const donateHelpEl = document.getElementById("infDonateHelp");

    if (!leaderEl || !contEl || !controlLineEl || !foot || !statusEl || !actionEl || !valueEl || !statusTextEl || !reasonEl || !rewardEl || !loreEl) return;

    const applyVisualMood = (displayStatus) => {
      const mood = uxMoodTokens(displayStatus);
      if (cardEl) {
        cardEl.style.setProperty("--inf-accent", mood.border);
        cardEl.style.setProperty("--inf-accent-soft", mood.panel);
        cardEl.style.setProperty("--inf-chip-bg", mood.chipBg);
        cardEl.style.setProperty("--inf-chip-border", mood.chipBorder);
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
    };

    const setLocalDefaults = () => {
      if (coreStateEl) coreStateEl.textContent = "Stable";
      if (intelOwnerEl) intelOwnerEl.textContent = "-";
      if (intelWatchEl) intelWatchEl.textContent = "No watch roster";
      if (intelPresenceEl) intelPresenceEl.textContent = "No local actions recorded yet.";
      if (intelPressureEl) intelPressureEl.textContent = "0";
      if (intelWatchBarEl) intelWatchBarEl.style.width = "0%";
      if (intelPressureBarEl) intelPressureBarEl.style.width = "0%";
      if (intelPressureHintEl) intelPressureHintEl.textContent = "Waiting for frontline pressure.";
      if (localOwnerEl) localOwnerEl.textContent = "-";
      if (localWatchEl) localWatchEl.textContent = "No watch roster";
      if (localYouEl) localYouEl.textContent = "No local actions recorded yet.";
      if (localOpsEl) localOpsEl.textContent = "Awaiting frontline sync.";
      if (patrolHelpEl) patrolHelpEl.textContent = "Patrol now to build pressure on this frontline.";
      if (watchHelpEl) watchHelpEl.textContent = "Watch opens when siege pressure spikes.";
      if (donateHelpEl) donateHelpEl.textContent = "Donate to reinforce your faction's weekly momentum.";
      paintUxPill(controlChipEl, "Neutral", {
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.12)",
        color: "#d6e7fb",
      }, true);
      paintUxPill(watchChipEl, "", {}, false);
      paintSignalCorePanel({
        nodeId,
        owner: "",
        displayStatus: "CALM",
        displayLabel: "Secured",
        valueLabel: "",
        watchUsed: 0,
        watchMax: 0,
        watchText: "No watch roster",
        viewerPressure: 0,
        leaderPressure: 0,
        controlText: "Frontline data is syncing.",
      });
    };

    if (!info || !Object.keys(info).length) {
      leaderEl.textContent = "-";
      contEl.style.display = "none";
      contEl.textContent = "";
      controlLineEl.textContent = "Frontline data is syncing.";
      foot.textContent = "";

      paintUxPill(statusEl, "Secured", uxToneStyles("CALM"));
      applyVisualMood("CALM");
      if (coreStateEl) coreStateEl.textContent = "Secured";
      paintUxPill(actionEl, "Pressure stable", {
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
    const controlText = owner ? `${fmtFaction(owner)} controls this node.` : "Neutral node.";
    const valueLabel = uxValueLabel(ux.valueTier, ux.valueMultiplier);

    const displayStatus = String(ux.displayStatus || "").trim().toUpperCase();
    applyVisualMood(displayStatus);
    contEl.style.display = "none";
    contEl.textContent = "";

    const viewerFaction = normalizeFaction(_faction || getCanonicalFaction() || info?.youFaction || "");
    const viewerPressure = viewerFaction ? Number(s?.[viewerFaction] || 0) : 0;
    const leaderPressure = Number(info?.leaderValue || 0);
    const watchUsed = Number(info?.guardSlotsUsed || info?.watchCount || 0);
    const watchMax = Number(info?.guardSlotsMax || info?.maxDefenders || 0);
    const watchText = watchMax > 0
      ? `${watchUsed}/${watchMax} occupied`
      : (watchUsed > 0 ? `${watchUsed} active` : "No watch roster");
    const watchPct = watchMax > 0 ? Math.max(0, Math.min(100, Math.round((watchUsed / watchMax) * 100))) : 0;
    const pressureChipLabel = (displayStatus === "SIEGE_LIVE" || displayStatus === "SIEGE_FORMING" || displayStatus === "CONTESTED" || displayStatus === "HOT")
      ? "Pressure rising"
      : "Pressure stable";
    const watchActive = displayStatus === "SIEGE_LIVE" || displayStatus === "SIEGE_FORMING" || watchUsed > 0;

    leaderEl.textContent = leaderName ? `${leaderName}${leaderSuffix}` : (owner ? fmtFaction(owner) : "No leader yet");
    controlLineEl.textContent = controlText;

    const primaryStatus = uxPrimaryStatusLabel(ux.displayStatus, ux.displayLabel);
    if (coreStateEl) coreStateEl.textContent = primaryStatus;
    paintUxPill(statusEl, primaryStatus, uxToneStyles(ux.displayStatus));
    paintUxPill(controlChipEl, owner ? "Controlled" : "Neutral", {
      background: owner ? "rgba(120,255,220,.12)" : "rgba(255,255,255,.05)",
      border: owner ? "1px solid rgba(120,255,220,.24)" : "1px solid rgba(255,255,255,.12)",
      color: owner ? "#d9fff2" : "#d6e7fb",
    }, true);
    paintUxPill(actionEl, pressureChipLabel, {
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.12)",
      color: "#e6f0ff",
    });
    paintUxPill(valueEl, valueLabel ? valueLabel.toUpperCase() : "", {
      background: "rgba(255,210,120,.12)",
      border: "1px solid rgba(255,210,120,.18)",
      color: "#ffe9b8",
    }, !!valueLabel);
    paintUxPill(watchChipEl, watchActive ? "Watch active" : "", {
      background: "rgba(255,186,116,.14)",
      border: "1px solid rgba(255,186,116,.24)",
      color: "#ffe0be",
    }, watchActive);

    statusTextEl.textContent = uxStatusText(ux.displayStatus);
    reasonEl.textContent = ux.reasonText || "Control here shapes the local rivalry line.";
    rewardEl.textContent = ux.rewardText || "Contribution here converts into faction war progress.";

    const loreLines = resolveNodeLoreLines(nodeId, info);
    if (loreLines.length) {
      loreEl.style.display = "block";
      loreEl.innerHTML = loreLines.map((line) => `<div class="inf-intel-line">${esc(line)}</div>`).join("");
    } else {
      loreEl.style.display = "none";
      loreEl.textContent = "";
    }

    if (localOwnerEl) localOwnerEl.textContent = owner ? fmtFaction(owner) : "Neutral";
    if (localWatchEl) localWatchEl.textContent = watchText;
    if (intelOwnerEl) intelOwnerEl.textContent = owner ? fmtFaction(owner) : "Neutral";
    if (intelWatchEl) intelWatchEl.textContent = watchText;
    if (intelWatchBarEl) {
      intelWatchBarEl.style.width = `${watchPct}%`;
      if (watchPct >= 85) {
        intelWatchBarEl.style.background = "repeating-linear-gradient(90deg,rgba(255,138,120,.95) 0 8px, rgba(255,92,92,.86) 8px 12px)";
      } else if (watchPct >= 45) {
        intelWatchBarEl.style.background = "repeating-linear-gradient(90deg,rgba(255,206,148,.92) 0 8px, rgba(255,140,112,.82) 8px 12px)";
      } else {
        intelWatchBarEl.style.background = "repeating-linear-gradient(90deg,rgba(170,214,255,.9) 0 8px, rgba(120,178,255,.8) 8px 12px)";
      }
    }

    if (localYouEl) {
      const my = (_weekly && typeof _weekly.my === "object") ? _weekly.my : null;
      if (my) {
        const rankTxt = my.factionRank ? `#${my.factionRank}` : (my.overallRank ? `#${my.overallRank}` : "-");
        localYouEl.textContent = `Score ${Number(my.score || 0)} | Rank ${rankTxt} | Days ${Number(my.activeDays || 0)}${viewerPressure > 0 ? ` | Pressure ${viewerPressure}` : ""}`;
      } else if (viewerPressure > 0) {
        localYouEl.textContent = `Local pressure ${viewerPressure}.`;
      } else {
        localYouEl.textContent = "Start with patrol to record local war contribution.";
      }
    }
    if (intelPresenceEl) {
      if (viewerPressure > 0) intelPresenceEl.textContent = `Faction pressure active (${viewerPressure}).`;
      else intelPresenceEl.textContent = "No local pressure yet.";
    }
    if (intelPressureEl) {
      if (viewerPressure > 0 && leaderPressure > 0) {
        intelPressureEl.textContent = `${viewerPressure} / lead ${leaderPressure}`;
      } else if (viewerPressure > 0) {
        intelPressureEl.textContent = String(viewerPressure);
      } else if (leaderPressure > 0) {
        intelPressureEl.textContent = `Lead ${leaderPressure}`;
      } else {
        intelPressureEl.textContent = "0";
      }
      if (intelPressureBarEl) {
        const maxPressure = Math.max(
          1,
          Number(s?.rogue_byte || 0),
          Number(s?.echo_wardens || 0),
          Number(s?.pack_burners || 0),
          Number(s?.inner_howl || 0),
          Number(leaderPressure || 0)
        );
        const ratio = viewerPressure > 0 ? (viewerPressure / maxPressure) : 0;
        const pct = viewerPressure > 0 ? Math.max(10, Math.min(100, Math.round(ratio * 100))) : 0;
        intelPressureBarEl.style.width = `${pct}%`;
      }
      if (intelPressureHintEl) {
        if (viewerPressure > 0 && leaderPressure > 0 && viewerPressure >= leaderPressure) {
          intelPressureHintEl.textContent = "Your faction is setting local tempo.";
        } else if (viewerPressure > 0) {
          intelPressureHintEl.textContent = "Pressure building. Keep patrol cycles active.";
        } else if (leaderPressure > 0) {
          intelPressureHintEl.textContent = "Enemy pressure present. Counter-pressure advised.";
        } else {
          intelPressureHintEl.textContent = "Waiting for frontline pressure.";
        }
      }
    }
    if (localOpsEl) {
      const valueTxt = valueLabel || "Support node";
      localOpsEl.textContent = `${primaryStatus} | ${valueTxt} | ${ux.actionHint || "Patrol"}`;
    }
    paintSignalCorePanel({
      nodeId,
      owner,
      displayStatus,
      displayLabel: ux.displayLabel,
      valueLabel,
      watchUsed,
      watchMax,
      watchText,
      viewerPressure,
      leaderPressure,
      controlText,
    });

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
    foot.textContent = `Hourly pressure - RB ${s.rogue_byte || 0} | EW ${s.echo_wardens || 0} | PB ${s.pack_burners || 0} | IH ${s.inner_howl || 0}`;
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


