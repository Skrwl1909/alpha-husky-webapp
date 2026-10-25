// Native touch gameplay with public synthetic profiles. No game-state overrides.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {hits,replay} from './simulation.js';
import {P3_PROFILES} from './p3/balance.js';
const delay=ms=>new Promise(r=>setTimeout(r,ms)),demo=process.env.DEMO_URL||'http://127.0.0.1:4173/';
const tabs=await(await fetch((process.env.CDP_URL||'http://127.0.0.1:9227')+'/json/list')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(),exceptions=[],requests=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);});
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function read(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const snapshot=()=>read('(()=>{const s=window.lastStand.snapshot();s.visual=window.lastStand.visuals();s.scroll=scrollY;return s;})()');
async function touch(type,x,y){await call('Input.dispatchTouchEvent',{type,touchPoints:x===undefined?[]:[{x,y,id:1,force:1,radiusX:5,radiusY:5}]});}
async function rect(id){return read(`(()=>{const r=document.getElementById('${id}').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);}
async function tap(id){await read(`document.getElementById('${id}').scrollIntoView({block:'center'})`);await delay(40);const r=await rect(id);await touch('touchStart',r.x+r.width/2,r.y+r.height/2);await touch('touchEnd');await read('window.scrollTo(0,0)');await delay(40);}
const out=new URL('./p3/evidence-local/p4/',import.meta.url);await mkdir(out,{recursive:true});
async function capture(name){const r=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL(name+'.png',out),Buffer.from(r.data,'base64'));}
await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
for(const [width,height] of [[320,568],[360,740],[390,844],[412,915]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await call('Page.navigate',{url:demo});
  for(let i=0;i<250;i++){if(await read('!!window.lastStand?.visuals().ready'))break;await delay(40);}
  assert(await read('window.lastStand.visuals().ready'));assert(await read('document.documentElement.scrollWidth<=innerWidth'));
  const r=await rect('arena');assert(r.x>=0&&r.x+r.width<=width);assert(r.y+r.height<height);await tap('start');
  const x=r.x+r.width*.5,y=r.y+r.height*.8;
  await touch('touchStart',x,y);await touch('touchMove',x+38*r.width/360,y);await delay(80);
  const before=await snapshot();assert(before.moving);await delay(180);const moving=await snapshot();assert(moving.player.x>before.player.x);assert.equal(moving.boss.hp,before.boss.hp);assert.equal(await read('scrollY'),0);
  await capture('portrait-'+width);await touch('touchCancel');await delay(50);assert(!(await snapshot()).moving);
  if(width===320){
    await tap('restart');let idle;while((idle=await snapshot()).status==='playing')await delay(40);
    assert.equal(idle.status,'lost');assert.equal(idle.player.hp,0);await capture('defeat-320');await tap('restart');assert.equal((await snapshot()).player.hp,50);
  }
  await read('document.getElementById("lite").checked=true');await delay(60);assert.equal(await read('window.lastStand.visuals().feedback.motion'),false);assert(await read('document.body.classList.contains("reduced-motion")'));
  console.log(`PASS P4 ${width}px native movement/cancel, reduced motion, no attacks while moving, no scrolling`);
}
if(process.argv.includes('--layout-only')){assert.equal(exceptions.length,0);await writeFile(new URL('layout-results.json',out),JSON.stringify({status:'PASS',viewports:[[320,568],[360,740],[390,844],[412,915]],nativeTouch:true,defeatRestart:true,reducedMotion:true,scrollDuringCombat:0,exceptions,physicalDeviceTested:false},null,2));console.log('PASS P4 portrait native touch and defeat/restart');ws.close();process.exit(0);}
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
const captures=new Set(),stages=new Set();
const results={mode:'P4_PRESENTATION_PARITY',physicalDeviceTested:false,scenarios:{}};
for(const profile of ['fresh']){
  await call('Page.navigate',{url:demo});
  for(let i=0;i<250;i++){if(await read('!!window.lastStand?.visuals().ready'))break;await delay(40);}
  assert(await read('window.lastStand.visuals().ready'));
  await read(`document.querySelector('details').open=true;document.getElementById('profile').value='p3-${profile}';document.getElementById('profile').dispatchEvent(new Event('change'))`);
  assert((await read('document.getElementById("resolution-status").textContent')).includes('Proposed demo tuning'));
  await tap('start');let state=await snapshot();assert.equal(state.boss.hp,1000);assert.equal(state.player.hp,P3_PROFILES[profile].parameters.player.maxHP);
  let held=false,target=null,attackTick=-1,reactAt=0,captured=false,recording=profile==='fresh',videoSaved=false;
  if(recording)await read(`(()=>{window.qaChunks=[];window.qaVideo=new MediaRecorder(document.getElementById('arena').captureStream(15),{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:180000});window.qaVideo.ondataavailable=e=>{if(e.data.size)window.qaChunks.push(e.data);};window.qaVideo.start();})()`);
  while((state=await snapshot()).status==='playing'){
    const visuals=state.visual;assert.equal(visuals.playerSize,76);assert.equal(visuals.hitboxRadius,11);assert.equal(state.scroll,0);
    const attack=state.events.findLast(e=>e.type==='telegraph');
    if(attack&&attack.tick!==attackTick){attackTick=attack.tick;reactAt=state.time+(profile==='fresh'?.45:.25);target=null;const number=state.events.filter(e=>e.type==='telegraph').length;
      if(!(profile==='fresh'&&[4,13].includes(number)))for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){if(hits({x,y},state.attack,profile==='fresh'?44:34)||Math.hypot(x-state.boss.x,y-state.boss.y)>250)continue;const d=Math.hypot(x-state.player.x,y-state.player.y);if(!target||d<target.d)target={x,y,d};}
    }
    if(target&&state.time>=reactAt){const dx=target.x-state.player.x,dy=target.y-state.player.y,d=Math.hypot(dx,dy),r=await rect('arena'),ax=r.x+r.width*.5,ay=r.y+r.height*.83;
      if(d>18){if(!held){await touch('touchStart',ax,ay);held=true;}await touch('touchMove',ax+dx/d*38*r.width/360,ay+dy/d*38*r.height/540);}else{if(held)await touch('touchEnd');held=false;target=null;}
    }
    if(!captured&&state.time>8&&state.phase==='telegraph'){await capture(profile+'-combat');captured=true;}
    if(recording&&!videoSaved&&state.time>=12){const data=await read(`new Promise(resolve=>{window.qaVideo.onstop=async()=>{const b=new Uint8Array(await new Blob(window.qaChunks,{type:'video/webm'}).arrayBuffer());let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));resolve(btoa(s));};window.qaVideo.stop();})`);await writeFile(new URL('p4-gameplay.webm',out),Buffer.from(data,'base64'));videoSaved=true;}
    await delay(25);
  }
  if(held)await touch('touchEnd');assert.equal(state.status,'won');assert(state.time>=45&&state.time<=75);assert(state.player.hp>0);if(profile==='fresh'){assert.equal(state.player.hp,10);assert.equal(state.events.filter(e=>e.type==='player-hit').length,2);}await capture(profile+'-victory');
  const record=await read('window.lastStand.recording()'),again=replay(record);assert.deepEqual(again.events,state.events);assert.deepEqual(again.player,state.player);assert.deepEqual(record.parameters,P3_PROFILES[profile].parameters);
  const result={time:state.time,outcome:state.status,remainingHP:state.player.hp,bossHP:state.boss.hp,hits:state.events.filter(e=>e.type==='boss-hit').length,recording:record,events:state.events};
  await writeFile(new URL('browser-'+profile+'.json',out),JSON.stringify(result,null,2));results.scenarios[profile]={time:result.time,outcome:result.outcome,remainingHP:result.remainingHP,hits:result.hits};
  console.log(`PASS native browser ${profile}: ${state.time.toFixed(2)}s, ${result.hits} hits, ${state.player.hp} HP; replay identical`);
  if(profile==='fresh'){
    await read('document.getElementById("lite").checked=true');
    await tap('replay');await delay(100);assert((await snapshot()).playback);
    let reducedCaptured=false;while((state=await snapshot()).status==='playing'){
      const visuals=state.visual;assert.equal(visuals.feedback.motion,false);
    const key=state.phase==='telegraph'?`${state.phaseTime<.3?'imminent':'warning'}-${state.attack.kind}`:state.phase==='impact'?`impact-${state.attack.kind}`:state.phase==='recovery'?'recovery':null;
    if(key&&!captures.has(key)){await capture(key);captures.add(key);stages.add(key);}
    if(visuals.feedback.hurtVisible&&!captures.has('player-hit')){await capture('player-hit');captures.add('player-hit');}
    if(visuals.feedback.connection&&!captures.has('boss-hit')){await capture('boss-hit');captures.add('boss-hit');}
    if(state.pressure&&!captures.has('escalation-'+state.pressure)){await capture('escalation-'+state.pressure);captures.add('escalation-'+state.pressure);}
      if(!reducedCaptured&&state.time>8){await capture('reduced-motion');reducedCaptured=true;}await delay(25);
    }
    const uiReplay=await snapshot();assert.deepEqual(uiReplay.events,result.events);assert.deepEqual(uiReplay.player,again.player);console.log('PASS full P4 browser UI replay with frozen resolved parameters');
  }
}
for(const kind of ['LINE','CIRCLE','CONE'])for(const stage of ['warning','imminent','impact'])assert(stages.has(stage+'-'+kind),stage+'-'+kind);assert(captures.has('recovery'));assert(captures.has('player-hit'));assert(captures.has('boss-hit'));assert(captures.has('escalation-1'));assert(captures.has('escalation-2'));
const video=await read(`new Promise((resolve,reject)=>{const v=document.createElement('video');v.onloadeddata=()=>resolve({width:v.videoWidth,height:v.videoHeight});v.onerror=()=>reject(Error('P4 gameplay video decode failed'));v.src=${JSON.stringify(new URL('p3/evidence-local/p4/p4-gameplay.webm',demo).href)};v.load();})`);assert.equal(video.width,360);assert.equal(video.height,540);
assert.equal(exceptions.length,0);assert(requests.filter(u=>!u.startsWith('data:')).every(u=>u.startsWith(new URL(demo).origin)&&!u.includes('/webapp/')));
results.captures=[...captures];results.layouts=[[320,568],[360,740],[390,844],[412,915]];results.reducedMotion='PASS';results.scrollDuringCombat=0;results.exceptions=exceptions;results.video=video;results.externalApiRequests=0;results.status='PASS';
await writeFile(new URL('browser-results.json',out),JSON.stringify(results,null,2));console.log('PASS P4 recording decoded; zero runtime exceptions/external API requests');ws.close();
