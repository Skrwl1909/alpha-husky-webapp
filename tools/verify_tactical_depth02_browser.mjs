/** Narrow review of the changed choice, objective feedback, resume and accepted receipt. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='artifacts/depth02/browser';mkdirSync(out,{recursive:true});
const entry=`import React from 'react';import{createRoot}from'react-dom/client';
import{TacticalApp}from'/tactical-ops-src/ui/App.tsx';import{useBattleStore as store}from'/tactical-ops-src/store/battleStore.ts';import{TACTICAL_CSS}from'/tactical-ops-src/styles.ts';
import{missionForContext,getMissionDef,missionBattleRules,missionSpawnsForSquad}from'/tactical-ops-src/data/operations.ts';
import{createBattle,advanceToNext}from'/tactical-ops-src/combat/battle.ts';import{selectAcceptedBattleRules}from'/tactical-ops-src/combat/types.ts';import{selectAcceptedIntentRules}from'/tactical-ops-src/combat/intentContract.ts';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
const q=new URLSearchParams(location.search),mode=q.get('mode')||'brief',plan=q.get('plan')||'anchor',old=q.has('old'),legacy=q.has('legacy');
const ids=['field-relay-intercept','field-isolated-hold','field-rearguard'];
const context={cycleId:2,pressure:2,reportVersion:old?4:5,approach:'standard',directiveTier:'advanced',directiveSet:'pursuit',masteryChallenge:'relay-lockdown-v1',...(!old?{lockdownPlan:plan}:{})};
const accepted=mode==='resume'?{runId:'field_depth02',missionId:'field-relay-hold',squadIds:['alpha','ally-02','ally-03'],fieldContext:context}:null;
const result={runId:'field_depth02',missionId:'field-relay-hold',victory:true,cycleId:2,challengeSuccess:true,challengeBonus:0,progressEarned:0,progressBefore:20,progressAfter:20,rankBefore:3,rankAfter:3,pressureBefore:1,pressureAfter:1,regionalApplied:false,unlockedApproaches:[],legacyReport:false,recordedAt:1,xpGranted:0,bonesGranted:0,masteryChanges:[],masteryChallenge:'relay-lockdown-v1',...(!old?{lockdownPlan:plan}:{})};
const progression={version:1,revision:10,completed:true,foundationStage:'completed',activeRunId:null,operations:{'broken-signal':{status:'cleared',missions:{}},'dead-relay':{status:'cleared',missions:{}}},fieldOps:{lockdownPlansAvailable:!old,board:{cycleId:3,nextRotationAt:1800000000,activeMissionIds:ids,reportVersion:3,directiveSet:'attrition'},commander:{rank:3,progress:20,nextRankAt:null,unlockedApproaches:['standard','south'],unlockedDirectiveTiers:['standard','advanced']},records:Object.fromEntries([...ids,'field-relay-hold'].map(missionId=>[missionId,{missionId,completed:true,clearCount:5,lastClearCycle:3,lastChallengeCycle:3}])),activeMissionRun:accepted,region:{pressure:1,cycleId:3},lastResult:mode==='results'?result:null,masteryPath:{version:1,accomplishment:{missionId:'field-isolated-hold',evidence:'SERVER_ADVANCED_HOLD'},unlockedChallenge:'relay-lockdown-v1',firstLockdownClear:null}},packMastery:{},vnextStartAvailable:!legacy};
store.setState({progression,screen:'war-table',foundationCompleted:true,onboardingEnabled:true,progressionStatus:'ready',progressionCommitPending:false,progressionError:null});
if(mode!=='command')store.getState().openOperationBrief('field-relay-hold','relay-lockdown-v1');
if(mode==='brief')store.getState().selectLockdownPlan(plan);
if(mode==='results')store.setState({screen:'results',currentRunKey:'field_depth02',fieldResult:result,battle:{...store.getState().battle,outcome:'victory',results:{victory:true,turns:5,hostilesEliminated:2,squadStanding:3,squadDeployed:3,damageTaken:20,bonesRecovered:0,objectiveComplete:true}}});
if(mode==='battle'){
 const contract=legacy?null:{rulesetVersion:'tactical-intent-vnext.0'};selectAcceptedBattleRules(contract);selectAcceptedIntentRules(contract);
 const m=missionForContext(getMissionDef('field-relay-hold'),context),rules=missionBattleRules(m,false,context);
 const b=advanceToNext(createBattle(null,missionSpawnsForSquad(m,['alpha','ally-02','ally-03']),rules.objective,rules.reinforcement,null,rules.directive)).state;
 store.setState({screen:'battle',battle:b,currentFieldContext:context,selectedMissionId:'field-relay-hold',busy:false});
}
window.fixture={store};createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));`;
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-depth02-browser',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},plugins:[{
 name:'depth02-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(!req.url?.startsWith('/depth02-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@depth02"></script>');});},resolveId(id){if(id==='/@depth02')return '\0depth02';},load(id){if(id==='\0depth02')return entry;}
}],server:{host:'127.0.0.1',port:0}});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
const cases=[];
try{
 for(const [width,height] of [[320,740],[390,844]]){
  for(const plan of ['anchor','crosslink']) for(const mode of ['brief','battle','resume','results']){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/depth02-fixture?plan='+plan+'&mode='+mode);
   await page.locator('.t-shell').waitFor();await page.evaluate(()=>document.fonts.ready);
   if(mode==='brief'||mode==='resume'){
    assert.equal(await page.locator('[data-lockdown-plan]').count(),2);
    assert.equal(await page.locator('[data-lockdown-plan="'+plan+'"]').getAttribute('aria-pressed'),'true');
    const text=await page.getByLabel('Deployment plans').innerText();assert.match(text,/Benefit:/);assert.match(text,/Cost:/);assert.match(text,/Priority:/);
    if(mode==='resume'){
     assert(await page.locator('[data-lockdown-plan="anchor"]').isDisabled());
     await page.evaluate(()=>fixture.store.getState().selectLockdownPlan(fixture.store.getState().selectedLockdownPlan==='anchor'?'crosslink':'anchor'));
     assert.equal(await page.evaluate(()=>fixture.store.getState().selectedLockdownPlan),plan);
     const squad=await page.evaluate(()=>fixture.store.getState().selectedSquadIds);
     await page.evaluate(()=>fixture.store.getState().toggleCommanderTeammate('ally-03'));
     assert.deepEqual(await page.evaluate(()=>fixture.store.getState().selectedSquadIds),squad,'accepted squad remains frozen');
    }else{
     const other=plan==='anchor'?'crosslink':'anchor';await page.locator('[data-lockdown-plan="'+other+'"]').click();
     assert.equal(await page.evaluate(()=>fixture.store.getState().selectedLockdownPlan),other);
     await page.locator('[data-lockdown-plan="'+plan+'"]').click();
    }
   }
   if(mode==='battle'){
    assert.equal(await page.getByLabel('Required relay holder tile').count(),1);
    if(plan==='crosslink')assert.match(await page.locator('.t-shell').innerText(),/CROSSLINK 0\/3/);
   }
   if(mode==='results'){
     const panel=page.locator('.t-special-field-results[data-special-result="lockdown"]');
     assert.equal(await panel.getAttribute('data-recording'),'confirmed');
     assert.match(await panel.locator('.t-special-achievement').innerText(),new RegExp(plan.toUpperCase()+' plan'));
     await panel.locator('.t-fr-details summary').click();
     assert.match(await panel.locator('[data-recorded-plan]').innerText(),new RegExp('SERVER-ACCEPTED PLAN · '+plan.toUpperCase()));
    }
   assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
   if(mode==='brief'||mode==='resume'){
    const boxes=await page.locator('[data-lockdown-plan]').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,client:e.clientHeight,scroll:e.scrollHeight})));
    assert(boxes.every(b=>b.x>=0&&b.x+b.w<=width&&b.scroll<=b.client+2),'plan clipping');
    assert(boxes[1].y>=boxes[0].y+boxes[0].h,'plan overlap');
   }
   await page.screenshot({path:out+'/'+width+'-'+plan+'-'+mode+'.png',fullPage:true});cases.push({width,height,plan,mode});await page.close();
  }
  for(const mode of ['command','brief','battle']){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true});
   await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/depth02-fixture?mode='+mode+(mode==='brief'?'&old=1':'&legacy=1'));
   await page.locator('.t-shell').waitFor();
   if(mode==='command')assert.match(await page.locator('[data-primary-purpose]').innerText(),/Choose Anchor/);
   if(mode==='brief')assert.equal(await page.locator('[data-lockdown-plan]').count(),0,'old backend offers no unsupported choice');
   if(mode==='battle')assert.equal(await page.getByLabel('Required relay holder tile').count(),1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));cases.push({width,height,mode,regression:true});await page.close();
  }
 }
 writeFileSync(out+'/results.json',JSON.stringify({cases,limits:'Real React/store and engine; synthetic server state; Chromium touch emulation. Physical Telegram Android/iPhone remains open.'},null,2));
 console.log('PASS DEPTH02 browser: '+cases.length+' focused cases');
}finally{await browser.close();await server.close();}
