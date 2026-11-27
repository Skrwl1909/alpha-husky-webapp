/** Focused local preview gate. Does not certify Authority or release provenance. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const root = 'images/tactical_ops/presentation/war_table_v2/';
const manifest = JSON.parse(readFileSync(root+'manifest.json','utf8'));
const expected = ['WT-A01','WT-B01','WT-B02','WT-B03','WT-B04','WT-C01','WT-C02','WT-C03','WT-D01'];
assert.deepEqual(manifest.assets.map(a=>a.id), expected);
for(const a of manifest.assets) {
  const bytes = readFileSync(a.src.slice(1));
  assert.equal(bytes.length,a.bytes,a.id+' bytes');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256,a.id+' digest');
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');
  assert.equal(bytes.subarray(8,12).toString(),'WEBP');
}
const versionFile = readFileSync('tactical-ops-src/version.ts','utf8');
const version = versionFile.match(/VERSION\s*=\s*"([^"]+)"/)?.[1];
const cacheKey = versionFile.match(/CACHE_KEY\s*=\s*"([^"]+)"/)?.[1];
assert(version && cacheKey);
assert(readFileSync('js/tactical_ops.js','utf8').includes(version));
assert(readFileSync('js/boot_loaders.js','utf8').includes(cacheKey));
const visual = readFileSync('tactical-ops-src/ui/WarTableVisual.tsx','utf8');
const app = readFileSync('tactical-ops-src/ui/App.tsx','utf8');
for (const id of expected) assert(visual.includes(id), id);
assert(app.includes('"OPERATIONS"') && app.includes('"LEGACY"') && app.includes('SIGNAL ATLAS') && app.includes('PACK MASTERY'));
assert(app.includes('plate="squad"') && app.includes('plate="signal-atlas"') && app.includes('plate="pack-mastery"') && app.includes('plate="legacy"'));
console.log('PASS 9 approved assets and '+cacheKey);
if(process.argv.includes('--assets-only')) process.exit(0);
let chromium;
try { ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')); }
catch(error) { if(error.code === 'ERR_MODULE_NOT_FOUND') { console.log('BROWSER: NOT RUN (Playwright module unavailable)'); process.exit(0); } throw error; }
const fixtureSource = readFileSync('tools/verify_tactical_purpose_return_browser.mjs','utf8');
const match=fixtureSource.match(/const entry=`([\s\S]*?)`;\r?\nconst server/);
assert(match,'Canonical synthetic fixture not found');
const anchor='window.fixture={store};createRoot';
assert(match[1].includes(anchor));
// The original fixture uses synthetic local state. No live API or acceptance.
const entry=match[1].replace(anchor,`if(params.get('profile')!=='unavailable') {const p=store.getState().progression; store.setState({progression:{...p,lastHowl:{status:null,runId:null,best:null}}});} window.fixture={store};createRoot`);
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-wtv2-preview',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},server:{host:'127.0.0.1',port:0},plugins:[{name:'wtv2-preview-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(!req.url?.startsWith('/wtv2-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#080f16;font-family:Arial}#mount{height:100%}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount"></div></div><script type="module" src="/@wtv2-fixture"></script>');});},resolveId(id){if(id==='/@wtv2-fixture')return '\0wtv2-fixture';},load(id){if(id==='\0wtv2-fixture')return entry;}}]});
await server.listen();
let browser;
const out='artifacts/war-table-v2-preview'; mkdirSync(out,{recursive:true});
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const checks=[];
 for(const [width,height] of [[320,700],[390,844],[1280,900]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<500,reducedMotion:'reduce'});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  // Prevent any fixture request from leaving the local preview server.
  await page.route('**/*',route=>{const url=route.request().url();return url.startsWith(origin+'/')?route.continue():route.abort();});
  await page.goto(origin+'/wtv2-fixture?mode=command&profile=veteran');
  const cards=page.locator('.t-wtv2-category'); await cards.first().waitFor(); assert.equal(await cards.count(),4);
  for(const id of expected) {const img=page.locator(`img[data-wtv2-asset="${id}"]`).first(); await img.scrollIntoViewIfNeeded(); await img.evaluate(e=>e.decode());assert(await img.evaluate(e=>e.naturalWidth>0));}
  await page.locator('.t-wtv2-hero').scrollIntoViewIfNeeded(); await page.screenshot({path:`${out}/${width}-command.png`});
  await page.locator('.t-wtv2-directory').scrollIntoViewIfNeeded(); await page.screenshot({path:`${out}/${width}-directory.png`});
  assert(await cards.evaluateAll(es=>es.every(e=>e.clientWidth>=44&&e.clientHeight>=44&&e.scrollWidth<=e.clientWidth+1)),'touch targets / card overflow');
  for(const [key,label,section] of [['campaign','Campaign','Broken Signal story campaign'],['field-ops','Field Ops','Current Field Ops'],['challenges','Challenges','Field challenges'],['last-howl','Last Howl','Last Howl']]) {
   await page.getByRole('button',{name:`Browse ${label}`,exact:true}).click();
   const destination=page.locator(`.t-wtv2-destination[data-wtv2-category="${key}"]`);await destination.waitFor();
   await destination.locator('img').evaluate(e=>e.decode());
   assert(await page.getByLabel(section,{exact:true}).isVisible(),`${key} route missing`);
   assert.equal(await page.evaluate(()=>window.fixture.store.getState().screen),'war-table');
   assert.equal(await page.evaluate(()=>window.fixture.store.getState().progression.fieldOps.activeMissionRun),null,'category navigation started a run');
   assert(await page.locator('.t-war-table-visual-v2').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'horizontal overflow '+key);
   await page.screenshot({path:`${out}/${width}-${key}.png`});
   await page.getByRole('button',{name:/ALL OPERATIONS/}).click();await page.locator('.t-wtv2-directory').waitFor();
  }
  await page.getByRole('button',{name:'Browse Field Ops',exact:true}).click();
  await page.locator('.t-cd-selected-operation .t-wt-mission-cta button').click();
  await page.locator('.t-deploy-hero').waitFor();assert.equal(await page.getByRole('button',{name:/DEPLOY SQUAD/}).count(),1);
  assert.deepEqual(errors,[]); checks.push({width,categories:4,brief:true}); await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const origin='http://127.0.0.1:'+server.httpServer.address().port;
 await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
 await page.goto(origin+'/wtv2-fixture?mode=command&profile=resume');
 await page.getByRole('button',{name:'Browse Campaign',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.fixture.store.getState().progression.fieldOps.activeMissionRun.runId),'saved-run');
 await page.getByRole('button',{name:'01 COMMAND',exact:true}).click();assert(await page.getByRole('button',{name:'RESUME OP',exact:true}).isVisible());
 await page.close();
 writeFileSync(out+'/results.json',JSON.stringify({checks,resume:true,scope:'synthetic browser fixture only'},null,2));
 console.log('PASS browser category navigation, 3 widths, mission brief, resume retained; screenshots in '+out);
} finally {if(browser)await browser.close(); await server.close();}
