# S9B — The Edge Relay / Doctrine Chapter — implementation and private backend handoff
## Scope
Three paths, each three consecutive missions: RECON (Field Relay Recovery -> Field Relay Intercept -> Dead Relay Courier), DEFENSE (Field Relay Hold -> Isolated Hold -> Squad Survival), INTERDICTION (Field Relay Intercept -> Rearguard -> Dead Relay Guardian). Chapter is a separate progression layer; no existing operation flags or reward tables may be overwritten.

## Game-design contract
The player selects ONE doctrine for a chapter; choice is immutable until completion. Each next mission is unlocked by a backend-accepted receipt, not simply any prior global clear of the same mission. The next mission should be replayable even if it is not in the current Field Ops rotation: the private backend must issue an explicit chapter mission acceptance rather than bypassing the existing Field Ops validator. Chapter failure never destroys prior completions. Players can resume an accepted run under frozen rules. No login streaks and no automatic token rewards.

## Source implemented in this public PR
- Pure, deterministic doctrine route and reference reducer: tactical-ops-src/data/campaignChapter.ts.
- Strict optional canonical tacticalChapter parser. Invalid payload fails closed, no fabricated progress; field absent means S9B panel absent.
- Read-only chapter dossier on COMMAND panel, only from parsed authoritative snapshot. Selection is deliberately non-interactive until backend is ready.
- Three-doctrine × three-stage verification scenarios with fake event rejection and revisions. No localStorage, no new gameplay writes.
- No economy, wallet, rewards or backend source changes.

## Private backend gate (separate PR; DO NOT copy backend source into this public repo)
1. Add per-player chapter record: version, chapterId, status, doctrine, revision, completedMissionIds, activeRunId, intelEffect, intelConsumedByRunId, lastReceiptId. Follow migration/version handling and backfill legacy accounts as AVAILABLE only when onboarding complete.
2. Add authenticated, idempotent CHOOSE command with expectedRevision and requestId. Never trust a client progress count.
3. Extend mission/start with a distinct chapter intent and server-issued immutable run context: chapterId, doctrine, stage index, accepted missionId, rules, grid, modifier snapshot and requestId. Use an explicit whitelisted chapter mission, even if absent from current Field Ops rotation.
4. At mission/continue, independently validate authentic runId, mission objective, stage, verification contract and server-calculated result before advancing. Reject replay/old cycle/duplicate attempts. Failures release the chapter run without advancing. Use a transaction or compare-and-swap.
5. On stage three completion, persist one doctrine-specific Intel effect: RECON delays a telegraphed reinforcement by one round; DEFENSE unlocks a south entry on the following eligible encounter; INTERDICTION shifts a pre-defined hostile telegraph once, without inventing a damage amount. Apply ONLY through immutable next-run rules, consume once transactionally, and expose consumed-by-run evidence. If not applicable, retain until an eligible encounter, clearly displayed.
6. Read-only /webapp/tactical-foundation/state response includes tacticalChapter snapshot; replay and server reconnection return identical canonical state. The client parser only displays it, does not settle.
7. Add explicit snapshot-backed choice function only after the private endpoint is deployed and tested; future frontend PR must check revision and accepted receipt before updating UI.

## Integrity tests to run on private backend
- Choice is irreversible; no switch mid-run; double choose idempotent; stale revision rejected.
- Three consecutive missions per doctrine; wrong order rejected. Prior global clear does not count. A failed run stays on same stage.
- Same completion request twice grants once; distinct request with same run no double advance; interrupted session resumes frozen rules; no cross-player progression.
- 8x5 accepted legacy runs remain untouched; 10x7 runs remain valid; no unverified client payload can claim a victory.
- All three Intel modifiers change an actual next battle, each exactly once and only if applicable; no stat scaling or P2W.
- XP, Bones, Commander points and HOWL remain unchanged unless separately specified and audited.

## MERGE HOLD
This public PR is schema/read-only groundwork, NOT playable S9B. Do not merge until new CSS is built into canonical IIFE, version/cache sync is committed, all regression CI is green, S26 Ultra read-only QA succeeds, and private backend shape is reconciled. Do not advertise selectable doctrine to players before the backend feature is real. Keep the read-only panel gated by the optional server field.