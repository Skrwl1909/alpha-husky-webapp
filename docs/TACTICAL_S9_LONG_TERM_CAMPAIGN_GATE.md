# Tactical S9 — Long-term Campaign / Gate

## Audit
Existing: Broken Signal and Dead Relay campaigns, six Field Ops on three rotating server slots, challenges, Commander ranks, pressure, advanced directives, mastery and persisted career record.

## S9A — implemented source
A new War Table order system reads canonical server state to provide story, front, challenge, advanced and career goals with real mission CTAs. No synthetic saves, new rewards, or invented unlocks. Version 3.5.17-campaign-orders.

## S9B — next gameplay milestone
Create a **server-owned chapter contract**, not just another screen: three doctrine paths RECON (Recover/Intercept), DEFENSE (Hold/Survive), INTERDICTION (Intercept/Boss), each spanning multiple accepted runs. Freeze doctrine choice and rules in accepted runs. On verified chapter success, carry one lasting tactical Intel consequence into the next battle (e.g. delayed reinforcement or alternate entry), never an imagined badge. Backend validates all progress, first-clear eligibility and run idempotency. Implement server changes in private backend only; avoid public disclosure.

## S9C — retention
Career dossier with verified historical accomplishments and choices, deterministic higher-difficulty replays and capped cosmetics/archive recognition; never P2W. Distinguish new rotation vs still-open challenge vs replay for practice. No manufactured FOMO or automatic currency payouts.

## Merge gate
1. npm install --no-audit --no-fund
2. node tools/verify_tactical_s9_campaign_orders.mjs; all existing tactical regressions.
3. npm run build:tactical-ops; commit canonical js/tactical_ops.js and js/boot_loaders.js.
4. Current-head CI green, review diff for source/bundle sync.
5. S26 Ultra: story locked/unlocked, 0/3 and 3/3 fronts, pending challenge, certified vs uncertified, Advanced access, frozen accepted run, rotation refresh, offline stale state and all mission CTAs. Confirm backend persistence after relaunch.
6. No merge/deploy without tests and device PASS.

## Success criterion
First-time tester finds an attainable next goal and its consequence from the War Table within 10 seconds. S9A is a functional discovery milestone, not proof of improved retention until measured.
