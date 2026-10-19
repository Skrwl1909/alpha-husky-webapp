/** Enemy archetypes for the authenticated Battlefield Lab.
 * One assignment policy and one shared battle engine across all mission families.
 * No persistence / rewards / progression mutation. */
import type { CombatUnit, UnitDef } from "./types";

export type EnemyArchetype = "BULWARK" | "MARKSMAN" | "DISRUPTOR" | "COURIER" | "SKIRMISHER" | "COMMANDER";

export const ARCHETYPE_COPY: Readonly<Record<EnemyArchetype, { label: string; hint: string }>> = {
  BULWARK: { label: "BULWARK", hint: "Defends a lane and protects the approach" },
  MARKSMAN: { label: "MARKSMAN", hint: "Threatens distant squad members; vulnerable up close" },
  DISRUPTOR: { label: "DISRUPTOR", hint: "Weakens your attack and initiative" },
  COURIER: { label: "COURIER", hint: "Moves toward the exit; block its escape route" },
  SKIRMISHER: { label: "SKIRMISHER", hint: "Quick flank attacker" },
  COMMANDER: { label: "COMMANDER", hint: "Applies pressure and controls priority targets" },
};

export function identifyEnemyArchetype(unit: Pick<CombatUnit, "id" | "defId" | "role" | "team">): EnemyArchetype | null {
  if (unit.team !== "enemy") return null;
  if (unit.id === "courier" || unit.defId === "signal-courier") return "COURIER";
  if (unit.role === "leader" || unit.id === "leader") return "COMMANDER";
  if (/reinforcement/.test(unit.id)) return "SKIRMISHER";
  const match = unit.id.match(/(?:^|[^a-z])h(\d+)(?:$|[^a-z])/i);
  const slot = match ? Number(match[1]) : 1;
  return (["BULWARK", "MARKSMAN", "DISRUPTOR", "SKIRMISHER"] as const)[(slot - 1) % 4];
}

export function archetypeUnitDef(def: UnitDef, archetype: EnemyArchetype): UnitDef {
  if (archetype === "COURIER") return { ...def, move: Math.max(def.move, 2), skillIds: ["hostile-strike"] };
  if (archetype === "COMMANDER") return { ...def, skillIds: ["leader-strike", "leader-crush", "leader-intimidate"] };
  if (archetype === "BULWARK") return { ...def, name: "HOUND BULWARK", hp: Math.round(def.hp * 1.35), def: def.def + 5, move: 1, skillIds: ["hostile-strike", "hound-fortify"] };
  if (archetype === "MARKSMAN") return { ...def, name: "HOUND MARKSMAN", hp: Math.round(def.hp * 0.88), move: 2, skillIds: ["hound-pulse", "hound-aim"] };
  if (archetype === "DISRUPTOR") return { ...def, name: "HOUND DISRUPTOR", hp: Math.round(def.hp * 0.95), skillIds: ["hostile-strike", "hound-interference"] };
  return { ...def, name: "HOUND SKIRMISHER", hp: Math.round(def.hp * 0.85), spd: def.spd + 3, move: Math.max(3, def.move), skillIds: ["hostile-strike", "hostile-maul"] };
}
