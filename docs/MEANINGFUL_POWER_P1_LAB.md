# Meaningful Power P1 — Commander lab
Status: experimental, offline only. No production modules, workers, contract versions, rewards or mission definitions changed.

Run the fixture generator from an audited local backend checkout at the merged P0 commit, with the existing static item catalog and Python dependencies. No player data is required. It uses the real canonical stats, existing V3 projection and the real Forge planner with synthetic funding, never the purchase/ledger path. The mid/veteran allocations are authored test cases, not sampled users.

Use the existing VNext source-engine simulator to compare 7 builds x 3 input mappings x 2 scripted policies on Signal Commander. V3 is the current baseline. Raw canonical stress is a deliberately naive transplant; fixed-scale is a provisional reference conversion. Neither is V4: legacy damage/initiative and no Shared Combat RNG/crit/dodge/penetration. All maps share fixed authored enemy and squad data; no adaptive enemy scaling. Gear carry is applied only by the legacy V3 baseline. Candidate initiative is held constant to isolate HP/ATK/DEF.

Evidence: terminal outcome, activations, squad damage, survivors, direct damage by actor (direct skill HP loss only), skill counts, telegraphs/counters, per-row comparison to same-build same-policy V3. No random-seed confidence intervals or human fun claims. No proof of worker parity.

Design gate after observing data: fresh must remain viable; first upgrade must have a measurable effect (if rounding masks it, report it); progressed builds should gain tangible advantage at fixed difficulty; no veteran automatic one-unit dominance; support/control must have a practical purpose. If results fail, revise experiment; do not ship. Next: bind full shared combat formulas, companion/initiative mapping, pinned RNG, and immutable server authority in an independently reviewed worker.
