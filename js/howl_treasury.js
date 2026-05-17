(function () {
  const HowlTreasury = {};

  const CSS_ID = "howlTreasuryCss";
  const ROOT_ID = "howlTreasuryBack";
  const WALLET = "CNowyAyXYPYeMLHQxLfcWMVowF52f9HmABueSQnmGX6R";
  const HOWL_TREASURY_EMBLEM_URL =
    "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778939844/howl_treasury/howl_treasury_emblem.webp";
  const HOWL_TREASURY_CARD_URL =
    "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778922822/howl_treasury/howl_treasury_card.webp";
  const HOWL_TREASURY_BANNER_URL =
    "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778922822/howl_treasury/howl_treasury_banner.webp";
  const CUSTOM_PRESET_KEY = "custom";
  const CUSTOM_AMOUNT_MIN = 50000;
  const CUSTOM_AMOUNT_MAX = 10000000;
  const SUPPORT_PRESETS = [
    { presetKey: "250k", label: "250K HOWL", amountDisplay: "250,000 $HOWL" },
    { presetKey: "500k", label: "500K HOWL", amountDisplay: "500,000 $HOWL" },
    { presetKey: "1m", label: "1M HOWL", amountDisplay: "1,000,000 $HOWL" },
    { presetKey: CUSTOM_PRESET_KEY, label: "Custom", amountDisplay: "Choose your own amount" },
  ];

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _inited = false;
  let _mounted = false;
  let _isOpen = false;
  let _state = null;
  let _selectedPresetKey = SUPPORT_PRESETS[0].presetKey;
  let _publicSupport = true;
  let _selectionTouched = false;
  let _startingSupport = false;
  let _checkingSupport = false;
  let _pendingCountdownTimer = 0;
  let _supportNotice = "";
  let _successSignal = null;
  let _customAmountHowl = "";

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
    stopPendingCountdown();
    _checkingSupport = false;
    _supportNotice = "";
    _successSignal = null;

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
        nextTier: "signal_supporter",
        nextTierLabel: "Signal Supporter",
        progressToNext: 0,
        publicSupport: true,
      },
      milestones: [],
      visualCardsEnabled: false,
      paymentsEnabled: false,
      pendingPayment: null,
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
      pendingPayment: normalizePendingPayment(src.pendingPayment),
      bannerUrl: String(src.bannerUrl || base.bannerUrl || HOWL_TREASURY_BANNER_URL).trim() || HOWL_TREASURY_BANNER_URL,
      emblemUrl: String(src.emblemUrl || base.emblemUrl || HOWL_TREASURY_EMBLEM_URL).trim() || HOWL_TREASURY_EMBLEM_URL,
      cardUrl: String(src.cardUrl || base.cardUrl || HOWL_TREASURY_CARD_URL).trim() || HOWL_TREASURY_CARD_URL,
    };
  }

  function normalizePendingPayment(item) {
    const src = item && typeof item === "object" ? item : null;
    if (!src) return null;
    const wallet = String(src.wallet || WALLET).trim() || WALLET;
    const amountDisplay = String(src.amountDisplay || "0 $HOWL").trim() || "0 $HOWL";
    const status = String(src.status || "pending").trim().toLowerCase() || "pending";
    if (status !== "pending") return null;
    return {
      paymentId: String(src.paymentId || src.payment_id || "").trim(),
      amountRaw: safeInt(src.amountRaw || src.amount_raw, 0),
      amountDisplay,
      wallet,
      mint: String(src.mint || "").trim(),
      expiresAt: safeInt(src.expiresAt || src.expires_at, 0),
      expiresInSec: safeInt(src.expiresInSec || src.expires_in_sec, 0),
      isPublic: src.isPublic == null ? true : !!src.isPublic,
      status,
      presetKey: String(src.presetKey || src.preset_key || "").trim().toLowerCase(),
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
      nextTier: String(src.nextTier || base.nextTier || "").trim().toLowerCase(),
      nextTierLabel: String(src.nextTierLabel || base.nextTierLabel || "").trim(),
      progressToNext: Math.max(0, Math.min(1, Number(src.progressToNext != null ? src.progressToNext : base.progressToNext || 0) || 0)),
      publicSupport: src.publicSupport == null ? !!base.publicSupport : !!src.publicSupport,
    };
  }

  function normalizeMilestones(items, fallback) {
    const list = Array.isArray(items) && items.length ? items : (Array.isArray(fallback) ? fallback : []);
    return list.map((item, idx) => {
      const row = item && typeof item === "object" ? item : {};
      const progress = Math.max(0, Math.min(1, Number(row.progress || 0) || 0));
      const status = String(row.status || "").trim().toLowerCase();
      return {
        id: String(row.id || ("milestone_" + idx)).trim() || ("milestone_" + idx),
        label: String(row.label || row.title || "Milestone").trim() || "Milestone",
        description: String(row.description || row.copy || row.desc || "").trim(),
        metric: String(row.metric || "").trim(),
        status: status || (progress >= 1 ? "completed" : progress > 0 ? "active" : "locked"),
        completed: !!row.completed || progress >= 1,
        currentRaw: row.currentRaw == null ? null : safeInt(row.currentRaw, 0),
        targetRaw: row.targetRaw == null ? null : safeInt(row.targetRaw, 0),
        current: row.current == null ? null : safeInt(row.current, 0),
        target: row.target == null ? null : safeInt(row.target, 0),
        currentDisplay: String(row.currentDisplay || "").trim(),
        targetDisplay: String(row.targetDisplay || "").trim(),
        progress,
      };
    });
  }

  function safeInt(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return Number(fallback || 0) || 0;
    return Math.max(0, Math.round(n));
  }

  function isCustomPresetSelected() {
    return _selectedPresetKey === CUSTOM_PRESET_KEY;
  }

  function normalizeWholeHowlInput(value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return { ok: false, code: "INVALID_CUSTOM_AMOUNT" };
    if (!/^\d+$/.test(raw)) return { ok: false, code: "INVALID_CUSTOM_AMOUNT" };
    const amount = Number(raw);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return { ok: false, code: "INVALID_CUSTOM_AMOUNT" };
    }
    if (amount < CUSTOM_AMOUNT_MIN) {
      return { ok: false, code: "TOO_SMALL_CUSTOM_AMOUNT" };
    }
    if (amount > CUSTOM_AMOUNT_MAX) {
      return { ok: false, code: "TOO_LARGE_CUSTOM_AMOUNT" };
    }
    return { ok: true, amount, raw };
  }

  function supportErrorMessage(code, fallback) {
    const normalized = String(code || "").trim().toUpperCase();
    if (normalized === "TOO_SMALL_CUSTOM_AMOUNT") {
      return `Custom support starts at ${CUSTOM_AMOUNT_MIN.toLocaleString()} HOWL.`;
    }
    if (normalized === "TOO_LARGE_CUSTOM_AMOUNT") {
      return `Custom support is capped at ${CUSTOM_AMOUNT_MAX.toLocaleString()} HOWL for now.`;
    }
    if (normalized === "INVALID_CUSTOM_AMOUNT") {
      return "Enter a whole HOWL amount.";
    }
    if (normalized === "PAYMENTS_DISABLED" || normalized === "TREASURY_PAYMENTS_DISABLED") {
      return "Treasury support is currently offline.";
    }
    return String(fallback || "").trim() || "Treasury support is coming online.";
  }

  function render(state) {
    const s = state && typeof state === "object" ? state : buildStaticState();
    syncUiState(s);
    ensureDom();

    els.root.innerHTML = `
      <section class="ht-shell">
        <section class="ht-hero">
          <img class="ht-hero-banner" src="${esc(s.bannerUrl)}" alt="HOWL Treasury banner" loading="lazy" decoding="async" />
          <div class="ht-hero-shade"></div>
          <div class="ht-hero-grid">
            <button type="button" class="ht-close" id="howlTreasuryClose" aria-label="Close Treasury">x</button>
            <div class="ht-hero-emblem-wrap">
              <div class="ht-emblem-wrap">
                <img class="ht-emblem" src="${esc(s.emblemUrl)}" alt="HOWL Treasury emblem" loading="lazy" decoding="async" />
              </div>
            </div>
            <div class="ht-heading">
              <div class="ht-kicker">PUBLIC SIGNAL VAULT</div>
              <h2>HOWL TREASURY</h2>
              <p>${esc(s.headline)}</p>
              <div class="ht-chip-row">
                <span class="ht-chip">PUBLIC</span>
                <span class="ht-chip">SECURE</span>
                <span class="ht-chip is-amber">ON-CHAIN</span>
              </div>
            </div>
          </div>
        </section>

        <section class="ht-panel">
          <div class="ht-panel-head">
            <div>
              <div class="ht-panel-kicker">Alpha Treasury</div>
              <h3>Official public Alpha Treasury wallet</h3>
            </div>
            <span class="ht-mini-chip">VAULT ONLINE</span>
          </div>
          <div class="ht-wallet-block">
            <div class="ht-wallet-label">Secure public wallet field</div>
            <div class="ht-wallet-value">${esc(s.wallet)}</div>
          </div>
          <p class="ht-copy ht-copy-tight">Official public Alpha Treasury wallet</p>
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
            <span class="ht-mini-chip ${s.pendingPayment ? "is-amber" : "is-muted"}">${s.pendingPayment ? "PENDING" : (s.paymentsEnabled ? "SIGNAL READY" : "COMING ONLINE")}</span>
          </div>
          ${renderSupportPanel(s)}
        </section>

        <section class="ht-grid">
          <div class="ht-panel">
            <div class="ht-panel-head">
              <div>
                <div class="ht-panel-kicker">Recent Signals</div>
                <h3>Signal chamber</h3>
              </div>
            </div>
            ${renderRecentSignals(s.recentSignals)}
          </div>

          <div class="ht-panel">
            <div class="ht-panel-head">
              <div>
                <div class="ht-panel-kicker">Your Signal</div>
                <h3>Your mark</h3>
              </div>
            </div>
            ${renderUserSignal(s.userSignal)}
          </div>
        </section>

        <section class="ht-panel">
          <div class="ht-panel-head">
            <div>
              <div class="ht-panel-kicker">Community Milestones</div>
              <h3>Community Milestones</h3>
              <div class="ht-copy ht-copy-tight">The Pack’s verified Treasury signals unlock visible marks in Alpha.</div>
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
            <span class="ht-mini-chip is-muted">ARCHIVE PREVIEW</span>
          </div>
          <p class="ht-copy">The Pack remembers.</p>
          ${renderVisualCard(s.cardUrl)}
        </section>

        ${renderPending()}
        ${renderSuccess()}

        <section class="ht-note">
          <div class="ht-note-title">Transparency note</div>
          <p>All support goes to the official Alpha Treasury wallet. This is support and recognition, not pay-to-win.</p>
        </section>
      </section>
    `;

    els.closeBtn = els.root.querySelector("#howlTreasuryClose");
    syncPendingCountdownDom();
  }

  function renderRecentSignals(items) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      return `<div class="ht-empty">No Treasury signals received yet.</div>`;
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
      return `<div class="ht-empty">Your mark will appear here after verified support.</div>`;
    }
    const hasNextTier = !!String(signal.nextTierLabel || "").trim();
    const progressPct = Math.max(0, Math.min(100, Math.round(Number(signal.progressToNext || 0) * 100)));

    return `
      <article class="ht-signal-card">
        <div class="ht-signal-title">Treasury Rank</div>
        <div class="ht-signal-copy">${esc(signal.tierLabel || "No signal yet")}</div>
        <div class="ht-signal-copy">Total support: ${esc(signal.totalSupportedDisplay || "0 $HOWL")}</div>
        <div class="ht-signal-copy">Verified supports: ${esc(String(signal.supportCount || 0))}</div>
        ${hasNextTier ? `<div class="ht-signal-copy">Next rank: ${esc(signal.nextTierLabel)}</div>` : ""}
        ${hasNextTier ? `<div class="ht-signal-copy">Progress to next Treasury rank: ${esc(String(progressPct))}%</div>` : ""}
        <div class="ht-signal-copy">${signal.publicSupport ? "Public recognition is enabled for this lane." : "Anonymous recognition is active for this lane."}</div>
      </article>
    `;
  }

  function renderMilestones(items) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      return `<div class="ht-empty">Milestones are coming online.</div>`;
    }

    return `
      <div class="ht-milestones">
        ${list.map((item) => {
          const progress = Math.max(0, Math.min(100, Math.round(Number(item.progress || 0) * 100)));
          const status = String(item.status || "").trim().toLowerCase() || (progress >= 100 ? "completed" : progress > 0 ? "active" : "locked");
          const statusLabel = status === "completed" ? "COMPLETED" : (status === "active" ? "ACTIVE" : "LOCKED");
          const metricLine = item.currentDisplay && item.targetDisplay
            ? `${item.currentDisplay} / ${item.targetDisplay}`
            : "";
          return `
            <article class="ht-milestone is-${status}">
              <div class="ht-milestone-head">
                <div>
                  <div class="ht-milestone-kicker">Treasury Marker</div>
                  <div class="ht-milestone-title">${esc(item.label || "Milestone")}</div>
                </div>
                <div class="ht-milestone-value">${statusLabel}</div>
              </div>
              <p class="ht-milestone-copy">${esc(item.description || "")}</p>
              ${metricLine ? `<div class="ht-milestone-metric">${esc(metricLine)}</div>` : ""}
              <div class="ht-milestone-progress" aria-hidden="true"><span style="width:${progress}%"></span></div>
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
          Alpha Treasury Transmission
          <span>${src ? "Official recognition card linked to a verified Treasury signal." : "Recognition card preview unavailable."}</span>
        </div>
      </div>
    `;
  }

  function renderSupportPanel(state) {
    const s = state && typeof state === "object" ? state : buildStaticState();
    if (_successSignal) return renderSuccess(_successSignal);
    if (s.pendingPayment) return renderPending(s.pendingPayment);
    if (!s.paymentsEnabled) {
      return `
        ${renderSupportNotice()}
        <p class="ht-copy">
          Verified support signals will soon leave a mark in the Treasury feed, mailbox, and Pack broadcasts.
        </p>
        <button type="button" class="ht-btn is-disabled" disabled aria-disabled="true">Signal support coming online</button>
      `;
    }

    return `
      ${renderSupportNotice()}
      <p class="ht-copy">
        Verified support signals will soon leave a mark in the Treasury feed, mailbox, and Pack broadcasts.
      </p>
      <div class="ht-preset-grid" role="group" aria-label="Treasury support presets">
        ${SUPPORT_PRESETS.map((preset) => `
          <button
            type="button"
            class="ht-preset-btn ${preset.presetKey === _selectedPresetKey ? "is-active" : ""}"
            data-ht-preset="${esc(preset.presetKey)}"
          >
            <span>${esc(preset.label)}</span>
            <small>${esc(preset.amountDisplay)}</small>
          </button>
        `).join("")}
      </div>
      ${isCustomPresetSelected() ? `
        <div class="ht-custom-shell">
          <label class="ht-wallet-label" for="htCustomAmountInput">Enter a custom support signal. Whole HOWL only.</label>
          <input
            id="htCustomAmountInput"
            class="ht-custom-input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            placeholder="100000"
            value="${esc(_customAmountHowl)}"
            data-ht-custom-amount
          />
          <p class="ht-copy ht-copy-tight">Minimum ${CUSTOM_AMOUNT_MIN.toLocaleString()} HOWL. Maximum ${CUSTOM_AMOUNT_MAX.toLocaleString()} HOWL.</p>
        </div>
      ` : ""}
      <div class="ht-toggle-shell">
        <div class="ht-toggle-row" role="group" aria-label="Treasury support visibility">
          <button
            type="button"
            class="ht-toggle-btn ${_publicSupport ? "is-active" : ""}"
            data-ht-public="1"
          >
            Public
          </button>
          <button
            type="button"
            class="ht-toggle-btn ${!_publicSupport ? "is-active" : ""}"
            data-ht-public="0"
          >
            Anonymous
          </button>
        </div>
        <p class="ht-copy ht-copy-tight">
          Public means your name can appear in a future Treasury feed and Pack broadcasts. Anonymous support will surface later as Anonymous Pack member.
        </p>
      </div>
      <div class="ht-actions">
        <button
          type="button"
          class="ht-btn"
          data-ht-start-support
          ${_startingSupport ? 'disabled aria-disabled="true"' : ""}
        >
          ${_startingSupport ? "Opening signal lane..." : "Reinforce the Treasury"}
        </button>
      </div>
    `;
  }

  function renderPending(pending) {
    const row = pending && typeof pending === "object" ? pending : null;
    if (!row) return "";

    return `
      <div class="ht-pending-shell">
        ${renderSupportNotice()}
        <div class="ht-pending-head">
          <div class="ht-pending-title">Treasury Signal Pending</div>
          <div class="ht-pending-chip">VAULT LINK OPEN</div>
        </div>
        <p class="ht-copy">
          The Pack will remember verified signals.
        </p>
        <div class="ht-field-grid">
          <div class="ht-field-block">
            <div class="ht-wallet-label">Send exactly</div>
            <div class="ht-field-value">${esc(row.amountDisplay || "0 $HOWL")}</div>
          </div>
          <div class="ht-field-block">
            <div class="ht-wallet-label">To wallet</div>
            <div class="ht-field-value">${esc(row.wallet || WALLET)}</div>
          </div>
        </div>
        <div class="ht-countdown-row">
          <span>Signal window</span>
          <strong data-ht-countdown>${esc(formatCountdown(row.expiresAt))}</strong>
        </div>
        <div class="ht-actions">
          <button type="button" class="ht-btn" data-ht-copy-amount>Copy Amount</button>
          <button type="button" class="ht-btn" data-ht-copy-wallet>Copy Wallet</button>
        </div>
        <div class="ht-actions">
          <button
            type="button"
            class="ht-btn ${(!_state || !_state.paymentsEnabled) ? "is-disabled" : ""}"
            data-ht-check-payment
            ${(!_state || !_state.paymentsEnabled || _checkingSupport) ? 'disabled aria-disabled="true"' : ""}
          >
            ${_checkingSupport ? "Checking Treasury signal..." : "I sent it - Check Payment"}
          </button>
        </div>
        <p class="ht-copy ht-copy-tight">${_checkingSupport ? "Verification is in progress." : "Verification coming online next."}</p>
      </div>
    `;
  }

  function renderSuccess(signal) {
    const row = signal && typeof signal === "object" ? signal : null;
    if (!row) return "";
    const sideEffects = row.sideEffects && typeof row.sideEffects === "object" ? row.sideEffects : {};
    const cardPreview = row.cardUrl ? renderVisualCard(row.cardUrl) : "";
    const tierCardPreview = row.tierCardUrl ? renderVisualCard(row.tierCardUrl) : "";
    const tierUnlockedBlock = row.tierUnlocked ? `
      <div class="ht-support-note">
        <strong>Treasury Rank Unlocked</strong><br>
        ${esc(row.tierLabel || "Treasury rank unlocked")}<br>
        The vault recognized your signal.
      </div>
    ` : "";
    return `
      <div class="ht-success-shell">
        <div class="ht-pending-head">
          <div class="ht-pending-title">Treasury Signal Received</div>
          <div class="ht-pending-chip">VERIFIED</div>
        </div>
        <p class="ht-copy">Your support was verified.<br>The Pack remembers.</p>
        ${tierUnlockedBlock}
        ${cardPreview}
        ${tierCardPreview}
        <div class="ht-field-grid">
          <div class="ht-field-block">
            <div class="ht-wallet-label">Verified amount</div>
            <div class="ht-field-value">${esc(row.amountDisplay || "0 $HOWL")}</div>
          </div>
          <div class="ht-field-block">
            <div class="ht-wallet-label">Treasury Rank</div>
            <div class="ht-field-value">${esc(row.tierLabel || "No signal yet")}</div>
          </div>
          ${row.txSignature ? `
            <div class="ht-field-block">
              <div class="ht-wallet-label">Transaction</div>
              <div class="ht-field-value">${esc(shortSignature(row.txSignature))}</div>
            </div>
          ` : ""}
        </div>
        <div class="ht-actions">
          <button type="button" class="ht-btn" data-ht-success-back>Back to Treasury</button>
          <button type="button" class="ht-btn" data-ht-copy-wallet>Copy Wallet</button>
        </div>
        ${(sideEffects.mailboxSent || sideEffects.telegramCtaSent) ? `
          <p class="ht-copy ht-copy-tight">
            ${[
              sideEffects.mailboxSent ? "Mailbox signal sent." : "",
              sideEffects.telegramCtaSent ? "Pack broadcast sent." : "",
            ].filter(Boolean).join(" ")}
          </p>
        ` : ""}
      </div>
    `;
  }

  function renderSupportNotice() {
    const text = String(_supportNotice || "").trim();
    if (!text) return "";
    return `<div class="ht-support-note">${esc(text)}</div>`;
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

      const presetBtn = event.target.closest("[data-ht-preset]");
      if (presetBtn) {
        event.preventDefault();
        _selectedPresetKey = String(presetBtn.getAttribute("data-ht-preset") || SUPPORT_PRESETS[0].presetKey).trim().toLowerCase();
        _selectionTouched = true;
        render(_state || buildStaticState());
        return;
      }

      const publicBtn = event.target.closest("[data-ht-public]");
      if (publicBtn) {
        event.preventDefault();
        _publicSupport = publicBtn.getAttribute("data-ht-public") !== "0";
        _selectionTouched = true;
        render(_state || buildStaticState());
        return;
      }

      const startBtn = event.target.closest("[data-ht-start-support]");
      if (startBtn) {
        event.preventDefault();
        void startSupport();
        return;
      }

      const copyAmountBtn = event.target.closest("[data-ht-copy-amount]");
      if (copyAmountBtn) {
        event.preventDefault();
        const ok = await copyText(_state && _state.pendingPayment ? _state.pendingPayment.amountDisplay : "");
        toast(ok ? "HOWL amount copied." : "Could not copy amount.");
        return;
      }

      const copyBtn = event.target.closest("[data-ht-copy-wallet]");
      if (copyBtn) {
        event.preventDefault();
        const ok = await copyText((_state && _state.pendingPayment && _state.pendingPayment.wallet) || (_state && _state.wallet) || WALLET);
        toast(ok ? "Treasury wallet copied." : "Wallet copy failed.");
        return;
      }

      const checkBtn = event.target.closest("[data-ht-check-placeholder]");
      if (checkBtn) {
        event.preventDefault();
        toast("Verification coming online next.");
        return;
      }

      const verifyBtn = event.target.closest("[data-ht-check-payment]");
      if (verifyBtn) {
        event.preventDefault();
        void checkSupport();
        return;
      }

      const successBackBtn = event.target.closest("[data-ht-success-back]");
      if (successBackBtn) {
        event.preventDefault();
        _successSignal = null;
        _supportNotice = "";
        render(_state || buildStaticState());
      }
    });

    els.back.addEventListener("input", (event) => {
      const customInput = event.target.closest("[data-ht-custom-amount]");
      if (!customInput) return;
      _customAmountHowl = String(customInput.value || "");
      _selectionTouched = true;
    });
  }

  function syncUiState(state) {
    const s = state && typeof state === "object" ? state : null;
    const pending = s && s.pendingPayment ? s.pendingPayment : null;
    if (pending) {
      _publicSupport = pending.isPublic !== false;
      if (pending.presetKey) _selectedPresetKey = pending.presetKey;
      if (pending.presetKey === CUSTOM_PRESET_KEY && pending.amountDisplay) {
        _customAmountHowl = String(pending.amountDisplay).replace(/[^\d]/g, "");
      }
      _selectionTouched = true;
      startPendingCountdown();
      return;
    }
    stopPendingCountdown();
    if (!_selectionTouched) {
      _publicSupport = !!(s && s.userSignal ? s.userSignal.publicSupport : true);
    }
  }

  function makeRunId(prefix, key) {
    if (typeof window.AH_makeRunId === "function") return window.AH_makeRunId(prefix, key);
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
      }
    } catch (_) {}
    return `rid_${String(prefix || "treasury")}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}_${String(key || "").slice(0, 24)}`;
  }

  async function startSupport() {
    if (_startingSupport) return;
    if (!_state || !_state.paymentsEnabled) {
      toast("Treasury support is coming online.");
      return;
    }

    const apiPost = getApiPost();
    if (!apiPost) {
      toast("Treasury support is coming online.");
      return;
    }

    _startingSupport = true;
    _supportNotice = "";
    _successSignal = null;
    render(_state || buildStaticState());

    const presetKey = _selectedPresetKey || SUPPORT_PRESETS[0].presetKey;
    const payload = {
      isPublic: !!_publicSupport,
      run_id: makeRunId("treasury_support", presetKey === CUSTOM_PRESET_KEY ? `${presetKey}_${_customAmountHowl}` : presetKey),
    };
    if (presetKey === CUSTOM_PRESET_KEY) {
      const customAmount = normalizeWholeHowlInput(_customAmountHowl);
      if (!customAmount.ok) {
        const message = supportErrorMessage(customAmount.code, "");
        _supportNotice = message;
        toast(message);
        _startingSupport = false;
        render(_state || buildStaticState());
        return;
      }
      payload.customAmountHowl = customAmount.raw;
    } else {
      payload.presetKey = presetKey;
    }
    try {
      const out = await apiPost("/webapp/treasury/support/start", payload);
      if (!out || out.ok === false || !out.pending) {
        throw new Error(String(out && (out.message || out.reason || out.code) || "TREASURY_START_FAILED"));
      }

      _state = normalizeState(
        {
          ...(_state || buildStaticState()),
          paymentsEnabled: out.paymentsEnabled !== false,
          pendingPayment: out.pending,
        },
        buildStaticState()
      );
      _supportNotice = "";
      toast("Treasury signal pending.");
    } catch (err) {
      const data = err && err.response && err.response.data ? err.response.data : null;
      const message = supportErrorMessage(
        data && data.code,
        (data && (data.message || data.reason || data.code))
          || (err && err.message)
          || "Treasury support is coming online."
      );
      _supportNotice = message;
      toast(message || "Treasury support is coming online.");
      if (data && (data.code === "TREASURY_PAYMENTS_DISABLED" || data.code === "PAYMENTS_DISABLED")) {
        _state = normalizeState(
          {
            ...(_state || buildStaticState()),
            paymentsEnabled: false,
            pendingPayment: null,
          },
          buildStaticState()
        );
      }
    } finally {
      _startingSupport = false;
      render(_state || buildStaticState());
    }
  }

  async function checkSupport() {
    if (_checkingSupport) return;
    const pending = _state && _state.pendingPayment ? _state.pendingPayment : null;
    if (!pending || !_state || !_state.paymentsEnabled) return;

    const apiPost = getApiPost();
    if (!apiPost) {
      _supportNotice = "Verification is temporarily unavailable. Try again shortly.";
      render(_state || buildStaticState());
      return;
    }

    _checkingSupport = true;
    _supportNotice = "";
    render(_state || buildStaticState());

    try {
      const out = await apiPost("/webapp/treasury/support/check", {
        paymentId: pending.paymentId,
      });
      if (!out || out.ok === false || !out.completed || !out.signal) {
        throw new Error(String(out && (out.message || out.reason || out.code) || "TREASURY_CHECK_FAILED"));
      }
      _successSignal = normalizeSuccessSignal({
        ...out.signal,
        sideEffects: out.sideEffects || {},
      });
      _supportNotice = "";
      await refresh({ silent: true });
    } catch (err) {
      const data = err && err.response && err.response.data ? err.response.data : null;
      const code = String((data && data.code) || "").trim();
      _successSignal = null;
      if (code === "PAYMENT_NOT_FOUND") {
        _supportNotice = "No matching Treasury transfer found yet. If you just sent it, wait a moment and try again.";
      } else if (code === "WALLET_REQUIRED") {
        _supportNotice = "Link your wallet to verify Treasury support automatically.";
      } else if (code === "PAYMENT_EXPIRED") {
        _supportNotice = "This Treasury signal expired. Start a new signal to continue.";
        await refresh({ silent: true });
      } else if (code === "RPC_UNAVAILABLE") {
        _supportNotice = "Verification is temporarily unavailable. Try again shortly.";
      } else {
        _supportNotice = String(
          (data && (data.message || data.reason || data.code))
            || (err && err.message)
            || "Verification is temporarily unavailable. Try again shortly."
        ).trim();
      }
    } finally {
      _checkingSupport = false;
      render(_state || buildStaticState());
    }
  }

  function normalizeSuccessSignal(item) {
    const src = item && typeof item === "object" ? item : {};
    return {
      signalId: String(src.signalId || src.signal_id || "").trim(),
      displayName: String(src.displayName || src.display_name || "Pack member").trim() || "Pack member",
      amountRaw: safeInt(src.amountRaw || src.amount_raw, 0),
      amountDisplay: String(src.amountDisplay || src.amount_display || "0 $HOWL").trim() || "0 $HOWL",
      txSignature: String(src.txSignature || src.tx_signature || "").trim(),
      isPublic: src.isPublic == null ? true : !!src.isPublic,
      createdAt: safeInt(src.createdAt || src.created_at, 0),
      cardUrl: String(src.cardUrl || src.card_url || "").trim(),
      tier: String(src.tier || "none").trim().toLowerCase() || "none",
      tierLabel: String(src.tierLabel || src.tier_label || "No signal yet").trim() || "No signal yet",
      tierUnlocked: !!src.tierUnlocked,
      tierCardUrl: String(src.tierCardUrl || src.tier_card_url || "").trim(),
      sideEffects: normalizeSideEffects(src.sideEffects || src.side_effects),
    };
  }

  function normalizeSideEffects(item) {
    const src = item && typeof item === "object" ? item : {};
    return {
      mailboxSent: !!src.mailboxSent,
      telegramCtaSent: !!src.telegramCtaSent,
    };
  }

  function shortSignature(value) {
    const text = String(value || "").trim();
    if (text.length <= 14) return text;
    return `${text.slice(0, 7)}...${text.slice(-7)}`;
  }

  function startPendingCountdown() {
    if (_pendingCountdownTimer) return;
    _pendingCountdownTimer = window.setInterval(syncPendingCountdownDom, 1000);
  }

  function stopPendingCountdown() {
    if (!_pendingCountdownTimer) return;
    window.clearInterval(_pendingCountdownTimer);
    _pendingCountdownTimer = 0;
  }

  function syncPendingCountdownDom() {
    if (!els.root) return;
    const row = _state && _state.pendingPayment ? _state.pendingPayment : null;
    const value = formatCountdown(row && row.expiresAt);
    els.root.querySelectorAll("[data-ht-countdown]").forEach((node) => {
      node.textContent = value;
    });
  }

  function formatCountdown(expiresAt) {
    const ts = safeInt(expiresAt, 0);
    if (!ts) return "Awaiting timer";
    const remain = Math.max(0, ts - Math.floor(Date.now() / 1000));
    if (remain <= 0) return "Expired";
    const minutes = Math.floor(remain / 60);
    const seconds = remain % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")} remaining`;
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
        gap:14px;
        max-height:calc(min(calc(var(--vh, 1vh) * 100), 100dvh) - 24px - max(var(--ah-inset-bottom, 0px), env(safe-area-inset-bottom, 0px)));
        overflow:auto;
        padding:12px;
        color:#edf7ff;
      }
      .ht-hero{
        position:relative;
        overflow:hidden;
        min-height:236px;
        border-radius:24px;
        border:1px solid rgba(96,227,255,.18);
        background:#071117;
        box-shadow:
          0 24px 48px rgba(0,0,0,.28),
          inset 0 1px 0 rgba(255,255,255,.04);
      }
      .ht-hero-banner{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center;
      }
      .ht-hero-shade{
        position:absolute;
        inset:0;
        background:
          linear-gradient(180deg, rgba(3,9,13,.18) 0%, rgba(3,9,13,.42) 28%, rgba(4,8,12,.82) 100%),
          radial-gradient(circle at 22% 20%, rgba(80,230,255,.20), transparent 34%),
          radial-gradient(circle at 82% 18%, rgba(255,176,74,.14), transparent 26%);
      }
      .ht-hero-grid{
        position:relative;
        display:grid;
        grid-template-columns:1fr auto;
        gap:12px;
        min-height:236px;
        padding:14px;
        align-items:start;
      }
      .ht-hero-emblem-wrap{
        grid-column:1 / -1;
        display:flex;
        justify-content:center;
        margin-top:28px;
        pointer-events:none;
      }
      .ht-emblem-wrap{
        flex:0 0 auto;
        width:74px;
        height:74px;
        border-radius:22px;
        display:grid;
        place-items:center;
        background:
          linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03)),
          rgba(7,18,24,.78);
        border:1px solid rgba(122,230,255,.26);
        box-shadow:
          0 0 0 1px rgba(122,230,255,.08),
          0 0 26px rgba(66,220,255,.18),
          0 16px 34px rgba(0,0,0,.28);
      }
      .ht-emblem{
        width:50px;
        height:50px;
        object-fit:contain;
      }
      .ht-heading{
        grid-column:1 / -1;
        min-width:0;
        align-self:end;
        padding-top:10px;
      }
      .ht-kicker,
      .ht-panel-kicker,
      .ht-note-title,
      .ht-milestone-kicker{
        font-size:10px;
        line-height:1.15;
        font-weight:800;
        letter-spacing:.14em;
        text-transform:uppercase;
        color:rgba(179,228,240,.72);
      }
      .ht-heading h2{
        margin:6px 0 0;
        font-size:29px;
        line-height:1.05;
        letter-spacing:.06em;
        text-shadow:0 10px 28px rgba(0,0,0,.44);
      }
      .ht-heading p{
        margin:6px 0 0;
        color:#e2f1f7;
        font-size:13px;
        line-height:1.45;
        max-width:260px;
      }
      .ht-heading .ht-chip-row{
        margin-top:12px;
      }
      .ht-close{
        flex:0 0 auto;
        width:40px;
        height:40px;
        border-radius:14px;
        justify-self:end;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(7,14,19,.56);
        color:#f2f8ff;
        font-size:18px;
        font-weight:700;
        box-shadow:0 10px 22px rgba(0,0,0,.24);
        backdrop-filter:blur(10px);
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
        background:rgba(7,16,21,.58);
        color:#dff5ff;
        font-size:10px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
        white-space:nowrap;
        backdrop-filter:blur(10px);
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
      .ht-panel,
      .ht-note{
        border-radius:20px;
        border:1px solid rgba(255,255,255,.09);
        background:
          linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.028)),
          rgba(7,13,18,.84);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
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
      .ht-copy-tight{
        margin-top:10px;
        color:#abc4d1;
      }
      .ht-wallet-block{
        margin-top:12px;
        padding:12px;
        border-radius:18px;
        background:
          linear-gradient(180deg, rgba(76,226,255,.10), rgba(255,255,255,.02)),
          linear-gradient(90deg, rgba(255,176,74,.06), transparent 42%),
          rgba(6,10,15,.70);
        border:1px solid rgba(76,226,255,.16);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.04),
          0 0 18px rgba(76,226,255,.08);
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
        font-size:12px;
        line-height:1.55;
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
        background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.03));
        color:rgba(217,228,236,.60);
        box-shadow:none;
      }
      .ht-grid{
        display:grid;
        gap:12px;
      }
      .ht-preset-grid{
        display:grid;
        grid-template-columns:repeat(3, minmax(0, 1fr));
        gap:10px;
        margin-top:12px;
      }
      .ht-preset-btn,
      .ht-toggle-btn{
        min-width:0;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(8,15,20,.46);
        color:#e8f4fb;
      }
      .ht-preset-btn{
        display:grid;
        gap:4px;
        padding:12px 10px;
        text-align:left;
      }
      .ht-preset-btn span{
        font-size:12px;
        font-weight:800;
        letter-spacing:.06em;
        text-transform:uppercase;
      }
      .ht-preset-btn small{
        color:#b8d0dc;
        font-size:11px;
        line-height:1.35;
      }
      .ht-preset-btn.is-active,
      .ht-toggle-btn.is-active{
        border-color:rgba(76,226,255,.34);
        background:
          linear-gradient(180deg, rgba(33,206,197,.18), rgba(8,15,20,.58)),
          rgba(8,15,20,.56);
        box-shadow:0 0 0 1px rgba(76,226,255,.08), 0 0 22px rgba(76,226,255,.10);
      }
      .ht-custom-shell{
        display:flex;
        flex-direction:column;
        gap:8px;
        margin-top:10px;
        padding:12px;
        border-radius:18px;
        border:1px solid rgba(96,227,255,.14);
        background:rgba(5,12,18,.72);
      }
      .ht-custom-input{
        width:100%;
        min-height:46px;
        border-radius:14px;
        border:1px solid rgba(112,230,255,.18);
        background:rgba(4,10,15,.9);
        color:#edf7ff;
        padding:0 14px;
        font:600 15px/1.2 inherit;
        outline:none;
      }
      .ht-custom-input:focus{
        border-color:rgba(96,227,255,.48);
        box-shadow:0 0 0 1px rgba(96,227,255,.24);
      }
      .ht-custom-input::placeholder{
        color:rgba(214,234,245,.42);
      }
      .ht-toggle-shell{
        margin-top:12px;
      }
      .ht-support-note{
        margin-top:12px;
        padding:12px;
        border-radius:16px;
        border:1px solid rgba(255,176,74,.20);
        background:rgba(255,176,74,.08);
        color:#ffe2b2;
        font-size:12px;
        line-height:1.5;
      }
      .ht-toggle-row{
        display:grid;
        grid-template-columns:repeat(2, minmax(0, 1fr));
        gap:10px;
      }
      .ht-toggle-btn{
        min-height:40px;
        padding:0 12px;
        font-size:12px;
        font-weight:800;
        letter-spacing:.05em;
        text-transform:uppercase;
      }
      .ht-pending-shell{
        margin-top:10px;
      }
      .ht-success-shell{
        margin-top:10px;
      }
      .ht-pending-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }
      .ht-pending-title{
        font-size:15px;
        font-weight:800;
        color:#eef7ff;
      }
      .ht-pending-chip{
        flex:0 0 auto;
        padding:5px 9px;
        border-radius:999px;
        border:1px solid rgba(255,176,74,.24);
        background:rgba(255,176,74,.10);
        color:#ffe1af;
        font-size:10px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      .ht-field-grid{
        display:grid;
        gap:10px;
        margin-top:12px;
      }
      .ht-field-block{
        padding:12px;
        border-radius:18px;
        border:1px solid rgba(76,226,255,.14);
        background:
          linear-gradient(180deg, rgba(76,226,255,.08), rgba(255,255,255,.02)),
          rgba(6,10,15,.60);
      }
      .ht-field-value{
        margin-top:8px;
        color:#f5fbff;
        font-family:ui-monospace, SFMono-Regular, Consolas, monospace;
        font-size:12px;
        line-height:1.55;
        word-break:break-all;
      }
      .ht-countdown-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-top:12px;
        color:#d4e2ea;
        font-size:12px;
      }
      .ht-countdown-row strong{
        color:#ffe1aa;
        font-size:12px;
        font-weight:800;
        white-space:nowrap;
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
        padding:13px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.08);
        background:
          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02)),
          rgba(7,12,18,.44);
      }
      .ht-milestone.is-locked{
        border-color:rgba(255,255,255,.08);
      }
      .ht-milestone.is-active{
        border-color:rgba(76,226,255,.18);
        box-shadow:0 0 0 1px rgba(76,226,255,.04);
      }
      .ht-milestone.is-completed{
        border-color:rgba(255,176,74,.20);
        box-shadow:0 0 0 1px rgba(255,176,74,.05), 0 0 18px rgba(255,176,74,.08);
      }
      .ht-milestone-head{
        display:flex;
        align-items:flex-start;
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
        letter-spacing:.08em;
      }
      .ht-milestone-copy{
        margin:8px 0 0;
        color:#cedde7;
        font-size:12px;
        line-height:1.45;
      }
      .ht-milestone-metric{
        margin-top:10px;
        color:rgba(185,206,218,.72);
        font-size:11px;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      .ht-milestone-progress{
        margin-top:10px;
        height:8px;
        border-radius:999px;
        background:rgba(255,255,255,.08);
        overflow:hidden;
        box-shadow:inset 0 1px 2px rgba(0,0,0,.35);
      }
      .ht-milestone-progress span{
        display:block;
        height:100%;
        border-radius:inherit;
        background:linear-gradient(90deg, rgba(76,226,255,.9), rgba(255,176,74,.88));
        box-shadow:0 0 12px rgba(76,226,255,.18);
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
        .ht-hero{ min-height:224px; }
        .ht-hero-grid{ min-height:224px; padding:12px; }
        .ht-hero-emblem-wrap{ margin-top:24px; }
        .ht-emblem-wrap{ width:66px; height:66px; }
        .ht-emblem{ width:44px; height:44px; }
        .ht-heading h2{ font-size:24px; }
        .ht-panel{ padding:13px; }
        .ht-wallet-value{ font-size:12px; }
        .ht-preset-grid{
          grid-template-columns:1fr;
        }
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
