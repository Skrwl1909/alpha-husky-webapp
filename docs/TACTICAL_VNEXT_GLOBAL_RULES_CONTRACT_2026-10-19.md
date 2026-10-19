# Tactical Ops VNext — Global Game Rules Contract (A / clean baseline)

Date: 2026-10-19 | Source reference: ALPHA_HUSKY_TACTICAL_OPS_PREMIUM_SYSTEM_BLUEPRINT_V2_2026-10-19-1.md

## Status and limits

**IMPLEMENTED IN THIS BRANCH, NOT GAMEPLAY-ACTIVE:** a typed versioned Threat/Intent interface, a factual event-ledger interface, a deterministic announcement/commit/cancellation gate, an explicit mission coverage registry, a topology validator, and a read-only verification script. The opt-in flag is hard **OFF**. No new playable enemy behavior, cover, UI telegraphs, AAR, server saves, or rewards are claimed.

**VERIFIED IN GITHUB SOURCE (main 5693679499ce02068b8d7a31bc2071b07bbe1cd1 at review):** existing 8x5 grid, SPD/meter, actions A1/A2/A3 (PET has 2), skill cooldowns and status effects; V3 bounded profile for Alpha/PET; Field reportVersion compatibility, legacy INTERCEPT, existing backend mission-start/continue receipts. GitHub source is not the production runtime. Separate device and backend verification remains mandatory.

**PRODUCT DECISION FOR THIS CONTRACT:** One 3-member squad mechanic, one grid, one initiative engine, one objective/intent/response/aftermath grammar in Foundation, Broken Signal, Dead Relay and all Field Ops. No mission-by-mission engine forks.

## Locked combat contracts — VNext target, not deployed

1. **Signal Read:** preview the real mission objective, next meter activations and announced impactful enemy threats. A dangerous unannounced action must not resolve before a meaningful reaction window. The new engine will schedule WINDUP before COMMIT. First activation must be protected too.
2. **Command:** on the active player's turn, movement + one legal action as permitted by the existing engine; KILL, DISRUPT, REPOSITION/BLOCK, and PROTECT/TRADE are different answers, not interchangeable damage labels.
3. **Commit:** the announced action keeps its locked enemy, target, tile, impact zone, effect and resolution clock. If its assumptions no longer hold, produce an explicit cancellation event. A fallback must announce a *new* intent with a fresh reaction window, never silently retarget.
4. **Execution:** a committed intent MUST be legally executed by the real engine using the same declared parameters, or canceled. Neither presentation nor planned estimates may invent damage.
5. **Aftermath:** a BattleEventLedger may record an effect only when the engine actually generated it; canonical player growth/Intel/rewards may be displayed only after backend confirmation.

*Contract API now implemented:* `announceIntent`, `adjudicateIntent`, `confirmExecutedIntent`, `parseRunRulesContract`, `canStartVNextRun`. It does not yet route enemy turns or player input.

## Existing mission inventory (all 12; no invented unlocks)

| Family | ID | Current objective | Target tactical question |
| --- | --- | --- | --- |
| Broken Signal | broken-signal-breach | ELIMINATE | alarm vs blocker |
| Broken Signal | broken-signal-recover | RECOVER | reach and activate terminal |
| Broken Signal | broken-signal-commander | BOSS | survive/disrupt command pressure |
| Dead Relay | dead-relay-courier | INTERCEPT | intercept an escaping courier |
| Dead Relay | dead-relay-hold | HOLD | protect area; Intel can delay reinforcement |
| Dead Relay | dead-relay-guardian | BOSS | read and counter boss patterns |
| Field | field-relay-recovery | RECOVER | reach relay amid intermittent recovery |
| Field | field-relay-hold | HOLD | secure a contested zone |
| Field | field-squad-survival | SURVIVE | keep all three alive through duration |
| Field | field-relay-intercept | INTERCEPT | pursuit vs survival (v3) |
| Field | field-isolated-hold | HOLD | zone control under reduced support |
| Field | field-rearguard | SURVIVE | regroup before reinforcements |

**Special case:** `field-relay-intercept` on accepted Field `reportVersion < 3` remains **RECOVER**; v3 is INTERCEPT. Mission registry describes current definitions, not old attempts. A migration must test both separately. Foundation stages `solo-1`, `solo-2`, `ally-koda`, `full-broken-signal` are also in the coverage gate, but are not counted as 12 mission definitions.

**Map baseline:** all 40 cells of 8x5 are FLOOR in this new description, matching the absence of a global terrain ruleset. COVER, BLOCKER, RELAY, EXIT and HAZARD are reserved *types*, not activated mechanics. No deceptive obstacle artwork without rules. Future topology variants need legal movement, spawn, path and objective checks first.

## Squadron and growth: policies to carry into the engine

- Alpha: player stats and gear from immutable server-authorized combat profile; timing and defensive control must matter, not only higher damage. INT/LUCK have no claimed VNext combat effect.
- CNC: VANGUARD/DISRUPTOR choice. Existing ATK_DOWN/SPD_DOWN is **not** PIN; never report that a courier was stopped when merely slowed.
- SHADOW: WARDEN/RESTORER, real guarding verified against attack and relay rules before claiming saved damage.
- PET: BITE/HAMSTRING only until changed. PET is a squad-slot tradeoff, not an extra fighter or another copy of Pet Arena stats.
- Pack Mastery 0/3/8, Rank 1–3, first-clear, Field pressure, Intel and campaign records are preserved, with no new gameplay advantages tied to HOWL.

## Run lifecycle and safe migration contract

1. **Old attempts:** missing `rulesetVersion` means legacy. Do not attach a new intent engine to a currently active, older run; do not rescale V2/V3 profiles on resume.
2. **New VNext attempts (future):** server must snapshot and return `rulesetVersion`, `missionRevision`, combat profile version, Mastery snapshot version and reward-policy version. All required fields are versioned, strictly parsed and immutable for the run. Current backend response does not yet satisfy this contract; VNext remains disabled.
3. **Old clients:** an Android/WebView bundle unable to execute a VNext ruleset must be given a legacy run or an explicit update block by the server; no silent divergence. Static client flag alone is insufficient authorization.
4. **Progression:** retain existing `runId`, revision-based state, `requestId` idempotency, backend receipts and already granted rewards. BattleEventLedger is explanatory evidence, *not* an alternate authority for Bones, XP, Intel or rank.
5. **Rollback:** VNext start flag OFF stops new runs. Existing VNext active runs require their original ruleset implementation retained in the bundle (or explicit safe block + recovery); never silently reinterpret as legacy.

## Next integration sequence (one mode, system-wide)

**A — contract and baseline:** complete only after backend source and live save schema audit, CI green on this branch, 12+Foundation inventory test and old-Android compatibility decision. This PR starts that work, not a fake A DONE.

**B — global intent scheduler:** integrate versioned plans into combat state, plan AI from objective roles, guarantee the reaction turn through meter scheduling, execute the exact committed action, cancel/renotify on interruptions. Use the same executor in all mission families; individual missions are fixtures only.

**C — meaningful Pack:** implement effect semantics (real control, blocking, protection) across the engine; test fresh/mid/high and three legal 3-unit compositions on the same problems.

**D — factual outcomes:** derive AAR from battle events + canonical receipts, expose what changed from Courier Intel / Field pressure / mastery, make defeat advice traceable.

**E/F/G — visual, long-term, release:** map topologies, safe-area HUD, 2.5D FX, devices, Veteran/Elite trials and complete multi-entrance regression only after gameplay gates.

## Hard verification gates

- True target-lock forecast + WINDUP reaction even when an enemy acts first; zero silent re-target.
- Distinct real KILL / DISRUPT / BLOCK / PROTECT consequences; never pretend ATK_DOWN is a stun.
- Headless full mode: all objectives and directives, fresh/mid/high, three squad builds, three tiers where legal, resume/legacy, deterministic replay, no AI softlocks, no duplicated rewards.
- Backend: auth, active-run frozen profiles, field reportVersion 1/2/3, Intel delay, mission/first-clear/currency idempotency; deployment path must be verified separately from the GitHub repo.
- Device: Android S26 Ultra and iPhone 13 Telegram live, 9:16 and safe areas, cold/hot cache, Pack Comms non-overlap, reduced motion, muted audio, real build `js/tactical_ops.js` and updated `CACHE_KEY`.
- Real players: 3–5 independent first sessions and return sessions; judge understood threats and varied counterplay, **not** only turns-to-kill.

## Known blockers / handoff

- Backend Tactical Foundation source is not verified by this frontend PR; runtime VPS version and saved-run history require direct audit. Do not modify live DB or deploy.
- Intent planner/AI scheduler, ledger integration, versioned backend snapshot and accurate per-effect AAR are not implemented yet.
- No merge / Android APK / production rollout solely on the strength of this read-only contract.
