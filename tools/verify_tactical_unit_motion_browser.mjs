import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.MOTION_OUT||'artifacts/unit-motion-v1';mkdirSync(out,{recursive:true});
const server=await createServer({configFile:false,server:{host:'127.0.0.1',port:0},plugins:[{name:'motion-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(!req.url.startsWith('/motion-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}#mount{height:100%}</style><div id="tacticalOpsRoot" data-open="1" data-layout="compact"><div class="t-shell" data-screen="battle"><div id="mount"></div></div></div><script type="module" src="/tools/fixtures/battlefield-p5.tsx"></script>');});}}]});
await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const url=`http://127.0.0.1:${server.httpServer.address().port}/motion-fixture`;
const results=[];
async function open(vnext=true){await page.goto(url+(vnext?'':'?v1=1'));await page.locator('.t-field').waitFor({state:'attached'});await page.evaluate(()=>{fixture.geometry();const s=fixture.store,b=s.getState().battle;s.setState({battle:{...b,units:b.units.map(u=>u.id==='enemy'?{...u,archetype:'SKIRMISHER',name:'HOUND SKIRMISHER'}:u)}});});await page.waitForTimeout(350);}
async function snapshot(id){return page.evaluate(id=>{const hit=document.querySelector(`.t-unit-hit[data-unit-id="${id}"]`);const token=hit.previousElementSibling;const cs=getComputedStyle(token),b=hit.getBoundingClientRect();return {width:parseFloat(cs.width),transform:cs.transform,hit:{x:b.x,y:b.y,w:b.width,h:b.height},anchor:{x:token.offsetLeft,y:token.offsetTop}};},id);}
async function freeze(phase){return page.evaluate(phase=>{const actor=document.querySelector('.t-grounded-actor');const sheet=actor.querySelector('.t-attack-frames');for(const a of [actor,sheet].flatMap(e=>e.getAnimations())){a.pause();a.currentTime=Number(a.effect.getTiming().duration)*phase;}
 const cs=getComputedStyle(actor),field=document.querySelector('.t-field'),b=actor.getBoundingClientRect(),f=field.getBoundingClientRect();return {fieldWidth:f.width,width:parseFloat(cs.width),transform:cs.transform,background:getComputedStyle(sheet).backgroundPosition,foot:{x:(b.x+b.width/2-f.x)/f.width*100,y:(b.y+b.height-f.y)/f.height*100},pointerEvents:cs.pointerEvents};},phase);}
try{
for(const vnext of [false,true])for(const [w,h] of [[320,568],[390,844],[430,932],[844,390],[1280,800]]){
 await page.setViewportSize({width:w,height:h});await open(vnext);console.log('checking',vnext,w,h);
 const before=await snapshot('alpha');
 await page.evaluate(()=>fixture.confirmedCast('alpha','alpha-strike','enemy'));
 await page.locator('.t-grounded-actor[data-sheet="alpha"]').waitFor();
 const frame=await freeze(.37),after=await snapshot('alpha');
 assert(Math.abs(frame.width-before.width)<.02,'Standing and attacking width differ');
 assert.deepEqual(after.hit,before.hit,'Attack moved the touch target');
 assert.equal(frame.background,'100% 0%','STRIKE must show contact frame at 37%');
 assert.equal(frame.pointerEvents,'none');
 const target=await page.evaluate(()=>{const u=fixture.store.getState().battle.units.find(u=>u.id==='enemy');return import('/tactical-ops-src/combat/movement.ts').then(m=>m.fieldPercent(u.c,u.r));});
 assert(Math.abs(frame.foot.x-(target.x-before.width*.7/frame.fieldWidth*100))<.2&&Math.abs(frame.foot.y-target.y)<.2,'Contact foot drift');
 assert.equal(await page.locator('.t-token.alpha img.body').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 if(vnext&&w===390){await page.screenshot({path:`${out}/alpha-contact.png`});const frames=[];for(const phase of [.06,.18,.30,.43,.58,.76,.90,.98]){frames.push((await freeze(phase)).background);await page.screenshot({path:`${out}/alpha-${Math.round(phase*100)}.png`});}assert.equal(new Set(frames).size,8,'Expected eight distinct frames');}
 results.push({grid:vnext?'10x7':'8x5',viewport:[w,h],width:frame.width,contact:frame.background,hitboxUnchanged:true});
}
await page.setViewportSize({width:390,height:844});await open();
await page.evaluate(async()=>{const {store}=fixture;const b=store.getState().battle;store.setState({battle:{...b,units:b.units.map(u=>u.id==='enemy'?{...u,archetype:'SKIRMISHER'}:u)}});const actor=store.getState().battle.units.find(u=>u.id==='enemy');const r=fixture.confirmedCast('enemy','hostile-strike','alpha');const {enemyScene}=await import('/tactical-ops-src/ui/enemyAttackPresentation.ts');store.setState({enemyScene:enemyScene(actor,'hostile-strike',r.events,store.getState().battle.units,999)});});
await page.locator('.t-grounded-actor[data-sheet="skirmisher"]').waitFor();
const houndBefore=await snapshot('enemy'),houndFrame=await freeze(.42);
assert(Math.abs(houndBefore.width-houndFrame.width)<.02);assert.equal(houndFrame.background,'100% 0%');
assert.equal(await page.locator('.t-attack-frames').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a),-1,'Left attack sheet must mirror');
await page.screenshot({path:`${out}/skirmisher-contact.png`});
await page.evaluate(()=>fixture.store.setState({enemyScene:null,combatFx:[],combatMoment:null,busy:false}));
assert.equal(await page.locator('.t-grounded-actor').count(),0,'Temporary actors must unmount');
assert.deepEqual((await snapshot('enemy')).hit,houndBefore.hit);
await open();await page.evaluate(()=>{const s=fixture.store;s.setState({identity:{...s.getState().identity,skinKey:'custom',skinUrl:'/custom.webp',source:'skin'}});fixture.confirmedCast('alpha','alpha-strike','enemy');});
assert.equal(await page.locator('.t-attack-frames').count(),0,'Cosmetics must retain original fallback');
await open();await page.evaluate(()=>{const s=fixture.store,b=s.getState().battle;s.setState({battle:{...b,units:b.units.map(u=>u.id==='enemy'?{...u,c:2,r:2}:u)}});fixture.confirmedCast('alpha','alpha-strike','enemy');});
assert.equal(await page.locator('.t-attack-frames').count(),0,'Vertical attacks must retain directional art');
await page.emulateMedia({reducedMotion:'reduce'});await open();await page.evaluate(()=>fixture.confirmedCast('alpha','alpha-strike','enemy'));
assert.equal(await page.locator('.t-grounded-actor').evaluate(e=>getComputedStyle(e).display),'none');
assert.equal(await page.locator('.t-token.alpha img.body').evaluate(e=>getComputedStyle(e).visibility),'visible');
await page.emulateMedia({reducedMotion:'no-preference'});
await page.route('**/unit_motion/v1/*.webp',route=>route.abort());await open();await page.evaluate(()=>fixture.confirmedCast('alpha','alpha-strike','enemy'));await page.waitForTimeout(100);
assert.equal(await page.locator('.t-grounded-actor.has-frames').count(),0,'Failed sheet must keep fallback');
assert(await page.locator('.t-motion-fallback').evaluate(e=>e.complete&&e.naturalWidth>0&&getComputedStyle(e).visibility==='visible'));
assert.deepEqual(errors,[]);
writeFileSync(`${out}/results.json`,JSON.stringify({results,checks:['8 distinct frames','Skirmisher mirrored contact','cleanup','cosmetic fallback','vertical fallback','reduced motion','missing atlas fallback'],errors},null,2));
console.log('PASS unit motion: both grids × 5 viewports; shared width, foot contact, stable hitboxes, 8 frames, mirroring, cleanup and fallbacks');
}catch(e){console.log(await page.evaluate(()=>({errors:document.body.innerText.slice(0,300),field:document.querySelector('.t-field').getBoundingClientRect().toJSON(),actor:document.querySelector('.t-grounded-actor')?.getBoundingClientRect().toJSON()})));await page.screenshot({path:`${out}/failure.png`});throw e;}finally{await browser.close();await server.close();}
