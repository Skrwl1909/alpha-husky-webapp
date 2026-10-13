// Alpha Husky — Living Network Hub V2.
// Presentation only. Canonical progression belongs to StoryDelivery, Stats and CTA;
// game actions remain owned by HomeNav and existing game systems.
(function () {
  "use strict";
  if (window.__ahHubNetworkV2Bound) return;
  window.__ahHubNetworkV2Bound = true;

  const ROOT_ID = "hubBack";
  const DRAWER_ID = "hubSystemsDrawer";
  let root = null;
  let storyObserver = null;
  let syncToken = 0;
  let initialized = false;
  let clickTimer = 0;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const isOpen = () => !!root && root.dataset.open === "1" && root.style.display !== "none";
  const isLite = () => document.documentElement.classList.contains("ah-perf-lite")
    || document.body.classList.contains("ah-perf-lite")
    || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function cacheDom() {
    root = document.getElementById(ROOT_ID);
    return !!(root && $(`#${DRAWER_ID}`, root) && $("#ahnNetworkStage", root));
  }

  function resetDeck() {
    const scroll = $("#ahnHubScroll", root || document);
    if (scroll) scroll.scrollTop = 0;
  }
  function setCard() { resetDeck(); }

  function syncStoryPriority() {
    if (!root) return;
    const story = $("#hubStoryRoot", root);
    const hasStory = !!story && story.childElementCount > 0
      && String(story.textContent || "").trim().length > 0;
    root.classList.toggle("ahp-has-story", hasStory);
  }
  function observeStory() {
    const story = $("#hubStoryRoot", root);
    if (!story || storyObserver || !window.MutationObserver) return;
    storyObserver = new MutationObserver(syncStoryPriority);
    storyObserver.observe(story, { childList: true, subtree: true, characterData: true });
    syncStoryPriority();
  }

  function drawer() { return root && $(`#${DRAWER_ID}`, root); }
  function isSystemsOpen() { return drawer()?.dataset.open === "1"; }
  function openSystems() {
    const panel = drawer();
    if (!panel) return false;
    panel.dataset.open = "1";
    panel.setAttribute("aria-hidden", "false");
    root.classList.add("ahp-systems-open");
    $$("[data-hub-open-systems]", root).forEach(el => el.setAttribute("aria-expanded", "true"));
    window.setTimeout(() => panel.querySelector("[data-hub-close-systems]")?.focus({preventScroll:true}), 260);
    return true;
  }
  function closeSystems(opts) {
    const panel = drawer();
    if (!panel || panel.dataset.open !== "1") return false;
    panel.dataset.open = "0";
    panel.setAttribute("aria-hidden", "true");
    root.classList.remove("ahp-systems-open");
    $$("[data-hub-open-systems]", root).forEach(el => el.setAttribute("aria-expanded", "false"));
    if (opts?.restoreFocus !== false) window.setTimeout(() =>
      root?.querySelector(".ahn-core")?.focus({preventScroll:true}), 20);
    return true;
  }

  function signalStatus(kind) {
    if (!root) return;
    const element = $("#ahnSignalLoading", root);
    const btn = root.querySelector("[data-hub-retry]");
    if (!element) return;
    root.dataset.signalReady = kind === "ready" ? "1" : "0";
    element.dataset.state = kind;
    if (btn) btn.hidden = kind !== "error";
    const message = element.querySelector("span:not(.ahn-loading-wave)");
    if (message) message.textContent = kind === "error"
      ? "Could not sync the current signal." : "Synchronizing current signal…";
    element.setAttribute("aria-hidden", kind === "ready" ? "true" : "false");
  }

  async function syncCanonicalSignal() {
    if (!root) return false;
    const seq = ++syncToken;
    signalStatus("loading");
    // Never show the cached story objective before the canonical server refresh.
    // StoryDelivery handles reentry state, campaign, CTA, FTUE and next moves.
    let success = false;
    try {
      if (typeof window.StoryDelivery?.refreshReturn === "function") {
        success = (await window.StoryDelivery.refreshReturn()) === true;
      } else {
        // Compatible with bootstrap order: the existing module may init later.
        success = false;
      }
    } catch (err) {
      console.warn("[HubNetworkV2] signal refresh unavailable", err);
    }
    if (seq !== syncToken || !isOpen()) return false;
    syncStoryPriority();
    signalStatus(success ? "ready" : "error");
    return success;
  }

  function focusNetwork() {
    if (!root) return;
    const scroll = $("#ahnHubScroll", root);
    if (scroll) scroll.scrollTop = 0;
  }

  function openExistingRoute(key) {
    // Existing open methods often return void on success. Do not report them
    // unavailable merely because they have no boolean return value.
    const home = window.HomeNav;
    let open = null;
    switch (key) {
      case "map": open = home?.openMap; break;
      case "inventory": open = home?.openInventory; break;
      case "factions": {
        const member=window.Factions?.getMyFactionKey?.();
        if(member && typeof window.FactionHQ?.open==="function"){
          void Promise.resolve(window.FactionHQ.open()).catch(err=>console.warn("[HubNetworkV2] Faction HQ failed",err));
          return true;
        }
        if(typeof window.Factions?.open==="function"){window.Factions.open({mode:"auto"});return true;}
        if(!member&&typeof window.FactionChamber?.open==="function"){window.FactionChamber.open();return true;}
        return false;
      }
      case "oracle": open = window.Oracle?.open; break;
      case "siege": open = window.Siege?.open; break;
      case "pack_comms": open = window.PackComms?.openFromLauncher; break;
      default: return false;
    }
    if (typeof open !== "function") return false;
    // Use the owning object for APIs that depend on 'this'.
    const owner = key === "map" || key === "inventory" ? home
      : key === "oracle" ? window.Oracle
      : key === "siege" ? window.Siege
      : key === "pack_comms" ? window.PackComms : window.Factions;
    const result = open.call(owner);
    return result !== false;
  }
  function openPackDirectory() {
    if (!openSystems()) return;
    const scroll = root.querySelector(".ah-hub-systems-scroll");
    const section = root.querySelector('.ah-system-section[aria-label="Identity and Pack"]');
    if (scroll && section) {
      // Scroll within the existing catalogue, not the entire viewport.
      window.setTimeout(() => { if (isSystemsOpen()) scroll.scrollTop = Math.max(0, section.offsetTop - scroll.offsetTop); }, 70);
    }
  }

  function routeClicked(event) {
    const route = event.target.closest("[data-hub-route]");
    if (!route || !root.contains(route)) return;
    event.preventDefault();
    event.stopPropagation();
    const key = route.dataset.hubRoute;
    // Do not invent destinations or rewrite game state.
    window.HomeNav?.closeAll?.();
    const opened = openExistingRoute(key);
    if (opened === false) console.warn("[HubNetworkV2] route unavailable", key);
  }

  function touchFeedback(event) {
    const node = event.target.closest(".ahn-node,.ahn-core,.ahn-directory-trigger,.ahn-footer-core,.ahn-footer-item");
    if (!node || !root?.contains(node) || isLite()) return;
    node.classList.remove("ahn-tapped");
    void node.offsetWidth;
    node.classList.add("ahn-tapped");
    window.clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => node.classList.remove("ahn-tapped"), 180);
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
  }

  function wireControls() {
    if (!root || initialized) return;
    initialized = true;
    root.addEventListener("pointerdown", touchFeedback, {passive:true});
    root.addEventListener("click", (event) => {
      const retry = event.target.closest("[data-hub-retry]");
      if (retry) { void syncCanonicalSignal(); return; }
      const opener = event.target.closest("[data-hub-open-systems]");
      if (opener && root.contains(opener)) {
        event.preventDefault();
        if (isSystemsOpen()) closeSystems(); else openSystems();
        return;
      }
      const closer = event.target.closest("[data-hub-close-systems]");
      if (closer && root.contains(closer)) { closeSystems(); return; }
      const pack = event.target.closest("[data-hub-open-pack]");
      if (pack && root.contains(pack)) { openPackDirectory(); return; }
      if (event.target.closest('[data-hub-nav="hub"]')) { focusNetwork(); return; }
      routeClicked(event);
    });
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isSystemsOpen()) {
        event.preventDefault();
        closeSystems();
      }
    });
    // Never store a fake node availability. Only the real destination decides.
  }

  function activate() {
    if (!init()) return false;
    closeSystems({restoreFocus:false});
    resetDeck();
    const n=root.querySelector(".ahn-node--factions");
    if(n){
      const member=!!window.Factions?.getMyFactionKey?.();
      const label=n.querySelector(".ahn-node-label");
      const sub=n.querySelector(".ahn-node-sub");
      if(label)label.textContent=member?"Faction HQ":"Factions";
      if(sub)sub.textContent=member?"YOUR FACTION":"CHOOSE A FACTION";
    }
    void syncCanonicalSignal();
    return true;
  }

  function init() {
    if (!cacheDom()) return false;
    root.classList.add("ah-hub-premium","ah-hub-network-v2");
    wireControls();
    observeStory();
    return true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.HubPremium = Object.freeze({
    init,activate,resetDeck,openSystems,closeSystems,isSystemsOpen,setCard
  });
})();
