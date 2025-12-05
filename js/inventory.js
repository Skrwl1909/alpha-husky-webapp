window.Inventory = {
  async open() {
    // Ukrywamy mapę i inne modale
    document.querySelectorAll(".map-back, .q-modal, .locked-back, .sheet-back").forEach(el => el.style.display = "none");

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `
      <div style="padding:20px; color:#fff; text-align:center;">
        <h2 style="margin:12px 0; font-size:22px;">Inventory</h2>
        <div id="inv-content">Ładowanie...</div>
      </div>
    `;

    const res = await apiPost("/webapp/inventory/state", {});
    if (!res.ok) {
      document.getElementById("inv-content").innerHTML = `<p style="color:#f66;">${res.reason || "Failed"}</p>`;
      return;
    }

    const grid = res.slots.map(item => `
      <div style="display:inline-block; margin:8px; text-align:center; width:88px;">
        <img src="${item.icon || '/assets/items/unknown.webp'}" width="64" height="64" style="border:2px solid #444; border-radius:12px;">
        <div style="font-size:12px; margin-top:4px;">${item.name}</div>
        <div style="font-size:14px; color:#0f0;">×${item.amount}</div>
        ${item.equipped ? '<div style="color:#00e5ff; font-size:10px;">EQUIPPED</div>' : ''}
      </div>
    `).join("");

    document.getElementById("inv-content").innerHTML = `
      <div style="margin:20px 0;">
        <div style="margin-bottom:16px; font-size:14px; opacity:0.8;">
          Gold: <b>${res.gold.toLocaleString()}</b> • 
          Scrap: <b>${res.scrap}</b> • 
          Rune Dust: <b>${res.rune_dust}</b>
        </div>
        <div style="display:flex; flex-wrap:wrap; justify-content:center;">
          ${grid || "<p>Empty inventory</p>"}
        </div>
      </div>
      <button onclick="Telegram.WebApp.close()" style="margin-top:20px; padding:10px 20px; border-radius:12px; background:#333;">
        ← Back to chat
      </button>
    `;
  }
};
