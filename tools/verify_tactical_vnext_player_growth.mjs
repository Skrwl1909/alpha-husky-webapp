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
  const guardHowl = { id: "alpha-howl", minRange: 0, maxRange: 0, cooldownMax: 4, radius: 2, effects: [{ kind: "status", status: "ATK_UP", duration: 2 }] };
  const vanguard = resolveGrowthSkill(guardHowl, { heroId: "alpha", discipline: "vanguard", ranks: {} });
  const howlkeeper = resolveGrowthSkill(guardHowl, { heroId: "alpha", discipline: "howlkeeper", ranks: {} });
  assert(vanguard.effects.some(e => e.status === "GUARD"), "vanguard must actually defend allies");
  assert.equal(howlkeeper.radius, 3, "howlkeeper must extend coordinated reach");
  assert.equal(guardHowl.effects.length, 1, "authored source skill remains immutable");
  const pressure = { id: "u02-suppress", minRange: 1, maxRange: 3, cooldownMax: 3, effects: [{ kind: "status", status: "ATK_DOWN", duration: 2 }] };
  assert.equal(resolveGrowthSkill(pressure, { heroId: "ally-02", discipline: "disruptor", ranks: {} }).effects[0].duration, 3);
  assert.equal(resolveGrowthSkill(base, { heroId: "ally-02", discipline: "pursuer", ranks: {} }), base, "unowned skill not affected");
  const thrust = { id: "u02-shot", minRange: 1, maxRange: 3, cooldownMax: 0, effects: [] };
  assert.equal(resolveGrowthSkill(thrust, { heroId: "ally-02", discipline: "pursuer", ranks: {} }).maxRange, 4);
  const support = { id: "u03-pack", minRange: 0, maxRange: 0, cooldownMax: 4, effects: [] };
  assert(resolveGrowthSkill(support, { heroId: "ally-03", discipline: "sentinel", ranks: {} }).effects.some(e => e.status === "GUARD"));
  const mend = { id: "u03-mend", minRange: 0, maxRange: 3, cooldownMax: 2, effects: [] };
  assert.equal(resolveGrowthSkill(mend, { heroId: "ally-03", discipline: "medic", ranks: {} }).cooldownMax, 1);

  assert.throws(() => validateGrowthSnapshot({ ...snapshot, heroes: [{ ...snapshot.heroes[0], ranks: { "alpha-strike": 3 } }, ...snapshot.heroes.slice(1)] }));
  assert.throws(() => validateGrowthSnapshot({ ...snapshot, heroes: [{ ...snapshot.heroes[0], discipline: "medic" }, ...snapshot.heroes.slice(1)] }));
  assert.throws(() => validateGrowthSnapshot({ ...snapshot, heroes: [snapshot.heroes[0], snapshot.heroes[0], snapshot.heroes[2]] }));
  console.log("PASS: growth trees, ranks, immutable skill resolution, strict snapshot validation");
} finally { await server.close(); }
