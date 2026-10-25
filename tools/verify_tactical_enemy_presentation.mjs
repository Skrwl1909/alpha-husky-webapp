import assert from "node:assert/strict";import{createServer}from"vite";import{readFileSync}from"node:fs";
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try{const{enemyScene:s}=await server.ssrLoadModule("/tactical-ops-src/ui/enemyAttackPresentation.ts");
const a={id:"h1",team:"enemy",defeated:false,role:"hostile",c:5,r:2},t={id:"alpha",team:"ally",c:2,r:2},d=[{type:"damage",unitId:"alpha",text:"-7"}];
assert.equal(s(a,"hostile-strike",d,[a,t],1).style,"melee");
assert.equal(s({...a,role:"leader"},"leader-crush",d,[a,t],2).style,"heavy");
assert.equal(s(a,"hound-pulse",d,[a,t],3).style,"ranged");
assert.equal(s(a,"hound-interference",d,[a,t],4).style,"jam");
assert.equal(s(a,"hostile-strike",[],[a,t],5),null);
assert.equal(s({...a,team:"ally"},"hostile-strike",d,[a,t],6),null);
const source=readFileSync("tactical-ops-src/store/battleStore.ts","utf8");
assert(source.includes("stageHp(st,events)"));assert(source.includes("await showEnemyScene(scene,g)"));
console.log("PASS confirmed 4-style enemy attacks and VNext HP event sequencing");
}finally{await server.close()}