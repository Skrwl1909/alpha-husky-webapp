(function (global) {
  "use strict";
  const KEY = "ah.ftue.discoveryGuideSeen.v1";
  let dismissed = false;
  const destinations = [
    ["missions", "Missions", "Open the mission board."],
    ["war_table", "Tactical Ops", "Open turn-based squad operations directly."],
    ["shop", "Shop", "Browse gear and supplies."],
    ["badges", "Badges & Titles", "Find your badges and active title."],
    ["howlboard", "Howlboard", "See the player rankings."]
  ];
  function read(key) { try { return global.localStorage.getItem(key) || ""; } catch (_) { return ""; } }
  function eligible(inputs) {
    const fs = inputs?.firstSignal || inputs?.tutorial?.first_signal;
    const camp = inputs?.campaign?.campaign;
    return !!(fs && fs.state === "COMPLETED" && camp?.markLeft && camp.playerDirective
      && read("ah.sd.markHandoffConsumed.v1") === camp.playerDirective
      && read("ah.sd.tacticalDiscovery.v1") === "consumed");
  }
  function view(inputs) {
    const available = eligible(inputs);
    return { available, intro: available && !dismissed && !read(KEY) };
  }
  function dismiss() {
    dismissed = true;
    try { global.localStorage.setItem(KEY, "1"); } catch (_) {}
    refresh();
  }
  async function go(id) {
    if (!eligible(global.StoryDelivery?.gatherInputs?.())) return false;
    if (!destinations.some(row => row[0] === id)) return false;
    if (id === "war_table") {
      return await global.Missions.openTacticalOps();
    }
    if (id === "missions") { global.HomeNav?.closeAll(); global.HomeNav.openMissions(); }
    else if (id === "badges") {
      if (!global.openBadgeWallModal) return false;
      global.HomeNav?.closeAll();
      await global.openBadgeWallModal();
    } else {
      const button = document.querySelector('#hubBack [data-action="' + id + '"]');
      if (!button) return false;
      button.click();
    }
    return true;
  }
  function refresh() {
    const root = document.getElementById("alphaDiscoveryGuide");
    if (!root) return;
    const state = view(global.StoryDelivery?.gatherInputs?.());
    root.hidden = !state.available;
    const intro = root.querySelector("[data-guide-intro]");
    intro.hidden = !state.intro;
  }
  function init() {
    const root = document.getElementById("alphaDiscoveryGuide");
    if (!root) return;
    root.innerHTML = '<div data-guide-intro hidden style="padding:10px 0"><b>EXPLORE ALPHA</b><p>Find the places you need. This guide stays in Hub Quick Access.</p><button type="button" class="ah-action" data-guide-start>Explore</button><button type="button" class="ah-action" data-guide-later>Later</button></div>'
      + '<details><summary style="cursor:pointer;padding:12px 0">EXPLORE ALPHA</summary>'
      + destinations.map(([id, name, line]) => '<div style="display:flex;align-items:center;gap:10px;padding:10px 0"><div style="flex:1;min-width:0"><b>' + name + '</b><div style="font-size:12px;opacity:.75">' + line + '</div></div><button type="button" class="ah-action" style="min-width:48px;width:auto" data-guide-go="' + id + '" aria-label="Go to ' + name + '">GO</button></div>').join("")
      + '<p role="status" data-guide-status></p></details>';
    root.querySelector("[data-guide-later]").onclick = dismiss;
    root.querySelector("[data-guide-start]").onclick = () => { dismiss(); root.querySelector("details").open = true; };
    root.querySelector("details").addEventListener("toggle", () => { if (root.querySelector("details").open) dismiss(); });
    root.addEventListener("click", async event => {
      const button = event.target.closest("[data-guide-go]");
      if (!button) return;
      button.disabled = true;
      try {
        const ok = await go(button.getAttribute("data-guide-go"));
        root.querySelector("[data-guide-status]").textContent = ok ? "" : "Could not open this destination. Try again.";
      } catch (_) { root.querySelector("[data-guide-status]").textContent = "Could not open this destination. Try again."; }
      finally { button.disabled = false; }
    });
    global.StoryDelivery?.subscribe(refresh);
    refresh();
  }
  global.DiscoveryGuide = { view, go, dismiss };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
