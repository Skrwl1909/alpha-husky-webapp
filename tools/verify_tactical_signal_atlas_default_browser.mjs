/** Official route + production-IIFE parity. Real UI/store, synthetic transport only. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.ATLAS_DEFAULT_OUT||'artifacts/signal-atlas-official/default-route';
const artKitOnly=process.env.ATLAS_ART_KIT_ONLY==='1';
const artDir=out+'/art-kit';
const premiumPath='/images/tactical_ops/signal_atlas/v1/premium/';
mkdirSync(out,{recursive:true});
const expectedVersion=readFileSync('tactical-ops-src/version.ts','utf8').match(/VERSION\s*=\s*"([^"]+)"/)[1];
const entry=`
const params=new URLSearchParams(location.search),version=Number(params.get('growth')||1);
let canonical={version:1,foundationStage:'completed',completed:true,revision:10,activeRunId:null,
 lastCompletedRunId:'synthetic-foundation',updatedAt:1800000000,
 operations:{'broken-signal':{status:'active',missions:{'broken-signal-breach':'available',
 'broken-signal-recover':'locked','broken-signal-commander':'locked'},activeMissionRun:null,lastCompletedMissionRunId:null}},
 playerGrowth:{version,earnedPoints:6,spentPoints:0,claimedFirstClears:['broken-signal-breach','broken-signal-recover',
 'broken-signal-commander','dead-relay-courier','dead-relay-hold','dead-relay-guardian'],
 heroes:['alpha','ally-02','ally-03'].map(heroId=>({heroId,discipline:null,ranks:{},respecUsed:false}))},
 packMastery:Object.fromEntries(['ally-02','ally-03'].map(id=>[id,{progress:8,stage:3,selected:'A',unlockedOptions:['A','B']}]))};
const calls=[],receipts=new Map();let mode='ok';
window.fixture={calls,mode:value=>mode=value,state:()=>structuredClone(canonical),doctrine:(rank,active=false)=>{
 canonical.lungeDoctrineAvailable=true;canonical.revision++;
 canonical.playerGrowth.heroes[1]={heroId:'ally-02',discipline:rank?'pursuer':null,ranks:rank?{'u02-burst':rank}:{},respecUsed:false};
 canonical.playerGrowth.spentPoints=rank;
 canonical.lastHowl={version:1,runId:active?'frozen-run':null,status:active?'ACTIVE':null,best:null};
},active:kind=>{
 canonical.activeRunId=null;delete canonical.fieldOps;delete canonical.chapterActiveMission;delete canonical.tacticalChapter;
 canonical.operations['broken-signal'].activeMissionRun=null;delete canonical.operations['dead-relay'];
 canonical.playerGrowth.heroes[0]={heroId:'alpha',discipline:'vanguard',ranks:{'alpha-strike':1},respecUsed:false};
 canonical.playerGrowth.spentPoints=1;canonical.revision++;
 const run={runId:'synthetic-accepted',missionId:'dead-relay-courier',squadIds:['alpha']};
 if(kind==='foundation')canonical.activeRunId=run.runId;
 if(kind==='campaign')canonical.operations['dead-relay']={status:'active',missions:{'dead-relay-courier':'available'},activeMissionRun:run,lastCompletedMissionRunId:null};
 if(kind==='field')canonical.fieldOps={records:{},activeMissionRun:{...run,missionId:'field-relay-hold'},lastCompletedMissionRunId:null};
 if(kind==='chapter'){
  canonical.tacticalChapter={version:1,chapterId:'edge-relay',status:'ACTIVE',doctrine:'RECON',revision:0,completedMissionIds:[],activeRunId:run.runId,intelEffect:'NONE',intelConsumedByRunId:null,lastReceiptId:null};
  canonical.chapterActiveMission={...run,missionId:'field-relay-recovery',chapterContext:{version:1,chapterId:'edge-relay',doctrine:'RECON',stageIndex:0},
   combatProfileV3:{version:3,mode:'battle-v1',alpha:{hp:120,atk:28,def:12,spd:14},pet:null},
   rulesContract:{rulesetVersion:'tactical-intent-vnext.0',missionId:'field-relay-recovery',missionRevision:1,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1,source:'BACKEND_SNAPSHOT'}};
 }
}};
window.apiPost=async(path,body={})=>{
 calls.push({path,body});if(path.endsWith('/state')){if(mode==='refresh-network')throw Error('synthetic refresh failure');return {ok:true,data:structuredClone(canonical)};}
 if(!['/webapp/tactical-foundation/growth/upgrade','/webapp/tactical-foundation/growth/respec','/webapp/tactical-foundation/growth/lunge-doctrine'].includes(path))throw Error('unexpected fixture request '+path);
 await new Promise(resolve=>setTimeout(resolve,250));
 if(mode==='network')throw Error('synthetic disconnected before commit');
 if(mode==='409')throw Object.assign(Error('Conflict'),{status:409,data:{ok:false,code:'growth_run_active',details:{state:structuredClone(canonical)}}});
 if(mode==='stale')throw Object.assign(Error('Conflict'),{status:409,data:{ok:false,code:'stale_revision',details:{state:structuredClone(canonical)}}});
 if(mode==='401')throw Object.assign(Error('Unauthorized'),{status:401,data:{ok:false,code:'unauthorized'}});
 if(receipts.has(body.requestId))return structuredClone(receipts.get(body.requestId));
 if(body.expectedRevision!==canonical.revision)throw Error('fixture revision mismatch');
 const hero=canonical.playerGrowth.heroes.find(h=>h.heroId===body.heroId);
 if(path.endsWith('/lunge-doctrine')){
  const cnc=canonical.playerGrowth.heroes[1];
  if(body.choice==='wide-v1')cnc.lungeDoctrine='wide-v1';else delete cnc.lungeDoctrine;
 }
 else if(path.endsWith('/upgrade')){hero.discipline=body.discipline;hero.ranks[body.skillId]=body.rank;canonical.playerGrowth.spentPoints++;}
 else {canonical.playerGrowth.spentPoints-=Object.values(hero.ranks).reduce((n,r)=>n+r,0);hero.ranks={};hero.discipline=null;hero.respecUsed=true;}
 canonical.revision++;const receipt={ok:true,data:structuredClone(canonical)};receipts.set(body.requestId,receipt);
 if(mode==='lost')throw Error('synthetic reply lost after commit');
 return receipt;
};
if(params.get('runtime')==='bundle')await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/js/tactical_ops.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
else await import('/tactical-ops-src/host/production-entry.ts');
window.TacticalOps.init({apiPost:window.apiPost});await window.TacticalOps.open();
`;
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-atlas-official',
 resolve:{preserveSymlinks:true,dedupe:['react','react-dom']},
 optimizeDeps:{include:['react','react-dom','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},
 server:{host:'127.0.0.1',port:0,hmr:false},plugins:[{name:'official-atlas-fixture',
 configureServer(s){s.middlewares.use((req,res,next)=>{if(req.url?.startsWith('/official-atlas?')){
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14}</style><script type="module" src="/@official-atlas"></script>');return;}next();});},
 resolveId(id){if(id==='/@official-atlas')return '\0official-atlas';},load(id){if(id==='\0official-atlas')return entry;}}]});
await server.listen();
const base='http://127.0.0.1:'+server.httpServer.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
const results=[],errors=[];
let page;
async function load(runtime,width,growth=1,{artKit=false}={}){
 if(page)await page.close();page=await browser.newPage({viewport:{width,height:width===320?568:844},hasTouch:true,reducedMotion:'reduce'});
 page.on('pageerror',error=>errors.push(String(error)));
 await page.goto(base+'/official-atlas?'+new URLSearchParams({runtime,growth}));
 await page.getByRole('navigation',{name:'Tactical command sections'}).waitFor();
 if(artKit){
  assert.equal(await page.evaluate(path=>performance.getEntriesByType('resource').filter(item=>item.name.includes(path)).length,premiumPath),0,
   'the art kit is not requested on the War Table');
 }
 if (!artKit && !process.env.ATLAS_DEFAULT_ACTIONS_ONLY && !process.env.ATLAS_M2_ONLY) {
  const target = page.getByRole('region', { name: 'Next target' });
  await target.getByRole('button', { name: 'INSPECT UPGRADE' }).click();
  const inspection = page.getByRole('region', { name: 'Skill node inspection' });
  await inspection.getByText('1 cell reach', { exact: true }).waitFor();
  await inspection.getByText('2 cells reach', { exact: true }).waitFor();
  await page.getByRole('button',{name:'Close Signal Atlas',exact:true}).click();
 }
 await page.getByRole('button',{name:'03 SQUAD',exact:true}).click();
 await page.locator('.tsa-root').waitFor();
}
async function layout(){
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page must not overflow horizontally');
 assert(await page.locator('.tsa-root,.t-command-pane,.t-brief').evaluateAll(elements=>elements.every(e=>e.scrollWidth<=e.clientWidth+1)),'host and Atlas must not conceal horizontal overflow');
 const immersive=await page.locator('.tsa-root').evaluate(element=>{
  const rect=element.getBoundingClientRect();return {position:getComputedStyle(element).position,top:rect.top,width:rect.width,height:rect.height,viewportWidth:innerWidth,viewportHeight:innerHeight};
 });
 assert.equal(immersive.position,'fixed','Atlas is a dedicated overlay, not an embedded squad card');
 assert(Math.abs(immersive.top)<=2 && immersive.width>=immersive.viewportWidth-2 && immersive.height>=immersive.viewportHeight-2,'Atlas covers the full mobile viewport');
 assert(await page.locator('.t-fill').first().evaluate(element=>element.inert),'underlying War Table is inert while Atlas is open');
 assert.equal(await page.locator('.t-growth-panel,.t-growth-atlas-cta').count(),0,'legacy purchase panel and beta launcher absent');
 assert.equal(await page.getByRole('button',{name:/OPEN SIGNAL ATLAS|CHARACTER SKILLBOOK|BETA/}).count(),0);
 const small=await page.locator('.tsa-root button').evaluateAll(buttons=>buttons.filter(button=>{const r=button.getBoundingClientRect();return r.width&&(r.width<44||r.height<44);}).map(button=>button.textContent));
 assert.deepEqual(small,[],'Atlas controls retain 44px targets');
}
async function inspectStrike(){
 await page.getByRole('button',{name:/Open FANG/}).click();
 await page.getByRole('button',{name:/STRIKE rank 1,/}).click();
 await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).waitFor();
}
async function captureKit(width,scene){
 // Temporarily unclip the outer shell for the evidence image only. The
 // interaction/target checks above this call use the real fixed mobile shell.
 const exportStyle=await page.addStyleTag({content:'html,body{overflow:visible!important}#tacticalOpsRoot{position:relative!important;height:auto!important;max-height:none!important;overflow:visible!important;container-type:inline-size!important}#tacticalOpsRoot .t-shell{height:auto!important;overflow:visible!important}#tacticalOpsRoot .t-fill{position:relative!important}#tacticalOpsRoot .t-brief{height:auto!important;overflow:visible!important}'});
 try { await page.locator('.tsa-root').screenshot({path:artDir+'/'+width+'-'+scene+'.png'}); }
 finally { await exportStyle.evaluate(style=>style.remove()); }
}
async function assertArtImage(locator,file,size){
 await locator.scrollIntoViewIfNeeded();
 const image=await locator.evaluate(async element=>{
  await element.decode();
  return {src: element.currentSrc, width: element.naturalWidth, height: element.naturalHeight};
 });
 assert(image.src.endsWith('/'+file),image.src);
 assert.deepEqual([image.width,image.height],[size,size],file);
}
async function verifyArtKit(){
 mkdirSync(artDir,{recursive:true});
 for(const width of [320,390,430]){
  await load('bundle',width,2,{artKit:true});
  const portrait=page.locator('.tsa-alpha-portrait-art img');
  await assertArtImage(portrait,'atlas_alpha_portrait_closeup_v1.webp',768);
  const pathImages=page.locator('.tsa-alpha-branches img');
  assert.equal(await pathImages.count(),3);
  for(const [index,name] of ['fang','howl','instinct'].entries())
   await assertArtImage(pathImages.nth(index),'atlas_path_'+name+'_v1.webp',640);
  assert.equal(await page.locator('.tsa-future-signal button').count(),0);
  assert(await page.getByText('FUTURE SIGNAL',{exact:true}).isVisible());
  assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(item=>/atlas_environment_v1|atlas_alpha_portrait_full_v1/.test(item.name)).length),0,
   'overview does not request the tree environment or full portrait on mobile');
  await layout();await captureKit(width,'overview');

  await inspectStrike();
  await assertArtImage(page.locator('.tsa-focus-title img'),'atlas_path_fang_v1.webp',640);
  const tree=page.locator('.tsa-focus');
  assert.match(await tree.evaluate(el=>getComputedStyle(el).backgroundImage),/atlas_environment_v1\.webp/);
  await page.waitForFunction(()=>performance.getEntriesByType('resource').some(item=>item.name.endsWith('/atlas_environment_v1.webp')));
  const nodeImage=page.locator('.tsa-node img').first();
  assert(!((await nodeImage.getAttribute('src'))||'').includes(premiumPath),'skill nodes retain their action icons');
  assert(await page.getByText('2 cells reach',{exact:true}).isVisible());
  assert.equal(await page.locator('.tsa-alpha .tsa-state-available').first().evaluate(node=>getComputedStyle(node).animationName),'none','reduced motion');
  await layout();await captureKit(width,'fang-inspector');

  await page.getByRole('group',{name:'Choose live sector'}).getByRole('button',{name:/Open HOWL/}).click();
  await assertArtImage(page.locator('.tsa-focus-title img'),'atlas_path_howl_v1.webp',640);
  await page.getByRole('button',{name:/HOWL rank 1, available:/}).click();
  assert(await page.getByText('3 turns cooldown',{exact:true}).isVisible());
  await layout();await captureKit(width,'howl-inspector');

  await page.evaluate(()=>fixture.active('field'));
  await page.getByRole('button',{name:'Refresh Tactical Ops'}).click();
  await page.getByText('ACTIVE RUN · COMPLETE CURRENT MISSION',{exact:true}).waitFor();
  await page.getByRole('button',{name:/HOWL rank 1, active-run:/}).click();
  assert(await page.getByRole('button',{name:'COMPLETE CURRENT MISSION',exact:true}).isDisabled());
  await layout();await captureKit(width,'active-run');

  await page.getByRole('button',{name:'Alpha Overview',exact:true}).click();
  await page.getByRole('button',{name:/CNC TACTICAL HUNTER/}).click();
  assert.equal(await page.locator('.tsa-alpha-portrait-art,.tsa-focus-title .tsa-path-emblem').count(),0);
  assert.doesNotMatch(await page.locator('.tsa-focus').evaluate(el=>getComputedStyle(el).backgroundImage),/atlas_environment_v1/);
  await layout();await captureKit(width,'squad-cnc');
  assert.equal(await page.evaluate(()=>fixture.calls.filter(call=>call.path.includes('/growth/')).length),0);
  results.push({runtime:'bundle',width,artKit:true,overview:true,fang:true,howl:true,activeRun:true,squad:true,reducedMotion:true});
 }
 await load('bundle',820,2,{artKit:true});
 await assertArtImage(page.locator('.tsa-alpha-portrait-art img'),'atlas_alpha_portrait_full_v1.webp',768);
 assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(item=>item.name.includes('atlas_alpha_portrait_closeup_v1')).length),0,
  'desktop selects only the full portrait');
 results.push({runtime:'bundle',width:820,fullPortrait:true});
 await page.setViewportSize({width:320,height:568});
 await page.route('**/premium/atlas_alpha_portrait_*.webp',route=>route.abort());
 await page.reload();
 await page.getByRole('button',{name:'03 SQUAD',exact:true}).click();
 await page.waitForFunction(()=>{
  const image=document.querySelector('.tsa-alpha-portrait-art img');
  return image?.complete && image.naturalWidth>0 && !image.currentSrc.includes('/premium/');
 });
 await layout();
 results.push({runtime:'bundle',width:320,portraitFallback:true});

}
try{
 if(!artKitOnly){
 for(const runtime of ['source','bundle'])for(const width of [320,390,430]){
  await load(runtime,width,2);
  await page.getByRole('button',{name:/CNC TACTICAL HUNTER/}).click();
  await page.getByRole('button',{name:/Open PURSUIT/}).click();
  const panel=page.getByRole('region',{name:'Lunge field doctrine'});
  assert.equal(await panel.count(),0,'older backend hides the doctrine');
  const refresh=()=>page.getByRole('button',{name:'Refresh Tactical Ops'}).click();
  await page.evaluate(()=>fixture.doctrine(0));await refresh();
  assert(await panel.isHidden(),'Doctrine choices are reserved for their dedicated stage');
  await page.getByRole('button',{name:/LUNGE FIELD DOCTRINE/}).first().click();
  await panel.waitFor({state:'visible'});
  const wide=panel.getByRole('button',{name:'Wide Lunge',exact:true});
  await wide.waitFor();
  assert(await wide.isDisabled(),'R0 cannot select');
  await page.evaluate(()=>fixture.doctrine(1,true));await refresh();
  await panel.getByText('Finish the active run to switch.').waitFor();
  assert(await wide.isDisabled());
  await page.evaluate(()=>fixture.doctrine(1));await refresh();
  await panel.getByText('Finish the active run to switch.').waitFor({state:'detached'});
  await layout();
  await panel.scrollIntoViewIfNeeded();
  assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'doctrine fits without clipping');
  if(width===390){
   for(const [mode,code] of [['401','unauthorized'],['stale','stale_revision']]){
    await page.evaluate(mode=>fixture.mode(mode),mode);
    await wide.click();
    await page.getByRole('alert').filter({hasText:code}).waitFor();
    assert.equal(await panel.getByText(/Server recorded/).count(),0);
   }
   await page.evaluate(()=>fixture.mode('lost'));
   await wide.click();
   await page.getByRole('alert').filter({hasText:'progression_request_failed'}).waitFor();
   assert.equal(await panel.getByText(/Server recorded/).count(),0);
   assert(await panel.getByRole('button',{name:'Heavy Lunge · Selected',exact:true}).isVisible());
   await page.evaluate(()=>fixture.mode('ok'));await refresh();
   await panel.getByRole('button',{name:'Wide Lunge · Selected',exact:true}).waitFor();
   assert.equal(await panel.getByText(/Server recorded/).count(),0,'refresh is not a mutation receipt');
   await panel.getByRole('button',{name:'Heavy Lunge',exact:true}).click();
  }else{
   await wide.evaluate(button=>{button.click();button.click();});
  }
  await panel.getByText('Server recorded. Applies to the next accepted run.').waitFor();
  const received=await page.evaluate(()=>({calls:fixture.calls.filter(c=>c.path.endsWith('/lunge-doctrine')),state:fixture.state()}));
  assert.equal(received.calls.length,width===390?4:1,'one mutation per deliberate switch');
  assert.equal(received.state.playerGrowth.spentPoints,1);
  await page.screenshot({path:out+'/'+runtime+'-'+width+'-wide-lunge.png'});
  results.push({runtime,width,doctrine:true});
 }
 if(!process.env.ATLAS_M2_ONLY){
 if(!process.env.ATLAS_DEFAULT_ACTIONS_ONLY)for(const runtime of ['source','bundle'])for(const width of [320,360,390,430])for(const growth of [1,2]){
  await load(runtime,width,growth);await layout();
  assert.equal(await page.locator('.tsa-root').count(),1);
  const version=await page.evaluate(()=>window.__AH_TACTICAL_OPS_VER__);
  assert.equal(version,expectedVersion);
  await page.getByRole('button',{name:'PACK MASTERY',exact:true}).click();
  assert.equal(await page.locator('.tsa-root').count(),0);
  await page.locator('.t-pack-mastery').waitFor();
  await page.getByRole('button',{name:'SIGNAL ATLAS',exact:true}).click();
  await page.getByRole('button',{name:/^SHADOW/}).first().click();
  await page.getByRole('button',{name:/Open SUPPORT/}).click();
  await page.getByRole('button',{name:/MEND rank 1,/}).click();
  if(growth===1){
   assert(await page.getByRole('button',{name:'UNAVAILABLE',exact:true}).isDisabled());
   assert(await page.getByText(/already at its minimum cooldown/).first().isVisible());
   assert.equal(await page.evaluate(()=>fixture.calls.filter(c=>c.path.endsWith('/growth/upgrade')).length),0);
  }else assert(await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).isEnabled());
  await layout();
  await page.getByRole('button',{name:'Close Signal Atlas',exact:true}).click();
  assert.equal(await page.locator('.tsa-root').count(),0);
  assert(!await page.locator('.t-fill').first().evaluate(element=>element.inert),'War Table restores interaction on close');
  assert(await page.getByRole('button',{name:'01 COMMAND',exact:true}).getAttribute('aria-pressed')==='true');
  await page.getByRole('button',{name:'03 SQUAD',exact:true}).click();await page.locator('.tsa-root').waitFor();
  await layout();
  if(growth===1){await page.screenshot({path:out+'/'+runtime+'-'+width+'-official.png'});}
  const evidence={runtime,width,growth,version,onlySkillbook:true,mastery:true,closeToCommand:true,noEffectBlocked:growth===1};
  results.push(evidence);console.log('PASS official route',JSON.stringify(evidence));
 }
 for(const runtime of ['source','bundle']){
  await load(runtime,390,2);await inspectStrike();
  await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).click();await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(),0,'Escape dismisses the confirmation first');
  assert.equal(await page.locator('.tsa-root').count(),1,'Escape inside confirmation must not close Tactical Ops');
  for(const [mode,code] of [['409','growth_run_active'],['stale','stale_revision'],['network','progression_request_failed']]){
   await page.evaluate(mode=>fixture.mode(mode),mode);
   await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).click();await page.getByRole('button',{name:'CONFIRM',exact:true}).click();
   await page.getByRole('alert').filter({hasText:code}).first().waitFor();
   assert.equal(await page.getByRole('alert').filter({hasText:code}).count(),1,'one readable error, not duplicated in the War Table header');
   assert.equal(await page.locator('.t-wt-error').count(),0);
   assert.equal(await page.evaluate(()=>fixture.state().playerGrowth.spentPoints),0);
   assert.equal(await page.locator('.tsa-feedback.success').count(),0);
   assert.equal(await page.locator('.tsa-activation').count(),0,'server rejection never triggers unlock animation');
  }
  assert.equal(await page.evaluate(()=>fixture.calls.filter(c=>c.path.endsWith('/growth/upgrade')).length),3,'one request per manual confirmation, no auto retry');
  await page.evaluate(()=>fixture.mode('ok'));
  await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).click();await page.getByRole('button',{name:'CONFIRM',exact:true}).click();
  await page.locator('.tsa-activation').waitFor();
  assert(await page.locator('.tsa-activation').getByText(/STRIKE · RANK I/).isVisible(),'confirmed rank gets an activation moment');
  await page.getByText(/SERVER RECORDED · STRIKE RANK 1/).waitFor();
  assert.equal(await page.evaluate(()=>fixture.state().playerGrowth.spentPoints),1);
  await page.getByRole('button',{name:'RESET THIS HERO · ONCE FREE',exact:true}).click();await page.getByRole('button',{name:'CONFIRM',exact:true}).click();
  await page.getByText(/This hero's one-time reset was used/).waitFor();
  assert(await page.getByRole('button',{name:'ONE-TIME RESET USED',exact:true}).isDisabled());
  assert.equal(await page.evaluate(()=>fixture.state().playerGrowth.spentPoints),0);
  await page.getByRole('button',{name:'Close Signal Atlas',exact:true}).click();
  await page.evaluate(()=>fixture.mode('refresh-network'));await page.getByRole('button',{name:'Refresh Tactical Ops'}).click();
  await page.getByRole('alert').filter({hasText:'progression_request_failed'}).waitFor();
  assert.equal(await page.getByRole('alert').count(),1,'refresh failures remain readable after returning to War Table');
  assert.equal(await page.locator('.tsa-feedback.success').count(),0);
  assert.equal(await page.locator('.t-wt-error[role="alert"]').count(),1,'global error resumes when Atlas is closed');
  await page.evaluate(()=>fixture.mode('ok'));await page.getByRole('button',{name:'Refresh Tactical Ops'}).click();
  await page.getByRole('alert').waitFor({state:'detached'});
  await page.getByRole('button',{name:'03 SQUAD',exact:true}).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.tsa-root').count(),0,'Escape outside confirmation retains the host close behavior');
  assert.equal(await page.evaluate(()=>window.TacticalOps.getState().open),false);
  results.push({runtime,dialogEscape:true,hostEscape:true,canonicalFailureCodes:true,noRetry:true,canonicalPurchase:true,oneTimeRespec:true});
 }
 // A lost purchase response is followed by a state read, never another write.
 for (const runtime of ['source','bundle']) {
  await load(runtime,390,2);await inspectStrike();
  await page.evaluate(()=>fixture.mode('lost'));
  await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).click();
  await page.getByRole('button',{name:'CONFIRM',exact:true}).evaluate(button=>{button.click();button.click()});
  await page.getByRole('alert').filter({hasText:'progression_request_failed'}).waitFor();
  await page.getByRole('button',{name:/STRIKE rank 1, recorded:/}).waitFor();
  assert.equal(await page.locator('.tsa-feedback.success').count(),0,'refresh does not impersonate the lost receipt');
  assert.equal(await page.evaluate(()=>fixture.calls.filter(call=>call.path.endsWith('/growth/upgrade')).length),1);
  assert.equal(await page.evaluate(()=>fixture.state().playerGrowth.spentPoints),1);
  results.push({runtime,lostPurchaseReconciled:true,singleDebit:true,noFalseReceipt:true});
 }
 // One active-run family per requested width, in both saved Growth contracts and runtimes.
 for(const runtime of ['source','bundle']){
  await load(runtime,390,2);
  await page.evaluate(()=>fixture.doctrine(1,true));
  await page.getByRole('button',{name:'Refresh Tactical Ops'}).click();
  await page.getByText('ACTIVE RUN · COMPLETE CURRENT MISSION',{exact:true}).waitFor();
  assert(await page.getByText(/available points are preserved/).isVisible(),'Last Howl lock explains why unspent points cannot be used');
  await page.getByRole('button',{name:/Open FANG/}).click();
  await page.getByRole('button',{name:/STRIKE rank 1, active-run:/}).click();
  assert(await page.getByRole('button',{name:'COMPLETE CURRENT MISSION',exact:true}).isDisabled());
  assert.equal(await page.evaluate(()=>fixture.calls.filter(call=>call.path.endsWith('/growth/upgrade')).length),0);
  results.push({runtime,lastHowlLock:true,pointsReason:true,noPurchase:true});
 }
 for(const runtime of ['source','bundle'])for(const [width,kind] of [[320,'foundation'],[360,'campaign'],[390,'field'],[430,'chapter']])for(const growth of [1,2]){
  await load(runtime,width,growth);await page.evaluate(kind=>fixture.active(kind),kind);
  await page.getByRole('button',{name:'Refresh Tactical Ops'}).click();
  await page.getByText('ACTIVE RUN · COMPLETE CURRENT MISSION',{exact:true}).waitFor();
  const frozen=await page.evaluate(()=>JSON.stringify(fixture.state()));
  await page.getByRole('button',{name:/Open FANG/}).click();
  await page.getByRole('button',{name:/STRIKE rank 2, active-run:/}).click();
  assert(await page.getByRole('button',{name:'COMPLETE CURRENT MISSION',exact:true}).isDisabled());
  assert(await page.getByRole('button',{name:'RESET THIS HERO · ONCE FREE',exact:true}).isDisabled());
  assert.equal(await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>fixture.calls.filter(c=>/growth\/(upgrade|respec)$/.test(c.path)).length),0);
  assert.equal(await page.evaluate(()=>JSON.stringify(fixture.state())),frozen,'locked inspection changes no accepted snapshot or points');
  await layout();
  if(growth===1)await page.screenshot({path:out+'/'+runtime+'-'+width+'-active-'+kind+'.png'});
  await page.evaluate(()=>fixture.active(null));await page.getByRole('button',{name:'Refresh Tactical Ops'}).click();
  await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).waitFor();
  assert(await page.getByRole('button',{name:'RESET THIS HERO · ONCE FREE',exact:true}).isEnabled());
  results.push({runtime,width,growth,activeRun:kind,upgradeBlocked:true,respecBlocked:true,noRequests:true,refreshUnlock:true});
 }
 for(const runtime of ['source','bundle'])for(const action of ['upgrade','respec']){
  await load(runtime,390,2);
  if(action==='respec'){await page.evaluate(()=>fixture.active(null));await page.getByRole('button',{name:'Refresh Tactical Ops'}).click();}
  await page.getByRole('button',{name:/Open FANG/}).click();
  if(action==='upgrade'){await page.getByRole('button',{name:/STRIKE rank 1,/}).click();await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).click();}
  else await page.getByRole('button',{name:'RESET THIS HERO · ONCE FREE',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  // Model a background canonical refresh while the modal blocks pointer input.
  await page.evaluate(()=>{fixture.active('field');document.querySelector('.t-fill button[aria-label="Refresh Tactical Ops"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
  await page.getByRole('dialog').getByText(/ACTIVE RUN/).waitFor();
  assert(await page.getByRole('button',{name:'CONFIRM',exact:true}).isDisabled(),'new canonical run invalidates an already-open confirmation');
  assert(await page.getByRole('dialog').getByText(/ACTIVE RUN/).isVisible());
  await page.getByRole('button',{name:'CANCEL',exact:true}).click();
  assert.equal(await page.evaluate(()=>fixture.calls.filter(c=>/growth\/(upgrade|respec)$/.test(c.path)).length),0);
  results.push({runtime,action,confirmationInvalidatedByCanonicalRun:true});
 }
 }
 }
 if(!process.env.ATLAS_M2_ONLY && !process.env.ATLAS_DEFAULT_ACTIONS_ONLY)await verifyArtKit();
 assert.deepEqual(errors,[]);
 console.log('PASS official Atlas source/IIFE parity: '+results.length+' scenario groups');
}catch(error){
 if(page){writeFileSync(out+'/failure.json',JSON.stringify(await page.evaluate(()=>({url:location.href,
  canonical:window.fixture.state(),calls:window.fixture.calls,text:document.body.innerText})),null,2));}
 throw error;
}finally{
 writeFileSync(out+'/results.json',JSON.stringify({browser:browser.version(),results,errors,
  limits:'Real production bootstrap, UI, parser and store; synthetic transport responses. No backend or physical-device acceptance.'},null,2));
 await browser.close();await server.close();
}
