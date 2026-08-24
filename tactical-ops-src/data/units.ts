import type { OperationDef, UnitDef } from "../combat/types";

const IMG = "/images/tactical_ops";

export const OPERATION: OperationDef = {
  id: "broken-signal",
  name: "BROKEN SIGNAL",
  objective: "Eliminate the hostile force and secure the tactical sector.",
};

export const UNIT_DEFS: Record<string, UnitDef> = {
  alpha: {
    defId: "alpha",
    name: "ALPHA",
    team: "ally",
    role: "alpha",
    hp: 120,
    atk: 28,
    def: 12,
    spd: 14,
    move: 3,
    sprite: `${IMG}/alpha.png`,
    attackSprite: `${IMG}/alpha-attack.png`,
    portrait: `${IMG}/alpha-portrait.jpg`,
    skillIds: ["alpha-strike", "alpha-rend", "alpha-howl"],
  },
  "ally-02": {
    defId: "ally-02",
    name: "UNIT 02",
    team: "ally",
    role: "ranged",
    hp: 96,
    atk: 22,
    def: 8,
    spd: 12,
    move: 2,
    sprite: `${IMG}/ally02.png`,
    portrait: `${IMG}/ally02.png`,
    skillIds: ["u02-shot", "u02-burst", "u02-suppress"],
  },
  "ally-03": {
    defId: "ally-03",
    name: "UNIT 03",
    team: "ally",
    role: "support",
    hp: 100,
    atk: 16,
    def: 10,
    spd: 10,
    move: 2,
    sprite: `${IMG}/ally03.png`,
    portrait: `${IMG}/ally03.png`,
    skillIds: ["u03-tap", "u03-mend", "u03-pack"],
  },
  hostile: {
    defId: "hostile",
    name: "HOSTILE",
    team: "enemy",
    role: "hostile",
    hp: 68,
    atk: 16,
    def: 8,
    spd: 11,
    move: 2,
    sprite: `${IMG}/hound.png`,
    portrait: `${IMG}/hound.png`,
    skillIds: ["hostile-strike", "hostile-maul"],
  },
  leader: {
    defId: "leader",
    name: "HOSTILE LEADER",
    team: "enemy",
    role: "leader",
    hp: 148,
    atk: 24,
    def: 14,
    spd: 9,
    move: 2,
    sprite: `${IMG}/leader.png`,
    portrait: `${IMG}/leader.png`,
    skillIds: ["leader-strike", "leader-crush", "leader-intimidate"],
  },
};

export interface SpawnSpec {
  defId: string;
  id: string;
  c: number;
  r: number;
}

export const BROKEN_SIGNAL_SPAWNS: SpawnSpec[] = [
  { defId: "alpha", id: "alpha", c: 2, r: 2 },
  { defId: "ally-02", id: "ally-02", c: 1, r: 0 },
  { defId: "ally-03", id: "ally-03", c: 1, r: 4 },
  { defId: "hostile", id: "h1", c: 5, r: 0 },
  { defId: "hostile", id: "h2", c: 5, r: 3 },
  { defId: "hostile", id: "h3", c: 6, r: 4 },
  { defId: "leader", id: "leader", c: 6, r: 2 },
];
