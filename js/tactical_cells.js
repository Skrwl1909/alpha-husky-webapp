(function (global) {
  "use strict";

  const VERSION = "tactical_cells.js v0.1.0";
  const ROOT_ID = "tacticalCellsRoot";
  const STYLE_ID = "tacticalCellsStyles";
  const STATE_PATH = "/webapp/tactical-cells/state";
  const POLL_MS = 2000;

  const runtime = {
    apiPost: null,
    tg: null,
    dbg: false,
    root: null,
    isOpen: false,
    serverState: null,
    busy: false,
    statusText: "",
    joinToken: "",
    pollTimer: 0,
    keyHandlerBound: false
  };

  try { global.__AH_TACTICAL_CELLS_VER__ = VERSION; } catch (_) {}

  function text(value, fallback) {
    const out = String(value == null ? "" : value).trim();
    return out || (fallback || "");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function notify(message) {
    const copy = text(message);
    if (!copy) return;
    runtime.statusText = copy;
    try {
      if (typeof global.showToast === "function") { global.showToast(copy); return; }
      if (global.AlphaToast?.show) { global.AlphaToast.show({ message: copy }); return; }
    } catch (_) {}
  }

  function makeRequestId(kind) {
    const prefix = "tcell_" + text(kind, "op") + "_";
    try {
      if (global.crypto?.randomUUID) return prefix + String(global.crypto.randomUUID()).replace(/-/g, "");
    } catch (_) {}
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function getApiPost() {
    const fn = runtime.apiPost || global.apiPost || global.S?.apiPost || global.AH?.apiPost || null;
    return typeof fn === "function" ? fn : null;
  }

  function extractCode(payload) {
    if (!payload || typeof payload !== "object") return "";
    return text(payload.code || payload.reason || payload.error);
  }

  function normalizeCell(raw) {
    if (!raw || typeof raw !== "object") return null;
    const members = Array.isArray(raw.members) ? raw.members.filter((row) => row && typeof row === "object") : [];
    return {
      cellId: text(raw.cellId),
      status: text(raw.status, "LOBBY").toUpperCase(),
      leaderUserId: text(raw.leaderUserId),
      inviteToken: text(raw.inviteToken),
      members: members.map((row) => ({
        userId: text(row.userId),
        displayName: text(row.displayName, "Operator"),
        slot: Number(row.slot) || 0,
        ready: !!row.ready,
        isLeader: !!row.isLeader,
        isSelf: !!row.isSelf
      })),
      memberCount: Number(raw.memberCount) || members.length,
      maxMembers: Number(raw.maxMembers) || 3,
      allReady: !!raw.allReady
    };
  }

  function normalizeState(raw) {
    const root = raw && typeof raw === "object" ? (raw.data && typeof raw.data === "object" ? raw.data : raw) : {};
    return {
      featureEnabled: !!root.featureEnabled,
      cell: normalizeCell(root.cell)
    };
  }

  function selfMember(cell) {
    return (cell?.members || []).find((row) => row.isSelf) || null;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{position:fixed;inset:0;z-index:1510;pointer-events:none;}
#${ROOT_ID}[data-open="1"]{pointer-events:auto;}
.tcell-overlay{position:absolute;inset:0;opacity:0;transition:opacity .16s ease;}
#${ROOT_ID}[data-open="1"] .tcell-overlay{opacity:1;}
.tcell-backdrop{position:absolute;inset:0;border:0;background:rgba(2,5,9,.84);}
.tcell-shell{position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:14px 12px calc(18px + env(safe-area-inset-bottom,0px));overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}
.tcell-panel{position:relative;width:min(100%,520px);margin:0 auto;padding:16px 14px 18px;border:1px solid rgba(123,183,206,.22);border-radius:18px;background:linear-gradient(180deg,#0b1219 0%,#070b10 62%,#05080c 100%);box-shadow:0 24px 70px rgba(0,0,0,.55);color:#d7e6ee;}
.tcell-kicker{margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7bb7ce;}
.tcell-title{margin:0 0 8px;font-size:26px;line-height:1.05;letter-spacing:.04em;text-transform:uppercase;}
.tcell-copy{margin:0 0 12px;font-size:14px;line-height:1.45;color:#b7c8d2;}
.tcell-note{margin:8px 0 0;font-size:12px;line-height:1.4;color:#8ea3af;}
.tcell-status{min-height:18px;margin:0 0 10px;font-size:12px;color:#9ec3ce;}
.tcell-block{margin:0 0 14px;padding:12px;border:1px solid rgba(123,183,206,.16);border-radius:12px;background:rgba(8,14,20,.72);}
.tcell-block h3{margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8ec5d6;}
.tcell-slot{display:flex;justify-content:space-between;gap:10px;margin:6px 0;padding:8px 10px;border:1px solid rgba(123,183,206,.12);border-radius:10px;font-size:13px;}
.tcell-slot.is-self{border-color:rgba(126,206,224,.45);}
.tcell-token{word-break:break-all;font-family:ui-monospace,Consolas,monospace;font-size:12px;color:#e8f4f8;}
.tcell-input{width:100%;min-height:44px;margin:8px 0;padding:10px 12px;border:1px solid rgba(123,183,206,.22);border-radius:10px;background:#0a1118;color:#d7e6ee;}
.tcell-actions{display:grid;grid-template-columns:1fr;gap:8px;}
.tcell-btn{min-height:48px;padding:12px 14px;border:1px solid rgba(123,183,206,.24);border-radius:12px;background:#101920;color:#e8f4f8;font-size:13px;letter-spacing:.08em;text-transform:uppercase;}
.tcell-btn--primary{background:linear-gradient(180deg,#1a3a46,#10242c);border-color:rgba(126,206,224,.45);}
.tcell-btn[disabled]{opacity:.45;}
.tcell-close{position:absolute;top:10px;right:10px;min-width:44px;min-height:44px;border:0;background:transparent;color:#9db0ba;font-size:22px;}
@media (prefers-reduced-motion:reduce){.tcell-overlay{transition:none;}}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.setAttribute("data-open", "0");
      document.body.appendChild(root);
      root.addEventListener("click", onRootClick);
      root.addEventListener("input", onRootInput);
    }
    if (!runtime.keyHandlerBound) {
      document.addEventListener("keydown", onKeyDown, true);
      runtime.keyHandlerBound = true;
    }
    runtime.root = root;
    return root;
  }

  function slotRows(cell) {
    const bySlot = {};
    (cell?.members || []).forEach((row) => { bySlot[row.slot] = row; });
    return [1, 2, 3].map((slot) => {
      const row = bySlot[slot];
      if (!row) {
        return `<div class="tcell-slot"><span>SLOT ${slot}</span><span>OPEN</span></div>`;
      }
      const tags = [
        row.isLeader ? "LEADER" : "MEMBER",
        row.ready ? "READY" : "WAITING",
        row.isSelf ? "YOU" : ""
      ].filter(Boolean).join(" · ");
      return `<div class="tcell-slot${row.isSelf ? " is-self" : ""}"><span>${escapeHtml(row.displayName)}</span><span>${escapeHtml(tags)}</span></div>`;
    }).join("");
  }

  function renderAssemble() {
    return `
      <button type="button" class="tcell-close" data-tcell-action="close" aria-label="Close">×</button>
      <p class="tcell-kicker">PACK CELL</p>
      <h1 class="tcell-title">ASSEMBLE CELL</h1>
      <p class="tcell-status">${escapeHtml(runtime.statusText)}</p>
      <p class="tcell-copy">Three authenticated operators. Each player controls only their own ready state.</p>
      <section class="tcell-block">
        <h3>Create</h3>
        <p class="tcell-copy">Open a Cell and share the invite token.</p>
        <div class="tcell-actions">
          <button type="button" class="tcell-btn tcell-btn--primary" data-tcell-action="create" ${runtime.busy ? "disabled" : ""}>CREATE CELL</button>
        </div>
      </section>
      <section class="tcell-block">
        <h3>Join</h3>
        <input class="tcell-input" data-tcell-input="token" placeholder="Invite token" value="${escapeHtml(runtime.joinToken)}" ${runtime.busy ? "disabled" : ""} />
        <div class="tcell-actions">
          <button type="button" class="tcell-btn" data-tcell-action="join" ${runtime.busy ? "disabled" : ""}>JOIN CELL</button>
        </div>
      </section>
    `;
  }

  function renderLobby(cell) {
    const me = selfMember(cell);
    const isLeader = !!me?.isLeader;
    const readyLabel = me?.ready ? "UNREADY" : "READY";
    const readyAction = me?.ready ? "unready" : "ready";
    return `
      <button type="button" class="tcell-close" data-tcell-action="close" aria-label="Close">×</button>
      <p class="tcell-kicker">PACK CELL // ${escapeHtml(cell.status)}</p>
      <h1 class="tcell-title">ASSEMBLE CELL</h1>
      <p class="tcell-status">${escapeHtml(runtime.statusText)}</p>
      <p class="tcell-copy">${escapeHtml(String(cell.memberCount))} / ${escapeHtml(String(cell.maxMembers))} operators. Deploy is not available in this pass.</p>
      <section class="tcell-block">
        <h3>Cell</h3>
        ${slotRows(cell)}
      </section>
      <section class="tcell-block">
        <h3>Invite token</h3>
        <p class="tcell-token">${escapeHtml(cell.inviteToken)}</p>
        <div class="tcell-actions">
          <button type="button" class="tcell-btn" data-tcell-action="copy-token">COPY TOKEN</button>
        </div>
      </section>
      <div class="tcell-actions">
        <button type="button" class="tcell-btn tcell-btn--primary" data-tcell-action="${readyAction}" ${runtime.busy ? "disabled" : ""}>${readyLabel}</button>
        <button type="button" class="tcell-btn" data-tcell-action="leave" ${runtime.busy ? "disabled" : ""}>LEAVE</button>
        ${isLeader ? `<button type="button" class="tcell-btn" data-tcell-action="cancel" ${runtime.busy ? "disabled" : ""}>CANCEL CELL</button>` : ""}
      </div>
      <p class="tcell-note">Leader can cancel the lobby. Combat actions are not part of this pass.</p>
    `;
  }

  function renderUnavailable() {
    return `
      <button type="button" class="tcell-close" data-tcell-action="close" aria-label="Close">×</button>
      <p class="tcell-kicker">PACK CELL</p>
      <h1 class="tcell-title">OFFLINE</h1>
      <p class="tcell-copy">Pack Cell is disabled on this deployment.</p>
    `;
  }

  function render() {
    const root = ensureRoot();
    if (!root) return;
    root.setAttribute("data-open", runtime.isOpen ? "1" : "0");
    if (!runtime.isOpen) {
      root.innerHTML = "";
      return;
    }
    const state = runtime.serverState;
    let body = renderAssemble();
    if (state && state.featureEnabled === false) body = renderUnavailable();
    else if (state?.cell) body = renderLobby(state.cell);
    root.innerHTML = `
      <div class="tcell-overlay">
        <button type="button" class="tcell-backdrop" data-tcell-action="close" aria-label="Close Pack Cell"></button>
        <div class="tcell-shell">
          <section class="tcell-panel" role="dialog" aria-modal="true">${body}</section>
        </div>
      </div>
    `;
  }

  async function fetchState() {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("apiPost missing");
    const raw = await apiPost(STATE_PATH, {});
    if (!raw || raw.ok === false) throw Object.assign(new Error(extractCode(raw) || "STATE_FAIL"), { data: raw });
    runtime.serverState = normalizeState(raw);
    return runtime.serverState;
  }

  async function send(path, body) {
    if (runtime.busy) return;
    const apiPost = getApiPost();
    if (!apiPost) {
      notify("Command link unavailable.");
      render();
      return;
    }
    runtime.busy = true;
    render();
    try {
      const raw = await apiPost(path, Object.assign({ requestId: makeRequestId(path.split("/").pop()) }, body || {}));
      if (!raw || raw.ok === false) {
        notify(extractCode(raw) || "Request failed.");
        try { await fetchState(); } catch (_) {}
        return;
      }
      runtime.serverState = normalizeState(raw);
      runtime.statusText = "";
    } catch (error) {
      notify(text(error?.message, "Signal dropped."));
      try { await fetchState(); } catch (_) {}
    } finally {
      runtime.busy = false;
      if (runtime.isOpen) render();
    }
  }

  function stopPoll() {
    if (runtime.pollTimer) {
      try { global.clearInterval(runtime.pollTimer); } catch (_) {}
      runtime.pollTimer = 0;
    }
  }

  function startPoll() {
    stopPoll();
    runtime.pollTimer = global.setInterval(() => {
      if (!runtime.isOpen || runtime.busy) return;
      fetchState().then(() => { if (runtime.isOpen) render(); }).catch(() => {});
    }, POLL_MS);
  }

  function onRootInput(event) {
    const el = event.target.closest("[data-tcell-input]");
    if (!el) return;
    if (el.getAttribute("data-tcell-input") === "token") runtime.joinToken = el.value;
  }

  function onRootClick(event) {
    const el = event.target.closest("[data-tcell-action]");
    if (!el) return;
    const action = text(el.getAttribute("data-tcell-action"));
    if (action === "close") { close(); return; }
    if (action === "create") { void send("/webapp/tactical-cells/create", {}); return; }
    if (action === "join") { void send("/webapp/tactical-cells/join", { inviteToken: runtime.joinToken }); return; }
    if (action === "ready") { void send("/webapp/tactical-cells/ready", {}); return; }
    if (action === "unready") { void send("/webapp/tactical-cells/unready", {}); return; }
    if (action === "leave") { void send("/webapp/tactical-cells/leave", {}); return; }
    if (action === "cancel") { void send("/webapp/tactical-cells/cancel", {}); return; }
    if (action === "copy-token") {
      const token = runtime.serverState?.cell?.inviteToken || "";
      if (!token) return;
      Promise.resolve(global.navigator?.clipboard?.writeText?.(token)).then((ok) => {
        notify(ok === false ? "Copy failed." : "Invite token copied.");
        render();
      }).catch(() => {
        notify("Copy failed.");
        render();
      });
    }
  }

  function onKeyDown(event) {
    if (!runtime.isOpen || event.key !== "Escape") return;
    try { event.preventDefault(); event.stopPropagation(); } catch (_) {}
    close();
  }

  function pushNav() {
    const meta = { close: () => { closeView(); }, isOpen: () => runtime.isOpen };
    try {
      if (global.AlphaNav?.push) global.AlphaNav.push(ROOT_ID, meta);
      else {
        global.navRegister?.(ROOT_ID, meta);
        global.navOpen?.(ROOT_ID);
      }
    } catch (_) {}
  }

  function closeView() {
    runtime.isOpen = false;
    runtime.busy = false;
    runtime.statusText = "";
    stopPoll();
    const root = runtime.root || document.getElementById(ROOT_ID);
    if (root) {
      root.setAttribute("data-open", "0");
      root.innerHTML = "";
    }
  }

  function init(deps) {
    const next = deps && typeof deps === "object" ? deps : {};
    if (typeof next.apiPost === "function") runtime.apiPost = next.apiPost;
    if (next.tg) runtime.tg = next.tg;
    if (typeof next.dbg === "boolean") runtime.dbg = next.dbg;
    return API;
  }

  async function open() {
    ensureRoot();
    runtime.isOpen = true;
    runtime.statusText = "";
    render();
    pushNav();
    startPoll();
    try {
      await fetchState();
      if (runtime.isOpen) render();
    } catch (_) {
      runtime.statusText = "Command link failed.";
      if (runtime.isOpen) render();
    }
  }

  function close() {
    if (!runtime.isOpen) return;
    if (global.AlphaNav?.close?.(ROOT_ID, { source: "tactical-cells-close" })) return;
    closeView();
    try { global.navClose?.(ROOT_ID); } catch (_) {}
  }

  const API = { init, open, close };
  global.TacticalCells = API;
})(window);
