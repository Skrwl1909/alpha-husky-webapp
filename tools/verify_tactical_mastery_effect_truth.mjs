import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const load = path => server.ssrLoadModule(`/tactical-ops-src/${path}.ts`);
  const [growth, preview, view, atlas, proof, battle, skills, mastery, units, fieldcraft] = await Promise.all([
    "data/playerGrowth", "data/buildPreview", "ui/skillEffectView", "ui/signalAtlas/model", "ui/s3CombatProof",
    "combat/battle", "combat/skills", "data/packMastery", "data/units", "ui/fieldcraft",
  ].map(load));
  let compositions = 0;
  for (const [heroId, paths] of Object.entries(growth.HERO_PATHS)) {
    for (const discipline of paths) for (const version of [1, 2]) for (const rank of [0, 1, 2]) {
      for (const skillId of growth.HERO_SKILLS[heroId]) {
        const hero = { heroId, discipline, rulesVersion: version, ranks: { [skillId]: rank } };
        const skill = growth.resolveGrowthSkill(preview.growthPreviewBase(skillId), hero);
        const shown = view.skillEffectView(skill, hero);
        assert.equal(shown.rank, rank);
        assert.equal(shown.discipline, discipline);
        assert.equal(shown.version, version);
        assert(shown.geometry.endsWith(`Cooldown ${skill.cooldownMax}T`));
        if (skillId === "u03-mend") assert.equal(shown.effects.some(line => line.includes("≤50%")), version === 2 && rank === 2);
        compositions++;
      }
    }
  }
  assert.equal(compositions, 108);

  const shadow = { heroId: "ally-03", discipline: "medic", ranks: {} };
  assert.equal(atlas.getNodeView("ally-03", "u03-mend", 1, { ...shadow, rulesVersion: 1 }, "medic", 1).state, "no-effect");
  assert.deepEqual(atlas.getNodeView("ally-03", "u03-mend", 1, { ...shadow, rulesVersion: 2 }, "medic", 1).changes,
    ["RANGE 3 → 4"]);
  const account = { playerGrowth: { version: 2, revision: 1, heroes: [shadow], earnedPoints: 1, spentPoints: 0 } };
  assert.equal(atlas.availableAtlasUpgrade(account)?.heroId, "ally-03");
  assert.equal(atlas.availableAtlasUpgrade({ ...account, lastHowl: { status: "ACTIVE" } }), null);

  const petId = "pet:p1";
  const pet = { id: petId, defId: petId, c: 0, r: 0, unitDef: { ...units.UNIT_DEFS["ally-03"],
    defId: petId, skillIds: ["pet-bite", "pet-hamstring"], move: 2 } };
  for (const [stage, selected] of [[1, null], [2, null], [3, "A"], [3, "B"], [4, "B"]]) {
    const [spawn] = mastery.withPackMastery([pet], { [petId]: { stage, selected, progress: stage === 1 ? 0 : stage === 2 ? 3 : 8,
      veteran: { enabled: stage === 4 } } });
    const identity = view.buildIdentity(spawn.unitDef, undefined, false);
    assert.equal(identity.includes("RECOVER bonus not applicable"), stage >= 2);
    assert.equal(identity.includes("PATHFINDER"), selected === "B");
    assert.equal(identity.includes("VETERAN ACTIVE"), stage === 4);
    if (stage >= 2) assert(view.buildIdentity(spawn.unitDef, undefined, true).includes(`RECOVER from ${stage === 4 ? 3 : 2} cells`));
  }

  const snapshot = { version: 2, revision: 7, heroes: [
    { heroId: "alpha", discipline: "vanguard", ranks: { "alpha-strike": 1 } },
    { heroId: "ally-02", discipline: "disruptor", ranks: {} },
    { ...shadow, ranks: { "u03-mend": 2 } },
  ] };
  const brief = { objectiveType: "INTERCEPT" };
  const cncRoster = [units.UNIT_DEFS["ally-02"]];
  assert.match(fieldcraft.buildFit(brief, cncRoster, snapshot, false)[0], /interruption is unavailable/);
  assert.match(fieldcraft.buildFit(brief, cncRoster, snapshot, true)[0], /Can cancel an interruptible locked intent/);
  const start = battle.createBattle(null, [
    { id: "alpha", defId: "alpha", c: 1, r: 1 },
    { id: "ally-03", defId: "ally-03", c: 0, r: 1 },
    { id: "h1", defId: "hostile", c: 3, r: 1 },
  ], null, null, null, null, snapshot);
  const position = { alpha: [2, 2], "ally-03": [1, 2], h1: [4, 2] };
  const before = { ...start, activeId: "alpha", units: start.units.map(unit => {
    const [c, r] = position[unit.id];
    return { ...unit, c, r };
  }) };
  const empty = proof.newS3Proof("run", "mission");
  const alpha = before.units.find(unit => unit.id === "alpha");
  snapshot.heroes[0].ranks["alpha-strike"] = 2;
  assert.equal(view.skillEffectView(skills.unitSkills(alpha)[0], alpha.growth).rank, 1);
  const strike = skills.applySkill(before, "alpha-strike", "h1");
  assert(strike.ok);
  const alphaProof = proof.recordS3Skill(empty, alpha, "alpha-strike", "h1", strike.events, false, before);
  assert.match(proof.observedBuildMoment(alphaProof, "run", "mission"), /beyond the unranked range/);
  assert.equal(proof.observedBuildMoment(alphaProof, "new-run", "mission"), undefined);

  const mendState = { ...before, activeId: "ally-03",
    units: before.units.map(unit => unit.id === "alpha" ? { ...unit, hp: 1 } : unit) };
  const medic = mendState.units.find(unit => unit.id === "ally-03");
  const mend = skills.applySkill(mendState, "u03-mend", "alpha");
  assert(mend.ok);
  const shadowProof = proof.recordS3Skill(empty, medic, "u03-mend", "alpha", mend.events, false, mendState);
  assert.match(proof.observedBuildMoment(shadowProof, "run", "mission"), /GUARD applied/);
  const fullHp = skills.applySkill({ ...before, activeId: medic.id }, "u03-mend", "alpha");
  assert.equal(proof.observedBuildMoment(proof.recordS3Skill(empty, medic, "u03-mend", "alpha", fullHp.events, false, before), "run", "mission"), undefined);

  const cnc = { id: "ally-02", defId: "ally-02", team: "ally" };
  const control = [{ type: "status", unitId: "h1" }];
  assert.equal(proof.observedBuildMoment(proof.recordS3Skill(empty, cnc, "u02-suppress", "h1", control, false, before), "run", "mission"), undefined);
  assert.match(proof.observedBuildMoment(proof.recordS3Skill(empty, cnc, "u02-suppress", "h1", control, true, before), "run", "mission"), /canceled a locked/);
  console.log(`PASS mastery effect truth: ${compositions} growth views, 5 PET mastery states, Atlas eligibility and frozen event proof`);
} finally {
  await server.close();
}
