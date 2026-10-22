import assert from "node:assert/strict";
globalThis.window={location:{search:"?tacticalBattlefieldVNext=1"},localStorage:{getItem:()=>null}};
const {createServer}=await import("vite");
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const [ai,battle,ops,move]=await Promise.all(["/tactical-ops-src/combat/ai.ts","/tactical-ops-src/combat/battle.ts","/tactical-ops-src/data/operations.ts","/tactical-ops-src/combat/movement.ts"].map(v=>vite.ssrLoadModule(v)));
 let checked=0;
 for(const id of ["field-relay-hold","field-isolated-hold","dead-relay-hold"]){
  const m=ops.MISSION_DEFS[id], rules=ops.missionBattleRules(m);
  const spawns=[{id:"alpha",defId:"alpha",c:1,r:2},{id:"ally-02",defId:"ally-02",c:1,r:1},{id:"ally-03",defId:"ally-03",c:1,r:4},...(m.spawns||[])];
  const state=battle.createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
  for(const u of state.units.filter(u=>u.team==="enemy"&&u.archetype!=="MARKSMAN")){
   const probe={...state,activeId:u.id,units:state.units.map(x=>x.id===u.id?{...x,hasMoved:false,hasActed:false}:x)};
   const action=ai.objectiveAwareEnemyAction(probe);
   if(action){
    assert.equal(action.type,"move");assert(ai.aiUsesLegalRules(probe,action),id+": illegal objective move");
    const d=p=>Math.abs(p.c-probe.objective.terminal.c)+Math.abs(p.r-probe.objective.terminal.r);
    assert(d(action.to)<d(u),id+": move must threaten relay");
    checked++;
   }
  }
 }
 assert(checked>0,"need actual objective contest move, not just code coverage");
 // No relay pursuit logic for non-HOLD missions.
 const other=ops.MISSION_DEFS["field-squad-survival"];
 const base=battle.createBattle(null,[{id:"alpha",defId:"alpha",c:1,r:2},{id:"h1",defId:"hostile",c:5,r:2}],ops.missionBattleRules(other).objective);
 assert.equal(ai.objectiveAwareEnemyAction({...base,activeId:"h1"}),null);
 // Every authored mission uses a consistent engine action policy with no illegal movement or skill.
 for(const m of Object.values(ops.MISSION_DEFS)){
  const rules=ops.missionBattleRules(m);
  const spawns=(m.spawns||[]).some(x=>x.defId==="alpha") ? m.spawns : [
   {id:"alpha",defId:"alpha",c:1,r:2},
   {id:"ally-02",defId:"ally-02",c:1,r:1},
   ...(m.squadCap===3?[{id:"ally-03",defId:"ally-03",c:1,r:4}]:[]),
   ...(m.spawns||[])];
  const snap=battle.createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
  for(const enemy of snap.units.filter(u=>u.team==="enemy")){
   const probe={...snap,activeId:enemy.id};
   const action=ai.chooseAiAction(probe);
   assert(ai.aiUsesLegalRules(probe,action),m.missionId+": illegal AI action "+JSON.stringify(action));
  }
 }
 // A holder must matter more than an equally healthy non-holder.
 const inZone={id:"alpha",team:"ally",role:"alpha",c:3,r:2,hp:100,maxHp:100,atk:20,statuses:[]};
 const outside={...inZone,id:"ally-02",role:"ranged",c:0,r:0};
 const holderState={...base,objective:{type:"HOLD",terminal:{c:3,r:2},radius:1,duration:3,progress:0,checkedRound:1}};
 assert(ai.objectiveTargetScore(holderState,base.units[1],inZone)>ai.objectiveTargetScore(holderState,base.units[1],outside),"objective holder targeted first");
 console.log("PASS S2 shared 12 mission objective targeting, legal enemy plans, HOLD/RECOVER pressure",checked);
}finally{await vite.close();}
