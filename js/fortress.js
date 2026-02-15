// js/fortress.js
// Alpha Husky — Moon Lab (Fortress) UI
// Użycie: window.Fortress.init({ apiPost, tg, dbg }); → window.Fortress.open();
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
  const clamp = (v,min,max)=>Math.max(min,Math.min(max, v));
  const setText = (sel, v) => { const n = $(sel); if (n) n.textContent = String(v); };
  const setWidth = (sel, v) => { const n = $(sel); if (n) n.style.width = String(v); };
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

  // Bezpieczny fallback dla animowanych liczb obrażeń,
  // jeśli engine Combat nie poda własnej implementacji.
  function ensureDamageParticles(){
    if (!global.Combat) global.Combat = {};
    if (typeof global.Combat.createDamageNumber !== 'function') {
      global.Combat.createDamageNumber = function(x, y, dmg, crit){
        const container = global.Combat.container || document.body;
        const span = document.createElement('div');
        span.className = 'damage-number' + (crit ? ' crit-damage' : '');
        span.textContent = String(dmg);
        span.style.left = (x - 10) + 'px';
        span.style.top = (y - 10) + 'px';
        span.style.position = 'absolute';
        container.appendChild(span);
        setTimeout(() => { span.remove(); }, 1100);
      };
    }
  }

  // === helper: ustaw sprite bossa; przyjmuje klucz (ion_sentry), nazwę lub pełną ścieżkę ===
  function setEnemySprite(spriteOrNameOrKey){
    const img = $('#fx-enemy'); if (!img) return;
    const v = global.WEBAPP_VER || 'dev';
    let src = spriteOrNameOrKey || '';
    // pełna ścieżka/URL?
    const looksLikeUrl = /^https?:\/\//i.test(src) || /\/.+\.(png|webp|jpg|jpeg|gif)$/i.test(src);
    if (!looksLikeUrl) {
      // potraktuj jako key lub nazwę → zrób slug i zbuduj ścieżkę
      const slug = String(src||'')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g,'_')
        .replace(/^_|_$/g,'');
      if (slug) src = `images/bosses/${slug}.png`;
    }
    if (!src) src = 'images/bosses/core_custodian.png'; // fallback
    img.src = src + (src.includes('?') ? `&v=${encodeURIComponent(v)}` : `?v=${encodeURIComponent(v)}`);
  }

  // --- DOM CSS
  function injectCss(){
  if (document.getElementById('fortress-css')) return;
  const css = `
#fortress-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
#fortress-modal .mask{position:absolute;inset:0;background:rgba(0,0,0,.55);z-index:1}

/* ✅ card jako flex-col + min-height:0 żeby scroll działał */
#fortress-modal .card{
  position:relative;z-index:2;width:min(92vw,520px);max-height:86vh;
  background:rgba(12,14,18,.96);border:1px solid rgba(255,255,255,.12);
  border-radius:16px;padding:12px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,.45);
  overflow:hidden;
  display:flex;flex-direction:column;
  min-height:0;
}

.fx-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.fx-title{font-weight:800;letter-spacing:.2px}
.fx-sub{opacity:.8;font-weight:600}
.fx-badge{font:600 12px system-ui;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06)}

/* ✅ środek modala jest scrollowalny */
.fb-main{
  display:flex;flex-direction:column;gap:10px;
  overflow:auto;
  flex:1;
  min-height:0;
  padding-bottom:8px;
}

/* ✅ stage ma zawsze wysokość (koniec “pustego okna”) */
#fb-stage{
  position:relative;
  height:clamp(200px, 34vh, 360px);
  border-radius:14px;
  overflow:hidden;
  background:radial-gradient(60% 60% at 50% 60%, rgba(255,255,255,.07), rgba(0,0,0,0));
  border:1px solid rgba(255,255,255,.10);
}

#fb-board{
  margin:0;
  background:rgba(255,255,255,.06);
  padding:8px;
  border-radius:10px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}

/* ✅ log już nie “ucięty” – bierze tyle miejsca ile trzeba + scroll */
#fb-log{
  display:flex;
  flex-direction:column;
  gap:4px;
  overflow:auto;
  min-height:120px;
  max-height:none;
  padding-right:2px;
}

.fx-actions{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);
  position:sticky;bottom:0;
  background:linear-gradient(180deg,rgba(12,14,18,0),rgba(12,14,18,.96) 35%);
  padding-bottom:6px;
}
.fx-actions-left,.fx-actions-right{display:flex;gap:8px;flex-wrap:wrap}
.fx-btn{padding:10px 12px;border-radius:12px;background:#2a2f45;border:1px solid rgba(255,255,255,.12);color:#fff;cursor:pointer}
.fx-btn.primary{background:rgba(16,185,129,.18);min-width:120px}
.fx-btn[disabled]{opacity:.55;cursor:not-allowed;filter:grayscale(.1)}
.fx-x{background:transparent;border:none;color:#fff;font-size:22px;padding:4px 8px;cursor:pointer}
.fx-note{opacity:.75;font-size:12px}

/* --- Animacje UI w walce --- */
@keyframes damageFloat { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-30px) scale(1.2)} }
@keyframes screenShake { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-2px,2px)} 50%{transform:translate(2px,-2px)} 75%{transform:translate(-1px,1px)} }
@keyframes hitFlash { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.5) saturate(1.2)} }
@keyframes critBurst { 0%{opacity:1;transform:scale(0)} 50%{opacity:1;transform:scale(1.2)} 100%{opacity:0;transform:scale(1.5)} }

.damage-number{
  position:absolute;font-weight:bold;font-size:18px;color:#ffcc00;pointer-events:none;z-index:10;
  animation:damageFloat 800ms ease-out forwards;text-shadow:1px 1px 2px rgba(0,0,0,0.8);
}
.damage-number.crit-damage{color:#ff4444;font-size:20px;animation:damageFloat 1000ms ease-out forwards}
.damage-number.crit-damage::after{content:' CRIT!';color:#ffff00}
.attack-shake{animation:screenShake 200ms ease-in-out}
.hit-impact{animation:hitFlash 300ms ease-out}
.particle-burst{position:absolute;width:4px;height:4px;background:#ffff00;border-radius:50%;pointer-events:none;z-index:10;animation:critBurst 600ms ease-out forwards}

@media (max-width:480px){
  .fx-title{font-size:15px}
  .fx-btn{padding:12px 14px}
}
  `;
  const s = el('style'); s.id='fortress-css'; s.textContent = css; document.head.appendChild(s);
}

function closeModal(){
  const m = document.getElementById('fortress-modal');
  if (m) m.remove();
  try { S.tg?.MainButton?.show?.(); } catch(_){}
}


  // ---------- deps / fallback ----------
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
    if (!S.tg) S.tg = global.Telegram?.WebApp || null;
    if (!S.dbg) S.dbg = () => {};
  }

  // ====== COMBAT INTEGRATION (ten sam silnik co Dojo) ======
  function mapPlayerTotals(ps){
    if (!ps) return {
      level:1, strength:10, agility:5, intelligence:5, vitality:5, defense:0, luck:5
    };
    return {
      level: ps.level ?? ps.lvl ?? 1,
      strength: ps.strength ?? ps.str ?? 0,
      agility: ps.agility ?? ps.agi ?? 0,
      intelligence: ps.intelligence ?? ps.int ?? 0,
      vitality: ps.vitality ?? ps.vit ?? 0,
      defense: ps.defense ?? ps.def ?? 0,
      luck: ps.luck ?? ps.lck ?? 0
    };
  }
  function mapBossAsTarget(b){
    b = b || {};
    return {
      hp: b.hpMax ?? b.hp ?? 0,
      defense: b.defense ?? b.def ?? 0,
      level: b.level ?? b.lvl ?? 1,
      resist_pct: b.resist_pct ?? b.resist ?? 0,
      dodge_base_override: b.dodge_base ?? null
    };
  }
  function mapBossAsAttacker(b, bossId = null) {
    b = b || {};
    const n = v => (Number.isFinite(+v) ? +v : null);
    const lvl = n(b.level ?? b.lvl) ?? 1;

    // Priorytet: power z payload lub z map.json (lookup po ID/nazwie)
    let atk =
      n(b.power) ??
      n(b.atk) ?? n(b.attack) ?? n(b.dps) ?? n(b.damage) ?? n(b.strength) ?? n(b.str);

    if (!atk && bossId) {
      const enemies = global.FORTRESS_ENEMIES || global.DATA?.fortress?.enemies || {};
      const encData = global.DATA?.regions?.moon_lab?.gameplay?.floors?.find(f => f.id?.includes(bossId?.split('-')[1]))?.encounters?.find(e => e.id === bossId) || {};
      atk = n(encData.power) ?? n(enemies[bossId]?.power) ?? atk;
    }

    if (atk == null) atk = 10 + 8 * (lvl - 1);
    const critChance = n(b.critChance ?? b.crit ?? b.crit_rate) ?? 0.15;
    const critMult = n(b.critMult ?? b.critMultiplier ?? b.crit_multi) ?? 1.5;
    const pen = n(b.armorPen ?? b.armor_pen ?? b.pen ?? b.arp) ?? (lvl * 0.02);

    return {
      level: lvl,
      strength: atk, atk,
      agility: n(b.agility ?? b.agi) ?? (lvl * 0.5),
      intelligence: n(b.intelligence ?? b.int) ?? (lvl * 0.3),
      vitality: n(b.vitality ?? b.vit) ?? 0,
      defense: n(b.defense ?? b.def) ?? 0,
      luck: n(b.luck) ?? (lvl * 0.2),
      armor_pen: pen, armorPen: pen,
      critChance, critMult,
    };
  }
  async function loadPlayerTotalsFallback(){
    try {
      const st = await S.apiPost('/webapp/state', {});
      const t = st?.stats || st?.totals || st?.playerTotals || st;
      if (t && typeof t === 'object') return t;
    } catch(_){}
    return global.PLAYER_TOTALS || global.PLAYER || { level:1, strength:10, agility:5, intelligence:5, vitality:5, defense:0, luck:5 };
  }

  // === Fortress payload normalizer (akceptuje stare i nowe formaty) ===
  function normalizeFortressPayload(raw){
    if (!raw) return null;

    // 1) Rozpakuj { ok, data } jeśli przyszło z fortress_start()
    let t = (raw && raw.ok !== undefined && raw.data) ? raw.data : raw;

    // 2) Zbuduj kroki w jednolitym kształcie
    let steps = [];
    if (Array.isArray(t.steps)) {
      const s0 = t.steps[0] || {};
      const hasAtt = ('att' in s0);         // 'P' / 'E'
      const hasWho = ('who' in s0);         // 'P' / 'E' / 'you' / 'enemy'
      const hasActor = ('actor' in s0);     // 'you' / 'boss'

      if (hasAtt || hasWho || hasActor) {
        steps = t.steps.map(s => {
          const flag = (s.att ?? s.who ?? s.actor);
          const actor = (flag === 'P' || flag === 'you' || flag === 'player') ? 'you'
                       : (flag === 'E' || flag === 'enemy' || flag === 'boss') ? 'boss'
                       : (String(flag||'').toLowerCase()==='you' ? 'you' : 'boss');
          return {
            actor,
            dmg: Number(s.dmg ?? s.damage) || 0,
            crit: !!(s.crit ?? s.isCrit),
            dodge: !!(s.dodge ?? s.isDodge),
            // obsługa wielu wariantów nazw: php/pHp/p_hp, ehp/eHp/e_hp/b_hp/bhp
            p_hp: Number(s.p_hp ?? s.php ?? s.pHp ?? s.playerHp ?? s.p) || undefined,
            b_hp: Number(s.b_hp ?? s.bhp ?? s.bHp ?? s.enemyHp ?? s.ehp ?? s.eHp ?? s.b) || undefined,
          };
        });
      } else if ('t' in s0 || 'dmg' in s0) {
        // ultra-stary format: {t, who:'P'|'E', dmg, crit, pHp, eHp}
        steps = t.steps.map(s => {
          const actor = (s.who === 'P') ? 'you' : 'boss';
          return {
            actor,
            dmg: Number(s.dmg) || 0,
            crit: !!s.crit,
            dodge: !!s.dodge,
            p_hp: Number(s.pHp ?? s.php ?? s.p_hp) || undefined,
            b_hp: Number(s.eHp ?? s.ehp ?? s.b_hp ?? s.bhp) || undefined,
          };
        });
      }
    }

    // 3) Odczytaj HP left, preferując pola z backendu
    const sObj = t.stats || {};
    let bossHpLeft   = Number(sObj.enemyHpLeft ?? t.enemyHpLeft ?? 0);
    let playerHpLeft = Number(sObj.playerHpLeft ?? t.playerHpLeft ?? 0);

    if (!Number.isFinite(bossHpLeft) || bossHpLeft<=0){
      const lastYou = [...steps].reverse().find(s => s.actor==='you' && Number.isFinite(s.b_hp));
      bossHpLeft = lastYou ? lastYou.b_hp : 0;
    }
    if (!Number.isFinite(playerHpLeft) || playerHpLeft<=0){
      const lastBoss = [...steps].reverse().find(s => s.actor==='boss' && Number.isFinite(s.p_hp));
      playerHpLeft = lastBoss ? lastBoss.p_hp : 0;
    }

    // 4) HP MAX — PRIORYTET z backendu, fallback do wyliczenia ze stepów
    let bossHpMaxPref   = Number(sObj.enemyHpMax ?? t.boss?.hpMax ?? t.enemyHpMax);
    let playerHpMaxPref = Number(sObj.playerHpMax ?? t.playerHpMax);

    const dmgToBoss   = steps.filter(s => s.actor==='you').reduce((a,s)=>a+(s.dmg||0), 0);
    const dmgToPlayer = steps.filter(s => s.actor==='boss').reduce((a,s)=>a+(s.dmg||0), 0);

    let bossHpMax   = Number.isFinite(bossHpMaxPref)   && bossHpMaxPref   > 0 ? bossHpMaxPref   : Math.max(1, Math.round((bossHpLeft||0)   + dmgToBoss));
    let playerHpMax = Number.isFinite(playerHpMaxPref) && playerHpMaxPref > 0 ? playerHpMaxPref : Math.max(1, Math.round((playerHpLeft||0) + dmgToPlayer));

    // 5) Pola prezentacyjne
    const bossName   = t.boss?.name || t.bossName || 'Boss';
    const bossSprite = t.boss?.sprite || t.bossSprite || null;

    // Lvl/Floor: preferuj floorCleared/Attempted z fortress.py
    const level = Number(t.floorCleared ?? t.floorAttempted ?? raw.level ?? 1) || 1;

    // Winner
    const winner = t.result ? (t.result === 'VICTORY' ? 'you' : 'boss') : (raw.winner || 'boss');

    // Rewards → materials
    const mats = {
      scrap: Number(t.rewards?.scrap || 0),
      rune_dust: Number(t.rewards?.rune_dust || 0),
    };
    const firstClear = [];
    Object.keys(t.rewards || {}).forEach(k => {
      if (!['scrap','rune_dust'].includes(k)) firstClear.push(`${k} ×${t.rewards[k]}`);
    });

    const nextLevel = winner === 'you' ? (level + 1) : level;

    return {
      mode: 'fortress',
      level: level,
      boss:   { name: bossName, hpMax: bossHpMax, sprite: bossSprite },
      player: { hpMax: playerHpMax },
      steps,
      winner,
      rewards: { materials: mats, rare: false, firstClear },
      next: { level: nextLevel }
    };
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
            <div class="fx-title" id="fx-title">Moon Lab — Fortress</div>
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
                <span class="fx-chip" id="fx-best" style="display:none" title="Best floor">⭐ Best F —</span>
                <span class="fx-chip" id="fx-attempts" style="display:none" title="Attempts left">🎯 —</span>
              </div>
            </div>
          </div>
          <div class="fx-prog">
            <div class="fx-kv"><b>Encounter</b> <span class="fx-note" id="fx-encLbl">—/—</span></div>
            <div class="fx-bar"><i id="fx-barFill"></i></div>
          </div>
          <!-- Portret przeciwnika -->
          <div class="fx-portrait">
            <img id="fx-enemy" alt="Enemy" src="images/bosses/core_custodian.png">
          </div>
          <!-- Pasek akcji: lewa (Close/Refresh) / prawa (Start) -->
          <div class="fx-actions">
            <div class="fx-actions-left">
              <button class="fx-btn" id="fx-close" type="button">Close</button>
              <button class="fx-btn" id="fx-refresh" type="button">Refresh</button>
            </div>
            <div class="fx-actions-right">
              <button class="fx-btn primary" id="fx-start" type="button" disabled>Start</button>
            </div>
          </div>
          <div class="fx-note" id="fx-hint">Win → next encounter after cooldown; lose → retry same encounter.</div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    try { S.tg?.MainButton?.hide?.(); } catch(_){}
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
    // Awaryjny rebuild starego modala (gdyby się rozjechał)
    if (document.getElementById('fortress-modal') && !document.querySelector('#fx-lvl')) {
      closeModal();
      open();
      return;
    }
    try{
      let st = await S.apiPost('/webapp/building/state', { buildingId: BID });
      if (st && st.data) st = st.data; // tolerancja na wrappery

      // cooldown / status
      const cdRaw = (st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown ?? 0) | 0;
      const cd = Math.max(0, cdRaw);
      const ready =
        !!(st.canFight ?? st.canStart ?? st.ready ?? (st.status && String(st.status).toLowerCase()==='ready')) || cd === 0;

      // poziomy / piętra
      const curFloor = Number.isFinite(+st.currentFloor) ? (+st.currentFloor) : null;
      const bestFloor = Number.isFinite(+st.bestFloor) ? (+st.bestFloor) : null;
      const lvl = st.level ?? st.currentLevel ?? st.nextLevel ?? st.progress?.level ?? (curFloor != null ? (curFloor+1) : 1);

      // boss/opponent
      const nx = st.next || st.progress?.next || st.encounter?.next || st.upcoming || {};
      const bossName = st.nextEncounterName || st.bossName || nx.name || st.nextName || st.nextId || st.next_opponent?.name || '';
      const bossKey  = st.nextEncounterKey || nx.key || st.nextKey || null;

      setText('#fx-next', (bossName || lvl) ? [bossName, lvl ? `(L${lvl})` : ''].filter(Boolean).join(' ') : '—');

      // sprite z STATE (priorytet): bossSprite → nextEncounterKey → bossName
      const spriteRaw = st.bossSprite || st.sprite || nx.sprite || st.nextSprite || null;
      setEnemySprite(spriteRaw || bossKey || bossName);

      // rekomendowany poziom (jeśli jest)
      const recLvlRaw =
        (nx && (nx.recommended_player_level ?? nx.recLevel ?? nx.rec_lvl)) ??
        (st.recommended_player_level ?? st.recLevel ?? null);
      const recLvl = Number(recLvlRaw);
      if (Number.isFinite(recLvl) && recLvl > 0) {
        setText('#fx-hint', `Recommended ~L${Math.round(recLvl)} (gear can offset)`);
      } else {
        setText('#fx-hint', 'Win → next encounter after cooldown; lose → retry same encounter.');
      }

      // próby (opcjonalnie)
      const attemptsLeft = st.attemptsLeft ?? st.attack?.attemptsLeft;
      const atEl = $('#fx-attempts');
      if (atEl){
        atEl.style.display = attemptsLeft != null ? '' : 'none';
        if (attemptsLeft != null) atEl.textContent = `🎯 ${attemptsLeft}`;
      }

      // encounter progress (opcjonalny)
      const encCurRaw = (st.encounterIndex ?? st.encountersDone ?? st.progress?.encounterIndex ?? st.encounter?.index ?? 0)|0;
      const encTotalRaw = (st.encountersTotal ?? st.encountersCount ?? st.progress?.encountersTotal ?? 10)|0;
      const encCur = clamp(encCurRaw + 1, 1, Math.max(1, encTotalRaw));
      const encTot = Math.max(1, encTotalRaw || 10);
      setText('#fx-encLbl', `${encCur}/${encTot}`);
      const pct = clamp(Math.round((encCur-1) / Math.max(1, encTot-1) * 100), 0, 100);
      setWidth('#fx-barFill', pct + '%');

      // ——— Licznik pięter w tytule (F X / totalFloors jeśli znamy total z map.json)
      const titleEl = $('#fx-title');
      if (titleEl) {
        let suffix = '';
        const node = Array.isArray(global.DATA?.nodes)
          ? global.DATA.nodes.find(n => n.buildingId === BID)
          : null;
        const totalFloors = Array.isArray(node?.gameplay?.floors) ? node.gameplay.floors.length : null;

        if (Number.isFinite(curFloor)) {
          suffix = totalFloors ? ` (F ${curFloor+1}/${totalFloors})` : ` (F ${curFloor+1})`;
        }
        titleEl.textContent = 'Moon Lab — Fortress' + suffix;
      }

      // ——— Chip „Best F …”
      const bestEl = $('#fx-best');
      if (bestEl) {
        if (Number.isFinite(bestFloor) && bestFloor >= 0) {
          bestEl.style.display = '';
          bestEl.textContent = `⭐ Best F ${bestFloor + 1}`;
        } else {
          bestEl.style.display = 'none';
        }
      }

      // status + badge
      setText('#fx-lvl', curFloor != null ? `F ${curFloor+1}` : `L ${lvl}`);
      setBadge(ready ? 'Ready' : (cd>0 ? 'Cooldown' : ''));
      setText('#fx-status', ready ? 'Ready' : (cd>0 ? 'Cooldown' : '—'));
      setText('#fx-cd', ready ? '—' : fmtLeft(cd));

      // przycisk Start + licznik
      const btn = $('#fx-start');
      if (!btn) return;
      if (cd>0){
        btn.disabled = true;
        btn.textContent = 'Start';
        let left = cd;
        ticker = setInterval(() => {
          left = Math.max(0, left-1);
          setText('#fx-cd', fmtLeft(left));
          if (!document.getElementById('fortress-modal')) { stopTicker(); return; }
          if (left<=0){
            stopTicker();
            setBadge('Ready');
            setText('#fx-status', 'Ready');
            setText('#fx-cd', '—');
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
    }
  }

  function setBadge(txt){
    const b = $('#fx-badge');
    if (!b) return;
    b.textContent = txt;
    const base = 'rgba(255,255,255,.06)';
    const green = 'rgba(16,185,129,.18)';
    const blue = 'rgba(59,130,246,.18)';
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
      let res = out?.data || out;

      // sprite z odpowiedzi START (jeśli backend zwrócił ścieżkę)
      const startSprite = res?.boss?.sprite || res?.sprite || res?.bossSprite || null;
      if (startSprite) setEnemySprite(startSprite);

      // 1) Spróbuj znormalizować payload (obsłuży fortress_start z backendu)
      let payload = null;
      try { payload = normalizeFortressPayload(res); } catch(_) { payload = null; }

      // 2) Jeśli to fortress i mamy kroki — renderuj; backend zawsze dostarcza steps, więc bez fallbacku
      if (payload && payload.mode === 'fortress') {
        closeModal();
        renderFortressBattle(payload);
        return;
      }

      // 3) Fallback: stary tryb “run” (minuty)
      if (res && (res.minutes || res.durationMinutes)){
        toast(`Run started: ${res.minutes ?? res.durationMinutes} min`);
        await refresh();
        return;
      }

      // 4) Bez rozpoznania — po prostu odśwież
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

  function getPlayerAvatarUrl(data){
  // 1) jeśli kiedyś backend doda w payloadzie — bierzemy to pierwsze
  const direct =
    data?.player?.avatar || data?.playerAvatar ||
    data?.player?.img || data?.playerImg ||
    '';
  if (direct) return String(direct).trim();

  // 2) spróbuj z cache profilu jeśli go trzymasz globalnie
  const p = window.__PROFILE__ || window.lastProfile || window.profileState || window._profile || null;
  const cand1 = [
    p?.characterPng, p?.character, p?.heroImg, p?.heroPng, p?.avatar, p?.avatarPng
  ].filter(Boolean);
  if (cand1[0]) return String(cand1[0]).trim();

  // 3) spróbuj wyciągnąć z DOM (hero-frame / profile / equipped)
  const img =
    document.querySelector('#hero-frame img, #heroFrame img, img#hero-img, img#profile-avatar, #avatarMain img') ||
    document.querySelector('#equippedRoot img, #equippedModal img');
  if (img?.src) return String(img.src).trim();

  return '';
}

function pixiTextureFromUrl(PIXI, url){
  try{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    return PIXI.Texture.from(img);
  }catch(_){
    return PIXI.Texture.from(url);
  }
}
  
  function renderFortressBattle(data){
  // ✅ kill previous PIXI if still alive
  try { globalThis.__FORTRESS_PIXI_CLEANUP__?.(); } catch(_){}
  globalThis.__FORTRESS_PIXI_CLEANUP__ = null;

  injectCss();
  ensureDamageParticles();
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

    <!-- ✅ PIXI STAGE -->
    <div class="fx-stage" id="fb-stage"></div>

    <pre id="fb-board" style="background:rgba(255,255,255,.06);padding:8px;border-radius:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
YOU  [${hpbar(data.player?.hpMax ?? 0, data.player?.hpMax ?? 1)}] ${data.player?.hpMax ?? 0}/${data.player?.hpMax ?? 0}
BOSS [${hpbar(data.boss?.hpMax ?? 0, data.boss?.hpMax ?? 1)}] ${data.boss?.hpMax ?? 0}/${data.boss?.hpMax ?? 0}
    </pre>

    <div id="fb-log" style="max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:4px"></div>

    <div class="fx-actions">
      <div class="fx-actions-left">
        <button class="fx-btn" id="fb-close" type="button">Close</button>
        <button class="fx-btn" id="fb-refresh" type="button">Refresh</button>
      </div>
      <div class="fx-actions-right"></div>
    </div>
  `;

  const wrap = el('div'); wrap.id='fortress-modal';
  const card = el('div','card'); card.style.padding='12px';
  const mask = el('div','mask'); mask.id='fb-mask';
  card.appendChild(cont); wrap.appendChild(mask); wrap.appendChild(card);
  document.body.appendChild(wrap);

  // -------------------------
  // ✅ PIXI MOUNT (optional)
  // -------------------------
  const stageHost = $('#fb-stage', cont);
  if (stageHost){
    stageHost.style.position = 'relative'; // dla DOM damage numbers
  }

  let app = null;
  let bossSpr = null;
  let playerG = null;
  let bossShakeT = 0;
  let playerShakeT = 0;

  function mountPixi(){
  if (!stageHost) return;
  if (app) return; // ✅ guard: don't mount twice
  const PIXI = globalThis.PIXI;
  if (!PIXI || !PIXI.Application) return;
    
    const w = Math.max(240, stageHost.clientWidth  || 360);
    const h = Math.max(180, stageHost.clientHeight || 260);

    app = new PIXI.Application({
      width: w,
      height: h,
      backgroundAlpha: 0,
      antialias: true,
      resolution: (window.devicePixelRatio || 1),
      autoDensity: true
    });

    const view = app.view || app.canvas;
    if (view){
      view.style.width = '100%';
      view.style.height = '100%';
      view.style.display = 'block';
      stageHost.appendChild(view);
    }

    // soft background
const bgPanel = new PIXI.Graphics();
bgPanel.beginFill(0x0b0d12, 0.55).drawRoundedRect(0,0,w,h,14).endFill();
app.stage.addChild(bgPanel);

    // player (left) — ✅ avatar z aktualnego profilu
playerG = new PIXI.Container();

const pUrl = getPlayerAvatarUrl(data);
const radius = 34;

// delikatne tło / ring
const ring = new PIXI.Graphics();
ring.lineStyle(2, 0xffffff, 0.12).drawCircle(0, 0, radius + 2);
const pBg = new PIXI.Graphics();
pBg.beginFill(0x3b82f6, 0.10).drawCircle(0, 0, radius + 6).endFill();
playerG.addChild(pBg, ring);

// jeśli mamy URL avatara → sprite + maska koła
if (pUrl){
  const tex = pixiTextureFromUrl(PIXI, pUrl);
  const spr = new PIXI.Sprite(tex);
  spr.anchor.set(0.5);

  const mask = new PIXI.Graphics();
  mask.beginFill(0xffffff).drawCircle(0, 0, radius).endFill();
  spr.mask = mask;

  playerG.addChild(mask, spr);

  const fit = () => {
    // próbujemy dobrać skalę po załadowaniu tekstury
    const w0 = spr.texture?.width  || spr.texture?.orig?.width  || spr.width  || 1;
    const h0 = spr.texture?.height || spr.texture?.orig?.height || spr.height || 1;
    const s = (radius * 2) / Math.max(1, w0, h0);
    spr.scale.set(s);
  };

  if (spr.texture?.baseTexture?.valid) fit();
  else spr.texture?.baseTexture?.once?.('loaded', fit);
} else {
  // fallback: kółko jeśli nie znaleźliśmy avatara
  const core = new PIXI.Graphics();
  core.beginFill(0xffffff, 0.10).drawCircle(0,0,18).endFill();
  playerG.addChild(core);
}

const pTxt = new PIXI.Text('YOU', { fontFamily:'system-ui', fontSize:12, fill:0xffffff, alpha:0.85 });
pTxt.anchor.set(0.5, 0);
pTxt.x = 0; pTxt.y = 42;
playerG.addChild(pTxt);

playerG.x = Math.round(w * 0.22);
playerG.y = Math.round(h * 0.55);
app.stage.addChild(playerG);

    // boss (right)
    const bossUrl = (data?.boss?.sprite || data?.bossSprite || 'images/bosses/core_custodian.png');
    bossSpr = PIXI.Sprite.from(bossUrl);
    bossSpr.anchor.set(0.5, 0.5);
    bossSpr.x = Math.round(w * 0.74);
    bossSpr.y = Math.round(h * 0.52);

    // fit sprite into area
    const maxW = w * 0.42;
    const maxH = h * 0.70;
    const sx = maxW / Math.max(1, bossSpr.width);
    const sy = maxH / Math.max(1, bossSpr.height);
    const s  = Math.min(1, sx, sy);
    bossSpr.scale.set(s);

    app.stage.addChild(bossSpr);

    const bTxt = new PIXI.Text((data?.boss?.name || 'BOSS'), { fontFamily:'system-ui', fontSize:12, fill:0xffffff, alpha:0.85 });
    bTxt.anchor.set(0.5, 0);
    bTxt.x = bossSpr.x; bTxt.y = bossSpr.y + (maxH * 0.40);
    app.stage.addChild(bTxt);

    // shake ticker
    app.ticker.add(() => {
      if (!app || !bossSpr || !playerG) return;

      if (bossShakeT > 0){
        bossShakeT--;
        bossSpr.x += (Math.random()*6 - 3);
        bossSpr.y += (Math.random()*6 - 3);
      } else {
        bossSpr.x = Math.round((app.renderer.width) * 0.74);
        bossSpr.y = Math.round((app.renderer.height) * 0.52);
      }

      if (playerShakeT > 0){
        playerShakeT--;
        playerG.x += (Math.random()*6 - 3);
        playerG.y += (Math.random()*6 - 3);
      } else {
        playerG.x = Math.round((app.renderer.width) * 0.22);
        playerG.y = Math.round((app.renderer.height) * 0.55);
      }
    });

    // resize
    const onResize = () => {
      if (!app || !stageHost) return;
      const nw = Math.max(240, stageHost.clientWidth  || 360);
      const nh = Math.max(180, stageHost.clientHeight || 260);
      try { app.renderer.resize(nw, nh); } catch(_){}
      // nie przebudowuję całej sceny — tylko reset pozycji bazowych (ticker i tak dopina)
    };
    window.addEventListener('resize', onResize);
    app.__onResize = onResize;
  }

 function destroyPixi(){
  try{
    if (app?.__onResize) window.removeEventListener('resize', app.__onResize);
    if (app){
      const view = app.view || app.canvas;
      app.destroy(true, { children:true, texture:true, baseTexture:true });
      if (view && view.parentNode) view.parentNode.removeChild(view);
    }
  }catch(_){}
  app = null; bossSpr = null; playerG = null;

  // ✅ PATCH 3: clear global cleanup hook (so we don't call stale cleanup)
  try { globalThis.__FORTRESS_PIXI_CLEANUP__ = null; } catch(_){}
}

// DOM particles nad stage
globalThis.Combat.container = stageHost || card;

// mount pixi (jeśli PIXI jest dostępne)
try { mountPixi(); } catch(_){}

// ✅ PATCH 3: expose cleanup hook for next render / closeModal safety
try {
  globalThis.__FORTRESS_PIXI_CLEANUP__ = () => {
    try { destroyPixi(); } catch(_){}
  };
} catch(_){}

try { S.tg?.MainButton?.hide?.(); } catch(_){}

  // -------------------------
  // EVENTS (close / refresh)
  // -------------------------
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) { if (e.target.id==='fb-mask') { destroyPixi(); closeModal(); } return; }

    if (btn.id==='fb-x' || btn.id==='fb-close'){
      destroyPixi();
      closeModal();
      return;
    }

    if (btn.id==='fb-refresh') (async () => {
      try{
        let st = await S.apiPost('/webapp/building/state', { buildingId: BID });
        if (st && st.data) st = st.data;
        destroyPixi();
        closeModal();
        const cd = Math.max(0, (st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown ?? 0)|0);
        toast(cd>0 ? `Cooldown: ${fmtLeft(cd)}` : 'Ready');
      }catch(_){ toast('Error refreshing.'); }
    })();
  });

  const logEl = $('#fb-log', cont);
  const boardEl = $('#fb-board', cont);

  // dmg positions (relative to stageHost)
  function dmgPos(actor){
    const host = stageHost;
    if (!host) return { x: 140, y: 80 };
    const w = host.clientWidth || 360;
    const h = host.clientHeight || 260;
    // actor==='you' => hit boss (right), else boss hits player (left)
    return actor === 'you'
      ? { x: Math.round(w * 0.74), y: Math.round(h * 0.40) }
      : { x: Math.round(w * 0.22), y: Math.round(h * 0.48) };
  }

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
      if (data.next?.level) lines.push(`Next: L${data.next.level}`);
      logEl.insertAdjacentHTML('beforeend', `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.12)">${lines.join('<br>')}</div>`);
      return;
    }

    const s = data.steps[i++];

    if (s.actor==='you'){
      bHp = s.b_hp ?? bHp;
      const youTxt = s.dodge
        ? 'shoot… boss <b>DODGED</b>!'
        : ('hit for <b>' + s.dmg + '</b>' + (s.crit ? ' <i>(CRIT)</i>' : '') + '.');
      logEl.insertAdjacentHTML('beforeend', `<div>▶ You ${youTxt}</div>`);
      if (!s.dodge && s.dmg > 0) bossShakeT = 8;
    } else {
      pHp = s.p_hp ?? pHp;
      const bossTxt = s.dodge
        ? 'attacks… you <b>DODGE</b>!'
        : ('hits for <b>' + s.dmg + '</b>' + (s.crit ? ' <i>(CRIT)</i>' : '') + '.');
      logEl.insertAdjacentHTML('beforeend', `<div>◀ Boss ${bossTxt}</div>`);
      if (!s.dodge && s.dmg > 0) playerShakeT = 8;
    }

    boardEl.textContent =
`YOU  [${hpbar(pHp, data.player?.hpMax ?? 1)}] ${pHp}/${data.player?.hpMax ?? 0}
BOSS [${hpbar(bHp, data.boss?.hpMax ?? 1)}] ${bHp}/${data.boss?.hpMax ?? 0}`;

    logEl.scrollTop = logEl.scrollHeight;

    // ✅ damage numbers (DOM) over stage
    if (!s.dodge && s.dmg > 0) {
      const pos = dmgPos(s.actor);
      try{
        globalThis.Combat.createDamageNumber(pos.x, pos.y, s.dmg, s.crit);
      }catch(_){}
    }

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
  global.Fortress = { init, open, refresh, close: closeModal };
})(window);
