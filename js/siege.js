// js/siege.js
(function () {
  const Siege = {};
  let _apiPost = null, _tg = null, _dbg = false;

  function qs(id){ return document.getElementById(id); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
  function rid(prefix){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

  function ensureModal(){
    if (qs("siegeBack")) return;

    const wrap = document.createElement("div");
    wrap.id = "siegeBack";
    wrap.style.cssText = `
      position:fixed; inset:0; display:none; z-index:2147483647;
      background:rgba(0,0,0,.66);
      align-items:center; justify-content:center;
      padding: calc(env(safe-area-inset-top,0px) + 12px) 10px calc(env(safe-area-inset-bottom,0px) + 16px);
      box-sizing:border-box;
    `;

    wrap.innerHTML = `
      <div id="siegeModal" style="
        width:min(92vw,460px);
        max-height:min(86vh,760px);
        overflow:hidden;
        display:flex; flex-direction:column;
        background:rgba(15,16,22,.98);
        border:1px solid rgba(255,255,255,.10);
        border-radius:18px;
        box-shadow:0 20px 60px rgba(0,0,0,.45);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 14px 10px;border-bottom:1px solid rgba(255,255,255,.08)">
          <div>
            <div style="font-weight:800;font-size:17px">Edge of the Chain</div>
            <div id="siegeSub" style="opacity:.72;font-size:12px">Siege control node</div>
          </div>
          <button id="closeSiege" style="
            border:0; border-radius:10px; padding:8px 10px; cursor:pointer;
            background:rgba(255,255,255,.08); color:#fff;
          ">✕</button>
        </div>

        <div id="siegeRoot" style="padding:12px; overflow:auto; -webkit-overflow-scrolling:touch;"></div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;padding:12px;border-top:1px solid rgba(255,255,255,.08)">
          <button id="siegeRefresh" class="siege-btn">Refresh</button>
          <button id="siegeWatch" class="siege-btn">Take Watch</button>
          <button id="siegeUnwatch" class="siege-btn">Leave Watch</button>
          <button id="siegeStart" class="siege-btn">Start Siege</button>
          <button id="siegeJoin" class="siege-btn">Join Siege</button>
          <button id="siegeLaunch" class="siege-btn">Launch</button>
          <button id="siegeNext" class="siege-btn">Next Fight</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    const style = document.createElement("style");
    style.textContent = `
      .siege-btn{
        border:0; border-radius:12px; padding:10px 12px; cursor:pointer;
        background:rgba(255,255,255,.08); color:#fff; font-weight:700;
      }
      .siege-btn:hover{ background:rgba(255,255,255,.14); }
      .siege-card{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);
        border-radius:14px;
        padding:10px 12px;
        margin-bottom:10px;
      }
      .siege-kv{ display:flex; justify-content:space-between; gap:10px; margin:4px 0; }
      .siege-list{ margin:6px 0 0; padding-left:18px; opacity:.92; }
      .siege-muted{ opacity:.68; font-size:12px; }
      .siege-row{ display:flex; flex-wrap:wrap; gap:8px; }
      .siege-pill{
        padding:6px 8px; border-radius:999px; font-size:12px;
        background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.08);
      }
    `;
    document.head.appendChild(style);

    qs("closeSiege").onclick = close;
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });

    qs("siegeRefresh").onclick = () => loadState();
    qs("siegeWatch").onclick = () => act("/webapp/siege/watch", "watch");
    qs("siegeUnwatch").onclick = () => act("/webapp/siege/unwatch", "unwatch");
    qs("siegeStart").onclick = () => act("/webapp/siege/start", "start");
    qs("siegeJoin").onclick = () => act("/webapp/siege/join", "join");
    qs("siegeLaunch").onclick = () => act("/webapp/siege/launch", "launch");
    qs("siegeNext").onclick = () => act("/webapp/siege/next", "next");
  }

  function open(){
    ensureModal();
    qs("siegeBack").style.display = "flex";
    loadState();
  }

  function close(){
    const el = qs("siegeBack");
    if (el) el.style.display = "none";
  }

  function normalize(out){
    if (!out) return null;
    return out.data || out.state || out;
  }

  function factionLabel(f){
    const m = {
      rogue_byte: "Rogue Byte",
      echo_wardens: "Echo Wardens",
      pack_burners: "Pack Burners",
      inner_howl: "Inner Howl"
    };
    return m[String(f||"").toLowerCase()] || (f || "—");
  }

  function render(out){
    const d = normalize(out) || {};
    const root = qs("siegeRoot");
    if (!root) return;

    const defenders = Array.isArray(d.siegeDefenders) ? d.siegeDefenders : [];
    const cur = d.currentSiege || null;
    const attackers = Array.isArray(cur?.attackers) ? cur.attackers : [];
    const curDefs = Array.isArray(cur?.defenders) ? cur.defenders : [];
    const fights = Array.isArray(cur?.fightHistory) ? cur.fightHistory : [];
    const owner = d.ownerFaction || "";
    const cd = Number(d.siegeCooldownUntil || 0);
    const now = Math.floor(Date.now()/1000);
    const left = Math.max(0, cd - now);

    qs("siegeSub").textContent =
      cur ? `Status: ${cur.status || "—"}` : `Owner: ${factionLabel(owner)}`;

    root.innerHTML = `
      <div class="siege-card">
        <div class="siege-kv"><strong>Owner</strong><span>${esc(factionLabel(owner))}</span></div>
        <div class="siege-kv"><strong>Watch</strong><span>${defenders.length} / 4</span></div>
        <div class="siege-kv"><strong>Cooldown</strong><span>${left > 0 ? `${left}s` : "Ready"}</span></div>
        <div class="siege-muted">Control this node to hold the line. Break it to take the chain.</div>
      </div>

      <div class="siege-card">
        <div style="font-weight:800;margin-bottom:6px">Watch Defenders</div>
        ${
          defenders.length
            ? `<ul class="siege-list">${defenders.map(x => `<li>${esc(x.name || x.uid || "Unknown")}</li>`).join("")}</ul>`
            : `<div class="siege-muted">No defenders assigned.</div>`
        }
      </div>

      <div class="siege-card">
        <div style="font-weight:800;margin-bottom:6px">Active Siege</div>
        ${
          cur ? `
            <div class="siege-kv"><strong>Status</strong><span>${esc(cur.status || "—")}</span></div>
            <div class="siege-kv"><strong>Attacker Faction</strong><span>${esc(factionLabel(cur.attackerFaction))}</span></div>
            <div class="siege-kv"><strong>Defender Faction</strong><span>${esc(factionLabel(cur.defenderFaction))}</span></div>
            <div class="siege-kv"><strong>Fight No.</strong><span>${Number(cur.currentFight || 0)}</span></div>

            <div style="margin-top:10px;font-weight:700">Attackers</div>
            ${
              attackers.length
                ? `<div class="siege-row">${attackers.map(x => `<span class="siege-pill">${esc(x.name || x.uid || "Unknown")}${x.alive === false ? " ✖" : ""}</span>`).join("")}</div>`
                : `<div class="siege-muted">No attackers yet.</div>`
            }

            <div style="margin-top:10px;font-weight:700">Defenders in Siege</div>
            ${
              curDefs.length
                ? `<div class="siege-row">${curDefs.map(x => `<span class="siege-pill">${esc(x.name || x.uid || "Unknown")}${x.alive === false ? " ✖" : ""}</span>`).join("")}</div>`
                : `<div class="siege-muted">Will be populated on launch.</div>`
            }

            <div style="margin-top:10px;font-weight:700">Fight History</div>
            ${
              fights.length
                ? `<ul class="siege-list">${fights.slice(-8).reverse().map(f => `<li>Fight ${Number(f.fightNo||0)} · winner: ${esc(f.winnerUid || "—")}</li>`).join("")}</ul>`
                : `<div class="siege-muted">No fights resolved yet.</div>`
            }
          `
          : `<div class="siege-muted">No active siege.</div>`
        }
      </div>
    `;
  }

  async function loadState(){
    try{
      const out = await _apiPost("/webapp/siege/state", {
        nodeId: "edge_of_chain",
        run_id: rid("siege_state")
      });
      if (_dbg) console.log("[SIEGE][STATE]", out);
      render(out);
    }catch(err){
      const root = qs("siegeRoot");
      if (root) root.innerHTML = `<div class="siege-card">Failed to load siege state.<br><span class="siege-muted">${esc(err?.message || err)}</span></div>`;
    }
  }

  async function act(path, prefix){
    try{
      const out = await _apiPost(path, {
        nodeId: "edge_of_chain",
        run_id: rid(prefix)
      });
      if (_dbg) console.log("[SIEGE][ACT]", path, out);
      render(out);
    }catch(err){
      if (_dbg) console.warn("[SIEGE][ERR]", path, err);
      alert(`Siege action failed: ${err?.message || err}`);
    }
  }

  Siege.init = function({ apiPost, tg, dbg } = {}){
    _apiPost = apiPost || window.S?.apiPost;
    _tg = tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;
    ensureModal();
    return Siege;
  };

  Siege.open = open;
  Siege.close = close;
  Siege.refresh = loadState;

  window.Siege = Siege;
})();
