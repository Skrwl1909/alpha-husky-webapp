# Alpha Husky P0-B RUN 1 — pure-engine execution

No backend calls. Synthetic pet fixture and profile; not proof of live account behavior.
No balance modifications, no actual user playtest. Actor policies are simplistic deterministic bots and are NOT a skilled player.

## Checks
- PASS — T01 Courier baseline executed
- PASS — T02 synthetic PET run executed
- PASS — T04 bodyblock real+diagnostic executed
- PASS — T06 HAMSTRING pair executed
- PASS — T07 CNC sidegrade pair executed
- PASS — T09 Hold intel rule trigger round 3
- PASS — T10 Hold without intel trigger round 2
- PASS — all runs replay deterministically

## Scenario results
| ID | Outcome | Rounds | Courier personal turns | Actions | Slow ticks | Reinforcement spawned | Cap |
|---|---|---:|---:|---:|---:|---|---|
| T01 | victory | 3 | 2 | 10 | 0 | no | false |
| T02 | victory | 2 | 2 | 10 | 0 | no | false |
| T04a | victory | 3 | 3 | 13 | 0 | no | false |
| T04b | victory | 6 | 5 | 25 | 0 | no | false |
| T06a | victory | 2 | 2 | 10 | 0 | no | false |
| T06b | victory | 2 | 2 | 10 | 0 | no | false |
| T07a | victory | 3 | 2 | 10 | 0 | no | false |
| T07b | victory | 3 | 2 | 10 | 0 | no | false |
| T09 | defeat | 13 | 0 | 62 | 0 | 3 | false |
| T10 | defeat | 11 | 0 | 55 | 0 | 2 | false |

## Fixture notes
- T04b teleports Alpha to exit ONLY to isolate blocking logic. It is not a legal deployment.
- T06b removes PET HAMSTRING from the test fixture. It is not an in-game build.
- T09/T10 use local campaignContext true/false, not earned server intel.
- T07 compares kodaSidegrade A/B independently of unlock eligibility.
- PET uses synthetic ID/image; role stats are read from actual tacticalPetDef.
- Raw actor-by-actor traces: results.json.

## Release gate
The above scenarios are diagnostic; victory does not imply balance or fun. Validated server persistence, first-clear, real playtest and live iOS are still BLOCKED.