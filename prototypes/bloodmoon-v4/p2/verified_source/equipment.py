# Isolated reviewed excerpts. See ../source-manifest.json.
from __future__ import annotations
from typing import Any, Dict, List, Tuple, Optional

# Original equipment.py:37-136
SET_BONUSES = {
    "Lunar Howl": {
        2: {"agility": 1},
        4: {"agility": 2, "luck": 2},
        6: {"strength": 3, "vitality": 2},
        9: {"strength": 5, "defense": 3, "luck": 3},
    },
    "Ash Founder": {
        2: {"strength": 1, "defense": 1},
        4: {"strength": 2, "defense": 2},
        6: {"strength": 4, "vitality": 2},
        9: {"strength": 6, "defense": 5, "luck": 2},
    },
    "Stormhowl": {
        2: {"agility": 1, "intelligence": 1},
        4: {"agility": 2, "luck": 1},
        6: {"intelligence": 2, "vitality": 3},
        9: {"agility": 4, "intelligence": 3, "strength": 2, "luck": 2},
    },
    "Frostborn": {
        2: {"defense": 2},
        4: {"defense": 3, "vitality": 1},
        6: {"vitality": 3, "strength": 2},
        9: {"defense": 5, "vitality": 4, "strength": 3},
    },
    "Obsidian Pulse": {
        2: {"intelligence": 1, "agility": 1},
        4: {"agility": 2, "intelligence": 2},
        6: {"defense": 2, "vitality": 2, "intelligence": 1},
        9: {"intelligence": 4, "agility": 3, "luck": 2, "defense": 2},
    },
    "Glitchborne": {
        2: {"luck": 2, "agility": 1},
        4: {"agility": 3, "luck": 2},
        6: {"intelligence": 3, "strength": 2, "agility": 1},
        9: {"luck": 5, "agility": 4, "defense": 3, "intelligence": 2},
    },
    "Obsidian Nomad": {
        2: {"agility": 1, "luck": 1},
        4: {"agility": 2, "defense": 1},
        6: {"strength": 2, "luck": 2},
        9: {"agility": 4, "luck": 3, "vitality": 2, "strength": 2},
    },
    "Scrap Nomad": {
        2: {"strength": 1, "defense": 1},
        4: {"strength": 2, "defense": 2},
        6: {"strength": 3, "vitality": 2},
        9: {"strength": 5, "defense": 4, "agility": 2},
    },
    "Rustfire Seraph": {  # Najmocniejszy set â€“ bonusy najwyĹĽsze, fokus na strength/defense/agility/vitality
        2: {"strength": 2, "defense": 1},
        4: {"strength": 3, "defense": 2, "agility": 2},
        6: {"strength": 4, "defense": 3, "vitality": 3, "agility": 2},
        9: {"strength": 7, "defense": 6, "agility": 5, "vitality": 4, "luck": 2},
    },
    # === NAJNOWSZE SETY â€“ Astral Voidfang NAJMOCNIEJSZY ===
    "Astral Voidfang": {
        2: {"intelligence": 2, "agility": 2},
        4: {"strength": 4, "agility": 3, "luck": 2},
        6: {"defense": 5, "vitality": 4, "strength": 4},
        9: {"strength": 9, "agility": 7, "defense": 6, "vitality": 5, "intelligence": 4, "luck": 3},
    },
    "Rusted Omen": {
        2: {"strength": 2, "defense": 1},
        4: {"strength": 3, "defense": 3, "vitality": 2},
        6: {"strength": 5, "defense": 4, "vitality": 4},
        9: {"strength": 10, "defense": 9, "vitality": 7},
    },
    "Umbral Singularity": {
        2: {"strength": 2, "intelligence": 2},
        4: {"strength": 4, "intelligence": 3, "agility": 2},
        6: {"defense": 5, "vitality": 4, "strength": 4},
        9: {"strength": 9, "agility": 7, "defense": 6, "vitality": 5, "intelligence": 4, "luck": 3},
    },
    "Rad-Core Overdrive": {
        2: {"agility": 2, "intelligence": 2},
        4: {"agility": 4, "intelligence": 3, "vitality": 2},
        6: {"agility": 6, "intelligence": 4, "vitality": 3},
        9: {"agility": 10, "intelligence": 8, "vitality": 7, "defense": 5, "strength": 3, "luck": 2},
    },

    "Eclipse Raider": {
        2: {"agility": 2, "strength": 1},
        4: {"agility": 4, "luck": 2},
        6: {"strength": 5, "agility": 4, "defense": 3},
        9: {"strength": 8, "agility": 7, "defense": 5, "luck": 4, "vitality": 3, "intelligence": 3},
    },
    "Fracture Sentinel": {
        2: {"defense": 2, "intelligence": 1},
        4: {"defense": 3, "vitality": 2, "intelligence": 2},
        6: {"strength": 4, "defense": 3, "vitality": 3, "intelligence": 2},
        9: {"defense": 9, "intelligence": 6, "vitality": 5, "strength": 5, "agility": 4, "luck": 2},
    },
    "Kintsugi Overlord": {
        2: {"agility": 4, "strength": 2},
        4: {"agility": 6, "strength": 5, "defense": 4},
        6: {"agility": 8, "strength": 7, "defense": 6, "vitality": 5},
        9: {"agility": 15, "strength": 11, "defense": 10, "vitality": 8, "intelligence": 4, "luck": 2},
    },
}

# Original equipment.py:140-151
EQUIPMENT_SLOTS = [
    {"slot": "weapon",   "label": "Weapon",      "level_req": 1,  "desc": "Main offensive item."},
    {"slot": "armor",    "label": "Armor",       "level_req": 1,  "desc": "Body protection."},
    {"slot": "cloak",    "label": "Cloak",       "level_req": 1,  "desc": "Agility/magic item."},
    {"slot": "collar",   "label": "Collar",      "level_req": 1,  "desc": "Special talisman."},
    {"slot": "fangs",    "label": "Fangs",       "level_req": 1,  "desc": "Precision bite augment."},
    {"slot": "pet",      "label": "Pet",         "level_req": 1, "desc": "Companion bonus."},
    {"slot": "helmet",   "label": "Helmet",      "level_req": 1, "desc": "Head protection."},
    {"slot": "ring",     "label": "Ring",        "level_req": 1, "desc": "Stat booster."},
    {"slot": "offhand",  "label": "Offhand",     "level_req": 1, "desc": "Secondary item."},
    {"slot": "gloves",     "label": "gloves",        "level_req": 1, "desc": "Magical enhancer."}
]

# Original equipment.py:677-689
def ensure_equipment_data(user: dict):
    """
    Upewnia siÄ™, ĹĽe kaĹĽdy zaĹ‚oĹĽony item ma wpis w equipment_data
    (z kopiami bazowych statĂłw), ĹĽeby upgrade miaĹ‚ na czym pracowaÄ‡.
    """
    eq = user.get("equipment", {}) or {}
    eqd = user.setdefault("equipment_data", {})
    for slot, item_key in eq.items():
        if not item_key:
            continue
        if item_key not in eqd:
            base_bonus = ALL_ITEMS.get(item_key, {}).get("stat_bonus", {}).copy()
            eqd[item_key] = {"level": 1, "stat_bonus": base_bonus}

# Original equipment.py:691-701
def get_item_effective_bonus(user: dict, item_key: str) -> dict:
    """
    Zwraca efektywny bonus itemu:
    - jeĹ›li istnieje wpis w equipment_data[item_key]['stat_bonus'], zwrĂłÄ‡ to (juĹĽ zawiera bazÄ™ + upgrady)
    - inaczej zwrĂłÄ‡ bazowe staty z ALL_ITEMS
    """
    eqd = user.get("equipment_data", {})
    upgraded = (eqd.get(item_key) or {}).get("stat_bonus")
    if upgraded:
        return upgraded
    return ALL_ITEMS.get(item_key, {}).get("stat_bonus", {})

# Original equipment.py:808-811
ALIASES_EQ = {
    "strength": "str", "agility": "agi", "defense": "def",
    "vitality": "vit", "intelligence": "int", "luck": "luck",
}

# Original equipment.py:848-855
def _mirror_keys_eq(d: dict) -> dict:
    out = {k: int(v) for k, v in (d or {}).items()}
    for long_, short in ALIASES_EQ.items():
        if long_ in out and short not in out:
            out[short] = out[long_]
        if short in out and long_ not in out:
            out[long_] = out[short]
    return out

# Original equipment.py:981-1030
def get_total_equipment_bonus(user):
    """
    Sumuje bonusy z gearu z UWZGLÄDNIENIEM upgrade'Ăłw (equipment_data),
    wspiera obie struktury: user['equipment'] i user['equipped'],
    oraz dolicza bonusy setowe (progi mogÄ… byÄ‡ int/str).
    """
    ensure_equipment_data(user)  # gwarantuje wpisy w equipment_data dla zaĹ‚oĹĽonych itemĂłw

    # akceptuj obie struktury
    equipment = user.get("equipment") or user.get("equipped") or {}
    total_bonus = {}
    set_counts = {}

    # 1) bonusy z itemĂłw (z upgradeâ€™ami)
    for slot, item_key in (equipment or {}).items():
        if not item_key:
            continue

        # efektywny bonus (preferuj equipment_data -> stat_bonus; fallback: ALL_ITEMS)
        eff = get_item_effective_bonus(user, item_key) or {}
        eff = _mirror_keys_eq(eff) if callable(globals().get("_mirror_keys_eq")) else eff

        for stat, value in eff.items():
            try:
                v = int(value)
            except (TypeError, ValueError):
                v = 0
            total_bonus[stat] = total_bonus.get(stat, 0) + v

        # policz element setu
        base_item = ALL_ITEMS.get(item_key) or {}
        set_name = base_item.get("set")
        if set_name and str(slot or "").lower() != "pet":
            set_counts[set_name] = set_counts.get(set_name, 0) + 1

    # 2) bonusy setowe (obsĹ‚uga progĂłw int/str)
    for set_name, count in set_counts.items():
        thresholds = SET_BONUSES.get(set_name, {}) or {}
        for need, bonus in thresholds.items():
            need_i = int(need) if not isinstance(need, int) else need
            if count >= need_i:
                bonus_m = _mirror_keys_eq(bonus) if callable(globals().get("_mirror_keys_eq")) else bonus
                for stat, plus in (bonus_m or {}).items():
                    try:
                        p = int(plus)
                    except (TypeError, ValueError):
                        p = 0
                    total_bonus[stat] = total_bonus.get(stat, 0) + p

    return total_bonus

# Original equipment.py:1032-1060
def get_active_set_bonuses(user):
    """
    Zwraca listÄ™ bonusĂłw setowych, np.:
    [("Lunar Howl", 4, { "agility": 2, "luck": 2 })]
    """
    equipment = user.get("equipment", {})
    equipment_items = ALL_ITEMS
    set_counts = {}

    # policz sztuki setu
    for slot, item_key in equipment.items():
        item = equipment_items.get(item_key)
        if item and "set" in item and str(slot or "").lower() != "pet":
            set_name = item["set"]
            set_counts[set_name] = set_counts.get(set_name, 0) + 1

    active_bonuses = []
    for set_name, count in set_counts.items():
        if set_name in SET_BONUSES:
            # sprawdzamy najwyĹĽszy aktywny prĂłg
            applied = {}
            for threshold, bonus in sorted(SET_BONUSES[set_name].items()):
                if count >= threshold:
                    for stat, val in bonus.items():
                        applied[stat] = applied.get(stat, 0) + val
            if applied:
                active_bonuses.append((set_name, count, applied))

    return active_bonuses
