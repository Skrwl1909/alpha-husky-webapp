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
  let ownedPill;
  let activePill;
  let statusBox;
  let gridBox;
  let emptyBox;

  let _state = {
    badges: [],
    total: 0,
    activeBadgeKey: "",
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

  function sanitizeRarity(value) {
    const rarity = String(value || "common").trim().toLowerCase();
    return RARITY_CLASS[rarity] ? rarity : "common";
  }

  function iconFileUrl(rawPath) {
    const source = String(rawPath || "").trim();
    if (!source) return "";
    if (/^https?:\/\//i.test(source) || source.startsWith("/")) return source;
    const safePath = source
      .replaceAll("\\", "/")
      .split("/")
      .map(encodeURIComponent)
      .join("/");
    return "/assets/badges/" + safePath;
  }

  function ensureCss() {
    if (document.getElementById("ah-badge-wall-style")) return;
    const style = document.createElement("style");
    style.id = "ah-badge-wall-style";
    style.textContent = `
      #badgeWallBack{
        z-index: 1300;
        background:
          radial-gradient(circle at 12% 0%, rgba(106,135,173,.2), transparent 42%),
          radial-gradient(circle at 88% 100%, rgba(120,98,58,.22), transparent 48%),
          rgba(2,5,10,.78);
      }
      #badgeWallBack .ah-bw-card{
        width:min(94vw, 560px);
        max-height:88vh;
        overflow:hidden;
        border-radius:20px;
        border:1px solid rgba(181,209,235,.24);
        background:
          radial-gradient(circle at 8% -24%, rgba(131,163,206,.16), transparent 54%),
          radial-gradient(circle at 96% 116%, rgba(152,118,72,.12), transparent 60%),
          linear-gradient(180deg, rgba(16,21,32,.96), rgba(9,12,18,.96));
        box-shadow:
          0 20px 56px rgba(0,0,0,.64),
          inset 0 1px 0 rgba(255,255,255,.08);
        padding:14px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      #badgeWallBack .ah-bw-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }
      #badgeWallBack .ah-bw-title{
        margin:0;
        font-size:17px;
        font-weight:900;
        letter-spacing:.25px;
        color:#f3f8ff;
      }
      #badgeWallBack .ah-bw-sub{
        margin-top:2px;
        font-size:11px;
        line-height:1.35;
        color:rgba(197,216,235,.78);
      }
      #badgeWallBack .ah-bw-head-actions{
        display:flex;
        gap:8px;
      }
      #badgeWallBack .ah-bw-head-actions .btn{
        min-width:44px;
        height:34px;
        border-radius:12px;
      }
      #badgeWallBack .ah-bw-meta{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }
      #badgeWallBack .ah-bw-pill{
        display:inline-flex;
        align-items:center;
        min-height:24px;
        padding:4px 10px;
        border-radius:999px;
        border:1px solid rgba(190,217,242,.24);
        background:rgba(12,20,34,.66);
        color:#d7ecff;
        font-size:11px;
        font-weight:800;
        letter-spacing:.1px;
      }
      #badgeWallBack .ah-bw-pill.is-muted{
        color:rgba(190,211,230,.7);
        border-color:rgba(170,188,206,.2);
      }
      #badgeWallBack .ah-bw-status{
        border-radius:12px;
        border:1px solid rgba(165,196,226,.18);
        background:rgba(10,18,30,.68);
        color:rgba(208,228,247,.88);
        padding:9px 11px;
        font-size:12px;
        line-height:1.35;
      }
      #badgeWallBack .ah-bw-status[data-kind="error"]{
        border-color:rgba(224,104,104,.3);
        color:#ffc4c4;
        background:rgba(45,16,21,.6);
      }
      #badgeWallBack .ah-bw-grid{
        margin:0;
        padding:0 2px 4px 0;
        overflow:auto;
        display:grid;
        grid-template-columns:repeat(2, minmax(0, 1fr));
        gap:10px;
        min-height:120px;
        max-height:56vh;
      }
      #badgeWallBack .ah-bw-empty{
        border:1px dashed rgba(174,199,224,.2);
        border-radius:14px;
        padding:24px 12px;
        text-align:center;
        font-size:12px;
        color:rgba(196,217,236,.72);
        background:rgba(11,17,27,.58);
      }
      #badgeWallBack .ah-bw-badge{
        position:relative;
        border-radius:14px;
        border:1px solid rgba(178,202,226,.2);
        background:
          linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.01)),
          rgba(8,13,22,.74);
        padding:10px;
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      #badgeWallBack .ah-bw-badge.is-active{
        border-color:rgba(247,203,124,.5);
        box-shadow:
          0 0 0 1px rgba(247,203,124,.28),
          0 8px 22px rgba(123,84,24,.28);
      }
      #badgeWallBack .ah-bw-badge-top{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:6px;
      }
      #badgeWallBack .ah-bw-rarity{
        display:inline-flex;
        align-items:center;
        min-height:20px;
        padding:2px 8px;
        border-radius:999px;
        border:1px solid rgba(188,214,238,.2);
        background:rgba(11,20,34,.66);
        color:rgba(208,228,247,.82);
        font-size:10px;
        font-weight:800;
        text-transform:uppercase;
        letter-spacing:.32px;
      }
      #badgeWallBack .ah-bw-active{
        font-size:10px;
        font-weight:900;
        letter-spacing:.28px;
        text-transform:uppercase;
        color:#ffd68b;
      }
      #badgeWallBack .ah-bw-icon{
        width:44px;
        height:44px;
        border-radius:12px;
        border:1px solid rgba(183,208,233,.24);
        background:rgba(6,12,20,.7);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        font-weight:900;
        color:rgba(229,240,252,.9);
        overflow:hidden;
      }
      #badgeWallBack .ah-bw-icon img{
        width:100%;
        height:100%;
        object-fit:cover;
      }
      #badgeWallBack .ah-bw-name{
        margin:0;
        font-size:13px;
        line-height:1.25;
        font-weight:900;
        color:#eff7ff;
      }
      #badgeWallBack .ah-bw-desc{
        margin:0;
        font-size:11px;
        line-height:1.35;
        color:rgba(195,216,236,.76);
      }
      #badgeWallBack .ah-bw-key{
        margin-top:auto;
        font-size:10px;
        letter-spacing:.25px;
        color:rgba(170,194,218,.55);
      }
      #badgeWallBack .ah-bw-badge.is-uncommon{ border-color:rgba(120,189,147,.35); }
      #badgeWallBack .ah-bw-badge.is-rare{ border-color:rgba(98,161,236,.38); }
      #badgeWallBack .ah-bw-badge.is-epic{ border-color:rgba(178,120,220,.42); }
      #badgeWallBack .ah-bw-badge.is-legendary{ border-color:rgba(240,183,92,.45); }
      @media (min-width: 560px){
        #badgeWallBack .ah-bw-grid{
          grid-template-columns:repeat(3, minmax(0, 1fr));
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
              <div class="ah-bw-sub">Your earned badges from the live profile system.</div>
            </div>
            <div class="ah-bw-head-actions">
              <button class="btn" id="badgeWallRefresh" type="button">Refresh</button>
              <button class="btn" id="closeBadgeWall" type="button">X</button>
            </div>
          </div>

          <div class="ah-bw-meta">
            <span class="ah-bw-pill" id="badgeWallOwned">Owned 0</span>
            <span class="ah-bw-pill is-muted" id="badgeWallActive">No active title</span>
          </div>

          <div class="ah-bw-status" id="badgeWallStatus" hidden></div>
          <div class="ah-bw-grid" id="badgeWallGrid"></div>
          <div class="ah-bw-empty" id="badgeWallEmpty" hidden>No badges unlocked yet.</div>
        </div>
      `;
      document.body.appendChild(wallBack);
    }

    closeBtn = document.getElementById("closeBadgeWall");
    refreshBtn = document.getElementById("badgeWallRefresh");
    ownedPill = document.getElementById("badgeWallOwned");
    activePill = document.getElementById("badgeWallActive");
    statusBox = document.getElementById("badgeWallStatus");
    gridBox = document.getElementById("badgeWallGrid");
    emptyBox = document.getElementById("badgeWallEmpty");
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

  function updateSummary() {
    if (ownedPill) {
      ownedPill.textContent = "Owned " + String(_state.total || 0);
    }

    if (!activePill) return;
    const activeKey = toKey(_state.activeBadgeKey);
    if (!activeKey) {
      activePill.textContent = "No active title";
      activePill.classList.add("is-muted");
      return;
    }

    const active = (_state.badges || []).find((item) => toKey(item.key) === activeKey);
    if (active) {
      activePill.textContent = "Displayed: " + (active.name || active.key);
    } else {
      activePill.textContent = "Displayed: " + activeKey;
    }
    activePill.classList.remove("is-muted");
  }

  function newEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function createBadgeCard(badge, activeKey) {
    const rarity = sanitizeRarity(badge.rarity);
    const key = String(badge.key || "").trim();
    const isActive = !!activeKey && toKey(key) === activeKey;

    const card = newEl("article", "ah-bw-badge " + RARITY_CLASS[rarity] + (isActive ? " is-active" : ""));

    const top = newEl("div", "ah-bw-badge-top");
    const rarityChip = newEl("span", "ah-bw-rarity", rarity);
    top.appendChild(rarityChip);
    if (isActive) {
      top.appendChild(newEl("span", "ah-bw-active", "Displayed"));
    }
    card.appendChild(top);

    const iconWrap = newEl("div", "ah-bw-icon");
    const iconText = String(badge.icon || "").trim() || "B";
    const iconPath = iconFileUrl(badge.icon_file || badge.iconFile);
    if (iconPath) {
      const img = newEl("img");
      img.alt = String(badge.name || key || "Badge");
      img.loading = "lazy";
      img.src = iconPath;
      img.addEventListener("error", () => {
        img.remove();
        iconWrap.textContent = iconText;
      });
      iconWrap.appendChild(img);
    } else {
      iconWrap.textContent = iconText;
    }
    card.appendChild(iconWrap);

    card.appendChild(newEl("h3", "ah-bw-name", String(badge.name || key || "Unknown Badge")));
    card.appendChild(newEl("p", "ah-bw-desc", String(badge.description || "Prestige badge.")));
    card.appendChild(newEl("div", "ah-bw-key", key || "UNKNOWN_BADGE"));

    return card;
  }

  function renderBadges() {
    if (!gridBox || !emptyBox) return;
    gridBox.innerHTML = "";

    const list = Array.isArray(_state.badges) ? _state.badges : [];
    const activeKey = toKey(_state.activeBadgeKey);
    if (!list.length) {
      emptyBox.hidden = false;
      return;
    }

    emptyBox.hidden = true;
    for (const badge of list) {
      gridBox.appendChild(createBadgeCard(badge, activeKey));
    }
  }

  function normalizeState(payload) {
    const list = Array.isArray(payload?.badges) ? payload.badges : [];
    const badges = list.map((raw) => ({
      key: String(raw?.key || "").trim(),
      name: String(raw?.name || raw?.key || "Unknown Badge").trim(),
      icon: typeof raw?.icon === "string" ? raw.icon.trim() : "",
      icon_file: typeof raw?.icon_file === "string" ? raw.icon_file.trim() : "",
      description: String(raw?.description || "").trim(),
      rarity: sanitizeRarity(raw?.rarity),
    }));

    const total = Number.isFinite(payload?.total) ? Number(payload.total) : badges.length;
    const activeBadgeKey = String(payload?.activeBadgeKey || payload?.active_badge_key || "").trim();

    return { badges, total, activeBadgeKey };
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
