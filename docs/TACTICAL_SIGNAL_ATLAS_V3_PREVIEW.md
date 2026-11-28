# Signal Atlas V3 — integration candidate (not a production approval)

Presentation-only continuation of Unit Motion V1. Imported exact runtime files from the prepared COMPLETE pack, with both original SHA-256 manifests. Source masters are not shipped. The live skill model, server commands, costs, ranks, skill IDs, action definitions, growth and combat are unchanged.

## Live artwork

- Relay chamber and sector bay backgrounds, combat-core bezel, existing portrait and action icon fallbacks.
- Plates for the six existing live sector types, active-skill frame, state overlays, inspector, contacts and noninteractive reserved slots.
- Distinct Heavy/Wide Lunge, Blood Scent and Pack Link icons on existing confirmed feature paths.
- Reserved/terminal graphics remain noninteractive. Capstones, passive/capstone frames and other expansion art are staged only; no fabricated endpoint, skill, unlock or purchase.

## Review boundaries

- E01 supplied runtime background is 941×1672; it is not the originally requested 1440×2560 master. E02 is a candidate selection. Both await visual sign-off on a real device.
- Current V1 portrait, path emblems and action icons remain. This is NOT a new specialization/entitlement system.
- Existing War Table visuals and future-only profile frames remain unchanged.
- Browser evidence is synthetic, with real source and production IIFE. It is not production gameplay or device acceptance.
- Check asset and state mapping with `node tools/verify_tactical_signal_atlas_v3_assets.mjs`; existing Atlas browser verifier includes V3 paint and variant checks. Physical Telegram WebView review required before production merge.

## Reconciled release review — 2026-11-28

Base: merged PR #334 (`f6519321ff0b37c53dc0656ab44f405cc8f4953c`), including the lockfile-immutable Player Voice CI fix. The release gate pins this merged tree, exact Atlas presentation and the new dedicated verification workflow; all earlier gates execute on their original reviewed trees. The original runtime art and candidate mechanics stay byte-identical.

Dedicated CI runs the two original asset manifests, truthful state/variant mappings, prior Atlas contracts, historical provenance and negative checks, deterministic production bundle with unchanged lockfile, official 320/360/390/430px route (plus desktop/art fallbacks), and Blood Scent/Pack Link receipt and variant states. Review screenshots and JSON results are uploaded by the workflow.
