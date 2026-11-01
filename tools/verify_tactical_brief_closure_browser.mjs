/** Focused real UI/production host QA; synthetic accounts, no network/player writes. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const phase=process.env.BRIEF_PHASE||'after',production=process.env.BRIEF_PRODUCTION==='1';
const integrated=process.env.BRIEF_INTEGRATED==='1';
const out=`artifacts/brief-closure/${phase}-${production?'production':'source'}`;
mkdirSync(out,{recursive:true});
// Reuse canonical-shaped account setup, not a duplicate rendering of the UI.
const fixture=readFileSync('tools/verify_tactical_purpose_return_browser.mjs','utf8');
let entry=fixture.match(/const entry=`([\s\S]*?)`;\nconst server/)[1];
if(production){
 entry=entry.slice(entry.indexOf('const params')).replace("createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));",'');
 entry='const store=window.__tactical;window.TacticalOps.init({onboarding:"off"});await window.TacticalOps.open();'+entry;
}else if(phase==='before')entry=entry.replaceAll('/tactical-ops-src/','/artifacts/baseline/tactical-ops-src/');
entry+=`\nif(params.get('tier')==='advanced')store.setState({selectedDirectiveTier:'advanced'});
window.petCalls=[];window.petPresent=true;
window.PetQuickActions.init({apiPost:async path=>{window.petCalls.push(path);return {ok:true,pets:{activePet:window.petPresent?{id:'qa-pet',name:'QA Pet'}:null,actionCooldowns:{}}}}});`;
const server=await createServer({configFile:false,cacheDir:`node_modules/.vite-brief-${phase}-${production}`,optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},server:{host:'127.0.0.1',port:0},plugins:[{name:'brief-closure-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{
 if(req.url==='/closure-bundle.js'){res.setHeader('Content-Type','application/javascript');res.end(readFileSync('js/tactical_ops.js'));return;}
 if(req.url==='/closure-pet.js'){res.setHeader('Content-Type','application/javascript');res.end(readFileSync('js/pet_quick_actions.js'));return;}
 if(!req.url?.startsWith('/closure-fixture'))return next();
 res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}#tacticalOpsRoot{--ah-chrome-top:32px;--ah-safe-bottom:24px}</style>'+(production?'<script src="/closure-bundle.js"></script>':'<div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div>')+'<script src="/closure-pet.js"></script><script type="module" src="/@closure"></script>');
 });},resolveId(id){if(id==='/@closure')return '\0closure';},load(id){if(id==='\0closure')return entry;}}]});
await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--disable-gpu']});
const cases=[],errors=[];
try{
 const page=await browser.newPage({hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','res.cloudinary.com'].includes(u.hostname)?r.continue():r.abort();});
 for(const [width,height] of (integrated?[[360,780],[390,844],[430,932]]:[[320,568],[390,844],[430,932]]))for(const tier of ['standard','advanced'])for(const motion of (integrated?['no-preference','reduce']:['no-preference'])){
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:motion});
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/closure-fixture?mode=brief&profile=veteran&tier=${tier}`);
  const overview=page.getByLabel('Mission overview',{exact:true});await overview.waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`${out}/${width}x${height}-${tier}-${motion}-overview.png`});
  if(phase==='after'){
   assert.match(await overview.innerText(),/WIN CONDITION.*RECOVER THE SIGNAL/s);
   assert.match(await overview.innerText(),/relay.*orthogonal cell/s);
   assert.match(await overview.innerText(),/FAIL IF:.*entire squad falls/s);
   if(tier==='advanced')assert.match(await overview.innerText(),/rounds divisible by 2.*round 6/s);
   const threats=page.getByLabel('Tactical threats',{exact:true});
   assert.equal(await threats.evaluate(e=>e.open),false);
   const summary=threats.locator('summary');await summary.scrollIntoViewIfNeeded();
   assert((await summary.boundingBox()).height>=44);await summary.focus();await page.keyboard.press('Enter');
   assert(await threats.evaluate(e=>e.open));assert((await threats.locator('p').innerText()).length>10);
   await page.screenshot({path:`${out}/${width}x${height}-${tier}-${motion}-threats.png`});
   await summary.click();assert.equal(await threats.evaluate(e=>e.open),false);
   for(const summary of await overview.locator('summary').all()){
    await summary.scrollIntoViewIfNeeded();await summary.click();assert(await summary.evaluate(e=>e.parentElement.open));await summary.click();
   }
  }
  const deploy=page.getByRole('button',{name:'DEPLOY SQUAD',exact:true});await deploy.scrollIntoViewIfNeeded();assert(await deploy.isEnabled());
  const rect=await deploy.boundingBox();assert(rect.height>=44&&rect.width>=44);
  assert(await deploy.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===e||e.contains(hit)}),'deploy obstructed');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow');
  assert(await overview.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'objective overflow');
  await page.screenshot({path:`${out}/${width}x${height}-${tier}-${motion}-deploy.png`});
  // Real pet script: tick/refresh cannot defeat the modal visibility rule.
  assert.equal(await page.locator('#petQuickActions').isVisible(),false);
  await page.evaluate(()=>PetQuickActions.refresh());assert.equal(await page.locator('#petQuickActions').isVisible(),false);
  if(production){
   for(const screen of ['war-table','brief','battle','results']){
    await page.evaluate(screen=>fixture.store.setState({screen}),screen);
    assert.equal(await page.locator('#petQuickActions').isVisible(),false,screen+' pet obstruction');
   }
   if(integrated){
    const panel=page.locator('.t-field-results');await panel.waitFor();
    assert.equal(await panel.getAttribute('data-recording'),'confirmed');
    assert.equal(await page.locator('#petQuickActions').isVisible(),false);
    await page.screenshot({path:`${out}/${width}x${height}-${tier}-${motion}-integrated-results.png`});
    await page.evaluate(()=>{const s=fixture.store.getState();fixture.completedRun={currentRunKey:s.currentRunKey,selectedMissionId:s.selectedMissionId,fieldResult:s.fieldResult,battle:s.battle}});
    await page.locator('.t-result-actions button').first().click();
    assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief','Results next returns to integrated brief');
    await page.getByLabel('Mission overview',{exact:true}).waitFor();
    assert.equal(await page.locator('#petQuickActions').isVisible(),false);
    await page.evaluate(()=>fixture.store.setState({...fixture.completedRun,screen:'results'}));
    await page.getByRole('button',{name:'Replay / Squad',exact:true}).click();
    assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief','Replay returns to integrated squad preparation');
    assert.equal(await page.locator('#petQuickActions').isVisible(),false);
   }
   await page.evaluate(()=>TacticalOps.close());
  }else await page.locator('#tacticalOpsRoot').evaluate(e=>e.dataset.open='0');
  await page.locator('#petQuickActions').waitFor({state:'visible'});
  await page.locator('.pqa-toggle').click();assert(await page.locator('.pqa-panel').isVisible());
  if(production)await page.evaluate(()=>TacticalOps.open());else await page.locator('#tacticalOpsRoot').evaluate(e=>e.dataset.open='1');
  assert.equal(await page.locator('#petQuickActions').isVisible(),false);
  if(production)await page.evaluate(()=>TacticalOps.close());else await page.locator('#tacticalOpsRoot').evaluate(e=>e.dataset.open='0');
  assert(await page.locator('.pqa-panel').isVisible(),'expanded pet state lost after close/reopen');
  await page.evaluate(async()=>{window.petPresent=false;await PetQuickActions.refresh()});
  assert.equal(await page.locator('#petQuickActions').isVisible(),false,'unequipped pet falsely restored');
  assert.deepEqual(await page.evaluate(()=>[...new Set(petCalls)]),['/webapp/pets/state'],'QA must not feed or pet');
  cases.push({width,height,tier,motion,integrated});
 }
 assert.deepEqual(errors,[]);
 writeFileSync(`${out}/results.json`,JSON.stringify({phase,production,cases,errors,limits:'Synthetic local accounts, Chromium touch emulation. No live APIs/persistence or physical Telegram Android/iOS.'},null,2));
 console.log(`PASS brief closure: ${cases.length} ${phase} ${production?'production IIFE/host':'React source'} mobile cases, disclosure/CTA/pet lifecycle`);
}finally{await browser.close();await server.close();}
