# ALPHA HUSKY · TACTICAL MASTERY V1
## COMBAT IDENTITY & FEEDBACK — COMPLETE DESIGN / TECHNICAL SPECIFICATION

**Milestone:** Tactical Ops 3.4.0 · **Scope:** all four allied combat identities (ALPHA, CNC, SHADOW, equipped PET), Skillbook, Pack Mastery, Mission Results, combat feedback and responsive action HUD.
**Production state:** IMPLEMENTED CANDIDATE / **NOT VERIFIED ON DEVICE** until CI, merge and S26 Ultra acceptance.
**Absolute constraints:** Game first; no paid combat advantages; server-owned progression; saved-run snapshots; no added skill slots, currencies or silent balance changes.

## 1. Why this milestone exists
An account can grow mechanically yet feel unchanged. A player must see the tactical consequence of every spent Skillbook point, recognize what an earned Pack Mastery stage does, and anticipate the next impactful choice. Three model inspirations:
- *Into the Breach*: exact consequence and readable threat intent; the player can learn from a mistake.
- *Heroes of Might and Magic III*: progression differentiates fighting styles and creates enduring attachment.
- *RAID*-style tactical RPGs: an action has a recognisable identity and earned mastery deserves a restrained audiovisual payoff.
We do not copy UI, animations, art or mechanics. We speak the ALPHA HUSKY language: broken/frozen relays, post-rug survival equipment, dark navy, cyan, ice, amber, rebuilt technology.

## 2. Fixed progression — no new economy
### Character Skillbook — ALPHA / CNC / SHADOW
Three skills per playable character, 0→1→2 upgrade ranks, one server-owned skill point per upgrade, two existing mutually exclusive disciplines per character.
- **At 1/2:** show exact changed numerical value (range, cooldown or duration), compact R1 badge in live combat HUD, subtle active skill rim.
- **At 2/2:** show evolved rank border and clearly readable R2. On a *successful engine action*, the effect pulse has a larger radius/stronger silhouette. Rank2 does not create another skill or change the balance beyond the already authored rank.
- Server confirms purchase before Skillbook says UPGRADE RECORDED. Failed commits do not get a celebration; current run remains immutable.

**Existing paths (unchanged):**
ALPHA: VANGUARD adds a GUARD to HOWL; HOWLKEEPER extends HOWL radius. CNC: PURSUER extends THRUST range; DISRUPTOR strengthens PRESSURE control duration. SHADOW: SENTINEL adds GUARD to PACK SUPPORT; MEDIC accelerates MEND.

### Pack Mastery — CNC / SHADOW / equipped PET
Already-authored tiers **3/8** (trained, new persistent passive modification) and **8/8** (A/B specialization). We **do not** invent a Mastery 5/x tier.
- **3/8:** AWAKENED label + mechanical text, correct skill appearance when the mastered modifier is involved.
- **8/8:** SIGNATURE EVOLUTION label, A/B visible and selectable only when not locked by an accepted run. On mastered actions a stronger finite VFX pulse is used.
- Progress below 3/8 retains base skill presentation. Stage 8/8 does not imply another active button.
- A passive that is not represented by an active action (PET RECOVER reach or PATHFINDER mobility) is never falsely presented as a newly activated combat skill.

## 3. Four-unit visual/functional matrix

### ALPHA — the Pack's battlefield anchor
- Base palette: icy cyan **#74DFFC** with amber signal highlights. Signature visual: expanding two-ring HOWL shockwave, never concealing target tiles.
- A1 STRIKE, R1/R2 Long Step/Relentless: show actual expanded targetable range, and R1/R2 status on the dock. When the successful hit happens: cyan directional pulse at victim; damage number from engine event.
- A2 REND, R1/R2 Deep Cut/Open Wound: cool blue slash and amber bleeding trace; show status duration actual value from resolver and a status event when applied.
- A3 HOWL, R1/R2 Pack Echo/Pack Rhythm: restrained blue/amber concentric wave, count real cooldown turns and existing radius. VANGUARD shows a GUARD ring only on a real applied status; HOWLKEEPER emphasizes extended reach but not extra protection.
- **Why players care:** They can move ALPHA to cover more allies, open longer pressure windows and convert positioning into group survival.

### CNC — aggressive pursuit and counter-intel
- Palette: signal amber **#ECC475** with broken cyan scanlines. Geometry: dashed square/reticle and interrupted relay trace.
- A1 THRUST, R1/R2 Long Reach/Pursuit: quick directional target stroke, measured range in HUD.
- A2 LUNGE, R1/R2 Rapid Lunge/Flow State: compact angular speed arc and actual cooldown countdown, not fake bonus damage.
- A3 PRESSURE, R1/R2 Sustained Pressure/Signal Lock: amber fractured signal outline where control was applied, actual longer status duration.
- **At 3/8 — REACH CONTROL:** PRESSURE extends +1 cell; status chip TRAINED and actual target preview.
- **At 8/8 A — RELENTLESS:** existing PRESSURE cooldown -1; premium signature border on PRESSURE.
- **At 8/8 B — PIN DOWN:** PRESSURE status +1 turn; same signature tier, distinct strategic effect.
- If control cancels a locked enemy intent, only confirmed scheduler result may show **ENEMY INTENT CANCELED**. Red enemy telegraphs stay visible and reliable.

### SHADOW — rescue, timing and protective geometry
- Palette: sea-glass teal **#7BF2DA**. Geometry: soft closed ring/transparent protective disk; no red threat-like arcs.
- A1 TAP, R1/R2 Extended Reach/Relay Reach: light precision tap + real range.
- A2 MEND, R1/R2 Fast Recovery/Field Triage: concentrated green-cyan ring, actual restored HP number from heal event, cooldown reflected exactly.
- A3 PACK SUPPORT, R1/R2 Long Watch/Hold Together: defensive wave affecting existing recipients, actual duration.
- **At 3/8 — WIDE SHELTER:** PACK SUPPORT radius +1, trained mark and no fabricated HP gain.
- **At 8/8 A — STEADY HAND:** MEND cooldown -1; enhanced MEND signature when actual healing happens.
- **At 8/8 B — SILENT SHELTER:** PACK SUPPORT protection but **no healing**; teal protection wave and status text only, never show a fake +HP float.
- Good player moment: keeping an ally alive after correctly predicting a threatened tile.

### PET — mobile interception companion
- Palette: cold ice-blue **#A9CAFF** with cyan fracture filaments. Geometry: two concentric snare loops/dotted route markers.
- A1 BITE: fast cold-blue short impact; never relabel as a mastery-exclusive attack.
- A2 HAMSTRING: double snare loop on successful slowdown; actual applied status and range.
- **At 3/8 — RELAY SCOUT:** RECOVER works at 2 cells, which is a mission objective action, not another battle skill. The interface must not fabricate a signature BITE/HAMSTRING because of this passive.
- **At 8/8 A — REACHING SNARE:** HAMSTRING +1 range; emits signature double-loop after successful resolution.
- **At 8/8 B — PATHFINDER:** +1 movement cell; only after `tryMove.ok` changes the PET's actual coordinates does a dotted, ice-blue arrival pulse appear. No movement = no pulse.
- In every portrait, the equipped PET image comes from the accepted server-validated record, not SHADOW placeholder art.

## 4. Truth-first technical architecture
### Immutable ownership
`FoundationProgressionState` and persisted mission data are authoritative. `withPackMastery(spawns, savedRun.packMastery)` decorates the accepted `UnitDef` with a **presentation-only** `combatMastery` marker. `spawnUnit` copies this marker onto the resulting CombatUnit. No account-level read can replace it mid-run. Existing `growth` snapshots already belong to each unit.

### A single pure contract
`ui/combatIdentity.ts` owns tier/affinity determination and exposes `confirmedSkillMoment` and `confirmedPathfinderMove`. It is called from both the targeted and the immediate successful `trySkill` paths, **after** checking `res.ok`. The moment is derived from events: `damage`, `heal`, `status`; additionally, interruption exists only if `interruptLockedThreatAfterControl(...).interrupted === true`. Failed actions and mere button presses produce no victory claims.

A moment includes `{id, actorId, targetId, affinity, tier, title, consequence, mode, interrupted}`; it is ephemeral client-only UI state. Damage/heal totals come from engine `event.amount`, not prediction. Guard comes from status events. The existing engine, outcomes, tickers, floats, SFX, turn order and telegraph data remain the source of truth.

### Action HUD and feedback
- Each available button derives its R1/R2/TRAINED/SIGNATURE label from **the acting CombatUnit**, not current account points.
- Existing icons and cooldown logic remain unchanged. This milestone increases differentiation rather than replacing the premium Action Dock, which is the next dedicated art pass.
- A successful action briefly produces a compact identity-specific VFX on target/caster plus a consequence label above dock. Sequence and run-generation guards prevent a delayed cleanup from deleting a newer moment.
- Hazard tiles are not recolored. FX are pointer-events:none. No camera shakes, permanent ambient particle storm, fullscreen flashes or cloned commercial game art.

## 5. UX sequence and dopamine without deception
**Earn:** Result screen shows verified earned Mastery only; if crossing 3 or 8, expanded AWAKENED/SIGNATURE block. Replay with no new awards never announces a new milestone.

**Invest:** Skillbook shows next stat values, one account-point price and confirmation only after saved rank is reread from the store. Strong rank2 styling reflects the true already-authored investment.

**Deploy:** Mission Brief and squad roster stay compact. The accepted run locks profile, mastery and tactical choices.

**Execute:** Selected actions preview actual range. A correctly used skill creates a short finite moment on the battlefield. CNC interrupt label only after a true lock break; SHADOW support never fabricates healing.

**Learn/retry:** Player correlates the action with damage/healing/status/control/movement and can improve tactical positioning next run. Mastery is motivation to learn, not a checklist.

## 6. Performance, accessibility and production constraints
- CSS-only visual FX; no additional images in this PR, no new heavyweight shaders/animations or WebGL contexts.
- Expected burst animation 500–950ms; feedback UI clears ~1.15s. Reduce Motion: remove animations while retaining outcome text.
- All FX overlay elements use `pointer-events:none`. Mobile tap targets, enemy threat telegraphs and status badges retain priority.
- No new API, account write, database change, SOL token spending or autoplay video.
- Retain 8×5 legacy and 10×7 lab; do not mutate combat calculations to achieve aesthetic contrast.
- Future combat Action Dock icons must consume this new tier/affinity metadata and preserve readable cooldown/target state.

## 7. Test matrix, merge rules
**Automated:** build:tactical-ops + legacy combat/field ops/persistence suite + new Vite runtime tests that cover every affinity, skill rank, stage 3/8 and 8/8, A/B distinction, real interrupts, explicit absence of fake effects, frozen PET movement and source callbacks.

**Device S26 Ultra, Telegram and Android standalone:**
1. Spend point on ALPHA, CNC, SHADOW: new stats shown before save; no confetti if save fails; after save R1 and R2 presented correctly in battle.
2. Show all ALPHA abilities with both disciplines; verify HOWL GUARD vs radius is distinct.
3. CNC control: successful debuff; one confirmed enemy telegraph interrupt; failed control does **not** say interrupted.
4. SHADOW heal on injured unit: number matches recovered HP; SILENT SHELTER shows no healing.
5. PET REACHING SNARE and PATHFINDER, with actual pet image, real range+1, move+1; unsuccessful PET move shows no signature.
6. Active committed mission: change masteries externally if possible; current run must show its frozen source. Next run reflects new selection.
7. Mission results: 3/8, 8/8, no-award replay and max 8/8 never misreport gains.
8. 10×7 and 8×5, compact viewport, reduced-motion, sticky battle dock, accessible touch, clear RED telegraphs, no hidden target tiles.
9. Retest guest/login recovery, resume round1, account-safe reset, and save-failure paths.
**STOP SHIP** for wrong amounts, fake interrupt/heal, active-run mastery leakage, extra slots, obstructed taps or CI/build failure.

## 8. Final status discipline
This document is design specification + implementation candidate. GitHub PASS does not establish that animations look and feel premium on S26 Ultra. Ship only after CI then merge to allow real-device test, then mark VERIFIED after accepted QA. No automatic merge.
