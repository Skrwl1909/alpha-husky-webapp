import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createServer} from 'vite';
globalThis.window={location:{search:''},localStorage:{getItem:()=>null}};
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 mkdirSync('artifacts/intercept-agency',{recursive:true});
 const [ops,battle,ai,move,skill,target,side,types,scheduler,profiles,mastery]=await Promise.all([
  'data/operations','combat/battle','combat/ai','combat/movement','combat/skills','combat/targeting','data/shadowSidegrade','combat/types','combat/intentScheduler','combat/combatProfileV3','data/packMastery'
 ].map(p=>vite.ssrLoadModule('/tactical-ops-src/'+p+'.ts')));
 const d=(a,b)=>Math.abs(a.c-b.c)+Math.abs(a.r-b.r);let trackingDecision;
 function run(policy,approach='standard',withPet=false,tier='advanced',delay=false,revision=2,grid='10x7',directiveSet='pursuit',accepted=null) {
  types.selectAcceptedBattleRules(grid==='10x7'?{rulesetVersion:'tactical-intent-vnext.0'}:null);
  const pet={id:'synthetic',name:'Synthetic PET',img:''};
  const squad=['alpha','ally-02',withPet?'pet:synthetic':'ally-03'];
  const context=accepted?.run.fieldContext||{reportVersion:3,pressure:2,directiveTier:tier,directiveSet,approach};
  const mission=ops.missionForContext(ops.getMissionDef('field-relay-intercept'),context,accepted?.run.rulesContract?.missionRevision||revision);
  let spawns=ops.missionSpawnsForSquad(mission,squad,pet,approach);
  const pack=Object.fromEntries(squad.slice(1).map(id=>[id,{progress:8,selected:'B'}]));
  spawns=side.withTeammateSidegrades(spawns,{kodaSidegrade:'B',shadowSidegrade:'B',...accepted?.data,packMastery:mastery.parsePackMastery(accepted?.run.packMastery||pack)});
  spawns=profiles.applyRunCombatProfile(spawns,accepted?.run.combatProfileV3||{version:3,mode:'battle-v1',alpha:{hp:128,atk:33,def:15,spd:15},pet:withPet?{...pet,hp:85,atk:22,def:8,spd:14}:null},accepted?.run.combatProfileV2||{pet:withPet?pet:null});
  const rules=ops.missionBattleRules(mission,false,context);
  const protectionBuild=policy==='pursuit-protect'?{version:2,revision:8,heroes:['alpha','ally-02','ally-03'].map(heroId=>({heroId,discipline:heroId==='ally-03'?'sentinel':null,ranks:{}}))}:undefined;
  let state=battle.createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive,accepted?.run.playerGrowth||protectionBuild);
  let cycle=scheduler.emptyThreatCycle();const actions=[];let heals=0,controls=0;
  function cast(actor,s,id) {
   const before=state,res=battle.trySkill(state,s.id,id);
   if(!res.ok)return false;
   state=res.state;const interrupted=scheduler.interruptLockedThreatAfterControl(cycle,before,state,actor.id,id,s.id,res.events);cycle=interrupted.cycle;
   if(s.effects.some(e=>e.kind==='heal'))heals++;
   if(s.effects.some(e=>e.kind==='status'&&e.status==='SPD_DOWN'))controls++;
   actions.push({round:before.round,actor:actor.id,skill:s.id,target:id,events:res.events.filter(e=>['damage','heal','status','defeat'].includes(e.type))});return true;
  }
  function allyTurn() {
   let actor=state.units.find(u=>u.id===state.activeId);
   if(delay&&actor.id==='ally-02'&&state.round===3){state=battle.trySkip(state).state;return}
   const enemies=state.units.filter(u=>u.team==='enemy'&&!u.defeated),courier=enemies.find(u=>u.id==='courier');
   if(policy==='idle'){state=battle.trySkip(state).state;return}
   const block=policy==='blockade'&&actor.id==='alpha';
   const rally=policy.startsWith('pursuit')&&actor.id==='alpha'&&state.unitTurn<=5;
   const protect=policy==='pursuit-protect'&&actor.id==='ally-03'&&state.round===1;
   const destination=protect?state.units.find(u=>u.id==='alpha'):rally?{c:2,r:1}:block?state.objective.exit:courier;
   if(!actor.hasMoved&&destination){
    const cells=move.reachableCells(actor,state.units).filter(c=>d(c,destination)<d(actor,destination)).sort((a,b)=>d(a,destination)-d(b,destination)||a.r-b.r||a.c-b.c);
    if(cells[0]){const res=battle.tryMove(state,cells[0].c,cells[0].r);if(res.ok){state=res.state;actions.push({round:state.round,actor:actor.id,move:cells[0]})}}
   }
   actor=state.units.find(u=>u.id===state.activeId);if(!actor||state.outcome!=='ongoing')return;
   const ready=skill.availableSkills(state,actor).filter(s=>s.ready);
   if(rally){const howl=ready.find(s=>s.slot==='A3');if(howl&&cast(actor,howl))return}
   if(protect){const ward=ready.find(s=>s.slot==='A3');if(ward&&cast(actor,ward))return}
   if(policy==='blockade'){
    const wounded=state.units.filter(u=>u.team==='ally'&&!u.defeated&&u.hp<u.maxHp*.8).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
    for(const s of ready.filter(s=>s.effects.some(e=>e.kind==='heal'))){const id=s.targetType==='ALLY_SINGLE'?wounded.find(u=>target.validTargetIds(state.units,actor,s).includes(u.id))?.id:undefined;if(wounded.length&&(s.targetType!=='ALLY_SINGLE'||id)&&cast(actor,s,id))return}
   }
   const attacks=ready.filter(s=>s.effects.some(e=>e.kind==='damage'||e.kind==='status'&&e.status==='SPD_DOWN')).sort((a,b)=>policy==='blockade'?Number(b.effects.some(e=>e.status==='SPD_DOWN'))-Number(a.effects.some(e=>e.status==='SPD_DOWN')):(b.effects.find(e=>e.kind==='damage')?.multiplier||0)-(a.effects.find(e=>e.kind==='damage')?.multiplier||0));
   const focus=policy==='patrol'?enemies.filter(u=>u.id!=='courier').concat(courier?[courier]:[]):courier?[courier,...enemies.filter(u=>u.id!=='courier')]:enemies;
   for(const enemy of focus)for(const s of attacks)if(target.validTargetIds(state.units,actor,s).includes(enemy.id)&&cast(actor,s,enemy.id))return;
   state=battle.trySkip(state).state;
  }
  for(let n=0;n<220&&state.outcome==='ongoing';n++){
   state=battle.advanceToNext(state).state;if(state.outcome!=='ongoing')break;
   const actor=state.units.find(u=>u.id===state.activeId);assert(actor);
   cycle=scheduler.pruneInvalidThreats(cycle,state);
   if(actor.team==='ally'){cycle=scheduler.markAlliedReaction(cycle,state);if(!trackingDecision&&cycle.pending.some(t=>t.plan.targetTile===null&&t.plan.targetUnitId===actor.id)){trackingDecision=structuredClone({state,cycle})}allyTurn();continue}
   const locked=cycle.pending.find(t=>t.plan.enemyId===actor.id);
   if(locked){const res=scheduler.resolveEnemyThreat(cycle,state);cycle=res.cycle;if(res.state!==state){state=res.state;actions.push({round:state.round,actor:actor.id,resolved:locked.action,events:res.events});continue}state=battle.trySkip(state).state;continue}
   const next=scheduler.queueEnemyThreat(cycle,state);
   if(next.pending.length>cycle.pending.length){cycle=next;state=battle.trySkip(state).state;continue}
   const action=ai.chooseAiAction(state);assert(ai.aiUsesLegalRules(state,action));const res=battle.applyAi(state,action);state=res.state;
   actions.push({round:state.round,actor:actor.id,ai:action,events:res.events});
  }
  return {policy,approach,withPet,tier,delay,revision,grid,directiveSet,outcome:state.outcome,rounds:state.round,failure:state.failureReason,damage:state.damageTaken,heals,controls,report:state.results?{victory:state.results.victory,turns:state.results.turns,objectiveComplete:state.results.objectiveComplete,healingActions:state.healingActions||0,squadStanding:state.results.squadStanding,squadDeployed:state.results.squadDeployed,...(state.failureReason?{failureReason:state.failureReason}:{})}:null,allies:state.units.filter(u=>u.team==='ally').map(u=>({id:u.id,hp:u.hp,c:u.c,r:u.r})),actions};
 }
 if(process.env.INTERCEPT_ACCEPTED){const accepted=JSON.parse(readFileSync(process.env.INTERCEPT_ACCEPTED,'utf8'));const row=run('pursuit','standard',false,'advanced',false,2,'10x7','pursuit',accepted);assert.equal(row.outcome,'victory');writeFileSync(process.env.INTERCEPT_ACCEPTED_OUT,JSON.stringify(row,null,2));console.log('PASS exact accepted revision-2 engine trace');}
 else {
 const rows=[];
 for(const approach of ['standard','south'])for(const withPet of [false,true])for(const policy of ['rush','pursuit','blockade','patrol','idle'])rows.push(run(policy,approach,withPet));
 for(const withPet of [false,true])for(const policy of ['pursuit','blockade'])rows.push(run(policy,'standard',withPet,'advanced',true));
 const protectedRun=run('pursuit-protect');rows.push(protectedRun);
 assert(protectedRun.actions.some(a=>a.events?.some(e=>e.buildEvidence?.includes('GUARD prevented'))),'real WARD must mitigate a tracking shot');
 for(const withPet of [false,true])for(const policy of ['pursuit','rush','blockade'])rows.push(run(policy,'standard',withPet,'advanced',false,2,'10x7','attrition'));
 for(const withPet of [false,true])for(const policy of ['pursuit','rush','blockade'])rows.push(run(policy,'standard',withPet,'standard'));
 const baseline=[];for(const grid of ['10x7','8x5'])for(const withPet of [false,true])for(const policy of ['rush','pursuit','idle'])baseline.push(run(policy,'standard',withPet,'advanced',false,1,grid));
 assert(rows.every(r=>r.outcome!=='ongoing'),'all policies must resolve without a stall');
 for(const withPet of [false,true]){
  const row=p=>rows.find(r=>r.policy===p&&r.approach==='standard'&&r.withPet===withPet&&!r.delay&&r.tier==='advanced'&&r.directiveSet==='pursuit');
  assert.equal(row('pursuit').outcome,'victory');assert.equal(row('rush').outcome,'victory');
  assert(row('pursuit').rounds<row('rush').rounds&&row('pursuit').damage>row('rush').damage,'speed versus exposure must be a real trade');
  assert.equal(rows.find(r=>r.policy==='blockade'&&r.approach==='south'&&r.withPet===withPet).outcome,'victory');
  assert.equal(row('idle').failure,'TARGET_ESCAPED');
 }
 assert.equal(rows.find(r=>r.policy==='rush'&&r.approach==='south'&&!r.withPet).failure,'TARGET_ESCAPED','pursuit policy cannot solve every opening');
 const original=baseline.find(r=>r.grid==='10x7'&&!r.withPet&&r.policy==='rush');assert.equal(original.rounds,2);assert.equal(original.damage,0);
 writeFileSync('artifacts/intercept-agency/baseline.json',JSON.stringify(baseline,null,2));
 mkdirSync('artifacts/intercept-agency',{recursive:true});writeFileSync('artifacts/intercept-agency/combat.json',JSON.stringify(rows,null,2));
 if(trackingDecision)writeFileSync('artifacts/intercept-agency/tracking-decision.json',JSON.stringify(trackingDecision,null,2));
 console.table(rows.slice(0,20).map(({actions,allies,report,...r})=>r));
 console.log('PASS '+rows.length+' revised encounters and '+baseline.length+' legacy traces; no global strategy dominates tested openings, tempo and damage');
 }
}finally{await vite.close()}
