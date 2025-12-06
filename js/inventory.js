// js/inventory.js – INTERAKTYWNY + SCROLL + KATEGORIE (Gear / Consumables / Utility / All)
window.Inventory = {
  items: [], // tu trzymamy wszystkie itemy

  async open() {
    document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(el => el.style.display = "none");

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `
      <div style="padding:20px;color:#fff;max-width:600px;margin:0 auto;font-family:system-ui;">
        <h2 style="text-align:center;margin:0 0 16px 0;">Inventory</h2>
        <div id="stats-bar" style="text-align:center;margin-bottom:20px;opacity:0.9;font-size:16px;">
          loading...
        </div>

        <!-- KATEGORIE -->
        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
          <button onclick="Inventory.showTab('gear')" class="tab-btn active" data-type="gear">Gear</button>
          <button onclick="Inventory.showTab('consumable')" class="tab-btn" data-type="consumable">Consumables</button>
          <button onclick="Inventory.showTab('utility')" class="tab-btn" data-type="utility">Utility</button>
          <button onclick="Inventory.showTab('all')" class="tab-btn" data-type="all">All</button>
        </div>

        <div id="inventory-grid" style="max-height:68vh;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:16px;padding:12px;background:rgba(0,0,0,0.4);border-radius:20px;">
          <div style="grid-column:1/-1;text-align:center;padding:40px;opacity:0.7;">loading items...</div>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <button onclick="Telegram.WebApp.close()" style="padding:14px 40px;border-radius:20px;background:#333;color:#fff;font-size:18px;border:none;">
            ← Back to chat
          </button>
        </div>
      </div>
    `;

    try {
      const res = await (window.S?.apiPost || window.apiPost)("/webapp/inventory/state", {});
      console.log("Inventory raw response:", res);

      if (!res?.ok || !res.slots) {
        document.getElementById("inventory-grid").innerHTML = `<p style="grid-column:1/-1;color:#f66;text-align:center;">Error: ${res?.reason || "No data"}</p>`;
        return;
      }

      // Statystyki
      document.getElementById("stats-bar").innerHTML = `
        Bones: <b style="color:#ff8;">${(res.bones ?? 0).toLocaleString()}</b> •
        Scrap: <b style="color:#8af;">${(res.scrap ?? 0).toLocaleString()}</b> •
        Rune Dust: <b style="color:#f8f;">${(res.rune_dust ?? 0).toLocaleString()}</b>
      `;

      // Zapisujemy itemy globalnie
      window.Inventory.items = res.slots || [];
      window.lastInventoryData = res.slots; // dla starych kliknięć

      // Domyślnie pokazujemy Gear
      Inventory.showTab('gear');

    } catch (err) {
      console.error("Inventory error:", err);
      document.getElementById("inventory-grid").innerHTML = `<p style="grid-column:1/-1;color:#f66;">Connection failed</p>`;
    }
  },

  // FILTR + WYŚWIETLANIE
  showTab(type) {
    // podświetlamy aktywny przycisk
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.tab-btn[data-type="${type}"]`).classList.add("active");

    let filtered = window.Inventory.items;

    if (type !== "all") {
      filtered = filtered.filter(item => {
        const t = (item.type || "").toLowerCase();
        if (type === "utility") return !["gear", "consumable"].includes(t) && t !== "";
        return t === type;
      });
    }

    const grid = document.getElementById("inventory-grid");
    grid.innerHTML = filtered.map((item, i) => {
      const icon = item.icon || item.image || item.image_path || item.imagePath || "/assets/items/unknown.png";
      return `
        <div onclick="Inventory.showDetails(${i})"
             style="cursor:pointer;background:rgba(255,255,255,0.07);border-radius:16px;padding:10px;text-align:center;position:relative;transition:0.2s;"
             onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
          <img src="${icon}" width="80" height="80"
               style="border:4px solid ${item.rarity==='legendary'?'#ff0':item.rarity==='epic'?'#a0f':item.rarity==='rare'?'#08f':item.rarity==='uncommon'?'#0f8':'#888'};border-radius:12px;"
               onerror="this.src='/assets/items/unknown.png'">
          ${item.equipped ? '<div style="position:absolute;top:6px;right:6px;background:#0f8;color:#000;padding:3px 7px;border-radius:8px;font-size:10px;font-weight:bold;">EQ</div>' : ''}
          <div style="margin-top:8px;font-size:13px;font-weight:bold;">${item.name || "??"}</div>
          <div style="font-size:14px;color:#0f8;">×${item.amount || 1}</div>
        </div>
      `;
    }).join("") || `<p style="grid-column:1/-1;opacity:0.6;margin-top:40px;">No items in this category</p>`;
  },

  // Szczegóły po kliknięciu
  showDetails(index) {
    const item = window.Inventory.items[index] || window.lastInventoryData[index];
    if (!item) return;

    const stats = item.stat_bonus ? Object.entries(item.stat_bonus)
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: +${v}`).join("\n") : "No stats";

    const desc = item.desc || item.description || "No description";

    Telegram.WebApp.showAlert(
      `${item.name}\n` +
      `Rarity: ${item.rarity?.toUpperCase() || "COMMON"}\n` +
      `${desc}\n\n` +
      `${stats}`
    );
  }
};
