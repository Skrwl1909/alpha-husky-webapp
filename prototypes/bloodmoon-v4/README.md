# Blood Moon V4 · Last Stand P0

An isolated, local-only boss fight. No production scripts, network APIs or assets are loaded. Uses browser Canvas, Pointer Events and native Node tooling; no install or build step.

From the repository root, with Node 22+:

```sh
node prototypes/bloodmoon-v4/serve.mjs
```

Open http://127.0.0.1:4173/ . Tap **Start encounter**. Drag anywhere in the arena as a floating thumbstick. Release to attack after 250 ms when inside the dotted range ring. All three hazards lock their aim during the warning. Sidestep LINE, leave CIRCLE, cross an edge of CONE. The Husk's recovery ring marks a safe opportunity to stop. Three hits or 75 seconds ends the run. Restart immediately or replay the finished run's recorded inputs. Export log includes the seed, tuning, input trace and actual events. Hidden tabs pause simulation; cancellation, blur and resize clear movement.

Tuning lives in `simulation.js`: 96 boss HP, 3 player HP, 230 units/sec movement, 480 ms autoattack cooldown. Boss warning is 1.10–1.18 s, impact 200 ms, recovery 650 ms. Reduced motion removes attack beams; telegraph geometry and timing remain intact.

## Focused verification

```sh
node prototypes/bloodmoon-v4/simulation.test.mjs
```

PASS: 5 tests covering movement bounds, no attacks during movement, stationary delay, range/cooldown, all three hitboxes including player radius, locked aim, impact timing, single damage per attack, safe positions, idle loss, timeout, reset and deterministic replay. The simulation driver wins in **54.48 s** with 3 HP, 96 genuine boss hits and identical replay events.

Browser verification uses a separate Chrome/Chromium process and native CDP touch events. Start the server above and launch Chrome with a disposable profile and debugging port, for example:

```sh
chrome --headless=new --remote-debugging-port=9224 --user-data-dir=/tmp/last-stand-chrome about:blank
node prototypes/bloodmoon-v4/browser.test.mjs
```

Set `CDP_URL` if using another debugging endpoint. Close that disposable browser after testing. Chrome must be accessible as `chrome` or launched with its installed absolute executable path. The harness connects to the first page in that dedicated instance.

PASS: native touch movement, viewport mapping, touchCancel, resize reset, actual LINE/CIRCLE/CONE damage and idle defeat, restart, touch-controlled victory in **58.52 s** with 3 HP, input trace reproduced by simulation, replay UI, complete browser replay, reopen reset and zero browser exceptions. Tested headless desktop Chrome with touch emulation at 390×844 and 360×740. Screenshots, the real touch victory input trace and browser results are in `evidence/`; rerunning browser tests overwrites that evidence. Screenshots show hazards, movement/attack state, changing HP, loss and victory. The browser driver reads snapshots to choose safe positions, then dispatches real touch input; it does not mutate gameplay state or damage.

## Files

- `index.html`: isolated entry, HP HUD, controls and outcome overlay.
- `last-stand.css`: responsive portrait layout.
- `last-stand.js`: rendering, fixed-step accumulator, UI and replay playback.
- `input.js`: floating thumbstick, scaled pointer capture and cancellation.
- `simulation.js`: tuning, geometry, deterministic encounter, event log and replay.
- `simulation.test.mjs`: focused simulation assertions and dodge/counter driver.
- `browser.test.mjs`: actual browser touch verification and evidence capture.
- `serve.mjs`: loopback-only static demo server.
- `README.md`: run instructions, verification and limitations.
- `evidence/*.png`: captured running prototype screenshots.
- `evidence/touch-victory.json`: real browser input recording and combat events.
- `evidence/browser-result.json`: browser verification result and device-test status.

## Limits

Physical Android/iPhone: **NOT TESTED**. Four-person comprehension, voluntary replay and subjective combat feel: **NOT TESTED**; human playtesting remains required. Schematic silhouettes, no audio, no production progression/rewards or backend integration. Replay is version 1 and intended for this prototype version. The 54–59 second results are automated drivers, not evidence of human encounter duration or enjoyment. No production runtime or routing changed. Production Blood Moon syntax checks pass; unrelated Tactical Ops suites were not run.
