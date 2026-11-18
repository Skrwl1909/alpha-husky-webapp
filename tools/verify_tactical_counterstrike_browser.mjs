import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {createServer} from "vite";
import {counterstrikeBrowserFixture} from "./counterstrike_browser_fixture.mjs";
const {chromium}=await import("playwright");
const providedApi=process.env.COUNTERSTRIKE_API;
let api=providedApi;
const entry=String.raw`
window.apiPost=async(path,body={})=>{
 const response=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json","X-Synthetic-Auth":"fixture"},body:JSON.stringify(body)});
 const data=await response.json();
 if(!response.ok)throw Object.assign(Error(data.code),{status:response.status,data});
 return data;
};
await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src="/js/tactical_ops.js";script.onload=resolve;script.onerror=reject;document.head.append(script);});
window.TacticalOps.init({apiPost:window.apiPost});await window.TacticalOps.open();
`;
const server=await createServer({configFile:false,server:{host:"127.0.0.1",port:0,hmr:false,proxy:providedApi?{"/webapp":providedApi}:{}},plugins:[{
 name:"counterstrike-browser",
 configureServer(s){if(!providedApi)s.middlewares.use(counterstrikeBrowserFixture(s));s.middlewares.use((req,res,next)=>{if(req.url?.startsWith("/counterstrike-fixture")){
 res.setHeader("Content-Type","text/html; charset=utf-8");
 res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14}</style><script type="module" src="/@counterstrike"></script>');
 }else next();});},
 resolveId(id){if(id==="/@counterstrike")return "\0counterstrike";},
 load(id){if(id==="\0counterstrike")return entry;}
}]});
await server.listen();
if(!api)api="http://127.0.0.1:"+server.httpServer.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE,args:["--no-sandbox"]});
const errors=[],rows=[];
const out=providedApi?"artifacts/counterstrike/private-browser":"artifacts/counterstrike/browser";mkdirSync(out,{recursive:true});
try{
 for(const width of [320,390,430]){
  const consumed=width===390;
  await fetch(api+"/fixture/reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consumed})});
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},hasTouch:true,reducedMotion:"reduce"});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.httpServer.address().port+"/counterstrike-fixture");
  await page.getByRole("button",{name:"VIEW FALSE RELAY BRIEF",exact:true}).click();
  const brief=page.getByRole("region",{name:"False Relay mission brief"});
  await page.getByRole("button",{name:"DEPLOY FALSE RELAY",exact:true}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:out+"/"+width+"-brief.png"});
  await page.getByRole("button",{name:"DEPLOY FALSE RELAY",exact:true}).click();
  const commands=(await (await fetch(api+"/fixture/trace?consumed="+(consumed?"1":"0"))).json()).commands;
  const slot={"alpha-strike":"A1","alpha-rend":"A2","alpha-howl":"A3","u02-shot":"A1","u02-burst":"A2","u02-suppress":"A3","u03-tap":"A1","u03-mend":"A2","u03-pack":"A3"};
  async function ready(){await page.locator(".t-actions .t-act:not(:disabled)").first().waitFor();}
  await ready();
  assert((await page.getByRole("status",{name:"False Relay signal"}).innerText()).includes(consumed?"rounds 3 and 5":"rounds 4 and 6"));
  for(let i=0;i<commands.length;i++){
   const cmd=commands[i];
   if(cmd.type==="move")await page.getByRole("button",{name:new RegExp("^Move to "+cmd.c+","+cmd.r+"(?:\\.|$)")}).dispatchEvent("click");
   else if(cmd.type==="skip")await page.keyboard.press("s");
   else{
    await page.getByRole("button",{name:new RegExp("^"+slot[cmd.skillId]+" ")}).dispatchEvent("click");
    if(cmd.targetId)await page.locator('[data-unit-id="'+cmd.targetId+'"]').dispatchEvent("click");
   }
   if(i<commands.length-1)await ready();
   if(i===8){
    await page.reload();
    await page.getByRole("button",{name:"RESUME FALSE RELAY",exact:true}).click();
    await page.getByRole("button",{name:"RESUME ACCEPTED RUN",exact:true}).click();await ready();
   }
   if(i===12)await page.screenshot({path:out+"/"+width+"-battle.png"});
  }
  await page.getByRole("region",{name:"False Relay aftermath"}).waitFor();
  assert.match(await page.getByRole("region",{name:"False Relay aftermath"}).innerText(),/Server recorded victory/);
  assert.equal(await page.getByRole("button",{name:/NEXT AVAILABLE/}).count(),1);
  await page.screenshot({path:out+"/"+width+"-aftermath.png"});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole("button",{name:"WAR TABLE / ARCHIVE",exact:true}).click();
  await page.getByRole("button",{name:"04 ARCHIVE",exact:true}).click();
  assert.match(await page.getByRole("region",{name:"Counterstrike archive"}).innerText(),/First clear recorded/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:out+"/"+width+"-archive.png"});
  rows.push({width,consumed,commands:commands.length,reload:true,recorded:true});await page.close();
 }
 assert.deepEqual(errors,[]);console.log("PASS COUNTERSTRIKE browser",JSON.stringify(rows));
}finally{
 writeFileSync(out+"/results.json",JSON.stringify({rows,errors,browser:browser.version(),transport:providedApi?"private Python fixture with synthetic identity":"synthetic host with real encounter engine"},null,2));
 await browser.close();await server.close();
}
