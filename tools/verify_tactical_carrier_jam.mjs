import assert from "node:assert/strict";
import {writeFileSync} from "node:fs";
import {createServer} from "vite";

const vite = await createServer({configFile:false, server:{middlewareMode:true, hmr:false}});
try {
  const load = name => vite.ssrLoadModule("/tactical-ops-src/combat/" + name + ".ts");
  const {stepRecover} = await load("recoverAuthority");
  const {reachableCells} = await load("movement");
  const {canRecover} = await load("battle");
  const {jammerRoute} = await load("missionRules");
  const missionId = "field-relay-recovery";
  const regular = {
    missionId, squadIds:["alpha","ally-02","ally-03"], packMastery:{},
    combatProfileV2:{pet:null},
    combatProfileV3:{version:3, mode:"battle-v1", alpha:{hp:120, atk:28, def:12, spd:14}, pet:null},
    fieldContext:{cycleId:0, pressure:3, approach:"standard", reportVersion:3, directiveTier:"standard", directiveSet:"pursuit"},
    rulesContract:{source:"BACKEND_SNAPSHOT", rulesetVersion:"tactical-intent-vnext.0", missionId, missionRevision:1,
      combatProfileVersion:3, masterySnapshotVersion:1, rewardPolicyVersion:1},
  };
  const challenge = {...regular, fieldContext:{...regular.fieldContext, reportVersion:7, replayChallenge:"carrier-jam-v1"}};
  const initial = stepRecover(challenge);
  const ordinary = stepRecover(regular);
  const comparison = structuredClone(initial.battle);
  delete comparison.objective.jammerId;
  assert.deepEqual(comparison, ordinary.battle);
  assert.equal(initial.battle.units.find(unit => unit.id === "h2").name, "HOUND MARKSMAN");
  const distance = (a,b) => Math.abs(a.c-b.c) + Math.abs(a.r-b.r);
  const traces = {};
  let blockedOpenWindow = false;
  for (const strategy of ["paired","carrier-down","defeat"]) {
    const pairedBuild = strategy === "paired";
    const heroes = ["alpha","ally-02","ally-03"].map(heroId => ({
      heroId, discipline: pairedBuild && heroId === "ally-03" ? "sentinel" : !pairedBuild && heroId === "ally-02" ? "pursuer" : null,
      ranks: pairedBuild && heroId === "ally-03" ? {"u03-pack":1} : !pairedBuild && heroId === "ally-02" ? {"u02-shot":1} : {},
    }));
    const run = {...challenge, playerGrowth:{version:1, revision:9, heroes}};
    let state = stepRecover(run);
    const commands = [];
    function act(command) {
      const next = stepRecover(run, state, command);
      if (next) {
        state = next;
        commands.push(command);
        if (state.battle.outcome === "ongoing" && !jammerRoute(state.battle)) {
          const baseline = structuredClone(state.battle);
          delete baseline.objective.jammerId;
          if (canRecover(baseline)) {
            assert.equal(stepRecover(run, state, {type:"recover"}), null);
            blockedOpenWindow = true;
          }
        }
      }
      return Boolean(next);
    }
    for (let turn = 0; !state.report && turn < 150; turn++) {
      const {battle} = state;
      const actor = battle.units.find(unit => unit.id === battle.activeId);
      const carrier = battle.units.find(unit => unit.id === "h2");
      if (strategy === "defeat") { act({type:"skip"}); continue; }
      const paired = strategy === "paired";
      if ((paired || carrier.defeated) && canRecover(battle)) { act({type:"recover"}); continue; }
      // The escort closes around the relay. The hunter closes firing range first.
      const terminal = battle.objective.terminal;
      const target = paired || carrier.defeated ? terminal : carrier;
      const others = battle.units.filter(unit => unit.team === "ally" && unit.id !== actor.id && !unit.defeated);
      const score = cell => {
        const near = Math.min(...others.map(other => distance(cell,other)));
        return distance(cell,target) * 5 + (paired ? 0 : Math.abs(cell.r-target.r) / 2) + (paired && near !== 1 ? 2 : 0);
      };
      const cells = reachableCells(actor, battle.units).sort((a,b) => score(a)-score(b));
      if (cells.length && score(cells[0]) < score(actor)) act({type:"move",c:cells[0].c,r:cells[0].r});
      if ((paired || carrier.defeated) && canRecover(state.battle)) { act({type:"recover"}); continue; }
      if (paired) {
        if (actor.defId === "ally-03" && act({type:"skill",skillId:"u03-pack"})) continue;
        if (actor.defId === "alpha" && act({type:"skill",skillId:"alpha-howl"})) continue;
      } else if (!carrier.defeated && actor.defId === "ally-02") {
        if ([actor.skillIds[1],actor.skillIds[0]].some(skillId => act({type:"skill",skillId,targetId:"h2"}))) continue;
      }
      act({type:"skip"});
    }
    traces[strategy] = commands;
    console.log(strategy, state.report?.turns, "rounds,", state.report?.squadStanding, "standing");
    if (strategy === "paired") assert(commands.some(c => c.skillId === "u03-pack"));
    if (strategy === "carrier-down") assert(commands.some(c => c.skillId === "u02-shot" && c.targetId === "h2"));
    assert.equal(state.report?.victory,strategy !== "defeat");
    assert.equal(state.report.recoveryRoute,strategy === "defeat" ? undefined : strategy);
  }
  assert(blockedOpenWindow, "a legal solo baseline extraction was rejected during the challenge");
  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(traces));
} finally { await vite.close(); }
