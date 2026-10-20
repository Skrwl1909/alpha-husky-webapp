#!/usr/bin/env node
/**
 * Step 5 acceptance matrix: 12 authored missions, every legal squad configuration,
 * and two bounded server-profile fixtures. This checks deployment legality and
 * mechanically distinct role/build capabilities; it does NOT claim fun or balance PASS.
 * No network, backend writes or rewards.
 */
import assert from "node:assert/strict";
import { createServer } from "vite";

const vite = await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
  const [ops,unitDefs,battle,profiles,teammates,skills,codex] = await Promise.all([
    "/tactical-ops-src/data/operations.ts",
    "/tactical-ops-src/data/units.ts",
    "/tactical-ops-src/combat/battle.ts",
    "/tactical-ops-src/combat/combatProfileV3.ts",
    "/tactical-ops-src/data/shadowSidegrade.ts",
    "/tactical-ops-src/data/skills.ts",
    "/tactical-ops-src/data/signalCodex.ts",
  ].map(v => vite.ssrLoadModule(v)));
  const pet={id:"test-pet",name:"TEST PET",img:"https://example.test/pet.png"};
  const squadVariants=[
    ["alpha","ally-02","ally-03"],
    ["alpha","ally-02",`pet:${pet.id}`],
    ["alpha","ally-03",`pet:${pet.id}`],
  ];
  const recoverChoices=[["alpha","ally-02"],["alpha","ally-03"],["alpha",`pet:${pet.id}`]];
  const growth={version:1,revision:5,heroes:[
    {heroId:"alpha",discipline:"vanguard",ranks:{"alpha-rend":1}},
    {heroId:"ally-02",discipline:"disruptor",ranks:{"u02-suppress":1}},
    {heroId:"ally-03",discipline:"sentinel",ranks:{"u03-pack":1}},
  ]};
  const levels=[
    {name:"fresh",alpha:{hp:120,atk:28,def:12,spd:14},pet:{hp:78,atk:18,def:6,spd:13}},
    {name:"developed",alpha:{hp:138,atk:39,def:21,spd:16},pet:{hp:91,atk:25,def:11,spd:15}},
  ];
  const ids=Object.keys(ops.MISSION_DEFS).sort();
  assert.equal(ids.length,12);
  const coverage=[],signatures=new Map();
  for(const id of ids){
    const mission=ops.MISSION_DEFS[id];
    const configs=id==="broken-signal-breach" ? [["alpha","ally-02","ally-03"]]
      : id==="broken-signal-recover" ? recoverChoices : squadVariants;
    for(const squad of configs) {
      const spawns=ops.missionSpawnsForSquad(mission,squad,pet);
      assert(spawns,`missing legal spawns: ${id} ${squad.join(",")}`);
      const allies=spawns.filter(s=>(s.unitDef?.team??unitDefs.UNIT_DEFS[s.defId]?.team)==="ally");
      assert.equal(allies.length,mission.squadCap,`squad cap ${id} ${squad}`);
      assert.equal(allies[0].id,"alpha",`Alpha must lead ${id}`);
      assert.equal(new Set(spawns.map(s=>s.id)).size,spawns.length,`duplicate spawn ids ${id}`);
      assert.equal(new Set(spawns.map(s=>s.c+","+s.r)).size,spawns.length,`colliding spawns ${id} ${squad}`);
      const hasPet=squad.some(x=>x.startsWith("pet:"));
      assert.equal(allies.some(s=>s.id.startsWith("pet:")),hasPet,`PET is a slot ${id}`);
      const withSidegrades=teammates.withTeammateSidegrades(spawns,{kodaSidegrade:"B",shadowSidegrade:"B",packMastery:{}});
      for(const level of levels) {
        // Bounded fixtures are examples, not fabricated live users or forged rewards.
        const v3={version:3,mode:"battle-v1",alpha:level.alpha,
          pet:hasPet?{...pet,...level.pet}:null};
        const v2={pet:hasPet?{...pet}:null};
        const applied=profiles.applyRunCombatProfile(withSidegrades,v3,v2);
        const state=battle.createBattle(undefined,applied,ops.missionBattleRules(mission).objective,null,null,null,growth);
        const activeAllies=state.units.filter(u=>u.team==="ally");
        assert.equal(activeAllies.length,mission.squadCap);
        const alpha=activeAllies.find(u=>u.defId==="alpha");
        assert.deepEqual([alpha.maxHp,alpha.atk,alpha.def,alpha.spd],
          [level.alpha.hp,level.alpha.atk,level.alpha.def,level.alpha.spd],
          `server-frozen Alpha profile not respected ${id} ${level.name}`);
        assert(alpha.growth && alpha.growth.ranks["alpha-rend"]===1,
          `Growth missing from active unit ${id}`);
        const companion=activeAllies.find(u=>u.id.startsWith("pet:"));
        assert.equal(Boolean(companion),hasPet);
        if (companion) assert.deepEqual([companion.maxHp,companion.atk,companion.def,companion.spd],
          [level.pet.hp,level.pet.atk,level.pet.def,level.pet.spd],
          `server-frozen PET profile not respected ${id}`);
        const equipped=codex.equippedSignalCodex(activeAllies,growth);
        assert(equipped.every(p=>p.cooldown>=0));
        const hasSupport=activeAllies.some(u=>u.skillIds.some(x=>skills.getSkill(x).effects.some(e=>e.kind==="heal")));
        assert.equal(hasSupport,squad.includes("ally-03"),
          `SHADOW sustain should be the cost of replacing her ${id}`);
        if(squad.includes("ally-02"))
          assert(equipped.some(p=>p.family==="Control" && p.unit==="CNC"),`no CNC control ${id}`);
        const key=`${id}:${squad.join(",")}`;
        const signature=JSON.stringify(activeAllies.map(u=>({unit:u.defId,
          move:u.move,attack:u.atk,def:u.def,skills:u.skillIds})));
        if(level.name==="fresh")signatures.set(key,signature);
        else assert.notEqual(signature,signatures.get(key),
          `developed and fresh server profiles must not become same units ${id}`);
        coverage.push({mission:id,squad:squad.join("+"),profile:level.name,
          allies:activeAllies.length,pet:hasPet,healing:hasSupport,codexFamilies:[...new Set(equipped.map(p=>p.family))]});
      }
    }
  }
  // 1 fixed breach + 3 recover + (1 commander + 3 Dead Relay + 6 Field Ops)*3, each with two profiles.
  assert.equal(coverage.length,(1+3+10*3)*2);
  const variants=coverage.filter(x=>x.mission==="dead-relay-guardian" && x.profile==="fresh");
  assert.equal(variants.length,3);
  assert(new Set(variants.map(v=>v.squad)).size===3);
  console.log(JSON.stringify({schema:"tactical-step5-squad-coverage.v1",missions:ids.length,
    deployProfiles:coverage.length,squadVariants:3,
    byMission:Object.fromEntries(ids.map(id=>[id,coverage.filter(x=>x.mission===id).length]))},null,2));
  console.log("PASS Step5 12/12 mission squad deployment legality, three role tradeoffs, frozen Alpha/PET stats, Growth snapshot and honest Codex");
} finally { await vite.close(); }
