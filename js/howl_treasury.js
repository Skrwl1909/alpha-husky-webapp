(function () {
  const HowlTreasury = {};

  const CSS_ID = "howlTreasuryCss";
  const ROOT_ID = "howlTreasuryBack";
  const WALLET = "CNowyAyXYPYeMLHQxLfcWMVowF52f9HmABueSQnmGX6R";
  const HOWL_TREASURY_EMBLEM_URL =
    "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778922822/howl_treasury/howl_treasury_emblem.webp";
  const HOWL_TREASURY_CARD_URL =
    "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778922822/howl_treasury/howl_treasury_card.webp";
  const HOWL_TREASURY_BANNER_URL =
    "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778922822/howl_treasury/howl_treasury_banner.webp";

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _inited = false;
  let _mounted = false;
  let _isOpen = false;
  let _state = null;

  const els = {
    back: null,
    modal: null,
    root: null,
    closeBtn: null,
  };

  function dbg() {
    if (!_dbg) return;
    try {
      console.log("[HowlTreasury]", ...arguments);
    } catch (_) {}
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function init(opts) {
    const cfg = opts && typeof opts === "object" ? opts : {};
    _apiPost = cfg.apiPost || _apiPost || window.apiPost || window.S?.apiPost || null;
    _tg = cfg.tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!cfg.dbg;

    injectCss();
    ensureDom();
    bindEvents();

    _inited = true;
    dbg("init ok");
  }

  function open() {
    if (!_inited) init({});
    ensureDom();

    document.documentElement.classList.add("ah-modal-open", "ah-howl-treasury-open");
    document.body.classList.add("ah-modal-open", "ah-howl-treasury-open");

    els.back.style.display = "block";
    requestAnimationFrame(() => {
      els.back.classList.add("show");
      els.modal.classList.add("show");
    });

    lockScroll(true);
    _isOpen = true;

    try {
      window.navRegister?.("howlTreasuryBack", {
        close,
        isOpen: () => !!_isOpen && !!els.back && els.back.style.display !== "none",
      });
      window.navOpen?.("howlTreasuryBack");
    } catch (_) {}

    return refresh({ silent: true });
  }

  function close() {
    if (!els.back) return;

    _isOpen = false;
    els.back.classList.remove("show");
    els.modal.classList.remove("show");

    setTimeout(() => {
      if (_isOpen || !els.back) return;
      els.back.style.display = "none";
    }, 180);

    lockScroll(false);
    document.documentElement.classList.remove("ah-modal-open", "ah-howl-treasury-open");
    document.body.classList.remove("ah-modal-open", "ah-howl-treasury-open");

    try { window.navClose?.("howlTreasuryBack"); } catch (_) {}
  }

  async function refresh(opts) {
    const cfg = opts && typeof opts === "object" ? opts : {};
    _state = await loadState();
    render(_state);
    if (!cfg.silent) toast("HOWL Treasury synced.");
    return _state;
  }

  function buildStaticState() {
    return {
      enabled: true,
      wallet: WALLET,
      headline: "The Pack keeps Alpha online.",
      subtitle: "Official public treasury & support vault.",
      recentSignals: [],
      topSupporters: [],
      userSignal: {
        totalSupportedRaw: 0,
        totalSupportedDisplay: "0 $HOWL",
        supportCount: 0,
        tier: "none",
        tierLabel: "No signal yet",
        publicSupport: true,
      },
      milestones: [
        {
          id: "signal_feed",
          label: "Treasury feed",
          copy: "Recent verified support marks will surface here first.",
          progress: 0.22,
        },
        {
          id: "mailbox_marks",
          label: "Mailbox marks",
          copy: "Future thank-you drops and recognition notes will connect here.",
          progress: 0.36,
        },
        {
          id: "world_memory",
          label: "World memory",
          copy: "Verified support signals will leave a mark in the world.",
          progress: 0.14,
        },
      ],
      visualCardsEnabled: false,
      paymentsEnabled: false,
      bannerUrl: HOWL_TREASURY_BANNER_URL,
      emblemUrl: HOWL_TREASURY_EMBLEM_URL,
      cardUrl: HOWL_TREASURY_CARD_URL,
    };
  }

  function getApiPost() {
    const fn = _apiPost || window.apiPost || window.S?.apiPost || null;
    return typeof fn === "function" ? fn : null;
  }

  async function loadState() {
    const fallback = buildStaticState();
    const apiPost = getApiPost();
    if (!apiPost) return fallback;

    try {
      const out = await apiPost("/webapp/treasury/state", {});
      if (!out || out.ok === false) {
        throw new Error(String(out && (out.reason || out.error || out.message) || "TREASURY_STATE_FAILED"));
      }
      return normalizeState(out, fallback);
    } catch (err) {
      dbg("loadState fallback", err && err.message ? err.message : err);
      return fallback;
    }
  }

  function normalizeState(raw, fallback) {
    const base = fallback && typeof fallback === "object" ? fallback : buildStaticState();
    const src = raw && typeof raw === "object" ? raw : {};
    return {
      enabled: !!src.enabled,
      wallet: String(src.wallet || base.wallet || WALLET).trim() || WALLET,
      headline: String(src.headline || base.headline || "The Pack keeps Alpha online.").trim() || "The Pack keeps Alpha online.",
      subtitle: String(src.subtitle || base.subtitle || "Official public treasury & support vault.").trim() || "Official public treasury & support vault.",
      paymentsEnabled: !!src.paymentsEnabled,
      visualCardsEnabled: !!src.visualCardsEnabled,
      recentSignals: normalizeRecentSignals(src.recentSignals),
      topSupporters: normalizeTopSupporters(src.topSupporters),
      userSignal: normalizeUserSignal(src.userSignal, base.userSignal),
      milestones: normalizeMilestones(src.milestones, base.milestones),
      bannerUrl: String(src.bannerUrl || base.bannerUrl || HOWL_TREASURY_BANNER_URL).trim() || HOWL_TREASURY_BANNER_URL,
      emblemUrl: String(src.emblemUrl || base.emblemUrl || HOWL_TREASURY_EMBLEM_URL).trim() || HOWL_TREASURY_EMBLEM_URL,
      cardUrl: String(src.cardUrl || base.cardUrl || HOWL_TREASURY_CARD_URL).trim() || HOWL_TREASURY_CARD_URL,
    };
  }

  function normalizeRecentSignals(items) {
    const list = Array.isArray(items) ? items : [];
    return list.map((item) => {
      const row = item && typeof item === "object" ? item : {};
      return {
        title: String(row.title || row.label || "Signal").trim() || "Signal",
        copy: String(row.copy || row.desc || row.text || "").trim(),
        badge: String(row.badge || "").trim(),
      };
    }).filter((row) => row.title || row.copy);
  }

  function normalizeTopSupporters(items) {
    const list = Array.isArray(items) ? items : [];
    return list.map((item) => {
      const row = item && typeof item === "object" ? item : {};
      return {
        name: String(row.name || row.title || "Supporter").trim() || "Supporter",
        amountDisplay: String(row.amountDisplay || row.amount || "0 $HOWL").trim() || "0 $HOWL",
        tierLabel: String(row.tierLabel || row.tier || "").trim(),
      };
    }).filter((row) => row.name || row.amountDisplay);
  }

  function normalizeUserSignal(item, fallback) {
    const base = fallback && typeof fallback === "object" ? fallback : buildStaticState().userSignal;
    const src = item && typeof item === "object" ? item : {};
    return {
      totalSupportedRaw: safeInt(src.totalSupportedRaw, base.totalSupportedRaw || 0),
      totalSupportedDisplay: String(src.totalSupportedDisplay || base.totalSupportedDisplay || "0 $HOWL").trim() || "0 $HOWL",
      supportCount: safeInt(src.supportCount, base.supportCount || 0),
      tier: String(src.tier || base.tier || "none").trim().toLowerCase() || "none",
      tierLabel: String(src.tierLabel || base.tierLabel || "No signal yet").trim() || "No signal yet",
      publicSupport: src.publicSupport == null ? !!base.publicSupport : !!src.publicSupport,
    };
  }

  function normalizeMilestones(items, fallback) {
    const list = Array.isArray(items) && items.length ? items : (Array.isArray(fallback) ? fallback : []);
    return list.map((item, idx) => {
      const row = item && typeof item === "object" ? item : {};
      const progress = Math.max(0, Math.min(1, Number(row.progress || 0) || 0));
      return {
        id: String(row.id || ("milestone_" + idx)).trim() || ("milestone_" + idx),
        label: String(row.label || row.title || "Milestone").trim() || "Milestone",
        copy: String(row.copy || row.desc || "").trim(),
        progress,
      };
    });
  }

  function safeInt(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return Number(fallback || 0) || 0;
    return Math.max(0, Math.round(n));
  }

  function render(state) {
    const s = state && typeof state === "object" ? state : buildStaticState();
    ensureDom();

    els.root.innerHTML = `
      <section class="ht-shell">
        <header class="ht-topbar">
          <div class="ht-title-wrap">
            <div class="ht-emblem-wrap">
              <img class="ht-emblem" src="${esc(s.emblemUrl)}" alt="HOWL Treasury emblem" loading="lazy" decoding="async" />
            </div>
            <div class="ht-heading">
              <div class="ht-kicker">${esc(s.subtitle || "Official public treasury & support vault.")}</div>
              <h2>HOWL TREASURY</h2>
              <p>${esc(s.headline)}</p>
            </div>
          </div>
          <button type="button" class="ht-close" id="howlTreasuryClose" aria-label="Close Treasury">x</button>
        </header>

        <div class="ht-chip-row">
          <span class="ht-chip">PUBLIC</span>
          <span class="ht-chip">SECURE</span>
          <span class="ht-chip is-amber">ON-CHAIN</span>
        </div>

        <section class="ht-banner-panel">
          <img class="ht-banner" src="${esc(s.bannerUrl)}" alt="HOWL Treasury banner" loading="lazy" decoding="async" />
        </section>

        <section class="ht-panel">
          <div class="ht-panel-head">
            <div>
              <div class="ht-panel-kicker">Alpha Treasury</div>
              <h3>${esc(s.subtitle || "Official public treasury & support vault.")}</h3>
            </div>
            <span class="ht-mini-chip">READ ONLY</span>
          </div>
          <div class="ht-wallet-block">
            <div class="ht-wallet-label">Official wallet</div>
            <div class="ht-wallet-value">${esc(s.wallet)}</div>
          </div>
          <div class="ht-actions">
            <button type="button" class="ht-btn" data-ht-copy-wallet>Copy Wallet</button>
          </div>
        </section>

        <section class="ht-panel">
          <div class="ht-panel-head">
            <div>
              <div class="ht-panel-kicker">Support the Pack</div>
              <h3>Reinforce the Treasury</h3>
            </div>
            <span class="ht-mini-chip is-muted">PHASE 1</span>
          </div>
          <p class="ht-copy">
            Verified support signals will later leave a mark in the Treasury feed, mailbox, and Telegram CTA.
          </p>
          <button type="button" class="ht-btn is-disabled" disabled aria-disabled="true">SUPPORT TREASURY</button>
        </section>

        <section class="ht-grid">
          <div class="ht-panel">
            <div class="ht-panel-head">
              <div>
                <div class="ht-panel-kicker">Recent Signals</div>
                <h3>Treasury feed</h3>
              </div>
            </div>
            ${renderRecentSignals(s.recentSignals)}
          </div>

          <div class="ht-panel">
            <div class="ht-panel-head">
              <div>
                <div class="ht-panel-kicker">Your Signal</div>
                <h3>Personal recognition</h3>
              </div>
            </div>
            ${renderUserSignal(s.userSignal)}
          </div>
        </section>

        <section class="ht-panel">
          <div class="ht-panel-head">
            <div>
              <div class="ht-panel-kicker">Community Milestones</div>
              <h3>Read-only world markers</h3>
            </div>
          </div>
          ${renderMilestones(s.milestones)}
        </section>

        ${renderLeaderboard(s.topSupporters)}

        <section class="ht-panel">
          <div class="ht-panel-head">
            <div>
              <div class="ht-panel-kicker">Visual Recognition</div>
              <h3>Treasury Signal Received</h3>
            </div>
            <span class="ht-mini-chip is-muted">PREVIEW</span>
          </div>
          <p class="ht-copy">The Pack remembers.</p>
          ${renderVisualCard(s.cardUrl)}
        </section>

        ${renderPending()}
        ${renderSuccess()}
        ${renderLeaderboard()}

        <section class="ht-note">
          <div class="ht-note-title">Transparency note</div>
          <p>All support goes to the official Alpha Treasury wallet. This is support and recognition, not pay-to-win.</p>
        </section>
      </section>
    `;

    els.closeBtn = els.root.querySelector("#howlTreasuryClose");
  }

  function renderRecentSignals(items) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      return `<div class="ht-empty">No verified Treasury signals yet.</div>`;
    }

    return list.map((item) => `
      <article class="ht-feed-row">
        <div class="ht-feed-title">${esc(item.title || "Signal")}${item.badge ? ` <span class="ht-inline-badge">${esc(item.badge)}</span>` : ""}</div>
        <div class="ht-feed-copy">${esc(item.copy || "")}</div>
      </article>
    `).join("");
  }

  function renderUserSignal(item) {
    const signal = item && typeof item === "object" ? item : null;
    if (!signal) {
      return `<div class="ht-empty">Your Treasury signal will appear here after verified support.</div>`;
    }

    return `
      <article class="ht-signal-card">
        <div class="ht-signal-title">${esc(signal.totalSupportedDisplay || "0 $HOWL")}</div>
        <div class="ht-signal-copy">Tier: ${esc(signal.tierLabel || "No signal yet")}</div>
        <div class="ht-signal-copy">Verified supports: ${esc(String(signal.supportCount || 0))}</div>
        <div class="ht-signal-copy">${signal.publicSupport ? "Public support is enabled for this lane." : "Anonymous support will be supported in a later phase."}</div>
      </article>
    `;
  }

  function renderMilestones(items) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      return `<div class="ht-empty">Milestones will appear here as the Treasury system expands.</div>`;
    }

    return `
      <div class="ht-milestones">
        ${list.map((item) => {
          const progress = Math.max(0, Math.min(100, Math.round(Number(item.progress || 0) * 100)));
          return `
            <article class="ht-milestone">
              <div class="ht-milestone-head">
                <div class="ht-milestone-title">${esc(item.label || "Milestone")}</div>
                <div class="ht-milestone-value">${progress}%</div>
              </div>
              <p class="ht-milestone-copy">${esc(item.copy || "")}</p>
              <div class="ht-progress">
                <span class="ht-progress-fill" style="width:${progress}%;"></span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderVisualCard(cardUrl) {
    const src = String(cardUrl || "").trim();
    const preview = src
      ? `<img class="ht-card-preview" src="${esc(src)}" alt="HOWL Treasury recognition card preview" loading="lazy" decoding="async" />`
      : `<div class="ht-card-preview is-empty">Recognition card preview unavailable.</div>`;

    return `
      <div class="ht-card-shell">
        ${preview}
        <div class="ht-card-copy">
          Treasury Signal Received
          <span>The Pack remembers. Personalized visual cards and cardUrl support land in a later phase.</span>
        </div>
      </div>
    `;
  }

  function renderPending() {
    // Phase 2: pending support states will render here after payment flow exists.
    return "";
  }

  function renderSuccess() {
    // Phase 2: success state, recognition summary, and future cardUrl handling will render here.
    return "";
  }

  function renderLeaderboard(items) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      return "";
    }

    return `
      <section class="ht-panel">
        <div class="ht-panel-head">
          <div>
            <div class="ht-panel-kicker">Top Supporters</div>
            <h3>Read-only recognition board</h3>
          </div>
        </div>
        <div class="ht-leaderboard">
          ${list.map((item) => `
            <article class="ht-leader-row">
              <div class="ht-leader-copy">
                <div class="ht-leader-name">${esc(item.name || "Supporter")}</div>
                <div class="ht-leader-tier">${esc(item.tierLabel || "Supporter")}</div>
              </div>
              <div class="ht-leader-amount">${esc(item.amountDisplay || "0 $HOWL")}</div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function bindEvents() {
    if (!els.back || els.back.dataset.bound === "1") return;
    els.back.dataset.bound = "1";

    els.back.addEventListener("click", (event) => {
      if (event.target === els.back) close();
    });

    els.back.addEventListener("click", async (event) => {
      const closeBtn = event.target.closest("#howlTreasuryClose");
      if (closeBtn) {
        close();
        return;
      }

      const copyBtn = event.target.closest("[data-ht-copy-wallet]");
      if (!copyBtn) return;

      event.preventDefault();
      const ok = await copyText((_state && _state.wallet) || WALLET);
      toast(ok ? "Treasury wallet copied." : "Wallet copy failed.");
    });
  }

  async function copyText(text) {
    const value = String(text || "");
    if (!value) return false;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) {}

    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      ta.style.pointerEvents = "none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return !!ok;
    } catch (_) {
      return false;
    }
  }

  function toast(message) {
    const text = String(message || "").trim();
    if (!text) return;

    if (typeof window.toast === "function") {
      window.toast(text);
      return;
    }

    if (typeof window.showToast === "function") {
      window.showToast(text);
      return;
    }

    const t = document.createElement("div");
    t.className = "ht-toast";
    t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 180);
    }, 2200);
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
    document.body.style.touchAction = lock ? "none" : "";
  }

  function ensureDom() {
    if (_mounted && els.back && document.body.contains(els.back)) return;

    const back = document.createElement("div");
    back.id = ROOT_ID;
    back.className = "ht-back";
    back.style.display = "none";
    back.innerHTML = `
      <div class="ht-modal" id="howlTreasuryModal" role="dialog" aria-modal="true" aria-label="HOWL Treasury">
        <div class="ht-root" id="howlTreasuryRoot"></div>
      </div>
    `;

    document.body.appendChild(back);

    els.back = back;
    els.modal = back.querySelector("#howlTreasuryModal");
    els.root = back.querySelector("#howlTreasuryRoot");
    els.closeBtn = null;
    _mounted = true;
  }

  function injectCss() {
    if (document.getElementById(CSS_ID)) return;

    const style = document.createElement("style");
    style.id = CSS_ID;
    style.textContent = `
      .ht-back{
        position:fixed;
        inset:0;
        z-index:1200;
        background:rgba(3,8,12,.54);
        backdrop-filter:blur(10px);
        opacity:0;
        transition:opacity .18s ease;
      }
      .ht-back.show{ opacity:1; }
      .ht-modal{
        position:absolute;
        left:0;
        right:0;
        bottom:0;
        margin:0 auto;
        width:min(100%, 560px);
        max-height:min(calc(var(--vh, 1vh) * 100), 100dvh);
        padding:
          max(12px, env(safe-area-inset-top, 0px))
          12px
          calc(12px + max(var(--ah-inset-bottom, 0px), env(safe-area-inset-bottom, 0px)))
          12px;
        transform:translateY(18px);
        opacity:0;
        transition:transform .18s ease, opacity .18s ease;
      }
      .ht-modal.show{
        transform:translateY(0);
        opacity:1;
      }
      .ht-root{
        border-radius:26px 26px 22px 22px;
        overflow:hidden;
        border:1px solid rgba(120,226,255,.18);
        background:
          radial-gradient(circle at top right, rgba(61,214,255,.12), transparent 36%),
          radial-gradient(circle at top left, rgba(255,176,74,.10), transparent 28%),
          linear-gradient(180deg, rgba(7,13,19,.98), rgba(7,11,16,.96));
        box-shadow:
          0 24px 64px rgba(0,0,0,.48),
          inset 0 1px 0 rgba(255,255,255,.05);
      }
      .ht-shell{
        display:flex;
        flex-direction:column;
        gap:12px;
        max-height:calc(min(calc(var(--vh, 1vh) * 100), 100dvh) - 24px - max(var(--ah-inset-bottom, 0px), env(safe-area-inset-bottom, 0px)));
        overflow:auto;
        padding:16px;
        color:#edf7ff;
      }
      .ht-topbar{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
      }
      .ht-title-wrap{
        display:flex;
        align-items:center;
        gap:12px;
        min-width:0;
      }
      .ht-emblem-wrap{
        flex:0 0 auto;
        width:52px;
        height:52px;
        border-radius:16px;
        display:grid;
        place-items:center;
        background:linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.03));
        border:1px solid rgba(122,230,255,.18);
        box-shadow:0 0 0 1px rgba(122,230,255,.06), 0 10px 24px rgba(0,0,0,.22);
      }
      .ht-emblem{
        width:34px;
        height:34px;
        object-fit:contain;
      }
      .ht-heading{
        min-width:0;
      }
      .ht-kicker,
      .ht-panel-kicker,
      .ht-note-title{
        font-size:10px;
        line-height:1.15;
        font-weight:800;
        letter-spacing:.14em;
        text-transform:uppercase;
        color:rgba(179,228,240,.72);
      }
      .ht-heading h2{
        margin:4px 0 0;
        font-size:26px;
        line-height:1.05;
        letter-spacing:.04em;
      }
      .ht-heading p{
        margin:6px 0 0;
        color:#cde4ee;
        font-size:13px;
        line-height:1.45;
      }
      .ht-close{
        flex:0 0 auto;
        width:40px;
        height:40px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.04);
        color:#f2f8ff;
        font-size:18px;
        font-weight:700;
      }
      .ht-chip-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }
      .ht-chip,
      .ht-mini-chip{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:24px;
        padding:4px 10px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.04);
        color:#dff5ff;
        font-size:10px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
        white-space:nowrap;
      }
      .ht-chip.is-amber,
      .ht-mini-chip.is-amber{
        color:#ffe4b5;
        border-color:rgba(255,176,74,.28);
        background:rgba(255,176,74,.10);
      }
      .ht-mini-chip.is-muted{
        color:rgba(220,231,242,.72);
      }
      .ht-banner-panel,
      .ht-panel,
      .ht-note{
        border-radius:20px;
        border:1px solid rgba(255,255,255,.09);
        background:linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.028));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      }
      .ht-banner-panel{
        overflow:hidden;
        padding:0;
      }
      .ht-banner{
        display:block;
        width:100%;
        aspect-ratio:16/7;
        object-fit:cover;
      }
      .ht-panel{
        padding:14px;
      }
      .ht-panel-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
      }
      .ht-panel h3{
        margin:4px 0 0;
        font-size:16px;
        line-height:1.2;
      }
      .ht-copy{
        margin:10px 0 0;
        color:#d4e3ea;
        font-size:13px;
        line-height:1.5;
      }
      .ht-wallet-block{
        margin-top:12px;
        padding:12px;
        border-radius:16px;
        background:
          linear-gradient(180deg, rgba(76,226,255,.08), rgba(255,255,255,.02)),
          rgba(6,10,15,.58);
        border:1px solid rgba(76,226,255,.14);
      }
      .ht-wallet-label{
        font-size:11px;
        font-weight:700;
        color:rgba(194,224,236,.72);
        text-transform:uppercase;
        letter-spacing:.08em;
      }
      .ht-wallet-value{
        margin-top:8px;
        font-family:ui-monospace, SFMono-Regular, Consolas, monospace;
        font-size:13px;
        line-height:1.45;
        color:#f6fbff;
        word-break:break-all;
      }
      .ht-actions{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:12px;
      }
      .ht-btn{
        min-height:42px;
        padding:0 14px;
        border-radius:14px;
        border:1px solid rgba(76,226,255,.24);
        background:linear-gradient(180deg, rgba(26,203,190,.22), rgba(10,112,126,.18));
        color:#effcff;
        font-size:12px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
        box-shadow:0 12px 24px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.05);
      }
      .ht-btn.is-disabled{
        border-color:rgba(255,255,255,.10);
        background:rgba(255,255,255,.04);
        color:rgba(217,228,236,.54);
        box-shadow:none;
      }
      .ht-grid{
        display:grid;
        gap:12px;
      }
      .ht-empty{
        margin-top:10px;
        padding:14px;
        border-radius:16px;
        border:1px dashed rgba(122,230,255,.20);
        background:rgba(8,15,20,.42);
        color:#cfe0e8;
        font-size:13px;
        line-height:1.5;
      }
      .ht-feed-row,
      .ht-signal-card,
      .ht-leader-row{
        margin-top:10px;
        padding:12px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(7,12,18,.44);
      }
      .ht-feed-title,
      .ht-signal-title,
      .ht-leader-name{
        font-size:14px;
        font-weight:800;
        color:#eef7ff;
      }
      .ht-feed-copy,
      .ht-signal-copy,
      .ht-leader-tier{
        margin-top:6px;
        color:#cedde7;
        font-size:12px;
        line-height:1.45;
      }
      .ht-inline-badge{
        display:inline-flex;
        align-items:center;
        min-height:18px;
        margin-left:6px;
        padding:2px 7px;
        border-radius:999px;
        border:1px solid rgba(255,176,74,.24);
        background:rgba(255,176,74,.10);
        color:#ffe1b0;
        font-size:9px;
        letter-spacing:.08em;
        text-transform:uppercase;
        vertical-align:middle;
      }
      .ht-milestones{
        display:grid;
        gap:10px;
        margin-top:12px;
      }
      .ht-milestone{
        padding:12px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(7,12,18,.44);
      }
      .ht-milestone-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }
      .ht-milestone-title{
        font-size:14px;
        font-weight:800;
        color:#eef7ff;
      }
      .ht-milestone-value{
        font-size:12px;
        font-weight:800;
        color:#ffd89e;
      }
      .ht-milestone-copy{
        margin:8px 0 0;
        color:#cedde7;
        font-size:12px;
        line-height:1.45;
      }
      .ht-progress{
        margin-top:10px;
        height:8px;
        border-radius:999px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.05);
      }
      .ht-progress-fill{
        display:block;
        height:100%;
        border-radius:999px;
        background:linear-gradient(90deg, rgba(62,226,255,.95), rgba(255,176,74,.92));
        box-shadow:0 0 18px rgba(62,226,255,.18);
      }
      .ht-card-shell{
        display:grid;
        gap:12px;
        margin-top:12px;
      }
      .ht-card-preview{
        width:100%;
        display:block;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.08);
        object-fit:cover;
        background:rgba(5,10,14,.66);
      }
      .ht-card-copy{
        display:grid;
        gap:6px;
        color:#eef7ff;
        font-size:14px;
        font-weight:800;
      }
      .ht-card-copy span{
        color:#cedee8;
        font-size:12px;
        font-weight:500;
        line-height:1.5;
      }
      .ht-leaderboard{
        display:grid;
        gap:10px;
        margin-top:12px;
      }
      .ht-leader-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
      }
      .ht-leader-copy{
        min-width:0;
      }
      .ht-leader-amount{
        flex:0 0 auto;
        color:#ffe1aa;
        font-size:13px;
        font-weight:800;
        white-space:nowrap;
      }
      .ht-note{
        padding:14px;
      }
      .ht-note p{
        margin:8px 0 0;
        color:#d6e3ea;
        font-size:13px;
        line-height:1.55;
      }
      .ht-toast{
        position:fixed;
        left:50%;
        bottom:calc(18px + max(var(--ah-inset-bottom, 0px), env(safe-area-inset-bottom, 0px)));
        transform:translate(-50%, 8px);
        padding:10px 14px;
        border-radius:999px;
        background:rgba(8,14,20,.92);
        border:1px solid rgba(76,226,255,.18);
        color:#f2fbff;
        font-size:12px;
        line-height:1.2;
        box-shadow:0 12px 28px rgba(0,0,0,.28);
        opacity:0;
        transition:opacity .18s ease, transform .18s ease;
        z-index:1210;
        pointer-events:none;
      }
      .ht-toast.show{
        opacity:1;
        transform:translate(-50%, 0);
      }
      @media (min-width: 640px){
        .ht-modal{
          top:0;
          bottom:0;
          display:flex;
          align-items:center;
        }
        .ht-shell{
          max-height:calc(min(calc(var(--vh, 1vh) * 100), 100dvh) - 48px);
        }
        .ht-grid{
          grid-template-columns:repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 420px){
        .ht-shell{ padding:14px; }
        .ht-heading h2{ font-size:24px; }
        .ht-panel{ padding:13px; }
        .ht-wallet-value{ font-size:12px; }
        .ht-btn{ width:100%; }
      }
    `;

    document.head.appendChild(style);
  }

  HowlTreasury.init = init;
  HowlTreasury.open = open;
  HowlTreasury.close = close;
  HowlTreasury.refresh = refresh;
  HowlTreasury.renderPending = renderPending;
  HowlTreasury.renderSuccess = renderSuccess;
  HowlTreasury.renderRecentSignals = renderRecentSignals;
  HowlTreasury.renderLeaderboard = renderLeaderboard;
  HowlTreasury.renderMilestones = renderMilestones;
  HowlTreasury.renderVisualCard = renderVisualCard;

  window.HowlTreasury = HowlTreasury;
})();
