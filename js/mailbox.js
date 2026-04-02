// Alpha Husky WebApp — Mailbox MVP
// Personal inbox: important things waiting for YOU.
// Endpoint:
//   POST /webapp/mailbox/state
(function (global) {
  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    items: [],
    serverTs: 0,
    pollTimer: null,
    visHandler: null,
    backEl: null,
  };

  const SEEN_KEY = "ah_mailbox_seen_ts_v1";
  const POLL_MS = 90 * 1000;
  const MAX_ITEMS = 8;

  const log = (...args) => { if (S.dbg) console.log("[Mailbox]", ...args); };
  const warn = (...args) => { if (S.dbg) console.warn("[Mailbox]", ...args); };

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

    return null;
  }

  function normalizeItem(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = asText(raw.id);
    const kind = asText(raw.kind).toLowerCase();
    const title = asText(raw.title);
    const line = asText(raw.line);
    const target = normalizeTarget(raw.target);
    if (!id || !kind || !title) return null;
    const hasAction = !!target;
    const actionLabel = hasAction ? (asText(raw.actionLabel) || "Open") : "";
    return {
      id,
      kind,
      title,
      line,
      badge: asText(raw.badge).toUpperCase(),
      ts: Math.max(0, asInt(raw.ts, 0)),
      target,
      hasAction,
      actionLabel,
      meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {},
    };
  }

  function normalizePayload(raw) {
    const data = raw?.data && typeof raw.data === "object" ? raw.data : raw;
    const rows = Array.isArray(data?.items) ? data.items : [];
    const items = [];
    const seen = new Set();
    for (const row of rows) {
      const item = normalizeItem(row);
      if (!item || seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
      if (items.length >= MAX_ITEMS) break;
    }
    items.sort((a, b) => (b.ts - a.ts) || a.id.localeCompare(b.id));
    return {
      items,
      serverTs: asInt(data?.serverTs, Math.floor(Date.now() / 1000)),
    };
  }

  function kindIcon(kind) {
    if (kind === "mission_ready") return "MISSION";
    if (kind === "bloodmoon_claim_ready") return "TOWER";
    if (kind === "contracts_claim_ready") return "CONTRACT";
    if (kind === "contracts_progress") return "CO-OP";
    if (kind === "fortress_ready") return "RAID";
    if (kind === "developer_announcement") return "NEWS";
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

  function unreadCount() {
    const seenTs = readSeenTs();
    let count = 0;
    for (const item of S.items) {
      if (asInt(item?.ts, 0) > seenTs) count += 1;
    }
    return count;
  }

  function applyHubUnreadBadge() {
    const badge = document.querySelector('.ah-badge[data-badge="hub"]');
    if (!badge) return;

    const count = unreadCount();
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
      .mailbox-empty{
        border:1px dashed rgba(255,255,255,.16);
        border-radius:14px;
        padding:14px;
        font-size:13px;
        line-height:1.4;
        opacity:.74;
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
            <div class="mailbox-sub">Important things waiting for you.</div>
          </div>
          <button type="button" class="mailbox-close" aria-label="Close mailbox">×</button>
        </div>
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

  async function load() {
    try {
      const raw = await api("/webapp/mailbox/state", {});
      const normalized = normalizePayload(raw || {});
      S.items = normalized.items;
      S.serverTs = normalized.serverTs;
      applyHubUnreadBadge();
      if (S.backEl && S.backEl.style.display !== "none") {
        render();
      }
      return normalized;
    } catch (err) {
      warn("load failed", err);
      applyHubUnreadBadge();
      return { items: S.items, serverTs: S.serverTs || Math.floor(Date.now() / 1000) };
    }
  }

  async function refresh() {
    return load();
  }

  function markSeenNow() {
    const latest = latestItemTs(S.items);
    if (latest > 0) {
      writeSeenTs(Math.max(readSeenTs(), latest));
      applyHubUnreadBadge();
    }
  }

  async function openTarget(target) {
    if (!target || typeof target !== "object") return false;

    if (typeof window.CTA?.openTarget === "function") {
      try {
        return await window.CTA.openTarget(target);
      } catch (err) {
        warn("CTA.openTarget failed", err);
      }
    }

    const type = asText(target?.type).toLowerCase();
    if (type === "siege") {
      try { window.showSection?.("map"); } catch (_) {}
      const nodeId = asText(target?.nodeId);
      return !!window.Siege?.openForNode?.(nodeId) || !!window.Siege?.open?.(nodeId) || true;
    }
    if (type === "missions") return !!window.Missions?.open?.();
    if (type === "bloodmoon") return !!window.BloodMoon?.open?.();
    if (type === "fortress") return !!window.Fortress?.open?.();
    if (type === "open_action") {
      const action = asText(target?.action).toLowerCase();
      if (action === "factions") return !!window.Factions?.openPicker?.() || !!window.Factions?.open?.({ mode: "select" });
      if (action === "equipped") return !!window.Equipped?.open?.();
      if (action === "broken_contracts") return !!window.BrokenContracts?.open?.();
    }
    if (type === "map_node") {
      try { window.showSection?.("map"); } catch (_) {}
      return true;
    }
    return false;
  }

  function renderItemsSection(root, title, items, nowTs) {
    if (!Array.isArray(items) || !items.length) return;
    const sec = document.createElement("section");
    sec.className = "mailbox-section";
    sec.innerHTML = `<div class="mailbox-section-title">${esc(title)}</div><div class="mailbox-list"></div>`;
    const list = sec.querySelector(".mailbox-list");

    for (const item of items) {
      const row = document.createElement("article");
      row.className = `mailbox-item${item.hasAction ? "" : " no-action"}`;
      const stamp = relTime(item.ts, nowTs);
      const actionButton = item.hasAction
        ? `<button type="button" class="mailbox-act">${esc(item.actionLabel || "Open")}</button>`
        : "";
      const kicker = stamp ? `${kindIcon(item.kind)} · ${stamp}` : kindIcon(item.kind);
      row.innerHTML = `
        <div class="mailbox-left">
          <div class="mailbox-kicker"><span>${esc(kicker)}</span><span class="dot"></span><span>${esc(item.badge || "INFO")}</span></div>
          <div class="mailbox-item-title">${esc(item.title)}</div>
          <div class="mailbox-item-line">${esc(item.line)}</div>
        </div>
        ${actionButton}
      `;

      if (item.hasAction) {
        const open = async () => {
          try { S.tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
          await openTarget(item.target);
          close();
        };
        row.addEventListener("click", () => { void open(); });
        row.querySelector(".mailbox-act")?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          void open();
        });
      }

      list.appendChild(row);
    }

    root.appendChild(sec);
  }

  function render() {
    const back = ensureModal();
    const body = back.querySelector("#mailboxBody");
    if (!body) return;
    body.innerHTML = "";

    if (!S.items.length) {
      body.innerHTML = `<div class="mailbox-empty">No important personal items right now. New rewards and ready states will appear here.</div>`;
      return;
    }

    const seenTs = readSeenTs();
    const nowTs = S.serverTs || Math.floor(Date.now() / 1000);
    const fresh = [];
    const older = [];
    for (const item of S.items) {
      if (item.ts > seenTs) fresh.push(item);
      else older.push(item);
    }

    if (fresh.length) renderItemsSection(body, "New", fresh, nowTs);
    if (older.length) renderItemsSection(body, fresh.length ? "Earlier" : "Inbox", older, nowTs);
  }

  async function open() {
    ensureModal();
    await load();
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
    }
  }

  function init({ apiPost, tg, dbg } = {}) {
    if (typeof apiPost === "function") S.apiPost = apiPost;
    if (tg) S.tg = tg;
    S.dbg = !!dbg;

    if (!S.apiPost) {
      warn("init skipped, apiPost missing");
      return;
    }

    ensureModal();
    void load();
    clearPolling();
    S.pollTimer = setInterval(() => { void load(); }, POLL_MS);

    if (!S.visHandler) {
      S.visHandler = () => {
        if (document.visibilityState === "visible") void load();
      };
      document.addEventListener("visibilitychange", S.visHandler);
    }
  }

  function destroy() {
    clearPolling();
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
