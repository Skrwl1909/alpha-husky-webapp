// js/equipped.js – Character panel + Equipped view for Alpha Husky WebApp.
(function () {
  const API_BASE = window.API_BASE || ""; // zostaw puste, jeśli front i API są pod tym samym hostem

  // Twoje slot coords (px w układzie PNG)
  // Format: [x, y, w, h]
  const SLOT_COORDS = {
    helmet:  [530,  40, 175, 175],
    fangs:   [195, 100, 134, 134],
    armor:   [195, 300, 134, 134],
    ring:    [195, 489, 134, 134],
    weapon:  [435, 650, 156, 156],
    cloak:   [945, 100, 134, 134],
    collar:  [945, 285, 134, 134],
    gloves:  [945, 450, 134, 134],
    pet:     [945, 640, 134, 134],
    offhand: [682, 655, 156, 156],
  };
  const SLOT_ORDER = Object.freeze(Object.keys(SLOT_COORDS));

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slotLabel(slotKey, slotState) {
    const label = slotState?.label || String(slotKey || "").replace(/_/g, " ");
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function statPresentationLabel(key) {
    const normalized = String(key || "").toLowerCase().replace(/[\s_-]+/g, "");
    const labels = {
      strength: "STR", str: "STR",
      defense: "DEF", def: "DEF",
      vitality: "VIT", vit: "VIT",
      attack: "ATK", atk: "ATK",
      agility: "AGI", agi: "AGI",
      luck: "LUCK",
      intelligence: "INT", int: "INT",
      hp: "HP", health: "HP",
      speed: "SPD",
      critical: "CRIT", crit: "CRIT",
    };
    return labels[normalized] || String(key || "").replace(/_/g, " ").toUpperCase();
  }

  function formattedStatValue(value) {
    if (value === "" || value == null) return "";
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric > 0 ? `+${numeric}` : String(numeric);
    return String(value);
  }

  function getTg() {
    return window.tg || (window.Telegram && window.Telegram.WebApp) || null;
  }

  function haptic(kind) {
    const tg = getTg();
    try {
      if (tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred) {
        tg.HapticFeedback.impactOccurred(kind || "light");
      }
    } catch (_) {}
  }

  function showAlert(msg) {
    const tg = getTg();
    if (tg && tg.showAlert) tg.showAlert(msg);
    else alert(msg);
  }

  function _normRarity(r) {
    r = String(r || "").toLowerCase().trim();
    if (!r) return "common";
    if (["common", "uncommon", "rare", "epic", "legendary"].includes(r)) return r;
    return "common";
  }

  function ensureEquippedStyles() {
    if (document.getElementById("equipped-styles")) return;
    const style = document.createElement("style");
    style.id = "equipped-styles";
    style.textContent = `
      .equip-stage-wrap{
        position:relative;
        width:100%;
        max-width:680px;
        margin:0 auto;
        border-radius:22px;
        overflow:hidden;
        background:radial-gradient(circle at 50% 0%, rgba(0,229,255,.22), rgba(0,0,0,.92));
        box-shadow:0 14px 40px rgba(0,0,0,.7);

        /* ✅ kontrola rozmiaru ikon (HOTSPOT) */
        --equip-icon-inset: 1px;     /* było 6px -> zmniejszało */
        --equip-icon-zoom: 122%;     /* lekki zoom, żeby padding w assetach nie zmniejszał */
      }

      /* upewnij się że obraz jest "pod" overlayem */
      #equipped-character-img{
        position:relative;
        z-index:1;
        display:block;
        width:100%;
        height:auto;
      }

      /* overlay MUSI siedzieć nad PNG */
      #equip-hotspots{
        position:absolute;
        inset:0;
        pointer-events:auto;
        z-index:5;
        opacity: 1 !important;
        visibility: visible !important;
      }

      .equip-hotspot{
        position:absolute;
        pointer-events:auto;
        border:0;
        padding:0;
        margin:0;
        background:transparent;
        border-radius:18px;
        -webkit-tap-highlight-color: transparent;

        /* 🔥 KLUCZ: NIE UCINAJ GLOW */
        overflow: visible !important;
      }

      .equip-hotspot:active{
        box-shadow:0 0 0 2px rgba(0,229,255,.78) inset, 0 0 22px rgba(0,229,255,.30);
        background-color: rgba(0,229,255,.10);
      }
      .equip-hotspot.is-empty:active{
        box-shadow:0 0 0 2px rgba(255,255,255,.25) inset;
        background-color: rgba(255,255,255,.06);
      }

      /* ✅ make Equipped page scrollable inside fixed Telegram view */
      #equipped-root{
        height: calc(var(--vh, 1vh) * 100);
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        touch-action: pan-y;
        padding-bottom:max(96px,calc(env(safe-area-inset-bottom) + 76px));
      }

      /* =========================================================
         ✅ Equipment Glow (UI-only)
         - master icons stay clean
         - glow controlled by UI: data-rarity + is-selected/is-equipped
         ========================================================= */

      /* Hotspot -> icon layer (background) */
      .equip-hotspot .equip-icon{
        position:absolute;
        inset: var(--equip-icon-inset);
        pointer-events:none;
        background-repeat:no-repeat;
        background-position:center;
        background-size: var(--equip-icon-zoom);

        /* delikatny baseline (w razie braku rarity) */
        filter:
          drop-shadow(0 0 8px rgba(0,255,255,.20))
          drop-shadow(0 0 18px rgba(0,255,255,.10));
        will-change: filter;
      }

      .equip-hotspot .equip-icon .equip-pet-sprite{
        position:absolute;
        inset:-14%;
        width:128%;
        height:128%;
      }
      .equip-icon-box .equip-pet-sprite{
        width:100%;
        height:100%;
      }
      .equip-pet-sprite canvas,
      .equip-pet-sprite img{
        width:100%;
        height:100%;
        object-fit:contain;
        image-rendering:pixelated;
        display:block;
      }

      /* rarity ladder (hotspot) — mocniejszy baseline */
      .equip-hotspot[data-rarity="common"] .equip-icon{
        filter: drop-shadow(0 0 7px rgba(255,255,255,.16)) drop-shadow(0 0 16px rgba(255,255,255,.08));
      }
      .equip-hotspot[data-rarity="uncommon"] .equip-icon{
        filter: drop-shadow(0 0 8px rgba(120,255,120,.26)) drop-shadow(0 0 18px rgba(120,255,120,.12));
      }
      .equip-hotspot[data-rarity="rare"] .equip-icon{
        filter: drop-shadow(0 0 8px rgba(90,170,255,.26)) drop-shadow(0 0 18px rgba(90,170,255,.12));
      }
      .equip-hotspot[data-rarity="epic"] .equip-icon{
        filter: drop-shadow(0 0 8px rgba(190,120,255,.26)) drop-shadow(0 0 18px rgba(190,120,255,.12));
      }
      .equip-hotspot[data-rarity="legendary"] .equip-icon{
        filter: drop-shadow(0 0 9px rgba(255,190,90,.28)) drop-shadow(0 0 20px rgba(255,190,90,.13));
      }

      /* ✅ boost zachowuje kolor rzadkości (hotspot) — MOCNIEJSZY */
      .equip-hotspot.is-selected[data-rarity="common"] .equip-icon,
      .equip-hotspot.is-equipped[data-rarity="common"] .equip-icon{
        filter: drop-shadow(0 0 10px rgba(255,255,255,.28)) drop-shadow(0 0 26px rgba(255,255,255,.14));
      }
      .equip-hotspot.is-selected[data-rarity="uncommon"] .equip-icon,
      .equip-hotspot.is-equipped[data-rarity="uncommon"] .equip-icon{
        filter: drop-shadow(0 0 12px rgba(120,255,120,.42)) drop-shadow(0 0 30px rgba(120,255,120,.20));
      }
      .equip-hotspot.is-selected[data-rarity="rare"] .equip-icon,
      .equip-hotspot.is-equipped[data-rarity="rare"] .equip-icon{
        filter: drop-shadow(0 0 12px rgba(90,170,255,.42)) drop-shadow(0 0 30px rgba(90,170,255,.20));
      }
      .equip-hotspot.is-selected[data-rarity="epic"] .equip-icon,
      .equip-hotspot.is-equipped[data-rarity="epic"] .equip-icon{
        filter: drop-shadow(0 0 12px rgba(190,120,255,.42)) drop-shadow(0 0 30px rgba(190,120,255,.20));
      }
      .equip-hotspot.is-selected[data-rarity="legendary"] .equip-icon,
      .equip-hotspot.is-equipped[data-rarity="legendary"] .equip-icon{
        filter: drop-shadow(0 0 14px rgba(255,190,90,.46)) drop-shadow(0 0 34px rgba(255,190,90,.22));
      }

      /* === Icon boxes (lista + inspect) === */
      .equip-icon-box{
        background: rgba(0,0,0,.40);
        display:block;
        overflow: visible !important; /* 🔥 KLUCZ: NIE UCINA GLOW */
        flex-shrink:0;
      }
      .equip-icon-box img{
        width:100%;
        height:100%;
        object-fit:contain;
        display:block;

        /* ✅ lekki zoom, żeby padding w plikach nie zmniejszał ikon */
        transform: scale(1.08);
        transform-origin: center;
      }

      /* Lista slotów — było 32px, dajemy większe */
      .equip-icon-box.sm{
        width:38px;
        height:38px;
        border-radius:10px;
      }
      .equip-icon-box.sm img{
        border-radius:10px;
      }

      /* Inspect — 72px (zostaje) */
      .equip-icon-box.lg{
        width:72px;
        height:72px;
        border-radius:14px;
      }
      .equip-icon-box.lg img{
        border-radius:14px;
      }

      /* Lista slotów — baseline glow (mocniejszy) */
      .equip-slot-btn img.item-icon{
        filter:
          drop-shadow(0 0 8px rgba(0,255,255,.20))
          drop-shadow(0 0 18px rgba(0,255,255,.10));
        will-change: filter;
      }

      .equip-slot-btn[data-rarity="common"] img.item-icon{
        filter: drop-shadow(0 0 7px rgba(255,255,255,.16)) drop-shadow(0 0 16px rgba(255,255,255,.08));
      }
      .equip-slot-btn[data-rarity="uncommon"] img.item-icon{
        filter: drop-shadow(0 0 8px rgba(120,255,120,.26)) drop-shadow(0 0 18px rgba(120,255,120,.12));
      }
      .equip-slot-btn[data-rarity="rare"] img.item-icon{
        filter: drop-shadow(0 0 8px rgba(90,170,255,.26)) drop-shadow(0 0 18px rgba(90,170,255,.12));
      }
      .equip-slot-btn[data-rarity="epic"] img.item-icon{
        filter: drop-shadow(0 0 8px rgba(190,120,255,.26)) drop-shadow(0 0 18px rgba(190,120,255,.12));
      }
      .equip-slot-btn[data-rarity="legendary"] img.item-icon{
        filter: drop-shadow(0 0 9px rgba(255,190,90,.28)) drop-shadow(0 0 20px rgba(255,190,90,.13));
      }

      /* ✅ boost per rarity (lista) — MOCNIEJSZY */
      .equip-slot-btn.is-selected[data-rarity="common"] img.item-icon{
        filter: drop-shadow(0 0 10px rgba(255,255,255,.28)) drop-shadow(0 0 26px rgba(255,255,255,.14));
      }
      .equip-slot-btn.is-selected[data-rarity="uncommon"] img.item-icon{
        filter: drop-shadow(0 0 12px rgba(120,255,120,.42)) drop-shadow(0 0 30px rgba(120,255,120,.20));
      }
      .equip-slot-btn.is-selected[data-rarity="rare"] img.item-icon{
        filter: drop-shadow(0 0 12px rgba(90,170,255,.42)) drop-shadow(0 0 30px rgba(90,170,255,.20));
      }
      .equip-slot-btn.is-selected[data-rarity="epic"] img.item-icon{
        filter: drop-shadow(0 0 12px rgba(190,120,255,.42)) drop-shadow(0 0 30px rgba(190,120,255,.20));
      }
      .equip-slot-btn.is-selected[data-rarity="legendary"] img.item-icon{
        filter: drop-shadow(0 0 14px rgba(255,190,90,.46)) drop-shadow(0 0 34px rgba(255,190,90,.22));
      }

      /* Inspect — też per rarity (dostaje data-rarity na boxie) */
      .equip-icon-box[data-rarity="common"] img.item-icon{
        filter: drop-shadow(0 0 7px rgba(255,255,255,.16)) drop-shadow(0 0 16px rgba(255,255,255,.08));
      }
      .equip-icon-box[data-rarity="uncommon"] img.item-icon{
        filter: drop-shadow(0 0 8px rgba(120,255,120,.26)) drop-shadow(0 0 18px rgba(120,255,120,.12));
      }
      .equip-icon-box[data-rarity="rare"] img.item-icon{
        filter: drop-shadow(0 0 8px rgba(90,170,255,.26)) drop-shadow(0 0 18px rgba(90,170,255,.12));
      }
      .equip-icon-box[data-rarity="epic"] img.item-icon{
        filter: drop-shadow(0 0 8px rgba(190,120,255,.26)) drop-shadow(0 0 18px rgba(190,120,255,.12));
      }
      .equip-icon-box[data-rarity="legendary"] img.item-icon{
        filter: drop-shadow(0 0 9px rgba(255,190,90,.28)) drop-shadow(0 0 20px rgba(255,190,90,.13));
      }
      /* ===== OVERRIDE: EPIC/LEGENDARY RICH GLOW (slot ring + halo) ===== */

.equip-hotspot{ overflow: visible !important; }

/* ring + halo na slocie (działa nawet jak ikona jest ciemna) */
.equip-hotspot::after{
  content:"";
  position:absolute;
  inset:-6px;
  border-radius: inherit;
  pointer-events:none;
  opacity:0;           /* domyślnie OFF */
  filter: blur(6px);
  transition: opacity .12s ease;
}

/* EPIC */
.equip-hotspot[data-rarity="epic"]{
  box-shadow:
    0 0 0 1px rgba(255,255,255,.10) inset,
    0 0 18px rgba(190,120,255,.22),
    0 0 34px rgba(190,120,255,.14);
}
.equip-hotspot[data-rarity="epic"]::after{
  opacity:.55;
  background:
    radial-gradient(closest-side, rgba(190,120,255,.45), transparent 68%),
    radial-gradient(closest-side, rgba(255,255,255,.10), transparent 72%);
}

/* LEGENDARY (gold + white halo) */
.equip-hotspot[data-rarity="legendary"]{
  box-shadow:
    0 0 0 1px rgba(255,255,255,.12) inset,
    0 0 20px rgba(255,190,90,.26),
    0 0 44px rgba(255,190,90,.16),
    0 0 14px rgba(255,255,255,.08);
}
.equip-hotspot[data-rarity="legendary"]::after{
  opacity:.70;
  background:
    radial-gradient(closest-side, rgba(255,190,90,.52), transparent 66%),
    radial-gradient(closest-side, rgba(255,255,255,.16), transparent 74%);
}

/* mocniej na samej ikonie (bo u Ciebie to background-image na .equip-icon) */
.equip-hotspot[data-rarity="epic"] .equip-icon{
  filter:
    drop-shadow(0 0 10px rgba(255,255,255,.10))
    drop-shadow(0 0 16px rgba(190,120,255,.55))
    drop-shadow(0 0 36px rgba(190,120,255,.22));
}
.equip-hotspot[data-rarity="legendary"] .equip-icon{
  filter:
    drop-shadow(0 0 10px rgba(255,255,255,.18))
    drop-shadow(0 0 18px rgba(255,190,90,.70))
    drop-shadow(0 0 44px rgba(255,190,90,.28));
}

/* selected/equipped = jeszcze mocniej */
.equip-hotspot.is-selected[data-rarity="epic"]::after,
.equip-hotspot.is-equipped[data-rarity="epic"]::after{ opacity:.85; }

.equip-hotspot.is-selected[data-rarity="legendary"]::after,
.equip-hotspot.is-equipped[data-rarity="legendary"]::after{ opacity:1; }

      .equip-hotspot{
        min-width:44px;
        min-height:44px;
        color:#eefaff;
        cursor:pointer;
      }
      .equip-hotspot.is-selected{
        z-index:8;
        outline:2px solid rgba(94,225,255,.94);
        outline-offset:2px;
        box-shadow:
          0 0 0 1px rgba(181,245,255,.25) inset,
          0 0 20px rgba(46,203,255,.38);
      }
      .equip-hotspot-label{
        position:absolute;
        left:50%;
        bottom:-15px;
        transform:translateX(-50%);
        max-width:86px;
        padding:2px 5px;
        border-radius:999px;
        background:rgba(3,8,16,.88);
        border:1px solid rgba(255,255,255,.13);
        color:#dff8ff;
        font-size:9px;
        line-height:1.15;
        font-weight:850;
        letter-spacing:.25px;
        text-transform:uppercase;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        pointer-events:none;
      }
      .equip-selected-mark{
        position:absolute;
        top:-8px;
        right:-8px;
        min-width:18px;
        height:18px;
        display:grid;
        place-items:center;
        border-radius:999px;
        background:#76e7ff;
        color:#04121a;
        border:2px solid rgba(3,8,16,.92);
        font-size:10px;
        font-weight:950;
        opacity:0;
        pointer-events:none;
      }
      .equip-hotspot.is-selected .equip-selected-mark{ opacity:1; }

      #equip-main{
        display:block !important;
      }
      #equip-avatar,
      #equip-slots{
        min-width:0 !important;
        width:100%;
        max-width:680px;
        margin:0 auto;
      }
      #equip-slots{ margin-top:14px; }
      .equip-stat-summary{
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:6px;
        width:100%;
        padding:10px;
        border-radius:16px;
        background:rgba(5,11,22,.82);
        border:1px solid rgba(255,255,255,.09);
      }
      .equip-stat-chip{
        min-width:0;
        padding:7px 4px;
        border-radius:10px;
        background:rgba(255,255,255,.045);
        text-align:center;
      }
      .equip-stat-chip span{
        display:block;
        color:#8295ad;
        font-size:9px;
        letter-spacing:.45px;
      }
      .equip-stat-chip b{
        display:block;
        margin-top:2px;
        color:#f3fbff;
        font-size:12px;
        overflow-wrap:anywhere;
      }
      .equip-selected-panel{
        padding:14px;
        border-radius:20px;
        background:
          radial-gradient(circle at 100% 0%,rgba(49,182,255,.10),transparent 36%),
          linear-gradient(180deg,rgba(17,25,42,.96),rgba(7,11,21,.97));
        border:1px solid rgba(136,220,255,.15);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 16px 34px rgba(0,0,0,.22);
      }
      .equip-selected-head{
        display:grid;
        grid-template-columns:88px minmax(0,1fr);
        gap:13px;
        align-items:start;
      }
      .equip-selected-art{
        width:88px;
        height:88px;
        border-radius:17px;
        background:rgba(0,0,0,.36);
        border:1px solid rgba(255,255,255,.12);
        overflow:visible;
      }
      .equip-selected-art img{
        width:100%;
        height:100%;
        object-fit:contain;
        display:block;
      }
      .equip-selected-stats{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
        margin-top:13px;
      }
      .equip-selected-stat{
        padding:7px 9px;
        border-radius:10px;
        background:rgba(255,255,255,.055);
        border:1px solid rgba(255,255,255,.08);
        color:#dcecff;
        font-size:11px;
        overflow-wrap:anywhere;
      }
      .equip-selected-actions{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:9px;
        margin-top:14px;
        padding-bottom:max(2px,env(safe-area-inset-bottom));
      }
      .equip-selected-actions button{
        min-height:44px;
        border-radius:13px;
        font-weight:850;
        cursor:pointer;
      }
      .equip-summary-card{
        max-width:680px;
        margin:10px auto 0;
        padding:11px 13px;
        border-radius:15px;
        background:rgba(5,11,22,.76);
        border:1px solid rgba(255,255,255,.08);
        color:#cbd9e9;
        line-height:1.45;
      }
      .equip-summary-card summary{
        cursor:pointer;
        color:#edf8ff;
        font-weight:800;
      }
      @media (max-width:420px){
        #equipped-root{ padding-left:10px !important; padding-right:10px !important; }
        .equip-hotspot-label{ bottom:-13px; max-width:68px; font-size:8px; }
        .equip-stat-summary{ grid-template-columns:repeat(3,minmax(0,1fr)); }
        .equip-stat-chip:first-child{ grid-column:span 3; }
        .equip-selected-head{ grid-template-columns:76px minmax(0,1fr); gap:11px; }
        .equip-selected-art{ width:76px; height:76px; }
      }

      /* Equipped P1.5A polish; slot geometry remains owned by SLOT_COORDS. */
      #equipped-root{
        box-sizing:border-box;
        padding:12px 12px max(104px,calc(env(safe-area-inset-bottom) + 84px)) !important;
        background:
          radial-gradient(circle at 50% -8%,rgba(39,167,220,.12),transparent 34%),
          linear-gradient(180deg,#07101d 0%,#050914 52%,#040711 100%);
      }
      .equip-local-header{
        position:sticky;
        top:0;
        z-index:20;
        display:grid;
        grid-template-columns:1fr auto 1fr;
        align-items:center;
        gap:8px;
        min-height:48px;
        margin:0 0 12px;
        padding:max(4px,env(safe-area-inset-top)) 2px 7px;
        background:linear-gradient(180deg,rgba(7,16,29,.98) 72%,rgba(7,16,29,0));
      }
      .equip-local-header h2{
        margin:0;
        color:#f4fbff;
        font-size:18px;
        line-height:1;
        font-weight:900;
        letter-spacing:.2px;
        text-align:center;
      }
      .equip-header-btn,
      .equip-action-btn{
        min-height:44px;
        border:1px solid rgba(171,221,244,.16);
        border-radius:13px;
        color:#eaf8ff;
        background:rgba(255,255,255,.065);
        font:inherit;
        font-size:12px;
        font-weight:850;
        letter-spacing:.15px;
        cursor:pointer;
        -webkit-tap-highlight-color:transparent;
        transition:transform 150ms ease,background-color 150ms ease,border-color 150ms ease,box-shadow 150ms ease;
      }
      .equip-header-btn:first-child{ justify-self:start; padding:0 13px; }
      .equip-header-btn:last-child{
        justify-self:end;
        padding:0 13px;
        border-color:rgba(91,213,255,.25);
        background:rgba(24,119,159,.20);
      }
      .equip-header-btn:active,
      .equip-action-btn:active{ transform:scale(.97); }
      .equip-header-btn:focus-visible,
      .equip-action-btn:focus-visible,
      .equip-hotspot:focus-visible{
        outline:2px solid #72dfff;
        outline-offset:2px;
      }
      .equip-stage-wrap{
        border:1px solid rgba(149,218,245,.13);
        background:
          radial-gradient(circle at 50% 4%,rgba(27,177,222,.16),transparent 38%),
          linear-gradient(180deg,rgba(9,21,37,.98),rgba(2,6,13,.99));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.055),
          inset 0 -24px 54px rgba(0,0,0,.34),
          0 18px 42px rgba(0,0,0,.34);
      }
      .equip-hotspot{
        transition:transform 160ms ease,filter 160ms ease,box-shadow 160ms ease,background-color 160ms ease;
      }
      .equip-hotspot:active{ transform:scale(.97); }
      .equip-hotspot::after{
        opacity:.18 !important;
        filter:none !important;
        box-shadow:0 0 0 1px rgba(170,225,247,.13) inset,0 0 14px rgba(57,185,231,.12) !important;
      }
      .equip-hotspot.is-selected::after{
        opacity:.72 !important;
        box-shadow:0 0 0 1px rgba(173,240,255,.38) inset,0 0 18px rgba(76,211,255,.28) !important;
      }
      .equip-hotspot[data-rarity="epic"] .equip-icon,
      .equip-hotspot[data-rarity="legendary"] .equip-icon{
        filter:drop-shadow(0 0 8px rgba(105,211,255,.26));
      }
      .equip-hotspot-label{
        bottom:-14px;
        display:flex;
        align-items:center;
        justify-content:center;
        height:17px;
        max-width:82px;
        box-sizing:border-box;
        padding:1px 6px;
        background:rgba(3,8,16,.92);
        border-color:rgba(175,224,244,.16);
        box-shadow:0 3px 8px rgba(0,0,0,.28);
        line-height:1;
      }
      .equip-selected-mark{
        top:2px;
        right:2px;
        width:18px;
        min-width:18px;
        height:18px;
        border-width:1px;
        box-shadow:0 3px 8px rgba(0,0,0,.34);
      }
      .equip-stat-summary{
        grid-template-columns:repeat(5,minmax(0,1fr));
        padding:8px;
        border-radius:14px;
        background:rgba(8,16,29,.88);
        border-color:rgba(156,214,239,.11);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.035);
      }
      .equip-level-strip{
        display:flex;
        align-items:center;
        justify-content:space-between;
        width:100%;
        box-sizing:border-box;
        padding:9px 12px;
        border:1px solid rgba(103,218,255,.16);
        border-radius:13px;
        background:linear-gradient(90deg,rgba(21,109,146,.20),rgba(255,255,255,.035));
      }
      .equip-level-strip span{
        color:#82a4b9;
        font-size:9px;
        font-weight:850;
        letter-spacing:.9px;
      }
      .equip-level-strip b{ color:#effaff; font-size:14px; }
      .equip-stat-chip{
        min-height:38px;
        box-sizing:border-box;
        padding:6px 3px;
        border:1px solid rgba(255,255,255,.045);
        background:rgba(255,255,255,.035);
      }
      .equip-stat-chip:first-child{ grid-column:auto; }
      .equip-selected-panel{
        overflow:hidden;
        padding:13px;
        border-radius:18px;
        animation:equipPanelIn 150ms ease-out;
      }
      .equip-selected-panel[data-rarity="epic"]{ border-color:rgba(175,112,255,.24); }
      .equip-selected-panel[data-rarity="legendary"]{ border-color:rgba(255,196,92,.25); }
      .equip-selected-head{
        grid-template-columns:84px minmax(0,1fr);
        gap:12px;
        align-items:center;
      }
      .equip-selected-art{
        width:84px;
        height:84px;
        box-sizing:border-box;
        padding:5px;
        border-radius:15px;
        overflow:hidden;
      }
      .equip-selected-art img{ border-radius:11px; }
      .equip-selected-slot-label{
        color:#72dfff;
        font-size:9px;
        font-weight:900;
        letter-spacing:.85px;
        text-transform:uppercase;
      }
      .equip-selected-name{
        display:-webkit-box;
        margin-top:5px;
        overflow:hidden;
        color:#f4f9ff;
        font-size:18px;
        line-height:1.16;
        font-weight:900;
        overflow-wrap:anywhere;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:2;
      }
      .equip-selected-meta{
        margin-top:7px;
        color:#92a8bc;
        font-size:10px;
        font-weight:750;
        letter-spacing:.45px;
        text-transform:uppercase;
      }
      .equip-selected-stats{ gap:6px; margin-top:11px; }
      .equip-selected-stat{
        display:inline-flex;
        align-items:center;
        gap:5px;
        padding:6px 8px;
        border-color:rgba(139,204,232,.09);
        background:rgba(255,255,255,.04);
        color:#8fa5b9;
        font-size:10px;
        font-weight:800;
        letter-spacing:.25px;
      }
      .equip-selected-stat b{ color:#edf9ff; font-size:11px; }
      .equip-action-btn{ width:100%; min-height:44px; }
      .equip-action-btn.is-inspect,
      .equip-action-btn.is-inventory{
        border-color:rgba(92,216,255,.28);
        background:rgba(23,125,168,.22);
        color:#dff8ff;
      }
      .equip-action-btn.is-unequip{
        border-color:rgba(255,128,139,.22);
        background:rgba(91,23,34,.76);
        color:#ffd9de;
      }
      .equip-empty-copy{
        margin-top:6px;
        color:#92a8bc;
        font-size:12px;
        line-height:1.45;
      }
      .equip-summary-card{
        padding:12px 13px;
        border-radius:14px;
        background:rgba(7,14,25,.78);
      }
      .equip-summary-card.is-sets{
        border-color:rgba(91,213,255,.15);
        background:linear-gradient(180deg,rgba(11,29,45,.88),rgba(6,13,24,.88));
      }
      .equip-summary-card.is-total{ opacity:.92; }
      .equip-summary-card summary{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        list-style:none;
        font-size:12px;
      }
      .equip-summary-card summary::-webkit-details-marker{ display:none; }
      .equip-summary-count{
        display:inline-grid;
        min-width:21px;
        height:21px;
        place-items:center;
        border-radius:999px;
        background:rgba(105,218,255,.12);
        color:#aeeeff;
        font-size:10px;
      }
      .equip-summary-rows{ display:grid; gap:6px; margin-top:9px; }
      .equip-summary-row{
        display:flex;
        justify-content:space-between;
        gap:12px;
        padding:7px 8px;
        border-radius:9px;
        background:rgba(255,255,255,.035);
        color:#d9e9f4;
        font-size:11px;
      }
      .equip-summary-row b{ color:#83dffb; }
      .equip-total-chips{ display:flex; flex-wrap:wrap; gap:6px; margin-top:9px; }
      @keyframes equipPanelIn{
        from{ opacity:.72; transform:translateY(3px); }
        to{ opacity:1; transform:translateY(0); }
      }
      @media (max-width:420px){
        .equip-hotspot-label{ max-width:68px; height:16px; }
        .equip-selected-head{ grid-template-columns:78px minmax(0,1fr); gap:10px; }
        .equip-selected-art{ width:78px; height:78px; }
        .equip-selected-name{ font-size:17px; }
      }
      @media (prefers-reduced-motion:reduce){
        .equip-hotspot,
        .equip-header-btn,
        .equip-action-btn{ transition:none; }
        .equip-selected-panel{ animation:none; }
        .equip-hotspot:active,
        .equip-header-btn:active,
        .equip-action-btn:active{ transform:none; }
      }
    `;
    document.head.appendChild(style);
  }

  // Uniwersalny POST tylko dla Equipped – nie zależy od globalnego apiPost
  async function equippedPost(path, payload) {
    const tg = getTg();
    const initData = (tg && tg.initData) || window.INIT_DATA || "";

    if (!initData) {
      console.warn("Equipped: NO initData – działa poprawnie tylko wewnątrz Telegram Mini App.");
      throw new Error("NO_INIT_DATA");
    }

    const resp = await fetch((API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ initData }, payload || {})),
    });

    let data = null;
    try {
      data = await resp.json();
    } catch (e) {
      console.error("Equipped: JSON parse error", e);
    }

    if (!resp.ok) {
      console.error("Equipped API error", resp.status, data);
      return data || { ok: false, reason: "http_" + resp.status };
    }
    return data;
  }

  // Ładowanie PNG postaci z backendu
  async function loadCharacterPngInto(imgEl, onLoaded, requestToken) {
    if (!imgEl) return;
    const tg = getTg();
    const initData = (tg && tg.initData) || window.INIT_DATA || "";
    if (!initData) {
      window.__EquippedPreviewReady = true;
      console.warn("Equipped: no initData for /api/character-image");
      return;
    }

    const token = Number(requestToken || 0) || 0;
    window.__EquippedPreviewReady = false;
    if (window.__EquippedCharImgUrl) {
      try { URL.revokeObjectURL(window.__EquippedCharImgUrl); } catch (_) {}
      window.__EquippedCharImgUrl = "";
    }

    try {
      const resp = await fetch((API_BASE || "") + "/api/character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      if (!resp.ok) {
        window.__EquippedPreviewReady = true;
        console.error("Equipped: character-image resp not ok:", resp.status);
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      if (token && window.__EquippedPreviewToken && token !== window.__EquippedPreviewToken) {
        URL.revokeObjectURL(url);
        return;
      }

      imgEl.onload = () => {
        if (token && window.__EquippedPreviewToken && token !== window.__EquippedPreviewToken) return;
        window.__EquippedPreviewReady = true;
        window.__EquippedPreviewReadyAt = Date.now();
        try { onLoaded && onLoaded(); } catch (_) {}
      };

      imgEl.src = url;

      if (window.__EquippedCharImgUrl) {
        URL.revokeObjectURL(window.__EquippedCharImgUrl);
      }
      window.__EquippedCharImgUrl = url;
    } catch (err) {
      window.__EquippedPreviewReady = true;
      console.error("Equipped: loadCharacterImage error", err);
    }
  }

  function _bgCandidates(o) {
    if (typeof _iconCandidates === "function") return _iconCandidates(o);

    const raw = o?.icon || o?.img || o?.image || o?.image_path || o?.imageUrl || "";
    const key = String(o?.item_key || o?.key || o?.itemKey || o?.item || "").trim().toLowerCase();
    const isGear = !!o?.slot;

    const list = [];
    if (raw) list.push(raw);
    if (key) {
      list.push(isGear ? `/assets/equip/${key}.png` : `/assets/items/${key}.png`);
      list.push(isGear ? `/assets/equip/${key}.webp` : `/assets/items/${key}.webp`);
    }
    list.push(`/assets/items/unknown.png`);

    const base = window.location.origin;
    const v = window.WEBAPP_VER || "";

    return [...new Set(list.filter(Boolean).map((u) => {
      let p = String(u).trim();
      if (/^https?:\/\//i.test(p)) return p;
      if (!p.startsWith("/")) p = "/" + p.replace(/^\.?\//, "");
      let url = base + p;
      if (v) url += (url.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(v);
      return url;
    }))];
  }

  function _setBgWithFallback(el, o) {
    if (!el) return;

    const urls = _bgCandidates(o);
    let i = 0;

    const tryOne = () => {
      const CLOUD = "dnjwvxinh";
      const CDN = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto`;

      const u = urls[i];
      if (!u) {
        const ph = new Image();
        ph.onload  = () => { el.style.backgroundImage = `url('${CDN}/items/unknown.png')`; };
        ph.onerror = () => { el.style.backgroundImage = `url('${CDN}/items/_unknown.png')`; };
        ph.src = `${CDN}/items/unknown.png`;
        return;
      }

      const im = new Image();
      im.onload = () => { el.style.backgroundImage = `url('${u}')`; };
      im.onerror = () => { i++; if (i < urls.length) tryOne(); else el.style.backgroundImage = `url('${CDN}/items/unknown.png')`; };
      im.src = u;
    };

    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("visibility", "visible", "important");
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
    el.style.backgroundSize = "contain";

    tryOne();
  }

  function _mountPetSprite(container, pet, className) {
    if (!container || !pet || !pet.isPet || !window.PetSprite?.hasSprite?.(pet)) return false;
    try {
      container.style.backgroundImage = "none";
      container.textContent = "";
      window.PetSprite.mount(container, pet, {
        state: "idle",
        className: className || "equip-pet-sprite",
        fallbackUrl: pet.icon || pet.img || "",
        alt: pet.name || pet.itemName || "pet"
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  function toPctRatio(r) {
    return (r * 100).toFixed(4) + "%";
  }

  window.Equipped = {
    state: null,
    selectedEquippedSlotKey: null,

    _containerEl: null,
    _containerPrev: null,

    _restoreContainer() {
      const c = this._containerEl;
      const p = this._containerPrev || {};
      if (!c) return;
      try { c.style.height = (p.height != null ? p.height : ""); } catch (_) {}
      try { c.style.overflow = (p.overflow != null ? p.overflow : ""); } catch (_) {}
    },

    _canonicalSlotKeys() {
      return SLOT_ORDER.slice();
    },

    _slotState(slotKey) {
      const key = String(slotKey || "").toLowerCase();
      const current = (this.state?.slots || []).find((slot) => String(slot?.slot || "").toLowerCase() === key);
      return current || { slot: key, label: slotLabel(key), empty: true };
    },

    _ensureSelectedSlot() {
      const keys = this._canonicalSlotKeys();
      if (!keys.length) {
        this.selectedEquippedSlotKey = null;
        return null;
      }
      if (keys.includes(this.selectedEquippedSlotKey)) return this.selectedEquippedSlotKey;

      const helmet = keys.includes("helmet") ? this._slotState("helmet") : null;
      if (helmet && !helmet.empty) {
        this.selectedEquippedSlotKey = "helmet";
        return this.selectedEquippedSlotKey;
      }

      const firstOccupied = keys.find((key) => !this._slotState(key).empty);
      this.selectedEquippedSlotKey = firstOccupied || (keys.includes("helmet") ? "helmet" : keys[0]);
      return this.selectedEquippedSlotKey;
    },

    _selectSlot(slotKey) {
      const key = String(slotKey || "").toLowerCase();
      if (!this._canonicalSlotKeys().includes(key)) return;
      this.selectedEquippedSlotKey = key;
      try {
        document.querySelectorAll("#equip-hotspots .equip-hotspot.is-selected").forEach((el) => el.classList.remove("is-selected"));

        const hs = document.querySelector(`#equip-hotspots .equip-hotspot[data-slot="${key}"]`);
        if (hs) hs.classList.add("is-selected");
      } catch (_) {}
      this._renderSelectedSlotPanel();
    },

    closeInspect() {
      const back = document.getElementById("invItemBack");
      if (back?.dataset?.open !== "1") return false;
      try {
        window.Inventory?.closeItem?.();
        return true;
      } catch (_) {
        return false;
      }
    },

    close() {
      try { this.closeInspect(); } catch (_) {}
      try { this._restoreContainer(); } catch (_) {}
      try { window.navClose?.("equipped-root"); } catch (_) {}
      try {
        if (typeof window.goHome === "function") {
          window.goHome();
        } else {
          window.location.reload();
        }
      } catch (_) {
        window.location.reload();
      }
      return true;
    },

    async open() {
      ensureEquippedStyles();

      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach((el) => {
        el.style.display = "none";
      });

      const container = document.getElementById("app") || document.body;

      try {
        this._containerEl = container;
        this._containerPrev = {
          height: container.style.height,
          overflow: container.style.overflow,
        };
        container.style.height = "calc(var(--vh, 1vh) * 100)";
        container.style.overflow = "hidden";
      } catch (_) {}

      container.innerHTML = `
        <div id="equipped-root" style="padding:16px 16px 24px;color:#fff;max-width:760px;margin:0 auto;font-family:system-ui;">
          <header class="equip-local-header">
            <button type="button" class="equip-header-btn" data-equipped-action="back">Back</button>
            <h2>Equipped</h2>
            <button type="button" class="equip-header-btn" data-equipped-action="open-inventory">Inventory</button>
          </header>

          <div id="equip-main">
            <div id="equip-avatar" style="text-align:center;">
              <div style="font-size:13px;opacity:.8;padding:24px 8px;">Loading character...</div>
            </div>

            <div id="equip-slots">
              <div style="font-size:13px;opacity:.8;padding:24px 8px;text-align:center;">Loading selected slot...</div>
            </div>
          </div>

          <div id="equip-sets"></div>
          <div id="equip-total"></div>
        </div>
      `;
      this._bindEquippedEvents();

      try {
        window.navRegister?.("equipped-root", {
          close: () => this.close(),
          isOpen: () => !!document.getElementById("equipped-root"),
        });
        window.navOpen?.("equipped-root");
      } catch (_) {}

      try {
        await this.refresh();
      } catch (e) {
        console.error("Equipped.open error", e);
        showAlert("Error while loading equipped.");
      }
    },

    async refresh() {
      try {
        window.__EquippedPreviewReady = false;
        const res = await equippedPost("/webapp/equipped/state", {});
        if (!res || !res.ok) {
          console.error("Equipped.state error:", res);
          showAlert("Failed to load equipped state.");
          return;
        }
        this.state = res.data;
        this.render();
      } catch (err) {
        console.error("Equipped.refresh error", err);
        showAlert("Error while loading equipped.");
        throw err;
      }
    },

    _bindEquippedEvents() {
      const root = document.getElementById("equipped-root");
      if (!root || root.dataset.equippedEventsBound === "1") return;
      root.dataset.equippedEventsBound = "1";
      root.addEventListener("click", (event) => {
        const slotButton = event.target.closest("[data-equip-slot]");
        if (slotButton && root.contains(slotButton)) {
          event.preventDefault();
          event.stopPropagation();
          haptic("light");
          this._selectSlot(slotButton.dataset.equipSlot);
          return;
        }

        const actionButton = event.target.closest("[data-equipped-action]");
        if (!actionButton || !root.contains(actionButton)) return;
        event.preventDefault();
        event.stopPropagation();
        const action = actionButton.dataset.equippedAction;
        if (action === "back") this.close();
        else if (action === "inspect") this.inspectSelected();
        else if (action === "unequip") this.unequipSelected();
        else if (action === "open-inventory") this.openInventory();
      });
    },

    _renderP1() {
      if (!this.state) return;
      const avatarBox = document.getElementById("equip-avatar");
      const stats = this.state.stats || {};
      const level = stats.level || this.state.level || 1;
      this._ensureSelectedSlot();

      if (avatarBox) {
        const statRows = [
          ["HP", stats.hp],
          ["ATK", stats.attack],
          ["DEF", stats.defense],
          ["AGI", stats.agility],
          ["LUCK", stats.luck],
        ];
        avatarBox.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div class="equip-stage-wrap" aria-label="Equipment slot board">
              <img id="equipped-character-img" alt="Character" />
              <div id="equip-hotspots"></div>
            </div>
            <div class="equip-level-strip">
              <span>LEVEL</span>
              <b>${esc(level)}</b>
            </div>
            <div class="equip-stat-summary">
              ${statRows.map(([label, value]) => `
                <div class="equip-stat-chip">
                  <span>${label}</span>
                  <b>${esc(value ?? "?")}</b>
                </div>
              `).join("")}
            </div>
          </div>
        `;

        const imgEl = document.getElementById("equipped-character-img");
        const previewToken = (Number(window.__EquippedPreviewToken || 0) || 0) + 1;
        window.__EquippedPreviewToken = previewToken;
        window.__EquippedPreviewReady = false;
        loadCharacterPngInto(imgEl, () => this._mountHotspots(), previewToken);
        this._waitAndMountHotspots();
      }

      this._renderSelectedSlotPanel();
      this._renderSummaries();
    },

    _renderSelectedSlotPanel() {
      const panel = document.getElementById("equip-slots");
      if (!panel) return;
      const slotKey = this._ensureSelectedSlot();
      if (!slotKey) {
        panel.innerHTML = "";
        return;
      }

      const slot = this._slotState(slotKey);
      const label = slotLabel(slotKey, slot);
      if (slot.empty) {
        panel.innerHTML = `
          <section class="equip-selected-panel" aria-live="polite" data-rarity="common">
            <div class="equip-selected-slot-label">${esc(label)}</div>
            <div class="equip-selected-name">Empty slot</div>
            <div class="equip-empty-copy">Equip an item from Inventory.</div>
            <div class="equip-selected-actions" style="grid-template-columns:1fr;">
              <button type="button" class="equip-action-btn is-inventory" data-equipped-action="open-inventory">
                OPEN INVENTORY
              </button>
            </div>
          </section>
        `;
        return;
      }

      const itemKey = String(slot.item_key || slot.key || slot.itemKey || slot.item || "");
      const name = slot.name || itemKey || "Unknown item";
      const rarity = _normRarity(slot.rarity);
      const stats = slot.stats && typeof slot.stats === "object" ? slot.stats : {};
      const statEntries = Object.keys(stats);
      const statsHtml = statEntries.length
        ? statEntries.map((key) => `<span class="equip-selected-stat">${esc(statPresentationLabel(key))} <b>${esc(formattedStatValue(stats[key]))}</b></span>`).join("")
        : (slot.bonusesText ? `<span class="equip-selected-stat">${esc(slot.bonusesText)}</span>` : "");
      const canInspect = !!itemKey && typeof window.Inventory?.openEquippedItem === "function";
      const levelText = slot.level != null ? `Level ${esc(slot.level)}` : "";

      panel.innerHTML = `
        <section class="equip-selected-panel" aria-live="polite" data-rarity="${rarity}">
          <div class="equip-selected-head">
            <div class="equip-selected-art equip-icon-box" data-rarity="${rarity}">
              ${slot.icon ? `<img src="${esc(slot.icon)}" class="item-icon" alt="">` : ""}
            </div>
            <div style="min-width:0;">
              <div class="equip-selected-slot-label">${esc(label)}</div>
              <div class="equip-selected-name">${esc(name)}</div>
              <div class="equip-selected-meta">
                ${slot.rarity ? esc(slot.rarity) : ""}${slot.rarity && levelText ? " · " : ""}${levelText}
              </div>
            </div>
          </div>
          ${statsHtml ? `<div class="equip-selected-stats">${statsHtml}</div>` : ""}
          <div class="equip-selected-actions">
            ${canInspect ? `
              <button type="button" class="equip-action-btn is-inspect" data-equipped-action="inspect">
                INSPECT
              </button>
            ` : ""}
            <button type="button" class="equip-action-btn is-unequip" data-equipped-action="unequip"
                    ${canInspect ? "" : 'style="grid-column:1/-1;"'}>
              UNEQUIP
            </button>
          </div>
        </section>
      `;

      const art = panel.querySelector(".equip-selected-art");
      if (art && !_mountPetSprite(art, slot, "equip-pet-sprite equip-pet-sprite-selected") && !slot.icon) {
        _setBgWithFallback(art, slot);
      }
    },

    _renderSummaries() {
      const setsBox = document.getElementById("equip-sets");
      const totalBox = document.getElementById("equip-total");
      const sets = this.state?.activeSets || this.state?.active_sets || [];
      const total = this.state?.totalBonus || this.state?.total_bonus || {};
      const totalKeys = Object.keys(total);

      if (setsBox) {
        setsBox.innerHTML = sets.length ? `
          <details class="equip-summary-card is-sets" ${sets.length === 1 ? "open" : ""}>
            <summary><span>Active set bonuses</span><span class="equip-summary-count">${sets.length}</span></summary>
            <div class="equip-summary-rows">
              ${sets.map((set) => `<div class="equip-summary-row"><span>${esc(set.set)}</span><b>${esc(set.count)} equipped</b></div>`).join("")}
            </div>
          </details>
        ` : "";
      }

      if (totalBox) {
        totalBox.innerHTML = totalKeys.length ? `
          <details class="equip-summary-card is-total">
            <summary><span>Total gear bonus</span><span class="equip-summary-count">${totalKeys.length}</span></summary>
            <div class="equip-total-chips">
              ${totalKeys.map((key) => `<span class="equip-selected-stat">${esc(key)}+${esc(total[key])}</span>`).join("")}
            </div>
          </details>
        ` : "";
      }
    },

    openInventory() {
      try { window.navClose?.("equipped-root"); } catch (_) {}
      try { this._restoreContainer(); } catch (_) {}
      if (typeof window.Inventory?.open === "function") window.Inventory.open();
    },

    inspectSelected() {
      const slot = this._slotState(this.selectedEquippedSlotKey);
      if (!slot || slot.empty) return;
      const itemKey = String(slot.item_key || slot.key || slot.itemKey || slot.item || "");
      if (!itemKey || typeof window.Inventory?.openEquippedItem !== "function") return;
      window.Inventory.openEquippedItem(itemKey);
    },

    async unequipSelected() {
      const slotKey = this.selectedEquippedSlotKey;
      const slot = this._slotState(slotKey);
      if (!slotKey || !slot || slot.empty) return;
      try {
        const res = await equippedPost("/webapp/equipped/unequip", { slot: slotKey });
        if (res && res.ok) {
          this.state = res.data;
          this.render();
        } else {
          showAlert("Failed to unequip.");
        }
      } catch (err) {
        console.error("Equipped.unequip error", err);
        showAlert("Failed to unequip.");
      }
    },

    render() {
      return this._renderP1();

      if (!this.state) return;

      const avatarBox = document.getElementById("equip-avatar");
      const slotsBox = document.getElementById("equip-slots");
      const setsBox = document.getElementById("equip-sets");
      const totalBox = document.getElementById("equip-total");

      const stats = this.state.stats || {};
      const level = stats.level || this.state.level || 1;
      const hp = stats.hp;
      const atk = stats.attack;
      const def = stats.defense;
      const agi = stats.agility;
      const luck = stats.luck;

      // --- LEFT: PNG + HOTSPOTY ---
      if (avatarBox) {
        avatarBox.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div class="equip-stage-wrap">
              <img id="equipped-character-img"
                   alt="Character"
                   style="width:100%;height:auto;display:block;" />
              <div id="equip-hotspots"></div>
            </div>

            <div style="font-size:13px;opacity:.95;">
              Level <b>${level}</b>
            </div>
            <div style="font-size:11px;opacity:.85;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
              <span>HP: <b>${hp ?? "?"}</b></span>
              <span>ATK: <b>${atk ?? "?"}</b></span>
              <span>DEF: <b>${def ?? "?"}</b></span>
              <span>AGI: <b>${agi ?? "?"}</b></span>
              <span>LUCK: <b>${luck ?? "?"}</b></span>
            </div>
            <div style="font-size:13px;opacity:.9;">
              Tap a slot on the card (or below) to inspect / unequip.
            </div>
          </div>
        `;

        const imgEl = document.getElementById("equipped-character-img");
        const previewToken = (Number(window.__EquippedPreviewToken || 0) || 0) + 1;
        window.__EquippedPreviewToken = previewToken;
        window.__EquippedPreviewReady = false;
        loadCharacterPngInto(imgEl, () => this._mountHotspots(), previewToken);
        this._waitAndMountHotspots();
      }

      // --- RIGHT: lista slotów ---
      if (slotsBox) {
        const slots = this.state.slots || [];
        const html = slots
          .map((slot) => {
            const isEmpty = !!slot.empty;
            const label = slot.label || slot.slot || "Slot";
            const itemName = isEmpty ? "Empty" : (slot.name || slot.item_key || "Unknown");
            const rarityKey = _normRarity(slot.rarity);
            const rarity = slot.rarity ? `<span style="opacity:.8;">(${slot.rarity})</span>` : "";
            const subtitle = isEmpty ? "Empty slot" : (slot.level ? `Lv ${slot.level}` : "");
            const bonuses = slot.bonusesText
              ? `<div style="font-size:11px;opacity:.7;">${slot.bonusesText}</div>`
              : "";

            const icon = slot.icon
              ? `<div class="equip-icon-box sm">
                   <img src="${slot.icon}" class="item-icon">
                 </div>`
              : `<div class="equip-icon-box sm" style="background:transparent;border:1px dashed rgba(255,255,255,.15);"></div>`;

            return `
              <button data-slot="${slot.slot}"
                      data-rarity="${rarityKey}"
                      class="equip-slot-btn"
                      type="button"
                      style="
                        width:100%;
                        display:flex;
                        align-items:center;
                        gap:10px;
                        background:rgba(10,10,25,.9);
                        border-radius:14px;
                        border:1px solid rgba(255,255,255,.06);
                        padding:8px 10px;
                        margin-bottom:8px;
                        color:#fff;
                        text-align:left;
                        cursor:pointer;
                      ">
                ${icon}
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
                    ${label}
                  </div>
                  <div style="font-size:12px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${itemName} ${rarity}
                  </div>
                  <div style="font-size:11px;opacity:.7;">
                    ${subtitle}
                  </div>
                  ${bonuses}
                </div>
              </button>
            `;
          })
          .join("");

        slotsBox.innerHTML = `
          <div style="font-size:13px;margin-bottom:6px;opacity:.9;">
            Or tap a slot below:
          </div>
          <div>${html}</div>
        `;

        (this.state.slots || []).forEach((slotState) => {
          if (!slotState?.isPet) return;
          const iconBox = slotsBox.querySelector(`.equip-slot-btn[data-slot="${slotState.slot}"] .equip-icon-box`);
          if (iconBox) _mountPetSprite(iconBox, slotState, "equip-pet-sprite equip-pet-sprite-list");
        });
      }

      // --- ACTIVE SETS ---
      if (setsBox) {
        const sets = this.state.activeSets || this.state.active_sets || [];
        setsBox.innerHTML = sets.length
          ? ("<b>Active set bonuses:</b> " + sets.map((s) => `${s.set} (${s.count})`).join(" • "))
          : "";
      }

      // --- TOTAL BONUS ---
      if (totalBox) {
        const t = this.state.totalBonus || this.state.total_bonus || {};
        const keys = Object.keys(t);
        totalBox.innerHTML = keys.length
          ? ("<b>Total gear bonus:</b> " + keys.map((k) => `${k}+${t[k]}`).join(", "))
          : "";
      }
    },

    _waitAndMountHotspots() {
      let tries = 0;
      const tick = () => {
        tries++;
        const imgEl = document.getElementById("equipped-character-img");
        if (imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
          this._mountHotspots();
          return;
        }
        if (tries < 80) setTimeout(tick, 60);
      };
      tick();
    },

    _mountHotspots() {
      if (!this.state) return;

      const imgEl  = document.getElementById("equipped-character-img");
      const layer  = document.getElementById("equip-hotspots");
      if (!imgEl || !layer) return;

      const W = imgEl.naturalWidth || 0;
      const H = imgEl.naturalHeight || 0;
      if (!W || !H) return;

      const dbg = (localStorage.getItem("debug_equipped") === "1") || !!window.DEBUG_EQUIPPED;

      const slots = this.state.slots || [];
      const bySlot = {};
      slots.forEach((s) => (bySlot[s.slot] = s));

      layer.innerHTML = "";

      SLOT_ORDER.forEach((slotKey) => {
        const rect = SLOT_COORDS[slotKey];
        if (!rect) return;

        const s = bySlot[slotKey] || { slot: slotKey, empty: true, label: slotKey };
        const [x, y, w, h] = rect;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "equip-hotspot " + (s.empty ? "is-empty" : "is-equipped");
        if (slotKey === this.selectedEquippedSlotKey) btn.classList.add("is-selected");
        btn.setAttribute("data-slot", slotKey);
        btn.setAttribute("data-equip-slot", slotKey);
        btn.setAttribute("aria-label", `${slotLabel(slotKey, s)}: ${s.empty ? "Empty slot" : (s.name || s.item_key || "Equipped")}`);

        btn.style.left   = toPctRatio(x / W);
        btn.style.top    = toPctRatio(y / H);
        btn.style.width  = toPctRatio(w / W);
        btn.style.height = toPctRatio(h / H);

        // backplate
        btn.style.backgroundColor = s.empty ? "rgba(0,0,0,.08)" : "rgba(0,0,0,.22)";
        btn.style.borderRadius = "16px";
        btn.style.overflow = "visible"; // 🔥 NIE UCINA GLOW

        // rarity dla glow
        btn.dataset.rarity = _normRarity(s.rarity);

        // ✅ IKONA jako osobna warstwa
        const icon = document.createElement("div");
        icon.className = "equip-icon";
        if (!_mountPetSprite(icon, s || {}, "equip-pet-sprite equip-pet-sprite-hotspot")) {
          _setBgWithFallback(icon, s || {});
        }
        if (s.empty) icon.style.opacity = "0.35";
        btn.appendChild(icon);

        const label = document.createElement("span");
        label.className = "equip-hotspot-label";
        label.textContent = slotLabel(slotKey, s);
        btn.appendChild(label);

        const selectedMark = document.createElement("span");
        selectedMark.className = "equip-selected-mark";
        selectedMark.textContent = "✓";
        btn.appendChild(selectedMark);

        if (dbg) {
          btn.style.outline = s.empty
            ? "1px dashed rgba(255,255,255,.35)"
            : "1px solid rgba(0,229,255,.65)";
        }

        layer.appendChild(btn);
      });
    },

    async inspect(slot) {
      this._selectSlot(slot);
      return this.inspectSelected();
    },

    renderInspect(d) {
      const itemKey = String(d?.item_key || d?.key || d?.itemKey || d?.item || "");
      if (itemKey && typeof window.Inventory?.openEquippedItem === "function") {
        return window.Inventory.openEquippedItem(itemKey);
      }
      return false;
    },
  };
})();
