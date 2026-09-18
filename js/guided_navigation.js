(function (global) {
  "use strict";

  const KEY = "ah.ftue.guidedNavigation.v1";
  let saved = {}, target = null, notice = null, syncing = false;
  try { saved = JSON.parse(global.localStorage.getItem(KEY) || "{}"); } catch (_) {}

  const POST_ROUTES = Object.freeze({
    character: Object.freeze({
      title: "FIND YOUR HUSKY",
      arrival: ["#charBack"],
      initial: "hero",
      message(step) {
        return step === "close_hub"
          ? "Your gear, skins, frames, badges, stats and pets live behind your Husky.\n\nCLOSE HUB, THEN TAP YOUR HUSKY"
          : "Your gear, skins, frames, badges, stats and pets live behind your Husky.\n\nTAP YOUR HUSKY";
      }
    }),
    forge: Object.freeze({
      title: "FIND WORKSMITH FORGE",
      arrival: ["#ahForgeBack"],
      initial: "map",
      message(step) {
        if (step === "open_activity") return "Map → Citadel → Worksmith Forge\n\nOPEN THE FORGE";
        if (step === "forge") return "Map → Citadel → Worksmith Forge\n\nSELECT WORKSMITH FORGE";
        if (step === "citadel") return "Map → Citadel → Worksmith Forge\n\nOPEN CITADEL";
        if (step === "sections") return "Map → Citadel → Worksmith Forge\n\nRETURN TO WORLD SECTIONS";
        if (step === "close_hub") return "The Forge is a place in the world, not a menu shortcut.\n\nCLOSE HUB, THEN OPEN MAP";
        return "The Forge is a place in the world, not a menu shortcut.\n\nOPEN MAP → CITADEL → WORKSMITH FORGE";
      }
    }),
    shop: Object.freeze({
      title: "FIND SHOP",
      arrival: [".ah-shop-wrap"],
      initial: "hub",
      message(step) {
        return step === "shop" ? "Useful supplies live in Hub.\n\nOPEN SHOP" : "Useful supplies live in Hub.\n\nOPEN HUB → SHOP";
      }
    }),
    howlboard: Object.freeze({
      title: "FIND HOWLBOARD",
      arrival: ["#boardBack"],
      initial: "hub",
      message(step) {
        return step === "howlboard" ? "Pack rankings live in Hub.\n\nOPEN HOWLBOARD" : "Pack rankings live in Hub.\n\nOPEN HUB → HOWLBOARD";
      }
    }),
    support: Object.freeze({
      title: "FIND SUPPORT",
      arrival: ["#supportBack"],
      initial: "hub",
      message(step) {
        return step === "support" ? "Project support and HOWL holder utilities live in Hub.\n\nOPEN SUPPORT" : "Project support and HOWL holder utilities live in Hub.\n\nOPEN HUB → SUPPORT";
      }
    }),
    adopt: Object.freeze({
      title: "FIND ADOPT CENTER",
      arrival: [".adopt-backdrop"],
      initial: "hub",
      message(step) {
        return step === "adopt" ? "Companions can be found from Hub.\n\nOPEN ADOPT" : "Companions can be found from Hub.\n\nOPEN HUB → ADOPT";
      }
    })
  });

  function persist() { try { global.localStorage.setItem(KEY, JSON.stringify(saved)); } catch (_) {} }
  function read(key) { try { return global.localStorage.getItem(key) || ""; } catch (_) { return ""; } }
  function inputs() { return global.StoryDelivery?.gatherInputs?.() || {}; }
  function firstSignal() { return inputs()?.firstSignal || inputs()?.tutorial?.first_signal || {}; }
  function routeScope(id) { return POST_ROUTES[id] ? "post" : (["bloodmoon", "tactical"].includes(id) ? "ftue" : ""); }

  function postFtueReady() {
    const current = inputs();
    try {
      if (global.FirstSessionSpine?.view?.(current)?.complete === true) return true;
    } catch (_) {}
    const fs = current?.firstSignal || current?.tutorial?.first_signal || {};
    const world = String(fs.world_discovery || fs.worldDiscovery || "").toLowerCase();
    if (fs?.eligible === false && current?.campaign?.eligible === false) return true;
    return fs?.state === "COMPLETED" && world === "done" && read("ah.sd.tacticalDiscovery.v1") === "consumed";
  }

  function terminal(id) {
    if (routeScope(id) === "post") return false;
    if (["done", "dismissed"].includes(saved[id]?.status)) return true;
    if (id === "tactical") {
      try {
        return global.localStorage.getItem("ah.sd.tacticalDiscovery.v1") === "consumed"
          || global.localStorage.getItem("ah.sd.nextMoveDismissed.v1") === "tactical-first-attempt";
      } catch (_) {}
    }
    return false;
  }

  function legacyEligible(id) {
    const fs = firstSignal();
    if (!fs.eligible || fs.state !== "COMPLETED" || terminal(id) || global.FirstSessionSpine?.view()?.complete) return false;
    if (id === "bloodmoon") return fs.world_discovery === "pending";
    const frame = global.StoryDelivery?.getState?.();
    return frame?.id === "S-TO-DISCOVERY" || frame?.nextMove?.key === "tactical-first-attempt";
  }

  function eligible(id) {
    const scope = routeScope(id);
    if (scope === "post") return postFtueReady();
    if (scope === "ftue") return legacyEligible(id);
    return false;
  }

  function notifyState() {
    try { global.DiscoveryGuide?.refresh?.(); } catch (_) {}
    try {
      if (typeof global.CustomEvent === "function" && global.dispatchEvent) {
        global.dispatchEvent(new global.CustomEvent("ah:guided-navigation-state", { detail: state() }));
      }
    } catch (_) {}
  }

  function deactivatePostRoutes(exceptId) {
    let changed = false;
    for (const id of Object.keys(POST_ROUTES)) {
      if (id !== exceptId && saved[id]?.status === "active") {
        saved[id] = { ...saved[id], status: "idle" };
        changed = true;
      }
    }
    if (changed) persist();
  }

  function start(id, options = {}) {
    if (!eligible(id)) return false;
    const scope = routeScope(id);
    if (scope === "post") {
      deactivatePostRoutes(id);
      const route = POST_ROUTES[id];
      saved[id] = {
        ...saved[id],
        status: "active",
        step: route.initial,
        source: String(options.source || "post_ftue"),
        startedAt: Date.now()
      };
      persist();
      refresh();
      notifyState();
      return true;
    }
    if (!saved[id]) {
      saved[id] = { status: "active", step: id === "bloodmoon" ? "map" : "missions" };
      persist();
    }
    refresh();
    return true;
  }

  async function syncCompletion() {
    if (syncing || !terminal("bloodmoon") || firstSignal().world_discovery !== "pending") return;
    const api = global.S?.apiPost || global.apiPost;
    if (!api) return;
    syncing = true;
    try {
      const result = await api("/webapp/tutorial/action", { action: "world_discovery_dismiss" });
      if (result?.ok) {
        await global.Onboarding?.refreshContinuity?.();
        global.StoryDelivery?.refreshHub?.("guided_navigation_complete");
        void global.CTA?.refresh?.();
        if (!saved.bloodmoon?.announced) {
          const dismissed = saved.bloodmoon?.status === "dismissed";
          saved.bloodmoon = { ...saved.bloodmoon, announced: true }; persist();
          global.AlphaToast?.show?.({
            type: "success",
            title: "WORLD OPEN",
            message: dismissed
              ? "Guidance ended. You know why the Pack exists. You've seen what this world became."
              : "You know why the Pack exists. You've seen what this world became.",
            meta: "From here, you choose where to move. What you do next becomes part of the record."
          });
        }
      }
    } catch (_) { /* Persisted completion is retried on the next user interaction/reload. */ }
    finally { syncing = false; }
  }

  function finish(id, status = "done") {
    const scope = routeScope(id);
    if (!scope) return;
    if (scope === "ftue" && terminal(id)) return;
    saved[id] = { ...saved[id], status, step: "complete", reached: status === "done" ? true : saved[id]?.reached };
    persist();
    if (scope === "ftue") {
      if (id === "bloodmoon") void syncCompletion();
      else global.StoryDelivery?.consumeTacticalDiscovery?.();
    }
    paint(null);
    notifyState();
  }

  function dismiss(id) {
    const scope = routeScope(id);
    if (!scope) return;
    if (scope === "post") {
      if (saved[id]?.status === "active") {
        saved[id] = { ...saved[id], status: "dismissed" };
        persist();
        paint(null);
        notifyState();
      }
      return;
    }
    if (saved[id]?.status === "active" || eligible(id)) finish(id, "dismissed");
  }

  function visible(el) {
    return !!(el && !el.hidden && el.getClientRects().length && global.getComputedStyle(el).visibility !== "hidden");
  }
  function find(selector) { return Array.from(document.querySelectorAll(selector)).find(visible) || null; }
  function findAny(selectors) {
    for (const selector of selectors || []) {
      const found = find(selector);
      if (found) return found;
    }
    return null;
  }

  function postStep(id) {
    const hub = find("#hubBack");
    const closeHub = find('#hubBack [data-close="hubBack"]');
    const bottomHub = find('#ahBottomNav [data-go="hub"]');
    const bottomMap = find('#ahBottomNav [data-go="map"]');

    if (id === "character") {
      if (hub && closeHub) return { step: "close_hub", target: closeHub };
      return { step: "hero", target: find("#heroFrame") };
    }

    if (["shop", "howlboard", "support", "adopt"].includes(id)) {
      const tile = hub ? find('#hubBack [data-action="' + id + '"]') : null;
      if (tile) return { step: id, target: tile };
      return { step: "hub", target: bottomHub };
    }

    if (id === "forge") {
      let next = find('.map-v2-dock[data-map-v2-node-id="vault_forge"] .map-v2-primary-action');
      if (next) return { step: "open_activity", target: next };
      next = find('button[data-map-v2-node-id="vault_forge"]');
      if (next) return { step: "forge", target: next };
      next = find('[data-map-v2-section-id="citadel"] .map-v2-section-action');
      if (next) return { step: "citadel", target: next };
      if (find("#mapBack")) {
        next = find(".map-v2-back");
        if (next) return { step: "sections", target: next };
      }
      if (hub && closeHub) return { step: "close_hub", target: closeHub };
      return { step: "map", target: bottomMap };
    }

    return { step: "", target: null };
  }

  function noticeText(id, step) {
    if (id === "bloodmoon") {
      return "The Pack survived the Meme War. Then I reached the Edge. I found the Oracle. The Rewrite began. Trust inside the Pack started breaking. What followed became known as: THE FRACTURE.\n\nFIND BLOOD MOON TOWER";
    }
    if (id === "tactical") return "FIND TACTICAL OPS";
    const route = POST_ROUTES[id];
    return route?.message?.(step) || route?.title || "FIND DESTINATION";
  }

  function paint(next, id, step) {
    if (target !== next) {
      target?.classList.remove("ah-guided-target");
      target = next;
      target?.classList.add("ah-guided-target");
    }
    if (!notice) return;
    notice.hidden = !next;
    if (next) {
      notice.dataset.destination = id || "";
      notice.dataset.step = step || "";
      notice.querySelector("span").textContent = noticeText(id, step);
      notice.querySelector("button").onclick = () => dismiss(id);
    } else {
      delete notice.dataset.destination;
      delete notice.dataset.step;
    }
  }

  function observePostArrivals() {
    let changed = false;
    for (const [id, route] of Object.entries(POST_ROUTES)) {
      if (!postFtueReady()) break;
      if (!findAny(route.arrival)) continue;
      if (!saved[id]?.reached) {
        saved[id] = { ...saved[id], reached: true, discoveredAt: Date.now() };
        changed = true;
      }
      if (saved[id]?.status === "active") {
        saved[id] = { ...saved[id], status: "done", step: "complete", reached: true };
        changed = true;
      }
    }
    if (changed) { persist(); notifyState(); }
    return changed;
  }

  function refresh() {
    observePostArrivals();

    const fs = firstSignal();
    if (fs.eligible && fs.state === "COMPLETED") {
      // Arrival is observed on the real destination, including alternate entry routes.
      for (const [id, selector] of [["bloodmoon", "#bloodMoonBack.show"], ["tactical", '#tacticalOpsRoot[data-open="1"]']]) {
        if (find(selector)) {
          if (!saved[id]?.reached) {
            saved[id] = { ...saved[id], reached: true }; persist();
            global.FirstSessionSpine?.sync();
          }
          if (!terminal(id)) finish(id);
        }
      }
      if (fs.world_discovery === "done" && saved.bloodmoon?.status === "active") {
        saved.bloodmoon = { ...saved.bloodmoon, status: "done", step: "complete" }; persist();
      }
      for (const id of ["bloodmoon", "tactical"]) {
        if (eligible(id) && !saved[id]) {
          saved[id] = { status: "active", step: id === "bloodmoon" ? "map" : "missions" }; persist();
        }
      }
    }

    const legacyId = ["bloodmoon", "tactical"].find(id => saved[id]?.status === "active" && !terminal(id));
    if (legacyId) {
      let step, next;
      if (legacyId === "bloodmoon") {
        next = find('.map-v2-dock[data-map-v2-node-id="blood_moon_tower"] .map-v2-primary-action'); step = "open_activity";
        if (!next) { next = find('button[data-map-v2-node-id="blood_moon_tower"]'); step = "tower"; }
        if (!next) { next = find('[data-map-v2-section-id="iron_march"] button'); step = "iron_march"; }
        if (!next && find("#mapBack")) { next = find(".map-v2-back"); step = "sections"; }
        if (!next) { next = find('#ahBottomNav [data-go="map"]'); step = "map"; }
      } else {
        next = find('#mTacticalAccess [data-act="open_tactical_ops"]'); step = "tactical_ops";
        if (!next) { next = find('#ahBottomNav [data-go="missions"]'); step = "missions"; }
      }
      if (next && saved[legacyId].step !== step) { saved[legacyId].step = step; persist(); }
      paint(next, legacyId, step);
      return;
    }

    if (!postFtueReady()) { paint(null); return; }
    const postId = Object.keys(POST_ROUTES).find(id => saved[id]?.status === "active");
    if (!postId) { paint(null); return; }
    const resolved = postStep(postId);
    if (resolved.target && saved[postId].step !== resolved.step) {
      saved[postId].step = resolved.step;
      persist();
    }
    paint(resolved.target, postId, resolved.step);
  }

  function reset() {
    saved = {};
    paint(null);
    try { global.localStorage.removeItem(KEY); } catch (_) {}
    notifyState();
  }

  function state() { return JSON.parse(JSON.stringify(saved)); }
  function reached(id) { return !!saved[id]?.reached; }
  function postRoutes() { return Object.keys(POST_ROUTES); }

  function init() {
    const style = document.createElement("style");
    style.textContent = '.ah-guided-target{outline:2px solid #9fd6ff!important;outline-offset:2px!important;box-shadow:0 0 0 4px rgba(159,214,255,.12)!important}#ahGuidedNavigation{position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483646;display:flex;align-items:flex-start;gap:10px;width:min(520px,90vw);padding:10px 12px;border:1px solid rgba(159,214,255,.22);border-radius:12px;background:#08121df2;color:#eef8ff;font:700 12px system-ui;pointer-events:none;box-shadow:0 14px 40px rgba(0,0,0,.35)}#ahGuidedNavigation[hidden]{display:none}#ahGuidedNavigation span{display:block;white-space:pre-line;line-height:1.42}#ahGuidedNavigation button{flex:0 0 auto;pointer-events:auto;min-height:44px;margin-left:auto;background:transparent;border:0;color:#bdd7e8;cursor:pointer}';
    document.head.appendChild(style);
    notice = document.createElement("aside"); notice.id = "ahGuidedNavigation"; notice.hidden = true;
    notice.innerHTML = '<span role="status"></span><button type="button">Not now</button>';
    document.body.appendChild(notice);
    let queued = false;
    new MutationObserver(records => {
      if (records.every(r => r.target === notice || notice.contains(r.target) || (r.type === "attributes" && r.attributeName === "class" && r.target === target))) return;
      if (!queued) { queued = true; global.requestAnimationFrame(() => { queued = false; refresh(); }); }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class", "hidden", "data-open", "data-map-v2-surface"] });
    global.StoryDelivery?.subscribe?.(refresh);
    global.FirstSessionSpine?.subscribe?.(refresh);
    document.addEventListener("click", () => { void syncCompletion(); });
    refresh(); void syncCompletion();
  }

  global.GuidedNavigation = {
    start, refresh, dismiss, reset, terminal, eligible, reached, postFtueReady, postRoutes, state
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
