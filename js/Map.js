// js/map.js — Alpha Husky Map module (Level 1 faction leader UI)
// Works with map.json nodes[].uiHint.owner + uiHint.state
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
  display:grid; place-items:center;
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

  function setLeader(pinEl, owner, opts) {
  ensureCss();

  const chip = pinEl.querySelector(".chip");
  if (!chip) return;

  const name = pinEl.dataset.nodeName || "";
  const contested = !!(opts && opts.contested);

  // ✅ contested hook (puls z CSS)
  pinEl.classList.toggle("is-contested", contested);

  // no owner → sama nazwa
  if (!owner) {
    chip.innerHTML = `<span class="chip-name">${esc(name)}</span>`;
    return;
  }

  const code = CODE[owner] || "";
  const cls  = CLS[owner] || "";

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

  // Call this during pin creation
  function decoratePin(pinEl, node) {
  ensureCss();
  ensureLevel1(pinEl);

  if (node?.id) pinEl.dataset.nodeId = node.id;
  if (node?.buildingId) pinEl.dataset.buildingId = node.buildingId;

  // ✅ żeby setLeader znał nazwę bez dostępu do `node`
  if (node?.name) pinEl.dataset.nodeName = node.name;

  const owner = node?.uiHint?.owner || null;
  const st = (node?.uiHint?.state || "").toLowerCase();
  const contested = st === "contested" || st === "war" || st === "hot";
  setLeader(pinEl, owner, { contested });
  }
  // Later: apply real leaders from backend state (optional)
  // leadersMap: { [nodeId]: { leaderFaction, contested } }
  function applyLeaders(leadersMap) {
  if (!leadersMap) return;
  document.querySelectorAll(".hotspot[data-node-id]").forEach((pin) => {
    const id = pin.dataset.nodeId;
    const info = leadersMap[id];
    if (!info) return;
    setLeader(pin, info.leaderFaction || null, { contested: !!info.contested });
  });
  }

  function init() {
    if (_inited) return;
    _inited = true;
    ensureCss();
  }

  window.Map = {
    init,
    decoratePin,
    setLeader,
    applyLeaders,
  };
})();
