# Battlefield P5 — Blackglass Relay Command

Implemented frontend milestone. **DEVICE QA PENDING.** Base: `main` at `5c6133360927f0c306540a2cb89bca8b3a0aad45`, verified again during execution. One branch: `feat/battlefield-p5-relay-command`. No merge, production deployment, global enablement, private backend changes or G1 mechanics.

## Result and design rationale

The battlefield now has one calm command surface: a stable 52px actor/objective rail (plus host top inset), the existing Frozen Relay world, one contextual cue in the unoccupied top band of the field, and a stable action dock. No new permanent row. Read, targeting, announced danger, waiting and confirmed resolution share this composition. The original image is less blackened; silhouettes, muted grid marks, cyan legal inputs and patterned danger use different shapes as well as color.

The actor card stays anchored to the actual active unit, even while another unit is inspected. Actual staged HP is used at contact. Both cards retain 44px controls, readable 11px core text and tap details inside their original rectangle; long detail lines pan horizontally. Expanding both cards no longer moves the board or creates a popup over legal cells. Full detail text is also exposed in the expanded accessible names.

`battlePresentation.ts` is a pure derived selector. It neither changes combat state nor advances timers. Priority is REACT → TARGET → event-confirmed RESOLVE → READ/WAIT. Persistent hazards and legal targeting are separate layers: targeting does not suppress danger; busy animation does not retire threats. Terminal engine outcomes end danger. The director consumes accepted ruleset identity, actual store plans and event-published floats/moments/consequences. A travelling atlas alone cannot announce a hit. The volatile `previewQueue` is deliberately omitted: the available phone surface does not justify another uncertain forecast cue.

Announced danger uses the plan's exact `impactTiles`, striped outlines, `!` and numbered sources. V1 fails closed against stale VNext plans. “Interrupt available” requires the active frozen CNC Disruptor doctrine, a ready qualifying status skill and a legal target that actually owns a locked plan. The capability predicate is checked against actual engine casts/cancellation in the director tests. It is availability, never a success claim. Other actors receive neutral or legally possible movement guidance. No invented enemy intent or predicted damage.

Each grid/unit input now occupies a bounded footprint inside its projected cell. Unit inputs are siblings at the actual cell anchor, rather than rectangles offset within tall sprites. Pointer-down still routes through the existing store methods. Keyboard activation uses those same methods without replaying pointer actions. At 320px the 10-column field cannot provide 44px cells: measured minimum is approximately **21.27 × 33.86px** in the normal HOLD fixture. This is explicitly not 44px compliance. The measured overlaps are removed. An optional 44px-high legal-target strip appears below all projected rows when the field is tall enough (340px); it does not cover legal cells, add a HUD row or require a global second tap. Its buttons use the same legal target IDs, and click activation permits native horizontal scrolling.

Existing atlases and contact timing remain authoritative. The interrupt atlas replaces the parallel pressure atlas and inherits its already scheduled contact duration; a redundant mastery burst and duplicate contact ring no longer replay over an existing atlas. Confirmed numbers and actual consequences remain. Enemy contact retains its existing fallback impact. Healing is shown only for positive engine restoration. Actual control cancellation is distinct from ordinary pressure. The live objective summary/RECOVER atlas tracks actual advancement. Reduced motion retains static textual and shape cues without moving tokens, pulsing hazards or losing outcomes.

**V1 GUARD truth limitation:** the current event contract does not emit prevented-damage evidence. P5 uses the safe `GUARD ACTIVE` caption and the real applied-status atlas. It does not fabricate a prevention amount or import G1's new evidence. Verified prevention-specific telemetry remains a separate contract limitation, not a claimed P5 feature.

## Scope

- Runtime: `ui/Battle.tsx`, new `ui/battlePresentation.ts`, battle section of `tactical.css`, `ui/combatCohesion.css`, neutral caption in `ui/combatConsequences.ts`.
- Canonical release: `version.ts`, generated `js/tactical_ops.js`, `js/boot_loaders.js`; version/cache `3.5.20-battlefield-p5`.
- Tests: pure director test, real component/store/engine browser runner and isolated fixture, two updated legacy source-location assertions, P5 CI and npm aliases.
- Evidence: this report and `docs/qa/battlefield-p5/`.

Combat formulas, enemy AI, initiative, legal targeting, movement, statuses, ranks, rewards, ownership, receipts, accepted snapshots, progression parsing, App/Atlas/Skillbook and store logic are unchanged. No artwork was generated.

## Reproduction and evidence

```sh
npm install --no-audit --no-fund
npm install --no-save --package-lock=false playwright@1.64.1
# Supply a working Chromium binary, or install Playwright's matching browser.
CHROMIUM_EXECUTABLE=/path/to/chrome npm run verify:tactical-ops:p5:browser
npm run verify:tactical-ops:p5
npm run build:tactical-ops
node --check js/tactical_ops.js
```

The fixture mounts the real BattleScreen/host CSS and actual store methods. Grid selection uses accepted V1/VNext rules; threat plans come from the real scheduler. Seeded enemy positions/hasMoved/cooldowns describe an already positioned encounter, not a claim of a played opening. The host mirrors production `ensureBattlefieldGeometry` and the real layout resolver. Baseline was captured before production edits on the recorded main SHA. The same seed scenes are used after: V1 HOLD, VNext HOLD/one threat, INTERCEPT/two threats and RECOVER. The isolated RECOVER negative case adds the authored signal-interference directive. No backend is called.

[Before measurements](qa/battlefield-p5/before/results.json) · [After measurements + state checks](qa/battlefield-p5/after/results.json) · [Comparison](qa/battlefield-p5/comparison.json) · [All command results](qa/battlefield-p5/regression-results.json) · [Command output](qa/battlefield-p5/engineering-checks.txt).

The screenshot sequence [READ](qa/battlefield-p5/after/sequence-1-read.webp) → [TARGET](qa/battlefield-p5/after/sequence-2-target.webp) → [REACT](qa/battlefield-p5/after/sequence-3-react.webp) → [RESOLVE](qa/battlefield-p5/after/sequence-4-resolve.webp) uses genuine `trySkill`, scheduler announcements and `resolveEnemyThreat` events through an isolated manual fixture transport. [Exact events/HP/turns](qa/battlefield-p5/after/interaction-sequence.json). It is an equivalent interaction capture, **not live server/device video**. Separate checks exercise actual production store pointer/move/cancel/skip/RECOVER and duplicate-input paths.

## Measured acceptance

See the exact rectangles and all hitboxes in the JSON; no interpolated values. The 28 viewport/objective captures have zero after-overlaps, zero covered live input centers and no horizontal page overflow. Dock controls are at least 44×44px; field cells are intentionally smaller and disjoint. Target mode and expanded HUD are measured separately.

| HOLD fixture viewport | Board before → after (W×H) | Overlapping pairs before → after | Covered centers before → after |
| --- | --- | --- | --- |
| 320×568 | 320×443 → 320×444 | 23 → 0 | 3 → 0 |
| 360×780 | 360×655 → 360×656 | 18 → 0 | 0 → 0 |
| 390×844 | 390×719 → 390×720 | 18 → 0 | 0 → 0 |
| 430×932 | 430×807 → 430×808 | 9 → 0 | 0 → 0 |
| 390×400 | 390×275 → 390×276 | 48 → 0 | 7 → 0 |
| 390×700 + insets | 390×519 → 390×520 | 23 → 0 | 3 → 0 |
| 780×360 + insets | 780×181 → 780×180 | 21 → 0 | 9 → 0 |

The narrow landscape raw board is 1px shorter because the dock is normalized; this is the only captured size reduction and is disclosed for review. In normal phone cases the board gains 1px. The before threat panel could move the dock above the board's bottom; after the dock is stable with and without threats. At 390px, opening both before HUD cards moved the board from y=52 to y≈150.98; after it remains y=52 with identical board/dock rectangles. The short landscape cells remain small (about 13.72px tall): this is precision input geometry, not a physical-device usability certification.

Local timing uses Chromium 153.0.8010.0 / Playwright 1.64.1, headless Linux, 39 requestAnimationFrame intervals per idle/FX sample. Before and after samples both recorded median≈16.7ms and p95≈16.8ms. These short samples do not establish universal 60fps, WebView performance, input latency or population-level usability. No new engine wait, hitstop or camera movement was added.

| Acceptance area | Evidence / status |
| --- | --- |
| Actual active actor, staged HP, objective/progress, target/no-target, cooldown and cancel | PASS — browser + pure tests |
| V1 8×5 / VNext 10×7, one/multiple plans, cancellation/retention/resolution | PASS — actual engine fixture + browser |
| HOLD, INTERCEPT courier/exit, RECOVER open/jammed and activation | PASS — browser; 12-mission engine matrix |
| Interrupt legally available versus absent; actual cancellation | PASS — browser capability + engine equivalence tests |
| SHADOW heal/no-op, WARDEN status; PET present/absent/broken portrait | PASS — real engine/definition fixtures; prevention claim intentionally withheld |
| Enemy/busy, Alpha down/allies alive, reinforcement announcement/spawn, victory/loss | PASS — isolated browser state checks |
| Valid movement/target, invalid coordinate/target, repeated target while busy, skip, board cancel | PASS — actual production store handlers |
| Expanded details, safe insets, reduced motion, forced colors, larger host font, mute | PASS — Chromium emulation; no VoiceOver/TalkBack certification |
| All available non-browser Tactical scripts | PASS — 50/50 commands (including 12-mission simulation and grid benchmark) |
| Existing Atlas browser suite | PASS — 17 scenario groups; current UI regression protection |
| Canonical syntax/build/repeat hash and loader/version | PASS — see build verification evidence |
| Hosted CI | Final-head check results and run links are recorded in the Draft PR; no inference from local checks |
| S26 Ultra Telegram + standalone Android | **DEVICE QA PENDING** |
| iPhone 13 / actual iOS WebKit | **DEVICE QA PENDING** |
| Human comprehension, unintended finger taps and time to first intended legal action | **PENDING human testing**; no human result invented |
| Live account persistence/replay/resume | Existing regressions pass; **live/device QA pending**, no server writes performed |

The 136/136 scripted victories across all twelve current mission scenarios are engine regression evidence, not a difficulty or retention claim. The matrix and its losses/stalls fields are retained in [simulation report](qa/battlefield-p5/tactical-s2-full-combat.json).

### Missing legacy aliases

`npm run verify:tactical-ops:combat` and `npm run verify:tactical-ops:pack-mastery` were attempted and fail because main does not contain their referenced scripts. The aggregate `verify:tactical-ops` therefore cannot complete. Static inventory also finds absent legacy script targets for field-ops, foundation, persistence, operation, recover, responsive, commander, squad and evergreen aliases. None is reported PASS or replaced with a token stub. Actual available intent/scheduler/snapshot/growth/mastery/FX/UI/simulation gates ran individually; exact commands are in the results JSON.

## G1 #201 integration / release HOLD

Verified #201 remains a separate Draft on `8bedb2f0c9f97c632465cadbb9dbead5989f5f55`, private-backend V2 acceptance HOLD. No cherry-pick or mechanical inclusion.

The exact direct file intersection at inspection is **`package.json`, `tactical-ops-src/version.ts`, `js/boot_loaders.js`, `js/tactical_ops.js`**. P5 does not touch G1's engine, store, App, growth or Fieldcraft files. Nevertheless G1 changes the skill/status/event interpretations consumed by P5, so source compatibility still needs combined tests. In particular, its new GUARD evidence must be deliberately integrated later; the current V1-neutral caption must not become an unverified numeric prevention claim.

Whichever merges second must rebase onto the newly merged main, reconcile npm scripts and the single source version/cache key, rebuild the canonical bundle/loader from combined source, and run **both** P5 and G1 suites plus current regressions and accepted V1/V2 snapshot checks. Never choose one branch's generated bundle as a conflict resolution. A green P5 CI does not release G1's private-backend HOLD.

Owner acceptance remains required: one actual S26 Ultra Telegram and standalone Android encounter, target/cancel/move/skip/RECOVER negatives, save/resume/replay, busy spam taps, real chrome/safe areas, reduced motion, and separate iPhone 13 testing. Ask a human who acts, which numbered source threatens which striped cells, which action/target is legal, and what changed. Record errors and timing without inventing a retention uplift. This branch remains Draft; nothing is authorized here for merge/deploy.
