import assert from "node:assert/strict";
import { createServer } from "vite";
import { readFileSync } from "node:fs";

const vite = await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
  const growth = await vite.ssrLoadModule("/tactical-ops-src/data/playerGrowth.ts");
  const codex = await vite.ssrLoadModule("/tactical-ops-src/data/signalCodex.ts");
  const scheduler = await vite.ssrLoadModule("/tactical-ops-src/combat/intentScheduler.ts");
  const intent = await vite.ssrLoadModule("/tactical-ops-src/combat/intentContract.ts");
  const skills = await vite.ssrLoadModule("/tactical-ops-src/data/skills.ts");
  const sidegrades = await vite.ssrLoadModule("/tactical-ops-src/data/shadowSidegrade.ts");
  const units = await vite.ssrLoadModule("/tactical-ops-src/data/units.ts");
  assert.deepEqual(codex.SIGNAL_FAMILIES, ["Recon","Control","Defense","Mobility","Support"]);
  assert.equal(codex.signalFamily(skills.getSkill("u02-pressure-disruptor")), "Control");
  assert.equal(codex.signalFamily(skills.getSkill("u03-pack-warden")), "Defense");
  assert.equal(codex.signalFamily(skills.getSkill("u03-mend-restorer")), "Support");
  assert.equal(codex.signalFamily(skills.getSkill("alpha-strike")), null, "ordinary attacks are not fictional Recon");
  assert.match(codex.squadTradeoff(["alpha","ally-02"], "pet-x"),/SHADOW healing/);
  assert.equal(growth.canonicalGrowthSkillId("u02-pressure-disruptor:mastery:CNC:2:none"),"u02-suppress");
  assert.equal(growth.canonicalGrowthSkillId("u03-pack-warden:mastery:SHADOW:2:none"),"u03-pack");
  const cnc = {heroId:"ally-02",discipline:"disruptor",ranks:{"u02-suppress":1}};
  const shadow = {heroId:"ally-03",discipline:"sentinel",ranks:{"u03-pack":1}};
  const wrapped=sidegrades.withTeammateSidegrades([
    {defId:"alpha",id:"alpha",c:0,r:2},
    {defId:"ally-02",id:"ally-02",c:1,r:1},
    {defId:"ally-03",id:"ally-03",c:1,r:3},
  ], {kodaSidegrade:"B",shadowSidegrade:"B",packMastery:{
    "ally-02":{progress:3,stage:2,unlockedOptions:[],selected:null},
    "ally-03":{progress:3,stage:2,unlockedOptions:[],selected:null},
  }});
  const pressureId=wrapped[1].unitDef.skillIds[2], wardId=wrapped[2].unitDef.skillIds[2];
  assert(pressureId.includes(":mastery:"));
  assert(wardId.includes(":mastery:"));
  const pressure=growth.resolveGrowthSkill(skills.getSkill(pressureId),cnc);
  assert.equal(pressure.maxRange,4,"mastery range combines with saved Growth");
  assert(pressure.effects.filter(e=>e.kind==="status").every(e=>e.duration===4),"mastery sidegrade gets Growth and discipline status duration");
  const ward=growth.resolveGrowthSkill(skills.getSkill(wardId),shadow);
  assert.equal(ward.effects.filter(e=>e.status==="GUARD").length,1,"no duplicate GUARD stacks");
  assert.equal(ward.effects.find(e=>e.status==="GUARD").duration,3);
  const medic=growth.resolveGrowthSkill(skills.getSkill("u03-mend-restorer"),{heroId:"ally-03",discipline:"medic",ranks:{"u03-mend":2}});
  assert.equal(medic.cooldownMax,1,"positive cooldown cannot silently become zero");
  assert.equal(skills.getSkill("u03-mend-restorer").cooldownMax,2,"no canonical skill mutation");

  const roster=[units.UNIT_DEFS.alpha,wrapped[1].unitDef,wrapped[2].unitDef];
  const equipped=codex.equippedSignalCodex(roster,{
    version:1,revision:2,heroes:[{heroId:"alpha",discipline:"vanguard",ranks:{}},cnc,shadow]
  });
  assert(equipped.some(p=>p.unit==="CNC" && p.family==="Control" && p.cooldown>=1));
  assert(equipped.some(p=>p.unit==="SHADOW" && p.family==="Defense"));
  assert(!equipped.some(p=>p.family==="Recon"),"unimplemented scouting must not be fabricated");

  const before={unitTurn:2,activeId:"ally-02",units:[
    {id:"ally-02",defId:"ally-02",team:"ally",defeated:false,c:1,r:1,growth:cnc},
    {id:"alpha",defId:"alpha",team:"ally",defeated:false,c:0,r:1},
    {id:"h1",defId:"hostile",team:"enemy",defeated:false,c:3,r:1},
  ]};
  const plan=intent.announceIntent({
    id:"threat-step5",enemyId:"h1",kind:"ATTACK",
    targetUnitId:"alpha",targetTile:{c:0,r:1},impactTiles:[{c:0,r:1}],
    predictedEffect:"MAUL",warnsOnUnitTurn:2,resolvesOnUnitTurn:3,
    responses:["DISRUPT","REPOSITION"],fallbackPolicy:"CANCEL",
  },before).plan;
  const cycle={...scheduler.emptyThreatCycle(),pending:[{plan,action:{type:"skill",skillId:"hostile-maul",targetId:"alpha"}}]};
  const events=[{type:"status",unitId:"h1",text:"SPD DOWN"}];
  const countered=scheduler.interruptLockedThreatAfterControl(cycle,before,{...before},"ally-02","h1",pressureId,events);
  assert(countered.interrupted,"confirmed Disruptor must counter a locked threat");
  assert.equal(countered.cycle.pending.length,0);
  assert(countered.cycle.interruptedEnemyIds.includes("h1"),"enemy next activation must be consumed");
  assert(countered.cycle.ledger.some(e=>e.type==="threat_countered"&&e.reason==="COUNTERED"));
  assert(!scheduler.interruptLockedThreatAfterControl(cycle,before,before,"ally-02","h1",pressureId,[]).interrupted,
    "UI clicks or failed skills never interrupt");
  assert(!scheduler.interruptLockedThreatAfterControl(cycle,before,before,"ally-02","not-the-locked-source",pressureId,events).interrupted);
  assert(!scheduler.interruptLockedThreatAfterControl(cycle,
    {...before,units:before.units.map(u=>u.id==="ally-02"?{...u,growth:{...cnc,discipline:"pursuer"}}:u)},before,
    "ally-02","h1",pressureId,events).interrupted, "wrong discipline cannot interrupt");
  const battleStore=readFileSync("tactical-ops-src/store/battleStore.ts","utf8");
  assert(battleStore.includes("interruptedEnemyIds?.includes(actor.id)"),"interrupted enemy cannot reannounce instead of losing turn");
  assert(battleStore.includes("interruptLockedThreatAfterControl(threatCycle, battle, res.state"),"legal ability result must drive counter");
  const brief=readFileSync("tactical-ops-src/ui/App.tsx","utf8");
  assert(brief.includes("equippedSignalCodex(allies, previewGrowth)")&&brief.includes("SIGNAL CODEX"));
  console.log("PASS Step 5: 5 honest Codex families, real team sidegrade/mastery composition, bounded cooldowns, verified interrupt + enemy turn loss");
} finally {
  await vite.close();
}
