// js/oracle.js — Alpha Husky Oracle Void Doorway
// Self-contained modal UI for:
// - Live Echoes
// - Faction Pulse
// - Hall of Fame
//
// Backend contract:
// POST /webapp/oracle/state
// -> { ok:true, data:{ buildingId, liveEchoes, factionPulse, hallOfFame, meta } }

(function () {
  const Oracle = {};

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _inited = false;
  let _mounted = false;
  let _isOpen = false;
  let _loading = false;

  let _state = null;
  let _activeTab = "echoes";
  let _refreshTimer = null;

  const REFRESH_MS = 25000;

  const TAB_IDS = ["echoes", "pulse", "hall"];

  const FACTIONS = {
    rogue_byte:   { code: "RB", label: "Rogue Byte", cls: "rb" },
    echo_wardens: { code: "EW", label: "Echo Wardens", cls: "ew" },
    pack_burners: { code: "PB", label: "Pack Burners", cls: "pb" },
    inner_howl:   { code: "IH", label: "Inner Howl", cls: "ih" },
  };

  function dbg(...args) {
    if (_dbg) console.log("[Oracle]", ...args);
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost || null;
    _tg = tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    injectCss();
    ensureDom();
    bindEvents();

    _inited = true;
    dbg && console.log("[Oracle] init ok");
  }

  function open() {
    if (!_inited) init({});
    ensureDom();

    document.documentElement.classList.add("ah-oracle-open");
    document.body.classList.add("ah-oracle-open");

    els.back.style.display = "block";
    requestAnimationFrame(() => {
      els.back.classList.add("show");
      els.modal.classList.add("show");
    });

    lockScroll(true);
    _isOpen = true;

    showBackButton(true);
    startAutoRefresh();

    if (!_state) {
      fetchState({ silent: false });
    } else {
      render();
      fetchState({ silent: true });
    }
  }

  function close() {
  if (!els.back) return;

  _isOpen = false;

  els.back.classList.remove("show");
  els.modal.classList.remove("show");

  setTimeout(() => {
    if (_isOpen) return; // hide only if it was not reopened meanwhile
    els.back.style.display = "none";
  }, 180);

  lockScroll(false);
  showBackButton(false);
  stopAutoRefresh();

  document.documentElement.classList.remove("ah-oracle-open");
  document.body.classList.remove("ah-oracle-open");
  }

  function refresh() {
    return fetchState({ silent: false, force: true });
  }

  Oracle.init = init;
  Oracle.open = open;
  Oracle.close = close;
  Oracle.refresh = refresh;

  window.Oracle = Oracle;

  const els = {
    back: null,
    modal: null,
    root: null,
    body: null,
    tabs: null,
    title: null,
    subtitle: null,
    refreshBtn: null,
    closeBtn: null,
    statusDot: null,
  };

  function getApiPost() {
    const fn =
      _apiPost ||
      window.apiPost ||
      window.S?.apiPost ||
      null;

    return typeof fn === "function" ? fn : null;
  }

  function showBackButton(show) {
    const bb = _tg?.BackButton;
    if (!bb) return;

    try {
      bb.offClick(close);
    } catch (_) {}

    if (show) {
      try {
        bb.onClick(close);
        bb.show();
      } catch (_) {}
    } else {
      try {
        bb.hide();
      } catch (_) {}
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    _refreshTimer = setInterval(() => {
      if (_isOpen) fetchState({ silent: true });
    }, REFRESH_MS);
  }

  function stopAutoRefresh() {
    if (_refreshTimer) {
      clearInterval(_refreshTimer);
      _refreshTimer = null;
    }
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
    document.body.style.touchAction = lock ? "none" : "";
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "oracle-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 180);
    }, 2200);
  }

  function ensureDom() {
    if (_mounted && els.back && document.body.contains(els.back)) return;

    const back = document.createElement("div");
    back.id = "oracleBack";
    back.className = "oracle-back";
    back.style.display = "none";

    back.innerHTML = `
      <div class="oracle-modal" id="oracleModal" role="dialog" aria-modal="true" aria-label="Oracle Void Doorway">
        <div class="oracle-ambient oracle-ambient-a"></div>
        <div class="oracle-ambient oracle-ambient-b"></div>

        <div class="oracle-topbar">
          <div class="oracle-head">
            <div class="oracle-kicker">VOID DOORWAY</div>
            <div class="oracle-title-row">
              <div class="oracle-title">Oracle</div>
              <div class="oracle-live">
                <span class="oracle-live-dot" id="oracleStatusDot"></span>
                <span class="oracle-live-text">synced</span>
              </div>
            </div>
            <div class="oracle-subtitle" id="oracleSubtitle">Living world board</div>
          </div>

          <div class="oracle-actions">
            <button type="button" class="oracle-btn ghost" id="oracleRefreshBtn">Refresh</button>
            <button type="button" class="oracle-btn close" id="oracleCloseBtn" aria-label="Close Oracle">✕</button>
          </div>
        </div>

        <div class="oracle-meta-strip" id="oracleMetaStrip"></div>

        <div class="oracle-tabs" id="oracleTabs">
          <button type="button" class="oracle-tab is-active" data-tab="echoes">Live Echoes</button>
          <button type="button" class="oracle-tab" data-tab="pulse">Faction Pulse</button>
          <button type="button" class="oracle-tab" data-tab="hall">Hall of Fame</button>
        </div>

        <div class="oracle-body" id="oracleBody">
          <div class="oracle-root" id="oracleRoot"></div>
        </div>
      </div>
    `;

    document.body.appendChild(back);

    els.back = back;
    els.modal = back.querySelector("#oracleModal");
    els.root = back.querySelector("#oracleRoot");
    els.body = back.querySelector("#oracleBody");
    els.tabs = back.querySelector("#oracleTabs");
    els.subtitle = back.querySelector("#oracleSubtitle");
    els.refreshBtn = back.querySelector("#oracleRefreshBtn");
    els.closeBtn = back.querySelector("#oracleCloseBtn");
    els.statusDot = back.querySelector("#oracleStatusDot");

    _mounted = true;
  }

  function bindEvents() {
    if (!els.back) return;

    els.closeBtn?.addEventListener("click", close);
    els.refreshBtn?.addEventListener("click", () => refresh());

    els.back?.addEventListener("click", (e) => {
      if (e.target === els.back) close();
    });

    els.tabs?.addEventListener("click", (e) => {
      const btn = e.target.closest(".oracle-tab");
      if (!btn) return;
      const tab = btn.getAttribute("data-tab");
      if (!TAB_IDS.includes(tab)) return;
      _activeTab = tab;
      render();
    });
  }

  async function fetchState({ silent = false } = {}) {
    if (_loading) return;
    const apiPost = getApiPost();

    if (!apiPost) {
      toast("Oracle: apiPost missing");
      dbg("Missing apiPost");
      return;
    }

    _loading = true;
    setLoadingUi(true);

    try {
      const raw = await apiPost("/webapp/oracle/state", {});
      dbg("oracle raw", raw);

      const payload = normalizeOraclePayload(raw);
      _state = payload;
      render();

      if (!silent) pulseSynced();
      return payload;
    } catch (err) {
      console.error("[Oracle] fetchState failed", err);
      if (!silent) toast("Oracle sync failed");
      renderError(err);
    } finally {
      _loading = false;
      setLoadingUi(false);
    }
  }

  function normalizeOraclePayload(raw) {
    const data =
      raw?.data?.buildingId ? raw.data :
      raw?.buildingId ? raw :
      raw?.state?.buildingId ? raw.state :
      {};

    const liveEchoes = Array.isArray(data.liveEchoes) ? data.liveEchoes : [];
    const factionPulse = data.factionPulse && typeof data.factionPulse === "object"
      ? data.factionPulse
      : { summary: {}, factions: [] };

    const hallOfFame = data.hallOfFame && typeof data.hallOfFame === "object"
      ? data.hallOfFame
      : { topLevels: [], fortressStandout: {}, worldActor: {} };

    const meta = data.meta && typeof data.meta === "object"
      ? data.meta
      : {};

    return {
      buildingId: data.buildingId || "oracle_void_doorway",
      liveEchoes,
      factionPulse,
      hallOfFame,
      meta,
    };
  }

  function setLoadingUi(loading) {
    if (!els.refreshBtn) return;
    els.refreshBtn.disabled = loading;
    els.refreshBtn.textContent = loading ? "Syncing..." : "Refresh";
    if (els.statusDot) {
      els.statusDot.classList.toggle("busy", !!loading);
    }
  }

  function pulseSynced() {
    if (!els.statusDot) return;
    els.statusDot.classList.remove("busy");
    els.statusDot.classList.add("ok");
    setTimeout(() => els.statusDot?.classList.remove("ok"), 600);
  }

  function render() {
    updateTabs();

    if (!_state) {
      els.root.innerHTML = renderSkeleton();
      renderMetaStrip(null);
      return;
    }

    const { liveEchoes, factionPulse, hallOfFame, meta } = _state;

    renderMetaStrip({
      meta,
      pulse: factionPulse,
      echoes: liveEchoes,
    });

    if (_activeTab === "echoes") {
      els.root.innerHTML = renderEchoesTab(liveEchoes, meta);
      return;
    }

    if (_activeTab === "pulse") {
      els.root.innerHTML = renderPulseTab(factionPulse, meta);
      return;
    }

    if (_activeTab === "hall") {
      els.root.innerHTML = renderHallTab(hallOfFame, meta);
    }
  }

  function renderError(err) {
    updateTabs();
    renderMetaStrip(null);

    els.root.innerHTML = `
      <div class="oracle-empty danger">
        <div class="oracle-empty-icon">⚠</div>
        <div class="oracle-empty-title">Signal lost</div>
        <div class="oracle-empty-text">${escapeHtml(err?.message || "Oracle state unavailable")}</div>
      </div>
    `;
  }

  function updateTabs() {
    const buttons = els.tabs?.querySelectorAll(".oracle-tab") || [];
    buttons.forEach((btn) => {
      const isActive = btn.getAttribute("data-tab") === _activeTab;
      btn.classList.toggle("is-active", isActive);
    });

    const subtitleMap = {
      echoes: "Recent signals from across the world",
      pulse: "Live faction movement and pressure",
      hall: "Standouts, legends and active powers",
    };
    if (els.subtitle) {
      els.subtitle.textContent = subtitleMap[_activeTab] || "Living world board";
    }
  }

  function renderMetaStrip(ctx) {
    const strip = document.getElementById("oracleMetaStrip");
    if (!strip) return;

    if (!ctx) {
      strip.innerHTML = `
        <div class="oracle-chip muted">No signal</div>
        <div class="oracle-chip muted">Awaiting sync</div>
      `;
      return;
    }

    const meta = ctx.meta || {};
    const pulse = ctx.pulse || {};
    const summary = pulse.summary || {};

    const viewerFaction = meta.viewerFaction || "";
    const viewerFactionMeta = factionMeta(viewerFaction);
    const viewerLevel = intOr(meta.viewerLevel, 1);

    const chips = [
      viewerFaction
        ? `<div class="oracle-chip faction ${viewerFactionMeta.cls}">
             <span class="code">${viewerFactionMeta.code}</span>
             <span>${escapeHtml(viewerFactionMeta.label)}</span>
           </div>`
        : `<div class="oracle-chip muted">No faction</div>`,
      `<div class="oracle-chip">Lvl ${viewerLevel}</div>`,
      `<div class="oracle-chip">Echoes ${intOr(meta.echoCount, 0)}</div>`,
      `<div class="oracle-chip">Nodes ${intOr(meta.nodeCount, 0)}</div>`,
      `<div class="oracle-chip warn">Hot ${intOr(summary.hotNodes, 0)}</div>`,
      `<div class="oracle-chip danger">Sieges ${intOr(summary.activeSieges, 0)}</div>`,
    ];

    strip.innerHTML = chips.join("");
  }

  function renderEchoesTab(echoes, meta) {
    const rows = Array.isArray(echoes) ? echoes : [];

    if (!rows.length) {
      return `
        <div class="oracle-empty">
          <div class="oracle-empty-icon">◌</div>
          <div class="oracle-empty-title">No fresh echoes</div>
          <div class="oracle-empty-text">The Void is quiet for now. Refresh later or trigger new activity in the world.</div>
        </div>
      `;
    }

    return `
      <div class="oracle-panel">
        <div class="oracle-panel-head">
          <div>
            <div class="oracle-panel-kicker">LIVE ECHOES</div>
            <div class="oracle-panel-title">Recent world activity</div>
          </div>
          <div class="oracle-panel-note">${rows.length} visible</div>
        </div>

        <div class="oracle-echo-list">
          ${rows.map(renderEchoCard).join("")}
        </div>
      </div>
    `;
  }

  function renderEchoCard(row) {
    const faction = row?.faction || "";
    const fm = factionMeta(faction);
    const type = prettifyType(row?.type || "signal");
    const age = formatAge(row?.ageSec, row?.ts);
    const text = row?.text || "Unknown echo";
    const rarity = row?.rarity ? `<span class="oracle-tag rarity ${safeClass(row.rarity)}">${escapeHtml(String(row.rarity))}</span>` : "";
    const difficulty = row?.difficulty ? `<span class="oracle-tag">${escapeHtml(String(row.difficulty))}</span>` : "";
    const itemName = row?.itemName ? `<span class="oracle-inline-note">${escapeHtml(row.itemName)}</span>` : "";
    const missionName = row?.missionName ? `<span class="oracle-inline-note">${escapeHtml(row.missionName)}</span>` : "";
    const pathName = row?.path ? `<span class="oracle-inline-note">${escapeHtml(row.path)}</span>` : "";

    return `
      <article class="oracle-echo-card">
        <div class="oracle-echo-side ${fm.cls}">
          <div class="oracle-faction-badge ${fm.cls}">${escapeHtml(fm.code)}</div>
        </div>

        <div class="oracle-echo-main">
          <div class="oracle-echo-top">
            <div class="oracle-echo-type">${escapeHtml(type)}</div>
            <div class="oracle-echo-age">${escapeHtml(age)}</div>
          </div>

          <div class="oracle-echo-text">${escapeHtml(text)}</div>

          <div class="oracle-echo-meta">
            ${row?.name ? `<span class="oracle-tag">${escapeHtml(row.name)}</span>` : ""}
            ${difficulty}
            ${rarity}
            ${itemName}
            ${missionName}
            ${pathName}
          </div>
        </div>
      </article>
    `;
  }

  function renderPulseTab(factionPulse, meta) {
    const summary = factionPulse?.summary || {};
    const factions = Array.isArray(factionPulse?.factions) ? factionPulse.factions.slice() : [];

    factions.sort((a, b) => {
      return (
        intOr(b.controlledNodes, 0) - intOr(a.controlledNodes, 0) ||
        intOr(b.activeSieges, 0) - intOr(a.activeSieges, 0) ||
        intOr(b.recentEchoes, 0) - intOr(a.recentEchoes, 0)
      );
    });

    return `
      <div class="oracle-grid">
        <section class="oracle-panel">
          <div class="oracle-panel-head">
            <div>
              <div class="oracle-panel-kicker">WORLD PRESSURE</div>
              <div class="oracle-panel-title">Operational summary</div>
            </div>
          </div>

          <div class="oracle-summary-grid">
            ${summaryCard("Active Sieges", intOr(summary.activeSieges, 0), "danger")}
            ${summaryCard("Hot Nodes", intOr(summary.hotNodes, 0), "warn")}
            ${summaryCard("Controlled Nodes", intOr(summary.controlledNodes, 0), "neutral")}
          </div>
        </section>

        <section class="oracle-panel">
          <div class="oracle-panel-head">
            <div>
              <div class="oracle-panel-kicker">FACTION PULSE</div>
              <div class="oracle-panel-title">Control, motion and pressure</div>
            </div>
            <div class="oracle-panel-note">${factions.length} factions</div>
          </div>

          <div class="oracle-faction-list">
            ${factions.length ? factions.map(renderFactionPulseCard).join("") : renderPulseEmpty()}
          </div>
        </section>
      </div>
    `;
  }

  function summaryCard(label, value, tone) {
    return `
      <div class="oracle-summary-card ${safeClass(tone || "neutral")}">
        <div class="oracle-summary-value">${escapeHtml(String(value))}</div>
        <div class="oracle-summary-label">${escapeHtml(label)}</div>
      </div>
    `;
  }

  function renderPulseEmpty() {
    return `
      <div class="oracle-empty compact">
        <div class="oracle-empty-title">No faction pulse yet</div>
        <div class="oracle-empty-text">Once patrols, captures, HQ upgrades and sieges start firing, this board will light up.</div>
      </div>
    `;
  }

  function renderFactionPulseCard(row) {
    const faction = row?.faction || "";
    const fm = factionMeta(faction);
    const lastEcho = row?.lastEcho || "";
    const members = intOr(row?.members, 0);
    const controlled = intOr(row?.controlledNodes, 0);
    const hot = intOr(row?.hotZones, 0);
    const sieges = intOr(row?.activeSieges, 0);
    const recent = intOr(row?.recentEchoes, 0);
    const mult = numOr(row?.influenceMult, 1);

    return `
      <article class="oracle-faction-card ${fm.cls}">
        <div class="oracle-faction-top">
          <div class="oracle-faction-id">
            <div class="oracle-faction-badge big ${fm.cls}">${escapeHtml(fm.code)}</div>
            <div>
              <div class="oracle-faction-name">${escapeHtml(row?.label || fm.label)}</div>
              <div class="oracle-faction-sub">${members} members</div>
            </div>
          </div>
          <div class="oracle-faction-mult">x${mult.toFixed(2)}</div>
        </div>

        <div class="oracle-faction-stats">
          ${miniStat("Control", controlled)}
          ${miniStat("Hot", hot)}
          ${miniStat("Sieges", sieges)}
          ${miniStat("Echoes", recent)}
        </div>

        <div class="oracle-faction-last">
          ${lastEcho ? escapeHtml(lastEcho) : "No fresh broadcast."}
        </div>
      </article>
    `;
  }

  function miniStat(label, value) {
    return `
      <div class="oracle-mini-stat">
        <div class="oracle-mini-value">${escapeHtml(String(value))}</div>
        <div class="oracle-mini-label">${escapeHtml(label)}</div>
      </div>
    `;
  }

  function renderHallTab(hall, meta) {
    const topLevels = Array.isArray(hall?.topLevels) ? hall.topLevels : [];
    const fortress = hall?.fortressStandout || {};
    const actor = hall?.worldActor || {};

    return `
      <div class="oracle-grid hall">
        <section class="oracle-panel">
          <div class="oracle-panel-head">
            <div>
              <div class="oracle-panel-kicker">ASCENSION</div>
              <div class="oracle-panel-title">Top levels</div>
            </div>
            <div class="oracle-panel-note">${topLevels.length || 0} tracked</div>
          </div>

          ${topLevels.length ? `
            <div class="oracle-rank-list">
              ${topLevels.slice(0, 8).map(renderTopLevelRow).join("")}
            </div>
          ` : `
            <div class="oracle-empty compact">
              <div class="oracle-empty-title">No ascendants yet</div>
              <div class="oracle-empty-text">Level leaders will surface here once activity accumulates.</div>
            </div>
          `}
        </section>

        <section class="oracle-panel">
          <div class="oracle-panel-head">
            <div>
              <div class="oracle-panel-kicker">FORTRESS STANDOUT</div>
              <div class="oracle-panel-title">Moon Lab signal</div>
            </div>
          </div>

          ${renderFortressStandout(fortress)}
        </section>

        <section class="oracle-panel">
          <div class="oracle-panel-head">
            <div>
              <div class="oracle-panel-kicker">WORLD ACTOR</div>
              <div class="oracle-panel-title">Most visible current force</div>
            </div>
          </div>

          ${renderWorldActor(actor)}
        </section>
      </div>
    `;
  }

  function renderTopLevelRow(row, idx) {
    const faction = row?.faction || "";
    const fm = factionMeta(faction);
    const lvl = intOr(row?.level, 0);
    const xp = intOr(row?.xp, 0);

    return `
      <div class="oracle-rank-row">
        <div class="oracle-rank-left">
          <div class="oracle-rank-no">${idx + 1}</div>
          <div class="oracle-faction-badge ${fm.cls}">${escapeHtml(fm.code)}</div>
          <div>
            <div class="oracle-rank-name">${escapeHtml(row?.name || "Unknown")}</div>
            <div class="oracle-rank-sub">${escapeHtml(fm.label)}</div>
          </div>
        </div>
        <div class="oracle-rank-right">
          <div class="oracle-rank-level">Lvl ${lvl}</div>
          <div class="oracle-rank-xp">${xp} XP</div>
        </div>
      </div>
    `;
  }

  function renderFortressStandout(f) {
    const hasData = !!(f && (f.name || f.label || f.floor));
    if (!hasData) {
      return `
        <div class="oracle-empty compact">
          <div class="oracle-empty-title">No fortress standout yet</div>
          <div class="oracle-empty-text">The next serious clear will carve a mark here.</div>
        </div>
      `;
    }

    const faction = f?.faction || "";
    const fm = factionMeta(faction);

    return `
      <div class="oracle-standout-card">
        <div class="oracle-standout-top">
          <div class="oracle-faction-badge big ${fm.cls}">${escapeHtml(fm.code)}</div>
          <div>
            <div class="oracle-standout-name">${escapeHtml(f?.name || "Unknown")}</div>
            <div class="oracle-standout-sub">Floor ${intOr(f?.floor, 0)}</div>
          </div>
        </div>
        <div class="oracle-standout-text">${escapeHtml(f?.label || "Fortress signal recorded.")}</div>
        <div class="oracle-standout-age">${escapeHtml(formatAge(null, f?.ts))}</div>
      </div>
    `;
  }

  function renderWorldActor(a) {
    const hasData = !!(a && (a.headline || a.label || a.faction));
    if (!hasData) {
      return `
        <div class="oracle-empty compact">
          <div class="oracle-empty-title">No dominant actor yet</div>
          <div class="oracle-empty-text">Oracle will highlight the strongest current push once the board heats up.</div>
        </div>
      `;
    }

    const faction = a?.faction || "";
    const fm = factionMeta(faction);

    return `
      <div class="oracle-standout-card actor">
        <div class="oracle-standout-top">
          <div class="oracle-faction-badge big ${fm.cls}">${escapeHtml(a?.code || fm.code)}</div>
          <div>
            <div class="oracle-standout-name">${escapeHtml(a?.label || fm.label)}</div>
            <div class="oracle-standout-sub">Current force</div>
          </div>
        </div>
        <div class="oracle-standout-text">${escapeHtml(a?.headline || "Signal building...")}</div>
      </div>
    `;
  }

  function renderSkeleton() {
    return `
      <div class="oracle-panel">
        <div class="oracle-panel-head">
          <div>
            <div class="oracle-panel-kicker">SYNCING</div>
            <div class="oracle-panel-title">Reading the Void...</div>
          </div>
        </div>

        <div class="oracle-skeleton-list">
          <div class="oracle-skeleton-card"></div>
          <div class="oracle-skeleton-card"></div>
          <div class="oracle-skeleton-card"></div>
        </div>
      </div>
    `;
  }

  function prettifyType(type) {
    return String(type || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function escapeHtml(v) {
    return String(v == null ? "" : v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function safeClass(v) {
    return String(v || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  }

  function intOr(v, d = 0) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : d;
  }

  function numOr(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function factionMeta(faction) {
    return FACTIONS[faction] || {
      code: faction ? String(faction).slice(0, 2).toUpperCase() : "—",
      label: faction || "Unbound",
      cls: "none",
    };
  }
  function factionLogoUrl(faction) {
  const key = String(faction || "").toLowerCase().trim();
  if (!key) return "";
  return `/images/ui/factions/icon_${key}.png`;
}

function renderFactionBadge(faction, { big = false, code = "" } = {}) {
  const fm = factionMeta(faction);
  const logo = factionLogoUrl(faction);
  const safeCode = escapeHtml(code || fm.code || "—");
  const safeLabel = escapeHtml(fm.label || faction || "Faction");

  return `
    <div class="oracle-faction-badge ${fm.cls} ${big ? "big" : ""}">
      ${
        logo
          ? `<img
               src="${logo}"
               alt="${safeLabel}"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
             >`
          : ""
      }
      <span class="oracle-faction-code-fallback" ${logo ? `style="display:none"` : ""}>
        ${safeCode}
      </span>
    </div>
  `;
}

  function formatAge(ageSec, ts) {
    let sec = Number(ageSec);
    if (!Number.isFinite(sec) && Number.isFinite(Number(ts))) {
      sec = Math.max(0, Math.floor(Date.now() / 1000) - Number(ts));
    }
    if (!Number.isFinite(sec)) return "now";
    if (sec < 10) return "just now";
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  }

  function injectCss() {
    if (document.getElementById("oracle-css")) return;

    const s = document.createElement("style");
    s.id = "oracle-css";
    s.textContent = `
      html.ah-oracle-open,
      body.ah-oracle-open{
        overflow:hidden !important;
      }

      .oracle-back{
        position:fixed;
        inset:0;
        z-index:999999;
        background:
          radial-gradient(circle at 20% 15%, rgba(116,76,255,.18), transparent 34%),
          radial-gradient(circle at 80% 85%, rgba(255,64,166,.12), transparent 30%),
          rgba(6,8,16,.78);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        opacity:0;
        transition:opacity .18s ease;
      }
      .oracle-back.show{ opacity:1; }

      .oracle-modal{
        position:absolute;
        left:50%;
        top:50%;
        transform:translate(-50%, -48%);
        width:min(94vw, 760px);
        max-height:min(88vh, 900px);
        border-radius:28px;
        overflow:hidden;
        background:
          linear-gradient(180deg, rgba(18,22,42,.98), rgba(8,10,20,.985));
        border:1px solid rgba(159,173,255,.16);
        box-shadow:
          0 20px 80px rgba(0,0,0,.45),
          inset 0 1px 0 rgba(255,255,255,.05);
        opacity:0;
        transition:transform .2s ease, opacity .2s ease;
      }
      .oracle-modal.show{
        transform:translate(-50%, -50%);
        opacity:1;
      }

      .oracle-ambient{
        position:absolute;
        inset:auto;
        border-radius:999px;
        filter:blur(22px);
        pointer-events:none;
      }
      .oracle-ambient-a{
        width:220px;height:220px;
        top:-70px;right:-50px;
        background:rgba(110,86,255,.22);
      }
      .oracle-ambient-b{
        width:180px;height:180px;
        left:-40px;bottom:-30px;
        background:rgba(255,64,166,.14);
      }

      .oracle-topbar{
        position:relative;
        display:flex;
        justify-content:space-between;
        gap:14px;
        padding:18px 18px 12px;
        border-bottom:1px solid rgba(255,255,255,.06);
        background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
      }

      .oracle-head{ min-width:0; }
      .oracle-kicker{
        font-size:10px;
        letter-spacing:.22em;
        text-transform:uppercase;
        color:#9fa9cf;
        opacity:.9;
        margin-bottom:6px;
      }
      .oracle-title-row{
        display:flex;
        align-items:center;
        gap:12px;
        flex-wrap:wrap;
      }
      .oracle-title{
        font-size:28px;
        line-height:1.05;
        font-weight:900;
        color:#f3f6ff;
      }
      .oracle-live{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:6px 10px;
        border-radius:999px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.06);
        color:#cbd5ff;
        font-size:12px;
      }
      .oracle-live-dot{
        width:8px;height:8px;border-radius:999px;
        background:#8ea4ff;
        box-shadow:0 0 0 0 rgba(142,164,255,.5);
        transition:all .18s ease;
      }
      .oracle-live-dot.busy{
        background:#ffc86b;
        box-shadow:0 0 0 8px rgba(255,200,107,0);
        animation:oraclePulse 1.2s infinite;
      }
      .oracle-live-dot.ok{
        background:#68ffad;
        box-shadow:0 0 12px rgba(104,255,173,.55);
      }
      @keyframes oraclePulse{
        0%{ box-shadow:0 0 0 0 rgba(255,200,107,.35); }
        70%{ box-shadow:0 0 0 10px rgba(255,200,107,0); }
        100%{ box-shadow:0 0 0 0 rgba(255,200,107,0); }
      }

      .oracle-subtitle{
        margin-top:7px;
        color:#a8b2d9;
        font-size:13px;
      }

      .oracle-actions{
        display:flex;
        align-items:flex-start;
        gap:10px;
      }
      .oracle-btn{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.05);
        color:#eef2ff;
        border-radius:14px;
        padding:10px 14px;
        font-weight:800;
        cursor:pointer;
      }
      .oracle-btn:disabled{
        opacity:.65;
        cursor:default;
      }
      .oracle-btn.ghost:hover{ background:rgba(255,255,255,.08); }
      .oracle-btn.close{
        width:42px;height:42px;
        padding:0;
        font-size:18px;
      }

      .oracle-meta-strip{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        padding:12px 18px 4px;
      }

      .oracle-chip{
        display:inline-flex;
        align-items:center;
        gap:8px;
        height:34px;
        padding:0 12px;
        border-radius:999px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.06);
        color:#dce4ff;
        font-size:12px;
        font-weight:800;
      }
      .oracle-chip.muted{ color:#99a5d6; }
      .oracle-chip.warn{
        background:rgba(255,188,77,.1);
        border-color:rgba(255,188,77,.18);
        color:#ffd89a;
      }
      .oracle-chip.danger{
        background:rgba(255,102,102,.1);
        border-color:rgba(255,102,102,.18);
        color:#ffb3b3;
      }
      .oracle-chip.faction .code{
        width:20px;height:20px;
        display:grid;place-items:center;
        border-radius:999px;
        font-size:10px;
        font-weight:900;
        background:rgba(255,255,255,.1);
      }

      .oracle-tabs{
        display:flex;
        gap:8px;
        padding:12px 18px 14px;
        border-bottom:1px solid rgba(255,255,255,.06);
        overflow-x:auto;
        scrollbar-width:none;
      }
      .oracle-tabs::-webkit-scrollbar{ display:none; }

      .oracle-tab{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#bfc9f0;
        border-radius:14px;
        padding:11px 14px;
        font-weight:900;
        white-space:nowrap;
        cursor:pointer;
      }
      .oracle-tab.is-active{
        color:#fff;
        background:
          linear-gradient(180deg, rgba(121,97,255,.26), rgba(70,45,188,.22));
        border-color:rgba(146,125,255,.34);
        box-shadow:0 6px 18px rgba(88,63,210,.22);
      }

      .oracle-body{
        position:relative;
        padding:16px 18px 18px;
        overflow:auto;
        max-height:calc(min(88vh, 900px) - 170px);
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch;
      }

      .oracle-root{
        display:block;
      }

      .oracle-grid{
        display:grid;
        gap:14px;
      }
      .oracle-grid.hall{
        grid-template-columns:1fr;
      }

      .oracle-panel{
        position:relative;
        background:
          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
        border:1px solid rgba(255,255,255,.06);
        border-radius:22px;
        padding:14px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.03);
      }

      .oracle-panel-head{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
        margin-bottom:12px;
      }
      .oracle-panel-kicker{
        font-size:10px;
        letter-spacing:.18em;
        text-transform:uppercase;
        color:#8e9ad1;
        margin-bottom:5px;
      }
      .oracle-panel-title{
        font-size:18px;
        font-weight:900;
        color:#f5f7ff;
      }
      .oracle-panel-note{
        color:#95a2d8;
        font-size:12px;
        font-weight:800;
        padding-top:4px;
      }

      .oracle-echo-list{
        display:grid;
        gap:10px;
      }

      .oracle-echo-card{
        display:grid;
        grid-template-columns:48px 1fr;
        gap:12px;
        border-radius:18px;
        padding:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.05);
      }
      .oracle-echo-side{
        display:flex;
        justify-content:center;
        align-items:flex-start;
      }

      .oracle-faction-badge{
        width:30px;height:30px;
        display:grid;place-items:center;
        border-radius:999px;
        font-size:11px;
        font-weight:900;
        color:#fff;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.08);
      }
      .oracle-faction-badge.big{
        width:42px;height:42px;
        font-size:13px;
      }

      .oracle-faction-badge.rb, .oracle-chip.faction.rb{ background:rgba(108,74,255,.16); border-color:rgba(108,74,255,.28); color:#d7cbff; }
      .oracle-faction-badge.ew, .oracle-chip.faction.ew{ background:rgba(66,208,255,.14); border-color:rgba(66,208,255,.24); color:#c7f4ff; }
      .oracle-faction-badge.pb, .oracle-chip.faction.pb{ background:rgba(255,112,81,.16); border-color:rgba(255,112,81,.24); color:#ffd3c9; }
      .oracle-faction-badge.ih, .oracle-chip.faction.ih{ background:rgba(255,198,82,.16); border-color:rgba(255,198,82,.24); color:#ffe8b5; }
      .oracle-faction-badge.none, .oracle-chip.faction.none{ background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.08); color:#dbe4ff; }

      .oracle-echo-top{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:center;
      }
      .oracle-echo-type{
        font-size:12px;
        font-weight:900;
        color:#b9c6ff;
        text-transform:uppercase;
        letter-spacing:.08em;
      }
      .oracle-echo-age{
        font-size:12px;
        color:#8f9ccc;
      }
      .oracle-echo-text{
        margin-top:6px;
        color:#f0f3ff;
        font-weight:800;
        line-height:1.45;
      }
      .oracle-echo-meta{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:10px;
      }

      .oracle-tag{
        display:inline-flex;
        align-items:center;
        gap:6px;
        height:26px;
        padding:0 10px;
        border-radius:999px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.06);
        color:#d4dcff;
        font-size:11px;
        font-weight:800;
      }
      .oracle-tag.rarity.legendary{
        border-color:rgba(255,196,92,.26);
        color:#ffe3a7;
      }
      .oracle-tag.rarity.epic{
        border-color:rgba(206,136,255,.24);
        color:#eed3ff;
      }
      .oracle-tag.rarity.rare{
        border-color:rgba(92,170,255,.24);
        color:#d3e8ff;
      }
      .oracle-inline-note{
        display:inline-flex;
        align-items:center;
        padding:0 2px;
        font-size:11px;
        color:#9fb0ea;
        font-weight:700;
      }

      .oracle-summary-grid{
        display:grid;
        grid-template-columns:repeat(3, 1fr);
        gap:10px;
      }
      .oracle-summary-card{
        border-radius:18px;
        padding:14px 12px;
        border:1px solid rgba(255,255,255,.06);
        background:rgba(255,255,255,.04);
        text-align:center;
      }
      .oracle-summary-card.warn{
        background:rgba(255,188,77,.08);
        border-color:rgba(255,188,77,.14);
      }
      .oracle-summary-card.danger{
        background:rgba(255,102,102,.08);
        border-color:rgba(255,102,102,.14);
      }
      .oracle-summary-value{
        font-size:24px;
        font-weight:900;
        color:#fff;
      }
      .oracle-summary-label{
        margin-top:4px;
        color:#9aa7d9;
        font-size:12px;
        font-weight:800;
      }

      .oracle-faction-list{
        display:grid;
        gap:10px;
      }
      .oracle-faction-card{
        border-radius:18px;
        padding:14px;
        border:1px solid rgba(255,255,255,.06);
        background:rgba(255,255,255,.035);
      }
      .oracle-faction-card.rb{ box-shadow:inset 0 0 0 1px rgba(108,74,255,.10); }
      .oracle-faction-card.ew{ box-shadow:inset 0 0 0 1px rgba(66,208,255,.09); }
      .oracle-faction-card.pb{ box-shadow:inset 0 0 0 1px rgba(255,112,81,.09); }
      .oracle-faction-card.ih{ box-shadow:inset 0 0 0 1px rgba(255,198,82,.09); }

      .oracle-faction-top{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
      }
      .oracle-faction-id{
        display:flex;
        gap:10px;
        align-items:center;
      }
      .oracle-faction-name{
        font-size:16px;
        font-weight:900;
        color:#f5f7ff;
      }
      .oracle-faction-sub{
        margin-top:2px;
        color:#95a2d8;
        font-size:12px;
      }
      .oracle-faction-mult{
        min-width:56px;
        height:34px;
        display:grid;place-items:center;
        border-radius:12px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.06);
        color:#d9e1ff;
        font-weight:900;
      }
      .oracle-faction-stats{
        margin-top:12px;
        display:grid;
        grid-template-columns:repeat(4, 1fr);
        gap:8px;
      }
      .oracle-mini-stat{
        border-radius:14px;
        padding:10px 8px;
        text-align:center;
        background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.05);
      }
      .oracle-mini-value{
        font-size:16px;
        font-weight:900;
        color:#fff;
      }
      .oracle-mini-label{
        margin-top:4px;
        font-size:11px;
        color:#96a4d8;
      }
      .oracle-faction-last{
        margin-top:12px;
        font-size:13px;
        line-height:1.45;
        color:#cfd8ff;
      }

      .oracle-rank-list{
        display:grid;
        gap:10px;
      }
      .oracle-rank-row{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:center;
        border-radius:18px;
        padding:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.05);
      }
      .oracle-rank-left{
        display:flex;
        align-items:center;
        gap:10px;
        min-width:0;
      }
      .oracle-rank-no{
        width:26px;height:26px;
        display:grid;place-items:center;
        border-radius:999px;
        background:rgba(255,255,255,.07);
        color:#f6f8ff;
        font-size:12px;
        font-weight:900;
        flex:0 0 auto;
      }
      .oracle-rank-name{
        font-size:14px;
        font-weight:900;
        color:#fff;
      }
      .oracle-rank-sub{
        margin-top:2px;
        font-size:11px;
        color:#96a4d8;
      }
      .oracle-rank-right{
        text-align:right;
        flex:0 0 auto;
      }
      .oracle-rank-level{
        font-size:14px;
        font-weight:900;
        color:#fff;
      }
      .oracle-rank-xp{
        margin-top:2px;
        font-size:11px;
        color:#96a4d8;
      }

      .oracle-standout-card{
        border-radius:20px;
        padding:14px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.03));
        border:1px solid rgba(255,255,255,.06);
      }
      .oracle-standout-top{
        display:flex;
        gap:12px;
        align-items:center;
      }
      .oracle-standout-name{
        font-size:17px;
        font-weight:900;
        color:#fff;
      }
      .oracle-standout-sub{
        margin-top:2px;
        font-size:12px;
        color:#96a4d8;
      }
      .oracle-standout-text{
        margin-top:12px;
        color:#d7dfff;
        line-height:1.5;
        font-weight:700;
      }
      .oracle-standout-age{
        margin-top:10px;
        color:#93a0d1;
        font-size:12px;
      }

      .oracle-empty{
        display:grid;
        place-items:center;
        text-align:center;
        min-height:280px;
        padding:26px 14px;
        border-radius:22px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));
        border:1px dashed rgba(255,255,255,.10);
      }
      .oracle-empty.compact{
        min-height:170px;
      }
      .oracle-empty.danger{
        border-color:rgba(255,102,102,.18);
        background:rgba(255,102,102,.04);
      }
      .oracle-empty-icon{
        width:54px;height:54px;
        display:grid;place-items:center;
        border-radius:999px;
        background:rgba(255,255,255,.06);
        color:#eef2ff;
        font-size:22px;
        font-weight:900;
      }
      .oracle-empty-title{
        margin-top:12px;
        font-size:18px;
        font-weight:900;
        color:#f5f7ff;
      }
      .oracle-empty-text{
        margin-top:8px;
        max-width:420px;
        color:#9eabd9;
        line-height:1.5;
        font-size:13px;
      }

      .oracle-skeleton-list{
        display:grid;
        gap:10px;
      }
      .oracle-skeleton-card{
        height:88px;
        border-radius:18px;
        background:
          linear-gradient(90deg,
            rgba(255,255,255,.04) 0%,
            rgba(255,255,255,.07) 25%,
            rgba(255,255,255,.04) 50%);
        background-size:200% 100%;
        animation:oracleShimmer 1.2s linear infinite;
      }
      @keyframes oracleShimmer{
        0%{ background-position:200% 0; }
        100%{ background-position:-200% 0; }
      }

      .oracle-toast{
        position:fixed;
        left:50%;
        bottom:max(18px, env(safe-area-inset-bottom));
        transform:translateX(-50%) translateY(8px);
        z-index:1000001;
        padding:10px 14px;
        border-radius:14px;
        color:#f7f9ff;
        font-size:13px;
        font-weight:900;
        background:rgba(12,16,28,.96);
        border:1px solid rgba(255,255,255,.08);
        opacity:0;
        transition:all .18s ease;
        box-shadow:0 12px 34px rgba(0,0,0,.35);
      }
      .oracle-toast.show{
        opacity:1;
        transform:translateX(-50%) translateY(0);
      }

      @media (max-width: 720px){
        .oracle-modal{
          width:100vw;
          height:100dvh;
          max-height:100dvh;
          border-radius:0;
          top:50%;
        }
        .oracle-body{
          max-height:calc(100dvh - 178px);
          padding-bottom:calc(18px + env(safe-area-inset-bottom));
        }
        .oracle-summary-grid{
          grid-template-columns:1fr 1fr 1fr;
        }
        .oracle-faction-stats{
          grid-template-columns:1fr 1fr;
        }
      }

      @media (max-width: 560px){
        .oracle-topbar{
          padding:16px 14px 12px;
        }
        .oracle-title{
          font-size:24px;
        }
        .oracle-meta-strip,
        .oracle-tabs{
          padding-left:14px;
          padding-right:14px;
        }
        .oracle-body{
          padding:14px;
        }
        .oracle-summary-grid{
          grid-template-columns:1fr;
        }
        .oracle-rank-row{
          align-items:flex-start;
        }
      }
    `;
    document.head.appendChild(s);
  }
})();
