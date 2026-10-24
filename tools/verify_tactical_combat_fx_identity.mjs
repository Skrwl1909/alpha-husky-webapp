#!/usr/bin/env node
/** Static FX identity integration regression: design-only wiring, no mechanics. */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const fx = read("tactical-ops-src/ui/combatFxAtlas.ts");
const battle = read("tactical-ops-src/ui/Battle.tsx");
const store = read("tactical-ops-src/store/battleStore.ts");
const css = read("tactical-ops-src/tactical.css");
const manifest = JSON.parse(read("images/tactical_ops/combat_fx/v1/tactical_fx_manifest.json"));
const names = Object.keys(manifest.animations);
assert.equal(names.length, 17, "Expected 17 authored WebP FX");
for (const name of names) {
  assert.ok(fx.includes('"' + name + '": "fx-'), "Missing FX class: " + name);
  assert.ok(fx.includes(name + ":"), "Missing event-driven FX mapping: " + name);
  const file = join(root, "images/tactical_ops/combat_fx/v1", name + ".webp");
  assert.ok(existsSync(file), "Missing authored FX: " + file);
  const bytes = readFileSync(file);
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF", name + " RIFF header");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP", name + " WEBP header");
}
assert.ok(battle.includes("combatFxVisualClasses(effect.name)"), "Visual identities not bound to renderer");
assert.ok(battle.includes('["alpha_howl","shadow_pack_heal_def","shadow_pack_def_only","shadow_pack_guard"]'), "Existing AoE scope must remain");
assert.ok(store.includes("publishFx(spriteEvents(actor,selectedSkillId,res.events"), "Atlas must follow accepted event");
assert.ok(store.includes("publishFx(spriteEvents(actor,skillId,res.events"), "Self-activation must follow accepted event");
assert.ok(!store.includes("combatFxVisualClasses"), "Presentation classes must not enter gameplay store");
assert.ok(css.includes(".t-threat-tile {z-index:16;}"), "Enemy red danger layer must remain over FX");
assert.ok(css.includes(".t-sprite-fx {pointer-events:none;"), "Battlefield taps must remain free");
assert.ok(css.includes("t-fx-identity-hit") && css.includes("t-fx-identity-support"), "FX archetype animations missing");
assert.ok(css.includes("@media(prefers-reduced-motion:reduce)"), "Reduced-motion fallback absent");
console.log("PASS FX Identity P2: 17 assets mapped, renderer wired, event truth, telegraphs, tap freedom, reduced motion");
