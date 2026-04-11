// js/skins.js — Skins modal (owned/equipped + buy/equip + earn-only unlocks
// + support-stars skins + CODE CLAIM) for Alpha Husky WebApp
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _bound = false;

  // DOM
  let avatarBack, skinCanvas, skinCtx, skinPreviewImg, skinDesc, closeAvatar, equipBtn, shareBtn, skinButtonsWrap;
  let skinPreviewFrame, skinInfoName, skinInfoMeta, skinStateChip;

  // claim UI (dynamic)
  let claimWrap, claimInput, claimBtn;

  // state
  let _catalog = [];
  let _owned = [];
  let _equipped = { skin: "" };
  let _selectedKey = "";
  let _inited = false;

  // animated webp detection cache + anti-race guard
  const _animCache = new Map();
  let _previewSeq = 0;

  function dbg(msg, obj) {
    if (_dbg) console.log("[Skins]", msg, obj ?? "");
  }

  function haptic(kind) {
    try { _tg?.HapticFeedback?.impactOccurred?.(kind || "light"); } catch (_) {}
  }

  function uuid() {
    try { return crypto.randomUUID(); } catch (_) {}
    return "rid_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function normKey(key) {
    return (key || "").trim().toLowerCase();
  }

  function currentHeroSkinUrl() {
    const hero = document.getElementById("player-skin");
    const src = hero?.currentSrc || hero?.src || "";
    return String(src || "").trim();
  }

  function ensurePolishCss() {
    if (document.getElementById("ah-skins-style")) return;
    const style = document.createElement("style");
    style.id = "ah-skins-style";
    style.textContent = `
      #avatarBack .sheet-card{
        overflow-x:hidden;
        padding-bottom:calc(14px + var(--ah-safe-bottom, 0px));
      }
      #avatarBack .ah-skin-stage-wrap{
        width:min(368px, 88vw);
        margin:12px auto 8px;
        animation:ahSkinStageIn .22s ease-out both;
      }
      #avatarBack .ah-skin-stage{
        position:relative;
        width:100%;
        aspect-ratio:2 / 3;
        border-radius:18px;
        overflow:hidden;
        isolation:isolate;
        border:1px solid rgba(255,255,255,.14);
        background:
          radial-gradient(130% 92% at 50% 18%, rgba(255,255,255,.11) 0%, rgba(255,255,255,0) 56%),
          linear-gradient(180deg, rgba(11,14,22,.96), rgba(3,5,10,.96));
        box-shadow:0 18px 42px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06);
      }
      #avatarBack .ah-skin-stage::before{
        content:"";
        position:absolute;
        inset:-12% -8% 26%;
        pointer-events:none;
        background:radial-gradient(closest-side, rgba(130,151,196,.26), rgba(130,151,196,0));
        z-index:0;
      }
      #avatarBack .ah-skin-stage::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:
          radial-gradient(120% 110% at 50% 110%, rgba(0,0,0,0) 48%, rgba(0,0,0,.45) 100%),
          linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.26));
        z-index:3;
      }
      #avatarBack #skinPreviewImg.ah-skin-preview-media,
      #avatarBack #skinCanvas.ah-skin-preview-media{
        position:absolute !important;
        inset:0 !important;
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        max-height:none !important;
        margin:0 !important;
        border:0 !important;
        border-radius:0 !important;
        box-shadow:none !important;
        background:transparent !important;
        z-index:1;
      }
      #avatarBack #skinPreviewImg.ah-skin-preview-media{
        object-fit:contain !important;
        object-position:center 36% !important;
      }
      #avatarBack .ah-skin-stage-frame{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:contain;
        object-position:center;
        transform:scale(.95);
        transform-origin:center center;
        filter:drop-shadow(0 8px 14px rgba(0,0,0,.30));
        pointer-events:none;
        z-index:2;
        display:none;
      }
      #avatarBack .ah-skin-info{
        width:min(368px, 88vw);
        margin:8px auto 6px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.11);
        background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
      }
      #avatarBack .ah-skin-info-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
      }
      #avatarBack .ah-skin-info-name{
        min-width:0;
        font-size:14px;
        font-weight:700;
        letter-spacing:.01em;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      #avatarBack .ah-skin-info-meta{
        margin-top:4px;
        font-size:12px;
        color:rgba(230,238,255,.74);
      }
      #avatarBack .ah-skin-chip{
        flex:0 0 auto;
        border-radius:999px;
        padding:2px 8px;
        font-size:11px;
        font-weight:700;
        border:1px solid rgba(255,255,255,.22);
        background:rgba(255,255,255,.07);
        color:rgba(255,255,255,.92);
      }
      #avatarBack #skinDesc{
        width:min(368px, 88vw);
        margin:4px auto 0;
        text-align:center;
        font-size:12px;
        line-height:1.45;
        color:rgba(229,236,248,.78);
      }
      #avatarBack .ah-skin-actions{
        margin:10px 0;
      }
      #avatarBack .ah-skin-actions #equipSkin,
      #avatarBack .ah-skin-actions #shareSkin{
        min-height:44px;
        border-radius:12px;
        font-size:14px;
        font-weight:700;
      }
      #avatarBack #skinButtons.skins-grid{
        width:min(368px, 88vw);
        margin:10px auto 2px;
        display:grid;
        grid-template-columns:repeat(2, minmax(0,1fr));
        gap:8px;
        padding-bottom:max(14px, env(safe-area-inset-bottom));
      }
      #avatarBack .skin-btn.ah-skin-tile{
        display:flex;
        flex-direction:column;
        align-items:stretch;
        gap:6px;
        min-height:118px;
        white-space:normal;
        text-align:left;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.14);
        background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
        transition:border-color .18s ease, box-shadow .18s ease, transform .18s ease, opacity .18s ease, filter .18s ease;
      }
      #avatarBack .skin-btn.ah-skin-tile.equipped{
        border-color:rgba(147,197,253,.44);
      }
      #avatarBack .skin-btn.ah-skin-tile.active{
        border-color:rgba(196,232,255,.8);
        box-shadow:0 0 0 1px rgba(196,232,255,.24), 0 8px 18px rgba(0,0,0,.24);
      }
      #avatarBack .skin-btn.ah-skin-tile.locked{
        opacity:.6;
        filter:grayscale(.46);
      }
      #avatarBack .ah-skin-thumb{
        position:relative;
        height:56px;
        border-radius:10px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.08);
        background:
          radial-gradient(100% 70% at 50% 22%, rgba(255,255,255,.10), rgba(255,255,255,0)),
          linear-gradient(180deg, rgba(13,17,26,.94), rgba(6,9,15,.94));
      }
      #avatarBack .ah-skin-thumb img{
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center 30%;
        opacity:.95;
        pointer-events:none;
      }
      #avatarBack .ah-skin-thumb-empty{
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:10px;
        font-weight:700;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:rgba(255,255,255,.65);
      }
      #avatarBack .ah-skin-title{
        font-size:12px;
        font-weight:700;
        line-height:1.2;
        color:rgba(247,251,255,.95);
        display:-webkit-box;
        -webkit-line-clamp:2;
        -webkit-box-orient:vertical;
        overflow:hidden;
      }
      #avatarBack .ah-skin-state{
        align-self:flex-start;
        border-radius:999px;
        padding:2px 7px;
        font-size:10px;
        font-weight:700;
        letter-spacing:.03em;
        border:1px solid rgba(255,255,255,.2);
        background:rgba(255,255,255,.06);
        color:rgba(255,255,255,.9);
      }
      #avatarBack .ah-skin-state.is-equipped,
      #avatarBack .ah-skin-chip.is-equipped{
        border-color:rgba(196,232,255,.72);
        background:rgba(196,232,255,.2);
        color:rgba(225,244,255,.98);
      }
      #avatarBack .ah-skin-state.is-selected,
      #avatarBack .ah-skin-chip.is-selected{
        border-color:rgba(255,255,255,.42);
        background:rgba(255,255,255,.12);
      }
      #avatarBack .ah-skin-state.is-locked,
      #avatarBack .ah-skin-chip.is-locked{
        border-color:rgba(255,255,255,.18);
        background:rgba(255,255,255,.04);
        color:rgba(255,255,255,.7);
      }
      @keyframes ahSkinStageIn{
        from{ opacity:.75; transform:translateY(4px) scale(.995); }
        to{ opacity:1; transform:translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePolishDom() {
    if (!avatarBack) return;
    ensurePolishCss();

    const card = avatarBack.querySelector(".sheet-card");
    if (!card || !skinPreviewImg || !skinCanvas) return;

    let stageWrap = card.querySelector(".ah-skin-stage-wrap");
    let stage = card.querySelector(".ah-skin-stage");
    if (!stageWrap || !stage) {
      stageWrap = document.createElement("div");
      stageWrap.className = "ah-skin-stage-wrap";
      stage = document.createElement("div");
      stage.className = "ah-skin-stage";
      stageWrap.appendChild(stage);
      card.insertBefore(stageWrap, skinDesc || null);
    }

    if (skinPreviewImg.parentElement !== stage) stage.appendChild(skinPreviewImg);
    if (skinCanvas.parentElement !== stage) stage.appendChild(skinCanvas);

    skinPreviewImg.classList.add("ah-skin-preview-media");
    skinCanvas.classList.add("ah-skin-preview-media");

    skinPreviewFrame = document.getElementById("skinPreviewFrameOverlay");
    if (!skinPreviewFrame) {
      skinPreviewFrame = document.createElement("img");
      skinPreviewFrame.id = "skinPreviewFrameOverlay";
      skinPreviewFrame.className = "ah-skin-stage-frame";
      skinPreviewFrame.alt = "";
      stage.appendChild(skinPreviewFrame);
    }

    let info = document.getElementById("skinInfo");
    if (!info) {
      info = document.createElement("div");
      info.id = "skinInfo";
      info.className = "ah-skin-info";
      info.innerHTML = `
        <div class="ah-skin-info-top">
          <div id="skinInfoName" class="ah-skin-info-name">Default</div>
          <span id="skinStateChip" class="ah-skin-chip">Base</span>
        </div>
        <div id="skinInfoMeta" class="ah-skin-info-meta">Base | Cosmetic skin</div>
      `;
      card.insertBefore(info, skinDesc || null);
    }

    skinInfoName = document.getElementById("skinInfoName");
    skinInfoMeta = document.getElementById("skinInfoMeta");
    skinStateChip = document.getElementById("skinStateChip");

    equipBtn?.parentElement?.classList.add("ah-skin-actions");
  }

  function _setSkinsModalOpen(on) {
    const html = document.documentElement;
    html?.classList.toggle("ah-skins-open", !!on);
    avatarBack?.classList.toggle("is-open", !!on);
  }

  function _useImgPreview(on) {
    if (skinPreviewImg) skinPreviewImg.style.display = on ? "block" : "none";
    if (skinCanvas) skinCanvas.style.display = on ? "none" : "block";

    avatarBack?.classList.toggle("is-img-preview", !!on);
    avatarBack?.classList.toggle("is-canvas-preview", !on);
  }

  function _cleanupPreview() {
    _previewSeq++;

    if (skinPreviewImg) {
      skinPreviewImg.onerror = null;
      skinPreviewImg.src = "";
    }

    if (skinPreviewFrame) {
      skinPreviewFrame.removeAttribute("src");
      skinPreviewFrame.style.display = "none";
    }

    if (skinCtx && skinCanvas) {
      skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
    }

    avatarBack?.classList.remove("is-img-preview", "is-canvas-preview", "is-animated-preview");
    _useImgPreview(false);
  }

  function _closeSkinsModal() {
    _cleanupPreview();
    hideClaimUI();
    avatarBack?.classList.remove("is-img-preview", "is-canvas-preview", "is-animated-preview");
    _setSkinsModalOpen(false);
    if (avatarBack) avatarBack.style.display = "none";
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || window.S?.apiPost || _apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || _tg || null;
    _dbg = !!dbg;

    if (_inited) return true;
    _inited = true;

    avatarBack = document.getElementById("avatarBack");
    skinCanvas = document.getElementById("skinCanvas");
    skinCtx = skinCanvas ? skinCanvas.getContext("2d") : null;
    skinPreviewImg = document.getElementById("skinPreviewImg");
    skinDesc = document.getElementById("skinDesc");
    closeAvatar = document.getElementById("closeAvatar");
    equipBtn = document.getElementById("equipSkin");
    shareBtn = document.getElementById("shareSkin");
    skinButtonsWrap = document.getElementById("skinButtons");

    ensurePolishDom();
    ensureClaimUI();

    if (_bound) return true;
    _bound = true;

    avatarBack?.addEventListener("click", (e) => {
      if (e.target === avatarBack) _closeSkinsModal();
    });

    closeAvatar?.addEventListener("click", _closeSkinsModal);

    equipBtn?.addEventListener("click", onPrimaryAction);
    shareBtn?.addEventListener("click", onShare);

    claimBtn?.addEventListener("click", () => {
      const code = String(claimInput?.value || "").trim();
      claimSkin(code);
    });

    claimInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const code = String(claimInput?.value || "").trim();
        claimSkin(code);
      }
    });

    return true;
  }

  function isOwned(key) {
    const k = normKey(key);
    if (!k || k === "default") return true;
    return Array.isArray(_owned) && _owned.includes(k);
  }

  function getMeta(key) {
    const k = normKey(key);
    return (_catalog || []).find(s => normKey(s.key) === k) || null;
  }

  function getUnlock(metaOrKey) {
    const m = (typeof metaOrKey === "string") ? getMeta(metaOrKey) : metaOrKey;
    const u = m && m.unlock ? m.unlock : null;
    return (u && typeof u === "object") ? u : null;
  }

  function unlockKind(meta) {
    const u = getUnlock(meta);
    return String(u?.kind || "").trim().toLowerCase();
  }

  function isCodeUnlock(meta) {
    return unlockKind(meta) === "code" || unlockKind(meta) === "claim" || unlockKind(meta) === "password";
  }

  function isSupportStars(meta) {
    const k = unlockKind(meta);
    return k === "support_stars" || k === "stars_support" || k === "support";
  }

  function isSupportToken(meta) {
    const k = unlockKind(meta);
    return k === "support_token" || k === "token_support" || k === "supporter_token";
  }

  function getStarsPrice(metaOrKey) {
    const m = (typeof metaOrKey === "string") ? getMeta(metaOrKey) : metaOrKey;
    const v = Number(m?.stars ?? m?.cost?.stars ?? 0);
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }

  // prefer backend-provided progress fields
  function unlockHave(meta) {
    const v = Number(meta?.unlockHave);
    return Number.isFinite(v) ? v : null;
  }

  function unlockNeed(meta) {
    const v = Number(meta?.unlockNeed);
    return Number.isFinite(v) ? v : null;
  }

  function unlockedNow(meta) {
    return !!meta?.unlockedNow;
  }

  function unlockEndsSec(meta) {
    const v = Number(meta?.unlockEndsSec);
    return Number.isFinite(v) ? v : null;
  }

  function isEarnOnly(meta) {
    const kind = unlockKind(meta);
    if (!kind) return false;

    // support_stars is premium paid, not earn-only
    if (isSupportStars(meta)) return false;

    // weekly / referrals / code / claim / password / etc.
    return true;
  }

  function isEffectivelyOwned(key) {
    const k = normKey(key);
    if (!k || k === "default") return true;
    if (isOwned(k)) return true;

    const m = getMeta(k);
    if (m && isEarnOnly(m) && unlockedNow(m)) return true;

    return false;
  }

  // supports catalog: cost:{bones:..., tokens:...} (also accepts bone/token variants)
  function getCost(key) {
    const m = getMeta(key);
    const c = (m && m.cost) ? m.cost : {};
    const bonesRaw = (c.bones ?? c.bone ?? 0);
    const tokensRaw = (c.tokens ?? c.token ?? 0);

    const bones = Number(bonesRaw);
    const tokens = Number(tokensRaw);

    return {
      bones: Number.isFinite(bones) ? bones : 0,
      tokens: Number.isFinite(tokens) ? tokens : 0,
    };
  }

  function fmtCostLabel(cost) {
    const b = Number(cost?.bones || 0);
    const t = Number(cost?.tokens || 0);
    if (b > 0 && t > 0) return `${b} bones + ${t} tokens`;
    if (t > 0) return `${t} tokens`;
    if (b > 0) return `${b} bones`;
    return "";
  }

  function fmtEnds(endsSec) {
    if (endsSec == null) return "";
    const s = Math.max(0, Math.floor(endsSec));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function lockSuffix(meta) {
    if (!meta) return " 🔒";
    const u = getUnlock(meta);
    if (!u) return " 🔒";
    if (unlockedNow(meta)) return "";

    if (isSupportStars(meta)) return " ⭐";
    if (isCodeUnlock(meta)) return " 🔑";

    const have = unlockHave(meta);
    const need = unlockNeed(meta);
    if (have != null && need != null && need > 0) {
      return ` 🔒 ${Math.min(have, need)}/${need}`;
    }
    return " 🔒";
  }

  function lockDesc(meta) {
    const u = getUnlock(meta);
    if (!u) return "Locked.";
    const kind = String(u.kind || "").trim().toLowerCase();
    const have = unlockHave(meta);
    const need = unlockNeed(meta);

    if (isSupportStars(meta)) {
      const stars = getStarsPrice(meta);
      return stars > 0
        ? `Premium support skin. Buy for ${stars} Stars.`
        : "Premium support skin. Buy with Telegram Stars.";
    }

    if (isSupportToken(meta)) {
      if (have != null && need != null && need > 0) {
        return `Locked. Reach Believe holder tier ${need} (${have}/${need}).`;
      }
      return "Locked. Reach the required Believe holder tier to unlock.";
    }

    if (kind === "code" || kind === "claim" || kind === "password") {
      return "Locked. Enter the code to claim this skin.";
    }

    if (kind === "referrals") {
      if (have != null && need != null && need > 0) {
        const left = Math.max(0, need - have);
        return `Locked. Invite ${need} members via your reflink (${have}/${need}). Left: ${left}.`;
      }
      return "Locked. Invite members via your reflink to unlock.";
    }

    if (kind === "teamup_weekly") {
      const ends = fmtEnds(unlockEndsSec(meta));
      if (have != null && need != null && need > 0) {
        return `Locked. Complete TeamUp ${need} times this week (${have}/${need}). Resets in ${ends || "soon"}.`;
      }
      return `Locked. Earn it in TeamUp weekly challenge. Resets in ${ends || "soon"}.`;
    }

    return "Locked. Earn-only skin.";
  }

  function currentEquippedFrameUrl() {
    const frame = document.getElementById("player-frame");
    if (!frame) return "";
    const attr = String(frame.getAttribute("src") || "").trim();
    if (!attr) return "";
    let hidden = frame.style?.display === "none";
    if (!hidden) {
      try { hidden = window.getComputedStyle(frame).display === "none"; } catch (_) {}
    }
    return hidden ? "" : attr;
  }

  function syncCurrentFrameOverlay() {
    if (!skinPreviewFrame) return;
    const src = currentEquippedFrameUrl();
    if (src) {
      if (skinPreviewFrame.getAttribute("src") !== src) skinPreviewFrame.src = src;
      skinPreviewFrame.style.display = "block";
      return;
    }
    skinPreviewFrame.removeAttribute("src");
    skinPreviewFrame.style.display = "none";
  }

  function skinLaneLabel(meta, key) {
    const k = normKey(key);
    if (k === "default") return "Base";
    if (!meta) return "Cosmetic";
    if (isSupportStars(meta) || isSupportToken(meta)) return "Support";
    if (isCodeUnlock(meta)) return "Claim";
    const kind = unlockKind(meta);
    if (kind === "teamup_weekly" || kind === "referrals") return "Event";
    if (kind) return "Progress";
    const cost = getCost(k);
    if (Number(cost?.bones || 0) > 0 || Number(cost?.tokens || 0) > 0) return "Shop";
    return "Cosmetic";
  }

  function skinStateMeta({ key, owned, selected, equipped }) {
    const k = normKey(key);
    if (k === "default") {
      if (equipped) return { label: "Equipped", className: "is-equipped" };
      if (selected) return { label: "Selected", className: "is-selected" };
      return { label: "Base", className: "is-owned" };
    }
    if (!owned) return { label: "Locked", className: "is-locked" };
    if (equipped) return { label: "Equipped", className: "is-equipped" };
    if (selected) return { label: "Selected", className: "is-selected" };
    return { label: "Owned", className: "is-owned" };
  }

  function refreshSkinButtonStates() {
    if (!skinButtonsWrap) return;
    const selectedKey = normKey(_selectedKey);
    const equippedKey = normKey((_equipped && _equipped.skin) || "") || "default";

    skinButtonsWrap.querySelectorAll(".skin-btn[data-skin]").forEach((button) => {
      const key = normKey(button.dataset.skin);
      const owned = button.dataset.owned === "1";
      const selected = key === selectedKey;
      const equipped = key === equippedKey;
      const state = skinStateMeta({ key, owned, selected, equipped });
      const chip = button.querySelector(".ah-skin-state");

      button.classList.toggle("active", selected);
      button.classList.toggle("equipped", equipped);

      if (chip) {
        chip.textContent = state.label;
        chip.className = `ah-skin-state ${state.className}`;
      }
    });
  }

  function setSkinInfo(meta, key, owned) {
    const k = normKey(key);
    const lane = skinLaneLabel(meta, k);
    const state = skinStateMeta({
      key: k,
      owned,
      selected: k === normKey(_selectedKey),
      equipped: k === (normKey((_equipped && _equipped.skin) || "") || "default"),
    });

    if (skinInfoName) skinInfoName.textContent = k === "default" ? "Default" : (meta?.name || meta?.key || "Skin");

    if (skinInfoMeta) {
      const parts = [lane, "Cosmetic skin"];
      if (!owned && meta) {
        if (isSupportStars(meta)) {
          const stars = getStarsPrice(meta);
          if (stars > 0) parts.push(`${stars} Stars`);
        } else {
          const have = unlockHave(meta);
          const need = unlockNeed(meta);
          if (have != null && need != null && need > 0) parts.push(`${Math.min(have, need)}/${need}`);
        }
      }
      skinInfoMeta.textContent = parts.join(" | ");
    }

    if (skinStateChip) {
      skinStateChip.textContent = state.label;
      skinStateChip.className = `ah-skin-chip ${state.className}`;
    }
  }

  function setPrimaryButtonState() {
    if (!equipBtn) return;
    equipBtn.removeAttribute("data-kind");

    const k = normKey(_selectedKey);

    if (!k) {
      equipBtn.textContent = "Pick a skin";
      equipBtn.disabled = true;
      return;
    }

    if (k === "default") {
      equipBtn.textContent = "Equip Default";
      equipBtn.dataset.kind = "equip";
      equipBtn.disabled = false;
      return;
    }

    const m = getMeta(k);

    if (isEffectivelyOwned(k)) {
      equipBtn.textContent = "Equip";
      equipBtn.dataset.kind = "equip";
      equipBtn.disabled = false;
      return;
    }

    if (m && isCodeUnlock(m)) {
      equipBtn.textContent = "Claim";
      equipBtn.dataset.kind = "claim";
      equipBtn.disabled = false;
      return;
    }

    if (m && isSupportStars(m)) {
      const stars = getStarsPrice(m);
      equipBtn.textContent = stars > 0 ? `Buy for ${stars} Stars` : "Buy for Stars";
      equipBtn.dataset.kind = "support-stars";
      equipBtn.disabled = false;
      return;
    }

    if (m && isEarnOnly(m)) {
      const have = unlockHave(m);
      const need = unlockNeed(m);
      if (have != null && need != null && need > 0) {
        equipBtn.textContent = `Locked (${Math.min(have, need)}/${need})`;
      } else {
        equipBtn.textContent = "Locked (Earn)";
      }
      equipBtn.disabled = true;
      return;
    }

    const cost = getCost(k);
    const label = fmtCostLabel(cost);
    if (label) {
      equipBtn.textContent = `Buy (${label})`;
      equipBtn.dataset.kind = "shop";
      equipBtn.disabled = false;
      return;
    }

    equipBtn.textContent = "Locked";
    equipBtn.disabled = true;
  }

  function drawPlaceholder(text) {
    _useImgPreview(false);
    if (skinPreviewImg) skinPreviewImg.src = "";
    syncCurrentFrameOverlay();
    if (!skinCtx || !skinCanvas) return;

    skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
    skinCtx.fillStyle = "rgba(0,0,0,.35)";
    skinCtx.fillRect(0, 0, skinCanvas.width, skinCanvas.height);
    skinCtx.fillStyle = "#fff";
    skinCtx.font = "18px Arial";
    skinCtx.textAlign = "center";
    skinCtx.fillText(text || "Preview", skinCanvas.width / 2, skinCanvas.height / 2);
  }

  async function _isAnimatedWebp(url) {
    if (!url || !/\.webp(\?|#|$)/i.test(url)) return false;
    if (_animCache.has(url)) return _animCache.get(url);

    try {
      const res = await fetch(url, { cache: "force-cache" });
      const buf = await res.arrayBuffer();
      const u8 = new Uint8Array(buf);

      for (let i = 0; i < u8.length - 3; i++) {
        const a = u8[i], b = u8[i + 1], c = u8[i + 2], d = u8[i + 3];
        if (a === 65 && b === 78 && c === 73 && d === 77) { _animCache.set(url, true); return true; }
        if (a === 65 && b === 78 && c === 77 && d === 70) { _animCache.set(url, true); return true; }
      }
    } catch (e) {
      dbg("_isAnimatedWebp fetch failed", e);
    }

    _animCache.set(url, false);
    return false;
  }

  function renderSkinPreview(imgUrl, name, fallbackUrl, forceImg) {
    if ((!skinCtx || !skinCanvas) && !skinPreviewImg) return;
    syncCurrentFrameOverlay();

    if (!imgUrl) {
      drawPlaceholder(name || "Default Skin");
      return;
    }

    const seq = ++_previewSeq;

    if (forceImg && skinPreviewImg) {
      avatarBack?.classList.add("is-animated-preview");
      _useImgPreview(true);
      skinPreviewImg.onerror = () => {
        if (fallbackUrl && fallbackUrl !== imgUrl) skinPreviewImg.src = fallbackUrl;
      };
      skinPreviewImg.src = imgUrl;
      return;
    }

    const tryLoad = (withCors) => new Promise((resolve, reject) => {
      const img = new Image();
      if (withCors) img.crossOrigin = "anonymous";
      img.src = imgUrl;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

    (async () => {
      try {
        const animated = await _isAnimatedWebp(imgUrl);
        if (seq !== _previewSeq) return;

        avatarBack?.classList.toggle("is-animated-preview", !!animated);

        if (animated && skinPreviewImg) {
          _useImgPreview(true);
          skinPreviewImg.onerror = () => {
            if (fallbackUrl && fallbackUrl !== imgUrl) skinPreviewImg.src = fallbackUrl;
          };
          skinPreviewImg.src = imgUrl;
          return;
        }

        avatarBack?.classList.remove("is-animated-preview");

        if (skinPreviewImg) skinPreviewImg.src = "";
        _useImgPreview(false);

        let img;
        try {
          img = await tryLoad(true);
        } catch {
          img = await tryLoad(false);
        }

        if (seq !== _previewSeq) return;
        if (!skinCtx || !skinCanvas) return;

        skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
        const scale = Math.min(skinCanvas.width / img.width, skinCanvas.height / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const offsetX = (skinCanvas.width - drawW) / 2;
        const offsetY = Math.max(
          -skinCanvas.height * 0.2,
          ((skinCanvas.height - drawH) / 2) - (skinCanvas.height * 0.07)
        );
        skinCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
      } catch (e) {
        dbg("renderSkinPreview failed", e);

        if (fallbackUrl && fallbackUrl !== imgUrl) {
          renderSkinPreview(fallbackUrl, name, null, false);
          return;
        }

        drawPlaceholder("Skin not found");
      }
    })();
  }

  function ensureClaimUI() {
    claimWrap = document.getElementById("skinClaimWrap") || null;
    claimInput = document.getElementById("skinClaimInput") || null;
    claimBtn = document.getElementById("skinClaimBtn") || null;

    if (claimWrap && claimInput && claimBtn) return;

    const host = skinDesc?.parentElement || avatarBack;
    if (!host) return;

    claimWrap = document.createElement("div");
    claimWrap.id = "skinClaimWrap";
    claimWrap.style.display = "none";
    claimWrap.style.marginTop = "10px";
    claimWrap.style.gap = "8px";
    claimWrap.style.alignItems = "center";
    claimWrap.style.justifyContent = "center";
    claimWrap.style.flexWrap = "wrap";
    claimWrap.style.width = "100%";
    claimWrap.style.textAlign = "center";
    claimWrap.style.padding = "6px 0";

    claimInput = document.createElement("input");
    claimInput.id = "skinClaimInput";
    claimInput.type = "text";
    claimInput.placeholder = "Enter code";
    claimInput.autocomplete = "off";
    claimInput.spellcheck = false;
    claimInput.style.width = "min(320px, 88vw)";
    claimInput.style.padding = "10px 12px";
    claimInput.style.borderRadius = "12px";
    claimInput.style.border = "1px solid rgba(255,255,255,.18)";
    claimInput.style.background = "rgba(0,0,0,.25)";
    claimInput.style.color = "#fff";
    claimInput.style.outline = "none";
    claimInput.style.marginRight = "8px";

    claimBtn = document.createElement("button");
    claimBtn.id = "skinClaimBtn";
    claimBtn.type = "button";
    claimBtn.className = "btn";
    claimBtn.textContent = "Claim";
    claimBtn.style.padding = "10px 14px";
    claimBtn.style.borderRadius = "12px";

    claimWrap.appendChild(claimInput);
    claimWrap.appendChild(claimBtn);

    host.appendChild(claimWrap);
  }

  function showClaimUI(on) {
    if (!claimWrap) return;
    claimWrap.style.display = on ? "flex" : "none";
    if (on && claimInput) claimInput.focus();
  }

  function hideClaimUI() {
    showClaimUI(false);
    if (claimInput) claimInput.value = "";
  }

  async function reloadSkinsState(preferKey) {
    if (!_apiPost) throw new Error("NO_API_POST");

    const out = await _apiPost("/webapp/skins", {});
    if (!out || !out.ok) throw new Error(out?.reason || "skins refresh failed");

    _catalog = Array.isArray(out.skins) ? out.skins : [];
    _owned = Array.isArray(out.owned) ? out.owned : ["default"];
    _equipped = (out.equipped && typeof out.equipped === "object")
      ? out.equipped
      : { skin: (out.active || "") };

    buildSkinButtons();

    const wanted = normKey(preferKey);
    if (wanted && skinButtonsWrap) {
      const btn = [...skinButtonsWrap.querySelectorAll(".skin-btn")]
        .find(x => normKey(x.dataset.skin) === wanted);
      btn?.click?.();
    }

    setPrimaryButtonState();
  }

  async function buySupportSkin(key) {
    if (!_apiPost) throw new Error("NO_API_POST");

    const rid = uuid();
    const res = await _apiPost("/webapp/skins/support_invoice", {
      skin: key,
      run_id: rid,
    });

    if (res?.already) {
      await reloadSkinsState(key);
      try { await window.loadProfile?.(); } catch (_) {}
      try { _tg?.showAlert?.("You already own this skin."); } catch (_) {}
      return;
    }

    if (!res || !res.ok) {
      const reason = res?.reason || "INVOICE_FAILED";
      throw new Error(reason);
    }

    const link = String(res.invoiceLink || "").trim();
    if (!link) throw new Error("NO_INVOICE_LINK");

    if (typeof _tg?.openInvoice === "function") {
      _tg.openInvoice(link, (status) => {
        setTimeout(async () => {
          try {
            await reloadSkinsState(key);
          } catch (_) {}

          try {
            await window.loadProfile?.();
          } catch (_) {}

          if (status === "paid") {
            try { _tg?.showAlert?.("Unlocked! Now equip it."); } catch (_) {}
            haptic("medium");
          } else if (status === "cancelled") {
            try { _tg?.showAlert?.("Payment cancelled."); } catch (_) {}
          } else if (status === "failed") {
            try { _tg?.showAlert?.("Payment failed."); } catch (_) {}
          }
        }, 1200);
      });
      return;
    }

    window.location.href = link;
  }

  async function claimSkin(codeRaw) {
    const code = String(codeRaw || "").trim();
    if (!code) {
      try { _tg?.showAlert?.("Enter the code first."); } catch (_) {}
      return;
    }
    if (!_apiPost) {
      try { _tg?.showAlert?.("Skins not ready yet."); } catch (_) {}
      return;
    }

    try {
      const rid = uuid();
      const out = await _apiPost("/webapp/skins/claim", { code, run_id: rid });

      if (!out || !out.ok) {
        const r = out?.reason || "CLAIM_FAILED";
        const msg =
          (r === "BAD_CODE") ? "Wrong code." :
          (r === "INVALID_TARGET") ? "This code can't be used here." :
          (r === "EMPTY_CODE") ? "Enter the code first." :
          r;
        throw new Error(msg);
      }

      if (Array.isArray(out.skins)) _catalog = out.skins;
      if (Array.isArray(out.owned)) _owned = out.owned;
      if (out.equipped && typeof out.equipped === "object") _equipped = out.equipped;

      try { _tg?.showAlert?.("Claimed ✅"); } catch (_) {}
      haptic("medium");

      buildSkinButtons();
      setPrimaryButtonState();
      _closeSkinsModal();

      try { window.loadProfile?.(); } catch (_) {}
    } catch (e) {
      console.warn(e);
      const msg = (e && e.data && e.data.reason) ? e.data.reason : (e?.message || "Claim failed");
      try { _tg?.showAlert?.(msg); } catch (_) {}
    }
  }

  function buildSkinButtons() {
    if (!skinButtonsWrap) return;
    skinButtonsWrap.innerHTML = "";

    const all = [{ key: "default", name: "Default", img: currentHeroSkinUrl() }, ...(_catalog || [])];

    all.forEach((s) => {
      const key = normKey(s.key);
      const owned = isEffectivelyOwned(key);
      const previewUrl = String(s?.img || "").trim() || (key === "default" ? currentHeroSkinUrl() : "");
      const thumbUrl = String(s?.thumb || s?.preview || s?.preview_url || previewUrl).trim();

      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn skin-btn ah-skin-tile" + (!owned ? " locked" : "");
      b.dataset.skin = key;
      b.dataset.owned = owned ? "1" : "0";

      const thumb = document.createElement("div");
      thumb.className = "ah-skin-thumb";
      if (thumbUrl) {
        const thumbImg = document.createElement("img");
        thumbImg.src = thumbUrl;
        thumbImg.alt = "";
        thumb.appendChild(thumbImg);
      } else {
        const empty = document.createElement("div");
        empty.className = "ah-skin-thumb-empty";
        empty.textContent = key === "default" ? "Default" : "Preview";
        thumb.appendChild(empty);
      }

      const title = document.createElement("div");
      title.className = "ah-skin-title";
      title.textContent = s.name || s.key || "Skin";

      const chip = document.createElement("span");
      chip.className = "ah-skin-state";

      b.appendChild(thumb);
      b.appendChild(title);
      b.appendChild(chip);

      b.addEventListener("click", () => {
        _selectedKey = key;
        refreshSkinButtonStates();

        renderSkinPreview(previewUrl, s.name || s.key, s.fallback, !!s.animated);

        const meta = (key === "default") ? null : s;
        setSkinInfo(meta, key, owned);
        const shouldShowClaim = !!meta && isCodeUnlock(meta) && !isEffectivelyOwned(key);
        showClaimUI(shouldShowClaim);

        if (skinDesc) {
          if (key === "default") {
            skinDesc.textContent = "Default - clean Alpha.";
          } else if (isEffectivelyOwned(key)) {
            skinDesc.textContent = `${s.name || s.key} - available.`;
          } else if (meta && isCodeUnlock(meta)) {
            skinDesc.textContent = `${s.name || s.key} - ${lockDesc(meta)}`;
          } else if (meta && isSupportStars(meta)) {
            skinDesc.textContent = `${s.name || s.key} - ${lockDesc(meta)}`;
          } else if (isEarnOnly(s)) {
            skinDesc.textContent = `${s.name || s.key} - ${lockDesc(s)}`;
          } else {
            const cost = getCost(key);
            const label = fmtCostLabel(cost);
            skinDesc.textContent = label
              ? `${s.name || s.key} - locked. Buy to unlock (${label}).`
              : `${s.name || s.key} - locked.`;
          }
        }

        syncCurrentFrameOverlay();
        setPrimaryButtonState();
        haptic("light");
      });

      skinButtonsWrap.appendChild(b);
    });

    const eq = normKey((_equipped && _equipped.skin) || "") || "default";
    _selectedKey = eq;

    const btn =
      skinButtonsWrap.querySelector(`[data-skin="${_selectedKey}"]`) ||
      skinButtonsWrap.querySelector(".skin-btn");

    btn?.click?.();
  }
  async function open() {
    ensurePolishDom();
    if (!_apiPost) {
      console.warn("[Skins] apiPost missing (init not called yet?)");
      try { _tg?.showAlert?.("Skins not ready yet."); } catch (_) {}
      return;
    }

    try {
      const out = await _apiPost("/webapp/skins", {});
      if (!out || !out.ok) throw new Error(out?.reason || "skins get failed");

      _catalog = Array.isArray(out.skins) ? out.skins : [];
      _owned = Array.isArray(out.owned) ? out.owned : ["default"];
      _equipped = (out.equipped && typeof out.equipped === "object")
        ? out.equipped
        : { skin: (out.active || "") };

      buildSkinButtons();

      if (avatarBack) avatarBack.style.display = "flex";
      _setSkinsModalOpen(true);
      syncCurrentFrameOverlay();
      setPrimaryButtonState();
    } catch (e) {
      console.warn(e);
      try { _tg?.showAlert?.("Failed to load skins."); } catch (_) {}
    }
  }

  async function onPrimaryAction() {
    const key = normKey(_selectedKey);
    if (!key) return;

    if (!_apiPost) {
      try { _tg?.showAlert?.("Skins not ready yet."); } catch (_) {}
      return;
    }

    const meta = getMeta(key);

    try {
      if (isEffectivelyOwned(key) || key === "default") {
        const out = await _apiPost("/webapp/skins/equip", { skin: key === "default" ? "default" : key });
        if (!out || !out.ok) throw new Error(out?.reason || "equip failed");

        try { _tg?.showAlert?.("Skin equipped!"); } catch (_) {}
        _closeSkinsModal();
        try { window.loadProfile?.(); } catch (_) {}
        return;
      }

      if (meta && isCodeUnlock(meta)) {
        const code = String(claimInput?.value || "").trim() || String(prompt("Enter claim code") || "").trim();
        await claimSkin(code);
        return;
      }

      if (meta && isSupportStars(meta)) {
        await buySupportSkin(key);
        return;
      }

      if (meta && isEarnOnly(meta)) {
        try { _tg?.showAlert?.(lockDesc(meta)); } catch (_) {}
        return;
      }

      const cost = getCost(key);
      if ((cost.bones <= 0) && (cost.tokens <= 0)) {
        try { _tg?.showAlert?.("This skin is locked."); } catch (_) {}
        return;
      }

      const rid = uuid();
      const outBuy = await _apiPost("/webapp/skins/buy", { skin: key, run_id: rid });

      if (!outBuy || !outBuy.ok) {
        const r = outBuy?.reason || "buy failed";
        const msg =
          (r === "NOT_ENOUGH_TOKENS") ? "Not enough tokens." :
          (r === "NOT_ENOUGH_BONES") ? "Not enough bones." :
          (r === "ALREADY_OWNED") ? "Already owned." :
          (r === "EARN_ONLY") ? "This skin is earn-only." :
          (r === "EXTERNAL_UNLOCK") ? "This skin is unlocked externally." :
          r;
        throw new Error(msg);
      }

      const out = await _apiPost("/webapp/skins", {});
      if (out && out.ok) {
        _owned = Array.isArray(out.owned) ? out.owned : _owned;
        _equipped = (out.equipped && typeof out.equipped === "object") ? out.equipped : _equipped;
        _catalog = Array.isArray(out.skins) ? out.skins : _catalog;
      }

      try { _tg?.showAlert?.("Unlocked! Now equip it."); } catch (_) {}
      buildSkinButtons();
      setPrimaryButtonState();
      haptic("medium");
    } catch (e) {
      console.warn(e);
      const msg = (e && e.data && e.data.reason) ? e.data.reason : (e?.message || "Action failed");
      try { _tg?.showAlert?.(msg); } catch (_) {}
    }
  }

  async function onShare() {
    const key = normKey(_selectedKey);

    try {
      let res;
      if (_apiPost) {
        res = await _apiPost("/webapp/skins/flex", { skinKey: key });
      } else {
        const API_BASE = window.API_BASE || "";
        const initData = (_tg && _tg.initData) || window.__INIT_DATA__ || "";
        const r = await fetch(API_BASE + "/webapp/skins/flex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skinKey: key, init_data: initData }),
        });
        res = await r.json();
      }

      if (!res?.ok) {
        const reason = res?.reason || "Failed";
        if (reason === "COOLDOWN" && res.cooldownLeftSec != null) {
          try { _tg?.showAlert?.(`Cooldown: ${res.cooldownLeftSec}s`); } catch (_) {}
        } else {
          try { _tg?.showAlert?.(reason); } catch (_) {}
        }
        return;
      }

      try { _tg?.showAlert?.("Posted to community ✅"); } catch (_) {}
      haptic("medium");
    } catch (e) {
      try { _tg?.showAlert?.("Flex failed"); } catch (_) {}
    }
  }

  window.Skins = { init, open };
})();

