// /js/faq.js — complete, fixed, ready to paste
(function () {
  // ---------- tiny helpers ----------
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ---------- CONTENT (Twoje) ----------
  const CONTENT = [
    { key:"quickstart", title:"Quick Start", items:[
      { q:"🐺 What is Alpha Husky?",
        a:"A lean, post-apocalyptic, tribal-tech Telegram mini-game and brand. We ship first, talk later. Play via the Telegram WebApp." },
      { q:"🧭 How do I start?",
        a:"Open the WebApp, set your Profile, then explore the map. Run a Mission, test the Dojo, or challenge the Moon Lab fortress to earn Bones and materials." },
      { q:"🔁 Core loop in one line",
        a:"Missions/Dojo → earn materials → Forge shards → upgrade gear (and pets) → push deeper content (Moon Lab, quests) → repeat. Momentum must be maintained." },
    ]},

    { key:"commands", title:"Commands", items:[
      { q:"📊 /stats",
        a:"Shows your totals (base + pet + gear + sets view) and HP/XP bars. Internally we compute everything from a single pipeline so all modes match." },
      { q:"🛠️ /mystats",
        a:"Interactive stat upgrades (+1 per tap) using your unspent points. Immediate recalc of totals." },
      { q:"🦴 /feed",
        a:"Feed your husky (standard cooldown). The 'Turbo Bone' (*double_feed*) item lets you eat twice in a row with no cooldown (2 uses)." },
      { q:"🏷️ /setnick",
        a:"Unlock via a shop item with effect 'custom_nick', then use this command to set your nickname/color/glow." },

      // NEW: pełna lista dla graczy
      { q:"📜 All player commands",
        a:
`• /start — Start the game / onboarding
• /setprofile — set up your nickname
• /badges — see your badges collection
• /mission — start or check your daily mission
• /inventory — view your items
• /materials — view Scrap, Rune Dust and Shards
• /shop — browse and buy items
• /feed — feed Alpha Husky and earn Bones
• /howlboard — view the top of the Pack
• /mystats — detailed stats + spend stat points
• /equip — equip an item to your character
• /equipped — view your equipped gear
• /pets — manage your pets
• /adopt — adoption center for pets
• /achievements — unlocked achievements
• /settitle — change your profile title
• /daily — claim your daily bonus
• /dailyhowl — claim your daily presence
• /huskyhelp — list all available commands

// Forge Week — inventory & forge
• /lock — lock an item type (protect from salvage/dupe)
• /unlock — unlock a previously locked item type
• /locks — list your locked item types
• /salvage — dismantle an item into Scrap/Dust
• /bulk_dismantle — bulk salvage by filter (e.g. rarity=common,uncommon keep=0)
• /craft — craft gear from shards: /craft <slot> [count] [refine N]

// Tips
• Example bulk: /bulk_dismantle rarity=common,uncommon keep=0
• Example craft: /craft weapon 5 refine 2
• Some commands may be gated by cooldowns or role (beta).`
      },
    ]},  // ← ważny przecinek

    { key:"map", title:"Map & Activities", items:[
      { q:"🗺️ What can I do on the map?",
        a:"• Missions (solo/coop) • Moon Lab (boss ladder) • Dojo (DPS timer) • Daily Quests (Mission Board) • Shop/Forge • Event nodes when live." },
      { q:"⏳ Why cooldowns?",
        a:"Some activities (e.g., Moon Lab) pace attempts with cooldowns to reward consistency and balance the economy." },
    ]},

    { key:"materials", title:"Materials & Ledger", items:[
      { q:"🧪 Material types",
        a:"• Bones (soft currency, ledger-based) • Scrap (craft) • Rune Dust (from ★3+ or salvage) • Slot Shards (weapon/armor/helmet/ring/offhand/cloak/collar/gloves/fangs...) • Universal/Region Key Shards (map unlocks)." },
      { q:"📦 How to get them?",
        a:"Missions & events, Daily Quests, and boxes. Mystery/Premium/Legendary boxes grant multiple rolls for Bones/Scrap/Rune Dust/Shards; drops are mirrored from the ledger into your UI. The Shop rotates consumables daily." },
      { q:"🧾 Where to check balances?",
        a:"Open the WebApp (Materials) or use /materials if available — values reflect the ledger snapshot." }
    ]},

    { key:"forge", title:"Forge & Shards", items:[
      { q:"🔷 What are Shards?",
        a:"Slot-specific fragments (weapon, armor, helmet, ring, offhand, cloak, collar, gloves, fangs, rune...). Use Forge → Shards to craft/upgrade items." },
      { q:"⚖️ How fair is crafting?",
        a:"80/20 RNG with pity at 5 attempts and optional refine bonus. Costs use Bones/Scrap and Rune Dust (from ★3) to keep progression fair." },
      { q:"⭐ Stars, reforge, fuse?",
        a:"Upgrades raise ★ up to 5. Reforge/Fuse exist with sensible daily limits to stabilize the economy." },
    ]},

    { key:"stats", title:"Stats, HP & Leveling", items:[
      { q:"📈 Where do my stats come from?",
        a:"Single source of truth: base stats + equipped gear (+pet) → totals → combat. One pipeline across all modes." },
      { q:"❤️ How is HP calculated?",
        a:"HP = 50 + 12×VIT (after base+gear+pet totals). This unified rule fixed the old inconsistencies between modes." },
      { q:"🆙 Leveling & XP",
        a:"Level XP requirement grows linearly: need(lvl) = 100 + 25×(lvl−1). Spend unspent points via /mystats to tailor your build." }
    ]},

    { key:"moonlab", title:"Moon Lab (Fortress)", items:[
      { q:"🌕 What is Moon Lab?",
        a:"A boss-ladder fortress with win/lose cooldowns. Clear floors to push your best run; rewards scale with progress." },
      { q:"🛠️ 1-HP bug status",
        a:"Fixed. Moon Lab now reads the same stat→HP pipeline as Missions (base + gear + pet)." },
    ]},

    { key:"dojo", title:"Dojo (Training)", items:[
      { q:"🥋 What does Dojo do?",
        a:"A timed DPS test (30/60s). Useful to benchmark builds; some quests/events hook into its milestones." },
    ]},

    { key:"shop", title:"Daily Shop", items:[
      { q:"🔄 How does it rotate?",
        a:"Auto-rotation every 24h. Daily pool: 6–8 main items plus up to 3 consumables shown separately. UI displays time to next refresh." },
      { q:"💰 How do prices work?",
        a:"Items can cost Bones or $TOKEN. Purchases are validated and written to an append-only ledger, then mirrored to your balances in UI." },
      { q:"🗝️ Faction locks?",
        a:"Some items may require a faction; non-matching players won’t see those offers." }
    ]},

    { key:"quests", title:"Daily Quests & Progress", items:[
      { q:"📜 How do Daily Quests work?",
        a:"Open the Mission Board, accept tasks, play to progress, then claim rewards. There’s rotation; UI shows requirements and states." },
      { q:"⚠️ Progress not updating?",
        a:"Reopen the WebApp to refresh state. If it persists, drop your username and steps in the Den — we’ll check logs." },
    ]},

    { key:"pets", title:"Pets", items:[
      { q:"🐾 Do pets matter?",
        a:"Yes. Pets contribute stats and bonuses. They level through play; some quests and events feature pet-related tasks." },
    ]},

    { key:"token", title:"Token & TGE", items:[
      { q:"🪙 Is the token live?",
        a:"Not yet. We ship gameplay first. Planned total supply: 25M with 10M locked treasury. No paid hype — community > noise." },
      { q:"🚀 What does TGE mean here?",
        a:"We go live only when utility, sinks/sources, and fair allocations are locked. Details will be announced when ready." },
    ]},

    { key:"safety", title:"Safety, OG & Terms", items:[
      { q:"🔒 Security basics",
        a:"We will never DM for keys. Only use the official bot/WebApp link. Beware fakes." },
      { q:"🛡️ OG / Purge",
        a:"Purge resets progression but preserves OG identity/badges. Early contributors are remembered — the Pack doesn’t forget." },
      { q:"📄 Terms / Privacy",
        a:"MVP/Beta. No promises of financial return. We use gameplay telemetry to balance the game. Links to Terms/Privacy will appear here." },
    ]},
  ];

  // Udostępnij globalnie (renderer tego oczekuje)
  window.FAQ_CONTENT = CONTENT;

  // Opcjonalny refresh jeśli masz taki hook
  if (window.FAQ && typeof window.FAQ.refresh === "function") {
    try { window.FAQ.refresh(); } catch {}
  }


  // ---------- style injection: high z-index + accordion fix ----------
  (function injectStyles(){
    if (document.getElementById("faq-inline-style")) return;
    const css = `
      #faqModal{ position:fixed; inset:0; z-index:2147483651; display:none; background:transparent; }
      #faqModal.open{ display:block; }
      /* klik działa w arkuszu, backdrop zamyka */
      #faqModal .faq-sheet{ pointer-events:auto; }
      #faqModal .faq-backdrop{ pointer-events:auto; }
      /* akordeon */
      .faq-item .faq-a{ display:none; }
      .faq-item[open] .faq-a{ display:block; }
      /* brak globalnych blurów nad treścią FAQ */
      #faqModal, #faqModal *{ -webkit-backdrop-filter:none !important; backdrop-filter:none !important; }
    `;
    const st = document.createElement("style");
    st.id = "faq-inline-style";
    st.textContent = css;
    document.head.appendChild(st);
  })();

  // ---------- SVG + render helpers ----------
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

  // ---------- FAQ controller ----------
  const FAQ = {
    state:{ section:null, query:"" },
    content: FAQ_CONTENT,
    apiPost:null, tg:null, dbg:null,
    _escHandler:null,

    init({ apiPost, tg, dbg } = {}){
      this.apiPost = apiPost; this.tg = tg; this.dbg = dbg;

      // opcjonalne zasilenie z backendu
      fetch('/webapp/faq', { method:'GET' })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(json => {
          if (Array.isArray(json)) this.content = json;
          else if (json && Array.isArray(json.sections)) this.content = json.sections;
          this._maybeRerender();
        })
        .catch(()=>{/* fallback local */});

      // Openers
      ['btnFaq','fabFaq'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', (e)=>{ e.preventDefault(); this.open(); });
      });

      // Close (backdrop lub przycisk)
      const modal = $('#faqModal');
      modal?.addEventListener('click', e => {
        if (e.target.closest('.faq-close') || e.target.hasAttribute('data-close')){
          e.preventDefault(); this.close();
        }
      });
      // Kliki wewnątrz karty nie zamykają
      $('.faq-sheet')?.addEventListener('click', e => e.stopPropagation());

      // Search
      $('#faqSearch')?.addEventListener('input', e => {
        this.state.query = e.target.value.trim();
        this.renderList();
      });

      // Tabs
      this.renderTabs();

      // Deep links
      const p = new URLSearchParams(location.search);
      if (p.get('section') === 'faq' || p.get('faq')){
        this.state.section = p.get('faq') || null;
        this.open();
      } else {
        if (!this.state.section && this.content[0]) this.state.section = this.content[0].key;
        this.renderTabs(); this.renderList();
      }

      // public API
      window.FAQ = this;
      return this;
    },

    open(){
      const m = $('#faqModal'); if (!m) return;
      m.classList.add('open');
      m.removeAttribute('hidden');
      this.apiPost?.('/webapp/telemetry', { event:'faq_open' });
      $('#faqSearch')?.focus({ preventScroll:true });
      this.renderTabs(); this.renderList();
      this._escHandler = (e)=>{ if (e.key === 'Escape') this.close(); };
      document.addEventListener('keydown', this._escHandler);
    },

    close(){
      const m = $('#faqModal'); if (!m) return;
      m.classList.remove('open');
      m.setAttribute('hidden','');
      if (this._escHandler){ document.removeEventListener('keydown', this._escHandler); this._escHandler=null; }
    },

    renderTabs(){
      const tabs = $('#faqTabs'); if (!tabs) return;
      tabs.innerHTML = "";
      this.content.forEach((sec, idx)=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='faq-tab'; b.setAttribute('role','tab');
        const isSelected = (this.state.section ? this.state.section===sec.key : idx===0);
        b.setAttribute('aria-selected', isSelected ? 'true':'false');
        b.textContent=sec.title || sec.key;
        b.addEventListener('click', (e)=>{
          e.preventDefault();
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
            e.preventDefault();
            const open=item.hasAttribute('open');
            $$('.faq-item',wrap).forEach(n=>n.removeAttribute('open'));
            if (!open){ item.setAttribute('open',''); btn.setAttribute('aria-expanded','true'); }
          });

          const body=document.createElement('div'); body.className='faq-a'; body.innerHTML=renderAnswer(it.a);
          item.appendChild(btn); item.appendChild(body); wrap.appendChild(item);
        });
    },

    _maybeRerender(){
      if ($('#faqModal')?.classList.contains('open')) {
        this.renderTabs(); this.renderList();
      }
    }
  };

  // auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FAQ.init());
  } else {
    FAQ.init();
  }
})();
