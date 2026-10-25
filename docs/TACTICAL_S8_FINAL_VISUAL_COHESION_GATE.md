# Tactical Ops — S8 Final Visual Cohesion / Merge Gate

**Baseline:** merged PR #192 (S7, `v3.5.15-consequences`). S8 is a single render-only pass before the focus moves to S9 campaign objectives, mission variety, meaningful progression and retention.

## What actually changes
- `ui/combatCohesion.css` is appended after existing CSS via `styles.ts` in the **canonical host bundle**, not loaded as an optional external file.
- Visual stacking follows: attack travel → FX → confirmed consequence captions → hit pulse → danger tiles → actual damage numbers. Effects do not absorb touch input. Danger markers persist above non-critical effects.
- The four confirmed hostile attack identities synchronize their damage reveal with the corresponding dash / beam position: melee 42%, heavy 49%, ranged 44%, jam 44%. Action planning, combat calculations and AI remain untouched.
- Confirmed TARGET DOWN, GUARD HELD and SIGNAL BROKEN labels use mobile-safe CSS clamping on both axes (for 10×7 and legacy 8×5).
- HUD rail, action dock, contact pulses and captions share a restrained frozen-relay navy/cyan/amber visual system without replacing character/skill identity.
- Reduced-motion mode keeps labels readable while suppressing decorative movement.

## Required local build and functional verification
On the S8 branch:

```bash
npm install --no-audit --no-fund
node tools/verify_tactical_visual_cohesion.mjs
node tools/verify_tactical_enemy_presentation.mjs
node tools/verify_tactical_combat_consequences.mjs
node tools/verify_tactical_contact_sync.mjs
node tools/verify_tactical_hp_impact.mjs
node tools/verify_tactical_battlefield_visual_closure.mjs
node tools/verify_tactical_battlefield_shell_closure.mjs
npm run build:tactical-ops
git add js/tactical_ops.js js/boot_loaders.js
git commit -m "build(tactical): ship S8 canonical host bundle" 
git push
```

Do **not** manually patch a minified `js/tactical_ops.js`. The canonical builder writes the production IIFE and synchronizes the Telegram cache key from `version.ts`. Confirm the diff is limited to intended S8 files, generated bundle and loader.

## S26 Ultra review: actual PASS criteria
1. Fresh operation 10×7 plus legacy 8×5 (where reachable): board visible, tiles tappable, objective/HUD/dock visible in the same view; no field shrink or system-gesture overlap.
2. Melee enemy strike, heavy strike, ranged shot and jam: label/damage starts when the actor/beam reaches its target; no early HP drop.
3. Real lethal vs non-lethal hits: TARGET DOWN only after confirmed lethal damage; defeated sprite follows staged HP. GUARD HELD only for accepted guarded damage, SIGNAL BROKEN only after confirmed interruption.
4. Alpha/CNC/Shadow/Pet action assets retain their distinct signatures; support/heal effects do not dash through enemy targets.
5. Top/bottom/left/right edge cases: captions readable inside the board, not covering action controls; threat tiles remain visible and danger outweighs flourish.
6. Rapid restart/cancel, quick consecutive hits, screen close and reopen: no stale scene, duplicate consequence, ghost visual or tap interception.
7. Android standalone + Telegram mobile view (and iPhone 13 if available); reduced motion and narrow/landscape if practical.
8. CI green on **current PR head**, plus canonical bundle/loader diff gate. Record a 15–25s on-device video showing telegraph → action → contact → result.

## Explicitly out of scope
No new economy or $HOWL hooks; no new mission/reward/faction contract; no stat/damage/cooldown/AI changes; no new combat effects that imply a hit without an engine event. No merge, VPS deployment or store publish before CI + mobile QA.

## Next milestone
**S9 — Campaign / Objectives / Long-term Playability:** operation map + branching player goals, varied win conditions and opposition, mastery decisions with honest persistence/rewards, replay incentives and onboarding. Design and audit current contracts **after** S8's merge gate.
