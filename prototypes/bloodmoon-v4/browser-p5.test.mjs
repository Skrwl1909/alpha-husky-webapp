// Requires a separately provisioned private, loopback-only integration harness.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {hits,replay} from './simulation.js';
const demo=process.env.P5_URL;
if(!demo||!['127.0.0.1','localhost'].includes(new URL(demo).hostname)){console.error('NOT AVAILABLE: private loopback P5_URL required; no authenticated integration tests ran.');process.exit(2);}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const tabs=await(await fetch((process.env.CDP_URL||'http://127.0.0.1:9229')+'/json/list')).json();
const ws=new WebSocket(tabs.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0,dropSubmit=true;const pending=new Map(),errors=[],apiRequests=[],receipts=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);
  if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}
  else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);
  else if(m.method==='Network.requestWillBeSent'&&m.params.request.url.includes('/webapp/'))apiRequests.push(m.params.request.url);
  else if(m.method==='Fetch.requestPaused'){
    if(dropSubmit&&m.params.responseStatusCode===200){dropSubmit=false;void call('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:503,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify({ok:false,reason:'NETWORK_RETRY'})).toString('base64')}).then(()=>call('Fetch.disable'));}
    else void call('Fetch.continueRequest',{requestId:m.params.requestId});
  }
});
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function read(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const child=expression=>read(`(()=>{const w=document.querySelector('#last-stand-host iframe').contentWindow;return (${expression});})()`);
const snapshot=()=>child('w.lastStand.snapshot()');
async function waitFor(fn,label){for(let i=0;i<350;i++){if(await fn())return;await delay(40);}throw Error(label);}
async function tapParent(selector){await read(`document.querySelector(${JSON.stringify(selector)}).click()`);}
async function tapChild(id){await child(`w.document.getElementById(${JSON.stringify(id)}).click()`);}
async function touch(type,x,y){await call('Input.dispatchTouchEvent',{type,touchPoints:x===undefined?[]:[{id:1,x,y,force:1,radiusX:5,radiusY:5}]});}
async function arena(){return read(`(()=>{const f=document.querySelector('#last-stand-host iframe'),a=f.contentWindow.document.getElementById('arena').getBoundingClientRect(),r=f.getBoundingClientRect();return {x:r.x+a.x,y:r.y+a.y,width:a.width,height:a.height};})()`);}
const out=new URL('./p3/evidence-local/p5/',import.meta.url);await mkdir(out,{recursive:true});
async function capture(name){const r=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL(name+'.png',out),Buffer.from(r.data,'base64'));}
await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await call('Page.navigate',{url:demo});
await waitFor(()=>read('!!window.BloodMoon'),'host script');await tapParent('[data-profile="fresh"]');
await waitFor(()=>read('!!document.getElementById("bloodMoonLastStandBtn")'),'authenticated entry');
const before=await read('apiPost("/webapp/bloodmoon/laststand/state",{}).then(r=>r.data)');assert(before.enabled&&before.canStart);await capture('raid-before');
await tapParent('#bloodMoonLastStandBtn');await waitFor(()=>read('!!document.querySelector("#last-stand-host iframe")?.contentWindow.lastStand?.visuals().ready'),'child art');
await waitFor(()=>child('!w.document.getElementById("start").disabled'),'authenticated readiness');
await tapChild('start');await waitFor(async()=>(await snapshot()).tick>0,'server-issued fight');
assert.equal((await child('w.lastStand.recording()')).parameters.provenance,'resolved-input');
await call('Fetch.enable',{patterns:[{urlPattern:'*/webapp/bloodmoon/laststand/submit',requestStage:'Response'}]});
let s,target=null,last=-1,reactAt=0,held=false,captured=false;
while((s=await snapshot()).status==='playing'){
  const attack=s.events.findLast(e=>e.type==='telegraph');
  if(attack&&attack.tick!==last){last=attack.tick;reactAt=s.time+.25;target=null;
    for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){if(hits({x,y},s.attack,34)||Math.hypot(x-s.boss.x,y-s.boss.y)>250)continue;const d=Math.hypot(x-s.player.x,y-s.player.y);if(!target||d<target.d)target={x,y,d};}
  }
  if(target&&s.time>=reactAt){const dx=target.x-s.player.x,dy=target.y-s.player.y,d=Math.hypot(dx,dy),r=await arena(),ax=r.x+r.width*.5,ay=r.y+r.height*.83;
    if(d>12){if(!held){await touch('touchStart',ax,ay);held=true;}await touch('touchMove',ax+dx/d*38*r.width/360,ay+dy/d*38*r.height/540);}else{if(held)await touch('touchEnd');held=false;target=null;}}
  if(!captured&&s.time>8&&s.phase==='telegraph'){await capture('authenticated-combat');captured=true;}
  await delay(25);
}
if(held)await touch('touchEnd');assert.equal(s.status,'won');
const record=await child('w.lastStand.recording()');assert.deepEqual(replay(record).events,s.events);
await waitFor(()=>child('w.document.getElementById("start").textContent==="Retry verification"'),'lost response retry');await capture('network-retry');
await tapChild('start');await waitFor(()=>child('w.document.getElementById("result").textContent==="Verified solo victory"'),'verified receipt retry');await capture('verified-victory');
assert((await child('w.document.getElementById("summary").textContent')).includes('No raid credit'));
await tapParent('#last-stand-host > button');await waitFor(()=>read('!document.getElementById("last-stand-host")'),'return to raid');
const after=await read('apiPost("/webapp/bloodmoon/laststand/state",{}).then(r=>r.data)');
for(const k of ['sharedHP','attemptsLeft','cooldownLeftSec','contribution','raidInstanceId'])assert.equal(after[k],before[k],k);
await tapParent('#bloodMoonLastStandBtn');await waitFor(()=>read('!!document.querySelector("#last-stand-host iframe")?.contentWindow.lastStand?.visuals().ready'),'new child');await waitFor(()=>child('!w.document.getElementById("start").disabled'),'new readiness');await tapChild('start');
await waitFor(async()=>(await snapshot()).tick>0,'second fight');while((await snapshot()).status==='playing')await delay(40);
assert.equal((await snapshot()).status,'lost');await waitFor(()=>child('w.document.getElementById("result").textContent==="Verified run ended"'),'verified defeat');await capture('verified-defeat');
await tapChild('start');await waitFor(async()=>(await snapshot()).status==='playing'&&(await snapshot()).tick>0,'expiry case');
const expired=await read('apiPost("/test/expire",{})');assert(expired.ok);
while((await snapshot()).status==='playing')await delay(40);
await waitFor(()=>child('w.document.getElementById("start").textContent==="Request new encounter"'),'expired session recovery');
assert((await child('w.document.getElementById("summary").textContent')).includes('EXPIRED'));
assert.equal(await child('w.sessionStorage.getItem("alpha-last-stand-p5-pending")'),null);
await capture('expired-no-credit');await tapChild('start');await waitFor(async()=>(await snapshot()).status==='playing'&&(await snapshot()).tick>0,'fresh encounter after expiry');
assert.equal(errors.length,0,JSON.stringify(errors));assert(apiRequests.every(url=>url.startsWith(new URL(demo).origin)));
await writeFile(new URL('results.json',out),JSON.stringify({status:'PASS',realBackendHarnessRequired:true,physicalDeviceTested:false,nativeTouch:true,winTime:s.time,replay:'PASS',lostResponseRetry:'PASS',verifiedDefeat:'PASS',expiryRecovery:'PASS',raidEconomyUnchanged:true,exceptions:errors},null,2));
console.log(`PASS authenticated native-touch victory ${s.time.toFixed(2)}s, replay, lost-response durable retry, verified defeat, expiry recovery, refreshed unchanged raid; no economic credit`);ws.close();
