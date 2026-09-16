(function (global) {
  "use strict";
  const KEY = "ah.ftue.coreSystemDiscovery.v1";
  let dismissed = false;
  const destinations = [
    ["adopt", "ADOPT CENTER", "Find companions for your Pack."],
    ["shop", "SHOP", "See what's currently available."],
    ["skins", "SKINS", "Change your look, not your power."],
    ["badges", "BADGE WALL", "See what you've actually earned."]
  ];
  function read(key) { try { return global.localStorage.getItem(key) || ""; } catch (_) { return ""; } }
  function write(key, value) { try { global.localStorage.setItem(key, value); } catch (_) {} }
  function acknowledged() { return dismissed || read(KEY) === "1"; }
  function eligible(inputs) {
    const fs = inputs?.firstSignal || inputs?.tutorial?.first_signal;
    if (!fs || fs.eligible !== true || fs.state !== "COMPLETED") return false;
    const world = String(fs.world_discovery || fs.worldDiscovery || "").toLowerCase();
    return world === "done";
  }
  function view(inputs) {
    const available = eligible(inputs) && !acknowledged();
    return { available, intro: available };
  }
  function dismiss() {
    dismissed = true;
    write(KEY, "1");
    refresh();
  }
  async function go(id) {
    if (!eligible(global.StoryDelivery?.gatherInputs?.())) return false;
    if (!destinations.some(row => row[0] === id)) return false;
    if (id === "skins") {
      const opened = global.ContextualDiscovery?.openDestination
        ? await global.ContextualDiscovery.openDestination("skins")
        : (typeof global.Skins?.open === "function" ? await global.Skins.open() : false);
      if (opened === true) dismiss();
      return opened === true;
    }
    if (id === "badges") {
      if (!global.openBadgeWallModal) return false;
      global.HomeNav?.closeAll?.();
      await global.openBadgeWallModal();
      dismiss();
      return true;
    }
    const button = document.querySelector('#hubBack [data-action="' + id + '"]');
    if (button) {
      button.click();
      dismiss();
      return true;
    }
    if (id === "adopt" && typeof global.Adopt?.open === "function") {
      global.HomeNav?.closeAll?.();
      await global.Adopt.open();
      dismiss();
      return true;
    }
    if (id === "shop" && typeof global.Shop?.open === "function") {
      global.HomeNav?.closeAll?.();
      await global.Shop.open();
      dismiss();
      return true;
    }
    return false;
  }
  function refresh() {
    const root = document.getElementById("alphaCoreSystemDiscovery");
    if (!root) return;
    const state = view(global.StoryDelivery?.gatherInputs?.());
    root.hidden = !state.available;
  }
  function init() {
    const root = document.getElementById("alphaCoreSystemDiscovery");
    if (!root) return;
    root.innerHTML = '<div data-core-intro style="padding:10px 0">'
      + '<b>KNOW YOUR WORLD</b>'
      + destinations.map(([id, name, line]) => '<div style="display:flex;align-items:center;gap:10px;padding:10px 0"><div style="flex:1;min-width:0"><b>' + name + '</b><div style="font-size:12px;opacity:.75">' + line + '</div></div><button type="button" class="ah-action" style="min-width:48px;width:auto" data-core-go="' + id + '" aria-label="Go to ' + name + '">GO</button></div>').join("")
      + '<button type="button" class="ah-action" data-core-later style="width:100%">Not now</button>'
      + '<p role="status" data-core-status></p></div>';
    root.querySelector("[data-core-later]").onclick = dismiss;
    root.addEventListener("click", async event => {
      const button = event.target.closest("[data-core-go]");
      if (!button) return;
      button.disabled = true;
      try {
        const ok = await go(button.getAttribute("data-core-go"));
        const status = root.querySelector("[data-core-status]");
        if (status) status.textContent = ok ? "" : "Could not open this destination. Try again.";
      } catch (_) {
        const status = root.querySelector("[data-core-status]");
        if (status) status.textContent = "Could not open this destination. Try again.";
      } finally { button.disabled = false; }
    });
    global.StoryDelivery?.subscribe(refresh);
    refresh();
  }
  global.CoreSystemDiscovery = { view, go, dismiss, eligible };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
