# S2 — Meaningful Combat: encounter architecture & verification gate

> Implementation-ready design and QA specification. **DESIGN ONLY — no gameplay or backend change in this branch.**

## Current implementation / hard constraints
- PR #166 is merged. The 12 defined missions and six role archetypes exist in main.
- S1 clarity UI is not proof of S2 combat depth; avoid another label-only PR.
- VNext geometry/intents depend on accepted-run rules. Verify backend G0 before using 10×7 as the only production mode; the mission-contract baseline still denotes LEGACY.
- Use existing squad choices ALPHA+CNC/SHADOW/PET, actual skill/cooldown rules, 6 archetypes and mission goals; do not inflate HP, fabricate victories or client-side rewards.
- Preserve `field-relay-intercept` reportVersion <3 RECOVER and >=3 INTERCEPT semantics for accepted saved runs.

## Player experience acceptance
1. In every mission a fresh player can see a threat and make at least two **legal** materially different decisions before a decisive enemy attack.
2. An enemy plan appears in advance if the scheduler claims an attack telegraph; MOVE / DISRUPT / PROTECT must have actual distinct validated consequences.
3. Decisions affect position, health, cooldown, zone control or available allies; no fake red markers, invulnerable scripted wins or guaranteed scripted losses.
4. Each mission keeps its own objective and fail condition; kills are not substitutes for RECOVER/HOLD/SURVIVE.
5. 5–9 minutes remains a hypothesis measured on devices, NOT an engine timer or excuse for inflated HP.

## Mission cards — one playtestable encounter contract per mission

| Mission | Win type | Decision | Plan A | Plan B | Readable enemy intent | Complication | Verified outcome to assert |
| --- | --- | --- | --- | --- | --- | --- | --- |
| broken-signal-breach | ELIMINATE | Patrol priority vs healthy squad | Focus exposed patrol | Control flanking HOUND | First visible hostile lock | Competing threat across lanes | Patrol cleared |
| broken-signal-recover | RECOVER | Rush terminal vs stabilize patrol | Fast terminal approach | Remove pressure before RECOVER | Enemy controls approach | Signal window / flanking patrol | RECOVER activated |
| broken-signal-commander | BOSS | Control adds vs commit to leader | Disrupt leader, then strike | Focus leader through patrol | Leader locked strike | Leader forces target tradeoff | Marked leader defeated |
| dead-relay-courier | INTERCEPT | Block escape vs burn courier HP | Cut off route with PET | Slow courier with CNC and focus fire | Courier exit movement forecast | Escort pressures interceptor | Courier stopped; first fast clear may record intel |
| dead-relay-hold | HOLD | Occupy zone vs clear contested area | Hold supported ally at relay | Intercept hostiles before entry | HOUND reinforcement announced | Zone contests and resets | Three consecutive controlled round changes |
| dead-relay-guardian | BOSS | Resist push vs exploit leader opening | Protect team then focus boss | Disrupt guardian and flank | Leader pressure forecast | Reinforcement threatens cover | Guardian defeated; campaign clear |
| field-relay-recovery | RECOVER | Signal window vs safety | Rush to open window | Protect/clear approach until next window | Signal alternates open/jammed | Patrol pressures route | RECOVER pressed when open |
| field-relay-hold | HOLD | Control vs chase foes | Defend holder with SHADOW | CNC/PET delay approaching contesters | Telegraphed HOUND arrival | Contested relay forces reposition | Three controlled round changes; no-heal optional |
| field-squad-survival | SURVIVE | Disrupted support cooldown vs damage avoidance | Protection and spread | Control enemy offense | Pressure on fragile ally | Support cooldown extended | Full squad survives four rounds |
| field-relay-intercept | INTERCEPT/RECOVER by accepted reportVersion | Block courier vs recover old objective | Block exit or focus courier (v3) | Control patrol / signal window (legacy) | Courier route OR signal availability | Same ID different accepted rules | Result aligned to accepted run, not device flag |
| field-isolated-hold | HOLD | Fight leader vs hold point | Move in and protect holder | Control leader outside contested zone | Leader pressure warning | Turn-5 challenge deadline | Two controlled round changes; optional by round 5 |
| field-rearguard | SURVIVE | Spread vs protect wounded squad | SHADOW sustain and cover | CNC pressure interrupts incoming HOUND | Reinforcement at round 3/4 | Flank threatens isolated unit | Three allies survive five rounds |

## One integrated implementation, not cosmetic slices
### Gate G0 — before official promotion
- Verify backend-issued `rulesContract` and persistence across `mission/start`, resume, result.
- Freeze geometry, AI, profile, objectives and report version per accepted run, including old 8×5.
- No global toggle or `premiumReady=true` without backend and new acceptance matrix.

### S2-A — role behaviours and objective-aware enemies
- Keep six existing archetypes. Improve objective-aware priorities in `combat/ai.ts`, rather than introducing new entities.
- BULWARK blocks approach, MARKSMAN controls ranged lane without suicidal melee, DISRUPTOR pressures support/cooldown, SKIRMISHER flanks/contests, COURIER seeks exit, COMMANDER escalates pressure.
- For each role author 2 concrete legal states and assert its chosen action is valid, motivated and distinct from other roles.
- Never produce a planned action that ignores its own targeting/cooldown/movement limits.

### S2-B — mission-specific tactical dilemmas
- Encode the twelve cards as encounter fixtures/decision contracts, with one opening decision, one meaningful escalation and one win/fail boundary.
- Use telegraph, reinforcement windows, and objective contesting; **do not** merely add enemy HP or artificial extra rounds.
- Ensure any alternate strategy has a legal action path on all allowed squad compositions.
- If two options converge to indistinguishable outcomes, revise the encounter; a choice is meaningful only if costs differ.

### S2-C — forecast integrity and counterplay
- Validate `intentScheduler` queue/commit/cancel against actual enemy ability and target.
- Verify moving the target, legally disrupting, defending and doing nothing each give an honestly represented result.
- AI cannot silently retarget a locked skill. Canceled marker must disappear before the next player action.
- No softlock: dead ALPHA with living allies, blocked courier exit, empty enemy list in HOLD/SURVIVE, spent movement, occupied reinforcement entry.

### S2-D — balance / player proof
- Run existing 68 legal mission–squad–profile deployment combinations **plus actual turn simulations** and negative cases; the 68 matrix on its own covers composition legality, not completion rate.
- Record rounds to first threat, turns spent without meaningful choice, round/time to outcome, wins vs failures, damage avoided through counterplay, and decisions with visibly different costs.
- Test fresh/developed squads, CNC+SHADOW, CNC+PET, SHADOW+PET where legal. Compare no intervention vs counterplay policies.
- Do manual 320–430px S26 Ultra and iPhone 13 tests. New-player Kacper session without coaching is mandatory.

## Release gates
| Gate | Pass criteria |
|---|---|
| Engine invariants | No softlocks, legal actions only, objective truth preserved in all 12 missions |
| Enemy telegraph | Every announced damage skill either executes as announced or is visibly canceled/countered; no ghost tiles |
| Meaningful decisions | Each mission demonstrates two viable player routes with different observable tactical costs in tested fixtures |
| Variety | Mission differences are actual win conditions, constraints and role pressures, not cosmetic headings |
| Balance | Instrumented results and documented manual feel; no blanket HP inflation to meet target duration |
| Experience | Kacper can state objective, one important choice, and what would change on retry, without hints from dev |
| G0 | Backend per-run contract and compatibility verified before official live 10×7 rollout |

## Implementation map
- `tactical-ops-src/combat/ai.ts`, `enemyArchetypes.ts`: decision priorities.
- `tactical-ops-src/combat/intentScheduler.ts`, `intentContract.ts`: locked-intent legality.
- `tactical-ops-src/data/operations.ts`, `data/missionContracts.ts`: encounter cases and immutable versioning.
- `tactical-ops-src/combat/battle.ts`, `missionRules.ts`: authoritative outcomes.
- `tools/verify_tactical_vnext_step5_squad_matrix.mjs`: deployment; add runtime decision and outcome benchmarks separately.
- `tools/verify_tactical_vnext_counterplay.mjs`: extend real locked-forecast counterfactuals.

## Evidence/report format for completion
For every mission, output `missionId | acceptedRuleset | squad | profile | choiceA | choiceB | observed difference | rounds | outcome | softlock | source SHA`. Separate automated PASS from user-tested feel. Never claim retention improvement from five qualitative sessions.

## Next execution prompt
Work on ONE S2 implementation PR with a finished combat loop, not a collection of label changes. Start with deterministic encounter fixtures for all 12 missions and objective-aware AI/locked forecast tests, then tune with observed outcomes. Do not alter backend rewards/monetization. Release HOLD pending backend G0 and real-device new-player QA.

