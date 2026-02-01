// js/share_levelup.js
(function (global) {
  function toast(msg) {
    try {
      if (global.Telegram?.WebApp?.showPopup) {
        global.Telegram.WebApp.showPopup({
          title: "Share Card",
          message: String(msg || ""),
          buttons: [{ type: "close" }]
        });
        return;
      }
    } catch (_) {}
    alert(msg);
  }

  async function copyText(s) {
    try {
      await navigator.clipboard.writeText(String(s));
      return true;
    } catch (_) {
      return false;
    }
  }

  function openLink(url) {
    try {
      if (global.Telegram?.WebApp?.openLink) {
        global.Telegram.WebApp.openLink(url);
        return;
      }
    } catch (_) {}
    window.open(url, "_blank");
  }

  async function share(style) {
    const apiPost = global.apiPost || global.AH?.apiPost;
    if (!apiPost) {
      toast("apiPost missing (frontend not initialized yet)");
      return;
    }

    try { global.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

    const res = await apiPost("/webapp/share/levelup", { style: Number(style || 1) });
    if (!res || !res.ok) {
      toast("Share failed: " + (res?.reason || "UNKNOWN"));
      return;
    }

    // priorytet: ABS z backendu (pewne)
    const url = res.abs || (location.origin + (res.url || ""));
    const copied = await copyText(url);

    toast(copied ? "Link copied ✅" : "Opened ✅ (copy blocked)");
    openLink(url);
  }

  // event delegation – działa nawet jak guziki są dodane dynamicznie
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-share-levelup-style]");
    if (!btn) return;
    const style = Number(btn.getAttribute("data-share-levelup-style") || "1");
    share(style);
  });

  global.ShareLevelUp = { share };
})(window);
