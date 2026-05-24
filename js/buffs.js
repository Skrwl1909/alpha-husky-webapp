// js/buffs.js - Active Signals topbar indicator + compact modal
(function () {
  try {
    window.AH_BUFFS = window.AH_BUFFS || { line: "", full: [] };

    function ensureStyles() {
      if (document.getElementById("ah-buffs-styles")) return;
      const style = document.createElement("style");
      style.id = "ah-buffs-styles";
      style.textContent = `
        .topbar-signals-slot{
          flex:0 0 auto;
          display:flex;
          align-items:center;
          min-width:0;
        }
        #buffsLine.buffs-line,
        .ah-buffs-chip{
          display:inline-flex;
          align-items:center;
          gap:6px;
          min-height:30px;
          max-width:min(32vw, 180px);
          margin:0;
          padding:4px 8px;
          border-radius:999px;
          border:1px solid rgba(126,198,255,.20);
          background:linear-gradient(180deg, rgba(12,18,28,.82), rgba(7,10,16,.78));
          color:#dff4ff;
          box-shadow:0 8px 18px rgba(0,0,0,.28);
          backdrop-filter:blur(10px);
          box-sizing:border-box;
          cursor:pointer;
          user-select:none;
          transition:transform .08s ease, border-color .16s ease, opacity .16s ease;
          opacity:.96;
        }
        #buffsLine.buffs-line:hover,
        .ah-buffs-chip:hover{
          opacity:1;
          border-color:rgba(126,198,255,.34);
        }
        #buffsLine.buffs-line:active,
        .ah-buffs-chip:active{
          transform:translateY(1px);
        }
        .ah-buffs-kicker{
          font-size:9px;
          font-weight:900;
          letter-spacing:.12em;
          color:rgba(189,223,255,.82);
          text-transform:uppercase;
        }
        .ah-buffs-bullets{
          display:inline-flex;
          align-items:center;
          gap:4px;
          min-width:0;
        }
        .ah-buffs-dot{
          min-width:18px;
          height:18px;
          padding:0 5px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:#f4fbff;
          font-size:10px;
          font-weight:900;
          line-height:1;
        }
        .ah-buffs-more{
          min-width:22px;
          height:18px;
          padding:0 6px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:rgba(126,198,255,.12);
          border:1px solid rgba(126,198,255,.20);
          color:#bfe7ff;
          font-size:10px;
          font-weight:900;
          line-height:1;
        }
        .ah-buffs-modal{
          position:fixed;
          inset:0;
          display:none;
          align-items:flex-end;
          justify-content:center;
          padding:16px;
          background:rgba(2,6,12,.62);
          z-index:1400;
        }
        .ah-buffs-modal.is-open{
          display:flex;
        }
        .ah-buffs-card{
          width:min(100%, 420px);
          max-height:min(72vh, 520px);
          overflow:hidden;
          display:flex;
          flex-direction:column;
          border-radius:18px;
          border:1px solid rgba(255,255,255,.10);
          background:linear-gradient(180deg, rgba(14,18,28,.98), rgba(8,11,18,.96));
          box-shadow:0 24px 56px rgba(0,0,0,.48);
          color:#eef7ff;
        }
        .ah-buffs-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          padding:14px 16px 12px;
          border-bottom:1px solid rgba(255,255,255,.08);
        }
        .ah-buffs-title{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:15px;
          font-weight:900;
          letter-spacing:.02em;
        }
        .ah-buffs-sub{
          margin-top:4px;
          color:rgba(210,226,244,.76);
          font-size:11px;
          line-height:1.35;
        }
        .ah-buffs-close{
          appearance:none;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.04);
          color:#eff7ff;
          border-radius:10px;
          min-height:32px;
          padding:0 11px;
          font:800 12px/1 system-ui, sans-serif;
          cursor:pointer;
        }
        .ah-buffs-list{
          display:flex;
          flex-direction:column;
          gap:8px;
          padding:12px 14px 14px;
          overflow:auto;
        }
        .ah-buffs-item{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          padding:11px 12px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.04);
        }
        .ah-buffs-item-left{
          min-width:0;
          display:flex;
          align-items:flex-start;
          gap:10px;
        }
        .ah-buffs-ico{
          width:28px;
          height:28px;
          border-radius:999px;
          display:grid;
          place-items:center;
          background:rgba(126,198,255,.12);
          border:1px solid rgba(126,198,255,.18);
          flex:0 0 auto;
        }
        .ah-buffs-name{
          color:#f4f8ff;
          font-size:13px;
          font-weight:800;
          line-height:1.25;
        }
        .ah-buffs-meta{
          margin-top:3px;
          color:rgba(199,216,235,.76);
          font-size:11px;
          line-height:1.35;
        }
        .ah-buffs-right{
          flex:0 0 auto;
          color:#bfe7ff;
          font-size:11px;
          font-weight:900;
          white-space:nowrap;
        }
        .ah-buffs-empty{
          padding:14px 12px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.04);
          color:rgba(210,226,244,.76);
          font-size:12px;
          line-height:1.4;
        }
        @media (max-width: 480px){
          .topbar-signals-slot{
            max-width:30vw;
          }
          #buffsLine.buffs-line,
          .ah-buffs-chip{
            max-width:min(30vw, 134px);
            padding:4px 7px;
            gap:5px;
          }
          .ah-buffs-kicker{
            display:none;
          }
          .ah-buffs-dot{
            min-width:16px;
            height:16px;
            padding:0 4px;
            font-size:9px;
          }
          .ah-buffs-more{
            min-width:20px;
            height:16px;
            padding:0 5px;
            font-size:9px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    function titleizeKey(key) {
      return String(key || "")
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase()) || "Signal";
    }

    function fmtDur(sec) {
      sec = Math.max(0, parseInt(sec || 0, 10));
      const days = Math.floor(sec / 86400);
      const hours = Math.floor((sec % 86400) / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${mins}m`;
      if (mins > 0) return `${mins}m`;
      return `${sec}s`;
    }

    function parseExpiresAt(value) {
      if (value == null || value === "") return null;
      if (typeof value === "number" && Number.isFinite(value)) {
        return value > 2e12 ? Math.trunc(value) : Math.trunc(value * 1000);
      }
      const asNumber = Number(value);
      if (Number.isFinite(asNumber)) return asNumber > 2e12 ? Math.trunc(asNumber) : Math.trunc(asNumber * 1000);
      const parsed = Date.parse(String(value));
      return Number.isNaN(parsed) ? null : parsed;
    }

    function calcRemainingSec(buff) {
      const exp = Number(buff?._expiresAt || 0);
      if (!Number.isFinite(exp) || exp <= 0) return null;
      return Math.max(0, Math.floor((exp - Date.now()) / 1000));
    }

    function remainingText(buff) {
      const left = calcRemainingSec(buff);
      if (left !== null) return `${fmtDur(left)} left`;
      const uses = Number(buff?.remainingUses);
      if (Number.isFinite(uses) && uses > 0) return `${uses} use${uses === 1 ? "" : "s"} left`;
      return String(buff?.remainingText || "").trim();
    }

    function pickIcon(buff) {
      const text = `${buff?.key || ""} ${buff?.name || ""} ${buff?.effectLabel || ""}`.toLowerCase();
      if (text.includes("xp")) return "XP";
      if (text.includes("speed") || text.includes("cooldown")) return "SPD";
      if (text.includes("luck") || text.includes("dice")) return "LCK";
      if (text.includes("rune") || text.includes("forge")) return "FRG";
      if (text.includes("feed")) return "FED";
      if (text.includes("plushie") || text.includes("protect")) return "DEF";
      if (text.includes("scent") || text.includes("loot")) return "LOT";
      if (text.includes("alpha")) return "A";
      return "SIG";
    }

    function findSignalsHost() {
      let host = document.getElementById("topbarSignals");
      if (host) return host;

      const topbar = document.querySelector(".topbar");
      if (!topbar) return null;

      host = document.createElement("div");
      host.id = "topbarSignals";
      host.className = "topbar-signals-slot";
      host.hidden = true;

      const player = document.getElementById("player");
      if (player && player.parentElement === topbar && player.nextSibling) {
        topbar.insertBefore(host, player.nextSibling);
      } else {
        topbar.appendChild(host);
      }
      return host;
    }

    function ensureBuffsLineEl() {
      ensureStyles();
      const host = findSignalsHost();
      if (!host) return null;

      let el = document.getElementById("buffsLine");
      if (!el) {
        el = document.createElement("button");
        el.type = "button";
        el.id = "buffsLine";
      }

      el.className = "buffs-line ah-buffs-chip";
      el.style.display = "none";
      el.setAttribute("aria-label", "Active Signals");
      el.setAttribute("aria-haspopup", "dialog");

      if (el.parentElement !== host) host.appendChild(el);
      return el;
    }

    function normalizeBuffs(full) {
      const now = Date.now();
      const arr = Array.isArray(full) ? full : [];
      return arr.map((raw, index) => {
        const x = raw && typeof raw === "object" ? raw : { label: String(raw || "") };
        const key = String(x.key || x.id || "").trim();
        const name = String(x.name || x.label || x.desc || x.text || titleizeKey(key)).trim() || "Signal";
        const effectLabel = String(x.effectLabel || x.effect_label || "").trim();
        const usesRaw = x.remainingUses ?? x.remaining_uses ?? x.uses;
        const remainingUses = Number.isFinite(Number(usesRaw)) ? Math.trunc(Number(usesRaw)) : null;

        let exp = parseExpiresAt(x.expiresAt ?? x.expires_at ?? x.until_ts ?? null);
        if (!exp && (x.left_sec === 0 || x.left_sec)) {
          const left = Number(x.left_sec);
          if (Number.isFinite(left) && left > 0) exp = now + Math.trunc(left * 1000);
        }

        const normalized = {
          id: String(x.id || key || `signal_${index}`),
          key,
          name,
          label: String(x.label || name).trim() || name,
          remainingText: String(x.remainingText || x.remaining_text || "").trim(),
          expiresAt: exp ? Math.trunc(exp / 1000) : null,
          remainingUses,
          effectLabel,
          _expiresAt: exp,
        };

        const left = calcRemainingSec(normalized);
        if (left !== null && left <= 0) return null;
        if (left === null && Number.isFinite(remainingUses) && remainingUses <= 0) return null;
        return normalized;
      }).filter(Boolean);
    }

    function indicatorAria(buff) {
      return [buff.name, buff.effectLabel, remainingText(buff)].filter(Boolean).join(" - ");
    }

    function paintBuffs() {
      const host = findSignalsHost();
      const el = ensureBuffsLineEl();
      if (!host || !el) {
        setTimeout(paintBuffs, 120);
        return false;
      }

      const full = Array.isArray(window.AH_BUFFS.full) ? window.AH_BUFFS.full : [];
      if (!full.length) {
        host.hidden = true;
        el.style.display = "none";
        el.innerHTML = "";
        return true;
      }

      const visible = full.slice(0, 3);
      const more = Math.max(0, full.length - visible.length);
      const ariaLabel = `Active Signals. ${full.length} active. Tap to open details.`;

      el.innerHTML = `
        <span class="ah-buffs-kicker">SIG</span>
        <span class="ah-buffs-bullets">
          ${visible.map((buff) => `<span class="ah-buffs-dot" title="${indicatorAria(buff)}" aria-hidden="true">${pickIcon(buff)}</span>`).join("")}
          ${more > 0 ? `<span class="ah-buffs-more" aria-hidden="true">+${more}</span>` : ""}
        </span>
      `;
      el.style.display = "inline-flex";
      el.setAttribute("aria-label", ariaLabel);
      host.hidden = false;
      return true;
    }

    function setActiveBuffs(line, full) {
      window.AH_BUFFS._lineBase = String(line || "");
      window.AH_BUFFS.line = String(line || "");
      window.AH_BUFFS.full = normalizeBuffs(full);
      paintBuffs();

      if (!window.__AH_BUFFS_TICK__) {
        window.__AH_BUFFS_TICK__ = setInterval(() => {
          paintBuffs();
          if (window.__AH_BUFFS_MODAL_OPEN__) renderModalList();
        }, 1000);
      }
    }

    function renderBuffs(out) {
      const root = out && typeof out === "object" ? out : {};
      const p = root.profile || root.data?.profile || root.data || root;
      const line = String(p?.buffsLine || p?.buffs_line || "");
      const full =
        Array.isArray(p?.activeBuffs) ? p.activeBuffs :
        Array.isArray(p?.active_buffs) ? p.active_buffs :
        Array.isArray(p?.buffs) ? p.buffs :
        [];
      setActiveBuffs(line, full);
    }

    function ensureModal() {
      ensureStyles();
      let root = document.getElementById("ahBuffsModal");
      if (root) return root;

      root = document.createElement("div");
      root.id = "ahBuffsModal";
      root.className = "ah-buffs-modal";
      root.innerHTML = `
        <div class="ah-buffs-card" role="dialog" aria-modal="true" aria-label="Active Signals">
          <div class="ah-buffs-head">
            <div>
              <div class="ah-buffs-title">Active Signals</div>
              <div class="ah-buffs-sub">Live consumable buffs from your current profile state.</div>
            </div>
            <button type="button" class="ah-buffs-close">Close</button>
          </div>
          <div class="ah-buffs-list"></div>
        </div>
      `;
      document.body.appendChild(root);

      root.querySelector(".ah-buffs-close")?.addEventListener("click", closeModal);
      root.addEventListener("click", (event) => {
        if (event.target === root) closeModal();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && root.classList.contains("is-open")) closeModal();
      });
      return root;
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
        empty.textContent = "No active signals.";
        list.appendChild(empty);
        return;
      }

      full.forEach((buff, index) => {
        const row = document.createElement("div");
        row.className = "ah-buffs-item";
        row.dataset.i = String(index);

        const left = document.createElement("div");
        left.className = "ah-buffs-item-left";

        const ico = document.createElement("div");
        ico.className = "ah-buffs-ico";
        ico.textContent = pickIcon(buff);

        const copy = document.createElement("div");
        copy.style.minWidth = "0";

        const name = document.createElement("div");
        name.className = "ah-buffs-name";
        name.textContent = buff.name || buff.label || "Signal";

        const metaParts = [];
        if (buff.effectLabel) metaParts.push(buff.effectLabel);
        const remain = remainingText(buff);
        if (remain) metaParts.push(remain);

        const meta = document.createElement("div");
        meta.className = "ah-buffs-meta";
        meta.textContent = metaParts.join(" • ");

        copy.appendChild(name);
        if (metaParts.length) copy.appendChild(meta);

        left.appendChild(ico);
        left.appendChild(copy);

        const right = document.createElement("div");
        right.className = "ah-buffs-right";
        right.textContent = remain;

        row.appendChild(left);
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

    window.paintBuffs = paintBuffs;
    window.setActiveBuffs = setActiveBuffs;
    window.renderBuffs = renderBuffs;
    window.openBuffsModal = openModal;
    window.closeBuffsModal = closeModal;

    if (!window.__AH_BUFFS_CLICK_BOUND__) {
      window.__AH_BUFFS_CLICK_BOUND__ = true;

      document.addEventListener("click", (event) => {
        const el = event.target.closest && event.target.closest("#buffsLine");
        if (!el || getComputedStyle(el).display === "none") return;
        if (!Array.isArray(window.AH_BUFFS.full) || !window.AH_BUFFS.full.length) return;
        openModal();
      });
    }

    setTimeout(paintBuffs, 50);
  } catch (err) {
    try { console.error("[BUFFS] init error:", err); } catch (_) {}
  }
})();
