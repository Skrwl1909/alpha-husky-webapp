// Offline contract tests. All tokens are fictional; fetch is an in-memory stub.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/browser_guest_entry_v1.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const KEY = "ah.browser.guest.v1";

function setup({ host = "app.alphahusky.win", origin = "https://app.alphahusky.win", query = "?browser_guest=1",
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
    document, location:{hostname:host,origin,search:query}, API_BASE:"https://api.alphahusky.win",
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
  {host:"untrusted.example"},{host:"untrusted.example",query:""}]){
  const t=setup(config);t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,false);
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),false);
  assert.equal(t.requests.length,0);
}
// Clean production URL (including campaign UTM links) must show entry without an account request.
for (const query of ["", "?utm_source=reddit", "?ref=invite&utm_campaign=alpha"]) {
  const t=setup({query});t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,true);
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.ok(t.button("Play as Guest"));
  assert.ok(t.button("I already play on Telegram"));
  assert.ok(t.button("I already have a recovery code"));
  assert.equal(t.requests.length,0,"public entry must not create accounts on boot");
}
// Preview builds stay opt-in; a clean preview link cannot silently enter guest mode.
for (const {host,origin,query,allowed} of [
  {host:"alpha-husky-webapp.vercel.app",origin:"https://alpha-husky-webapp.vercel.app",query:"",allowed:false},
  {host:"alpha-husky-webapp.vercel.app",origin:"https://alpha-husky-webapp.vercel.app",query:"?browser_guest=1",allowed:true},
  {host:"untrusted.example",origin:"https://untrusted.example",query:"?browser_guest=1",allowed:false}
]) {
  const t=setup({host,origin,query});t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,allowed);
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

// Existing Telegram player: exchange one-time Sync Code for the same character.
{
  const t=setup({response:{ok:true,json:async()=>({
    ok:true,session_token:"TEST_TELEGRAM_SESSION",expires_in:3600,
    linkedTelegram:true,game_user_id:"12345",authMode:"telegram-sync-code"
  })}});t.ready();
  t.button("I already play on Telegram").handlers.click();
  t.all().find(n=>n.tag==="input").value="ab12 cd34";
  await Promise.all([t.button("Continue Existing Player").handlers.click(),t.button("Continue Existing Player").handlers.click()]);
  assert.equal(t.requests.length,1);
  assert.equal(t.requests[0].url,"https://api.alphahusky.win/mobile/auth/sync-code");
  assert.equal(JSON.parse(t.requests[0].opts.body).code,"AB12-CD34");
  assert.equal(t.window.__ahAlphaAccountSession.sessionToken,"TEST_TELEGRAM_SESSION");
  assert.deepEqual(t.events,["ah:browser-guest-ready"]);
  assert.equal(JSON.parse(t.memory.get(KEY)).authMode,"telegram-sync-code");
  assert.equal(t.window.AlphaBrowserGuestV1.authMode(),"telegram-sync-code");
}
{
  const t=setup();t.ready();
  t.button("I already play on Telegram").handlers.click();
  t.all().find(n=>n.tag==="input").value="short";
  await t.button("Continue Existing Player").handlers.click();
  assert.equal(t.requests.length,0);
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
}
for (const response of [
  {ok:false,json:async()=>({ok:false,reason:"CODE_ALREADY_USED"})},
  {ok:true,json:async()=>({ok:true,session_token:"BAD",expires_in:3600,linkedTelegram:false,authMode:"telegram-sync-code"})},
  {ok:true,json:async()=>({ok:true,session_token:"BAD",expires_in:3600,linkedTelegram:true,authMode:"standalone",game_user_id:"123"})}
]) {
  const t=setup({response});t.ready();
  t.button("I already play on Telegram").handlers.click();
  t.all().find(n=>n.tag==="input").value="AB12-CD34";
  await t.button("Continue Existing Player").handlers.click();
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.ok(t.window.__ahAlphaAccountSession==null);
  assert.equal(t.events.length,0);
  assert.equal(t.memory.get(KEY),undefined);
}
{
  const t=setup({storageBlocked:true,response:{ok:true,json:async()=>({
    ok:true,session_token:"TEST",expires_in:3600,
    linkedTelegram:true,game_user_id:"12345",authMode:"telegram-sync-code"
  })}});t.ready();
  t.button("I already play on Telegram").handlers.click();
  t.all().find(n=>n.tag==="input").value="AB12-CD34";
  await t.button("Continue Existing Player").handlers.click();
  assert.equal(t.window.AlphaBrowserGuestV1.shouldHoldBoot(),true);
  assert.ok(t.window.__ahAlphaAccountSession==null);
  assert.equal(t.events.length,0);
}
{
  const t=setup({query:"",saved:{token:"TEST_TELEGRAM_RESUMED",expiresAt:Date.now()+3600000,authMode:"telegram-sync-code"}});t.ready();
  assert.equal(t.window.__ahAlphaAccountSession.sessionToken,"TEST_TELEGRAM_RESUMED");
  assert.equal(t.window.AlphaBrowserGuestV1.authMode(),"telegram-sync-code");
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
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(sequence.join(","),"profile,awakening,oath,onboarding");
}
assert.match(html,/browser_guest_entry_v1\.js/);
assert.match(html,/AlphaBrowserGuestV1\?\.shouldHoldBoot/);

// Equipped must use canonical API for authenticated browser guests, not demo fixture.
const equippedSource = fs.readFileSync(new URL("../js/equipped.js", import.meta.url), "utf8");
const eqBegin = equippedSource.indexOf("  function hasInitData() {");
const eqEnd = equippedSource.indexOf("\n  function itemEffectText(", eqBegin);
assert.ok(eqBegin >= 0 && eqEnd > eqBegin, "Equipped auth helper must exist");
const eqHelper = equippedSource.slice(eqBegin, eqEnd);
function equippedAuthenticated({ telegram = "", browserActive = false, browserSession = false, bearer = "" } = {}) {
  const env = {
    getTg: () => ({ initData: telegram }),
    window: {
      INIT_DATA: "",
      AlphaBrowserGuestV1: { active: browserActive, hasSession: () => browserSession },
      __ahAlphaAccountSession: { sessionToken: bearer }
    }
  };
  vm.runInNewContext(eqHelper + "\nwindow.__equippedTestAuth = hasInitData();", env);
  return env.window.__equippedTestAuth;
}
assert.equal(equippedAuthenticated({ telegram: "TEST_TELEGRAM" }), true);
assert.equal(equippedAuthenticated({ browserActive: true, browserSession: true, bearer: "TEST_BEARER" }), true);
assert.equal(equippedAuthenticated({ browserActive: true, browserSession: false, bearer: "TEST_BEARER" }), false);
assert.equal(equippedAuthenticated({ browserActive: true, browserSession: true }), false);
assert.equal(equippedAuthenticated(), false);
assert.match(equippedSource, /if \(!hasInitData\(\)\) \{\s*this\._syncExternalState\(previewFixtureState\(\)\)/);
assert.match(equippedSource, /equippedPost\("\/webapp\/equipped\/state"/);
assert.match(equippedSource, /equippedPost\("\/webapp\/inventory\/state"/);

// localhost is allowed only for the existing CORS-approved dev origin.
// Local and preview origins remain opt-in; native/Telegram cannot activate guest mode.
for (const { origin, query, native, telegram, allowed } of [
  {origin:"http://localhost:3000",query:"?browser_guest=1",allowed:true},
  {origin:"http://localhost:3000",query:"",allowed:false},
  {origin:"http://localhost:3001",query:"?browser_guest=1",allowed:false},
  {origin:"https://localhost:3000",query:"?browser_guest=1",allowed:false},
  {origin:"http://localhost:3000",query:"?browser_guest=1",native:true,allowed:false},
  {origin:"http://localhost:3000",query:"?browser_guest=1",telegram:"TEST_SIGNED_TELEGRAM",allowed:false}
]) {
  const t=setup({host:"localhost",origin,query,native,telegram});t.ready();
  assert.equal(t.window.AlphaBrowserGuestV1.active,allowed);
  assert.equal(t.requests.length,0,"localhost boot must never create accounts");
}

// Regression: FactionChamber can capture early Telegram-only apiPost before
// the canonical API becomes available. The captured function must delegate.
const bootStart = html.indexOf("(function bootAuth(){");
const bootEnd = html.indexOf("\n})();\n</script>", bootStart);
assert.ok(bootStart >= 0 && bootEnd > bootStart, "early bootAuth must exist");
const earlyBootSource = html.slice(bootStart, bootEnd + "\n})();".length);
function earlyBootHarness({ tg = "", session = "", native = false } = {}) {
  const calls = [], delegation = [], stored = new Map(), warnings = [];
  const window = {
    API_BASE: "https://api.alphahusky.win",
    Telegram: { WebApp: { initData: tg, ready() {}, initDataUnsafe: {} } },
    __ahAlphaAccountSession: session ? { sessionToken: session } : null,
    AlphaHuskyCapp: native ? {
      isPackagedRuntime: () => true,
      apiPost: async (path, data) => ({ ok: true, native: true, path, data })
    } : null,
    __ahPerf: { now: () => 0, shouldApiLog: () => false }
  };
  vm.runInNewContext(earlyBootSource, {
    window, Date, setTimeout,
    sessionStorage: {
      getItem: k => stored.get(k) || null,
      setItem: (k, v) => stored.set(k, v)
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, text: async () => '{"ok":true}', json: async () => ({ ok: true }) };
    },
    console: { log() {}, warn: (...args) => warnings.push(args) }
  });
  return { window, captured: window.apiPost, calls, delegation, warnings };
}
{
  const t = earlyBootHarness();
  t.window.S = { apiPost: async (path, body) => {
    t.delegation.push({ path, body }); return { ok: true };
  }};
  const out = await t.captured("/webapp/faction/join", { faction: "rogue_byte" });
  assert.equal(out.ok, true);
  assert.equal(t.delegation.length, 1);
  assert.equal(t.delegation[0].path, "/webapp/faction/join");
  assert.equal(t.calls.length, 0, "late binding must use canonical client");
  assert.equal(t.warnings.length, 0, "late binding must not throw NO_UID");
}
{
  const t = earlyBootHarness({ session: "TEST_BROWSER_SECURE_SESSION" });
  const out = await t.captured("/webapp/faction/join", { faction: "rogue_byte" });
  assert.equal(out.ok, true);
  assert.equal(t.calls.length, 1);
  assert.equal(t.calls[0].options.headers.Authorization, "Bearer TEST_BROWSER_SECURE_SESSION");
  assert.equal(JSON.parse(t.calls[0].options.body).session_token, "TEST_BROWSER_SECURE_SESSION");
  assert.ok(!("init_data" in JSON.parse(t.calls[0].options.body)));
  assert.equal(t.warnings.length, 0);
}
{
  const t = earlyBootHarness({ tg: "TEST_TELEGRAM_SIGNED_INIT_DATA_12345" });
  await t.captured("/webapp/faction/join", { faction: "rogue_byte" });
  assert.equal(t.calls.length, 1);
  assert.equal(t.calls[0].options.headers.Authorization, "Bearer TEST_TELEGRAM_SIGNED_INIT_DATA_12345");
  assert.equal(JSON.parse(t.calls[0].options.body).init_data, "TEST_TELEGRAM_SIGNED_INIT_DATA_12345");
}
{
  const t = earlyBootHarness({ native: true });
  t.window.getInitDataSafe = async () => "";
  const out = await t.captured("/webapp/faction/join", { faction: "rogue_byte" });
  assert.equal(out.native, true, "standalone Android fallback must be preserved");
  assert.equal(t.calls.length, 0);
}

const profileSource = fs.readFileSync(new URL("../js/player_profile.js", import.meta.url), "utf8");
assert.match(profileSource, /\/webapp\/mobile\/link-code/);
assert.match(profileSource, /GENERATE BROWSER SYNC CODE/);
console.log("PASS: Browser Guest and Existing Telegram Sync Code isolation, creation and recovery");
