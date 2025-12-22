// js/equipped.js – Character panel + Equipped view for Alpha Husky WebApp.
(function () {
  const API_BASE = window.API_BASE || "";
  const UNKNOWN_ICON = "/assets/items/unknown.png";

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

  function getInitData() {
    const tg = getTg();
    return (tg && tg.initData) || window.INIT_DATA || window.__INIT_DATA__ || "";
  }

  function haptic(kind) {
    try { getTg()?.HapticFeedback?.impactOccurred?.(kind || "light"); } catch (_) {}
  }

  function showAlert(msg) {
    const tg = getTg();
    if (tg?.showAlert) tg.showAlert(msg);
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
      #equip-hotspots{ position:absolute; inset:0; pointer-events:auto; }
      .equip-hotspot{
        position:absolute; pointer-events:auto;
        border:0; padding:0; margin:0;
        background:transparent; border-radius:18px;
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

  function toPctRatio(r) {
    return (r * 100).toFixed(4) + "%";
  }

  function sanitizeKey(k) {
    let s = String(k || "").trim().toLowerCase();
    if (!s) return "";
    s = s.replace(/\s+/g, "_");
    s = s.replace(/[^a-z0-9._\-]/g, "");
    return s;
  }

  function slotItemKey(slot) {
    // łapiemy wszystkie popularne warianty
    return (
      slot?.item_key ||
      slot?.itemKey ||
      slot?.key ||
      slot?.item ||
      slot?.data?.item_key ||
      slot?.data?.key ||
      slot?.item_data?.item_key ||
      ""
    );
  }

  function gearIconFromKey(key) {
    const k = sanitizeKey(key);
    if (!k) return UNKNOWN_ICON;

    // jeśli ktoś podał już ścieżkę
    if (k.startsWith("/assets/")) return k;
    if (/\.(png|webp|jpg|jpeg)$/i.test(k)) return "/assets/equip/" + k;

    // Twoje gear są w /assets/equip
    return "/assets/equip/" + k + ".png";
  }

  // POST JSON – używamy tego samego apiPost co reszta (Inventory)
  async function equippedPost(path, payload) {
    const apiPost = window.S?.apiPost || window.apiPost;
    if (typeof apiPost === "function") {
      return apiPost(path, payload || {});
    }

    // fallback (jeśli apiPost nie istnieje)
    const initData = getInitData();
    if (!initData) throw new Error("NO_INIT_DATA");

    const resp = await fetch((API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ init_data: initData, initData }, payload || {})),
    });

    let data = null;
    try { data = await resp.json(); } catch (_) {}
    if (!resp.ok) return data || { ok: false, reason: "http_" + resp.status };
    return data;
  }

  // PNG postaci (POST + blob)
  async function loadCharacterPngInto(imgEl, onLoaded) {
    if (!imgEl) return;
    const initData = getInitData();
    if (!initData) return;

    try {
      const resp = await fetch((API_BASE || "") + "/api/character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init_data: initData, initData }),
      });
      if (!resp.ok) return;

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      imgEl.onload = () => { try { onLoaded && onLoaded(); } catch (_) {} };
      imgEl.src = url;

      if (window.__EquippedCharImgUrl) URL.revokeObjectURL(window.__EquippedCharImgUrl);
      window.__EquippedCharImgUrl = url;
    } catch (err) {
      console.error("Equipped: loadCharacterImage error", err);
    }
  }

  // PNG karta itemu (POST + blob) — TO NAPRAWIA /api/item-card
  async function loadItemCardPngInto(imgEl, itemKey) {
    if (!imgEl) return;
    const initData = getInitData();
    const k = sanitizeKey(itemKey);
    if (!initData || !k) return;

    try {
      const resp = await fetch((API_BASE || "") + "/api/item-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init_data: initData, initData, item_key: k, key: k, item: k }),
      });
      if (!resp.ok) {
        // fallback: statyczna ikonka gear
        imgEl.src = gearIconFromKey(k);
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      // revoke poprzedniego url dla tego konkretnego img (żeby nie ciekło)
      const prev = imgEl.dataset._blobUrl;
      if (prev) {
        try { URL.revokeObjectURL(prev); } catch (_) {}
      }
      imgEl.dataset._blobUrl = url;

      imgEl.src = url;
    } catch (err) {
      console.error("Equipped: loadItemCardPngInto error", err);
      imgEl.src = gearIconFromKey(k);
    }
  }

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
                      onclick="window.Inventory?.open?.()">
                Inventory
              </button>
              <button type="button"
                      style="border-radius:999px;border:0;background:rgba(255,255,255,.08);color:#fff;padding:5px 12px;font-size:12px;cursor:pointer;"
                      onclick="window.Equipped?.refresh?.()">
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
      const res = await equippedPost("/webapp/equipped/state", {});
      if (!res?.ok) {
        console.error("Equipped.state error:", res);
        showAlert("Failed to load equipped state.");
        return;
      }
      this.state = res.data;
      this.render();
    },

    render() {
      if (!this.state) return;

      const avatarBox = document.getElementById("equip-avatar");
      const slotsBox  = document.getElementById("equip-slots");
      const setsBox   = document.getElementById("equip-sets");
      const totalBox  = document.getElementById("equip-total");

      const stats = this.state.stats || {};
      const level = stats.level || this.state.level || 1;

      // LEFT
      if (avatarBox) {
        avatarBox.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div class="equip-stage-wrap">
              <img id="equipped-character-img" alt="Character" style="width:100%;height:auto;display:block;" />
              <div id="equip-hotspots"></div>
            </div>

            <div style="font-size:13px;opacity:.95;">Level <b>${level}</b></div>

            <div style="font-size:11px;opacity:.85;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
              <span>HP: <b>${stats.hp ?? "?"}</b></span>
              <span>ATK: <b>${stats.attack ?? "?"}</b></span>
              <span>DEF: <b>${stats.defense ?? "?"}</b></span>
              <span>AGI: <b>${stats.agility ?? "?"}</b></span>
              <span>LUCK: <b>${stats.luck ?? "?"}</b></span>
            </div>

            <div style="font-size:13px;opacity:.9;">Tap a slot on the card (or below) to inspect / unequip.</div>
          </div>
        `;

        const imgEl = document.getElementById("equipped-character-img");
        loadCharacterPngInto(imgEl, () => this._mountHotspots());
        this._waitAndMountHotspots();
      }

      // RIGHT – ikony slotów jako statyczne /assets/equip
      if (slotsBox) {
        const slots = this.state.slots || [];
        const html = slots.map((slot) => {
          const isEmpty = !!slot.empty;
          const label = slot.label || slot.slot || "Slot";
          const key = sanitizeKey(slotItemKey(slot));
          const itemName = isEmpty ? "Empty" : (slot.name || key || "Unknown");
          const rarity = slot.rarity ? `<span style="opacity:.8;">(${slot.rarity})</span>` : "";
          const subtitle = isEmpty ? "Empty slot" : (slot.level ? `Lv ${slot.level}` : "");
          const bonuses = slot.bonusesText ? `<div style="font-size:11px;opacity:.7;">${slot.bonusesText}</div>` : "";

          const iconSrc = isEmpty ? UNKNOWN_ICON : gearIconFromKey(key);

          return `
            <button data-slot="${slot.slot}" class="equip-slot-btn" type="button"
                    style="
                      width:100%;display:flex;align-items:center;gap:10px;
                      background:rgba(10,10,25,.9);
                      border-radius:14px;border:1px solid rgba(255,255,255,.06);
                      padding:8px 10px;margin-bottom:8px;color:#fff;text-align:left;cursor:pointer;
                    ">
              <div style="width:32px;height:32px;border-radius:8px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
                <img src="${iconSrc}"
                     style="width:100%;height:100%;object-fit:contain;"
                     onerror="this.onerror=null;this.src='${UNKNOWN_ICON}';" />
              </div>

              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;">${label}</div>
                <div style="font-size:12px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${itemName} ${rarity}
                </div>
                <div style="font-size:11px;opacity:.7;">${subtitle}</div>
                ${bonuses}
              </div>
            </button>
          `;
        }).join("");

        slotsBox.innerHTML = `
          <div style="font-size:13px;margin-bottom:6px;opacity:.9;">Or tap a slot below:</div>
          <div>${html}</div>
        `;

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

      // SETS
      if (setsBox) {
        const sets = this.state.activeSets || this.state.active_sets || [];
        setsBox.innerHTML = sets.length
          ? ("<b>Active set bonuses:</b> " + sets.map((s) => `${s.set} (${s.count})`).join(" • "))
          : "";
      }

      // TOTAL BONUS
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

      const imgEl = document.getElementById("equipped-character-img");
      const layer = document.getElementById("equip-hotspots");
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

        const s = bySlot[slotKey] || { slot: slotKey, empty: true };
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
      const res = await equippedPost("/webapp/equipped/inspect", { slot });
      if (!res?.ok) return showAlert("Failed to inspect item.");

      const d = res.data;
      if (!d || d.empty) return showAlert("Nothing equipped in this slot.");
      this.renderInspect(d);
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

      const key = sanitizeKey(d.item_key || d.key || d.itemKey || d.item || "");
      const fallbackIcon = gearIconFromKey(key);

      const stats = d.stats || {};
      const statsLines =
        Object.keys(stats).map((k) => `<div style="font-size:13px;">▫ ${k}: <b>${stats[k]}</b></div>`).join("")
        || "<div style='font-size:13px;opacity:.8;'>No bonuses</div>";

      const starInfo = d.star_cap ? ` / ${d.star_cap}★ cap` : "";

      card.innerHTML = `
        <div style="display:flex;gap:12px;">
          <div style="width:72px;height:72px;border-radius:14px;overflow:hidden;background:rgba(0,0,0,.4);flex-shrink:0;">
            <img id="equip-inspect-img"
                 src="${fallbackIcon}"
                 style="width:100%;height:100%;object-fit:contain;"
                 onerror="this.onerror=null;this.src='${UNKNOWN_ICON}';" />
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;font-weight:600;margin-bottom:2px;">${d.name || key}</div>
            <div style="font-size:12px;opacity:.8;margin-bottom:4px;">
              ${d.rarity ? String(d.rarity).toUpperCase() : ""} ${d.set ? "• " + d.set : ""}
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
            border-radius:999px;border:1px solid rgba(255,255,255,.15);
            background:rgba(60,10,10,.9);color:#fff;padding:6px 14px;font-size:13px;cursor:pointer;
          ">Unequip</button>
          <button id="equip-close-btn" style="
            border-radius:999px;border:0;background:rgba(255,255,255,.08);
            color:#fff;padding:6px 14px;font-size:13px;cursor:pointer;
          ">Close</button>
        </div>
      `;

      wrapper.appendChild(card);
      document.body.appendChild(wrapper);

      // 🔥 TU jest fix: ładujemy Twoją generowaną kartę itemu jako blob (POST z init_data)
      const imgEl = document.getElementById("equip-inspect-img");
      loadItemCardPngInto(imgEl, key);

      document.getElementById("equip-close-btn").onclick = () => wrapper.remove();

      document.getElementById("equip-unequip-btn").onclick = async () => {
        try {
          const res = await equippedPost("/webapp/equipped/unequip", { slot: d.slot });
          if (res?.ok) {
            this.state = res.data;
            this.render();
          } else {
            showAlert("Failed to unequip.");
          }
        } finally {
          wrapper.remove();
        }
      };
    },
  };
})();
