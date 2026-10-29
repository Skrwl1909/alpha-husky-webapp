#!/usr/bin/env node
/** Contract gate for presentation-owned Signal Atlas V2. NO synthetic gameplay writes. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server=await createServer({configFile:false,resolve:{preserveSymlinks:true},ssr:{external:['react','react-dom','zustand']},server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
  const atlas=await server.ssrLoadModule("/tactical-ops-src/ui/signalAtlas/model.ts");
  const { HERO_PATHS,HERO_SKILLS,UPGRADES,growthHero }=await server.ssrLoadModule("/tactical-ops-src/data/playerGrowth.ts");
  const { growthPreviewBase }=await server.ssrLoadModule("/tactical-ops-src/data/buildPreview.ts");
  assert.equal(atlas.assertAtlasManifest(),true,"Every currently authored skill belongs to one sector");
  assert.equal(Object.keys(atlas.ATLAS_SECTORS).length,3);
  for (const sectors of Object.values(atlas.ATLAS_SECTORS)) for (const sector of sectors)
    assert.match(sector.emblemSrc,/^\/images\/tactical_ops\/signal_atlas\/v1\/sectors\/emblem_(assault|command|pursuit|control|front_line|support)\.webp$/);

  assert.equal(UPGRADES.length,18,"Only existing 18 rank upgrades are allowed");
  for(const [id,sectors] of Object.entries(atlas.ATLAS_SECTORS)){
    assert.equal(sectors.length,2);
    assert.deepEqual(sectors.flatMap(s=>s.skillIds).sort(),[...HERO_SKILLS[id]].sort());
    assert.equal(HERO_PATHS[id].length,2);
  }
  const empty=(id)=>({heroId:id,discipline:null,ranks:{},respecUsed:false});
  const alpha=empty("alpha");
  assert.equal(atlas.getNodeView("alpha","alpha-strike",0,alpha,"vanguard",0).state,"base");
  assert.equal(atlas.getNodeView("alpha","alpha-strike",1,alpha,"vanguard",1).state,"available");
  assert.equal(atlas.getNodeView("alpha","alpha-strike",2,alpha,"vanguard",2).state,"needs-rank-one");
  assert.equal(atlas.getNodeView("alpha","alpha-strike",1,alpha,"vanguard",0).state,"no-points");
  assert.equal(atlas.getNodeView("alpha","alpha-strike",1,null,"vanguard",3).state,"unavailable");
  // Exercise both saved growth contracts, including previously owned MEND R1.
  for(const version of [1,2])for(const path of ['sentinel','medic'])for(const selected of [null,'A','B'])for(const current of [0,1]){
    const hero=growthHero({version,heroes:[{...empty('ally-03'),discipline:path,ranks:current?{'u03-mend':1}:{}}]},'ally-03');
    const choices={packMastery:{'ally-03':{progress:selected?8:0,stage:selected?3:0,selected,unlockedOptions:selected?['A','B']:[]}}};
    const node=atlas.getNodeView('ally-03','u03-mend',current+1,hero,path,2,growthPreviewBase('u03-mend',choices));
    const effective=version===2||(path==='sentinel'&&selected!=='A'&&current===0);
    assert.equal(node.state,effective?'available':'no-effect',JSON.stringify({version,path,selected,current}));
    if(!effective){assert.equal(node.changes.length,0);assert.match(node.reason,/minimum cooldown/);}
  }
  assert.equal(atlas.getNodeView("alpha","alpha-strike",1,{...alpha,discipline:"howlkeeper"},"vanguard",2).state,"different-discipline");
  const r1={...alpha,discipline:"vanguard",ranks:{"alpha-strike":1}};
  for(const version of [1,2])for(const state of [
    {activeRunId:'foundation'},
    {operations:{'broken-signal':{activeMissionRun:null},'dead-relay':{activeMissionRun:{runId:'campaign'}}}},
    {fieldOps:{activeMissionRun:{runId:'field'}}},
    {chapterActiveMission:{runId:'chapter'}},
    {tacticalChapter:{activeRunId:'chapter'}},
  ]){
    const frozen=JSON.stringify(state);
    assert(atlas.hasActiveGrowthRun(state));
    const hero={...r1,rulesVersion:version};
    assert.equal(atlas.getNodeView('alpha','alpha-strike',2,hero,'vanguard',5,undefined,atlas.hasActiveGrowthRun(state)).state,'active-run');
    assert.equal(atlas.getNodeView('alpha','alpha-strike',1,hero,'vanguard',5,undefined,true).state,'recorded');
    assert.equal(JSON.stringify(state),frozen,'eligibility never changes the accepted run');
  }
  assert.equal(atlas.hasActiveGrowthRun(null),false);
  assert.equal(atlas.hasActiveGrowthRun({activeRunId:null,operations:{'broken-signal':{activeMissionRun:null}},fieldOps:{activeMissionRun:null}}),false);
  assert.equal(atlas.getNodeView("alpha","alpha-strike",1,r1,"vanguard",0).state,"recorded");
  assert.equal(atlas.getNodeView("alpha","alpha-strike",2,r1,"vanguard",2).state,"available");
  assert.deepEqual(atlas.nextSkillChanges("alpha-strike",2,r1,"vanguard"),["RANGE 2 → 3"]);
  assert.equal(atlas.getNodeView("alpha","alpha-strike",2,{...r1,ranks:{"alpha-strike":2}},"vanguard",0).state,"maxed");
  assert.equal(atlas.getNodeView("ally-03","u03-mend",1,{...empty("ally-03"),discipline:"medic"},"medic",2).state,"no-effect","MEDIC baseline has capped cooldown");
  assert.equal(atlas.getNodeView("ally-03","u03-mend",2,{...empty("ally-03"),discipline:"sentinel",ranks:{"u03-mend":1}},"sentinel",2).state,"no-effect","MEND R2 currently zero delta");
  for(let n=1;n<=3;n++) {
    const positions=Array.from({length:n},(_,i)=>atlas.atlasSectorPosition(i,n));
    for(const p of positions)assert(p.x>=9 && p.x<=91 && p.y>=9 && p.y<=91);
    assert.equal(new Set(positions.map(p=>p.x+":"+p.y)).size,n,"Released sectors need distinct anchors");
  }
  const overview=readFileSync("tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx","utf8");
  assert(overview.includes("visibleSectors") && overview.includes("sectorPageCount"),"New sectors must paginate instead of overlapping a fixed atlas");
  const demo=atlas.demoLayout(50);
  assert.equal(demo.length,50);assert.equal(new Set(demo.map(n=>n.id)).size,50);
  for(let i=0;i<demo.length;i++)for(let j=i+1;j<demo.length;j++){
    const d=Math.hypot(demo[i].x-demo[j].x,demo[i].y-demo[j].y);
    assert(d>42,`demo nodes ${i} and ${j} overlap`);
  }
  assert.throws(()=>atlas.demoLayout(501));
  const ui=readFileSync("tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx","utf8");
  const skillbook=readFileSync("tactical-ops-src/ui/Skillbook.tsx","utf8");
  assert(skillbook.includes('<SignalAtlas onClose={onClose} />'),"Official Skillbook always renders Atlas");
  assert(!/atlasOpen|BetaAllowed|localStorage|signalAtlasBeta|t-growth-panel/.test(skillbook),"No beta gate or legacy purchase UI");
  assert(ui.includes("useBattleStore") && ui.includes("await upgrade(") && ui.includes("await respec("),"Real authenticated store actions");
  assert(ui.includes("current.progression.revision>captured.revision") && ui.includes("saved?.ranks[captured.skillId]"),"Upgrade acknowledgment must be canonical");
  assert(ui.includes("SERVER RECORDED") && ui.includes("getNodeView("));
  assert(!ui.includes("localStorage") && !ui.includes("sessionStorage"),"No client-side progress ownership");
  // Actual React SSR smoke test catches runtime import/render failures beyond string checks.
  const uiModule=await server.ssrLoadModule("/tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx");
  const html=renderToStaticMarkup(React.createElement(uiModule.SignalAtlas,{onClose:()=>undefined}));
  assert(html.includes("THE SIGNAL ATLAS") && html.includes("ASSAULT") && html.includes("COMMAND"),"Atlas must render with its live sectors even before login");
  assert(html.includes("NOT RELEASED"),"Reservation legend must not mislabel future content as locked rewards");
  const official=await server.ssrLoadModule('/tactical-ops-src/ui/Skillbook.tsx');
  const officialHtml=renderToStaticMarkup(React.createElement(official.SkillbookPanel,{onClose:()=>undefined}));
  assert.equal((officialHtml.match(/class="tsa-root"/g)||[]).length,1);
  assert(!/OPEN SIGNAL ATLAS|BETA|t-growth-panel/.test(officialHtml),'Only official Atlas renders with no query or storage opt-in');
    const hostStyles=readFileSync("tactical-ops-src/styles.ts","utf8");
  assert(hostStyles.includes("signalAtlas.css?raw"),"Atlas CSS must be injected by Tactical host, not extracted into unused standalone stylesheet");
  assert(!ui.includes('import "./signalAtlas.css"'),"No external CSS import in IIFE component");
  const app=readFileSync('tactical-ops-src/ui/App.tsx','utf8');
  assert(app.includes('<SkillbookPanel onClose={() => setDeckTab("command")} />'),"Atlas closes to War Table Command");
  assert(app.includes('>SIGNAL ATLAS</button>') && app.includes('>PACK MASTERY</button>'),"Official Skillbook and separate mastery remain accessible");
  assert(ui.includes('src={s.emblemSrc}') && ui.includes('data-art-failed'),"Atlas must use sector artwork with fallback");
  assert(ui.includes('className="tsa-rank-stamp"') && ui.includes('tacticalActionImageForSkill(skillId)'),"Premium nodes reuse authored skill art and separate rank state");
  assert(ui.includes('tsa-detail-toggle') && ui.includes('is-compact'),"Sector density can switch without hiding skill ownership");
  const css=readFileSync("tactical-ops-src/ui/signalAtlas/signalAtlas.css","utf8");
  assert(css.includes(".t-command-nav {position:relative;top:auto"),"Atlas avoids overlapping sticky War Table header");
  assert(css.includes("command_room.webp") && css.includes(".tsa-rank-stamp"),"Premium frame and authentic icon state polish");
  assert(css.includes("@media(max-width:380px)") && css.includes("prefers-reduced-motion"));
  console.log("PASS SIGNAL ATLAS V2 (React SSR): 3 heroes, 6 live UI sectors, 9 canonical skills, 18 ranks, all receipt/availability states, zero-effect gate, 50 demo-node layout, real store wiring");
}finally{await server.close();}
