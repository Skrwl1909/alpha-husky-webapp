import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const battle = readFileSync("tactical-ops-src/ui/Battle.tsx", "utf8");
const screen = battle.slice(battle.indexOf("export function BattleScreen()"));
assert(screen.startsWith("export function BattleScreen()"), "BattleScreen found");
const director = readFileSync("tactical-ops-src/ui/battlePresentation.ts", "utf8");
assert(screen.includes("deriveBattlePresentation({ battle,"), "BattleScreen derives one authoritative presentation");
assert(director.includes("const directive = objectiveDirective(battle);"), "director owns the objective directive");
assert(director.indexOf("const directive =") < director.indexOf("guidance?.copy || directive.action"), "directive initialized before use");
assert(battle.includes("function ObjectiveChip()"), "ObjectiveChip retained");
assert(battle.includes("const directive = objectiveDirective(battle);"), "ObjectiveChip directive retained");
const version = readFileSync("tactical-ops-src/version.ts", "utf8");
const bundle = readFileSync("js/tactical_ops.js", "utf8");
const loader = readFileSync("js/boot_loaders.js", "utf8");
// Version and cache key evolve with each Tactical release. Validate that all
// production surfaces agree with the current canonical source, not a historical
// release string (otherwise unrelated future fixes falsely fail this check).
const bundleVersion = version.match(/export const VERSION\s*=\s*"([^"]+)"/)?.[1];
const cacheKey = version.match(/export const CACHE_KEY\s*=\s*"([^"]+)"/)?.[1];
assert(bundleVersion && /^tactical_ops\.js v\d/.test(bundleVersion), "canonical tactical bundle version");
assert(cacheKey && /^tops-[a-zA-Z0-9.-]+$/.test(cacheKey), "canonical tactical cache version");
assert(bundle.includes(bundleVersion), "rebuilt tactical runtime shipped");
assert(loader.includes(`global.WEBAPP_VER = "${cacheKey}"`), "loader uses fresh bundle");
console.log("PASS: BattleScreen directive scope and production bundle/cache synchronization");
