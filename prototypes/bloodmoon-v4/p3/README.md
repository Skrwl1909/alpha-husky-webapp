# P3 Last Stand — playable balance pass

Node 22+, original repository assets, no new dependencies:

```sh
node prototypes/bloodmoon-v4/serve.mjs
```

Open http://127.0.0.1:4173/. Fresh is selected by default; choose Baseline or Progressed under local scenarios. Drag to dodge, release within range to counterattack. Restart and Replay inputs remain available. All profiles are synthetic fixtures, not real account data. Original P1 and P2 profiles remain selectable and unchanged.

## What changed and why

The prior fresh fixture had 50 HP against a 60-damage hazard and insufficient offense to beat 1000 HP before 75s. Progressed finished too early to sustain the encounter. P3 applies an explicit, proposed **encounter policy after resolved stats**, not a replacement account/stat/equipment formula:

- Effective damage per hit: `min(13, 8 + 0.28 * resolvedDamage)`, quantized to nine decimal places. Encounter support makes fresh offense viable; the ceiling limits trivial high-offense clears.
- Incoming hazard: `min(resolvedHazard, 0.4 * resolvedMaxHP)`. Fresh can survive two mistakes. Player max HP and enemy max HP are unchanged.
- Raw resolved snapshots are preserved separately. Never apply this policy twice.

| Synthetic profile | Resolved HP / damage | P3 damage / incoming | Boss HP |
| --- | --- | --- | --- |
| Fresh | 50 / 5.125 | 9.435 / 20 | 1000 |
| Baseline | 170 / 10.5 | 10.94 / 60 | 1000 |
| Progressed | 278 / 16.875 | 12.725 / 60 | 1000 |

The same accepted LINE/CIRCLE/CONE geometry, 1.1–1.18s warnings, one-thumb input, stationary-only attacks, recovery/escalation and original art remain intact. Short action prompts reinforce each warning without changing collision shapes. This is a tuning pass, not a new combat engine.

## Reproducible evidence

Run the local server above. In a second terminal set `DEMO_URL=http://127.0.0.1:4173/` using your shell's environment syntax, then:

```sh
node prototypes/bloodmoon-v4/p3/test.mjs
```

37 checks cover retained P0/P1/P2 behavior plus P3 balance and the raid preview contract. With `DEMO_URL`, no checks skip. Without it, the two serving-boundary tests explicitly skip. Node uses one process so restricted Windows environments need no test-worker spawning.

`balance-summary.json` contains compact before/after evidence. The matrix uses 16 listed seeds, three profiles and seven policies: before, after, imperfect, repeated mistakes, idle, always-moving and a low-hazard timeout control. All 336 encounters are serialized/replayed with exact events, positions, HP, ticks and outcomes compared. No human win-rate claim follows from a deterministic target-selecting driver.

| Profile | Before: 250ms reaction | P3: same policy | P3: 450ms + two misses | Native Chrome touch |
| --- | --- | --- | --- | --- |
| Fresh | Timeout at 75s; 369.625–385 boss HP left | Win 64.22–66.23s | Win 65.48–66.43s; 10 HP left | Win 65.72s; 10 HP left |
| Baseline | Win 58.22–60.05s | Win 55.80–57.80s | Win 56.82–58.17s; 50 HP left | Win 57.08s; 170 HP left |
| Progressed | Win 35.65–37.82s | Win 47.47–49.70s | Win 48.98–49.92s; 158 HP left | Win 49.72s; 278 HP left |

All 48 P3 idle runs and all 48 repeated-error runs lose. Each profile has 16 wins under each of the two bounded winning policies. P3 native fresh used the imperfect policy; native baseline/progressed used 250ms reactions. Retained P1 native victory was 59.78s; retained P2 Baseline/Progressed were 59.82/37.47s. All three P3 native traces match serialized simulation replay, and fresh also completes a full UI replay. Chrome decoded the canvas video; no runtime exceptions or external API requests were observed. The optional private adapter check passed for all three resolved starting snapshots; it does not settle a raid.

The imperfect policy reacts after 450ms, chooses a wider safe margin and deliberately misses attacks 4 and 13. Repeated errors react after 900ms and miss every third attack. A surviving always-moving control times out without attacking. These are bounded policy models, not a representative population of human behavior.

Native Chrome checks (mobile emulation, actual CDP touch events, no game-state overrides):

```sh
node prototypes/bloodmoon-v4/browser.test.mjs
node prototypes/bloodmoon-v4/p2/browser-p2.test.mjs
node prototypes/bloodmoon-v4/p3/browser-p3.test.mjs
```

Use an isolated Chrome debugging session; set `CDP_URL` to it (P1/P2 default 9224; P3 default 9225) and `DEMO_URL` to the server. P3 tests all three victories and a full fresh UI replay, 320/390px portrait layouts, two deliberate fresh collisions, screenshots and a decoded canvas recording. P1 covers cancellation, resize, idle defeat/restart, art fallbacks and original escalation. Generated logs, screenshots and video stay under ignored `evidence-local/` directories. No production request is sent.

Optional developer-only resolution check:

```sh
node prototypes/bloodmoon-v4/p3/private-integration.test.mjs
```

An owner-provisioned ignored `.private/adapter.mjs` (or `BLOODMOON_PRIVATE_ADAPTER`) must export `verifySources`, `resolveProfile` and `resolveFreshProfile` using the existing local adapter protocol. No raw source, extraction tools or formulas are distributed here. Without it the command exits 2 / NOT AVAILABLE and runs zero private checks. With it, the check independently resolves the three snapshots, then validates bounded P3 victories. It does not verify production economics, identity or transactional settlement.

## Private backend handoff

The observed existing public contract is in `js/bloodmoon.js`: state response `{ok,data}`, `data.raidInstanceId`, `myFaction`, `myFactionRun.currentWave`, `myFactionRun.waves[String(wave)].hp/hpMax`; `myContribution.attemptsLeft`, `dailyCap`, `cooldownLeftSec`, `totalDamage` and display `bestHit`. The faction run is the player's wave authority. The existing attack call sends `{run_id,raidInstanceId}` and consumes `{ok,duplicate,data,result.battle}`. P3 never calls or changes these endpoints.

`raid-contract.mjs` rehearses a **proposed** private session boundary, not an existing production API:

1. A trusted authenticated owner/faction context reads the faction snapshot and privately resolved stats. Reject missing/cleared/later waves, invalid HP, exhausted attempts or active cooldowns. P3 supports Tower Husk wave 1 only.
2. The private service would retain an immutable envelope binding owner, `run_id`, seed, policy/version, raw/effective parameters, raid instance/faction/wave, participation snapshot and 120s expiry. A monotonic `revision` is an additional server guarantee required by this proposal; it is not asserted to exist in the current public response.
3. The proposed submission accepts only `{run_id,ticks,trace}`. A local verifier replays the frozen encounter, enforces elapsed/expiry bounds, terminal ticks and canonical inputs, and rejects snapshot changes and fabricated outcome/damage/parameters.
4. The output reports **normalized encounter damage only**. A partially damaged synthetic raid (7300/10000) is independent of the solo 1000 HP. No normalized damage is translated into shared HP, personal contribution, attempts or rewards. Every preview receipt has zero shared-HP delta, zero attempts/contribution, no cooldown write and no rewards.

Before connecting this to production, the private owner must supply/verify the actual settlement policy: eligibility/reservation point, cooldown clock, disconnect/expiry outcome, mapping of normalized combat performance into permitted raid damage/contribution, and concurrent wave/raid rollover behavior. No conversion formula or attempt-consumption timing is invented in this P3 pass. Apply authenticated, durable, atomic server transactions and idempotency with the existing command receipt rules; pure deterministic repeatability is not transactional deduplication. Current preview conservatively rejects any raid/participation snapshot change, including other players' damage. Live multiplayer settlement needs a private concurrency policy, not client-side retries or rerolls. Replay proves simulation consistency, not human input or anti-cheat.

## Limits and balance risks

- The 16 seeds and fixed target-selecting drivers do not establish broad human balance. Physical Android/iPhone and new human playtests remain pending.
- Two intentional missed dodges can shorten a fight slightly because the player spends that time attacking. HP is a limited risk/reward budget; all tested idle/repeated-error runs lose.
- Offense is compressed and reaches the cap at about 17.86 resolved damage/hit. HP and sub-cap offense retain an advantage, but this is not a universal endgame progression curve. Other stat ranges need private-profile validation before rollout.
- Normalized tuning is proposed for this local milestone only. No production endpoint, attempt, cooldown, contribution, reward or shared-HP write is implemented. Backend integration remains blocked on the explicitly listed private policy/transaction work.
