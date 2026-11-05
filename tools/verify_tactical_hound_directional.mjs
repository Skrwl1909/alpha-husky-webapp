#!/usr/bin/env node
/** HOUND V1 art is purely representational. Validate the real image bytes and
 * the actual TypeScript mapping without writing a player/account/mission. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {stripTypeScriptTypes} from "node:module";
const root=resolve(import.meta.dirname,"..");
const archetypes=["bulwark","marksman","disruptor","skirmisher","courier"];
const facings=["front","back","left","right"];
const artRoot=resolve(root,"images/tactical_ops/hounds");
const ts=readFileSync(resolve(root,"tactical-ops-src/ui/houndDirectional.ts"),"utf8")
  .replace(/^import type .*;\r?\n/gm,"");
const js=stripTypeScriptTypes(ts);
const mod=await import("data:text/javascript;base64,"+Buffer.from(js).toString("base64"));
assert.equal(mod.HOUND_VISUAL_ARCHETYPES.length,5);
for(const name of archetypes){
  const unit={team:"enemy",role:"hostile",archetype:name.toUpperCase()};
  for(const facing of facings){
    const file=`hound_${name}_${facing}.webp`;
    const path=resolve(artRoot,file);
    const data=readFileSync(path);
    assert.ok(data.length>10000,`Missing HOUND asset ${file}`);
    assert.equal(data.toString("ascii",0,4),"RIFF");
    assert.equal(data.toString("ascii",8,12),"WEBP");
    assert.equal(mod.houndView(unit,facing),"/images/tactical_ops/hounds/"+file);
  }
}
for(const unit of [
 {team:"ally",role:"hostile",archetype:"BULWARK"},
 {team:"enemy",role:"leader",archetype:"COMMANDER"},
 {team:"enemy",role:"hostile",archetype:undefined},
]){
 assert.equal(mod.houndView(unit,"front"),null,"legacy/leader/ally must retain original sprite");
}
const battle=readFileSync(resolve(root,"tactical-ops-src/ui/Battle.tsx"),"utf8");
const styles=readFileSync(resolve(root,"tactical-ops-src/styles.ts"),"utf8");
assert.match(battle,/const directionalHound = !!houndView\(unit, "front"\)/);
assert.match(battle,/houndView\(unit, facing\)/);
assert.match(battle,/houndView\(actor,facingToward\(enemyScene\.from,enemyScene\.to,"front"\)\)/);
assert.match(battle,/houndView\(performer,facingToward\(effect\.from,receiver,"front"\)\)/);
assert.match(styles,/HOUND_DIRECTIONAL_CSS/);
const css=readFileSync(resolve(root,"tactical-ops-src/ui/houndDirectional.css"),"utf8");
assert(!/pointer-events:\s*auto/.test(css));
console.log("PASS 20 authored HOUND WebPs, five archetypes, four facings, commander/legacy fallback and integrated battle art");
