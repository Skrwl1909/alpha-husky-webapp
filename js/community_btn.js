(() => {
  if (window.__AH_COMMUNITY_BTN_INIT__) return;
  window.__AH_COMMUNITY_BTN_INIT__ = true;

  const TG_COMMUNITY_URL = "https://t.me/The_Alpha_husky";

  const FULLSCREEN_MODAL_IDS = [
    "missionsBack",
    "siegeBack",
    "inventoryBack",
    "factionHQBack",
    "questsBack",
    "skinsBack",
    "petsBack",
    "forgeBack",
    "shopBack",
    "adoptBack",
    "referralsBack",
    "updatesBack",
    "statsBack",
    "equippedBack",
    "fortressBack",
    "dojoBack",
    "lockedBack",
    "charBack",
    "mapBack",
    "faqModal"
  ];

  const GENERIC_OPEN_SELECTORS = [
    ".map-back",
    ".q-modal",
    ".sheet-back",
    ".locked-back",
    ".faq-modal:not([hidden])",
    ".modal-backdrop.show",
    ".sheet-backdrop.show",
    ".overlay.show",
    ".fullscreen-modal.show",
    "[data-fullscreen-modal='true']"
  ];

  function getBtn() {
    return document.getElementById("ahCommunityBtn");
  }

  function getTG() {
    return window.Telegram?.WebApp || null;
  }

  function isVisible(el) {
    if (!el) return false;

    const cs = window.getComputedStyle(el);
    if (cs.display === "none") return false;
    if (cs.visibility === "hidden") return false;
    if (cs.opacity === "0") return false;
    if (el.hidden) return false;

    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function anyFullscreenModalOpen() {
    for (const id of FULLSCREEN_MODAL_IDS) {
      const el = document.getElementById(id);
      if (isVisible(el)) return true;
    }

    for (const sel of GENERIC_OPEN_SELECTORS) {
      const nodes = document.querySelectorAll(sel);
      for (const el of nodes) {
        if (isVisible(el)) return true;
      }
    }

    return false;
  }

  function showBtn() {
    const btn = getBtn();
    if (!btn) return;
    btn.classList.remove("is-hidden");
  }

  function hideBtn() {
    const btn = getBtn();
    if (!btn) return;
    btn.classList.add("is-hidden");
  }

  function syncBtn() {
    const btn = getBtn();
    if (!btn) return;

    if (anyFullscreenModalOpen()) hideBtn();
    else showBtn();
  }

  function openCommunity() {
    const tg = getTG();

    try {
      tg?.HapticFeedback?.impactOccurred?.("light");
    } catch (_) {}

    try {
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(TG_COMMUNITY_URL);
        return;
      }
    } catch (_) {}

    try {
      window.open(TG_COMMUNITY_URL, "_blank", "noopener,noreferrer");
    } catch (_) {
      window.location.href = TG_COMMUNITY_URL;
    }
  }

  function bindClick() {
    const btn = getBtn();
    if (!btn || btn.dataset.bound === "1") return;

    btn.dataset.bound = "1";
    btn.addEventListener("click", openCommunity);
  }

  function exposeHelpers() {
    window.showAhCommunityBtn = showBtn;
    window.hideAhCommunityBtn = hideBtn;
    window.syncAhCommunityBtn = syncBtn;
  }

  function startObserver() {
    if (!document.body) return;

    const observer = new MutationObserver(() => {
      syncBtn();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden", "open", "aria-hidden"]
    });

    window.__AH_COMMUNITY_BTN_OBSERVER__ = observer;
  }

  function init() {
    bindClick();
    exposeHelpers();
    startObserver();

    window.addEventListener("resize", syncBtn);
    window.addEventListener("orientationchange", syncBtn);

    requestAnimationFrame(syncBtn);
    setTimeout(syncBtn, 80);
    setTimeout(syncBtn, 300);
    setTimeout(syncBtn, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
