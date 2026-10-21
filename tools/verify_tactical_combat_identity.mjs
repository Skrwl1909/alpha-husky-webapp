import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const [id, growth, pack, companion] = await Promise.all([
    "/tactical-ops-src/ui/combatIdentity.ts",
    "/tactical-ops-src/data/playerGrowth.ts",
    "/tactical-ops-src/data/packMastery.ts",
    "/tactical-ops-src/data/companion.ts",
  ].map(path => vite.ssrLoadModule(path)));

  const alpha = { id:"alpha",defId:"alpha",role:"alpha",c:1,r:1,
    growth:{heroId:"alpha",discipline:"vanguard",ranks:{"alpha-howl":2,"alpha-strike":1}} };
  assert.equal(id.affinityFor(alpha),"alpha");
  assert.equal(id.combatTier(alpha,"alpha-howl"),"rank2");
  assert.equal(id.skillRankLabel(alpha,"alpha-howl"),"R2");
  assert.equal(id.combatIdentityLabel(alpha),"VANGUARD");
  assert.deepEqual(id.skillChangePreview("alpha-strike",{
    heroId:"alpha",discipline:"vanguard",ranks:{"alpha-strike":1}
  },2,"vanguard"),["RANGE 2 → 3"]);

  const damage = [{type:"ticker",text:"Alpha attacks"},{type:"damage",unitId:"enemy",amount:23,text:"-23"}];
  assert.equal(id.confirmedSkillMoment(alpha,"alpha-strike",[],1,false),null,"unconfirmed attack is silent");
  assert.equal(id.confirmedSkillMoment(alpha,"alpha-strike",damage,2,false)?.consequence,"−23 HP");
  assert.equal(id.confirmedSkillMoment(alpha,"alpha-strike",damage,2,false)?.tier,"rank1");

  const cnc={id:"cnc",defId:"ally-02",role:"ranged",c:2,r:1,
    growth:{heroId:"ally-02",discipline:"disruptor",ranks:{"u02-suppress":2}},
    combatMastery:{progress:8,stage:3,selected:"A"}};
  assert.equal(id.skillRankLabel(cnc,"u02-suppress:mastery:CNC:3:A"),"SIGNATURE");
  const control=[{type:"status",unitId:"enemy",text:"ATK REDUCED",kind:"status"}];
  const interrupted=id.confirmedSkillMoment(cnc,"u02-suppress:mastery:CNC:3:A",control,3,true);
  assert.equal(interrupted?.consequence,"ENEMY INTENT CANCELED");
  assert.equal(id.confirmedSkillMoment(cnc,"u02-suppress:mastery:CNC:3:A",control,4,false)?.interrupted,false);
  const untrained={...cnc,combatMastery:{progress:2,stage:1,selected:null}};
  assert.equal(id.skillMasteryActive(untrained,"u02-suppress"),null);

  const shadow={id:"shadow",defId:"ally-03",role:"support",c:0,r:0,
    growth:{heroId:"ally-03",discipline:"medic",ranks:{"u03-mend":1}},
    combatMastery:{progress:8,stage:3,selected:"B"}};
  const heal=[{type:"heal",unitId:"alpha",amount:14,text:"+14",kind:"heal"}];
  assert.equal(id.confirmedSkillMoment(shadow,"u03-mend",heal,5,false)?.consequence,"+14 HP");
  assert.equal(id.skillMasteryActive(shadow,"u03-pack"),"signature");
  assert.equal(id.skillMasteryActive(shadow,"u03-mend"),null,"SILENT SHELTER does not grant STEADY HAND");

  const pet={id:"pet:p1",defId:"pet:p1",role:"companion",c:1,r:1,
    combatMastery:{progress:8,stage:3,selected:"B"}};
  assert.equal(id.confirmedPathfinderMove(pet,{...pet,c:1,r:1},6),null,"no movement = no FX");
  assert.equal(id.confirmedPathfinderMove(pet,{...pet,c:2,r:1},7)?.title,"PATHFINDER · SIGNATURE");
  assert.equal(id.confirmedPathfinderMove({...pet,combatMastery:{progress:3,stage:2,selected:null}},{...pet,c:2},8),null,"stage3 required");
  const petDef=companion.tacticalPetDef({id:"p1",name:"FRACTURE SENTINEL",img:"https://example.test/pet.png"});
  const frozen=pack.withPackMastery([{id:"pet:p1",defId:"pet:p1",c:1,r:1,unitDef:petDef}],{
    "pet:p1":{progress:8,stage:3,selected:"B",unlockedOptions:["A","B"]}
  });
  assert.equal(frozen[0].unitDef.move,petDef.move+1,"Pathfinder changes canonical move");
  assert.equal(frozen[0].unitDef.combatMastery.selected,"B","frozen mastery identity");
  assert.equal(petDef.combatMastery,undefined,"source PET unchanged");
  const trained=pack.withPackMastery([{id:"ally-02",defId:"ally-02",c:1,r:2}],{
    "ally-02":{progress:3,stage:2,selected:null,unlockedOptions:[]}
  });
  assert.equal(trained[0].unitDef.combatMastery.stage,2,"3/8 provenance carries to combat unit");
  assert.equal(growth.HERO_SKILLS.alpha.length,3,"no new battle slot");

  const source=readFileSync("tactical-ops-src/store/battleStore.ts","utf8");
  const battle=readFileSync("tactical-ops-src/ui/Battle.tsx","utf8");
  const css=readFileSync("tactical-ops-src/tactical.css","utf8");
  const result=readFileSync("tactical-ops-src/ui/PackMastery.tsx","utf8");
  assert(source.includes("publishMoment(confirmedSkillMoment(actor, skillId, res.events"));
  assert(source.includes("publishMoment(confirmedSkillMoment(actor, selectedSkillId, res.events"));
  assert(source.includes("publishMoment(confirmedPathfinderMove(actor, moved"));
  assert(source.includes("get().combatMoment?.id === moment.id"),"sequence-safe transient FX");
  assert(battle.includes("t-master-fx") && battle.includes("t-master-moment") && battle.includes("t-skill-rank"));
  assert(result.includes("SIGNATURE EVOLUTION") && result.includes("AWAKENED"));
  assert(css.includes("prefers-reduced-motion:reduce"),"reduced motion");
  console.log("PASS Tactical Mastery V1: pure event truth, frozen progression, all 4 identities, FX + UI contracts");
} finally {
  await vite.close();
}
