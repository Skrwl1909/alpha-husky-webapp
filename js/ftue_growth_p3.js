// FTUE P3: read-only growth opportunities from confirmed game state.
(function (w) {
  "use strict";
  let points = null, petState = null;
  const validPoints = n => Number.isFinite(Number(n)) && Number(n) >= 0 ? Number(n) : null;
  function graduated() { return w.FirstSessionSpine?.view?.().complete === true; }
  function observeStats(mystats) {
    points = validPoints(mystats?.unspentPoints);
    w.StoryDelivery?.refreshHub?.("ftue_growth_stats");
  }
  function observePets(state) {
    if (!state || typeof state !== "object") { petState = null; return; }
    const items = Object.values(state.pets || {}).filter(x => x && typeof x === "object");
    petState = { count: items.length, active: !!(state.activePetId || items.some(x => x.is_active === true)) };
    w.StoryDelivery?.refreshHub?.("ftue_growth_pets");
  }
  function choice() {
    if (!graduated()) return null;
    if (points !== null && points > 0) return {
      key: "growth-stats", action: "Spend your stat points",
      reason: points + " unspent " + (points === 1 ? "point" : "points") + ". Your next build choice is yours.",
      destination: "stats"
    };
    // Do not invent ownership or offer adoption as a mandatory quest.
    if (petState && petState.count > 0 && !petState.active) return {
      key: "growth-pets", action: "Meet your companions",
      reason: "You have a companion waiting. Visit Character → Pets to choose an active one.",
      destination: "pets"
    };
    return null;
  }
  async function open(destination) {
    if (!graduated()) return false;
    if (destination === "stats") return w.ContextualDiscovery?.openDestination?.("stats") === true
      || await w.ContextualDiscovery?.openDestination?.("stats") === true;
    if (destination === "pets" && typeof w.MyPets?.open === "function") {
      w.HomeNav?.closeAll?.();
      await w.MyPets.open();
      return true;
    }
    return false;
  }
  function reset() { points = null; petState = null; }
  w.FtueGrowthP3 = Object.freeze({ choice, observeStats, observePets, open, reset });
})(window);
