// js/fortress.js
// Alpha Husky — Moon Lab (Fortress) UI
// Integracja: window.Fortress.init({ apiPost, tg, dbg })

(function (global) {
  const BID = 'moonlab_fortress';

  const S = {
    apiPost: null,   // wstrzykiwane z index.html
    tg: null,
    dbg: () => {},
  };

  // ---------- utils ----------
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

  function injectCss(){
    if (document.getElementById('fortress-css')) return;
    const css = `
#fortress-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
#fortress-modal .mask{position:absolute;inset:0;background:rgba(0,0,0,.55)}
#fortress-modal .card{position:relative;width:min(92vw,520px);max-height:86vh;background:rgba(12,14,18,.96);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,.45);overflow:hidden}
.fx-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.fx-title{font-weight:800;letter-spacing:.2px}
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

  // ---------- helpers do „elastycznego” mapowania ----------
  const getPath = (obj, path) =>
    String(path).split('.').reduce((o,k)=> (o && (k in o) ? o[k] : undefined), obj);

  function pick(obj, paths, def){
    for (const p of paths){
      const v = getPath(obj, p);
      if (v !== undefined && v !== null) return v;
    }
    return def;
  }

  function buildNextLabel(st){
    const nx = pick(st, [
      'next','nextEncounter','encounter.next','progress.next','fortress.next','state.next','data.next'
    ], null) || {};

    const level = pick({nx,st}, [
      'nx.level','st.nextLevel','st.level','st.progress.level','st.fortress.level'
    ], undefined);

    const name  = pick({nx,st}, [
      'nx.name','nx.id','nx.boss.name','st.nextName','st.encounter.name','st.encounter.id'
    ], undefined);

    const rank  = pick({nx,st}, [
      'nx.rank','nx.boss.rank','st.encounter.rank'
    ], undefined);

    const power = pick({nx,st}, [
      'nx.power','nx.boss.power','st.encounter.power'
    ], undefined);

    const floorName = pick(st, [
      'progress.floorName','progress.floor','fortress.floorName'
    ], undefined);

    const bits = [];
    if (typeof level === 'number') bits.push(`L${level}`);
    if (name) bits.push(String(name));
    if (rank) bits.push(String(rank));
    if (typeof power === 'number') bits.push(`Pwr ${power}`);
    const label = bits.join(' · ') + (floorName ? ` • ${floorName}` : '');
    return label || '—';
  }

  // ---------- public UI ----------
  function open(){
    injectCss();
    closeModal();

    const wrap = el('div'); wrap.id='fortress-modal';
    wrap.innerHTML = `
      <div class="mask"></div>
      <div class="card">
        <div class="fx-head">
          <div class="fx-title">Moon Lab — Fortress</div>
          <div class="fx-kv">
            <span id="fx-badge" class="fx-badge">…</span>
            <button class="fx-x" id="fx-x" aria-label="Close">×</button>
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
            <button class="fx-btn" id="fx-close">Close</button>
            <button class="fx-btn" id="fx-refresh">Refresh</button>
            <button class="fx-btn primary" id="fx-start">Start</button>
          </div>

          <div class="fx-note" id="fx-hint">Win → next encounter after cooldown; lose → retry same encounter.</div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    $('#fx-x').onclick = closeModal;
    $('#fx-close').onclick = closeModal;
    $('#fx-refresh').onclick = () => refresh();
    $('#fx-start').onclick = () => doStart();

    refresh();
  }

  // live cooldown ticker
  let ticker = null;
  function stopTicker(){ if (ticker){ clearInterval(ticker); ticker=null; } }

  function setBadge(txt){
    const b = $('#fx-badge');
    if (!b) return;
    b.textContent = txt;
    const base = 'rgba(255,255,255,.06)';
    const green = 'rgba(16,185,129,.18)';
    const blue  = 'rgba(59,130,246,.18)';
    b.style.background = txt==='Ready' ? green : (txt==='Active' ? blue : base);
  }

  async function refresh(){
    stopTicker();
    try{
      const st = await S.apiPost('/webapp/building/state', { buildingId: BID });

      const cooldown = Math.max(0, (st.cooldownLeftSec|0));
      const active   = !!st.active;
      const ready    = !active && cooldown<=0;

      const lvl = pick(st, [
        'level','currentLevel','nextLevel','progress.level','fortress.level','data.level'
      ], 1);

      const encCur = pick(st, [
        'encounterIndex','progress.encounterIndex','encounter.index','fortress.encounterIndex'
      ], 0); // 0-based

      const encTotal = pick(st, [
        'encountersTotal','progress.encountersTotal','fortress.encountersTotal','meta.encountersTotal'
      ], 10);

      const attemptsLeft = pick(st, [
        'attemptsLeft','attack.attemptsLeft','fortress.attemptsLeft'
      ], null);

      const nextLabel = buildNextLabel(st);

      // statusy
      setBadge(ready ? 'Ready' : (active ? 'Active' : 'Cooldown'));
      $('#fx-status').textContent = ready ? 'Ready' : (active ? 'Active' : 'Cooldown');
      $('#fx-cd').textContent = ready ? '—' : fmtLeft(cooldown);
      $('#fx-next').textContent = nextLabel;

      // level / próby
      $('#fx-lvl').textContent = `L ${lvl}`;
      const at = $('#fx-attempts');
      if (attemptsLeft !== null && attemptsLeft !== undefined){
        at.style.display = 'inline-block';
        at.textContent = `🎯 ${attemptsLeft}`;
      } else {
        at.style.display = 'none';
      }

      // encounter progress
      const curDisp = clamp((encCur|0) + 1, 1, encTotal);
      $('#fx-encLbl').textContent = `${curDisp}/${encTotal}`;
      const pct = clamp(Math.round((curDisp-1) / Math.max(1, encTotal-1) * 100), 0, 100);
      $('#fx-barFill').style.width = pct + '%';

      // przycisk Start + live cooldown
      const startBtn = $('#fx-start');
      if (active) {
        startBtn.disabled = true;
        startBtn.textContent = 'Active…';
      } else if (cooldown>0) {
        startBtn.disabled = true;
        startBtn.textContent = 'Start';
        let left = cooldown;
        $('#fx-cd').textContent = fmtLeft(left);
        ticker = setInterval(() => {
          left = Math.max(0, left-1);
          $('#fx-cd').textContent = fmtLeft(left);
          if (left<=0){
            stopTicker();
            setBadge('Ready');
            $('#fx-status').textContent = 'Ready';
            startBtn.disabled = false;
            startBtn.textContent = 'Start';
            $('#fx-cd').textContent = '—';
          }
        }, 1000);
      } else {
        startBtn.disabled = false;
        startBtn.textContent = 'Start';
      }

    } catch(e){
      S.dbg('fortress/state fail');
      console.error(e);
      toast('Failed to load Moon Lab state.');
    }
  }

  async function doStart(){
    const btn = $('#fx-start');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    try{
      S.tg?.HapticFeedback?.impactOccurred?.('light');
      const out = await S.apiPost('/webapp/building/start', { buildingId: BID });

      // Tryb fortress — render bitwy
      if (out && out.ok && out.mode === 'fortress'){
        closeModal();
        renderFortressBattle(out);
        return;
      }

      // fallback (gdyby backend oddał "minutes" jak zwykły budynek)
      if (out && out.minutes){
        toast(`Run started: ${out.minutes} min`);
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
      } else if (/LOCKED_REGION/i.test(reason)){
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
    // data: { level, boss, player, steps[], winner, rewards, next }
    injectCss();
    closeModal();

    const cont = el('div','fortress-battle');
    const nextLine = (() => {
      const nx = data?.next || {};
      const parts = [];
      if (typeof nx.level === 'number') parts.push(`L${nx.level}`);
      if (nx.name) parts.push(nx.name);
      if (nx.rank) parts.push(nx.rank);
      if (typeof nx.power === 'number') parts.push(`Pwr ${nx.power}`);
      return parts.length ? `Next: ${parts.join(' · ')} · Cooldown 1h` : '';
    })();

    cont.innerHTML = `
      <div class="fx-head" style="margin-bottom:6px">
        <div class="fx-title">Moon Lab — Fortress</div>
        <button class="fx-x" id="fb-x">×</button>
      </div>
      <div style="margin-bottom:4px;font-weight:700">L${data.level} · ${data.boss?.name||'Boss'}</div>
      <pre id="fb-board" style="background:rgba(255,255,255,.06);padding:8px;border-radius:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
YOU  [${hpbar(data.player.hpMax, data.player.hpMax)}] ${data.player.hpMax}/${data.player.hpMax}
BOSS [${hpbar(data.boss.hpMax, data.boss.hpMax)}] ${data.boss.hpMax}/${data.boss.hpMax}
      </pre>
      <div id="fb-log" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:4px"></div>
      <div class="fx-actions">
        <button class="fx-btn" id="fb-close">Close</button>
        <button class="fx-btn" id="fb-refresh">Refresh</button>
      </div>
      ${nextLine ? `<div class="fx-note" style="margin-top:4px">${nextLine}</div>` : ''}
    `;
    const wrap = el('div'); wrap.id='fortress-modal';
    const card = el('div','card'); card.style.padding='12px';
    const mask = el('div','mask');
    card.appendChild(cont); wrap.appendChild(mask); wrap.appendChild(card);
    document.body.appendChild(wrap);

    $('#fb-close').onclick = closeModal;
    $('#fb-x').onclick = closeModal;
    $('#fb-refresh').onclick = async () => {
      try{
        const st = await S.apiPost('/webapp/building/state', { buildingId: BID });
        closeModal();
        const cd = Math.max(0, st.cooldownLeftSec|0);
        toast(cd>0 ? `Cooldown: ${fmtLeft(cd)}` : 'Ready');
      }catch(_){ toast('Error refreshing.'); }
    };

    const logEl = $('#fb-log', cont);
    const boardEl = $('#fb-board', cont);
    let pHp = data.player.hpMax, bHp = data.boss.hpMax, i=0;

    function step(){
      if (i >= (data.steps?.length||0)){
        const lines = [];
        lines.push(data.winner==='you' ? '✅ Victory!' : '❌ Defeat!');
        const mats = [];
        if (data.rewards?.materials?.scrap)     mats.push(`Scrap ×${data.rewards.materials.scrap}`);
        if (data.rewards?.materials?.rune_dust) mats.push(`Rune Dust ×${data.rewards.materials.rune_dust}`);
        if (mats.length) lines.push('Rewards: '+mats.join(', '));
        if (data.rewards?.rare) lines.push('💎 Rare drop!');
        if (data.rewards?.firstClear?.length) lines.push('🌟 First clear: '+data.rewards.firstClear.join(', '));
        if (data.next?.level || data.next?.name){
          const nbits = [];
          if (typeof data.next.level === 'number') nbits.push(`L${data.next.level}`);
          if (data.next.name) nbits.push(data.next.name);
          lines.push(`Next: ${nbits.join(' · ')} · Cooldown 1h`);
        }
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
`YOU  [${hpbar(pHp, data.player.hpMax)}] ${pHp}/${data.player.hpMax}
BOSS [${hpbar(bHp, data.boss.hpMax)}] ${bHp}/${data.boss.hpMax}`;
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
  }

  // eksport
  global.Fortress = { init, open, refresh };

})(window);
