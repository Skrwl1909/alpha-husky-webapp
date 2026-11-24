"""Use existing synthetic P2 inputs and the merged server projection. No data store."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
from hashlib import sha256

p=argparse.ArgumentParser()
p.add_argument("--backend",required=True)
p.add_argument("--input",required=True)
p.add_argument("--out",required=True)
a=p.parse_args()
repo=Path(a.backend).resolve()
head=subprocess.check_output(["git","-C",str(repo),"rev-parse","HEAD"],text=True).strip()
assert head=="4243f33da3f64b300ffe2dae472924ffb484fd32",head
assert not subprocess.check_output(["git","-C",str(repo),"status","--porcelain","--untracked-files=no"],text=True).strip()
sys.path.insert(0,str(repo))
from tactical_power_projection_v1 import build_power_projection
from tactical_vnext_contract import build_run_contract
from tactical_combat_profile_v2 import normalize_combat_profile_v2
from tactical_combat_profile_v3 import build_combat_profile_v3
raw=json.loads(Path(a.input).read_text(encoding="utf8"))
assert raw["schema"]=="alpha-meaningful-power-input.v1"
assert raw["backendCommit"]=="ca9eec25a2bf6aa34bf550b76ed3c78578a2ab9f"
engine=repo/"tactical_mission_engine_v1.cjs"
assert sha256(engine.read_bytes()).hexdigest()=="45f1e6c2151fd3b2df7a70dc8567f313976773890ecf3debd98830aa910beb73","production worker hash mismatch"
fixtures=[]
for i,b in enumerate(raw["builds"],1):
    if b["name"] not in ("fresh","first-forge-star2","veteran"):continue
    snap=b["canonical"]
    legacy=b["v3"]
    v2=normalize_combat_profile_v2({"version":2,"mode":"inputs-only","alpha":{"level":snap["sources"]["level"],"base":snap["attributes"]["base"],"gear":snap["attributes"]["gear"]},"pet":None})
    assert build_combat_profile_v3(v2)==legacy
    run={"runId":"mission_verified_v1_"+format(i,"032x"),"missionId":"broken-signal-commander","squadIds":["alpha","ally-02","ally-03"],"combatProfileV2":v2,"combatProfileV3":legacy,"rulesContract":build_run_contract("broken-signal-commander",legacy),"packMastery":{},"kodaSidegrade":"B","shadowSidegrade":"B","routingTrace":False}
    fixtures.append({"name":b["name"],"encounter":run,"projection":build_power_projection(snap,legacy)})
assert len(fixtures)==3
Path(a.out).write_text(json.dumps({"schema":"commander-power-authority-lab.v1","fixtures":fixtures},indent=2),encoding="utf8")
print("FIXTURES READY: three synthetic builds, production worker hash verified")
