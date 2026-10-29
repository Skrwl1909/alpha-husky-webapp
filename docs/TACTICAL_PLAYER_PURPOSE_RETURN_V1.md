# Tactical Ops V1 player purpose and meaningful return

Baseline: `8db3528a2b672a373505080f80704d3c1f646025` (merged PR #211, 29 October 2026).

This milestone connects the existing mission, progression and consequence systems. It does not add content or activate a growth rollout. The implementation is a release candidate; physical-device and blind-player acceptance remain open.

## Changed player experience

- COMMAND has one primary mission: accepted run (including a prior rotation), active supported chapter, available story objective, unfinished Field Op, unfinished challenge, Advanced goal, then explicitly unrewarded practice. Optional alternatives target different missions. Advanced opens the existing Advanced briefing selection. Accepted runs suppress alternatives and preserve their saved squad and conditions.
- Story chapter details remain under MISSIONS. Active chapter recommendations use the existing chapter start/resume path, not the ordinary Field Op reward path. Signal Atlas and Pack Mastery retain their existing navigation and save behavior.
- The same reward presentation is used in COMMAND, mission selection and briefing. Commander Rank 3 stays certified. A prior-rotation accepted run cannot advertise a current-rotation bonus. Unavailable state stays unavailable.
- RECOVER states the next open round and the round cadence, the active ally's orthogonal relay distance and actual recovery range (including PET range), plus action/movement requirements. The command reads ROUND N while jammed. No timing or combat rule changes.
- Briefing uses the existing compiled mission directives, so Advanced deadlines are included for INTERCEPT and every other applicable objective. HOLD explains consecutive round changes/reset; SURVIVE requires the entire deployed squad through the timer; BOSS and INTERCEPT distinguish the priority target from optional patrol kills. Intercept HUD guidance gives the accepted exit coordinates.
- Results separate earned amounts, exhausted eligibility, recorded regional change and effects on future battles. An actual pressure threshold crossing explains the reinforcement delay in new relevant runs; existing accepted runs retain their timing. The primary Results action opens the recommended mission's briefing. Campaign receipts explicitly identify unavailable payout amounts.
- COMMAND recalls the last Field Op receipt, available career record and one existing saved Mastery comparison. Full build choices remain in SQUAD. Session-only combat evidence keeps its existing explicit label.

## Evidence against the supplied documents

| Requirement | Implementation and evidence |
| --- | --- |
| Blueprint §4.1, S1: one recommendation with why/win/gain | Pure `commandPurpose` and existing `deriveMissionPresentation`, shared reward labels; unique destination tests and real UI button navigation. |
| S1: objective truth across all 12 missions | 96 presentation combinations (12 missions × 2 player profiles × legacy/current and standard/Advanced), six real briefing families, 144 RECOVER timing/range/action boundaries. |
| S1: accepted run and capped veteran truth | Prior-cycle resume wins over current board; frozen objective revision and unknown older-cycle eligibility; no Rank 4; no duplicate COMMAND destinations. |
| S3: growth changes next decisions | Reuses saved Mastery comparisons generated from executable unit/skill definitions; SQUAD leads to existing Atlas/Mastery. Existing S3 power proof and growth integration regressions pass. No new upgrade, trial reward or currency. |
| S3: consequence chain and honest memory | Receipt-only result model; pressure threshold → reinforcement timing; real host parser distinguishes omitted reward amounts from confirmed zero. Courier Intel and frozen-context regressions retained. |
| S3: return recommendation | Shared pure hierarchy for COMMAND and confirmed Results; Results CTA tested against the real store and briefing, including Advanced selection. Exhausted goals lead to practice with no reward/rank promise. |
| North Star §§21–25 | Existing War Table answers where/why/gain; Results and saved record connect sessions; story, squad and mastery remain real existing options. No Evergreen expansion. |

## Automated verification

The dedicated `Tactical Player Purpose and Return` workflow runs the truth/contract/persistence suites, deterministic production-bundle comparison, baseline captures from PR #211, current mobile UI and mobile battle checks. Workflow artifact: `player-purpose-return-evidence`.

Local verification on this implementation:

- Production IIFE build, JavaScript syntax and generated loader version: PASS (`3.6.11-purpose-return`).
- Purpose/return model, all 12 missions and six objective families, capped/unknown/replay states, prior-rotation resume and recovery boundaries: PASS.
- 70 current UI cases (plus 64 baseline captures) at 320×568, 360×780, 390×844 and 430×932: fresh Tactical account after Foundation, veteran, exhausted, accepted/resumed, unavailable; real command/brief/results components and store. Additional active chapter navigation and all six briefing families are covered by the same browser suite.
- Battle mobile suite: 40 cases, 8 cooldown checks, 8 actual engine RECOVER completions, both 10×7 and legacy 8×5, host insets, touch bounds, no clipped objective/action glyphs, no overlapping board targets: PASS.
- Existing S2 actual combat matrix: 136 runs, all 12 missions, no unresolved runs or policy stalls, 68 dual-victory pairs: PASS. This is engineering evidence, not a fun or retention claim.
- Existing S1/S3 consequence, power proof and receipt boundaries, command navigation, objective clarity, Alpha-down continuation, growth/Skillbook integration, mocked save/reload and accepted-run contract suites: PASS.

Screenshots use deterministic synthetic account state and real production React components. They are not evidence of live backend persistence or rewards. Before uses the exact merged baseline source. Full captures and JSON results are in the workflow artifact; selected evidence is below.

| Surface at 390×844 | Before | After |
| --- | --- | --- |
| COMMAND | [Before](evidence/tactical-purpose-return/command-before.png) | [After](evidence/tactical-purpose-return/command-after.png) |
| Results | [Before](evidence/tactical-purpose-return/results-before.png) | [After](evidence/tactical-purpose-return/results-after.png) |

[Results consequence details](evidence/tactical-purpose-return/results-detail.png)

[RECOVER timing and distance guidance](evidence/tactical-purpose-return/recover-window.png)

## Backend contract findings

No backend change is needed for this milestone. Existing mission-start contexts, canonical Field/Campaign receipts, Mastery, growth, Intel and region snapshots are sufficient for the implemented guidance.

Two information limits remain explicit: older Field receipts can omit EXP/Bones amounts, and CampaignResult does not provide character payout amounts or repeat-bonus eligibility. The UI reports unavailable instead of fabricating a zero or award. A persisted combat event history is also unavailable; device-session observations are not promoted to server-recorded history. These are limitations, not authorization to extend backend scope.

## Remaining manual V1 acceptance gates

1. Authenticated staging/target pairing: actual first clear vs replay, receipt recovery/idempotency, new and old accepted runs after app restart and rotation change. Confirm real account state/rewards after reload.
2. Physical Telegram Android (including S26 Ultra) and iPhone/WebView: safe areas, scrolling, app minimize/return, all six objectives and next-op navigation. Browser emulation does not close this gate.
3. Five blind testers (include a developed Rank 3 account): at least four independently explain objective, reward/availability, consequence and a concrete next reason. Observe continuation without coaching; do not claim long-term retention from this sample.

No merge, deployment, backend write or global feature activation was performed by this task.
