# Tactical Overhead Perspective V1 — implementation and acceptance

**Scope:** Global render-only high-angle tactical projection. Applies to Legacy 8×5 and accepted VNext 10×7. No changes to AI, mission spawns, hit/HP, reward policy, server acceptance, replay, tactical contracts, pathfinding or persistence.

## What changed

- A single `FIELD_PROJECTION` in `combat/movement.ts` projects *all* cell anchors onto a nearly rectangular overhead play surface: x=12–88%, y=24–82%. Prior trapezoid was narrower at the top.
- `fieldPercentForGrid` and `fieldPercent` keep the logical grid dimensions separate from rendering; `fieldTouchFootprint` derives per-cell pointer size from exactly the same projection (82% fill, never neighbor-overlapping).
- All Battle consumers continue calling canonical `fieldPercent`: units, legal movement, markers, telegraphs, tether endpoints, recovery/intercept/hold tiles, travel FX, results and floats. No CSS transform is applied to the pointer layer.
- `overheadProjection.css` is loaded last, scoped to `data-projection="relay-overhead-v1"`. It rebalances existing field art and floor contrast while preserving truthful danger and target layers.
- `verify_tactical_overhead_perspective.mjs` bundles the actual TS geometry module for 8×5/10×7 mathematical and touch isolation checks.

## Art dependency / no false completion claim

This is a full **camera / UI geometry** change across the shared renderer, not a new mission slice. It does **not** include finalized Broken Signal / Dead Relay / Field Ops images or updated HOUND turnaround art. The existing side-oriented background remains until the approved three near-overhead environments are committed. A matching floor illustration is necessary for the intended AAA perspective to feel complete; no placeholder art is introduced.

## Required verification and acceptance

- CI: run `node tools/verify_tactical_overhead_perspective.mjs` and canonical `npm run build:tactical-ops`; check committed `js/tactical_ops.js` and loader cache key match the build on Ubuntu Node 22.
- Existing P5 browser/layout tests, VNext contract verification, G1-G4 progression regression tests.
- Capture READ / TARGET / REACT / RESOLVE / WIN states across 320, 360, 390, 430 mobile and 780 landscape, 8×5 and 10×7, all six objective families.
- Confirm cell tap -> same cell selection; nearby enemy taps do not leak through; legal target strip remains accessible; threat tile never blocks input.
- Physical device QA: Telegram Android Samsung S26 Ultra and iPhone 13; inspect overlaps, tap precision and animation stutter.
- G0/S4 release gate remains **HOLD** pending real backend and blind playtests. Merge only when these regressions pass and art is integrated/approved.
