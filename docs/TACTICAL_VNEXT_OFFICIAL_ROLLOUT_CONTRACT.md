# Tactical Ops — VNext official production promotion contract

STATUS: **RELEASE HOLD / NOT LIVE TO ALL PLAYERS**. This branch introduces strict parsing of a server-issued rules contract, not an unsafe switch from the local Lab toggle.

## Product decision

One official target gameplay: 10×7 battlefield, telegraphed enemy intents with actual counterplay, role-specific combat kits, all 12 authored mission objectives. The old battlefield is **compatibility-only for previously accepted runs**, not an alternate game mode for new players.

## Non-negotiable implementation gate

1. Backend must issue `runRulesContract` in **both** /webapp/tactical-foundation/mission/start return `run` and persisted `activeMissionRun`. It is immutable per run: `rulesetVersion: tactical-intent-vnext.0`, `missionId`, positive `missionRevision`, `combatProfileVersion`, `masterySnapshotVersion`, `rewardPolicyVersion`, `source: BACKEND_SNAPSHOT`.
2. The backend must reject tampered or mismatched client contracts, freeze squad, stats, pet, mastery, objectives, mission config, rotation and reward rules. Existing run without the contract continues under legacy rules.
3. Client must select the **combat geometry, AI, target bounds, actual telegraphs and visuals per accepted run**, not from global localStorage/URL. No mid-run geometry change.
4. Backend and client must agree which ruleset produced the report; server validates rewards using that ruleset, not a client declaration.
5. All 12 missions and Foundation stages must complete in deterministic engine simulation for 10×7, plus legacy replays, softlock/defeat tests, threat-counterplay and saved-run resumed-run tests.
6. Android Telegram + standalone and iPhone smoke testing are required. Roll out new runs gradually with server-side rollback, preserve old accepted runs. Do not auto-merge/deploy.

## Findings from audit (21 Oct 2026)

* `combat/types.ts` chooses 8×5 or 10×7 at **module import time** by reading device-local Lab state; the same global switch changes enemy archetypes and VNext scheduler.
* `battle.ts` rescales legacy spawn/objective coordinates automatically when Lab is active.
* Current backend response parsing did not preserve an accepted per-run rules contract. This branch adds strict read/mission-ID matching for the wire payload, without trusting client-local values.
* `missionContracts.ts` explicitly marks 12/12 mission contracts LEGACY, premiumReady false. `verify_tactical_ops_vnext_contract.mjs` explicitly fails if VNext is enabled by default.
* Backend implementation is **not present in this GitHub repository**. A frontend-only toggle cannot meet the above criteria.

## Production acceptance

No “VNext live” announcement until all checks above are verified. This document is the single handoff for backend integration. A subsequent atomic frontend+backend release changes the official default. Do not delete Lab or break existing runs before that release.
