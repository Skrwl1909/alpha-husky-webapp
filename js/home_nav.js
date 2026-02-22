// js/home_nav.js — BottomNav + Sheets router (integrates with window.navOpen/navClose/navCloseTop)
// - Quests uses your existing #quests-launcher (wired by quests.js)
// - Sheets (hubBack/charBack/shareBack) are compatible with Telegram BackButton stack
// - BackButton closes our sheets AND unlocks body scroll (patches navCloseTop)

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const IS_OUR_SHEET = (id) => id === "hubBack" || id === "charBack" || id === "shareBack" || id === "supportBack";

  function setBodyLock(on) {
    document.body.classList.toggle("ah-sheet-open", !!on);
    document.body.style.overflow = on ? "hidden" : "";
    document.body.style.touchAction = on ? "none" : "";
  }

  function anyOurSheetOpen() {
    return ["hubBack", "charBack", "shareBack"].some((id) => {
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

    el.style.display = "none";
    delete el.dataset.open;
    navCloseId(id);

    if (!anyOurSheetOpen()) setBodyLock(false);
  }

  function closeAllBacks() {
    ["hubBack", "charBack", "shareBack"].forEach(closeBack);
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

  // ✅ IMPORTANT: Quests = Mission Board modal (#qBack) driven by quests.js.
  // Best is to click your launcher (#quests-launcher), not to manually toggle display.
  function openQuests() {
    // if quests.js exposes something, use it, else click launcher
    if (typeof window.openQuests === "function") return window.openQuests();
    if (typeof window.Quests?.open === "function") return window.Quests.open();
    if (clickLegacy("#quests-launcher")) return true;
    // last resort (if launcher removed): show modal
    const qb = document.getElementById("qBack");
    if (qb) { qb.style.display = "flex"; navOpenId("qBack"); return true; }
    return false;
  }

  function openInventory() {
    if (typeof window.openInventory === "function") return window.openInventory();
    if (typeof window.Inventory?.open === "function") return window.Inventory.open();
    return clickLegacy(".btn.inventory") || clickLegacy("button.btn.inventory");
  }

  function openHub() { openBack("hubBack"); }
  function openCharSheet() { openBack("charBack"); }
  function openShareSheet() { openBack("shareBack"); }

  // ---------- Hub/Char actions ----------
  function routeAction(action) {
    const A = String(action || "").toLowerCase();

    if (A === "share") {
      closeBack("hubBack");
      openShareSheet();
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
        if (typeof window.Referrals?.open === "function") window.Referrals.open();
        else clickLegacy(".btn.referral") || clickLegacy("button.btn.referral");
        break;

      case "howlboard":
        if (typeof window.Howlboard?.open === "function") window.Howlboard.open();
        else clickLegacy(".btn.howlboard") || clickLegacy("button.btn.howlboard");
        break;

      case "profile":
        if (typeof window.Profile?.open === "function") window.Profile.open();
        else clickLegacy(".btn.profile") || clickLegacy("button.btn.profile");
        break;

        case "support":
        // prefer moduł Support (support.js), potem fallback na legacy button
        if (typeof window.Support?.open === "function") window.Support.open();
        else if (typeof window.openSupport === "function") window.openSupport();
        else if (clickLegacy(".btn.support") || clickLegacy("button.btn.support")) {}
        else {
          const tg = window.Telegram?.WebApp;
          tg?.showAlert?.("Support is loading…");
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

  // ---------- Share sheet buttons ----------
  function wireShareButtons() {
    const back = document.getElementById("shareBack");
    if (!back) return;

    back.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-share-style]");
      if (!btn) return;

      const style = Number(btn.getAttribute("data-share-style") || "1");

      // Prefer your share module
      if (typeof window.ShareLevelUp?.open === "function") {
        window.ShareLevelUp.open(style);
      } else if (typeof window.shareLevelUp === "function") {
        window.shareLevelUp(style);
      } else {
        // last-resort fallback: if old buttons still exist
        const legacy = $(`#shareRow [data-share-style="${style}"]`);
        legacy?.click?.();
      }

      closeAllBacks();
    });
  }

  // ---------- Patch navCloseTop so BackButton unlocks body when closing our sheets ----------
  function patchNavCloseTop() {
    if (typeof window.navCloseTop !== "function") return;

    const orig = window.navCloseTop;
    window.navCloseTop = function () {
      const st = window.AH_NAV?.stack;
      const topId = st && st.length ? st[st.length - 1] : null;

      if (topId && IS_OUR_SHEET(topId)) {
        closeBack(topId);
        return true;
      }
      return orig();
    };
  }

  function init() {
    // backdrops
    wireBackdropClose("hubBack");
    wireBackdropClose("charBack");
    wireBackdropClose("shareBack");

    wireCloseButtons();
    wireShareButtons();
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
