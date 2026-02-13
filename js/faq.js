// /js/faq.js — AAA FAQ (UI-aligned) — full file, ready to paste
(function () {
  // ---------- tiny helpers ----------
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ---------- CONTENT (AAA / Alpha Husky — aligned to your current UI) ----------
  const CONTENT = [
    { key:"quickstart", title:"Quick Start", items:[
      { q:"🐺 What is Alpha Husky?",
        a:"A Telegram-native RPG loop: WebApp UI + bot core. Post-apocalyptic tribal-tech world, real progression, real economy tuning — built live with the Pack." },

      { q:"🧭 How do I start (fast)?",
        a:"Open the official bot → tap Open WebApp → set Profile → run Missions → craft gear in Forge → equip + upgrade → push Moon Lab / Quests." },

      { q:"🧱 The core loop (one line)",
        a:"Missions → materials/shards → Forge → equip/upgrade → stronger runs (Moon Lab / Quests / events) → repeat." },

      { q:"🎮 Is this P2E or a trading game?",
        a:"No. It’s a game first. No promises of profit, no guaranteed returns, no paid hype meta. Token utility (if/when) ships as utility — not a promise." },
    ]},

    { key:"ui", title:"WebApp UI (Where to click)", items:[
      { q:"📱 Where is the game played?",
        a:"Inside the Telegram WebApp. The bot still exists for commands and some flows, but the map + most interactions live in the WebApp." },

      { q:"🧭 Main navigation (your layout)",
        a:"Left rail: Map, Missions, Inventory, Shop, Howlboard, Profile.\nCenter: your hero card (skin + level).\nRight rail: Avatar/Skins, Character, Pets/MyPets, Equipped, Feed.\nBottom-left: the FAQ button.\nBottom-right: 📜 Quests launcher (Mission Board)." },

      { q:"📜 Mission Board button (Quests)",
        a:"That 📜 launcher is Quests (Mission Board). Accept tasks → progress by playing → claim rewards. It’s NOT the same as Missions." },

      { q:"🎥 Background video / animated vibe",
        a:"The background is for atmosphere. On some devices the WebView may show a static background (battery/performance) — gameplay is unaffected." },

      { q:"🌗 Too bright / too dark?",
        a:"The WebApp reads Telegram theme. If contrast looks off, switch Telegram to Dark theme and reopen the WebApp from the bot button." },
    ]},

    { key:"glossary", title:"Glossary (Read once)", items:[
      { q:"✅ Missions vs Mission Board (Quests)",
        a:"Missions = expeditions (start → wait → resolve loot).\nMission Board = Quests (accept → progress → claim rewards).\nTwo different systems." },

      { q:"🧾 Ledger (why we mention it)",
        a:"Ledger is our economy truth layer. Bones/material changes are tracked in an append-only log. It reduces desyncs and supports Season 0 tracking." },

      { q:"🦴 Bones / 🔧 Scrap / 🧪 Rune Dust",
        a:"Bones = main soft currency.\nScrap = crafting/upgrades.\nRune Dust = advanced upgrade paths and higher-tier systems (where enabled)." },

      { q:"🔷 Shards",
        a:"Slot fragments (weapon/armor/helmet/ring/offhand/cloak/collar/gloves/fangs, etc.). Craft real gear from shards in Forge → Shards." },
    ]},

    { key:"missions", title:"Missions (Expeditions)", items:[
      { q:"🧭 What are Missions?",
        a:"Timed expeditions. Start one, wait for the timer, then resolve for Bones + materials + shard rolls (and occasional special drops/events)." },

      { q:"⏳ Why can’t I resolve yet?",
        a:"Because the timer isn’t finished. If you tap Resolve early, you should see remaining time / a ‘Ready at’ moment." },

      { q:"🏆 What affects mission results?",
        a:"Your totals (level + spent stats + gear + pet). A balanced upgraded set beats a single over-invested item." },

      { q:"🧠 Best early progress advice",
        a:"Run Missions daily, craft missing slots first, then upgrade ★ steadily. Salvage smart. Keep momentum." },
    ]},

    { key:"questboard", title:"Mission Board (Quests)", items:[
      { q:"📜 What is Mission Board?",
        a:"Quest system: accept tasks, progress by playing, then claim rewards. It’s the structure layer that nudges you into Missions/Dojo/Moon Lab loops." },

      { q:"🔁 Why do quests rotate?",
        a:"To prevent one-button farming and keep the economy healthy. Some quests are daily, some repeatable, some story/event-gated." },

      { q:"⚠️ Quest progress didn’t update",
        a:"First: close and reopen the WebApp to refresh state. If still wrong, report it with: your @handle, quest name, what you did, and a screenshot." },
    ]},

    { key:"moonlab", title:"Moon Lab (Fortress)", items:[
      { q:"🌕 What is Moon Lab?",
        a:"Boss ladder mode. You push floors/encounters with increasing difficulty. It’s your ‘can my build actually fight?’ checkpoint." },

      { q:"⏳ Why does Moon Lab have cooldowns?",
        a:"To pace attempts and protect the economy. It’s meant to be meaningful, not spam-clickable." },

      { q:"🎯 What should I do before pushing Moon Lab?",
        a:"Craft a full set, upgrade key pieces, bring a real pet, and invest in survivability if you get deleted (build matters)." },
    ]},

    { key:"dojo", title:"Dojo (Training)", items:[
      { q:"🥋 What is Dojo?",
        a:"A timed DPS lab (often 30/60s). Test builds, compare upgrades, chase personal bests. It’s for benchmarking, not farming." },

      { q:"💸 Does Dojo cost anything?",
        a:"Dojo is designed as a test mode first. Costs/cooldowns (if present) are tuned to stop it becoming a farm." },
    ]},

    { key:"inventory", title:"Inventory, Equipped & Gear", items:[
      { q:"🎒 Inventory vs Equipped (why people get confused)",
        a:"Inventory holds what you own. Equipped is what you wear right now. If you can’t find an item, check both panels." },

      { q:"🧩 Equip / Unequip",
        a:"Equipping updates your totals immediately. If the UI looks stale, refresh the panel or reopen the WebApp." },

      { q:"⭐ Stars (★) and upgrades",
        a:"Stars are item power upgrades. The game is tuned around slowly pushing ★ across your set — not gambling for perfection." },

      { q:"🧹 Salvage & duplicates",
        a:"Extra copies can be converted into materials. Locks protect the item types you never want auto-touched." },
    ]},

    { key:"forge", title:"Forge → Shards", items:[
      { q:"🔷 What does ‘Forge → Shards’ do?",
        a:"Turns shards into real gear. Shards are slot-specific, so you craft exactly what you need (weapon/armor/etc.)." },

      { q:"🎲 Is crafting pure RNG?",
        a:"It’s controlled RNG with tuning and safety rails (depending on current build). The goal is progress — not casino pain." },

      { q:"🧠 Best crafting strategy",
        a:"Fill missing slots first, then upgrade. A complete upgraded set scales better than endless single-slot crafting." },
    ]},

    { key:"materials", title:"Materials & Economy", items:[
      { q:"🧪 What materials exist?",
        a:"Bones (currency), Scrap (craft/upgrade), Rune Dust (advanced), Slot Shards (crafting fragments), plus seasonal/key shards for gates (when enabled)." },

      { q:"📦 How do I get them?",
        a:"Mostly from Missions, quests, Moon Lab, boxes and events. Rewards are ledger-tracked, then reflected into your UI state." },

      { q:"🧾 Why ledger-first?",
        a:"Because it’s safer for a live MVP: fewer desyncs, easier audits, clearer Season 0 tracking." },
    ]},

    { key:"pets", title:"Pets & Arena", items:[
      { q:"🐾 Do pets matter?",
        a:"Yes. Pets add real stats and can change how your build feels. They’re not just cosmetics." },

      { q:"🏠 Adoption Center",
        a:"Separate pet acquisition flow (not just shop spam). If you don’t see it yet, it’s phased rollout." },

      { q:"⚔️ Pet Arena archetypes (Feral / Trickster / Mystic)",
        a:"Arena uses a light rock-paper-scissors bias: Feral > Trickster, Trickster > Mystic, Mystic > Feral. Small edge, not an auto-win." },

      { q:"🎞️ Arena replay looks weird / placeholder",
        a:"Sometimes visuals lag behind updates. Reopen the WebApp. If still broken, report with screenshot + your @handle." },
    ]},

    { key:"profile", title:"Profile, Skins & Cosmetics", items:[
      { q:"🎭 What are skins?",
        a:"Cosmetic avatar looks. They change vibe, not raw power. Some are earned, some seasonal, some special." },

      { q:"🏷️ Nickname / profile customization",
        a:"Set your displayed identity via Profile tools/unlocks. If something is gated, it’s intentional (season, item, progression)." },

      { q:"🖼️ Character / Equipped visuals",
        a:"Your character panel shows your current look + equipped slots. If icons look off after an update, reopen the WebApp (Telegram caching happens)." },
    ]},

    { key:"share", title:"Share Cards", items:[
      { q:"🖼️ What are Level Up Share Cards?",
        a:"Shareable images generated from your live profile (Style I/II/III). Pure social proof: show progress without editing screenshots." },

      { q:"📤 How do I use them?",
        a:"Open your profile/hero area and tap Share I/II/III after profile loads. If it fails once, reopen the WebApp and try again." },
    ]},

    { key:"pack", title:"Pack & Community", items:[
      { q:"🐺 Why ‘Pack’ matters here",
        a:"Alpha Husky is built with the community. Feedback turns into patches, and real testers get recognized over time." },

      { q:"🤝 Referrals (simple rules)",
        a:"Invite real people. No bots, no fake accounts, no spam. If you try to game it, you’ll just burn your own rep." },
    ]},

    { key:"season0", title:"Season 0 & Resets", items:[
      { q:"🧪 What is Season 0?",
        a:"The live test season. We ship systems, gather data, fix exploits, tune economy, and track activity fairly. It’s foundations — not hype." },

      { q:"🧼 What is a ‘Purge’ / reset?",
        a:"A planned cleanup before full launch to remove broken progress/economy artifacts. Real OG identity and contributions are the priority." },

      { q:"🏅 What will be preserved?",
        a:"OG status + legit badges/contribution recognition + whatever mapping we document publicly before any reset. Honest testers won’t get rugged." },
    ]},

    { key:"token", title:"Token (Status & Philosophy)", items:[
      { q:"🪙 Is the token live?",
        a:"Not yet. Token steps happen only after gameplay sinks/sources and stability are solid. No stealth launch. No ‘trust me bro’." },

      { q:"🎯 How will token connect to the game?",
        a:"As utility (optional sinks, access, cosmetics/events), not as a promised return. Details are shared only when locked and documented." },
    ]},

    { key:"trouble", title:"Troubleshooting", items:[
      { q:"🔄 After an update, things look outdated",
        a:"Close the WebApp completely and reopen from the bot button. Telegram can cache old UI state." },

      { q:"🧠 UI looks broken / missing buttons / cut off bottom",
        a:"Reopen the WebApp. If it persists, screenshot the exact sheet (Missions / Quests / Shop / Inventory) and send it — we fix UI from real device reports." },

      { q:"🧾 Numbers look wrong (Bones/materials)",
        a:"Refresh/reopen first. If still wrong, report: your @handle, what you did (buy/craft/resolve), and a screenshot. Ledger lets us audit exactly what happened." },

      { q:"🖼️ Icons/images not loading",
        a:"If something shows placeholder: reopen the WebApp from the bot. If it’s still broken, report with a screenshot and what item it was (name/slot). Image paths can be fixed fast when we know exactly what failed." },

      { q:"📱 Performance tips",
        a:"Close other heavy apps, disable battery saver, and reopen from the official bot. Animated backgrounds may downgrade to static on low-power devices." },
    ]},

    { key:"safety", title:"Safety & Support", items:[
      { q:"🔒 Security basics",
        a:"We will never DM you for seed phrases or private keys. Only trust the official bot/WebApp link from the community." },

      { q:"🐞 How to report a bug (fast, actionable)",
        a:"Send: (1) your Telegram @handle, (2) step-by-step clicks, (3) expected vs actual, (4) screenshot/video, (5) approximate time. If it’s UI, mention device (iOS/Android/Desktop)." },

      { q:"📄 Beta disclaimer",
        a:"This is a live MVP/Beta. Systems tune, numbers change, bugs happen. We patch fast and ship — that’s the deal." },
    ]},
  ];

  // export content
  const FAQ_CONTENT = CONTENT;
  window.FAQ_CONTENT = FAQ_CONTENT;

  // optional refresh hook
  if (window.FAQ && typeof window.FAQ.refresh === "function") {
    try { window.FAQ.refresh(); } catch {}
  }

  // ---------- style injection: high z-index + accordion fix ----------
  (function injectStyles(){
    if (document.getElementById("faq-inline-style")) return;
    const css = `
      #faqModal{ position:fixed; inset:0; z-index:2147483651; display:none; background:transparent; }
      #faqModal.open{ display:block; }
      /* click works inside sheet, backdrop closes */
      #faqModal .faq-sheet{ pointer-events:auto; }
      #faqModal .faq-backdrop{ pointer-events:auto; }
      /* accordion */
      .faq-item .faq-a{ display:none; }
      .faq-item[open] .faq-a{ display:block; }
      /* avoid global blurs over FAQ */
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
    return String(a || "")
      .replace(/`([^`]+)`/g,"<code>$1</code>")
      .replace(/\b\/[a-zA-Z_]+/g, m=>`<kbd>${m}</kbd>`)
      .replace(/\n/g,"<br>");
  }

  // ---------- FAQ controller ----------
  const FAQ = {
    state:{ section:null, query:"" },
    content: window.FAQ_CONTENT || FAQ_CONTENT,
    apiPost:null, tg:null, dbg:null,
    _escHandler:null,

    init({ apiPost, tg, dbg } = {}){
      this.apiPost = apiPost; this.tg = tg; this.dbg = dbg;

      // optional remote content (if you ever add it)
      fetch('/webapp/faq', { method:'GET' })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(json => {
          if (Array.isArray(json)) this.content = json;
          else if (json && Array.isArray(json.sections)) this.content = json.sections;
          this._maybeRerender();
        })
        .catch(()=>{/* fallback local */});

      // openers
      ['btnFaq','fabFaq'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', (e)=>{ e.preventDefault(); this.open(); });
      });

      // close (backdrop or close button)
      const modal = $('#faqModal');
      modal?.addEventListener('click', e => {
        if (e.target.closest('.faq-close') || e.target.hasAttribute('data-close')){
          e.preventDefault(); this.close();
        }
      });

      // search
      $('#faqSearch')?.addEventListener('input', e => {
        this.state.query = e.target.value.trim();
        this.renderList();
      });

      // tabs
      this.renderTabs();

      // deep links
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
      try { this.apiPost?.('/webapp/telemetry', { event:'faq_open' }); } catch {}
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
        b.className='faq-tab';
        b.setAttribute('role','tab');
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
        .filter(it => !q || it.q.toLowerCase().includes(q) || String(it.a||"").toLowerCase().includes(q))
        .forEach((it,i)=>{
          const item=document.createElement('section');
          item.className='faq-item';
          item.id=`${sec.key}-${i}`;

          const btn=document.createElement('button');
          btn.type='button';
          btn.className='faq-q';
          btn.setAttribute('aria-expanded','false');

          const title=document.createElement('span');
          title.textContent=it.q;

          btn.appendChild(title);
          btn.appendChild(chevron());

          btn.addEventListener('click', (e)=>{
            e.preventDefault();
            const open=item.hasAttribute('open');
            $$('.faq-item',wrap).forEach(n=>n.removeAttribute('open'));
            $$('.faq-q',wrap).forEach(n=>n.setAttribute('aria-expanded','false'));
            if (!open){
              item.setAttribute('open','');
              btn.setAttribute('aria-expanded','true');
            }
          });

          const body=document.createElement('div');
          body.className='faq-a';
          body.innerHTML=renderAnswer(it.a);

          item.appendChild(btn);
          item.appendChild(body);
          wrap.appendChild(item);
        });
    },

    _maybeRerender(){
      if ($('#faqModal')?.classList.contains('open')) {
        this.renderTabs(); this.renderList();
      }
    },

    refresh(){
      // optional external refresh hook
      this.renderTabs();
      this.renderList();
    }
  };

  // auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FAQ.init());
  } else {
    FAQ.init();
  }
})();