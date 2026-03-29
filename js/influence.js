// js/influence.js — Influence MVP (Patrol + Donate) for map nodes
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
    return FACTION_LABELS[key] || key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
  }

  function shortUid(uid) {
    const s = String(uid || "");
    if (!s) return "—";
    if (s.length <= 10) return s;
    return `${s.slice(0, 4)}…${s.slice(-4)}`;
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
  if (!host) return;

  const w = _weekly || null;
  if (!w || !w.weekId) {
    host.style.display = "none";
    host.innerHTML = "";
    return;
  }

  const my = w.my || null;
  const rewards = Array.isArray(w.activeTempRewards) ? w.activeTempRewards : [];
  const factions = Array.isArray(w.factions) ? w.factions : [];
  const last = w.lastWinners || {};

  const topFactions = factions.slice(0, 3);

  const statCard = ({ label, value, accent = "#7dd3fc", muted = false }) => `
    <div style="
      padding:10px 12px;
      border-radius:14px;
      background:${muted ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.05)"};
      border:1px solid rgba(255,255,255,.08);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
    ">
      <div style="font-size:10px; letter-spacing:.05em; text-transform:uppercase; opacity:.62;">${esc(label)}</div>
      <div style="
        margin-top:4px;
        font-size:18px;
        line-height:1.05;
        font-weight:800;
        color:${accent};
        text-shadow:0 0 14px rgba(255,255,255,.04);
      ">${esc(value)}</div>
    </div>
  `;

  const qualifyTone = my?.qualified
    ? {
        bg: "rgba(110,255,170,.08)",
        bd: "rgba(110,255,170,.18)",
        fg: "#8ff7b5",
        text: "Qualified",
      }
    : {
        bg: "rgba(255,190,90,.08)",
        bd: "rgba(255,190,90,.16)",
        fg: "#ffcf85",
        text: "Not yet",
      };

  const myProgressHtml = my
    ? `
      <div style="margin-top:12px;">
        <div style="font-size:12px;font-weight:800;margin-bottom:8px;opacity:.92;">My Progress</div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${statCard({ label: "Score", value: my.score || 0, accent: "#79e8ff" })}
          ${statCard({ label: "Rank", value: "#" + (my.factionRank || my.overallRank || "—"), accent: "#b692ff" })}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
          ${statCard({ label: "Tickets", value: my.tickets || 0, accent: "#ffd36f", muted: true })}
          <div style="
            padding:10px 12px;
            border-radius:14px;
            background:${qualifyTone.bg};
            border:1px solid ${qualifyTone.bd};
            box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
          ">
            <div style="font-size:10px; letter-spacing:.05em; text-transform:uppercase; opacity:.62;">Status</div>
            <div style="
              margin-top:4px;
              font-size:18px;
              line-height:1.05;
              font-weight:800;
              color:${qualifyTone.fg};
            ">${qualifyTone.text}</div>
          </div>
        </div>

        <div style="margin-top:8px;font-size:11px;opacity:.66;">
          Need ${esc(w?.qualifyThreshold?.score ?? 60)} score and ${esc(w?.qualifyThreshold?.activeDays ?? 2)} active days.
        </div>
      </div>
    `
    : `
      <div style="
        margin-top:12px;
        padding:10px 12px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.06);
        font-size:12px;
        opacity:.72;
      ">
        No weekly contribution yet.
      </div>
    `;

  const boardHtml = topFactions.length
    ? `
      <div style="display:grid;gap:7px;">
        ${topFactions.map((row, idx) => {
          const isLeader = idx === 0;
          return `
            <div style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:10px;
              padding:9px 10px;
              border-radius:12px;
              background:${isLeader ? "rgba(255,210,110,.08)" : "rgba(255,255,255,.04)"};
              border:1px solid ${isLeader ? "rgba(255,210,110,.18)" : "rgba(255,255,255,.06)"};
              box-shadow:${isLeader ? "0 0 18px rgba(255,210,110,.05)" : "none"};
            ">
              <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                <div style="
                  width:22px;height:22px;border-radius:999px;
                  display:flex;align-items:center;justify-content:center;
                  font-size:11px;font-weight:800;
                  background:${isLeader ? "rgba(255,210,110,.16)" : "rgba(255,255,255,.06)"};
                  border:1px solid ${isLeader ? "rgba(255,210,110,.24)" : "rgba(255,255,255,.08)"};
                  color:${isLeader ? "#ffd98a" : "#ddd"};
                  flex:0 0 auto;
                ">${idx + 1}</div>

                <div style="min-width:0;">
                  <div style="
                    font-size:12px;
                    font-weight:${isLeader ? "800" : "700"};
                    color:${isLeader ? "#fff0c8" : "#f3f3f3"};
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                  ">${esc(fmtFaction(row.faction))}</div>
                  <div style="font-size:10px;opacity:.56;margin-top:1px;">
                    ${esc(row.qualifiedCount || 0)} qualified · ${esc(row.playerCount || 0)} players
                  </div>
                </div>
              </div>

              <div style="
                font-size:15px;
                font-weight:800;
                color:${isLeader ? "#ffd98a" : "#fff"};
                flex:0 0 auto;
              ">${esc(row.score || 0)}</div>
            </div>
          `;
        }).join("")}
      </div>
    `
    : `
      <div style="
        padding:10px 12px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.06);
        font-size:12px;
        opacity:.72;
      ">
        No faction standings yet.
      </div>
    `;

  const rewardsHtml = rewards.length
    ? `
      <div style="display:grid;gap:8px;">
        ${rewards.map((r) => `
          <div style="
            padding:10px 12px;
            border-radius:12px;
            background:rgba(255,255,255,.045);
            border:1px solid rgba(255,255,255,.07);
          ">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div style="min-width:0;">
                <div style="
                  font-size:13px;
                  font-weight:800;
                  color:#f6f6f6;
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                ">${esc(r.shortLabel || r.label || r.id || "Weekly Reward")}</div>
                <div style="font-size:11px;opacity:.62;margin-top:3px;">
                  Expires in ${esc(fmtRemain(r.expiresInSec))}
                </div>
              </div>

              <div style="
                font-size:10px;
                font-weight:700;
                padding:5px 8px;
                border-radius:999px;
                background:rgba(255,255,255,.06);
                border:1px solid rgba(255,255,255,.08);
                opacity:.92;
                flex:0 0 auto;
              ">${esc(rewardTypeLabel(r.type))}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `
    : `
      <div style="
        padding:10px 12px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.06);
        font-size:12px;
        opacity:.72;
      ">
        No active weekly rewards yet.
      </div>
    `;

  const lastHtml = last && (last.weekId || last.faction || last.mvpUid || last.raffleUid)
    ? `
      <div style="
        display:grid;
        gap:8px;
        padding:10px 12px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.06);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="font-size:12px;opacity:.68;">Winning Faction</div>
          <div style="font-size:12px;font-weight:700;">${esc(fmtFaction(last.faction))}</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="font-size:12px;opacity:.68;">MVP</div>
          <div style="font-size:12px;font-weight:700;">${esc(shortUid(last.mvpUid))}</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="font-size:12px;opacity:.68;">Raffle</div>
          <div style="font-size:12px;font-weight:700;">${esc(shortUid(last.raffleUid))}</div>
        </div>
      </div>
    `
    : `
      <div style="
        padding:10px 12px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.06);
        font-size:12px;
        opacity:.72;
      ">
        No last-week result yet.
      </div>
    `;

  host.style.display = "block";
  host.innerHTML = `
    <div style="
      margin-top:12px;
      padding:12px;
      border-radius:16px;
      background:
        radial-gradient(circle at top right, rgba(120,180,255,.08), transparent 35%),
        radial-gradient(circle at top left, rgba(180,120,255,.06), transparent 32%),
        rgba(255,255,255,.035);
      border:1px solid rgba(255,255,255,.08);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
    ">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
        <div>
          <div style="font-weight:900;font-size:15px;line-height:1.15;">Weekly War</div>
          <div style="font-size:11px;opacity:.65;margin-top:3px;">
            Faction rivalry for weekly rewards
          </div>
        </div>

        <div style="display:grid;gap:6px;justify-items:end;">
          <div style="
            font-size:10px;
            font-weight:700;
            padding:5px 8px;
            border-radius:999px;
            background:rgba(255,255,255,.06);
            border:1px solid rgba(255,255,255,.08);
            opacity:.9;
          ">${esc(w.weekId)}</div>

          <div style="
            font-size:10px;
            font-weight:700;
            padding:5px 8px;
            border-radius:999px;
            background:rgba(120,180,255,.08);
            border:1px solid rgba(120,180,255,.14);
            color:#bfe8ff;
          ">Ends in ${esc(fmtRemain(w.endsInSec))}</div>
        </div>
      </div>

      ${myProgressHtml}

      <div style="margin-top:14px;">
        <div style="font-size:12px;font-weight:800;margin-bottom:8px;opacity:.92;">Faction Race</div>
        ${boardHtml}
      </div>

      <div style="margin-top:14px;">
        <div style="font-size:12px;font-weight:800;margin-bottom:8px;opacity:.92;">Active Weekly Rewards</div>
        ${rewardsHtml}
      </div>

      <div style="margin-top:14px;">
        <div style="font-size:12px;font-weight:800;margin-bottom:8px;opacity:.92;">Last Winners</div>
        ${lastHtml}
      </div>
    </div>
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

      // fallback: jeśli brak TG popup, zwróć zapisane / pusty
      if (!tg?.showPopup) return resolve(_faction || "");

      const pick = (key) => { setFaction(key); resolve(key); };

      const popup1 = () => tg.showPopup({
        title: "Choose faction",
        message: "Pick your side.",
        buttons: [
          { id: "rb", type: "default", text: "Rogue Byte" },
          { id: "ew", type: "default", text: "Echo Wardens" },
          { id: "more", type: "default", text: "More…" },
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
          { id: "back", type: "default", text: "← Back" },
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
  // Frontend truth → cache
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
    if (reason === "BAD_NODE") return "This node isn’t active yet.";
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
        10px
        calc(env(safe-area-inset-bottom, 0px) + 16px)
        10px;
      box-sizing: border-box;
      overflow: hidden;
      background: rgba(0,0,0,.55);
      z-index: 2147483647;
      transform: none;
    `;

    wrap.innerHTML = `
      <div id="influenceCard" style="
        width: min(92vw, 420px);
        background: rgba(18,18,22,.98);
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 16px;
        box-shadow: 0 18px 60px rgba(0,0,0,.55);
        padding: 14px 14px 12px;
        max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 40px);
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div>
            <div id="infTitle" style="font-weight:700;font-size:16px;line-height:1.2;">Influence</div>
            <div id="infSub" style="opacity:.75;font-size:12px;margin-top:2px;"></div>
          </div>
          <button data-close type="button" style="
            border:0;background:rgba(255,255,255,.08);color:#fff;
            border-radius:10px;padding:8px 10px;cursor:pointer
          ">✕</button>
        </div>

        <div id="infLeaderLine" style="margin-top:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,.06);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <div style="font-size:12px;opacity:.75;">Current leader</div>
              <div id="infLeader" style="font-weight:700;margin-top:2px;">—</div>
            </div>
            <div id="infContested" style="
              display:none;
              font-size:12px;
              padding:6px 10px;
              border-radius:999px;
              background:rgba(255,170,0,.15);
              border:1px solid rgba(255,170,0,.25);
              color:#ffb84d;
            ">⚠ contested</div>
          </div>
        </div>

        <div id="infUxCard" style="
          margin-top:10px;
          padding:10px 12px;
          border-radius:12px;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.08);
        ">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
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
            ">Calm</span>
            <span id="infUxAction" style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              min-height:24px;
              padding:4px 10px;
              border-radius:999px;
              font-size:11px;
              font-weight:800;
              background:rgba(255,255,255,.08);
              border:1px solid rgba(255,255,255,.12);
            ">Patrol</span>
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
          <div id="infUxStatusText" style="margin-top:8px;font-size:12px;opacity:.84;">This node is stable right now.</div>
          <div id="infUxReason" style="margin-top:6px;font-size:12px;line-height:1.35;opacity:.92;"></div>
          <div id="infUxReward" style="margin-top:4px;font-size:12px;line-height:1.35;opacity:.76;"></div>
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button id="infPatrolBtn" type="button" style="
            flex:1; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: rgba(120,255,220,.12);
            border: 1px solid rgba(120,255,220,.22);
            color:#eafff8; font-weight:700;
          ">Patrol</button>

          <button id="infDonateToggle" type="button" style="
            flex:1; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: rgba(170,140,255,.12);
            border: 1px solid rgba(170,140,255,.22);
            color:#f5f0ff; font-weight:700;
          ">Donate</button>
        </div>

        <div id="infDonateBox" style="display:none; margin-top:12px;">
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="infAsset" style="
              flex:1; padding:10px 10px; border-radius:12px;
              background:rgba(255,255,255,.06); color:#fff; border:1px solid rgba(255,255,255,.10);
            ">
              <option value="scrap">scrap</option>
              <option value="rune_dust">rune_dust</option>
              <option value="bones">bones</option>
            </select>
            <input id="infAmount" type="number" min="1" step="1" value="10" style="
              width:120px; padding:10px 10px; border-radius:12px;
              background:rgba(255,255,255,.06); color:#fff; border:1px solid rgba(255,255,255,.10);
            "/>
          </div>

          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="infAmt" type="button" data-v="10" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+10</button>
            <button class="infAmt" type="button" data-v="50" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+50</button>
            <button class="infAmt" type="button" data-v="100" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+100</button>
          </div>

          <button id="infDonateBtn" type="button" style="
            width:100%; margin-top:10px; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: rgba(255,210,120,.12);
            border: 1px solid rgba(255,210,120,.22);
            color:#fff6e8; font-weight:800;
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

        <div id="infWeekly" style="display:none;"></div>

        <div id="infFoot" style="margin-top:10px; font-size:12px; opacity:.65;"></div>
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
    if (subEl) subEl.textContent = nodeId;

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
    if (key === "SIEGE_LIVE") return "A live battle for this node is underway.";
    if (key === "SIEGE_FORMING") return "An assault is gathering here.";
    if (key === "SIEGE_COOLDOWN") return "This frontline is resetting after a siege.";
    if (key === "CONTESTED") return "Control is being actively challenged.";
    if (key === "HOT") return "Pressure is rising here.";
    if (key === "FORTIFIED") return "This node is strongly secured.";
    return "This node is stable right now.";
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
    const foot = document.getElementById("infFoot");
    const statusEl = document.getElementById("infUxStatus");
    const actionEl = document.getElementById("infUxAction");
    const valueEl = document.getElementById("infUxValue");
    const statusTextEl = document.getElementById("infUxStatusText");
    const reasonEl = document.getElementById("infUxReason");
    const rewardEl = document.getElementById("infUxReward");

    if (!leaderEl || !contEl || !foot || !statusEl || !actionEl || !valueEl || !statusTextEl || !reasonEl || !rewardEl) return;

    if (!info || !Object.keys(info).length) {
      leaderEl.textContent = "—";
      contEl.style.display = "none";
      foot.textContent = "";
      leaderEl.textContent = "-";
      paintUxPill(statusEl, "Calm", uxToneStyles("CALM"));
      paintUxPill(actionEl, "Patrol", {
        background: "rgba(120,255,220,.12)",
        border: "1px solid rgba(120,255,220,.22)",
        color: "#dffff3",
      });
      paintUxPill(valueEl, "", {}, false);
      statusTextEl.textContent = "This node is stable right now.";
      reasonEl.textContent = "Why: This node is stable right now.";
      rewardEl.textContent = "Gain: Helping here supports weekly faction progress.";
      setPatrolButtonLabel("Patrol");
      return;
    }

    const leader = info.leader || "none";
    leaderEl.textContent = `${leader} (${info.leaderValue || 0})`;
    contEl.style.display = info.contested ? "inline-flex" : "none";

    const s = info.scores || {};
    const ux = resolveNodeUx(nodeId, info);
    const owner = normalizeFaction(info?.effectiveOwnerFaction || info?.ownerFaction || info?.owner || "");
    const leaderFaction = normalizeFaction(info?.leader || "");
    const leaderName = leaderFaction ? fmtFaction(leaderFaction) : String(info?.leader || "").trim();
    const leaderValue = Number(info?.leaderValue || 0);
    const leaderSuffix = leaderName && leaderValue > 0 ? ` (${leaderValue})` : "";
    const controlText = owner ? `${fmtFaction(owner)} control` : "Neutral control";
    const valueLabel = uxValueLabel(ux.valueTier, ux.valueMultiplier);

    leaderEl.textContent = leaderName ? `${leaderName}${leaderSuffix}` : controlText;
    contEl.style.display = "none";
    contEl.textContent = "";
    paintUxPill(statusEl, ux.displayLabel || ux.displayStatus || "CALM", uxToneStyles(ux.displayStatus));
    paintUxPill(actionEl, ux.actionHint || "Patrol", {
      background: "rgba(120,255,220,.12)",
      border: "1px solid rgba(120,255,220,.22)",
      color: "#dffff3",
    });
    paintUxPill(valueEl, valueLabel, {
      background: "rgba(255,210,120,.12)",
      border: "1px solid rgba(255,210,120,.18)",
      color: "#ffe9b8",
    }, !!valueLabel);
    statusTextEl.textContent = uxStatusText(ux.displayStatus);
    reasonEl.textContent = `Why: ${ux.reasonText || "This node is stable right now."}`;
    rewardEl.textContent = `Gain: ${ux.rewardText || "Helping here supports weekly faction progress."}`;
    setPatrolButtonLabel(patrolLabelForAction(ux.actionHint));
    foot.textContent = `RB ${s.rogue_byte || 0} · EW ${s.echo_wardens || 0} · PB ${s.pack_burners || 0} · IH ${s.inner_howl || 0}`;
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
      toast(`Donated ${amount} ${asset} → +${r.gain} influence${hq}`);
      setStatus(`Donated ${amount} ${asset} → +${r.gain} influence${hq}`, "ok");

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
