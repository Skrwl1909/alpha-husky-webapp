(function (global) {
  "use strict";
  const KEY = "ah.ftue.guidedNavigation.v1";
  let saved = {}, target = null, notice = null, syncing = false;
  try { saved = JSON.parse(global.localStorage.getItem(KEY) || "{}"); } catch (_) {}
  function terminal(id) {
    if (["done", "dismissed"].includes(saved[id]?.status)) return true;
    if (id === "tactical") {
      try {
        return global.localStorage.getItem("ah.sd.tacticalDiscovery.v1") === "consumed"
          || global.localStorage.getItem("ah.sd.nextMoveDismissed.v1") === "tactical-first-attempt";
      } catch (_) {}
    }
    return false;
  }
  function persist() { try { global.localStorage.setItem(KEY, JSON.stringify(saved)); } catch (_) {} }
  function firstSignal() { return global.StoryDelivery?.gatherInputs?.()?.firstSignal || {}; }
  function eligible(id) {
    const fs = firstSignal();
    if (!fs.eligible || fs.state !== "COMPLETED" || terminal(id) || global.FirstSessionSpine?.view()?.complete) return false;
    if (id === "bloodmoon") return fs.world_discovery === "pending";
    const frame = global.StoryDelivery?.getState?.();
    return frame?.id === "S-TO-DISCOVERY" || frame?.nextMove?.key === "tactical-first-attempt";
  }
  function start(id) {
    if (!eligible(id)) return false;
    if (!saved[id]) { saved[id] = { status: "active", step: id === "bloodmoon" ? "map" : "missions" }; persist(); }
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
    if (terminal(id)) return;
    saved[id] = { ...saved[id], status, step: "complete" }; persist();
    if (id === "bloodmoon") void syncCompletion();
    else global.StoryDelivery?.consumeTacticalDiscovery?.();
    paint(null);
  }
  function dismiss(id) { if (saved[id]?.status === "active" || eligible(id)) finish(id, "dismissed"); }
  function visible(el) { return !!(el && !el.hidden && el.getClientRects().length && global.getComputedStyle(el).visibility !== "hidden"); }
  function find(selector) { return Array.from(document.querySelectorAll(selector)).find(visible) || null; }
  function paint(next, id) {
    if (target !== next) {
      target?.classList.remove("ah-guided-target");
      target = next;
      target?.classList.add("ah-guided-target");
    }
    if (!notice) return;
    notice.hidden = !next;
    if (next && notice.dataset.destination !== id) {
      notice.dataset.destination = id;
      notice.querySelector("span").textContent = id === "bloodmoon"
        ? "The Pack survived the Meme War. Then I reached the Edge. I found the Oracle. The Rewrite began. Trust inside the Pack started breaking. What followed became known as: THE FRACTURE.\n\nFIND BLOOD MOON TOWER"
        : "FIND TACTICAL OPS";
      notice.querySelector("button").onclick = () => dismiss(id);
    }
  }
  function refresh() {
    const fs = firstSignal();
    if (!fs.eligible || fs.state !== "COMPLETED") { paint(null); return; }
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
    if (fs.world_discovery === "done" && saved.bloodmoon?.status === "active") { saved.bloodmoon = { status: "done", step: "complete" }; persist(); }
    for (const id of ["bloodmoon", "tactical"]) {
      if (eligible(id) && !saved[id]) { saved[id] = { status: "active", step: id === "bloodmoon" ? "map" : "missions" }; persist(); }
    }
    const id = ["bloodmoon", "tactical"].find(id => saved[id]?.status === "active" && !terminal(id));
    if (!id) { paint(null); return; }
    let step, next;
    if (id === "bloodmoon") {
      next = find('.map-v2-dock[data-map-v2-node-id="blood_moon_tower"] .map-v2-primary-action'); step = "open_activity";
      if (!next) { next = find('button[data-map-v2-node-id="blood_moon_tower"]'); step = "tower"; }
      if (!next) { next = find('[data-map-v2-section-id="iron_march"] button'); step = "iron_march"; }
      if (!next && find('#mapBack')) { next = find('.map-v2-back'); step = "sections"; }
      if (!next) { next = find('#ahBottomNav [data-go="map"]'); step = "map"; }
    } else {
      next = find('#mTacticalAccess [data-act="open_tactical_ops"]'); step = "tactical_ops";
      if (!next) { next = find('#ahBottomNav [data-go="missions"]'); step = "missions"; }
    }
    // Reconcile with the visible surface after Back/reload; never restore a route.
    if (next && saved[id].step !== step) { saved[id].step = step; persist(); }
    paint(next, id);
  }
  function reset() { saved = {}; paint(null); try { global.localStorage.removeItem(KEY); } catch (_) {} }
  function init() {
    const style = document.createElement("style");
    style.textContent = '.ah-guided-target{outline:2px solid #9fd6ff!important;outline-offset:2px!important}#ahGuidedNavigation{position:fixed;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483646;display:flex;align-items:flex-start;gap:10px;width:min(520px,90vw);padding:10px 12px;border-radius:10px;background:#08121df0;color:#eef8ff;font:700 12px system-ui;pointer-events:none}#ahGuidedNavigation[hidden]{display:none}#ahGuidedNavigation span{display:block;white-space:pre-line;line-height:1.42}#ahGuidedNavigation button{flex:0 0 auto;pointer-events:auto;min-height:44px;margin-left:auto;background:transparent;border:0;color:#bdd7e8}';
    document.head.appendChild(style);
    notice = document.createElement("aside"); notice.id = "ahGuidedNavigation"; notice.hidden = true;
    notice.innerHTML = '<span role="status"></span><button type="button">Not now</button>';
    document.body.appendChild(notice);
    let queued = false;
    new MutationObserver(records => {
      if (records.every(r => r.target === notice || notice.contains(r.target) || (r.type === "attributes" && r.attributeName === "class" && r.target === target))) return;
      if (!queued) { queued = true; global.requestAnimationFrame(() => { queued = false; refresh(); }); }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class", "hidden", "data-open"] });
    global.StoryDelivery?.subscribe?.(refresh);
    document.addEventListener("click", () => { void syncCompletion(); });
    refresh(); void syncCompletion();
  }
  global.GuidedNavigation = { start, refresh, dismiss, reset, terminal, state: () => JSON.parse(JSON.stringify(saved)) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})(window);
