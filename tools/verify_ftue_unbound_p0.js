import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read = p => fs.readFileSync(new URL("../js/"+p, import.meta.url),"utf8");
const w={localStorage:{getItem:()=>null,setItem:()=>{}},addEventListener(){}};
const env={window:w,document:{readyState:"loading",addEventListener(){}},console};
vm.createContext(env);
vm.runInContext(read("story_delivery.js"),env);
vm.runInContext(read("scout_guide.js"),env);
let count=0;
const check=(name,fn)=>{fn();console.log("PASS",name);count++;};
for(const faction_selected of [false,true]){
 for(const [state,status,id,beat] of [
 ["NOT_STARTED","","S-FS-NOT-STARTED",1],
 ["MISSION_STARTED","RUNNING","S-FS-RUNNING",0],
 ["MISSION_STARTED","READY","S-FS-READY",2],
 ["REWARD_RECEIVED","","S-FS-REWARD",4]
 ]){
  check(String(faction_selected)+" "+state+" "+status,()=>{
    const firstSignal={eligible:true,faction_selected,state,status};
    const r=w.StoryDelivery.resolve({firstSignal});
    assert.equal(r.id,id);
    assert.equal(r.target.action,"first_signal");
    assert.equal(w.ScoutGuide.resolve({firstSignal}),beat);
  });
 }
}
check("Equip precedes faction handoff",()=>{
 const firstSignal={eligible:true,faction_selected:false,state:"COMPLETED",world_discovery:"pending"};
 const r=w.StoryDelivery.resolve({firstSignal});
 assert.equal(r.id,"S-FS-FACTION-HANDOFF");
 assert.equal(r.target.action,"factions");
 assert.equal(w.ScoutGuide.resolve({firstSignal}),0);
});
check("Faction-bound world lead preserved",()=>{
 const firstSignal={eligible:true,faction_selected:true,state:"COMPLETED",world_discovery:"pending"};
 assert.equal(w.StoryDelivery.resolve({firstSignal}).id,"S-FS-WORLD");
 assert.equal(w.ScoutGuide.resolve({firstSignal}),64);
});
check("No eligibility means no new First Signal Scout beat",()=>{
 assert.equal(w.ScoutGuide.resolve({firstSignal:{eligible:false,faction_selected:false,state:"NOT_STARTED"}}),0);
});
check("P3-P4 hooks unchanged",()=>{
 const s=read("story_delivery.js");
 assert.ok(s.includes("FtueGrowthP3?.choice?.()"));
 assert.ok(s.includes("FtueGrowthP3?.refreshOnReturn?.()"));
 assert.ok(s.includes("FirstSessionSpine?.choice"));
});
console.log("UNBOUND",count,"PASS (mock only)");
