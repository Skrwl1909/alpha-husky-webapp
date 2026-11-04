// Offline contract tests. All tokens are fictional; fetch is an in-memory stub.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/browser_guest_entry_v1.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const KEY = "ah.browser.guest.v1";

function setup({ host = "app.alphahusky.win", query = "?browser_guest=1",
  native = false, packaged = false, telegram = "", saved = null,
  storageBlocked = false, response = null } = {}) {
  const elements = [], events = [], requests = [], listeners = {};
  const memory = new Map(saved ? [[KEY, JSON.stringify(saved)]] : []);
  function element(tag) {
    return { tag, attrs: {}, children: [], handlers: {}, style: {},
      textContent: "", disabled: false, value: "",
      setAttribute(k,v){ this.attrs[k]=v; },
      appendChild(n){ this.children.push(n); },
      addEventListener(k,v){ this.handlers[k]=v; },
      remove(){ const i=elements.indexOf(this); if(i>=0)elements.splice(i,1); }
    };
  }
  const document = { readyState:"loading",
    body:{appendChild(el){elements.push(el);}},
    createElement:element,
    getElementById(id){return elements.find(n=>n.attrs.id===id)||null;},
    addEventListener(k,v){listeners[k]=v;}
  };
  const window = {
    document, location:{hostname:host,search:query}, API_BASE:"https://api.alphahusky.win",
    Capacitor:native?{isNativePlatform:()=>true}:undefined,
    AlphaHuskyCapp:packaged?{isPackagedRuntime:()=>true}:undefined,
    Telegram:{WebApp:{initData:telegram}},
    sessionStorage:{
      getItem(k){if(storageBlocked)throw Error("blocked");return memory.get(k)||null;},
      setItem(k,v){if(storageBlocked)throw Error("blocked");memory.set(k,v);},
      removeItem(k){if(storageBlocked)throw Error("blocked");memory.delete(k);}
    },
    navigator:{clipboard:{writeText:async()=>{}}},
    dispatchEvent(e){events.push(e.type);},
    async fetch(url,opts) {
      requests.push({url,opts});
      return response || {ok:true,json:async()=>({
        ok:true,session_token:"TEST_ACCESS_TOKEN",expires_in:3600,
        guest_recovery_token:"TEST_RECOVERY_TOKEN"
      })};
    }
  };
  vm.runInNewContext(source,{window,URLSearchParams,Date,
    Event:class{constructor(type){this.type=type;}}});
  function all(){const a=[];const visit=n=>{a.push(n);for(const c of n.children||[])visit(c);};elements.forEach(visit);return a;}
  return {window,events,requests,memory,all,
    button(label){return all().find(n=>n.tag==="button" && n.textContent===label);},
    ready(){listeners.DOMContentLoaded?.();}
  };
}
for(const config of [{native:true},{packaged:true},{telegram:"TEST_TELEGRAM_SIGNATURE"},
  {query:""},{host:"untrusted.example"}]){
  const t=setup(config);t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,false);
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),false);
  assert.equal(t.requests.length,0);
}
{
  const t=setup();t.ready();
  assert.equal(t.requests.length,0);
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  const b=t.button("Play as Guest");
  await Promise.all([b.handlers.click(),b.handlers.click()]);
  assert.equal(t.requests.length,1);
  assert.equal(t.requests[0].url,"https://api.alphahusky.win/mobile/auth/start-new");
  assert.equal(t.window.__ahAlphaAccountSession,null);
  assert.ok(t.all().some(n=>n.textContent==="TEST_RECOVERY_TOKEN"));
  t.button("I saved the code — enter game").handlers.click();
  assert.equal(t.window.__ahAlphaAccountSession.sessionToken,"TEST_ACCESS_TOKEN");
  assert.deepEqual(t.events,["ah:browser-guest-ready"]);
  assert.ok(!t.memory.get(KEY).includes("TEST_RECOVERY_TOKEN"));
}
{
  const t=setup({saved:{token:"TEST_RESUMED",expiresAt:Date.now()+3600000}});t.ready();
  assert.equal(t.window.__ahAlphaAccountSession.sessionToken,"TEST_RESUMED");
  assert.equal(t.requests.length,0);
}
{
  const t=setup({saved:{token:"TEST_EXPIRED",expiresAt:Date.now()-1000}});t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.ok(t.button("I already have a recovery code"));
  assert.equal(t.requests.length,0);
}
{
  const t=setup({storageBlocked:true});t.ready();
  await t.button("Play as Guest").handlers.click();
  assert.ok(t.all().some(n=>n.textContent==="TEST_RECOVERY_TOKEN"));
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.equal(t.events.length,0);
}
{
  const t=setup({response:{ok:false,json:async()=>({ok:false,reason:"TEST_DENIED"})}});t.ready();
  await t.button("Play as Guest").handlers.click();
  assert.ok(t.all().some(n=>/TEST_DENIED/.test(n.textContent)));
  assert.equal(t.events.length,0);
}
{
  const t=setup();t.ready();
  t.button("I already have a recovery code").handlers.click();
  assert.equal(t.requests.length,0);
  t.all().find(n=>n.tag==="input").value="short";
  await t.button("Recover existing account").handlers.click();
  assert.equal(t.requests.length,0);
}
const fakeRecovery="TEST_RECOVERY_"+"A".repeat(52);
{
  const t=setup({response:{ok:true,json:async()=>({
    ok:true,session_token:"TEST_RECOVERED",expires_in:3600,
    authMode:"guest_recovery"
  })}});t.ready();
  t.button("I already have a recovery code").handlers.click();
  t.all().find(n=>n.tag==="input").value=fakeRecovery;
  const b=t.button("Recover existing account");
  await Promise.all([b.handlers.click(),b.handlers.click()]);
  assert.equal(t.requests.length,1);
  assert.equal(t.requests[0].url,"https://api.alphahusky.win/mobile/auth/recover-guest");
  assert.equal(JSON.parse(t.requests[0].opts.body).guest_recovery_token,fakeRecovery);
  assert.equal(t.window.__ahAlphaAccountSession.sessionToken,"TEST_RECOVERED");
  assert.deepEqual(t.events,["ah:browser-guest-ready"]);
  assert.ok(!t.memory.get(KEY).includes(fakeRecovery));
}
{
  const t=setup({storageBlocked:true,response:{ok:true,json:async()=>({
    ok:true,session_token:"TEST_RECOVERED",expires_in:3600
  })}});t.ready();
  t.button("I already have a recovery code").handlers.click();
  t.all().find(n=>n.tag==="input").value=fakeRecovery;
  await t.button("Recover existing account").handlers.click();
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.ok(t.window.__ahAlphaAccountSession==null);
  assert.equal(t.events.length,0);
}
{
  const t=setup({response:{ok:false,json:async()=>({
    ok:false,reason:"INVALID_OR_EXPIRED_RECOVERY"
  })}});t.ready();
  t.button("I already have a recovery code").handlers.click();
  t.all().find(n=>n.tag==="input").value=fakeRecovery;
  await t.button("Recover existing account").handlers.click();
  assert.equal(t.requests.length,1);
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.ok(t.all().some(n=>/INVALID_OR_EXPIRED_RECOVERY/.test(n.textContent)));
}
{
  // Clean URL: same tab retains existing browser guest session, no new account.
  const t=setup({query:"",saved:{token:"TEST_RESUMED",expiresAt:Date.now()+3600000}});t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,true);
  assert.equal(t.window.__ahAlphaAccountSession.sessionToken,"TEST_RESUMED");
  assert.equal(t.requests.length,0);
}
{
  const t=setup({query:"",saved:{token:"TEST_EXPIRED",expiresAt:Date.now()-1000}});t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,true);
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.ok(t.button("I already have a recovery code"));
  assert.equal(t.requests.length,0);
}
for(const conf of [
  {query:"",native:true,saved:{token:"TEST_IGNORE",expiresAt:Date.now()+3600000}},
  {query:"",telegram:"TEST_SIGNED_TELEGRAM",saved:{token:"TEST_IGNORE",expiresAt:Date.now()+3600000}}
]){
  const t=setup(conf);t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,false);
  assert.equal(t.requests.length,0);
}
{
  const t=setup();t.ready();const sequence=[];
  t.window.loadPlayerState=async()=>{sequence.push("profile");t.window.__ahLastProfilePayload={nickname:"TEST_PLAYER"};};
  t.window.Awakening={checkState:async()=>{sequence.push("awakening");},isOpen:()=>false};
  t.window.Oath={checkAndOpen:async()=>{sequence.push("oath");},getState:()=>({ok:true,show:false}),isOpen:()=>false};
  t.window.Onboarding={open:async()=>{sequence.push("onboarding");}};
  await t.button("Play as Guest").handlers.click();
  t.button("I saved the code — enter game").handlers.click();
  for(let i=0;i<8;i++) await Promise.resolve();
  assert.deepEqual(sequence,["profile","awakening","oath","onboarding"]);
}
assert.match(html,/browser_guest_entry_v1\.js/);
assert.match(html,/AlphaBrowserGuestV1\?\.shouldHoldBoot/);
console.log("PASS: Browser Guest V1 offline isolation, creation, persistence and recovery");
