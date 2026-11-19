# ALPHA HUSKY — COUNTERSTRIKE / TACTICAL STORY LITE V1

Status: **PR #315 MERGED; activation/layout follow-up enables host default ON, pending its separate frontend release and device QA**.

## Player journey

1. The existing War Table / GHOST SIGNAL RECON 3/3 and Broken Signal server eligibility remain authoritative. No new unlocks.
2. On the first eligible mission brief opened in this browser tab, show the 3.2-second key-art transmission (SKIP always available). Reduced-motion viewers go directly to the regular brief with a static art plate. A resumed accepted run never forces the intro.
3. On completion or SKIP, the existing squad picker, Intel explanation and `DEPLOY FALSE RELAY` button remain untouched. Starting a battle still requires the existing authenticated backend acceptance.
4. During battle, a 1.15-second HOUND cue is shown **only for a newly observed server-authored radio string**: `HOUND reinforcement 1 entered. Relay approach under pressure.` or `HOUND reinforcement 2 entered. Relay approach under pressure.`. On reload, the already loaded radio transcript is used as baseline, so no historical arrival is re-announced.
5. Results have an approximately two-second cosmetic art reveal, only for a `SERVER_COMMAND_WORKER`-verified False Relay result. Victory: `SIGNAL HELD` / `SOURCE UNKNOWN`. Defeat: `POSITION LOST`. The regular outcome, Intel accounting and next CTA remain intact.

The source of the SIGNAL COURIER transmission, HOUND allegiance and Fracture cause remain unknown. No rewards, Archive entry, Chapter 7/Signal 009 or Gravebound connection are introduced.

## Files

- `tactical-ops-src/ui/CounterstrikeStory.tsx` — three read-only render components.
- `tactical-ops-src/ui/counterstrikeStoryModel.ts` — feature switch, timing, verified-event guards.
- `tactical-ops-src/ui/counterstrikeStory.css` — independently scoped visuals, reduced motion, 320-px compact layout.
- `images/tactical_ops/presentation/false_relay_mission_keyart_v1.webp` — 864×1536 optimized true WebP sourced from the approved art (about 85 KB). No AI video required.
- `tactical-ops-src/ui/Counterstrike.tsx`, `tactical-ops-src/styles.ts` — presentation hooks only.
- `tactical-ops-src/version.ts`, `js/tactical_ops.js`, `js/boot_loaders.js` — synchronized generated production bundle and cache marker.
- `tools/verify_tactical_counterstrike_story_lite.mjs` — static/SSR narrative and authority gates.
- `tools/verify_tactical_counterstrike_browser.mjs` — extended optional visual E2E on 320/390/430, including disabled motion, first-play SKIP/REPLAY, two server HOUND waves and recorded victory.

## Activation and rollback

The Counterstrike Story Lite activation follow-up sets this boolean in `js/boot_loaders.js` **before** `js/tactical_ops.js` loads, when the host has not provided an explicit choice:

```js
window.__AH_TACTICAL_STORY_LITE_V1__ = true; // now the boot-loader default
```

For an immediate host-side visual rollback, set `window.__AH_TACTICAL_STORY_LITE_V1__ = false` **before** opening Tactical Ops (or before the boot loader). Explicit `false` is respected. This switch is visual only; it has no authority to accept commands, modify Intel, finish runs or pay rewards.

Counterstrike briefing and Results now use dedicated scrolling containers and Telegram chrome clearance. This addresses short Telegram Desktop windows and top/bottom mobile navigation overlays without changing other missions.

The private backend flag `TACTICAL_COUNTERSTRIKE_V1` is separate. The owner reported production installation and a first verified False Relay clear after explicitly waiving the unavailable VPS staging test gate. That waiver is not a staging GO and must not be described as such. Frontend deployment and real-device visual QA remain separate acceptance steps.

## Verification commands

```sh
npm install --no-audit --no-fund --package-lock=false
node tools/verify_tactical_counterstrike_story_lite.mjs
node tools/verify_tactical_counterstrike.mjs
npm run build:tactical-ops
node --check js/tactical_ops.js
git diff --exit-code -- js/tactical_ops.js js/boot_loaders.js
```

The final `git diff` parity check is meant **after committing the generated bundle**, as on the existing Counterstrike CI. For local browser verification, install Playwright and run:

```sh
CHROMIUM_EXECUTABLE=/usr/bin/google-chrome node tools/verify_tactical_counterstrike_browser.mjs
```

Complete device QA on 320/390/430 CSS px, including short 320×568 screens, Telegram WebView, Android Chrome and iPhone Safari. Verify SKIP/REPLAY, intro once per tab, resume without forced repeat, both HOUND arrival timings (3/5 vs 4/6), victory/defeat, refresh during accepted runs, no duplicate Pack Comms, and source unknown wording.

## Release boundary

This is one Counterstrike-only vertical slice, not a global Tactical Ops theme. Merge/release this activation follow-up through normal frontend CI, visually verify desktop and mobile before calling it accepted, and use the host-side `false` rollback for visual regressions. A longer cinematic remains optional Lore Archive material, not mandatory gameplay.
