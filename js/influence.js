// js/influence.js — Influence MVP (Patrol + Donate) for map nodes
(function () {
  const Influence = {};
  let _apiPost = null, _tg = null, _dbg = false;
  let _leadersMap = null;

  const VALID_FACTIONS = new Set(["rogue_byte", "echo_wardens", "pack_burners", "inner_howl"]);

  let _faction = "";
  try { _faction = (localStorage.getItem("ah_faction") || "").toLowerCase(); } catch (_) {}

  function setFaction(f) {
    _faction = String(f || "").toLowerCase();
    try { localStorage.setItem("ah_faction", _faction); } catch (_) {}
  }
  function clearFactionCache() {
    _faction = "";
    try { localStorage.removeItem("ah_faction"); } catch (_) {}
  }
  function getFaction() { return _faction; }

  function fmtSec(sec) {
    sec = Math.max(0, parseInt(sec || 0, 10) || 0);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function rid(prefix = "inf") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function toast(msg) {
    const m = String(msg || "");
    try { window.toast?.(m); return; } catch (_) {}
    try { (_tg || window.Telegram?.WebApp)?.showPopup?.({ message: m }); return; } catch (_) {}
    console.log("[toast]", m);
  }

  // -------------------------
  // Overlay CSS (hard)
  // -------------------------
  const INF_CSS_ID = "ah-influence-overlay-css";
function ensureOverlayCss() {
  if (document.getElementById(INF_CSS_ID)) return;
  const st = document.createElement("style");
  st.id = INF_CSS_ID;
  st.textContent = `
    #influenceModal{
      position:fixed !important;
      left:0 !important; top:0 !important;
      width:100vw !important; height:100vh !important;
      inset:auto !important;
      display:none !important;
      align-items:center !important; justify-content:center !important;
      background:rgba(0,0,0,.55) !important;
      z-index:2147483647 !important;
      transform:none !important;

      /* ✅ critical: never block map taps when closed */
      pointer-events:none !important;
    }
    #influenceModal.is-open{
      display:flex !important;
      pointer-events:auto !important;
    }
    #influenceCard{
      max-height:calc(100vh - 24px) !important;
      overflow:auto !important;
      -webkit-overflow-scrolling:touch !important;
    }
  `;
  document.head.appendChild(st);
  }

  // -------------------------
  // TG picker (max 3 buttons)
  // -------------------------
  function tgPickFaction() {
    return new Promise((resolve) => {
      const tg = _tg || window.Telegram?.WebApp || null;
      if (!tg?.showPopup) return resolve(_faction || "");

      const pick = (key) => { setFaction(key); resolve(key); };

      const popup2 = () => tg.showPopup({
        title: "Choose faction",
        message: "More factions:",
        buttons: [
          { id: "pb", type: "default", text: "Pack Burners" },
          { id: "ih", type: "default", text: "Inner Howl" },
          { id: "back", type: "default", text: "← Back" },
        ]
      }, (btnId) => {
        if (btnId === "pb") return pick("pack_burners");
        if (btnId === "ih") return pick("inner_howl");
        if (btnId === "back") return popup1();
        return resolve(_faction || "");
      });

      const popup1 = () => tg.showPopup({
        title: "Choose faction",
        message: "Pick your side.",
        buttons: [
          { id: "rb", type: "default", text: "Rogue Byte" },
          { id: "ew", type: "default", text: "Echo Wardens" },
          { id: "more", type: "default", text: "More…" },
        ]
      }, (btnId) => {
        if (btnId === "rb") return pick("rogue_byte");
        if (btnId === "ew") return pick("echo_wardens");
        if (btnId === "more") return popup2();
        return resolve(_faction || "");
      });

      popup1();
    });
  }

  // -------------------------
  // Backend truth → cache
  // -------------------------
  async function fetchFactionFromBackend() {
    if (!_apiPost) return "";
    try {
      const r = await _apiPost("/webapp/faction/state", { run_id: rid("fstate") });
      const f = r?.faction || r?.data?.faction || r?.data?.key || r?.data?.factionKey || "";
      const key = String(f || "").toLowerCase();
      if (VALID_FACTIONS.has(key)) {
        setFaction(key);
        window.currentUserFaction = key;
        return key;
      }
      return "";
    } catch (e) {
      if (_dbg) console.warn("fetchFactionFromBackend failed", e);
      return "";
    }
  }

  async function ensureFaction() {
    const fromApi = await fetchFactionFromBackend();
    if (VALID_FACTIONS.has(fromApi)) return fromApi;

    if (VALID_FACTIONS.has(_faction)) return _faction;

    const picked = await tgPickFaction();
    if (!VALID_FACTIONS.has(picked)) return "";

    setFaction(picked);
    window.currentUserFaction = picked;
    return picked;
  }

  // -------------------------
  // Error decode + apply leaders
  // -------------------------
  function explainFail(r) {
    const reason = String(r?.reason || "FAILED");
    if (reason === "COOLDOWN") return `Cooldown: ${fmtSec(r.cooldownLeftSec)} left`;
    if (reason === "HTTP_401" || reason === "NO_UID") return "Open the app from Telegram (auth missing).";
    if (reason === "NO_FACTION") { clearFactionCache(); return "Pick faction again."; }

    if (reason === "NOT_ENOUGH") return `Not enough (have ${r?.have ?? "?"} need ${r?.need ?? "?"})`;
    if (reason === "TOO_SMALL") return "Amount too small for conversion.";
    if (reason === "DONATE_CAP_HIT") return `Donate capped. Refunded ${r?.refunded ?? 0}.`;
    if (reason === "BAD_NODE") return "This node isn’t active yet.";
    if (reason === "BAD_ASSET") return "Bad asset type.";
    if (reason === "BAD_ACTION") return "Bad action.";
    return reason;
  }

  function applyLeadersFromResponse(r, nodeId) {
    const leaders = r?.leadersMap || r?.leaders_map || r?.data?.leadersMap || r?.data?.leaders_map || null;
    if (!leaders) return;
    _leadersMap = leaders;
    window.__AH_LEADERS_MAP = leaders;

    try { window.AHMap?.applyLeaders?.(leaders); } catch (_) {}
    try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}
    try { if (nodeId) paintLeader(nodeId); } catch (_) {}
  }

  // -------------------------
  // Modal UI (root-mounted)
  // -------------------------
 function ensureModal(force = false) {
  ensureOverlayCss();

  const existing = document.getElementById("influenceModal");
  if (existing) {
    if (force) {
      try { existing.remove(); } catch (_) {}
    } else {
      // move to <html> (prevents clipping)
      try {
        if (existing.parentElement !== document.documentElement) {
          document.documentElement.appendChild(existing);
        }
      } catch (_) {}

      // rebind always
      existing.onclick = (e) => {
        if (e.target === existing) close();
        const t = e.target;
        if (t?.matches?.("[data-close]")) close();
        if (t?.classList?.contains("infAmt")) {
          const v = parseInt(t.getAttribute("data-v") || "0", 10);
          const inp = document.getElementById("infAmount");
          if (inp) inp.value = String(v);
        }
      };

      const tog = document.getElementById("infDonateToggle");
      if (tog) {
        tog.onclick = () => {
          const box = document.getElementById("infDonateBox");
          if (!box) return;
          box.style.display = (!box.style.display || box.style.display === "none") ? "block" : "none";
        };
      }
      return;
    }
  }

  const wrap = document.createElement("div");
  wrap.id = "influenceModal";
    wrap.className = ""; // overlay handled by CSS

    wrap.innerHTML = `
      <div id="influenceCard" style="
        width: min(92vw, 420px);
        background: rgba(18,18,22,.98);
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 16px;
        box-shadow: 0 18px 60px rgba(0,0,0,.55);
        padding: 14px 14px 12px;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div>
            <div id="infTitle" style="font-weight:700;font-size:16px;line-height:1.2;">Influence</div>
            <div id="infSub" style="opacity:.75;font-size:12px;margin-top:2px;"></div>
          </div>
          <button data-close type="button" style="
            border:0;background:rgba(255,255,255,.08);color:#fff;
            border-radius:10px;padding:8px 10px;cursor:pointer
          ">✕</button>
        </div>

        <div id="infLeaderLine" style="margin-top:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,.06);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <div style="font-size:12px;opacity:.75;">Current leader</div>
              <div id="infLeader" style="font-weight:700;margin-top:2px;">—</div>
            </div>
            <div id="infContested" style="
              display:none;
              font-size:12px;
              padding:6px 10px;
              border-radius:999px;
              background:rgba(255,170,0,.15);
              border:1px solid rgba(255,170,0,.25);
              color:#ffb84d;
            ">⚠ contested</div>
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button id="infPatrolBtn" type="button" style="
            flex:1; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: rgba(120,255,220,.12);
            border: 1px solid rgba(120,255,220,.22);
            color:#eafff8; font-weight:700;
          ">Patrol</button>

          <button id="infDonateToggle" type="button" style="
            flex:1; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: rgba(170,140,255,.12);
            border: 1px solid rgba(170,140,255,.22);
            color:#f5f0ff; font-weight:700;
          ">Donate</button>
        </div>

        <div id="infDonateBox" style="display:none; margin-top:12px;">
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="infAsset" style="
              flex:1; padding:10px 10px; border-radius:12px;
              background:rgba(255,255,255,.06); color:#fff; border:1px solid rgba(255,255,255,.10);
            ">
              <option value="scrap">scrap</option>
              <option value="rune_dust">rune_dust</option>
              <option value="bones">bones</option>
            </select>
            <input id="infAmount" type="number" min="1" step="1" value="10" style="
              width:120px; padding:10px 10px; border-radius:12px;
              background:rgba(255,255,255,.06); color:#fff; border:1px solid rgba(255,255,255,.10);
            "/>
          </div>

          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="infAmt" type="button" data-v="10"  style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+10</button>
            <button class="infAmt" type="button" data-v="50"  style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+50</button>
            <button class="infAmt" type="button" data-v="100" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+100</button>
          </div>

          <button id="infDonateBtn" type="button" style="
            width:100%; margin-top:10px; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: rgba(255,210,120,.12);
            border: 1px solid rgba(255,210,120,.22);
            color:#fff6e8; font-weight:800;
          ">Confirm donate</button>
        </div>

        <div id="infFoot" style="margin-top:10px; font-size:12px; opacity:.65;"></div>
      </div>
    `;

    wrap.onclick = (e) => {
      if (e.target === wrap) close();
      const t = e.target;
      if (t?.matches?.("[data-close]")) close();
      if (t?.classList?.contains("infAmt")) {
        const v = parseInt(t.getAttribute("data-v") || "0", 10);
        const inp = document.getElementById("infAmount");
        if (inp) inp.value = String(v);
      }
    };

    document.documentElement.appendChild(wrap);

    const tog = document.getElementById("infDonateToggle");
    if (tog) {
      tog.onclick = () => {
        const box = document.getElementById("infDonateBox");
        if (!box) return;
        box.style.display = (!box.style.display || box.style.display === "none") ? "block" : "none";
      };
    }
  }

  function open(nodeId, title = "") {
    ensureModal();
    const m = document.getElementById("influenceModal");
    if (!m) return;

    m.dataset.nodeId = nodeId;

    const titleEl = document.getElementById("infTitle");
    const subEl = document.getElementById("infSub");
    if (titleEl) titleEl.textContent = title || nodeId;
    if (subEl) subEl.textContent = nodeId;

    (async () => {
      await refreshLeaders(false);
      paintLeader(nodeId);
    })();

    const patrolBtn = document.getElementById("infPatrolBtn");
    const donateBtn = document.getElementById("infDonateBtn");
    if (patrolBtn) patrolBtn.onclick = () => doPatrol(nodeId);
    if (donateBtn) donateBtn.onclick = () => doDonate(nodeId);

    m.classList.add("is-open");
    document.body.classList.add("ah-modal-open");
  }

  function close() {
    const m = document.getElementById("influenceModal");
    if (!m) return;
    m.classList.remove("is-open");
    document.body.classList.remove("ah-modal-open");
  }

  function paintLeader(nodeId) {
    const info = _leadersMap?.[nodeId];
    const leaderEl = document.getElementById("infLeader");
    const contEl = document.getElementById("infContested");
    const foot = document.getElementById("infFoot");
    if (!leaderEl || !contEl || !foot) return;

    if (!info) {
      leaderEl.textContent = "—";
      contEl.style.display = "none";
      foot.textContent = "";
      return;
    }

    const leader = info.leader || "none";
    leaderEl.textContent = `${leader} (${info.leaderValue || 0})`;
    contEl.style.display = info.contested ? "inline-flex" : "none";

    const s = info.scores || {};
    foot.textContent = `RB ${s.rogue_byte || 0} · EW ${s.echo_wardens || 0} · PB ${s.pack_burners || 0} · IH ${s.inner_howl || 0}`;
  }

  async function refreshLeaders(applyToMap = true) {
    if (!_apiPost) return;
    try {
      const r = await _apiPost("/webapp/map/leaders", { run_id: rid("lead") });
      const leaders = r?.leadersMap || r?.leaders_map || r?.data?.leadersMap || r?.data?.leaders_map || null;
      if (leaders) {
        _leadersMap = leaders;
        window.__AH_LEADERS_MAP = leaders;
        if (applyToMap) {
          try { window.AHMap?.applyLeaders?.(leaders); } catch (_) {}
          try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}
        }
      }
    } catch (e) {
      if (_dbg) console.warn("refreshLeaders failed", e);
    }
  }

  async function doPatrol(nodeId) {
    if (!_apiPost) return;

    const btn = document.getElementById("infPatrolBtn");
    if (btn) btn.disabled = true;

    try {
      const faction = await ensureFaction();
      if (!faction) return toast("Faction required.");

      const r = await _apiPost("/webapp/influence/action", {
        nodeId,
        action: "patrol",
        faction,
        run_id: rid("patrol"),
      });

      if (!r?.ok) {
        toast(explainFail(r));
        applyLeadersFromResponse(r, nodeId);
        return;
      }

      const hq = (r?.hqMult != null) ? ` (HQ x${Number(r.hqMult).toFixed(2)})` : "";
      toast(`+${r.gain} influence${hq}`);
      applyLeadersFromResponse(r, nodeId);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function doDonate(nodeId) {
    if (!_apiPost) return;

    const asset = (document.getElementById("infAsset")?.value || "scrap").trim();
    const amount = parseInt(document.getElementById("infAmount")?.value || "0", 10) || 0;
    if (amount <= 0) return toast("Bad amount");

    const btn = document.getElementById("infDonateBtn");
    if (btn) btn.disabled = true;

    try {
      const faction = await ensureFaction();
      if (!faction) return toast("Faction required.");

      const r = await _apiPost("/webapp/influence/action", {
        nodeId,
        action: "donate",
        faction,
        asset,
        amount,
        run_id: rid("donate"),
      });

      if (!r?.ok) {
        toast(explainFail(r));
        applyLeadersFromResponse(r, nodeId);
        return;
      }

      const hq = (r?.hqMult != null) ? ` (HQ x${Number(r.hqMult).toFixed(2)})` : "";
      toast(`Donated ${amount} ${asset} → +${r.gain} influence${hq}`);
      applyLeadersFromResponse(r, nodeId);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // -------------------------
  // Public API
  // -------------------------
  Influence.init = function ({ apiPost, tg, dbg }) {
    _apiPost = apiPost;
    _tg = tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    // force rebuild to kill stale DOM
    ensureModal(true);

    refreshLeaders(true);
    fetchFactionFromBackend();
  };

  Influence.open = open;
  Influence.close = close;
  Influence.refreshLeaders = refreshLeaders;

  Influence.setFaction = setFaction;
  Influence.clearFactionCache = clearFactionCache;
  Influence.ensureFaction = ensureFaction;
  Influence.getFaction = getFaction;

  window.Influence = Influence;
})();
