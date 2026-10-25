# Blood Moon V4 · local synthetic progression demo

## P4 combat presentation

P4 adds a metadata-anchored 76px Howler, cached cyan silhouette separation, movement/attack-ready cues, event-driven connection pulses, actual-damage numbers and hurt feedback. Amber warnings, imminent borders, crimson impacts and cyan recovery preserve the accepted collision geometry/timing. The DOM HP/clock/context rail replaces the tiny canvas HUD. Safe-area portrait layout and scroll locking cover active combat; developer controls remain outside it. Reduced motion suppresses sprite cycling, pulse expansion, flinch and number travel while retaining essential feedback.

Actual comparable captures: [P3 before](evidence/p4/before.png) / [P4 after](evidence/p4/after.png). Both show the fresh synthetic profile at 8.8s, CIRCLE warning, 30/50 player HP and 858.5/1000 boss HP. The before capture was made from clean P3 head `945ab6eb1a62a430e8c96e38d4b37a13ac838d26`; the after uses ordinary native Chrome touch play. Inputs differ slightly; these are comparable moments, not a fabricated identical frame. [Normal-speed gameplay](evidence/p4/gameplay.webm) is the unedited canvas-only Chrome recording (360×540, first approximately 12 game seconds). These three bounded visual artifacts total under 800KB; full traces and extra captures remain ignored.

Run with Node 22+: `node prototypes/bloodmoon-v4/serve.mjs`, then http://127.0.0.1:4173/. With `DEMO_URL` set to that server, retained checks: `node prototypes/bloodmoon-v4/p3/test.mjs`; P4 checks: `node prototypes/bloodmoon-v4/presentation-p4.test.mjs`. Together: **43 PASS, zero failures/skips**. They include the retained 336-encounter matrix/historical event digests plus full/reduced rendering interleaved every tick across P3 wins/defeats, with identical events, positions, input traces, HP, damage, timing and outcomes. Engine, input, P3 tuning, raid contract and historical trace files are unchanged from P3.

Chrome/CDP commands (isolated debugging browser; set `DEMO_URL` and `CDP_URL`):

```sh
node prototypes/bloodmoon-v4/browser.test.mjs
node prototypes/bloodmoon-v4/p2/browser-p2.test.mjs
node prototypes/bloodmoon-v4/p3/browser-p3.test.mjs
node prototypes/bloodmoon-v4/browser-p4.test.mjs
node prototypes/bloodmoon-v4/browser-p4.test.mjs --layout-only
```

P4 defaults to CDP port 9227; older suites default to their documented ports. P4 captures warning/imminent/impact for LINE/CIRCLE/CONE, recovery/escalation, player/boss hits and a full reduced-motion replay. The layout check drives actual movement/cancel at 320×568, 360×740, 390×844 and 412×915, verifies no attacks while moving or page scrolling, and checks 320px defeat/restart. Existing suites cover asset fallback/essential failure, portrait sizing, cancellation, victory/restart and frozen-parameter replay. Extra results go to ignored `p3/evidence-local/p4/`; no simulation state is overridden to obtain evidence.

**VERIFIED:** desktop Chrome native-touch emulation, four portrait widths, all hazard/effect stages, reduced motion, exact gameplay/replay parity and no required asset failures/runtime exceptions in the completed browser suites. **NOT VERIFIED:** physical Android/iPhone, device safe-area behavior, sustained mobile performance/thermal load, screen-reader usability or broader human preference for the visual pass. **BLOCKED:** no local presentation blocker; production integration still requires the previously documented private policies/transactions. No production writes, private source publication, merge or production deployment.

Physical-device acceptance before rollout:

- Android Chrome and iPhone Safari: drag/release/cancel reliably with one thumb; no page pan, stuck movement or accidental browser gestures.
- Check notch/home-indicator clearances, HP/clock readability and reachable controls in portrait.
- Dodge LINE/CIRCLE/CONE; confirm the cyan ring, rather than the larger art, predicts collisions.
- Check normal/reduced effects, readable damage/recovery and stable play without distracting flashing or frame drops.
- Complete victory/defeat, restart and input replay; confirm matching outcome/HP. Record device/browser details and any heat or responsiveness issues.

---

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
