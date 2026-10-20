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
