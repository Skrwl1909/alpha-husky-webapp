// js/inventory.js — UNEQUIPPED ONLY (clean)
// Inventory modal shows ONLY items available in inventory (not equipped).
// Equipped management (UNEQ/UPGRADE) should live in Equipped panel.

window.Inventory = {
  items: [],
  activeEffects: [],
  equipped: {}, // unused here now (kept for compatibility)
  equippedBySlot: {},
  resources: { bones: 0, scrap: 0, rune_dust: 0 },
  currentTab: "all",
  _tgBackHandler: null,

  // ✅ nav-stack integration
  _navId: "inventory",
  _navRegistered: false,
  _backLock: false,

  // ---- small utils ----
  _mkRunId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  },

  _salvageYieldByRarity: {
    common: { scrap: 1, rune_dust: 0 },
    uncommon: { scrap: 2, rune_dust: 0 },
    rare: { scrap: 4, rune_dust: 1 },
    epic: { scrap: 8, rune_dust: 2 },
    legendary: { scrap: 16, rune_dust: 4 },
    mythic: { scrap: 24, rune_dust: 6 },
  },

  _salvageReasonText(reason, name = "item") {
    const r = String(reason || "").trim();
    const label = String(name || "item");
    const map = {
      locked_item: `${label} is locked and cannot be salvaged.`,
      equipped_item: `${label} is equipped and cannot be salvaged.`,
      slot_pet_blocked: `Pet slot items cannot be salvaged.`,
      slot_rune_blocked: `Rune items cannot be salvaged.`,
      slot_badge_blocked: `Badge items cannot be salvaged.`,
      moonstone_orb_blocked: `Moonstone Orb cannot be salvaged.`,
      type_consumable_blocked: `Consumables cannot be salvaged.`,
      type_box_blocked: `Boxes cannot be salvaged.`,
      type_material_blocked: `Materials cannot be salvaged.`,
      type_materials_blocked: `Materials cannot be salvaged.`,
      type_shard_blocked: `Shards cannot be salvaged.`,
      type_shards_blocked: `Shards cannot be salvaged.`,
      type_cosmetic_blocked: `Cosmetics cannot be salvaged.`,
      type_status_blocked: `Status items cannot be salvaged.`,
      type_support_blocked: `Support items cannot be salvaged.`,
      type_holder_blocked: `Holder items cannot be salvaged.`,
      type_founder_blocked: `Founder items cannot be salvaged.`,
      type_exclusive_blocked: `Exclusive items cannot be salvaged.`,
      category_consumable_blocked: `Consumables cannot be salvaged.`,
      category_box_blocked: `Boxes cannot be salvaged.`,
      category_material_blocked: `Materials cannot be salvaged.`,
      category_materials_blocked: `Materials cannot be salvaged.`,
      category_shard_blocked: `Shards cannot be salvaged.`,
      category_shards_blocked: `Shards cannot be salvaged.`,
      category_cosmetic_blocked: `Cosmetics cannot be salvaged.`,
      category_status_blocked: `Status items cannot be salvaged.`,
      category_support_blocked: `Support items cannot be salvaged.`,
      category_holder_blocked: `Holder items cannot be salvaged.`,
      category_founder_blocked: `Founder items cannot be salvaged.`,
      category_exclusive_blocked: `Exclusive items cannot be salvaged.`,
      exclusive_flag_blocked: `Exclusive items cannot be salvaged.`,
      founder_flag_blocked: `Founder items cannot be salvaged.`,
      holder_flag_blocked: `Holder items cannot be salvaged.`,
      supporter_flag_blocked: `Support items cannot be salvaged.`,
      support_flag_blocked: `Support items cannot be salvaged.`,
      not_salvageable_slot: `${label} cannot be salvaged.`,
      not_salvageable_type: `${label} cannot be salvaged.`,
      not_salvageable_rarity: `${label} cannot be salvaged.`,
      unknown_item: `${label} cannot be salvaged.`,
      malformed_item: `${label} cannot be salvaged.`,
      not_owned: `${label} is no longer in inventory.`,
      ledger_error: `Salvage failed. Please try again.`,
    };
    return map[r] || `${label} cannot be salvaged.`;
  },

  _toast(msg) {
    try {
      if (window.toast) return window.toast(msg);
      if (window.T?.toast) return window.T.toast(msg);
    } catch (_) {}
    try {
      Telegram?.WebApp?.showAlert?.(String(msg));
    } catch (_) {
      console.log("[toast]", msg);
    }
  },

  _showProgressToast(config, fallbackText) {
    const input = (config && typeof config === "object") ? config : {};
    try {
      if (window.AlphaToast && typeof window.AlphaToast.showProgressSummary === "function") {
        if (window.AlphaToast.showProgressSummary({
          type: input.type || "success",
          title: input.title || "Inventory Updated",
          lines: Array.isArray(input.lines) ? input.lines.filter(Boolean) : [],
          message: input.message || "",
          meta: input.meta || "",
          ttl: input.ttl || 3800,
        })) {
          return true;
        }
      }
    } catch (_) {}
    if (fallbackText) this._toast(fallbackText);
    return false;
  },

  _pushProgressLine(lines, text) {
    const safe = String(text || "").replace(/\s+/g, " ").trim();
    if (!safe || lines.includes(safe)) return;
    lines.push(safe);
  },

  _buildSalvageToastLines(source, options = {}) {
    const payload = (source && typeof source === "object") ? source : {};
    const lines = [];
    const count = this._toInt(options.salvagedCount ?? payload.quantity ?? payload.qty ?? payload.count, 0);
    if (count > 0) this._pushProgressLine(lines, `Salvaged ${count} items`);
    const scrap = this._toInt(payload.scrap ?? payload.resources?.scrap ?? payload.reward?.scrap ?? payload.rewards?.scrap, 0);
    const runeDust = this._toInt(payload.rune_dust ?? payload.runeDust ?? payload.resources?.rune_dust ?? payload.reward?.rune_dust ?? payload.rewards?.rune_dust, 0);
    if (scrap > 0) this._pushProgressLine(lines, `Scrap +${scrap}`);
    if (runeDust > 0) this._pushProgressLine(lines, `Rune Dust +${runeDust}`);
    const signalDelta = this._toInt(payload.signalPowerDelta ?? payload.signal_power_delta ?? payload.progression?.signalPowerDelta ?? payload.progression_v1?.signalPowerDelta, 0);
    if (signalDelta > 0) this._pushProgressLine(lines, `Signal Power +${signalDelta}`);
    if (!lines.length) {
      const fallback = String(options.fallbackText || payload.message || "").trim();
      if (fallback) this._pushProgressLine(lines, fallback);
    }
    return lines;
  },

  _perfAction(name, startedAt) {
    try { window.__ahPerf?.action?.(name, startedAt); } catch (_) {}
  },

  _esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  _safeText(value, fallback = "") {
    const text = String(value ?? "").trim();
    return text || String(fallback || "");
  },

  _toInt(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : Math.trunc(Number(fallback) || 0);
  },

  _qty(item) {
    return Math.max(
      1,
      this._toInt(
        item?.quantity ?? item?.amount ?? item?.stackQty ?? item?.qty ?? 1,
        1
      )
    );
  },

  _rarityMeta(rarity) {
    const key = String(rarity || "common").toLowerCase();
    return {
      common: { color: "#9aa0aa", glow: "rgba(154,160,170,.28)", label: "Common" },
      uncommon: { color: "#5fe3a1", glow: "rgba(95,227,161,.30)", label: "Uncommon" },
      rare: { color: "#64b5ff", glow: "rgba(100,181,255,.30)", label: "Rare" },
      epic: { color: "#b286ff", glow: "rgba(178,134,255,.30)", label: "Epic" },
      legendary: { color: "#ffd76a", glow: "rgba(255,215,106,.34)", label: "Legendary" },
      mythic: { color: "#ff79c8", glow: "rgba(255,121,200,.32)", label: "Mythic" },
    }[key] || { color: "#9aa0aa", glow: "rgba(154,160,170,.28)", label: this._safeText(rarity, "Common") };
  },

  _statLabel(key) {
    const norm = String(key || "").trim().toLowerCase();
    const map = {
      strength: "STR",
      str: "STR",
      defense: "DEF",
      def: "DEF",
      vitality: "VIT",
      vit: "VIT",
      agility: "AGI",
      agi: "AGI",
      intelligence: "INT",
      int: "INT",
      luck: "LCK",
      hp: "HP",
      dmg: "DMG",
      atk: "ATK",
      crit_chance: "CRIT",
      crit_dmg: "CRIT DMG",
      dodge: "DODGE",
      speed: "SPD",
    };
    return map[norm] || String(key || "").slice(0, 12).toUpperCase();
  },

  _normalizeStats(stats) {
    const src = (stats && typeof stats === "object") ? stats : {};
    const out = {};
    for (const [k, v] of Object.entries(src)) {
      const num = Number(v);
      if (!Number.isFinite(num)) continue;
      out[String(k)] = Math.trunc(num);
    }
    return out;
  },

  _orderedStatKeys(statsA, statsB = {}) {
    const pref = ["hp", "strength", "str", "defense", "def", "vitality", "vit", "agility", "agi", "intelligence", "int", "luck", "dmg", "atk", "crit_chance", "crit_dmg", "dodge", "speed"];
    const prefIdx = new Map(pref.map((k, i) => [k, i]));
    return Array.from(new Set([...Object.keys(statsA || {}), ...Object.keys(statsB || {})])).sort((a, b) => {
      const ia = prefIdx.has(String(a).toLowerCase()) ? prefIdx.get(String(a).toLowerCase()) : 999;
      const ib = prefIdx.has(String(b).toLowerCase()) ? prefIdx.get(String(b).toLowerCase()) : 999;
      if (ia !== ib) return ia - ib;
      return String(a).localeCompare(String(b));
    });
  },

  _fmtDelta(value) {
    const num = this._toInt(value, 0);
    if (num > 0) return `+${num}`;
    if (num < 0) return `${num}`;
    return "0";
  },

  _deltaTone(value) {
    const num = this._toInt(value, 0);
    if (num > 0) return { bg: "rgba(80, 220, 160, .14)", fg: "#7ef2bf", border: "rgba(80,220,160,.28)" };
    if (num < 0) return { bg: "rgba(255, 99, 132, .14)", fg: "#ff98ac", border: "rgba(255,99,132,.26)" };
    return { bg: "rgba(255,255,255,.06)", fg: "#c8cfdb", border: "rgba(255,255,255,.08)" };
  },

  _itemDescription(item) {
    return this._safeText(
      item?.description || item?.desc || item?.flavor || item?.usedFor,
      ""
    );
  },

  _excerpt(text, maxLen = 78) {
    const raw = this._safeText(text, "");
    if (!raw || raw.length <= maxLen) return raw;
    return `${raw.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
  },

  _useMeta(item) {
    return (item && typeof item.useMeta === "object" && item.useMeta) ? item.useMeta : {};
  },

  _activeEffectsFromResponse(res) {
    return Array.isArray(res?.activeEffects) ? res.activeEffects : [];
  },

  _effectPill(effect) {
    const label = this._safeText(effect?.name, "Effect");
    const desc = this._safeText(effect?.description, label);
    const uses = this._toInt(effect?.remainingUses, 0);
    const remain = this._toInt(effect?.remainingSec, 0);
    let tail = "";
    if (uses > 0) tail = `${uses} use${uses === 1 ? "" : "s"} left`;
    else if (remain > 0) tail = `${remain}s left`;

    return `
      <div style="padding:10px 12px;border-radius:16px;background:linear-gradient(180deg,rgba(20,32,48,.96),rgba(10,17,28,.94));border:1px solid rgba(126,198,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
          <div style="min-width:0;">
            <div style="font-size:12px;font-weight:900;color:#f2f8ff;letter-spacing:.03em;">${this._esc(label)}</div>
            <div style="margin-top:4px;font-size:11px;line-height:1.45;color:#bcd4ea;">${this._esc(desc)}</div>
          </div>
          ${tail ? `<div style="flex:0 0 auto;padding:5px 8px;border-radius:999px;background:rgba(126,198,255,.12);border:1px solid rgba(126,198,255,.18);font-size:10px;font-weight:800;color:#dff4ff;">${this._esc(tail)}</div>` : ""}
        </div>
      </div>
    `;
  },

  _renderActiveEffectsPanel() {
    const host = document.getElementById("inventoryEffectsPanel");
    if (!host) return;

    const effects = Array.isArray(this.activeEffects) ? this.activeEffects : [];
    if (!effects.length) {
      host.style.display = "none";
      host.innerHTML = "";
      return;
    }

    host.style.display = "block";
    host.innerHTML = `
      <div style="margin:0 0 16px 0;padding:14px;border-radius:20px;background:linear-gradient(180deg,rgba(18,28,44,.94),rgba(8,13,23,.92));border:1px solid rgba(126,198,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 16px 30px rgba(0,0,0,.18);">
        <div style="font-size:11px;letter-spacing:.7px;color:#8fb9dd;text-transform:uppercase;margin-bottom:10px;">Active Effects</div>
        <div style="display:grid;gap:8px;">${effects.map((effect) => this._effectPill(effect)).join("")}</div>
      </div>
    `;
  },

  _handleRedirectTarget(target, message) {
    const key = this._safeText(target, "").toLowerCase();
    if (key === "pet_passive") {
      try { window.MyPets?.open?.(); } catch (_) {}
      if (message) this._toast(message);
      return true;
    }
    return false;
  },


  _isOpenableBox(itemOrKey) {
    const key = typeof itemOrKey === "string"
      ? itemOrKey
      : (itemOrKey?.key || itemOrKey?.item_key || itemOrKey?.item || "");
    return ["mystery_box", "premium_box"].includes(String(key || "").trim().toLowerCase());
  },

  _boxOwnedCount(key) {
    const item = this.findByKey(key);
    return item ? this._qty(item) : 0;
  },

  _boxMood(key) {
    return String(key || "").toLowerCase() === "premium_box"
      ? {
          bg: "radial-gradient(circle at 50% 0%,rgba(255,215,106,.18),transparent 34%),linear-gradient(180deg,rgba(21,19,31,.98),rgba(7,9,18,.98))",
          border: "rgba(255,215,106,.30)",
          glow: "0 26px 72px rgba(255,177,66,.20)",
          accent: "#ffd76a",
        }
      : {
          bg: "radial-gradient(circle at 50% 0%,rgba(85,214,255,.16),transparent 34%),linear-gradient(180deg,rgba(15,24,34,.98),rgba(7,10,18,.98))",
          border: "rgba(126,198,255,.24)",
          glow: "0 24px 62px rgba(62,184,255,.16)",
          accent: "#7fdcff",
        };
  },

  _rewardTone(reward) {
    const notable = !!reward?.notable;
    const chip = this._safeText(reward?.chip, "Reward");
    if (notable) return { bg: "rgba(255,215,106,.14)", border: "rgba(255,215,106,.34)", fg: "#ffe59a", chip };
    if (chip === "Shards") return { bg: "rgba(126,198,255,.12)", border: "rgba(126,198,255,.24)", fg: "#dff4ff", chip };
    if (chip === "Material" || chip === "Resource") return { bg: "rgba(95,227,161,.12)", border: "rgba(95,227,161,.23)", fg: "#c9ffe6", chip };
    return { bg: "rgba(255,255,255,.07)", border: "rgba(255,255,255,.12)", fg: "#edf4ff", chip };
  },

  _boxRevealButtons(reveal, pending = false) {
    const key = this._safeText(reveal?.boxKey, "");
    const remaining = this._toInt(reveal?.remaining, 0);
    const batchMax = Math.max(1, this._toInt(reveal?.batchMax, 20));
    const openAllLabel = this._safeText(reveal?.openAllLabel, remaining > batchMax ? `Open up to ${batchMax}` : "Open all");
    const disabled = pending ? "disabled" : "";
    const cursor = pending ? "default" : "pointer";
    return `
      <button type="button" onclick="Inventory.closeBoxReveal()" style="flex:1 1 110px;padding:13px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:#edf4ff;font-weight:900;cursor:pointer;">Continue</button>
      ${remaining >= 1 ? `<button type="button" ${disabled} onclick="Inventory.openAnotherBox('${this._esc(key)}')" style="flex:1 1 140px;padding:13px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#7fdcff,#2d8dff);color:#06111c;font-weight:950;cursor:${cursor};opacity:${pending ? '.68' : '1'};">${pending ? 'Opening...' : 'Open another'}</button>` : ""}
      ${remaining > 1 ? `<button type="button" ${disabled} onclick="Inventory.openAllBoxes('${this._esc(key)}')" style="flex:1 1 130px;padding:13px 14px;border-radius:14px;border:1px solid rgba(255,215,106,.34);background:rgba(255,215,106,.13);color:#ffe59a;font-weight:950;cursor:${cursor};opacity:${pending ? '.68' : '1'};">${pending ? 'Opening...' : this._esc(openAllLabel)}</button>` : ""}
    `;
  },

  _renderBoxReveal(reveal, pending = false) {
    const data = (reveal && typeof reveal === "object") ? reveal : {};
    const key = this._safeText(data.boxKey, "mystery_box");
    const mood = this._boxMood(key);
    const rewards = Array.isArray(data.rewards) ? data.rewards : [];
    const lines = Array.isArray(data.lines) ? data.lines : [];
    const fallbackRewards = rewards.length ? rewards : lines.map((line) => ({ name: line, quantity: 1, chip: "Reward", line }));
    const rewardCards = fallbackRewards.map((reward) => {
      const tone = this._rewardTone(reward);
      const name = this._safeText(reward?.name || reward?.line, "Reward");
      const qty = this._toInt(reward?.quantity, 1);
      const qtyText = qty > 1 ? `x${qty}` : "x1";
      return `
        <div style="padding:14px;border-radius:16px;background:${tone.bg};border:1px solid ${tone.border};box-shadow:inset 0 1px 0 rgba(255,255,255,.05);">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div style="min-width:0;">
              <div style="font-size:18px;line-height:1.15;font-weight:950;color:${tone.fg};word-break:break-word;">${this._esc(name)}</div>
              <div style="margin-top:8px;display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.10);font-size:10px;font-weight:900;text-transform:uppercase;color:#d8e8f8;letter-spacing:.45px;">${this._esc(tone.chip)}</div>
            </div>
            <div style="flex:0 0 auto;font-size:18px;font-weight:950;color:#fff;">${this._esc(qtyText)}</div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div id="boxRevealOverlay" onclick="if(event.target===this) Inventory.closeBoxReveal()" style="position:fixed;inset:0;z-index:16000;display:flex;align-items:flex-end;justify-content:center;padding:16px;background:rgba(3,6,12,.78);backdrop-filter:blur(10px);">
        <div role="dialog" aria-modal="true" style="width:min(520px,100%);max-height:86vh;overflow:auto;border-radius:26px 26px 20px 20px;background:${mood.bg};border:1px solid ${mood.border};box-shadow:${mood.glow},0 24px 70px rgba(0,0,0,.52);animation:ahBoxRevealIn .18s ease-out;">
          <style>
            @keyframes ahBoxRevealIn { from { opacity:.4; transform:translateY(14px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }
            @keyframes ahRewardPop { from { transform:scale(.98); } to { transform:scale(1); } }
          </style>
          <div style="padding:20px 18px 16px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08);">
            <div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${mood.accent};font-weight:950;">LOOT REVEAL</div>
            <div style="margin-top:8px;font-size:22px;line-height:1.08;font-weight:950;color:#f7fbff;">${this._esc(data.title || "BOX OPENED")}</div>
            <div style="margin-top:8px;font-size:13px;color:#afc2d5;">${this._esc(data.subtitle || "Pack secured")}</div>
            ${data.partialFailure ? `<div style="margin:12px auto 0;max-width:38ch;padding:9px 10px;border-radius:12px;background:rgba(255,120,120,.12);border:1px solid rgba(255,120,120,.22);font-size:12px;line-height:1.45;color:#ffd7dc;">${this._esc(data.partialFailure)}</div>` : ""}
          </div>
          <div style="padding:16px 16px 8px;display:grid;gap:10px;animation:ahRewardPop .2s ease-out;">
            ${rewardCards || `<div style="padding:14px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);color:#dbe7f5;font-weight:800;text-align:center;">No loot</div>`}
          </div>
          <div id="boxRevealActions" style="padding:14px 16px 18px;display:flex;gap:10px;flex-wrap:wrap;">${this._boxRevealButtons(data, pending)}</div>
        </div>
      </div>
    `;
  },

  _showBoxReveal(reveal, pending = false) {
    this._lastBoxReveal = reveal;
    const existing = document.getElementById("boxRevealOverlay");
    const html = this._renderBoxReveal(reveal, pending);
    if (existing) {
      existing.outerHTML = html;
      return;
    }
    document.body.insertAdjacentHTML("beforeend", html);
  },

  _setBoxRevealPending(pending) {
    if (!this._lastBoxReveal) return;
    this._showBoxReveal(this._lastBoxReveal, !!pending);
  },

  closeBoxReveal() {
    const overlay = document.getElementById("boxRevealOverlay");
    if (overlay) overlay.remove();
  },

  _bonePackStorageKey: "ah.bonePack.pending.v1",

  _loadBonePackRequest() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(this._bonePackStorageKey) || "null");
      return parsed && typeof parsed === "object" && parsed.key ? parsed : null;
    } catch (_) {
      return null;
    }
  },

  _saveBonePackRequest(record) {
    try { sessionStorage.setItem(this._bonePackStorageKey, JSON.stringify(record || {})); } catch (_) {}
  },

  _clearBonePackRequest() {
    try { sessionStorage.removeItem(this._bonePackStorageKey); } catch (_) {}
  },

  _renderBonePackChoice() {
    const state = this._bonePackState || {};
    const preview = state.preview || {};
    const result = state.result || null;
    const progress = (result || preview).progress || {};
    const total = this._toInt((result || preview).bonePacksOpenedTotal ?? progress.current, 0);
    const progressText = progress.maxed
      ? `${total} committed openings · MAXED`
      : `${total}/${this._toInt(progress.nextThreshold, 0)} · ${this._toInt(progress.remaining, 0)} remaining`;

    let body = "";
    if (result) {
      const rewards = Array.isArray(result?.reward?.assets) ? result.reward.assets : [];
      const unlocks = Array.isArray(result?.newlyUnlocked) ? result.newlyUnlocked : [];
      body = `
        <div style="padding:16px;border-radius:18px;background:rgba(95,227,161,.10);border:1px solid rgba(95,227,161,.24);">
          <div style="font-size:11px;font-weight:950;letter-spacing:.8px;color:#8dffc7;text-transform:uppercase;">Cache secured</div>
          <div style="margin-top:7px;font-size:22px;font-weight:950;color:#f5fff9;">${this._esc(result?.selectedChoice?.name || "Bone Pack opened")}</div>
          <div style="margin-top:12px;display:grid;gap:8px;">
            ${rewards.map((row) => `<div style="padding:11px 12px;border-radius:13px;background:rgba(0,0,0,.20);color:#eafff3;font-weight:850;">+${this._esc(String(row.amount || 0))} ${this._esc(row.name || row.asset || "Reward")}</div>`).join("")}
          </div>
        </div>
        ${unlocks.length ? `<div style="margin-top:12px;padding:14px;border-radius:16px;background:rgba(255,215,106,.11);border:1px solid rgba(255,215,106,.26);color:#ffe8a5;"><b>Milestone unlocked</b><br>${unlocks.map((item) => this._esc(item.name || item.id)).join(" · ")}</div>` : ""}
      `;
    } else {
      const choices = Array.isArray(preview.choices) ? preview.choices : [];
      const lockedChoice = state.submitted ? state.selectedChoice : "";
      body = `<div style="display:grid;gap:10px;">${choices.map((choice) => {
        const selected = state.selectedChoice === choice.id;
        const lockedOut = !!lockedChoice && lockedChoice !== choice.id;
        return `<button type="button" ${lockedOut ? "disabled" : ""} onclick="Inventory.selectBonePackChoice('${this._esc(choice.id)}')" style="padding:14px 15px;border-radius:17px;text-align:left;border:1px solid ${selected ? "rgba(127,220,255,.55)" : "rgba(255,255,255,.11)"};background:${selected ? "rgba(48,142,204,.22)" : "rgba(255,255,255,.055)"};color:#f4f9ff;cursor:${lockedOut ? "default" : "pointer"};opacity:${lockedOut ? ".46" : "1"};">
          <div style="font-size:17px;font-weight:950;">${this._esc(choice.name)}</div>
          <div style="margin-top:6px;font-size:12px;line-height:1.5;color:#b9c9dc;">${(choice.contents || []).map((line) => this._esc(line)).join(" · ")}</div>
        </button>`;
      }).join("")}</div>`;
    }

    return `
      <div id="bonePackChoiceOverlay" onclick="if(event.target===this) Inventory.closeBonePackChoice()" style="position:fixed;inset:0;z-index:16500;display:flex;align-items:flex-end;justify-content:center;padding:16px;background:rgba(3,6,12,.82);backdrop-filter:blur(11px);">
        <div role="dialog" aria-modal="true" aria-label="Choose Bone Pack cache" style="width:min(520px,100%);max-height:88vh;overflow:auto;border-radius:26px 26px 20px 20px;background:radial-gradient(circle at 50% 0%,rgba(98,190,255,.14),transparent 34%),linear-gradient(180deg,rgba(18,24,38,.99),rgba(7,10,18,.99));border:1px solid rgba(126,198,255,.25);box-shadow:0 25px 72px rgba(0,0,0,.55);">
          <div style="padding:20px 18px 15px;border-bottom:1px solid rgba(255,255,255,.08);">
            <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#7fdcff;font-weight:950;">Bone Legacy</div>
            <div style="margin-top:6px;font-size:23px;font-weight:950;color:#f7fbff;">${result ? "Bone Pack opened" : "Choose one cache"}</div>
            <div style="margin-top:7px;font-size:12px;color:#aebed2;">${this._esc(progressText)}</div>
          </div>
          <div style="padding:16px;">${body}</div>
          <div style="padding:0 16px 18px;display:flex;gap:10px;flex-wrap:wrap;">
            ${result ? `<button type="button" onclick="Inventory.closeBonePackChoice()" style="flex:1;padding:13px;border-radius:14px;border:none;background:#7fdcff;color:#06111c;font-weight:950;">Continue</button>` : `
              <button type="button" onclick="Inventory.closeBonePackChoice()" style="flex:1;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.07);color:#edf4ff;font-weight:900;">Cancel</button>
              <button type="button" ${(!state.selectedChoice || state.pending) ? "disabled" : ""} onclick="Inventory.confirmBonePackChoice()" style="flex:1.25;padding:13px;border-radius:14px;border:none;background:linear-gradient(180deg,#7fdcff,#2d8dff);color:#06111c;font-weight:950;opacity:${(!state.selectedChoice || state.pending) ? ".55" : "1"};">${state.pending ? "Confirming..." : (state.submitted ? "Retry confirm" : "Confirm")}</button>
            `}
          </div>
        </div>
      </div>`;
  },

  _showBonePackChoice(preview, requestRecord) {
    const record = requestRecord || {};
    this._bonePackState = {
      preview,
      requestKey: preview?.requestKey || record.key,
      selectedChoice: record.choice || "",
      submitted: !!record.submitted,
      pending: false,
      result: null,
    };
    document.getElementById("bonePackChoiceOverlay")?.remove();
    document.body.insertAdjacentHTML("beforeend", this._renderBonePackChoice());
  },

  selectBonePackChoice(choiceId) {
    if (!this._bonePackState || this._bonePackState.pending || this._bonePackState.submitted) return;
    this._bonePackState.selectedChoice = String(choiceId || "");
    document.getElementById("bonePackChoiceOverlay").outerHTML = this._renderBonePackChoice();
  },

  closeBonePackChoice() {
    const state = this._bonePackState || {};
    if (state.pending) return;
    if (!state.submitted || state.result) this._clearBonePackRequest();
    document.getElementById("bonePackChoiceOverlay")?.remove();
    this._bonePackState = null;
  },

  async _openBonePackPreview() {
    const apiPost = window.S?.apiPost || window.apiPost;
    if (typeof apiPost !== "function") throw new Error("Inventory is unavailable.");
    let record = this._loadBonePackRequest();
    if (!record) {
      record = { key: this._mkRunId("w_bone_pack"), choice: "", submitted: false };
      this._saveBonePackRequest(record);
    }
    if (record.submitted && record.choice) {
      const replay = await apiPost("/webapp/inventory/use", {
        key: "bone_pack",
        choice_id: record.choice,
        request_key: record.key,
      });
      if (!replay?.ok || !replay?.bonePackResult) {
        throw Object.assign(new Error(replay?.message || replay?.reason || "Bone Pack confirmation recovery failed."), { data: replay });
      }
      this._clearBonePackRequest();
      this.closeItem();
      this._showBonePackChoice(replay.bonePackResult, record);
      this._bonePackState.result = replay.bonePackResult;
      this._bonePackState.pending = false;
      await this._refreshInventoryFromResponse(replay);
      document.getElementById("bonePackChoiceOverlay").outerHTML = this._renderBonePackChoice();
      return;
    }
    const res = await apiPost("/webapp/inventory/use", {
      key: "bone_pack",
      preview: true,
      request_key: record.key,
    });
    if (!res?.ok || !res?.bonePackChoice) throw Object.assign(new Error(res?.message || res?.reason || "Bone Pack preview failed."), { data: res });
    this.closeItem();
    this._showBonePackChoice(res.bonePackChoice, record);
  },

  async confirmBonePackChoice() {
    const state = this._bonePackState;
    if (!state || !state.selectedChoice || state.pending) return;
    state.pending = true;
    state.submitted = true;
    this._saveBonePackRequest({ key: state.requestKey, choice: state.selectedChoice, submitted: true });
    document.getElementById("bonePackChoiceOverlay").outerHTML = this._renderBonePackChoice();
    const apiPost = window.S?.apiPost || window.apiPost;
    try {
      const res = await apiPost("/webapp/inventory/use", {
        key: "bone_pack",
        choice_id: state.selectedChoice,
        request_key: state.requestKey,
      });
      if (!res?.ok || !res?.bonePackResult) throw Object.assign(new Error(res?.message || res?.reason || "Bone Pack opening failed."), { data: res });
      this._clearBonePackRequest();
      state.pending = false;
      state.result = res.bonePackResult;
      state.preview = { ...state.preview, ...res.bonePackResult };
      await this._refreshInventoryFromResponse(res);
      document.getElementById("bonePackChoiceOverlay").outerHTML = this._renderBonePackChoice();
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
    } catch (error) {
      state.pending = false;
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      this._toast(error?.data?.message || error?.message || "Bone Pack opening failed. Retry confirmation.");
      document.getElementById("bonePackChoiceOverlay").outerHTML = this._renderBonePackChoice();
    }
  },

  async _refreshInventoryFromResponse(res) {
    if (Array.isArray(res?.slots)) this.items = res.slots;
    else if (Array.isArray(res?.items)) this.items = res.items;
    if (Array.isArray(res?.activeEffects)) this.activeEffects = res.activeEffects;
    if (res && typeof res === "object") {
      this.resources = {
        bones: this._toInt(res.bones ?? this.resources.bones, 0),
        scrap: this._toInt(res.scrap ?? this.resources.scrap, 0),
        rune_dust: this._toInt(res.rune_dust ?? this.resources.rune_dust, 0),
      };
    }
    this._renderActiveEffectsPanel();
    const grid = document.getElementById("inventory-grid");
    if (grid) this.showTab(this.currentTab);
  },

  async _openBoxRequest(key, options = {}) {
    const boxKey = String(key || "").trim();
    if (!this._isOpenableBox(boxKey)) return;
    this._boxOpenPending = this._boxOpenPending || new Set();
    if (this._boxOpenPending.has(boxKey)) return;
    this._boxOpenPending.add(boxKey);
    this._setBoxRevealPending(true);

    const apiPost = window.S?.apiPost || window.apiPost;
    if (typeof apiPost !== "function") {
      this._boxOpenPending.delete(boxKey);
      this._setBoxRevealPending(false);
      this._toast("Can't reach inventory right now.");
      return;
    }

    try {
      const payload = {
        key: boxKey,
        run_id: this._mkRunId(options.openAll ? "w_inv_box_open_all" : "w_inv_box_open"),
      };
      if (options.openAll) payload.open_all = true;
      if (options.count) payload.count = this._toInt(options.count, 1);
      const res = await apiPost("/webapp/inventory/use", payload);
      if (!res?.ok) {
        const err = new Error(String(res?.message || res?.reason || "Box opening failed."));
        err.data = res;
        throw err;
      }
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      await this._refreshInventoryFromResponse(res);
      if (res.boxReveal) this._showBoxReveal(res.boxReveal, false);
      else if (res.message) this._toast(res.message);
    } catch (e) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      const data = e?.data || {};
      const message = data?.message || e?.message || "Box opening failed.";
      if (this._lastBoxReveal) this._showBoxReveal({ ...this._lastBoxReveal, partialFailure: message, rewards: [], lines: [message], canOpenAnother: false, canOpenAll: false, remaining: this._boxOwnedCount(boxKey) }, false);
      else this._toast(String(message));
    } finally {
      this._boxOpenPending.delete(boxKey);
      this._setBoxRevealPending(false);
    }
  },

  async openAnotherBox(key) {
    return this._openBoxRequest(key, { count: 1 });
  },

  async openAllBoxes(key) {
    return this._openBoxRequest(key, { openAll: true });
  },

  // === Telegram BackButton fallback binder (ONLY if nav helpers not present) ===
  _bindTelegramBackButtonFallback() {
    try {
      const tg = Telegram?.WebApp;
      if (!tg) return;

      // cleanup previous
      if (this._tgBackHandler) {
        try { tg.BackButton?.offClick?.(this._tgBackHandler); } catch (_) {}
        try { tg.offEvent?.("backButtonClicked", this._tgBackHandler); } catch (_) {}
      }

      this._tgBackHandler = () => this.goBack("tg");

      // bind both ways (different Telegram builds behave differently)
      try { tg.BackButton?.onClick?.(this._tgBackHandler); } catch (_) {}
      try { tg.onEvent?.("backButtonClicked", this._tgBackHandler); } catch (_) {}

      try { tg.BackButton?.show?.(); } catch (_) {}
    } catch (e) {
      console.warn("BackButton bind failed (fallback):", e);
    }
  },

  _bindBackButtons() {
    // Prefer the shared AlphaNav stack when available.
    this._navRegistered = false;

    try {
      const stack = window.AH_NAV?.stack;
      const top = Array.isArray(stack) && stack.length ? stack[stack.length - 1] : null;
      const topId = (typeof top === "string") ? top : top?.id;
      const navMeta = {
        close: () => {
          try { window.Inventory?.goBack?.("nav"); } catch (_) {}
        },
        isOpen: () => !!document.getElementById("inventory-grid")
      };

      if (topId === this._navId) {
        this._navRegistered = true;
      } else if (window.AlphaNav?.push) {
        window.AlphaNav.push(this._navId, navMeta);
        this._navRegistered = true;
      } else if (typeof window.navRegister === "function" && typeof window.navOpen === "function") {
        window.navRegister(this._navId, navMeta);
        window.navOpen(this._navId);
        this._navRegistered = true;
      }
    } catch (e) {
      console.warn("Inventory navOpen failed:", e);
    }

    // Fallback ONLY if nav helpers not present / failed
    if (!this._navRegistered) {
      this._bindTelegramBackButtonFallback();
    }
  },

  _hideTelegramBackButton() {
    try {
      const tg = Telegram?.WebApp;
      if (!tg?.BackButton) return;

      if (this._tgBackHandler && tg.BackButton.offClick) {
        try { tg.BackButton.offClick(this._tgBackHandler); } catch (_) {}
      }
      try { tg.offEvent?.("backButtonClicked", this._tgBackHandler); } catch (_) {}

      if (tg.BackButton.hide) tg.BackButton.hide();
    } catch (_) {}
  },

  // BACK should go to dashboard/map (not close webapp)
  goBack(source = "ui") {
    // prevent double-fire loops (navCloseTop -> onClose -> goBack(nav))
    if (this._backLock) return;
    this._backLock = true;
    setTimeout(() => (this._backLock = false), 500);

    try { Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

    const detailBack = document.getElementById("invItemBack");
    if (detailBack?.dataset?.open === "1") {
      this.closeItem();
      return;
    }

    const fromNav = (source === "nav"); // called by nav stack onClose
    const stack = window.AH_NAV?.stack;
    const top = Array.isArray(stack) && stack.length ? stack[stack.length - 1] : null;
    const topId = (typeof top === "string") ? top : top?.id;

    // Keep stack consistent, but NEVER block the real navigation.
    if (!fromNav) {
      try {
        if (topId === this._navId && typeof window.navCloseTop === "function") {
          try { window.navCloseTop(); } catch (_) {}
        } else if (typeof window.navClose === "function") {
          try { window.navClose(this._navId); } catch (_) {}
        }
      } catch (_) {}
    }

    // restore any hidden UI helpers (best-effort)
    try {
      document
        .querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach((el) => (el.style.display = ""));
    } catch (_) {}

    // Hide Telegram BackButton when leaving this view (safe)
    this._hideTelegramBackButton();

    // ✅ Deterministic home (your new navigation system)
    try {
      if (typeof window.goHome === "function") return window.goHome();
    } catch (e) {
      console.warn("Inventory.goBack: goHome failed:", e);
    }

    // Older fallbacks (keep)
    try {
      if (window.Dashboard?.open) return window.Dashboard.open();
      if (window.Map?.open) return window.Map.open();
      if (typeof window.openDashboard === "function") return window.openDashboard();
      if (typeof window.loadMap === "function") return window.loadMap();
      if (typeof window.loadProfile === "function") return window.loadProfile();
    } catch (e) {
      console.warn("Inventory.goBack: dashboard opener failed:", e);
    }

    // final fallback: replace to a clean in-game root, never hard reload from Back
    try {
      const url = new URL(window.location.href);
      ["section", "view", "modal", "page", "tab", "panel"].forEach((p) => url.searchParams.delete(p));
      url.hash = "";
      location.replace(url.toString());
    } catch (_) {
      try { if (window.Map?.open) return window.Map.open(); } catch (_) {}
    }
  },

  async open() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    this.selectedItemKey = null;
    this._selectedItemModalOptions = null;
    this._setItemModalScrollLock(false);
    try {
      document
        .querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach((el) => (el.style.display = "none"));
    } catch (_) {}

    const container = document.getElementById("app") || document.body;

    container.innerHTML = `
  <div class="inv-root" style="
    padding:20px;
    padding-top:calc(20px + var(--tg-safe-area-inset-top, 0px));
    color:#fff;
    max-width:760px;
    margin:0 auto;
    font-family:'Segoe UI',system-ui,sans-serif;
    position:relative;
  ">

    <!-- Sticky header BELOW safe-area (clickable) -->
    <div style="
      position:sticky;
      top:calc(var(--tg-safe-area-inset-top, 0px));
      z-index:9999;
      background:rgba(0,0,0,0.55);
      backdrop-filter: blur(6px);
      border-radius:16px;
      padding:10px 12px;
      margin-bottom:12px;
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <!-- ✅ Inline onclick (most robust) -->
        <button id="invBackBtn" type="button" onclick="Inventory.goBack('ui')"
                style="
                  display:flex;align-items:center;gap:10px;
                  padding:10px 14px;border-radius:14px;
                  background:rgba(255,255,255,0.10);
                  color:#fff;border:none;font-size:14px;
                  cursor:pointer;
                  pointer-events:auto;
                  position:relative;
                  z-index:10000;
                ">
          <span style="font-size:18px;line-height:1;">←</span>
          <span>Back</span>
        </button>

        <div style="font-weight:900;letter-spacing:0.6px;">Inventory</div>
        <div style="width:92px;"></div>
      </div>
    </div>

    <div id="stats-bar" style="
      text-align:center;margin:10px 0 16px 0;font-size:14px;line-height:1.5;
      color:#cfd7e8;padding:12px 14px;border-radius:18px;
      background:linear-gradient(180deg,rgba(19,24,38,.92),rgba(10,13,24,.9));
      border:1px solid rgba(255,255,255,.08);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 16px 32px rgba(0,0,0,.18);
    ">
      loading...
    </div>

    <div id="inventoryEffectsPanel" style="display:none;"></div>

    <!-- Tabs -->
    <div style="display:flex;justify-content:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <button onclick="Inventory.showTab('all')" class="tab-btn active" data-type="all" type="button">All</button>
      <button onclick="Inventory.showTab('gear')" class="tab-btn" data-type="gear" type="button">Gear</button>
      <button onclick="Inventory.showTab('consumable')" class="tab-btn" data-type="consumable" type="button">Consumables</button>
      <button onclick="Inventory.showTab('utility')" class="tab-btn" data-type="utility" type="button">Utility</button>
    </div>

    <div id="inventory-grid" style="
      max-height:64vh;overflow-y:auto;display:grid;
      grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
      gap:14px;padding:14px;
      background:linear-gradient(180deg,rgba(10,13,24,.92),rgba(5,8,16,.88));
      border:1px solid rgba(255,255,255,.08);
      border-radius:24px;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 24px 48px rgba(0,0,0,.22);
    ">
      <div style="grid-column:1/-1;text-align:center;padding:80px;opacity:0.7;color:#aaa;">loading items...</div>
    </div>

  </div>
`;
    // register in nav stack + (optional) TG back fallback
    this._bindBackButtons();
    this._ensureCompactGridStyles();
    this._bindInventoryGridEvents();
    this._ensureItemModalHost();

    try {
      const apiPost = window.S?.apiPost || window.apiPost;
      const res = await apiPost("/webapp/inventory/state", {});
      if (!res?.ok) throw new Error(res?.reason || "No response");

      // slots = UNEQUIPPED ONLY
      this.items = res.slots || [];
      this.activeEffects = this._activeEffectsFromResponse(res);
      this.equipped = {}; // no equipped fallback in this view
      this.equippedBySlot = (res.equippedBySlot && typeof res.equippedBySlot === "object") ? res.equippedBySlot : {};

      this.resources = {
        bones: parseInt(res.bones || 0, 10) || 0,
        scrap: parseInt(res.scrap || 0, 10) || 0,
        rune_dust: parseInt(res.rune_dust || 0, 10) || 0,
      };

      const bar = document.getElementById("stats-bar");
      if (bar) {
        bar.innerHTML = `
          Bones: <b style="color:#ff8;">${this.resources.bones.toLocaleString()}</b> •
          Scrap: <b style="color:#8af;">${this.resources.scrap.toLocaleString()}</b> •
          Rune Dust: <b style="color:#f8f;">${this.resources.rune_dust.toLocaleString()}</b>
        `;
      }

      this._renderActiveEffectsPanel();
      try { window.renderBuffs?.(res); } catch (_) {}

      if (!["all", "gear", "consumable", "utility"].includes(this.currentTab)) {
        this.currentTab = "all";
      }

      this.showTab(this.currentTab);
    } catch (err) {
      console.error("Inventory open error:", err);
      const grid = document.getElementById("inventory-grid");
      if (grid) {
        grid.innerHTML =
          `<p style="grid-column:1/-1;color:#f66;text-align:center;">Connection error</p>`;
      }
    } finally {
      this._perfAction("inventory_open", perfT0);
    }
  },

  // ---- helpers (robust type/slot detection) ----
  _gearSlots: new Set(["weapon","armor","cloak","collar","helmet","ring","offhand","gloves","fangs"]),
  _normType(it) { return String(it?.type || "").toLowerCase(); },
  _normSlot(it) { return String(it?.slot || it?.equippedSlot || "").toLowerCase(); },
  _isConsumable(it) { return this._normType(it) === "consumable"; },
  _isGear(it) {
    const s = this._normSlot(it);
    if (this._gearSlots.has(s)) return true;
    const t = this._normType(it);
    if (this._gearSlots.has(t)) return true;
    if (t === "gear" && s) return true;
    return false;
  },

  _isItemEquipped(item) {
    if (!item || typeof item !== "object") return false;
    if (item.equipped === true || item.isEquipped === true || item.is_equipped === true) return true;
    const slot = this._normSlot(item);
    const equipped = slot ? this.equippedBySlot?.[slot] : null;
    const itemKey = String(item.key || item.item_key || item.item || "");
    const equippedKey = String(equipped?.key || equipped?.item_key || equipped?.item || "");
    if (!!itemKey && itemKey === equippedKey) return true;
    return (window.Equipped?.state?.slots || []).some((slotState) => {
      if (!slotState || slotState.empty) return false;
      const key = String(slotState.key || slotState.item_key || slotState.itemKey || slotState.item || "");
      return !!itemKey && key === itemKey;
    });
  },

  _ensureCompactGridStyles() {
    if (document.getElementById("invCompactGridStyles")) return;
    const style = document.createElement("style");
    style.id = "invCompactGridStyles";
    style.textContent = `
      #inventory-grid.inv-compact-grid { grid-template-columns:repeat(3,minmax(0,1fr)) !important; gap:9px !important; padding:10px !important; overflow-x:hidden; }
      .inv-compact-tile { min-width:0; min-height:154px; padding:9px; position:relative; display:flex; flex-direction:column; align-items:stretch; border:1px solid rgba(255,255,255,.10); border-radius:16px; background:linear-gradient(180deg,rgba(23,29,47,.96),rgba(8,11,20,.97)); color:#f7fbff; text-align:left; cursor:pointer; box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 10px 20px rgba(0,0,0,.18); transition:transform .14s ease,border-color .14s ease; }
      .inv-compact-tile:active { transform:scale(.975); }
      .inv-compact-tile:focus-visible { outline:2px solid #8fdcff; outline-offset:2px; }
      .inv-compact-art { width:100%; aspect-ratio:1/1; min-height:76px; border-radius:12px; object-fit:cover; background:rgba(255,255,255,.04); }
      .inv-compact-name { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; min-height:30px; margin-top:8px; font-size:12px; font-weight:900; line-height:1.22; overflow-wrap:anywhere; }
      .inv-compact-badge { position:absolute; z-index:1; padding:3px 6px; border-radius:999px; font-size:10px; font-weight:900; line-height:1.2; letter-spacing:.25px; }
      .inv-compact-qty { top:13px; right:13px; background:rgba(3,7,15,.82); border:1px solid rgba(255,255,255,.18); color:#fff; }
      .inv-compact-equipped { left:13px; bottom:42px; background:rgba(57,174,126,.88); color:#06150e; }
      @media (min-width:520px) { #inventory-grid.inv-compact-grid { grid-template-columns:repeat(4,minmax(0,1fr)) !important; gap:11px !important; } .inv-compact-tile { min-height:174px; } }
      @media (min-width:900px) { #inventory-grid.inv-compact-grid { grid-template-columns:repeat(5,minmax(0,1fr)) !important; gap:12px !important; } }
      @media (max-width:380px) { #inventory-grid.inv-compact-grid { gap:7px !important; padding:8px !important; } .inv-compact-tile { min-height:142px; padding:7px; border-radius:14px; } .inv-compact-name { margin-top:6px; font-size:11px; } .inv-compact-equipped { left:10px; bottom:35px; font-size:9px; } .inv-compact-qty { top:10px; right:10px; } }
    `;
    document.head.appendChild(style);
  },

  _bindInventoryGridEvents() {
    const grid = document.getElementById("inventory-grid");
    if (!grid || grid.dataset.itemDetailsBound === "1") return;
    grid.dataset.itemDetailsBound = "1";
    grid.addEventListener("click", (event) => {
      const tile = event.target.closest("[data-inv-item-key]");
      if (!tile || !grid.contains(tile)) return;
      const key = tile.dataset.invItemKey;
      if (key) this.openItem(key);
    });
  },

  _setItemModalScrollLock(locked) {
    const body = document.body;
    if (!body) return;
    if (locked) {
      if (body.dataset.invOverflow === undefined) body.dataset.invOverflow = body.style.overflow || "";
      body.style.overflow = "hidden";
      return;
    }
    if (body.dataset.invOverflow !== undefined) {
      body.style.overflow = body.dataset.invOverflow;
      delete body.dataset.invOverflow;
    }
  },

  _ensureItemModalHost() {
    let back = document.getElementById("invItemBack");
    if (back) return back;
    document.body.insertAdjacentHTML("beforeend", `
      <div id="invItemBack" role="presentation" onclick="if(event.target===this) Inventory.closeItem()" style="
        display:none;position:fixed;inset:0;z-index:12000;
        background:rgba(4,8,15,.84);backdrop-filter:blur(10px);
        align-items:flex-end;justify-content:center;padding:18px;
      ">
        <div role="dialog" aria-modal="true" aria-label="Item details" style="
          width:min(680px,100%);max-height:88vh;overflow:auto;
          background:linear-gradient(180deg,rgba(20,25,42,.98),rgba(9,12,22,.985));
          border:1px solid rgba(255,255,255,.12);border-radius:28px 28px 22px 22px;
          box-shadow:0 26px 70px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.05);
        ">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 18px 12px;border-bottom:1px solid rgba(255,255,255,.07);">
            <div>
              <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;">Item</div>
              <div style="font-size:20px;font-weight:900;color:#f6fbff;">Item Details</div>
            </div>
            <button onclick="Inventory.closeItem()" type="button" aria-label="Close item details" style="
              width:44px;height:44px;border-radius:14px;border:none;
              background:rgba(255,255,255,.08);color:#fff;font-size:20px;cursor:pointer;
            ">×</button>
          </div>
          <div id="invItemBody" style="padding:18px;"></div>
        </div>
      </div>
    `);
    return document.getElementById("invItemBack");
  },

  _refreshSelectedItem() {
    if (!this.selectedItemKey) return;
    const item = this.findByKey(this.selectedItemKey);
    if (!item) return this.closeItem();
    const body = document.getElementById("invItemBody");
    if (body) body.innerHTML = this._renderDetailSheet(item, this._selectedItemModalOptions);
  },

  _salvagePreview(item) {
    const rarity = String(item?.rarity || "common").toLowerCase();
    const slot = this._normSlot(item);
    const type = this._normType(item);
    const category = String(item?.category || "").toLowerCase();
    const key = String(item?.key || item?.item_key || item?.item || "").trim().toLowerCase();
    const name = String(item?.name || key || "item").trim();

    if (!key || !name) return { ok: false, reason: "unknown_item", scrap: 0, runeDust: 0 };
    if (key === "moonstone_orb" || name.toLowerCase() === "moonstone orb") return { ok: false, reason: "moonstone_orb_blocked", scrap: 0, runeDust: 0 };
    if (item?.locked) return { ok: false, reason: "locked_item", scrap: 0, runeDust: 0 };
    if (slot === "pet") return { ok: false, reason: "slot_pet_blocked", scrap: 0, runeDust: 0 };
    if (slot === "rune") return { ok: false, reason: "slot_rune_blocked", scrap: 0, runeDust: 0 };
    if (slot === "badge") return { ok: false, reason: "slot_badge_blocked", scrap: 0, runeDust: 0 };
    if (!this._gearSlots.has(slot)) return { ok: false, reason: "not_salvageable_slot", scrap: 0, runeDust: 0 };

    const blocked = new Set(["consumable", "box", "material", "materials", "shard", "shards", "cosmetic", "status", "support", "holder", "founder", "exclusive", "pet", "rune", "badge", "token"]);
    if (blocked.has(type)) return { ok: false, reason: `type_${type}_blocked`, scrap: 0, runeDust: 0 };
    if (blocked.has(category)) return { ok: false, reason: `category_${category}_blocked`, scrap: 0, runeDust: 0 };
    if (item?.exclusive || item?.founder || item?.holder || item?.support || item?.supporter) {
      if (item?.founder) return { ok: false, reason: "founder_flag_blocked", scrap: 0, runeDust: 0 };
      if (item?.holder) return { ok: false, reason: "holder_flag_blocked", scrap: 0, runeDust: 0 };
      if (item?.support || item?.supporter) return { ok: false, reason: "support_flag_blocked", scrap: 0, runeDust: 0 };
      return { ok: false, reason: "exclusive_flag_blocked", scrap: 0, runeDust: 0 };
    }

    const yieldRow = this._salvageYieldByRarity[rarity];
    if (!yieldRow) return { ok: false, reason: "not_salvageable_rarity", scrap: 0, runeDust: 0 };
    return {
      ok: true,
      reason: "ok",
      scrap: Number(yieldRow.scrap || 0),
      runeDust: Number(yieldRow.rune_dust || 0),
    };
  },

  _salvageableCopyCount(item) {
    return Math.max(0, this._qty(item));
  },

  _salvageRewardForQuantity(item, quantity) {
    const salvage = this._salvagePreview(item);
    const count = this._toInt(quantity, 0);
    if (!salvage.ok || count < 1) {
      return { ok: false, reason: salvage.reason, quantity: 0, scrap: 0, runeDust: 0 };
    }
    return {
      ok: true,
      reason: "ok",
      quantity: count,
      scrap: Number(salvage.scrap || 0) * count,
      runeDust: Number(salvage.runeDust || 0) * count,
    };
  },

  _slotLabel(item) {
    return this._safeText(item?.slotLabel || item?.slot, "");
  },

  _compareState(item) {
    const slot = this._normSlot(item);
    const equipped = slot ? (this.equippedBySlot?.[slot] || item?.compareTarget || null) : null;
    const selectedStats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
    const equippedStats = this._normalizeStats(equipped?.stats || equipped?.data?.stat_bonus || {});
    const keys = this._orderedStatKeys(selectedStats, equippedStats);
    const rows = keys.map((key) => ({
      key,
      label: this._statLabel(key),
      selected: this._toInt(selectedStats[key], 0),
      equipped: this._toInt(equippedStats[key], 0),
      delta: this._toInt(selectedStats[key], 0) - this._toInt(equippedStats[key], 0),
    }));
    return { slot, equipped, rows };
  },

  _consumableStatusTone(state) {
    const key = this._safeText(state, "").toLowerCase();
    if (key === "live") return { bg: "rgba(84,210,148,.14)", fg: "#cffff0", border: "rgba(84,210,148,.24)", label: "Live" };
    if (key === "redirect") return { bg: "rgba(120,188,255,.14)", fg: "#d9ecff", border: "rgba(120,188,255,.24)", label: "Redirect" };
    if (key === "passive") return { bg: "rgba(255,215,106,.12)", fg: "#ffe5a4", border: "rgba(255,215,106,.22)", label: "Passive" };
    if (key === "blocked") return { bg: "rgba(255,120,120,.13)", fg: "#ffd2d2", border: "rgba(255,120,120,.26)", label: "Blocked" };
    return { bg: "rgba(255,255,255,.07)", fg: "#d4deec", border: "rgba(255,255,255,.10)", label: "Unknown" };
  },

  _renderConsumableAudit(item) {
    if (!this._isConsumable(item)) return "";
    const meta = this._useMeta(item);
    const state = this._safeText(meta.state, "unknown");
    const tone = this._consumableStatusTone(state);
    const message = this._safeText(meta.message, item?.usedFor || item?.description || "");
    const activeLine = meta.active && meta.activeDescription
      ? `<div style="margin-top:8px;font-size:12px;line-height:1.55;color:#dff4ff;">${this._esc(meta.activeDescription)}</div>`
      : "";

    return `
      <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;">
          <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;">Consumable</div>
          <div style="padding:6px 10px;border-radius:999px;background:${tone.bg};border:1px solid ${tone.border};font-size:11px;font-weight:900;color:${tone.fg};letter-spacing:.4px;text-transform:uppercase;">${this._esc(tone.label)}</div>
        </div>
        <div style="margin-top:10px;font-size:13px;line-height:1.6;color:#d7e6f7;">${this._esc(message || "No consumable metadata available.")}</div>
        ${activeLine}
      </section>
    `;
  },

  _detailActions(item) {
    const key = this._safeText(item?.key || item?.item_key || item?.item, "");
    const salvage = this._salvagePreview(item);
    const salvageQty = this._salvageableCopyCount(item);
    const actions = [];
    if (this._isOpenableBox(item)) {
      const qty = this._qty(item);
      const openAllLabel = qty > 20 ? "OPEN UP TO 20" : "OPEN ALL";
      actions.push(`
        <button onclick="event.stopPropagation(); Inventory.use('${this._esc(key)}')" type="button"
                style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#7fdcff,#2d8dff);color:#06111c;font-weight:950;letter-spacing:.4px;cursor:pointer;">
          OPEN BOX
        </button>
      `);
      if (qty > 1) {
        actions.push(`
          <button onclick="event.stopPropagation(); Inventory.openAllBoxes('${this._esc(key)}')" type="button"
                  style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,215,106,.34);background:rgba(255,215,106,.13);color:#ffe59a;font-weight:950;letter-spacing:.4px;cursor:pointer;">
            ${openAllLabel}
          </button>
        `);
      }
      return actions.join("");
    }
    if (this._isConsumable(item)) {
      const meta = this._useMeta(item);
      const state = this._safeText(meta.state, "unknown").toLowerCase();
      if (state === "live") {
        actions.push(`
          <button onclick="event.stopPropagation(); Inventory.use('${this._esc(key)}')" type="button"
                  style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#5fe3a1,#1b9e67);color:#08110d;font-weight:900;letter-spacing:.4px;cursor:pointer;">
            USE
          </button>
        `);
      } else if (state === "redirect") {
        actions.push(`
          <button onclick="event.stopPropagation(); Inventory.use('${this._esc(key)}')" type="button"
                  style="flex:1 1 180px;padding:12px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#7fc3ff,#407de0);color:#08111b;font-weight:900;letter-spacing:.4px;cursor:pointer;">
            ${this._esc(this._safeText(meta.redirectLabel, "OPEN SCREEN"))}
          </button>
        `);
      } else {
        const label = state === "passive" ? "PASSIVE" : "BLOCKED";
        actions.push(`
          <button type="button" disabled
                  style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.06);color:#a9b6c8;font-weight:900;letter-spacing:.4px;cursor:default;">
            ${label}
          </button>
        `);
      }
    }
    if (this._isGear(item)) {
      actions.push(`
        <button onclick="event.stopPropagation(); Inventory.equip('${this._esc(key)}')" type="button"
                style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:none;background:linear-gradient(180deg,#6caeff,#2d65ff);color:#f5f9ff;font-weight:900;letter-spacing:.4px;cursor:pointer;">
          EQUIP
        </button>
      `);
    }
    if (salvage.ok) {
      if (salvageQty > 1) {
        const x5Disabled = salvageQty < 5;
        actions.push(`
          <div style="display:flex;flex:1 1 100%;flex-wrap:wrap;gap:8px;">
            <button onclick="event.stopPropagation(); Inventory.removeItem('${this._esc(key)}','one')" type="button"
                    style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,120,120,.22);background:rgba(98,21,31,.85);color:#ffd7dc;font-weight:800;letter-spacing:.3px;cursor:pointer;">
              x1
            </button>
            <button onclick="event.stopPropagation(); Inventory.salvageMultiple('${this._esc(key)}', 5)" type="button" ${x5Disabled ? 'disabled' : ''}
                    style="flex:1 1 90px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,120,120,.18);background:${x5Disabled ? 'rgba(255,255,255,.06)' : 'rgba(84,24,35,.78)'};color:${x5Disabled ? '#9ba7b9' : '#ffe0e4'};font-weight:800;letter-spacing:.3px;cursor:${x5Disabled ? 'default' : 'pointer'};opacity:${x5Disabled ? '0.6' : '1'};">
              x5
            </button>
            <button onclick="event.stopPropagation(); Inventory.salvageMultiple('${this._esc(key)}', 'all')" type="button"
                    style="flex:1 1 90px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,120,120,.18);background:rgba(123,31,52,.82);color:#ffe0e4;font-weight:800;letter-spacing:.3px;cursor:pointer;">
              ALL
            </button>
          </div>
        `);
      } else {
        actions.push(`
          <button onclick="event.stopPropagation(); Inventory.removeItem('${this._esc(key)}','one')" type="button"
                  style="flex:1 1 140px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,120,120,.22);background:rgba(98,21,31,.85);color:#ffd7dc;font-weight:800;letter-spacing:.3px;cursor:pointer;">
            SALVAGE
          </button>
        `);
      }
    }
    return actions.join("");
  },

  openItem(key, options = {}) {
    const item = this.findByKey(key);
    if (!item) return;
    this.selectedItemKey = String(key);
    this._selectedItemModalOptions = (options && typeof options === "object") ? options : {};
    try { Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
    const back = this._ensureItemModalHost();
    const body = document.getElementById("invItemBody");
    if (!back || !body) return;

    const rarity = this._rarityMeta(item?.rarity);
    const qty = this._qty(item);
    const typeLabel = this._safeText(item?.type || item?.category, "Misc");
    const slotLabel = this._slotLabel(item);
    const setInfo = this._safeText(item?.set || item?.setName || item?.set_name || item?.data?.set, "");
    const equippedState = this._isItemEquipped(item);
    const description = this._itemDescription(item);
    const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
    const statKeys = this._orderedStatKeys(stats);
    const compare = this._compareState(item);
    const eq = compare.equipped;
    const salvage = this._salvagePreview(item);
    const salvageAllQty = this._salvageableCopyCount(item);
    const salvageAll = this._salvageRewardForQuantity(item, salvageAllQty);

    const statCards = statKeys.length
      ? statKeys.map((key) => `
          <div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);min-width:84px;">
            <div style="font-size:11px;letter-spacing:.5px;color:#91a0bb;">${this._esc(this._statLabel(key))}</div>
            <div style="font-size:18px;font-weight:900;color:#f5fbff;">+${this._esc(String(this._toInt(stats[key], 0)))}</div>
          </div>
        `).join("")
      : `<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.05);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

    let compareBlock = "";
    if (this._isGear(item)) {
      const compareRows = compare.rows.length
        ? compare.rows.map((row) => {
            const tone = this._deltaTone(row.delta);
            return `
              <div style="display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:center;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);">
                <div style="font-size:12px;letter-spacing:.45px;color:#91a0bb;">${this._esc(row.label)}</div>
                <div style="font-size:13px;color:#dbe7ff;">${this._esc(`+${row.selected}`)}${eq ? ` vs ${row.equipped >= 0 ? "+" : ""}${row.equipped}` : ""}</div>
                <div style="padding:6px 10px;border-radius:999px;background:${tone.bg};border:1px solid ${tone.border};color:${tone.fg};font-size:12px;font-weight:900;letter-spacing:.35px;">
                  ${this._esc(this._fmtDelta(row.delta))}
                </div>
              </div>
            `;
          }).join("")
        : `<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

      compareBlock = `
        <section style="margin-top:18px;padding:16px;border-radius:20px;background:rgba(8,12,24,.88);border:1px solid rgba(255,255,255,.08);">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px;">
            <div>
              <div style="font-size:11px;letter-spacing:.65px;color:#7d8aa3;text-transform:uppercase;">Equipment Compare</div>
              <div style="font-size:16px;font-weight:900;color:#f4f8ff;">${eq ? this._esc(eq.name || eq.key || "Equipped item") : "No item equipped in this slot."}</div>
            </div>
            ${slotLabel ? `<div style="padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.06);font-size:11px;color:#d5dded;letter-spacing:.4px;">${this._esc(slotLabel)}</div>` : ""}
          </div>
          ${compareRows}
        </section>
      `;
    }

    body.innerHTML = this._renderDetailSheet(item, this._selectedItemModalOptions);
    back.style.display = "flex";
    back.dataset.open = "1";
    this._setItemModalScrollLock(true);
    try { window.navOpen?.("invItemBack"); } catch (_) {}
    return;

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:96px 1fr;gap:16px;align-items:start;">
        <img src="${this._esc(item?.icon || item?.image || item?.image_path || "/assets/items/unknown.png")}"
             alt=""
             style="width:96px;height:96px;border-radius:22px;border:2px solid ${rarity.color};box-shadow:0 0 0 4px ${rarity.glow};background:rgba(255,255,255,.04);object-fit:cover;"
             onerror="this.onerror=null;this.src='/assets/items/unknown.png';">
        <div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <span style="padding:6px 10px;border-radius:999px;background:${rarity.glow};color:${rarity.color};font-size:11px;letter-spacing:.5px;font-weight:900;text-transform:uppercase;">${this._esc(rarity.label)}</span>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#d6dceb;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">${this._esc(typeLabel)}</span>
            ${slotLabel ? `<span style="padding:6px 10px;border-radius:999px;background:rgba(76,95,165,.22);color:#b4c6ff;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">${this._esc(slotLabel)}</span>` : ""}
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#f8fbff;font-size:11px;letter-spacing:.5px;">QTY ${this._esc(String(qty))}</span>
          </div>
          <div style="font-size:22px;line-height:1.1;font-weight:900;color:#f6fbff;">${this._esc(item?.name || item?.key || "Unknown Item")}</div>
          <div style="margin-top:10px;font-size:13px;line-height:1.55;color:#b8c3d6;">
            ${this._esc(description || "No description available.")}
          </div>
          ${item?.usedFor ? `<div style="margin-top:8px;font-size:12px;color:#8ad1ff;">Use: ${this._esc(item.usedFor)}</div>` : ""}
        </div>
      </div>

      <section style="margin-top:18px;padding:16px;border-radius:20px;background:rgba(8,12,24,.88);border:1px solid rgba(255,255,255,.08);">
        <div style="font-size:11px;letter-spacing:.65px;color:#7d8aa3;text-transform:uppercase;margin-bottom:12px;">Item Stats</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">${statCards}</div>
      </section>

      ${compareBlock}

      <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;margin-bottom:12px;">Salvage Yield</div>
        ${salvage.ok ? `
          <div style="font-size:13px;line-height:1.6;color:#d8e4f8;">
            Salvage yield: <b>+${this._esc(String(salvage.scrap))} scrap</b>, <b>+${this._esc(String(salvage.runeDust))} rune dust</b>.
          </div>
          ${salvageAllQty > 1 && salvageAll.ok ? `
            <div style="margin-top:8px;font-size:12px;line-height:1.5;color:#b8cbe4;">
              All ${this._esc(String(salvageAllQty))}x: <b>+${this._esc(String(salvageAll.scrap))} scrap</b>, <b>+${this._esc(String(salvageAll.runeDust))} rune dust</b>.
            </div>
          ` : ""}
        ` : `
          <div style="font-size:13px;line-height:1.6;color:#b8c3d6;">
            ${this._esc(this._salvageReasonText(salvage.reason, item?.name || item?.key || "This item"))}
          </div>
        `}
      </section>

      <section style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;">
        ${this._detailActions(item)}
      </section>
    `;

    back.style.display = "flex";
    back.dataset.open = "1";
    try { window.navOpen?.("invItemBack"); } catch (_) {}
  },

  closeItem() {
    const back = document.getElementById("invItemBack");
    if (!back) return;
    back.style.display = "none";
    delete back.dataset.open;
    this.selectedItemKey = null;
    this._selectedItemModalOptions = null;
    this._setItemModalScrollLock(false);
    try { window.navClose?.("invItemBack"); } catch (_) {}
  },

  _renderCards(filtered) {
    return (filtered || []).map((item) => {
      const key = item.key || item.item_key || item.item;
      const amountNum = this._qty(item);
      const level = Math.max(1, this._toInt(item?.level ?? item?.data?.level, 1));
      const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
      const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
      const name = this._safeText(item.name, key || "Unknown Item");
      const rarityMeta = this._rarityMeta(item?.rarity || "common");
      const typeLabel = this._safeText(item?.type || item?.category, "Misc");
      const slotLabel = this._slotLabel(item);
      const description = this._itemDescription(item);
      const isGear = this._isGear(item);
      const statChips = this._orderedStatKeys(stats)
        .slice(0, 3)
        .map((statKey) => `
          <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;color:#dce7f9;">
            ${this._esc(this._statLabel(statKey))} +${this._esc(String(this._toInt(stats[statKey], 0)))}
          </span>
        `)
        .join("");

      const keyEsc = String(key || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

      return `
        <button type="button"
             onclick="Inventory.openItem('${keyEsc}')"
             style="background:linear-gradient(180deg,rgba(23,29,47,.94),rgba(9,12,22,.94));border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:14px;text-align:left;position:relative;transition:0.22s;cursor:pointer;color:#fff;box-shadow:0 12px 26px rgba(0,0,0,.18);">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:12px;">
            <span style="padding:5px 9px;border-radius:999px;background:${rarityMeta.glow};color:${rarityMeta.color};font-size:10px;font-weight:900;letter-spacing:.55px;text-transform:uppercase;">
              ${this._esc(rarityMeta.label)}
            </span>
            <span style="padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.07);color:#f7fbff;font-size:10px;font-weight:800;letter-spacing:.45px;">
              ×${this._esc(String(amountNum))}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:86px 1fr;gap:12px;align-items:start;">
            <img src="${this._esc(icon)}" width="86" height="86"
               style="border:2px solid ${rarityMeta.color};box-shadow:0 0 0 4px ${rarityMeta.glow};border-radius:18px;background:rgba(255,255,255,.04);object-fit:cover;"
               onerror="this.onerror=null;this.src='/assets/items/unknown.png';">

            <div>
              <div style="font-size:15px;font-weight:900;color:#f7fbff;line-height:1.25;min-height:38px;">
                ${this._esc(name)}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);font-size:10px;letter-spacing:.45px;color:#d2dbea;text-transform:uppercase;">
                  ${this._esc(typeLabel)}
                </span>
                ${slotLabel ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(91,121,255,.16);font-size:10px;letter-spacing:.45px;color:#b8c8ff;text-transform:uppercase;">${this._esc(slotLabel)}</span>` : ""}
                ${isGear ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(255,215,106,.13);font-size:10px;letter-spacing:.45px;color:#ffd76a;">★ ${this._esc(String(level))}</span>` : ""}
              </div>
              ${statChips ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${statChips}</div>` : ""}
              <div style="margin-top:10px;font-size:11px;line-height:1.45;color:${description ? "#99a8bf" : "#7f8a9c"};">
                ${this._esc(description || (isGear ? "Equipment item." : "Misc item."))}
              </div>
            </div>
          </div>

          <div style="margin-top:12px;font-size:11px;letter-spacing:.55px;color:#7d8aa3;text-transform:uppercase;">
            Tap for details${isGear ? " and compare" : ""}
          </div>
        </button>
      `;
    }).join("");
  },

  _renderCardsPremium(filtered) {
    return (filtered || []).map((item) => {
      const key = item.key || item.item_key || item.item;
      const amountNum = this._qty(item);
      const level = Math.max(1, this._toInt(item?.level ?? item?.data?.level, 1));
      const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
      const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
      const name = this._safeText(item.name, key || "Unknown Item");
      const rarityMeta = this._rarityMeta(item?.rarity || "common");
      const typeLabel = this._safeText(item?.type || item?.category, "Misc");
      const slotLabel = this._slotLabel(item);
      const description = this._excerpt(this._itemDescription(item), 72);
      const isGear = this._isGear(item);
      const statChips = this._orderedStatKeys(stats)
        .slice(0, 4)
        .map((statKey) => `
          <span style="padding:5px 8px;border-radius:999px;background:rgba(154,179,255,.11);border:1px solid rgba(154,179,255,.16);font-size:11px;color:#edf3ff;font-weight:700;line-height:1;">
            ${this._esc(this._statLabel(statKey))} +${this._esc(String(this._toInt(stats[statKey], 0)))}
          </span>
        `)
        .join("");

      const keyEsc = String(key || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

      return `
        <button type="button"
             onclick="Inventory.openItem('${keyEsc}')"
             style="background:
               radial-gradient(circle at top right, rgba(91,121,255,.10), transparent 34%),
               linear-gradient(180deg,rgba(23,29,47,.96),rgba(8,11,20,.97));
               border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:14px 15px;text-align:left;position:relative;transition:0.22s;cursor:pointer;color:#fff;box-shadow:0 16px 28px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.05);">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:12px;">
            <span style="padding:5px 9px;border-radius:999px;background:${rarityMeta.glow};color:${rarityMeta.color};font-size:10px;font-weight:900;letter-spacing:.55px;text-transform:uppercase;border:1px solid rgba(255,255,255,.06);">
              ${this._esc(rarityMeta.label)}
            </span>
            <span style="padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.07);color:#f7fbff;font-size:10px;font-weight:800;letter-spacing:.45px;border:1px solid rgba(255,255,255,.05);">
              ×${this._esc(String(amountNum))}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:92px minmax(0,1fr);gap:14px;align-items:start;">
            <img src="${this._esc(icon)}" width="92" height="92"
               style="border:2px solid ${rarityMeta.color};box-shadow:0 0 0 4px ${rarityMeta.glow};border-radius:20px;background:rgba(255,255,255,.04);object-fit:cover;flex-shrink:0;"
               onerror="this.onerror=null;this.src='/assets/items/unknown.png';">

            <div style="min-width:0;">
              <div style="font-size:16px;font-weight:900;color:#f7fbff;line-height:1.22;min-height:40px;word-break:break-word;">
                ${this._esc(name)}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);font-size:10px;letter-spacing:.45px;color:#d2dbea;text-transform:uppercase;border:1px solid rgba(255,255,255,.05);">
                  ${this._esc(typeLabel)}
                </span>
                ${slotLabel ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(91,121,255,.18);font-size:10px;letter-spacing:.45px;color:#c6d4ff;text-transform:uppercase;border:1px solid rgba(91,121,255,.22);">${this._esc(slotLabel)}</span>` : ""}
                ${isGear ? `<span style="padding:4px 8px;border-radius:999px;background:rgba(255,215,106,.13);font-size:10px;letter-spacing:.45px;color:#ffd76a;border:1px solid rgba(255,215,106,.18);">EQUIP · ★ ${this._esc(String(level))}</span>` : ""}
              </div>
              ${statChips ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${statChips}</div>` : ""}
              <div style="margin-top:10px;font-size:11px;line-height:1.45;color:${description ? "#99a8bf" : "#7f8a9c"};min-height:31px;">
                ${this._esc(description || (isGear ? "Equipment item." : "Misc item."))}
              </div>
            </div>
          </div>

          <div style="margin-top:12px;font-size:10px;letter-spacing:.6px;color:#7d8aa3;text-transform:uppercase;opacity:.92;">
            Tap to inspect${isGear ? " · compare equipped" : ""}
          </div>
        </button>
      `;
    }).join("");
  },

  _renderDetailSheet(item, options = {}) {
    const rarity = this._rarityMeta(item?.rarity);
    const qty = this._qty(item);
    const typeLabel = this._safeText(item?.type || item?.category, "Misc");
    const slotLabel = this._slotLabel(item);
    const setInfo = this._safeText(item?.set || item?.setName || item?.set_name || item?.data?.set, "");
    const equippedState = this._isItemEquipped(item);
    const description = this._itemDescription(item);
    const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});
    const statKeys = this._orderedStatKeys(stats);
    const compare = this._compareState(item);
    const eq = compare.equipped;

    const statCards = statKeys.length
      ? statKeys.map((key) => `
          <div style="padding:12px 12px;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.08);min-width:90px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
            <div style="font-size:11px;letter-spacing:.55px;color:#91a0bb;">${this._esc(this._statLabel(key))}</div>
            <div style="margin-top:4px;font-size:19px;font-weight:900;color:#f5fbff;">+${this._esc(String(this._toInt(stats[key], 0)))}</div>
          </div>
        `).join("")
      : `<div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.05);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

    let compareBlock = "";
    if (this._isGear(item)) {
      const compareRows = compare.rows.length
        ? compare.rows.map((row) => {
            const tone = this._deltaTone(row.delta);
            return `
              <div style="display:grid;grid-template-columns:minmax(54px,72px) minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 12px;border-radius:15px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.07);">
                <div style="font-size:12px;letter-spacing:.45px;color:#91a0bb;">${this._esc(row.label)}</div>
                <div style="font-size:13px;color:#dbe7ff;line-height:1.35;min-width:0;">
                  <span style="font-weight:800;color:#f4f8ff;">${this._esc(`+${row.selected}`)}</span>
                  ${eq ? `<span style="color:#90a1be;"> vs ${this._esc(`${row.equipped >= 0 ? "+" : ""}${row.equipped}`)}</span>` : ""}
                </div>
                <div style="padding:6px 10px;border-radius:999px;background:${tone.bg};border:1px solid ${tone.border};color:${tone.fg};font-size:12px;font-weight:900;letter-spacing:.35px;">
                  ${this._esc(this._fmtDelta(row.delta))}
                </div>
              </div>
            `;
          }).join("")
        : `<div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.10);font-size:12px;color:#9aa7bb;">no stats available</div>`;

      compareBlock = `
        <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;">
            <div style="min-width:0;">
              <div style="font-size:11px;letter-spacing:.65px;color:#7d8aa3;text-transform:uppercase;">Equipment Compare</div>
              <div style="font-size:16px;font-weight:900;color:#f4f8ff;line-height:1.25;">${eq ? this._esc(eq.name || eq.key || "Equipped item") : "No item equipped in this slot."}</div>
            </div>
            ${slotLabel ? `<div style="padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.06);font-size:11px;color:#d5dded;letter-spacing:.4px;border:1px solid rgba(255,255,255,.05);">${this._esc(slotLabel)}</div>` : ""}
          </div>
          <div style="display:grid;gap:8px;">${compareRows}</div>
        </section>
      `;
    }

    return `
      <div style="display:grid;grid-template-columns:108px minmax(0,1fr);gap:16px;align-items:start;">
        <img src="${this._esc(item?.icon || item?.image || item?.image_path || "/assets/items/unknown.png")}"
             alt=""
             style="width:108px;height:108px;border-radius:24px;border:2px solid ${rarity.color};box-shadow:0 0 0 4px ${rarity.glow}, 0 12px 28px rgba(0,0,0,.25);background:rgba(255,255,255,.04);object-fit:cover;"
             onerror="this.onerror=null;this.src='/assets/items/unknown.png';">
        <div style="min-width:0;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <span style="padding:6px 10px;border-radius:999px;background:${rarity.glow};color:${rarity.color};font-size:11px;letter-spacing:.5px;font-weight:900;text-transform:uppercase;border:1px solid rgba(255,255,255,.06);">${this._esc(rarity.label)}</span>
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#d6dceb;font-size:11px;letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,.05);">${this._esc(typeLabel)}</span>
            ${slotLabel ? `<span style="padding:6px 10px;border-radius:999px;background:rgba(76,95,165,.22);color:#b4c6ff;font-size:11px;letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(76,95,165,.22);">${this._esc(slotLabel)}</span>` : ""}
            <span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#f8fbff;font-size:11px;letter-spacing:.5px;border:1px solid rgba(255,255,255,.05);">QTY ${this._esc(String(qty))}</span>
            <span style="padding:6px 10px;border-radius:999px;background:${equippedState ? "rgba(57,174,126,.18)" : "rgba(255,255,255,.06)"};color:${equippedState ? "#a7f3cf" : "#d6dceb"};font-size:11px;letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,.05);">${equippedState ? "Equipped" : "Unequipped"}</span>
          </div>
          <div style="font-size:24px;line-height:1.08;font-weight:900;color:#f6fbff;word-break:break-word;">${this._esc(item?.name || item?.key || "Unknown Item")}</div>
          <div style="margin-top:12px;max-width:44ch;font-size:13px;line-height:1.62;color:#b8c3d6;">
            ${this._esc(description || "No description available.")}
          </div>
          ${item?.usedFor ? `<div style="margin-top:8px;font-size:12px;color:#8ad1ff;">Use: ${this._esc(item.usedFor)}</div>` : ""}
          ${setInfo ? `<div style="margin-top:8px;font-size:12px;color:#d8c5ff;">Set: ${this._esc(setInfo)}</div>` : ""}
        </div>
      </div>

      <section style="margin-top:18px;padding:16px;border-radius:22px;background:linear-gradient(180deg,rgba(8,12,24,.92),rgba(8,12,24,.84));border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);">
        <div style="font-size:11px;letter-spacing:.7px;color:#7d8aa3;text-transform:uppercase;margin-bottom:12px;">Item Stats</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">${statCards}</div>
      </section>

      ${this._renderConsumableAudit(item)}

      ${compareBlock}

      ${options.actions === false ? "" : `
        <section style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;">
          ${this._detailActions(item)}
        </section>
      `}
    `;
  },

  _renderCompactTiles(filtered) {
    return (filtered || []).map((item) => {
      const key = item.key || item.item_key || item.item;
      const amount = this._qty(item);
      const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
      const name = this._safeText(item.name, key || "Unknown Item");
      const rarity = this._rarityMeta(item?.rarity || "common");
      const keyEsc = this._esc(String(key || ""));
      const equipped = this._isItemEquipped(item);
      return `
        <button type="button" class="inv-compact-tile" data-inv-item-key="${keyEsc}"
                aria-label="${this._esc(`View ${name}`)}" style="border-color:${rarity.color};">
          ${amount > 1 ? `<span class="inv-compact-badge inv-compact-qty">x${this._esc(String(amount))}</span>` : ""}
          ${equipped ? `<span class="inv-compact-badge inv-compact-equipped">EQUIPPED</span>` : ""}
          <img class="inv-compact-art" src="${this._esc(icon)}" alt="" style="border:2px solid ${rarity.color};box-shadow:0 0 0 3px ${rarity.glow};"
               onerror="this.onerror=null;this.src='/assets/items/unknown.png';">
          <span class="inv-compact-name">${this._esc(name)}</span>
        </button>
      `;
    }).join("");
  },

  showTab(type) {
    this.currentTab = type;

    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    const btn = document.querySelector(`[data-type="${type}"]`);
    if (btn) btn.classList.add("active");

    let filtered = this.items || [];

    if (type !== "all") {
      filtered = filtered.filter((item) => {
        if (type === "gear") return this._isGear(item);
        if (type === "consumable") return this._isConsumable(item);
        if (type === "utility") return !this._isGear(item) && !this._isConsumable(item);
        return true;
      });
    }

    const grid = document.getElementById("inventory-grid");
    if (!grid) return;

    if (!filtered.length) {
      grid.classList.add("inv-compact-grid");
      grid.innerHTML = `<p style="grid-column:1/-1;opacity:0.6;margin:50px 0;text-align:center;">No items</p>`;
      this._refreshSelectedItem();
      return;
    }

    grid.classList.add("inv-compact-grid");
    grid.innerHTML = this._renderCompactTiles(filtered);
    this._refreshSelectedItem();
    return;

    grid.innerHTML = filtered
      .map((item) => {
        const key = item.key || item.item_key || item.item;
        const amountNum = this._qty(item);
        const level = Math.max(1, this._toInt(item?.level ?? item?.data?.level, 1));
        const stats = this._normalizeStats(item?.stats || item?.data?.stat_bonus || {});

        const icon = item.icon || item.image || item.image_path || "/assets/items/unknown.png";
        const name = this._safeText(item.name, key || "Unknown Item");
        const rarityMeta = this._rarityMeta(item?.rarity || "common");
        const isGear = this._isGear(item);
        const typeLabel = this._safeText(item?.type || item?.category, "Misc");
        const slotLabel = this._slotLabel(item);
        const description = this._itemDescription(item);
        const statChips = this._orderedStatKeys(stats)
          .slice(0, 3)
          .map((statKey) => `
            <span style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;color:#dce7f9;">
              ${this._esc(this._statLabel(statKey))} +${this._esc(String(this._toInt(stats[statKey], 0)))}
            </span>
          `)
          .join("");

        const keyEsc = String(key || "")
          .replace(/\\/g, "\\\\")
          .replace(/'/g, "\\'");

        return `
        <div style="background:rgba(255,255,255,0.08);border-radius:16px;padding:14px;text-align:center;position:relative;transition:0.3s;"
             onmouseover="this.style.transform='scale(1.07)'" onmouseout="this.style.transform='scale(1)'">

          <img src="${icon}" width="86" height="86"
     style="border:5px solid ${rarityColor};border-radius:14px;"
     onerror="this.onerror=null;this.src='/assets/items/unknown.png';">

          <div style="margin:10px 0 6px;font-size:14px;font-weight:bold;color:#fff;min-height:40px;">
            ${name}
          </div>

          ${isGear ? `<div style="font-size:12px;color:#ff8;margin-bottom:4px;">★${level}</div>` : ""}
          ${statLines ? `<div style="font-size:11px;color:#8f8;margin-bottom:6px;opacity:0.9;">${statLines}</div>` : ""}

          <div style="font-size:15px;color:#0f8;margin:6px 0;">×${Number(amount || 1).toLocaleString()}</div>

          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">

            ${isConsumable ? `
              <button onclick="event.stopPropagation(); Inventory.use('${keyEsc}')" type="button"
                      style="padding:6px 14px;background:#0f0;color:#000;border:none;border-radius:10px;font-weight:bold;font-size:12px;cursor:pointer;">
                USE
              </button>
            ` : ""}

            ${isGear ? `
              <button onclick="event.stopPropagation(); Inventory.equip('${keyEsc}')" type="button"
                      style="padding:6px 12px;background:#08f;color:#fff;border:none;border-radius:10px;font-size:12px;cursor:pointer;">
                EQUIP
              </button>
            ` : ""}

            ${amountNum > 1 ? `
              <button onclick="event.stopPropagation(); Inventory.removeItem('${keyEsc}','one')" type="button"
                      style="padding:6px 10px;background:#3b1f1f;color:#ffb4b4;border:1px solid rgba(255,120,120,.25);border-radius:10px;font-size:11px;cursor:pointer;">
                DISCARD 1
              </button>
              <button onclick="event.stopPropagation(); Inventory.removeItem('${keyEsc}','all')" type="button"
                      style="padding:6px 10px;background:#5e1111;color:#ffdede;border:1px solid rgba(255,120,120,.35);border-radius:10px;font-size:11px;cursor:pointer;">
                DISCARD ALL
              </button>
            ` : `
              <button onclick="event.stopPropagation(); Inventory.removeItem('${keyEsc}','one')" type="button"
                      style="padding:6px 10px;background:#3b1f1f;color:#ffb4b4;border:1px solid rgba(255,120,120,.25);border-radius:10px;font-size:11px;cursor:pointer;">
                DISCARD
              </button>
            `}

          </div>
        </div>
      `;
      })
      .join("");
  },

  // === helper: find item by key ===
  findByKey(key) {
    if (!key) return null;
    const inventoryItem = (this.items || []).find((it) => {
      const k = it.key || it.item_key || it.item;
      return k === key;
    });
    if (inventoryItem) return inventoryItem;
    return (window.Equipped?.state?.slots || []).find((it) => {
      if (!it || it.empty) return false;
      const k = it.key || it.item_key || it.itemKey || it.item;
      return k === key;
    }) || null;
  },

  openEquippedItem(key) {
    return this.openItem(key, { actions: false, source: "equipped" });
  },

  // === SALVAGE DUPES (killer) ===
  async salvageDupes() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const apiPost = window.S?.apiPost || window.apiPost;

    const keep = 1;
    const rarityMax = "uncommon"; // MVP: safe clean, no rare+

    Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");

    const ok = confirm(
      `Salvage duplicate GEAR items?\n\n• Keep ${keep} of each\n• Salvage up to: ${rarityMax}\n\nYou’ll get Scrap + Shards back.`
    );
    if (!ok) return;

    const btn = document.getElementById("btnSalvageDupes");
    if (btn) btn.disabled = true;

    try {
      const res = await apiPost("/webapp/inventory/salvage_dupes", {
        keep,
        rarityMax,
        run_id: this._mkRunId("w_inv_salvage_dupes"),
      });

      if (!res?.ok) throw new Error(res?.reason || "Failed");

      if (res.reason === "NO_DUPES") {
        Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
        this._toast("No dupes to salvage (with current filters).");
        return;
      }

      const y = res.yielded || {};
      const parts = Object.keys(y)
        .sort()
        .map((k) => `+${y[k]} ${k}`)
        .slice(0, 5);

      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      this._toast(`Salvaged dupes ✅ ${parts.join(" · ")}`);

      await this.open(); // refresh
    } catch (e) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      this._toast("Salvage failed: " + (e?.message || "Error"));
    } finally {
      if (btn) btn.disabled = false;
      this._perfAction("inventory_salvage_dupes", perfT0);
    }
  },

  // === USE ITEM ===
async use(key) {
  const perfT0 = window.__ahPerf?.now?.() || Date.now();
  const item = this.findByKey(key);
  if (!item || this._normType(item) !== "consumable") return;
  if (String(key || "").toLowerCase() === "bone_pack") {
    try {
      await this._openBonePackPreview();
    } catch (error) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      this._toast(error?.data?.message || error?.message || "Bone Pack preview failed.");
    } finally {
      this._perfAction("inventory_bone_pack_preview", perfT0);
    }
    return;
  }
  if (this._isOpenableBox(item)) {
    this._perfAction("inventory_box_open", perfT0);
    return this._openBoxRequest(key, { count: 1 });
  }
  const meta = this._useMeta(item);
  const state = this._safeText(meta.state, "unknown").toLowerCase();

  if (state === "redirect") {
    Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    if (!this._handleRedirectTarget(meta.redirectTarget, meta.message)) {
      this._toast(meta.message || "Open the required screen to use this item.");
    }
    this._perfAction("inventory_use", perfT0);
    return;
  }

  if (state === "blocked" || state === "passive" || state === "unknown") {
    Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("warning");
    this._toast(meta.message || "This item can't be used right now.");
    this._perfAction("inventory_use", perfT0);
    return;
  }

  if (String(key) === "respec_token") {
    const ok = confirm(
      "This resets allocated stats and refunds points. Gear, pets, level and inventory stay safe.\n\nUse 1 Respec Token?"
    );
    if (!ok) {
      this._perfAction("inventory_use", perfT0);
      return;
    }
  }

  Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");
  const apiPost = window.S?.apiPost || window.apiPost;

  try {
    const res = await apiPost("/webapp/inventory/use", {
      key,
      run_id: this._mkRunId("w_inv_use"),
      confirm_respec: String(key) === "respec_token",
    });
    if (res.ok) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      this.activeEffects = this._activeEffectsFromResponse(res);
      this._renderActiveEffectsPanel();

      // ✅ UPDATE BUFFS LINE INSTANTLY
      try { window.renderBuffs?.(res.profile || res); } catch (_) {}

      if (res?.redirectTarget) {
        this._handleRedirectTarget(res.redirectTarget, res.message);
      }

      if (res.message) this._toast(res.message);

      this.closeItem();
      await this.open();
    } else {
      throw Object.assign(new Error(res?.message || res?.reason || "Failed"), { data: res });
    }
  } catch (e) {
    const data = e?.data || {};
    const msg = data?.message || e?.message || data?.reason || "Error";
    if (data?.redirectTarget && this._handleRedirectTarget(data.redirectTarget, data.message || msg)) {
      return;
    }
    const failureState = this._safeText(data?.useMeta?.state, "").toLowerCase();
    Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(failureState === "blocked" ? "warning" : "error");
    this._toast(msg);
  } finally {
    this._perfAction("inventory_use", perfT0);
  }
},

  async salvageMultiple(key, quantity) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const item = this.findByKey(key);
    if (!item) return;

    const itemName = String(item.name || key || "item");
    const salvage = this._salvagePreview(item);
    if (!salvage.ok) {
      this._toast(this._salvageReasonText(salvage.reason, itemName));
      return;
    }

    const maxQty = this._salvageableCopyCount(item);
    const requested = String(quantity || "").toLowerCase() === "all"
      ? maxQty
      : this._toInt(quantity, 0);

    if (!Number.isInteger(requested) || requested < 1) {
      this._toast("Quantity must be 1 or more.");
      return;
    }

    if (requested > maxQty) {
      this._toast(`You only have ${maxQty} salvageable cop${maxQty === 1 ? 'y' : 'ies'} of ${itemName}.`);
      return;
    }

    const reward = this._salvageRewardForQuantity(item, requested);
    const ok = confirm(
      `Salvage ${requested}x ${itemName}?\n\nExpected reward: ${reward.scrap} scrap and ${reward.runeDust} rune dust.`
    );
    if (!ok) return;

    Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");

    const apiPost = window.S?.apiPost || window.apiPost;
    if (typeof apiPost !== "function") {
      this._toast("Can't reach inventory right now.");
      return;
    }

    const pendingKey = `${String(key)}:salvage:${requested}`;
    this._removePending = this._removePending || new Set();
    if (this._removePending.has(pendingKey)) return;
    this._removePending.add(pendingKey);

    try {
      const res = await apiPost("/webapp/inventory/salvage-multiple", {
        itemId: String(key),
        quantity: requested,
        run_id: this._mkRunId("w_inv_salvage_multi"),
      });

      if (!res?.ok) {
        const err = new Error(String(res?.message || "Salvage failed"));
        err.data = res;
        throw err;
      }

      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      const fallbackText = res?.message || `Salvaged ${requested}x ${itemName}.`;
      const lines = this._buildSalvageToastLines(res, { salvagedCount: requested, fallbackText });
      this._showProgressToast({ title: "Salvage Complete", lines }, fallbackText);
      this.closeItem();
      await this.open();
    } catch (e) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      const reason = e?.data?.code || e?.data?.reason || e?.message || "";
      const message = e?.data?.message || this._salvageReasonText(reason, itemName) || "Salvage failed.";
      this._toast(String(message));
    } finally {
      this._removePending.delete(pendingKey);
      this._perfAction("inventory_salvage_multiple", perfT0);
    }
  },

  // === SALVAGE ITEM (single item only) ===
  async removeItem(key, mode = "one") {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const item = this.findByKey(key);
    if (!item) return;

    const itemName = String(item.name || key || "item");
    const salvage = this._salvagePreview(item);
    if (!salvage.ok) {
      this._toast(this._salvageReasonText(salvage.reason, itemName));
      return;
    }

    const ok = confirm(
      `Salvage ${itemName} for ${salvage.scrap} scrap and ${salvage.runeDust} rune dust?`
    );
    if (!ok) return;

    Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");

    const apiPost = window.S?.apiPost || window.apiPost;
    if (typeof apiPost !== "function") {
      this._toast("Can't reach inventory right now.");
      return;
    }

    const pendingKey = `${String(key)}:salvage`;
    this._removePending = this._removePending || new Set();
    if (this._removePending.has(pendingKey)) return;
    this._removePending.add(pendingKey);

    try {
      const res = await apiPost("/webapp/inventory/remove", {
        key: String(key),
        run_id: this._mkRunId("w_inv_salvage_one"),
      });

      if (!res?.ok) {
        throw new Error(
          String(res?.message || this._salvageReasonText(res?.reason, itemName) || "Salvage failed")
        );
      }

      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
      this._toast(
        res?.message || `Salvaged ${itemName}: +${salvage.scrap} scrap, +${salvage.runeDust} rune dust.`
      );
      this.closeItem();
      await this.open();
    } catch (e) {
      Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      const reason = e?.data?.reason || e?.message || "";
      const message = e?.data?.message || this._salvageReasonText(reason, itemName) || "Salvage failed.";
      this._toast(String(message));
    } finally {
      this._removePending.delete(pendingKey);
      this._perfAction("inventory_salvage_one", perfT0);
    }
  },

  // === EQUIP ===
  async equip(key) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const item = this.findByKey(key);
    if (!item || !this._isGear(item)) return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/equip", { key });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        this.closeItem();
        await this.open();
      } else {
        throw new Error(res.reason || "Failed");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Cannot equip: " + (e.message || "Error"));
    } finally {
      this._perfAction("inventory_equip", perfT0);
    }
  },

  // kept for compatibility (not used by inventory view anymore)
  async unequip(slot) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const s = String(slot || "").toLowerCase();
    if (!s) return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("light");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/unequip", { slot: s });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        this.closeItem();
        await this.open();
      } else {
        throw new Error(res.reason || "Failed");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Failed: " + (e.message || "Error"));
    } finally {
      this._perfAction("inventory_unequip", perfT0);
    }
  },

  // kept for compatibility (upgrade should be in Equipped panel)
  async upgrade(slot) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const s = String(slot || "").toLowerCase();
    if (!s) return;

    Telegram.WebApp.HapticFeedback?.impactOccurred?.("heavy");
    const apiPost = window.S?.apiPost || window.apiPost;

    try {
      const res = await apiPost("/webapp/inventory/upgrade", { slot: s });
      if (res.ok) {
        Telegram.WebApp.HapticFeedback?.notificationOccurred?.("success");
        if (res.message) Telegram.WebApp.showAlert(res.message);
        await this.open();
      } else {
        throw new Error(res.reason || "Not enough materials");
      }
    } catch (e) {
      Telegram.WebApp.HapticFeedback?.notificationOccurred?.("error");
      Telegram.WebApp.showAlert("Upgrade failed:\n" + (e.message || "Error"));
    } finally {
      this._perfAction("inventory_upgrade", perfT0);
    }
  },
};
