# Relay Intercept — screened escape

The baseline standard-opening rush killed the courier in round 2 without damage. The patrol did little to force a choice. This milestone changes one encounter's opening and makes its existing marksman's TARGET LOCK a readable commitment.

Only server-issued Intercept `missionRevision:2` uses the screened formation: the same courier, Bulwark and marksman, with unchanged stats/skills, begin in different positions. The courier is closer to its escape lane, the Bulwark screens the north, and the marksman covers pursuit. A stationary marksman's TARGET LOCK follows the same marked ally. It never changes victims; a sidestep alone does not cancel it. Break range 2–4, close inside minimum range, use a real DISRUPTOR interrupt, protect, or accept the hit. Other attacks keep their existing tile locks. A blocked courier can move and strike the actual exit blocker using existing action rules.

| Real-engine strategy, same mid-power profile and CNC/SHADOW squad | Result | Consequence |
|---|---|---|
| Rally with HOWL, then pursue from standard approach | Win, round 3; 15 damage | Faster interception accepts tracking exposure |
| Mobile chase without the opening rally | Win, round 4; 0 damage | Slower movement/attack timing avoids that shot |
| Southern exit blockade with courier control | Win, round 5; 23 damage | Commits a defender and buys time; the southern chase policy loses |

Both standard-opening strategies also win with CNC/PET. A Sentinel ward in a separate real run reduces tracking damage from 15 to 8. Counter tests isolate an actual captured decision: the shot lands after a sidestep, misses when firing range is broken, and cancels after a legal DISRUPTOR status event. An ordinary slow does not receive an invented interrupt. These are bounded synthetic policies, not a proof of optimal strategy, human difficulty or replay enjoyment. Some mature builds may still solve the encounter easily.

The existing start response freezes and reveals the formation before combat: lock the squad, review the confirmed brief, then deploy. Reconnect uses that accepted revision. Revision 1, legacy 8×5 and pre-INTERCEPT report versions retain their original opening and behavior. Unknown Intercept revisions fail closed. Existing server contract fields, reward/report schemas, progression, economic amounts and companion loadouts are unchanged. Backend combat remains report validation, not move-by-move replay.

Release requires a private one-file revision-policy update using the existing contract; no data migration. The compatible rollback can issue revision 1 again while continuing to read accepted revision 2. Ship the compatible frontend before issuing revision 2 and refresh stale clients. No merge or deployment is included.

Verification covers 37 revised encounters, 12 legacy traces, five isolated counter cases, all 12 mission accept/resume paths, DEPTH 01/02 legacy snapshots, actual local HTTP accept → exact engine snapshot → save → reload/idempotency, and 15 mobile browser cases at 320/390/430px. Hosted CI also runs existing workflows and bundle parity. Physical Android/iPhone, latency on real devices and human replay testing remain **NOT VERIFIED**.
