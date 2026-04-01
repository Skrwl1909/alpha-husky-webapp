// js/support.js - Unified Support Alpha sheet (Stars + Solana holder lane)
(function () {
  let _tg = null;
  let _apiPost = null;
  let _dbg = false;
  let _state = null;

  const BOT_USERNAME = "Alpha_husky_bot";

  function log(...args) {
    if (_dbg) console.log("[Support]", ...args);
  }

  function getTg() {
    return _tg || window.tg || window.Telegram?.WebApp || null;
  }

  function getApiPost() {
    return _apiPost || window.apiPost || window.S?.apiPost || window.AH?.apiPost || null;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const node = el(id);
    if (node) node.textContent = text || "";
  }

  function setHtml(id, html) {
    const node = el(id);
    if (node) node.innerHTML = html || "";
  }

  function setDisabled(id, disabled) {
    const node = el(id);
    if (node) node.disabled = !!disabled;
  }

  function setVisible(id, visible) {
    const node = el(id);
    if (!node) return;
    node.style.display = visible ? "" : "none";
  }

  function isTokenLaneEnabled(token) {
    return !!(token && token.enabled !== false && token.comingSoon !== true);
  }

  function runId(prefix) {
    try { return `${prefix}:${crypto.randomUUID()}`; } catch (_) {}
    return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
  }

  function toLocal(ts) {
    const n = Number(ts || 0);
    if (!n) return "Never";
    try {
      return new Date(n * 1000).toLocaleString();
    } catch (_) {
      return "Never";
    }
  }

  function encodeBase64(bytes) {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    let bin = "";
    const step = 0x8000;
    for (let i = 0; i < arr.length; i += step) {
      bin += String.fromCharCode.apply(null, Array.from(arr.slice(i, i + step)));
    }
    return btoa(bin);
  }

  function getSolanaProvider() {
    const phantom = window.phantom?.solana;
    if (phantom && (phantom.isPhantom || typeof phantom.signMessage === "function")) return phantom;

    const sol = window.solana;
    if (sol && (sol.isPhantom || typeof sol.signMessage === "function")) return sol;

    return null;
  }

  async function createStarsInvoice(tier) {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("NO_API_POST");

    const run_id = runId(`supp_${tier || "x"}`);
    const res = await apiPost("/webapp/support/invoice", { tier, run_id });
    const link = res?.invoiceLink || res?.invoice_link || res?.data?.invoiceLink || "";

    if (!link) throw new Error("NO_INVOICE_LINK");
    return { link, payload: res?.payload || "", run_id };
  }

  async function refreshProfileViews() {
    try { await window.loadProfile?.(); } catch (_) {}
    try { window.renderTopbar?.(); } catch (_) {}
    try { window.paintBuffs?.(); } catch (_) {}
    try { await window.loadPlayerState?.(); } catch (_) {}
  }

  async function refreshSupportState(opts = {}) {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("NO_API_POST");

    const out = await apiPost("/webapp/supporter/state", {});
    if (!out || out.ok === false) throw new Error(out?.reason || "SUPPORT_STATE_FAILED");

    _state = out.support || {};
    renderState(_state, opts);
    return _state;
  }

  function renderStarsState(stars) {
    const lane = stars || {};
    if (lane.active) {
      const parts = [];
      if (lane.tierKey) parts.push(`Tier: ${String(lane.tierKey).toUpperCase()}`);
      if (lane.tag) parts.push(`Tag: ${lane.tag}`);
      if (Array.isArray(lane.skinUnlocks) && lane.skinUnlocks.length) {
        parts.push(`Support skins: ${lane.skinUnlocks.join(", ")}`);
      }
      setText("supportStarsStatus", `Stars lane active. ${parts.join(" • ")}`);
      return;
    }

    if (Array.isArray(lane.skinUnlocks) && lane.skinUnlocks.length) {
      setText("supportStarsStatus", `Stars support skins owned: ${lane.skinUnlocks.join(", ")}.`);
      return;
    }

    setText("supportStarsStatus", "Stars lane ready. Supporter and Patron still use Telegram Stars exactly as before.");
  }

  function renderTokenState(token) {
    const lane = token || {};
    if (!isTokenLaneEnabled(lane)) {
      setText("supportTokenStatus", lane.message || "Token holder support is coming soon.");
      setText(
        "supportTokenPerks",
        lane.detail || "Support with Stars is live now. Holder cosmetics and weekly support perks will unlock later."
      );
      setText(
        "supportTokenHint",
        lane.hint || "Support with Stars is live now."
      );

      const connectBtn = el("supportTokenConnect");
      if (connectBtn) connectBtn.textContent = "Coming Soon";
      setDisabled("supportTokenConnect", true);
      setDisabled("supportTokenRefresh", true);
      setDisabled("supportTokenClaim", true);
      setVisible("supportTokenRefresh", false);
      setVisible("supportTokenClaim", false);
      return;
    }

    const wallet = lane.walletDisplay || "Not linked";
    const tier = Number(lane.tier || 0);
    const checked = toLocal(lane.checkedAt);
    const claim = lane.weeklyClaimAvailable ? "Weekly claim ready." : (lane.claimedWeekKey ? `Claimed for ${lane.claimedWeekKey}.` : "Weekly claim locked.");

    if (lane.linked) {
      setText(
        "supportTokenStatus",
        `Wallet: ${wallet} • Tier ${tier} • Balance raw: ${lane.balanceRaw || "0"} • Last check: ${checked}`
      );
    } else {
      setText(
        "supportTokenStatus",
        "No Solana wallet linked yet. Link a wallet, verify holder balance, then unlock token-holder support perks."
      );
    }

    const perks = [];
    if (lane.badge) perks.push(`Badge: ${lane.badge}`);
    if (lane.frame) perks.push(`Frame: ${lane.frame}`);
    if (lane.skin) perks.push(`Tier 3 skin: ${lane.skin}`);
    if (!perks.length) perks.push("Perks unlock by holder tier only.");
    perks.push(claim);
    setText("supportTokenPerks", perks.join(" • "));

    const provider = getSolanaProvider();
    const providerAddr =
      provider?.publicKey?.toString?.() ||
      provider?.publicKey?.toBase58?.() ||
      "";

    if (!provider) {
      setText(
        "supportTokenHint",
        "No injected Solana wallet detected. Open Alpha Husky in Phantom or a browser with a Solana wallet extension to link."
      );
    } else if (lane.linked && providerAddr && providerAddr === lane.wallet) {
      setText(
        "supportTokenHint",
        "This wallet is already linked. To relink to a different wallet, switch accounts inside Phantom first, then tap reconnect."
      );
    } else if (lane.linked) {
      setText("supportTokenHint", "Wallet ownership is verified by signed message. No transaction or token transfer is requested.");
    } else {
      setText("supportTokenHint", "Linking will ask your wallet to sign a short ownership message. No transaction will be sent.");
    }

    const connectBtn = el("supportTokenConnect");
    setDisabled("supportTokenConnect", false);
    if (connectBtn) connectBtn.textContent = lane.linked ? "Reconnect Solana Wallet" : "Connect Solana Wallet";

    setVisible("supportTokenRefresh", true);
    setDisabled("supportTokenRefresh", !lane.linked);
    setDisabled("supportTokenClaim", !lane.weeklyClaimAvailable);
    setVisible("supportTokenClaim", !!lane.linked);
  }

  function renderCombinedState(support) {
    const stars = support?.stars || {};
    const token = support?.token || {};
    const combined = support?.combined || {};
    const tokenEnabled = isTokenLaneEnabled(token);

    if (tokenEnabled && combined.dualSupporter) {
      setText(
        "supportCombinedStatus",
        `Dual supporter active. Stars lane and Believe holder lane are both live, with resolved status tag "${combined.resolvedTag || "dual_supporter"}".`
      );
      setText(
        "supportCombinedPerks",
        `Stars tier: ${stars.tierKey || "active"} • Token tier: ${token.tier || 0} • Weekly claim: ${token.weeklyClaimAvailable ? "ready" : "not ready"}`
      );
      return;
    }

    if (stars.active) {
      setText(
        "supportCombinedStatus",
        tokenEnabled
          ? "Stars-only supporter. Telegram native support is active."
          : "Stars-only supporter. Telegram native support is active, and token holder support is coming soon."
      );
      setText("supportCombinedPerks", `Resolved Stars tier: ${stars.tierKey || "supporter"}.`);
      return;
    }

    if (tokenEnabled && Number(token.tier || 0) > 0) {
      setText("supportCombinedStatus", "Token-only supporter. Believe holder lane is active.");
      setText("supportCombinedPerks", `Holder tier: ${token.tier || 0} • Weekly claim: ${token.weeklyClaimAvailable ? "ready" : "not ready"}.`);
      return;
    }

    if (!tokenEnabled) {
      setText("supportCombinedStatus", "Stars support is live now. Token holder support is coming soon.");
      setText("supportCombinedPerks", "Telegram Stars remains the active support path until the Believe holder lane launches.");
      return;
    }

    setText("supportCombinedStatus", "No active support lane yet.");
    setText("supportCombinedPerks", "Users can be Stars-only, token-only, or dual supporters under this unified flow.");
  }

  function renderState(support) {
    renderStarsState(support?.stars || {});
    renderTokenState(support?.token || {});
    renderCombinedState(support || {});
  }

  async function handleTierClick(tier) {
    const tg = getTg();
    try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

    try {
      const { link } = await createStarsInvoice(tier);

      if (typeof tg?.openInvoice === "function") {
        tg.openInvoice(link, async (status) => {
          log("openInvoice status:", status);

          if (status === "paid") {
            try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
            await refreshProfileViews();
            try { await refreshSupportState(); } catch (_) {}
            try { tg?.showAlert?.("Support unlocked. Thank you, Howler."); } catch (_) {}
          } else if (status === "cancelled") {
            try { tg?.showAlert?.("Payment cancelled."); } catch (_) {}
          } else if (status === "failed") {
            try { tg?.showAlert?.("Payment failed."); } catch (_) {}
          }
        });
        return;
      }

      throw new Error("NO_OPENINVOICE");
    } catch (err) {
      log("Invoice flow failed, fallback to bot deep link:", err);
      const deep = `https://t.me/${BOT_USERNAME}?start=support_${encodeURIComponent(String(tier || ""))}`;
      try { tg?.openTelegramLink?.(deep); }
      catch (_) { tg?.showAlert?.("Open /support in chat"); }
    }
  }

  async function linkSolanaWallet() {
    const apiPost = getApiPost();
    const tg = getTg();
    const provider = getSolanaProvider();
    if (!apiPost) throw new Error("NO_API_POST");
    if (!provider) throw new Error("NO_SOLANA_PROVIDER");

    if (!provider.isConnected && typeof provider.connect === "function") {
      await provider.connect();
    }

    const address =
      provider.publicKey?.toString?.() ||
      provider.publicKey?.toBase58?.() ||
      "";
    if (!address) throw new Error("NO_SOLANA_ADDRESS");

    const nonceRes = await apiPost("/webapp/supporter/nonce", { run_id: runId("supporter_nonce") });
    const message = String(nonceRes?.message || "").trim();
    if (!message) throw new Error("MISSING_NONCE_MESSAGE");

    const encoded = new TextEncoder().encode(message);
    let signed;
    try {
      signed = await provider.signMessage(encoded, "utf8");
    } catch (_) {
      signed = await provider.signMessage(encoded);
    }

    const signatureBytes = signed?.signature || signed;
    const signature = encodeBase64(signatureBytes);

    const res = await apiPost("/webapp/supporter/link", {
      run_id: runId("supporter_link"),
      address,
      signature,
      walletApp: provider?.isPhantom ? "phantom" : "solana_wallet",
      walletPlatform: /Telegram/i.test(navigator.userAgent || "") ? "telegram_webview" : "browser"
    });

    if (!res || res.ok === false) {
      throw new Error(res?.reason || "LINK_FAILED");
    }

    try {
      await refreshHolderStatus({ silent: true });
    } catch (refreshErr) {
      log("initial holder refresh failed after link:", refreshErr);
      try { await refreshSupportState(); } catch (_) {}
    }
    await refreshProfileViews();
    try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
    return res;
  }

  async function refreshHolderStatus(opts = {}) {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("NO_API_POST");

    const res = await apiPost("/webapp/supporter/refresh", { run_id: runId("supporter_refresh") });
    if (!res || res.ok === false) throw new Error(res?.reason || "REFRESH_FAILED");

    _state = res.support || _state || {};
    renderState(_state);
    if (!opts.silent) await refreshProfileViews();
    return res;
  }

  async function claimWeekly() {
    const apiPost = getApiPost();
    const tg = getTg();
    if (!apiPost) throw new Error("NO_API_POST");

    const res = await apiPost("/webapp/supporter/claim", { run_id: runId("supporter_claim") });
    if (!res || res.ok === false) throw new Error(res?.reason || "CLAIM_FAILED");

    _state = res.support || _state || {};
    renderState(_state);
    await refreshProfileViews();
    try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
    try { tg?.showAlert?.(`Weekly claim ready. Claimed ${res?.reward?.amount || 0} bones.`); } catch (_) {}
    return res;
  }

  function setButtonBusy(id, busy, busyLabel, idleLabel) {
    const btn = el(id);
    if (!btn) return;
    if (!btn.dataset.idleLabel) btn.dataset.idleLabel = idleLabel || btn.textContent || "";
    btn.disabled = !!busy;
    btn.textContent = busy ? (busyLabel || btn.textContent) : (idleLabel || btn.dataset.idleLabel);
  }

  async function onConnectClick() {
    const tg = getTg();
    if (!isTokenLaneEnabled((_state || {}).token || {})) {
      try { tg?.showAlert?.("Token holder support is coming soon. Support with Stars is live now."); } catch (_) {}
      return;
    }
    try {
      setButtonBusy("supportTokenConnect", true, "Linking...", "Connect Solana Wallet");
      await linkSolanaWallet();
    } catch (err) {
      log("linkSolanaWallet failed:", err);
      const reason = String(err?.message || err || "");
      const reasonLc = reason.toLowerCase();
      const msg =
        reason === "NO_SOLANA_PROVIDER"
          ? "No Solana wallet found. Open Alpha Husky in Phantom or a browser with a Solana wallet."
          : (reasonLc.includes("reject") || reasonLc.includes("decline") || reasonLc.includes("cancel"))
            ? "Wallet signature was cancelled. Approve the signature in your Solana wallet to finish linking."
          : "Wallet link failed. Please try again.";
      try { tg?.showAlert?.(msg); } catch (_) {}
    } finally {
      renderTokenState((_state || {}).token || {});
    }
  }

  async function onRefreshClick() {
    const tg = getTg();
    if (!isTokenLaneEnabled((_state || {}).token || {})) {
      try { tg?.showAlert?.("Token holder support is coming soon. Support with Stars is live now."); } catch (_) {}
      return;
    }
    try {
      setButtonBusy("supportTokenRefresh", true, "Refreshing...", "Refresh Holder Status");
      await refreshHolderStatus();
    } catch (err) {
      log("refreshHolderStatus failed:", err);
      try { tg?.showAlert?.("Holder refresh failed. Please try again in a moment."); } catch (_) {}
    } finally {
      renderTokenState((_state || {}).token || {});
    }
  }

  async function onClaimClick() {
    const tg = getTg();
    if (!isTokenLaneEnabled((_state || {}).token || {})) {
      try { tg?.showAlert?.("Token holder support is coming soon. Support with Stars is live now."); } catch (_) {}
      return;
    }
    try {
      setButtonBusy("supportTokenClaim", true, "Claiming...", "Weekly Claim");
      await claimWeekly();
    } catch (err) {
      log("claimWeekly failed:", err);
      const reason = String(err?.message || err || "");
      const msg =
        reason === "ALREADY_CLAIMED"
          ? "Weekly claim already used for this week."
          : "Weekly claim failed. Please refresh your holder status and try again.";
      try { tg?.showAlert?.(msg); } catch (_) {}
    } finally {
      renderTokenState((_state || {}).token || {});
    }
  }

  function wireClicks() {
    const back = el("supportBack");
    if (!back || back.__wired) return;
    back.__wired = true;

    back.addEventListener("click", (e) => {
      const tierBtn = e.target.closest("[data-support-tier]");
      if (tierBtn) {
        const tier = String(tierBtn.getAttribute("data-support-tier") || "").trim().toLowerCase();
        if (tier) void handleTierClick(tier);
        return;
      }
    });

    el("supportTokenConnect")?.addEventListener("click", () => { void onConnectClick(); });
    el("supportTokenRefresh")?.addEventListener("click", () => { void onRefreshClick(); });
    el("supportTokenClaim")?.addEventListener("click", () => { void onClaimClick(); });
  }

  function init({ tg, apiPost, dbg } = {}) {
    _tg = tg || _tg;
    _apiPost = apiPost || _apiPost;
    _dbg = !!dbg;
    wireClicks();
    return true;
  }

  async function open() {
    init({});

    const back = el("supportBack");
    const tg = getTg();
    if (!back) {
      try { tg?.openTelegramLink?.(`https://t.me/${BOT_USERNAME}?start=support`); }
      catch (_) { tg?.showAlert?.("Open /support in chat"); }
      return false;
    }

    back.style.display = "flex";
    back.dataset.open = "1";
    document.body.classList.add("ah-sheet-open");
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    try { window.navOpen?.("supportBack"); } catch (_) {}

    setText("supportStarsStatus", "Checking Stars support status...");
    setText("supportTokenStatus", "Token holder support is coming soon.");
    setText("supportTokenPerks", "Support with Stars is live now. Holder cosmetics and weekly support perks will unlock later.");
    setText("supportTokenHint", "Wallet linking, holder refresh, and weekly claim will open when the Believe support token is live.");
    setText("supportCombinedStatus", "Loading support status...");

    try {
      await refreshSupportState();
    } catch (err) {
      log("refreshSupportState failed:", err);
      setText("supportStarsStatus", "Support state unavailable right now.");
      setText("supportTokenStatus", "Unable to load token support state.");
      setText("supportCombinedStatus", "Unable to resolve support status right now.");
    }

    return true;
  }

  window.Support = window.Support || {};
  window.Support.init = init;
  window.Support.open = open;
})();
