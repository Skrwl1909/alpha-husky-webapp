# Tactical Ops P2 — Courier Pressure Test Gate (18 Oct 2026)

STATUS: SYNTHETIC ENGINE CI PASS / GAMEPLAY GO-HOLD. DRAFT ONLY. Not player-tested.

## What changed
Only canonical mission `dead-relay-courier`: courier HP 68 -> 100, move 1 -> 2, +1 HOUND (h2 at 3,3), and brief copy. Other Field Ops and Relay Hold unchanged. No backend/rewards/stat-system changes.

## Actual engine test
GitHub Actions workflow: https://github.com/Skrwl1909/alpha-husky-webapp/actions/runs/39155910637

Two synthetic 3-unit squads (Alpha+CNC+SHADOW or Alpha+CNC+PET); three **synthetic** Alpha profiles (HP/ATK fresh 120/28, mid 128/33, high 138/39); two deterministic **diagnostic bot** policies (focus/control). Not skilled human play, not production accounts.

| Metric (THE COURIER, 12 cases) | Baseline PR #134 | P2 variant PR #135 |
|--|--|--|
| Win | 12/12 | 12/12 |
| Finished | round 2 in all | rounds 2–3 |
| Allied HP lost | 0 all | 0–50 |
| Enemy actions before win | 2 | 3–6 |
| Fresh Alpha+CNC+SHADOW focus | R2, 0 damage | R3, 34 damage |
| Fresh Alpha+CNC+SHADOW control | R2, 0 damage | R3, 48 damage |
| Fresh Alpha+CNC+PET focus | R2, 0 damage | R2, 18 damage |
| Mid Alpha+CNC+SHADOW focus | R2, 0 damage | R2, 0 damage |

RELAY HOLD cross-check unchanged: 4/4 wins, round 4; Intel delays HOUND reinforcement round 2 -> 3.

## Interpretation / remaining gate
- **Verified in synthetic actual-engine runs:** increased pressure, slower some clears, fresh victory remains possible for both test squads.
- **NOT VERIFIED:** that control or blockade is strategically competitive. Current simple control policy often takes MORE damage and adds turns. This could reflect a weak diagnostic bot, but cannot be sold as evidence of agency.
- **NOT VERIFIED:** exit blocking softlock, human clarity, mobile layout/new-game gates, iOS, ongoing run compatibility and production client deployment.
- **HOLD merge:** Test a deliberate pursuit/blockade policy under same snapshot. If universally inferior, adjust one encounter-specific rule or threat (not global stats). Re-test with a new Android/Telegram build and optional tester before release.
- Do not touch live saves or backend. No claim of player enjoyment or retention.

## Follow-up
Use this draft as the candidate, not final balance. Prefer measured alternative strategies and readable threat over more raw HP inflation.
