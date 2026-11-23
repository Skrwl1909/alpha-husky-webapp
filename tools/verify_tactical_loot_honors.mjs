/** Synthetic receipts and Chromium validation. NEVER ship these fixtures as gameplay data. */
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const runId='field_fixture_a1',missionId='field-relay-recovery';
const base={version:1,status:'CONFIRMED',receiptId:'receipt_fixture_a1',runId,missionId,victory:true,
  currencies:[{kind:'exp',amount:8},{kind:'bones',amount:16},{kind:'scrap',amount:4},{kind:'rune_dust',amount:0}],
  equipment:[],unlocks:[]};
const item=rarity=>({grantId:'item_grant_a1',itemId:'rustfang_fangs',name:'Rustfang Fangs',slot:'fangs',
  rarity,quantity:1,imageUrl:'assets/equip/rustfang_fangs.png',stats:{STR:3,DEF:2},
  equipped:{itemId:'old_fangs',name:'Starter Fangs',stats:{STR:2,DEF:3}}});
const prestige=(type,id,name,rarity='rare')=>({grantId:'prestige_grant_a1',type,id,name,rarity});
const fixtures={
  currency:base,uncommon:{...base,equipment:[item('uncommon')]},rare:{...base,equipment:[item('rare')]},
  legendary:{...base,equipment:[item('legendary')]},comparison:{...base,equipment:[item('uncommon')]},
  noart:{...base,equipment:[{...item('uncommon'),imageUrl:'assets/equip/does_not_exist.png'}]},
  badge:{...base,unlocks:[prestige('badge','tops_first_contact','First Contact','common')]},
  legendaryBadge:{...base,receiptId:'receipt_legendary_badge',unlocks:[prestige('badge','tops_no_one_left_behind','No One Left Behind','legendary')]},
  frame:{...base,unlocks:[prestige('frame','tops_broken_signal_frame','Broken Signal Frame')]},
  aura:{...base,unlocks:[prestige('aura','signalborn_aura','Signalborn Aura')]},
  title:{...base,unlocks:[prestige('title','relay_hunter','Relay Hunter')]},
  skin:{...base,unlocks:[prestige('skin','warborn_alpha_skin','Warborn Alpha Skin','legendary')]},
  empty:{...base,currencies:[],equipment:[],unlocks:[]},duplicate:{...base,status:'REPLAYED'},pending:null,defeat:null,
};
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-tactical-loot-honors',
  resolve:{preserveSymlinks:true,dedupe:['react','react-dom','zustand']},appType:'custom',
  server:{host:'127.0.0.1',port:0,hmr:false}});
let browser;
try {
  const {parseLootHonors,legacyCurrencyRewards}=await server.ssrLoadModule('/tactical-ops-src/data/lootHonors.ts');
  const {TacticalLootReveal,TacticalHonorsCollection}=await server.ssrLoadModule('/tactical-ops-src/ui/TacticalLootHonors.tsx');
  const {StoryResultView}=await server.ssrLoadModule('/tactical-ops-src/ui/StoryResultView.tsx');
  assert.equal(parseLootHonors(base,runId,missionId,true).state,'confirmed');
  assert.equal(parseLootHonors({...base,status:'REPLAYED'},runId,missionId,true).state,'replayed');
  assert.equal(parseLootHonors(null,runId,missionId,true).state,'absent');
  const invalid=[{...base,runId:'foreign'}, {...base,missionId:'foreign'}, {...base,status:'PENDING'},
    {...base,victory:false}, {...base,receiptId:''}, {...base,equipment:[{...item('rare'),quantity:-1}]},
    {...base,equipment:[{...item('rare'),slot:'pet'}]}, {...base,equipment:[{...item('rare'),rarity:'mythic'}]},
    {...base,equipment:[item('rare'),item('rare')]}, {...base,equipment:[{...item('rare'),stats:{STR:NaN}}]},
    {...base,equipment:[{...item('rare'),equipped:{itemId:'a',name:'a',stats:{STR:'3'}}}]},
    {...base,unlocks:[prestige('bad','test','test')]},
    {...base,currencies:[{kind:'bones',amount:-1}]},
    {...base,currencies:[{kind:'bones',amount:2},{kind:'bones',amount:2}]},
    {...base,currencies:[{kind:'cryptic',amount:2}]}, {...base,equipment:'wrong'}, undefined];
  for(const raw of invalid){
    const parsed=parseLootHonors(raw,runId,missionId,true);
    assert(!['confirmed','replayed'].includes(parsed.state),'untrusted payload accepted');
    assert(!renderToStaticMarkup(React.createElement(TacticalLootReveal,{result:parsed})).includes('LOOT &amp; HONORS'));
  }
  const legacy={victory:true,rewardAmountsAvailable:true,xpGranted:8,bonesGranted:16,firstUpgradeScrapGranted:8};
  assert.deepEqual(legacyCurrencyRewards(legacy).map(x=>x.amount),[8,16,8]);
  assert.deepEqual(legacyCurrencyRewards({...legacy,rewardAmountsAvailable:false}),[]);
  const props={title:'COMMANDER DOWN',mission:'Signal Commander',art:'assets/equip/rustfang_fangs.png',
    op02Ready:false,op02Cleared:false,nextMission:null,turns:9,squadStanding:3,squadDeployed:3,
    onAction:()=>{},lootAndHonors:base,runId,missionId};
  assert(!renderToStaticMarkup(React.createElement(StoryResultView,{...props,phase:'saving'})).includes('LOOT &amp; HONORS'));
  assert(renderToStaticMarkup(React.createElement(StoryResultView,{...props,phase:'saved'})).includes('LOOT &amp; HONORS'));
  assert(renderToStaticMarkup(React.createElement(TacticalHonorsCollection)).includes('TACTICAL HONORS'));
  const resultsSource=readFileSync('tactical-ops-src/ui/FieldOpResults.tsx','utf8');
  const ordinaryResults=resultsSource.split('export function SpecialFieldOpResults')[0];
  assert.equal((ordinaryResults.match(/<TacticalHonorsCollection\s*\/>/g)||[]).length,1,'only one ordinary Results honors panel');
  assert(readFileSync('js/tactical_ops.js','utf8').includes('LOOT & HONORS'),'canonical bundle lacks Loot & Honors');
  console.log('PASS 17 malformed or foreign payloads, legacy compatibility, no pending rewards, saved story results');

  const entry=[
    "import React from 'react';",
    "import {createRoot} from 'react-dom/client';",
    "import {TACTICAL_CSS} from '/tactical-ops-src/styles.ts';",
    "import {TacticalLootReveal,TacticalHonorsCollection} from '/tactical-ops-src/ui/TacticalLootHonors.tsx';",
    "import {parseLootHonors} from '/tactical-ops-src/data/lootHonors.ts';",
    "import {setHost} from '/tactical-ops-src/host/bridge.ts';",
    'const fixtures=__FIXTURES__;',
    "const css=document.createElement('style');css.textContent=TACTICAL_CSS;document.head.append(css);",
    'window.__actions={inventory:0,badges:0,profile:0};',
    'setHost({openInventory:()=>window.__actions.inventory++,openBadges:()=>window.__actions.badges++,openProfile:()=>window.__actions.profile++,readHonorBadges:async()=>({badges:[]})});',
    "const root=createRoot(document.getElementById('mount'));",
    'window.show=name=>{const raw=fixtures[name],parsed=parseLootHonors(raw,"field_fixture_a1","field-relay-recovery",name!=="pending"&&name!=="defeat");root.render(React.createElement("div",{className:"t-modal t-panel t-results t-field-results",id:"test-results"},React.createElement("h1",{},name==="defeat"?"DEFEAT":"VICTORY"),React.createElement(TacticalLootReveal,{result:parsed}),React.createElement(TacticalHonorsCollection)));};',
    "window.show(new URLSearchParams(location.search).get('scenario')||'currency');"
  ].join('\n').replace('__FIXTURES__',JSON.stringify(fixtures));
  server.middlewares.use('/loot-fixture',async (_req,res)=>{
    res.setHeader('Content-Type','text/html;charset=utf-8');
    const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;color:#e7f4f5}#qa-label{position:fixed;top:0;left:0;padding:4px;background:#081019;color:white;font:10px monospace;z-index:10000;pointer-events:none}#tacticalOpsRoot{position:relative;display:block;width:100%;min-height:100vh;padding:22px 5px;box-sizing:border-box}#test-results{margin:0 auto;max-width:880px;max-height:calc(100vh - 40px);overflow-y:auto}</style></head><body><div id="qa-label">SYNTHETIC QA · NO LIVE PLAYER</div><div id="tacticalOpsRoot"><div id="mount"></div></div><script type="module">'+entry+'</script></body></html>';
    res.end(await server.transformIndexHtml('/loot-fixture',html));
  });
  await server.listen();
  const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,
    args:['--no-sandbox','--disable-dev-shm-usage']});
  mkdirSync('artifacts/tactical-loot-honors',{recursive:true});
  const port=server.httpServer.address().port,snapshots=[];
  for(const width of [320,390,430,1280]){
    const page=await browser.newPage({viewport:{width,height:width===320?740:width===1280?900:844}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
    for(const motion of ['no-preference','reduce']){
      await page.emulateMedia({reducedMotion:motion});
      for(const name of Object.keys(fixtures)){
        await page.goto('http://127.0.0.1:'+port+'/loot-fixture?scenario='+name);
        const panel=page.locator('#test-results');await panel.waitFor();
        await panel.locator('.t-honors-collection').waitFor();
        const reveal=panel.locator('.t-loot-reveal');
        const present=!['empty','duplicate','pending','defeat'].includes(name);
        assert.equal(await reveal.count(),present?1:0,'reveal state '+width+'/'+name);
        if(name==='duplicate')assert(await panel.getByText('RECEIPT PREVIOUSLY RECORDED').count()>0);
        if(name==='empty')assert(await panel.getByText('NO NEW REWARDS RECORDED').count()>0);
        if(name==='comparison'){
          assert(await panel.locator('.t-loot-stats').getByText('+1').count()>0);
          assert(await panel.locator('.t-loot-stats').getByText('-1').count()>0);
        }
        if(['legendary','legendaryBadge'].includes(name))assert.equal(await reveal.getAttribute('data-reveal'),'legendary');
        if(name==='legendaryBadge'){
          assert.equal(await panel.locator('.t-loot-prestige[data-rarity="legendary"]').count(),1);
          if(width===390&&motion==='no-preference'){
            const skip=panel.getByRole('button',{name:'Skip reward animation'});
            await skip.waitFor({state:'visible'});
            assert((await skip.boundingBox()).height>=44,'skip action must be touch-sized');
            await skip.click();
            assert.equal(await reveal.getAttribute('data-celebrating'),null,'skip stops presentation immediately');
            await page.reload();
            await panel.locator('.t-loot-reveal').waitFor();
            assert.equal(await panel.getByRole('button',{name:'Skip reward animation'}).count(),0,'same confirmed receipt cannot replay celebration in session');
          }
        }
        if(present){
          const details=panel.locator('.t-loot-receipt');
          assert.equal(await details.count(),1);
          assert.equal(await details.getAttribute('open'),null,'receipt ID starts collapsed');
          await details.locator('summary').click();
          assert.match(await details.innerText(),/SAVED RECEIPT/);
          await details.locator('summary').click();
        }
        if(name==='rare')assert.equal(await reveal.getAttribute('data-reveal'),'rare');
        for(const kind of ['badge','frame','aura','title','skin']){
          if(name===kind)assert.equal(await panel.getByText(kind.toUpperCase()+' UNLOCKED').count(),1);
        }
        if(name==='noart')await panel.locator('.t-loot-equipment-art .t-loot-fallback').waitFor();
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'document overflow '+width+'/'+name);
        assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'panel overflow '+width+'/'+name);
        assert(await panel.locator('button').evaluateAll(nodes=>nodes.filter(el=>el.getClientRects().length>0).every(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44;})),'touch button too small '+width+'/'+name);
        if(motion==='reduce')assert.equal(await panel.evaluate(el=>el.getAnimations({subtree:true}).length),0,'reduced motion');
        if(name==='uncommon'){
          await panel.getByRole('button',{name:'VIEW / COMPARE IN INVENTORY'}).click();
          assert.equal(await page.evaluate(()=>window.__actions.inventory),1);
        }
        if(motion==='no-preference'&&name==='legendary')await panel.locator('.t-loot-equipment').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
        if(motion==='no-preference'&&['currency','uncommon','rare','legendary','badge','frame','aura','title','skin','empty'].includes(name))
          await page.screenshot({path:'artifacts/tactical-loot-honors/'+width+'-'+name+'.png'});
        if(motion==='no-preference'&&name==='currency'){
          const collection=panel.locator('.t-honors-collection');
          await collection.locator('summary').click();
          assert.equal(await panel.locator('.t-honors-tile').count(),10);
          assert.equal(await panel.locator('.t-honors-tile[data-owned=yes]').count(),0);
          await panel.getByRole('button',{name:'OPEN BADGE WALL'}).click();
          assert.equal(await page.evaluate(()=>window.__actions.badges),1);
          await page.screenshot({path:'artifacts/tactical-loot-honors/'+width+'-collection.png'});
        }
        snapshots.push({width,motion,name});
      }
    }
    assert.deepEqual(errors,[],'page errors');
    await page.close();
    console.log('PASS '+width+'px, receipt-gated states, responsive controls and reduced-motion');
  }
  writeFileSync('artifacts/tactical-loot-honors/evidence.json',JSON.stringify({synthetic:true,browser:'Chromium',scenarios:snapshots},null,2));
}finally{if(browser)await browser.close();await server.close();}
