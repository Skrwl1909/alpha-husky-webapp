#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const src=fs.readFileSync(new URL("../js/ftue_growth_p3.js",import.meta.url),"utf8");
const story=fs.readFileSync(new URL("../js/story_delivery.js",import.meta.url),"utf8");
let graduate=true,calls=[],state={points:5,pets:{pets:{}}},refreshes=0;
const w={FirstSessionSpine:{view:()=>({complete:graduate})},StoryDelivery:{refreshHub:()=>{refreshes++}},apiPost:async(path)=>{
  calls.push(path);
  if(path==="/webapp/mystats/state")return {ok:true,data:{unspentPoints:state.points}};
  if(path==="/webapp/pets/state")return {ok:true,pets:state.pets};
  throw Error("unexpected endpoint");
}};
vm.runInNewContext(src,{window:w,console,Date,Promise,Number,Object},{filename:"ftue_growth_p3.js"});
const g=w.FtueGrowthP3;let count=0;async function check(name,fn){await fn();console.log("PASS",name);count++;}
await check("Hub return reads both canonical states",async()=>{await g.refreshOnReturn();assert.deepEqual(calls,["/webapp/mystats/state","/webapp/pets/state"]);assert.equal(g.choice().key,"growth-stats")});
await check("After spend, Hub return changes to Adoption without opening Stats",async()=>{state.points=0;await g.refreshOnReturn();assert.equal(g.choice().key,"growth-adopt")});
await check("Active companion does not force a pet task",async()=>{state.pets={pets:{a:{id:"a",is_active:true}}};await g.refreshOnReturn();assert.equal(g.choice(),null)});
await check("Unknown balance never invents stat points",async()=>{state.points=undefined;await g.refreshOnReturn();assert.equal(g.choice(),null)});
await check("Pre-graduation does not issue requests",async()=>{graduate=false;const before=calls.length;await g.refreshOnReturn();assert.equal(calls.length,before);assert.equal(g.choice(),null)});
await check("Return path waits for growth read",()=>{assert.match(story,/await global\.FtueGrowthP3\?\.refreshOnReturn\?\.\(\)/)});
await check("Read-only behavior preserves gameplay",()=>{assert.ok(!src.includes("/webapp/stats/upgrade"));assert.ok(!src.includes("/webapp/pets/set"));assert.ok(refreshes>0)});
console.log("FTUE P4",count,"PASS");
