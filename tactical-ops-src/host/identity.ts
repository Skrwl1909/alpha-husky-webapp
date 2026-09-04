import { FALLBACK_ATTACK, FALLBACK_PORTRAIT, FALLBACK_SPRITE } from "../data/units";

export type WeaponClass = "blade" | "axe" | "spear" | "staff" | "hammer" | "claw" | "melee";

export interface LoadoutItem {
  slot: string;
  key: string;
  name: string;
  icon: string;
  rarity: string;
}

export interface PlayerIdentity {
  unitName: string;
  nickname: string;
  skinKey: string;
  skinName: string;
  skinUrl: string;
  portraitUrl: string;
  spriteUrl: string;
  attackSpriteUrl: string;
  weapon: LoadoutItem | null;
  armor: LoadoutItem | null;
  weaponClass: WeaponClass;
  weaponLabel: string;
  armorLabel: string;
  summary: string;
  source: "character-image" | "skin" | "equipped" | "fallback";
  live: boolean;
}

const CLOUD = "dnjwvxinh";
const CDN = `https://res.cloudinary.com/${CLOUD}/image/upload`;

type AnyRec = Record<string, unknown>;

function win(): AnyRec | null {
  return typeof window === "undefined" ? null : (window as unknown as AnyRec);
}

function asText(v: unknown): string {
  return String(v ?? "").trim();
}

function firstText(...vals: unknown[]): string {
  for (const v of vals) {
    const s = asText(v);
    if (s) return s;
  }
  return "";
}

function normKey(v: unknown): string {
  return asText(v).toLowerCase().replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "");
}

function publicAssetUrl(url: string): string {
  const u = asText(url);
  const m = u.match(/\/assets\/(skins|equip|items)\/([^/?#]+)/i);
  if (m) return `${CDN}/f_auto,q_auto/${m[1]}/${m[2]}`;
  return u;
}

function looksUrl(v: string): boolean {
  if (!v) return false;
  if (v.startsWith("blob:") || v.startsWith("data:")) return true;
  if (/^https?:\/\//i.test(v)) return true;
  if (v.startsWith("/")) return true;
  return false;
}

function pickItem(raw: unknown, slot: string): LoadoutItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as AnyRec;
  if (o.empty === true) return null;
  const key = firstText(o.item_key, o.itemKey, o.key, o.item);
  const name = firstText(o.name, o.label, key);
  if (!key && !name) return null;
  const icon = firstText(o.icon, o.img, o.image, o.image_path, o.imageUrl, o.url);
  return {
    slot,
    key: key || normKey(name),
    name: name || key,
    icon: publicAssetUrl(icon) || cloudinaryEquip(key || name),
    rarity: firstText(o.rarity, "common"),
  };
}

function cloudinaryEquip(key: string): string {
  const k = normKey(key);
  if (!k) return "";
  return `${CDN}/f_auto,q_auto/equip/${k}.png`;
}

function cloudinarySkin(key: string): string {
  const k = normKey(key);
  if (!k) return "";
  return `${CDN}/f_auto,q_auto/skins/${k}.webp`;
}

function classifyWeapon(item: LoadoutItem | null): WeaponClass {
  const t = `${item?.key || ""} ${item?.name || ""}`.toLowerCase();
  if (/axe|cleaver|chop|hatchet/.test(t)) return "axe";
  if (/spear|pike|pole|glaive|halberd|lance/.test(t)) return "spear";
  if (/staff|rod|scepter|wand|signal/.test(t)) return "staff";
  if (/hammer|mace|maul|gavel/.test(t)) return "hammer";
  if (/claw|fang|gauntlet|fist|knuckle/.test(t)) return "claw";
  if (/blade|sword|saber|omen|edge|fangblade|knife|dagger/.test(t)) return "blade";
  return "melee";
}

function prettyClass(c: WeaponClass): string {
  if (c === "melee") return "MELEE KIT";
  return c.toUpperCase();
}

function slotFromState(state: AnyRec | null | undefined, slot: string): LoadoutItem | null {
  if (!state) return null;
  const slots = Array.isArray(state.slots) ? state.slots : [];
  const hit = slots.find((s) => normKey((s as AnyRec)?.slot) === slot);
  if (hit) return pickItem(hit, slot);
  const bySlot = (state.equippedBySlot || state.equipped || {}) as AnyRec;
  if (bySlot && typeof bySlot === "object") {
    const direct = bySlot[slot];
    if (direct) return pickItem(direct, slot);
  }
  const loadout = Array.isArray(state.loadout) ? state.loadout : [];
  const fromLoadout = loadout.find((s) => normKey((s as AnyRec)?.slot) === slot);
  if (fromLoadout) return pickItem(fromLoadout, slot);
  return null;
}

function readEquippedState(): AnyRec | null {
  const w = win();
  if (!w) return null;
  const eq = w.Equipped as AnyRec | undefined;
  if (eq && eq.state && typeof eq.state === "object") return eq.state as AnyRec;
  if (w.__AH_EQUIPPED_STATE__ && typeof w.__AH_EQUIPPED_STATE__ === "object") {
    return w.__AH_EQUIPPED_STATE__ as AnyRec;
  }
  return null;
}

function readProfile(): AnyRec {
  const w = win();
  if (!w) return {};
  const p =
    (w.__PROFILE__ as AnyRec) ||
    (w.PROFILE as AnyRec) ||
    (w.profileState as AnyRec) ||
    (w.lastProfile as AnyRec) ||
    {};
  return p && typeof p === "object" ? p : {};
}

function readHeroSkin(): { url: string; key: string; name: string } {
  const w = win();
  const profile = readProfile();
  let url = "";
  let key = "";
  let name = "";
  try {
    const el = w?.document && (w.document as Document).getElementById("player-skin");
    if (el) {
      const img = el as HTMLImageElement;
      url = firstText(img.currentSrc, img.src);
      key = firstText(img.dataset?.skinKey, img.getAttribute?.("data-skin-key"));
      name = firstText(img.alt);
    }
  } catch {
    /* ignore */
  }
  const skin = profile.skin;
  if (typeof skin === "string") {
    url = url || skin;
  } else if (skin && typeof skin === "object") {
    const s = skin as AnyRec;
    url = url || firstText(s.img, s.url, s.preview_url, s.previewUrl);
    key = key || firstText(s.key, s.skinKey, s.skin_key);
    name = name || firstText(s.name, s.label);
  }
  key =
    key ||
    firstText(profile.skinKey, profile.skin_key, (profile.activeSkin as AnyRec)?.key);
  url =
    url ||
    firstText(
      profile.heroImg,
      profile.heroPng,
      profile.character,
      profile.characterPng,
      (profile.activeSkin as AnyRec)?.img,
    );
  if (!url && key) {
    url = `/assets/skins/${normKey(key)}.webp`;
  }
  if (name.toLowerCase() === "alpha husky skin") name = "";
  if (!name && key) name = key.replace(/[_-]+/g, " ").replace(/\bskin\b/gi, "").trim();
  return { url, key: normKey(key), name };
}

function readCharacterImage(): string {
  const w = win();
  if (!w) return "";
  const blob = asText(w.__EquippedCharImgUrl);
  if (blob) return blob;
  try {
    const el = w.document && (w.document as Document).getElementById("equipped-character-img");
    const img = el as HTMLImageElement | null;
    const src = firstText(img?.currentSrc, img?.src);
    if (looksUrl(src)) return src;
  } catch {
    /* ignore */
  }
  return "";
}

function makeIdentity(partial?: Partial<PlayerIdentity>): PlayerIdentity {
  const weapon = partial?.weapon ?? null;
  const armor = partial?.armor ?? null;
  const weaponClass = partial?.weaponClass || classifyWeapon(weapon);
  const skinName = (partial?.skinName || "").trim();
  const weaponLabel = weapon?.name || prettyClass(weaponClass);
  const armorLabel = armor?.name || "";
  const bits = [skinName, weapon?.name ? weapon.name : prettyClass(weaponClass)].filter(Boolean);
  return {
    unitName: partial?.unitName || "ALPHA",
    nickname: partial?.nickname || "",
    skinKey: partial?.skinKey || "",
    skinName,
    skinUrl: partial?.skinUrl || "",
    portraitUrl: partial?.portraitUrl || FALLBACK_PORTRAIT,
    spriteUrl: partial?.spriteUrl || FALLBACK_SPRITE,
    attackSpriteUrl: partial?.attackSpriteUrl || FALLBACK_ATTACK,
    weapon,
    armor,
    weaponClass,
    weaponLabel,
    armorLabel,
    summary: bits.join("  ·  ") || "ALPHA  ·  MELEE KIT",
    source: partial?.source || "fallback",
    live: partial?.live === true,
  };
}

/** Sync resolve from already-mounted Alpha Husky identity sources. Never throws. */
export function resolvePlayerIdentity(): PlayerIdentity {
  const profile = readProfile();
  const equipped = readEquippedState();
  const hero = readHeroSkin();
  const liveComposite = readCharacterImage();
  const nickname = firstText(profile.nickname, profile.name, profile.displayName);
  const unitName = nickname ? nickname.toUpperCase() : "ALPHA";

  const weapon = slotFromState(equipped, "weapon") || slotFromState(profile, "weapon");
  const armor = slotFromState(equipped, "armor") || slotFromState(profile, "armor");

  const skinUrl = looksUrl(hero.url)
    ? publicAssetUrl(hero.url)
    : hero.key
      ? cloudinarySkin(hero.key)
      : "";
  const portraitFromSkin = looksUrl(skinUrl) ? skinUrl : "";
  const portraitFromLive = looksUrl(liveComposite) ? liveComposite : "";

  let source: PlayerIdentity["source"] = "fallback";
  let portraitUrl = FALLBACK_PORTRAIT;
  if (portraitFromLive) {
    portraitUrl = portraitFromLive;
    source = "character-image";
  } else if (portraitFromSkin) {
    portraitUrl = portraitFromSkin;
    source = "skin";
  } else if (weapon || armor) {
    source = "equipped";
  }

  if (source === "fallback" && (weapon || armor || hero.key)) source = "equipped";

  const live = source !== "fallback" || !!(weapon || armor || hero.key || nickname);

  return makeIdentity({
    unitName,
    nickname,
    skinKey: hero.key,
    skinName: hero.name || (hero.key ? hero.key.replace(/_+/g, " ") : ""),
    skinUrl,
    portraitUrl,
    spriteUrl: FALLBACK_SPRITE,
    attackSpriteUrl: FALLBACK_ATTACK,
    weapon,
    armor,
    source,
    live,
  });
}

export function applyIdentityToAlpha<T extends { defId?: string; id?: string; name: string; sprite: string; attackSprite?: string; portrait?: string }>(
  unit: T,
  identity?: PlayerIdentity | null,
): T {
  if (!identity) return unit;
  if (unit.defId !== "alpha" && unit.id !== "alpha") return unit;
  return {
    ...unit,
    name: identity.unitName || unit.name,
    portrait: identity.portraitUrl || unit.portrait,
    sprite: identity.spriteUrl || unit.sprite,
    attackSprite: identity.attackSpriteUrl || unit.attackSprite,
  };
}

export async function hydrateEquippedState(): Promise<boolean> {
  const w = win();
  if (!w) return false;
  if (readEquippedState()) return true;
  const apiPost = (w.apiPost || (w.S as AnyRec | undefined)?.apiPost) as
    | ((path: string, body?: unknown) => Promise<unknown>)
    | undefined;
  try {
    if (typeof apiPost === "function") {
      const res = (await apiPost("/webapp/equipped/state", {})) as AnyRec;
      const data = (res && (res.data || res.state || res)) as AnyRec;
      if (res && (res.ok === true || data?.slots)) {
        w.__AH_EQUIPPED_STATE__ = data;
        const eq = w.Equipped as AnyRec | undefined;
        if (eq && typeof eq === "object" && !eq.state) eq.state = data;
        return true;
      }
    }
  } catch {
    /* live equipped is optional */
  }
  return false;
}

export function identityCache(next?: PlayerIdentity): PlayerIdentity {
  const w = win();
  if (next && w) w.__AH_TO_IDENTITY__ = next;
  if (w && w.__AH_TO_IDENTITY__) return w.__AH_TO_IDENTITY__ as PlayerIdentity;
  const resolved = resolvePlayerIdentity();
  if (w) w.__AH_TO_IDENTITY__ = resolved;
  return resolved;
}

