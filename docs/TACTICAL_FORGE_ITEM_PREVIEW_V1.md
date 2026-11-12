# Tactical Ops — Forge Item Preview V1

Frontend-only presentation change in the confirmed Victory Results screen.

- **Authority:** Forge state response from `/webapp/forge/state`, via existing `window.Forge.nextUpgrade()` host bridge. No new backend calls.
- **Image:** use `item.icon` from that same Forge state. If absent, derive a sanitized Cloudinary `equip/<item-key>.png` URL only for single-segment, alphanumeric/underscore/hyphen keys.
- **Readability:** 42 px thumbnail with rarity border, existing hammer icon still present underneath and displayed on image error.
- **Integrity:** material costs, selected equipped item, star levels, deep-link destination, reward receipt ownership, and Forge write operations stay unchanged.
- **QA:** production Results Chromium fixture exercises valid/invalid icon, rarity, material-ready/missing, confirmed payout and Forge deep-link. The historical integrity verifier pins the six authored blobs.
- **Build:** `tactical-ops-src/version.ts` activates canonical PR bundle-sync to regenerate `js/tactical_ops.js` and `js/boot_loaders.js`.

Bundle sync verified at v3.6.59; final-head gate: require the generated bundle committed and a green CI run on the final head. This PR is independent of VPS Gear Impact V3.1 acceptance.
