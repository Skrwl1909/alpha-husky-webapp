(function (global) {
  const OATH_ASSETS = {
    bg: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath.webp",

    overlay: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath_overlay_alpha_seal.webp",

    signalLoop: "https://res.cloudinary.com/dnjwvxinh/video/upload/awakening/oath/oath_signal_loop.webm",
    signalLoopFallback: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath_signal_loop_fallback.webp",

    acceptedStatic: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath_accepted.webp",
    acceptedLoop: "https://res.cloudinary.com/dnjwvxinh/video/upload/awakening/oath/oath_accepted_loop.webm",

    cards: {
      rb: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath_card_rb.webp",
      ew: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath_card_ew.webp",
      ih: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath_card_ih.webp",
      pb: "https://res.cloudinary.com/dnjwvxinh/image/upload/awakening/oath/oath_card_pb.webp"
    },

    sigils: {
      rb: "https://res.cloudinary.com/dnjwvxinh/image/upload/factions/sigil_rb.webp",
      ew: "https://res.cloudinary.com/dnjwvxinh/image/upload/factions/sigil_ew.webp",
      ih: "https://res.cloudinary.com/dnjwvxinh/image/upload/factions/sigil_ih.webp",
      pb: "https://res.cloudinary.com/dnjwvxinh/image/upload/factions/sigil_pb.webp"
    }
  };

  const DEFAULT_FACTIONS = [
    {
      key: "rb",
      name: "Rogue Byte",
      short: "Hackers of the broken chain.",
      tags: ["Glitch", "Speed", "Sabotage"],
      accent: "0,229,255",
      mark: "RB"
    },
    {
      key: "ew",
      name: "Echo Wardens",
      short: "Keepers of memory and lost transmissions.",
      tags: ["Memory", "Defense", "Signal"],
      accent: "174,132,255",
      mark: "EW"
    },
    {
      key: "ih",
      name: "Inner Howlers",
      short: "Instinct, old blood and survival.",
      tags: ["Instinct", "Loyalty", "Survival"],
      accent: "142,255,168",
      mark: "IH"
    },
    {
      key: "pb",
      name: "Pack Burners",
      short: "Fire, pressure and domination.",
      tags: ["Fire", "Pressure", "Assault"],
      accent: "255,108,82",
      mark: "PB"
    }
  ];

  const FACTION_META = DEFAULT_FACTIONS.reduce((acc, row) => {
    acc[row.key] = row;
    return acc;
  }, {});

  const FACTION_ECHO = {
    rb: "A glitch whispers: Freedom is the only chain worth wearing.",
    ew: "An ancient signal answers: We remember so you don’t have to.",
    ih: "A low growl rises: The Pack survives. Everything else is noise.",
    pb: "Embers crackle: Burn the old world. Build the new one from ash."
  };

  const ORIGIN_LABELS = {
    stray: "Stray",
    broken: "Broken",
    forgotten: "Forgotten",
    unchained: "Unchained"
  };

  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    checked: false,
    open: false,
    busy: false,
    preview: false,
    screen: "intro",
    selected: "",
    completedFaction: "",
    state: null,
    freshStartV1: null,
    back: null,
    pendingCheck: null,
    profileTimer: 0,
    firstHowlTimer: 0
  };

  function log(...args) {
    if (S.dbg) {
      try { console.log("[Oath]", ...args); } catch (_) {}
    }
  }

  function asText(value) {
    return String(value == null ? "" : value).trim();
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cssUrl(value) {
    const text = asText(value);
    return text ? "url(\"" + text.replace(/"/g, "%22") + "\")" : "none";
  }

  function normalizeFaction(raw) {
    const key = asText(raw).toLowerCase();
    if (!key) return "";
    if (key === "rb" || key.includes("rogue")) return "rb";
    if (key === "ew" || key.includes("echo")) return "ew";
    if (key === "ih" || key.includes("inner")) return "ih";
    if (key === "pb" || key.includes("pack") || key.includes("burn")) return "pb";
    return "";
  }

  function normalizeOrigin(raw) {
    const key = asText(raw).toLowerCase();
    if (!key) return "";
    if (key === "stray" || key.includes("stray")) return "stray";
    if (key === "broken" || key.includes("broken")) return "broken";
    if (key === "forgotten" || key.includes("forgotten")) return "forgotten";
    if (key === "unchained" || key.includes("unchained")) return "unchained";
    return "";
  }

  function currentOriginLabel() {
    const state = S.state || {};
    const raw =
      state.currentOrigin ||
      state.current_origin ||
      state.origin_mark ||
      state.originMark ||
      state.origin ||
      state.profile?.origin_mark ||
      state.profile?.originMark ||
      state.profile?.origin ||
      global.AH_ORIGIN_MARK ||
      (() => {
        try { return localStorage.getItem("ah_origin_mark") || ""; }
        catch (_) { return ""; }
      })();
    const key = normalizeOrigin(raw);
    return ORIGIN_LABELS[key] || asText(raw) || "Not recorded";
  }

  function pickFreshStart(source) {
    const out = source && typeof source === "object"
      ? (source.fresh_start_v1 || source.freshStartV1)
      : null;
    return out && typeof out === "object" ? out : null;
  }

  function normalizeFactions(raw) {
    const rows = Array.isArray(raw) ? raw : [];
    const out = rows
      .map((row) => {
        const key = normalizeFaction(row && row.key);
        const fallback = FACTION_META[key] || {};
        const tagsRaw = Array.isArray(row && row.tags) ? row.tags : fallback.tags;
        return {
          key,
          name: asText(row && row.name) || fallback.name || key.toUpperCase(),
          short: asText(row && row.short) || fallback.short || "",
          tags: Array.isArray(tagsRaw) ? tagsRaw.map(asText).filter(Boolean).slice(0, 4) : [],
          accent: fallback.accent || "125,211,252",
          mark: fallback.mark || key.toUpperCase(),
          card: OATH_ASSETS.cards[key] || "",
          sigil: OATH_ASSETS.sigils[key] || ""
        };
      })
      .filter((row) => row.key && row.name && row.short);
    return out.length === 4 ? out : DEFAULT_FACTIONS.map((row) => ({
      ...row,
      card: OATH_ASSETS.cards[row.key] || "",
      sigil: OATH_ASSETS.sigils[row.key] || ""
    }));
  }

  function factionByKey(key) {
    const canon = normalizeFaction(key);
    const base = FACTION_META[canon] || FACTION_META.rb;
    return {
      ...base,
      card: OATH_ASSETS.cards[canon] || "",
      sigil: OATH_ASSETS.sigils[canon] || ""
    };
  }

  function factionEchoText(key) {
    return FACTION_ECHO[normalizeFaction(key)] || "";
  }

  function haptic(kind) {
    try {
      if (kind === "success") S.tg && S.tg.HapticFeedback && S.tg.HapticFeedback.notificationOccurred("success");
      else if (kind === "error") S.tg && S.tg.HapticFeedback && S.tg.HapticFeedback.notificationOccurred("error");
      else S.tg && S.tg.HapticFeedback && S.tg.HapticFeedback.impactOccurred(kind || "light");
    } catch (_) {}
  }

  function toast(message) {
    const text = asText(message);
    if (!text) return;
    try {
      if (typeof global.toast === "function") {
        global.toast(text);
        return;
      }
    } catch (_) {}
    try { S.tg && S.tg.showAlert && S.tg.showAlert(text); } catch (_) {}
  }

  function ensureStyles() {
    if (document.getElementById("oath-css")) return;
    const style = document.createElement("style");
    style.id = "oath-css";
    style.textContent = `
      #oathBack{
        position:fixed !important;
        inset:0 !important;
        z-index:2147482900 !important;
        display:flex;
        align-items:flex-end;
        justify-content:center;
        color:#f7f7f2;
        background:
          radial-gradient(circle at 16% 10%, rgba(0,229,255,.16), transparent 28%),
          radial-gradient(circle at 86% 5%, rgba(255,108,82,.14), transparent 32%),
          linear-gradient(180deg, rgba(0,0,0,.48), rgba(0,0,0,.9));
        padding:8px;
        padding-bottom:0;
        pointer-events:auto;
        isolation:isolate;
      }
      #oathBack *{box-sizing:border-box}
      .oath-sheet{
        position:relative;
        width:min(100%,560px);
        max-height:calc(100vh - 8px);
        max-height:calc(100dvh - 8px);
        min-height:min(720px, calc(100dvh - 8px));
        display:flex;
        flex-direction:column;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.12);
        border-bottom:0;
        border-radius:8px 8px 0 0;
        background:#050609;
        box-shadow:0 -24px 80px rgba(0,0,0,.74), 0 0 38px rgba(0,229,255,.08);
      }
      .oath-media,
      .oath-media-static,
      .oath-video,
      .oath-overlay,
      .oath-vignette,
      .oath-noise{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
      }
      .oath-media{
        z-index:0;
        overflow:hidden;
        background:
          radial-gradient(circle at 50% 18%, rgba(67,231,255,.14), transparent 34%),
          linear-gradient(180deg, #11131a, #040507 72%);
      }
      .oath-media-static{
        background-position:center;
        background-size:cover;
        opacity:.62;
        filter:saturate(1.02) brightness(.72);
      }
      .oath-video{
        object-fit:cover;
        opacity:0;
        transition:opacity .34s ease;
      }
      .oath-video.is-ready{opacity:.72}
      .oath-overlay{
        object-fit:cover;
        opacity:.18;
        mix-blend-mode:screen;
        pointer-events:none;
      }
      .oath-vignette{
        z-index:1;
        pointer-events:none;
        background:
          radial-gradient(circle at 50% 22%, rgba(255,255,255,.08), transparent 34%),
          linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.56) 48%, rgba(0,0,0,.92)),
          linear-gradient(90deg, rgba(0,0,0,.52), transparent 24%, transparent 76%, rgba(0,0,0,.52));
      }
      .oath-noise{
        z-index:2;
        opacity:.11;
        pointer-events:none;
        background:
          repeating-linear-gradient(180deg, rgba(255,255,255,.18) 0 1px, transparent 1px 5px),
          repeating-linear-gradient(115deg, transparent 0 10px, rgba(255,255,255,.10) 11px, transparent 12px 18px);
      }
      .oath-top{
        position:relative;
        z-index:3;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:16px 16px 10px;
        border-bottom:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, rgba(4,5,8,.72), rgba(4,5,8,.18));
      }
      .oath-kicker{
        font-size:11px;
        line-height:1;
        letter-spacing:.18em;
        text-transform:uppercase;
        color:rgba(147,231,255,.78);
      }
      .oath-title{
        margin-top:6px;
        font-weight:950;
        font-size:28px;
        line-height:1;
        letter-spacing:0;
      }
      .oath-dev-label{
        display:none;
        width:max-content;
        margin-top:8px;
        padding:4px 7px;
        border:1px solid rgba(255,209,128,.28);
        border-radius:999px;
        background:rgba(255,209,128,.08);
        color:rgba(255,223,164,.9);
        font-size:10px;
        line-height:1;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      #oathBack[data-preview="1"] .oath-dev-label{display:block}
      .oath-close{
        width:38px;
        height:38px;
        display:grid;
        place-items:center;
        border:1px solid rgba(255,255,255,.14);
        border-radius:8px;
        color:#fff;
        background:rgba(255,255,255,.06);
        font-size:18px;
        line-height:1;
      }
      .oath-scroll{
        position:relative;
        z-index:3;
        flex:1 1 auto;
        overflow:auto;
        -webkit-overflow-scrolling:touch;
        padding:16px;
      }
      .oath-hero{
        min-height:390px;
        display:flex;
        align-items:flex-end;
      }
      .oath-hero-copy{
        width:100%;
        padding:18px 0 6px;
      }
      .oath-opening{
        margin:0;
        color:rgba(255,255,255,.92);
        font-size:17px;
        line-height:1.38;
      }
      .oath-intro{
        margin-top:14px;
        padding:12px;
        border:1px solid rgba(255,255,255,.11);
        border-radius:8px;
        background:linear-gradient(135deg, rgba(255,255,255,.075), rgba(255,255,255,.026));
        color:rgba(255,255,255,.83);
        font-size:13px;
        line-height:1.42;
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
      }
      .oath-explainer{
        margin:0 0 12px;
        color:rgba(255,255,255,.68);
        font-size:12px;
        line-height:1.4;
      }
      .oath-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }
      .oath-card{
        --oath-accent:125,211,252;
        --oath-card-bg:none;
        position:relative;
        width:100%;
        min-height:116px;
        display:grid;
        grid-template-columns:74px minmax(0,1fr);
        gap:12px;
        align-items:center;
        overflow:hidden;
        padding:12px;
        text-align:left;
        border:1px solid rgba(var(--oath-accent),.24);
        border-radius:8px;
        color:#f7f7f2;
        background:
          linear-gradient(90deg, rgba(5,6,9,.88), rgba(5,6,9,.56) 58%, rgba(5,6,9,.76)),
          var(--oath-card-bg),
          radial-gradient(circle at 12% 20%, rgba(var(--oath-accent),.22), transparent 38%),
          linear-gradient(135deg, rgba(255,255,255,.07), rgba(255,255,255,.024));
        background-position:center;
        background-size:cover;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);
      }
      .oath-card::before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:linear-gradient(90deg, rgba(var(--oath-accent),.12), transparent 42%);
        opacity:.62;
      }
      .oath-card::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        border-radius:8px;
        opacity:0;
        box-shadow:0 0 0 1px rgba(var(--oath-accent),.78), 0 0 34px rgba(var(--oath-accent),.24);
        transition:opacity .18s ease;
      }
      .oath-card[aria-pressed="true"]::after{opacity:1}
      .oath-card[aria-pressed="true"] .oath-sigil{
        transform:scale(1.07);
        filter:drop-shadow(0 0 18px rgba(var(--oath-accent),.52));
      }
      .oath-card:disabled{opacity:.72}
      .oath-mark{
        position:relative;
        z-index:1;
        width:70px;
        height:70px;
        display:grid;
        place-items:center;
        overflow:hidden;
        border:1px solid rgba(var(--oath-accent),.38);
        border-radius:8px;
        background:rgba(0,0,0,.32);
        box-shadow:0 0 22px rgba(var(--oath-accent),.12);
      }
      .oath-sigil{
        position:relative;
        z-index:2;
        width:64px;
        height:64px;
        object-fit:contain;
        transition:transform .18s ease, filter .18s ease;
      }
      .oath-mark-fallback{
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        color:rgba(var(--oath-accent),.92);
        font-size:20px;
        font-weight:950;
      }
      .oath-copy{position:relative;z-index:1;min-width:0}
      .oath-name{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        font-weight:950;
        font-size:16px;
        line-height:1.1;
      }
      .oath-lock{
        flex:0 0 auto;
        opacity:0;
        color:rgb(var(--oath-accent));
        font-size:10px;
        line-height:1;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      .oath-card[aria-pressed="true"] .oath-lock{opacity:1}
      .oath-short{
        display:block;
        margin-top:6px;
        color:rgba(255,255,255,.75);
        font-size:12.5px;
        line-height:1.35;
      }
      .oath-echo{
        display:block;
        max-height:0;
        margin-top:0;
        overflow:hidden;
        opacity:0;
        transform:translateY(-3px);
        color:rgba(214,244,255,.88);
        font-size:12px;
        line-height:1.34;
        text-shadow:0 0 14px rgba(var(--oath-accent),.14);
        transition:max-height .2s ease, margin-top .2s ease, opacity .18s ease, transform .18s ease;
      }
      .oath-card[aria-pressed="true"] .oath-echo,
      .oath-card:focus .oath-echo,
      .oath-card:focus-visible .oath-echo{
        max-height:56px;
        margin-top:8px;
        opacity:1;
        transform:translateY(0);
      }
      .oath-tags{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:9px;
      }
      .oath-tag{
        padding:5px 7px;
        border:1px solid rgba(var(--oath-accent),.31);
        border-radius:999px;
        background:rgba(var(--oath-accent),.10);
        color:rgba(255,255,255,.82);
        font-size:10.5px;
        line-height:1;
      }
      .oath-footer{
        position:relative;
        z-index:4;
        display:grid;
        gap:8px;
        padding:12px 16px max(16px, calc(env(safe-area-inset-bottom) + 12px));
        border-top:1px solid rgba(255,255,255,.09);
        background:linear-gradient(180deg, rgba(7,8,12,.78), rgba(7,8,12,.98));
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
      }
      .oath-primary,
      .oath-secondary{
        width:100%;
        min-height:50px;
        border-radius:8px;
        font-weight:950;
        font-size:15px;
        letter-spacing:0;
      }
      .oath-primary{
        border:0;
        color:#061014;
        background:linear-gradient(90deg, #93e7ff, #ffe67a, #ff8068);
        box-shadow:0 12px 28px rgba(0,0,0,.36);
      }
      .oath-primary:disabled{
        opacity:.45;
        filter:saturate(.45);
      }
      .oath-next-actions{
        display:none;
        grid-template-columns:1fr 1fr;
        gap:8px;
      }
      .oath-next-actions[data-show="1"]{display:grid}
      .oath-secondary{
        min-height:44px;
        border:1px solid rgba(255,255,255,.14);
        color:rgba(255,255,255,.9);
        background:rgba(255,255,255,.055);
      }
      .oath-notice{
        display:none;
        color:rgba(255,209,128,.9);
        font-size:12px;
        text-align:center;
      }
      .oath-notice[data-show="1"]{display:block}
      .oath-confirm{
        min-height:430px;
        display:flex;
        align-items:flex-end;
        text-align:left;
      }
      .oath-confirm-box{
        width:100%;
        padding:20px 0 8px;
      }
      .oath-confirm-mark{
        --oath-confirm-accent:125,211,252;
        width:92px;
        height:92px;
        display:grid;
        place-items:center;
        border:1px solid rgba(var(--oath-confirm-accent),.42);
        border-radius:8px;
        background:
          radial-gradient(circle, rgba(var(--oath-confirm-accent),.26), transparent 58%),
          rgba(255,255,255,.04);
        box-shadow:0 0 42px rgba(var(--oath-confirm-accent),.2);
      }
      .oath-confirm-mark img{
        width:84px;
        height:84px;
        object-fit:contain;
      }
      .oath-confirm h2{
        margin:18px 0 0;
        font-size:27px;
        line-height:1.08;
        letter-spacing:0;
      }
      .oath-confirm p{
        margin:10px 0 0;
        max-width:360px;
        color:rgba(255,255,255,.78);
        font-size:15px;
        line-height:1.42;
      }
      .oath-next-copy{
        margin-top:14px;
        color:rgba(147,231,255,.8);
        font-size:12px;
        text-transform:uppercase;
        letter-spacing:.08em;
      }
      .oath-profile{
        min-height:430px;
        display:flex;
        align-items:flex-end;
      }
      .oath-profile-card{
        --oath-profile-accent:125,211,252;
        width:100%;
        padding:16px;
        border:1px solid rgba(var(--oath-profile-accent),.32);
        border-radius:8px;
        background:
          radial-gradient(circle at 14% 0%, rgba(var(--oath-profile-accent),.18), transparent 44%),
          linear-gradient(180deg, rgba(7,10,14,.76), rgba(4,5,8,.92));
        box-shadow:0 0 34px rgba(var(--oath-profile-accent),.12), inset 0 0 0 1px rgba(255,255,255,.035);
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
        animation:oathProfileBind .34s ease both;
      }
      .oath-profile-title{
        color:#fffdf5;
        font-size:22px;
        font-weight:950;
        line-height:1;
        letter-spacing:0;
      }
      .oath-profile-rows{
        display:grid;
        gap:9px;
        margin-top:15px;
      }
      .oath-profile-row{
        display:grid;
        grid-template-columns:82px minmax(0,1fr);
        gap:10px;
        align-items:center;
        padding:9px 10px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.045);
      }
      .oath-profile-label{
        color:rgba(255,255,255,.58);
        font-size:11px;
        font-weight:850;
        letter-spacing:.1em;
        text-transform:uppercase;
      }
      .oath-profile-value{
        min-width:0;
        color:rgba(255,255,255,.92);
        font-size:14px;
        font-weight:850;
        line-height:1.22;
      }
      .oath-first-howl-copy{
        margin-top:16px;
        padding:12px;
        border:1px solid rgba(147,231,255,.20);
        border-radius:8px;
        background:rgba(147,231,255,.055);
        color:rgba(230,248,255,.9);
        font-size:13px;
        font-weight:850;
        line-height:1.38;
      }
      .oath-trail-panel{
        margin-top:16px;
        padding:14px;
        border-radius:18px;
        border:1px solid rgba(125,211,252,.24);
        background:
          linear-gradient(180deg, rgba(4,10,18,.9), rgba(4,8,16,.76)),
          radial-gradient(circle at 0% 0%, rgba(125,211,252,.12), transparent 42%);
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.03), 0 18px 34px rgba(0,0,0,.24);
      }
      .oath-trail-kicker{
        font-size:11px;
        letter-spacing:.24em;
        text-transform:uppercase;
        color:rgba(125,211,252,.86);
      }
      .oath-trail-copy{
        margin-top:10px;
        font-size:13px;
        line-height:1.65;
        color:rgba(232,244,255,.84);
      }
      .oath-trail-actions{
        display:grid;
        grid-template-columns:repeat(2, minmax(0, 1fr));
        gap:10px;
        margin-top:14px;
      }
      .oath-trail-actions .oath-secondary{
        min-width:0;
        width:100%;
      }
      @keyframes oathProfileBind{
        from{opacity:0;transform:translateY(10px);filter:brightness(.82)}
        to{opacity:1;transform:translateY(0);filter:brightness(1)}
      }
      @media (min-width:560px){
        #oathBack{align-items:center;padding:18px}
        .oath-sheet{
          border-bottom:1px solid rgba(255,255,255,.12);
          border-radius:8px;
          max-height:min(780px, calc(100dvh - 36px));
          min-height:min(760px, calc(100dvh - 36px));
        }
        .oath-grid{grid-template-columns:1fr 1fr}
        .oath-card{grid-template-columns:62px minmax(0,1fr);min-height:172px;align-items:start}
        .oath-mark{width:58px;height:58px}
        .oath-sigil{width:54px;height:54px}
      }
      @media (max-width:370px){
        .oath-title{font-size:24px}
        .oath-scroll{padding:12px}
        .oath-card{grid-template-columns:58px minmax(0,1fr);gap:10px;padding:10px;min-height:106px}
        .oath-mark{width:56px;height:56px}
        .oath-sigil{width:52px;height:52px}
        .oath-tag{font-size:10px;padding:4px 6px}
        .oath-next-actions{grid-template-columns:1fr}
        .oath-trail-actions{grid-template-columns:1fr}
      }
      @media (prefers-reduced-motion: reduce){
        .oath-video,
        .oath-card::after,
        .oath-echo,
        .oath-sigil{transition:none}
        .oath-profile-card{animation:none}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    ensureStyles();
    if (S.back && document.body.contains(S.back)) return S.back;

    const back = document.createElement("div");
    back.id = "oathBack";
    back.setAttribute("role", "presentation");
    back.innerHTML = `
      <section class="oath-sheet" role="dialog" aria-modal="true" aria-labelledby="oathTitle">
        <div class="oath-media" aria-hidden="true">
          <div class="oath-media-static"></div>
          <video class="oath-video" muted playsinline loop preload="metadata"></video>
          <img class="oath-overlay" alt="">
          <div class="oath-vignette"></div>
          <div class="oath-noise"></div>
        </div>
        <div class="oath-top">
          <div>
            <div class="oath-kicker">Faction Oath</div>
            <div class="oath-title" id="oathTitle">THE OATH</div>
            <div class="oath-dev-label">DEV PREVIEW</div>
          </div>
          <button type="button" class="oath-close" aria-label="Close The Oath">x</button>
        </div>
        <div class="oath-scroll"></div>
        <div class="oath-footer">
          <button type="button" class="oath-primary">Choose Faction</button>
          <div class="oath-next-actions" data-show="0">
            <button type="button" class="oath-secondary" data-oath-next="howl">Send First Howl</button>
            <button type="button" class="oath-secondary" data-oath-next="mission">Start First Mission</button>
          </div>
          <div class="oath-notice" data-show="0" role="status" aria-live="polite"></div>
        </div>
      </section>
    `;
    document.body.appendChild(back);
    S.back = back;

    back.querySelector(".oath-close")?.addEventListener("click", close);
    back.querySelector("[data-oath-next='howl']")?.addEventListener("click", openFirstHowl);
    back.querySelector("[data-oath-next='mission']")?.addEventListener("click", openFirstMission);
    back.addEventListener("click", (event) => {
      if (event.target === back && !S.busy) close();
    });
    return back;
  }

  function setNotice(message) {
    const el = S.back && S.back.querySelector(".oath-notice");
    if (!el) return;
    const text = asText(message);
    el.textContent = text;
    el.setAttribute("data-show", text ? "1" : "0");
  }

  function setMedia(mode) {
    const back = ensureModal();
    const staticEl = back.querySelector(".oath-media-static");
    const video = back.querySelector(".oath-video");
    const overlay = back.querySelector(".oath-overlay");

    const image = mode === "accepted"
      ? (OATH_ASSETS.acceptedStatic || OATH_ASSETS.bg)
      : (OATH_ASSETS.signalLoopFallback || OATH_ASSETS.bg);
    const videoSrc = mode === "accepted" ? OATH_ASSETS.acceptedLoop : OATH_ASSETS.signalLoop;

    if (staticEl) staticEl.style.backgroundImage = cssUrl(image || OATH_ASSETS.bg);

    if (overlay) {
      overlay.hidden = !OATH_ASSETS.overlay;
      if (OATH_ASSETS.overlay) overlay.src = OATH_ASSETS.overlay;
      overlay.onerror = function () { this.hidden = true; };
    }

    if (!video) return;
    video.classList.remove("is-ready");
    video.oncanplay = null;
    video.onerror = null;
    try { video.pause(); } catch (_) {}
    if (!videoSrc) {
      video.removeAttribute("src");
      video.load();
      return;
    }
    video.poster = image || OATH_ASSETS.bg || "";
    video.src = videoSrc;
    video.oncanplay = function () {
      video.classList.add("is-ready");
      try { video.play().catch(function () {}); } catch (_) {}
    };
    video.onerror = function () {
      video.classList.remove("is-ready");
      try { video.pause(); } catch (_) {}
    };
    try { video.load(); } catch (_) {}
  }

  function factionsForRender() {
    return normalizeFactions(S.state && S.state.factions || DEFAULT_FACTIONS);
  }

  function setFreshStartState(source) {
    S.freshStartV1 = pickFreshStart(source);
  }

  function setFooter({ primary, disabled, nextActions }) {
    const primaryEl = S.back && S.back.querySelector(".oath-primary");
    const nextEl = S.back && S.back.querySelector(".oath-next-actions");
    if (primaryEl) {
      primaryEl.textContent = primary || "";
      primaryEl.disabled = !!disabled;
      primaryEl.onclick = handlePrimary;
    }
    if (nextEl) nextEl.setAttribute("data-show", nextActions ? "1" : "0");
  }

  function clearSignalTimers() {
    if (S.profileTimer) {
      clearTimeout(S.profileTimer);
      S.profileTimer = 0;
    }
    if (S.firstHowlTimer) {
      clearTimeout(S.firstHowlTimer);
      S.firstHowlTimer = 0;
    }
  }

  function renderIntro() {
    const back = ensureModal();
    const scroll = back.querySelector(".oath-scroll");
    if (!scroll) return;
    S.screen = "intro";
    setMedia("intro");
    scroll.innerHTML = `
      <div class="oath-hero">
        <div class="oath-hero-copy">
          <p class="oath-opening">You were found by Alpha.<br>Now choose who you stand with.</p>
          <div class="oath-intro">
            The Pack is not one voice.<br>
            Four signals fight for the future of the broken chain.
          </div>
        </div>
      </div>
    `;
    setNotice("");
    setFooter({ primary: "Choose Faction", disabled: false, nextActions: false });
  }

  function renderPick() {
    const back = ensureModal();
    const scroll = back.querySelector(".oath-scroll");
    const factions = factionsForRender();
    if (!scroll) return;
    S.screen = "pick";
    setMedia("intro");
    scroll.innerHTML = `
      <div class="oath-explainer">
        Origin is who you were before Alpha found you.<br>
        Faction is who you stand with now.
      </div>
      <div class="oath-grid" role="list">
        ${factions.map((faction) => `
          <button
            type="button"
            class="oath-card"
            role="listitem"
            aria-pressed="${faction.key === S.selected ? "true" : "false"}"
            data-faction="${esc(faction.key)}"
            style="--oath-accent:${esc(faction.accent)};--oath-card-bg:${cssUrl(faction.card)}"
          >
            <span class="oath-mark" aria-hidden="true">
              <span class="oath-mark-fallback">${esc(faction.mark)}</span>
              <img class="oath-sigil" src="${esc(faction.sigil)}" alt="" loading="eager" decoding="async" onerror="this.hidden=true;">
            </span>
            <span class="oath-copy">
              <span class="oath-name">
                <span>${esc(faction.name)}</span>
                <span class="oath-lock">Signal locked</span>
              </span>
              <span class="oath-short">${esc(faction.short)}</span>
              <span class="oath-echo">${esc(factionEchoText(faction.key))}</span>
              <span class="oath-tags">
                ${faction.tags.map((tag) => `<span class="oath-tag">${esc(tag)}</span>`).join("")}
              </span>
            </span>
          </button>
        `).join("")}
      </div>
    `;

    scroll.querySelectorAll(".oath-card").forEach((button) => {
      button.addEventListener("click", () => selectFaction(button.getAttribute("data-faction")));
    });
    setNotice("");
    updatePrimary();
  }

  function renderSignalProfile(factionKey) {
    const back = ensureModal();
    const scroll = back.querySelector(".oath-scroll");
    const faction = factionByKey(factionKey);
    if (!scroll) return;
    clearSignalTimers();
    S.screen = "profile";
    setMedia("accepted");
    scroll.innerHTML = `
      <div class="oath-profile">
        <div class="oath-profile-card" style="--oath-profile-accent:${esc(faction.accent)}">
          <div class="oath-profile-title">Signal Profile</div>
          <div class="oath-profile-rows">
            <div class="oath-profile-row">
              <div class="oath-profile-label">Origin</div>
              <div class="oath-profile-value">${esc(currentOriginLabel())}</div>
            </div>
            <div class="oath-profile-row">
              <div class="oath-profile-label">Faction</div>
              <div class="oath-profile-value">${esc(faction.name)}</div>
            </div>
            <div class="oath-profile-row">
              <div class="oath-profile-label">Status</div>
              <div class="oath-profile-value">Bound to the Pack</div>
            </div>
          </div>
        </div>
      </div>
    `;
    setNotice("");
    setFooter({ primary: "Binding Signal...", disabled: true, nextActions: false });
    S.profileTimer = setTimeout(() => {
      S.profileTimer = 0;
      if (S.open && S.screen === "profile" && normalizeFaction(S.completedFaction) === faction.key) {
        renderConfirm(faction.key);
      }
    }, 2400);
  }

  function renderConfirm(factionKey) {
    const back = ensureModal();
    const scroll = back.querySelector(".oath-scroll");
    const faction = factionByKey(factionKey);
    if (!scroll) return;
    S.screen = "confirm";
    setMedia("accepted");
    scroll.innerHTML = `
      <div class="oath-confirm">
        <div class="oath-confirm-box">
          <div class="oath-confirm-mark" style="--oath-confirm-accent:${esc(faction.accent)}" aria-hidden="true">
            <img src="${esc(faction.sigil)}" alt="" onerror="this.hidden=true;">
          </div>
          <h2>SIGNAL BOUND</h2>
          <p>Your oath has been accepted.<br>Your faction now recognizes your signal.</p>
          <div class="oath-trail-panel">
            <div class="oath-trail-kicker">Fresh Start Trail unlocked.</div>
            <div class="oath-trail-copy">
              Complete your First Howl, link your wallet, and leave your first mark in the Alpha Husky world to become eligible for symbolic $HOWL rewards.
            </div>
            <div class="oath-trail-actions">
              <button type="button" class="oath-secondary" data-oath-trail="howl">Share First Howl</button>
              <button type="button" class="oath-secondary" data-oath-trail="wallet">Link Wallet</button>
              <button type="button" class="oath-secondary" data-oath-trail="mission">Start First Mission</button>
              <button type="button" class="oath-secondary" data-oath-trail="map">Open Map</button>
            </div>
          </div>
        </div>
      </div>
    `;
    scroll.querySelector("[data-oath-trail='howl']")?.addEventListener("click", openFirstHowl);
    scroll.querySelector("[data-oath-trail='wallet']")?.addEventListener("click", openWalletLink);
    scroll.querySelector("[data-oath-trail='mission']")?.addEventListener("click", openFirstMission);
    scroll.querySelector("[data-oath-trail='map']")?.addEventListener("click", openMapView);
    setNotice("");
    setFooter({ primary: "Enter the Pack", disabled: false, nextActions: false });
  }

  function updatePrimary() {
    if (S.screen !== "pick") return;
    setFooter({
      primary: S.busy ? "Recording..." : "Swear the Oath",
      disabled: S.busy || !S.selected,
      nextActions: false
    });
  }

  function setBusy(on) {
    S.busy = !!on;
    const back = S.back;
    if (!back) return;
    back.querySelectorAll("button").forEach((button) => {
      if (button.classList.contains("oath-close")) {
        button.disabled = S.busy;
        return;
      }
      if (button.classList.contains("oath-card")) {
        button.disabled = S.busy;
      }
    });
    updatePrimary();
  }

  function selectFaction(key) {
    if (S.busy || S.completedFaction) return;
    const next = normalizeFaction(key);
    if (!next) return;
    S.selected = next;
    S.back?.querySelectorAll?.(".oath-card").forEach((button) => {
      const selected = button.getAttribute("data-faction") === next;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    setNotice("");
    updatePrimary();
    haptic("light");
  }

  function handlePrimary() {
    if (S.screen === "intro") {
      haptic("light");
      renderPick();
      return;
    }
    if (S.screen === "pick") {
      void complete();
      return;
    }
    if (S.screen === "profile" || S.screen === "first_howl") {
      return;
    }
    close();
  }

  function launchHowlboard() {
    setTimeout(() => {
      try {
        if (typeof global.openBoard === "function") {
          global.openBoard("howls");
          return;
        }
      } catch (_) {}
      try {
        const howlboard = document.querySelector(".btn.howlboard");
        if (howlboard) {
          howlboard.click();
          return;
        }
      } catch (_) {}
      toast("Open the Pack board to send your first signal.");
    }, 80);
  }

  function renderFirstHowlSent() {
    const back = ensureModal();
    const scroll = back.querySelector(".oath-scroll");
    const faction = factionByKey(S.completedFaction || S.selected);
    if (!scroll) return;
    clearSignalTimers();
    S.screen = "first_howl";
    setMedia("accepted");
    scroll.innerHTML = `
      <div class="oath-confirm">
        <div class="oath-confirm-box">
          <div class="oath-confirm-mark" style="--oath-confirm-accent:${esc(faction.accent)}" aria-hidden="true">
            <img src="${esc(faction.sigil)}" alt="" onerror="this.hidden=true;">
          </div>
          <h2>First Howl</h2>
          <p>Your howl echoes across the broken chain.<br>The Pack has heard you.<br>Now the real work begins.</p>
        </div>
      </div>
    `;
    setNotice("");
    setFooter({ primary: "Opening Howlboard...", disabled: true, nextActions: false });
    S.firstHowlTimer = setTimeout(() => {
      S.firstHowlTimer = 0;
      close();
      launchHowlboard();
    }, 2200);
  }

  function openFirstHowl() {
    if (S.open && S.completedFaction) {
      haptic("light");
      renderFirstHowlSent();
      return;
    }
    close();
    launchHowlboard();
  }

  function openFirstMission() {
    close();
    setTimeout(() => {
      try {
        if (global.Missions && typeof global.Missions.open === "function") {
          global.Missions.open();
          return;
        }
      } catch (_) {}
      try {
        const mission = document.querySelector(".btn.mission, .btn.missions, [data-action='mission'], [data-action='missions']");
        if (mission) {
          mission.click();
          return;
        }
      } catch (_) {}
      toast("Mission board is ready from the main app.");
    }, 80);
  }

  function openWalletLink() {
    close();
    setTimeout(() => {
      try {
        if (global.Support && typeof global.Support.openWallet === "function") {
          global.Support.openWallet();
          return;
        }
      } catch (_) {}
      try {
        if (global.Support && typeof global.Support.open === "function") {
          global.Support.open("wallet");
          return;
        }
      } catch (_) {}
      try {
        const wallet = document.querySelector(".btn.wallet, .btn.support, [data-action='wallet'], [data-action='support-wallet']");
        if (wallet) {
          wallet.click();
          return;
        }
      } catch (_) {}
      try { console.debug("[Oath] Link Wallet action unavailable"); } catch (_) {}
    }, 80);
  }

  function openMapView() {
    close();
    setTimeout(() => {
      try {
        if (global.Map && typeof global.Map.open === "function") {
          global.Map.open();
          return;
        }
      } catch (_) {}
      try {
        if (global.WorldMap && typeof global.WorldMap.open === "function") {
          global.WorldMap.open();
          return;
        }
      } catch (_) {}
      try {
        const map = document.querySelector(".btn.map, [data-action='map'], [data-nav='map']");
        if (map) {
          map.click();
          return;
        }
      } catch (_) {}
      try { console.debug("[Oath] Open Map action unavailable"); } catch (_) {}
    }, 80);
  }

  function updateFactionLocally(factionKey) {
    const key = normalizeFaction(factionKey);
    if (!key) return;

    try { localStorage.setItem("ah_faction", key); } catch (_) {}
    try { global.currentUserFaction = key; } catch (_) {}

    try {
      global.PROFILE = global.PROFILE || {};
      global.PROFILE.faction = key;
    } catch (_) {}

    try {
      global.PLAYER_STATE = global.PLAYER_STATE || {};
      global.PLAYER_STATE.profile = global.PLAYER_STATE.profile || {};
      global.PLAYER_STATE.profile.faction = key;
      global.PLAYER_STATE.faction = key;
    } catch (_) {}

    try { global.Influence && global.Influence.setFaction && global.Influence.setFaction(key); } catch (_) {}
    try { global.renderFactionBadge && global.renderFactionBadge(); } catch (_) {}
    try { global.dispatchEvent && global.dispatchEvent(new CustomEvent("ah:oath-complete", { detail: { faction: key } })); } catch (_) {}
  }

  async function complete() {
    if (S.completedFaction) {
      close();
      return;
    }
    if (S.busy) return;
    if (!S.selected) {
      setNotice("Choose a faction first.");
      return;
    }
    if (S.preview) {
      S.completedFaction = S.selected;
      haptic("success");
      renderSignalProfile(S.selected);
      return;
    }
    if (typeof S.apiPost !== "function") {
      setNotice("Connection is not ready. Try again.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      const runId = "oath_" + Date.now() + "_" + Math.random().toString(16).slice(2);
      const out = await S.apiPost("/webapp/oath/complete", {
        faction: S.selected,
        run_id: runId
      });
      if (!out || out.ok === false) throw new Error(out && out.reason || "OATH_COMPLETE_FAILED");

      S.state = Object.assign({}, S.state || {}, out);
      setFreshStartState(out);
      const faction = normalizeFaction(out.currentFaction || out.faction || S.selected);
      S.completedFaction = faction;
      S.checked = true;
      updateFactionLocally(faction);
      haptic("success");
      setBusy(false);
      renderSignalProfile(faction);
    } catch (err) {
      log("complete failed", err);
      haptic("error");
      const reason = asText(err && err.data && err.data.reason || err && err.message);
      if (reason === "FACTION_ALREADY_SET") {
        const current = normalizeFaction(err && err.data && err.data.currentFaction);
        if (current) updateFactionLocally(current);
        setNotice("Faction already set.");
      } else if (reason === "INVALID_FACTION") {
        setNotice("That faction signal is invalid.");
      } else {
        setNotice("Could not record the Oath. Try again.");
      }
      setBusy(false);
    }
  }

  function open(state) {
    if (S.open) return false;
    clearSignalTimers();
    S.preview = false;
    S.state = state && typeof state === "object" ? state : S.state || { factions: DEFAULT_FACTIONS };
    setFreshStartState(S.state);
    S.open = true;
    S.busy = false;
    S.screen = "intro";
    S.selected = "";
    S.completedFaction = "";
    ensureModal();
    document.documentElement.classList.add("ah-modal-open");
    document.body.classList.add("ah-oath-open");
    renderIntro();
    return true;
  }

  function preview(state) {
    if (S.open) close();
    clearSignalTimers();
    S.preview = true;
    S.state = state && typeof state === "object" ? state : { factions: DEFAULT_FACTIONS };
    setFreshStartState(S.state);
    S.open = true;
    S.busy = false;
    S.screen = "intro";
    S.selected = "";
    S.completedFaction = "";
    ensureModal();
    if (S.back) S.back.setAttribute("data-preview", "1");
    document.documentElement.classList.add("ah-modal-open");
    document.body.classList.add("ah-oath-open");
    renderIntro();
    return true;
  }

  function close() {
    const back = S.back;
    clearSignalTimers();
    S.open = false;
    S.busy = false;
    S.preview = false;
    S.screen = "intro";
    S.selected = "";
    S.completedFaction = "";
    S.freshStartV1 = null;
    if (back) {
      back.querySelectorAll("video").forEach((video) => {
        try { video.pause(); } catch (_) {}
      });
      back.remove();
    }
    S.back = null;
    document.body.classList.remove("ah-oath-open");
    if (!global.AH_NAV?.stack?.length && !document.body.classList.contains("ah-awakening-open")) {
      document.documentElement.classList.remove("ah-modal-open");
    }
  }

  async function fetchState() {
    if (typeof S.apiPost !== "function") return null;
    const out = await S.apiPost("/webapp/oath/state", {});
    if (!out || out.ok === false) return null;
    return out;
  }

  async function checkAndOpen(options = {}) {
    if (S.open) return false;
    if (S.pendingCheck) return await S.pendingCheck;
    if (S.checked && !options.force) return false;

    S.pendingCheck = (async () => {
      try {
        const out = await fetchState();
        S.checked = true;
        S.state = out;
        setFreshStartState(out);
        const current = normalizeFaction(out && out.currentFaction);
        if (current) updateFactionLocally(current);
        if (!out || !out.show) return false;
        return open(out);
      } catch (err) {
        S.checked = true;
        log("state skipped", err);
        return false;
      } finally {
        S.pendingCheck = null;
      }
    })();
    return await S.pendingCheck;
  }

  function init(deps = {}) {
    if (typeof deps.apiPost === "function") S.apiPost = deps.apiPost;
    S.tg = deps.tg || global.Telegram?.WebApp || global.tg || S.tg || null;
    S.dbg = typeof deps.dbg === "boolean" ? deps.dbg : !!deps.dbg || S.dbg;

    if (typeof S.apiPost === "function") {
      setTimeout(() => {
        void checkAndOpen();
      }, 120);
    }
    return API;
  }

  const API = { init, open, close, checkAndOpen, preview, openPreview: preview };
  global.Oath = API;
  global.OATH_ASSETS = OATH_ASSETS;
})(window);
