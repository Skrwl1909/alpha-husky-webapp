// js/buffs.js — AAA Active Buffs (chip + modal) — single source of truth
(function () {
  window.AH_BUFFS = window.AH_BUFFS || { line: "", full: [] };

  function findHudLeft() {
    return (
      document.querySelector(".hud-col.hud-left") ||
      document.querySelector(".hud-left") ||
      document.querySelector("#hudLeft") ||
      null
    );
  }

  function fmtDur(sec) {
    sec = Math.max(0, parseInt(sec || 0, 10));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h > 0) return `${h}h ${mm}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  }

  function ensureBuffsLineEl() {
    let el = document.getElementById("buffsLine");

    const hudLeft = findHudLeft();
    const target = hudLeft || document.body;

    if (!el) {
      el = document.createElement("div");
      el.id = "buffsLine";
      el.className = "buffs-line ah-buffs-chip";
      el.style.display = "none";

      // premium inner layout
      el.innerHTML = `
        <span class="ah-buffs-spark">✨</span>
        <span class="ah-buffs-label"></span>
        <span class="ah-buffs-caret">›</span>
      `;

      target.appendChild(el);
      return el;
    }

    // ✅ mini-upgrade: if HUD appears later, move element into HUD
    if (hudLeft && el.parentElement !== hudLeft) {
      try { hudLeft.appendChild(el); } catch (_) {}
    }

    // ensure AAA class
    if (!el.classList.contains("ah-buffs-chip")) {
      el.classList.add("ah-buffs-chip");
    }

    return el;
  }

  function bump(el) {
    try {
      el.classList.remove("ah-buffs-bump");
      void el.offsetWidth; // reflow
      el.classList.add("ah-buffs-bump");
      setTimeout(() => el.classList.remove("ah-buffs-bump"), 260);
    } catch (_) {}
  }

  function paintBuffs() {
    const el = ensureBuffsLineEl();
    if (!el) return false;

    const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
    let line = String(window.AH_BUFFS.line || "");

    // fallback line if missing but buffs exist
    if (!line && full.length > 0) line = `✨ Buffs (${full.length})`;

    const labelEl = el.querySelector(".ah-buffs-label");

    if (line) {
      el.style.display = "inline-flex";
      // remove leading ✨ if backend already prepends it
      const disp = line.replace(/^✨\s*/g, "").trim();
      if (labelEl) labelEl.textContent = disp || "Buffs";
      else el.textContent = disp || "Buffs";

      el.dataset.full = JSON.stringify(full);
    } else {
      el.style.display = "none";
      if (labelEl) labelEl.textContent = "";
      el.dataset.full = "[]";
    }

    return true;
  }

  function setActiveBuffs(line, full) {
    window.AH_BUFFS.line = line || "";
    window.AH_BUFFS.full = Array.isArray(full) ? full : [];
    const el = ensureBuffsLineEl();
    paintBuffs();
    if (el && (line || (full && full.length))) bump(el);

    // small retry if HUD re-rendered right after
    setTimeout(paintBuffs, 80);

    // if modal open, refresh its content live
    try {
      if (window.__AH_BUFFS_MODAL_OPEN__) renderModalList();
    } catch (_) {}
  }

  // ✅ adapter: accepts {buffsLine,buffs} OR {profile:{buffsLine,buffs}}
  function renderBuffs(out) {
    const p = (out && (out.profile || out)) || {};
    const line = String(p.buffsLine || "");
    const full = Array.isArray(p.buffs) ? p.buffs : [];
    setActiveBuffs(line, full);
  }

  // ===== Modal (AAA) =====
  function ensureModal() {
    let root = document.getElementById("ahBuffsModal");
    if (root) return root;

    root = document.createElement("div");
    root.id = "ahBuffsModal";
    root.className = "ah-buffs-modal";
    root.innerHTML = `
      <div class="ah-buffs-card" role="dialog" aria-modal="true">
        <div class="ah-buffs-head">
          <div>
            <div class="ah-buffs-title"><span class="ah-buffs-spark">✨</span> Active Buffs</div>
            <div class="ah-buffs-sub">Tap a buff line anytime to review effects.</div>
          </div>
          <button type="button" class="ah-buffs-close">Close</button>
        </div>
        <div class="ah-buffs-list"></div>
      </div>
    `;

    document.body.appendChild(root);

    // close handlers
    const btn = root.querySelector(".ah-buffs-close");
    btn && btn.addEventListener("click", closeModal);

    root.addEventListener("click", (e) => {
      if (e.target === root) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("is-open")) closeModal();
    });

    return root;
  }

  function pickIcon(text) {
    const t = String(text || "").toLowerCase();
    if (t.includes("xp")) return "⚡";
    if (t.includes("cooldown") || t.includes("speed")) return "💨";
    if (t.includes("dice") || t.includes("luck")) return "🎲";
    if (t.includes("plushie") || t.includes("protect")) return "🧸";
    if (t.includes("rune")) return "✨";
    if (t.includes("scent")) return "🦴";
    if (t.includes("feed")) return "🍖";
    return "🧬";
  }

  function renderModalList() {
    const root = ensureModal();
    const list = root.querySelector(".ah-buffs-list");
    if (!list) return;

    const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
    list.innerHTML = "";

    if (!full.length) {
      const empty = document.createElement("div");
      empty.className = "ah-buffs-empty";
      empty.textContent = "No active buffs right now.";
      list.appendChild(empty);
      return;
    }

    full.forEach((x) => {
      const text = String(x.text || x.desc || x.key || "Buff").trim();
      const left = (x.left_sec === 0 || x.left_sec) ? parseInt(x.left_sec, 10) : null;
      const uses = (x.uses === 0 || x.uses) ? parseInt(x.uses, 10) : null;

      const metaParts = [];
      if (left !== null && !Number.isNaN(left)) metaParts.push(`Remaining: ${fmtDur(left)}`);
      if (uses !== null && !Number.isNaN(uses)) metaParts.push(`Uses: ${uses}`);

      const row = document.createElement("div");
      row.className = "ah-buffs-item";

      const leftBox = document.createElement("div");
      leftBox.className = "ah-buffs-item-left";

      const ico = document.createElement("div");
      ico.className = "ah-buffs-ico";
      ico.textContent = pickIcon(text);

      const txtWrap = document.createElement("div");
      txtWrap.style.minWidth = "0";

      const name = document.createElement("div");
      name.className = "ah-buffs-name";
      name.textContent = text;

      const meta = document.createElement("div");
      meta.className = "ah-buffs-meta";
      meta.textContent = metaParts.join(" • ");

      txtWrap.appendChild(name);
      if (metaParts.length) txtWrap.appendChild(meta);

      leftBox.appendChild(ico);
      leftBox.appendChild(txtWrap);

      const right = document.createElement("div");
      right.className = "ah-buffs-right";
      if (left !== null && !Number.isNaN(left)) right.textContent = fmtDur(left);
      else if (uses !== null && !Number.isNaN(uses)) right.textContent = `${uses} use${uses === 1 ? "" : "s"}`;
      else right.textContent = "";

      row.appendChild(leftBox);
      row.appendChild(right);

      list.appendChild(row);
    });
  }

  function openModal() {
    const root = ensureModal();
    renderModalList();

    window.__AH_BUFFS_MODAL_OPEN__ = true;
    root.classList.add("is-open");

    try { Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
  }

  function closeModal() {
    const root = document.getElementById("ahBuffsModal");
    if (!root) return;

    window.__AH_BUFFS_MODAL_OPEN__ = false;
    root.classList.remove("is-open");
  }

  // expose helpers globally
  window.paintBuffs = paintBuffs;
  window.setActiveBuffs = setActiveBuffs;
  window.renderBuffs = renderBuffs;
  window.openBuffsModal = openModal;
  window.closeBuffsModal = closeModal;

  // click → open AAA modal (bind once)
  if (!window.__AH_BUFFS_CLICK_BOUND__) {
    window.__AH_BUFFS_CLICK_BOUND__ = true;

    document.addEventListener("click", (e) => {
      const el = e.target.closest("#buffsLine");
      if (!el || getComputedStyle(el).display === "none") return;

      let full = [];
      try { full = JSON.parse(el.dataset.full || "[]"); } catch (_) { full = []; }
      if (!Array.isArray(full) || full.length === 0) return;

      openModal();
    });
  }

  // initial paint (safe)
  setTimeout(paintBuffs, 50);
})();
