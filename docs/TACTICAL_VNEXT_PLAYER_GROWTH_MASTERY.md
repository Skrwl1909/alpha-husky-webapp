# Tactical VNext — Player Growth & Mastery

Status: implementation contract, NOT shipped.

Scope: one system across all 12 Tactical Ops missions, not per-mission slices. Three allied characters (Alpha, CNC, Shadow), 3 existing skill slots A1/A2/A3, 10x7 lab, current authenticated progression and Pack Mastery.

## Player choices
Each hero has one individual discipline branch and an upgrade graph for existing A1/A2/A3 skills (base -> rank I -> rank II). At each milestone the player chooses between two distinct combat effects; show tradeoffs and prerequisites before confirmation. No extra battle buttons.

Alpha: Vanguard (guard, front-line threat counterplay) or Howlkeeper (timed squad buffs and positioning).
CNC: Pursuer (reach evasive targets) or Disruptor (interrupt locked enemy intents).
Shadow: Sentinel (protect targeted allies) or Field Medic (recovery and status mitigation).

Pack Mastery remains squad-wide and separate from individual progression. Preserve existing 0/3/8 thresholds and historical rewards. Do not double-grant.

## Server authority
Versioned per-character growth records; authenticated read, upgrade, and bounded free respec. Server validates points, prerequisites, branch exclusivity, revision and ownership. Atomic, idempotent writes; duplicate mission clear never duplicates progression. No reward on defeat or abandonment. Migrate existing accounts without resets.

CombatProfileV3 continues to provide server-derived HP/ATK/DEF/SPD. Never compute permanent stat power client-side. Battle starts with an immutable validated skill loadout snapshot; no mid-battle upgrades. HOWL remains cosmetic only.

## Shared battle integration
A single skill resolver applies authored rank effects (range, cooldown, status duration, targeting, protection, interrupts) in Broken Signal, Dead Relay and Field Ops, including replay. Preserve enemy telegraph and counterplay. Every upgrade gets deterministic positive and negative tests.

## Mobile UI
War Table -> Squad -> character -> Skillbook. One consistent screen showing current rank, available points, two disciplines, three skill slots, upgrade preview, prerequisites, confirm/cancel and lock reasons. Large tap targets and no clipping on Telegram mobile. Result screen shows earned points only after server confirmation.

## Delivery acceptance
1. Versioned persistence, migration, authenticated atomic APIs, and idempotent awards.
2. All three character trees and validated authored skill effects.
3. Unified battle resolver across all 12 missions.
4. Complete Skillbook and server-confirmed result UI.
5. CI for duplicates, replay, defeat, stale revision, respec, reconnect, and every mission.
6. Production bundle rebuilt and Telegram S26 Ultra test proves saved choice affects battle and survives relaunch.

Implementation sequence inside this one milestone: server contract -> authored upgrade data -> battle snapshot -> Skillbook UI -> full regression -> phone QA. No claim of implementation until verified.
