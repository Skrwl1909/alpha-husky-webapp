(function () {
  const POLL_MS = 60 * 1000;
  const MAX_HIGHLIGHTS = 2;
  const STYLE_ID = "cta-surface-css";

  const STATE = {
    apiPost: null,
    tg: null,
    dbg: false,
    expanded: false,
    root: null,
    cardRoot: null,
    highlightsRoot: null,
    pollTimer: 0,
    lastData: null,
    visHandler: null,
    pageShowHandler: null,
  };

  function log(...args) {
    if (typeof STATE.dbg === "function") {
      try { STATE.dbg("[CTA]", ...args); } catch (_) {}
      return;
    }
    if (STATE.dbg) {
      console.debug("[CTA]", ...args);
    }
  }

  function warn(...args) {
    if (STATE.dbg) {
      console.warn("[CTA]", ...args);
    }
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getApiPost() {
    const fn = STATE.apiPost || window.apiPost || window.S?.apiPost || null;
    return typeof fn === "function" ? fn : null;
  }

  function escAttr(value) {
    return String(value || "")
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"');
  }

  function asText(value) {
    return String(value ?? "").trim();
  }

  function prettifyKind(kind) {
    const raw = asText(kind);
    if (!raw) return "";
    return raw
      .replaceAll("_", " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
#ctaSurface{
  width:min(
    520px,
    calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))
  );
  display:none;
  margin:6px auto 0;
}
#ctaSurface.is-visible{ display:block !important; }

#ctaCardRoot,
#ctaHighlightsRoot{
  width:100%;
}

#ctaHighlightsRoot{
  margin-top:4px;
}
#ctaHighlightsRoot:empty,
#ctaCardRoot:empty + #ctaHighlightsRoot{
  margin-top:0;
}

.cta-card,
.cta-highlight,
.cta-strip{
  width:100%;
  border:0;
  color:inherit;
  text-align:left;
  cursor:pointer;
  font:inherit;
  appearance:none;
  -webkit-appearance:none;
  outline:none;
}

/* legacy card — zostawione dla kompatybilności */
.cta-card{
  position:relative;
  display:block;
  padding:8px 10px;
  border-radius:13px;
  background:
    radial-gradient(circle at 14% 16%, rgba(0,229,255,.08), transparent 42%),
    radial-gradient(circle at 90% 12%, rgba(255,176,0,.08), transparent 36%),
    linear-gradient(180deg, rgba(9,13,18,.78), rgba(9,13,18,.90));
  border:1px solid rgba(255,255,255,.10);
  box-shadow:
    0 8px 18px rgba(0,0,0,.20),
    inset 0 1px 0 rgba(255,255,255,.04),
    0 0 0 1px rgba(0,229,255,.05);
  backdrop-filter: blur(10px);
  transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease;
}
.cta-card:active{
  transform: translateY(1px);
  box-shadow:
    0 6px 14px rgba(0,0,0,.18),
    inset 0 1px 0 rgba(255,255,255,.04),
    0 0 0 1px rgba(0,229,255,.04);
}
.cta-card:hover{
  border-color: rgba(255,255,255,.14);
}
.cta-card-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:7px;
  margin-bottom:4px;
}

/* NEW compact strip */
.cta-strip{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 10px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.08);
  background:
    linear-gradient(180deg, rgba(10,16,24,.88), rgba(7,12,18,.94));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.04);
  color:#f5f7fb;
  transition: border-color .14s ease, background .14s ease, transform .12s ease;
}
.cta-strip:hover{
  border-color:rgba(255,255,255,.14);
  background:
    linear-gradient(180deg, rgba(12,18,28,.92), rgba(8,13,20,.98));
}
.cta-strip:active{
  transform:translateY(1px);
}
.cta-strip:focus-visible{
  outline:1px solid rgba(90,170,255,.75);
  outline-offset:1px;
}
.cta-strip-badge{
  flex:0 0 auto;
}
.cta-strip-body{
  min-width:0;
  flex:1 1 auto;
  display:flex;
  flex-direction:column;
  gap:2px;
}
.cta-strip-line{
  display:block;
  min-width:0;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  font-size:13px;
  line-height:1.2;
  font-weight:800;
  color:#f7f9fc;
}
.cta-strip-meta{
  display:block;
  min-width:0;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  font-size:11px;
  line-height:1.2;
  color:rgba(230,236,245,.62);
}
.cta-strip-go{
  flex:0 0 auto;
  font-size:14px;
  line-height:1;
  color:rgba(255,255,255,.55);
}

.cta-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:16px;
  padding:1px 6px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.08);
  color:rgba(255,255,255,.92);
  font-size:8px;
  font-weight:900;
  letter-spacing:.07em;
  text-transform:uppercase;
  white-space:nowrap;
}
.cta-strip .cta-badge{
  min-height:20px;
  padding:0 8px;
  font-size:10px;
  letter-spacing:.04em;
}

.cta-card-go{
  color:rgba(255,255,255,.64);
  font-size:13px;
  line-height:1;
}
.cta-title{
  margin:0;
  color:#fff;
  font-size:13px;
  font-weight:900;
  letter-spacing:.01em;
  line-height:1.2;
}
.cta-subtitle{
  margin:2px 0 0;
  color:rgba(255,255,255,.64);
  font-size:11px;
  line-height:1.2;
  display:-webkit-box;
  -webkit-line-clamp:1;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.cta-highlights{
  display:grid;
  gap:4px;
}
.cta-highlights-body{
  display:grid;
  gap:4px;
  margin-top:3px;
  max-height:min(84px, 18dvh);
  overflow-y:auto;
  overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;
  padding-right:2px;
  scrollbar-width:thin;
}
.cta-highlights-body::-webkit-scrollbar{
  width:4px;
}
.cta-highlights-body::-webkit-scrollbar-thumb{
  background:rgba(255,255,255,.18);
  border-radius:999px;
}

.cta-highlight{
  display:flex;
  align-items:center;
  gap:8px;
  padding:7px 9px;
  border-radius:11px;
  background:rgba(10,14,20,.72);
  border:1px solid rgba(255,255,255,.08);
  transition: border-color .14s ease, background .14s ease, transform .12s ease;
}
.cta-highlight:hover{
  border-color:rgba(255,255,255,.14);
  background:rgba(12,17,24,.84);
}
.cta-highlight:active{
  transform:translateY(1px);
}
.cta-highlight-text{
  min-width:0;
  flex:1 1 auto;
  color:#eef3fb;
  font-size:12px;
  line-height:1.2;
  font-weight:700;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.cta-expander{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  padding:6px 8px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:11px;
  background:rgba(10,14,20,.58);
  color:rgba(235,241,250,.88);
  cursor:pointer;
  font:inherit;
  appearance:none;
  -webkit-appearance:none;
}
.cta-expander:hover{
  border-color:rgba(255,255,255,.14);
  background:rgba(12,17,24,.72);
}
.cta-expander-text{
  min-width:0;
  font-size:11px;
  font-weight:800;
  line-height:1.2;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.cta-expander-chev{
  flex:0 0 auto;
  font-size:12px;
  line-height:1;
  color:rgba(255,255,255,.58);
  transform:rotate(0deg);
  transition:transform .14s ease;
}
.cta-expander.is-open .cta-expander-chev{
  transform:rotate(90deg);
}
`;
  document.head.appendChild(style);
}

  function mount() {
    injectStyles();
    STATE.root = document.getElementById("ctaSurface");
    STATE.cardRoot = document.getElementById("ctaCardRoot");
    STATE.highlightsRoot = document.getElementById("ctaHighlightsRoot");
    return !!(STATE.root && STATE.cardRoot && STATE.highlightsRoot);
  }

  function clearRoot(el) {
    if (el) el.innerHTML = "";
  }

  function collapseExpanded(rerender = false) {
    if (!STATE.expanded) return;
    STATE.expanded = false;
    if (rerender && STATE.lastData) {
      render(STATE.lastData);
    }
  }

  function setVisible(on) {
    if (!STATE.root) return;
    STATE.root.classList.toggle("is-visible", !!on);
    STATE.root.style.display = on ? "block" : "none";
  }

  function unwrapPayload(raw) {
    let cur = raw;
    for (let i = 0; i < 4; i += 1) {
      if (!cur || typeof cur !== "object") break;
      if (cur.ok === false) break;
      const next = cur.data;
      if (!next || typeof next !== "object") break;
      cur = next;
    }
    return cur && typeof cur === "object" ? cur : {};
  }

  function normalizeTarget(target) {
    if (!target || typeof target !== "object") return null;

    const type = asText(target.type).toLowerCase();
    if (!type) return null;

    if (type === "siege") {
      const nodeId = asText(target.nodeId);
      return nodeId ? { type, nodeId } : null;
    }
    if (type === "bloodmoon") {
      return { type: "bloodmoon" };
    }
    if (type === "fortress") {
      const buildingId = asText(target.buildingId) || "moonlab_fortress";
      return { type: "fortress", buildingId };
    }
    if (type === "missions") {
      return { type: "missions" };
    }
    if (type === "map_node") {
      const nodeId = asText(target.nodeId);
      return nodeId ? { type, nodeId } : null;
    }

    return null;
  }

  function fallbackPrimaryBadge(kind, target) {
    const key = asText(kind).toLowerCase();
    if (key.startsWith("siege_")) return "LIVE";
    if (key === "bloodmoon_claim_ready") return "READY";
    if (key === "bloodmoon_live") return "TOWER";
    if (key === "fortress_ready") return "READY";
    if (key === "mission_ready") return "READY";
    if (key === "node_contested" || key === "node_hot") return "HOT";

    const type = asText(target?.type).toLowerCase();
    if (type === "siege") return "LIVE";
    if (type === "bloodmoon") return "TOWER";
    if (type === "fortress") return "READY";
    if (type === "missions") return "READY";
    if (type === "map_node") return "MAP";
    return "";
  }

  function fallbackHighlightBadge(kind, target) {
    const type = asText(target?.type).toLowerCase();
    const key = asText(kind).toLowerCase();
    if (key.startsWith("siege_") || type === "siege") return "LIVE";
    if (type === "map_node") return "MAP";
    if (type === "bloodmoon") return "TOWER";
    if (type === "fortress") return "RAID";
    return "WORLD";
  }

  function normalizePrimary(raw) {
    if (!raw || typeof raw !== "object") return null;
    const target = normalizeTarget(raw.target);
    if (!target) return null;

    const title = asText(raw.title) || prettifyKind(raw.kind);
    const subtitle = asText(raw.subtitle);
    if (!title && !subtitle) return null;

    return {
      kind: asText(raw.kind),
      title,
      subtitle,
      badge: asText(raw.badge) || fallbackPrimaryBadge(raw.kind, target),
      target,
    };
  }

  function normalizeHighlight(raw) {
  if (!raw || typeof raw !== "object") return null;
  const target = normalizeTarget(raw.target);
  if (!target) return null;

  const text = asText(raw.text) || asText(raw.title);
  if (!text) return null;

  return {
    kind: asText(raw.kind),
    text,
    badge: asText(raw.badge) || fallbackHighlightBadge(raw.kind, target),
    target,
  };
}

function normalize(raw) {
  const data = unwrapPayload(raw);
  const primary = normalizePrimary(data.primary);

  const highlights = [];
  const seen = new Set();
  const list = Array.isArray(data.highlights) ? data.highlights : [];
  for (const row of list) {
    const item = normalizeHighlight(row);
    if (!item) continue;
    const key = [
      item.kind,
      item.target?.type,
      item.target?.nodeId,
      item.target?.buildingId,
      item.text,
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    highlights.push(item);
    if (highlights.length >= MAX_HIGHLIGHTS) break;
  }

  return { primary, highlights };
}

function createBadge(text) {
  const badge = document.createElement("span");
  badge.className = "cta-badge";
  badge.textContent = text || "LIVE";
  return badge;
}

function highlightToggleLabel(count) {
  const n = Math.max(0, Number(count || 0));
  return n > 0 ? `More activity · ${n}` : "More activity";
}

function renderExpander(count) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cta-expander" + (STATE.expanded ? " is-open" : "");
  btn.setAttribute("aria-expanded", STATE.expanded ? "true" : "false");
  btn.setAttribute("aria-label", highlightToggleLabel(count));

  const text = document.createElement("span");
  text.className = "cta-expander-text";
  text.textContent = highlightToggleLabel(count);
  btn.appendChild(text);

  const chev = document.createElement("span");
  chev.className = "cta-expander-chev";
  chev.setAttribute("aria-hidden", "true");
  chev.textContent = ">";
  btn.appendChild(chev);

  btn.addEventListener("click", () => {
    STATE.expanded = !STATE.expanded;
    if (STATE.lastData) {
      render(STATE.lastData);
    }
  });

  return btn;
}

function renderPrimary(primary) {
  clearRoot(STATE.cardRoot);
  if (!STATE.cardRoot || !primary) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cta-strip";
  btn.setAttribute("aria-label", primary.title || "Open live world event");
  btn.title = primary.subtitle
    ? `${primary.title} — ${primary.subtitle}`
    : (primary.title || "Open live world event");

  const badge = createBadge(primary.badge || "LIVE");
  badge.classList.add("cta-strip-badge");
  btn.appendChild(badge);

  const body = document.createElement("span");
  body.className = "cta-strip-body";

  const line = document.createElement("span");
  line.className = "cta-strip-line";
  line.textContent = primary.title || "";
  body.appendChild(line);

  if (primary.subtitle) {
    const meta = document.createElement("span");
    meta.className = "cta-strip-meta";
    meta.textContent = primary.subtitle;
    body.appendChild(meta);
  }

  btn.appendChild(body);

  const go = document.createElement("span");
  go.className = "cta-strip-go";
  go.setAttribute("aria-hidden", "true");
  go.textContent = ">";
  btn.appendChild(go);

  btn.addEventListener("click", () => {
    collapseExpanded(true);
    void openTarget(primary.target);
  });

  STATE.cardRoot.appendChild(btn);
}

function renderHighlights(highlights) {
  clearRoot(STATE.highlightsRoot);
  if (!STATE.highlightsRoot || !Array.isArray(highlights) || !highlights.length) return;

  const items = highlights.slice(0, MAX_HIGHLIGHTS);
  const primaryVisible = !!(STATE.lastData && STATE.lastData.primary);
  const collapsible = primaryVisible && items.length > 0;

  if (collapsible) {
    STATE.highlightsRoot.appendChild(renderExpander(items.length));
    if (!STATE.expanded) return;
  }

  const wrap = document.createElement("div");
  wrap.className = collapsible ? "cta-highlights-body" : "cta-highlights";

  for (const item of items) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cta-highlight";
    btn.setAttribute("aria-label", item.text || "Open highlight");

    btn.appendChild(createBadge(item.badge));

    const text = document.createElement("span");
    text.className = "cta-highlight-text";
    text.textContent = item.text;
    btn.appendChild(text);

    btn.addEventListener("click", () => {
      collapseExpanded(true);
      void openTarget(item.target);
    });

    wrap.appendChild(btn);
  }

  STATE.highlightsRoot.appendChild(wrap);
}

function render(data) {
  if (!mount()) return null;

  const safe = data && typeof data === "object"
    ? data
    : { primary: null, highlights: [] };

  if (!safe.primary || !Array.isArray(safe.highlights) || !safe.highlights.length) {
    STATE.expanded = false;
  }

  renderPrimary(safe.primary || null);
  renderHighlights(Array.isArray(safe.highlights) ? safe.highlights : []);

  const hasPrimary = !!safe.primary;
  const hasHighlights = Array.isArray(safe.highlights) && safe.highlights.length > 0;
  setVisible(hasPrimary || hasHighlights);
  return safe;
}

  async function load() {
    if (!mount()) return null;

    const apiPost = getApiPost();
    if (!apiPost) {
      warn("apiPost missing");
      if (!STATE.lastData) render({ primary: null, highlights: [] });
      return STATE.lastData;
    }

    try {
      const raw = await apiPost("/webapp/cta/state", {});
      const data = normalize(raw);
      STATE.lastData = data;
      render(data);
      return data;
    } catch (err) {
      warn("load failed", err);
      if (!STATE.lastData) render({ primary: null, highlights: [] });
      return STATE.lastData;
    }
  }

  function refresh() {
    return load();
  }

  function clearPolling() {
    if (STATE.pollTimer) {
      clearInterval(STATE.pollTimer);
      STATE.pollTimer = 0;
    }
  }

  function startPolling() {
    clearPolling();
    STATE.pollTimer = window.setInterval(() => {
      void load();
    }, POLL_MS);
  }

  function findMapPin(target) {
    if (!target || typeof target !== "object") return null;

    const selectors = [];
    if (target.nodeId) {
      const nodeId = escAttr(target.nodeId);
      selectors.push(`#pins [data-node-id="${nodeId}"]`);
      selectors.push(`#pins [data-nodeid="${nodeId}"]`);
    }
    if (target.buildingId) {
      const buildingId = escAttr(target.buildingId);
      selectors.push(`#pins [data-building-id="${buildingId}"]`);
    }

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  async function waitForMapPin(target, timeoutMs = 4000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const pin = findMapPin(target);
      if (pin) return pin;
      await wait(80);
    }
    return null;
  }

  function openMap() {
    try {
      if (typeof window.showSection === "function") {
        window.showSection("map");
        return true;
      }
    } catch (err) {
      warn("showSection(map) failed", err);
    }

    const navBtn = document.querySelector('.ah-navbtn[data-go="map"]');
    if (navBtn) {
      navBtn.click();
      return true;
    }

    const legacyBtn = document.querySelector(".btn.map, button.btn.map");
    if (legacyBtn) {
      legacyBtn.click();
      return true;
    }

    const mapBack = document.getElementById("mapBack");
    if (mapBack) {
      mapBack.style.display = "flex";
      try { window.navOpen?.("mapBack"); } catch (_) {}
      return true;
    }

    return false;
  }

  function openMissions() {
    if (typeof window.openMissions === "function") {
      return !!window.openMissions();
    }
    if (typeof window.Missions?.open === "function") {
      return !!window.Missions.open();
    }

    const navBtn = document.querySelector('.ah-navbtn[data-go="missions"]');
    if (navBtn) {
      navBtn.click();
      return true;
    }

    const legacyBtn = document.querySelector(".btn.mission, button.btn.mission");
    if (legacyBtn) {
      legacyBtn.click();
      return true;
    }

    return false;
  }

  async function openMapPin(target, { activate = false } = {}) {
    openMap();
    const pin = await waitForMapPin(target);
    if (!pin) {
      warn("map pin not found", target);
      return false;
    }

    const isActive = pin.classList.contains("active");
    if (!isActive) {
      pin.click();
      if (!activate) return true;
      await wait(90);
    }

    if (activate) {
      pin.click();
    }

    return true;
  }

  async function openTarget(target) {
    const safeTarget = normalizeTarget(target);
    if (!safeTarget) {
      warn("invalid target", target);
      return false;
    }

    try { STATE.tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

    switch (safeTarget.type) {
      case "siege":
        if (safeTarget.nodeId === "edge_of_chain") {
          try {
            if (typeof window.Siege?.open === "function") {
              window.Siege.open();
              return true;
            }
          } catch (err) {
            warn("Siege open failed", err);
          }
        }
        return await openMapPin(
          { nodeId: safeTarget.nodeId, buildingId: safeTarget.nodeId },
          { activate: true }
        );

      case "bloodmoon":
        try {
          if (typeof window.BloodMoon?.open === "function") {
            await window.BloodMoon.open();
            return true;
          }
        } catch (err) {
          warn("BloodMoon open failed", err);
        }
        return await openMapPin(
          { nodeId: "blood_moon_tower", buildingId: "blood_moon_tower" },
          { activate: true }
        );

      case "fortress":
        try {
          if (typeof window.Fortress?.open === "function") {
            window.Fortress.open();
            return true;
          }
        } catch (err) {
          warn("Fortress open failed", err);
        }
        return await openMapPin(
          { buildingId: safeTarget.buildingId || "moonlab_fortress" },
          { activate: true }
        );

      case "missions":
        try {
          return openMissions();
        } catch (err) {
          warn("Missions open failed", err);
          return false;
        }

      case "map_node":
        return await openMapPin({ nodeId: safeTarget.nodeId }, { activate: false });

      default:
        warn("unknown target type", safeTarget);
        return false;
    }
  }

  function bindLifecycleRefresh() {
    if (!STATE.visHandler) {
      STATE.visHandler = () => {
        if (document.visibilityState === "visible") {
          void load();
        }
      };
      document.addEventListener("visibilitychange", STATE.visHandler);
    }

    if (!STATE.pageShowHandler) {
      STATE.pageShowHandler = () => { void load(); };
      window.addEventListener("pageshow", STATE.pageShowHandler);
    }
  }

  function destroy() {
    clearPolling();
    if (STATE.visHandler) {
      document.removeEventListener("visibilitychange", STATE.visHandler);
      STATE.visHandler = null;
    }
    if (STATE.pageShowHandler) {
      window.removeEventListener("pageshow", STATE.pageShowHandler);
      STATE.pageShowHandler = null;
    }
    if (STATE.root) {
      setVisible(false);
    }
    clearRoot(STATE.cardRoot);
    clearRoot(STATE.highlightsRoot);
  }

  function init({ apiPost, tg, dbg } = {}) {
    STATE.apiPost = apiPost || STATE.apiPost || null;
    STATE.tg = tg || STATE.tg || null;
    STATE.dbg = dbg ?? STATE.dbg;

    if (!mount()) {
      log("mounts missing");
      return window.CTA;
    }

    bindLifecycleRefresh();
    startPolling();
    void load();
    return window.CTA;
  }

  window.CTA = {
    init,
    load,
    refresh,
    render,
    openTarget,
    mount,
    destroy,
  };
})();
