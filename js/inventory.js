// js/inventory.js – DZIAŁA Z TWOIM PROJEKTEM
window.Inventory = {
  async open() {
    // Ukrywamy wszystko inne
    document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(el => el.style.display = "none");

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `<div style="padding:30px;color:#fff;text-align:center;font-family:system-ui;"><h2>Inventory</h2><div id="inv-loading">Loading...</div></div>`;

    try {
      // ←←← UŻYWAMY TWOJEJ GLOBALNEJ FUNKCJI apiPost
      const res = await (window.apiPost || window.S?.apiPost)( "/webapp/inventory/state", {} );

      if (!res || !res.ok) {
        document.getElementById("inv-loading").innerHTML = 
          `<p style="color:#f66;">Error: ${res?.reason || "No response"}</p>`;
        return;
      }

      const grid = (res.slots || []).map(item => `
        <div style="display:inline-block;margin:12px;width:96px;text-align:center;position:relative;">
          <img src="${item.icon || '/assets/items/unknown.webp'}" width="80" height="80"
               style="border:4px solid ${item.rarity==='legendary'?'#ff0':item.rarity==='epic'?'#a0f':item.rarity==='rare'?'#08f':item.rarity==='uncommon'?'#0f8':'#888'};border-radius:16px;">
          ${item.equipped ? '<div style="position:absolute;top:6px;right:6px;background:#0f8;color:#000;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:bold;">EQ</div>' : ''}
          <div style="margin-top:6px;font-size:14px;">${item.name}</div>
          <div style="font-size:15px;color:#0f8;">×${item.amount}</div>
        </div>
      `).join("");

      document.getElementById("inv-loading").innerHTML = `
        <div style="margin:20px 0;font-size:17px;text-align:center;opacity:0.9;">
          Bones: <b style="color:#ff8;">${(res.bones ?? 0).toLocaleString()}</b> • 
          Scrap: <b style="color:#8af;">${(res.scrap ?? 0).toLocaleString()}</b> • 
          Rune Dust: <b style="color:#f8f;">${(res.rune_dust ?? 0).toLocaleString()}</b>
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:10px;">
          ${grid || "<p style='opacity:0.6;margin-top:50px;'>Empty inventory</p>"}
        </div>
        <div style="text-align:center;margin-top:40px;">
          <button onclick="Telegram.WebApp.close()" style="padding:16px 40px;border-radius:20px;background:#333;border:none;color:#fff;font-size:18px;">
            ← Back to chat
          </button>
        </div>
      `;

    } catch (err) {
      console.error("Inventory error:", err);
      document.getElementById("inv-loading").innerHTML = 
        `<p style="color:#f66;">Connection failed<br><small>${err.message}</small></p>`;
    }
  }
};
