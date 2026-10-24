// Chrome DevTools Protocol drives native touch input; no runtime state mutations.
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {hits,replay} from './simulation.js';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const endpoint=process.env.CDP_URL||'http://127.0.0.1:9224';
const tabs=await(await fetch(`${endpoint}/json/list`)).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const snapshot=()=>evaluate('window.lastStand.snapshot()');
const out=new URL('./evidence/',import.meta.url);await mkdir(out,{recursive:true});
async function capture(name){const {data}=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL(`${name}.png`,out),Buffer.from(data,'base64'));}
await call('Runtime.enable');await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
await call('Page.navigate',{url:'http://127.0.0.1:4173/'});
for(let i=0;i<100;i++){if(await evaluate('!!window.lastStand'))break;await pause(40);}
const box=async selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
async function tap(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);await pause(40);const r=await box(selector);await touch('touchStart',r.x+r.width/2,r.y+r.height/2);await touch('touchEnd');await evaluate('window.scrollTo(0,0)');await pause(40);}
async function touch(type,x,y){await call('Input.dispatchTouchEvent',{type,touchPoints:x===undefined?[]:[{x,y,id:1,radiusX:5,radiusY:5,force:1}]});}
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
let lastAttackTick=-1,target=null,held=false;const winShapes=new Set();
function choose(s){let best=null;for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){if(hits({x,y},s.attack,26)||Math.hypot(x-s.boss.x,y-s.boss.y)>250)continue;const d=Math.hypot(x-s.player.x,y-s.player.y);if(!best||d<best.d)best={x,y,d};}return best;}
while((state=await snapshot()).status==='playing'){
  const telegraph=state.events.findLast(e=>e.type==='telegraph');
  if(telegraph&&telegraph.tick!==lastAttackTick){lastAttackTick=telegraph.tick;target=choose(state);assert(target);}
  r=await box('#arena');ax=r.x+r.width*.5;ay=r.y+r.height*.83;
  if(target){const dx=target.x-state.player.x,dy=target.y-state.player.y,d=Math.hypot(dx,dy);
    if(d>10){if(!held){await touch('touchStart',ax,ay);held=true;}await touch('touchMove',ax+dx/d*38*r.width/360,ay+dy/d*38*r.height/540);}
    else{if(held)await touch('touchEnd');held=false;target=null;}
  }
  if(state.phase==='telegraph'&&state.boss.hp<90&&!winShapes.has(state.attack.kind)){winShapes.add(state.attack.kind);await capture(`combat-${state.attack.kind.toLowerCase()}`);}
  await pause(25);
}
if(held)await touch('touchEnd');
assert.equal(state.status,'won');assert(state.time>=45&&state.time<=75);assert(state.player.hp>0);assert.equal(state.boss.hp,0);
await capture('victory');
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
await call('Page.reload');await pause(300);assert.equal((await snapshot()).tick,0);assert(!(await snapshot()).moving);
assert.equal(errors.length,0,JSON.stringify(errors));
console.log('PASS reopen/reset, zero browser exceptions');
await writeFile(new URL('browser-result.json',out),JSON.stringify({viewport:{width:360,height:740},status:'PASS',victoryTime:state.time,playerHP:state.player.hp,bossHP:state.boss.hp,shapes:[...winShapes],exceptions:errors,physicalDeviceTested:false},null,2));
ws.close();
