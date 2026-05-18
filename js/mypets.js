// js/mypets.js
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _inited = false;
  let _backHandler = null;

  const PET_STAT_ORDER = [
    ["str", "STR"],
    ["agi", "AGI"],
    ["def", "DEF"],
    ["vit", "VIT"],
    ["int", "INT"],
    ["luk", "LUCK"]
  ];

  function log(...args) {
    if (_dbg) console.log("[MyPets]", ...args);
  }

  function q(sel, root = document) {
    return root.querySelector(sel);
  }

  function qa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getPendingPoints(pet) {
    return Number(pet?.pendingStatPoints ?? pet?.pending_stat_points ?? 0) || 0;
  }

  function getEffectiveStats(pet) {
    const stats = pet?.effectiveStats || {};
    return {
      str: Number(stats.str || 0),
      agi: Number(stats.agi || 0),
      def: Number(stats.def || 0),
      vit: Number(stats.vit || 0),
      int: Number(stats.int || 0),
      luk: Number(stats.luk || 0)
    };
  }

  function formatPendingLabel(points) {
    const count = Math.max(0, Number(points || 0));
    if (count === 1) return "1 stat point available";
    return `Pending points: ${count}`;
  }

  function ensureStyles() {
    if (document.getElementById("mypets-style")) return;
    const s = document.createElement("style");
    s.id = "mypets-style";
    s.textContent = `
      #mypetsModal{position:fixed;inset:0;display:none;z-index:9999;background:rgba(0,0,0,.58)}
      #mypetsModal .panel{
        position:absolute;left:50%;bottom:14px;transform:translateX(-50%);
        width:min(520px,calc(100% - 24px));max-height:82vh;overflow:auto;
        border-radius:16px;background:linear-gradient(180deg,#0f1621 0%,#0b1017 100%);
        border:1px solid rgba(162,217,255,.14);
        box-shadow:0 18px 44px rgba(0,0,0,.34)
      }
      #mypetsModal .head{
        display:flex;align-items:center;justify-content:space-between;
        padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.10)
      }
      #mypetsModal .head .t{font-weight:800;letter-spacing:.2px;color:#f5fbff}
      #mypetsModal .head button{
        background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#f7fcff;
        font-size:15px;cursor:pointer;border-radius:10px;min-width:32px;min-height:32px
      }
      #mypetsModal .sub{padding:0 14px 10px;color:rgba(229,242,255,.8);font-size:12px;line-height:1.45}
      #mypetsModal .list{padding:12px 14px;display:flex;flex-direction:column;gap:10px}
      .petRow{
        display:flex;gap:12px;align-items:center;
        padding:11px;border-radius:14px;
        border:1px solid rgba(208,229,255,.12);
        background:linear-gradient(180deg,rgba(255,255,255,.08) 0%,rgba(255,255,255,.045) 100%);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04)
      }
      .petRow.active{
        outline:1px solid rgba(137,255,254,.42);
        border-color:rgba(137,255,254,.26);
        background:linear-gradient(180deg,rgba(96,165,250,.14) 0%,rgba(255,255,255,.06) 100%)
      }
      .petImg{
        width:56px;height:56px;border-radius:12px;object-fit:cover;
        background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.08)
      }
      .petImg.petSprite{object-fit:contain}
      .petImg.petSprite canvas,
      .petImg.petSprite img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated;display:block}
      .petMeta{flex:1;min-width:0}
      .petName{
        font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        color:#f6fbff;font-size:14px;letter-spacing:.01em
      }
      .petSub{color:rgba(223,237,255,.88);font-size:12px;line-height:1.4;margin-top:4px}
      .petBadges{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}
      .petBadge{
        display:inline-flex;align-items:center;gap:4px;
        padding:5px 10px;border-radius:999px;font-size:11px;font-weight:800;
        background:rgba(137,255,254,.18);border:1px solid rgba(137,255,254,.28);color:#efffff;
        box-shadow:0 0 0 1px rgba(137,255,254,.06) inset
      }
      .petStats{
        display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;margin-top:9px
      }
      .petStat{
        display:flex;align-items:center;justify-content:space-between;gap:6px;
        min-width:0;padding:7px 9px;border-radius:11px;
        background:rgba(163,191,224,.12);border:1px solid rgba(207,226,248,.14)
      }
      .petStatText{display:flex;align-items:center;gap:6px;min-width:0}
      .petStatLabel{font-size:11px;color:rgba(222,236,249,.82);font-weight:700;letter-spacing:.03em}
      .petStatValue{font-size:13px;font-weight:800;color:#f6fbff}
      .petStatAdd{
        width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;
        border-radius:999px;border:1px solid rgba(137,255,254,.42);
        background:linear-gradient(180deg,rgba(84,203,255,.34) 0%,rgba(60,171,235,.22) 100%);
        color:#f9feff;cursor:pointer;font-weight:900;font-size:16px;flex:0 0 auto;
        box-shadow:0 4px 12px rgba(54,158,217,.18)
      }
      .petStatAdd[disabled]{opacity:.45;cursor:default;box-shadow:none}
      .petDebug{opacity:.72;font-size:10px;line-height:1.35;margin-top:5px;word-break:break-word}
      .petBtn{
        padding:9px 11px;border-radius:12px;min-width:62px;
        border:1px solid rgba(255,255,255,.16);
        background:rgba(255,255,255,.08);color:#f8fcff;cursor:pointer;font-weight:700
      }
      .petBtn[disabled]{opacity:.72;cursor:default}
      .petErr{padding:14px;color:rgba(235,244,255,.86)}
      @media (max-width: 420px){
        #mypetsModal .panel{width:min(520px,calc(100% - 18px));bottom:10px}
        #mypetsModal .list{padding:10px 12px}
        .petRow{gap:10px;padding:10px}
        .petStats{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureModal() {
    let el = document.getElementById("mypetsModal");
    if (el) return el;

    el = document.createElement("div");
    el.id = "mypetsModal";
    el.innerHTML = `
      <div class="panel" role="dialog" aria-modal="true">
        <div class="head">
          <div class="t">My Pets</div>
          <button type="button" data-close aria-label="Close">X</button>
        </div>
        <div class="sub">Tap a pet to set it active. Spend pending points below when they appear.</div>
        <div class="list" id="mypetsList"></div>
      </div>
    `;

    el.addEventListener("click", (e) => {
      if (e.target === el) close();
      if (e.target?.closest?.("[data-close]")) close();
    });

    document.body.appendChild(el);
    return el;
  }

  function showBack() {
    try {
      const BB = _tg?.BackButton;
      if (!BB) return;
      _backHandler = () => close();
      BB.show();
      BB.onClick(_backHandler);
    } catch (_) {}
  }

  function hideBack() {
    try {
      const BB = _tg?.BackButton;
      if (!BB) return;
      if (_backHandler) {
        try { BB.offClick(_backHandler); } catch (_) {}
      }
      _backHandler = null;
      BB.hide();
    } catch (_) {}
  }

  function toast(msg) {
    try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
    try { _tg?.showPopup?.({ message: msg }); return; } catch (_) {}
    console.log(msg);
  }

  function runId(prefix = "mypets") {
    return `${prefix}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
  }

  async function loadState() {
    const list = document.getElementById("mypetsList");
    if (!list) return null;
    list.innerHTML = "Loading...";

    const res = await _apiPost("/webapp/pets/state", { run_id: runId("mypets_state") });
    log("raw res", res);

    if (!res || !res.ok) {
      list.innerHTML = `<div class="petErr">Failed to load pets.</div>`;
      return null;
    }
    return res.pets || null;
  }

  function toArray(state) {
    const dict = state?.pets || {};
    return Object.values(dict || {});
  }

  function hydrateAnimatedActivePet(list, items, activeId) {
    if (!list || !window.PetSprite?.hasSprite || !window.PetSprite?.replace) return;

    items.forEach((pet) => {
      const isActive = !!pet.is_active || pet.id === activeId;
      if (!isActive || !window.PetSprite.hasSprite(pet)) return;

      const row = qa(".petRow", list).find((el) => el.getAttribute("data-row") === String(pet.id || ""));
      const target = row?.querySelector?.(".petImg");
      if (!target) return;

      try {
        window.PetSprite.replace(target, pet, {
          state: "idle",
          className: "petImg petSprite",
          fallbackUrl: pet.icon || pet.img || "",
          alt: pet.name || "pet"
        });
      } catch (_) {}
    });
  }

  function disableListButtons(list, disabled) {
    if (!list) return;
    qa("[data-set], [data-stat-add]", list).forEach((btn) => {
      btn.disabled = !!disabled;
    });
  }

  function refreshExternalViews() {
    try { if (typeof window.loadProfile === "function") window.loadProfile(); } catch (_) {}
    try { if (typeof window.loadPlayerState === "function") window.loadPlayerState(); } catch (_) {}
    try { if (typeof window.renderMap === "function") window.renderMap(); } catch (_) {}
    try { if (typeof window.PetQuickActions?.refresh === "function") window.PetQuickActions.refresh(); } catch (_) {}
  }

  function render(state) {
    const list = document.getElementById("mypetsList");
    if (!list) return;

    const activeId = state?.activePetId || null;
    const items = toArray(state);

    items.sort((a, b) => {
      const aa = a.is_active === true ? 1 : 0;
      const bb = b.is_active === true ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return Number(b.level || 1) - Number(a.level || 1);
    });

    if (!items.length) {
      list.innerHTML = `<div class="petErr">No pets found.</div>`;
      return;
    }

    list.innerHTML = items.map((pet) => {
      const isActive = !!pet.is_active || pet.id === activeId;
      const img = pet.icon || pet.img || "";
      const pending = getPendingPoints(pet);
      const stats = getEffectiveStats(pet);
      const sub = `${pet.arena_label || pet.arena_type || "Pet"} | Lv ${pet.level || 1} | XP ${pet.xp || 0}/${pet.xp_needed || ((pet.level || 1) * 20)}`;
      const desc = pet.arena_desc ? ` - ${pet.arena_desc}` : "";
      const statsHtml = PET_STAT_ORDER.map(([key, label]) => `
        <div class="petStat">
          <div class="petStatText">
            <span class="petStatLabel">${label}</span>
            <span class="petStatValue">${Number(stats[key] || 0)}</span>
          </div>
          ${pending > 0 ? `<button class="petStatAdd" type="button" data-stat-add="${escapeHtml(pet.id)}" data-stat-key="${key}" aria-label="Add ${label}">+</button>` : ""}
        </div>
      `).join("");
      const badges = pending > 0
        ? `<div class="petBadges"><div class="petBadge">${escapeHtml(formatPendingLabel(pending))}</div></div>`
        : "";
      const hasSpriteMeta = !!(pet.spriteSheetUrl && pet.sprite);
      const debug = _dbg
        ? `<div class="petDebug">${escapeHtml(`petKey=${pet.pet_key || pet.type || ""} | petName=${pet.name || ""} | resolvedPetKey=${pet.resolvedPetKey || pet.pet_key || pet.type || ""} | hasSpriteMeta=${hasSpriteMeta} | spriteUrl=${pet.spriteSheetUrl ? "yes" : "no"} | PetSprite=${window.PetSprite ? "yes" : "no"}`)}</div>`
        : "";

      return `
        <div class="petRow ${isActive ? "active" : ""}" data-row="${escapeHtml(pet.id)}">
          ${img ? `<img class="petImg" src="${img}" alt="${escapeHtml(pet.name || "Pet")}" />` : `<div class="petImg"></div>`}
          <div class="petMeta">
            <div class="petName">${escapeHtml(pet.name || "Pet")}</div>
            <div class="petSub">${escapeHtml(sub + desc)}</div>
            ${badges}
            <div class="petStats">${statsHtml}</div>
            ${debug}
          </div>
          <button class="petBtn" type="button" data-set="${escapeHtml(pet.id)}" ${isActive ? "disabled" : ""}>
            ${isActive ? "Active" : "Set"}
          </button>
        </div>
      `;
    }).join("");

    qa(".petRow", list).forEach((row) => {
      row.addEventListener("click", (e) => {
        const control = e.target?.closest?.("[data-set], [data-stat-add]");
        if (control) return;
        const petId = row.getAttribute("data-row");
        if (!petId || row.classList.contains("active")) return;
        setActive(petId);
      });
    });

    qa("[data-set]", list).forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const petId = btn.getAttribute("data-set");
        if (petId) await setActive(petId);
      });
    });

    qa("[data-stat-add]", list).forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const petId = btn.getAttribute("data-stat-add");
        const statKey = btn.getAttribute("data-stat-key");
        if (petId && statKey) await spendStatPoint(petId, statKey);
      });
    });

    hydrateAnimatedActivePet(list, items, activeId);

    qa("img.petImg", list).forEach((img) => {
      img.addEventListener("error", () => { img.style.display = "none"; });
    });
  }

  async function setActive(petId) {
    if (!_apiPost) return;

    const list = document.getElementById("mypetsList");
    disableListButtons(list, true);

    const res = await _apiPost("/webapp/pets/set", { petId, run_id: runId("mypets_set") });
    if (!res || !res.ok) {
      toast("Failed to set active pet.");
      disableListButtons(list, false);
      return;
    }

    refreshExternalViews();
    toast("Active pet updated.");

    const state = res.pets || await loadState();
    if (state) render(state);
  }

  async function spendStatPoint(petId, statKey) {
    if (!_apiPost) return;

    const list = document.getElementById("mypetsList");
    disableListButtons(list, true);

    const res = await _apiPost("/webapp/pet/stat", {
      petId,
      statKey,
      run_id: runId("mypets_stat")
    });

    if (!res || !res.ok) {
      const reason = String(res?.reason || "").toUpperCase();
      if (reason === "NO_PENDING_POINTS") toast("No pending pet stat points.");
      else if (reason === "BAD_STAT") toast("Invalid pet stat.");
      else if (reason === "NO_PET") toast("Pet not found.");
      else toast("Failed to spend pet stat point.");
      disableListButtons(list, false);
      return;
    }

    refreshExternalViews();
    toast(`${String(statKey || "").toUpperCase()} +1`);

    const state = res.pets || await loadState();
    if (state) render(state);
  }

  async function open() {
    ensureStyles();
    ensureModal().style.display = "block";
    showBack();
    const state = await loadState();
    if (state) render(state);
  }

  function close() {
    const el = document.getElementById("mypetsModal");
    if (el) el.style.display = "none";
    hideBack();
  }

  function bindButton() {
    let btn = q(".btn.mypets") || q('[data-action="mypets"]');
    if (!btn) {
      btn = qa("button.btn").find((b) => (b.textContent || "").trim().toLowerCase() === "mypets");
    }
    if (!btn) return;

    try {
      btn.disabled = false;
      btn.classList.remove("disabled");
    } catch (_) {}
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
    log("MyPets button bound");
  }

  window.MyPets = {
    init({ apiPost, tg, dbg } = {}) {
      _apiPost = apiPost || _apiPost;
      _tg = tg || _tg;
      _dbg = !!dbg;
      if (_inited) {
        bindButton();
        return;
      }
      _inited = true;
      bindButton();
      log("inited");
    },
    open,
    close
  };
})();
