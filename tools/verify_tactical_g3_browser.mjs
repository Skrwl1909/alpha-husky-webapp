/** Real UI/store, synthetic server-shaped fixtures; no account or live API access. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const production=process.env.G3_RUNTIME==='production';
const out = production?'artifacts/g3-production':'artifacts/g3';mkdirSync(out,{recursive:true});
let entry = `import React from 'react';import{createRoot}from'react-dom/client';
import{TacticalApp}from'/tactical-ops-src/ui/App.tsx';import{useBattleStore as store}from'/tactical-ops-src/store/battleStore.ts';import{TACTICAL_CSS}from'/tactical-ops-src/styles.ts';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
const params=new URLSearchParams(location.search),profile=params.get('profile')||'eligible',mode=params.get('mode')||'war-table';
const ids=['field-relay-recovery','field-relay-hold','field-squad-survival'];
const records=Object.fromEntries(ids.map(missionId=>[missionId,{missionId,clearCount:1,lastClearCycle:7,lastChallengeCycle:7,lastAdvancedCycle:7}]));
records[ids[2]].lastClearCycle=null;records[ids[2]].lastChallengeCycle=null;
const opportunity=profile==='claimed'?{status:'claimed',reason:'ROTATION_CREDIT_USED',missionIds:[],recommendedMissionId:null}:profile==='locked'?{status:'locked',reason:'COMMANDER_CERTIFICATION_REQUIRED',missionIds:[],recommendedMissionId:null}:{status:'eligible',reason:'CREDIT_AVAILABLE',missionIds:[ids[1]],recommendedMissionId:ids[1]};
const field={board:{cycleId:7,nextRotationAt:Math.floor(Date.now()/1000)+86400,activeMissionIds:ids,reportVersion:3,directiveSet:'pursuit'},commander:{rank:profile==='locked'?1:3,progress:12,nextRankAt:null,certificationComplete:profile!=='locked',unlockedApproaches:['standard','south'],unlockedDirectiveTiers:profile==='locked'?['standard']:['standard','advanced']},records,activeMissionRun:null,veteranProgressionAvailable:true,veteranCareer:{version:1,credits:2,missionIds:[ids[0]],lastCycle:profile==='claimed'?7:6,enabled:false},region:{cycleId:7,pressure:1},veteranOpportunity:profile==='unknown'?undefined:{version:1,cycleId:7,...opportunity}};
if(profile==='resume')field.activeMissionRun={runId:'field_legacy',missionId:ids[0],squadIds:['alpha','ally-02','ally-03'],fieldContext:{cycleId:6,reportVersion:2,pressure:2,approach:'standard'}};
const receipt={runId:'field_g3_result',missionId:ids[0],victory:true,cycleId:7,challengeSuccess:false,challengeBonus:0,progressEarned:2,firstCycleSecure:true,progressBefore:12,progressAfter:14,rankBefore:3,rankAfter:3,pressureBefore:2,pressureAfter:1,regionalApplied:true,unlockedApproaches:[],legacyReport:false,recordedAt:1,xpGranted:0,bonesGranted:0,veteranCareer:{before:2,after:2,reason:'ROTATION_CREDIT_USED',unlocked:false},masteryChanges:[{unitId:'ally-02',kind:'CNC',gained:0,progress:8,beforeStage:3,stage:3,newOptions:[],veteran:{before:1,after:1,reason:'OBJECTIVE_NOT_ELIGIBLE',unlocked:false}}]};
const progression={version:1,foundationStage:'completed',completed:true,revision:10,activeRunId:null,operations:{'broken-signal':{status:'cleared',missions:{}},'dead-relay':{status:'cleared',missions:{}}},fieldOps:field};
store.setState({progression,screen:mode,foundationCompleted:true,progressionStatus:'ready',progressionCommitPending:profile==='pending',progressionError:profile==='failed'?'Synthetic recording failure':null,selectedMissionId:ids[0],selectedSquadIds:['alpha','ally-02','ally-03'],selectedDirectiveTier:'advanced',currentRunKey:'field_g3_result',fieldResult:['pending','failed'].includes(profile)?null:profile==='stale'?{...receipt,runId:'other_run'}:receipt,battle:{...store.getState().battle,results:{victory:true,turns:7,hostilesEliminated:3,squadStanding:3,squadDeployed:3,damageTaken:20,bonesRecovered:0}}});
window.fixture={store};createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));`;
if(production) entry='const store=window.__tactical;window.TacticalOps.init({onboarding:"off"});await window.TacticalOps.open();'+entry.slice(entry.indexOf('const params')).replace("createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));",'');
const server=await createServer({configFile:false,cacheDir:'node_modules/.vite-g3',optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},plugins:[{
  name:'g3-fixture',configureServer(s){s.middlewares.use((req,res,next)=>{if(req.url==='/g3-bundle.js'){res.setHeader('Content-Type','application/javascript');res.end(readFileSync('js/tactical_ops.js'));return;}if(!req.url?.startsWith('/g3-fixture'))return next();res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta charset="utf-8">'+(production?'<script src="/g3-bundle.js"></script>':'')+'<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@g3"></script>');});},resolveId(id){if(id==='/@g3')return '\0g3';},load(id){if(id==='\0g3')return entry;}
}],server:{host:'127.0.0.1',port:0}});
await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,args:['--no-sandbox']});
const cases=[];
try {
  for(const [width,height] of [[320,740],[412,915],[430,932]]) {
    for(const profile of ['eligible','claimed','locked','unknown','resume']) {
      const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/g3-fixture?profile='+profile);
      await page.locator('[data-primary-purpose]').waitFor();
      assert.deepEqual(errors,[]);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'command overflow');
      const expected=profile==='eligible'?'field-relay-hold':profile==='resume'?'field-relay-recovery':'field-squad-survival';
      assert.equal(await page.locator('[data-primary-purpose]').getAttribute('data-purpose-mission'),expected);
      const action=page.locator('[data-primary-purpose] .t-btn-primary');
      assert.equal(await page.locator('.t-command-pane .t-btn-primary').count(),1,'one primary command CTA');
      await action.scrollIntoViewIfNeeded();
      assert(await action.evaluate(e=>{const b=e.getBoundingClientRect();return b.width>=44&&b.height>=44&&e.contains(document.elementFromPoint(b.left+b.width/2,b.top+b.height/2));}),'reachable 44px CTA');
      await page.screenshot({path:out+'/'+width+'-'+profile+'-command.png'});
      await action.click();
      assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief');
      assert.equal(await page.evaluate(()=>fixture.store.getState().selectedMissionId),expected);
      if(profile==='eligible')assert.equal(await page.evaluate(()=>fixture.store.getState().selectedDirectiveTier),'advanced');
      await page.locator('[aria-label="Mission overview"] [data-opportunity-status]').waitFor();
      const expectedStatus=profile==='resume'?'unknown':profile;
      assert.equal(await page.locator('[aria-label="Mission overview"] [data-opportunity-status]').getAttribute('data-opportunity-status'),expectedStatus);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'brief overflow');
      if(profile==='resume')assert.equal(await page.evaluate(()=>fixture.store.getState().progression.fieldOps.activeMissionRun.fieldContext.reportVersion),2);
      await page.screenshot({path:out+'/'+width+'-'+profile+'-brief.png'});
      cases.push({width,height,profile,surfaces:['command','brief']});await page.close();
    }
    for(const profile of ['eligible','claimed','pending','failed','stale']) {
      const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
      await page.goto('http://127.0.0.1:'+server.httpServer.address().port+'/g3-fixture?mode=results&profile='+profile);
      await page.locator('.t-field-results').waitFor();
      const confirmed=['eligible','claimed'].includes(profile);
      assert.equal(await page.locator('[aria-label="Confirmed mission earnings"]').count(),confirmed?1:0);
      assert.equal(await page.locator('.t-fr-next').count(),confirmed?1:0,'no next-reward claim without receipt');
      assert.equal(await page.locator('.t-result-actions .t-btn-primary').count(),1);
      if(confirmed){
        assert.match(await page.locator('.t-fr-eligibility').innerText(),/Optional challenge not completed/);
        assert.match(await page.locator('.t-pi-career p').innerText(),/cannot grant a second credit/);
      } else {
        assert.equal(await page.locator('.t-field-results').getAttribute('data-recording'),profile==='stale'?'unrecorded':profile);
        assert.equal(await page.locator('.t-result-actions .t-btn-primary').isDisabled(),profile==='pending');
      }
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'results overflow');
      await page.screenshot({path:out+'/'+width+'-'+profile+'-results.png'});
      if(confirmed){await page.locator('.t-result-actions .t-btn-primary').click();assert.equal(await page.evaluate(()=>fixture.store.getState().screen),'brief');assert.equal(await page.evaluate(()=>fixture.store.getState().selectedMissionId),profile==='eligible'?'field-relay-hold':'field-squad-survival');}
      cases.push({width,height,profile,surfaces:['results']});await page.close();
    }
  }
  writeFileSync(out+'/results.json',JSON.stringify({cases,runtime:production?'canonical production IIFE':'source React',limitations:'Synthetic fixtures; Chromium touch emulation. Physical S26 Ultra Telegram acceptance and live persistence remain unverified.'},null,2));
  console.log('PASS G3 browser ('+(production?'production IIFE':'source React')+'): '+cases.length+' cases / 45 surfaces; command → correct brief; receipt states; next CTA; 320/412/430px; accepted legacy run');
} finally {await browser.close();await server.close();}
