// js/factions.js — Factions (WebApp) for Alpha Husky
(function () {
  // ----------------------------
  // Private state
  // ----------------------------
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _back = null;
  let _root = null;

  const LS_KEY = "ah_faction";        // front fallback
  const IDEM_PREFIX = "faction";      // run_id prefix

  const FACTIONS = [
    {
      key: "rb",
      slug: "rogue_byte",
      name: "Rogue Byte",
      color: "#ff5252",
      icon40: "/images/factions/rogue_byte_40.webp",
      icon80: "/images/factions/rogue_byte_80.webp",
      desc: "Redline hackers. Fast raids, clean sabotage. Take ground quick.",
      vibe: "Aggressive • High tempo • Disruption",
    },
    {
      key: "ew",
      slug: "echo_wardens",
      name: "Echo Wardens",
      color: "#ffd600",
      icon40: "/images/factions/echo_wardens_40.webp",
      icon80: "/images/factions/echo_wardens_80.webp",
      desc: "Signal guardians. Hold the line, protect routes, control influence.",
      vibe: "Defensive • Stable • Control",
    },
    {
      key: "pb",
      slug: "pack_burners",
      name: "Pack Burners",
      color: "#ba68c8",
      icon40: "/images/factions/pack_burners_40.webp",
      icon80: "/images/factions/pack_burners_80.webp",
      desc: "Wild fire pack. Pressure, donations, crowd influence, chaos energy.",
      vibe: "Viral • Pressure • Momentum",
    },
    {
      key: "ih",
      slug: "inner_howl",
      name: "Inner Howl",
      color: "#40c4ff",
      icon40: "/images/factions/inner_howl_40.webp",
      icon80: "/images/factions/inner_howl_80.webp",
      desc: "Cold focus. Precision strikes, long-term dominance, steady growth.",
      vibe: "Precision • Discipline • Growth",
    },
  ];

  function log(...a) { if (_dbg) console.log("[Factions]", ...a); }

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // ----------------------------
  // Analytics (safe)
  // ----------------------------
  function track(name, data = {}) {
    try {
      // some builds use trackEvent, some use track
      if (typeof window.telegramAnalytics?.trackEvent === "function") {
        window.telegramAnalytics.trackEvent(name, data);
      } else if (typeof window.telegramAnalytics?.track === "function") {
        window.telegramAnalytics.track(name, data);
      }
    } catch (_) {}
  }

  // ----------------------------
  // Helpers: faction key
  // ----------------------------
  function normKey(raw) {
    const k = String(raw || "").toLowerCase().trim();
    if (!k) return "";
    if (k === "rb" || k === "ew" || k === "pb" || k === "ih") return k;
    if (k.includes("rogue")) return "rb";
    if (k.includes("echo")) return "ew";
    if (k.includes("pack")) return "pb";
    if (k.includes("inner")) return "ih";
    return "";
  }

  function getState() {
    return window.PLAYER_STATE || window.STATE || {};
  }

  function getFactionKeyFromState() {
    const st = getState();
    const p = st.profile || st.player || {};
    return normKey(p.faction || p.faction_key || p.factionKey || st.faction || st.faction_key);
  }

  function getLocalFactionKey() {
    try { return normKey(localStorage.getItem(LS_KEY) || ""); } catch (_) { return ""; }
  }

  function setLocalFactionKey(k) {
    try { localStorage.setItem(LS_KEY, String(k || "")); } catch (_) {}
  }

  function getMyFactionKey() {
    return getFactionKeyFromState() || getLocalFactionKey() || "";
  }

  function findFactionByKeyOrSlug(x) {
    const k = normKey(x);
    if (k) return FACTIONS.find(f => f.key === k) || null;
    const slug = String(x || "").toLowerCase().trim();
    return FACTIONS.find(f => f.slug === slug) || null;
  }

  // ----------------------------
  // UI: styles + modal
  // ----------------------------
  function ensureStyles() {
    if (document.getElementById("factions-css")) return;
    const st = document.createElement("style");
    st.id = "factions-css";
    st.textContent = `
      #factionsBack{
        position: fixed; inset: 0;
        display:none;
        align-items:center; justify-content:center;
        background: rgba(0,0,0,.72);
        z-index: 1500000;
        padding: 14px;
      }
      #factionsBack .fx-panel{
        width: min(560px, 96vw);
        max-height: 92vh;
        overflow: hidden;
        border-radius: 18px;
        background: rgba(10,10,14,.92);
        border: 1px solid rgba(255,255,255,.10);
        box-shadow: 0 18px 60px rgba(0,0,0,.65);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: #eaeaea;
      }
      #factionsBack .fx-hd{
        display:flex; align-items:center; justify-content:space-between;
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255,255,255,.08);
      }
      #factionsBack .fx-title{
        font-weight: 900; letter-spacing:.2px;
      }
      #factionsBack .fx-x{
        border:0; background:transparent; color:#fff;
        font-size: 18px; opacity:.8; cursor:pointer;
      }
      #factionsBack .fx-x:active{ transform: translateY(1px); }

      #factionsRoot{
        padding: 12px 14px 14px;
        overflow:auto;
        max-height: 78vh;
      }

      .fx-lead{
        margin: 2px 0 12px;
        opacity: .86;
        line-height: 1.25;
        font-size: 13px;
      }

      .fx-grid{ display:grid; gap: 10px; }

      .fx-card{
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.22);
        border-radius: 16px;
        padding: 12px;
      }
      .fx-card:hover{
        border-color: rgba(255,255,255,.18);
      }

      .fx-row{ display:flex; gap: 12px; align-items:center; }
      .fx-icon{
        width: 44px; height: 44px; border-radius: 14px;
        display:grid; place-items:center;
        background: rgba(0,0,0,.35);
        border: 1px solid rgba(255,255,255,.10);
        box-shadow: 0 12px 28px rgba(0,0,0,.35);
        position: relative;
      }
      .fx-icon::after{
        content:""; position:absolute; inset:-10px;
        border-radius: 18px;
        background: radial-gradient(circle, currentColor 0%, transparent 60%);
        opacity:.16;
        pointer-events:none;
      }
      .fx-icon img{ width: 22px; height: 22px; display:block; opacity:.98; }

      .fx-name{ font-weight: 950; font-size: 15px; }
      .fx-vibe{ opacity: .8; font-weight: 800; font-size: 12px; margin-top: 2px; }
      .fx-desc{ opacity:.86; font-size: 13px; line-height:1.25; margin-top: 8px; }

      .fx-actions{
        display:flex; gap: 10px; flex-wrap:wrap;
        margin-top: 10px;
      }
      .fx-btn{
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        font-weight: 950;
        cursor: pointer;
      }
      .fx-btn.primary{
        background: #fff;
        color: #000;
      }
      .fx-btn.ghost{
        background: rgba(255,255,255,.08);
        color: #fff;
        border: 1px solid rgba(255,255,255,.12);
      }
      .fx-btn.danger{
        background: rgba(255,59,48,.12);
        color: #ff3b30;
        border: 1px solid rgba(255,59,48,.35);
      }

      .fx-kv{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 12px;
      }
      .fx-kv .box{
        border:1px solid rgba(255,255,255,.08);
        background: rgba(0,0,0,.18);
        border-radius: 14px;
        padding: 10px;
      }
      .fx-kv .k{ opacity:.72; font-size: 12px; font-weight: 800; }
      .fx-kv .v{ margin-top: 4px; font-weight: 950; }
    `;
    document.head.appendChild(st);
  }

  function ensureModal() {
    ensureStyles();
    if (_back && _root) return;

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="factionsBack" aria-hidden="true">
        <div class="fx-panel" role="dialog" aria-modal="true" aria-label="Factions">
          <div class="fx-hd">
            <div class="fx-title">Faction</div>
            <button class="fx-x" type="button" data-close>✕</button>
          </div>
          <div id="factionsRoot"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);

    _back = document.getElementById("factionsBack");
    _root = document.getElementById("factionsRoot");

    _back.addEventListener("click", (e) => {
      if (e.target === _back) close();
    });
    _back.querySelector("[data-close]")?.addEventListener("click", close);

    // Event delegation inside modal
    _root.addEventListener("click", async (e) => {
      const btn = e.target?.closest?.("[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const key = btn.getAttribute("data-key") || "";
      const f = findFactionByKeyOrSlug(key);

      if (action === "join" && f) return joinFaction(f.key);
      if (action === "preview" && f) return previewFaction(f.key);
      if (action === "change") return renderSelector(true);
      if (action === "open_map") {
        document.querySelector('.ah-navbtn[data-go="map"], .btn.map')?.click();
        close();
        return;
      }
      if (action === "open_influence") {
        // best effort: refresh leaders and keep on map
        try { await window.Influence?.refreshLeaders?.(true); } catch(_){}
        document.querySelector('.ah-navbtn[data-go="map"], .btn.map')?.click();
        close();
        return;
      }
      if (action === "close") return close();
    });
  }

  function open(opts = {}) {
    ensureModal();
    _back.style.display = "flex";
    _back.setAttribute("aria-hidden", "false");
    document.body.classList.add("ah-modal-open"); // you already use this class elsewhere

    const mode = opts.mode || "auto"; // auto | select | view
    track("factions_open", { mode });

    if (mode === "select") renderSelector(false);
    else renderAuto();
  }

  function close() {
    if (!_back) return;
    _back.style.display = "none";
    _back.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ah-modal-open");
  }

  // ----------------------------
  // Rendering
  // ----------------------------
  function renderAuto() {
    const my = getMyFactionKey();
    if (!my) return renderSelector(false);
    return renderMyFaction(my);
  }

  function renderSelector(forceNote) {
    const my = getMyFactionKey();
    const note = my
      ? "You already belong to a faction. Switching will be enabled later (cooldown/cost)."
      : "Pick your side. This connects you to influence, leaders and faction events.";

    _root.innerHTML = `
      <div class="fx-lead">
        <div style="font-weight:950; font-size:16px;">Choose your faction</div>
        <div style="margin-top:6px;">${esc(note)}</div>
        ${forceNote ? `<div style="margin-top:6px; opacity:.7;">(V0: selection screen)</div>` : ``}
      </div>

      <div class="fx-grid">
        ${FACTIONS.map(f => `
          <div class="fx-card" style="color:${esc(f.color)}">
            <div class="fx-row">
              <div class="fx-icon" style="color:${esc(f.color)}">
                <img src="${esc(f.icon40)}${window.WEBAPP_VER ? `?v=${esc(window.WEBAPP_VER)}` : ""}"
                     srcset="${esc(f.icon40)} 2x, ${esc(f.icon80)} 4x"
                     alt="${esc(f.name)}">
              </div>
              <div style="flex:1">
                <div class="fx-name">${esc(f.name)}</div>
                <div class="fx-vibe">${esc(f.vibe)}</div>
              </div>
            </div>

            <div class="fx-desc">${esc(f.desc)}</div>

            <div class="fx-actions">
              <button class="fx-btn primary" type="button" data-action="join" data-key="${esc(f.key)}">
                Join ${esc(f.name)}
              </button>
              <button class="fx-btn ghost" type="button" data-action="preview" data-key="${esc(f.key)}">
                Preview
              </button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="fx-actions" style="margin-top:12px;">
        <button class="fx-btn ghost" type="button" data-action="close">Close</button>
      </div>
    `;
  }

  function computeLeadersStats(myKey) {
    // Best-effort: read current leaders map if available (from Influence module)
    const leaders =
      window.Influence?.leadersMap ||
      window.Influence?.state?.leadersMap ||
      window.LEADERS_MAP ||
      null;

    let controlled = 0;
    let total = 0;

    if (leaders && typeof leaders === "object") {
      for (const k of Object.keys(leaders)) {
        total++;
        const fk = normKey(leaders[k]);
        if (fk === myKey) controlled++;
      }
    }

    return { controlled, total };
  }

  function renderMyFaction(myKey) {
    const f = findFactionByKeyOrSlug(myKey);
    if (!f) return renderSelector(false);

    const st = getState();
    const p = st.profile || {};
    const nickname = (p.nickname || p.name || "").trim() || "Howler";
    const lvl = (typeof p.level === "number" ? p.level : (st.profile?.level || st.profile?.stats?.level || null));
    const rank = "Recruit"; // V0 — later: ranks + contributions

    const { controlled, total } = computeLeadersStats(f.key);

    _root.innerHTML = `
      <div class="fx-card" style="color:${esc(f.color)}">
        <div class="fx-row">
          <div class="fx-icon" style="color:${esc(f.color)}">
            <img src="${esc(f.icon40)}${window.WEBAPP_VER ? `?v=${esc(window.WEBAPP_VER)}` : ""}"
                 srcset="${esc(f.icon40)} 2x, ${esc(f.icon80)} 4x"
                 alt="${esc(f.name)}">
          </div>
          <div style="flex:1">
            <div class="fx-name">${esc(f.name)}</div>
            <div class="fx-vibe">${esc(f.vibe)}</div>
          </div>
        </div>

        <div class="fx-desc" style="margin-top:10px;">${esc(f.desc)}</div>

        <div class="fx-kv">
          <div class="box">
            <div class="k">Member</div>
            <div class="v">${esc(nickname)}${lvl != null ? ` · Lv ${esc(lvl)}` : ""}</div>
          </div>
          <div class="box">
            <div class="k">Rank</div>
            <div class="v">${esc(rank)}</div>
          </div>
          <div class="box">
            <div class="k">Controlled</div>
            <div class="v">${total ? `${controlled}/${total}` : "—"}</div>
          </div>
          <div class="box">
            <div class="k">Bonus</div>
            <div class="v">Coming soon</div>
          </div>
        </div>

        <div class="fx-actions" style="margin-top:12px;">
          <button class="fx-btn ghost" type="button" data-action="open_map">Open Map</button>
          <button class="fx-btn ghost" type="button" data-action="open_influence">Influence</button>
          <button class="fx-btn ghost" type="button" data-action="change">Change (soon)</button>
        </div>

        <div style="margin-top:10px; opacity:.65; font-size:12px;">
          V0 note: faction change/leave will be added with cooldown + rules.
        </div>
      </div>

      <div class="fx-actions" style="margin-top:12px;">
        <button class="fx-btn ghost" type="button" data-action="close">Close</button>
      </div>
    `;
  }

  function previewFaction(key) {
    const f = findFactionByKeyOrSlug(key);
    if (!f) return;

    const msg = `${f.name}\n\n${f.desc}\n\n${f.vibe}`;
    // Telegram WebApp popup if available
    try {
      if (_tg?.showPopup) {
        _tg.showPopup({ title: "Faction Preview", message: msg, buttons: [{ type: "ok", text: "OK" }] });
        return;
      }
      if (_tg?.showAlert) { _tg.showAlert(msg); return; }
    } catch (_) {}
    alert(msg);
  }

  // ----------------------------
  // Actions: join/set faction
  // ----------------------------
  function mkRunId(extra = "") {
    const uid = String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "");
    return `${IDEM_PREFIX}:${uid}:${Date.now()}:${extra || ""}`;
  }

  async function joinFaction(key) {
    if (!_apiPost) {
      alert("Factions not initialized (apiPost missing).");
      return;
    }

    const f = findFactionByKeyOrSlug(key);
    if (!f) return;

    const current = getMyFactionKey();
    if (current) {
      // V0: don’t switch yet (until backend supports)
      previewFaction(current);
      alert("You already have a faction. Switching will be enabled later.");
      return;
    }

    track("faction_join_click", { faction: f.key });

    // best effort confirmation
    let ok = true;
    try {
      if (_tg?.showConfirm) {
        ok = await new Promise((resolve) => _tg.showConfirm(`Join ${f.name}?`, resolve));
      } else {
        ok = confirm(`Join ${f.name}?`);
      }
    } catch (_) {}

    if (!ok) return;

    try {
      const run_id = mkRunId(f.key);

      // send both key and slug (backend can pick what it wants)
      const res = await _apiPost("/webapp/faction/set", {
        faction: f.key,
        faction_key: f.key,
        factionSlug: f.slug,
        run_id,
      });

      const okRes = !!(res && (res.ok === true || res.success === true || res.data?.ok === true));
      if (!okRes) {
        const reason = res?.reason || res?.data?.reason || "FAILED";
        alert("Faction set failed: " + reason);
        return;
      }

      // local + in-memory mirrors
      setLocalFactionKey(f.key);

      try {
        if (window.PLAYER_STATE?.profile && typeof window.PLAYER_STATE.profile === "object") {
          window.PLAYER_STATE.profile.faction = f.key;
        }
      } catch (_) {}
      try {
        if (window.PROFILE && typeof window.PROFILE === "object") {
          window.PROFILE.faction = f.key;
        }
      } catch (_) {}

      track("faction_joined", { faction: f.key });

      // refresh UI
      try { window.renderFactionBadge?.(); } catch (_) {}
      try { await window.loadPlayerState?.(); } catch (_) {}

      close();
    } catch (e) {
      console.warn("[Factions] join failed", e);

      // common case: endpoint not deployed yet
      const msg =
        (String(e?.message || "").includes("404") || String(e || "").includes("404"))
          ? "Backend endpoint /webapp/faction/set not found yet. Deploy backend handler first."
          : ("Error joining faction: " + (e?.message || "unknown"));

      alert(msg);
    }
  }

  // ----------------------------
  // Wiring: open from topbar/hub + helpers
  // ----------------------------
  function wireOpenTriggers() {
    // 1) click on topbar pill opens
    const pill = document.getElementById("faction");
    if (pill && !pill.__factions_wired) {
      pill.__factions_wired = true;
      pill.addEventListener("click", () => open({ mode: "auto" }));
    }

    // 2) hub tile: data-action="faction"
    if (!document.__factions_doc_wired) {
      document.__factions_doc_wired = true;
      document.addEventListener("click", (e) => {
        const t = e.target?.closest?.("[data-action]");
        if (!t) return;
        if (t.getAttribute("data-action") === "faction") {
          open({ mode: "auto" });
        }
      });
    }
  }

  // public helpers: for onboarding / buttons
  function openPicker() { open({ mode: "select" }); }

  // ----------------------------
  // Public API
  // ----------------------------
  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    ensureModal();
    wireOpenTriggers();

    // expose for onboarding / other modules
    window.chooseFaction = openPicker;
    window.openFactionPicker = openPicker;

    log("init ok");
  }

  window.Factions = {
    init,
    open,
    openPicker,
    close,
    getMyFactionKey,
    render: renderAuto,
  };
})();
