# Alpha Husky — Map Exploration Smoke Test

Date: 2026-08-03
Branch: `test/map-exploration-smoke-2026-08-03`

## Goal
Complete one real Path of Proof run from `LOCKED` or `ELIGIBLE` to `UNLOCKED` without expanding the feature scope.

## Test account requirements
- Fresh or resettable account state
- At least one owned pet available as scout
- Required `map_key_fragment` balance for Relay Fringe 01
- Access to the current backend endpoints:
  - `POST /webapp/world-exploration/state`
  - `POST /webapp/world-exploration/path/action`

## Canonical run
1. Open Map.
2. Confirm the 3200 × 1800 world canvas loads.
3. Pan and zoom; verify no accidental node activation while dragging.
4. Open `relay_fringe_01`.
5. Confirm phase is `LOCKED` or `ELIGIBLE` and requirements are readable.
6. Begin Path of Proof.
7. Select an owned pet as scout.
8. Choose a signal trace.
9. Enter tactical contact.
10. Complete all tactical rounds using Strike / Guard / Exploit.
11. Select an anchor protocol.
12. Confirm final phase is `UNLOCKED`.
13. Close and reopen the map.
14. Confirm the unlocked route, scout, trace, encounter result and anchor protocol persist.
15. Confirm Dead Relay access changes only after the route is anchored.

## Mobile checks
- Touch pan does not trigger sectors accidentally.
- Pinch/zoom controls remain responsive.
- Panel fits within the viewport and respects safe areas.
- Radio cards and tactical buttons are easy to tap.
- Closing/reopening Telegram does not reset the canonical phase.

## Desktop checks
- Mouse drag, wheel zoom and node selection work.
- Escape closes only the sector panel first.
- Repeated open/close does not duplicate overlays or event listeners.
- Refresh during each phase preserves server state.

## Blocker policy
Fix only defects that prevent the canonical run or corrupt/persist the wrong state. Do not add new sectors, rewards, animations or World Canvas V1.1 visual expansion during this smoke pass.

## Evidence to capture
- Screen recording of the full run
- Console error screenshot, if any
- Failing phase and exact action
- Endpoint response code/message
- Account state: fragment count, selected pet and starting phase

## Result
- [ ] Desktop PASS
- [ ] Telegram mobile PASS
- [ ] Persistence PASS
- [ ] No state/reward duplication
- [ ] Ready for campaign gameplay clip
