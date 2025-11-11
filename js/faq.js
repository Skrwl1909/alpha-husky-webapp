// /js/faq.js — FIXED: Null-checks, defer shield, more logs for TypeError
(function () {
  // ---------- tiny helpers ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  // ---------- CONTENT (Twoje) ----------
  let FAQ_CONTENT = [
    { key:"quickstart", title:"Quick Start", items:[
      { q:"What is Alpha Husky?",
        a:"A lean, post-apocalyptic, tribal-tech Telegram mini-game and brand. We ship first, talk later. Play via the Telegram WebApp." },
      { q:"How do I start?",
        a:"Open the WebApp, set your Profile, then explore the map. Run a Mission, test the Dojo, or challenge the Moon Lab fortress to earn Bones and materials." },
      { q:"Core loop in one line",
        a:"Missions/Dojo → earn materials → Forge shards → upgrade gear (and pets) → push deeper content (Moon Lab, quests) → repeat. Momentum must be maintained." },
    ]},
    { key:"map", title:"Map & Activities", items:[
      { q:"What can I do on the map?",
        a:"• Missions (solo/coop) • Moon Lab (boss ladder) • Dojo (DPS timer) • Daily Quests (Mission Board) • Shop/Forge • Event nodes when live." },
      { q:"Why cooldowns?",
        a:"Some activities (e.g., Moon Lab) pace attempts with cooldowns to reward consistency and balance the economy." },
    ]},
    { key:"stats", title:"Stats & Combat", items:[
      { q:"Where do my stats come from?",
        a:"Single source of truth: base stats + equipped gear (+pet) → totals → combat. We compute everything from the same pipeline across modes." },
      { q:"How is HP calculated?",
        a:"HP is derived from VIT using a unified rule so modes match: internally HP ≈ 50 + 12×VIT (after base+gear+pet totals). This fixed past inconsistencies." },
    ]},
    { key:"materials", title:"Materials & Ledger", items:[
      { q:"What are Bones, Scrap, Rune Dust?",
        a:"Bones are the universal soft currency tracked via a ledger. Scrap and Rune Dust are crafting resources. Check true balances in /materials." },
      { q:"Where do I get materials?",
        a:"Missions, boxes, quests, events. The Shop also rotates consumables daily." },
    ]},
    { key:"forge", title:"Forge & Shards", items:[
      { q:"What are Shards?",
        a:"Slot-specific fragments (weapon, armor, helmet, ring, offhand, cloak, collar, gloves, rune, etc.). Use Forge → Shards to craft/upgrade items." },
      { q:"How fair is crafting?",
        a:"Shard crafting uses 80/20 RNG with pity at 5 attempts and an optional refine bonus. Costs: materials (Bones, Scrap, Rune Dust from ★3)." },
      { q:"Stars, reforge, fuse?",
        a:"Upgrades raise ★ up to 5. Reforge/Fuse exist with sensible daily limits to keep progress fair and the economy stable." },
    ]},
    { key:"moonlab", title:"Moon Lab (Fortress)", items:[
      { q:"What is Moon Lab?",
        a:"A boss-ladder fortress with win/lose cooldowns. Clear floors to push your best run; rewards scale with progress." },
      { q:"Why did I see 1-HP before?",
        a:"Fixed. All modes now share the same stat → HP pipeline, so Moon Lab and Missions match your totals (base + gear + pet)." },
    ]},
    { key:"dojo", title:"Dojo (Training)", items:[
      { q:"What does Dojo do?",
        a:"A timed DPS test (30/60s variants). It’s for benchmarking builds and future challenges; some events/quests may hook into its milestones." },
    ]},
    { key:"quests", title:"Daily Quests & Progress", items:[
      { q:"How do Daily Quests work?",
        a:"Open the Mission Board, accept tasks, play to progress, then claim rewards. There’s rotation; UI shows requirements and states." },
      { q:"Progress not updating?",
        a:"Reopen the WebApp to refresh state. If it persists, drop your username and steps in the Den—we’ll check logs." },
    ]},
    { key:"pets", title:"Pets", items:[
      { q:"Do pets matter?",
        a:"Yes. Pets contribute stats and bonuses. They level through play; some quests and events feature pet-related tasks." },
    ]},
    { key:"token", title:"Token & TGE", items:[
      { q:"Is the token live?",
        a:"Not yet. We ship gameplay first. Planned total supply: 25M with 10M locked treasury. No paid hype—community > noise." },
      { q:"What does TGE mean here?",
        a:"We go live only when utility, sinks/sources, and fair allocations are locked. Details will be announced when ready." },
    ]},
    { key:"safety", title:"Safety, OG & Terms", items:[
      { q:"Security basics",
        a:"We will never DM for keys. Only use the official bot/WebApp link. Beware fakes." },
      { q:"OG / Purge",
        a:"Purge resets progression but preserves OG identity/badges. Early contributors are remembered—the Pack doesn’t forget." },
      { q:"Terms / Privacy",
        a:"MVP/Beta. No promises of financial return. We use gameplay telemetry to balance the game. Links to Terms/Privacy will appear here." },
    ]},
  ];
  // ---------- style injection (bez zmian z poprzedniego fixu) ----------
  (function injectStyles(){
    if (document.getElementById("faq-inline-style")) return;
    const css = `
      .faq-overlay{
        position:fixed; inset:0;
        background:rgba(0,0,0,.60);
        -webkit-backdrop-filter:none !important;
        backdrop-filter:none !important;
        z-index:2147483650;
        display:none; pointer-events:auto;
      }
      .faq-overlay.open{ display:block; }
      #faqModal{
        position:fixed; inset:0;
        z-index:2147483651;
        display:none; background:transparent; border:0; padding:0;
        pointer-events:auto;
      }
      #faqModal.open{ display:block; }
      body.faq-open{ overflow:hidden; }
      body.faq-open > *:not(#faqModal):not(.faq-overlay){ pointer-events:none !important; }
      .faq-card{
        width:min(800px,96vw); max-height:86vh; overflow:auto; margin:4vh auto;
        background:rgba(10,10,12,.92);
        border:1px solid rgba(255,255,255,.1); border-radius:14px;
        pointer-events:auto !important;
      }
      .faq-card * { pointer-events:auto !important; }
      .faq-item .faq-a{ display:none; }
      .faq-item[open] .faq-a{ display:block; }
      .faq-header{
        display:grid; grid-template-columns:1fr auto auto; gap:.75rem; align-items:center;
        padding:.9rem 1rem; position:sticky; top:0;
        background:inherit;
        -webkit-backdrop-filter:none !important; backdrop-filter:none !important;
      }
      .faq-header h2{ margin:0; font-size:1.05rem; opacity:.95 }
      .faq-body{ padding:.25rem 1rem 1rem }
      .faq-section{ margin:.75rem 0 1rem }
      .faq-section>h3{ margin:.5rem 0 .25rem; font-size:.95rem; opacity:.8 }
      .faq-item{ border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:.25rem .75rem; margin:.5rem 0; background:rgba(255,255,255,.04) }
      .faq-q{ width:100%; display:flex; align-items:center; justify-content:space-between; gap:.75rem; background:transparent; border:0; color:inherit; padding:.6rem 0; cursor:pointer; font-weight:600; pointer-events:auto !important; }
      .faq-a{ padding:.25rem 0 .75rem; opacity:.95; line-height:1.35 }
      #faqSearch{ width:min(260px,52vw); background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:.5rem .75rem; color:inherit; pointer-events:auto !important; }
      #faqClose{ background:transparent; border:0; color:inherit; font-size:1.2rem; opacity:.75; cursor:pointer; pointer-events:auto !important; }
      .faq-tabs{ display:flex; gap:.4rem; flex-wrap:wrap; margin:.5rem 1rem 0 }
      .faq-tab{ border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); padding:.3rem .6rem; border-radius:9px; cursor:pointer; pointer-events:auto !important; }
      .faq-tab[aria-selected="true"]{ background:rgba(0,229,255,.12); border-color:rgba(0,229,255,.35) }
      #faqModal, #faqModal *{ -webkit-backdrop-filter:none !important; backdrop-filter:none !important; filter:none !important; }
      @media(max-width:520px){ #faqSearch{ width:50vw } }
    `;
    const st = document.createElement("style");
    st.id = "faq-inline-style";
    st.textContent = css;
    document.head.appendChild(st);
  })();
  // ---------- SVG i render utils ----------
  function chevron(){
    const ns="http://www.w3.org/2000/svg";
    const s=document.createElementNS(ns,"svg"); s.setAttribute("width","18"); s.setAttribute("height","18"); s.setAttribute("viewBox","0 0 24 24");
    const p=document.createElementNS(ns,"path"); p.setAttribute("d","M7 10l5 5 5-5"); p.setAttribute("fill","none");
    p.setAttribute("stroke","currentColor"); p.setAttribute("stroke-width","2"); p.setAttribute("stroke-linecap","round"); p.setAttribute("stroke-linejoin","round");
    s.appendChild(p); return s;
  }
  function renderAnswer(a){
    return a.replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\b\/[a-zA-Z_]+/g, m=>`<kbd>${m}</kbd>`);
  }
  // ---------- hard inert helper ----------
  function inertAll(on){
    Array.from(document.body.children).forEach(el=>{
      if (el.id === 'faqModal' || el.classList.contains('faq-overlay')) return;
      on ? el.setAttribute('inert','') : el.removeAttribute('inert');
    });
  }
  // ---------- FIXED shield: bubble phase, null-checks, defer ----------
  let _captures = [];
  function _addCapture(type, fn){ 
    document.addEventListener(type, fn, { passive: false }); // ZMIANA: options dla touch, false = bubble
    _captures.push([type, fn]); 
  }
  function _removeCaptures(){ 
    _captures.forEach(([t,fn])=>document.removeEventListener(t,fn, { passive: false })); 
    _captures=[]; 
  }
  function _makeShield(){
    console.log('FAQ: Making shield...'); // DEBUG
    const guard = (e)=>{
      let modal = document.getElementById('faqModal');
      if (!modal) { console.warn('FAQ: Modal not found in shield!'); return; } // FIXED: Null check
      if (!modal.classList.contains('open')) return; // Bezpieczne po check
      if (modal.contains(e.target)){ 
        console.log('FAQ: Inside modal event allowed', e.type); // DEBUG
        return; 
      }
      console.log('FAQ: Blocking outside event', e.type); // DEBUG
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    };
    ['click', 'touchend'].forEach(t=>_addCapture(t, guard));
  }
  // ---------- FAQ controller ----------
  const FAQ = {
    state:{ section:null, query:"" },
    content: FAQ_CONTENT,
    apiPost:null, tg:null, dbg:null,
    _escHandler:null,
    _overlay:null,
    init({ apiPost, tg, dbg } = {}){
      this.apiPost = apiPost; this.tg = tg; this.dbg = dbg;
      console.log('FAQ: Init started'); // DEBUG
      // fetch /webapp/faq (bez zmian)
      fetch('/webapp/faq', { method:'GET' })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(json => {
          if (Array.isArray(json)) this.content = json;
          else if (json && Array.isArray(json.sections)) this.content = json.sections;
          this._maybeRerender();
        })
        .catch(()=>{/* fallback = local */});
      // overlay
      this._overlay = document.createElement('div');
      this._overlay.className = 'faq-overlay';
      this._overlay.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); this.close(); });
      document.body.appendChild(this._overlay);
      // modal
      let modal = $('#faqModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'faqModal';
        modal.innerHTML = `
          <div class="faq-card">
            <div class="faq-header">
              <h2>FAQ</h2>
              <input id="faqSearch" type="search" placeholder="Search…" autocomplete="off" />
              <button id="faqClose" type="button" class="faq-close" aria-label="Close">×</button>
            </div>
            <div class="faq-tabs" id="faqTabs"></div>
            <div id="faqBody" class="faq-body">
              <div id="faqList"></div>
            </div>
          </div>`;
        document.body.appendChild(modal);
        console.log('FAQ: Modal created and appended'); // DEBUG
      }
      // Openers (bez zmian)
      ['btnFaq','fabFaq'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', (e)=>{ e.preventDefault(); this.open(); });
      });
      // Close
      modal.addEventListener('click', e => { // FIXED: Użyj modal zamiast $('#faqModal')? 
        const closeBtn = e.target.closest('.faq-close,[data-close]');
        if (closeBtn){ 
          console.log('FAQ: Close clicked'); // DEBUG
          e.preventDefault(); e.stopPropagation(); this.close(); 
        }
      });
      // Stop prop inside
      modal.addEventListener('click', e => {
        if (e.target.closest('.faq-card')) { e.stopPropagation(); }
      });
      // Search
      const searchEl = $('#faqSearch');
      if (searchEl) searchEl.addEventListener('input', e => {
        console.log('FAQ: Search:', e.target.value); // DEBUG
        this.state.query = e.target.value.trim();
        this.renderList();
      });
      // Tabs & List
      this.renderTabs();
      this.renderList(); // FIXED: Wywołaj zawsze po init
      // Deep links (bez zmian)
      const p = new URLSearchParams(location.search);
      if (p.get('section') === 'faq' || p.get('faq')){
        this.state.section = p.get('faq') || null;
        this.open();
      } else {
        if (!this.state.section && this.content[0]) this.state.section = this.content[0].key;
      }
      window.FAQ = this;
      console.log('FAQ: Init complete'); // DEBUG
      return this;
    },
    open(){
      let m = $('#faqModal');
      if (!m) { console.error('FAQ: Modal not found on open!'); return; } // FIXED: Null check
      console.log('FAQ: Opening...'); // DEBUG
      document.body.classList.add('faq-open');
      m.classList.add('open'); // Bezpieczne po check
      this._overlay.classList.add('open');
      inertAll(true);
      // FIXED: Defer shield po DOM settle
      setTimeout(() => {
        _makeShield();
        console.log('FAQ: Shield deferred & active'); // DEBUG
      }, 0);
      this.apiPost?.('/webapp/telemetry', { event:'faq_open' });
      const searchEl = $('#faqSearch');
      if (searchEl) searchEl.focus({ preventScroll:true });
      this.renderTabs(); this.renderList();
      this._escHandler = (e)=>{ if (e.key === 'Escape') this.close(); };
      document.addEventListener('keydown', this._escHandler);
      if (this.tg) this.tg.expand();
    },
    close(){
      let m = $('#faqModal');
      if (!m) return; // FIXED: Null check
      console.log('FAQ: Closing...'); // DEBUG
      document.body.classList.remove('faq-open');
      m.classList.remove('open');
      this._overlay.classList.remove('open');
      inertAll(false);
      _removeCaptures();
      if (this._escHandler){ document.removeEventListener('keydown', this._escHandler); this._escHandler=null; }
    },
    renderTabs(){
      const tabs = $('#faqTabs'); if (!tabs) return;
      console.log('FAQ: Rendering tabs'); // DEBUG
      tabs.innerHTML = "";
      this.content.forEach((sec, idx)=>{
        const b=document.createElement('button');
        b.type = 'button';
        b.className='faq-tab'; b.setAttribute('role','tab');
        const isSelected = (this.state.section ? this.state.section===sec.key : idx===0);
        b.setAttribute('aria-selected', isSelected ? 'true':'false');
        b.textContent=sec.title || sec.key;
        b.addEventListener('click', (e)=>{
          console.log('FAQ: Tab clicked:', sec.key); // DEBUG
          e.preventDefault(); e.stopPropagation();
          this.state.section=sec.key;
          $$('.faq-tab',tabs).forEach(x=>x.setAttribute('aria-selected','false'));
          b.setAttribute('aria-selected','true');
          this.renderList();
        });
        tabs.appendChild(b);
      });
      if (!this.state.section && this.content[0]) this.state.section = this.content[0].key;
    },
    renderList(){
      const wrap = $('#faqList'); if (!wrap) return;
      console.log('FAQ: Rendering list for section:', this.state.section); // DEBUG
      wrap.innerHTML="";
      const sec = this.content.find(s=>s.key===this.state.section) || this.content[0];
      if (!sec) return;
      const q = (this.state.query||"").toLowerCase();
      sec.items
        .filter(it => !q || it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q))
        .forEach((it,i)=>{
          const item=document.createElement('section'); item.className='faq-item'; item.id=`${sec.key}-${i}`;
          const btn=document.createElement('button');
          btn.type='button';
          btn.className='faq-q'; btn.setAttribute('aria-expanded','false');
          const title=document.createElement('span'); title.textContent=it.q; btn.appendChild(title); btn.appendChild(chevron());
          btn.addEventListener('click', (e)=>{
            console.log('FAQ: Accordion clicked:', it.q); // DEBUG
            e.preventDefault(); e.stopPropagation();
            const open=item.hasAttribute('open');
            $$('.faq-item',wrap).forEach(n=>n.removeAttribute('open'));
            if (!open){ item.setAttribute('open',''); btn.setAttribute('aria-expanded','true'); }
          });
          const body=document.createElement('div'); body.className='faq-a'; body.innerHTML=renderAnswer(it.a);
          item.appendChild(btn); item.appendChild(body); wrap.appendChild(item);
        });
    },
    _maybeRerender(){
      let m = $('#faqModal');
      if (!m || !m.classList.contains('open')) return; // FIXED: Null + class check
      this.renderTabs(); this.renderList();
    }
  };
  // auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FAQ.init());
  } else {
    FAQ.init();
  }
})();
