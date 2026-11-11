/** Reward Loop P2 — source-contract regression. Browser QA still required. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const results = readFileSync("tactical-ops-src/ui/FieldOpResults.tsx","utf8");
const bootstrap = readFileSync("tactical-ops-src/host/bootstrap.ts","utf8");
const bridge = readFileSync("tactical-ops-src/host/bridge.ts","utf8");
const forge = readFileSync("js/forge.js","utf8");

assert.match(results,/receipt\?\.victory/);
assert.match(results,/payout && !pending \? <NextForgeUpgrade/);
assert.match(results,/row\.missing > 0 && \(row\.label === "Scrap" \|\| row\.label === "Rune Dust"\)/);
assert.match(results,/missingSalvageMaterial && inventory \?/);
assert.match(results,/data-next-resource-action="inventory"/);
assert.match(results,/NEXT RESOURCE GOAL/);
assert.match(results,/yield is not guaranteed/i);
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
