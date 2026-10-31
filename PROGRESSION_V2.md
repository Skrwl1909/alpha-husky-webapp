# Veteran Foundation

| Track | Prerequisite and eligible event | Cap / diversity | Fastest path | Playable unlock |
|---|---|---|---|---|
| Commander | Rank 3 at acceptance; new Advanced Field Op accepted and won in its current rotation | 1 credit per rotation; 4 missions, 3 objective families | 12 eligible sessions on 12 rotations; at least 11 daily boundaries | Rank 4: optional Pack Extraction |
| Pack Mastery | Foundation 8/8 at acceptance; companion in accepted Advanced squad, all three allies standing | 1 credit per companion per rotation; 2 missions across its 2 role families | 12 eligible sessions per companion | One optional role capability, preserving A/B |

At 2–4 eligible sessions/week, 12 sessions is approximately 3–6 weeks. Two appropriate Advanced wins per session can cover CNC/PET (RECOVER + INTERCEPT) and SHADOW (HOLD + SURVIVE). No consecutive-day requirement. Diversity may require additional sessions if a player repeats only one objective. This is an earning-path estimate, not measured retention or real-player pacing.

Pack Extraction uses existing Recovery, Signal Interference and Hound reinforcement mechanics. Recover on an even round by round 6 with all three living allies within two cells of the terminal. It trades a fast solo recovery for squad movement and timing; enemy HP is unchanged. Practice grants zero currency, Commander or Mastery progress and does not change Relay Lockdown evidence.

- CNC Static Field: PRESSURE controls a radius-1 cluster, loses damage and one range, cooldown +1. A/B timing still applies.
- SHADOW Focused Ward: PACK SUPPORT grants three-turn GUARD, loses healing and one radius, cooldown +1. Existing A/B healing or disruption protection still matters when the option is disabled; SILENT SHELTER retains disruption immunity when enabled.
- PET Extraction Scout: RECOVER reach 2 → 3, HAMSTRING cooldown +1. Existing A/B mobility or snare reach remains selected.

New progress and toggles are server-owned. New accepted snapshots require `masteryVersion:2`; optional extraction uses report v6. Old accepted v1–v5 runs retain their snapshots and settlement rules, without invented Veteran credit. Prior 0–8 progress, A/B, Rank 1–3 points, first Lockdown clear and Relay Sentinel ownership are preserved. Older backends show the existing foundation UI.

Combat still executes on the client. The backend validates accepted-run identity, report consistency, revisions and award caps; it does not replay every move or verify skill-use telemetry. Role credit is qualified objective participation, not proof of individual skill use.

Focused verification: version/capability wire checks; real-engine normal/extraction comparison on both grids with two squads; action-effect comparisons for all three companions with two squads each; synthetic backend migration, caps, unlock, toggle, reload, idempotency, stale/wrong-run and loopback HTTP; mobile 390×844 and 320×740. Private backend source and deployment handoff are delivered separately. Physical Android/iPhone and real-player pacing: **NOT VERIFIED**.
