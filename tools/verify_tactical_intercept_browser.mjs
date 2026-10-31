import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const accepted=JSON.parse(readFileSync('tools/fixtures/intercept-accepted.json','utf8'));
const tracking=JSON.parse(readFileSync('tools/fixtures/intercept-tracking.json','utf8'));
const entry=`import React from'react';import{createRoot}from'react-dom/client';import{TacticalApp}from'/tactical-ops-src/ui/App.tsx';import{useBattleStore as store}from'/tactical-ops-src/store/battleStore.ts';import{TACTICAL_CSS}from'/tactical-ops-src/styles.ts';
import{getMissionDef,missionSpawnsForSquad}from'/tactical-ops-src/data/operations.ts';import{withTeammateSidegrades}from'/tactical-ops-src/data/shadowSidegrade.ts';import{parsePackMastery}from'/tactical-ops-src/data/packMastery.ts';import{selectAcceptedBattleRules}from'/tactical-ops-src/combat/types.ts';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
const mode=new URLSearchParams(location.search).get('mode'),accepted=${JSON.stringify(accepted)},tracking=${JSON.stringify(tracking)};
const state=structuredClone(accepted.data);state.packMastery=parsePackMastery(state.packMastery);
withTeammateSidegrades(missionSpawnsForSquad(getMissionDef('field-relay-intercept'),accepted.run.squadIds),{...state,packMastery:parsePackMastery(accepted.run.packMastery)});
window.calls=[];window.apiPost=async(path,body)=>{window.calls.push({path,body});if(!path.endsWith('/mission/start'))throw Error('unexpected request');return {...structuredClone(accepted),run:{...structuredClone(accepted.run),started:window.calls.length===1}}};
store.setState({screen:'war-table',progression:state,progressionStatus:'ready',foundationCompleted:true,onboardingEnabled:true,progressionCommitPending:false,busy:false,selectedSquadIds:accepted.run.squadIds});
if(mode==='confirm'){state.fieldOps.activeMissionRun=null;store.setState({progression:structuredClone(state)});store.getState().openOperationBrief('field-relay-intercept');store.getState().selectDirectiveTier('advanced')}
if(mode==='resume'){store.getState().openOperationBrief('field-relay-intercept')}
if(mode==='legacy'){state.fieldOps.activeMissionRun.rulesContract.missionRevision=1;store.setState({progression:structuredClone(state)});store.getState().openOperationBrief('field-relay-intercept')}
if(mode==='old'){delete state.fieldOps.activeMissionRun.rulesContract;state.fieldOps.activeMissionRun.fieldContext={cycleId:31,pressure:2,approach:'standard',reportVersion:2};state.vnextStartAvailable=false;store.setState({progression:structuredClone(state)});store.getState().openOperationBrief('field-relay-intercept')}
if(mode==='tracking'){selectAcceptedBattleRules(accepted.run.rulesContract);store.setState({screen:'battle',battle:tracking.state,activeRulesetVersion:accepted.run.rulesContract.rulesetVersion,selectedMissionId:'field-relay-intercept',currentFieldContext:accepted.run.fieldContext,threats:tracking.cycle.pending.map(t=>t.plan),busy:false})}
window.fixture={store,accepted,tracking};createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));`;
const out='artifacts/intercept-agency/browser';mkdirSync(out,{recursive:true});
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-intercept-agency',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},plugins:[{name:'intercept-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(!req.url?.startsWith('/intercept-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@intercept"></script>')})},resolveId(id){if(id==='/@intercept')return '\0intercept'},load(id){if(id==='\0intercept')return entry}}],server:{host:'127.0.0.1',port:0}});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});const cases=[];
try {
 for(const [width,height] of [[320,740],[390,844],[430,932]])for(const mode of ['confirm','resume','legacy','old','tracking']){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/intercept-fixture?mode='+mode);await page.locator('.t-shell').waitFor();
  if(mode==='confirm'){
   await page.getByRole('button',{name:'LOCK SQUAD · REVIEW FORMATION',exact:true}).click();await page.getByRole('button',{name:'DEPLOY SQUAD',exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief','first click must review acceptance before any battle');
   assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/TARGET LOCK follows/);
   assert.equal(await page.evaluate(()=>calls.length),1);await page.screenshot({path:out+'/'+width+'-accepted-review.png',fullPage:true});
   await page.getByRole('button',{name:'DEPLOY SQUAD',exact:true}).click();await page.locator('.t-battle').waitFor();
   assert.equal(await page.evaluate(()=>fixture.store.getState().battle.objective.screenedEscape),true);
   assert.equal(await page.evaluate(()=>fixture.store.getState().currentRunKey),'field_synthetic');assert.equal(await page.evaluate(()=>calls.length),2);
  }
  if(mode==='resume')assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/TARGET LOCK follows/);
  if(mode==='legacy')assert.doesNotMatch(await page.getByLabel('Mission overview',{exact:true}).innerText(),/TRACKING|Screened courier/);
  if(mode==='old')assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/RECOVER|Recover|relay/);
  if(mode==='tracking'){
   assert.match(await page.locator('.t-command-cue').innerText(),/TRACKING LOCK/);assert.doesNotMatch(await page.locator('.t-command-cue').innerText(),/Move off striped cells/);
   const marker=page.locator('.t-threat-tile-v2').first(),before=await marker.getAttribute('style');
   await page.getByRole('button',{name:'Move to 3,1',exact:true}).dispatchEvent('pointerdown',{pointerType:'touch',bubbles:true});
   assert.equal(await page.evaluate(()=>fixture.store.getState().battle.units.find(u=>u.id==='alpha').c),3);
   assert.notEqual(await marker.getAttribute('style'),before,'tracking marker must follow the same moved ally');
   assert.equal(await page.evaluate(()=>fixture.store.getState().threats[0].targetUnitId),'alpha');assert.equal(await page.locator('.t-threat-tile-v2').count(),1);
   const dock=await page.locator('.t-act').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height}}));assert(dock.every(r=>r.w>=44&&r.h>=44));
  }
  assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
  await page.screenshot({path:out+'/'+width+'-'+mode+'.png',fullPage:true});cases.push({width,height,mode});await page.close();
 }
 writeFileSync(out+'/results.json',JSON.stringify({cases,limits:'Actual React/store and engine-derived synthetic fixtures; touch emulation only. Physical Android/iPhone and human playtesting not verified.'},null,2));console.log('PASS Intercept mobile '+cases.length+' cases');
}finally{await browser.close();await server.close()}
