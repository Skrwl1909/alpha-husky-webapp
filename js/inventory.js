// js/inventory.js – FINALNA WERSJA DLA ALPHA HUSKY (bez golda!)
window.Inventory = {
  async open() {
    document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(el => el.style.display = "none");

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `<div style="padding:20px;color:#fff;text-align:center;"><h2>Inventory</h2><div id="inv-loading">Connecting to server...</div></div>`;

    try {
      const res = await apiPost("/webapp/inventory/state", {});
      console.log("Inventory response:", res);  // ← TO POKAŻE CI WSZYSTKO

      if (!res.ok) {
        document.getElementById("inv-loading").innerHTML = `<p style="color:#f66;">Server error: ${res.reason || JSON.stringify(res)}</p>`;
        return;
      }

      const grid = (res.slots || []).map(item => `
        <div style="display:inline-block;margin:8px;width:90px;text-align:center;position:relative;">
          <img src="${item.icon || '/assets/items/unknown.webp'}" width="72" height="72"
               style="border:3px solid ${item.rarity==='legendary'?'#ff0':item.rarity==='epic'?'#a0f':item.rarity==='rare'?'#08f':item.rarity==='uncommon'?'#0f8':'#888'};border-radius:12px;">
          ${item.equipped ? '<div style="position:absolute;top:4px;right:4px;background:#0f0;color:#000;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:bold;">EQ</div>' : ''}
          <div style="margin-top:4px;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:86px;">${item.name}</div>
          <div style="font-size:14px;color:#0f8;">×${item.amount}</div>
        </div>
      `).join("");

      document.getElementById("inv-loading").innerHTML = `
        <div style="margin:20px 0;font-size:16px;opacity:0.9;text-align:center;">
          Bones: <b style="color:#ff6;">${(res.bones ?? 0).toLocaleString()}</b> • 
          Scrap: <b style="color:#8af;">${(res.scrap ?? 0).toLocaleString()}</b> • 
          Rune Dust: <b style="color:#f6f;">${(res.rune_dust ?? 0).toLocaleString()}</b>
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;padding:10px;">
          ${grid || "<p style='opacity:0.6;margin-top:40px;'>Empty inventory</p>"}
        </div>
        <div style="text-align:center;margin-top:30px;">
          <button onclick="Telegram.WebApp.close()" style="padding:14px 36px;border-radius:16px;background:#333;border:none;color:#fff;font-size:17px;">
            ← Back to chat
          </button>
        </div>
      `;
    } catch (err) {
      console.error("Inventory fetch failed:", err);
      document.getElementById("inv-loading").innerHTML = `<p style="color:#f66;">Connection failed<br>${err.message}</p>`;
    }
  }
};
