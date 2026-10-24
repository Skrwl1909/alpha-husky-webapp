# Isolated reviewed excerpts. See ../source-manifest.json.
from __future__ import annotations
from typing import Any, Dict, List, Tuple, Optional

# Original stats_core.py:18-18
STAT_KEYS = ["strength", "agility", "defense", "luck", "vitality", "intelligence"]

# Original stats_core.py:24-31
FRESH_PLAYER_DEFAULT_STATS = {
    "strength": 0,
    "agility": 0,
    "defense": 0,
    "luck": 0,
    "vitality": 0,
    "intelligence": 0,
}

# Original stats_core.py:42-49
SHORT_OF = {
    "strength": "str",
    "agility": "agi",
    "defense": "def",
    "vitality": "vit",
    "intelligence": "int",
    "luck": "luck",
}

# Original stats_core.py:50-50
LONG_OF = {v: k for k, v in SHORT_OF.items()}

# Original stats_core.py:53-67
def norm_stats(d: Dict[str, Any] | None) -> Dict[str, int]:
    """
    Zwraca sĹ‚ownik TYLKO z long keys (strength/agility/...), brakujÄ…ce=0.
    Akceptuje teĹĽ short keys (str/agi/def/vit/int/luck).
    """
    d = d if isinstance(d, dict) else {}
    out: Dict[str, int] = {}
    for k in STAT_KEYS:
        out[k] = _safe_int(d.get(k, d.get(SHORT_OF[k], FRESH_PLAYER_DEFAULT_STATS[k])))
    # Historical production snapshots used ``endurance`` as the HP stat.
    # Current ``vitality``/``vit`` always wins when either is actually stored;
    # otherwise map endurance once at the canonical normalization boundary.
    if d.get("vitality") is None and d.get("vit") is None and d.get("endurance") is not None:
        out["vitality"] = _safe_int(d.get("endurance"), FRESH_PLAYER_DEFAULT_STATS["vitality"])
    return out

# Original stats_core.py:70-74
def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value or 0)
    except Exception:
        return int(default)

# Original stats_core.py:149-152
def add_stats(a: Dict[str, Any] | None, b: Dict[str, Any] | None) -> Dict[str, int]:
    a = a or {}
    b = b or {}
    return {k: int(a.get(k, 0) or 0) + int(b.get(k, 0) or 0) for k in STAT_KEYS}

# Original stats_core.py:155-163
def get_active_pet_id(user: Dict[str, Any]) -> str | None:
    eq = user.get("equipped") or {}
    eq2 = user.get("equipment") or {}
    return (
        eq.get("pet")
        or eq2.get("pet")
        or user.get("active_pet_id")
        or user.get("active_pet")
    )

# Original stats_core.py:166-174
def get_active_pet(user: Dict[str, Any]):
    """
    Zwraca (pet_dict, pet_stats_long) â€” staty peta uwzglÄ™dniajÄ… level.
    """
    pets = user.get("pets", {}) or {}
    pet_id = get_active_pet_id(user)
    pet = (pets.get(pet_id) if pet_id else None) or {}
    pet_stats = compute_pet_effective_stats(pet) or {}
    return pet, norm_stats(pet_stats)

# Original stats_core.py:177-179
def get_equipment_bonus_long(user: Dict[str, Any]) -> Dict[str, int]:
    raw = get_total_equipment_bonus(user) or {}
    return norm_stats(raw)

# Original stats_core.py:182-192
def get_set_bonuses_long(user: Dict[str, Any]) -> List[Tuple[str, int, Dict[str, int]]]:
    """
    Sety pokazujemy jako INFO; totals liczymy base+pet+gear.
    """
    sets = get_active_set_bonuses(user) or []
    fixed: List[Tuple[str, int, Dict[str, int]]] = []
    for tup in sets:
        if isinstance(tup, (list, tuple)) and len(tup) == 3:
            name, count, bonus = tup
            fixed.append((str(name), int(count or 0), norm_stats(bonus)))
    return fixed

# Original stats_core.py:195-216
def compute_full_stats(user: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(user, dict):
        user = {}
    """
    Jedyny licznik:
    totals = base + pet + gear
    (sety pokazujemy w UI; nie dodajemy drugi raz)
    """
    base = norm_stats(user.get("stats"))
    pet_o, pet = get_active_pet(user)
    gear = get_equipment_bonus_long(user)
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
