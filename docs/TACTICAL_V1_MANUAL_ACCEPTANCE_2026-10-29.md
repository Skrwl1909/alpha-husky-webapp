# Tactical Ops V1 manual acceptance

**Public-release verdict: HOLD until these manual gates are recorded.** Automated engine/browser evidence does not establish physical-device or blind-playtest acceptance. Use owner-approved test accounts; retain only sanitized pass/fail notes and run/receipt correlation, never auth headers or player records.

- [ ] **Telegram Android:** S26 Ultra, real Mini App navigation, Atlas/Pack Mastery, readable objectives, touch targeting, confirmation/cancel, host Back, safe areas and background/reopen. Include standalone Android if it is part of this release.
- [ ] **iPhone:** Telegram WebView and Safari as applicable; the same navigation, touch, safe-area and background checks.
- [ ] **Real authentication:** correct canonical account after login/reopen; saved points/ranks agree. Reuse the already-confirmed authenticated STRIKE R1 purchase, and verify the active-run UI lock without another purchase, resetting ownership or activating Growth V2 globally.
- [ ] **Save/reconnect:** accepted run identity/build/grid survive reopen; complete a mission, lose/recover the connection, reload the canonical receipt and verify one progression/reward grant. Check an existing legacy 8x5 run and an accepted VNext 10x7 run where available.
- [ ] **Twelve missions:** human completion of each eligible mission below; objective is understandable, victory/defeat is correct, start/resume works, and continue/receipt/reload agree. Record locked/unavailable missions as unverified rather than bypassing their gates.
- [ ] **Blind playtest:** a player unfamiliar with the implementation can find/deploy a mission, explain its objective, finish/record it, find Atlas, understand ACTIVE RUN and no-effect restrictions, and resume after reopening without coaching. Record confusion, blockers and failed saves.

| Mission | Start/resume | Objective/result | Receipt/reload |
| --- | --- | --- | --- |
| broken-signal-breach | ☐ | ☐ | ☐ |
| broken-signal-recover | ☐ | ☐ | ☐ |
| broken-signal-commander | ☐ | ☐ | ☐ |
| dead-relay-courier | ☐ | ☐ | ☐ |
| dead-relay-hold | ☐ | ☐ | ☐ |
| dead-relay-guardian | ☐ | ☐ | ☐ |
| field-relay-recovery | ☐ | ☐ | ☐ |
| field-relay-hold | ☐ | ☐ | ☐ |
| field-squad-survival | ☐ | ☐ | ☐ |
| field-relay-intercept | ☐ | ☐ | ☐ |
| field-isolated-hold | ☐ | ☐ | ☐ |
| field-rearguard | ☐ | ☐ | ☐ |

GO requires these gates to pass, no unresolved save/progression blocker, and owner acceptance. A simulation win or hosted CI PASS cannot check these boxes.
