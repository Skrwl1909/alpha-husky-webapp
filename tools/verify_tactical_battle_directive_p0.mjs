import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const battle = readFileSync("tactical-ops-src/ui/Battle.tsx", "utf8");
const screen = battle.slice(battle.indexOf("export function BattleScreen()"));
assert(screen.startsWith("export function BattleScreen()"), "BattleScreen found");
assert(screen.includes("const directive = objectiveDirective(useBattleStore.getState().battle);"), "BattleScreen owns directive used by guidance");
assert(screen.indexOf("const directive = objectiveDirective(") < screen.indexOf("guidance.title !== directive.status"), "directive defined before render");
assert(battle.includes("function ObjectiveChip()"), "ObjectiveChip retained");
assert(battle.includes("const directive = objectiveDirective(battle);"), "ObjectiveChip directive retained");
const version = readFileSync("tactical-ops-src/version.ts", "utf8");
const bundle = readFileSync("js/tactical_ops.js", "utf8");
const loader = readFileSync("js/boot_loaders.js", "utf8");
assert(version.includes("tops-3.5.4-battle-directive-p0"), "new cache version");
assert(bundle.includes("v3.5.4-battle-directive-p0"), "rebuilt tactical runtime shipped");
assert(loader.includes("tops-3.5.4-battle-directive-p0"), "loader uses fresh bundle");
console.log("PASS: BattleScreen directive scope and production bundle/cache synchronization");
