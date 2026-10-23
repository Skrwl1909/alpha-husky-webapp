# Signal Atlas V2 — Engineering Gate (23 October 2026)

Status: IMPLEMENTED, **UI / BACKEND REAL-DEVICE QA HOLD**. No merge authorized.
Implementation PR: #173 (`feat/tactical-signal-atlas-v2-vertical-slice`), based on post-S3 #169 `main`.
Design contract: #171, `docs/TACTICAL_SIGNAL_ATLAS_V2_EXPANSION_CONTRACT.md` (separate draft PR; do not assume merged).

## 1. Actual scope
- Opt-in `War Table → Squad → Character Skillbook → OPEN SIGNAL ATLAS · BETA`; original Skillbook preserved with explicit CLOSE fallback.
- Atlas Overview: Alpha, CNC, Shadow; two live *presentation-only* sectors per hero; fixed canonical skill IDs; expandable paged sector arrangement limited to three visible sectors per atlas page. Not-released decorations are not clickable rewards.
- Sector Focus: node inspection for 0/1/2 ranks, original 3 combat skills per hero. User sees canonical shared points, actual server-owned ranks and chosen discipline.
- Preview specialization without committing it. Commit on real authenticated `upgradeGrowth` call; success is signaled only after canonical revision and owned rank comparison. Failure is not presented as a reward.
- Existing once-per-hero `respecGrowth` retained with confirmation.
- Visual: existing portraits, action icons and emblems; current Tactical Ops background; CSS/SVG live state; layout responds to narrow phones. No art is used to fake new gameplay states.
- Existing Skillbook and Atlas both block client-side buying where effective battle change is zero, including the known SHADOW MEND cooldown floor defect. This guard does not fix the underlying balance problem; it is a purchasing safety gate.
- No persistent new graph, unlocks, currencies, rewards, backend changes or global feature flips.

## 2. Automated verification
Source code has `tools/verify_tactical_signal_atlas_v2.mjs` in Tactical Battlefield VNext CI:
- All 3 heroes, 6 live view sectors, 9 canonical skills, 18 rank steps.
- Base, recorded, maxed, points exhausted, missing prereq, exclusive discipline, no-op, unauthenticated and available node states.
- SHADOW MEDIC/MEND effective-zero exclusion.
- 50-node deterministic **synthetic** geometry check (layout fixture, **not** 50 gameplay skills).
- Dynamic 1–3 visible sector anchor uniqueness + paging code gate.
- Authenticated upgrade/respec invocation and revision/rank match assertion; neither interface owns progression in localStorage.
- Existing Tactical Battlefield full matrix, legacy grid, S2 simulation, S3 checks and `npm run build:tactical-ops` run on pull request.

CI first complete result: successful on earlier implementation head `33038fbc413a302c7925760427b77cec5b606597` (workflow run 39942842134).
CI successful on expanded layout & imported art head `2ae08168688d5d5fa32454eb74953cb712c75720` (workflow run 39943770711).
**Latest final-head CI must be checked separately after any subsequent commit.** Do not inherit a historical PASS.

## 3. Still unverified — required before release
1. Actual browser visual on phone resolutions 320/360/390/430 CSS px; compare Atlas/Focus with reference art. Check safe areas, touch sizes, dialogs, typing/readability and scroll behavior. No device screenshots verified yet.
2. Login/fresh account/canonical points: open Atlas and confirm points exactly match classic Skillbook. Also retry after refreshing/reopening.
3. First-clear +1 point and replay +0 points; beta must not invent points.
4. Upgrade when eligible; server rank revision increment; fight again and verify active skill change; force rejected revision/network failure and check no phantom confirmed status.
5. Respec first use, repeat blocked, reload state unchanged.
6. Alternate discipline preview never shows purchasable rank when a different branch is saved.
7. S26 Ultra Android/Telegram, Temux iPhone 13, independent Kacper playtest.
8. Backend G0 authentication, idempotency and replay/failed-run recovery independent of frontend checks.
9. Resolve SHADOW MEND effective no-op with a separately approved gameplay design decision. Both screens now block zero-effective-change ranks; that is protection, not balancing.
10. S3 after-action navigation to Skillbook and PR #170 receipt correction compatibility; no assumptions based on old main state.

## 4. Release status matrix
| Gate | Status |
| --- | --- |
| Design graph supports future sector count through paging | IMPLEMENTED IN CODE |
| Canonical account-authoritative Skillbook | INTEGRATED; BACKEND LIVE QA HOLD |
| Automated contract/static model tests | CI result must be checked for latest head |
| Gameplay S2 and S3 preservation | CI result must be checked for latest head |
| Android/iOS player experience | HOLD |
| Balancing (MEND) | HOLD |
| Merge PR #173 | HOLD — separate approval |
| Global Tactical VNext enable | HOLD |

**GAME FIRST. HISTORY RECORDED HONESTLY.**
