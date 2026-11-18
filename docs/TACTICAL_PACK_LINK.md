# PACK LINK

The first HOWL in a battle with at least one living teammate adjacent to Alpha grants every such teammate 25% GUARD until their next turn starts. Diagonal neighbours count. Alpha receives the existing HOWL effects. Existing stronger GUARD and longer duration are preserved. HOWL with no adjacent teammate preserves the charge. The charge survives save/resume and Last Howl wave transitions.

Pack Echo I is required in either discipline. Purchase costs one existing skill point through the revisioned growth API. Ownership is the optional V2 packLink field. Purchase receipts, active-run locks and one-time respec apply. Other skills and modifiers retain their rank keys.

Defensive formation was selected over a damage bonus. Closing formation can save an exposed teammate but spends movement and can place Alpha inside overlapping enemy threats. Vanguard's existing 20% GUARD improves to 25% for adjacent teammates. Howlkeeper retains its larger ordinary buff radius while PACK LINK requires adjacency.

Capability and snapshots are limited to server-command Field Relay Recovery and Last Howl. The private candidate advertises packLinkCostV1 only under TACTICAL_PACK_LINK_V1=1. Only new authoritative runs freeze the field. Accepted runs select new digest-pinned workers. Historical workers and snapshots retain their original interpretation. The frontend exposes FUTURE without server capability.

Run node tools/build_tactical_m2_workers.mjs artifacts/pack-link-workers pack_link_v1, copy the preserved Blood Scent workers into that directory, then run node tools/verify_tactical_pack_link.mjs. The production integration workflow builds the historical workers from merged source and retains their regression tests. Mobile Inspector and battle evidence is uploaded as artifacts/pack-link.

The private handoff contains exact hashes, source and destination paths, the patch, tests and rollback. Owner VPS source verification, deployment-environment staging and physical-device testing remain release gates.
