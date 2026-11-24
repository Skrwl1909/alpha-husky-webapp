import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync,writeFileSync,mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { createServer } from "vite";
const [input,oldPath]=process.argv.slice(2);
assert(input&&oldPath,"usage: input.json pinned-worker.cjs");
const old=resolve(oldPath),candidate=resolve("artifacts/commander-power-authority/commander_power_authority_lab.cjs");
const hash=p=>createHash("sha256").update(readFileSync(p)).digest("hex");
assert.equal(hash(old),"45f1e6c2151fd3b2df7a70dc8567f313976773890ecf3debd98830aa910beb73");
const data=JSON.parse(readFileSync(input,"utf8"));
assert.equal(data.schema,"commander-power-authority-lab.v1");
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
const rows=[],checks=[];
function invoke(worker,encounter,snapshot=null,command=null,expectError=false){
  const x=spawnSync(process.execPath,[worker],{input:JSON.stringify({encounter,snapshot,command}),encoding:"utf8",timeout:5000,maxBuffer:8*1024*1024});
  if(expectError){assert.notEqual(x.status,0,"malformed input unexpectedly accepted");return;}
  assert.equal(x.status,0,x.stderr||String(x.error));
  return JSON.parse(x.stdout);
}
const saved=(r,lab)=>({battle:r.battle,cycle:r.cycle,statusSequence:r.statusSequence,...(lab?{projectionId:r.projectionId}:{})});
const gameplay=r=>({battle:r.battle,cycle:r.cycle,statusSequence:r.statusSequence,report:r.report});
function check(name,fn){try{fn();checks.push({name,pass:true});}catch(e){checks.push({name,pass:false,error:String(e.message).slice(0,600)});}}
try{
  const [types,move,skills,target]=await Promise.all(["types","movement","skills","targeting"].map(n=>vite.ssrLoadModule("/tactical-ops-src/combat/"+n+".ts")));
  types.selectAcceptedBattleRules({rulesetVersion:"tactical-intent-vnext.0"});
  function choose(state,policy){
    const actor=state.units.find(u=>u.id===state.activeId);
    assert(actor?.team==="ally"&&!actor.defeated);
    if(policy==="passive")return {type:"skip"};
    const enemies=state.units.filter(u=>u.team==="enemy"&&!u.defeated);
    const preferred=enemies.find(u=>u.id===state.objective.targetId)||enemies[0];
    const ready=skills.availableSkills(state,actor).filter(s=>s.ready&&s.effects.some(e=>e.kind==="damage")&&["ENEMY_SINGLE","AREA_RADIUS","ENEMY_AOE"].includes(s.targetType)).sort((a,b)=>(b.effects.find(e=>e.kind==="damage")?.multiplier||0)-(a.effects.find(e=>e.kind==="damage")?.multiplier||0));
    for(const s of ready){
      const ids=target.validTargetIds(state.units,actor,s);
      if(!ids.length)continue;
      if(s.targetType==="ENEMY_AOE"){
        if(target.resolveSkillTargets(state.units,actor,s).length)return {type:"skill",skillId:s.id};
        continue;
      }
      const id=ids.includes(preferred?.id)?preferred.id:ids.sort((a,b)=>state.units.find(u=>u.id===a).hp-state.units.find(u=>u.id===b).hp)[0];
      return {type:"skill",skillId:s.id,targetId:id};
    }
    if(!actor.hasMoved&&preferred){
      const distance=p=>move.chebyshev(p,preferred);
      const spots=move.reachableCells(actor,state.units).filter(p=>distance(p)<distance(actor)).sort((a,b)=>distance(a)-distance(b)||a.c-b.c||a.r-b.r);
      if(spots.length)return {type:"move",c:spots[0].c,r:spots[0].r};
    }
    return {type:"skip"};
  }
  for(const f of data.fixtures){
    const e={...f.encounter,powerProjection:f.projection};
    const init=invoke(candidate,e);
    check(f.name+" initial profile",()=>{const a=init.battle.units.find(u=>u.id==="alpha");assert.deepEqual({hp:a.maxHp,atk:a.atk,def:a.def,spd:a.spd},f.projection.alpha);assert.equal(a.gearImpactV31,undefined);});
    check(f.name+" invalid skill rejected",()=>assert.equal(invoke(candidate,e,saved(init,true),{type:"skill",skillId:"not-a-skill"}),null));
    check(f.name+" mismatched projection rejected",()=>invoke(candidate,e,{...saved(init,true),projectionId:"0".repeat(64)},{type:"skip"},true));
    for(const policy of f.name==="fresh"?["tempo","passive"]:["tempo"]){
      let r=init,commands=0;
      while(r.battle.outcome==="ongoing"&&commands<240){
        const cmd=choose(r.battle,policy),snapshot=saved(r,true);
        const next=invoke(candidate,e,snapshot,cmd);
        assert(next,f.name+" rejected legal scripted command "+JSON.stringify(cmd));
        if(commands===0)check(f.name+"/"+policy+" deterministic resume",()=>assert.deepEqual(invoke(candidate,e,snapshot,cmd),next));
        r=next;commands++;
      }
      rows.push({build:f.name,policy,outcome:r.battle.outcome,commands,turns:r.battle.unitTurn,report:r.report,damage:r.battle.damageTaken});
      check(f.name+"/"+policy+" terminal",()=>{assert.equal(r.battle.outcome,policy==="passive"?"defeat":"victory");assert.equal(r.report.victory,r.battle.outcome==="victory");assert.equal(r.report.turns,r.battle.results.turns);if(r.report.victory)assert(r.battle.units.find(u=>u.id==="leader").defeated);assert.equal(invoke(candidate,e,saved(r,true),{type:"skip"}),null);});
    }
  }
  // Compare the shipped worker against the new source with the same V3
  // profile, same frozen sidegrades, and identical legal commands.
  const f=data.fixtures.find(x=>x.name==="fresh");
  const legacy=f.encounter,control={...legacy,powerProjection:null};
  let a=invoke(old,legacy),b=invoke(candidate,control),commands=0;
  try{
    assert.deepEqual(gameplay(b),gameplay(a));
    while(a.battle.outcome==="ongoing"&&commands<120){
      const cmd=choose(a.battle,"tempo");
      a=invoke(old,legacy,saved(a,false),cmd);
      b=invoke(candidate,control,saved(b,true),cmd);
      assert(a&&b);
      commands++;
      assert.deepEqual(gameplay(b),gameplay(a));
    }
    assert.equal(a.battle.outcome,"victory");
    checks.push({name:"pinned legacy full trajectory parity",pass:true,commands});
  }catch(e){checks.push({name:"pinned legacy full trajectory parity",pass:false,commands,error:String(e.message).slice(0,900)});}
}finally{
  await vite.close();
  mkdirSync("artifacts/commander-power-authority",{recursive:true});
  const report={schema:"commander-power-authority-evidence.v1",candidateSha256:hash(candidate),legacySha256:hash(old),rows,checks};
  writeFileSync("artifacts/commander-power-authority/report.json",JSON.stringify(report,null,2));
  console.table(rows);console.table(checks.map(({name,pass,commands})=>({name,pass,commands})));
}
assert.equal(rows.length,4);
assert(checks.every(c=>c.pass),"HOLD: see report.json; no production activation");
console.log("COMMANDER WORKER LAB PASS — no production readiness claim");
