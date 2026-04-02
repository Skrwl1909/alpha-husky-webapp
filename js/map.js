// js/map.js — Alpha Husky Map module (LIVE faction control + live siege state truth-first + pressure overlay)
// - live faction nodes resolve owner/status only from backend leadersMap
// - non-live / locked nodes NEVER show faction leader badge
// - cached leadersMap is re-applied after pin rerenders / focus changes
// - pressure overlay badges (HOT / CONTESTED / FORTIFIED) are read-only UI from leadersMap
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
  const NODE_ID_ALIASES = {
    bloodmoon_tower: "blood_moon_tower",
    edge_of_the_chain: "edge_of_chain",
    broken_contracts_hub: "broken_contracts",
    alpha_network_hq_shop: "alpha_network_hq",
    moonlab_fortress: "moon_lab",
  };
  const STRATEGIC_NODE_IDS = new Set(["alpha_network_hq", "blood_moon_tower", "edge_of_chain"]);
  const HIGH_VALUE_NODE_IDS = new Set(["phantom_nodes", "broken_contracts"]);
  const LEGACY_NODE_IDS = new Set(["abandoned_wallets", "moon_lab", "testnet_wastes_dojo"]);
  const RIVALRY_NODE_IDS = new Set([
    "alpha_network_hq",
    "blood_moon_tower",
    "edge_of_chain",
    "phantom_nodes",
    "broken_contracts",
  ]);

  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    const s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent = `
/* === Map Level 1: faction leader ring + badge + siege state + pressure overlay === */
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
  top:-8px; right:-8px;
  min-width:18px; height:18px;
  padding:0 5px;
  border-radius:999px;
  display:none;
  place-items:center;
  font-size:9px; font-weight:800;
  letter-spacing:.02em;
  background:rgba(0,0,0,.72);
  border:1px solid rgba(255,255,255,.18);
  pointer-events:none;
  z-index:3;
  white-space:nowrap;
}
.map-pin .pin-badge.is-faction{
  width:18px;
  min-width:18px;
  padding:0;
  overflow:hidden;
}
.map-pin .pin-badge img{
  width:12px;
  height:12px;
  display:block;
}
.map-pin .pin-badge .pin-badge-fallback{
  display:none;
  font-size:8px;
  font-weight:900;
  line-height:1;
}
.map-pin .pin-icon, .map-pin > img{
  position:relative;
  z-index:2;
}

.map-pin.family-legacy{
  z-index:1;
}
.map-pin.family-legacy .pin-ring{
  inset:-4px;
  border-color:rgba(255,255,255,.08);
  box-shadow:none;
  opacity:.32;
}
.map-pin.family-legacy .pin-icon,
.map-pin.family-legacy > img{
  transform:scale(.89);
  opacity:.76;
  filter:
    brightness(.84)
    saturate(.76)
    drop-shadow(0 5px 9px rgba(0,0,0,.22));
}

.map-pin.family-rivalry{
  z-index:4;
}
.map-pin.family-rivalry .pin-ring{
  inset:-9px;
  border-width:2px;
  opacity:.94;
}
.map-pin.family-rivalry.is-neutral .pin-ring{
  border-color:rgba(184,208,255,.30);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.08),
    0 0 14px rgba(120,168,255,.10);
}
.map-pin.family-rivalry .pin-icon,
.map-pin.family-rivalry > img{
  transform:scale(1.05);
  filter:
    brightness(1.02)
    saturate(1.06)
    drop-shadow(0 8px 14px rgba(0,0,0,.28));
}

.map-pin.tier-low .chip{
  border-color:rgba(255,255,255,.08);
}
.map-pin.tier-high .pin-ring{
  inset:-11px;
  border-width:2px;
}
.map-pin.tier-high.is-neutral .pin-ring{
  border-color:rgba(116,192,255,.40);
  box-shadow:
    0 0 0 1px rgba(116,192,255,.12),
    0 0 18px rgba(116,192,255,.16);
}
.map-pin.tier-high .pin-icon,
.map-pin.tier-high > img{
  transform:scale(1.10);
}
.map-pin.tier-high{
  z-index:5;
}
.map-pin.tier-strategic{
  z-index:7;
}
.map-pin.tier-strategic .pin-ring{
  inset:-12px;
  border-width:2px;
}
.map-pin.tier-strategic.is-neutral .pin-ring{
  border-color:rgba(255,196,86,.44);
  box-shadow:
    0 0 0 1px rgba(255,196,86,.12),
    0 0 18px rgba(255,184,56,.18);
}
.map-pin.tier-strategic .pin-icon,
.map-pin.tier-strategic > img{
  transform:scale(1.14);
  filter:
    brightness(1.06)
    saturate(1.10)
    drop-shadow(0 10px 18px rgba(0,0,0,.30));
}

.map-pin.type-contracts.is-neutral .pin-ring{
  border-color:rgba(88,166,255,.36);
  box-shadow:
    0 0 0 1px rgba(88,166,255,.10),
    0 0 16px rgba(88,166,255,.12);
}
.map-pin.type-contracts .pin-icon,
.map-pin.type-contracts > img{
  filter:
    brightness(1.03)
    saturate(1.10)
    drop-shadow(0 0 10px rgba(88,166,255,.20));
}

/* pressure badges */
.map-pin .pin-pressure-badges{
  position:absolute;
  left:50%;
  top:-18px;
  transform:translateX(-50%);
  display:none;
  flex-wrap:nowrap;
  gap:3px;
  align-items:center;
  justify-content:center;
  width:max-content;
  max-width:none;
  pointer-events:none;
  z-index:4;
}
.map-pin .pin-pressure-chip{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:16px;
  padding:1px 6px;
  border-radius:999px;
  font-size:8px;
  line-height:1;
  font-weight:900;
  letter-spacing:.06em;
  white-space:nowrap;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(8,10,14,.76);
  backdrop-filter: blur(6px);
  box-shadow:0 3px 8px rgba(0,0,0,.16);
}
.map-pin .pin-pressure-chip.p-hot{
  color:#ffd7a6;
  background:rgba(255,116,24,.18);
  border-color:rgba(255,140,56,.34);
  box-shadow:0 0 0 1px rgba(255,140,56,.08), 0 0 18px rgba(255,116,24,.18);
}
.map-pin .pin-pressure-chip.p-contested{
  color:#ffd2d2;
  background:rgba(255,56,56,.18);
  border-color:rgba(255,88,88,.36);
  box-shadow:0 0 0 1px rgba(255,88,88,.08), 0 0 18px rgba(255,56,56,.18);
}
.map-pin .pin-pressure-chip.p-fortified{
  color:#d6e7ff;
  background:rgba(46,110,255,.18);
  border-color:rgba(96,144,255,.34);
  box-shadow:0 0 0 1px rgba(96,144,255,.08), 0 0 16px rgba(46,110,255,.12);
}
.map-pin .pin-pressure-chip.s-live{
  color:#ffd8d8;
  background:rgba(220,60,60,.20);
  border-color:rgba(255,92,92,.36);
  box-shadow:0 0 0 1px rgba(255,92,92,.08), 0 0 18px rgba(220,60,60,.18);
}
.map-pin .pin-pressure-chip.s-forming{
  color:#ffe1bf;
  background:rgba(255,140,40,.18);
  border-color:rgba(255,170,70,.34);
  box-shadow:0 0 0 1px rgba(255,170,70,.08), 0 0 18px rgba(255,140,40,.16);
}
.map-pin .pin-pressure-chip.s-cooldown{
  color:#cbfff0;
  background:rgba(50,180,145,.18);
  border-color:rgba(80,220,180,.34);
  box-shadow:0 0 0 1px rgba(80,220,180,.08), 0 0 16px rgba(50,180,145,.12);
}
.map-pin .pin-pressure-chip.p-calm{
  color:#dde6f3;
  background:rgba(255,255,255,.08);
  border-color:rgba(255,255,255,.14);
}
.map-pin.pressure-flashpoint{
  z-index:6;
}
.map-pin.pressure-flashpoint .pin-ring{
  box-shadow:
    0 0 0 2px rgba(255,255,255,.08),
    0 0 18px rgba(255,255,255,.12);
}
.map-pin.pressure-flashpoint .pin-pressure-chip{
  border-color:rgba(255,255,255,.24);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.08),
    0 0 18px rgba(255,255,255,.14);
}
.map-pin .pin-pressure-chip.p-tier{
  color:#eee;
  background:rgba(255,255,255,.08);
  border-color:rgba(255,255,255,.14);
}

/* optional subtle node feel from pressure overlay only */
.map-pin.pressure-hot:not(.pressure-contested):not(.siege-forming):not(.siege-running):not(.siege-cooldown) .pin-ring{
  box-shadow:
    0 0 0 1px rgba(255,146,72,.14),
    0 0 16px rgba(255,116,24,.20);
}
.map-pin.pressure-contested:not(.siege-forming):not(.siege-running):not(.siege-cooldown) .pin-ring{
  border-color: rgba(255,88,88,.90) !important;
  box-shadow:
    0 0 0 2px rgba(255,88,88,.14),
    0 0 18px rgba(255,56,56,.20) !important;
  animation: ahPressureConflict 1.8s ease-in-out infinite;
}
.map-pin.pressure-fortified:not(.pressure-contested):not(.siege-forming):not(.siege-running):not(.siege-cooldown) .pin-ring{
  border-color: rgba(120,170,255,.74);
  box-shadow:
    0 0 0 1px rgba(120,170,255,.14),
    0 0 12px rgba(80,130,255,.14);
}

/* faction colors */
.map-pin.f-rb .pin-ring{
  border-color: rgba(255,82,82,.95);
  box-shadow: 0 0 14px rgba(255,82,82,.35);
}
.map-pin.f-ew .pin-ring{
  border-color: rgba(255,213,74,.95);
  box-shadow: 0 0 14px rgba(255,213,74,.32);
}
.map-pin.f-pb .pin-ring{
  border-color: rgba(255,159,67,.95);
  box-shadow: 0 0 14px rgba(255,159,67,.32);
}
.map-pin.f-ih .pin-ring{
  border-color: rgba(64,196,255,.95);
  box-shadow: 0 0 14px rgba(64,196,255,.30);
}

.map-pin.f-rb .pin-badge{
  color: rgba(255,82,82,1);
  border-color: rgba(255,82,82,.35);
}
.map-pin.f-ew .pin-badge{
  color: rgba(255,213,74,1);
  border-color: rgba(255,213,74,.35);
}
.map-pin.f-pb .pin-badge{
  color: rgba(255,159,67,1);
  border-color: rgba(255,159,67,.35);
}
.map-pin.f-ih .pin-badge{
  color: rgba(64,196,255,1);
  border-color: rgba(64,196,255,.35);
}

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
.chip-state.p-contested{ background:rgba(255,56,56,.18); border-color:rgba(255,88,88,.30); color:#ffd2d2; }
.chip-state.p-hot{ background:rgba(255,116,24,.16); border-color:rgba(255,140,56,.30); color:#ffd7a6; }
.chip-state.p-fortified{ background:rgba(46,110,255,.16); border-color:rgba(96,144,255,.28); color:#d6e7ff; }

/* visual-state fallback chip */
.chip-state.node-visual-state{
  color:#e8eef8;
  background:rgba(255,255,255,.08);
  border-color:rgba(255,255,255,.12);
}
.chip-state.node-visual-state.v-live{
  background:rgba(15,255,159,.14);
  border-color:rgba(15,255,159,.28);
  color:#bfffe2;
}
.chip-state.node-visual-state.v-active{
  background:rgba(5,217,255,.14);
  border-color:rgba(5,217,255,.26);
  color:#c7f6ff;
}
.chip-state.node-visual-state.v-threatened{
  background:rgba(255,149,0,.14);
  border-color:rgba(255,149,0,.26);
  color:#ffe0b0;
}
.chip-state.node-visual-state.v-contested{
  background:rgba(255,42,109,.16);
  border-color:rgba(255,42,109,.28);
  color:#ffd0de;
}
.chip-state.node-visual-state.v-fortified{
  background:rgba(199,36,255,.15);
  border-color:rgba(199,36,255,.26);
  color:#f0d4ff;
}

.map-pin .chip-copy{
  display:flex;
  flex-direction:column;
  gap:4px;
  min-width:0;
}
.map-pin .chip-subrow{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  align-items:center;
}
.map-pin .chip-action{
  font-size:9px;
  line-height:1;
  font-weight:800;
  letter-spacing:.03em;
  opacity:.74;
}
.map-pin .chip-value{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:16px;
  padding:1px 6px;
  border-radius:999px;
  font-size:8px;
  line-height:1;
  font-weight:900;
  letter-spacing:.06em;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.08);
  color:#e7edf6;
}
.map-pin .chip-value[data-tier="STRATEGIC"]{
  color:#ffe5ae;
  background:rgba(255,184,56,.16);
  border-color:rgba(255,202,92,.26);
}
.map-pin .chip-value[data-tier="HIGH_VALUE"]{
  color:#d5f4ff;
  background:rgba(68,186,255,.16);
  border-color:rgba(96,204,255,.24);
}

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
@keyframes ahPressurePulse{
  0%,100%{ transform:translateY(0); filter:brightness(1); }
  50%{ transform:translateY(-1px); filter:brightness(1.08); }
}
@keyframes ahPressureHeat{
  0%,100%{ transform:scale(1); filter:brightness(1); }
  50%{ transform:scale(1.04); filter:brightness(1.08); }
}
@keyframes ahPressureConflict{
  0%,100%{ transform:scale(1); filter:brightness(1); }
  50%{ transform:scale(1.04); filter:brightness(1.08); }
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
    const key = String(owner || "").toLowerCase().trim();
    if (!key) return "";
    return `/images/ui/factions/icon_${key}.png`;
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
    if (!pinEl.querySelector(".pin-pressure-badges")) {
      const wrap = document.createElement("span");
      wrap.className = "pin-pressure-badges";
      pinEl.appendChild(wrap);
    }
  }

  function _clearFactionClasses(pinEl) {
    if (!pinEl) return;
    pinEl.classList.remove(
      "f-rb", "f-ew", "f-pb", "f-ih",
      "is-contested", "is-controlled",
      "siege-forming", "siege-running", "siege-cooldown",
      "is-live", "is-active", "is-threatened", "is-fortified", "is-neutral",
      "type-phantom", "type-bloodmoon", "type-siege", "type-oracle", "type-hq", "type-contracts", "type-generic",
      "family-rivalry", "family-legacy",
      "tier-low", "tier-high", "tier-strategic"
    );
  }

  function _clearPressureClasses(pinEl) {
    if (!pinEl) return;
    pinEl.classList.remove(
      "pressure-hot",
      "pressure-contested",
      "pressure-fortified",
      "pressure-flashpoint"
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

  function _normalizeNodeId(raw) {
    const key = String(raw || "").trim().toLowerCase();
    if (!key) return "";
    return NODE_ID_ALIASES[key] || key;
  }

  function _resolveNodeId(info) {
    const src = (info && typeof info === "object") ? info : {};
    return _normalizeNodeId(
      src?.nodeId ||
      src?.buildingId ||
      src?.id ||
      src?.building ||
      ""
    );
  }

  function _fallbackValueTierForNodeId(nodeId) {
    const key = _normalizeNodeId(nodeId);
    if (STRATEGIC_NODE_IDS.has(key)) return "STRATEGIC";
    if (HIGH_VALUE_NODE_IDS.has(key)) return "HIGH_VALUE";
    return "LOW_VALUE";
  }

  function _nodeFamilyFor(id, type, valueTier) {
    const key = _normalizeNodeId(id);
    const tier = String(valueTier || "").trim().toUpperCase();
    if (key === "oracle" || key === "oracle_void_doorway" || type === "oracle") return "";
    if (RIVALRY_NODE_IDS.has(key) || type === "hq" || type === "siege" || type === "bloodmoon" || type === "phantom" || type === "contracts") {
      return "rivalry";
    }
    if (LEGACY_NODE_IDS.has(key)) return "legacy";
    if (tier === "STRATEGIC" || tier === "HIGH_VALUE") return "rivalry";
    return "legacy";
  }

  function _valueTierClass(valueTier) {
    const key = String(valueTier || "").trim().toUpperCase();
    if (key === "STRATEGIC") return "tier-strategic";
    if (key === "HIGH_VALUE") return "tier-high";
    return "tier-low";
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

      if (n > top1) {
        top2 = top1;
        top1 = n;
        owner = fk;
      } else if (n > top2) {
        top2 = n;
      }
    }

    if (!(top1 > 0)) {
      return { owner: "", top1: 0, top2: 0 };
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

  function _extractPressureMeta(info) {
    const src = (info && typeof info === "object") ? info : {};

    const pressureDerivedStatus = String(
      src?.pressureDerivedStatus ||
      src?.derivedPressureStatus ||
      ""
    ).trim().toUpperCase();

    const captureTierNum = Number(src?.captureTier || 0);
    const captureTier = Number.isFinite(captureTierNum) ? captureTierNum : 0;

    const heat = Number(src?.heat || 0) || 0;
    const pressureDelta = Number(src?.pressureDelta || 0) || 0;
    const pressureTopValue = Number(src?.pressureTopValue || 0) || 0;

    const siegeStatus = String(
      src?.siegeStatus ||
      src?.currentSiegeStatus ||
      ""
    ).trim().toLowerCase();

    const isSiegeContested =
      siegeStatus === "forming" ||
      siegeStatus === "running";

    const explicitPressureContestedRaw =
      src?.isPressureContested ??
      src?.pressureContested ??
      src?.pressureIsContested ??
      src?.pressure_contested;

    const hasExplicitPressureContested =
      explicitPressureContestedRaw !== undefined &&
      explicitPressureContestedRaw !== null &&
      String(explicitPressureContestedRaw).trim() !== "";

    const explicitPressureContested = hasExplicitPressureContested
      ? !/^(false|0|no)$/i.test(String(explicitPressureContestedRaw).trim())
      : false;

    const fallbackPressureContested =
      !isSiegeContested &&
      (
        !!src?.isContested ||
        !!src?.contested
      );

    const isPressureContested =
      explicitPressureContested ||
      pressureDerivedStatus === "CONTESTED" ||
      fallbackPressureContested;

    const isContested = isPressureContested || isSiegeContested;

    const isFortified =
      !!src?.isFortified ||
      pressureDerivedStatus === "FORTIFIED" ||
      pressureDerivedStatus === "OWNED" ||
      pressureDerivedStatus === "SECURED" ||
      (captureTier >= 2 && !isContested);

    const isHot =
      !!src?.isHot ||
      pressureDerivedStatus === "HOT" ||
      pressureDerivedStatus === "HEATING" ||
      heat >= 10 ||
      pressureDelta >= 10 ||
      pressureTopValue >= 15;

    return {
      isHot,
      isContested,
      isPressureContested,
      isSiegeContested,
      isFortified,
      captureTier,
      pressureDerivedStatus: pressureDerivedStatus || "NEUTRAL",
      heat,
      pressureDelta,
      pressureTopValue,
    };
  }

  function _readViewerFactionFallback() {
    let cachedFaction = "";
    try { cachedFaction = localStorage.getItem("ah_faction") || ""; } catch (_) {}

    return _normFactionKey(
      window.currentUserFaction ||
      window.PLAYER_STATE?.profile?.faction ||
      window.PLAYER_STATE?.profile?.factionKey ||
      window.PLAYER_STATE?.faction ||
      cachedFaction ||
      ""
    );
  }

  function _getFactionStore() {
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
      value: "",
      get() {
        const next = _readViewerFactionFallback() || _normFactionKey(store.value);
        store.value = next || "";
        return store.value;
      },
      set(raw) {
        const next = _normFactionKey(raw);
        const prev = _normFactionKey(store.value);
        store.value = next || "";
        if (prev === store.value && _normFactionKey(window.currentUserFaction || "") === store.value) {
          return store.value;
        }
        try {
          if (store.value) localStorage.setItem("ah_faction", store.value);
          else localStorage.removeItem("ah_faction");
        } catch (_) {}
        try { window.currentUserFaction = store.value; } catch (_) {}
        try { window.AHMap?.reapplyLastLeaders?.(); } catch (_) {}
        return store.value;
      },
      clear() {
        const prev = _normFactionKey(store.value || window.currentUserFaction || "");
        store.value = "";
        if (!prev) return "";
        try { localStorage.removeItem("ah_faction"); } catch (_) {}
        try { window.currentUserFaction = ""; } catch (_) {}
        try { window.AHMap?.reapplyLastLeaders?.(); } catch (_) {}
        return "";
      }
    };

    window.__AHFactionStore = store;
    store.get();
    return store;
  }

  function _getViewerFaction() {
    try { return _getFactionStore().get(); } catch (_) {}
    return _readViewerFactionFallback();
  }

  function _normalizeDisplayStatus(raw) {
    const key = String(raw || "").trim().toUpperCase();
    if (!key) return "";
    if (key === "UNDER_ATTACK" || key === "SIEGE" || key === "LIVE") return "SIEGE_LIVE";
    if (key === "CLAIMING" || key === "FORMING") return "SIEGE_FORMING";
    if (key === "COOLDOWN") return "SIEGE_COOLDOWN";
    if (key === "SECURED" || key === "NEUTRAL") return "CALM";
    return key;
  }

  function _fallbackDisplayStatus(info) {
    const src = (info && typeof info === "object") ? info : {};
    const siegeStatus = String(src?.siegeStatus || src?.currentSiegeStatus || "").trim().toLowerCase();
    if (siegeStatus === "running") return "SIEGE_LIVE";
    if (siegeStatus === "forming") return "SIEGE_FORMING";
    if (siegeStatus === "cooldown") return "SIEGE_COOLDOWN";

    const pressureMeta = _extractPressureMeta(src);
    if (pressureMeta.isPressureContested) return "CONTESTED";
    if (pressureMeta.isHot) return "HOT";
    if (pressureMeta.isFortified) return "FORTIFIED";
    return "CALM";
  }

  function _nodeOwnerFaction(info) {
    return _normFactionKey(
      info?.effectiveOwnerFaction ||
      info?.ownerFaction ||
      info?.owner ||
      ""
    );
  }

  function _statusChipLabel(displayStatus) {
    const key = _normalizeDisplayStatus(displayStatus);
    const labels = {
      SIEGE_LIVE: "LIVE",
      SIEGE_FORMING: "FORMING",
      SIEGE_COOLDOWN: "COOLDOWN",
      CONTESTED: "CONTESTED",
      HOT: "HOT",
      FORTIFIED: "FORTIFIED",
      CALM: "CALM"
    };
    return labels[key] || "CALM";
  }

  function _statusChipClass(displayStatus) {
    const key = _normalizeDisplayStatus(displayStatus);
    if (key === "SIEGE_LIVE") return "s-live";
    if (key === "SIEGE_FORMING") return "s-forming";
    if (key === "SIEGE_COOLDOWN") return "s-cooldown";
    if (key === "CONTESTED") return "p-contested";
    if (key === "HOT") return "p-hot";
    if (key === "FORTIFIED") return "p-fortified";
    return "p-calm";
  }

  function _valueTierLabel(valueTier) {
    const key = String(valueTier || "").trim().toUpperCase();
    if (key === "STRATEGIC") return "Strategic";
    if (key === "HIGH_VALUE") return "High Value";
    return "Support";
  }

  function _valueMultiplierForTier(valueTier) {
    const key = String(valueTier || "").trim().toUpperCase();
    if (key === "STRATEGIC") return 2.0;
    if (key === "HIGH_VALUE") return 1.5;
    return 1.0;
  }

  function _valueText(valueTier) {
    const key = String(valueTier || "").trim().toUpperCase();
    if (key === "STRATEGIC") return "A major node that can shift local faction pressure.";
    if (key === "HIGH_VALUE") return "Gives stronger faction progress and control impact.";
    return "Helps with steady faction support.";
  }

  function _statusText(displayStatus) {
    const key = _normalizeDisplayStatus(displayStatus);
    const labels = {
      SIEGE_LIVE: "A live battle for this node is underway.",
      SIEGE_FORMING: "An assault is gathering here.",
      SIEGE_COOLDOWN: "This frontline is resetting after a siege.",
      CONTESTED: "Control is being actively challenged.",
      HOT: "Pressure is rising here.",
      FORTIFIED: "This node is strongly secured.",
      CALM: "This node is stable right now."
    };
    return labels[key] || "This node is stable right now.";
  }

  function _deriveActionHint(displayStatus, effectiveOwner, viewerFaction) {
    const owner = _normFactionKey(effectiveOwner || "");
    const viewer = _normFactionKey(viewerFaction || "");
    const sameOwner = !!(owner && viewer && owner === viewer);
    const neutral = !owner;

    if (displayStatus === "SIEGE_LIVE") return "Join now";
    if (displayStatus === "SIEGE_FORMING") return "Join siege";
    if (displayStatus === "SIEGE_COOLDOWN") {
      if (sameOwner) return "Hold";
      if (viewer && owner && owner !== viewer) return "Low priority";
      return "Patrol";
    }
    if (displayStatus === "CONTESTED") {
      if (sameOwner) return "Defend";
      if (viewer) return "Push";
      return "Respond";
    }
    if (displayStatus === "HOT") {
      if (sameOwner) return "Defend";
      if (neutral) return "Patrol";
      if (viewer) return "Pressure";
      return "Patrol";
    }
    if (displayStatus === "FORTIFIED") {
      if (sameOwner) return "Hold";
      if (viewer && owner && owner !== viewer) return "Low priority";
      return "Hold";
    }
    if (sameOwner || neutral) return "Patrol";
    if (viewer) return "Scout";
    return "Patrol";
  }

  function _deriveUrgency(displayStatus, effectiveOwner, viewerFaction, valueTier) {
    const owner = _normFactionKey(effectiveOwner || "");
    const viewer = _normFactionKey(viewerFaction || "");
    const sameOwner = !!(owner && viewer && owner === viewer);

    if (displayStatus === "SIEGE_LIVE") return "critical";
    if (displayStatus === "SIEGE_FORMING" || displayStatus === "CONTESTED") return "high";
    if (displayStatus === "HOT") return sameOwner ? "high" : "medium";
    if (displayStatus === "SIEGE_COOLDOWN") return valueTier === "STRATEGIC" ? "medium" : "low";
    if (displayStatus === "FORTIFIED") return valueTier === "LOW_VALUE" ? "low" : "medium";
    return "low";
  }

  function _extractNodeUx(info, viewerFaction) {
    const src = (info && typeof info === "object") ? info : {};
    const displayStatus = _normalizeDisplayStatus(src?.displayStatus) || _fallbackDisplayStatus(src);
    const nodeId = _resolveNodeId(src);
    const valueTier = String(src?.valueTier || _fallbackValueTierForNodeId(nodeId)).trim().toUpperCase() || "LOW_VALUE";
    const ownerFaction = _nodeOwnerFaction(src);
    const viewer = _normFactionKey(src?.youFaction || viewerFaction || _getViewerFaction());

    let actionHint = String(src?.actionHint || "").trim();
    if (!actionHint || viewer) {
      actionHint = _deriveActionHint(displayStatus, ownerFaction, viewer);
    }

    const urgency = String(src?.urgency || "").trim().toLowerCase() || _deriveUrgency(displayStatus, ownerFaction, viewer, valueTier);

    return {
      displayStatus,
      displayLabel: _statusChipLabel(displayStatus),
      displayClass: _statusChipClass(displayStatus),
      statusText: _statusText(displayStatus),
      actionHint,
      urgency,
      nodeId,
      valueTier,
      valueMultiplier: Number(src?.valueMultiplier || 0) || _valueMultiplierForTier(valueTier),
      valueLabel: _valueTierLabel(valueTier),
      valueText: String(src?.valueText || "").trim() || _valueText(valueTier),
      ownerFaction,
      reasonText: String(src?.reasonText || "").trim() || _statusText(displayStatus),
      rewardText: String(src?.rewardText || "").trim() || "Helping here supports weekly faction progress."
    };
  }

  function _pressureBadgesHtml(pressureMeta, nodeUx) {
    const ux = nodeUx || {};
    const displayStatus = _normalizeDisplayStatus(ux.displayStatus);
    if (
      displayStatus !== "SIEGE_LIVE" &&
      displayStatus !== "SIEGE_FORMING" &&
      displayStatus !== "CONTESTED"
    ) {
      return "";
    }
    const text = String(ux.displayLabel || "").trim();
    const cls = String(ux.displayClass || "").trim();
    if (!text || !cls) return "";
    return `<span class="pin-pressure-chip ${cls}">${text}</span>`;
  }

  function _primaryPressureChip(pressureMeta) {
    const meta = pressureMeta || {};
    if (meta.isPressureContested) return { text: "CONTESTED", cls: "p-contested" };
    if (meta.isHot) return { text: "HOT", cls: "p-hot" };
    if (meta.isFortified) return { text: "FORTIFIED", cls: "p-fortified" };
    return null;
  }

  function _pressureTone(pressureMeta) {
    const primary = _primaryPressureChip(pressureMeta);
    if (!primary) return "calm";
    if (primary.cls === "p-contested") return "contested";
    if (primary.cls === "p-hot") return "hot";
    if (primary.cls === "p-fortified") return "fortified";
    return "calm";
  }

  function _flashpointScore(siegeMeta, pressureMeta) {
    const siege = siegeMeta || {};
    const pressure = pressureMeta || {};
    const status = String(siege.siegeStatus || "");

    let score = 0;
    if (status === "running") score += 140;
    else if (status === "forming") score += 105;

    if (pressure.isPressureContested) score += 100;
    else if (pressure.isHot) score += 58;
    else return 0;

    score += Math.min(30, Number(pressure.pressureTopValue || 0));
    score += Math.min(22, Number(pressure.pressureDelta || 0));
    score += Math.min(18, Number(pressure.heat || 0));
    return score;
  }

  function _updateMapPressureMood(summary) {
    const el = document.getElementById("mapPressureMood");
    if (!el) return;

    const counts = summary || {};
    const contested = Number(counts.contested || 0);
    const hot = Number(counts.hot || 0);
    const fortified = Number(counts.fortified || 0);

    const parts = [];
    if (contested > 0) parts.push(`${contested} contested`);
    if (hot > 0) parts.push(`${hot} hot`);
    if (!contested && fortified > 0) parts.push(`${fortified} fortified`);

    const tone = contested > 0
      ? "contested"
      : hot > 0
        ? "hot"
        : fortified > 0
          ? "fortified"
          : "calm";

    el.dataset.tone = tone;
    el.textContent = parts.length ? parts.join(" • ").toUpperCase() : "CALM";
    el.hidden = false;
  }

  function _applyPressureBadges(pinEl, pressureMeta, nodeUx) {
    if (!pinEl) return;
    ensureLevel1(pinEl);

    const meta = pressureMeta || {};
    const ux = nodeUx || {};
    const isPressureContested = !!meta.isPressureContested;
    const wrap = pinEl.querySelector(".pin-pressure-badges");

    pinEl.dataset.pressureHot = meta.isHot ? "1" : "0";
    pinEl.dataset.pressureContested = isPressureContested ? "1" : "0";
    pinEl.dataset.pressureFortified = meta.isFortified ? "1" : "0";
    pinEl.dataset.captureTier = String(meta.captureTier || 0);
    pinEl.dataset.pressureDerivedStatus = String(meta.pressureDerivedStatus || "");

    _clearPressureClasses(pinEl);

    if (meta.isHot) pinEl.classList.add("pressure-hot");
    if (isPressureContested) pinEl.classList.add("pressure-contested");
    if (meta.isFortified) pinEl.classList.add("pressure-fortified");

    if (!wrap) return;

    const html = pinEl.classList.contains("active") ? "" : _pressureBadgesHtml(meta, ux);
    wrap.innerHTML = html;
    wrap.style.display = html ? "flex" : "none";
  }

  function resolveNodeLeader(meta, info) {
    const liveNode = !!meta?.liveFactionNode;
    const safeInfo = (info && typeof info === "object") ? info : {};
    const scores = _extractScores(safeInfo);
    const siegeMeta = _extractSiegeMeta(safeInfo);
    const pressureMeta = _extractPressureMeta(safeInfo);
    const nodeUx = _extractNodeUx(safeInfo);

    // LIVE nodes: truth only from leadersMap/backend
    if (liveNode) {
      const top = _resolveTopFaction(scores);

      // trust ONLY explicit ownership fields
      // never use generic "faction" as owner
      const explicitOwner = _normFactionKey(
        safeInfo?.ownerFaction ??
        safeInfo?.owner ??
        ""
      );

      const owner = explicitOwner || (top.top1 > 0 ? top.owner : "") || "";

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
        source: explicitOwner ? "ownerFaction" : (top.top1 > 0 ? "scores" : "none"),
        siegeMeta,
        pressureMeta,
        nodeUx
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
      siegeMeta,
      pressureMeta,
      nodeUx
    };
  }

  function _leaderBadgeText(owner) {
    return CODE[owner] || "";
  }

  function _applySiegeStateClasses(pinEl, siegeMeta) {
    const status = String(siegeMeta?.siegeStatus || "");
    if (status === "forming") pinEl.classList.add("siege-forming");
    if (status === "running") pinEl.classList.add("siege-running");
    if (status === "cooldown") pinEl.classList.add("siege-cooldown");
  }

  function _clearPinBadge(badge) {
    if (!badge) return;
    badge.classList.remove("is-faction");
    badge.innerHTML = "";
    badge.textContent = "";
    badge.style.display = "none";
  }

  function _setFactionPinBadge(badge, owner, code) {
    if (!badge) return;
    badge.classList.add("is-faction");
    badge.innerHTML = `
      <img src="${iconUrl(owner)}" alt="${esc(owner)}" />
      <span class="pin-badge-fallback">${esc(code)}</span>
    `;
    badge.style.display = "grid";
    const img = badge.querySelector("img");
    const fallback = badge.querySelector(".pin-badge-fallback");
    if (img) {
      img.onerror = () => {
        img.remove();
        if (fallback) fallback.style.display = "grid";
      };
    }
  }

  function _setTextPinBadge(badge, text) {
    if (!badge) return;
    badge.classList.remove("is-faction");
    badge.textContent = text || "";
    badge.style.display = text ? "grid" : "none";
  }

  function _deriveNodeVisualModel(pinEl, owner, opts) {
    const o = (opts && typeof opts === "object") ? opts : {};
    const siegeMeta = o.siegeMeta || {};
    const pressureMeta = o.pressureMeta || {};
    const nodeUx = o.nodeUx || {};
    const siegeStatus = String(siegeMeta.siegeStatus || "").trim().toLowerCase();
    const displayStatus = _normalizeDisplayStatus(nodeUx.displayStatus) || _fallbackDisplayStatus({
      ...o,
      ...siegeMeta,
      ...pressureMeta
    });

    const id = _normalizeNodeId(_pinBuildingId(pinEl) || _pinNodeId(pinEl) || "");
    const faction = _normFactionKey(owner || "");
    const valueTier = String(nodeUx.valueTier || _fallbackValueTierForNodeId(id)).trim().toUpperCase() || "LOW_VALUE";

    let type = "generic";
    if (id === "phantom_nodes") type = "phantom";
    else if (id === "blood_moon_tower") type = "bloodmoon";
    else if (id === "oracle" || id === "oracle_void_doorway") type = "oracle";
    else if (id === "edge_of_chain" || siegeStatus === "forming" || siegeStatus === "running" || siegeStatus === "cooldown") type = "siege";
    else if (id.includes("_hq") || id === "alpha_network_hq") type = "hq";
    else if (id === "broken_contracts") type = "contracts";

    let status = "";
    if (displayStatus === "CONTESTED") status = "contested";
    else if (displayStatus === "SIEGE_LIVE") status = "live";
    else if (displayStatus === "SIEGE_FORMING" || displayStatus === "HOT") status = "threatened";
    else if (displayStatus === "SIEGE_COOLDOWN" || displayStatus === "FORTIFIED") status = "fortified";
    else if (displayStatus === "CALM" && faction) status = "active";

    const chip = displayStatus === "CALM"
      ? ""
      : String(nodeUx.displayLabel || _statusChipLabel(displayStatus) || "");

    return {
      faction,
      type,
      status,
      chip,
      family: _nodeFamilyFor(id, type, valueTier),
      valueTier,
      tierClass: _valueTierClass(valueTier)
    };
  }

  function _applyNodeVisualClasses(pinEl, model) {
    if (!pinEl) return;

    const m = (model && typeof model === "object") ? model : {};

    pinEl.classList.remove(
      "f-rb", "f-ew", "f-pb", "f-ih", "is-neutral", "is-controlled",
      "is-live", "is-active", "is-threatened", "is-contested", "is-fortified",
      "type-phantom", "type-bloodmoon", "type-siege", "type-oracle", "type-hq", "type-contracts", "type-generic",
      "family-rivalry", "family-legacy",
      "tier-low", "tier-high", "tier-strategic"
    );

    if (m.faction) {
      const cls = CLS[m.faction] || "";
      if (cls) pinEl.classList.add(cls);
      pinEl.classList.add("is-controlled");
    } else {
      pinEl.classList.add("is-neutral");
    }

    if (m.status) pinEl.classList.add(`is-${m.status}`);
    if (m.type) pinEl.classList.add(`type-${m.type}`);
    if (m.family) pinEl.classList.add(`family-${m.family}`);
    if (m.tierClass) pinEl.classList.add(m.tierClass);

    const chipEl = pinEl.querySelector(".chip");
    if (!chipEl) return;

    let visualState = chipEl.querySelector(".chip-state.node-visual-state");

    if (!m.chip) {
      if (visualState) visualState.remove();
      return;
    }

    if (!visualState) {
      visualState = document.createElement("span");
      visualState.className = "chip-state node-visual-state";
      chipEl.appendChild(visualState);
    }

    visualState.className = `chip-state node-visual-state v-${m.status || "generic"}`;
    visualState.textContent = m.chip;
  }

  function _applyPinVisualState(pinEl, visualModel, opts) {
    const o = (opts && typeof opts === "object") ? opts : {};
    _applyNodeVisualClasses(pinEl, visualModel);
    _applySiegeStateClasses(pinEl, o.siegeMeta || {});
    _applyPressureBadges(pinEl, o.pressureMeta || {}, o.nodeUx || {});
  }

  function setLeader(pinEl, owner, opts) {
    ensureCss();
    ensureLevel1(pinEl);

    const name = pinEl.dataset.nodeName || "";
    const contested = !!opts?.contested;
    const source = String(opts?.source || "");
    const siegeMeta = opts?.siegeMeta || {};
    const pressureMeta = opts?.pressureMeta || {};
    const nodeUx = opts?.nodeUx || _extractNodeUx({
      ownerFaction: owner || "",
      ...siegeMeta,
      ...pressureMeta
    });

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
    pinEl.dataset.displayStatus = String(nodeUx?.displayStatus || "");
    pinEl.dataset.actionHint = String(nodeUx?.actionHint || "");
    pinEl.dataset.valueTier = String(nodeUx?.valueTier || "");
    pinEl.dataset.urgency = String(nodeUx?.urgency || "");

    const visualModel = _deriveNodeVisualModel(pinEl, owner, {
      contested,
      siegeMeta,
      pressureMeta,
      nodeUx
    });

    if (chip) {
      const actionHtml = nodeUx?.actionHint
        ? `<span class="chip-action">${esc(nodeUx.actionHint)}</span>`
        : "";
      chip.innerHTML = `
        <span class="chip-copy">
          <span class="chip-name">${esc(name)}</span>
          ${actionHtml
            ? `<span class="chip-subrow">${actionHtml}</span>`
            : ""}
        </span>
      `;
    }

    if (!owner) {
      _clearPinBadge(badge);
      _applyPinVisualState(pinEl, visualModel, { siegeMeta, pressureMeta, nodeUx });
      return;
    }

    const code = CODE[owner] || "";
    const badgeText = _leaderBadgeText(owner);

    if (badge) {
      if (badgeText && badgeText !== code) {
        _setTextPinBadge(badge, badgeText);
      } else if (code) {
        _setFactionPinBadge(badge, owner, code);
      } else {
        _clearPinBadge(badge);
      }
    }

    _applyPinVisualState(pinEl, visualModel, { siegeMeta, pressureMeta, nodeUx });
  }

  function _clearLeader(pinEl, nodeInfo) {
    setLeader(pinEl, null, {
      contested: false,
      source: "clear",
      siegeMeta: {},
      pressureMeta: {},
      nodeUx: _extractNodeUx(nodeInfo || {
        nodeId: _pinNodeId(pinEl),
        buildingId: _pinBuildingId(pinEl),
        name: pinEl?.dataset?.nodeName || ""
      })
    });
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
      _clearLeader(pinEl, node);
      return;
    }

    // non-live nodes: no leader badge at all
    _clearLeader(pinEl, node);
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

  function _findLeaderInfoByNodeId(nodeId, leadersMap) {
    const key = String(nodeId || "").trim();
    if (!key || !leadersMap || typeof leadersMap !== "object") return null;

    if (leadersMap[key]) return leadersMap[key];

    for (const [k, v] of Object.entries(leadersMap)) {
      if (!v || typeof v !== "object") continue;

      const candNodeId =
        String(v.nodeId || v.id || "").trim();

      const candBuildingId =
        String(v.buildingId || v.building || "").trim();

      if (candNodeId === key || candBuildingId === key || String(k).trim() === key) {
        return v;
      }
    }

    return null;
  }

  function getPressureMeta(nodeId) {
    const info = _findLeaderInfoByNodeId(nodeId, _lastLeadersMap);
    return _extractPressureMeta(info || {});
  }

  function getPressureState(nodeId) {
    const meta = getPressureMeta(nodeId);
    const primary = _primaryPressureChip(meta);
    return primary ? primary.text : "";
  }

  function getPressureNote(nodeId) {
    const meta = getPressureMeta(nodeId);

    if (meta.isPressureContested) {
      return "Actively contested. Multiple factions are pushing this node.";
    }
    if (meta.isHot) {
      return "Pressure is rising here. This node is heating up.";
    }
    if (meta.isFortified) {
      return "This node is currently well fortified.";
    }
    return "";
  }

  function getPressureSummary(nodeId) {
    const meta = getPressureMeta(nodeId);
    return {
      state: getPressureState(nodeId),
      note: getPressureNote(nodeId),
      captureTier: Number(meta.captureTier || 0) || 0,
      isHot: !!meta.isHot,
      isContested: !!meta.isContested,
      isPressureContested: !!meta.isPressureContested,
      isSiegeContested: !!meta.isSiegeContested,
      isFortified: !!meta.isFortified,
      pressureDerivedStatus: String(meta.pressureDerivedStatus || "")
    };
  }

  function getNodeUx(nodeId, infoOverride) {
    const info = (infoOverride && typeof infoOverride === "object")
      ? infoOverride
      : _findLeaderInfoByNodeId(nodeId, _lastLeadersMap) || { nodeId };
    return _extractNodeUx(info, _getViewerFaction());
  }

  function applyLeaders(leadersMap) {
    if (!leadersMap || typeof leadersMap !== "object") return;
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    _lastLeadersMap = leadersMap;
    try { API._leadersMap = leadersMap; } catch (_) {}

    const pins = document.querySelectorAll(_getPinsSelector());
    const mood = { contested: 0, hot: 0, fortified: 0 };
    let flashpointPin = null;
    let flashpointScore = 0;

    pins.forEach((pin) => {
      pin.classList.remove("pressure-flashpoint");
    });

    pins.forEach((pin) => {
      ensureLevel1(pin);

      // hard gate: badges only for live faction nodes
      if (!_isLiveFactionNodeFromPin(pin)) {
        _clearLeader(pin, {
          nodeId: _pinNodeId(pin),
          buildingId: _pinBuildingId(pin),
          name: pin.dataset.nodeName || ""
        });
        return;
      }

      const info = _findLeaderInfoForPin(pin, leadersMap);
      if (!info) {
        _clearLeader(pin, {
          nodeId: _pinNodeId(pin),
          buildingId: _pinBuildingId(pin),
          name: pin.dataset.nodeName || ""
        });
        return;
      }

      const ex = resolveNodeLeader(
        { liveFactionNode: true },
        info
      );

      const tone = _pressureTone(ex.pressureMeta || {});
      if (tone === "contested") mood.contested += 1;
      else if (tone === "hot") mood.hot += 1;
      else if (tone === "fortified") mood.fortified += 1;

      const score = _flashpointScore(ex.siegeMeta || {}, ex.pressureMeta || {});
      if (score > flashpointScore) {
        flashpointScore = score;
        flashpointPin = pin;
      }

      setLeader(pin, ex.owner || null, {
        contested: !!ex.contested,
        source: ex.source || "scores",
        siegeMeta: ex.siegeMeta || {},
        pressureMeta: ex.pressureMeta || {},
        nodeUx: ex.nodeUx || {}
      });
    });

    if (flashpointPin && flashpointScore > 0) {
      flashpointPin.classList.add("pressure-flashpoint");
    }

    _updateMapPressureMood(mood);
    window.__ahPerf?.log?.("AHMap.applyLeaders", perfT0, { pins: pins.length });
  }

  function _isMapVisible() {
    const mapBack = document.getElementById("mapBack");
    if (!mapBack) return false;
    const display = mapBack.style.display || window.getComputedStyle?.(mapBack)?.display || "";
    return display !== "none";
  }

  function _scheduleReapply() {
    if (!_isMapVisible() || !_lastLeadersMap) return;
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
      if (!_isMapVisible()) return;
      setTimeout(_scheduleReapply, 50);
    }, true);

    document.addEventListener("touchend", () => {
      if (!_isMapVisible()) return;
      setTimeout(_scheduleReapply, 50);
    }, true);
  }

  async function refreshLeaders() {
    if (window.Influence?.refreshLeaders) {
      return window.Influence.refreshLeaders(true);
    }
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
    getPressureMeta,
    getPressureState,
    getPressureNote,
    getPressureSummary,
    getNodeUx,
    getViewerFaction: _getViewerFaction,
    reapplyLastLeaders: () => {
      if (_lastLeadersMap) applyLeaders(_lastLeadersMap);
    }
  };

  window.AHMap = API;
  window.Map = window.Map || API;
})();
