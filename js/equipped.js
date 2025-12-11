// js/equipped.js – Character panel + Equipped view for Alpha Husky WebApp.
(function () {
  const API_BASE = window.API_BASE || ""; // zostaw puste, jeśli front i API są pod tym samym hostem

  function getTg() {
    return window.tg || (window.Telegram && window.Telegram.WebApp) || null;
  }

  // Uniwersalny POST tylko dla Equipped – nie zależy od globalnego apiPost
  async function equippedPost(path, payload) {
    const tg = getTg();
    const initData = (tg && tg.initData) || window.INIT_DATA || "";

    if (!initData) {
      console.warn(
        "Equipped: NO initData – to działa poprawnie tylko wewnątrz Telegram Mini App."
      );
      throw new Error("NO_INIT_DATA");
    }

    const resp = await fetch((API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ initData }, payload || {})),
    });

    let data = null;
    try {
      data = await resp.json();
    } catch (e) {
      console.error("Equipped: JSON parse error", e);
    }

    if (!resp.ok) {
      console.error("Equipped API error", resp.status, data);
      return data || { ok: false, reason: "http_" + resp.status };
    }
    return data;
  }

  // Ładowanie PNG postaci z backendu (legacy endpoint – /api/character-image)
  // Jeśli kiedyś przejdziesz na this.state.characterUrl, łatwo to podmienimy.
  async function loadCharacterPngInto(imgEl) {
    if (!imgEl) return;
    const tg = getTg();
    const initData = (tg && tg.initData) || window.INIT_DATA || "";
    if (!initData) {
      console.warn("Equipped: no initData for /api/character-image");
      return;
    }

    try {
      const resp = await fetch((API_BASE || "") + "/api/character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      if (!resp.ok) {
        console.error("Equipped: character-image resp not ok:", resp.status);
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      imgEl.src = url;

      if (window.__EquippedCharImgUrl) {
        URL.revokeObjectURL(window.__EquippedCharImgUrl);
      }
      window.__EquippedCharImgUrl = url;
    } catch (err) {
      console.error("Equipped: loadCharacterImage error", err);
    }
  }

  window.Equipped = {
    state: null,

    async open() {
      // Schowaj mapę i inne overlaye
      document
        .querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach((el) => {
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
      ";

      try {
        await this.refresh();
      } catch (e) {
        console.error("Equipped.open error", e);
        const tg = getTg();
        if (tg && tg.showAlert) {
          tg.showAlert("Error while loading equipped.");
        } else {
          alert("Error while loading equipped.");
        }
      }
    },

    async refresh() {
      try {
        const res = await equippedPost("/webapp/equipped/state", {});
        if (!res || !res.ok) {
          console.error("Equipped.state error:", res);
          const tg = getTg();
          tg && tg.showAlert && tg.showAlert("Failed to load equipped state.");
          return;
        }
        this.state = res.data; // { characterUrl, stats, slots, activeSets, totalBonus }
        this.render();
      } catch (err) {
        console.error("Equipped.refresh error", err);
        const tg = getTg();
        tg && tg.showAlert && tg.showAlert("Error while loading equipped.");
        throw err;
      }
    },

    render() {
      if (!this.state) return;

      const avatarBox = document.getElementById("equip-avatar");
      const slotsBox = document.getElementById("equip-slots");
      const setsBox = document.getElementById("equip-sets");
      const totalBox = document.getElementById("equip-total");

      const stats = this.state.stats || {};
      const level = stats.level || this.state.level || 1;
      const hp = stats.hp;
      const atk = stats.attack;
      const def = stats.defense;
      const agi = stats.agility;
      const luck = stats.luck;

      // --- LEFT: CHARACTER IMG + LEVEL + STATY ---
      if (avatarBox) {
        avatarBox.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
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
            <div style="font-size:13px;opacity:.95;">
              Level <b>${level}</b>
            </div>
            <div style="font-size:11px;opacity:.85;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
              <span>HP: <b>${hp ?? "?"}</b></span>
              <span>ATK: <b>${atk ?? "?"}</b></span>
              <span>DEF: <b>${def ?? "?"}</b></span>
              <span>AGI: <b>${agi ?? "?"}</b></span>
              <span>LUCK: <b>${luck ?? "?"}</b></span>
            </div>
          </div>
        `;

        const imgEl = document.getElementById("equipped-character-img");

        // Jeśli kiedyś będziesz używać characterUrl z backendu, można podmienić to na:
        // if (this.state.characterUrl) imgEl.src = this.state.characterUrl; else loadCharacterPngInto(imgEl);
        loadCharacterPngInto(imgEl);
      }

      // --- RIGHT: SLOTS LIST (dopasowane do nowego payloadu z backendu) ---
      if (slotsBox) {
        const slots = this.state.slots || [];
        const html = slots
          .map((slot) => {
            const isEmpty = !!slot.empty;
            const label = slot.label || slot.slot || "Slot";
            const itemName = isEmpty
              ? "Empty"
              : slot.name || slot.item_key || "Unknown";
            const rarity = slot.rarity
              ? `<span style="opacity:.8;">(${slot.rarity})</span>`
              : "";
            const subtitle = isEmpty
              ? "Empty slot"
              : slot.level
              ? `Lv ${slot.level}`
              : "";
            const bonuses = slot.bonusesText
              ? `<div style="font-size:11px;opacity:.7;">${slot.bonusesText}</div>`
              : "";

            // Ikonka – jeśli backend kiedyś doda icon, pokaże, inaczej placeholder
            const icon = slot.icon
              ? `<div style="width:32px;height:32px;border-radius:8px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
                   <img src="${slot.icon}" style="width:100%;height:100%;object-fit:contain;">
                 </div>`
              : `<div style="width:32px;height:32px;border-radius:8px;border:1px dashed rgba(255,255,255,.15);flex-shrink:0;"></div>`;

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
                        cursor:${isEmpty ? "default" : "pointer"};
                        opacity:1;
                      ">
                ${icon}
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
                    ${label}
                  </div>
                  <div style="font-size:12px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${itemName} ${rarity}
                  </div>
                  <div style="font-size:11px;opacity:.7;">
                    ${subtitle}
                  </div>
                  ${bonuses}
                </div>
              </button>
            `;
          })
          .join("");

        slotsBox.innerHTML = `
          <div style="font-size:13px;margin-bottom:6px;opacity:.9;">
            Tap a slot to inspect or unequip.
          </div>
          <div>${html}</div>
        `;

        // attach clicks
        slotsBox.querySelectorAll(".equip-slot-btn").forEach((btn) => {
          const slotKey = btn.getAttribute("data-slot");
          const slotState = (this.state.slots || []).find(
            (s) => s.slot === slotKey
          );
          if (!slotState) return;

          if (slotState.empty) {
            // empty slot -> tylko lekka haptics
            btn.onclick = () => {
              const tg = getTg();
              if (
                tg &&
                tg.HapticFeedback &&
                tg.HapticFeedback.impactOccurred
              ) {
                tg.HapticFeedback.impactOccurred("light");
              }
            };
          } else {
            btn.onclick = () => {
              this.inspect(slotKey);
            };
          }
        });
      }

      // --- ACTIVE SETS (nowy backend: activeSets) ---
      if (setsBox) {
        const sets = this.state.activeSets || this.state.active_sets || [];
        if (sets.length) {
          setsBox.innerHTML =
            "<b>Active set bonuses:</b> " +
            sets
              .map((s) => {
                return `${s.set} (${s.count})`;
              })
              .join(" • ");
        } else {
          setsBox.innerHTML = "";
        }
      }

      // --- TOTAL BONUS (nowy backend: totalBonus) ---
      if (totalBox) {
        const t = this.state.totalBonus || this.state.total_bonus || {};
        const keys = Object.keys(t);
        if (keys.length) {
          totalBox.innerHTML =
            "<b>Total gear bonus:</b> " +
            keys.map((k) => `${k}+${t[k]}`).join(", ");
        } else {
          totalBox.innerHTML = "";
        }
      }
    },

    async inspect(slot) {
      try {
        const res = await equippedPost("/webapp/equipped/inspect", { slot });
        if (!res || !res.ok) {
          const tg = getTg();
          tg && tg.showAlert && tg.showAlert("Failed to inspect item.");
          return;
        }
        const d = res.data;
        if (!d || d.empty) {
          const tg = getTg();
          tg &&
            tg.showAlert &&
            tg.showAlert("Nothing equipped in this slot.");
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
      const statsLines =
        Object.keys(stats)
          .map(
            (k) =>
              `<div style="font-size:13px;">▫ ${k}: <b>${stats[k]}</b></div>`
          )
          .join("") ||
        "<div style='font-size:13px;opacity:.8;'>No bonuses</div>";

      const starInfo = d.star_cap ? ` / ${d.star_cap}★ cap` : "";

      card.innerHTML = `
        <div style="display:flex;gap:12px;">
          ${
            iconUrl
              ? `
          <div style="width:72px;height:72px;border-radius:14px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
            <img src="${iconUrl}" style="width:100%;height:100%;object-fit:contain;">
          </div>`
              : ""
          }
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;font-weight:600;margin-bottom:2px;">${
              d.name || d.item_key
            }</div>
            <div style="font-size:12px;opacity:.8;margin-bottom:4px;">
               ${d.rarity ? d.rarity.toUpperCase() : ""} ${
        d.set ? "• " + d.set : ""
      }
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
          const res = await equippedPost("/webapp/equipped/unequip", {
            slot: d.slot,
          });
          if (res && res.ok) {
            this.state = res.data; // backend /unequip powinien zwracać ten sam payload co /state
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
    },
  };
})();
