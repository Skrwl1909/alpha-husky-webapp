import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdirSync,readFileSync} from 'node:fs';
import {createServer} from 'vite';

const cap={bones:96,scrap:25,rune_dust:2},zero={bones:0,scrap:0,rune_dust:0};
const receipt={version:1,runId:'last_howl_v1_fixture',week:'2026-W47',status:'CLAIMED',
  amounts:{bones:34,scrap:9,rune_dust:0},weeklyEarned:{bones:34,scrap:9,rune_dust:0},weeklyLimit:cap,
  milestones:[3,5,7],claimedMilestones:[3,5,7],nextMilestone:10,nextBestWave:3};
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-last-howl-rewards',
  resolve:{preserveSymlinks:true,dedupe:['react','react-dom','zustand']},
  server:{host:'127.0.0.1',port:0,hmr:false},appType:'custom'});
let browser;
try{
  const {parseLastHowlRewards,LastHowlRewards}=await server.ssrLoadModule('/tactical-ops-src/ui/lastHowlRewards.tsx');
  assert(parseLastHowlRewards(receipt,receipt.runId,7));
  const invalid=[undefined,null,{}, {...receipt,version:2},{...receipt,runId:'foreign'},
    {...receipt,amounts:{...receipt.amounts,bones:-1}}, {...receipt,amounts:{...receipt.amounts,bones:97}},
    {...receipt,amounts:{...receipt.amounts,bones:NaN}}, {...receipt,amounts:{...receipt.amounts,bones:'34'}},
    {...receipt,milestones:[3,3]}, {...receipt,milestones:[3,5,7,10]}, {...receipt,nextMilestone:5},
    {...receipt,status:'PENDING'}, {...receipt,status:'WEEKLY_LIMIT',amounts:zero},
    {...receipt,amounts:{bones:0,scrap:0,rune_dust:2}}];
  for(const value of invalid){
    assert.equal(parseLastHowlRewards(value,receipt.runId,7),null);
    const html=renderToStaticMarkup(React.createElement(LastHowlRewards,{value,runId:receipt.runId,waves:7}));
    assert(!html.includes('+34 Bones')&&!html.includes('+2 Rune Dust'));
  }
  const abandoned=renderToStaticMarkup(React.createElement(LastHowlRewards,{value:receipt,runId:receipt.runId,waves:7,abandoned:true}));
  assert(abandoned.includes('ABANDONED')&&!abandoned.includes('+34'));
  assert(readFileSync('js/tactical_ops.js','utf8').includes('SUPPLY CLAIMED'),'Production bundle must include rewards');
  console.log(`PASS: valid receipt, ${invalid.length} malformed/foreign receipts, abandon and production bundle`);
  const fixtures={claimed:receipt,
    advanced:{...receipt,amounts:{bones:56,scrap:15,rune_dust:2},weeklyEarned:{bones:56,scrap:15,rune_dust:2},
              milestones:[3,5,7,10],claimedMilestones:[3,5,7,10],nextMilestone:null},
    cap:{...receipt,status:'WEEKLY_LIMIT',amounts:zero,weeklyEarned:cap,milestones:[],claimedMilestones:[3,5,7,10],nextMilestone:null,nextBestWave:null},
    unchanged:{...receipt,status:'NO_IMPROVEMENT',amounts:zero,weeklyEarned:{bones:22,scrap:4,rune_dust:0},
               milestones:[],claimedMilestones:[3],nextMilestone:5,nextBestWave:4},
    pending:{...receipt,status:'PENDING',amounts:zero,weeklyEarned:zero,milestones:[],claimedMilestones:[],nextMilestone:3},
    legacy:null};
  const entry=`import React from 'react'; import {createRoot} from 'react-dom/client';
    import {LastHowlResults} from '/tactical-ops-src/ui/LastHowl.tsx';
    import {TACTICAL_CSS} from '/tactical-ops-src/styles.ts';
    import {useBattleStore as store} from '/tactical-ops-src/store/battleStore.ts';
    import {setHost} from '/tactical-ops-src/host/bridge.ts';
    const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
    setHost({openForge:()=>window.__forge=true});
    store.setState({busy:false,progressionError:null,openLastHowl:async()=>{window.__retry=true;},backToHub:()=>{window.__left=true;}});
    const root=createRoot(document.getElementById('root'));
    window.show=(rewards)=>root.render(React.createElement('div',{id:'tacticalOpsRoot',className:'t-shell','data-screen':'results'},
      React.createElement(LastHowlResults,{view:{runId:'last_howl_v1_fixture',status:'DEFEATED',completedWaves:10,kills:65,eliteKills:2,newRecord:true,
         best:{completedWaves:10,kills:65},rewards}})));
    window.show(${JSON.stringify(receipt)});`;
  server.middlewares.use('/reward-fixture',async(_request,response)=>{
    response.setHeader('Content-Type','text/html');
    response.end(await server.transformIndexHtml('/reward-fixture','<html><body style="margin:0"><div id="root"></div><script type="module">'+entry+'</script></body></html>'));
  });
  await server.listen();
  const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
  browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||undefined});
  const port=server.httpServer.address().port;
  mkdirSync('artifacts/last-howl-rewards',{recursive:true});
  for(const width of [320,390,430]){
    const page=await browser.newPage({viewport:{width,height:820}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${port}/reward-fixture`);
    for(const [name,value] of Object.entries(fixtures)){
      await page.evaluate(value=>window.show(value),value);
      const result=page.locator('.t-last-howl-results');
      await result.waitFor();
      const status=name==='claimed'||name==='advanced'?'SUPPLY CLAIMED':name==='cap'?'WEEKLY LIMIT':
                   name==='unchanged'?'TOP 3 UNCHANGED':name==='pending'?'REWARD PENDING':'NO REWARDS RECORDED';
      await result.getByText(status,{exact:false}).first().waitFor();
      const text=await result.innerText();
      if(name==='claimed')assert(text.includes('+34 Bones')&&text.includes('+9 Scrap')&&text.includes('WAVE 10'));
      if(name==='advanced')assert(text.includes('+2 Rune Dust'));
      if(['cap','unchanged','pending','legacy'].includes(name))assert(!/\+\d+ (Bones|Scrap|Rune Dust)/.test(text));
      assert(await result.evaluate(node=>node.scrollWidth<=node.clientWidth+1),'Result overflow at '+width);
      if(['claimed','advanced','cap'].includes(name))await page.screenshot({path:`artifacts/last-howl-rewards/${width}-${name}.png`});
    }
    await page.getByRole('button',{name:'UPGRADE IN FORGE'}).click();
    assert(await page.evaluate(()=>window.__forge));
    await page.getByRole('button',{name:'TRY AGAIN'}).click();
    assert(await page.evaluate(()=>window.__retry));
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`PASS ${width}px: six reward states, no overflow, existing Forge and retry actions`);
  }
}finally{if(browser)await browser.close();await server.close();}
