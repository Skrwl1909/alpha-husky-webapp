#!/usr/bin/env node
// FTUE P3 growth choice checks: snapshots only, no writes or accounts.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const src=fs.readFileSync(new URL("../js/ftue_growth_p3.js",import.meta.url),"utf8");
let isGraduate=false,refreshes=0,opened=0;
const w={ FirstSessionSpine:{view:()=>({complete:isGraduate})},
 StoryDelivery:{refreshHub:()=>{refreshes++}},
 ContextualDiscovery:{openDestination:async()=>{opened++;return true}},
 MyPets:{open:async()=>{opened++}},Adopt:{open:async()=>{opened++}},
 HomeNav:{closeAll:()=>{}} };
vm.runInNewContext(src,{window:w}, {filename:"ftue_growth_p3.js"});
let tests=0; const check=(label,fn)=>{fn();tests++;console.log("PASS",label);};
check("Before graduation no growth lead",()=>{w.FtueGrowthP3.observeStats({unspentPoints:5});assert.equal(w.FtueGrowthP3.choice(),null)});
isGraduate=true;
check("Confirmed unspent points take priority",()=>{assert.equal(w.FtueGrowthP3.choice().key,"growth-stats")});
check("Stats route calls navigation once",async()=>{assert.equal(await w.FtueGrowthP3.open("stats"),true);assert.equal(opened,1)});
w.FtueGrowthP3.observeStats({unspentPoints:0});
check("Unknown pets produce no invented ownership",()=>assert.equal(w.FtueGrowthP3.choice(),null));
w.FtueGrowthP3.observePets({pets:{}});
check("No pets suggest Adoption Center",()=>{const c=w.FtueGrowthP3.choice();assert.equal(c.key,"growth-adopt");assert.equal(c.destination,"adopt")});
w.FtueGrowthP3.observePets({pets:{a:{id:"a",is_active:false}}});
check("Unequipped pet suggests Pets",()=>assert.equal(w.FtueGrowthP3.choice().key,"growth-pets"));
w.FtueGrowthP3.observePets({pets:{a:{id:"a",is_active:true}}});
check("Equipped companion creates no forced next task",()=>assert.equal(w.FtueGrowthP3.choice(),null));
check("Unknown stat balance cannot imply points",()=>{w.FtueGrowthP3.observeStats({});assert.equal(w.FtueGrowthP3.choice(),null)});
check("No economy write or gameplay effect in P3 module",()=>{assert.ok(!src.includes("/webapp/stats/upgrade"));assert.ok(!src.includes("/webapp/pets/set"));assert.ok(!src.includes("/webapp/forge/upgrade"))});
check("Return to Hub observes change without overwriting progress",()=>{assert.ok(refreshes>0);assert.ok(!src.includes("localStorage"))});
console.log("FTUE Growth P3",tests,"checks PASS");
