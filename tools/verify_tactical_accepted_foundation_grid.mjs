import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const foundation = readFileSync("tactical-ops-src/host/foundationProgression.ts", "utf8");
const store = readFileSync("tactical-ops-src/store/battleStore.ts", "utf8");
const ui = readFileSync("tactical-ops-src/ui/Battle.tsx", "utf8");
assert(foundation.includes("foundationRunRules?: { runId: string; rulesContract: RunRulesContract }"), "typed accepted Foundation rules");
assert(foundation.includes("candidate.runId !== state.activeRunId"), "reject detached/stale Foundation contract");
assert(foundation.includes("parseRunRulesContract(candidate.rulesContract)"), "strictly validate backend contract");
assert(store.includes("progression.foundationRunRules?.rulesContract || null"), "Foundation start passes accepted backend rules");
assert(store.includes("selectAcceptedBattleRules(rulesContract)"), "all operation starts use accepted ruleset");
assert(ui.includes('className="t-top t-battle-hud-rail"'), "accepted battle HUD must sit outside board");
assert(!ui.includes('className="t-battle-lab-tag"'), "avoid duplicate grid label obstructing battlefield");
const vite = await createServer({ configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom" });
try {
 const [types, intents] = await Promise.all([
   vite.ssrLoadModule("/tactical-ops-src/combat/types.ts"),
   vite.ssrLoadModule("/tactical-ops-src/combat/intentContract.ts"),
 ]);
 assert.equal(types.GRID_COLS,8, "legacy default must remain backward compatible");
 assert.equal(types.GRID_ROWS,5);
 types.selectAcceptedBattleRules(null);
 assert.equal(types.GRID_COLS,8);
 assert.equal(types.GRID_ROWS,5);
 const contract = {rulesetVersion:"tactical-intent-vnext.0",missionId:"foundation-stage-1",
  missionRevision:1,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1,source:"BACKEND_SNAPSHOT"};
 const accepted = intents.parseRunRulesContract(contract);
 assert(Object.isFrozen(accepted));
 types.selectAcceptedBattleRules(accepted);
 assert.equal(types.GRID_COLS,10);
 assert.equal(types.GRID_ROWS,7);
 types.selectAcceptedBattleRules(null);
 assert.equal(types.GRID_COLS,8);
 assert.equal(types.GRID_ROWS,5);
 assert.throws(()=>intents.parseRunRulesContract({...contract, source:"CLIENT"}),/unsupported/);
 console.log("PASS: 10x7 accepted backend contract, 8x5 legacy fallback, Foundation data boundary");
}finally{await vite.close()}
