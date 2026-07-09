// js/home_nav.js - BottomNav + Sheets router (integrates with window.navOpen/navClose/navCloseTop)
// - Quests uses your existing #quests-launcher (wired by quests.js)
// - Sheets (hubBack/charBack/shareBack) are compatible with Telegram BackButton stack
// - BackButton closes our sheets AND unlocks body scroll (patches navCloseTop)

(function () {
  if (window.__ahLegacyHomeNavBound) {
    return;
  }
  if (window.__ahHomeNavBound) {
    return;
  }
  window.__ahHomeNavBound = true;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const HUB_ICON_MAP = Object.freeze({
    shop: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590700/alpha_ui/icons/hub-icons/shop.webp",
    support: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590704/alpha_ui/icons/hub-icons/support.webp",
    faq: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590699/alpha_ui/icons/hub-icons/faq.webp",
    adopt: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590699/alpha_ui/icons/hub-icons/adopt.webp",
    arena: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590699/alpha_ui/icons/hub-icons/arena.webp",
    referrals: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590700/alpha_ui/icons/hub-icons/referrals.webp",
    howlboard: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590699/alpha_ui/icons/hub-icons/howlboard.webp",
    profile: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590700/alpha_ui/icons/hub-icons/profile.webp",
    mailbox: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590700/alpha_ui/icons/hub-icons/mailbox.webp",
    whats_new: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590704/alpha_ui/icons/hub-icons/whats_new.webp",
    add_home: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590699/alpha_ui/icons/hub-icons/add_home.webp",
    share: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783590700/alpha_ui/icons/hub-icons/share.webp"
  });

  const HUB_ICON_ID_ALIASES = Object.freeze({
    whatsnew: "whats_new",
    add_to_home: "add_home"
  });

  function normalizeHubIconId(value) {
    const id = String(value || "").trim().toLowerCase();
    return HUB_ICON_ID_ALIASES[id] || id;
  }

  function renderHubIcon(tileId) {
    const src = HUB_ICON_MAP[normalizeHubIconId(tileId)];

    if (!src) {
      return '<span class="ah-hub-icon-fallback" aria-hidden="true">&bull;</span>';
    }

    return `
      <img
        class="ah-hub-icon-img"
        src="${src}"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
    `;
  }

  function hydrateHubIcons() {
    $$("#hubBack .ah-grid .ah-tile:not([data-campaign-tile])").forEach((tile) => {
      const icon = Array.from(tile.children).find((child) => child.classList?.contains("ah-hub-tile-icon"));
      if (!icon) return;
      icon.innerHTML = renderHubIcon(tile.dataset.hubIcon || tile.dataset.action);
    });
  }

  const IS_OUR_SHEET = (id) => id === "hubBack" || id === "charBack" || id === "shareBack" || id === "supportBack" || id === "statsBack";

  function setBodyLock(on) {
    document.body.classList.toggle("ah-sheet-open", !!on);
    document.body.style.overflow = on ? "hidden" : "";
    document.body.style.touchAction = on ? "none" : "";
  }

  function anyOurSheetOpen() {
    return ["hubBack", "charBack", "shareBack", "supportBack", "statsBack"].some((id) => {
      const el = document.getElementById(id);
      return el && el.style.display !== "none" && el.dataset.open === "1";
    });
  }

  function navOpenId(id) {
    try { window.navOpen?.(id); } catch (_) {}
  }
  function navCloseId(id) {
    try { window.navClose?.(id); } catch (_) {}
  }

  function openBack(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.display = "flex";
    el.dataset.open = "1";
    setBodyLock(true);
    navOpenId(id);
  }

  function closeBack(id) {
    const el = document.getElementById(id);
    if (!el) return;

    if (id === "shareBack" && typeof window.ShareCard?.hide === "function") {
      window.ShareCard.hide();
      delete el.dataset.open;
      if (!anyOurSheetOpen()) setBodyLock(false);
      return;
    }

    el.style.display = "none";
    delete el.dataset.open;
    navCloseId(id);

    if (!anyOurSheetOpen()) setBodyLock(false);
  }

  function closeAllBacks() {
    ["hubBack", "charBack", "shareBack", "supportBack", "statsBack"].forEach(closeBack);
    setBodyLock(false);
  }

  function wireBackdropClose(id) {
    const back = document.getElementById(id);
    if (!back) return;
    back.addEventListener("click", (e) => {
      if (e.target === back) closeBack(id);
    });
  }

  function wireCloseButtons() {
    $$("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-close");
        if (id) closeBack(id);
      });
    });
  }

  // ---------- legacy click fallback (hidden old columns/buttons) ----------
  function clickLegacy(selector) {
    const el = $(selector);
    if (el) { el.click(); return true; }
    return false;
  }

  // ---------- open targets (prefer direct APIs if you have them) ----------
  function openMap() {
    if (typeof window.openMap === "function") return window.openMap();
    if (typeof window.Map?.open === "function") return window.Map.open();
    return clickLegacy(".btn.map") || clickLegacy("button.btn.map");
  }

  function openMissions() {
    if (typeof window.openMissions === "function") return window.openMissions();
    if (typeof window.Missions?.open === "function") return window.Missions.open();
    return clickLegacy(".btn.mission") || clickLegacy("button.btn.mission");
  }

  function openQuests() {
    if (typeof window.openQuests === "function") return window.openQuests();
    if (typeof window.Quests?.open === "function") return window.Quests.open();
    if (clickLegacy("#quests-launcher")) return true;
    const qb = document.getElementById("qBack");
    if (qb) { qb.style.display = "flex"; navOpenId("qBack"); return true; }
    return false;
  }

  function openInventory() {
    if (typeof window.openInventory === "function") return window.openInventory();
    if (typeof window.Inventory?.open === "function") return window.Inventory.open();
    return clickLegacy(".btn.inventory") || clickLegacy("button.btn.inventory");
  }

  function openHub() {
    openBack("hubBack");
    try { window.Stats?.refreshHubGoal?.(); } catch (_) {}
  }
  function openCharSheet() { openBack("charBack"); }
  function openShareSheet() {
    closeBack("hubBack");
    if (typeof window.ShareCard?.open === "function") return window.ShareCard.open("hub");
    openBack("shareBack");
  }

  function syncBadgeMenuCopy() {
    const row = document.querySelector('#charBack [data-action="badges"]');
    if (!row) return;

    const title = row.querySelector(".ah-character-title");
    const sub = row.querySelector(".ah-character-sub");

    if (title) title.textContent = "Badges & Titles";
    if (sub) sub.textContent = "Manage prestige badges and active title";
  }

  // ---------- Hub/Char actions ----------
  function routeAction(action) {
    const A = String(action || "").toLowerCase();

    if (A === "share") {
      openShareSheet();
      return;
    }
    if (A === "support") {
      closeBack("hubBack");
      if (typeof window.Support?.open === "function") window.Support.open();
      else openBack("supportBack");
      return;
    }
    if (A === "stats") {
      closeBack("charBack");
      openBack("statsBack");
      try { window.Stats?.refresh?.(); } catch(_) {}
      return;
    }

    switch (A) {
      case "shop":
        if (typeof window.Shop?.open === "function") window.Shop.open();
        else clickLegacy(".btn.shop") || clickLegacy("button.btn.shop");
        break;

      case "adopt":
        if (typeof window.Adopt?.open === "function") window.Adopt.open();
        else clickLegacy(".btn.adopt") || clickLegacy("button.btn.adopt");
        break;

      case "arena":
        if (typeof window.Arena?.open === "function") window.Arena.open();
        else clickLegacy(".btn.arena") || clickLegacy("button.btn.arena");
        break;

      case "referrals":
        if (typeof window.ensureReferralsLoaded === "function") {
          window.ensureReferralsLoaded()
            .then(() => {
              if (typeof window.Referrals?.open === "function") window.Referrals.open();
              else clickLegacy(".btn.referral") || clickLegacy("button.btn.referral");
            })
            .catch(() => {
              clickLegacy(".btn.referral") || clickLegacy("button.btn.referral");
            });
        } else if (typeof window.Referrals?.open === "function") window.Referrals.open();
        else clickLegacy(".btn.referral") || clickLegacy("button.btn.referral");
        break;

      case "howlboard":
        if (typeof window.Howlboard?.open === "function") window.Howlboard.open();
        else clickLegacy(".btn.howlboard") || clickLegacy("button.btn.howlboard");
        break;

      case "mailbox":
        if (typeof window.Mailbox?.open === "function") window.Mailbox.open();
        else clickLegacy(".btn.mailbox") || clickLegacy("button.btn.mailbox");
        break;

      case "campaign":
        if (typeof window.Campaign?.open === "function") window.Campaign.open();
        else {
          const tg = window.Telegram?.WebApp;
          tg?.showAlert?.("Campaign signal is still syncing.");
        }
        break;

      case "faq":
        if (typeof window.openFaqModal === "function") window.openFaqModal();
        else clickLegacy(".btn.faq") || clickLegacy("button.btn.faq");
        break;

      case "profile":
        if (typeof window.Profile?.open === "function") window.Profile.open();
        else clickLegacy(".btn.profile") || clickLegacy("button.btn.profile");
        break;

      case "support":
        if (typeof window.Support?.open === "function") window.Support.open();
        else if (typeof window.openSupport === "function") window.openSupport();
        else if (clickLegacy(".btn.support") || clickLegacy("button.btn.support")) {}
        else {
          const tg = window.Telegram?.WebApp;
          tg?.showAlert?.("Support is loading...");
        }
        break;

      case "whatsnew":
        if (typeof window.WhatsNew?.open === "function") window.WhatsNew.open();
        else clickLegacy("#btnWhatsNew") || clickLegacy(".btn.whatsnew");
        break;

      case "feed":
        if (typeof window.Feed?.open === "function") window.Feed.open();
        else clickLegacy(".btn.feed") || clickLegacy("button.btn.feed");
        break;

      case "add_to_home":
        if (typeof window.promptInstallPWA === "function") window.promptInstallPWA();
        else if (typeof window.promptAddToHome === "function") window.promptAddToHome();
        else {
          const tg = window.Telegram?.WebApp;
          tg?.showAlert?.("Add to Home is not available on this device yet.");
        }
        break;

      // Character sheet actions
      case "equipped":
        if (typeof window.Equipped?.open === "function") window.Equipped.open();
        else clickLegacy(".btn.equipped") || clickLegacy("button.btn.equipped");
        break;

      case "skins":
        if (typeof window.Skins?.open === "function") window.Skins.open();
        else clickLegacy(".btn.skins") || clickLegacy("button.btn.skins");
        break;

      case "avatar":
        clickLegacy(".btn.avatar") || clickLegacy("button.btn.avatar");
        break;

      case "pets":
        if (typeof window.MyPets?.open === "function") window.MyPets.open();
        else clickLegacy(".btn.mypets") || clickLegacy("button.btn.mypets");
        break;

      default:
        break;
    }

    closeAllBacks();
  }

  // ---------- BottomNav routing ----------
  function routeGo(go) {
    const G = String(go || "").toLowerCase();
    closeAllBacks();

    switch (G) {
      case "map": openMap(); break;
      case "missions": openMissions(); break;
      case "quests": openQuests(); break;
      case "inventory": openInventory(); break;
      case "hub": openHub(); break;
      default: break;
    }
  }

  // ---------- Patch navCloseTop so BackButton unlocks body when closing our sheets ----------
  function patchNavCloseTop() {
    if (typeof window.navCloseTop !== "function") return;

    const orig = window.navCloseTop;
    window.navCloseTop = function (opts) {
      const meta = (opts && typeof opts === "object") ? opts : {};
      const source = meta.source || "back";
      const st = window.AH_NAV?.stack;
      const topId = st && st.length ? st[st.length - 1] : null;

      if (topId && IS_OUR_SHEET(topId)) {
        if (window.AH_NAV) window.AH_NAV.popClosing = source === "history";
        closeBack(topId);
        if (window.AH_NAV) window.AH_NAV.popClosing = false;
        return true;
      }
      return orig(meta);
    };
  }

  function init() {
    syncBadgeMenuCopy();
    hydrateHubIcons();

    // backdrops
    wireBackdropClose("hubBack");
    wireBackdropClose("charBack");
    wireBackdropClose("shareBack");
    wireBackdropClose("supportBack");
    wireBackdropClose("statsBack");

    wireCloseButtons();
    patchNavCloseTop();

    // BottomNav
    const nav = document.getElementById("ahBottomNav");
    if (nav) {
      nav.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-go]");
        if (!btn) return;
        routeGo(btn.getAttribute("data-go"));
      });
    }

    // Hub actions
    const hub = document.getElementById("hubBack");
    hub?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      routeAction(btn.getAttribute("data-action"));
    });

    // Char actions
    const ch = document.getElementById("charBack");
    ch?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      routeAction(btn.getAttribute("data-action"));
    });

    // Tap hero frame -> Character sheet
    const hero = document.getElementById("heroFrame");
    if (hero) {
      hero.style.cursor = "pointer";
      hero.addEventListener("click", () => openCharSheet());
    }
  }
  // real function
  function openCharSheet() {
    openBack("charBack");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // optional helpers
  window.HomeNav = {
    openHub: () => openHub(),
    openQuests: () => openQuests(),
    openMissions: () => openMissions(),
    openMap: () => openMap(),
    openInventory: () => openInventory(),
    openSupport: () => routeAction("support"),
    closeAll: () => closeAllBacks(),
  };
})();
