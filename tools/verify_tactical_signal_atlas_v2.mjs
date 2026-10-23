#!/usr/bin/env node
/** Contract gate for presentation-owned Signal Atlas V2. NO synthetic gameplay writes. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
  const atlas=await server.ssrLoadModule("/tactical-ops-src/ui/signalAtlas/model.ts");
  const { HERO_PATHS,HERO_SKILLS,UPGRADES }=await server.ssrLoadModule("/tactical-ops-src/data/playerGrowth.ts");
  assert.equal(atlas.assertAtlasManifest(),true,"Every currently authored skill belongs to one sector");
  assert.equal(Object.keys(atlas.ATLAS_SECTORS).length,3);
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
  assert.equal(atlas.getNodeView("alpha","alpha-strike",1,{...alpha,discipline:"howlkeeper"},"vanguard",2).state,"different-discipline");
  const r1={...alpha,discipline:"vanguard",ranks:{"alpha-strike":1}};
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
  const classic=readFileSync("tactical-ops-src/ui/Skillbook.tsx","utf8");
  assert(classic.includes("SignalAtlas") && classic.includes("atlasOpen"));
  assert(classic.includes("delta.length > 0") && classic.includes("Purchase disabled pending balance review"),"Classic Skillbook must also block zero-effect rank purchases");
  assert(ui.includes("useBattleStore") && ui.includes("await upgrade(") && ui.includes("await respec("),"Real authenticated store actions");
  assert(ui.includes("current.progression.revision>captured.revision") && ui.includes("saved?.ranks[captured.skillId]"),"Upgrade acknowledgment must be canonical");
  assert(ui.includes("SERVER RECORDED") && ui.includes("getNodeView("));
  assert(!ui.includes("localStorage") && !ui.includes("sessionStorage"),"No client-side progress ownership");
  const css=readFileSync("tactical-ops-src/ui/signalAtlas/signalAtlas.css","utf8");
  assert(css.includes("@media(max-width:380px)") && css.includes("prefers-reduced-motion"));
  console.log("PASS SIGNAL ATLAS V2: 3 heroes, 6 live UI sectors, 9 canonical skills, 18 ranks, all receipt/availability states, zero-effect gate, 50 demo-node layout, real store wiring");
}finally{await server.close();}
