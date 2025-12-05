// js/badges.js
window.Badges = {
  async open() {
    document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(el => el.style.display = "none");

    const container = document.getElementById("app") || document.body;
    container.innerHTML = `<div style="padding:20px;color:#fff;text-align:center;"><h2>Your Badges</h2><div id="badges-loading">Loading...</div></div>`;

    try {
      const res = await (window.S?.apiPost || window.apiPost)("/webapp/badges/state", {});

      if (!res.ok) {
        document.getElementById("badges-loading").innerHTML = `<p style="color:#f66;">Failed to load badges</p>`;
        return;
      }

      const grid = res.badges.map(b => `
        <div style="display:inline-block;margin:12px;width:100px;text-align:center;">
          <div style="font-size:60px;">${b.icon}</div>
          <div style="margin-top:8px;font-size:14px;font-weight:bold;">${b.name}</div>
          <div style="font-size:12px;opacity:0.8;margin-top:4px;">${b.description}</div>
        </div>
      `).join("");

      document.getElementById("badges-loading").innerHTML = `
        <div style="margin:17px;text-align:center;opacity:0.9;">
          You have <b style="color:#ff0;">${res.total}</b> badge${res.total === 1 ? '' : 's'}
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:20px;">
          ${grid || "<p style='opacity:0.6;margin-top:40px;'>No badges yet</p>"}
        </div>
        <div style="text-align:center;margin-top:30px;">
          <button onclick="Telegram.WebApp.close()" style="padding:14px 36px;border-radius:16px;background:#333;color:#fff;">
            ← Back
          </button>
        </div>
      `;

    } catch (err) {
      document.getElementById("badges-loading").innerHTML = `<p style="color:#f66;">Connection error</p>`;
    }
  }
};
