#!/usr/bin/env node
/** Isolated browser fixtures: real React UI/engine, mocked account; never live writes. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='artifacts/g1/browser';mkdirSync(out,{recursive:true});
const entry=`import React from 'react';import{createRoot}from'react-dom/client';
import{SignalAtlas}from'/tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx';
import{PackMasteryPanel}from'/tactical-ops-src/ui/PackMastery.tsx';
import{TacticalApp}from'/tactical-ops-src/ui/App.tsx';
import{useBattleStore as store}from'/tactical-ops-src/store/battleStore.ts';
import{TACTICAL_CSS}from'/tactical-ops-src/styles.ts';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
const mode=new URLSearchParams(location.search).get('mode')||'atlas';
const heroes=[{heroId:'alpha',discipline:'vanguard',ranks:{}},{heroId:'ally-02',discipline:'disruptor',ranks:{}},{heroId:'ally-03',discipline:'medic',ranks:{'u03-mend':mode==='rank2'?1:0},respecUsed:true}];
const packMastery=Object.fromEntries(['ally-02','ally-03'].map(id=>[id,{progress:8,stage:3,selected:'A',unlockedOptions:['A','B']}]));
const progression={version:1,revision:10,foundationStage:'completed',completed:true,activeRunId:null,operations:{},playerGrowth:{version:2,revision:10,earnedPoints:12,spentPoints:0,heroes},packMastery,shadowSidegrade:'A',kodaSidegrade:'B'};
store.setState({progression,screen:mode==='results'?'results':'brief',foundationCompleted:true,progressionStatus:'ready',progressionCommitPending:false,progressionError:null,selectedMissionId:'field-relay-hold',selectedSquadIds:['alpha','ally-02','ally-03'],currentRunKey:'fixture-run',s3CombatProof:{runId:'fixture-run',missionId:'field-relay-hold',moments:[],fieldcraft:['ALPHA HOWL: GUARD applied to SHADOW (1 personal turn).','SHADOW: GUARD prevented 8 damage.']},battle:{...store.getState().battle,results:{victory:true,turns:10,hostilesEliminated:3,squadStanding:3,squadDeployed:3,damageTaken:20,bonesRecovered:0}}});
window.fixture={store};
const component=React.createElement(mode==='mastery'?PackMasteryPanel:mode==='brief'||mode==='results'?TacticalApp:SignalAtlas,{onClose:()=>{}});
createRoot(document.getElementById('mount')).render(mode==='brief'||mode==='results'?component:React.createElement('div',{className:'t-shell'},React.createElement('div',{className:'t-fill'},React.createElement('div',{className:'t-brief'},component))));`;
const server=await createServer({configFile:false,plugins:[{name:'g1-browser',configureServer(s){s.middlewares.use((req,res,next)=>{if(req.url?.startsWith('/g1-fixture')){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}#tacticalOpsRoot{width:100%;box-sizing:border-box}</style><div id="tacticalOpsRoot"><div id="mount" style="height:100%"></div></div><script type="module" src="/@g1"></script>');return}next()})},resolveId(id){if(id==='/@g1')return '\0g1'},load(id){if(id==='\0g1')return entry}}],server:{host:'127.0.0.1',port:0}});
await server.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
const results=[];
try{
 for(const width of [320,360,390,430]) for(const mode of ['atlas','rank2','mastery','brief','results']){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/g1-fixture?mode='+mode);
  if(mode==='atlas'||mode==='rank2'){
   await page.getByRole('button',{name:/^SHADOW/}).first().click();await page.getByRole('button',{name:'◇ SECTOR FOCUS',exact:true}).click();await page.getByRole('group',{name:'Choose live sector'}).getByRole('button').nth(1).click();
   await page.getByRole('button',{name:new RegExp('MEND rank '+(mode==='rank2'?2:1)+',')}).click();
   assert(await page.getByRole('button',{name:'REVIEW UPGRADE'}).isEnabled());
   assert(await page.getByText(/Costs 1 shared point/).isVisible());
   if(mode==='atlas')assert(await page.getByText('RADIUS 1 → 2',{exact:true}).isVisible());
   else assert(await page.getByText(/≤50% HP before healing/).isVisible());
  } else if(mode==='mastery'){
   await page.getByRole('button',{name:'SHADOW',exact:true}).click();assert(await page.getByLabel('Saved versus alternate Mastery').isVisible());
   assert(await page.getByText(/HEAL/).count()>0);
   await page.evaluate(()=>{const p=fixture.store.getState().progression;fixture.store.setState({progression:{...p,fieldOps:{activeMissionRun:{squadIds:['ally-03']}}}})});
   await page.getByText('Specialization',{exact:true}).click();
   assert(await page.getByRole('button',{name:/STEADY HAND/}).isDisabled());assert(await page.getByRole('button',{name:'SILENT SHELTER',exact:true}).isDisabled());
  } else if(mode==='brief'){
   await page.getByLabel('Build fit').waitFor();assert(await page.getByText(/BUILD FIT:/).isVisible());
  } else {
   await page.getByLabel('Why your build mattered').waitFor();assert(await page.getByText('SHADOW: GUARD prevented 8 damage.').isVisible());
   await page.screenshot({path:out+'/'+width+'-results-observed.png',fullPage:true});
   await page.evaluate(()=>fixture.store.setState({currentRunKey:'other-run'}));await page.getByText('No build-specific effect observed in this encounter.').waitFor();
  }
  assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow '+width+' '+mode);
  if(mode==='atlas'||mode==='rank2')assert(await page.locator('.tsa-root,.tsa-focus,.tsa-inspector').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),'Atlas overflow');
  assert(await page.locator('body').innerText(),'Nonempty rendered fixture');
  await page.screenshot({path:out+'/'+width+'-'+mode+'.png',fullPage:true});results.push(width+' '+mode);await page.close();
 }
 writeFileSync(out+'/results.json',JSON.stringify({browser:browser.version(),results,limits:'Chromium emulation with mocked account; no live transactions or physical-device validation.'},null,2));
 console.log('PASS G1 browser: '+results.length+' cases, V2 MEND ranks, mastery comparison/active-run lock, real brief/results wiring, stale proof rejection, 320/360/390/430px.');
}finally{await browser.close();await server.close()}
