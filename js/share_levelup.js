// public/js/share_levelup.js
(function () {
  function safeToast(msg) {
    try { window.toast?.(msg); return; } catch (_) {}
    try { Telegram?.WebApp?.showPopup?.({ title: "Alpha Husky", message: msg, buttons: [{ type: "close" }] }); return; } catch (_) {}
    try { alert(msg); } catch (_) {}
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  async function apiPost(path, body) {
    // jeśli masz już globalne window.apiPost — użyj go
    if (typeof window.apiPost === "function") return window.apiPost(path, body);

    // minimalny fallback (gdybyś odpalał standalone)
    const initData = Telegram?.WebApp?.initData || "";
    const res = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": initData ? ("Bearer " + initData) : ""
      },
      body: JSON.stringify({ ...(body || {}), init_data: initData })
    });
    return res.json();
  }

  async function createLevelUpShareCard(style) {
    const payload = { style: Number(style || 1) };
    const r = await apiPost("/webapp/share/levelup", payload);
    if (!r || !r.ok) throw new Error((r && (r.reason || r.error)) || "SHARE_FAIL");
    return r; // { ok, style, file, url, abs }
  }

  async function shareLevelUp(style) {
    try {
      const r = await createLevelUpShareCard(style);
      const link = r.abs || r.url;

      // 1) skopiuj link
      const okCopy = await copyToClipboard(link);
      if (okCopy) safeToast("Share link copied ✅");
      else safeToast("Couldn’t copy automatically. Link opened.");

      // 2) otwórz preview w nowej karcie (Telegram WebApp też otworzy)
      try { Telegram?.WebApp?.openLink?.(link); }
      catch (_) { window.open(link, "_blank"); }

      return r;
    } catch (e) {
      safeToast("Share card failed: " + (e?.message || e));
      throw e;
    }
  }

  // public API
  window.ShareLevelUp = {
    share: shareLevelUp,
    create: createLevelUpShareCard
  };
})();
