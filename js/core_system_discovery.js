(function (global) {
  "use strict";
  // Compatibility bridge. POST-FTUE discovery is owned by DiscoveryGuide V1.
  function hideLegacyRoot() {
    const root = document.getElementById("alphaCoreSystemDiscovery");
    if (root) { root.hidden = true; root.innerHTML = ""; }
  }
  const api = {
    eligible: () => false,
    view: () => ({ available: false, intro: false }),
    dismiss: hideLegacyRoot,
    go: id => global.DiscoveryGuide?.go?.(id) || false,
    refresh: hideLegacyRoot
  };
  global.CoreSystemDiscovery = api;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hideLegacyRoot, { once: true });
  else hideLegacyRoot();
})(window);
