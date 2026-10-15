// FTUE Guidance P2 — post-graduation, opt-in discovery. Presentation only.
(function (w) {
  "use strict";
  const KEY = "ah.ftue.scoutGuidanceP2.v1";
  const STEPS = [
    { id: "stats", hub: "Your build is growing. Good. The Pack needs strong members. Find your attributes under Character → Stats → Build.", inside: "These are your attributes. If you have unspent points, + lets you choose where to grow." },
    { id: "pets", hub: "You don't have to face everything alone. Character → Pets shows the companions you have.", inside: "An active companion fights alongside you and strengthens your build. No companion yet? You can come back later." },
    { id: "forge", hub: "Gear can grow with you. The Worksmith Forge lets you inspect upgrades when you have the materials.", inside: "Check the upgrade preview and material cost before deciding. There's no need to upgrade right now." }
  ];
  let saved = { seenHub: [], seenInside: [], dismissed: [] }, lastRoot = null;
  try { saved = { ...saved, ...JSON.parse(w.localStorage.getItem(KEY) || "{}") }; } catch (_) {}
  const valid = arr => Array.isArray(arr) ? arr.filter(v => STEPS.some(s => s.id === v)) : [];
  saved.seenHub = valid(saved.seenHub);
  saved.seenInside = valid(saved.seenInside);
  saved.dismissed = valid(saved.dismissed);
  function persist() { try { w.localStorage.setItem(KEY, JSON.stringify(saved)); } catch (_) {} }
  function graduated() { return w.FirstSessionSpine?.view?.().complete === true; }
  function visible(el) { return !!(el && el.isConnected && el.getClientRects().length && w.getComputedStyle(el).visibility !== "hidden" && w.getComputedStyle(el).display !== "none"); }
  function safe() {
    if (!graduated() || document.visibilityState === "hidden") return false;
    if (w.Awakening?.isOpen?.() || w.Oath?.isOpen?.() || w.Onboarding?.isOpen?.()) return false;
    if (visible(document.getElementById("missionsModal")) || visible(document.getElementById("tacticalOpsRoot"))) return false;
    return true;
  }
  function card(step, message, kind) {
    const el = document.createElement("aside");
    el.className = "ah-p2-guide";
    el.dataset.p2 = step.id;
    el.setAttribute("aria-label", "Optional Scout guidance");
    el.innerHTML = (w.ScoutComms?.render?.(message) || "<p>" + message.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</p>")
      + '<button type="button" class="ah-p2-dismiss" aria-label="Dismiss this Scout hint">Got it</button>';
    el.querySelector("button").onclick = () => {
      if (!saved.dismissed.includes(step.id)) saved.dismissed.push(step.id);
      persist();
      el.remove();
      refresh();
    };
    if (kind === "hub" && !saved.seenHub.includes(step.id)) saved.seenHub.push(step.id);
    if (kind === "inside" && !saved.seenInside.includes(step.id)) saved.seenInside.push(step.id);
    persist();
    return el;
  }
  function styles() {
    if (document.getElementById("ah-p2-style")) return;
    const s = document.createElement("style"); s.id = "ah-p2-style";
    s.textContent = ".ah-p2-guide{display:block;min-width:0;margin:10px 0;max-width:100%}.ah-p2-dismiss{display:block;margin:6px 0 0 auto;border:0;background:transparent;color:#b3dce8;min-height:44px;padding:8px 12px;font:700 12px system-ui;cursor:pointer}.ah-p2-guide .ah-scout-comms{padding:10px 12px}.ah-p2-guide .ah-scout-comms__avatar,.ah-p2-guide .ah-scout-comms__fallback{width:40px;height:40px;flex-basis:40px}";
    document.head.appendChild(s);
  }
  function refresh() {
    if (!safe()) { document.querySelectorAll(".ah-p2-guide").forEach(el => el.remove()); return; }
    styles();
    const stats = document.getElementById("statsBack");
    const pets = document.getElementById("mypetsModal");
    const forge = document.getElementById("ahForgeBack");
    const locations = [
      { id: "stats", root: document.getElementById("statsRoot"), open: visible(stats) },
      { id: "pets", root: document.getElementById("mypetsList"), open: visible(pets) },
      { id: "forge", root: forge?.querySelector(".ah-forge-body"), open: visible(forge) }
    ];
    const current = locations.find(v => v.open && v.root);
    if (current) {
      const step = STEPS.find(s => s.id === current.id);
      const old = document.querySelector(".ah-p2-guide");
      if (old?.dataset.p2 !== step.id || old.parentElement !== current.root) old?.remove();
      if (!saved.seenInside.includes(step.id)) current.root.prepend(card(step, step.inside, "inside"));
      return;
    }
    const hub = document.getElementById("hubBack");
    const host = document.getElementById("hubStoryRoot");
    if (!visible(hub) || !host) { document.querySelectorAll(".ah-p2-guide").forEach(el => el.remove()); return; }
    const step = STEPS.find(s => !saved.seenHub.includes(s.id) && !saved.dismissed.includes(s.id));
    const existing = host.querySelector(".ah-p2-guide");
    // Keep the currently visible hint during DOM mutation refreshes.
    if (existing && saved.seenHub.includes(existing.dataset.p2)) return;
    document.querySelectorAll(".ah-p2-guide").forEach(el => el.remove());
    // One optional hint per Hub entry; do not cycle through all three in a single visit.
    if (!step || lastRoot === hub && host.dataset.p2Visit === "shown") return;
    host.dataset.p2Visit = "shown";
    lastRoot = hub;
    host.appendChild(card(step, step.hub, "hub"));
  }
  function resetVisit() { const host = document.getElementById("hubStoryRoot"); if (host) delete host.dataset.p2Visit; refresh(); }
  function init() {
    document.addEventListener("visibilitychange", resetVisit);
    w.addEventListener("pagehide", () => document.querySelectorAll(".ah-p2-guide").forEach(el => el.remove()));
    w.addEventListener("ah:session-state-changed", refresh);
    w.FirstSessionSpine?.subscribe?.(refresh);
    const mo = new MutationObserver(() => { if (!document.__ahP2Pending) { document.__ahP2Pending = true; Promise.resolve().then(() => { document.__ahP2Pending = false; refresh(); }); } });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "data-open"] });
    refresh();
  }
  w.ScoutGuidanceP2 = { refresh, reset: () => { saved = { seenHub: [], seenInside: [], dismissed: [] }; try { w.localStorage.removeItem(KEY); } catch (_) {} refresh(); }, eligible: graduated };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})(window);
