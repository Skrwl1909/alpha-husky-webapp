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

  function asInt(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function prettifyKind(kind) {
    const raw = asText(kind);
    if (!raw) return "";
    return raw
      .replaceAll("_", " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function prettifyNodeId(nodeId) {
    const raw = asText(nodeId).toLowerCase();
    if (!raw) return "";
    return raw
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function primaryNodeLabel(primary) {
    return prettifyNodeId(primary?.target?.nodeId);
  }

  const PRIMARY_PLAYBOOK = {
    bloodmoon_claim_ready: {
      context: "Event Pressure",
      now: "Claim your Blood-Moon rewards",
      why: (primary) => asText(primary.subtitle) || "Your event run is complete and rewards are waiting.",
      reward: (primary) => {
        const n = asInt(primary?.meta?.claimCount, 0);
        return n > 0
          ? `${n} reward${n === 1 ? "" : "s"} ready to claim right now.`
          : "Secure your event rewards before the window closes.";
      },
      go: "Claim rewards",
    },
    bloodmoon_live: {
      context: "Event Pressure",
      now: "Join the Blood-Moon push",
      why: (primary) => asText(primary.subtitle) || "Live waves are active in the tower right now.",
      reward: "Earn claimable event rewards for your faction.",
      go: "Join Blood-Moon",
    },
    fortress_ready: {
      context: "Co-op Raid",
      now: "Enter Moon Lab Fortress",
      why: (primary) => asText(primary.subtitle) || "A raid window is open for your team.",
      reward: "Clear boss stages for strong raid rewards.",
      go: "Enter fortress",
    },
    mission_ready: {
      context: "Progression",
      now: (primary) => {
        const title = asText(primary.title);
        if (!title) return "Your mission is ready to resolve";
        return title.replace(/\bis ready\b/i, "ready to resolve");
      },
      why: (primary) => asText(primary.subtitle) || "Your mission timer is complete and waiting.",
      reward: "Collect mission rewards and unlock your next move.",
      go: "Resolve mission",
    },
    siege_running_defense: {
      context: "Faction Frontline",
      now: (primary) => {
        const node = primaryNodeLabel(primary);
        return node ? `Defend ${node} now` : "Defend the live siege";
      },
      why: (primary) => asText(primary.subtitle) || "Your faction can lose this node without a response.",
      reward: "Hold territory and secure siege rewards.",
      go: "Join defense",
    },
    siege_forming_defense: {
      context: "Faction Frontline",
      now: (primary) => {
        const node = primaryNodeLabel(primary);
        return node ? `Prepare defense at ${node}` : "Prepare defense for the siege";
      },
      why: (primary) => asText(primary.subtitle) || "Attackers are gathering and pressure is rising.",
      reward: "Help your faction lock the line before launch.",
      go: "Take watch",
    },
    siege_running_attack: {
      context: "Faction Frontline",
      now: (primary) => {
        const node = primaryNodeLabel(primary);
        return node ? `Push the siege at ${node}` : "Push the live siege";
      },
      why: (primary) => asText(primary.subtitle) || "Your faction can capture this node right now.",
      reward: "Win control and siege payouts for your side.",
      go: "Join attack",
    },
    siege_forming_attack: {
      context: "Faction Frontline",
      now: (primary) => {
        const node = primaryNodeLabel(primary);
        return node ? `Join siege formation at ${node}` : "Join siege formation now";
      },
      why: (primary) => asText(primary.subtitle) || "Your faction is preparing an attack window.",
      reward: "Help trigger the assault and gain map control.",
      go: "Join formation",
    },
    node_contested: {
      context: "World Pressure",
      now: (primary) => {
        const node = primaryNodeLabel(primary);
        return node ? `Patrol ${node}` : "Patrol the contested node";
      },
      why: (primary) => asText(primary.subtitle) || "Control is unstable and can flip quickly.",
      reward: "Build faction pressure where it matters most.",
      go: "Open contested node",
    },
    node_hot: {
      context: "World Pressure",
      now: (primary) => {
        const node = primaryNodeLabel(primary);
        return node ? `Pressure ${node}` : "Pressure the HOT node";
      },
      why: (primary) => asText(primary.subtitle) || "Momentum is rising on this frontline.",
      reward: "Gain influence before rivals lock the area.",
      go: "Open HOT node",
    },
    choose_faction: {
      context: "Identity",
      now: "Choose your faction",
      why: "Your side defines your role in the world war.",
      reward: "Unlock faction progress, sieges, and shared goals.",
      go: "Choose faction",
    },
    first_mission: {
      context: "Action",
      now: "Run your first mission",
      why: "This is the fastest way to learn the loop.",
      reward: "Earn your first rewards and unlock momentum.",
      go: "Start mission",
    },
    equip_item: {
      context: "Progression",
      now: "Equip your best item",
      why: "Stronger loadout means better mission and siege output.",
      reward: "Boost your impact in live events.",
      go: "Open equipped",
    },
    first_map_action: {
      context: "World",
      now: "Take your first map action",
      why: "The map is live and faction pressure moves in real time.",
      reward: "Learn where pressure matters and where to help next.",
      go: "Open live node",
    },
    contracts_push: {
      context: "Cooperation",
      now: "Push Broken Contracts",
      why: "Your faction needs active pressure to progress contracts.",
      reward: "Unlock shared rewards for your side.",
      go: "Open contracts",
    },
    contracts_claim_ready: {
      context: "Cooperation",
      now: "Claim Broken Contracts rewards",
      why: "Your faction contract is complete and ready to claim.",
      reward: "Collect shared contract payouts before reset.",
      go: "Claim contracts",
    },
  };

  function resolveGuideValue(value, primary) {
    if (typeof value === "function") return asText(value(primary));
    return asText(value);
  }

  function defaultContextForPrimary(primary) {
    const kind = asText(primary?.kind).toLowerCase();
    const type = asText(primary?.target?.type).toLowerCase();

    if (kind.startsWith("siege_") || type === "siege") return "Faction Frontline";
    if (kind.startsWith("bloodmoon_") || type === "bloodmoon") return "Event Pressure";
    if (kind === "fortress_ready" || type === "fortress") return "Co-op Raid";
    if (kind === "contracts_claim_ready" || kind === "contracts_push") return "Cooperation";
    if (kind === "mission_ready" || type === "missions") return "Progression";
    if (kind === "node_contested" || kind === "node_hot" || type === "map_node") return "World Pressure";
    if (type === "open_action") return "World Guide";
    return "World Guide";
  }

  function defaultNowForPrimary(primary) {
    const title = asText(primary?.title);
    if (title) return title;
    return "Take the next action now";
  }

  function defaultWhyForPrimary(primary) {
    const subtitle = asText(primary?.subtitle);
    if (subtitle) return subtitle;
    return "This action advances your progress and your faction position.";
  }

  function defaultRewardForPrimary(primary) {
    const kind = asText(primary?.kind).toLowerCase();
    const type = asText(primary?.target?.type).toLowerCase();

    if (kind.startsWith("siege_")) return "Secure territory and siege rewards for your side.";
    if (kind === "bloodmoon_claim_ready" || kind === "bloodmoon_live") return "Gain claimable event rewards and faction momentum.";
    if (kind === "contracts_claim_ready" || kind === "contracts_push") return "Advance faction contracts and shared rewards.";
    if (kind === "mission_ready" || type === "missions") return "Collect mission rewards and unlock the next task.";
    if (kind === "fortress_ready" || type === "fortress") return "Earn raid rewards and stronger progression drops.";
    if (kind === "node_contested" || kind === "node_hot" || type === "map_node") return "Build influence and frontline pressure for your faction.";
    return "Gain progress and world impact from this action.";
  }

  function defaultGoForPrimary(primary) {
    const type = asText(primary?.target?.type).toLowerCase();
    if (type === "siege") return "Join siege";
    if (type === "bloodmoon") return "Open Blood-Moon";
    if (type === "fortress") return "Enter fortress";
    if (type === "missions") return "Open missions";
    if (type === "map_node") return "Open node";
    if (type === "open_action") return "Open guide";
    return "Go now";
  }

  function buildPrimaryGuide(primary) {
    const key = asText(primary?.kind).toLowerCase();
    const play = PRIMARY_PLAYBOOK[key] || {};

    const context = resolveGuideValue(play.context, primary) || defaultContextForPrimary(primary);
    const now = resolveGuideValue(play.now, primary) || defaultNowForPrimary(primary);
    const why = resolveGuideValue(play.why, primary) || defaultWhyForPrimary(primary);
    const reward = resolveGuideValue(play.reward, primary) || defaultRewardForPrimary(primary);
    const go = resolveGuideValue(play.go, primary) || defaultGoForPrimary(primary);

    return { context, now, why, reward, go };
  }

  function isBloodmoonPrimary(primary) {
    const kind = asText(primary?.kind).toLowerCase();
    const type = asText(primary?.target?.type).toLowerCase();
    return type === "bloodmoon" || kind.startsWith("bloodmoon_");
  }

  function bloodmoonCompactLine(primary, guide) {
    const kind = asText(primary?.kind).toLowerCase();
    if (kind === "bloodmoon_claim_ready") {
      const count = asInt(primary?.meta?.claimCount, 0);
      if (count > 0) return `${count} reward${count === 1 ? "" : "s"} ready in Blood-Moon Tower`;
      return "Blood-Moon rewards are ready to claim";
    }
    if (kind === "bloodmoon_live") {
      return asText(primary?.subtitle) || "Blood-Moon raid is live now";
    }
    return asText(primary?.subtitle) || guide.now || "Blood-Moon Tower activity is live";
  }

  function bloodmoonCompactAction(primary, guide) {
    const kind = asText(primary?.kind).toLowerCase();
    if (kind === "bloodmoon_live") return "Watch Raid";
    if (kind === "bloodmoon_claim_ready") return "Open Tower";
    return asText(guide?.go) || "Open Tower";
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
.cta-highlight{
  width:100%;
  border:0;
  color:inherit;
  text-align:left;
  cursor:pointer;
}
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
.cta-card.is-bloodmoon-compact{
  padding:5px 8px;
  border-radius:999px;
  background:
    radial-gradient(circle at 14% 50%, rgba(255,122,138,.14), transparent 48%),
    linear-gradient(180deg, rgba(23,12,16,.86), rgba(14,10,12,.94));
  border-color:rgba(255,122,138,.26);
  box-shadow:
    0 6px 12px rgba(0,0,0,.18),
    inset 0 1px 0 rgba(255,255,255,.04);
}
.cta-card.is-bloodmoon-compact:hover{
  border-color:rgba(255,151,163,.34);
}
.cta-bm-strip{
  display:flex;
  align-items:center;
  gap:7px;
  min-height:22px;
}
.cta-bm-strip-text{
  min-width:0;
  flex:1 1 auto;
  color:#fff;
  font-size:11px;
  font-weight:800;
  line-height:1.2;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.cta-go-btn.cta-go-btn-compact{
  min-height:20px;
  padding:1px 8px;
  font-size:9px;
  letter-spacing:.03em;
}
.cta-card-top{
  display:flex;
  align-items:center;
  justify-content:flex-start;
  gap:7px;
  margin-bottom:4px;
}
.cta-context{
  min-width:0;
  color:rgba(200,224,255,.78);
  font-size:9px;
  font-weight:700;
  letter-spacing:.05em;
  text-transform:uppercase;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
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
.cta-title{
  margin:0;
  color:#fff;
  font-size:13px;
  font-weight:900;
  letter-spacing:.01em;
  line-height:1.2;
}
.cta-why,
.cta-reward{
  margin:2px 0 0;
  font-size:11px;
  line-height:1.2;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.cta-why{
  color:rgba(255,255,255,.66);
}
.cta-reward{
  color:rgba(186,229,255,.82);
}
.cta-go-row{
  display:flex;
  justify-content:flex-end;
  margin-top:6px;
}
.cta-go-btn{
  min-height:22px;
  padding:2px 9px;
  border-radius:999px;
  border:1px solid rgba(0,229,255,.36);
  background:
    radial-gradient(circle at 30% 30%, rgba(0,229,255,.18), transparent 56%),
    linear-gradient(180deg, rgba(6,20,28,.94), rgba(8,24,34,.96));
  color:rgba(223,247,255,.95);
  font-size:10px;
  font-weight:900;
  letter-spacing:.04em;
  text-transform:uppercase;
  cursor:pointer;
  transition: transform .14s ease, border-color .14s ease, filter .14s ease;
}
.cta-go-btn:active{
  transform: translateY(1px);
}
.cta-go-btn:hover{
  border-color: rgba(0,229,255,.48);
  filter: brightness(1.06);
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
.cta-expander{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  min-height:24px;
  padding:4px 8px;
  border:0;
  border-radius:999px;
  background:rgba(9,13,18,.34);
  border:1px solid rgba(255,255,255,.06);
  color:rgba(255,255,255,.72);
  text-align:left;
  cursor:pointer;
  backdrop-filter: blur(8px);
  box-shadow:0 2px 8px rgba(0,0,0,.10);
  transition: transform .14s ease, border-color .14s ease, background .14s ease;
}
.cta-expander:active{
  transform: translateY(1px);
}
.cta-expander:hover{
  border-color: rgba(255,255,255,.10);
  background:rgba(12,16,22,.42);
}
.cta-expander-text{
  min-width:0;
  flex:1 1 auto;
  font-size:10px;
  font-weight:700;
  letter-spacing:.01em;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.cta-expander-chev{
  flex:0 0 auto;
  color:rgba(255,255,255,.56);
  font-size:11px;
  line-height:1;
  transition: transform .14s ease;
}
.cta-expander.is-open .cta-expander-chev{
  transform: rotate(90deg);
}
.cta-highlight{
  display:flex;
  align-items:center;
  gap:8px;
  min-height:30px;
  padding:6px 8px;
  border-radius:10px;
  background:rgba(9,13,18,.48);
  border:1px solid rgba(255,255,255,.06);
  backdrop-filter: blur(8px);
  box-shadow:0 4px 10px rgba(0,0,0,.10);
  transition: transform .14s ease, border-color .14s ease, background .14s ease;
}
.cta-highlight:active{
  transform: translateY(1px);
}
.cta-highlight:hover{
  border-color: rgba(255,255,255,.10);
  background:rgba(12,16,22,.56);
}
.cta-highlight-text{
  min-width:0;
  flex:1 1 auto;
  color:rgba(255,255,255,.82);
  font-size:11px;
  line-height:1.2;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.cta-highlights-body::-webkit-scrollbar{
  width:4px;
}
.cta-highlights-body::-webkit-scrollbar-thumb{
  background:rgba(255,255,255,.16);
  border-radius:999px;
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
    if (type === "open_action") {
      const action = asText(target.action).toLowerCase();
      return action ? { type, action } : null;
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
    if (key === "contracts_claim_ready") return "READY";
    if (key === "choose_faction" || key === "first_mission" || key === "equip_item" || key === "first_map_action" || key === "contracts_push") return "GUIDE";
    if (key === "node_contested" || key === "node_hot") return "HOT";

    const type = asText(target?.type).toLowerCase();
    if (type === "siege") return "LIVE";
    if (type === "bloodmoon") return "TOWER";
    if (type === "fortress") return "READY";
    if (type === "missions") return "READY";
    if (type === "map_node") return "MAP";
    if (type === "open_action") return "GUIDE";
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
      meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {},
      priority: asInt(raw.priority, 0),
      expiresInSec: asInt(raw.expiresInSec, 0),
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
    return `Background activity (${n})`;
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

    const guide = buildPrimaryGuide(primary);
    const bloodmoonCompact = isBloodmoonPrimary(primary);

    const card = document.createElement("article");
    card.className = "cta-card" + (bloodmoonCompact ? " is-bloodmoon-compact" : "");
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `${guide.now}. ${guide.why}`);

    const go = () => {
      collapseExpanded(true);
      void openTarget(primary.target);
    };

    if (bloodmoonCompact) {
      const strip = document.createElement("div");
      strip.className = "cta-bm-strip";

      strip.appendChild(createBadge(primary.badge || "TOWER"));

      const text = document.createElement("span");
      text.className = "cta-bm-strip-text";
      text.textContent = bloodmoonCompactLine(primary, guide);
      strip.appendChild(text);

      const goBtn = document.createElement("button");
      goBtn.type = "button";
      goBtn.className = "cta-go-btn cta-go-btn-compact";
      goBtn.textContent = bloodmoonCompactAction(primary, guide);
      goBtn.setAttribute("aria-label", `${goBtn.textContent}. ${text.textContent}`);
      goBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        go();
      });
      strip.appendChild(goBtn);
      card.appendChild(strip);
    } else {
      const top = document.createElement("div");
      top.className = "cta-card-top";
      top.appendChild(createBadge(primary.badge));

      const context = document.createElement("span");
      context.className = "cta-context";
      context.textContent = guide.context;
      top.appendChild(context);

      const title = document.createElement("h3");
      title.className = "cta-title";
      title.textContent = guide.now;

      card.appendChild(top);
      card.appendChild(title);

      if (guide.why) {
        const why = document.createElement("p");
        why.className = "cta-why";
        why.textContent = guide.why;
        card.appendChild(why);
      }

      if (guide.reward) {
        const reward = document.createElement("p");
        reward.className = "cta-reward";
        reward.textContent = guide.reward;
        card.appendChild(reward);
      }

      const goRow = document.createElement("div");
      goRow.className = "cta-go-row";

      const goBtn = document.createElement("button");
      goBtn.type = "button";
      goBtn.className = "cta-go-btn";
      goBtn.textContent = guide.go;
      goBtn.setAttribute("aria-label", `${guide.go}. ${guide.now}`);
      goBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        go();
      });
      goRow.appendChild(goBtn);
      card.appendChild(goRow);
    }

    card.addEventListener("click", go);
    card.addEventListener("keydown", (event) => {
      if (event.target !== card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        go();
      }
    });

    STATE.cardRoot.appendChild(card);
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

  async function openAction(action) {
    const key = asText(action).toLowerCase();
    if (!key) return false;

    switch (key) {
      case "factions":
        try {
          if (typeof window.Factions?.openPicker === "function") {
            window.Factions.openPicker();
            return true;
          }
          if (typeof window.Factions?.open === "function") {
            window.Factions.open({ mode: "select" });
            return true;
          }
        } catch (err) {
          warn("Factions open failed", err);
        }
        {
          const pill = document.getElementById("faction");
          if (pill) {
            pill.click();
            return true;
          }
        }
        return false;

      case "equipped":
      case "inspect_character":
        try {
          if (typeof window.Equipped?.open === "function") {
            window.Equipped.open();
            return true;
          }
        } catch (err) {
          warn("Equipped open failed", err);
        }
        {
          const btn = document.querySelector('.ah-action[data-action="equipped"], .btn.equipped, button.btn.equipped');
          if (btn) {
            btn.click();
            return true;
          }
        }
        return false;

      case "broken_contracts":
      case "contracts":
        try {
          if (typeof window.BrokenContracts?.open === "function") {
            await window.BrokenContracts.open();
            return true;
          }
        } catch (err) {
          warn("Broken Contracts open failed", err);
        }
        return await openMapPin(
          { buildingId: "broken_contracts_hub", nodeId: "phantom_nodes" },
          { activate: true }
        );

      case "missions":
        return openMissions();

      case "map":
        return openMap();

      default:
        warn("unknown open_action", key);
        return false;
    }
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

      case "open_action":
        return await openAction(safeTarget.action);

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
