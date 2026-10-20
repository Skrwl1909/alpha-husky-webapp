#!/usr/bin/env node
/** Server wire format, UI wiring and real skill resolver contract. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const host = await server.ssrLoadModule("/tactical-ops-src/host/foundationProgression.ts");
  const growth = await server.ssrLoadModule("/tactical-ops-src/data/playerGrowth.ts");
  const persisted = {
    version: 1, earnedPoints: 2, spentPoints: 1,
    claimedFirstClears: ["broken-signal-breach", "broken-signal-recover"],
    heroes: [
      { heroId: "alpha", discipline: "vanguard", ranks: { "alpha-strike": 1 }, respecUsed: false },
      { heroId: "ally-02", discipline: null, ranks: {}, respecUsed: false },
      { heroId: "ally-03", discipline: null, ranks: {}, respecUsed: false },
    ],
  };
  const read = host.parseGrowthProgression(persisted, 14);
  assert(read, "backend growth record must be readable with parent Foundation revision");
  assert.equal(read.revision, 14);
  assert.equal(read.earnedPoints - read.spentPoints, 1);
  assert.equal(read.heroes[0].ranks["alpha-strike"], 1);
  assert.equal(host.parseGrowthProgression({...persisted, earnedPoints: 3},14), null);
  assert.equal(host.parseGrowthProgression({...persisted, heroes: [...persisted.heroes.slice(0,2), {...persisted.heroes[2], ranks: {"u03-tap": 1}}]},14), null);
  const run = growth.validateGrowthSnapshot({
    version: 1, revision: 14,
    heroes: persisted.heroes.map(({heroId,discipline,ranks})=>({heroId,discipline,ranks}))
  });
  assert.equal(run.heroes[0].discipline, "vanguard");
  const ui = readFileSync("tactical-ops-src/ui/Skillbook.tsx", "utf8");
  const app = readFileSync("tactical-ops-src/ui/App.tsx", "utf8");
  const store = readFileSync("tactical-ops-src/store/battleStore.ts", "utf8");
  assert(ui.includes("upgradeGrowth") && ui.includes("respecGrowth"), "both authenticated actions required");
  assert(ui.includes("CONFIRM UPGRADE") && ui.includes("CONFIRM RESET"));
  assert(app.includes("<SkillbookPanel />"), "Skillbook must be accessible from War Table");
  assert(store.includes("upgradePlayerGrowth(") && store.includes("respecPlayerGrowth("));
  const t = readFileSync("tactical-ops-src/combat/battle.ts", "utf8");
  assert(t.includes("validateGrowthSnapshot(growth)"), "run snapshot required");
  assert(t.includes("growth: { ...hero, ranks: { ...hero.ranks } }"), "frozen copy on unit");
  const actions = readFileSync("tactical-ops-src/combat/skills.ts", "utf8");
  assert(actions.includes("resolveGrowthSkill(getSkill(skillId), caster.growth)"), "authoritative skill execution");
  assert(actions.includes("resolveGrowthSkill(getSkill(id), unit.growth)"), "authoritative HUD preview");
  console.log("PASS Growth: backend record, run snapshot, authored skills, Skillbook read/save/respec wiring");
} finally { await server.close(); }
