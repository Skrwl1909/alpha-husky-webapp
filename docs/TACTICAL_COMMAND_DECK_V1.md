# Tactical Command Deck V1 — integrated implementation

**Status: draft PR, deploy HOLD until CI, production bundle sync and Samsung/Telegram device PASS.** No combat or backend changes in this PR.

## Player problem

War Table previously presented campaign missions, rotation, Skillbook, Pack Mastery, archives, lab settings and the mission launch as one long vertical scroll. Mission Brief then repeated the pattern across squad selection, Signal Codex, tactical conditions, variants and deploy. Both must be addressed together.

## New real screen flow

- War Table: **COMMAND** (next mission, rank/status, front), **MISSIONS** (current operations, active campaign), **SQUAD** (server-saved Character Skillbook and Pack Mastery), **ARCHIVE** (campaign replay, last result, Battlefield Lab device mode).
- Mission Brief: **MISSION** (objective, mission-specific Intel and rewards), **SQUAD** (character portraits, actual squad selection and saved Pack Mastery), **LOADOUT** (real active Signal Codex, variants, counterplay readiness), **INTEL** (conditions, directive tier and approach, optional hostile details).
- Tab controls are high-contrast, focus-visible and remain available when vertically scrolling content. Each view contains its own focused scroll content, not a full multi-module page.
- Existing **DEPLOY SQUAD** and **BACK** actions remain outside all tabs, sticky at bottom. All store callbacks stay identical.

## Non-negotiable invariants

1. No new mission/unlock/skill is invented. No backend state migration or automatic player write.
2. Active runs retain immutable roster/sidegrades/loadout; resumed deployment still uses accepted conditions.
3. Squad selection, variants, Skillbook upgrade/respec, rotation refresh, Battlefield Lab device toggle, story replay and Last Result remain available.
4. Full 10x7 preview and legacy 8x5 functionality must be unaffected.
5. Accessible keyboard focus, minimum 44px tap targets, dark navy/cyan/amber palette, reduced-motion support, Android and Telegram mobile safe areas.

## Phone acceptance sequence — S26 Ultra Telegram

1. On signed-in existing account open War Table. Verify four tabs, next operation, three Field Ops, story missions, Squad Skillbook, Pack Mastery, Archive and 8x5/10x7 lab control. No lost functionality.
2. Open Mission Brief from COMMAND then from MISSIONS. Switch Mission / Squad / Loadout / Intel. Verify a real mission squad tradeoff, sidegrade choices, current abilities and enemy Intel.
3. Change squad and valid approach/tier, verify updated Signal Codex and unchanged server-owned progression. Deploy from any tab and play a mission.
4. Resume an accepted run: squad variants and conditions must stay locked. BACK and sticky DEPLOY accessible across all tabs without overlap with Android nav bar.
5. Test narrow screen and large text, both portrait and landscape if supported; scroll only within relevant focused content. Verify no clipped CTA, safe-area or side-scrolling.
6. Confirm bundle version `tops-3.3.2-command-deck`, not stale 3.3.1 runtime. Full 12-mission regression required.

## Next planned integrated PRs

P1: **Tactical Mastery — Combat Identity & Feedback** with honest visible per-point differences and authored milestone visual/functional abilities; preserve current server thresholds and balance until migration is designed.

P2: **Premium Battle Action Dock** with ability iconography, ready/selected/cooldown/disabled/telegraph states, safe visual feedback and no changed damage/cooldown math.

**HOLD merge** until build/CI and real-device QA; a contract-only or cosmetic-only pass is not acceptance.
