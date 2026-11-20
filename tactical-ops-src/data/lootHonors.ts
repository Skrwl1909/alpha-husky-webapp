/**
 * Tactical Loot & Honors V1 — display-only wire contract.
 * A local battle outcome, progression counter or client fixture can never grant rewards.
 */
export const EQUIPMENT_SLOTS = ["weapon", "armor", "fangs", "cloak", "collar", "helmet", "ring", "offhand", "gloves"] as const;
export const ITEM_RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
export const PRESTIGE_TYPES = ["badge", "frame", "skin", "aura", "title"] as const;
export const CURRENCY_TYPES = ["exp", "bones", "scrap", "rune_dust"] as const;
export type EquipmentSlot = typeof EQUIPMENT_SLOTS[number];
export type ItemRarity = typeof ITEM_RARITIES[number];
export type PrestigeType = typeof PRESTIGE_TYPES[number];
export type CurrencyType = typeof CURRENCY_TYPES[number];

export type EquipmentGrant = {
  grantId: string; itemId: string; name: string; slot: EquipmentSlot;
  rarity: ItemRarity; quantity: number; imageUrl?: string;
  stats?: Record<string, number>;
  /** Optional server-issued comparison, not computed from local snapshots. */
  equipped?: { itemId: string; name: string; stats: Record<string, number> } | null;
};
export type PrestigeGrant = {
  grantId: string; type: PrestigeType; id: string; name: string; rarity: ItemRarity;
  imageUrl?: string;
};
export type CurrencyGrant = { kind: CurrencyType; amount: number };
export type LootHonorsReceipt = {
  version: 1; status: "CONFIRMED" | "REPLAYED"; receiptId: string;
  runId: string; missionId: string; victory: true;
  currencies: CurrencyGrant[]; equipment: EquipmentGrant[]; unlocks: PrestigeGrant[];
};
export type LootParseResult = { state: "confirmed"; receipt: LootHonorsReceipt }
  | { state: "replayed"; receiptId: string } | { state: "absent" } | { state: "invalid" };

const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const safeId = (v: unknown): v is string => typeof v === "string" && /^[a-zA-Z0-9_:\-.]{1,128}$/.test(v);
const safeLabel = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= 120;
const amount = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0 && (v as number) <= 1000000000;
const member = <T extends string>(v: unknown, values: readonly T[]): v is T => typeof v === "string" && values.includes(v as T);
function parseStats(v: unknown): Record<string, number> | null {
  if (!record(v) || Object.keys(v).length > 12) return null;
  const out: Record<string, number> = {};
  for (const [key, val] of Object.entries(v)) {
    if (!/^[a-zA-Z_]{1,24}$/.test(key) || typeof val !== "number" || !Number.isFinite(val) || Math.abs(val) > 100000) return null;
    out[key] = val;
  }
  return out;
}
export function safeRewardArt(v: unknown): string | undefined {
  if (typeof v !== "string" || v.length > 320) return undefined;
  if (/^(?:\.\/)?assets\/(equip|badges|tactical-honors)\/[a-zA-Z0-9_./-]+\.(png|webp|svg)$/.test(v)) return v;
  if (/^https:\/\/(?:res\.cloudinary\.com|(?:app\.)?alphahusky\.win)\/[a-zA-Z0-9_./%?=&-]+$/.test(v)) return v;
  return undefined;
}
function parseEquipment(v: unknown): EquipmentGrant | null {
  if (!record(v) || !safeId(v.grantId) || !safeId(v.itemId) || !safeLabel(v.name) ||
      !member(v.slot,EQUIPMENT_SLOTS) || !member(v.rarity, ITEM_RARITIES) || !amount(v.quantity) || v.quantity === 0) return null;
  const stats = v.stats === undefined ? undefined : parseStats(v.stats);
  if (v.stats !== undefined && !stats) return null;
  let equipped: EquipmentGrant["equipped"];
  if (v.equipped === null) equipped = null;
  else if (v.equipped !== undefined) {
    if (!record(v.equipped) || !safeId(v.equipped.itemId) || !safeLabel(v.equipped.name)) return null;
    const comparison = parseStats(v.equipped.stats);
    if (!comparison) return null;
    equipped = { itemId: v.equipped.itemId, name: v.equipped.name, stats: comparison };
  }
  return { grantId: v.grantId, itemId: v.itemId, name: v.name, rarity: v.rarity, slot: v.slot,
    quantity: v.quantity, ...(stats ? {stats}: {}), ...(v.equipped !== undefined ? {equipped}: {}),
    ...(safeRewardArt(v.imageUrl) ? {imageUrl: safeRewardArt(v.imageUrl)} : {}) };
}
function parseUnlock(v: unknown): PrestigeGrant | null {
  if (!record(v) || !safeId(v.grantId) || !safeId(v.id) || !safeLabel(v.name) ||
      !member(v.type,PRESTIGE_TYPES) || !member(v.rarity, ITEM_RARITIES)) return null;
  return { grantId: v.grantId, id: v.id, name: v.name, type: v.type, rarity: v.rarity,
    ...(safeRewardArt(v.imageUrl) ? { imageUrl: safeRewardArt(v.imageUrl) } : {}) };
}

/** Accept only a validated, matching, saved victory receipt. No client-side entropy or grant mutations. */
export function parseLootHonors(raw: unknown, runId: string | null, missionId: string | null, savedVictory: boolean): LootParseResult {
  if (raw == null) return { state: "absent" };
  if (!savedVictory || !safeId(runId) || !safeId(missionId) || !record(raw) || raw.version !== 1 ||
      !safeId(raw.runId) || !safeId(raw.missionId) || raw.runId !== runId || raw.missionId !== missionId ||
      raw.victory !== true || !safeId(raw.receiptId) ||
      (raw.status !== "CONFIRMED" && raw.status !== "REPLAYED")) return { state: "invalid" };
  if (raw.status === "REPLAYED") return { state: "replayed", receiptId: raw.receiptId };
  if (!Array.isArray(raw.currencies) || !Array.isArray(raw.equipment) || !Array.isArray(raw.unlocks) ||
      raw.currencies.length > 4 || raw.equipment.length > 20 || raw.unlocks.length > 20) return { state: "invalid" };
  const currencies: CurrencyGrant[] = [];
  const currencyKeys = new Set<string>();
  for (const value of raw.currencies) {
    if (!record(value) || !member(value.kind,CURRENCY_TYPES) || !amount(value.amount) || currencyKeys.has(value.kind)) return {state:"invalid"};
    currencies.push({kind: value.kind, amount: value.amount}); currencyKeys.add(value.kind);
  }
  const equipment: EquipmentGrant[] = []; const unlocks: PrestigeGrant[] = [];
  const ids = new Set<string>();
  for (const value of raw.equipment) {
    const parsed = parseEquipment(value);
    if (!parsed || ids.has(parsed.grantId)) return {state:"invalid"};
    equipment.push(parsed); ids.add(parsed.grantId);
  }
  for (const value of raw.unlocks) {
    const parsed = parseUnlock(value);
    if (!parsed || ids.has(parsed.grantId)) return {state:"invalid"};
    unlocks.push(parsed); ids.add(parsed.grantId);
  }
  return { state: "confirmed", receipt: {
    version: 1, status:"CONFIRMED", receiptId:raw.receiptId, runId, missionId, victory:true,
    currencies, equipment, unlocks,
  }};
}

/** Legacy adapter: preserve existing payout UI, never infer equipment or prestige. */
export function legacyCurrencyRewards(value: unknown): CurrencyGrant[] {
  if (!record(value) || value.victory !== true || value.rewardAmountsAvailable === false) return [];
  const rewards: CurrencyGrant[] = [];
  if (amount(value.xpGranted)) rewards.push({kind:"exp",amount:value.xpGranted});
  if (amount(value.bonesGranted)) rewards.push({kind:"bones",amount:value.bonesGranted});
  if (value.firstUpgradeScrapGranted === 8) rewards.push({kind:"scrap",amount:8});
  return rewards;
}
