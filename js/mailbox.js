// Alpha Husky WebApp - Mailbox / Pack Signals v2
// Personal inbox: important things waiting for YOU.
// Endpoint:
//   POST /webapp/mailbox/state
//   POST /webapp/mailbox/dismiss
(function (global) {
  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    inited: false,
    initCount: 0,
    items: [],
    pendingSignals: [],
    messages: [],
    pendingCount: 0,
    unreadCount: 0,
    totalAttentionCount: 0,
    serverTs: 0,
    lastLoadAt: 0,
    loadSeq: 0,
    loadPromise: null,
    pollTimer: null,
    pollerCount: 0,
    visHandler: null,
    backEl: null,
    dismissing: new Set(),
  };

  const SEEN_KEY = "ah_mailbox_seen_ts_v1";
  const POLL_MS = 90 * 1000;
  const MAX_ITEMS = 8;
  const STATE_STALE_MS = 25 * 1000;

  const log = (...args) => { if (S.dbg) console.log("[Mailbox]", ...args); };
  const warn = (...args) => { if (S.dbg) console.warn("[Mailbox]", ...args); };

  function isOpen() {
    return !!(S.backEl && S.backEl.style.display !== "none");
  }

  function asText(v) {
    return String(v ?? "").trim();
  }

  function asInt(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  }

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readSeenTs() {
    try {
      return asInt(localStorage.getItem(SEEN_KEY), 0);
    } catch (_) {
      return 0;
    }
  }

  function writeSeenTs(ts) {
    const safeTs = Math.max(0, asInt(ts, 0));
    try {
      localStorage.setItem(SEEN_KEY, String(safeTs));
    } catch (_) {}
  }

  function latestItemTs(items) {
    if (!Array.isArray(items) || !items.length) return 0;
    let latest = 0;
    for (const item of items) latest = Math.max(latest, asInt(item?.ts, 0));
    return latest;
  }

  function normalizeTarget(target) {
    if (!target || typeof target !== "object") return null;
    const type = asText(target.type).toLowerCase();
    if (!type) return null;

    if (type === "siege") {
      const nodeId = asText(target.nodeId);
      return nodeId ? { type, nodeId } : null;
    }
    if (type === "missions") return { type: "missions" };
    if (type === "bloodmoon") return { type: "bloodmoon" };
    if (type === "fortress") {
      return { type: "fortress", buildingId: asText(target.buildingId) || "moonlab_fortress" };
    }
    if (type === "map_node") {
      const nodeId = asText(target.nodeId);
      return nodeId ? { type, nodeId } : null;
    }
    if (type === "open_action") {
      const action = asText(target.action).toLowerCase();
      return action ? { type, action } : null;
    }
    if (type === "open_treasury") {
      return { type: "open_action", action: "treasury" };
    }
    if (type === "send_howl" || type === "player_profile") {
      const targetUid = asText(target.target_uid || target.targetUid || target.uid);
      return targetUid ? { type, target_uid: targetUid, targetUid, source: asText(target.source) || "mailbox" } : null;
    }
    if (type === "stats" || type === "den" || type === "influence" || type === "profile") {
      return { type };
    }

    return null;
  }

  function normalizeRouteTarget(raw) {
    const route = normalizeTarget(raw?.targetRoute);
    if (route) return route;
    const key = asText(raw?.target).toLowerCase();
    if (!key) return null;
    if (key === "stats") return { type: "stats" };
    if (key === "den") return { type: "den" };
    if (key === "missions") return { type: "open_action", action: "quests" };
    if (key === "influence") return { type: "map_node", nodeId: "phantom_nodes" };
    if (key === "profile") return { type: "open_action", action: "equipped" };
    return normalizeTarget(raw?.target);
  }

  function normalizeItem(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = asText(raw.id);
    const kind = asText(raw.kind).toLowerCase();
    const title = asText(raw.title);
    const line = asText(raw.line);
    const body = asText(raw.body);
    const target = normalizeRouteTarget(raw) || normalizeTarget(raw.target);
    if (!id || !kind || !title) return null;
    const hasAction = !!target;
    const actionLabel = hasAction ? (asText(raw.cta || raw.actionLabel) || "Open") : "";
    const dismissible = raw?.dismissible === true;
    return {
      id,
      kind,
      title,
      line,
      body,
      badge: asText(raw.badge).toUpperCase(),
      ts: Math.max(0, asInt(raw.ts, 0)),
      target,
      hasAction,
      actionLabel,
      dismissible,
      pending: raw?.pending === true,
      meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {},
    };
  }

  function normalizePendingSignal(raw) {
    const item = normalizeItem(raw);
    if (!item) return null;
    item.kind = "pending_signal";
    item.pending = true;
    item.dismissible = false;
    return item;
  }

  function normalizePayload(raw) {
    const data = raw?.data && typeof raw.data === "object" ? raw.data : raw;
    const pendingRows = Array.isArray(data?.pendingSignals) ? data.pendingSignals : [];
    const messageRows = Array.isArray(data?.messages) ? data.messages : [];
    const legacyRows = Array.isArray(data?.items) ? data.items : [];

    const pendingSignals = [];
    const messages = [];
    const seenPending = new Set();
    const seenMessages = new Set();

    for (const row of pendingRows) {
      const item = normalizePendingSignal(row);
      if (!item || seenPending.has(item.id)) continue;
      seenPending.add(item.id);
      pendingSignals.push(item);
    }

    for (const row of messageRows) {
      const item = normalizeItem(row);
      if (!item || item.pending || seenMessages.has(item.id)) continue;
      seenMessages.add(item.id);
      messages.push(item);
    }

    if (!pendingSignals.length && !messages.length) {
      for (const row of legacyRows) {
        const item = normalizeItem(row);
        if (!item || seenPending.has(item.id) || seenMessages.has(item.id)) continue;
        if (item.kind === "pending_signal" || item.pending) {
          seenPending.add(item.id);
          item.pending = true;
          item.dismissible = false;
          pendingSignals.push(item);
        } else {
          seenMessages.add(item.id);
          messages.push(item);
        }
      }
    }

    const pendingCount = Math.max(0, asInt(data?.pendingCount, pendingSignals.length));
    const unreadCount = Math.max(0, asInt(data?.unreadCount, messages.length));
    const totalAttentionCount = Math.max(0, asInt(data?.totalAttentionCount, pendingCount + unreadCount));

    const items = [];
    const seen = new Set();
    for (const item of [...pendingSignals, ...messages]) {
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
      if (items.length >= MAX_ITEMS) break;
    }

    return {
      items,
      pendingSignals,
      messages,
      pendingCount,
      unreadCount,
      totalAttentionCount,
      serverTs: asInt(data?.serverTs, Math.floor(Date.now() / 1000)),
    };
  }

  function kindIcon(kind) {
    if (kind === "pending_signal") return "SIGNAL";
    if (kind === "npc_guidance" || String(kind || "").startsWith("npc_")) return "WARDEN";
    if (kind === "mission_ready") return "MISSION";
    if (kind === "bloodmoon_claim_ready") return "TOWER";
    if (kind === "contracts_claim_ready") return "CONTRACT";
    if (kind === "contracts_progress") return "CO-OP";
    if (kind === "fortress_ready") return "RAID";
    if (kind === "developer_announcement") return "NEWS";
    if (kind === "influence_weekly_victory") return "INFLUENCE";
    if (kind === "social_howl") return "HOWL";
    return "MAIL";
  }

  function relTime(ts, nowTs) {
    const t = asInt(ts, 0);
    if (t <= 0) return "";
    const diff = Math.max(0, asInt(nowTs, 0) - t);
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function unreadMessageCount() {
    const seenTs = readSeenTs();
    let count = 0;
    for (const item of S.messages) {
      if (asInt(item?.ts, 0) > seenTs) count += 1;
    }
    return count;
  }

  function attentionCount() {
    const pending = Math.max(0, asInt(S.pendingCount, S.pendingSignals.length));
    return pending + unreadMessageCount();
  }

  function applyHubUnreadBadge() {
    const badge = document.querySelector('.ah-badge[data-badge="hub"]');
    if (!badge) return;

    const count = attentionCount();
    if (count <= 0) {
      badge.hidden = true;
      badge.textContent = "";
      badge.style.removeProperty("width");
      badge.style.removeProperty("height");
      badge.style.removeProperty("min-width");
      badge.style.removeProperty("padding");
      badge.style.removeProperty("font-size");
      badge.style.removeProperty("line-height");
      badge.style.removeProperty("font-weight");
      badge.style.removeProperty("display");
      badge.style.removeProperty("align-items");
      badge.style.removeProperty("justify-content");
      return;
    }

    badge.hidden = false;
    badge.textContent = count > 9 ? "9+" : String(count);
    badge.style.width = "auto";
    badge.style.height = "16px";
    badge.style.minWidth = "16px";
    badge.style.padding = "0 5px";
    badge.style.fontSize = "10px";
    badge.style.lineHeight = "16px";
    badge.style.fontWeight = "900";
    badge.style.display = "inline-flex";
    badge.style.alignItems = "center";
    badge.style.justifyContent = "center";
  }

  function ensureStyles() {
    if (document.getElementById("mailbox-css")) return;
    const style = document.createElement("style");
    style.id = "mailbox-css";
    style.textContent = `
      #mailboxBack .sheet-card.mailbox-sheet{
        width:min(92vw,520px);
        max-height:82vh;
        overflow:auto;
        padding:14px;
        background:rgba(10,12,16,.90);
        border:1px solid rgba(255,255,255,.12);
        border-radius:18px;
      }
      .mailbox-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        margin-bottom:10px;
      }
      .mailbox-title{
        font-size:16px;
        font-weight:900;
        letter-spacing:.3px;
      }
      .mailbox-sub{
        margin-top:2px;
        font-size:12px;
        opacity:.72;
      }
      .mailbox-close{
        width:34px;
        height:34px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(0,0,0,.25);
        color:#fff;
        cursor:pointer;
      }
      .mailbox-section{
        margin-top:10px;
      }
      .mailbox-section-title{
        font-size:11px;
        letter-spacing:.11em;
        text-transform:uppercase;
        opacity:.62;
        margin:2px 2px 8px;
      }
      .mailbox-list{
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      .mailbox-item{
        position:relative;
        border:1px solid rgba(255,255,255,.11);
        background:rgba(255,255,255,.04);
        border-radius:14px;
        padding:10px;
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        cursor:pointer;
      }
      .mailbox-item.pending-signal{
        border-color:rgba(120,190,255,.22);
        background:rgba(70,120,200,.08);
      }
      .mailbox-item.no-action{
        cursor:default;
      }
      .mailbox-item:active{
        transform:translateY(1px);
      }
      .mailbox-item.no-action:active{
        transform:none;
      }
      .mailbox-left{
        min-width:0;
        flex:1;
        padding-right:18px;
      }
      .mailbox-kicker{
        display:flex;
        align-items:center;
        gap:6px;
        font-size:11px;
        letter-spacing:.08em;
        text-transform:uppercase;
        opacity:.72;
      }
      .mailbox-kicker .dot{
        width:5px;
        height:5px;
        border-radius:99px;
        background:rgba(255,255,255,.58);
      }
      .mailbox-item-title{
        margin-top:5px;
        font-size:14px;
        font-weight:800;
        line-height:1.25;
      }
      .mailbox-item-line{
        margin-top:4px;
        font-size:12px;
        line-height:1.35;
        opacity:.82;
        white-space:pre-line;
      }
      .mailbox-act{
        flex-shrink:0;
        border:1px solid rgba(255,255,255,.16);
        background:rgba(0,0,0,.35);
        color:#fff;
        border-radius:12px;
        padding:7px 10px;
        font-size:12px;
        font-weight:800;
        letter-spacing:.02em;
        cursor:pointer;
      }
      .mailbox-actions{
        display:flex;
        flex-direction:column;
        align-items:flex-end;
        gap:6px;
      }
      .mailbox-dismiss-x{
        position:absolute;
        top:6px;
        right:6px;
        width:22px;
        height:22px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(0,0,0,.22);
        color:rgba(255,255,255,.72);
        border-radius:8px;
        padding:0;
        font-size:14px;
        line-height:20px;
        font-weight:700;
        cursor:pointer;
      }
      .mailbox-dismiss{
        flex-shrink:0;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(0,0,0,.18);
        color:rgba(255,255,255,.86);
        border-radius:12px;
        padding:6px 10px;
        font-size:11px;
        font-weight:700;
        letter-spacing:.02em;
        cursor:pointer;
      }
      .mailbox-empty{
        border:1px dashed rgba(255,255,255,.16);
        border-radius:14px;
        padding:14px;
        font-size:13px;
        line-height:1.4;
        opacity:.74;
      }
      .mailbox-notice{
        display:none;
        margin:0 0 10px;
        border:1px solid rgba(255,255,255,.13);
        background:rgba(0,0,0,.28);
        border-radius:12px;
        padding:8px 10px;
        color:rgba(255,255,255,.88);
        font-size:12px;
        line-height:1.35;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    if (S.backEl && document.body.contains(S.backEl)) return S.backEl;
    ensureStyles();

    const back = document.createElement("div");
    back.className = "sheet-back";
    back.id = "mailboxBack";
    back.style.display = "none";
    back.innerHTML = `
      <div class="sheet-card mailbox-sheet" role="dialog" aria-modal="true" aria-label="Mailbox">
        <div class="mailbox-head">
          <div>
            <div class="mailbox-title">Mailbox</div>
            <div class="mailbox-sub">Pack Signals and important updates.</div>
          </div>
          <button type="button" class="mailbox-close" aria-label="Close mailbox">×</button>
        </div>
        <div id="mailboxNotice" class="mailbox-notice" role="status" aria-live="polite"></div>
        <div id="mailboxBody"></div>
      </div>
    `;

    back.addEventListener("click", (ev) => {
      if (ev.target === back) close();
    });
    back.querySelector(".mailbox-close")?.addEventListener("click", close);

    S.backEl = back;
    document.body.appendChild(back);
    return back;
  }

  async function api(path, body) {
    if (typeof S.apiPost !== "function") throw new Error("apiPost missing");
    return S.apiPost(path, body || {});
  }

  function showNotice(text) {
    const back = ensureModal();
    const notice = back.querySelector("#mailboxNotice");
    if (!notice) return;
    const msg = asText(text);
    notice.textContent = msg;
    notice.style.display = msg ? "block" : "none";
    if (msg) {
      window.setTimeout(() => {
        if (notice.textContent === msg) {
          notice.textContent = "";
          notice.style.display = "none";
        }
      }, 2600);
    }
  }

  async function load() {
    return loadState();
  }

  function isFreshEnough() {
    return !!(S.lastLoadAt && (Date.now() - S.lastLoadAt) < STATE_STALE_MS);
  }

  function freshnessAgeMs() {
    return Math.max(0, Date.now() - Number(S.lastLoadAt || 0));
  }

  function logFreshSkip(reason, force) {
    log("skip mailbox/state; fresh cache", {
      reason,
      force: !!force,
      ageMs: freshnessAgeMs(),
      open: isOpen(),
      pollerCount: S.pollTimer ? 1 : 0,
    });
  }

  async function loadState(options = {}) {
    const { force = false, reason = "auto" } = options || {};
    if (!force && S.lastLoadAt && isFreshEnough()) {
      logFreshSkip(reason, force);
      return {
        items: S.items,
        pendingSignals: S.pendingSignals,
        messages: S.messages,
        serverTs: S.serverTs || Math.floor(Date.now() / 1000),
      };
    }

    if (S.loadPromise) {
      log("reuse mailbox/state in-flight", {
        reason,
        force: !!force,
        ageMs: freshnessAgeMs(),
        open: isOpen(),
        pollerCount: S.pollTimer ? 1 : 0,
      });
      return S.loadPromise;
    }

    const reqSeq = ++S.loadSeq;
    log("load mailbox/state", {
      reason,
      force: !!force,
      ageMs: freshnessAgeMs(),
      open: isOpen(),
      pollerCount: S.pollTimer ? 1 : 0,
    });

    S.loadPromise = (async () => {
      try {
        const raw = await api("/webapp/mailbox/state", {});
        if (reqSeq !== S.loadSeq) {
          return {
            items: S.items,
            pendingSignals: S.pendingSignals,
            messages: S.messages,
            serverTs: S.serverTs || Math.floor(Date.now() / 1000),
          };
        }
        const normalized = normalizePayload(raw || {});
        S.items = normalized.items;
        S.pendingSignals = normalized.pendingSignals;
        S.messages = normalized.messages;
        S.pendingCount = normalized.pendingCount;
        S.unreadCount = normalized.unreadCount;
        S.totalAttentionCount = normalized.totalAttentionCount;
        S.serverTs = normalized.serverTs;
        S.lastLoadAt = Date.now();
        log("mailbox/state loaded", {
          reason,
          force: !!force,
          fresh: true,
          ageMs: 0,
          pendingCount: S.pendingCount,
          messageCount: S.messages.length,
          open: isOpen(),
          pollerCount: S.pollTimer ? 1 : 0,
        });
        applyHubUnreadBadge();
        if (isOpen()) {
          render();
        }
        return normalized;
      } catch (err) {
        if (reqSeq !== S.loadSeq) {
          return {
            items: S.items,
            pendingSignals: S.pendingSignals,
            messages: S.messages,
            serverTs: S.serverTs || Math.floor(Date.now() / 1000),
          };
        }
        warn("load failed", { reason, force: !!force, err });
        applyHubUnreadBadge();
        return {
          items: S.items,
          pendingSignals: S.pendingSignals,
          messages: S.messages,
          serverTs: S.serverTs || Math.floor(Date.now() / 1000),
        };
      } finally {
        S.loadPromise = null;
      }
    })();

    return S.loadPromise;
  }

  async function refresh() {
    return loadState({ force: true, reason: "manual_refresh" });
  }

  function markSeenNow() {
    const latest = latestItemTs(S.messages);
    if (latest > 0) {
      writeSeenTs(Math.max(readSeenTs(), latest));
      applyHubUnreadBadge();
    }
  }

  async function openAlphaDen() {
    try { window.showSection?.("map"); } catch (_) {}
    if (typeof window.Map?.openAlphaDenFromMap === "function") {
      return !!await window.Map.openAlphaDenFromMap();
    }
    if (typeof window.AlphaDen?.open === "function") {
      window.AlphaDen.open();
      return true;
    }
    if (typeof window.ensureAlphaDenLoaded === "function") {
      try {
        await window.ensureAlphaDenLoaded();
        if (typeof window.AlphaDen?.open === "function") {
          window.AlphaDen.open();
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  async function openStats() {
    if (typeof window.Stats?.open === "function") {
      window.Stats.open();
      return true;
    }
    if (typeof window.openStats === "function") {
      window.openStats();
      return true;
    }
    const btn = document.querySelector('.ah-action[data-action="stats"], [data-action="stats"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }

  async function openQuestBoard() {
    if (typeof window.Quests?.open === "function") {
      window.Quests.open();
      return true;
    }
    const launcher = document.getElementById("quests-launcher");
    if (launcher) {
      launcher.click();
      return true;
    }
    return false;
  }

  async function openInfluence() {
    try { window.showSection?.("map"); } catch (_) {}
    if (typeof window.Influence?.open === "function") {
      window.Influence.open("phantom_nodes", "Phantom Nodes");
      return true;
    }
    if (typeof window.CTA?.openTarget === "function") {
      return !!await window.CTA.openTarget({ type: "map_node", nodeId: "phantom_nodes" });
    }
    return true;
  }

  async function openProfile() {
    if (typeof window.Equipped?.open === "function") {
      window.Equipped.open();
      return true;
    }
    const btn = document.querySelector('.ah-action[data-action="equipped"], .btn.profile, [data-action="profile"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }

  async function openTarget(target) {
    if (!target || typeof target !== "object") return false;

    if (typeof window.CTA?.openTarget === "function") {
      const ctaTarget = normalizeTarget(target);
      if (ctaTarget && !["stats", "den", "profile"].includes(ctaTarget.type)) {
        try {
          return await window.CTA.openTarget(ctaTarget);
        } catch (err) {
          warn("CTA.openTarget failed", err);
        }
      }
    }

    const type = asText(target?.type).toLowerCase();
    if (type === "stats") return openStats();
    if (type === "den") return openAlphaDen();
    if (type === "profile") return openProfile();
    if (type === "siege") {
      try { window.showSection?.("map"); } catch (_) {}
      const nodeId = asText(target?.nodeId);
      return !!window.Siege?.openForNode?.(nodeId) || !!window.Siege?.open?.(nodeId) || true;
    }
    if (type === "missions") return openQuestBoard();
    if (type === "bloodmoon") return !!window.BloodMoon?.open?.();
    if (type === "fortress") return !!window.Fortress?.open?.();
    if (type === "open_action") {
      const action = asText(target?.action).toLowerCase();
      if (action === "stats") return openStats();
      if (action === "open_alpha_den" || action === "alpha_den" || action === "den") return openAlphaDen();
      if (action === "quests" || action === "quest_board") return openQuestBoard();
      if (action === "equipped" || action === "profile") return openProfile();
      if (action === "factions") return !!window.Factions?.openPicker?.() || !!window.Factions?.open?.({ mode: "select" });
      if (action === "skins") return !!window.Skins?.open?.();
      if (action === "broken_contracts") return !!window.BrokenContracts?.open?.();
      if (action === "treasury") return !!window.HowlTreasury?.open?.();
    }
    if (type === "send_howl") {
      const targetUid = asText(target?.target_uid || target?.targetUid);
      const ok = await window.PlayerProfile?.sendHowl?.(targetUid, "mailbox");
      showNotice(ok ? "Howl sent." : "Could not send Howl.");
      if (ok) {
        await loadState({ force: true, reason: "send_howl" });
        render();
      }
      return !!ok;
    }
    if (type === "player_profile") {
      const targetUid = asText(target?.target_uid || target?.targetUid);
      return !!window.PlayerProfile?.open?.(targetUid, { source: "mailbox" });
    }
    if (type === "map_node") {
      const nodeId = asText(target?.nodeId);
      if (nodeId === "phantom_nodes") return openInfluence();
      try { window.showSection?.("map"); } catch (_) {}
      return true;
    }
    return false;
  }

  async function dismissItem(itemId) {
    const id = asText(itemId);
    if (!id) return false;
    if (S.dismissing.size > 0) return false;
    if (S.dismissing.has(id)) return false;
    const prevMessages = Array.isArray(S.messages) ? S.messages.slice() : [];
    const prevItems = Array.isArray(S.items) ? S.items.slice() : [];
    S.messages = prevMessages.filter((row) => asText(row?.id) !== id);
    S.items = prevItems.filter((row) => asText(row?.id) !== id);
    applyHubUnreadBadge();
    render();
    S.dismissing.add(id);
    try {
      const out = await api("/webapp/mailbox/dismiss", { message_id: id });
      if (!out || out.ok === false) {
        S.messages = prevMessages;
        S.items = prevItems;
        applyHubUnreadBadge();
        render();
        showNotice("Could not dismiss that message. Try again.");
        return false;
      }
      S.lastLoadAt = 0;
      await loadState({ force: true, reason: "dismiss" });
      render();
      return true;
    } catch (err) {
      warn("dismiss failed", err);
      S.messages = prevMessages;
      S.items = prevItems;
      applyHubUnreadBadge();
      render();
      showNotice("Could not dismiss that message. Try again.");
      return false;
    } finally {
      S.dismissing.delete(id);
    }
  }

  function renderItemsSection(root, title, items, nowTs, { pending = false } = {}) {
    if (!Array.isArray(items) || !items.length) return;
    const sec = document.createElement("section");
    sec.className = "mailbox-section";
    sec.innerHTML = `<div class="mailbox-section-title">${esc(title)}</div><div class="mailbox-list"></div>`;
    const list = sec.querySelector(".mailbox-list");

    for (const item of items) {
      const row = document.createElement("article");
      row.className = `mailbox-item${item.hasAction ? "" : " no-action"}${pending ? " pending-signal" : ""}`;
      const stamp = relTime(item.ts, nowTs);
      const actionButton = item.hasAction
        ? `<button type="button" class="mailbox-act">${esc(item.actionLabel || "Open")}</button>`
        : "";
      const dismissButton = (!pending && item.dismissible)
        ? `<button type="button" class="mailbox-dismiss-x" data-item-id="${esc(item.id)}" aria-label="Dismiss message">×</button>`
        : "";
      const controls = actionButton
        ? `<div class="mailbox-actions">${actionButton}</div>`
        : "";
      const senderUid = asText(item?.meta?.sender_uid || item?.meta?.senderUid);
      const senderName = asText(item?.meta?.sender_name || item?.meta?.senderName);
      const profileButton = senderUid
        ? `<button type="button" class="mailbox-dismiss mailbox-profile" data-profile-uid="${esc(senderUid)}">${esc(senderName || "View Profile")}</button>`
        : "";
      const kicker = stamp ? `${kindIcon(item.kind)} · ${stamp}` : kindIcon(item.kind);
      row.innerHTML = `
        ${dismissButton}
        <div class="mailbox-left">
          <div class="mailbox-kicker"><span>${esc(kicker)}</span><span class="dot"></span><span>${esc(item.badge || "INFO")}</span></div>
          <div class="mailbox-item-title">${esc(item.title)}</div>
          ${profileButton}
          <div class="mailbox-item-line">${esc(item.body || item.line)}</div>
        </div>
        ${controls}
      `;

      if (item.hasAction) {
        const open = async () => {
          try { S.tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
          await openTarget(item.target);
          close();
        };
        row.addEventListener("click", (ev) => {
          if (ev.target?.closest?.(".mailbox-dismiss-x, .mailbox-profile")) return;
          void open();
        });
        row.querySelector(".mailbox-act")?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          void open();
        });
      }

      row.querySelector(".mailbox-dismiss-x")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        try { S.tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
        void dismissItem(item.id);
      });
      row.querySelector(".mailbox-profile")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const uid = asText(ev.currentTarget?.getAttribute("data-profile-uid"));
        if (uid) window.PlayerProfile?.open?.(uid, { source: "mailbox" });
      });

      list.appendChild(row);
    }

    root.appendChild(sec);
  }

  function render() {
    const back = ensureModal();
    const body = back.querySelector("#mailboxBody");
    if (!body) return;
    body.innerHTML = "";

    const hasPending = S.pendingSignals.length > 0;
    const hasMessages = S.messages.length > 0;
    if (!hasPending && !hasMessages) {
      body.innerHTML = `<div class="mailbox-empty">No important personal items right now. Pack Signals will appear when rewards are waiting.</div>`;
      return;
    }

    const seenTs = readSeenTs();
    const nowTs = S.serverTs || Math.floor(Date.now() / 1000);
    if (hasPending) {
      renderItemsSection(body, "Pack Signals", S.pendingSignals, nowTs, { pending: true });
    }

    const fresh = [];
    const older = [];
    for (const item of S.messages) {
      if (item.ts > seenTs) fresh.push(item);
      else older.push(item);
    }

    if (fresh.length) renderItemsSection(body, "New", fresh, nowTs);
    if (older.length) renderItemsSection(body, fresh.length ? "Earlier" : "Inbox", older, nowTs);
  }

  async function open() {
    ensureModal();
    const alreadyOpen = isOpen();
    const shouldForce = !(S.lastLoadAt && isFreshEnough());
    log("open", {
      reason: alreadyOpen ? "open_already_visible" : "open",
      force: shouldForce,
      ageMs: freshnessAgeMs(),
      open: alreadyOpen,
      pollerCount: S.pollTimer ? 1 : 0,
    });
    await loadState({ force: shouldForce, reason: alreadyOpen ? "open_already_visible" : "open" });
    render();
    if (S.backEl) S.backEl.style.display = "flex";
    markSeenNow();
  }

  function close() {
    if (S.backEl) S.backEl.style.display = "none";
  }

  function clearPolling() {
    if (S.pollTimer) {
      clearInterval(S.pollTimer);
      S.pollTimer = null;
      S.pollerCount = 0;
      log("poll stop", { pollerCount: 0 });
    }
  }

  function ensurePolling() {
    if (S.pollTimer) {
      log("duplicate poller blocked", { pollerCount: 1 });
      return;
    }
    S.pollTimer = setInterval(() => { void loadState({ reason: "poll" }); }, POLL_MS);
    S.pollerCount = 1;
    log("poll start", { pollerCount: 1, intervalMs: POLL_MS });
  }

  function init({ apiPost, tg, dbg } = {}) {
    if (typeof apiPost === "function") S.apiPost = apiPost;
    if (tg) S.tg = tg;
    S.dbg = !!dbg;
    S.initCount += 1;

    if (!S.apiPost) {
      warn("init skipped, apiPost missing");
      return;
    }

    log("init", { initCount: S.initCount, alreadyInited: S.inited, pollerCount: S.pollTimer ? 1 : 0 });

    ensureModal();
    if (!S.inited) {
      void loadState({ reason: "init" });
      S.inited = true;
    } else {
      void loadState({ reason: "init_reentry" });
    }
    ensurePolling();

    if (!S.visHandler) {
      S.visHandler = () => {
        if (document.visibilityState === "visible") void loadState({ reason: "visibilitychange" });
      };
      document.addEventListener("visibilitychange", S.visHandler);
      log("visibility handler attached", { pollerCount: S.pollTimer ? 1 : 0 });
    }
  }

  function destroy() {
    clearPolling();
    S.inited = false;
    S.loadPromise = null;
    if (S.visHandler) {
      document.removeEventListener("visibilitychange", S.visHandler);
      S.visHandler = null;
    }
    if (S.backEl) {
      S.backEl.remove();
      S.backEl = null;
    }
  }

  global.Mailbox = {
    init,
    load,
    refresh,
    open,
    close,
    openTarget,
    destroy,
  };
})(window);