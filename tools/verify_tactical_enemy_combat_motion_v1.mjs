import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "vite";

const root = "images/tactical_ops/hounds/motion/";
const poses = ["skirmisher_lunge", "bulwark_heavy_impact", "marksman_firing"];
for (const pose of poses) assert(existsSync(root + pose + ".webp"), "missing combat pose: " + pose);

const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const { houndAttackPose } = await server.ssrLoadModule("/tactical-ops-src/ui/houndDirectional.ts");
  const hound = archetype => ({ team: "enemy", role: "hostile", archetype });
  const expected = (name) => "/" + root + name + ".webp";
  assert.equal(houndAttackPose(hound("SKIRMISHER"), "melee", "right"), expected("skirmisher_lunge"));
  assert.equal(houndAttackPose(hound("SKIRMISHER"), "heavy", "left"), expected("skirmisher_lunge"));
  assert.equal(houndAttackPose(hound("BULWARK"), "melee", "right"), expected("bulwark_heavy_impact"));
  assert.equal(houndAttackPose(hound("BULWARK"), "heavy", "left"), expected("bulwark_heavy_impact"));
  assert.equal(houndAttackPose(hound("MARKSMAN"), "ranged", "right"), expected("marksman_firing"));
  for (const archetype of ["SKIRMISHER", "BULWARK", "MARKSMAN"]) {
    for (const facing of ["front", "back"]) {
      assert.equal(houndAttackPose(hound(archetype), "melee", facing), null, "vertical fallback must remain directional");
      assert.equal(houndAttackPose(hound(archetype), "ranged", facing), null, "vertical fallback must remain directional");
    }
  }
  assert.equal(houndAttackPose(hound("MARKSMAN"), "melee", "right"), null);
  assert.equal(houndAttackPose(hound("DISRUPTOR"), "jam", "right"), null);
  assert.equal(houndAttackPose({ ...hound("SKIRMISHER"), team: "ally" }, "melee", "right"), null);
  assert.equal(houndAttackPose({ ...hound("SKIRMISHER"), role: "leader" }, "melee", "right"), null);

  const battle = readFileSync("tactical-ops-src/ui/Battle.tsx", "utf8");
  const css = readFileSync("tactical-ops-src/ui/combatCohesion.css", "utf8");
  const oldCss = readFileSync("tactical-ops-src/tactical.css", "utf8");
  assert.match(battle, /attackPose=\{rangedPose\}/);
  assert.match(battle, /t-enemy-attack-pose/);
  assert.match(battle, /travelActors\.add\(enemyScene\.actorId\)/);
  assert.match(battle, /!unit\.defeated && unit\.hp > 0 \? <button/);
  assert.match(css, /\.t-token img\.t-enemy-ranged-pose/);
  assert.match(css, /\.t-hostile-scene img\.t-enemy-attack-pose/);
  assert.match(css, /\.t-enemy-ranged-pose\.is-mirrored/);
  assert.match(oldCss, /42%\{left:var\(--enemy-target-x\)/);
  assert.match(oldCss, /49%\{left:var\(--enemy-target-x\)/);
  assert.match(oldCss, /\.t-hostile-scene\{[^}]*pointer-events:none;/);
  assert.match(oldCss, /@media\(prefers-reduced-motion:reduce\)\{#tacticalOpsRoot \.t-hostile-scene\{display:none!important;\}\}/);
  console.log("PASS enemy pose maps, directional fallbacks, confirmed contact, no duplicate travel or tile hitbox changes");
} finally {
  await server.close();
}
