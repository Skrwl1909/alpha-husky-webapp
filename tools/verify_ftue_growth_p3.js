#!/usr/bin/env node
// FTUE P3 growth choice checks: snapshots only, no writes or accounts.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const src=fs.readFileSync(new URL("../js/ftue_growth_p3.js",import.meta.url),"utf8");
let isGraduate=false,refreshes=0,opened=0;
const w={ FirstSessionSpine:{view:()=>({complete:isGraduate})},
 StoryDelivery:{refreshHub:()=>{refreshes++}},
 Stats:{open:async({tab})=>{assert.equal(tab,"build");opened++;}},
 MyPets:{open:async()=>{opened++}},Adopt:{open:async()=>{opened++}},
 HomeNav:{closeAll:()=>{}} };
vm.runInNewContext(src,{window:w}, {filename:"ftue_growth_p3.js"});
let tests=0; const check=async(label,fn)=>{await fn();tests++;console.log("PASS",label);};
await check("Before graduation no growth lead",()=>{w.FtueGrowthP3.observeStats({unspentPoints:5});assert.equal(w.FtueGrowthP3.choice(),null)});
isGraduate=true;
await check("Confirmed unspent points take priority",()=>{assert.equal(w.FtueGrowthP3.choice().key,"growth-stats")});
await check("Stats route calls navigation once",async()=>{assert.equal(await w.FtueGrowthP3.open("stats"),true);assert.equal(opened,1)});
w.FtueGrowthP3.observeStats({unspentPoints:0});
await check("Unknown pets produce no invented ownership",()=>assert.equal(w.FtueGrowthP3.choice(),null));
w.FtueGrowthP3.observePets({pets:{}});
await check("No pets suggest Adoption Center",()=>{const c=w.FtueGrowthP3.choice();assert.equal(c.key,"growth-adopt");assert.equal(c.destination,"adopt")});
w.FtueGrowthP3.observePets({pets:{a:{id:"a",is_active:false}}});
await check("Unequipped pet suggests Pets",()=>assert.equal(w.FtueGrowthP3.choice().key,"growth-pets"));
w.FtueGrowthP3.observePets({pets:{a:{id:"a",is_active:true}}});
await check("Equipped companion creates no forced next task",()=>assert.equal(w.FtueGrowthP3.choice(),null));
await check("Unknown stat balance cannot imply points",()=>{w.FtueGrowthP3.observeStats({});assert.equal(w.FtueGrowthP3.choice(),null)});
await check("No economy write or gameplay effect in P3 module",()=>{assert.ok(!src.includes("/webapp/stats/upgrade"));assert.ok(!src.includes("/webapp/pets/set"));assert.ok(!src.includes("/webapp/forge/upgrade"))});
await check("Return to Hub observes change without overwriting progress",()=>{assert.ok(refreshes>0);assert.ok(!src.includes("localStorage"))});
await check("Daily quest hints require genuinely ready/available status in all recognized formats",()=>{
 const discovery=fs.readFileSync(new URL("../js/contextual_discovery.js",import.meta.url),"utf8");
 assert.ok(discovery.includes("grouped.ready"));
 assert.ok(discovery.includes("grouped.available"));
 assert.ok(discovery.includes('["ready", "available"].includes(status)'));
});
await check("Long-term pursuit stays visible alongside growth lead",()=>{
 const pursuit=fs.readFileSync(new URL("../js/active_pursuit.js",import.meta.url),"utf8");
 for(const k of ["growth-stats","growth-adopt","growth-pets"]) assert.ok(pursuit.includes('"'+k+'"'));
});
console.log("FTUE Growth P3",tests,"checks PASS");
