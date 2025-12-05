// js/inventory.js – FINALNA WERSJA
window.Inventory = {
  async open() {
    // Ukrywamy mapę i inne rzeczy
    document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(el => el.style.display = "none");

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `<div style="padding:20px;color:#fff;"><h2>Inventory</h2><div id="inv-loading">Ładowanie ekwipunku...</div></div>`;

    const res = await apiPost("/webapp/inventory/state", {});
    if (!res.ok) {
      document.getElementById("inv-loading").innerHTML = `<p style="color:#f66;">${res.reason || "Błąd połączenia"}</p>`;
      return;
    }

    const grid = res.slots.map(item => `
      <div style="display:inline-block;margin:8px;width:90px;text-align:center;position:relative;">
        <img src="${item.icon || '/assets/items/unknown.webp'}" width="72" height="72"
             style="border:3px solid ${item.rarity==='legendary'?'#ff0':item.rarity==='epic'?'#a0f':item.rarity==='rare'?'#08f':item.rarity==='uncommon'?'#0f8':'#888'};
                    border-radius:12px;">
        ${item.equipped ? '<div style="position:absolute;top:4px;right:4px;background:#0f0;color:#000;padding:2px 6px;border-radius:6px;font-size:10px;">EQ</div>' : ''}
        <div style="margin-top:4px;font-size:13px;">${item.name}</div>
        <div style="font-size:14px;color:#0f8;">×${item.amount}</div>
      </div>
    `).join("");

    document.getElementById("inv-loading").innerHTML = `
      <div style="margin:20px 0;font-size:15px;opacity:0.8;">
        Gold: <b>${(res.gold||0).toLocaleString()}</b> • 
        Scrap: <b>${res.scrap||0}</b> • 
        Rune Dust: <b>${res.rune_dust||0}</b> • 
        Bones: <b>${res.bones||0}</b>
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;">
        ${grid || "<p>Pusto w ekwipunku</p>"}
      </div>
      <div style="text-align:center;margin-top:30px;">
        <button onclick="Telegram.WebApp.close()" style="padding:12px 30px;border-radius:12px;background:#333;border:none;color:#fff;">
          ← Back to chat
        </button>
      </div>
    `;
  }
};
