# Alpha Husky — Tactical Honors Art Kit V2

20 optimized WebP assets from the approved art pack: 8 badges + 2 frames, each at 512px and 1024px, with transparency.

- `512px/`: shown by the existing Tactical Honors gallery and Badge Wall art fallback; mobile-first.
- `1024px/`: high-resolution originals for future full-screen reveals and larger profile previews.
- `assets/tactical-honors/*.svg`: V1 vectors retained for graceful fallback and rollback.

Only image presentation has changed. Server-controlled entitlement, unlock, progression and currency logic are unchanged. Frame ownership remains backend-deferred.

To verify: `npm run build:tactical-ops` and `node tools/verify_tactical_loot_honors.mjs` plus existing result regressions. Do not deploy or merge automatically.
