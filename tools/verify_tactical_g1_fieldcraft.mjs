#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 const load=p=>server.ssrLoadModule('/tactical-ops-src/'+p+'.ts');
 const [g,preview,side,defs,data,battle,skills,effects,field,host,target]=await Promise.all(['data/playerGrowth','data/buildPreview','data/shadowSidegrade','data/units','data/skills','combat/battle','combat/skills','combat/effects','ui/fieldcraft','host/foundationProgression','combat/targeting'].map(load));
 const matrix=[]; const dead=[];
 for(const [heroId,paths] of Object.entries(g.HERO_PATHS)) for(const path of paths) for(const choice of [null,'A','B']) for(const progress of [0,3,8]) for(const signature of progress===8?['A','B']:[null]) {
  const choices={kodaSidegrade:choice,shadowSidegrade:choice,packMastery:{[heroId]:{progress,stage:progress===8?3:progress===3?2:1,selected:signature}}};
  for(const id of g.HERO_SKILLS[heroId]) for(const rank of [1,2]) {
   const base=preview.growthPreviewBase(id,choices), old={heroId,discipline:path,ranks:rank===1?{}:{[id]:1}};
   const before=g.resolveGrowthSkill(base,{...old,rulesVersion:2});
   const after=g.resolveGrowthSkill(base,{...old,rulesVersion:2,ranks:{[id]:rank}});
   const changes=preview.skillDeltas(before,after);
   const legacy=preview.rankChanges(base,old,rank,path);
   const row={heroId,path,sidegrade:choice,mastery:progress,signature,skill:id,rank,legacyChanges:legacy,changes};
   matrix.push(row);if(!legacy.length)dead.push(row);
   assert(changes.length,JSON.stringify(row));
   assert(after.cooldownMax>=0);
   for (const disrupted of [false,true]) {
    const roster=Object.keys(g.HERO_PATHS).map(id=>({heroId:id,discipline:id===heroId?path:g.HERO_PATHS[id][0],ranks:id===heroId?{[row.skill]:rank}:{}}));
    const other=heroId==='alpha'?'ally-03':'alpha';
    const spawns=side.withTeammateSidegrades([{id:heroId,defId:heroId,c:1,r:1},{id:other,defId:other,c:2,r:1},{id:'foe',defId:'hostile',c:1,r:2}],choices);
    let st=battle.createBattle(null,spawns,null,null,null,disrupted?{type:'DISRUPTED_SUPPORT',name:'Test disruption',copy:'',supportCooldownExtra:1}:null,{version:2,revision:1,heroes:roster});
    st={...st,activeId:heroId,units:st.units.map(u=>u.team==='ally'?{...u,hp:1}:u)};
    const skill=skills.unitSkills(st.units.find(u=>u.id===heroId)).find(s=>g.canonicalGrowthSkillId(s.id)===id);
    const applied=skills.applySkill(st,skill.id,skill.targetType==='ENEMY_SINGLE'?'foe':other);
    assert(applied.ok,JSON.stringify(row));
    assert(applied.events.some(e=>['status','damage','heal'].includes(e.type)),JSON.stringify(row));
    const actorAfter=applied.state.units.find(u=>u.id===heroId);
    assert.equal(actorAfter.cooldowns[skill.id],skill.cooldownMax+(disrupted && skill.effects.some(e=>e.kind==='heal'||(e.kind==='status'&&e.on==='aoe_allies'))&&!skill.ignoreDisruption?1:0));
   }

   assert.deepEqual(g.resolveGrowthSkill(base,old),g.resolveGrowthSkill(base,{...old,rulesVersion:1}),'Legacy unchanged');
  }
 }
 assert.equal(matrix.length,432);assert.equal(dead.length,39);
 const heroes=[{heroId:'alpha',discipline:'vanguard',ranks:{}},{heroId:'ally-02',discipline:'pursuer',ranks:{}},{heroId:'ally-03',discipline:'medic',ranks:{'u03-mend':2}}];
 const snap={version:2,revision:10,heroes};
 const spawns=side.withTeammateSidegrades([{id:'alpha',defId:'alpha',c:4,r:1},{id:'ally-03',defId:'ally-03',c:0,r:1},{id:'enemy',defId:'hostile',c:6,r:1}],{shadowSidegrade:'B',packMastery:{'ally-03':{progress:8,stage:3,selected:'A'}}});
 let state=battle.createBattle(null,spawns,null,null,null,null,snap);
 const accepted=structuredClone(state.units.find(u=>u.id==='ally-03').growth);
 snap.heroes[2].ranks['u03-mend']=0;
 assert.deepEqual(state.units.find(u=>u.id==='ally-03').growth,accepted,'Frozen copy');
 const actor=state.units.find(u=>u.id==='ally-03');
 const mend=skills.unitSkills(actor).find(s=>s.name==='MEND');
 assert.equal(mend.maxRange,4);assert.equal(mend.cooldownMax,1);assert.equal(mend.effects[0].base,40);
 state={...state,activeId:actor.id,units:state.units.map(u=>u.id==='alpha'?{...u,hp:20}:u)};
 const result=skills.applySkill(state,mend.id,'alpha');assert(result.ok);
 const patient=result.state.units.find(u=>u.id==='alpha');assert(patient.hp>20);
 assert.equal(effects.incomingDamageMultiplier(patient),0.8,'V2 rescue GUARD really reduces by 20%');
 assert(result.events.some(e=>e.buildEvidence?.includes('beyond the unranked')));
 assert(result.events.some(e=>e.type==='heal'&&e.amount>0));
 const failed=skills.applySkill({...state,units:state.units.map(u=>u.id==='alpha'?{...u,c:7}:u)},mend.id,'alpha');
 assert(!failed.ok);assert.equal(failed.events.length,0,'No false proof on illegal action');
 const healthy=skills.applySkill({...state,units:state.units.map(u=>u.id==='alpha'?{...u,hp:u.maxHp}:u)},mend.id,'alpha');
 assert(!healthy.events.some(e=>e.type==='heal'||e.type==='status'),'No heal/conditional guard proof on full HP');
 const hitState={...result.state,activeId:'enemy',units:result.state.units.map(u=>u.id==='enemy'?{...u,c:5,r:1}:u)};
 const hit=skills.applySkill(hitState,'hostile-strike','alpha');assert(hit.ok);
 assert(hit.events.some(e=>e.buildEvidence?.includes('GUARD prevented')));
 const proof=field.recordFieldcraft({runId:'r',missionId:'m',moments:[]},[...result.events,...hit.events]);
 assert(field.fieldcraftResults(proof,'r','m').length);assert.equal(field.fieldcraftResults(proof,'stale','m').length,0);
 assert.equal(field.recordFieldcraft(null,result.events),null);
 assert.deepEqual(field.fieldcraftResults({...proof,fieldcraft:[]},'r','m'),[]);
 // RESTORER must gain real AoE radius, never an inert maxRange.
 const restorer=preview.growthPreviewBase('u03-mend',{shadowSidegrade:'A'});
 const r1=g.resolveGrowthSkill(restorer,{heroId:'ally-03',discipline:'medic',rulesVersion:2,ranks:{'u03-mend':1}});
 assert.equal(r1.radius,2);assert.equal(r1.maxRange,0);
 const legacy=g.resolveGrowthSkill(data.getSkill('u03-mend'),{heroId:'ally-03',discipline:'medic',ranks:{'u03-mend':2}});
 assert.equal(legacy.maxRange,3);assert.equal(legacy.effects.length,1);
 // Sentinel doctrine remains useful with WARDEN; guard strengths never overwrite stronger protection.
 const warden=g.resolveGrowthSkill(data.getSkill('u03-pack-warden'),{heroId:'ally-03',discipline:'sentinel',rulesVersion:2,ranks:{}});
 assert.equal(warden.effects[0].duration,3);
 const lowGuard={...state,units:state.units.map(u=>u.id==='alpha'?{...u,hp:20,statuses:[{id:'guard',type:'GUARD',source:'warden',duration:2,value:.5,guardReduction:.5}]}:u)};
 const protectedResult=skills.applySkill(lowGuard,mend.id,'alpha');
 assert.equal(effects.incomingDamageMultiplier(protectedResult.state.units.find(u=>u.id==='alpha')),0.5);
 assert.throws(()=>g.validateGrowthSnapshot({...snap,version:3}));
 assert.equal(g.growthHero({version:1,revision:1,heroes:[{...heroes[2],rulesVersion:2}]},'ally-03').rulesVersion,1);
 // Wire format remains server owned, no fabricated points or respec migration.
 const saved={...snap,earnedPoints:2,spentPoints:2,claimedFirstClears:['a','b'],heroes:heroes.map(h=>({...h,ranks:h.heroId==='ally-03'?{'u03-mend':2}:{},respecUsed:false}))};
 assert(host.parseGrowthProgression(saved,11));assert.equal(host.parseGrowthProgression({...saved,spentPoints:1},11),null);
 mkdirSync('artifacts/g1',{recursive:true});writeFileSync('artifacts/g1/rank-matrix.json',JSON.stringify({compositions:matrix.length,uniqueDoctrineRankPairs:36,legacyNoOps:dead.length,v2NoOps:0,rows:matrix},null,2));
 console.log('PASS G1: 36 doctrine/rank pairs × sidegrades × 0/3/8 A/B = 432 rows; 39 legacy no-ops / 0 V2; real rescue reach/heal/guard/damage proof, failure gating, frozen versions and parsing.');
} finally {await server.close()}
