// js/support.js — Support sheet + Stars invoice (WebApp)
// - requires: window.apiPost (or pass apiPost in init) + Telegram.WebApp
// - endpoint: POST /webapp/support/invoice  { tier, run_id }
// - response: { ok:true, invoiceLink, payload? }

(function () {
  let _tg = null;
  let _apiPost = null;
  let _dbg = false;

  const BOT_USERNAME = "Alpha_husky_bot";

  function log(...a) { if (_dbg) console.log("[Support]", ...a); }

  function getTg() {
    return _tg || window.tg || window.Telegram?.WebApp || null;
  }

  function getApiPost() {
    return (
      _apiPost ||
      window.apiPost ||
      window.S?.apiPost ||
      window.AH?.apiPost ||
      null
    );
  }

  function makeRunId(tier) {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 8);
    return `supp_${String(tier || "x")}_${t}_${r}`;
  }

  async function createInvoice(tier) {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("NO_API_POST");

    const run_id = makeRunId(tier);
    const res = await apiPost("/webapp/support/invoice", { tier, run_id });

    const link =
      res?.invoiceLink ||
      res?.invoice_link ||
      res?.data?.invoiceLink ||
      "";

    if (!link) throw new Error("NO_INVOICE_LINK");
    return { link, payload: res?.payload || "", run_id };
  }

  async function refreshAfterPaid() {
    // najlepiej: odśwież profil (tag + frame) i topbar
    try { await window.loadProfile?.(); } catch (_) {}
    try { window.renderTopbar?.(); } catch (_) {}
    try { window.paintBuffs?.(); } catch (_) {}
    // jeśli u Ciebie loadProfile nie istnieje w danym buildzie, to przynajmniej to:
    try { await window.loadPlayerState?.(); } catch (_) {}
  }

  async function handleTierClick(tier) {
    const tg = getTg();
    try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

    // 1) Stars invoice (preferred)
    try {
      const { link } = await createInvoice(tier);

      if (typeof tg?.openInvoice === "function") {
        tg.openInvoice(link, async (status) => {
          log("openInvoice status:", status);

          if (status === "paid") {
            try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
            await refreshAfterPaid();
            try { tg?.showAlert?.("✅ Support unlocked. Thank you, Howler."); } catch (_) {}
          } else if (status === "cancelled") {
            try { tg?.showAlert?.("Payment cancelled."); } catch (_) {}
          } else if (status === "failed") {
            try { tg?.showAlert?.("Payment failed."); } catch (_) {}
          } else {
            // pending/unknown -> nic
          }
        });
        return;
      }

      // jeśli klient nie ma openInvoice, lecimy fallback
      throw new Error("NO_OPENINVOICE");
    } catch (e) {
      log("Invoice flow failed -> fallback to bot /start", e);

      // 2) fallback: bot /start support_<tier>
      const deep = `https://t.me/${BOT_USERNAME}?start=support_${encodeURIComponent(String(tier || ""))}`;
      try { tg?.openTelegramLink?.(deep); }
      catch (_) { tg?.showAlert?.("Open /support in chat"); }
    }
  }

  function wireClicks() {
    const back = document.getElementById("supportBack");
    if (!back || back.__wired) return;
    back.__wired = true;

    back.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-support-tier]");
      if (!btn) return;

      const tier = (btn.getAttribute("data-support-tier") || "").trim().toLowerCase();
      if (!tier) return;

      handleTierClick(tier);
    });
  }

  function init({ tg, apiPost, dbg } = {}) {
    _tg = tg || _tg;
    _apiPost = apiPost || _apiPost;
    _dbg = !!dbg;
    wireClicks();
  }

  function open() {
    init({});
    const back = document.getElementById("supportBack");
    const tg = getTg();

    if (back) {
      back.style.display = "flex";
      back.dataset.open = "1";
      try { window.navOpen?.("supportBack"); } catch (_) {}

      // lock scroll (jak inne sheet’y)
      document.body.classList.add("ah-sheet-open");
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return true;
    }

    // fallback jeśli modal nie istnieje
    try { tg?.openTelegramLink?.(`https://t.me/${BOT_USERNAME}?start=support`); }
    catch (_) { tg?.showAlert?.("Open /support in chat"); }
    return false;
  }

  window.Support = window.Support || {};
  window.Support.init = init;
  window.Support.open = open;
})();
