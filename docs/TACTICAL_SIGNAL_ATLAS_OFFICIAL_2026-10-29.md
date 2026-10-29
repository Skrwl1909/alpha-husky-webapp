# Official Signal Atlas Skillbook

Base: main `fb284197752d1ae32a819c1e24b2e45f223605b7` (#209). Runtime/cache: `3.6.9-official-signal-atlas`.

War Table → SQUAD now opens Signal Atlas directly. The legacy purchase panel and OPEN BETA launcher are removed; no query parameter or local-storage opt-in is required. PACK MASTERY remains alongside SIGNAL ATLAS. Atlas Close returns to War Table COMMAND; SQUAD reopens Atlas.

The existing Atlas still calls the same authenticated upgrade/respec store actions. Hero/skill IDs, ranks, points, saved Growth V1/V2, receipt confirmation and one-time respec are unchanged. V1 MEND purchases that add no effect remain unavailable, with a cooldown-minimum explanation. This does not enable Growth V2 for any account or change combat.

The new production-bootstrap regression reproduced one integration defect: the host's capture-phase Escape listener closed Tactical Ops before the Atlas confirmation could handle Escape. A two-line host guard now lets the open Atlas confirmation consume Escape. Escape outside the confirmation retains the existing host close behavior. Both source and shipped IIFE verify this.

## Validation

| Executed gate | Result |
| --- | --- |
| Existing Atlas asset P2, presentation P3, Atlas V2/model/React SSR | PASS |
| V1/V2 MEND eligibility: both disciplines, Mastery none/A/B, unowned/owned R1 | PASS, 24 combinations |
| Existing G1 transactions | PASS: actual store/parser against synthetic transport; double-tap suppression, stale/non-2xx/network rejection, missing progression, reset and mastery locks |
| Existing VNext Skillbook wire integration and player-growth checks | PASS |
| Existing Atlas P3 responsive browser runner | PASS, 17 scenario groups; 320/360/390/430px, all heroes/sectors, ownership states, pending locks, confirmation focus, failure handling, zero effect, art fallback and safe-area checks |
| New official route/source-IIFE parity runner | PASS, 18 scenario groups: four widths × both growth versions × both runtimes, plus source/IIFE action cases |
| Production build, deterministic rebuild and JavaScript syntax | PASS |
| Whitespace check | PASS |

The new browser runner uses the real production bootstrap, TacticalApp, host parser, store and Atlas. It checks exactly one `.tsa-root`, zero legacy purchase panels/launchers, Pack Mastery access, Close → COMMAND, reopening, unavailable V1 MEND, eligible V2 MEND, canonical failure-code display, one request per manual confirmation, no rejected spend, a confirmed purchase and one-time reset. Browser transport responses are synthetic; this is not a new HTTP/backend or physical-device acceptance claim.

The existing Atlas browser runner now enters through the official `SkillbookPanel` instead of bypassing it. Retired beta/legacy assertions were replaced with default-route assertions. The two SSR/store runners explicitly externalize React/Zustand and preserve dependency paths to avoid Windows test-environment inlining/spawn failures. Production store/HTTP and backend code were not modified.

CI includes the official-route runner and existing asset/presentation checks in the Tactical G1 workflow. Local PASS does not claim a hosted-CI verdict.

## Evidence

All evidence is synthetic. Browser: Chrome `156.0.8078.73`, Playwright, Node `v22.14.0`.

- [320px official route](qa/signal-atlas-official-2026-10-29/320-official.png), [360px](qa/signal-atlas-official-2026-10-29/360-official.png), [390px](qa/signal-atlas-official-2026-10-29/390-official.png), [430px](qa/signal-atlas-official-2026-10-29/430-official.png).
- [320px zero-effect rejection](qa/signal-atlas-official-2026-10-29/320-zero-effect.png).
- [Official source/IIFE results](qa/signal-atlas-official-2026-10-29/default-route-results.json), [existing Atlas browser results](qa/signal-atlas-official-2026-10-29/atlas-browser-results.json), [targeted checks](qa/signal-atlas-official-2026-10-29/targeted-test-results.json), [deterministic bundle evidence](qa/signal-atlas-official-2026-10-29/bundle-parity.json).
- [Reproduced production-bootstrap Escape failure](qa/signal-atlas-official-2026-10-29/escape-reproduction.log); fixed cases pass in source/IIFE results.

Reproduce with installed project dependencies and a Playwright-supported browser (`CHROMIUM_EXECUTABLE` can select an installed Chrome):

```sh
node tools/verify_tactical_signal_atlas_assets_p2.mjs
node tools/verify_tactical_signal_atlas_p3.mjs
node tools/verify_tactical_signal_atlas_v2.mjs
node tools/verify_tactical_g1_transactions.mjs
node tools/verify_tactical_vnext_skillbook_integration.mjs
node tools/verify_tactical_vnext_player_growth.mjs
npm run build:tactical-ops
node --check js/tactical_ops.js
node tools/verify_tactical_signal_atlas_p3_browser.mjs
node tools/verify_tactical_signal_atlas_default_browser.mjs
git diff --exit-code -- js/tactical_ops.js js/boot_loaders.js
```

## Remaining release acceptance

Physical S26 Ultra Telegram/standalone and iPhone Telegram/Safari interaction, actual host back/safe-area behavior, and authenticated backend purchase/reconnect confirmation remain owner acceptance gates. Growth V2 remains a separate server-owned, owner-approved account transition; the official Atlas supports V1 without it. No backend files, accounts or production data were edited; no merge, deployment or feature activation was performed.
