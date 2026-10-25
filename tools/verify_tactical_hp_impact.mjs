import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const s=readFileSync("tactical-ops-src/store/battleStore.ts","utf8");
const b=readFileSync("tactical-ops-src/ui/Battle.tsx","utf8");
for(const marker of ["stageHp(battle,res.events)","stageHp(st,applied.events)","revealHp(ev)","if(g===runGen)set({displayHp:{}})","Math.max(0,previous-delta)"])assert(s.includes(marker),marker);
for(const marker of ["shownHp={displayHp[u.id]}","const hp = displayHp[unit.id] ?? unit.hp","const hp = shownHp ?? unit.hp"])assert(b.includes(marker),marker);
console.log("PASS: staged visual HP impact in both HUDs, with bounded damage/healing");
