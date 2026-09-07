import type { SkillDef, SkillSlot } from "../combat/types";
import { SKILLS } from "./skills";
import { UNIT_DEFS, type SpawnSpec } from "./units";

export interface MasteryRecord { progress: number; stage: number; unlockedOptions: string[]; selected: "A" | "B" | null }
export type PackMastery = Record<string, MasteryRecord>;
export interface MasteryChange { unitId: string; kind: string; gained: number; beforeStage: number; stage: number; progress: number; newOptions: string[] }
interface Effect { slot?: SkillSlot; range?: number; radius?: number; cooldown?: number; statusDuration?: number; noHealing?: boolean; ignoreDisruption?: boolean; recoverRange?: number; move?: number }
interface Unlock { name: string; copy: string; effect: Effect }
export const MASTERY_DEFS: Record<string, { name: string; trained: Unlock; options: Record<"A" | "B", Unlock> }> = {
  "ally-02": { name: "CNC", trained: { name: "REACH CONTROL", copy: "PRESSURE reaches 1 cell farther, including DISRUPTOR.", effect: { slot: "A3", range: 1 } }, options: {
    A: { name: "RELENTLESS", copy: "PRESSURE recharges 1 personal turn sooner.", effect: { slot: "A3", cooldown: -1 } },
    B: { name: "PIN DOWN", copy: "PRESSURE debuffs last 1 personal turn longer.", effect: { slot: "A3", statusDuration: 1 } },
  } },
  "ally-03": { name: "SHADOW", trained: { name: "WIDE SHELTER", copy: "PACK SUPPORT reaches allies 1 cell farther, including WARDEN.", effect: { slot: "A3", radius: 1 } }, options: {
    A: { name: "STEADY HAND", copy: "MEND recharges 1 personal turn sooner, including RESTORER.", effect: { slot: "A2", cooldown: -1 } },
    B: { name: "SILENT SHELTER", copy: "PACK SUPPORT keeps its protection but removes healing and ignores Disrupted Support's extra cooldown. MEND still counts as healing.", effect: { slot: "A3", noHealing: true, ignoreDisruption: true } },
  } },
  PET: { name: "PET", trained: { name: "RELAY SCOUT", copy: "RECOVER works from 2 cells away. Signal windows still apply.", effect: { recoverRange: 2 } }, options: {
    A: { name: "REACHING SNARE", copy: "HAMSTRING reaches 1 cell farther; control a nearby threat without leaving your position.", effect: { slot: "A2", range: 1 } },
    B: { name: "PATHFINDER", copy: "Move 1 extra cell per personal turn to reach objectives or regroup with SHADOW.", effect: { move: 1 } },
  } },
};
export const masteryDef = (id: string) => { const key = id.startsWith("pet:") ? "PET" : id; return Object.hasOwn(MASTERY_DEFS, key) ? MASTERY_DEFS[key] : undefined; };
export const masteryRecord = (pack: PackMastery | undefined, id: string): MasteryRecord => pack?.[id] || { progress: 0, stage: 1, unlockedOptions: [], selected: null };
export function parsePackMastery(raw: unknown): PackMastery {
  if (!raw || typeof raw !== "object") return {};
  const result: PackMastery = {};
  for (const [id, value] of Object.entries(raw)) {
    if (!masteryDef(id) || !value || typeof value !== "object") continue;
    const v = value as MasteryRecord;
    const progress = Number.isInteger(v.progress) && v.progress >= 0 ? Math.min(8, v.progress) : 0;
    const stage = progress >= 8 ? 3 : progress >= 3 ? 2 : 1;
    result[id] = { progress, stage, unlockedOptions: stage === 3 ? ["A", "B"] : [], selected: stage === 3 ? v.selected === "B" ? "B" : "A" : null };
  }
  return result;
}

/** Compose with sidegrades, then generate immutable skill variants from reusable effects. */
export function withPackMastery(spawns: SpawnSpec[], pack?: PackMastery): SpawnSpec[] {
  return spawns.map((spawn) => {
    const config = masteryDef(spawn.id), record = masteryRecord(pack, spawn.id);
    if (!config || record.stage < 2) return spawn;
    const def = structuredClone(spawn.unitDef || UNIT_DEFS[spawn.defId]);
    const unlocks = [config.trained, ...(record.stage >= 3 && record.selected ? [config.options[record.selected]] : [])];
    for (const { effect } of unlocks) {
      if (effect.move) def.move += effect.move;
      if (effect.recoverRange) def.recoverRange = effect.recoverRange;
    }
    def.skillIds = def.skillIds.map((baseId) => {
      const base = SKILLS[baseId];
      const applicable = unlocks.filter(({ effect }) => effect.slot === base.slot);
      if (!applicable.length) return baseId;
      const id = `${baseId}:mastery:${config.name}:${record.stage}:${record.selected || "none"}`;
      if (!SKILLS[id]) {
        const skill: SkillDef = structuredClone(base);
        skill.id = id;
        for (const { name, copy, effect } of applicable) {
          skill.maxRange += effect.range || 0;
          skill.radius += effect.radius || 0;
          skill.cooldownMax = Math.max(0, skill.cooldownMax + (effect.cooldown || 0));
          if (effect.noHealing) skill.effects = skill.effects.filter((e) => e.kind !== "heal");
          if (effect.ignoreDisruption) skill.ignoreDisruption = true;
          for (const e of skill.effects) if (e.kind === "status" && e.duration) e.duration += effect.statusDuration || 0;
          skill.desc += ` Mastery / ${name}: ${copy}`;
        }
        SKILLS[id] = skill;
      }
      return id;
    });
    return { ...spawn, unitDef: def };
  });
}
