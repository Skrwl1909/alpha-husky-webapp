/** Real P5 component/store fixtures. No API, account writes or feature activation. */
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {createServer} from 'vite';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const phase = process.env.MOBILE_PHASE || 'after';
const out = process.env.MOBILE_OUT || `artifacts/mobile-playability/${phase}`;
mkdirSync(out, {recursive:true});
const server = await createServer({configFile:false, cacheDir:'node_modules/.vite-p5',
  optimizeDeps:{include:['react','react-dom/client','react/jsx-dev-runtime','lucide-react','zustand']},
  server:{host:'127.0.0.1',port:0}, plugins:[{name:'mobile-playability-fixture',configureServer(s){
    s.middlewares.use((req,res,next)=>{
      if(!req.url?.startsWith('/mobile-fixture')) return next();
      res.setHeader('Content-Type','text/html');
      res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}#mount{height:100%}</style><div id="tacticalOpsRoot" data-open="1" data-layout="compact"><div class="t-shell" data-screen="battle"><div id="mount"></div></div></div><script type="module" src="/tools/fixtures/battlefield-p5.tsx"></script>');
    });
  }}]});
await server.listen();
const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,
  args:['--no-sandbox','--disable-dev-shm-usage']});
const page = await browser.newPage({hasTouch:true, reducedMotion:'reduce'});
const errors = [], results = [], cooldownChecks = [], completionChecks = [];
page.on('pageerror',e=>errors.push(String(e)));
async function measure(){return page.evaluate(()=>{
  const rect = e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const text = e=>{
    const range=document.createRange(); range.selectNodeContents(e);
    const ink=range.getBoundingClientRect(), box=e.getBoundingClientRect();
    const parent=e.closest('button').getBoundingClientRect();
    return {text:e.textContent,box:rect(e),inkWidth:ink.width,inkHeight:ink.height,
      clipped:ink.left<Math.max(box.left,parent.left)-.5 || ink.right>Math.min(box.right,parent.right)+.5 ||
        ink.top<Math.max(box.top,parent.top)-.5 || ink.bottom>Math.min(box.bottom,parent.bottom)+.5};
  };
  const field=document.querySelector('.t-field'), dock=document.querySelector('.t-dock');
  const inputs=[...document.querySelectorAll('.t-cell,.t-unit-hit')].filter(e=>!e.disabled);
  const hits=inputs.map(e=>{const r=e.getBoundingClientRect(), hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {label:e.getAttribute('aria-label'),...rect(e),covered:hit!==e&&!e.contains(hit)};});
  const overlaps=[];
  for(let i=0;i<hits.length;i++) for(let j=i+1;j<hits.length;j++){
    const a=hits[i],b=hits[j];
    if(Math.min(a.x+a.width,b.x+b.width)>Math.max(a.x,b.x)+.1 && Math.min(a.y+a.height,b.y+b.height)>Math.max(a.y,b.y)+.1) overlaps.push([a.label,b.label]);
  }
  return {grid:fixture.grid(),field:rect(field),dock:rect(dock),
    objective:[...document.querySelectorAll('.t-obj-chip strong,.t-objective-summary')].map(text),
    recover:[...document.querySelectorAll('.t-act-obj .name,.t-act-obj .meta')].map(text),
    skillNames:[...document.querySelectorAll('.t-act:not(.t-act-obj) .name')].map(text),
    skillStates:[...document.querySelectorAll('.t-act:not(.t-act-obj) .meta,.t-act .cd')].map(text),
    dockButtons:[...dock.querySelectorAll('button')].map(e=>({label:e.getAttribute('aria-label'),...rect(e)})),
    hits,overlaps,threats:document.querySelectorAll('.t-threat-tile').length,
    bodies:[...document.querySelectorAll('.t-token img.body')].map(e=>({loaded:e.complete&&e.naturalWidth>0,...rect(e)})),
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
    verticalOverflow:document.documentElement.scrollHeight>innerHeight+1};
});}
try{
  for(const [w,h] of [[320,568],[360,780],[390,844],[430,932]]){
    for(const legacy of [false,true]) for(const scene of ['hold','intercept','recover','recover-jammed','recover-distant']){
      const params=new URLSearchParams({scene:scene==='recover-distant'?'recover':scene});
      if(legacy) params.set('v1','1');
      if(!legacy && ['hold','intercept'].includes(scene)) params.set('threat','2');
      await page.setViewportSize({width:w,height:h});
      await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/mobile-fixture?${params}`);
      await page.locator('.t-act').first().waitFor();
      await page.evaluate(()=>document.fonts.ready);
      // Emulate host-provided chrome and gesture insets on both grid versions.
      await page.addStyleTag({content:'#tacticalOpsRoot{--ah-chrome-top:32px;--ah-safe-bottom:24px;--ah-safe-left:6px;--ah-safe-right:6px}'});
      if(scene==='recover-distant') await page.evaluate(()=>{
        const s=fixture.store,b=s.getState().battle;
        s.setState({battle:{...b,units:b.units.map(u=>u.id==='alpha'?{...u,c:0,r:0}:u)}});
      });
      await page.evaluate(()=>fixture.geometry());
      await page.waitForTimeout(120);
      const label=`${w}x${h}-${legacy?'legacy':'vnext'}-${scene}`;
      const m={label,...await measure()}; results.push(m);
      assert.equal(m.grid.cols,legacy?8:10); assert.equal(m.grid.rows,legacy?5:7);
      assert.equal(m.overlaps.length,0,label+' overlapping board targets');
      assert.equal(m.hits.filter(x=>x.covered).length,0,label+' covered target centers');
      assert(!m.horizontalOverflow&&!m.verticalOverflow,label+' page scroll');
      assert(m.bodies.every(b=>b.loaded),label+' missing character art');
      assert(m.dockButtons.every(b=>b.width>=44&&b.height>=44),label+' dock target below 44px');
      assert(m.dockButtons.every(b=>b.y>=32&&b.y+b.height<=h-24+.5),label+' unsafe dock bounds');
      if(phase==='after'){
        assert(m.recover.every(t=>!t.clipped),label+' clipped RECOVER command/state');
        assert(m.skillNames.every(t=>!t.clipped),label+' clipped ALPHA skill label');
        assert(m.objective.every(t=>!t.clipped),label+' clipped objective');
        assert.notEqual(m.objective[0].text,m.objective[1].text,label+' duplicate objective/status');
      }
      // Paired evidence at every requested width plus both accepted grids at 320px.
      if(scene==='recover' || scene==='recover-jammed' || (w===320&&scene==='hold') || (w===360&&!legacy&&scene==='intercept'))
        await page.screenshot({path:`${out}/${label}.png`});
      if(scene==='recover' || scene==='recover-jammed'){
        const recover=page.getByRole('button',{name:/^Recover/});
        assert.equal(await recover.isEnabled(),scene==='recover',label+' engine-owned readiness');
        const before=await measure();
        await page.locator('.t-obj-chip').click();
        if(scene==='recover'){
          await page.evaluate(()=>{
            const s=fixture.store,b=s.getState().battle;
            s.setState({battle:{...b,units:b.units.map(u=>u.id==='alpha'?{...u,cooldowns:{'alpha-rend':2}}:u)}});
          });
          const cooling=await measure();
          cooldownChecks.push({label,labels:cooling.skillNames,states:cooling.skillStates});
          if(phase==='after') assert([...cooling.skillNames,...cooling.skillStates].every(t=>!t.clipped),label+' clipped cooldown card');
        }
        const expanded=await measure();
        if(scene==='recover-jammed' && w===390 && !legacy) await page.screenshot({path:`${out}/${label}-window-detail.png`});
        assert.deepEqual(expanded.field,before.field,label+' objective details moved board');
        assert.deepEqual(expanded.dock,before.dock,label+' objective details moved dock');
        await page.locator('.t-obj-chip').click();
        if(scene==='recover'){
          await recover.click();
          assert(await page.evaluate(()=>fixture.store.getState().battle.objective.completed),label+' real recovery did not complete');
          const completed=await measure();
          completionChecks.push({label,objective:completed.objective});
          if(phase==='after'){
            assert.equal(completed.objective[0].text,'RELAY RECOVERED');
            assert.equal(completed.objective[1].text,'OBJECTIVE COMPLETE');
            assert(completed.objective.every(t=>!t.clipped),label+' clipped completed objective');
          }
          assert.equal(await page.locator('.t-act-obj').count(),0,label+' stale recovery action');
        }
      }
    }
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS mobile playability ${phase}: ${results.length} cases, ${cooldownChecks.length} cooldown checks, ${completionChecks.length} engine recovery completions; both grids, four widths, host insets, glyph bounds, inputs and art loading.`);
}finally{
  writeFileSync(`${out}/results.json`,JSON.stringify({phase,browser:browser.version(),results,cooldownChecks,completionChecks,errors,
    limits:'Headless Chromium touch emulation. Fixture positions; no server, physical-device or human usability certification.'},null,2));
  await page.close(); await browser.close(); await server.close();
}
