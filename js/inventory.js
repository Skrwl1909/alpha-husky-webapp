// js/inventory.js – FINALNA WERSJA – USE + EQUIP + UNEQUIP + UPGRADE (fix key-based)
window.Inventory = {
  items: [],
  equipped: {},
  resources: { bones: 0, scrap: 0, rune_dust: 0 },
  currentTab: "all",

  async open() {
    document
      .querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
      .forEach((el) => (el.style.display = "none"));

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `
      <div style="padding:20px;color:#fff;max-width:680px;margin:0 auto;font-family:system-ui;">
        <h2 style="text-align:center;margin:0 0 16px 0;">Inventory</h2>
        
        <div id="stats-bar" style="text-align:center;margin-bottom:20px;opacity:0.9;font-size:16px;">
          loading...
        </div>

        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
          <button onclick="Inventory.showTab('all')" class="tab-btn active" data-type="all">All</button>
          <button onclick="Inventory.showTab('gear')" class="tab-btn" data-type="gear">Gear</button>
          <button onclick="Inventory.showTab('consumable')" class="tab-btn" data-type="consumable">Consumables</button>
          <button onclick="Inventory.showTab('utility')" class="tab-btn" data-type="utility">Utility</button>
        </div>

        <div id="inventory-grid" style="max-height:64vh;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:16px;padding:16px;background:rgba(0,0,0,0.5);border-radius:20px;">
          <div style="grid-column:1/-1;text-align:center;padding:80px;opacity:0.7;color:#aaa;">loading items...</div>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <button onclick="Telegram.WebApp.close()" style="padding:14px 40px;border-radius:20px;background:#333;color:#fff;font-size:18px;border:none;">
            Back to chat
          </button>
        </div>
      </div>
    `;

    try {
      const apiPost = window.S?.apiPost || window.apiPost;
      const res = await apiPost("/webapp/inventory/state", {});
      if (!res?.ok) throw new Error(res?.reason || "No response");

      this.items = res.slots || [];
      this.equipped = res.equipped || {}; // {slot: key}
      this.resources = {
        bones: parseInt(res.bones || 0),
        scrap: parseInt(res.scrap || 0),
        rune_dust: parseInt(res.rune_dust || 0),
      };

      const bar = document.getElementById("stats-bar");
      if (bar) {
        bar.innerHTML = `
          Bones: <b style="color:#ff8;">${this.resources.bones.toLocaleString()}</b> •
          Scrap: <b style="color:#8af;">${this.resources.scrap.toLocaleString()}</b> •
          Rune Dust: <b style="color:#f8f;">${this.resources.rune_dust.toLocaleString()}</b>
        `;
      }

      this.showTab(this.currentTab);
    } catch (err) {
      console.error("Inventory open error:", err);
      document.getElementById("inventory-grid").innerHTML =
        `<p style="grid-column:1/-1;color:#f66;text-align:center;">Connection error</p>`;
    }
  },

  showTab(type) {
    this.currentTab = type;

    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    const btn = document.querySelector(`[data-type="${type}"]`);
    if (btn) btn.classList.add("active");

    let filtered = this.items || [];

    if (type !== "all") {
      filtered = filtered.filter((item) => {
        const t = (item.type || "").toLowerCase();
        if (type === "utility") return !["gear", "consumable"].includes(t) && t;
        return t === type;
      });
    }

    const grid = document.getElementById("inventory-grid");
    if (!filtered.length) {
      grid.innerHTML = `<p style="grid-column:1/-1;opacity:0.6;margin:50px 0;">No items</p>`;
      return;
    }

    grid.innerHTML = filtered
      .map((item) => {
        const key = item.key || item.item_key || item.item;
        const data = item.data || {};
        const amount = item.amount || 1;
        const level = data.level || 1;
        const stats = data.stat_bonus || {};

        const icon =
          item.icon || item.image || item.image_path || "/assets/items/unknown.png";
        const name = item.name || key;
        const rarity = (item.rarity || "common").toLowerCase();

        const isGear = item.type === "gear" && item.slot;
        const isEquipped = isGear && this.equipped[item.slot] === key;
        const isConsumable = item.type === "consumable";

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
               onerror="this.src='/assets/items/unknown.png'">

          ${isEquipped ? '<div style="position:absolute;top:8px;right:8px;background:#0f8;color:#000;padding:4px 9px;border-radius:10px;font-size:11px;font-weight:bold;">EQ</div>' : ''}

          <div style="margin:10px 0 6px;font-size:14px;font-weight:bold;color:#fff;min-height:40px;">
            ${name}
          </div>

          ${isGear ? `<div style="font-size:12px;color:#ff8;margin-bottom:4px;">★${level}</div>` : ''}
          ${statLines ? `<div style="font-size:11px;color:#8f8;margin-bottom:6px;opacity:0.9;">${statLines}</div>` : ''}

          <div style="font-size:15px;color:#0f8;margin:6px 0;">×${amount.toLocaleString()}</div>

          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">

            ${isConsumable ? `
              <button onclick="event.stopPropagation(); Inventory.use('${keyEsc}')"
                      style="padding:6px 14px;background:#0f0;color:#000;border:none;border-radius:10px;font-weight:bold;font-size:12px;">
                USE
              </button>
            ` : ''}

            ${isGear && !isEquipped ? `
              <button onclick="event.stopPropagation(); Inventory.equip('${keyEsc}')"
                      style="padding:6px 12px;background:#08f;color:#fff;border:none;border-radius:10px;font-size:12px;">
                EQUIP
              </button>
            ` : ''}

            ${isEquipped ? `
              <button onclick="event.stopPropagation(); Inventory.unequip('${item.slot}')"
                      style="padding:6px 10px;background:#800;color:#fff;border:none;border-radius:10px;font-size:11px;">
                UNEQ
              </button>
              <button onclick="event.stopPropagation(); Inventory.upgrade('${item.slot}')"
                      style="padding:6px 10px;background:#e0a;color:#000;border:none;border-radius:10px;font-weight:bold;font-size:11px;">
                UPGRADE
              </button>
            ` : ''}
          </div>
        </div>
      `;
      })
      .join("");
  },

  // === helper: szukamy itemu po key ===
  findByKey(key) {
    if (!key) return null;
    return (this.items || []).find((it) => {
      const k = it.key || it.item_key || it.item;
      return k === key;
    });
  },

  // === USE ITEM ===
  async use(key) {
    const item = this.findByKey(key);
    if (!item || item.type !== "consumable") return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("medium");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/use", { key });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        await this.open(); // pełny refresh
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
    if (!item || item.type !== "gear" || !item.slot) return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/equip", { key });
      if (res.ok) {
        this.equipped[item.slot] = key;
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        this.showTab(this.currentTab);
      } else {
        throw new Error(res.reason || "Failed");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Cannot equip: " + (e.message || "Error"));
    }
  },

  // === UNEQUIP ===
  async unequip(slot) {
    if (!slot) return;
    Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/unequip", { slot });
      if (res.ok) {
        delete this.equipped[slot];
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        this.showTab(this.currentTab);
      } else {
        throw new Error(res.reason || "Failed");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Failed: " + (e.message || "Error"));
    }
  },

  // === UPGRADE ===
  async upgrade(slot) {
    if (!slot) return;
    Telegram.WebApp.HapticFeedback?.impactOccurred?.("heavy");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/upgrade", { slot });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        await this.open(); // odśwież zasoby + level
      } else {
        throw new Error(res.reason || "Not enough materials");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Upgrade failed:\n" + (e.message || "Error"));
    }
  },
};
