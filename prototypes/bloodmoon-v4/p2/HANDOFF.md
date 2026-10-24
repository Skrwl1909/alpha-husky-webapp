# P2 engineering handoff — local vertical slice, not production integration

## Verified source and scope

Primary authority inspected: `K:/ALPHA_WORKSPACE/ALPHA_BACKEND`. All original source/state files are treated read-only. `source-manifest.json` records source hashes, exact excerpt lines and snapshot comparison. The relevant files match `AI_SNAPSHOTS/ALPHA_BACKEND_AI.zip` byte-for-byte. The older `bloodmoonworks.zip` contains frontend updates, not the current Python resolver. No VPS parity is established. The local backend Git checkout points to `Skrwl1909/alphagame` at an older June commit; the current Blood Moon files are untracked there. No backend PR was made against that inappropriate source.

| Source | Authority established |
|---|---|
| `stats.py:57`, `stats_core.py:195` | Base allocated stats + effective pet + gear totals; long lowercase keys; set bonuses already included in gear |
| `equipment.py:677–701,981–1060` | Saved `equipment_data.stat_bonus` overrides base catalog stats; equipped aliases, upgrade gains and set thresholds |
| `equipment.py:401–565` | Forge adds one/two points to existing stats per upgrade; synthetic upgraded snapshots follow that reachable shape, without executing costs |
| `bloodmoon_core.py:1781,2093` | Actual Blood Moon stat extraction and rolled strike: level base, STR/AGI/INT power, 0.90–1.10 variance and LUCK crit capped at 25% |
| `bloodmoon_core.py:1874,417` | Player HP `50 + 12×VIT`; default wave HP `1000 + 450×(wave−1) + 100×(wave−1)²` |
| `bloodmoon_core.py:2123–2488` | One immediate V3 command commits one rolled strike, clamped to remaining faction-wave HP; attempts, cooldown, contribution, wave transition and prepared-attempt consumption |
| `webapp_bloodmoon.py:80–112,166–202` | Existing SecureSession/verified Telegram resolver supplies canonical uid; body uid is not authority |
| `bloodmoon_transactions.py:183–206,291–403` | Command identity includes raid/uid/action/run; payload hash; global→user→journal lock order; staged JSON journal/recovery and duplicate receipt |

Database ownership: global Blood Moon world JSON contains independent faction wave runs, persistent HP, standings, wave rewards and leaderboard. Strict-V2 user documents hold attempts/cooldown, contribution/history and claimed rewards. Daily cap defaults to **5**, cooldown to **60 s**, daily reset uses Europe/London, raid week uses UTC ISO week. Rewards are separately claimed through the same coordinator; prepared War Room bonuses modify and consume a strike. The state endpoint can record a quest visit and is not a side-effect-free snapshot API. None of those live paths are called here.

## Confirmed incompatibility and explicit proposals

**Observed V3 casing fault:** `_extract_totals_from_user` reads uppercase `STR/AGI/INT/VIT/LUCK` from `stats.compute_full_stats`, which returns lowercase totals. The real observed path therefore yields zero offensive stats and 50 HP for both supported fixtures; level still affects damage. Tests preserve and expose that behavior.

The P2 path runs the actual copied resolvers and the actual Blood Moon formula with an **explicit proposed casing bridge**, then divides the resolved seeded strike by **8** for each real-time hit. The divisor is proposed tuning to keep the baseline near the P0 counterattack budget; a whole old strike is never applied on each autoattack. Incoming hazard damage **60** is also proposed: V3's replay has no enemy retaliation rule. VIT-derived HP has source authority after the proposed alias bridge; DEF mitigation is **not applied**, because the shared Missions/MoonLab defense formula is not a verified Blood Moon rule. Critical chance/roll are captured in the snapshot rather than rolled again for every autoattack. Nothing changes production balancing.

The fixtures are synthetic source inputs, not account records. Baseline: level 10, Rustfang blade/armor. Progressed: level 20, allocated stats, saved level-3 blade and Frostborn armor. Only three reviewed game catalog definitions are copied. Active pets and War Room modifiers fail closed rather than being silently ignored. Full current-account compatibility is not claimed.

## Executable path and results

`resolver.py` executes reviewed source excerpts against synthetic raw character/equipment state. `scenarios.js` is generated from that path and consumed by the playable browser. The Node preview authority also calls the Python resolver at issuance; it does not accept client-supplied stats.

| Simulation | Effective STR / VIT | Player HP | Observed V3 strike | Bridged strike | V4 damage/hit | Same enemy HP | Actual result |
|---|---:|---:|---:|---:|---:|---:|---|
| Baseline | 12 / 10 | 170 | 66 | 84 | 10.5 | 1000 | Win, 96 hits, 59.65 s; idle loses at 5.90 s |
| Progressed | 27 / 19 | 278 | 95 | 135 | 16.875 | 1000 | Win, 60 hits, 37.37 s; idle loses at 9.92 s |

Both simulations use the same 250 ms reaction-delay driver. Progressed characters intentionally finish earlier; the P0 45–75-second benchmark is not imposed on every build. Native-touch Chrome results: **Baseline 59.75 s / 96 hits / 170 HP; Progressed 37.50 s / 60 hits / 278 HP**, both defeated the same 1000 HP. The progressed full browser replay matched; the recorded 360×540 WebM decoded. Actual records are in `evidence/browser-results.json`, `browser-baseline.json`, and `browser-progressed.json`. All **28 unique automated tests pass**, plus the standalone patch's independently repeated 5-test suite. P0/P1 browser regression also passed. Physical devices and human P2 balance remain unverified.

Balance limit: the baseline is level 10, not a fresh zero-stat account. The verified HP formula gives a zero-VIT account 50 HP, below the proposed 60-damage hazard. Fresh-account difficulty and a wider build distribution must be evaluated before production; these two scenarios do not establish universal win feasibility.

## Safe raid boundary implemented

`preview-authority.mjs` is a local in-memory validation component, **not a live endpoint**. It issues opaque encounter identities, freezes server-resolved parameters/seed/full-HP wave revision, binds trusted caller context, rejects client HP/damage/seed/outcome claims, validates bounded input traces through the actual fixed-step engine, rejects impossible elapsed time/stale/expired snapshots, and serializes duplicate/concurrent validation receipts. Mid-run public snapshot or equipment changes cannot change the issued private snapshot. A normal defeat stays defeat.

Every receipt has **zero attempts consumed, zero contribution, no rewards and `productionReady:false`**. Shared HP is never written. Partially damaged/shared-wave snapshots are explicitly unsupported; a changed wave/HP/revision is rejected rather than silently rebalanced. The local preview's 120-second TTL, trace budget and timing tolerance are experimental validation bounds, not approved production anti-cheat policy. Auth/session validation must still be performed by the existing server resolver at both real start and submit; a local trusted owner string is not an authentication implementation. A deterministic replay proves only what the simulator does with a trace; a bot can invent a perfect trace.

## Remaining owner decisions and safest boundary

1. Approve or reject the casing correction and the proposed real-time divisor/incoming-damage model. Do not patch production implicitly.
2. Decide how one long fight maps to one existing immediate, paid V3 strike. V3's `preparedAttempt` is already **COMMITTED**, not a reservation. Reusing it as an uncommitted encounter would risk double spending/credit.
3. Approve reservation/expiry/disconnect handling, concurrent shared-wave HP semantics, credit/reward limits and an anti-cheat policy before any economic endpoint. Perfect local replay is insufficient.

Safest current option: keep the new path validation-only. Leave V3 transactions authoritative and untouched; add no live credit/claim endpoint. Source inspection and local tests do not establish deployed VPS parity or production readiness.

## Run and independently reproduce

From repo root, Node 22+ and Python 3.10+:

```sh
python -B prototypes/bloodmoon-v4/p2/resolver.py
python -B prototypes/bloodmoon-v4/p2/resolver_test.py
node prototypes/bloodmoon-v4/p2/authority.test.mjs
node prototypes/bloodmoon-v4/p2/compatibility.test.mjs
node prototypes/bloodmoon-v4/simulation.test.mjs
node prototypes/bloodmoon-v4/presentation.test.mjs
node prototypes/bloodmoon-v4/serve.mjs
```

The demo defaults to the source-resolved synthetic baseline; choose Progressed in local progression controls, then restart. The P1 Standard/Stronger controls remain for regression. Browser tests require the same dedicated Chrome/CDP setup described in the main README; run P1 regression with `EVIDENCE_DIR=./p2/evidence/regression/`, then `node prototypes/bloodmoon-v4/p2/browser-p2.test.mjs`. No test needs a live user, backend import, original backend database or VPS.

`backend-review.patch` is separately reviewable Python-only source/fixtures/tests. Apply it **only to an empty isolated folder**, using `git -c core.autocrlf=false apply /path/to/backend-review.patch` to preserve the audited LF bytes on Windows, then run `python -B bloodmoon_v4_p2/resolver_test.py`. It is not a production patch. `export_sources.py` is an optional read-only re-export for the designated local source; normal test/demo execution uses the checked-in reviewed excerpts and does not require original backend access.
