// js/fortress.js
// Alpha Husky — Moon Lab (Fortress) UI
// Użycie: window.Fortress.init({ apiPost, tg, dbg });  →  window.Fortress.open();

(function (global) {
  const BID = 'moonlab_fortress';

  const S = {
    apiPost: null,
    tg: null,
    dbg: () => {},
  };

  // ---------- helpers ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const el = (t, cls) => { const x=document.createElement(t); if(cls) x.className=cls; return x; };
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  function fmtLeft(sec){
    sec = Math.max(0, sec|0);
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    const s = sec%60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function toast(msg){
    try { S.tg?.showAlert?.(String(msg)); } catch(_){ try{ alert(msg); }catch(_){} }
  }

  // --- DOM CSS
  function injectCss(){
    if (document.getElementById('fortress-css')) return;
    const css = `
#fortress-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
#fortress-modal .mask{position:absolute;inset:0;background:rgba(0,0,0,.55);z-index:1}
#fortress-modal .card{position:relative;z-index:2;width:min(92vw,520px);max-height:86vh;background:rgba(12,14,18,.96);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,.45);overflow:hidden}
.fx-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.fx-title{font-weight:800;letter-spacing:.2px}
.fx-sub{opacity:.8;font-weight:600}
.fx-badge{font:600 12px system-ui;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06)}
.fx-body{display:grid;gap:10px}
.fx-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.fx-col{display:grid;gap:8px}
.fx-kv{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.fx-chip{padding:6px 10px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.06);font-weight:700}
.fx-prog{display:grid;gap:6px}
.fx-bar{position:relative;height:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.fx-bar>i{position:absolute;left:0;top:0;bottom:0;width:0%;background:linear-gradient(90deg,rgba(0,229,255,.6),rgba(155,77,255,.6))}
.fx-actions{display:flex;gap:8px;justify-content:flex-end}
.fx-btn{padding:10px 12px;border-radius:12px;background:#2a2f45;border:1px solid rgba(255,255,255,.12);color:#fff;cursor:pointer}
.fx-btn.primary{background:rgba(16,185,129,.18)}
.fx-btn[disabled]{opacity:.55;cursor:not-allowed;filter:grayscale(.1)}
.fx-x{background:transparent;border:none;color:#fff;font-size:22px;padding:4px 8px;cursor:pointer}
.fx-note{opacity:.75;font-size:12px}
@media (max-width:480px){ .fx-title{font-size:15px} }
    `;
    const s = el('style'); s.id='fortress-css'; s.textContent = css; document.head.appendChild(s);
  }

  function closeModal(){
    const m = document.getElementById('fortress-modal');
    if (m) m.remove();
  }

  // ---------- deps / fallback ----------
  // Domyślne apiPost (jeśli nie zostało wstrzyknięte)
  async function defaultApiPost(path, payload){
    const base = global.API_BASE || '';
    const initData = (global.Telegram && global.Telegram.WebApp && global.Telegram.WebApp.initData) || '';
    const r = await fetch(base + path, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': 'Bearer ' + initData
      },
      body: JSON.stringify(payload || {})
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const err = new Error(j?.reason || ('HTTP '+r.status));
      err.response = { status:r.status, data:j };
      throw err;
    }
    return j;
  }

  function ensureDeps(){
    if (!S.apiPost) S.apiPost = defaultApiPost;
    if (!S.tg)      S.tg = global.Telegram?.WebApp || null;
    if (!S.dbg)     S.dbg = () => {};
  }

  // ---------- public UI ----------
  function open(){
    ensureDeps();
    injectCss();
    closeModal();

    const wrap = el('div'); wrap.id='fortress-modal';
    wrap.innerHTML = `
      <div class="mask" id="fx-mask"></div>
      <div class="card">
        <div class="fx-head">
          <div>
            <div class="fx-sub">Moon Lab — Fortress</div>
            <div class="fx-title">Moon Lab — Fortress</div>
          </div>
          <div class="fx-kv">
            <span id="fx-badge" class="fx-badge">…</span>
            <button class="fx-x" id="fx-x" type="button" aria-label="Close">×</button>
          </div>
        </div>

        <div class="fx-body">
          <div class="fx-row">
            <div class="fx-col">
              <div class="fx-kv"><b>Status:</b> <span id="fx-status">—</span></div>
              <div class="fx-kv"><b>Cooldown:</b> <span id="fx-cd">—</span></div>
              <div class="fx-kv"><b>Next opponent:</b> <span id="fx-next">—</span></div>
            </div>
            <div class="fx-col" style="min-width:170px;align-items:flex-end">
              <div class="fx-kv">
                <span class="fx-chip" id="fx-lvl">L —</span>
                <span class="fx-chip" id="fx-attempts" style="display:none" title="Attempts left">🎯 —</span>
              </div>
            </div>
          </div>

          <div class="fx-prog">
            <div class="fx-kv"><b>Encounter</b> <span class="fx-note" id="fx-encLbl">—/—</span></div>
            <div class="fx-bar"><i id="fx-barFill"></i></div>
          </div>

          <div class="fx-actions">
            <button class="fx-btn" id="fx-close" type="button">Close</button>
            <button class="fx-btn" id="fx-refresh" type="button">Refresh</button>
            <button class="fx-btn primary" id="fx-start" type="button" disabled>Start</button>
          </div>

          <div class="fx-note" id="fx-hint">Win → next encounter after cooldown; lose → retry same encounter.</div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    // Jedno miejsce obsługi kliknięć (pewne nawet przy reflow DOM)
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) { if (e.target.id === 'fx-mask') closeModal(); return; }
      switch (btn.id) {
        case 'fx-x':
        case 'fx-close': closeModal(); break;
        case 'fx-refresh': refresh(); break;
        case 'fx-start': doStart(); break;
      }
    });

    refresh();
  }

  // live ticker
  let ticker = null;
  function stopTicker(){ if (ticker){ clearInterval(ticker); ticker=null; } }

  async function refresh(){
    ensureDeps();
    stopTicker();
    try{
      let st = await S.apiPost('/webapp/building/state', { buildingId: BID });
      if (st && st.data) st = st.data;   // tolerancja na wrappery

      // --- aliasy pól (różne wersje backendu)
      const cdRaw = (st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown ?? 0) | 0;
      const cd    = Math.max(0, cdRaw);
      const ready =
        !!(st.canFight ?? st.canStart ?? st.ready ?? (st.status && String(st.status).toLowerCase()==='ready')) || cd === 0;

      const lvl = st.level ?? st.currentLevel ?? st.nextLevel ?? st.progress?.level ?? 1;

      // boss/opponent
      const nx = st.next || st.progress?.next || st.encounter?.next || st.upcoming || {};
      const bossName = st.bossName || nx.name || st.nextName || st.nextId || st.next_opponent?.name || '';
      $('#fx-next').textContent = (bossName || lvl) ? [bossName, lvl ? `(L${lvl})` : ''].filter(Boolean).join(' ') : '—';

      // próby na cooldown (opcjonalne)
      const attemptsLeft = st.attemptsLeft ?? st.attack?.attemptsLeft;
      $('#fx-attempts').style.display = attemptsLeft != null ? '' : 'none';
      if (attemptsLeft != null) $('#fx-attempts').textContent = `🎯 ${attemptsLeft}`;

      // licznik encounterów (opcjonalny)
      const encCurRaw   = (st.encounterIndex ?? st.encountersDone ?? st.progress?.encounterIndex ?? st.encounter?.index ?? 0)|0;
      const encTotalRaw = (st.encountersTotal ?? st.encountersCount ?? st.progress?.encountersTotal ?? 10)|0;
      const encCur  = clamp(encCurRaw + 1, 1, Math.max(1, encTotalRaw));
      const encTot  = Math.max(1, encTotalRaw || 10);
      $('#fx-encLbl').textContent = `${encCur}/${encTot}`;
      const pct = clamp(Math.round((encCur-1) / Math.max(1, encTot-1) * 100), 0, 100);
      $('#fx-barFill').style.width = pct + '%';

      // status + badge
      $('#fx-lvl').textContent     = `L ${lvl}`;
      setBadge(ready ? 'Ready' : (cd>0 ? 'Cooldown' : ''));
      $('#fx-status').textContent  = ready ? 'Ready' : (cd>0 ? 'Cooldown' : '—');
      $('#fx-cd').textContent      = ready ? '—' : fmtLeft(cd);

      // przycisk Start
      const btn = $('#fx-start');
      if (!btn) return;
      if (cd>0){
        btn.disabled = true;
        btn.textContent = 'Start';
        let left = cd;
        ticker = setInterval(() => {
          left = Math.max(0, left-1);
          $('#fx-cd').textContent = fmtLeft(left);
          if (left<=0){
            stopTicker();
            setBadge('Ready');
            $('#fx-status').textContent = 'Ready';
            $('#fx-cd').textContent = '—';
            btn.disabled = false;
            btn.textContent = 'Start';
          }
        }, 1000);
      } else {
        btn.disabled = !ready;
        btn.textContent = 'Start';
        btn.title = btn.disabled ? 'Not ready' : '';
      }

    } catch(e){
      const msg = e?.response?.data?.reason || e?.message || 'Failed to load Moon Lab state.';
      S.dbg('fortress/state fail', e);
      toast('Fortress: ' + msg);
      // zostaw Start zablokowany
    }
  }

  function setBadge(txt){
    const b = $('#fx-badge');
    if (!b) return;
    b.textContent = txt;
    const base = 'rgba(255,255,255,.06)';
    const green = 'rgba(16,185,129,.18)';
    const blue  = 'rgba(59,130,246,.18)';
    b.style.background = txt==='Ready' ? green : (txt==='Active' ? blue : base);
  }

  async function doStart(){
    ensureDeps();
    const btn = $('#fx-start');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    try{
      S.tg?.HapticFeedback?.impactOccurred?.('light');
      const out = await S.apiPost('/webapp/building/start', { buildingId: BID });

      // tolerancja na wrapper
      const res = out?.data || out;

      if (res && res.ok && (res.mode === 'fortress' || res.battle === 'fortress')){
        closeModal();
        renderFortressBattle(res);
        return;
      }
      if (res && (res.minutes || res.durationMinutes)){
        toast(`Run started: ${res.minutes ?? res.durationMinutes} min`);
        await refresh();
        return;
      }
      await refresh();
    }catch(e){
      const reason = (e?.response?.data?.reason) || (e?.data?.reason) || e?.message || 'Start failed';
      if (/COOLDOWN/i.test(reason)){
        const left = e?.response?.data?.cooldownLeftSec ?? e?.data?.cooldownLeftSec ?? 60;
        toast(`⏳ Cooldown: ${fmtLeft(left)}`);
        await refresh();
      } else if (/LOCKED_REGION|LOCKED/i.test(reason)){
        toast('🔒 Region locked');
      } else {
        console.error(e);
        toast('Something went wrong.');
      }
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- prosty renderer walki ----------
  function hpbar(cur,max){
    const W=18; cur=Math.max(0,cur|0); max=Math.max(1,max|0);
    const fill = Math.round(W*(cur/max));
    return '█'.repeat(fill)+'░'.repeat(W-fill);
  }

  function renderFortressBattle(data){
    injectCss();
    closeModal();

    const cont = el('div','fortress-battle');
    cont.innerHTML = `
      <div class="fx-head" style="margin-bottom:6px">
        <div>
          <div class="fx-sub">Moon Lab — Fortress</div>
          <div class="fx-title">L${data.level ?? data.lvl ?? '?'} · ${data.boss?.name||data.bossName||'Boss'}</div>
        </div>
        <button class="fx-x" id="fb-x" type="button">×</button>
      </div>
      <pre id="fb-board" style="background:rgba(255,255,255,.06);padding:8px;border-radius:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
YOU  [${hpbar(data.player?.hpMax ?? 0, data.player?.hpMax ?? 1)}] ${data.player?.hpMax ?? 0}/${data.player?.hpMax ?? 0}
BOSS [${hpbar(data.boss?.hpMax ?? 0, data.boss?.hpMax ?? 1)}] ${data.boss?.hpMax ?? 0}/${data.boss?.hpMax ?? 0}
      </pre>
      <div id="fb-log" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:4px"></div>
      <div class="fx-actions">
        <button class="fx-btn" id="fb-close" type="button">Close</button>
        <button class="fx-btn" id="fb-refresh" type="button">Refresh</button>
      </div>
    `;
    const wrap = el('div'); wrap.id='fortress-modal';
    const card = el('div','card'); card.style.padding='12px';
    const mask = el('div','mask'); mask.id='fb-mask';
    card.appendChild(cont); wrap.appendChild(mask); wrap.appendChild(card);
    document.body.appendChild(wrap);

    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) { if (e.target.id === 'fb-mask') closeModal(); return; }
      if (btn.id==='fb-x' || btn.id==='fb-close') closeModal();
      if (btn.id==='fb-refresh') (async () => {
        try{
          let st = await S.apiPost('/webapp/building/state', { buildingId: BID });
          if (st && st.data) st = st.data;
          closeModal();
          const cd = Math.max(0, (st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown ?? 0)|0);
          toast(cd>0 ? `Cooldown: ${fmtLeft(cd)}` : 'Ready');
        }catch(_){ toast('Error refreshing.'); }
      })();
    });

    const logEl = $('#fb-log', cont);
    const boardEl = $('#fb-board', cont);
    let pHp = data.player?.hpMax ?? 0, bHp = data.boss?.hpMax ?? 0, i=0;

    function step(){
      if (i >= (data.steps?.length||0)){
        const lines = [];
        lines.push(data.winner==='you' ? '✅ Victory!' : '❌ Defeat!');
        const mats = [];
        if (data.rewards?.materials?.scrap) mats.push(`Scrap ×${data.rewards.materials.scrap}`);
        if (data.rewards?.materials?.rune_dust) mats.push(`Rune Dust ×${data.rewards.materials.rune_dust}`);
        if (mats.length) lines.push('Rewards: '+mats.join(', '));
        if (data.rewards?.rare) lines.push('💎 Rare drop!');
        if (data.rewards?.firstClear?.length) lines.push('🌟 First clear: '+data.rewards.firstClear.join(', '));
        if (data.next?.level) lines.push(`Next: L${data.next.level} · Cooldown 1h`);
        logEl.insertAdjacentHTML('beforeend', `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.12)">${lines.join('<br>')}</div>`);
        return;
      }
      const s = data.steps[i++];
      if (s.actor==='you'){
        bHp = s.b_hp;
        logEl.insertAdjacentHTML('beforeend', `<div>▶ You ${s.dodge?'shoot… boss <b>DODGED</b>!':`hit for <b>${s.dmg}</b>${s.crit?' <i>(CRIT)</i>':''}.`}</div>`);
      } else {
        pHp = s.p_hp;
        logEl.insertAdjacentHTML('beforeend', `<div>◀ Boss ${s.dodge?'attacks… you <b>DODGE</b>!':`hits for <b>${s.dmg}</b>${s.crit?' <i>(CRIT)</i>':''}.`}</div>`);
      }
      boardEl.textContent =
`YOU  [${hpbar(pHp, data.player?.hpMax ?? 1)}] ${pHp}/${data.player?.hpMax ?? 0}
BOSS [${hpbar(bHp, data.boss?.hpMax ?? 1)}] ${bHp}/${data.boss?.hpMax ?? 0}`;
      logEl.scrollTop = logEl.scrollHeight;
      setTimeout(step, 500);
    }
    setTimeout(step, 350);
  }

  // ---------- API ----------
  function init(deps){
    S.apiPost = deps?.apiPost || S.apiPost;
    S.tg = deps?.tg || S.tg;
    S.dbg = deps?.dbg || S.dbg;
    ensureDeps();
  }

  global.Fortress = { init, open, refresh };

})(window);
