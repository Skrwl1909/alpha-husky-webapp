import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-direction-check',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},server:{host:'127.0.0.1',port:0},plugins:[{name:'fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(req.url.startsWith('/fixture')){res.setHeader('Content-Type','text/html');res.end('<meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}#mount{height:100%}</style><div id="tacticalOpsRoot" data-open="1" data-layout="compact"><div class="t-shell" data-screen="battle"><div id="mount"></div></div></div><script type="module" src="/tools/fixtures/battlefield-p5.tsx"></script>');return}next()})}}]});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/fixture?v1=1`);await page.locator('.t-field').waitFor({state:'attached'});await page.evaluate(()=>fixture.geometry());await page.waitForTimeout(300);
const body=page.locator('.t-token.alpha img.body');const direction=async expected=>{await page.waitForFunction(e=>document.querySelector('.t-token.alpha img.body').getAttribute('src').endsWith('/'+e+'.png'),expected);assert(await body.evaluate(e=>e.complete&&e.naturalWidth>0));console.log('view',expected)};
await direction('front');
for(const [c,r,name] of [[3,3,'right'],[2,3,'left'],[2,2,'back'],[2,3,'front']]){await page.evaluate(([c,r])=>{const s=fixture.store,b=s.getState().battle;s.setState({battle:{...b,units:b.units.map(u=>u.id==='alpha'?{...u,c,r}:u)}})},[c,r]);await direction(name)}
await page.evaluate(()=>fixture.confirmedCast('alpha','alpha-strike','enemy'));await direction('right');await page.waitForTimeout(50);assert(await page.locator('.t-choreo-actor').getAttribute('src').then(x=>x.endsWith('/right.png')));await page.evaluate(()=>{const s=fixture.store;window.__alphaIdentity=s.getState().identity;s.setState({identity:{...s.getState().identity,skinKey:'custom-skin',skinUrl:'/assets/skins/custom.webp',source:'skin'}})});
await page.waitForFunction(()=>document.querySelector('.t-token.alpha img.body')?.getAttribute('src')?.endsWith('/alpha.png'));
assert.equal(await page.locator('.t-token.alpha.directional-alpha').count(),0,'Equipped skin disables base direction override');
assert.equal(await page.locator('.t-alpha-ground-shadow').count(),0,'No directional shadow for equipped skin');
await page.evaluate(()=>fixture.store.setState({identity:{...fixture.store.getState().identity,skinKey:'',skinUrl:'',source:'character-image'}}));
assert.equal(await page.locator('.t-token.alpha.directional-alpha').count(),0,'Live composite prevents override');
await page.evaluate(()=>fixture.store.setState({identity:window.__alphaIdentity}));
await direction('right');
assert.deepEqual(errors,[]);console.log('PASS four directions, attack, equipped skin & live-composite guards');
}finally{await browser.close();await server.close()}
