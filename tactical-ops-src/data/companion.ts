import type { UnitDef } from "../combat/types";

export interface TacticalPet {
  id: string;
  name: string;
  img: string;
}

export function parseTacticalPet(raw: unknown): TacticalPet | null {
  if (!raw || typeof raw !== "object") return null;
  const pet = raw as Record<string, unknown>;
  if (typeof pet.id !== "string" || !pet.id.trim() || typeof pet.name !== "string" || !pet.name.trim()) return null;
  if (typeof pet.img !== "string" || !/^https:\/\//.test(pet.img)) return null;
  return { id: pet.id, name: pet.name, img: pet.img };
}

export function tacticalPetDef(pet: TacticalPet): UnitDef {
  return {
    defId: `pet:${pet.id}`, name: pet.name, team: "ally", role: "companion",
    hp: 78, atk: 18, def: 6, spd: 13, move: 4,
    sprite: pet.img, portrait: pet.img,
    skillIds: ["pet-bite", "pet-hamstring"],
  };
}
