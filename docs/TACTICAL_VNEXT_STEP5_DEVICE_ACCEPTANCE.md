# Tactical VNext — Step 5 device acceptance (PR #152)

Status: CODE + CI PASS, DEVICE / PLAYABILITY UNVERIFIED. Do not merge based on CI alone.

## Goal
Squad selection, existing A1/A2/A3 slots, saved teammate variants and Signal Codex must all match actual legal battle abilities. No new currencies, token power, API writes, or invented protocols.

## Current implementation
- Alpha required. Squad cap 3 for most missions; RECOVER caps at 2. PET uses one companion slot.
- Five Codex families describe only equipped authored skills. Unavailable Recon remains empty per approved D5.
- Existing A1/A2/A3 are active slots, not extra abilities. PET has A1/A2 only.
- Existing server-saved CNC/SHADOW sidegrades chosen in mission brief where unlocked. No sidegrade edits while resuming an accepted run.
- VNext Lab CNC Disruptor PRESSURE counters a queued locked intent only after actual legal status effect on its HOUND source and consumes that enemy's next activation.
- CombatProfileV3 server-frozen Alpha/PET stats at battle start; client does not invent permanent power.
- Static 12-mission matrix checks legal squad combinations and profile differentiation, not gameplay quality.

## Device acceptance sequence
1. Authenticated Telegram: compare ALPHA+CNC+SHADOW against ALPHA+CNC+PET in the same 3-slot mission. Verify squad count, slot labels, actual cooldowns, support/slow coverage and opportunity cost update. RECOVER uses 2 of 2.
2. After sidegrade unlock, choose CNC A or B and SHADOW A or B in the same brief. Verify exact skill names and effects after deploy; reopen mission and verify choices persisted. Accepted run cannot edit variants.
3. In Battlefield Lab 10x7 with server-owned CNC Disruptor discipline, select PRESSURE and hit the enemy with an announced threat. Verify exactly one queued intent canceled and HOUND loses next activation. A missed, illegal, non-disruptor or VNext-disabled action must NOT cancel.
4. Switch SHADOW for PET and observe different real decisions under same threat. Record turns, enemy action consequences and successful or failed counter.
5. Compare DEV FRESH vs developed server profile and reopen game to confirm legitimate skill ranks and HP/ATK/DEF/SPD persist without duplicated first-clear rewards.
6. Check S26 Ultra 9:16 and Telegram Desktop: no clipping, opaque overlays or inaccessible deploy controls.

## DONE / HOLD
PASS requires ability previews equal real actions, meaningful roster tradeoffs, immutable active run loadout, and accessible device UI. CI does not prove that 12/12 battles are fun, balanced or fully accepted. HOLD merge until phone evidence; fixes remain inside #152. Step 6 Mastery deferred.
