import aiohttp
from data_store import with_user, read_user, get_active_temp_entitlements
import data_store as ds
from faction_core import build_state, set_faction, clear_faction
from aiohttp import web
from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
    Update,
    ReplyKeyboardMarkup,
    KeyboardButton,
    Bot,
    InlineQueryResultArticle,
    InputTextMessageContent,
)
from telegram.ext import ContextTypes
from telegram.error import BadRequest
import os
import io
import re
from config import SELECTOR_SHARD_SLOTS
import asyncio
import hmac
import html
import hashlib
import json
from equipment import (
    build_equipped_state,
    build_equipped_inspect,
    unequip_slot,
    EQUIPMENT_SLOTS,
    ALL_ITEMS,
    get_total_equipment_bonus,
    show_equipped_image,
    create_item_card
)
import time
from support_stars import SUPPORT_TIERS, build_support_payload, tg_create_invoice_link
from webapp_supporter import (
    BELIEVE_HOLDER_FRAME_KEY,
    BELIEVE_HOLDER_FRAME_URL,
    BELIEVE_SUPPORT_BADGE_KEY,
    BELIEVE_SUPPORT_FRAME_KEY,
    BELIEVE_SUPPORT_FRAME_URL,
    BELIEVE_SUPPORT_SKIN_KEY,
    DUAL_SUPPORT_FRAME_KEY,
    DUAL_SUPPORT_FRAME_URL,
    build_support_state_payload,
    build_token_skin_unlock_state,
    register_supporter_routes,
    resolve_support_cosmetics,
)
try:
    from badge_mastery import (
        MASTERY_FAMILY_ORDER,
        MASTERY_FAMILIES,
        get_mastery_state,
        frame_public_id_for_tier as mastery_frame_public_id_for_tier,
        frame_url_for_tier as mastery_frame_url_for_tier,
        rarity_for_tier as mastery_rarity_for_tier,
    )
except Exception:
    MASTERY_FAMILY_ORDER = ()
    MASTERY_FAMILIES = {}

    def get_mastery_state(*args, **kwargs):
        return {
            "progress": 0,
            "tier": 0,
            "tier_name": "Unranked",
            "next_threshold": None,
            "next_tier_name": "",
            "max_tier": False,
        }

    def mastery_frame_public_id_for_tier(*args, **kwargs):
        return ""

    def mastery_frame_url_for_tier(*args, **kwargs):
        return ""

    def mastery_rarity_for_tier(*args, **kwargs):
        return "common"
import copy
import itertools
import logging
import random
from loot_tables import roll_box_drops
from inventory import _apply_lootbox_drops
from equipment import forge_upgrade_equipped_core
from howlboard import build_howlboard_payload, normalize_howlboard_sort, render_howlboard_image
from map_influence_store import (
    build_influence_weekly_active_aura_payload,
    finalize_pending_influence_weekly_rewards,
    influence_weekly_reward_public_key,
)
from pets import animated_pet_sprite_payload, build_pets_payload_for_webapp, ensure_pets
from urllib.parse import urlencode, quote
from pathlib import Path
from PIL import Image
import urllib.parse
from datetime import datetime, timezone, date, timedelta
from quests import (
    accept_quest,
    complete_quest,
    get_active_quests,
    update_quest_progress,
    serialize_active_quests_for_front,
    build_quest_board_v2_payload,
    claim_quest_v2_reward,
)
from stats import compute_full_stats
from missions import assign_daily_quests  # <- jeÄąâ€şli masz to w innym pliku, popraw import
from fortress import fortress_state, fortress_start, FORTRESS_ID, show_moonlab_fortress_menu as tg_moonlab_menu
from forge_core import build_forge_payload as build_forge_payload_core, forge_upgrade_equipped, forge_craft_shards
from ledger_lite import debit, user_balance_int, credit_many, ledger_apply_to_user
from alpha_den import (
    AlphaDenError,
    build_alpha_den_payload,
    claim_alpha_den_build,
    claim_pet_kennel_training,
    claim_signal_core_cache,
    get_safety_payload as alpha_den_safety_payload,
    start_pet_kennel_training,
    start_alpha_den_build,
)
from blue_signal_hunt import (
    BLUE_SIGNAL_FRAME_KEY,
    build_blue_signal_hunt_progress,
    claim_blue_signal_frame,
)
# === IMPORTY Z utils ===
from utils import (
    CANCELLABLE_ACTIVE_EFFECTS,
    cancel_active_effect,
    ensure_regions_keys,
    is_region_unlocked,
    REGION_NAMES,
    REGION_IDS,
    ensure_afk_fields,
    AFK_STATE_RUNNING,
    start_timed_effect,
    start_uses_effect,
    build_buffs_line_ro as build_buffs_line_ro,
    build_buffs_payload_ro as build_buffs_payload_ro,
    suppress_save_data,
)
from slots_core import (
    SLOTS_BUILDING_ID,
    SPIN_COST_BONES as SLOTS_SPIN_COST_BONES,
    MAX_IDEMPOTENCY_CACHE as SLOTS_MAX_IDEMPOTENCY_CACHE,
    ensure_terminal_state as ensure_slots_terminal_state,
    build_slots_state_payload,
    spin_terminal as spin_slots_terminal,
    rewards_to_assets as slots_rewards_to_assets,
    summarize_spin as summarize_slots_spin,
)
from webapp_cache_gc import compact_cache_payload, prune_webapp_idem_caches
from user_runtime_cache import build_telemetry_idemp_entry

_LOG = logging.getLogger("webapp")
_BOT_TOKEN = None
_PERF_ENABLED = str(os.getenv("WEBAPP_PERF_LOG", os.getenv("AH_PERF_LOGS", "0")) or "").strip().lower() in {"1", "true", "yes", "on"}
_PERF_RID_SEQ = itertools.count(1)
_CHARACTER_IMAGE_CACHE_TTL_SEC = float(os.getenv("WEBAPP_CHARACTER_IMAGE_TTL_SEC", "30.0"))
_ITEM_CARD_CACHE_TTL_SEC = float(os.getenv("WEBAPP_ITEM_CARD_TTL_SEC", "60.0"))
_ASSET_CACHE_MAX = int(os.getenv("WEBAPP_ASSET_CACHE_MAX", "64"))
_CHARACTER_IMAGE_CACHE = {}
_ITEM_CARD_CACHE = {}


def _perf_log(label: str, started_at: float, **extra) -> None:
    if not _PERF_ENABLED:
        return
    ms = round((time.perf_counter() - started_at) * 1000.0, 1)
    parts = [f"{k}={v}" for k, v in extra.items() if v is not None]
    suffix = (" " + " ".join(parts)) if parts else ""
    _LOG.info("[PERF] %s %.1fms%s", label, ms, suffix)


def _perf_ms(started_at: float) -> float:
    return round((time.perf_counter() - started_at) * 1000.0, 1)


def _next_perf_rid() -> str:
    return f"{next(_PERF_RID_SEQ):06d}"


def _profile_perf(uid: str, step: str, started_at: float) -> None:
    if not _PERF_ENABLED:
        return
    _LOG.info("[PROFILE_PERF] uid=%s step=%s ms=%.1f", uid or "-", step, _perf_ms(started_at))


def _craft_perf(uid: str, step: str, started_at: float) -> None:
    if not _PERF_ENABLED:
        return
    _LOG.info("[CRAFT_PERF] uid=%s step=%s ms=%.1f", uid or "-", step, _perf_ms(started_at))


def _quests_perf(step: str, started_at: float, *, mutated: bool | None = None) -> None:
    if not _PERF_ENABLED:
        return
    extra = f" mutated={str(bool(mutated)).lower()}" if mutated is not None else ""
    _LOG.info("[QUESTS_PERF] step=%s ms=%.1f%s", step, _perf_ms(started_at), extra)


def _stable_cache_key(data) -> str:
    try:
        return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    except Exception:
        return repr(data)


def _cache_get(cache: dict, key: str, ttl_sec: float):
    entry = cache.get(key)
    if not isinstance(entry, dict):
        return None
    if (time.monotonic() - float(entry.get("ts") or 0.0)) > ttl_sec:
        cache.pop(key, None)
        return None
    return entry.get("value")


def _cache_prune(cache: dict, max_size: int = _ASSET_CACHE_MAX) -> None:
    if len(cache) <= max_size:
        return
    stale = sorted(cache.items(), key=lambda kv: float((kv[1] or {}).get("ts") or 0.0))
    for key, _ in stale[: max(0, len(cache) - max_size)]:
        cache.pop(key, None)


def _cache_put(cache: dict, key: str, value, *, prefix: str | None = None) -> None:
    if prefix:
        for old_key in list(cache.keys()):
            if str(old_key).startswith(prefix) and old_key != key:
                cache.pop(old_key, None)
    cache[key] = {"ts": time.monotonic(), "value": value}
    _cache_prune(cache)


def _character_image_signature(user: dict) -> str:
    u = user if isinstance(user, dict) else {}
    return _stable_cache_key({
        "avatar": u.get("avatar"),
        "skin": u.get("skin") or u.get("activeSkin"),
        "cosmetics": u.get("cosmetics") or {},
        "equipment": u.get("equipment") or {},
        "equipment_data": u.get("equipment_data") or {},
    })


def _item_card_signature(item_key: str, level: int, stats: dict) -> str:
    return _stable_cache_key({
        "item": item_key,
        "level": int(level or 0),
        "stats": stats if isinstance(stats, dict) else {},
    })

# Community chat id (u Ciebie)
CHANNEL_ID = -1002535545096

# Anty-spam (sekundy)
FLEX_COOLDOWN_SEC = int(os.getenv("FLEX_COOLDOWN_SEC", "300"))

# Publiczny base frontu (ÄąÄ˝eby zbudowaĂ„â€ˇ absolutny URL do /assets/...)
WEBAPP_PUBLIC_BASE = os.getenv("WEBAPP_PUBLIC_BASE", "https://app.alphahusky.win")

def load_data():
    # zwrÄ‚Ĺ‚Ă„â€ˇ canonical data trzymane w pamiĂ„â„˘ci (po await init_data())
    d = getattr(ds, "_DATA", None)
    if isinstance(d, dict) and isinstance(d.get("users"), dict):
        return d
    return {"schema": 2, "users": {}}

def save_data(*args, **kwargs):
    # STOP: blokujemy stare zapisy przez save_data w webapp
    # ÄąÄ˝eby nic nie popsuÄąâ€šo danych zanim przerobimy endpointy na with_user()
    raise RuntimeError("save_data() disabled in webapp_dashboard. Use data_store.with_user().")

def set_bot_token(token: str) -> None:
    global _BOT_TOKEN
    _BOT_TOKEN = (token or "").strip()
    tail = _BOT_TOKEN[-6:] if _BOT_TOKEN else "NONE"
    _LOG.info(f"[AUTH] set_bot_token OK (tail={tail})")

def _get_bot_token() -> str:
    if not _BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN not set. Call set_bot_token() before make_state_app().")
    return _BOT_TOKEN

WEBAPP_BASE = os.getenv("WEBAPP_BASE", "https://app.alphahusky.win").rstrip("/")
WEBAPP_VER  = os.getenv("WEBAPP_VER",  "2025-09-27_1")  # Zmieniaj przy kaÄąÄ˝dym deployu
BASE_DIR = Path(__file__).resolve().parent
SHARE_STATIC_DIR = BASE_DIR / "assets" / "share_cards"

def _get_users_map(data: dict) -> dict:
    """Zawsze zwraca data['users'] jako dict, nigdy root."""
    if not isinstance(data, dict):
        return {}
    users = data.get("users")
    if not isinstance(users, dict):
        users = {}
        data["users"] = users
    return users

def _get_or_create_user(data: dict, uid: str, default: dict | None = None) -> dict:
    """Pobiera usera WYÄąÂĂ„â€žCZNIE z data['users'] i pilnuje spÄ‚Ĺ‚jnych pÄ‚Ĺ‚l uid/id."""
    uid = str(uid)
    if not uid.isdigit():
        # Guard przed users['fortress'] itd.
        raise ValueError(f"bad uid: {uid}")

    users = _get_users_map(data)
    u = users.get(uid)
    if not isinstance(u, dict):
        u = default if isinstance(default, dict) else {}
        users[uid] = u

    u["uid"] = uid
    u["id"] = uid
    u["user_id"] = uid
    return u

def _webapp_url(src: str = "hub", section: str | None = None, extra: dict | None = None) -> str:
    q = {"src": src, "v": WEBAPP_VER}   # <-- kluczowe: v= do cache-bustingu
    if section:
        q["section"] = section
    if extra:
        q.update(extra)
    return f"{WEBAPP_BASE}/?{urlencode(q)}"

DASHBOARD_URL = f"{WEBAPP_BASE}/dashboard"
# --- CORS config ------------------------------------------------------------
ALLOWED_ORIGINS = {
    "https://app.alphahusky.win",            # prod WebApp (jeÄąâ€şli otwarte poza TG)
    "https://alpha-husky-webapp.vercel.app", # podglĂ„â€¦d Vercel
    "http://localhost:3000",                 # dev
    "https://localhost",                     # Capacitor Android WebView (androidScheme https) for dev companion
    # Telegram Web (rÄ‚Ĺ‚ÄąÄ˝ne warianty)
    "https://web.telegram.org",
    "https://webk.telegram.org",
    "https://webz.telegram.org",
}

# mapowanie akcji z WebApp -> NAZWY funkcji bota
ACTION_MAP = {
    "avatar_open": "show_avatar_menu",
    "mission_open": "dashboard",        # dopasuj jeÄąâ€şli chcesz inny hub
    "inventory_open": "inventory",
    "char_open": "mystats",
    "shop_open": "shop",
    "pets_open": "pets",
}

HUB_KEY = "hub_msg_id"

SUPPORTER_SKIN_KEY = "token_supporter"
SUPPORTER_TAG_KEY = "supporter"
TOKEN_SUPPORTER_SKIN_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1767009222/skins/token_supporter.webp"
BLUE_MOON_HUNTER_SKIN_KEY = "blue_moon_hunter"
BLUE_MOON_HUNTER_SKIN_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1779886756/skins/blue_moon_hunter.webp"
DOMINION_ALPHA_SKIN_KEY = "dominion_alpha"
DOMINION_ALPHA_SKIN_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778921150/skins/dominion_alpha.webp"
UNBROKEN_ALPHA_SKIN_KEY = "unbroken_alpha"
UNBROKEN_ALPHA_SKIN_NAME = "Unbroken Alpha"
FRAME_PREVIEW_CLOUD_ROOT = str(
    os.getenv("FRAME_PREVIEW_CLOUD_ROOT", "https://res.cloudinary.com/dnjwvxinh/image/upload")
).strip().rstrip("/")
FRAME_PREVIEW_VERSION = str(os.getenv("FRAME_PREVIEW_VERSION", "v1775812670")).strip() or "v1775812670"

def _skin_asset_url(raw_url: str, *, rev_env: str, rev_default: str) -> str:
    url = str(raw_url or "").strip()
    if not url:
        return ""
    rev = str(os.getenv(rev_env, rev_default) or "").strip()
    if not rev:
        return url
    return f"{url}{'&' if '?' in url else '?'}v={rev}"

UNBROKEN_ALPHA_SKIN_IMG = _skin_asset_url(
    str(
        os.getenv(
            "UNBROKEN_ALPHA_SKIN_URL",
            "https://res.cloudinary.com/dnjwvxinh/image/upload/skins/unbroken_alpha.webp",
        )
    ).strip()
    or "https://res.cloudinary.com/dnjwvxinh/image/upload/skins/unbroken_alpha.webp",
    rev_env="UNBROKEN_ALPHA_SKIN_REV",
    rev_default="20260408",
)
UNBROKEN_ALPHA_SKIN_FALLBACK_URL = _skin_asset_url(
    str(os.getenv("UNBROKEN_ALPHA_SKIN_FALLBACK_URL", "") or "").strip(),
    rev_env="UNBROKEN_ALPHA_SKIN_FALLBACK_REV",
    rev_default="20260408",
)
SUPPORTER_FRAME_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/f_auto,q_auto/v1771250188/frames/frame_supporter.webp"


def _cloudinary_frame_preview_url(frame_key: str) -> str:
    key = str(frame_key or "").strip()
    if not key:
        return ""
    return f"{FRAME_PREVIEW_CLOUD_ROOT}/{FRAME_PREVIEW_VERSION}/frames/{key}.webp"


BELIEVE_SUPPORT_SKIN_URL = _skin_asset_url(
    str(
        os.getenv(
            "BELIEVE_SUPPORT_SKIN_URL",
            "https://res.cloudinary.com/dnjwvxinh/image/upload/skins/believe_holder.webp",
        )
    ).strip()
    or "https://res.cloudinary.com/dnjwvxinh/image/upload/skins/believe_holder.webp",
    rev_env="BELIEVE_SUPPORT_SKIN_REV",
    rev_default="20260408",
)
BELIEVE_SUPPORT_SKIN_FALLBACK_URL = _skin_asset_url(
    str(os.getenv("BELIEVE_SUPPORT_SKIN_FALLBACK_URL", "") or "").strip(),
    rev_env="BELIEVE_SUPPORT_SKIN_FALLBACK_REV",
    rev_default="20260408",
)
PATRON_FRAME_URL = str((SUPPORT_TIERS.get("patron") or {}).get("frame_url") or "").strip()
FOUNDER_FRAME_URL = str((SUPPORT_TIERS.get("founder") or {}).get("frame_url") or "").strip()
FOUNDER_EMBER_FRAME_KEY = "founder_ember_mark"
FOUNDER_EMBER_FRAME_URL = str(
    os.getenv("FOUNDER_EMBER_FRAME_URL", _cloudinary_frame_preview_url(FOUNDER_EMBER_FRAME_KEY))
).strip() or _cloudinary_frame_preview_url(FOUNDER_EMBER_FRAME_KEY)
DUAL_SUPPORT_FRAME_ASSET_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777291650/frames/dual_frame.webp"
BLUE_SIGNAL_FRAME_PREVIEW_URL = str(
    os.getenv(
        "BLUE_SIGNAL_FRAME_URL",
        "https://res.cloudinary.com/dnjwvxinh/image/upload/v1780131915/frames/blue_moon_frame.webp",
    )
).strip() or "https://res.cloudinary.com/dnjwvxinh/image/upload/v1780131915/frames/blue_moon_frame.webp"
GENESIS_FRAME_KEY = "genesis_frame"
GENESIS_FRAME_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777369188/frames/genesis_frame.webp"

# Archive Cracker Frame (Burned Archive 30-breach milestone)
ARCHIVE_CRACKER_FRAME_KEY = "archive_cracker_frame"
ARCHIVE_CRACKER_FRAME_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1780131359/frames/archive_cracker_frame.webp"

_STARTER_FRAME_SVG = (
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 620'>"
    "<defs>"
    "<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>"
    "<stop offset='0%' stop-color='#86efac' stop-opacity='0.85'/>"
    "<stop offset='100%' stop-color='#22d3ee' stop-opacity='0.85'/>"
    "</linearGradient>"
    "</defs>"
    "<rect x='9' y='9' width='402' height='602' rx='32' ry='32' fill='none' stroke='url(#g)' stroke-width='14'/>"
    "<rect x='24' y='24' width='372' height='572' rx='24' ry='24' fill='none' stroke='rgba(255,255,255,0.34)' stroke-width='4'/>"
    "</svg>"
)
STARTER_FRAME_URL = "data:image/svg+xml;utf8," + urllib.parse.quote(_STARTER_FRAME_SVG, safe="")
ALPHA_PRIME_FRAME_KEY = "alpha_prime_frame"
_ALPHA_PRIME_FRAME_FALLBACK_URL = (
    "https://res.cloudinary.com/dnjwvxinh/image/upload/v1780400417/frames/prime_frame.webp"
)
ALPHA_PRIME_FRAME_URL = str(
    os.getenv("ALPHA_PRIME_FRAME_URL", _ALPHA_PRIME_FRAME_FALLBACK_URL)
).strip() or _ALPHA_PRIME_FRAME_FALLBACK_URL
ALPHA_PRIME_FRAME_PREVIEW_URL = str(
    os.getenv("ALPHA_PRIME_FRAME_PREVIEW_URL", ALPHA_PRIME_FRAME_URL) or ALPHA_PRIME_FRAME_URL
).strip() or ALPHA_PRIME_FRAME_URL
GENESIS_FRAME_PREVIEW_URL = GENESIS_FRAME_URL
HOWLPAY_TEST_FRAME_KEY = "howlpay_test_frame"
HOWLPAY_TEST_FRAME_NAME = "HOWL Test Frame"
HOWLPAY_TEST_FRAME_URL = GENESIS_FRAME_PREVIEW_URL

SUPPORT_SKIN_TO_TIER = {
    "pack_veteran": "pack_veteran_skin",
}

# --- Avatars (shared with bot) ---
try:
    from avatars import AVATAR_LIST  # lista sÄąâ€šownikÄ‚Ĺ‚w z "key", "name", "emoji", "img", ...
except Exception:
    AVATAR_LIST = []

AVATAR_BY_KEY = {av.get("key"): av for av in AVATAR_LIST if av.get("key")}
ALLOWED_AVATAR_KEYS = set(AVATAR_BY_KEY.keys())
DEFAULT_AVATAR_KEY = next(iter(ALLOWED_AVATAR_KEYS), None) or "rogue_howler"

def _uid(u) -> str:
    return str(u.get("id") or u.get("user_id") or u.get("uid") or "")

import time, secrets, re

_RUNID_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9:_\-\.\@]{0,140}$")

def _get_run_id(body: dict, prefix: str, uid: str, extra: str = "") -> str:
    """
    WebApp run_id helper (idempotency).
    Uses client-provided body['run_id'] if valid, otherwise generates one.
    """
    body = body or {}
    rid = ""
    try:
        rid = str(body.get("run_id") or body.get("rid") or "").strip()
    except Exception:
        rid = ""

    if rid and _RUNID_RE.match(rid):
        return rid

    ts = int(time.time() * 1000)
    nonce = secrets.token_hex(4)
    base = f"{prefix}:{uid}:{extra}:{ts}:{nonce}"
    base = re.sub(r"[^a-zA-Z0-9:_\-\.\@]", "_", base)[:140]
    return base

_EQUIP_SLOTS = {
  "weapon","armor","cloak","collar","helmet","ring","offhand",
  "fangs","gloves","pet"
}

def _users_map(data: dict):
    users = data.get("users")
    return users if isinstance(users, dict) else data

def _get_user(data: dict, uid: str):
    users = _users_map(data)
    u = users.get(uid) if isinstance(users, dict) else None
    return users, u

def _norm_asset_path(p: str) -> str:
    p = (p or "").strip()
    p = re.sub(r"\s*/\s*", "/", p)
    return p

_RESERVED_KEYS = {"key", "id", "effect", "type", "seconds", "sec", "duration", "duration_sec", "ttl", "uses", "desc"}

def _normalize_special_effect(meta: dict):
    """
    Zwraca (effect_key: str|None, effect_params: dict).
    ObsÄąâ€šuguje:
      - "special_effect": "alpha_surge"
      - "special_effect": {"key":"alpha_surge","seconds":3600,"loot_mult":1.2,...}
    """
    effect_raw = meta.get("special_effect") or meta.get("specialEffect") or meta.get("effect")

    effect_key = None
    effect_params = {}

    if isinstance(effect_raw, str):
        effect_key = effect_raw.strip() or None

    elif isinstance(effect_raw, dict):
        effect_key = (
            effect_raw.get("key")
            or effect_raw.get("id")
            or effect_raw.get("effect")
            or effect_raw.get("type")
        )
        if isinstance(effect_key, str):
            effect_key = effect_key.strip() or None
        else:
            effect_key = None

        # reszta pÄ‚Ĺ‚l jako parametry
        effect_params = {k: v for k, v in effect_raw.items() if k not in ("key", "id", "effect", "type")}

    elif effect_raw is not None:
        # awaryjnie: cokolwiek -> string
        effect_key = str(effect_raw).strip() or None

    # gwarancja: params zawsze dict
    if not isinstance(effect_params, dict):
        effect_params = {}

    return effect_key, effect_params

import time

def _legacy_build_buffs_payload_ro(u: dict):
    now = int(time.time())

    root = u.get("active_effects") or {}
    if not isinstance(root, dict):
        root = {}

    items = []

    def pick_int(meta, *keys, default=0):
        for k in keys:
            v = meta.get(k)
            if isinstance(v, (int, float)) and int(v) > 0:
                return int(v)
        return int(default)

    for key, meta in root.items():
        if not isinstance(meta, dict):
            continue

        kind = (meta.get("kind") or meta.get("type") or "").lower()

        ends_at = pick_int(meta, "endsAt", "ends_at", "until", "expiresAt", default=0)
        uses_left = pick_int(meta, "usesLeft", "uses_left", "uses", "charges", default=0)

        # timed Ă˘â€ â€™ tylko aktywne
        if ends_at > 0 and ends_at <= now:
            continue

        remaining = (ends_at - now) if ends_at > 0 else None
        desc = str(meta.get("desc") or meta.get("description") or key)

        # payload moÄąÄ˝e byĂ„â€ˇ w meta["payload"] albo rozlane po top-level
        payload = meta.get("payload")
        if not isinstance(payload, dict):
            payload = {}

        items.append({
            "key": str(key),
            "kind": kind or ("uses" if uses_left > 0 else "timed"),
            "desc": desc,
            "endsAt": ends_at if ends_at > 0 else None,
            "remainingSec": remaining,
            "usesLeft": uses_left if uses_left > 0 else None,
            "payload": payload,
        })

    # sort: najszybciej koÄąâ€žczĂ„â€¦ce siĂ„â„˘ na gÄ‚Ĺ‚rze
    items.sort(key=lambda x: int(x.get("endsAt") or 10**18))

    # buffsLine (krÄ‚Ĺ‚tki pasek pod nickiem)
    def fmt_rem(sec):
        if sec is None:
            return ""
        sec = max(0, int(sec))
        m = sec // 60
        if m >= 60:
            h = m // 60
            mm = m % 60
            return f"{h}h {mm}m"
        return f"{m}m"

    parts = []
    for it in items[:2]:
        if it.get("usesLeft"):
            parts.append(f"{it['desc']} ({it['usesLeft']} uses)")
        elif it.get("remainingSec") is not None:
            parts.append(f"{it['desc']} ({fmt_rem(it['remainingSec'])})")
        else:
            parts.append(it["desc"])

    buffs_line = " Ă‚Â· ".join(parts)

    return buffs_line, items


_ACTIVE_SIGNAL_NAME_MAP = {
    "mission_speed_boost": "Energy Drink",
    "xp_gain": "XP Surge",
    "xp_surge": "XP Surge",
    "dice_luck": "Chaos Dice",
    "cooldown_reduction": "Speed Boost",
    "energy_boost": "Speed Boost",
    "double_feed": "Turbo Bone",
    "plushie_protect": "Husky Plushie",
    "rune_polish": "Rune Polish",
    "scent_trail": "Scent Trail",
    "alpha_surge": "Alpha Surge",
}


def _format_active_signal_remaining_text(left_sec: object, uses: object) -> str:
    try:
        left = int(left_sec) if left_sec is not None else None
    except Exception:
        left = None
    try:
        remaining_uses = int(uses) if uses is not None else None
    except Exception:
        remaining_uses = None

    if left is not None and left > 0:
        mins = left // 60
        if mins >= 60:
            hours = mins // 60
            rem_mins = mins % 60
            return f"{hours}h {rem_mins}m left"
        if mins > 0:
            return f"{mins}m left"
        return f"{left}s left"

    if remaining_uses is not None and remaining_uses > 0:
        return f"{remaining_uses} use{'s' if remaining_uses != 1 else ''} left"

    return ""


def _build_active_signal_effect_label(effect_key: str, meta: dict) -> str:
    if not isinstance(meta, dict):
        return ""

    payload = meta.get("payload") if isinstance(meta.get("payload"), dict) else {}
    for src in (meta, payload):
        for field in ("effectLabel", "effect_label", "shortLabel", "short_label"):
            value = str(src.get(field) or "").strip()
            if value:
                return value

    key = str(effect_key or "").strip().lower()

    def _fmt_pct(mult: object) -> str:
        try:
            num = float(mult)
        except Exception:
            return ""
        pct = int(round((num - 1.0) * 100))
        if pct == 0:
            return ""
        sign = "+" if pct > 0 else ""
        return f"{sign}{pct}%"

    bonus_pct = _fmt_pct(meta.get("bonus"))
    loot_pct = _fmt_pct(meta.get("loot_mult"))
    bones_pct = _fmt_pct(meta.get("bones_mult"))

    if key in ("xp_gain", "xp_surge") and bonus_pct:
        return f"{bonus_pct} XP"
    if key == "dice_luck":
        try:
            pct = int(round(float(meta.get("luck_bonus") or 0) * 100))
        except Exception:
            pct = 0
        if pct > 0:
            return f"+{pct}% luck"
    if key in ("mission_speed_boost", "boost_next_mission_speed"):
        speed_pct = _fmt_pct(meta.get("speed_mult"))
        if speed_pct:
            return f"Mission speed {speed_pct}"
    if key in ("cooldown_reduction", "energy_boost"):
        try:
            factor = float(meta.get("factor") or 0)
        except Exception:
            factor = 0.0
        if factor > 0:
            pct = int(round((1.0 - factor) * 100))
            if pct > 0:
                return f"Cooldowns -{pct}%"
    if key == "double_feed":
        return "No feed cooldown"
    if key == "plushie_protect":
        return "Blocks 1 failure"
    if key == "rune_polish":
        try:
            bonus = int(meta.get("virtual_refine_bonus") or 0)
        except Exception:
            bonus = 0
        if bonus > 0:
            return f"+{bonus} refine pressure"
    if key == "scent_trail":
        return "Rare loot boost"
    if key == "alpha_surge":
        parts = []
        if bonus_pct:
            parts.append(f"{bonus_pct} XP")
        if loot_pct:
            parts.append(f"{loot_pct} loot")
        if bones_pct:
            parts.append(f"{bones_pct} bones")
        return ", ".join(parts[:3])

    return ""


def _build_active_buffs_payload_ro(u: dict, buffs_full: list | None = None) -> list[dict]:
    root = u.get("active_effects") or {}
    if not isinstance(root, dict):
        root = {}

    full = buffs_full if isinstance(buffs_full, list) else []
    visible_index = {
        str(item.get("key") or ""): item
        for item in build_visible_active_effects(u if isinstance(u, dict) else {})
        if isinstance(item, dict) and str(item.get("key") or "")
    }
    out = []

    for item in full:
        if not isinstance(item, dict):
            continue
        key = str(item.get("key") or "").strip()
        meta = root.get(key) if isinstance(root.get(key), dict) else {}
        desc = str(meta.get("desc") or "").strip()
        name = str(_ACTIVE_SIGNAL_NAME_MAP.get(key) or desc or key.replace("_", " ").title()).strip()
        left_sec = item.get("left_sec")
        uses = item.get("uses")
        expires_at = meta.get("expires_at") if isinstance(meta.get("expires_at"), (int, float)) else None
        remaining_text = _format_active_signal_remaining_text(left_sec, uses)
        effect_label = _build_active_signal_effect_label(key, meta)
        visible = visible_index.get(key) if isinstance(visible_index.get(key), dict) else {}
        cancellable = key in CANCELLABLE_ACTIVE_EFFECTS

        out.append({
            "id": key or name.lower().replace(" ", "_"),
            "key": key,
            "name": name,
            "label": name,
            "description": str(visible.get("description") or "").strip(),
            "remainingText": remaining_text,
            "expiresAt": int(expires_at) if isinstance(expires_at, (int, float)) else None,
            "remainingUses": int(uses) if isinstance(uses, int) else (int(uses) if isinstance(uses, float) else None),
            "effectLabel": effect_label,
            "cancellable": cancellable,
            "cancelHint": "End early with no refund. Reactivation is locked for 1 hour." if cancellable else "",
        })

    return out

def _cinematic_reveal(title: str, lines: list[str]) -> str:
    title = str(title or "Lootbox")
    lines = [str(x).strip() for x in (lines or []) if str(x).strip()]

    out = ["Ă˘ĹˇË‡ LOOT REVEAL Ă˘ĹˇË‡", f"Ä‘Ĺşâ€śÂ¦ {title}", ""]
    for ln in lines[:10]:
        out.append(f"Ă˘â‚¬Ë {ln}")
    if len(lines) > 10:
        out.append(f"Ă˘â‚¬Â¦and +{len(lines)-10} more")
    out += ["", "Ä‘ĹşÂĹź Pack secured it."]
    return "\n".join(out)

SUPPORT_TIERS = {
    "supporter": {
        "stars": 700,  # <-- ustaw jak chcesz
        "title": "Alpha Husky Ă˘â‚¬â€ť Supporter",
        "desc":  "Unlock Supporter tag + Supporter frame",
        "frame": "supporter.webp",
        "tag":   "supporter",
    },
    "patron": {
        "stars": 1400,  # <-- ustaw jak chcesz
        "title": "Alpha Husky Ă˘â‚¬â€ť Patron",
        "desc":  "Unlock Patron tag + Patron frame",
        "frame": "patron.webp",
        "tag":   "patron",
    },
    # founder raczej admin/self-claim, bez pÄąâ€šatnoÄąâ€şci
}

async def _tg_create_invoice_link(*, bot_token: str, title: str, description: str, payload: str, stars_amount: int) -> str:
    """
    Telegram Bot API: createInvoiceLink
    Stars: currency='XTR' i provider_token='' (pusty string). :contentReference[oaicite:2]{index=2}
    """
    url = f"https://api.telegram.org/bot{bot_token}/createInvoiceLink"
    body = {
        "title": title,
        "description": description,
        "payload": payload,
        "provider_token": "",     # Stars
        "currency": "XTR",        # Stars
        "prices": [{"label": "Stars", "amount": int(stars_amount)}],
    }

    async with aiohttp.ClientSession() as sess:
        async with sess.post(url, json=body, timeout=15) as resp:
            data = await resp.json(content_type=None)
            if not data.get("ok"):
                raise RuntimeError(f"createInvoiceLink failed: {data}")
            return data["result"]

async def skins_support_invoice_handler(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    key = str(body.get("skin") or "").strip().lower()
    if not key:
        return web.json_response({"ok": False, "reason": "NO_SKIN"}, status=400)

    tier = SUPPORT_SKIN_TO_TIER.get(key)
    if not tier:
        return web.json_response({
            "ok": False,
            "reason": "INVALID_SUPPORT_SKIN",
            "skin": key,
        }, status=400)

    # IMPORTANT: use module import here to avoid stale/shadowed alias
    import support_stars as _ss

    cfg = _ss.SUPPORT_TIERS.get(tier)
    if not isinstance(cfg, dict):
        return web.json_response({
            "ok": False,
            "reason": "BAD_TIER_CFG",
            "skin": key,
            "tier": tier,
            "supportTierKeys": list(_ss.SUPPORT_TIERS.keys()) if isinstance(_ss.SUPPORT_TIERS, dict) else str(type(_ss.SUPPORT_TIERS)),
            "cfg": cfg,
            "module": getattr(_ss, "__file__", ""),
        }, status=500)

    # already owned? don't create invoice again
    u = await read_user(uid)
    if isinstance(u, dict):
        try:
            _ensure_cosmetics(u)
        except Exception:
            pass

        if _has_skin(u, key):
            return web.json_response({
                "ok": True,
                "already": True,
                "owned": True,
                "skin": key,
            })

    bot_token = _get_bot_token()
    if not bot_token:
        return web.json_response({"ok": False, "reason": "BOT_TOKEN_MISSING"}, status=500)

    run_id = _get_run_id(body, "support_skin_invoice", uid, key)
    payload = _ss.build_support_payload(tier, uid, run_id)

    try:
        link = await _ss.tg_create_invoice_link(
            bot_token=bot_token,
            title=str(cfg.get("title") or "Alpha Husky Support"),
            description=str(cfg.get("desc") or "Support unlock"),
            payload=payload,
            stars_amount=int(cfg.get("stars") or 0),
        )
    except Exception as e:
        return web.json_response({
            "ok": False,
            "reason": "INVOICE_FAILED",
            "error": str(e),
            "skin": key,
            "tier": tier,
        }, status=500)

    return web.json_response({
        "ok": True,
        "invoiceLink": link,
        "skin": key,
        "tier": tier,
        "stars": int(cfg.get("stars") or 0),
    })

async def webapp_support_invoice(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    tier = (body.get("tier") or body.get("supportTier") or "").strip().lower()
    run_id = (body.get("run_id") or body.get("runId") or "").strip()

    cfg = SUPPORT_TIERS.get(tier)
    if not cfg:
        return web.json_response({"ok": False, "reason": "BAD_TIER"}, status=400)

    if not run_id:
        run_id = str(int(time.time()))
    payload = f"support:{tier}:{uid}:{run_id}"

    try:
        token = _get_bot_token()
        link = await tg_create_invoice_link(
            bot_token=token,
            title=cfg["title"],
            description=cfg["desc"],
            payload=payload,
            stars_amount=int(cfg["stars"]),
        )
    except Exception as e:
        _LOG.exception("[SUPPORT] invoice error tier=%s uid=%s", tier, uid)
        return web.json_response({"ok": False, "reason": "INVOICE_FAIL", "detail": str(e)}, status=500)

    return web.json_response({"ok": True, "invoiceLink": link, "payload": payload})

def _grant_box_assets(uid: str, user: dict, *, bones=0, scrap=0, rune_dust=0, shards=None, reason="box_open", run_id=None):
    """
    Ledger-first grant:
      bones/scrap/rune_dust + per-slot shards via "<slot>_shards"
    Also mirrors into user["materials"] via ledger_apply_to_user so WebApp state stays consistent.
    """
    assets: dict[str, int] = {}

    if int(bones or 0) > 0:
        assets["bones"] = int(bones)
    if int(scrap or 0) > 0:
        assets["scrap"] = int(scrap)
    if int(rune_dust or 0) > 0:
        assets["rune_dust"] = int(rune_dust)

    shards = shards or {}
    if isinstance(shards, dict):
        for slot, amt in shards.items():
            a = int(amt or 0)
            if a <= 0:
                continue
            s = str(slot or "").strip().lower() or "weapon"
            k = f"{s}_shards"
            assets[k] = int(assets.get(k, 0)) + a

    if assets:
        credit_many(
            uid,
            assets,
            reason=reason,
            run_id=run_id,
            note=reason,
            mirror_user=user,
        )
        # make sure materials snapshot is fresh for UI
        try:
            ledger_apply_to_user(user, assets=None)
        except Exception:
            pass

    return assets


def _pick_gear_key_from_all_items(slot: str, rarity: str, rng: random.Random):
    slot = str(slot or "").strip().lower()
    rarity = str(rarity or "").strip().lower()
    if not slot:
        return None

    pool = []
    for k, it in (ALL_ITEMS or {}).items():
        if not isinstance(it, dict):
            continue
        # ignore boxes/consumables
        t = str(it.get("type") or "").lower()
        if t == "consumable":
            continue
        if k in ("mystery_box", "premium_box", "legendary_box"):
            continue

        r = str(it.get("rarity") or "").lower()
        if rarity and r != rarity:
            continue

        s = str(it.get("slot") or "").lower()
        if s != slot:
            continue

        pool.append(k)

    if not pool:
        return None
    return rng.choice(pool)


def _apply_box_drops_webapp(
    uid: str,
    user: dict,
    inv_items: dict,
    box_key: str,
    drops: list[dict],
    *,
    seed: str,
    run_id: str,
):
    """
    Applies drops to ledger (materials/shards) and inventory (consumables/gear).
    Returns cinematic lines.
    Includes run_id idempotency cache for WebApp retries.
    """

    import time
    import random

    # ---------------- idempotency (prevents double grants) ----------------
    cache = user.get("boxOpenRuns")
    if not isinstance(cache, dict):
        cache = {}
        user["boxOpenRuns"] = cache

    cached = cache.get(run_id)
    if isinstance(cached, dict) and isinstance(cached.get("lines"), list):
        # already granted for this run_id -> return exact same lines
        return cached["lines"]

    # keep cache small
    try:
        if len(cache) > 60:
            # drop oldest-ish (unordered dict, fine)
            for k in list(cache.keys())[:20]:
                cache.pop(k, None)
    except Exception:
        pass

    # ---------------- config: full gear rules per box ----------------
    # Global flag + per-box override:
    # - Legendary: usually YES (chase box)
    # - Premium: usually NO (shard-pack heavy)
    full_global = bool(globals().get("ENABLE_FULL_GEAR_DROPS", False))
    full_override = {
        "mystery_box": False,
        "premium_box": False,     # <- change to True if you want Premium to drop full gear too
        "legendary_box": True,    # <- chase box
    }
    full_ok = bool(full_override.get(box_key, full_global))

    # fallback shards on failed gear roll (rarity-based)
    fallback_shards_by_rarity = {
        "common": 12,
        "uncommon": 18,
        "rare": 26,
        "epic": 36,
        "legendary": 55,
    }

    # cinematic rarity tags
    rarity_tag = {
        "common": "COMMON",
        "uncommon": "UNCOMMON",
        "rare": "RARE",
        "epic": "EPIC",
        "legendary": "LEGENDARY",
    }

    bones = scrap = dust = tokens = 0
    shards: dict[str, int] = {}
    gained_items: list[str] = []
    gained_gear: list[str] = []

    rng = random.Random(seed + ":box")

    for d in (drops or []):
        if not isinstance(d, dict):
            continue

        typ = str(d.get("type") or "").strip().lower()

        # ignore pity records if any slip through
        if typ == "pity":
            continue

        try:
            amt = int(d.get("amount") or 0)
        except Exception:
            amt = 0
        if amt <= 0:
            amt = 1

        if typ == "bones":
            bones += amt
            continue

        if typ == "scrap":
            scrap += amt
            continue

        if typ in ("rune_dust", "runedust"):
            dust += amt
            continue

        if typ == "tokens":
            tokens += amt
            continue

        if typ == "shards":
            slot = str(d.get("slot") or "weapon").strip().lower() or "weapon"
            shards[slot] = int(shards.get(slot, 0)) + amt
            continue

        if typ == "consumable":
            k = str(d.get("key") or "").strip()
            if k and k in ALL_ITEMS:
                add_item(inv_items, k, amt)
                nm = (ALL_ITEMS.get(k) or {}).get("name", k)
                gained_items.append(f"{amt}Ä‚â€” {nm}")
            continue

        if typ == "gear_roll":
            slot = str(d.get("slot") or "weapon").strip().lower() or "weapon"
            rarity = str(d.get("rarity") or "common").strip().lower() or "common"
            n = max(1, int(amt))

            for _ in range(n):
                # try full gear (if enabled for this box)
                if full_ok:
                    pick = _pick_gear_key_from_all_items(slot, rarity, rng)
                    if pick:
                        # try idempotent / run-aware autodupe if supported
                        auto = 0
                        try:
                            auto = add_item_autodupe(user, pick, qty=1, run_id=run_id)
                        except TypeError:
                            auto = add_item_autodupe(user, pick, qty=1)

                        nm = (ALL_ITEMS.get(pick) or {}).get("name", pick)
                        tag = rarity_tag.get(rarity, rarity.upper())
                        gained_gear.append(f"{tag} {slot.title()}: {nm}" + (f" Ă˘â„˘Â»ÄŹÂ¸Ĺąx{auto}" if auto else ""))
                        continue

                # fallback to shards when full gear is off / or no pool match
                shards_amt = int(fallback_shards_by_rarity.get(rarity, 25))
                shards[slot] = int(shards.get(slot, 0)) + shards_amt

            continue

    # ---- ledger / assets apply (idempotent by run_id) ----
    try:
        granted = _grant_box_assets(
            uid,
            user,
            bones=bones,
            scrap=scrap,
            rune_dust=dust,
            tokens=tokens,
            shards=shards,
            reason=f"box_open:{box_key}",
            run_id=run_id,
        )
    except TypeError:
        # starsza wersja _grant_box_assets bez tokens=
        granted = _grant_box_assets(
            uid,
            user,
            bones=bones,
            scrap=scrap,
            rune_dust=dust,
            shards=shards,
            reason=f"box_open:{box_key}",
            run_id=run_id,
        )

    # ---- Build cinematic lines ----
    lines: list[str] = []

    if bones:
        lines.append(f"+{bones} Bones")
    if scrap:
        lines.append(f"+{scrap} Scrap")
    if dust:
        lines.append(f"+{dust} Rune Dust")
    if tokens:
        lines.append(f"+{tokens} Tokens")

    # Shards from ledger assets
    for a, v in (granted or {}).items():
        try:
            vv = int(v)
        except Exception:
            vv = 0
        if vv <= 0:
            continue
        if str(a).endswith("_shards"):
            slot = str(a).replace("_shards", "")
            lines.append(f"+{vv} {slot.title()} Shards")

    if gained_items:
        short = ", ".join(gained_items[:3])
        if len(gained_items) > 3:
            short += f" +{len(gained_items)-3}"
        lines.append("Items: " + short)

    if gained_gear:
        short = ", ".join(gained_gear[:3])
        if len(gained_gear) > 3:
            short += f" +{len(gained_gear)-3}"
        lines.append("Gear: " + short)

    if not lines:
        lines = ["No loot"]

    # save cache for retry/idempotency
    cache[run_id] = {
        "ts": int(time.time()),
        "box": box_key,
        "lines": lines,
    }

    return lines

def _apply_consumable_special_effect(user_data: dict, effect_key: str, effect_params: dict, SPECIAL_EFFECTS: dict):
    """
    Aplikuje efekt do user_data['active_effects'] zgodnie z helperami:
      - timed: start_timed_effect(...)
      - uses:  start_uses_effect(...)
    DziaÄąâ€ša, jeÄąâ€şli SPECIAL_EFFECTS[effect_key] jest dictem ze specem.
    """
    if not effect_key or effect_key not in SPECIAL_EFFECTS:
        return None

    spec = SPECIAL_EFFECTS[effect_key]

    # pozwalamy na spec dict (najbezpieczniej). JeÄąâ€şli masz callable Ă˘â‚¬â€ś teÄąÄ˝ da siĂ„â„˘, ale to osobny wariant.
    if not isinstance(spec, dict):
        return None

    kind = (spec.get("kind") or spec.get("type") or "timed").lower()

    # parametry z itema majĂ„â€¦ prawo nadpisaĂ„â€ˇ te z SPECIAL_EFFECTS
    desc = effect_params.get("desc") or spec.get("desc")

    # payload = spec.payload + effect_params bez pÄ‚Ĺ‚l sterujĂ„â€¦cych
    payload = {}
    spec_payload = spec.get("payload")
    if isinstance(spec_payload, dict):
        payload.update(spec_payload)

    payload.update({k: v for k, v in effect_params.items() if k not in _RESERVED_KEYS})

    # seconds / uses: item moÄąÄ˝e podaĂ„â€ˇ seconds/uses, w innym wypadku bierzemy z speca
    def _pick_int(*vals, default=0):
        for v in vals:
            if isinstance(v, (int, float)) and int(v) > 0:
                return int(v)
        return int(default)

    seconds = _pick_int(
        effect_params.get("seconds"),
        effect_params.get("sec"),
        effect_params.get("duration"),
        effect_params.get("duration_sec"),
        effect_params.get("ttl"),
        spec.get("seconds"),
        spec.get("duration"),
        spec.get("ttl"),
        default=0
    )

    uses = _pick_int(
        effect_params.get("uses"),
        spec.get("uses"),
        default=0
    )

    if kind in ("uses", "use", "charges", "stack"):
        if uses <= 0:
            # jeÄąâ€şli spec mÄ‚Ĺ‚wi uses, ale item nie podaÄąâ€š i spec nie ma Ă˘â‚¬â€ť nic nie rÄ‚Ĺ‚b
            return None
        return start_uses_effect(user_data, effect_key, uses=uses, desc=desc, **payload)

    # default: timed
    if seconds <= 0:
        return None
    return start_timed_effect(user_data, effect_key, seconds=seconds, desc=desc, **payload)

def _sanitize_pet_key(x: str) -> str:
    x = (x or "").strip().lower()
    x = re.sub(r"[^a-z0-9_\-]+", "", x)
    return x

def _pet_icon_key(pet_id: str, pet: dict) -> str:
    blacklist = {"husky", "feral", "trickster", "mystic", "wolf", "cat"}
    for cand in (
        pet.get("pet_key"),
        pet.get("type"),
        pet.get("pet_id"),
        pet_id,
    ):
        k = _sanitize_pet_key(str(cand or ""))
        if k and k not in blacklist:
            return k
    nm = str(pet.get("name") or "")
    return _sanitize_pet_key(nm.replace(" ", ""))

def _cloudinary_pet_url(pet_key: str) -> str:
    root = os.getenv("CLOUDINARY_PETS_ROOT", "https://res.cloudinary.com/dnjwvxinh/image/upload").rstrip("/")
    ver  = os.getenv("CLOUDINARY_PETS_VER", "").strip().strip("/")  # np. v1766940831
    pet_key = _sanitize_pet_key(pet_key)
    if not pet_key:
        return ""
    return f"{root}/{ver}/pets/{pet_key}.png" if ver else f"{root}/pets/{pet_key}.png"

def _resolve_item_icon(item_key: str, meta: dict) -> str:
    """
    Resolve item icon URL.

    - If meta.icon/image/... is an external URL -> return as-is
    - If meta.icon points to local repo assets (/assets/equip/..., /assets/items/..., /assets/skins/...)
      -> map to Cloudinary folders equip/items/skins
    - Otherwise derive by slot/type + item_key
    """
    meta = meta or {}
    icon = (
        meta.get("icon")
        or meta.get("image_app")
        or meta.get("image")
        or meta.get("image_path")
        or ""
    )
    icon = _norm_asset_path(icon)

    # External URLs stay as-is
    if icon.startswith("http://") or icon.startswith("https://"):
        return icon

    cloud_name = "dnjwvxinh"
    base = f"https://res.cloudinary.com/{cloud_name}/image/upload/f_auto,q_auto"

    def _strip_ext(s: str) -> str:
        s = (s or "").split("?", 1)[0].split("#", 1)[0].strip()
        for ext in (".png", ".webp", ".jpg", ".jpeg"):
            if s.lower().endswith(ext):
                return s[: -len(ext)]
        return s

    def _mk(folder: str, public_id: str) -> str:
        folder = (folder or "").strip().strip("/")
        public_id = (public_id or "").strip().strip("/")
        if not public_id:
            return ""
        return f"{base}/{folder}/{public_id}"

    # If icon is an absolute local path but NOT under assets, keep it (UI icons, map overlays etc.)
    # Example: "/images/ui/lock.svg"
    if icon.startswith("/") and not icon.startswith("/assets/"):
        return icon

    # Map explicit local asset paths to Cloudinary
    if icon:
        p = icon.lstrip("/")  # "/assets/equip/x.png" -> "assets/equip/x.png"

        mapping = (
            ("assets/equip/", "equip"),
            ("assets/items/", "items"),
            ("assets/skins/", "skins"),
            ("assets/pets/", "pets"),   # Ă˘Ĺ›â€¦ DODAJ
            ("equip/", "equip"),
            ("items/", "items"),
            ("skins/", "skins"),
            ("pets/", "pets"),
        )

        for pref, folder in mapping:
            if p.startswith(pref):
                rest = p[len(pref):]
                pid = _strip_ext(rest)
                url = _mk(folder, pid)
                if url:
                    return url

    # Fallback classification by slot/type + item_key
    slot = str(meta.get("slot") or "").strip().lower()
    typ  = str(meta.get("type") or "").strip().lower()

    if "skin" in (item_key or "").lower() or typ in ("skin", "cosmetic_skin"):
        return _mk("skins", item_key)
    
    if slot == "pet" or typ == "pet":
        return _mk("pets", item_key)

    if slot in _EQUIP_SLOTS or typ in ("gear", "weapon", "armor", "equipment"):
        return _mk("equip", item_key)

    return _mk("items", item_key)

def _avatar_key_normalized(u: dict) -> str:
    """ZwrÄ‚Ĺ‚Ă„â€ˇ bezpieczny klucz avatara; migruje stare wartoÄąâ€şci jeÄąâ€şli trzeba."""
    raw = str(u.get("avatar") or "").strip().lower()
    if raw in ALLOWED_AVATAR_KEYS:
        return raw
    # back-compat: kiedyÄąâ€ş ktoÄąâ€ş mÄ‚Ĺ‚gÄąâ€š zapisaĂ„â€ˇ Äąâ€şcieÄąÄ˝kĂ„â„˘ obrazka
    if raw.startswith("assets/"):
        for k, av in AVATAR_BY_KEY.items():
            if (av.get("img") or "").strip().lower() == raw:
                return k
    return DEFAULT_AVATAR_KEY

def _users_dict(d: dict):
    if isinstance(d, dict) and isinstance(d.get("users"), dict):
        return d["users"]
    return d if isinstance(d, dict) else {}

def _pick_user(d: dict, uid: str):
    """
    Prefer data["users"][uid], fallback to legacy data[uid].
    Returns: (user_or_None, src)
    """
    if isinstance(d, dict) and isinstance(d.get("users"), dict):
        u = d["users"].get(uid)
        if isinstance(u, dict):
            return u, "users"
        u2 = d.get(uid)
        if isinstance(u2, dict):
            return u2, "root_fallback"
        return None, "users_missing"

    if isinstance(d, dict):
        u = d.get(uid)
        if isinstance(u, dict):
            return u, "root"

    return None, "no_data"

async def _get_user_from_request(request: web.Request):
    """
    Uniwersalna funkcja do pobierania usera z init_data.
    Wersja datastore-safe:
      - /state endpointy: tylko READ (read_user)
      - zero load_data/save_data
    Zwraca (uid, user, data_all, body) dla kompatybilnoÄąâ€şci,
    ale data_all zawsze = None (ÄąÄ˝eby nie kusiÄąâ€šo save_data()).
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    init_data = _extract_init_data(request, body)

    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        raise web.HTTPUnauthorized(reason=reason)

    uid = str(tg_user["id"])

    user = await read_user(uid)
    if not isinstance(user, dict):
        raise web.HTTPNotFound(reason="user_not_found")

    # Ă˘Ĺ›â€¦ compat tuple shape: (uid, user, data_all, body)
    return uid, user, None, body



def _has_skin(u: dict, key: str) -> bool:
    # rÄ‚Ĺ‚ÄąÄ˝ne formaty przechowywania "owned/unlocked skins"
    for fld in ("skins_owned", "owned_skins", "skins", "skinsOwned", "purchased_skins", "unlocked_skins"):
        v = (u or {}).get(fld)
        if isinstance(v, dict):
            if key in v and bool(v.get(key)):
                return True
            # czasem dict jest {key:meta} lub {key:True}
            if key in v:
                return True
        elif isinstance(v, (list, set, tuple)):
            if key in v:
                return True
    return False

def _is_supporter(u: dict) -> bool:
    try:
        support_state = build_support_state_payload(u)
        if (support_state.get("stars") or {}).get("active"):
            return True
        if int(((support_state.get("token") or {}).get("tier") or 0)) > 0:
            return True
    except Exception:
        pass

    try:
        active = _get_active_skin(u)
    except Exception:
        active = None

    if active in ("token_supporter", "supporter"):
        return True

    # flagi jeÄąâ€şli kiedyÄąâ€ş dodasz sub/tiers
    if (u or {}).get("supporter") or (u or {}).get("is_supporter"):
        return True
    subs = (u or {}).get("subs")
    if isinstance(subs, dict) and subs.get("supporter"):
        return True

    # owned skin jako Ă˘â‚¬Ĺ›dowÄ‚Ĺ‚dĂ˘â‚¬ĹĄ
    if _has_skin(u, "token_supporter") or _has_skin(u, "supporter"):
        return True

    return False

def _build_cosmetics_payload_ro(u: dict) -> dict:
    cos = _ensure_cosmetics(u if isinstance(u, dict) else {})
    tag = cos.get("tag") or (u or {}).get("tag") or None
    stored_tag = str(tag or "").strip().lower()
    frame_key, frame_url = _resolve_active_frame(u, cos)
    signal_payload = {}
    try:
        from webapp_howlpay import build_howl_signal_public_state
        signal_payload = build_howl_signal_public_state(u)
    except Exception:
        signal_payload = {}

    try:
        resolved = resolve_support_cosmetics(u, base_tag=tag, base_frame_url=frame_url or None)
        resolved_tag = str(resolved.get("tag") or tag or "").strip()
        resolved_tag_norm = resolved_tag.lower()
        try:
            from webapp_howl_treasury import ALPHA_PRIME_TAG_KEY
        except Exception:
            ALPHA_PRIME_TAG_KEY = "prime"
        if stored_tag == ALPHA_PRIME_TAG_KEY and resolved_tag_norm in {"dual", "dual_supporter"}:
            tag = ALPHA_PRIME_TAG_KEY
        else:
            tag = resolved_tag or tag
    except Exception:
        if tag is None and _is_supporter(u):
            tag = "supporter"

    out = {}
    if tag:
        out["tag"] = tag
    if frame_key:
        out["frame_key"] = frame_key
    if frame_url:
        out["frame_url"] = frame_url
        out["frameUrl"] = frame_url
    if signal_payload:
        out["signal"] = signal_payload
        out["signals"] = {
            "owned": [signal_payload.get("key")] if signal_payload.get("owned") and signal_payload.get("key") else [],
            "equipped": signal_payload.get("equipped") or "",
            "active": bool(signal_payload.get("active")),
        }
    return out

def _make_profile_payload(u: dict, *, now: int | None = None) -> dict:
    perf_total_t0 = time.perf_counter()
    uid = str((u or {}).get("uid") or (u or {}).get("id") or (u or {}).get("user_id") or "-")
    k = _avatar_key_normalized(u)
    av = AVATAR_BY_KEY.get(k, {})

    level_val = int(u.get("level", 1) or 1)
    xp_val    = int(u.get("xp", 0) or 0)

    active_key = _get_active_skin(u)
    skin_meta = next((s for s in SKINS_CATALOG if s["key"] == active_key), None)

    skin_payload = None
    if skin_meta:
        skin_payload = {
            "key":  skin_meta["key"],
            "name": skin_meta.get("name", skin_meta["key"]),
            "img":  skin_meta.get("img", ""),
        }
        if isinstance(skin_meta.get("visualFit"), dict):
            skin_payload["visualFit"] = dict(skin_meta["visualFit"])

    tokens_val = int(u.get("tokens", 0) or 0)

    display_name = (
        u.get("nickname")
        or u.get("display_name")
        or u.get("name")
        or u.get("username")
        or "Howler"
    )

    # Ă˘Ĺ›â€¦ PREMIUM BUFFS PAYLOAD (READ-ONLY)
    step_t0 = time.perf_counter()
    buffs_line, buffs_full = build_buffs_payload_ro(u)
    active_buffs = _build_active_buffs_payload_ro(u, buffs_full)
    _profile_perf(uid, "profile_buffs", step_t0)

    # Ă˘Ĺ›â€¦ NEW: cosmetics payload (tag + frame)
    step_t0 = time.perf_counter()
    cosmetics_payload = _build_cosmetics_payload_ro(u)
    _profile_perf(uid, "profile_cosmetics", step_t0)
    tag_val = cosmetics_payload.get("tag")
    frame_url_val = cosmetics_payload.get("frame_url") or cosmetics_payload.get("frameUrl")
    signal_val = cosmetics_payload.get("signal") if isinstance(cosmetics_payload.get("signal"), dict) else {}
    step_t0 = time.perf_counter()
    active_weekly_aura = build_influence_weekly_active_aura_payload(
        get_active_temp_entitlements(u, now=now, source="influence_weekly"),
        now=now,
    )
    _profile_perf(uid, "profile_weekly_aura", step_t0)
    active_custom_aura = {}
    active_prime_aura = {}
    try:
        from webapp_howlpay import build_alpha_signal_core_aura_payload

        active_custom_aura = build_alpha_signal_core_aura_payload(u, active_only=True)
    except Exception:
        active_custom_aura = {}
    try:
        from webapp_howl_treasury import build_prime_signal_aura_payload

        active_prime_aura = build_prime_signal_aura_payload(u, active_only=True)
    except Exception:
        active_prime_aura = {}
    effective_active_aura = active_weekly_aura if isinstance(active_weekly_aura, dict) else (
        active_prime_aura if isinstance(active_prime_aura, dict) and active_prime_aura else (
            active_custom_aura if isinstance(active_custom_aura, dict) and active_custom_aura else None
        )
    )
    faction_val = u.get("faction")
    if not faction_val and isinstance(u.get("profile"), dict):
        faction_val = u["profile"].get("faction")

    onboarding = u.get("onboarding_v1") if isinstance(u.get("onboarding_v1"), dict) else {}
    awakening = onboarding.get("awakening") if isinstance(onboarding.get("awakening"), dict) else {}
    origin_mark = str(awakening.get("origin_mark") or "").strip().lower()
        
    payload = {
        "name":   display_name,
        "avatar": {
            "key":   k,
            "name":  av.get("name", k),
            "emoji": av.get("emoji", "Ä‘ĹşÂĹź"),
            "img":   av.get("img", ""),
        },
        "tokens": tokens_val,
        "level":  level_val,
        "xp":     xp_val,
        "skin":   skin_payload,

        "faction": faction_val,
        "origin_mark": origin_mark,
        "originMark": origin_mark,

        # Ă˘Ĺ›â€¦ NEW: cosmetics -> WebApp (tag + frame)
        "cosmetics": cosmetics_payload,
        "howlSignal": signal_val,
        "signal": signal_val,

        # Ă˘Ĺ›â€¦ bonus: top-level (Twoje pickery teÄąÄ˝ to Äąâ€šapiĂ„â€¦)
        "tag": tag_val,
        "frame_url": frame_url_val,
        "frameUrl": frame_url_val,
        "weeklyAura": copy.deepcopy(active_weekly_aura) if isinstance(active_weekly_aura, dict) else None,
        "activeAura": copy.deepcopy(effective_active_aura) if isinstance(effective_active_aura, dict) else None,

        # Ă˘Ĺ›â€¦ do paska pod nickiem + popup listy
        "buffsLine": buffs_line,
        "buffs": buffs_full,
        "buffsCount": len(buffs_full),
        "activeBuffs": active_buffs,
    }
    _profile_perf(uid, "profile_payload_total", perf_total_t0)
    return payload

TEAMUP_WEEKLY_SKIN_KEY = "raider_warlord"
TEAMUP_WEEKLY_SKIN_REQ = 10  # TODO: ustawisz docelowĂ„â€¦ liczbĂ„â„˘
WEEKLY_COUNTER_KEY = "teamup_completes"     # to inkrementujesz w TeamUp resolve

def _utcnow():
    return datetime.now(timezone.utc)

def _iso_week_id(dt=None) -> str:
    dt = dt or _utcnow()
    y, w, _ = dt.isocalendar()
    return f"{y}-W{w:02d}"

def _iso_week_end_dt(dt=None) -> datetime:
    """Koniec bieÄąÄ˝Ă„â€¦cego ISO tygodnia: nastĂ„â„˘pny poniedziaÄąâ€šek 00:00 UTC."""
    dt = dt or _utcnow()
    iso_wday = dt.isocalendar()[2]  # Mon=1..Sun=7
    days_to_next_monday = 8 - iso_wday
    nxt = (dt + timedelta(days=days_to_next_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
    return nxt

def _weekly_bucket(u: dict, key: str) -> dict:
    stats = u.setdefault("stats", {})
    weekly = stats.setdefault("weekly", {})
    wid = _iso_week_id()

    cur = weekly.get(key)
    if not isinstance(cur, dict) or cur.get("week") != wid:
        cur = {"week": wid, "count": 0}
        weekly[key] = cur
    return cur

def weekly_get(u: dict, key: str):
    b = _weekly_bucket(u, key)
    return int(b.get("count", 0) or 0), b.get("week")

def weekly_inc(u: dict, key: str, delta: int = 1):
    b = _weekly_bucket(u, key)
    b["count"] = int(b.get("count", 0) or 0) + int(delta)
    return b["count"], b.get("week")

def _is_weekly_unlock_skin(meta: dict) -> bool:
    unlock = (meta or {}).get("unlock") or {}
    return unlock.get("kind") == "teamup_weekly"

def _weekly_skin_state(u: dict, meta: dict):
    """
    Returns (unlockedNow: bool, det: dict|None)
      det: {have, need, week, endsSec}
    """
    if not _is_weekly_unlock_skin(meta):
        return False, None

    unlock = (meta.get("unlock") or {})
    need = int(unlock.get("need") or TEAMUP_WEEKLY_SKIN_REQ or 0)
    have, wid = weekly_get(u, WEEKLY_COUNTER_KEY)
    unlocked = (need > 0 and have >= need)

    ends = _iso_week_end_dt()
    ends_sec = max(0, int((ends - _utcnow()).total_seconds()))
    return unlocked, {"have": int(have), "need": int(need), "week": wid, "endsSec": int(ends_sec)}

def _cos_snapshot(u: dict):
    cos = u.get("cosmetics") if isinstance(u.get("cosmetics"), dict) else {}
    owned = cos.get("owned") if isinstance(cos.get("owned"), list) else []
    owned_frames = cos.get("owned_frames") if isinstance(cos.get("owned_frames"), list) else []
    eq = cos.get("equipped") if isinstance(cos.get("equipped"), dict) else {}
    eq_skin = str(eq.get("skin") or "").strip().lower()
    eq_frame = _norm_frame_key(eq.get("frame") or eq.get("frame_key") or "")
    return (
        tuple(str(x or "").strip().lower() for x in owned),
        tuple(_norm_frame_key(x) for x in owned_frames if _norm_frame_key(x)),
        eq_skin,
        eq_frame,
        str(u.get("active_skin") or "").strip().lower(),
    )

def _grant_supporter_cosmetics(u: dict):
    cos = _ensure_cosmetics(u)

    # persist
    cos["tag"] = SUPPORTER_TAG_KEY
    cos["frame_url"] = SUPPORTER_FRAME_URL
    cos["frame_key"] = "supporter"
    owned_frames = cos.get("owned_frames") if isinstance(cos.get("owned_frames"), list) else []
    if "supporter" not in [str(x or "").strip().lower() for x in owned_frames]:
        owned_frames.append("supporter")
    cos["owned_frames"] = owned_frames

    # equip now (ÄąÄ˝eby od razu byÄąâ€šo w WebApp)
    eq = cos.get("equipped")
    if not isinstance(eq, dict):
        eq = {}
        cos["equipped"] = eq

    if not eq.get("tag"):
        eq["tag"] = SUPPORTER_TAG_KEY
    if not (eq.get("frame_url") or eq.get("frame_key")):
        eq["frame_url"] = SUPPORTER_FRAME_URL
    if not str(eq.get("frame") or "").strip():
        eq["frame"] = "supporter"

# ===================== ACHIEVEMENT SKIN (REFERRALS) =====================
def _is_code_unlock_skin(meta: dict) -> bool:
    u = meta.get("unlock")
    return isinstance(u, dict) and str(u.get("kind") or "").strip().lower() in ("code", "claim", "password")

def _norm_code(code: str) -> str:
    return (code or "").strip().lower()

def _claim_cfg():
    salt = os.getenv("SKIN_CLAIM_SALT", "")
    raw = os.getenv("SKIN_CLAIM_CODES_SHA256", "{}")
    try:
        mp = json.loads(raw) if raw else {}
        if not isinstance(mp, dict):
            mp = {}
    except Exception:
        mp = {}
    return salt, mp

def _hash_claim_code(code: str, salt: str) -> str:
    c = _norm_code(code)
    return hashlib.sha256(f"{c}|{salt or ''}".encode("utf-8")).hexdigest()

def _add_owned_perm_skin(u: dict, key: str):
    cos = _ensure_cosmetics(u)
    owned = cos.get("owned") if isinstance(cos.get("owned"), list) else []
    k = str(key or "").strip().lower()
    if k and k not in [str(x or "").strip().lower() for x in owned]:
        owned.append(k)
        cos["owned"] = owned

    # mirror legacy (bezpiecznie)
    if not isinstance(u.get("owned_skins"), list):
        u["owned_skins"] = ["default"]
    if k and k not in [str(x or "").strip().lower() for x in u["owned_skins"]]:
        u["owned_skins"].append(k)

def _skins_claim_mut(u: dict, uid: str, username: str, code: str, run_id: str | None = None) -> dict:
    u.setdefault("id", uid)
    u.setdefault("uid", uid)
    u.setdefault("user_id", uid)
    if username and not u.get("username"):
        u["username"] = username

    cos = _ensure_cosmetics(u)

    code_n = _norm_code(code)
    if not code_n:
        raise ValueError("EMPTY_CODE")

    salt, mp = _claim_cfg()
    h = _hash_claim_code(code_n, salt)
    skin_key = str(mp.get(h) or "").strip().lower()
    if not skin_key:
        raise ValueError("BAD_CODE")

    meta = _skin_meta(skin_key)
    if not meta or not _is_code_unlock_skin(meta):
        # blokujemy claim kodem do skinÄ‚Ĺ‚w, ktÄ‚Ĺ‚re nie sĂ„â€¦ "code unlock"
        raise ValueError("INVALID_TARGET")

    # per-user anti-repeat (ale inni userzy mogĂ„â€¦ uÄąÄ˝yĂ„â€ˇ tego samego kodu)
    claims = cos.get("claims")
    if not isinstance(claims, dict):
        claims = {}
        cos["claims"] = claims

    if claims.get(h):
        # idempotent: juÄąÄ˝ claimniĂ„â„˘te na tym koncie
        return {"ok": True, "already": True, "claimed": skin_key, "run_id": run_id}

    _add_owned_perm_skin(u, skin_key)
    claims[h] = skin_key

    # opcjonalnie: auto-equip po claim (zwykle UX lepszy)
    _equip_skin(u, skin_key)

    equipped = (u.get("cosmetics") or {}).get("equipped", {"skin": ""})
    active = _get_active_skin(u) or ""

    return {"ok": True, "claimed": skin_key, "active": active, "equipped": equipped, "run_id": run_id}

async def skins_claim_handler(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    code = str(body.get("code") or "")
    run_id = str(body.get("run_id") or "") or None
    username = tg_user.get("username") or ""

    try:
        out = await with_user(
            uid,
            lambda u: _skins_claim_mut(u, uid, username, code, run_id),
            reason="webapp:skins_claim",
        )
    except ValueError as e:
        c = str(e)
        if c == "EMPTY_CODE":
            return web.json_response({"ok": False, "reason": "EMPTY_CODE"}, status=400)
        if c == "BAD_CODE":
            return web.json_response({"ok": False, "reason": "BAD_CODE"}, status=403)
        if c == "INVALID_TARGET":
            return web.json_response({"ok": False, "reason": "INVALID_TARGET"}, status=403)
        return web.json_response({"ok": False, "reason": "CLAIM_FAILED"}, status=400)

    # Ă˘Â¬â€ˇÄŹÂ¸Ĺą zwrÄ‚Ĺ‚Ă„â€ˇ od razu full state jak w skins_get (UI lubi to)
    # 1) snapshot po mutacji
    u = await read_user(uid)
    cos = _ensure_cosmetics(u)
    active = _get_active_skin(u) or ""

    # build skins_out jak w skins_get (z weekly/referrals polami)
    skins_out = []
    for s in SKINS_CATALOG:
        o = dict(s)
        key = str(o.get("key") or "").strip().lower()
        owned_now = _is_skin_effectively_owned(u, cos, key)
        if not _skin_visible_in_selector(s, owned_now):
            continue
        if _is_preview_only_skin(s):
            owned_now = False
            o.setdefault("preview_only", True)
            o.setdefault("acquisition", "spins_only")
            o.setdefault("locked_label", "Available in Spins only")
        o["owned"] = bool(owned_now)
        o["equipped"] = bool(key and key == str(active or "").strip().lower())

        if _is_weekly_unlock_skin(s):
            unlocked, det = _weekly_skin_state(u, s)
            if det:
                o["unlockHave"] = det["have"]
                o["unlockNeed"] = det["need"]
                o["unlockWeek"] = det["week"]
                o["unlockEndsSec"] = det["endsSec"]
                o["unlockedNow"] = bool(unlocked)

        if _is_referrals_unlock_skin(s):
            unlocked, det = _referrals_skin_state(u, s)
            if det:
                o["unlockHave"] = det["have"]
                o["unlockNeed"] = det["need"]
                o["unlockedNow"] = bool(unlocked)

        if _is_support_token_unlock_skin(s):
            unlocked, det = _support_token_skin_state(u, s)
            if det:
                o["unlockHave"] = det["have"]
                o["unlockNeed"] = det["need"]
                o["unlockedNow"] = bool(unlocked)

        skins_out.append(o)

    owned_eff = _effective_owned(u, cos)
    equipped = (cos.get("equipped") or {"skin": ""})

    return web.json_response({
        **out,
        "skins": skins_out,
        "owned": owned_eff,
        "equipped": equipped,
        "active": active,
    })

REFERRAL_10_SKIN_KEY = "pack_recruiter"
REFERRAL_10_SKIN_REQ = 10
SHARD_SKIN_KEY = "shardborn_wanderer"
SHARD_SKIN_REQ = 120   # ile skin_shards potrzeba do odblokowania


def _is_referrals_unlock_skin(meta: dict) -> bool:
    unlock = (meta or {}).get("unlock")
    if not isinstance(unlock, dict):
        return False
    if str(unlock.get("kind") or "").strip().lower() != "referrals":
        return False
    try:
        return int(unlock.get("need", 0) or 0) > 0
    except Exception:
        return False

def _is_support_unlock_skin(meta: dict) -> bool:
    unlock = (meta or {}).get("unlock")
    if not isinstance(unlock, dict):
        return False
    return str(unlock.get("kind") or "").strip().lower() in ("support", "support_stars", "stars_support")

def _is_support_token_unlock_skin(meta: dict) -> bool:
    unlock = (meta or {}).get("unlock")
    if not isinstance(unlock, dict):
        return False
    return str(unlock.get("kind") or "").strip().lower() in ("support_token", "token_support", "supporter_token")


def _is_spins_only_unlock_skin(meta: dict) -> bool:
    raw = str((meta or {}).get("acquisition") or "").strip().lower()
    if raw == "spins_only":
        return True
    unlock = (meta or {}).get("unlock")
    if isinstance(unlock, dict):
        kind = str(unlock.get("kind") or "").strip().lower()
        if kind in ("spins_only", "spins"):
            return True
    return False


def _is_preview_only_skin(meta: dict) -> bool:
    if bool((meta or {}).get("preview_only")):
        return True
    return _is_spins_only_unlock_skin(meta)


def _skin_visible_in_selector(meta: dict, owned_now: bool) -> bool:
    if not isinstance(meta, dict):
        return False
    if bool(meta.get("hidden_if_unowned")) and not bool(owned_now):
        return False
    return True


def _support_token_skin_state(u: dict, meta: dict):
    """
    Returns (unlockedNow: bool, det: dict|None)
      det: {have, need}
    """
    if not _is_support_token_unlock_skin(meta):
        return False, None

    unlock = (meta.get("unlock") or {})
    need_tier = int(unlock.get("need_tier") or 3)
    return build_token_skin_unlock_state(u, need_tier=need_tier)

def _referrals_skin_state(u: dict, meta: dict):
    """
    Returns (unlockedNow: bool, det: dict|None)
      det: {have, need}
    """
    if not _is_referrals_unlock_skin(meta):
        return False, None

    unlock = (meta.get("unlock") or {})
    need = int(unlock.get("need") or REFERRAL_10_SKIN_REQ or 0)

    # U Ciebie referrals == rewardedInvites
    have = int(u.get("referrals", 0) or 0)

    unlocked = (need > 0 and have >= need)
    return unlocked, {"have": int(have), "need": int(need)}


SKINS_CATALOG = [
  {"key":"lunarhowl","name":"Lunar Howl","img":"/assets/skins/lunarhowl_skin.webp","cost":{"bones":2500}},
  {"key":"frostborn","name":"Frostborn","img":"/assets/skins/frostborn_skin.webp","cost":{"bones":3500}},
  {"key":"shardglass","name":"Shardglass Ronin","img":"/assets/skins/shardglass_skin.webp","cost":{"bones":5000}},
  {"key":"biohazard","name":"Biohazard","img":"/assets/skins/biohazard_skin.webp","cost":{"bones":5000}},
  {
    "key": BLUE_MOON_HUNTER_SKIN_KEY,
    "name": "Blue-Moon Hunter",
    "img": BLUE_MOON_HUNTER_SKIN_URL,
    "thumb": BLUE_MOON_HUNTER_SKIN_URL,
    "assetUrl": BLUE_MOON_HUNTER_SKIN_URL,
    "visualFit": {"scale": 1.32, "x": 0, "y": 14},
    "cost": {},
    "source": "Blue-Moon Hunter Vault Box",
    "rarity": "Limited",
    "cosmeticOnly": True,
    "description": "A limited cosmetic hunter skin awakened under the Blue Moon signal.",
    "safetyLine": "Cosmetic only. No combat power.",
    "hidden_if_unowned": True,
  },
  {
    "key": "ghost_ledger_alpha",
    "name": "Ghost Ledger Alpha",
    "img": "/images/slots/ghost_ledger_alpha_teaser.png",
    "owned": False,
    "equipped": False,
    "preview_only": True,
    "acquisition": "spins_only",
    "locked_label": "Available in Spins only",
    "cost": {},
  },
  {
    "key": DOMINION_ALPHA_SKIN_KEY,
    "name": "Dominion Alpha",
    "img": DOMINION_ALPHA_SKIN_URL,
    "cost": {"bones": 0},
    "source": "faction_rivalry_week",
    "rarity": "event",
  },
  {
    "key": UNBROKEN_ALPHA_SKIN_KEY,
    "name": UNBROKEN_ALPHA_SKIN_NAME,
    "img": UNBROKEN_ALPHA_SKIN_IMG,
    "fallback": UNBROKEN_ALPHA_SKIN_FALLBACK_URL,
    "animated": True,
    "cost": {"bones": 0},
  },
  {"key":"token_supporter","name":"Token Supporter","img":TOKEN_SUPPORTER_SKIN_URL,"cost":{"tokens":750}},
  {
    "key": BELIEVE_SUPPORT_SKIN_KEY,
    "name": "Believe Holder",
    "img": BELIEVE_SUPPORT_SKIN_URL,
    "fallback": BELIEVE_SUPPORT_SKIN_FALLBACK_URL,
    "cost": {"bones": 0},
    "unlock": {"kind": "support_token", "need_tier": 3},
    "support": True,
  },

  # Ă˘Ĺ›â€¦ achievement skin Ă˘â‚¬â€ť unlocked after 10 successful referrals
  {
    "key": REFERRAL_10_SKIN_KEY,
    "name": "Pack Recruiter",
    "img": "/assets/skins/pack_recruiter_skin.webp",  # <- asset dodasz pÄ‚Ĺ‚ÄąĹźniej
    "cost": {"bones": 0},  # earn-only
    "unlock": {"kind": "referrals", "need": REFERRAL_10_SKIN_REQ},
  }, 
  # Ă˘Ĺ›â€¦ weekly time-limited skin
  {
    "key": TEAMUP_WEEKLY_SKIN_KEY,
    "name": "Raider Warlord",
    "img": "/assets/skins/raider_warlord.webp",  # <- dopasuj Äąâ€şcieÄąÄ˝kĂ„â„˘/plik
    "cost": {"bones": 0},  # earn-only
    "unlock": {"kind": "teamup_weekly", "need": TEAMUP_WEEKLY_SKIN_REQ, "ttl": "week"},
  },
  # Ă˘Ĺ›â€¦ shard-unlock skin Ă˘â‚¬â€ť unlocked only by collecting Skin Shards
  {
    "key": SHARD_SKIN_KEY,
    "name": "Shardborn Wanderer",
    "img": "/assets/skins/shardborn_wanderer.webp",  # <- dodasz asset
    "cost": {"bones": 0},  # earn-only
    "unlock": {"kind": "skin_shards", "need": SHARD_SKIN_REQ},
  },
  {
    "key": "bloodmoon_whisper",
    "name": "Bloodmoon Whisper",
    "img": "https://res.cloudinary.com/dnjwvxinh/image/upload/v1769606494/skins/bloodmoon_whisper.webp",
    "fallback": "https://res.cloudinary.com/dnjwvxinh/image/upload/vXXXXXXX/skins/bloodmoon_whisper_fallback.png",
    "animated": True,
    "unlock": {"kind": "code"},
    "cost": {"bones": 0},
},
  {
    "key": "pack_veteran",
    "name": "Pack Veteran",
    "img": "https://res.cloudinary.com/dnjwvxinh/image/upload/v1773747928/skins/pack_veteran.webp",
    "cost": {},
    "stars": 350,
    "unlock": {"kind": "support_stars"},
    "premium": True,
    "support": True,
}
]

INFLUENCE_WEEKLY_FRAME_BY_FACTION = {
    "rogue_byte": "rogue_byte_overclock",
    "echo_wardens": "echo_warden_reliquary",
    "inner_howl": "inner_howl_mooncrest",
    "pack_burners": "pack_burner_ashline",
}

WEEKLY_FRAME_DISPLAY_NAMES = {
    "rogue_byte_overclock": "Rogue Byte Overclock",
    "echo_warden_reliquary": "Echo Warden Reliquary",
    "inner_howl_mooncrest": "Inner Howl Mooncrest",
    "pack_burner_ashline": "Pack Burner Ashline",
}


def _frame_source_label_from_unlock(unlock_meta: dict | None) -> str:
    unlock = unlock_meta if isinstance(unlock_meta, dict) else {}
    kind = str(unlock.get("kind") or "").strip().lower()
    if kind == "starter":
        return "Starter"
    if kind == "influence_weekly":
        return "Weekly Influence"
    if kind == "founder_manual":
        return "Founder Reward"
    if kind == "support_stars":
        return "Stars Support"
    if kind == "support_token_tier1":
        return "Believe Tier 1"
    if kind == "support_token_tier2":
        return "Believe Tier 2"
    if kind == "support_token":
        return "Believe Holder"
    if kind == "support_dual":
        return "Dual Support"
    if kind == "blue_signal_hunt":
        return "Blue Signal Hunt"
    if kind in ("howl_payment", "howl_payment_test", "howl_purchase_planned"):
        return "$HOWL Premium"
    return ""


FRAMES_CATALOG = [
    {
        "key": "pack_alpha",
        "name": "Pack Alpha",
        "img": STARTER_FRAME_URL,
        "preview_url": STARTER_FRAME_URL,
        "unlock": {"kind": "starter"},
    },
    {
        "key": "supporter",
        "name": "Supporter Crest",
        "img": SUPPORTER_FRAME_URL,
        "preview_url": SUPPORTER_FRAME_URL,
        "unlock": {"kind": "support_stars"},
    },
]
if PATRON_FRAME_URL:
    FRAMES_CATALOG.append(
        {
            "key": "patron",
            "name": "Patron Crest",
            "img": PATRON_FRAME_URL,
            "preview_url": PATRON_FRAME_URL,
            "unlock": {"kind": "support_stars"},
        }
    )
if FOUNDER_FRAME_URL:
    FRAMES_CATALOG.append(
        {
            "key": "founder",
            "name": "Founder Crest",
            "img": FOUNDER_FRAME_URL,
            "preview_url": FOUNDER_FRAME_URL,
            "unlock": {"kind": "support_stars"},
        }
    )

for faction_key, frame_key in INFLUENCE_WEEKLY_FRAME_BY_FACTION.items():
    frame_url = _cloudinary_frame_preview_url(frame_key)
    if not frame_url:
        continue
    FRAMES_CATALOG.append(
        {
            "key": frame_key,
            "name": WEEKLY_FRAME_DISPLAY_NAMES.get(frame_key, frame_key.replace("_", " ").title()),
            "img": frame_url,
            "preview_url": frame_url,
            "unlock": {"kind": "influence_weekly", "faction": faction_key},
        }
    )

if FOUNDER_EMBER_FRAME_URL:
    FRAMES_CATALOG.append(
        {
            "key": FOUNDER_EMBER_FRAME_KEY,
            "name": "Founder Ember Mark",
            "img": FOUNDER_EMBER_FRAME_URL,
            "preview_url": FOUNDER_EMBER_FRAME_URL,
            "unlock": {"kind": "founder_manual"},
        }
    )

FRAMES_CATALOG.append(
    {
        "key": GENESIS_FRAME_KEY,
        "name": "HOWL Genesis Frame",
        "img": GENESIS_FRAME_PREVIEW_URL,
        "preview_url": GENESIS_FRAME_PREVIEW_URL,
        "rarity": "mythic",
        "premium": True,
        "description": "First premium $HOWL cosmetic frame for Alpha Husky.",
        "unlock": {
            "kind": "howl_payment",
            "currency": "HOWL",
            "status": "feature_flagged",
        },
    }
)

if BELIEVE_HOLDER_FRAME_KEY and BELIEVE_HOLDER_FRAME_URL:
    FRAMES_CATALOG.append(
        {
            "key": BELIEVE_HOLDER_FRAME_KEY,
            "name": "Believe Holder Frame",
            "img": BELIEVE_HOLDER_FRAME_URL,
            "preview_url": BELIEVE_HOLDER_FRAME_URL,
            "unlock": {"kind": "support_token_tier1"},
        }
    )
if BELIEVE_SUPPORT_FRAME_KEY and BELIEVE_SUPPORT_FRAME_URL:
    FRAMES_CATALOG.append(
        {
            "key": BELIEVE_SUPPORT_FRAME_KEY,
            "name": "Believe Support Frame",
            "img": BELIEVE_SUPPORT_FRAME_URL,
            "preview_url": BELIEVE_SUPPORT_FRAME_URL,
            "unlock": {"kind": "support_token_tier2"},
        }
    )
if DUAL_SUPPORT_FRAME_KEY and DUAL_SUPPORT_FRAME_ASSET_URL:
    FRAMES_CATALOG.append(
        {
            "key": DUAL_SUPPORT_FRAME_KEY,
            "name": "Dual Supporter Frame",
            "img": DUAL_SUPPORT_FRAME_ASSET_URL,
            "preview_url": DUAL_SUPPORT_FRAME_ASSET_URL,
            "unlock": {"kind": "support_dual"},
        }
    )
FRAMES_CATALOG.append(
    {
        "key": BLUE_SIGNAL_FRAME_KEY,
        "name": "Blue Signal Frame",
        "img": BLUE_SIGNAL_FRAME_PREVIEW_URL,
        "preview_url": BLUE_SIGNAL_FRAME_PREVIEW_URL,
        "assetUrl": BLUE_SIGNAL_FRAME_PREVIEW_URL,
        "rarity": "Limited Event",
        "description": "Earned by collecting broken Blue Signal fragments during the Blue Moon window.",
        "safetyLine": "Cosmetic only. No combat power.",
        "sourceLabel": "Blue Signal Hunt",
        "unlock": {"kind": "blue_signal_hunt"},
    }
)
FRAMES_CATALOG.append(
    {
        "key": ALPHA_PRIME_FRAME_KEY,
        "name": "Alpha Prime Frame",
        "img": ALPHA_PRIME_FRAME_PREVIEW_URL,
        "preview_url": ALPHA_PRIME_FRAME_PREVIEW_URL,
        "assetUrl": ALPHA_PRIME_FRAME_URL,
        "rarity": "premium",
        "premium": True,
        "description": "Prime Treasury cosmetic frame. Cosmetic/status only. No combat power.",
        "sourceLabel": "Alpha Prime Vault Pack",
        "unlock": {"kind": "treasury_prime_pack"},
    }
)

# Archive Cracker Frame — Burned Archive milestone (30 personal breaches)
FRAMES_CATALOG.append(
    {
        "key": ARCHIVE_CRACKER_FRAME_KEY,
        "name": "Archive Cracker Frame",
        "img": ARCHIVE_CRACKER_FRAME_URL,
        "preview_url": ARCHIVE_CRACKER_FRAME_URL,
        "assetUrl": ARCHIVE_CRACKER_FRAME_URL,
        "rarity": "epic",
        "description": "Unlocked by breaking deeper into the Burned Archive.",
        "sourceLabel": "Burned Archive milestone",
        "unlock": {"kind": "burned_archive_milestone", "breaches": 30},
    }
)


def _admin_uid_for_dev_frames(u: dict) -> bool:
    if not isinstance(u, dict):
        return False
    uid = str(u.get("id") or u.get("uid") or u.get("user_id") or "").strip()
    if not uid:
        return False
    try:
        from config import ADMIN_IDS
        admin_ids = {str(raw).strip() for raw in (ADMIN_IDS or []) if str(raw).strip()}
        return uid in admin_ids
    except Exception:
        return False


_FRAME_KEY_ALIASES = {
    "dual_frame": str(DUAL_SUPPORT_FRAME_KEY or "").strip().lower() or "dual_supporter_frame",
}


def _norm_frame_key(value: str) -> str:
    key = str(value or "").strip().lower()
    return _FRAME_KEY_ALIASES.get(key, key)


def _frame_meta(key: str, *, catalog: list[dict] | None = None) -> dict | None:
    k = _norm_frame_key(key)
    if not k:
        return None
    cat = catalog if isinstance(catalog, list) else FRAMES_CATALOG
    return next((f for f in cat if _norm_frame_key(f.get("key")) == k), None)


def _frame_exists(key: str, *, catalog: list[dict] | None = None) -> bool:
    k = _norm_frame_key(key)
    if not k:
        return False
    if k == "default":
        return True
    return _frame_meta(k, catalog=catalog) is not None


def _frame_key_from_url(url: str, *, catalog: list[dict] | None = None) -> str:
    raw = str(url or "").strip()
    if not raw:
        return ""
    cat = catalog if isinstance(catalog, list) else FRAMES_CATALOG
    for meta in cat:
        if str(meta.get("img") or "").strip() == raw:
            return _norm_frame_key(meta.get("key"))
        if str(meta.get("preview_url") or "").strip() == raw:
            return _norm_frame_key(meta.get("key"))
    return ""


def _owned_frame_preview_url(key: str) -> str:
    k = _norm_frame_key(key)
    if not k:
        return ""
    if k == "pioneer_frame":
        return "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777053630/frames/pioneer/pioneer_frame_base_transparent_v2.png"
    if k == "server_signal_frame":
        return "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778582859/frames/server_signal_frame.webp"
    return _cloudinary_frame_preview_url(k)


def _frame_support_sources(support_state: dict | None) -> list[tuple[str, str, str, str]]:
    def key_norm(raw: str) -> str:
        k = _norm_frame_key(raw)
        for ext in (".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg"):
            if k.endswith(ext):
                return _norm_frame_key(k[: -len(ext)])
        return _norm_frame_key(k)

    st = support_state if isinstance(support_state, dict) else {}
    stars = st.get("stars") if isinstance(st.get("stars"), dict) else {}
    token = st.get("token") if isinstance(st.get("token"), dict) else {}
    combined = st.get("combined") if isinstance(st.get("combined"), dict) else {}
    out: list[tuple[str, str, str, str]] = [
        (key_norm(stars.get("frame") or ""), str(stars.get("frameUrl") or "").strip(), "support_stars", "Support Frame"),
        (key_norm(token.get("frame") or ""), str(token.get("frameUrl") or "").strip(), "support_token", "Believe Support Frame"),
        (key_norm(combined.get("resolvedFrame") or ""), str(combined.get("resolvedFrameUrl") or "").strip(), "support_dual", "Dual Supporter Frame"),
    ]

    frame_options = token.get("frameOptions")
    if isinstance(frame_options, list):
        for option in frame_options:
            if not isinstance(option, dict):
                continue
            out.append(
                (
                    key_norm(option.get("key") or ""),
                    str(option.get("url") or option.get("frameUrl") or "").strip(),
                    str(option.get("source") or "support_token").strip() or "support_token",
                    str(option.get("name") or "").strip() or "Believe Frame",
                )
            )

    return out


def _is_founder_frame_entitled(u: dict, support_state: dict | None = None) -> bool:
    if not isinstance(u, dict):
        return False
    if bool(u.get("founder_set_granted")):
        return True

    st = support_state if isinstance(support_state, dict) else build_support_state_payload(u)
    stars = st.get("stars") if isinstance(st.get("stars"), dict) else {}
    if str(stars.get("tierKey") or "").strip().lower() == "founder":
        return True

    support = u.get("support") if isinstance(u.get("support"), dict) else {}
    applied = support.get("applied") if isinstance(support.get("applied"), dict) else {}
    for row in applied.values():
        if not isinstance(row, dict):
            continue
        if str(row.get("tier") or "").strip().lower() == "founder":
            return True
    return False


def _frame_catalog_for_user(u: dict, *, support_state: dict | None = None) -> list[dict]:
    catalog = []
    for raw_meta in FRAMES_CATALOG:
        if not isinstance(raw_meta, dict):
            continue
        meta = dict(raw_meta)
        img = str(meta.get("img") or meta.get("preview_url") or "").strip()
        preview_url = str(meta.get("preview_url") or img).strip()
        if not img:
            continue
        meta["img"] = img
        meta["preview_url"] = preview_url or img
        if not str(meta.get("sourceLabel") or "").strip():
            source_label = _frame_source_label_from_unlock(meta.get("unlock") if isinstance(meta.get("unlock"), dict) else {})
            if source_label:
                meta["sourceLabel"] = source_label
        catalog.append(meta)

    if _admin_uid_for_dev_frames(u):
        catalog.append(
            {
                "key": HOWLPAY_TEST_FRAME_KEY,
                "name": HOWLPAY_TEST_FRAME_NAME,
                "img": HOWLPAY_TEST_FRAME_URL,
                "preview_url": HOWLPAY_TEST_FRAME_URL,
                "rarity": "dev",
                "premium": True,
                "description": "Admin-only HowlPay live test frame.",
                "sourceLabel": "$HOWL Test",
                "unlock": {
                    "kind": "howl_payment_test",
                    "currency": "HOWL",
                    "status": "admin_only",
                },
            }
        )

    by_key = {_norm_frame_key(meta.get("key")): meta for meta in catalog}

    def upsert(raw_key: str, raw_url: str, *, unlock_kind: str, fallback_name: str, source_label: str = ""):
        url = str(raw_url or "").strip()
        key = _norm_frame_key(raw_key)
        if not key and url:
            key = _frame_key_from_url(url, catalog=catalog)
        if not key and url:
            key = f"ext_{hashlib.sha1(url.encode('utf-8')).hexdigest()[:8]}"
        if not key:
            return

        slot = by_key.get(key)
        if slot is None:
            img = url or _cloudinary_frame_preview_url(key)
            if not img:
                return
            slot = {
                "key": key,
                "name": fallback_name,
                "img": img,
                "preview_url": img,
                "unlock": {"kind": unlock_kind},
            }
            if source_label:
                slot["sourceLabel"] = source_label
            catalog.append(slot)
            by_key[key] = slot
            return

        if url and (
            not str(slot.get("img") or "").strip()
            or unlock_kind in {"support_stars", "support_token", "support_token_tier1", "support_token_tier2", "support_dual"}
        ):
            slot["img"] = url
            slot["preview_url"] = url
        elif not str(slot.get("preview_url") or "").strip() and str(slot.get("img") or "").strip():
            slot["preview_url"] = str(slot.get("img") or "").strip()
        if unlock_kind and not isinstance(slot.get("unlock"), dict):
            slot["unlock"] = {"kind": unlock_kind}
        if source_label and not str(slot.get("sourceLabel") or "").strip():
            slot["sourceLabel"] = source_label

    st = support_state if isinstance(support_state, dict) else build_support_state_payload(u)
    for raw_key, raw_url, unlock_kind, fallback_name in _frame_support_sources(st):
        label = _frame_source_label_from_unlock({"kind": unlock_kind})
        upsert(raw_key, raw_url, unlock_kind=unlock_kind, fallback_name=fallback_name, source_label=label)

    cos = u.get("cosmetics") if isinstance(u.get("cosmetics"), dict) else {}
    owned_frames = cos.get("owned_frames") if isinstance(cos.get("owned_frames"), list) else []
    for raw_key in owned_frames:
        key = _norm_frame_key(raw_key)
        if not key or key in {"default", "pack_alpha"}:
            continue
        upsert(
            key,
            _owned_frame_preview_url(key),
            unlock_kind="owned_permanent",
            fallback_name="Pioneer Frame" if key == "pioneer_frame" else "Owned Frame",
            source_label="Pioneer" if key == "pioneer_frame" else "Cosmetic",
        )

    eq = cos.get("equipped") if isinstance(cos.get("equipped"), dict) else {}
    upsert(
        str(eq.get("frame_key") or cos.get("frame_key") or "").strip(),
        str(eq.get("frame_url") or eq.get("frameUrl") or cos.get("frame_url") or cos.get("frameUrl") or "").strip(),
        unlock_kind="legacy",
        fallback_name="Legacy Frame",
    )

    return [meta for meta in catalog if str(meta.get("img") or meta.get("preview_url") or "").strip()]


def _effective_owned_frames(
    u: dict,
    cos: dict,
    *,
    support_state: dict | None = None,
    catalog: list[dict] | None = None,
) -> list[str]:
    out = ["default"]
    seen = {"default"}

    def add_key(raw: str):
        key = _norm_frame_key(raw)
        if not key or key in seen:
            return
        seen.add(key)
        out.append(key)

    owned_perm = cos.get("owned_frames")
    if isinstance(owned_perm, list):
        for raw in owned_perm:
            add_key(raw)

    st = support_state if isinstance(support_state, dict) else build_support_state_payload(u)
    cat = catalog if isinstance(catalog, list) else _frame_catalog_for_user(u, support_state=st)
    for raw_key, raw_url, _kind, _name in _frame_support_sources(st):
        key = _norm_frame_key(raw_key)
        if not key:
            key = _frame_key_from_url(raw_url, catalog=cat)
        if not key:
            continue
        if _frame_meta(key, catalog=cat) is None and not str(raw_url or "").strip():
            continue
        add_key(key)

    if _is_founder_frame_entitled(u, support_state=st):
        add_key(FOUNDER_EMBER_FRAME_KEY)

    now_ts = int(time.time())
    for ent in get_active_temp_entitlements(u, now=now_ts, source="influence_weekly"):
        if not isinstance(ent, dict):
            continue
        if str(ent.get("type") or "").strip().lower() != "frame":
            continue
        ent_key = _norm_frame_key(ent.get("id") or "")
        if not ent_key:
            continue
        if _frame_meta(ent_key, catalog=cat) is None:
            continue
        add_key(ent_key)

    eq = cos.get("equipped") if isinstance(cos.get("equipped"), dict) else {}
    add_key(eq.get("frame_key") or cos.get("frame_key") or "")
    legacy_url = str(
        eq.get("frame_url")
        or eq.get("frameUrl")
        or cos.get("frame_url")
        or cos.get("frameUrl")
        or u.get("frame_url")
        or u.get("frameUrl")
        or ""
    ).strip()
    add_key(_frame_key_from_url(legacy_url, catalog=cat))

    return out


def _is_frame_effectively_owned(
    u: dict,
    cos: dict,
    key: str,
    *,
    support_state: dict | None = None,
    catalog: list[dict] | None = None,
) -> bool:
    k = _norm_frame_key(key)
    if not k or k == "default":
        return True
    owned = _effective_owned_frames(u, cos, support_state=support_state, catalog=catalog)
    return k in owned


def _resolve_active_frame(u: dict, cos: dict) -> tuple[str, str]:
    support_state = build_support_state_payload(u)
    catalog = _frame_catalog_for_user(u, support_state=support_state)
    eq = cos.get("equipped") if isinstance(cos.get("equipped"), dict) else {}

    key = _norm_frame_key(eq.get("frame") or eq.get("frame_key") or "")
    url = str(eq.get("frame_url") or eq.get("frameUrl") or "").strip()

    if key in ("default", "none", "null"):
        key = ""

    if key and not _is_frame_effectively_owned(u, cos, key, support_state=support_state, catalog=catalog):
        key = ""
        url = ""

    if key:
        meta = _frame_meta(key, catalog=catalog)
        resolved = str((meta or {}).get("preview_url") or (meta or {}).get("img") or url).strip()
        return key, resolved

    if url:
        mapped = _frame_key_from_url(url, catalog=catalog)
        if mapped and _is_frame_effectively_owned(u, cos, mapped, support_state=support_state, catalog=catalog):
            meta = _frame_meta(mapped, catalog=catalog)
            return mapped, str((meta or {}).get("preview_url") or (meta or {}).get("img") or url).strip()

    return "", ""


def _skin_exists(key: str) -> bool:
    k = (key or "").strip().lower()
    if not k:
        return False
    if k == "default":
        return True
    return _skin_meta(k) is not None

def _ensure_cosmetics(u: dict) -> dict:
    """
    Canonical:
      u["cosmetics"]["owned"] -> list (permanent only)
      u["cosmetics"]["equipped"]["skin"] -> str ("" = default)
      u["cosmetics"]["owned_frames"] -> list (permanent frame ownership)
      u["cosmetics"]["equipped"]["frame"] -> str ("" = no frame)
    Weekly skins:
      - NIE zapisujemy do owned permanentnie
      - equip tylko gdy aktualnie unlocked w tygodniu
      - auto-revert gdy wygasnĂ„â€¦
    Referral achievement skins:
      - NIE zapisujemy do owned (unlock wynika z referrals count)
    """
    cos = u.get("cosmetics")
    if not isinstance(cos, dict):
        cos = {}
        u["cosmetics"] = cos

    owned = cos.get("owned")
    if not isinstance(owned, list):
        owned = []
        cos["owned"] = owned

    equipped = cos.get("equipped")
    if not isinstance(equipped, dict):
        equipped = {}
        cos["equipped"] = equipped

    owned_frames = cos.get("owned_frames")
    if not isinstance(owned_frames, list):
        owned_frames = []
        cos["owned_frames"] = owned_frames

    signals = cos.get("signals")
    if not isinstance(signals, dict):
        signals = {}
        cos["signals"] = signals
    signal_owned = signals.get("owned")
    if not isinstance(signal_owned, list):
        signal_owned = []
        signals["owned"] = signal_owned
    signal_equipped = str(signals.get("equipped") or "").strip().lower()
    if signal_equipped and signal_equipped not in [str(x or "").strip().lower() for x in signal_owned]:
        signals["equipped"] = ""

    # default zawsze dostĂ„â„˘pny
    if "default" not in [str(x or "").strip().lower() for x in owned]:
        owned.insert(0, "default")
    if "pack_alpha" not in [str(x or "").strip().lower() for x in owned_frames]:
        owned_frames.insert(0, "pack_alpha")

    # legacy owned_skins -> owned (ale weekly/referrals earn-only nie persistujemy)
    legacy_owned = u.get("owned_skins")
    if isinstance(legacy_owned, list):
        for k in legacy_owned:
            kk = str(k or "").strip().lower()
            if not kk or kk == "default":
                continue
            meta = _skin_meta(kk)
            if meta and (_is_weekly_unlock_skin(meta) or _is_referrals_unlock_skin(meta) or _is_preview_only_skin(meta)):
                continue  # earn-only -> nie zapisuj permanentnie
            if kk and kk not in [str(x or "").strip().lower() for x in owned]:
                owned.append(kk)

    # legacy active -> equipped.skin (jeÄąâ€şli equipped nie ustawione)
    eq_skin = str(equipped.get("skin") or "").strip().lower()
    legacy_active = str(u.get("active_skin") or "").strip().lower() or str(cos.get("skin") or "").strip().lower()
    if legacy_active == "default":
        legacy_active = ""

    if not eq_skin and legacy_active:
        # ustaw tylko jeÄąâ€şli to realnie "effective owned" (perm albo weekly unlocked albo referrals unlocked)
        if _is_skin_effectively_owned(u, cos, legacy_active):
            equipped["skin"] = legacy_active

    # normalizacja
    eq_skin = str(equipped.get("skin") or "").strip().lower()
    if eq_skin == "default":
        equipped["skin"] = ""

    eq_frame = _norm_frame_key(equipped.get("frame") or "")
    if not eq_frame:
        legacy_frame_key = _norm_frame_key(
            equipped.get("frame_key")
            or cos.get("frame_key")
            or u.get("frame_key")
            or ""
        )
        legacy_frame_url = str(
            equipped.get("frame_url")
            or equipped.get("frameUrl")
            or cos.get("frame_url")
            or cos.get("frameUrl")
            or u.get("frame_url")
            or u.get("frameUrl")
            or ""
        ).strip()
        catalog_for_user = _frame_catalog_for_user(u)
        if not legacy_frame_key and legacy_frame_url:
            legacy_frame_key = _frame_key_from_url(legacy_frame_url, catalog=catalog_for_user)
        if legacy_frame_key:
            equipped["frame"] = legacy_frame_key
        elif legacy_frame_url:
            equipped["frame_url"] = legacy_frame_url
            equipped["frameUrl"] = legacy_frame_url

    frame_key, frame_url = _resolve_active_frame(u, cos)
    equipped["frame"] = frame_key
    if frame_url:
        equipped["frame_url"] = frame_url
        equipped["frameUrl"] = frame_url
    else:
        equipped.pop("frame_url", None)
        equipped.pop("frameUrl", None)

    # mirror legacy pÄ‚Ĺ‚l (bezpiecznie)
    u["active_skin"] = str(equipped.get("skin") or "").strip().lower()
    cos["skin"] = u["active_skin"]

    # upewnij siĂ„â„˘, ÄąÄ˝e legacy owned_skins istnieje i ma default
    if not isinstance(u.get("owned_skins"), list):
        u["owned_skins"] = ["default"]
    else:
        if "default" not in [str(x or "").strip().lower() for x in u["owned_skins"]]:
            u["owned_skins"].insert(0, "default")

    # Ă˘Ĺ›â€¦ auto-revert weekly/earn-only expired (dla referrals nigdy nie powinno siĂ„â„˘ cofnĂ„â€¦Ă„â€ˇ)
    _normalize_equipped_skin(u, cos)

    return cos

def _effective_owned(u: dict, cos: dict) -> list[str]:
    owned = cos.get("owned") if isinstance(cos.get("owned"), list) else []
    out = []
    for raw in owned:
        kk = str(raw or "").strip().lower()
        if not kk:
            continue
        meta = _skin_meta(kk)
        if meta and _is_preview_only_skin(meta):
            continue
        out.append(kk)
    if "default" not in out:
        out.insert(0, "default")

    now_ts = int(time.time())
    for ent in get_active_temp_entitlements(u, now=now_ts, source="influence_weekly"):
        if not isinstance(ent, dict):
            continue
        if str(ent.get("type") or "").strip().lower() != "skin":
            continue
        kk = str(influence_weekly_reward_public_key(ent) or ent.get("id") or "").strip().lower()
        if not kk:
            continue
        meta = _skin_meta(kk)
        if not meta or _is_preview_only_skin(meta):
            continue
        if kk not in out:
            out.append(kk)

    # weekly -> doÄąâ€šĂ„â€¦czamy tylko do response (nie zapisujemy do owned)
    for meta in SKINS_CATALOG:
        if _is_weekly_unlock_skin(meta):
            unlocked, _det = _weekly_skin_state(u, meta)
            if unlocked:
                kk = str(meta.get("key") or "").strip().lower()
                if kk and kk not in out:
                    out.append(kk)

    # Ă˘Ĺ›â€¦ referrals achievement -> doÄąâ€šĂ„â€¦czamy tylko do response (unlock z licznika)
    for meta in SKINS_CATALOG:
        if _is_referrals_unlock_skin(meta):
            unlocked, _det = _referrals_skin_state(u, meta)
            if unlocked:
                kk = str(meta.get("key") or "").strip().lower()
                if kk and kk not in out:
                    out.append(kk)

    for meta in SKINS_CATALOG:
        if _is_support_token_unlock_skin(meta):
            unlocked, _det = _support_token_skin_state(u, meta)
            if unlocked:
                kk = str(meta.get("key") or "").strip().lower()
                if kk and kk not in out:
                    out.append(kk)

    return out


def _is_skin_effectively_owned(u: dict, cos: dict, key: str) -> bool:
    k = (key or "").strip().lower()
    if not k or k == "default":
        return True

    meta = _skin_meta(k)
    if meta and _is_preview_only_skin(meta):
        return False

    owned_perm = cos.get("owned") if isinstance(cos.get("owned"), list) else []
    owned_perm_norm = [str(x or "").strip().lower() for x in owned_perm]
    if k in owned_perm_norm:
        return True

    for ent in get_active_temp_entitlements(u, now=int(time.time()), source="influence_weekly"):
        if not isinstance(ent, dict):
            continue
        if str(ent.get("type") or "").strip().lower() != "skin":
            continue
        ent_key = str(influence_weekly_reward_public_key(ent) or ent.get("id") or "").strip().lower()
        if ent_key == k:
            return True

    if meta and _is_weekly_unlock_skin(meta):
        unlocked, _det = _weekly_skin_state(u, meta)
        return bool(unlocked)

    # Ă˘Ĺ›â€¦ referrals achievement
    if meta and _is_referrals_unlock_skin(meta):
        unlocked, _det = _referrals_skin_state(u, meta)
        return bool(unlocked)

    if meta and _is_support_token_unlock_skin(meta):
        unlocked, _det = _support_token_skin_state(u, meta)
        return bool(unlocked)

    return False

def _normalize_equipped_skin(u: dict, cos: dict) -> bool:
    """
    Auto-revert jeÄąâ€şli equipped weekly skin juÄąÄ˝ nie speÄąâ€šnia warunku.
    Returns True jeÄąâ€şli coÄąâ€ş zmieniono.
    """
    equipped = cos.get("equipped")
    if not isinstance(equipped, dict):
        equipped = {}
        cos["equipped"] = equipped

    cur = str(equipped.get("skin") or "").strip().lower()
    if cur == "default":
        cur = ""

    changed = False
    if cur and not _is_skin_effectively_owned(u, cos, cur):
        equipped["skin"] = ""
        cur = ""
        changed = True

    # mirror legacy
    if str(u.get("active_skin") or "").strip().lower() != cur:
        u["active_skin"] = cur
        changed = True
    if str(cos.get("skin") or "").strip().lower() != cur:
        cos["skin"] = cur
        changed = True

    return changed

def _get_active_skin(user: dict) -> str:
    """
    Zwraca aktywny skin ("" = default/brak).
    Priorytet: cosmetics.equipped.skin -> active_skin -> cosmetics.skin
    """
    cos = _ensure_cosmetics(user)
    eq = cos.get("equipped") or {}

    key = str(eq.get("skin") or "").strip().lower()
    if not key:
        key = str(user.get("active_skin") or "").strip().lower()
    if not key:
        key = str(cos.get("skin") or "").strip().lower()

    if key == "default":
        key = ""
    return key

def _equip_skin(user: dict, key: str) -> tuple[bool, str]:
    """
    Ustawia skina jako equipped, ale NIE DODAJE go do owned.
    Rule: moÄąÄ˝na equip tylko jeÄąâ€şli skin jest effective-owned:
      - permanentnie w cosmetics.owned
      - albo weekly unlocked NOW
    """
    cos = _ensure_cosmetics(user)
    equipped = cos.get("equipped") or {}

    k = str(key or "").strip().lower()

    # allow clear / default
    if k in ("", "default", "none", "null"):
        equipped["skin"] = ""
        user["active_skin"] = ""
        cos["skin"] = ""
        return True, ""

    # validate exists
    if not _skin_exists(k):
        return False, "unknown_skin"

    # require effective ownership
    if not _is_skin_effectively_owned(user, cos, k):
        return False, "not_owned"

    equipped["skin"] = k

    # mirror legacy
    user["active_skin"] = k
    cos["skin"] = k

    return True, k


def _equip_frame(user: dict, key: str) -> tuple[bool, str]:
    cos = _ensure_cosmetics(user)
    equipped = cos.get("equipped") if isinstance(cos.get("equipped"), dict) else {}
    if not isinstance(equipped, dict):
        equipped = {}
        cos["equipped"] = equipped

    k = _norm_frame_key(key)
    if k in ("", "default", "none", "null"):
        equipped["frame"] = ""
        equipped.pop("frame_url", None)
        equipped.pop("frameUrl", None)
        return True, ""

    support_state = build_support_state_payload(user)
    catalog = _frame_catalog_for_user(user, support_state=support_state)

    if not _frame_exists(k, catalog=catalog):
        return False, "unknown_frame"
    if not _is_frame_effectively_owned(user, cos, k, support_state=support_state, catalog=catalog):
        return False, "not_owned"

    meta = _frame_meta(k, catalog=catalog)
    frame_url = str((meta or {}).get("preview_url") or (meta or {}).get("img") or "").strip()
    equipped["frame"] = k
    if frame_url:
        equipped["frame_url"] = frame_url
        equipped["frameUrl"] = frame_url
    else:
        equipped.pop("frame_url", None)
        equipped.pop("frameUrl", None)
    return True, k


def _frames_get_payload(u: dict) -> dict:
    cos = _ensure_cosmetics(u)
    support_state = build_support_state_payload(u)
    catalog = _frame_catalog_for_user(u, support_state=support_state)
    active_key, active_url = _resolve_active_frame(u, cos)
    active_norm = _norm_frame_key(active_key)
    owned_eff = _effective_owned_frames(u, cos, support_state=support_state, catalog=catalog)
    owned_set = set(owned_eff)

    frames_out = []
    for meta in catalog:
        key = _norm_frame_key(meta.get("key"))
        img = str(meta.get("img") or meta.get("preview_url") or "").strip()
        if not key or not img:
            continue
        display_name = str(meta.get("name") or key).strip()
        preview_url = str(meta.get("preview_url") or img).strip() or img
        owned_flag = key in owned_set
        item = {
            "key": key,
            "display_name": display_name,
            "name": display_name,
            "preview_url": preview_url,
            "img": preview_url,
            "owned": owned_flag,
            "effective": owned_flag,
            "equipped": key == active_norm,
        }
        unlock = meta.get("unlock")
        if isinstance(unlock, dict):
            item["unlock"] = dict(unlock)
            source_label = str(meta.get("sourceLabel") or "").strip() or _frame_source_label_from_unlock(unlock)
        else:
            source_label = str(meta.get("sourceLabel") or "").strip()
        if source_label:
            item["source"] = source_label
        for field in ("rarity", "premium", "description", "safetyLine"):
            if field in meta:
                item[field] = meta.get(field)
        frames_out.append(item)

    return {
        "ok": True,
        "frames": frames_out,
        "owned": owned_eff,
        "equipped": {
            "frame": active_key or "",
            "frame_url": active_url or "",
            "frameUrl": active_url or "",
        },
        "active": active_key or "",
    }


async def frames_get_handler(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    u = await read_user(uid)
    if not isinstance(u, dict):
        def _create(u2: dict):
            u2.setdefault("id", uid)
            u2.setdefault("uid", uid)
            u2.setdefault("user_id", uid)
            u2.setdefault("username", tg_user.get("username") or "")
            _ensure_cosmetics(u2)
            return u2
        u = await with_user(uid, _create, reason="webapp:frames_get:create")

    before = _cos_snapshot(u)
    uname_before = u.get("username") or ""
    _ensure_cosmetics(u)
    if not u.get("username"):
        u["username"] = tg_user.get("username") or ""
    after = _cos_snapshot(u)
    uname_after = u.get("username") or ""

    if before != after or uname_before != uname_after:
        def _mut(u2: dict):
            u2.setdefault("id", uid)
            u2.setdefault("uid", uid)
            u2.setdefault("user_id", uid)
            if not u2.get("username"):
                u2["username"] = tg_user.get("username") or ""
            _ensure_cosmetics(u2)
            return u2
        u = await with_user(uid, _mut, reason="webapp:frames_get:ensure")

    return web.json_response(_frames_get_payload(u))


def _frames_equip_mut(u: dict, uid: str, username: str, key: str) -> dict:
    u.setdefault("id", uid)
    u.setdefault("uid", uid)
    u.setdefault("user_id", uid)
    if username and not u.get("username"):
        u["username"] = username

    _ensure_cosmetics(u)
    ok_frame, active = _equip_frame(u, key)
    if not ok_frame:
        if active == "not_owned":
            raise ValueError("not_owned")
        raise ValueError("invalid_frame")

    payload = _frames_get_payload(u)
    return {
        "ok": True,
        "active": active,
        "equipped": payload.get("equipped") or {"frame": active, "frame_url": "", "frameUrl": ""},
    }


async def frames_equip_handler(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    key = str(body.get("frame") or "").strip().lower()
    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    username = tg_user.get("username") or ""
    try:
        result = await with_user(
            uid,
            lambda u: _frames_equip_mut(u, uid, username, key),
            reason="webapp:frames_equip",
        )
    except ValueError as e:
        code = str(e)
        if code == "not_owned":
            return web.json_response({"ok": False, "reason": "NOT_OWNED"}, status=403)
        return web.json_response({"ok": False, "reason": "INVALID_FRAME"}, status=400)

    return web.json_response(result)


def _blue_signal_hunt_claim_mut(u: dict, uid: str, username: str) -> dict:
    u.setdefault("id", uid)
    u.setdefault("uid", uid)
    u.setdefault("user_id", uid)
    if username and not u.get("username"):
        u["username"] = username

    _ensure_cosmetics(u)
    result = claim_blue_signal_frame(u)
    _ensure_cosmetics(u)
    result["progress"] = build_blue_signal_hunt_progress(u)
    return result


async def blue_signal_hunt_claim_handler(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    username = tg_user.get("username") or ""
    result = await with_user(
        uid,
        lambda u: _blue_signal_hunt_claim_mut(u, uid, username),
        reason="webapp:blue_signal_hunt:claim",
    )
    status = 200 if result.get("ok") else 400
    return web.json_response(result, status=status)


# ==== /SKINS API ===================================================

async def skins_get_handler(request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    # 1) Read snapshot
    u = await read_user(uid)

    # 2) JeÄąâ€şli user nie istnieje -> utwÄ‚Ĺ‚rz atomowo (jak dawniej data.setdefault)
    if not isinstance(u, dict):
        def _create(u2: dict):
            u2.setdefault("id", uid)
            u2.setdefault("uid", uid)
            u2.setdefault("user_id", uid)
            u2.setdefault("username", tg_user.get("username") or "")
            _ensure_cosmetics(u2)
            _get_active_skin(u2)
            return u2

        u = await with_user(uid, _create, reason="webapp:skins_get:create")

    # 3) Ensure cosmetics dla response (bez zapisu jeÄąâ€şli nic siĂ„â„˘ nie zmieniÄąâ€šo)
    before = _cos_snapshot(u)
    uname_before = u.get("username") or ""

    cos = _ensure_cosmetics(u)
    active = _get_active_skin(u)  # "" = default

    # ewentualnie uzupeÄąâ€šnij username w pamiĂ„â„˘ci (do response)
    if not u.get("username"):
        u["username"] = tg_user.get("username") or ""

    after = _cos_snapshot(u)
    uname_after = u.get("username") or ""

    # 4) JeÄąâ€şli ensure coÄąâ€ş zmieniÄąâ€š -> zapisz atomowo (tylko wtedy)
    if before != after or uname_before != uname_after:
        def _mut(u2: dict):
            u2.setdefault("id", uid)
            u2.setdefault("uid", uid)
            u2.setdefault("user_id", uid)
            if not u2.get("username"):
                u2["username"] = tg_user.get("username") or ""
            _ensure_cosmetics(u2)
            _get_active_skin(u2)
            return u2

        u = await with_user(uid, _mut, reason="webapp:skins_get:ensure")
        cos = _ensure_cosmetics(u)
        active = _get_active_skin(u)

    # build skins list with weekly/referrals progress fields
    skins_out = []
    for s in SKINS_CATALOG:
        o = dict(s)
        key = str(o.get("key") or "").strip().lower()
        owned_now = _is_skin_effectively_owned(u, cos, key)
        if not _skin_visible_in_selector(s, owned_now):
            continue
        if _is_preview_only_skin(s):
            owned_now = False
            o.setdefault("preview_only", True)
            o.setdefault("acquisition", "spins_only")
            o.setdefault("locked_label", "Available in Spins only")
        o["owned"] = bool(owned_now)
        o["equipped"] = bool(key and key == str(active or "").strip().lower())

        if _is_weekly_unlock_skin(s):
            unlocked, det = _weekly_skin_state(u, s)
            if det:
                o["unlockHave"] = det["have"]
                o["unlockNeed"] = det["need"]
                o["unlockWeek"] = det["week"]
                o["unlockEndsSec"] = det["endsSec"]
                o["unlockedNow"] = bool(unlocked)

        if _is_referrals_unlock_skin(s):
            unlocked, det = _referrals_skin_state(u, s)
            if det:
                o["unlockHave"] = det["have"]
                o["unlockNeed"] = det["need"]
                o["unlockedNow"] = bool(unlocked)

        if _is_support_token_unlock_skin(s):
            unlocked, det = _support_token_skin_state(u, s)
            if det:
                o["unlockHave"] = det["have"]
                o["unlockNeed"] = det["need"]
                o["unlockedNow"] = bool(unlocked)

        skins_out.append(o)

    owned_eff = _effective_owned(u, cos)

    return web.json_response({
        "ok": True,
        "skins": skins_out,
        "owned": owned_eff,
        "equipped": (cos.get("equipped") or {"skin": ""}),
        "active": active or "",
    })


async def skins_equip_handler(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    key = str(body.get("skin") or "").strip().lower()
    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    meta = _skin_meta(key)
    if meta and _is_preview_only_skin(meta):
        return web.json_response({"ok": False, "reason": "SPINS_ONLY"}, status=403)

    username = tg_user.get("username") or ""

    try:
        result = await with_user(
            uid,
            lambda u: _skins_equip_mut(u, uid, username, key),
            reason="webapp:skins_equip",
        )
    except ValueError as e:
        code = str(e)
        if code == "not_owned":
            return web.json_response({"ok": False, "reason": "NOT_OWNED"}, status=403)
        if code == "invalid_skin":
            return web.json_response({"ok": False, "reason": "INVALID_SKIN"}, status=400)
        return web.json_response({"ok": False, "reason": "INVALID_SKIN"}, status=400)

    return web.json_response(result)


def _skins_equip_mut(u: dict, uid: str, username: str, key: str) -> dict:
    u.setdefault("id", uid)
    u.setdefault("uid", uid)
    u.setdefault("user_id", uid)
    if username and not u.get("username"):
        u["username"] = username

    _ensure_cosmetics(u)

    ok_skin, active = _equip_skin(u, key)
    if not ok_skin:
        if active == "not_owned":
            raise ValueError("not_owned")
        raise ValueError("invalid_skin")

    equipped = (u.get("cosmetics") or {}).get("equipped", {"skin": ""})

    return {
        "ok": True,
        "active": active,
        "equipped": equipped,
    }

def _skin_meta(key: str) -> dict | None:
    k = (key or "").strip().lower()
    return next((s for s in SKINS_CATALOG if (s.get("key") or "").strip().lower() == k), None)


async def skins_buy_handler(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    key = str(body.get("skin") or "").strip().lower()
    meta = _skin_meta(key)
    if not meta:
        return web.json_response({"ok": False, "reason": "INVALID_SKIN"}, status=400)

    if _is_preview_only_skin(meta):
        return web.json_response({"ok": False, "reason": "SPINS_ONLY"}, status=403)

    # earn-only skins cannot be bought
    if (
        _is_weekly_unlock_skin(meta)
        or _is_referrals_unlock_skin(meta)
        or _is_support_unlock_skin(meta)
        or _is_support_token_unlock_skin(meta)
    ):
        return web.json_response({"ok": False, "reason": "EXTERNAL_UNLOCK"}, status=403)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    username = tg_user.get("username") or ""

    cost = meta.get("cost") or {}
    bones_cost = int(cost.get("bones", 0) or 0)
    token_cost = int((cost.get("tokens") or cost.get("token") or 0))

    run_id_base = None
    if bones_cost > 0 or token_cost > 0:
        run_id_base = _get_run_id(body, "skins_buy", uid, key)

    try:
        out = await with_user(
            uid,
            lambda u: _skins_buy_mut(
                u=u,
                uid=uid,
                username=username,
                key=key,
                bones_cost=bones_cost,
                token_cost=token_cost,
                run_id_base=run_id_base,
            ),
            reason=f"webapp:skins_buy:{key}",
        )
    except ValueError as e:
        code = str(e)
        if code == "NOT_ENOUGH_BONES":
            return web.json_response({"ok": False, "reason": "NOT_ENOUGH_BONES"}, status=409)
        if code == "NOT_ENOUGH_TOKENS":
            return web.json_response({"ok": False, "reason": "NOT_ENOUGH_TOKENS"}, status=409)
        return web.json_response({"ok": False, "reason": "BUY_FAILED"}, status=400)

    # balances z ledger (jak wczeÄąâ€şniej)
    new_bones = int(user_balance_int(uid, "bones", 0))
    new_tokens = int(user_balance_int(uid, "tokens", 0))

    if out.get("already"):
        return web.json_response({"ok": True, "already": True, "owned": out.get("owned") or []})

    return web.json_response({
        "ok": True,
        "bought": out["bought"],
        "owned": out["owned"],
        "spent": {"bones": bones_cost, "token": token_cost},
        "balance": {"bones": new_bones, "token": new_tokens, "tokenSymbol": "$TOKEN"},
    })


def _skins_buy_mut(*, u: dict, uid: str, username: str, key: str, bones_cost: int, token_cost: int, run_id_base: str | None) -> dict:
    u.setdefault("id", uid)
    u.setdefault("uid", uid)
    u.setdefault("user_id", uid)
    if username and not u.get("username"):
        u["username"] = username

    cos = _ensure_cosmetics(u)
    owned = cos.get("owned") or []
    if key in owned:
        return {"already": True, "owned": owned}

    # init token balance helper (best-effort)
    try:
        _get_token_balance(u)
    except Exception:
        pass

    # --- SPEND (ledger-first, retry-safe via run_id) ---
    if bones_cost > 0:
        run_id = f"{run_id_base}:bones" if run_id_base else None
        try:
            debit(
                uid, "bones", bones_cost,
                reason="skins_buy",
                run_id=run_id,
                note=f"buy_skin:{key}",
                ref={"type": "skins", "skin": key, "price_bones": bones_cost, "run_id": run_id},
                mirror_user=u,
                mirror_assets=("bones",),
                require_funds=True,
            )
        except ValueError:
            raise ValueError("NOT_ENOUGH_BONES")

    if token_cost > 0:
        run_id = f"{run_id_base}:tokens" if run_id_base else None
        try:
            debit(
                uid, "tokens", token_cost,
                reason="skins_buy",
                run_id=run_id,
                note=f"buy_skin:{key}",
                ref={"type": "skins", "skin": key, "price_tokens": token_cost, "run_id": run_id},
                mirror_user=u,
                mirror_assets=("tokens",),
                require_funds=True,
            )
        except ValueError:
            raise ValueError("NOT_ENOUGH_TOKENS")
    # --- END SPEND ---

    owned.append(key)
    cos["owned"] = owned

    return {"bought": key, "owned": owned}

# ==== /SKINS FLEX (post to community) =========================================

async def _tg_call(method: str, token: str, payload: dict):
    url = f"https://api.telegram.org/bot{token}/{method}"
    async with aiohttp.ClientSession() as s:
        async with s.post(url, json=payload, timeout=15) as r:
            data = await r.json()
            if not data.get("ok"):
                raise RuntimeError(f"TG {method} failed: {data}")
            return data

async def skins_flex_handler(request):
    """
    POST /webapp/skins/flex
    body: { skinKey?: str, run_id?: str }  (jeÄąâ€şli brak -> flexuje aktualnie equipped)
    """
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    now = int(time.time())

    # run_id (idempotency)
    try:
        run_id = body.get("run_id") or _get_run_id(body, "skins:flex", uid, extra=str(body.get("skinKey") or ""))
    except Exception:
        run_id = str(body.get("run_id") or f"flex:{uid}:{now}")

    from data_store import with_user  # Ă˘Ĺ›â€¦ canonical write path

    # 1) PREP (lock + cooldown + inflight)
    def _prep(u: dict):
        if not isinstance(u, dict):
            return {"ok": False, "reason": "NO_USER"}

        # spÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ minimalna
        u.setdefault("id", uid)
        u.setdefault("uid", uid)
        u.setdefault("user_id", uid)
        if tg_user.get("username"):
            u.setdefault("username", tg_user.get("username") or "")

        cos = _ensure_cosmetics(u)
        active = _get_active_skin(u)  # "" = default

        # skinKey (z WebApp) lub skin (kompatybilnoÄąâ€şĂ„â€ˇ)
        skin_key = str(body.get("skinKey") or body.get("skin") or "").strip().lower()
        if skin_key in ("default", "none", "null"):
            skin_key = ""

        # jeÄąâ€şli frontend nie podaÄąâ€š key Ă˘â‚¬â€ť flexujemy aktualny
        if not skin_key:
            skin_key = active  # moÄąÄ˝e byĂ„â€ˇ ""

        # walidacja: jeÄąâ€şli to nie default, musi istnieĂ„â€ˇ i byĂ„â€ˇ owned
        if skin_key:
            if not _skin_exists(skin_key):
                return {"ok": False, "reason": "INVALID_SKIN"}
            if not _is_skin_effectively_owned(u, cos, skin_key):
                return {"ok": False, "reason": "NOT_OWNED"}

        tel = u.get("telemetry")
        if not isinstance(tel, dict):
            tel = {}
            u["telemetry"] = tel

        # anti-double flex (inflight)
        inflight_until = int(tel.get("skin_flex_inflight_until", 0) or 0)
        inflight_id = str(tel.get("skin_flex_inflight_id", "") or "")
        if inflight_until > now and inflight_id and inflight_id != run_id:
            return {"ok": False, "reason": "BUSY", "retryAfterSec": (inflight_until - now)}

        # cooldown
        last = int(tel.get("last_skin_flex_ts", 0) or 0)
        if now - last < FLEX_COOLDOWN_SEC:
            left = FLEX_COOLDOWN_SEC - (now - last)
            return {"ok": False, "reason": "COOLDOWN", "cooldownLeftSec": left}

        # meta
        meta = _skin_meta(skin_key) if skin_key else {"name": "Default", "img": ""}
        skin_name = str((meta or {}).get("name") or (skin_key or "Default"))
        img_path = str((meta or {}).get("img") or "").strip()

        # inflight lock krÄ‚Ĺ‚tki
        tel["skin_flex_inflight_until"] = now + 25
        tel["skin_flex_inflight_id"] = run_id
        tel["skin_flex_inflight_skin"] = (skin_key or "")

        return {
            "ok": True,
            "skin_key": (skin_key or ""),
            "skin_name": skin_name,
            "img_path": img_path,
            "username": (tg_user.get("username") or ""),
            "first_name": (tg_user.get("first_name") or "Howler"),
        }

    prep = await with_user(uid, _prep, reason="webapp:skins:flex:prep")

    if not prep or not prep.get("ok"):
        status = 409 if prep and prep.get("reason") in ("COOLDOWN", "BUSY") else 400
        if prep and prep.get("reason") == "NOT_OWNED":
            status = 403
        return web.json_response(prep or {"ok": False, "reason": "FAIL"}, status=status)

    skin_key = prep["skin_key"]
    skin_name = prep["skin_name"]
    img_path = prep["img_path"]

    # 2) photo url
    if img_path.startswith("http://") or img_path.startswith("https://"):
        photo_url = img_path
    elif img_path.startswith("/"):
        photo_url = WEBAPP_PUBLIC_BASE.rstrip("/") + img_path
    else:
        photo_url = ""

    username = prep.get("username") or tg_user.get("username")
    name = (prep.get("first_name") or "Howler").strip()
    safe_name = html.escape(name)
    who = f"@{username}" if username else f"<a href=\"tg://user?id={tg_user['id']}\">{safe_name}</a>"

    deep = f"https://t.me/Alpha_husky_bot/AlphaHuskyHub?startapp=skin_{skin_key or 'default'}"

    caption = (
        f"Ä‘Ĺşâ€ťÄ„ <b>FLEX SKIN!</b>\n"
        f"{who} equipped: <b>{html.escape(skin_name)}</b>\n"
        f"{deep}\n"
        f"#AlphaHusky"
    )

    # 3) send TG (bez locka)
    try:
        token = _get_bot_token()

        if photo_url:
            try:
                await _tg_call("sendPhoto", token, {
                    "chat_id": CHANNEL_ID,
                    "photo": photo_url,
                    "caption": caption,
                    "parse_mode": "HTML",
                })
            except Exception as e_photo:
                _LOG.warning("[SKINS] sendPhoto failed -> fallback sendMessage: %s", e_photo)
                await _tg_call("sendMessage", token, {
                    "chat_id": CHANNEL_ID,
                    "text": caption,
                    "parse_mode": "HTML",
                    "disable_web_page_preview": False
                })
        else:
            await _tg_call("sendMessage", token, {
                "chat_id": CHANNEL_ID,
                "text": caption,
                "parse_mode": "HTML",
                "disable_web_page_preview": False
            })

    except Exception as e:
        _LOG.exception("[SKINS] flex send failed: %s", e)

        # rollback inflight
        def _rollback(u: dict):
            tel = u.get("telemetry")
            if isinstance(tel, dict) and str(tel.get("skin_flex_inflight_id", "")) == run_id:
                tel.pop("skin_flex_inflight_until", None)
                tel.pop("skin_flex_inflight_id", None)
                tel.pop("skin_flex_inflight_skin", None)
            return {"ok": True}

        await with_user(uid, _rollback, reason="webapp:skins:flex:rollback")
        return web.json_response({"ok": False, "reason": "TG_SEND_FAIL"}, status=502)

    # 4) COMMIT cooldown + clear inflight
    def _commit(u: dict):
        tel = u.get("telemetry")
        if not isinstance(tel, dict):
            tel = {}
            u["telemetry"] = tel

        if str(tel.get("skin_flex_inflight_id", "")) == run_id:
            tel["last_skin_flex_ts"] = now
            tel.pop("skin_flex_inflight_until", None)
            tel.pop("skin_flex_inflight_id", None)
            tel.pop("skin_flex_inflight_skin", None)

        return {"ok": True}

    await with_user(uid, _commit, reason="webapp:skins:flex:commit")

    return web.json_response({"ok": True, "flexed": (skin_key or "default"), "postedTo": CHANNEL_ID})


async def dashboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Otwiera WebAppa z huba."""
    chat = update.effective_chat
    url = _webapp_url(src="kb")

    send = (
        update.callback_query.message.reply_text
        if getattr(update, "callback_query", None)
        else update.message.reply_text
    )

    # Ă˘Ĺ›â€¦ Telegram restriction: WebApp buttons work only in PRIVATE chats
    if chat and getattr(chat, "type", "") != "private":
        deep = "https://t.me/Alpha_husky_bot/AlphaHuskyHub?startapp=kb"
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("Ä‘ĹşÂĹź Open Dashboard (DM)", url=deep)]
        ])
        return await send(
            "Ă˘ĹˇÂ ÄŹÂ¸Ĺą Dashboard can be opened only in a private chat with the bot.\nTap below:",
            reply_markup=kb
        )

    # Ă˘Ĺ›â€¦ PRIVATE CHAT: OK to use web_app button
    kb = [[KeyboardButton("Open Dashboard", web_app=WebAppInfo(url=url))]]
    reply_markup = ReplyKeyboardMarkup(kb, resize_keyboard=True)
    chat_id = update.effective_chat.id
    msg_id = context.user_data.get(HUB_KEY)

    if msg_id:
        try:
            return await context.bot.edit_message_text(
                chat_id=chat_id,
                message_id=msg_id,
                text="Alpha Hub Ă˘â‚¬â€ť open the dashboard:",
                reply_markup=reply_markup,
            )
        except BadRequest:
            pass

    m = await send("Alpha Hub Ă˘â‚¬â€ť open the dashboard:", reply_markup=reply_markup)
    context.user_data[HUB_KEY] = m.message_id

async def on_webapp_data_dash(update, context):
    if not update.message or not getattr(update.message, "web_app_data", None):
        return

    raw = (update.message.web_app_data.data or "").strip()
    uid = str(update.effective_user.id)

    # --- 1) Parsowanie: JSON (payload/flatten) lub prosty "a:b:c"
    action, payload = None, {}
    try:
        obj = json.loads(raw)
        if isinstance(obj, dict):
            action = obj.get("action") or obj.get("type")
            # case A: {"action": "...", "payload": {...}}
            if isinstance(obj.get("payload"), dict):
                payload = obj["payload"]
            else:
                # case B: {"action": "...", ...params}
                payload = {k: v for k, v in obj.items() if k not in ("action", "type")}
    except Exception:
        pass

    if not action:
        parts = raw.split(":")
        action = parts[0] if parts and parts[0] else None
        if len(parts) >= 2:
            payload["buildingId"] = parts[1]
        if len(parts) >= 3:
            payload["level"] = parts[2]

    if not action:
        return await update.message.reply_text("WebApp: empty payload.")

    # --- 2) SpÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ usera (jeÄąâ€şli WebApp wysyÄąâ€ša userId)
    if payload.get("userId") is not None and str(payload["userId"]) != uid:
        return await update.message.reply_text("User mismatch. Open Dashboard from your bot.")

    # --- 2.5) Normalizacja zdarzeÄąâ€ž mapy ---
    NODE_TO_BUILDING = {
        "abandoned_wallets": "abandoned_wallets_vault",
        "broken_contracts":  "broken_contracts_hub",
        "moon_lab":          "moonlab_fortress",
        "testnet_wastes":    "testnet_wastes_dojo",
        "chain_gate":        "chain_gate",
    }
    node_id = (payload.get("nodeId") or payload.get("node") or payload.get("id") or "").strip()
    bid = (payload.get("buildingId") or payload.get("building_id") or payload.get("bid") or "").strip()
    if not bid and node_id in NODE_TO_BUILDING:
        bid = NODE_TO_BUILDING[node_id]
        payload["buildingId"] = bid

    # akceptuj alternatywne nazwy akcji z frontu
    if action in ("open_building", "node_open", "node_click"):
        action = "building_enter"

    if action in ("region_open", "open_region") and payload.get("buildingId"):
        action = "building_enter"

    # --- 3) Trasy akcji ---

    # 3a) Komendy z paska
    if action == "cmd":
        name = (payload.get("name") or "").lstrip("/").lower()
        args = payload.get("args") or []
        CMDS = {
            "inventory": "inventory",
            "equipped":  "show_equipped",
            "keys":      "cmd_keys",
            "feed":      "feed",
            "mystats":   "mystats",
            "pets":      "pets",
            "mypets":    "pets",
            "profile":   "profile",
            "howlboard": "howlboard",
            "shop":      "shop",
            "map":       "dashboard",
        }
        fn_name = CMDS.get(name)
        if not fn_name:
            return await update.message.reply_text(f"Unknown command: {name}")
        target = globals().get(fn_name)
        if not callable(target):
            return await update.message.reply_text(f"Command mapped, but function not found: {fn_name}")

        res = target(update, context, *args) if args else target(update, context)
        if hasattr(res, "__await__"):
            await res
        return

    # 3b) Otwieranie regionu (Hunt/Explore picker)
    if action in ("region_open", "open_region"):
        region = (payload.get("region") or "chain")

        def mut(u: dict):
            # spÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ uid
            u.setdefault("id", uid)
            u.setdefault("uid", uid)
            u.setdefault("user_id", uid)

            # ensure structures
            try:
                ensure_regions_keys(u)
            except Exception:
                pass

            # locked check
            try:
                if region != "chain" and not is_region_unlocked(u, region):
                    return {"ok": False, "reason": "LOCKED"}
            except Exception:
                # jeÄąâ€şli check siĂ„â„˘ wywali -> nie blokuj
                pass

            u["current_region"] = region
            return {"ok": True}

        r = await with_user(uid, mut, reason="tg:webapp:region_open")
        if not r or not r.get("ok"):
            return await update.message.reply_text("Ä‘Ĺşâ€ťâ€™ Region locked Ă˘â‚¬â€ť use /keys.")

        kb = InlineKeyboardMarkup([[
            InlineKeyboardButton("Ä‘Ĺşâ€”ĹźÄŹÂ¸Ĺą Hunt",    callback_data=f"m_start:{region}:hunt"),
            InlineKeyboardButton("Ä‘Ĺşâ€ťĹ¤ Explore", callback_data=f"m_start:{region}:explore"),
        ]])
        pretty = REGION_NAMES.get(region, region.replace("_", " ").title())
        return await update.message.reply_text(
            f"Ä‘ĹşĹšĹ¤ Region: <b>{pretty}</b>\nChoose your mission:",
            parse_mode="HTML",
            reply_markup=kb
        )

    # 3c) WejÄąâ€şcie do budynku (mapa)
    if action in ("building_enter", "enter_building"):
        bid = payload.get("buildingId")
        if not bid:
            return await update.message.reply_text("WebApp: missing buildingId.")
        if bid == "moonlab_fortress":
            return await tg_moonlab_menu(update, context)
        if bid in BUILDING_CFG:
            return await show_building_menu(update, context, bid)
        return await update.message.reply_text(f"WebApp: unknown buildingId '{bid}'.")

    # 3d) Ă˘â‚¬ĹľBoss z WebAppaĂ˘â‚¬ĹĄ
    if action == "boss_start":
        return await show_moonlab_fortress_menu(update, context)

    # 3e) Odblokowanie regionu
    if action == "unlock_region":
        region = payload.get("region")
        if not region:
            return await update.message.reply_text("No region specified.")

        def mut(u: dict):
            u.setdefault("id", uid)
            u.setdefault("uid", uid)
            u.setdefault("user_id", uid)

            try:
                ensure_regions_keys(u)
            except Exception:
                pass

            ru = (u.get("regions_unlocked") or {})
            keys = (u.get("keys") or {})

            if ru.get(region):
                return {"ok": True, "already": True}

            if int(keys.get(region, 0) or 0) <= 0:
                return {"ok": False, "reason": "NO_KEY"}

            keys[region] = int(keys.get(region, 0) or 0) - 1
            ru[region] = True
            u["keys"] = keys
            u["regions_unlocked"] = ru
            return {"ok": True, "unlocked": True}

        r = await with_user(uid, mut, reason="tg:webapp:unlock_region")
        if not r or not r.get("ok"):
            return await update.message.reply_text("Ă˘ĹĄĹš No key available. Use /keys.")
        if r.get("already"):
            return await update.message.reply_text("Already unlocked Ă˘Ĺ›â€¦")
        return await update.message.reply_text("Ă˘Ĺ›â€¦ Unlocked.")

    return await update.message.reply_text(f"WebApp: unknown action '{action}'.")


ANIMATE_MOONLAB = True       # animowana walka (edycje wiadomoÄąâ€şci co turĂ„â„˘)
ROUND_DELAY_SEC = 0.8        # opÄ‚Ĺ‚ÄąĹźnienie miĂ„â„˘dzy turami przy animacji
HPBAR_W         = 18
BOSS_NAMES      = ["Gleam Warden","Atrium Sentinel","Phase Knight","Lunar Myrmidon","Core Custodian","Pale Tyrant"]

# === boss sprites (WebApp assets) ===
DEFAULT_BOSS_SPRITE = "/images/bosses/default.png"
BOSS_SPRITES = {
    "Gleam Warden":     "/images/bosses/gleam_warden.png",
    "Atrium Sentinel":  "/images/bosses/atrium_sentinel.png",
    "Phase Knight":     "/images/bosses/phase_knight.png",
    "Lunar Myrmidon":   "/images/bosses/lunar_myrmidon.png",
    "Core Custodian":   "/images/bosses/core_custodian.png",
    "Pale Tyrant":      "/images/bosses/pale_tyrant.png",
}

def _boss_sprite(name: str) -> str:
    """Zwraca Äąâ€şcieÄąÄ˝kĂ„â„˘ do grafiki bossa po nazwie."""
    return BOSS_SPRITES.get(name, DEFAULT_BOSS_SPRITE)

def _boss_sprite_by_level(level: int) -> str:
    """Wygodny helper, gdy masz tylko level."""
    return _boss_sprite(_boss_display_name(level))
# ============================================================================

def _boss_display_name(level: int) -> str:
    return BOSS_NAMES[(level - 1) % len(BOSS_NAMES)]

def _hpbar(cur: int, maxhp: int, w: int = HPBAR_W) -> str:
    cur = max(0, int(cur)); maxhp = max(1, int(maxhp))
    fill = int(round(w * (cur / maxhp)))
    return "Ă˘â€“Â"*fill + "Ă˘â€“â€"*(w - fill)

def _board(p, b) -> str:
    return (
        f"YOU  [{_hpbar(p['hp'], p['_max'])}] {p['hp']}/{p['_max']}\n"
        f"BOSS [{_hpbar(b['hp'], b['maxhp'])}] {b['hp']}/{b['maxhp']}"
    )

# Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ Combat profile (spÄ‚Ĺ‚jny z compute_full_stats) Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬
COMBAT_CACHE_TTL = 60  # s

def _combat_from_totals(t: dict) -> dict:
    STR = int(t.get("strength", 0));  AGI = int(t.get("agility", 0))
    DEF = int(t.get("defense", 0));   VIT = int(t.get("vitality", 0))
    LUK = int(t.get("luck", 0));      INT = int(t.get("intelligence", 0))

    hp_max = int(140 + VIT*18 + DEF*4)              # wytrzymaÄąâ€šoÄąâ€şĂ„â€ˇ
    atk    = int(18  + STR*2 + AGI*1 + INT*0.3)     # ofensywa
    dfn    = int(6   + DEF*1.6 + VIT*0.5)           # pancerz
    crit   = max(0.05, min(0.35, 0.08 + LUK*0.003)) # 8%Ă˘â€ â€™35%
    dodge  = max(0.02, min(0.25, 0.03 + AGI*0.002)) # 3%Ă˘â€ â€™25%
    return {"hp_max": hp_max, "atk": atk, "def": dfn, "crit": crit, "dodge": dodge}

def _get_combat_profile(u: dict) -> dict:
    now = int(time.time())
    cc  = u.setdefault("_cache", {}).get("combat")
    if cc and now - int(cc.get("ts", 0)) < COMBAT_CACHE_TTL:
        return cc["v"]
    parts = compute_full_stats(u)              # JEDNO wywoÄąâ€šanie
    prof  = _combat_from_totals(parts.get("totals", {}))
    u["_cache"]["combat"] = {"ts": now, "v": prof}
    return prof

def _player_stats(u: dict) -> dict:
    p = _get_combat_profile(u)
    return {"hp": p["hp_max"], "_max": p["hp_max"], "atk": p["atk"], "def": p["def"], "crit": p["crit"], "dodge": p["dodge"]}

def _player_power(u: dict) -> int:
    p = _get_combat_profile(u)
    return p["hp_max"]//10 + p["atk"]*3 + p["def"]*2

def _attack(att: dict, deff: dict) -> tuple[int, bool, bool]:
    """Zwraca (dmg, crit, dodge) i odejmuje HP obroÄąâ€žcy; wspiera CRIT/DODGE z profilu."""
    dodge_chance = float(deff.get("dodge", 0.07))
    crit_chance  = float(att.get("crit",  0.12))
    if random.random() < dodge_chance:
        return 0, False, True
    base = max(1, att["atk"] - deff["def"] + random.randint(-3, 3))
    crit = random.random() < crit_chance
    dmg  = int(base * (1.5 if crit else 1.0))
    deff["hp"] = max(0, deff["hp"] - dmg)
    return dmg, crit, False

def _simulate_dojo(u: dict, seconds: int = 60, *, aps: float = 1.0, dummy_def: int = 12) -> dict:
    """Prosty miernik DPS: X atakÄ‚Ĺ‚w/sek na manekinie z duÄąÄ˝ym HP."""
    prof = _get_combat_profile(u)
    player = {"hp": prof["hp_max"], "_max": prof["hp_max"], "atk": prof["atk"], "def": prof["def"],
              "crit": prof["crit"], "dodge": prof["dodge"]}
    dummy  = {"hp": 10_000_000, "def": dummy_def, "crit": 0.0, "dodge": 0.0}  # praktycznie nieÄąâ€şmiertelny

    total, hits, crits, max_hit = 0, 0, 0, 0
    steps_sample = []
    total_swings = int(seconds * aps)
    for t in range(1, total_swings + 1):
        dmg, crit, dodge = _attack(player, dummy)
        if dodge:
            continue
        hits += 1
        total += dmg
        max_hit = max(max_hit, dmg)
        if crit: crits += 1
        if t > total_swings - 8:
            steps_sample.append({"t": t, "dmg": dmg, "crit": crit})

    dps = total / max(1, seconds)
    avg = total / max(1, hits)
    return {
        "seconds": seconds, "attacks": total_swings,
        "hits": hits, "total": total, "dps": round(dps, 2),
        "avgHit": round(avg, 2), "maxHit": max_hit,
        "critRate": round(crits / max(1, hits), 4),
        "sample": steps_sample,
        "player": {"atk": player["atk"], "def": player["def"], "crit": player["crit"], "dodge": player["dodge"]}
    }

# Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ Fortress state & rules (3 floors Ä‚â€” 10) Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬
MOONLAB_COOLDOWN_SEC = 3600        # 1h
MOONLAB_MAX_LEVEL    = 30          # 3 piĂ„â„˘tra Ä‚â€” 10 encounterÄ‚Ĺ‚w (map.json)
FLOOR_FIRST_CLEAR_REWARDS = {      # zgodne z map.json
    "floor_1": ["moon_shard", "tech_cache"],
    "floor_2": ["moon_shard", "tech_cache", "rune_dust"],
    "floor_3": ["lunar_core", "ancient_module"],
}

def _moonlab_progress(u: dict) -> dict:
    """
    State fortecy w profilu:
      level, best_level, last_attack_ts, last_battle, first_clears{floor_1..3}
    """
    b = u.setdefault("buildings", {}).setdefault("moonlab_fortress", {})
    b.setdefault("version", 1)
    b.setdefault("level", 1)
    b.setdefault("best_level", 0)
    b.setdefault("last_attack_ts", 0)
    b.setdefault("last_battle", {})
    fc = b.setdefault("first_clears", {})
    for fid in ("floor_1","floor_2","floor_3"):
        fc.setdefault(fid, False)

    # sanity range
    if not isinstance(b["level"], int) or b["level"] < 1: b["level"] = 1
    if not isinstance(b["best_level"], int) or b["best_level"] < 0: b["best_level"] = 0
    b["level"] = min(b["level"], MOONLAB_MAX_LEVEL)
    b["best_level"] = min(b["best_level"], MOONLAB_MAX_LEVEL)
    return b

def _cooldown_left(last_ts: int, now: int) -> int:
    return max(0, last_ts + MOONLAB_COOLDOWN_SEC - now)

def _format_cd(secs: int) -> str:
    m, s = divmod(max(0, int(secs)), 60)
    h, m = divmod(m, 60)
    if h: return f"{h}h {m}m"
    if m: return f"{m}m {s}s"
    return f"{s}s"

def _level_to_floor(level: int) -> str:
    if level <= 10: return "floor_1"
    if level <= 20: return "floor_2"
    return "floor_3"

def _is_floor_boss(level: int) -> bool:
    return level % 10 == 0

# Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ Boss stats (lekko rosnĂ„â€¦ce + neutralne CRIT/DODGE) Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬
def _boss_stats(level: int, *, pwr_hint: int | None = None) -> dict:
    """
    Skalowanie bossa: wykÄąâ€šadniczo z miĂ„â„˘kkim gÄ‚Ĺ‚rnym/lower clampem; opcjonalnie
    dopala siĂ„â„˘ do ~80Ă˘â‚¬â€ś110% siÄąâ€šy gracza (pwr_hint) aby walki byÄąâ€šy relewantne.
    """
    # baza Ă˘â‚¬ĹľmapowaĂ˘â‚¬ĹĄ Ă˘â‚¬â€ś przy l10 Ă˘â€°Â 425, l20 Ă˘â€°Â 885, l30 Ă˘â€°Â 1650 (luÄąĹźne dopasowanie)
    base_hp  = int(180 * (1.20 ** (level-1)))
    base_atk = int(22  * (1.11 ** (level-1)))
    base_def = int(7   * (1.09 ** (level-1)))

    # miĂ„â„˘kka korekta wzglĂ„â„˘dem gracza (pwr_hint to _player_power)
    if pwr_hint:
        target = max(120, pwr_hint)                   # nigdy poniÄąÄ˝ej niskiego progu
        # rozkÄąâ€šadamy target power na hp/atk/def Ă˘â‚¬â€ś stabilny feeling walki
        hp_boost  = int(max(0, target*7  - base_hp//10))
        atk_boost = int(max(0, target//20 - base_atk//10))
        def_boost = int(max(0, target//30 - base_def//10))
        base_hp  = max(base_hp,  base_hp  + hp_boost)
        base_atk = max(base_atk, base_atk + atk_boost)
        base_def = max(base_def, base_def + def_boost)

    return {"hp": base_hp, "atk": base_atk, "def": base_def, "crit": 0.12, "dodge": 0.07}

def _boss_stats_rich(level: int, *, pwr_hint: int | None = None) -> dict:
    b = _boss_stats(level, pwr_hint=pwr_hint)
    b["name"]  = _boss_display_name(level)
    b["maxhp"] = b["hp"]
    return b

def _rare_drop_chance(level: int) -> float:
    return min(0.60, 0.20 + 0.02*(level-1))


FRAGMENT_KEY = "map_key_fragment"

BUILDING_CFG = {
    "abandoned_wallets_vault": {
        "name": "Abandoned Wallets",
        "region": "chain",
        "avg_minutes": 5,                  # map.json: averageRunMinutes
        "rewards": {                       # map.json: rewards ranges
            "scrap": (2, 6),
            "bones": (1, 3),
            "rune_dust": (0, 0),
        },
        "frag_chance": 0.08,               # map.json: fragmentDrops.map_key_fragment
        "desc": "Ghost towns of lost keys and forgotten treasures.",
        # === NEW ===
        "routes": {
            "scout":  { "label":"Ä‘Ĺşâ€”ĹźÄŹÂ¸Ĺą Scout (fast)",   "dur_mult":0.80, "frag_bonus":0.00, "mult":{"scrap":1.00,"bones":1.00,"rune_dust":0.80} },
            "salvage":{"label":"Ä‘ĹşÂ§Â° Salvage",         "dur_mult":1.00, "frag_bonus":0.00, "mult":{"scrap":1.20,"bones":1.00,"rune_dust":1.00} },
            "shadow": { "label":"Ä‘ĹşĹšâ€ Shadow Track",   "dur_mult":1.25, "frag_bonus":0.04, "mult":{"scrap":0.80,"bones":1.20,"rune_dust":1.20} },
        },
        "lore_notes": [
            "A broken drone whispers coordinates, then dies.",
            "Old posters flutter; someone circled a wolf sigil in red.",
            "Scratched into steel: Ă˘â‚¬Ĺ›Pack before pride.Ă˘â‚¬ĹĄ",
        ],    
    },
    "chain_gate": {
        "name": "The Chain Gate",
        "region": "chain",
        # Baza czasu (potem mnoÄąÄ˝ona przez dur_mult route'u)
        "avg_minutes": 20,
        # Baza rewardÄ‚Ĺ‚w Ă˘â‚¬â€ś route'y mnoÄąÄ˝Ă„â€¦ to w gÄ‚Ĺ‚rĂ„â„˘
        "rewards": {
            "scrap": (2, 4),
            "bones": (0, 0),
            "rune_dust": (0, 1),
        },
        # Nie uÄąÄ˝ywamy fragmentÄ‚Ĺ‚w kluczy Ă˘â‚¬â€ś key shards sĂ„â€¦ OFF
        "frag_chance": 0.0,
        "desc": "Long AFK expeditions through dead chain fragments. Small but steady scrap and rune dust.",
        "routes": {
            # ~2h: 20min * 6 Ă˘â€°Â 120min
            "exp_2h": {
                "label": "Ă˘ĹąÂ± Shard Drift (2h)",
                "dur_mult": 6.0,
                "frag_bonus": 0.0,
                "mult": {
                    "scrap": 2.5,    # ~6Ă˘â‚¬â€ś10 scrap
                    "bones": 0.0,
                    "rune_dust": 1.0 # ~0Ă˘â‚¬â€ś1 rune_dust
                },
            },
            # ~4h: 20min * 12 Ă˘â€°Â 240min
            "exp_4h": {
                "label": "Ä‘Ĺşâ€˘â€™ Dead Chain Dive (4h)",
                "dur_mult": 12.0,
                "frag_bonus": 0.0,
                "mult": {
                    "scrap": 5.0,    # ~12Ă˘â‚¬â€ś20 scrap
                    "bones": 0.0,
                    "rune_dust": 2.0 # ~1Ă˘â‚¬â€ś2 rune_dust
                },
            },
            # ~8h: 20min * 24 Ă˘â€°Â 480min
            "exp_8h": {
                "label": "Ä‘ĹşĹšÂ Moonfall Passage (8h)",
                "dur_mult": 24.0,
                "frag_bonus": 0.0,
                "mult": {
                    "scrap": 8.0,    # ~20Ă˘â‚¬â€ś30 scrap
                    "bones": 0.0,
                    "rune_dust": 3.0 # ~2Ă˘â‚¬â€ś3 rune_dust
                },
            },
            # ~10h: 20min * 30 Ă˘â€°Â 600min
            "exp_10h": {
                "label": "Ä‘ĹşĹšâ€ Eclipse Crossing (10h)",
                "dur_mult": 30.0,
                "frag_bonus": 0.0,
                "mult": {
                    "scrap": 9.5,    # ~24Ă˘â‚¬â€ś32 scrap
                    "bones": 0.0,
                    "rune_dust": 3.5 # ~2Ă˘â‚¬â€ś3 rune_dust
                },
            },
        },
        "lore_notes": [
            "Broken sidechains hum like distant thunder under your paws.",
            "Old validators flicker in the dark, still guarding nothing.",
            "You step through a dead block and come back carrying someone elseĂ˘â‚¬â„˘s ghost fees."
        ],
    },
    "broken_contracts_hub": {
        "name": "Broken Contracts",
        "region": "chain",
        "avg_minutes": 6,
        "rewards": {
            "scrap": (3, 7),
            "bones": (0, 0),
            "rune_dust": (1, 2),
        },
        "frag_chance": 0.10,
        "desc": "Shattered contracts spilling glitches and danger.",
    },
    "moonlab_fortress": {
        "name": "Moon Lab Ă˘â‚¬â€ť Fortress",
        "region": "moon_lab",
        "desc": "Three-floor fortress: sequential single-fights. Win Ă˘â€ â€™ next; lose Ă˘â€ â€™ retry after cooldown.",
        "type": "fortress",
        "cooldown_sec": 3600,   # raz na godzinĂ„â„˘
    },
    "testnet_wastes_dojo": {
        "name": "Testnet Wastes Ă˘â‚¬â€ť Dojo",
        "region": "testnet_wastes",
        "desc": "Training Dojo Ă˘â‚¬â€ť practice on a high-HP dummy and measure your DPS/crit. No costs or rewards.",
        "type": "dojo",
        "timer_sec": 60
    },
}

def _fmt_left(secs: int) -> str:
    m, s = divmod(max(0, int(secs)), 60)
    h, m = divmod(m, 60)
    if h: return f"{h}h {m}m"
    if m: return f"{m}m {s}s"
    return f"{s}s"

def _bstate(user: dict, bid: str) -> dict:
    return user.setdefault("buildings", {}).setdefault(bid, {})

async def show_building_menu(update: Update, context: ContextTypes.DEFAULT_TYPE, building_id: str):
    uid = str(update.effective_user.id)

    def mut(u: dict):
        # ensure/migracje TYLKO pod lockiem
        ensure_regions_keys(u)

        cfg = BUILDING_CFG.get(building_id)
        if not cfg:
            return {"status": "wip"}

        # gate: sprawdÄąĹź, czy region budynku jest odblokowany
        reg = cfg["region"]
        if reg != "chain" and not is_region_unlocked(u, reg):
            return {"status": "locked", "name": cfg.get("name") or building_id}

        st = _bstate(u, building_id)
        now = int(time.time())
        ends_at = int(st.get("ends_at", 0))
        active = ends_at > now

        # przygotuj dane do UI
        if active:
            left = _fmt_left(ends_at - now)
            return {
                "status": "active",
                "name": cfg["name"],
                "desc": cfg.get("desc", ""),
                "left": left,
                "building_id": building_id,
            }
        else:
            routes = (cfg.get("routes") or {})
            routes_out = []
            for rid, rc in routes.items():
                routes_out.append({
                    "rid": rid,
                    "label": rc.get("label") or rid.title()
                })

            return {
                "status": "idle",
                "name": cfg["name"],
                "desc": cfg.get("desc", ""),
                "avg_minutes": int(cfg.get("avg_minutes", 0) or 0),
                "building_id": building_id,
                "routes": routes_out,
                "has_routes": bool(routes_out),
            }

    res = await with_user(uid, mut, reason=f"building_menu:{building_id}")

    # --- odpowiedÄąĹź UI (bez dotykania danych) ---
    if res.get("status") == "wip":
        if update.message:
            return await update.message.reply_text(f"Ä‘ĹşĹąâ€”ÄŹÂ¸Ĺą Building: {building_id} (WIP)")
        return await context.bot.send_message(chat_id=update.effective_chat.id, text=f"Ä‘ĹşĹąâ€”ÄŹÂ¸Ĺą Building: {building_id} (WIP)")

    if res.get("status") == "locked":
        txt = f"Ä‘Ĺşâ€ťâ€™ {res.get('name','This building')} is locked Ă˘â‚¬â€ť unlock region in /keys."
        if update.message:
            return await update.message.reply_text(txt)
        return await context.bot.send_message(chat_id=update.effective_chat.id, text=txt)

    title = f"Ä‘ĹşĹąĹˇÄŹÂ¸Ĺą <b>{res['name']}</b>\n<i>{res.get('desc','')}</i>\n"

    if res.get("status") == "active":
        body = f"Ă˘ĹąĹ‚ Run in progress. Time left: <b>{res['left']}</b>"
        kb = InlineKeyboardMarkup([[InlineKeyboardButton("Ă˘Ĺ›â€¦ Resolve", callback_data=f"building_resolve:{building_id}")]])
    else:
        body = f"Ă˘ĹąÂ± Average run: <b>{res.get('avg_minutes', 0)} min</b>\nÄ‘ĹşĹ˝Â Rewards: materials + chance for key fragment"

        kb_rows = []
        if res.get("has_routes"):
            for r in res.get("routes", []):
                kb_rows.append([InlineKeyboardButton(r["label"], callback_data=f"building_start:{building_id}:{r['rid']}")])
        else:
            kb_rows.append([InlineKeyboardButton("Ă˘â€“Â¶ÄŹÂ¸Ĺą Start Run", callback_data=f"building_start:{building_id}")])

        kb = InlineKeyboardMarkup(kb_rows)

    if update.message:
        return await update.message.reply_text(title + "\n" + body, parse_mode="HTML", reply_markup=kb)
    return await context.bot.send_message(chat_id=update.effective_chat.id, text=title + "\n" + body, parse_mode="HTML", reply_markup=kb)


async def handle_building_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    parts = q.data.split(":")
    bid = parts[1]
    route = parts[2] if len(parts) >= 3 else None

    uid = str(q.from_user.id)

    def mut(u: dict):
        from tutorial_state import TUTORIAL_CHAIN_BUILDINGS, complete_tutorial_step

        ensure_regions_keys(u)

        cfg = BUILDING_CFG.get(bid)
        if not cfg:
            return {"status": "wip"}

        # gate regionu
        reg = cfg["region"]
        if reg != "chain" and not is_region_unlocked(u, reg):
            return {"status": "locked"}

        st = _bstate(u, bid)
        now = int(time.time())
        if int(st.get("ends_at", 0)) > now:
            left = _fmt_left(int(st["ends_at"]) - now)
            return {"status": "already_active", "left": left}

        # start sesji (czas: avg Ă‚Â± 1 min)
        minutes = max(3, int(cfg["avg_minutes"] + random.choice([-1, 0, +1])))

        # NEW: modyfikator trasy
        if route and "routes" in cfg and route in cfg["routes"]:
            minutes = max(3, int(minutes * float(cfg["routes"][route].get("dur_mult", 1.0))))

        st["started"] = now
        st["ends_at"] = now + minutes * 60
        if route:
            st["route"] = route
        else:
            st.pop("route", None)

        if bid in TUTORIAL_CHAIN_BUILDINGS:
            complete_tutorial_step(u, "chain_building_started", now=now)

        return {"status": "started", "minutes": minutes, "name": cfg.get("name") or bid}

    res = await with_user(uid, mut, reason=f"building_start:{bid}")

    if res.get("status") == "wip":
        return await q.edit_message_text(f"Ä‘ĹşĹąâ€”ÄŹÂ¸Ĺą Building: {bid} (WIP)")

    if res.get("status") == "locked":
        return await q.edit_message_text("Ä‘Ĺşâ€ťâ€™ Region locked Ă˘â‚¬â€ť use /keys to unlock.")

    if res.get("status") == "already_active":
        return await q.edit_message_text(f"Ă˘ĹąĹ‚ Run already active. Time left: {res['left']}")

    # started
    kb = InlineKeyboardMarkup([[InlineKeyboardButton("Ă˘Ĺ›â€¦ Resolve", callback_data=f"building_resolve:{bid}")]])
    return await q.edit_message_text(
        f"Ä‘Ĺşâ€ťĹ˝ {res.get('name','Run')} run started. Come back in <b>{res['minutes']} min</b>.",
        parse_mode="HTML",
        reply_markup=kb,
    )


async def handle_building_resolve(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    bid = q.data.split(":", 1)[1]
    uid = str(q.from_user.id)

    def mut(u: dict):
        ensure_regions_keys(u)

        # --- AFK: odÄąâ€şwieÄąÄ˝ stan przed resolve (running -> ready, jeÄąâ€şli czas minĂ„â€¦Äąâ€š) ---
        ensure_afk_fields(u)
        afk_update_state(u)

        cfg = BUILDING_CFG.get(bid)
        if not cfg:
            return {"status": "wip"}

        st = _bstate(u, bid)
        now = int(time.time())
        if int(st.get("ends_at", 0)) > now:
            left = _fmt_left(int(st["ends_at"]) - now)
            return {"status": "not_ready", "left": left}

        # policz nagrody z zakresÄ‚Ĺ‚w
        rw = cfg["rewards"]
        scrap_lo = rw.get("scrap", (0, 0)); scrap = random.randint(*scrap_lo)
        bones_lo = rw.get("bones", (0, 0)); bones = random.randint(*bones_lo)
        dust_lo  = rw.get("rune_dust", (0, 0)); rune_dust = random.randint(*dust_lo)

        # === NEW: trasa i mnoÄąÄ˝niki ===
        route = (st.get("route") or "").lower()
        rc = (cfg.get("routes") or {}).get(route, {})
        mult = rc.get("mult", {})

        def _m(v, k):
            return int(round(v * float(mult.get(k, 1.0))))

        scrap     = _m(scrap, "scrap")
        bones     = _m(bones, "bones")
        rune_dust = _m(rune_dust, "rune_dust")

        # --- przyznaj (bez save_data) ---
        # Prefer: lokalna modyfikacja usera (zero I/O)
        mats = u.setdefault("materials", {})
        if scrap:
            mats["scrap"] = int(mats.get("scrap", 0)) + int(scrap)
        if rune_dust:
            mats["rune_dust"] = int(mats.get("rune_dust", 0)) + int(rune_dust)
        if bones:
            # jeÄąâ€şli masz ledger-bones, pÄ‚Ĺ‚ÄąĹźniej przerobimy to na ledger_append;
            # na P0 dziaÄąâ€ša stabilnie jako materials mirror
            mats["bones"] = int(mats.get("bones", 0)) + int(bones)

        # szansa na fragment klucza
        got_frag = False
        frag_ch = float(cfg.get("frag_chance", 0.0)) + float(rc.get("frag_bonus", 0.0))
        if random.random() < max(0.0, min(0.95, frag_ch)):
            mats[FRAGMENT_KEY] = int(mats.get(FRAGMENT_KEY, 0)) + 1
            got_frag = True

        # --- JeÄąâ€şli to Chain Gate Ă˘â€ â€™ traktujemy to jako rĂ„â„˘czny claim AFK duty ---
        if bid == "chain_gate":
            afk_clear(u)  # avatar wraca z warty, stan AFK reset na idle

        # oczyÄąâ€şĂ„â€ˇ sesjĂ„â„˘ budynku
        st.clear()

        # === NEW: lore note + etykieta trasy ===
        route_label = (rc.get("label") or route.title()) if route else "Standard"
        lore_pool = (cfg.get("lore_notes") or [])
        lore = random.choice(lore_pool) if lore_pool else "The wind carries a faint howl from the north."

        return {
            "status": "done",
            "name": cfg.get("name") or bid,
            "bones": bones,
            "scrap": scrap,
            "rune_dust": rune_dust,
            "got_frag": got_frag,
            "route_label": route_label,
            "lore": lore,
        }

    res = await with_user(uid, mut, reason=f"building_resolve:{bid}")

    if res.get("status") == "wip":
        return await q.edit_message_text(f"Ä‘ĹşĹąâ€”ÄŹÂ¸Ĺą Building: {bid} (WIP)")

    if res.get("status") == "not_ready":
        return await q.edit_message_text(f"Ă˘ĹąĹ‚ Not ready yet. Time left: {res['left']}")

    # done
    parts = []
    if res.get("bones"): parts.append(f"+{res['bones']} Bones")
    if res.get("scrap"): parts.append(f"+{res['scrap']} Scrap")
    if res.get("rune_dust"): parts.append(f"+{res['rune_dust']} Rune Dust")
    if res.get("got_frag"): parts.append("Ä‘Ĺşâ€ťâ€ +1 Map Key Fragment")

    msg = (
        f"Ă˘Ĺ›â€¦ {res.get('name','Run')} Ă˘â‚¬â€ť run complete ({res.get('route_label','Standard')}).\n"
        + ("Rewards: " + ", ".join(parts) if parts else "No rewards.")
        + f"\nÄ‘Ĺşâ€śĹĄ <i>{res.get('lore','')}</i>"
    )
    return await q.edit_message_text(msg, parse_mode="HTML")

# ======= STATE ENDPOINT: /webapp/state  =======
# UÄąÄ˝yj w main.py prostego AppRunner/TCPSite, aby go podnieÄąâ€şĂ„â€ˇ rÄ‚Ĺ‚wnolegle z botem.

import os, hmac, hashlib, urllib.parse
from aiohttp import web

def _verify_init_data_new(init_data_raw: str, *, max_age_sec: int = 86400) -> tuple[bool, str, dict]:
    if not init_data_raw:
        return (False, "MISSING", {})
    qs = dict(urllib.parse.parse_qsl(init_data_raw, keep_blank_values=True))
    given_hash = qs.pop("hash", None)
    dcs = "\n".join(f"{k}={qs[k]}" for k in sorted(qs.keys()))

    bot_token = _get_bot_token()
    # POPRAWKA: Dla Mini Apps Ă˘â‚¬â€ś HMAC z "WebAppData"
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calc = hmac.new(secret_key, dcs.encode("utf-8"), hashlib.sha256).hexdigest()

    if not given_hash or not hmac.compare_digest(calc, given_hash):
        _LOG.warning("[AUTH] BAD_HASH (tail=%s)", bot_token[-6:])
        _LOG.debug("[AUTH] dcs=%r", dcs)
        _LOG.debug("[AUTH] calc=%s given=%s", calc, given_hash)
        return (False, "BAD_HASH", {})

    auth_date = qs.get("auth_date")
    if not auth_date or not str(auth_date).isdigit():
        return (False, "NO_AUTH_DATE", {})
    age = int(time.time()) - int(auth_date)
    if max_age_sec and age > max_age_sec:
        _LOG.warning("[AUTH] EXPIRED: age=%s > %s", age, max_age_sec)
        return (False, "EXPIRED", {})

    try:
        user = json.loads(qs.get("user", "{}"))
    except Exception:
        user = {}

    return (True, "OK", user)

def _verify_init_data_legacy(init_data: str, bot_token: str) -> dict | None:
    # Stara zgodnoÄąâ€şĂ„â€ˇ: zwraca dict|None (z "user_obj") Ă˘â‚¬â€ś dla miejsc, ktÄ‚Ĺ‚re jeszcze nie przerobione
    qs = dict(urllib.parse.parse_qsl(init_data, keep_blank_values=True))
    tg_hash = qs.pop("hash", None)
    dcs = "\n".join(f"{k}={qs[k]}" for k in sorted(qs.keys()))
    secret = hashlib.sha256(bot_token.encode("utf-8")).digest()
    calc = hmac.new(secret, dcs.encode("utf-8"), hashlib.sha256).hexdigest()
    if not tg_hash or not hmac.compare_digest(calc, tg_hash):
        return None
    try:
        qs["user_obj"] = json.loads(qs.get("user", "{}"))
    except Exception:
        qs["user_obj"] = {}
    return qs

def _verify_init_data(*args, **kwargs):
    """
    Kompatybilny dispatcher:
      - NEW:  ok, reason, user = _verify_init_data(init_data)
      - OLD:  qs = _verify_init_data(init_data, bot_token)
    """
    if len(args) >= 2 and isinstance(args[1], str):
        # stary styl wywoÄąâ€šania
        return _verify_init_data_legacy(args[0], args[1])
    # nowy styl
    return _verify_init_data_new(*args, **kwargs)
# --- END: verify shim ---

def _extract_init_data(request: web.Request, body: dict | None = None) -> str:
    body = body or {}
    # 1) JSON (Open Dashboard)
    val = (body.get("init_data") or body.get("initData") or "").strip()
    if val:
        return val
    # 2) Authorization: Bearer <init_data> (Mini App + nasze CORS)
    auth = (request.headers.get("Authorization") or "").strip()
    if auth:
        parts = auth.split(" ", 1)
        return (parts[1] if len(parts) == 2 else parts[0]).strip()
    # 3) X-Telegram-Init-Data (niektÄ‚Ĺ‚re klienci Mini App)
    hdr = (request.headers.get("X-Telegram-Init-Data") or "").strip()
    if hdr:
        return hdr
    # 4) zapasowo z query (dev / testy)
    return (request.query.get("init_data") or "").strip()

def _collect_unlocked(u: dict) -> list[str]:
    # JeÄąâ€şli globalny switch jest ON Ă˘â€ â€™ zwrÄ‚Ĺ‚Ă„â€ˇ WSZYSTKIE znane regiony
    if os.getenv("UNLOCK_ALL", "1") == "1":
        return sorted(set(REGION_IDS))
    # Inaczej: klasycznie na podstawie flag w profilu
    base = {"chain"}
    for k, v in (u.get("regions_unlocked") or {}).items():
        if v: 
            base.add(k)
    return sorted(base)

async def _maybe_mark_tutorial_step(uid: str, user_snapshot: dict, step_id: str, reason: str | None = None) -> bool:
    from tutorial_progress import maybe_mark_tutorial_step

    return await maybe_mark_tutorial_step(uid, user_snapshot, step_id, reason=reason)


async def webapp_tutorial_state(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)

    from tutorial_state import build_tutorial_payload

    u = await read_user(uid)
    if not isinstance(u, dict) or not u:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    return web.json_response({"ok": True, "data": build_tutorial_payload(u)})


async def webapp_tutorial_action(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)

    action = str(body.get("action") or "").strip().lower()
    step_id = str(body.get("step_id") or body.get("stepId") or "").strip()
    if action != "skip":
        return web.json_response({"ok": False, "reason": "BAD_ACTION"}, status=400)
    if not step_id:
        return web.json_response({"ok": False, "reason": "NO_STEP"}, status=400)

    from tutorial_progress import maybe_skip_tutorial_step
    from tutorial_state import (
        build_tutorial_payload,
        get_tutorial_step,
        tutorial_should_skip_step,
        tutorial_step_done,
        tutorial_step_skipped,
    )

    u_before = await read_user(uid)
    if not isinstance(u_before, dict) or not u_before:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    payload_before = build_tutorial_payload(u_before)
    step = get_tutorial_step(step_id)
    if step is None:
        return web.json_response({
            "ok": False,
            "changed": False,
            "reason": "UNKNOWN_STEP",
            "data": payload_before,
        })

    if tutorial_step_done(u_before, step_id) or tutorial_step_skipped(u_before, step_id):
        return web.json_response({
            "ok": True,
            "changed": False,
            "reason": "ALREADY_RESOLVED",
            "data": payload_before,
        })

    if not tutorial_should_skip_step(u_before, step_id):
        return web.json_response({
            "ok": False,
            "changed": False,
            "reason": "SKIP_NOT_ALLOWED",
            "data": payload_before,
        })

    changed = await maybe_skip_tutorial_step(
        uid,
        u_before,
        step_id,
        reason=f"tutorial:skip:{step_id}",
    )

    u_after = await read_user(uid)
    if not isinstance(u_after, dict) or not u_after:
        u_after = u_before

    resolved = tutorial_step_done(u_after, step_id) or tutorial_step_skipped(u_after, step_id)
    return web.json_response({
        "ok": bool(resolved),
        "changed": bool(changed),
        "reason": "SKIPPED" if resolved else "NO_CHANGE",
        "data": build_tutorial_payload(u_after),
    })


async def _legacy_webapp_profile_get(request: web.Request):
    req_t0 = time.perf_counter()
    # ten dashboard uÄąÄ˝ywa POST z init_data w body Ă˘â‚¬â€ś trzymajmy konwencjĂ„â„˘
    try:
        body = await request.json()
    except Exception:
        body = {}

    step_t0 = time.perf_counter()
    init = _extract_init_data(request, body)
    _profile_perf("-", "extract_init_data", step_t0)
    step_t0 = time.perf_counter()
    ok, reason, tg_user = _verify_init_data(init)
    uid = str(tg_user.get("id") or "") if isinstance(tg_user, dict) else ""
    _profile_perf(uid or "-", "verify_init_data", step_t0)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    username = tg_user.get("username") or ""
    now = int(time.time())
    step_t0 = time.perf_counter()
    await finalize_pending_influence_weekly_rewards(now=now)
    _profile_perf(uid, "finalize_influence_rewards", step_t0)

    # --- staÄąâ€ša lista avatarÄ‚Ĺ‚w (bez dotykania danych gracza) ---
    avatars_list = [
        {"key": av["key"], "name": av.get("name", ""), "emoji": av.get("emoji", "Ä‘ĹşÂĹź"), "img": av.get("img", "")}
        for av in AVATAR_LIST if av.get("key")
    ]

    # --- READ FIRST (bez zapisu) ---
    step_t0 = time.perf_counter()
    u = await read_user(uid)
    _profile_perf(uid, "read_user", step_t0)
    try:
        effs = (u or {}).get("active_effects") or {}
        _LOG.info("[WEBAPP_PROFILE_GET_DBG] active_effects_keys=%s",
                  list(effs.keys()) if isinstance(effs, dict) else str(type(effs)))
    except Exception:
        pass

    # Czy musimy zrobiĂ„â€ˇ "cichĂ„â€¦ naprawĂ„â„˘/migracjĂ„â„˘"?
    need_fix = not isinstance(u, dict)
    if isinstance(u, dict):
        k = _avatar_key_normalized(u)
        if u.get("avatar") != k:
            need_fix = True
        # brak podstawowych pÄ‚Ĺ‚l / Äąâ€şwieÄąÄ˝y user po raz pierwszy
        if (u.get("id") != uid) or ("username" not in u and username):
            need_fix = True

    if need_fix:
        # Mutacja WYÄąÂĂ„â€žCZNIE pod lockiem + atomic save
        def mut(user: dict):
            user.setdefault("id", uid)
            if username and not user.get("username"):
                user["username"] = username

            k2 = _avatar_key_normalized(user)
            if user.get("avatar") != k2:
                user["avatar"] = k2

            return _make_profile_payload(user, now=now)

        step_t0 = time.perf_counter()
        profile_payload = await with_user(uid, mut, reason="webapp_profile_get")
        _profile_perf(uid, "with_user_profile_fix", step_t0)
    else:
        step_t0 = time.perf_counter()
        profile_payload = _make_profile_payload(u, now=now)
        _profile_perf(uid, "profile_payload_direct", step_t0)
        try:
            _LOG.info("[WEBAPP_PROFILE_GET] uid=%s buffsLine=%r buffsCount=%s",
                      uid,
                      profile_payload.get("buffsLine"),
                      profile_payload.get("buffsCount"))
        except Exception:
            pass

    _profile_perf(uid, "profile_request_total", req_t0)
    return web.json_response({"ok": True, "profile": profile_payload, "avatars": avatars_list})

async def webapp_profile_get(request: web.Request):
    return await _legacy_webapp_profile_get(request)


# ======= WALLET ENDPOINTS: /webapp/wallet/link + /webapp/wallet/unlink =======
async def webapp_wallet_link(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    address = (body.get("address") or body.get("addr") or "").strip()
    if not address:
        return web.json_response({"ok": False, "reason": "MISSING_ADDRESS"}, status=400)

    chain = (body.get("chain") or "").strip()
    wallet_app = (body.get("walletApp") or body.get("wallet_app") or "").strip()
    wallet_platform = (body.get("walletPlatform") or body.get("wallet_platform") or "").strip()
    now_ts = int(time.time())

    def mut(u: dict):
        u.setdefault("id", uid)
        u.setdefault("uid", uid)
        u.setdefault("user_id", uid)

        wallets = u.get("wallets")
        if not isinstance(wallets, dict):
            wallets = {}
            u["wallets"] = wallets

        prev = wallets.get("ton")
        prev_addr = ""
        if isinstance(prev, dict):
            prev_addr = str(prev.get("address") or "")
        elif isinstance(prev, str):
            prev_addr = prev

        already = (prev_addr == address)

        wallets["ton"] = {
            "address": address,
            "chain": chain,
            "walletApp": wallet_app,
            "walletPlatform": wallet_platform,
            "linked_ts": now_ts,
        }
        u["wallets"] = wallets
        return {"ok": True, "address": address, "already": already}

    r = await with_user(uid, mut, reason="webapp_wallet_link")
    return web.json_response(r)


async def webapp_wallet_unlink(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    def mut(u: dict):
        u.setdefault("id", uid)
        u.setdefault("uid", uid)
        u.setdefault("user_id", uid)

        wallets = u.get("wallets")
        if not isinstance(wallets, dict):
            return {"ok": True, "removed": False, "already": True}

        had = bool(wallets.get("ton"))
        wallets.pop("ton", None)

        if not wallets:
            u.pop("wallets", None)
        else:
            u["wallets"] = wallets

        return {"ok": True, "removed": had, "already": (not had)}

    r = await with_user(uid, mut, reason="webapp_wallet_unlink")
    return web.json_response(r)

def _pick_user_and_merge_pets(data: dict, uid: str, username: str = ""):
    """
    Szuka usera w:
      - root data[uid]
      - kaÄąÄ˝dym top-level dict, ktÄ‚Ĺ‚ry ma [uid]
      - 2 poziomy w gÄąâ€šĂ„â€¦b (np. data["state"]["users"][uid])
    Wybiera najlepszy rekord, MERGUJE pety ze wszystkich kandydatÄ‚Ĺ‚w,
    i zszywa docelowo do data["users"][uid] (jeÄąâ€şli data["users"] istnieje).
    Zwraca (u, dirty, dbg)
    """
    if not isinstance(data, dict):
        return None, False, {}

    # zbieraj kandydatÄ‚Ĺ‚w: (path, container_dict, user_dict)
    cands = []

    def _add(path, container, u):
        if isinstance(container, dict) and isinstance(u, dict):
            cands.append((path, container, u))

    # root
    if isinstance(data.get(uid), dict):
        _add("root", data, data[uid])

    # top-level + depth=2
    for k, v in data.items():
        if not isinstance(v, dict):
            continue

        # level 1: data[k][uid]
        if isinstance(v.get(uid), dict):
            _add(str(k), v, v[uid])

        # level 2: data[k][kk][uid]
        for kk, vv in v.items():
            if isinstance(vv, dict) and isinstance(vv.get(uid), dict):
                _add(f"{k}.{kk}", vv, vv[uid])

    # jeÄąâ€şli nic nie znaleziono Ă˘â‚¬â€ť utwÄ‚Ĺ‚rz
    users_map = data.get("users") if isinstance(data.get("users"), dict) else None
    if not cands:
        u = {"id": uid, "username": username or ""}
        if isinstance(users_map, dict):
            users_map[uid] = u
            return u, True, {"picked": "created.users", "found": {}}
        data[uid] = u
        return u, True, {"picked": "created.root", "found": {}}

    def _score(u: dict) -> int:
        pets = u.get("pets")
        inv  = u.get("inventory")
        eq   = u.get("equipment")
        s = 0
        s += 100 * (len(pets) if isinstance(pets, dict) else 0)
        s += 10  * (len(inv)  if isinstance(inv, dict)  else 0)
        s += 3   * (1 if isinstance(eq, dict) else 0)
        s += min(len(u.keys()), 30)
        return s

    # wybierz najlepszy
    best_path, best_container, best_u = max(cands, key=lambda t: _score(t[2]))

    # MERGE pets ze wszystkich rekordÄ‚Ĺ‚w (bez utraty)
    merged_pets = {}
    found_counts = {}
    for path, _container, u in cands:
        pets = u.get("pets") if isinstance(u, dict) else None
        cnt = len(pets) if isinstance(pets, dict) else 0
        found_counts[path] = cnt
        if isinstance(pets, dict):
            for pid, pet in pets.items():
                if pid not in merged_pets:
                    merged_pets[pid] = pet
                else:
                    # jeÄąâ€şli dubel, preferuj wyÄąÄ˝szy lvl/xp
                    a = merged_pets[pid] or {}
                    b = pet or {}
                    a_lv = int(a.get("level") or 1)
                    b_lv = int(b.get("level") or 1)
                    a_xp = int(a.get("xp") or 0)
                    b_xp = int(b.get("xp") or 0)
                    if (b_lv, b_xp) > (a_lv, a_xp):
                        merged_pets[pid] = pet

    dirty = False

    # wstrzyknij merged pets do best_u
    if merged_pets and (best_u.get("pets") is None or not isinstance(best_u.get("pets"), dict) or len(best_u.get("pets")) != len(merged_pets)):
        best_u["pets"] = merged_pets
        dirty = True

    # spÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ id
    best_u.setdefault("uid", uid)
    best_u.setdefault("id", uid)
    best_u.setdefault("user_id", uid)
    if username and not best_u.get("username"):
        best_u["username"] = username

    # aktywny pet ma wskazywaĂ„â€ˇ istniejĂ„â€¦cego
    eq = best_u.setdefault("equipment", {})
    active = eq.get("pet")
    if not active or active not in (best_u.get("pets") or {}):
        fallback = next(iter((best_u.get("pets") or {}).keys()), None)
        if fallback:
            eq["pet"] = fallback
            dirty = True

    # Zszyj: jeÄąâ€şli data["users"] istnieje, przypnij tam best_u
    if isinstance(users_map, dict):
        if users_map.get(uid) is not best_u:
            users_map[uid] = best_u
            dirty = True

    # opcjonalnie: zszyj teÄąÄ˝ root[uid], ÄąÄ˝eby legacy Äąâ€şcieÄąÄ˝ki nie robiÄąâ€šy stubÄ‚Ĺ‚w
    if data.get(uid) is not best_u:
        data[uid] = best_u
        dirty = True

    dbg = {"picked": best_path, "found": found_counts}
    return best_u, dirty, dbg

async def webapp_pets_state(request: web.Request):
    # 1) body
    try:
        body = await request.json()
    except Exception:
        body = {}

    # 2) auth
    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    # 3) read-only user
    u = await read_user(uid)
    if not isinstance(u, dict) or not u:
        return web.json_response({"ok": False, "reason": "no_user"}, status=404)

    from pets import ensure_pets, build_pets_payload_for_webapp

    # 4) jeÄąâ€şli brakuje struktur albo mamy lazy pet stat-point backfill â†’ zapisz pod lockiem
    pets_dict = u.get("pets")
    eq = u.get("equipment") or {}
    active = eq.get("pet")

    needs_heal = (
        not isinstance(pets_dict, dict)
        or (isinstance(pets_dict, dict) and pets_dict and active and active not in pets_dict)
        or (not isinstance(eq, dict))
    )

    dbg_flag = bool(body.get("dbg") or body.get("debug"))
    normalized_changed = bool(ensure_pets(u))

    if needs_heal or normalized_changed:
        out = {}

        def mut(u2: dict):
            # ensure pets + slot
            ensure_pets(u2)

            payload = build_pets_payload_for_webapp(u2)
            out["payload"] = payload

            if dbg_flag:
                pets_map = payload.get("pets") if isinstance(payload, dict) else {}
                out["dbg"] = {
                    "strategy": "with_user_heal" if needs_heal else "with_user_backfill",
                    "activePetId": payload.get("activePetId") if isinstance(payload, dict) else None,
                    "petCount": len(pets_map) if isinstance(pets_map, dict) else 0,
                }

            return {"ok": True}

        await with_user(uid, mut, reason="webapp:pets_state:heal" if needs_heal else "webapp:pets_state:backfill")

        resp = {"ok": True, "pets": out.get("payload") or {}}
        if dbg_flag and isinstance(out.get("dbg"), dict):
            resp.update(out["dbg"])
        return web.json_response(resp)

    # 5) normal read-only payload (bez zapisu)
    pets_payload = build_pets_payload_for_webapp(u)

    resp = {"ok": True, "pets": pets_payload}
    if dbg_flag:
        pets_map = pets_payload.get("pets") if isinstance(pets_payload, dict) else {}
        resp.update({
            "strategy": "read_user",
            "activePetId": pets_payload.get("activePetId") if isinstance(pets_payload, dict) else None,
            "petCount": len(pets_map) if isinstance(pets_map, dict) else 0,
        })

    return web.json_response(resp)


async def webapp_pets_set_active(request: web.Request):
    # 1) body
    try:
        body = await request.json()
    except Exception:
        body = {}

    # 2) auth
    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    pet_id = str(body.get("petId") or body.get("pet_id") or "").strip()
    if not pet_id:
        return web.json_response({"ok": False, "reason": "no_pet_id"}, status=400)

    from pets import ensure_pets, build_pets_payload_for_webapp

    out = {}

    def mut(u: dict):
        ensure_pets(u)

        pets_dict = u.get("pets") or {}
        if not isinstance(pets_dict, dict) or pet_id not in pets_dict:
            out["status"] = 404
            out["resp"] = {"ok": False, "reason": "no_pet"}
            return u

        u.setdefault("equipment", {})["pet"] = pet_id

        out["status"] = 200
        out["resp"] = {
            "ok": True,
            "pets": build_pets_payload_for_webapp(u),
            **({"dbg": {"strategy": "with_user"}} if (body.get("dbg") or body.get("debug")) else {})
        }
        return u

    await with_user(uid, mut, reason="webapp:pets_set_active")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))


async def webapp_pets_feed_action(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    from pet_actions import apply_feed_action
    from pets import build_pets_payload_for_webapp, ensure_pets

    out = {}

    def mut(u: dict):
        ensure_pets(u)
        result = apply_feed_action(uid, u)
        out["status"] = 200 if result.get("ok") else (429 if result.get("reason") == "COOLDOWN" else 400)
        out["resp"] = {
            "ok": bool(result.get("ok")),
            "reason": result.get("reason"),
            "message": result.get("message"),
            "cooldownSec": int(result.get("cooldownSec", 30) or 30),
            "cooldownRemainingSec": int(result.get("cooldownRemainingSec", 0) or 0),
            "nextAvailableAt": result.get("nextAvailableAt"),
            "pet": result.get("pet"),
            "pets": build_pets_payload_for_webapp(u),
        }
        return u

    await with_user(uid, mut, reason="webapp:pet_feed")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))


async def webapp_pets_pet_action(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    from pet_actions import apply_pet_action
    from pets import build_pets_payload_for_webapp, ensure_pets

    out = {}

    def mut(u: dict):
        ensure_pets(u)
        result = apply_pet_action(uid, u)
        out["status"] = 200 if result.get("ok") else (429 if result.get("reason") == "COOLDOWN" else 400)
        out["resp"] = {
            "ok": bool(result.get("ok")),
            "reason": result.get("reason"),
            "message": result.get("message"),
            "cooldownSec": int(result.get("cooldownSec", 30) or 30),
            "cooldownRemainingSec": int(result.get("cooldownRemainingSec", 0) or 0),
            "nextAvailableAt": result.get("nextAvailableAt"),
            "pet": result.get("pet"),
            "pets": build_pets_payload_for_webapp(u),
        }
        return u

    await with_user(uid, mut, reason="webapp:pet_pet")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))


async def webapp_pets_stat_action(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    pet_id = str(body.get("petId") or body.get("pet_id") or "").strip()
    stat_key = str(body.get("statKey") or body.get("stat_key") or "").strip().lower()
    if not pet_id:
        return web.json_response({"ok": False, "reason": "no_pet_id"}, status=400)
    if not stat_key:
        return web.json_response({"ok": False, "reason": "no_stat_key"}, status=400)

    from pets import build_pets_payload_for_webapp, ensure_pets, spend_pet_stat_point

    out = {}

    def mut(u: dict):
        ensure_pets(u)
        result = spend_pet_stat_point(u, pet_id, stat_key)
        reason = str(result.get("reason") or "").upper()
        status = 200
        if not result.get("ok"):
            status = 404 if reason == "NO_PET" else 400

        pets_payload = build_pets_payload_for_webapp(u)
        pet_payload = None
        if isinstance(pets_payload, dict):
            pet_payload = (pets_payload.get("pets") or {}).get(pet_id)

        out["status"] = status
        out["resp"] = {
            "ok": bool(result.get("ok")),
            "reason": result.get("reason"),
            "pet": pet_payload,
            "pets": pets_payload,
        }
        return u

    await with_user(uid, mut, reason="webapp:pet_stat")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))


async def webapp_profile_set_avatar(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "no_uid"}, status=400)

    key = str(body.get("avatar") or "").strip().lower()
    if key not in ALLOWED_AVATAR_KEYS:
        return web.json_response({"ok": False, "reason": "INVALID_AVATAR"}, status=400)

    username = tg_user.get("username") or ""

    out = {}

    def mut(u: dict):
        # spÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ usera
        u.setdefault("id", uid)
        u.setdefault("uid", uid)
        u.setdefault("user_id", uid)
        if username and not u.get("username"):
            u["username"] = username

        u["avatar"] = key

        out["status"] = 200
        out["resp"] = {"ok": True, "profile": _make_profile_payload(u)}
        return u

    await with_user(uid, mut, reason="webapp:profile_set_avatar")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))

async def _legacy_state_handler(request: web.Request):
    req_t0 = time.perf_counter()
    try:
        body = await request.json()
    except Exception:
        body = {}

    step_t0 = time.perf_counter()
    init_data = _extract_init_data(request, body)
    _profile_perf("-", "state_extract_init_data", step_t0)
    step_t0 = time.perf_counter()
    ok, reason, tg_user = _verify_init_data(init_data)
    uid = str(tg_user.get("id") or "") if isinstance(tg_user, dict) else ""
    _profile_perf(uid or "-", "state_verify_init_data", step_t0)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)

    # Ă˘Ĺ›â€¦ READ-ONLY (zero ensure/save)
    step_t0 = time.perf_counter()
    u = (await read_user(uid)) or {}
    _profile_perf(uid, "state_read_user", step_t0)

    mats = (u.get("materials") or {}) if isinstance(u.get("materials"), dict) else {}
    key_frag = int(mats.get("map_key_fragments", 0) or 0)
    sigils   = u.get("sigils") or {}

    _profile_perf(uid, "state_total", req_t0)
    return web.json_response({
        "ok": True,
        "regionsUnlocked": _collect_unlocked(u),
        "keyFragments": key_frag,
        "sigils": sigils
    })

async def state_handler(request: web.Request):
    return await _legacy_state_handler(request)


def _today_str():
    return date.today().isoformat()

def _get_or_create_daily(user: dict):
    """Upewnia, ÄąÄ˝e na dziÄąâ€ş istniejĂ„â€¦ oba questy (normal + raid) i je zwraca."""
    assign_daily_quests(user)  # uÄąÄ˝ywasz swojej istniejĂ„â€¦cej funkcji
    today = _today_str()
    normal = user.setdefault("quests", {}).get(today) or {}
    raid   = user["quests"].get(today + "_raid") or {}
    return today, normal, raid

# mapowanie ident->akcja tak samo jak w daily_callback
_DAILY_ACTION_FOR_ID = {
    "feed":        "daily_feed",
    "explore":     "daily_explore",
    "lucky_roll":  "daily_lucky",
    "pet_gallery": "daily_gallery",
    "level_up_pet":"daily_levelup",
    "pet_mood":    "daily_mood",
    "raid":        "daily_raid",
}

def _format_reward_text(reward):
    if isinstance(reward, dict):
        parts = []
        if reward.get("points"): parts.append(f"{reward['points']} Ä‘ĹşÂ¦Â´")
        if reward.get("xp"):     parts.append(f"{reward['xp']} XP")
        if reward.get("item"):   parts.append(f"Ä‘ĹşĹ˝Â {reward['item']}")
        if reward.get("token"):  parts.append(f"{reward['token']} $ALPHA")
        return ", ".join(parts) if parts else "reward"
    return str(reward or "reward")



async def daily_state_handler(request: web.Request):
    """
    Legacy endpoint uÄąÄ˝ywany przez stare wersje WebAppa.
    Teraz zwraca dokÄąâ€šadnie to samo co /webapp/quests/state Ă˘â€ â€™ z desc, hint, unit, percent itd.
    DziĂ„â„˘ki temu wszyscy gracze (nawet z cache) natychmiast widzĂ„â€¦ opisy daily questÄ‚Ĺ‚w.
    """
    # Po prostu uÄąÄ˝ywamy nowej, bogatej logiki z quests_state_handler
    # (nie duplikujemy kodu Ă˘â‚¬â€ś tylko delegujemy)
    return await quests_state_handler(request)

async def daily_action_handler(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init_data = _extract_init_data(request, body)
    action    = (body.get("action") or "").strip()
    is_raid   = bool(body.get("raid", False))

    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)

    today = _today_str()
    quest_key = (today + "_raid") if (is_raid or action.startswith("daily_raid")) else today

    # --- MUTACJA tylko pod lockiem ---
    def mut(u: dict):
        u.setdefault("quests", {})

        # Ä‘Ĺşâ€â€ˇ NIE NADPISUJEMY, jeÄąâ€şli dzisiejszy quest juÄąÄ˝ jest
        if quest_key not in u["quests"]:
            if "assign_daily_quests" in globals():
                assign_daily_quests(u)
            else:
                _get_or_create_daily(u)

        q = u["quests"].get(quest_key)
        if not q:
            return {"ok": False, "reason": "NO_QUEST"}

        msg = ""
        send_raid_dm = False

        # Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ AKCJE PROGRESU Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬
        if action in {"daily_feed", "daily_explore", "daily_lucky", "daily_gallery", "daily_levelup", "daily_mood"}:
            if q.get("claimed"):
                return {"ok": False, "reason": "ALREADY_CLAIMED"}
            q["done"] = True
            msg = "Ă˘Ĺ›â€¦ Quest completed! Now claim your reward."

        # Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ RAID MARK Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬
        elif action == "daily_raid":
            # nie polegamy na globalnym data["raid_pending"] (bo nie ma load/save)
            # trzymamy flagĂ„â„˘ w user doc
            q["raid_pending"] = True
            u["raid_pending"] = True
            send_raid_dm = True
            msg = "Ä‘Ĺşâ€˘ÂµÄŹÂ¸Ĺą Check your DM/private chat for passcode entry!"

        # Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ CLAIM Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬
        elif action == "daily_claim":
            q.setdefault("done", False)
            q.setdefault("claimed", False)

            if q.get("claimed"):
                return {"ok": False, "reason": "ALREADY_CLAIMED"}

            if not q.get("done"):
                return {"ok": False, "reason": "NOT_DONE"}

            q["claimed"] = True

            reward = q.get("reward", 1)
            reward_text = _format_reward_text(reward)

            # Ledger rewards (safe sync calls)
            try:
                from ledger_lite import ledger_append
            except Exception:
                ledger_append = None

            def _ledger(asset: str, amount: int):
                if ledger_append and amount:
                    ledger_append(
                        uid, asset, int(amount),
                        ref={"type": "daily_claim", "quest": quest_key},
                        note=f"daily_claim_{asset}"
                    )

            if isinstance(reward, dict):
                # legacy: points Ă˘â€ â€™ bones
                if "points" in reward and "bones" not in reward:
                    reward["bones"] = reward.get("points")

                bones_val = int(reward.get("bones", 0) or 0)
                scrap_val = int(reward.get("scrap", 0) or 0)
                dust_val  = int(reward.get("rune_dust", 0) or 0)
                tok_val   = int(reward.get("tokens", 0) or 0)

                if bones_val: _ledger("bones", bones_val)
                if scrap_val: _ledger("scrap", scrap_val)
                if dust_val:  _ledger("rune_dust", dust_val)
                if tok_val:   _ledger("tokens", tok_val)

            else:
                # reward jako liczba Ă˘â€ â€™ traktujemy jak bones
                try:
                    bones_val = int(reward)
                except Exception:
                    bones_val = 0
                if bones_val:
                    _ledger("bones", bones_val)

            msg = f"Ä‘ĹşĹ˝Â Reward claimed! {reward_text}"

        else:
            return {"ok": False, "reason": "BAD_ACTION"}

        return {
            "ok": True,
            "msg": msg,
            "questKey": quest_key,
            "quest": q,
            "sendRaidDm": bool(send_raid_dm),
        }

    res = await with_user(uid, mut, reason=f"daily_action:{action}")

    if not isinstance(res, dict) or not res.get("ok"):
        reason = (res or {}).get("reason") if isinstance(res, dict) else "FAIL"
        return web.json_response({"ok": False, "reason": reason}, status=400)

    # DM do RAID po locku (ÄąÄ˝eby nie awaitowaĂ„â€ˇ w mutatorze)
    if res.get("sendRaidDm"):
        try:
            bot = Bot(token=_get_bot_token())
            await bot.send_message(
                chat_id=uid,
                text="Ä‘Ĺşâ€˘ÂµÄŹÂ¸Ĺą Enter the RAID passcode to confirm your participation!\nUse:\n`/raid <passcode>`",
                parse_mode="Markdown"
            )
        except Exception:
            pass

    return web.json_response(res)


# --- Alpha Den HTTP API -----------------------------------------------------

_ALPHA_DEN_ERROR_STATUS = {
    "BUILD_DISABLED": 409,
    "TRAINING_DISABLED": 409,
    "FEATURE_DISABLED": 409,
    "INVALID_BUILDING": 400,
    "ALREADY_BUILT": 409,
    "ALREADY_BUILDING": 409,
    "ALREADY_TRAINING": 409,
    "CLAIM_REQUIRED": 409,
    "INSUFFICIENT_RESOURCES": 409,
    "KENNEL_REQUIRED": 409,
    "SIGNAL_CORE_REQUIRED": 409,
    "LOCKED": 409,
    "MAX_LEVEL_REACHED": 409,
    "NO_ACTIVE_PET": 409,
    "NO_ACTIVE_TRAINING": 409,
    "NOT_BUILDING": 409,
    "NOT_READY": 409,
    "PET_NOT_FOUND": 409,
    "STATE_ERROR": 400,
}


def _alpha_den_error_response(code: str, details: dict | None = None):
    reason = str(code or "STATE_ERROR")
    payload = {
        "ok": False,
        "reason": reason,
        "error": reason,
        "safety": alpha_den_safety_payload(),
    }
    if isinstance(details, dict):
        for key, value in details.items():
            if value is not None:
                payload[key] = value
    return web.json_response(
        payload,
        status=int(_ALPHA_DEN_ERROR_STATUS.get(reason, 400)),
    )


async def alpha_den_state_handler(request: web.Request):
    try:
        uid, user, _, _body = await _get_user_from_request(request)
    except web.HTTPUnauthorized as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "UNAUTHORIZED"}, status=401)
    except web.HTTPNotFound as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "user_not_found"}, status=404)

    payload = build_alpha_den_payload(user, uid, now_ts=int(time.time()))
    return web.json_response({
        "ok": True,
        "alphaDen": payload,
        "safety": alpha_den_safety_payload(),
    })


async def alpha_den_build_start_handler(request: web.Request):
    try:
        uid, _user, _, body = await _get_user_from_request(request)
    except web.HTTPUnauthorized as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "UNAUTHORIZED"}, status=401)
    except web.HTTPNotFound as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "user_not_found"}, status=404)

    building_id = str((body or {}).get("buildingId") or (body or {}).get("building_id") or "").strip()
    run_id = str((body or {}).get("run_id") or (body or {}).get("runId") or "").strip()
    if not run_id:
        try:
            run_id = _get_run_id(body or {}, "alpha_den_start", uid, extra=building_id)
        except Exception:
            run_id = f"alpha_den_start:{uid}:{building_id}:{int(time.time())}"

    try:
        payload = await with_user(
            uid,
            lambda u: start_alpha_den_build(
                u,
                uid,
                building_id,
                now_ts=int(time.time()),
                run_id=run_id,
            ),
            reason="webapp:alpha_den:start",
        )
    except AlphaDenError as exc:
        return _alpha_den_error_response(exc.code, exc.payload)

    return web.json_response({
        "ok": True,
        "action": "den_build_started",
        "buildingId": building_id,
        "targetLevel": ((payload.get("buildings") or {}).get(building_id) or {}).get("targetLevel"),
        "alphaDen": payload,
        "safety": alpha_den_safety_payload(),
    })


async def alpha_den_build_claim_handler(request: web.Request):
    try:
        uid, _user, _, body = await _get_user_from_request(request)
    except web.HTTPUnauthorized as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "UNAUTHORIZED"}, status=401)
    except web.HTTPNotFound as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "user_not_found"}, status=404)

    building_id = str((body or {}).get("buildingId") or (body or {}).get("building_id") or "").strip()

    try:
        payload = await with_user(
            uid,
            lambda u: claim_alpha_den_build(
                u,
                uid,
                building_id,
                now_ts=int(time.time()),
            ),
            reason="webapp:alpha_den:claim",
        )
    except AlphaDenError as exc:
        return _alpha_den_error_response(exc.code, exc.payload)

    return web.json_response({
        "ok": True,
        "action": "den_build_claimed",
        "buildingId": building_id,
        "newLevel": ((payload.get("buildings") or {}).get(building_id) or {}).get("level"),
        "alphaDen": payload,
        "safety": alpha_den_safety_payload(),
    })


async def alpha_den_pet_training_start_handler(request: web.Request):
    try:
        uid, _user, _, _body = await _get_user_from_request(request)
    except web.HTTPUnauthorized as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "UNAUTHORIZED"}, status=401)
    except web.HTTPNotFound as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "user_not_found"}, status=404)

    try:
        result = await with_user(
            uid,
            lambda u: start_pet_kennel_training(
                u,
                uid,
                now_ts=int(time.time()),
            ),
            reason="webapp:alpha_den:pet_training:start",
        )
    except AlphaDenError as exc:
        return _alpha_den_error_response(exc.code, exc.payload)

    payload = (result or {}).get("alphaDen") if isinstance(result, dict) else None
    return web.json_response({
        "ok": True,
        "action": "pet_training_started",
        "trainingType": (result or {}).get("trainingType"),
        "durationSeconds": (result or {}).get("durationSeconds"),
        "rewardPetXp": (result or {}).get("rewardPetXp"),
        "activePetId": (result or {}).get("activePetId"),
        "activePetName": (result or {}).get("activePetName"),
        "targetKennelLevel": (result or {}).get("targetKennelLevel"),
        "alphaDen": payload,
        "safety": alpha_den_safety_payload(),
    })


async def alpha_den_pet_training_claim_handler(request: web.Request):
    try:
        uid, _user, _, _body = await _get_user_from_request(request)
    except web.HTTPUnauthorized as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "UNAUTHORIZED"}, status=401)
    except web.HTTPNotFound as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "user_not_found"}, status=404)

    try:
        result = await with_user(
            uid,
            lambda u: claim_pet_kennel_training(
                u,
                uid,
                now_ts=int(time.time()),
            ),
            reason="webapp:alpha_den:pet_training:claim",
        )
    except AlphaDenError as exc:
        return _alpha_den_error_response(exc.code, exc.payload)

    payload = (result or {}).get("alphaDen") if isinstance(result, dict) else None
    return web.json_response({
        "ok": True,
        "action": "pet_training_claimed",
        "trainingType": (result or {}).get("trainingType"),
        "rewardPetXp": (result or {}).get("rewardPetXp"),
        "claimedAt": (result or {}).get("claimedAt"),
        "petId": (result or {}).get("petId"),
        "petName": (result or {}).get("petName"),
        "petLevel": (result or {}).get("petLevel"),
        "petXp": (result or {}).get("petXp"),
        "petLeveledUp": (result or {}).get("petLeveledUp"),
        "alphaDen": payload,
        "safety": alpha_den_safety_payload(),
    })


async def alpha_den_signal_cache_claim_handler(request: web.Request):
    try:
        uid, _user, _, _body = await _get_user_from_request(request)
    except web.HTTPUnauthorized as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "UNAUTHORIZED"}, status=401)
    except web.HTTPNotFound as exc:
        return web.json_response({"ok": False, "reason": exc.reason or "user_not_found"}, status=404)

    try:
        result = await with_user(
            uid,
            lambda u: claim_signal_core_cache(
                u,
                uid,
                now_ts=int(time.time()),
            ),
            reason="webapp:alpha_den:signal_cache:claim",
        )
    except AlphaDenError as exc:
        return _alpha_den_error_response(exc.code, exc.payload)

    payload = (result or {}).get("alphaDen") if isinstance(result, dict) else None
    return web.json_response({
        "ok": True,
        "action": "signal_cache_claimed",
        "claimedAt": (result or {}).get("claimedAt"),
        "nextReadyAt": (result or {}).get("nextReadyAt"),
        "cooldownSeconds": (result or {}).get("cooldownSeconds"),
        "sourceLevel": (result or {}).get("sourceLevel"),
        "claimedCount": (result or {}).get("claimedCount"),
        "scrap": (result or {}).get("scrap"),
        "bones": (result or {}).get("bones"),
        "lastReward": (result or {}).get("lastReward"),
        "alphaDen": payload,
        "safety": alpha_den_safety_payload(),
    })


# --- Buildings HTTP API (fortress-aware) ------------------------------------

# --- buildings: STATE (WebApp) ---
async def building_state_handler(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init_data = _extract_init_data(request, body)
    bid = (body.get("buildingId") or body.get("building_id") or "").strip()

    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)
    if not bid:
        return web.json_response({"ok": False, "reason": "NO_BUILDING"}, status=400)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)

    # Ă˘Ĺ›â€¦ READ-ONLY snapshot usera
    u = await read_user(uid)
    if not isinstance(u, dict) or not u:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    cfg = BUILDING_CFG.get(bid)
    if not cfg:
        return web.json_response({"ok": False, "reason": "UNKNOWN_BUILDING"}, status=404)

    # gate regionu (read-only)
    reg = cfg.get("region") or "chain"
    if reg != "chain":
        try:
            if not is_region_unlocked(u, reg):
                return web.json_response({"ok": False, "reason": "LOCKED_REGION"}, status=403)
        except Exception:
            pass

    try:
        from tutorial_state import tutorial_step_for_building

        building_step_id = tutorial_step_for_building(bid)
    except Exception:
        building_step_id = None

    if building_step_id:
        await _maybe_mark_tutorial_step(uid, u, building_step_id, reason=f"tutorial:{building_step_id}")

    # --- Moon Lab Fortress: delegacja do fortress.py ---
    if cfg.get("type") == "fortress" and bid == "moonlab_fortress":
        try:
            data_out = fortress_state(u)     # fortress_state(user_dict)
        except TypeError:
            data_out = fortress_state(uid)   # fallback: fortress_state(uid)
        return web.json_response({"ok": True, "data": data_out})

    # --- TESTNET WASTES Ă˘â‚¬â€ť Dojo (training) ---
    if cfg.get("type") == "dojo" and bid == "testnet_wastes_dojo":
        st = ((u.get("buildings") or {}).get(bid) or {}) if isinstance(u.get("buildings"), dict) else {}
        last = st.get("last") or {}
        return web.json_response({
            "ok": True,
            "buildingId": bid,
            "name": cfg["name"],
            "desc": cfg["desc"],
            "type": "dojo",
            "timerSec": int((cfg.get("timer_sec") or cfg.get("timerSeconds") or 60)),
            "last": last
        })

    # --- standardowe Ă˘â‚¬ĹľrunĂ˘â‚¬ĹĄ buildings ---
    st = ((u.get("buildings") or {}).get(bid) or {}) if isinstance(u.get("buildings"), dict) else {}

    now = int(time.time())
    ends_at = int(st.get("ends_at", 0) or 0)
    active = ends_at > now
    left   = max(0, ends_at - now)

    routes = []
    for rid, rc in (cfg.get("routes") or {}).items():
        routes.append({
            "id": rid,
            "label": rc.get("label") or rid.title(),
            "durMult": float(rc.get("dur_mult", 1.0)),
            "fragBonus": float(rc.get("frag_bonus", 0.0)),
        })

    return web.json_response({
        "ok": True,
        "buildingId": bid,
        "name": cfg["name"],
        "desc": cfg["desc"],
        "avgMinutes": int(cfg.get("avg_minutes") or 0),
        "active": bool(active),
        "timeLeftSec": int(left),
        "routes": routes
    })


def _slots_prune_idempo(cache: dict) -> None:
    if not isinstance(cache, dict):
        return
    limit = int(SLOTS_MAX_IDEMPOTENCY_CACHE or 120)
    if limit < 20:
        limit = 20
    if len(cache) <= limit:
        return
    for key in list(cache.keys())[:-limit]:
        cache.pop(key, None)


def _store_webapp_idempo(u: dict, *, uid: str, bucket: str, run_id: str, status: int, resp: dict, now_ts: int | None = None) -> dict:
    if not run_id:
        return {}
    root = u.setdefault("_webapp_idempo", {})
    if not isinstance(root, dict):
        root = {}
        u["_webapp_idempo"] = root
    cache = root.get(bucket)
    if not isinstance(cache, dict):
        cache = {}
        root[bucket] = cache
    cache[str(run_id)] = {
        "ts": int(now_ts or time.time()),
        "status": int(status or 200),
        "resp": compact_cache_payload(resp),
    }
    prune_webapp_idem_caches(u, uid=uid)
    return cache


async def webapp_slots_state(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init_data = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)

    bid = str(body.get("buildingId") or body.get("building_id") or SLOTS_BUILDING_ID).strip() or SLOTS_BUILDING_ID
    if bid != SLOTS_BUILDING_ID:
        return web.json_response({"ok": False, "reason": "INVALID_BUILDING"}, status=400)

    u = await read_user(uid)
    if not isinstance(u, dict) or not u:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    cfg = BUILDING_CFG.get(SLOTS_BUILDING_ID) or {}
    region = str(cfg.get("region") or "chain").strip() or "chain"
    if region != "chain":
        try:
            if not is_region_unlocked(u, region):
                return web.json_response({"ok": False, "reason": "LOCKED_REGION"}, status=403)
        except Exception:
            return web.json_response({"ok": False, "reason": "LOCKED_REGION"}, status=403)

    bones_balance = int(user_balance_int(uid, "bones", 0))
    payload = build_slots_state_payload(u, bones_balance=bones_balance, now_ts=int(time.time()))

    return web.json_response({
        "ok": True,
        **payload,
        "buildingName": str(cfg.get("name") or "Abandoned Wallets"),
        "buildingDesc": str(cfg.get("desc") or ""),
    })


async def webapp_slots_spin(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init_data = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)

    bid = str(body.get("buildingId") or body.get("building_id") or SLOTS_BUILDING_ID).strip() or SLOTS_BUILDING_ID
    if bid != SLOTS_BUILDING_ID:
        return web.json_response({"ok": False, "reason": "INVALID_BUILDING"}, status=400)

    u0 = await read_user(uid)
    if not isinstance(u0, dict) or not u0:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    run_id = _get_run_id(body, "slots_spin", uid, extra=SLOTS_BUILDING_ID)

    def mut(u: dict):
        now = int(time.time())
        u.setdefault("id", uid)
        u.setdefault("uid", uid)
        u.setdefault("user_id", uid)

        cfg = BUILDING_CFG.get(SLOTS_BUILDING_ID) or {}
        region = str(cfg.get("region") or "chain").strip() or "chain"
        if region != "chain":
            try:
                if not is_region_unlocked(u, region):
                    resp = {"ok": False, "reason": "LOCKED_REGION", "run_id": run_id}
                    return {"ok": False, "status": 403, "resp": resp}
            except Exception:
                resp = {"ok": False, "reason": "LOCKED_REGION", "run_id": run_id}
                return {"ok": False, "status": 403, "resp": resp}

        term = ensure_slots_terminal_state(u, now_ts=now)
        idem = u.setdefault("_webapp_idempo", {}).setdefault("slots_spin", {})
        cached = idem.get(run_id)
        if isinstance(cached, dict) and isinstance(cached.get("resp"), dict):
            return {"ok": True, "status": int(cached.get("status", 200)), "resp": cached["resp"]}

        free_spins_before = int(term.get("free_spins") or 0)
        used_free_spin = free_spins_before > 0

        if used_free_spin:
            term["free_spins"] = max(0, free_spins_before - 1)
        else:
            try:
                debit(
                    uid,
                    "bones",
                    int(SLOTS_SPIN_COST_BONES),
                    reason="slots_spin_cost",
                    run_id=f"{run_id}:cost",
                    note="recovery_terminal_spin",
                    ref={
                        "type": "slots",
                        "buildingId": SLOTS_BUILDING_ID,
                        "run_id": run_id,
                    },
                    mirror_user=u,
                    mirror_assets=("bones",),
                    require_funds=True,
                )
            except ValueError:
                state_payload = build_slots_state_payload(
                    u,
                    bones_balance=int(user_balance_int(uid, "bones", 0)),
                    now_ts=now,
                )
                resp = {
                    "ok": False,
                    "reason": "NOT_ENOUGH_BONES",
                    "run_id": run_id,
                    "buildingId": SLOTS_BUILDING_ID,
                    "spinCostBones": int(SLOTS_SPIN_COST_BONES),
                    "state": state_payload,
                }
                _store_webapp_idempo(u, uid=uid, bucket="slots_spin", run_id=run_id, status=409, resp=resp, now_ts=now)
                return {"ok": False, "status": 409, "resp": resp}

        rng = random.Random(f"slots:{uid}:{run_id}:v1")
        spin_data = spin_slots_terminal(
            u,
            rng=rng,
            shard_slots=SELECTOR_SHARD_SLOTS,
            now_ts=now,
        )
        reward_assets = slots_rewards_to_assets(spin_data.get("rewards") or {})
        if reward_assets:
            credit_many(
                uid,
                reward_assets,
                reason="slots_spin_reward",
                run_id=f"{run_id}:reward",
                note="slots_spin_reward",
                mirror_user=u,
            )

        try:
            ledger_apply_to_user(u, assets=None)
        except Exception:
            pass

        state_payload = build_slots_state_payload(
            u,
            bones_balance=int(user_balance_int(uid, "bones", 0)),
            now_ts=now,
        )
        resp = {
            "ok": True,
            "run_id": run_id,
            "buildingId": SLOTS_BUILDING_ID,
            "consumedFreeSpin": bool(used_free_spin),
            "spinCostBones": 0 if used_free_spin else int(SLOTS_SPIN_COST_BONES),
            "board": spin_data.get("board") or {},
            "result": {
                "lineSymbol": str(spin_data.get("lineSymbol") or ""),
                "scatterCount": int(spin_data.get("scatterCount") or 0),
                "summary": summarize_slots_spin(spin_data),
            },
            "rewards": spin_data.get("rewards") or {},
            "fragment": spin_data.get("fragment") or {},
            "rewardAssets": reward_assets,
            "state": state_payload,
        }

        _store_webapp_idempo(u, uid=uid, bucket="slots_spin", run_id=run_id, status=200, resp=resp, now_ts=now)
        return {"ok": True, "status": 200, "resp": resp}

    res = await with_user(uid, mut, reason=f"webapp:slots_spin:{run_id}")
    if not isinstance(res, dict) or "resp" not in res:
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)
    return web.json_response(res["resp"], status=int(res.get("status", 200)))

def _get_init_data_from_request(req, body_json=None) -> str:
    auth = req.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    if body_json and isinstance(body_json, dict):
        v = (body_json.get("init_data") or "").strip()
        if v:
            return v
    return (req.rel_url.query.get("init_data") or "").strip()

async def action_handler(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init_data = _get_init_data_from_request(request, body)
    if not init_data:
        return web.json_response({"ok": False, "reason": "NO_INIT_DATA"}, status=401)

    # z init_data musimy mieĂ„â€ˇ query_id (tylko w trybie menu)
    parsed = dict(urllib.parse.parse_qsl(init_data, keep_blank_values=True))
    query_id = parsed.get("query_id")
    if not query_id:
        return web.json_response({"ok": False, "reason": "MENU_ONLY"}, status=400)

    action  = (body.get("action") or "").strip()
    payload = body.get("payload") or {}

    def map_action_to_text(a, p):
        if a == "cmd":
            name = (p.get("name") or "").lstrip("/")
            args = p.get("args") or []
            return "/" + name + ((" " + " ".join(map(str, args))) if args else "")
        return {
            "avatar_open":   "/choose_avatar",
            "mission_open":  "/mission",
            "inventory_open":"/inventory",
            "char_open":     "/mystats",
            "shop_open":     "/shop",
            "pets_open":     "/pets",
            "region_open":   f"/region {p.get('region','chain')}",
            "building_enter":f"/enter {p.get('buildingId','')}".strip(),
        }.get(a, f"Ă˘Ĺ›â€¦ Received '{a}'.")

    msg_text = map_action_to_text(action, payload)
    if not msg_text:
        return web.json_response({"ok": False, "reason": "UNKNOWN_ACTION"}, status=400)

    bot = Bot(token=_get_bot_token())
    await bot.answer_web_app_query(
        web_app_query_id=query_id,
        result=InlineQueryResultArticle(
            id=query_id,
            title="Alpha Husky",
            input_message_content=InputTextMessageContent(message_text=msg_text)
        )
    )
    return web.json_response({"ok": True})

# --- /webapp/building/start ---------------------------------------------------
async def building_start_handler(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init_data = _extract_init_data(request, body)
    bid = (body.get("buildingId") or body.get("building_id") or "").strip()
    route = (body.get("route") or "").strip() or None  # ignorowane dla fortecy

    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)
    if not bid:
        return web.json_response({"ok": False, "reason": "NO_BUILDING"}, status=400)

    # Ă˘Ĺ›â€¦ spÄ‚Ĺ‚jnie jak reszta webappa: nie twÄ‚Ĺ‚rz pustych userÄ‚Ĺ‚w
    u0 = await read_user(uid)
    if not isinstance(u0, dict) or not u0:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    cfg = BUILDING_CFG.get(bid)
    if not cfg:
        return web.json_response({"ok": False, "reason": "UNKNOWN_BUILDING"}, status=404)

    def mut(u: dict):
        from tutorial_state import TUTORIAL_CHAIN_BUILDINGS, complete_tutorial_step

        # uid consistency
        u.setdefault("id", uid)
        u.setdefault("uid", uid)
        u.setdefault("user_id", uid)

        # ensure regions/keys (mutacja -> lock OK)
        try:
            ensure_regions_keys(u)
        except Exception:
            pass

        # gate regionu
        reg = cfg.get("region") or "chain"
        if reg != "chain":
            try:
                if not is_region_unlocked(u, reg):
                    return {"ok": False, "reason": "LOCKED_REGION"}
            except Exception:
                return {"ok": False, "reason": "LOCKED_REGION"}

        now = int(time.time())

        # --- AFK LOCK ---
        try:
            ensure_afk_fields(u)
        except Exception:
            pass

        if u.get("afk_state") == AFK_STATE_RUNNING and bid != "chain_gate":
            time_left = max(0, int(u.get("afk_until", 0) or 0) - now)
            return {
                "ok": False,
                "reason": "AFK_LOCKED",
                "cooldownLeftSec": int(time_left),
                "message": "Your avatar is on AFK duty at the Chain Gate. Wait or claim it first.",
            }

        # --- DOJO ---
        if cfg.get("type") == "dojo" and bid == "testnet_wastes_dojo":
            secs = int((cfg.get("timer_sec") or cfg.get("timerSeconds") or 60))
            res = _simulate_dojo(u, seconds=secs, dummy_def=12)
            st = _bstate(u, bid)
            st["last"] = res
            return {"ok": True, "mode": "dojo", "buildingId": bid, **res}

        # --- FORTRESS (Moon Lab) ---
        if cfg.get("type") == "fortress" and bid == "moonlab_fortress":
            try:
                res = fortress_start(u)
            except ValueError as e:
                msg = str(e)
                if msg.startswith("COOLDOWN:") or msg.startswith("BUSY:"):
                    try:
                        left = int(msg.split(":", 1)[1])
                    except Exception:
                        left = 0
                    return {"ok": False, "reason": "COOLDOWN", "cooldownLeftSec": int(left)}
                return {"ok": False, "reason": msg or "START_FAILED"}

            # fortress_start zwykle: {ok:True,data:{...}}
            if isinstance(res, dict) and "ok" in res:
                return res
            return {"ok": True, "data": res}

        # --- STANDARDOWE budynki ---
        st = _bstate(u, bid)
        if int(st.get("ends_at", 0) or 0) > now:
            return {
                "ok": False,
                "reason": "ALREADY_ACTIVE",
                "timeLeftSec": int(st["ends_at"] - now)
            }

        minutes = max(3, int(cfg["avg_minutes"] + random.choice([-1, 0, +1])))
        if route and (cfg.get("routes") or {}).get(route):
            minutes = max(3, int(minutes * float(cfg["routes"][route].get("dur_mult", 1.0))))

        st["started"] = now
        st["ends_at"] = now + minutes * 60
        st["route"] = route or ""

        # Chain Gate -> AFK duty
        if bid == "chain_gate":
            try:
                ensure_afk_fields(u)
            except Exception:
                pass
            u["afk_state"] = AFK_STATE_RUNNING
            u["afk_started_at"] = now
            u["afk_until"] = st["ends_at"]

        if bid in TUTORIAL_CHAIN_BUILDINGS:
            complete_tutorial_step(u, "chain_building_started", now=now)

        return {"ok": True, "minutes": int(minutes), "endsAt": int(st["ends_at"])}

    res = await with_user(uid, mut, reason=f"webapp:building:start:{bid}")

    if not isinstance(res, dict) or not res.get("ok"):
        reason = (res or {}).get("reason") if isinstance(res, dict) else "FAIL"

        if reason == "LOCKED_REGION":
            status = 403
        elif reason in ("ALREADY_ACTIVE", "AFK_LOCKED", "COOLDOWN"):
            status = 409
        else:
            status = 400

        return web.json_response({"ok": False, **(res or {"reason": reason})}, status=status)

    return web.json_response(res, status=200)

# --- Quests: pretty reward text (shared, final) ---
def _format_reward_text(reward):
    if not isinstance(reward, dict):
        return str(reward or "reward")
    parts = []
    xp = int(reward.get("xp", 0) or 0)
    if xp:
        parts.append(f"{xp} XP")
    labels = {
        "bones": "Ä‘ĹşÂ¦Â´ Bones",
        "scrap": "Scrap",
        "rune_dust": "Rune Dust",
        "tokens": "$ALPHA",
        "universal_key_shards": "Key Shards",
        "moon_shard": "Moon Shard",
        "bug_token": "Bug Token",
    }
    for k, label in labels.items():
        val = int(reward.get(k, 0) or 0)
        if val:
            parts.append(f"{val} {label}")
    if reward.get("region_unlock"):
        parts.append(f"Unlock: {reward['region_unlock']}")
    if reward.get("item"):
        parts.append(f"Ä‘ĹşĹ˝Â {reward['item']}")
    return ", ".join(parts) if parts else "reward"


# --- Quests: STATE (final / locked) ---
async def quests_state_handler(request: web.Request):
    """Return active quests (daily + repeatable/chain/bounty).
    Daily rotation is done here via get_active_quests(user)."""
    try:
        body = await request.json()
    except Exception:
        body = {}

    init_data = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    # szybki check rejestracji (read-only)
    u0 = await read_user(uid)
    if not isinstance(u0, dict) or not u0:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    def _quest_state_snapshot(user: dict) -> dict:
        src = user if isinstance(user, dict) else {}
        return {
            "quest_board_v2": copy.deepcopy(src.get("quest_board_v2")),
            "tutorial": copy.deepcopy(src.get("tutorial")),
        }

    try:
        from tutorial_state import complete_tutorial_step
        fast_started = time.perf_counter()
        before = _quest_state_snapshot(u0)
        payload = build_quest_board_v2_payload(u0)
        complete_tutorial_step(u0, "quests_seen", now=int(time.time()))
        after = _quest_state_snapshot(u0)
        mutated = before != after
        _quests_perf("state_fast_build", fast_started, mutated=mutated)
    except Exception as e:
        try:
            logging.exception("quests_state_handler v2 failed: %r", e)
        except Exception:
            pass
        return web.json_response({"ok": False, "reason": "QUEST_BOARD_V2_FAILED"}, status=500)

    try:
        logging.info("quests_state_handler:v2 uid=%s quests=%d", uid, len(payload.get("quests") or []))
    except Exception:
        pass

    if not mutated:
        return web.json_response(payload, status=200)

    out = {}

    def mut(user: dict):
        started = time.perf_counter()
        try:
            payload2 = build_quest_board_v2_payload(user)
            complete_tutorial_step(user, "quests_seen", now=int(time.time()))
        except Exception as e:
            out["status"] = 500
            out["resp"] = {"ok": False, "reason": "QUEST_BOARD_V2_FAILED"}
            try:
                logging.exception("quests_state_handler persist failed: %r", e)
            except Exception:
                pass
            return user

        out["status"] = 200
        out["resp"] = payload2
        _quests_perf("state_persist_build", started, mutated=True)
        return user

    await with_user(uid, mut, reason="webapp:quests_state")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))


# --- Quests: ACCEPT (locked) ---
async def quests_accept_handler(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init_data = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    # read-only check
    u0 = await read_user(uid)
    if not isinstance(u0, dict) or not u0:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    quest_id = (body.get("id") or body.get("questId") or "").strip()
    if not quest_id:
        return web.json_response({"ok": False, "reason": "NO_ID"}, status=400)

    out = {}

    def mut(user: dict):
        try:
            from quests import accept_quest
            ok2, msg = accept_quest(user, quest_id)
        except Exception as e:
            try:
                logging.exception("accept_quest failed: %r", e)
            except Exception:
                pass
            out["status"] = 500
            out["resp"] = {"ok": False, "reason": "ACCEPT_EXCEPTION"}
            return user

        if ok2:
            out["status"] = 200
            out["resp"] = {"ok": True, "message": msg}
            return user

        status = 409 if isinstance(msg, str) and msg.lower().startswith("cooldown") else 400
        out["status"] = status
        out["resp"] = {"ok": False, "reason": msg or "ACCEPT_FAILED"}
        return user

    await with_user(uid, mut, reason="webapp:quests_accept")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))


# --- Quests: COMPLETE/CLAIM (locked) ---
async def quests_complete_handler(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init_data = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    # read-only check
    u0 = await read_user(uid)
    if not isinstance(u0, dict) or not u0:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    quest_id = (body.get("id") or body.get("questId") or "").strip()
    if not quest_id:
        return web.json_response({"ok": False, "reason": "NO_ID"}, status=400)

    # NEW: stepId for Legendary Path step-claim
    step_id = (body.get("stepId") or "").strip()

    out = {}

    def mut(user: dict):
        with suppress_save_data():
            # Quest Board v2 is the active WebApp board. Legacy claim logic remains
            # below only as a compatibility fallback for old clients/links.
            try:
                ok2, msg, payload = claim_quest_v2_reward(user, quest_id)
            except Exception as e:
                try:
                    logging.exception("claim_quest_v2_reward failed: %r", e)
                except Exception:
                    pass
                out["status"] = 500
                out["resp"] = {"ok": False, "reason": "QUEST_V2_CLAIM_EXCEPTION"}
                return user

            if msg != "QUEST_NOT_FOUND":
                if ok2:
                    out["status"] = 200
                    out["resp"] = {
                        "ok": True,
                        "message": f"CLAIMED: {quest_id}",
                        "rewardText": (payload or {}).get("rewardText") or "reward",
                        "data": payload or {},
                    }
                    return user

                if msg == "NOT_READY":
                    out["status"] = 409
                elif msg == "ALREADY_CLAIMED":
                    out["status"] = 409
                else:
                    out["status"] = 400
                out["resp"] = {"ok": False, "reason": msg or "CLAIM_FAILED"}
                return user

            # === NEW (C3): Legendary Path step claim via /quests/complete (stepId) ===
            if quest_id == "lp_ashclaw" and step_id:
                lp = user.setdefault("legendary_paths", {}).setdefault("lp_ashclaw", {})
                prog = lp.setdefault("progress", {"arena_wins": 0, "moonlab10_clears": 0, "long_runs": 0})
                claimed = lp.setdefault("claimed", {"bp": False, "core": False, "mats": False})

                cfg = {
                    "bp":   ("arena_wins", 10, "Blueprint"),
                    "core": ("moonlab10_clears", 20, "Core Part"),
                    "mats": ("long_runs", 5, "Stabilizer"),
                }

                if step_id not in cfg:
                    out["status"] = 400
                    out["resp"] = {"ok": False, "reason": "BAD_STEP"}
                    return user

                prog_key, need, reward_text = cfg[step_id]

                # idempotent: already claimed -> OK
                if bool(claimed.get(step_id)):
                    out["status"] = 200
                    out["resp"] = {"ok": True, "message": f"CLAIMED_STEP: {step_id}", "rewardText": reward_text}
                    return user

                cur = int(prog.get(prog_key, 0) or 0)
                if cur < int(need):
                    out["status"] = 409
                    out["resp"] = {"ok": False, "reason": "NOT_READY"}
                    return user

                claimed[step_id] = True
                lp["claimed"] = claimed

                try:
                    from world_feed import try_append_world_event, player_display_name, user_faction_key, faction_code_for

                    wf_faction = user_faction_key(user)
                    try_append_world_event(
                        "legendary_path_step_completed",
                        player_id=uid,
                        player_name=player_display_name(user, uid),
                        faction=wf_faction,
                        faction_code=faction_code_for(wf_faction),
                        dedupe_key=f"legendary_path_step_completed:{uid}:lp_ashclaw:{step_id}",
                        extra={
                            "quest_id": "lp_ashclaw",
                            "path": "Ashclaw Path",
                            "step_id": step_id,
                            "step_label": reward_text,
                            "reward_text": reward_text,
                        },
                    )
                except Exception:
                    pass

                out["status"] = 200
                out["resp"] = {"ok": True, "message": f"CLAIMED_STEP: {step_id}", "rewardText": reward_text}
                return user

            # --- normal quests flow ---
            # capture reward before claim (daily can disappear)
            reward_preview = None
            try:
                from quests import get_active_quests
                active = get_active_quests(user) or []
                q = next((qq for qq in active if qq.get("id") == quest_id), None)
                if q:
                    reward_preview = q.get("reward")
            except Exception:
                reward_preview = None

            try:
                from quests import complete_quest
                ok2, msg = complete_quest(user, quest_id)
            except Exception as e:
                try:
                    logging.exception("complete_quest failed: %r", e)
                except Exception:
                    pass
                out["status"] = 500
                out["resp"] = {"ok": False, "reason": "COMPLETE_EXCEPTION"}
                return user

            if not ok2:
                if msg == "QUEST_NOT_ACTIVE":
                    out["status"] = 404
                    out["resp"] = {"ok": False, "reason": msg}
                    return user
                if msg == "NOT_READY":
                    out["status"] = 409
                    out["resp"] = {"ok": False, "reason": msg}
                    return user
                out["status"] = 400
                out["resp"] = {"ok": False, "reason": msg or "COMPLETE_FAILED"}
                return user

            try:
                reward_text = _format_reward_text(reward_preview) if reward_preview is not None else "reward"
            except Exception:
                reward_text = "reward"

            out["status"] = 200
            out["resp"] = {"ok": True, "message": f"CLAIMED: {quest_id}", "rewardText": reward_text}
            return user

    await with_user(uid, mut, reason="webapp:quests_complete")

    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))

# === ADOPTION CENTER (WebApp) =============================================

# Token-only pet offers (pre-TGE). Adjust freely.
ADOPT_TOKEN_PET_COSTS = {
    "alphalord": 450,
    "howliday_gecko": 450,
    "nebulapup": 400,
    "arclynxkit": 400,
    "frostfawn": 400,
}

def _norm_asset_path(p: str) -> str:
    p = str(p or "").strip()
    if not p:
        return ""
    if p.startswith("http://") or p.startswith("https://"):
        return p
    if p.startswith("/"):
        return p
    if p.startswith("assets/"):
        return "/" + p
    return "/" + p

def _pet_img(pet_type: str, meta: dict) -> str:
    """
    Resolve pet image exactly like other assets (Cloudinary mapping),
    using the existing _resolve_item_icon() mapper.
    """
    pt = str(pet_type or "").strip().lower()
    icon = (meta or {}).get("image") or (meta or {}).get("icon") or ""
    # Force classification as "pet" so we can map to Cloudinary /pets folder
    try:
        return _resolve_item_icon(pt, {"icon": icon, "type": "pet", "slot": "pet"})
    except Exception:
        # fallback to raw path normalization
        return _norm_asset_path(icon)

def _owned_pet_types(u: dict) -> set:
    out = set()
    pets = u.get("pets")
    if isinstance(pets, dict):
        for _pid, pet in pets.items():
            if isinstance(pet, dict):
                t = str(pet.get("type") or "").strip().lower()
                if t:
                    out.add(t)
    return out

ANIMATED_PET_PREVIEW_TYPES = ("howlbyte", "darkhuskypup")

def _animated_pet_preview_enabled(uid: str) -> bool:
    flag = str(os.getenv("ANIMATED_PET_PREVIEW_ENABLED", "") or "").strip().lower()
    if flag in {"1", "true", "yes", "on"}:
        return True

    try:
        from config import ADMIN_IDS
        admin_ids = {str(x) for x in (ADMIN_IDS or [])}
        return str(uid or "") in admin_ids
    except Exception:
        return False

def _animated_pet_preview_meta(pt: str, available_pets: dict) -> dict:
    key = str(pt or "").strip().lower()
    fallback = {
        "howlbyte": {
            "name": "Howlbyte",
            "desc": "Animated staging preview.",
            "image": "assets/pets/howlbyte.png",
        },
        "darkhuskypup": {
            "name": "Dark Husky Pup",
            "desc": "Born in shadows, always on the trail.",
            "image": "assets/pets/darkhuskypup.png",
        },
    }
    return dict((available_pets or {}).get(key) or fallback.get(key) or {"name": key, "desc": "", "image": f"assets/pets/{key}.png"})

def _animated_pet_preview_offer(pt: str, available_pets: dict, owned_types: set, animated_pet_sprite_payload) -> dict | None:
    key = str(pt or "").strip().lower()
    if not key:
        return None

    meta = _animated_pet_preview_meta(key, available_pets)
    sprite_payload = animated_pet_sprite_payload(key)
    offer = {
        "petType": key,
        "petKey": key,
        "petName": meta.get("name") or key,
        "resolvedPetKey": key,
        "name": meta.get("name") or key,
        "desc": meta.get("desc") or "",
        "img": _pet_img(key, meta),
        "price": 0,
        "price_tokens": 0,
        "owned": (key in owned_types),
        "canBuy": False,
        "previewOnly": True,
        "disabledReason": "animated_pet_preview_only",
        "hasSpriteMeta": bool(sprite_payload),
        "spriteUrl": bool(sprite_payload.get("spriteSheetUrl")) if isinstance(sprite_payload, dict) else False,
    }
    offer.update(sprite_payload)
    return offer

async def webapp_adopt_state(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    # READ ONLY: ÄąÄ˝adnych zapisÄ‚Ĺ‚w, ÄąÄ˝adnego ensure_* na prawdziwym userze
    u = await read_user(uid)
    if not isinstance(u, dict):
        # user moÄąÄ˝e nie istnieĂ„â€ˇ jeszcze w data store Ă˘â€ â€™ traktujemy jako pusty profil
        u = {"id": uid, "username": tg_user.get("username") or ""}

    # Liczymy owned_types z prawdziwego u (bez mutacji)
    owned_types = _owned_pet_types(u)

    # Balans licz na kopii, ÄąÄ˝eby ledger_apply_to_user nic nie popsuÄąâ€š i nie wymusiÄąâ€š zapisu
    u_calc = copy.deepcopy(u)

    try:
        from ledger_lite import ledger_apply_to_user
        ledger_apply_to_user(u_calc, assets=("bones", "scrap", "rune_dust", "tokens"))
    except Exception:
        pass

    mats = u_calc.get("materials") if isinstance(u_calc.get("materials"), dict) else {}
    bones = int(mats.get("bones", u_calc.get("points", 0)) or 0)
    tokens = int(mats.get("tokens", u_calc.get("tokens", 0)) or 0)

    try:
        from pets import (
            AVAILABLE_PETS,
            ADOPTION_PRICES_BONES,
            animated_pet_sprite_payload,
            pet_adoption_center_block_reason,
        )
    except Exception:
        AVAILABLE_PETS = {}
        ADOPTION_PRICES_BONES = {}
        def pet_adoption_center_block_reason(_user_data, _pet_type, _meta=None):
            return None
        def animated_pet_sprite_payload(_pet_key):
            return {}

    # Bezpieczny fallback jeÄąâ€şli gdzieÄąâ€ş globalnie nie ma
    token_costs = globals().get("ADOPT_TOKEN_PET_COSTS", {}) or {}

    bones_offers = []
    for pet_type, price in (ADOPTION_PRICES_BONES or {}).items():
        pt = str(pet_type or "").strip().lower()
        if not pt:
            continue
        meta = (AVAILABLE_PETS or {}).get(pt) or {}
        if pet_adoption_center_block_reason(u, pt, meta):
            continue
        offer = {
            "petType": pt,
            "name": meta.get("name") or pt,
            "desc": meta.get("desc") or "",
            "img": _pet_img(pt, meta),
            "price": int(price or 0),
            "price_tokens": 0,
            "owned": (pt in owned_types),
            "canBuy": (pt not in owned_types),
        }
        offer.update(animated_pet_sprite_payload(pt))
        bones_offers.append(offer)

    token_offers = []
    for pt, price in (token_costs or {}).items():
        ptt = str(pt or "").strip().lower()
        if not ptt:
            continue
        meta = (AVAILABLE_PETS or {}).get(ptt) or {}
        offer = {
            "petType": ptt,
            "name": meta.get("name") or ptt,
            "desc": meta.get("desc") or "",
            "img": _pet_img(ptt, meta),
            "price": 0,
            "price_tokens": int(price or 0),
            "owned": (ptt in owned_types),
            "canBuy": (ptt not in owned_types),
            "exclusive": True,
        }
        offer.update(animated_pet_sprite_payload(ptt))
        token_offers.append(offer)

    preview_offers = []
    if _animated_pet_preview_enabled(uid):
        for pt in ANIMATED_PET_PREVIEW_TYPES:
            offer = _animated_pet_preview_offer(pt, AVAILABLE_PETS, owned_types, animated_pet_sprite_payload)
            if offer:
                preview_offers.append(offer)

    bones_offers.sort(key=lambda x: (x.get("price", 0), x.get("name") or x.get("petType") or ""))
    token_offers.sort(key=lambda x: (x.get("price_tokens", 0), x.get("name") or x.get("petType") or ""))

    return web.json_response({
        "ok": True,
        "data": {
            "resources": {
                "bones": bones,
                "token": tokens,
                "tokenSymbol": "$TOKEN",
            },
            "offers": {
                "preview": preview_offers,
                "bones": bones_offers,
                "token": token_offers,
            }
        }
    })

async def webapp_adopt_buy(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    pet_type = str(body.get("petType") or body.get("type") or "").strip().lower()
    if not pet_type:
        return web.json_response({"ok": False, "reason": "NO_PET_TYPE"}, status=400)

    run_id_base = _get_run_id(body, "adopt_buy", uid, pet_type)

    # Bezpieczny fallback
    token_costs = globals().get("ADOPT_TOKEN_PET_COSTS", {}) or {}

    def mut(u: dict):
        # Upewnij siĂ„â„˘, ÄąÄ˝e user ma podstawowe pola (w razie gdyby read_user jeszcze nie miaÄąâ€š rekordu)
        u.setdefault("id", uid)
        u.setdefault("username", tg_user.get("username") or "")

        from pets import (
            ensure_pets,
            new_pet,
            AVAILABLE_PETS,
            ADOPTION_PRICES_BONES,
            animated_pet_sprite_payload,
            pet_adoption_center_block_reason,
        )
        ensure_pets(u)

        owned_types = _owned_pet_types(u)
        if pet_type in owned_types:
            return {"ok": False, "reason": "ALREADY_OWNED", "_status": 409}

        bones_price = int((ADOPTION_PRICES_BONES or {}).get(pet_type, 0) or 0)
        token_price = int((token_costs or {}).get(pet_type, 0) or 0)
        if bones_price <= 0 and token_price <= 0:
            return {"ok": False, "reason": "NOT_FOR_SALE", "_status": 404}

        meta = (AVAILABLE_PETS or {}).get(pet_type) or {}
        if bones_price > 0:
            block_reason = pet_adoption_center_block_reason(u, pet_type, meta)
            if block_reason:
                status = 403 if block_reason == "SENTINEL_SET_REQUIRED" else 409
                return {"ok": False, "reason": block_reason, "_status": status}

        # === ledger debit (idempotent run_id) ===
        try:
            if bones_price > 0:
                rid = f"{run_id_base}:bones"
                debit(
                    uid, "bones", bones_price,
                    reason="adopt_buy",
                    run_id=rid,
                    note=f"adopt_pet:{pet_type}",
                    ref={"type": "adopt", "petType": pet_type, "price_bones": bones_price, "run_id": rid},
                    mirror_user=u,
                    mirror_assets=("bones",),
                    require_funds=True,
                )
            else:
                rid = f"{run_id_base}:tokens"
                debit(
                    uid, "tokens", token_price,
                    reason="adopt_buy",
                    run_id=rid,
                    note=f"adopt_pet:{pet_type}",
                    ref={"type": "adopt", "petType": pet_type, "price_tokens": token_price, "run_id": rid},
                    mirror_user=u,
                    mirror_assets=("tokens",),
                    require_funds=True,
                )
        except ValueError:
            return {"ok": False, "reason": "NOT_ENOUGH_FUNDS", "_status": 409}

        pet_name = str(meta.get("name") or pet_type).strip()[:24] or "Pet"
        pet = new_pet(pet_type, pet_name)

        pets_map = u.get("pets")
        if not isinstance(pets_map, dict):
            pets_map = {}
            u["pets"] = pets_map
        pets_map[pet["pet_id"]] = pet

        eq = u.setdefault("equipment", {})
        if not eq.get("pet"):
            eq["pet"] = pet["pet_id"]

        # Refresh materials mirror for response
        try:
            from ledger_lite import ledger_apply_to_user
            ledger_apply_to_user(u, assets=("bones", "tokens"))
        except Exception:
            pass

        mats = u.get("materials") if isinstance(u.get("materials"), dict) else {}
        bones = int(mats.get("bones", u.get("points", 0)) or 0)
        tokens = int(mats.get("tokens", u.get("tokens", 0)) or 0)
        u["tokens"] = tokens  # legacy mirror

        try:
            from world_feed import user_faction_key
            from broken_contracts_core import record_broken_contract_event

            if bones_price > 0:
                faction = user_faction_key(u)
                if faction:
                    record_broken_contract_event(
                        "bones_spent_real_sink",
                        uid=uid,
                        faction=faction,
                        amount=int(bones_price),
                        event_id=f"bc:economy:adopt:{uid}:{run_id_base}",
                        meta={
                            "source": "adopt",
                            "petType": pet_type,
                            "runId": run_id_base,
                        },
                    )
        except Exception:
            pass

        try:
            from world_feed import try_append_world_event, player_display_name, user_faction_key, faction_code_for

            wf_faction = user_faction_key(u)
            try_append_world_event(
                "pet_adopted",
                player_id=uid,
                player_name=player_display_name(u, uid),
                faction=wf_faction,
                faction_code=faction_code_for(wf_faction),
                dedupe_key=f"pet_adopted:{uid}:{run_id_base}",
                extra={
                    "pet_id": str(pet.get("pet_id") or ""),
                    "pet_type": str(pet.get("type") or pet_type or ""),
                    "pet_name": str(pet.get("name") or pet_name or ""),
                },
            )
        except Exception:
            pass

        adopted = {
            "petId": pet.get("pet_id"),
            "type": pet.get("type"),
            "name": pet.get("name"),
            "level": int(pet.get("level", 1) or 1),
            "base_stats": pet.get("base_stats") or {},
            "img": _pet_img(pet_type, meta),
        }
        adopted.update(animated_pet_sprite_payload(pet_type))

        return {
            "ok": True,
            "adopted": adopted,
            "spent": {"bones": bones_price, "token": token_price},
            "resources": {"bones": bones, "token": tokens, "tokenSymbol": "$TOKEN"},
        }

    out = await with_user(uid, mut, reason="adopt_buy")
    status = int(out.pop("_status", 200))
    return web.json_response(out, status=status)

def _get_token_balance(u: dict) -> int:
    """
    Token credits (pre-TGE) Ă˘â‚¬â€ť TRUTH = ledger asset 'tokens' (alias: 'token').
    JeÄąâ€şli user ma legacy tokens w u['tokens'] albo u['materials']['tokens'], a ledger ma mniej,
    to dopisujemy rÄ‚Ĺ‚ÄąÄ˝nicĂ„â„˘ JEDNORAZOWO do ledgeru (idempotentnie przez delta-check).
    """
    uid = _uid(u)
    led = 0
    try:
        from ledger_lite import user_balance_int, ledger_append, ledger_apply_to_user
        led = int(user_balance_int(uid, "tokens", 0)) if uid else 0
    except Exception:
        led = 0

    legacy = 0
    try:
        legacy = int(u.get("tokens", 0) or 0)
        mats = u.get("materials") or {}
        legacy = max(legacy, int(mats.get("tokens", 0) or 0))
    except Exception:
        pass

    # migrate legacy -> ledger (only the missing delta)
    if uid and legacy > led:
        try:
            delta = int(legacy - led)
            if delta > 0:
                ledger_append(
                    uid,
                    "tokens",
                    delta,
                    ref={"type": "migrate", "from": "legacy_tokens"},
                    note="migrate_legacy_tokens",
                )
                try:
                    ledger_apply_to_user(u, assets=("tokens",))
                except Exception:
                    pass
                led = legacy
        except Exception:
            led = max(led, legacy)

    return int(max(led, legacy))


# === /webapp/shop/state ===
async def webapp_shop_state(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user["id"])

    from shop import (
        rotate_shop_if_needed,
        ALL_ITEMS,
        _get_item_daily_limit,
        _get_item_purchases_today,
        _get_shop_cost,
        _format_shop_price,
    )
    from ledger_lite import user_balance_int
    import copy as _copy

    rotation = rotate_shop_if_needed()
    now_utc = int(datetime.now(timezone.utc).timestamp())
    refresh_at = int(rotation.get("refresh_at") or now_utc)
    refresh_in = max(0, refresh_at - now_utc)

    # Ă˘Ĺ›â€¦ READ ONLY: nie dotykamy data.json i nie mutujemy usera
    u_src = await read_user(uid)
    await _maybe_mark_tutorial_step(uid, u_src, "shop_preview_seen", reason="tutorial:shop_preview_seen")
    u = _copy.deepcopy(u_src) if isinstance(u_src, dict) else {}

    # --- resources (ledger-truth-first) ---
    mats = u.get("materials") or {}

    def _bal(asset: str, fallback: int = 0) -> int:
        try:
            return int(user_balance_int(uid, asset, fallback))
        except Exception:
            return int(fallback or 0)

    # bones/scrap/dust prefer ledger, fallback legacy
    bones = _bal("bones", int(mats.get("bones", u.get("points", 0)) or 0))
    scrap = _bal("scrap", int(mats.get("scrap", 0) or 0))
    dust  = _bal("rune_dust", int(mats.get("rune_dust", 0) or 0))

    # tokens prefer ledger, fallback legacy
    tokens = _bal("tokens", 0)
    if tokens <= 0:
        try:
            tokens = int(_get_token_balance(u) or 0)
        except Exception:
            tokens = int(u.get("tokens", 0) or 0)

    # --- items ---
    todays = list(dict.fromkeys((rotation.get("items") or []) + (rotation.get("consumables") or [])))

    items_out = []
    for key in todays:
        item = ALL_ITEMS.get(key)
        if not isinstance(item, dict):
            continue

        daily_limit = 0
        bought_today = 0
        try:
            daily_limit = int(_get_item_daily_limit(item) or 0)
        except Exception:
            daily_limit = 0

        try:
            bought_today = int(_get_item_purchases_today(u, key) or 0)
        except Exception:
            bought_today = 0

        item_cost = _get_shop_cost(item)

        items_out.append({
            "key": key,
            "name": item.get("name", key),
            "desc": item.get("desc") or item.get("description") or "",
            "type": item.get("type", "item"),
            "rarity": item.get("rarity", "common"),
            "price": int(item_cost.get("bones", 0)),
            "price_tokens": int(item_cost.get("tokens", 0)),
            "price_scrap": int(item_cost.get("scrap", 0)),
            "price_rune_dust": int(item_cost.get("rune_dust", 0)),
            "cost": {
                "bones": int(item_cost.get("bones", 0)),
                "tokens": int(item_cost.get("tokens", 0)),
                "scrap": int(item_cost.get("scrap", 0)),
                "rune_dust": int(item_cost.get("rune_dust", 0)),
            },
            "dailyLimit": int(daily_limit),
            "boughtToday": int(bought_today),
            "faction": item.get("faction"),
        })

    return web.json_response({
        "ok": True,
        "data": {
            "refreshAt": refresh_at,
            "refreshInSec": refresh_in,
            "resources": {
                "bones": int(bones),
                "scrap": int(scrap),
                "rune_dust": int(dust),
                "token": int(tokens),
            },
            "items": items_out,
        }
    })   

# === /webapp/shop/buy ===
async def webapp_shop_buy(request: web.Request):
    import time

    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user["id"])
    item_key = (body.get("itemKey") or body.get("key") or "").strip()
    if not item_key:
        return web.json_response({"ok": False, "reason": "NO_ITEM"}, status=400)

    from data_store import with_user  # Ă˘Ĺ›â€¦ ensure local import
    from shop import (
        rotate_shop_if_needed, ALL_ITEMS,
        check_and_buy_item, _get_item_daily_limit, _get_item_purchases_today, _inc_item_purchases_today,
        _format_shop_price,
    )
    from ledger_lite import ledger_apply_to_user, user_balance_int
    from pets import ensure_pets

    # rotation is global / non-user specific (OK outside lock)
    rotation = rotate_shop_if_needed()
    todays = set(rotation.get("items", []) or []) | set(rotation.get("consumables", []) or [])
    if item_key not in todays:
        return web.json_response({"ok": False, "reason": "NOT_IN_TODAY"}, status=409)

    item = ALL_ITEMS.get(item_key)
    if not isinstance(item, dict):
        return web.json_response({"ok": False, "reason": "UNKNOWN_ITEM"}, status=404)

    # Ă˘Ĺ›â€¦ retry-safe run_id (frontend powinien wysyÄąâ€šaĂ„â€ˇ UUID)
    run_id = _get_run_id(body, "shop_buy", uid, item_key)

    out = {"status": 200, "resp": None}

    def _mut(u2: dict):
        # --- basic identity / ensure ---
        u2.setdefault("id", uid)
        u2.setdefault("uid", uid)
        u2.setdefault("user_id", uid)
        if not u2.get("username"):
            u2["username"] = tg_user.get("username") or ""

        ensure_regions_keys(u2)
        ensure_pets(u2)

        # pre-TGE legacy pole (mirror; docelowo tokens z ledgeru)
        u2.setdefault("tokens", 0)

        # --- idempotency cache (inside lock!) ---
        tel = u2.get("telemetry")
        if not isinstance(tel, dict):
            tel = {}
            u2["telemetry"] = tel

        idem = tel.get("idemp")
        if not isinstance(idem, dict):
            idem = {}
            tel["idemp"] = idem

        shop_map = idem.get("shop_buy")
        if not isinstance(shop_map, dict):
            shop_map = {}
            idem["shop_buy"] = shop_map

        cached = shop_map.get(run_id)
        if isinstance(cached, dict) and "resp" in cached:
            out["status"] = int(cached.get("status", 200))
            out["resp"] = cached["resp"]
            return u2  # no-op

        # --- mirror balances BEFORE buy (legacy compat) ---
        try:
            ledger_apply_to_user(u2, assets=("bones", "scrap", "rune_dust", "tokens"))
            mats0 = u2.get("materials") or {}
            u2["points"] = int(mats0.get("bones", u2.get("points", 0)) or 0)
        except Exception:
            pass

        # Ă˘Ĺ›â€¦ balances BEFORE (ledger source of truth)
        bones_before = int(user_balance_int(uid, "bones", 0))
        scrap_before = int(user_balance_int(uid, "scrap", 0))
        dust_before  = int(user_balance_int(uid, "rune_dust", 0))
        try:
            tokens_before = int(user_balance_int(uid, "tokens", 0))
        except Exception:
            tokens_before = 0

        # daily limit
        daily_limit = int(_get_item_daily_limit(item))
        already = int(_get_item_purchases_today(u2, item_key))
        if daily_limit > 0 and already >= daily_limit:
            resp = {"ok": False, "reason": "DAILY_LIMIT"}
            shop_map[run_id] = build_telemetry_idemp_entry("shop_buy", resp, status=409)
            if len(shop_map) > 80:
                for k in list(shop_map.keys())[:-80]:
                    shop_map.pop(k, None)
            out["status"] = 409
            out["resp"] = resp
            return u2

        # check_and_buy_item sometimes uses uid/int id
        try:
            u2.setdefault("id", int(uid))
        except Exception:
            u2.setdefault("id", uid)

        # Ă˘Ĺ›â€¦ try pass run_id into shop.py (safe)
        try:
            success, message, _pet_image = check_and_buy_item(u2, item_key, run_id=run_id)
        except TypeError:
            success, message, _pet_image = check_and_buy_item(u2, item_key)

        if success:
            _inc_item_purchases_today(u2, item_key)

        # mirror balances AFTER buy
        try:
            ledger_apply_to_user(u2, assets=("bones", "scrap", "rune_dust", "tokens"))
        except Exception:
            pass

        # Ă˘Ĺ›â€¦ read balances from ledger (source of truth)
        bones = int(user_balance_int(uid, "bones", 0))
        scrap = int(user_balance_int(uid, "scrap", 0))
        dust  = int(user_balance_int(uid, "rune_dust", 0))

        try:
            tokens = int(user_balance_int(uid, "tokens", 0))
        except Exception:
            tokens = 0

        if not tokens:
            try:
                tokens = _get_token_balance(u2)
            except Exception:
                tokens = int(u2.get("tokens", 0) or 0)

        u2["tokens"] = int(tokens or 0)  # legacy mirror dla UI

        if not success:
            msg = str(message or "")
            status = 409 if (msg.startswith("NOT_ENOUGH_") or "not enough" in msg.lower()) else 400
            reason_code = msg if msg.startswith("NOT_ENOUGH_") else "BUY_FAILED"

            resp = {
                "ok": False,
                "reason": reason_code,
                "message": msg,
                "resources": {
                    "bones": bones,
                    "scrap": scrap,
                    "rune_dust": dust,
                    "token": int(tokens or 0),
                    "tokenSymbol": "$TOKEN",
                },
                "itemKey": item_key,
                "boughtToday": int(_get_item_purchases_today(u2, item_key)),
                "dailyLimit": int(_get_item_daily_limit(item)),
            }

            shop_map[run_id] = build_telemetry_idemp_entry("shop_buy", resp, status=int(status))
            if len(shop_map) > 80:
                for k in list(shop_map.keys())[:-80]:
                    shop_map.pop(k, None)

            out["status"] = int(status)
            out["resp"] = resp
            return u2

        # Ă˘Ĺ›â€¦ SUCCESS
        # compute TRUE spent via ledger delta
        spent_cost = {
            "bones": max(0, bones_before - bones),
            "scrap": max(0, scrap_before - scrap),
            "rune_dust": max(0, dust_before - dust),
            "tokens": max(0, int(tokens_before or 0) - int(tokens or 0)),
        }
        spent_text = _format_shop_price(spent_cost)
        primary_currency = next(
            (asset for asset in ("bones", "scrap", "rune_dust", "tokens") if int(spent_cost.get(asset, 0) or 0) > 0),
            "bones",
        )

        # best-effort name + pack qty
        name = (
            item.get("name")
            or item.get("title")
            or item.get("label")
            or item_key.replace("_", " ").title()
        )
        pack_qty = int(
            item.get("qty")
            or item.get("amount")
            or item.get("grant_qty")
            or item.get("count")
            or 1
        )

        # clean message for WebApp popup (NO HTML)
        msg_plain = f"Ă˘Ĺ›â€¦ Purchased: {name}{(' x'+str(pack_qty)) if pack_qty > 1 else ''}\nCost: {spent_text}"

        resp = {
            "ok": True,
            "message": msg_plain,                # Ă˘Ĺ›â€¦ UI friendly
            "raw_message": str(message or ""),   # keep old message for debug/logs
            "purchase": {                        # Ă˘Ĺ›â€¦ structured for UI
                "itemKey": item_key,
                "name": name,
                "qty": int(pack_qty),
                "spent": spent_cost,
                "spentText": spent_text,
                "cost": spent_cost,
                "currency": primary_currency,
            },
            "resources": {
                "bones": bones,
                "scrap": scrap,
                "rune_dust": dust,
                "token": int(tokens or 0),
                "tokenSymbol": "$TOKEN",
            },
            "itemKey": item_key,
            "boughtToday": int(_get_item_purchases_today(u2, item_key)),
            "dailyLimit": int(_get_item_daily_limit(item)),
            "ownedCount": int((u2.get("inventory") or {}).get(item_key, 0)),
        }

        shop_map[run_id] = build_telemetry_idemp_entry("shop_buy", resp, status=200)
        if len(shop_map) > 80:
            for k in list(shop_map.keys())[:-80]:
                shop_map.pop(k, None)

        out["status"] = 200
        out["resp"] = resp
        return u2

    await with_user(uid, _mut, reason="webapp:shop_buy")

    # safety fallback
    if not isinstance(out.get("resp"), dict):
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(out["resp"], status=int(out.get("status", 200)))


async def building_resolve_handler(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_JSON"}, status=400)

    init_data = _extract_init_data(request, body)
    bid = (body.get("buildingId") or body.get("building_id") or "").strip()

    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "").strip()
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_USER"}, status=400)
    if not bid:
        return web.json_response({"ok": False, "reason": "NO_BUILDING"}, status=400)

    # Ă˘Ĺ›â€¦ NIE tworzymy nowych userÄ‚Ĺ‚w przez resolve
    u0 = await read_user(uid)
    if not isinstance(u0, dict) or not u0:
        return web.json_response({"ok": False, "reason": "NOT_REGISTERED"}, status=403)

    cfg = BUILDING_CFG.get(bid)
    if not cfg:
        return web.json_response({"ok": False, "reason": "UNKNOWN_BUILDING"}, status=404)

    # Fortress uses a different flow (no resolve)
    if cfg.get("type") == "fortress":
        return web.json_response({
            "ok": False,
            "reason": "FORTRESS_MODE",
            "message": "Moon Lab fights run in fortress mode; no resolve endpoint."
        }, status=409)

    # Dojo returns results immediately from /start (no resolve)
    if cfg.get("type") == "dojo" and bid == "testnet_wastes_dojo":
        return web.json_response({
            "ok": False,
            "reason": "DOJO_MODE",
            "message": "Training Dojo returns results immediately from /start; no resolve endpoint."
        }, status=409)

    # run_id (idempotency) Ă˘â‚¬â€ť jeÄąâ€şli front nie podaÄąâ€š, zrÄ‚Ĺ‚b fallback
    run_id = (body.get("run_id") or body.get("runId") or "").strip()
    if not run_id:
        try:
            # jeÄąâ€şli masz _get_run_id helper (jak w shop/skins) Ă˘â‚¬â€ť uÄąÄ˝yj go
            run_id = _get_run_id(body, "bldres", uid, extra=bid)
        except Exception:
            run_id = ""

    def mut(u: dict):
        now = int(time.time())

        # uid consistency
        u.setdefault("id", uid)
        u.setdefault("uid", uid)
        u.setdefault("user_id", uid)

        # ensure keys/regions containers
        try:
            ensure_regions_keys(u)
        except Exception:
            pass

        # Ă˘Ĺ›â€¦ gate regionu (na wypadek edge-case)
        reg = cfg.get("region") or "chain"
        if reg != "chain":
            try:
                if not is_region_unlocked(u, reg):
                    resp = {"ok": False, "reason": "LOCKED_REGION"}
                    if run_id:
                        _store_webapp_idempo(u, uid=uid, bucket="building_resolve", run_id=run_id, status=403, resp=resp, now_ts=now)
                    return {"ok": False, "status": 403, "resp": resp}
            except Exception:
                resp = {"ok": False, "reason": "LOCKED_REGION"}
                if run_id:
                    _store_webapp_idempo(u, uid=uid, bucket="building_resolve", run_id=run_id, status=403, resp=resp, now_ts=now)
                return {"ok": False, "status": 403, "resp": resp}

        # -----------------------------
        # Idempotency (anti double-click)
        # -----------------------------
        if run_id:
            idem = u.setdefault("_webapp_idempo", {}).setdefault("building_resolve", {})
            cached = idem.get(run_id)
            if isinstance(cached, dict) and cached.get("resp"):
                return {"ok": True, "status": int(cached.get("status", 200)), "resp": cached["resp"]}

        # --- AFK: update state ---
        try:
            ensure_afk_fields(u)
            afk_update_state(u)
        except Exception:
            pass

        st = _bstate(u, bid)
        ends_at = int(st.get("ends_at", 0) or 0)

        # brak aktywnego runu
        if not ends_at:
            resp = {"ok": False, "reason": "NO_RUN"}
            if run_id:
                _store_webapp_idempo(u, uid=uid, bucket="building_resolve", run_id=run_id, status=409, resp=resp, now_ts=now)
            return {"ok": False, "status": 409, "resp": resp}

        # jeszcze nie gotowe
        if ends_at > now:
            resp = {"ok": False, "reason": "NOT_READY", "timeLeftSec": int(ends_at - now)}
            if run_id:
                _store_webapp_idempo(u, uid=uid, bucket="building_resolve", run_id=run_id, status=409, resp=resp, now_ts=now)
            return {"ok": False, "status": 409, "resp": resp}

        # rewards roll (ranges)
        rw = cfg.get("rewards") or {}
        scrap = random.randint(*(rw.get("scrap", (0, 0))))
        bones = random.randint(*(rw.get("bones", (0, 0))))
        dust  = random.randint(*(rw.get("rune_dust", (0, 0))))

        # route multipliers
        route = (st.get("route") or "").lower()
        rc = (cfg.get("routes") or {}).get(route, {})
        mult = rc.get("mult", {})

        def M(v, k):
            return int(round(v * float(mult.get(k, 1.0))))

        scrap, bones, dust = M(scrap, "scrap"), M(bones, "bones"), M(dust, "rune_dust")

        # --- ledger grants ---
        try:
            from ledger_lite import ledger_append, ledger_apply_to_user
        except Exception:
            ledger_append = None
            ledger_apply_to_user = None

        def _ledger(asset: str, amount: int, note: str):
            if ledger_append and amount:
                ledger_append(
                    uid, asset, int(amount),
                    ref={"type": "building", "id": bid, "route": route or "default"},
                    note=note
                )

        if scrap: _ledger("scrap", scrap, "building_resolve_scrap")
        if dust:  _ledger("rune_dust", dust, "building_resolve_rune")
        if bones: _ledger("bones", bones, "building_resolve_bones")

        # fragment roll
        got_frag = False
        frag_ch = float(cfg.get("frag_chance", 0.0)) + float(rc.get("frag_bonus", 0.0))
        frag_ch = max(0.0, min(0.95, frag_ch))
        if random.random() < frag_ch:
            got_frag = True
            _ledger(FRAGMENT_KEY, 1, "building_resolve_fragment")

            # quest hook (bezpiecznie)
            try:
                from quests import update_quest_progress
                update_quest_progress(u, {"type": "fragments", "amount": 1})
            except Exception:
                pass

        # item shards: tylko Chain Gate
        shard_slot = None
        shard_amount = 0
        if bid == "chain_gate" and SELECTOR_SHARD_SLOTS:
            base_chance = 0.06
            route_bonus = {
                "exp_2h": 0.00,
                "exp_4h": 0.03,
                "exp_8h": 0.07,
                "exp_10h": 0.09,
            }
            ch = base_chance + route_bonus.get(route, 0.0)
            ch = max(0.0, min(0.25, ch))

            if random.random() < ch:
                shard_slot = random.choice(SELECTOR_SHARD_SLOTS)
                shard_asset = f"{shard_slot}_shards"
                shard_amount = 1
                _ledger(shard_asset, shard_amount, "building_resolve_shard")

        # mirror ledger -> user doc (natychmiastowy UI refresh)
        if ledger_apply_to_user:
            try:
                shard_assets = tuple(f"{slot}_shards" for slot in (SELECTOR_SHARD_SLOTS or []))
                ledger_apply_to_user(
                    u,
                    assets=("scrap", "rune_dust", "bones", FRAGMENT_KEY) + shard_assets
                )
            except Exception:
                pass

        # lore + route label
        lore_pool   = (cfg.get("lore_notes") or [])
        lore        = random.choice(lore_pool) if lore_pool else "The wind carries a faint howl from the north."
        route_label = (rc.get("label") or route.title()) if route else "Standard"

        # Chain Gate = claim AFK duty
        if bid == "chain_gate":
            try:
                afk_clear(u)
            except Exception:
                u["afk_state"] = "idle"
                u["afk_until"] = 0

        # clear session
        st.clear()

        rewards_payload = {
            "scrap": scrap,
            "bones": bones,
            "rune_dust": dust,
            "fragment": bool(got_frag),
        }
        if shard_amount:
            rewards_payload["shards"] = {"slot": shard_slot, "amount": shard_amount}

        resp = {
            "ok": True,
            "buildingId": bid,
            "name": cfg.get("name", bid),
            "route": route_label,
            "rewards": rewards_payload,
            "lore": lore
        }

        # cache response for idempotency
        if run_id:
            _store_webapp_idempo(u, uid=uid, bucket="building_resolve", run_id=run_id, status=200, resp=resp, now_ts=now)

        return {"ok": True, "status": 200, "resp": resp}

    res = await with_user(uid, mut, reason=f"webapp:building:resolve:{bid}")

    if not isinstance(res, dict) or "resp" not in res:
        return web.json_response({"ok": False, "reason": "NO_RESP"}, status=500)

    return web.json_response(res["resp"], status=int(res.get("status", 200)))

# === /webapp/equipped/state ===
async def webapp_equipped_state(request: web.Request):
    # --- body safe ---
    try:
        body = await request.json() if request.can_read_body else {}
        if not isinstance(body, dict):
            body = {}
    except Exception:
        body = {}

    # --- verify init_data + tg user ---
    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user["id"])

    # --- read_user (NO load/save) ---
    user = await read_user(uid)
    src = "data_store"
    if not isinstance(user, dict):
        return web.json_response({"ok": False, "reason": "no_user"}, status=404)

    await _maybe_mark_tutorial_step(uid, user, "equipped_seen", reason="tutorial:equipped_seen")

    # --- build payload under equipped.js ---
    eq_state = build_equipped_state(user)

    parts = compute_full_stats(user)
    totals = (parts.get("totals", {}) or {}) if isinstance(parts, dict) else {}
    vit_total = int(totals.get("vitality", 0) or 0)
    max_hp = 50 + vit_total * 12

    stats_payload = {
        "level": int(eq_state.get("level", 1) or 1),

        "hp": max_hp,
        "attack": int(totals.get("strength", 0) or 0),
        "defense": int(totals.get("defense", 0) or 0),
        "agility": int(totals.get("agility", 0) or 0),
        "luck": int(totals.get("luck", 0) or 0),

        # aliasy:
        "hpMax": max_hp,
        "atk": int(totals.get("strength", 0) or 0),
        "def": int(totals.get("defense", 0) or 0),
        "agi": int(totals.get("agility", 0) or 0),
    }

    from items import ALL_ITEMS

    slots_payload = []
    eq = (user.get("equipment") or {})
    for slot in _EQUIP_SLOTS:
        key = eq.get(slot)

        if not key:
            slots_payload.append({
                "slot": slot,
                "label": slot.title(),
                "empty": True,
                "isEmpty": True,
                "name": "Empty",
                "itemName": "Empty",
                "item_key": None,
                "itemKey": None,
                "icon": "/assets/equip/empty.png",
                "img": "/assets/equip/empty.png",
            })
            continue

        # --- PET slot ---
        if slot == "pet":
            pets_dict = user.get("pets", {}) or {}
            pet = pets_dict.get(key, {}) or {}

            pet_key = _pet_icon_key(key, pet)
            icon = _cloudinary_pet_url(pet_key) if pet_key else "/assets/equip/empty.png"

            name = pet.get("name") or "Pet"
            rarity = (pet.get("rarity") or "uncommon").lower()
            lvl = int(pet.get("level", 1) or 1)
            stats = (pet.get("base_stats") or pet.get("stats") or {})

            bonuses_text = ", ".join(
                [f"+{v} {k.upper()}" for k, v in (stats or {}).items() if v]
            ) if stats else ""

            slot_payload = {
                "slot": slot,
                "label": slot.title(),
                "empty": False,
                "isEmpty": False,
                "item_key": key,
                "itemKey": key,
                "key": key,
                "name": name,
                "itemName": name,
                "rarity": rarity,
                "level": lvl,
                "maxStars": lvl,
                "icon": icon,
                "img": icon,
                "bonusesText": bonuses_text,
                "stats": stats,
                "isPet": True,
                "petKey": pet_key,
            }
            slot_payload.update(animated_pet_sprite_payload(pet_key))
            slots_payload.append(slot_payload)
            continue

        # --- normal gear ---
        meta = ALL_ITEMS.get(key, {}) or {}
        icon = _resolve_item_icon(key, meta)

        ed = (user.get("equipment_data", {}) or {}).get(key, {"level": 1})
        stars = int(ed.get("level", 1) or 1)
        max_stars = int(meta.get("max_level", 1) or 1)
        rarity = (meta.get("rarity") or "common").lower()
        name = meta.get("name", key.replace("_", " ").title())
        stats = ed.get("stat_bonus", meta.get("stat_bonus", {}))
        bonuses_text = ", ".join(
            [f"+{v} {k.upper()}" for k, v in (stats or {}).items() if v]
        ) if stats else ""

        slots_payload.append({
            "slot": slot,
            "label": slot.title(),
            "empty": False,
            "isEmpty": False,
            "item_key": key,
            "itemKey": key,
            "key": key,
            "name": name,
            "itemName": name,
            "rarity": rarity,
            "level": stars,
            "maxStars": max_stars,
            "icon": icon,
            "img": icon,
            "bonusesText": bonuses_text,
            "stats": stats,
        })

    # PNG character (cache-bust ok na teraz)
    character_url = f"/webapp/equipped/character.png?user_id={uid}&v={int(time.time())}"

    payload = {
        "characterUrl": character_url,
        "stats": stats_payload,
        "slots": slots_payload,
        "activeSets": eq_state.get("active_sets", []),
        "totalBonus": eq_state.get("total_bonus", {}),
    }

    if body.get("dbg"):
        payload["_dbg"] = {
            "userSrc": src,
            "armor": (eq or {}).get("armor"),
        }

    return web.json_response({"ok": True, "data": payload})



# === /webapp/equipped/inspect ===
async def webapp_equipped_inspect(request: web.Request):
    # --- body safe ---
    try:
        body = await request.json() if request.can_read_body else {}
        if not isinstance(body, dict):
            body = {}
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    slot = str(body.get("slot") or "").strip().lower()
    if not slot:
        return web.json_response({"ok": False, "reason": "missing_slot"}, status=400)

    uid = str(tg_user["id"])

    user = await read_user(uid)
    src = "data_store"
    if not isinstance(user, dict):
        return web.json_response({"ok": False, "reason": "no_user"}, status=404)
    info = build_equipped_inspect(user, slot)

    # inspect jest read-only Ă˘â‚¬â€ť nie zapisujemy data
    if body.get("dbg") and isinstance(info, dict):
        info["_dbg"] = {
            "userSrc": src,
            "armor": (user.get("equipment") or {}).get("armor"),
        }

    return web.json_response({"ok": True, "data": info})


# === /webapp/item/inspect ===
import os, json

_ALL_ITEMS_CACHE = None

def _get_users_dict(data: dict):
    """ObsÄąâ€šuga obu formatÄ‚Ĺ‚w: data['users'] albo data jako dict uid->user."""
    if isinstance(data, dict) and isinstance(data.get("users"), dict):
        return data["users"]
    return data if isinstance(data, dict) else {}

def _get_user(data: dict, uid: str):
    users = _get_users_dict(data)
    u = users.get(uid)
    return u if isinstance(u, dict) else None

def _load_all_items():
    """
    Dopasuj do swojej bazy itemÄ‚Ĺ‚w:
    - jeÄąâ€şli masz ALL_ITEMS w module -> podmieÄąâ€ž tu import
    - fallback: ALL_ITEMS.json obok pliku
    """
    global _ALL_ITEMS_CACHE
    if isinstance(_ALL_ITEMS_CACHE, dict) and _ALL_ITEMS_CACHE:
        return _ALL_ITEMS_CACHE

    # 1) sprÄ‚Ĺ‚buj importu z kodu (dopasuj jeÄąâ€şli masz np. from items import ALL_ITEMS)
    try:
        from items import ALL_ITEMS  # <- jeÄąâ€şli u Ciebie inaczej, podmieÄąâ€ž
        if isinstance(ALL_ITEMS, dict):
            _ALL_ITEMS_CACHE = ALL_ITEMS
            return _ALL_ITEMS_CACHE
    except Exception:
        pass

    # 2) fallback: plik JSON (jeÄąâ€şli trzymasz bazĂ„â„˘ jako JSON)
    try:
        here = os.path.dirname(__file__)
        p = os.path.join(here, "ALL_ITEMS.json")
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                _ALL_ITEMS_CACHE = json.load(f) or {}
                return _ALL_ITEMS_CACHE
    except Exception:
        pass

    _ALL_ITEMS_CACHE = {}
    return _ALL_ITEMS_CACHE

_INV_SLOT_GUESS = (
    ("helmet", "helmet"),
    ("armor", "armor"),
    ("armour", "armor"),
    ("gloves", "gloves"),
    ("fangs", "fangs"),
    ("cloak", "cloak"),
    ("collar", "collar"),
    ("ring", "ring"),
    ("offhand", "offhand"),
    ("shield", "offhand"),
    ("weapon", "weapon"),
)

_INV_CONSUMABLE_TOKENS = ("potion", "drink", "elixir", "xp_", "energy", "boost", "crystal", "coin", "bone")

_EQUIP_SLOT_LABELS = {
    str(row.get("slot") or "").strip().lower(): str(row.get("label") or row.get("slot") or "").strip()
    for row in (EQUIPMENT_SLOTS or [])
    if isinstance(row, dict) and row.get("slot")
}

def _safe_int(value, default: int = 0) -> int:
    try:
        return int(value or 0)
    except Exception:
        return int(default or 0)

def _first_text(*values, default: str = "") -> str:
    for value in values:
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return str(default or "")

def _inventory_record_meta(record) -> dict:
    if not isinstance(record, dict):
        return {}
    out = {}
    for key, value in record.items():
        if str(key).strip().lower() in {"qty", "amount", "count", "value"}:
            continue
        out[key] = value
    return out

def _guess_item_slot(item_key: str) -> str:
    lk = str(item_key or "").strip().lower()
    for token, slot in _INV_SLOT_GUESS:
        if token in lk:
            return slot
    return ""

def _item_slot_from_def(item_key: str, item_def: dict) -> str:
    slot = _canon_slot(item_def.get("slot") if isinstance(item_def, dict) else "")
    if slot in _CANON_SLOTS:
        return slot
    typ = _canon_slot(item_def.get("type") if isinstance(item_def, dict) else "")
    if typ in _CANON_SLOTS:
        return typ
    return _guess_item_slot(item_key)

def _item_type_and_category(item_key: str, item_def: dict, slot: str) -> tuple[str, str]:
    item_def = item_def if isinstance(item_def, dict) else {}
    lk = str(item_key or "").strip().lower()
    typ = str(item_def.get("type") or "").strip().lower()
    category = str(item_def.get("category") or "").strip().lower()
    if slot in _CANON_SLOTS:
        category = category or typ or "gear"
        typ = "gear"
    if not typ or typ == "unknown":
        if slot in _CANON_SLOTS:
            typ = "gear"
        elif any(token in lk for token in _INV_CONSUMABLE_TOKENS):
            typ = "consumable"
        else:
            typ = category or "misc"
    if not category:
        category = typ or ("gear" if slot in _CANON_SLOTS else "misc")
    return typ or "misc", category or "misc"

def _item_desc_from_def(item_def: dict) -> str:
    item_def = item_def if isinstance(item_def, dict) else {}
    return _first_text(
        item_def.get("desc"),
        item_def.get("description"),
        item_def.get("flavor"),
        item_def.get("flavour"),
        default="",
    )

def _item_usage_from_def(item_def: dict) -> str:
    item_def = item_def if isinstance(item_def, dict) else {}
    return _first_text(
        item_def.get("used_for"),
        item_def.get("usedFor"),
        item_def.get("effect"),
        item_def.get("special_effect"),
        default="",
    )

def _item_stats_from_def(d: dict) -> dict:
    """Ujednolicenie statÄ‚Ĺ‚w z definicji itemu."""
    if not isinstance(d, dict):
        return {}
    for field in ("stat_bonus", "stats"):
        s = d.get(field)
        if not isinstance(s, dict):
            continue
        out = {}
        for k, v in s.items():
            if v is None:
                continue
            try:
                out[str(k)] = int(v)
            except Exception:
                continue
        if out:
            return out
    return {}

def _equipped_item_key_for_slot(user: dict, slot: str) -> str:
    """WyciĂ„â€¦ga item_key z eq dla slotu (preferuje equipment, fallback equipped)."""
    if not isinstance(user, dict) or not slot:
        return ""

    for eq_field in ("equipment", "equipped"):  # Ă˘Ĺ›â€¦ waÄąÄ˝ne: equipment FIRST
        eq = user.get(eq_field)
        if not isinstance(eq, dict):
            continue
        x = eq.get(slot)
        if isinstance(x, str):
            return x
        if isinstance(x, dict):
            return str(x.get("item_key") or x.get("key") or x.get("itemKey") or "").strip()

    return ""

def _build_item_payload(item_key: str, item_def: dict, *, quantity: int = 1, inventory_record=None) -> dict:
    base_def = item_def if isinstance(item_def, dict) else {}
    record_def = _inventory_record_meta(inventory_record)
    merged = dict(record_def)
    merged.update(base_def)
    key = _first_text(item_key, merged.get("item_key"), merged.get("key"), merged.get("id"), default="unknown_item")
    slot = _item_slot_from_def(key, merged)
    item_type, category = _item_type_and_category(key, merged, slot)
    stats = _item_stats_from_def(merged) if slot in _CANON_SLOTS or item_type == "gear" else {}
    desc = _item_desc_from_def(merged)
    flavor = _first_text(merged.get("flavor"), merged.get("flavour"), default=desc)
    usage = _item_usage_from_def(merged)
    qty = max(1, _safe_int(quantity, 1))
    icon = _resolve_item_icon(key, merged) or (f"/assets/equip/{key}.png" if slot in _CANON_SLOTS else f"/assets/items/{key}.png")
    rarity = _first_text(merged.get("rarity"), default="common").lower()
    level = max(1, _safe_int(merged.get("level") or merged.get("lvl"), 1))
    return {
        "id": key,
        "key": key,
        "itemKey": key,
        "item_key": key,
        "name": _first_text(merged.get("name"), key.replace("_", " ").title(), default="Unknown Item"),
        "slot": slot or None,
        "slotLabel": _first_text(_EQUIP_SLOT_LABELS.get(slot), slot.title() if slot else "", default=""),
        "rarity": rarity,
        "type": item_type or "misc",
        "category": category or "misc",
        "desc": desc,
        "description": desc,
        "flavor": flavor,
        "usedFor": usage,
        "stats": stats,
        "icon": icon,
        "set": _first_text(merged.get("set"), default=""),
        "quantity": qty,
        "amount": qty,
        "level": level if slot in _CANON_SLOTS or item_type == "gear" else None,
        "star_cap": merged.get("star_cap") or merged.get("starCap") or None,
        "isEquipment": bool(slot in _CANON_SLOTS or item_type == "gear"),
        "isConsumable": item_type == "consumable",
        "data": {
            "level": level,
            "stat_bonus": stats if isinstance(stats, dict) else {},
        },
    }

async def webapp_item_inspect(request: web.Request):
    try:
        try:
            body = await request.json() if request.can_read_body else {}
            if not isinstance(body, dict):
                body = {}
        except Exception:
            body = {}

        init = _extract_init_data(request, body)
        ok, reason, tg_user = _verify_init_data(init)
        if not ok:
            return web.json_response({"ok": False, "reason": reason}, status=401)

        item_key = str(body.get("item_key") or body.get("itemKey") or body.get("key") or "").strip()
        if not item_key:
            return web.json_response({"ok": False, "reason": "missing_item_key"}, status=400)

        uid = str(tg_user["id"])
        user = await read_user(uid)
        src = "data_store"
        if not isinstance(user, dict):
            return web.json_response({"ok": False, "reason": "no_user"}, status=404)

        all_items = _load_all_items()
        item_def = all_items.get(item_key)
        inv_bucket = _inv_items_bucket(user)
        inv_record = inv_bucket.get(item_key) if isinstance(inv_bucket, dict) else None
        item_payload = _build_item_payload(
            item_key,
            item_def if isinstance(item_def, dict) else {},
            quantity=max(1, _inv_amount(inv_bucket, item_key)) if isinstance(inv_bucket, dict) else 1,
            inventory_record=inv_record,
        )

        equipped_payload = None
        delta = {}

        slot = item_payload.get("slot")
        if slot:
            eq_key = _equipped_item_key_for_slot(user, slot)
            if eq_key:
                eq_def = all_items.get(eq_key)
                equipped_payload = _build_item_payload(eq_key, eq_def if isinstance(eq_def, dict) else {})

                a = item_payload.get("stats") or {}
                b = equipped_payload.get("stats") or {}
                keys = set(a.keys()) | set(b.keys())
                for k in keys:
                    d = int(a.get(k, 0) or 0) - int(b.get(k, 0) or 0)
                    if d != 0:
                        delta[k] = d

        out = {"ok": True, "data": {"item": item_payload, "equipped": equipped_payload, "delta": delta}}

        if body.get("dbg"):
            out["dbg"] = {
                "userSrc": src,
                "slot": slot,
                "eqKey": (user.get("equipment") or {}).get(slot) if slot else None,
            }

        return web.json_response(out)

    except Exception as e:
        print("webapp_item_inspect error:", repr(e))
        return web.json_response({"ok": False, "reason": "server_error"}, status=500)    

async def webapp_equipped_unequip(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    slot = str(body.get("slot") or "").lower()
    if not slot:
        return web.json_response({"ok": False, "reason": "missing_slot"}, status=400)

    uid = str(tg_user["id"])

    def mut(user: dict):
        user["uid"] = uid
        user["id"] = uid
        user["user_id"] = uid

        ok2, removed, reason2 = unequip_slot(user, slot)
        if not ok2 and reason2 == "empty":
            return {"ok": False, "reason": "empty_slot"}

        state = build_equipped_state(user)
        return {"ok": True, "data": state, "removed": removed}

    resp = await with_user(uid, mut, reason="webapp_equipped_unequip")
    return web.json_response(resp, status=(200 if resp.get("ok") else 400))

from data_store import read_user
from equipment import (
    initialize_equipment, _get_star_cap,
    _calc_upgrade_cost_materials, _has_materials, _spend_materials
)
from inventory import (
    add_item,
    remove_item,
    SPECIAL_EFFECTS,
    build_visible_active_effects,
    get_consumable_use_meta,
    get_salvage_quote,
    resolve_special_effect_key,
    salvage_item,
    salvage_reason_message,
)
from items import ALL_ITEMS
import random

# === Pomocniczy builder (Inventory = UNEQUIPPED ONLY) ===
def _build_inventory_payload(user: dict) -> dict:
    initialize_equipment(user)

    equipment = user.get("equipment", {}) or {}
    inventory_root = user.get("inventory", {}) or {}
    materials = user.get("materials", {}) or {}

    # ---- normalize inventory container: flat dict OR inventory["items"] OR MIXED ----
    def _norm_amt(v) -> int:
        if isinstance(v, dict):
            for field in ("amount", "count", "qty", "value"):
                if field in v:
                    return _safe_int(v.get(field), 0)
            return 1
        return _safe_int(v, 0)

    inventory: dict = {}

    if isinstance(inventory_root, dict):
        nested = inventory_root.get("items") if isinstance(inventory_root.get("items"), dict) else None

        if nested:
            # jeÄąâ€şli jest MIXED (czyli oprÄ‚Ĺ‚cz "items" sĂ„â€¦ teÄąÄ˝ normalne klucze)
            flat = {k: v for k, v in inventory_root.items() if str(k) != "items"}

            if flat:
                # merge flat + nested
                inventory = dict(flat)
                for k, v in nested.items():
                    if not k:
                        continue
                    k = str(k)

                    # jeÄąâ€şli juÄąÄ˝ istnieje -> sumujemy iloÄąâ€şci (ÄąÄ˝eby nic nie zginĂ„â„˘Äąâ€šo)
                    if k in inventory:
                        a = _norm_amt(inventory.get(k))
                        b = _norm_amt(v)
                        inventory[k] = a + b
                    else:
                        inventory[k] = v
            else:
                # czysty format B) inventory["items"]
                inventory = dict(nested)
        else:
            # czysty format A) flat inventory dict
            inventory = inventory_root
    else:
        inventory = {}

    def _extract_key(v) -> str | None:
        if not v:
            return None
        if isinstance(v, str):
            return v
        if isinstance(v, dict):
            return (v.get("key") or v.get("item_key") or v.get("item") or v.get("id"))
        return None

    equipped_by_slot: dict[str, dict] = {}
    equipped_by_key: dict[str, str] = {}
    for slot, v in (equipment or {}).items():
        k = _extract_key(v)
        if k:
            slot_name = _canon_slot(slot)
            equipped_by_key[str(k)] = str(slot_name or slot)
            equipped_by_slot[str(slot_name or slot)] = _build_item_payload(
                str(k),
                ALL_ITEMS.get(str(k), {}) or {},
                quantity=1,
                inventory_record=v if isinstance(v, dict) else None,
            )

    slots: list[dict] = []

    # inventory dict = "wolne sztuki" (po equip zdejmujesz z inventory)
    if isinstance(inventory, dict):
        for key, amt in inventory.items():
            if not key:
                continue

            # jeÄąâ€şli ktoÄąâ€ş wrzuciÄąâ€š legacy/Äąâ€şmieciowe pola do dict
            if str(key) == "items":
                continue

            amt_i = _norm_amt(amt)
            if amt_i <= 0:
                continue

            key = str(key)
            item = ALL_ITEMS.get(key, {}) or {}

            item_payload = _build_item_payload(key, item, quantity=amt_i, inventory_record=amt)
            item_payload["useMeta"] = get_consumable_use_meta(key, item, user)
            item_payload["effectActive"] = bool(item_payload["useMeta"].get("active"))
            slot_meta = item_payload.get("slot")
            slots.append({
                **item_payload,
                "equipped": False,
                "equippedSlot": None,
                "locked": bool(_is_item_locked_for_remove(user, key)),
                "stacked": True,
                "stackQty": int(amt_i),
                "equippedCount": 1 if key in equipped_by_key else 0,
                "totalOwned": int(amt_i) + (1 if key in equipped_by_key else 0),
                "compareTarget": equipped_by_slot.get(str(slot_meta or "")) if slot_meta else None,
            })

    slots.sort(key=lambda x: (x.get("name", "")))
    active_effects = build_visible_active_effects(user)

    return {
        "slots": slots,
        "equippedBySlot": equipped_by_slot,
        "bones": int((materials.get("bones", 0) or 0)),
        "scrap": int((materials.get("scrap", 0) or 0)),
        "rune_dust": int((materials.get("rune_dust", 0) or 0)),
        "activeEffects": active_effects,
        "activeEffectsCount": len(active_effects),
    }


# === /webapp/inventory/state ===
#async def webapp_inventory_state(request: web.Request):
 #   try:
  #      body = await request.json()
  #  except:
  #      body = {}

#    init = _extract_init_data(request, body)
#    ok, reason, tg_user = _verify_init_data(init)
#    if not ok:
#        return web.json_response({"ok": False, "reason": reason}, status=401)

#    uid = str(tg_user["id"])
#    data = load_data()
#    user = data.get(uid)
#    if not user:
#        return web.json_response({"ok": False, "reason": "no_user"}, status=404)

 #   payload = _build_inventory_payload(user)
#    return web.json_response(payload)


# === /webapp/inventory/use ===
# === /webapp/inventory/use ===
from data_store import with_user
import inspect

# ===================== INVENTORY WEBAPP (LOCK-SAFE) =====================

from equipment import initialize_equipment
from inventory import SPECIAL_EFFECTS
from items import ALL_ITEMS
import time
import html

# canonical slots used by your system/UI
_CANON_SLOTS = {
    "weapon","armor","fangs","cloak","collar","helmet","ring","offhand","gloves","pet"
}

# map common legacy/meta slot names -> canonical
_SLOT_ALIASES = {
    "chest": "armor",
    "body": "armor",
    "torso": "armor",
    "armour": "armor",
    "neck": "collar",
    "head": "helmet",
    "off_hand": "offhand",
    "off-hand": "offhand",
    "hands": "gloves",
    "gauntlets": "gloves",
}

def _canon_slot(s: str) -> str:
    s = str(s or "").strip().lower()
    if not s:
        return ""
    return _SLOT_ALIASES.get(s, s)

def _inv_items_bucket(user: dict) -> dict:
    """
    Support mixed inventory formats safely:
    A) inventory = {"key": 2, ...}
    B) inventory = {"items": {"key": {"qty":2}}}
    C) MIXED legacy: inventory has qty keys + "items":{...}
       -> merge nested into flat and keep flat as canonical
    """
    inv_root = user.setdefault("inventory", {}) or {}
    if not isinstance(inv_root, dict):
        user["inventory"] = {}
        inv_root = user["inventory"]

    nested = inv_root.get("items")
    if isinstance(nested, dict):
        has_other_keys = any(str(k) != "items" for k in inv_root.keys())
        if has_other_keys:
            # migrate nested -> flat (canonical)
            inv_root.pop("items", None)
            for k, v in nested.items():
                if k not in inv_root:
                    inv_root[k] = v
            return inv_root
        return nested

    return inv_root

def _inv_amount(inv_items: dict, key: str) -> int:
    rec = inv_items.get(key, 0)
    if isinstance(rec, dict):
        v = rec.get("qty", rec.get("amount", rec.get("count", 0)))
    else:
        v = rec
    try:
        return int(v or 0)
    except Exception:
        return 0

def _inv_set_amount(inv_items: dict, key: str, new_amt: int):
    rec = inv_items.get(key)
    if isinstance(rec, dict):
        rec["qty"] = int(new_amt)
        inv_items[key] = rec
    else:
        inv_items[key] = int(new_amt)

def _inv_add(inv_items: dict, key: str, n: int = 1):
    cur = _inv_amount(inv_items, key)
    _inv_set_amount(inv_items, key, cur + int(n or 0))

def _inv_spend(inv_items: dict, key: str, n: int = 1) -> bool:
    cur = _inv_amount(inv_items, key)
    n = int(n or 0)
    if cur < n:
        return False
    left = cur - n
    if left <= 0:
        try:
            inv_items.pop(key, None)
        except Exception:
            _inv_set_amount(inv_items, key, 0)
    else:
        _inv_set_amount(inv_items, key, left)
    return True


_INV_REMOVE_PROTECTED_TYPES = {"exclusive", "hidden", "core", "factional", "token"}
_INV_REMOVE_PROTECTED_CATEGORIES = {"quest", "system", "token"}
_INV_REMOVE_FLAG_FIELDS = ("unique", "exclusive", "event", "limited")


def _boolish(v) -> bool:
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return v != 0
    if v is None:
        return False
    s = str(v).strip().lower()
    return s in {"1", "true", "yes", "y", "on"}


def _item_remove_guard_reason(item: dict) -> str | None:
    if not isinstance(item, dict) or not item:
        return "unknown_item_protected"

    slot = _canon_slot(item.get("slot"))
    if slot == "pet":
        return "protected_pet"

    typ = str(item.get("type") or "").strip().lower()
    if typ in _INV_REMOVE_PROTECTED_TYPES:
        return "protected_type"

    cat = str(item.get("category") or "").strip().lower()
    if cat in _INV_REMOVE_PROTECTED_CATEGORIES:
        return "protected_category"

    for fld in _INV_REMOVE_FLAG_FIELDS:
        if _boolish(item.get(fld)):
            return f"protected_{fld}"
    return None


def _is_item_locked_for_remove(user: dict, key: str) -> bool:
    if not isinstance(user, dict) or not key:
        return False
    key = str(key)

    for fld in ("inv_locks", "locked_items", "locks"):
        src = user.get(fld)
        if isinstance(src, dict) and _boolish(src.get(key)):
            return True
        if isinstance(src, (list, tuple, set)) and key in src:
            return True
    return False


def _equipped_count_for_key(user: dict, key: str) -> int:
    if not isinstance(user, dict) or not key:
        return 0

    eq = user.get("equipment") or {}
    if not isinstance(eq, dict):
        return 0

    target = str(key)
    count = 0
    for v in eq.values():
        if isinstance(v, str):
            k = v
        elif isinstance(v, dict):
            k = v.get("key") or v.get("item_key") or v.get("item") or v.get("id")
        else:
            k = None
        if k and str(k) == target:
            count += 1
    return int(count)


# --------------------- /webapp/inventory/state ---------------------
async def webapp_inventory_state(request: web.Request):
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    user = await read_user(uid)
    if not isinstance(user, dict):
        return web.json_response({"ok": False, "reason": "no_user"}, status=404)

    await _maybe_mark_tutorial_step(uid, user, "inventory_seen", reason="tutorial:inventory_seen")

    # Ă˘Ĺ›â€¦ SUPER IMPORTANT: nie mutuj cache usera poza lockiem
    try:
        import copy
        u_view = copy.deepcopy(user)
    except Exception:
        u_view = dict(user)

    payload = _attach_buffs_payload(_build_inventory_payload(u_view), u_view)
    return web.json_response({"ok": True, **payload})

def _attach_buffs_payload(payload: dict, user: dict) -> dict:
    if not isinstance(payload, dict):
        payload = {}

    try:
        bl, bf = build_buffs_payload_ro(user)
        payload["buffsLine"] = bl
        payload["buffs"] = bf
        payload["buffsCount"] = len(bf)
        payload["activeBuffs"] = _build_active_buffs_payload_ro(user, bf)
    except Exception:
        # fail-safe: nie wywalaj requesta przez UI buffy
        payload.setdefault("buffsLine", "")
        payload.setdefault("buffs", [])
        payload.setdefault("buffsCount", 0)
        payload.setdefault("activeBuffs", [])

    return payload


async def webapp_buffs_cancel(request: web.Request):
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_REQUEST", "message": "Invalid request body."}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    key = str(body.get("key") or "").strip()
    if not key:
        return web.json_response({"ok": False, "reason": "BAD_REQUEST", "message": "Missing signal key."}, status=400)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    def mut(user: dict):
        user["uid"] = uid
        user["id"] = uid
        user["user_id"] = uid

        result = cancel_active_effect(user, key, now_ts=time.time())
        if not isinstance(result, dict) or result.get("ok") is False:
            return result if isinstance(result, dict) else {
                "ok": False,
                "reason": "CANCEL_FAILED",
                "message": "This signal could not be ended.",
            }

        payload = _attach_buffs_payload({}, user)
        return {
            "ok": True,
            "cancelled": True,
            "key": str(result.get("key") or key),
            "message": "Signal ended. No item was refunded.",
            "reactivationLockedUntil": int(result.get("lockedUntil") or 0),
            **payload,
        }

    resp = await with_user(uid, mut, reason="webapp_buffs_cancel")
    return web.json_response(resp, status=(200 if resp.get("ok") else 400))

# --------------------- /webapp/inventory/use ---------------------
async def webapp_inventory_use(request: web.Request):
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    key = str(body.get("key") or "").strip()
    if not key or key not in ALL_ITEMS:
        return web.json_response({"ok": False, "reason": "invalid_item"}, status=400)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    def mut(user: dict):
        # spÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ uid
        user["uid"] = uid
        user["id"] = uid
        user["user_id"] = uid

        inv_items = _inv_items_bucket(user)
        if not isinstance(inv_items, dict):
            user["inventory"] = {}
            inv_items = _inv_items_bucket(user)

        if _inv_amount(inv_items, key) <= 0:
            return {
                "ok": False,
                "reason": "NOT_ENOUGH",
                "consumed": False,
                "item_key": key,
                "message": "No Scent Trail available." if key == "scent_trail" else "Item not available.",
            }

        item = ALL_ITEMS.get(key) or {}

        # Ă˘Ĺ›â€¦ LOOTBOXES: handle here (sync) to avoid async SPECIAL_EFFECTS in WebApp
        if key in ("mystery_box", "premium_box", "legendary_box"):
            run_id = str(body.get("run_id") or "").strip() or f"w_inv_use:{uid}:{key}:{int(time.time())}"

            # Ă˘Ĺ›â€¦ IDempotency early return (no double spend)
            box_runs = user.get("boxOpenRuns")
            if isinstance(box_runs, dict):
                cached = box_runs.get(run_id)
                if isinstance(cached, dict) and isinstance(cached.get("lines"), list):
                    name = (ALL_ITEMS.get(key) or {}).get("name", key)
                    message = _cinematic_reveal(name, cached["lines"])
                    payload = _attach_buffs_payload(_build_inventory_payload(user), user)  # Ă˘Ĺ›â€¦ (1)
                    return {"ok": True, "message": message, "toast": message, **payload}

            seed = f"{uid}:{key}:{run_id}"

            # Ă˘Ĺ›â€¦ spend FIRST (anti-edge duping)
            if not _inv_spend(inv_items, key, 1):
                return {"ok": False, "reason": "not_enough"}

            # Ă˘Ĺ›â€¦ pityMap input (box pity lives here)
            pity_map = user.get("pityMap")
            if not isinstance(pity_map, dict):
                pity_map = {}

            try:
                drops = roll_box_drops(key, seed=seed, pity_map=pity_map)
            except TypeError:
                # back-compat if old signature exists somewhere
                drops = roll_box_drops(key, seed=seed)

            # Ă˘Ĺ›â€¦ apply pity updates from drops (do NOT show them in reveal)
            def _apply_pity_from_drops(u: dict, drops_list: list) -> None:
                pm = u.get("pityMap")
                if not isinstance(pm, dict):
                    pm = {}
                    u["pityMap"] = pm

                for d in drops_list or []:
                    if not isinstance(d, dict):
                        continue
                    if d.get("type") != "pity":
                        continue
                    pkey = str(d.get("key") or "").strip()
                    if not pkey:
                        continue
                    op = ((d.get("meta") or {}).get("op") or "").lower()
                    if op == "set":
                        try:
                            pm[pkey] = int(d.get("amount") or 0)
                        except Exception:
                            pm[pkey] = 0

            # Ă˘Ĺ›â€¦ filter pity out of "real reward application"
            drops_real = [d for d in (drops or []) if isinstance(d, dict) and d.get("type") != "pity"]

            try:
                lines = _apply_box_drops_webapp(
                    uid, user, inv_items, key, drops_real,
                    seed=seed, run_id=run_id
                )
            except Exception as e:
                try:
                    import traceback
                    print("[BOX_APPLY_FAIL]", uid, key, run_id, "ERR=", repr(e))
                    traceback.print_exc()
                except Exception:
                    pass

                # safety refund
                try:
                    inv_items[key] = int(inv_items.get(key, 0) or 0) + 1
                except Exception:
                    pass

                return {"ok": False, "reason": "loot_apply_failed"}

            # Ă˘Ĺ›â€¦ now store pity result
            _apply_pity_from_drops(user, drops)

            name = (ALL_ITEMS.get(key) or {}).get("name", key)
            message = _cinematic_reveal(name, lines or [])

            payload = _attach_buffs_payload(_build_inventory_payload(user), user)  # Ă˘Ĺ›â€¦ (2)
            return {"ok": True, "message": message, "toast": message, **payload}

        use_meta = get_consumable_use_meta(key, item, user)
        if str(item.get("type") or "").strip().lower() == "consumable":
            blocked_state = str(use_meta.get("state") or "").strip().lower()
            if blocked_state in {"blocked", "redirect", "passive", "unknown"}:
                return {
                    "ok": False,
                    "reason": str(use_meta.get("redirectTarget") or use_meta.get("state") or "use_blocked").upper(),
                    "consumed": False,
                    "item_key": key,
                    "message": str(use_meta.get("message") or "This consumable cannot be used right now."),
                    "useMeta": use_meta,
                    "redirectTarget": str(use_meta.get("redirectTarget") or ""),
                    "redirectLabel": str(use_meta.get("redirectLabel") or ""),
                }

        effect_raw = (
            item.get("effect")
            or item.get("special_effect")
            or item.get("specialEffect")
            or item.get("effect_key")
        )

        effect_payload = None
        effect_key = None

        if isinstance(effect_raw, dict):
            effect_payload = effect_raw
            effect_key = (
                effect_raw.get("value")          # Ă˘Ĺ›â€¦ TO JEST KLUCZ
                or effect_raw.get("effect_value")
                or effect_raw.get("key")
                or effect_raw.get("id")
                or effect_raw.get("effect")
                or effect_raw.get("type")
            )
        else:
            effect_key = effect_raw

        if isinstance(effect_key, str):
            effect_key = effect_key.strip() or None
        else:
            effect_key = None

        resolved_special_key = resolve_special_effect_key(key, item)
        if resolved_special_key and resolved_special_key in SPECIAL_EFFECTS:
            effect_key = resolved_special_key

        message = f"Used {item.get('name', key)}"
        extra_response = {}

        # --- najpierw wykonaj efekt, dopiero potem konsumuj ---
        pre_cnt = _inv_amount(inv_items, key)  # Ă˘Ĺ›â€¦ guard vs double spend

        if effect_key and effect_key in SPECIAL_EFFECTS:
            handler = SPECIAL_EFFECTS[effect_key]
            try:
                if effect_payload is not None:
                    # back-compat: rÄ‚Ĺ‚ÄąÄ˝ne podpisy handlerÄ‚Ĺ‚w
                    try:
                        res = handler(uid, user, inv_items, None, None, key, effect=effect_payload)
                    except TypeError:
                        try:
                            res = handler(uid, user, inv_items, None, None, key, effect_payload=effect_payload)
                        except TypeError:
                            res = handler(uid, user, inv_items, None, None, key)
                else:
                    res = handler(uid, user, inv_items, None, None, key)

                # Ă˘ĹĄâ€” WebApp mutatory robimy sync Ă˘â‚¬â€ť jeÄąâ€şli handler jest async -> fail safe
                try:
                    import inspect
                    if inspect.isawaitable(res):
                        return {"ok": False, "reason": "effect_async_not_supported", "consumed": False, "item_key": key}
                except Exception:
                    pass

                # Ă˘Ĺ›â€¦ jeÄąâ€şli handler zwrÄ‚Ĺ‚ci dict (np. BUFF_LIMIT / NOT_USABLE) Ă˘â‚¬â€ť respektuj i NIE spalaj itemu
                if isinstance(res, dict):
                    if res.get("ok") is False:
                        res.setdefault("consumed", False)
                        res.setdefault("item_key", key)
                        return res  # Ă˘Ĺ›â€¦ early return, bez _inv_spend()
                    # opcjonalnie: pozwÄ‚Ĺ‚l handlerowi ustawiĂ„â€ˇ message
                    msg2 = res.get("message") or res.get("desc")
                    if isinstance(msg2, str) and msg2.strip():
                        message = msg2.strip()
                    extra_response = {
                        k: v for k, v in res.items()
                        if k not in {"ok", "message", "desc"}
                    }

                # klasyczny string msg
                elif isinstance(res, str) and res.strip():
                    message = res.strip()

            except Exception:
                # nie konsumuj itema jeÄąâ€şli efekt wywaliÄąâ€š
                return {"ok": False, "reason": "effect_failed", "consumed": False, "item_key": key}
        elif str(item.get("type") or "").strip().lower() == "consumable":
            return {
                "ok": False,
                "reason": "UNKNOWN_CONSUMABLE_EFFECT",
                "consumed": False,
                "item_key": key,
                "message": str(use_meta.get("message") or "This consumable is disabled until its effect is ready."),
                "useMeta": use_meta,
            }

        # konsumuj dopiero po sukcesie efektu
        post_cnt = _inv_amount(inv_items, key)
        consumed = False

        # Ă˘Ĺ›â€¦ jeÄąâ€şli handler nie ruszyÄąâ€š itema Ă˘â€ â€™ normalny spend
        if post_cnt >= 1 and post_cnt == pre_cnt:
            if not _inv_spend(inv_items, key, 1):
                return {"ok": False, "reason": "NOT_ENOUGH", "consumed": False, "item_key": key}
            consumed = True

        # Ă˘Ĺ›â€¦ jeÄąâ€şli handler juÄąÄ˝ zdjĂ„â€¦Äąâ€š 1 sztukĂ„â„˘ (TG-style remove_item) Ă˘â€ â€™ NIE spalaj drugi raz
        elif post_cnt == max(0, pre_cnt - 1):
            consumed = True

        # Ă˘Ĺ›â€¦ jeÄąâ€şli handler zrobiÄąâ€š coÄąâ€ş dziwnego Ă˘â€ â€™ fail-safe
        elif post_cnt <= 0:
            # item zniknĂ„â€¦Äąâ€š, ale zakÄąâ€šadamy ÄąÄ˝e efekt Ă˘â‚¬Ĺ›poszedÄąâ€šĂ˘â‚¬ĹĄ
            consumed = pre_cnt > 0

        payload = _attach_buffs_payload(_build_inventory_payload(user), user)  # Ă˘Ĺ›â€¦ (3)
        return {
            "ok": True,
            **extra_response,
            "consumed": bool(consumed),
            "item_key": key,
            "message": message,
            "useMeta": use_meta,
            **payload,
        }

    resp = await with_user(uid, mut, reason="webapp_inventory_use")

    status = 200 if resp.get("ok") else 400
    return web.json_response(resp, status=status)


async def webapp_inventory_remove(request: web.Request):
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    key = str(body.get("key") or body.get("item") or body.get("item_key") or "").strip()
    if not key:
        return web.json_response({"ok": False, "reason": "missing_key"}, status=400)

    run_id = _get_run_id(body, "inv:salvage", uid, extra=f"{key}:1")

    def mut(user: dict):
        user["uid"] = uid
        user["id"] = uid
        user["user_id"] = uid

        try:
            initialize_equipment(user)
        except Exception:
            pass

        tel = user.get("telemetry")
        if not isinstance(tel, dict):
            tel = {}
            user["telemetry"] = tel

        idem = tel.get("idemp")
        if not isinstance(idem, dict):
            idem = {}
            tel["idemp"] = idem

        rem_map = idem.get("inv_salvage")
        if not isinstance(rem_map, dict):
            rem_map = {}
            idem["inv_salvage"] = rem_map

        cached = rem_map.get(run_id)
        if isinstance(cached, dict) and isinstance(cached.get("resp"), dict):
            return cached["resp"]

        quote = get_salvage_quote(user, key, qty=1)
        item_name = str(quote.get("item_name") or key or "item")

        if not quote.get("ok"):
            resp = {
                "ok": False,
                "reason": str(quote.get("reason") or "not_salvageable"),
                "key": key,
                "name": item_name,
                "run_id": run_id,
                "message": str(quote.get("message") or salvage_reason_message("unknown_item", item_name=item_name)),
            }
        else:
            scrap = int(quote.get("scrap", 0) or 0)
            dust = int(quote.get("rune_dust", 0) or 0)
            salvaged_scrap, salvaged_dust, salvaged_qty, state = salvage_item(user, key, 1, run_id=run_id)

            if state != "ok" or salvaged_qty != 1:
                reason_map = {
                    "locked": "locked_item",
                    "none": "not_owned",
                    "equipped_or_none": "equipped_item",
                    "ledger_error": "ledger_error",
                    "not_gear": "not_salvageable_type",
                }
                reason_key = reason_map.get(state, "ledger_error")
                resp = {
                    "ok": False,
                    "reason": reason_key,
                    "key": key,
                    "name": item_name,
                    "run_id": run_id,
                    "message": salvage_reason_message(reason_key, item_name=item_name),
                }
            else:
                payload = _build_inventory_payload(user)
                resp = {
                    "ok": True,
                    "key": key,
                    "name": item_name,
                    "removed": 1,
                    "left": int((_inv_amount(_inv_items_bucket(user), key) or 0)),
                    "yielded": {"scrap": int(salvaged_scrap), "rune_dust": int(salvaged_dust)},
                    "run_id": run_id,
                    "message": f"Salvaged {item_name}: +{int(scrap)} scrap, +{int(dust)} rune dust.",
                    **payload,
                }

        rem_map[run_id] = build_telemetry_idemp_entry("inv_salvage", resp, status=(200 if resp.get("ok") else 400))
        if len(rem_map) > 120:
            try:
                to_drop = sorted(
                    rem_map.items(),
                    key=lambda kv: int((kv[1] or {}).get("ts", 0))
                )[:-120]
                for rid, _ in to_drop:
                    rem_map.pop(rid, None)
            except Exception:
                for rid in list(rem_map.keys())[:-120]:
                    rem_map.pop(rid, None)

        return resp

    resp = await with_user(uid, mut, reason="webapp_inventory_remove")
    return web.json_response(resp, status=(200 if resp.get("ok") else 400))


# --------------------- /webapp/inventory/equip ---------------------
async def webapp_inventory_equip(request: web.Request):
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    key = str(body.get("key") or "").strip()
    if not key or key not in ALL_ITEMS:
        return web.json_response({"ok": False, "reason": "invalid_item"}, status=400)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=400)

    item = ALL_ITEMS.get(key) or {}
    slot_raw = item.get("slot")
    slot = _canon_slot(slot_raw)

    if not slot:
        return web.json_response({"ok": False, "reason": "not_equippable"}, status=400)
    if slot not in _CANON_SLOTS:
        return web.json_response({
            "ok": False,
            "reason": "unsupported_slot",
            "slot_raw": slot_raw,
            "slot": slot,
        }, status=400)

    def mut(user: dict):
        user["uid"] = uid
        user["id"] = uid
        user["user_id"] = uid

        try:
            initialize_equipment(user)
        except Exception:
            pass

        eq = user.get("equipment")
        if not isinstance(eq, dict):
            eq = {}
            user["equipment"] = eq

        inv_items = _inv_items_bucket(user)
        if not isinstance(inv_items, dict):
            user["inventory"] = {}
            inv_items = _inv_items_bucket(user)

        if _inv_amount(inv_items, key) <= 0:
            return {"ok": False, "reason": "not_owned"}

        old_key = eq.get(slot)

        eq[slot] = key

        # spend 1 from inventory
        if not _inv_spend(inv_items, key, 1):
            # rollback
            if old_key is None:
                eq.pop(slot, None)
            else:
                eq[slot] = old_key
            return {"ok": False, "reason": "not_owned"}

        # return old to inventory
        if old_key:
            _inv_add(inv_items, str(old_key), 1)

        payload = _build_inventory_payload(user)
        return {
            "ok": True,
            "message": f"Equipped {item.get('name', key)}",
            "equippedSlot": slot,
            "equippedKey": key,
            **payload,
        }

    resp = await with_user(uid, mut, reason="webapp_inventory_equip")
    return web.json_response(resp, status=(200 if resp.get("ok") else 400))


# === /webapp/inventory/unequip ===
async def webapp_inventory_unequip(request: web.Request):
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    slot = _canon_slot(body.get("slot"))
    if not slot:
        return web.json_response({"ok": False, "reason": "no_slot"}, status=400)
    if slot not in _CANON_SLOTS:
        return web.json_response({"ok": False, "reason": "bad_slot", "slot": slot}, status=400)

    uid = str(tg_user["id"])

    def mut(user: dict):
        user["uid"] = uid
        user["id"] = uid
        user["user_id"] = uid

        try:
            initialize_equipment(user)
        except Exception:
            pass

        eq = user.get("equipment")
        if not isinstance(eq, dict):
            eq = {}
            user["equipment"] = eq

        key = eq.get(slot)
        if not key:
            return {"ok": False, "reason": "nothing_equipped"}

        # Ă˘Ĺ›â€¦ clear slot (cleaner than setting None)
        eq.pop(slot, None)

        inv_items = _inv_items_bucket(user)
        if not isinstance(inv_items, dict):
            user["inventory"] = {}
            inv_items = _inv_items_bucket(user)

        _inv_add(inv_items, str(key), 1)

        payload = _build_inventory_payload(user)
        return {
            "ok": True,
            "message": "Unequipped",
            "unequippedSlot": slot,
            "unequippedKey": str(key),
            **payload,
        }

    resp = await with_user(uid, mut, reason="webapp_inventory_unequip")
    if not resp.get("ok"):
        return web.json_response(resp, status=400)
    return web.json_response(resp)

async def webapp_equipped_state_legacy(request: web.Request):
    try:
        body = await request.json() if request.can_read_body else {}
        if not isinstance(body, dict):
            body = {}
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "error": reason}, status=401)

    uid = str(tg_user["id"])

    user = await read_user(uid)
    if not isinstance(user, dict):
        return web.json_response({"ok": False, "error": "no_user"}, status=404)

    # na kopii moÄąÄ˝emy bezpiecznie dopiĂ„â€¦Ă„â€ˇ strukturĂ„â„˘
    user["uid"] = uid
    user["id"] = uid
    user["user_id"] = uid

    eq = user.get("equipment")
    if not isinstance(eq, dict):
        user["equipment"] = {}

    try:
        initialize_equipment(user)
    except Exception:
        pass

    state = build_equipped_state(user)
    bonuses = get_total_equipment_bonus(user)

    return web.json_response({
        "ok": True,
        "data": {
            "equipped": state,
            "bonuses": bonuses,
            "slots": EQUIPMENT_SLOTS,
            "level": user.get("level", 1),
        }
    })


# === /webapp/inventory/upgrade ===
async def webapp_inventory_upgrade(request: web.Request):
    try:
        body = await request.json() if request.can_read_body else {}
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    slot = str(body.get("slot") or "").strip().lower()
    if not slot:
        return web.json_response({"ok": False, "reason": "no_slot"}, status=400)

    uid = str(tg_user["id"])
    dbg = bool(body.get("dbg"))

    def mut(user: dict):
        # waÄąÄ˝ne dla ledger spend / korelacji
        user["id"] = uid
        user["uid"] = uid
        user["user_id"] = uid

        res = forge_upgrade_equipped_core(
            user,
            slot,
            chosen_stats=None,
            ref={"module": "upgrade", "action": "webapp_inventory_upgrade", "slot": slot},
            note="upgrade_cost",
        )

        if not res.get("ok"):
            r = res.get("reason")
            if r == "at_cap":
                cap = res.get("cap")
                res["message"] = f"Already Ă˘Ââ€¦{cap}"
            elif r == "not_enough_materials":
                cost = res.get("cost") or {}
                res["message"] = (
                    "Not enough materials!\n"
                    f"Need {int(cost.get('scrap',0))} scrap, {int(cost.get('bones',0))} bones, {int(cost.get('rune_dust',0))} dust"
                )
            # zwracamy res Ă˘â‚¬â€ś bez save_data, with_user zapisze tylko jeÄąâ€şli nie zrobisz tu exception
            return {"ok": False, **res}

        new_level = int(res.get("newLevel", 0) or 0)
        from tutorial_state import complete_tutorial_step
        complete_tutorial_step(user, "forge_upgrade_used", now=int(time.time()))
        payload = {
            "ok": True,
            "message": f"Upgraded to Ă˘Ââ€¦{new_level}!",
            **_build_inventory_payload(user),
        }

        if dbg:
            payload["_dbg"] = {
                "slot": slot,
                "equippedKey": (user.get("equipment") or {}).get(slot),
            }

        return payload

    resp = await with_user(uid, mut, reason="webapp_inventory_upgrade")
    if not resp.get("ok"):
        return web.json_response(resp, status=400)
    return web.json_response(resp)

# === PNG: postaĂ„â€ˇ Ă˘â‚¬â€ś uÄąÄ˝ywamy Twojej funkcji z equipment.py ===
async def character_image_handler(request: web.Request):
    perf_t0 = time.perf_counter()
    uid, user, data_all, body = await _get_user_from_request(request)
    cache_key = f"{uid}:{_character_image_signature(user)}"
    body_png = _cache_get(_CHARACTER_IMAGE_CACHE, cache_key, _CHARACTER_IMAGE_CACHE_TTL_SEC)
    cache_hit = body_png is not None

    if body_png is None:
        # show_equipped_image z equipment.py zwraca BytesIO z PNG
        buf = show_equipped_image(uid)
        buf.seek(0)
        body_png = buf.read()
        _cache_put(_CHARACTER_IMAGE_CACHE, cache_key, body_png, prefix=f"{uid}:")

    try:
        return web.Response(body=body_png, content_type="image/png")
    finally:
        _perf_log("character_image_handler", perf_t0, cache_hit=cache_hit, size=len(body_png or b""))


async def webapp_howlboard_state(request: web.Request):
    uid, user, data_all, body = await _get_user_from_request(request)
    now = int(time.time())
    await finalize_pending_influence_weekly_rewards(now=now)
    sort_by = normalize_howlboard_sort(
        body.get("sort")
        or body.get("sort_by")
        or request.query.get("sort")
        or request.query.get("sort_by")
    )
    payload = build_howlboard_payload(sort_by=sort_by, now=now)
    return web.json_response({"ok": True, **payload})


async def webapp_howlboard_image(request: web.Request):
    uid, user, data_all, body = await _get_user_from_request(request)
    now = int(time.time())
    await finalize_pending_influence_weekly_rewards(now=now)
    sort_by = normalize_howlboard_sort(
        body.get("sort")
        or body.get("sort_by")
        or request.query.get("sort")
        or request.query.get("sort_by")
    )
    sort_by, buf = render_howlboard_image(sort_by=sort_by)
    buf.seek(0)
    return web.Response(
        body=buf.read(),
        content_type="image/png",
        headers={"Cache-Control": "no-store"},
    )


# === PNG: karta itemu Ă˘â‚¬â€ś uÄąÄ˝ywamy Twojej funkcji z equipment.py ===
async def item_card_handler(request: web.Request):
    perf_t0 = time.perf_counter()
    uid, user, data_all, body = await _get_user_from_request(request)

    # akceptuj kilka nazw parametru, ÄąÄ˝eby byÄąâ€šo wygodniej z frontu:
    raw_key = (
        body.get("item")
        or body.get("key")
        or body.get("item_key")
        or request.query.get("item")
        or request.query.get("key")
        or request.query.get("item_key")
    )
    if not raw_key:
        raise web.HTTPBadRequest(reason="missing_item")

    item_key = str(raw_key)
    if item_key not in ALL_ITEMS:
        raise web.HTTPNotFound(reason="unknown_item")

    item_data = ALL_ITEMS[item_key]

    # jeÄąâ€şli gracz ma ten item w equipment_data, bierzemy jego realny level + stat_bonus
    ed = user.get("equipment_data", {}).get(item_key, {})
    level = int(ed.get("level", 1))
    stats = (ed.get("stat_bonus") or item_data.get("stat_bonus") or {}).copy()

    cache_key = _item_card_signature(item_key, level, stats)
    body_png = _cache_get(_ITEM_CARD_CACHE, cache_key, _ITEM_CARD_CACHE_TTL_SEC)
    cache_hit = body_png is not None

    if body_png is None:
        buf = create_item_card(item_key, item_data, level, stats)
        buf.seek(0)
        body_png = buf.read()
        _cache_put(_ITEM_CARD_CACHE, cache_key, body_png)

    try:
        return web.Response(body=body_png, content_type="image/png")
    finally:
        _perf_log("item_card_handler", perf_t0, cache_hit=cache_hit, item=item_key, size=len(body_png or b""))

# === FORGE HUB (Vault / Worksmith) ===

from typing import Any, Dict, List

def build_forge_payload(u: dict, *, building_id: str = "forge") -> dict:
    return build_forge_payload_core(u, building_id=building_id)


def _upgrade_equipped_core(user: dict, slot: str, *, ref: dict) -> dict:
    key = (user.get("equipment") or {}).get(slot)
    if not key:
        return {"ok": False, "reason": "nothing_equipped"}

    item = ALL_ITEMS.get(key)
    if not item:
        return {"ok": False, "reason": "unknown_item"}

    ed = user.setdefault("equipment_data", {}).setdefault(
        key,
        {"level": 1, "stat_bonus": (item.get("stat_bonus") or {}).copy()}
    )

    level = int(ed.get("level", 1))
    cap = _get_star_cap(item)
    if level >= cap:
        return {"ok": False, "reason": "at_cap", "cap": cap}

    cost = _calc_upgrade_cost_materials(key, level)
    if not _has_materials(user, **cost):
        return {"ok": False, "reason": "not_enough_materials", "cost": cost}

    _spend_materials(user, **cost, ref=ref)
    ed["level"] = level + 1

    stats = ed.get("stat_bonus") or {}
    if stats:
        n = random.choice([1, 2])
        chosen = random.sample(list(stats.keys()), min(n, len(stats)))
        for s in chosen:
            ed["stat_bonus"][s] = int(ed["stat_bonus"].get(s, 0)) + 1

    return {
        "ok": True,
        "key": key,
        "slot": slot,
        "newLevel": level + 1,
        "cap": cap,
        "cost": cost,
        "message": f"Upgraded to Ă˘Ââ€¦{level + 1}!"
    }


async def webapp_forge_state(request):
    req_t0 = time.perf_counter()
    try:
        body = await request.json()
    except Exception:
        body = {}

    step_t0 = time.perf_counter()
    init = _extract_init_data(request, body)
    _craft_perf("-", "forge_state_extract_init_data", step_t0)
    step_t0 = time.perf_counter()
    ok, reason, tg_user = _verify_init_data(init)
    uid = str(tg_user.get("id") or "") if isinstance(tg_user, dict) else ""
    _craft_perf(uid or "-", "forge_state_verify_init_data", step_t0)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "NO_UID"}, status=401)

    bid = str(body.get("buildingId") or "forge").strip()
    dbg = bool(body.get("dbg"))

    # READ snapshot (bez zapisu)
    step_t0 = time.perf_counter()
    u = await read_user(uid)
    _craft_perf(uid, "forge_state_read_user", step_t0)

    # jeÄąâ€şli user nie istnieje (nowy) -> utwÄ‚Ĺ‚rz atomowo
    if not isinstance(u, dict):
        username = tg_user.get("username") or ""

        def _create(u2: dict):
            u2.setdefault("id", uid)
            u2.setdefault("uid", uid)
            u2.setdefault("user_id", uid)
            if username and not u2.get("username"):
                u2["username"] = username
            return u2

        step_t0 = time.perf_counter()
        u = await with_user(uid, _create, reason="webapp:forge_state:create")
        _craft_perf(uid, "forge_state_create_user", step_t0)

    await _maybe_mark_tutorial_step(uid, u, "forge_seen", reason="tutorial:forge_seen")

    # Ă˘Ĺ›â€¦ NIE MUTUJEMY usera poza lockiem Ă˘â‚¬â€ť robimy view copy do payloadu
    try:
        import copy
        u_view = copy.deepcopy(u)
    except Exception:
        u_view = dict(u)

    # optional: ledger apply (best-effort) Ă˘â‚¬â€ť na kopii
    try:
        from ledger_lite import ledger_apply_to_user
        ledger_apply_to_user(u_view)
    except Exception:
        pass

    step_t0 = time.perf_counter()
    payload = build_forge_payload(u_view, building_id=bid)
    _craft_perf(uid, "forge_state_build_payload", step_t0)

    resp = {"ok": True, "data": payload}
    if dbg:
        resp["dbg"] = {"buildingId": bid}

    # kompatybilnoÄąâ€şĂ„â€ˇ: czĂ„â„˘Äąâ€şĂ„â€ˇ frontu moÄąÄ˝e czytaĂ„â€ˇ payload w top-level
    if isinstance(payload, dict):
        for k, v in payload.items():
            if k not in resp:
                resp[k] = v

    _craft_perf(uid, "forge_state_total", req_t0)
    return web.json_response(resp)


async def webapp_forge_upgrade(request: web.Request):
    try:
        body = await request.json() if request.can_read_body else {}
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    from config import UPGRADE_COST_MODEL
    mode = (UPGRADE_COST_MODEL or "materials").strip().lower()
    if mode != "materials":
        return web.json_response({"ok": False, "reason": "legacy_upgrade_disabled"}, status=400)

    uid = str(tg_user["id"])

    slot = str(body.get("slot") or "").strip().lower()
    if not slot:
        return web.json_response({"ok": False, "reason": "no_slot"}, status=400)

    bid = str(body.get("buildingId") or "forge").strip()
    dbg = bool(body.get("dbg"))

    # run_id (jeÄąâ€şli masz _get_run_id w pliku, uÄąÄ˝yjemy go)
    try:
        run_id = body.get("run_id") or _get_run_id(body, "forge_upg", uid, extra=f"{bid}:{slot}")
    except Exception:
        run_id = body.get("run_id") or f"forge_upg:{uid}:{bid}:{slot}"

    out = {"ok": False, "reason": "UNKNOWN"}

    def mutator(u: dict):
        nonlocal out

        from tutorial_state import complete_tutorial_step

        if not isinstance(u, dict):
            out = {"ok": False, "reason": "no_user"}
            return

        # spÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ uid
        u.setdefault("uid", uid)
        u.setdefault("id", uid)
        u.setdefault("user_id", uid)

        # (opcjonalnie) jeÄąâ€şli ktoÄąâ€ş ma stare id
        if str(u.get("id") or "") != uid:
            u["id"] = uid

        res = forge_upgrade_equipped_core(
            u,
            slot,
            chosen_stats=None,
            ref={
                "module": "forge",
                "action": "webapp_upgrade",
                "buildingId": bid,
                "slot": slot,
                "run_id": run_id,
            },
            note="upgrade_cost",
        )

        if not isinstance(res, dict) or not res.get("ok"):
            err = {"ok": False}
            if isinstance(res, dict):
                err.update(res)
            else:
                err["reason"] = "bad_upgrade_result"

            if dbg:
                err["dbg"] = {
                    "slot": slot,
                    "equippedKey": (u.get("equipment") or {}).get(slot),
                    "buildingId": bid,
                    "run_id": run_id,
                }

            out = err
            return

        payload = build_forge_payload(u, building_id=bid)
        complete_tutorial_step(u, "forge_upgrade_used", now=int(time.time()))

        out = {
            "ok": True,
            "result": res,
            "data": payload,
        }

        if dbg:
            out["dbg"] = {
                "slot": slot,
                "equippedKey": (u.get("equipment") or {}).get(slot),
                "buildingId": bid,
                "run_id": run_id,
            }

    # Ă˘Ĺ›â€¦ Jedyna poprawna Äąâ€şcieÄąÄ˝ka zapisu w WebApp (LOCK + atomic save)
    await with_user(uid, mutator, reason=f"webapp_forge_upgrade:{run_id}")

    if not out.get("ok"):
        # zachowujemy 400 jak wczeÄąâ€şniej (front moÄąÄ˝e tego oczekiwaĂ„â€ˇ)
        return web.json_response(out, status=400)

    return web.json_response(out)


import traceback

def _normalize_forge_craft_error(err, *, fallback_reason: str = "craft_failed") -> tuple[int, dict]:
    raw = dict(err or {}) if isinstance(err, dict) else {}
    raw_reason = str(raw.get("reason") or fallback_reason or "craft_failed").strip().lower()
    code = str(raw.get("code") or "").strip().upper()

    if not code:
        if raw_reason in {"bad_slot", "no_slot", "bad_recipe"}:
            code = "BAD_RECIPE"
        elif raw_reason in {"not_enough_shards", "not_enough_materials"}:
            code = "NOT_ENOUGH_MATERIALS"
        elif raw_reason in {"no_pool", "unknown_item", "bad_item"}:
            code = "BAD_ITEM"
        else:
            code = "CRAFT_FAILED"

    status = 409 if code == "NOT_ENOUGH_MATERIALS" else 400
    out = dict(raw)
    out["ok"] = False
    out["reason"] = code
    out.setdefault("detail", raw_reason)
    return status, out

async def webapp_forge_craft(request: web.Request):
    req_t0 = time.perf_counter()
    try:
        body = await request.json()
        if not isinstance(body, dict):
            body = {}
    except Exception:
        return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

    step_t0 = time.perf_counter()
    init = _extract_init_data(request, body)
    _craft_perf("-", "forge_craft_extract_init_data", step_t0)
    step_t0 = time.perf_counter()
    ok, reason, tg_user = _verify_init_data(init)
    uid = str(tg_user.get("id") or "") if ok and isinstance(tg_user, dict) else ""
    _craft_perf(uid or "-", "forge_craft_verify_init_data", step_t0)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user["id"])
    bid = str(body.get("buildingId") or "forge").strip()
    dbg = bool(body.get("dbg"))

    # --- slot sanitize: "armor (11)" / "armor_shards" -> "armor" ---
    slot_raw = str(body.get("slot") or "").strip().lower()
    slot = slot_raw
    if "(" in slot:
        slot = slot.split("(", 1)[0].strip()
    if " " in slot:
        slot = slot.split(" ", 1)[0].strip()
    if slot.endswith("_shards"):
        slot = slot[:-7].strip()

    def _to_int(x, default):
        try:
            return int(x)
        except Exception:
            return default

    count  = max(1, min(50, _to_int(body.get("count"), 1)))
    refine = max(0, min(5,  _to_int(body.get("refine"), 0)))

    if not slot:
        status, out = _normalize_forge_craft_error({"reason": "no_slot"})
        return web.json_response(out, status=status)

    valid_slots = set(SELECTOR_SHARD_SLOTS or [])
    if valid_slots and slot not in valid_slots:
        status, out = _normalize_forge_craft_error({"reason": "bad_slot", "slot": slot, "slot_raw": slot_raw})
        return web.json_response(out, status=status)

    # run_id (idempotency) Ă˘â‚¬â€ť MUST be stable for same action
    run_id = None
    try:
        run_id = body.get("run_id") or _get_run_id(body, "forge:craft", uid, extra=f"{bid}:{slot}:{count}:{refine}")
    except Exception:
        run_id = body.get("run_id") or None

    ref = {
        "type": "forge_craft",
        "buildingId": bid,
        "slot": slot,
        "slot_raw": slot_raw,
        "refine": refine,
        "count": count,
    }
    if run_id:
        ref["run_id"] = run_id

    # wynik mutacji
    res_holder = {"res": None, "err": None}

    def mutator(u: dict):
        from tutorial_state import complete_tutorial_step

        # u jest dictem usera (pod lockiem)
        if not isinstance(u, dict):
            res_holder["err"] = {"ok": False, "reason": "no_user"}
            return

        # spÄ‚Ĺ‚jnoÄąâ€şĂ„â€ˇ uid
        u.setdefault("uid", uid)
        u.setdefault("id", uid)
        u.setdefault("user_id", uid)

        # sync (safe)
        try:
            initialize_equipment(u)
        except Exception:
            pass
        try:
            _sync_common_balances(u)
        except Exception:
            pass

        # Craft core (ledger-truth uid-first + inventory-safe + run_id idempotency)
        try:
            try:
                r = forge_craft_shards(
                    uid, u,
                    slot=slot, count=count, refine=refine, building_id=bid,
                    ref=ref,
                    run_id=run_id,
                )
            except TypeError:
                # older signature fallback
                r = forge_craft_shards(
                    uid, u,
                    slot=slot, count=count, refine=refine, building_id=bid,
                    ref=ref,
                )
            if isinstance(r, dict) and r.get("ok"):
                try:
                    complete_tutorial_step(u, "forge_craft_used", now=int(time.time()))
                except Exception:
                    _LOG.warning(
                        "Forge craft tutorial hook failed uid=%s slot=%s run_id=%s",
                        uid,
                        slot,
                        run_id or "-",
                        exc_info=True,
                    )
            res_holder["res"] = r
        except Exception as e:
            _LOG.exception(
                "Forge craft failed uid=%s slot=%s run_id=%s building_id=%s count=%s refine=%s",
                uid,
                slot,
                run_id or "-",
                bid,
                count,
                refine,
            )
            res_holder["err"] = {"ok": False, "reason": "craft_exception", "detail": str(e)}

    # Ă˘Ĺ›â€¦ lock + atomic save
    step_t0 = time.perf_counter()
    await with_user(uid, mutator, reason=f"webapp:forge_craft:{run_id or (bid+':'+slot)}")
    _craft_perf(uid, "forge_craft_with_user", step_t0)

    # po mutacji bierzemy Äąâ€şwieÄąÄ˝y snapshot do payloadu (bez mutowania bez locka)
    step_t0 = time.perf_counter()
    u_after = await read_user(uid)
    _craft_perf(uid, "forge_craft_read_user_after", step_t0)
    if not isinstance(u_after, dict):
        return web.json_response({"ok": False, "reason": "no_user_after"}, status=500)

    try:
        import copy
        u_view = copy.deepcopy(u_after)
    except Exception:
        u_view = dict(u_after)

    try:
        from ledger_lite import ledger_apply_to_user
        ledger_apply_to_user(u_view)
    except Exception:
        pass

    step_t0 = time.perf_counter()
    payload = build_forge_payload(u_view, building_id=bid)
    _craft_perf(uid, "forge_craft_build_payload", step_t0)

    # obsÄąâ€šuga errora z mutatora
    if res_holder["err"]:
        status, out = _normalize_forge_craft_error(res_holder["err"], fallback_reason="craft_exception")
        _LOG.warning(
            "[CRAFT_PERF] uid=%s step=forge_craft_error ms=%.1f err_type=%s",
            uid,
            _perf_ms(req_t0),
            str(out.get("reason") or "unknown"),
        )
        _craft_perf(uid, "forge_craft_total", req_t0)
        if dbg:
            out.setdefault("dbg", {})
            out["dbg"].update({"run_id": run_id, "buildingId": bid, "slot": slot, "count": count, "refine": refine})
        return web.json_response({**out, "data": payload}, status=status)

    res = res_holder["res"]

    # FAIL
    if not isinstance(res, dict) or not res.get("ok"):
        status, out = _normalize_forge_craft_error(
            res if isinstance(res, dict) else {"reason": "craft_failed"},
            fallback_reason="craft_failed",
        )

        if dbg:
            out.setdefault("dbg", {})
            out["dbg"].update({"run_id": run_id, "buildingId": bid, "slot": slot, "count": count, "refine": refine})

        _craft_perf(uid, "forge_craft_total", req_t0)
        return web.json_response({**out, "data": payload}, status=status)

    # OK
    made_items = list(res.get("made") or [])
    made_keys = [x.get("key") for x in made_items if isinstance(x, dict)]

    try:
        from world_feed import try_append_world_event, player_display_name, user_faction_key, faction_code_for

        rarity_rank = {
            "common": 1,
            "uncommon": 2,
            "rare": 3,
            "epic": 4,
            "legendary": 5,
            "mythic": 6,
            "apex": 7,
        }
        top_item = None
        top_rank = -1
        for made in made_items:
            if not isinstance(made, dict):
                continue
            rarity = str(made.get("rarity") or "").strip().lower()
            rank = int(rarity_rank.get(rarity, 0))
            if rank > top_rank:
                top_rank = rank
                top_item = made

        res_run_id = str(res.get("run_id") or run_id or "").strip()
        wf_faction = user_faction_key(u_after)
        craft_count = len(made_items) or int(count or 1)
        dedupe_suffix = res_run_id or f"{bid}:{slot}:{count}:{refine}:{','.join([str(k or '') for k in made_keys[:5]])}"
        extra = {
            "slot": slot,
            "count": int(craft_count or 1),
            "refine": int(refine or 0),
            "source": "forge_shards",
            "buildingId": bid,
        }
        if isinstance(top_item, dict):
            extra.update({
                "item_key": str(top_item.get("key") or ""),
                "item_name": str(top_item.get("name") or ""),
                "rarity": str(top_item.get("rarity") or "").strip().lower(),
            })

        try_append_world_event(
            "shard_craft_success",
            player_id=uid,
            player_name=player_display_name(u_after, uid),
            faction=wf_faction,
            faction_code=faction_code_for(wf_faction),
            dedupe_key=f"shard_craft_success:{uid}:{dedupe_suffix}",
            extra=extra,
        )
    except Exception:
        pass

    _craft_perf(uid, "forge_craft_total", req_t0)
    return web.json_response({
        "ok": True,
        "message": res.get("message"),
        "result": {**res, "made": made_items, "madeKeys": made_keys},
        "made": made_items,
        "madeKeys": made_keys,
        "data": payload,
    })

# === /webapp/inventory/salvage_dupes ===
async def webapp_inventory_salvage_dupes(request: web.Request):
    try:
        try:
            body = await request.json()
        except Exception:
            return web.json_response({"ok": False, "reason": "bad_json"}, status=400)

        # --- verify init_data ---
        init = _extract_init_data(request, body)
        ok, reason, tg_user = _verify_init_data(init)
        if not ok:
            return web.json_response({"ok": False, "reason": reason}, status=401)

        uid = str(tg_user["id"])

        def _to_int(x, default):
            try:
                return int(x)
            except Exception:
                return default

        keep = max(0, min(10, _to_int(body.get("keep"), 1)))
        rarity_max = str(body.get("rarityMax") or "uncommon").strip().lower()

        RARITY_ORDER = {"common": 1, "uncommon": 2, "rare": 3, "epic": 4, "legendary": 5, "mythic": 6}
        rmax_val = RARITY_ORDER.get(rarity_max, 2)

        # --- run_id (idempotency) ---
        try:
            run_id = _get_run_id(body, "inv:salvage_dupes", uid, extra=f"keep={keep}:rmax={rarity_max}")
        except Exception:
            run_id = None

        def mut(u: dict):
            u.setdefault("uid", uid)
            u.setdefault("id", uid)
            u.setdefault("user_id", uid)

            from items import ALL_ITEMS
            from inventory import _ledger_grant_materials
            from tutorial_state import complete_tutorial_step

            try:
                initialize_equipment(u)
            except Exception:
                pass
            try:
                _sync_common_balances(u)
            except Exception:
                pass

            inv = u.get("inventory") or {}
            if not isinstance(inv, dict):
                inv = {}
                u["inventory"] = inv

            locks = u.get("inv_locks") or u.get("locks") or {}
            if not isinstance(locks, dict):
                locks = {}

            SALVAGE_YIELDS = {
                "common":    {"scrap": 2,  "shards": 1,  "rune_dust": 0},
                "uncommon":  {"scrap": 6,  "shards": 2,  "rune_dust": 0},
                "rare":      {"scrap": 14, "shards": 4,  "rune_dust": 1},
                "epic":      {"scrap": 35, "shards": 8,  "rune_dust": 3},
                "legendary": {"scrap": 80, "shards": 16, "rune_dust": 8},
            }

            def _norm_rarity(r: str) -> str:
                r = str(r or "common").strip().lower()
                return r if r in SALVAGE_YIELDS else "common"

            def _norm_slot(slot: str) -> str:
                s = str(slot or "").strip().lower()
                if "(" in s:
                    s = s.split("(", 1)[0].strip()
                if " " in s:
                    s = s.split(" ", 1)[0].strip()
                if s.endswith("_shards"):
                    s = s[:-7].strip()
                return s

            # 1) PLAN (nie ruszamy inv)
            plan_take: list[tuple[str, int]] = []
            salvaged = []
            yielded_assets: dict[str, int] = {}
            shard_by_slot: dict[str, int] = {}
            total_scrap = 0
            total_dust = 0

            processed = 0
            for key, cnt in list(inv.items()):
                processed += 1
                if processed > 5000:
                    break

                if locks.get(key):
                    continue

                try:
                    cnt_i = int(cnt or 0)
                except Exception:
                    cnt_i = 0

                if cnt_i <= keep:
                    continue

                meta = ALL_ITEMS.get(key)
                if not isinstance(meta, dict):
                    continue

                slot = _norm_slot(meta.get("slot"))
                if not slot:
                    continue  # tylko gear

                rarity = _norm_rarity(meta.get("rarity"))
                if RARITY_ORDER.get(rarity, 1) > rmax_val:
                    continue

                take = cnt_i - keep
                if take <= 0:
                    continue

                y = SALVAGE_YIELDS[rarity]

                if y["scrap"] > 0:
                    inc = y["scrap"] * take
                    total_scrap += inc
                    yielded_assets["scrap"] = int(yielded_assets.get("scrap", 0)) + inc

                if y["rune_dust"] > 0:
                    inc = y["rune_dust"] * take
                    total_dust += inc
                    yielded_assets["rune_dust"] = int(yielded_assets.get("rune_dust", 0)) + inc

                if y["shards"] > 0:
                    inc = y["shards"] * take
                    shard_by_slot[slot] = int(shard_by_slot.get(slot, 0)) + inc
                    asset = f"{slot}_shards"
                    yielded_assets[asset] = int(yielded_assets.get(asset, 0)) + inc

                plan_take.append((key, take))
                salvaged.append({"key": key, "count": take, "rarity": rarity, "slot": slot})

            if not salvaged:
                return {
                    "ok": True,
                    "reason": "NO_DUPES",
                    "keep": keep,
                    "rarityMax": rarity_max,
                    "yielded": {},
                    "salvaged": [],
                    "run_id": run_id,
                }

            # 2) LEDGER FIRST
            try:
                _ledger_grant_materials(
                    u,
                    scrap=int(total_scrap),
                    rune_dust=int(total_dust),
                    shards=shard_by_slot,
                    reason="salvage_dupes",
                    run_id=run_id,
                )
            except Exception as e:
                return {"ok": False, "reason": "ledger_error", "detail": str(e), "run_id": run_id, "_status": 500}

            # 3) APPLY inventory po sukcesie ledgeru
            for key, take in plan_take:
                have = int(inv.get(key, 0) or 0)
                remain = have - int(take)
                if remain > 0:
                    inv[key] = remain
                else:
                    inv.pop(key, None)

            out = {
                "ok": True,
                "keep": keep,
                "rarityMax": rarity_max,
                "yielded": yielded_assets,
                "salvaged": salvaged[:200],
                "salvagedTotal": len(salvaged),
                "run_id": run_id,
            }

            try:
                out["data"] = _build_inventory_payload(u)
            except Exception:
                pass

            complete_tutorial_step(u, "inventory_salvage_seen", now=int(time.time()))

            return out

        res = await with_user(uid, mut, reason="inv:salvage_dupes")
        status = int(res.pop("_status", 200))
        return web.json_response(res, status=status)

    except Exception:
        return web.json_response(
            {"ok": False, "reason": "salvage_dupes_exception", "trace": traceback.format_exc()[-1500:]},
            status=500,
        )


# === UPDATES / WHAT'S NEW =====================================================
# Source of truth lives in Alpha-Husky-Site (Netlify). Backend just proxies it and stores "seen" per user.

UPDATES_FEED_URL = os.getenv("UPDATES_FEED_URL", "https://thealphahusky.netlify.app/updates.json")
UPDATES_PAGE_URL = os.getenv("UPDATES_PAGE_URL", "https://thealphahusky.netlify.app/#updates")
UPDATES_CACHE_TTL_SEC = int(os.getenv("UPDATES_CACHE_TTL_SEC", "60"))
UPDATES_MAX_ITEMS = int(os.getenv("UPDATES_MAX_ITEMS", "8"))

_UPDATES_CACHE = {"ts": 0.0, "items": [], "err": ""}


def _updates_stable_id(it: dict) -> str:
    """
    Since your updates.json currently has no numeric 'id',
    we derive a stable id from date+title.
    (Best practice later: add explicit 'id' to each entry.)
    """
    date = str(it.get("date") or "").strip()
    title = str(it.get("title") or "").strip()
    return f"{date}::{title}".strip(":")


def _updates_sort(items: list[dict]) -> list[dict]:
    # date is YYYY-MM-DD Ă˘â€ â€™ string sort works fine
    return sorted(items, key=lambda x: str(x.get("date") or ""), reverse=True)


async def _fetch_updates_items(force: bool = False) -> list[dict]:
    now = time.time()
    if (not force) and _UPDATES_CACHE["items"] and (now - float(_UPDATES_CACHE["ts"]) < UPDATES_CACHE_TTL_SEC):
        return _UPDATES_CACHE["items"]

    err = ""
    items: list[dict] = []

    try:
        timeout = aiohttp.ClientTimeout(total=8)
        async with aiohttp.ClientSession(timeout=timeout) as s:
            async with s.get(UPDATES_FEED_URL) as r:
                raw = await r.text()

        obj = json.loads(raw)

        # You have: [ {..}, {..} ]  (list)
        if isinstance(obj, list):
            src_list = obj
        # If someday you wrap it: {items:[...]} or {updates:[...]}
        elif isinstance(obj, dict):
            cand = obj.get("updates") or obj.get("items") or []
            src_list = cand if isinstance(cand, list) else []
        else:
            src_list = []

        norm: list[dict] = []
        for it in src_list:
            if not isinstance(it, dict):
                continue

            o = dict(it)
            o["id"] = str(o.get("id") or _updates_stable_id(o))

            # normalize fields we expect
            o["date"] = str(o.get("date") or "")
            o["title"] = str(o.get("title") or "")
            o["status"] = str(o.get("status") or "")
            o["text"] = str(o.get("text") or "")

            links = o.get("links") or []
            if not isinstance(links, list):
                links = []
            # keep only dict links
            o["links"] = [x for x in links if isinstance(x, dict)]

            # optional future CTA support (no need to modify your json now)
            # e.g. "cta": {"section":"forge"} / {"section":"skins"} ...
            cta = o.get("cta")
            o["cta"] = cta if isinstance(cta, dict) else None

            norm.append(o)

        items = _updates_sort(norm)[:UPDATES_MAX_ITEMS]

    except Exception as e:
        err = type(e).__name__
        items = []

    _UPDATES_CACHE["ts"] = now
    _UPDATES_CACHE["items"] = items
    _UPDATES_CACHE["err"] = err
    return items


async def webapp_updates_state(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init_data = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    user = await read_user(uid) or {}
    if not isinstance(user, dict):
        user = {}

    items = await _fetch_updates_items(force=False)
    latest_id = str(items[0]["id"]) if items else ""

    seen_id = str(user.get("updates_seen") or "").strip()
    has_new = bool(latest_id and latest_id != seen_id)

    return web.json_response({
        "ok": True,
        "data": {
            "items": items,
            "latestId": latest_id,
            "seenId": seen_id,
            "hasNew": has_new,
            "feedUrl": UPDATES_FEED_URL,
            "pageUrl": UPDATES_PAGE_URL,
            "err": _UPDATES_CACHE.get("err") or ""
        }
    })


async def webapp_updates_ack(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init_data = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid:
        return web.json_response({"ok": False, "reason": "no_user"}, status=404)

    seen_id = str(body.get("seenId") or "").strip()
    if not seen_id:
        return web.json_response({"ok": False, "reason": "missing_seenId"}, status=400)

    def mut(u: dict):
        # jeÄąâ€şli user istnieje w store Ă˘â€ â€™ normalnie update
        # jeÄąâ€şli nie istnieje Ă˘â€ â€™ bezpiecznie tworzymy minimalny rekord
        u.setdefault("id", uid)
        u.setdefault("username", tg_user.get("username") or "")

        u["updates_seen"] = seen_id
        u["updates_seen_ts"] = int(time.time())

        return {"ok": True, "data": {"seenId": seen_id}}

    res = await with_user(uid, mut, reason="updates_ack")
    status = int(res.pop("_status", 200))
    return web.json_response(res, status=status)

# (opcjonalnie na teraz) stuby pod UI:
async def webapp_forge_reforge(request: web.Request):
    return web.json_response({"ok": False, "reason": "NOT_IMPLEMENTED"}, status=501)

async def webapp_forge_fuse(request: web.Request):
    return web.json_response({"ok": False, "reason": "NOT_IMPLEMENTED"}, status=501)

# ===================== REFERRALS (WebApp) =====================

from datetime import datetime

# fallbacki jeÄąâ€şli nie trzymasz tego w config.py
WEBAPP_REF_PREFIX = "ref_"  # zgodne z Twoim parse_start_payload (ref_123 / ref=123)
WEBAPP_REF_DAILY_CAP = 5

WEBAPP_REF_THRESHOLDS = [
    (5,  "ECHO_HOWLER"),
    (8,  "SIGNALCALLER"),
    (15, "ALPHA_HERALD"),
    (25, "PACK_SUMMONER"),
]

WEBAPP_REF_BADGE_KEYS = ["ECHO_HOWLER", "SIGNALCALLER", "ALPHA_HERALD", "PACK_SUMMONER"]


async def build_referrals_payload(u: dict, *, uid: str) -> dict:
    # bot username (masz w config.py)
    try:
        from config import BOT_USERNAME
        bot_username = BOT_USERNAME
    except Exception:
        bot_username = "Alpha_husky_bot"

    ref_code = f"{WEBAPP_REF_PREFIX}{uid}"
    link_bot = f"https://t.me/{bot_username}?start={ref_code}"
    link_app = f"https://t.me/{bot_username}/AlphaHuskyHub?startapp={ref_code}"

    # --- stats ---
    total_rewarded = int(u.get("referrals", 0) or 0)
    loot = int(u.get("loot", 0) or 0)

    # daily counter Ă˘â‚¬â€ś pokazuj spÄ‚Ĺ‚jnie z logikĂ„â€¦ w /start (UTC)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    stored_date = str(u.get("ref_daily_date", "") or "")
    stored_cnt = int(u.get("ref_daily_count", 0) or 0)
    daily_cnt = stored_cnt if stored_date == today else 0

    achievements = u.get("achievements", []) or []
    if not isinstance(achievements, list):
        achievements = []

    # inviter display (data_store)
    invited_by = u.get("invited_by") or None
    inviter = None
    if invited_by:
        try:
            ref_u = await read_user(str(invited_by))
        except Exception:
            ref_u = None

        if isinstance(ref_u, dict):
            inviter_name = ref_u.get("nickname") or ref_u.get("username") or str(invited_by)
            inviter = {"uid": str(invited_by), "name": str(inviter_name)}
        else:
            inviter = {"uid": str(invited_by), "name": str(invited_by)}

    # badge meta (jeÄąâ€şli masz badges.py)
    try:
        from badges import BADGES
    except Exception:
        BADGES = {}

    tiers = []
    next_tier = None
    for n, badge_key in WEBAPP_REF_THRESHOLDS:
        badge = BADGES.get(badge_key) or {}
        achieved = (badge_key in achievements)

        tier = {
            "need": int(n),
            "key": badge_key,
            "achieved": bool(achieved),
            "name": badge.get("name", badge_key),
            "icon": badge.get("icon", "Ä‘ĹşĹąâ€¦"),
            "description": badge.get("description", ""),
        }
        tiers.append(tier)

        if next_tier is None and total_rewarded < n:
            next_tier = {
                "need": int(n),
                "left": int(n - total_rewarded),
                "key": badge_key,
                "name": badge.get("name", badge_key),
                "icon": badge.get("icon", "Ä‘ĹşĹąâ€¦"),
            }

    if next_tier is None:
        # juÄąÄ˝ max tier
        last = tiers[-1] if tiers else {"need": 25, "key": "PACK_SUMMONER", "name": "PACK_SUMMONER", "icon": "Ä‘ĹşĹąâ€¦"}
        next_tier = {
            "need": int(last.get("need", 25)),
            "left": 0,
            "key": last.get("key"),
            "name": last.get("name"),
            "icon": last.get("icon", "Ä‘ĹşĹąâ€¦"),
        }

    return {
        "uid": uid,
        "code": ref_code,
        "linkBot": link_bot,
        "linkApp": link_app,

        "stats": {
            "rewardedInvites": total_rewarded,
            "dailyCount": daily_cnt,
            "dailyCap": WEBAPP_REF_DAILY_CAP,
            "loot": loot,
        },

        "invitedBy": inviter,      # null jeÄąâ€şli brak
        "tiers": tiers,
        "nextTier": next_tier,
    }


async def webapp_referrals_state(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user["id"])

    u = await read_user(uid)
    if not isinstance(u, dict):
        return web.json_response({"ok": False, "reason": "no_user"}, status=404)

    # READ-ONLY: nie poprawiamy u["id"] tutaj
    # jeÄąÄ˝eli chcesz to ustandaryzowaĂ„â€ˇ, rÄ‚Ĺ‚b to tylko w mutacjach (with_user)

    await _maybe_mark_tutorial_step(uid, u, "referral_seen", reason="tutorial:referral_seen")
    payload = await build_referrals_payload(u, uid=uid)
    return web.json_response({"ok": True, "data": payload})

def _public_base_from_request(request: web.Request) -> str:
    proto = request.headers.get("X-Forwarded-Proto") or request.scheme or "https"
    host = request.headers.get("X-Forwarded-Host") or request.headers.get("Host") or request.host
    return f"{proto}://{host}"

def _share_public_base(request: web.Request) -> str:
    return (os.getenv("WEBAPP_PUBLIC_BASE") or "").strip() or _public_base_from_request(request)


def _share_public_urls(request: web.Request, filename: str) -> tuple[str, str]:
    rel = f"/assets/share_cards/{filename}"
    return rel, _share_public_base(request).rstrip("/") + rel


def _share_public_abs(request: web.Request, url_or_path: str) -> str:
    raw = str(url_or_path or "").strip()
    if not raw:
        return ""
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    return _share_public_base(request).rstrip("/") + (raw if raw.startswith("/") else "/" + raw)


def _share_safe_name(name: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,160}", str(name or "")):
        raise ValueError("BAD_FILENAME")
    return str(name)


def _share_render_jpeg_bytes(rgba_image: Image.Image) -> bytes:
    base = Image.new("RGB", rgba_image.size, (9, 13, 25))
    base.paste(rgba_image, mask=rgba_image.getchannel("A"))
    target_max = 4_500_000
    last_bytes = b""
    for quality in (88, 84, 80, 76):
        buf = io.BytesIO()
        base.save(buf, format="JPEG", quality=quality, optimize=True)
        last_bytes = buf.getvalue()
        if len(last_bytes) <= target_max:
            return last_bytes
    return last_bytes


async def webapp_share_card_upload(request: web.Request):
    SHARE_STATIC_DIR.mkdir(parents=True, exist_ok=True)
    init = _extract_init_data(request, {})
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid.isdigit():
        return web.json_response({"ok": False, "reason": "BAD_UID"}, status=400)

    try:
        reader = await request.multipart()
    except Exception:
        return web.json_response({"ok": False, "reason": "BAD_MULTIPART"}, status=400)

    file_bytes = b""
    variant = "hub"
    while True:
        part = await reader.next()
        if part is None:
            break
        if part.name == "variant":
            try:
                variant = (await part.text()).strip().lower()
            except Exception:
                variant = "hub"
        elif part.name == "file":
            file_bytes = await part.read(decode=False)

    if variant not in {"hub", "equipped"}:
        variant = "hub"
    if not file_bytes:
        _LOG.warning("[share] upload no_file uid=%s variant=%s", uid, variant)
        return web.json_response({"ok": False, "reason": "NO_FILE"}, status=400)

    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.load()
    except Exception:
        _LOG.warning("[share] upload bad_image uid=%s variant=%s bytes=%s", uid, variant, len(file_bytes))
        return web.json_response({"ok": False, "reason": "BAD_IMAGE"}, status=400)

    stamp = int(time.time())
    token = secrets.token_hex(6)
    base_name = _share_safe_name(f"share_{uid}_{variant}_{stamp}_{token}")
    png_name = f"{base_name}.png"
    jpg_name = f"{base_name}.jpg"
    png_path = SHARE_STATIC_DIR / png_name
    jpg_path = SHARE_STATIC_DIR / jpg_name

    try:
        png_image = image.convert("RGBA")
        png_image.save(png_path, format="PNG")
        jpg_bytes = _share_render_jpeg_bytes(png_image)
        jpg_path.write_bytes(jpg_bytes)
    except Exception:
        _LOG.warning("[share] upload save_failed uid=%s variant=%s", uid, variant)
        return web.json_response({"ok": False, "reason": "SAVE_FAILED"}, status=500)

    png_rel, png_abs = _share_public_urls(request, png_name)
    jpg_rel, jpg_abs = _share_public_urls(request, jpg_name)
    _LOG.info("[share] upload ok uid=%s variant=%s png=%s jpg_bytes=%s", uid, variant, png_name, jpg_path.stat().st_size if jpg_path.exists() else 0)

    try:
        def _mut_share_card(user: dict):
            from quests import record_quest_event
            record_quest_event(
                user,
                "share_card_generated",
                meta={
                    "source": "webapp/share/card/upload",
                    "event_id": f"share_card:{uid}:{png_name}",
                    "variant": variant,
                },
            )
            return True

        await with_user(uid, _mut_share_card, reason="quest_v2:share_card_generated")
    except Exception:
        pass

    return web.json_response({
        "ok": True,
        "variant": variant,
        "file": png_name,
        "url": png_rel,
        "abs": png_abs,
        "jpg_url": jpg_rel,
        "jpg_abs": jpg_abs,
        "jpg_bytes": jpg_path.stat().st_size if jpg_path.exists() else 0,
    })


async def webapp_share_card_telegram_prepare(request: web.Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    init = _extract_init_data(request, body)
    ok, reason, tg_user = _verify_init_data(init)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user.get("id") or "")
    if not uid.isdigit():
        return web.json_response({"ok": False, "reason": "BAD_UID"}, status=400)

    photo_url = _share_public_abs(request, body.get("photo_url") or body.get("jpg_url") or "")
    if "/assets/share_cards/" not in photo_url:
        _LOG.warning("[share] telegram bad_photo_url uid=%s url=%s", uid, photo_url)
        return web.json_response({"ok": False, "reason": "BAD_PHOTO_URL"}, status=400)

    caption = str(body.get("caption") or "").strip()[:1024]
    result = {
        "type": "photo",
        "id": f"share_{uid}_{int(time.time())}",
        "photo_url": photo_url,
        "thumbnail_url": photo_url,
    }
    if caption:
        result["caption"] = caption
    result["title"] = "Alpha Husky Share Card"

    payload = {
        "user_id": int(uid),
        "result": result,
        "allow_user_chats": True,
        "allow_bot_chats": False,
        "allow_group_chats": True,
        "allow_channel_chats": True,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://api.telegram.org/bot{_get_bot_token()}/savePreparedInlineMessage",
                json=payload,
            ) as resp:
                data = await resp.json(content_type=None)
                if resp.status != 200 or not data.get("ok"):
                    _LOG.warning("[share] telegram prepare_failed uid=%s status=%s reason=%s", uid, resp.status, data.get("description"))
                    return web.json_response(
                        {"ok": False, "reason": data.get("description") or f"TELEGRAM_{resp.status}"},
                        status=502,
                    )
    except Exception:
        _LOG.exception("[share] telegram upstream_fail uid=%s", uid)
        return web.json_response({"ok": False, "reason": "TELEGRAM_UPSTREAM_FAIL"}, status=502)

    result_data = data.get("result") if isinstance(data, dict) else {}
    prepared_id = ""
    if isinstance(result_data, dict):
        prepared_id = str(result_data.get("id") or result_data.get("prepared_message_id") or "").strip()
    elif result_data:
        prepared_id = str(result_data).strip()

    if not prepared_id:
        _LOG.warning("[share] telegram missing_prepared_id uid=%s", uid)
        return web.json_response({"ok": False, "reason": "NO_PREPARED_MESSAGE_ID"}, status=502)

    _LOG.info("[share] telegram prepared uid=%s prepared_id=%s", uid, prepared_id)
    return web.json_response({"ok": True, "prepared_message_id": prepared_id})

async def webapp_arena_last(request: web.Request):
    """
    Zwraca battle_id ostatniej walki Areny dla usera.
    READ-ONLY, datastore-safe.
    """
    uid, u, _data_all, body = await _get_user_from_request(request)

    arena = u.get("arena") if isinstance(u.get("arena"), dict) else {}
    battle_id = arena.get("last_battle_id") or u.get("arena_last_battle_id")  # fallback
    battle_id = str(battle_id or "").strip() or None

    return web.json_response({"ok": True, "battle_id": battle_id})


# --- Arena replay: pet image enrich (Cloudinary) -----------------------------
CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload"
PET_TX = "f_png,q_auto,w_256,c_fit"

# Ă˘Ĺ›â€¦ U Ciebie pets sĂ„â€¦ pod wersjĂ„â€¦ (tak jak link ktÄ‚Ĺ‚ry dziaÄąâ€ša)
# MoÄąÄ˝esz to teÄąÄ˝ trzymaĂ„â€ˇ w ENV jako PET_CLOUD_VER, ale hardcode jest OK na teraz.
PET_CLOUD_VER = (os.getenv("PET_CLOUD_VER") or "v1767699377").strip()  # "v123..." albo ""

_UUID_RE = re.compile(r"^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", re.I)

def _uid_str(x):
    try:
        return str(int(x))
    except Exception:
        return str(x or "").strip()

def _strip_level_suffix(name: str) -> str:
    s = (name or "").strip()
    s = re.sub(r"\s*\(\s*(?:lv|lvl|level)\s*\d+\s*\)\s*$", "", s, flags=re.I)
    s = re.sub(r"\s*(?:lv|lvl|level)\s*\d+\s*$", "", s, flags=re.I)
    s = re.sub(r"\s*\[\s*(?:lv|lvl|level)\s*\d+\s*\]\s*$", "", s, flags=re.I)
    return s.strip()

def _slugify(raw: str) -> str:
    k = (raw or "").strip().lower()
    k = re.sub(r"\.(png|webp|jpg|jpeg)$", "", k, flags=re.I)
    k = re.sub(r"[^a-z0-9 _-]", "", k)
    k = re.sub(r"\s+", " ", k).strip()
    return k

def _pet_public_id_from_name(pet_name: str) -> str:
    """
    Cloudinary u Ciebie: .../v176.../pets/darkhuskypup.png
    Czyli chcemy: darkhuskypup (bez spacji/kresek)
    """
    base = _slugify(_strip_level_suffix(pet_name))
    if not base:
        return ""
    # usuÄąâ€ž spacje/underscore/dash -> "dark husky pup" => "darkhuskypup"
    pid = re.sub(r"[\s_-]+", "", base)
    return pid

def _cloud_pet_url(public_id: str) -> str:
    if not public_id:
        return ""
    # zawsze .png, folder pets
    path = f"pets/{public_id}.png"
    if PET_CLOUD_VER:
        path = f"{PET_CLOUD_VER}/{path}"
    return f"{CLOUD_BASE}/{PET_TX}/{path}"

def _looks_like_uuid(s: str) -> bool:
    try:
        return bool(_UUID_RE.match((s or "").strip()))
    except Exception:
        return False

def _is_bad_uuid_pet_url(url: str) -> bool:
    u = (url or "").strip()
    if not u or "/pets/" not in u:
        return False
    try:
        tail = u.split("/pets/", 1)[1]
        seg = tail.split("/", 1)[0]
        pid = seg.split("?", 1)[0].split("#", 1)[0]
        pid = pid.rsplit(".", 1)[0]
        return _looks_like_uuid(pid)
    except Exception:
        return False

async def webapp_arena_replay(request: web.Request):
    """
    Zwraca stub replay po battle_id jeÄąâ€şli requester jest p1/p2.
    READ-ONLY, datastore-safe.
    + enrich: pet_img/pet_icon (dziaÄąâ€šajĂ„â€¦cy Cloudinary URL z /v.../pets/<slug>.png)
    """
    uid, u, _data_all, body = await _get_user_from_request(request)

    battle_id = str((body or {}).get("battle_id") or (body or {}).get("battleId") or "").strip()
    if not battle_id:
        return web.json_response({"ok": False, "err": "NO_BATTLE_ID"}, status=400)

    replays = u.get("arena_replays") or []
    if not isinstance(replays, list):
        replays = []

    stub = next(
        (r for r in replays if isinstance(r, dict) and str(r.get("battle_id") or "").strip() == battle_id),
        None
    )
    if not stub:
        return web.json_response({"ok": False, "err": "NOT_FOUND"}, status=404)

    p1_uid = _uid_str(stub.get("p1_uid") or (stub.get("p1") or {}).get("uid") or "")
    p2_uid = _uid_str(stub.get("p2_uid") or (stub.get("p2") or {}).get("uid") or "")
    req_uid = _uid_str(uid)

    if req_uid not in (p1_uid, p2_uid):
        return web.json_response({"ok": False, "err": "FORBIDDEN"}, status=403)

    out = dict(stub)
    out["you_are_p1"] = (req_uid == p1_uid)

    want_dbg = bool((body or {}).get("dbg"))

    try:
        from pets import animated_pet_sprite_payload
    except Exception:
        def animated_pet_sprite_payload(_pet_key):
            return {}

    try:
        p1 = out.get("p1") if isinstance(out.get("p1"), dict) else {}
        p2 = out.get("p2") if isinstance(out.get("p2"), dict) else {}

        dbg = {"p1_uid": p1_uid, "p2_uid": p2_uid} if want_dbg else None

        # Ă˘Ĺ›â€¦ wyliczamy pet_img z pet_name (stabilne), a jeÄąâ€şli w danych siedzi stary uuid-url,
        # to NADPISUJEMY (setdefault by tego nie naprawiÄąâ€š).
        for tag, p in (("p1", p1), ("p2", p2)):
            pet_name = str(p.get("pet_name") or p.get("petName") or p.get("name") or "")
            pid = _pet_public_id_from_name(pet_name)
            pet_img_new = _cloud_pet_url(pid)
            pet_key = str(
                p.get("pet_key")
                or p.get("petKey")
                or p.get("pet_public_id")
                or p.get("petPublicId")
                or pid
                or p.get("type")
                or p.get("pet_type")
                or p.get("petType")
                or ""
            ).strip().lower()
            sprite_payload = animated_pet_sprite_payload(pet_key)
            if not sprite_payload and pid and pid != pet_key:
                fallback_sprite_payload = animated_pet_sprite_payload(pid)
                if fallback_sprite_payload:
                    pet_key = pid
                    sprite_payload = fallback_sprite_payload
            if sprite_payload:
                p.update(sprite_payload)

            existing_img = str(p.get("pet_img") or "").strip()
            existing_icon = str(p.get("pet_icon") or "").strip()
            existing_any = existing_img or existing_icon

            should_replace = (not existing_any) or _is_bad_uuid_pet_url(existing_any)

            did_set = False
            if pid and pet_img_new:
                if should_replace:
                    # twardo naprawiamy stare zÄąâ€še uuid-url (albo brak)
                    p["pet_public_id"] = pid
                    p["pet_img"] = pet_img_new
                    p["pet_icon"] = pet_img_new
                    did_set = True
                else:
                    # OK url istnieje Ă˘â€ â€™ tylko uzupeÄąâ€šnij brakujĂ„â€¦ce pole dla frontu
                    if existing_img and not existing_icon:
                        p["pet_icon"] = existing_img
                        did_set = True
                    elif existing_icon and not existing_img:
                        p["pet_img"] = existing_icon
                        did_set = True

            if want_dbg and dbg is not None:
                dbg[f"{tag}_pet_name"] = pet_name
                dbg[f"{tag}_pet_public_id"] = pid
                dbg[f"{tag}_pet_key"] = pet_key
                dbg[f"{tag}_has_sprite"] = bool(sprite_payload)
                dbg[f"{tag}_pet_img_new"] = pet_img_new
                dbg[f"{tag}_existing"] = existing_any
                dbg[f"{tag}_should_replace"] = should_replace
                dbg[f"{tag}_did_set"] = did_set

        out["p1"] = p1
        out["p2"] = p2
        if want_dbg and dbg is not None:
            out["_dbg_pet"] = dbg
    except Exception:
        pass

    return web.json_response({"ok": True, "data": out})        


from urllib.parse import urlparse, unquote, quote

ALLOWED_IMG_PROXY_HOSTS = {"res.cloudinary.com"}
ALLOWED_IMG_PROXY_PREFIX = "/dnjwvxinh/image/upload/"

async def webapp_img_proxy(request: web.Request):
    raw = (request.query.get("u") or "").strip()
    if not raw:
        return web.Response(status=400, text="NO_URL")

    try:
        url = unquote(raw)
        p = urlparse(url)
    except Exception:
        return web.Response(status=400, text="BAD_URL")

    if p.scheme not in ("http", "https"):
        return web.Response(status=400, text="BAD_SCHEME")
    if p.netloc not in ALLOWED_IMG_PROXY_HOSTS:
        return web.Response(status=400, text="BAD_HOST")
    if not (p.path or "").startswith(ALLOWED_IMG_PROXY_PREFIX):
        return web.Response(status=400, text="BAD_PATH")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    return web.Response(status=resp.status, text=f"UPSTREAM_{resp.status}")
                data = await resp.read()
                ct = resp.headers.get("Content-Type") or "image/png"
    except Exception:
        return web.Response(status=502, text="UPSTREAM_FAIL")

    return web.Response(
        body=data,
        headers={
            "Content-Type": ct,
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
        },
    )


async def webapp_badges_state(request):
    try:
        body = await request.json()
    except:
        body = {}
    if not isinstance(body, dict):
        body = {}

    init_data = request.headers.get("Authorization", "").removeprefix("Bearer ")
    if not init_data and body:
        init_data = body.get("init_data", "")
    if not init_data:
        return web.json_response({"ok": False, "reason": "no_init_data"}, status=401)

    ok, reason, tg_user = _verify_init_data(init_data)
    if not ok:
        return web.json_response({"ok": False, "reason": reason}, status=401)

    uid = str(tg_user["id"])
    user = await read_user(uid)
    if not isinstance(user, dict):
        user = {}

    achievements = user.get("achievements", [])
    legacy_badges = user.get("badges", [])
    if not isinstance(achievements, list):
        achievements = []
    if not isinstance(legacy_badges, list):
        legacy_badges = []

    # Badge catalog metadata from the existing badge system.
    from badges import BADGES, canonical_badge_key

    def _norm_badge_key(value):
        return str(value or "").strip().upper()

    def _canon_badge_key(value):
        raw = str(value or "").strip()
        if not raw:
            return ""
        return str(canonical_badge_key(raw) or raw).strip()

    def _label_from_key(value):
        raw = str(value or "").strip()
        if not raw:
            return "Unknown Badge"
        parts = [p for p in raw.replace("-", "_").split("_") if p]
        if not parts:
            return raw
        return " ".join(part.capitalize() for part in parts)

    def _badge_asset_stem(value):
        raw = str(value or "").strip()
        if not raw:
            return ""
        raw = raw.replace("\\", "/").rsplit("/", 1)[-1]
        raw = re.sub(r"\.[a-z0-9]+$", "", raw, flags=re.I)
        raw = raw.replace("-", "_").replace(" ", "_")
        raw = re.sub(r"[^A-Za-z0-9_]", "", raw)
        raw = re.sub(r"_+", "_", raw).strip("_")
        return raw

    badge_cloud_name = "dnjwvxinh"
    badge_cloud_folder = "badges"
    badge_cloud_ver = str(os.getenv("CLOUDINARY_BADGES_VER") or "v1776334663").strip().strip("/")
    if badge_cloud_ver and not badge_cloud_ver.lower().startswith("v"):
        badge_cloud_ver = f"v{badge_cloud_ver}"
    badge_cloud_root = f"https://res.cloudinary.com/{badge_cloud_name}/image/upload"

    def _build_badge_cloud_url(stem):
        stem_clean = _badge_asset_stem(stem)
        if not stem_clean:
            return ""
        path = f"{badge_cloud_folder}/{stem_clean}.png"
        if badge_cloud_ver:
            path = f"{badge_cloud_ver}/{path}"
        return f"{badge_cloud_root}/{path}"

    known_icon_by_norm = getattr(webapp_badges_state, "_known_badge_icons", None)
    if not isinstance(known_icon_by_norm, dict):
        known_icon_by_norm = {}
        for icon_dir in (BASE_DIR.parent / "badges", BASE_DIR / "assets" / "badges"):
            if not icon_dir.exists() or not icon_dir.is_dir():
                continue
            try:
                for item in icon_dir.iterdir():
                    if not item.is_file():
                        continue
                    if item.suffix.lower() not in {".png", ".webp", ".jpg", ".jpeg"}:
                        continue
                    stem = _badge_asset_stem(item.name)
                    norm = stem.lower()
                    if norm and norm not in known_icon_by_norm:
                        known_icon_by_norm[norm] = stem
            except Exception:
                continue
        try:
            setattr(webapp_badges_state, "_known_badge_icons", known_icon_by_norm)
        except Exception:
            pass

    def _badge_icon_candidates(badge_key, badge_meta):
        out = []
        seen = set()

        def _push(value):
            stem = _badge_asset_stem(value)
            if not stem:
                return
            norm = stem.lower()
            if norm in seen:
                return
            seen.add(norm)
            out.append(stem)

        meta = badge_meta if isinstance(badge_meta, dict) else {}
        icon_file = meta.get("icon_file", "")

        _push(icon_file)
        _push(badge_key)
        _push(str(meta.get("name") or "").replace(" ", "_"))
        return out

    def _resolve_badge_asset_url(badge_key, badge_meta, *field_names):
        meta = badge_meta if isinstance(badge_meta, dict) else {}
        for field_name in field_names:
            explicit = str(meta.get(field_name) or "").strip()
            if explicit and (explicit.startswith("/") or re.match(r"^https?://", explicit, flags=re.I)):
                return explicit

        # legacy resolver: Cloudinary URL only when mapped from known icon index
        candidates = _badge_icon_candidates(badge_key, badge_meta)
        if known_icon_by_norm:
            for candidate in candidates:
                known = known_icon_by_norm.get(candidate.lower())
                if not known:
                    continue
                return _build_badge_cloud_url(known)
        return ""

    def _resolve_badge_icon_url(badge_key, badge_meta):
        return _resolve_badge_asset_url(
            badge_key,
            badge_meta,
            "icon_url",
            "iconUrl",
            "image_url",
            "imageUrl",
        )

    def _collect_owned_badges(raw_achievements, raw_legacy_badges):
        owned = {}
        order = []
        achievements_list = raw_achievements if isinstance(raw_achievements, list) else []
        legacy_list = raw_legacy_badges if isinstance(raw_legacy_badges, list) else []
        for raw_key in [*achievements_list, *legacy_list]:
            key = _canon_badge_key(raw_key)
            norm = _norm_badge_key(key)
            if not norm or norm in owned:
                continue
            owned[norm] = key
            order.append(norm)
        return owned, order

    def _sanitize_featured_badges(raw_featured, raw_achievements, raw_legacy_badges, *, max_items=3):
        featured_in = raw_featured if isinstance(raw_featured, list) else []
        owned_map, _ = _collect_owned_badges(raw_achievements, raw_legacy_badges)
        clean = []
        seen = set()
        for raw_key in featured_in:
            key = _canon_badge_key(raw_key)
            norm = _norm_badge_key(key)
            if not norm or norm in seen:
                continue
            owned_key = owned_map.get(norm)
            if not owned_key:
                continue
            clean.append(owned_key)
            seen.add(norm)
            if len(clean) >= max_items:
                break
        return clean

    featured_input_missing = object()
    featured_input = body.get("featured_badges", featured_input_missing)
    featured_input_present = featured_input is not featured_input_missing
    if featured_input_present:
        incoming_featured = featured_input if isinstance(featured_input, list) else []

        def _mut_featured(u):
            clean = _sanitize_featured_badges(
                incoming_featured,
                u.get("achievements", []),
                u.get("badges", []),
            )
            u["featured_badges"] = clean
            return {"featured_badges": clean}

        await with_user(uid, _mut_featured, reason="webapp:badges:featured")
        user = await read_user(uid)
        if not isinstance(user, dict):
            user = {}
        achievements = user.get("achievements", [])
        legacy_badges = user.get("badges", [])
        if not isinstance(achievements, list):
            achievements = []
        if not isinstance(legacy_badges, list):
            legacy_badges = []

    catalog_by_norm = {}
    catalog_order = []
    if isinstance(BADGES, dict):
        for catalog_key, catalog_meta in BADGES.items():
            norm = _norm_badge_key(catalog_key)
            if not norm or norm in catalog_by_norm:
                continue
            meta = catalog_meta if isinstance(catalog_meta, dict) else {}
            entry = {
                "catalog_key": str(catalog_key or "").strip(),
                "meta": meta,
            }
            catalog_by_norm[norm] = entry
            catalog_order.append(norm)

    owned_by_norm = {}
    owned_order = []
    for raw_key in [*achievements, *legacy_badges]:
        key = _canon_badge_key(raw_key)
        norm = _norm_badge_key(key)
        if not norm or norm in owned_by_norm:
            continue
        owned_by_norm[norm] = key
        owned_order.append(norm)

    try:
        support_state = build_support_state_payload(user)
        token_tier = int(((support_state.get("token") or {}).get("tier") or 0))
    except Exception:
        token_tier = 0

    if token_tier > 0 and BELIEVE_SUPPORT_BADGE_KEY:
        key = _canon_badge_key(BELIEVE_SUPPORT_BADGE_KEY)
        norm = _norm_badge_key(key)
        if norm and norm not in owned_by_norm:
            owned_by_norm[norm] = key
            owned_order.append(norm)

    profile = user.get("profile", {})
    active_badge_key = ""
    active_badge_norm = ""
    if isinstance(profile, dict):
        active_badge_norm = _norm_badge_key(_canon_badge_key(profile.get("prestige_title")))
    if active_badge_norm in owned_by_norm:
        active_badge_key = owned_by_norm.get(active_badge_norm, "")

    featured_badges = _sanitize_featured_badges(
        user.get("featured_badges", []),
        achievements,
        legacy_badges,
        max_items=3,
    )

    mastery_owned_total = 0
    wall_badges = []
    for norm in catalog_order:
        catalog_entry = catalog_by_norm.get(norm) or {}
        badge_meta = catalog_entry.get("meta") if isinstance(catalog_entry, dict) else {}
        if not isinstance(badge_meta, dict):
            badge_meta = {}

        catalog_key = str(catalog_entry.get("catalog_key") or "").strip() or norm
        owned_key = str(owned_by_norm.get(norm) or "").strip()
        resolved_key = owned_key or catalog_key
        is_owned = norm in owned_by_norm
        if norm == _norm_badge_key("pioneer_badge") and not is_owned:
            continue

        display_name = badge_meta.get("name", _label_from_key(resolved_key))
        icon = badge_meta.get("icon", "")
        icon_file = badge_meta.get("icon_file", "")
        description = badge_meta.get("description", "Secret badge")
        rarity = badge_meta.get("rarity", "common")
        icon_url = _resolve_badge_icon_url(catalog_key, badge_meta)
        emblem_url = _resolve_badge_asset_url(
            catalog_key,
            badge_meta,
            "emblem_url",
            "emblemUrl",
            "icon_url",
            "iconUrl",
            "image_url",
            "imageUrl",
        )
        frame_url = _resolve_badge_asset_url(
            catalog_key,
            badge_meta,
            "frame_url",
            "frameUrl",
            "glow_url",
            "glowUrl",
        )

        wall_badges.append({
            "key": resolved_key,
            "name": str(display_name or resolved_key),
            "label": str(display_name or resolved_key),
            "owned": bool(is_owned),
            "isUnknown": False,
            "displayable": True,
            "canDisplay": True,
            "icon": str(icon or ""),
            "icon_file": str(icon_file or ""),
            "iconUrl": str(icon_url or ""),
            "icon_url": str(icon_url or ""),
            "emblemUrl": str(emblem_url or ""),
            "emblem_url": str(emblem_url or ""),
            "frameUrl": str(frame_url or ""),
            "frame_url": str(frame_url or ""),
            "description": str(description or "Secret badge"),
            "rarity": str(rarity or "common"),
        })

    # Mastery families are wall-only progression entries, separate from legacy display badges.
    for family_key in MASTERY_FAMILY_ORDER:
        family = str(family_key or "").strip().lower()
        family_spec = MASTERY_FAMILIES.get(family) if isinstance(MASTERY_FAMILIES, dict) else {}
        if not isinstance(family_spec, dict):
            continue

        mastery_state = get_mastery_state(user, family)
        tier = int(mastery_state.get("tier") or 0)
        progress = int(mastery_state.get("progress") or 0)
        tier_name = str(mastery_state.get("tier_name") or "Unranked").strip() or "Unranked"
        next_threshold = mastery_state.get("next_threshold")
        if next_threshold is not None:
            try:
                next_threshold = int(next_threshold)
            except Exception:
                next_threshold = None
        next_tier_name = str(mastery_state.get("next_tier_name") or "").strip()
        is_max_tier = bool(mastery_state.get("max_tier"))
        if is_max_tier:
            next_threshold = None
            next_tier_name = ""

        wall_key = str(family_spec.get("wall_key") or f"MASTERY_{family.upper()}").strip()
        display_name = str(family_spec.get("name") or _label_from_key(wall_key)).strip()
        description = str(family_spec.get("description") or "Mastery family progression.").strip()
        emblem_badge_key = str(family_spec.get("emblem_badge_key") or "").strip()
        emblem_meta = BADGES.get(emblem_badge_key) if emblem_badge_key else {}
        if not isinstance(emblem_meta, dict):
            emblem_meta = {}
        emblem_url = _resolve_badge_icon_url(emblem_badge_key or wall_key, emblem_meta)

        frame_public_id = mastery_frame_public_id_for_tier(tier)
        frame_url = mastery_frame_url_for_tier(tier)
        owned = bool(tier > 0)
        if owned:
            mastery_owned_total += 1

        wall_badges.append({
            "key": wall_key,
            "name": display_name,
            "label": display_name,
            "owned": owned,
            "isUnknown": False,
            "badgeType": "mastery",
            "badge_type": "mastery",
            "displayable": False,
            "canDisplay": False,
            "family": family,
            "tier": tier,
            "tierName": tier_name,
            "tier_name": tier_name,
            "progress": progress,
            "nextThreshold": next_threshold,
            "next_threshold": next_threshold,
            "nextTierName": next_tier_name,
            "next_tier_name": next_tier_name,
            "maxTier": is_max_tier,
            "max_tier": is_max_tier,
            "iconUrl": str(emblem_url or ""),
            "icon_url": str(emblem_url or ""),
            "emblemUrl": str(emblem_url or ""),
            "emblem_url": str(emblem_url or ""),
            "framePublicId": str(frame_public_id or ""),
            "frame_public_id": str(frame_public_id or ""),
            "frameUrl": str(frame_url or ""),
            "frame_url": str(frame_url or ""),
            "description": description,
            "rarity": mastery_rarity_for_tier(tier),
        })

    # Keep legacy-owned badges that are not in the current catalog.
    for norm in owned_order:
        if norm in catalog_by_norm:
            continue
        key = str(owned_by_norm.get(norm) or "").strip()
        badge_meta = BADGES.get(key) if isinstance(BADGES, dict) else {}
        if not isinstance(badge_meta, dict):
            badge_meta = {}
        icon_url = _resolve_badge_icon_url(key, badge_meta)
        emblem_url = _resolve_badge_asset_url(
            key,
            badge_meta,
            "emblem_url",
            "emblemUrl",
            "icon_url",
            "iconUrl",
            "image_url",
            "imageUrl",
        )
        frame_url = _resolve_badge_asset_url(
            key,
            badge_meta,
            "frame_url",
            "frameUrl",
            "glow_url",
            "glowUrl",
        )
        wall_badges.append({
            "key": key,
            "name": _label_from_key(key),
            "label": _label_from_key(key),
            "owned": True,
            "isUnknown": True,
            "displayable": True,
            "canDisplay": True,
            "icon": "",
            "icon_file": "",
            "iconUrl": str(icon_url or ""),
            "icon_url": str(icon_url or ""),
            "emblemUrl": str(emblem_url or ""),
            "emblem_url": str(emblem_url or ""),
            "frameUrl": str(frame_url or ""),
            "frame_url": str(frame_url or ""),
            "description": "Legacy badge from your profile history.",
            "rarity": "common",
        })

    return web.json_response({
        "ok": True,
        "badges": wall_badges,
        "total": len(owned_order) + mastery_owned_total,
        "activeBadgeKey": active_badge_key,
        "featured_badges": featured_badges,
    })

@web.middleware
async def cors_only_allowed(request: web.Request, handler):
    # Preflight: szybka odpowiedÄąĹź + WSZYSTKIE nagÄąâ€šÄ‚Ĺ‚wki CORS
    if request.method == "OPTIONS":
        resp = web.Response(status=204)
    else:
        try:
            resp = await handler(request)
        except web.HTTPException as e:
            # ÄąÄ˝eby takÄąÄ˝e odpowiedzi-bÄąâ€šĂ„â„˘dy miaÄąâ€šy CORS
            resp = e

    origin = request.headers.get("Origin", "")
    if origin in ALLOWED_ORIGINS or origin == "":
        # jeÄąâ€şli origin pusty (niektÄ‚Ĺ‚rzy klienci), moÄąÄ˝esz tymczasowo dopuÄąâ€şciĂ„â€ˇ:
        # origin = "*"  # ale wtedy nie Äąâ€šĂ„â€¦cz z credentials
        resp.headers["Access-Control-Allow-Origin"] = origin or "*"
        resp.headers["Vary"] = "Origin"

    # to jest kluczowe dla fetch + Authorization
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Telegram-Init-Data, X-Dev-Mode, X-Dev-Token, Accept"
    resp.headers["Access-Control-Max-Age"] = "86400"

    # Phase 7 dev readonly companion proof: force ACAO for /dev/readonly/state preflights
    # coming from Capacitor WebView (origin https://localhost). The dev route remains
    # protected by DEV_READONLY_ENABLED + UID allowlist + X-Dev-Mode + token.
    if request.path == "/dev/readonly/state":
        resp.headers["Access-Control-Allow-Origin"] = "*"

    return resp


@web.middleware
async def webapp_perf_middleware(request: web.Request, handler):
    if not _PERF_ENABLED or not request.path.startswith("/webapp/"):
        return await handler(request)

    rid = _next_perf_rid()
    status = 500
    perf_t0 = time.perf_counter()
    try:
        resp = await handler(request)
        status = int(getattr(resp, "status", 200) or 200)
        return resp
    except web.HTTPException as exc:
        status = int(getattr(exc, "status", 500) or 500)
        raise
    finally:
        _LOG.info(
            "[WEBAPP_PERF] rid=%s path=%s total_ms=%.1f status=%s",
            rid,
            request.path,
            _perf_ms(perf_t0),
            status,
        )

def make_state_app():
    app = web.Application(middlewares=[webapp_perf_middleware, cors_only_allowed], client_max_size=12 * 1024 ** 2)

    SHARE_STATIC_DIR.mkdir(parents=True, exist_ok=True)
    try:
        from treasury_cards import GENERATED_CARD_DIR
    except Exception:
        GENERATED_CARD_DIR = None

    app.router.add_static("/assets/share_cards/", path=str(SHARE_STATIC_DIR), show_index=False)
    app.router.add_static("/share_cards/",       path=str(SHARE_STATIC_DIR), show_index=False)
    if GENERATED_CARD_DIR is not None:
        Path(GENERATED_CARD_DIR).mkdir(parents=True, exist_ok=True)

    # Ă˘Ĺ›â€¦ STATS ROUTES
    from webapp_stats import register_stats_routes
    register_stats_routes(app)
    
    # Ă˘Ĺ›â€¦ MISSIONS ROUTES (TU!)
    from webapp_missions import register_missions_routes
    register_missions_routes(app)

    # Ă˘Ĺ›â€¦ FACTIONS ROUTES
    from webapp_factions import register_factions_routes
    register_factions_routes(app)

    # Ă˘Ĺ›â€¦ FACTION HQ ROUTES
    from webapp_faction_hq import register_faction_hq_routes
    register_faction_hq_routes(app)

    # Ă˘Ĺ›â€¦ INFLUENCE ROUTES
    from webapp_influence import register_influence_routes
    register_influence_routes(app)

    # Ă˘Ĺ›â€¦ ORACLE ROUTES
    from webapp_oracle import register_oracle_routes
    register_oracle_routes(app)

    # Ă˘Ĺ›â€¦ BLOODMOON ROUTES
    from webapp_bloodmoon import register_bloodmoon_routes
    register_bloodmoon_routes(app)

    # Ă˘Ĺ›â€¦ BROKEN CONTRACTS ROUTES
    from webapp_broken_contracts import register_broken_contracts_routes
    register_broken_contracts_routes(app)

    # Ă˘Ĺ›â€¦ CTA / HIGHLIGHTS ROUTES
    from webapp_cta import register_cta_routes
    register_cta_routes(app)

    # Ă˘Ĺ›â€¦ MAILBOX ROUTES
    from webapp_mailbox import register_mailbox_routes
    register_mailbox_routes(app)

    # Pack Profile + Pack Signals v1
    from webapp_social import register_social_routes
    register_social_routes(app)

    # Awakening v1 cinematic onboarding
    from webapp_awakening import register_awakening_routes
    register_awakening_routes(app)

    # Oath v1 faction onboarding
    from webapp_oath import register_oath_routes
    register_oath_routes(app)

    # Campaign v1 intro signal
    from webapp_campaign import register_campaign_routes
    register_campaign_routes(app)

    # HOWL Treasury read-only state
    try:
        from webapp_howl_treasury import register_howl_treasury_routes
    except ModuleNotFoundError as e:
        if getattr(e, "name", "") != "webapp_howl_treasury":
            raise
        _LOG.warning("[WEBAPP] webapp_howl_treasury.py missing; treasury routes disabled")
    else:
        register_howl_treasury_routes(app)

    # Ă˘Ĺ›â€¦ SUPPORTER / SOLANA HOLDER ROUTES
    register_supporter_routes(app)

    # HOWL cosmetic payment routes (backend-only, feature-flagged)
    try:
        from webapp_howlpay import register_howlpay_routes
    except ModuleNotFoundError as e:
        if getattr(e, "name", "") != "webapp_howlpay":
            raise
        _LOG.warning("[WEBAPP] webapp_howlpay.py missing; HOWL payment routes disabled")
    else:
        register_howlpay_routes(app)

    app.add_routes([
        web.get("/health", lambda r: web.json_response({"status": "ok"})),
        
        # --- istniejĂ„â€¦ce ---
        web.post("/webapp/state",            state_handler),
        web.post("/webapp/daily/state",      daily_state_handler),
        web.post("/webapp/daily/action",     daily_action_handler),

        # TON WALLET (TonConnect)
        web.post("/webapp/wallet/link",      webapp_wallet_link),
        web.options("/webapp/wallet/link",   lambda r: web.Response(status=204)),
        web.post("/webapp/wallet/unlink",    webapp_wallet_unlink),
        web.options("/webapp/wallet/unlink", lambda r: web.Response(status=204)),

        # SUPPORT (Telegram Stars)
        web.post("/webapp/support/invoice",    webapp_support_invoice),
        web.options("/webapp/support/invoice", lambda r: web.Response(status=204)),

        # PROFILE / AVATAR
        web.post("/webapp/profile",          webapp_profile_get),
        web.post("/webapp/tutorial/state",   webapp_tutorial_state),
        web.post("/webapp/tutorial/action",  webapp_tutorial_action),
        web.options("/webapp/tutorial/action", lambda r: web.Response(status=204)),
        web.post("/webapp/profile/avatar",   webapp_profile_set_avatar),

        # UPDATES / WHAT'S NEW
        web.post("/webapp/updates/state",    webapp_updates_state),
        web.post("/webapp/updates/ack",      webapp_updates_ack),
        
        # P E T S  (NOWE)
        web.post("/webapp/pets",             webapp_pets_state),
        web.post("/webapp/pets/state",       webapp_pets_state),

        # NEW: set active
        web.post("/webapp/pets/set",         webapp_pets_set_active),
        web.options("/webapp/pets/set",      lambda r: web.Response(status=204)),
        web.post("/webapp/pet/feed",         webapp_pets_feed_action),
        web.options("/webapp/pet/feed",      lambda r: web.Response(status=204)),
        web.post("/webapp/pet/pet",          webapp_pets_pet_action),
        web.options("/webapp/pet/pet",       lambda r: web.Response(status=204)),
        web.post("/webapp/pet/stat",         webapp_pets_stat_action),
        web.options("/webapp/pet/stat",      lambda r: web.Response(status=204)),

        # --- MISSIONS (WebApp) ---
        web.options("/webapp/missions/state",  lambda r: web.Response(status=204)),
        web.options("/webapp/missions/action", lambda r: web.Response(status=204)),

        # ADOPTION CENTER
        web.post("/webapp/adopt",            webapp_adopt_state),
        web.post("/webapp/adopt/state",      webapp_adopt_state),
        web.post("/webapp/adopt/buy",        webapp_adopt_buy),

        # FRAMES (cosmetic slot)
        web.post("/webapp/frames",                frames_get_handler),
        web.post("/webapp/frames/list",           frames_get_handler),
        web.get ("/webapp/frames",                frames_get_handler),
        web.options("/webapp/frames",             lambda r: web.Response(status=204)),
        web.post("/webapp/frames/equip",          frames_equip_handler),
        web.post("/webapp/frames/set",            frames_equip_handler),
        web.options("/webapp/frames/equip",       lambda r: web.Response(status=204)),
        web.options("/webapp/frames/set",         lambda r: web.Response(status=204)),
        web.post("/webapp/blue-signal-hunt/claim", blue_signal_hunt_claim_handler),
        web.options("/webapp/blue-signal-hunt/claim", lambda r: web.Response(status=204)),

        # SKINS (list + equip) Ă˘â‚¬â€ť dodajemy aliasy i GET
        web.post("/webapp/skins",                 skins_get_handler),
        web.post("/webapp/skins/list",            skins_get_handler),
        web.get ("/webapp/skins",                 skins_get_handler),
        web.options("/webapp/skins",              lambda r: web.Response(status=204)),

        web.post("/webapp/skins/buy",             skins_buy_handler),
        web.options("/webapp/skins/buy",          lambda r: web.Response(status=204)),

        # NEW: support-stars invoice for premium/support skins
        web.post("/webapp/skins/support_invoice", skins_support_invoice_handler),
        web.options("/webapp/skins/support_invoice", lambda r: web.Response(status=204)),

        web.post("/webapp/skins/flex",            skins_flex_handler),
        web.options("/webapp/skins/flex",         lambda r: web.Response(status=204)),

        web.post("/webapp/skins/equip",           skins_equip_handler),
        web.post("/webapp/skins/set",             skins_equip_handler),
        web.options("/webapp/skins/equip",        lambda r: web.Response(status=204)),

        # Ă˘Ĺ›â€¦ NEW
        web.post("/webapp/skins/claim",           skins_claim_handler),
        web.options("/webapp/skins/claim",        lambda r: web.Response(status=204)),

         # --- ARENA (WebApp) ---
        web.post("/webapp/arena/last",        webapp_arena_last),
        web.post("/webapp/arena/replay",      webapp_arena_replay),
        web.get("/webapp/img",                webapp_img_proxy),

        # --- QUESTS (Mission Board) ---
        web.post("/webapp/quests",           quests_state_handler),
        web.post("/webapp/quests/state",     quests_state_handler),
        web.post("/webapp/quest/state",      quests_state_handler),   # Ă˘â€ Â KLUCZOWY alias dla starego quests.js
        web.post("/webapp/quests/list",      quests_state_handler),   # Ă˘â€ Â dodatkowy na wszelki wypadek

        web.post("/webapp/quest/accept",     quests_accept_handler),
        web.post("/webapp/quests/accept",    quests_accept_handler),

        # INVENTORY
        web.post("/webapp/inventory/state",   webapp_inventory_state),
        web.post("/webapp/inventory/use",     webapp_inventory_use),
        web.post("/webapp/buffs/cancel",      webapp_buffs_cancel),
        web.post("/webapp/inventory/remove",  webapp_inventory_remove),
        web.post("/webapp/inventory/equip",   webapp_inventory_equip),
        web.post("/webapp/inventory/unequip", webapp_inventory_unequip),
        web.post("/webapp/inventory/upgrade", webapp_inventory_upgrade),
        web.post("/webapp/shop/state",  webapp_shop_state),
        web.post("/webapp/shop/buy",    webapp_shop_buy),
        web.post("/webapp/referrals/state",  webapp_referrals_state),
        web.options("/webapp/referrals/state", lambda r: web.Response(status=204)),
        
        # FORGE HUB
        web.post("/webapp/forge/state",   webapp_forge_state),
        web.post("/webapp/forge/upgrade", webapp_forge_upgrade),
        web.post("/webapp/forge/reforge", webapp_forge_reforge),
        web.post("/webapp/forge/fuse",    webapp_forge_fuse),

        # Ă˘Ĺ›â€¦ SALVAGE DUPES (bulk)
        web.post("/webapp/inventory/salvage_dupes", webapp_inventory_salvage_dupes),

        # Ă˘Ĺ›â€¦ CRAFT (SHARDS)
        web.post("/webapp/forge/shards/craft", webapp_forge_craft),  # alias dla starszego frontu
        web.post("/webapp/forge/craft",   webapp_forge_craft),
        
         # EQUIPPED (WebApp character view)
        web.post("/webapp/equipped/state",   webapp_equipped_state),
        web.post("/webapp/equipped/inspect", webapp_equipped_inspect),
        web.post("/webapp/equipped/unequip", webapp_equipped_unequip),
        web.post("/webapp/item/inspect", webapp_item_inspect),

        # EQUIPPED / CHARACTER PANEL
        web.get("/webapp/character/image",      character_image_handler),
        web.post("/webapp/character/image",     character_image_handler),
        web.post("/webapp/howlboard/state",     webapp_howlboard_state),
        web.get("/webapp/howlboard/image",      webapp_howlboard_image),
        web.post("/webapp/howlboard/image",     webapp_howlboard_image),
        web.get("/api/character-image",         character_image_handler),  # stary alias
        web.post("/api/character-image",        character_image_handler),  # stary alias

        web.get("/api/item-card",               item_card_handler),
        web.post("/api/item-card",              item_card_handler),

        web.post("/webapp/quest/complete",    quests_complete_handler),
        web.post("/webapp/quests/complete",   quests_complete_handler),
        web.post("/webapp/quest/claim",       quests_complete_handler),  # Ă˘â€ Â stary format "claim"
        web.post("/webapp/quests/claim",      quests_complete_handler),  # Ă˘â€ Â jeszcze jeden stary alias
    
        # --- Recovery Terminal (Abandoned Wallets) ---
        web.post("/webapp/slots/state",       webapp_slots_state),
        web.post("/webapp/slots/spin",        webapp_slots_spin),


        # --- buildings ---
        web.post("/webapp/den/state",         alpha_den_state_handler),
        web.post("/webapp/den/build/start",   alpha_den_build_start_handler),
        web.post("/webapp/den/build/claim",   alpha_den_build_claim_handler),
        web.post("/webapp/den/pet-training/start", alpha_den_pet_training_start_handler),
        web.post("/webapp/den/pet-training/claim", alpha_den_pet_training_claim_handler),
        web.post("/webapp/den/signal-cache/claim", alpha_den_signal_cache_claim_handler),
        web.post("/webapp/building/state",    building_state_handler),
        web.post("/webapp/building/start",    building_start_handler),
        web.post("/webapp/building/resolve",  building_resolve_handler),
        web.post("/webapp/badges/state",      webapp_badges_state),

        web.post("/webapp/share/card/upload", webapp_share_card_upload),
        web.options("/webapp/share/card/upload", lambda r: web.Response(status=204)),
        web.post("/webapp/share/card/telegram/prepare", webapp_share_card_telegram_prepare),
        web.options("/webapp/share/card/telegram/prepare", lambda r: web.Response(status=204)),
        

        # --- NEW: mostek dla trybu "Open Dashboard" (inline) ---
        web.post("/webapp/action",            action_handler),

        # (opcjonalnie) jawny preflight Ă˘â‚¬â€ť middleware i tak obsÄąâ€šuÄąÄ˝y OPTIONS globalnie
        web.options("/webapp/action",         lambda r: web.Response(status=204)),
    ])

    # =====================================================================
    # DEV READ-ONLY COMPANION POC — TINY GUARDED REGISTRATION ONLY
    # This block must NEVER be enabled in production.
    # The /dev/readonly/state route is completely invisible unless
    # DEV_READONLY_ENABLED=1 (defaults to off / not registered).
    # =====================================================================
    if os.getenv("DEV_READONLY_ENABLED", "0") == "1":
        try:
            from webapp_dev_readonly import register_dev_readonly_routes
            register_dev_readonly_routes(app)
            _LOG.warning("[DEV] /dev/readonly/* routes ENABLED (DEV_READONLY_ENABLED=1) — THIS MUST NEVER BE TURNED ON IN PRODUCTION")
        except Exception as e:
            _LOG.error("[DEV] Failed to register dev readonly routes: %s", e)

    # =====================================================================
    # ALPHA ACCOUNT FOUNDATION (P1.0B) — TINY GUARDED REGISTRATION ONLY
    # Routes are completely invisible unless ALPHA_ACCOUNT_ENABLED=1 (defaults to off).
    # Sub-flags (MOBILE_AUTH_ENABLED, MOBILE_LINK_CODE_ENABLED, TEST_PROVIDER) add further gates.
    # This block follows the exact DEV_READONLY pattern. No other changes to route registration.
    # =====================================================================
    if os.getenv("ALPHA_ACCOUNT_ENABLED", "0") == "1":
        try:
            from webapp_mobile_account import register_mobile_account_routes
            register_mobile_account_routes(app)
            _LOG.warning("[ALPHA-ACCOUNT] mobile account routes ENABLED (ALPHA_ACCOUNT_ENABLED=1) — foundation only, all sub-flags default OFF")
        except Exception as e:
            _LOG.error("[ALPHA-ACCOUNT] Failed to register mobile account routes: %s", e)

    return app


