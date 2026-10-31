/** Focused Badge Wall proof using sanitized output from the private real-handler test. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const fixtures=JSON.parse(readFileSync('docs/evidence/prestige01/state-fixtures.json','utf8')).states;
const assets=JSON.parse(readFileSync('docs/evidence/prestige01/assets.json','utf8')).assets;
const urls=new Set(assets.map(a=>a.url));
const gridURL=fixtures.owned.badges[0].iconUrl,detailURL=fixtures.owned.badges[0].emblemUrl;
assert.equal(urls.size,2);assert(urls.has(gridURL)&&urls.has(detailURL));
assert.notEqual(gridURL,detailURL);
for(const a of assets){assert.equal(a.status,200);assert.equal(a.format,'WEBP');assert.deepEqual(a.alphaExtrema,[0,255]);}
const source=readFileSync('js/badges.js','utf8');
assert(!source.includes('relay_sentinel'),'generic renderer must not hard-code badge key or URL');
const index=readFileSync('index.html','utf8');
const openSource=index.match(/async function openBadges\(\) \{[\s\S]+?\n\}/)?.[0];assert(openSource);
const loadRequests=[];
const loaderScope={window:{Badges:{init(){},open(){}}},document:{getElementById(){return null}},loadScriptOnce:async src=>loadRequests.push(src),apiPost(){},_tg:null,_dbg:false,console};
vm.runInNewContext(openSource+';openBadges()',loaderScope);await new Promise(resolve=>setImmediate(resolve));
assert.deepEqual(loadRequests,['js/badges.js?prestige=relay-sentinel-v1'],'production entry uses reviewed Badge Wall cache key');
const out='artifacts/prestige01/browser';mkdirSync(out,{recursive:true});
const html=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}body{margin:0;background:#080d15;color:white;font-family:Arial}.sheet-back{position:fixed;inset:0;align-items:center;justify-content:center}.btn{background:#152333;color:#fff;border:1px solid #496078;padding:5px 9px;font:inherit;font-size:11px}.sheet-card{color:#fff}
</style><script src="/badges.js"></script>`;
const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/badges.js'?'application/javascript':'text/html');res.end(req.url==='/badges.js'?source:html)});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
const cases=[];
try{
 for(const [width,height] of [[390,844],[320,740]]) for(const state of ['locked','owned','featured','legacy']){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),errors=[],requests=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://res.cloudinary.com/**',route=>urls.has(route.request().url())?route.continue():route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.evaluate(async({fixtures,state})=>{
   const initial=structuredClone(fixtures[state==='legacy'?'owned':state]);
   if(state==='legacy'){
    initial.badges=[{...initial.badges[0],key:'LEGACY_CONTROL',name:'Legacy display control',emblemUrl:initial.badges[0].iconUrl,emblem_url:initial.badges[0].iconUrl}];
   }else{
    // A populated wall exercises available detail space, without fetching other media.
    initial.badges.push(...Array.from({length:35},(_,i)=>({...initial.badges[0],key:'FIXTURE_'+i,name:'Synthetic locked control '+i,owned:false})));
   }
   let current=initial;
   window.fixture={calls:[]};
   window.Badges.init({apiPost:async(path,body)=>{
    fixture.calls.push({path,body});
    if(path==='/webapp/player/title/state')return {ok:true,titles:[],activeTitle:''};
    if(path!=='/webapp/badges/state')throw Error('unexpected endpoint');
    if(body.featured_badges){
     const owned=current.badges.filter(b=>b.owned).map(b=>b.key.toLowerCase());
     current={...current,featured_badges:body.featured_badges.filter(k=>owned.includes(k.toLowerCase()))};
    }
    return structuredClone(current);
   }});
   await window.Badges.open();
  },{fixtures,state});
  const tile=page.locator(state==='legacy'?'[data-key="LEGACY_CONTROL"]':'[data-key="relay_sentinel"]');
  await tile.waitFor();await tile.click();
  await page.waitForFunction(()=>[...document.querySelectorAll('#badgeWallGrid img')].every(img=>img.complete&&img.naturalWidth===256));
  assert.equal(await tile.locator('img').getAttribute('src'),gridURL);
  if(state==='legacy'){
   assert.equal(await page.locator('.ah-bw-detail-art').count(),0,'same-image legacy detail layout preserved');
  }else{
   await page.waitForFunction(()=>{const img=document.querySelector('.ah-bw-detail-art img');return img?.complete&&img.naturalWidth===512});
   assert.equal(await page.locator('.ah-bw-detail-art img').getAttribute('src'),detailURL);
   assert.match(await page.locator('#badgeWallDetail').innerText(),/server-recorded Relay Lockdown clear/);
   assert.equal(await tile.evaluate(el=>el.classList.contains('is-owned')),state!=='locked');
   if(state==='locked')assert.equal(await page.getByRole('button',{name:'Add to Featured',exact:true}).count(),0);
   if(state==='owned'){
    await page.getByRole('button',{name:'Add to Featured',exact:true}).click();await page.locator('#badgeWallSaveFeatured').click();
    await page.waitForFunction(()=>document.querySelector('#badgeWallFeatured').textContent==='Featured 1/3');
    await page.locator('#badgeWallRefresh').click();
    await page.getByRole('button',{name:'Remove from Featured',exact:true}).waitFor();
    const saved=await page.evaluate(()=>fixture.calls.find(c=>Array.isArray(c.body.featured_badges)));
    assert.equal(saved.path,'/webapp/badges/state');assert.deepEqual(saved.body.featured_badges,['relay_sentinel']);
   }
   if(state==='featured')assert.match(await page.locator('#badgeWallDetail').innerText(),/Featured/);
  }
  assert.deepEqual(errors,[]);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
  const bounds=await page.locator('#badgeWallDetail').evaluate(el=>{const p=el.closest('.ah-bw-card').getBoundingClientRect(),r=el.getBoundingClientRect();return {bottom:r.bottom,limit:p.bottom,scroll:el.scrollHeight,client:el.clientHeight}});
  assert(bounds.bottom<=height&&bounds.bottom<=bounds.limit+1&&bounds.scroll<=bounds.client+2,'detail is clipped');
  await page.screenshot({path:out+'/'+width+'-'+state+'.png',fullPage:true});
  cases.push({width,height,state,gridPixels:256,detailPixels:state==='legacy'?null:512,errors});await page.close();
 }
 writeFileSync(out+'/results.json',JSON.stringify({cases,scope:'actual Badge Wall renderer; public synthetic route fixtures; only two owner-supplied CDN URLs allowed; live image decoding on dark UI'},null,2));
 console.log('PASS Relay Sentinel: production loader, catalog-driven 256/512 art, locked/owned/featured/refresh and legacy layout across '+cases.length+' mobile cases');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
