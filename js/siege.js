// js/siege.js
(function () {
  const Siege = {};
  let _apiPost = null, _tg = null, _dbg = false;

  const ACTION_IDS = [
    "siegeRefresh",
    "siegeWatch",
    "siegeUnwatch",
    "siegeStart",
    "siegeJoin",
    "siegeLaunch",
    "siegeNext"
  ];

  const DEFAULT_LABELS = {
    siegeRefresh: "Refresh",
    siegeWatch: "Take Watch",
    siegeUnwatch: "Leave Watch",
    siegeStart: "Start Siege",
    siegeJoin: "Join Siege",
    siegeLaunch: "Launch",
    siegeNext: "Next Fight"
  };

  let _lastRaw = null;
  let _busy = false;
  let _busyBtnId = "";
  let _busyBtnLabel = "Processing...";

  function getApiPost() {
    const fn =
      _apiPost ||
      window.apiPost ||
      window.S?.apiPost ||
      null;

    return (typeof fn === "function") ? fn : null;
  }

  function qs(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function rid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function showAlert(msg) {
    const text = String(msg || "Unknown error");
    try {
      _tg?.showAlert?.(text);
    } catch (_) {
      try { alert(text); } catch (_) {}
    }
  }

  function normFaction(v) {
    return String(v || "").trim().toLowerCase();
  }

  function factionLabel(f) {
    const key = normFaction(f);
    const map = {
      rogue_byte: "Rogue Byte",
      echo_wardens: "Echo Wardens",
      pack_burners: "Pack Burners",
      inner_howl: "Inner Howl"
    };
    if (!key) return "Neutral";
    return map[key] || key.split("_").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" ");
  }

  function normalize(raw) {
    return raw || null;
  }

  function getNode(raw) {
    const out = normalize(raw) || {};
    if (out.siegeNode && typeof out.siegeNode === "object") return out.siegeNode;
    if (out.data?.siegeNode && typeof out.data.siegeNode === "object") return out.data.siegeNode;
    if (out.node && typeof out.node === "object") return out.node;
    if (out.data && typeof out.data === "object" && (out.data.nodeId || out.data.ownerFaction || out.data.currentSiege || out.data.siegeFeed)) return out.data;
    if (out.nodeId || out.ownerFaction || out.currentSiege || out.siegeFeed) return out;
    return {};
  }

  function getCurrentSiege(node) {
    return node?.currentSiege || node?.siege || node?.activeSiege || null;
  }

  function getSiegeStatus(node) {
    const cur = getCurrentSiege(node);
    return String(cur?.status || "").trim().toUpperCase();
  }

  function isNeutralNode(node) {
    const owner = normFaction(node?.ownerFaction || node?.owner || "");
    return !owner;
  }

  function getYouFaction(raw, node) {
    return normFaction(raw?.you?.faction || node?.youFaction || "");
  }

  function getYouUid(raw, node) {
    const tgUid =
      _tg?.initDataUnsafe?.user?.id ||
      window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
      "";
    return String(raw?.you?.uid || node?.youUid || tgUid || "").trim();
  }

  function defendersList(node) {
    if (Array.isArray(node?.siegeDefenders)) return node.siegeDefenders;
    if (Array.isArray(node?.defenders)) return node.defenders;
    if (Array.isArray(node?.watchers)) return node.watchers;
    return [];
  }

  function attackersList(node) {
    const cur = getCurrentSiege(node);
    return Array.isArray(cur?.attackers) ? cur.attackers : [];
  }

  function curDefendersList(node) {
    const cur = getCurrentSiege(node);
    return Array.isArray(cur?.defenders) ? cur.defenders : [];
  }

  function fightsList(node) {
    const cur = getCurrentSiege(node);
    return Array.isArray(cur?.fightHistory) ? cur.fightHistory : [];
  }

  function siegeFeedList(node) {
    if (Array.isArray(node?.siegeFeed)) return node.siegeFeed;
    if (Array.isArray(node?.feed)) return node.feed;
    return [];
  }

  function isYouWatching(raw, node) {
    const youUid = getYouUid(raw, node);
    if (!youUid) return false;
    return defendersList(node).some(x => String(x?.uid || "").trim() === youUid);
  }

  function guardUsed(node) {
    const explicit = Number(node?.guardSlotsUsed);
    if (Number.isFinite(explicit) && explicit >= 0) return explicit;
    return defendersList(node).length;
  }

  function guardMax(node) {
    const explicitA = Number(node?.guardSlotsMax);
    if (Number.isFinite(explicitA) && explicitA > 0) return explicitA;
    const explicitB = Number(node?.guardSlots);
    if (Number.isFinite(explicitB) && explicitB > 0) return explicitB;
    return 4;
  }

  function cooldownLeftSec(node) {
    const explicitA = Number(node?.cooldownLeftSec);
    if (Number.isFinite(explicitA) && explicitA >= 0) return explicitA;

    const explicitB = Number(node?.siegeCooldownLeftSec);
    if (Number.isFinite(explicitB) && explicitB >= 0) return explicitB;

    const until = Number(node?.siegeCooldownUntil || 0);
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, until - now);
  }

  function cooldownLabel(node) {
    const left = cooldownLeftSec(node);
    if (left <= 0) return "Ready";
    const m = Math.floor(left / 60);
    const s = left % 60;
    if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
    return `${s}s`;
  }

  function feedKindLabel(kind) {
    const key = String(kind || "").trim().toLowerCase();
    const map = {
      watch_join: "Watch Joined",
      watch_leave: "Watch Left",
      siege_start: "Siege Started",
      siege_join: "Joined Siege",
      siege_launch: "Siege Launched",
      next_fight: "Next Fight",
      fight: "Fight",
      result: "Result",
      claim: "Claimed",
      event: "Event"
    };
    return map[key] || (key ? key.replaceAll("_", " ") : "Event");
  }

  function fmtClock(ts) {
    try {
      const n = Number(ts || 0);
      if (!n) return "";
      return new Date(n * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return "";
    }
  }

  function renderFeedHTML(feed) {
    const rows = Array.isArray(feed) ? feed : [];
    return `
      <div class="siege-card">
        <div style="font-weight:800;margin-bottom:8px">Siege Feed</div>
        ${
          rows.length
            ? `
              <div class="siege-feed-list">
                ${rows.map(item => {
                  const kind = esc(feedKindLabel(item?.kind));
                  const time = esc(fmtClock(item?.ts));
                  const name = esc(item?.name || "");
                  const faction = esc(item?.faction ? factionLabel(item.faction) : "");
                  const text = esc(item?.text || "");
                  return `
                    <div class="siege-feed-item">
                      <div class="siege-feed-meta">
                        <span class="siege-feed-kind">${kind}</span>
                        ${time ? `<span class="siege-feed-time">${time}</span>` : ""}
                        ${name ? `<span class="siege-feed-name">${name}</span>` : ""}
                        ${faction ? `<span class="siege-feed-faction">${faction}</span>` : ""}
                      </div>
                      <div class="siege-feed-text">${text || "—"}</div>
                    </div>
                  `;
                }).join("")}
              </div>
            `
            : `<div class="siege-muted">No siege activity yet.</div>`
        }
      </div>
    `;
  }

  function setBtn(id, visible, label) {
    const el = qs(id);
    if (!el) return;
    const nextLabel = label || DEFAULT_LABELS[id] || el.textContent || "";
    el.hidden = !visible;
    el.style.display = visible ? "" : "none";
    el.disabled = !visible;
    el.textContent = nextLabel;
    el.dataset.baseLabel = nextLabel;
  }

  function applyBusyState() {
    ACTION_IDS.forEach(id => {
      const el = qs(id);
      if (!el) return;
      el.classList.remove("is-busy");
    });

    if (!_busy) return;

    ACTION_IDS.forEach(id => {
      const el = qs(id);
      if (!el) return;
      el.disabled = true;
    });

    if (_busyBtnId) {
      const btn = qs(_busyBtnId);
      if (btn) {
        btn.hidden = false;
        btn.style.display = "";
        btn.disabled = true;
        btn.classList.add("is-busy");
        btn.textContent = _busyBtnLabel || "Processing...";
      }
    }
  }

  function setBusyState(isBusy, btnId = "", busyLabel = "Processing...") {
    _busy = !!isBusy;
    _busyBtnId = _busy ? String(btnId || "") : "";
    _busyBtnLabel = _busy ? String(busyLabel || "Processing...") : "Processing...";

    if (_lastRaw) {
      updateActionBar(_lastRaw);
    } else if (_busy) {
      applyBusyState();
    } else {
      resetActionBar();
    }
  }

  function resetActionBar() {
    setBtn("siegeRefresh", true, "Refresh");
    setBtn("siegeWatch", false, "Take Watch");
    setBtn("siegeUnwatch", false, "Leave Watch");
    setBtn("siegeStart", false, "Start Siege");
    setBtn("siegeJoin", false, "Join Siege");
    setBtn("siegeLaunch", false, "Launch");
    setBtn("siegeNext", false, "Next Fight");
    applyBusyState();
  }

  function updateActionBar(raw) {
    const out = normalize(raw) || {};
    if (out.ok === false) {
      resetActionBar();
      return;
    }

    const node = getNode(out);
    const cur = getCurrentSiege(node);
    const status = getSiegeStatus(node);

    const youFaction = getYouFaction(out, node);
    const ownerFaction = normFaction(node?.ownerFaction || node?.owner || "");
    const attackerFaction = normFaction(cur?.attackerFaction || "");
    const neutral = !ownerFaction;
    const youWatching = isYouWatching(out, node);

    const hasForming = status === "FORMING";
    const hasRunning = status === "RUNNING";
    const hasActiveSiege = hasForming || hasRunning;

    const showWatch =
      !neutral &&
      !hasActiveSiege &&
      !!ownerFaction &&
      youFaction === ownerFaction &&
      !youWatching;

    const showUnwatch =
      !neutral &&
      !hasActiveSiege &&
      !!ownerFaction &&
      youFaction === ownerFaction &&
      youWatching;

    const showStart =
      !!youFaction &&
      !hasActiveSiege &&
      (
        neutral ||
        (!!ownerFaction && ownerFaction !== youFaction)
      );

    const showJoin =
      !!youFaction &&
      hasForming &&
      !!attackerFaction &&
      attackerFaction === youFaction;

    const showLaunch =
      hasForming &&
      !!attackerFaction &&
      attackerFaction === youFaction;

    const showNext = hasRunning;

    setBtn("siegeRefresh", true, "Refresh");
    setBtn("siegeWatch", showWatch, "Take Watch");
    setBtn("siegeUnwatch", showUnwatch, "Leave Watch");
    setBtn("siegeStart", showStart, neutral ? "Claim Node" : "Start Siege");
    setBtn("siegeJoin", showJoin, "Join Siege");
    setBtn("siegeLaunch", showLaunch, "Launch");
    setBtn("siegeNext", showNext, "Next Fight");

    applyBusyState();
  }

  function ensureModal() {
    if (qs("siegeBack")) return;

    const wrap = document.createElement("div");
    wrap.id = "siegeBack";
    wrap.style.cssText = `
      position:fixed; inset:0; display:none; z-index:2147483647;
      background:rgba(0,0,0,.66);
      align-items:center; justify-content:center;
      padding: calc(env(safe-area-inset-top,0px) + 12px) 10px calc(env(safe-area-inset-bottom,0px) + 16px);
      box-sizing:border-box;
    `;
    wrap.innerHTML = `
      <div id="siegeModal" style="
        width:min(92vw,460px);
        max-height:min(86vh,760px);
        overflow:hidden;
        display:flex; flex-direction:column;
        background:rgba(15,16,22,.98);
        border:1px solid rgba(255,255,255,.10);
        border-radius:18px;
        box-shadow:0 20px 60px rgba(0,0,0,.45);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 14px 10px;border-bottom:1px solid rgba(255,255,255,.08)">
          <div>
            <div style="font-weight:800;font-size:17px">Edge of the Chain</div>
            <div id="siegeSub" style="opacity:.72;font-size:12px">Siege control node</div>
          </div>
          <button id="closeSiege" style="
            border:0; border-radius:10px; padding:8px 10px; cursor:pointer;
            background:rgba(255,255,255,.08); color:#fff;
          ">✕</button>
        </div>
        <div id="siegeRoot" style="padding:12px; overflow:auto; -webkit-overflow-scrolling:touch;"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;padding:12px;border-top:1px solid rgba(255,255,255,.08)">
          <button id="siegeRefresh" class="siege-btn">Refresh</button>
          <button id="siegeWatch" class="siege-btn">Take Watch</button>
          <button id="siegeUnwatch" class="siege-btn">Leave Watch</button>
          <button id="siegeStart" class="siege-btn">Start Siege</button>
          <button id="siegeJoin" class="siege-btn">Join Siege</button>
          <button id="siegeLaunch" class="siege-btn">Launch</button>
          <button id="siegeNext" class="siege-btn">Next Fight</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    const style = document.createElement("style");
    style.textContent = `
      .siege-btn{
        border:0; border-radius:12px; padding:10px 12px; cursor:pointer;
        background:rgba(255,255,255,.08); color:#fff; font-weight:700;
      }
      .siege-btn:hover{ background:rgba(255,255,255,.14); }
      .siege-btn[hidden]{ display:none !important; }
      .siege-btn:disabled{
        opacity:.58;
        pointer-events:none;
      }
      .siege-btn.is-busy{
        background:rgba(255,255,255,.16);
      }
      .siege-card{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);
        border-radius:14px;
        padding:10px 12px;
        margin-bottom:10px;
      }
      .siege-kv{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:10px;
        margin:4px 0;
      }
      .siege-list{
        margin:6px 0 0;
        padding-left:18px;
        opacity:.92;
      }
      .siege-muted{
        opacity:.68;
        font-size:12px;
      }
      .siege-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }
      .siege-pill{
        padding:6px 8px;
        border-radius:999px;
        font-size:12px;
        background:rgba(255,255,255,.07);
        border:1px solid rgba(255,255,255,.08);
      }
      .siege-note{
        margin-top:8px;
        font-size:12px;
        line-height:1.35;
        opacity:.82;
      }

      .siege-feed-list{
        display:flex;
        flex-direction:column;
        gap:8px;
        max-height:220px;
        overflow:auto;
      }
      .siege-feed-item{
        padding:9px 10px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.06);
      }
      .siege-feed-meta{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        align-items:center;
        margin-bottom:5px;
      }
      .siege-feed-kind,
      .siege-feed-time,
      .siege-feed-name,
      .siege-feed-faction{
        font-size:11px;
        line-height:1;
        padding:4px 7px;
        border-radius:999px;
        background:rgba(255,255,255,.07);
        border:1px solid rgba(255,255,255,.08);
        opacity:.92;
      }
      .siege-feed-text{
        font-size:13px;
        line-height:1.35;
        opacity:.95;
      }

      /* VS HEADER + kolory frakcji */
      .siege-vs-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 14px 0;
        background: linear-gradient(90deg, rgba(0,255,255,0.08), rgba(255,0,255,0.08));
        border-bottom: 1px solid rgba(255,255,255,.12);
        font-size: 18px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .siege-faction {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .siege-faction-short {
        font-size: 26px;
        font-weight: 900;
        letter-spacing: 3px;
        line-height: 1;
      }
      .siege-faction-full {
        font-size: 11px;
        opacity: .85;
        letter-spacing: 1px;
        margin-top: -2px;
      }
      .vs {
        font-size: 22px;
        color: #fff;
        opacity: .75;
        padding: 0 8px;
      }

      /* KLIKALNE SLOTY DEFENDERÓW */
      .siege-defender-slots {
        margin: 14px 0 18px;
        padding: 16px;
        background: rgba(10,12,22,0.9);
        border: 2px solid rgba(0,234,255,0.3);
        border-radius: 16px;
      }
      .slots-title {
        text-align: center;
        font-size: 14px;
        font-weight: 800;
        color: #00eaff;
        margin-bottom: 12px;
        letter-spacing: 1px;
      }
      .slots-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .defender-slot {
        background: rgba(255,255,255,0.03);
        border: 2px solid rgba(255,255,255,0.15);
        border-radius: 12px;
        padding: 12px 10px;
        text-align: center;
        min-height: 92px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        cursor: pointer;
      }
      .defender-slot:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(0,255,170,0.5);
      }
      .defender-slot.occupied {
        border-color: #00ffaa;
        box-shadow: 0 0 15px rgba(0,255,170,0.4);
      }
      .defender-slot.empty {
        border-style: dashed;
        opacity: 0.75;
      }
      .slot-icon { font-size: 28px; margin-bottom: 6px; }
      .slot-name { font-weight: 700; font-size: 13px; color: #fff; }
      .slot-status { font-size: 11px; opacity: .7; }

      /* PULSUJĄCY BADGE RUNNING */
      .status-badge {
        text-align: center;
        padding: 10px 24px;
        margin: 8px 0 16px;
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 2px;
        border-radius: 999px;
        background: rgba(255,50,50,0.15);
        border: 2px solid #ff3366;
        color: #ff3366;
        text-shadow: 0 0 15px #ff3366;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.03); }
      }
    `;
    document.head.appendChild(style);

    qs("closeSiege").onclick = close;
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });

    qs("siegeRefresh").onclick = () => {
      if (_busy) return;
      loadState();
    };

    qs("siegeWatch").onclick = () => act("/webapp/siege/watch", "siege_watch", {
      btnId: "siegeWatch",
      busyLabel: "Taking Watch..."
    });

    qs("siegeUnwatch").onclick = () => act("/webapp/siege/unwatch", "siege_unwatch", {
      btnId: "siegeUnwatch",
      busyLabel: "Leaving Watch..."
    });

    qs("siegeStart").onclick = () => act("/webapp/siege/start", "siege_start", {
      btnId: "siegeStart",
      busyLabel: "Starting..."
    });

    qs("siegeJoin").onclick = () => act("/webapp/siege/join", "siege_join", {
      btnId: "siegeJoin",
      busyLabel: "Joining..."
    });

    qs("siegeLaunch").onclick = () => act("/webapp/siege/launch", "siege_launch", {
      btnId: "siegeLaunch",
      busyLabel: "Launching..."
    });

    qs("siegeNext").onclick = () => act("/webapp/siege/next", "siege_next", {
      btnId: "siegeNext",
      busyLabel: "Processing..."
    });

    resetActionBar();
  }

  function open() {
    ensureModal();
    const back = qs("siegeBack");
    if (back) back.style.display = "flex";
    loadState();
  }

  function close() {
    const el = qs("siegeBack");
    if (el) el.style.display = "none";
  }

  function render(raw) {
    const out = normalize(raw) || {};
    _lastRaw = out;

    const root = qs("siegeRoot");
    if (!root) return;

    if (out.ok === false) {
      const reason = out.reason || "UNKNOWN";
      qs("siegeSub").textContent = "Siege control node";
      root.innerHTML = `
        <div class="siege-card">
          Failed to load siege state.<br>
          <span class="siege-muted">${esc(reason)}</span>
        </div>
      `;
      resetActionBar();
      return;
    }

    const node = getNode(out);
    const cur = getCurrentSiege(node);
    const status = getSiegeStatus(node);
    const defenders = defendersList(node);
    const attackers = attackersList(node);
    const curDefs = curDefendersList(node);
    const fights = fightsList(node);
    const feed = siegeFeedList(node);

    const ownerFaction = normFaction(node?.ownerFaction || node?.owner || "");
    const neutral = !ownerFaction;
    const ownerText = factionLabel(ownerFaction);
    const watchText = `${guardUsed(node)} / ${guardMax(node)}`;
    const cooldownText = cooldownLabel(node);

    qs("siegeSub").textContent =
      cur ? `Status: ${status || "—"}` : `Owner: ${ownerText}`;

    const factionShort = (f) => {
      const key = normFaction(f);
      const map = {
        rogue_byte: "RB",
        echo_wardens: "EW",
        pack_burners: "PB",
        inner_howl: "IH"
      };
      return map[key] || (key ? key.slice(0, 2).toUpperCase() : "??");
    };

    const factionClass = (f) => `faction-${normFaction(f)}`;

    const leftFactionFull = cur
      ? factionLabel(cur.attackerFaction || "")
      : (neutral ? "Neutral" : ownerText);

    const rightFactionFull = cur
      ? factionLabel(cur.defenderFaction || "")
      : "Neutral";

    const leftShort = factionShort(cur ? cur.attackerFaction : (neutral ? "" : ownerFaction));
    const rightShort = factionShort(cur ? cur.defenderFaction : "");

    const leftClass = factionClass(cur ? cur.attackerFaction : (neutral ? "" : ownerFaction));
    const rightClass = factionClass(cur ? cur.defenderFaction : "");

    const maxSlots = guardMax(node);
    const usedSlots = Math.min(defenders.length, maxSlots);

    const slotsHTML = Array.from({ length: maxSlots }, (_, i) => {
      const defender = defenders[i];
      if (defender) {
        return `
          <div class="defender-slot occupied" onclick="document.getElementById('siegeUnwatch')?.click()">
            <div class="slot-icon">🛡️</div>
            <div class="slot-name">${esc(defender.name || defender.displayName || defender.uid || "Unknown")}</div>
            <div class="slot-status">WATCHING</div>
          </div>`;
      } else {
        return `
          <div class="defender-slot empty" onclick="document.getElementById('siegeWatch')?.click()">
            <div class="slot-icon">+</div>
            <div class="slot-name">EMPTY SLOT</div>
            <div class="slot-status">AVAILABLE • TAP TO JOIN</div>
          </div>`;
      }
    }).join("");

    root.innerHTML = `
      <div class="siege-vs-header">
        <div class="siege-faction ${leftClass}">
          <span class="siege-faction-short">${esc(leftShort)}</span>
          <div><span class="siege-faction-full ${leftClass}">${esc(leftFactionFull)}</span></div>
        </div>
        <div class="vs">VS</div>
        <div class="siege-faction ${rightClass}">
          <div><span class="siege-faction-full ${rightClass}">${esc(rightFactionFull)}</span></div>
          <span class="siege-faction-short">${esc(rightShort)}</span>
        </div>
      </div>

      ${status === "RUNNING" ? `<div class="status-badge">RUNNING • SIEGE IN PROGRESS</div>` : ""}

      <div class="siege-defender-slots">
        <div class="slots-title">DEFENDER WATCH SLOTS • ${usedSlots}/${maxSlots}</div>
        <div class="slots-grid">
          ${slotsHTML}
        </div>
      </div>

      <div class="siege-card">
        <div class="siege-kv"><strong>Owner</strong><span>${esc(ownerText)}</span></div>
        <div class="siege-kv"><strong>Watch</strong><span>${esc(watchText)}</span></div>
        <div class="siege-kv"><strong>Cooldown</strong><span>${esc(cooldownText)}</span></div>
        <div class="siege-note">
          ${
            neutral
              ? `This node is neutral. Start Siege to claim it.`
              : `Control this node to hold the line. Break it to take the chain.`
          }
        </div>
      </div>

      <div class="siege-card">
        <div style="font-weight:800;margin-bottom:6px">Watch Defenders</div>
        ${
          defenders.length
            ? `<ul class="siege-list">${defenders.map(x => `<li>${esc(x?.name || x?.displayName || x?.uid || "Unknown")}</li>`).join("")}</ul>`
            : `<div class="siege-muted">${neutral ? "No defenders. Neutral node." : "No defenders assigned."}</div>`
        }
      </div>

      <div class="siege-card">
        <div style="font-weight:800;margin-bottom:6px">Active Siege</div>
        ${
          cur ? `
            <div class="siege-kv"><strong>Status</strong><span>${esc(status || "—")}</span></div>
            <div class="siege-kv"><strong>Attacker Faction</strong><span>${esc(factionLabel(cur.attackerFaction))}</span></div>
            <div class="siege-kv"><strong>Defender Faction</strong><span>${esc(cur.defenderFaction ? factionLabel(cur.defenderFaction) : "Neutral")}</span></div>
            <div class="siege-kv"><strong>Fight No.</strong><span>${Number(cur.currentFight || 0)}</span></div>

            <div style="margin-top:10px;font-weight:700">Attackers</div>
            ${
              attackers.length
                ? `<div class="siege-row">${attackers.map(x => `<span class="siege-pill">${esc(x?.name || x?.displayName || x?.uid || "Unknown")}${x?.alive === false ? " ✖" : ""}</span>`).join("")}</div>`
                : `<div class="siege-muted">No attackers yet.</div>`
            }

            <div style="margin-top:10px;font-weight:700">Defenders in Siege</div>
            ${
              curDefs.length
                ? `<div class="siege-row">${curDefs.map(x => `<span class="siege-pill">${esc(x?.name || x?.displayName || x?.uid || "Unknown")}${x?.alive === false ? " ✖" : ""}</span>`).join("")}</div>`
                : `<div class="siege-muted">${neutral ? "Neutral node. Defenders may remain empty." : "Will be populated on launch."}</div>`
            }

            <div style="margin-top:10px;font-weight:700">Fight History</div>
            ${
              fights.length
                ? `<ul class="siege-list">${fights.slice(-8).reverse().map(f => `<li>Fight ${Number(f?.fightNo || 0)} · winner: ${esc(f?.winnerUid || "—")}</li>`).join("")}</ul>`
                : `<div class="siege-muted">No fights resolved yet.</div>`
            }
          `
          : `<div class="siege-muted">No active siege.</div>`
        }
      </div>

      ${renderFeedHTML(feed)}
    `;

    updateActionBar(out);
  }

  async function loadState(force = false) {
  if (_busy && !force) return;

  try {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("apiPost not ready");

    const out = await apiPost("/webapp/siege/state", {
      nodeId: "edge_of_chain",
      run_id: rid("siege_state")
    });

    if (_dbg) console.log("[SIEGE][STATE]", out);
    render(out);
    return out;
  } catch (err) {
    const root = qs("siegeRoot");
    if (root) {
      root.innerHTML = `
        <div class="siege-card">
          Failed to load siege state.<br>
          <span class="siege-muted">${esc(err?.message || err)}</span>
        </div>
      `;
    }
    if (qs("siegeSub")) qs("siegeSub").textContent = "Siege control node";
    resetActionBar();
    return null;
  }
}

 async function act(path, prefix, opts = {}) {
  if (_busy) return;

  const btnId = String(opts.btnId || "");
  const busyLabel = String(opts.busyLabel || "Processing...");

  try {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("apiPost not ready");

    setBusyState(true, btnId, busyLabel);

    const out = await apiPost(path, {
      nodeId: "edge_of_chain",
      run_id: rid(prefix)
    });

    if (_dbg) console.log("[SIEGE][ACT]", path, out);
    console.log("[SIEGE][ACT RAW]", path, JSON.stringify(out, null, 2));

    if (out && out.ok === false) {
      showAlert(`Siege action failed: ${out.reason || "UNKNOWN"}`);
      return;
    }

    try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
  } catch (err) {
    if (_dbg) console.warn("[SIEGE][ERR]", path, err);
    showAlert(`Siege action failed: ${err?.message || err}`);
  } finally {
    setBusyState(false);
    await loadState(true);
  }
}

  Siege.init = function ({ apiPost, tg, dbg } = {}) {
    _apiPost =
      (typeof apiPost === "function" && apiPost) ||
      (typeof window.apiPost === "function" && window.apiPost) ||
      (typeof window.S?.apiPost === "function" && window.S.apiPost) ||
      null;

    _tg = tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    if (_dbg) {
      console.log("[SIEGE][INIT]", {
        hasApiPost: typeof _apiPost === "function"
      });
    }

    ensureModal();
    return Siege;
  };

  Siege.open = open;
  Siege.close = close;
  Siege.refresh = loadState;

  window.Siege = Siege;
})();
