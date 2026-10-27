import type { SkillDef } from "../combat/types";

/** Authoritative rules shared by server and battle; never treat browser storage as ownership. */
export type HeroId = "alpha" | "ally-02" | "ally-03";
export type Discipline = "vanguard" | "howlkeeper" | "pursuer" | "disruptor" | "sentinel" | "medic";
export type SkillRank = 0 | 1 | 2;
export interface HeroGrowth {
  heroId: HeroId;
  /** Runtime rules copied from the validated accepted snapshot, never account ownership. */
  rulesVersion?: 1 | 2;
  discipline: Discipline | null;
  /** Only present on persistent records, not frozen run snapshots. */
  respecUsed?: boolean;
  ranks: Record<string, SkillRank>;
}
export interface GrowthSnapshot {
  version: 1 | 2;
  revision: number;
  heroes: HeroGrowth[];
}
export interface SkillUpgrade {
  skillId: string;
  rank: 1 | 2;
  label: string;
  description: string;
  cooldownDelta?: number;
  rangeDelta?: number;
  durationDelta?: number;
}
export const HERO_PATHS: Record<HeroId, readonly [Discipline, Discipline]> = {
  alpha: ["vanguard", "howlkeeper"],
  "ally-02": ["pursuer", "disruptor"],
  "ally-03": ["sentinel", "medic"],
};
export const HERO_SKILLS: Record<HeroId, readonly [string, string, string]> = {
  alpha: ["alpha-strike", "alpha-rend", "alpha-howl"],
  "ally-02": ["u02-shot", "u02-burst", "u02-suppress"],
  "ally-03": ["u03-tap", "u03-mend", "u03-pack"],
};
export const UPGRADES: readonly SkillUpgrade[] = [
  { skillId: "alpha-strike", rank: 1, label: "Long Step", description: "Strike reaches one tile farther.", rangeDelta: 1 },
  { skillId: "alpha-strike", rank: 2, label: "Relentless", description: "Strike reaches two tiles farther.", rangeDelta: 2 },
  { skillId: "alpha-rend", rank: 1, label: "Deep Cut", description: "Bleed lasts one additional turn.", durationDelta: 1 },
  { skillId: "alpha-rend", rank: 2, label: "Open Wound", description: "Bleed lasts two additional turns.", durationDelta: 2 },
  { skillId: "alpha-howl", rank: 1, label: "Pack Echo", description: "Howl cooldown reduced by one turn.", cooldownDelta: -1 },
  { skillId: "alpha-howl", rank: 2, label: "Pack Rhythm", description: "Howl cooldown reduced by two turns.", cooldownDelta: -2 },
  { skillId: "u02-shot", rank: 1, label: "Long Reach", description: "Thrust reaches one additional tile.", rangeDelta: 1 },
  { skillId: "u02-shot", rank: 2, label: "Pursuit", description: "Thrust reaches two additional tiles.", rangeDelta: 2 },
  { skillId: "u02-burst", rank: 1, label: "Rapid Lunge", description: "Lunge cooldown reduced by one.", cooldownDelta: -1 },
  { skillId: "u02-burst", rank: 2, label: "Flow State", description: "Lunge cooldown reduced by two.", cooldownDelta: -2 },
  { skillId: "u02-suppress", rank: 1, label: "Sustained Pressure", description: "Pressure control lasts longer.", durationDelta: 1 },
  { skillId: "u02-suppress", rank: 2, label: "Signal Lock", description: "Pressure control lasts two turns longer.", durationDelta: 2 },
  { skillId: "u03-tap", rank: 1, label: "Extended Reach", description: "Basic skill reaches one tile farther.", rangeDelta: 1 },
  { skillId: "u03-tap", rank: 2, label: "Relay Reach", description: "Basic skill reaches two tiles farther.", rangeDelta: 2 },
  { skillId: "u03-mend", rank: 1, label: "Fast Recovery", description: "Mend cooldown reduced by one.", cooldownDelta: -1 },
  { skillId: "u03-mend", rank: 2, label: "Field Triage", description: "Mend cooldown reduced by two.", cooldownDelta: -2 },
  { skillId: "u03-pack", rank: 1, label: "Long Watch", description: "Pack support lasts one extra turn.", durationDelta: 1 },
  { skillId: "u03-pack", rank: 2, label: "Hold Together", description: "Pack support lasts two extra turns.", durationDelta: 2 },
];
export function validateGrowthSnapshot(value: unknown): GrowthSnapshot {
  if (!value || typeof value !== "object") throw Error("invalid_growth_snapshot");
  const s = value as GrowthSnapshot;
  if ((s.version !== 1 && s.version !== 2) || !Number.isSafeInteger(s.revision) || s.revision < 0 || !Array.isArray(s.heroes) || s.heroes.length !== 3) throw Error("invalid_growth_snapshot");
  const ids = Object.keys(HERO_PATHS) as HeroId[];
  for (const id of ids) {
    const hero = s.heroes.find((h) => h && h.heroId === id);
    if (!hero || s.heroes.filter((h) => h && h.heroId === id).length !== 1) throw Error("invalid_growth_hero");
    if (hero.discipline !== null && !HERO_PATHS[id].includes(hero.discipline)) throw Error("invalid_growth_discipline");
    if (!hero.ranks || typeof hero.ranks !== "object" || Array.isArray(hero.ranks)) throw Error("invalid_growth_ranks");
    if (Object.keys(hero.ranks).length && hero.discipline === null) throw Error("invalid_growth_discipline");
    if (hero.respecUsed !== undefined && typeof hero.respecUsed !== "boolean") throw Error("invalid_growth_respec");
    for (const [skillId, rank] of Object.entries(hero.ranks)) {
      if (!HERO_SKILLS[id].includes(skillId) || !Number.isInteger(rank) || rank < 1 || rank > 2) throw Error("invalid_growth_rank");
    }
  }
  return s;
}
/** Resolve both the chosen discipline and the invested skill rank into real combat data.
 * Never touch the canonical SkillDef, and never infer ownership from client storage.
 */
/** Skill identity is stable even when legacy teammate sidegrades and Pack Mastery wrap the executable skill id. */
export function canonicalGrowthSkillId(executableId: string): string {
  const id = executableId.split(":mastery:")[0];
  switch (id) {
    case "u02-lunge-vanguard": return "u02-burst";
    case "u02-pressure-disruptor": return "u02-suppress";
    case "u03-mend-restorer": return "u03-mend";
    case "u03-pack-warden": return "u03-pack";
    default: return id;
  }
}
export function resolveGrowthSkill(base: SkillDef, hero: HeroGrowth | undefined): SkillDef {
  const canonicalId = canonicalGrowthSkillId(base.id);
  if (!hero || !HERO_SKILLS[hero.heroId]?.includes(canonicalId)) return base;
  const rank = hero.ranks[canonicalId] ?? 0;
  if (!Number.isInteger(rank) || rank < 0 || rank > 2) return base;
  const upgrade = rank ? UPGRADES.find((u) => u.skillId === canonicalId && u.rank === rank) : undefined;
  const v2 = hero.rulesVersion === 2;
  const mend = v2 && canonicalId === "u03-mend";
  const skill: SkillDef = {
    ...base,
    maxRange: Math.max(base.minRange, base.maxRange + (upgrade?.rangeDelta ?? 0) + (mend && rank > 0 && base.targetType === "ALLY_SINGLE" ? 1 : 0)),
    cooldownMax: Math.max(base.cooldownMax > 0 ? 1 : 0, base.cooldownMax + (mend ? 0 : upgrade?.cooldownDelta ?? 0)),
    effects: base.effects.map((effect) => effect.kind === "status" && upgrade?.durationDelta
      ? { ...effect, duration: (effect.duration ?? 1) + upgrade.durationDelta } : { ...effect }),
  };
  if (mend && rank > 0 && base.targetType === "ALLY_AOE") skill.radius += 1;
  if (mend && rank === 2) skill.effects.push({ kind: "status", status: "GUARD", duration: 1,
    value: 0.2, on: base.targetType === "ALLY_AOE" ? "aoe_allies" : "primary", maxHpRatio: 0.5 });
  switch (hero.discipline) {
    case "vanguard":
      if (canonicalId === "alpha-howl" && !skill.effects.some(e => e.status === "GUARD")) skill.effects.push({ kind: "status", status: "GUARD", duration: 1, value: 0.2, on: "aoe_allies" });
      break;
    case "howlkeeper":
      if (base.id === "alpha-howl") skill.radius += 1;
      break;
    case "pursuer":
      if (canonicalId === "u02-shot") skill.maxRange += 1;
      break;
    case "disruptor":
      if (canonicalId === "u02-suppress") {
        skill.effects = skill.effects.map(e => e.kind === "status" ? { ...e, duration: (e.duration ?? 1) + 1 } : e);
      }
      break;
    case "sentinel":
      if (v2 && canonicalId === "u03-pack" && skill.effects.some(e => e.status === "GUARD")) {
        skill.effects = skill.effects.map(e => e.status === "GUARD" ? { ...e, duration: (e.duration ?? 1) + 1 } : e);
      }
      if (canonicalId === "u03-pack" && !skill.effects.some(e => e.status === "GUARD")) skill.effects.push({ kind: "status", status: "GUARD", duration: 1, value: 0.2, on: "aoe_allies" });
      break;
    case "medic":
      if (canonicalId === "u03-mend") {
        skill.cooldownMax = Math.max(1, skill.cooldownMax - 1);
        // STEADY HAND already consumed the only cooldown step: give it a bounded rescue benefit.
        if (v2 && base.cooldownMax === 1 && base.id.endsWith(":mastery:SHADOW:3:A")) {
          skill.effects = skill.effects.map(e => e.kind === "heal" ? { ...e, base: (e.base ?? 0) + 8 } : e);
        }
      }
      break;
  }
  if (v2 && canonicalId === "u03-mend") skill.desc = `MEND: ${skill.targetType === "ALLY_AOE" ? `radius ${skill.radius}` : `range ${skill.maxRange}`}; cooldown ${skill.cooldownMax}. ${rank ? upgradeDescription(canonicalId,rank as 1 | 2,2) : "Restore HP to an ally."}${hero.discipline === "medic" && base.cooldownMax === 1 ? " STEADY HAND: +8 base healing at the cooldown floor." : ""}`;
  return skill;
}

/** Version belongs to the snapshot. Never trust a nested hero's runtime rulesVersion. */
export function growthHero(snapshot: GrowthSnapshot | null | undefined, id: string): HeroGrowth | undefined {
  const hero = snapshot?.heroes.find(h => h.heroId === id);
  return hero ? { ...hero, ranks: { ...hero.ranks }, rulesVersion: snapshot!.version } : undefined;
}
export function upgradeDescription(skillId: string, rank: 1 | 2, version: 1 | 2 = 1): string {
  if (version === 2 && skillId === "u03-mend") return rank === 1
    ? "Rescue reach +1 cell (RESTORER: radius +1). Cooldown unchanged."
    : "Keeps rescue reach. Allies at 50% HP or less before MEND gain 20% GUARD for 1 personal turn.";
  return UPGRADES.find(u => u.skillId === skillId && u.rank === rank)?.description || "";
}
