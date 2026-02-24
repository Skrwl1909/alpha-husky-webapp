// js/influence.js — Influence MVP (Patrol + Donate) for map nodes
(function () {
  const Influence = {};
  let _apiPost = null, _tg = null, _dbg = false;
  let _leadersMap = null;

   // --- faction memory (front-only) ---
  let _faction = (localStorage.getItem("ah_faction") || "").toLowerCase();

  function fmtSec(sec){
    sec = Math.max(0, parseInt(sec || 0, 10) || 0);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function tgPickFaction(){
    return new Promise((resolve) => {
      const tg = _tg || window.Telegram?.WebApp || null;

      // Telegram popup
      if (tg?.showPopup) {
        tg.showPopup({
          title: "Choose faction",
          message: "Pick your faction for Influence actions.",
          buttons: [
            { id:"rb", text:"RB", type:"default" },
            { id:"ew", text:"EW", type:"default" },
            { id:"pb", text:"PB", type:"default" },
            { id:"ih", text:"IH", type:"default" },
            { id:"x",  text:"Cancel", type:"destructive" },
          ]
        }, (id) => resolve((id || "").toLowerCase()));
        return;
      }

      // fallback prompt
      const v = (window.prompt("Choose faction: rb / ew / pb / ih", "rb") || "").trim().toLowerCase();
      resolve(v);
    });
  }

  async function ensureFaction(){
    if (_faction && ["rb","ew","pb","ih"].includes(_faction)) return _faction;

    const f = await tgPickFaction();
    if (!["rb","ew","pb","ih"].includes(f)) return "";

    _faction = f;
    try { localStorage.setItem("ah_faction", _faction); } catch(_){}
    return _faction;
  }
  
  function rid(prefix="inf") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  }

  function toast(msg) {
    try { window.toast?.(msg); return; } catch(_){}
    try { _tg?.showPopup?.({ message: String(msg) }); return; } catch(_){}
    console.log("[toast]", msg);
  }

  function ensureModal() {
    if (document.getElementById("influenceModal")) return;

    const wrap = document.createElement("div");
    wrap.id = "influenceModal";
    wrap.style.cssText = `
      position: fixed; inset: 0; display: none;
      align-items: center; justify-content: center;
      background: rgba(0,0,0,.55);
      z-index: 999999;
    `;

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
          <button data-close style="
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
          <button id="infPatrolBtn" style="
            flex:1; border:0; cursor:pointer;
            border-radius:12px; padding:12px 12px;
            background: rgba(120,255,220,.12);
            border: 1px solid rgba(120,255,220,.22);
            color:#eafff8; font-weight:700;
          ">Patrol</button>

          <button id="infDonateToggle" style="
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
            <button class="infAmt" data-v="10" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+10</button>
            <button class="infAmt" data-v="50" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+50</button>
            <button class="infAmt" data-v="100" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;cursor:pointer;">+100</button>
          </div>

          <button id="infDonateBtn" style="
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

    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close();
      const t = e.target;
      if (t && t.matches("[data-close]")) close();
      if (t && t.classList && t.classList.contains("infAmt")) {
        const v = parseInt(t.getAttribute("data-v") || "0", 10);
        const inp = document.getElementById("infAmount");
        if (inp) inp.value = String(v);
      }
    });

    document.body.appendChild(wrap);

    document.getElementById("infDonateToggle")?.addEventListener("click", () => {
      const box = document.getElementById("infDonateBox");
      if (!box) return;
      box.style.display = (box.style.display === "none" || !box.style.display) ? "block" : "none";
    });
  }

  function open(nodeId, title="") {
    ensureModal();
    const m = document.getElementById("influenceModal");
    if (!m) return;

    m.dataset.nodeId = nodeId;

    document.getElementById("infTitle").textContent = title || nodeId;
    document.getElementById("infSub").textContent = nodeId;

    paintLeader(nodeId);

    document.getElementById("infPatrolBtn").onclick = () => doPatrol(nodeId);
    document.getElementById("infDonateBtn").onclick = () => doDonate(nodeId);

    m.style.display = "flex";
    document.body.classList.add("ah-modal-open");
  }

  function close() {
    const m = document.getElementById("influenceModal");
    if (!m) return;
    m.style.display = "none";
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
    foot.textContent = `RB ${s.rogue_byte||0} · EW ${s.echo_wardens||0} · PB ${s.pack_burners||0} · IH ${s.inner_howl||0}`;
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
        // ✅ ensure UI refresh even if applyLeaders doesn't re-render pins
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
    const r = await _apiPost("/webapp/influence/action", {
      nodeId,
      action: "patrol",
      run_id: rid("patrol"),
    });

    if (!r?.ok) {
      if (r?.reason === "COOLDOWN") {
        toast(`Cooldown: ${r.cooldownLeftSec}s`);
      } else {
        toast(r?.reason || "Patrol failed");
      }
      return;
    }

    toast(`+${r.gain} influence`);

    const leaders = r?.leadersMap || r?.leaders_map || null;
    if (leaders) {
      _leadersMap = leaders;
      try { window.AHMap?.applyLeaders?.(_leadersMap); } catch (_) {}
      try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}
      try { paintLeader(nodeId); } catch (_) {}
    }
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
    const r = await _apiPost("/webapp/influence/action", {
      nodeId,
      action: "donate",
      asset,
      amount,
      run_id: rid("donate"),
    });

    if (!r?.ok) {
      toast(r?.reason || "Donate failed");
      return;
    }

    toast(`Donated ${amount} ${asset} → +${r.gain} influence`);

    const leaders = r?.leadersMap || r?.leaders_map || null;
    if (leaders) {
      _leadersMap = leaders;
      try { window.AHMap?.applyLeaders?.(_leadersMap); } catch (_) {}
      try { if (typeof window.renderPins === "function") window.renderPins(); } catch (_) {}
      try { paintLeader(nodeId); } catch (_) {}
    }
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
      const r = await _apiPost("/webapp/influence/action", {
        nodeId,
        action: "donate",
        asset,
        amount,
        run_id: rid("donate")
      });

      if (!r?.ok) {
        toast(r?.reason || "Donate failed");
        return;
      }

      toast(`Donated ${amount} ${asset} → +${r.gain} influence`);
      if (r?.leadersMap) {
        _leadersMap = r.leadersMap;
        try { window.AHMap?.applyLeaders?.(_leadersMap); } catch(_) {}
        paintLeader(nodeId);
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  Influence.init = function ({ apiPost, tg, dbg }) {
    _apiPost = apiPost;
    _tg = tg;
    _dbg = !!dbg;
    ensureModal();
  };

  Influence.open = open;
  Influence.close = close;
  Influence.refreshLeaders = refreshLeaders;

  window.Influence = Influence;
})();
