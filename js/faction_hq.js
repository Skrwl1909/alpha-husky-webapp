// js/faction_hq.js — Faction HQ (Alpha Husky WebApp)
(function(){
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _modal = null;
  let _root = null;

  function log(...a){ if(_dbg) console.log("[FactionHQ]", ...a); }

  function ensureStyles(){
    if (document.getElementById("faction-hq-css")) return;
    const st = document.createElement("style");
    st.id = "faction-hq-css";
    st.textContent = `
      #factionHqModal{
        position:fixed; inset:0; display:none;
        align-items:center; justify-content:center;
        background:rgba(0,0,0,0.92); z-index:99999999;
      }
      #factionHqRoot{
        width:min(560px, 94vw); max-height:90vh; overflow:auto;
        background:rgba(12,12,18,0.98);
        border:1px solid rgba(255,255,255,0.12);
        border-radius:20px; padding:22px 18px; color:#eaeaea;
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
      .hq-btn.primary{ background:#2b8cff; }
      .hq-btn.danger{ background:#f44336; }
      .hq-mini{ opacity:.8; font-size:13px; }
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
      }
    `;
    document.head.appendChild(st);
  }

  function ensureModal(){
    ensureStyles();
    if (_modal) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div id="factionHqModal"><div id="factionHqRoot"></div></div>`;
    document.body.appendChild(wrap.firstElementChild);
    _modal = document.getElementById("factionHqModal");
    _root  = document.getElementById("factionHqRoot");
    _modal.addEventListener("click", (e)=>{ if(e.target === _modal) close(); });
  }

  function fmtTs(t){
    try{
      const d = new Date((t||0)*1000);
      return d.toLocaleString();
    }catch(_){ return ""; }
  }

  function niceFactionName(key){
    const m = {
      rogue_byte: "Rogue Byte",
      echo_wardens: "Echo Wardens",
      pack_burners: "Pack Burners",
      inner_howl: "Inner Howl"
    };
    return m[key] || key || "—";
  }

  async function open(){
    ensureModal();
    _modal.style.display = "flex";
    await render();
  }

  function close(){
    if (_modal) _modal.style.display = "none";
  }

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

    _root.innerHTML = `
      <div style="text-align:center; margin-bottom:10px;">
        <div class="hq-pill">HQ</div>
        <h2 style="margin:8px 0 6px;">${niceFactionName(fk)}</h2>
        <div class="hq-mini">Level ${d.level || 1} • Members ${d.membersCount ?? "—"}</div>
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

  // default donate
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

  async function _donate(asset, amount){
    if (!_apiPost) return;
    const run_id = String(Date.now()) + ":" + Math.random().toString(16).slice(2);
    try{
      const r = await _apiPost("/webapp/faction/hq/donate", { asset, amount, run_id });
      if (r && r.ok){
        if (_tg?.HapticFeedback?.impactOccurred) _tg.HapticFeedback.impactOccurred("light");
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

  const run_id = String(Date.now()) + ":" + Math.random().toString(16).slice(2);

  try{
    const r = await _apiPost("/webapp/faction/hq/upgrade", { run_id });

    if (r && r.ok){
      if (_tg?.HapticFeedback?.notificationOccurred) _tg.HapticFeedback.notificationOccurred("success");
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
  }

  window.FactionHQ = { init, open, close, _donate, _donateCustom, _upgrade };
})();
