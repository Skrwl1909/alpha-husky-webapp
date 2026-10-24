# Isolated reviewed excerpts. See ../source-manifest.json.
from __future__ import annotations
from typing import Any, Dict, List, Tuple, Optional

# Original combat.py:10-19
CFG = {
    "MAX_ROUNDS": 12,
    "CRIT_BASE": 0.08, "CRIT_PER_LUCK": 0.0025, "CRIT_CAP": 0.35, "CRIT_MULT": 1.6,
    "DODGE_BASE": 0.08, "DODGE_PER_AGI": 0.0020, "DODGE_CAP": 0.35,
    "DMG_VARIANCE": 0.12, "DEF_MITIGATION": 0.55, "MIN_DMG": 1,
    "PEN_PER_INT": 0.010, "PEN_CAP": 0.50,
    "DODGE_REDUCTION_PER_INT": 0.0015,
    "DMG_REDUCTION_K": 350,      # wyższe K = słabsza redukcja (mniej tanky)
    "MIN_DMG_PCT": 0.08,         # min % ATK, który zawsze przechodzi (anti-0dmg)
}

# Original combat.py:21-21
def _clamp(x, lo, hi): return max(lo, min(hi, x))

# Original combat.py:23-27
def _pick(d: dict, *keys, default=0):
    for k in keys:
        if k in d and d[k] is not None:
            return d[k]
    return default

# Original combat.py:29-32
def compute_player_max_hp(totals: Dict) -> int:
    # HP = 50 + VIT * 12 (1:1 ze stats.py), ale VIT może mieć różne nazwy:
    vit = int(_pick(totals, "vitality", "vit", "vit_total", default=0))
    return max(1, 50 + vit * 12)

# Original combat.py:34-71
def player_from_totals(totals: Dict) -> Dict:
    STR = int(_pick(totals, "strength", "str", "str_total", default=0))
    AGI = int(_pick(totals, "agility", "agi", "agi_total", default=0))
    DEF = int(_pick(totals, "defense", "def", "def_total", default=0))
    LCK = int(_pick(totals, "luck", "lck", "luck_total", default=0))
    INT = int(_pick(totals, "intelligence", "int", "int_total", default=0))

    # policz HP z funkcji powyżej
    hp = compute_player_max_hp(totals)

    # zabezpieczenie: jeśli cokolwiek wyszło podejrzanie nisko, podnieś ostrzeżenie (dev)
    if hp <= 1:
        # wymuś co najmniej bazę 50 (żeby nie było 1 HP w boju)
        hp = 50

    # stałe jak wcześniej
    CRIT_BASE, CRIT_PER_LUCK, CRIT_CAP = 0.08, 0.0025, 0.35
    DODGE_BASE, DODGE_PER_AGI, DODGE_CAP = 0.08, 0.0020, 0.35
    PEN_PER_INT, PEN_CAP = 0.010, 0.50
    DODGE_REDUCTION_PER_INT = 0.0015
    CRIT_MULT = 1.6

    crit = max(0.0, min(CRIT_CAP, CRIT_BASE + LCK * CRIT_PER_LUCK))
    dodge = max(0.0, min(DODGE_CAP, DODGE_BASE + AGI * DODGE_PER_AGI))
    pen = max(0.0, min(PEN_CAP, INT * PEN_PER_INT))
    anti_dodge = max(0.0, INT * DODGE_REDUCTION_PER_INT)

    return {
        "atk": float(max(1, STR)),
        "def": float(max(0, DEF)),
        "critChance": float(crit),
        "critMult": float(CRIT_MULT),
        "hpMax": int(hp),
        "dodgeBase": float(dodge),
        "pen": float(pen),
        "antiDodge": float(anti_dodge),
        "resistPct": 0.0,
    }
