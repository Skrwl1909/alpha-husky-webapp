// js/badges.js - Badge Wall v1 (owned badges from existing badge system)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _bound = false;
  let _tgBackBound = false;
  let _tgBackOwned = false;

  let wallBack;
  let closeBtn;
  let refreshBtn;
  let saveFeaturedBtn;
  let ownedPill;
  let activePill;
  let featuredPill;
  let titlePanelValue;
  let titlePanelButton;
  let tabButtons = [];
  let tabPanels = [];
  let tagPanel;
  let auraPanel;
  let statusBox;
  let gridBox;
  let emptyBox;
  let detailBox;
  let titlePickerBack;
  let titlePickerCloseBtn;
  let titlePickerStatus;
  let titlePickerList;
  let titlePickerEmpty;
  let _selectedBadgeKey = "";
  let _draftFeaturedBadgeKeys = [];
  let _featuredDirty = false;
  let _savingFeatured = false;
  let _loadingTitleState = false;
  let _settingTitleState = false;
  let _settingIdentityState = false;
  let _activeTab = "badges";
  let _lastTabPointerAt = 0;

  let _state = {
    badges: [],
    total: 0,
    activeBadgeKey: "",
    featuredBadgeKeys: [],
  };
  let _titleState = {
    activeTitle: "",
    displayTitle: "",
    titles: [],
    activeTag: "",
    displayTag: "",
    activeAura: null,
    ownedTags: [],
    ownedAuras: [],
  };
  const MAX_FEATURED_BADGES = 3;
  const INVALID_TITLE_VALUES = new Set(["", "NO TITLE", "NO ACTIVE TITLE"]);
  const TITLE_SOURCE_CLASS = {
    quest: "is-quest",
    legacy: "is-legacy",
    badge_prestige: "is-badge-prestige",
  };

  const RARITY_CLASS = {
    common: "is-common",
    uncommon: "is-uncommon",
    rare: "is-rare",
    epic: "is-epic",
    legendary: "is-legendary",
  };

  function dbg(msg, obj) {
    if (_dbg) console.log("[BadgeWall]", msg, obj ?? "");
  }

  function haptic(kind) {
    try { _tg?.HapticFeedback?.impactOccurred?.(kind || "light"); } catch (_) {}
  }

  function showAlert(msg) {
    try { _tg?.showAlert?.(msg); } catch (_) {}
  }

  function onTgBack() {
    close();
  }

  function bindTgBackButton() {
    const back = _tg?.BackButton;
    if (!back || _tgBackBound) return;

    _tgBackOwned = !back.isVisible;
    try {
      back.onClick(onTgBack);
      _tgBackBound = true;
    } catch (_) {
      _tgBackBound = false;
    }

    try { back.show(); } catch (_) {}
  }

  function unbindTgBackButton() {
    const back = _tg?.BackButton;
    if (back && _tgBackBound) {
      try { back.offClick(onTgBack); } catch (_) {}
    }
    if (back && _tgBackOwned) {
      try { back.hide(); } catch (_) {}
    }
    _tgBackBound = false;
    _tgBackOwned = false;
  }

  function toKey(value) {
    return String(value || "").trim().toUpperCase();
  }

  function normalizeTitleText(value) {
    const text = String(value || "").trim();
    return INVALID_TITLE_VALUES.has(text.toUpperCase()) ? "" : text;
  }

  function titleMatch(option, activeTitle) {
    const active = normalizeTitleText(activeTitle);
    if (!active || !option) return false;
    return toKey(option.key) === toKey(active) || toKey(option.label) === toKey(active);
  }


  function normalizeIdentityRows(list, type) {
    const rows = Array.isArray(list) ? list : [];
    const out = [];
    const seen = new Set();
    for (const raw of rows) {
      if (!raw || typeof raw !== "object") continue;
      const key = String(raw.key || raw.auraKey || "").trim();
      const label = String(raw.label || key).trim();
      if (!key || !label) continue;
      const norm = key.toLowerCase();
      if (seen.has(norm)) continue;
      seen.add(norm);
      out.push({
        key,
        label,
        type,
        rarity: String(raw.rarity || "rare").trim().toLowerCase(),
        sourceText: String(raw.sourceText || raw.source || "").trim(),
        owned: !!raw.owned,
        locked: raw.locked !== false && !raw.owned,
        active: !!raw.active,
        temporary: !!raw.temporary,
        expiresAt: Number(raw.expiresAt || 0),
        expiresInSec: Number(raw.expiresInSec || 0),
      });
    }
    return out;
  }
  function normalizeTitleState(payload) {
    const rawTitles = Array.isArray(payload?.titles) ? payload.titles : [];
    const out = [];
    const seen = new Set();
    const activeTitle = normalizeTitleText(payload?.activeTitle || payload?.active_title || "");
    let displayTitle = normalizeTitleText(payload?.displayTitle || payload?.display_title || activeTitle);

    for (const raw of rawTitles) {
      const key = normalizeTitleText(raw?.key);
      const label = normalizeTitleText(raw?.label) || key;
      if (!key || !label) continue;

      const norm = toKey(key);
      if (seen.has(norm)) continue;
      seen.add(norm);

      const source = TITLE_SOURCE_CLASS[String(raw?.source || "").trim()] ? String(raw.source).trim() : "legacy";
      out.push({
        key,
        label,
        source,
        active: !!raw?.active,
      });
    }

    let activeFound = false;
    for (const option of out) {
      const isActive = !!option.active || titleMatch(option, activeTitle);
      option.active = isActive;
      if (isActive) {
        activeFound = true;
        if (!displayTitle) displayTitle = option.label;
      }
    }

    if (!activeFound && activeTitle) {
      for (const option of out) {
        if (titleMatch(option, activeTitle)) {
          option.active = true;
          activeFound = true;
          if (!displayTitle) displayTitle = option.label;
          break;
        }
      }
    }

    return {
      activeTitle,
      displayTitle,
      titles: out,
      activeTag: String(payload?.activeTag || payload?.active_tag || payload?.identity?.activeTag || payload?.identity?.active_tag || "").trim(),
      displayTag: String(payload?.displayTag || payload?.display_tag || payload?.identity?.displayTag || payload?.identity?.display_tag || "").trim(),
      activeAura: payload?.activeAura || payload?.identity?.activeAura || null,
      ownedTags: normalizeIdentityRows(payload?.ownedTags || payload?.identity?.ownedTags, "tag"),
      ownedAuras: normalizeIdentityRows(payload?.ownedAuras || payload?.identity?.ownedAuras, "aura"),
    };
  }

  function normalizeFeaturedKeys(list) {
    const input = Array.isArray(list) ? list : [];
    const out = [];
    const seen = new Set();
    for (const raw of input) {
      const key = toKey(raw);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(key);
      if (out.length >= MAX_FEATURED_BADGES) break;
    }
    return out;
  }

  function featuredChanged(nextKeys) {
    const baseline = normalizeFeaturedKeys(_state.featuredBadgeKeys);
    const next = normalizeFeaturedKeys(nextKeys);
    if (baseline.length !== next.length) return true;
    for (let i = 0; i < baseline.length; i += 1) {
      if (baseline[i] !== next[i]) return true;
    }
    return false;
  }

  function sanitizeRarity(value) {
    const rarity = String(value || "common").trim().toLowerCase();
    return RARITY_CLASS[rarity] ? rarity : "common";
  }
  function frameToneText(badge) {
    return String(
      badge?.framePublicId || badge?.frame_public_id || badge?.frameUrl || badge?.frame_url || ""
    ).trim().toLowerCase();
  }
  function badgeTierClass(badge, rarity) {
    if (!badge?.owned) return "badge-locked";

    const tier = Number.isFinite(Number(badge?.tier)) ? Number(badge.tier) : 0;
    if (tier >= 3) return "badge-tier-gold";
    if (tier === 2) return "badge-tier-purple";

    const tierName = String(badge?.tierName || badge?.tier_name || "").trim().toLowerCase();
    const frameTone = frameToneText(badge);
    const tone = `${tierName} ${frameTone}`;
    if (tone.includes("gold") || tone.includes("orange") || tone.includes("legendary")) return "badge-tier-gold";
    if (tone.includes("purple") || tone.includes("violet") || tone.includes("epic")) return "badge-tier-purple";

    if (rarity === "legendary") return "badge-tier-gold";
    if (rarity === "epic") return "badge-tier-purple";
    return "badge-tier-base";
  }
  function ensureCss() {
    if (document.getElementById("ah-badge-wall-style")) return;
    const style = document.createElement("style");
    style.id = "ah-badge-wall-style";
    style.textContent = `
      #badgeWallBack{
        z-index:1300;
        background:
          radial-gradient(circle at 12% 0%, rgba(106,135,173,.2), transparent 42%),
          radial-gradient(circle at 88% 100%, rgba(120,98,58,.22), transparent 48%),
          rgba(2,5,10,.78);
      }
      #badgeWallBack .ah-bw-card{
        position:relative;
        width:min(96vw, 560px);
        max-height:min(88vh, 680px);
        overflow:hidden;
        border-radius:18px;
        border:1px solid rgba(181,209,235,.24);
        background:
          radial-gradient(circle at 8% -24%, rgba(131,163,206,.16), transparent 54%),
          radial-gradient(circle at 96% 116%, rgba(152,118,72,.12), transparent 60%),
          linear-gradient(180deg, rgba(16,21,32,.96), rgba(9,12,18,.96));
        box-shadow:
          0 20px 56px rgba(0,0,0,.64),
          inset 0 1px 0 rgba(255,255,255,.08);
        padding:12px;
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      #badgeWallBack .ah-bw-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
      }
      #badgeWallBack .ah-bw-title{
        margin:0;
        font-size:16px;
        font-weight:900;
        letter-spacing:.25px;
        color:#f3f8ff;
      }
      #badgeWallBack .ah-bw-sub{
        margin-top:2px;
        font-size:10px;
        line-height:1.35;
        color:rgba(197,216,235,.78);
      }
      #badgeWallBack .ah-bw-head-actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }
      #badgeWallBack .ah-bw-head-actions .btn{
        min-width:44px;
        height:32px;
        border-radius:10px;
        white-space:nowrap;
      }
      #badgeWallBack .ah-bw-meta{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
      }
      #badgeWallBack .ah-bw-tabs{
        display:grid;
        grid-template-columns:repeat(4, minmax(0, 1fr));
        gap:5px;
        border:1px solid rgba(165,196,226,.16);
        border-radius:12px;
        background:rgba(6,12,20,.52);
        padding:4px;
      }
      #badgeWallBack .ah-bw-tab{
        appearance:none;
        min-width:0;
        min-height:30px;
        border:0;
        border-radius:8px;
        background:transparent;
        color:rgba(202,222,241,.76);
        font-size:11px;
        font-weight:900;
        cursor:pointer;
      }
      #badgeWallBack .ah-bw-tab.is-active{
        background:rgba(168,202,236,.16);
        color:#f2f8ff;
        box-shadow:inset 0 0 0 1px rgba(179,211,240,.2);
      }
      #badgeWallBack .ah-bw-tabpanels{
        flex:1 1 auto;
        min-height:0;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      }
      #badgeWallBack .ah-bw-panel{
        flex:1 1 auto;
        min-height:0;
        overflow:hidden;
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      #badgeWallBack .ah-bw-panel[hidden]{
        display:none;
      }
      #badgeWallBack .ah-bw-panel-scroll{
        overflow:auto;
      }
      #badgeWallBack .ah-bw-title-panel{
        border:1px solid rgba(165,196,226,.18);
        border-radius:12px;
        background:rgba(10,18,30,.72);
        padding:10px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }
      #badgeWallBack .ah-bw-title-copy{
        min-width:0;
        display:flex;
        flex-direction:column;
        gap:3px;
      }
      #badgeWallBack .ah-bw-title-label{
        font-size:10px;
        font-weight:800;
        letter-spacing:.16px;
        text-transform:uppercase;
        color:rgba(185,208,230,.78);
      }
      #badgeWallBack .ah-bw-title-value{
        font-size:13px;
        line-height:1.25;
        font-weight:900;
        color:#f2f8ff;
        word-break:break-word;
      }
      #badgeWallBack .ah-bw-title-value.is-empty{
        color:rgba(189,211,232,.72);
      }
      #badgeWallBack .ah-bw-title-panel .btn{
        min-width:108px;
        min-height:32px;
        border-radius:10px;
        white-space:nowrap;
        flex-shrink:0;
      }
      #badgeWallBack .ah-bw-pill{
        display:inline-flex;
        align-items:center;
        min-height:22px;
        padding:3px 9px;
        border-radius:999px;
        border:1px solid rgba(190,217,242,.24);
        background:rgba(12,20,34,.66);
        color:#d7ecff;
        font-size:10px;
        font-weight:800;
        letter-spacing:.1px;
      }
      #badgeWallBack .ah-bw-pill.is-muted{
        color:rgba(190,211,230,.7);
        border-color:rgba(170,188,206,.2);
      }
      #badgeWallBack .ah-bw-pill.is-dirty{
        color:#ffe4ae;
        border-color:rgba(248,205,121,.34);
      }
      #badgeWallBack .ah-bw-status{
        border-radius:10px;
        border:1px solid rgba(165,196,226,.18);
        background:rgba(10,18,30,.68);
        color:rgba(208,228,247,.88);
        padding:8px 10px;
        font-size:11px;
        line-height:1.35;
      }
      #badgeWallBack .ah-bw-status[data-kind="error"]{
        border-color:rgba(224,104,104,.3);
        color:#ffc4c4;
        background:rgba(45,16,21,.6);
      }
      #badgeWallBack .ah-bw-grid{
        margin:0;
        padding:0 1px 2px 0;
        overflow:auto;
        display:grid;
        grid-template-columns:repeat(5, minmax(0, 1fr));
        gap:6px;
        min-height:108px;
        max-height:min(44vh, 360px);
      }
      #badgeWallBack .ah-bw-empty{
        border:1px dashed rgba(174,199,224,.2);
        border-radius:12px;
        padding:20px 12px;
        text-align:center;
        font-size:11px;
        color:rgba(196,217,236,.72);
        background:rgba(11,17,27,.58);
      }
      #badgeWallBack .ah-bw-tile{
        position:relative;
        appearance:none;
        padding:0;
        margin:0;
        cursor:pointer;
        border-radius:10px;
        border:1px solid rgba(178,202,226,.2);
        background:
          linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.01)),
          rgba(8,13,22,.74);
        display:flex;
        align-items:center;
        justify-content:center;
        aspect-ratio:1 / 1;
        transition:border-color .12s ease, box-shadow .12s ease, opacity .12s ease;
      }
      #badgeWallBack .ah-bw-tile.is-selected{
        border-color:rgba(169,205,241,.56);
        box-shadow:0 0 0 1px rgba(159,198,237,.25);
      }
      #badgeWallBack .ah-bw-tile.is-active{
        border-color:rgba(247,203,124,.5);
        box-shadow:
          0 0 0 1px rgba(247,203,124,.28),
          0 6px 14px rgba(123,84,24,.26);
      }
      #badgeWallBack .ah-bw-tile.is-featured{
        box-shadow:
          0 0 0 1px rgba(153,200,245,.3),
          0 4px 10px rgba(35,74,120,.2);
      }
      #badgeWallBack .ah-bw-tile.is-locked{
        opacity:.58;
      }
      #badgeWallBack .ah-bw-tile.is-locked .ah-bw-icon{
        filter:grayscale(1) saturate(.22);
      }
      #badgeWallBack .ah-bw-tile.is-common{ border-color:rgba(178,202,226,.2); }
      #badgeWallBack .ah-bw-tile.is-uncommon{ border-color:rgba(120,189,147,.35); }
      #badgeWallBack .ah-bw-tile.is-rare{ border-color:rgba(98,161,236,.38); }
      #badgeWallBack .ah-bw-tile.is-epic{ border-color:rgba(178,120,220,.42); }
      #badgeWallBack .ah-bw-tile.is-legendary{ border-color:rgba(240,183,92,.45); }
      #badgeWallBack .ah-bw-spot{
        position:absolute;
        right:3px;
        top:3px;
        width:7px;
        height:7px;
        border-radius:999px;
        background:#ffd68b;
        box-shadow:0 0 6px rgba(255,206,118,.7);
      }
      #badgeWallBack .ah-bw-icon{
        width:calc(100% - 8px);
        height:calc(100% - 8px);
        border-radius:9px;
        position:relative;
        border:1px solid rgba(183,208,233,.16);
        background:rgba(6,12,20,.7);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
        font-weight:900;
        color:rgba(229,240,252,.9);
        overflow:hidden;
      }
      #badgeWallBack .ah-bw-icon::before{
        content:"";
        position:absolute;
        inset:2px;
        z-index:1;
        border-radius:999px;
        border:1px solid rgba(185,204,226,.24);
        box-shadow:inset 0 0 8px rgba(185,204,226,.08);
        pointer-events:none;
      }
      #badgeWallBack .ah-bw-icon.badge-tier-base::before{
        border-color:rgba(185,204,226,.24);
        box-shadow:inset 0 0 8px rgba(185,204,226,.08);
      }
      #badgeWallBack .ah-bw-icon.badge-tier-purple::before{
        border-color:rgba(180,118,239,.72);
        box-shadow:
          inset 0 0 8px rgba(180,118,239,.16),
          0 0 8px rgba(180,118,239,.13);
      }
      #badgeWallBack .ah-bw-icon.badge-tier-gold::before{
        border-color:rgba(244,184,86,.78);
        box-shadow:
          inset 0 0 8px rgba(244,184,86,.16),
          0 0 8px rgba(244,184,86,.14);
      }
      #badgeWallBack .ah-bw-icon.badge-locked::before{
        border-color:rgba(164,178,193,.28);
        box-shadow:inset 0 0 8px rgba(164,178,193,.06);
      }
      #badgeWallBack .ah-bw-icon img{
        width:calc(100% - 12px);
        height:calc(100% - 12px);
        object-fit:contain;
        position:relative;
        z-index:2;
      }
      #badgeWallBack .ah-bw-fallback{
        position:relative;
        z-index:2;
      }
      #badgeWallBack .ah-bw-lock{
        position:absolute;
        left:3px;
        bottom:3px;
        min-width:14px;
        height:14px;
        padding:0 3px;
        border-radius:999px;
        border:1px solid rgba(166,185,204,.32);
        background:rgba(4,9,16,.8);
        color:rgba(194,212,230,.88);
        font-size:9px;
        font-weight:900;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      #badgeWallBack .ah-bw-feature{
        position:absolute;
        left:3px;
        top:3px;
        min-width:14px;
        height:14px;
        padding:0 3px;
        border-radius:999px;
        border:1px solid rgba(150,196,237,.42);
        background:rgba(16,38,64,.88);
        color:rgba(207,231,255,.95);
        font-size:9px;
        font-weight:900;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      #badgeWallBack .ah-bw-detail{
        border-radius:10px;
        border:1px solid rgba(165,196,226,.18);
        background:rgba(10,18,30,.68);
        color:rgba(214,232,249,.9);
        padding:9px 10px;
      }
      #badgeWallBack .ah-bw-detail-name{
        margin:0;
        font-size:12px;
        line-height:1.2;
        font-weight:900;
        color:#eff7ff;
      }
      #badgeWallBack .ah-bw-detail-meta{
        margin-top:3px;
        font-size:10px;
        color:rgba(190,214,237,.82);
      }
      #badgeWallBack .ah-bw-detail-desc{
        margin:5px 0 0;
        font-size:11px;
        line-height:1.35;
        color:rgba(195,216,236,.82);
      }
      #badgeWallBack .ah-bw-detail-actions{
        margin-top:8px;
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }
      #badgeWallBack .ah-bw-detail-actions .btn{
        min-height:30px;
        border-radius:9px;
      }
      #badgeWallBack .ah-bw-picker-back{
        position:absolute;
        inset:0;
        z-index:2;
        display:flex;
        align-items:flex-end;
        justify-content:center;
        padding:12px;
        background:rgba(2,5,10,.54);
      }
      #badgeWallBack .ah-bw-picker-back[hidden]{
        display:none;
      }
      #badgeWallBack .ah-bw-picker{
        width:min(100%, 520px);
        max-height:min(72vh, 560px);
        overflow:hidden;
        display:flex;
        flex-direction:column;
        border-radius:16px;
        border:1px solid rgba(179,208,234,.2);
        background:
          radial-gradient(circle at 10% -20%, rgba(119,156,206,.14), transparent 52%),
          linear-gradient(180deg, rgba(18,24,36,.98), rgba(10,13,20,.98));
        box-shadow:0 18px 46px rgba(0,0,0,.46);
      }
      #badgeWallBack .ah-bw-picker-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        padding:12px 12px 8px;
      }
      #badgeWallBack .ah-bw-picker-title{
        margin:0;
        font-size:15px;
        font-weight:900;
        color:#f3f8ff;
      }
      #badgeWallBack .ah-bw-picker-close{
        min-width:42px;
        min-height:30px;
        border-radius:10px;
      }
      #badgeWallBack .ah-bw-picker-status{
        margin:0 12px 8px;
        padding:7px 9px;
        border-radius:10px;
        border:1px solid rgba(165,196,226,.16);
        background:rgba(11,17,27,.58);
        color:rgba(210,229,246,.86);
        font-size:11px;
        line-height:1.3;
      }
      #badgeWallBack .ah-bw-picker-status[data-kind="error"]{
        border-color:rgba(224,104,104,.3);
        color:#ffc4c4;
        background:rgba(45,16,21,.6);
      }
      #badgeWallBack .ah-bw-picker-list{
        overflow:auto;
        padding:0 12px 12px;
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      #badgeWallBack .ah-bw-picker-empty{
        margin:0 12px 12px;
        border:1px dashed rgba(174,199,224,.2);
        border-radius:12px;
        padding:16px 12px;
        text-align:center;
        font-size:11px;
        color:rgba(196,217,236,.72);
        background:rgba(11,17,27,.58);
      }
      #badgeWallBack .ah-bw-title-option{
        width:100%;
        appearance:none;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(178,202,226,.18);
        background:rgba(12,20,34,.7);
        color:#eff7ff;
        text-align:left;
        cursor:pointer;
      }
      #badgeWallBack .ah-bw-title-option.is-active{
        border-color:rgba(247,203,124,.42);
        box-shadow:0 0 0 1px rgba(247,203,124,.18);
      }
      #badgeWallBack .ah-bw-title-option:disabled{
        cursor:default;
        opacity:.72;
      }
      #badgeWallBack .ah-bw-title-option-copy{
        min-width:0;
        display:flex;
        flex-direction:column;
        gap:6px;
      }
      #badgeWallBack .ah-bw-title-option-label{
        font-size:13px;
        line-height:1.25;
        font-weight:800;
        color:#eff7ff;
        word-break:break-word;
      }
      #badgeWallBack .ah-bw-title-option-meta{
        display:flex;
        align-items:center;
        gap:6px;
        flex-wrap:wrap;
      }
      #badgeWallBack .ah-bw-title-chip{
        display:inline-flex;
        align-items:center;
        min-height:20px;
        padding:2px 8px;
        border-radius:999px;
        border:1px solid rgba(190,217,242,.16);
        background:rgba(255,255,255,.04);
        color:rgba(203,224,243,.84);
        font-size:10px;
        font-weight:800;
        letter-spacing:.12px;
      }
      #badgeWallBack .ah-bw-title-chip.is-quest{
        border-color:rgba(132,210,164,.26);
        color:#cff3db;
      }
      #badgeWallBack .ah-bw-title-chip.is-legacy{
        border-color:rgba(162,195,230,.24);
        color:#d9ecff;
      }
      #badgeWallBack .ah-bw-title-chip.is-badge-prestige{
        border-color:rgba(247,203,124,.3);
        color:#ffe3ae;
      }
      #badgeWallBack .ah-bw-identity-panel{
        min-height:0;
        overflow:hidden;
      }
      #badgeWallBack .ah-bw-identity-section{
        min-width:0;
        min-height:0;
        display:flex;
        flex-direction:column;
        gap:7px;
      }
      #badgeWallBack .ah-bw-identity-head{
        font-size:10px;
        font-weight:900;
        text-transform:uppercase;
        color:rgba(185,208,230,.82);
      }
      #badgeWallBack .ah-bw-identity-current{
        border:1px solid rgba(247,203,124,.22);
        border-radius:10px;
        background:rgba(36,29,14,.45);
        color:#ffe4ae;
        padding:7px 9px;
        font-size:11px;
        font-weight:900;
        line-height:1.25;
      }
      #badgeWallBack .ah-bw-identity-list{
        flex:1 1 auto;
        min-height:0;
        max-height:none;
        padding:0;
      }
      #badgeWallBack .ah-bw-identity-option.is-locked{
        opacity:.74;
      }
      #badgeWallBack .ah-bw-identity-source{
        min-width:0;
        color:rgba(204,219,236,.68);
        font-size:10px;
        line-height:1.25;
      }
      @media (max-width:520px){
        #badgeWallBack .ah-bw-head{
          align-items:flex-start;
        }
        #badgeWallBack .ah-bw-head-actions{
          gap:6px;
        }
        #badgeWallBack .ah-bw-head-actions .btn{
          min-width:38px;
          padding-left:8px;
          padding-right:8px;
        }
      }
      #badgeWallBack .ah-bw-title-active{
        flex-shrink:0;
        font-size:11px;
        font-weight:900;
        color:#ffe0a1;
      }
      @media (min-width: 560px){
        #badgeWallBack .ah-bw-grid{
          grid-template-columns:repeat(6, minmax(0, 1fr));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDom() {
    wallBack = document.getElementById("badgeWallBack");
    if (!wallBack) {
      wallBack = document.createElement("div");
      wallBack.id = "badgeWallBack";
      wallBack.className = "sheet-back avatar-sheet";
      wallBack.style.display = "none";
      wallBack.innerHTML = `
        <div class="sheet-card ah-bw-card" role="dialog" aria-modal="true" aria-label="Badges & Titles">
          <div class="ah-bw-head">
            <div>
              <h2 class="ah-bw-title">Badges & Titles</h2>
              <div class="ah-bw-sub">Manage prestige badges and active title.</div>
            </div>
            <div class="ah-bw-head-actions">
              <button class="btn" id="badgeWallRefresh" type="button">Refresh</button>
              <button class="btn" id="badgeWallSaveFeatured" type="button">Save Featured</button>
              <button class="btn" id="closeBadgeWall" type="button">X</button>
            </div>
          </div>

          <div class="ah-bw-tabs" role="tablist" aria-label="Identity Loadout">
            <button class="ah-bw-tab is-active" id="badgeWallTabBadges" data-badge-tab="badges" role="tab" aria-selected="true" aria-controls="badgeWallPanelBadges" type="button">Badges</button>
            <button class="ah-bw-tab" id="badgeWallTabTitles" data-badge-tab="titles" role="tab" aria-selected="false" aria-controls="badgeWallPanelTitles" type="button">Titles</button>
            <button class="ah-bw-tab" id="badgeWallTabTags" data-badge-tab="tags" role="tab" aria-selected="false" aria-controls="badgeWallPanelTags" type="button">Tags</button>
            <button class="ah-bw-tab" id="badgeWallTabAuras" data-badge-tab="auras" role="tab" aria-selected="false" aria-controls="badgeWallPanelAuras" type="button">Auras</button>
          </div>

          <div class="ah-bw-status" id="badgeWallStatus" hidden></div>

          <div class="ah-bw-tabpanels">
            <section class="ah-bw-panel" id="badgeWallPanelBadges" data-badge-panel="badges" role="tabpanel" aria-labelledby="badgeWallTabBadges">
              <div class="ah-bw-meta">
                <span class="ah-bw-pill" id="badgeWallOwned">Owned 0/0</span>
                <span class="ah-bw-pill is-muted" id="badgeWallActive">No active title</span>
                <span class="ah-bw-pill is-muted" id="badgeWallFeatured">Featured 0/3</span>
              </div>
              <div class="ah-bw-grid" id="badgeWallGrid"></div>
              <div class="ah-bw-empty" id="badgeWallEmpty" hidden>No badges available yet.</div>
              <div class="ah-bw-detail" id="badgeWallDetail" hidden></div>
            </section>

            <section class="ah-bw-panel ah-bw-panel-scroll" id="badgeWallPanelTitles" data-badge-panel="titles" role="tabpanel" aria-labelledby="badgeWallTabTitles" hidden>
              <div class="ah-bw-title-panel">
                <div class="ah-bw-title-copy">
                  <span class="ah-bw-title-label">Active Title</span>
                  <span class="ah-bw-title-value is-empty" id="badgeWallTitleValue">No Title Equipped</span>
                </div>
                <button class="btn" id="badgeWallTitleButton" type="button">Choose Title</button>
              </div>
            </section>

            <section class="ah-bw-panel ah-bw-identity-panel" id="badgeWallPanelTags" data-badge-panel="tags" role="tabpanel" aria-labelledby="badgeWallTabTags" hidden></section>
            <section class="ah-bw-panel ah-bw-identity-panel" id="badgeWallPanelAuras" data-badge-panel="auras" role="tabpanel" aria-labelledby="badgeWallTabAuras" hidden></section>
          </div>

          <div class="ah-bw-picker-back" id="badgeTitlePickerBack" hidden>
            <div class="ah-bw-picker" role="dialog" aria-modal="true" aria-label="Choose Title">
              <div class="ah-bw-picker-head">
                <h3 class="ah-bw-picker-title">Choose Title</h3>
                <button class="btn ah-bw-picker-close" id="badgeTitlePickerClose" type="button">Close</button>
              </div>
              <div class="ah-bw-picker-status" id="badgeTitlePickerStatus" hidden></div>
              <div class="ah-bw-picker-list" id="badgeTitlePickerList"></div>
              <div class="ah-bw-picker-empty" id="badgeTitlePickerEmpty" hidden>No titles unlocked yet.</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wallBack);
    }

    closeBtn = document.getElementById("closeBadgeWall");
    refreshBtn = document.getElementById("badgeWallRefresh");
    saveFeaturedBtn = document.getElementById("badgeWallSaveFeatured");
    ownedPill = document.getElementById("badgeWallOwned");
    activePill = document.getElementById("badgeWallActive");
    featuredPill = document.getElementById("badgeWallFeatured");
    titlePanelValue = document.getElementById("badgeWallTitleValue");
    titlePanelButton = document.getElementById("badgeWallTitleButton");
    tabButtons = Array.from(wallBack.querySelectorAll("[data-badge-tab]"));
    tabPanels = Array.from(wallBack.querySelectorAll("[data-badge-panel]"));
    tagPanel = document.getElementById("badgeWallPanelTags");
    auraPanel = document.getElementById("badgeWallPanelAuras");
    statusBox = document.getElementById("badgeWallStatus");
    gridBox = document.getElementById("badgeWallGrid");
    emptyBox = document.getElementById("badgeWallEmpty");
    detailBox = document.getElementById("badgeWallDetail");
    titlePickerBack = document.getElementById("badgeTitlePickerBack");
    titlePickerCloseBtn = document.getElementById("badgeTitlePickerClose");
    titlePickerStatus = document.getElementById("badgeTitlePickerStatus");
    titlePickerList = document.getElementById("badgeTitlePickerList");
    titlePickerEmpty = document.getElementById("badgeTitlePickerEmpty");
  }

  function setStatus(message, kind) {
    if (!statusBox) return;
    const text = String(message || "").trim();
    if (!text) {
      statusBox.hidden = true;
      statusBox.textContent = "";
      statusBox.removeAttribute("data-kind");
      return;
    }
    statusBox.hidden = false;
    statusBox.textContent = text;
    if (kind) statusBox.setAttribute("data-kind", kind);
    else statusBox.removeAttribute("data-kind");
  }

  function setTitlePickerStatus(message, kind) {
    if (!titlePickerStatus) return;
    const text = String(message || "").trim();
    if (!text) {
      titlePickerStatus.hidden = true;
      titlePickerStatus.textContent = "";
      titlePickerStatus.removeAttribute("data-kind");
      return;
    }
    titlePickerStatus.hidden = false;
    titlePickerStatus.textContent = text;
    if (kind) titlePickerStatus.setAttribute("data-kind", kind);
    else titlePickerStatus.removeAttribute("data-kind");
  }

  function closeTitlePicker() {
    if (titlePickerBack) titlePickerBack.hidden = true;
    setTitlePickerStatus("");
  }

  function openTitlePickerShell() {
    if (titlePickerBack) titlePickerBack.hidden = false;
  }

  function setActiveTab(tab) {
    const next = ["badges", "titles", "tags", "auras"].includes(tab) ? tab : "badges";
    _activeTab = next;

    for (const button of tabButtons) {
      const isActive = button.getAttribute("data-badge-tab") === next;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    for (const panel of tabPanels) {
      panel.hidden = panel.getAttribute("data-badge-panel") !== next;
    }
  }

  function handleTabSwitchEvent(e) {
    const button = e.target?.closest?.("[data-badge-tab]");
    if (!button || !wallBack || !wallBack.contains(button)) return false;

    const now = Date.now();
    if (e.type === "click" && now - _lastTabPointerAt < 450) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
    if (e.type === "pointerup") {
      if (e.button != null && e.button !== 0) return false;
      _lastTabPointerAt = now;
    }

    e.preventDefault();
    e.stopPropagation();
    setActiveTab(button.getAttribute("data-badge-tab") || "badges");
    haptic("light");
    return true;
  }
  function updateSaveButtonState() {
    if (!saveFeaturedBtn) return;
    saveFeaturedBtn.disabled = _savingFeatured || !_featuredDirty;
    saveFeaturedBtn.textContent = _savingFeatured ? "Saving..." : "Save Featured";
  }

  function updateTitlePanel() {
    if (titlePanelValue) {
      const displayTitle = normalizeTitleText(_titleState.displayTitle || _titleState.activeTitle);
      const hasTitle = !!displayTitle;
      titlePanelValue.textContent = hasTitle ? displayTitle : "No Title Equipped";
      titlePanelValue.classList.toggle("is-empty", !hasTitle);
    }

    if (titlePanelButton) {
      const displayTitle = normalizeTitleText(_titleState.displayTitle || _titleState.activeTitle);
      titlePanelButton.textContent = displayTitle ? "Change Title" : "Choose Title";
      titlePanelButton.disabled = _loadingTitleState || _settingTitleState || !_apiPost;
    }
  }

  function updateSummary() {
    const list = Array.isArray(_state.badges) ? _state.badges : [];
    const ownedCount = list.reduce((acc, item) => (item?.owned ? acc + 1 : acc), 0);
    const totalCount = list.length;

    if (ownedPill) {
      ownedPill.textContent = "Owned " + String(ownedCount) + "/" + String(totalCount);
    }

    if (activePill) {
      const displayTitle = normalizeTitleText(_titleState.displayTitle || _titleState.activeTitle);
      const activeKey = toKey(_state.activeBadgeKey);
      if (displayTitle) {
        activePill.textContent = "Displayed: " + displayTitle;
        activePill.classList.remove("is-muted");
      } else if (!activeKey) {
        activePill.textContent = "No active title";
        activePill.classList.add("is-muted");
      } else {
        const active = (_state.badges || []).find((item) => toKey(item.key) === activeKey);
        if (active) {
          activePill.textContent = "Displayed: " + (active.name || active.key);
        } else {
          activePill.textContent = "Displayed: " + activeKey;
        }
        activePill.classList.remove("is-muted");
      }
    }

    if (featuredPill) {
      const count = _draftFeaturedBadgeKeys.length;
      featuredPill.textContent = "Featured " + String(count) + "/" + String(MAX_FEATURED_BADGES) + (_featuredDirty ? " *" : "");
      featuredPill.classList.toggle("is-muted", count === 0);
      featuredPill.classList.toggle("is-dirty", _featuredDirty);
    }

    updateSaveButtonState();
    updateTitlePanel();
    renderIdentityLoadout();
  }

  function newEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clearEl(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function createTitleOption(option) {
    const row = newEl("button", "ah-bw-title-option" + (option.active ? " is-active" : ""));
    row.type = "button";
    row.disabled = _settingTitleState;
    row.setAttribute("data-title-key", option.key);

    const copy = newEl("div", "ah-bw-title-option-copy");
    copy.appendChild(newEl("div", "ah-bw-title-option-label", option.label));

    const meta = newEl("div", "ah-bw-title-option-meta");
    const chip = newEl("span", "ah-bw-title-chip " + TITLE_SOURCE_CLASS[option.source], option.source);
    meta.appendChild(chip);
    copy.appendChild(meta);
    row.appendChild(copy);

    if (option.active) {
      row.appendChild(newEl("span", "ah-bw-title-active", "Equipped"));
    }

    row.addEventListener("click", () => {
      equipTitle(option.key).catch(() => {});
    });

    return row;
  }


  function formatIdentityExpiry(item) {
    const sec = Number(item?.expiresInSec || 0);
    if (sec <= 0) return "";
    const days = Math.floor(sec / 86400);
    if (days > 0) return days + "d left";
    const hours = Math.max(1, Math.floor(sec / 3600));
    return hours + "h left";
  }

  function identityChipText(item) {
    const parts = [];
    if (item?.rarity) parts.push(String(item.rarity).toUpperCase());
    if (item?.temporary) parts.push("TEMP");
    const expiry = formatIdentityExpiry(item);
    if (expiry) parts.push(expiry);
    return parts.join(" / ");
  }

  function activeIdentityText(kind, rows) {
    const items = Array.isArray(rows) ? rows : [];
    let active = items.find((item) => !!item?.active) || null;

    if (!active && kind === "tag") {
      const activeTag = toKey(_titleState.activeTag || _titleState.displayTag);
      active = items.find((item) => toKey(item?.key) === activeTag || toKey(item?.label) === activeTag) || null;
    }

    if (!active && kind === "aura") {
      const rawAura = _titleState.activeAura;
      const auraKey = typeof rawAura === "object" ? (rawAura?.key || rawAura?.auraKey) : rawAura;
      const activeAura = toKey(auraKey);
      active = items.find((item) => toKey(item?.key) === activeAura || toKey(item?.label) === activeAura) || null;
    }

    if (!active && kind === "tag") {
      const fallback = String(_titleState.displayTag || _titleState.activeTag || "").trim();
      return "Active Tag: " + (fallback || "None");
    }

    if (!active && kind === "aura") {
      const rawAura = _titleState.activeAura;
      const fallback = typeof rawAura === "object"
        ? String(rawAura?.label || rawAura?.key || rawAura?.auraKey || "").trim()
        : String(rawAura || "").trim();
      return "Active Aura: " + (fallback || "None");
    }

    const label = String(active?.label || active?.key || "None").trim() || "None";
    const expiry = kind === "aura" ? formatIdentityExpiry(active) : "";
    return "Active " + (kind === "aura" ? "Aura" : "Tag") + ": " + label + (expiry ? " (" + expiry + ")" : "");
  }

  function createIdentityOption(kind, item) {
    const isAura = kind === "aura";
    const canEquip = !!item?.owned && !item?.active && !(isAura && item?.temporary) && !_settingIdentityState;
    const row = newEl("button", "ah-bw-title-option ah-bw-identity-option" + (item?.active ? " is-active" : "") + (!item?.owned && !item?.active ? " is-locked" : ""));
    row.type = "button";
    row.disabled = !canEquip;
    row.setAttribute("data-identity-kind", kind);
    row.setAttribute("data-identity-key", item?.key || "");

    const copy = newEl("div", "ah-bw-title-option-copy");
    copy.appendChild(newEl("div", "ah-bw-title-option-label", item?.label || item?.key || "Locked"));

    const meta = newEl("div", "ah-bw-title-option-meta");
    const chip = newEl("span", "ah-bw-title-chip", identityChipText(item) || (item?.owned ? "OWNED" : "LOCKED"));
    meta.appendChild(chip);
    const source = String(item?.sourceText || "").trim();
    if (source) meta.appendChild(newEl("span", "ah-bw-identity-source", source));
    copy.appendChild(meta);
    row.appendChild(copy);

    const status = item?.active ? "Active" : (item?.owned && !(isAura && item?.temporary) ? "Equip" : "Locked");
    row.appendChild(newEl("span", "ah-bw-title-active", status));

    if (canEquip) {
      row.addEventListener("click", () => {
        equipIdentity(kind, item.key).catch(() => {});
      });
    }
    return row;
  }

  function createIdentitySection(title, kind, rows) {
    const section = newEl("div", "ah-bw-identity-section");
    section.appendChild(newEl("div", "ah-bw-identity-head", title));
    section.appendChild(newEl("div", "ah-bw-identity-current", activeIdentityText(kind, rows)));

    const list = newEl("div", "ah-bw-picker-list ah-bw-identity-list");
    const items = Array.isArray(rows) ? rows : [];
    if (!items.length) {
      list.appendChild(newEl("div", "ah-bw-picker-empty", "No entries available."));
    } else {
      for (const item of items) list.appendChild(createIdentityOption(kind, item));
    }
    section.appendChild(list);
    return section;
  }

  function renderIdentityLoadout() {
    if (tagPanel) {
      clearEl(tagPanel);
      tagPanel.appendChild(createIdentitySection("Tags", "tag", _titleState.ownedTags));
    }
    if (auraPanel) {
      clearEl(auraPanel);
      auraPanel.appendChild(createIdentitySection("Auras", "aura", _titleState.ownedAuras));
    }
  }

  function syncTopTagFromIdentityState(kind) {
    if (kind !== "tag") return;
    const activeTag = String(_titleState.activeTag || "").trim();
    const displayTag = String(_titleState.displayTag || activeTag || "").trim();
    if (!activeTag) return;

    const profiles = ["PROFILE", "__PROFILE__", "lastProfile", "profileState", "_profile"];
    if (!window.PROFILE || typeof window.PROFILE !== "object") window.PROFILE = {};
    for (const name of profiles) {
      const profile = window[name];
      if (!profile || typeof profile !== "object") continue;
      profile.activeTag = activeTag;
      profile.displayTag = displayTag;
      profile.tag = activeTag;
      if (profile.cosmetics && typeof profile.cosmetics === "object") {
        profile.cosmetics.tag = activeTag;
      }
    }

    const base = window.PROFILE?.faction || window.__PROFILE__?.faction || "PACK";
    try { window.setTopTag?.(activeTag, base); } catch (_) {}
    try { window.renderTopbar?.(); } catch (_) {}
  }
  async function equipIdentity(kind, selectedKey) {
    const key = String(selectedKey || "").trim();
    if (!_apiPost || !key || _settingIdentityState) return;
    const action = kind === "aura" ? "set_active_aura" : "set_active_tag";
    const field = kind === "aura" ? "aura_key" : "tag_key";
    _settingIdentityState = true;
    renderIdentityLoadout();
    setStatus("Equipping " + (kind === "aura" ? "aura" : "tag") + "...", "");
    try {
      const out = await _apiPost("/webapp/player/title/state", { action, [field]: key });
      if (!out || out.ok === false) throw new Error(out?.reason || "IDENTITY_SET_FAILED");
      _titleState = normalizeTitleState(out);
      syncTopTagFromIdentityState(kind);
      updateSummary();
      renderIdentityLoadout();
      setStatus((kind === "aura" ? "Aura" : "Tag") + " equipped.", "");
      try {
        if (typeof window.loadProfile === "function") {
          const profileRefresh = window.loadProfile();
          if (kind === "tag" && profileRefresh && typeof profileRefresh.finally === "function") {
            profileRefresh.finally(() => syncTopTagFromIdentityState(kind));
          }
        }
      } catch (_) {}
      haptic("light");
    } catch (err) {
      dbg("set identity failed", err);
      setStatus("Failed to equip " + (kind === "aura" ? "aura" : "tag") + ".", "error");
      haptic("light");
      throw err;
    } finally {
      _settingIdentityState = false;
      renderIdentityLoadout();
    }
  }
  function renderTitlePicker() {
    if (!titlePickerList || !titlePickerEmpty) return;
    clearEl(titlePickerList);

    const titles = Array.isArray(_titleState.titles) ? _titleState.titles : [];
    if (!titles.length) {
      titlePickerEmpty.hidden = false;
      return;
    }

    titlePickerEmpty.hidden = true;
    const frag = document.createDocumentFragment();
    for (const option of titles) {
      frag.appendChild(createTitleOption(option));
    }
    titlePickerList.appendChild(frag);
  }

  async function loadTitleState() {
    if (!_apiPost) throw new Error("API_NOT_READY");
    const out = await _apiPost("/webapp/player/title/state", {});
    if (!out || out.ok === false) throw new Error(out?.reason || "TITLE_STATE_FAILED");
    return normalizeTitleState(out);
  }

  async function refreshTitleState({ silent = false } = {}) {
    _loadingTitleState = true;
    updateTitlePanel();
    if (!silent) setTitlePickerStatus("Loading titles...", "");
    try {
      const next = await loadTitleState();
      _titleState = next;
      updateSummary();
      renderTitlePicker();
      renderIdentityLoadout();
      if (!silent) setTitlePickerStatus("");
      return next;
    } catch (err) {
      dbg("title state failed", err);
      if (!silent) setTitlePickerStatus("Failed to load titles. Try again.", "error");
      throw err;
    } finally {
      _loadingTitleState = false;
      updateTitlePanel();
      renderTitlePicker();
    }
  }

  async function equipTitle(selectedKey) {
    const titleKey = normalizeTitleText(selectedKey);
    const titles = Array.isArray(_titleState.titles) ? _titleState.titles : [];
    const allowed = titles.find((option) => toKey(option.key) === toKey(titleKey));
    if (!_apiPost || !allowed || _settingTitleState) return;

    _settingTitleState = true;
    updateTitlePanel();
    setTitlePickerStatus("Equipping title...", "");
    renderTitlePicker();

    try {
      const out = await _apiPost("/webapp/player/title/state", {
        action: "set_active_title",
        title_key: allowed.key,
      });
      if (!out || out.ok === false) throw new Error(out?.reason || "TITLE_SET_FAILED");

      _titleState = normalizeTitleState(out);
      updateSummary();
      renderTitlePicker();
      renderIdentityLoadout();
      closeTitlePicker();
      setStatus("Title equipped.", "");
      haptic("light");
    } catch (err) {
      dbg("set title failed", err);
      setTitlePickerStatus("Failed to equip title. Try again.", "error");
      haptic("light");
      throw err;
    } finally {
      _settingTitleState = false;
      updateTitlePanel();
      renderTitlePicker();
    }
  }

  async function openTitlePicker() {
    openTitlePickerShell();
    renderTitlePicker();
    setTitlePickerStatus("Loading titles...", "");
    try {
      await refreshTitleState();
      haptic("light");
    } catch (_) {}
  }

  function findBadge(rawKey) {
    const key = toKey(rawKey);
    if (!key) return null;
    const list = Array.isArray(_state.badges) ? _state.badges : [];
    return list.find((item) => toKey(item?.key) === key) || null;
  }

  function canBadgeBeFeatured(badge) {
    if (!badge || !badge.owned) return false;
    if (badge.displayable === false || badge.canDisplay === false) return false;
    return !isMasteryBadge(badge);
  }

  function isFeaturedKey(rawKey) {
    const key = toKey(rawKey);
    return !!key && _draftFeaturedBadgeKeys.includes(key);
  }

  function featuredPayloadKeys() {
    const out = [];
    for (const norm of _draftFeaturedBadgeKeys) {
      const badge = findBadge(norm);
      if (!badge) continue;
      const key = String(badge.key || "").trim();
      if (key) out.push(key);
    }
    return out;
  }
  function badgeIconSource(badge) {
    return String(badge?.iconUrl || badge?.icon_url || "").trim();
  }
  function badgeEmblemSource(badge) {
    return String(
      badge?.emblemUrl || badge?.emblem_url || badge?.iconUrl || badge?.icon_url || ""
    ).trim();
  }
  function isMasteryBadge(badge) {
    return String(badge?.badgeType || badge?.badge_type || "").trim().toLowerCase() === "mastery";
  }

  function setBadgeImage(iconWrap, badge, key) {
    const primary = badgeEmblemSource(badge) || badgeIconSource(badge);
    const fallbackMark = "?";

    clearEl(iconWrap);

    const fallback = newEl("span", "ah-bw-fallback", fallbackMark);
    iconWrap.appendChild(fallback);

    if (!primary) {
      return;
    }

    const img = newEl("img");
    img.alt = String(badge.name || key || "Badge");
    img.loading = "eager";
    img.decoding = "async";
    img.style.display = "none";

    img.addEventListener("load", () => {
      fallback.style.display = "none";
      img.style.display = "block";
    });

    img.addEventListener("error", () => {
      img.remove();
      fallback.style.display = "";
    });

    iconWrap.appendChild(img);
    img.src = primary;
  }

  function toggleFeaturedForKey(rawKey) {
    const badge = findBadge(rawKey);
    if (!badge || !canBadgeBeFeatured(badge)) {
      setStatus("Only owned display badges can be featured.", "error");
      haptic("light");
      return;
    }

    const key = toKey(badge.key);
    let next = _draftFeaturedBadgeKeys.slice();
    const idx = next.indexOf(key);
    if (idx >= 0) {
      next.splice(idx, 1);
    } else {
      if (next.length >= MAX_FEATURED_BADGES) {
        setStatus("You can feature up to " + String(MAX_FEATURED_BADGES) + " badges.", "error");
        haptic("light");
        return;
      }
      next.push(key);
    }

    _draftFeaturedBadgeKeys = normalizeFeaturedKeys(next);
    _featuredDirty = featuredChanged(_draftFeaturedBadgeKeys);
    updateSummary();
    renderBadges();
    setStatus("");
    haptic("light");
  }

  async function saveFeaturedBadges() {
    if (_savingFeatured || !_apiPost) return;
    _savingFeatured = true;
    updateSaveButtonState();
    setStatus("Saving featured badges...", "");
    try {
      const out = await _apiPost("/webapp/badges/state", { featured_badges: featuredPayloadKeys() });
      if (!out || out.ok === false) throw new Error(out?.reason || "BADGES_FEATURED_SAVE_FAILED");
      const next = normalizeState(out);
      _state = next;
      _draftFeaturedBadgeKeys = normalizeFeaturedKeys(next.featuredBadgeKeys);
      _featuredDirty = false;
      updateSummary();
      renderBadges();
      setStatus("Featured badges saved.");
      haptic("light");
    } catch (err) {
      dbg("save featured failed", err);
      setStatus("Failed to save featured badges. Try again.", "error");
      haptic("light");
      throw err;
    } finally {
      _savingFeatured = false;
      updateSaveButtonState();
    }
  }

  function renderDetail(badge, activeKey) {
    if (!detailBox) return;
    clearEl(detailBox);

    if (!badge) {
      detailBox.hidden = true;
      return;
    }

    const key = String(badge.key || "").trim();
    const isOwned = !!badge.owned;
    const isActive = !!activeKey && toKey(key) === activeKey;
    const isFeatured = isFeaturedKey(key);
    const mastery = isMasteryBadge(badge);
    const tier = Number.isFinite(Number(badge.tier)) ? Number(badge.tier) : 0;
    const tierName = String(badge.tierName || badge.tier_name || "").trim();
    const canFeature = canBadgeBeFeatured(badge);

    detailBox.hidden = false;
    detailBox.appendChild(newEl("h3", "ah-bw-detail-name", String(badge.name || key || "Unknown Badge")));

    const metaBits = [isOwned ? "Owned" : "Locked"];
    if (mastery) {
      metaBits.push("mastery");
      metaBits.push("Tier " + String(tier));
      if (tierName) metaBits.push(tierName);
    } else {
      metaBits.push(sanitizeRarity(badge.rarity));
    }
    if (isActive) metaBits.push("Displayed");
    if (isFeatured) metaBits.push("Featured");
    if (key) metaBits.push(key);
    detailBox.appendChild(newEl("div", "ah-bw-detail-meta", metaBits.join(" | ")));

    const desc = String(badge.description || "").trim() || "Prestige badge.";
    detailBox.appendChild(newEl("p", "ah-bw-detail-desc", desc));

    if (mastery) {
      const progress = Math.max(0, Number(badge.progress) || 0);
      const nextRaw = (badge.nextThreshold != null) ? badge.nextThreshold : badge.next_threshold;
      const next = Number(nextRaw);
      const nextTierName = String(badge.nextTierName || badge.next_tier_name || "").trim();
      const maxTier = !!badge.maxTier || !!badge.max_tier || !(Number.isFinite(next) && next > 0);
      let progressText = "";
      if (maxTier) {
        progressText = "Mastery complete.";
      } else if (nextTierName) {
        progressText = "Progress " + String(progress) + " / " + String(next) + " toward " + nextTierName;
      } else {
        progressText = "Progress " + String(progress) + " / " + String(next);
      }
      detailBox.appendChild(newEl("div", "ah-bw-detail-meta", progressText));
    }

    if (canFeature) {
      const actions = newEl("div", "ah-bw-detail-actions");
      const toggleBtn = newEl("button", "btn", isFeatured ? "Remove from Featured" : "Add to Featured");
      toggleBtn.type = "button";
      toggleBtn.addEventListener("click", () => toggleFeaturedForKey(key));
      actions.appendChild(toggleBtn);
      detailBox.appendChild(actions);
    }
  }

  function applySelection(activeKey) {
    if (!gridBox) return;
    const selectedKey = toKey(_selectedBadgeKey);
    const nodes = gridBox.querySelectorAll(".ah-bw-tile");
    for (const node of nodes) {
      const nodeKey = toKey(node.getAttribute("data-key"));
      const isSelected = !!selectedKey && nodeKey === selectedKey;
      node.classList.toggle("is-selected", isSelected);
      if (isSelected) node.setAttribute("aria-current", "true");
      else node.removeAttribute("aria-current");
    }

    const list = Array.isArray(_state.badges) ? _state.badges : [];
    const selected = list.find((item) => toKey(item?.key) === selectedKey) || null;
    renderDetail(selected, activeKey);
  }

  function chooseDefaultSelection(list) {
    const selectedKey = toKey(_selectedBadgeKey);
    if (selectedKey && list.some((item) => toKey(item?.key) === selectedKey)) {
      return selectedKey;
    }
    const firstOwned = list.find((item) => !!item?.owned);
    if (firstOwned) return toKey(firstOwned.key);
    return list[0] ? toKey(list[0].key) : "";
  }

  function createBadgeTile(badge, activeKey) {
    const rarity = sanitizeRarity(badge.rarity);
    const key = String(badge.key || "").trim();
    const isActive = !!activeKey && toKey(key) === activeKey;
    const isOwned = !!badge.owned;
    const isFeatured = isFeaturedKey(key);

    const tierClass = badgeTierClass(badge, rarity);
    const tileClass = "ah-bw-tile " + RARITY_CLASS[rarity] + (isActive ? " is-active" : "") + (isFeatured ? " is-featured" : "") + (isOwned ? " is-owned" : " is-locked");
    const card = newEl("button", tileClass);
    card.type = "button";
    card.setAttribute("aria-label", String(badge.name || key || "Badge"));
    if (key) card.setAttribute("data-key", key);

    const iconWrap = newEl("div", "ah-bw-icon " + tierClass);
    setBadgeImage(iconWrap, badge, key);
    card.appendChild(iconWrap);

    if (isActive) {
      card.appendChild(newEl("span", "ah-bw-spot"));
    }
    if (isFeatured) {
      card.appendChild(newEl("span", "ah-bw-feature", "F"));
    }
    if (!isOwned) {
      card.appendChild(newEl("span", "ah-bw-lock", "L"));
    }

    card.addEventListener("click", () => {
      _selectedBadgeKey = toKey(key);
      applySelection(activeKey);
      haptic("light");
    });

    return card;
  }

  function renderBadges() {
    if (!gridBox || !emptyBox) return;
    gridBox.innerHTML = "";

    const list = Array.isArray(_state.badges) ? _state.badges : [];
    const activeKey = toKey(_state.activeBadgeKey);
    if (!list.length) {
      emptyBox.hidden = false;
      renderDetail(null, activeKey);
      return;
    }

    emptyBox.hidden = true;
    _selectedBadgeKey = chooseDefaultSelection(list);

    const frag = document.createDocumentFragment();
    for (const badge of list) {
      frag.appendChild(createBadgeTile(badge, activeKey));
    }
    gridBox.appendChild(frag);
    applySelection(activeKey);
  }

  function normalizeState(payload) {
  const list = Array.isArray(payload?.badges) ? payload.badges : [];
  const badges = list.map((raw) => {
    const rawNext = (raw?.nextThreshold != null) ? raw.nextThreshold : raw?.next_threshold;
    const nextThreshold = Number.isFinite(Number(rawNext)) ? Number(rawNext) : null;
    return ({
      key: String(raw?.key || "").trim(),
      name: String(raw?.name || raw?.key || "Unknown Badge").trim(),
      icon: typeof raw?.icon === "string" ? raw.icon.trim() : "",
      icon_file: typeof raw?.icon_file === "string" ? raw.icon_file.trim() : "",
      iconUrl: typeof raw?.iconUrl === "string" ? raw.iconUrl.trim() : "",
      icon_url: typeof raw?.icon_url === "string" ? raw.icon_url.trim() : "",
      emblemUrl: typeof raw?.emblemUrl === "string" ? raw.emblemUrl.trim() : "",
      emblem_url: typeof raw?.emblem_url === "string" ? raw.emblem_url.trim() : "",
      frameUrl: typeof raw?.frameUrl === "string" ? raw.frameUrl.trim() : "",
      frame_url: typeof raw?.frame_url === "string" ? raw.frame_url.trim() : "",
      framePublicId: String(raw?.framePublicId || raw?.frame_public_id || "").trim(),
      badgeType: String(raw?.badgeType || raw?.badge_type || "").trim().toLowerCase(),
      family: String(raw?.family || "").trim().toLowerCase(),
      tier: Number.isFinite(Number(raw?.tier)) ? Number(raw.tier) : 0,
      tierName: String(raw?.tierName || raw?.tier_name || "").trim(),
      progress: Number.isFinite(Number(raw?.progress)) ? Math.max(0, Number(raw.progress)) : 0,
      nextThreshold: nextThreshold,
      nextTierName: String(raw?.nextTierName || raw?.next_tier_name || "").trim(),
      maxTier: raw?.maxTier === true || raw?.max_tier === true,
      displayable: raw?.displayable !== false,
      canDisplay: raw?.canDisplay !== false,
      description: String(raw?.description || "").trim(),
      rarity: sanitizeRarity(raw?.rarity),
      owned: raw?.owned !== false,
    });
  });

  const total = Number.isFinite(payload?.total)
    ? Number(payload.total)
    : badges.reduce((acc, item) => (item.owned ? acc + 1 : acc), 0);

  const activeBadgeKey = String(
    payload?.activeBadgeKey || payload?.active_badge_key || ""
  ).trim();

  const featuredBadgeKeys = normalizeFeaturedKeys(
    Array.isArray(payload?.featured_badges) ? payload.featured_badges : []
  );

  return { badges, total, activeBadgeKey, featuredBadgeKeys };
}

  async function loadState() {
    if (!_apiPost) throw new Error("API_NOT_READY");
    const out = await _apiPost("/webapp/badges/state", {});
    if (!out || out.ok === false) throw new Error(out?.reason || "BADGES_STATE_FAILED");
    return normalizeState(out);
  }

  async function refresh() {
    setStatus("Loading Badges & Titles...", "");
    try {
      const [next, titleState] = await Promise.all([
        loadState(),
        loadTitleState().catch((err) => {
          dbg("initial title load failed", err);
          return _titleState;
        }),
      ]);
      _state = next;
      _titleState = normalizeTitleState(titleState);
      _draftFeaturedBadgeKeys = normalizeFeaturedKeys(next.featuredBadgeKeys);
      _featuredDirty = false;
      updateSummary();
      renderBadges();
      renderTitlePicker();
      renderIdentityLoadout();
      setStatus("");
    } catch (err) {
      dbg("refresh failed", err);
      setStatus("Failed to load badges. Try again in a moment.", "error");
      if (!Array.isArray(_state.badges) || !_state.badges.length) {
        renderBadges();
      }
      renderTitlePicker();
      renderIdentityLoadout();
      throw err;
    }
  }

  function close() {
    closeTitlePicker();
    if (wallBack) wallBack.style.display = "none";
    unbindTgBackButton();
  }

  async function open() {
    if (!_apiPost) {
      init();
    }
    if (!_apiPost) {
      showAlert("Badges & Titles is not ready yet.");
      return;
    }

    setActiveTab("badges");
    if (wallBack) wallBack.style.display = "flex";
    bindTgBackButton();
    haptic("light");
    try {
      await refresh();
    } catch (_) {}
  }

  function bind() {
    if (_bound) return;
    _bound = true;

    closeBtn?.addEventListener("click", close);
    refreshBtn?.addEventListener("click", () => {
      refresh().then(() => haptic("light")).catch(() => {});
    });
    saveFeaturedBtn?.addEventListener("click", () => {
      saveFeaturedBadges().catch(() => {});
    });
    titlePanelButton?.addEventListener("click", () => {
      openTitlePicker().catch(() => {});
    });
    titlePickerCloseBtn?.addEventListener("click", closeTitlePicker);

    wallBack?.addEventListener("pointerup", handleTabSwitchEvent);
    wallBack?.addEventListener("click", (e) => {
      if (handleTabSwitchEvent(e)) return;
      if (e.target === wallBack) close();
    });
    titlePickerBack?.addEventListener("click", (e) => {
      if (e.target === titlePickerBack) closeTitlePicker();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!wallBack || wallBack.style.display === "none") return;
      if (titlePickerBack && !titlePickerBack.hidden) {
        closeTitlePicker();
        return;
      }
      close();
    });
  }

  function init({ apiPost, tg, dbg: debugFlag } = {}) {
    _apiPost = apiPost || window.S?.apiPost || window.apiPost || _apiPost || null;
    _tg = tg || window.Telegram?.WebApp || _tg || null;
    _dbg = !!debugFlag;

    ensureCss();
    ensureDom();
    bind();
    updateSummary();
    return true;
  }

  window.Badges = { init, open, close, refresh };
})();

