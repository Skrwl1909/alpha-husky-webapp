/** Signal Codex VNext, sourced ONLY from skills actually available in the deployed squad.
 * A family is a language for existing effects, NOT an invented new ability, slot or unlock.
 * Recon and Mobility remain empty unless an equipped skill genuinely performs that function.
 */
import type { SkillDef, UnitDef } from "../combat/types";
import { getSkill } from "./skills";
import { canonicalGrowthSkillId, resolveGrowthSkill, type GrowthSnapshot } from "./playerGrowth";
export type SignalFamily = "Recon" | "Control" | "Defense" | "Mobility" | "Support";
export const SIGNAL_FAMILIES: readonly SignalFamily[] = ["Recon", "Control", "Defense", "Mobility", "Support"];
export interface EquippedProtocol {
  family: SignalFamily;
  unit: string;
  skillId: string;
  skillName: string;
  slot: string;
  description: string;
  cooldown: number;
}
export function signalFamily(skill: SkillDef): SignalFamily | null {
  const statuses = skill.effects.filter(e => e.kind === "status");
  if (skill.effects.some(e => e.kind === "heal")) return "Support";
  if (statuses.some(e => e.status === "GUARD" || e.status === "DEF_UP")) return "Defense";
  if (statuses.some(e => e.status === "ATK_DOWN" || e.status === "SPD_DOWN")) return "Control";
  if (statuses.some(e => e.status === "SPD_UP" && e.on === "self")) return "Mobility";
  if (statuses.some(e => e.status === "ATK_UP" || e.status === "SPD_UP")) return "Support";
  return null;
}
export function equippedSignalCodex(units: readonly UnitDef[], snapshot?: GrowthSnapshot | null): EquippedProtocol[] {
  const result: EquippedProtocol[] = [];
  for (const unit of units) {
    const hero = snapshot?.heroes.find(h => h.heroId === unit.defId);
    const skillIds = Array.isArray(unit.skillIds) ? unit.skillIds : [];
    for (const skillId of skillIds) {
      const base = getSkill(skillId);
      // Pack Mastery / sidegrades may change the executable id but never the owned Skillbook key.
      const resolved = resolveGrowthSkill(base, hero);
      const family = signalFamily(resolved);
      if (!family) continue;
      result.push({
        family, unit: unit.name, skillId: canonicalGrowthSkillId(skillId),
        skillName: resolved.name, slot: resolved.slot, description: resolved.desc,
        cooldown: resolved.cooldownMax,
      });
    }
  }
  return result;
}
export function squadTradeoff(ids: readonly string[], equippedPetId?: string | null): string {
  if (!ids.includes("alpha")) return "Alpha must lead the deployed squad.";
  const absent: string[] = [];
  if (!ids.includes("ally-02")) absent.push("CNC range and pressure");
  if (!ids.includes("ally-03")) absent.push("SHADOW healing and shelter");
  if (equippedPetId && !ids.includes(`pet:${equippedPetId}`)) absent.push("PET pursuit and HAMSTRING");
  return absent.length ? `Not deployed: ${absent.join("; ")}.` : "All currently available squad roles are deployed.";
}

/** A1/A2/A3 are the existing active ability slots. All equipped skills are shown,
 * including non-Codex basic attacks; no new capacity number is invented.
 */
export interface ActiveProtocolSlot {
  unitId: string;
  unitName: string;
  slot: string;
  skillId: string;
  name: string;
  family: SignalFamily | null;
  cooldown: number;
  minRange: number;
  maxRange: number;
  description: string;
  effects: SkillDef["effects"];
  targetType: SkillDef["targetType"];
}
export function activeProtocolSlots(
  units: readonly Pick<UnitDef, "defId" | "name" | "skillIds">[],
  snapshot?: GrowthSnapshot | null,
): ActiveProtocolSlot[] {
  return units.flatMap(unit => {
    const hero = snapshot?.heroes.find(h => h.heroId === unit.defId);
    return unit.skillIds.map(id => {
      const skill = resolveGrowthSkill(getSkill(id), hero);
      return {
        unitId: unit.defId, unitName: unit.name, slot: skill.slot,
        skillId: id, name: skill.name, family: signalFamily(skill),
        cooldown: skill.cooldownMax, minRange: skill.minRange,
        maxRange: skill.maxRange, description: skill.desc,
        targetType: skill.targetType, effects: skill.effects.map(e => ({ ...e })),
      };
    });
  });
}
export interface CounterplayReadiness {
  id: "INTERRUPT" | "SLOW" | "PROTECT" | "RECOVER";
  label: string;
  available: boolean;
  source: string | null;
  detail: string;
}
export function counterplayReadiness(
  slots: readonly ActiveProtocolSlot[], snapshot?: GrowthSnapshot | null,
  intentSchedulerActive = false,
): CounterplayReadiness[] {
  const disruptor = snapshot?.heroes.find(h => h.heroId === "ally-02")?.discipline === "disruptor";
  const interrupt = intentSchedulerActive && disruptor
    ? slots.find(s => s.unitId === "ally-02" && canonicalGrowthSkillId(s.skillId) === "u02-suppress" &&
      s.effects.some(e => e.kind === "status" && e.on === "hits")) : undefined;
  const slow = slots.find(s => s.effects.some(e => e.kind === "status" && e.status === "SPD_DOWN" &&
    (e.on === "hits" || e.on === "primary" || e.on === "aoe_enemies")));
  const protect = slots.find(s => s.effects.some(e => e.kind === "status" &&
    (e.status === "GUARD" || e.status === "DEF_UP") && (e.on === "aoe_allies" || e.on === "primary")));
  const recover = slots.find(s => s.effects.some(e => e.kind === "heal" &&
    (e.on === "primary" || e.on === "aoe_allies")));
  const make = (id: CounterplayReadiness["id"], label: string, slot: ActiveProtocolSlot | undefined, detail: string): CounterplayReadiness =>
    ({ id, label, available: Boolean(slot), source: slot ? `${slot.unitName} · ${slot.name}` : null, detail });
  return [
    make("INTERRUPT", "CANCEL LOCKED ATTACK", interrupt,
      intentSchedulerActive ? "CNC Disruptor PRESSURE can cancel a confirmed locked attack." : "Available only while VNext intent telegraphs are enabled."),
    make("SLOW", "SLOW PURSUIT", slow, "Speed reduction can delay a pursuing or escaping unit."),
    make("PROTECT", "PROTECT ALLIES", protect, "Shield or DEF support reduces danger while allies hold position."),
    make("RECOVER", "RECOVER HP", recover, "Healing restores allies after damage; it does not cancel a locked attack."),
  ];
}
