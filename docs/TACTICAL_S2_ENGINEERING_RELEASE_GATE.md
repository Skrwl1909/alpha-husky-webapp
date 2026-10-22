# Tactical Ops S2 — Engineering Release Gate (PR #168)

**Scope:** VNext LAB gameplay and deterministic regression. No backend feature flip, reward policy change, HP inflation, migration, or promise of statistically validated retention.

## Changes and provenance

- Objective-aware enemy selection in `combat/ai.ts`: HOLD holders, RECOVER proximity, SURVIVE vulnerability, INTERCEPT protection, BOSS defense and ELIMINATE pressure. Legacy AI selection remains gated.
- Existing immutable announced actions in `intentScheduler.ts` are now exercised within full encounter simulations (not just isolated tests): forecast → allied reaction → execute/cancel, with counters sourced from actual combat ledger events.
- Two legal mission-completing player policies: **TEMPO** (commit early to objective) and **CONTROL** (clear or protect approach, then complete objective). In INTERCEPT, CONTROL uses a real allied unit to physically occupy the courier's exit, while other allies engage. No changes to courier speed, HP or escape rules.
- Deterministic matrix `tools/simulate_tactical_s2_full_combat.mjs`: 12 mission definitions × 34 legal deployments × 2 bounded stat snapshots × TEMPO/CONTROL = 136 battles, compared as 68 pairs.
- CI report persisted as `tactical-s2-full-combat-report` on PR workflow. Not a live-player sample.

## Mechanical gates (automated)

- 12/12 authored missions present; 68/68 paired deployments with two **real victories** of different recorded tactical cost (round count / position count / attacks / actual objective actions). A policy fail or stall does NOT satisfy this condition.
- Every mission exercises the locked-intent scheduler AND produces at least one actual counter ledger event across simulated runs; no ghost threat merely counted from UI.
- No unresolved outcome, no scripted policy stall, all chosen enemy actions remain legal in existing AI tests.
- All original VNext counterplay, player growth, companion configurations, and legacy-grid regressions green.
- Live reward state, server receipts and official 10×7 launch remain outside this PR.

## Interpreting the benchmark

Two optimized scripted policies winning 136/136 scenarios **does not establish balanced difficulty or 5–9 minute real human duration**. It demonstrates reachable solutions and systematic tactical differences in these frozen fixtures, not a real player win rate. There is no claim that every build, device, or player always wins.

The earlier RECOVER/HOLD "stalls" came from a deliberately wrong attack-only controller. They were not evidence of a game-engine softlock. The final controller pair both pursue the actual win condition.

## Merge gate and next pillar

**Engineering merge gate:** latest head SHA passes Tactical Battlefield VNext and original 8×5 compatibility regression. Reviewer verifies no accidental change to `missionForContext`, accepted saved-run rules, database writes or server rewards. PR may merge to main after engineering review.

**Production VNext rollout gate G0 (separate):** backend-accepted immutable run contract, old run resume, cross-platform saved-run and progression receipt QA.

**Human feel gate (separate):** S26 Ultra and iPhone 13 mission playtest, Kacper blind player test, check real-duration and difficulty for BREACH / SURVIVE / REARGUARD. Do not claim "S2 VERIFIED ON DEVICE" before these pass.

S3 Growth & Consequences may proceed in parallel on its own branch after engineering merge, without enabling production VNext until G0.

## Concrete device playtest brief

1. Fresh starter runs BREACH, SURVIVE and REARGUARD: record whether difficulty offers an actual threat or just guaranteed wins.
2. Play RELAY INTERCEPT with squad ALPHA+CNC+SHADOW using TEMPO focus fire, then ALPHA+CNC+PET using exit blockade; confirm both work without special debug flags beyond supported VNext lab.
3. In HOLD, allow a contested relay and react to two different announced threats: moving a locked target must cancel the tile strike; choosing not to react should allow the legal forecast to resolve.
4. Kill ALPHA mid-mission but keep CNC/PET alive: verify turn continuation, legal objective completion or clear defeat without softlock.
5. Verify resume on legacy 8×5 and no changed awards/commander progress after an accepted run.
