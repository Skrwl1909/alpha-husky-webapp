// js/inventory.js – INTERAKTYWNY + SCROLL + KLIKAJ I DZIAŁA ZAWSZE
window.Inventory = {
  async open() {
    document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(el => el.style.display = "none");

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `
      <div style="padding:20px;color:#fff;max-width:600px;margin:0 auto;font-family:system-ui;">
        <h2 style="text-align:center;margin:0 0 16px 0;">Inventory</h2>
        <div id="stats-bar" style="text-align:center;margin-bottom:20px;opacity:0.9;font-size:16px;">
          Ładowanie...
        </div>
        <div id="inventory-grid" style="max-height:68vh;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:16px;padding:12px;background:rgba(0,0,0,0.4);border-radius:20px;">
          <div style="grid-column:1/-1;text-align:center;padding:40px;opacity:0.7;">Ładowanie przedmiotów...</div>
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
      console.log("Inventory raw response:", res); // ← zobaczymy co naprawdę przychodzi

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

      // Grid z klikalnymi itemami
      const grid = document.getElementById("inventory-grid");
      grid.innerHTML = res.slots.map((item, i) => {
        // Najbardziej odporny fallback na ikonę
        const icon = item.icon || item.image || item.image_path || item.imagePath || "/assets/items/unknown.png";
        console.log(`Item ${i}:`, item.name, "→ icon:", icon); // ← tu zobaczymy co naprawdę jest

        return `
          <div onclick="Inventory.showDetails(${i})" 
               style="cursor:pointer;background:rgba(255,255,255,0.07);border-radius:16px;padding:10px;text-align:center;transition:0.2s;"
               onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
            <div style="position:relative;">
              <img src="${icon}" width="80" height="80" 
                   style="border:4px solid ${item.rarity==='legendary'?'#ff0':item.rarity==='epic'?'#a0f':item.rarity==='rare'?'#08f':item.rarity==='uncommon'?'#0f8':'#888'};border-radius:12px;"
                   onerror="this.src='/assets/items/unknown.png'">
              ${item.equipped ? '<div style="position:absolute;top:6px;right:6px;background:#0f8;color:#000;padding:3px 7px;border-radius:8px;font-size:10px;font-weight:bold;">EQ</div>' : ''}
            </div>
            <div style="margin-top:8px;font-size:13px;font-weight:bold;">${item.name || "??"}</div>
            <div style="font-size:14px;color:#0f8;">×${item.amount || 1}</div>
          </div>
        `;
      }).join("") || `<p style="grid-column:1/-1;opacity:0.6;margin-top:40px;">Empty inventory</p>`;

      // Zapisujemy dane do pokazania po kliknięciu
      window.lastInventoryData = res.slots;

    } catch (err) {
      console.error("Inventory error:", err);
      document.getElementById("inventory-grid").innerHTML = `<p style="grid-column:1/-1;color:#f66;">Connection failed</p>`;
    }
  },

  // Pokazuje szczegóły po kliknięciu
  showDetails(index) {
    const item = window.lastInventoryData[index];
    if (!item) return;

    const stats = item.stat_bonus ? Object.entries(item.stat_bonus)
      .map(([k,v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: +${v}`).join("\n") : "No stats";

    const desc = item.desc || item.description || "No description";

    Telegram.WebApp.showAlert(
      `Name: ${item.name}\n` +
      `Rarity: ${item.rarity?.toUpperCase() || "COMMON"}\n` +
      `${desc}\n\n` +
      `${stats}`
    );
  }
};
