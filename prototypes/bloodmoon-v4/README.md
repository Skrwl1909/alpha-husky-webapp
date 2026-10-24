# Blood Moon V4 · Last Stand P1

Isolated real-time encounter using the original Alpha Husky Blood Moon artwork. Built on the accepted P0; no production V3 scripts, routes, combat APIs, rewards or account state are loaded. No install/build step or additional dependencies. Keep the P0 and P1 PRs unmerged until human review.

## Run from the repository checkout

Node 22+:

```sh
node prototypes/bloodmoon-v4/serve.mjs
```

Open http://127.0.0.1:4173/ . If that port is busy, set `PORT=4174` and open http://127.0.0.1:4174/ instead. The original files listed in `assets.js` must be present in the checkout; copying only the prototype folder is insufficient. The local server serves the prototype and an allowlist of those ten assets, never production APIs.

Drag anywhere in the arena as a floating thumbstick. Release to strike after 250 ms inside the dotted range ring. The cyan disk at the Howler's feet is the exact collision hitbox; the sprite extends above it. LINE: sidestep. CIRCLE: leave the ring. CONE: cross an edge. Aim locks during the warning. Stop in a safe position to counterattack. Three hits or 75 seconds ends the standard encounter. Restart or replay recorded inputs immediately.

Standard mechanics are unchanged: 96 boss HP, 3 player HP, 230 units/sec movement, 480 ms attack cooldown, 1.10–1.18 s warning, 200 ms impact. Recovery progresses 650 → 550 → 480 ms at 30/50 seconds without cutting active phases short. Seeded mixed attack order starts after 30 seconds. Reduced motion stops walk animation and removes beams/VFX, retaining all warning geometry.

## Original art and parameter interface

V4 references the V2 arena/atmosphere/full moon, all four V3 Tower Husk states, existing slash/impact VFX and the existing directional Howler sprite sheet. Background layers are cached once; the original character anchors and fixed virtual arena coordinates keep art separate from collision. No asset file was edited or generated. Optional state failures fall back to the original idle; missing arena, idle or player art blocks play with a reload message.

Expand **Local test controls & combat log** for two strength fixtures. Standard damage is 1; Stronger damage is 1.2. Both use the same 96 boss HP and 3 player HP. These are **local fixtures, not real account data**. Selection is locked during a run; recordings carry the resolved combat parameters. `combat-parameters.js` validates and freezes resolved HP/damage inputs; it implements no level/equipment damage formula. See `COMBAT_CONTRACT.md` for the verified V3 frontend field contract and what remains blocked before real-account adaptation.

## Tests and evidence

```sh
node prototypes/bloodmoon-v4/simulation.test.mjs
node prototypes/bloodmoon-v4/presentation.test.mjs
```

P0 suite: **10/10 PASS**, including movement/autofire, hitboxes, damage timing, escalation, safe positions, survival, victory timing and deterministic replay. The original immediate driver still wins in 56.18 s. New presentation/parameter suite: **5/5 PASS**, covering original file paths, loading/fallback/timeout behavior, state/directional frames, parameter validation/immutability/incoming damage, and progression against fixed boss HP using the same real input trace. Final paired results: **Standard 60.30 s / 96 hits; Stronger 50.20 s / 80 hits**, both with 96 boss HP and identical input traces.

Browser verification requires the demo server and a dedicated Chrome/Chromium instance with `--headless=new --remote-debugging-port=9224 --user-data-dir=<disposable-profile>`:

```sh
node prototypes/bloodmoon-v4/browser.test.mjs
```

Set `CDP_URL` for another debug endpoint and `DEMO_URL` for another demo port. Example PowerShell override: `$env:DEMO_URL='http://127.0.0.1:4174/'`. The harness issues native touch input, reads snapshots, checks original asset decoding, portrait layout at 320×568 / 390×844 / 360×740, all Husk states, actual hazard damage, victory/loss/restart, escalation, full deterministic browser replay, local profile selection and intentionally failed optional/essential assets. It records a short real-time Canvas gameplay WebM (including actual HP counters), verifies Chrome can decode it, and rejects normal broken paths or external/API requests. Rerunning overwrites evidence.

Final browser run: **PASS**, victory in **60.30 s** with 3 HP; full replay identical, all ten assets decoded, all four Husk states observed, lower boundary reached with native touch and the Howler above the HUD, intentional fallback cases passed, zero external/API requests and zero runtime exceptions. The short WebM decoded in Chrome at 360×540. `evidence/browser-result.json` records these results; `evidence/touch-victory.json` contains the real seed, resolved parameters, input trace and combat events. `evidence/gameplay.webm` is the gameplay recording. Screenshots show live hazards, escalation, idle defeat, victory, ready state, lower boundary and intentional optional-art fallback.

## Verification boundaries

**VERIFIED:** original asset paths/state references; local mechanics and deterministic parameterized replay; local fixture progression at fixed 96 HP; Chrome touch emulation, mobile viewport layouts, asset fallback and real browser evidence. Standard P0 human feedback supplied by the owner: victory at 67.5 s with 2/3 HP, boss 0/96 HP; the new art presentation has not yet had human review.

**NOT VERIFIED:** physical Android/iPhone, Safari, broader comprehension/voluntary replay, subjective readability of the new art on real phones, sustained low-end device performance, production runtime integration, unrelated Tactical Ops suites.

**BLOCKED for future integration:** authoritative backend Blood Moon damage/stat/equipment formula and representative account combat payloads are not established by the inspected frontend. No production adapter or guessed formula is implemented. Player level/equipment/combat stats and authoritative enemy HP integration remain required before production rollout. This does not block local P1 review.

No merge, deployment, new bosses, rewards, economy, auth/wallet, attempts or cooldown-system changes. Version-1/2 recordings retain original tuning; version 3 includes the resolved parameter snapshot.
