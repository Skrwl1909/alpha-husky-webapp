# Tactical Ops S3 — Growth & Consequences: acceptance contract

**Base:** S2 PR #168 head `40b957b6`. This branch is intentionally stacked on unmerged S2. **Do not merge S3 before S2.** No production VNext enablement.

## What already exists (do not rebuild)
- Backend-owned first-clear Skillbook points, three hero disciplines, rank upgrades, one-time respec.
- Backend-owned companion Pack Mastery (3/8 and 8/8), Commander ranks and Field Op challenges.
- Backend-recorded XP/BONES and Signal Pressure with reinforcement timing consequences.
- Canonical Dead Relay courier trace that changes HOLD reinforcements; replay/rotation and War Table next-mission selection.

## The actual gap
A victory can be mechanically saved without the player understanding **what changed, what did not change, and what to do next**. Existing Results screens mix generic outcome copy, server receipts and optional goals. Avoid inventing new currencies, injury systems, power inflation, reward grants, or client-side persistence to solve a communication problem.

## S3 vertical slice — one verified after-action loop
1. **Outcome:** show win/loss and tactical cost (turns, surviving squad, damage taken), sourced from completed battle.
2. **Receipt gate:** distinguish SAVING / RECORDED / RETRY REQUIRED. Never show an earned reward, unlocked ability, or persistent world change before the matching backend receipt; never show stale last-result data from another run.
3. **Consequence:** after receipt, show only actual changes: Commander points/rank, challenge, first-cycle clear, mastery, EXP/BONES, Signal Pressure or canonical campaign intel. Explicitly mark unchanged outcomes (replay, no new reward, pressure unchanged).
4. **Growth choice:** when authenticated unspent Skillbook points exist, surface a route to the existing Skillbook, not a duplicate upgrade UI. Otherwise show the existing next tactical goal.
5. **Next decision:** one primary actionable destination after save; optional replay remains secondary. If result is unrecorded, saving/retrying is the only progression action.
6. **No fabricated consequence:** failure, missing fields, old receipts and rotation changes degrade to factual copy, not optimistic progression.
7. **Device-first:** concise result hierarchy and visible actions on S26 Ultra and iPhone 13, including narrow screens.

## Mandatory automated acceptance matrix
- Field Op victory with first clear + challenge + pressure change + mastery unlock.
- Field Op replay with zero new Commander and unchanged pressure.
- Field Op failure with no granted progress.
- Canonical courier early-intel and late-clear without intel.
- Campaign defeat and replay.
- Pending network response, failed response, retry with same request ID and run ID, and stale/mismatched receipt.
- Legacy 8x5 and VNext frozen run: same outcome/reward contract.
- Growth points absent, zero and positive: no phantom upgrade CTA.
- Existing S2 136/136 simulator, legacy regression, TypeScript build, UI smoke tests all remain green.

## Non-negotiable server rules
`mission/continue` remains authoritative. No client grant; no localStorage ownership; no mutation of accepted run, ruleset, reward policy or report payload. An S3 UI must consume already validated `FieldResult`/`CampaignResult` plus canonical `FoundationProgressionState`.

## Release gates
**Engineering PASS:** implementation and test evidence on S3 head, reviewer confirms no server-side changes and all required CI green.

**Human PASS:** Kacper can answer after a mission, without prompting: “What changed?”, “Why?”, “What can I do next?” Test on S26 Ultra and iPhone 13.

**Production PASS:** independent G0 backend immutable-run and save/resume validation. No global VNext flag flip from this PR.

## Exit criterion
After an accepted battle, the player understands the *actual* consequence and sees one meaningful next action in under ten seconds. This is a UX target requiring human validation, not an automated fact.
