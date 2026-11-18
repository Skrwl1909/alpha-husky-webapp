import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const dir = resolve(process.argv[2] ?? "artifacts/blood-scent-workers");
const profile = {version:3, mode:"battle-v1", alpha:{hp:174,atk:42,def:26,spd:18}, pet:null};
const missionId = "field-relay-recovery";
for (const mode of ["last_howl", "recover"]) {
  function step(encounter, snapshot, command) {
    const file = resolve(dir, `tactical_${mode}_engine_blood_scent_v1.cjs`);
    const result = spawnSync(process.execPath, [file], {encoding:"utf8",input:JSON.stringify({encounter,snapshot,command})});
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  }
  for (const rank of [1,2]) {
    const encounter = {seed:7, runId:"synthetic", squadIds:["alpha","ally-02","ally-03"],
      activeCombatProfileV3:profile, combatProfileV3:profile, combatProfileV2:{pet:null}, packMastery:{},
      missionId, fieldContext:{cycleId:7,pressure:rank,approach:"standard",reportVersion:3,directiveTier:"standard",directiveSet:"pursuit"},
      rulesContract:{source:"BACKEND_SNAPSHOT",rulesetVersion:"tactical-intent-vnext.0",missionId,missionRevision:1,
        combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1},
      playerGrowth:{version:2,revision:8,heroes:[
        {heroId:"alpha",discipline:"vanguard",ranks:{"alpha-rend":rank},bloodScent:"blood-scent-v1"},
        ...["ally-02","ally-03"].map(heroId=>({heroId,discipline:null,ranks:{}}))]}};
    function position(build) {
      const opened = step(build);
      const saved = opened.snapshot ?? opened;
      const board = saved.battle;
      const alpha = board.units.find(u=>u.defId==="alpha");
      const [wounded, fresh] = board.units.filter(u=>u.team==="enemy");
      Object.assign(alpha,{c:3,r:3,hasActed:false});
      Object.assign(wounded,{c:4,r:3,hp:90});
      Object.assign(fresh,{c:3,r:4,hp:1});
      board.activeId=alpha.id;
      alpha.cooldowns["alpha-rend"]=2;
      wounded.statuses=[{id:"fixture",source:"alpha-rend",type:"BLEED",duration:rank,value:8}];
      return {saved,alpha,wounded,fresh};
    }
    function strike(build,pos,target) {
      const command={type:"skill",skillId:"alpha-strike",targetId:target.id};
      const result=step(build,pos.saved,command);
      return result?.frames?.[0] ?? result?.view?.frames?.[0] ?? null;
    }
    const owned=position(encounter);
    const old=structuredClone(encounter);
    delete old.playerGrowth.heroes[0].bloodScent;
    const baseline=position(old);
    const actor=frame=>frame.battle.units.find(u=>u.defId==="alpha");
    const cd=frame=>actor(frame).cooldowns["alpha-rend"];
    const normal=strike(old,baseline,baseline.wounded);
    const hunt=strike(encounter,owned,owned.wounded);
    const kill=strike(encounter,owned,owned.fresh);
    assert.equal(cd(normal),2);
    assert.equal(cd(kill),2);
    assert.equal(cd(hunt),1);
    assert.equal(actor(hunt).hasActed,true);
    assert.equal(actor(hunt).bloodScentUsed,true);
    assert.equal(actor(kill).bloodScentUsed,undefined);
    assert(kill.battle.units.find(u=>u.id===owned.fresh.id).defeated);
    assert.deepEqual(hunt.events.filter(e=>e.type==="damage"),normal.events.filter(e=>e.type==="damage"));
    assert(hunt.events.some(e=>e.text?.includes("BLOOD SCENT")));
    assert.deepEqual(strike(encounter,owned,owned.wounded),hunt,"saved command replays identically");
    owned.alpha.bloodScentUsed=true;
    assert.equal(cd(strike(encounter,owned,owned.wounded)),2);
    delete owned.alpha.bloodScentUsed;
    owned.wounded.statuses[0].duration=0;
    assert.equal(cd(strike(encounter,owned,owned.wounded)),2);
    owned.wounded.defeated=true;
    assert.equal(strike(encounter,owned,owned.wounded),null);
    console.log(`PASS ${mode}, REND ${rank}: immediate kill leaves cooldown 2, bleeding follow-up leaves 1.`);
  }
}
