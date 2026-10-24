# ALPHA HUSKY — THE SIGNAL ATLAS V2
Date: 2026-10-23
Status: ARCHITECTURE + ART DIRECTION CONTRACT; NOT IMPLEMENTED / NOT SHIPPED
Supersedes the fixed-fit 3-lane layout proposed in `TACTICAL_SKILLBOOK_SIGNAL_TREE_V1.md`.
PR: #171 (design only). S2/S3, VNext, gameplay, economy and backend remain unchanged.

## 1. Decision / product north star
A long-term, expandable, player-readable CHARACTER DEVELOPMENT NETWORK rather than a fixed 3-column skill widget. Two visual scales form one system:
1. **ATLAS OVERVIEW**: per-hero combat core and multiple doctrine/skill sectors. Always show real active skills separately from future content reservations.
2. **SECTOR FOCUS**: tap an active sector to see large purchasable skill nodes, exact rank effects and authenticated save outcome. No tiny targets or horizontal-scroll-only gameplay.
3. **NODE INSPECTOR**: preview ability, exact effective before/after, branch, cost, eligibility, and receipt. The node inspector may be a bottom sheet on phone.

No cap on how many sectors may be authored over time; no expectation that all will be simultaneously visible or all levels indefinitely extend numeric stats. Scalability here means content architecture and performance within a controlled viewport, **not** endless power escalation or an unlimited backend model today.

## 2. Truthful existing content (2026-10-23)
`playerGrowth.ts` is canonical: 3 heroes (`alpha`, `ally-02`, `ally-03`), two exclusive discipline choices each, three skills each, 0/1/2 ranks, eighteen total purchasable rank steps for entire squad. Existing `SkillbookPanel` already handles server-owned points, upgrade/respec and nine canonical skill icons.
- ALPHA: Strike/Rend -> **Assault** (UI-only group), Howl -> **Command** (UI-only group).
- CNC: Thrust/Lunge -> **Pursuit** (UI-only group), Pressure -> **Control** (UI-only group).
- SHADOW: Sweep -> **Line** (UI-only group), Mend/Pack Support -> **Support** (UI-only group).
All `sectorId` groupings above are a presentation taxonomy; **NOT** a new persisted unlock requirement or additional gameplay feature. The same canonical `skillId` and `rank` own the upgrade, irrespective of visual grouping.
Other sectors seen in art (e.g. Mobility, Resilience, Synergy, Defense) are **NOT RELEASED / CONCEPT RESERVES**. They are NOT "locked" skills with an implicit mission requirement, not available for purchase, and not new promises. Production can hide them entirely until authored.

## 3. Graph contract — extensible but honest
The presentation receives a versioned manifest with 3 kinds of nodes:
```ts
type GraphNode =
 | { kind:"hero_core"; id:string; heroId:HeroId; x:number; y:number }
 | { kind:"sector"; id:string; heroId:HeroId; x:number; y:number;
     title:string; release:"live"|"reserved"; canonicalSkillIds:string[] }
 | { kind:"skill_rank"; id:string; heroId:HeroId; sectorId:string;
     skillId:string; rank:0|1|2; x:number; y:number };
type GraphEdge = { id:string; from:string; to:string; role:"visual"|"rank_prerequisite" };
type AtlasManifest = { version:2; layoutVersion:number;
 heroId:HeroId; nodes:GraphNode[]; edges:GraphEdge[] };
```
- `x/y` are abstract normalized art-space coordinates, not percentages bound to fixed 9-node layout. In production sector focus may use a deterministic layout engine keyed on stable node ids; coordinates can migrate between `layoutVersion` values without changing gameplay ownership.
- `rank_prerequisite` edges reflect the existing canonical rank 1→2 rule. Other connections are visual or navigation only; never infer game permissions from decorative edges.
- UI view model joins `GraphNode.skillId` to `HERO_SKILLS`, `UPGRADES`, `resolveGrowthSkill`, `playerGrowth` and actual server result.
- Stable ids: `hero:alpha`, `sector:alpha:assault`, `skill:alpha:alpha-strike:2`; never address ownership by index or graphic position.
- Per hero chosen discipline is a **mutually exclusive modifier**; do not add two purchasable copies of each skill for Vanguard/Howlkeeper etc.
- Render dynamically: no per-skill hard-coded JSX nor baked-in rank numerals in raster art. A design with 50 **synthetic, explicitly DEMO** nodes may exercise layout; no game unlock is created.
- Future graph mechanics require their own backend schema/progression validation, migration and frozen-run contracts. UI may accept new node *presentations* without implying their game mechanics exist.

## 4. Art direction: RELAY / CHAIN / SURVIVAL-TECH
From art concept 3 take physical concentric relay core, frozen conduits, atmospheric mystery and meaningful activation. From concept 2 take label discipline, sharp hierarchy and low-noise state clarity. Avoid copy-pasting the same header/dashboard onto every screen.
Palette: obsidian/deep navy foundation, ice-cyan active network, steel muted unavailable, amber selected inspection accent, **no amber = earned if server unconfirmed**.
Atlas viewport: center hero emblem/portrait, radial/semi-organic large sector islands on rings with capacity to append/cluster sectors; no fixed positional index limits. Camera pan/zoom available, one-tap "Recenter" and clear currently selected location.
Sector Focus: noticeably different composition: clear breadcrumb, sector title, large skill paths (curved or row-based depending node count), central/local composition, expandable node inspector.
States must be legible with text/symbol as well as color:
`BASE_OWNED`, `AVAILABLE`, `R1_RECORDED`, `R2_RECORDED`, `INSUFFICIENT_POINTS`, `OTHER_DISCIPLINE`, `R1_REQUIRED`, `SAVING`, `SAVE_FAILED`, `RESERVED_NOT_RELEASED`, `UNKNOWN_STATE`.
Not-yet-released sectors need `NOT RELEASED` and no purchase pathway; they are NOT "LOCKED UNTIL X".
Prefer living CSS/SVG/DOM with real icons; imagery must contain no server-driven text, currency, or rank. Existing nine action icons and nine emblem variants remain the definitive asset source. New image work, if needed, is limited to environmental chapter art and reusable shells/ornament at sensible size.

## 5. Interaction and state flow
`War Table → Squad → Skillbook → Atlas → Sector Focus → Node Inspector → Confirm`.
Changing heroes preserves no fake node ownership. Selecting branch is only preview until successful authenticated upgrade. On save: `SAVING` with disabled transaction controls; only canonical server revision/point/rank response triggers `RECORDED`. Network failure: no earned animations, replay with existing action, points unchanged. Respec is separate, clearly irreversible and one-time per hero.
Pocket navigation: bottom/side compact switch `ATLAS / SECTOR`; one tap returns to same Atlas camera focus after inspect. Selection accessible via keyboard/tab and screen reader, no pan needed to reach the current unlocked action.
Mobile widths: 320, 360, 390, 430 CSS px. Portrait phone first, then tablet/landscape. Responsive node sizes >=44px; large icon touch area at high zoom. Pan only on blank graph surface, not on buttons. Respect Telegram top bar and iOS safe area. Keep main action visible on small-height viewports.
Reduced-motion switches pulses/transitions off. Text readable even when art unavailable, low-end phone GPU-safe compositing.

## 6. Scale proof and technical budgets
Proof harness should mount 9 canonical per-hero nodes and a **synthetic 50-node layout test** behind a development-only toggle. Benchmark rendering, overlap detection, focus return, labels, keyboard order and pinch/drag hit testing.
- 50 nodes are fake layout fixtures labeled DEMO, never server-owned skills.
- Stable keyed map and viewport culling or sector-level mount limit when larger data is added. Never mount hundreds of expensive ambient filters.
- E2E checks for 320px viewport, 200% text scaling, portrait rotation, network latency, retry, stale server state and touch cancellation.
- No expensive glowing textured giant PNG on every node. Reuse sprites/icons and parameterized CSS borders/SVG rings.

## 7. Planned deliverables / acceptance gates
A. **Design locked:** distinct Atlas Overview + Sector Focus approved; 9 canonical data bindings mapped and at least 50-synthetic-node layout proof without overlap or action confusion.
B. **Visual implementation:** reusable `AtlasViewport`, `SectorNavigator`, `SectorGraph`, `SkillNode`, `SkillInspector`, `Legend`, `SaveReceipt` components; local ephemeral view state only; existing Skillbook remains fallback.
C. **Server wiring:** canonical growth, revision, idempotent save, loss/retry/mismatch, frozen run, claimed first clears, respec; never local grants.
D. **Combat honesty:** skill power proof from real resolver before/after. Resolve existing SHADOW MEND zero-delta rank defect before selling those ranks in new UI.
E. **Release:** S2 simulator, S3 after-action and all tactical regression/build checks; S26 Ultra, Temux iPhone 13, Kacper blind readability trial; G0 backend verified. Human and global rollout gates remain HOLD independently.
No implementation, CI, device or gameplay PASS is asserted by these concept images or this document.

## 8. UI-only prototype boundaries
A static design prototype may show 2 *sample* unspent points and one sample STRIKE Rank I ownership. Must show **DEMO DATA**. A "confirm" interaction in this prototype is non-transactional and cannot call production backend. Do not describe this as a playable integrated feature.

## 9. Explicit exclusions
No extra XP, HOWL advantage, artificial rank cap, new battle ability, fabricated 50 skills, invented world unlock, Pack Mastery duplication, or global VNext enablement. New future content requires separate authored missions/effects/rewards and backend verification.

**GAME FIRST. HISTORY RECORDED HONESTLY.**
