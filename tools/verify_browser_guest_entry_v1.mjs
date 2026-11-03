import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Pure offline smoke suite: never touches production API or creates accounts.
const src = fs.readFileSync(new URL("../js/browser_guest_entry_v1.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

function boot({host="app.alphahusky.win",query="?browser_guest=1",telegram="",native=false,stored=null}={}) {
  let calls=0;
  const win={
    location:{hostname:host,search:query},
    Telegram:{WebApp:{initData:telegram}},
    Capacitor:native?{isNativePlatform:()=>true}:undefined,
    sessionStorage:{
      getItem:()=>stored?JSON.stringify(stored):null,
      setItem:()=>{throw new Error("unexpected write during boot")},
      removeItem:()=>{}
    },
    document:{
      readyState:"loading",
      addEventListener:()=>{}
    },
    fetch:()=>{calls++;throw new Error("unexpected network request")},
    dispatchEvent:()=>{}
  };
  vm.runInNewContext(src,{window:win,URLSearchParams,Date,Event});
  return {api:win.AlphaBrowserGuestV1,calls,session:win.__ahAlphaAccountSession};
}
assert.equal(boot({native:true,host:"localhost"}).api.active,false);
assert.equal(boot({telegram:"signed"}).api.active,false);
assert.equal(boot({query:""}).api.active,false);
assert.equal(boot({host:"untrusted.example"}).api.active,false);
assert.equal(boot().api.shouldHoldBoot(),true);
const resumed=boot({stored:{token:"FAKE_TOKEN",expiresAt:Date.now()+3600000}});
assert.equal(resumed.api.shouldHoldBoot(),false);
assert.equal(resumed.session.sessionToken,"FAKE_TOKEN");
assert.equal(resumed.calls,0);
assert.match(html,/browser_guest_entry_v1\.js/);
assert.match(html,/AlphaBrowserGuestV1\?\.shouldHoldBoot/);
assert.match(html,/ah:browser-guest-ready/);
console.log("PASS: browser guest opt-in, native/Telegram isolation, session resume, boot gate");
