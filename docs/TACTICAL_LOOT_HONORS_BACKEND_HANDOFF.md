# Tactical Ops Loot & Honors V1 — backend handoff

**Current status:** frontend-only presentation; no new awards are granted until the Python backend is updated. Existing receipts and saved results remain valid.

## Implement the first backend step

Extend the **existing** `/webapp/tactical-foundation/mission/continue` success response with optional **top-level** `lootAndHonors` (camelCase). The current frontend also accepts the same optional field nested under `fieldResult` and `campaignResult`, or attached to a saved Broken Signal `storySave` from a successful continuation. No new endpoint is needed. Never replace the current `fieldResult`, `campaignResult`, `chapterResult`, `state`, `firstClear`, `rewardMilestone`, `xpGranted` or `bonesGranted` fields.

Only return an actual receipt after a **durable, transactionally confirmed** victory and successful grant. The backend must decide reward eligibility (including modes with intentionally zero rewards), item RNG, loot tables, rarity, actual item stack quantities, inventory capacity, currency, Badge Wall unlocks and cosmetics ownership. Keep the current guaranteed rewards intact. Never use a frontend/client battle report alone as grant authority.

### Proposed wire format

```json
{
  "lootAndHonors": {
    "version": 1,
    "status": "CONFIRMED",
    "receiptId": "tops_rec_server_unique_123",
    "runId": "field_recover_v1_server_run",
    "missionId": "field-relay-recovery",
    "victory": true,
    "currencies": [
      {"kind": "exp", "amount": 8},
      {"kind": "bones", "amount": 16},
      {"kind": "scrap", "amount": 12},
      {"kind": "rune_dust", "amount": 0}
    ],
    "equipment": [
      {
        "grantId": "tops_grant_item_123",
        "itemId": "rustfang_fangs",
        "name": "Rustfang Fangs",
        "slot": "fangs",
        "rarity": "uncommon",
        "quantity": 1,
        "imageUrl": "assets/equip/rustfang_fangs.png",
        "stats": {"STR": 3},
        "equipped": {
          "itemId": "equipped_fangs_key",
          "name": "Equipped Fangs",
          "stats": {"STR": 2}
        }
      }
    ],
    "unlocks": [
      {
        "grantId": "tops_grant_badge_123",
        "type": "badge",
        "id": "tops_first_contact",
        "name": "First Contact",
        "rarity": "common",
        "imageUrl": "assets/tactical-honors/tops_first_contact.svg"
      }
    ]
  }
}
```

The above is a **contract example**, not a real player transaction and not a production drop table.

- `receiptId` and each `grantId` are stable, server-generated IDs (1–128 characters, `[A-Za-z0-9_:.-]`); unique per grant in the receipt; `runId` and `missionId` must match the confirmed run. Positive safe-integer `quantity`; currency `amount` is a nonnegative integer actually awarded, not the new account balance.
- Equipment `slot`: `weapon|armor|fangs|cloak|collar|helmet|ring|offhand|gloves`. `rarity`: `common|uncommon|rare|epic|legendary`.
- Currency `kind`: `exp|bones|scrap|rune_dust`. Exactly one entry per currency kind; zero entries are fine. The contract's currency array must describe the **entire** currency payout for the run, not only the newly added loot, because the extended frontend replaces the legacy **presentation** once this receipt is valid. Preserve existing legacy amounts in the response for older clients.
- Optional equipment `stats` and `equipped.stats` must use real authoritative gear snapshot values; omit rather than guess. An item-art URL must match trusted in-project relative asset paths or approved production asset hosts. Unknown artwork has a graceful fallback.
- Unlock `type`: `badge|frame|skin|aura|title`. Only include newly granted entitlement IDs persisted by their existing owning systems. Do not emit speculative unimplemented concepts.
- `status: "REPLAYED"` + matching `receiptId` for an already settled transaction: the client shows *previously recorded*, no new loot reveal. The server MUST be idempotent even if a client repeats the POST with the same request ID or run ID.
- Absence of `lootAndHonors` preserves the current legacy Results entirely. Do not return pending data as `CONFIRMED`. Pending or failed savings carry no new grant receipt.

## Achievement and cosmetics authority

The eight proposed badge keys are in `tactical-ops-src/data/tacticalHonors.ts`: `tops_first_contact` (1 win), `tops_field_hunter` (5), `tops_battle_hardened` (10), `tops_signal_reaper` (25), `tops_fracture_veteran` (50), `tops_warborn_alpha` (100), `tops_commander_slayer` (Signal Commander defeat), `tops_no_one_left_behind` (winning with every squad member standing). Do not reuse legacy reserved badges. Server must clarify eligible battle modes and count victories once per accepted run.

The Gallery is **display-only**. To turn it into an authoritative collection, add these records to existing `/webapp/badges/state` with `key`, `name`, `description`, `rarity`, `owned`, `progress:{current,target,label}`, and optionally `iconUrl`/`emblemUrl`. Artwork fallback already resolves the new badge keys for server-issued Badge Wall rows. Existing Badge Wall equip/feature endpoints remain unchanged.

The frame concepts `tops_broken_signal_frame` and `tops_fracture_vanguard_frame` should only be implemented after wiring server entitlement and the existing profile-frame selection mechanism. The same applies to title concepts Relay Hunter and War Table Legend, Signalborn Aura, and Warborn Alpha Skin. Assets for unfinished skin/aura are **not** registered as claimable rewards.

## Server-side acceptance checks

Transactional grant + persistence in the current per-user lock, atomic inventory/currency/badge/cosmetic update, and durable receipt written in the same settlement; duplicate request/run returns stable replay outcome with no re-grant. Cross-user and cross-run receipts rejected. Controlled drops from existing item catalog only; validation of item quantities, inventory capacity and item ownership. Verify first clear vs repeat clear, defeats, training, Last Howl, legacy clients, and recovery after interrupted HTTP responses. Finally run a real-game smoke test using server-issued equipment + badge + one cosmetic, compare inventory and Badge Wall state after a refresh.
