# Tactical Ops — Three Overhead Battlefields (production integration)

## Authored source selection (2026-11-05)

Three user-approved, original images are used:
- **Broken Signal**: `Zamarznięta stacja przekaźnikowa nad górami(1).png` — snowbound relay, cyan optics, cold grey ground.
- **Dead Relay**: `Martwa Stacja Przekaźnikowa(1).png` — damaged relay under blood moon, red emergency light, dark violet atmosphere.
- **Field Ops**: `Zimowy plac ekstrakcyjny pod ostrzałem(1).png` — militarised extraction yard, amber utility lights, watchtower.

The two alternative Dead Relay variants were rejected: redundant satellite dish / weaker compositional differentiation or non-9:16 framing.

## Production asset contract

`images/tactical_ops/battlefields/battlefield_{broken_signal,dead_relay,field_ops}_mobile.webp`, 900×1600 px, RGB WebP quality 84. Source files 941×1672 or 941×1671. Original source PNGs are retained in the downloadable release pack, not added to the runtime bundle.

Images are background-only, without baked grid, obstacles, unit silhouettes, UI or telegraphs. Scene identity is read from `MissionDef.battlefield` (display only). All six Field Ops reuse `field-ops`; all three Dead Relay missions reuse `dead-relay`; Broken Signal falls back to `broken-signal`. `regionId`, mission rules, objectives, spawns, backend snapshots, accepted-run versions and progression are unchanged.

## Integration and verification

The shared `BattleScreen` uses `missionBattlefield(mission).art` and the canonical overhead `fieldPercent()` for every tactical layer. The new `overheadProjection.css` handles image fit and grading without shifting hitboxes.

Run `node tools/verify_tactical_overhead_arenas.mjs` after the three image files are present, plus `node tools/verify_tactical_overhead_perspective.mjs`, `npm run build:tactical-ops`, P5 browser/mobile and VNext contract tests.

**Release gates:** dedicated CI pass, historical provenance CI reconciled without bypass, owner review of screenshot evidence, and physical-device QA on Android/iPhone. G0/S4 remains HOLD until live backend accepted-run and blind playtests. Do not merge or deploy without approval.

**Wide view:** The same portrait master is cropped (never distorted) in landscape; true wide master art is not provided. Verify the cropped visual on desktop/tablet before claiming wide-mode art completion.

## One-time binary import

The GitHub Actions importer fetches the exact user-approved source images with SHA-256 verification and generates WebPs. Remove the temporary importer workflow once all three binaries are committed; do not retain temporary media CDN URLs in the repository history as a production dependency.
