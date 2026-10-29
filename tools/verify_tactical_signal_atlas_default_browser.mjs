/** Official route + production-IIFE parity. Real UI/store, synthetic transport only. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.ATLAS_DEFAULT_OUT||'artifacts/signal-atlas-official/default-route';
mkdirSync(out,{recursive:true});
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
window.fixture={calls,mode:value=>mode=value,state:()=>structuredClone(canonical)};
window.apiPost=async(path,body={})=>{
 calls.push({path,body});if(path.endsWith('/state'))return {ok:true,data:structuredClone(canonical)};
 if(!['/webapp/tactical-foundation/growth/upgrade','/webapp/tactical-foundation/growth/respec'].includes(path))throw Error('unexpected fixture request '+path);
 await new Promise(resolve=>setTimeout(resolve,250));
 if(mode==='network')throw Error('synthetic disconnected before commit');
 if(mode==='409')throw Object.assign(Error('Conflict'),{status:409,data:{ok:false,code:'growth_run_active',details:{state:structuredClone(canonical)}}});
 if(mode==='stale')throw Object.assign(Error('Conflict'),{status:409,data:{ok:false,code:'stale_revision',details:{state:structuredClone(canonical)}}});
 if(receipts.has(body.requestId))return structuredClone(receipts.get(body.requestId));
 if(body.expectedRevision!==canonical.revision)throw Error('fixture revision mismatch');
 const hero=canonical.playerGrowth.heroes.find(h=>h.heroId===body.heroId);
 if(path.endsWith('/upgrade')){hero.discipline=body.discipline;hero.ranks[body.skillId]=body.rank;canonical.playerGrowth.spentPoints++;}
 else {canonical.playerGrowth.spentPoints-=Object.values(hero.ranks).reduce((n,r)=>n+r,0);hero.ranks={};hero.discipline=null;hero.respecUsed=true;}
 canonical.revision++;const receipt={ok:true,data:structuredClone(canonical)};receipts.set(body.requestId,receipt);return receipt;
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
async function load(runtime,width,growth=1){
 if(page)await page.close();page=await browser.newPage({viewport:{width,height:width===320?568:844},hasTouch:true,reducedMotion:'reduce'});
 page.on('pageerror',error=>errors.push(String(error)));
 await page.goto(base+'/official-atlas?'+new URLSearchParams({runtime,growth}));
 await page.getByRole('navigation',{name:'Tactical command sections'}).waitFor();
 await page.getByRole('button',{name:'03 SQUAD',exact:true}).click();
 await page.locator('.tsa-root').waitFor();
}
async function layout(){
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page must not overflow horizontally');
 assert(await page.locator('.tsa-root,.t-command-pane,.t-brief').evaluateAll(elements=>elements.every(e=>e.scrollWidth<=e.clientWidth+1)),'host and Atlas must not conceal horizontal overflow');
 assert.equal(await page.locator('.t-growth-panel,.t-growth-atlas-cta').count(),0,'legacy purchase panel and beta launcher absent');
 assert.equal(await page.getByRole('button',{name:/OPEN SIGNAL ATLAS|CHARACTER SKILLBOOK|BETA/}).count(),0);
 const small=await page.locator('.tsa-root button').evaluateAll(buttons=>buttons.filter(button=>{const r=button.getBoundingClientRect();return r.width&&(r.width<44||r.height<44);}).map(button=>button.textContent));
 assert.deepEqual(small,[],'Atlas controls retain 44px targets');
}
async function inspectStrike(){
 await page.getByRole('button',{name:/Open ASSAULT/}).click();
 await page.getByRole('button',{name:/STRIKE rank 1,/}).click();
 await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).waitFor();
}
try{
 if(!process.env.ATLAS_DEFAULT_ACTIONS_ONLY)for(const runtime of ['source','bundle'])for(const width of [320,360,390,430])for(const growth of [1,2]){
  await load(runtime,width,growth);await layout();
  assert.equal(await page.locator('.tsa-root').count(),1);
  const version=await page.evaluate(()=>window.__AH_TACTICAL_OPS_VER__);
  assert.equal(version,'tactical_ops.js v3.6.9-official-signal-atlas');
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
   assert.equal(await page.evaluate(()=>fixture.state().playerGrowth.spentPoints),0);
   assert.equal(await page.locator('.tsa-feedback.success').count(),0);
  }
  assert.equal(await page.evaluate(()=>fixture.calls.filter(c=>c.path.endsWith('/growth/upgrade')).length),3,'one request per manual confirmation, no auto retry');
  await page.evaluate(()=>fixture.mode('ok'));
  await page.getByRole('button',{name:'REVIEW UPGRADE',exact:true}).click();await page.getByRole('button',{name:'CONFIRM',exact:true}).click();
  await page.getByText(/SERVER RECORDED · STRIKE RANK 1/).waitFor();
  assert.equal(await page.evaluate(()=>fixture.state().playerGrowth.spentPoints),1);
  await page.getByRole('button',{name:'RESET THIS HERO · ONCE FREE',exact:true}).click();await page.getByRole('button',{name:'CONFIRM',exact:true}).click();
  await page.getByText(/This hero's one-time reset was used/).waitFor();
  assert(await page.getByRole('button',{name:'ONE-TIME RESET USED',exact:true}).isDisabled());
  assert.equal(await page.evaluate(()=>fixture.state().playerGrowth.spentPoints),0);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.tsa-root').count(),0,'Escape outside confirmation retains the host close behavior');
  assert.equal(await page.evaluate(()=>window.TacticalOps.getState().open),false);
  results.push({runtime,dialogEscape:true,hostEscape:true,canonicalFailureCodes:true,noRetry:true,canonicalPurchase:true,oneTimeRespec:true});
 }
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
