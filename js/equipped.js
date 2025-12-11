// js/equipped.js – wersja ostateczna 2025 – Twój design + moja niezawodność
window.Equipped = (function () {
  const tg = window.Telegram?.WebApp;
  const realInitData = tg?.initData || "";
  const debugInitData = "query_id=AAHdF6eQAAAAAN0Xp5Aow8rW&user=%7B%22id%22%3A749352125%2C%22first_name%22%3A%22Alpha%22%2C%22last_name%22%3A%22Husky%22%2C%22username%22%3A%22alphahusky%22%7D&auth_date=1737048600&hash=examplehash1234567890";
  const initData = realInitData || debugInitData;

  // Uniwersalna funkcja do API – działa wszędzie
  async function api(path, data = {}) {
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData
        },
        body: JSON.stringify({ ...data, init_data: initData })
      });
      return res.ok ? await res.json() : { ok: false };
    } catch (e) {
      console.error("API error:", e);
      return { ok: false };
    }
  }

  window.Equipped = {
    state: null,

    async open() {
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
                      onclick="window.Inventory?.open?.()">
                Inventory
              </button>
              <button type="button"
                      style="border-radius:999px;border:0;background:rgba(255,255,255,.08);color:#fff;padding:5px 12px;font-size:12px;cursor:pointer;"
                      onclick="window.Equipped.refresh()">
                Refresh
              </button>
            </div>
          </div>
          <div id="equip-main" style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
            <div id="equip-avatar" style="flex:1;min-width:260px;text-align:center;">
              <div style="font-size:13px;opacity:.8;padding:24px 8px;">Loading character...</div>
            </div>
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
      const res = await api("/webapp/equipped/state");
      if (!res || !res.ok) {
        tg?.showAlert?.("Error while loading equipped.");
        return;
      }
      this.state = res.data || res; // na wypadek różnej struktury odpowiedzi
      this.render();
    },

    render() {
      if (!this.state) return;

      const avatarBox = document.getElementById("equip-avatar");
      const slotsBox = document.getElementById("equip-slots");
      const setsBox = document.getElementById("equip-sets");
      const totalBox = document.getElementById("equip-total");

      // === TWOJA PIĘKNA LEWA STRONA Z POSTACIĄ ===
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
        fetch("/webapp/character/image", {
          method: "POST",
          headers: { "X-Telegram-Init-Data": initData },
          body: JSON.stringify({ init_data: initData })
        })
        .then(r => r.blob())
        .then(b => URL.createObjectURL(b))
        .then(url => imgEl.src = url)
        .catch(() => imgEl.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYwIiBoZWlnaHQ9IjI2MCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzIyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+");
      }

      // === TWOJA PIĘKNA PRAWA STRONA ZE SLOTAMI ===
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
          const lockBadge = unlocked ? "" : `<span style="font-size:11px;opacity:.8;margin-left:6px;">Lock Lv ${slot.level_req}</span>`;
          const subtitle = slot.item_key
            ? `Lv ${slot.level || 1}${slot.is_pet ? " • Pet" : ""}`
            : (unlocked ? "Empty slot" : "Locked");

          return `
            <button data-slot="${slot.slot}"
                    class="equip-slot-btn"
                    style="width:100%;display:flex;align-items:center;gap:10px;background:rgba(10,10,25,.9);border-radius:14px;border:1px solid rgba(255,255,255,.06);padding:8px 10px;margin-bottom:8px;color:#fff;text-align:left;cursor:${unlocked?'pointer':'default'};opacity:${unlocked?1:.5};">
              ${icon}
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
                  ${slot.label}${lockBadge}
                </div>
                <div style="font-size:12px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${itemName} ${rarity}
                </div>
                <div style="font-size:11px;opacity:.7;">${subtitle}</div>
              </div>
            </button>`;
        }).join("");

        slotsBox.innerHTML = `
          <div style="font-size:13px;margin-bottom:6px;opacity:.9;">Tap a slot to inspect or unequip.</div>
          <div>${html}</div>`;

        // Klikanie w sloty
        slotsBox.querySelectorAll(".equip-slot-btn").forEach(btn => {
          const slot = btn.dataset.slot;
          const slotState = slots.find(s => s.slot === slot);
          if (!slotState?.unlocked) return;

          btn.onclick = () => {
            if (!slotState.item_key) {
              tg?.HapticFeedback?.impactOccurred?.("light");
            } else {
              this.inspect(slot);
            }
          };
        });
      }

      // Set bonuses & total bonus – Twoje oryginalne
      if (setsBox && (this.state.active_sets || []).length) {
        setsBox.innerHTML = "<b>Active set bonuses:</b> " + this.state.active_sets.map(s => `${s.set} (${s.count})`).join(" • ");
      } else setsBox && (setsBox = "";

      if (totalBox && Object.keys(this.state.total_bonus || {}).length) {
        totalBox.innerHTML = "<b>Total gear bonus:</b> " + Object.entries(this.state.total_bonus).map(([k,v])=>`${k}+${v}`).join(", ");
      } else totalBox && (totalBox.innerHTML = "");
    },

    // === TWÓJ PIĘKNY MODAL INSPECT + UNEQUIP ===
    async inspect(slot) {
      const res = await api("/webapp/equipped/inspect", { slot });
      if (!res?.ok || res.empty) {
        tg?.showAlert?.("Nothing equipped in this slot.");
        return;
      }
      const d = res.data;

      const old = document.getElementById("equip-inspect");
      if (old) old.remove();

      const wrapper = document.createElement("div");
      wrapper.id = "equip-inspect";
      wrapper.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:999;display:flex;align-items:center;justify-content:center;";
      
      const card = document.createElement("div");
      card.style.cssText = "background:rgba(10,10,25,.98);border-radius:18px;border:1px solid rgba(255,255,255,.12);max-width:420px;width:90%;padding:16px;color:#fff;font-family:system-ui;box-shadow:0 18px 60px rgba(0,0,0,.6);";

      const iconUrl = d.icon || "";
      const statsLines = Object.entries(d.stats || {}).map(([k,v])=>`<div style="font-size:13px;">▫ ${k}: <b>${v}</b></div>`).join("") || "<div style='font-size:13px;opacity:.8;'>No bonuses</div>";
      const starInfo = d.star_cap ? ` / ${d.star_cap}★ cap` : "";

      card.innerHTML = `
        <div style="display:flex;gap:12px;">
          ${iconUrl ? `<div style="width:72px;height:72px;border-radius:14px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;"><img src="${iconUrl}" style="width:100%;height:100%;object-fit:contain;"></div>` : ""}
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:600;">${d.name || d.item_key}</div>
            <div style="font-size:12px;opacity:.8;">${d.rarity?.toUpperCase()||""} ${d.set ? "• "+d.set : ""}</div>
            <div style="font-size:12px;opacity:.8;">Slot: ${d.slot}</div>
            <div style="font-size:12px;opacity:.8;">Level: ${d.level}${starInfo}</div>
          </div>
        </div>
        <div style="font-size:12px;opacity:.85;margin:8px 0;">${d.desc || ""}</div>
        <div style="border-top:1px solid rgba(255,255,255,.08);margin:8px 0 6px;"></div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Stats</div>
        ${statsLines}
        <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
          <button id="equip-unequip-btn" style="border-radius:999px;border:1px solid rgba(255,255,255,.15);background:rgba(60,10,10,.9);color:#fff;padding:6px 14px;font-size:13px;">Unequip</button>
          <button id="equip-close-btn" style="border-radius:999px;border:0;background:rgba(255,255,255,.08);color:#fff;padding:6px 14px;font-size:13px;">Close</button>
        </div>
      `;

      wrapper.appendChild(card);
      document.body.appendChild(wrapper);

      document.getElementById("equip-close-btn").onclick = () => wrapper.remove();
      document.getElementById("equip-unequip-btn").onclick = async () => {
        const r = await api("/webapp/equipped/unequip", { slot });
        if (r?.ok) {
          this.state = r.data || this.state;
          this.render();
          wrapper.remove();
          tg?.showAlert?.("Item unequipped");
        } else {
          tg?.showAlert?.("Failed to unequip");
        }
      };
    }
  };
return {
    open,
    refresh,
    render,
    inspect
  };
})();
