// js/dojo.js
(function (global) {
  const BID = 'testnet_wastes_dojo';
  const S = { apiPost: null, tg: null, dbg: ()=>{} };
  const $ = (s,r=document)=>r.querySelector(s);
  const el= (t,c)=>{const x=document.createElement(t); if(c) x.className=c; return x;};
  function css(){ if($('#dojo-css')) return; const s=el('style'); s.id='dojo-css'; s.textContent=`
#dojo-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
#dojo-modal .mask{position:absolute;inset:0;background:rgba(0,0,0,.55)}
#dojo-modal .card{position:relative;width:min(92vw,520px);max-height:86vh;background:rgba(12,14,18,.96);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px;color:#fff}
.fx-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.fx-title{font-weight:800}.fx-sub{opacity:.8;font-weight:600}
.fx-kv{display:flex;gap:10px;flex-wrap:wrap}
.fx-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
.fx-btn{padding:10px 12px;border-radius:12px;background:#2a2f45;border:1px solid rgba(255,255,255,.12);color:#fff;cursor:pointer}
.fx-btn[disabled]{opacity:.55;cursor:not-allowed}
.stat{display:grid;grid-template-columns:auto 1fr;gap:6px}
.stat b{opacity:.8}`; document.head.appendChild(s);}
  function close(){ const m=$('#dojo-modal'); if(m) m.remove(); }
  async function api(path,payload){
    if(!S.apiPost){
      const base=global.API_BASE||'', init=global.Telegram?.WebApp?.initData||'';
      S.apiPost=(p,b)=>fetch(base+p,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+init},body:JSON.stringify(b||{})}).then(r=>r.json());
    }
    const out = await S.apiPost(path,payload); return out?.data||out;
  }
  async function state(){ return api('/webapp/building/state',{buildingId:BID}); }
  async function start(){ return api('/webapp/building/start',{buildingId:BID}); }

  function render(res, meta){
    css(); close();
    const w=el('div'); w.id='dojo-modal';
    w.innerHTML=`
      <div class="mask" id="dj-mask"></div>
      <div class="card">
        <div class="fx-head">
          <div><div class="fx-sub">Training</div><div class="fx-title">Testnet Wastes — Dojo</div></div>
          <button class="fx-btn" id="dj-x" type="button">Close</button>
        </div>
        <div class="stat">
          <b>Timer</b><span>${meta?.timerSec||res.seconds||60}s</span>
          <b>DPS</b><span>${res?.dps ?? '—'}</span>
          <b>Total</b><span>${res?.total ?? '—'}</span>
          <b>Hits</b><span>${res?.hits ?? '—'}</span>
          <b>Avg hit</b><span>${res?.avgHit ?? '—'}</span>
          <b>Max hit</b><span>${res?.maxHit ?? '—'}</span>
          <b>Crit rate</b><span>${res?.critRate!=null ? (res.critRate*100).toFixed(1)+'%' : '—'}</span>
        </div>
        <div class="fx-actions">
          <button class="fx-btn" id="dj-run" type="button">Start test</button>
        </div>
      </div>`;
    document.body.appendChild(w);
    w.addEventListener('click', async e=>{
      const t=e.target;
      if(t.id==='dj-x'||t.id==='dj-mask') return close();
      if(t.id==='dj-run'){ t.disabled=true; const out=await start(); render(out,{timerSec:out.seconds}); }
    });
  }
  async function open(){ const st=await state(); render(st.last||{}, {timerSec:st.timerSec}); }
  function init(deps){ S.apiPost=deps?.apiPost||S.apiPost; S.tg=deps?.tg||S.tg||global.Telegram?.WebApp||null; S.dbg=deps?.dbg||S.dbg; }
  global.Dojo = { init, open };
})(window);
