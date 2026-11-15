import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: false, resolve: { preserveSymlinks: true },
  server: { middlewareMode: true, hmr: false }, appType: "custom",
});
try {
  const { stepLastHowl, waveRoster } = await server.ssrLoadModule("/tactical-ops-src/combat/lastHowlAuthority.ts");
  const { validTargetIds } = await server.ssrLoadModule("/tactical-ops-src/combat/targeting.ts");
  const { reachableCells } = await server.ssrLoadModule("/tactical-ops-src/combat/movement.ts");
  const { getSkill } = await server.ssrLoadModule("/tactical-ops-src/data/skills.ts");
  const v3 = { version: 3, mode: "battle-v1", alpha: { hp: 120, atk: 28, def: 12, spd: 14 }, pet: null };
  const encounter = { seed: 7, squadIds: ["alpha", "ally-02", "ally-03"], combatProfileV2: { pet: null },
    packMastery: {}, activeCombatProfileV3: v3 };
  for (const seed of [1, 7, 73]) {
    assert.deepEqual([1, 2, 3, 4, 5].map(wave => waveRoster(seed, wave).length), [2, 3, 4, 5, 4]);
    for (let wave = 1; wave <= 30; wave++) {
      const roster = waveRoster(seed, wave);
      assert.equal(roster.filter(unit => unit.defId === "leader").length, wave % 5 === 0 ? 1 : 0);
      assert(roster.length <= 6);
      assert.equal(new Set(roster.map(unit => unit.c + ":" + unit.r)).size, roster.length);
      if (wave >= 3) assert(new Set(roster.map(unit => unit.r)).size > 1);
    }
  }

  const start = stepLastHowl(encounter);
  const clear = (snapshot, wave, elite) => {
    const saved = structuredClone(snapshot);
    saved.wave = wave;
    saved.completedWaves = wave - 1;
    const ally = saved.battle.units.find(unit => unit.id === "alpha");
    const last = saved.battle.units.find(unit => unit.team === "enemy");
    last.hp = 1;
    last.id = elite ? `lh-${wave}-elite` : `lh-${wave}-test`;
    last.c = ally.c + 1;
    last.r = ally.r;
    ally.hp = 89;
    ally.cooldowns["alpha-rend"] = 3;
    saved.battle.activeId = ally.id;
    saved.battle.units = saved.battle.units.filter(unit => unit.team === "ally" || unit === last);
    assert(validTargetIds(saved.battle.units, ally, getSkill("alpha-strike")).includes(last.id));
    return stepLastHowl(encounter, saved, { type: "skill", skillId: "alpha-strike", targetId: last.id });
  };
  for (const wave of [1, 4, 5, 9, 10, 14, 15]) {
    const result = clear({ ...start.snapshot, reserveRound: 20, reserveNumber: 3 }, wave, wave % 5 === 0);
    assert.equal(result.snapshot.reserveRound, 20);
    assert.equal(result.snapshot.reserveNumber, 3);
    assert.equal(result.view.completedWaves, wave);
    assert.equal(result.view.wave, wave + 1);
    assert.equal(result.view.kills, 1);
    assert.equal(result.view.eliteKills, wave % 5 === 0 ? 1 : 0);
    const allies = result.view.battle.units.filter(unit => unit.team === "ally");
    assert.equal(allies[0].hp, 89);
    assert(allies[0].cooldowns["alpha-rend"] > 0);
    const live = result.view.battle.units.filter(unit => unit.team === "enemy" && !unit.defeated);
    assert(live.length > 0 && live.length <= 6);
    assert.equal(result.view.battle.outcome, "ongoing");
    if ((wave + 1) % 5 === 0) {
      assert(live.some(unit => unit.role === "leader"));
      assert(result.view.eliteEntries.length > 0);
    }
  }
  const beforeElite = { ...start.snapshot, wave: 4, completedWaves: 3 };
  assert(stepLastHowl(encounter, beforeElite).view.eliteEntries.length > 0);
  const holding = structuredClone(start.snapshot);
  holding.wave = 2;
  holding.completedWaves = 1;
  holding.battle.round = holding.reserveRound - 1;
  holding.battle.actionsLeftInRound = 0;
  const warned = stepLastHowl(encounter, holding);
  assert(warned.view.reserveEntry);
  const cleared = clear(warned.snapshot, 2, false);
  assert.equal(cleared.view.wave, 3);
  const reserveId = "lh-3-reinforcement-0";
  const reserve = cleared.frames.flatMap(frame => frame.battle.units).find(unit => unit.id === reserveId);
  assert(reserve, "the warning and due reinforcement carry into the next wave");
  assert.deepEqual({ c: reserve.c, r: reserve.r }, warned.view.reserveEntry);
  assert.equal(cleared.snapshot.reserveRound, holding.reserveRound + 3);
  assert.deepEqual(cleared, clear(warned.snapshot, 2, false));

  const blocked = structuredClone(warned.snapshot);
  const ally = blocked.battle.units.find(unit => unit.team === "ally");
  Object.assign(ally, warned.view.reserveEntry);
  const delayed = stepLastHowl(encounter, blocked, { type: "skip" });
  assert.equal(delayed.snapshot.reserveNumber, 0);
  assert(delayed.view.reserveEntry);
  assert.notDeepEqual(delayed.view.reserveEntry, warned.view.reserveEntry);
  const retried = stepLastHowl(encounter, delayed.snapshot, { type: "skip" });
  assert.equal(retried.snapshot.reserveNumber, 1);

  const distance = (a, b) => Math.abs(a.c - b.c) + Math.abs(a.r - b.r);
  for (const seed of [7, 72]) {
    for (const [build, profile] of [
      ["fresh", v3],
      ["developed", { ...v3, alpha: { hp: 128, atk: 38, def: 18, spd: 15 } }],
      ["upgraded", { ...v3, alpha: { hp: 174, atk: 42, def: 26, spd: 18 }, gearImpactV31: { offense: 5000, guard: 15000 } }],
    ]) {
      const run = { ...encounter, seed, activeCombatProfileV3: profile };
      let result = stepLastHowl(run);
      let turns = 0;
      const entry = [];
      while (turns < 250 && result.view.battle.outcome === "ongoing") {
        const battle = result.view.battle;
        const actor = battle.units.find(unit => unit.id === battle.activeId);
        const enemies = battle.units.filter(unit => unit.team === "enemy" && !unit.defeated);
        assert(enemies.length > 0 && enemies.length <= 6);
        assert.equal(new Set(enemies.map(unit => unit.id)).size, enemies.length);
        const skillIds = actor.id === "alpha" ? ["alpha-rend", "alpha-strike"] : actor.skillIds.slice().reverse();
        const attacks = skillIds.filter(id => !actor.cooldowns[id] && getSkill(id).targetType === "ENEMY_SINGLE");
        let action = null;
        for (const skillId of attacks) {
          const target = enemies.filter(unit => validTargetIds(battle.units, actor, getSkill(skillId)).includes(unit.id))
            .sort((a, b) => a.hp - b.hp)[0];
          if (target) { action = { type: "skill", skillId, targetId: target.id }; break; }
        }
        if (!action && !actor.hasMoved) {
          const nearest = cell => Math.min(...enemies.map(unit => distance(cell, unit)));
          const cell = reachableCells(actor, battle.units).sort((a, b) => nearest(a) - nearest(b))[0];
          if (cell && nearest(cell) < nearest(actor)) action = { type: "move", c: cell.c, r: cell.r };
        }
        const priorWave = result.view.wave;
        result = stepLastHowl(run, result.snapshot, action ?? { type: "skip" });
        assert(result, "the scripted policy issues only legal commands");
        if (result.view.wave > priorWave && result.view.wave <= 5) {
          const hp = result.view.battle.units.find(unit => unit.id === "alpha").hp;
          entry.push(`W${result.view.wave} ${hp} HP / ${result.snapshot.reserveNumber} reserves spawned`);
        }
        if (action?.type !== "move") turns++;
      }
      console.log(`Simulation ${build}, seed ${seed}: ${result.view.battle.outcome}, ${result.view.completedWaves} waves, ${result.view.kills} kills, ${turns} ally actions`);
      if (build === "developed") console.log(entry.join("; "));
    }
  }
  console.log("PASS Last Howl wave transitions, elites 5/10/15, cap, tally and preserved squad state");
} finally {
  await server.close();
}
