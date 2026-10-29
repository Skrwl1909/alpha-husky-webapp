# Tactical Ops V1 release candidate

Base: main `a3e93a0f41cf22cec9fc30ff2052847662cf9f7c` (#210). Runtime/cache: `3.6.10-v1-release-candidate`.

## Fixed blockers

Signal Atlas now derives its Growth lock from the canonical public progression snapshot: Foundation `activeRunId`, any operation's `activeMissionRun`, Field Ops `activeMissionRun`, and chapter active-run state. Unowned ranks show **ACTIVE RUN**; the inspector says **COMPLETE CURRENT MISSION**. Upgrade and one-time reset confirmation are disabled, including when a background canonical refresh invalidates an already-open confirmation. Recorded ranks remain marked as owned. Inspection never changes accepted snapshots, points or ranks; only a later canonical refresh without an active run unlocks purchases.

While Atlas is open it is the single progression-error presenter. The War Table header resumes its accessible alert when Atlas closes. Canonical refresh errors also remain readable after a prior successful purchase/reset; stale success feedback cannot hide them. Refresh and the existing error codes remain available. No backend guard, request or transaction logic changed.

## Verification and scope

| Gate | Evidence/result |
| --- | --- |
| Atlas V1/V2 node eligibility, canonical active-run ownership and immutable inspection | PASS: existing model/React SSR gate plus focused active-run regressions |
| Existing G1 transactions, accepted Foundation grid, VNext wire, Skillbook integration, failure recording and Atlas presentation checks | PASS |
| Existing 12-mission objective/combat matrix | PASS: 12/12 missions, 136 engine victories, 68 paired victory routes; simulation, not human playtest |
| Existing responsive Atlas browser runner | PASS: 17 scenario groups, 320/360/390/430px |
| Production-bootstrap source/IIFE browser gate | PASS: 38 groups; default navigation, V1/V2 eligibility, purchase/respec, single error/refresh recovery, all four run families, refresh unlock and open-confirmation races |
| New isolated HTTP STRIKE proof | PASS: 10 requests; real upgrade persistence → new accepted run → unchanged resume snapshot, Growth V1/8x5 and V2/10x7 |
| Actual STRIKE R1 effect in the accepted engine build | PASS: range 1 → 2; the same target at two cells is rejected without R1 and receives actual damage with R1. Physical-device proof: none |
| Previous local HTTP acceptance and Skillbook diagnostics | REUSED PASS: 79 + 67 requests; contracts, combat/store/parser source and backend payload hashes verified unchanged |
| Hosted CI | Inspect the current Draft PR checks; local results are not a hosted-CI verdict |

The reused HTTP evidence covers mission/start/resume/continue, receipt replay/idempotency and disk reload, Pack Mastery, RECON Intel consumed once, canonical account resolution and growth rejection paths. A hash-checked reuse record identifies the prior evidence and unchanged source paths. It was not rerun as a large audit. The new STRIKE proof uses temporary users/ledger defaults, failing aggregate-store tripwires and a filesystem audit guard; no real authentication or accounts. Both purchases and accepted snapshots were independently read from temporary player JSON files, then the server and temporary storage were cleaned up.

The private HTTP proof driver remains in the local release checkpoint; public evidence contains only synthetic requests/results. No private backend source was copied into the frontend repository. The backend, authenticated transport, transaction store, combat formulas and existing mission definitions are unchanged. No global Growth V2 activation, new gameplay, merge, deployment or production writes.

## Evidence

See [test summaries](qa/tactical-v1-rc-2026-10-29/targeted-tests.json), [12-mission matrix summary](qa/tactical-v1-rc-2026-10-29/mission-matrix.json), [browser results](qa/tactical-v1-rc-2026-10-29/default-route-results.json), [existing Atlas browser results](qa/tactical-v1-rc-2026-10-29/atlas-browser-results.json), [STRIKE HTTP/engine proof](qa/tactical-v1-rc-2026-10-29/strike-evidence.json), and [reused HTTP verification](qa/tactical-v1-rc-2026-10-29/reused-http-evidence.json).

Screenshots: [320px Foundation lock](qa/tactical-v1-rc-2026-10-29/320-active-foundation.png), [360px Campaign lock](qa/tactical-v1-rc-2026-10-29/360-active-campaign.png), [390px Field Ops lock](qa/tactical-v1-rc-2026-10-29/390-active-field.png), [430px chapter lock](qa/tactical-v1-rc-2026-10-29/430-active-chapter.png).

**V1 public release: HOLD** pending the [manual acceptance checklist](TACTICAL_V1_MANUAL_ACCEPTANCE_2026-10-29.md): real Android/iPhone interaction, authentication, save/reconnect, human completion of all 12 missions and blind playtest. These are the remaining manual gates, not a request for additional features or a redesign.
