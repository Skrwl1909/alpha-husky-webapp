(function () {
  function initCommunityBtn() {
    const btn = document.getElementById("ahCommunityBtn");
    if (!btn) return;
    if (btn.dataset.bound === "1") return;

    btn.dataset.bound = "1";

    btn.addEventListener("click", function () {
      const tg = window.Telegram?.WebApp || null;
      const url = "https://t.me/The_Alpha_husky";

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
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommunityBtn, { once: true });
  } else {
    initCommunityBtn();
  }
})();
