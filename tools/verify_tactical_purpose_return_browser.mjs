/** Real UI/store with isolated canonical-shaped account fixtures; no live API writes. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const focused=process.env.NEXT_DECISION_ONLY==='1';
const phase=process.env.PURPOSE_PHASE||'after',out=focused?'artifacts/next-decision':`artifacts/purpose-return/${phase}`;
mkdirSync(out,{recursive:true});
const entry=`import React from 'react';import{createRoot}from'react-dom/client';
import{TacticalApp}from'/tactical-ops-src/ui/App.tsx';import{useBattleStore as store}from'/tactical-ops-src/store/battleStore.ts';import{TACTICAL_CSS}from'/tactical-ops-src/styles.ts';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
const params=new URLSearchParams(location.search),mode=params.get('mode')||'command',profile=params.get('profile')||'veteran';
const ids=['field-relay-recovery','field-relay-hold','field-squad-survival'];
const records=Object.fromEntries(ids.map(missionId=>[missionId,{missionId,completed:profile!=='fresh',clearCount:profile==='fresh'?0:5,lastClearCycle:profile==='fresh'?null:7,lastChallengeCycle:profile==='exhausted'?7:null,lastAdvancedCycle:profile==='exhausted'?7:null}]));
const result={runId:'purpose-run',missionId:ids[0],victory:true,cycleId:7,challengeSuccess:true,challengeBonus:profile==='exhausted'?0:1,progressEarned:profile==='exhausted'?0:1,firstCycleSecure:false,firstCycleChallenge:profile!=='exhausted',progressBefore:20,progressAfter:21,rankBefore:3,rankAfter:3,pressureBefore:2,pressureAfter:1,regionalApplied:profile!=='exhausted',unlockedApproaches:[],legacyReport:false,recordedAt:1,xpGranted:0,bonesGranted:0,masteryChanges:[]};
if(mode==='results'&&profile!=='resume'&&profile!=='unavailable') {
 records[ids[0]].lastClearCycle=7;records[ids[0]].lastChallengeCycle=7;
 if(profile==='fresh')Object.assign(result,{firstCycleSecure:true,clearProgressEarned:2,progressEarned:3,progressBefore:0,progressAfter:3,rankBefore:1,rankAfter:1});
}
const run=profile==='resume'?{runId:'saved-run',missionId:ids[2],squadIds:['alpha','ally-02','ally-03'],fieldContext:{cycleId:6,pressure:3,approach:'standard',reportVersion:2}}:null;
const progression={version:1,revision:10,completed:true,foundationStage:'completed',activeRunId:null,operations:{'broken-signal':{status:'cleared',missions:{}},'dead-relay':{status:'cleared',missions:{}}},fieldOps:profile==='unavailable'?undefined:{board:{cycleId:7,nextRotationAt:Math.floor(Date.now()/1000)+86400,activeMissionIds:ids,reportVersion:3,directiveSet:'pursuit'},commander:{rank:profile==='fresh'?1:3,progress:profile==='fresh'?0:20,nextRankAt:profile==='fresh'?6:null,unlockedApproaches:['standard','south'],unlockedDirectiveTiers:profile==='fresh'?['standard']:['standard','advanced']},records,activeMissionRun:run,rotationProgress:{cycleId:7,securedCount:ids.filter(id=>records[id].lastClearCycle===7).length,total:3,clearedMissionIds:ids.filter(id=>records[id].lastClearCycle===7),challengeMissionIds:ids.filter(id=>records[id].lastChallengeCycle===7),advancedMissionIds:ids.filter(id=>records[id].lastAdvancedCycle===7)},careerRecord:{missionSecures:profile==='fresh'?0:42,challenges:profile==='fresh'?0:12,advancedClears:profile==='fresh'?0:8,frontsSecured:profile==='fresh'?0:6},region:{pressure:1,cycleId:7},lastResult:result},playerGrowth:{version:1,revision:10,earnedPoints:12,spentPoints:0,heroes:[]},packMastery:{'ally-02':{progress:8,stage:3,selected:'A',unlockedOptions:['A','B']}}};
store.setState({progression,screen:mode==='command'?'war-table':mode,foundationCompleted:true,progressionStatus:'ready',progressionCommitPending:false,progressionError:null,selectedMissionId:params.get('mission')||ids[0],selectedSquadIds:['alpha','ally-02','ally-03'],currentRunKey:'purpose-run',fieldResult:profile==='unavailable'?null:result,battle:{...store.getState().battle,results:{victory:true,turns:7,hostilesEliminated:3,squadStanding:3,squadDeployed:3,damageTaken:20,bonesRecovered:0}}});
if(profile==='chapter')progression.tacticalChapter={version:1,chapterId:'edge-relay',status:'ACTIVE',doctrine:'RECON',revision:1,completedMissionIds:[],activeRunId:null,intelEffect:'NONE',intelConsumedByRunId:null,lastReceiptId:null};
if(params.has('decision')){
 const scenario=params.get('decision'),s=store.getState(),field=progression.fieldOps;
 if(scenario==='defeat'||scenario==='expired'){
  result.victory=false; result.failureReason='DEADLINE'; result.directiveTier='advanced';
  if(scenario==='expired')field.board.nextRotationAt=Math.floor(Date.now()/1000)-1;
  store.setState({battle:{...s.battle,results:{...s.battle.results,victory:false},failureReason:'DEADLINE'}});
 }
 if(scenario==='complete'){
  field.fieldContracts={enabled:true,completed:['rapid-recovery','hold-together','cut-the-line'],eligibleMissionIds:[ids[0],ids[1]],sidegrade:'reach-rend',selection:'rend',honor:'field-tested'};
  progression.vnextStartAvailable=true;
  for(const row of Object.values(records))Object.assign(row,{lastClearCycle:7,lastChallengeCycle:7,lastAdvancedCycle:7});
 }
 if(scenario==='stale')store.setState({currentRunKey:'different-result'});
 if(scenario==='unavailable')delete progression.fieldOps;
 if(scenario==='resume')field.board.nextRotationAt=Math.floor(Date.now()/1000)-1;
 store.setState({onboardingEnabled:true,progression:{...progression},fieldResult:result});
 window.apiPost=async()=>({ok:true,data:progression});
}
window.fixture={store};createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));`;
const server=await createServer({configFile:false,cacheDir:`node_modules/.vite-purpose-${phase}`,optimizeDeps:{include:["react","react-dom/client","react/jsx-dev-runtime","lucide-react","zustand"]},plugins:[{name:'purpose-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(!req.url?.startsWith('/purpose-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@purpose"></script>');})},resolveId(id){if(id==='/@purpose')return '\0purpose'},load(id){if(id==='\0purpose')return phase==='before'?entry.replaceAll('/tactical-ops-src/','/artifacts/baseline/tactical-ops-src/'):entry}}],server:{host:'127.0.0.1',port:0}});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
const cases=[];
try{
 if(focused) for(const [width,height] of [[320,568],[390,844],[430,932],[1280,900]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<500,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const scenario of ['victory','defeat','resume','expired','complete','unavailable','stale']){
   const profile=scenario==='resume'?'resume':'veteran';
   await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/purpose-fixture?mode=results&profile=${profile}&decision=${scenario}`);
   const panel=page.locator('.t-field-results');await panel.waitFor();
   const primary=panel.locator('[data-next-decision=primary]'),review=panel.getByRole('button',{name:'Review Squad'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
   assert(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'results overflow');
   if(scenario==='stale'){
    assert.equal(await primary.count(),0);
    assert.equal(await review.count(),0);
   }else{
    await primary.scrollIntoViewIfNeeded();
    assert(await primary.evaluate(e=>e.clientHeight>=42&&e.scrollWidth<=e.clientWidth+1),'primary must fit and remain tappable');
    if(scenario==='defeat')assert.match(await panel.innerText(),/completion window closed/);
    if(scenario==='complete')assert.match(await panel.innerText(),/Optional practice.*No new rotation progress/);
    if(scenario==='resume')assert.match(await panel.innerText(),/locked squad/);
    if(['expired','unavailable','resume'].includes(scenario))assert.equal(await review.count(),0);
    const label=await primary.innerText();
    await page.screenshot({path:`${out}/${width}-${scenario}.png`});
    if(scenario==='complete'){
     await page.reload();await primary.waitFor();
     assert.equal(await primary.innerText(),label,'canonical fixture reload keeps the same decision');
    }
    if(scenario==='victory'){
     await review.click();
     assert(await page.getByLabel('Squad composition and mastery').isVisible(),'Review Squad opens the actual Squad tab');
    }else if(['defeat','resume'].includes(scenario)){
     await primary.click();
     const brief=await page.evaluate(()=>{const s=fixture.store.getState();return {screen:s.screen,id:s.selectedMissionId,tier:s.selectedDirectiveTier,squad:s.selectedSquadIds}});
     assert.equal(brief.screen,'brief');
     assert.equal(brief.id,scenario==='resume'?'field-squad-survival':'field-relay-recovery');
     if(scenario==='defeat')assert.equal(brief.tier,'advanced');
     else assert.deepEqual(brief.squad,['alpha','ally-02','ally-03']);
    }else if(scenario==='expired'){
     await primary.click();
     assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'war-table');
    }
   }
   assert.deepEqual(errors,[]);
   cases.push({width,height,scenario});
  }
  await page.close();
 }
 if(!focused)for(const [width,height] of [[320,568],[360,780],[390,844],[430,932]]) for(const profile of ['fresh','veteran','exhausted','resume','unavailable','chapter']) for(const mode of (profile==='chapter'?['command']:['command','brief','results'])){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log(m.text())});page.on('response',r=>{if(r.status()>=400)console.log(r.status(),r.url())});
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/purpose-fixture?profile=${profile}&mode=${mode}`);await page.locator('.t-shell').waitFor({state:'attached',timeout:10000}).catch(async e=>{console.log({errors,text:await page.locator('body').innerText()});throw e});await page.evaluate(()=>document.fonts.ready);
  assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${profile} ${mode} overflow`);
  await page.screenshot({path:`${out}/${width}-${profile}-${mode}.png`,fullPage:true});
  if (mode==='results'&&profile==='veteran') {
    await page.locator('.t-results').evaluate((e,offset)=>{e.scrollTop=offset},phase==='before'?480:400).catch(()=>{});
    await page.screenshot({path:`${out}/${width}-${profile}-${mode}-detail.png`,fullPage:true});
  }
  if(phase==='after'&&mode==='command') {
    assert(await page.locator('.t-wt-reward-chips span').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),'Clipped reward text');
    const deck=page.locator('.t-command-deck-v3');
    assert.equal(await deck.count(),1,'premium command deck mounted');
    const records=deck.locator('.t-cd-records');
    assert.equal(await records.count(),1,'permanent field records available');
    assert.equal(await records.getAttribute('open'),null,'secondary field archive collapsed by default');
    if(profile!=='unavailable') {
      const action=deck.locator('[data-primary-purpose] .t-wt-main-cta');
      assert(await action.isVisible(),'recommended operation CTA visible');
      await action.scrollIntoViewIfNeeded();
      const hit=await action.evaluate(e=>{const b=e.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;return b.width>=44&&b.height>=44&&document.elementFromPoint(x,y)===e||e.contains(document.elementFromPoint(x,y))});
      assert(hit,'primary CTA cannot be reached');
      if(width===390)await page.screenshot({path:`${out}/390-${profile}-command-deck-v3.png`,fullPage:true});
    }
  }
  if(phase==='after'&&mode==='command'&&profile!=='unavailable'){
   assert.equal(await page.locator('[data-primary-purpose]').count(),1);
   const ids=await page.locator('[data-purpose-mission]').evaluateAll(es=>es.map(e=>e.dataset.purposeMission));assert.equal(new Set(ids).size,ids.length,'Duplicate mission targets');
   assert(!/RANK 4/.test(await page.locator('body').innerText()));
   if(profile==='veteran') {
     const advanced=page.getByRole('button',{name:'REVIEW ADVANCED',exact:true});
     if(await advanced.count()) { await advanced.click(); assert.equal(await page.evaluate(()=>fixture.store.getState().selectedDirectiveTier),'advanced'); }
     await page.evaluate(()=>fixture.store.setState({screen:'war-table'}));
   }
   const button=page.locator('[data-primary-purpose] button');await button.click();assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief','Primary opens actual brief');if(profile==='chapter')assert(await page.evaluate(()=>fixture.store.getState().chapterMode),'Chapter route preserved');
  }
  if(phase==='after'&&mode==='results'&&profile!=='unavailable'&&profile!=='resume'){
    const next=page.locator('.t-result-actions .t-btn-primary').first(); await next.click();
    assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief','Confirmed result next CTA opens recommended brief');
  }
  cases.push({width,height,profile,mode});await page.close();
 }
 if(!focused&&phase==='after') for(const mission of ['broken-signal-breach','field-relay-recovery','broken-signal-commander','field-relay-hold','field-squad-survival','field-relay-intercept']) {
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/purpose-fixture?mode=brief&profile=veteran&mission=${mission}`);
  await page.getByLabel('Mission overview',{exact:true}).waitFor();assert.deepEqual(errors,[]);
  assert(await page.getByLabel('Mission overview',{exact:true}).innerText());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));cases.push({width:390,height:844,profile:'veteran',mode:'brief',mission});await page.close();
 }
 writeFileSync(out+'/results.json',JSON.stringify({phase,cases,limitations:'Mocked accounts, Chromium touch emulation; no live persistence or physical Telegram validation.'},null,2));console.log('PASS purpose browser: '+cases.length+' account/surface/viewport cases');
}finally{await browser.close();await server.close()}
