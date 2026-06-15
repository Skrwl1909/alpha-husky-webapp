from __future__ import annotations

import copy
import importlib.util
import os
from pathlib import Path
import random
import sys
import time
from typing import Any

from ledger_lite import tx, user_balance_int


FEATURE_FLAG_ENV = "ALPHA_DEN_BUILD_ENABLED"
PET_TRAINING_FEATURE_FLAG_ENV = "ALPHA_DEN_PET_TRAINING_ENABLED"
SIGNAL_CACHE_FEATURE_FLAG_ENV = "ALPHA_DEN_SIGNAL_CACHE_ENABLED"
BUILDING_IDS = ("signal_core", "pet_kennel", "war_table")
PET_KENNEL_BUILDING_ID = "pet_kennel"
SIGNAL_CORE_BUILDING_ID = "signal_core"
MAX_BUILD_LEVEL = 3
DEFAULT_LEVEL_CONFIG = {
    1: {"cost": {"bones": 7500, "scrap": 100}, "buildSeconds": 43200},
    2: {"cost": {"bones": 22500, "scrap": 300}, "buildSeconds": 86400},
    3: {"cost": {"bones": 50000, "scrap": 650}, "buildSeconds": 172800},
}

# P2A note: the checkpoint text conflicts on Level 2 duration (4h vs 3h).
# The verifier contract later in the same checkpoint explicitly requires 3h,
# so the backend follows that verifier-side value for now.
PET_KENNEL_TRAINING_LEVEL_CONFIG = {
    1: {"trainingType": "Basic Training", "durationSeconds": 10800, "rewardPetXp": 30},
    2: {"trainingType": "Basic Training+", "durationSeconds": 10800, "rewardPetXp": 45},
    3: {"trainingType": "Reinforced Training", "durationSeconds": 21600, "rewardPetXp": 100},
}
SIGNAL_CORE_CACHE_LEVEL_CONFIG = {
    1: {"cooldownSeconds": 64800, "rewardScrapMin": 8, "rewardScrapMax": 14, "rewardBones": 0},
    2: {"cooldownSeconds": 64800, "rewardScrapMin": 12, "rewardScrapMax": 20, "rewardBones": 50},
    3: {"cooldownSeconds": 50400, "rewardScrapMin": 18, "rewardScrapMax": 30, "rewardBones": 75},
}

ALPHA_DEN_BUILDINGS: dict[str, dict[str, Any]] = {
    "signal_core": {
        "id": "signal_core",
        "name": "Signal Core",
        "levels": copy.deepcopy(DEFAULT_LEVEL_CONFIG),
    },
    "pet_kennel": {
        "id": "pet_kennel",
        "name": "Pet Kennel",
        "levels": copy.deepcopy(DEFAULT_LEVEL_CONFIG),
    },
    "war_table": {
        "id": "war_table",
        "name": "War Table",
        "levels": copy.deepcopy(DEFAULT_LEVEL_CONFIG),
    },
}

SAFETY_PAYLOAD = {
    "rewardsGranted": False,
    "xpGranted": False,
    "petXpGranted": False,
    "tokenTouched": False,
    "walletTouched": False,
    "paymentsTouched": False,
}

_PETS_ADD_XP_HELPER = None


class AlphaDenError(ValueError):
    def __init__(self, code: str, payload: dict[str, Any] | None = None):
        super().__init__(code)
        self.code = str(code or "STATE_ERROR")
        self.payload = copy.deepcopy(payload) if isinstance(payload, dict) else {}


def is_build_enabled() -> bool:
    return str(os.getenv(FEATURE_FLAG_ENV, "0") or "0").strip().lower() in {"1", "true", "yes", "on"}


def is_pet_training_enabled() -> bool:
    return str(os.getenv(PET_TRAINING_FEATURE_FLAG_ENV, "0") or "0").strip().lower() in {"1", "true", "yes", "on"}


def is_signal_cache_enabled() -> bool:
    return str(os.getenv(SIGNAL_CACHE_FEATURE_FLAG_ENV, "0") or "0").strip().lower() in {"1", "true", "yes", "on"}


def get_safety_payload() -> dict[str, bool]:
    return copy.deepcopy(SAFETY_PAYLOAD)


def default_pet_kennel_training_state() -> dict[str, Any]:
    return {
        "status": "idle",
        "activePetId": None,
        "activePetName": None,
        "trainingType": None,
        "startedAt": None,
        "readyAt": None,
        "claimedAt": None,
        "targetKennelLevel": None,
        "rewardPetXp": None,
        "durationSeconds": None,
    }


def default_signal_cache_state() -> dict[str, Any]:
    return {
        "status": "ready",
        "lastClaimedAt": None,
        "nextReadyAt": None,
        "lastReward": {"scrap": 0, "bones": 0},
        "sourceLevel": None,
        "claimedCount": 0,
        "version": "p2b_signal_cache_v1",
    }


def default_alpha_den_state() -> dict[str, Any]:
    return {
        "version": 1,
        "denLevel": 1,
        "buildings": {
            building_id: {
                "level": 0,
                "status": "idle",
                "targetLevel": None,
                "buildStartedAt": None,
                "buildReadyAt": None,
                "lastClaimedAt": None,
            }
            for building_id in BUILDING_IDS
        },
        "petKennelTraining": default_pet_kennel_training_state(),
        "signalCache": default_signal_cache_state(),
    }


def _as_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except Exception:
        return int(default)


def _as_ts(value: Any) -> int | None:
    try:
        ts = int(value)
    except Exception:
        return None
    return ts if ts >= 0 else None


def _as_optional_text(value: Any) -> str | None:
    text = str(value or "").strip()
    return text or None


def _normalize_level(value: Any) -> int:
    return max(0, _as_int(value, 0))


def _normalize_status(value: Any) -> str:
    return "building" if str(value or "").strip().lower() == "building" else "idle"


def _normalize_training_status(value: Any) -> str:
    return "training" if str(value or "").strip().lower() == "training" else "idle"


def _normalize_signal_cache_status(value: Any) -> str:
    return "charging" if str(value or "").strip().lower() == "charging" else "ready"


def _max_level_for_cfg(cfg: dict[str, Any]) -> int:
    levels = cfg.get("levels") if isinstance(cfg, dict) else {}
    if not isinstance(levels, dict):
        return 0
    return max((_normalize_level(level) for level in levels.keys()), default=0)


def _next_level(level: int, max_level: int) -> int | None:
    if level >= max_level:
        return None
    return level + 1


def _normalize_target_level(level: int, value: Any, max_level: int) -> int | None:
    target_level = _normalize_level(value)
    if target_level <= level or target_level > max_level:
        return None
    return target_level


def _legacy_materials(user: dict[str, Any]) -> dict[str, Any]:
    materials = user.get("materials")
    return materials if isinstance(materials, dict) else {}


def _normalize_asset_amounts(raw: Any) -> dict[str, int]:
    if not isinstance(raw, dict):
        return {}
    return {
        str(asset): amount
        for asset, amount in ((str(k), _as_int(v, 0)) for k, v in raw.items())
        if amount > 0
    }


def get_resource_balances(uid: str, user: dict[str, Any]) -> dict[str, int]:
    materials = _legacy_materials(user)
    bones_fallback = _as_int(materials.get("bones", user.get("points", 0)), 0)
    scrap_fallback = _as_int(materials.get("scrap", 0), 0)
    try:
        bones = int(user_balance_int(uid, "bones", bones_fallback))
    except Exception:
        bones = bones_fallback
    try:
        scrap = int(user_balance_int(uid, "scrap", scrap_fallback))
    except Exception:
        scrap = scrap_fallback
    return {
        "bones": max(0, bones),
        "scrap": max(0, scrap),
    }


def _resource_requirements(cost: Any, balances: dict[str, int]) -> tuple[dict[str, int], bool, dict[str, int]]:
    required = _normalize_asset_amounts(cost)
    missing: dict[str, int] = {}
    for asset, amount in required.items():
        have = max(0, _as_int((balances or {}).get(asset), 0))
        shortfall = max(0, amount - have)
        if shortfall > 0:
            missing[asset] = shortfall
    return required, not missing, missing


def _normalize_pet_kennel_training(raw: Any) -> dict[str, Any]:
    state = default_pet_kennel_training_state()
    if not isinstance(raw, dict):
        return state

    state["status"] = _normalize_training_status(raw.get("status"))
    state["activePetId"] = _as_optional_text(raw.get("activePetId") or raw.get("petId") or raw.get("activePetKey"))
    state["activePetName"] = _as_optional_text(raw.get("activePetName") or raw.get("petName"))
    state["trainingType"] = _as_optional_text(raw.get("trainingType"))
    state["startedAt"] = _as_ts(raw.get("startedAt"))
    state["readyAt"] = _as_ts(raw.get("readyAt"))
    state["claimedAt"] = _as_ts(raw.get("claimedAt"))
    state["targetKennelLevel"] = _normalize_level(raw.get("targetKennelLevel")) or None
    state["rewardPetXp"] = max(0, _as_int(raw.get("rewardPetXp"), 0)) or None
    state["durationSeconds"] = max(0, _as_int(raw.get("durationSeconds"), 0)) or None
    return state


def _normalize_signal_cache_reward(raw: Any) -> dict[str, int]:
    reward = {"scrap": 0, "bones": 0}
    if not isinstance(raw, dict):
        return reward
    reward["scrap"] = max(0, _as_int(raw.get("scrap"), 0))
    reward["bones"] = max(0, _as_int(raw.get("bones"), 0))
    return reward


def _normalize_signal_cache(raw: Any) -> dict[str, Any]:
    state = default_signal_cache_state()
    if not isinstance(raw, dict):
        return state

    state["status"] = _normalize_signal_cache_status(raw.get("status"))
    state["lastClaimedAt"] = _as_ts(raw.get("lastClaimedAt"))
    state["nextReadyAt"] = _as_ts(raw.get("nextReadyAt"))
    state["lastReward"] = _normalize_signal_cache_reward(raw.get("lastReward"))
    state["sourceLevel"] = _normalize_level(raw.get("sourceLevel")) or None
    state["claimedCount"] = max(0, _as_int(raw.get("claimedCount"), 0))
    state["version"] = _as_optional_text(raw.get("version")) or "p2b_signal_cache_v1"
    return state


def _normalize_state(raw: Any) -> dict[str, Any]:
    state = default_alpha_den_state()
    if not isinstance(raw, dict):
        return state

    state["version"] = 1
    state["denLevel"] = max(1, _normalize_level(raw.get("denLevel") or 1))
    raw_buildings = raw.get("buildings")
    if isinstance(raw_buildings, dict):
        for building_id in BUILDING_IDS:
            src = raw_buildings.get(building_id)
            if not isinstance(src, dict):
                continue
            dst = state["buildings"][building_id]
            dst["level"] = _normalize_level(src.get("level"))
            dst["status"] = _normalize_status(src.get("status"))
            max_level = _max_level_for_cfg(ALPHA_DEN_BUILDINGS[building_id])
            dst["targetLevel"] = _normalize_target_level(dst["level"], src.get("targetLevel"), max_level)
            dst["buildStartedAt"] = _as_ts(src.get("buildStartedAt"))
            dst["buildReadyAt"] = _as_ts(src.get("buildReadyAt"))
            dst["lastClaimedAt"] = _as_ts(src.get("lastClaimedAt"))

    raw_training = raw.get("petKennelTraining")
    if raw_training is None:
        raw_training = raw.get("pet_kennel_training")
    state["petKennelTraining"] = _normalize_pet_kennel_training(raw_training)
    raw_signal_cache = raw.get("signalCache")
    if raw_signal_cache is None:
        raw_signal_cache = raw.get("signal_cache")
    state["signalCache"] = _normalize_signal_cache(raw_signal_cache)
    return state


def ensure_alpha_den_state(user: dict[str, Any], *, persist: bool = False) -> dict[str, Any]:
    normalized = _normalize_state(user.get("alpha_den"))
    if persist:
        user["alpha_den"] = normalized
        return user["alpha_den"]
    return normalized


def _get_building_config(building_id: str) -> dict[str, Any]:
    cfg = ALPHA_DEN_BUILDINGS.get(str(building_id or "").strip())
    if not cfg:
        raise AlphaDenError("INVALID_BUILDING")
    return cfg


def _get_level_config(building_id: str, target_level: int) -> dict[str, Any]:
    cfg = _get_building_config(building_id)
    level_cfg = ((cfg.get("levels") or {}).get(int(target_level)) or {})
    if not level_cfg:
        raise AlphaDenError("STATE_ERROR")
    return level_cfg


def _resolve_pending_target_level(building_id: str, level: int, raw_status: str, raw_target_level: Any) -> int | None:
    if raw_status != "building":
        return None
    cfg = _get_building_config(building_id)
    max_level = _max_level_for_cfg(cfg)
    target_level = _normalize_target_level(level, raw_target_level, max_level)
    if target_level is not None:
        return target_level
    return _next_level(level, max_level)


def _ui_status(level: int, raw_status: str, ready_at: int | None, now_ts: int) -> str:
    if raw_status == "building":
        if ready_at is not None and now_ts >= ready_at:
            return "claim_available"
        return "building"
    if level >= 1:
        return "built"
    return "unbuilt"


def _get_pet_kennel_level(state: dict[str, Any]) -> int:
    building = ((state.get("buildings") or {}).get(PET_KENNEL_BUILDING_ID) or {})
    return _normalize_level(building.get("level"))


def _get_signal_core_level(state: dict[str, Any]) -> int:
    building = ((state.get("buildings") or {}).get(SIGNAL_CORE_BUILDING_ID) or {})
    return _normalize_level(building.get("level"))


def _get_pet_training_config(level: int) -> dict[str, Any] | None:
    kennel_level = max(0, _normalize_level(level))
    if kennel_level <= 0:
        return None
    capped_level = min(kennel_level, max(PET_KENNEL_TRAINING_LEVEL_CONFIG))
    cfg = PET_KENNEL_TRAINING_LEVEL_CONFIG.get(capped_level)
    return copy.deepcopy(cfg) if isinstance(cfg, dict) else None


def _get_signal_cache_config(level: int) -> dict[str, Any] | None:
    signal_core_level = max(0, _normalize_level(level))
    if signal_core_level <= 0:
        return None
    capped_level = min(signal_core_level, max(SIGNAL_CORE_CACHE_LEVEL_CONFIG))
    cfg = SIGNAL_CORE_CACHE_LEVEL_CONFIG.get(capped_level)
    return copy.deepcopy(cfg) if isinstance(cfg, dict) else None


def _peek_active_pet_summary(user: dict[str, Any]) -> dict[str, Any] | None:
    pets = user.get("pets")
    if not isinstance(pets, dict) or not pets:
        return None
    equipment = user.get("equipment") if isinstance(user.get("equipment"), dict) else {}
    active_pet_id = str(equipment.get("pet") or "").strip()
    if active_pet_id not in pets:
        active_pet_id = next((str(pet_id) for pet_id, pet in pets.items() if isinstance(pet, dict)), "")
    pet = pets.get(active_pet_id)
    if not active_pet_id or not isinstance(pet, dict):
        return None
    return {
        "petId": active_pet_id,
        "name": str(pet.get("name") or pet.get("pet_name") or pet.get("type") or "Pet"),
        "type": str(pet.get("type") or "").strip(),
        "level": max(1, _normalize_level(pet.get("level") or 1)),
    }


def _build_pet_kennel_training_payload(
    user: dict[str, Any],
    state: dict[str, Any],
    *,
    now_ts: int,
    training_enabled: bool,
) -> dict[str, Any]:
    kennel_level = _get_pet_kennel_level(state)
    active_pet = _peek_active_pet_summary(user)
    training_state = _normalize_pet_kennel_training(state.get("petKennelTraining"))
    stored_status = _normalize_training_status(training_state.get("status"))
    ready_at = _as_ts(training_state.get("readyAt"))
    target_kennel_level = _normalize_level(training_state.get("targetKennelLevel")) or kennel_level
    cfg = _get_pet_training_config(target_kennel_level if stored_status == "training" else kennel_level)
    reward_pet_xp = max(0, _as_int(training_state.get("rewardPetXp"), 0))
    duration_seconds = max(0, _as_int(training_state.get("durationSeconds"), 0))
    training_type = _as_optional_text(training_state.get("trainingType"))
    if cfg:
        reward_pet_xp = reward_pet_xp or int(cfg.get("rewardPetXp") or 0)
        duration_seconds = duration_seconds or int(cfg.get("durationSeconds") or 0)
        training_type = training_type or str(cfg.get("trainingType") or "")

    if stored_status == "training" and ready_at is not None and now_ts >= ready_at:
        training_status = "ready"
    elif stored_status == "training":
        training_status = "training"
    elif not training_enabled:
        training_status = "disabled"
    elif kennel_level < 1:
        training_status = "locked"
    elif active_pet is None:
        training_status = "locked"
    else:
        training_status = "idle"

    reason: str | None = None
    can_train = False
    can_claim = False
    if stored_status == "training":
        if training_status == "ready":
            can_claim = bool(training_enabled)
            if not can_claim:
                reason = "TRAINING_DISABLED"
            else:
                reason = "CLAIM_REQUIRED"
        else:
            reason = "TRAINING_DISABLED" if not training_enabled else "ALREADY_TRAINING"
    elif not training_enabled:
        reason = "TRAINING_DISABLED"
    elif kennel_level < 1:
        reason = "KENNEL_REQUIRED"
    elif active_pet is None:
        reason = "NO_ACTIVE_PET"
    else:
        can_train = True

    return {
        "trainingEnabled": bool(training_enabled),
        "petKennelLevel": kennel_level,
        "activePet": copy.deepcopy(active_pet) if isinstance(active_pet, dict) else None,
        "trainingStatus": training_status,
        "status": stored_status,
        "canTrain": bool(can_train),
        "canClaim": bool(can_claim),
        "reason": reason,
        "secondsRemaining": max(0, int(ready_at or 0) - now_ts) if stored_status == "training" else 0,
        "readyAt": ready_at,
        "claimedAt": _as_ts(training_state.get("claimedAt")),
        "rewardPetXp": reward_pet_xp,
        "trainingType": training_type,
        "durationSeconds": duration_seconds,
        "startedAt": _as_ts(training_state.get("startedAt")),
        "targetKennelLevel": target_kennel_level if stored_status == "training" else kennel_level,
        "activeTrainingPetId": _as_optional_text(training_state.get("activePetId")),
        "activeTrainingPetName": _as_optional_text(training_state.get("activePetName")),
    }


def _build_signal_cache_payload(
    state: dict[str, Any],
    *,
    now_ts: int,
    signal_cache_enabled: bool,
) -> dict[str, Any]:
    signal_core_level = _get_signal_core_level(state)
    cache_state = _normalize_signal_cache(state.get("signalCache"))
    cfg = _get_signal_cache_config(signal_core_level)
    next_ready_at = _as_ts(cache_state.get("nextReadyAt"))
    last_claimed_at = _as_ts(cache_state.get("lastClaimedAt"))
    last_reward = _normalize_signal_cache_reward(cache_state.get("lastReward"))
    claimed_count = max(0, _as_int(cache_state.get("claimedCount"), 0))
    source_level = _normalize_level(cache_state.get("sourceLevel")) or (signal_core_level if signal_core_level > 0 else None)

    reward_preview = {
        "scrapMin": max(0, _as_int((cfg or {}).get("rewardScrapMin"), 0)),
        "scrapMax": max(0, _as_int((cfg or {}).get("rewardScrapMax"), 0)),
        "bones": max(0, _as_int((cfg or {}).get("rewardBones"), 0)),
    }
    cooldown_seconds = max(0, _as_int((cfg or {}).get("cooldownSeconds"), 0))

    if not signal_cache_enabled:
        cache_status = "disabled"
        can_claim = False
        reason = "FEATURE_DISABLED"
        seconds_remaining = max(0, int(next_ready_at or 0) - now_ts) if next_ready_at is not None else 0
    elif signal_core_level < 1 or not cfg:
        cache_status = "locked"
        can_claim = False
        reason = "SIGNAL_CORE_REQUIRED"
        seconds_remaining = 0
    elif next_ready_at is None or now_ts >= next_ready_at:
        cache_status = "ready"
        can_claim = True
        reason = None
        seconds_remaining = 0
    else:
        cache_status = "charging"
        can_claim = False
        reason = "NOT_READY"
        seconds_remaining = max(0, next_ready_at - now_ts)

    return {
        "featureEnabled": bool(signal_cache_enabled),
        "signalCoreLevel": signal_core_level,
        "cacheStatus": cache_status,
        "status": cache_status,
        "canClaim": bool(can_claim),
        "reason": reason,
        "secondsRemaining": seconds_remaining,
        "nextReadyAt": next_ready_at,
        "lastClaimedAt": last_claimed_at,
        "lastReward": last_reward,
        "rewardPreview": reward_preview,
        "cooldownSeconds": cooldown_seconds,
        "sourceLevel": source_level,
        "claimedCount": claimed_count,
        "version": _as_optional_text(cache_state.get("version")) or "p2b_signal_cache_v1",
    }


def build_alpha_den_payload(
    user: dict[str, Any],
    uid: str,
    *,
    now_ts: int | None = None,
    build_enabled: bool | None = None,
    pet_training_enabled: bool | None = None,
    signal_cache_enabled: bool | None = None,
) -> dict[str, Any]:
    state = ensure_alpha_den_state(user, persist=False)
    now_ts = int(now_ts if now_ts is not None else time.time())
    enabled = is_build_enabled() if build_enabled is None else bool(build_enabled)
    training_enabled = is_pet_training_enabled() if pet_training_enabled is None else bool(pet_training_enabled)
    signal_cache_live = is_signal_cache_enabled() if signal_cache_enabled is None else bool(signal_cache_enabled)
    balances = get_resource_balances(uid, user)

    buildings_payload: dict[str, dict[str, Any]] = {}
    for building_id in BUILDING_IDS:
        cfg = ALPHA_DEN_BUILDINGS[building_id]
        max_level = _max_level_for_cfg(cfg)
        raw_building = state["buildings"][building_id]
        level = _normalize_level(raw_building.get("level"))
        raw_status = _normalize_status(raw_building.get("status"))
        target_level = _resolve_pending_target_level(building_id, level, raw_status, raw_building.get("targetLevel"))
        build_started_at = _as_ts(raw_building.get("buildStartedAt"))
        build_ready_at = _as_ts(raw_building.get("buildReadyAt"))
        last_claimed_at = _as_ts(raw_building.get("lastClaimedAt"))
        ui_status = _ui_status(level, raw_status, build_ready_at, now_ts)
        next_level = target_level if raw_status == "building" else _next_level(level, max_level)
        next_level_cfg = _get_level_config(building_id, next_level) if next_level else None
        next_cost = _normalize_asset_amounts((next_level_cfg or {}).get("cost") or {}) if next_level_cfg else None
        build_seconds = int((next_level_cfg or {}).get("buildSeconds") or 0) if next_level_cfg else 0
        _, enough_resources, missing_resources = _resource_requirements(next_cost or {}, balances)
        is_max_level = raw_status != "building" and level >= max_level

        buildings_payload[building_id] = {
            "id": building_id,
            "name": str(cfg.get("name") or building_id),
            "level": level,
            "maxLevel": max_level,
            "uiStatus": ui_status,
            "rawStatus": raw_status,
            "targetLevel": target_level,
            "buildStartedAt": build_started_at,
            "buildReadyAt": build_ready_at,
            "lastClaimedAt": last_claimed_at,
            "secondsRemaining": max(0, int(build_ready_at or 0) - now_ts) if raw_status == "building" else 0,
            "canStart": bool(enabled and not is_max_level and raw_status != "building" and enough_resources),
            "canClaim": bool(enabled and ui_status == "claim_available"),
            "nextLevel": next_level,
            "nextCost": next_cost,
            "buildSeconds": build_seconds,
            "hasResources": bool(enough_resources),
            "enoughResources": bool(enough_resources),
            "missingResources": missing_resources,
            "isMaxLevel": bool(is_max_level),
        }

    pet_training_payload = _build_pet_kennel_training_payload(
        user,
        state,
        now_ts=now_ts,
        training_enabled=training_enabled,
    )
    signal_cache_payload = _build_signal_cache_payload(
        state,
        now_ts=now_ts,
        signal_cache_enabled=signal_cache_live,
    )

    return {
        "version": 1,
        "denLevel": max(1, _normalize_level(state.get("denLevel") or 1)),
        "buildEnabled": enabled,
        "petTrainingEnabled": training_enabled,
        "signalCacheEnabled": signal_cache_live,
        "now": now_ts,
        "balances": balances,
        "buildings": buildings_payload,
        "petKennelTraining": pet_training_payload,
        "signalCache": signal_cache_payload,
    }


def start_alpha_den_build(
    user: dict[str, Any],
    uid: str,
    building_id: str,
    *,
    now_ts: int | None = None,
    run_id: str | None = None,
    build_enabled: bool | None = None,
) -> dict[str, Any]:
    enabled = is_build_enabled() if build_enabled is None else bool(build_enabled)
    if not enabled:
        raise AlphaDenError("BUILD_DISABLED")

    now_ts = int(now_ts if now_ts is not None else time.time())
    state = ensure_alpha_den_state(user, persist=True)
    cfg = _get_building_config(building_id)
    building_id = str(cfg.get("id") or building_id)
    building = state["buildings"][building_id]
    level = _normalize_level(building.get("level"))
    raw_status = _normalize_status(building.get("status"))
    max_level = _max_level_for_cfg(cfg)
    target_level = _next_level(level, max_level)
    if target_level is None:
        raise AlphaDenError("MAX_LEVEL_REACHED")
    level_cfg = _get_level_config(building_id, target_level)
    balances = get_resource_balances(uid, user)
    spends, enough_resources, missing_resources = _resource_requirements(level_cfg.get("cost") or {}, balances)
    if raw_status == "building":
        raise AlphaDenError("ALREADY_BUILDING")
    if not enough_resources:
        raise AlphaDenError("INSUFFICIENT_RESOURCES", {"missingResources": missing_resources})
    try:
        tx(
            uid,
            spends=spends,
            reason="alpha_den_build_start",
            run_id=run_id,
            strict=True,
            mirror_user=user,
        )
    except ValueError as exc:
        if str(exc).startswith("Insufficient"):
            latest_balances = get_resource_balances(uid, user)
            _, _, latest_missing = _resource_requirements(level_cfg.get("cost") or {}, latest_balances)
            raise AlphaDenError("INSUFFICIENT_RESOURCES", {"missingResources": latest_missing or missing_resources}) from exc
        raise AlphaDenError("STATE_ERROR") from exc

    building["level"] = level
    building["status"] = "building"
    building["targetLevel"] = target_level
    building["buildStartedAt"] = now_ts
    building["buildReadyAt"] = now_ts + int(level_cfg.get("buildSeconds") or 0)

    return build_alpha_den_payload(user, uid, now_ts=now_ts, build_enabled=enabled)


def claim_alpha_den_build(
    user: dict[str, Any],
    uid: str,
    building_id: str,
    *,
    now_ts: int | None = None,
    build_enabled: bool | None = None,
) -> dict[str, Any]:
    enabled = is_build_enabled() if build_enabled is None else bool(build_enabled)
    if not enabled:
        raise AlphaDenError("BUILD_DISABLED")

    now_ts = int(now_ts if now_ts is not None else time.time())
    state = ensure_alpha_den_state(user, persist=True)
    cfg = _get_building_config(building_id)
    building_id = str(cfg.get("id") or building_id)
    building = state["buildings"][building_id]
    max_level = _max_level_for_cfg(cfg)
    level = _normalize_level(building.get("level"))
    raw_status = _normalize_status(building.get("status"))
    target_level = _resolve_pending_target_level(building_id, level, raw_status, building.get("targetLevel"))
    ready_at = _as_ts(building.get("buildReadyAt"))

    if raw_status != "building":
        raise AlphaDenError("NOT_BUILDING")
    if ready_at is None:
        raise AlphaDenError("STATE_ERROR")
    if now_ts < ready_at:
        raise AlphaDenError("NOT_READY", {"secondsRemaining": max(0, ready_at - now_ts)})
    if target_level is None:
        raise AlphaDenError("STATE_ERROR")

    building["level"] = min(target_level, max_level)
    building["status"] = "idle"
    building["targetLevel"] = None
    building["buildStartedAt"] = None
    building["buildReadyAt"] = None
    building["lastClaimedAt"] = now_ts

    return build_alpha_den_payload(user, uid, now_ts=now_ts, build_enabled=enabled)


def _grant_pet_training_reward(user: dict[str, Any], pet_id: str, reward_pet_xp: int) -> dict[str, Any]:
    pets = user.get("pets")
    if not isinstance(pets, dict) or pet_id not in pets or not isinstance(pets.get(pet_id), dict):
        raise AlphaDenError("PET_NOT_FOUND")

    equipment = user.setdefault("equipment", {})
    previous_active_pet_id = str(equipment.get("pet") or "").strip()
    if previous_active_pet_id not in pets:
        previous_active_pet_id = ""

    equipment["pet"] = pet_id
    try:
        pet_leveled_up = bool(_load_canonical_add_pet_xp()(user, amount=max(0, _as_int(reward_pet_xp, 0))))
    except AlphaDenError:
        raise
    except Exception as exc:
        raise AlphaDenError("STATE_ERROR") from exc
    finally:
        equipment["pet"] = previous_active_pet_id or pet_id

    trained_pet = pets.get(pet_id) if isinstance(pets.get(pet_id), dict) else {}
    return {
        "petId": pet_id,
        "petName": str(trained_pet.get("name") or trained_pet.get("pet_name") or trained_pet.get("type") or "Pet"),
        "petLevel": max(1, _normalize_level(trained_pet.get("level") or 1)),
        "petXp": max(0, _as_int(trained_pet.get("xp"), 0)),
        "petLeveledUp": bool(pet_leveled_up),
    }


def _load_canonical_add_pet_xp():
    global _PETS_ADD_XP_HELPER
    if _PETS_ADD_XP_HELPER is not None:
        return _PETS_ADD_XP_HELPER

    try:
        from pets import add_pet_xp as helper

        _PETS_ADD_XP_HELPER = helper
        return _PETS_ADD_XP_HELPER
    except Exception:
        backend_root = Path(__file__).resolve().parent
        utils_py = backend_root / "utils.patched.py"
        if not utils_py.exists():
            utils_py = backend_root / "utils.py"
        pets_py = backend_root / "pets.py"
        if not utils_py.exists() or not pets_py.exists():
            raise

        prior_utils = sys.modules.get("utils")
        prior_pets = sys.modules.get("pets")

        utils_spec = importlib.util.spec_from_file_location("_alpha_den_utils_file", utils_py)
        if utils_spec is None or utils_spec.loader is None:
            raise ImportError("Unable to load utils.py for pet training reward")
        utils_module = importlib.util.module_from_spec(utils_spec)
        utils_spec.loader.exec_module(utils_module)

        pets_spec = importlib.util.spec_from_file_location("_alpha_den_pets_file", pets_py)
        if pets_spec is None or pets_spec.loader is None:
            raise ImportError("Unable to load pets.py for pet training reward")
        pets_module = importlib.util.module_from_spec(pets_spec)

        sys.modules["utils"] = utils_module
        try:
            pets_spec.loader.exec_module(pets_module)
        finally:
            if prior_utils is not None:
                sys.modules["utils"] = prior_utils
            else:
                sys.modules.pop("utils", None)
            if prior_pets is not None:
                sys.modules["pets"] = prior_pets
            else:
                sys.modules.pop("pets", None)

        helper = getattr(pets_module, "add_pet_xp", None)
        if not callable(helper):
            raise ImportError("pets.add_pet_xp missing")
        _PETS_ADD_XP_HELPER = helper
        return _PETS_ADD_XP_HELPER


def start_pet_kennel_training(
    user: dict[str, Any],
    uid: str,
    *,
    now_ts: int | None = None,
    pet_training_enabled: bool | None = None,
) -> dict[str, Any]:
    enabled = is_pet_training_enabled() if pet_training_enabled is None else bool(pet_training_enabled)
    if not enabled:
        raise AlphaDenError("TRAINING_DISABLED")

    now_ts = int(now_ts if now_ts is not None else time.time())
    state = ensure_alpha_den_state(user, persist=True)
    kennel_level = _get_pet_kennel_level(state)
    if kennel_level < 1:
        raise AlphaDenError("KENNEL_REQUIRED")

    training = state["petKennelTraining"]
    training_status = _normalize_training_status(training.get("status"))
    ready_at = _as_ts(training.get("readyAt"))
    if training_status == "training":
        if ready_at is not None and now_ts >= ready_at:
            raise AlphaDenError("CLAIM_REQUIRED", {"secondsRemaining": 0})
        raise AlphaDenError("ALREADY_TRAINING", {"secondsRemaining": max(0, int(ready_at or now_ts) - now_ts)})

    active_pet = _peek_active_pet_summary(user)
    if not isinstance(active_pet, dict):
        raise AlphaDenError("NO_ACTIVE_PET")

    cfg = _get_pet_training_config(kennel_level)
    if not cfg:
        raise AlphaDenError("KENNEL_REQUIRED")

    duration_seconds = int(cfg.get("durationSeconds") or 0)
    reward_pet_xp = int(cfg.get("rewardPetXp") or 0)
    training_type = str(cfg.get("trainingType") or "").strip()
    training["status"] = "training"
    training["activePetId"] = active_pet["petId"]
    training["activePetName"] = active_pet["name"]
    training["trainingType"] = training_type
    training["startedAt"] = now_ts
    training["readyAt"] = now_ts + duration_seconds
    training["claimedAt"] = None
    training["targetKennelLevel"] = min(max(1, kennel_level), max(PET_KENNEL_TRAINING_LEVEL_CONFIG))
    training["rewardPetXp"] = reward_pet_xp
    training["durationSeconds"] = duration_seconds

    payload = build_alpha_den_payload(user, uid, now_ts=now_ts, pet_training_enabled=enabled)
    return {
        "alphaDen": payload,
        "activePetId": active_pet["petId"],
        "activePetName": active_pet["name"],
        "trainingType": training_type,
        "durationSeconds": duration_seconds,
        "rewardPetXp": reward_pet_xp,
        "targetKennelLevel": training["targetKennelLevel"],
    }


def claim_pet_kennel_training(
    user: dict[str, Any],
    uid: str,
    *,
    now_ts: int | None = None,
    pet_training_enabled: bool | None = None,
) -> dict[str, Any]:
    enabled = is_pet_training_enabled() if pet_training_enabled is None else bool(pet_training_enabled)
    if not enabled:
        raise AlphaDenError("TRAINING_DISABLED")

    now_ts = int(now_ts if now_ts is not None else time.time())
    state = ensure_alpha_den_state(user, persist=True)
    training = state["petKennelTraining"]
    if _normalize_training_status(training.get("status")) != "training":
        raise AlphaDenError("NO_ACTIVE_TRAINING")

    ready_at = _as_ts(training.get("readyAt"))
    if ready_at is None:
        raise AlphaDenError("STATE_ERROR")
    if now_ts < ready_at:
        raise AlphaDenError("NOT_READY", {"secondsRemaining": max(0, ready_at - now_ts)})

    pet_id = _as_optional_text(training.get("activePetId"))
    reward_pet_xp = max(0, _as_int(training.get("rewardPetXp"), 0))
    if not pet_id or reward_pet_xp <= 0:
        cfg = _get_pet_training_config(_normalize_level(training.get("targetKennelLevel")))
        pet_id = pet_id or _as_optional_text(training.get("activePetId"))
        reward_pet_xp = reward_pet_xp or int((cfg or {}).get("rewardPetXp") or 0)
    if not pet_id or reward_pet_xp <= 0:
        raise AlphaDenError("STATE_ERROR")

    reward_summary = _grant_pet_training_reward(user, pet_id, reward_pet_xp)
    training_type = _as_optional_text(training.get("trainingType")) or str(
        (_get_pet_training_config(_normalize_level(training.get("targetKennelLevel"))) or {}).get("trainingType") or ""
    )
    training["status"] = "idle"
    training["activePetId"] = None
    training["activePetName"] = None
    training["trainingType"] = None
    training["startedAt"] = None
    training["readyAt"] = None
    training["claimedAt"] = now_ts
    training["targetKennelLevel"] = None
    training["rewardPetXp"] = None
    training["durationSeconds"] = None

    payload = build_alpha_den_payload(user, uid, now_ts=now_ts, pet_training_enabled=enabled)
    return {
        "alphaDen": payload,
        "trainingType": training_type,
        "rewardPetXp": reward_pet_xp,
        "claimedAt": now_ts,
        **reward_summary,
    }


def claim_signal_core_cache(
    user: dict[str, Any],
    uid: str,
    *,
    now_ts: int | None = None,
    signal_cache_enabled: bool | None = None,
) -> dict[str, Any]:
    enabled = is_signal_cache_enabled() if signal_cache_enabled is None else bool(signal_cache_enabled)
    if not enabled:
        raise AlphaDenError("FEATURE_DISABLED")

    now_ts = int(now_ts if now_ts is not None else time.time())
    state = ensure_alpha_den_state(user, persist=False)
    signal_core_level = _get_signal_core_level(state)
    cfg = _get_signal_cache_config(signal_core_level)
    if signal_core_level < 1 or not cfg:
        raise AlphaDenError("SIGNAL_CORE_REQUIRED")

    cache_state = state["signalCache"]
    next_ready_at = _as_ts(cache_state.get("nextReadyAt"))
    if next_ready_at is not None and now_ts < next_ready_at:
        raise AlphaDenError("NOT_READY", {"secondsRemaining": max(0, next_ready_at - now_ts), "nextReadyAt": next_ready_at})

    user["alpha_den"] = state
    reward = {
        "scrap": random.randint(int(cfg.get("rewardScrapMin") or 0), int(cfg.get("rewardScrapMax") or 0)),
        "bones": int(cfg.get("rewardBones") or 0),
    }
    try:
        tx(
            uid,
            grants=reward,
            reason="alpha_den_signal_cache_claim",
            strict=False,
            mirror_user=user,
        )
    except Exception as exc:
        raise AlphaDenError("STATE_ERROR") from exc

    cooldown_seconds = int(cfg.get("cooldownSeconds") or 0)
    reward_summary = {"scrap": max(0, _as_int(reward.get("scrap"), 0)), "bones": max(0, _as_int(reward.get("bones"), 0))}
    cache_state["status"] = "charging"
    cache_state["lastClaimedAt"] = now_ts
    cache_state["nextReadyAt"] = now_ts + cooldown_seconds
    cache_state["lastReward"] = reward_summary
    cache_state["sourceLevel"] = min(max(1, signal_core_level), max(SIGNAL_CORE_CACHE_LEVEL_CONFIG))
    cache_state["claimedCount"] = max(0, _as_int(cache_state.get("claimedCount"), 0)) + 1
    cache_state["version"] = "p2b_signal_cache_v1"

    payload = build_alpha_den_payload(user, uid, now_ts=now_ts, signal_cache_enabled=enabled)
    return {
        "alphaDen": payload,
        "claimedAt": now_ts,
        "nextReadyAt": cache_state["nextReadyAt"],
        "cooldownSeconds": cooldown_seconds,
        "sourceLevel": cache_state["sourceLevel"],
        "claimedCount": cache_state["claimedCount"],
        "lastReward": copy.deepcopy(reward_summary),
        **reward_summary,
    }
