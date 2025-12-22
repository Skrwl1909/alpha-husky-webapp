// js/equipped.js – Character panel + Equipped view for Alpha Husky WebApp. (FIXED ICONS + unified apiPost)
(function () {
  const API_BASE = window.API_BASE || ""; // zostaw puste, jeśli front i API są pod tym samym hostem

  // Twoje slot coords (px w układzie PNG)
  // Format: [x, y, w, h]
  const SLOT_COORDS = {
    helmet:  [530,  40, 175, 175],
    fangs:   [195, 100, 134, 134],
    armor:   [195, 300, 134, 134],
    ring:    [195, 489, 134, 134],
    weapon:  [435, 650, 156, 156],
    cloak:   [945, 100, 134, 134],
    collar:  [945, 285, 134, 134],
    gloves:  [945, 450, 134, 134],
    pet:     [945, 640, 134, 134],
    offhand: [682, 655, 156, 156],
  };

  function getTg() {
    return window.tg || (window.Telegram && window.Telegram.WebApp) || null;
  }

  function haptic(kind) {
    const tg = getTg();
    try {
      if (tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred) {
        tg.HapticFeedback.impactOccurred(kind || "light");
      }
    } catch (_) {}
  }

  function showAlert(msg) {
    const tg = getTg();
    if (tg && tg.showAlert) tg.showAlert(msg);
    else alert(msg);
  }

  function ensureEquippedStyles() {
    if (document.getElementById("equipped-styles")) return;
    const style = document.createElement("style");
    style.id = "equipped-styles";
    style.textContent = `
      .equip-stage-wrap{
        position:relative;
        width:100%;
        max-width:680px;
        margin:0 auto;
        border-radius:22px;
        overflow:hidden;
        background:radial-gradient(circle at 50% 0%, rgba(0,229,255,.22), rgba(0,0,0,.92));
        box-shadow:0 14px 40px rgba(0,0,0,.7);
      }
      #equip-hotspots{
        position:absolute;
        inset:0;
        pointer-events:auto;
      }
      .equip-hotspot{
        position:absolute;
        pointer-events:auto;
        border:0;
        padding:0;
        margin:0;
        background:transparent;
        border-radius:18px;
        -webkit-tap-highlight-color: transparent;
      }
      .equip-hotspot:active{
        box-shadow:0 0 0 2px rgba(0,229,255,.75) inset, 0 0 18px rgba(0,229,255,.25);
        background:rgba(0,229,255,.10);
      }
      .equip-hotspot.is-empty:active{
        box-shadow:0 0 0 2px rgba(255,255,255,.25) inset;
        background:rgba(255,255,255,.06);
      }
    `;
    document.head.appendChild(style);
  }

  // === INIT DATA (canonical) ==================================================
  function getInitData() {
    const tg = getTg();
    return (
      (tg && tg.initData) ||
      window.__INIT_DATA__ ||
      window.INIT_DATA ||
      window.INITDATA ||
      ""
    );
  }

  // === POST (use same apiPost as Inventory if available) ======================
  async function equippedPost(path, payload) {
    const apiPost = window.S?.apiPost || window.apiPost;
    if (typeof apiPost === "function") {
      return await apiPost(path, payload || {});
    }

    // fallback (should not happen if loader is correct)
    const initData = getInitData();
    if (!initData) {
      console.warn("Equipped: NO initData – działa poprawnie tylko wewnątrz Telegram Mini App.");
      throw new Error("NO_INIT_DATA");
    }

    const resp = await fetch((API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({}, payload || {}, { init_data: initData, initData })),
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      console.error("Equipped API error", resp.status, data);
      return data || { ok: false, reason: "http_" + resp.status };
    }
    return data;
  }

  // === ASSET NORMALIZATION (force app-origin for /assets/) ====================
  function _stripToAssetsPath(u) {
    if (!u) return "";
    u = String(u).trim();
    if (!u) return "";
    const idx = u.indexOf("/assets/");
    if (idx >= 0) return u.slice(idx);
    if (!/^https?:\/\//i.test(u) && !u.startsWith("/")) return "/" + u.replace(/^\.?\//, "");
    return u;
  }

  function _assetOnApp(u) {
    const p = _stripToAssetsPath(u);
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p; // non-assets absolute URL -> leave
    const base = window.location.origin;
    let url = base + (p.startsWith("/") ? p : ("/" + p));
    const v = window.WEBAPP_VER || "";
    if (v) url += (url.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(v);
    return url;
  }

  function _isGearObj(o) {
    // Equipped state slots always have .slot; inspect data has .slot too for gear
    if (!o) return false;
    if (o.type && String(o.type).toLowerCase() === "gear") return true;
    return !!o.slot;
  }

  function _iconCandidates(o) {
    const raw = o?.icon || o?.img || o?.image || o?.image_path || o?.imageUrl || "";
    const key = String(o?.item_key || o?.key || o?.itemKey || o?.item || "").trim().toLowerCase();
    const isGear = _isGearObj(o);

    const list = [];

    if (raw) list.push(_assetOnApp(raw));

    if (key) {
      if (isGear) {
        list.push(_assetOnApp(`/assets/equip/${key}.png`));
        list.push(_assetOnApp(`/assets/equip/${key}.webp`));
      } else {
        list.push(_assetOnApp(`/assets/items/${key}.png`));
        list.push(_assetOnApp(`/assets/items/${key}.webp`));
      }
    }

    list.push(_assetOnApp(`/assets/items/unknown.png`));
    return [...new Set(list.filter(Boolean))];
  }

  function _setImgWithFallback(imgEl, o) {
    if (!imgEl) return;
    const urls = _iconCandidates(o);
    let i = 0;

    imgEl.onerror = () => {
      i++;
      if (i < urls.length) imgEl.src = urls[i];
      else imgEl.onerror = null;
    };

    imgEl.src = urls[i] || _assetOnApp(`/assets/items/unknown.png`);
  }

  // === Character PNG ==========================================================
  async function loadCharacterPngInto(imgEl, onLoaded) {
    if (!imgEl) return;

    const initData = getInitData();
    if (!initData) {
      console.warn("Equipped: no initData for /api/character-image");
      return;
    }

    try {
      const resp = await fetch((API_BASE || "") + "/api/character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init_data: initData, initData }),
      });

      if (!resp.ok) {
        console.error("Equipped: character-image resp not ok:", resp.status);
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      imgEl.onload = () => {
        try { onLoaded && onLoaded(); } catch (_) {}
      };

      imgEl.src = url;

      if (window.__EquippedCharImgUrl) URL.revokeObjectURL(window.__EquippedCharImgUrl);
      window.__EquippedCharImgUrl = url;
    } catch (err) {
      console.error("Equipped: loadCharacterImage error", err);
    }
  }

  function toPctRatio(r) {
    return (r * 100).toFixed(4) + "%";
  }

  // === APP ===================================================================
  window.Equipped = {
    state: null,

    async open() {
      ensureEquippedStyles();

      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach((el) => {
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

      try {
        await this.refresh();
      } catch (e) {
        console.error("Equipped.open error", e);
        showAlert("Error while loading equipped.");
      }
    },

    async refresh() {
      try {
        const res = await equippedPost("/webapp/equipped/state", {});
        if (!res || !res.ok) {
          console.error("Equipped.state error:", res);
          showAlert("Failed to load equipped state.");
          return;
        }
        this.state = res.data;
        this.render();
      } catch (err) {
        console.error("Equipped.refresh error", err);
        showAlert("Error while loading equipped.");
        throw err;
      }
    },

    render() {
      if (!this.state) return;

      const avatarBox = document.getElementById("equip-avatar");
      const slotsBox  = document.getElementById("equip-slots");
      const setsBox   = document.getElementById("equip-sets");
      const totalBox  = document.getElementById("equip-total");

      const stats = this.state.stats || {};
      const level = stats.level || this.state.level || 1;
      const hp    = stats.hp;
      const atk   = stats.attack;
      const def   = stats.defense;
      const agi   = stats.agility;
      const luck  = stats.luck;

      // --- LEFT: PNG + HOTSPOTY ---
      if (avatarBox) {
        avatarBox.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div class="equip-stage-wrap">
              <img id="equipped-character-img"
                   alt="Character"
                   style="width:100%;height:auto;display:block;" />
              <div id="equip-hotspots"></div>
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
            <div style="font-size:13px;opacity:.9;">
              Tap a slot on the card (or below) to inspect / unequip.
            </div>
          </div>
        `;

        const imgEl = document.getElementById("equipped-character-img");
        loadCharacterPngInto(imgEl, () => this._mountHotspots());
        this._waitAndMountHotspots();
      }

      // --- RIGHT: lista slotów ---
      if (slotsBox) {
        const slots = this.state.slots || [];
        const html = slots.map((slot) => {
          const isEmpty  = !!slot.empty;
          const label    = slot.label || slot.slot || "Slot";
          const itemName = isEmpty ? "Empty" : (slot.name || slot.item_key || "Unknown");
          const rarity   = slot.rarity ? `<span style="opacity:.8;">(${slot.rarity})</span>` : "";
          const subtitle = isEmpty ? "Empty slot" : (slot.level ? `Lv ${slot.level}` : "");
          const bonuses  = slot.bonusesText
            ? `<div style="font-size:11px;opacity:.7;">${slot.bonusesText}</div>`
            : "";

          // ALWAYS render img tag; hydrate with fallback logic after mounting
          const icon = `
            <div style="width:32px;height:32px;border-radius:8px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
              <img class="equip-slot-icon"
                   data-slot="${slot.slot}"
                   alt=""
                   style="width:100%;height:100%;object-fit:contain;">
            </div>
          `;

          return `
            <button data-slot="${slot.slot}"
                    class="equip-slot-btn"
                    type="button"
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
                      cursor:pointer;
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
        }).join("");

        slotsBox.innerHTML = `
          <div style="font-size:13px;margin-bottom:6px;opacity:.9;">
            Or tap a slot below:
          </div>
          <div>${html}</div>
        `;

        // hydrate icons
        slotsBox.querySelectorAll("img.equip-slot-icon").forEach((img) => {
          const slotKey = img.getAttribute("data-slot");
          const slotState = (this.state.slots || []).find((s) => s.slot === slotKey);
          _setImgWithFallback(img, slotState || {});
        });

        // click handlers
        slotsBox.querySelectorAll(".equip-slot-btn").forEach((btn) => {
          const slotKey = btn.getAttribute("data-slot");
          const slotState = (this.state.slots || []).find((s) => s.slot === slotKey);
          if (!slotState) return;

          btn.onclick = () => {
            haptic("light");
            if (slotState.empty) return showAlert("Empty slot.");
            this.inspect(slotKey);
          };
        });
      }

      // --- ACTIVE SETS ---
      if (setsBox) {
        const sets = this.state.activeSets || this.state.active_sets || [];
        setsBox.innerHTML = sets.length
          ? ("<b>Active set bonuses:</b> " + sets.map((s) => `${s.set} (${s.count})`).join(" • "))
          : "";
      }

      // --- TOTAL BONUS ---
      if (totalBox) {
        const t = this.state.totalBonus || this.state.total_bonus || {};
        const keys = Object.keys(t);
        totalBox.innerHTML = keys.length
          ? ("<b>Total gear bonus:</b> " + keys.map((k) => `${k}+${t[k]}`).join(", "))
          : "";
      }
    },

    _waitAndMountHotspots() {
      let tries = 0;
      const tick = () => {
        tries++;
        const imgEl = document.getElementById("equipped-character-img");
        if (imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
          this._mountHotspots();
          return;
        }
        if (tries < 80) setTimeout(tick, 60);
      };
      tick();
    },

    _mountHotspots() {
      if (!this.state) return;

      const imgEl  = document.getElementById("equipped-character-img");
      const layer  = document.getElementById("equip-hotspots");
      if (!imgEl || !layer) return;

      const W = imgEl.naturalWidth || 0;
      const H = imgEl.naturalHeight || 0;
      if (!W || !H) return;

      const dbg = (localStorage.getItem("debug_equipped") === "1") || !!window.DEBUG_EQUIPPED;

      const slots = this.state.slots || [];
      const bySlot = {};
      slots.forEach((s) => (bySlot[s.slot] = s));

      layer.innerHTML = "";

      Object.keys(SLOT_COORDS).forEach((slotKey) => {
        const rect = SLOT_COORDS[slotKey];
        if (!rect) return;

        const s = bySlot[slotKey] || { slot: slotKey, empty: true, label: slotKey };
        const [x, y, w, h] = rect;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "equip-hotspot " + (s.empty ? "is-empty" : "is-equipped");
        btn.setAttribute("data-slot", slotKey);

        btn.style.left   = toPctRatio(x / W);
        btn.style.top    = toPctRatio(y / H);
        btn.style.width  = toPctRatio(w / W);
        btn.style.height = toPctRatio(h / H);

        if (dbg) {
          btn.style.outline = s.empty
            ? "1px dashed rgba(255,255,255,.35)"
            : "1px solid rgba(0,229,255,.65)";
          btn.style.background = s.empty
            ? "rgba(255,255,255,.05)"
            : "rgba(0,229,255,.08)";
        }

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          haptic("light");
          if (s.empty) return showAlert("Empty slot.");
          this.inspect(slotKey);
        });

        layer.appendChild(btn);
      });
    },

    async inspect(slot) {
      try {
        const res = await equippedPost("/webapp/equipped/inspect", { slot });
        if (!res || !res.ok) return showAlert("Failed to inspect item.");

        const d = res.data;
        if (!d || d.empty) return showAlert("Nothing equipped in this slot.");
        this.renderInspect(d);
      } catch (err) {
        console.error("Equipped.inspect error", err);
        showAlert("Error while loading item.");
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

      const stats = d.stats || {};
      const statsLines =
        Object.keys(stats).map((k) => `<div style="font-size:13px;">▫ ${k}: <b>${stats[k]}</b></div>`).join("")
        || "<div style='font-size:13px;opacity:.8;'>No bonuses</div>";

      const starInfo = d.star_cap ? ` / ${d.star_cap}★ cap` : "";

      card.innerHTML = `
        <div style="display:flex;gap:12px;">
          <div style="width:72px;height:72px;border-radius:14px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
            <img id="equip-inspect-icon" style="width:100%;height:100%;object-fit:contain;">
          </div>

          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;font-weight:600;margin-bottom:2px;">${d.name || d.item_key || d.key || "Item"}</div>
            <div style="font-size:12px;opacity:.8;margin-bottom:4px;">
               ${d.rarity ? String(d.rarity).toUpperCase() : ""} ${d.set ? "• " + d.set : ""}
            </div>
            <div style="font-size:12px;opacity:.8;">Slot: ${d.slot || "?"}</div>
            <div style="font-size:12px;opacity:.8;">Level: ${d.level ?? "?"}${starInfo}</div>
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
             cursor:pointer;
          ">Unequip</button>
          <button id="equip-close-btn" style="
             border-radius:999px;
             border:0;
             background:rgba(255,255,255,.08);
             color:#fff;
             padding:6px 14px;
             font-size:13px;
             cursor:pointer;
          ">Close</button>
        </div>
      `;

      wrapper.appendChild(card);
      document.body.appendChild(wrapper);

      // hydrate icon with fallback chain (equip -> items -> unknown)
      const ii = document.getElementById("equip-inspect-icon");
      _setImgWithFallback(ii, d || {});

      document.getElementById("equip-close-btn").onclick = () => {
        const el = document.getElementById("equip-inspect");
        el && el.remove();
      };

      document.getElementById("equip-unequip-btn").onclick = async () => {
        try {
          const res = await equippedPost("/webapp/equipped/unequip", { slot: d.slot });
          if (res && res.ok) {
            this.state = res.data;
            this.render();
          } else {
            showAlert("Failed to unequip.");
          }
        } catch (err) {
          console.error("Equipped.unequip error", err);
          showAlert("Failed to unequip.");
        } finally {
          const el = document.getElementById("equip-inspect");
          el && el.remove();
        }
      };
    },
  };
})();
