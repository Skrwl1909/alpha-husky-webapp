# Blood Moon V4 · local synthetic progression demo

**P3 Last Stand:** start with Fresh, Baseline or Progressed in the scenario selector. The default Fresh encounter now has a survival ward and encounter support damage; all three face the same 1000 HP. See [P3 results, tests and private integration handoff](p3/README.md). Original P1/P2 scenarios remain available for regression/comparison.

An isolated playable encounter with original Alpha Husky artwork. This public version contains only synthetic resolved combat fixtures, prototype mechanics and local validation tests. No private backend implementation or real account data is required or included. See [public/demo versus developer-only tests](p2/README.md).

With Node 22+ and the original repository assets checked out:

```sh
node prototypes/bloodmoon-v4/serve.mjs
```

Open http://127.0.0.1:4173/ . Use `PORT` for another local port. Drag to move; release to counterattack. The cyan feet ring is the exact player hitbox. Dodge LINE, CIRCLE and CONE warnings. The accepted warnings, collision geometry, movement, autoattack and timed escalation are unchanged.

Baseline uses 170 HP / 10.5 damage per hit; Progressed uses 278 HP / 16.875 damage per hit. Both face the same 1000 HP and 60-damage hazard. These proposed demo values are unchanged, not a published stat/equipment formula or live-account integration. The original P1 Standard/Stronger fixtures remain selectable. Restart and deterministic replay remain available.

Run the clean-checkout commands in `p2/README.md`. Public tests use synthetic fixtures; optional private-source tests require an owner-provisioned, ignored adapter and explicitly report unavailable when absent. Screenshots, recordings and logs are regenerated locally under ignored output paths rather than duplicated in the public P2 tree.

Original art is referenced in place: Blood Moon arena, atmosphere, full moon, four Tower Husk states, existing hit VFX and the directional Howler sheet. Essential art failures block play; optional state failures fall back to the existing idle. The server denies private files and unrelated source paths.

The memory-only validation utility does not authenticate accounts, consume attempts, update shared raid HP or grant contribution/rewards. Replay is not evidence of human input. Physical mobile testing and broad human balance remain pending. A 50-HP character is killed by one unchanged 60-damage hazard; this risk is reported rather than silently retuned.

No production V3/Tactical Ops, auth/wallet, economy, routing or Android configuration changes. No merge or deployment is implied by this local prototype.
