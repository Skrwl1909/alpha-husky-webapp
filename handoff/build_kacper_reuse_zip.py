#!/usr/bin/env python3
"""Package the original existing Tactical Ops art for Kacper; no generated assets."""
from __future__ import annotations

import hashlib
import json
import zipfile
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "images/tactical_ops"
FRAME = f"{PREFIX}/presentation/command_deck/frames"
OUTPUT = ROOT / "handoff/ALPHA_HUSKY_TACTICAL_EXISTING_ASSETS_KACPER_20261023.zip"
SOURCE_COMMIT = "458d405e8589663276f1fb0ec946f6db5ff64758"

ACTIONS = [
    "alpha_strike", "alpha_rend", "alpha_howl",
    "cnc_thrust", "cnc_lunge", "cnc_pressure",
    "shadow_sweep", "shadow_mend", "shadow_pack_support",
]
EMBLEMS = [
    "alpha_core", "alpha_vanguard", "alpha_howlkeeper",
    "cnc_core", "cnc_pursuer", "cnc_disruptor",
    "shadow_core", "shadow_sentinel", "shadow_medic",
]
FRAMES = [
    "01_frame_main_panel", "02_frame_sidebar_tall",
    "03_frame_content_panel", "04_frame_square_panel",
    "05_bar_nav_segmented", "06_button_primary", "07_button_secondary",
    "08_bar_status_orb", "09_corner_left_small", "10_corner_left_inner",
    "11_corner_left_large", "12_divider_long_top", "13_badge_chevron",
    "14_badge_small_right", "15_divider_long_bottom", "16_badge_wide_bottom",
]
ASSETS = (
    [f"{PREFIX}/actions/action_{name}.png" for name in ACTIONS]
    + [f"{PREFIX}/emblems/emblem_{name}.png" for name in EMBLEMS]
    + [f"{FRAME}/{name}.png" for name in FRAMES]
    + [
        f"{PREFIX}/presentation/command_deck/command_room.webp",
        f"{PREFIX}/presentation/command_deck/mission_hologram.webp",
        f"{FRAME}/frames_manifest.json",
    ]
)
assert len(ASSETS) == len(set(ASSETS)) == 37

readme = f"""ALPHA HUSKY / TACTICAL OPS / EXISTING REUSABLE ASSETS
KACPER HANDOFF — 2026-10-23

Repository: https://github.com/Skrwl1909/alpha-husky-webapp
Pinned source base commit: {SOURCE_COMMIT}

ORIGINAL REPO FILES (37):
- 9 canonical action icons (Alpha / CNC / Shadow)
- 9 core and discipline emblems
- 16 Command Deck frame PNG assets
- command_room.webp
- mission_hologram.webp
- frames_manifest.json

All original repository-relative paths are kept unchanged.
This is the REUSE package only. The 13 NEW Signal Atlas V1 masters
(ENV-01, ENV-02, CORE-01, 6 new sector crests, 3 frames and trim)
are not included.
Signal Atlas / Sector Focus are code-driven UI screens, not standalone
art images.

See ASSET_INVENTORY.json for full file names, sizes and SHA-256.
GAME FIRST. HISTORY RECORDED HONESTLY.
"""
inventory = {
    "package": "Alpha Husky / Existing Tactical Ops assets for Kacper",
    "source_repository": "Skrwl1909/alpha-husky-webapp",
    "source_base_commit": SOURCE_COMMIT,
    "packaged_date": "2026-10-23",
    "original_file_count": len(ASSETS),
    "groups": {
        "canonical_action_icons": 9,
        "hero_core_discipline_emblems": 9,
        "command_deck_frames": 16,
        "environment_webp": 2,
        "frame_manifest": 1,
    },
    "files": [],
}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=8) as zf:
    for relative in ASSETS:
        path = ROOT / relative
        if not path.is_file():
            raise FileNotFoundError(f"Expected original asset missing: {relative}")
        content = path.read_bytes()
        if relative.endswith(".png") and not content.startswith(b"\\x89PNG\\r\\n\\x1a\\n"):
            raise ValueError(f"Corrupt PNG: {relative}")
        if relative.endswith(".webp") and not (content[:4] == b"RIFF" and content[8:12] == b"WEBP"):
            raise ValueError(f"Corrupt WEBP: {relative}")
        if relative.endswith(".json"):
            json.loads(content)
        inventory["files"].append({
            "path": relative,
            "bytes": len(content),
            "sha256": hashlib.sha256(content).hexdigest(),
        })
        zf.write(path, arcname=relative)
    zf.writestr("HANDOFF_README.txt", readme)
    zf.writestr("ASSET_INVENTORY.json", json.dumps(inventory, indent=2) + "\\n")

with zipfile.ZipFile(OUTPUT) as check:
    names = check.namelist()
    assert len(names) == 39 and len(set(names)) == 39
    assert set(ASSETS).issubset(names)
    assert check.testzip() is None
print(f"PASS: {OUTPUT.relative_to(ROOT)} — 37 original assets, 39 ZIP entries, {OUTPUT.stat().st_size} bytes")
