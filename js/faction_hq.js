// js/faction_hq.js — Faction HQ (Alpha Husky WebApp) — PREMIUM WARROOM EDITION
(function(){
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _back = null;   // #factionHQBack
  let _modal = null;  // #factionHQModal
  let _root = null;   // #factionHQRoot

  function log(...a){ if(_dbg) console.log("[FactionHQ]", ...a); }

  // ====================== BACKGROUND MAPPING ======================
  function _normFactionKey(f){
    f = String(f || "").toLowerCase().trim();
    if (!f) return "ew";
    if (["rb","ew","pb","ih"].includes(f)) return f;
    if (f.includes("rogue")) return "rb";
    if (f.includes("echo"))  return "ew";
    if (f.includes("pack") || f.includes("burn")) return "pb";
    if (f.includes("inner") || f.includes("iron") || f.includes("howl")) return "ih";
    return "ew";
  }

  function _hqBgUrlForFaction(faction){
    const k = _normFactionKey(faction);
    const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
    const map = {
      rb: `/hq_warroom_rb.webp${v}`,
      ew: `/hq_warroom_ew.webp${v}`,
      pb: `/hq_warroom_pb.webp${v}`,
      ih: `/hq_warroom_ih.webp${v}`,
    };
    return map[k] || map.ew;
  }

  function applyHqBg(faction){
    const url = _hqBgUrlForFaction(faction);
    const card = document.getElementById("factionHQRoot");
    if (card) {
      card.style.background = `linear-gradient(rgba(8,10,18,0.88), rgba(8,10,18,0.96)), url("${url}") center/cover no-repeat`;
      card.style.backgroundAttachment = "fixed";
    }
  }

  function _prefetchBgs(){
    try{
      const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
      ["rb","ew","pb","ih"].forEach(k => {
        const i = new Image(); i.src = `/hq_warroom_\( {k}.webp \){v}`;
      });
    }catch(_){}
  }

  // ====================== ANIMACJE + STYLES ======================
  function ensureStyles(){
    if (document.getElementById("faction-hq-ui-css")) return;

    const st = document.createElement("style");
    st.id = "faction-hq-ui-css";
    st.textContent = `
      @keyframes holoPulse { 0%,100%{opacity:0.88; transform:scale(1);} 50%{opacity:1; transform:scale(1.035);} }
      @keyframes scanline { 0%{background-position:0 0;} 100%{background-position:0 420px;} }
      @keyframes fogDrift { 0%{background-position:0 0;} 100%{background-position:110px 140px;} }

      #factionHQBack{ position:fixed; inset:0; z-index:999990; display:none; pointer-events:auto; }
      #factionHQBack.is-open{ display:block !important; }

      #factionHQRoot{
        width:min(560px,100%);
        max-height:calc(100vh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        overflow:auto; -webkit-overflow-scrolling:touch;
        background:rgba(12,12,18,0.92);
        border:1px solid rgba(255,255,255,0.12);
        border-radius:20px;
        padding:22px 18px;
        color:#fff;
        box-shadow:0 20px 70px rgba(0,0,0,.75);
        position:relative;
      }

      /* === WARROOM OVERLAY === */
      #factionHQRoot::after{
        content:"";
        position:absolute; inset:0; pointer-events:none; z-index:2;
        background: 
          radial-gradient(circle at 50% 35%, rgba(255,180,60,0.16) 0%, transparent 70%),
          linear-gradient(transparent 50%, rgba(255,255,255,0.035) 50%);
        background-size:200% 200%, 100% 4px;
        animation: holoPulse 8s ease-in-out infinite, scanline 7s linear infinite, fogDrift 42s linear infinite;
        border-radius:20px;
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
      .hq-btn:disabled{ opacity:.45; }
      .hq-mini{ opacity:.85; font-size:13px; }
      .hq-feed-item{
        padding:10px 12px; border-radius:12px;
        background:rgba(255,255,255,0.06);
        border:1px solid rgba(255,255,255,0.10);
        font-size:13px;
      }
      .hq-pill{
        display:inline-flex; padding:4px 10px; border-radius:999px;
        background:rgba(255,255,255,0.10); font-size:12px; font-weight:900;
      }
      body.hq-open{ overflow:hidden !important; touch-action:none; }
    `;
    document.head.appendChild(st);
  }

  // ====================== MODAL ======================
  function ensureModal(){
    ensureStyles();
    _back  = document.getElementById("factionHQBack");
    _modal = document.getElementById("factionHQModal");

    if (!_back){
      _back = document.createElement("div");
      _back.id = "factionHQBack";
      _back.style.display = "none";
      _back.innerHTML = `<div id="factionHQModal"></div>`;
      document.body.appendChild(_back);
      _modal = document.getElementById("factionHQModal");
    }

    _root = document.getElementById("factionHQRoot");
    if (!_root){
      _root = document.createElement("div");
      _root.id = "factionHQRoot";
      _modal.appendChild(_root);
    }

    _back.onclick = e => { if (e.target === _back) close(); };
  }

  // ====================== RENDER (z warroomem) ======================
  async function render(){
    if (!_apiPost) return;
    _root.innerHTML = `<div class="hq-card" style="text-align:center;padding:40px;">Loading Warroom...</div>`;

    let res;
    try{ res = await _apiPost("/webapp/faction/hq/state", {}); }catch(e){}

    if (!res?.ok){
      _root.innerHTML = `<div class="hq-card">No faction yet.<br><button class="hq-btn primary" onclick="window.Factions?.open?.()">Choose Faction</button></div>`;
      return;
    }

    const d = res.data || {};
    const fk = d.faction || "";
    applyHqBg(fk);

    const tre = d.treasury || {};
    const nextCost = d.nextUpgradeCost || {};
    const canUpgrade = (tre.bones || 0) >= (nextCost.bones || 0) && (tre.scrap || 0) >= (nextCost.scrap || 0);

    _root.innerHTML = `
      <div style="text-align:center;margin-bottom:12px;">
        <div class="hq-pill" style="background:rgba(255,140,0,0.2);color:#ffcc00;">WARROOM</div>
        <h2 style="margin:8px 0 4px;font-size:22px;">${niceFactionName(fk)}</h2>
        <div style="font-size:15px;opacity:0.85;">Level ${d.level || 1} • ${d.membersCount || 0} members</div>
      </div>

      <div class="hq-card">
        <div class="hq-row"><b>TREASURY VAULT</b><span class="hq-mini">shared</span></div>
        <div style="margin:12px 0;font-size:22px;font-weight:800;">
          🦴 <b>\( {tre.bones || 0}</b>  🔩 <b> \){tre.scrap || 0}</b>
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-row"><b>UPGRADE HQ</b><span class="hq-mini">community goal</span></div>
        <div style="margin:10px 0 12px;font-size:14px;">
          Next: Level ${d.level + 1 || 2}<br>
          Cost: <b>\( {nextCost.bones || 0}</b> 🦴 + <b> \){nextCost.scrap || 0}</b> 🔩
        </div>
        <button class="hq-btn primary" onclick="FactionHQ._upgrade()" ${canUpgrade ? '' : 'disabled'}>
          ${canUpgrade ? 'UPGRADE TO LEVEL ' + (d.level + 1) : 'NOT ENOUGH RESOURCES'}
        </button>
      </div>

      <div class="hq-card">
        <b>DONATE</b>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
          <button class="hq-btn" onclick="FactionHQ._donate('bones',25)">25 🦴</button>
          <button class="hq-btn" onclick="FactionHQ._donate('bones',100)">100 🦴</button>
          <button class="hq-btn" onclick="FactionHQ._donate('scrap',10)">10 🔩</button>
          <button class="hq-btn" onclick="FactionHQ._donate('scrap',50)">50 🔩</button>
        </div>
      </div>

      <div class="hq-card">
        <b>RECENT ACTIVITY</b>
        <div class="hq-feed" style="margin-top:10px;max-height:220px;overflow:auto;">
          ${Array.isArray(d.feed) && d.feed.length ? d.feed.map(x => {
            const t = fmtTs(x.t);
            if (x.type === "upgrade") return `<div class="hq-feed-item">⬆️ HQ upgraded to Lv${x.level} <span style="opacity:0.6">• ${t}</span></div>`;
            return `<div class="hq-feed-item">💰 ${x.amount} ${x.asset} donated <span style="opacity:0.6">• ${t}</span></div>`;
          }).join("") : `<div class="hq-feed-item" style="opacity:0.6">No activity yet</div>`}
        </div>
      </div>

      <button class="hq-btn" onclick="FactionHQ.close()" style="margin-top:10px;">CLOSE WARROOM</button>
    `;
  }

  // ====================== ACTIONS ======================
  async function _donate(asset, amount){
    const run_id = "hq:donate:" + Date.now();
    try{
      const r = await _apiPost("/webapp/faction/hq/donate", {asset, amount, run_id});
      if (r?.ok){
        toast(`+${amount} ${asset} donated`, "success");
        render();
      } else toast(r?.reason || "Donate failed", "error");
    } catch(e){ toast("Connection error", "error"); }
  }

  async function _upgrade(){
    const run_id = "hq:upgrade:" + Date.now();
    try{
      const r = await _apiPost("/webapp/faction/hq/upgrade", {run_id});
      if (r?.ok){
        toast(`HQ upgraded to Level ${r.newLevel}!`, "success");
        render();
      } else toast(r?.reason || "Upgrade failed", "error");
    } catch(e){ toast("Connection error", "error"); }
  }

  function niceFactionName(key){
    const m = { rogue_byte:"Rogue Byte", echo_wardens:"Echo Wardens", pack_burners:"Pack Burners", inner_howl:"Inner Howl" };
    return m[key] || key || "—";
  }

  function fmtTs(t){
    try { return new Date((t||0)*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); } catch(_){ return ""; }
  }

  function toast(msg, type = "info"){
    let el = document.getElementById("hqToast");
    if (!el){
      el = document.createElement("div");
      el.id = "hqToast";
      el.style.cssText = `position:fixed; left:50%; bottom:20px; transform:translateX(-50%); z-index:99999999; padding:12px 18px; border-radius:14px; font:14px/1.4 system-ui; color:#fff; opacity:0; transition:all .25s;`;
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.background = type === "success" ? "rgba(80,200,120,.95)" : "rgba(30,30,40,.95)";
    el.style.opacity = "1";
    clearTimeout(window.__hqToastT);
    window.__hqToastT = setTimeout(() => el.style.opacity = "0", 2800);
  }

  // ====================== INIT ======================
  function init({ apiPost, tg, dbg } = {}){
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    log("init ok");
    _prefetchBgs();
  }

  window.FactionHQ = { init, open, close, render, _donate, _upgrade, applyHqBg };
})();
