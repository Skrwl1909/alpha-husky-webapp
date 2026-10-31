# DEPTH 02 — Relay Lockdown plans

Before deployment, veterans can now choose a defensive Anchor or a moving Crosslink route in the existing optional Relay Lockdown encounter. Access still requires Rank 3 and the existing server-recorded Advanced HOLD accomplishment. No new reward or progression layer.

| Plan | Benefit | Cost / battle priority | Real-engine proof (10×7) |
| --- | --- | --- | --- |
| Anchor | One exact relay tile; keep the formation | Support cooldowns +1 personal turn. Screen the eastern reinforcement before it contests the holder. | CNC/SHADOW: round 5; CNC/PET: round 4 |
| Crosslink | Normal support recharge | Occupy north → east → south at consecutive round changes. Missing a checkpoint resets to north. Rotate the holder and clear the next relay. | CNC/SHADOW and CNC/PET: round 5 |

The identical static center-holder / focus-fire policy with CNC/PET wins Anchor in round 4 but fails Crosslink at round 7 with 0/3 checkpoints. Both plans also pass both squad approaches on 8×5 (round 4). Traces include actual movements, skills, targets, checkpoint changes and client reports. They demonstrate distinct legal play, not human enjoyment or retention. CNC sidegrades A and B are exercised across the two approaches; PET is optional.

The private compatible backend advertises plan support. New planned attempts use report version 5 and freeze the selected plan in the existing run/store/receipt transaction. Reports must match that plan. Versions 1–4 retain their original rules, including unfinished v4 Lockdown runs. The server validates eligibility, context, report consistency and receipts; combat remains client executed. It does not independently replay every move. Results label only the matching server-accepted plan and outcome.

Focused reproduction:

```sh
node tools/verify_tactical_depth02.mjs
node tools/verify_tactical_depth02_combat.mjs
node tools/verify_tactical_depth01.mjs
node tools/verify_tactical_vnext_run_contract_wire.mjs
node tools/verify_tactical_depth02_browser.mjs
npm run build:tactical-ops
node --check js/tactical_ops.js
git diff --exit-code -- js/tactical_ops.js js/boot_loaders.js
```

Browser checks cover 390×844 and 320×740: both choices, benefit/cost/priority copy, locked resume, combat relay marker/HUD, accepted Results, COMMAND, old backend fallback and 8×5. Local Windows execution used Chromium-based Edge through `CHROMIUM_EXECUTABLE`; hosted CI uses Chrome. Evidence is generated under `artifacts/depth02` and uploaded by the focused workflow.

Private tests use temporary synthetic user/ledger directories and loopback HTTP, including exact server-accepted combat snapshots for both plans, disk save/reload, plan swaps, stale revisions, wrong run IDs, changed duplicate reports, idempotent retries and zero optional-practice rewards. Backend source, tests, backups, hashes and manual deployment/rollback instructions remain outside this public repository.

Release runtime/cache: `3.6.17-depth02-plans`. Draft review only. No merge, deployment, activation, VPS access or real player writes. Physical Telegram Android/iPhone acceptance and the owner's manual release approval remain separate gates.

The production artifact uses the repository's canonical bundle-sync output. Reproduction requires a fresh install of the declared dependencies: the reused local tree contained Rolldown 1.2.12, while the fresh install/hosted build uses 1.2.16. Windows checkout conversion also changes raw CSS import bytes; preserve their committed line endings when checking parity. These caused the initial bundle-only CI failures; gameplay and compatibility checks passed. Fresh local dependencies and the committed CSS bytes now reproduce the synchronized artifact exactly.
