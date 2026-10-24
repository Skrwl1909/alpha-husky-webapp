# Tactical Ops 10×7 rollout — backend handoff and QA

**Status: FRONTEND PREPARED, GLOBAL ROLLOUT NOT ACTIVE. HOLD production merge pending backend integration review.**

## Verified current behavior
- VNext 10×7 layout is tied to a *backend-accepted* immutable `rulesContract.rulesetVersion = "tactical-intent-vnext.0"`.
- Existing legacy runs with no contract must remain 8×5. A local Battlefield Lab setting is not authority for an accepted run.
- Existing Foundation endpoint `/webapp/tactical-foundation/start` returns Foundation progression state and was not known to include a contract for its `activeRunId`.
- Normal operation start already parses and validates `run.rulesContract`; Foundation does not yet pass such rules to the battle engine.

## Frontend readiness in this PR
- Parse optional `foundationRunRules: {runId, rulesContract}` on Foundation state responses. Require the returned `runId` to match `activeRunId` and apply strict existing `parseRunRulesContract`. Missing metadata means legacy 8×5.
- Carry the accepted Foundation rules to `beginBattle`, which already selects grid 8×5 / 10×7 using its frozen rules contract.
- Show actual battle grid `8×5` or `10×7` in the battle HUD, not a misleading LAB-only label.
- Preserve all gameplay/reward/progression mechanics; no backend endpoint is altered by frontend changes.

## Required backend changes before global rollout
1. Locate authoritative backend implementation for `/webapp/tactical-foundation/start`, `/state` and `/continue` and the `/mission/start` endpoint. That code is **not present in alpha-husky-webapp**.
2. Specify which *new* Foundation runs and new operation runs can use VNext, then return frozen server-accepted rules (`rulesetVersion`, `missionId`, revision fields, `source=BACKEND_SNAPSHOT`) plus matching Foundation `activeRunId`.
3. Guarantee the same frozen rules are returned on state restore and used on result commit; never upgrade a saved run mid-session.
4. Ensure backend legal grid bounds, spawns, exits/terminals, movement, enemies and receipt validation agree with VNext before rollout to all 12 missions.
5. Keep legacy run/start/continue behavior unchanged for 8×5 entries without a rules contract.
6. Roll out behind server capability and account/test gates, then measure real-device results and remove the Lab UI only after production 10×7 is proven.

## Acceptance
- Foundation new run receives server contract -> 10×7 battle, sprites within bounds, RECOVER usable on legal even rounds, result recorded.
- Old Foundation run without contract -> 8×5, unchanged progression.
- New Field Ops and Broken Signal / Dead Relay missions -> server contract 10×7, objectives and results consistent.
- Re-enter/reload/resume retains accepted grid; cache refresh does not change an active run.
- Run both backend tests and repo's tactical VNext/scheduler, persistence, grid benchmark and responsive checks.
- Telegram Android and iPhone QA, plus standalone Android build QA.
