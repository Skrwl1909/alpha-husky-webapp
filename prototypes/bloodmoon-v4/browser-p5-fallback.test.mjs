import assert from 'node:assert/strict';
const demo=process.env.P5_URL;if(!demo||!['127.0.0.1','localhost'].includes(new URL(demo).hostname)){console.error('NOT AVAILABLE: private loopback P5_URL required.');process.exit(2);}
const tabs=await(await fetch((process.env.CDP_URL||'http://127.0.0.1:9229')+'/json/list')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
const pending=new Map(),errors=[];let id=0,command=null;
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);else if(m.method==='Network.requestWillBeSent'&&m.params.request.url.endsWith('/webapp/bloodmoon/attack'))command=JSON.parse(m.params.request.postData);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
async function read(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const pause=ms=>new Promise(r=>setTimeout(r,ms));async function wait(fn){for(let i=0;i<300;i++){if(await fn())return;await pause(40);}throw Error('Fallback timeout');}
await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Page.navigate',{url:demo});await wait(()=>read('!!window.BloodMoon'));
await read('document.querySelector("[data-profile=fresh]").click()');await wait(()=>read('!!document.getElementById("bloodMoonAttackBtn")'));
assert(await read('!document.getElementById("bloodMoonLastStandBtn")'));
assert.equal(await read('apiPost("/webapp/bloodmoon/laststand/state",{}).then(r=>r.data.enabled)'),false);
const before=await read('apiPost("/webapp/bloodmoon/state",{}).then(r=>r.data.myContribution.attemptsLeft)');
await read('document.getElementById("bloodMoonAttackBtn").click()');
await wait(async()=>command&&(await read('apiPost("/webapp/bloodmoon/state",{}).then(r=>r.data.myContribution.attemptsLeft)'))===before-1);
const repeat=await read(`apiPost('/webapp/bloodmoon/attack',${JSON.stringify(command)})`);assert(repeat.ok);assert(repeat.idempotentReplay||repeat.duplicate);
assert.equal(await read('apiPost("/webapp/bloodmoon/state",{}).then(r=>r.data.myContribution.attemptsLeft)'),before-1);
assert.equal(errors.length,0);console.log('PASS default-OFF flag hides V4; existing V3 attack works and duplicate retry consumes only one isolated fixture attempt');ws.close();
