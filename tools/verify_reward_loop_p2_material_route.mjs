/** Reward Loop P2 — source-contract regression. Browser QA still required. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const results = readFileSync("tactical-ops-src/ui/FieldOpResults.tsx","utf8");
const decision = readFileSync("tactical-ops-src/ui/battleDecision.ts", "utf8");
const purpose = readFileSync("tactical-ops-src/ui/returnPurpose.ts", "utf8");
const bootstrap = readFileSync("tactical-ops-src/host/bootstrap.ts","utf8");
const bridge = readFileSync("tactical-ops-src/host/bridge.ts","utf8");
const forge = readFileSync("js/forge.js","utf8");

assert.match(results,/receipt\?\.victory/);
assert.match(results,/payout && !pending \? <NextForgeUpgrade/);
assert.doesNotMatch(results,/CHECK SALVAGE IN INVENTORY|row\.source/);
assert.match(results,/receipt\?\.firstUpgradeScrapGranted === 8/);
assert.match(decision,/NEXT: RELAY RECOVERY/);
assert.match(purpose,/firstUpgradeSupplyMissionId !== "field-relay-recovery"/);
assert.match(results,/UPGRADE IN FORGE/);
assert.match(results,/VIEW UPGRADE IN FORGE/);
assert.match(results,/forge\.nextUpgrade\(\)/);
assert.match(bridge,/openInventory\?: \(\) => void/);
assert.match(bootstrap,/typeof homeNav\?\.openInventory/);
assert.match(bootstrap,/typeof inventory\?\.open/);
assert.match(bootstrap,/closeView\(\);\s*if \(typeof homeNav\?\.openInventory/);
assert.match(bootstrap,/void homeNav\.openInventory\(\)/);
assert.match(bootstrap,/void inventory\?\.open\?\.\(\)/);
assert.match(forge,/\["scrap", "Scrap", "Salvage eligible gear in Inventory"\]/);
assert.match(forge,/\["rune_dust", "Rune Dust", "Check the Rune Dust yield when salvaging gear in Inventory"\]/);
assert.match(forge,/const missingCount = rows\.filter\(row => row\.missing > 0\)\.length/);
console.log("Reward Loop P2 material route source contracts PASS");
