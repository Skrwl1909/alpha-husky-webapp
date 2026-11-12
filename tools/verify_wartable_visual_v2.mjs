/** War Table Visual V2: real approved WebP bytes + authoritative mission mapping + rendered mobile Chromium. */
import assert from "node:assert/strict";
import {readFileSync,statSync,mkdtempSync,writeFileSync,rmSync,mkdirSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {pathToFileURL} from "node:url";
import {rolldown} from "rolldown";
import {createServer} from "vite";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const root="images/tactical_ops/presentation/command_deck/";
const files=[
 "operations/alpha_wartable_broken_signal_v1.webp",
 "operations/alpha_wartable_dead_relay_v1.webp",
 "operations/alpha_wartable_fracture_front_v1.webp",
 ...["recover","hold","survive","intercept","boss"].map(kind=>"mission_emblems/alpha_emblem_"+kind+"_v1_256.webp")
];
for(const f of files){
 const p=root+f,bytes=readFileSync(p);
 assert(bytes.length>1000 && bytes.length<320000,p+" unexpected delivery weight");
 assert.equal(bytes.subarray(0,4).toString(),"RIFF",p+" not RIFF WebP");
 assert.equal(bytes.subarray(8,12).toString(),"WEBP",p+" not WebP");
}
const temp=mkdtempSync(join(tmpdir(),"war-table-art-"));
try {
 const bundle=await rolldown({input:"tactical-ops-src/ui/operationArtwork.ts"});
 const output=await bundle.generate({format:"esm"});await bundle.close();
 const path=join(temp,"mapping.mjs");writeFileSync(path,output.output[0].code);
 const {operationArtwork}=await import(pathToFileURL(path).href);
 const m=(objectiveType,operationId="field-ops")=>({objectiveType,operationId,activity:operationId==="field-ops"?"FIELD_OP":"CANON",battlefield:operationId});
 for(const type of ["RECOVER","HOLD","SURVIVE","INTERCEPT","BOSS"]){
  const visual=operationArtwork(m(type));
  assert(visual.insignia.endsWith("/alpha_emblem_"+type.toLowerCase()+"_v1_256.webp"));
 }
 assert.equal(operationArtwork(m("RECOVER","dead-relay")).location,"dead-relay");
 assert.equal(operationArtwork(m("RECOVER","broken-signal")).location,"broken-signal");
 assert.equal(operationArtwork(m("RECOVER")).location,"field-ops");
 assert.equal(operationArtwork(m("ELIMINATE","broken-signal")).insignia,null,"no invented sixth emblem");
 // Actual field-relay-intercept is RECOVER; never infer objective from mission title.
 assert( operationArtwork({...m("RECOVER"),missionId:"field-relay-intercept"}).insignia.endsWith("recover_v1_256.webp"));
}finally {rmSync(temp,{recursive:true,force:true})}
const script=readFileSync("tools/verify_tactical_purpose_return_browser.mjs","utf8");
const match=script.match(/const entry=`([\s\S]*?)`;\nconst server/);
assert(match,"canonical browser fixture missing");
const fixture=match[1];
const server=await createServer({configFile:false,cacheDir:"node_modules/.vite-wartable-v2",optimizeDeps:{include:["react","react-dom/client","react/jsx-dev-runtime","lucide-react","zustand"]},
 server:{host:"127.0.0.1",port:0},
 plugins:[{name:"wartable-v2-fixture",configureServer(s){s.middlewares.use((req,res,next)=>{
  if(!req.url?.startsWith("/wartable-visual-fixture"))return next();
  res.setHeader("Content-Type","text/html");
  res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#020b14;font-family:Arial}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount"></div></div><script type="module" src="/@wartable-v2"></script>');
 })},resolveId(id){if(id==="/@wartable-v2")return "\0wartable-v2"},load(id){if(id==="\0wartable-v2")return fixture}}]});
await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
const out="artifacts/war-table-visual-v2";mkdirSync(out,{recursive:true});const cases=[];
try {
 for(const width of [320,360,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},hasTouch:true,reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.httpServer.address().port+"/wartable-visual-fixture?mode=command&profile=veteran");
  await page.locator("[data-primary-purpose] .t-wt-scene").waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,width+" Command horizontal overflow");
  const banner=page.locator("[data-primary-purpose] .t-wt-scene");
  assert((await banner.getAttribute("src")).endsWith("alpha_wartable_fracture_front_v1.webp"),"featured Field Op environment");
  assert.equal(await page.locator("[data-primary-purpose] .t-wt-mission-emblem").count(),1);
  await page.screenshot({path:out+"/"+width+"-command.png",fullPage:true});
  await page.getByRole("button",{name:/02 MISSIONS/}).click();
  const selectors=page.locator(".t-op-selector button");
  assert.equal(await selectors.count(),3);
  for(const [index,kind] of [[0,"recover"],[1,"hold"],[2,"survive"]]){
   await selectors.nth(index).click();
   const article=page.locator(".t-cd-selected-operation .t-wt-mission-card");
   const scene=article.locator(".t-wt-scene");
   const emblem=article.locator(".t-wt-mission-type .t-wt-mission-emblem");
   assert((await scene.getAttribute("src")).endsWith("alpha_wartable_fracture_front_v1.webp"));
   assert((await emblem.getAttribute("src")).endsWith("alpha_emblem_"+kind+"_v1_256.webp"),"actual mission objective emblem "+kind);
   await scene.scrollIntoViewIfNeeded();
   assert.equal(await scene.evaluate(e=>e.complete&&e.naturalWidth>0),true,"scene asset loaded "+kind);
   assert.equal(await emblem.evaluate(e=>e.complete&&e.naturalWidth>0),true,"emblem asset loaded "+kind);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,width+" mission overflow "+kind);
   assert.equal(await article.locator(".t-wt-mission-cta button").isEnabled(),true,"confirmed Field Op CTA preserved");
  }
  await selectors.first().click();
  await page.screenshot({path:out+"/"+width+"-missions.png",fullPage:true});
  await page.locator(".t-cd-selected-operation .t-wt-mission-cta button").click();
  const brief=page.locator(".t-deploy-hero .t-wt-scene");await brief.waitFor();
  assert((await brief.getAttribute("src")).endsWith("alpha_wartable_fracture_front_v1.webp"),"mission brief shares environment");
  assert.equal(await page.locator(".t-deploy-hero .t-wt-brief-emblem .t-wt-mission-emblem").count(),1);
  assert.equal(await page.getByRole("button",{name:/DEPLOY SQUAD/}).count(),1,"Deploy preserved");
  assert.deepEqual(errors,[],"no runtime errors");
  cases.push({width,command:true,missionTypes:["RECOVER","HOLD","SURVIVE"],brief:true});
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,reducedMotion:"reduce"});
 await page.goto("http://127.0.0.1:"+server.httpServer.address().port+"/wartable-visual-fixture?mode=command&profile=fresh");
 await page.getByRole("button",{name:/02 MISSIONS/}).click();
 assert.match(await page.locator(".t-wt-mission-state").innerText(),/AVAILABLE/,"fresh rotation state not faked");
 assert.equal(await page.locator(".t-wt-mission-state").getAttribute("data-availability"),"available");
 await page.close();
 writeFileSync(out+"/results.json",JSON.stringify({cases,notes:"Rendered Chromium and canonical-shaped synthetic account states; no physical device or backend tests."},null,2));
 console.log("PASS War Table Visual V2: 8 real assets, 5 mappings, 4 responsive widths, rendered scenes/emblems, selection/brief/deploy, availability truth");
}finally{await browser.close();await server.close()}
