// js/inventory.js — UNEQUIPPED ONLY (clean)
// Inventory modal shows ONLY items available in inventory (not equipped).
// Equipped management (UNEQ/UPGRADE) should live in Equipped panel.

window.Inventory = {
  items: [],
  activeEffects: [],
  equipped: {}, // unused here now (kept for compatibility)
  equippedBySlot: {},
  resources: { bones: 0, scrap: 0, rune_dust: 0 },
  currentTab: "all",
  _tgBackHandler: null,

  // ✅ nav-stack integration
  _navId: "inventory",
  _navRegistered: false,
  _backLock: false,

  // ---- small utils ----
  _mkRunId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  },

  _salvageYieldByRarity: {
    common: { scrap: 1, rune_dust: 0 },
    uncommon: { scrap: 2, rune_dust: 0 },
    rare: { scrap: 4, rune_dust: 1 },
    epic: { scrap: 8, rune_dust: 2 },
    legendary: { scrap: 16, rune_dust: 4 },
    mythic: { scrap: 24, rune_dust: 6 },
  },

  _salvageReasonText(reason, name = "item") {
    const r = String(reason || "").trim();
    const label = String(name || "item");
    const map = {
      locked_item: `${label} is locked and cannot be salvaged.`,
      equipped_item: `${label} is equipped and cannot be salvaged.`,
      slot_pet_blocked: `Pet slot items cannot be salvaged.`,
      slot_rune_blocked: `Rune items cannot be salvaged.`,
      slot_badge_blocked: `Badge items cannot be salvaged.`,
      moonstone_orb_blocked: `Moonstone Orb cannot be salvaged.`,
      type_consumable_blocked: `Consumables cannot be salvaged.`,
      type_box_blocked: `Boxes cannot be salvaged.`,
      type_material_blocked: `Materials cannot be salvaged.`,
      type_materials_blocked: `Materials cannot be salvaged.`,
      type_shard_blocked: `Shards cannot be salvaged.`,
      type_shards_blocked: `Shards cannot be salvaged.`,
      type_cosmetic_blocked: `Cosmetics cannot be salvaged.`,
      type_status_blocked: `Status items cannot be salvaged.`,
      type_support_blocked: `Support items cannot be salvaged.`,
      type_holder_blocked: `Holder items cannot be salvaged.`,
      type_founder_blocked: `Founder items cannot be salvaged.`,
      type_exclusive_blocked: `Exclusive items cannot be salvaged.`,
      category_consumable_blocked: `Consumables cannot be salvaged.`,
      category_box_blocked: `Boxes cannot be salvaged.`,
      category_material_blocked: `Materials cannot be salvaged.`,
      category_materials_blocked: `Materials cannot be salvaged.`,
      category_shard_blocked: `Shards cannot be salvaged.`,
      category_shards_blocked: `Shards cannot be salvaged.`,
      category_cosmetic_blocked: `Cosmetics cannot be salvaged.`,
      category_status_blocked: `Status items cannot be salvaged.`,
      category_support_blocked: `Support items cannot be salvaged.`,
      category_holder_blocked: `Holder items cannot be salvaged.`,
      category_founder_blocked: `Founder items cannot be salvaged.`,
      category_exclusive_blocked: `Exclusive items cannot be salvaged.`,
      exclusive_flag_blocked: `Exclusive items cannot be salvaged.`,
      founder_flag_blocked: `Founder items cannot be salvaged.`,
      holder_flag_blocked: `Holder items cannot be salvaged.`,
      supporter_flag_blocked: `Support items cannot be salvaged.`,
      support_flag_blocked: `Support items cannot be salvaged.`,
      not_salvageable_slot: `${label} cannot be salvaged.`,
      not_salvageable_type: `${label} cannot be salvaged.`,
      not_salvageable_rarity: `${label} cannot be salvaged.`,
      unknown_item: `${label} cannot be salvaged.`,
      malformed_item: `${label} cannot be salvaged.`,
      not_owned: `${label} is no longer in inventory.`,
      ledger_error: `Salvage failed. Please try again.`,
    };
    return map[r] || `${label} cannot be salvaged.`;
  },

  _toast(msg) {
    try {
      if (window.toast) return window.toast(msg);
      if (window.T?.toast) return window.T.toast(msg);
    } catch (_) {}
    try {
      Telegram?.WebApp?.showAlert?.(String(msg));
    } catch (_) {
      console.log("[toast]", msg);
    }
  },

  _perfAction(name, startedAt) {
    try { window.__ahPerf?.action?.(name, startedAt); } catch (_) {}
  },

  _esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  _safeText(value, fallback = "") {
    const text = String(value ?? "").trim();
    return text || String(fallback || "");
  },

  _toInt(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : Math.trunc(Number(fallback) || 0);
  },

  _qty(item) {
    return Math.max(
      1,
      this._toInt(
        item?.quantity ?? item?.amount ?? item?.stackQty ?? item?.qty ?? 1,
        1
      )
    );
  },

  _rarityMeta(rarity) {
    const key = String(rarity || "common").toLowerCase();
    return {
      common: { color: "#9aa0aa", glow: "rgba(154,160,170,.28)", label: "Common" },
      uncommon: { color: "#5fe3a1", glow: "rgba(95,227,161,.30)", label: "Uncommon" },
      rare: { color: "#64b5ff", glow: "rgba(100,181,255,.30)", label: "Rare" },
      epic: { color: "#b286ff", glow: "rgba(178,134,255,.30)", label: "Epic" },
      legendary: { color: "#ffd76a", glow: "rgba(255,215,106,.34)", label: "Legendary" },
      mythic: { color: "#ff79c8", glow: "rgba(255,121,200,.32)", label: "Mythic" },
    }[key] || { color: "#9aa0aa", glow: "rgba(154,160,170,.28)", label: this._safeText(rarity, "Common") };
  },

  _statLabel(key) {
    const norm = String(key || "").trim().toLowerCase();
    const map = {
      strength: "STR",
      str: "STR",
      defense: "DEF",
      def: "DEF",
      vitality: "VIT",
      vit: "VIT",
      agility: "AGI",
      agi: "AGI",
      intelligence: "INT",
      int: "INT",
      luck: "LCK",
      hp: "HP",
      dmg: "DMG",
      atk: "ATK",
      crit_chance: "CRIT",
      crit_dmg: "CRIT DMG",
      dodge: "DODGE",
      speed: "SPD",
    };
    return map[norm] || String(key || "").slice(0, 12).toUpperCase();
  },

  _normalizeStats(stats) {
    const src = (stats && typeof stats === "object") ? stats : {};
    const out = {};
    for (const [k, v] of Object.entries(src)) {
      const num = Number(v);
      if (!Number.isFinite(num)) continue;
      out[String(k)] = Math.trunc(num);
    }
    return out;
  },

  _orderedStatKeys(statsA, statsB = {}) {
    const pref = ["hp", "strength", "str", "defense", "def", "vitality", "vit", "agility", "agi", "intelligence", "int", "luck", "dmg", "atk", "crit_chance", "crit_dmg", "dodge", "speed"];
    const prefIdx = new Map(pref.map((k, i) => [k, i]));
    return Array.from(new Set([...Object.keys(statsA || {}), ...Object.keys(statsB || {})])).sort((a, b) => {
      const ia = prefIdx.has(String(a).toLowerCase()) ? prefIdx.get(String(a).toLowerCase()) : 999;
      const ib = prefIdx.has(String(b).toLowerCase()) ? prefIdx.get(String(b).toLowerCase()) : 999;
      if (ia !== ib) return ia - ib;
      return String(a).localeCompare(String(b));
    });
  },

  _fmtDelta(value) {
    const num = this._toInt(value, 0);
    if (num > 0) return `+${num}`;
    if (num < 0) return `${num}`;
    return "0";
  },

  _deltaTone(value) {
    const num = this._toInt(value, 0);
    if (num > 0) return { bg: "rgba(80, 220, 160, .14)", fg: "#7ef2bf", border: "rgba(80,220,160,.28)" };
    if (num < 0) return { bg: "rgba(255, 99, 132, .14)", fg: "#ff98ac", border: "rgba(255,99,132,.26)" };
    return { bg: "rgba(255,255,255,.06)", fg: "#c8cfdb", border: "rgba(255,255,255,.08)" };
  },

  _itemDescription(item) {
    return this._safeText(
      item?.description || item?.desc || item?.flavor || item?.usedFor,
      ""
    );
  },

  _excerpt(text, maxLen = 78) {
    const raw = this._safeText(text, "");
    if (!raw || raw.length <= maxLen) return raw;
    return `${raw.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
  },

  _useMeta(item) {
    return (item && typeof item.useMeta === "object" && item.useMeta) ? item.useMeta : {};
  },

  _activeEffectsFromResponse(res) {
    return Array.isArray(res?.activeEffects) ? res.activeEffects : [];
  },

  _effectPill(effect) {
    const label = this._safeText(effect?.name, "Effect");
    const desc = this._safeText(effect?.description, label);
    const uses = this._toInt(effect?.remainingUses, 0);
    const remain = this._toInt(effect?.remainingSec, 0);
    let tail = "";
    if (uses > 0) tail = `${uses} use${uses === 1 ? "" : "s"} left`;
    else if (remain > 0) tail = `${remain}s left`;

    return `
      <div style="padding:10px 12px;border-radius:16px;background:linear-gradient(180deg,rgba(20,32,48,.96),rgba(10,17,28,.94));border:1px solid rgba(126,198,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
          <div style="min-width:0;">
            <div style="font-size:12px;font-weight:900;color:#f2f8ff;letter-spacing:.03em;">${this._esc(label)}</div>
            <div style="margin-top:4px;font-size:11px;line-height:1.45;color:#bcd4ea;">${this._esc(desc)}</div>
          </div>
          ${tail ? `<div style="flex:0 0 auto;padding:5px 8px;border-radius:999px;background:rgba(126,198,255,.12);border:1px solid rgba(126,198,255,.18);font-size:10px;font-weight:800;color:#dff4ff;">${this._esc(tail)}</div>` : ""}
        </div>
      </div>
    `;
  },

  _renderActiveEffectsPanel() {
    const host = document.getElementById("inventoryEffectsPanel");
    if (!host) return;

    const effects = Array.isArray(this.activeEffects) ? this.activeEffects : [];
    if (!effects.length) {
      host.style.display = "none";
      host.innerHTML = "";
      return;
    }

    host.style.display = "block";
    host.innerHTML = `
      <div style="margin:0 0 16px 0;padding:14px;border-radius:20px;background:linear-gradient(180deg,rgba(18,28,44,.94),rgba(8,13,23,.92));border:1px solid rgba(126,198,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 16px 30px rgba(0,0,0,.18);">
        <div style="font-size:11px;letter-spacing:.7px;color:#8fb9dd;text-transform:uppercase;margin-bottom:10px;">Active Effects</div>
        <div style="display:grid;gap:8px;">${effects.map((effect) => this._effectPill(effect)).join("")}</div>
      </div>
    `;
  },

  _handleRedirectTarget(target, message) {
    const key = this._safeText(target, "").toLowerCase();
    if (key === "pet_passive") {
      try { window.MyPets?.open?.(); } catch (_) {}
      if (message) this._toast(message);
      return true;
    }
    return false;
  },

  // === Telegram BackButton fallback binder (ONLY if nav helpers not present) ===
  _bindTelegramBackButtonFallback() {
    try {
      const tg = Telegram?.WebApp;
      if (!tg) return;

      // cleanup previous
      if (this._tgBackHandler) {
        try { tg.BackButton?.offClick?.(this._tgBackHandler); } catch (_) {}
        try { tg.offEvent?.("backButtonClicked", this._tgBackHandler); } catch (_) {}
      }

      this._tgBackHandler = () => this.goBack("tg");

      // bind both ways (different Telegram builds behave differently)
      try { tg.BackButton?.onClick?.(this._tgBackHandler); } catch (_) {}
      try { tg.onEvent?.("backButtonClicked", this._tgBackHandler); } catch (_) {}

      try { tg.BackButton?.show?.(); } catch (_) {}
    } catch (e) {
      console.warn("BackButton bind failed (fallback):", e);
    }
  },

  _bindBackButtons() {
    // ✅ Prefer global nav stack router (AH_NAV)
    this._navRegistered = false;

    try {
      const stack = window.AH_NAV?.stack;
      const top = Array.isArray(stack) && stack.length ? stack[stack.length - 1] : null;
      const topId = (typeof top === "string") ? top : top?.id;

      const onClose = () => {
        try { window.Inventory?.goBack?.("nav"); } catch (_) {}
      };

      if (topId === this._navId) {
        this._navRegistered = true;
      } else if (typeof window.navOpen === "function") {
        // try common signatures
        try { window.navOpen(this._navId, onClose); this._navRegistered = true; }
        catch (_) {
          try { window.navOpen({ id: this._navId, onClose }); this._navRegistered = true; }
          catch (_) {
            try { window.navOpen({ id: this._navId, close: onClose }); this._navRegistered = true; }
            catch (_) {}
          }
        }
      }
    } catch (e) {
      console.warn("Inventory navOpen failed:", e);
    }

    // Fallback ONLY if nav helpers not present / failed
    if (!this._navRegistered) {
      this._bindTelegramBackButtonFallback();
    }
  },

  _hideTelegramBackButton() {
    try {
      const tg = Telegram?.WebApp;
      if (!tg?.BackButton) return;

      if (this._tgBackHandler && tg.BackButton.offClick) {
        try { tg.BackButton.offClick(this._tgBackHandler); } catch (_) {}
      }
      try { tg.offEvent?.("backButtonClicked", this._tgBackHandler); } catch (_) {}

      if (tg.BackButton.hide) tg.BackButton.hide();
    } catch (_) {}
  },

  // BACK should go to dashboard/map (not close webapp)
  goBack(source = "ui") {
    // prevent double-fire loops (navCloseTop -> onClose -> goBack(nav))
    if (this._backLock) return;
    this._backLock = true;
    setTimeout(() => (this._backLock = false), 500);

    try { Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

    const detailBack = document.getElementById("invItemBack");
    if (detailBack?.dataset?.open === "1") {
      this.closeItem();
      return;
    }

    const fromNav = (source === "nav"); // called by nav stack onClose
    const stack = window.AH_NAV?.stack;
    const top = Array.isArray(stack) && stack.length ? stack[stack.length - 1] : null;
    const topId = (typeof top === "string") ? top : top?.id;

    // Keep stack consistent, but NEVER block the real navigation.
    if (!fromNav) {
      try {
        if (topId === this._navId && typeof window.navCloseTop === "function") {
          try { window.navCloseTop(); } catch (_) {}
        } else if (typeof window.navClose === "function") {
          try { window.navClose(this._navId); } catch (_) {}
        }
      } catch (_) {}
    }

    // restore any hidden UI helpers (best-effort)
    try {
      document
        .querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach((el) => (el.style.display = ""));
    } catch (_) {}

    // Hide Telegram BackButton when leaving this view (safe)
    this._hideTelegramBackButton();

    // ✅ Deterministic home (your new navigation system)
    try {
      if (typeof window.goHome === "function") return window.goHome();
    } catch (e) {
      console.warn("Inventory.goBack: goHome failed:", e);
    }

    // Older fallbacks (keep)
    try {
      if (window.Dashboard?.open) return window.Dashboard.open();
      if (window.Map?.open) return window.Map.open();
      if (typeof window.openDashboard === "function") return window.openDashboard();
      if (typeof window.loadMap === "function") return window.loadMap();
      if (typeof window.loadProfile === "function") return window.loadProfile();
    } catch (e) {
      console.warn("Inventory.goBack: dashboard opener failed:", e);
    }

    // final fallback: reload without nav params
    try {
      const url = new URL(window.location.href);
      ["section", "view", "modal", "page", "tab", "panel"].forEach((p) => url.searchParams.delete(p));
      url.hash = "";
      window.location.href = url.toString();
    } catch (_) {
      try { location.reload(); } catch (_) {}
    }
  },

  async open() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    try {
      document
        .querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach((el) => (el.style.display = "none"));
    } catch (_) {}

    const container = document.getElementById("app") || document.body;

    container.innerHTML = `
  <div class="inv-root" style="
    padding:20px;
    padding-top:calc(20px + var(--tg-safe-area-inset-top, 0px));
    color:#fff;
    max-width:760px;
    margin:0 auto;
    font-family:'Segoe UI',system-ui,sans-serif;
    position:relative;
  ">

    <!-- Sticky header BELOW safe-area (clickable) -->
    <div style="
      position:sticky;
      top:calc(var(--tg-safe-area-inset-top, 0px));
      z-index:9999;
      background:rgba(0,0,0,0.55);
      backdrop-filter: blur(6px);
      border-radius:16px;
      padding:10px 12px;
      margin-bottom:12px;
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <!-- ✅ Inline onclick (most robust) -->
        <button id="invBackBtn" type="button" onclick="Inventory.goBack('ui')"
                style="
                  display:flex;align-items:center;gap:10px;
                  padding:10px 14px;border-radius:14px;
                  background:rgba(255,255,255,0.10);
                  color:#fff;border:none;font-size:14px;
                  cursor:pointer;
                  pointer-events:auto;
                  position:relative;
                  z-index:10000;
                ">
          <span style="font-size:18px;line-height:1;">←</span>
          <span>Back</span>
        </button>

        <div style="font-weight:900;letter-spacing:0.6px;">Inventory</div>
        <div style="width:92px;"></div>
      </div>
    </div>

    <div id="stats-bar" style="
      text-align:center;margin:10px 0 16px 0;font-size:14px;line-height:1.5;
      color:#cfd7e8;padding:12px 14px;border-radius:18px;
      background:linear-gradient(180deg,rgba(19,24,38,.92),rgba(10,13,24,.9));
      border:1px solid rgba(255,255,255,.08);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 16px 32px rgba(0,0,0,.18);
    ">
      loading...
    </div>

    <div id="inventoryEffectsPanel" style="display:none;"></div>

    <!-- Tabs -->
    <div style="display:flex;justify-content:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <button onclick="Inventory.showTab('all')" class="tab-btn active" data-type="all" type="button">All</button>
      <button onclick="Inventory.showTab('gear')" class="tab-btn" data-type="gear" type="button">Gear</button>
      <button onclick="Inventory.showTab('consumable')" class="tab-btn" data-type="consumable" type="button">Consumables</button>
      <button onclick="Inventory.showTab('utility')" class="tab-btn" data-type="utility" type="button">Utility</button>
    </div>

    <div id="inventory-grid" style="
      max-height:64vh;overflow-y:auto;display:grid;
      grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
      gap:14px;padding:14px;
      background:linear-gradient(180deg,rgba(10,13,24,.92),rgba(5,8,16,.88));
      border:1px solid rgba(255,255,255,.08);
      border-radius:24px;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 24px 48px rgba(0,0,0,.22);
    ">
      <div style="grid-column:1/-1;text-align:center;padding:80px;opacity:0.7;color:#aaa;">loading items...</div>
    </div>

    <div id="invItemBack" onclick="if(event.target===this) Inventory.closeItem()" style="
      display:none;position:fixed;inset:0;z-index:12000;
      background:rgba(4,8,15,.84);backdrop-filter:blur(10px);
      align-items:flex-end;justify-content:center;padding:18px;
    ">
      <div style="
        width:min(680px,100%);max-height:82vh;overflow:auto;
        background:linear-gradient(180deg,rgba(20,25,42,.98),rgba(9,12,22,.985));
        border:1px solid rgba(255,255,255,.12);border-radius:28px 28px 22px 22px;
        box-shadow:0 26px 70px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.05);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 18px 12px 18px;border-bottom:1px solid rgba(255,255,255,.07);">
          <div>
            <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;">Item</div>
            <div style="font-size:20px;font-weight:900;color:#f6fbff;">Item Details</div>
          </div>
          <button onclick="Inventory.closeItem()" type="button" style="
            width:42px;height:42px;border-radius:14px;border:none;
            background:rgba(255,255,255,.08);color:#fff;font-size:20px;cursor:pointer;
          ">×</button>
        </div>
        <div id="invItemBody" style="padding:18px;"></div>
      </div>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <button onclick="Telegram.WebApp.close()" type="button"
              style="padding:14px 40px;border-radius:20px;background:#333;color:#fff;font-size:16px;border:none;cursor:pointer;">
        Close WebApp
      </button>
    </div>
  </div>
`;
    // register in nav stack + (optional) TG back fallback
    this._bindBackButtons();

    try {
      const apiPost = window.S?.apiPost || window.apiPost;
      const res = await apiPost("/webapp/inventory/state", {});
      if (!res?.ok) throw new Error(res?.reason || "No response");

      // slots = UNEQUIPPED ONLY
      this.items = res.slots || [];
      this.activeEffects = this._activeEffectsFromResponse(res);
      this.equipped = {}; // no equipped fallback in this view
      this.equippedBySlot = (res.equippedBySlot && typeof res.equippedBySlot === "object") ? res.equippedBySlot : {};

      this.resources = {
        bones: parseInt(res.bones || 0, 10) || 0,
        scrap: parseInt(res.scrap || 0, 10) || 0,
        rune_dust: parseInt(res.rune_dust || 0, 10) || 0,
      };

      const bar = document.getElementById("stats-bar");
      if (bar) {
        bar.innerHTML = `
          Bones: <b style="color:#ff8;">${this.resources.bones.toLocaleString()}</b> •
          Scrap: <b style="color:#8af;">${this.resources.scrap.toLocaleString()}</b> •
          Rune Dust: <b style="color:#f8f;">${this.resources.rune_dust.toLocaleString()}</b>
        `;
      }

      this._renderActiveEffectsPanel();
      try { window.renderBuffs?.(res); } catch (_) {}

      if (!["all", "gear", "consumable", "utility"].includes(this.currentTab)) {
        this.currentTab = "all";
      }

      this.showTab(this.currentTab);
    } catch (err) {
      console.error("Inventory open error:", err);
      const grid = document.getElementById("inventory-grid");
      if (grid) {
        grid.innerHTML =
          `<p style="grid-column:1/-1;color:#f66;text-align:center;">Connection error</p>`;
      }
    } finally {
      this._perfAction("inventory_open", perfT0);
    }
  },

  // ---- helpers (robust type/slot detection) ----
  _gearSlots: new Set(["weapon","armor","cloak","collar","helmet","ring","offhand","gloves","fangs"]),
  _normType(it) { return String(it?.type || "").toLowerCase(); },
  _normSlot(it) { return String(it?.slot || it?.equippedSlot || "").toLowerCase(); },
  _isConsumable(it) { return this._normType(it) === "consumable"; },
  _isGear(it) {
    const s = this._normSlot(it);
    if (this._gearSlots.has(s)) return true;
    const t = this._normType(it);
    if (this._gearSlots.has(t)) return true;
    if (t === "gear" && s) return true;
    return false;
  },

  _salvagePreview(item) {
    const rarity = String(item?.rarity || "common").toLowerCase();
    const slot = this._normSlot(item);
    const type = this._normType(item);
    const category = String(item?.category || "").toLowerCase();
    const key = String(item?.key || item?.item_key || item?.item || "").trim().toLowerCase();
    const name = String(item?.name || key || "item").trim();

    if (!key || !name) return { ok: false, reason: "unknown_item", scrap: 0, runeDust: 0 };
    if (key === "moonstone_orb" || name.toLowerCase() === "moonstone orb") return { ok: false, reason: "moonstone_orb_blocked", scrap: 0, runeDust: 0 };
    if (item?.locked) return { ok: false, reason: "locked_item", scrap: 0, runeDust: 0 };
    if (slot === "pet") return { ok: false, reason: "slot_pet_blocked", scrap: 0, runeDust: 0 };
    if (slot === "rune") return { ok: false, reason: "slot_rune_blocked", scrap: 0, runeDust: 0 };
    if (slot === "badge") return { ok: false, reason: "slot_badge_blocked", scrap: 0, runeDust: 0 };
    if (!this._gearSlots.has(slot)) return { ok: false, reason: "not_salvageable_slot", scrap: 0, runeDust: 0 };

    const blocked = new Set(["consumable", "box", "material", "materials", "shard", "shards", "cosmetic", "status", "support", "holder", "founder", "exclusive", "pet", "rune", "badge", "token"]);
    if (blocked.has(type)) return { ok: false, reason: `type_${type}_blocked`, scrap: 0, runeDust: 0 };
    if (blocked.has(category)) return { ok: false, reason: `category_${category}_blocked`, scrap: 0, runeDust: 0 };
    if (item?.exclusive || item?.founder || item?.holder || item?.support || item?.supporter) {
      if (item?.founder) return { ok: false, reason: "founder_flag_blocked", scrap: 0, runeDust: 0 };
      if (item?.holder) return { ok: false, reason: "holder_flag_blocked", scrap: 0, runeDust: 0 };
      if (item?.support || item?.supporter) return { ok: false, reason: "support_flag_blocked", scrap: 0, runeDust: 0 };
      return { ok: false, reason: "exclusive_flag_blocked", scrap: 0, runeDust: 0 };
    }

    const yieldRow = this._salvageYieldByRarity[rarity];
    if (!yieldRow) return { ok: false, reason: "not_salvageable_rarity", scrap: 0, runeDust: 0 };
    return {
      ok: true,
      reason: "ok",
      scrap: Number(yieldRow.scrap || 0),
      runeDust: Number(yieldRow.rune_dust || 0),
    };
  },

  _slotLabel(item) {
    return this._safeText(item?.slotLabel || item?.slot, "");
  },

  _compareState(item) {
    const slot = this._normSlot(item);
    const equipped = slot ? (this.equippedBySlot?.[slot] || item?.compareTarget || null) : null;
    const selectedStats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
    const equippedStats = this._normalizeStats(equipped?.stats || equipped?.data?.stat_bonus || {});
    const keys = this._orderedStatKeys(selectedStats, equippedStats);
    const rows = keys.map((key) => ({
      key,
      label: this._statLabel(key),
      selected: this._toInt(selectedStats[key], 0),
      equipped: this._toInt(equippedStats[key], 0),
      delta: this._toInt(selectedStats[key], 0) - this._toInt(equippedStats[key], 0),
    }));
    return { slot, equipped, rows };
  },

  _consumableStatusTone(state) {
    const key = this._safeText(state, "").toLowerCase();
    if (key === "live") return { bg: "rgba(84,210,148,.14)", fg: "#cffff0", border: "rgba(84,210,148,.24)", label: "Live" };
    if (key === "redirect") return { bg: "rgba(120,188,255,.14)", fg: "#d9ecff", border: "rgba(120,188,255,.24)", label: "Redirect" };
    if (key === "passive") return { bg: "rgba(255,215,106,.12)", fg: "#ffe5a4", border: "rgba(255,215,106,.22)", label: "Passive" };
    if (key === "blocked") return { bg: "rgba(255,120,120,.13)", fg: "#ffd2d2", border: "rgba(255,120,120,.26)", label: "Blocked" };
    return { bg: "rgba(255,255,255,.07)", fg: "#d4deec", border: "rgba(255,255,255,.10)", label: "Unknown" };
  },

  _renderConsumableAudit(item) {
    if (!this._isConsumable(item)) return "";
    const meta = this._useMeta(item);
    const state = this._safeText(meta.state, "unknown");
    const tone = this._consumableStatusTone(state);
    const message = this._safeText(meta.message, item?.usedFor || item?.description || "");
    const activeLine = meta.active && meta.activeDescription
      ? `<div style="margin-top:8px;font-size:12px;line-height:1.55;color:#dff4ff;">${this._esc(meta.activeDescription)}</div>`
      : "";

    return `
      <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;">
          <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;">Consumable</div>
          <div style="padding:6px 10px;border-radius:999px;background:${tone.bg};border:1px solid ${tone.border};font-size:11px;font-weight:900;color:${tone.fg};letter-spacing:.4px;text-transform:uppercase;">${this._esc(tone.label)}</div>
        </div>
        <div style="margin-top:10px;font-size:13px;line-height:1.6;color:#d7e6f7;">${this._esc(message || "No consumable metadata available.")}</div>
        ${activeLine}
      </section>
    `;
  },

  _detailActions(item) {
    const key = this._safeText(item?.key || item?.item_key || item?.item, "");
    const salvage = this._salvagePreview(item);
    const actions = [];
    if (this._isConsumable(item)) {
      const meta = this._useMeta(item);
      const state = this._safeText(meta.state, "unknown").toLowerCase();
      if (state === "live") {
        actions.push(`
          <button onclick="event.stopPropagation(); Inventory.use('${this._esc(key)}')" type="button"
                  style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#5fe3a1,#1b9e67);color:#08110d;font-weight:900;letter-spacing:.4px;cursor:pointer;">
            USE
          </button>
        `);
      } else if (state === "redirect") {
        actions.push(`
          <button onclick="event.stopPropagation(); Inventory.use('${this._esc(key)}')" type="button"
                  style="flex:1 1 180px;padding:12px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#7fc3ff,#407de0);color:#08111b;font-weight:900;letter-spacing:.4px;cursor:pointer;">
            ${this._esc(this._safeText(meta.redirectLabel, "OPEN SCREEN"))}
          </button>
        `);
      } else {
        const label = state === "passive" ? "PASSIVE" : "BLOCKED";
        actions.push(`
          <button type="button" disabled
                  style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.06);color:#a9b6c8;font-weight:900;letter-spacing:.4px;cursor:default;">
            ${label}
          </button>
        `);
      }
    }
    if (this._isGear(item)) {
      actions.push(`
        <button onclick="event.stopPropagation(); Inventory.equip('${this._esc(key)}')" type="button"
                style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#6caeff,#2d65ff);color:#f5f9ff;font-weight:900;letter-spacing:.4px;cursor:pointer;">
          EQUIP
        </button>
      `);
    }
    if (salvage.ok) {
      actions.push(`
        <button onclick="event.stopPropagation(); Inventory.removeItem('${this._esc(key)}','one')" type="button"
                style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,120,120,.22);background:rgba(98,21,31,.85);color:#ffd7dc;font-weight:800;letter-spacing:.3px;cursor:pointer;">
          SALVAGE
        </button>
      `);
    }
    return actions.join("");
  },

  openItem(key) {
    const item = this.findByKey(key);
    if (!item) return;
    try { Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
    const back = document.getElementById("invItemBack");
    const body = document.getElementById("invItemBody");
    if (!back || !body) return;

    const rarity = this._rarityMeta(item?.rarity);
    const qty = this._qty(item);
    const typeLabel = this._safeText(item?.type || item?.category, "Misc");
    const slotLabel = this._slotLabel(item);
    const description = this._itemDescription(item);
    const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
    const statKeys = this._orderedStatKeys(stats);
    const compare = this._compareState(item);
    const eq = compare.equipped;
    const salvage = this._salvagePreview(item);

    const statCards = statKeys.length
      ? statKeys.map((key) => `
          <div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);min-width:84px;">
            <div style="font-size:11px;letter-spacing:.5px;color:#91a0bb;">${this._esc(this._statLabel(key))}</div>
            <div style="font-size:18px;font-weight:900;color:#f5fbff;">+${this._esc(String(this._toInt(stats[key], 0)))}</div>
          </div>
        `).join("")
      : `<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.05);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

    let compareBlock = "";
    if (this._isGear(item)) {
      const compareRows = compare.rows.length
        ? compare.rows.map((row) => {
            const tone = this._deltaTone(row.delta);
            return `
              <div style="display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:center;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);">
                <div style="font-size:12px;letter-spacing:.45px;color:#91a0bb;">${this._esc(row.label)}</div>
                <div style="font-size:13px;color:#dbe7ff;">${this._esc(`+${row.selected}`)}${eq ? ` vs ${row.equipped >= 0 ? "+" : ""}${row.equipped}` : ""}</div>
                <div style="padding:6px 10px;border-radius:999px;background:${tone.bg};border:1px solid ${tone.border};color:${tone.fg};font-size:12px;font-weight:900;letter-spacing:.35px;">
                  ${this._esc(this._fmtDelta(row.delta))}
                </div>
              </div>
            `;
          }).join("")
        : `<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

      compareBlock = `
        <section style="margin-top:18px;padding:16px;border-radius:20px;background:rgba(8,12,24,.88);border:1px solid rgba(255,255,255,.08);">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px;">
            <div>
              <div style="font-size:11px;letter-spacing:.65px;color:#7d8aa3;text-transform:uppercase;">Equipment Compare</div>
              <div style="font-size:16px;font-weight:900;color:#f4f8ff;">${eq ? this._esc(eq.name || eq.key || "Equipped item") : "No item equipped in this slot."}</div>
            </div>
            ${slotLabel ? `<div style="padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.06);font-size:11px;color:#d5dded;letter-spacing:.4px;">${this._esc(slotLabel)}</div>` : ""}
          </div>
          ${compareRows}
        </section>
      `;
    }

    body.innerHTML = this._renderDetailSheet(item);
    back.style.display = "flex";
    back.dataset.open = "1";
    try { window.navOpen?.("invItemBack"); } catch (_) {}
    return;

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:96px 1fr;gap:16px;align-items:start;">
        <img src="${this._esc(item?.icon || item?.image || item?.image_path || "/assets/items/unknown.png")}"
             alt=""
             style="width:96px;height:96px;border-radius:22px;border:2px solid ${rarity.color};box-shadow:0 0 0 4px ${rarity.glow};background:rgba(255,255,255,.04);object-fit:cover;"
             onerror="this.onerror=null;this.src='/assets/items/unknown.png';">
        <div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <span style="padding:6px 10px;border-radius:999px;background:${rarity.glow};color:${rarity.color};font-size:11px;letter-spacing:.5px;font-weight:900;text-transform:uppercase;">${this._esc(rarity.label)}</span>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#d6dceb;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">${this._esc(typeLabel)}</span>
            ${slotLabel ? `<span style="padding:6px 10px;border-radius:999px;background:rgba(76,95,165,.22);color:#b4c6ff;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">${this._esc(slotLabel)}</span>` : ""}
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#f8fbff;font-size:11px;letter-spacing:.5px;">QTY ${this._esc(String(qty))}</span>
          </div>
          <div style="font-size:22px;line-height:1.1;font-weight:900;color:#f6fbff;">${this._esc(item?.name || item?.key || "Unknown Item")}</div>
          <div style="margin-top:10px;font-size:13px;line-height:1.55;color:#b8c3d6;">
            ${this._esc(description || "No description available.")}
          </div>
          ${item?.usedFor ? `<div style="margin-top:8px;font-size:12px;color:#8ad1ff;">Use: ${this._esc(item.usedFor)}</div>` : ""}
        </div>
      </div>

      <section style="margin-top:18px;padding:16px;border-radius:20px;background:rgba(8,12,24,.88);border:1px solid rgba(255,255,255,.08);">
        <div style="font-size:11px;letter-spacing:.65px;color:#7d8aa3;text-transform:uppercase;margin-bottom:12px;">Item Stats</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">${statCards}</div>
      </section>

      ${compareBlock}

      <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;margin-bottom:12px;">Salvage Yield</div>
        ${salvage.ok ? `
          <div style="font-size:13px;line-height:1.6;color:#d8e4f8;">
            Salvage yield: <b>+${this._esc(String(salvage.scrap))} scrap</b>, <b>+${this._esc(String(salvage.runeDust))} rune dust</b>.
          </div>
        ` : `
          <div style="font-size:13px;line-height:1.6;color:#b8c3d6;">
            ${this._esc(this._salvageReasonText(salvage.reason, item?.name || item?.key || "This item"))}
          </div>
        `}
      </section>

      <section style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;">
        ${this._detailActions(item)}
      </section>
    `;

    back.style.display = "flex";
    back.dataset.open = "1";
    try { window.navOpen?.("invItemBack"); } catch (_) {}
  },

  closeItem() {
    const back = document.getElementById("invItemBack");
    if (!back) return;
    back.style.display = "none";
    delete back.dataset.open;
    try { window.navClose?.("invItemBack"); } catch (_) {}
  },

  _renderCards(filtered) {
    return (filtered || []).map((item) => {
      const key = item.key || item.item_key || item.item;
      const amountNum = this._qty(item);
      const level = Math.max(1, this._toInt(item?.level ?? item?.data?.level, 1));
      const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
      const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
      const name = this._safeText(item.name, key || "Unknown Item");
      const rarityMeta = this._rarityMeta(item?.rarity || "common");
      const typeLabel = this._safeText(item?.type || item?.category, "Misc");
      const slotLabel = this._slotLabel(item);
      const description = this._itemDescription(item);
      const isGear = this._isGear(item);
      const statChips = this._orderedStatKeys(stats)
        .slice(0, 3)
        .map((statKey) => `
          <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;color:#dce7f9;">
            ${this._esc(this._statLabel(statKey))} +${this._esc(String(this._toInt(stats[statKey], 0)))}
          </span>
        `)
        .join("");

      const keyEsc = String(key || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

      return `
        <button type="button"
             onclick="Inventory.openItem('${keyEsc}')"
             style="background:linear-gradient(180deg,rgba(23,29,47,.94),rgba(9,12,22,.94));border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:14px;text-align:left;position:relative;transition:0.22s;cursor:pointer;color:#fff;box-shadow:0 12px 26px rgba(0,0,0,.18);">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:12px;">
            <span style="padding:5px 9px;border-radius:999px;background:${rarityMeta.glow};color:${rarityMeta.color};font-size:10px;font-weight:900;letter-spacing:.55px;text-transform:uppercase;">
              ${this._esc(rarityMeta.label)}
            </span>
            <span style="padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.07);color:#f7fbff;font-size:10px;font-weight:800;letter-spacing:.45px;">
              ×${this._esc(String(amountNum))}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:86px 1fr;gap:12px;align-items:start;">
            <img src="${this._esc(icon)}" width="86" height="86"
               style="border:2px solid ${rarityMeta.color};box-shadow:0 0 0 4px ${rarityMeta.glow};border-radius:18px;background:rgba(255,255,255,.04);object-fit:cover;"
               onerror="this.onerror=null;this.src='/assets/items/unknown.png';">

            <div>
              <div style="font-size:15px;font-weight:900;color:#f7fbff;line-height:1.25;min-height:38px;">
                ${this._esc(name)}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);font-size:10px;letter-spacing:.45px;color:#d2dbea;text-transform:uppercase;">
                  ${this._esc(typeLabel)}
                </span>
                ${slotLabel ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(91,121,255,.16);font-size:10px;letter-spacing:.45px;color:#b8c8ff;text-transform:uppercase;">${this._esc(slotLabel)}</span>` : ""}
                ${isGear ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(255,215,106,.13);font-size:10px;letter-spacing:.45px;color:#ffd76a;">★ ${this._esc(String(level))}</span>` : ""}
              </div>
              ${statChips ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${statChips}</div>` : ""}
              <div style="margin-top:10px;font-size:11px;line-height:1.45;color:${description ? "#99a8bf" : "#7f8a9c"};">
                ${this._esc(description || (isGear ? "Equipment item." : "Misc item."))}
              </div>
            </div>
          </div>

          <div style="margin-top:12px;font-size:11px;letter-spacing:.55px;color:#7d8aa3;text-transform:uppercase;">
            Tap for details${isGear ? " and compare" : ""}
          </div>
        </button>
      `;
    }).join("");
  },

  _renderCardsPremium(filtered) {
    return (filtered || []).map((item) => {
      const key = item.key || item.item_key || item.item;
      const amountNum = this._qty(item);
      const level = Math.max(1, this._toInt(item?.level ?? item?.data?.level, 1));
      const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
      const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
      const name = this._safeText(item.name, key || "Unknown Item");
      const rarityMeta = this._rarityMeta(item?.rarity || "common");
      const typeLabel = this._safeText(item?.type || item?.category, "Misc");
      const slotLabel = this._slotLabel(item);
      const description = this._excerpt(this._itemDescription(item), 72);
      const isGear = this._isGear(item);
      const statChips = this._orderedStatKeys(stats)
        .slice(0, 4)
        .map((statKey) => `
          <span style="padding:5px 8px;border-radius:999px;background:rgba(154,179,255,.11);border:1px solid rgba(154,179,255,.16);font-size:11px;color:#edf3ff;font-weight:700;line-height:1;">
            ${this._esc(this._statLabel(statKey))} +${this._esc(String(this._toInt(stats[statKey], 0)))}
          </span>
        `)
        .join("");

      const keyEsc = String(key || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

      return `
        <button type="button"
             onclick="Inventory.openItem('${keyEsc}')"
             style="background:
               radial-gradient(circle at top right, rgba(91,121,255,.10), transparent 34%),
               linear-gradient(180deg,rgba(23,29,47,.96),rgba(8,11,20,.97));
               border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:14px 15px;text-align:left;position:relative;transition:0.22s;cursor:pointer;color:#fff;box-shadow:0 16px 28px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.05);">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:12px;">
            <span style="padding:5px 9px;border-radius:999px;background:${rarityMeta.glow};color:${rarityMeta.color};font-size:10px;font-weight:900;letter-spacing:.55px;text-transform:uppercase;border:1px solid rgba(255,255,255,.06);">
              ${this._esc(rarityMeta.label)}
            </span>
            <span style="padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.07);color:#f7fbff;font-size:10px;font-weight:800;letter-spacing:.45px;border:1px solid rgba(255,255,255,.05);">
              ×${this._esc(String(amountNum))}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:92px minmax(0,1fr);gap:14px;align-items:start;">
            <img src="${this._esc(icon)}" width="92" height="92"
               style="border:2px solid ${rarityMeta.color};box-shadow:0 0 0 4px ${rarityMeta.glow};border-radius:20px;background:rgba(255,255,255,.04);object-fit:cover;flex-shrink:0;"
               onerror="this.onerror=null;this.src='/assets/items/unknown.png';">

            <div style="min-width:0;">
              <div style="font-size:16px;font-weight:900;color:#f7fbff;line-height:1.22;min-height:40px;word-break:break-word;">
                ${this._esc(name)}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);font-size:10px;letter-spacing:.45px;color:#d2dbea;text-transform:uppercase;border:1px solid rgba(255,255,255,.05);">
                  ${this._esc(typeLabel)}
                </span>
                ${slotLabel ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(91,121,255,.18);font-size:10px;letter-spacing:.45px;color:#c6d4ff;text-transform:uppercase;border:1px solid rgba(91,121,255,.22);">${this._esc(slotLabel)}</span>` : ""}
                ${isGear ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(255,215,106,.13);font-size:10px;letter-spacing:.45px;color:#ffd76a;border:1px solid rgba(255,215,106,.18);">EQUIP · ★ ${this._esc(String(level))}</span>` : ""}
              </div>
              ${statChips ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${statChips}</div>` : ""}
              <div style="margin-top:10px;font-size:11px;line-height:1.45;color:${description ? "#99a8bf" : "#7f8a9c"};min-height:31px;">
                ${this._esc(description || (isGear ? "Equipment item." : "Misc item."))}
              </div>
            </div>
          </div>

          <div style="margin-top:12px;font-size:10px;letter-spacing:.6px;color:#7d8aa3;text-transform:uppercase;opacity:.92;">
            Tap to inspect${isGear ? " · compare equipped" : ""}
          </div>
        </button>
      `;
    }).join("");
  },

  _renderDetailSheet(item) {
    const rarity = this._rarityMeta(item?.rarity);
    const qty = this._qty(item);
    const typeLabel = this._safeText(item?.type || item?.category, "Misc");
    const slotLabel = this._slotLabel(item);
    const description = this._itemDescription(item);
    const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
    const statKeys = this._orderedStatKeys(stats);
    const compare = this._compareState(item);
    const eq = compare.equipped;

    const statCards = statKeys.length
      ? statKeys.map((key) => `
          <div style="padding:12px 12px;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.08);min-width:90px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
            <div style="font-size:11px;letter-spacing:.55px;color:#91a0bb;">${this._esc(this._statLabel(key))}</div>
            <div style="margin-top:4px;font-size:19px;font-weight:900;color:#f5fbff;">+${this._esc(String(this._toInt(stats[key], 0)))}</div>
          </div>
        `).join("")
      : `<div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.05);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

    let compareBlock = "";
    if (this._isGear(item)) {
      const compareRows = compare.rows.length
        ? compare.rows.map((row) => {
            const tone = this._deltaTone(row.delta);
            return `
              <div style="display:grid;grid-template-columns:minmax(54px,72px) minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 12px;border-radius:15px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.07);">
                <div style="font-size:12px;letter-spacing:.45px;color:#91a0bb;">${this._esc(row.label)}</div>
                <div style="font-size:13px;color:#dbe7ff;line-height:1.35;min-width:0;">
                  <span style="font-weight:800;color:#f4f8ff;">${this._esc(`+${row.selected}`)}</span>
                  ${eq ? `<span style="color:#90a1be;"> vs ${this._esc(`${row.equipped >= 0 ? "+" : ""}${row.equipped}`)}</span>` : ""}
                </div>
                <div style="padding:6px 10px;border-radius:999px;background:${tone.bg};border:1px solid ${tone.border};color:${tone.fg};font-size:12px;font-weight:900;letter-spacing:.35px;">
                  ${this._esc(this._fmtDelta(row.delta))}
                </div>
              </div>
            `;
          }).join("")
        : `<div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

      compareBlock = `
        <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;">
            <div style="min-width:0;">
              <div style="font-size:11px;letter-spacing:.65px;color:#7d8aa3;text-transform:uppercase;">Equipment Compare</div>
              <div style="font-size:16px;font-weight:900;color:#f4f8ff;line-height:1.25;">${eq ? this._esc(eq.name || eq.key || "Equipped item") : "No item equipped in this slot."}</div>
            </div>
            ${slotLabel ? `<div style="padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.06);font-size:11px;color:#d5dded;letter-spacing:.4px;border:1px solid rgba(255,255,255,.05);">${this._esc(slotLabel)}</div>` : ""}
          </div>
          <div style="display:grid;gap:8px;">${compareRows}</div>
        </section>
      `;
    }

    return `
      <div style="display:grid;grid-template-columns:108px minmax(0,1fr);gap:16px;align-items:start;">
        <img src="${this._esc(item?.icon || item?.image || item?.image_path || "/assets/items/unknown.png")}"
             alt=""
             style="width:108px;height:108px;border-radius:24px;border:2px solid ${rarity.color};box-shadow:0 0 0 4px ${rarity.glow}, 0 12px 28px rgba(0,0,0,.25);background:rgba(255,255,255,.04);object-fit:cover;"
             onerror="this.onerror=null;this.src='/assets/items/unknown.png';">
        <div style="min-width:0;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <span style="padding:6px 10px;border-radius:999px;background:${rarity.glow};color:${rarity.color};font-size:11px;letter-spacing:.5px;font-weight:900;text-transform:uppercase;border:1px solid rgba(255,255,255,.06);">${this._esc(rarity.label)}</span>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#d6dceb;font-size:11px;letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,.05);">${this._esc(typeLabel)}</span>
            ${slotLabel ? `<span style="padding:6px 10px;border-radius:999px;background:rgba(76,95,165,.22);color:#b4c6ff;font-size:11px;letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(76,95,165,.22);">${this._esc(slotLabel)}</span>` : ""}
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#f8fbff;font-size:11px;letter-spacing:.5px;border:1px solid rgba(255,255,255,.05);">QTY ${this._esc(String(qty))}</span>
          </div>
          <div style="font-size:24px;line-height:1.08;font-weight:900;color:#f6fbff;word-break:break-word;">${this._esc(item?.name || item?.key || "Unknown Item")}</div>
          <div style="margin-top:12px;max-width:44ch;font-size:13px;line-height:1.62;color:#b8c3d6;">
            ${this._esc(description || "No description available.")}
          </div>
          ${item?.usedFor ? `<div style="margin-top:8px;font-size:12px;color:#8ad1ff;">Use: ${this._esc(item.usedFor)}</div>` : ""}
        </div>
      </div>

      <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;margin-bottom:12px;">Item Stats</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">${statCards}</div>
      </section>

      ${this._renderConsumableAudit(item)}

      ${compareBlock}

      <section style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;">
        ${this._detailActions(item)}
      </section>
    `;
  },

  showTab(type) {
    this.currentTab = type;

    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    const btn = document.querySelector(`[data-type="${type}"]`);
    if (btn) btn.classList.add("active");

    let filtered = this.items || [];

    if (type !== "all") {
      filtered = filtered.filter((item) => {
        if (type === "gear") return this._isGear(item);
        if (type === "consumable") return this._isConsumable(item);
        if (type === "utility") return !this._isGear(item) && !this._isConsumable(item);
        return true;
      });
    }

    const grid = document.getElementById("inventory-grid");
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `<p style="grid-column:1/-1;opacity:0.6;margin:50px 0;text-align:center;">No items</p>`;
      return;
    }

    grid.innerHTML = this._renderCardsPremium(filtered);
    return;

    grid.innerHTML = filtered
      .map((item) => {
        const key = item.key || item.item_key || item.item;
        const amountNum = this._qty(item);
        const level = Math.max(1, this._toInt(item?.level ?? item?.data?.level, 1));
        const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});

        const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
        const name = this._safeText(item.name, key || "Unknown Item");
        const rarityMeta = this._rarityMeta(item?.rarity || "common");
        const isGear = this._isGear(item);
        const typeLabel = this._safeText(item?.type || item?.category, "Misc");
        const slotLabel = this._slotLabel(item);
        const description = this._itemDescription(item);
        const statChips = this._orderedStatKeys(stats)
          .slice(0, 3)
          .map((statKey) => `
            <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;color:#dce7f9;">
              ${this._esc(this._statLabel(statKey))} +${this._esc(String(this._toInt(stats[statKey], 0)))}
            </span>
          `)
          .join("");

        const keyEsc = String(key || "")
          .replace(/\\/g, "\\\\")
          .replace(/'/g, "\\'");

        return `
        <div style="background:rgba(255,255,255,0.08);border-radius:16px;padding:14px;text-align:center;position:relative;transition:0.3s;"
             onmouseover="this.style.transform='scale(1.07)'" onmouseout="this.style.transform='scale(1)'">

          <img src="${icon}" width="86" height="86"
     style="border:5px solid ${rarityColor};border-radius:14px;"
     onerror="this.onerror=null;this.src='/assets/items/unknown.png';">

          <div style="margin:10px 0 6px;font-size:14px;font-weight:bold;color:#fff;min-height:40px;">
            ${name}
          </div>

          ${isGear ? `<div style="font-size:12px;color:#ff8;margin-bottom:4px;">★${level}</div>` : ""}
          ${statLines ? `<div style="font-size:11px;color:#8f8;margin-bottom:6px;opacity:0.9;">${statLines}</div>` : ""}

          <div style="font-size:15px;color:#0f8;margin:6px 0;">×${Number(amount || 1).toLocaleString()}</div>

          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">

            ${isConsumable ? `
              <button onclick="event.stopPropagation(); Inventory.use('${keyEsc}')" type="button"
                      style="padding:6px 14px;background:#0f0;color:#000;border:none;border-radius:10px;font-weight:bold;font-size:12px;cursor:pointer;">
                USE
              </button>
            ` : ""}

            ${isGear ? `
              <button onclick="event.stopPropagation(); Inventory.equip('${keyEsc}')" type="button"
                      style="padding:6px 12px;background:#08f;color:#fff;border:none;border-radius:10px;font-size:12px;cursor:pointer;">
                EQUIP
              </button>
            ` : ""}

            ${amountNum > 1 ? `
              <button onclick="event.stopPropagation(); Inventory.removeItem('${keyEsc}','one')" type="button"
                      style="padding:6px 10px;background:#3b1f1f;color:#ffb4b4;border:1px solid rgba(255,120,120,.25);border-radius:10px;font-size:11px;cursor:pointer;">
                DISCARD 1
              </button>
              <button onclick="event.stopPropagation(); Inventory.removeItem('${keyEsc}','all')" type="button"
                      style="padding:6px 10px;background:#5e1111;color:#ffdede;border:1px solid rgba(255,120,120,.35);border-radius:10px;font-size:11px;cursor:pointer;">
                DISCARD ALL
              </button>
            ` : `
              <button onclick="event.stopPropagation(); Inventory.removeItem('${keyEsc}','one')" type="button"
                      style="padding:6px 10px;background:#3b1f1f;color:#ffb4b4;border:1px solid rgba(255,120,120,.25);border-radius:10px;font-size:11px;cursor:pointer;">
                DISCARD
              </button>
            `}

          </div>
        </div>
      `;
      })
      .join("");
  },

  // === helper: find item by key ===
  findByKey(key) {
    if (!key) return null;
    return (this.items || []).find((it) => {
      const k = it.key || it.item_key || it.item;
      return k === key;
    });
  },

  // === SALVAGE DUPES (killer) ===
  async salvageDupes() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const apiPost = window.S?.apiPost || window.apiPost;

    const keep = 1;
    const rarityMax = "uncommon"; // MVP: safe clean, no rare+

    Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");

    const ok = confirm(
      `Salvage duplicate GEAR items?\n\n• Keep ${keep} of each\n• Salvage up to: ${rarityMax}\n\nYou’ll get Scrap + Shards back.`
    );
    if (!ok) return;

    const btn = document.getElementById("btnSalvageDupes");
    if (btn) btn.disabled = true;

    try {
      const res = await apiPost("/webapp/inventory/salvage_dupes", {
        keep,
        rarityMax,
        run_id: this._mkRunId("w_inv_salvage_dupes"),
      });

      if (!res?.ok) throw new Error(res?.reason || "Failed");

      if (res.reason === "NO_DUPES") {
        Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
        this._toast("No dupes to salvage (with current filters).");
        return;
      }

      const y = res.yielded || {};
      const parts = Object.keys(y)
        .sort()
        .map((k) => `+${y[k]} ${k}`)
        .slice(0, 5);

      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      this._toast(`Salvaged dupes ✅ ${parts.join(" · ")}`);

      await this.open(); // refresh
    } catch (e) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      this._toast("Salvage failed: " + (e?.message || "Error"));
    } finally {
      if (btn) btn.disabled = false;
      this._perfAction("inventory_salvage_dupes", perfT0);
    }
  },

  // === USE ITEM ===
async use(key) {
  const perfT0 = window.__ahPerf?.now?.() || Date.now();
  const item = this.findByKey(key);
  if (!item || this._normType(item) !== "consumable") return;
  const meta = this._useMeta(item);
  const state = this._safeText(meta.state, "unknown").toLowerCase();

  if (state === "redirect") {
    Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    if (!this._handleRedirectTarget(meta.redirectTarget, meta.message)) {
      this._toast(meta.message || "Open the required screen to use this item.");
    }
    this._perfAction("inventory_use", perfT0);
    return;
  }

  if (state === "blocked" || state === "passive" || state === "unknown") {
    Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("warning");
    this._toast(meta.message || "This item can't be used right now.");
    this._perfAction("inventory_use", perfT0);
    return;
  }

  Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");
  const apiPost = window.S?.apiPost || window.apiPost;

  try {
    const res = await apiPost("/webapp/inventory/use", { key });
    if (res.ok) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      this.activeEffects = this._activeEffectsFromResponse(res);
      this._renderActiveEffectsPanel();

      // ✅ UPDATE BUFFS LINE INSTANTLY
      try { window.renderBuffs?.(res.profile || res); } catch (_) {}

      if (res?.redirectTarget) {
        this._handleRedirectTarget(res.redirectTarget, res.message);
      }

      if (res.message) this._toast(res.message);

      await this.open();
    } else {
      throw Object.assign(new Error(res?.message || res?.reason || "Failed"), { data: res });
    }
  } catch (e) {
    const data = e?.data || {};
    const msg = data?.message || e?.message || data?.reason || "Error";
    if (data?.redirectTarget && this._handleRedirectTarget(data.redirectTarget, data.message || msg)) {
      return;
    }
    const failureState = this._safeText(data?.useMeta?.state, "").toLowerCase();
    Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(failureState === "blocked" ? "warning" : "error");
    this._toast(msg);
  } finally {
    this._perfAction("inventory_use", perfT0);
  }
},

  // === SALVAGE ITEM (single item only) ===
  async removeItem(key, mode = "one") {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const item = this.findByKey(key);
    if (!item) return;

    const itemName = String(item.name || key || "item");
    const salvage = this._salvagePreview(item);
    if (!salvage.ok) {
      this._toast(this._salvageReasonText(salvage.reason, itemName));
      return;
    }

    const ok = confirm(
      `Salvage ${itemName} for ${salvage.scrap} scrap and ${salvage.runeDust} rune dust?`
    );
    if (!ok) return;

    Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");

    const apiPost = window.S?.apiPost || window.apiPost;
    if (typeof apiPost !== "function") {
      this._toast("Can't reach inventory right now.");
      return;
    }

    const pendingKey = `${String(key)}:salvage`;
    this._removePending = this._removePending || new Set();
    if (this._removePending.has(pendingKey)) return;
    this._removePending.add(pendingKey);

    try {
      const res = await apiPost("/webapp/inventory/remove", {
        key: String(key),
        run_id: this._mkRunId("w_inv_salvage_one"),
      });

      if (!res?.ok) {
        throw new Error(
          String(res?.message || this._salvageReasonText(res?.reason, itemName) || "Salvage failed")
        );
      }

      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      this._toast(
        res?.message || `Salvaged ${itemName}: +${salvage.scrap} scrap, +${salvage.runeDust} rune dust.`
      );
      await this.open();
    } catch (e) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      const reason = e?.data?.reason || e?.message || "";
      const message = e?.data?.message || this._salvageReasonText(reason, itemName) || "Salvage failed.";
      this._toast(String(message));
    } finally {
      this._removePending.delete(pendingKey);
      this._perfAction("inventory_salvage_one", perfT0);
    }
  },

  // === EQUIP ===
  async equip(key) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const item = this.findByKey(key);
    if (!item || !this._isGear(item)) return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/equip", { key });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        await this.open();
      } else {
        throw new Error(res.reason || "Failed");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Cannot equip: " + (e.message || "Error"));
    } finally {
      this._perfAction("inventory_equip", perfT0);
    }
  },

  // kept for compatibility (not used by inventory view anymore)
  async unequip(slot) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const s = String(slot || "").toLowerCase();
    if (!s) return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/unequip", { slot: s });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        await this.open();
      } else {
        throw new Error(res.reason || "Failed");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Failed: " + (e.message || "Error"));
    } finally {
      this._perfAction("inventory_unequip", perfT0);
    }
  },

  // kept for compatibility (upgrade should be in Equipped panel)
  async upgrade(slot) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const s = String(slot || "").toLowerCase();
    if (!s) return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("heavy");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/upgrade", { slot: s });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        await this.open();
      } else {
        throw new Error(res.reason || "Not enough materials");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Upgrade failed:\n" + (e.message || "Error"));
    } finally {
      this._perfAction("inventory_upgrade", perfT0);
    }
  },
};
