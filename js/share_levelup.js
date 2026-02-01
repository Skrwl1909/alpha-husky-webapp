// js/share_levelup.js — FINAL (Share buttons + auto show row + run_id + better popup)
(function (global) {
  let _dbg = false;

  function log(...a) { if (_dbg) console.log("[ShareLevelUp]", ...a); }

  function toast(title, msg) {
    const t = String(title || "Share Card");
    const m = String(msg || "");
    try {
      if (global.Telegram?.WebApp?.showPopup) {
        global.Telegram.WebApp.showPopup({
          title: t,
          message: m,
          buttons: [{ type: "close" }]
        });
        return;
      }
    } catch (_) {}
    alert(t + "\n\n" + m);
  }

  function mkRunId(prefix) {
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${Date.now()}_${rnd}`;
  }

  async function copyText(s) {
    const text = String(s ?? "");
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // fallback for older WebViews
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return !!ok;
      } catch (e) {
        return false;
      }
    }
  }

  function openLink(url) {
    const u = String(url || "");
    try {
      if (global.Telegram?.WebApp?.openLink) {
        global.Telegram.WebApp.openLink(u);
        return;
      }
    } catch (_) {}
    window.open(u, "_blank", "noopener");
  }

  function showRow() {
    const row =
      document.getElementById("shareRow") ||
      document.querySelector(".share-row") ||
      document.querySelector('[data-ui="shareRow"]');
    if (!row) return false;
    row.style.display = "flex";
    row.style.visibility = "visible";
    return true;
  }

  function popupResult(url) {
    const tg = global.Telegram?.WebApp;

    if (tg?.showPopup) {
      try {
        tg.showPopup(
          {
            title: "Share Card Ready",
            message: "Card generated. Open it, save, and share.",
            buttons: [
              { id: "open", type: "default", text: "Open card" },
              { id: "copy", type: "default", text: "Copy link" },
              { type: "close" }
            ]
          },
          async (btnId) => {
            if (btnId === "open") openLink(url);
            if (btnId === "copy") {
              const ok = await copyText(url);
              toast("Share Card", ok ? "Link copied ✅" : "Copy blocked on this device.");
            }
          }
        );
        return;
      } catch (_) {}
    }

    // fallback
    const ok = confirm("Share card generated. Open it now?");
    if (ok) openLink(url);
  }

  async function share(style, btnEl) {
    const apiPost = global.apiPost || global.AH?.apiPost;
    if (!apiPost) {
      toast("Share Card", "apiPost missing (frontend not initialized yet)");
      return;
    }

    if (btnEl && btnEl.dataset && btnEl.dataset.busy === "1") return;

    try {
      if (btnEl) {
        btnEl.dataset.busy = "1";
        btnEl.disabled = true;
      }
      try { global.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      const payload = {
        style: Number(style || 1),
        run_id: mkRunId("share")
      };

      const res = await apiPost("/webapp/share/levelup", payload);
      if (!res || res.ok !== true) {
        toast("Share Card", "Share failed: " + (res?.reason || res?.error || "UNKNOWN"));
        return;
      }

      // backend may return: abs OR public_rel OR url
      const url =
        res.abs ||
        (res.public_rel ? (location.origin + res.public_rel) : null) ||
        (res.url ? (location.origin + res.url) : null);

      if (!url) {
        toast("Share Card", "Share failed: missing URL in response");
        return;
      }

      popupResult(url);
    } catch (e) {
      log("error", e);
      toast("Share Card", "Failed to generate.\n\n" + String(e?.message || e));
    } finally {
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.dataset.busy = "0";
        delete btnEl.dataset.busy;
      }
    }
  }

  // ===== Auto-show shareRow after loadProfile =====
  function wrapLoadProfile() {
    const orig = global.loadProfile;
    if (typeof orig !== "function") return;

    if (orig.__share_wrapped) return;

    const wrapped = async function (...args) {
      const out = await orig.apply(this, args);
      try { showRow(); } catch (_) {}
      return out;
    };
    wrapped.__share_wrapped = true;

    global.loadProfile = wrapped;
  }

  function hook() {
    // show ASAP (in case row exists already)
    try { requestAnimationFrame(() => showRow()); } catch (_) {}

    // wrap loadProfile even if it appears later
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (typeof global.loadProfile === "function") {
        wrapLoadProfile();
        clearInterval(t);
      } else if (tries > 200) {
        clearInterval(t);
      }
    }, 50);
  }

  // ===== Event delegation (supports BOTH attribute names) =====
  document.addEventListener("click", (e) => {
    // old attribute:
    let btn = e.target.closest("[data-share-levelup-style]");
    // new attribute (optional):
    if (!btn) btn = e.target.closest("[data-share-style]");
    if (!btn) return;

    const style = Number(
      btn.getAttribute("data-share-levelup-style") ||
      btn.getAttribute("data-share-style") ||
      "1"
    );

    share(style, btn);
  });

  // public API
  global.ShareLevelUp = { share, showRow };

  // init (no-op safe)
  hook();
})(window);
