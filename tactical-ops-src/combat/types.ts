export const GRID_COLS = 8;
export const GRID_ROWS = 5;
export const METER_MAX = 100;
export const DEF_CURVE = 50;

export type Team = "ally" | "enemy";
export type UnitRole = "alpha" | "ranged" | "skirmisher" | "support" | "hostile" | "leader";
export type SkillSlot = "A1" | "A2" | "A3";
export type Screen = "hub" | "war-table" | "brief" | "battle" | "sector" | "results" | "defeat";
export type BattleMode = "idle" | "selected" | "targeting" | "locked";
export type TargetType =
  | "SELF"
  | "ALLY_SINGLE"
  | "ENEMY_SINGLE"
  | "ALLY_AOE"
  | "ENEMY_AOE"
  | "AREA_RADIUS";

export type StatusType =
  | "ATK_UP"
  | "DEF_UP"
  | "SPD_UP"
  | "GUARD"
  | "BLEED"
  | "ATK_DOWN"
  | "DEF_DOWN"
  | "SPD_DOWN";

export type FloatKind = "dmg" | "heal" | "guard" | "info" | "status";

export interface StatusEffect {
  id: string;
  type: StatusType;
  source: string;
  duration: number;
  value: number;
}

export interface SkillEffectSpec {
  kind: "damage" | "heal" | "status";
  multiplier?: number;
  base?: number;
  scale?: number;
  status?: StatusType;
  duration?: number;
  value?: number;
  on?: "primary" | "aoe_allies" | "aoe_enemies" | "self" | "hits";
}

export interface SkillDef {
  id: string;
  name: string;
  desc: string;
  slot: SkillSlot;
  cooldownMax: number;
  targetType: TargetType;
  minRange: number;
  maxRange: number;
  radius: number;
  effects: SkillEffectSpec[];
}

export interface UnitDef {
  defId: string;
  name: string;
  team: Team;
  role: UnitRole;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  move: number;
  sprite: string;
  attackSprite?: string;
  portrait?: string;
  skillIds: string[];
}

export interface CombatUnit {
  id: string;
  defId: string;
  name: string;
  team: Team;
  role: UnitRole;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  move: number;
  c: number;
  r: number;
  statuses: StatusEffect[];
  cooldowns: Record<string, number>;
  meter: number;
  hasMoved: boolean;
  hasActed: boolean;
  defeated: boolean;
  sprite: string;
  attackSprite?: string;
  portrait?: string;
  skillIds: string[];
  weaponIcon?: string;
  identitySource?: string;
}

export interface BattleResults {
  victory: boolean;
  turns: number;
  hostilesEliminated: number;
  squadStanding: number;
  squadDeployed: number;
  damageTaken: number;
  bonesRecovered: number;
}

export type BattleOutcome = "ongoing" | "victory" | "defeat";

export interface BattleEvent {
  type:
    | "damage"
    | "heal"
    | "status"
    | "expire"
    | "defeat"
    | "ticker"
    | "banner"
    | "move"
    | "cooldown"
    | "info";
  unitId?: string;
  text?: string;
  amount?: number;
  kind?: FloatKind;
}

export interface Cell {
  c: number;
  r: number;
}

export interface BattleState {
  units: CombatUnit[];
  activeId: string | null;
  inspectId: string | null;
  actionSkillId: string | null;
  mode: BattleMode;
  round: number;
  unitTurn: number;
  actionsLeftInRound: number;
  outcome: BattleOutcome;
  damageTaken: number;
  hostilesEliminated: number;
  results: BattleResults | null;
  seed: number;
}

export type AiAction =
  | { type: "skip" }
  | { type: "move"; to: Cell; then?: Exclude<AiAction, { type: "move" }> }
  | { type: "skill"; skillId: string; targetId?: string; cell?: Cell };

export interface OperationDef {
  id: string;
  name: string;
  objective: string;
}
