// js/map.js — Alpha Husky Map module (LIVE faction control truth-first)
// - live faction nodes resolve leader ONLY from backend leadersMap scores
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
/* === Map Level 1: faction leader ring + badge === */
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
  width:22px; height:22px;
  border-radius:999px;
  display:none;
  place-items:center;
  font-size:10px; font-weight:800;
  background:rgba(0,0,0,.72);
  border:1px solid rgba(255,255,255,.18);
  pointer-events:none;
  z-index:3;
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

.map-pin.is-controlled .pin-ring{ opacity: 1; }
.map-pin.is-contested .pin-ring{ animation: ahPinPulse 1.6s ease-in-out infinite; }

@keyframes ahPinPulse{
  0%,100%{ transform:scale(1); opacity:.85; }
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
    pinEl.classList.remove("f-rb", "f-ew", "f-pb", "f-ih", "is-contested", "is-controlled");
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

  function resolveNodeLeader(meta, info) {
    const liveNode = !!meta?.liveFactionNode;
    const safeInfo = (info && typeof info === "object") ? info : {};
    const scores = _extractScores(safeInfo);

    // LIVE nodes: truth only from scores
    if (liveNode) {
      const top = _resolveTopFaction(scores);
      return {
        owner: top.owner || "",
        contested: _isContested(safeInfo, top.top1, top.top2),
        top1: top.top1,
        top2: top.top2,
        scores,
        source: "scores"
      };
    }

    // non-live nodes never show leader UI now
    return {
      owner: "",
      contested: false,
      top1: 0,
      top2: 0,
      scores: {},
      source: "non-live"
    };
  }

  function setLeader(pinEl, owner, opts) {
    ensureCss();
    ensureLevel1(pinEl);

    const name = pinEl.dataset.nodeName || "";
    const contested = !!opts?.contested;
    const source = String(opts?.source || "");

    _clearFactionClasses(pinEl);

    const badge = pinEl.querySelector(".pin-badge");
    const chip = pinEl.querySelector(".chip");

    pinEl.dataset.liveLeader = owner || "";
    pinEl.dataset.leaderSource = source || "";

    if (!owner) {
      if (badge) {
        badge.textContent = "";
        badge.style.display = "none";
      }
      if (chip) {
        chip.innerHTML = `<span class="chip-name">${esc(name)}</span>`;
      }
      if (contested) pinEl.classList.add("is-contested");
      return;
    }

    const code = CODE[owner] || "";
    const cls = CLS[owner] || "";

    if (cls) pinEl.classList.add(cls);
    pinEl.classList.add("is-controlled");
    if (contested) pinEl.classList.add("is-contested");

    if (badge) {
      badge.textContent = code || "";
      badge.style.display = "grid";
    }

    if (chip) {
      chip.innerHTML = `
        <span class="chip-faction ${cls}">
          <img src="${iconUrl(owner)}" alt="${esc(owner)}" style="width:12px;height:12px;display:block" />
        </span>
        <span class="chip-name">
          ${esc(name)}${code ? ` • ${code}` : ""}${contested ? ` <span class="chip-warn">⚠</span>` : ""}
        </span>
      `;
      const img = chip.querySelector("img");
      if (img) img.onerror = () => { img.style.display = "none"; };
    }
  }

  function _clearLeader(pinEl) {
    setLeader(pinEl, null, { contested: false, source: "clear" });
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
    if (!leadersMap) return;
    _lastLeadersMap = leadersMap;

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
        source: ex.source || "scores"
      });

      console.log("[AHMap][PIN]", {
        nodeId: _pinNodeId(pin),
        buildingId: _pinBuildingId(pin),
        leader: ex.owner,
        contested: ex.contested,
        source: ex.source,
        scores: ex.scores
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

  function init() {
    if (_inited) return;
    _inited = true;
    ensureCss();
    _ensureObserver();
    _bindReapplyHooks();
  }

  const API = {
    init,
    decoratePin,
    setLeader,
    applyLeaders,
    resolveNodeLeader,
    reapplyLastLeaders: () => { if (_lastLeadersMap) applyLeaders(_lastLeadersMap); }
  };

  window.AHMap = API;
  window.Map = window.Map || API;
})();
