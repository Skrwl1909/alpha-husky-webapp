"""Generate synthetic combat builds with the real audited backend.
Run offline in the local backend clone, never on production. No player data or ledger transactions.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
from copy import deepcopy
from pathlib import Path
from unittest.mock import patch

BASE = "ca9eec25a2bf6aa34bf550b76ed3c78578a2ab9f"
parser = argparse.ArgumentParser()
parser.add_argument("--backend", required=True)
parser.add_argument("--out", required=True)
args = parser.parse_args()
repo = Path(args.backend).resolve()
out = Path(args.out).resolve()
if str(repo) == "/root/alphagame":
    raise SystemExit("STOP: local test clone only")
head = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
if head != BASE:
    raise SystemExit("STOP: checkout audited merged backend commit " + BASE)
if subprocess.check_output(["git", "-C", str(repo), "status", "--porcelain", "--untracked-files=no"], text=True).strip():
    raise SystemExit("STOP: tracked backend files modified")
if not (repo / "all_items.json").is_file():
    raise SystemExit("STOP: local static all_items.json required")
os.chdir(repo)
sys.path.insert(0, str(repo))
with tempfile.TemporaryDirectory(prefix="alpha-power-lab-") as tmp:
    os.environ.update(AH_DATA_FILE=str(Path(tmp)/"data.json"), AH_BACKUP_DIR=str(Path(tmp)/"backups"), ALPHAGAME_STORAGE=str(Path(tmp)/"ledger"))
    import canonical_combat_snapshot as canonical
    import tactical_combat_profile_v2 as v2
    import tactical_combat_profile_v3 as v3
    import equipment
    from items import ALL_ITEMS
    item_id = "rustfang_fangs"
    item = ALL_ITEMS[item_id]
    assert item["slot"] == "fangs" and item.get("stat_bonus"), "catalog does not match starter fixture"
    starter = {"level":1,"stats":{},"equipment":{"fangs":item_id}}
    upgraded = deepcopy(starter)
    # Exercise real planning code, not the durable purchase path. Funding is synthetic.
    stat = next((key for key in item["stat_bonus"] if key in ("strength","str")), next(iter(item["stat_bonus"])))
    with patch.object(equipment, "_has_materials", return_value=True):
        plan = equipment._plan_forge_upgrade(upgraded, "fangs", chosen_stats=[stat])
    assert plan["ok"] and plan["newLevel"] == 2 and plan["totalStatPointsGained"] == 1, plan
    fixtures = [
        ("fresh", {"level":1,"stats":{}}, None),
        ("starter-fangs", starter, None),
        ("first-forge-star2", upgraded, {"item":item_id,"from":1,"to":2,"gains":plan["statPointGains"],"cost":plan["cost"]}),
        ("respec-baseline", {"level":1,"stats":{"strength":1,"agility":1,"defense":1,"luck":1,"vitality":100,"intelligence":1}}, None),
        ("mid-offense", {"level":45,"stats":{"strength":56,"agility":20,"defense":34,"vitality":96,"intelligence":10,"luck":8}}, None),
        ("mid-guard", {"level":45,"stats":{"strength":34,"agility":20,"defense":56,"vitality":96,"intelligence":10,"luck":8}}, None),
        ("veteran", {"level":187,"stats":{"strength":152,"vitality":130,"defense":103,"agility":32,"luck":17,"intelligence":19}}, None),
    ]
    rows = []
    for name,user,upgrade in fixtures:
        snap = canonical.build_canonical_combat_snapshot(deepcopy(user))
        legacy = v3.build_combat_profile_v3(v2.build_combat_profile_v2(deepcopy(user),["alpha","ally-02","ally-03"],equipped_pet=None))
        rows.append({"name":name,"canonical":snap,"v3":legacy,"upgrade":upgrade})
    before,after=rows[1]["canonical"],rows[2]["canonical"]
    assert sum(after["attributes"]["gear"][k]-before["attributes"]["gear"][k] for k in canonical.ATTRIBUTES)==1, "Forge gain not reflected by canonical source"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"schema":"alpha-meaningful-power-input.v1","backendCommit":head,"builds":rows},indent=2),encoding="utf-8")
print("SYNTHETIC BUILD INPUT READY", out)
