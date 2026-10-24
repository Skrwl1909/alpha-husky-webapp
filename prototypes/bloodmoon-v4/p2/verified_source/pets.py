# Isolated reviewed excerpts. See ../source-manifest.json.
from __future__ import annotations
from typing import Any, Dict, List, Tuple, Optional

# Original pets.py:1199-1199
PET_STAT_KEYS_LONG = ["strength", "agility", "defense", "vitality", "luck", "intelligence"]

# Original pets.py:1315-1383
def compute_pet_effective_stats(pet: dict | None) -> dict:
    """
    Canonical pet stats:
      seed(BASE_STATS[type]) + capped(training_delta_from_saved_base) + level_bonus + damped_legacy_bonus_stats
    Returns ONLY long keys.
    """
    if not isinstance(pet, dict) or not pet:
        return {k: 0 for k in PET_STAT_KEYS_LONG}

    pet_type = str(pet.get("type") or "husky").lower()
    seed_raw = BASE_STATS.get(pet_type) or BASE_STATS.get("husky") or {}
    seed = norm_pet_stats(seed_raw)

    saved_base = norm_pet_stats(pet.get("base_stats") or pet.get("stats") or {})
    allocated = norm_pet_stats(pet.get("allocated_stats") or {})
    lvl = max(1, _to_int(pet.get("level", 1), 1))
    steps = _pet_growth_steps(lvl)

    # training delta = (saved_base - seed), but capped (prevents runaway from old RNG systems)
    # cap grows slowly with level
    cap_off_max = _to_int(os.environ.get("PET_TRAINING_CAP_OFF_MAX", "10"), 10)
    cap_vit_max = _to_int(os.environ.get("PET_TRAINING_CAP_VIT_MAX", "6"), 6)

    cap_off = min(cap_off_max, 2 + steps // 10)   # lvl50 -> ~6
    cap_vit = min(cap_vit_max, 1 + steps // 15)   # lvl50 -> ~3-4

    training = {}
    for k in PET_STAT_KEYS_LONG:
        delta = max(0, _to_int(saved_base.get(k, 0), 0) - _to_int(seed.get(k, 0), 0))
        delta = max(0, delta - max(0, _to_int(allocated.get(k, 0), 0)))
        if k == "vitality":
            training[k] = min(delta, cap_vit)
        else:
            training[k] = min(delta, cap_off)

    # legacy bonus_stats damping (old system): keep a LITTLE, but never insane VIT
    legacy_scale_off = float(os.environ.get("PET_LEGACY_BONUS_SCALE_OFF", "0.15") or 0.15)
    legacy_scale_vit = float(os.environ.get("PET_LEGACY_BONUS_SCALE_VIT", "0.05") or 0.05)
    legacy_cap_off   = _to_int(os.environ.get("PET_LEGACY_BONUS_CAP_OFF", "8"), 8)
    legacy_cap_vit   = _to_int(os.environ.get("PET_LEGACY_BONUS_CAP_VIT", "4"), 4)

    legacy_raw = norm_pet_stats(pet.get("bonus_stats") or {})
    legacy = {k: 0 for k in PET_STAT_KEYS_LONG}
    for k in PET_STAT_KEYS_LONG:
        b = _to_int(legacy_raw.get(k, 0), 0)
        if not b:
            continue
        s = legacy_scale_vit if k == "vitality" else legacy_scale_off
        add = int(round(b * s))
        if k == "vitality":
            legacy[k] = min(add, legacy_cap_vit)
        else:
            legacy[k] = min(add, legacy_cap_off)

    # level growth by archetype
    arena_type = get_pet_arena_type(pet).lower()
    level_bonus = _pet_level_bonus(lvl, arena_type)

    out = {k: 0 for k in PET_STAT_KEYS_LONG}
    for k in PET_STAT_KEYS_LONG:
        out[k] = max(0,
            _to_int(seed.get(k, 0), 0)
            + _to_int(training.get(k, 0), 0)
            + _to_int(allocated.get(k, 0), 0)
            + _to_int(level_bonus.get(k, 0), 0)
            + _to_int(legacy.get(k, 0), 0)
        )

    return out
