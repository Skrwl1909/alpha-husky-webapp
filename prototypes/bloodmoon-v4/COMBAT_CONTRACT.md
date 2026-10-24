# Production contract inspection — read only

Inspected at P0 base `ec4b64476cde4975c8b87c2db3aa172c6164bbe2`. This records the **frontend consumer contract**, not a verified backend schema or damage formula. No live API calls were made.

## Verified production references

- `js/bloodmoon.js:1945` delegates `call(path,payload)` to the injected `apiPost`; `:3103` requests `/webapp/bloodmoon/state` with `{}` and expects `res.ok === true` plus `res.data`. The stored last battle is `data.lastBattle`, with `_lastResolvedBattle` as another frontend source (`:1951`).
- `js/bloodmoon.js:3127–3161` requests `/webapp/bloodmoon/attack` with `{run_id: commandId, raidInstanceId: String(_state?.raidInstanceId || "")}`. It consumes `res.ok`, `res.reason`, `res.data`, `res.result.battle`, and `res.duplicate`. These commands belong to V3 and are **not called by V4**.
- `js/bloodmoon.js:2125–2263` / `:2266–2345` consume the following battle fields; `js/bloodmoon_pixi.js:422–480` independently normalizes the event representation:

| Meaning | Fields accepted by the existing frontend |
|---|---|
| Player HP at start/max | `left.hpStart`, `player.hpStart`, `player.hpMax`, `left.hpMax` (fallback order differs for start/max) |
| Enemy HP at start/max | `right.hpStart`, `enemy.hpBefore`, `enemy.hpMax`; max also accepts `right.hpMax` |
| End HP | `left.hpEnd`, `right.hpEnd`, `enemy.hpAfter`, or final normalized event HP |
| Event stream | `battle.turns`, otherwise `battle.events` |
| Event actor / target | `actor`, `target`, values `left` / `right` |
| Event kind | `kind` or `type`: hit, crit, block, heal, miss, tick, finish; evade normalizes to miss |
| Resolved event amount | `value`, `amount`, `damage` |
| HP after an event | `leftHpAfter` / `left_hp_after`, `rightHpAfter` / `right_hp_after`, `targetHpAfter` / `target_hp_after`, `selfHpAfter` / `self_hp_after` |
| Other event display fields | `turn` / `t`, `isCrit`, `defeat`, `label` / `text` / `message` |
| Summary fallback | `attack.damage`, `attack.crit`, `waveCleared`, `winner`, `summary.turns`, `summary.outcomeLabel` |

When no event stream exists, the frontend builds one presentation hit from the already-resolved `attack.damage`. That is a rendering fallback, **not evidence of how damage is computed**. `js/bloodmoon_pixi.js:503–507` classifies that resolved damage relative to enemy HP for visual intensity; it is not a combat formula.

The repository's `api/state.js` handles a state snapshot, not the Blood Moon attack resolver. No authoritative Blood Moon server damage calculation or level/equipment-to-damage mapping was found in this repository's relevant implementation. Backend payloads and formula are **NOT VERIFIED**. Real-account adaptation is **BLOCKED pending the authoritative resolver/schema and representative payloads**; this does not block the local P1 fixture interface.

## Isolated V4 resolved-parameter boundary

`combat-parameters.js` accepts validated, immutable, versioned resolved values:

```json
{
  "version": 1,
  "provenance": "local-fixture",
  "player": {"maxHP": 3, "damagePerHit": 1},
  "enemy": {"id": "tower_husk", "maxHP": 96, "damagePerHit": 1}
}
```

`resolved-input` is an allowed provenance for a future explicit caller; no production adapter exists. Values must be finite positive numbers (bounded at 1,000,000). The interface does not infer damage from level, equipment, armor, crit, faction or other stats. The stronger local fixture changes only player damage from 1 to 1.2; enemy HP stays 96. These fixtures are not real account data. The resolved snapshot is included in version-3 recordings and replayed independently of the current UI selection. Version-1/2 recordings remain playable with their original tuning.

## Existing artwork reused without editing

`js/bloodmoon.js:36–52` references V2 arena/atmosphere/moons and the V3 Husk idle. `js/bloodmoon_pixi.js:18–43` and `assets/bloodmoon/v3/enemies/manifest.json` identify all four Husk states and VFX. The original Husk states are 768×768 transparent images with a shared feet baseline near y=704; V4 uses that anchor, not per-state recentering. `js/dojo_room.js:19` uses the existing Howler sheet; its metadata defines 256×256 frames, four directional rows, idle column 0 and walk columns 1/2/3/2. V4 uses that metadata convention at a smaller arena scale, with an independent exact cyan collision ring. `assets.js` lists all ten file paths. Full moon is chosen for this isolated Blood Moon fight; no lunar-world state is queried.
