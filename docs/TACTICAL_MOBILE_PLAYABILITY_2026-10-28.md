# Tactical Ops — mobile objective and RECOVER readability

Implemented frontend candidate; physical-device acceptance remains pending. No merge, backend changes, account writes, global activation or manual deployment.

Baseline: main `46fc61eec5a8b5069129ec2e1078ff4e6faec7ca` (merged #208). Branch: `fix/tactical-mobile-command-readability-20261028`. Source/bundle/cache version: `3.6.8-mobile-objective-readability`.

## Reproduced defects and exact changes

One scope: keep the current objective and its action readable in the existing P5 rail and dock.

| Reproduced before | Implemented after |
| --- | --- |
| At 320px with simulated host insets, RECOVER ink needs 52.38px but the label box has 46.58px. GET CLOSER needs 63.05px. | RECOVER has a 68px card and 64px text area. Recovery-only dock gutters and Skip allocation give the three ALPHA skill cards enough space; all inputs remain at least 44px. |
| The 60px flex card shrinks its 12px text lines to about 10.13px. Disabled/cooling styling also changes the slot badge to normal flow, pushing the state out of the card. | Keep the original 60px card height, reduce internal vertical padding, remove inherited meta margin, prevent label shrinking and keep the slot and cooldown badges absolutely positioned in every state. No font reduction. |
| RECOVER objective reads SIGNAL OPEN / SIGNAL OPEN (or JAMMED twice). | Task is RECOVER RELAY; second line remains the real SIGNAL OPEN/JAMMED state. Completed state remains RELAY RECOVERED / OBJECTIVE COMPLETE. |
| STOP COURIER BEFORE EXIT needs 175.58px and clips at 320/360/390px. | INTERCEPT COURIER / BEFORE THE EXIT; COURIER STOPPED still follows actual battle state. Full original rules and accessible descriptions remain in the existing details. |

No changes to combat formulas, AI, grid selection, targeting, mission definitions, progression, Skillbook, pet definitions, identity or server contracts. No character enlargement or new telegraph visuals.

## Before/after measurements

The focused runner mounts the real BattleScreen, store and engine using the existing `tools/fixtures/battlefield-p5.tsx`. It makes no API calls. It runs 320×568, 360×780, 390×844 and 430×932; each uses legacy 8×5 and accepted VNext 10×7 fixture selection. HOLD, INTERCEPT, RECOVER ready, jammed and out-of-range states produce 40 cases per phase. Host insets: top 32px, bottom 24px, sides 6px.

| Metric over those 40 cases | Before | After |
| --- | ---: | ---: |
| Clipped objective cases | 6 | 0 |
| Clipped recovery command/state cases | 24 | 0 |
| Duplicate objective/status cases | 24 | 0 |
| Overlapping board input pairs | 0 | 0 |
| Covered live input centers | 0 | 0 |
| Horizontal or vertical page overflow | 0 | 0 |

All 40 field rectangles, dock heights and character image rectangles/load states are identical between phases. The action cards stay 60px high; with the simulated bottom inset the total dock remains 96px. New readable text does not take space from the board.

This establishes no additional actionable defect in the inspected character rendering or low-occlusion warnings. It does not establish human character recognition, universal touch accuracy or physical-device legibility. Projected board targets remain smaller than 44px on narrow 10×7 boards; this change does not claim otherwise. The existing large legal-target strip is preserved.

## Paired screenshots

Each pair uses identical seeded battle positions, viewport, accepted grid and host insets.

| Case | Before | After |
| --- | --- | --- |
| 320×568 VNext RECOVER | [before](qa/mobile-playability-2026-10-28/before/320x568-vnext-recover.png) | [after](qa/mobile-playability-2026-10-28/after/320x568-vnext-recover.png) |
| 320×568 legacy RECOVER | [before](qa/mobile-playability-2026-10-28/before/320x568-legacy-recover.png) | [after](qa/mobile-playability-2026-10-28/after/320x568-legacy-recover.png) |
| 360×780 VNext RECOVER | [before](qa/mobile-playability-2026-10-28/before/360x780-vnext-recover.png) | [after](qa/mobile-playability-2026-10-28/after/360x780-vnext-recover.png) |
| 390×844 VNext RECOVER | [before](qa/mobile-playability-2026-10-28/before/390x844-vnext-recover.png) | [after](qa/mobile-playability-2026-10-28/after/390x844-vnext-recover.png) |
| 430×932 VNext RECOVER | [before](qa/mobile-playability-2026-10-28/before/430x932-vnext-recover.png) | [after](qa/mobile-playability-2026-10-28/after/430x932-vnext-recover.png) |
| 360×780 INTERCEPT | [before](qa/mobile-playability-2026-10-28/before/360x780-vnext-intercept.png) | [after](qa/mobile-playability-2026-10-28/after/360x780-vnext-intercept.png) |
| 320×568 two announced threats | [before](qa/mobile-playability-2026-10-28/before/320x568-vnext-hold.png) | [after](qa/mobile-playability-2026-10-28/after/320x568-vnext-hold.png) |

Raw [before metrics](qa/mobile-playability-2026-10-28/before/results.json), [after metrics](qa/mobile-playability-2026-10-28/after/results.json), [comparison](qa/mobile-playability-2026-10-28/comparison.json), [regression results](qa/mobile-playability-2026-10-28/regression-results.json) and [P5 results](qa/mobile-playability-2026-10-28/p5-results.json) are retained.

## Verification

- Focused browser runner: 40 baseline measurements and 40 after cases PASS, plus eight cooldown-card checks and eight actual engine RECOVER completions. After-only assertions enforce full objective and RECOVER glyph bounds, distinct task/status, readable ALPHA names, >=44px dock controls, safe bounds, image loading, board hit testing, no page scroll, genuine engine-owned readiness and stable expanded HUD. A targeted cooldown-card assertion failed before restoring the cooldown badge position and passed afterward; its reproduction log is retained.
- Existing P5 browser runner: 33 measured scenarios including its acceptance checks PASS; movement, targeting/cancel/skip, duplicate inputs, threat lifetime, SHADOW heal/guard, PET fallback, enemy turn, victory/defeat, reduced motion and forced colors.
- Existing directional browser runner PASS: four directions, attack and equipped skin/live-composite guards.
- Sixteen existing non-browser scripts PASS; exact names/exit codes are retained in regression-results.json. Includes G1 transactions/fieldcraft, Atlas, accepted Foundation/run-wire, scheduler/counterplay, iOS HUD, layout and full-combat simulation. The existing legacy full-combat simulation reports 136/136 victories, not human playtest evidence.
- Canonical production IIFE rebuilt, syntax checked, loader/cache synchronized; whitespace check PASS.
- Hosted CI: inspect the final Draft PR head. Local PASS is not a hosted-CI verdict.

Reproduce after installing project dependencies and Playwright/Chromium:

```sh
node tools/verify_tactical_mobile_playability.mjs
node tools/verify_tactical_battlefield_p5_browser.mjs
node tools/verify_tactical_alpha_directional_browser.mjs
npm run build:tactical-ops
node --check js/tactical_ops.js
git diff --exit-code -- js/tactical_ops.js js/boot_loaders.js
```

Browser runners accept `CHROMIUM_EXECUTABLE` and `PLAYWRIGHT_MODULE` overrides. Local execution used headless Chromium 153.0.8010.0 and Playwright 1.62.1 from the supplied runtime; hosted P5 uses its existing pinned Playwright version and runner Chrome. For measurement-only baseline collection, set `MOBILE_PHASE=before` on unchanged baseline runtime source. The before phase deliberately records defects rather than asserting they are fixed.

## Physical-device gate

NOT VERIFIED: S26 Ultra Telegram WebView and standalone Android, iPhone 13 Telegram/Safari, actual host safe-area values, finger accuracy, human comprehension, sustained performance and live persistence. On a test environment, check RECOVER ready/jammed/out-of-range, INTERCEPT title, all three heroes, both accepted grids, target/cancel/move/skip, busy input rejection and safe-area transitions. Real authenticated persistence remains outside this frontend-only milestone.
