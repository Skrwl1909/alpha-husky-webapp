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
  let statusBox;
  let gridBox;
  let emptyBox;
  let detailBox;
  let _selectedBadgeKey = "";
  let _draftFeaturedBadgeKeys = [];
  let _featuredDirty = false;
  let _savingFeatured = false;

  let _state = {
    badges: [],
    total: 0,
    activeBadgeKey: "",
    featuredBadgeKeys: [],
  };
  const MAX_FEATURED_BADGES = 3;

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
        width:min(96vw, 560px);
        max-height:88vh;
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
        max-height:52vh;
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
        width:100%;
        height:100%;
        border-radius:9px;
        position:relative;
        border:1px solid rgba(183,208,233,.24);
        background:rgba(6,12,20,.7);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
        font-weight:900;
        color:rgba(229,240,252,.9);
        overflow:hidden;
      }
      #badgeWallBack .ah-bw-icon img{
        width:100%;
        height:100%;
        object-fit:contain;
      }
      #badgeWallBack .ah-bw-icon img.ah-bw-layer{
        position:absolute;
        inset:0;
        display:none;
      }
      #badgeWallBack .ah-bw-icon img.ah-bw-emblem{ z-index:1; }
      #badgeWallBack .ah-bw-icon img.ah-bw-frame{ z-index:2; }
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
        <div class="sheet-card ah-bw-card" role="dialog" aria-modal="true" aria-label="Badge Wall">
          <div class="ah-bw-head">
            <div>
              <h2 class="ah-bw-title">Badge Wall</h2>
              <div class="ah-bw-sub">Compact trophy atlas from your live badge profile.</div>
            </div>
            <div class="ah-bw-head-actions">
              <button class="btn" id="badgeWallRefresh" type="button">Refresh</button>
              <button class="btn" id="badgeWallSaveFeatured" type="button">Save Featured</button>
              <button class="btn" id="closeBadgeWall" type="button">X</button>
            </div>
          </div>

          <div class="ah-bw-meta">
            <span class="ah-bw-pill" id="badgeWallOwned">Owned 0/0</span>
            <span class="ah-bw-pill is-muted" id="badgeWallActive">No active title</span>
            <span class="ah-bw-pill is-muted" id="badgeWallFeatured">Featured 0/3</span>
          </div>

          <div class="ah-bw-status" id="badgeWallStatus" hidden></div>
          <div class="ah-bw-grid" id="badgeWallGrid"></div>
          <div class="ah-bw-empty" id="badgeWallEmpty" hidden>No badges available yet.</div>
          <div class="ah-bw-detail" id="badgeWallDetail" hidden></div>
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
    statusBox = document.getElementById("badgeWallStatus");
    gridBox = document.getElementById("badgeWallGrid");
    emptyBox = document.getElementById("badgeWallEmpty");
    detailBox = document.getElementById("badgeWallDetail");
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

  function updateSaveButtonState() {
    if (!saveFeaturedBtn) return;
    saveFeaturedBtn.disabled = _savingFeatured || !_featuredDirty;
    saveFeaturedBtn.textContent = _savingFeatured ? "Saving..." : "Save Featured";
  }

  function updateSummary() {
    const list = Array.isArray(_state.badges) ? _state.badges : [];
    const ownedCount = list.reduce((acc, item) => (item?.owned ? acc + 1 : acc), 0);
    const totalCount = list.length;

    if (ownedPill) {
      ownedPill.textContent = "Owned " + String(ownedCount) + "/" + String(totalCount);
    }

    if (activePill) {
      const activeKey = toKey(_state.activeBadgeKey);
      if (!activeKey) {
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
  function badgeFrameSource(badge) {
    return String(badge?.frameUrl || badge?.frame_url || "").trim();
  }
  function isMasteryBadge(badge) {
    return String(badge?.badgeType || badge?.badge_type || "").trim().toLowerCase() === "mastery";
  }

  function setBadgeImage(iconWrap, badge, key) {
    const primary = badgeIconSource(badge);
    const emblem = badgeEmblemSource(badge);
    const frame = badgeFrameSource(badge);
    const layeredMode = !!frame;
    const fallbackMark = "◆";

    clearEl(iconWrap);

    const fallback = newEl("span", "ah-bw-fallback", fallbackMark);
    iconWrap.appendChild(fallback);

    if (layeredMode) {
      const layers = [];
      const showLockedEmblem = !isMasteryBadge(badge);
      if (emblem && (badge?.owned || showLockedEmblem)) {
        layers.push({ src: emblem, className: "ah-bw-layer ah-bw-emblem" });
      }
      layers.push({ src: frame, className: "ah-bw-layer ah-bw-frame" });

      let loadedCount = 0;
      for (const layer of layers) {
        const img = newEl("img", layer.className);
        img.alt = String(badge.name || key || "Badge");
        img.loading = "eager";
        img.decoding = "async";
        img.style.display = "none";

        img.addEventListener("load", () => {
          loadedCount += 1;
          img.style.display = "block";
          if (loadedCount > 0) {
            fallback.style.display = "none";
          }
        });

        img.addEventListener("error", () => {
          img.remove();
          if (loadedCount <= 0) {
            fallback.style.display = "";
          }
        });

        iconWrap.appendChild(img);
        img.src = layer.src;
      }
      return;
    }

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

    const tileClass = "ah-bw-tile " + RARITY_CLASS[rarity] + (isActive ? " is-active" : "") + (isFeatured ? " is-featured" : "") + (isOwned ? " is-owned" : " is-locked");
    const card = newEl("button", tileClass);
    card.type = "button";
    card.setAttribute("aria-label", String(badge.name || key || "Badge"));
    if (key) card.setAttribute("data-key", key);

    const iconWrap = newEl("div", "ah-bw-icon");
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
    setStatus("Loading Badge Wall...", "");
    try {
      const next = await loadState();
      _state = next;
      _draftFeaturedBadgeKeys = normalizeFeaturedKeys(next.featuredBadgeKeys);
      _featuredDirty = false;
      updateSummary();
      renderBadges();
      setStatus("");
    } catch (err) {
      dbg("refresh failed", err);
      setStatus("Failed to load badges. Try again in a moment.", "error");
      if (!Array.isArray(_state.badges) || !_state.badges.length) {
        renderBadges();
      }
      throw err;
    }
  }

  function close() {
    if (wallBack) wallBack.style.display = "none";
    unbindTgBackButton();
  }

  async function open() {
    if (!_apiPost) {
      init();
    }
    if (!_apiPost) {
      showAlert("Badge Wall is not ready yet.");
      return;
    }

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

    wallBack?.addEventListener("click", (e) => {
      if (e.target === wallBack) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!wallBack || wallBack.style.display === "none") return;
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

