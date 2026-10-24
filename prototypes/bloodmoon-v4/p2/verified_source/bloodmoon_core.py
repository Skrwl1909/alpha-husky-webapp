# Isolated reviewed excerpts. See ../source-manifest.json.
from __future__ import annotations
from typing import Any, Dict, List, Tuple, Optional

# Original bloodmoon_core.py:142-146
def _safe_int(v: Any, default: int = 0) -> int:
    try:
        return int(v)
    except Exception:
        return default

# Original bloodmoon_core.py:417-420
def _default_wave_hp(wave_no: int) -> int:
    # prosta, czytelna krzywa na MVP
    # 1 => 1000, 2 => 1550, 3 => 2260 ...
    return int(1000 + (wave_no - 1) * 450 + ((wave_no - 1) ** 2) * 100)

# Original bloodmoon_core.py:423-431
def _default_wave(wave_no: int, is_active: bool = False) -> Dict[str, Any]:
    hp_max = _default_wave_hp(wave_no)
    return {
        "wave": wave_no,
        "hp": hp_max,
        "hpMax": hp_max,
        "status": "ACTIVE" if is_active else "LOCKED",
        "clearedAt": 0,
    }

# Original bloodmoon_core.py:1781-1822
def _extract_totals_from_user(user: Dict[str, Any]) -> Dict[str, int]:
    # lekki fallback â€” pĂłĹşniej moĹĽna dopasowaÄ‡ dokĹ‚adniej do twojego compute_full_stats
    totals = {}

    try:
        from stats import compute_full_stats  # type: ignore

        full = compute_full_stats(user) or {}
        raw_totals = full.get("totals") or {}
        if isinstance(raw_totals, dict):
            totals = {
                "STR": _safe_int(raw_totals.get("STR"), 0),
                "AGI": _safe_int(raw_totals.get("AGI"), 0),
                "INT": _safe_int(raw_totals.get("INT"), 0),
                "VIT": _safe_int(raw_totals.get("VIT"), 0),
                "LUCK": _safe_int(raw_totals.get("LUCK"), 0),
                "level": _safe_int(
                    user.get("level")
                    or (user.get("profile") or {}).get("level")
                    or 1,
                    1,
                ),
            }
            return totals
    except Exception:
        pass

    base = user.get("stats") or {}
    totals = {
        "STR": _safe_int(base.get("STR"), 0),
        "AGI": _safe_int(base.get("AGI"), 0),
        "INT": _safe_int(base.get("INT"), 0),
        "VIT": _safe_int(base.get("VIT"), 0),
        "LUCK": _safe_int(base.get("LUCK"), 0),
        "level": _safe_int(
            user.get("level")
            or (user.get("profile") or {}).get("level")
            or 1,
            1,
        ),
    }
    return totals

# Original bloodmoon_core.py:1874-1877
def _bloodmoon_player_hp_max(totals: Optional[Dict[str, Any]] = None) -> int:
    totals = totals if isinstance(totals, dict) else {}
    vit = _safe_int(totals.get("VIT"), 0)
    return max(1, 50 + vit * 12)

# Original bloodmoon_core.py:2093-2120
def bloodmoon_roll_damage(user: Dict[str, Any]) -> Dict[str, Any]:
    totals = _extract_totals_from_user(user)

    lvl = _safe_int(totals.get("level"), 1)
    STR = _safe_int(totals.get("STR"), 0)
    AGI = _safe_int(totals.get("AGI"), 0)
    INT_ = _safe_int(totals.get("INT"), 0)
    LUCK = _safe_int(totals.get("LUCK"), 0)

    base = 40 + lvl * 3
    power = int(STR * 1.2 + AGI * 0.7 + INT_ * 0.7)

    roll_mult = random.uniform(0.90, 1.10)
    crit_chance = min(0.25, 0.05 + (LUCK / 500.0))
    crit = random.random() < crit_chance

    dmg = int((base + power) * roll_mult)
    if crit:
        dmg = int(dmg * 1.5)

    if dmg < 1:
        dmg = 1

    return {
        "damage": dmg,
        "crit": crit,
        "totals": totals,
    }
