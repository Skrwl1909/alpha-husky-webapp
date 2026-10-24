# Isolated reviewed excerpts. See ../source-manifest.json.
from __future__ import annotations
from typing import Any, Dict, List, Tuple, Optional

# Original stats.py:13-13
STAT_KEYS = ["strength","agility","defense","luck","vitality","intelligence"]

# Original stats.py:14-17
SHORT_OF = {
    "strength":"str", "agility":"agi", "defense":"def",
    "vitality":"vit", "intelligence":"int", "luck":"luck",
}

# Original stats.py:18-18
LONG_OF = {v:k for k,v in SHORT_OF.items()}

# Original stats.py:20-26
def norm_stats(d: dict | None) -> dict:
    """Zwraca słownik TYLKO z long keys (strength/agility/...), brakujące=0."""
    d = d or {}
    out = {}
    for k in STAT_KEYS:
        out[k] = int(d.get(k, d.get(SHORT_OF[k], 0)) or 0)
    return out

# Original stats.py:28-29
def add_stats(a: dict, b: dict) -> dict:
    return {k: int(a.get(k,0)) + int(b.get(k,0)) for k in STAT_KEYS}

# Original stats.py:31-40
def get_active_pet(user: dict):
    """Zwraca (pet_dict, pet_stats_long). Staty zawsze long keys i uwzględniają level."""
    pets = user.get("pets", {}) or {}
    pet_id = (
        (user.get("equipped") or {}).get("pet")
        or (user.get("equipment") or {}).get("pet")
        or user.get("active_pet_id")
    )
    pet = pets.get(pet_id) or {}
    return pet, compute_pet_effective_stats(pet)

# Original stats.py:42-45
def get_equipment_bonus_long(user: dict) -> dict:
    """Wrapper na get_total_equipment_bonus – normalizuje do long keys."""
    raw = get_total_equipment_bonus(user) or {}
    return norm_stats(raw)

# Original stats.py:47-55
def get_set_bonuses_long(user: dict) -> list[tuple[str,int,dict]]:
    """Wrapper na get_active_set_bonuses – normalizuje bonus dict do long keys."""
    sets = get_active_set_bonuses(user) or []
    fixed = []
    for tup in sets:
        if len(tup) == 3:
            name, count, bonus = tup
            fixed.append((name, count, norm_stats(bonus)))
    return fixed

# Original stats.py:57-76
def compute_full_stats(user: dict) -> dict:
    """
    Jedyny licznik:
    totals = base + pet + gear
    (sety pokazujemy w UI, NIE dodajemy drugi raz jeśli już są w gear)
    """
    base   = norm_stats(user.get("stats"))
    pet_o, pet = get_active_pet(user)
    gear   = get_equipment_bonus_long(user)
    sets_l = get_set_bonuses_long(user)

    totals = add_stats(add_stats(base, pet), gear)
    return {
        "base": base,
        "pet": pet,
        "gear": gear,
        "totals": totals,
        "pet_obj": pet_o,
        "sets": sets_l,
    }
