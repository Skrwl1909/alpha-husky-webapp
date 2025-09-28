// js/fortress.js
// === Twoje oryginalne helpery + fallback api ===
const API_BASE = 'https://api.alphahusky.win'; // twój VPS (CORS masz już whitelistowany)

async function apiPost(path, payload) {
  const init_data = (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) || '';
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, init_data })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error('API error');
    err.response = { status: res.status, data };
    throw err;
  }
  return data;
}

// UŻYJ: onclick="startBuilding('moonlab_fortress')"
async function startBuilding(buildingId, route) {
  try {
    const data = await apiPost('/webapp/building/start', { buildingId, route });

    // Tryb fortecy — pokaż walkę
    if (data && data.ok && data.mode === 'fortress') {
      renderFortressBattle(data);
      return;
    }

    // Zwykły budynek (timer)
    alert(`Run started: ${data.minutes} min`);
  } catch (e) {
    const reason = e?.response?.data?.reason;
    if (reason === 'COOLDOWN') {
      const left = e.response?.data?.cooldownLeftSec ?? 3600;
      toast(`⏳ Cooldown: ${fmtLeft(left)}`);
      return;
    }
    if (reason === 'LOCKED_REGION') return toast('🔒 Region locked');
    if (reason === 'UNKNOWN_BUILDING') return toast('Unknown building');
    if (reason === 'FORTRESS_MODE' || reason === 'UNSUPPORTED_FOR_FORTRESS') {
      // Gdyby front trafił w starą ścieżkę — odśwież modal stanu
      const st = await apiPost('/webapp/building/state', { buildingId });
      toast(st.cooldownLeftSec > 0 ? `Cooldown: ${fmtLeft(st.cooldownLeftSec)}` : 'Ready');
      return;
    }
    console.error(e); toast('Something went wrong.');
  }
}

function fmtLeft(sec){const m=Math.floor(sec/60),s=sec%60;if(m>=60){const h=Math.floor(m/60),mm=m%60;return `${h}h ${mm}m`;}if(m>0)return `${m}m ${s}s`;return `${s}s`;}
function hpbar(cur,max){const W=18;cur=Math.max(0,cur|0);max=Math.max(1,max|0);const fill=Math.round(W*(cur/max));return '█'.repeat(fill)+'░'.repeat(W-fill);}
function toast(msg){try{Telegram.WebApp.showPopup({title:'Info',message:String(msg)})}catch(_){alert(msg)}}

function openModal(title, bodyEl){
  closeModal();
  const wrap=document.createElement('div');
  wrap.id='fb-modal';
  wrap.innerHTML=`
    <div class="fb-mask"></div>
    <div class="fb-card">
      <div class="fb-head">
        <div class="fb-head-title">${title||''}</div>
        <button class="fb-x" onclick="closeModal()">×</button>
      </div>
      <div class="fb-body"></div>
    </div>`;
  wrap.querySelector('.fb-body').appendChild(bodyEl);
  document.body.appendChild(wrap);
}
function closeModal(){const m=document.getElementById('fb-modal'); if(m) m.remove();}

// Prosty renderer walki Moon Lab
function renderFortressBattle(data){
  const { level, boss, player, steps, winner, rewards, next } = data;
  const cont=document.createElement('div');
  cont.className='fortress-battle';
  cont.innerHTML=`
    <div class="fb-header">
      ${boss.sprite ? `<img class="fb-boss" src="${boss.sprite}" alt="${boss.name}">` : ''}
      <div class="fb-titles">
        <div class="fb-sub">Moon Lab — Fortress</div>
        <div class="fb-title">L${level} · ${boss.name}</div>
      </div>
    </div>
    <pre class="fb-board">
YOU  [${hpbar(player.hpMax, player.hpMax)}] ${player.hpMax}/${player.hpMax}
BOSS [${hpbar(boss.hpMax, boss.hpMax)}] ${boss.hpMax}/${boss.hpMax}
    </pre>
    <div class="fb-log"></div>
    <div class="fb-footer">
      <button class="btn" id="fb-close">Close</button>
      <button class="btn" id="fb-refresh">Refresh</button>
    </div>`;
  openModal('Battle', cont);

  const logEl=cont.querySelector('.fb-log'), boardEl=cont.querySelector('.fb-board');
  let pHp=player.hpMax, bHp=boss.hpMax, i=0;
  function tick(){
    if(i>=steps.length){
      const lines=[];
      lines.push(winner==='you'?'✅ Victory!':'❌ Defeat!');
      if(rewards?.materials){
        const {scrap=0,rune_dust=0}=rewards.materials;
        const mats=[]; if(scrap)mats.push(`Scrap ×${scrap}`); if(rune_dust)mats.push(`Rune Dust ×${rune_dust}`);
        if(mats.length) lines.push('Rewards: '+mats.join(', '));
      }
      if(rewards?.rare) lines.push('💎 Rare drop!');
      if(rewards?.firstClear?.length) lines.push('🌟 First clear: '+rewards.firstClear.join(', '));
      if(next) lines.push(`Next: L${next.level} · Cooldown 1h`);
      logEl.insertAdjacentHTML('beforeend', `<div class="fb-result">${lines.join('<br>')}</div>`);
      return;
    }
    const s=steps[i++];
    if(s.actor==='you'){
      bHp=s.b_hp;
      logEl.insertAdjacentHTML('beforeend', `<div>▶ You ${s.dodge?'shoot… boss <b>DODGED</b>!':`hit for <b>${s.dmg}</b>${s.crit?' <i>(CRIT)</i>':''}.`}</div>`);
    }else{
      pHp=s.p_hp;
      logEl.insertAdjacentHTML('beforeend', `<div>◀ Boss ${s.dodge?'attacks… you <b>DODGE</b>!':`hits for <b>${s.dmg}</b>${s.crit?' <i>(CRIT)</i>':''}.`}</div>`);
    }
    boardEl.textContent =
`YOU  [${hpbar(pHp, player.hpMax)}] ${pHp}/${player.hpMax}
BOSS [${hpbar(bHp, boss.hpMax)}] ${bHp}/${boss.hpMax}`;
    logEl.scrollTop=logEl.scrollHeight;
    setTimeout(tick, 500);
  }
  setTimeout(tick, 350);

  cont.querySelector('#fb-close').onclick=closeModal;
  cont.querySelector('#fb-refresh').onclick=async ()=>{
    try{
      const st=await apiPost('/webapp/building/state',{buildingId:'moonlab_fortress'});
      closeModal();
      toast(st.cooldownLeftSec>0?`Cooldown: ${fmtLeft(st.cooldownLeftSec)}`:'Ready');
    }catch(e){ toast('Error refreshing.'); }
  };
}

// minimalny CSS wstrzyknięty automatycznie, jeśli nie dodałeś do pliku .css
(function injectCss(){
  if(document.getElementById('fb-css')) return;
  const css=`
#fb-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
#fb-modal .fb-mask{position:absolute;inset:0;background:rgba(0,0,0,.5)}
#fb-modal .fb-card{position:relative;width:min(92vw,520px);max-height:86vh;background:rgba(20,22,30,.96);border-radius:16px;padding:12px;color:#fff;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.4)}
.fb-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.fb-head-title{font-weight:700;opacity:.9}
.fb-x{background:transparent;border:none;color:#fff;font-size:22px;padding:4px 8px;cursor:pointer}
.fb-body{display:flex;flex-direction:column;gap:12px}
.fortress-battle{display:flex;flex-direction:column;gap:12px}
.fb-header{display:flex;gap:12px;align-items:center}
.fb-boss{width:64px;height:64px;object-fit:contain;border-radius:10px;background:rgba(255,255,255,.06)}
.fb-sub{opacity:.8;font-size:.9rem}
.fb-title{font-weight:700;font-size:1.05rem}
.fb-board{background:rgba(255,255,255,.06);padding:8px;border-radius:10px;font-family:ui-monospace, SFMono-Regular, Menlo, monospace}
.fb-log{max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:4px}
.fb-result{margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.12)}
.btn{padding:10px 12px;border-radius:12px;background:#2a2f45;border:none;color:#fff}

/* === NOWE: karta stanu fortress === */
.fx-headline{font-weight:700;margin-bottom:2px}
.fx-sub{opacity:.8}
.fx-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.fx-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-size:12px}
.fx-progress{display:grid;gap:8px}
.fx-bar{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}
.fx-bar>i{display:block;height:100%;width:0%;background:linear-gradient(90deg,rgba(0,229,255,.65),rgba(155,77,255,.65))}
.fx-muted{opacity:.8}
.fx-select{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff}
  `;
  const s=document.createElement('style'); s.id='fb-css'; s.textContent=css; document.head.appendChild(s);
})();

/* =========================
   NOWE: moduł window.Fortress
   ========================= */
(function(global){
  const BUILDING_ID = 'moonlab_fortress';
  let _apiPostRef = null;
  let _tg = null;
  let _dbg = ()=>{};

  function init({ apiPost: injectedApiPost, tg, dbg } = {}){
    _apiPostRef = injectedApiPost || global.apiPost; // fallback do lokalnego apiPost z tego pliku
    _tg = tg || (global.Telegram && global.Telegram.WebApp) || null;
    _dbg = dbg || (global.dbg || (()=>{}));
  }

  function getApiPost(){
    return _apiPostRef || global.apiPost;
  }

  /** Publiczne: otwórz lekką kartę Moon Lab */
  async function open(){
    const api = getApiPost();
    if (!api) { alert('Fortress not initialized'); return; }

    const ui = buildStateUI();
    openModal('Moon Lab — Fortress', ui.wrap);
    await refreshState(ui);
  }

  /** Publiczne: ręczne wystartowanie (opcjonalny route) */
  async function start(route){
    const api = getApiPost();
    try{
      const data = await api('/webapp/building/start', { buildingId: BUILDING_ID, route });
      if (data && data.ok && data.mode === 'fortress') {
        renderFortressBattle(data);
        return true;
      }
      alert(`Run started: ${data.minutes} min`);
      return true;
    }catch(e){
      const reason = e?.data?.reason || e?.response?.data?.reason || e?.message;
      if (/COOLDOWN/i.test(reason||'')){
        const left = e?.data?.cooldownLeftSec ?? e?.response?.data?.cooldownLeftSec ?? 3600;
        toast(`⏳ Cooldown: ${fmtLeft(left)}`);
        return false;
      }
      if (/LOCKED_REGION/i.test(reason||'')) return toast('🔒 Region locked'), false;
      if (/UNKNOWN_BUILDING/i.test(reason||'')) return toast('Unknown building'), false;
      if (/FORTRESS_MODE|UNSUPPORTED_FOR_FORTRESS/i.test(reason||'')){
        try {
          const st = await api('/webapp/building/state', { buildingId: BUILDING_ID });
          toast(st.cooldownLeftSec > 0 ? `Cooldown: ${fmtLeft(st.cooldownLeftSec)}` : 'Ready');
        } catch(_) {}
        return false;
      }
      console.error(e); toast('Something went wrong.');
      return false;
    }
  }

  /** UI: karta stanu + progres */
  function buildStateUI(){
    const wrap = document.createElement('div');
    wrap.className = 'fortress-state';
    wrap.innerHTML = `
      <div class="fx-headline">Moon Lab — Fortress</div>
      <div class="fx-row">
        <span class="fx-pill"><b>Status:</b> <span id="fx-status">—</span></span>
        <span class="fx-pill" id="fx-cool-wrap" style="display:none"><b>Cooldown:</b> <span id="fx-timer">0s</span></span>
      </div>

      <div class="fx-progress" id="fx-progress" style="display:none">
        <div class="fx-row fx-muted">
          <span id="fx-levelLbl">L—</span> •
          <span id="fx-encLbl">Encounter —/—</span>
        </div>
        <div class="fx-bar"><i id="fx-fill"></i></div>
      </div>

      <div id="fx-routes" style="display:none">
        <label class="fx-muted" for="fx-route" style="font-size:12px">Route</label>
        <select id="fx-route" class="fx-select"></select>
      </div>

      <div class="fb-footer" style="display:flex; gap:8px; margin-top:8px">
        <button class="btn" id="fx-close" type="button">Close</button>
        <button class="btn" id="fx-refresh" type="button">Refresh</button>
        <button class="btn primary" id="fx-start" type="button">Start</button>
      </div>
    `;

    const ui = {
      wrap,
      status: wrap.querySelector('#fx-status'),
      coolWrap: wrap.querySelector('#fx-cool-wrap'),
      timer: wrap.querySelector('#fx-timer'),
      progWrap: wrap.querySelector('#fx-progress'),
      levelLbl: wrap.querySelector('#fx-levelLbl'),
      encLbl: wrap.querySelector('#fx-encLbl'),
      fill: wrap.querySelector('#fx-fill'),
      routesWrap: wrap.querySelector('#fx-routes'),
      routeSel: wrap.querySelector('#fx-route'),
      btnClose: wrap.querySelector('#fx-close'),
      btnRefresh: wrap.querySelector('#fx-refresh'),
      btnStart: wrap.querySelector('#fx-start'),
    };

    ui.btnClose.onclick = closeModal;
    ui.btnRefresh.onclick = () => refreshState(ui);
    ui.btnStart.onclick = () => start(ui.routeSel?.value || '');

    return ui;
  }

  /** Pobierz stan i odśwież UI (z progressem) */
  async function refreshState(ui){
    const api = getApiPost();
    try{
      const st = await api('/webapp/building/state', { buildingId: BUILDING_ID });

      // Status + cooldown
      const cd = Math.max(0, st?.cooldownLeftSec | 0);
      if (cd > 0){
        ui.status.textContent = 'Cooldown';
        ui.coolWrap.style.display = 'inline-flex';
        ui.timer.textContent = fmtLeft(cd);
        ui.btnStart.disabled = true;
      } else {
        ui.status.textContent = 'Ready';
        ui.coolWrap.style.display = 'none';
        ui.btnStart.disabled = false;
      }

      // Routes (jeśli backend zwraca)
      ui.routesWrap.style.display = (st?.routes && st.routes.length) ? 'block' : 'none';
      ui.routeSel.innerHTML = '';
      if (st?.routes && st.routes.length){
        st.routes.forEach(r => {
          const opt = document.createElement('option');
          opt.value = r.id; opt.textContent = r.label || r.id;
          ui.routeSel.appendChild(opt);
        });
      }

      // Progres (próbuje kilka konwencji pól – działa „best effort”)
      const lvl = st?.level ?? st?.progress?.level ?? st?.currentLevel ?? null;

      const floor = st?.floor ?? st?.currentFloor ?? st?.progress?.floor ?? null;
      // encounter może być numerem lub indeksem — spróbuje kilku nazw
      const encRaw = st?.encounter ?? st?.currentEncounter ?? st?.progress?.encounter ?? st?.encounterIndex ?? st?.encounterNo ?? null;

      const floorTotal = st?.floorEncounters ?? st?.totalEncounters ?? st?.progress?.totalEncounters ?? 10;

      const enc = encRaw ? Number(encRaw) : null;
      const pct =
        (typeof enc === 'number' && typeof floorTotal === 'number' && floorTotal > 0)
          ? Math.max(0, Math.min(100, Math.round((enc / floorTotal) * 100)))
          : (typeof st?.progressPercent === 'number' ? Math.max(0, Math.min(100, Math.round(st.progressPercent))) : null);

      // Render labeli
      if (lvl != null || floor != null || enc != null){
        ui.progWrap.style.display = 'grid';
        ui.levelLbl.textContent = (lvl != null) ? `L${lvl}` : (floor != null ? `Floor ${floor}` : 'Progress');
        if (enc != null && floorTotal != null) {
          const num = Math.max(1, Math.min(enc, floorTotal));
          ui.encLbl.textContent = `Encounter ${num}/${floorTotal}`;
        } else {
          ui.encLbl.textContent = 'Encounter —/—';
        }
        // Pasek
        ui.fill.style.width = (pct != null ? pct : 0) + '%';
      } else {
        ui.progWrap.style.display = 'none';
      }

    }catch(e){
      console.error(e);
      ui.status.textContent = '—';
      ui.coolWrap.style.display = 'none';
      ui.btnStart.disabled = true;
      toast('Failed to load state.');
    }
  }

  // Eksport modułu
  global.Fortress = { init, open, start, renderFortressBattle };
})(window);
