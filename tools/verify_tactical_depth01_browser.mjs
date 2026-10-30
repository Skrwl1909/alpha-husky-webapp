/** Real React/store, synthetic server-shaped state. No remote or account writes. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='artifacts/depth01/browser';mkdirSync(out,{recursive:true});
const entry=`import React from 'react';import{createRoot}from'react-dom/client';
import{TacticalApp}from'/tactical-ops-src/ui/App.tsx';import{useBattleStore as store}from'/tactical-ops-src/store/battleStore.ts';import{TACTICAL_CSS}from'/tactical-ops-src/styles.ts';
import{missionForContext,getMissionDef,missionBattleRules,missionSpawnsForSquad}from'/tactical-ops-src/data/operations.ts';
import{createBattle,advanceToNext}from'/tactical-ops-src/combat/battle.ts';import{selectAcceptedBattleRules}from'/tactical-ops-src/combat/types.ts';import{selectAcceptedIntentRules}from'/tactical-ops-src/combat/intentContract.ts';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
const q=new URLSearchParams(location.search),profile=q.get('profile'),mode=q.get('mode')||'command';
const legacy=q.get('legacy')==='1',unlocked=['unlocked','resume','completed','failed'].includes(profile);
const ids=['field-relay-intercept','field-isolated-hold','field-rearguard'];
const records=Object.fromEntries([...ids,'field-relay-hold'].map(missionId=>[missionId,{missionId,completed:true,clearCount:5,lastClearCycle:3,lastChallengeCycle:3,lastAdvancedCycle:null}]));
const context={cycleId:2,pressure:2,reportVersion:4,approach:'standard',directiveTier:'advanced',directiveSet:'pursuit',masteryChallenge:'relay-lockdown-v1'};
const accepted=profile==='resume'?{runId:'field-depth01',missionId:'field-relay-hold',squadIds:['alpha','ally-02','ally-03'],fieldContext:context}:null;
const result={runId:'field-depth01',missionId:'field-relay-hold',victory:profile!=='failed',cycleId:2,challengeSuccess:true,challengeBonus:0,progressEarned:0,progressBefore:20,progressAfter:20,rankBefore:3,rankAfter:3,pressureBefore:1,pressureAfter:1,regionalApplied:false,unlockedApproaches:[],legacyReport:false,recordedAt:1,xpGranted:0,bonesGranted:0,masteryChanges:[],masteryChallenge:'relay-lockdown-v1',...(profile==='failed'?{failureReason:'DEADLINE'}:{})};
const path={version:1,accomplishment:unlocked?{missionId:'field-isolated-hold',evidence:'SERVER_ADVANCED_HOLD'}:null,unlockedChallenge:unlocked?'relay-lockdown-v1':null};
const progression={version:1,revision:10,completed:true,foundationStage:'completed',activeRunId:null,operations:{'broken-signal':{status:'cleared',missions:{}},'dead-relay':{status:'cleared',missions:{}}},fieldOps:{board:{cycleId:3,nextRotationAt:Math.floor(Date.now()/1000)+86400,activeMissionIds:ids,reportVersion:3,directiveSet:'attrition'},commander:{rank:profile==='fresh'?1:3,progress:profile==='fresh'?0:20,nextRankAt:profile==='fresh'?6:null,unlockedApproaches:['standard','south'],unlockedDirectiveTiers:profile==='fresh'?['standard']:['standard','advanced']},records,activeMissionRun:accepted,region:{pressure:1,cycleId:3},lastResult:unlocked?result:null,...(profile==='old-backend'?{}:{masteryPath:path})},packMastery:{},vnextStartAvailable:!legacy};
store.setState({progression,screen:'war-table',foundationCompleted:true,progressionStatus:'ready',progressionCommitPending:false,progressionError:null});
if(mode==='brief'||mode==='battle')store.getState().openOperationBrief(unlocked?'field-relay-hold':'field-isolated-hold',unlocked?'relay-lockdown-v1':undefined);
if(mode==='results')store.setState({screen:'results',selectedMissionId:'field-relay-hold',selectedMasteryChallenge:'relay-lockdown-v1',selectedDirectiveTier:'advanced',selectedSquadIds:['alpha','ally-02','ally-03'],currentRunKey:'field-depth01',fieldResult:result,battle:{...store.getState().battle,outcome:result.victory?'victory':'defeat',results:{victory:result.victory,turns:result.victory?5:7,hostilesEliminated:2,squadStanding:3,squadDeployed:3,damageTaken:20,bonesRecovered:0,objectiveComplete:result.victory}}});
if(mode==='battle'){
 const contract=legacy?null:{rulesetVersion:'tactical-intent-vnext.0'};selectAcceptedBattleRules(contract);selectAcceptedIntentRules(contract);
 const m=missionForContext(getMissionDef('field-relay-hold'),context),rules=missionBattleRules(m,false,context);
 const b=advanceToNext(createBattle(null,missionSpawnsForSquad(m,['alpha','ally-02','ally-03']),rules.objective,rules.reinforcement,null,rules.directive)).state;
 store.setState({screen:'battle',battle:b,currentFieldContext:context,selectedMissionId:'field-relay-hold',busy:false});
}
window.fixture={store};createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));`;
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-depth01',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},plugins:[{
 name:'depth01-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(!req.url?.startsWith('/depth01-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@depth01"></script>');});},resolveId(id){if(id==='/@depth01')return '\0depth01';},load(id){if(id==='\0depth01')return entry;}
}],server:{host:'127.0.0.1',port:0}});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
const cases=[];
try{
 for(const [width,height] of [[320,568],[360,780],[390,844],[430,932]]){
  for(const profile of ['fresh','locked','unlocked','resume','completed','failed','old-backend']){
   for(const mode of ['command',...(profile==='unlocked'||profile==='resume'?['brief']:[]),...(profile==='completed'||profile==='failed'?['results']:[])]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/depth01-fixture?profile='+profile+'&mode='+mode);
    await page.locator('.t-shell').waitFor();await page.evaluate(()=>document.fonts.ready);
    assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
    await page.screenshot({path:out+'/'+width+'-'+profile+'-'+mode+'.png',fullPage:true});
    if(mode==='command'){
     assert.equal(await page.locator('[data-primary-purpose]').count(),1);
     const ids=await page.locator('[data-purpose-mission]').evaluateAll(es=>es.map(e=>e.dataset.purposeMission));assert.equal(ids.length,new Set(ids).size,'duplicate recommendations');
     if(profile==='locked')assert.match(await page.locator('[data-primary-purpose]').innerText(),/RELAY MASTERY · 0\/1/);
     if(profile==='unlocked')assert.match(await page.locator('[data-primary-purpose]').innerText(),/RELAY LOCKDOWN/);
     if(profile==='old-backend')assert.equal(await page.locator('[data-mastery-progress]').count(),0,'old backend offers no unsupported unlock');
     await page.locator('[data-primary-purpose] button').click();assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief');
     if(profile==='unlocked'||profile==='resume'){
      assert.equal(await page.evaluate(()=>fixture.store.getState().selectedMasteryChallenge),'relay-lockdown-v1');
      assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/ON the relay tile/);
      assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/NO PROGRESSION REWARD/);
     }
    }
    if(mode==='brief'){
     assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/ON the relay tile/);
     assert(!/\+2 COMMANDER|\+1 COMMANDER/.test(await page.getByLabel('Mission overview',{exact:true}).innerText()));
    }
    if(mode==='results'){
     assert.match(await page.getByLabel('Recorded Field Op result').innerText(),/No currency, Commander or Pack Mastery progress/);
     await page.getByRole('button',{name:'Replay / Squad',exact:true}).click();
     assert.equal(await page.evaluate(()=>fixture.store.getState().selectedMasteryChallenge),'relay-lockdown-v1','replay retains optional variant outside rotation');
     assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief');
    }
    cases.push({width,height,profile,mode});await page.close();
   }
  }
  for(const legacy of [false,true]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/depth01-fixture?profile=unlocked&mode=battle&legacy='+(legacy?'1':'0'));
   await page.getByLabel('Required relay holder tile').waitFor();assert.equal(await page.getByLabel('Required relay holder tile').count(),1);assert.equal(await page.getByLabel('Enemy contest area',{exact:true}).count(),4);
   assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:out+'/'+width+'-battle-'+(legacy?'8x5':'10x7')+'.png',fullPage:true});cases.push({width,height,mode:'battle',legacy});await page.close();
  }
 }
 writeFileSync(out+'/results.json',JSON.stringify({cases,limits:'Synthetic fixtures, real components and engine, Chromium touch emulation; physical Telegram QA remains open.'},null,2));console.log('PASS DEPTH01 browser: '+cases.length+' mobile cases');
}finally{await browser.close();await server.close();}
