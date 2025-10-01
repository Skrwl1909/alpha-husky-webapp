// js/dojo.js
// Alpha Husky — Testnet Wastes (Dojo) UI — REAL DATA EDITION
// API: window.Dojo.init({ apiPost, tg, dbg }); → window.Dojo.open();
// Feed real hits from your game loop: window.DOJO_FEED(damage, isCrit)

(function (global) {
  const BID = 'testnet_wastes_dojo';

  // ---------- deps / state ----------
  const S = {
    apiPost: null,
    tg: null,
    dbg: () => {},
    tick: null,
    runId: null,
  };

  // exposed feeder (set in render)
  let _feed = null;

  // ---------- helpers ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const el = (t, cls) => { const x=document.createElement(t); if(cls) x.className=cls; return x; };
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const sum = a => a.reduce((x,y)=>x+y,0);
  const avg = a => a.length ? sum(a)/a.length : 0;

  // ---------- CSS ----------
  function injectCSS() {
    if ($('#dojo-css')) return;
    const s = el('style'); s.id='dojo-css';
    s.textContent = `
:root{
  --bg:#0b0f14; --panel:#111823; --muted:#7e8aa3; --text:#e6ecff;
  --accent:#5ef0ff; --accent2:#b08cff; --good:#2ecc71; --bad:#ff5e7a;
}
#dojo-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
#dojo-modal .mask{position:absolute;inset:0;background:rgba(0,0,0,.55)}
#dojo-modal .card{
  position:relative;width:min(92vw,760px);max-height:88vh;overflow:auto;
  background:linear-gradient(180deg,rgba(17,24,35,.96),rgba(10,14,20,.96)),
             radial-gradient(60% 100% at 70% 0%,rgba(94,240,255,.05),transparent 60%);
  border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:14px;color:var(--text);
  box-shadow:0 10px 40px rgba(0,0,0,.45)
}
#dojo-modal .card::after{
  content:"";position:absolute;inset:0;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.03),rgba(255,255,255,.03) 1px,transparent 2px,transparent 4px);
  mix-blend-overlay;pointer-events:none;opacity:.22
}
.fx-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.eyebrow{color:var(--muted);font-size:12px;letter-spacing:.12em;text-transform:uppercase}
.fx-title{margin:2px 0 0;font-size:18px;font-weight:800}
.badge{font-size:11px;padding:3px 6px;border-radius:999px;background:rgba(94,240,255,.12);color:var(--accent);margin-left:8px}
.fx-btn{padding:10px 12px;border-radius:12px;background:#1c2433;border:1px solid rgba(255,255,255,.14);color:#cfe3ff;cursor:pointer}
.fx-btn[disabled]{opacity:.55;cursor:not-allowed}

.dojo-body{display:grid;grid-template-columns:260px 1fr;gap:16px;align-items:center;margin:12px 0}
.ring-wrap{position:relative;width:240px;height:240px;margin:auto}
.ring{width:240px;height:240px;transform:rotate(-90deg)}
.track{fill:none;stroke:#1b2535;stroke-width:10}
.progress{fill:none;stroke:var(--accent);stroke-width:10;stroke-linecap:round;filter:drop-shadow(0 0 8px rgba(94,240,255,.35))}
.ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateZ(0)}
.ring-center .label{font-size:12px;color:var(--muted);letter-spacing:.08em}
.ring-center .value{font-size:34px;font-weight:800;line-height:1.1}
.ring-center .sub{font-size:12px;color:var(--muted)}
.pr-badge{position:absolute;top:18px;right:18px;background:linear-gradient(90deg,var(--accent),var(--accent2));
  color:#041018;font-weight:700;padding:3px 8px;border-radius:999px;font-size:11px}

.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.stat{background:#0f1420;border:1px solid #1e2a3d;border-radius:12px;padding:10px}
.stat span{display:block;font-size:12px;color:var(--muted)}
.stat strong{display:flex;align-items:center;gap:8px;font-size:16px;margin-top:2px}
.stat .bar{margin-top:6px;height:6px;background:#121a28;border-radius:6px;overflow:hidden}
.stat .bar i{display:block;height:100%;background:linear-gradient(90deg,rgba(94,240,255,.4),rgba(176,140,255,.4))}
.stat.best strong em{font-style:normal;font-size:12px}
.up{color:var(--good)} .down{color:var(--bad)}

.sparkline-wrap{background:#0f1420;border:1px solid #1e2a3d;border-radius:12px;padding:10px;margin-top:6px}
.spark-legend{font-size:11px;color:var(--muted);margin-top:6px}

.actions{display:flex;justify-content:space-between;align-items:center;margin-top:10px}
select{background:#0f1420;color:var(--text);border:1px solid #1e2a3d;border-radius:10px;padding:6px 10px}
button.primary{background:linear-gradient(90deg,rgba(94,240,255,.2),rgba(176,140,255,.2));border:1px solid #244a5a;color:#dffaff;padding:10px 14px;border-radius:12px}
button.ghost{background:#0f1420;border:1px solid #1e2a3d;color:#cfe3ff;padding:10px 14px;border-radius:12px}
`;
    document.head.appendChild(s);
  }

  // ---------- API ----------
  async function api(path, payload) {
    if (!S.apiPost) {
      const base = global.API_BASE || '';
      const init = global.Telegram?.WebApp?.initData || '';
      S.apiPost = (p, b) =>
        fetch(base + p, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + init },
          body: JSON.stringify(b || {}),
        }).then(r => r.json());
    }
    const out = await S.apiPost(path, payload);
    return out?.data || out;
  }
  async function getState() { return api('/webapp/building/state', { buildingId: BID }); }
  async function startRun(seconds) {
    const res = await api('/webapp/building/start', { buildingId: BID, seconds });
    S.runId = res?.runId ?? null;
    return res;
  }
  async function resolveRun(payload) {
    try {
      return await api('/webapp/building/resolve', { buildingId: BID, runId: S.runId, payload });
    } catch { /* silent */ }
  }

  // ---------- UI template ----------
  function tpl(timerSec = 60) {
    return `
      <div class="mask" id="dj-mask"></div>
      <div class="card">
        <div class="fx-head">
          <div>
            <div class="eyebrow">Training</div>
            <div class="fx-title">Testnet Wastes — Dojo <span class="badge">Zero-risk</span></div>
          </div>
          <button class="fx-btn" id="dj-x" type="button">Close</button>
        </div>

        <div class="dojo-body">
          <div class="ring-wrap">
            <svg viewBox="0 0 120 120" class="ring">
              <circle cx="60" cy="60" r="54" class="track"></circle>
              <circle cx="60" cy="60" r="54" class="progress" stroke-dasharray="339.292" stroke-dashoffset="0"></circle>
            </svg>
            <div class="ring-center">
              <div class="label">LIVE DPS</div>
              <div class="value" id="dj-dps">—</div>
              <div class="sub" id="dj-timer">${timerSec}s</div>
              <div class="pr-badge" id="dj-pr" hidden>PR</div>
            </div>
          </div>

          <div class="stats">
            <div class="stat"><span>Total</span><strong id="dj-total">—</strong><div class="bar"><i id="bar-total" style="width:0%"></i></div></div>
            <div class="stat"><span>Hits</span><strong id="dj-hits">—</strong><div class="bar"><i id="bar-hits" style="width:0%"></i></div></div>
            <div class="stat"><span>Avg hit</span><strong id="dj-avg">—</strong><div class="bar"><i id="bar-avg" style="width:0%"></i></div></div>
            <div class="stat"><span>Max hit</span><strong id="dj-max">—</strong><div class="bar"><i id="bar-max" style="width:0%"></i></div></div>
            <div class="stat"><span>Crit rate</span><strong id="dj-crit">—</strong><div class="bar"><i id="bar-crit" style="width:0%"></i></div></div>
            <div class="stat best">
              <span>Best DPS</span>
              <strong><span id="dj-best">—</span> <em id="dj-delta"></em></strong>
            </div>
          </div>
        </div>

        <div class="sparkline-wrap">
          <canvas id="dj-spark" width="560" height="80"></canvas>
          <div class="spark-legend">DPS over time • crits • <span id="dj-span">${timerSec}s</span></div>
        </div>

        <div class="actions">
          <div class="left">
            <label for="dj-dur" style="font-size:12px;color:var(--muted)">Duration</label>
            <select id="dj-dur">
              <option value="60" selected>60s</option>
              <option value="30">30s</option>
            </select>
          </div>
          <div class="right">
            <button id="dj-copy" class="ghost fx-btn" type="button">Copy results</button>
            <button id="dj-start" class="primary fx-btn" type="button">Start test</button>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- drawing ----------
  const R = 54; const CIRC = 2 * Math.PI * R;
  function setRing(node, p){ node.style.strokeDasharray = CIRC; node.style.strokeDashoffset = String(CIRC*(1-p)); }
  function drawSpark(canvas, series, crits){
    const ctx = canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    ctx.clearRect(0,0,w,h);
    if(!series.length) return;
    const maxV = Math.max(...series, 1), step = w/Math.max(series.length-1,1);
    ctx.lineWidth=2; ctx.globalAlpha=1; ctx.beginPath();
    series.forEach((v,i)=>{ const x=i*step, y=h-(v/maxV)*(h-14)-7; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.strokeStyle='rgba(94,240,255,0.9)'; ctx.stroke();
    ctx.fillStyle='rgba(176,140,255,0.9)';
    (crits||[]).forEach(i=>{ if(i<0||i>=series.length) return;
      const v=series[i], x=i*step, y=h-(v/maxV)*(h-14)-7; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill(); });
  }

  // --- NEW: compute using real hits, maxHit, crit hits ---
  function computeRunStats(series, hitsCount, maxHitVal, critHits){
    const total    = sum(series);
    const dpsAvg   = avg(series);
    const hits     = hitsCount;
    const avgHit   = hits ? total / hits : 0;
    const maxHit   = maxHitVal || 0;
    const critRate = hits ? (critHits / hits) : 0;
    return { total, dpsAvg, hits, avgHit, maxHit, critRate };
  }

  // ---------- modal ----------
  function close(){ const m=$('#dojo-modal'); if(m) m.remove(); if(S.tick){ clearInterval(S.tick); S.tick=null; } _feed=null; }

  function render(st){
    injectCSS(); close();

    // inputs from state
    const timerSec = st?.timerSec || st?.seconds || 60;
    const bestDpsState = (st?.bestDps ?? +localStorage.getItem('dojo_best_dps')) || 0;

    const w = el('div'); w.id='dojo-modal'; w.innerHTML = tpl(timerSec); document.body.appendChild(w);

    // refs
    const progress=$('.progress',w), dpsEl=$('#dj-dps',w), timerEl=$('#dj-timer',w), spanEl=$('#dj-span',w), prBadge=$('#dj-pr',w);
    const totalEl=$('#dj-total',w), hitsEl=$('#dj-hits',w), avgEl=$('#dj-avg',w), maxEl=$('#dj-max',w), critEl=$('#dj-crit',w);
    const bestEl=$('#dj-best',w), deltaEl=$('#dj-delta',w);
    const barTotal=$('#bar-total',w), barHits=$('#bar-hits',w), barAvg=$('#bar-avg',w), barMax=$('#bar-max',w), barCrit=$('#bar-crit',w);
    const spark=$('#dj-spark',w), startBtn=$('#dj-start',w), durSel=$('#dj-dur',w), copyBtn=$('#dj-copy',w);

    bestEl.textContent = bestDpsState ? bestDpsState.toFixed(2) : '—';
    deltaEl.textContent = '';

    // local run state
    let dur = +durSel.value, t = dur;
    let series = [];         // DPS/s (suma dmg w danej sekundzie)
    let critIdxs = [];       // indeksy sekund z ≥1 CRIT
    let bucketDamage = 0;    // dmg z bieżącej sekundy
    let bucketCrits = 0;     // ile CRIT-ów w bieżącej sekundzie
    let bestDps = bestDpsState;

    // NEW: real counters
    let hitsCount = 0;       // faktyczna liczba trafień
    let critHits  = 0;       // łączna liczba CRIT-ów
    let maxHitVal = 0;       // największy pojedynczy hit

    // expose feeder
    _feed = (hitDamage, isCrit = false) => {
      const d = Number(hitDamage);
      if (!Number.isFinite(d) || d <= 0) return;
      bucketDamage += d;            // do DPS/s
      hitsCount += 1;               // real hits
      if (isCrit) { bucketCrits += 1; critHits += 1; }
      if (d > maxHitVal) maxHitVal = d;
    };

    function updateStats(){
      const c = computeRunStats(series, hitsCount, maxHitVal, critHits);
      totalEl.textContent = Math.round(c.total).toString();
      hitsEl.textContent  = c.hits.toString();
      avgEl.textContent   = c.avgHit.toFixed(2);
      maxEl.textContent   = c.maxHit.toFixed(0);
      critEl.textContent  = (c.critRate*100).toFixed(1)+'%';

      // bars (proste heurystyki)
      barTotal.style.width = '100%';
      barHits.style.width  = '100%';
      barAvg.style.width   = c.maxHit ? clamp((c.avgHit/c.maxHit)*100,0,100)+'%' : '0%';
      barMax.style.width   = '100%';
      barCrit.style.width  = clamp(c.critRate*100, 0, 100) + '%';

      // PR
      const dpsAvg = avg(series);
      if (bestDps && dpsAvg) {
        const diff = ((dpsAvg - bestDps)/bestDps)*100;
        deltaEl.textContent = (diff>=0 ? '↑ ' : '↓ ') + (diff||0).toFixed(1) + '%';
        deltaEl.className = diff>=0 ? 'up' : 'down';
      } else {
        deltaEl.textContent = '';
      }
      if (dpsAvg > bestDps && series.length>=3) prBadge.hidden = false;
    }

    function drainSecond() {
      // przenieś zgromadzony dmg do serii
      const dps = bucketDamage; const hadCrit = bucketCrits > 0;
      dpsEl.textContent = dps.toFixed(2);
      series.push(dps);
      if (hadCrit) critIdxs.push(series.length-1);
      bucketDamage = 0; bucketCrits = 0;

      timerEl.textContent = (--t)+'s';
      setRing(progress, (dur - t)/dur);
      drawSpark(spark, series, critIdxs);
      updateStats();

      if (t<=0) endRun();
    }

    function endRun(){
      clearInterval(S.tick); S.tick=null; startBtn.textContent='Restart';

      const c = computeRunStats(series, hitsCount, maxHitVal, critHits);
      const payload = {
        seconds: dur,
        dpsAvg: +avg(series).toFixed(2),
        total: Math.round(c.total),
        hits: c.hits,
        avgHit: +c.avgHit.toFixed(2),
        maxHit: Math.round(c.maxHit),
        critRate: +c.critRate.toFixed(4),
        series: series.map(x=>+x.toFixed(2)),
        critIdxs,
      };

      if (!bestDps || payload.dpsAvg > bestDps) {
        bestDps = payload.dpsAvg;
        localStorage.setItem('dojo_best_dps', String(bestDps));
        bestEl.textContent = bestDps.toFixed(2);
      }
      resolveRun(payload); // fire-and-forget
    }

    async function startRunAndLoop(){
      // reset UI + counters
      if (S.tick) clearInterval(S.tick);
      t = dur; series = []; critIdxs = [];
      bucketDamage = 0; bucketCrits = 0;
      hitsCount = 0; critHits = 0; maxHitVal = 0;
      prBadge.hidden = true;

      timerEl.textContent = t+'s'; dpsEl.textContent = '—'; setRing(progress, 0);
      drawSpark(spark, series, critIdxs); updateStats();
      startBtn.textContent = 'Pause';

      // 1× start (opcjonalnie przekaż dur do backendu)
      try {
        const out = await startRun(dur);
        if (typeof out?.bestDps === 'number') {
          bestDps = out.bestDps;
          localStorage.setItem('dojo_best_dps', String(bestDps));
          bestEl.textContent = bestDps.toFixed(2);
        }
      } catch(e){ S.dbg('dojo.start error', e); }

      // sekundowy drenaż kubełka
      S.tick = setInterval(drainSecond, 1000);
    }

    function togglePause(){
      if (S.tick) {
        clearInterval(S.tick); S.tick=null; startBtn.textContent='Resume';
      } else {
        startBtn.textContent='Pause';
        S.tick = setInterval(drainSecond, 1000);
      }
    }

    // events
    w.addEventListener('click', (e)=>{
      const tEl = e.target;
      if (tEl.id==='dj-x' || tEl.id==='dj-mask') return close();
      if (tEl.id==='dj-start'){
        if (tEl.textContent==='Start test' || tEl.textContent==='Restart') startRunAndLoop();
        else togglePause();
      }
      if (tEl.id==='dj-copy'){
        const c = computeRunStats(series, hitsCount, maxHitVal, critHits);
        const payload = {
          seconds: dur,
          dpsAvg: +avg(series).toFixed(2),
          total: Math.round(c.total),
          hits: c.hits,
          avgHit: +c.avgHit.toFixed(2),
          maxHit: Math.round(c.maxHit),
          critRate: +c.critRate.toFixed(4),
          series: series.map(x=>+x.toFixed(2)),
          critIdxs,
        };
        navigator.clipboard.writeText(JSON.stringify(payload))
          .then(()=>{ tEl.textContent='Copied ✓'; setTimeout(()=> tEl.textContent='Copy results', 1200); })
          .catch(()=>{ tEl.textContent='Copy failed'; setTimeout(()=> tEl.textContent='Copy results', 1200); });
      }
    });

    durSel.addEventListener('change', ()=>{
      if (S.tick) { clearInterval(S.tick); S.tick=null; }
      dur = +durSel.value; t = dur; spanEl.textContent = dur+'s';
      series=[]; critIdxs=[]; bucketDamage=0; bucketCrits=0;
      hitsCount=0; critHits=0; maxHitVal=0; prBadge.hidden=true;
      timerEl.textContent = t+'s'; dpsEl.textContent='—'; setRing(progress,0);
      drawSpark(spark, series, critIdxs); updateStats();
      startBtn.textContent='Start test';
    });

    setRing(progress, 0);
  }

  // ---------- public ----------
  async function open(){
    try { const st = await getState(); render(st||{}); }
    catch(e){ S.dbg('dojo.state error', e); render({ seconds:60 }); }
  }
  function init(deps){
    S.apiPost = deps?.apiPost || S.apiPost;
    S.tg      = deps?.tg || S.tg || global.Telegram?.WebApp || null;
    S.dbg     = deps?.dbg || S.dbg;
  }
  function feed(hitDamage, isCrit=false){ if (_feed) _feed(hitDamage, !!isCrit); }

  global.Dojo = { init, open, feed };

  // Convenience helper for game code:
  // Use anywhere after Dojo is loaded: window.DOJO_FEED(dmg, isCrit)
  global.DOJO_FEED = function(dmg, crit){
    try { global.Dojo && global.Dojo.feed(dmg, !!crit); } catch(e){}
  };

})(window);
