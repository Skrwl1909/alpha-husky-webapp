```js
// js/share_levelup.js — FINAL v2.1
// ✅ shareRow forced ABOVE hero-frame
// ✅ run_id + busy lock + haptics
// ✅ better popup: Open / Copy / Post on X
// ✅ apiPost lookup: window.apiPost OR window.S.apiPost OR window.AH.apiPost
// ✅ supports buttons: data-share-style OR data-share-levelup-style
(function (global) {
  let _dbg = false;
  const log = (...a) => { if (_dbg) console.log("[ShareLevelUp]", ...a); };

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

  // prefer shared run_id helper if present (you already have AH_makeRunId)
  function mkRunId(prefix, key) {
    try {
      if (typeof global.AH_makeRunId === "function") {
        return global.AH_makeRunId(prefix || "share", key || "");
      }
    } catch (_) {}
    const uid = String(global.Telegram?.WebApp?.initDataUnsafe?.user?.id || "0");
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${String(prefix || "share")}:${uid}:${Date.now()}:${rnd}`;
  }

  function getRow() {
    return (
      document.getElementById("shareRow") ||
      document.querySelector(".share-row") ||
      document.querySelector('[data-ui="shareRow"]')
    );
  }

  function getHero() {
    return (
      document.getElementById("hero-frame") ||
      document.getElementById("heroFrame") ||
      document.querySelector(".hero-frame") ||
      document.querySelector("#heroFrame") ||
      document.querySelector("#hero-frame")
    );
  }

  function showRow() {
    const row = getRow();
    if (!row) return false;
    row.style.display = "flex";
    row.style.visibility = "visible";
    return true;
  }

  // 🔥 move row before hero (above skin)
  function ensureRowAboveSkin() {
    const row = getRow();
    const hero = getHero();
    if (!row || !hero || !hero.parentNode) return false;

    // already right above hero => ok
    if (row.parentNode === hero.parentNode && row.nextElementSibling === hero) return true;

    try {
      hero.parentNode.insertBefore(row, hero);
      // spacing polish (if CSS already sets margin-bottom, do not override)
      if (!row.style.marginBottom) row.style.marginBottom = "10px";
      if (!row.style.justifyContent) row.style.justifyContent = "center";
      return true;
    } catch (e) {
      log("ensureRowAboveSkin failed", e);
      return false;
    }
  }

  async function copyText(s) {
    const text = String(s ?? "");
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
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

  // ✅ X intent helper
  function buildXIntent(cardUrl) {
    // pull level from UI: "Lv.65" / "LV 65" / etc.
    const raw =
      (document.getElementById("heroLevel")?.textContent || "") ||
      (document.querySelector("#heroLevel")?.textContent || "");

    const m = String(raw || "").match(/(\d+)/);
    const lvl = m ? m[1] : "";

    // short, human copy
    const text =
      `LEVEL UP.\n` +
      `Pack Lv ${lvl || "?"}. 🐺\n` +
      `No noise — just work.\n\n` +
      `#AlphaHusky #HOWLitsMade`;

    const base = "https://x.com/intent/tweet";
    const p = new URLSearchParams();
    p.set("text", text);
    p.set("url", String(cardUrl || ""));
    return base + "?" + p.toString();
  }

  // optional: best-effort share as file (works only on some devices/webviews)
  async function tryNativeShareImage(cardUrl, caption) {
    try {
      if (!navigator.share) return false;
      const r = await fetch(cardUrl, { cache: "no-store" });
      const blob = await r.blob();
      const file = new File([blob], "alpha_levelup.png", { type: blob.type || "image/png" });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) return false;
      await navigator.share({ files: [file], text: String(caption || "") });
      return true;
    } catch (_) {
      return false;
    }
  }

  async function postOnX(cardUrl) {
    const intent = buildXIntent(cardUrl);
    // first: try native share image (if allowed), otherwise open intent
    const caption = "LEVEL UP. 🐺";
    const ok = await tryNativeShareImage(cardUrl, caption);
    if (!ok) openLink(intent);
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
              { id: "x", type: "default", text: "Post on X" },
              { type: "close" }
            ]
          },
          async (btnId) => {
            if (btnId === "open") openLink(url);
            if (btnId === "copy") {
              const ok = await copyText(url);
              toast("Share Card", ok ? "Link copied ✅" : "Copy blocked on this device.");
            }
            if (btnId === "x") {
              try { await postOnX(url); } catch (_) { openLink(buildXIntent(url)); }
            }
          }
        );
        return;
      } catch (_) {}
    }

    // fallback (no Telegram popup)
    if (confirm("Share card generated. Open it now?")) openLink(url);
  }

  async function share(style, btnEl) {
    const apiPost =
      global.apiPost ||
      global.S?.apiPost ||
      global.AH?.apiPost;

    if (!apiPost) {
      toast("Share Card", "apiPost missing (frontend not initialized yet)");
      return;
    }

    if (btnEl?.dataset?.busy === "1") return;

    try {
      btnEl && (btnEl.dataset.busy = "1", btnEl.disabled = true);
      try { global.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      const st = Number(style || 1);

      const res = await apiPost("/webapp/share/levelup", {
        style: st,
        run_id: mkRunId("share", "style=" + st)
      });

      if (!res || res.ok !== true) {
        toast("Share Card", "Share failed: " + (res?.reason || res?.error || "UNKNOWN"));
        return;
      }

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
      log("share error", e);
      toast("Share Card", "Failed to generate.\n\n" + String(e?.message || e));
    } finally {
      if (btnEl) {
        btnEl.disabled = false;
        delete btnEl.dataset.busy;
      }
    }
  }

  // click delegation (supports both attrs)
  document.addEventListener("click", (e) => {
    const btn =
      e.target.closest("[data-share-levelup-style]") ||
      e.target.closest("[data-share-style]");
    if (!btn) return;

    ensureRowAboveSkin(); // keep it pinned above before action

    const style = Number(
      btn.getAttribute("data-share-levelup-style") ||
      btn.getAttribute("data-share-style") ||
      "1"
    );

    share(style, btn);
  });

  // wrap loadProfile to show+move row after profile loads
  function wrapLoadProfile() {
    const orig = global.loadProfile;
    if (typeof orig !== "function") return;
    if (orig.__share_wrapped) return;

    const wrapped = async function (...args) {
      const out = await orig.apply(this, args);
      try { showRow(); ensureRowAboveSkin(); } catch (_) {}
      return out;
    };
    wrapped.__share_wrapped = true;
    global.loadProfile = wrapped;
  }

  function hook() {
    // try immediately
    requestAnimationFrame(() => {
      showRow();
      ensureRowAboveSkin();
    });

    // if loadProfile appears later
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

  global.ShareLevelUp = { share, showRow, ensureRowAboveSkin };

  hook();
})(window);
```
