import type { UnitDef, SkillDef } from "../combat/types";
import { withTeammateSidegrades } from "../data/shadowSidegrade";
import type { PackMastery, MasteryRecord } from "../data/packMastery";
import { tacticalPetDef, type TacticalPet } from "../data/companion";
import { UNIT_DEFS, type SpawnSpec } from "../data/units";
import { getSkill } from "../data/skills";
import { resolveGrowthSkill, growthHero, type GrowthSnapshot } from "../data/playerGrowth";
import type { KodaSidegrade } from "../data/kodaSidegrade";
import type { ShadowSidegrade } from "../data/shadowSidegrade";

/** Comparison of real combat loadouts, NOT a claim that the previous run used the baseline. */
export interface PowerProof {
  subject: string;
  comparison: string;
  changes: string[];
  source: "SAVED_PROGRESSION";
}

type Choices = {
  kodaSidegrade?: KodaSidegrade | null;
  shadowSidegrade?: ShadowSidegrade | null;
  packMastery?: PackMastery;
};

function spawnFor(id: string, pet?: TacticalPet | null): SpawnSpec | null {
  if (id.startsWith("pet:")) {
    if (!pet || id !== `pet:${pet.id}`) return null;
    return { id, defId: id, c: 0, r: 0, unitDef: tacticalPetDef(pet) };
  }
  if (id !== "ally-02" && id !== "ally-03") return null;
  return { id, defId: id, c: 0, r: 0 };
}

function unitFor(id: string, choices: Choices, pet?: TacticalPet | null): UnitDef | null {
  const spawn = spawnFor(id, pet);
  if (!spawn) return null;
  const transformed = withTeammateSidegrades([spawn], choices)[0];
  return transformed.unitDef || UNIT_DEFS[transformed.defId] || null;
}

function effectsFingerprint(skill: SkillDef) {
  return skill.effects.map(e => [e.kind, e.status || "", e.on || "", e.duration || 0, e.value || 0, e.base || 0, e.scale || 0, e.multiplier || 0].join(":")).sort();
}

function effectSummaries(skill: SkillDef): Map<string, string> {
  const entries = new Map<string, string>();
  for (const effect of skill.effects) {
    const key = effect.kind === "status" ? `STATUS ${effect.status}` : effect.kind.toUpperCase();
    const value = effect.kind === "status"
      ? `${effect.duration || 0}T / ${Math.round((effect.value || 0) * 100)}%`
      : effect.kind === "damage"
        ? `${effect.multiplier ?? 0}x`
        : `${effect.base ?? 0} + ${effect.scale ?? 0}x`;
    entries.set(key, value);
  }
  return entries;
}
function skillProof(before: SkillDef, after: SkillDef): string[] {
  const tag = `${after.slot} ${after.name}`;
  const rows: string[] = [];
  const measure = (label: string, a: number, b: number) => {
    if (a !== b) rows.push(`${tag} · ${label} ${a} → ${b}`);
  };
  measure("RANGE", before.maxRange, after.maxRange);
  measure("RADIUS", before.radius, after.radius);
  measure("COOLDOWN", before.cooldownMax, after.cooldownMax);
  if (before.targetType !== after.targetType) rows.push(`${tag} · TARGET ${before.targetType} → ${after.targetType}`);
  if (before.ignoreDisruption !== after.ignoreDisruption) rows.push(`${tag} · IGNORE DISRUPTION ${before.ignoreDisruption === true ? "YES" : "NO"} → ${after.ignoreDisruption === true ? "YES" : "NO"}`);
  const a = effectSummaries(before), b = effectSummaries(after);
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    if (a.get(key) !== b.get(key)) rows.push(`${tag} · ${key} ${a.get(key) || "NONE"} → ${b.get(key) || "NONE"}`);
  }
  // The same numeric stats with rearranged effects are not a meaningful new proof.
  if (!rows.length && effectsFingerprint(before).join("|") !== effectsFingerprint(after).join("|")) {
    rows.push(`${tag} · EFFECT COMPOSITION CHANGED`);
  }
  return rows;
}

function compareUnits(before: UnitDef, after: UnitDef, growth?: GrowthSnapshot | null): string[] {
  const rows: string[] = [];
  if (before.move !== after.move) rows.push(`MOVE ${before.move} → ${after.move}`);
  if ((before.recoverRange || 1) !== (after.recoverRange || 1)) rows.push(`RECOVER RANGE ${before.recoverRange || 1} → ${after.recoverRange || 1}`);
  const hero = growthHero(growth,after.defId);
  for (const afterId of after.skillIds) {
    const afterSkill = resolveGrowthSkill(getSkill(afterId), hero);
    const beforeId = before.skillIds.find(id => getSkill(id).slot === afterSkill.slot);
    if (!beforeId) continue;
    rows.push(...skillProof(resolveGrowthSkill(getSkill(beforeId), hero), afterSkill));
  }
  return rows;
}

/** Relative to the SAME saved mastery+growth, but without the selected sidegrade. */
export function savedSidegradeProof(
  id: "ally-02" | "ally-03",
  choices: Choices,
  growth?: GrowthSnapshot | null,
): PowerProof | null {
  const chosen = id === "ally-02" ? choices.kodaSidegrade : choices.shadowSidegrade;
  if (!chosen) return null;
  const previousChoices: Choices = id === "ally-02"
    ? { ...choices, kodaSidegrade: null }
    : { ...choices, shadowSidegrade: null };
  const previous = unitFor(id, previousChoices);
  const current = unitFor(id, choices);
  if (!previous || !current) return null;
  const changes = compareUnits(previous, current, growth);
  if (!changes.length) return null;
  return { subject: id === "ally-02" ? "CNC" : "SHADOW",
    comparison: `BASE → ${id === "ally-02" ? chosen === "A" ? "VANGUARD" : "DISRUPTOR" : chosen === "A" ? "RESTORER" : "WARDEN"}`,
    changes, source: "SAVED_PROGRESSION" };
}

function masteryBaseline(record: MasteryRecord): MasteryRecord {
  if (record.stage >= 3 && record.selected) return { progress: 3, stage: 2, selected: null, unlockedOptions: [] };
  return { progress: 0, stage: 1, selected: null, unlockedOptions: [] };
}

/** Relative to the preceding skill milestone, not an unrecorded historical purchase. */
export function savedMasteryProof(
  id: string, choices: Choices, pet?: TacticalPet | null, growth?: GrowthSnapshot | null,
): PowerProof | null {
  const record = choices.packMastery?.[id];
  if (!record || record.stage < 2) return null;
  if (record.stage >= 3 && !record.selected) return null; // No signature until server confirms choice.
  const previousChoices = { ...choices, packMastery: { ...choices.packMastery, [id]: masteryBaseline(record) } };
  const previous = unitFor(id, previousChoices, pet);
  const current = unitFor(id, choices, pet);
  if (!previous || !current) return null;
  const changes = compareUnits(previous, current, growth);
  if (!changes.length) return null;
  return { subject: id === "ally-02" ? "CNC" : id === "ally-03" ? "SHADOW" : "PET",
    comparison: record.stage === 2 ? "BASE → TRAINED" : "TRAINED → SAVED SIGNATURE",
    changes, source: "SAVED_PROGRESSION" };
}

/** Saved A/B versus its alternative using the same doctrine, ranks and sidegrade. */
export function alternateMasteryProof(id: string, choices: Choices, pet?: TacticalPet | null, growth?: GrowthSnapshot | null): string[] {
  const record = choices.packMastery?.[id];
  if (!record || record.stage !== 3 || !record.selected) return [];
  const alternate = { ...choices, packMastery: { ...choices.packMastery, [id]: { ...record, selected: record.selected === "A" ? "B" as const : "A" as const } } };
  const before = unitFor(id,choices,pet), after = unitFor(id,alternate,pet);
  return before && after ? compareUnits(before,after,growth) : [];
}
