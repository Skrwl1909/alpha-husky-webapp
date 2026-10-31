/** Local, device-scoped Battlefield Lab switch. Never changes canonical player progression. */
export const BATTLEFIELD_LAB_KEY = "ah_tactical_battlefield_lab_v1";
export let BATTLEFIELD_VNEXT_PREVIEW = (() => {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("tacticalBattlefieldVNext") === "1") return true;
    return window.localStorage.getItem(BATTLEFIELD_LAB_KEY) === "10x7";
  } catch (_) { return false; }
})();
export let GRID_COLS = BATTLEFIELD_VNEXT_PREVIEW ? 10 : 8;
export let GRID_ROWS = BATTLEFIELD_VNEXT_PREVIEW ? 7 : 5;
/** Sets the exact grid for the accepted server run. Legacy accepted runs stay 8×5.
 * Only call with an already-validated backend contract, never raw client storage. */
export function selectAcceptedBattleRules(contract: { rulesetVersion: string } | null | undefined): void {
  BATTLEFIELD_VNEXT_PREVIEW = contract?.rulesetVersion === "tactical-intent-vnext.0";
  GRID_COLS = BATTLEFIELD_VNEXT_PREVIEW ? 10 : 8;
  GRID_ROWS = BATTLEFIELD_VNEXT_PREVIEW ? 7 : 5;
}
export const METER_MAX = 100;
export const DEF_CURVE = 50;

export type Team = "ally" | "enemy";
export type UnitRole = "alpha" | "ranged" | "skirmisher" | "support" | "companion" | "hostile" | "leader";
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
  /** V2 authored reduction; absent preserves legacy 50% GUARD. */
  guardReduction?: number;
  id: string;
  type: StatusType;
  source: string;
  duration: number;
  value: number;
}

export interface SkillEffectSpec {
  /** Optional rescue condition, measured before this ability heals. */
  maxHpRatio?: number;
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
  ignoreDisruption?: boolean;
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
  /** Presentation only; frozen when the accepted run is instantiated. */
  combatMastery?: { progress: number; stage: number; selected: "A" | "B" | null };
  recoverRange?: number;
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
  /** Authored mastery identity from the accepted run, not the live account. */
  combatMastery?: { progress: number; stage: number; selected: "A" | "B" | null };
  /** Immutable server-validated run loadout; never read from localStorage. */
  growth?: import("../data/playerGrowth").HeroGrowth;
  archetype?: "BULWARK" | "MARKSMAN" | "DISRUPTOR" | "COURIER" | "SKIRMISHER" | "COMMANDER";
  recoverRange?: number;
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
  objectiveComplete?: boolean;
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
  /** Engine measurements for the current session, never persisted rewards. */
  buildEvidence?: string;
  text?: string;
  amount?: number;
  kind?: FloatKind;
}

export interface Cell {
  c: number;
  r: number;
}

export interface RecoverObjective {
  squadExtractionRadius?: number;
  type: "RECOVER";
  terminal: Cell;
  completed: boolean;
}

export interface BossObjective {
  type: "BOSS";
  targetId: string;
}

export interface TimedObjective {
  type: "HOLD" | "SURVIVE";
  duration: number;
  terminal?: Cell;
  radius?: number;
  /** Optional stricter allied occupancy; enemy contesting keeps radius. Legacy omitted. */
  holderRadius?: number;
  /** Crosslink samples control only at round changes, then moves the relay. */
  relayRoute?: Cell[];
  progress: number;
  checkedRound: number;
}

export interface InterceptObjective {
  /** Encounter revision 2 only; legacy snapshots retain the original escape policy. */
  screenedEscape?: true;
  type: "INTERCEPT";
  targetId: string;
  exit: Cell;
}
export type BattleObjective = RecoverObjective | BossObjective | TimedObjective | InterceptObjective;
export interface MissionDirective {
  type: "SIGNAL_INTERFERENCE" | "REINFORCEMENTS" | "DISRUPTED_SUPPORT" | "NO_SAFE_EXTRACTION" | "COMPOSITE";
  name: string;
  copy: string;
  recoverEveryRounds?: number;
  supportCooldownExtra?: number;
  reinforcement?: BattleReinforcement;
  maxRounds?: number;
  conditions?: MissionDirective[];
}

export interface BattleReinforcement {
  spawn: { defId: string; id: string; c: number; r: number };
  triggerRound: number;
  telegraphed: boolean;
  spawned: boolean;
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
  healingActions?: number;
  hostilesEliminated: number;
  results: BattleResults | null;
  failureReason?: "TARGET_ESCAPED" | "DEADLINE";
  objective: BattleObjective | null;
  directive?: MissionDirective | null;
  reinforcement: BattleReinforcement | null;
  signalCarrierId: string | null;
  routingTraceAcquired: boolean;
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
