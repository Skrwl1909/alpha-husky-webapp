// js/inventory.js — UNEQUIPPED ONLY (clean)
// Inventory modal shows ONLY items available in inventory (not equipped).
// Equipped management (UNEQ/UPGRADE) should live in Equipped panel.

window.Inventory = {
  items: [],
  equipped: {}, // unused here now (kept for compatibility)
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
    try {
      document
        .querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach((el) => (el.style.display = "none"));
    } catch (_) {}

    const container = document.getElementById("app") || document.body;

    container.innerHTML = `
      <div style="
        padding:20px;
        padding-top:calc(20px + var(--tg-safe-area-inset-top, 0px));
        color:#fff;
        max-width:680px;
        margin:0 auto;
        font-family:system-ui;
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

        <div id="stats-bar" style="text-align:center;margin:8px 0 16px 0;opacity:0.9;font-size:16px;">
          loading...
        </div>

        <!-- Tabs + Salvage -->
        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
          <button onclick="Inventory.showTab('all')" class="tab-btn active" data-type="all" type="button">All</button>
          <button onclick="Inventory.showTab('gear')" class="tab-btn" data-type="gear" type="button">Gear</button>
          <button onclick="Inventory.showTab('consumable')" class="tab-btn" data-type="consumable" type="button">Consumables</button>
          <button onclick="Inventory.showTab('utility')" class="tab-btn" data-type="utility" type="button">Utility</button>

          <button onclick="Inventory.salvageDupes()" id="btnSalvageDupes" type="button"
                  style="padding:10px 14px;border-radius:14px;background:linear-gradient(180deg,#ff4d4d,#c81d1d);color:#fff;border:none;font-weight:800;font-size:12px;letter-spacing:0.6px;cursor:pointer;">
            SALVAGE DUPES
          </button>
        </div>

        <div id="inventory-grid" style="max-height:64vh;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:16px;padding:16px;background:rgba(0,0,0,0.5);border-radius:20px;">
          <div style="grid-column:1/-1;text-align:center;padding:80px;opacity:0.7;color:#aaa;">loading items...</div>
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
      this.equipped = {}; // no equipped fallback in this view

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

    grid.innerHTML = filtered
      .map((item) => {
        const key = item.key || item.item_key || item.item;
        const data = item.data || {};
        const amount = item.amount || 1;
        const level = data.level || 1;
        const stats = data.stat_bonus || {};

        const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
        const name = item.name || key;
        const rarity = (item.rarity || "common").toLowerCase();

        const isGear = this._isGear(item);
        const isConsumable = this._isConsumable(item);

        const rarityColor =
          {
            common: "#888",
            uncommon: "#0f8",
            rare: "#08f",
            epic: "#a0f",
            legendary: "#ff0",
            mythic: "#f0f",
          }[rarity] || "#888";

        const statLines = Object.entries(stats)
          .map(([k, v]) => `${k.slice(0, 3).toUpperCase()}: +${v}`)
          .join("  ");

        const keyEsc = String(key || "").replace(/"/g, "&quot;");

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
    }
  },

  // === USE ITEM ===
  async use(key) {
    const item = this.findByKey(key);
    if (!item || this._normType(item) !== "consumable") return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("medium");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/use", { key });
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
    }
  },

  // === EQUIP ===
  async equip(key) {
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
    }
  },

  // kept for compatibility (not used by inventory view anymore)
  async unequip(slot) {
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
    }
  },

  // kept for compatibility (upgrade should be in Equipped panel)
  async upgrade(slot) {
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
    }
  },
};
