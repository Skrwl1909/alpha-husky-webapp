# Tactical Unit Motion V1 — pilot

Base: `1d4e3f8c800f999f69e4a199051e6c22be7175c9`.

## Behavior

Standing tokens and temporary melee actors share the width/depth contract in
`ui/unitVisual.ts`. Attack actors use the same bottom-center canvas anchor as the
standing token. Existing event contact times (37%, 42%, 49%), damage, legal tile
positions, touch targets and turn resolution are unchanged. The visual actor stops
0.7 body-canvas widths short of the victim so the silhouettes do not merge.

Base Alpha's horizontal STRIKE and the Skirmisher's horizontal melee/heavy attack
use eight articulated frames each, with a contact pose at the existing arrival
phase. The left attack mirrors the right sheet. Frame canvases overflow the actor
without enlarging its body width or input footprint. Source sheets and normalized
WebP sheets are both included. Runtime sheets total approximately 760 KiB.

Frames are preloaded and decoded. A missing/undecodable sheet retains the static
actor. Cosmetics, vertical attacks and unsupported skills retain their existing
art. Reduced motion keeps the stationary token visible and hides travel overlays.
The Bulwark's existing wide key pose uses its measured canvas/body-height ratio.

## Reproduction

Node 22.12+ or 24, npm. Dependencies are pinned in package-lock.json.

```sh
npm ci
npm run build:tactical-ops:unit-motion
npm run build:tactical-ops
npx playwright install --with-deps chromium
npm run verify:tactical-ops:unit-motion
node tools/verify_tactical_alpha_directional_browser.mjs
```

The normalizer uses sharp 0.34.5. It measures alpha >100 for foot baselines,
uses one scale per character from the first frame, retains a fixed x pivot, and
places feet at y=480 in 512px tiles. The manifest records source and output SHA-256.
Source art can be reprocessed deterministically; generating the same image again
is not deterministic. Prompt details are in the source directory README.

The browser gate checks both 8×5 and 10×7 grids at 320×568, 390×844, 430×932,
844×390 and 1280×800. It measures resting/travel width, contact foot position,
unchanged input rectangles, eight distinct atlas frames, left mirroring, cleanup,
cosmetic/vertical fallback, reduced motion and failed-image fallback.

## Validation observed locally

- Production build and `node --check js/tactical_ops.js`: PASS.
- New browser gate: PASS, both grids × five viewports and fallback checks.
- Existing combat-motion, enemy-motion, visual-alignment, overhead projection,
  overhead arenas, FX readability, FX identity, visual cohesion: PASS.
- Browser used: headless Chromium 158 from @sparticuz/chromium 158.0.0,
  Playwright 1.62.1. The system Chromium launcher had no executable, and the
  Playwright CDN download returned 403; the separate npm-provided binary was used.

## Acceptance and remaining scope

This is a local browser-tested presentation pilot, not production/device acceptance.
The current arena, logical projection, movement path, existing recoil/death effects,
other characters, other skills, skins and vertical art are retained. New walking,
idle, hit and death frame sets and a perspective redesign are not part of this patch.
Art consistency and pacing still need review on Telegram/Android, especially at
small screen sizes. Do not describe this as a complete character-animation system.

No backend, combat rules, progression or reward logic is changed. Rollback is a
revert of this change including the compiled bundle and loader cache key.

## Browser captures

[Alpha contact](qa/unit-motion-v1/alpha-contact.png),
[Skirmisher contact](qa/unit-motion-v1/skirmisher-contact.png),
[frame preview](qa/unit-motion-v1/alpha-strike-preview.gif),
[measured results](qa/unit-motion-v1/results.json).
The GIF combines paused browser frames; it is not a live-device recording.

## Reconciliation after public power rollout (2026-11-28)

The pilot is reconciled with PR #335's merged tree `8b6e12ab37c9bed0d95205cd6b05253da7222e51`.
Only the pilot presentation, version/cache, build pins, and provenance dispatch
are extended; combat/data/host/store sources from the public release remain
unchanged. War Table's nine approved artworks remain byte-identical. Local
checks: canonical build and deterministic sheet regeneration; both grid sizes
at five viewports; 8-frame contact, unchanged hitboxes, direction, reduced
motion, missing-sheet and cosmetic fallbacks; confirmed-power, final release
contracts and War Table asset gates. Real device acceptance remains pending.
