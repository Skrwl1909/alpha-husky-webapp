// js/buffs.js — Active Buffs line + popup (single source of truth)
(function () {
  // global state
  window.AH_BUFFS = window.AH_BUFFS || { line: "", full: [] };

  function ensureBuffsLineEl() {
    let el = document.getElementById("buffsLine");
    if (el) return el;

    // prefer existing HUD left container
    const hudLeft =
      document.querySelector(".hud-col.hud-left") ||
      document.querySelector(".hud-left") ||
      document.querySelector("#hudLeft");

    if (!hudLeft) return null;

    // create if missing
    el = document.createElement("div");
    el.id = "buffsLine";
    el.className = "buffs-line";
    el.style.display = "none";
    hudLeft.appendChild(el);

    return el;
  }

  function paintBuffs() {
    const el = ensureBuffsLineEl();
    if (!el) return false;

    const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
    let line = String(window.AH_BUFFS.line || "");

    if (!line && full.length > 0) line = `✨ Buffs (${full.length})`;

    if (line) {
      el.style.display = "block";
      el.textContent = line;
      el.dataset.full = JSON.stringify(full);
    } else {
      el.style.display = "none";
      el.textContent = "";
      el.dataset.full = "[]";
    }

    return true;
  }

  // public API: set + paint (safe)
  function setActiveBuffs(line, full) {
    window.AH_BUFFS.line = line || "";
    window.AH_BUFFS.full = Array.isArray(full) ? full : [];
    paintBuffs();
    // small retry if HUD was re-rendered right after
    setTimeout(paintBuffs, 80);
  }

  // expose helpers globally
  window.paintBuffs = paintBuffs;
  window.setActiveBuffs = setActiveBuffs;

  // click → popup list (bind once)
  if (!window.__AH_BUFFS_CLICK_BOUND__) {
    window.__AH_BUFFS_CLICK_BOUND__ = true;

    document.addEventListener("click", (e) => {
      const el = e.target.closest("#buffsLine");
      if (!el || getComputedStyle(el).display === "none") return;

      let full = [];
      try { full = JSON.parse(el.dataset.full || "[]"); } catch (_) { full = []; }
      if (!Array.isArray(full) || full.length === 0) return;

      const msg = full.map(x => `• ${x.text || x.desc || x.key || "Buff"}`).join("\n");

      try { Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      if (Telegram?.WebApp?.showPopup) {
        Telegram.WebApp.showPopup({
          title: "Active Buffs",
          message: msg,
          buttons: [{ type: "close" }]
        });
      } else {
        alert(msg);
      }
    });
  }
})();
