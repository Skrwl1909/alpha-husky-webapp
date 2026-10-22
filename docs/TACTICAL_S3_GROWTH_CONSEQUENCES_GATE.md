# Tactical Ops S3 — Growth & Consequences acceptance gate

Source of truth: ALPHA_TACTICAL_OPS_MEANINGFUL_GAMEPLAY_BLUEPRINT_V1 (2026-10-21), section S3. Base: merged PR #168.

Six mandatory capabilities: (1) Power Proof AFTER saved Skillbook/Pack Mastery/sidegrades, (2) at most three specialization trials for CNC, SHADOW, PET, (3) tactical synergy challenges with two legal approaches, (4) accepted-run consequence chain, (5) no invented after-action events, (6) truthful return recommendation. This is one pillar; individual contributions are not S3 completion claims.

## Engineering boundaries
* No reward writes from presentation, new currencies, Commander rank cap change, $HOWL advantage, inflated HP or global VNext feature flip.
* Server authoritative result and accepted-run snapshot only. Never infer a persistent front change from a battle animation.
* In-memory combat moments are not verified server event-log history and may not be displayed as persisted archival facts.
* Legacy 8×5 accepted runs remain compatible. Production rollout blocked on G0 backend verification.
* Separate S4 gate: Android and iOS device QA, blind tester evidence, backend idempotency/recovery.

## Current implementation status
The initial S3 after-action view model is a receipt-grounded proof and next-action selector, intentionally not a persistent event log. After-action evidence and optional training goals now connect to engine-confirmed skill results and accepted result receipts. Power Proof derives from persisted current loadout; three role trials and two chain-order synergy variants are wired, with no new rewards. A bounded device-session combat journal is intentionally **not** server archival history. Do not mark S3 production VERIFIED before G0 backend acceptance and S4 blind device tests.

## Required acceptance evidence
1. A failed or unrecorded upgrade never gets confirmation; reload accurately preserves effect.
2. Actual BEFORE/AFTER values from combat resolvers, including A/B mastery.
3. Trials have confirmed event evidence, no fake rewards or PET exclusivity.
4. Courier early-intel and pressure alter next accepted encounter; already accepted attempts retain original rules.
5. Empty or transient event log produces no fabricated hero narrative.
6. Zero additional clear/challenge rewards after claiming; backend idempotency.
7. All 12 missions, 8×5 regression, CI and live device QA reviewed independently.

## Execution checkpoint — 2026-10-22

- Implemented: Skillbook, Pack Mastery and sidegrade change proofs, receipt-bound after-action and next tactical reason; 3 role goals and 2 synergy routes are evaluated against actual engine effects with runId validation. S3 event proof is session-only and cannot survive refresh; the panel explicitly says so.
- Accepted run consequence contract: `missionBattleRules()` reads immutable accepted `campaignContext.courierTraceAcquired` and `fieldContext.pressure`, while frontend never modifies those fields to create a result. Existing execution contract tests do not replace live backend verification.
- Technical CI suite must prove: S2 136 full combat fixtures, S3 receipt truth, Power Proof, S3 combat evidence + whole tactical VNext suite and production build.
- Blocked on external acceptance: independent VPS backend run context and idempotent reward receipt, S26 Ultra Android, Temux iPhone 13, Kacper blind trial, user recognition of real progression and next goal. Do not silently declare player-fun PASS.
- No automatic merge; keep Draft until CI and technical review are fully completed. Do not enable VNext globally.
