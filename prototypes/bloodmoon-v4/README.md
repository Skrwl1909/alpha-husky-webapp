# Blood Moon V4 · Last Stand P0

An isolated, local-only boss fight. No production scripts, network APIs or assets are loaded. Uses browser Canvas, Pointer Events and native Node tooling; no install or build step.

From the repository root, with Node 22+:

```sh
node prototypes/bloodmoon-v4/serve.mjs
```

Open http://127.0.0.1:4173/ . Tap **Start encounter**. Drag anywhere in the arena as a floating thumbstick. Release to attack after 250 ms when inside the dotted range ring. All three hazards lock their aim during the warning. Sidestep LINE, leave CIRCLE, cross an edge of CONE. The Husk's recovery ring marks a safe opportunity to stop. Three hits or 75 seconds ends the run. Restart immediately or replay the finished run's recorded inputs. Export log includes the seed, tuning, input trace and actual events. Hidden tabs pause simulation; cancellation, blur and resize clear movement.

Tuning lives in `simulation.js`: 96 boss HP, 3 player HP, 230 units/sec movement, 480 ms autoattack cooldown. Boss warning stays 1.10–1.18 s and impact stays 200 ms throughout. Recovery is 650 ms before 30 s, 550 ms at 30–50 s, and 480 ms at 50–75 s. Thresholds do not shorten an already active phase. After 30 s, seeded shuffled groups contain each existing hazard once, with no consecutive repeats or identical consecutive groups. Attack-order randomness is separate from warning-duration randomness. A nonblocking two-second notice announces each escalation. Reduced motion removes attack beams; geometry and warnings remain intact.

## Focused verification

```sh
node prototypes/bloodmoon-v4/simulation.test.mjs
```

PASS: 10 tests covering movement bounds, no attacks during movement, stationary delay, range/cooldown, all three hitboxes including player radius, locked aim, impact timing, single damage per attack, safe positions, idle loss, timeout, reset and deterministic replay. Escalation tests check exact 30/50 s thresholds, no active-phase truncation, all recovery durations, unchanged warning durations, attack variety and one real counterattack from a fresh stop during every tier's recovery. The immediate-response driver wins in **56.18 s** with 3 HP and 96 genuine boss hits.

The balance driver waits 250 ms before reacting and uses a wider 34-unit collision margin. Across seeds 1909, 1, 42 and 2026 it wins in **58.27–59.93 s** without damage. With two deliberate early hits it wins in **57.78–58.60 s**, retaining 1 HP. Each run survives both escalations and its JSON-serialized recording replays identically. Compared with the same no-mistake driver without escalation, the worst slowdown is **1.27 s**. These are controlled drivers with correct safe-point selection, not human performance measurements.

Browser verification uses a separate Chrome/Chromium process and native CDP touch events. Start the server above and launch Chrome with a disposable profile and debugging port, for example:

```sh
chrome --headless=new --remote-debugging-port=9224 --user-data-dir=/tmp/last-stand-chrome about:blank
node prototypes/bloodmoon-v4/browser.test.mjs
```

Set `CDP_URL` if using another debugging endpoint. Close that disposable browser after testing. Chrome must be accessible as `chrome` or launched with its installed absolute executable path. The harness connects to the first page in that dedicated instance.

PASS: native touch movement, viewport mapping, touchCancel, resize reset, actual LINE/CIRCLE/CONE damage and idle defeat, restart, touch-controlled victory, replay UI, complete browser replay, reopen reset and zero browser exceptions. Both notices appeared then expired; escalation events and recovery durations matched. The browser driver won in **60.23 s** with 3 HP, waiting 250 ms before reacting and using the wider 34-unit margin. Actual results are saved in `evidence/browser-result.json`. Test viewports are 390×844 and 360×740. Screenshots and the real touch victory input trace are in `evidence/`; rerunning browser tests overwrites that evidence. The harness reads snapshots and dispatches native touch input; it does not mutate gameplay state or damage.

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

Reported human Chrome playtest of the previous build confirmed movement, dodging, automatic attacks, HP and defeat: attempt 1 lost at 16 s with 78/96 boss HP; attempt 2 lost at 70 s with 13/96 boss HP. Repetition motivated this escalation pass. Those results do not validate the updated balance. At 70 s, 13 remaining HP already exceeds the hits available in the last five seconds even before dodging; escalation may further punish missed counterattacks. Another human playtest must assess the late-fight pressure and practical win rate.

Physical Android/iPhone and human playtesting of this escalation build: **NOT TESTED**. Four-person comprehension and voluntary replay thresholds remain unverified. Schematic silhouettes, no audio, no production progression/rewards or backend integration. New recordings use version 2; version 1 recordings retain their original pacing and rotation. No production runtime or routing changed; unrelated Tactical Ops suites were not run. Existing player level, equipment, combat stats and enemy HP integration is mandatory before production rollout and remains out of scope here. Keep PR #179 Draft for another human playtest; no merge or deployment.
