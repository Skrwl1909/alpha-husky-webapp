// /js/faq.js — complete, fixed, ready to paste
(function () {
  // ---------- tiny helpers ----------
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

    // ---------- CONTENT (Twoje) ----------
  const CONTENT = [
    { key:"quickstart", title:"Quick Start", items:[
      { q:"🐺 What is Alpha Husky?",
        a:"A lean, post-apocalyptic, tribal-tech Telegram mini-game and brand. We ship first, talk later. Play via the Telegram WebApp on top of Telegram chat." },
      { q:"🧭 How do I start?",
        a:"Open the Alpha Husky bot, tap Open WebApp, set your Profile, then explore the map. Run a Mission, test the Dojo, or challenge the Moon Lab fortress to earn Bones and materials." },
      { q:"🔁 Core loop in one line",
        a:"Missions/Dojo → earn materials → Forge shards → upgrade gear (and pets) → push deeper content (Moon Lab, quests, regions) → repeat. Momentum must be maintained." },
      { q:"🎮 Is this a P2E or trading game?",
        a:"No. Alpha Husky is first and foremost a game + universe. The token side is being prepared carefully; there is no promise of financial return and no paid hype meta." },
    ]},

    { key:"webapp", title:"WebApp & UI", items:[
      { q:"📱 How do I open the game?",
        a:"Go to the official Alpha Husky bot on Telegram and tap the bottom button (Open / Open Game). The dashboard, map, quests and most interactions live inside the WebApp." },
      { q:"🕹️ What do the main buttons do?",
        a:"Left column: Alpha Map, Missions, Inventory, Shop, Howlboard, Profile. Center: your hero card (skin + level). Right: Avatar, Skins, Character, Pets, Equipped, Feed, MyPets. At the bottom-left you’ll find the glowing FAQ button, and on the right the 📜 Quests launcher." },
      { q:"🎥 Why is there a video background?",
        a:"The video/animated background is just for vibe. If your device is slow or saving battery, the WebView may show only the static background instead – that’s normal. Gameplay is not affected." },
      { q:"🌗 UI too bright / dark?",
        a:"The WebApp reads your Telegram theme (dark / light) and colors. If something looks off, try switching Telegram to dark theme and reopen the game." },
    ]},

    { key:"commands", title:"Commands", items:[
      { q:"📊 /stats",
        a:"Shows your totals (base + pet + gear + sets view) and HP/XP bars. Internally we compute everything from a single pipeline so all modes (Missions, Moon Lab, Dojo) match." },
      { q:"🛠️ /mystats",
        a:"Interactive stat upgrades (+1 per tap) using your unspent points. Totals and HP are recalculated immediately." },
      { q:"🦴 /feed",
        a:"Feed your husky (standard cooldown). The 'Turbo Bone' (double_feed) item lets you eat twice in a row with no cooldown for a limited number of uses." },
      { q:"🏷️ /setprofile or /setnick",
        a:"Use the appropriate shop unlock, then adjust your nickname/color/glow. Some cosmetics and titles may be season- or item-gated." },

      { q:"📜 All player commands (core)",
        a:
`• /start — start the game / onboarding
• /setprofile — set up your displayed nickname
• /stats — view your full stats & HP
• /mystats — spend unspent stat points
• /mission — start or check your solo missions
• /inventory — view your items (gear, boxes…)
• /materials — view Bones, Scrap, Rune Dust, Shards
• /shop — browse and buy items
• /feed — feed Alpha Husky and earn Bones
• /howlboard — view the top of the Pack
• /equip — equip an item to your character
• /equipped — view your equipped gear
• /pets — manage your pets
• /achievements — check unlocked achievements
• /daily — claim your daily presence / Bones (if enabled)
• /huskyhelp — show a list of available commands (if enabled on this season)

Forge / inventory helpers:
• /lock — lock an item type (protect from auto-salvage/dupe)
• /unlock — unlock a previously locked item type
• /locks — list your locked item types
• /salvage — dismantle a chosen item into Scrap/Dust
• /bulk_dismantle — bulk salvage by filter (e.g. rarity=common,uncommon keep=0)
• /craft — craft gear from shards: /craft <slot> [count] [refine N]

Tips:
• Example bulk: /bulk_dismantle rarity=common,uncommon keep=0
• Example craft: /craft weapon 5 refine 2
• Some commands are beta/seasonal; if the bot says \"not available\", it’s normal.` },
    ]},

    { key:"map", title:"Map & Activities", items:[
      { q:"🗺️ What can I do on the map?",
        a:"Use the Alpha Map to access regions and buildings: Missions (solo/coop), Moon Lab Fortress (boss ladder), Dojo (training DPS timer), Mission Board (daily quests), Chain Gate (AFK runs), Shop/Forge huts and occasional event nodes." },
      { q:"⏳ Why cooldowns?",
        a:"Some activities (e.g., Moon Lab, AFK Chain Gate) use cooldowns to pace attempts, reward consistency instead of spam, and keep the in-game economy stable." },
      { q:"🔒 Why is a region or building locked?",
        a:"Regions can require key shards, milestones or story progress. If something is locked, the sheet will explain what you’re missing and often link you to Missions or Forge to fix it." },
    ]},

    { key:"afk", title:"AFK Chain Gate", items:[
      { q:"⛓️ What is the Chain Gate?",
        a:"An AFK expedition building on the map. You send your husky out for a longer run (e.g. 2–10h) and claim stable materials when the timer completes. Good for progress on busy days." },
      { q:"🕒 Does AFK use energy or cost?",
        a:"AFK routes have their own timers and may have entry costs or recommended power in future. The idea is: less clicking, but not strictly \"free\" — it plugs into the same economy as active Missions." },
      { q:"⚙️ Didn’t get my AFK reward?",
        a:"Make sure the timer finished, then use the Claim button in the WebApp. If it still looks wrong, take a screenshot and drop it in the Den — we’ll check logs and fix if needed." },
    ]},

    { key:"materials", title:"Materials & Ledger", items:[
      { q:"🧪 Material types",
        a:"• Bones (soft currency, ledger-based)\n• Scrap (crafting / upgrades)\n• Rune Dust (mainly from ★3+ or salvage)\n• Slot Shards (weapon/armor/helmet/ring/offhand/cloak/collar/gloves/fangs…)\n• Universal / Region Key Shards (for map unlocks and gates)." },
      { q:"📦 How to get them?",
        a:"Solo Missions, co-op content, Daily Quests, event rewards and boxes. Mystery/Premium/Legendary boxes grant multiple rolls for Bones/Scrap/Rune Dust/Shards; drops are written to the ledger first, then mirrored into your user data." },
      { q:"🧾 What is the ledger?",
        a:"An append-only log that tracks every change to your Bones/materials. It’s the single source of truth for Season 0 and the future token snapshot. Admin tools can re-check balances from the ledger at any time." },
      { q:"📊 Where to check balances?",
        a:"Open the WebApp (Materials view) or use /materials if enabled — values reflect the latest ledger-applied snapshot." }
    ]},

    { key:"forge", title:"Forge & Shards", items:[
      { q:"🔷 What are Shards?",
        a:"Slot-specific fragments (weapon, armor, helmet, ring, offhand, cloak, collar, gloves, fangs, rune…). Use Forge → Shards in the WebApp or /craft in the bot to convert them into real gear." },
      { q:"⚖️ How fair is crafting?",
        a:"Crafting uses controlled RNG (e.g. 80/20 with pity every few attempts) plus optional refine bonus. Costs use Bones/Scrap and Rune Dust (from ★3) to keep progression fair and avoid hard pay-to-win edges." },
      { q:"⭐ Stars, reforge, fuse?",
        a:"Upgrades raise ★ up to 5. Reforge and Fuse exist with reasonable daily limits to prevent abuse and keep high-end items rare. ★5 milestones are tracked for telemetry and future rewards." },
      { q:"🧹 Salvage, locks & auto-dupe",
        a:"/salvage and /bulk_dismantle convert junk into Scrap/Dust. /lock and /locks protect your favorite item types from being auto-salvaged or auto-duped. Extra copies can become materials via auto-dupe systems, respecting your locks." },
    ]},

    { key:"stats", title:"Stats, HP & Leveling", items:[
      { q:"📈 Where do my stats come from?",
        a:"We use a single source of truth: base stats from your level + stats from equipped gear + pet bonuses → combined totals → combat. The same totals power Missions, Moon Lab, Dojo and more." },
      { q:"❤️ How is HP calculated?",
        a:"HP = 50 + 12×VIT (after base+gear+pet totals). This unified rule fixed the old inconsistencies between modes and makes survivability fully tied to your build." },
      { q:"🆙 Leveling & XP",
        a:"Level XP requirement grows linearly: need(lvl) = 100 + 25×(lvl−1). You gain XP from missions, quests and some events. Spend unspent stat points via /mystats to shape your build." },
      { q:"🎯 What do stats roughly do?",
        a:"In short: strength and agility lean into damage; vitality drives HP; luck influences crits and some rolls. Exact formulas may evolve, but the overall roles stay consistent." },
    ]},

    { key:"moonlab", title:"Moon Lab (Fortress)", items:[
      { q:"🌕 What is Moon Lab?",
        a:"A boss-ladder fortress with increasing difficulty. Each run pushes as far as you can; floors cleared and encounters defeated feed into rewards, quests and future achievements." },
      { q:"⏳ Attempts & cooldowns",
        a:"Moon Lab uses win/lose cooldowns per run. This is to prevent brute-force spam and make each attempt feel meaningful. Cooldowns and rewards can be tuned over time based on data." },
      { q:"🛠️ 1-HP bug status",
        a:"Fixed. Moon Lab now reads the same stat→HP pipeline as Missions (base + gear + pet, HP = 50 + 12×VIT). If you ever see something weird again, ping us with a screenshot." },
    ]},

    { key:"dojo", title:"Dojo (Training)", items:[
      { q:"🥋 What does Dojo do?",
        a:"A timed DPS test (usually 30/60s). It lets you benchmark different builds without risking mission rewards — some quests/events hook into its milestones and crit stats." },
      { q:"💸 Does Dojo cost anything?",
        a:"By design, Dojo is more of a lab than an income source. Some modes may have small costs or cooldowns, but the primary goal is testing and bragging rights, not farming." },
    ]},

    { key:"shop", title:"Daily Shop", items:[
      { q:"🔄 How does it rotate?",
        a:"The shop auto-rotates roughly every 24h. Daily pool: several gear pieces plus up to a few consumables shown separately. UI shows time to next refresh once the timer logic is fully live." },
      { q:"💰 How do prices work?",
        a:"Items can cost Bones or, later, $HUSKY. Purchases are validated and written to the ledger first, then mirrored to your user data. Some items are limited per day to prevent pure farm abuse." },
      { q:"🗝️ Faction locks?",
        a:"Some offers may be faction- or progress-gated. If you don’t see an item someone else posted, you might be in a different region, faction or season state." }
    ]},

    { key:"quests", title:"Daily Quests & Progress", items:[
      { q:"📜 How do Daily Quests work?",
        a:"Open the Mission Board (📜 button or map building), accept tasks, play to progress, then claim rewards. There is daily rotation; each quest shows its requirements and current progress/state." },
      { q:"🎯 Types of quests",
        a:"You’ll see daily, repeatable and story quests: some just ask you to show up, some to spend Bones, clear missions, win Dojo runs or beat Moon Lab floors." },
      { q:"⚠️ Progress not updating?",
        a:"Sometimes UI lags behind. Close and reopen the WebApp to refresh state. If it still looks wrong, share your username, quest name and what you did in the Den — we’ll check logs and fix it." },
    ]},

    { key:"pets", title:"Pets", items:[
      { q:"🐾 Do pets matter?",
        a:"Yes. Pets provide stats and unique bonuses on top of your gear. They level through play and can change how your build feels in both Missions and Moon Lab." },
      { q:"📈 How do pets grow?",
        a:"Pets gain levels from activity and, in future, from dedicated systems like Adoption Center and pet-focused quests. Higher level = better stats and sometimes new traits." },
      { q:"🏠 Adoption Center?",
        a:"The idea is to have a separate Adoption Center for new pets instead of stuffing everything into the shop. Rollout is done in phases, so if you don’t see it yet, it’s still in progress." },
    ]},

    { key:"referrals", title:"Referrals & Friends", items:[
      { q:"🤝 Can I invite friends?",
        a:"Yes. Alpha Husky is designed to be more fun with a Pack. The referral system tracks who brought who in and may grant Bones, badges or future rewards for honest invites." },
      { q:"🔗 Where is my referral link?",
        a:"Once fully live, you’ll be able to grab it from a bot command (e.g. /referrals) or a WebApp section. We’ll announce when referrals are considered stable enough for grinding." },
      { q:"⚠️ Any referral rules?",
        a:"No botting, no fake accounts, no spam. The goal is to reward real Pack-building, not empty numbers." },
    ]},

    { key:"season", title:"Season 0, Purge & OGs", items:[
      { q:"📆 What is Season 0?",
        a:"A long pre-launch season where we test systems, gather data and reward the earliest Howlers. Bones and activity are tracked via the ledger for a future snapshot." },
      { q:"🧼 What is the Purge?",
        a:"A planned reset that will clean broken progress/economy before full launch. OG identity, badges and key contributions are preserved; exploit-heavy or fake progress is not." },
      { q:"🏅 What stays after Purge?",
        a:"Your OG status, meaningful badges and recognized contributions. Exact mapping (e.g. Season 0 points → future perks) will be documented before anything goes live." },
    ]},

    { key:"token", title:"Token & TGE", items:[
      { q:"🪙 Is the token live?",
        a:"Not yet. We ship gameplay, economy and infra first. Planned total supply is 25M with ~10M locked treasury. No stealth launch, no random \"soon\" listings." },
      { q:"🚀 What does TGE mean here?",
        a:"TGE (token generation event) will happen only once utility, sinks/sources and allocations are locked and documented. There will be clear info, no surprise drops, and no promises of price action." },
      { q:"🎯 How does the game connect to the token?",
        a:"Season 0 ledger and in-game actions are designed to feed into future rewards and utility, not to become a speculative farm. Details will be shared gradually and publicly, in Den and docs." },
    ]},

    { key:"project", title:"Project Vision & Lore", items:[
      { q:"🌑 Why Alpha Husky?",
        a:"It’s a mix of post-apocalyptic tribal-tech worldbuilding, a Telegram-native game, and a long-term brand. Less \"farm this pump now\", more \"build a place the Pack actually cares about\"." },
      { q:"📖 Is there a story?",
        a:"Yes. Characters like Alpha, Shadow Agent, Blood-Moon Whisper and others live in a shared universe. Lore drops through posts, in-game events and special locations like Moon Lab or Broken Contracts." },
      { q:"🧱 What is the build philosophy?",
        a:"Brick by brick. No paid hype, no shortcuts. We ship, test with the Pack, adjust, then ship again. The WebApp + bot you’re using is the same thing we play and break ourselves." },
    ]},

    { key:"safety", title:"Safety, OG & Terms", items:[
      { q:"🔒 Security basics",
        a:"We will never DM you for private keys or seed phrases. Only use the official Alpha Husky bot/WebApp link. Treat anything else as fake until verified in the Den." },
      { q:"🛡️ OG & contribution",
        a:"Early players, testers and helpers are tracked via ledger, badges and internal notes. The idea is to recognize real work and loyalty over loud hype." },
      { q:"📄 Terms / Privacy",
        a:"Alpha Husky is an experimental MVP/Beta. Nothing here is financial advice or a guarantee. We use gameplay telemetry (anonymized where possible) to balance systems. A public Terms/Privacy doc will be linked here once finalized." },
      { q:"🐺 Need help or found a bug?",
        a:"Best channel is the Alpha Den: share your Telegram @, what you did, what you expected, and a screenshot if possible. We debug in the open and fold fixes back into the game." },
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
      if (modal) {
        // klik w backdrop (ciemne tło z data-close)
        modal.addEventListener('click', (e) => {
          const t = e.target;
          if (t && (t.hasAttribute('data-close') || t.classList.contains('faq-backdrop'))) {
            e.preventDefault();
            this.close();
          }
        });
      }

      // X w nagłówku – osobny listener, bo siedzi wewnątrz .faq-sheet
      const closeBtn = $('.faq-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();  // nie wypychaj eventu wyżej
          this.close();
        });
      }

      // Kliki wewnątrz karty nie zamykają modala, ale nie blokują X
      const sheet = $('.faq-sheet');
      if (sheet) {
        sheet.addEventListener('click', (e) => {
          if (!e.target.closest('.faq-close')) {
            e.stopPropagation();
          }
        });
      }

      // Search
      $('#faqSearch')?.addEventListener('input', e => {
        this.state.query = e.target.value.trim();
        this.renderList();
      });
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
