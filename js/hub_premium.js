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

  // Read-only inventory attention. Never infer a drop from visual cosmetics.
  const INV_SEEN_PREFIX = "ah.hub.v2.inventorySeen.v1.";
  let invOwner = "";
  let invBaseline = null;
  let invRequest = 0;

  function inventoryActor() {
    const tg = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    // Use an account identifier only when actually supplied; never key by a shared device.
    const account = window.__ahAlphaAccountSession?.user_id ??
      window.__ahAlphaAccountSession?.userId ??
      window.PROFILE?.user_id ?? window.PROFILE?.uid ??
      window.PLAYER_STATE?.user?.id ?? window.PLAYER_STATE?.profile?.uid;
    const raw = String(tg ?? account ?? "").trim();
    return /^[a-zA-Z0-9_-]{1,96}$/.test(raw)
      ? (tg != null ? "tg:" : "account:") + raw : "";
  }

  function inventorySnapshot(slots) {
    if (!Array.isArray(slots)) return null;
    const out = Object.create(null);
    for (const item of slots) {
      if (!item || typeof item !== "object") continue;
      const key = String(item.key ?? item.item_key ?? item.item ?? "").trim();
      if (!key || key.length > 160) continue;
      const raw = Number(item.quantity ?? item.amount ?? item.stackQty ?? item.qty ?? 1);
      const qty = Number.isFinite(raw) ? Math.max(1, Math.trunc(raw)) : 1;
      out[key] = Math.min(1000000, (out[key] || 0) + qty);
    }
    return out;
  }

  function inventoryLastViewed(actor) {
    if (actor !== invOwner) { invOwner = actor; invBaseline = null; }
    if (invBaseline) return invBaseline;
    try {
      const raw = window.localStorage?.getItem(INV_SEEN_PREFIX + actor);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1 && parsed.items && typeof parsed.items === "object"
          && !Array.isArray(parsed.items)) invBaseline = parsed.items;
    } catch (_) {} // No alert when storage is unavailable or corrupted.
    return invBaseline;
  }

  function inventoryRememberViewed(actor, snapshot) {
    invOwner = actor;
    invBaseline = snapshot;
    if (!actor) return;
    try { window.localStorage?.setItem(INV_SEEN_PREFIX + actor,
      JSON.stringify({version:1,items:snapshot})); } catch (_) {}
  }

  function inventoryPaintAttention(unseen) {
    const node = root?.querySelector(".ahn-node--inventory");
    if (!node) return;
    node.dataset.nodeStatus = unseen ? "new" : "normal";
    node.setAttribute("aria-label", unseen ?
      "Open Inventory, new items available" : "Open Inventory");
    const label = node.querySelector(".ahn-node-unseen");
    if (label) label.hidden = !unseen;
  }

  function onInventoryViewed(event) {
    const snapshot = inventorySnapshot(event?.detail?.slots);
    const actor = inventoryActor();
    if (!snapshot || !actor) return;
    ++invRequest; // Invalidate any older fetch completing after the player viewed items.
    inventoryRememberViewed(actor, snapshot);
    inventoryPaintAttention(false);
  }

  async function refreshInventoryAttention() {
    if (!isOpen()) return false;
    const actor = inventoryActor();
    const seq = ++invRequest;
    if (!actor) { inventoryPaintAttention(false); return false; }
    if (actor !== invOwner) inventoryPaintAttention(false);
    const api = window.apiPost || window.S?.apiPost;
    if (typeof api !== "function") return false;
    try {
      const response = await api("/webapp/inventory/state", {});
      if (seq !== invRequest || actor !== inventoryActor() || !isOpen()) return false;
      if (response?.ok !== true || !Array.isArray(response.slots)) return false;
      const current = inventorySnapshot(response.slots);
      if (!current) return false;
      const seen = inventoryLastViewed(actor);
      if (!seen) {
        // First verified snapshot establishes a baseline, never a fake new-loot alert.
        inventoryRememberViewed(actor, current);
        inventoryPaintAttention(false);
        return true;
      }
      const hasNew = Object.keys(current).some(key => current[key] > Number(seen[key] || 0));
      inventoryPaintAttention(hasNew);
      return true;
    } catch (err) {
      console.warn("[HubNetworkV2] Inventory attention unavailable", err);
      return false;
    }
  }


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
    window.addEventListener("ah:inventory-viewed", onInventoryViewed);
    window.addEventListener("ah:session-state-changed", () => {
      if (isOpen()) void refreshInventoryAttention();
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
    void refreshInventoryAttention();
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
