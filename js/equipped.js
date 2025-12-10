// js/equipped.js
// Character panel + Equipped view for Alpha Husky WebApp.

(function () {
  const API_BASE = window.API_BASE || ""; // e.g. "https://api.alphahusky.win"

  function getTg() {
    return window.tg || (window.Telegram && window.Telegram.WebApp) || null;
  }

  async function loadCharacterPngInto(imgEl) {
  if (!imgEl) return;
  try {
    const resp = await fetch("/webapp/character/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Init-Data": Telegram.WebApp.initData
      },
      body: JSON.stringify({init_data: Telegram.WebApp.initData})
    });
    if (!resp.ok) throw new Error("status " + resp.status);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    imgEl.src = url;
    if (window.__EquippedCharImgUrl) URL.revokeObjectURL(window.__EquippedCharImgUrl);
    window.__EquippedCharImgUrl = url;
  } catch (err) {
    console.error("loadCharacterPngInto failed:", err);
  }
}

  window.Equipped = {
    state: null,

    async open() {
      // Schowaj mapę i inne overlaye
      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(el => {
        el.style.display = "none";
      });

      const container = document.getElementById("app") || document.body;
      container.innerHTML = `
        <div id="equipped-root" style="padding:16px 16px 24px;color:#fff;max-width:760px;margin:0 auto;font-family:system-ui;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:10px;">
            <h2 style="margin:0;font-size:18px;">Character & Equipped</h2>
            <div style="display:flex;gap:8px;">
              <button type="button"
                      style="border-radius:999px;border:0;background:rgba(255,255,255,.08);color:#fff;padding:5px 12px;font-size:12px;cursor:pointer;"
                      onclick="window.Inventory && window.Inventory.open && window.Inventory.open()">
                Inventory
              </button>
              <button type="button"
                      style="border-radius:999px;border:0;background:rgba(255,255,255,.08);color:#fff;padding:5px 12px;font-size:12px;cursor:pointer;"
                      onclick="window.Equipped && window.Equipped.refresh && window.Equipped.refresh()">
                Refresh
              </button>
            </div>
          </div>

          <div id="equip-main" style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
            <!-- LEFT: character -->
            <div id="equip-avatar" style="flex:1;min-width:260px;text-align:center;">
              <div style="font-size:13px;opacity:.8;padding:24px 8px;">Loading character...</div>
            </div>

            <!-- RIGHT: slots -->
            <div id="equip-slots" style="flex:1;min-width:260px;">
              <div style="font-size:13px;opacity:.8;padding:24px 8px;">Loading equipment...</div>
            </div>
          </div>

          <div id="equip-sets" style="margin-top:12px;font-size:13px;opacity:.9;"></div>
          <div id="equip-total" style="margin-top:4px;font-size:13px;opacity:.9;"></div>
        </div>
      `;

      await this.refresh();
    },

    async refresh() {
      try {
        const res = await apiPost("/webapp/equipped/state", {});
        if (!res || !res.ok) {
          console.error("Equipped.state error:", res);
          const tg = getTg();
          tg && tg.showAlert && tg.showAlert("Failed to load equipped state.");
          return;
        }
        this.state = res.data;
        this.render();
      } catch (err) {
        console.error("Equipped.refresh error", err);
        const tg = getTg();
        tg && tg.showAlert && tg.showAlert("Error while loading equipped.");
      }
    },

    render() {
      if (!this.state) return;

      const avatarBox = document.getElementById("equip-avatar");
      const slotsBox = document.getElementById("equip-slots");
      const setsBox = document.getElementById("equip-sets");
      const totalBox = document.getElementById("equip-total");

      // --- LEFT: CHARACTER IMG + LEVEL ---
      if (avatarBox) {
        const level = this.state.level || 1;
        avatarBox.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <div style="
                position:relative;
                width:260px;
                height:260px;
                border-radius:22px;
                overflow:hidden;
                background:radial-gradient(circle at 50% 0%, rgba(0,229,255,.4), rgba(0,0,0,.9));
                box-shadow:0 14px 40px rgba(0,0,0,.7);
            ">
              <img id="equipped-character-img"
                   alt="Character"
                   style="width:100%;height:100%;object-fit:contain;display:block;"/>
            </div>
            <div style="font-size:13px;opacity:.9;">
              Level <b>${level}</b>
            </div>
          </div>
        `;

        const imgEl = document.getElementById("equipped-character-img");
        loadCharacterPngInto(imgEl);
      }

      // --- RIGHT: SLOTS LIST ---
      if (slotsBox) {
        const slots = this.state.slots || [];
        const html = slots.map(slot => {
          const unlocked = !!slot.unlocked;
          const itemName = slot.item_key ? (slot.name || slot.item_key) : "Empty";
          const rarity = slot.rarity ? `<span style="opacity:.8;">(${slot.rarity})</span>` : "";
          const icon = slot.icon
            ? `<div style="width:32px;height:32px;border-radius:8px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
                 <img src="${slot.icon}" style="width:100%;height:100%;object-fit:contain;">
               </div>`
            : `<div style="width:32px;height:32px;border-radius:8px;border:1px dashed rgba(255,255,255,.15);flex-shrink:0;"></div>`;

          const lockBadge = unlocked
            ? ""
            : `<span style="font-size:11px;opacity:.8;margin-left:6px;">🔒 Lv ${slot.level_req}</span>`;

          const subtitle = slot.item_key
            ? `Lv ${slot.level || 1}${slot.is_pet ? " • Pet" : ""}`
            : (unlocked ? "Empty slot" : "Locked");

          return `
            <button data-slot="${slot.slot}"
                    class="equip-slot-btn"
                    style="
                      width:100%;
                      display:flex;
                      align-items:center;
                      gap:10px;
                      background:rgba(10,10,25,.9);
                      border-radius:14px;
                      border:1px solid rgba(255,255,255,.06);
                      padding:8px 10px;
                      margin-bottom:8px;
                      color:#fff;
                      text-align:left;
                      cursor:${unlocked ? "pointer" : "default"};
                      opacity:${unlocked ? "1" : ".5"};
                    ">
              ${icon}
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
                  ${slot.label}${lockBadge}
                </div>
                <div style="font-size:12px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${itemName} ${rarity}
                </div>
                <div style="font-size:11px;opacity:.7;">
                  ${subtitle}
                </div>
              </div>
            </button>
          `;
        }).join("");

        slotsBox.innerHTML = `
          <div style="font-size:13px;margin-bottom:6px;opacity:.9;">
            Tap a slot to inspect or unequip.
          </div>
          <div>${html}</div>
        `;

        // attach clicks
        slotsBox.querySelectorAll(".equip-slot-btn").forEach(btn => {
          const slot = btn.getAttribute("data-slot");
          const slotState = (this.state.slots || []).find(s => s.slot === slot);
          if (!slotState || !slotState.unlocked) return;

          if (!slotState.item_key) {
            // empty slot -> haptic only for now
            btn.onclick = () => {
              const tg = getTg();
              tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred && tg.HapticFeedback.impactOccurred("light");
            };
          } else {
            btn.onclick = () => {
              this.inspect(slot);
            };
          }
        });
      }

      // --- ACTIVE SETS ---
      if (setsBox) {
        const sets = this.state.active_sets || [];
        if (sets.length) {
          setsBox.innerHTML = "<b>Active set bonuses:</b> " + sets.map(s => {
            return `${s.set} (${s.count})`;
          }).join(" • ");
        } else {
          setsBox.innerHTML = "";
        }
      }

      // --- TOTAL BONUS ---
      if (totalBox) {
        const t = this.state.total_bonus || {};
        const keys = Object.keys(t);
        if (keys.length) {
          totalBox.innerHTML = "<b>Total gear bonus:</b> " +
            keys.map(k => `${k}+${t[k]}`).join(", ");
        } else {
          totalBox.innerHTML = "";
        }
      }
    },

    async inspect(slot) {
      try {
        const res = await apiPost("/webapp/equipped/inspect", { slot });
        if (!res || !res.ok) {
          const tg = getTg();
          tg && tg.showAlert && tg.showAlert("Failed to inspect item.");
          return;
        }
        const d = res.data;
        if (!d || d.empty) {
          const tg = getTg();
          tg && tg.showAlert && tg.showAlert("Nothing equipped in this slot.");
          return;
        }
        this.renderInspect(d);
      } catch (err) {
        console.error("Equipped.inspect error", err);
        const tg = getTg();
        tg && tg.showAlert && tg.showAlert("Error while loading item.");
      }
    },

    renderInspect(d) {
      // remove old modal
      const old = document.getElementById("equip-inspect");
      if (old) old.remove();

      const wrapper = document.createElement("div");
      wrapper.id = "equip-inspect";
      wrapper.style.position = "fixed";
      wrapper.style.left = "0";
      wrapper.style.top = "0";
      wrapper.style.right = "0";
      wrapper.style.bottom = "0";
      wrapper.style.background = "rgba(0,0,0,.65)";
      wrapper.style.zIndex = "999";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";

      const card = document.createElement("div");
      card.style.background = "rgba(10,10,25,.98)";
      card.style.borderRadius = "18px";
      card.style.border = "1px solid rgba(255,255,255,.12)";
      card.style.maxWidth = "420px";
      card.style.width = "90%";
      card.style.padding = "16px";
      card.style.color = "#fff";
      card.style.fontFamily = "system-ui";
      card.style.boxShadow = "0 18px 60px rgba(0,0,0,.6)";

      const iconUrl = d.icon || "";
      const stats = d.stats || {};
      const statsLines = Object.keys(stats).map(k => {
        return `<div style="font-size:13px;">▫ ${k}: <b>${stats[k]}</b></div>`;
      }).join("") || "<div style='font-size:13px;opacity:.8;'>No bonuses</div>";

      const starInfo = d.star_cap ? ` / ${d.star_cap}★ cap` : "";

      card.innerHTML = `
        <div style="display:flex;gap:12px;">
          ${iconUrl ? `
          <div style="width:72px;height:72px;border-radius:14px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
            <img src="${iconUrl}" style="width:100%;height:100%;object-fit:contain;">
          </div>` : ""}
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;font-weight:600;margin-bottom:2px;">${d.name || d.item_key}</div>
            <div style="font-size:12px;opacity:.8;margin-bottom:4px;">
               ${d.rarity ? d.rarity.toUpperCase() : ""} ${d.set ? "• " + d.set : ""}
            </div>
            <div style="font-size:12px;opacity:.8;">Slot: ${d.slot}</div>
            <div style="font-size:12px;opacity:.8;">Level: ${d.level}${starInfo}</div>
          </div>
        </div>
        <div style="font-size:12px;opacity:.85;margin-top:8px;margin-bottom:8px;">
          ${d.desc || ""}
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.08);margin:8px 0 6px;"></div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Stats</div>
        ${statsLines}
        <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
          <button id="equip-unequip-btn" style="
             border-radius:999px;
             border:1px solid rgba(255,255,255,.15);
             background:rgba(60,10,10,.9);
             color:#fff;
             padding:6px 14px;
             font-size:13px;
          ">Unequip</button>
          <button id="equip-close-btn" style="
             border-radius:999px;
             border:0;
             background:rgba(255,255,255,.08);
             color:#fff;
             padding:6px 14px;
             font-size:13px;
          ">Close</button>
        </div>
      `;

      wrapper.appendChild(card);
      document.body.appendChild(wrapper);

      document.getElementById("equip-close-btn").onclick = () => {
        const el = document.getElementById("equip-inspect");
        el && el.remove();
      };

      document.getElementById("equip-unequip-btn").onclick = async () => {
        try {
          const res = await apiPost("/webapp/equipped/unequip", { slot: d.slot });
          if (res && res.ok) {
            this.state = res.data;
            this.render();
          } else {
            const tg = getTg();
            tg && tg.showAlert && tg.showAlert("Failed to unequip.");
          }
        } catch (err) {
          console.error("Equipped.unequip error", err);
          const tg = getTg();
          tg && tg.showAlert && tg.showAlert("Failed to unequip.");
        } finally {
          const el = document.getElementById("equip-inspect");
          el && el.remove();
        }
      };
    }
  };
})();
