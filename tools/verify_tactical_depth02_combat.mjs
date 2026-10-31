/** Reuse the existing real-engine controller, scoped to two plans and two squads. */
process.env.DEPTH02 = '1';
await import('./verify_tactical_depth01_combat.mjs');
