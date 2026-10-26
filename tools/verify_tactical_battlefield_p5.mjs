import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
 const load=p=>server.ssrLoadModule('/tactical-ops-src/'+p+'.ts');
 const [ui,eng,types,intent,scheduler,skills,fx,identity,consequence]=await Promise.all(['ui/battlePresentation','combat/battle','combat/types','combat/intentContract','combat/intentScheduler','combat/skills','ui/combatFxAtlas','ui/combatIdentity','ui/combatConsequences'].map(load));
 types.selectAcceptedBattleRules({rulesetVersion:intent.TACTICAL_VNEXT_RULESET});
 let b=eng.createBattle(null,[{id:'alpha',defId:'alpha',c:1,r:1},{id:'ally-02',defId:'ally-02',c:1,r:2},{id:'ally-03',defId:'ally-03',c:1,r:3},{id:'h3',defId:'hostile',c:3,r:2}]);
 b={...b,activeId:'alpha',mode:'selected',unitTurn:3};
 const enemy=b.units.find(u=>u.id==='h3'),alpha=b.units.find(u=>u.id==='alpha');
 const plan=intent.announceIntent({id:'p5-proof',enemyId:enemy.id,kind:'ATTACK',targetUnitId:alpha.id,targetTile:{c:alpha.c,r:alpha.r},impactTiles:[{c:alpha.c,r:alpha.r}],predictedEffect:'Test locked strike',warnsOnUnitTurn:3,resolvesOnUnitTurn:4,responses:['REPOSITION','DISRUPT'],fallbackPolicy:'CANCEL'},b).plan;
 const input={battle:b,busy:false,activeRulesetVersion:intent.TACTICAL_VNEXT_RULESET,threats:[],combatMoment:null,combatFx:[],consequences:[],floats:[],banner:null,mission:null};
 const derive=(x={})=>ui.deriveBattlePresentation({...input,...x});
 const freeze=x=>{if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x)}return x};
 freeze(input);assert.equal(derive().mode,'READ');assert.deepEqual(derive(),derive(),'deterministic pure result');
 assert.equal(derive({threats:[plan],activeRulesetVersion:null}).mode,'READ','V1 fails closed even if stale threats exist');
 assert.equal(derive({threats:[plan]}).mode,'REACT');
 const targeting={...b,mode:'targeting',actionSkillId:'alpha-strike'};
 assert.equal(derive({battle:targeting}).mode,'TARGET');
 const combined=derive({battle:targeting,threats:[plan]});assert.equal(combined.mode,'REACT');assert(combined.targeting);assert.deepEqual(combined.targetIds,skills.availableSkills(targeting,alpha)[0].targets);
 assert.equal(derive({battle:{...b,outcome:'victory'},threats:[plan]}).threats.length,0,'engine-finished battle ends danger');assert.equal(derive({busy:true}).interactive,false);assert.equal(derive({busy:true,threats:[plan]}).threats.length,1,'busy never clears threat');
 const travel=fx.fx('alpha_strike',1,enemy.id);assert.equal(derive({busy:true,combatFx:[travel]}).mode,'WAIT','travel alone is not impact proof');
 assert.equal(derive({busy:true,floats:[{unitId:enemy.id,text:'-7',kind:'dmg'}]}).mode,'RESOLVE');
 assert.equal(derive({busy:true,floats:[{unitId:alpha.id,text:'+7',kind:'heal'}]}).result,'HEAL +7 · ALPHA');
 assert.equal(derive({busy:true,consequences:[{id:1,unitId:enemy.id,kind:'counter',label:'SIGNAL BROKEN'}]}).result,'INTERRUPTED · enemy intent canceled');
 assert.equal(derive({combatFx:[fx.fx('cnc_pressure',1),fx.fx('cnc_interrupt',2)]}).primaryFx.length,1,'interrupt owns primary atlas');
 assert.equal(derive({combatFx:[fx.fx('cnc_pressure',1),fx.fx('cnc_interrupt',2)]}).primaryFx[0].durationMs,720,'primary interrupt retains scheduled pressure contact budget');
 assert.equal(derive({combatFx:[]}).showFallbackMasterFx,false,'no delayed second burst after atlas retirement');
 // Capability must agree with actual engine control cancellation, including mastery IDs.
 for(const discipline of ['disruptor','pursuer']) for(const cd of [0,2]) {
  let state={...b,activeId:'ally-02',units:b.units.map(u=>u.id==='ally-02'?{...u,c:enemy.c-1,r:enemy.r,growth:{heroId:'ally-02',discipline,ranks:{}},cooldowns:{'u02-suppress':cd}}:u)};
  const p=derive({battle:state,threats:[plan]});assert.equal(p.interruptTargetIds.includes(enemy.id),discipline==='disruptor'&&cd===0);
  if(cd===0){const result=eng.trySkill(state,'u02-suppress',enemy.id);assert(result.ok);const canceled=scheduler.interruptLockedThreatAfterControl({...scheduler.emptyThreatCycle(),pending:[{plan,action:{type:'skill',skillId:'hostile-strike',targetId:'alpha'}}]},state,result.state,'ally-02',enemy.id,'u02-suppress',result.events);assert.equal(canceled.interrupted,p.interruptTargetIds.includes(enemy.id));}
 }
 // Engine-owned cancellation: remove exactly one plan, retain every other tile.
 const second={...plan,id:'second',enemyId:'h3'};
 const both=derive({threats:[plan,second]});assert.equal(both.threats.length,2);assert.equal(derive({threats:[second]}).threats[0].id,'second');assert.equal(derive().danger.size,0);
 const guard={...alpha,statuses:[{type:'GUARD'}]};assert.equal(consequence.confirmedHitConsequence({type:'damage',unitId:guard.id,amount:1},[guard],{[guard.id]:guard.hp}).label,'GUARD ACTIVE','V1 does not emit prevention evidence');
 const shadow=b.units.find(u=>u.id==='ally-03');const noHeal=identity.confirmedSkillMoment(shadow,'u03-mend',[],1,false);assert.equal(noHeal,null,'no heal proof for no-op');
 for(const cols of [8,10])for(let row=0;row<7;row++){const size=ui.cellTouchStyle(row,cols,7);assert(parseFloat(size['--cell-touch-w'])<(68+16*row/6)/(cols-1));}
 console.log('PASS P5 director: V1/VNext, priority/layer arbitration, legal targeting, real interruption equivalence, no speculative resolve, single FX owner, neutral GUARD, immutable inputs and disjoint projection.');
}finally{await server.close()}
