// js/map.js — Alpha Husky Map module (Faction leader UI + backend leadersMap)
// Works with map.json nodes[].uiHint.owner + uiHint.state
// Also supports backend leadersMap from /webapp/map/leaders and /webapp/influence/action
(function () {
  let _inited = false;

  const FACTIONS = {
    rogue_byte:   { cls: "f-rb", code: "RB" },
    echo_wardens: { cls: "f-ew", code: "EW" },
    pack_burners: { cls: "f-pb", code: "PB" },
    inner_howl:   { cls: "f-ih", code: "IH" },
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
  display:none; /* show only when leader exists */
  place-items:center;
  font-size:10px; font-weight:800;
  background:rgba(0,0,0,.72);
  border:1px solid rgba(255,255,255,.18);
  pointer-events:none;
  z-index:3;
}
/* keep icon above ring */
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

/* optional contested pulse */
.map-pin.is-contested .pin-ring{ animation: ahPinPulse 1.6s ease-in-out infinite; }
@keyframes ahPinPulse{ 0%,100%{transform:scale(1);opacity:.85;} 50%{transform:scale(1.08);opacity:1;} }
`;
    document.head.appendChild(s);
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

  const CODE = { rogue_byte:"RB", echo_wardens:"EW", pack_burners:"PB", inner_howl:"IH" };
  const CLS  = { rogue_byte:"f-rb", echo_wardens:"f-ew", pack_burners:"f-pb", inner_howl:"f-ih" };
  const iconUrl = (owner) => `images/ui/factions/${owner}_color.svg`;

  function esc(s){
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  function _clearFactionClasses(pinEl){
    pinEl.classList.remove("f-rb","f-ew","f-pb","f-ih");
  }

  // Front can receive leadersMap in various shapes; be tolerant
  function _extractLeader(info){
    // returns { owner, contested, top1, top2 }
    const factions = ["rogue_byte","echo_wardens","pack_burners","inner_howl"];

    if (!info) return { owner:"", contested:false, top1:0, top2:0 };

    // if backend returns string
    if (typeof info === "string") return { owner: info, contested:false, top1:0, top2:0 };

    // common keys
    const owner =
      info.leaderFaction || info.leader_faction ||
      info.leaderKey || info.leader_key ||
      info.leader || info.faction || info.factionKey || info.topFaction || "";

    const contested =
      !!(info.contested || info.isContested || info.is_contested || info.warn || info.warning);

    // also allow map like { rogue_byte:1200, echo_wardens:900, ... }
    let top1 = 0, top2 = 0, topOwner = "";
    for (const k of factions){
      const v = info[k];
      const n = (typeof v === "number") ? v : (typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
      if (!Number.isFinite(n)) continue;
      if (n >= top1) { top2 = top1; top1 = n; topOwner = k; }
      else if (n > top2) { top2 = n; }
    }

    const finalOwner = owner || topOwner || "";
    const finalContested = contested || (top1 > 0 && ((top1 - top2) / top1) < 0.12);

    return { owner: finalOwner, contested: finalContested, top1, top2 };
  }

  function setLeader(pinEl, owner, opts) {
    ensureCss();
    ensureLevel1(pinEl);

    const name = pinEl.dataset.nodeName || "";
    const contested = !!(opts && opts.contested);

    // contested hook (puls z CSS)
    pinEl.classList.toggle("is-contested", contested);

    const badge = pinEl.querySelector(".pin-badge");

    _clearFactionClasses(pinEl);

    // no owner → hide ring/badge; chip shows name only
    if (!owner) {
      if (badge) { badge.textContent = ""; badge.style.display = "none"; }
      const chip = pinEl.querySelector(".chip");
      if (chip) chip.innerHTML = `<span class="chip-name">${esc(name)}</span>`;
      return;
    }

    const code = CODE[owner] || "";
    const cls  = CLS[owner] || "";
    if (cls) pinEl.classList.add(cls);

    if (badge) {
      badge.textContent = code || "";
      badge.style.display = "grid";
    }

    const chip = pinEl.querySelector(".chip");
    if (chip) {
      chip.innerHTML = `
        <span class="chip-faction ${cls}">
          <img src="${iconUrl(owner)}" alt="${esc(owner)}" style="width:12px;height:12px;display:block" />
        </span>
        <span class="chip-name">
          ${esc(name)}${code ? ` • ${code}` : ""}${contested ? ` <span class="chip-warn">⚠</span>` : ""}
        </span>
      `;

      // fallback gdy brakuje pliku
      const img = chip.querySelector("img");
      if (img) img.onerror = () => { img.style.display = "none"; };
    }
  }

  // Call this during pin creation
  function decoratePin(pinEl, node) {
    ensureCss();
    ensureLevel1(pinEl);

    if (node?.id) pinEl.dataset.nodeId = node.id;
    if (node?.buildingId) pinEl.dataset.buildingId = node.buildingId;

    // żeby setLeader znał nazwę bez dostępu do `node`
    if (node?.name) pinEl.dataset.nodeName = node.name;

    const owner = node?.uiHint?.owner || null;
    const st = (node?.uiHint?.state || "").toLowerCase();
    const contested = st === "contested" || st === "war" || st === "hot";
    setLeader(pinEl, owner, { contested });
  }

  // leadersMap can be keyed by nodeId OR buildingId
  function applyLeaders(leadersMap) {
    if (!leadersMap) return;

    document.querySelectorAll(".hotspot[data-node-id], .hotspot[data-nodeid]").forEach((pin) => {
      const nodeId = pin.dataset.nodeId || pin.getAttribute("data-node-id") || "";
      const buildingId = pin.dataset.buildingId || pin.getAttribute("data-building-id") || "";
      const info = leadersMap[buildingId] || leadersMap[nodeId];
      if (!info) return;

      const ex = _extractLeader(info);
      setLeader(pin, ex.owner || null, { contested: !!ex.contested });
    });
  }

  function init() {
    if (_inited) return;
    _inited = true;
    ensureCss();
  }

  window.AHMap = {
    init,
    decoratePin,
    setLeader,
    applyLeaders,
  };
})();
