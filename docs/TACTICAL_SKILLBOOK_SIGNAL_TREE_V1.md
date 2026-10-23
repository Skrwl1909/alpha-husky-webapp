# ALPHA HUSKY — SKILLBOOK SIGNAL TREE V1
Date: 2026-10-23
Status: DESIGN CONTRACT / NOT IMPLEMENTED
Owner: Tactical Ops; presentation-only proposal
Source: `tactical-ops-src/data/playerGrowth.ts`, `tactical-ops-src/ui/Skillbook.tsx`, `tactical-ops-src/ui/combatIdentity.ts`.

## 0. North star
Turn existing Character Skillbook into a deliberate, touch-first SIGNAL TREE: clear combat identity, visible ownership, exact costs, and actual battle-proof changes. The interface must not imply any new abilities, currencies, prerequisites, unlocks or reward ownership. No more checklist scrolling. Do not merge or deploy any Tactical VNext work as part of this document.

## 1. Verified canonical model
- Heroes: `alpha` (ALPHA), `ally-02` (CNC), `ally-03` (SHADOW).
- Hero discipline choices, exactly one per hero when investing:
  - ALPHA: `vanguard` (HOWL grants GUARD 20% for 1 turn to affected allies) or `howlkeeper` (HOWL radius +1).
  - CNC: `pursuer` (THRUST range +1) or `disruptor` (PRESSURE debuff duration +1).
  - SHADOW: `sentinel` (PACK SUPPORT grants GUARD 20% for 1 turn) or `medic` (MEND cooldown -1 with lower bound 1).
- Exactly 3 existing canonical skills per hero and ranks 0/1/2:
  - ALPHA: `alpha-strike`: Long Step R1 range +1, Relentless R2 range +2 (relative to base); `alpha-rend`: Deep Cut R1 Bleed +1 turn, Open Wound R2 Bleed +2; `alpha-howl`: Pack Echo R1 cooldown -1, Pack Rhythm R2 cooldown -2.
  - CNC: `u02-shot`: Long Reach R1 range +1, Pursuit R2 +2; `u02-burst`: Rapid Lunge R1 cooldown -1, Flow State R2 -2; `u02-suppress`: Sustained Pressure R1 control duration +1, Signal Lock R2 +2.
  - SHADOW: `u03-tap`: Extended Reach R1 range +1, Relay Reach R2 +2; `u03-mend`: Fast Recovery R1 cooldown -1, Field Triage R2 cooldown -2 **authored intent but effective cooldown cannot drop below 1**; `u03-pack`: Long Watch R1 status +1 turn, Hold Together R2 +2.
- Existing canonical `playerGrowth`: `earnedPoints`, `spentPoints`, `claimedFirstClears`, three per-hero `discipline`, `ranks`, `respecUsed`; backend-only first-clear grants, validation and atomic upgrades.
- `UPGRADES` currently 18 rank definitions. Each rank costs 1 shared point. R2 requires R1 and the selected discipline is locked by the first successful investment, not by merely previewing a branch.
- `respecGrowth`: one free respec per hero, if eligible, irreversible use. Preserve existing backend behavior.
- Pack Mastery and companion sidegrades remain separate systems; do not equate CNC Vanguard sidegrade with ALPHA Vanguard discipline.
- Do not add new RPG effects as part of SIGNAL TREE V1.

## 2. Scope and information architecture
Navigation: `War Table → Squad → Character Skillbook`. Retain sibling `Pack Mastery`. Three portrait tabs: ALPHA/CNC/SHADOW; selected hero only.
Hero header: portrait, canonical emblem, chosen discipline (or uncommitted), `earned - spent` shared unspent points, compact rank summary.
Main area: fixed-fit tree, central combat core, 2 discipline selectors and exactly three skill lanes. Each lane contains action root (rank 0, non-purchasable) → R1 → R2, connected visually. 3 base icons + 6 purchasable nodes per hero; the two discipline selectors are **not purchased nodes**, just a preview/commit choice. The same six skill-rank nodes are shown in either discipline preview; do not falsely double them to twelve.
Bottom selection inspector: skill name, A1/A2/A3, current rank, before/after effects from `resolveGrowthSkill`, one material downside/tradeoff where applicable, 1-point cost or why locked, next legal action. Sticky bottom bar: exactly one primary `Confirm upgrade` (when allowed), and secondary `Back / Cancel`. Separate confirm modal before save. Respec placed in secondary settings, never near confirm.
The layout's lines are navigational visual groupings; no server-enforced edge prerequisites beyond R1→R2. No cross-skill or path-chain dependency.

## 3. Visual direction — THE SIGNAL TREE
Dark navy/blackglass command chamber, cold cyan relay signals, desaturated steel, selective amber for completed rank II, restrained teal for confirmed save. Specialized colors may be decorative only and must not substitute labels. The tree is diegetic squad intel: fractured fiber-optic lines and holographic combat glyphs, not fantasy vines or jewel magic.
Canvas/frame: highly legible architecture, understated etched concentric signal rings, sparse crack texture, restrained vignette. No character obscuring interactive nodes. Reuse `images/tactical_ops/actions` for 9 skill icons; reuse `images/tactical_ops/emblems` for 3 core and 6 discipline emblems. Prefer CSS/SVG line work and DOM-accessible nodes to flattened image maps. Art must never contain baked-in text/values/state.
Design tokens proposal (to be tested, not existing canonical tokens):
- base #07101B, panel #0C1C2B, line idle #385568, active #55CDE9, confirmed #A9D9ED, rank-II #E8B76D, error #F0A59A
- type: compact uppercase labels, body >= 12px, critical text >= 14px in mobile CSS px; distinguish actions without relying on color
- rings: 50–56px touch target min, icon 24–30px with proper padding, thick interactive outline; root 58–64px
- animation: line pulse only on successful server confirmation, 250–450ms; no simulated reward particle on a pending save, no persistent ambient GPU bloom, honor reduced-motion.
- Use actual battle skill illustrations, no firearms introduced.

## 4. Interaction and honest state machine
States: `UNAUTHENTICATED` → locked/refresh, `BASE` → acquired by default but not purchased, `AVAILABLE` → legal next rank with points, `INSUFFICIENT_POINTS`, `PREREQUISITE_R1`, `OTHER_DISCIPLINE`, `R1_RECORDED`, `R2_MAXED`, `SAVING`, `SAVE_ERROR`, `CONFIRMED`.
A branch tap before first investment previews its 3 lane effects and does not change account state. First successful upgrade commits branch; alternative remains viewable as informational but cannot be bought without respec. Do not let an abandoned pending request trigger a phantom 'confirmed' banner.
Use server progression as truth: `upgradeGrowth`/`respecGrowth` store methods, revision guard, no client grant, no localStorage authority. Show `CONFIRMED` only when the returned canonical `ranks[skillId]` reaches requested rank and revision is appropriate. Failure preserves original rank and points, exposes retry; never optimistic glow. Current code's `purchaseProof` latch needs explicit clearing on a failed attempt or on switching hero/selection to avoid mistaking previously owned ranks for fresh saves.
A node's unavailable status must have plain-language reason on tap, not a dead control.

## 5. Mobile-first layout
Baseline portrait 320, 360, 390, 430 CSS px widths, test 568px height/small viewports and large fonts; larger tablets/landscape use same hierarchy with more breathing room. Fit the three lanes and branch choice inside screen width. Do not require lateral panning, pinch zoom or 1000px scroll. One vertical page scroll permitted where needed, sticky actionable footer outside tree viewport.
Mockup architecture: top hero tabs (3) → compact 2-branch selector → tree with 3 horizontal lanes, each root+R1+R2, on 320px compress node gaps rather than icon hit boxes → inspector drawer (collapsed by default) → sticky save control. Large pointer/touch targets >=44×44px (recommended 48). Safe-area insets. Do not overlap Telegram native header, Android status area, close X or iPhone bottom gesture.
Accessible DOM buttons over SVG decorative connectors; keyboard focus order consistent with visual order; `aria-pressed` for selected branch/node, `aria-label` includes skill/rank/status, `aria-live` for save status. Reduced transparency/motion support, images have fallback icons/labels, no color-only information.

## 6. Complete truth matrix (design examples)
ALPHA:
- VANGUARD modifies HOWL by adding GUARD to allies; HOWL R2 changes cooldown as authored.
- HOWLKEEPER increases HOWL radius by 1; same base A1/A2/A3 ranks.
CNC:
- PURSUER increases THRUST reach; DISRUPTOR extends PRESSURE debuff.
SHADOW:
- SENTINEL adds GUARD to PACK SUPPORT; MEDIC lowers MEND cooldown by 1.
All visible numeric delta text must be computed from `resolveGrowthSkill` and/or existing `skillChangePreview`/Power Proof, and show the *effective* final number after cooldown floor and effects composed with sidegrades/mastery where applicable. Do not treat a description in `UPGRADES` as proof of a real gain.

## 7. Known blocking design/gameplay defect
`u03-mend` starts cooldown 2. Existing minimum is 1. R1 sets it to 1, and R2 authored -2 still resolves to 1. With MEDIC discipline, base already resolves to 1, so both R1 and R2 have no cooldown effect. This violates meaningful purchase/benefit expectations.
Decision gate before interactive roll-out: investigate and choose a **separate approved balance correction** that gives both ranks a measurable differentiated benefit under both SHADOW disciplines, or explicitly make zero-delta purchases unbuyable while product decision is pending. Do not silently adjust cooldown floor or invent new healing stats as part of visual-only PR. Add tests for effective benefits.

## 8. Asset plan
Reuse exact existing:
- `images/tactical_ops/actions/action_alpha_{strike,rend,howl}.png`
- `images/tactical_ops/actions/action_cnc_{thrust,lunge,pressure}.png`
- `images/tactical_ops/actions/action_shadow_{sweep,mend,pack_support}.png`
- `images/tactical_ops/emblems/emblem_{alpha,cnc,shadow}_*.png` (9 authored emblems)
- existing unit portraits from `UNIT_DEFS`.
Create only if gaps remain after a visual pass: `skilltree_signal_chamber.webp` (optional background), `skilltree_node_ring.svg` (or CSS), `skilltree_connector.svg` (prefer code SVG). Export at appropriate 1×/2× resolution and compressed; do not add 18 baked-state icons or huge PNG sheets.

## 9. Component and data plan
New presentation subcomponents under `tactical-ops-src/ui/skillTree/`: `SkillTreeView.tsx`, `HeroSwitcher.tsx`, `DisciplineSwitch.tsx`, `SkillLane.tsx`, `SkillNode.tsx`, `SkillInspector.tsx`, `UpgradeConfirm.tsx`, `skillTreeViewModel.ts`, `skillTree.css` (names illustrative).
`SkillbookPanel` remains the War Table entry; isolate new implementation behind an internal UI feature flag default off for preview. No game-side engine changes in layout PR. Derive view model from canonical `HERO_PATHS/HERO_SKILLS/UPGRADES`, current server `playerGrowth`, `getSkill`, and effective resolver. Use stable skill IDs as keys. Existing War Table/Squad/Pack Mastery navigation stays unchanged.
Avoid duplicate state owners. Only local ephemeral selection state for hero, path preview, active skill and inspector; no saving into browser.

## 10. Incremental implementation and release gates
Gate A — spec review: verify every node is backed by existing skill/rank; confirm screenshot and touch layout with mobile design QA; resolve MEND balance decision in separate approval.
Gate B — visual foundation: static responsive DOM/SVG tree, UI states, screenshot comparisons, no backend write, no replacement of classic Skillbook.
Gate C — wire-up: authenticated server-derived ownership, real previews, save/respec with pending/error/retry, correct branch selection and confirmation.
Gate D — gameplay regression: first clear points/replays/failures, 18 authored ranks and discipline combinations, growth snapshots and frozen 8×5/VNext; S2 simulator unchanged; TypeScript/build and CI all PASS, no artificial unlocks.
Gate E — human: S26 Ultra portrait; Temux iPhone 13; Kacper blind test: can identify current path, next upgrade, cost and effect in <10 sec; correct action after success/failure. S3 after-action handoff to Skillbook validated.
Merge and global enablement are separately approved. Document does not give a PASS to any implementation.

## 11. Exclusions
No new points, currencies, free grant, 4th/5th combat skill, persistent injury, hidden rank cap increase, cosmetic pay-to-win, world-impact claims, Pack Mastery rewrite, alternate backend account owner, or unverified branch gate.

**GAME FIRST. HISTORY RECORDED HONESTLY.**
