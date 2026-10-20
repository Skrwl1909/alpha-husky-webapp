import type { SkillDef } from "../combat/types";

/** Authoritative rules shared by server and battle; never treat browser storage as ownership. */
export type HeroId = "alpha" | "ally-02" | "ally-03";
export type Discipline = "vanguard" | "howlkeeper" | "pursuer" | "disruptor" | "sentinel" | "medic";
export type SkillRank = 0 | 1 | 2;
export interface HeroGrowth {
  heroId: HeroId;
  discipline: Discipline | null;
  /** Only present on persistent records, not frozen run snapshots. */
  respecUsed?: boolean;
  ranks: Record<string, SkillRank>;
}
export interface GrowthSnapshot {
  version: 1;
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
  if (s.version !== 1 || !Number.isSafeInteger(s.revision) || s.revision < 0 || !Array.isArray(s.heroes) || s.heroes.length !== 3) throw Error("invalid_growth_snapshot");
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
  const skill: SkillDef = {
    ...base,
    maxRange: Math.max(base.minRange, base.maxRange + (upgrade?.rangeDelta ?? 0)),
    cooldownMax: Math.max(0, base.cooldownMax + (upgrade?.cooldownDelta ?? 0)),
    effects: base.effects.map((effect) => effect.kind === "status" && upgrade?.durationDelta
      ? { ...effect, duration: (effect.duration ?? 1) + upgrade.durationDelta } : { ...effect }),
  };
  switch (hero.discipline) {
    case "vanguard":
      if (canonicalId === "alpha-howl") skill.effects.push({ kind: "status", status: "GUARD", duration: 1, value: 0.2, on: "aoe_allies" });
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
      if (canonicalId === "u03-pack") skill.effects.push({ kind: "status", status: "GUARD", duration: 1, value: 0.2, on: "aoe_allies" });
      break;
    case "medic":
      if (canonicalId === "u03-mend") skill.cooldownMax = Math.max(0, skill.cooldownMax - 1);
      break;
  }
  return skill;
}
