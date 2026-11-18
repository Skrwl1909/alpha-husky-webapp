import assert from "node:assert/strict";
import {createServer} from "vite";
import {mkdirSync,writeFileSync} from "node:fs";
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false}});
try{
 const load=p=>server.ssrLoadModule("/tactical-ops-src/"+p+".ts");
 const [engine,skills,movement,targeting]=await Promise.all(["combat/counterstrikeAuthority","combat/skills","combat/movement","combat/targeting"].map(load));
 const base={runId:"counterstrike_v1_synthetic",missionId:"counterstrike-false-relay",squadIds:["alpha","ally-02","ally-03"],packMastery:{},
  combatProfileV2:{pet:null},combatProfileV3:{version:3,mode:"battle-v1",alpha:{hp:120,atk:28,def:12,spd:14},pet:null},
  rulesContract:{rulesetVersion:"tactical-intent-vnext.0",missionId:"counterstrike-false-relay",missionRevision:1,combatProfileVersion:3,masterySnapshotVersion:1,rewardPolicyVersion:1,source:"BACKEND_SNAPSHOT"},
  counterstrikeContract:{version:1,rulesetVersion:"counterstrike-false-relay.1",missionRevision:1,reinforcementDelay:0,intelStatus:"NONE",intelConsumedByRunId:null}};
 function choose(result,policy){
  const b=result.battle,u=b.units.find(x=>x.id===b.activeId);
  const relay=b.objective.terminal;
  const distance=p=>Math.abs(p.c-relay.c)+Math.abs(p.r-relay.r);
  const hostiles=b.units.filter(x=>x.team==="enemy"&&!x.defeated);
  const ready=skills.availableSkills(b,u).filter(s=>s.ready);
  const wounded=b.units.filter(x=>x.team==="ally"&&!x.defeated&&x.hp<x.maxHp*0.75).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
  for(const s of ready.filter(s=>s.effects.some(e=>e.kind==="heal"))) {
   const ally=wounded.find(w=>targeting.validTargetIds(b.units,u,s).includes(w.id));
   if(ally)return {type:"skill",skillId:s.id,...(s.targetType==="ALLY_SINGLE"?{targetId:ally.id}:{})};
  }
  if(u.defId==="alpha" && (u.hp<60 || hostiles.some(e=>distance(e)<3))) {
   const howl=ready.find(s=>s.slot==="A3");
   if(howl)return {type:"skill",skillId:howl.id};
  }
  const defending=b.units.some(x=>x.team==="ally"&&!x.defeated&&distance(x)===0);
  const occupy=!defending && (policy==="screen" ? u.defId==="ally-03" : u.defId==="alpha" && b.round>=3);
  if(!u.hasMoved){
   const cells=movement.reachableCells(u,b.units).filter(c=>occupy||distance(c)!==0);
   const goal=occupy?relay:hostiles.sort((a,b)=>distance(a)-distance(b))[0]??relay;
   const score=c=> occupy?distance(c):Math.min(...hostiles.map(e=>movement.chebyshev(c,e)))+distance(c)*0.1;
   const best=cells.sort((a,b)=>score(a)-score(b)||distance(a)-distance(b))[0];
   if(best && (occupy ? distance(best)<distance(u) : score(best)<score(u)) && distance(u)!==0)
    return {type:"move",c:best.c,r:best.r};
  }
  const attacks=ready.filter(s=>s.effects.some(e=>e.kind==="damage")).sort((a,b)=>
   (b.effects.find(e=>e.kind==="damage").multiplier??1)-(a.effects.find(e=>e.kind==="damage").multiplier??1));
  for(const s of attacks){
   const ids=targeting.validTargetIds(b.units,u,s);
   const foe=hostiles.filter(e=>ids.includes(e.id)).sort((a,b)=>distance(a)-distance(b)||a.hp-b.hp)[0];
   if(foe)return {type:"skill",skillId:s.id,targetId:foe.id};
  }
  return {type:"skip"};
 }
 const rows=[];
 for(const high of [false,true])for(const intel of [false,true])for(const policy of ["screen","disrupt"]){
  const run=structuredClone(base);
  if(high)run.combatProfileV3.alpha={hp:189,atk:45,def:30,spd:19};
  if(intel)Object.assign(run.counterstrikeContract,{reinforcementDelay:1,intelStatus:"APPLIED",intelConsumedByRunId:run.runId});
  let result=engine.stepCounterstrike(run),commands=[],holders=new Set();
  for(let i=0;i<250&&!result.terminal;i++){
   const cmd=choose(result,policy);
   const next=engine.stepCounterstrike(run,JSON.parse(JSON.stringify(result.snapshot)),cmd);
   assert(next,"legal command "+JSON.stringify(cmd));
   commands.push(cmd);result=next;
   for(const u of result.battle.units)if(u.team==="ally"&&!u.defeated&&u.c===result.battle.objective.terminal.c&&u.r===result.battle.objective.terminal.r)holders.add(u.defId);
  }
  rows.push({high,intel,policy,outcome:result.battle.outcome,rounds:result.battle.round,holders:[...holders],commands:commands.length,entered:result.snapshot.entered,control:result.battle.objective.progress});
  mkdirSync("artifacts/counterstrike",{recursive:true});
  writeFileSync("artifacts/counterstrike/"+(high?"high":"new")+"-"+(intel?"intel":"baseline")+"-"+policy+".json",JSON.stringify({run,commands,result}));
 }
 writeFileSync("artifacts/counterstrike/combat-results.json",JSON.stringify(rows,null,2));
 console.log(rows);
 assert(rows.filter(r=>r.policy==="screen").every(r=>r.holders.includes("ally-03")) && rows.filter(r=>r.policy==="disrupt").every(r=>r.holders.includes("alpha")),"different policies establish different relay holders");
 assert(rows.every(r=>r.outcome==="victory"),"both strategies must complete the encounter");
 assert(rows.every(r=>r.rounds>=6&&r.entered>=1),"clearing the initial patrol cannot bypass control checkpoints");
}finally{await server.close();}
