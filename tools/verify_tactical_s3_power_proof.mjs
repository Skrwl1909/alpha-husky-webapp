import assert from "node:assert/strict";
import { createServer } from "vite";
const vite = await createServer({ configFile:false, server:{middlewareMode:true,hmr:false}, appType:"custom" });
try {
  const { savedMasteryProof, savedSidegradeProof } = await vite.ssrLoadModule("/tactical-ops-src/ui/s3PowerProof.ts");
  const pet = {id:"wolf-1",name:"Scout",img:"https://example.com/scout.png"};
  const record = (progress, selected=null) => ({progress, stage: progress>=8?3:progress>=3?2:1, selected, unlockedOptions:progress>=8?["A","B"]:[]});
  const one = (id, r, extra={})=>savedMasteryProof(id,{packMastery:{[id]:r},...extra},pet);
  assert.equal(one("ally-02",record(0)),null,"no stored mastery, no earned effect");
  assert.match(one("ally-02",record(3)).changes.join(" "),/RANGE 3 → 4/);
  assert.match(one("ally-03",record(3)).changes.join(" "),/RADIUS 2 → 3/);
  assert.match(one("pet:wolf-1",record(3)).changes.join(" "),/RECOVER RANGE 1 → 2/);
  assert.equal(one("pet:wrong",record(3)),null,"unowned PET must not claim an effect");
  assert.equal(one("ally-02",record(8)),null,"unselected signature is not active");
  assert.match(one("ally-02",record(8,"A")).changes.join(" "),/COOLDOWN 3 → 2/);
  assert.match(one("ally-02",record(8,"B")).changes.join(" "),/STATUS ATK_DOWN 2T \/ 30% → 3T \/ 30%/);
  assert.match(one("ally-03",record(8,"A")).changes.join(" "),/COOLDOWN 2 → 1/);
  assert.match(one("ally-03",record(8,"B")).changes.join(" "),/HEAL .* → NONE/);
  assert.match(one("pet:wolf-1",record(8,"A")).changes.join(" "),/RANGE 1 → 2/);
  assert.match(one("pet:wolf-1",record(8,"B")).changes.join(" "),/MOVE 4 → 5/);
  assert.equal(savedSidegradeProof("ally-02",{}),null);
  assert.match(savedSidegradeProof("ally-02",{kodaSidegrade:"A"}).changes.join(" "),/MOVE 2 → 3/);
  assert.match(savedSidegradeProof("ally-02",{kodaSidegrade:"B"}).changes.join(" "),/DAMAGE .* → NONE/);
  assert.match(savedSidegradeProof("ally-03",{shadowSidegrade:"A"}).changes.join(" "),/TARGET ALLY_SINGLE → ALLY_AOE/);
  assert.match(savedSidegradeProof("ally-03",{shadowSidegrade:"B"}).changes.join(" "),/HEAL .* → NONE/);
  assert.match(savedSidegradeProof("ally-02",{kodaSidegrade:"B",packMastery:{"ally-02":record(8,"A")}}).changes.join(" "),/STATUS SPD_DOWN NONE → 2T/);
  console.log("PASS S3: saved Pack Mastery + sidegrade executable BEFORE/AFTER proof");
} finally { await vite.close(); }
