/** Changed wire and round-boundary behavior only; no accounts or remote writes. */
import assert from 'node:assert/strict';
import {createServer} from 'vite';
let response;
globalThis.window={location:{search:''},localStorage:{getItem:()=>null},apiPost:async()=>structuredClone(response)};
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
 const [host,ops,engine,rules,types]=await Promise.all([
  '/tactical-ops-src/host/foundationProgression.ts','/tactical-ops-src/data/operations.ts',
  '/tactical-ops-src/combat/battle.ts','/tactical-ops-src/combat/missionRules.ts','/tactical-ops-src/combat/types.ts'
 ].map(p=>vite.ssrLoadModule(p)));
 const squad=['alpha','ally-02','ally-03'];
 const context={cycleId:0,pressure:2,approach:'standard',reportVersion:5,directiveTier:'advanced',directiveSet:'pursuit',masteryChallenge:'relay-lockdown-v1',lockdownPlan:'crosslink'};
 const ids=['field-relay-intercept','field-isolated-hold','field-rearguard'];
 const field={lockdownPlansAvailable:true,records:Object.fromEntries(ids.map(missionId=>[missionId,{missionId,clearCount:3,completed:true}])),activeMissionRun:null,lastCompletedMissionRunId:null,
  board:{cycleId:1,nextRotationAt:1800000000,activeMissionIds:ids,reportVersion:3,directiveSet:'pursuit'},commander:{rank:3,progress:12,nextRankAt:null,unlockedApproaches:['standard','south'],unlockedDirectiveTiers:['standard','advanced']},region:{regionId:'broken-signal',cycleId:1,pressure:2,label:'HIGH'},masteryPath:{version:1,accomplishment:{missionId:'field-relay-hold',evidence:'SERVER_ADVANCED_HOLD'},unlockedChallenge:'relay-lockdown-v1',firstLockdownClear:null}};
 const state={version:1,foundationStage:'completed',completed:true,revision:5,activeRunId:null,fieldOps:field,operations:{'broken-signal':{status:'cleared',missions:{},activeMissionRun:null,lastCompletedMissionRunId:null}}};
 for(const plan of ['anchor','crosslink']){
  const ctx={...context,lockdownPlan:plan},run={runId:'field_test',missionId:'field-relay-hold',squadIds:squad,fieldContext:ctx};
  response={ok:true,data:state,run};
  assert.equal((await host.startOperationMission('accept',5,run.missionId,squad,ctx)).run.fieldContext.lockdownPlan,plan);
  response={ok:true,data:{...state,fieldOps:{...field,activeMissionRun:run}}};
  const reload=await host.loadFoundationProgression();assert.equal(reload.fieldOps.activeMissionRun.fieldContext.lockdownPlan,plan);
  assert.equal(reload.fieldOps.lockdownPlansAvailable,true);
  for(const bad of [{...ctx,lockdownPlan:undefined},{...ctx,lockdownPlan:'unknown'},{...ctx,reportVersion:4},{...ctx,lockdownPlan:plan==='anchor'?'crosslink':'anchor'}]){
   response={ok:true,data:state,run:{...run,fieldContext:bad}};
   await assert.rejects(()=>host.startOperationMission('reject',5,run.missionId,squad,ctx));
  }
 }
 const base=ops.getMissionDef('field-relay-hold');
 for(const contract of [null,{rulesetVersion:'tactical-intent-vnext.0'}]){
  types.selectAcceptedBattleRules(contract);
  const m=ops.missionForContext(base,context),spec=ops.missionBattleRules(m,false,context);
  assert.equal(spec.directive.supportCooldownExtra||0,0);
  const anchor=ops.missionBattleRules(base,false,{...context,lockdownPlan:'anchor'});
  const legacy=ops.missionBattleRules(base,false,{...context,reportVersion:4,lockdownPlan:undefined});
  assert.deepEqual(anchor,legacy,'Anchor retains original frozen Lockdown rules');
  assert.equal(anchor.directive.supportCooldownExtra,1);
  let s=engine.createBattle(null,[{defId:'alpha',id:'alpha',c:3,r:1}],spec.objective,null,null,spec.directive);
  assert.deepEqual(s.objective.terminal,s.objective.relayRoute[0],'all route cells use accepted grid projection');
  const at=(state,index)=>({...state,units:state.units.map(u=>({...u,...state.objective.relayRoute[index]}))});
  s=rules.resolveTimedObjective({...s,round:2}).state;assert.equal(s.objective.progress,1);
  assert.deepEqual(s.objective.terminal,s.objective.relayRoute[1]);
  // Leaving a completed checkpoint is legal during the next round.
  s=rules.resolveTimedObjective(s).state;assert.equal(s.objective.progress,1);
  s=rules.resolveTimedObjective({...at(s,1),round:3}).state;assert.equal(s.objective.progress,2);
  const win=rules.resolveTimedObjective({...at(s,2),round:4});assert.equal(win.result,'victory');
  const miss=rules.resolveTimedObjective({...s,round:4});assert.equal(miss.state.objective.progress,0);assert.deepEqual(miss.state.objective.terminal,s.objective.relayRoute[0]);
  const late=rules.resolveTimedObjective({...at(s,2),round:7});assert.equal(late.state.failureReason,'DEADLINE');
 }
 console.log('PASS DEPTH02 wire, plan mismatch rejection, reload, frozen v4 rules, support tradeoff, relay projection, checkpoint timing/reset and deadline on both grids');
}finally{await vite.close();}
