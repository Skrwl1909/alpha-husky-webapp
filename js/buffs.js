// js/buffs.js - Active Signals topbar indicator + compact modal
(function () {
  try {
    window.AH_BUFFS = window.AH_BUFFS || { line: "", full: [] };
    window.AH_LIVE_EVENT = window.AH_LIVE_EVENT || { event: null, serverOffsetMs: 0 };

    function ensureStyles() {
      if (document.getElementById("ah-buffs-styles")) return;
      const style = document.createElement("style");
      style.id = "ah-buffs-styles";
      style.textContent = `
        .topbar-signals-slot{
          flex:0 0 auto;
          display:flex;
          align-items:center;
          gap:6px;
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
        #liveEventLine.ah-live-event-chip{
          cursor:default;
          max-width:min(48vw, 250px);
          border-color:rgba(116,218,255,.42);
          background:linear-gradient(180deg, rgba(14,40,57,.94), rgba(7,18,29,.92));
          box-shadow:0 8px 22px rgba(0,131,190,.20), inset 0 0 18px rgba(98,205,255,.05);
          color:#effbff;
          white-space:nowrap;
        }
        .ah-live-event-title{
          font-size:10px;
          font-weight:950;
          letter-spacing:.055em;
        }
        .ah-live-event-bonus{
          color:#8ee8ff;
          font-size:10px;
          font-weight:950;
        }
        .ah-live-event-time{
          min-width:35px;
          color:#fff;
          font-variant-numeric:tabular-nums;
          font-size:10px;
          font-weight:900;
          text-align:right;
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
        .ah-buffs-note{
          display:none;
          margin:12px 14px 0;
          padding:10px 12px;
          border-radius:12px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.04);
          color:rgba(210,226,244,.82);
          font-size:11px;
          line-height:1.35;
        }
        .ah-buffs-note.is-visible{
          display:block;
        }
        .ah-buffs-note.is-success{
          border-color:rgba(126,198,255,.24);
          color:#dff4ff;
        }
        .ah-buffs-note.is-error{
          border-color:rgba(255,123,123,.24);
          color:#ffd6d6;
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
        .ah-buffs-actions{
          flex:0 0 auto;
          display:flex;
          flex-direction:column;
          align-items:flex-end;
          gap:8px;
        }
        .ah-buffs-end{
          appearance:none;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.04);
          color:#eef7ff;
          border-radius:10px;
          min-height:28px;
          padding:0 10px;
          font:800 11px/1 system-ui, sans-serif;
          cursor:pointer;
        }
        .ah-buffs-end[disabled]{
          opacity:.58;
          cursor:default;
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
            max-width:58vw;
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
          #liveEventLine.ah-live-event-chip{
            max-width:44vw;
            padding:4px 7px;
            gap:4px;
          }
          .ah-live-event-title,
          .ah-live-event-bonus,
          .ah-live-event-time{
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

    function getApiBase() {
      return String(window.API_BASE || "");
    }

    function getInitData() {
      return String(
        window.Telegram?.WebApp?.initData ||
        window.INIT_DATA ||
        window.__INIT_DATA__ ||
        ""
      );
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

    function ensureLiveEventEl() {
      ensureStyles();
      const host = findSignalsHost();
      if (!host) return null;
      let el = document.getElementById("liveEventLine");
      if (!el) {
        el = document.createElement("div");
        el.id = "liveEventLine";
      }
      el.className = "ah-buffs-chip ah-live-event-chip";
      el.style.display = "none";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      if (el.parentElement !== host) host.insertBefore(el, host.firstChild || null);
      return el;
    }

    function refreshSignalsHost() {
      const host = findSignalsHost();
      if (!host) return;
      const buffsEl = document.getElementById("buffsLine");
      const eventEl = document.getElementById("liveEventLine");
      const buffsVisible = !!buffsEl && buffsEl.style.display !== "none";
      const eventVisible = !!eventEl && eventEl.style.display !== "none";
      host.hidden = !(buffsVisible || eventVisible);
    }

    function eventRemainingSec() {
      const state = window.AH_LIVE_EVENT || {};
      const event = state.event;
      const endsAt = Number(event?._endsAt || 0);
      if (!event?.active || !Number.isFinite(endsAt) || endsAt <= 0) return 0;
      const authoritativeNow = Date.now() + Number(state.serverOffsetMs || 0);
      return Math.max(0, Math.ceil((endsAt - authoritativeNow) / 1000));
    }

    function countdownText(seconds) {
      const total = Math.max(0, Math.trunc(Number(seconds) || 0));
      const minutes = Math.floor(total / 60);
      const secs = total % 60;
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    function paintLiveEvent() {
      const el = ensureLiveEventEl();
      if (!el) return false;
      const event = window.AH_LIVE_EVENT?.event;
      const left = eventRemainingSec();
      if (!event?.active || left <= 0) {
        if (event) event.active = false;
        el.style.display = "none";
        el.innerHTML = "";
        refreshSignalsHost();
        return true;
      }
      const reward = event.rewardType === "bones" ? "BONES" : "EXP";
      const bonus = Math.max(0, Math.trunc(Number(event.bonusPercent) || 0));
      el.innerHTML = `
        <span class="ah-live-event-title">${event.title}</span>
        <span class="ah-live-event-bonus">+${bonus}% ${reward}</span>
        <span class="ah-live-event-time">${countdownText(left)}</span>
      `;
      el.setAttribute("aria-label", `${event.title}. Plus ${bonus} percent ${reward}. ${countdownText(left)} remaining.`);
      el.style.display = "inline-flex";
      refreshSignalsHost();
      return true;
    }

    function setLiveEvent(payload, receivedAtMs) {
      const root = payload && typeof payload === "object" ? payload : {};
      const state = root.liveEvent || root.live_event || root;
      const serverNow = parseExpiresAt(state?.serverNow);
      const receivedAt = Number.isFinite(Number(receivedAtMs)) ? Number(receivedAtMs) : Date.now();
      if (serverNow) window.AH_LIVE_EVENT.serverOffsetMs = serverNow - receivedAt;
      const endsAt = parseExpiresAt(state?.endsAt);
      const valid = state?.active === true && endsAt && ["pack_surge", "bone_rush"].includes(String(state.eventKey || ""));
      window.AH_LIVE_EVENT.event = valid ? {
        eventKey: String(state.eventKey),
        eventInstanceId: String(state.eventInstanceId || ""),
        title: String(state.title || ""),
        rewardType: String(state.rewardType || ""),
        bonusPercent: Number(state.bonusPercent || 0),
        endsAt: state.endsAt,
        active: true,
        _endsAt: endsAt,
      } : null;
      paintLiveEvent();
      return window.AH_LIVE_EVENT.event;
    }

    async function fetchLiveEvent() {
      const startedAt = Date.now();
      try {
        const response = await fetch(getApiBase() + "/webapp/live-events", { method: "GET", cache: "no-store" });
        if (!response.ok) return false;
        const payload = await response.json();
        const receivedAt = Date.now();
        setLiveEvent(payload, startedAt + ((receivedAt - startedAt) / 2));
        return true;
      } catch (_) {
        return false;
      }
    }

    function ensureSignalsTick() {
      if (window.__AH_SIGNALS_TICK__) return;
      window.__AH_SIGNALS_TICK__ = setInterval(() => {
        paintBuffs();
        paintLiveEvent();
        if (window.__AH_BUFFS_MODAL_OPEN__) renderModalList();
      }, 1000);
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
          cancellable: !!x.cancellable,
          cancelHint: String(x.cancelHint || x.cancel_hint || "").trim(),
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
        el.style.display = "none";
        el.innerHTML = "";
        refreshSignalsHost();
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
      refreshSignalsHost();
      return true;
    }

    function setActiveBuffs(line, full) {
      window.AH_BUFFS._lineBase = String(line || "");
      window.AH_BUFFS.line = String(line || "");
      window.AH_BUFFS.full = normalizeBuffs(full);
      paintBuffs();
      ensureSignalsTick();
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

    function setModalNotice(text, tone) {
      const root = ensureModal();
      const note = root.querySelector(".ah-buffs-note");
      if (!note) return;
      const msg = String(text || "").trim();
      note.textContent = msg;
      note.className = "ah-buffs-note";
      if (!msg) return;
      note.classList.add("is-visible");
      if (tone === "error") note.classList.add("is-error");
      if (tone === "success") note.classList.add("is-success");
    }

    async function apiPost(path, payload) {
      const initData = getInitData();
      if (!initData) throw new Error("NO_INIT_DATA");

      const resp = await fetch(getApiBase() + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ initData }, payload || {})),
      });

      let data = null;
      try {
        data = await resp.json();
      } catch (_) {}

      if (!resp.ok) {
        return data || { ok: false, reason: `http_${resp.status}` };
      }
      return data || { ok: false, reason: "empty_response" };
    }

    async function cancelSignal(buff) {
      const key = String(buff?.key || "").trim();
      if (!key) {
        setModalNotice("This signal could not be ended.", "error");
        return;
      }

      const prompt = "End this signal early? The item will not be refunded and this signal cannot be activated again for 1 hour.";
      if (!window.confirm(prompt)) return;

      const inflight = window.AH_BUFFS._canceling || (window.AH_BUFFS._canceling = Object.create(null));
      if (inflight[key]) return;

      inflight[key] = true;
      setModalNotice("", "");
      renderModalList();

      try {
        const res = await apiPost("/webapp/buffs/cancel", {
          key,
          run_id: `buff_cancel:${key}:${Date.now()}`,
        });
        if (!res || res.ok !== true) {
          setModalNotice(String(res?.message || "This signal could not be ended.").trim(), "error");
          return;
        }

        setActiveBuffs(res.buffsLine || "", res.activeBuffs || res.buffs || []);
        setModalNotice("Signal ended. No item was refunded.", "success");
        renderModalList();
      } catch (_) {
        setModalNotice("This signal could not be ended.", "error");
      } finally {
        delete inflight[key];
        renderModalList();
      }
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
          <div class="ah-buffs-note" aria-live="polite"></div>
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
        right.className = "ah-buffs-actions";

        if (remain) {
          const remainEl = document.createElement("div");
          remainEl.className = "ah-buffs-right";
          remainEl.textContent = remain;
          right.appendChild(remainEl);
        }

        if (buff.cancellable) {
          const endBtn = document.createElement("button");
          const isEnding = !!(window.AH_BUFFS._canceling && window.AH_BUFFS._canceling[buff.key]);
          endBtn.type = "button";
          endBtn.className = "ah-buffs-end";
          endBtn.textContent = isEnding ? "Ending..." : "End";
          endBtn.disabled = isEnding;
          if (buff.cancelHint) endBtn.title = buff.cancelHint;
          endBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!isEnding) cancelSignal(buff);
          });
          right.appendChild(endBtn);
        }

        row.appendChild(left);
        row.appendChild(right);
        list.appendChild(row);
      });
    }

    function openModal() {
      const root = ensureModal();
      setModalNotice("", "");
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
    window.setLiveEvent = setLiveEvent;
    window.paintLiveEvent = paintLiveEvent;
    window.fetchLiveEvent = fetchLiveEvent;
    window.AH_LIVE_EVENTS_TEST = { countdownText, eventRemainingSec, setLiveEvent, paintLiveEvent };

    if (!window.__AH_BUFFS_CLICK_BOUND__) {
      window.__AH_BUFFS_CLICK_BOUND__ = true;

      document.addEventListener("click", (event) => {
        const el = event.target.closest && event.target.closest("#buffsLine");
        if (!el || getComputedStyle(el).display === "none") return;
        if (!Array.isArray(window.AH_BUFFS.full) || !window.AH_BUFFS.full.length) return;
        openModal();
      });
    }

    ensureSignalsTick();
    setTimeout(() => {
      paintBuffs();
      paintLiveEvent();
      fetchLiveEvent();
    }, 50);
    if (!window.__AH_LIVE_EVENTS_REFRESH__) {
      window.__AH_LIVE_EVENTS_REFRESH__ = setInterval(fetchLiveEvent, 60000);
    }
  } catch (err) {
    try { console.error("[BUFFS] init error:", err); } catch (_) {}
  }
})();
