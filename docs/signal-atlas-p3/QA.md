# Signal Atlas P3 — implementation and acceptance evidence

**IMPLEMENTED — DEVICE QA PENDING.** Based on `main` at `579eb7a0f7a9dee58a75ab332904ef1df437a277` (26 October 2026). No merge, deployment or public enablement.

## What changed

The existing Atlas now uses the complete authored relay art set, with native readable control surfaces beneath it. Focus gains direct sector navigation, explicit per-node states and saved-rank context. Confirmation repeats the actual delta and cost, sits outside the scrolling panel, traps keyboard focus, supports Escape/cancel and restores focus. All purchase/respec receipt checks remain canonical and non-optimistic. All nine skills, eighteen rank upgrades, six disciplines, battle snapshots, beta opt-in and classic fallback remain unchanged.

Implementation sequence: inspect authored raster alpha/dimensions and SVG negative space; integrate art in its intended render location; improve mobile controls and modal containment; run canonical regression gates and fixture browser interactions; rebuild the production IIFE and loader together. No new art or game systems.

## Artwork decisions

| Existing asset | Final role | Treatment |
| --- | --- | --- |
| ENV-01 `atlas_relay_chamber.webp` | Overview environment | Existing live environment retained beneath dark control layers |
| ENV-02 `sector_signal_bay.webp` | Sector Focus environment | Live 720×960 backdrop beneath opaque text/control surfaces |
| CORE-01 `relay_core_bezel.webp` | Overview portrait housing | Transparent 384×384 ring, noninteractive; portrait fits its clear center |
| FRAME-01 `sector_plate.svg` | Live sector buttons | Sliced frame preserves corner geometry; labels/crests stay real DOM |
| FRAME-02 `skill_node_bezel.svg` | Interactive rank nodes | Noninteractive overlay outside real 54×54 buttons |
| FRAME-03 `skill_inspector_frame.svg` | Actual inspector | Sliced frame grows with reason, delta, cost and action |
| TRIM-01 `signal_contact.svg` | Selected inspector | Restrained 18px accent; no extra interaction |
| Six independent 512×512 RGBA crests | Six existing sectors | Existing glyph fallback retained; never replacement ability artwork |

All staged runtime roles are decided and integrated. No unresolved `Candidate` references or deferred art pass. Decorative failures hide failed images; missing backgrounds/frames leave text, controls and native borders. Portrait fallback is bounded so a failed fallback cannot loop.

## Engineering validation

- All 37 commands from the existing Battlefield VNext workflow passed locally: 36 verification/simulation/benchmark commands and the canonical build. Full output: [engineering-checks.txt](engineering-checks.txt).
- The combat matrix recorded **136/136** victories across the existing twelve mission scenarios. This is scripted engineering evidence, not a gameplay difficulty claim.
- `node tools/verify_tactical_signal_atlas_p3.mjs`: passed. Checks all thirteen runtime art references, existing receipt guards, dialog containment, readable state labels and fallback wiring.
- `node tools/verify_tactical_signal_atlas_v2.mjs`: passed after integration; three heroes, six sectors, nine skills, eighteen upgrades, receipt/availability states, zero-effect guards and real React SSR.
- `node tools/verify_tactical_command_deck.mjs` and `node tools/verify_tactical_vnext_player_growth.mjs`: passed after integration.
- `node tools/verify_tactical_ops_ios_field_hud.mjs`: 2/2 source tests passed; `node tools/verify_tactical_ops_results_status_layout.mjs`: passed. These do not replace device testing.
- Final production bundle rebuilt using `npm run build:tactical-ops`; `version.ts`, IIFE banner and loader key use `3.5.19-signal-atlas-p3`. Bundle syntax and repeat-build parity checked.
- Existing `npm run verify:tactical-ops` and `npm run verify:tactical-ops:pack-mastery` cannot run: main references absent `tools/verify_tactical_ops_combat_core_v2.mjs` and `tools/verify_tactical_ops_pack_mastery.mjs`. These legacy aliases were not repaired in this visual-only PR. Current VNext mastery, snapshot, squad, combat and growth gates passed.

## Browser evidence and its limits

The committed browser runner mounts the **real Atlas/Skillbook components and host CSS inside the fixed Tactical host/scroller**, using an isolated mocked store. It never calls a backend or changes production fixtures. Run:

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium
node tools/verify_tactical_signal_atlas_p3_browser.mjs
```

CI uses the [documented Chrome binary on GitHub’s Ubuntu 24.04 runner](https://github.com/actions/runner-images/blob/main/images/ubuntu/scripts/build/install-google-chrome.sh), avoiding a separate browser/apt download, and runs the same browser test runner. It uploads all PNG captures plus `results.json` as `signal-atlas-p3-browser-evidence`. Local execution used Playwright 1.62.1 and Chromium 153.0.8010.0. See [browser-results.json](browser-results.json) for the exact scenario groups.

Coverage: 320×568, 360×844, 390×844 and 430×844; default, partially purchased and maxed fixture records; all heroes/sectors/ranks; specialization preview immutability; 44px controls; horizontal overflow including concealed host overflow; confirm/cancel; focus trap/Escape/restoration; pending lockout; successful mocked receipt and reopen; one-time reset; stale/rejected/network saves; absent progression; zero-effect ranks; reduced motion; failed image/portrait fallback; 430×300 dialog with simulated Telegram safe areas; classic fallback/query opt-in round trip.

The maxed fixture is a visual stress record, not an assertion that currently guarded zero-effect ranks are purchasable. Browser receipt/reopen checks prove UI response to store snapshots, **not authenticated server persistence**. Full-content captures temporarily unclip the host scroller for image export only; layout and interaction assertions run with the actual fixed host. Confirmation captures use the real viewport. No S26 Ultra, Android WebView, Telegram chrome, iPhone, VoiceOver/TalkBack or live account transaction has been verified here. Contrast uses high-contrast native surfaces; there is no claim of a full WCAG audit.

## Screenshots

Same isolated fixture and host CSS on original main versus this branch:

| 390px screen | Before | After |
| --- | --- | --- |
| Overview | [Before](screens/390-before-overview.webp) | [After](screens/390-default-overview.webp) |
| Focus | [Before](screens/390-before-focus.webp) | [After](screens/390-default-focus.webp) |
| Inspector | [Before](screens/390-before-inspector.webp) | [After](screens/390-default-inspector.webp) |

| Width | Overview | Focus | Inspector |
| --- | --- | --- | --- |
| 320 | [View](screens/320-default-overview.webp) | [View](screens/320-default-focus.webp) | [View](screens/320-default-inspector.webp) |
| 360 | [View](screens/360-default-overview.webp) | [View](screens/360-default-focus.webp) | [View](screens/360-default-inspector.webp) |
| 390 | [View](screens/390-default-overview.webp) | [View](screens/390-default-focus.webp) | [View](screens/390-default-inspector.webp) |
| 430 | [View](screens/430-default-overview.webp) | [View](screens/430-default-focus.webp) | [View](screens/430-default-inspector.webp) |

Additional state comparisons: [Partial](screens/390-partial-inspector.webp), [Maxed](screens/390-maxed-inspector.webp), [Missing art overview](screens/390-missing-art-overview.webp), [Missing art focus](screens/390-missing-art-focus.webp), [Absent progression / reduced motion](screens/320-absent-reduced.webp), [Zero-effect rank](screens/320-zero-effect.webp), [Short safe-area confirmation](screens/430-short-safe-area-confirm.webp).

## Owner acceptance — S26 Ultra Telegram, safe QA account

1. Enter through existing beta opt-in; confirm classic Skillbook still returns on Close and unopted players have no new entry.
2. Switch ALPHA/CNC/SHADOW, open both sectors each, inspect base/I/II; verify portraits, six crests, focus environment, node/inspector frames, exact saved ranks and points.
3. Preview the alternate specialization: nothing saves; recorded alternative remains unavailable. Check the known MEND zero-effect rank stays disabled with its reason.
4. Review one eligible upgrade: exact delta, cost, discipline and cancel/confirm visible above Telegram/Android controls. Cancel first; points/rank stay unchanged.
5. Confirm once on the QA account; wait for canonical receipt. Close/reopen and reload: correct rank, points and discipline persist. Verify the next newly accepted battle uses that rank; an existing accepted run retains its snapshot.
6. Test interrupted/offline/rejected save safely: no false saved banner, extra grant or optimistic spend. Refresh before retrying an ambiguous receipt.
7. On a disposable eligible QA hero, cancel reset first, then confirm once. Verify canonical refund, cleared ranks/discipline and permanently used reset state after reload.
8. Check reduced-height scrolling, top/bottom safe areas, back/close, missing-art fallback, Pack Mastery, battle HUD and 8×5/10×7 smoke. Record iPhone results separately; unknown stays unverified.

Only owner evidence can change this verdict to **P3 VISUAL COMPLETE — OWNER VERIFIED**. Global release remains a separate decision.
