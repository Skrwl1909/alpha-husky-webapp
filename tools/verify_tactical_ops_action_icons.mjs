#!/usr/bin/env node
/** Asset path + gameplay-agnostic presentation integration checks. */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const mapping = readFileSync(join(root, "tactical-ops-src/ui/tacticalActionIcons.ts"), "utf8");
const battle = readFileSync(join(root, "tactical-ops-src/ui/Battle.tsx"), "utf8");
const skillbook = readFileSync(join(root, "tactical-ops-src/ui/Skillbook.tsx"), "utf8");
const atlas = readFileSync(join(root, "tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx"), "utf8");
const css = readFileSync(join(root, "tactical-ops-src/tactical.css"), "utf8");

const assetIds = [
  "alpha_strike", "alpha_rend", "alpha_howl",
  "cnc_thrust", "cnc_lunge", "cnc_pressure",
  "shadow_sweep", "shadow_mend", "shadow_pack_support",
  "pet_bite", "pet_hamstring",
  "system_move", "system_recover", "system_skip",
];

for (const assetId of assetIds) {
  const name = `action_${assetId}.png`;
  const path = join(root, "images/tactical_ops/actions", name);
  assert.ok(existsSync(path), `Missing tactical icon: ${name}`);
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", name + " PNG signature");
  assert.equal(bytes.readUInt32BE(16), 256, name + " width");
  assert.equal(bytes.readUInt32BE(20), 256, name + " height");
  assert.ok(mapping.includes(name), name + " mapping");
}
for (const skill of [
  "alpha-strike", "alpha-rend", "alpha-howl",
  "u02-shot", "u02-burst", "u02-suppress",
  "u02-lunge-vanguard", "u02-pressure-disruptor",
  "u03-tap", "u03-mend", "u03-pack",
  "u03-mend-restorer", "u03-pack-warden",
  "pet-bite", "pet-hamstring",
]) assert.ok(mapping.includes(`"${skill}"`), "Unmapped skill: " + skill);
assert.ok(mapping.includes("split(':mastery:')"), "Pack Mastery suffix handling");
assert.ok(battle.includes("tacticalActionImageForSkill(sk.id)"), "Dock skill icon binding");
assert.ok(battle.includes('tacticalActionImageForCommand("recover")'), "Recover icon binding");
assert.ok(battle.includes('tacticalActionImageForCommand("skip")'), "Skip icon binding");
assert.ok(battle.includes('classList.add("has-icon-error")'), "Image load fallback");
assert.ok(skillbook.includes('<SignalAtlas onClose={onClose} />') && atlas.includes("tacticalActionImageForSkill(skillId)"), "Official Skillbook icon binding");
assert.ok(css.includes('action_system_move.png'), "Movement marker icon binding");
assert.ok(css.includes("pointer-events: none;"), "Icon art must not intercept input");
console.log("verify_tactical_ops_action_icons: 14 PNG + skill mapping + presentation wiring PASS");
