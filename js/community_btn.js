(function () {
  function initCommunityBtn() {
    const btn = document.getElementById("ahCommunityBtn");
    if (!btn) return;
    if (btn.dataset.bound === "1") return;

    btn.dataset.bound = "1";

    function openCommunity(urlOverride) {
      const tg = window.Telegram?.WebApp || null;
      const url = String(urlOverride || "https://t.me/The_Alpha_husky").trim();
      if (!url) return;

      try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      try {
        if (tg?.openTelegramLink) {
          tg.openTelegramLink(url);
          return;
        }
      } catch (_) {}

      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (_) {
        window.location.href = url;
      }
    }

    // Pack Comms reuses this single Telegram fallback path rather than owning a second URL helper.
    window.AHOpenCommunityLink = openCommunity;

    btn.addEventListener("click", function () {
      if (window.PackComms?.openFromLauncher) {
        window.PackComms.openFromLauncher();
        return;
      }
      openCommunity();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommunityBtn, { once: true });
  } else {
    initCommunityBtn();
  }
})();
