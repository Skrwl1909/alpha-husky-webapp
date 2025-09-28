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
`;
  const s=document.createElement('style'); s.id='fb-css'; s.textContent=css; document.head.appendChild(s);
})();
