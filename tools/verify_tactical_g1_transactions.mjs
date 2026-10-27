#!/usr/bin/env node
/** Real store + public host parser against a mocked transport; no live account writes. */
import assert from 'node:assert/strict';
import{createServer}from'vite';
globalThis.window={location:{search:''},localStorage:{getItem:()=>null,setItem:()=>{}},S:{}};
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
 const {useBattleStore:store}=await server.ssrLoadModule('/tactical-ops-src/store/battleStore.ts');
 const {loadFoundationProgression}=await server.ssrLoadModule('/tactical-ops-src/host/foundationProgression.ts');
 const seed=()=>({version:1,foundationStage:'completed',completed:true,revision:5,activeRunId:null,playerGrowth:{version:2,earnedPoints:3,spentPoints:0,claimedFirstClears:['a','b','c'],heroes:['alpha','ally-02','ally-03'].map(heroId=>({heroId,discipline:null,ranks:{},respecUsed:false}))},packMastery:{'ally-03':{progress:8,stage:3,selected:'A',unlockedOptions:['A','B']}}});
 let canonical=seed(),calls=[],release,mode='ok';
 const idempotency=new Map();
 window.apiPost=async(path,body)=>{
  calls.push({path,body});
  if(path.endsWith('/state'))return {ok:true,data:structuredClone(canonical)};
  if(mode==='wait')await new Promise(r=>release=r);
  if(mode==='network')throw Error('offline fixture');
  if(mode==='stale')return {ok:false,code:'stale_revision',details:{state:structuredClone(canonical)}};
  if(idempotency.has(body.requestId))return idempotency.get(body.requestId);
  assert.equal(body.expectedRevision,canonical.revision);
  const h=canonical.playerGrowth.heroes.find(h=>h.heroId===body.heroId);
  if(path.endsWith('/growth/upgrade')){h.discipline=body.discipline;h.ranks[body.skillId]=body.rank;canonical.playerGrowth.spentPoints++;}
  else if(path.endsWith('/growth/respec')){assert(!h.respecUsed);canonical.playerGrowth.spentPoints-=Object.values(h.ranks).reduce((a,b)=>a+b,0);h.discipline=null;h.ranks={};h.respecUsed=true;}
  else if(path.endsWith('/pack-mastery'))canonical.packMastery[body.unitId].selected=body.choice;
  canonical.revision++;
  const receipt={ok:true,data:structuredClone(canonical)};idempotency.set(body.requestId,receipt);return receipt;
 };
 const reset=async()=>{canonical=seed();calls=[];idempotency.clear();mode='ok';store.setState({screen:'war-table',busy:false,progressionCommitPending:false,progressionError:null,progression:await loadFoundationProgression()});calls=[];};
 await reset();mode='wait';const pending=store.getState().upgradeGrowth('ally-03','medic','u03-mend',1);
 await store.getState().upgradeGrowth('ally-03','medic','u03-mend',1);assert.equal(calls.length,1,'Double tap suppressed');
 mode='ok';release();await pending;assert.equal(store.getState().progression.playerGrowth.spentPoints,1);
 const reloaded=await loadFoundationProgression();assert.equal(reloaded.playerGrowth.heroes[2].ranks['u03-mend'],1);assert.equal(reloaded.playerGrowth.version,2);
 const before=canonical.revision;await window.apiPost(calls[0].path,calls[0].body);assert.equal(canonical.revision,before,'Fixture idempotent response; not proof of real backend');
 for(const failure of ['network','stale']){await reset();mode=failure;await store.getState().upgradeGrowth('alpha','vanguard','alpha-strike',1);assert.equal(store.getState().progression.playerGrowth.spentPoints,0);assert(store.getState().progressionError);assert(!store.getState().progressionCommitPending);}
 await reset();store.setState({progression:{...store.getState().progression,playerGrowth:undefined}});await store.getState().upgradeGrowth('alpha','vanguard','alpha-strike',1);assert.equal(calls.length,0);
 await reset();await store.getState().upgradeGrowth('alpha','vanguard','alpha-strike',1);await store.getState().respecGrowth('alpha');
 const used=store.getState().progression.playerGrowth.heroes[0];assert(used.respecUsed);assert.deepEqual(used.ranks,{});assert.equal(store.getState().progression.playerGrowth.spentPoints,0);
 const count=calls.length;await store.getState().respecGrowth('alpha');assert.equal(calls.length,count,'One reset only');
 await reset();const p=store.getState().progression;store.setState({progression:{...p,chapterActiveMission:{squadIds:['ally-03']}}});await store.getState().selectMastery('ally-03','B');assert.equal(calls.length,0,'Chapter run locks mastery at action boundary');
 store.setState({progression:p});await store.getState().selectMastery('ally-03','B');assert.equal(store.getState().progression.packMastery['ally-03'].selected,'B');assert.equal(store.getState().progression.packMastery['ally-03'].progress,8);
 console.log('PASS G1 transactions: actual store/host receipt + reload; pending duplicate suppression; mocked stale/network; missing growth; one-time reset; chapter mastery lock; capped A/B. Server idempotency remains live-QA HOLD.');
}finally{await server.close()}
