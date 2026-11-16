import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { createServer } from "vite";

const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const load = path => server.ssrLoadModule(`/tactical-ops-src/${path}.ts`);
  const [howl, growth, skills, targeting, movement, proof, recover, combat] = await Promise.all([
    "combat/lastHowlAuthority", "data/playerGrowth", "combat/skills", "combat/targeting",
    "combat/movement", "ui/s3CombatProof", "combat/recoverAuthority", "combat/battle",
  ].map(load));
  const profile = { version: 3, mode: "battle-v1", alpha: { hp: 174, atk: 42, def: 26, spd: 18 }, pet: null };
  const hero = { heroId: "ally-02", discipline: "pursuer", ranks: { "u02-burst": 1 } };
  const snapshot = { version: 2, revision: 1, heroes: [
    { heroId: "alpha", discipline: null, ranks: {} }, hero, { heroId: "ally-03", discipline: null, ranks: {} },
  ] };
  const heavy = { seed: 7, squadIds: ["alpha", "ally-02", "ally-03"], combatProfileV2: { pet: null },
    packMastery: { "ally-02": { progress: 8, stage: 4, selected: "B", veteran: { enabled: true } } },
    activeCombatProfileV3: profile, playerGrowth: snapshot };
  const wide = { ...heavy, playerGrowth: structuredClone(snapshot) };
  wide.playerGrowth.heroes[1].lungeDoctrine = growth.WIDE_LUNGE;
  growth.validateGrowthSnapshot(wide.playerGrowth);
  assert.throws(() => growth.validateGrowthSnapshot({ ...wide.playerGrowth, version: 1 }), /invalid_lunge_doctrine/);
  assert.throws(() => growth.validateGrowthSnapshot({ ...wide.playerGrowth, heroes: [snapshot.heroes[0],
    { ...wide.playerGrowth.heroes[1], ranks: {} }, snapshot.heroes[2]] }), /invalid_lunge_doctrine/);

  const damageTo = result => result.events.filter(event => event.type === "damage" && event.amount > 0);
  const active = battle => battle.units.find(unit => unit.id === battle.activeId);
  function choose(battle) {
    const actor = active(battle);
    const targets = battle.units.filter(unit => unit.team === "enemy" && !unit.defeated);
    const nearest = cell => Math.min(...targets.map(target => movement.chebyshev(cell, target)));
    const attacks = skills.unitSkills(actor).filter(skill => skill.targetType === "ENEMY_SINGLE" &&
      skill.slot !== "A2" && !actor.cooldowns[skill.id]);
    if (actor.id === "alpha" && skills.unitSkills(actor)[1].cooldownMax && !actor.cooldowns["alpha-rend"]) {
      attacks.unshift(skills.unitSkills(actor)[1]);
    }
    for (const skill of attacks) {
      const target = targets.filter(unit => targeting.validTargetIds(battle.units, actor, skill).includes(unit.id))
        .sort((a, b) => a.hp - b.hp)[0];
      if (target) return { type: "skill", skillId: skill.id, targetId: target.id };
    }
    if (!actor.hasMoved) {
      const cell = movement.reachableCells(actor, battle.units).sort((a, b) => nearest(a) - nearest(b))[0];
      if (cell && nearest(cell) < nearest(actor)) return { type: "move", c: cell.c, r: cell.r };
    }
    return { type: "skip" };
  }

  let wideStep = howl.stepLastHowl(wide);
  let heavyStep = howl.stepLastHowl(heavy);
  let comparison;
  let waveThreeActions = 0;
  for (let step = 0; step < 160; step++) {
    const board = wideStep.view.battle;
    const actor = active(board);
    let approach;
    if (wideStep.view.wave === 3 && actor?.id === "ally-02" && !actor.cooldowns["u02-burst"]) {
      const wideSkill = skills.unitSkills(actor)[1];
      const valid = targeting.validTargetIds(board.units, actor, wideSkill);
      for (const targetId of valid) {
        const cmd = { type: "skill", skillId: wideSkill.id, targetId };
        const wideAction = recover.legalAlliedAction(board, cmd);
        const heavyAction = recover.legalAlliedAction(heavyStep.view.battle, cmd);
        if (damageTo(wideAction).length < 2) continue;
        comparison = { board, actor, cmd, wideAction, heavyAction };
        break;
      }
      if (comparison) break;
      if (!actor.hasMoved) {
        const enemies = board.units.filter(unit => unit.team === "enemy" && !unit.defeated);
        const clump = enemies.filter(unit => enemies.some(other => other !== unit && movement.chebyshev(unit, other) <= wideSkill.radius));
        const cell = movement.reachableCells(actor, board.units)
          .find(cell => clump.some(unit => movement.chebyshev(unit, cell) <= wideSkill.maxRange));
        if (cell) approach = { type: "move", c: cell.c, r: cell.r };
      }
    }
    if (board.outcome !== "ongoing" || wideStep.view.wave > 3) break;
    // Let the wave close in before committing CNC, instead of killing the first enemy in reach.
    const cmd = approach ?? (wideStep.view.wave === 3 && waveThreeActions++ < 11 ? { type: "skip" } : choose(board));
    wideStep = howl.stepLastHowl(wide, wideStep.snapshot, cmd);
    heavyStep = howl.stepLastHowl(heavy, heavyStep.snapshot, cmd);
    assert(wideStep && heavyStep, "the shared route uses legal actions");
  }
  assert(comparison, "reach a real wave-3 position with two cleave recipients");
  const { board, actor, cmd, wideAction, heavyAction } = comparison;
  const wideDamage = damageTo(wideAction);
  const heavyDamage = damageTo(heavyAction);
  assert.equal(heavyDamage.length, 1);
  assert(wideDamage.find(event => event.unitId === cmd.targetId).amount < heavyDamage[0].amount);
  assert(wideDamage.reduce((total, event) => total + event.amount, 0) > heavyDamage[0].amount);
  assert.deepEqual(skills.unitSkills(actor).map(skill => skill.slot), ["A1", "A2", "A3"]);
  assert.equal(skills.unitSkills(actor)[1].cooldownMax, 2);
  assert.deepEqual(skills.unitSkills(actor)[2], skills.unitSkills(active(heavyStep.view.battle))[2]);
  assert.equal(skills.unitSkills(actor)[2].targetType, "AREA_RADIUS", "Veteran PRESSURE still composes with Mastery B");
  const withTarget = (state, changes) => ({ ...state,
    units: state.units.map(unit => unit.id === cmd.targetId ? { ...unit, ...changes } : unit),
  });
  const outerCell = movement.reachableCells(actor, board.units, 3)
    .find(cell => movement.chebyshev(cell, actor) === 3);
  assert(outerCell, "a legal free cell exists at Heavy-only aim range");
  assert.equal(recover.legalAlliedAction(withTarget(board, outerCell), cmd), null);
  assert(recover.legalAlliedAction(withTarget(heavyStep.view.battle, outerCell), cmd));
  const finishingHp = wideDamage.find(event => event.unitId === cmd.targetId).amount + 1;
  assert(!recover.legalAlliedAction(withTarget(board, { hp: finishingHp }), cmd).state.units.find(u => u.id === cmd.targetId).defeated);
  assert(recover.legalAlliedAction(withTarget(heavyStep.view.battle, { hp: finishingHp }), cmd).state.units.find(u => u.id === cmd.targetId).defeated);
  assert.equal(recover.legalAlliedAction(board, { ...cmd, targetId: "alpha" }), null);
  assert.equal(recover.legalAlliedAction({ ...board,
    units: board.units.map(unit => unit.id === cmd.targetId ? { ...unit, defeated: true } : unit),
  }, cmd), null);
  const journal = proof.newS3Proof("wide", "wave-3");
  assert.match(proof.observedBuildMoment(proof.recordS3Skill(journal, actor, cmd.skillId, cmd.targetId,
    wideAction.events, false, board), "wide", "wave-3"), /hit [234] enemies/);
  assert.equal(proof.recordS3Skill(journal, actor, cmd.skillId, cmd.targetId, [wideDamage[0]], false, board), journal);
  assert(!wideAction.events.some(event => event.buildEvidence?.includes("unranked range")), "splash is doctrine proof, not ranked reach");
  assert.equal(howl.stepLastHowl(heavy, wideStep.snapshot, cmd).frames[0].events.filter(e => e.type === "damage").length, wideDamage.length);
  assert.equal(howl.stepLastHowl(wide, heavyStep.snapshot, cmd).frames[0].events.filter(e => e.type === "damage").length, 1);
  assert.equal(skills.unitSkills(howl.stepLastHowl(wide).view.battle.units.find(unit => unit.id === "ally-02"))[1].name, "WIDE LUNGE");
  const r2 = { ...actor, growth: { ...actor.growth, ranks: { "u02-burst": 2 } } };
  assert.equal(skills.unitSkills(r2)[1].cooldownMax, 1);
  const vanguard = howl.stepLastHowl({ ...wide, kodaSidegrade: "A" }).view.battle.units.find(unit => unit.id === "ally-02");
  assert.equal(skills.unitSkills(vanguard)[1].targetType, "ENEMY_AOE");
  assert.equal(skills.unitSkills(vanguard)[1].radius, 1);
  assert(skills.unitSkills(howl.stepLastHowl({ ...heavy, kodaSidegrade: "A" })
    .view.battle.units.find(unit => unit.id === "ally-02"))[1].effects.some(effect => effect.status === "SPD_UP"));
  assert.deepEqual(skills.unitSkills({ ...actor, growth: { ...hero, rulesVersion: 1 } })[1],
    skills.unitSkills(active(heavyStep.view.battle))[1]);
  const missionId = "field-relay-recovery";
  const pet = { id: "test-pet", name: "TEST PET", img: "https://example.test/pet.png" };
  const recovery = { runId: "synthetic-recover", missionId,
    squadIds: ["alpha", "ally-03", `pet:${pet.id}`],
    playerGrowth: wide.playerGrowth, packMastery: {}, combatProfileV2: { pet },
    combatProfileV3: { ...profile, pet: { id: pet.id, hp: 91, atk: 25, def: 11, spd: 15 } },
    fieldContext: { cycleId: 7, pressure: 1, approach: "standard", reportVersion: 3, directiveTier: "standard", directiveSet: "pursuit" },
    rulesContract: { source: "BACKEND_SNAPSHOT", rulesetVersion: "tactical-intent-vnext.0", missionId, missionRevision: 1,
      combatProfileVersion: 3, masterySnapshotVersion: 1, rewardPolicyVersion: 1 },
  };
  let recovered = recover.stepRecover(recovery);
  for (let step = 0; step < 40 && recovered.battle.outcome === "ongoing"; step++) {
    const state = recovered.battle;
    const ally = active(state);
    const terminal = state.objective.terminal;
    const distance = cell => Math.abs(cell.c - terminal.c) + Math.abs(cell.r - terminal.r);
    const next = !ally.hasMoved && movement.reachableCells(ally, state.units).sort((a, b) => distance(a) - distance(b))[0];
    const command = combat.canRecover(state) ? { type: "recover" }
      : next && distance(next) < distance(ally) ? { type: "move", c: next.c, r: next.r } : { type: "skip" };
    recovered = recover.stepRecover(recovery, recovered, command);
    assert(recovered, "no-CNC squad uses valid movement and RECOVER actions");
  }
  assert.equal(recovered.battle.outcome, "victory");
  assert.equal(recovered.battle.objective.completed, true);
  if (process.env.TACTICAL_M2_WORKERS) {
    function compareWorker(filename, input, expected) {
      const worker = spawnSync(process.execPath, [resolve(process.env.TACTICAL_M2_WORKERS, filename)], {
        input: JSON.stringify(input), encoding: "utf8",
      });
      assert.equal(worker.status, 0, worker.error?.message ?? worker.stderr);
      assert.deepEqual(JSON.parse(worker.stdout), JSON.parse(JSON.stringify(expected)));
    }
    compareWorker("tactical_last_howl_engine_m2.cjs", { encounter: wide, snapshot: wideStep.snapshot, command: cmd },
      howl.stepLastHowl(wide, wideStep.snapshot, cmd));
    compareWorker("tactical_recover_engine_m2.cjs", { encounter: recovery }, recover.stepRecover(recovery));
  }
  const damage = events => events.map(e => `${e.unitId}: ${e.amount}`).join(", ");
  console.log(`PASS Last Howl wave 3, seed 7: Heavy [${damage(heavyDamage)}]; Wide [${damage(wideDamage)}]. Legal targets, Veteran A3, cooldown and resume verified.`);
} finally {
  await server.close();
}
