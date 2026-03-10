// js/siege.js
(function () {
  const Siege = {};
  let _apiPost = null, _tg = null, _dbg = false;

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
    if (out.data && typeof out.data === "object" && (out.data.nodeId || out.data.ownerFaction || out.data.currentSiege)) return out.data;
    if (out.nodeId || out.ownerFaction || out.currentSiege) return out;
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

  function setBtn(id, visible, label) {
    const el = qs(id);
    if (!el) return;
    el.hidden = !visible;
    el.style.display = visible ? "" : "none";
    el.disabled = !visible;
    if (label) el.textContent = label;
  }

  function resetActionBar() {
    setBtn("siegeRefresh", true, "Refresh");
    setBtn("siegeWatch", false, "Take Watch");
    setBtn("siegeUnwatch", false, "Leave Watch");
    setBtn("siegeStart", false, "Start Siege");
    setBtn("siegeJoin", false, "Join Siege");
    setBtn("siegeLaunch", false, "Launch");
    setBtn("siegeNext", false, "Next Fight");
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

    const hasForming = status === "FORMING";
    const hasRunning = status === "RUNNING";
    const hasActiveSiege = hasForming || hasRunning;

    const showWatch = !neutral && !hasActiveSiege && !!ownerFaction && youFaction === ownerFaction;
    const showUnwatch = !neutral && !hasActiveSiege && !!ownerFaction && youFaction === ownerFaction;

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

      /* === KROK 1: NOWY VS HEADER (neon + frakcje) === */
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
      .echo { 
        color: #00f0ff; 
        text-shadow: 0 0 12px #00f0ff; 
      }
      .rogue { 
        color: #ff00aa; 
        text-shadow: 0 0 12px #ff00aa; 
      }
      .vs {
        font-size: 22px;
        color: #fff;
        opacity: .75;
        padding: 0 8px;
      }

      /* === KROK 2 + FIX: SKRÓTY FRAKCJI (RB / EW) + CENTRALNY BUDYNEK === */
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

      .siege-building-container {
        margin: 14px 0 18px;
        padding: 14px;
        background: rgba(10,12,22,0.85);
        border: 1px solid rgba(0,234,255,0.25);
        border-radius: 16px;
      }
      .building-title {
        text-align: center;
        font-size: 13px;
        letter-spacing: 2px;
        color: #00eaff;
        margin-bottom: 10px;
        text-transform: uppercase;
      }
      .siege-building {
        width: 100%;
        max-width: 290px;
        margin: 0 auto;
        background: linear-gradient(#0c0f1a, #141a2b);
        border: 3px solid #00eaff;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 0 35px rgba(0, 234, 255, 0.35);
      }
      .floor {
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        position: relative;
        color: #ddd;
      }
      .floor:last-child { border-bottom: none; }
      .breach-bar {
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 32%;
        background: linear-gradient(#ff2d55, #ff8833);
        box-shadow: 4px 0 25px #ff3366;
        opacity: 0.85;
      }
    `;
    document.head.appendChild(style);

    qs("closeSiege").onclick = close;
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    qs("siegeRefresh").onclick = () => loadState();
    qs("siegeWatch").onclick = () => act("/webapp/siege/watch", "siege_watch");
    qs("siegeUnwatch").onclick = () => act("/webapp/siege/unwatch", "siege_unwatch");
    qs("siegeStart").onclick = () => act("/webapp/siege/start", "siege_start");
    qs("siegeJoin").onclick = () => act("/webapp/siege/join", "siege_join");
    qs("siegeLaunch").onclick = () => act("/webapp/siege/launch", "siege_launch");
    qs("siegeNext").onclick = () => act("/webapp/siege/next", "siege_next");
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
    const ownerFaction = normFaction(node?.ownerFaction || node?.owner || "");
    const neutral = !ownerFaction;
    const ownerText = factionLabel(ownerFaction);
    const watchText = `${guardUsed(node)} / ${guardMax(node)}`;
    const cooldownText = cooldownLabel(node);

    qs("siegeSub").textContent =
      cur ? `Status: ${status || "—"}` : `Owner: ${ownerText}`;

    // === NOWA FUNKCJA: krótkie kody frakcji (RB / EW itd.) ===
    const factionShort = (f) => {
      const key = normFaction(f);
      const map = {
        rogue_byte: "RB",
        echo_wardens: "EW",
        pack_burners: "PB",
        inner_howl: "IH"
      };
      return map[key] || (key ? key.slice(0,2).toUpperCase() : "??");
    };

    const leftFactionFull  = cur 
      ? factionLabel(cur.attackerFaction || "ECHO WARDENS")
      : (neutral ? "NEUTRAL" : ownerText);
    const rightFactionFull = cur 
      ? factionLabel(cur.defenderFaction || "ROGUE BYTE")
      : "NEUTRAL";

    const leftShort  = factionShort(cur ? cur.attackerFaction : (neutral ? "" : ownerFaction));
    const rightShort = factionShort(cur ? cur.defenderFaction : "");

    // breach % (można później podpiąć pod realne dane)
    const breachPercent = cur && status === "RUNNING" ? 45 : 0;

    root.innerHTML = `
      <!-- VS HEADER Z SKRÓTAMI (RB / EW) -->
      <div class="siege-vs-header">
        <div class="siege-faction echo">
          <span class="siege-faction-short">${leftShort}</span>
          <div>
            <span>${esc(leftFactionFull)}</span>
            <div class="siege-faction-full">${leftShort}</div>
          </div>
        </div>
        <div class="vs">VS</div>
        <div class="siege-faction rogue">
          <div>
            <span>${esc(rightFactionFull)}</span>
            <div class="siege-faction-full">${rightShort}</div>
          </div>
          <span class="siege-faction-short">${rightShort}</span>
        </div>
      </div>

      <!-- CENTRALNY BUDYNEK (bez zmian) -->
      <div class="siege-building-container">
        <div class="building-title">THE BUILDING • BREACH ${breachPercent}%</div>
        <div class="siege-building">
          <div class="floor"><span class="floor-name">ROOFTOP</span></div>
          <div class="floor"><span class="floor-name">SERVER ROOM</span></div>
          <div class="floor"><span class="floor-name">LABORATORY</span></div>
          <div class="floor"><span class="floor-name">MAIN HALL</span></div>
          <div class="floor"><span class="floor-name">GROUND FLOOR</span></div>
          <div class="breach-bar" style="height: ${breachPercent}%"></div>
        </div>
      </div>

      <!-- reszta kart bez zmian -->
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
    `;
    updateActionBar(out);
  }

  async function loadState() {
    try {
      const apiPost = getApiPost();
      if (!apiPost) throw new Error("apiPost not ready");

      const out = await apiPost("/webapp/siege/state", {
        nodeId: "edge_of_chain",
        run_id: rid("siege_state")
      });

      if (_dbg) console.log("[SIEGE][STATE]", out);
      render(out);
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
      qs("siegeSub") && (qs("siegeSub").textContent = "Siege control node");
      resetActionBar();
    }
  }

  async function act(path, prefix) {
    try {
      const apiPost = getApiPost();
      if (!apiPost) throw new Error("apiPost not ready");

      const out = await apiPost(path, {
        nodeId: "edge_of_chain",
        run_id: rid(prefix)
      });

      if (_dbg) console.log("[SIEGE][ACT]", path, out);
      render(out);

      if (out && out.ok === false) {
        alert(`Siege action failed: ${out.reason || "UNKNOWN"}`);
      }
    } catch (err) {
      if (_dbg) console.warn("[SIEGE][ERR]", path, err);
      alert(`Siege action failed: ${err?.message || err}`);
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
