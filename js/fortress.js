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
/* --- nowy pasek akcji --- */
.fx-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)}
.fx-actions-left,.fx-actions-right{display:flex;gap:8px;flex-wrap:wrap}
.fx-btn{padding:10px 12px;border-radius:12px;background:#2a2f45;border:1px solid rgba(255,255,255,.12);color:#fff;cursor:pointer}
.fx-btn.primary{background:rgba(16,185,129,.18);min-width:120px}
.fx-btn[disabled]{opacity:.55;cursor:not-allowed;filter:grayscale(.1)}
.fx-x{background:transparent;border:none;color:#fff;font-size:22px;padding:4px 8px;cursor:pointer}
.fx-note{opacity:.75;font-size:12px}
/* --- Fortress enemy portrait --- */
.fx-portrait{position:relative;display:grid;place-items:center;min-height:220px;border-radius:14px;
  background:radial-gradient(60% 60% at 50% 60%, rgba(255,255,255,.06), rgba(0,0,0,0));overflow:hidden}
#fx-enemy{max-width:min(46vh,440px);max-height:min(46vh,440px);object-fit:contain;
  filter:drop-shadow(0 14px 28px rgba(0,0,0,.45))}
/* --- Animacje UI w walce --- */
@keyframes damageFloat {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) scale(1.2); }
}
@keyframes screenShake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-1px, 1px); }
}
@keyframes hitFlash {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.5) saturate(1.2); }
}
@keyframes critBurst {
  0% { opacity: 1; transform: scale(0); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1.5); }
}
.damage-number {
  position: absolute;
  font-weight: bold;
  font-size: 18px;
  color: #ffcc00;
  pointer-events: none;
  z-index: 10;
  animation: damageFloat 800ms ease-out forwards;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}
.damage-number.crit-damage {
  color: #ff4444;
  font-size: 20px;
  animation: damageFloat 1000ms ease-out forwards;
}
.damage-number.crit-damage::after {
  content: ' CRIT!';
  color: #ffff00;
}
.attack-shake { animation: screenShake 200ms ease-in-out; }
.hit-impact  { animation: hitFlash 300ms ease-out; }
.particle-burst {
  position: absolute; width: 4px; height: 4px; background: #ffff00; border-radius: 50%;
  pointer-events: none; z-index: 10; animation: critBurst 600ms ease-out forwards;
}
@media (max-width:480px){
  .fx-title{font-size:15px}
  .fx-actions{position:sticky;bottom:0;background:linear-gradient(180deg,transparent,rgba(12,14,18,.96) 30%);padding-bottom:6px}
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
  async function simulateFortressBattle(serverPayload, bossId = null){
    if (!global.Combat) return null;
    const seed = (serverPayload?.runId || serverPayload?.run_id || Date.now())
               + ':' + (S.tg?.initDataUnsafe?.user?.id || 'u');
    global.Combat.init({ seed, feedHook: null, cfg: global.COMBAT_CFG || undefined });
    // gracz
    const playerTotalsRaw = serverPayload?.playerTotals || serverPayload?.player?.totals || await loadPlayerTotalsFallback();
    const att = mapPlayerTotals(playerTotalsRaw);
    const pHpMax = global.Combat.computePlayerMaxHp(att, att.level);
    // boss
    const bossRaw = serverPayload?.boss || serverPayload?.next || serverPayload?.enemy || {};
    const bossName = bossRaw?.name || serverPayload?.bossName || 'Boss';
    const tgt = mapBossAsTarget(bossRaw);
    let bHpMax = Number(bossRaw.hpMax ?? bossRaw.hp);
    if (!Number.isFinite(bHpMax) || bHpMax <= 0) {
      bHpMax = global.Combat.computeEnemyMaxHp(tgt);
    }
    tgt.hp = bHpMax;
    const bossAtt = mapBossAsAttacker(bossRaw, bossId);
    if (bHpMax <= 0) {
      tgt.hp = global.Combat.computeEnemyMaxHp({ ...tgt, id: bossId });
      bHpMax = tgt.hp;
    }
    // pętla rund
    const maxRounds = (global.Combat.cfg().MAX_ROUNDS || 12);
    const steps = [];
    let pHp = pHpMax, bHp = bHpMax;
    for (let r=0; r<maxRounds && pHp>0 && bHp>0; r++){
      const h1 = global.Combat.rollHit(att, tgt, { round:r, actor:'you' });
      bHp = Math.max(0, bHp - h1.dmg);
      steps.push({ actor:'you', dmg:h1.dmg, crit:h1.isCrit, dodge:h1.dodged, b_hp:bHp });
      if (bHp <= 0) break;
      const youTarget = {
        defense: att.defense,
        level: att.level,
        hp: pHp,
        resist_pct: Number((playerTotalsRaw && (playerTotalsRaw.resist_pct ?? playerTotalsRaw.resist)) || 0),
        dodge_base_override: null,
      };
      const h2 = global.Combat.rollHit(bossAtt, youTarget, { round:r, actor:'boss' });
      pHp = Math.max(0, pHp - h2.dmg);
      steps.push({ actor:'boss', dmg:h2.dmg, crit:h2.isCrit, dodge:h2.dodged, p_hp:pHp });
    }
    const winner = (bHp <= 0) ? 'you' : (pHp <= 0 ? 'boss' : 'boss');
    return {
      mode: 'fortress',
      level: tgt.level || 1,
      boss: { name: bossName, hpMax: bHpMax },
      player: { hpMax: pHpMax },
      steps,
      winner
    };
  }

  // === Fortress payload normalizer (akceptuje stare i nowe formaty) ===
  function normalizeFortressPayload(raw){
    if (!raw) return null;

    // 1) Rozpakuj { ok, data } jeśli przyszło z fortress_start()
    let t = (raw && raw.ok !== undefined && raw.data) ? raw.data : raw;

    // 2) Zbuduj kroki w jednolitym kształcie
    let steps = [];
    if (Array.isArray(t.steps)) {
      if (t.steps[0] && ('att' in t.steps[0])) {
        // format: {t, att:'P'|'E', dmg, crit, php, ehp}
        steps = t.steps.map(s => ({
          actor: s.att === 'P' ? 'you' : 'boss',
          dmg: Number(s.dmg) || 0,
          crit: !!s.crit,
          dodge: !!s.dodge,
          b_hp: s.att === 'P' ? (Number(s.ehp) || 0) : undefined,
          p_hp: s.att === 'E' ? (Number(s.php) || 0) : undefined,
        }));
      } else if (t.steps[0] && ('actor' in t.steps[0])) {
        // już w nowym kształcie
        steps = t.steps.map(s => ({
          actor: s.actor === 'you' ? 'you' : 'boss',
          dmg: Number(s.dmg) || 0,
          crit: !!s.crit,
          dodge: !!s.dodge,
          b_hp: Number(s.b_hp ?? s.bhp ?? s.b) || undefined,
          p_hp: Number(s.p_hp ?? s.php ?? s.p) || undefined,
        }));
      }
    }

    // 3) Oszacuj HP max (z sum obrażeń + HP na końcu)
    const dmgToBoss   = steps.filter(s => s.actor==='you').reduce((a,s)=>a+(s.dmg||0), 0);
    const dmgToPlayer = steps.filter(s => s.actor==='boss').reduce((a,s)=>a+(s.dmg||0), 0);

    let bossHpLeft   = Number(t.stats?.enemyHpLeft ?? t.enemyHpLeft ?? 0);
    let playerHpLeft = Number(t.stats?.playerHpLeft ?? t.playerHpLeft ?? 0);

    if (!Number.isFinite(bossHpLeft) || bossHpLeft<=0){
      const lastYou = [...steps].reverse().find(s => s.actor==='you' && Number.isFinite(s.b_hp));
      bossHpLeft = lastYou ? lastYou.b_hp : 0;
    }
    if (!Number.isFinite(playerHpLeft) || playerHpLeft<=0){
      const lastBoss = [...steps].reverse().find(s => s.actor==='boss' && Number.isFinite(s.p_hp));
      playerHpLeft = lastBoss ? lastBoss.p_hp : 0;
    }

    const bossHpMax   = Math.max(1, Math.round((bossHpLeft||0)   + dmgToBoss));
    const playerHpMax = Math.max(1, Math.round((playerHpLeft||0) + dmgToPlayer));

    // 4) Pola prezentacyjne
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

      // 2) Jeśli to fortress i mamy kroki — renderuj; jeśli brak kroków, policz lokalnie
      if (payload && payload.mode === 'fortress') {
        if (!Array.isArray(payload.steps) || !payload.steps.length){
          try {
            const bossId = res?.boss?.id || res?.encounterId || res?.next?.id || null;
            const sim = await simulateFortressBattle(res, bossId);
            if (sim) payload = sim;
          } catch(e){ S.dbg('local sim fail', e); }
        }
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

  function renderFortressBattle(data){
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
      <pre id="fb-board" style="background:rgba(255,255,255,.06);padding:8px;border-radius:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
YOU [${hpbar(data.player?.hpMax ?? 0, data.player?.hpMax ?? 1)}] ${data.player?.hpMax ?? 0}/${data.player?.hpMax ?? 0}
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

    global.Combat.container = card;
    try { S.tg?.MainButton?.hide?.(); } catch(_){}

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
    const portrait = cont.querySelector('.fx-portrait img') || boardEl;

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
      let targetEl = portrait;
      if (s.actor === 'boss') targetEl = boardEl;

      if (s.actor==='you'){
        bHp = s.b_hp;
        const youTxt = s.dodge
          ? 'shoot… boss <b>DODGED</b>!'
          : ('hit for <b>' + s.dmg + '</b>' + (s.crit ? ' <i>(CRIT)</i>' : '') + '.');
        logEl.insertAdjacentHTML('beforeend', `<div>▶ You ${youTxt}</div>`);
      } else {
        pHp = s.p_hp;
        const bossTxt = s.dodge
          ? 'attacks… you <b>DODGE</b>!'
          : ('hits for <b>' + s.dmg + '</b>' + (s.crit ? ' <i>(CRIT)</i>' : '') + '.');
        logEl.insertAdjacentHTML('beforeend', `<div>◀ Boss ${bossTxt}</div>`);
      }

      boardEl.textContent =
`YOU [${hpbar(pHp, data.player?.hpMax ?? 1)}] ${pHp}/${data.player?.hpMax ?? 0}
BOSS [${hpbar(bHp, data.boss?.hpMax ?? 1)}] ${bHp}/${data.boss?.hpMax ?? 0}`;

      logEl.scrollTop = logEl.scrollHeight;

      if (s.dmg > 0) {
        const rect = targetEl.getBoundingClientRect();
        const containerRect = card.getBoundingClientRect();
        global.Combat.createDamageNumber(
          rect.left - containerRect.left + rect.width / 2,
          rect.top - containerRect.top + rect.height / 2,
          s.dmg,
          s.crit
        );
      }
      if (targetEl) {
        targetEl.classList.add('attack-shake', 'hit-impact');
        setTimeout(() => targetEl.classList.remove('attack-shake', 'hit-impact'), 300);
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
