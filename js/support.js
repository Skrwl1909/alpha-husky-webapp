// js/support.js - Unified Support Alpha sheet (Stars + Solana holder lane)
(function () {
  let _tg = null;
  let _apiPost = null;
  let _dbg = false;
  let _state = null;
  let _stateLoadedAt = 0;
  let _openingPhantom = false;
  let _howlPayBusy = "";
  let _howlPayPollTimer = null;
  const SUPPORT_STATE_STALE_MS = 30 * 1000;

  function log(...args) {
    if (_dbg) console.log("[Support]", ...args);
  }

  function perfAction(name, startedAt) {
    try { window.__ahPerf?.action?.(name, startedAt); } catch (_) {}
  }

  function getTg() {
    return _tg || window.tg || window.Telegram?.WebApp || null;
  }

  function getApiPost() {
    return _apiPost || window.apiPost || window.S?.apiPost || window.AH?.apiPost || null;
  }

  function openSupportStartAppLink() {
    if (typeof window.openTelegramStartAppLink === "function") {
      return !!window.openTelegramStartAppLink("support");
    }

    const link = typeof window.buildTelegramStartAppLink === "function"
      ? window.buildTelegramStartAppLink("support")
      : "";
    if (!link) return false;

    const tg = getTg();
    try {
      tg?.openTelegramLink?.(link);
      return true;
    } catch (_) {}
    try {
      window.open(link, "_blank", "noopener");
      return true;
    } catch (_) {
      return false;
    }
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

  function signalProductFromSupport(support) {
    const howlpay = support?.howlpay || {};
    const signal = howlpay.signal || {};
    const products = Array.isArray(howlpay.products) ? howlpay.products : [];
    const product = products.find((item) => String(item?.productId || item?.product_id || "").trim() === "howl_signal") || {};
    return { ...product, ...signal, productId: "howl_signal", itemType: "signal", itemKey: "howl_signal" };
  }

  function keepAlphaOnlinePackFromSupport(support) {
    const howlpay = support?.howlpay || {};
    const pack = howlpay.keepAlphaOnlinePack || {};
    const products = Array.isArray(howlpay.products) ? howlpay.products : [];
    const product = products.find((item) => {
      const id = String(item?.productId || item?.product_id || "").trim();
      return id === "keep_alpha_online_pack";
    }) || {};
    return {
      ...product,
      ...pack,
      productId: "keep_alpha_online_pack",
      itemType: "support_pack",
      itemKey: "keep_alpha_online_pack",
    };
  }

  function genesisProductFromSupport(support) {
    const howlpay = support?.howlpay || {};
    const genesis = howlpay.genesisFrame || {};
    const products = Array.isArray(howlpay.products) ? howlpay.products : [];
    const product = products.find((item) => {
      const id = String(item?.productId || item?.product_id || "").trim();
      return id === "genesis_frame";
    }) || {};
    return { ...product, ...genesis, productId: "genesis_frame", itemType: "frame", itemKey: "genesis_frame" };
  }

  function ensureHowlPayStyles() {
    if (document.getElementById("ah-howlpay-support-style")) return;
    const style = document.createElement("style");
    style.id = "ah-howlpay-support-style";
    style.textContent = `
      #supportBack .ah-howlpay-console{
        padding:12px;
        border:1px solid rgba(245,210,146,.18);
        border-radius:8px;
        background:
          radial-gradient(circle at 86% 0%, rgba(190,45,45,.18), transparent 42%),
          linear-gradient(180deg, rgba(15,18,25,.78), rgba(7,9,14,.76));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
      }
      #supportBack .ah-howlpay-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }
      #supportBack .ah-howlpay-title{
        font-size:12px;
        font-weight:900;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:rgba(255,233,194,.88);
      }
      #supportBack .ah-howlpay-live{
        flex:0 0 auto;
        padding:4px 7px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.26);
        color:rgba(230,238,255,.68);
        font-size:10px;
        font-weight:850;
        text-transform:uppercase;
      }
      #supportBack .ah-howlpay-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
        margin-top:10px;
      }
      #supportBack .ah-howlpay-card{
        position:relative;
        overflow:hidden;
        border-radius:8px;
        border:1px solid rgba(255,255,255,.11);
        background:rgba(4,7,12,.54);
        padding:11px;
      }
      #supportBack .ah-howlpay-card::before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:linear-gradient(90deg, transparent, rgba(245,210,146,.10), transparent);
        opacity:.45;
      }
      #supportBack .ah-howlpay-card.is-active{
        border-color:rgba(245,210,146,.34);
        box-shadow:0 0 0 1px rgba(190,45,45,.10), 0 12px 32px rgba(0,0,0,.24);
      }
      #supportBack .ah-howlpay-top{
        position:relative;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }
      #supportBack .ah-howlpay-name{
        display:flex;
        align-items:center;
        gap:8px;
        min-width:0;
        font-weight:900;
        color:rgba(248,250,255,.94);
      }
      #supportBack .ah-signal-icon{
        width:24px;
        height:24px;
        border-radius:999px;
        border:1px solid rgba(245,210,146,.34);
        background:
          radial-gradient(circle at 50% 50%, rgba(245,210,146,.46), transparent 34%),
          rgba(120,24,24,.28);
        box-shadow:0 0 18px rgba(190,45,45,.22);
      }
      #supportBack .ah-signal-icon::after{
        content:"";
        display:block;
        width:10px;
        height:10px;
        margin:6px auto 0;
        border-radius:50%;
        border:2px solid rgba(255,235,194,.82);
        border-left-color:transparent;
        border-bottom-color:transparent;
        transform:rotate(-45deg);
      }
      #supportBack .ah-howlpay-state{
        flex:0 0 auto;
        padding:4px 7px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.055);
        color:rgba(230,238,255,.78);
        font-size:10px;
        font-weight:850;
        text-transform:uppercase;
      }
      #supportBack .ah-howlpay-card.is-active .ah-howlpay-state{
        border-color:rgba(245,210,146,.35);
        color:rgba(255,235,194,.96);
        background:rgba(245,210,146,.09);
      }
      #supportBack .ah-howlpay-desc,
      #supportBack .ah-howlpay-status{
        position:relative;
        margin-top:8px;
        color:rgba(226,235,248,.72);
        font-size:12px;
        line-height:1.36;
        white-space:pre-line;
      }
      #supportBack .ah-howlpay-status{
        color:rgba(255,235,194,.82);
      }
      #supportBack .ah-howlpay-actions{
        position:relative;
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:10px;
      }
      #supportBack .ah-howlpay-actions .ah-action{
        min-height:38px;
        border-radius:8px;
        border-color:rgba(245,210,146,.22);
        background:
          linear-gradient(180deg, rgba(245,210,146,.15), rgba(190,45,45,.08)),
          rgba(0,0,0,.24);
      }
      #supportBack .ah-howlpay-actions .ah-action:disabled{
        opacity:.58;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureHowlPaySection() {
    ensureHowlPayStyles();
    const back = el("supportBack");
    if (!back) return null;
    let section = el("supportHowlPayConsole");
    if (section) return section;
    section = document.createElement("section");
    section.id = "supportHowlPayConsole";
    section.className = "ah-support-section ah-howlpay-console";
    section.innerHTML = `
      <div class="ah-howlpay-head">
        <div>
          <div class="ah-howlpay-title">HOWL Vault</div>
          <div class="ah-howlpay-desc">Real $HOWL support cosmetics. Cosmetic only. No gameplay power.</div>
        </div>
        <div id="supportHowlPayLive" class="ah-howlpay-live">Not live</div>
      </div>
      <div class="ah-howlpay-grid">
        <article class="ah-howlpay-card" data-howlpay-card="keep_alpha_online_pack">
          <div class="ah-howlpay-top">
            <div class="ah-howlpay-name"><span class="ah-signal-icon" aria-hidden="true"></span><span>Keep Alpha Online Pack</span></div>
            <span class="ah-howlpay-state" data-howlpay-state="keep_alpha_online_pack">Locked</span>
          </div>
          <div class="ah-howlpay-desc" data-howlpay-desc="keep_alpha_online_pack">Help keep the Alpha signal online.
Includes Server Signal Frame, Alpha Signal Core aura, and a limited badge.
Cosmetic only. No power. No pay-to-win.</div>
          <div class="ah-howlpay-status" data-howlpay-status="keep_alpha_online_pack">HowlPay is not live yet.</div>
          <div class="ah-howlpay-actions">
            <button class="ah-action" type="button" data-howlpay-product="keep_alpha_online_pack">Support with HOWL</button>
          </div>
        </article>
        <article class="ah-howlpay-card" data-howlpay-card="genesis_frame">
          <div class="ah-howlpay-top">
            <div class="ah-howlpay-name"><span class="ah-signal-icon" aria-hidden="true"></span><span>HOWL Genesis Frame</span></div>
            <span class="ah-howlpay-state" data-howlpay-state="genesis_frame">Locked</span>
          </div>
          <div class="ah-howlpay-desc" data-howlpay-desc="genesis_frame">A treasury support cosmetic frame for your Alpha Husky identity.</div>
          <div class="ah-howlpay-status" data-howlpay-status="genesis_frame">HowlPay is not live yet.</div>
          <div class="ah-howlpay-actions">
            <button class="ah-action" type="button" data-howlpay-product="genesis_frame">Unlock with $HOWL</button>
          </div>
        </article>
        <article class="ah-howlpay-card" data-howlpay-card="howl_signal">
          <div class="ah-howlpay-top">
            <div class="ah-howlpay-name"><span class="ah-signal-icon" aria-hidden="true"></span><span>HOWL Signal</span></div>
            <span class="ah-howlpay-state" data-howlpay-state="howl_signal">Locked</span>
          </div>
          <div class="ah-howlpay-desc" data-howlpay-desc="howl_signal">A treasury-backed identity signal.
It does not make you stronger.
It makes your presence visible.</div>
          <div class="ah-howlpay-status" data-howlpay-status="howl_signal">Signal locked. HowlPay is not live yet.</div>
          <div class="ah-howlpay-actions">
            <button class="ah-action" type="button" data-howlpay-product="howl_signal">Unlock with 500 $HOWL</button>
          </div>
        </article>
      </div>
    `;
    const combined = back.querySelector(".ah-support-combined");
    if (combined?.parentElement) combined.parentElement.insertBefore(section, combined);
    else back.querySelector(".ah-panel-scroll > div")?.appendChild(section);
    return section;
  }

  function renderTopbarWallet(support) {
    const btn = el("supportTopWallet");
    if (!btn) return;

    const token = support?.token || {};
    const tier = Number(token.tier || 0);
    const linked = !!token.linked;
    btn.classList.remove("is-disconnected", "is-linked", "is-holder");
    btn.removeAttribute("title");

    if (tier > 0) {
      btn.textContent = "HOWL ✓";
      btn.dataset.state = "holder";
      btn.classList.add("is-holder");
      btn.setAttribute("aria-label", token.walletDisplay ? `Holder active: ${token.walletDisplay}` : "Holder active");
      return;
    }

    if (linked) {
      btn.textContent = token.walletDisplay || "Wallet Linked";
      btn.dataset.state = "linked";
      btn.classList.add("is-linked");
      btn.setAttribute("aria-label", "Solana wallet linked. Open Support to refresh holder status.");
      return;
    }

    btn.textContent = "Connect Wallet";
    btn.dataset.state = "empty";
    btn.classList.add("is-disconnected");
    btn.setAttribute("aria-label", "Connect Solana Wallet");
  }

  function isTokenLaneEnabled(token) {
    return !!(token && token.enabled !== false && token.comingSoon !== true);
  }

  function isTokenLaneConfigured(token) {
    return !!(token && token.configured !== false);
  }

  function runId(prefix) {
    try { return `${prefix}:${crypto.randomUUID()}`; } catch (_) {}
    return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
  }

  function toLocal(ts) {
    const n = Number(ts || 0);
    if (!n) return "Not checked yet";
    try {
      return new Date(n * 1000).toLocaleString();
    } catch (_) {
      return "Not checked yet";
    }
  }

  function holderRefreshErrorMessage(err) {
    const reason = String(err?.data?.reason || err?.data?.code || err?.message || err || "").trim();
    if (reason === "RPC_TIMEOUT" || reason === "HOLDER_CHECK_TIMEOUT") {
      return "Solana RPC timed out. Your wallet is still linked. Try Refresh Holder Status again.";
    }
    if (reason === "RPC_UNAVAILABLE" || reason === "HOLDER_CHECK_FAILED") {
      return "Solana RPC is unavailable right now. Your wallet is still linked. Try again in a moment.";
    }
    if (reason === "SUPPORT_RPC_NOT_CONFIGURED" || reason === "RPC_NOT_CONFIGURED") {
      return "Holder refresh needs a Solana RPC URL before it can run.";
    }
    if (reason === "TOKEN_MINT_NOT_CONFIGURED") {
      return "Holder refresh is disabled until the HOWL mint is configured.";
    }
    if (reason === "WALLET_NOT_LINKED") {
      return "Connect a Solana wallet before refreshing holder status.";
    }
    return err?.data?.message || "Holder refresh failed. Please try again in a moment.";
  }

  function holderRefreshSuccessMessage(token) {
    const lane = token || {};
    const tier = Number(lane.tier || 0);
    const checkedAt = Number(lane.checkedAt || 0);
    if (tier > 0) return `Wallet checked. HOWL holder active: Tier ${tier}.`;
    if (checkedAt > 0) return "Wallet checked. No HOWL balance found for this wallet.";
    return "Wallet refresh finished.";
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

  function showWalletToast(message) {
    const toast = el("solanaWalletToast");
    if (!toast) {
      try { window.toast?.(message); } catch (_) {}
      return;
    }
    toast.textContent = message || "";
    toast.dataset.show = "1";
    clearTimeout(showWalletToast._timer);
    showWalletToast._timer = setTimeout(() => {
      toast.dataset.show = "0";
    }, 1800);
  }

  async function copyText(text) {
    const value = String(text || "");
    if (!value) return false;

    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {}

    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (_) {
      return false;
    }
  }

  function closeWalletModal() {
    const modal = el("solanaWalletModal");
    if (!modal) return;
    modal.dataset.open = "0";
    modal.style.display = "none";
  }

  function getWalletVerificationUrl() {
    return String(window.location.href || "").trim();
  }

  function getWalletRefOrigin(verificationUrl) {
    try {
      const url = new URL(verificationUrl, window.location.href);
      if (url.origin && url.origin !== "null") return url.origin;
    } catch (_) {}
    return String(window.location.origin || "").trim();
  }

  function buildPhantomBrowseLink(verificationUrl) {
    const url = String(verificationUrl || "").trim();
    if (!url) return "";
    const ref = getWalletRefOrigin(url);
    return `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(ref)}`;
  }

  function ensureWalletSafetyCopy() {
    const modal = el("solanaWalletModal");
    const body = modal?.querySelector?.(".ah-wallet-body");
    if (!body || body.querySelector("[data-wallet-safety-copy]")) return;

    const copy = document.createElement("p");
    copy.dataset.walletSafetyCopy = "1";
    copy.textContent = "This only verifies wallet ownership. No seed phrase. No token transfer.";
    body.appendChild(copy);
  }

  function openInPhantom() {
    if (_openingPhantom) return;
    _openingPhantom = true;

    const phantomUrl = buildPhantomBrowseLink(getWalletVerificationUrl());
    const tg = getTg();
    let opened = false;

    window.setTimeout(() => {
      _openingPhantom = false;
    }, 1200);

    if (!phantomUrl) {
      showWalletToast("Could not prepare wallet link. Use Copy Verification Link.");
      return;
    }

    try {
      if (typeof tg?.openLink === "function") {
        tg.openLink(phantomUrl);
        opened = true;
      }
    } catch (_) {}

    if (!opened) {
      try {
        opened = !!window.open(phantomUrl, "_blank", "noopener,noreferrer");
      } catch (_) {}
    }

    showWalletToast(
      opened
        ? "After signing, return here and tap Refresh Wallet."
        : "Could not open Phantom. Copy the link and open it in Phantom browser."
    );
  }

  function showWalletMissingModal() {
    const modal = el("solanaWalletModal");
    if (!modal) {
      showWalletToast("Open Alpha Husky in Phantom browser or a desktop wallet browser.");
      return;
    }
    ensureWalletSafetyCopy();
    wireWalletModal();
    modal.style.display = "flex";
    modal.dataset.open = "1";
  }

  function wireWalletModal() {
    const modal = el("solanaWalletModal");
    if (!modal || modal.__wired) return;
    modal.__wired = true;

    el("solanaWalletClose")?.addEventListener("click", closeWalletModal);
    el("solanaWalletOpenPhantom")?.addEventListener("click", openInPhantom);
    el("solanaWalletCopyLink")?.addEventListener("click", async () => {
      const ok = await copyText(getWalletVerificationUrl());
      showWalletToast(ok ? "Private verification link copied. Open it in Phantom. Do not share it." : "Could not copy verification link.");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeWalletModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.dataset.open === "1") closeWalletModal();
    });
  }

  async function createStarsInvoice(tier) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    try {
      const apiPost = getApiPost();
      if (!apiPost) throw new Error("NO_API_POST");

      const run_id = runId(`supp_${tier || "x"}`);
      const res = await apiPost("/webapp/support/invoice", { tier, run_id });
      const link = res?.invoiceLink || res?.invoice_link || res?.data?.invoiceLink || "";

      if (!link) throw new Error("NO_INVOICE_LINK");
      return { link, payload: res?.payload || "", run_id };
    } finally {
      perfAction(`support_invoice:${String(tier || "")}`, perfT0);
    }
  }

  async function refreshProfileViews() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    try {
      try { await window.loadProfile?.(); } catch (_) {}
      try { window.renderTopbar?.(); } catch (_) {}
      try { window.paintBuffs?.(); } catch (_) {}
      try { await window.loadPlayerState?.(); } catch (_) {}
    } finally {
      perfAction("support_refresh_profile_views", perfT0);
    }
  }

  async function refreshSupportState(opts = {}) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    try {
      const { force = false, reason = "auto" } = opts || {};
      if (!force && _state && _stateLoadedAt && (Date.now() - _stateLoadedAt) < SUPPORT_STATE_STALE_MS) {
        log("skip supporter/state; fresh cache", { reason, ageMs: Math.max(0, Date.now() - _stateLoadedAt) });
        renderState(_state, opts);
        return _state;
      }

      const apiPost = getApiPost();
      if (!apiPost) throw new Error("NO_API_POST");

      const out = await apiPost("/webapp/supporter/state", {});
      if (!out || out.ok === false) throw new Error(out?.reason || "SUPPORT_STATE_FAILED");

      _state = out.support || {};
      _stateLoadedAt = Date.now();
      renderState(_state, opts);
      return _state;
    } finally {
      perfAction("support_state", perfT0);
    }
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
      setText("supportStarsStatus", `Stars lane active. ${parts.join(" | ")}`);
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
    const supportBack = el("supportBack");
    if (supportBack) {
      const laneTier = Number(lane.tier || 0);
      supportBack.classList.toggle("has-holder-active", !!(lane.linked && laneTier > 0));
      supportBack.classList.toggle("has-holder-linked", !!(lane.linked && laneTier <= 0));
      supportBack.classList.toggle("has-holder-claim", !!lane.weeklyClaimAvailable);
    }

    if (!isTokenLaneEnabled(lane)) {
      setText("supportTokenStatus", lane.message || "Believe holder lane is in preparation.");
      setText(
        "supportTokenPerks",
        lane.detail || "Stars support is live now. Holder cosmetics and weekly claim activate at mint launch."
      );
      setText(
        "supportTokenHint",
        lane.hint || "Stars support is fully live today."
      );

      const connectBtn = el("supportTokenConnect");
      if (connectBtn) connectBtn.textContent = "Preparing Lane";
      setDisabled("supportTokenConnect", true);
      setDisabled("supportTokenRefresh", true);
      setDisabled("supportTokenClaim", true);
      setDisabled("supportTokenDisconnect", true);
      setVisible("supportTokenRefresh", false);
      setVisible("supportTokenClaim", false);
      setVisible("supportTokenDisconnect", false);
      return;
    }

    if (!isTokenLaneConfigured(lane)) {
      const walletLabel = lane.walletDisplay || "Not linked";
      setText(
        "supportTokenStatus",
        lane.linked
          ? `Wallet linked: ${walletLabel}. Holder checks are queued for mint activation.`
          : (lane.message || "Holder checks are queued for mint activation.")
      );
      setText(
        "supportTokenPerks",
        lane.detail || "Connect Solana Wallet and sign message now. Holder checks and weekly claim unlock when mint is live."
      );
      setText(
        "supportTokenHint",
        lane.hint || "For Solana holder verification and rewards: Open Support -> Connect Solana Wallet -> Sign message -> Refresh Holder Status -> Claim Weekly Reward if eligible."
      );

      const connectBtn = el("supportTokenConnect");
      setDisabled("supportTokenConnect", false);
      if (connectBtn) connectBtn.textContent = lane.linked ? "Reconnect Solana Wallet" : "Connect Solana Wallet";
      setVisible("supportTokenRefresh", true);
      setVisible("supportTokenClaim", !!lane.linked);
      setVisible("supportTokenDisconnect", !!lane.linked);
      setDisabled("supportTokenRefresh", true);
      setDisabled("supportTokenClaim", true);
      setDisabled("supportTokenDisconnect", !lane.linked);
      return;
    }

    const wallet = lane.walletDisplay || "Not linked";
    const tier = Number(lane.tier || 0);
    const checkedAt = Number(lane.checkedAt || 0);
    const checked = toLocal(checkedAt);
    const rewardName = lane.weeklyRewardName || "Holder Echo Pack";
    const claim = lane.weeklyClaimAvailable ? `${rewardName} ready.` : (lane.claimedWeekKey ? `${rewardName} claimed for ${lane.claimedWeekKey}.` : `${rewardName} locked.`);

    if (lane.linked) {
      let statusText = `Connected: ${wallet} | Not checked yet`;
      if (tier > 0) {
        statusText = `Holder active: ${wallet} | Tier ${tier} | Balance raw: ${lane.balanceRaw || "0"} | Last check: ${checked}`;
      } else if (checkedAt > 0) {
        statusText = `Connected: ${wallet} | Not holder | Balance raw: ${lane.balanceRaw || "0"} | Last check: ${checked}`;
      }
      setText("supportTokenStatus", statusText);
    } else {
      setText(
        "supportTokenStatus",
        "No Solana wallet linked yet. Connect Solana Wallet, sign message, then Refresh Holder Status."
      );
    }

    const perks = [];
    if (lane.badge) perks.push(`Badge: ${lane.badge}`);

    const frameOptions = Array.isArray(lane.frameOptions) ? lane.frameOptions : [];
    if (frameOptions.length) {
      const ownedFrames = frameOptions
        .map((opt) => String(opt?.key || opt?.name || "").trim())
        .filter(Boolean);
      if (ownedFrames.length) perks.push(`Owned frames: ${ownedFrames.join(", ")}`);
    }

    if (lane.frame && lane.frameUrl) perks.push(`Active frame: ${lane.frame}`);
    if (lane.skin) perks.push(`Tier 3 skin: ${lane.skin}`);
    if (!perks.length) perks.push("Perks unlock by holder tier only.");
    perks.push(claim);
    setText("supportTokenPerks", perks.join(" | "));

    const provider = getSolanaProvider();
    const providerAddr =
      provider?.publicKey?.toString?.() ||
      provider?.publicKey?.toBase58?.() ||
      "";

    if (!provider) {
      setText(
        "supportTokenHint",
        "No injected Solana wallet detected. Open Alpha Husky in Phantom or a browser with a Solana wallet extension, then tap Connect Solana Wallet."
      );
    } else if (lane.linked && providerAddr && providerAddr === lane.wallet) {
      setText(
        "supportTokenHint",
        "This wallet is already linked. To relink to a different wallet, switch accounts inside Phantom first, then tap reconnect."
      );
    } else if (lane.linked) {
      setText("supportTokenHint", "Wallet ownership is verified by signed message. Refresh Holder Status, then claim weekly reward if eligible.");
    } else {
      setText("supportTokenHint", "Tap Connect Solana Wallet to sign a short ownership message, then tap Refresh Holder Status.");
    }

    const connectBtn = el("supportTokenConnect");
    setDisabled("supportTokenConnect", false);
    if (connectBtn) connectBtn.textContent = lane.linked ? "Reconnect Solana Wallet" : "Connect Solana Wallet";

    setVisible("supportTokenRefresh", true);
    setDisabled("supportTokenRefresh", !lane.linked);
    const claimBtn = el("supportTokenClaim");
    if (claimBtn) claimBtn.textContent = lane.weeklyClaimAvailable ? `Claim ${rewardName}` : "Weekly Claim";
    setDisabled("supportTokenClaim", !lane.weeklyClaimAvailable);
    setVisible("supportTokenClaim", !!lane.linked);
    setVisible("supportTokenDisconnect", !!lane.linked);
    setDisabled("supportTokenDisconnect", !lane.linked);
  }

  function productStatusText(product, howlpay) {
    const item = product || {};
    if (item.active) {
      return item.statusText || (item.productId === "howl_signal" ? "Your HOWL Signal is now visible across the Pack." : "Unlocked.");
    }
    if (item.owned) return "Owned. Cosmetic identity only.";
    if (!item.configured) return "Planned. Price env is not configured yet.";
    if (!howlpay?.paymentEnabled && !howlpay?.enabled) return "HowlPay is not live yet.";
    return "Ready when you choose to unlock.";
  }

  function renderHowlPayCard(product, howlpay) {
    const item = product || {};
    const productId = String(item.productId || item.product_id || "").trim();
    if (!productId) return;
    const card = document.querySelector(`[data-howlpay-card="${productId}"]`);
    const state = document.querySelector(`[data-howlpay-state="${productId}"]`);
    const desc = document.querySelector(`[data-howlpay-desc="${productId}"]`);
    const status = document.querySelector(`[data-howlpay-status="${productId}"]`);
    const btn = document.querySelector(`[data-howlpay-product="${productId}"]`);
    const active = !!item.active;
    const owned = !!item.owned;
    const configured = item.configured !== false;
    const paymentEnabled = !!(howlpay?.paymentEnabled || howlpay?.enabled);
    const busy = _howlPayBusy === productId;

    if (card) {
      card.classList.toggle("is-active", active || owned);
      card.classList.toggle("is-locked", !active && !owned);
    }
    if (state) {
      state.textContent = active ? (item.statusTitle || "Active") : (owned ? "Owned" : "Locked");
    }
    if (desc && item.description) desc.textContent = item.description;
    if (status) status.textContent = busy ? "Preparing payment..." : productStatusText(item, howlpay);
    if (btn) {
      btn.textContent = busy
        ? "Preparing..."
        : (owned || active)
          ? (active ? "Active" : "Owned")
          : (item.ctaLabel || (productId === "howl_signal" ? "Unlock with 500 $HOWL" : (productId === "keep_alpha_online_pack" ? "Support with HOWL" : "Unlock with $HOWL")));
      btn.disabled = !!(busy || owned || active || !configured || !paymentEnabled);
      btn.title = !paymentEnabled ? "HowlPay is not live yet." : "";
    }
  }

  function renderHowlPayState(support) {
    const section = ensureHowlPaySection();
    if (!section) return;
    const howlpay = support?.howlpay || {};
    const live = el("supportHowlPayLive");
    if (live) live.textContent = (howlpay.paymentEnabled || howlpay.enabled) ? "Private test" : "Not live";
    renderHowlPayCard(keepAlphaOnlinePackFromSupport(support), howlpay);
    renderHowlPayCard(genesisProductFromSupport(support), howlpay);
    renderHowlPayCard(signalProductFromSupport(support), howlpay);
  }

  function renderCombinedState(support) {
    const stars = support?.stars || {};
    const token = support?.token || {};
    const combined = support?.combined || {};
    const tokenEnabled = isTokenLaneEnabled(token);
    const tokenConfigured = isTokenLaneConfigured(token);

    if (tokenEnabled && !tokenConfigured) {
      setText("supportCombinedStatus", "Stars support is live. Token holder lane is staged and waiting for mint activation.");
      setText("supportCombinedPerks", "Wallet linking is available now. Holder tier and cosmetics unlock after mint activation and holder refresh.");
      return;
    }

    if (tokenEnabled && combined.dualSupporter) {
      setText(
        "supportCombinedStatus",
        `Dual supporter active. Stars lane and Believe holder lane are both live, with resolved status tag "${combined.resolvedTag || "dual_supporter"}".`
      );
      setText(
        "supportCombinedPerks",
        `Stars tier: ${stars.tierKey || "active"} | Token tier: ${token.tier || 0} | Weekly claim: ${token.weeklyClaimAvailable ? "ready" : "not ready"}`
      );
      return;
    }

    if (stars.active) {
      setText(
        "supportCombinedStatus",
        tokenEnabled
          ? "Stars-only supporter. Telegram native support is active."
          : "Stars-only supporter. Telegram native support is active, and Believe holder lane is in preparation."
      );
      setText("supportCombinedPerks", `Resolved Stars tier: ${stars.tierKey || "supporter"}.`);
      return;
    }

    if (tokenEnabled && Number(token.tier || 0) > 0) {
      setText("supportCombinedStatus", "Token-only supporter. Believe holder lane is active.");
      setText("supportCombinedPerks", `Holder tier: ${token.tier || 0} | Weekly claim: ${token.weeklyClaimAvailable ? "ready" : "not ready"}.`);
      return;
    }

    if (!tokenEnabled) {
      setText("supportCombinedStatus", "Stars support is live now. Believe holder lane is in preparation.");
      setText("supportCombinedPerks", "Telegram Stars remains active while holder checks and cosmetics are being finalized for launch.");
      return;
    }

    setText("supportCombinedStatus", "No active support lane yet.");
    setText("supportCombinedPerks", "Users can be Stars-only, token-only, or dual supporters under this unified flow.");
  }

  function renderState(support) {
    ensureHowlPaySection();
    renderStarsState(support?.stars || {});
    renderTokenState(support?.token || {});
    renderHowlPayState(support || {});
    renderCombinedState(support || {});
    renderTopbarWallet(support || {});
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
            try { await refreshSupportState({ force: true, reason: "stars_paid" }); } catch (_) {}
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
      const deep = window.buildTelegramBotStartLink?.(`support_${String(tier || "")}`) || "";
      if (deep) {
        try { tg?.openTelegramLink?.(deep); return; } catch (_) {}
      }
      try { tg?.showAlert?.("Open /support in chat"); } catch (_) {}
    }
  }

  async function linkSolanaWallet() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
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
      try {
        await refreshHolderStatus({ silent: true });
      } catch (refreshErr) {
        log("initial holder refresh failed after link:", refreshErr);
        try { await refreshSupportState({ force: true, reason: "link_fallback" }); } catch (_) {}
      }
      await refreshProfileViews();
      try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      return res;
    } finally {
      perfAction("support_link_wallet", perfT0);
    }
  }

  async function refreshHolderStatus(opts = {}) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("NO_API_POST");

    const res = await apiPost("/webapp/supporter/refresh", { run_id: runId("supporter_refresh") });
    if (!res || res.ok === false) throw new Error(res?.reason || "REFRESH_FAILED");

    try {
      _state = res.support || _state || {};
      _stateLoadedAt = Date.now();
      renderState(_state);
      if (!opts.silent) await refreshProfileViews();
      return res;
    } finally {
      perfAction("support_refresh_holder_status", perfT0);
    }
  }

  async function claimWeekly() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const apiPost = getApiPost();
    const tg = getTg();
    if (!apiPost) throw new Error("NO_API_POST");

    const res = await apiPost("/webapp/supporter/claim", { run_id: runId("supporter_claim") });
    if (!res || res.ok === false) throw new Error(res?.reason || "CLAIM_FAILED");

    try {
      _state = res.support || _state || {};
      _stateLoadedAt = Date.now();
      renderState(_state);
      await refreshProfileViews();
      try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      try { tg?.showAlert?.(`${res?.rewardName || "Holder Echo Pack"} claimed. +${res?.reward?.amount || 0} bones.`); } catch (_) {}
      return res;
    } finally {
      perfAction("support_claim_weekly", perfT0);
    }
  }

  async function disconnectWallet() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const apiPost = getApiPost();
    const tg = getTg();
    if (!apiPost) throw new Error("NO_API_POST");

    const res = await apiPost("/webapp/supporter/unlink", { run_id: runId("supporter_unlink") });
    if (!res || res.ok === false) throw new Error(res?.reason || "UNLINK_FAILED");

    try {
      _state = res.support || _state || {};
      _stateLoadedAt = Date.now();
      renderState(_state);
      await refreshProfileViews();
      try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      return res;
    } finally {
      perfAction("support_disconnect_wallet", perfT0);
    }
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
      try { tg?.showAlert?.("Believe holder lane is in preparation. Stars support is fully live now."); } catch (_) {}
      return;
    }
    if (!getSolanaProvider()) {
      showWalletMissingModal();
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
      try { tg?.showAlert?.("Believe holder lane is in preparation. Stars support is fully live now."); } catch (_) {}
      return;
    }
    let failMsg = "";
    try {
      setButtonBusy("supportTokenRefresh", true, "Refreshing...", "Refresh Holder Status");
      const res = await refreshHolderStatus();
      showWalletToast(holderRefreshSuccessMessage(res?.support?.token || _state?.token || {}));
    } catch (err) {
      log("refreshHolderStatus failed:", err);
      failMsg = holderRefreshErrorMessage(err);
      try { tg?.showAlert?.(failMsg); } catch (_) {}
    } finally {
      setButtonBusy("supportTokenRefresh", false, null, "Refresh Holder Status");
      renderTokenState((_state || {}).token || {});
      if (failMsg) setText("supportTokenHint", failMsg);
    }
  }

  async function onClaimClick() {
    const tg = getTg();
    if (!isTokenLaneEnabled((_state || {}).token || {})) {
      try { tg?.showAlert?.("Believe holder lane is in preparation. Stars support is fully live now."); } catch (_) {}
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
          : (reason === "TOKEN_MINT_NOT_CONFIGURED")
            ? "Weekly claim is disabled until token mint config is set."
          : "Weekly claim failed. Please refresh your holder status and try again.";
      try { tg?.showAlert?.(msg); } catch (_) {}
    } finally {
      renderTokenState((_state || {}).token || {});
    }
  }

  async function onDisconnectClick() {
    const tg = getTg();
    try {
      setButtonBusy("supportTokenDisconnect", true, "Disconnecting...", "Disconnect Wallet");
      await disconnectWallet();
    } catch (err) {
      log("disconnectWallet failed:", err);
      try { tg?.showAlert?.("Wallet disconnect failed. Please try again."); } catch (_) {}
    } finally {
      renderTokenState((_state || {}).token || {});
    }
  }

  function openHowlPayUrl(url) {
    const link = String(url || "").trim();
    if (!link) return false;
    const tg = getTg();
    try {
      if (typeof tg?.openLink === "function") {
        tg.openLink(link);
        return true;
      }
    } catch (_) {}
    try {
      window.open(link, "_blank", "noopener,noreferrer");
      return true;
    } catch (_) {
      return false;
    }
  }

  async function pollHowlPayStatus(paymentId, productId, attempt = 0) {
    const apiPost = getApiPost();
    const pid = String(productId || "").trim();
    const status = document.querySelector(`[data-howlpay-status="${pid}"]`);
    if (!apiPost || !paymentId || attempt > 18) {
      _howlPayPollTimer = null;
      return;
    }
    try {
      const out = await apiPost("/webapp/howlpay/status", { payment_id: paymentId });
      if (out?.status === "completed" || out?.unlocked) {
        if (status) status.textContent = pid === "howl_signal"
          ? "Signal Active. Your HOWL Signal is now visible across the Pack."
          : (pid === "keep_alpha_online_pack"
            ? "Signal strengthened. Your support cosmetic has been unlocked. Thank you for helping keep Alpha online."
            : "Unlocked. Refreshing identity.");
        _howlPayBusy = "";
        await refreshSupportState({ silent: true, force: true, reason: "howlpay_completed" }).catch(() => {});
        await refreshProfileViews();
        try { getTg()?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
        return;
      }
      if (out?.status === "expired") {
        if (status) status.textContent = "Payment expired. Start a new unlock when HowlPay is live.";
        _howlPayBusy = "";
        renderHowlPayState(_state || {});
        return;
      }
      if (status) status.textContent = "Waiting for confirmed HOWL payment...";
    } catch (err) {
      if (status) status.textContent = err?.data?.reason === "HOWLPAY_DISABLED"
        ? "HowlPay is not live yet."
        : "Payment check unavailable. Try again shortly.";
      _howlPayBusy = "";
      renderHowlPayState(_state || {});
      return;
    }
    _howlPayPollTimer = window.setTimeout(() => {
      void pollHowlPayStatus(paymentId, pid, attempt + 1);
    }, 3000);
  }

  async function onHowlPayProductClick(productId) {
    const apiPost = getApiPost();
    const tg = getTg();
    const pid = String(productId || "").trim();
    const support = _state || {};
    const howlpay = support.howlpay || {};
    const product = pid === "howl_signal"
      ? signalProductFromSupport(support)
      : (pid === "keep_alpha_online_pack" ? keepAlphaOnlinePackFromSupport(support) : genesisProductFromSupport(support));
    const status = document.querySelector(`[data-howlpay-status="${pid}"]`);

    if (!apiPost) return;
    if (!howlpay.enabled && !howlpay.paymentEnabled) {
      if (status) status.textContent = "HowlPay is not live yet.";
      try { tg?.showAlert?.("HowlPay is not live yet."); } catch (_) {}
      return;
    }
    if (product?.owned || product?.active) {
      if (status) status.textContent = productStatusText(product, howlpay);
      return;
    }

    _howlPayBusy = pid;
    renderHowlPayState(support);
    let keepStatus = false;
    try {
      const out = await apiPost("/webapp/howlpay/init", {
        product_id: pid,
        item_type: product.itemType || product.item_type || (pid === "howl_signal" ? "signal" : (pid === "keep_alpha_online_pack" ? "support_pack" : "frame")),
        item_key: product.itemKey || product.item_key || pid,
      });
      if (out?.already_owned) {
        _howlPayBusy = "";
        if (status) status.textContent = pid === "howl_signal" ? "Signal Active." : (pid === "keep_alpha_online_pack" ? "Support cosmetic already unlocked." : "Already owned.");
        await refreshSupportState({ silent: true, force: true, reason: "howlpay_already_owned" }).catch(() => {});
        await refreshProfileViews();
        return;
      }
      const opened = openHowlPayUrl(out?.payment_url || out?.paymentUrl);
      if (status) status.textContent = opened
        ? "Payment opened. Confirm in your wallet, then return here."
        : "Payment prepared. Open the wallet link from your Solana wallet.";
      if (_howlPayPollTimer) window.clearTimeout(_howlPayPollTimer);
      keepStatus = true;
      void pollHowlPayStatus(out?.payment_id || out?.paymentId, pid);
    } catch (err) {
      const reason = String(err?.data?.reason || err?.message || "").trim();
      const msg =
        reason === "HOWLPAY_DISABLED"
          ? "HowlPay is not live yet."
          : reason === "CONFIG_MISSING"
            ? "This unlock is not configured yet."
            : "Could not prepare HowlPay unlock.";
      if (status) status.textContent = msg;
      try { tg?.showAlert?.(msg); } catch (_) {}
    } finally {
      if (_howlPayBusy === pid) _howlPayBusy = "";
      if (!keepStatus) renderHowlPayState(_state || {});
    }
  }

  function wireTopbarButton() {
    const btn = el("supportTopWallet");
    if (!btn || btn.__supportWired) return;
    btn.__supportWired = true;
    btn.addEventListener("click", () => { void open(); });
  }

  function wireClicks() {
    wireTopbarButton();

    const back = el("supportBack");
    if (!back || back.__wired) return;
    back.__wired = true;

    back.addEventListener("click", (e) => {
      const howlPayBtn = e.target.closest("[data-howlpay-product]");
      if (howlPayBtn) {
        const productId = String(howlPayBtn.getAttribute("data-howlpay-product") || "").trim();
        if (productId) void onHowlPayProductClick(productId);
        return;
      }

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
    el("supportTokenDisconnect")?.addEventListener("click", () => { void onDisconnectClick(); });
  }

  function init({ tg, apiPost, dbg } = {}) {
    _tg = tg || _tg;
    _apiPost = apiPost || _apiPost;
    _dbg = !!dbg;
    wireClicks();
    renderTopbarWallet(_state || {});
    if (!_state && getApiPost()) {
      void refreshSupportState({ reason: "init" }).catch((err) => log("initial support state failed:", err));
    }
    return true;
  }

  async function open() {
    init({});

    const back = el("supportBack");
    if (!back) {
      const opened = openSupportStartAppLink();
      if (!opened) {
        try { getTg()?.showAlert?.("Open Support from Alpha Husky bot."); } catch (_) {}
      }
      return false;
    }

    back.style.display = "flex";
    back.dataset.open = "1";
    document.body.classList.add("ah-sheet-open");
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    try { window.navOpen?.("supportBack"); } catch (_) {}

    setText("supportStarsStatus", "Checking Stars support status...");
    setText("supportTokenStatus", "Believe holder lane is in preparation.");
    setText("supportTokenPerks", "Stars support is live now. Solana holder checks and weekly claim activate with the live mint rollout.");
    setText("supportTokenHint", "Connect Solana Wallet. Phantom recommended. This only verifies wallet ownership. No seed phrase. No token transfer.");
    setText("supportCombinedStatus", "Loading support status...");

    try {
      await refreshSupportState({ reason: "open" });
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

