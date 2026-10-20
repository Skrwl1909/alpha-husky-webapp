import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const { HERO_PATHS, HERO_SKILLS, UPGRADES, validateGrowthSnapshot, resolveGrowthSkill } = await server.ssrLoadModule("/tactical-ops-src/data/playerGrowth.ts");
  assert.equal(Object.keys(HERO_PATHS).length, 3);
  assert.equal(UPGRADES.length, 18);
  for (const [heroId, skills] of Object.entries(HERO_SKILLS)) {
    assert.equal(skills.length, 3);
    assert.equal(HERO_PATHS[heroId].length, 2);
    for (const skillId of skills) assert.deepEqual(UPGRADES.filter((x) => x.skillId === skillId).map((x) => x.rank), [1, 2]);
  }
  const snapshot = validateGrowthSnapshot({ version: 1, revision: 0, heroes: [
    { heroId: "alpha", discipline: "vanguard", ranks: { "alpha-strike": 2 } },
    { heroId: "ally-02", discipline: "pursuer", ranks: {} },
    { heroId: "ally-03", discipline: "sentinel", ranks: {} },
  ] });
  const base = { id: "alpha-strike", minRange: 1, maxRange: 1, cooldownMax: 0, effects: [{ kind: "damage", multiplier: 1 }] };
  assert.equal(resolveGrowthSkill(base, snapshot.heroes[0]).maxRange, 3);
  assert.equal(resolveGrowthSkill(base, undefined), base);
  assert.equal(base.maxRange, 1, "resolver must not mutate canonical skill");
  assert.throws(() => validateGrowthSnapshot({ ...snapshot, heroes: [{ ...snapshot.heroes[0], ranks: { "alpha-strike": 3 } }, ...snapshot.heroes.slice(1)] }));
  assert.throws(() => validateGrowthSnapshot({ ...snapshot, heroes: [{ ...snapshot.heroes[0], discipline: "medic" }, ...snapshot.heroes.slice(1)] }));
  assert.throws(() => validateGrowthSnapshot({ ...snapshot, heroes: [snapshot.heroes[0], snapshot.heroes[0], snapshot.heroes[2]] }));
  console.log("PASS: growth trees, ranks, immutable skill resolution, strict snapshot validation");
} finally { await server.close(); }
