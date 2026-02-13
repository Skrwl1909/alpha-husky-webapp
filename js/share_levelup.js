// js/share_levelup.js — FINAL v2.4 (front-only AAA preview overlay)
// ✅ shareRow forced ABOVE hero-frame (even if DOM loads late / UI rerenders)
// ✅ run_id + busy lock + haptics
// ✅ NEW: Preview Modal overlays Nick + Faction logo (in circle) + clean LVL (moved lower)
// ✅ NEW: Save image button (helps X attach image)
// ✅ popup: Open / Save / Copy / Post on X
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

    // force visible (some builds keep inline display:none)
    row.style.display = "flex";
    row.style.visibility = "visible";
    row.style.pointerEvents = "auto";
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

  // ✅ X intent helper (text+link)
  function buildXIntent(cardUrl) {
    const lvl = getLevelFromUI();
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

  // save image helper (best-effort)
  async function saveImage(cardUrl) {
    try {
      const r = await fetch(cardUrl, { cache: "no-store" });
      const blob = await r.blob();
      const objUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objUrl;
      a.download = "alpha_levelup.png";
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(objUrl), 30_000);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ----------------------------
  // NEW: Preview modal with overlays (Nick + Faction logo in circle + LVL below circle)
  // ----------------------------
  function openPreview(cardUrl) {
    const url = String(cardUrl || "");
    const nick = getNickFromUI();
    const lvl = getLevelFromUI();
    const factionLogo = getFactionLogoFromUI();

    // remove previous if exists
    const old = document.getElementById("sharePreviewModal");
    if (old) old.remove();

    const wrap = document.createElement("div");
    wrap.id = "sharePreviewModal";
    wrap.style.cssText = `
      position:fixed; inset:0; z-index:2147483652;
      display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,.72); padding:16px;
    `;

    const sheet = document.createElement("div");
    sheet.style.cssText = `
      width:min(92vw, 760px);
      border-radius:18px;
      background:rgba(10,14,22,.95);
      box-shadow:0 18px 70px rgba(0,0,0,.6);
      overflow:hidden;
      border:1px solid rgba(140,190,255,.18);
    `;

    const top = document.createElement("div");
    top.style.cssText = `
      display:flex; justify-content:space-between; align-items:center;
      padding:12px 14px; gap:10px;
      border-bottom:1px solid rgba(140,190,255,.12);
    `;
    top.innerHTML = `
      <div style="font-weight:900; letter-spacing:.2px;">Share Card Preview</div>
      <button id="spClose" type="button"
        style="background:transparent;border:0;color:rgba(255,255,255,.85);
               font-size:22px;line-height:1;cursor:pointer;padding:2px 6px;">✕</button>
    `;

    // TUNABLE overlay anchors (percent of image)
    // Name bar zone (top-left)
    const NAME_LEFT = "8.5%";
    const NAME_TOP  = "6.7%";
    const NAME_W    = "46%";
    const NAME_H    = "5.7%";

    // Faction logo circle (top-right)
    const FAC_RIGHT = "4.8%";
    const FAC_TOP   = "4.2%";
    const FAC_SIZE  = "9.6%"; // width, height uses aspect-ratio

    // Level badge (moved lower under circle)
    const LVL_RIGHT = "6.2%";
    const LVL_TOP   = "14.8%";
    const LVL_W     = "22%";
    const LVL_H     = "8.8%";

    const stage = document.createElement("div");
    stage.style.cssText = `position:relative; background:#05070b; font-size:0;`;
    stage.innerHTML = `
      <img id="spImg" src="${escapeHtml(url)}" style="display:block;width:100%;height:auto;" />

      <!-- Mask strip to reduce double-text on name bar (subtle) -->
      <div style="
        position:absolute; left:${NAME_LEFT}; top:${NAME_TOP};
        width:${NAME_W}; height:${NAME_H};
        border-radius:10px;
        background:rgba(0,0,0,.22);
        box-shadow:0 0 0 1px rgba(140,190,255,.12) inset;
      "></div>

      <!-- Nick overlay (inside name bar zone) -->
      <div style="
        position:absolute; left:${NAME_LEFT}; top:${NAME_TOP};
        width:${NAME_W}; height:${NAME_H};
        display:flex; align-items:center;
        padding:0 12px;
        color:#f2f8ff;
        font-weight:950;
        text-shadow:0 2px 8px rgba(0,0,0,.65), 0 0 18px rgba(120,190,255,.25);
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        font-size:clamp(14px,2.2vw,26px);
        letter-spacing:.2px;
      ">${escapeHtml(nick)}</div>

      ${
        factionLogo
          ? `
      <!-- Faction logo in the circle -->
      <div style="
        position:absolute; right:${FAC_RIGHT}; top:${FAC_TOP};
        width:${FAC_SIZE};
        aspect-ratio:1/1;
        border-radius:999px;
        overflow:hidden;
        border:1px solid rgba(140,190,255,.22);
        background:rgba(6,10,16,.55);
        box-shadow:0 0 18px rgba(120,190,255,.18), 0 10px 26px rgba(0,0,0,.35);
        display:flex; align-items:center; justify-content:center;
      ">
        <img src="${escapeHtml(factionLogo)}" alt="Faction"
          style="width:86%;height:86%;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,.6));" />
      </div>
      `
          : ""
      }

      <!-- Level badge (below circle) -->
      <div style="
        position:absolute; right:${LVL_RIGHT}; top:${LVL_TOP};
        width:${LVL_W}; height:${LVL_H};
        display:flex; align-items:center; justify-content:flex-end;
        padding:10px 12px; gap:10px;
        border-radius:12px;
        background:rgba(6,10,16,.72);
        border:1px solid rgba(140,190,255,.22);
        backdrop-filter: blur(6px);
        box-shadow:0 8px 22px rgba(0,0,0,.35);
      ">
        <div style="
          font-weight:950; letter-spacing:.3px;
          color:rgba(210,235,255,.92);
          text-shadow:0 2px 8px rgba(0,0,0,.65);
          font-size:clamp(12px,1.6vw,18px);
        ">LVL</div>
        <div style="
          font-weight:1000;
          color:#f2f8ff;
          text-shadow:0 2px 10px rgba(0,0,0,.72), 0 0 18px rgba(120,190,255,.18);
          font-size:clamp(22px,4.2vw,54px);
          line-height:1;
        ">${escapeHtml(lvl)}</div>
      </div>
    `;

    const actions = document.createElement("div");
    actions.style.cssText = `
      display:flex; gap:10px; padding:12px 14px; flex-wrap:wrap;
      border-top:1px solid rgba(140,190,255,.12);
    `;
    actions.innerHTML = `
      <button id="spOpen" type="button" style="${btnCss(false)}">Open card</button>
      <button id="spSave" type="button" style="${btnCss(false)}">Save image</button>
      <button id="spCopy" type="button" style="${btnCss(false)}">Copy link</button>
      <button id="spX" type="button" style="${btnCss(true)}">Post on X</button>
    `;

    sheet.appendChild(top);
    sheet.appendChild(stage);
    sheet.appendChild(actions);
    wrap.appendChild(sheet);
    document.body.appendChild(wrap);

    // close
    q("#spClose", wrap)?.addEventListener("click", () => wrap.remove());
    wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });

    // actions
    q("#spOpen", wrap)?.addEventListener("click", () => openLink(url));

    q("#spSave", wrap)?.addEventListener("click", async () => {
      const ok = await saveImage(url);
      if (ok) {
        toast("Share Card", "Saved / download triggered ✅ If it didn't save: Open card → long-press image → Save.");
        return;
      }
      toast("Share Card", "Save blocked here. Use: Open card → long-press image → Save.");
      openLink(url);
    });

    q("#spCopy", wrap)?.addEventListener("click", async () => {
      const ok = await copyText(url);
      toast("Share Card", ok ? "Link copied ✅" : "Copy blocked on this device.");
    });

    q("#spX", wrap)?.addEventListener("click", async () => {
      const caption = "LEVEL UP. 🐺 #AlphaHusky #HOWLitsMade";

      // 1) best case: share as file -> pick X/Twitter
      const ok = await tryNativeShareImage(url, caption);
      if (ok) {
        toast("Share Card", "Share sheet opened ✅ Choose X / Twitter.");
        return;
      }

      // 2) fallback: open X intent + tell user how to attach image
      toast("Share Card", "X in Telegram often can't attach images. Use Save image → open X → attach it manually.");
      openLink(buildXIntent(url));
    });

    function q(sel, root) { return (root || document).querySelector(sel); }

    function btnCss(primary) {
      return `
        appearance:none;
        border:1px solid ${primary ? "rgba(255,90,90,.35)" : "rgba(140,190,255,.22)"};
        background:${primary ? "rgba(255,60,60,.18)" : "rgba(10,16,26,.65)"};
        color:rgba(255,255,255,.92);
        padding:10px 12px;
        border-radius:12px;
        cursor:pointer;
        font-weight:900;
        letter-spacing:.2px;
      `;
    }
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function getNickFromUI() {
    const candidates = [
      "#heroName",
      "#heroNick",
      "#profileNick",
      "#profileName",
      "[data-hero-name]",
      "[data-profile-nick]",
      ".hero-name",
      ".profile-nick"
    ];
    for (const sel of candidates) {
      const t = document.querySelector(sel)?.textContent;
      if (t && String(t).trim()) return String(t).trim();
    }
    const tgName = global.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;
    return String(tgName || "Alpha").trim();
  }

  function getLevelFromUI() {
    const raw =
      (document.getElementById("heroLevel")?.textContent || "") ||
      (document.querySelector("#heroLevel")?.textContent || "") ||
      (document.querySelector("[data-hero-level]")?.textContent || "");

    const m = String(raw || "").match(/(\d+)/);
    return m ? m[1] : "?";
  }

  function getFactionLogoFromUI() {
    // Try a bunch of likely selectors (safe no-crash)
    const imgSelectors = [
      "#factionLogo img",
      "#faction-logo img",
      ".faction-logo img",
      ".factionLogo img",
      "img#factionLogo",
      "img#faction-logo",
      "[data-faction-logo] img",
      "img[data-faction-logo]",
      ".hero-faction img",
      ".factionBadge img"
    ];
    for (const sel of imgSelectors) {
      const el = document.querySelector(sel);
      const src = el?.getAttribute?.("src") || el?.src;
      if (src && String(src).trim()) return String(src).trim();
    }
    return "";
  }

  // ✅ UPDATED: use preview modal instead of popup-only
  function popupResult(url) {
    try {
      openPreview(url);
      return;
    } catch (e) {
      log("openPreview failed, fallback popup", e);
    }

    // fallback (old behavior)
    const tg = global.Telegram?.WebApp;
    const caption = "LEVEL UP. 🐺 #AlphaHusky #HOWLitsMade";

    if (tg?.showPopup) {
      try {
        tg.showPopup(
          {
            title: "Share Card Ready",
            message: "Tip: If X doesn't attach the image, open the card → save image → add in X.",
            buttons: [
              { id: "x", type: "default", text: "Post on X" },
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

            if (btnId === "x") {
              const ok = await tryNativeShareImage(url, caption);
              if (ok) {
                toast("Share Card", "Share sheet opened ✅ Choose X / Twitter.");
                return;
              }
              toast("Share Card", "X may not attach images here. Open card → save image → attach in X.");
              openLink(buildXIntent(url));
            }
          }
        );
        return;
      } catch (_) {}
    }

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

  // ✅ keep trying until row+hero exist (fix: UI may render after this script)
  function startEnsureLoop() {
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      const okShow = showRow();
      const okPlace = ensureRowAboveSkin();
      if ((okShow && okPlace) || tries > 80) clearInterval(t);
    }, 125);
  }

  // ✅ watch DOM changes (some modules re-render hero-center)
  function startObserver() {
    try {
      const obs = new MutationObserver(() => {
        showRow();
        ensureRowAboveSkin();
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (_) {}
  }

  function hook() {
    _dbg = !!global.DBG_SHARE_LEVELUP || !!global.DBG;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        showRow();
        ensureRowAboveSkin();
        startEnsureLoop();
        startObserver();
      });
    } else {
      showRow();
      ensureRowAboveSkin();
      startEnsureLoop();
      startObserver();
    }

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