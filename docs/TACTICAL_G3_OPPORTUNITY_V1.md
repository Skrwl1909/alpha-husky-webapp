# G3 — Progression opportunity and reward clarity V1

Baseline: main `50fb6a2e9de7f3c3a905dcb5427f4f97e9701a09` (#233 merged).
#230 remains an open draft and is not included. Blueprint inspected locally:
`ALPHA_HUSKY_TACTICAL_OPS_LONG_TERM_EVERGREEN_GAMEPLAY_ARCHITECTURE_V1.docx`.
Its design direction is not treated as implementation evidence.

The existing loop had two misleading edges: the separate Veteran CTA could
recommend another rotation credit after it was spent, and a first-clear receipt
could hide an unmet optional challenge. G3 uses one recommended action and
explains the outcome from server fields.

The War Table prioritizes a server-projected Veteran opportunity after accepted
runs, active chapters and unfinished story. New objective diversity is preferred
when meaningful. The existing Field Op clear/challenge and Relay Mastery routes
remain fallbacks. Missing records and expired boards cannot imply an open reward.
The Brief explains potential Veteran progress alongside the existing objective,
failure, Advanced and optional challenge conditions. Results shows actual receipt
amounts, challenge outcome and readable Veteran reasons, then opens the next
recommended mission with its correct tier. There is one Veteran counter per
ordinary Results panel. Old-rotation receipts cannot imply today’s bonus was already
claimed. Pending, failed and mismatched receipts confirm no earnings.

## Authority and backend dependency

Backend required: **YES for reliable Veteran recommendations**. Existing fields
expose credit totals, mission history and `lastCycle`, but no canonical decision
about a meaningful next objective, including diversity at the credit cap. Duplicating
that resolver in JavaScript would violate the authority boundary.

The separate private patch adds `fieldOps.veteranOpportunity` to the public
projection. It calls the existing Python Veteran credit resolver on copies and
adds no writes, eligibility rules, thresholds, account migration or run fields.
Payload: version, cycleId, status (`eligible`, `claimed`, `locked`, `unknown`),
reason, eligible missionIds and recommendedMissionId. This describes potential
for a new Advanced run. Start validation and accepted-run settlement remain authoritative.
Absent, malformed, future or stale optional projections fall back safely.

Private source, tests, source hashes and manual deployment/rollback instructions
are outside this public repository: `K:\ALPHA_WORKSPACE\G3_PRIVATE20261103`.
The local foundation baseline already contains the prepared G1 release; unknown
or older VPS files must be reconciled, never overwritten with this snapshot.

## Review gates

Local verification: focused G3 domain/host checks; 30 browser cases over 45
surfaces at 320/412/430px; existing 20-case Veteran browser suite and 138-case production Results/legacy suite; purpose, S1,
S3, accepted-run and G1/P5 checks; canonical build and syntax. Private projection
tests and existing Growth/VNext backend tests use synthetic accounts only.
See PR checks for results on the exact published commit. No assertion was weakened;
two old fixtures now include actual records and a non-expired board respectively.

**Merge HOLD** until relevant current-head CI, private baseline preflight,
authenticated receipt acceptance and physical S26 Ultra Telegram QA pass.
Historical provenance gates pinned to old integrations must be reconciled as
their own issue; G3 does not weaken or rewrite them.
No production or AAA acceptance is claimed. No VPS access or deployment occurred.

Owner rollout order, after explicit approval: verify and back up matching backend
files; apply the private read-only patch; verify the running projection; review
and publish the frontend runtime bundle, then its cache loader. The frontend can
run against an older backend with unknown Veteran availability. Rollback restores
the two code files and previous frontend release; account/receipt data stays intact.

## Five-minute S26 Ultra physical QA

1. Minute 0–1: Open Telegram War Table on a controlled QA account. Confirm one
   readable primary opportunity, current status and a reachable CTA at default font size.
2. Minute 1–2: Open that CTA. Confirm correct mission and Advanced tier, objective,
   deadline, optional challenge and potential-versus-confirmed reward wording.
   Reopen a previously accepted legacy run and confirm its squad/conditions stay frozen.
3. Minute 2–3: Complete a prepared near-finish QA run, missing its optional challenge.
   Confirm actual amounts, no challenge bonus, and the matching server receipt.
4. Minute 3–4: Repeat with the rotation credit already claimed. Confirm no second
   Veteran credit and truthful no-credit reason. On a separate prepared recording
   case, interrupt connectivity: pending/failed shows no confirmed earnings; retry
   records the same run once. Do not reset or migrate real player data.
5. Minute 4–5: Tap Results' next CTA; confirm the named available mission and tier.
   Check scrolling, Telegram safe areas, back navigation and tap targets. Capture
   sanitized screen evidence and mark physical acceptance PASS/HOLD explicitly.

Pre-stage synthetic/controlled accounts and near-finish runs so this is five minutes
of acceptance, not a request to complete multiple full battles within five minutes.
