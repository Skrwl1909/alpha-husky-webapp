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

  function ensureStyles() {
    if (document.getElementById("mypets-style")) return;
    const s = document.createElement("style");
    s.id = "mypets-style";
    s.textContent = `
      #mypetsModal{position:fixed;inset:0;display:none;z-index:9999;background:rgba(0,0,0,.58)}
      #mypetsModal .panel{
        position:absolute;left:50%;bottom:14px;transform:translateX(-50%);
        width:min(520px,calc(100% - 24px));max-height:82vh;overflow:auto;
        border-radius:16px;background:#0b0f16;border:1px solid rgba(255,255,255,.10)
      }
      #mypetsModal .head{
        display:flex;align-items:center;justify-content:space-between;
        padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)
      }
      #mypetsModal .head .t{font-weight:800;letter-spacing:.2px}
      #mypetsModal .head button{background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer}
      #mypetsModal .sub{padding:0 14px 10px;opacity:.85;font-size:12px}
      #mypetsModal .list{padding:12px 14px;display:flex;flex-direction:column;gap:10px}
      .petRow{
        display:flex;gap:12px;align-items:center;
        padding:10px;border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.03)
      }
      .petRow.active{outline:2px solid rgba(137,255,254,.30)}
      .petImg{width:56px;height:56px;border-radius:12px;object-fit:cover;background:rgba(255,255,255,.06)}
      .petImg.petSprite{object-fit:contain}
      .petImg.petSprite canvas,
      .petImg.petSprite img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated;display:block}
      .petMeta{flex:1;min-width:0}
      .petName{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .petSub{opacity:.82;font-size:12px;margin-top:3px}
      .petBadges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
      .petBadge{
        display:inline-flex;align-items:center;gap:4px;
        padding:4px 8px;border-radius:999px;font-size:11px;
        background:rgba(137,255,254,.12);border:1px solid rgba(137,255,254,.18);color:#d8ffff
      }
      .petStats{
        display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
        gap:6px;margin-top:8px
      }
      .petStat{
        display:flex;align-items:center;justify-content:space-between;gap:6px;
        min-width:0;padding:6px 8px;border-radius:10px;
        background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.06)
      }
      .petStatText{display:flex;align-items:center;gap:6px;min-width:0}
      .petStatLabel{font-size:11px;opacity:.72}
      .petStatValue{font-size:12px;font-weight:800}
      .petStatAdd{
        width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;
        border-radius:999px;border:1px solid rgba(137,255,254,.25);
        background:rgba(137,255,254,.14);color:#fff;cursor:pointer;font-weight:800;flex:0 0 auto
      }
      .petStatAdd[disabled]{opacity:.45;cursor:default}
      .petDebug{opacity:.72;font-size:10px;line-height:1.35;margin-top:5px;word-break:break-word}
      .petBtn{
        padding:8px 10px;border-radius:12px;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(255,255,255,.06);color:#fff;cursor:pointer
      }
      .petBtn[disabled]{opacity:.6;cursor:default}
      .petErr{padding:14px;opacity:.85}
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
        ? `<div class="petBadges"><div class="petBadge">Pending Points: ${pending}</div></div>`
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
