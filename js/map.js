// js/map.js — Alpha Husky Map module (LIVE faction control + live siege state truth-first)
// - live faction nodes resolve owner/status only from backend leadersMap
// - non-live / locked nodes NEVER show faction leader badge
// - cached leadersMap is re-applied after pin rerenders / focus changes
(function () {
  let _inited = false;
  let _lastLeadersMap = null;
  let _observer = null;
  let _reapplyQueued = false;

  const FACTIONS = {
    rogue_byte:   { cls: "f-rb", code: "RB" },
    echo_wardens: { cls: "f-ew", code: "EW" },
    pack_burners: { cls: "f-pb", code: "PB" },
    inner_howl:   { cls: "f-ih", code: "IH" },
  };

  const FACTION_KEYS = ["rogue_byte", "echo_wardens", "pack_burners", "inner_howl"];

  const CODE = {
    rogue_byte: "RB",
    echo_wardens: "EW",
    pack_burners: "PB",
    inner_howl: "IH",
  };

  const CLS = {
    rogue_byte: "f-rb",
    echo_wardens: "f-ew",
    pack_burners: "f-pb",
    inner_howl: "f-ih",
  };

  const CSS_ID = "ah-map-level1-css";

  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    const s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent = `
/* === Map Level 1: faction leader ring + badge + siege state === */
.map-pin{ position:absolute; }
.map-pin .pin-ring{
  position:absolute;
  inset:-7px;
  border-radius:999px;
  border:2px solid rgba(255,255,255,.22);
  pointer-events:none;
  z-index:0;
}
.map-pin .pin-badge{
  position:absolute;
  top:-10px; right:-10px;
  min-width:22px; height:22px;
  padding:0 6px;
  border-radius:999px;
  display:none;
  place-items:center;
  font-size:10px; font-weight:800;
  letter-spacing:.02em;
  background:rgba(0,0,0,.72);
  border:1px solid rgba(255,255,255,.18);
  pointer-events:none;
  z-index:3;
  white-space:nowrap;
}
.map-pin .pin-icon, .map-pin > img{
  position:relative;
  z-index:2;
}

/* faction colors */
.map-pin.f-rb .pin-ring{ border-color: rgba(255,70,70,.95); box-shadow:0 0 14px rgba(255,70,70,.35); }
.map-pin.f-ew .pin-ring{ border-color: rgba(255,200,70,.95); box-shadow:0 0 14px rgba(255,200,70,.32); }
.map-pin.f-pb .pin-ring{ border-color: rgba(255,140,40,.95); box-shadow:0 0 14px rgba(255,140,40,.32); }
.map-pin.f-ih .pin-ring{ border-color: rgba(60,220,255,.95); box-shadow:0 0 14px rgba(60,220,255,.28); }

.map-pin.f-rb .pin-badge{ color: rgba(255,90,90,1); border-color: rgba(255,90,90,.35); }
.map-pin.f-ew .pin-badge{ color: rgba(255,210,90,1); border-color: rgba(255,210,90,.35); }
.map-pin.f-pb .pin-badge{ color: rgba(255,160,70,1); border-color: rgba(255,160,70,.35); }
.map-pin.f-ih .pin-badge{ color: rgba(90,235,255,1); border-color: rgba(90,235,255,.35); }

.map-pin.is-controlled .pin-ring{ opacity:1; }
.map-pin.is-contested .pin-ring{ animation: ahPinPulse 1.6s ease-in-out infinite; }

/* siege states */
.map-pin.siege-forming .pin-ring{
  border-color: rgba(255,170,70,.96) !important;
  box-shadow: 0 0 0 2px rgba(255,170,70,.22), 0 0 18px rgba(255,140,40,.35) !important;
  animation: ahSiegePulse 1.2s ease-in-out infinite;
}
.map-pin.siege-running .pin-ring{
  border-color: rgba(255,75,75,.98) !important;
  box-shadow: 0 0 0 2px rgba(255,75,75,.22), 0 0 22px rgba(255,75,75,.42) !important;
  animation: ahSiegePulseFast .85s ease-in-out infinite;
}
.map-pin.siege-cooldown .pin-ring{
  border-color: rgba(80,220,180,.96) !important;
  box-shadow: 0 0 0 2px rgba(80,220,180,.18), 0 0 16px rgba(80,220,180,.28) !important;
}
.map-pin.siege-forming .pin-badge,
.map-pin.siege-running .pin-badge,
.map-pin.siege-cooldown .pin-badge{
  display:grid;
  color:#fff !important;
  border-color: rgba(255,255,255,.16) !important;
}
.map-pin.siege-forming .pin-badge{ background:rgba(255,140,40,.88); }
.map-pin.siege-running .pin-badge{ background:rgba(220,60,60,.90); }
.map-pin.siege-cooldown .pin-badge{ background:rgba(50,180,145,.88); }

.chip-state{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:26px;
  height:18px;
  margin-left:6px;
  padding:0 6px;
  border-radius:999px;
  font-size:10px;
  font-weight:800;
  letter-spacing:.02em;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.10);
  vertical-align:middle;
}
.chip-state.s-forming{ background:rgba(255,140,40,.16); border-color:rgba(255,170,70,.30); color:#ffbe78; }
.chip-state.s-running{ background:rgba(220,60,60,.18); border-color:rgba(255,90,90,.30); color:#ff9a9a; }
.chip-state.s-cooldown{ background:rgba(50,180,145,.16); border-color:rgba(80,220,180,.28); color:#96f0d7; }

@keyframes ahPinPulse{
  0%,100%{ transform:scale(1); opacity:.85; }
  50%{ transform:scale(1.08); opacity:1; }
}
@keyframes ahSiegePulse{
  0%,100%{ transform:scale(1); opacity:.92; }
  50%{ transform:scale(1.06); opacity:1; }
}
@keyframes ahSiegePulseFast{
  0%,100%{ transform:scale(1); opacity:.92; }
  50%{ transform:scale(1.08); opacity:1; }
}
`;
    document.head.appendChild(s);
  }

  function esc(s){
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  function rid(prefix){
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  }

  function getApiPost(){
    const fn =
      window.S?.apiPost ||
      window.apiPost ||
      null;

    return (typeof fn === "function") ? fn : null;
  }

  function iconUrl(owner) {
    return `/images/ui/factions/${owner}_color.svg`;
  }

  function ensureLevel1(pinEl) {
    if (!pinEl) return;
    pinEl.classList.add("map-pin");

    if (!pinEl.querySelector(".pin-ring")) {
      const ring = document.createElement("span");
      ring.className = "pin-ring";
      pinEl.prepend(ring);
    }
    if (!pinEl.querySelector(".pin-badge")) {
      const badge = document.createElement("span");
      badge.className = "pin-badge";
      badge.textContent = "";
      pinEl.appendChild(badge);
    }
  }

  function _clearFactionClasses(pinEl) {
    if (!pinEl) return;
    pinEl.classList.remove(
      "f-rb", "f-ew", "f-pb", "f-ih",
      "is-contested", "is-controlled",
      "siege-forming", "siege-running", "siege-cooldown"
    );
  }

  function _normFactionKey(raw) {
    const s = String(raw || "").toLowerCase().trim();
    if (!s) return "";
    if (FACTIONS[s]) return s;
    if (s === "rb" || s.includes("rogue")) return "rogue_byte";
    if (s === "ew" || s.includes("echo")) return "echo_wardens";
    if (s === "pb" || s.includes("pack") || s.includes("burn")) return "pack_burners";
    if (s === "ih" || s.includes("inner") || s.includes("iron") || s.includes("howl")) return "inner_howl";
    return "";
  }

  function _getPinsSelector() {
    const scoped = document.getElementById("pins");
    if (scoped) {
      return '#pins .map-pin[data-node-id], #pins .hotspot[data-node-id], #pins .map-pin[data-building-id], #pins .hotspot[data-building-id]';
    }
    return '.map-pin[data-node-id], .hotspot[data-node-id], .map-pin[data-building-id], .hotspot[data-building-id]';
  }

  function _pinNodeId(pinEl) {
    return (
      pinEl?.dataset?.nodeId ||
      pinEl?.getAttribute?.("data-node-id") ||
      ""
    );
  }

  function _pinBuildingId(pinEl) {
    return (
      pinEl?.dataset?.buildingId ||
      pinEl?.getAttribute?.("data-building-id") ||
      ""
    );
  }

  function _isLiveFactionNodeFromNode(node) {
    if (!node || typeof node !== "object") return false;
    return !!(
      node.factionControl ||
      node?.uiHint?.type === "factionControl"
    );
  }

  function _isLiveFactionNodeFromPin(pinEl) {
    if (!pinEl) return false;
    const v = String(pinEl.dataset.liveFactionNode || "").toLowerCase();
    return v === "1" || v === "true" || v === "yes";
  }

  function _extractScores(info) {
    const src = (info && typeof info === "object") ? info : {};
    const scoreObj =
      (src.scores && typeof src.scores === "object") ? src.scores :
      (src.scoreMap && typeof src.scoreMap === "object") ? src.scoreMap :
      (src.factions && typeof src.factions === "object") ? src.factions :
      null;

    const out = {};
    for (const fk of FACTION_KEYS) {
      let raw = null;
      if (scoreObj && fk in scoreObj) raw = scoreObj[fk];
      else if (fk in src) raw = src[fk];

      const n = (typeof raw === "number")
        ? raw
        : (typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN);

      out[fk] = Number.isFinite(n) ? n : 0;
    }
    return out;
  }

  function _resolveTopFaction(scores) {
    let owner = "";
    let top1 = 0;
    let top2 = 0;

    for (const fk of FACTION_KEYS) {
      const n = Number(scores?.[fk] || 0);
      if (n >= top1) {
        top2 = top1;
        top1 = n;
        owner = fk;
      } else if (n > top2) {
        top2 = n;
      }
    }
    return { owner, top1, top2 };
  }

  function _isContested(info, top1, top2) {
    const explicit = !!(
      info?.contested ||
      info?.isContested ||
      info?.is_contested ||
      info?.warn ||
      info?.warning
    );

    if (explicit) return true;
    if (!(top1 > 0) || !(top2 > 0)) return false;

    return ((top1 - top2) / top1) < 0.12;
  }

  function _extractSiegeMeta(info) {
    const src = (info && typeof info === "object") ? info : {};
    const siegeStatus = String(src?.siegeStatus || src?.status || "").trim().toLowerCase();

    return {
      siegeStatus,
      attackerFaction: _normFactionKey(src?.attackerFaction || ""),
      defenderFaction: _normFactionKey(src?.defenderFaction || ""),
      cooldownLeftSec: Number(src?.cooldownLeftSec || 0) || 0,
      attackersCount: Number(src?.attackersCount || 0) || 0,
      minAttackers: Number(src?.minAttackers || 0) || 0,
      watchCount: Number(src?.watchCount || 0) || 0,
      isUnderAttack: !!src?.isUnderAttack
    };
  }

  function resolveNodeLeader(meta, info) {
    const liveNode = !!meta?.liveFactionNode;
    const safeInfo = (info && typeof info === "object") ? info : {};
    const scores = _extractScores(safeInfo);
    const siegeMeta = _extractSiegeMeta(safeInfo);

    // LIVE nodes: truth only from leadersMap/backend
    if (liveNode) {
      const top = _resolveTopFaction(scores);
      const explicitOwner = _normFactionKey(
        safeInfo?.ownerFaction ||
        safeInfo?.owner ||
        safeInfo?.faction ||
        ""
      );

      const owner = explicitOwner || top.owner || "";
      const contested = (
        siegeMeta.siegeStatus === "forming" ||
        siegeMeta.siegeStatus === "running" ||
        _isContested(safeInfo, top.top1, top.top2)
      );

      return {
        owner,
        contested,
        top1: top.top1,
        top2: top.top2,
        scores,
        source: explicitOwner ? "ownerFaction" : "scores",
        siegeMeta
      };
    }

    // non-live nodes never show leader UI now
    return {
      owner: "",
      contested: false,
      top1: 0,
      top2: 0,
      scores: {},
      source: "non-live",
      siegeMeta
    };
  }

  function _leaderBadgeText(owner, siegeMeta) {
    const status = String(siegeMeta?.siegeStatus || "");
    if (status === "forming") return "ATK";
    if (status === "running") return "LIVE";
    if (status === "cooldown") return "CD";
    return CODE[owner] || "";
  }

  function _chipStateText(siegeMeta) {
    const status = String(siegeMeta?.siegeStatus || "");
    if (status === "forming") return "UNDER ATTACK";
    if (status === "running") return "LIVE";
    if (status === "cooldown") return "SECURED";
    return "";
  }

  function _chipStateClass(siegeMeta) {
    const status = String(siegeMeta?.siegeStatus || "");
    if (status === "forming") return "s-forming";
    if (status === "running") return "s-running";
    if (status === "cooldown") return "s-cooldown";
    return "";
  }

  function _applySiegeStateClasses(pinEl, siegeMeta) {
    const status = String(siegeMeta?.siegeStatus || "");
    if (status === "forming") pinEl.classList.add("siege-forming");
    if (status === "running") pinEl.classList.add("siege-running");
    if (status === "cooldown") pinEl.classList.add("siege-cooldown");
  }

  function setLeader(pinEl, owner, opts) {
    ensureCss();
    ensureLevel1(pinEl);

    const name = pinEl.dataset.nodeName || "";
    const contested = !!opts?.contested;
    const source = String(opts?.source || "");
    const siegeMeta = opts?.siegeMeta || {};

    _clearFactionClasses(pinEl);

    const badge = pinEl.querySelector(".pin-badge");
    const chip = pinEl.querySelector(".chip");

    pinEl.dataset.liveLeader = owner || "";
    pinEl.dataset.leaderSource = source || "";
    pinEl.dataset.siegeStatus = String(siegeMeta?.siegeStatus || "");
    pinEl.dataset.siegeAttackerFaction = String(siegeMeta?.attackerFaction || "");
    pinEl.dataset.siegeDefenderFaction = String(siegeMeta?.defenderFaction || "");
    pinEl.dataset.siegeCooldownLeftSec = String(siegeMeta?.cooldownLeftSec || 0);
    pinEl.dataset.isUnderAttack = siegeMeta?.isUnderAttack ? "1" : "0";

    if (!owner) {
      if (badge) {
        badge.textContent = "";
        badge.style.display = "none";
      }
      if (chip) {
        chip.innerHTML = `<span class="chip-name">${esc(name)}</span>`;
      }
      _applySiegeStateClasses(pinEl, siegeMeta);
      if (contested) pinEl.classList.add("is-contested");
      return;
    }

    const code = CODE[owner] || "";
    const cls = CLS[owner] || "";
    const badgeText = _leaderBadgeText(owner, siegeMeta);
    const chipStateText = _chipStateText(siegeMeta);
    const chipStateClass = _chipStateClass(siegeMeta);

    if (cls) pinEl.classList.add(cls);
    pinEl.classList.add("is-controlled");
    if (contested) pinEl.classList.add("is-contested");
    _applySiegeStateClasses(pinEl, siegeMeta);

    if (badge) {
      badge.textContent = badgeText || "";
      badge.style.display = badgeText ? "grid" : "none";
    }

    if (chip) {
      chip.innerHTML = `
        <span class="chip-faction ${cls}">
          <img src="${iconUrl(owner)}" alt="${esc(owner)}" style="width:12px;height:12px;display:block" />
        </span>
        <span class="chip-name">
          ${esc(name)}${code ? ` • ${code}` : ""}${contested && !chipStateText ? ` <span class="chip-warn">⚠</span>` : ""}
          ${chipStateText ? ` <span class="chip-state ${chipStateClass}">${esc(chipStateText)}</span>` : ""}
        </span>
      `;
      const img = chip.querySelector("img");
      if (img) img.onerror = () => { img.style.display = "none"; };
    }
  }

  function _clearLeader(pinEl) {
    setLeader(pinEl, null, { contested: false, source: "clear", siegeMeta: {} });
  }

  function decoratePin(pinEl, node) {
    ensureCss();
    ensureLevel1(pinEl);

    if (node?.id) pinEl.dataset.nodeId = node.id;
    if (node?.buildingId) pinEl.dataset.buildingId = node.buildingId;
    if (node?.name) pinEl.dataset.nodeName = node.name;

    const liveFactionNode = _isLiveFactionNodeFromNode(node);
    pinEl.dataset.liveFactionNode = liveFactionNode ? "1" : "0";

    // for live nodes do NOT trust map.json owner
    if (liveFactionNode) {
      _clearLeader(pinEl);
      return;
    }

    // non-live nodes: no leader badge at all
    _clearLeader(pinEl);
  }

  function _findLeaderInfoForPin(pinEl, leadersMap) {
    const nodeId = _pinNodeId(pinEl);
    const buildingId = _pinBuildingId(pinEl);

    return (
      (buildingId && leadersMap?.[buildingId]) ||
      (nodeId && leadersMap?.[nodeId]) ||
      null
    );
  }

  function applyLeaders(leadersMap) {
    if (!leadersMap || typeof leadersMap !== "object") return;
    _lastLeadersMap = leadersMap;
    try { API._leadersMap = leadersMap; } catch (_) {}

    const pins = document.querySelectorAll(_getPinsSelector());

    pins.forEach((pin) => {
      ensureLevel1(pin);

      // hard gate: badges only for live faction nodes
      if (!_isLiveFactionNodeFromPin(pin)) {
        _clearLeader(pin);
        return;
      }

      const info = _findLeaderInfoForPin(pin, leadersMap);
      if (!info) {
        _clearLeader(pin);
        return;
      }

      const ex = resolveNodeLeader(
        { liveFactionNode: true },
        info
      );

      setLeader(pin, ex.owner || null, {
        contested: !!ex.contested,
        source: ex.source || "scores",
        siegeMeta: ex.siegeMeta || {}
      });
    });
  }

  function _scheduleReapply() {
    if (_reapplyQueued) return;
    _reapplyQueued = true;

    requestAnimationFrame(() => {
      _reapplyQueued = false;
      if (_lastLeadersMap) applyLeaders(_lastLeadersMap);
    });
  }

  function _ensureObserver() {
    if (_observer) return;

    const root = document.getElementById("pins") || document.body;
    if (!root) return;

    _observer = new MutationObserver(() => {
      _scheduleReapply();
    });

    _observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "data-node-id", "data-building-id"]
    });
  }

  function _bindReapplyHooks() {
    // po kliknięciu / focusie na mapie UI czasem przebudowuje piny
    document.addEventListener("click", () => {
      setTimeout(_scheduleReapply, 50);
    }, true);

    document.addEventListener("touchend", () => {
      setTimeout(_scheduleReapply, 50);
    }, true);
  }

  async function refreshLeaders() {
    try {
      const apiPost = getApiPost();
      if (!apiPost) return null;

      const out = await apiPost("/webapp/map/leaders", {
        run_id: rid("lead")
      });

      const leaders =
        out?.leadersMap ||
        out?.data?.leadersMap ||
        out?.state?.leadersMap ||
        out?.data ||
        out;

      if (leaders && typeof leaders === "object") {
        applyLeaders(leaders);
        return leaders;
      }
    } catch (err) {
      console.warn("[AHMap] refreshLeaders failed:", err);
    }
    return null;
  }

  function init() {
    if (_inited) return;
    _inited = true;
    ensureCss();
    _ensureObserver();
    _bindReapplyHooks();
  }

  const API = {
    _leadersMap: _lastLeadersMap,
    init,
    decoratePin,
    setLeader,
    applyLeaders,
    resolveNodeLeader,
    refreshLeaders,
    reapplyLastLeaders: () => { if (_lastLeadersMap) applyLeaders(_lastLeadersMap); }
  };

  window.AHMap = API;
  window.Map = window.Map || API;
})();
