// js/buffs.js — AAA Active Buffs (chip + modal) + live countdown tick (safe)
(function () {
  try {
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

    function fmtDurShort(sec) {
      sec = Math.max(0, parseInt(sec || 0, 10));
      const m = Math.floor(sec / 60);
      const h = Math.floor(m / 60);
      const mm = m % 60;
      if (h > 0) return `${h}h ${mm}m`;
      if (m > 0) return `${m}m`;
      return `${sec}s`;
    }

    function ensureBuffsLineEl() {
  const hudLeft = findHudLeft();
  if (!hudLeft) return null; // 🔥 zero fallback do body

  let el = document.getElementById("buffsLine");

  if (!el) {
    el = document.createElement("div");
    el.id = "buffsLine";
    el.className = "buffs-line ah-buffs-chip";
    el.style.display = "none";

    el.innerHTML = `
      <span class="ah-buffs-spark">✨</span>
      <span class="ah-buffs-label"></span>
      <span class="ah-buffs-caret">›</span>
    `;

    hudLeft.appendChild(el);
    return el;
  }

  // jeśli istnieje, ale jest poza HUD → przenieś
  if (el.parentElement !== hudLeft) {
    try { hudLeft.appendChild(el); } catch (_) {}
  }

  if (!el.classList.contains("ah-buffs-chip")) el.classList.add("ah-buffs-chip");
  return el;
}

    function bump(el) {
      try {
        el.classList.remove("ah-buffs-bump");
        void el.offsetWidth; // reflow
        el.classList.add("ah-buffs-bump");
        setTimeout(() => el.classList.remove("ah-buffs-bump"), 280);
      } catch (_) {}
    }

    function normalizeBuffs(full) {
      const now = Date.now();
      const arr = Array.isArray(full) ? full : [];
      return arr.map((b) => {
        const x = (b && typeof b === "object") ? b : { text: String(b || "") };

        // prefer explicit timestamps if you ever add them
        let expiresAt = null;

        if (x.expires_at) {
          const t = Date.parse(x.expires_at);
          if (!Number.isNaN(t)) expiresAt = t;
        } else if (x.until_ts) {
          const t = parseInt(x.until_ts, 10);
          if (!Number.isNaN(t)) expiresAt = (t > 2e12) ? t : (t * 1000);
        } else if (x.left_sec === 0 || x.left_sec) {
          const left = parseInt(x.left_sec, 10);
          if (!Number.isNaN(left)) expiresAt = now + left * 1000;
        }

        return Object.assign({}, x, { _expiresAt: expiresAt });
      });
    }

    function getMinRemainingSec() {
      const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
      const now = Date.now();
      let min = null;

      full.forEach((x) => {
        const exp = x && x._expiresAt ? parseInt(x._expiresAt, 10) : null;
        if (!exp || Number.isNaN(exp)) return;
        const left = Math.max(0, Math.floor((exp - now) / 1000));
        if (min === null || left < min) min = left;
      });

      return min;
    }

    function injectDuration(base, dur) {
      const s = String(base || "").trim();

      // if string ends with "(...)" replace it
      if (/\([^)]*\)\s*$/.test(s)) {
        return s.replace(/\([^)]*\)\s*$/, `(${dur})`);
      }

      // otherwise append
      return s ? `${s} (${dur})` : `Buffs (${dur})`;
    }

    function buildDisplayLine() {
      const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
      let base = String(window.AH_BUFFS._lineBase || window.AH_BUFFS.line || "").trim();

      if (!base && full.length > 0) base = `✨ Buffs (${full.length})`;

      const minSec = getMinRemainingSec();
      if (minSec !== null) {
        base = injectDuration(base, fmtDurShort(minSec));
      }

      return base;
    }

    function paintBuffs() {
      const el = ensureBuffsLineEl();
if (!el) { setTimeout(paintBuffs, 120); return false; } // retry aż HUD wstanie

      const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
      const line = buildDisplayLine();
      const labelEl = el.querySelector(".ah-buffs-label");

      if (line && full.length > 0) {
        el.style.display = "inline-flex";
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
      window.AH_BUFFS._lineBase = String(line || "");
      window.AH_BUFFS.line = String(line || "");
      window.AH_BUFFS.full = normalizeBuffs(full);

      const el = ensureBuffsLineEl();
      paintBuffs();
      if (el && window.AH_BUFFS.full.length) bump(el);

      // retry after HUD re-render
      setTimeout(paintBuffs, 80);

      // start ticking once
      if (!window.__AH_BUFFS_TICK__) {
        window.__AH_BUFFS_TICK__ = setInterval(() => {
          // update display + modal times
          paintBuffs();
          try { if (window.__AH_BUFFS_MODAL_OPEN__) updateModalTimes(); } catch (_) {}
        }, 1000);
      }
    }

    // adapter: accepts {buffsLine,buffs} OR {profile:{buffsLine,buffs}}
    function renderBuffs(out) {
      const p = (out && (out.profile || out)) || {};
      const line = String(p.buffsLine || p.buffs_line || "");
      const full = Array.isArray(p.buffs) ? p.buffs : (Array.isArray(p.active_buffs) ? p.active_buffs : []);
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

    function calcRemainingSec(x) {
      const now = Date.now();
      const exp = x && x._expiresAt ? parseInt(x._expiresAt, 10) : null;
      if (exp && !Number.isNaN(exp)) return Math.max(0, Math.floor((exp - now) / 1000));
      return null;
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

      full.forEach((x, i) => {
        const text = String(x.text || x.desc || x.key || "Buff").trim();
        const left = calcRemainingSec(x);
        const uses = (x.uses === 0 || x.uses) ? parseInt(x.uses, 10) : null;

        const metaParts = [];
        if (left !== null) metaParts.push(`Remaining: ${fmtDur(left)}`);
        if (uses !== null && !Number.isNaN(uses)) metaParts.push(`Uses: ${uses}`);

        const row = document.createElement("div");
        row.className = "ah-buffs-item";
        row.dataset.i = String(i);

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
        if (left !== null) right.textContent = fmtDur(left);
        else if (uses !== null && !Number.isNaN(uses)) right.textContent = `${uses} use${uses === 1 ? "" : "s"}`;
        else right.textContent = "";

        row.appendChild(leftBox);
        row.appendChild(right);

        list.appendChild(row);
      });
    }

    function updateModalTimes() {
      const root = document.getElementById("ahBuffsModal");
      if (!root || !root.classList.contains("is-open")) return;

      const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
      const rows = root.querySelectorAll(".ah-buffs-item");
      rows.forEach((row) => {
        const i = parseInt(row.dataset.i || "0", 10);
        const x = full[i];
        if (!x) return;

        const left = calcRemainingSec(x);
        const uses = (x.uses === 0 || x.uses) ? parseInt(x.uses, 10) : null;

        const metaParts = [];
        if (left !== null) metaParts.push(`Remaining: ${fmtDur(left)}`);
        if (uses !== null && !Number.isNaN(uses)) metaParts.push(`Uses: ${uses}`);

        const metaEl = row.querySelector(".ah-buffs-meta");
        if (metaEl) metaEl.textContent = metaParts.join(" • ");

        const rightEl = row.querySelector(".ah-buffs-right");
        if (rightEl) {
          if (left !== null) rightEl.textContent = fmtDur(left);
          else if (uses !== null && !Number.isNaN(uses)) rightEl.textContent = `${uses} use${uses === 1 ? "" : "s"}`;
          else rightEl.textContent = "";
        }
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

    // expose
    window.paintBuffs = paintBuffs;
    window.setActiveBuffs = setActiveBuffs;
    window.renderBuffs = renderBuffs;
    window.openBuffsModal = openModal;
    window.closeBuffsModal = closeModal;

    // click → open modal (bind once)
    if (!window.__AH_BUFFS_CLICK_BOUND__) {
      window.__AH_BUFFS_CLICK_BOUND__ = true;

      document.addEventListener("click", (e) => {
        const el = e.target.closest && e.target.closest("#buffsLine");
        if (!el || getComputedStyle(el).display === "none") return;

        let full = [];
        try { full = JSON.parse(el.dataset.full || "[]"); } catch (_) { full = []; }
        if (!Array.isArray(full) || full.length === 0) return;

        openModal();
      });
    }

    setTimeout(paintBuffs, 50);
  } catch (err) {
    // never break the whole WebApp if buffs fail
    try { console.error("[BUFFS] init error:", err); } catch (_) {}
  }
})();
