/** Focused Forge → Tactical Ops loop integrity. No network, accounts, or economy writes. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("js/forge.js", "utf8");
const from = source.indexOf("  function confirmedForgeDelta(before, after) {");
const to = source.indexOf("\n  async function openFieldTest()", from);
assert(from !== -1 && to > from, "Forge proof helper missing");
const compare = vm.runInNewContext(source.slice(from, to) + "\nconfirmedForgeDelta");

const before = { slot: "weapon", name: "Rend Fang", stars: 2, currentStats: { atk: 4, hp: 3 } };
const after = { slot: "weapon", name: "Rend Fang", stars: 3, currentStats: { atk: 6, hp: 3 } };
const successful = compare(before, after);
assert.equal(successful.beforeStars, 2);
assert.equal(successful.afterStars, 3);
assert.equal(successful.changes.length, 1);
assert.equal(successful.changes[0].key, "atk");
assert.equal(successful.changes[0].before, 4);
assert.equal(successful.changes[0].after, 6);
assert.equal(compare(before, { ...after, stars: 2 }), null, "Unconfirmed upgrade must be hidden");
assert.equal(compare(before, { ...after, slot: "armor" }), null, "Different slot must not pass");
assert.equal(compare(before, null), null, "Missing fresh state must not pass");
assert.equal(compare(before, { ...after, currentStats: {} }).changes.length, 0, "Missing stats cannot imply an increase");
assert.equal(compare(before, { ...after, currentStats: { atk: Infinity } }).changes.length, 0, "Invalid stats must not render");
assert.match(source, /await post\("\/webapp\/forge\/upgrade"/);
assert.match(source, /await loadState\(\);\s*const updated = _state\?\.equipped/);
assert.match(source, /_lastForgeProof = confirmedForgeDelta\(it, updated\)/);
assert.match(source, /_lastForgeProof = null;\s*_ctx = \{/);
assert.match(source, /FIELD TEST IN TACTICAL OPS/);
assert.match(source, /window\.TacticalOps\.open\(\)/);
assert.match(source, /closeViaNav\("forge-field-test"\)/);
assert.doesNotMatch(source.slice(from, to), /Math\.random|localStorage|post\(/);
console.log("Forge Field Test V1: 16 integrity assertions PASS");
