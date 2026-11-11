/** Deterministic fractional gear consequence, immutable and server-authorized.
 * Scores are frozen from server V2 inventory at run start. Legacy runs have no
 * gearImpactV31 and are byte-for-byte unchanged by these functions.
 * Integer micro-precision prevents random rolls and survives JSON resume.
 */
import type { CombatUnit } from "./types";

const MICRO = 1_000_000;
const OFFENSE_RATE = 180_000; // asymptotic maximum +18% of post-DEF damage
const GUARD_RATE = 140_000;   // asymptotic maximum -14% of post-status damage
const DECAY = 12;

function earn(damage: number, score: number, carry: number, rate: number): { amount: number; carry: number } {
  if (!score || damage <= 0) return { amount: 0, carry };
  const accrual = Math.round(damage * rate * score / (score + DECAY));
  const total = carry + accrual;
  return { amount: Math.floor(total / MICRO), carry: total % MICRO };
}

/** Called only for damaging skills from the server-frozen ALPHA unit. */
export function applyGearOffense(baseDamage: number, attacker: CombatUnit): { damage: number; carry?: number; bonus: number } {
  const score = attacker.gearImpactV31?.offense;
  if (score == null) return { damage: baseDamage, bonus: 0 };
  const result = earn(baseDamage, score, attacker.gearOffenseCarryV31 ?? 0, OFFENSE_RATE);
  return { damage: baseDamage + result.amount, carry: result.carry, bonus: result.amount };
}

/** Called only for hits received by server-frozen ALPHA, after GUARD statuses. */
export function applyGearGuard(baseDamage: number, defender: CombatUnit): { damage: number; carry?: number; saved: number } {
  const score = defender.gearImpactV31?.guard;
  if (score == null) return { damage: baseDamage, saved: 0 };
  const result = earn(baseDamage, score, defender.gearGuardCarryV31 ?? 0, GUARD_RATE);
  const saved = Math.min(result.amount, Math.max(0, baseDamage - 1));
  return { damage: baseDamage - saved, carry: result.carry, saved };
}
