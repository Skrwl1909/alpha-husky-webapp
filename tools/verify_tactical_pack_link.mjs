import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {resolve} from "node:path";
import {createServer} from "vite";
import {mkdirSync,writeFileSync} from "node:fs";

const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false}});
const workers=resolve(process.argv[2] ?? "artifacts/pack-link-workers");
const profile={version:3,mode:"battle-v1",alpha:{hp:174,atk:42,def:26,spd:18},pet:null};
const outcomes=[];
try {
 const load=path=>server.ssrLoadModule("/tactical-ops-src/"+path+".ts");
 const [combat,skills,effects,howl,recover]=await Promise.all([
  "combat/battle","combat/skills","combat/effects","combat/lastHowlAuthority","combat/recoverAuthority"].map(load));
 for(const mode of ["last_howl","recover"]) for(const discipline of ["vanguard","howlkeeper"]) for(const rank of [1,2]) {
  const missionId="field-relay-recovery";
  const encounter={seed:7,runId:"synthetic",squadIds:["alpha","ally-02","ally-03"],
   activeCombatProfileV3:profile,combatProfileV3:profile,combatProfileV2:{pet:null},packMastery:{},missionId,
   fieldContext:{cycleId:7,pressure:2,approach:"standard",reportVersion:3,directiveTier:"standard",directiveSet:"pursuit"},
   rulesContract:{source:"BACKEND_SNAPSHOT",rulesetVersion:"tactical-intent-vnext.0",missionId,missionRevision:1,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1},
   playerGrowth:{version:2,revision:8,heroes:[{heroId:"alpha",discipline,ranks:{"alpha-howl":rank},packLink:"pack-link-v1"},
    ...["ally-02","ally-03"].map(heroId=>({heroId,discipline:null,ranks:{}}))]}};
  function worker(build,snapshot,command,version="pack_link_v1") {
   const result=spawnSync(process.execPath,[resolve(workers,`tactical_${mode}_engine_${version}.cjs`)],{
    encoding:"utf8",input:JSON.stringify({encounter:build,snapshot,command})});
   assert.equal(result.status,0,result.error?.message ?? result.stderr);
   return JSON.parse(result.stdout);
  }
  const old=structuredClone(encounter);delete old.playerGrowth.heroes[0].packLink;
  const oldStart=worker(old,undefined,undefined,"blood_scent_v1");
  const noLink=worker(old);
  assert.deepEqual(noLink,oldStart,"absent PACK LINK is byte-equivalent to previous worker output");
  const started=worker(encounter);
  const saved=started.snapshot??started;
  function board(distance) {
   const snapshot=structuredClone(saved);
   const battle=snapshot.battle;
   const alpha=battle.units.find(u=>u.defId==="alpha");
   const ally=battle.units.find(u=>u.defId==="ally-02");
   const shadow=battle.units.find(u=>u.defId==="ally-03");
   const enemy=battle.units.find(u=>u.team==="enemy");
   Object.assign(alpha,{c:3,r:3,hasActed:false});
   Object.assign(ally,{c:3+distance,r:3,hp:20});
   Object.assign(shadow,{c:0,r:0});
   Object.assign(enemy,{c:5,r:4,atk:40});
   battle.activeId=alpha.id;
   return {snapshot,battle,alpha,ally,enemy};
  }
  function cast(position) {
   return worker(encounter,position.snapshot,{type:"skill",skillId:"alpha-howl"});
  }
  const adjacent=board(1),distant=board(2);
  const moved=combat.tryMove(distant.battle,4,3);
  assert(moved.ok,"Alpha can spend movement to close formation");
  const movedPosition={snapshot:{...distant.snapshot,battle:moved.state}};
  const result=cast(adjacent),far=cast(distant);
  assert((cast(movedPosition).frames ?? cast(movedPosition).view.frames)[0].events.some(e=>e.text==="PACK LINK · GUARD"),
    "real legal movement changes HOWL eligibility");
  const frame=r=>(r.frames??r.view?.frames)[0];
  const alphaOf=b=>b.units.find(u=>u.defId==="alpha");
  const allyOf=b=>b.units.find(u=>u.defId==="ally-02");
  const nearBoard=frame(result).battle,farBoard=frame(far).battle;
  assert.equal(allyOf(nearBoard).statuses.find(s=>s.type==="GUARD").guardReduction,0.25);
  assert.equal(allyOf(farBoard).statuses.find(s=>s.type==="GUARD")?.guardReduction, discipline==="vanguard" ? 0.2 : undefined);
  assert.equal(alphaOf(nearBoard).packLinkUsed,true);
  assert.equal(alphaOf(farBoard).packLinkUsed,undefined,"no beneficiary preserves charge");
  assert(!alphaOf(nearBoard).statuses.some(s=>s.source==="pack-link-v1"),"Alpha receives no link GUARD");
  assert.deepEqual(cast(adjacent),result,"replaying saved command is deterministic");
  assert.equal(alphaOf(nearBoard).cooldowns["alpha-howl"],skills.unitSkills(adjacent.alpha)[2].cooldownMax);
  function enemyHit(input) {
   const b=structuredClone(input),enemy=b.units.find(u=>u.id===adjacent.enemy.id);
   b.activeId=enemy.id;enemy.hasActed=false;
   return skills.applySkill(b,enemy.skillIds[0],adjacent.ally.id);
  }
  const lethalDamage=enemyHit(farBoard).events.find(e=>e.type==="damage").amount;
  allyOf(nearBoard).hp=lethalDamage;allyOf(farBoard).hp=lethalDamage;
  const nearHit=enemyHit(nearBoard),farHit=enemyHit(farBoard);
  assert(nearHit.ok&&farHit.ok);
  const nearHp=allyOf(nearHit.state).hp,farHp=allyOf(farHit.state).hp;
  assert(nearHp>farHp,"positioning changes damage actually received");
  assert.equal(farHp,0,"distant teammate falls");assert(nearHp>0,"adjacent teammate survives");
  assert(frame(result).events.some(e=>e.text==="PACK LINK · GUARD"));
  const expired=combat.beginUnitTurn(nearBoard,adjacent.ally.id).state;
  assert(!allyOf(expired).statuses.some(s=>s.type==="GUARD"),"one-personal-turn GUARD expires");
  for(const scenario of ["spent","dead","enemy","out-of-range","diagonal","stronger"]) {
   const p=board(1);
   if(scenario==="spent")p.alpha.packLinkUsed=true;
   if(scenario==="dead")p.ally.defeated=true;
   if(scenario==="enemy")p.ally.team="enemy";
   if(scenario==="out-of-range")p.ally.c=6;
   if(scenario==="diagonal")p.ally.r=4;
   if(scenario==="stronger")p.ally.statuses=[{id:"strong",type:"GUARD",source:"existing",duration:3,value:0.5}];
   const after=frame(cast(p)).battle;
   const guard=allyOf(after).statuses.find(s=>s.type==="GUARD");
   if(scenario==="diagonal")assert.equal(guard.guardReduction,0.25);
   else if(scenario==="stronger"){assert.equal(guard.guardReduction,0.5);assert.equal(guard.duration,3);}
   else assert(!guard || guard.source!=="pack-link-v1",scenario);
  }
  const used=structuredClone(nearBoard);
  const a=alphaOf(used);used.activeId=a.id;a.hasActed=false;a.cooldowns["alpha-howl"]=0;
  const reset=allyOf(used);reset.statuses=[];
  const second=skills.applySkill(used,"alpha-howl");
  assert(second.ok);assert(!allyOf(second.state).statuses.some(s=>s.source==="pack-link-v1"),"no second activation");
  assert(!skills.applySkill(nearBoard,"alpha-howl").ok,"spent action is illegal");
  outcomes.push({mode,discipline,rank,adjacentHP:nearHp,distantHP:farHp,guard:0.25});
 }
 mkdirSync("artifacts/pack-link",{recursive:true});
 writeFileSync("artifacts/pack-link/combat-results.json",JSON.stringify(outcomes,null,2));
 console.log("PASS PACK LINK",JSON.stringify(outcomes));
} finally {await server.close();}
