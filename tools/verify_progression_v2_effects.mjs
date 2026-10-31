/** Real engine actions from legal tactical positions, with the same A/B before/after. */
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
globalThis.window={location:{search:''},localStorage:{getItem:()=>null}};
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
 const [ops,mastery,side,battle,types,skills]=await Promise.all(['/tactical-ops-src/data/operations.ts','/tactical-ops-src/data/packMastery.ts','/tactical-ops-src/data/shadowSidegrade.ts','/tactical-ops-src/combat/battle.ts','/tactical-ops-src/combat/types.ts','/tactical-ops-src/data/skills.ts'].map(p=>vite.ssrLoadModule(p)));
 types.selectAcceptedBattleRules(null);
 const pet={id:'veteran-test-pet',name:'Synthetic PET',img:''};
 const base=ops.getMissionDef('field-relay-hold');
 const context={reportVersion:3,directiveTier:'advanced',directiveSet:'attrition',pressure:2};
 const veteran={version:1,credits:12,missionIds:['field-relay-recovery','field-relay-intercept'],lastCycle:30,enabled:true};
 const rows=[];
 function ready(state,id){
  for(let i=0;i<35;i++){
   const advanced=battle.advanceToNext(state);state=advanced.state;
   if(state.activeId===id)return state;
   assert.equal(state.outcome,'ongoing');const skipped=battle.trySkip(state);assert(skipped.ok);state=skipped.state;
  }throw Error('actor did not become ready');
 }
 function build(squad,unit,enabled,scenario){
  const pack=Object.fromEntries(squad.filter(id=>id!=='alpha').map(id=>[id,{progress:8,stage:3,selected:'A',unlockedOptions:['A','B'],...(id===unit?{veteran:{...veteran,missionIds:id==='ally-03'?['field-relay-hold','field-squad-survival']:veteran.missionIds,enabled}}:{})}]));
  // Parse the exact server-shaped record before projecting authored skills.
  const parsed=mastery.parsePackMastery(pack);
  let spawns=ops.missionSpawnsForSquad(scenario==='PET'?ops.getMissionDef('field-relay-recovery'):base,squad,pet);
  const positions={alpha:{c:1,r:3},'ally-02':{c:2,r:1},'ally-03':{c:2,r:2},['pet:'+pet.id]:{c:3,r:2},h1:{c:4,r:1},h2:{c:4,r:2}};
  spawns=spawns.map(s=>({...s,...(positions[s.id]||{})}));
  spawns=side.withTeammateSidegrades(spawns,{kodaSidegrade:'B',shadowSidegrade:'B',packMastery:parsed});
  const spec=ops.missionBattleRules(scenario==='PET'?ops.getMissionDef('field-relay-recovery'):base,false,context);
  return battle.createBattle(null,spawns,spec.objective,spec.reinforcement,null,spec.directive);
 }
 for(const squad of [['alpha','ally-02','ally-03'],['alpha','ally-02','pet:'+pet.id]]){
  const pair=[];
  for(const enabled of [false,true]){
   let state=ready(build(squad,'ally-02',enabled,'CNC'),'ally-02');
   const actor=state.units.find(u=>u.id==='ally-02'),skill=actor.skillIds.map(id=>skills.SKILLS[id]).find(s=>s.slot==='A3');
   const used=battle.trySkill(state,skill.id,'h1');assert(used.ok);
   pair.push({enabled,targetType:skill.targetType,cooldown:skill.cooldownMax,targets:used.state.units.filter(u=>u.team==='enemy').map(u=>({id:u.id,hp:u.hp,statuses:u.statuses}))});
  }
  assert.equal(pair[0].targets[1].statuses.length,0);assert(pair[1].targets[1].statuses.length>0,'CNC controls second clustered enemy');
  assert(pair[1].cooldown>pair[0].cooldown,'CNC utility has a frequency cost');rows.push({kind:'CNC',squad,pair});
 }
 for(const squad of [['alpha','ally-02','ally-03'],['alpha','ally-03','pet:'+pet.id]]){
  const pair=[];
  for(const enabled of [false,true]){
   let state=ready(build(squad,'ally-03',enabled,'SHADOW'),'ally-03');
   const actor=state.units.find(u=>u.id==='ally-03'),skill=actor.skillIds.map(id=>skills.SKILLS[id]).find(s=>s.slot==='A3');
   const used=battle.trySkill(state,skill.id);assert(used.ok);
   pair.push({enabled,radius:skill.radius,cooldown:skill.cooldownMax,guard:used.state.units.find(u=>u.id==='ally-03').statuses.find(s=>s.type==='GUARD')});
  }
  assert.equal(pair[0].guard.duration,2);assert.equal(pair[1].guard.duration,3);assert(pair[1].radius<pair[0].radius);rows.push({kind:'SHADOW',squad,pair});
 }
 for(const squad of [['alpha','ally-02','pet:'+pet.id],['alpha','ally-03','pet:'+pet.id]]){
  const pair=[];
  for(const enabled of [false,true]){
   let state=ready(build(squad,'pet:'+pet.id,enabled,'PET'),'pet:'+pet.id);
   while(state.round%2){const skip=battle.trySkip(state);assert(skip.ok);state=ready(skip.state,'pet:'+pet.id)}
   const actor=state.units.find(u=>u.id===state.activeId),snare=actor.skillIds.map(id=>skills.SKILLS[id]).find(s=>s.slot==='A2');
   const recover=battle.tryRecover(state);
   pair.push({enabled,range:actor.recoverRange,hamstringCooldown:snare.cooldownMax,canRecover:recover.ok,outcome:recover.state.outcome});
  }
  assert.equal(pair[0].canRecover,false);assert.equal(pair[1].canRecover,true);assert(pair[1].hamstringCooldown>pair[0].hamstringCooldown);rows.push({kind:'PET',squad,pair});
 }
 mkdirSync('artifacts/progression-v2',{recursive:true});writeFileSync('artifacts/progression-v2/effects.json',JSON.stringify(rows,null,2));
 console.log('PASS Veteran effect proofs: CNC cluster control / slower recharge; SHADOW longer guard / smaller area; PET recovery reach / slower HAMSTRING; two legal squads each');
}finally{await vite.close()}
