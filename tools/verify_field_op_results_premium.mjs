/** Actual React/store + raw production CSS; synthetic isolated states, no live APIs. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import vm from 'node:vm';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const phase=process.env.RESULTS_PHASE||'after',production=process.env.RESULTS_RUNTIME==='production';
const out=`artifacts/field-results/${phase}${production?'-production':''}`;
mkdirSync(out,{recursive:true});
// Reuse the established canonical-shaped Purpose/Return fixture, not invented game systems.
const fixtureSource=readFileSync('tools/verify_tactical_purpose_return_browser.mjs','utf8');
const scope={};vm.runInNewContext(fixtureSource.slice(fixtureSource.indexOf('const entry='),fixtureSource.indexOf('\nconst server='))+';globalThis.entry=entry',scope);
const extra=`
const scenario=params.get('scenario')||'victory',s=store.getState(),r={...s.fieldResult};
const patch={selectedMasteryChallenge:null,selectedVeteranChallenge:false,currentFieldContext:null,chapterMode:false};
if(['failure','pending','error','stale','missing','zero','rank4','veteran'].includes(scenario)){
 if(scenario==='failure'){r.victory=false;r.progressEarned=0;r.progressAfter=r.progressBefore;r.xpGranted=0;r.bonesGranted=0;r.regionalApplied=false;r.challengeSuccess=false;r.challengeBonus=0;patch.battle={...s.battle,results:{...s.battle.results,victory:false},failureReason:'DEADLINE'};}
 if(['pending','error','stale'].includes(scenario)) {patch.fieldResult=scenario==='stale'?{...r,runId:'another-run'}:null;patch.progressionCommitPending=scenario==='pending';patch.progressionError=scenario==='error'?'Connection interrupted. Retry saving.':null;}
 if(scenario==='missing'){delete r.xpGranted;delete r.bonesGranted;r.rewardAmountsAvailable=false;}
 if(scenario==='zero'){r.xpGranted=0;r.bonesGranted=0;r.progressEarned=0;r.progressAfter=r.progressBefore;r.challengeBonus=0;r.firstCycleSecure=false;r.firstCycleChallenge=false;r.regionalApplied=false;}
 if(scenario==='veteran')r.veteranCareer={before:7,after:8,unlocked:false,reason:'eligible_advanced',gained:1};
 if(scenario==='rank4'){r.rankBefore=3;r.rankAfter=4;r.veteranCareer={before:11,after:12,unlocked:true,reason:'unlocked',gained:1};}
}
if(!['pending','error','stale'].includes(scenario))patch.fieldResult=r;
if(scenario==='stale-mission')patch.fieldResult={...r,missionId:'field-relay-hold'};
if(scenario==='unrecorded')patch.fieldResult=null;
if(scenario==='mastery'){r.masteryChanges=[{unitId:'ally-02',kind:'clear',gained:3,beforeStage:1,stage:2,progress:3,newOptions:[]}];}
if(scenario==='campaign'){patch.selectedMissionId='dead-relay-courier';patch.fieldResult=null;}
if(scenario==='chapter'){patch.chapterMode=true;patch.chapterResult=null;}
if(scenario.startsWith('lockdown')){patch.selectedMissionId='field-relay-hold';patch.selectedMasteryChallenge='relay-lockdown-v1';patch.currentFieldContext={masteryChallenge:'relay-lockdown-v1',lockdownPlan:'anchor'};patch.fieldResult=scenario==='lockdown-pending'?null:{...r,missionId:'field-relay-hold',masteryChallenge:'relay-lockdown-v1',lockdownPlan:'anchor'};}
if(scenario.startsWith('extraction')){patch.selectedVeteranChallenge=true;patch.currentFieldContext={veteranChallenge:'pack-extraction-v1'};patch.fieldResult=scenario==='extraction-pending'?null:{...r,veteranChallenge:'pack-extraction-v1'};}
store.setState(patch);
window.fixture.calls=[];
// Retry is observed locally, without calling a server or modifying persistent state.
store.setState({saveFieldResult:async()=>{window.fixture.calls.push('save');}});
`;
let entry=scope.entry+extra;
if(phase==='before')entry=entry.replaceAll('/tactical-ops-src/','/artifacts/baseline/tactical-ops-src/');
if(production)entry='const store=window.__tactical;window.TacticalOps.init({onboarding:"off"});await window.TacticalOps.open();'+scope.entry.slice(scope.entry.indexOf('const params')).replace(/createRoot\(document.getElementById\('mount'\)\).render\(React.createElement\(TacticalApp\)\);/,'')+extra;
const server=await createServer({configFile:false,cacheDir:`node_modules/.vite-fr-${phase}`,optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},server:{host:'127.0.0.1',port:0,watch:{ignored:['**/artifacts/**']}},plugins:[{name:'results-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{
 if(req.url==='/results-bundle.js'){res.setHeader('Content-Type','application/javascript; charset=utf-8');res.end(readFileSync(phase==='before'?'artifacts/baseline/tactical_ops.js':'js/tactical_ops.js'));return;}
 if(!req.url?.startsWith('/results-fixture'))return next();res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html>'+(production?'<script src="/results-bundle.js"></script>':'')+'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14}#evidence-label{position:fixed;top:0;left:0;z-index:99999;background:#000;color:#ddd;font:8px monospace;pointer-events:none}#tacticalOpsRoot{--ah-chrome-top:32px;--ah-safe-bottom:24px;--ah-safe-left:6px;--ah-safe-right:6px}</style><div id="evidence-label">SYNTHETIC QA · NO LIVE PLAYER</div><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@results"></script>');
 });},resolveId(id){if(id==='/@results')return '\0results';},load(id){if(id==='\0results')return entry;}}]});
await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu']});
const cases=[],errors=[];
try{
 const page=await browser.newPage({hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
 // Keep tests isolated from analytics, player APIs and non-asset network services.
 await page.route('**/*',route=>{const u=new URL(route.request().url());return u.hostname==='127.0.0.1'||u.hostname==='res.cloudinary.com'?route.continue():route.abort();});
 for(const [width,height] of [[320,568],[320,740],[360,780],[390,844],[430,932]])for(const motion of ['no-preference','reduce'])for(const scenario of ['victory','failure','pending','error','stale','stale-mission','unrecorded','zero','missing','veteran','rank4','mastery']){
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:motion});
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/results-fixture?mode=results&profile=veteran&scenario=${scenario}`);
  await page.locator('.t-results').waitFor();await page.evaluate(()=>document.fonts.ready);
  if(phase==='after'){
   assert.equal(await page.locator('.t-field-results').count(),1);const panel=page.locator('.t-field-results');
   const recorded=!['pending','error','stale','stale-mission','unrecorded'].includes(scenario);
   assert.equal(await panel.getAttribute('data-recording'),recorded?'confirmed':scenario==='pending'?'pending':scenario==='error'?'failed':'unrecorded');
   assert.equal(await page.getByLabel('Confirmed mission earnings',{exact:true}).count(),recorded?1:0);
   if(scenario==='missing'){
    assert.deepEqual(await page.locator('.t-fr-rewards dd').allTextContents(),['—','—','+1']);
    assert.equal(await page.getByLabel('EXP amount unavailable',{exact:true}).count(),1);
   }
   if(scenario==='zero')assert.deepEqual(await page.locator('.t-fr-rewards dd').allTextContents(),['+0','+0','+0']);
   if(scenario==='rank4')assert.match(await page.locator('.t-fr-rank').innerText(),/RANK 3 → 4/);
   if(scenario==='veteran')assert.match(await page.locator('[data-veteran-career-delta]').innerText(),/7 → 8/);
   if(scenario==='failure')assert.match(await page.locator('h2').innerText(),/MISSION LOST/);
   const controls=page.locator('.t-result-actions button');
   for(const b of await controls.all()){
    await b.scrollIntoViewIfNeeded();const rect=await b.boundingBox();assert(rect.height>=44&&rect.width>=44,'touch target too small');
    assert(await b.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===e||e.contains(hit)}),'blocked action');
    assert(await b.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'clipped action text');
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal page overflow');
   assert(await panel.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'horizontal panel overflow');
   assert.deepEqual(await panel.locator('h2,p,dt,dd,strong').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)),[],'clipped text');
   assert.equal(await panel.locator('.t-result-actions').evaluate(e=>getComputedStyle(e).position),'static','fixed/sticky actions returned');
   assert.equal(await panel.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.effect.getComputedTiming().iterations===Infinity).length),0,'looping decoration');
   for(const summary of await panel.locator('summary').all()){
    await summary.scrollIntoViewIfNeeded();await summary.click();assert(await summary.evaluate(e=>e.parentElement.open));
    await summary.click();assert(!await summary.evaluate(e=>e.parentElement.open));
   }
   if(scenario==='pending')assert(await controls.first().isDisabled());
   if(['error','stale'].includes(scenario)){await controls.first().click();assert.deepEqual(await page.evaluate(()=>fixture.calls),['save']);}
   // Save top and action views after exercising real scrolling and disclosure controls.
   await panel.evaluate(e=>e.scrollTop=0);
  }
  await page.screenshot({path:`${out}/${width}x${height}-${motion}-${scenario}.png`});
  if(phase==='after'&&scenario==='victory'){
   await page.locator('.t-result-actions').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${width}x${height}-${motion}-actions.png`});
   await page.getByText('Progression & eligibility',{exact:true}).click();assert.match(await page.locator('.t-field-results').innerText(),/Total unspent balance, not points earned this run/);
   await page.locator('.t-result-actions button').first().click();assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief');
  }
  if(phase==='after'&&scenario==='zero'){await page.getByRole('button',{name:'Replay / Squad',exact:true}).click();assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief');}
  if(phase==='after'&&scenario==='failure'){await page.getByRole('button',{name:'REGROUP AT WAR TABLE',exact:true}).click();assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'war-table');}
  cases.push({width,height,motion,scenario});
 }
 if(phase==='after'){
  await page.setViewportSize({width:320,height:568});
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/results-fixture?mode=results&profile=veteran&scenario=error`);
  await page.locator('.t-field-results').waitFor();
  await page.evaluate(()=>fixture.store.setState({progressionCommitPending:true,progressionError:null}));
  assert.equal(await page.locator('.t-field-results').getAttribute('data-recording'),'pending');
  await page.evaluate(()=>fixture.store.setState({progressionCommitPending:false,fieldResult:{...fixture.store.getState().progression.fieldOps.lastResult}}));
  assert.equal(await page.locator('.t-field-results').getAttribute('data-recording'),'confirmed');
  const summary=page.getByText('Progression & eligibility',{exact:true});await summary.focus();await page.keyboard.press('Enter');
  assert(await summary.evaluate(e=>e.parentElement.open),'keyboard disclosure');
  await page.getByText('Combat report · this device',{exact:true}).click();
  await page.locator('.t-field-results').evaluate(panel=>{
   const values=[...panel.querySelectorAll('h2,p,dt,dd,strong,summary,button,small,.t-kicker')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);
   values.forEach(([e,size])=>e.style.fontSize=(size*2)+'px');
  });
  assert(await page.locator('.t-field-results').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'200% text stress overflow');
  for(const button of await page.locator('.t-result-actions button').all()){
   await button.scrollIntoViewIfNeeded();assert(await button.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===e||e.contains(hit)}),'text-scaled action blocked');
  }
  await page.screenshot({path:`${out}/320x568-text-200-stress.png`});
  cases.push({scenario:'recording-transition-keyboard-text-200',syntheticTextScaling:true});
  if(production){
   await page.evaluate(()=>TacticalOps.close());assert.equal(await page.locator('#tacticalOpsRoot').getAttribute('data-open'),'0');
   assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
   await page.evaluate(()=>TacticalOps.open());assert.equal(await page.locator('#tacticalOpsRoot').getAttribute('data-open'),'1');
   assert.equal(await page.locator('#tacticalOpsStyles').count(),1);
   cases.push({scenario:'production-close-reopen-scroll-style-lifecycle'});
  }
 }
 for(const scenario of ['campaign','chapter','lockdown','lockdown-pending','extraction','extraction-pending']){
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/results-fixture?mode=results&profile=veteran&scenario=${scenario}`);await page.locator('.t-results').waitFor();
  assert.equal(await page.locator('.t-field-results').count(),0,scenario+' mode changed');
  // Byte-for-byte legacy rendered content and class names across phases.
  writeFileSync(`${out}/legacy-${scenario}.html`,await page.locator('.t-results').evaluate(e=>e.outerHTML));
  cases.push({scenario,legacy:true});
 }
 assert.deepEqual(errors,[]);writeFileSync(`${out}/results.json`,JSON.stringify({phase,runtime:production?'production IIFE':'source React',cases,errors,limits:'Synthetic accounts; Chromium touch emulation; source React/store, mocked local retry; no physical Android/iOS or live persistence.'},null,2));
 console.log(`PASS ${phase}: ${cases.length} results/legacy cases, normal + reduced motion`);
}finally{await browser.close();await server.close();}
