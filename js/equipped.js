// js/equipped.js – Equipment V2.2 backpack classification for Alpha Husky WebApp.
(function () {
  const VERSION = "equipped-v2-2-backpack-sort-20260827";
  window.__AH_EQUIPPED_VERSION__ = VERSION;

  const API_BASE = window.API_BASE || "";
  const CANONICAL_SLOTS = Object.freeze([
    "helmet", "fangs", "armor", "ring", "weapon",
    "cloak", "collar", "gloves", "pet", "offhand"
  ]);
  const SLOT_LABELS = Object.freeze({
    helmet: "HELMET",
    fangs: "FANGS",
    armor: "ARMOR",
    ring: "RING",
    weapon: "MAIN HAND",
    cloak: "CLOAK",
    collar: "COLLAR",
    gloves: "GLOVES",
    pet: "PET",
    offhand: "OFF HAND"
  });
  const SLOT_ABBR = Object.freeze({
    helmet: "HLM",
    fangs: "FNG",
    armor: "ARM",
    ring: "RNG",
    weapon: "MH",
    cloak: "CLK",
    collar: "CLR",
    gloves: "GLV",
    pet: "PET",
    offhand: "OH"
  });
  const LEFT_NODES = Object.freeze(["helmet", "fangs", "weapon", "collar", "pet"]);
  const RIGHT_NODES = Object.freeze(["cloak", "armor", "gloves", "ring", "offhand"]);
  const CATEGORIES = Object.freeze([
    { id: "all", label: "ALL", slots: null },
    { id: "offense", label: "WEAPONS" },
    { id: "armor", label: "ARMOR" },
    { id: "accessories", label: "ACCESSORIES" },
    { id: "pets", label: "PETS", slots: ["pet"] }
  ]);
  const BACKPACK_CAT = Object.freeze({
    WEAPONS: "offense",
    ARMOR: "armor",
    ACCESSORIES: "accessories",
    PETS: "pets",
    UNRESOLVED: "unresolved"
  });
  const CHAR_STATS = Object.freeze([
    { key: "hp", alts: ["health"], label: "HP" },
    { key: "attack", alts: ["atk", "str", "strength"], label: "ATK" },
    { key: "defense", alts: ["def"], label: "DEF" },
    { key: "agility", alts: ["agi"], label: "AGI" },
    { key: "luck", alts: ["luk", "lck"], label: "LUCK" }
  ]);
  const STAT_LABELS = Object.freeze({
    strength: "STR", str: "STR",
    defense: "DEF", def: "DEF",
    vitality: "VIT", vit: "VIT",
    attack: "ATK", atk: "ATK",
    agility: "AGI", agi: "AGI",
    luck: "LUCK", luk: "LUCK", lck: "LUCK",
    intelligence: "INT", int: "INT",
    hp: "HP", health: "HP",
    speed: "SPD",
    critical: "CRIT", crit: "CRIT"
  });
  const PREF_STATS = [
    "hp", "attack", "atk", "strength", "str", "defense", "def",
    "vitality", "vit", "agility", "agi", "luck", "luk", "intelligence", "int"
  ];
  const CANONICAL_ALPHA_FALLBACK = "/images/Ah.png";
  const PREVIEW_STATE = Object.freeze({
    LOADING: "loading",
    READY: "ready",
    FALLBACK: "fallback",
    FAILED: "failed"
  });
  const PREVIEW_SOURCE = Object.freeze({
    NONE: "none",
    ACTIVE_SKIN: "active-skin",
    PROFILE: "profile",
    COMPOSITE: "composite",
    FALLBACK: "fallback"
  });
  const SOURCE_RANK = Object.freeze({
    none: 0,
    fallback: 1,
    composite: 2,
    profile: 3,
    "active-skin": 4
  });

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/>/g, "\u0026gt;")
      .replace(/"/g, "\u0026quot;")
      .replace(/'/g, "\u0026#039;");
  }

  function getTg() {
    return window.tg || (window.Telegram && window.Telegram.WebApp) || null;
  }

  function haptic(kind) {
    try { getTg()?.HapticFeedback?.impactOccurred?.(kind || "light"); } catch (_) {}
  }

  function hapticNotify(kind) {
    try { getTg()?.HapticFeedback?.notificationOccurred?.(kind || "success"); } catch (_) {}
  }

  function showAlert(msg) {
    const tg = getTg();
    if (tg && tg.showAlert) tg.showAlert(msg);
    else if (window.toast) window.toast(msg);
    else try { alert(msg); } catch (_) { console.warn(msg); }
  }

  function normKey(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normRarity(r) {
    r = String(r || "").toLowerCase().trim();
    if (["common", "uncommon", "rare", "epic", "legendary", "mythic"].includes(r)) return r;
    return "common";
  }

  function slotLabel(slotKey, slotState) {
    const fromCanon = SLOT_LABELS[normKey(slotKey)];
    if (fromCanon) return fromCanon;
    const label = slotState?.label || String(slotKey || "").replace(/_/g, " ");
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function slotAbbr(slotKey) {
    const key = normKey(slotKey);
    if (SLOT_ABBR[key]) return SLOT_ABBR[key];
    const label = slotLabel(key);
    const parts = label.split(/\s+/).filter(Boolean);
    if (parts.length > 1) return parts.map((p) => p[0]).join("").slice(0, 3);
    return label.slice(0, 3);
  }

  function statPresentationLabel(key) {
    const normalized = String(key || "").toLowerCase().replace(/[\s_-]+/g, "");
    return STAT_LABELS[normalized] || String(key || "").replace(/_/g, " ").toUpperCase();
  }

  function formattedStatValue(value) {
    if (value === "" || value == null) return "";
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric > 0 ? `+${numeric}` : String(numeric);
    return String(value);
  }

  function itemKeyOf(item) {
    if (!item || typeof item !== "object") return "";
    return String(item.item_key || item.itemKey || item.key || item.item || "").trim();
  }

  function itemNameOf(item) {
    if (!item || typeof item !== "object") return "";
    return String(item.name || item.itemName || item.label || itemKeyOf(item) || "").trim();
  }

  function itemSlotOf(item) {
    return normKey(item?.slot || item?.equippedSlot || item?.slot_key);
  }

  function itemIdentitySlotOf(item) {
    const direct = itemSlotOf(item);
    if (CANONICAL_SLOTS.includes(direct)) return direct;
    const extras = [
      item?.gear_slot, item?.gearSlot,
      item?.equip_slot, item?.equipSlot,
      item?.equipment_slot, item?.equipmentSlot
    ];
    for (const raw of extras) {
      const key = normKey(raw);
      if (CANONICAL_SLOTS.includes(key)) return key;
    }
    const type = normKey(item?.type || item?.item_type || item?.itemType);
    if (CANONICAL_SLOTS.includes(type)) return type;
    return direct;
  }

  function itemMetaTokens(item) {
    if (!item || typeof item !== "object") return "";
    const tags = Array.isArray(item.tags) ? item.tags.join(" ") : (item.tags || "");
    return [
      item.item_type, item.itemType, item.type,
      item.subtype, item.sub_type, item.subType,
      item.category, item.family, item.class, item.item_class, item.itemClass,
      item.kind, item.group, item.equip_type, item.equipType,
      tags
    ].map((v) => String(v || "").trim().toLowerCase()).filter(Boolean).join(" ");
  }

  function itemNameBlob(item) {
    return [
      itemNameOf(item),
      itemKeyOf(item),
      item?.label
    ].map((v) => String(v || "").trim().toLowerCase()).filter(Boolean).join(" ");
  }

  function classifyFromStructuredToken(token) {
    const t = String(token || "").trim().toLowerCase().replace(/[_-]+/g, " ");
    if (!t) return "";
    if (/\b(pet|pets|companion)\b/.test(t)) return BACKPACK_CAT.PETS;
    if (/\b(ring|rings|collar|torque|necklace|amulet|pendant|bracelet|charm|trinket|talisman|locket|belt|relic|focus|orb|totem|accessory|accessories)\b/.test(t)) {
      return BACKPACK_CAT.ACCESSORIES;
    }
    if (/\b(helmet|helm|visor|armor|armour|chest|cuirass|carapace|cloak|hood|mantle|gloves|gauntlet|gauntlets|greaves|boots|pauldron|pauldrons|shield|buckler|aegis|pavise|bulwark)\b/.test(t)) {
      return BACKPACK_CAT.ARMOR;
    }
    if (/\b(weapon|weapons|sword|blade|greatblade|dagger|dirk|knife|axe|spear|polearm|staff|mace|hammer|bow|wand|saber|sabre|ripper|scythe|glaive|pike|halberd|katana|gun|rifle|pistol|fangs|fang|canine|canines)\b/.test(t)) {
      return BACKPACK_CAT.WEAPONS;
    }
    return "";
  }

  function classifyOffhand(item) {
    const structured = itemMetaTokens(item);
    const fromType = classifyFromStructuredToken(structured);
    if (fromType === BACKPACK_CAT.WEAPONS || fromType === BACKPACK_CAT.ARMOR || fromType === BACKPACK_CAT.ACCESSORIES) {
      return fromType;
    }
    const name = itemNameBlob(item);
    if (/\b(shield|buckler|aegis|pavise|bulwark|barrier)\b/.test(name)) return BACKPACK_CAT.ARMOR;
    if (/\b(focus|orb|totem|charm|talisman|idol|relic|amulet|pendant|necklace|torque)\b/.test(name)) return BACKPACK_CAT.ACCESSORIES;
    if (/\b(sword|blade|greatblade|dagger|dirk|knife|axe|spear|polearm|staff|mace|hammer|bow|wand|saber|sabre|ripper|scythe|glaive|pike|halberd|katana)\b/.test(name)) {
      return BACKPACK_CAT.WEAPONS;
    }
    return BACKPACK_CAT.UNRESOLVED;
  }

  function resolveBackpackCategory(item) {
    if (!item || typeof item !== "object") return BACKPACK_CAT.UNRESOLVED;
    if (item.isPet === true || item.is_pet === true) return BACKPACK_CAT.PETS;

    const slot = itemIdentitySlotOf(item);
    if (slot === "pet") return BACKPACK_CAT.PETS;

    const structured = classifyFromStructuredToken(itemMetaTokens(item));
    if (structured === BACKPACK_CAT.PETS) return BACKPACK_CAT.PETS;
    if (structured && structured !== BACKPACK_CAT.UNRESOLVED) {
      if (slot === "offhand" && structured === BACKPACK_CAT.WEAPONS) {
        const off = classifyOffhand(item);
        if (off !== BACKPACK_CAT.UNRESOLVED) return off;
      }
      return structured;
    }

    if (slot === "weapon" || slot === "fangs") return BACKPACK_CAT.WEAPONS;
    if (slot === "helmet" || slot === "armor" || slot === "cloak" || slot === "gloves") return BACKPACK_CAT.ARMOR;
    if (slot === "ring" || slot === "collar") return BACKPACK_CAT.ACCESSORIES;
    if (slot === "offhand") return classifyOffhand(item);

    const fromName = classifyFromStructuredToken(itemNameBlob(item));
    if (fromName) return fromName;
    return BACKPACK_CAT.UNRESOLVED;
  }

  function auditBackpackCategories(items) {
    const counts = { all: 0, weapons: 0, armor: 0, accessories: 0, pets: 0, unresolved: 0 };
    const samples = { weapons: [], armor: [], accessories: [], pets: [], unresolved: [] };
    const list = Array.isArray(items) ? items : [];
    for (const it of list) {
      const slot = itemSlotOf(it);
      const type = normKey(it?.type);
      if (!(CANONICAL_SLOTS.includes(slot) || CANONICAL_SLOTS.includes(type))) continue;
      counts.all += 1;
      const resolved = resolveBackpackCategory(it);
      const row = {
        item: itemNameOf(it) || itemKeyOf(it),
        rawType: it?.type || it?.item_type || it?.itemType || "",
        rawSlot: itemSlotOf(it) || itemIdentitySlotOf(it),
        resolved: resolved
      };
      if (resolved === BACKPACK_CAT.WEAPONS) { counts.weapons += 1; samples.weapons.push(row); }
      else if (resolved === BACKPACK_CAT.ARMOR) { counts.armor += 1; samples.armor.push(row); }
      else if (resolved === BACKPACK_CAT.ACCESSORIES) { counts.accessories += 1; samples.accessories.push(row); }
      else if (resolved === BACKPACK_CAT.PETS) { counts.pets += 1; samples.pets.push(row); }
      else { counts.unresolved += 1; samples.unresolved.push(row); }
    }
    return { counts, samples };
  }

  function itemSetOf(item) {
    if (!item || typeof item !== "object") return "";
    const raw = item.set || item.setName || item.set_name || item.data?.set;
    if (!raw) return "";
    if (typeof raw === "object") return String(raw.name || raw.set || raw.label || "").trim();
    return String(raw).trim();
  }

  function itemLevelOf(item) {
    const n = Number(item?.level ?? item?.item_level ?? item?.itemLevel);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function itemQtyOf(item) {
    const n = Number(item?.quantity ?? item?.amount ?? item?.stackQty ?? item?.qty);
    return Number.isFinite(n) && n > 1 ? n : null;
  }

  function itemStatsOf(item) {
    const src = (item && (item.stats || item.data?.stat_bonus || item.bonuses)) || {};
    const out = {};
    if (!src || typeof src !== "object") return out;
    for (const [k, v] of Object.entries(src)) {
      const num = Number(v);
      if (!Number.isFinite(num)) continue;
      out[String(k)] = num;
    }
    return out;
  }

  function pickStat(stats, key, alts) {
    if (!stats || typeof stats !== "object") return null;
    if (stats[key] != null && stats[key] !== "") return stats[key];
    for (const alt of alts || []) {
      if (stats[alt] != null && stats[alt] !== "") return stats[alt];
    }
    return null;
  }

  function orderedStatKeys(a, b) {
    const keys = Array.from(new Set([...Object.keys(a || {}), ...Object.keys(b || {})]));
    const idx = new Map(PREF_STATS.map((k, i) => [k, i]));
    return keys.sort((x, y) => {
      const ix = idx.has(String(x).toLowerCase()) ? idx.get(String(x).toLowerCase()) : 999;
      const iy = idx.has(String(y).toLowerCase()) ? idx.get(String(y).toLowerCase()) : 999;
      if (ix !== iy) return ix - iy;
      return String(x).localeCompare(String(y));
    });
  }

  function compareRows(selectedItem, equippedItem) {
    const selectedStats = itemStatsOf(selectedItem);
    const equippedStats = equippedItem && !equippedItem.empty ? itemStatsOf(equippedItem) : {};
    const keys = orderedStatKeys(selectedStats, equippedStats);
    return keys.map((key) => {
      const selected = Number(selectedStats[key] || 0) || 0;
      const equipped = Number(equippedStats[key] || 0) || 0;
      return {
        key,
        label: statPresentationLabel(key),
        selected,
        equipped,
        delta: selected - equipped
      };
    });
  }

  function activeSetsOf(state) {
    const raw = state?.activeSets || state?.active_sets || [];
    return Array.isArray(raw) ? raw : [];
  }

  function totalBonusOf(state) {
    const raw = state?.totalBonus || state?.total_bonus || {};
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }

  function compactBonusChips(bonus) {
    const grouped = new Map();
    for (const [k, v] of Object.entries(bonus || {})) {
      const label = statPresentationLabel(k);
      if (!label) continue;
      const num = Number(v);
      if (!Number.isFinite(num)) continue;
      const prev = grouped.get(label);
      if (prev == null || Math.abs(num) > Math.abs(prev)) grouped.set(label, num);
    }
    const rank = new Map([
      "HP", "ATK", "STR", "DEF", "VIT", "AGI", "LUCK", "INT", "SPD", "CRIT"
    ].map((k, i) => [k, i]));
    return Array.from(grouped.entries())
      .sort((a, b) => {
        const ia = rank.has(a[0]) ? rank.get(a[0]) : 99;
        const ib = rank.has(b[0]) ? rank.get(b[0]) : 99;
        if (ia !== ib) return ia - ib;
        return a[0].localeCompare(b[0]);
      })
      .map(([label, value]) => ({ label, value }));
  }

  function hasInitData() {
    try {
      const tg = getTg();
      return !!( (tg && tg.initData) || window.INIT_DATA );
    } catch (_) {
      return false;
    }
  }

  function previewFixtureSlot(slot, name, rarity, level, extra) {
    const itemKey = String(name || slot).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return Object.assign({
      slot: slot,
      label: SLOT_LABELS[slot] || slot,
      empty: false,
      name: name,
      item_key: itemKey,
      key: itemKey,
      rarity: rarity,
      level: level,
      set: extra && extra.set || ""
    }, extra || {});
  }

  function previewFixtureState() {
    const omen = "Rusted Omen";
    return {
      level: 177,
      stats: { level: 177, hp: 1550, attack: 142, defense: 103, agility: 32, luck: 17 },
      slots: [
        previewFixtureSlot("helmet", "Rusted Omen Iron-Jaw", "epic", 4, { set: omen }),
        previewFixtureSlot("fangs", "Rusted Omen Jawbreaker", "epic", 4, { set: omen }),
        previewFixtureSlot("armor", "Astral Voidfang Carapace", "legendary", 3, { set: "Astral Voidfang" }),
        previewFixtureSlot("ring", "Rusted Omen Iron Loop", "epic", 4, { set: omen }),
        previewFixtureSlot("weapon", "Rusted Omen Greatblade", "epic", 5, { set: omen }),
        previewFixtureSlot("cloak", "Rad-Core Overdrive Hood", "legendary", 5, { set: "Rad-Core" }),
        previewFixtureSlot("collar", "Eclipse Torque", "epic", 4, {}),
        previewFixtureSlot("gloves", "Rusted Omen Vices", "epic", 4, { set: omen }),
        previewFixtureSlot("pet", "Fracture Sentinel", "uncommon", 33, { isPet: true }),
        previewFixtureSlot("offhand", "Rusted Omen Aegis-Wall", "epic", 4, { set: omen })
      ],
      activeSets: [
        { set: "Rusted Omen", name: "Rusted Omen", count: 6, bonus: { str: 10, def: 8, vit: 6 } }
      ],
      totalBonus: {
        agility: 19, defense: 59, intelligence: 7, luck: 3,
        strength: 64, vitality: 52, str: 64, agi: 19, def: 59, vit: 52, int: 7
      }
    };
  }

  function previewFixtureBackpack() {
    return [
      previewFixtureSlot("weapon", "Ashline Ripper", "rare", 6, { stats: { attack: 18, strength: 6 } }),
      previewFixtureSlot("offhand", "Signal Ward Buckler", "epic", 4, { stats: { defense: 12, vitality: 4 } }),
      previewFixtureSlot("fangs", "Nightglass Canines", "rare", 5, { stats: { attack: 9, luck: 3 } }),
      previewFixtureSlot("helmet", "Sootveil Visor", "uncommon", 8, { stats: { defense: 7 } }),
      previewFixtureSlot("ring", "Ion Halo Band", "legendary", 2, { stats: { intelligence: 8, luck: 4 } })
    ];
  }

  function previewPetMode() {
    try {
      const override = window.__AH_EQUIPPED_PREVIEW_PET__;
      if (override === false || override === "none") return "none";
      if (override === "broken") return "broken";
      const q = new URLSearchParams(location.search || "");
      const v = String(q.get("pet") || q.get("companion") || "").trim().toLowerCase();
      if (v === "none" || v === "off" || v === "0") return "none";
      if (v === "broken" || v === "fail" || v === "missing") return "broken";
    } catch (_) {}
    return "active";
  }

  function previewFixtureCompanion() {
    const mode = previewPetMode();
    if (mode === "none") return null;
    if (mode === "broken") {
      return {
        id: "preview-broken-pet",
        petId: "preview-broken-pet",
        name: "Broken Companion",
        is_active: true,
        img: "/images/__missing_pet_asset__.png"
      };
    }
    return {
      id: "preview-active-pet",
      petId: "preview-active-pet",
      name: "Dark Husky Pup",
      type: "darkhuskypup",
      pet_type: "darkhuskypup",
      pet_key: "darkhuskypup",
      pet_public_id: "darkhuskypup",
      is_active: true,
      level: 12,
      pet_img: "https://res.cloudinary.com/dnjwvxinh/image/upload/f_png,q_auto,w_512/pets/darkhuskypup.png",
      pet_icon: "https://res.cloudinary.com/dnjwvxinh/image/upload/pets/darkhuskypup.png"
    };
  }

  function resolveActivePetRecord(payload) {
    if (!payload || typeof payload !== "object") return null;
    const direct = payload.activePet || payload.active_pet || null;
    if (direct && typeof direct === "object") {
      const id = String(direct.id || direct.petId || direct.pet_id || "").trim();
      const named = String(direct.name || direct.petName || direct.pet_name || "").trim();
      const hasVisual = !!(
        direct.img || direct.icon || direct.pet_img || direct.pet_icon ||
        direct.image || direct.pet_public_id || direct.petPublicId
      );
      if (id || named || hasVisual) return direct;
    }
    const activeId = String(
      payload.activePetId || payload.active_pet_id || ""
    ).trim();
    const rawPets = payload.pets || payload.ownedPets || payload.owned || null;
    const list = Array.isArray(rawPets)
      ? rawPets
      : (rawPets && typeof rawPets === "object" ? Object.values(rawPets) : []);
    if (activeId) {
      const found = list.find((p) => {
        const pid = String(p?.id || p?.petId || p?.pet_id || "").trim();
        return pid && pid === activeId;
      });
      if (found) return found;
    }
    const flagged = list.find((p) => p && (p.is_active === true || p.isActive === true));
    return flagged || null;
  }

  function petKeyCandidates(pet) {
    if (!pet || typeof pet !== "object") return [];
    const raws = [
      pet.pet_public_id, pet.petPublicId,
      pet.pet_type, pet.petType, pet.type,
      pet.pet_key, pet.petKey, pet.resolvedPetKey
    ];
    const out = [];
    for (const raw of raws) {
      let s = String(raw || "").trim();
      if (!s) continue;
      s = s.replace(/[αΑ]/g, "a").replace(/^pets\//i, "").replace(/\.(png|webp|jpg|jpeg)$/i, "");
      s = s.toLowerCase().replace(/[^a-z0-9 _-]/g, "").replace(/\s+/g, " ").trim();
      if (!s) continue;
      if (/^[a-f0-9]{32}$/.test(s)) continue;
      if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(s)) continue;
      const joinNo = s.replace(/[\s-]+/g, "");
      const under = s.replace(/\s+/g, "_");
      const dash = s.replace(/\s+/g, "-");
      for (const k of [s, joinNo, under, dash]) if (k) out.push(k);
    }
    return Array.from(new Set(out));
  }

  function resolvePetVisualUrls(pet) {
    if (!pet || typeof pet !== "object") return [];
    const portraits = uniqueImageUrls([
      pet.pet_img, pet.petImg,
      pet.pet_icon, pet.petIcon
    ]);
    const generic = uniqueImageUrls([
      pet.img, pet.icon, pet.image, pet.imageUrl, pet.image_url
    ]);
    const cloud = [];
    const base = "https://res.cloudinary.com/dnjwvxinh/image/upload";
    for (const k of petKeyCandidates(pet)) {
      cloud.push(base + "/pets/" + encodeURIComponent(k) + ".png");
      cloud.push(base + "/f_png,q_auto,w_512/pets/" + encodeURIComponent(k) + ".png");
      cloud.push(base + "/pets/icons/" + encodeURIComponent(k) + ".png");
    }
    return uniqueImageUrls(portraits.concat(generic, cloud));
  }

  function slotGlyph(slot) {
    const common = 'width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const paths = {
      helmet: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><path d="M4 13c0 3 2.5 6 8 6s8-3 8-6"/><path d="M9 19v2M15 19v2"/>',
      fangs: '<path d="M7 4v9c0 2-1 4-3 5"/><path d="M17 4v9c0 2 1 4 3 5"/><path d="M9 8h6"/>',
      armor: '<path d="M12 3 20 7v5c0 5-3.5 8.5-8 10C7.5 20.5 4 17 4 12V7l8-4z"/>',
      ring: '<circle cx="12" cy="13" r="6"/><path d="M9 8 12 4l3 4"/>',
      weapon: '<path d="M14 4 20 10"/><path d="M12 6l6 6-8 8H4v-6z"/>',
      cloak: '<path d="M8 4h8v3s4 4 4 10c-5 2-7 3-8 3s-3-1-8-3c0-6 4-10 4-10V4z"/>',
      collar: '<path d="M7 10c1.5 4 8.5 4 10 0"/><path d="M7 10a8 8 0 0 1 10 0"/><circle cx="12" cy="14" r="1.6"/>',
      gloves: '<path d="M8 11V6a1.5 1.5 0 0 1 3 0v4"/><path d="M11 10V5a1.5 1.5 0 0 1 3 0v5"/><path d="M14 10V6a1.5 1.5 0 0 1 3 0v6c0 4-2 7-5 7s-5-3-5-7v-1"/>',
      pet: '<path d="M7 13c0 3 2 6 5 6s5-3 5-6-2-5-5-5-5 2-5 5z"/><circle cx="8" cy="8" r="1.4"/><circle cx="16" cy="8" r="1.4"/><circle cx="5.5" cy="11" r="1.2"/><circle cx="18.5" cy="11" r="1.2"/>',
      offhand: '<circle cx="12" cy="12" r="7"/><path d="M12 8v8M8 12h8"/>'
    };
    return `<svg ${common}>${paths[slot] || paths.weapon}</svg>`;
  }

  function statGlyph(kind) {
    const common = 'width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const paths = {
      HP: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z"/>',
      ATK: '<path d="M14 4 20 10"/><path d="M12 6l6 6-8 8H4v-6z"/>',
      DEF: '<path d="M12 3 20 7v5c0 5-3.5 8.5-8 10C7.5 20.5 4 17 4 12V7l8-4z"/>',
      AGI: '<path d="M4 16c4-2 6-8 8-12 2 4 4 10 8 12"/><path d="M12 4v16"/>',
      LUCK: '<path d="M12 3 9 9h6l-3 6"/><circle cx="12" cy="18" r="2"/>'
    };
    return `<svg ${common}>${paths[kind] || ""}</svg>`;
  }

  function wolfMark() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 14 8 6l4 3 4-3 4 8-4 6H8z"/><path d="M9 14c.6 1.6 2 2.5 3 2.5s2.4-.9 3-2.5"/></svg>`;
  }

  function isUsableImageUrl(url) {
    const u = String(url || "").trim();
    if (!u) return false;
    if (/^(javascript|file|about):/i.test(u)) return false;
    if (u === "data:," || u === "about:blank") return false;
    try {
      if (typeof location !== "undefined") {
        if (u === location.href) return false;
        const locPath = String(location.origin || "") + String(location.pathname || "");
        if (locPath && u === locPath) return false;
      }
    } catch (_) {}
    return true;
  }

  function skinObjectUrl(skin) {
    if (!skin) return "";
    if (typeof skin === "string") return String(skin).trim();
    if (typeof skin !== "object") return "";
    return String(
      skin.img || skin.url || skin.preview_url || skin.previewUrl ||
      skin.src || skin.image || skin.heroImg || ""
    ).trim();
  }

  function uniqueImageUrls(list) {
    const seen = new Set();
    const out = [];
    for (const raw of list || []) {
      const u = String(raw || "").trim();
      if (!isUsableImageUrl(u)) continue;
      const key = u.split("?")[0].toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(u);
    }
    return out;
  }

  function readProfileRecord() {
    const p =
      window.__PROFILE__ ||
      window.PROFILE ||
      window.profileState ||
      window.lastProfile ||
      {};
    return p && typeof p === "object" ? p : {};
  }

  function resolveCharacterSources() {
    const profile = readProfileRecord();
    const skinObj = profile.skin || profile.activeSkin || null;
    const skinFromProfile = skinObjectUrl(skinObj);
    const skinKey = String(
      profile.skinKey ||
      profile.skin_key ||
      (skinObj && typeof skinObj === "object" ? (skinObj.key || skinObj.skinKey || skinObj.skin_key) : "") ||
      ""
    ).trim();
    let playerSkinUrl = "";
    let playerSkinKey = "";
    try {
      const el = document.getElementById("player-skin");
      if (el) {
        playerSkinUrl = String(el.currentSrc || el.src || "").trim();
        playerSkinKey = String(el.dataset?.skinKey || el.getAttribute?.("data-skin-key") || "").trim();
      }
    } catch (_) {}

    const derivedKey = String(skinKey || playerSkinKey || "").trim();
    const derivedFromKey = derivedKey && !/default/i.test(derivedKey)
      ? "/assets/skins/" + derivedKey.toLowerCase().replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "") + ".webp"
      : "";
    const playerIsCustom = !!(playerSkinKey && !/default/i.test(playerSkinKey));

    const skin = uniqueImageUrls([
      window.__AH_ACTIVE_SKIN_URL__,
      skinFromProfile,
      typeof profile.activeSkin === "string" ? profile.activeSkin : skinObjectUrl(profile.activeSkin),
      profile.heroImg,
      playerIsCustom ? playerSkinUrl : "",
      derivedFromKey
    ])[0] || "";

    const profileImg = uniqueImageUrls([
      playerSkinUrl,
      profile.avatarImg,
      profile.avatarUrl,
      skinObjectUrl(profile.avatar)
    ]).filter((u) => u !== skin)[0] || "";

    const canonical = CANONICAL_ALPHA_FALLBACK;
    const fallbacks = uniqueImageUrls([skin, profileImg, canonical]);

    return {
      skin: skin,
      profile: profileImg,
      canonical: canonical,
      fallbacks: fallbacks,
      skinKey: skinKey || playerSkinKey || ""
    };
  }

  function previewSourceRank(kind) {
    return SOURCE_RANK[String(kind || "none")] || 0;
  }

  function logPreviewEvent(event, extra) {
    try {
      const rec = Object.assign({
        t: Date.now(),
        event: String(event || ""),
        source: window.__AH_EQUIPPED_PREVIEW_SOURCE__ || "none",
        state: window.__AH_EQUIPPED_PREVIEW_STATE__ || ""
      }, extra || {});
      const log = Array.isArray(window.__AH_EQUIPPED_PREVIEW_LOG__)
        ? window.__AH_EQUIPPED_PREVIEW_LOG__
        : [];
      log.push(rec);
      window.__AH_EQUIPPED_PREVIEW_LOG__ = log.slice(-40);
    } catch (_) {}
  }

  function previewTokenAlive(token) {
    const current = Number(window.__EquippedPreviewToken || 0) || 0;
    return !token || current === token;
  }

  function ensureEquippedStyles() {
    if (document.getElementById("equipped-v2-css") || document.getElementById("equipped-styles")) return;
    const link = document.createElement("link");
    link.id = "equipped-v2-css";
    link.rel = "stylesheet";
    const script = document.querySelector("script[src*='equipped.js']");
    if (script && script.src) {
      link.href = script.src.replace(/js\/equipped\.js[^/]*$/, "css/equipped_v2.css?v=" + encodeURIComponent(VERSION));
    } else {
      link.href = "css/equipped_v2.css?v=" + encodeURIComponent(VERSION);
    }
    document.head.appendChild(link);
  }

  async function equippedPost(path, payload) {
    const tg = getTg();
    const initData = (tg && tg.initData) || window.INIT_DATA || "";
    const apiPost = window.S?.apiPost || window.apiPost || window.AH?.apiPost;
    if (typeof apiPost === "function") {
      try {
        return await apiPost(path, payload || {});
      } catch (err) {
        if (!initData) throw err;
      }
    }
    if (!initData) {
      console.warn("Equipped: NO initData – works inside Telegram Mini App.");
      throw new Error("NO_INIT_DATA");
    }
    const resp = await fetch((API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ initData }, payload || {}))
    });
    let data = null;
    try { data = await resp.json(); } catch (e) {
      console.error("Equipped: JSON parse error", e);
    }
    if (!resp.ok) {
      console.error("Equipped API error", resp.status, data);
      return data || { ok: false, reason: "http_" + resp.status };
    }
    return data;
  }

  async function loadCharacterComposite(requestToken) {
    const tg = getTg();
    const initData = (tg && tg.initData) || window.INIT_DATA || "";
    if (!initData) {
      return { ok: false, reason: "no_init" };
    }
    const token = Number(requestToken || 0) || 0;
    try {
      const resp = await fetch((API_BASE || "") + "/api/character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData })
      });
      if (!previewTokenAlive(token)) return { ok: false, reason: "stale" };
      if (!resp.ok) {
        console.error("Equipped: character-image resp not ok:", resp.status);
        return { ok: false, reason: "http_" + resp.status };
      }
      const blob = await resp.blob();
      if (!previewTokenAlive(token)) return { ok: false, reason: "stale" };
      if (!blob || blob.size < 24) return { ok: false, reason: "empty" };
      const url = URL.createObjectURL(blob);
      if (!previewTokenAlive(token)) {
        try { URL.revokeObjectURL(url); } catch (_) {}
        return { ok: false, reason: "stale" };
      }
      if (window.__EquippedCharImgUrl && window.__EquippedCharImgUrl !== url) {
        try { URL.revokeObjectURL(window.__EquippedCharImgUrl); } catch (_) {}
      }
      window.__EquippedCharImgUrl = url;
      return { ok: true, url: url };
    } catch (err) {
      console.error("Equipped: loadCharacterImage error", err);
      return { ok: false, reason: "error" };
    }
  }

  function _bgCandidates(o) {
    if (typeof _iconCandidates === "function") return _iconCandidates(o);
    const raw = o?.icon || o?.img || o?.image || o?.image_path || o?.imageUrl || "";
    const key = String(o?.item_key || o?.key || o?.itemKey || o?.item || "").trim().toLowerCase();
    const isGear = !!o?.slot;
    const list = [];
    if (raw) list.push(raw);
    if (key) {
      list.push(isGear ? `/assets/equip/${key}.png` : `/assets/items/${key}.png`);
      list.push(isGear ? `/assets/equip/${key}.webp` : `/assets/items/${key}.webp`);
      list.push(`https://res.cloudinary.com/dnjwvxinh/image/upload/f_auto,q_auto/equip/${key}.png`);
    }
    list.push(`/assets/items/unknown.png`);
    const base = window.location.origin;
    const v = window.WEBAPP_VER || "";
    return [...new Set(list.filter(Boolean).map((u) => {
      let p = String(u).trim();
      if (/^https?:\/\//i.test(p) || p.startsWith("blob:") || p.startsWith("data:")) return p;
      if (!p.startsWith("/")) p = "/" + p.replace(/^\.?\//, "");
      let url = (/^https?:\/\//i.test(base) ? base : "") + p;
      if (!url) url = p;
      if (v && !/^https?:\/\/res\.cloudinary/.test(url)) url += (url.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(v);
      return url;
    }))];
  }

  function _setBgWithFallback(el, o) {
    if (!el) return;
    const urls = _bgCandidates(o);
    let i = 0;
    const tryOne = () => {
      const CLOUD = "dnjwvxinh";
      const CDN = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto`;
      const u = urls[i];
      if (!u) {
        el.style.backgroundImage = `url('${CDN}/items/unknown.png')`;
        return;
      }
      const im = new Image();
      im.onload = () => { el.style.backgroundImage = `url('${u}')`; };
      im.onerror = () => { i++; if (i < urls.length) tryOne(); else el.style.backgroundImage = `url('${CDN}/items/unknown.png')`; };
      im.src = u;
    };
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("visibility", "visible", "important");
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
    el.style.backgroundSize = "contain";
    tryOne();
  }

  function _mountPetSprite(container, pet, className) {
    if (!container || !pet || !pet.isPet || !window.PetSprite?.hasSprite?.(pet)) return false;
    try {
      container.style.backgroundImage = "none";
      container.textContent = "";
      window.PetSprite.mount(container, pet, {
        state: "idle",
        className: className || "equip-pet-sprite",
        fallbackUrl: pet.icon || pet.img || "",
        alt: pet.name || pet.itemName || "pet"
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  function layoutMode() {
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    if (h >= w && w < 900) return "portrait";
    if (h < 520 && w >= h) return "mobile-landscape";
    if (w < 1100) return "tablet";
    return "wide";
  }

  window.Equipped = {
    state: null,
    selectedEquippedSlotKey: null,
    selectedBackpackItemKey: null,
    backpackCategory: "all",
    backpackSearch: "",
    compatibleOnly: false,
    pendingAction: null,
    portraitPane: "loadout",
    backpackItems: [],
    backpackError: null,
    equippedError: null,
    backpackReady: false,
    equippedReady: false,

    _containerEl: null,
    _containerPrev: null,
    _fallbackCharSrc: "",
    _lastFingerprint: "",
    _toastTimer: 0,
    _resizeBound: false,
    _previewState: PREVIEW_STATE.LOADING,
    _previewSource: "",
    _previewSourceKind: PREVIEW_SOURCE.NONE,
    _previewLocked: false,
    _activePet: null,
    _petResolved: false,
    _petPreviewToken: 0,

    _canonicalSlotKeys() {
      return CANONICAL_SLOTS.slice();
    },

    _slotState(slotKey) {
      const key = String(slotKey || "").toLowerCase();
      const current = (this.state?.slots || []).find((slot) => String(slot?.slot || "").toLowerCase() === key);
      return current || { slot: key, label: slotLabel(key), empty: true };
    },

    _ensureSelectedSlot() {
      const keys = this._canonicalSlotKeys();
      if (!keys.length) {
        this.selectedEquippedSlotKey = null;
        return null;
      }
      if (keys.includes(this.selectedEquippedSlotKey)) return this.selectedEquippedSlotKey;

      const weapon = keys.includes("weapon") ? this._slotState("weapon") : null;
      if (weapon && !weapon.empty) {
        this.selectedEquippedSlotKey = "weapon";
        return this.selectedEquippedSlotKey;
      }
      const firstOccupied = keys.find((key) => !this._slotState(key).empty);
      this.selectedEquippedSlotKey = firstOccupied || (keys.includes("weapon") ? "weapon" : keys[0]);
      return this.selectedEquippedSlotKey;
    },

    _syncExternalState(data) {
      if (data && typeof data === "object") {
        this.state = data;
        window.__AH_EQUIPPED_STATE__ = data;
      }
    },

    _fingerprint() {
      return (this.state?.slots || []).map((s) => {
        return `${normKey(s?.slot)}:${itemKeyOf(s)}:${s?.empty ? 0 : 1}`;
      }).join("|");
    },

    _toast(msg, kind) {
      const el = document.getElementById("eq-toast");
      if (!el) {
        showAlert(msg);
        return;
      }
      el.textContent = String(msg || "");
      el.classList.toggle("is-err", kind === "error");
      el.classList.add("is-on");
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => el.classList.remove("is-on"), 2800);
    },

    _restoreContainer() {
      const c = this._containerEl;
      const p = this._containerPrev || {};
      if (!c) return;
      try { c.style.height = (p.height != null ? p.height : ""); } catch (_) {}
      try { c.style.overflow = (p.overflow != null ? p.overflow : ""); } catch (_) {}
    },

    _selectSlot(slotKey) {
      const key = String(slotKey || "").toLowerCase();
      if (!this._canonicalSlotKeys().includes(key)) return;
      this.selectedEquippedSlotKey = key;
      const backpack = this._backpackItemByKey(this.selectedBackpackItemKey);
      if (!backpack || itemSlotOf(backpack) !== key) this.selectedBackpackItemKey = null;
      this._paintSelection();
      this._renderBackpack();
      this._renderCompare();
    },

    _selectBackpackItem(key) {
      const item = this._backpackItemByKey(key);
      if (!item) {
        this.selectedBackpackItemKey = null;
        this._renderBackpack();
        this._renderCompare();
        return;
      }
      this.selectedBackpackItemKey = itemKeyOf(item);
      const slot = itemSlotOf(item);
      if (this._canonicalSlotKeys().includes(slot)) this.selectedEquippedSlotKey = slot;
      this._paintSelection();
      this._renderBackpack();
      this._renderCompare();
    },

    _backpackItemByKey(key) {
      const want = String(key || "");
      if (!want) return null;
      return (this.backpackItems || []).find((it) => itemKeyOf(it) === want) || null;
    },

    _isEquipmentItem(it) {
      const slot = itemSlotOf(it);
      if (CANONICAL_SLOTS.includes(slot)) return true;
      const type = normKey(it?.type);
      return CANONICAL_SLOTS.includes(type);
    },

    _filteredBackpack() {
      const cat = CATEGORIES.find((c) => c.id === this.backpackCategory) || CATEGORIES[0];
      const q = String(this.backpackSearch || "").trim().toLowerCase();
      const slotFilter = this.compatibleOnly ? this.selectedEquippedSlotKey : null;
      return (this.backpackItems || []).filter((it) => {
        if (!this._isEquipmentItem(it)) return false;
        const slot = itemSlotOf(it);
        const resolved = resolveBackpackCategory(it);
        if (cat.id === "pets") {
          if (slot !== "pet") return false;
        } else if (cat.id !== "all") {
          if (resolved === BACKPACK_CAT.PETS) return false;
          if (resolved !== cat.id) return false;
        }
        if (slotFilter && slot !== slotFilter) return false;
        if (!q) return true;
        const blob = [
          itemNameOf(it), itemKeyOf(it), slot, it.rarity, itemSetOf(it)
        ].join(" ").toLowerCase();
        return blob.includes(q);
      });
    },

    _setPreview(selected) {
      if (!selected) return null;
      const nextSet = itemSetOf(selected);
      const nextSlot = itemSlotOf(selected);
      if (!nextSet && !nextSlot) return null;
      const counts = {};
      for (const key of CANONICAL_SLOTS) {
        const slot = this._slotState(key);
        if (slot.empty) continue;
        const setName = itemSetOf(slot);
        if (!setName) continue;
        counts[setName] = (counts[setName] || 0) + 1;
      }
      const current = { ...counts };
      const replacing = this._slotState(nextSlot);
      if (!replacing.empty) {
        const prevSet = itemSetOf(replacing);
        if (prevSet) counts[prevSet] = Math.max(0, (counts[prevSet] || 0) - 1);
      }
      if (nextSet) counts[nextSet] = (counts[nextSet] || 0) + 1;
      const names = Array.from(new Set([...Object.keys(current), ...Object.keys(counts)]))
        .filter((name) => (current[name] || 0) > 0 || (counts[name] || 0) > 0);
      if (!names.length) return null;
      return { current, next: counts, names };
    },

    closeInspect() {
      const back = document.getElementById("invItemBack");
      if (back?.dataset?.open !== "1") return false;
      try {
        window.Inventory?.closeItem?.();
        return true;
      } catch (_) {
        return false;
      }
    },

    close() {
      try { this.closeInspect(); } catch (_) {}
      try { this._restoreContainer(); } catch (_) {}
      try { window.navClose?.("equipped-root"); } catch (_) {}
      try {
        if (typeof window.goHome === "function") window.goHome();
        else window.location.reload();
      } catch (_) {
        window.location.reload();
      }
      return true;
    },

    async open() {
      ensureEquippedStyles();
      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach((el) => {
        el.style.display = "none";
      });

      const skin = document.getElementById("player-skin");
      this._fallbackCharSrc = String(skin?.currentSrc || skin?.src || "").trim();
      this._previewState = PREVIEW_STATE.LOADING;
      this._previewSource = "";
      this._previewSourceKind = PREVIEW_SOURCE.NONE;
      this._previewLocked = false;
      window.__EquippedPreviewReady = false;
      window.__AH_EQUIPPED_PREVIEW_STATE__ = PREVIEW_STATE.LOADING;
      window.__AH_EQUIPPED_PREVIEW_SOURCE__ = PREVIEW_SOURCE.NONE;
      window.__AH_EQUIPPED_PREVIEW_LOG__ = [];

      const container = document.getElementById("app") || document.body;
      try {
        this._containerEl = container;
        this._containerPrev = {
          height: container.style.height,
          overflow: container.style.overflow
        };
        container.style.height = "calc(var(--vh, 1vh) * 100)";
        container.style.overflow = "hidden";
      } catch (_) {}

      this.backpackItems = [];
      this.backpackError = null;
      this.equippedError = null;
      this.backpackReady = false;
      this.equippedReady = false;
      this.pendingAction = null;
      this.backpackSearch = "";
      this.compatibleOnly = false;
      this.portraitPane = this.portraitPane || "loadout";
      this._lastFingerprint = "";
      this._activePet = null;
      this._petResolved = false;
      this._petPreviewToken = 0;

      this._renderShell(container);
      this._bindEquippedEvents();
      this._bindResize();
      this._applyLayout();

      try {
        window.navRegister?.("equipped-root", {
          close: () => this.close(),
          isOpen: () => !!document.getElementById("equipped-root")
        });
        window.navOpen?.("equipped-root");
      } catch (_) {}

      try {
        await this.refresh();
      } catch (e) {
        console.error("Equipped.open error", e);
        this._toast("Error while loading equipped.", "error");
      }
    },

    _renderShell(container) {
      container.innerHTML = `
        <div id="equipped-root" data-layout="wide" data-pane="loadout" data-preview="loading">
          <header class="eq-header">
            <button type="button" class="eq-hbtn" data-equipped-action="back" aria-label="Back">Back</button>
            <div class="eq-header-brand">
              <div class="eq-header-kicker">${wolfMark()} EQUIPPED</div>
              <div class="eq-header-sub">Alpha Loadout</div>
            </div>
            <button type="button" class="eq-hbtn" data-equipped-action="open-inventory" aria-label="Open Inventory">Inventory</button>
          </header>
          <div class="eq-shell">
            <div class="eq-mobile-tabs" id="eq-mobile-tabs">
              <button type="button" class="eq-tab is-on" data-equipped-action="pane-loadout">Loadout</button>
              <button type="button" class="eq-tab" data-equipped-action="pane-backpack">Backpack</button>
            </div>
            <aside class="eq-panel" id="eq-loadout" aria-label="Loadout">
              <div class="eq-panel-title">Loadout</div>
              <div class="eq-loadout-list" id="eq-loadout-list">
                <div class="eq-skel">Loading loadout…</div>
              </div>
            </aside>
            <section class="eq-panel eq-character" id="eq-character" aria-label="Character">
              <div class="eq-panel-title">Character</div>
              <div class="eq-char-stage">
                <div class="eq-nodes eq-nodes-left" id="eq-nodes-left"></div>
                <div class="eq-char-hero">
                  <div class="eq-char-frame">
                    <div class="eq-char-skel is-on" id="eq-char-skel"></div>
                    <img id="equipped-character-img" alt="Character" />
                    <div class="eq-pet-companion" id="eq-pet-companion" hidden aria-hidden="true">
                      <div class="eq-pet-companion__visual" id="eq-pet-companion-visual">
                        <img class="eq-pet-companion__image" id="eq-pet-companion-img" alt="" draggable="false" />
                      </div>
                    </div>
                    <div class="eq-char-fallback" id="eq-char-fallback" hidden>Character preview unavailable</div>
                  </div>
                </div>
                <div class="eq-nodes eq-nodes-right" id="eq-nodes-right"></div>
              </div>
              <div class="eq-char-meta" id="eq-char-meta"></div>
            </section>
            <aside class="eq-panel" id="eq-backpack" aria-label="Backpack">
              <div class="eq-panel-title">Backpack</div>
              <div id="eq-backpack-body"><div class="eq-skel">Loading backpack…</div></div>
            </aside>
          </div>
          <footer class="eq-sets" id="eq-sets" aria-label="Active set bonuses"></footer>
          <div id="eq-toast" class="eq-toast" role="status" aria-live="polite"></div>
        </div>
      `;
    },

    _bindResize() {
      if (this._resizeBound) return;
      this._resizeBound = true;
      window.addEventListener("resize", () => this._applyLayout());
    },

    _syncPortraitScroll(mode) {
      const container = this._containerEl || document.getElementById("app") || document.body;
      if (!container) return;
      const portrait = mode === "portrait";
      try {
        container.style.height = "calc(var(--vh, 1vh) * 100)";
        if (portrait) {
          container.style.overflow = "auto";
          container.style.overflowX = "hidden";
          container.style.overflowY = "auto";
          container.style.webkitOverflowScrolling = "touch";
        } else {
          container.style.overflow = "hidden";
          container.style.overflowX = "";
          container.style.overflowY = "";
          container.style.webkitOverflowScrolling = "";
        }
      } catch (_) {}
    },

    _applyLayout() {
      const root = document.getElementById("equipped-root");
      if (!root) return;
      const mode = layoutMode();
      root.dataset.layout = mode;
      root.dataset.pane = this.portraitPane || "loadout";
      this._syncPortraitScroll(mode);
      const tabs = document.getElementById("eq-mobile-tabs");
      if (tabs) {
        tabs.querySelectorAll(".eq-tab").forEach((btn) => {
          const isLoadout = btn.dataset.equippedAction === "pane-loadout";
          btn.classList.toggle("is-on", isLoadout ? this.portraitPane !== "backpack" : this.portraitPane === "backpack");
        });
      }
    },

    _bindEquippedEvents() {
      const root = document.getElementById("equipped-root");
      if (!root || root.dataset.equippedEventsBound === "1") return;
      root.dataset.equippedEventsBound = "1";
      root.addEventListener("click", (event) => {
        const slotButton = event.target.closest("[data-equip-slot]");
        if (slotButton && root.contains(slotButton)) {
          event.preventDefault();
          haptic("light");
          this._selectSlot(slotButton.dataset.equipSlot);
          return;
        }
        const tile = event.target.closest("[data-backpack-key]");
        if (tile && root.contains(tile)) {
          event.preventDefault();
          haptic("light");
          this._selectBackpackItem(tile.dataset.backpackKey);
          return;
        }
        const cat = event.target.closest("[data-eq-cat]");
        if (cat && root.contains(cat)) {
          event.preventDefault();
          haptic("light");
          this.backpackCategory = cat.dataset.eqCat || "all";
          this._renderBackpack();
          return;
        }
        const actionButton = event.target.closest("[data-equipped-action]");
        if (!actionButton || !root.contains(actionButton)) return;
        event.preventDefault();
        const action = actionButton.dataset.equippedAction;
        if (action === "back") this.close();
        else if (action === "inspect") this.inspectSelected();
        else if (action === "unequip") this.unequipSelected();
        else if (action === "equip") this.equipSelected();
        else if (action === "open-inventory") this.openInventory();
        else if (action === "manage-pet") this.managePet();
        else if (action === "retry-equipped") this.refresh();
        else if (action === "retry-backpack") this._loadBackpack().then(() => this._renderBackpack());
        else if (action === "compatible") {
          this.compatibleOnly = !this.compatibleOnly;
          haptic("light");
          this._renderBackpack();
        } else if (action === "pane-loadout") {
          this.portraitPane = "loadout";
          this._applyLayout();
        } else if (action === "pane-backpack") {
          this.portraitPane = "backpack";
          this._applyLayout();
        }
      });
      root.addEventListener("input", (event) => {
        const search = event.target.closest("[data-eq-search]");
        if (!search) return;
        this.backpackSearch = search.value || "";
        this._renderBackpack({ keepSearch: true });
      });
    },

    async refresh() {
      if (!this._previewLocked) window.__EquippedPreviewReady = false;
      const eqPromise = this._loadEquipped();
      const bpPromise = this._loadBackpack();
      const petPromise = this._loadActivePet();
      await Promise.allSettled([eqPromise, bpPromise, petPromise]);
      this._ensureSelectedSlot();
      this._renderLoadout();
      this._renderNodes();
      this._renderStats();
      this._renderSets();
      this._renderBackpack();
      this._renderCompare();
      this._requestCharacterImage(false);
      this._syncPetCompanion();
    },

    async _loadEquipped() {
      if (!hasInitData()) {
        this._syncExternalState(previewFixtureState());
        this.equippedError = null;
        this.equippedReady = true;
        if (!this._fallbackCharSrc) this._fallbackCharSrc = CANONICAL_ALPHA_FALLBACK;
        return;
      }
      try {
        const res = await equippedPost("/webapp/equipped/state", {});
        if (!res || !res.ok) {
          this.equippedError = res?.reason || res?.message || "Failed to load equipped state.";
          this.equippedReady = false;
          console.error("Equipped.state error:", res);
          this._renderLoadout();
          this._renderStats();
          this._renderSets();
          return;
        }
        const data = res.data || res.state || res;
        this._syncExternalState(data);
        this.equippedError = null;
        this.equippedReady = true;
      } catch (err) {
        console.error("Equipped.refresh error", err);
        this.equippedError = err?.message === "NO_INIT_DATA"
          ? "Equipped needs a live Telegram session."
          : "Error while loading equipped.";
        this.equippedReady = false;
        this._renderLoadout();
      }
    },

    async _loadBackpack() {
      if (!hasInitData()) {
        this.backpackItems = previewFixtureBackpack();
        this.backpackError = null;
        this.backpackReady = true;
        try { window.__AH_EQUIPPED_BACKPACK_AUDIT__ = auditBackpackCategories(this.backpackItems); } catch (_) {}
        return;
      }
      try {
        const res = await equippedPost("/webapp/inventory/state", {});
        if (!res || res.ok === false) {
          this.backpackError = res?.reason || res?.message || "Failed to load backpack.";
          this.backpackReady = false;
          this.backpackItems = [];
          return;
        }
        const items = res.slots || res.data?.slots || res.items || [];
        this.backpackItems = Array.isArray(items) ? items : [];
        this.backpackError = null;
        this.backpackReady = true;
        try { window.__AH_EQUIPPED_BACKPACK_AUDIT__ = auditBackpackCategories(this.backpackItems); } catch (_) {}
      } catch (err) {
        console.error("Equipped backpack error", err);
        this.backpackError = err?.message === "NO_INIT_DATA"
          ? "Backpack needs a live Telegram session."
          : "Failed to load backpack.";
        this.backpackReady = false;
        this.backpackItems = [];
      }
    },

    _renderLoadout() {
      const list = document.getElementById("eq-loadout-list");
      if (!list) return;
      if (this.equippedError && !this.state) {
        list.innerHTML = `
          <div class="eq-error">${esc(this.equippedError)}</div>
          <div style="text-align:center;">
            <button type="button" class="eq-retry" data-equipped-action="retry-equipped">Retry</button>
          </div>`;
        return;
      }
      if (!this.state) {
        list.innerHTML = `<div class="eq-skel">Loading loadout…</div>`;
        return;
      }
      const selected = this._ensureSelectedSlot();
      list.innerHTML = CANONICAL_SLOTS.map((slotKey) => {
        const slot = this._slotState(slotKey);
        const empty = !!slot.empty;
        const rarity = empty ? "common" : normRarity(slot.rarity);
        const name = empty ? "EMPTY" : (itemNameOf(slot) || "Unknown");
        const level = itemLevelOf(slot);
        const rarityText = empty ? "" : String(slot.rarity || rarity).toUpperCase();
        const meta = empty
          ? slotLabel(slotKey, slot)
          : [rarityText, level != null ? `LV ${level}` : ""].filter(Boolean).join(" · ");
        return `
          <button type="button" class="eq-slot${empty ? " is-empty" : ""}${slotKey === selected ? " is-selected" : ""}"
                  data-equip-slot="${esc(slotKey)}" data-rarity="${rarity}"
                  aria-label="${esc(slotLabel(slotKey, slot))}: ${esc(name)}"
                  aria-pressed="${slotKey === selected ? "true" : "false"}">
            <span class="eq-slot-kind">${slotGlyph(slotKey)}</span>
            <span class="eq-icon" data-eq-icon="${esc(slotKey)}" data-rarity="${rarity}">
              ${empty ? `<span class="eq-icon-ph">${esc(slotAbbr(slotKey))}</span>` : ""}
            </span>
            <span class="eq-slot-copy">
              <span class="eq-slot-name">${esc(name)}</span>
              <span class="eq-slot-meta">${esc(meta)}</span>
            </span>
          </button>`;
      }).join("");
      CANONICAL_SLOTS.forEach((slotKey) => {
        const slot = this._slotState(slotKey);
        const box = list.querySelector(`[data-eq-icon="${slotKey}"]`);
        if (!box || slot.empty) return;
        if (!_mountPetSprite(box, slot, "equip-pet-sprite equip-pet-sprite-list")) {
          const src = _bgCandidates(slot)[0];
          if (src) {
            box.innerHTML = `<img class="item-icon" alt="" src="${esc(src)}" data-icon-i="0">`;
            const img = box.querySelector("img");
            if (img) img.onerror = () => this._iconError(img, slot);
          } else {
            _setBgWithFallback(box, slot);
          }
        }
      });
    },

    _renderNodes() {
      const left = document.getElementById("eq-nodes-left");
      const right = document.getElementById("eq-nodes-right");
      if (!left || !right) return;
      const renderSide = (el, keys) => {
        const selected = this.selectedEquippedSlotKey;
        el.innerHTML = keys.map((slotKey) => {
          const slot = this._slotState(slotKey);
          const empty = !!slot.empty;
          const rarity = empty ? "common" : normRarity(slot.rarity);
          return `
            <button type="button" class="eq-node${empty ? " is-empty" : ""}${slotKey === selected ? " is-selected" : ""}"
                    data-equip-slot="${esc(slotKey)}" data-rarity="${rarity}"
                    aria-label="${esc(slotLabel(slotKey, slot))}">
              <span class="eq-icon" data-eq-node-icon="${esc(slotKey)}" data-rarity="${rarity}">
                ${empty ? slotGlyph(slotKey) : ""}
              </span>
            </button>`;
        }).join("");
        keys.forEach((slotKey) => {
          const slot = this._slotState(slotKey);
          if (slot.empty) return;
          const box = el.querySelector(`[data-eq-node-icon="${slotKey}"]`);
          if (!box) return;
          if (!_mountPetSprite(box, slot, "equip-pet-sprite equip-pet-sprite-hotspot")) {
            const src = _bgCandidates(slot)[0];
            if (src) {
              box.innerHTML = `<img class="item-icon" alt="" src="${esc(src)}">`;
              const img = box.querySelector("img");
              if (img) img.onerror = () => this._iconError(img, slot);
            } else _setBgWithFallback(box, slot);
          }
        });
      };
      renderSide(left, LEFT_NODES);
      renderSide(right, RIGHT_NODES);
    },

    _renderStats() {
      const box = document.getElementById("eq-char-meta");
      if (!box) return;
      const stats = this.state?.stats || {};
      const level = stats.level ?? this.state?.level;
      const hasLevel = level != null && String(level) !== "";
      const chips = CHAR_STATS.map((row) => {
        const value = pickStat(stats, row.key, row.alts);
        const shown = value == null || value === "" ? "—" : value;
        return `<div class="eq-stat">
          ${statGlyph(row.label)}
          <span>${row.label}</span>
          <b>${esc(shown)}</b>
        </div>`;
      }).join("");
      box.innerHTML = `
        ${hasLevel ? `<div class="eq-level"><span>LEVEL</span><b>${esc(level)}</b></div>` : ""}
        <div class="eq-stats">${chips}</div>
      `;
    },

    _resolveCharacterSources() {
      const sources = resolveCharacterSources();
      if (isUsableImageUrl(this._fallbackCharSrc)) {
        sources.fallbacks = uniqueImageUrls([
          sources.skin,
          sources.profile,
          this._fallbackCharSrc,
          sources.canonical
        ]);
      }
      return sources;
    },

    _setPreviewState(state, url, kind) {
      const next = PREVIEW_STATE[String(state || "").toUpperCase()] || state || PREVIEW_STATE.LOADING;
      const img = document.getElementById("equipped-character-img");
      const visibleImage = !!(img && (img.naturalWidth > 0 || (img.complete && isUsableImageUrl(img.currentSrc || img.src))));
      let applied = next;
      if (applied === PREVIEW_STATE.FAILED && visibleImage) {
        applied = PREVIEW_STATE.FALLBACK;
      }
      this._previewState = applied;
      if (url) this._previewSource = url;
      if (kind) {
        this._previewSourceKind = kind;
        window.__AH_EQUIPPED_PREVIEW_SOURCE__ = kind;
      }
      window.__AH_EQUIPPED_PREVIEW_STATE__ = applied;
      window.__EquippedPreviewState = applied;
      const root = document.getElementById("equipped-root");
      if (root) {
        root.dataset.preview = applied;
        if (this._previewSourceKind) root.dataset.previewSource = this._previewSourceKind;
      }
      const skel = document.getElementById("eq-char-skel");
      const fallback = document.getElementById("eq-char-fallback");
      const loading = applied === PREVIEW_STATE.LOADING;
      const failed = applied === PREVIEW_STATE.FAILED;
      if (skel) {
        skel.hidden = !loading;
        skel.classList.toggle("is-on", loading);
      }
      if (fallback) {
        fallback.hidden = !failed;
        fallback.classList.toggle("is-on", failed);
      }
      if (img) {
        img.classList.toggle("is-ready", applied === PREVIEW_STATE.READY || applied === PREVIEW_STATE.FALLBACK);
        img.classList.toggle("is-fallback", applied === PREVIEW_STATE.FALLBACK);
      }
      if (applied === PREVIEW_STATE.READY || applied === PREVIEW_STATE.FALLBACK || applied === PREVIEW_STATE.FAILED) {
        window.__EquippedPreviewReady = true;
        window.__EquippedPreviewReadyAt = Date.now();
      } else {
        window.__EquippedPreviewReady = false;
      }
      logPreviewEvent("state", { applied, kind: this._previewSourceKind || "", url: url || this._previewSource || "" });
      this._applyPetCompanionVisibility();
    },

    _acceptPreviewSource(kind, url, token, state) {
      if (!previewTokenAlive(token)) return false;
      const nextKind = PREVIEW_SOURCE[String(kind || "").replace(/-/g, "_").toUpperCase()] || kind || PREVIEW_SOURCE.NONE;
      const nextRank = previewSourceRank(nextKind);
      const currentRank = previewSourceRank(this._previewSourceKind);
      if (nextRank < currentRank) {
        logPreviewEvent("reject-lower-source", { attempted: nextKind, current: this._previewSourceKind, url: url || "" });
        return false;
      }
      if (this._previewLocked && nextRank < currentRank) {
        logPreviewEvent("reject-locked", { attempted: nextKind, current: this._previewSourceKind });
        return false;
      }
      if (url) this._previewSource = url;
      this._previewSourceKind = nextKind;
      this._previewLocked = nextRank >= previewSourceRank(PREVIEW_SOURCE.PROFILE);
      window.__AH_EQUIPPED_PREVIEW_SOURCE__ = nextKind;
      this._setPreviewState(state || PREVIEW_STATE.READY, url, nextKind);
      logPreviewEvent("accept", { kind: nextKind, url: url || "", locked: this._previewLocked });
      return true;
    },

    _awaitImage(imgEl, url, token) {
      return new Promise((resolve) => {
        if (!imgEl || !isUsableImageUrl(url)) return resolve(false);
        if (!previewTokenAlive(token)) return resolve(false);
        let settled = false;
        const finish = (ok) => {
          if (settled) return;
          settled = true;
          if (!previewTokenAlive(token)) return resolve(false);
          resolve(!!ok && imgEl.naturalWidth > 0);
        };
        imgEl.onload = () => finish(true);
        imgEl.onerror = () => finish(false);
        imgEl.alt = "Character";
        imgEl.decoding = "async";
        imgEl.src = url;
        if (imgEl.complete && imgEl.naturalWidth > 0) finish(true);
        setTimeout(() => finish(false), 2500);
      });
    },

    async _applyFallbackPreview(token) {
      if (!previewTokenAlive(token)) return false;
      if (previewSourceRank(this._previewSourceKind) >= previewSourceRank(PREVIEW_SOURCE.PROFILE)) return true;
      const imgEl = document.getElementById("equipped-character-img");
      if (!imgEl) return false;
      const sources = this._resolveCharacterSources();
      const chain = uniqueImageUrls([sources.canonical, this._fallbackCharSrc]);
      for (let i = 0; i < chain.length; i++) {
        if (!previewTokenAlive(token)) return false;
        const ok = await this._awaitImage(imgEl, chain[i], token);
        if (!previewTokenAlive(token)) return false;
        if (ok) {
          this._acceptPreviewSource(PREVIEW_SOURCE.FALLBACK, chain[i], token, PREVIEW_STATE.FALLBACK);
          return true;
        }
      }
      if (imgEl.naturalWidth > 0) {
        this._acceptPreviewSource(PREVIEW_SOURCE.FALLBACK, imgEl.currentSrc || imgEl.src, token, PREVIEW_STATE.FALLBACK);
        return true;
      }
      this._setPreviewState(PREVIEW_STATE.FAILED);
      return false;
    },

    async _applyLocalIdentity(token) {
      if (!previewTokenAlive(token)) return false;
      const imgEl = document.getElementById("equipped-character-img");
      if (!imgEl) return false;
      const sources = this._resolveCharacterSources();
      if (sources.skin) {
        const ok = await this._awaitImage(imgEl, sources.skin, token);
        if (!previewTokenAlive(token)) return false;
        if (ok) return this._acceptPreviewSource(PREVIEW_SOURCE.ACTIVE_SKIN, sources.skin, token, PREVIEW_STATE.READY);
      }
      if (sources.profile) {
        const ok = await this._awaitImage(imgEl, sources.profile, token);
        if (!previewTokenAlive(token)) return false;
        if (ok) return this._acceptPreviewSource(PREVIEW_SOURCE.PROFILE, sources.profile, token, PREVIEW_STATE.READY);
      }
      return false;
    },

    _requestCharacterImage(force) {
      const imgEl = document.getElementById("equipped-character-img");
      if (!imgEl) return;
      const fp = this._fingerprint();
      const keepHero =
        previewSourceRank(this._previewSourceKind) >= previewSourceRank(PREVIEW_SOURCE.PROFILE) &&
        (this._previewState === PREVIEW_STATE.READY || this._previewState === PREVIEW_STATE.FALLBACK) &&
        imgEl.naturalWidth > 0;
      if (keepHero) {
        this._lastFingerprint = fp;
        logPreviewEvent("keep-hero", { force: !!force, kind: this._previewSourceKind, url: this._previewSource || "" });
        return;
      }
      if (
        !force &&
        fp &&
        fp === this._lastFingerprint &&
        this._previewState &&
        this._previewState !== PREVIEW_STATE.LOADING &&
        this._previewState !== PREVIEW_STATE.FAILED &&
        imgEl.getAttribute("src")
      ) return;
      this._lastFingerprint = fp;
      const previewToken = (Number(window.__EquippedPreviewToken || 0) || 0) + 1;
      window.__EquippedPreviewToken = previewToken;
      window.__EquippedPreviewReady = false;
      this._previewLocked = false;
      this._previewSourceKind = PREVIEW_SOURCE.NONE;
      window.__AH_EQUIPPED_PREVIEW_SOURCE__ = PREVIEW_SOURCE.NONE;
      this._setPreviewState(PREVIEW_STATE.LOADING);
      logPreviewEvent("resolve-start", { token: previewToken });

      this._applyLocalIdentity(previewToken).then((localOk) => {
        if (!previewTokenAlive(previewToken)) return;
        this._loadCompositeInBackground(previewToken, !!localOk);
      }).catch(() => {
        if (!previewTokenAlive(previewToken)) return;
        this._loadCompositeInBackground(previewToken, false);
      });
    },

    _loadCompositeInBackground(token, localOk) {
      loadCharacterComposite(token).then(async (result) => {
        if (!previewTokenAlive(token)) return;
        if (previewSourceRank(this._previewSourceKind) >= previewSourceRank(PREVIEW_SOURCE.PROFILE)) {
          logPreviewEvent("composite-ignored", {
            reason: "higher-authority",
            current: this._previewSourceKind,
            compositeOk: !!(result && result.ok)
          });
          return;
        }
        if (result && result.ok && result.url) {
          const imgEl = document.getElementById("equipped-character-img");
          const ok = await this._awaitImage(imgEl, result.url, token);
          if (!previewTokenAlive(token)) return;
          if (ok && this._acceptPreviewSource(PREVIEW_SOURCE.COMPOSITE, result.url, token, PREVIEW_STATE.READY)) {
            return;
          }
        }
        if (previewSourceRank(this._previewSourceKind) < previewSourceRank(PREVIEW_SOURCE.COMPOSITE)) {
          await this._applyFallbackPreview(token);
        }
      }).catch(async () => {
        if (!previewTokenAlive(token)) return;
        if (previewSourceRank(this._previewSourceKind) < previewSourceRank(PREVIEW_SOURCE.COMPOSITE)) {
          await this._applyFallbackPreview(token);
        } else if (!localOk && previewSourceRank(this._previewSourceKind) < previewSourceRank(PREVIEW_SOURCE.PROFILE)) {
          await this._applyFallbackPreview(token);
        }
      });
    },

    _iconError(img, item) {
      if (!img) return;
      const i = Number(img.dataset.iconI || 0) + 1;
      const urls = _bgCandidates(item);
      if (i < urls.length) {
        img.dataset.iconI = String(i);
        img.src = urls[i];
        return;
      }
      img.style.display = "none";
    },

    async _loadActivePet() {
      this._activePet = null;
      this._petResolved = false;
      try {
        const cached = window.__AH_PETS_STATE__;
        if (cached && typeof cached === "object") {
          const fromCache = resolveActivePetRecord(cached);
          if (fromCache) this._activePet = fromCache;
        }
      } catch (_) {}
      if (!hasInitData()) {
        this._activePet = previewFixtureCompanion();
        this._petResolved = true;
        return;
      }
      try {
        const res = await equippedPost("/webapp/pets/state", {});
        const payload = res && (res.pets || res.data || res);
        if (res && res.ok === false) {
          this._petResolved = true;
          return;
        }
        if (payload && typeof payload === "object") {
          try { window.__AH_PETS_STATE__ = payload; } catch (_) {}
          this._activePet = resolveActivePetRecord(payload);
        }
      } catch (err) {
        console.warn("Equipped: active pet state unavailable", err);
      }
      this._petResolved = true;
    },

    _hidePetCompanion() {
      const host = document.getElementById("eq-pet-companion");
      const img = document.getElementById("eq-pet-companion-img");
      if (host) {
        host.hidden = true;
        host.classList.remove("is-ready");
        host.setAttribute("aria-hidden", "true");
        host.removeAttribute("data-pet-ready");
      }
      if (img) {
        img.onload = null;
        img.onerror = null;
        img.removeAttribute("src");
        img.alt = "";
      }
      this._applyPetCompanionVisibility();
    },

    _markPetCompanionReady() {
      const host = document.getElementById("eq-pet-companion");
      if (!host) return;
      if (this._previewState === PREVIEW_STATE.FAILED) {
        this._hidePetCompanion();
        return;
      }
      host.hidden = false;
      host.classList.add("is-ready");
      host.setAttribute("data-pet-ready", "1");
      host.setAttribute("aria-hidden", "true");
      this._applyPetCompanionVisibility();
    },

    _applyPetCompanionVisibility() {
      const host = document.getElementById("eq-pet-companion");
      const root = document.getElementById("equipped-root");
      const failed = this._previewState === PREVIEW_STATE.FAILED;
      const petReady = !!(host && host.getAttribute("data-pet-ready") === "1");
      if (host) {
        if (failed || !petReady) {
          host.hidden = true;
          host.classList.remove("is-ready");
          host.setAttribute("aria-hidden", "true");
        } else {
          host.hidden = false;
          host.classList.add("is-ready");
          host.setAttribute("aria-hidden", "true");
        }
      }
      if (root) {
        root.dataset.pet = failed ? "failed" : (petReady ? "ready" : "off");
      }
    },

    _syncPetCompanion() {
      const host = document.getElementById("eq-pet-companion");
      const img = document.getElementById("eq-pet-companion-img");
      if (!host || !img) return;

      const pet = this._activePet;
      if (!pet || this._previewState === PREVIEW_STATE.FAILED) {
        this._hidePetCompanion();
        return;
      }

      const urls = resolvePetVisualUrls(pet);
      if (!urls.length) {
        this._hidePetCompanion();
        return;
      }

      const token = (this._petPreviewToken || 0) + 1;
      this._petPreviewToken = token;
      host.hidden = false;
      host.classList.remove("is-ready");
      host.setAttribute("aria-hidden", "true");
      host.removeAttribute("data-pet-ready");

      let i = 0;
      const tryNext = () => {
        if (token !== this._petPreviewToken) return;
        if (i >= urls.length) {
          this._hidePetCompanion();
          return;
        }
        const url = urls[i++];
        img.onload = () => {
          if (token !== this._petPreviewToken) return;
          if (!img.naturalWidth) {
            tryNext();
            return;
          }
          if (this._previewState === PREVIEW_STATE.FAILED) {
            this._hidePetCompanion();
            return;
          }
          this._markPetCompanionReady();
        };
        img.onerror = () => {
          if (token !== this._petPreviewToken) return;
          tryNext();
        };
        img.decoding = "async";
        img.draggable = false;
        img.alt = "";
        img.src = url;
      };
      tryNext();
    },

    _renderBackpack(opts) {
      const body = document.getElementById("eq-backpack-body");
      if (!body) return;
      const keepSearch = opts && opts.keepSearch;
      const searchValue = keepSearch
        ? (body.querySelector("[data-eq-search]")?.value ?? this.backpackSearch)
        : this.backpackSearch;
      this.backpackSearch = searchValue;

      if (this.backpackError && !this.backpackReady) {
        body.innerHTML = `
          <div class="eq-error">${esc(this.backpackError)}</div>
          <div style="text-align:center;">
            <button type="button" class="eq-retry" data-equipped-action="retry-backpack">Retry backpack</button>
          </div>
          <div id="eq-compare-host"></div>`;
        this._renderCompare();
        return;
      }
      if (!this.backpackReady) {
        body.innerHTML = `<div class="eq-skel">Loading backpack…</div><div id="eq-compare-host"></div>`;
        this._renderCompare();
        return;
      }

      const items = this._filteredBackpack();
      const cats = CATEGORIES.map((c) => `
        <button type="button" class="eq-cat${this.backpackCategory === c.id ? " is-on" : ""}"
                data-eq-cat="${c.id}">${c.label}</button>`).join("");
      const tiles = items.length
        ? items.map((it) => {
            const key = itemKeyOf(it);
            const rarity = normRarity(it.rarity);
            const level = itemLevelOf(it);
            const qty = itemQtyOf(it);
            const selected = key && key === this.selectedBackpackItemKey;
            return `
              <button type="button" class="eq-tile${selected ? " is-selected" : ""}"
                      data-backpack-key="${esc(key)}" data-rarity="${rarity}"
                      aria-label="${esc(itemNameOf(it) || key)}" aria-pressed="${selected ? "true" : "false"}">
                <span class="eq-icon" data-bp-icon="${esc(key)}" data-rarity="${rarity}"></span>
                ${level != null ? `<span class="eq-tile-lv">LV ${esc(level)}</span>` : ""}
                ${qty != null ? `<span class="eq-tile-qty">${esc(qty)}</span>` : ""}
              </button>`;
          }).join("")
        : `<div class="eq-empty" style="grid-column:1/-1;">${
            this.compatibleOnly
              ? "No compatible items in backpack."
              : "No unequipped gear."
          }</div>`;

      body.innerHTML = `
        <div class="eq-backpack-tools">
          <div class="eq-cats" role="tablist">${cats}</div>
          <div class="eq-searchrow">
            <input class="eq-search" data-eq-search type="search" placeholder="Search items…"
                   value="${esc(this.backpackSearch)}" aria-label="Search backpack">
            <button type="button" class="eq-filter${this.compatibleOnly ? " is-on" : ""}"
                    data-equipped-action="compatible" aria-pressed="${this.compatibleOnly ? "true" : "false"}">
              Compatible
            </button>
          </div>
        </div>
        <div class="eq-grid">${tiles}</div>
        <div id="eq-compare-host"></div>
      `;

      items.forEach((it) => {
        const key = itemKeyOf(it);
        const box = body.querySelector('[data-bp-icon="' + String(key).replace(/"/g, "") + '"]');
        if (!box) return;
        if (!_mountPetSprite(box, it, "equip-pet-sprite")) {
          const src = _bgCandidates(it)[0];
          if (src) {
            box.innerHTML = `<img class="item-icon" alt="" src="${esc(src)}">`;
            const img = box.querySelector("img");
            if (img) img.onerror = () => this._iconError(img, it);
          } else _setBgWithFallback(box, it);
        }
      });
      this._renderCompare();
    },

    _renderCompare() {
      let host = document.getElementById("eq-compare-host");
      if (!host) {
        const body = document.getElementById("eq-backpack-body");
        if (!body) return;
        host = document.createElement("div");
        host.id = "eq-compare-host";
        body.appendChild(host);
      }
      const slotKey = this._ensureSelectedSlot();
      const equipped = slotKey ? this._slotState(slotKey) : null;
      const selected = this._backpackItemByKey(this.selectedBackpackItemKey);
      const pending = !!this.pendingAction;
      const isPetSlot = slotKey === "pet";

      const sideHtml = (label, item, emptyCopy) => {
        if (!item || item.empty) {
          return `<div class="eq-side">
            <span class="eq-icon" data-rarity="common"><span class="eq-icon-ph">—</span></span>
            <div>
              <div class="eq-side-kicker">${esc(label)}</div>
              <div class="eq-side-name">${esc(emptyCopy || "EMPTY SLOT")}</div>
            </div>
          </div>`;
        }
        const rarity = normRarity(item.rarity);
        const level = itemLevelOf(item);
        const src = _bgCandidates(item)[0] || "";
        return `<div class="eq-side" data-rarity="${rarity}">
          <span class="eq-icon" data-rarity="${rarity}">
            ${src ? `<img class="item-icon" alt="" src="${esc(src)}">` : `<span class="eq-icon-ph">${esc(slotAbbr(itemSlotOf(item) || slotKey))}</span>`}
          </span>
          <div>
            <div class="eq-side-kicker">${esc(label)}</div>
            <div class="eq-side-name">${esc(itemNameOf(item) || "Unknown")}</div>
            <div class="eq-side-meta">${esc([
              item.rarity ? String(item.rarity).toUpperCase() : "",
              level != null ? `LV ${level}` : "",
              itemSetOf(item)
            ].filter(Boolean).join(" · "))}</div>
          </div>
        </div>`;
      };

      let rowsHtml = "";
      if (selected) {
        const rows = compareRows(selected, equipped);
        rowsHtml = rows.length
          ? `<div class="eq-rows">${rows.map((row) => {
              const cls = row.delta > 0 ? "is-up" : row.delta < 0 ? "is-down" : "is-flat";
              const delta = row.delta > 0 ? `+${row.delta}` : String(row.delta);
              return `<div class="eq-row">
                <span class="k">${esc(row.label)}</span>
                <span class="a">${esc(row.equipped)}</span>
                <span class="b">${esc(row.selected)}</span>
                <span class="d ${cls}">${esc(delta)}</span>
              </div>`;
            }).join("")}</div>`
          : `<div class="eq-empty">No comparable stats on this item.</div>`;
      } else if (equipped && !equipped.empty) {
        const stats = itemStatsOf(equipped);
        const keys = orderedStatKeys(stats, {});
        const desc = String(equipped.description || equipped.bonusesText || "").trim();
        rowsHtml = `
          ${keys.length ? `<div class="eq-rows">${keys.map((k) => `
            <div class="eq-row">
              <span class="k">${esc(statPresentationLabel(k))}</span>
              <span class="a">${esc(formattedStatValue(stats[k]))}</span>
              <span class="b"></span>
              <span class="d is-flat"></span>
            </div>`).join("")}</div>` : ""}
          ${desc ? `<div class="eq-empty" style="text-align:left;padding:8px 4px;">${esc(desc)}</div>` : ""}
        `;
      } else {
        rowsHtml = `<div class="eq-empty">Select backpack gear to compare and equip.</div>`;
      }

      let setHtml = "";
      if (selected) {
        const preview = this._setPreview(selected);
        if (preview) {
          const fmt = (map) => preview.names
            .map((n) => `${n} (${map[n] || 0})`)
            .filter((line) => !line.endsWith("(0)"))
            .join(" · ") || "None";
          setHtml = `<div class="eq-set-preview">
            <div><div class="eq-side-kicker">Current set</div><b>${esc(fmt(preview.current))}</b></div>
            <div class="eq-vs">››</div>
            <div><div class="eq-side-kicker">If equipped</div><b>${esc(fmt(preview.next))}</b></div>
          </div>`;
        }
      }

      const actions = [];
      if (selected) {
        actions.push(`<button type="button" class="eq-action is-equip" data-equipped-action="equip" ${pending ? "disabled" : ""}>${pending && this.pendingAction === "equip" ? "Equipping…" : "Equip selected"}</button>`);
      }
      if (equipped && !equipped.empty) {
        actions.push(`<button type="button" class="eq-action is-unequip" data-equipped-action="unequip" ${pending ? "disabled" : ""}>${pending && this.pendingAction === "unequip" ? "Unequipping…" : "Unequip"}</button>`);
      }
      if (isPetSlot && typeof window.MyPets?.open === "function") {
        actions.push(`<button type="button" class="eq-action is-pet" data-equipped-action="manage-pet">Manage pet</button>`);
      }
      if (equipped && !equipped.empty && typeof window.Inventory?.openEquippedItem === "function") {
        actions.push(`<button type="button" class="eq-action" data-equipped-action="inspect">Inspect</button>`);
      }

      host.innerHTML = `
        <div class="eq-compare">
          <div class="eq-compare-pair">
            ${sideHtml("Equipped", equipped && !equipped.empty ? equipped : null, "EMPTY SLOT")}
            <div class="eq-vs">VS</div>
            ${selected ? sideHtml("Selected", selected) : sideHtml("Selected", null, "Select an item")}
          </div>
          ${rowsHtml}
          ${setHtml}
          ${actions.length ? `<div class="eq-actions" style="${actions.length === 1 ? "grid-template-columns:1fr;" : ""}">${actions.join("")}</div>` : ""}
        </div>
      `;
    },

    _renderSets() {
      const box = document.getElementById("eq-sets");
      if (!box) return;
      const sets = activeSetsOf(this.state);
      const total = totalBonusOf(this.state);
      const chips = compactBonusChips(total);
      if (!sets.length && !chips.length) {
        box.innerHTML = `
          <div class="eq-sets-head"><span>Active set bonuses</span></div>
          <div class="eq-empty" style="padding:6px 0;">No active set bonus</div>`;
        return;
      }
      const cards = sets.map((set) => {
        const bonus = set?.bonus && typeof set.bonus === "object" ? set.bonus : {};
        const bonusKeys = Object.keys(bonus);
        const bonusText = bonusKeys.length
          ? bonusKeys.map((k) => `${formattedStatValue(bonus[k])} ${statPresentationLabel(k)}`).join(" · ")
          : "";
        const count = set.count != null ? `${set.count} equipped` : "";
        return `<div class="eq-set-card">
          <div class="eq-set-mark">${wolfMark()}</div>
          <div>
            <b>${esc(set.set || set.name || "Set")}</b>
            <span>${esc([count, bonusText].filter(Boolean).join(" · "))}</span>
          </div>
        </div>`;
      }).join("");
      const bonusLine = chips.length
        ? `<div class="eq-bonus">
            <div class="eq-bonus-kicker">Total gear bonus</div>
            <div class="eq-bonus-chips">${chips.map((chip) =>
              `<span class="eq-bonus-chip"><b>${esc(formattedStatValue(chip.value))}</b> ${esc(chip.label)}</span>`
            ).join("")}</div>
          </div>`
        : "";
      box.innerHTML = `
        <div class="eq-sets-head"><span>Active set bonuses</span></div>
        <div class="eq-set-row">${cards || `<div class="eq-empty">No active set bonus</div>`}</div>
        ${bonusLine}
      `;
    },

    _paintSelection() {
      const root = document.getElementById("equipped-root");
      if (!root) return;
      const slot = this.selectedEquippedSlotKey;
      root.querySelectorAll("[data-equip-slot]").forEach((el) => {
        el.classList.toggle("is-selected", el.dataset.equipSlot === slot);
        if (el.getAttribute("aria-pressed") != null) {
          el.setAttribute("aria-pressed", el.dataset.equipSlot === slot ? "true" : "false");
        }
      });
    },

    openInventory() {
      try { window.navClose?.("equipped-root"); } catch (_) {}
      try { this._restoreContainer(); } catch (_) {}
      if (typeof window.Inventory?.open === "function") window.Inventory.open();
    },

    inspectSelected() {
      const slot = this._slotState(this.selectedEquippedSlotKey);
      if (!slot || slot.empty) return;
      const key = itemKeyOf(slot);
      if (!key || typeof window.Inventory?.openEquippedItem !== "function") return;
      window.Inventory.openEquippedItem(key);
    },

    managePet() {
      haptic("light");
      try { window.MyPets?.open?.(); } catch (_) {
        this._toast("Pet management is unavailable.", "error");
      }
    },

    async unequipSelected() {
      const slotKey = this.selectedEquippedSlotKey;
      const slot = this._slotState(slotKey);
      if (!slotKey || !slot || slot.empty || this.pendingAction) return;
      this.pendingAction = "unequip";
      this._renderCompare();
      haptic("medium");
      try {
        const res = await equippedPost("/webapp/equipped/unequip", { slot: slotKey });
        if (res && res.ok) {
          const data = res.data || res.state || res;
          if (data && (data.slots || data.stats)) this._syncExternalState(data);
          else await this._loadEquipped();
          await this._loadBackpack();
          hapticNotify("success");
          this.pendingAction = null;
          this._ensureSelectedSlot();
          this._renderLoadout();
          this._renderNodes();
          this._renderStats();
          this._renderSets();
          this._renderBackpack();
          this._renderCompare();
          this._requestCharacterImage(true);
          this._loadActivePet().then(() => this._syncPetCompanion());
        } else {
          hapticNotify("error");
          this.pendingAction = null;
          this._renderCompare();
          this._toast(res?.message || res?.reason || "Failed to unequip.", "error");
        }
      } catch (err) {
        console.error("Equipped.unequip error", err);
        hapticNotify("error");
        this.pendingAction = null;
        this._renderCompare();
        this._toast("Failed to unequip.", "error");
      }
    },

    async equipSelected() {
      const item = this._backpackItemByKey(this.selectedBackpackItemKey);
      const key = itemKeyOf(item);
      if (!key || this.pendingAction) return;
      const slot = itemSlotOf(item);
      if (this._canonicalSlotKeys().includes(slot)) this.selectedEquippedSlotKey = slot;
      this.pendingAction = "equip";
      this._renderCompare();
      haptic("medium");
      try {
        const res = await equippedPost("/webapp/inventory/equip", { key });
        if (res && res.ok) {
          await this._loadEquipped();
          await this._loadBackpack();
          hapticNotify("success");
          this.pendingAction = null;
          if (this._canonicalSlotKeys().includes(slot)) this.selectedEquippedSlotKey = slot;
          this.selectedBackpackItemKey = null;
          this._renderLoadout();
          this._renderNodes();
          this._renderStats();
          this._renderSets();
          this._renderBackpack();
          this._renderCompare();
          this._requestCharacterImage(true);
          this._loadActivePet().then(() => this._syncPetCompanion());
        } else {
          hapticNotify("error");
          this.pendingAction = null;
          this._renderCompare();
          this._toast(res?.message || res?.reason || "Cannot equip that item.", "error");
        }
      } catch (err) {
        console.error("Equipped.equip error", err);
        hapticNotify("error");
        this.pendingAction = null;
        this._renderCompare();
        this._toast("Failed to equip.", "error");
      }
    },

    render() {
      this._ensureSelectedSlot();
      this._applyLayout();
      this._renderLoadout();
      this._renderNodes();
      this._renderStats();
      this._renderSets();
      this._renderBackpack();
      this._renderCompare();
    },

    async inspect(slot) {
      this._selectSlot(slot);
      return this.inspectSelected();
    },

    renderInspect(d) {
      const key = itemKeyOf(d);
      if (key && typeof window.Inventory?.openEquippedItem === "function") {
        return window.Inventory.openEquippedItem(key);
      }
      return false;
    },

    _itemStats: itemStatsOf,
    _compareRows: compareRows,
    _itemSet: itemSetOf,
    _itemKey: itemKeyOf,
    resolveBackpackCategory: resolveBackpackCategory,
    resolveCharacterSources: resolveCharacterSources,
    PREVIEW_STATE: PREVIEW_STATE,
    PREVIEW_SOURCE: PREVIEW_SOURCE
  };
})();
