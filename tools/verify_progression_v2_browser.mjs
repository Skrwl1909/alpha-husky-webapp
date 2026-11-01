import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const fixture=JSON.parse(readFileSync('tools/fixtures/progression-v2.json','utf8'));
const extraction=JSON.parse(readFileSync('tools/fixtures/progression-v2-extraction.json','utf8'));
const entry=`import React from'react';import{createRoot}from'react-dom/client';import{TacticalApp}from'/tactical-ops-src/ui/App.tsx';import{useBattleStore as store}from'/tactical-ops-src/store/battleStore.ts';import{TACTICAL_CSS}from'/tactical-ops-src/styles.ts';import{parsePackMastery}from'/tactical-ops-src/data/packMastery.ts';
import{missionForContext,getMissionDef,missionBattleRules,missionSpawnsForSquad}from'/tactical-ops-src/data/operations.ts';import{createBattle,advanceToNext}from'/tactical-ops-src/combat/battle.ts';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
const mode=new URLSearchParams(location.search).get('mode'),state=${JSON.stringify(fixture)};
const veteran={version:1,credits:12,missionIds:['field-relay-recovery','field-relay-intercept','field-relay-hold','field-squad-survival'],lastCycle:30,enabled:false};
state.operations={'broken-signal':{status:'cleared',missions:{}},'dead-relay':{status:'cleared',missions:{}}};state.fieldOps.veteranCareer={...veteran,credits:mode==='rank3'?7:12};state.fieldOps.commander.rank=mode==='rank3'?3:4;
state.packMastery=parsePackMastery(Object.fromEntries(['ally-02','ally-03'].map(id=>[id,{progress:8,selected:'B',veteran:{...veteran,missionIds:id==='ally-03'?['field-relay-hold','field-squad-survival']:['field-relay-recovery','field-relay-intercept'],credits:mode==='mastery-progress'?7:12}}])));
if(mode==='old'){delete state.fieldOps.veteranProgressionAvailable;delete state.fieldOps.veteranCareer;state.fieldOps.commander.rank=3;for(const r of Object.values(state.packMastery)){delete r.veteran;r.stage=3}}
window.apiPost=async(path,body)=>{if(path.endsWith('pack-mastery'))state.packMastery[body.unitId].veteran.enabled=body.choice==='VETERAN_ON';return {ok:true,data:structuredClone(state)}};
store.setState({screen:'war-table',progression:state,progressionStatus:'ready',foundationCompleted:true,onboardingEnabled:true,progressionCommitPending:false,busy:false});
if(mode==='brief'||mode==='battle'||mode==='resume'){
 store.getState().openVeteranBrief();
 if(mode==='resume'){
  const context={cycleId:30,pressure:2,approach:'standard',reportVersion:6,progressionVersion:2,directiveTier:'advanced',directiveSet:'pursuit',veteranChallenge:'pack-extraction-v1'};
  state.fieldOps.activeMissionRun={runId:'field_synthetic',missionId:'field-relay-recovery',squadIds:['alpha','ally-02','ally-03'],packMastery:structuredClone(state.packMastery),fieldContext:context};store.setState({progression:structuredClone(state)});store.getState().openOperationBrief('field-relay-recovery');
 }
 if(mode==='battle'){
  const ctx={reportVersion:6,veteranChallenge:'pack-extraction-v1'};const m=missionForContext(getMissionDef('field-relay-recovery'),ctx),r=missionBattleRules(m,false,ctx);
  const b=advanceToNext(createBattle(null,missionSpawnsForSquad(m,['alpha','ally-02','ally-03']),r.objective,r.reinforcement,null,r.directive)).state;
  store.setState({screen:'battle',battle:b,selectedMissionId:m.missionId,currentFieldContext:ctx,busy:false});
 }
}
if(mode==='results'){const result={...state.fieldOps.lastResult,runId:'field_synthetic',veteranCareer:{before:11,after:12,reason:'CREDIT_RECORDED',unlocked:true},rankBefore:3,rankAfter:4,masteryChanges:[{unitId:'ally-02',kind:'CNC',gained:0,beforeStage:3,stage:4,progress:8,newOptions:[],veteran:{before:11,after:12,reason:'CREDIT_RECORDED',unlocked:true}}]};store.setState({screen:'results',selectedMissionId:result.missionId,currentRunKey:result.runId,fieldResult:result,battle:{...store.getState().battle,outcome:'victory',results:{victory:true,turns:4,hostilesEliminated:2,squadStanding:3,squadDeployed:3,damageTaken:20,bonesRecovered:0,objectiveComplete:true}}})}
if(mode==='extraction-results'){const accepted=${JSON.stringify(extraction)},result=accepted.fieldResult;store.setState({screen:'results',progression:accepted.data,selectedMissionId:result.missionId,currentRunKey:result.runId,fieldResult:result,battle:{...store.getState().battle,outcome:'victory',results:{victory:true,turns:6,hostilesEliminated:2,squadStanding:3,squadDeployed:3,damageTaken:20,bonesRecovered:0,objectiveComplete:true}}})}
window.fixture={store,state};createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));`;
const out='artifacts/progression-v2/browser';mkdirSync(out,{recursive:true});
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-progression-v2',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},plugins:[{name:'veteran-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(!req.url?.startsWith('/veteran-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@veteran"></script>')})},resolveId(id){if(id==='/@veteran')return '\0veteran'},load(id){if(id==='\0veteran')return entry}}],server:{host:'127.0.0.1',port:0}});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});const cases=[];
try{
 for(const [width,height] of [[390,844],[320,740]])for(const mode of ['rank3','rank4','mastery-progress','mastery-unlock','old','brief','battle','resume','results','extraction-results']){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/veteran-fixture?mode='+mode);await page.locator('.t-shell').waitFor();
  if(mode==='old')assert.equal(await page.locator('[data-veteran-career]').count(),0);
  if(mode==='rank3')assert.match(await page.locator('[data-veteran-career]').innerText(),/7\/12/);
  if(mode==='rank4'){await page.getByRole('button',{name:'PLAY PACK EXTRACTION',exact:true}).click();assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/all three allies/i)}
  if(mode.startsWith('mastery-')){
   await page.getByRole('button',{name:/03.*SQUAD/}).click();await page.getByRole('button',{name:'PACK MASTERY',exact:true}).click();
   await page.locator('[data-veteran-mastery="ally-02"]').waitFor();
   if(mode==='mastery-unlock'){
    await page.getByRole('button',{name:'ENABLE VETERAN OPTION',exact:true}).click();await page.getByRole('button',{name:'VETERAN OPTION ON · DISABLE',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>fixture.store.getState().progression.packMastery['ally-02'].selected),'B');
   }else assert.match(await page.locator('[data-veteran-mastery]').innerText(),/7\/12/);
  }
  if(mode==='brief'||mode==='resume')assert.match(await page.getByLabel('Mission overview',{exact:true}).innerText(),/all three allies/i);
  if(mode==='battle')assert.match(await page.locator('.t-shell').innerText(),/PACK EXTRACTION/);
  if(mode==='results'){await page.getByText('Progression & eligibility',{exact:true}).click();assert.match(await page.locator('[data-veteran-career-delta]').innerText(),/11 → 12/);assert.match(await page.locator('[data-veteran-delta]').innerText(),/OPTION UNLOCKED/)}
  if(mode==='extraction-results'){
   const panel=page.locator('.t-special-field-results[data-special-result="extraction"]');
   assert.equal(await panel.getAttribute('data-recording'),'confirmed');
   assert.match(await panel.locator('.t-special-achievement').innerText(),/PACK EXTRACTION RUN RECORDED.*No currency, Commander, Veteran or Pack Mastery progress/s);
   await panel.locator('.t-fr-details summary').click();
   assert.match(await page.getByLabel('Recorded Veteran challenge',{exact:true}).innerText(),/PACK EXTRACTION · COMPLETE.*No currency, Commander, Veteran or Pack Mastery progress/s);
  }
  assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
  await page.screenshot({path:out+'/'+width+'-'+mode+'.png',fullPage:true});cases.push({width,height,mode});await page.close();
 }
 writeFileSync(out+'/results.json',JSON.stringify({cases,limits:'Synthetic route-shaped states, actual React/store; physical Android/iPhone and real-player pacing not verified'},null,2));console.log('PASS Veteran browser '+cases.length+' focused cases');
}finally{await browser.close();await server.close()}
