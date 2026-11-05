import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-direction-check',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},server:{host:'127.0.0.1',port:0},plugins:[{name:'fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(req.url.startsWith('/fixture')){res.setHeader('Content-Type','text/html');res.end('<meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}#mount{height:100%}</style><div id="tacticalOpsRoot" data-open="1" data-layout="compact"><div class="t-shell" data-screen="battle"><div id="mount"></div></div></div><script type="module" src="/tools/fixtures/battlefield-p5.tsx"></script>');return}next()})}}]});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/fixture?v1=1`);await page.locator('.t-field').waitFor({state:'attached'});await page.evaluate(()=>fixture.geometry());await page.waitForTimeout(300);
const body=page.locator('.t-token.alpha img.body');const direction=async expected=>{await page.waitForFunction(e=>document.querySelector('.t-token.alpha img.body').getAttribute('src').endsWith('/'+e+'.png'),expected);assert(await body.evaluate(e=>e.complete&&e.naturalWidth>0));console.log('view',expected)};
await direction('right');
for(const [c,r,name] of [[3,3,'right'],[2,3,'left'],[2,2,'back'],[2,3,'front']]){await page.evaluate(([c,r])=>{const s=fixture.store,b=s.getState().battle;s.setState({battle:{...b,units:b.units.map(u=>u.id==='alpha'?{...u,c,r}:u)}})},[c,r]);await direction(name)}
await page.waitForTimeout(300);
await page.evaluate(()=>fixture.confirmedCast('alpha','alpha-strike','enemy'));await direction('right');await page.waitForTimeout(50);assert(await page.locator('.t-choreo-actor').getAttribute('src').then(x=>x.endsWith('/right.png')));await page.evaluate(()=>{const s=fixture.store;window.__alphaIdentity=s.getState().identity;s.setState({identity:{...s.getState().identity,skinKey:'custom-skin',skinUrl:'/assets/skins/custom.webp',source:'skin'}})});
await page.waitForFunction(()=>document.querySelector('.t-token.alpha img.body')?.getAttribute('src')?.endsWith('/alpha.png'));
assert.equal(await page.locator('.t-token.alpha.directional-alpha').count(),0,'Equipped skin disables base direction override');
assert.equal(await page.locator('.t-alpha-ground-shadow').count(),0,'No directional shadow for equipped skin');
await page.evaluate(()=>fixture.store.setState({identity:{...fixture.store.getState().identity,skinKey:'',skinUrl:'',source:'character-image'}}));
assert.equal(await page.locator('.t-token.alpha.directional-alpha').count(),0,'Live composite prevents override');
await page.evaluate(()=>fixture.store.setState({identity:window.__alphaIdentity}));
await direction('right');
assert.deepEqual(errors,[]);console.log('PASS Alpha initial orientation, four movement directions, attack and skin guards');

await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/fixture`);
const hound = page.locator('.t-token:has(+ .t-unit-hit[data-unit-id="enemy"]) img.body');
const houndDirection = async name => {
  await hound.evaluate((img, name) => {
    if (!img.getAttribute('src').endsWith(`hound_bulwark_${name}.webp`)) throw Error(`Expected ${name}, got ${img.src}`);
  }, name);
  await hound.evaluate(img => img.decode());
};
const hit = page.locator('.t-unit-hit[data-unit-id="enemy"]');
await houndDirection('left');
await page.evaluate(() => {
  const {store} = fixture;
  const {battle} = store.getState();
  const units = battle.units.map(u => u.id === 'ally-02' ? {...u,c:3,r:4} : u);
  store.setState({battle:{...battle,units}});
});
await houndDirection('front'); // CNC wins the tie over Alpha.
const hitBefore = await hit.boundingBox();
await page.evaluate(() => {
  const {store} = fixture;
  const {battle} = store.getState();
  store.setState({battle:{...battle,units:[...battle.units].reverse()}});
});
await houndDirection('front');
await page.evaluate(async () => {
  const {enemyScene} = await import('/tactical-ops-src/ui/enemyAttackPresentation.ts');
  const {store} = fixture;
  const {units} = store.getState().battle;
  const attacker = units.find(u => u.id === 'enemy');
  const {events} = fixture.confirmedCast('enemy','hostile-strike','alpha');
  const scene = enemyScene(attacker,'hostile-strike',events,units,1);
  if (!scene) throw Error('Expected confirmed enemy attack scene');
  store.setState({enemyScene:scene});
});
await houndDirection('left'); // The confirmed target takes precedence over CNC.
assert.deepEqual(await hit.boundingBox(),hitBefore,'Attack must not move the hitbox');
await page.evaluate(() => {
  const {store} = fixture;
  store.setState({enemyScene:null,combatFx:[],combatMoment:null,busy:false});
});
await houndDirection('front');
assert.deepEqual(await hit.boundingBox(),hitBefore,'Idle must not move the hitbox');
await page.evaluate(() => {
  const {store} = fixture;
  const {battle} = store.getState();
  store.setState({battle:{...battle,units:battle.units.map(u =>
    u.id === 'enemy' ? {...u,c:4} : u.team === 'ally' ? {...u,hp:0,defeated:true} : u)}});
});
await houndDirection('right');
await page.waitForTimeout(320);
await houndDirection('right'); // No living opponents: keep the last valid heading.
assert.deepEqual(await page.evaluate(() => {
  const {c,r} = fixture.store.getState().battle.units.find(u => u.id === 'enemy');
  return {c,r};
}),{c:4,r:3});
assert.deepEqual(errors,[]);
console.log('PASS HOUND initial facing, ties independent of order, confirmed attack and recovery, no-target heading and hitbox ownership');
}finally{await browser.close();await server.close()}
