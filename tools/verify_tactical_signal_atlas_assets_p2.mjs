#!/usr/bin/env node
/** Visual-only P2 asset integrity and scope gate. Does not mutate game state. */
import assert from "node:assert/strict";
import { readFileSync, statSync, existsSync } from "node:fs";
const ROOT="images/tactical_ops/signal_atlas/v1/";
const runtime=[
 ["environments/atlas_relay_chamber.webp",250*1024],
 ["environments/sector_signal_bay.webp",180*1024],
 ["core/relay_core_bezel.webp",90*1024],
 ...["assault","command","pursuit","control","front_line","support"].map(s=>["sectors/emblem_"+s+".webp",35*1024])
];
for(const [name,max] of runtime){
 const path=ROOT+name;assert(existsSync(path),"Asset missing: "+path);
 const data=readFileSync(path); assert.equal(data.toString("ascii",0,4),"RIFF",path);
 assert.equal(data.toString("ascii",8,12),"WEBP",path);
 assert(statSync(path).size<=max,"Asset size budget: "+path);
}
for(const name of ["sector_plate","skill_node_bezel","skill_inspector_frame"]){
 const p=ROOT+"frames/"+name+".svg";assert(existsSync(p)); const s=readFileSync(p,"utf8");
 assert(s.includes("<svg") && !/<text\b/i.test(s),"SVG frame must not bake text: "+p);
}
for(const name of ["assault","command","pursuit","control","front_line","support"]){
 const p=ROOT+"sectors/emblem_"+name+".svg";assert(existsSync(p));const s=readFileSync(p,"utf8");
 assert(s.includes('viewBox="0 0 512 512"') && !/<text\b/i.test(s),"Crest master invalid: "+p);
}
assert(existsSync(ROOT+"trim/signal_contact.svg"));
const ui=readFileSync("tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx","utf8");
const model=readFileSync("tactical-ops-src/ui/signalAtlas/model.ts","utf8");
const css=readFileSync("tactical-ops-src/ui/signalAtlas/signalAtlas.css","utf8");
const classic=readFileSync("tactical-ops-src/ui/Skillbook.tsx","utf8");
assert(model.includes("emblemSrc: string") && ui.includes("src={s.emblemSrc}"),"Crest runtime mapping");
for(const key of ["assault","command","pursuit","control","line","support"]) assert(model.includes("SIGNAL_ATLAS_SECTOR_EMBLEMS."+key),"Missing live mapping: "+key);
assert(css.includes("atlas_relay_chamber.webp") && css.includes("P2 FROZEN RELAY ASSET INTEGRATION"),"Atlas background skin");
assert(ui.includes("await upgrade(") && ui.includes("await respec("),"Canonical store transactions required");
assert(classic.includes('<SignalAtlas onClose={onClose} />') && !classic.includes("BetaAllowed"),"Official Atlas entry requires no beta gate");
console.log("PASS Signal Atlas P2: 19 runtime assets, art mapping, crest fallback, official entry (device QA separate)");
