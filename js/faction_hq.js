// js/faction_hq.js — Faction HQ (Alpha Husky WebApp) — warroom backgrounds + HQ backdrop
(function(){
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _back = null;   // #factionHQBack
  let _modal = null;  // #factionHQModal
  let _root = null;   // #factionHQRoot

  function log(...a){ if(_dbg) console.log("[FactionHQ]", ...a); }

  // ---------------------------
  // BG mapping
  // ---------------------------
  function _normFactionKey(f){
    f = String(f || "").toLowerCase().trim();
    if (!f) return "";
    if (f === "rb" || f === "ew" || f === "pb" || f === "ih") return f;
    if (f.includes("rogue")) return "rb";
    if (f.includes("echo"))  return "ew";
    if (f.includes("pack") || f.includes("burn")) return "pb";
    if (f.includes("inner") || f.includes("iron") || f.includes("howl")) return "ih"; // inner_howl -> IH
    return f;
  }

  function _hqBgUrlForFaction(faction){
    const k = _normFactionKey(faction);
    const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
    // ✅ ABSOLUTE PATHS (pewne na Vercel/Telegram WebView)
    const map = {
      rb: `/hq_warroom_rb.webp${v}`,
      ew: `/hq_warroom_ew.webp${v}`,
      pb: `/hq_warroom_pb.webp${v}`,
      ih: `/hq_warroom_ih.webp${v}`,
    };
    return map[k] || map.rb;
  }

  function applyHqBg(faction){
    const url = _hqBgUrlForFaction(faction);
    document.documentElement.style.setProperty("--hq-bg-url", `url("${url}")`);
  }

  function _prefetchBgs(){
    try{
      const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
      ["rb","ew","pb","ih"].forEach(k => { const i=new Image(); i.src = `/hq_warroom_${k}.webp${v}`; });
    }catch(_){}
  }

  // ---------------------------
  // UID helper (debug)
  // ---------------------------
  function _uid(){
    try { return String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || ""); } catch(_) { return ""; }
  }
  function _uidTail(){
    const u = _uid();
    return u ? u.slice(-5) : "?????";
  }

  // ---------------------------
  // Styles (SELF-CONTAINED — ensures bg actually shows)
  // ---------------------------
  function ensureStyles(){
    if (document.getElementById("faction-hq-ui-css")) return;

    const st = document.createElement("style");
    st.id = "faction-hq-ui-css";
    st.textContent = `
      /* Backdrop wrapper */
      #factionHQBack{
        position:fixed; inset:0;
        z-index:999990; /* below missionsBack=999999 */
        display:none;
        pointer-events:auto;
      }
      #factionHQBack.is-open{ display:block !important; }

      /* Background image layer */
      #factionHQBack .hq-bg{
        position:absolute; inset:0;
        z-index:0;
        background: #07080c;
        background-image: var(--hq-bg-url);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        transform: translateZ(0);
      }
      /* readability overlay */
      #factionHQBack .hq-bg::after{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        background:
          radial-gradient(120% 70% at 50% 30%, rgba(0,0,0,.18), rgba(0,0,0,.78)),
          linear-gradient(to bottom, rgba(0,0,0,.20), rgba(0,0,0,.85));
      }

      /* Modal container */
      #factionHQModal{
        position:absolute; inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:12px;
        z-index:1;
      }

      /* HQ card */
      #factionHQRoot{
        width:min(560px, 100%);
        max-height: calc(100vh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        overflow:auto;
        -webkit-overflow-scrolling: touch;

        background:rgba(12,12,18,0.92);
        border:1px solid rgba(255,255,255,0.12);
        border-radius:20px;
        padding:22px 18px;
        color:rgba(255,255,255,0.92);
        box-shadow: 0 18px 60px rgba(0,0,0,.65);
      }

      .hq-card{
        background:rgba(255,255,255,0.06);
        border:1px solid rgba(255,255,255,0.14);
        border-radius:16px; padding:16px; margin:12px 0;
      }
      .hq-row{ display:flex; gap:10px; align-items:center; justify-content:space-between; }
      .hq-btn{
        width:100%; padding:14px; border-radius:12px;
        font-weight:800; font-size:15px; border:0;
        background:rgba(255,255,255,0.12); color:#fff;
      }
      .hq-btn[disabled]{ opacity:.45; filter:saturate(.6); }
      .hq-btn.primary{ background:#2b8cff; }
      .hq-mini{ opacity:.85; font-size:13px; }
      .hq-input{
        width:100%; padding:12px 12px; border-radius:12px;
        border:1px solid rgba(255,255,255,0.16);
        background:rgba(0,0,0,0.25); color:#fff;
        outline:none; font-weight:700;
      }
      .hq-feed{ display:flex; flex-direction:column; gap:8px; margin-top:10px; }
      .hq-feed-item{
        padding:10px 12px; border-radius:12px;
        background:rgba(255,255,255,0.06);
        border:1px solid rgba(255,255,255,0.10);
        font-size:13px; opacity:.95;
      }
      .hq-pill{
        display:inline-flex; padding:4px 10px; border-radius:999px;
        background:rgba(255,255,255,0.10); font-size:12px; font-weight:900;
        letter-spacing:.4px;
      }

      body.hq-open{ overflow:hidden !important; touch-action:none; }
    `;
    document.head.appendChild(st);
  }

  // ---------------------------
  // DOM
  // ---------------------------
  function ensureModal(){
    ensureStyles();

    _back  = document.getElementById("factionHQBack");
    _modal = document.getElementById("factionHQModal");

    // fallback injection if HTML not present
    if (!_back){
      _back = document.createElement("div");
      _back.id = "factionHQBack";
      _back.style.display = "none";
      _back.innerHTML = `<div class="hq-bg"></div><div id="factionHQModal"></div>`;
      document.body.appendChild(_back);
      _modal = document.getElementById("factionHQModal");
    } else {
      if (!_back.querySelector(".hq-bg")){
        const bg = document.createElement("div");
        bg.className = "hq-bg";
        _back.insertBefore(bg, _back.firstChild);
      }
      if (!_modal){
        const m = document.createElement("div");
        m.id = "factionHQModal";
        _back.appendChild(m);
        _modal = m;
      }
    }

    _root = document.getElementById("factionHQRoot");
    if (!_root){
      _root = document.createElement("div");
      _root.id = "factionHQRoot";
      _modal.appendChild(_root);
    }

    if (!_back.__hq_click){
      _back.__hq_click = true;
      _back.addEventListener("click", (e) => {
        if (e.target === _back) return close();
        if (e.target && e.target.classList && e.target.classList.contains("hq-bg")) return close();
      });
    }
  }

  function fmtTs(t){
    try{ return new Date((t||0)*1000).toLocaleString(); }catch(_){ return ""; }
  }

  function niceFactionName(key){
    const m = {
      rogue_byte: "Rogue Byte",
      echo_wardens: "Echo Wardens",
      pack_burners: "Pack Burners",
      inner_howl: "Iron Howlers",
      iron_howlers: "Iron Howlers",
    };
    return m[key] || key || "—";
  }

  function _rid(prefix="hq"){
    try{
      const uid = _uid() || "0";
      const r = (crypto?.randomUUID ? crypto.randomUUID() : (String(Date.now()) + Math.random().toString(16).slice(2)));
      return `${prefix}:${uid}:${r}`;
    }catch(_){
      return `${prefix}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    }
  }

  // ---------------------------
  // open/close
  // ---------------------------
  async function open(){
    ensureModal();

    const faction =
      window.PROFILE?.faction ||
      window.PLAYER_STATE?.profile?.faction ||
      (()=>{ try{ return localStorage.getItem("ah_faction") || ""; }catch(_){ return ""; }})();

    applyHqBg(faction);

    _back.classList.add("is-open");
    document.body.classList.add("hq-open");

    await render();
  }

  function close(){
    if (_back) _back.classList.remove("is-open");
    document.body.classList.remove("hq-open");
  }

  // ---------------------------
  // Render
  // ---------------------------
  async function render(){
    if (!_apiPost){
      _root.innerHTML = `<div class="hq-card">API not ready.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>`;
      return;
    }

    _root.innerHTML = `<div class="hq-card">Loading HQ…</div>`;

    let res;
    try{
      res = await _apiPost("/webapp/faction/hq/state", {});
      log("state:", res);
    }catch(e){
      _root.innerHTML = `<div class="hq-card">HQ load failed.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>`;
      return;
    }

    if (!res || !res.ok){
      const reason = (res && res.reason) || "NO_FACTION";
      if (reason === "NO_FACTION"){
        _root.innerHTML = `
          <div style="text-align:center; margin-bottom:10px;">
            <h2 style="margin:0 0 6px;">Faction HQ</h2>
            <div class="hq-mini">Join a faction to access HQ.</div>
          </div>
          <button class="hq-btn primary" onclick="window.Factions?.open?.()">Choose Faction</button>
          <div style="height:10px"></div>
          <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
        `;
        return;
      }
      _root.innerHTML = `
        <div class="hq-card">HQ error: <b>${String(reason)}</b></div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    const d = res.data || {};
    const fk = d.faction || "";

    // ✅ authoritative bg + cache
    applyHqBg(fk);
    try{
      if (fk) localStorage.setItem("ah_faction", String(fk).toLowerCase());
      window.Influence?.setFaction?.(String(fk).toLowerCase());
      window.renderFactionBadge?.();
    }catch(_){}

    const tre = d.treasury || {};
    const bones = tre.bones || 0;
    const scrap = tre.scrap || 0;
    const feed = Array.isArray(d.feed) ? d.feed : [];

    const curLevel = parseInt(d.level || 1, 10) || 1;
    const nextLevel = curLevel + 1;
    const nextCost = d.nextUpgradeCost || {};
    const needBones = parseInt(nextCost.bones || 0, 10) || 0;
    const needScrap = parseInt(nextCost.scrap || 0, 10) || 0;
    const canUpgrade = (bones >= needBones) && (scrap >= needScrap);

    const dbgLine = _dbg ? `<div class="hq-mini" style="margin-top:6px; opacity:.75;">
      uid …${_uidTail()} • fk <b>${String(fk||"")}</b>
    </div>` : "";

    _root.innerHTML = `
      <div style="text-align:center; margin-bottom:10px;">
        <div class="hq-pill">HQ</div>
        <h2 style="margin:8px 0 6px;">${niceFactionName(fk)}</h2>
        <div class="hq-mini">Level ${d.level || 1} • Members ${d.membersCount ?? "—"}</div>
        ${dbgLine}
      </div>

      <div class="hq-card">
        <div class="hq-row">
          <div><b>Treasury</b></div>
          <div class="hq-mini">shared vault</div>
        </div>
        <div style="height:10px"></div>
        <div class="hq-row">
          <div>🦴 Bones</div><div><b>${bones}</b></div>
        </div>
        <div class="hq-row" style="margin-top:6px;">
          <div>🔩 Scrap</div><div><b>${scrap}</b></div>
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-row">
          <div><b>Upgrade HQ</b></div>
          <div class="hq-mini">community build</div>
        </div>

        <div class="hq-mini" style="margin-top:8px;">
          Next level: <b>${nextLevel}</b><br/>
          Cost: <b>${needBones}</b> 🦴 + <b>${needScrap}</b> 🔩<br/>
          <span class="hq-mini" style="opacity:.85;">
            Bonus: +5% influence multiplier per level (and daily scrap bonus grows).
          </span>
        </div>

        <div style="margin-top:10px;">
          <button class="hq-btn primary" onclick="FactionHQ._upgrade()" ${canUpgrade ? "" : "disabled"}>
            Upgrade to Level ${nextLevel}
          </button>
          ${canUpgrade ? "" : `<div class="hq-mini" style="margin-top:8px; opacity:.8;">
            Not enough in treasury yet — donate to push it over the line.
          </div>`}
        </div>
      </div>

      <div class="hq-card">
        <b>Donate</b>
        <div class="hq-mini" style="margin-top:6px;">Fuel upgrades later. For now: it’s the signal.</div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="hq-btn" onclick="FactionHQ._donate('bones', 25)">Donate 25 🦴</button>
          <button class="hq-btn" onclick="FactionHQ._donate('bones', 100)">Donate 100 🦴</button>
        </div>

        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="hq-btn" onclick="FactionHQ._donate('scrap', 10)">Donate 10 🔩</button>
          <button class="hq-btn" onclick="FactionHQ._donate('scrap', 50)">Donate 50 🔩</button>
        </div>

        <div style="margin-top:10px;">
          <input id="hqCustomAmt" class="hq-input" inputmode="numeric" placeholder="Custom amount (numbers only)" />
          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="hq-btn" onclick="FactionHQ._donateCustom('bones')">Custom 🦴</button>
            <button class="hq-btn" onclick="FactionHQ._donateCustom('scrap')">Custom 🔩</button>
          </div>
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-row">
          <b>Recent activity</b>
          <button class="hq-btn" style="width:auto; padding:10px 12px;" onclick="FactionHQ.open()">Refresh</button>
        </div>

        <div class="hq-feed">
          ${feed.length ? feed.map((x)=>{
            const who = (x.uid ? String(x.uid).slice(-4) : "????");
            const t = fmtTs(x.t);

            if (x.type === "upgrade") {
              const lvl = x.level || "?";
              return `<div class="hq-feed-item">
                <b>⬆️ HQ upgraded</b> <span class="hq-mini">(Lv ${lvl})</span><br/>
                <span class="hq-mini">by …${who} • ${t}</span>
              </div>`;
            }

            const amt = x.amount || 0;
            const asset = x.asset || "";
            const icon = asset === "bones" ? "🦴" : (asset === "scrap" ? "🔩" : "•");
            return `<div class="hq-feed-item">
              <b>${icon} ${amt}</b> to treasury <span class="hq-mini">(${asset})</span><br/>
              <span class="hq-mini">from …${who} • ${t}</span>
            </div>`;
          }).join("") : `<div class="hq-feed-item hq-mini">No activity yet.</div>`}
        </div>
      </div>

      <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
    `;
  }

  // ---------------------------
  // Actions
  // ---------------------------
  async function _donate(asset, amount){
    if (!_apiPost) return;
    const run_id = _rid("hq:donate");

    try{
      const r = await _apiPost("/webapp/faction/hq/donate", { asset, amount, run_id });
      if (r && r.ok){
        try{ _tg?.HapticFeedback?.impactOccurred?.("light"); }catch(_){}
        await render();
        return;
      }
      alert((r && r.reason) ? `Donate failed: ${r.reason}` : "Donate failed.");
    }catch(e){
      alert("Donate failed.");
    }
  }

  async function _donateCustom(asset){
    const el = document.getElementById("hqCustomAmt");
    const n = parseInt((el && el.value) || "0", 10) || 0;
    if (n <= 0) return alert("Enter amount.");
    return _donate(asset, n);
  }

  async function _upgrade(){
    if (!_apiPost) return;
    const run_id = _rid("hq:upgrade");

    try{
      const r = await _apiPost("/webapp/faction/hq/upgrade", { run_id });

      if (r && r.ok){
        try{ _tg?.HapticFeedback?.notificationOccurred?.("success"); }catch(_){}
        await render();
        return;
      }

      if (r && r.reason === "INSUFFICIENT") {
        const c = r.cost || {};
        alert(`Not enough in treasury.\nNeed: ${c.bones||0} bones + ${c.scrap||0} scrap`);
        return;
      }

      alert((r && r.reason) ? `Upgrade failed: ${r.reason}` : "Upgrade failed.");
    }catch(e){
      alert("Upgrade failed.");
    }
  }

  function init({ apiPost, tg, dbg } = {}){
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    log("init ok");

    _prefetchBgs();
  }

  window.FactionHQ = { init, open, close, _donate, _donateCustom, _upgrade, applyHqBg };
})();
