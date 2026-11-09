# Relay Pressure V1 combat review

**Release HOLD.** This draft contains the encounter and battle presentation only. It is reachable from the engine and browser fixtures. The production War Table does not offer Relay Pressure.

## Engine evidence

Reproduce with `RELAY_PRESSURE_MATRIX=1 node tools/verify_tactical_depth01_combat.mjs`. The harness uses real combat actions and the VNext intent scheduler. It emits per-round positions, objective progress, ally actions and terminal results in `artifacts/relay-pressure/combat.json`.

Baseline on frontend main `b32f459` with two developed squads and two legal policies. Standard Relay Hold won 4/4, Advanced Relay Hold won 2/4 and Isolated Hold won 8/8 across both tiers. All 16 runs kept three allies alive. The existing Anchor and Crosslink regression also confirms static defense succeeds in Anchor and loses by deadline in Crosslink.

| Level | Threat | Objective-aware wins | Static wins | Eliminate-only wins | Activation count on objective-aware wins |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | Contest | 4/4 | 4/4 | 0/4 | 24–29 |
| 2 | Flank | 3/4 | 0/4 | 0/4 | 27–31 |
| 3 | Reposition | 3/4 | 0/4 | 0/4 | 29–31 |
| 4 | Contest | 2/4 | 2/4 | 0/4 | 24 |
| 5 | Flank | 2/4 | 0/4 | 0/4 | 30 |
| 6 | Reposition | 2/4 | 0/4 | 0/4 | 28 |

Each group crosses ALPHA/CNC/SHADOW and ALPHA/CNC/PET with different disciplines, team sidegrades and Rend or Reach Rend. Every level has a deadline defeat with all three allies standing. The harder layouts shorten the window, move hostile starting positions or bring the reserve earlier. Unit stats are identical between pressure tiers. The longest winning trace resolves entering round 7. The activations measure simulated combat, and the JSON includes engine execution time. The 5–9 minute player target still needs physical measurement.

- **Contest 1.** HOUND BULWARK and DISRUPTOR denied successive early checkpoints. The developed SHADOW lineup interrupted a threat and cleared the reserve to complete four consecutive checks.
- **Flank 5.** The same lineup set a second holder on the flank and screened the early reserve with CNC. Both points were clear in time to complete three checks. Static defense killed all four hostiles yet scored zero and lost with three allies alive.
- **Reposition 6.** One SHADOW attempt completed two checks, then failed to reach the longer east handoff and reset to north. A different legal loadout completed the route. The four-step route credits the final checkpoint before the deadline or the next round's status ticks.

## Settlement and release gate

The private GitHub `alphagame/main` at `45f14b0` predates Tactical Ops. Its Tactical review branches hold patch handoffs. The available backend snapshot has shape and bounds checks on the client-reported result and no independent replay or authoritative combat simulation. The draft adds no endpoint or result writer.

Finishing the slice requires the current deployed backend sources and a versioned server-side verifier against the frozen run snapshot. Only a verified terminal result should advance the highest cleared level. Keep duplicate settlement on the existing receipt path and gate new Trial starts independently of accepted runs. Connect the existing Brief and Results paths only after this contract can be tested with both backend and frontend.

## Physical QA after integration

Founder plus 2–3 testers. Use Android Telegram, iPhone Telegram and desktop browser where available.

1. Start with your usual squad. Play Contest, Flank and Reposition with the same loadout. Note which move or ability you changed and which warning led to that decision.
2. Leave the flank unoccupied or miss a route checkpoint. At defeat, record what the UI says caused it. Retry immediately and test the response suggested by the warning.
3. Win and advance. Replay a cleared level with a different available sidegrade or squad. Reload during an accepted run, then confirm the same loadout and level after resuming. Verify the clear on a second device.
4. Log actual play time for each attempt. After three consecutive fights, record whether each tester chooses Retry, Next Trial or Exit and ask why. Keep release on hold if the failure reads as arbitrary, the usual tactic solves all three threats, pacing misses the 5–9 minute target, or progress is lost or duplicated.
