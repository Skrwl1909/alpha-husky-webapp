/** Isolate the announced shot from a captured real encounter decision; no invented outcome. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
globalThis.window={location:{search:''},localStorage:{getItem:()=>null}};
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 const [battle,move,scheduler,types,ui,contracts,ops,side,mastery]=await Promise.all(['combat/battle','combat/movement','combat/intentScheduler','combat/types','ui/battlePresentation','combat/intentContract','data/operations','data/shadowSidegrade','data/packMastery'].map(p=>vite.ssrLoadModule('/tactical-ops-src/'+p+'.ts')));
 types.selectAcceptedBattleRules({rulesetVersion:'tactical-intent-vnext.0'});
 const captured=JSON.parse(readFileSync('artifacts/intercept-agency/tracking-decision.json','utf8')),rows=[];
 const accepted=JSON.parse(readFileSync('tools/fixtures/intercept-accepted.json','utf8'));
 side.withTeammateSidegrades(ops.missionSpawnsForSquad(ops.getMissionDef('field-relay-intercept'),accepted.run.squadIds),{kodaSidegrade:'B',shadowSidegrade:'B',packMastery:mastery.parsePackMastery(accepted.run.packMastery)});
 const display=(state,cycle)=>ui.deriveBattlePresentation({battle:state,busy:false,activeRulesetVersion:'tactical-intent-vnext.0',threats:cycle.pending.map(t=>t.plan),combatMoment:null,combatFx:[],consequences:[],floats:[],banner:null,mission:null});
 for(const mode of ['sidestep','out-range','close-range']) {
  let {state,cycle}=structuredClone(captured);
  const lock=cycle.pending.find(t=>t.plan.targetTile===null),actor=state.units.find(u=>u.id===state.activeId),source=state.units.find(u=>u.id===lock.plan.enemyId);
  assert.equal(actor.id,lock.plan.targetUnitId);assert.equal(lock.action.type,'skill');
  const dest=move.reachableCells(actor,state.units).find(p=>{const range=move.chebyshev(p,source);return mode==='sidestep'?Math.abs(p.c-actor.c)+Math.abs(p.r-actor.r)===1&&range>=2&&range<=4:mode==='out-range'?range>4:range<2});assert(dest);
  const moved=battle.tryMove(state,dest.c,dest.r);assert(moved.ok);state=moved.state;
  cycle=scheduler.pruneInvalidThreats(cycle,state);assert(cycle.pending.some(t=>t.plan.id===lock.plan.id),'movement must not cancel a tracking lock');
  assert.deepEqual(display(state,cycle).threats[0].impactTiles,[dest]);assert.match(display(state,cycle).detail,/TRACKING LOCK/);
  const before=state.units.find(u=>u.id===actor.id).hp;state=battle.trySkip(state).state;
  let resolved;
  // Skip unrelated activations to isolate exactly this engine/scheduler resolution.
  for(let turn=0;turn<24;turn++){
   state=battle.advanceToNext(state).state;
   if(state.activeId===source.id){resolved=scheduler.resolveEnemyThreat(cycle,state);break}
   state=battle.trySkip(state).state;
  }
  assert(resolved);const after=resolved.state.units.find(u=>u.id===actor.id).hp;
  assert.equal(resolved.cycle.pending.length,0);
  if(mode==='sidestep')assert(after<before,'the same marked ally must actually take damage after a sidestep');
  else assert.equal(after,before,'breaking firing range must invalidate the shot without retargeting');
  rows.push({mode,from:{c:actor.c,r:actor.r},to:dest,before,after,events:resolved.cycle.ledger.slice(-2)});
 }
 // Existing DISRUPTOR interrupt needs a legal PRESSURE status event, not just a preview.
 for(const disruptor of [false,true]){
  let {state,cycle}=structuredClone(captured);state=battle.trySkip(state).state;
  for(let n=0;n<20;n++){state=battle.advanceToNext(state).state;if(state.activeId==='ally-02')break;state=battle.trySkip(state).state}
  assert.equal(state.activeId,'ally-02');
  if(disruptor)state={...state,units:state.units.map(u=>u.id==='ally-02'?{...u,growth:{heroId:'ally-02',discipline:'disruptor',ranks:{},rulesVersion:2}}:u)};
  const actor=state.units.find(u=>u.id==='ally-02'),id=actor.skillIds.find(id=>id.startsWith('u02-pressure-disruptor'));
  const cast=battle.trySkill(state,id,'h2');assert(cast.ok);
  const interrupted=scheduler.interruptLockedThreatAfterControl(cycle,state,cast.state,actor.id,'h2',id,cast.events);
  assert.equal(interrupted.interrupted,disruptor);
  if(disruptor)assert(interrupted.cycle.interruptedEnemyIds.includes('h2'));
  rows.push({mode:disruptor?'disruptor-interrupt':'ordinary-slow',interrupted:interrupted.interrupted,events:cast.events});
 }
 const valid={rulesetVersion:'tactical-intent-vnext.0',missionId:'field-relay-intercept',missionRevision:2,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1,source:'BACKEND_SNAPSHOT'};
 assert.equal(contracts.parseRunRulesContract(valid).missionRevision,2);
 assert.throws(()=>contracts.parseRunRulesContract({...valid,missionRevision:3}));
 writeFileSync('artifacts/intercept-agency/counters.json',JSON.stringify(rows,null,2));
 console.log('PASS tracking hit after sidestep, range 2–4 boundaries, live marker projection, legal DISRUPTOR interrupt and ordinary slow distinction');
}finally{await vite.close()}
