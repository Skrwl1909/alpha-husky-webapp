# Relay Sentinel — one cosmetic badge

The existing Badge Wall can show Relay Sentinel as locked, owned and featured. Its ownership comes only from validated, persisted `tacticalOpsProgression.fieldOps.masteryPath.firstLockdownClear` through the existing progression-badge sync and per-user transaction. Opening or refreshing `/webapp/badges/state` performs that sync, so a prior recorded clear qualifies without another win. Client victory text, reports supplied to the badge endpoint, aggregate clears and claim fields cannot grant it.

Catalog key: `relay_sentinel`. The existing progression award helper stores `RELAY_SENTINEL`; the catalog alias resolves it to the canonical key. Category/group: Tactical; rare cosmetic; no title, frame, aura, stat, currency or mission change. Existing featured save/sanitization is reused. No separate badge equip action is added: this UI exposes Featured, and preserves the existing displayed-badge read state.

The catalog supplies the owner's exact production URLs:

- Grid, 256×256: https://res.cloudinary.com/dnjwvxinh/image/upload/v1793442397/badges/relay_sentinel_badge_256.webp
- Detail, 512×512: https://res.cloudinary.com/dnjwvxinh/image/upload/v1793442397/badges/relay_sentinel_badge.webp

Read-only GET checks returned HTTP 200, `image/webp`, WEBP/RGBA with alpha 0–255 at both expected sizes. Delivery paths match `badges/relay_sentinel_badge_256` and `badges/relay_sentinel_badge`. No Cloudinary connector tools were exposed in this session; verification used only these two supplied delivery URLs. No library listing, asset generation, upload, rename, overwrite or deletion. No art binary is added to Git. Metadata and hashes are in `docs/evidence/prestige01/assets.json`.

The generic renderer uses `iconUrl` for grid art and a distinct `emblemUrl` in the current detail panel. Same-image legacy details keep their prior layout. The Badge Wall loader adds a scoped cache key, `prestige=relay-sentinel-v1`; Tactical runtime/cache and bundles are unchanged. Tactical Results does not announce an unconfirmed badge grant.

Focused verification:

- Private backend: three tests covering malformed/missing proof, first/prior proof, idempotency, six concurrent calls, atomic save/reload, featured sanitization, real Telegram/Android canonical account/session resolution, and preservation of v4/v5 accepted contexts and first-clear proof. Only Telegram signature verification is stubbed; temporary synthetic stores are used. The affected dashboard functions are compiled directly from source without booting unrelated routes.
- Existing badge progress and progression-repair verifiers pass. Economy fields and title ownership remain unchanged. Both Tactical backend source hashes match the DEPTH 02 candidates.
- Frontend: `node tools/verify_tactical_prestige01.mjs` covers locked/owned/featured/refresh and legacy detail layout at 390×844 and 320×740, with a populated synthetic wall and real decoding of only the two supplied production images. Public fixtures contain only the Relay Sentinel row from the synthetic real-handler test. Browser screenshots are CI artifacts, not product assets. Local execution used Chromium-based Edge via `CHROMIUM_EXECUTABLE` and the existing Playwright installation via `PLAYWRIGHT_MODULE`.
- `node --check js/badges.js` and loader verification cover the shipped script. It has no separate build artifact; no combat bundle rebuild is needed.

Prepared against current `main` at `5b4f1cf782551282db03dd5856f55a4433a5bd04` (DEPTH 02 merged). GO for isolated Draft review. HOLD for release: owner-approved DEPTH 02 paired production release and human/physical-device acceptance have not been confirmed in this chat. No production badge grants, publishing, merge or deployment were performed. Private candidates, backups, SHA-256, rollout and safe rollback instructions remain outside this public repository.
