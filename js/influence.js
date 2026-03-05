// js/influence.js — Influence MVP (Patrol + Donate) for map nodes
// - truth-first faction (backend -> cache -> TG picker)
// - robust UX: inline status + cooldown countdown + clear error messages
// - applies leadersMap when returned
// - exports setFaction/ensureFaction for HQ integration
(function () {
  const Influence = {};
  let _apiPost = null, _tg = null, _dbg = false;
  let _leadersMap = null;

  // -------------------------
  // Faction memory (cache only)
  // -------------------------
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

  function fmtSec(sec) {
    sec = Math.max(0, parseInt(sec || 0, 10) || 0);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  // -------------------------
  // Run id
  // -------------------------
  function rid(prefix = "inf") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // -------------------------
  // Toast helper
  // -------------------------
  function toast(msg) {
    const m = String(msg || "");
    try { window.toast?.(m); return; } catch (_) {}
    try { (_tg || window.Telegram?.WebApp)?.showPopup?.({ title: "Influence", message: m, buttons: [{ type: "ok" }] }); return; } catch (_) {}
    console.log("[toast]", m);
  }

  // -------------------------
  // UI state (cooldown + status)
  // -------------------------
  let _cdUntilMs = 0;
  let _cdTick = null;
  let _lastFactionCdSec = 0;

  function _qs(id) { return document.getElementById(id); }

  function setStatus(msg, kind = "info") {
    const el = _qs("infStatus");
    if (!el) return;
    const m = String(msg || "").trim();
    if (!m) { el.style.display = "none"; el.textContent = ""; return; }
    el.textContent = m;
    el.style.display = "block";

    if (kind === "err") {
      el.style.border = "1px solid rgba(255,120,120,.22)";
      el.style.background = "rgba(255,120,120,.10)";
    } else if (kind === "ok") {
      el.style.border = "1px solid rgba(120,255,180,.20)";
      el.style.background = "rgba(120,255,180,.08)";
    } else {
      el.style.border = "1px solid rgba(255,255,255,.10)";
      el.style.background = "rgba(255,255,255,.06)";
    }
  }

  function clearStatus() { setStatus(""); }

  function _stopCooldownTick() {
    if (_cdTick) { clearInterval(_cdTick); _cdTick = null; }
  }

  function _renderCooldown() {
    const btn = _qs("infPatrolBtn");
    const now = Date.now();
    const leftSec = Math.max(0, Math.ceil((_cdUntilMs - now) / 1000));

    if (leftSec <= 0) {
      _cdUntilMs = 0;
      _stopCooldownTick();
      if (btn) { btn.disabled = false; btn.textContent = "Patrol"; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = `Patrol (${fmtSec(leftSec)})`; }
    setStatus(`Cooldown: ${fmtSec(leftSec)} left`, "info");
  }

  function startCooldown(sec) {
    sec = Math.max(0, parseInt(sec || 0, 10) || 0);
    if (sec <= 0) return;
    _cdUntilMs = Date.now() + (sec * 1000);
    _renderCooldown();
    _stopCooldownTick();
    _cdTick = setInterval(_renderCooldown, 1000);
  }

  // -------------------------
  // TG picker (max 3 buttons)
  // returns FULL faction keys
  // -------------------------
  function tgPickFaction() {
    return new Promise((resolve) => {
      const tg = _tg || window.Telegram?.WebApp || null;

      // fallback: jeśli brak TG popup, zwróć zapisane / pusty
      if (!tg?.showPopup) return resolve(_faction || "");

      const pick = (key) => { setFaction(key); resolve(key); };

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
        return resolve(_faction || ""); // close
      });

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

      const f =
        r?.faction ||
        r?.data?.faction ||
        r?.data?.key ||
        r?.data?.factionKey ||
        "";

      const cd = parseInt(r?.cooldownLeftSec || r?.data?.cooldownLeftSec || 0, 10) || 0;
      _lastFactionCdSec = cd;
      if (cd > 0) startCooldown(cd);

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

  // -------------------------
  // Ensure faction (truth first)
  // -------------------------
  async function ensureFaction() {
    // 1) backend truth first (prevents loops)
    const fromApi = await fetchFactionFromBackend();
    if (VALID_FACTIONS.has(fromApi)) return fromApi;

    // 2) fallback: cached value
    if (VALID_FACTIONS.has(_faction)) return _faction;

    // 3) ask user
    const picked = await tgPickFaction();
    if (!VALID_FACTIONS.has(picked)) return "";

    setFaction(picked);
    window.currentUserFaction = picked;

    return picked;
  }

  // -------------------------
  // Error decode
  // -------------------------
  function explainFail(r, ctx = {}) {
    const reason = String(r?.reason || "FAILED");

    if (reason === "COOLDOWN") return `Cooldown: ${fmtSec(r.cooldownLeftSec)} left`;
    if (reason === "HTTP_401" || reason === "NO_UID") return "Auth missing. Close & reopen WebApp from Telegram.";
    if (reason === "NO_FACTION") { clearFactionCache(); return "Pick faction again."; }

    if (reason === "NOT_ENOUGH") {
      const have = (r?.have ?? "?");
      const need = (r?.need ?? "?");
      const a = ctx.asset ? ` ${ctx.asset}` : "";
      return `Not enough${a} (have ${have} need ${need})`;
    }
    if (reason === "TOO_SMALL") return "Amount too small.";
    if (reason === "DONATE_CAP_HIT") return `Donate capped. Refunded ${r?.refunded ?? 0}.`;
    if (reason === "BAD_NODE") return "This node isn’t active yet.";
    if (reason === "BAD_ASSET") return "Bad asset type.";
    if (reason === "BAD_ACTION") return "Bad action.";

    return reason;
  }

  function applyLeadersFromResponse(r, nodeId) {
    const leaders =
      r?.leadersMap ||
      r?.leaders_map ||
      r?.data?.leadersMap ||
      r?.data?.leaders_map ||
      null;

    if (!leaders) return;
    _leadersMap = leaders;

    try { window.AHMap?.applyLeaders?.(_leadersMap); } catch (_) {}
    try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}
    try { if (nodeId) paintLeader(nodeId); } catch (_) {}
  }

  function _modalHost() {
    let h = document.getElementById("ahModalHost");
    if (h) return h;

    h = document.createElement("div");
    h.id = "ahModalHost";
    h.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: none; /* pokazujemy tylko gdy modal otwarty */
    `;
    (document.documentElement || document.body).appendChild(h);
    return h;
  }

  // -------------------------
  // Modal UI
  // -------------------------
  function ensureModal() {
    if (document.getElementById("influenceModal")) return;

    const wrap = document.createElement("div");
    wrap.id = "influenceModal";
    wrap.style.cssText = `
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding:
        calc(env(safe-area-inset-top, 0px) + 12px)
        10px
        calc(env(safe-area-inset-bottom, 0px) + 16px)
        10px;
      box-sizing: border-box;
      overflow: hidden;
      background: rgba(0,0,0,.55);
      z-index: 2147483647;
      transform: none;
    `;

    wrap.innerHTML = `
      <div id="influenceCard" style="
        width: min(92vw, 420px);
        background: rgba(18,18,22,.98);
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 16px;
        box-shadow: 0 18px 60px rgba(0,0,0,.55);
        padding: 14px 14px 12px;
        max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 40px);
        overflow: auto;
        -webkit-overflow-scrolling: touch;
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
            <button class="infAmt" type="button" data-v="10" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+10</button>
            <button class="infAmt" type="button" data-v="50" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+50</button>
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

        <div id="infStatus" style="
          display:none;
          margin-top:10px;
          padding:10px 12px;
          border-radius:12px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.10);
          font-size:12px;
          line-height:1.35;
          opacity:.95;
        "></div>

        <div id="infFoot" style="margin-top:10px; font-size:12px; opacity:.65;"></div>
      </div>
    `;

    // direct bind close
    const _closeBtn = wrap.querySelector("[data-close]");
    if (_closeBtn) {
      _closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
      });
    }

    // click handling
    wrap.addEventListener("click", (e) => {
      const t = e.target;

      if (t && t.matches("[data-close]")) { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (t === wrap) { e.preventDefault(); e.stopPropagation(); close(); return; }

      if (t && t.classList && t.classList.contains("infAmt")) {
        e.preventDefault(); e.stopPropagation();
        const v = parseInt(t.getAttribute("data-v") || "0", 10);
        const inp = document.getElementById("infAmount");
        if (inp) inp.value = String(v);
        return;
      }
    });

    // stop bubbling from card
    const card = wrap.querySelector("#influenceCard");
    if (card) card.addEventListener("click", (e) => e.stopPropagation());

    _modalHost().appendChild(wrap);

    document.getElementById("infDonateToggle")?.addEventListener("click", () => {
      const box = document.getElementById("infDonateBox");
      if (!box) return;
      box.style.display = (box.style.display === "none" || !box.style.display) ? "block" : "none";
    });
  }

  async function refreshLeaders(applyToMap = true) {
    if (!_apiPost) return;
    try {
      const r = await _apiPost("/webapp/map/leaders", { run_id: rid("lead") });
      const ok = r?.ok !== false;
      const leaders =
        r?.leadersMap ||
        r?.leaders_map ||
        r?.data?.leadersMap ||
        r?.data?.leaders_map ||
        null;

      if (ok && leaders) {
        _leadersMap = leaders;

        if (applyToMap) {
          try { window.AHMap?.applyLeaders?.(leaders); } catch (_) {}
          try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}
        }
      }
    } catch (e) {
      if (_dbg) console.warn("refreshLeaders failed", e);
    }
  }

  function open(nodeId, title = "") {
    ensureModal();
    const m = document.getElementById("influenceModal");
    if (!m) return;

    clearStatus();

    // show host (escape transforms)
    _modalHost().style.display = "block";

    try { (_tg || window.Telegram?.WebApp)?.expand?.(); } catch (_) {}

    m.dataset.nodeId = nodeId;

    const titleEl = document.getElementById("infTitle");
    const subEl = document.getElementById("infSub");
    if (titleEl) titleEl.textContent = title || nodeId;
    if (subEl) subEl.textContent = nodeId;

    // close donate box at start
    const donateBox = document.getElementById("infDonateBox");
    if (donateBox) donateBox.style.display = "none";

    (async () => {
      await refreshLeaders(false);
      paintLeader(nodeId);
    })();

    const patrolBtn = document.getElementById("infPatrolBtn");
    const donateBtn = document.getElementById("infDonateBtn");
    if (patrolBtn) patrolBtn.onclick = () => doPatrol(nodeId);
    if (donateBtn) donateBtn.onclick = () => doDonate(nodeId);

    m.style.display = "flex";
    document.body.classList.add("ah-modal-open");

    // if cooldown running, render it immediately
    if (_cdUntilMs > Date.now()) {
      startCooldown(Math.ceil((_cdUntilMs - Date.now()) / 1000));
    } else if (_lastFactionCdSec > 0) {
      startCooldown(_lastFactionCdSec);
    } else {
      // ensure button is not stuck disabled
      const btn = _qs("infPatrolBtn");
      if (btn) { btn.disabled = false; btn.textContent = "Patrol"; }
    }

    // reset scroll on card
    requestAnimationFrame(() => {
      try {
        const card = document.getElementById("influenceCard");
        if (card) card.scrollTop = 0;
      } catch (_) {}
    });
  }

  function close() {
    const m = document.getElementById("influenceModal");
    if (!m) return;

    m.style.display = "none";
    document.body.classList.remove("ah-modal-open");

    try {
      const card = document.getElementById("influenceCard");
      if (card) card.scrollTop = 0;
    } catch (_) {}

    _modalHost().style.display = "none";
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

  async function doPatrol(nodeId) {
    if (!_apiPost) return;

    const btn = document.getElementById("infPatrolBtn");
    if (btn) btn.disabled = true;

    try {
      const faction = await ensureFaction();
      if (!faction) { setStatus("Faction required.", "err"); return toast("Faction required."); }

      const r = await _apiPost("/webapp/influence/action", {
        nodeId,
        action: "patrol",
        faction,
        run_id: rid("patrol"),
      });

      if (!r?.ok) {
        const msg = explainFail(r);
        setStatus(msg, "err");
        toast(msg);
        if (String(r?.reason || "") === "COOLDOWN") startCooldown(r.cooldownLeftSec);
        applyLeadersFromResponse(r, nodeId);
        return;
      }

      clearStatus();
      const hq = (r?.hqMult != null) ? ` (HQ x${Number(r.hqMult).toFixed(2)})` : "";
      toast(`+${r.gain} influence${hq}`);
      setStatus(`+${r.gain} influence${hq}`, "ok");

      applyLeadersFromResponse(r, nodeId);
    } finally {
      // if cooldown active, keep disabled
      if (btn) {
        if (_cdUntilMs > Date.now()) {
          // will be re-rendered by cooldown tick
        } else {
          btn.disabled = false;
          btn.textContent = "Patrol";
        }
      }
    }
  }

  async function doDonate(nodeId) {
    if (!_apiPost) return;

    const asset = (document.getElementById("infAsset")?.value || "scrap").trim();
    const amount = parseInt(document.getElementById("infAmount")?.value || "0", 10) || 0;
    if (amount <= 0) { setStatus("Bad amount", "err"); return toast("Bad amount"); }

    const btn = document.getElementById("infDonateBtn");
    if (btn) btn.disabled = true;

    try {
      const faction = await ensureFaction();
      if (!faction) { setStatus("Faction required.", "err"); return toast("Faction required."); }

      const r = await _apiPost("/webapp/influence/action", {
        nodeId,
        action: "donate",
        faction,
        asset,
        amount,
        run_id: rid("donate"),
      });

      if (!r?.ok) {
        const msg = explainFail(r, { asset, amount });
        setStatus(msg, "err");
        toast(msg);
        if (String(r?.reason || "") === "COOLDOWN") startCooldown(r.cooldownLeftSec);
        applyLeadersFromResponse(r, nodeId);
        return;
      }

      clearStatus();
      const hq = (r?.hqMult != null) ? ` (HQ x${Number(r.hqMult).toFixed(2)})` : "";
      toast(`Donated ${amount} ${asset} → +${r.gain} influence${hq}`);
      setStatus(`Donated ${amount} ${asset} → +${r.gain} influence${hq}`, "ok");

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

    if (_dbg) console.log("[INFLUENCE] loaded v=", window.WEBAPP_VER, new Date().toISOString());

    ensureModal();
    refreshLeaders(true);
    fetchFactionFromBackend();
  };

  Influence.open = open;
  Influence.close = close;
  Influence.refreshLeaders = refreshLeaders;

  // for HQ / other modules
  Influence.setFaction = setFaction;
  Influence.clearFactionCache = clearFactionCache;
  Influence.ensureFaction = ensureFaction;
  Influence.getFaction = () => _faction;

  window.Influence = Influence;
})();
