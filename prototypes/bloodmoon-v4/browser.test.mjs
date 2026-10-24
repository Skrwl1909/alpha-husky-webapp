// Chrome DevTools Protocol drives native touch input; no runtime state mutations.
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {hits,replay} from './simulation.js';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const endpoint=process.env.CDP_URL||'http://127.0.0.1:9224';
const tabs=await(await fetch(`${endpoint}/json/list`)).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),errors=[],requests=[],badResponses=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)badResponses.push(m.params.response.url);else if(m.method==='Fetch.requestPaused')void call('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:404,body:''});});
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const snapshot=()=>evaluate('window.lastStand.snapshot()');
const evidencePath=process.env.EVIDENCE_DIR||'./p2/evidence-local/p1-browser/';
const out=new URL(evidencePath,import.meta.url);await mkdir(out,{recursive:true});
async function capture(name){const {data}=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL(`${name}.png`,out),Buffer.from(data,'base64'));}
await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
const demo=process.env.DEMO_URL||'http://127.0.0.1:4173/';
await call('Page.navigate',{url:demo});
async function loaded(){for(let i=0;i<250;i++){if(await evaluate('!!window.lastStand?.visuals().ready'))return;await pause(40);}throw Error('Artwork did not become ready');}
await loaded();
await evaluate(`document.getElementById('profile').value='standard';document.getElementById('profile').dispatchEvent(new Event('change'));`);
let visuals=await evaluate('window.lastStand.visuals()');assert.equal(visuals.loaded.length,10);assert.deepEqual(visuals.failures,[]);
console.log('PASS all 10 original production assets decoded');
const box=async selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
async function tap(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);await pause(40);const r=await box(selector);await touch('touchStart',r.x+r.width/2,r.y+r.height/2);await touch('touchEnd');await evaluate('window.scrollTo(0,0)');await pause(40);}
async function touch(type,x,y){await call('Input.dispatchTouchEvent',{type,touchPoints:x===undefined?[]:[{x,y,id:1,radiusX:5,radiusY:5,force:1}]});}
for(const [width,height] of [[320,568],[390,844]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await pause(100);
  const b=await box('#arena');assert(Math.abs(b.width/b.height-2/3)<.005);assert(b.x>=0&&b.x+b.width<=width);assert(b.y+b.height<height);
  assert(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'));
}
await capture('p1-ready');console.log('PASS portrait layout 320×568 and 390×844, exact arena ratio, no horizontal overflow');
await tap('#start');
let r=await box('#arena'), ax=r.x+r.width/2,ay=r.y+r.height*.8;
await touch('touchStart',ax,ay);await touch('touchMove',ax+38*r.width/360,ay);await pause(180);
let state=await snapshot();assert(state.moving);assert(state.player.x>200);assert.equal(state.boss.hp,96);
await touch('touchCancel');await pause(70);assert(!(await snapshot()).moving);
console.log('PASS native touch movement, scaling and touchCancel');
await touch('touchStart',ax,ay);await touch('touchMove',ax-38*r.width/360,ay);await pause(60);
await call('Emulation.setDeviceMetricsOverride',{width:360,height:740,deviceScaleFactor:1,mobile:true});await pause(80);assert(!(await snapshot()).moving);await touch('touchEnd');
console.log('PASS resize releases movement');
await tap('#restart');await pause(70);state=await snapshot();assert.equal(state.player.hp,3);assert.equal(state.boss.hp,96);assert(!state.moving);
// Intentional idle run proves genuine collision damage and a terminal loss.
const captured=new Set();
while((state=await snapshot()).status==='playing'){
  if(state.phase==='telegraph'&&!captured.has(state.attack.kind)){
    captured.add(state.attack.kind);await capture(`idle-${state.attack.kind.toLowerCase()}`);
  }
  await pause(45);
}
assert.equal(state.status,'lost');assert.equal(state.player.hp,0);assert.equal(state.events.filter(e=>e.type==='player-hit').length,3);
await capture('idle-loss');console.log('PASS idle loses with LINE, CIRCLE, CONE damage');
await tap('#restart');await pause(60);state=await snapshot();assert.equal(state.player.hp,3);assert.equal(state.events.filter(e=>e.type==='player-hit').length,0);
await evaluate(`(()=>{window.qaVideoChunks=[];window.qaVideo=new MediaRecorder(document.getElementById('arena').captureStream(15),{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:200000});window.qaVideo.ondataavailable=e=>{if(e.data.size)window.qaVideoChunks.push(e.data);};window.qaVideo.start();})()`);
let videoSaved=false;
async function saveVideo(){const base64=await evaluate(`new Promise(resolve=>{window.qaVideo.onstop=async()=>{const data=new Uint8Array(await new Blob(window.qaVideoChunks,{type:'video/webm'}).arrayBuffer());let raw='';for(let i=0;i<data.length;i+=32768)raw+=String.fromCharCode(...data.subarray(i,i+32768));resolve(btoa(raw));};window.qaVideo.stop();})`);await writeFile(new URL('gameplay.webm',out),Buffer.from(base64,'base64'));videoSaved=true;}
let lastAttackTick=-1,target=null,held=false,reactAt=0;const winShapes=new Set(),notices=new Set(),expiredNotices=new Set(),bossStates=new Set();
function choose(s){let best=null;for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){if(hits({x,y},s.attack,34)||Math.hypot(x-s.boss.x,y-s.boss.y)>250)continue;const d=Math.hypot(x-s.player.x,y-s.player.y);if(!best||d<best.d)best={x,y,d};}return best;}
while((state=await snapshot()).status==='playing'){
  visuals=await evaluate('window.lastStand.visuals()');bossStates.add(visuals.bossState);
  if(state.time>=12&&!videoSaved)await saveVideo();
  const escalation=state.events.findLast(e=>e.type==='escalation');
  if(escalation&&!notices.has(escalation.pressure)){
    assert.equal(await evaluate('document.getElementById("escalation").hidden'),false);
    const message=await evaluate('document.getElementById("escalation").textContent');
    assert(message.includes(escalation.pressure===2?'ENRAGED':'STIRS'));
    await capture(`escalation-${escalation.pressure}`);notices.add(escalation.pressure);
  }
  if(escalation&&state.time-escalation.tick/60>2.1&&!expiredNotices.has(escalation.pressure)){
    assert.equal(await evaluate('document.getElementById("escalation").hidden'),true);expiredNotices.add(escalation.pressure);
  }
  const telegraph=state.events.findLast(e=>e.type==='telegraph');
  if(telegraph&&telegraph.tick!==lastAttackTick){lastAttackTick=telegraph.tick;target=choose(state);reactAt=state.time+.25;assert(target);}
  r=await box('#arena');ax=r.x+r.width*.5;ay=r.y+r.height*.83;
  if(target&&state.time>=reactAt){const dx=target.x-state.player.x,dy=target.y-state.player.y,d=Math.hypot(dx,dy);
    if(d>10){if(!held){await touch('touchStart',ax,ay);held=true;}await touch('touchMove',ax+dx/d*38*r.width/360,ay+dy/d*38*r.height/540);}
    else{if(held)await touch('touchEnd');held=false;target=null;}
  }
  if(state.phase==='telegraph'&&state.boss.hp<90&&!winShapes.has(state.attack.kind)){winShapes.add(state.attack.kind);await capture(`combat-${state.attack.kind.toLowerCase()}`);}
  await pause(25);
}
if(held)await touch('touchEnd');
assert.equal(state.status,'won');assert(state.time>=45&&state.time<=75);assert(state.player.hp>0);assert.equal(state.boss.hp,0);
const escalationEvents=state.events.filter(e=>e.type==='escalation');
assert.deepEqual(escalationEvents.map(e=>[e.tick,e.pressure,e.recovery]),[[1800,1,.55],[3000,2,.48]]);
assert.deepEqual([...notices],[1,2]);assert.deepEqual([...expiredNotices],[1,2]);
for(const e of state.events.filter(e=>e.type==='opening'))assert.equal(e.recovery,e.tick/60>=50?.48:e.tick/60>=30?.55:.65);
console.log('PASS 30/50s escalation, 650/550/480ms recovery, visible then expired notices; 250ms reaction and wider dodges');
await capture('victory');
await pause(50);assert.equal((await evaluate('window.lastStand.visuals()')).bossState,'defeat');bossStates.add('defeat');
assert.deepEqual([...bossStates].sort(),['attack','defeat','hit','idle']);
const record=await evaluate('window.lastStand.recording()'),copy=replay(record);
assert.deepEqual(copy.events,state.events);assert.deepEqual(copy.player,state.player);
console.log(`PASS actual touch dodge/counter victory: ${state.time.toFixed(2)}s, ${state.player.hp} HP; recorded trace matches simulation`);
await writeFile(new URL('touch-victory.json',out),JSON.stringify({recording:record,events:state.events},null,2));
await tap('#replay');await pause(120);assert((await snapshot()).playback);console.log('PASS replay UI starts recorded inputs');
// Finish replay at normal simulation speed; verify browser playback reaches identical result.
while((await snapshot()).status==='playing')await pause(300);
const played=await snapshot();assert.deepEqual(played.events,state.events);assert.deepEqual(played.player,state.player);
console.log('PASS full browser replay identical');
await tap('#restart');await pause(100);assert(!(await snapshot()).playback);
await call('Page.reload');await loaded();assert.equal((await snapshot()).tick,0);assert(!(await snapshot()).moving);
assert.equal(badResponses.length,0,JSON.stringify(badResponses));
assert(requests.filter(url=>!url.startsWith('data:')).every(url=>url.startsWith(new URL(demo).origin)&&!url.includes('/webapp/')),'Unexpected external/API request');
// Exercise local strength selection in the real UI; full paired trace comparison is in presentation.test.mjs.
await evaluate(`(()=>{document.querySelector('details').open=true;document.getElementById('profile').value='stronger';})()`);await tap('#start');await pause(650);
let profileRecord=await evaluate('window.lastStand.recording()');assert.equal(profileRecord.parameters.player.damagePerHit,1.2);assert.equal(profileRecord.parameters.enemy.maxHP,96);assert((await snapshot()).boss.hp<96);
console.log('PASS local stronger fixture is applied in browser, boss HP remains 96');
const edgeBox=await box('#arena'),edgeX=edgeBox.x+edgeBox.width*.5,edgeY=edgeBox.y+edgeBox.height*.7;
await touch('touchStart',edgeX,edgeY);await touch('touchMove',edgeX,edgeY+38*edgeBox.height/540);await pause(1200);await touch('touchEnd');
assert.equal((await snapshot()).player.y,529);await capture('p1-lower-bound');console.log('PASS actual touch reaches lower boundary; player rendered above HUD');
// Deliberately fail an optional state, then an essential player asset via CDP networking.
await call('Fetch.enable',{patterns:[{urlPattern:'*tower_husk/hit.webp',requestStage:'Request'}]});await call('Page.reload');await loaded();
visuals=await evaluate('window.lastStand.visuals()');assert.deepEqual(visuals.failures,['hit']);await tap('#start');await pause(300);visuals=await evaluate('window.lastStand.visuals()');assert.equal(visuals.bossState,'hit');assert(visuals.bossSource.endsWith('/idle.webp'));
await capture('p1-fallback');
await call('Fetch.disable');await call('Fetch.enable',{patterns:[{urlPattern:'*alpha_husky_player_sheet_v1.png',requestStage:'Request'}]});await call('Page.reload');
for(let i=0;i<250;i++){if(await evaluate('window.lastStand?.visuals().failures.includes("player")'))break;await pause(40);}
assert(!(await evaluate('window.lastStand.visuals().ready')));assert(await evaluate('document.getElementById("start").disabled'));assert((await evaluate('document.getElementById("result").textContent')).includes('unavailable'));
await call('Fetch.disable');await call('Page.reload');await loaded();
console.log('PASS optional asset fallback, essential asset failure blocks play safely, restored load succeeds');
const recordedVideo=await evaluate(`new Promise((resolve,reject)=>{const v=document.createElement('video');v.preload='auto';v.onloadeddata=()=>resolve({width:v.videoWidth,height:v.videoHeight,readyState:v.readyState});v.onerror=()=>reject(Error('Recorded gameplay failed to decode'));v.src=${JSON.stringify(new URL(evidencePath+'gameplay.webm',demo).href)};v.load();})`);
assert(recordedVideo.width>=360&&recordedVideo.height>=540&&recordedVideo.readyState>=2);
console.log('PASS recorded gameplay WebM decodes in Chrome');
assert.equal(errors.length,0,JSON.stringify(errors));
console.log('PASS reopen/reset, zero browser exceptions');
await writeFile(new URL('browser-result.json',out),JSON.stringify({viewport:{width:360,height:740},status:'PASS',victoryTime:state.time,playerHP:state.player.hp,bossHP:state.boss.hp,reactionDelay:.25,dodgeMargin:34,escalationEvents,notices:[...notices],expiredNotices:[...expiredNotices],shapes:[...winShapes],bossStates:[...bossStates],productionAssetsLoaded:10,layoutViewports:[[320,568],[390,844],[360,740]],optionalFallback:'PASS',essentialFailure:'PASS',externalApiRequests:0,gameplayRecording:'gameplay.webm',recordedVideo,exceptions:errors,physicalDeviceTested:false},null,2));
ws.close();
